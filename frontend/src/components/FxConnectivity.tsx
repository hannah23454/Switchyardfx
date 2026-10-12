import { motion, useReducedMotion, type Variants } from "motion/react";
import { CircleDollarSign, Globe2, Layers3, LineChart, ShieldCheck } from "lucide-react";
import { BRAND_MARK_PATH } from "@/components/BrandMark";

// The hero visual: an on-brand picture of corporate FX connectivity — AUD at the base,
// SwitchYard at the centre, and money moving out along live corridors to the major currencies.
// It draws with the site palette (no stock photography), animates once on load, and falls back
// to a static composition under reduced motion. A live platform view returns with the client portal.
const SAGE = "#A8C5BA";
const GRID = "rgba(255,255,255,.06)";
const EASE = [0.22, 1, 0.36, 1] as const;

const SOLUTIONS = [
  [ShieldCheck, "Forwards"],
  [Layers3, "Options"],
  [CircleDollarSign, "Payments"],
  [LineChart, "Treasury"],
] as const;

const HUB = { x: 258, y: 158 };
type Node = { code: string; x: number; y: number; r: number; base?: boolean };
const NODES: Node[] = [
  { code: "AUD", x: 58, y: 158, r: 34, base: true },
  { code: "USD", x: 448, y: 62, r: 24 },
  { code: "EUR", x: 478, y: 158, r: 24 },
  { code: "GBP", x: 448, y: 254, r: 24 },
  { code: "JPY", x: 258, y: 34, r: 24 },
];

const corridor = ({ x, y }: Node) => `M${HUB.x} ${HUB.y} Q ${(HUB.x + x) / 2} ${y} ${x} ${y}`;

const fade = (delay = 0, duration = 0.6): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delay, duration, ease: EASE } },
});
const pop = (delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1, transition: { delay, type: "spring", stiffness: 320, damping: 20 } },
});

export default function FxConnectivity() {
  const reducedMotion = useReducedMotion();

  return <motion.div
    className="relative z-10 mx-auto w-full min-w-0 max-w-[40.625rem] py-6 lg:py-0"
    initial={reducedMotion ? false : { opacity: 0, scale: 0.96, x: 24 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
    data-testid="hero-connectivity-card"
  >
    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#173229]/90 p-5 shadow-[0_35px_90px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,197,186,.18),transparent_36%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.625rem] font-bold tracking-[0.18em] text-[#A8C5BA]"><Globe2 size={14} /> CORPORATE FX CONNECTIVITY</div>
          <p className="mt-2 text-sm text-white/45">One partner moving money across borders</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#A8C5BA]/25 bg-[#A8C5BA]/10 px-3 py-2 text-[0.625rem] font-bold text-[#A8C5BA]" data-testid="hero-connectivity-badge"><span className="h-1.5 w-1.5 rounded-full bg-[#A8C5BA]" /> AUD BASE · GLOBAL</div>
      </div>

      <motion.svg
        viewBox="0 0 520 300"
        className="relative mt-2 h-auto w-full"
        role="img"
        aria-label="Currency connectivity linking AUD through SwitchYard FX to USD, EUR, GBP and JPY"
        initial={reducedMotion ? false : "hidden"}
        animate="show"
      >
        <defs>
          <radialGradient id="fx-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SAGE} stopOpacity=".32" />
            <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g stroke={GRID} strokeWidth="1" variants={fade(0, 0.5)}>
          {[80, 158, 236].map((y) => <line key={`h${y}`} x1="24" x2="496" y1={y} y2={y} />)}
          {[140, 258, 376].map((x) => <line key={`v${x}`} x1={x} x2={x} y1="24" y2="276" />)}
        </motion.g>

        <motion.g fill="none" variants={fade(0.05, 0.5)}>
          {[70, 108, 146].map((r) => <circle key={r} cx={HUB.x} cy={HUB.y} r={r} stroke={SAGE} strokeOpacity={0.14 - (r - 70) / 700} />)}
        </motion.g>

        {NODES.map((node, index) => <motion.path
          key={`c-${node.code}`}
          d={corridor(node)}
          className="flow-dash"
          fill="none"
          stroke={SAGE}
          strokeOpacity={node.base ? 0.8 : 0.5}
          strokeWidth={node.base ? 2.5 : 2}
          strokeLinecap="round"
          strokeDasharray={node.base ? "3 7" : "2 8"}
          variants={fade(0.25 + index * 0.08, 0.6)}
        />)}

        <circle cx={HUB.x} cy={HUB.y} r="96" fill="url(#fx-hub-glow)" />

        <motion.g style={{ transformBox: "fill-box", transformOrigin: "center" }} variants={pop(0.15)}>
          <rect x={HUB.x - 40} y={HUB.y - 40} width="80" height="80" rx="24" fill={SAGE} />
          <g transform={`translate(${HUB.x - 12.8} ${HUB.y - 21}) scale(0.0378)`}>
            <path d={BRAND_MARK_PATH} fill="#12261F" fillRule="evenodd" />
          </g>
        </motion.g>

        {NODES.map(({ code, x, y, r, base }, index) => <motion.g key={code} style={{ transformBox: "fill-box", transformOrigin: "center" }} variants={pop(base ? 0.2 : 0.4 + index * 0.09)}>
          <circle cx={x} cy={y} r={r} fill={base ? "#2D6A4F" : "#1C382E"} stroke={SAGE} strokeOpacity={base ? 0.95 : 0.4} strokeWidth={base ? 2.5 : 1.5} />
          <text x={x} y={y + (base ? 5 : 4)} textAnchor="middle" fill="#FFFFFF" className={base ? "text-[1.0625rem] sm:text-[0.875rem]" : "text-[0.9375rem] sm:text-[0.75rem]"} fontWeight={700} letterSpacing=".04em">{code}</text>
        </motion.g>)}
      </motion.svg>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {SOLUTIONS.map(([Icon, label]) => <span key={label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/75" data-testid={`hero-solution-${label.toLowerCase()}`}><Icon size={14} className="text-[#A8C5BA]" />{label}</span>)}
      </div>
      <p className="relative mt-4 text-[0.6875rem] text-white/40" data-testid="hero-connectivity-caption">Treasury, hedging and payments on one rail · same-day or T+1 settlement</p>
    </div>
  </motion.div>;
}
