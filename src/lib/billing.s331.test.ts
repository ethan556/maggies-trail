// @vitest-environment jsdom
/**
 * BILLING PROVIDER (s331, CL-P0-016 prep) — the interface contract and the
 * default provider, proven:
 *  · DemoBillingProvider.checkout is the SAME simulated checkout the premium
 *    page always ran (delegates to StripeStubProvider — ok, honest "no real
 *    billing" message, never a charge);
 *  · plans() are the same three demo plans;
 *  · the entitlement lifecycle (activate/cancel/entitlementFor) is the same
 *    client-side grant/revoke the page composed by hand before the seam;
 *  · verifyWebhook is honest: the demo provider receives no webhooks;
 *  · selection defaults to the demo provider;
 *  · the stripe branch fails LOUDLY, naming every env var it requires;
 *  · an unknown provider name is refused with the valid values.
 */
import { afterEach, describe, expect, it } from "vitest";
import { billingProvider, createBillingProvider, DemoBillingProvider } from "./billing";
import { entitlementFor, isPremium } from "./entitlement";
import { PLANS } from "./payments";
import { emptyProfile } from "./progress";

afterEach(() => localStorage.clear());

describe("DemoBillingProvider (the default = the current behavior)", () => {
  it("checkout resolves ok and says out loud that no real billing happened", async () => {
    const p = new DemoBillingProvider();
    const res = await p.checkout("yearly");
    expect(res.ok).toBe(true);
    expect(res.message).toMatch(/no card was charged/);
    expect(res.message).toMatch(/no real billing/);
  });

  it("serves the same three demo plans the page always rendered", () => {
    expect(new DemoBillingProvider().plans()).toEqual(PLANS);
    expect(PLANS.map((p) => p.id)).toEqual(["monthly", "yearly", "family"]);
  });

  it("activate/cancel drive the SAME entitlement store the paywall reads", () => {
    const p = new DemoBillingProvider();
    const e = p.activate("acct_1", "family");
    expect(e.demo).toBe(true); // honest marker: not a payment-processor grant
    // The paywall (entitlement.ts) sees the grant — one store, not two.
    expect(entitlementFor("acct_1")?.plan).toBe("family");
    expect(isPremium(emptyProfile(), "acct_1")).toBe(true);
    expect(p.entitlementFor("acct_1")).toEqual(e);

    p.cancel("acct_1");
    expect(p.entitlementFor("acct_1")).toBeNull();
    expect(isPremium(emptyProfile(), "acct_1")).toBe(false);
  });

  it("verifyWebhook is honest that the demo provider has no webhooks", () => {
    const v = new DemoBillingProvider().verifyWebhook();
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/no webhooks/);
  });
});

describe("provider selection (NEXT_PUBLIC_BILLING_PROVIDER)", () => {
  it("defaults to the demo provider, and the module-level instance IS that default", () => {
    expect(createBillingProvider().name).toBe("demo");
    expect(createBillingProvider("demo")).toBeInstanceOf(DemoBillingProvider);
    expect(billingProvider.name).toBe("demo");
  });

  it("stripe is a documented stub: throws naming every required env var", () => {
    expect(() => createBillingProvider("stripe")).toThrowError(
      /STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET.*NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.*STRIPE_PRICE_MONTHLY.*STRIPE_PRICE_YEARLY.*STRIPE_PRICE_FAMILY/s
    );
    expect(() => createBillingProvider("stripe")).toThrowError(/not configured/);
  });

  it("refuses an unknown provider name, listing the valid values", () => {
    expect(() => createBillingProvider("paddle")).toThrowError(/demo.*stripe/s);
  });
});
