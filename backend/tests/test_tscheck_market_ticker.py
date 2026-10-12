"""Backend coverage for the home-page FX ticker
(endpoint: GET /market/ticker — wider AUD board, quota-aware caching, honest liveness).

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
    TICKER_FALLBACK,
    _fallback_ticker,
    _parse_ticker_payload,
)


def test_ticker_endpoint_contract(client):
    response = client.get("/market/ticker")
    assert response.status_code == 200, response.text
    body = response.json()

    assert body["source"] in {"live", "fallback"}
    assert body["provider"] in {"Twelve Data", "Indicative fallback"}
    assert body["as_of"]
    assert isinstance(body["delayed"], bool)
    assert isinstance(body["refresh_seconds"], int) and body["refresh_seconds"] >= 60

    quotes = body["quotes"]
    assert isinstance(quotes, list) and len(quotes) >= 2
    configured = set(DEFAULT_TICKER_SYMBOLS)
    for quote in quotes:
        assert quote["pair"] in configured
        assert isinstance(quote["rate"], (int, float)) and quote["rate"] > 0
        assert isinstance(quote["change"], (int, float))

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
    assert pairs == list(DEFAULT_TICKER_SYMBOLS)
    for quote in result.quotes:
        assert quote.rate > 0
        assert (quote.pair, quote.rate) in {(p, r) for p, (r, _) in TICKER_FALLBACK.items()}


def test_parse_ticker_payload_maps_and_skips_missing():
    payload = {
        "AUD/USD": {"symbol": "AUD/USD", "close": "0.65120", "percent_change": "0.48", "open": "0.648", "high": "0.653", "low": "0.647"},
        "AUD/EUR": {"symbol": "AUD/EUR", "price": 0.6018, "change": -0.27},
        # AUD/GBP is a provider error row (no price) and must be skipped, not defaulted.
        "AUD/GBP": {"symbol": "AUD/GBP", "status": "error", "message": "not found"},
    }

    quotes = _parse_ticker_payload(payload)

    assert [q.pair for q in quotes] == ["AUD/USD", "AUD/EUR"]
    usd = quotes[0]
    assert usd.rate == pytest.approx(0.6512)
    assert usd.change == pytest.approx(0.48)
    assert usd.open == pytest.approx(0.648)
    assert usd.high == pytest.approx(0.653)
    assert usd.low == pytest.approx(0.647)
    assert quotes[1].rate == pytest.approx(0.6018)
