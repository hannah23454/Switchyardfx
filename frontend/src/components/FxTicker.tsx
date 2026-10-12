import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { MarketTickerQuote } from "@/lib/types";
import { useMarketTicker } from "@/lib/useMarketTicker";

// The live FX board under the hero: a marquee of AUD pairs pulled from the same server snapshots
// GlobalReach uses. The strip is honest about provenance — LIVE when the backend has a fresh
// Twelve Data snapshot, DELAYED when a live snapshot has aged past its fresh window, INDICATIVE
// on the labelled fallback — and pauses on hover. Under reduced motion the animation is removed
// and the quotes wrap instead of scrolling. An unanimated sr-only list keeps the board readable
// by assistive tech while the marquee is decorative.
const SKELETON_PAIRS = ["AUD/USD", "AUD/EUR", "AUD/GBP", "AUD/JPY", "AUD/NZD", "AUD/CAD", "AUD/CHF", "AUD/CNY"];

type Badge = "live" | "delayed" | "indicative" | "loading" | "error";

const BADGES: Record<Badge, { chip: string; dot: string; label: string }> = {
  live: { chip: "border-[#7FCEA4]/30 bg-[#7FCEA4]/10 text-[#7FCEA4]", dot: "bg-[#7FCEA4] shadow-[0_0_0_3px_rgba(127,206,164,.15)]", label: "LIVE" },
  delayed: { chip: "border-[#E8C58A]/30 bg-[#E8C58A]/10 text-[#E8C58A]", dot: "bg-[#E8C58A]", label: "DELAYED" },
  indicative: { chip: "border-[#A8C5BA]/30 bg-[#A8C5BA]/10 text-[#A8C5BA]", dot: "bg-[#A8C5BA]", label: "INDICATIVE" },
  loading: { chip: "border-white/15 bg-white/5 text-white/60", dot: "animate-pulse bg-white/40", label: "UPDATING" },
  error: { chip: "border-red-400/30 bg-red-400/10 text-red-300", dot: "animate-pulse bg-red-400", label: "UNAVAILABLE" },
};

function formatRate(rate: number): string {
  return rate.toFixed(rate >= 100 ? 2 : 4);
}

function formatChange(change: number): string {
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}

function formatUpdated(iso: string): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function QuoteItem({ quote }: { quote: MarketTickerQuote }) {
  const pair = quote.pair.replace("/", "-");
  const up = quote.change >= 0;
  return (
    <li className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" data-testid={`ticker-quote-${pair}`}>
      <span className="text-[11px] font-bold tracking-[0.14em] text-[#A8C5BA]">{quote.pair}</span>
      <span className="text-sm font-bold tabular-nums text-white" data-testid={`ticker-quote-rate-${pair}`}>{formatRate(quote.rate)}</span>
      <span className={`flex items-center gap-1 text-xs font-bold tabular-nums ${up ? "text-[#7FCEA4]" : "text-[#F0A0A0]"}`} data-testid={`ticker-quote-change-${pair}`}>{up ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}{formatChange(quote.change)}</span>
      <span aria-hidden="true" className="ml-3 h-1 w-1 shrink-0 rounded-full bg-white/20" />
    </li>
  );
}

function TickerSet({ quotes, ariaHidden = false }: { quotes: MarketTickerQuote[]; ariaHidden?: boolean }) {
  return <ul aria-hidden={ariaHidden || undefined} className="flex items-center gap-x-10 pr-10">{quotes.map((quote) => <QuoteItem key={quote.pair} quote={quote} />)}</ul>;
}

function PlaceholderSet() {
  return <ul aria-hidden className="flex items-center gap-x-10">{SKELETON_PAIRS.map((pair) => <li key={pair} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap opacity-50"><span className="text-[11px] font-bold tracking-[0.14em] text-[#A8C5BA]">{pair}</span><span className="text-sm font-bold text-white/50">• • •</span></li>)}</ul>;
}

export default function FxTicker() {
  const { data, isLoading } = useMarketTicker();

  let badge: Badge;
  let subtext: string;
  if (data) {
    if (data.source === "live" && !data.delayed) {
      badge = "live";
      subtext = `Updated ${formatUpdated(data.as_of)} · Twelve Data`;
    } else if (data.source === "live") {
      badge = "delayed";
      subtext = `Refreshed ${formatUpdated(data.as_of)} · delayed feed`;
    } else {
      badge = "indicative";
      subtext = `Refreshed ${formatUpdated(data.as_of)} · indicative`;
    }
  } else if (isLoading) {
    badge = "loading";
    subtext = "Loading the market board";
  } else {
    badge = "error";
    subtext = "Market board unavailable";
  }
  const chip = BADGES[badge];

  return <section className="relative z-10 overflow-hidden border-t border-white/10 bg-[#12261F] px-5 py-5 text-white lg:px-8" data-testid="market-ticker-section"><div className="mx-auto flex max-w-7xl flex-col gap-5 xl:flex-row xl:items-center">
    <div className="flex shrink-0 items-center gap-3" data-testid="market-ticker-status">
      <span className={`h-2.5 w-2.5 rounded-full ${chip.dot}`} />
      <div>
        <p className="text-sm font-bold">Live FX rates</p>
        <p className="text-xs text-white/50" data-testid="market-ticker-subtext" aria-live="polite">{subtext}</p>
      </div>
      <span className={`ml-2 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] ${chip.chip}`} data-testid="market-ticker-badge">{chip.label}</span>
    </div>
    <div className="ticker-viewport relative flex-1 overflow-hidden">
      {data && data.quotes.length > 0
        ? <div className="ticker-track flex w-max items-center"><TickerSet quotes={data.quotes} /><TickerSet quotes={data.quotes} ariaHidden /></div>
        : <div className="flex w-max items-center"><PlaceholderSet /></div>}
    </div>
  </div>
  <ul className="sr-only" data-testid="market-ticker-static">{data?.quotes.map((quote) => <li key={quote.pair}>{quote.pair} {formatRate(quote.rate)} {formatChange(quote.change)} · {data.source} {data.delayed ? "delayed" : "live"}</li>)}</ul>
  </section>;
}