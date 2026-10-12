import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleDollarSign, FileText, Gauge, Globe2, HandCoins, Layers3, LockKeyhole, ShieldCheck, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants, Button } from "@/components/ui/button";
import { GuideDialog } from "@/components/LeadCapture";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import FxConnectivity from "@/components/FxConnectivity";
import FxTicker from "@/components/FxTicker";
import ClosingPortal from "@/components/ClosingPortal";
import FaqSection from "@/components/FaqSection";
// The globe pulls in WebGL and every flag, so it loads as its own chunk below the fold.
const GlobalReach = lazy(() => import("@/components/GlobalReach"));
import { BOOKING_URL } from "@/lib/siteLinks";
import { useAfterIdle } from "@/lib/defer";

// The globe (WebGL, every flag) starts loading at the first idle moment after the first paint
// instead of during it; until then the same placeholder shows.
function GlobalReachAfterIdle() {
  const idle = useAfterIdle();
  const placeholder = <section className="min-h-[40rem] bg-[#12261F]" aria-hidden="true" />;
  return idle ? <Suspense fallback={placeholder}><GlobalReach /></Suspense> : placeholder;
}

export default function Home() {
  const [guideOpen, setGuideOpen] = useState(false);

  return <>
    <section className="relative isolate overflow-hidden bg-[#12261F] text-white" data-testid="home-hero-section">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="hero-glow absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#2D6A4F]/35 blur-[110px]" />
      <div className="absolute -bottom-24 left-[12%] h-72 w-72 rounded-full bg-[#A8C5BA]/10 blur-[90px]" />
      <div className="relative mx-auto grid min-h-[70svh] max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-5 pb-10 pt-24 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8 lg:pb-12 lg:pt-24">
        <motion.div className="relative z-10 min-w-0" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#A8C5BA]/30 bg-white/[0.06] px-3 py-2 text-[0.6875rem] font-bold tracking-[0.18em] text-[#A8C5BA] backdrop-blur-md" data-testid="hero-badge"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A8C5BA] opacity-60" /><span className="relative h-2 w-2 rounded-full bg-[#A8C5BA]" /></span> FOR MID-MARKET CFOs</div>
          <h1 className="max-w-2xl text-[clamp(2.1rem,9vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.055em] lg:text-[2.9rem] xl:text-[4rem]" data-testid="hero-heading"><span className="block whitespace-nowrap">Manage FX risk</span><span className="block whitespace-nowrap text-[#A8C5BA]">with confidence.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/65" data-testid="hero-description">Tailored corporate FX solutions that protect your margins and simplify treasury management.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " group justify-center rounded-full bg-[#2D6A4F] px-6 text-white shadow-[0_12px_40px_rgba(45,106,79,.3)] hover:bg-[#3d8163]"} data-testid="hero-book-consult-button">Book a 15-Min Consultation <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></a><Button variant="outline" onClick={() => setGuideOpen(true)} className="h-12 rounded-full border-white/20 bg-white/[0.03] px-6 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white" data-testid="hero-download-policy-button">Download Hedge Policy</Button></div>
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">{[[ShieldCheck, "Expert Analysis"], [LockKeyhole, "Risk Protection"], [Sparkles, "15-Min Consultation"]].map(([Icon, label]) => <div key={label as string} className="flex items-center gap-2 text-sm text-white/70" data-testid={`hero-point-${String(label).toLowerCase().replaceAll(" ", "-")}`}><Icon size={16} className="text-[#A8C5BA]" />{label as string}</div>)}</div>
          <p className="mt-7 text-[0.6875rem] leading-5 text-white/40" data-testid="hero-disclaimer">This information is general in nature and does not constitute financial advice.</p>
        </motion.div>
        <FxConnectivity />
      </div>
      <div className="hero-fade absolute inset-x-0 bottom-0 h-24" />
    </section>
    <FxTicker />
    <CfoOutcomes />
    <MetricBand />
    <GlobalReachAfterIdle />
    <section className="bg-[#F5F7F6] px-5 py-14 lg:px-8 lg:py-20" data-testid="solutions-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Corporate FX solutions</SectionLabel><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl" data-testid="solutions-heading">Manage your finances<br /><span className="text-[#52796F]">with ease.</span></h2><p className="max-w-md text-[#4A5A55]" data-testid="solutions-description">Comprehensive treasury services designed for mid-market enterprises managing multi-currency exposure.</p></div></Reveal><div className="mt-12 grid gap-4 md:grid-cols-3">{[[CircleDollarSign, "Competitive rates with full transparency", "Simple to use and enhanced reporting to help you make smarter decisions."], [Globe2, "24/7 online platform access", "Robust and fully secure payment infrastructure to enable reliable transfers across the globe."], [Users, "Dedicated account manager", "Transact seamlessly using the online platform or with the help of your dedicated relationship manager."]].map(([Icon, title, text], index) => <Reveal key={title as string} delay={index * 0.07} className="h-full"><div className="group flex h-full flex-col rounded-2xl border border-[#DCE5E1] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid={`solution-card-${index + 1}`}><div className="mb-14 grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F] transition-colors group-hover:bg-[#2D6A4F] group-hover:text-white"><Icon size={23} /></div><h3 className="text-xl font-bold md:min-h-[5.25rem] lg:min-h-[3.5rem]" data-testid={`solution-title-${index + 1}`}>{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]" data-testid={`solution-copy-${index + 1}`}>{text as string}</p><div className="mt-auto pt-7"><ChevronRight size={20} className="text-[#2D6A4F] transition-transform group-hover:translate-x-1" /></div></div></Reveal>)}</div></div></section>
    <ExposureScenarios />
    <section className="bg-[#F5F7F6] px-5 py-14 lg:px-8 lg:py-16" data-testid="lending-section"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-[#12261F] p-8 text-white sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div><SectionLabel>Business lending</SectionLabel><h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl" data-testid="lending-heading">Flexible lending solutions to help you realise your ambitions.</h2></div><div><p className="text-white/60" data-testid="lending-description">Access a fast and hassle-free trade finance facility when needed to fund your purchases.</p><Link to="/contact" className="mt-7 inline-flex items-center gap-2 font-bold text-[#A8C5BA] hover:text-white" data-testid="lending-explore-link">Explore more <ArrowRight size={16} /></Link></div></div></section>
    <HowWeWork />
    <ClosingPortal />
    <section className="bg-[#12261F] px-5 py-14 text-white lg:px-8 lg:py-16" data-testid="guide-section"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center"><Reveal from="left"><SectionLabel>Free resource</SectionLabel><h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl" data-testid="guide-heading">Get the free Hedge Policy Guide.</h2><p className="mt-5 max-w-xl text-white/60" data-testid="guide-description">Download our sample treasury policy template and learn how to build a hedging framework that works for mid-market CFOs.</p><Button onClick={() => setGuideOpen(true)} className="mt-8 h-12 rounded-full bg-[#A8C5BA] px-6 font-bold text-[#12261F] hover:bg-white" data-testid="guide-open-button">Download PDF <ArrowRight size={17} /></Button></Reveal><Reveal from="right" delay={0.1}><div className="grid gap-3">{["Policy structure & governance best practices", "Currency pair prioritisation framework", "Reporting & board communication templates"].map((item) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm" data-testid={`guide-feature-${item.toLowerCase().replaceAll(" ", "-")}`}><div className="grid h-9 w-9 place-items-center rounded-full bg-[#2D6A4F]"><Check size={17} /></div><span className="font-bold">{item}</span></div>)}</div></Reveal></div></section>
    <FaqSection />
    <GuideDialog open={guideOpen} onOpenChange={setGuideOpen} />
  </>;
}

function CfoOutcomes() {
  const outcomes = [
    [Layers3, "One source of truth", "Bring exposures, hedge positions and upcoming settlements into one decision-ready view."],
    [ShieldCheck, "Margins stay protected", "Set guardrails before volatility arrives, with structures aligned to commercial outcomes."],
    [Gauge, "Board-ready clarity", "Turn treasury activity into a concise story leadership can understand and act on."],
  ] as const;
  return <section className="section-transition bg-[#F5F7F6] px-5 py-14 lg:px-8 lg:py-20" data-testid="cfo-outcomes-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><div className="grid gap-8 lg:grid-cols-2 lg:items-end"><div><SectionLabel>Built around CFO outcomes</SectionLabel><h2 className="text-4xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl" data-testid="cfo-outcomes-heading">Less market noise.<br /><span className="text-[#52796F]">More decision quality.</span></h2></div><p className="max-w-xl text-lg leading-8 text-[#4A5A55]">Your FX programme should make the business easier to run. Every recommendation considers margins, cashflow, forecasts &amp; sales, supplier terms, business goals and reporting outcomes you need.</p></div></Reveal><div className="mt-14 grid gap-4 md:grid-cols-3">{outcomes.map(([Icon, title, copy], index) => <Reveal key={title} from="scale" delay={index * 0.08} className="h-full"><motion.div whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="group relative h-full min-h-72 overflow-hidden rounded-[1.5rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_12px_40px_rgba(18,38,31,.04)]" data-testid={`cfo-outcome-card-${index + 1}`}><div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E8EEEB] transition-transform duration-500 group-hover:scale-125" /><div className="relative grid h-12 w-12 place-items-center rounded-xl bg-[#12261F] text-[#A8C5BA]"><Icon size={22} /></div><p className="relative mt-16 text-[0.625rem] font-bold tracking-[0.16em] text-[#52796F]">OUTCOME 0{index + 1}</p><h3 className="relative mt-3 text-2xl font-bold">{title}</h3><p className="relative mt-3 text-sm leading-6 text-[#4A5A55]">{copy}</p></motion.div></Reveal>)}</div></div></section>;
}

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(() => (reducedMotion ? value : 0));
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) { setDisplay(value); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value]);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

function MetricBand() {
  return <section className="dark-surface relative overflow-hidden bg-[#12261F] px-5 py-12 text-white lg:px-8" data-testid="animated-metrics-section"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(82,121,111,.22),transparent_48%)]" /><div className="relative mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">{[[35, "+", "Years of Experience"], [24, "/7", "Online platform access"], [5, "", "Core Services"], [15, " min", "Consultation"]].map(([value, suffix, label], index) => <Reveal key={label as string} from="top" delay={index * 0.06}><div className="border-l border-white/10 pl-5" data-testid={`metric-${index + 1}`}><p className="text-4xl font-bold tracking-[-0.05em] text-[#A8C5BA]"><AnimatedCounter value={value as number} suffix={suffix as string} /></p><p className="mt-2 text-sm leading-5 text-white/55 text-pretty">{label as string}</p></div></Reveal>)}</div></section>;
}

function ExposureScenarios() {
  const strategies = [
    { name: "Conservative", title: "Conservative approach", copy: "Prioritise forecast certainty with a higher hedge ratios across known exposures with underlying protection products.", products: ["FX Forwards", "Collars", "Participating Forwards", "Trackers", "Accelerators", "and more"], certainty: "HIGH", flexibility: "MODERATE" },
    { name: "Balanced", title: "Balanced approach", copy: "Blend protection and flexibilty with a fluid hedge approach across a mix of selective FX structures.", products: ["Knock In's", "Knock Outs", "Dynamic Forwards", "Capped FEC's", "Extendibles", "and more"], certainty: "MODERATE", flexibility: "HIGH" },
    { name: "Dynamic", title: "Dynamic approach", copy: "Proactive FX management across the full bredth of products, with the flexibility to transact as market opportunities and business goals align.", products: ["Ratios", "Accumulators", "Leveraged KIKO's", "Convertibles", "TARF's", "Sold Structures", "and more"], certainty: "MODERATE", flexibility: "MAXIMUM" },
  ] as const;
  const [selected, setSelected] = useState(1);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = strategies[selected];
  const levels: Record<string, number> = { MODERATE: 2, HIGH: 3, MAXIMUM: 4 };
  const meter = (value: string, label: string) => <div className="mt-3 flex gap-1" role="img" aria-label={`${label}: ${value}`}>{[0, 1, 2, 3].map((segment) => <span key={segment} className={`h-1.5 flex-1 rounded-full ${segment < (levels[value] ?? 0) ? "bg-[#2D6A4F]" : "bg-[#E8EEEB]"}`} />)}</div>;
  const focusTab = (index: number) => {
    const next = (index + strategies.length) % strategies.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") focusTab(index + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(strategies.length - 1);
    else return;
    event.preventDefault();
  };
  return <section className="section-transition bg-white px-5 py-14 lg:px-8 lg:py-20" data-testid="exposure-scenarios-section">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <Reveal from="left">
        <SectionLabel>Advisory, not guesswork</SectionLabel>
        <h2 className="text-4xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl" data-testid="exposure-scenarios-heading">See how different hedge settings change the conversation.</h2>
        <p className="mt-6 max-w-lg leading-7 text-[#4A5A55]" data-testid="exposure-scenarios-intro">Switch between indicative approaches to compare Conservative, Balanced &amp; Dynamic solutions. A strategy would be tailored to your cashflows and risk appetite.</p>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Indicative hedging strategies">
          {strategies.map((strategy, index) => <button key={strategy.name} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`scenario-tab-${strategy.name.toLowerCase()}`} aria-selected={selected === index} aria-controls="scenario-panel" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => onTabKeyDown(event, index)} className={`rounded-full border px-5 py-3 text-sm font-bold tracking-[0.08em] transition-[background-color,color,border-color,transform] duration-200 hover:-translate-y-0.5 ${selected === index ? "border-[#2D6A4F] bg-[#2D6A4F] text-white" : "border-[#DCE5E1] bg-white text-[#4A5A55]"}`} data-testid={`scenario-${strategy.name.toLowerCase()}-tab`}>{strategy.name.toUpperCase()}</button>)}
        </div>
        <p className="mt-8 max-w-lg leading-7 text-[#4A5A55]" data-testid="exposure-scenarios-advisory-copy">We have helped thousands of businesses trade and thrive globally. Get in touch with our team to learn how we can help you succeed beyond borders.</p>
        <a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " mt-6 rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="advisory-book-button">Book a 15-min call <ArrowUpRight size={17} /></a>
        <p className="mt-6 max-w-lg text-xs leading-5 text-[#4A5A55]" data-testid="scenario-disclaimer">Indicative strategies for illustration only — not personal financial advice. Example products are not recommendations and any real strategy would be tailored to your cashflows, objectives and risk appetite.</p>
      </Reveal>
      <Reveal from="right" delay={0.1}>
        <motion.div key={current.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-[2rem] border border-[#DCE5E1] bg-white shadow-[0_24px_70px_rgba(18,38,31,.08)]" id="scenario-panel" role="tabpanel" aria-labelledby={`scenario-tab-${current.name.toLowerCase()}`} data-testid="scenario-result-card">
          <div className="border-b border-[#DCE5E1] p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#52796F]" data-testid="scenario-label">{current.title}</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#4A5A55]" data-testid="scenario-copy">{current.copy}</p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#52796F]">Example products</p>
            <ul className="mt-3 flex flex-wrap gap-2" data-testid="scenario-products">{current.products.map((product) => <li key={product} className={product === "and more" ? "self-center text-xs italic text-[#4A5A55]" : "rounded-full border border-[#DCE5E1] bg-[#F5F7F6] px-3 py-1.5 text-xs font-bold text-[#12261F]"}>{product}</li>)}</ul>
          </div>
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-[#DCE5E1] p-6 sm:border-b-0 sm:border-r">
              <p className="text-xs text-[#4A5A55]">Cashflow certainty</p>
              <p className="mt-2 text-lg font-bold" data-testid="scenario-certainty">{current.certainty}</p>
              {meter(current.certainty, "Cashflow certainty")}
            </div>
            <div className="p-6">
              <p className="text-xs text-[#4A5A55]">Flexibility</p>
              <p className="mt-2 text-lg font-bold" data-testid="scenario-flexibility">{current.flexibility}</p>
              {meter(current.flexibility, "Flexibility")}
            </div>
          </div>
        </motion.div>
      </Reveal>
    </div>
  </section>;
}

function HowWeWork() { const steps = [[Target, "01", "Assess", "We analyse your FX exposure, cash flows, and risk tolerance to understand your unique situation."], [HandCoins, "02", "Hedge", "Design and execute tailored strategies. Forward contracts, options, or custom structures."], [TrendingUp, "03", "Track", "Real-time monitoring and reporting. Transparent dashboards showing P&L and position management."], [FileText, "04", "Report", "Monthly compliance and strategy reviews. Ongoing optimisations based on market conditions."]]; return <section className="bg-white px-5 py-14 lg:px-8 lg:py-20" data-testid="how-we-work-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>How we work</SectionLabel><h2 className="max-w-xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="how-we-work-heading">Clarity at every step.</h2></Reveal><div className="mt-12 grid gap-5 md:grid-cols-4">{steps.map(([Icon, number, title, copy], index) => <Reveal key={title as string} delay={index * 0.06}><div className="relative border-t-2 border-[#DCE5E1] pt-5" data-testid={`how-step-${number}`}><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#52796F]">{number as string}</span><Icon size={20} className="text-[#2D6A4F]" /></div><h3 className="mt-10 text-xl font-bold">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{copy as string}</p></div></Reveal>)}</div></div></section>; }
