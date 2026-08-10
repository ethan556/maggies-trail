/**
 * ENTITLEMENT — who is allowed past the paywall.
 *
 * The key modelling decision: a subscription belongs to the ACCOUNT, not to a learner. A parent who
 * buys the family plan once must not discover that only the child who happened to be active at
 * checkout got unlocked. So entitlement is stored per-account and every learner on the roster
 * inherits it.
 *
 * Legacy note: earlier builds wrote a demo `premium` onto the child Profile. `isPremium()` still
 * honours that (so nobody loses access), but new checkouts write here.
 *
 * NOT REAL: nothing here verifies a payment. `grant()` is called by the stubbed checkout. A real
 * build would never trust the client for this — entitlement would come from a Stripe webhook
 * writing to the account row server-side, and `isPremium()` would read it from the session. The
 * shape is right; the trust boundary is not, and it says so.
 */

import type { Profile } from "./progress";
import type { PlanId } from "./payments";
import { storageGet, storageSet } from "./safeStorage";

const ENTITLEMENT_KEY = "numera:entitlement:v1";

export type EntitlementPlan = PlanId | "family";

export interface Entitlement {
  accountId: string;
  plan: EntitlementPlan;
  since: string;
  /** Honest marker: this grant came from the demo checkout, not from a payment processor. */
  demo: true;
}

type EntitlementMap = Record<string, Entitlement>;

function read(): EntitlementMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = storageGet(ENTITLEMENT_KEY);
    return raw ? (JSON.parse(raw) as EntitlementMap) : {};
  } catch {
    return {};
  }
}

function write(m: EntitlementMap): void {
  if (typeof window === "undefined") return;
  try {
    storageSet(ENTITLEMENT_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function grant(accountId: string, plan: EntitlementPlan): Entitlement {
  const e: Entitlement = { accountId, plan, since: new Date().toISOString(), demo: true };
  const m = read();
  m[accountId] = e;
  write(m);
  return e;
}

export function revoke(accountId: string): void {
  const m = read();
  delete m[accountId];
  write(m);
}

export function entitlementFor(accountId: string | null | undefined): Entitlement | null {
  if (!accountId) return null;
  return read()[accountId] ?? null;
}

/**
 * The single question the paywall asks. Account entitlement covers EVERY learner on the roster;
 * the per-profile flag is honoured only as a legacy fallback.
 */
export function isPremium(profile: Profile | null | undefined, accountId?: string | null): boolean {
  if (entitlementFor(accountId)) return true;
  return !!profile?.premium;
}

/** True when the account's plan covers the whole roster (rather than one seat). */
export function isFamilyPlan(accountId: string | null | undefined): boolean {
  return entitlementFor(accountId)?.plan === "family";
}
