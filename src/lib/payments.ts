/**
 * Payments abstraction (§3.1 freemium: Stripe stubbed behind an interface).
 * v1 ships StripeStubProvider only — no real keys, no network. A real
 * StripeProvider would implement the same interface and be swapped in one line.
 */

export type PlanId = "monthly" | "yearly" | "family";

export interface Plan {
  id: PlanId;
  label: string;
  /** Display price — illustrative demo pricing, clearly labeled in the UI. */
  price: string;
  per: string;
  blurb: string;
  highlight?: boolean;
}

export interface CheckoutResult {
  ok: boolean;
  message: string;
}

export interface PaymentProvider {
  readonly name: string;
  plans(): Plan[];
  /** Begin a checkout. The stub resolves instantly and never charges anything. */
  checkout(plan: PlanId): Promise<CheckoutResult>;
}

export const PLANS: Plan[] = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$9",
    per: "per month",
    blurb: "Every course, every trail, cancel anytime."
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$59",
    per: "per year",
    blurb: "Two months free — best for a full school year.",
    highlight: true
  },
  {
    id: "family",
    label: "Family",
    price: "$99",
    per: "per year",
    blurb: "Every learner on your roster, one subscription."
  }
];

/** Demo provider: pretends to check out, never touches a network or a card. */
export class StripeStubProvider implements PaymentProvider {
  readonly name = "stripe-stub";
  plans(): Plan[] {
    return PLANS;
  }
  async checkout(plan: PlanId): Promise<CheckoutResult> {
    // Simulate a round-trip so the UI's pending state is honest.
    await new Promise((r) => setTimeout(r, 400));
    return {
      ok: true,
      message:
        plan === "family"
          ? "Demo checkout complete — family plan, covering every learner on the roster (no card was charged; this build has no real billing)."
          : plan === "yearly"
            ? "Demo checkout complete — yearly plan (no card was charged; this build has no real billing)."
            : "Demo checkout complete — monthly plan (no card was charged; this build has no real billing)."
    };
  }
}

export const paymentProvider: PaymentProvider = new StripeStubProvider();
