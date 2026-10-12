// SwitchYard Rewards — a self-contained prototype store.
//
// Everything lives in the browser's localStorage: there is no auth backend yet, so accounts,
// the approval workflow, points and vouchers are all simulated client-side. This file is the
// single source of truth for that state and is deliberately framework-agnostic apart from the
// `useRewards` hook at the bottom. Swap `loadDB`/`persist` for real API calls when a backend
// exists and the page keeps working.
//
// PROTOYPE ONLY: passwords are stored in plain text. Never ship that with a real backend.
import { useSyncExternalStore } from "react";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Reward = { id: string; title: string; description: string; points: number; category: string };

export const REWARDS: Reward[] = [
  { id: "voucher-50", title: "$50 eGift voucher", description: "Redeem against a $50 digital gift voucher.", points: 5000, category: "Vouchers" },
  { id: "voucher-100", title: "$100 eGift voucher", description: "Redeem against a $100 digital gift voucher.", points: 9500, category: "Vouchers" },
  { id: "voucher-250", title: "$250 eGift voucher", description: "Redeem against a $250 digital gift voucher.", points: 22000, category: "Vouchers" },
  { id: "fx-report", title: "Premium FX outlook report", description: "A quarterly FX outlook prepared by our advisory team.", points: 2500, category: "Insights" },
  { id: "treasury-review", title: "Treasury health check", description: "A structured review of your exposure visibility and hedge coverage.", points: 6000, category: "Advisory" },
  { id: "charity-25", title: "$25 charity donation", description: "We donate $25 to a charity of your choice on your behalf.", points: 1000, category: "Give back" },
];

export type Voucher = { id: string; fileName: string; note: string; claimedPoints: number; status: ApprovalStatus; createdAt: string };
export type Redemption = { id: string; rewardId: string; rewardTitle: string; points: number; note: string; status: ApprovalStatus; createdAt: string };
export type RewardsUser = {
  id: string;
  name: string;
  company: string;
  email: string;
  password: string;
  status: ApprovalStatus;
  createdAt: string;
  seedPoints: number;
  vouchers: Voucher[];
  redemptions: Redemption[];
};
export type RewardsDB = { users: RewardsUser[]; sessionEmail: string | null; admin: boolean };

// Demo staff credentials for the in-app approval screen (shown to the user, not secret).
export const ADMIN_CREDENTIALS = { email: "admin@switchyardfx.com.au", password: "switchyard" };
export const WELCOME_POINTS = 12500;

const KEY = "switchyard-rewards-v1";
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const nowISO = () => new Date().toISOString();

export type Points = { accrued: number; vested: number; redeemed: number; pendingVouchers: number; pendingRedemptions: number };

export function pointsFor(user: RewardsUser): Points {
  const approvedVouchers = user.vouchers.filter((v) => v.status === "approved").reduce((sum, v) => sum + v.claimedPoints, 0);
  const accrued = user.seedPoints + approvedVouchers;
  const redeemed = user.redemptions.filter((r) => r.status === "approved").reduce((sum, r) => sum + r.points, 0);
  return {
    accrued,
    vested: Math.max(0, accrued - redeemed),
    redeemed,
    pendingVouchers: user.vouchers.filter((v) => v.status === "pending").length,
    pendingRedemptions: user.redemptions.filter((r) => r.status === "pending").length,
  };
}

export function findUser(db: RewardsDB, email: string): RewardsUser | null {
  const key = email.trim().toLowerCase();
  return db.users.find((user) => user.email.toLowerCase() === key) ?? null;
}

export function currentUser(db: RewardsDB): RewardsUser | null {
  return db.sessionEmail ? findUser(db, db.sessionEmail) : null;
}

function seed(): RewardsDB {
  const created = nowISO();
  const demo: RewardsUser = {
    id: uid(), name: "Jordan Miller", company: "Harbour Freight Co.", email: "demo@switchyardfx.com.au", password: "demo1234",
    status: "approved", createdAt: created, seedPoints: WELCOME_POINTS,
    vouchers: [{ id: uid(), fileName: "freight-fx-activity-oct.pdf", note: "October FX activity voucher", claimedPoints: 4200, status: "pending", createdAt: created }],
    redemptions: [{ id: uid(), rewardId: "fx-report", rewardTitle: "Premium FX outlook report", points: 2500, note: "Please send the Q4 outlook.", status: "approved", createdAt: created }],
  };
  const pending: RewardsUser = {
    id: uid(), name: "Priya Nair", company: "Coastal Imports Pty Ltd", email: "priya@coastalimports.com.au", password: "coastal123",
    status: "pending", createdAt: created, seedPoints: 0, vouchers: [], redemptions: [],
  };
  return { users: [demo, pending], sessionEmail: null, admin: false };
}

function loadDB(): RewardsDB {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as RewardsDB;
  } catch { /* storage unavailable: fall back to an in-memory seed */ }
  return seed();
}

let cache: RewardsDB = loadDB();
const listeners = new Set<() => void>();

function commit(next: RewardsDB): void {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* non-fatal */ }
  for (const listener of listeners) listener();
}

function updateUser(db: RewardsDB, email: string, patch: (user: RewardsUser) => RewardsUser): RewardsDB {
  return { ...db, users: db.users.map((user) => (user.email === email ? patch(user) : user)) };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const getSnapshot = (): RewardsDB => cache;

export type ActionResult = { ok: boolean; error?: string; message?: string };

export function register(input: { name: string; company: string; email: string; password: string }): ActionResult {
  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !company || !email || !input.password) return { ok: false, error: "Please complete every field." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (input.password.length < 6) return { ok: false, error: "Choose a password of at least 6 characters." };
  if (findUser(cache, email)) return { ok: false, error: "An account with that email already exists." };
  const user: RewardsUser = { id: uid(), name, company, email, password: input.password, status: "pending", createdAt: nowISO(), seedPoints: 0, vouchers: [], redemptions: [] };
  commit({ ...cache, users: [...cache.users, user] });
  return { ok: true, message: "Registration received. Your account is pending SwitchYard approval — you'll be able to sign in once it's approved." };
}

export function signIn(email: string, password: string): ActionResult {
  const user = findUser(cache, email);
  if (!user || user.password !== password) return { ok: false, error: "Email or password is incorrect." };
  if (user.status === "pending") return { ok: false, error: "Your account is still pending SwitchYard approval." };
  if (user.status === "rejected") return { ok: false, error: "This account was not approved. Please contact your SwitchYard team." };
  commit({ ...cache, sessionEmail: user.email, admin: false });
  return { ok: true };
}

export function adminSignIn(email: string, password: string): ActionResult {
  if (email.trim().toLowerCase() !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    return { ok: false, error: "Invalid SwitchYard staff credentials." };
  }
  commit({ ...cache, admin: true, sessionEmail: null });
  return { ok: true };
}

export function signOut(): void {
  commit({ ...cache, sessionEmail: null, admin: false });
}

function setUserStatus(id: string, status: ApprovalStatus): void {
  commit({
    ...cache,
    users: cache.users.map((user) => {
      if (user.id !== id) return user;
      // Approval starts the points ledger: welcome points only land once approved.
      const seedPoints = status === "approved" && user.seedPoints === 0 ? WELCOME_POINTS : user.seedPoints;
      return { ...user, status, seedPoints };
    }),
  });
}

export const approveUser = (id: string): void => setUserStatus(id, "approved");
export const rejectUser = (id: string): void => setUserStatus(id, "rejected");
export const resetDemo = (): void => commit(seed());

export function submitVoucher(email: string, input: { fileName: string; note: string; claimedPoints: number }): ActionResult {
  if (!input.fileName) return { ok: false, error: "Attach a voucher file to upload." };
  if (!Number.isFinite(input.claimedPoints) || input.claimedPoints <= 0) return { ok: false, error: "Enter the points value shown on the voucher." };
  const voucher: Voucher = { id: uid(), fileName: input.fileName, note: input.note.trim(), claimedPoints: Math.round(input.claimedPoints), status: "pending", createdAt: nowISO() };
  commit(updateUser(cache, email, (user) => ({ ...user, vouchers: [voucher, ...user.vouchers] })));
  return { ok: true, message: "Voucher uploaded. SwitchYard will validate it before points are credited." };
}

export function submitRedemption(email: string, reward: Reward, note: string): ActionResult {
  const user = findUser(cache, email);
  if (!user) return { ok: false, error: "Session expired. Please sign in again." };
  if (pointsFor(user).vested < reward.points) return { ok: false, error: "You don't have enough vested points for this reward." };
  const redemption: Redemption = { id: uid(), rewardId: reward.id, rewardTitle: reward.title, points: reward.points, note: note.trim(), status: "pending", createdAt: nowISO() };
  commit(updateUser(cache, email, (current) => ({ ...current, redemptions: [redemption, ...current.redemptions] })));
  return { ok: true, message: `Request for “${reward.title}” submitted. SwitchYard will confirm your voucher.` };
}

function setVoucherStatus(email: string, id: string, status: ApprovalStatus): void {
  commit(updateUser(cache, email, (user) => ({ ...user, vouchers: user.vouchers.map((v) => (v.id === id ? { ...v, status } : v)) })));
}
function setRedemptionStatus(email: string, id: string, status: ApprovalStatus): void {
  commit(updateUser(cache, email, (user) => ({ ...user, redemptions: user.redemptions.map((r) => (r.id === id ? { ...r, status } : r)) })));
}

export const approveVoucher = (email: string, id: string): void => setVoucherStatus(email, id, "approved");
export const rejectVoucher = (email: string, id: string): void => setVoucherStatus(email, id, "rejected");
export const approveRedemption = (email: string, id: string): void => setRedemptionStatus(email, id, "approved");
export const rejectRedemption = (email: string, id: string): void => setRedemptionStatus(email, id, "rejected");

// Every pending item across all accounts, for the staff approval screen.
export function pendingVouchers(db: RewardsDB): { user: RewardsUser; voucher: Voucher }[] {
  return db.users.flatMap((user) => user.vouchers.filter((v) => v.status === "pending").map((voucher) => ({ user, voucher })));
}
export function pendingRedemptions(db: RewardsDB): { user: RewardsUser; redemption: Redemption }[] {
  return db.users.flatMap((user) => user.redemptions.filter((r) => r.status === "pending").map((redemption) => ({ user, redemption })));
}

export function useRewards(): RewardsDB {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
