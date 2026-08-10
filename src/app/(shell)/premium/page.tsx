"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { paymentProvider, type PlanId } from "@/lib/payments";
import { progressStore } from "@/lib/progress";
import { authProvider, SESSION_CHANGED_EVENT } from "@/lib/auth";
import { entitlementFor, grant, revoke } from "@/lib/entitlement";

export default function PremiumPage() {
  const [premiumPlan, setPremiumPlan] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const readSession = () => {
      const account = authProvider.currentSession()?.accountId ?? null;
      setAccountId(account);
      // Account entitlement first; the per-profile flag is a legacy fallback so nobody loses access.
      setPremiumPlan(entitlementFor(account)?.plan ?? progressStore.load().premium?.plan ?? null);
    };
    readSession();
    window.addEventListener(SESSION_CHANGED_EVENT, readSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, readSession);
  }, []);

  async function buy(plan: PlanId) {
    setPending(plan);
    setMessage(null);
    const res = await paymentProvider.checkout(plan);
    setPending(null);
    setMessage(res.message);
    if (!res.ok) return;

    if (accountId) {
      // Entitlement belongs to the ACCOUNT, so every learner on the roster is covered at once.
      grant(accountId, plan);
    } else {
      // Signed out: fall back to the legacy per-profile flag so the demo still unlocks.
      const p = progressStore.load();
      p.premium = { plan, since: new Date().toISOString().slice(0, 10) };
      progressStore.save(p);
    }
    setPremiumPlan(plan);
  }

  function reset() {
    if (accountId) revoke(accountId);
    const p = progressStore.load();
    delete p.premium;
    progressStore.save(p);
    setPremiumPlan(null);
    setMessage("Demo premium removed — you're back on the free plan.");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <p
        role="note"
        className="mb-6 rounded-card border-2 border-tangerine/60 bg-tangerine/10 px-4 py-3 text-sm font-bold"
      >
        Demo build — there is no real billing here. Checkout is simulated, no card is ever
        asked for or charged, and prices are illustrative.{" "}
        {accountId ? (
          "Your plan is attached to your account, so it covers every learner on your roster."
        ) : (
          <>
            You&apos;re signed out, so a plan would unlock only this device.{/* roster note */}{" "}
            <Link href="/account" className="underline">
              Sign in
            </Link>{" "}
            to cover your whole roster.
          </>
        )}
      </p>

      <h1 className="text-4xl font-extrabold leading-tight">Go premium</h1>
      <p className="mt-2 text-lg text-ink/80 dark:text-paper/80">
        Chapter 1 of every course is free, forever. Premium opens every chapter of every
        trail — the whole K&ndash;12 curriculum, the full daily-challenge rotation, and
        everything we add next.
      </p>

      <ul className="mt-6 grid gap-2 text-base">
        {[
          "Every course — every chapter, every lesson",
          "Daily Challenges in all five categories",
          "Practice mode + test-out quizzes for every chapter",
          "Spaced review with no limits",
          "Leagues, achievements, and streak freezes"
        ].map((f) => (
          <li
            key={f}
            className="rounded-card border-2 border-ink/10 bg-white px-4 py-2.5 dark:border-paper/15 dark:bg-night"
          >
            <span aria-hidden className="mr-2">✔</span>
            {f}
          </li>
        ))}
      </ul>

      {premiumPlan ? (
        <div className="mt-8 rounded-card border-2 border-leaf bg-leaf/10 px-4 py-4">
          <p className="font-extrabold">
            You&apos;re premium (demo) — {premiumPlan} plan
            {premiumPlan === "family" ? ", covering every learner on your roster" : ""}.
          </p>
          <p className="mt-1 text-sm text-ink/80 dark:text-paper/80">
            Every chapter is open. This is stored locally as part of the demo profile.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 min-h-11 rounded-card border-2 border-ink/20 px-4 font-bold hover:border-berry dark:border-paper/25"
          >
            Remove demo premium
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {paymentProvider.plans().map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-card border-2 px-5 py-5 ${
                plan.highlight
                  ? "border-sky bg-sky/5"
                  : "border-ink/15 bg-white dark:border-paper/15 dark:bg-night"
              }`}
            >
              {plan.highlight && (
                <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-sky-ink">
                  Best value
                </p>
              )}
              <h2 className="text-xl font-extrabold">{plan.label}</h2>
              <p className="mt-1">
                <span className="text-4xl font-extrabold tabular-nums">{plan.price}</span>{" "}
                <span className="text-ink/70 dark:text-paper/70">{plan.per}</span>
              </p>
              <p className="mt-2 grow text-sm text-ink/80 dark:text-paper/80">{plan.blurb}</p>
              <button
                type="button"
                onClick={() => buy(plan.id)}
                disabled={pending !== null}
                className={`mt-4 min-h-11 rounded-card px-4 font-bold text-white ${
                  plan.highlight ? "bg-cta" : "bg-ink dark:bg-cta"
                } disabled:opacity-60`}
              >
                {pending === plan.id ? "Pretending to check out…" : `Choose ${plan.label.toLowerCase()} (demo)`}
              </button>
            </div>
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-bold text-leaf-ink">
        {message}
      </p>
    </div>
  );
}
