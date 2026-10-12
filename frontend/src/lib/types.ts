export interface FxRate {
  pair: string;
  rate: number;
  change: number;
  source: "live" | "fallback";
}

export interface FxRatesResponse {
  base: string;
  as_of: string;
  rates: FxRate[];
}

export interface MarketQuote {
  pair: string;
  rate: number;
  change: number;
}

export interface MarketCandle {
  timestamp: string;
  close: number;
}

export interface MarketOverviewResponse {
  source: "live" | "fallback";
  provider: "Twelve Data" | "Indicative fallback";
  as_of: string;
  quotes: MarketQuote[];
  candles: MarketCandle[];
  warning: string | null;
}

export interface MarketTickerQuote {
  pair: string;
  rate: number;
  change: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  /** True for a cross the server calculated from two USD legs rather than quoted directly. */
  derived?: boolean;
}

export interface MarketTickerResponse {
  source: "live" | "fallback";
  provider: "Twelve Data" | "Indicative fallback";
  as_of: string;
  quotes: MarketTickerQuote[];
  /** True whenever the snapshot is the labelled fallback or a live snapshot older than the
   *  fresh window — so the UI can say "Delayed" vs "Live" honestly instead of implying real time. */
  delayed: boolean;
  /** How often the server refreshes the snapshot; the client polls no faster than this. */
  refresh_seconds: number;
  warning: string | null;
}

export type SubmissionKind = "contact" | "newsletter" | "hedge-guide";

export interface SubmissionResponse {
  ok: boolean;
  id: string;
  received_at: string;
}

export interface SubmissionPayload {
  kind: SubmissionKind;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  annual_fx_volume?: string;
  message?: string;
  role?: string;
  cadence?: "daily" | "weekly";
  locale: string;
  consent: boolean;
  /** Honeypot: hidden from people; bots that fill it are dropped server-side. */
  company_url?: string;
}