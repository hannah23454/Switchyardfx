import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, BadgeCheck, Coins, Gift, LockKeyhole, LogOut, ShieldCheck, Sparkles, Upload, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import {
  ADMIN_CREDENTIALS, REWARDS, adminSignIn, approveRedemption, approveUser, approveVoucher, currentUser, pendingRedemptions, pendingVouchers,
  pointsFor, register, rejectRedemption, rejectUser, rejectVoucher, resetDemo, signIn, signOut, submitRedemption, submitVoucher, useRewards,
} from "@/lib/rewards";

const inputClass = "w-full rounded-xl border border-[#DCE5E1] bg-white px-4 py-3 text-sm text-[#12261F] outline-none transition-colors focus:border-[#2D6A4F]";
const points = (value: number) => value.toLocaleString("en-AU");

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = status === "approved" ? "bg-[#E3F1E9] text-[#2D6A4F]" : status === "rejected" ? "bg-[#F6E7E4] text-[#9B3B2E]" : "bg-[#FBEFD9] text-[#8A5A12]";
  return <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${styles}`} data-testid={`rewards-status-${status}`}>{status}</span>;
}

function Message({ tone, children }: { tone: "error" | "success"; children: string }) {
  return <p className={`rounded-xl px-4 py-3 text-sm ${tone === "error" ? "bg-[#F6E7E4] text-[#9B3B2E]" : "bg-[#E3F1E9] text-[#2D6A4F]"}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

function Landing() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [adminMode, setAdminMode] = useState(false);
  return <>
    <section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-28" data-testid="rewards-hero"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><Reveal from="left"><SectionLabel>SwitchYard Rewards</SectionLabel><h1 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl" data-testid="rewards-heading">Earn more from<br /><span className="text-[#A8C5BA]">every FX decision.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/60" data-testid="rewards-copy">SwitchYard Rewards turns your FX activity into points — redeemable against vouchers, insights and advisory. Track your balance, upload vouchers and request rewards from one place.</p><div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">{["Points on FX activity", "Upload proof-of-activity vouchers", "Redeem for vouchers & advisory"].map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><BadgeCheck size={15} className="text-[#A8C5BA]" />{item}</span>)}</div></Reveal><Reveal from="right" delay={0.1}><AuthCard tab={tab} setTab={setTab} adminMode={adminMode} setAdminMode={setAdminMode} /></Reveal></div></section>

    <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="rewards-how-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>How it works</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-how-heading">Three steps to your next reward.</h2></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-3">{[["Earn points", "Accrue points as you transact and engage with SwitchYard. Your balance updates as activity is confirmed.", Coins], ["Upload & verify", "Upload a points voucher for your activity. SwitchYard validates each voucher before points are credited.", Upload], ["Request a reward", "Spend vested points on vouchers, FX insights, advisory or a charity donation — then we confirm it.", Gift]].map(([title, copy, Icon], index) => <Reveal key={title as string} from="bottom" delay={index * 0.06} className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Icon size={23} /></span><span className="mt-6 block text-xs font-bold text-[#8AA79B]">Step 0{index + 1}</span><h3 className="mt-2 text-xl font-bold">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{copy as string}</p></div></Reveal>)}</div></div></section>

    <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-24" data-testid="rewards-catalogue-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Where you can spend</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-catalogue-heading">Rewards worth working toward.</h2></Reveal><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{REWARDS.map((reward, index) => <Reveal key={reward.id} from="scale" delay={index * 0.05} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-7" data-testid={`rewards-preview-${index + 1}`}><span className="w-fit rounded-full bg-[#E8EEEB] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#52796F]">{reward.category}</span><h3 className="mt-6 text-xl font-bold">{reward.title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{reward.description}</p><p className="mt-auto pt-6 text-sm font-bold text-[#2D6A4F]"><Coins size={15} className="mr-1 inline" />{points(reward.points)} pts</p></div></Reveal>)}</div></div></section>
  </>;
}

function AuthCard({ tab, setTab, adminMode, setAdminMode }: { tab: "signin" | "register"; setTab: (value: "signin" | "register") => void; adminMode: boolean; setAdminMode: (value: boolean) => void }) {
  return <div className="rounded-[2rem] bg-white p-7 text-[#12261F] shadow-[0_24px_60px_rgba(0,0,0,.28)] sm:p-9" data-testid="rewards-auth-card">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#12261F] text-[#A8C5BA]"><LockKeyhole size={20} /></span><div><p className="font-bold">{adminMode ? "SwitchYard staff" : "Member access"}</p><p className="text-xs text-[#52796F]">{adminMode ? "Approval & validation" : "Sign in or apply to join"}</p></div></div>
    {adminMode ? <AdminForm onBack={() => setAdminMode(false)} /> : <>
      <div className="mt-7 grid grid-cols-2 gap-2 rounded-full bg-[#F5F7F6] p-1" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "signin"} onClick={() => setTab("signin")} className={`rounded-full py-2.5 text-sm font-bold transition-colors ${tab === "signin" ? "bg-white text-[#12261F] shadow-sm" : "text-[#4A5A55]"}`} data-testid="rewards-tab-signin">Sign in</button>
        <button type="button" role="tab" aria-selected={tab === "register"} onClick={() => setTab("register")} className={`rounded-full py-2.5 text-sm font-bold transition-colors ${tab === "register" ? "bg-white text-[#12261F] shadow-sm" : "text-[#4A5A55]"}`} data-testid="rewards-tab-register">Create account</button>
      </div>
      {tab === "signin" ? <SignInForm /> : <RegisterForm />}
      <button type="button" onClick={() => setAdminMode(true)} className="mt-6 w-full text-center text-xs font-bold text-[#52796F] hover:text-[#2D6A4F]" data-testid="rewards-admin-toggle">SwitchYard team? Open the approval screen</button>
    </>}
  </div>;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const outcome = signIn(email, password);
    setResult({ ok: outcome.ok, text: outcome.ok ? "Signed in." : outcome.error ?? "" });
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-signin-form">
    <label className="grid gap-1.5 text-sm font-bold">Email<input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com.au" autoComplete="email" data-testid="rewards-signin-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Password<input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" data-testid="rewards-signin-password" /></label>
    {result && !result.ok && <Message tone="error">{result.text}</Message>}
    <button type="submit" className={buttonVariants({ size: "lg" }) + " mt-2 justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="rewards-signin-submit">Sign in <ArrowRight size={17} /></button>
    <p className="text-center text-xs text-[#52796F]">New here? Register and your account will be reviewed by the SwitchYard team.</p>
  </form>;
}

function RegisterForm() {
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const field = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    const outcome = register(form);
    setResult({ ok: outcome.ok, text: outcome.ok ? outcome.message ?? "" : outcome.error ?? "" });
    if (outcome.ok) setForm({ name: "", company: "", email: "", password: "" });
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-register-form">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-bold">Full name<input className={inputClass} value={form.name} onChange={field("name")} placeholder="Jordan Miller" data-testid="rewards-register-name" /></label>
      <label className="grid gap-1.5 text-sm font-bold">Business<input className={inputClass} value={form.company} onChange={field("company")} placeholder="Company Pty Ltd" data-testid="rewards-register-company" /></label>
    </div>
    <label className="grid gap-1.5 text-sm font-bold">Work email<input className={inputClass} type="email" value={form.email} onChange={field("email")} placeholder="you@company.com.au" data-testid="rewards-register-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Choose a password<input className={inputClass} type="password" value={form.password} onChange={field("password")} placeholder="At least 6 characters" data-testid="rewards-register-password" /></label>
    {result && <Message tone={result.ok ? "success" : "error"}>{result.text}</Message>}
    <button type="submit" className={buttonVariants({ size: "lg" }) + " mt-2 justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="rewards-register-submit">Apply to join <UserPlus size={17} /></button>
    <p className="text-center text-xs text-[#52796F]">Applications are validated by SwitchYard before access is granted.</p>
  </form>;
}

function AdminForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const outcome = adminSignIn(email, password);
    setError(outcome.ok ? "" : outcome.error ?? "");
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-admin-form">
    <label className="grid gap-1.5 text-sm font-bold">Staff email<input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ADMIN_CREDENTIALS.email} data-testid="rewards-admin-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Staff password<input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="rewards-admin-password" /></label>
    {error && <Message tone="error">{error}</Message>}
    <p className="rounded-xl bg-[#F5F7F6] px-4 py-3 text-xs text-[#4A5A55]">Demo credentials — email <b>{ADMIN_CREDENTIALS.email}</b>, password <b>{ADMIN_CREDENTIALS.password}</b>.</p>
    <button type="submit" className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#12261F] text-white hover:bg-[#1c3a30]"} data-testid="rewards-admin-submit">Open approval screen <ShieldCheck size={17} /></button>
    <button type="button" onClick={onBack} className="text-center text-xs font-bold text-[#52796F] hover:text-[#2D6A4F]">Back to member sign in</button>
  </form>;
}

function Dashboard() {
  const db = useRewards();
  const user = currentUser(db);
  const [selected, setSelected] = useState(REWARDS[0]);
  const [redemptionNote, setRedemptionNote] = useState("");
  const [voucherForm, setVoucherForm] = useState({ fileName: "", note: "", claimedPoints: "" });
  const [redemptionResult, setRedemptionResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [voucherResult, setVoucherResult] = useState<{ ok: boolean; text: string } | null>(null);
  const requestRef = useRef<HTMLDivElement>(null);
  if (!user) return null;
  const summary = pointsFor(user);

  function requestReward(event: FormEvent) {
    event.preventDefault();
    const outcome = submitRedemption(user!.email, selected, redemptionNote);
    setRedemptionResult({ ok: outcome.ok, text: outcome.ok ? outcome.message ?? "" : outcome.error ?? "" });
    if (outcome.ok) setRedemptionNote("");
  }
  function uploadVoucher(event: FormEvent) {
    event.preventDefault();
    const outcome = submitVoucher(user!.email, { fileName: voucherForm.fileName, note: voucherForm.note, claimedPoints: Number(voucherForm.claimedPoints) });
    setVoucherResult({ ok: outcome.ok, text: outcome.ok ? outcome.message ?? "" : outcome.error ?? "" });
    if (outcome.ok) setVoucherForm({ fileName: "", note: "", claimedPoints: "" });
  }

  return <div className="bg-[#F5F7F6]" data-testid="rewards-dashboard">
    <section className="bg-[#12261F] px-5 pb-32 pt-20 text-white lg:px-8 lg:pt-24"><div className="mx-auto max-w-7xl"><Reveal from="top"><div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8C5BA]">SwitchYard Rewards</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-dashboard-heading">Welcome back, {user.name.split(" ")[0]}.</h1><p className="mt-3 text-white/60">{user.company} · {user.email}</p></div><button type="button" onClick={() => signOut()} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="rewards-signout"><LogOut size={15} /> Sign out</button></div></Reveal></div></section>

    <section className="px-5 lg:px-8" data-testid="rewards-tally-section"><div className="mx-auto -mt-24 max-w-5xl"><div className="grid gap-5 sm:grid-cols-3">
      <Reveal from="bottom" className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_18px_44px_rgba(18,38,31,.1)]" data-testid="rewards-points-accrued"><div className="flex items-center gap-2 text-[#52796F]"><Coins size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Points accrued</span></div><p className="mt-4 text-4xl font-bold tracking-[-0.03em]">{points(summary.accrued)}</p><p className="mt-1 text-sm text-[#4A5A55]">Lifetime points earned</p></div></Reveal>
      <Reveal from="bottom" delay={0.06} className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_18px_44px_rgba(18,38,31,.1)]" data-testid="rewards-points-vested"><div className="flex items-center gap-2 text-[#52796F]"><Gift size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Points vested</span></div><p className="mt-4 text-4xl font-bold tracking-[-0.03em]">{points(summary.vested)}</p><p className="mt-1 text-sm text-[#4A5A55]">Available to redeem</p></div></Reveal>
      <Reveal from="bottom" delay={0.12} className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_18px_44px_rgba(18,38,31,.1)]" data-testid="rewards-points-redeemed"><div className="flex items-center gap-2 text-[#52796F]"><Sparkles size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Redeemed & pending</span></div><p className="mt-4 text-4xl font-bold tracking-[-0.03em]">{points(summary.redeemed)}</p><p className="mt-1 text-sm text-[#4A5A55]">{summary.pendingRedemptions} request(s) waiting · {summary.pendingVouchers} voucher(s) in review</p></div></Reveal>
    </div></div></section>

    <section className="px-5 py-16 lg:px-8" data-testid="rewards-spend-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Where to spend</SectionLabel><h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl" data-testid="rewards-spend-heading">Choose your reward.</h2></Reveal><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{REWARDS.map((reward, index) => { const affordable = summary.vested >= reward.points; return <Reveal key={reward.id} from="scale" delay={index * 0.04} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-7" data-testid={`rewards-reward-${index + 1}`}><span className="w-fit rounded-full bg-[#E8EEEB] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#52796F]">{reward.category}</span><h3 className="mt-6 text-xl font-bold">{reward.title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{reward.description}</p><p className="mt-4 text-sm font-bold text-[#2D6A4F]">{points(reward.points)} pts</p><button type="button" disabled={!affordable} onClick={() => { setSelected(reward); setRedemptionResult(null); requestRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className={buttonVariants({ variant: affordable ? "default" : "outline", size: "sm" }) + ` mt-auto w-fit rounded-full ${affordable ? "bg-[#2D6A4F] text-white hover:bg-[#3d8163]" : "cursor-not-allowed border-[#DCE5E1] text-[#8AA79B]"}`} data-testid={`rewards-reward-request-${index + 1}`}>{affordable ? "Request reward" : "Not enough points"}</button></div></Reveal>; })}</div></div></section>

    <section className="bg-white px-5 py-20 lg:px-8" data-testid="rewards-forms-section"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
      <Reveal from="left" className="h-full"><div ref={requestRef} className="flex h-full scroll-mt-28 flex-col rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8" data-testid="rewards-request-panel"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Gift size={20} /></span><h2 className="text-2xl font-bold" data-testid="rewards-request-heading">Request a voucher</h2></div><form className="mt-6 grid gap-3" onSubmit={requestReward} data-testid="rewards-request-form">
        <label className="grid gap-1.5 text-sm font-bold">Reward<select className={inputClass} value={selected.id} onChange={(e) => setSelected(REWARDS.find((r) => r.id === e.target.value) ?? REWARDS[0])} data-testid="rewards-request-reward">{REWARDS.map((reward) => <option key={reward.id} value={reward.id} disabled={summary.vested < reward.points}>{reward.title} — {points(reward.points)} pts</option>)}</select></label>
        <label className="grid gap-1.5 text-sm font-bold">Note (optional)<textarea className={inputClass + " min-h-24 resize-y"} value={redemptionNote} onChange={(e) => setRedemptionNote(e.target.value)} placeholder="Anything we should know about this request?" data-testid="rewards-request-note" /></label>
        <p className="text-xs text-[#52796F]">This reward costs <b>{points(selected.points)}</b> points. You have <b>{points(summary.vested)}</b> vested.</p>
        {redemptionResult && <Message tone={redemptionResult.ok ? "success" : "error"}>{redemptionResult.text}</Message>}
        <button type="submit" disabled={summary.vested < selected.points} className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163] disabled:opacity-50"} data-testid="rewards-request-submit">Submit request <ArrowRight size={17} /></button>
      </form></div></Reveal>

      <Reveal from="right" delay={0.1} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8" data-testid="rewards-upload-panel"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Upload size={20} /></span><h2 className="text-2xl font-bold" data-testid="rewards-upload-heading">Upload a points voucher</h2></div><form className="mt-6 grid gap-3" onSubmit={uploadVoucher} data-testid="rewards-upload-form">
        <label className="grid gap-1.5 text-sm font-bold">Voucher file<input className={inputClass} type="file" onChange={(e) => setVoucherForm((c) => ({ ...c, fileName: e.target.files?.[0]?.name ?? "" }))} data-testid="rewards-upload-file" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Points value<input className={inputClass} type="number" min="1" value={voucherForm.claimedPoints} onChange={(e) => setVoucherForm((c) => ({ ...c, claimedPoints: e.target.value }))} placeholder="e.g. 4200" data-testid="rewards-upload-points" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Note (optional)<textarea className={inputClass + " min-h-20 resize-y"} value={voucherForm.note} onChange={(e) => setVoucherForm((c) => ({ ...c, note: e.target.value }))} placeholder="Reference, period or activity" data-testid="rewards-upload-note" /></label>
        {voucherResult && <Message tone={voucherResult.ok ? "success" : "error"}>{voucherResult.text}</Message>}
        <button type="submit" className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#12261F] text-white hover:bg-[#1c3a30]"} data-testid="rewards-upload-submit">Upload for validation <Upload size={17} /></button>
        <p className="text-xs text-[#52796F]">Files aren’t stored in this prototype — only the details are recorded so SwitchYard can validate your points.</p>
      </form></div></Reveal>
    </div></section>

    <section className="px-5 pb-24 lg:px-8" data-testid="rewards-activity-section"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold" data-testid="rewards-activity-heading">Your activity</h2><div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Voucher uploads</p><div className="mt-3 grid gap-3">{user.vouchers.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] p-5 text-sm text-[#4A5A55]">No vouchers uploaded yet.</p> : user.vouchers.map((voucher) => <div key={voucher.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-5" data-testid="rewards-activity-voucher"><div><p className="font-bold">{voucher.fileName}</p><p className="mt-1 text-sm text-[#4A5A55]">{points(voucher.claimedPoints)} pts · {new Date(voucher.createdAt).toLocaleDateString("en-AU")}</p>{voucher.note && <p className="mt-1 text-xs text-[#52796F]">{voucher.note}</p>}</div><StatusBadge status={voucher.status} /></div>)}</div></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Voucher requests</p><div className="mt-3 grid gap-3">{user.redemptions.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] p-5 text-sm text-[#4A5A55]">No requests yet.</p> : user.redemptions.map((redemption) => <div key={redemption.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-5" data-testid="rewards-activity-request"><div><p className="font-bold">{redemption.rewardTitle}</p><p className="mt-1 text-sm text-[#4A5A55]">{points(redemption.points)} pts · {new Date(redemption.createdAt).toLocaleDateString("en-AU")}</p>{redemption.note && <p className="mt-1 text-xs text-[#52796F]">{redemption.note}</p>}</div><StatusBadge status={redemption.status} /></div>)}</div></div>
    </div></div></section>
  </div>;
}

function AdminDashboard() {
  const db = useRewards();
  const registrations = db.users.filter((user) => user.status === "pending");
  const vouchers = pendingVouchers(db);
  const redemptions = pendingRedemptions(db);
  return <div className="min-h-[70svh] bg-[#F5F7F6] pb-24" data-testid="rewards-admin">
    <section className="bg-[#12261F] px-5 pb-16 pt-28 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8C5BA]">SwitchYard staff</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-admin-heading">Approvals & validation.</h1><p className="mt-3 text-white/60">Review member registrations, uploaded vouchers and reward requests.</p></div><div className="flex gap-2"><button type="button" onClick={() => resetDemo()} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="rewards-admin-reset">Reset demo data</button><button type="button" onClick={() => signOut()} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#A8C5BA] text-[#12261F] hover:bg-white"} data-testid="rewards-admin-signout"><LogOut size={15} /> Sign out</button></div></div></div></section>

    <section className="px-5 pt-14 lg:px-8" data-testid="rewards-admin-registrations"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Pending registrations</h2><div className="mt-4 grid gap-3">{registrations.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] bg-white p-6 text-sm text-[#4A5A55]">No registrations awaiting approval.</p> : registrations.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-registration"><div><p className="font-bold">{user.name} · {user.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{user.email} · applied {new Date(user.createdAt).toLocaleDateString("en-AU")}</p></div><div className="flex gap-2"><button type="button" onClick={() => approveUser(user.id)} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="rewards-approve-user">Approve</button><button type="button" onClick={() => rejectUser(user.id)} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} data-testid="rewards-reject-user">Reject</button></div></div>)}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-vouchers"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Voucher uploads to validate</h2><div className="mt-4 grid gap-3">{vouchers.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] bg-white p-6 text-sm text-[#4A5A55]">No vouchers awaiting validation.</p> : vouchers.map(({ user, voucher }) => <div key={voucher.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-voucher"><div><p className="font-bold">{user.name} · {user.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{voucher.fileName} · {points(voucher.claimedPoints)} pts{voucher.note ? ` · ${voucher.note}` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={() => approveVoucher(user.email, voucher.id)} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="rewards-approve-voucher">Credit points</button><button type="button" onClick={() => rejectVoucher(user.email, voucher.id)} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} data-testid="rewards-reject-voucher">Reject</button></div></div>)}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-redemptions"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Reward requests to confirm</h2><div className="mt-4 grid gap-3">{redemptions.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] bg-white p-6 text-sm text-[#4A5A55]">No reward requests awaiting confirmation.</p> : redemptions.map(({ user, redemption }) => <div key={redemption.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-redemption"><div><p className="font-bold">{user.name} · {user.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{redemption.rewardTitle} · {points(redemption.points)} pts{redemption.note ? ` · ${redemption.note}` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={() => approveRedemption(user.email, redemption.id)} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="rewards-approve-redemption">Confirm</button><button type="button" onClick={() => rejectRedemption(user.email, redemption.id)} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} data-testid="rewards-reject-redemption">Reject</button></div></div>)}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-accounts"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">All accounts</h2><div className="mt-4 overflow-x-auto rounded-2xl border border-[#DCE5E1] bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-[#DCE5E1] text-xs font-bold uppercase tracking-[0.1em] text-[#52796F]"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Accrued</th><th className="px-5 py-4">Vested</th></tr></thead><tbody>{db.users.map((user) => { const summary = pointsFor(user); return <tr key={user.id} className="border-b border-[#F0F3F1] last:border-0" data-testid="rewards-admin-account"><td className="px-5 py-4"><span className="font-bold">{user.name}</span><span className="block text-xs text-[#52796F]">{user.email}</span></td><td className="px-5 py-4">{user.company}</td><td className="px-5 py-4"><StatusBadge status={user.status} /></td><td className="px-5 py-4 font-bold">{points(summary.accrued)}</td><td className="px-5 py-4 font-bold">{points(summary.vested)}</td></tr>; })}</tbody></table></div></div></section>
  </div>;
}

export default function Rewards() {
  const db = useRewards();
  const user = currentUser(db);
  if (db.admin) return <AdminDashboard />;
  if (user) return <Dashboard />;
  return <Landing />;
}
