import type { ComponentType } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, Calculator, Check, LineChart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SectionLabel } from "@/components/SiteShell";

type IconType = ComponentType<{ size?: number; className?: string }>;
type Category = {
  id: string;
  index: string;
  icon: IconType;
  title: string;
  badge?: string;
  copy: string;
  items: [string, string][];
  format: string;
};

// Content adapted from the SwitchYard resources brief, rewritten in SwitchYard's established voice.
const categories: Category[] = [
  {
    id: "market-insights", index: "01", icon: LineChart, title: "FX Market Insights", badge: "High priority",
    copy: "Timely analysis of the market drivers that matter to Australian businesses, translating global developments into practical FX considerations.",
    items: [
      ["Market Brief", "Key currency movements and what is driving them."],
      ["Week Ahead", "Central bank decisions, inflation releases, employment data and major events."],
      ["Currency Outlooks", "AUD/USD, AUD/EUR, AUD/GBP and other relevant currency pairs."],
      ["Quarterly FX Outlook", "Macro trends, key risks and scenarios for the months ahead."],
    ],
    format: "Short articles, email updates and downloadable outlooks.",
  },
  {
    id: "hedging-guides", index: "02", icon: ShieldCheck, title: "FX Risk & Hedging Guides",
    copy: "Practical education on how businesses can manage currency exposure, protect margins and make informed hedging decisions.",
    items: [
      ["The FX Hedging Playbook", "From identifying exposure to implementing a hedging policy."],
      ["Forward Contracts vs Options", "Understanding cost, flexibility and protection."],
      ["Hedge Ratio Guide", "How much of forecast exposure should a business hedge?"],
      ["Structured FX Products Explained", "Collars, participating forwards and other strategies."],
      ["Budget Rate & Margin Protection", "Connecting exchange rates to profitability."],
    ],
    format: "Educational articles, visual explainers and downloadable guides.",
  },
  {
    id: "tools", index: "03", icon: Calculator, title: "FX Tools & Calculators",
    copy: "Interactive tools that turn FX theory into practical numbers a finance team can use.",
    items: [
      ["Currency Converter", "Calculate indicative currency conversions."],
      ["FX Impact Calculator", "Model how exchange rate movements affect costs, revenue and margins."],
      ["Budget Rate Calculator", "Calculate the exchange rate required to achieve a target margin."],
      ["Hedging Scenario Calculator", "Compare unhedged exposure against illustrative forward and option strategies."],
      ["Economic Calendar", "Track major events that may influence currency markets."],
    ],
    format: "Interactive website tools with optional enquiry or consultation prompts.",
  },
  {
    id: "treasury", index: "04", icon: BriefcaseBusiness, title: "Treasury & CFO Resources",
    copy: "Practical resources for establishing governance, improving visibility and bringing structure to FX management.",
    items: [
      ["FX Policy Template", "A framework for documenting hedging objectives, limits and approvals."],
      ["Treasury Health Check", "Assess exposure visibility, hedge coverage and operational processes."],
      ["FX Reporting Checklist", "The key measures to report to management and the board."],
      ["Exposure Management Guide", "Improve forecasting of foreign currency payables and receivables."],
      ["Multi-Provider FX Management", "Improve oversight of pricing, transactions and counterparty exposure."],
    ],
    format: "Downloadable templates, checklists and practical playbooks.",
  },
  {
    id: "knowledge", index: "05", icon: BookOpen, title: "FX Knowledge Centre",
    copy: "A searchable library that makes complex FX concepts easier to understand without unnecessary financial jargon.",
    items: [
      ["FX Fundamentals", "Spot, forwards, swaps and options."],
      ["Payments & Collections", "International transfers, settlement and foreign currency accounts."],
      ["FX Terminology", "A clear A–Z glossary."],
      ["Product Explainers", "How different hedging structures work, including their trade-offs."],
      ["Frequently Asked Questions", "Answers to common questions from CFOs, importers and exporters."],
    ],
    format: "Searchable articles, glossaries and concise visual guides.",
  },
];

const featured: { tag: string; title: string; copy: string }[] = [
  { tag: "Market insights", title: "What moves the Australian dollar?", copy: "Understand the key economic, commodity and interest rate drivers behind AUD movements." },
  { tag: "FX tools", title: "What is your true FX budget rate?", copy: "Calculate the exchange rate your business needs to protect its target margins." },
  { tag: "Hedging guides", title: "A practical guide to FX hedging", copy: "Understand how forwards, options and structured solutions can help manage exposure." },
  { tag: "Treasury resources", title: "The CFO's FX risk checklist", copy: "Five areas to review for stronger exposure visibility, governance and reporting." },
];

const tools: [string, string][] = [
  ["FX Impact Calculator", "See how exchange rate movements affect your costs, revenue and margins."],
  ["Budget Rate Calculator", "Find the exchange rate your business needs to protect its target margins."],
  ["FX Hedging Scenario Tool", "Compare unhedged exposure against illustrative forward and option strategies."],
  ["Treasury Health Check", "Assess your exposure visibility, hedge coverage and operational processes."],
  ["Economic Calendar", "Track central bank decisions, inflation releases and events that move markets."],
  ["FX Glossary", "A clear A–Z of FX products, terminology and global payments."],
];

const journey: [string, string][] = [
  ["Discover", "Market commentary, currency outlooks and educational articles that answer the questions finance teams actually ask."],
  ["Evaluate", "Calculators, scenario comparisons and treasury checklists that let you quantify your own FX exposure."],
  ["Engage", "A clear next step — review your exposure, discuss your hedging strategy or request a treasury review."],
];

export default function Resources() { return <>
  <section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-28" data-testid="resources-hero"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Resources</SectionLabel><h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl" data-testid="resources-heading">Better FX decisions<br /><span className="text-[#A8C5BA]">start with better insight.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60" data-testid="resources-copy">Access practical FX intelligence, risk management tools and treasury resources designed to help your business navigate currency markets with greater clarity and control.</p><p className="mt-4 max-w-2xl text-lg leading-8 text-white/45">From understanding market movements to building a structured hedging strategy, explore insights that connect FX decisions to real commercial outcomes.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#category-market-insights" className={buttonVariants({ size: "lg" }) + " group rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="resources-insights-button">Explore market insights <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></a><a href="#category-tools" className={buttonVariants({ variant: "outline", size: "lg" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="resources-tools-button">Explore FX tools</a></div></Reveal></div></section>

  <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-28" data-testid="resources-categories-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>What you'll find</SectionLabel><h2 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="resources-categories-heading">Five core resource categories.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-[#4A5A55]">Practical FX resources built around the way finance teams work — from the market drivers of the day to the tools and frameworks behind a repeatable hedging process.</p></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-2">{categories.map((category, index) => <Reveal key={category.id} from="scale" delay={(index % 2) * 0.06} className="h-full"><CategoryCard category={category} /></Reveal>)}</div></div></section>

  <section id="featured-resources" className="scroll-mt-24 bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="resources-featured-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Featured resources</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="resources-featured-heading">Start with the essentials.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-[#4A5A55]">The four resources businesses reach for first — a clear view of what moves the market, what rate protects your margin, how hedging works and what to review.</p></Reveal><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((item, index) => <Reveal key={item.title} from="bottom" delay={index * 0.06} className="h-full"><article className="group flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid={`resources-featured-${index + 1}`}><span className="w-fit rounded-full bg-white px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#52796F]">{item.tag}</span><h3 className="mt-6 text-xl font-bold tracking-[-0.02em]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{item.copy}</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[#2D6A4F]">Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></article></Reveal>)}</div></div></section>

  <section id="fx-tools" className="scroll-mt-24 bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-24" data-testid="resources-tools-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Interactive tools</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="resources-tools-heading">Tools that turn FX theory into numbers.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-[#4A5A55]">The calculators and tools we're building to help your team quantify exposure and make more informed decisions. Tool outputs are indicative and state their assumptions.</p></Reveal><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map(([title, copy], index) => <Reveal key={title} from="bottom" delay={index * 0.05} className="h-full"><div className="flex h-full gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid={`resources-tool-${index + 1}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Calculator size={20} /></span><div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#4A5A55]">{copy}</p></div></div></Reveal>)}</div></div></section>

  <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="resources-journey-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>From insight to decision</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="resources-journey-heading">Every resource moves you forward.</h2></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-3">{journey.map(([title, copy], index) => <Reveal key={title} from="bottom" delay={index * 0.06} className="h-full"><div className="h-full rounded-[2rem] bg-[#12261F] p-8 text-white" data-testid={`resources-journey-${index + 1}`}><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8C5BA]">0{index + 1} · {title}</span><p className="mt-6 text-lg leading-8 text-white/75">{copy}</p></div></Reveal>)}</div></div></section>

  <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-24" data-testid="resources-cta-section"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[2rem] bg-[#E8EEEB] p-8 sm:p-12 lg:flex-row lg:items-center"><div><SectionLabel>Need a steer?</SectionLabel><h2 className="mt-2 max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="resources-cta-heading">Not sure where to start?</h2><p className="mt-4 max-w-xl text-[#4A5A55]">Tell us about your currency exposures and we'll point you to the resources — and the people — that help most. Market commentary is educational and is not a promise of exchange rate outcomes.</p></div><Link to="/contact" className={buttonVariants({ size: "lg" }) + " group shrink-0 rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="resources-cta-button">Talk to an FX specialist <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link></div></section>
</>; }

function CategoryCard({ category }: { category: Category }) {
  const { id, index, icon: Icon, title, badge, copy, items, format } = category;
  return <div id={`category-${id}`} className="flex h-full scroll-mt-28 flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-7 sm:p-8" data-testid={`resources-category-${index}`}>
    <div className="flex items-center justify-between">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Icon size={23} /></span>
      <div className="flex items-center gap-3"><span className="text-sm font-bold text-[#8AA79B]">{index}</span>{badge && <span className="rounded-full bg-[#2D6A4F] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white">{badge}</span>}</div>
    </div>
    <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em]" data-testid={`resources-category-title-${index}`}>{title}</h3>
    <p className="mt-3 leading-7 text-[#4A5A55]">{copy}</p>
    <ul className="mt-6 grid gap-3">{items.map(([label, text]) => <li key={label} className="flex gap-2 text-sm leading-6 text-[#12261F]"><Check size={16} className="mt-1 shrink-0 text-[#2D6A4F]" /><span><span className="font-bold">{label}:</span> {text}</span></li>)}</ul>
    <p className="mt-auto pt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#52796F]">Format · <span className="font-semibold normal-case tracking-normal text-[#4A5A55]">{format}</span></p>
  </div>;
}
