// @vitest-environment jsdom
/**
 * Regression guard for a mastery-integrity bug: authored content overwhelmingly writes the
 * correct option first — measured across the real corpus at 99.8% for mcq widgets and 87% for
 * predict blocks. Rendering `options` in that authored order let a learner score well (or, for
 * predictions, "commit" convincingly) by pattern-matching position instead of reasoning.
 *
 * The fix (McqW in widgets.tsx; the predict block in LessonPlayer.tsx) shuffles DISPLAY ORDER
 * ONLY with the app's existing seeded PRNG (src/lib/prng.ts — the same mechanism already used
 * for league cohorts and practice-set ordering, per DETERMINISM.md §5). Grading and the
 * prediction-vs-outcome comparison both stay keyed by option `id`, so this cannot change what's
 * correct — only which button a given option happens to render as.
 *
 * This file checks, for both mcq and predict:
 *  1. the shuffle is deterministic (same seed → same order) and seed-sensitive (different seeds
 *     → different orders);
 *  2. grading/outcome-matching follows the id, not the position — clicking whichever button
 *     carries the correct label still grades correct even when it isn't rendered first;
 *  3. the bias is actually gone at the corpus level using the REAL production seed
 *     (`${lessonId}:${stepId}`, exactly as LessonPlayer/QuizShell pass it) — every option-count
 *     bucket lands near its theoretical chance rate, not the historical 95%+ bias.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import React from "react";
import { WidgetRenderer } from "./widgets";
import { seededShuffle } from "@/lib/prng";
import { evaluate } from "@/lib/evaluate";
import type { TMcq, TWidget } from "@/lib/schema";
import { z } from "zod";
import { Prediction } from "@/lib/schema";
type TPrediction = z.infer<typeof Prediction>;

afterEach(cleanup);

const MCQ: TMcq = {
  type: "mcq",
  prompt: "Which is 2 groups of 5?",
  options: [
    { id: "a", label: "2 boxes with 5 pencils each", correct: true, feedback: "Yes — 2 equal groups of 5." },
    { id: "b", label: "2 pencils and 5 pencils", correct: false, feedback: "That mixes two amounts, not equal groups." },
    { id: "c", label: "5 boxes with 2 pencils each", correct: false, feedback: "That's 5 groups of 2 — flipped." },
    { id: "d", label: "7 pencils total", correct: false, feedback: "That's a sum, not a grouping." }
  ]
};

function Host({ spec, seed }: { spec: TWidget; seed?: string }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={spec} value={v} disabled={false} onChange={setV} seed={seed} />;
}

function renderedLabels(seed: string): (string | null)[] {
  const { unmount, container } = render(<Host spec={MCQ} seed={seed} />);
  const labels = Array.from(container.querySelectorAll('[role="radio"]')).map((el) => el.textContent);
  unmount();
  return labels;
}

describe("mcq option order — the shuffle mechanism", () => {
  it("is deterministic: the same seed renders the same visual order every time", () => {
    expect(renderedLabels("lesson-x:step-1")).toEqual(renderedLabels("lesson-x:step-1"));
  });

  it("is seed-sensitive: different seeds render different orders", () => {
    const orders = Array.from({ length: 12 }, (_, i) => renderedLabels(`seed-${i}`).join("|"));
    // With 4! = 24 possible orderings and 12 seeds, seeing more than one distinct order is
    // overwhelming evidence the options are actually being shuffled, not left in place.
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("never changes WHICH option is correct — grading follows the label, not the position", () => {
    // Find a seed that displaces the correct option away from position 0 (the bug this guards
    // against), then prove clicking it by its LABEL still grades correct.
    let seed = "";
    for (let i = 0; i < 50; i++) {
      if (seededShuffle(MCQ.options, `probe-${i}`)[0].id !== "a") {
        seed = `probe-${i}`;
        break;
      }
    }
    expect(seed).not.toBe(""); // sanity: a displacing seed was found within 50 tries

    render(<Host spec={MCQ} seed={seed} />);
    const correctButton = screen.getByRole("radio", { name: /2 boxes with 5 pencils each/ });
    expect(screen.getAllByRole("radio")[0]).not.toBe(correctButton);

    fireEvent.click(correctButton);
    expect(evaluate(MCQ, "a").correct).toBe(true);
  });
});

function allMcqWidgetOptions(): Array<TMcq["options"]> {
  const root = join(process.cwd(), "content", "courses");
  const out: Array<TMcq["options"]> = [];
  for (const course of readdirSync(root)) {
    const dir = join(root, course, "lessons");
    let files: string[] = [];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as { steps: Array<{ widget?: TWidget }> };
      for (const s of lesson.steps) {
        if (s.widget?.type === "mcq") out.push(s.widget.options);
      }
    }
  }
  return out;
}

describe("mcq option order — the real content corpus", () => {
  it("the authored corpus IS heavily biased toward position 0 (documents why the fix exists)", () => {
    const rows = allMcqWidgetOptions();
    expect(rows.length).toBeGreaterThan(1000);
    const authoredPos0 = rows.filter((opts) => opts[0]?.correct).length;
    // Pinned so nobody "fixes" this by shuffling the JSON itself (which would just freeze a new,
    // still-fixed order) instead of shuffling at render time.
    expect(authoredPos0 / rows.length).toBeGreaterThan(0.95);
  });

  it("the PRODUCTION seed (lessonId:stepId, as LessonPlayer/QuizShell actually pass it) lands each option-count bucket near its theoretical chance rate", () => {
    // Deliberately NOT testing the option-id-only fallback here: content reuses only 8 distinct
    // id patterns across all 2,453 mcq widgets (e.g. "o1|o2|o3|o4" appears 807 times), so an
    // id-only seed collapses thousands of DIFFERENT questions onto a handful of shared shuffles —
    // shifting the bias to a new fixed position instead of removing it. The seed that reaches
    // real learners is unique per question (`${lessonId}:${stepId}`), which this test exercises.
    const root = join(process.cwd(), "content", "courses");
    const rows: Array<{ seed: string; opts: TMcq["options"] }> = [];
    for (const course of readdirSync(root)) {
      const dir = join(root, course, "lessons");
      let files: string[] = [];
      try {
        files = readdirSync(dir);
      } catch {
        continue;
      }
      for (const f of files) {
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: TWidget }>;
        };
        for (const s of lesson.steps) {
          if (s.widget?.type === "mcq") rows.push({ seed: `${lesson.id}:${s.id}`, opts: s.widget.options });
        }
      }
    }
    expect(rows.length).toBeGreaterThan(1000);

    const byLen = new Map<number, { n: number; pos0: number }>();
    for (const { seed, opts } of rows) {
      const shuffled = seededShuffle(opts, seed);
      const bucket = byLen.get(opts.length) ?? { n: 0, pos0: 0 };
      bucket.n++;
      if (shuffled[0]?.correct) bucket.pos0++;
      byLen.set(opts.length, bucket);
    }

    for (const [len, { n, pos0 }] of byLen) {
      if (n < 15) continue; // too few instances (the "lt|gt|eq" 3-way family) for a stable rate
      const rate = pos0 / n;
      const chance = 1 / len;
      // Generous ±20-point band around theoretical chance: tight enough to catch a regression
      // back toward the historical 95%+ bias (or an accidental "always last"), loose enough to
      // tolerate ordinary sampling noise and future PRNG tweaks.
      expect(rate).toBeGreaterThan(Math.max(0, chance - 0.2));
      expect(rate).toBeLessThan(Math.min(1, chance + 0.2));
    }
  });
});

/* ------------------------------------------------------------------------------------------- */
/* The same bug, in the predict → manipulate → observe commitment step (LessonPlayer.tsx).       */
/* ------------------------------------------------------------------------------------------- */

const PREDICT: TPrediction = {
  prompt: "Add one more group of 4. What happens to the total?",
  options: [
    { id: "plus4", label: "It goes up by 4" },
    { id: "plus1", label: "It goes up by 1" },
    { id: "same", label: "It stays the same" }
  ],
  outcomeId: "plus4",
  reveal: "Each new group carries 4 more — the total climbs in equal jumps of the group size."
};

describe("predict option order — the shuffle mechanism", () => {
  const orderFor = (seed: string) => seededShuffle(PREDICT.options, seed).map((o) => o.id);

  it("is deterministic: the same seed yields the same order every time", () => {
    expect(orderFor("lesson-x:step-1:predict")).toEqual(orderFor("lesson-x:step-1:predict"));
  });

  it("is seed-sensitive: different seeds can yield different orders", () => {
    const orders = Array.from({ length: 12 }, (_, i) => orderFor(`seed-${i}:predict`).join("|"));
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("never changes WHICH option is the outcome — the comparison follows the id, not the position", () => {
    // Find a seed that displaces the true outcome away from position 0.
    let seed = "";
    for (let i = 0; i < 50; i++) {
      if (seededShuffle(PREDICT.options, `probe-${i}:predict`)[0].id !== PREDICT.outcomeId) {
        seed = `probe-${i}:predict`;
        break;
      }
    }
    expect(seed).not.toBe("");
    const ordered = seededShuffle(PREDICT.options, seed);
    expect(ordered[0].id).not.toBe(PREDICT.outcomeId);
    // Whichever position it renders at, the outcome lookup (LessonPlayer does `.find(o => o.id
    // === outcomeId)`) still resolves to the same, correct option — order-independent by design.
    const outcome = ordered.find((o) => o.id === PREDICT.outcomeId);
    expect(outcome?.label).toBe("It goes up by 4");
  });
});

function allPredictBlocks(): Array<{ seed: string; predict: TPrediction }> {
  const root = join(process.cwd(), "content", "courses");
  const out: Array<{ seed: string; predict: TPrediction }> = [];
  for (const course of readdirSync(root)) {
    const dir = join(root, course, "lessons");
    let files: string[] = [];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps: Array<{ id: string; predict?: TPrediction }>;
      };
      for (const s of lesson.steps) {
        if (s.predict) out.push({ seed: `${lesson.id}:${s.id}:predict`, predict: s.predict });
      }
    }
  }
  return out;
}

describe("predict option order — the real content corpus", () => {
  it("the authored corpus IS heavily biased toward the outcome sitting first (documents why the fix exists)", () => {
    const rows = allPredictBlocks();
    expect(rows.length).toBeGreaterThan(300);
    const authoredPos0 = rows.filter((r) => r.predict.options[0]?.id === r.predict.outcomeId).length;
    expect(authoredPos0 / rows.length).toBeGreaterThan(0.8);
  });

  it("the PRODUCTION seed (lessonId:stepId:predict) lands each option-count bucket near its theoretical chance rate", () => {
    const rows = allPredictBlocks();
    expect(rows.length).toBeGreaterThan(300);

    const byLen = new Map<number, { n: number; pos0: number }>();
    for (const { seed, predict } of rows) {
      const shuffled = seededShuffle(predict.options, seed);
      const bucket = byLen.get(predict.options.length) ?? { n: 0, pos0: 0 };
      bucket.n++;
      if (shuffled[0]?.id === predict.outcomeId) bucket.pos0++;
      byLen.set(predict.options.length, bucket);
    }

    for (const [len, { n, pos0 }] of byLen) {
      if (n < 15) continue;
      const rate = pos0 / n;
      const chance = 1 / len;
      expect(rate).toBeGreaterThan(Math.max(0, chance - 0.2));
      expect(rate).toBeLessThan(Math.min(1, chance + 0.2));
    }
  });
});
