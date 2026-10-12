import asyncio
import html
import logging
import os
import re
import time
from datetime import datetime, timezone

import httpx
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.switchyard import FxRate, FxRatesResponse, MarketCandle, MarketOverviewResponse, MarketQuote, MarketTickerQuote, MarketTickerResponse, SubmissionCreate, SubmissionResponse


router = APIRouter()
logger = logging.getLogger(__name__)

FALLBACK_RATES = {
    "USD": (0.6512, 0.48),
    "EUR": (0.6018, -0.27),
    "GBP": (0.5129, 0.92),
}
TWELVE_DATA_URL = "https://api.twelvedata.com"
RESEND_URL = "https://api.resend.com/emails"
SUBMISSION_LABELS = {"contact": "Contact enquiry", "newsletter": "Newsletter sign-up", "hedge-guide": "Hedge Policy Guide request"}
MARKET_SYMBOLS = ("AUD/USD", "AUD/EUR", "AUD/GBP")
# The home-page ticker board. Twelve Data charges 1 credit per symbol; the free Basic plan
# allows 8 credits/minute and 800/day. Rather than spend a credit on every pair shown, the
# ticker fetches eight USD "legs" once per TICKER_CACHE_SECONDS (900s = 15 min, so
# 8 × 96 = 768 credits/day) and calculates every cross between them (AUD/EUR = AUD/USD ÷
# EUR/USD), so one 8-credit fetch fills a 24-pair board. On a paid plan, add legs to
# TWELVE_DATA_TICKER_SYMBOLS (e.g. "USD/SGD,USD/HKD") and the AUD crosses for them appear
# automatically; lower TWELVE_DATA_TICKER_TTL_SECONDS to refresh more often. Symbols are
# "BASE/QUOTE"; a symbol without USD is shown as fetched but is not used for crosses.
DEFAULT_TICKER_SYMBOLS = ("AUD/USD", "EUR/USD", "GBP/USD", "NZD/USD", "USD/JPY", "USD/CAD", "USD/CHF", "USD/CNY")
# Crosses shown after the AUD pairs and the USD majors, whenever both legs are available.
TICKER_EXTRA_CROSSES = ("EUR/GBP", "EUR/JPY", "GBP/JPY", "EUR/CHF", "EUR/CAD", "GBP/CHF", "NZD/JPY", "CAD/JPY", "CHF/JPY")
# Indicative-only legs (rate, % change) for the fallback board. These are never presented as
# live — the response carries source="fallback" and a warning whenever they are used.
TICKER_FALLBACK = {
    "AUD/USD": (0.6512, 0.48),
    "EUR/USD": (1.0821, 0.75),
    "GBP/USD": (1.2696, -0.44),
    "NZD/USD": (0.6006, 0.60),
    "USD/JPY": (151.14, -0.13),
    "USD/CAD": (1.3736, -0.27),
    "USD/CHF": (0.8773, -0.66),
    "USD/CNY": (7.2359, -0.39),
}


def _ticker_symbols() -> tuple[str, ...]:
    # Tolerate stray quotes, spaces and newlines from a pasted value; anything that is not a
    # "ABC/XYZ" pair is dropped, and with no valid pair left the defaults are used.
    raw = os.environ.get("TWELVE_DATA_TICKER_SYMBOLS", "")
    codes = (code.strip().strip("'\"").strip().upper() for code in re.split(r"[,\s]+", raw))
    symbols = tuple(dict.fromkeys(code for code in codes if re.fullmatch(r"[A-Z]{3}/[A-Z]{3}", code)))
    if raw.strip() and not symbols:
        logger.warning("TWELVE_DATA_TICKER_SYMBOLS has no valid BASE/QUOTE pairs; using the defaults")
    return symbols or DEFAULT_TICKER_SYMBOLS


TICKER_SYMBOLS = _ticker_symbols()
TICKER_CACHE_SECONDS = max(60, int(os.environ.get("TWELVE_DATA_TICKER_TTL_SECONDS", "900") or "900"))
# A cached live snapshot older than this reads as "delayed" rather than real time.
LIVE_FRESH_SECONDS = 60
FALLBACK_CANDLES = [
    0.6504, 0.6508, 0.6502, 0.6511, 0.6515, 0.6509, 0.6518, 0.6522,
    0.6517, 0.6525, 0.6521, 0.6516, 0.6528, 0.6531, 0.6526, 0.6534,
    0.6530, 0.6524, 0.6519, 0.6527, 0.6535, 0.6532, 0.6528, 0.6538,
    0.6541, 0.6536, 0.6544, 0.6540, 0.6547, 0.6543, 0.6549, 0.6552,
]
# Twelve Data's free plan allows 800 credits/day and each refresh costs 4 (3 quotes + 1
# series), so live data is reused for 10 minutes (≤576 credits/day per warm instance).
# Fallbacks expire sooner so live prices return quickly after an outage or rate limit.
LIVE_CACHE_SECONDS = 600
FALLBACK_CACHE_SECONDS = 60
_market_cache: tuple[float, MarketOverviewResponse] | None = None
_ticker_cache: tuple[float, MarketTickerResponse] | None = None
# Serialises ticker refreshes so concurrent requests can't spend the thin credit budget twice.
_ticker_lock = asyncio.Lock()


def _fallback_market(warning: str) -> MarketOverviewResponse:
    now = datetime.now(timezone.utc)
    quotes = [
        MarketQuote(pair=f"AUD/{quote}", rate=rate, change=change)
        for quote, (rate, change) in FALLBACK_RATES.items()
    ]
    candles = [
        MarketCandle(timestamp=f"{index * 15:04d}", close=value)
        for index, value in enumerate(FALLBACK_CANDLES)
    ]
    return MarketOverviewResponse(
        source="fallback",
        provider="Indicative fallback",
        as_of=now.isoformat(),
        quotes=quotes,
        candles=candles,
        warning=warning,
    )


def _parse_quote_payload(payload: dict) -> list[MarketQuote]:
    quotes: list[MarketQuote] = []
    for symbol in MARKET_SYMBOLS:
        row = payload.get(symbol)
        if not isinstance(row, dict):
            continue
        price = row.get("close") or row.get("price")
        percent_change = row.get("percent_change") or row.get("change") or 0
        if price is not None:
            quotes.append(MarketQuote(pair=symbol, rate=float(price), change=float(percent_change)))
    return quotes


def _to_float(value: object) -> float | None:
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _fallback_ticker(warning: str) -> MarketTickerResponse:
    now = datetime.now(timezone.utc)
    # Always the full indicative board, whatever symbols are configured, so the strip is never empty.
    legs = [MarketTickerQuote(pair=pair, rate=rate, change=change) for pair, (rate, change) in TICKER_FALLBACK.items()]
    return MarketTickerResponse(
        source="fallback",
        provider="Indicative fallback",
        as_of=now.isoformat(),
        quotes=_build_ticker_board(legs),
        delayed=True,
        refresh_seconds=TICKER_CACHE_SECONDS,
        warning=warning,
    )


def _parse_ticker_payload(payload: dict) -> list[MarketTickerQuote]:
    """The fetched legs, in TICKER_SYMBOLS order. Rows without a price are skipped."""
    quotes: list[MarketTickerQuote] = []
    for symbol in TICKER_SYMBOLS:
        row = payload.get(symbol)
        if not isinstance(row, dict):
            continue
        price = row.get("close") or row.get("price")
        if price is None:
            continue
        percent_change = row.get("percent_change")
        if percent_change is None:
            percent_change = row.get("change") or 0
        quotes.append(
            MarketTickerQuote(
                pair=symbol,
                rate=float(price),
                change=float(percent_change),
                open=_to_float(row.get("open")),
                high=_to_float(row.get("high")),
                low=_to_float(row.get("low")),
            )
        )
    return quotes


def _build_ticker_board(legs: list[MarketTickerQuote]) -> list[MarketTickerQuote]:
    """Turn the fetched legs into the displayed board: AUD crosses first, then the legs as
    fetched (the USD majors), then TICKER_EXTRA_CROSSES. A calculated cross is marked
    derived and carries no open/high/low, since those cannot be combined from two legs."""
    # USD value of one unit of each currency, now and at the previous close.
    usd_now: dict[str, float] = {"USD": 1.0}
    usd_prev: dict[str, float] = {"USD": 1.0}
    for leg in legs:
        base, _, quote = leg.pair.partition("/")
        if leg.rate <= 0 or "USD" not in (base, quote) or base == quote:
            continue
        previous = leg.rate / (1 + leg.change / 100) if leg.change > -100 else leg.rate
        if quote == "USD":
            usd_now[base], usd_prev[base] = leg.rate, previous
        else:
            usd_now[quote], usd_prev[quote] = 1 / leg.rate, 1 / previous

    board: dict[str, MarketTickerQuote] = {}

    def add_cross(base: str, quote: str) -> None:
        pair = f"{base}/{quote}"
        if pair in board or base == quote or base not in usd_now or quote not in usd_now:
            return
        rate = usd_now[base] / usd_now[quote]
        previous = usd_prev[base] / usd_prev[quote]
        board[pair] = MarketTickerQuote(pair=pair, rate=round(rate, 6), change=round((rate / previous - 1) * 100, 2), derived=True)

    fetched = {leg.pair: leg for leg in legs}
    for currency in usd_now:
        if currency != "AUD":
            if f"AUD/{currency}" in fetched:
                board[f"AUD/{currency}"] = fetched[f"AUD/{currency}"]
            else:
                add_cross("AUD", currency)
    for leg in legs:
        board.setdefault(leg.pair, leg)
    for pair in TICKER_EXTRA_CROSSES:
        base, _, quote = pair.partition("/")
        add_cross(base, quote)
    return list(board.values())


def _serve_ticker(cached_at: float, cached: MarketTickerResponse) -> MarketTickerResponse:
    """Mark a cached live snapshot as delayed once it is older than the fresh window."""
    if cached.source != "live" or time.monotonic() - cached_at <= LIVE_FRESH_SECONDS:
        return cached
    return cached.model_copy(update={"delayed": True})


@router.get("/market/overview", response_model=MarketOverviewResponse)
async def get_market_overview():
    global _market_cache
    now_monotonic = time.monotonic()
    if _market_cache:
        cached_at, cached = _market_cache
        ttl = LIVE_CACHE_SECONDS if cached.source == "live" else FALLBACK_CACHE_SECONDS
        if now_monotonic - cached_at < ttl:
            return cached

    api_key = os.environ.get("TWELVE_DATA_API_KEY", "").strip()
    if not api_key:
        result = _fallback_market("Live market key is not configured; showing indicative values.")
        _market_cache = (now_monotonic, result)
        return result

    try:
        async with httpx.AsyncClient(timeout=8.0) as http:
            quote_response, chart_response = await asyncio.gather(
                http.get(
                    f"{TWELVE_DATA_URL}/quote",
                    params={"symbol": ",".join(MARKET_SYMBOLS), "dp": 6, "apikey": api_key},
                ),
                http.get(
                    f"{TWELVE_DATA_URL}/time_series",
                    params={"symbol": "AUD/USD", "interval": "15min", "outputsize": 32, "order": "ASC", "timezone": "UTC", "apikey": api_key},
                ),
            )
        if quote_response.status_code == 429 or chart_response.status_code == 429:
            result = _fallback_market("Twelve Data rate limit reached; showing indicative values.")
        else:
            quote_response.raise_for_status()
            chart_response.raise_for_status()
            quote_payload = quote_response.json()
            chart_payload = chart_response.json()
            if quote_payload.get("status") == "error" or chart_payload.get("status") == "error":
                raise ValueError("provider returned an error response")
            quotes = _parse_quote_payload(quote_payload)
            candles = [
                MarketCandle(timestamp=str(row["datetime"]), close=float(row["close"]))
                for row in chart_payload.get("values", [])
                if isinstance(row, dict) and row.get("datetime") and row.get("close")
            ]
            if len(quotes) != len(MARKET_SYMBOLS) or len(candles) < 4:
                raise ValueError("provider response was incomplete")
            result = MarketOverviewResponse(
                source="live",
                provider="Twelve Data",
                as_of=datetime.now(timezone.utc).isoformat(),
                quotes=quotes,
                candles=candles,
            )
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.info("Twelve Data unavailable; using indicative market fallback (%s)", type(exc).__name__)
        result = _fallback_market("Live market data is temporarily unavailable; showing indicative values.")

    _market_cache = (now_monotonic, result)
    return result


@router.get("/market/ticker", response_model=MarketTickerResponse)
async def get_market_ticker():
    global _ticker_cache
    now_monotonic = time.monotonic()
    if _ticker_cache:
        cached_at, cached = _ticker_cache
        ttl = TICKER_CACHE_SECONDS if cached.source == "live" else FALLBACK_CACHE_SECONDS
        if now_monotonic - cached_at < ttl:
            return _serve_ticker(cached_at, cached)

    async with _ticker_lock:
        # Another request may have refreshed the snapshot while we waited for the lock.
        now_monotonic = time.monotonic()
        if _ticker_cache:
            cached_at, cached = _ticker_cache
            ttl = TICKER_CACHE_SECONDS if cached.source == "live" else FALLBACK_CACHE_SECONDS
            if now_monotonic - cached_at < ttl:
                return _serve_ticker(cached_at, cached)

        api_key = os.environ.get("TWELVE_DATA_API_KEY", "").strip()
        if not api_key:
            result = _fallback_ticker("Live market key is not configured; showing indicative values.")
        else:
            try:
                async with httpx.AsyncClient(timeout=8.0) as http:
                    response = await http.get(
                        f"{TWELVE_DATA_URL}/quote",
                        params={"symbol": ",".join(TICKER_SYMBOLS), "dp": 6, "apikey": api_key},
                    )
                if response.status_code == 429:
                    result = _fallback_ticker("Twelve Data rate limit reached; showing indicative values.")
                else:
                    response.raise_for_status()
                    payload = response.json()
                    if isinstance(payload, dict) and payload.get("status") == "error":
                        raise ValueError("provider returned an error response")
                    # A single-symbol request returns the quote object directly; a batch is keyed by symbol.
                    if isinstance(payload, dict) and payload.get("symbol") and "close" in payload:
                        payload = {str(payload["symbol"]): payload}
                    quotes = _build_ticker_board(_parse_ticker_payload(payload if isinstance(payload, dict) else {}))
                    if len(quotes) < 2:
                        raise ValueError("provider response was incomplete")
                    result = MarketTickerResponse(
                        source="live",
                        provider="Twelve Data",
                        as_of=datetime.now(timezone.utc).isoformat(),
                        quotes=quotes,
                        delayed=False,
                        refresh_seconds=TICKER_CACHE_SECONDS,
                    )
            except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
                logger.info("Twelve Data ticker unavailable; using indicative fallback (%s)", type(exc).__name__)
                result = _fallback_ticker("Live market data is temporarily unavailable; showing indicative values.")

        _ticker_cache = (time.monotonic(), result)
        return _serve_ticker(_ticker_cache[0], result)


@router.get("/fx/rates", response_model=FxRatesResponse)
async def get_fx_rates(
    base: str = Query(default="AUD", min_length=3, max_length=3),
    quotes: str = Query(default="USD,EUR,GBP"),
):
    base = base.upper()
    quote_codes = [code.strip().upper() for code in quotes.split(",") if code.strip()]
    quote_codes = list(dict.fromkeys(quote_codes))[:8]
    if not quote_codes:
        raise HTTPException(status_code=422, detail="At least one quote currency is required")

    live_rates: dict[str, float] = {}
    as_of = datetime.now(timezone.utc).date().isoformat()
    try:
        async with httpx.AsyncClient(timeout=3.0) as http:
            response = await http.get(
                "https://api.frankfurter.dev/v2/rates",
                params={"base": base, "quotes": ",".join(quote_codes)},
            )
            response.raise_for_status()
            payload = response.json()
        rows = payload if isinstance(payload, list) else payload.get("rates", [])
        for row in rows:
            if isinstance(row, dict) and row.get("quote") and row.get("rate"):
                live_rates[str(row["quote"]).upper()] = float(row["rate"])
                as_of = str(row.get("date", as_of))
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.info("Frankfurter unavailable, using indicative rates: %s", exc)

    rates = []
    for quote in quote_codes:
        fallback_rate, change = FALLBACK_RATES.get(quote, (1.0, 0.0))
        rates.append(
            FxRate(
                pair=f"{base}/{quote}",
                rate=live_rates.get(quote, fallback_rate),
                change=change,
                source="live" if quote in live_rates else "fallback",
            )
        )
    return FxRatesResponse(base=base, as_of=as_of, rates=rates)


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
async def create_submission(input: SubmissionCreate):
    if not input.consent:
        raise HTTPException(status_code=400, detail="Consent is required")
    received_at = datetime.now(timezone.utc)
    if input.company_url:
        # Honeypot tripped: answer like a normal success so the bot doesn't adapt,
        # but store nothing and send no email.
        logger.info("Dropped %s submission that filled the honeypot field", input.kind)
        return SubmissionResponse(ok=True, id=str(ObjectId()), received_at=received_at)
    doc = input.model_dump(exclude={"company_url"})
    doc["email"] = str(input.email).lower()
    doc["received_at"] = received_at
    result = await db.submissions.insert_one(doc)
    await _notify_submission(input, doc["email"], received_at)
    return SubmissionResponse(ok=True, id=str(result.inserted_id), received_at=received_at)


async def _notify_submission(input: SubmissionCreate, email: str, received_at: datetime) -> None:
    """Email the team about a new lead via Resend. The lead is already stored, so a
    missing config or a failed send is logged and never fails the request."""
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    recipients = [addr.strip() for addr in os.environ.get("NOTIFY_EMAIL_TO", "").split(",") if addr.strip()]
    if not api_key or not recipients:
        return
    sender = os.environ.get("NOTIFY_EMAIL_FROM", "").strip() or "SwitchYard FX <onboarding@resend.dev>"
    label = SUBMISSION_LABELS.get(input.kind, input.kind)
    fields = [
        ("Type", label),
        ("Name", input.name),
        ("Email", email),
        ("Company", input.company),
        ("Phone", input.phone),
        ("Role", input.role),
        ("Annual FX volume", input.annual_fx_volume),
        ("Newsletter cadence", input.cadence),
        ("Message", input.message),
        ("Language", input.locale),
        ("Received", received_at.strftime("%d %b %Y, %H:%M UTC")),
    ]
    rows = [(name, str(value)) for name, value in fields if value]
    text = "\n".join(f"{name}: {value}" for name, value in rows)
    table = "".join(
        f'<tr><td style="padding:6px 12px;color:#4A5A55;vertical-align:top"><b>{html.escape(name)}</b></td>'
        f'<td style="padding:6px 12px;white-space:pre-wrap">{html.escape(value)}</td></tr>'
        for name, value in rows
    )
    payload = {
        "from": sender,
        "to": recipients,
        "reply_to": email,
        "subject": f"New {label.lower()}: {input.name or email}",
        "text": text,
        "html": f'<h2 style="color:#12261F">New {html.escape(label.lower())}</h2><table>{table}</table>',
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as http:
            response = await http.post(RESEND_URL, json=payload, headers={"Authorization": f"Bearer {api_key}"})
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.warning("Lead notification email rejected by Resend (%s): %s", exc.response.status_code, exc.response.text[:300])
    except httpx.HTTPError as exc:
        logger.warning("Lead notification email failed (%s)", type(exc).__name__)