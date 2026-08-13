"use client";

import { useState } from "react";
import { WidgetSpec, type TCovariationScrubber } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { CovariationScrubberW } from "@/components/widgets/covariationScrubber";
import { COPY } from "@/lib/copy";

/**
 * LandingHero — WS-H's marketing hero manipulative (`OPTIMIZATION_PLAN_V3.md` §WS-H moment 2:
 * "drag one object → graph, equation, and number readout all change in sync").
 *
 * Built on the proven Harness pattern from `src/app/dev/widgets/page.tsx` (lines 12-56): local
 * `value` state, `WidgetSpec.parse`, and `evaluate()`/`canCheck()` from `@/lib/evaluate` drive the
 * Check button exactly as the widget gallery does. Deliberately NOT routed through `LessonPlayer`
 * — a cold landing visit has no lesson, progress, XP, or adaptive context to hang that on — and NOT
 * routed through `WidgetRenderer`/`widgets.tsx` either: `CovariationScrubberW` is imported directly
 * from its own extracted module (`@/components/widgets/covariationScrubber`), so mounting the hero
 * never pulls the ~129-widget monolith into the marketing bundle. `page.tsx` loads THIS component
 * behind its own `next/dynamic` boundary (the same pattern the `HeroWidget` it replaces already
 * used), so the hero's own JS — and the widget engine inside it — ships as one lazily-fetched chunk,
 * not part of the initial page bundle.
 *
 * `HERO_SPEC` is a hand-written, marketing-tuned COPY of the authored hours→miles covariationScrubber
 * sample at `widgetSamples.ts:1831` — the same numbers (rate 4, a 0-10 hour window, start 1, target
 * 6), because that scenario is genuinely legible cold, with copy rewritten for a first-time visitor
 * rather than a mid-lesson learner. It is a literal spec here, not an import from `widgetSamples.ts`
 * — that file is the widget-gallery sample set (`src/app/dev/widgets/page.tsx`'s content), not
 * marketing copy, and this task does not touch it.
 */
const HERO_SPEC = WidgetSpec.parse({
  type: "covariationScrubber",
  prompt: "Drag the point until the trip covers 24 miles.",
  a: 4,
  b: 0,
  inputMin: 0,
  inputMax: 10,
  inputStart: 1,
  targetInput: 6,
  inputLabel: "hours",
  outputLabel: "miles",
  contextTemplate: "In {x} hours, the rider travels {y} miles.",
  successFeedback:
    "6 hours, 24 miles — the table, the graph, and the equation all agree. That's the whole product: one honest state, every representation in sync.",
  lowFeedback: "Not there yet — drag right to cover more miles.",
  highFeedback: "That's past it — drag back toward 6 hours."
}) as TCovariationScrubber;

export default function LandingHero() {
  const [value, setValue] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  return (
    <div className="stage rounded-card border border-ink/10 p-5 shadow-e2">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-tangerine-ink">
        Try it — a real course widget, not a mockup
      </p>

      <CovariationScrubberW
        spec={HERO_SPEC}
        value={value}
        onChange={(next) => {
          setValue(next);
          setFeedback(null);
        }}
        disabled={false}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canCheck(HERO_SPEC, value)}
          onClick={() => {
            const result = evaluate(HERO_SPEC, value);
            setFeedback({ correct: result.correct, text: result.feedback });
          }}
          className="pressable min-h-11 rounded-pill bg-cta px-6 font-bold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-50"
        >
          {COPY.check}
        </button>
        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-bold ${feedback.correct ? "text-leaf-ink" : "text-berry-ink"}`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
