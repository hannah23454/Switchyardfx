import type { ComponentType } from "react";
import { ArrowRight, Banknote, ChartNoAxesCombined, Check, Coins, Compass, GitCompareArrows, ShieldCheck, Truck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SectionLabel } from "@/components/SiteShell";

type IconType = ComponentType<{ size?: number; className?: string }>;
type Capability = { title: string; copy: string };
type Solution = {
  id: string;
  index: string;
  icon: IconType;
  title: string;
  cardCopy: string;
  subtitle: string;
  intro: string[];
  capabilities: Capability[];
  why: string[];
  ctaHeading: string;
  ctaCopy: string;
  ctaLabel: string;
  note?: string;
};

// Content drawn from the SwitchYard solutions brief, rewritten in SwitchYard's established voice.
const solutions: Solution[] = [
  {
    id: "global-payments", index: "01", icon: Banknote, title: "Global Payments",
    cardCopy: "Move money across borders with greater confidence. Access competitive FX execution and tailored payment solutions for suppliers, partners and international operations.",
    subtitle: "Move Money Without the Complexity.",
    intro: [
      "Make international payments simpler with competitive FX execution, access to multiple providers through our network and practical support from FX specialists.",
      "SwitchYard helps businesses streamline cross-border payments while improving visibility over currency conversion, settlement and international cash flows.",
    ],
    capabilities: [
      { title: "International Payments", copy: "Pay overseas suppliers, partners and service providers across supported currencies and markets." },
      { title: "Competitive FX Execution", copy: "Access currency pricing across available providers to support informed execution decisions." },
      { title: "Payment Management", copy: "Simplify payment workflows and improve visibility across international transactions." },
      { title: "Collections & Receivables", copy: "Explore solutions for receiving international revenue and managing foreign currency inflows." },
    ],
    why: [
      "Greater visibility over FX pricing and provider options.",
      "More efficient management of international payments.",
      "A more informed approach to conversion timing and execution.",
      "Guidance aligned to your business and transaction requirements.",
    ],
    ctaHeading: "Take Control of Your Global Payments",
    ctaCopy: "Find a smarter way to manage your international payments and FX requirements.",
    ctaLabel: "Discuss Your Payment Requirements",
  },
  {
    id: "fx-risk-management", index: "02", icon: ShieldCheck, title: "FX Risk Management",
    cardCopy: "Protect margins and improve budget certainty with FX strategies tailored to your exposures, cash flows and business objectives.",
    subtitle: "Manage Risk. Protect Your Margins.",
    intro: [
      "Currency movements can have a direct impact on profitability, cash flow and budgeting. SwitchYard helps businesses understand their FX exposures and access hedging solutions aligned to their commercial objectives.",
      "From straightforward forward contracts to more tailored option strategies, we bring together specialist guidance and provider access to help you make informed hedging decisions.",
    ],
    capabilities: [
      { title: "Forward Contracts", copy: "Establish exchange rates for future currency requirements to improve cost and budget certainty." },
      { title: "FX Options & Structured Solutions", copy: "Explore strategies designed around your market outlook, exposure profile and risk tolerance." },
      { title: "Exposure Management", copy: "Better understand upcoming payments, receipts and the potential impact of currency movements." },
      { title: "Hedging Strategy", copy: "Develop a practical approach that aligns hedging decisions with business objectives and cash flow requirements." },
    ],
    why: [
      "Tailored strategies rather than one-size-fits-all products.",
      "Access to multiple FX providers and pricing options.",
      "Greater clarity around potential outcomes, trade-offs and risks.",
      "Specialist support throughout the decision-making process.",
    ],
    ctaHeading: "Build a Smarter FX Strategy",
    ctaCopy: "Understand your exposure and explore the strategies available to your business.",
    ctaLabel: "Arrange an FX Risk Review",
  },
  {
    id: "multi-currency", index: "03", icon: Coins, title: "Multi-Currency Solutions",
    cardCopy: "Manage international receipts, foreign currency balances and conversions more efficiently with solutions designed around your global cash flows.",
    subtitle: "Greater Control Over Your Global Cash Flow.",
    intro: [
      "International businesses often receive, hold and pay funds in different currencies. SwitchYard helps connect these requirements with multi-currency solutions that support more efficient cash flow management.",
      "Explore available foreign currency accounts, international collections and conversion options through our provider network, with a focus on visibility, flexibility and practical use.",
    ],
    capabilities: [
      { title: "Foreign Currency Accounts", copy: "Explore available account solutions for holding and managing supported currencies." },
      { title: "International Collections", copy: "Manage incoming foreign currency receipts with solutions suited to your trading markets." },
      { title: "Currency Conversion", copy: "Compare available FX options to make more informed decisions about when and how to convert." },
      { title: "Cash Flow Coordination", copy: "Align foreign currency receipts and payments where possible to reduce unnecessary conversions." },
    ],
    why: [
      "Better visibility over international currency flows.",
      "More flexibility in managing foreign currency balances.",
      "Opportunities to reduce avoidable conversion costs.",
      "Solutions selected around your operating model and provider requirements.",
    ],
    ctaHeading: "Make Your Currencies Work Smarter",
    ctaCopy: "Discover multi-currency options that better support your international operations.",
    ctaLabel: "Explore Your Options",
  },
  {
    id: "supplier-payment-finance", index: "04", icon: Truck, title: "Supplier Payment Finance",
    cardCopy: "Explore funding solutions that help manage supplier payments, support working capital and create greater flexibility across international trade cycles.",
    subtitle: "Support Growth Without Straining Cash Flow.",
    intro: [
      "Managing supplier payments while waiting for customer receipts can place pressure on working capital. SwitchYard helps businesses explore supplier finance and trade funding solutions through relevant funding partners.",
      "By connecting funding requirements with international payment and FX considerations, we help businesses assess options that may support purchasing, supplier relationships and cash flow flexibility.",
    ],
    capabilities: [
      { title: "Supplier Payment Funding", copy: "Explore funding options to help meet eligible supplier invoices and purchasing requirements." },
      { title: "Working Capital Flexibility", copy: "Consider funding structures that help bridge the timing gap between supplier payments and customer receipts." },
      { title: "International Payment Coordination", copy: "Connect funding needs with the currencies and payment requirements of overseas suppliers." },
      { title: "FX Risk Considerations", copy: "Assess currency exposure associated with supplier commitments and future repayments." },
    ],
    why: [
      "A joined-up view of funding, payments and currency requirements.",
      "Access to relevant funding providers and potential solutions.",
      "A focus on your trading cycle and working capital needs.",
      "Support in understanding the commercial considerations before proceeding.",
    ],
    ctaHeading: "Unlock More Flexibility in Your Cash Flow",
    ctaCopy: "Discuss your supplier payment cycle and explore potential funding options.",
    ctaLabel: "Discuss Funding Options",
    note: "Funding is subject to provider eligibility, credit assessment, approval and applicable terms.",
  },
];

const difference: [IconType, string, string][] = [
  [GitCompareArrows, "Provider Choice", "Connect with a range of FX providers to explore suitable pricing and solutions."],
  [Compass, "Independent Guidance", "Make better-informed decisions with practical advice aligned to your business."],
  [ChartNoAxesCombined, "Greater Visibility", "Bring greater clarity to currency exposures, transaction pricing and FX decisions."],
  [Workflow, "Simplified Processes", "Reduce complexity across your FX workflows with a more coordinated approach."],
];

const steps: [string, string][] = [
  ["Understand your requirements", "We discuss your business, international flows, exposures and commercial objectives."],
  ["Explore the options", "We identify relevant solutions and available providers based on your requirements."],
  ["Compare and decide", "Review pricing, structures, benefits and risks before deciding how to proceed."],
  ["Connect and implement", "Where appropriate, we facilitate introductions and support the process with the selected provider."],
];

function SolutionCard({ solution }: { solution: Solution }) {
  const { id, index, icon: Icon, title, cardCopy } = solution;
  return <a href={`#${id}`} className="group flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid={`solutions-card-${id}`}>
    <div className="flex items-center justify-between">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F] transition-colors duration-300 group-hover:bg-[#2D6A4F] group-hover:text-white"><Icon size={23} /></span>
      <span className="text-sm font-bold text-[#8AA79B]">{index}</span>
    </div>
    <h3 className="mt-6 text-xl font-bold tracking-[-0.02em]">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-[#4A5A55]">{cardCopy}</p>
    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[#2D6A4F]">Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
  </a>;
}

function SolutionDetail({ solution, flip }: { solution: Solution; flip: boolean }) {
  const { id, index, icon: Icon, title, subtitle, intro, capabilities, why, ctaHeading, ctaCopy, ctaLabel, note } = solution;
  return <section id={id} className={`scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28 ${flip ? "bg-white" : "bg-[#F5F7F6]"}`} data-testid={`solutions-detail-${id}`}>
    <div className="mx-auto max-w-7xl">
      <Reveal from="left">
        <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#12261F] text-[#A8C5BA]"><Icon size={26} /></span><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#52796F]">Solution {index}</span></div>
        <h2 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid={`solutions-detail-heading-${id}`}>{title}</h2>
        <p className="mt-4 max-w-2xl text-xl font-bold text-[#2D6A4F]">{subtitle}</p>
        <div className="mt-5 max-w-3xl space-y-4 text-lg leading-8 text-[#4A5A55]">{intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </Reveal>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <Reveal from="left">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Key capabilities</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{capabilities.map((item) => <div key={item.title} className="rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid={`solutions-capability-${id}`}><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#4A5A55]">{item.copy}</p></div>)}</div>
        </Reveal>
        <Reveal from="right" delay={0.1} className="h-full">
          <div className="flex h-full flex-col rounded-[2rem] bg-[#12261F] p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A8C5BA]">Why SwitchYard?</p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/75">{why.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#A8C5BA]" />{item}</li>)}</ul>
          </div>
        </Reveal>
      </div>
      <Reveal from="bottom" className="mt-10">
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] bg-[#E8EEEB] p-8 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl" data-testid={`solutions-detail-cta-heading-${id}`}>{ctaHeading}</h3>
            <p className="mt-3 max-w-xl text-[#4A5A55]">{ctaCopy}</p>
            {note && <p className="mt-3 max-w-xl text-xs leading-5 text-[#52796F]">{note}</p>}
          </div>
          <Link to="/contact" className={buttonVariants({ size: "lg" }) + " group shrink-0 rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid={`solutions-detail-cta-${id}`}>{ctaLabel} <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </Reveal>
    </div>
  </section>;
}

export default function Solutions() { return <>
  <section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-28" data-testid="solutions-hero"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Solutions</SectionLabel><h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl" data-testid="solutions-page-heading">Global FX.<br /><span className="text-[#A8C5BA]">Greater Control.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60" data-testid="solutions-page-copy">Bring your global payments, currency risk and funding requirements together with a smarter approach to FX.</p><p className="mt-4 max-w-2xl text-lg leading-8 text-white/45">SwitchYard connects businesses with tailored FX solutions, specialist guidance and access to multiple providers — helping you make more informed decisions with greater clarity and control.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#solution-areas" className={buttonVariants({ size: "lg" }) + " group rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="solutions-explore-button">Explore Our Solutions <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></a><Link to="/contact" className={buttonVariants({ variant: "outline", size: "lg" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="solutions-talk-button">Talk to Our Team</Link></div></Reveal></div></section>

  <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="solutions-intro-section"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><Reveal from="left"><SectionLabel>One partner</SectionLabel><h2 className="max-w-xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="solutions-intro-heading">One Partner. A Smarter Approach to FX.</h2></Reveal><Reveal from="right" delay={0.1} className="space-y-5 text-lg leading-8 text-[#4A5A55]" data-testid="solutions-intro-copy"><p>Every business has different currency exposures, payment requirements and cash flow priorities. SwitchYard brings together the expertise, providers and solutions to help you manage them with confidence.</p><p>From everyday international payments to tailored hedging and funding options, we help simplify complexity and connect your FX strategy to the way your business operates.</p></Reveal></div></section>

  <section id="solution-areas" className="scroll-mt-24 bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-28" data-testid="solutions-cards-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Our solutions</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="solutions-cards-heading">Solutions Built Around Your Business.</h2></Reveal><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{solutions.map((solution, index) => <Reveal key={solution.id} from="scale" delay={index * 0.06} className="h-full"><SolutionCard solution={solution} /></Reveal>)}</div></div></section>

  {solutions.map((solution, index) => <SolutionDetail key={solution.id} solution={solution} flip={index % 2 === 1} />)}

  <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="solutions-difference-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>The SwitchYard difference</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="solutions-difference-heading">Why businesses choose SwitchYard.</h2></Reveal><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{difference.map(([Icon, title, copy], index) => <Reveal key={title} from="scale" delay={index * 0.06} className="h-full"><div className="h-full rounded-2xl border border-[#DCE5E1] bg-[#F5F7F6] p-7" data-testid={`solutions-difference-${index + 1}`}><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Icon size={23} /></span><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{copy}</p></div></Reveal>)}</div></div></section>

  <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-24" data-testid="solutions-process-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>How it works</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="solutions-process-heading">From first conversation to implementation.</h2></Reveal><ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, copy], index) => <Reveal key={title} from="bottom" delay={index * 0.06} className="h-full"><li className="h-full rounded-2xl border border-[#DCE5E1] bg-white p-7" data-testid={`solutions-step-${index + 1}`}><span className="text-xs font-bold text-[#52796F]">Step 0{index + 1}</span><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{copy}</p></li></Reveal>)}</ol></div></section>

  <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="solutions-cta-section"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[2rem] bg-[#12261F] p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div><SectionLabel>Let’s work together</SectionLabel><h2 className="mt-2 max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="solutions-cta-heading">Let’s Make FX Work Better for Your Business.</h2><p className="mt-4 max-w-xl text-white/60">From international payments to hedging and working capital, SwitchYard helps you navigate your options with greater clarity and control.</p></div><Link to="/contact" className={buttonVariants({ size: "lg" }) + " group shrink-0 rounded-full bg-[#A8C5BA] text-[#12261F] hover:bg-white"} data-testid="solutions-cta-button">Talk to SwitchYard <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link></div></section>
</>; }
