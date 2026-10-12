import type { CSSProperties } from "react";
import { HandCoins, Landmark, Send, ShieldCheck } from "lucide-react";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { Reveal, SectionLabel } from "@/components/SiteShell";

// Approved-country list for the globe: every UN member state plus Hong Kong, minus the
// jurisdictions below. Configurable in one place: add or remove an ISO 3166-1 alpha-2 code and
// the flag and its marker update together (coordinates and names are built into FlagGlobe).
const APPROVED_COUNTRIES = [
  "AD", "AE", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN",
  "BO", "BR", "BS", "BT", "BW", "BZ", "CA", "CG", "CH", "CI", "CL", "CM", "CN", "CO", "CR", "CV", "CY", "CZ", "DE", "DJ",
  "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES", "ET", "FI", "FJ", "FM", "FR", "GA", "GB", "GD", "GE", "GH", "GM", "GN",
  "GQ", "GR", "GT", "GW", "GY", "HK", "HN", "HR", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JM", "JO", "JP", "KE", "KG",
  "KH", "KI", "KM", "KN", "KR", "KW", "KZ", "LA", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "MA", "MC", "MD", "ME",
  "MG", "MH", "MK", "MN", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NL", "NO", "NP", "NR", "NZ",
  "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PT", "PW", "PY", "QA", "RO", "RS", "RW", "SA", "SB", "SC", "SE", "SG", "SI",
  "SK", "SL", "SM", "SN", "SR", "ST", "SV", "SZ", "TD", "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TZ",
  "UA", "UG", "US", "UY", "UZ", "VC", "VN", "VU", "WS", "ZA", "ZM",
];

// Never shown, whatever is added above: countries under comprehensive or UN/Australian sanctions
// regimes and other high-risk jurisdictions. Do NOT remove a code here without compliance sign-off.
const EXCLUDED_COUNTRIES = new Set([
  "AF", "BY", "CD", "CF", "CU", "ER", "HT", "IQ", "IR", "KP", "LB", "LY", "ML", "MM", "NI", "RU", "SD", "SO", "SS", "SY",
  "VE", "YE", "ZW",
]);

const MARKERS: FlagGlobeMarker[] = APPROVED_COUNTRIES.filter((code) => !EXCLUDED_COUNTRIES.has(code)).map((code) => ({ code }));

// Dotted great-circle corridors drawn between pinned flags. Australia is the hub; a pair is only
// drawn when both endpoints are approved markers, and only while the whole arc faces the viewer.
const CONNECTIONS: Array<[string, string]> = [
  ["AU", "US"], ["AU", "GB"], ["AU", "DE"], ["AU", "JP"], ["AU", "SG"], ["AU", "NZ"],
  ["AU", "CN"], ["AU", "IN"], ["AU", "AE"], ["AU", "HK"], ["AU", "KR"], ["AU", "ID"],
  ["AU", "ZA"], ["AU", "CA"], ["AU", "BR"], ["AU", "FR"], ["AU", "VN"], ["AU", "TH"],
];

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
            flagScale={0.032}
            style={{ width: "min(560px, 100%)" }}
            data-testid="global-reach-globe"
          />
          <p className="mt-5 text-center text-xs leading-5 text-white/40" data-testid="global-reach-compliance">Indicative corridors between approved markets; sanctioned jurisdictions are excluded.</p>
        </div>
      </Reveal>
    </div>
  </section>;
}
