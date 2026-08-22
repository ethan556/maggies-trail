/**
 * BILLING PROVIDER — the paid-flow seam behind the premium page, lifted into
 * one explicit, env-selected interface (S331, CL-P0-016 prep).
 *
 * Before this file, the demo paid flow lived in three places: payments.ts
 * (StripeStubProvider.checkout), entitlement.ts (grant/revoke), and the
 * premium page (which composed them by hand). This interface captures the
 * whole lifecycle the product needs — list plans, run a checkout, verify a
 * processor webhook, and grant/cancel/read entitlement — so a real processor
 * plugs in behind ONE seam instead of three call sites.
 *
 * The DEFAULT provider is the current behavior, unchanged and honest about
 * itself: checkout is simulated (no card, no network — delegates to the
 * existing StripeStubProvider), entitlement is granted client-side in local
 * storage, and there are no webhooks to verify. That trust boundary is wrong
 * for real money on purpose — entitlement.ts documents it — and stays wrong
 * until a real provider exists server-side.
 *
 * Selection is by env var (client module, so NEXT_PUBLIC_ — Next.js inlines
 * it at build time):
 *   NEXT_PUBLIC_BILLING_PROVIDER=demo    (default) — DemoBillingProvider.
 *   NEXT_PUBLIC_BILLING_PROVIDER=stripe — documented stub: throws at
 *     selection time with the env vars a real Stripe integration needs.
 *     Implementing it means: server-side checkout-session creation and a
 *     webhook route that verifies signatures and writes entitlement to the
 *     account row (never trusting the client), with this client provider
 *     reduced to redirecting to Checkout and reading entitlement from the
 *     session. See docs/PROVIDERS.md (CL-P0-016).
 */

import { StripeStubProvider, type CheckoutResult, type Plan, type PlanId } from "./payments";
import {
  entitlementFor as readEntitlement,
  grant,
  revoke,
  type Entitlement,
  type EntitlementPlan
} from "./entitlement";

export interface WebhookVerification {
  ok: boolean;
  reason: string;
}

export interface BillingProvider {
  readonly name: string;
  plans(): Plan[];
  /** Begin a checkout. The demo provider resolves instantly and never charges anything. */
  checkout(plan: PlanId): Promise<CheckoutResult>;
  /**
   * Verify a processor webhook (signature over the raw body). The demo
   * provider receives no webhooks and says so; a real provider returns ok
   * only for a signature its processor actually produced.
   */
  verifyWebhook(rawBody: string, signature: string): WebhookVerification;
  /** Entitlement lifecycle. On the demo provider these are the existing client-side grant/revoke. */
  activate(accountId: string, plan: EntitlementPlan): Entitlement;
  cancel(accountId: string): void;
  entitlementFor(accountId: string | null | undefined): Entitlement | null;
}

/** The current (and default) behavior, unchanged: simulated checkout + local-storage entitlement. */
export class DemoBillingProvider implements BillingProvider {
  readonly name = "demo";
  private readonly stub = new StripeStubProvider();

  plans(): Plan[] {
    return this.stub.plans();
  }

  checkout(plan: PlanId): Promise<CheckoutResult> {
    return this.stub.checkout(plan);
  }

  verifyWebhook(): WebhookVerification {
    return {
      ok: false,
      reason: "demo provider receives no webhooks — entitlement is granted client-side by the demo checkout"
    };
  }

  activate(accountId: string, plan: EntitlementPlan): Entitlement {
    return grant(accountId, plan);
  }

  cancel(accountId: string): void {
    revoke(accountId);
  }

  entitlementFor(accountId: string | null | undefined): Entitlement | null {
    return readEntitlement(accountId);
  }
}

const STRIPE_ENV_VARS =
  "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, STRIPE_PRICE_FAMILY";

/**
 * Select a billing provider by name (defaults to NEXT_PUBLIC_BILLING_PROVIDER, then "demo").
 * The stripe branch is a documented stub that fails loudly rather than pretending to bill.
 */
export function createBillingProvider(
  name: string = process.env.NEXT_PUBLIC_BILLING_PROVIDER ?? "demo"
): BillingProvider {
  switch (name) {
    case "demo":
      return new DemoBillingProvider();
    case "stripe":
      throw new Error(
        `NEXT_PUBLIC_BILLING_PROVIDER=stripe is not configured in this build. A real Stripe integration ` +
          `requires ${STRIPE_ENV_VARS}, a server-side checkout-session route, and a signature-verified ` +
          `webhook route that writes entitlement server-side. See docs/PROVIDERS.md (CL-P0-016).`
      );
    default:
      throw new Error(`Unknown NEXT_PUBLIC_BILLING_PROVIDER "${name}" — valid values: demo (default), stripe.`);
  }
}

export const billingProvider: BillingProvider = createBillingProvider();
