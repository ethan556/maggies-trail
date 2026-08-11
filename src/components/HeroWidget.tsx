"use client";

import { useState } from "react";
import Image from "next/image";
import { evaluate } from "@/lib/evaluate";
import type { TSlider } from "@/lib/schema";
import { COPY } from "@/lib/copy";

const GROUP_SIZE = 4;
const TARGET_GROUPS = 5;
const MAX_GROUPS = 8;

/** The hero is a real task using the production evaluator, with a purpose-built equal-groups model. */
const HERO_SPEC = {
  type: "slider",
  prompt: "Build 5 equal groups. Put 4 berries in every group.",
  min: 0,
  max: MAX_GROUPS,
  step: 1,
  start: 1,
  target: TARGET_GROUPS,
  visual: "groups",
  groupSize: GROUP_SIZE,
  groupLayout: "row",
  itemEmoji: "berry",
  unitLabel: "berries in all",
  lowFeedback: "Not there yet — each new row adds one whole group of 4.",
  highFeedback: "That is more than 5 groups — remove a row.",
  successFeedback: "Correct checkpoint: 5 equal groups of 4 make 20. Keep exploring, or continue when you are ready."
} satisfies TSlider;

const GROUP_TONES = [
  "border-sky/40 bg-sky/10",
  "border-tangerine/45 bg-tangerine/10",
  "border-leaf/40 bg-leaf/10",
  "border-berry/35 bg-berry/10",
  "border-violet-400/40 bg-violet-100/70 dark:bg-violet-950/30",
] as const;

export default function HeroWidget() {
  const [groups, setGroups] = useState(HERO_SPEC.start);
  const [state, setState] = useState<"idle" | "wrong" | "right">("idle");
  const [feedback, setFeedback] = useState("");
  const total = groups * GROUP_SIZE;

  function changeGroups(next: number) {
    setGroups(Math.max(HERO_SPEC.min, Math.min(HERO_SPEC.max, next)));
    setState("idle");
    setFeedback("");
  }

  function check() {
    const result = evaluate(HERO_SPEC, groups);
    setState(result.correct ? "right" : "wrong");
    setFeedback(result.feedback);
  }

  return (
    <div className="stage rounded-card border border-ink/10 p-5 shadow-e2">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-tangerine-ink">
        Try it — this is a real lesson widget
      </p>

      <section className="grid gap-3 rounded-card border border-ink/10 bg-white/70 p-4 dark:bg-ink/20" aria-labelledby="hero-grouping-prompt">
        <div>
          <h2 id="hero-grouping-prompt" className="text-lg font-extrabold text-ink dark:text-paper">
            Build 5 equal groups.
          </h2>
          <p className="mt-1 text-sm font-semibold text-ink/70 dark:text-paper/75">
            Add one row at a time. Every row must hold 4 berries.
          </p>
        </div>

        <ol className="grid gap-1.5" aria-label={`${groups} ${groups === 1 ? "group" : "groups"} built; target 5; ${total} berries in all`}>
          {Array.from({ length: Math.max(TARGET_GROUPS, groups) }, (_, groupIndex) => {
            const active = groupIndex < groups;
            return (
              <li
                key={groupIndex}
                className={`grid min-h-10 grid-cols-[4.5rem_1fr] items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors ${
                  active ? GROUP_TONES[groupIndex % GROUP_TONES.length] : "border-dashed border-ink/15 bg-transparent"
                }`}
              >
                <span className={`text-xs font-extrabold ${active ? "text-ink/75 dark:text-paper/80" : "text-ink/35 dark:text-paper/35"}`}>
                  Group {groupIndex + 1}
                </span>
                <span className="flex items-center justify-center gap-2" aria-hidden="true">
                  {active ? Array.from({ length: GROUP_SIZE }, (_, berryIndex) => (
                    <Image
                      key={berryIndex}
                      src="/assets/manipulatives/blueberry-token.png"
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  )) : <span className="text-xs font-bold text-ink/30 dark:text-paper/30">Empty row</span>}
                </span>
                <span className="sr-only">{active ? `Group ${groupIndex + 1}: 4 berries` : `Group ${groupIndex + 1}: empty`}</span>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink/[0.04] px-3 py-2 dark:bg-paper/[0.06]">
          <p className="font-extrabold tabular-nums text-ink dark:text-paper" aria-live="polite">
            <span className="text-sky-ink">{groups} {groups === 1 ? "group" : "groups"}</span>
            <span aria-hidden="true"> × </span>
            <span className="sr-only"> times </span>
            <span className="text-tangerine-ink">4 berries</span>
            <span aria-hidden="true"> = </span>
            <span className="sr-only"> equals </span>
            <span className="text-leaf-ink">{total} total</span>
          </p>
          <div className="flex gap-2" aria-label="Change the number of groups">
            <button
              type="button"
              onClick={() => changeGroups(groups - 1)}
              disabled={groups <= HERO_SPEC.min}
              className="pressable min-h-11 rounded-xl border-2 border-ink/15 bg-white px-3 text-sm font-extrabold text-ink shadow-sm disabled:opacity-40 dark:bg-ink dark:text-paper"
            >
              Remove row
            </button>
            <button
              type="button"
              onClick={() => changeGroups(groups + 1)}
              disabled={groups >= HERO_SPEC.max}
              className="pressable min-h-11 rounded-xl bg-cta px-4 text-sm font-extrabold text-white shadow-e1 disabled:opacity-40"
            >
              Add a group of 4
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="pressable min-h-11 rounded-pill bg-cta px-6 font-bold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-50"
        >
          {COPY.check}
        </button>
        {state !== "idle" && (
          <p
            role="status"
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
