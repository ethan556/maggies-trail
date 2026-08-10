"use client";

import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/ui";
import { buildCMLMesh } from "@/lib/cml/mesh";
import { humanizeCMLId, resolveCMLMeta } from "@/lib/cml/catalog";
import type { ProcessEvent } from "@/lib/processEvents";
import type { TStep } from "@/lib/schema";
import { MathProse } from "@/components/math/MathText";

function sameValue(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export function CausalMasteryPanel({
  step,
  value,
  firstValue,
  previousValue,
  latestEvent,
  moveCount,
  finalized,
  onUndo,
  onRestoreFirst
}: {
  step: TStep;
  value: unknown;
  firstValue: unknown;
  previousValue: unknown;
  latestEvent: ProcessEvent | null;
  moveCount: number;
  finalized: boolean;
  onUndo: () => void;
  onRestoreFirst: () => void;
}) {
  const meta = resolveCMLMeta(step);
  const [expanded, setExpanded] = useState(false);
  const [explanationId, setExplanationId] = useState<string | null>(null);
  const [showFirst, setShowFirst] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setExplanationId(null);
    setShowFirst(false);
    setActiveCard(0);
  }, [step.id]);

  const mesh = useMemo(() => (step.widget ? buildCMLMesh(step.widget, value) : null), [step.widget, value]);
  const firstMesh = useMemo(
    () => (step.widget && firstValue !== null && firstValue !== undefined ? buildCMLMesh(step.widget, firstValue) : null),
    [step.widget, firstValue]
  );

  if (!meta || !step.widget) return null;

  const explanation = meta.explanation;
  const selected = explanation?.options.find((o) => o.id === explanationId) ?? null;
  const revised = firstValue !== null && firstValue !== undefined && !sameValue(firstValue, value);
  const visibleKinds = new Set(meta.representations);
  const cards = (showFirst && firstMesh ? firstMesh.cards : mesh?.cards ?? []).filter(
    (card) => visibleKinds.size === 0 || visibleKinds.has(card.kind)
  );
  const safeCard = cards[Math.min(activeCard, Math.max(0, cards.length - 1))] ?? null;

  const isExponentChain = step.widget.type === "placeValueTransformLab" && step.widget.task === "exponentChain";
  const exponentChainGoal =
    isExponentChain
      ? "Track how each exponent contribution changes the final exponent."
      : null;
  const actionGoal = exponentChainGoal ?? meta.actionGoal;
  const summaryTitle = moveCount > 0 ? "Connect what changed" : "Need help connecting the model?";
  const summaryText = exponentChainGoal
    ? "See how the exponent stages combine."
    : "See the model as a table, diagram, and equation.";
  const representationNarration = isExponentChain
    ? "Each repeated factor group contributes its exponent to the combined total."
    : showFirst && firstMesh
      ? firstMesh.narration
      : mesh?.narration ?? "";
  const invariants = isExponentChain
    ? ["same-base-preserved", "exponent-counts-repeated-factors"]
    : meta.invariants;

  return (
    <section
      aria-label="Model connections"
      className="cml-lens mx-auto mt-3 w-full max-w-3xl overflow-hidden rounded-card border border-sky/20 bg-surface shadow-e1"
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        className="pressable flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky/10 text-sky-ink" aria-hidden="true">
          <AppIcon name="compass" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">{summaryTitle}</span>
          <span className="mt-0.5 block text-sm font-semibold leading-snug text-content-2"><MathProse text={summaryText} /></span>
        </span>
        <AppIcon
          name="chevronDown"
          size={18}
          className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="grid gap-4 border-t border-ink/8 p-3 dark:border-paper/10 sm:p-4">
          {actionGoal && (
            <div className="rounded-card border-l-4 border-tangerine bg-tangerine/7 px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-tangerine-ink">Do the mathematics</p>
              <p className="mt-0.5 text-sm font-semibold"><MathProse text={actionGoal} /></p>
            </div>
          )}

          {cards.length > 0 && safeCard && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted">Connected representations</p>
                  <p className="mt-0.5 text-sm text-content-2"><MathProse text={representationNarration} /></p>
                </div>
                {revised && firstMesh && (
                  <button
                    type="button"
                    aria-pressed={showFirst}
                    onClick={() => setShowFirst((x) => !x)}
                    className="min-h-11 rounded-card border-2 border-sky/25 px-3 text-sm font-bold text-sky-ink"
                  >
                    {showFirst ? "Current build" : "Compare first build"}
                  </button>
                )}
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choose a representation">
                {cards.map((card, i) => (
                  <button
                    key={`${card.kind}:${card.label}`}
                    type="button"
                    role="tab"
                    aria-selected={i === activeCard}
                    onClick={() => setActiveCard(i)}
                    className={`min-h-11 whitespace-nowrap rounded-full border px-3 text-xs font-extrabold ${
                      i === activeCard ? "border-sky bg-sky/10 text-sky-ink" : "border-ink/10 text-content-2 dark:border-paper/10"
                    }`}
                  >
                    {humanizeCMLId(card.kind)}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="mt-2 rounded-card border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-night/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-sky-ink">{safeCard.label}</p>
                <p className="mt-1 break-words text-xl font-extrabold tabular-nums"><MathProse text={safeCard.value} /></p>
                {safeCard.detail && <p className="mt-1 text-sm font-semibold text-content-2"><MathProse text={safeCard.detail} /></p>}
              </div>
            </div>
          )}

          {invariants.length > 0 && (
            <div className="rounded-card border border-leaf/20 bg-leaf/6 px-3 py-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-leaf-ink">What must stay true</p>
              <p className="mt-1 text-sm font-semibold">
                {invariants.map(humanizeCMLId).join(" · ")}
              </p>
            </div>
          )}

          {!finalized && (previousValue !== null || revised) && (
            <div className="flex flex-wrap items-center gap-2 rounded-card border border-berry/20 bg-berry/5 px-3 py-2">
              <AppIcon name="route" size={16} className="text-berry-ink" />
              <p className="mr-auto text-sm font-semibold">Keep the first attempt visible. Revise the model, not just the answer.</p>
              <button
                type="button"
                disabled={previousValue === null || previousValue === undefined}
                onClick={onUndo}
                className="min-h-11 rounded-card border-2 border-berry/25 px-3 text-sm font-bold text-berry-ink disabled:opacity-35"
              >
                Undo last move
              </button>
              <button
                type="button"
                disabled={!revised}
                onClick={onRestoreFirst}
                className="min-h-11 rounded-card border-2 border-ink/15 px-3 text-sm font-bold disabled:opacity-35"
              >
                First build
              </button>
            </div>
          )}

          {latestEvent && !finalized && (
            <p className="rounded-card bg-sky/6 px-3 py-2 text-sm font-semibold text-content-2" aria-live="polite">
              <strong className="text-sky-ink">Latest move:</strong> {humanizeCMLId(latestEvent.kind ?? latestEvent.control)}
              {latestEvent.dir === "toward" && " moved the model closer to the goal."}
              {latestEvent.dir === "away" && " moved the model away from the goal — useful evidence for revision."}
              {latestEvent.dir === "past" && " crossed past the goal; compare the before and after states."}
              {latestEvent.dir === "invalid" && " violated a mathematical constraint."}
              {latestEvent.dir === "neutral" && " changed the representation while preserving the value."}
            </p>
          )}

          {explanation && (
            <div className="rounded-card border border-violet-200/70 bg-violet-50/50 p-3 dark:border-violet-900/50 dark:bg-violet-950/20">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-violet-700 dark:text-violet-300">Explain why</p>
              <p className="mt-1 font-bold"><MathProse text={explanation.prompt} /></p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={explanation.prompt}>
                {explanation.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={explanationId === option.id}
                    onClick={() => setExplanationId(option.id)}
                    className={`min-h-11 rounded-card border-2 px-3 py-2 text-left text-sm font-bold ${
                      explanationId === option.id ? "border-violet-500 bg-violet-100/70 dark:bg-violet-950/40" : "border-ink/10 bg-white dark:border-paper/10 dark:bg-night/50"
                    }`}
                  >
                    <MathProse text={option.label} />
                  </button>
                ))}
              </div>
              {selected && (
                <p
                  aria-live="polite"
                  className={`mt-2 rounded-card px-3 py-2 text-sm font-semibold ${selected.correct ? "bg-leaf/10 text-leaf-ink" : "bg-berry/8 text-berry-ink"}`}
                >
                  <MathProse text={selected.feedback} />
                </p>
              )}
            </div>
          )}

          {meta.counterfactualPrompt && (
            <div className="rounded-card border-l-4 border-violet-500 bg-violet-50/70 px-3 py-2 dark:bg-violet-950/20">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-violet-700 dark:text-violet-300">Try a what-if</p>
              <p className="mt-0.5 text-sm font-semibold"><MathProse text={meta.counterfactualPrompt} /></p>
            </div>
          )}

          {(meta.translationFrom || meta.transferFamily) && (
            <div className="grid gap-2 border-t border-ink/10 pt-3 text-sm dark:border-paper/10 sm:grid-cols-2">
              {meta.translationFrom && meta.translationTo && (
                <p><strong className="text-sky-ink">Translate:</strong> {humanizeCMLId(meta.translationFrom)} → {humanizeCMLId(meta.translationTo)}</p>
              )}
              {meta.transferFamily && (
                <p><strong className="text-violet-700 dark:text-violet-300">Use it again:</strong> {humanizeCMLId(meta.transferFamily)}{meta.delayed ? " · after a delay" : ""}</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
