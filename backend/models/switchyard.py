from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


SubmissionKind = Literal["contact", "newsletter", "hedge-guide"]


class FxRate(BaseModel):
    pair: str
    rate: float
    change: float
    source: Literal["live", "fallback"]


class FxRatesResponse(BaseModel):
    base: str
    as_of: str
    rates: list[FxRate]


class MarketQuote(BaseModel):
    pair: str
    rate: float
    change: float


class MarketCandle(BaseModel):
    timestamp: str
    close: float


class MarketOverviewResponse(BaseModel):
    source: Literal["live", "fallback"]
    provider: Literal["Twelve Data", "Indicative fallback"]
    as_of: str
    quotes: list[MarketQuote]
    candles: list[MarketCandle]
    warning: str | None = None


class MarketTickerQuote(BaseModel):
    pair: str
    rate: float
    change: float
    # Twelve Data's /quote returns these for live rows; they stay null on the fallback path.
    open: float | None = None
    high: float | None = None
    low: float | None = None


class MarketTickerResponse(BaseModel):
    source: Literal["live", "fallback"]
    provider: Literal["Twelve Data", "Indicative fallback"]
    as_of: str
    quotes: list[MarketTickerQuote]
    # True once a cached snapshot is older than the "fresh" window, or whenever the row is
    # indicative — so the UI can say "Delayed" vs "Live" honestly instead of implying real time.
    delayed: bool
    # How often the server refreshes the snapshot; the client polls no faster than this.
    refresh_seconds: int
    warning: str | None = None


class SubmissionCreate(BaseModel):
    kind: SubmissionKind
    email: EmailStr
    name: str | None = Field(default=None, max_length=120)
    company: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=60)
    annual_fx_volume: str | None = Field(default=None, max_length=80)
    message: str | None = Field(default=None, max_length=5000)
    role: str | None = Field(default=None, max_length=100)
    cadence: Literal["daily", "weekly"] | None = None
    locale: str = Field(default="en", max_length=12)
    consent: bool = False
    # Honeypot: hidden from people in the form, so any value means a bot filled it in.
    company_url: str | None = Field(default=None, max_length=500)


class SubmissionResponse(BaseModel):
    ok: bool
    id: str
    received_at: datetime