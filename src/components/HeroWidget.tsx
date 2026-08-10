"use client";

import { useState } from "react";
import WidgetView from "@/components/WidgetView";
import { evaluate, canCheck } from "@/lib/evaluate";
import type { TWidget } from "@/lib/schema";
import { COPY } from "@/lib/copy";

/** The hero is a REAL widget running the real evaluator — not a mockup (§3.1). */
const HERO_SPEC = {
  type: "slider",
  prompt: "Make 5 groups of 4 berries. Slide to the total.",
  min: 0,
  max: 32,
  step: 4,
  start: 4,
  target: 20,
  visual: "groups",
  unitLabel: "berries",
  lowFeedback: "Short a group or two — every slide adds another group of 4.",
  highFeedback: "Past 5 groups now — ease back.",
  successFeedback: "5 groups of 4 = 20. That's multiplication — and every lesson here works exactly like this."
} as TWidget;

export default function HeroWidget() {
  const [value, setValue] = useState<unknown>(undefined);
  const [state, setState] = useState<"idle" | "wrong" | "right">("idle");
  const [feedback, setFeedback] = useState<string>("");

  function check() {
    const res = evaluate(HERO_SPEC, value);
    setState(res.correct ? "right" : "wrong");
    setFeedback(res.feedback);
  }

  return (
    <div className="stage rounded-card border border-ink/10 p-5 shadow-e2">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-tangerine-ink">
        Try it — this is a real lesson widget
      </p>
      <WidgetView
        spec={HERO_SPEC}
        value={value}
        onChange={(v) => {
          setValue(v);
          if (state !== "right") {
            setState("idle");
            setFeedback("");
          }
        }}
        disabled={state === "right"}
      />
      <div className="mt-4 flex items-center gap-3">
        <button
                type="button"
          onClick={check}
          disabled={!canCheck(HERO_SPEC, value) || state === "right"}
          className="pressable min-h-11 rounded-pill bg-cta px-6 font-bold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-50"
        >
          {COPY.check}
        </button>
        {state !== "idle" && (
          <p
            aria-live="polite"
            className={`text-sm font-bold ${state === "right" ? "text-leaf-ink" : "text-berry-ink"}`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
