"""Backend coverage for the home-page FX ticker
(endpoint: GET /market/ticker — 24-pair board calculated from eight USD legs, quota-aware
caching, honest liveness).

The ticker runs against the live uvicorn process, so the response may legitimately be
served from Twelve Data (source="live", delayed=False, no warning) or the labelled
indicative fallback (source="fallback", delayed=True, warning present). Tests assert the
exact contract the frontend ticker renders for BOTH cases rather than pinning one.
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from routers.switchyard import (  # noqa: E402
    DEFAULT_TICKER_SYMBOLS,
    TICKER_EXTRA_CROSSES,
    TICKER_FALLBACK,
    _build_ticker_board,
    _fallback_ticker,
    _parse_ticker_payload,
)
from models.switchyard import MarketTickerQuote  # noqa: E402


def test_ticker_endpoint_contract(client):
    response = client.get("/market/ticker")
    assert response.status_code == 200, response.text
    body = response.json()

    assert body["source"] in {"live", "fallback"}
    assert body["provider"] in {"Twelve Data", "Indicative fallback"}
    assert body["as_of"]
    assert isinstance(body["delayed"], bool)
    assert isinstance(body["refresh_seconds"], int) and body["refresh_seconds"] >= 15

    quotes = body["quotes"]
    assert isinstance(quotes, list) and len(quotes) >= 2
    assert quotes[0]["pair"] == "AUD/USD"
    assert len({quote["pair"] for quote in quotes}) == len(quotes)
    for quote in quotes:
        base, _, counter = quote["pair"].partition("/")
        assert len(base) == 3 and len(counter) == 3 and base != counter
        assert isinstance(quote["rate"], (int, float)) and quote["rate"] > 0
        assert isinstance(quote["change"], (int, float))
        assert isinstance(quote["derived"], bool)

    # Liveness must be self-consistent: a live payload is fresh with no warning; the
    # fallback is always flagged delayed and carries an indicative warning string.
    if body["source"] == "live":
        assert body["provider"] == "Twelve Data"
        assert body["delayed"] is False
        assert body["warning"] is None
    else:
        assert body["provider"] == "Indicative fallback"
        assert body["delayed"] is True
        assert body["warning"] and "indicative" in body["warning"].lower()


def test_ticker_caches_snapshot_between_requests(client):
    first = client.get("/market/ticker")
    assert first.status_code == 200, first.text
    second = client.get("/market/ticker")
    assert second.status_code == 200, second.text

    # Within the cache window the snapshot (as_of + quotes) must be reused, not refetched.
    assert second.json()["as_of"] == first.json()["as_of"]
    assert second.json()["quotes"] == first.json()["quotes"]


def test_fallback_ticker_contract_is_explicit():
    result = _fallback_ticker("Live market key is not configured; showing indicative values.")

    assert result.source == "fallback"
    assert result.provider == "Indicative fallback"
    assert result.delayed is True
    assert result.warning and "indicative" in result.warning.lower()

    pairs = [q.pair for q in result.quotes]
    # Every AUD cross, every leg, then every extra cross: 7 + 8 + 9 from the default legs.
    assert len(pairs) == 24 and len(set(pairs)) == 24
    assert pairs[:8] == ["AUD/USD", "AUD/EUR", "AUD/GBP", "AUD/NZD", "AUD/JPY", "AUD/CAD", "AUD/CHF", "AUD/CNY"]
    assert set(DEFAULT_TICKER_SYMBOLS) <= set(pairs)
    assert set(TICKER_EXTRA_CROSSES) <= set(pairs)
    for quote in result.quotes:
        assert quote.rate > 0
        # Legs are served exactly as configured; everything else is a calculated cross.
        if quote.pair in TICKER_FALLBACK:
            assert quote.derived is False
            assert quote.rate == TICKER_FALLBACK[quote.pair][0]
        else:
            assert quote.derived is True


def test_parse_ticker_payload_maps_and_skips_missing():
    payload = {
        "AUD/USD": {"symbol": "AUD/USD", "close": "0.65120", "percent_change": "0.48", "open": "0.648", "high": "0.653", "low": "0.647"},
        "EUR/USD": {"symbol": "EUR/USD", "price": 1.0821, "change": 0.75},
        # GBP/USD is a provider error row (no price) and must be skipped, not defaulted.
        "GBP/USD": {"symbol": "GBP/USD", "status": "error", "message": "not found"},
    }

    quotes = _parse_ticker_payload(payload)

    assert [q.pair for q in quotes] == ["AUD/USD", "EUR/USD"]
    usd = quotes[0]
    assert usd.rate == pytest.approx(0.6512)
    assert usd.change == pytest.approx(0.48)
    assert usd.open == pytest.approx(0.648)
    assert usd.high == pytest.approx(0.653)
    assert usd.low == pytest.approx(0.647)
    assert quotes[1].rate == pytest.approx(1.0821)


def test_board_calculates_crosses_from_usd_legs():
    legs = [
        MarketTickerQuote(pair="AUD/USD", rate=0.65, change=1.0),
        MarketTickerQuote(pair="USD/JPY", rate=150.0, change=-1.0),
        MarketTickerQuote(pair="EUR/USD", rate=1.10, change=0.0),
    ]

    board = {q.pair: q for q in _build_ticker_board(legs)}

    # AUD/JPY = AUD/USD × USD/JPY; AUD/EUR = AUD/USD ÷ EUR/USD; EUR/JPY = EUR/USD × USD/JPY.
    assert board["AUD/JPY"].rate == pytest.approx(97.5)
    assert board["AUD/EUR"].rate == pytest.approx(0.65 / 1.10, abs=1e-6)
    assert board["EUR/JPY"].rate == pytest.approx(165.0)
    # % change compares the cross now with the same cross at both legs' previous close.
    previous = (0.65 / 1.01) * (150.0 / 0.99)
    assert board["AUD/JPY"].change == pytest.approx(round((97.5 / previous - 1) * 100, 2))
    assert board["AUD/JPY"].derived is True and board["AUD/JPY"].open is None
    # Legs pass through untouched; crosses needing a missing leg are left out.
    assert board["AUD/USD"] is legs[0]
    assert "AUD/GBP" not in board and "EUR/GBP" not in board
    assert list(board)[:3] == ["AUD/USD", "AUD/JPY", "AUD/EUR"]


def test_ticker_symbols_tolerate_pasted_values(monkeypatch):
    from routers.switchyard import _ticker_symbols

    monkeypatch.setenv("TWELVE_DATA_TICKER_SYMBOLS", '"aud/usd, USD/SGD\nUSD/SGD ,  usd/hkd"')
    assert _ticker_symbols() == ("AUD/USD", "USD/SGD", "USD/HKD")
    # A value with no usable pair (e.g. a number pasted into the wrong box) falls back to the defaults.
    monkeypatch.setenv("TWELVE_DATA_TICKER_SYMBOLS", "60")
    assert _ticker_symbols() == DEFAULT_TICKER_SYMBOLS
    monkeypatch.delenv("TWELVE_DATA_TICKER_SYMBOLS")
    assert _ticker_symbols() == DEFAULT_TICKER_SYMBOLS
