"use client";

import { useEffect } from "react";
import { telemetry } from "@/lib/telemetry";

/** Route-level recovery UI. Keeps an unexpected render/data error from turning
 * into a blank screen, while reporting it through the telemetry provider
 * (S331: env-selected via NEXT_PUBLIC_TELEMETRY_PROVIDER; the default console
 * provider prints exactly what this boundary always printed). */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    telemetry.captureError(error, { label: "Maggie's Trail route error", digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-5 py-12">
      <section role="alert" className="w-full rounded-card border border-berry/30 bg-surface p-6 shadow-e2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-berry-ink">Something went off trail</p>
        <h1 className="mt-2 text-3xl font-extrabold">Your saved progress is safe.</h1>
        <p className="mt-3 text-ink/70 dark:text-paper/70">
          This page hit an unexpected error. Try it again; if the problem persists, return to the dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="pressable min-h-11 rounded-pill bg-cta px-5 py-2.5 font-extrabold text-white hover:bg-sky/90"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="inline-flex min-h-11 items-center rounded-pill border border-ink/15 px-5 py-2.5 font-extrabold hover:border-sky dark:border-paper/20"
          >
            Go to dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
