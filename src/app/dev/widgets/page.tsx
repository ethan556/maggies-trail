"use client";

import { useMemo, useRef, useState } from "react";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { WidgetRenderer } from "@/components/widgets";
import { SAMPLES } from "@/components/widgetSamples";
import { FIGURES } from "@/components/figures";



function Harness({ raw, variant }: { raw: unknown; variant?: string }) {
  const spec = useMemo(() => WidgetSpec.parse(raw) as TWidget, [raw]);
  const [value, setValue] = useState<unknown>(null);
  const [attempts, setAttempts] = useState(0);
  const [log, setLog] = useState<string>("");
  const mountedAt = useRef(Date.now());

  return (
    <section className="min-w-0 rounded-card border-2 border-ink/10 bg-white p-5">
      <p className="mb-3 inline-block rounded-full bg-sky/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-ink">
        {spec.type}
        {variant ? <span className="ml-2 font-extrabold text-ink/50">{variant}</span> : null}
      </p>
      <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={!canCheck(spec, value)}
          onClick={() => {
            const res = evaluate(spec, value);
            const a = attempts + (res.correct ? 0 : 1);
            setAttempts(a);
            setLog(
              JSON.stringify(
                {
                  correct: res.correct,
                  attempts: a,
                  hintsUsed: 0,
                  timeMs: Date.now() - mountedAt.current,
                  feedback: res.feedback
                },
                null,
                1
              )
            );
          }}
          className="min-h-11 rounded-card bg-cta px-6 py-2 font-bold text-white disabled:opacity-40"
        >
          Check
        </button>
      </div>
      {log && <pre className="mt-3 overflow-x-auto rounded-card bg-ink/5 p-3 text-xs">{log}</pre>}
    </section>
  );
}

export default function WidgetGallery() {
  return (
    <main className="mx-auto grid w-full max-w-xl gap-6 px-4 py-10">
      <h1 className="text-3xl font-extrabold">Widget gallery</h1>
      <p className="text-ink/70">
        Every registered widget, exercised with a live spec and the emitted result contract.
      </p>
      {(() => {
        // A type may carry more than one sample when it has genuinely distinct modes (the first
        // is the canonical one; the rest exercise the modes). Badge them so the gallery says
        // which is which instead of showing the same label three times.
        const counts = new Map<string, number>();
        for (const s of SAMPLES) {
          const t = (s as { type?: string }).type ?? "?";
          counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        const seen = new Map<string, number>();
        return SAMPLES.map((s, i) => {
          const t = (s as { type?: string }).type ?? "?";
          const total = counts.get(t) ?? 1;
          const n = (seen.get(t) ?? 0) + 1;
          seen.set(t, n);
          return <Harness key={i} raw={s} variant={total > 1 ? `${n} of ${total}` : undefined} />;
        });
      })()}
      <h2 className="mt-6 text-xl font-extrabold">Concept figures ({Object.keys(FIGURES).length})</h2>
      <p className="text-sm text-ink/70">
        The named-figure registry — wire with <code>&quot;figure&quot;: &quot;&lt;name&gt;&quot;</code> on a concept step.
      </p>
      {Object.entries(FIGURES).map(([name, Fig]) => (
        <section key={name} className="min-w-0 rounded-card border-2 border-ink/10 bg-white p-4">
          <p className="mb-2 inline-block rounded-full bg-tangerine/15 px-3 py-1 text-xs font-bold">{name}</p>
          <Fig />
        </section>
      ))}
    </main>
  );
}
