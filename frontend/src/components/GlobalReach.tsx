import type { CSSProperties } from "react";
import { HandCoins, Landmark, Send, ShieldCheck } from "lucide-react";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { Reveal, SectionLabel } from "@/components/SiteShell";

// Approved-country list for the globe. Configurable in one place: add or remove an ISO 3166-1
// alpha-2 code and the flags, markers and corridors update together. Kept deliberately short and
// globally spread so the pinned flags do not crowd into a cluttered ball. Sanctioned and restricted
// jurisdictions (Russia, Belarus, Iran, North Korea, Syria, Cuba, Venezuela, Myanmar) are
// intentionally absent — do NOT add a code here without compliance sign-off.
const APPROVED_COUNTRIES: Array<{ code: string; label: string; confirm?: boolean }> = [
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "MX", label: "Mexico" },
  { code: "BR", label: "Brazil" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "EG", label: "Egypt" },
  { code: "ZA", label: "South Africa" },
  { code: "NG", label: "Nigeria" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "CN", label: "China (Mainland)", confirm: true },
  { code: "JP", label: "Japan" },
];

const MARKERS: FlagGlobeMarker[] = APPROVED_COUNTRIES.map(({ code }) => ({ code }));

// Dotted great-circle corridors drawn between pinned flags. Australia is the hub; a pair is only
// drawn when both endpoints are approved markers, and only while the whole arc faces the viewer.
const CONNECTIONS: Array<[string, string]> = [
  ["AU", "US"], ["AU", "GB"], ["AU", "DE"], ["AU", "JP"], ["AU", "SG"], ["AU", "NZ"],
  ["AU", "CN"], ["AU", "IN"], ["AU", "AE"],
];

// Jurisdictions flagged for review. They stay on the globe only as an approved-listing decision;
// route them live only after the client confirms the compliance position.
const CONFIRM_COUNTRIES = APPROVED_COUNTRIES.filter((country) => country.confirm).map((country) => country.label);

const SERVICES = [
  [Send, "International Payments", "Simplify cross-border payments with competitive execution, multiple providers and transparent pricing."],
  [Landmark, "Collections & Receivables", "Manage international receipts and multi-currency exposures with greater visibility, streamlined reconciliation and reduced FX costs."],
  [ShieldCheck, "Hedging & Risk Management", "Protect margins with tailored forwards, options and structured hedging strategies aligned to your exposures and risk appetite."],
  [HandCoins, "Trade Finance & Funding", "Access funding solutions supporting international purchasing, working capital and business growth."],
] as const;

// Rotation that turns Australia toward the viewer on first paint.
const FACE_AUSTRALIA = 2.4;

// The globe reads the shadcn theme tokens, so this dark section re-scopes them to the brand.
const darkTokens = {
  "--background": "#12261F",
  "--foreground": "#F5F7F6",
  "--primary": "#A8C5BA",
  "--muted": "#1C382E",
  "--muted-foreground": "#A8C5BA",
  "--border": "rgba(255,255,255,.12)",
  "--ring": "#A8C5BA",
} as CSSProperties;

export default function GlobalReach() {
  return <section className="relative overflow-hidden bg-[#12261F] px-5 py-14 text-white lg:px-8 lg:py-20" style={darkTokens} data-testid="global-reach-section">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(82,121,111,.28),transparent_45%)]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
      <Reveal from="left">
        <SectionLabel>Global Reach</SectionLabel>
        <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl" data-testid="global-reach-heading">Solutions Enabling <span className="text-[#A8C5BA]">Global Trade</span></h2>
        <p className="mt-6 max-w-lg text-lg leading-8 text-white/60" data-testid="global-reach-description">From international payments to hedging and funding, SwitchYard FX brings greater clarity, control and efficiency to your global FX requirements.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">{SERVICES.map(([Icon, title, copy], index) => <div key={title} className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm" data-testid={`global-service-card-${index + 1}`}><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#A8C5BA]/10 text-[#A8C5BA]"><Icon size={19} /></div><h3 className="mt-4 text-base font-bold" data-testid={`global-service-title-${index + 1}`}>{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{copy}</p></div>)}</div>
      </Reveal>

      <Reveal from="scale" delay={0.1} className="flex justify-center">
        <div className="w-full max-w-[560px]">
          <FlagGlobe
            markers={MARKERS}
            connections={CONNECTIONS}
            dark
            phi={FACE_AUSTRALIA}
            altitude={0.2}
            rotationSpeed={0.16}
            baseColor="#1f4a3a"
            glowColor="#52796F"
            markerDots
            style={{ width: "min(560px, 100%)" }}
            data-testid="global-reach-globe"
          />
          <p className="mt-5 text-center text-xs leading-5 text-white/40" data-testid="global-reach-compliance">Indicative corridors between approved markets; sanctioned jurisdictions are excluded. {CONFIRM_COUNTRIES.join(" and ")} routes require client confirmation.</p>
        </div>
      </Reveal>
    </div>
  </section>;
}
