"use client";

import { useCallback, useState } from "react";
import { COPY } from "@/lib/copy";
import { canCheck, correctAnswerText, evaluate } from "@/lib/evaluate";
import { useEnterAdvance } from "@/lib/keys";
import type { TWidget } from "@/lib/schema";
import WidgetView from "@/components/WidgetView";
import { HINT_RUNGS, StatusBanner, StepSegments } from "./ui";
import { MathProse } from "@/components/math/MathText";

/** A standalone servable check — the unit of Review and Practice queues. */
export interface Servable {
  key: string;
  body?: string;
  widget: TWidget;
  explanationVariants?: string[];
  /** progressive hints (challenge steps ship 3) */
  hints?: string[];
  /** small context line, e.g. source lesson title */
  context?: string;
}

export interface QuizSummary {
  total: number;
  firstTry: number;
}

/**
 * Serves items one at a time with the player's check semantics:
 * Check → diagnostic feedback → one retry → reveal + explanation.
 * "Correct" reported to onResult means correct on the FIRST attempt
 * (the same forgetting signal the review scheduler uses).
 */
export default function QuizShell({
  items,
  onResult,
  onFinished
}: {
  items: Servable[];
  onResult?: (key: string, result: { firstTry: boolean; hintsUsed: number; revealed: boolean }) => void;
  onFinished?: (s: QuizSummary) => void;
}) {
  const [i, setI] = useState(0);
  const [value, setValue] = useState<unknown>(undefined);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<"work" | "retry" | "done">("work");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [explorationActive, setExplorationActive] = useState(false);
  const [explorationFeedback, setExplorationFeedback] = useState("");
  const [explorationCorrect, setExplorationCorrect] = useState<boolean | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);

  const item = items[i];
  const total = items.length;

  // Enter mirrors the visible button: Check / Try again while working, Continue
  // when finished. Re-created per render so it always sees current state.
  const onEnter = useCallback(() => {
    if (!item) return;
    if (phase === "done") next();
    else if (canCheck(item.widget, value)) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, phase, value, attempts, i]);
  useEnterAdvance(onEnter, Boolean(item));

  if (!item) return null;

  function check() {
    const res = evaluate(item.widget, value);
    if (phase === "done" && explorationActive) {
      setExplorationFeedback(res.feedback || "");
      setExplorationCorrect(res.correct);
      return;
    }
    if (res.correct) {
      const first = attempts === 0;
      if (first) setFirstTryCount((c) => c + 1);
      setPhase("done");
      setFeedback(res.feedback || "");
      onResult?.(item.key, { firstTry: first, hintsUsed: hintsShown, revealed: false });
    } else if (attempts === 0) {
      setAttempts(1);
      setFeedback(res.feedback || "");
      setPhase("retry");
    } else {
      setRevealed(true);
      setPhase("done");
      setFeedback(res.feedback || "");
      onResult?.(item.key, { firstTry: false, hintsUsed: hintsShown, revealed: true });
    }
  }

  function next() {
    if (i + 1 >= total) {
      onFinished?.({ total, firstTry: firstTryCount });
      return;
    }
    setI(i + 1);
    setValue(undefined);
    setAttempts(0);
    setPhase("work");
    setRevealed(false);
    setFeedback("");
    setExplorationActive(false);
    setExplorationFeedback("");
    setExplorationCorrect(null);
    setVariantIdx(0);
    setHintsShown(0);
  }

  const variants = item.explanationVariants ?? [];
  const showExplanation = phase === "done" && variants.length > 0;
  const finalized = phase === "done";

  function changeValue(next: unknown) {
    setValue(next);
    if (!finalized) return;
    setExplorationActive(true);
    setExplorationFeedback("");
    setExplorationCorrect(null);
  }

  return (
    <div className="step-in" key={item.key}>
      <StepSegments total={total} current={i} label={`Item ${i + 1} of ${total}`} className="mb-3" />
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
          {i + 1} of {total}
        </p>
        {item.context && (
          <p className="text-xs font-bold text-ink/70 dark:text-paper/70">{item.context}</p>
        )}
      </div>

      {item.body && <p className="mt-2 font-bold"><MathProse text={item.body} includeArithmetic /></p>}

      <div className="mt-4">
        <WidgetView
          spec={item.widget}
          value={value}
          onChange={changeValue}
          disabled={false}
          seed={item.key}
          tone={
            explorationActive && explorationCorrect === false
              ? "error"
              : explorationActive && explorationCorrect === true
                ? "success"
                : phase === "retry"
                  ? "error"
                  : phase === "done"
                    ? (revealed ? "info" : "success")
                    : "neutral"
          }
        />
      </div>

      {(item.hints?.length ?? 0) > 0 && phase !== "done" && (
        <div className="mt-4">
          {hintsShown > 0 && (
            <ol className="space-y-2">
              {item.hints!.slice(0, hintsShown).map((h, hi) => {
                const latest = hi === hintsShown - 1;
                return (
                  <li
                    key={hi}
                    className={`rounded-card border-l-4 px-4 py-2 text-sm ${
                      latest
                        ? "border-tangerine bg-tangerine/10"
                        : "border-tangerine/30 bg-tangerine/5 text-ink/70 dark:text-paper/70"
                    }`}
                  >
                    <span className="font-extrabold text-tangerine-ink">
                      {HINT_RUNGS[hi] ?? `Hint ${hi + 1}`} · {hi + 1} of {item.hints!.length}:{" "}
                    </span>
                    <MathProse text={h} includeArithmetic />
                  </li>
                );
              })}
            </ol>
          )}
          {hintsShown < item.hints!.length && (
            <button
              type="button"
              onClick={() => setHintsShown((h) => h + 1)}
              className="pressable mt-2 min-h-11 rounded-pill border-2 border-tangerine/60 px-4 text-sm font-bold text-[#B5581F] transition-colors hover:border-tangerine dark:text-tangerine-ink"
            >
              {COPY.hint} ({item.hints!.length - hintsShown} left)
            </button>
          )}
        </div>
      )}

      {phase === "retry" && (
        <div className="banner-in mt-4">
          <StatusBanner tone="error" icon="icon-803" title={COPY.nudgeBanner}>
            <p className="text-sm"><MathProse text={feedback} includeArithmetic /></p>
          </StatusBanner>
        </div>
      )}

      {phase === "done" && (
        <div className="banner-in mt-4">
          <StatusBanner
            tone={revealed ? "info" : "success"}
            icon={revealed ? "icon-807" : "icon-704"}
            title={revealed ? COPY.revealBanner : COPY.correctBanner}
          >
            {revealed && (
              <p className="mt-1 inline-flex flex-wrap items-baseline gap-x-2 rounded-lg bg-sky/10 px-2.5 py-1 text-sm">
                <strong className="text-sky-ink">{COPY.answerWas}</strong>
                <span className="font-bold"><MathProse text={correctAnswerText(item.widget)} includeArithmetic /></span>
              </p>
            )}
            {!revealed && feedback && <p className="mt-1 text-sm"><MathProse text={feedback} includeArithmetic /></p>}
            <p className="mt-1 text-xs font-semibold text-ink/70 dark:text-paper/70">
              Checkpoint saved. Keep exploring this model, or continue when you are ready.
            </p>
            {showExplanation && (
              <div className="mt-2 border-t-2 border-ink/10 pt-2 dark:border-paper/10">
                <p className="text-sm"><MathProse text={variants[variantIdx % variants.length]} includeArithmetic /></p>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariantIdx((v) => v + 1)}
                    className="pressable mt-2 min-h-11 rounded-pill border-2 border-ink/15 px-4 text-sm font-bold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
                  >
                    {COPY.explainDifferently}
                  </button>
                )}
              </div>
            )}
          </StatusBanner>
        </div>
      )}

      {finalized && explorationActive && (
        <div className="banner-in mt-3">
          <StatusBanner
            tone={explorationCorrect === null ? "info" : explorationCorrect ? "success" : "error"}
            icon={explorationCorrect === null ? "icon-808" : explorationCorrect ? "icon-704" : "icon-803"}
            title={
              explorationCorrect === null
                ? "Exploration state ready"
                : explorationCorrect
                  ? "This state also meets the target"
                  : "This state does not meet the target"
            }
          >
            <p className="text-sm">
              {explorationFeedback
                ? <MathProse text={explorationFeedback} includeArithmetic />
                : "Test this state without changing the result already recorded for this item."}
            </p>
          </StatusBanner>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {phase !== "done" ? (
          <button
            type="button"
            onClick={check}
            disabled={!canCheck(item.widget, value)}
            className="pressable min-h-11 rounded-pill bg-cta px-6 py-3 font-extrabold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-40"
          >
            {phase === "retry" ? COPY.tryAgain : COPY.check}
          </button>
        ) : (
          <>
            {explorationActive && (
              <button
                type="button"
                onClick={check}
                disabled={!canCheck(item.widget, value)}
                className="pressable min-h-11 rounded-pill border-2 border-sky px-5 py-3 font-extrabold text-sky-ink disabled:opacity-40"
              >
                Check this state
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="pressable min-h-11 rounded-pill bg-ink px-6 py-3 font-extrabold text-paper shadow-e1 transition-[filter] hover:brightness-125 dark:bg-paper dark:text-ink"
            >
              {i + 1 >= total ? "Finish" : COPY.continue}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
