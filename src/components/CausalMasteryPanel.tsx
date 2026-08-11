"use client";

import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/ui";
import { MathProse } from "@/components/math/MathText";
import { buildCMLMesh } from "@/lib/cml/mesh";
import { humanizeCMLId, resolveCMLMeta } from "@/lib/cml/catalog";
import type { TStep } from "@/lib/schema";

/**
 * A deliberately quiet, post-answer maths connection.
 *
 * The CML catalogue still powers the choice of equivalent representations, but
 * lifecycle labels, internal invariants, transfer tags, process telemetry and
 * authoring metadata never reach the learner. The active problem owns the page;
 * this optional disclosure appears only after the graded checkpoint.
 */
export function CausalMasteryPanel({ step, value }: { step: TStep; value: unknown }) {
  const meta = resolveCMLMeta(step);
  const [expanded, setExpanded] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setActiveCard(0);
  }, [step.id]);

  const mesh = useMemo(() => (step.widget ? buildCMLMesh(step.widget, value) : null), [step.widget, value]);

  if (!meta || !step.widget || !mesh) return null;

  const visibleKinds = new Set(meta.representations);
  const cards = mesh.cards.filter((card) => visibleKinds.size === 0 || visibleKinds.has(card.kind));
  const safeCard = cards[Math.min(activeCard, Math.max(0, cards.length - 1))] ?? null;

  if (!safeCard) return null;

  const isExponentChain = step.widget.type === "placeValueTransformLab" && step.widget.task === "exponentChain";
  const summary = isExponentChain
    ? "Compare the factors and exponent."
    : cards.length > 1
      ? `Compare ${cards.map((card) => humanizeCMLId(card.kind).toLowerCase()).join(" and ")}.`
      : "See the same maths another way.";

  return (
    <section
      aria-label="Another mathematical representation"
      className="cml-lens mx-auto mt-3 w-full max-w-3xl overflow-hidden rounded-card border border-sky/20 bg-surface shadow-e1"
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        className="pressable flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left sm:px-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky/10 text-sky-ink" aria-hidden="true">
          <AppIcon name="compass" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">See another form</span>
          <span className="block text-sm text-content-2"><MathProse text={summary} /></span>
        </span>
        <AppIcon
          name="chevronDown"
          size={18}
          className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-ink/8 p-3 dark:border-paper/10 sm:p-4">
          {cards.length > 1 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choose a mathematical form">
              {cards.map((card, index) => (
                <button
                  key={`${card.kind}:${card.label}`}
                  type="button"
                  role="tab"
                  aria-selected={index === activeCard}
                  onClick={() => setActiveCard(index)}
                  className={`min-h-11 whitespace-nowrap rounded-full border px-3 text-xs font-extrabold ${
                    index === activeCard
                      ? "border-sky bg-sky/10 text-sky-ink"
                      : "border-ink/10 text-content-2 dark:border-paper/10"
                  }`}
                >
                  {humanizeCMLId(card.kind)}
                </button>
              ))}
            </div>
          )}
          <div role="tabpanel" className="rounded-card border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-night/60">
            <p className="text-sm font-bold text-sky-ink"><MathProse text={safeCard.label} /></p>
            <p className="mt-1 break-words text-xl font-extrabold tabular-nums"><MathProse text={safeCard.value} /></p>
            {safeCard.detail && <p className="mt-1 text-sm text-content-2"><MathProse text={safeCard.detail} /></p>}
          </div>
        </div>
      )}
    </section>
  );
}
