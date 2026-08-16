/**
 * S242 / ENG-01 R3 — THE MISS FEEDBACK MUST DIAGNOSE, NOT SCORE.
 *
 * `dragBucket`'s miss feedback used to open with `"${right} of ${n} sorted right so far. "`. What
 * that cost was measured, not argued (`scripts/audit/fishing-oracle.mts`, output in
 * `reports/eng/ENG01_R3_FISHING_ORACLE.csv`): an attacker who knows NO mathematics, can enumerate
 * the widget's control states, and reads only the feedback string.
 *
 * With four items and two buckets — the corpus's most common shape, 16 possible sortings — the
 * count split those 16 into TEN feedback classes rather than four, because it stacked on top of the
 * item-identity the string already carried. Inside the platform's two-attempt bound
 * (`playerStore.ts:366-376`) that took the attacker from **12.5% to 68.8%**. Across all 37 graded
 * `dragBucket` steps the mean went 8.7% → 51.8%: better than a coin flip, on a step whose whole
 * purpose is to write a mastery record.
 *
 * Removing it took the graded mean to 22.5%. The item diagnosis stays — it names the misplaced
 * item and says why it belongs elsewhere, which is the pedagogy — and `score` still carries the
 * number for any surface that wants to show progress after the verdict.
 *
 * These tests pin the repair from both ends: the string carries no running count, and the
 * information content of a single probe stays at the diagnosis-only level. The second is the one
 * that matters — a future author could reintroduce the oracle in different words, and only a
 * measurement of what the feedback DISTINGUISHES would notice.
 */
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { WidgetSpec } from "./schema";

/* Authored shape kept as a plain literal so the target can be moved below. `WidgetSpec.parse`
 * returns the whole discriminated union, and narrowing it back to dragBucket at every use adds
 * nothing this test is about. */
const raw = {
  type: "dragBucket" as const,
  prompt: "Sort each number by whether it is even.",
  buckets: [{ id: "even", label: "Even" }, { id: "odd", label: "Odd" }],
  items: [
    { id: "a", label: "4", bucketId: "even", feedback: "4 splits into two equal halves, so it is even." },
    { id: "b", label: "7", bucketId: "odd", feedback: "7 leaves one over when halved, so it is odd." },
    { id: "c", label: "10", bucketId: "even", feedback: "10 splits into two fives, so it is even." },
    { id: "d", label: "3", bucketId: "odd", feedback: "3 leaves one over when halved, so it is odd." },
  ],
  missFeedback: "Halve each number and see whether anything is left over.",
  successFeedback: "Every number sorted by whether halving leaves anything over.",
};

const spec = WidgetSpec.parse(raw);
const ITEMS = ["a", "b", "c", "d"];
const BUCKETS = ["even", "odd"];

/** All 2⁴ sortings — the learner's entire control space. */
const allSortings = (): Array<Record<string, string>> => {
  const out: Array<Record<string, string>> = [];
  const walk = (i: number, acc: Record<string, string>) => {
    if (i === ITEMS.length) return void out.push({ ...acc });
    for (const b of BUCKETS) walk(i + 1, { ...acc, [ITEMS[i]]: b });
  };
  walk(0, {});
  return out;
};

/** Move the target rather than restate the grading rule: this asks the shipped evaluator. */
const withTarget = (target: Record<string, string>) =>
  WidgetSpec.parse({ ...raw, items: raw.items.map((i) => ({ ...i, bucketId: target[i.id] })) });

describe("S242 — dragBucket miss feedback is a diagnosis, not an oracle", () => {
  it("never reports a running score in the feedback string", () => {
    for (const sorting of allSortings()) {
      const r = evaluate(spec, sorting);
      if (r.correct) continue;
      expect(r.feedback, `"${r.feedback}"`).not.toMatch(/\bof\s+\d+\s+sorted\b/i);
      expect(r.feedback, `"${r.feedback}"`).not.toMatch(/\b\d+\s*\/\s*\d+\b/);
    }
  });

  it("still returns the partial score for post-verdict surfaces", () => {
    // Removing the count from the string must not remove the information from the result: the
    // platform's convention is that progress is shown AFTER the verdict, not that it is destroyed.
    const twoRight = evaluate(spec, { a: "even", b: "odd", c: "odd", d: "even" });
    expect(twoRight.correct).toBe(false);
    expect(twoRight.score).toBeCloseTo(0.5);
  });

  it("keeps a single probe worth no more than the item diagnosis", () => {
    /* The measurement itself. For every probe, count how many distinct feedback strings the 16
     * possible targets produce. Four is the diagnosis alone — the string names the first misplaced
     * item, so it can distinguish at most the four items. Ten was the count stacked on top. */
    let worst = 0;
    for (const probe of allSortings()) {
      const classes = new Set<string>();
      for (const target of allSortings()) {
        const r = evaluate(withTarget(target), probe);
        if (!r.correct) classes.add(r.feedback);
      }
      worst = Math.max(worst, classes.size);
    }
    // P(win in 2) = (accepting + classes)/16. At 4 classes that is 5/16 = 31%; at 10 it was 69%.
    expect(worst, "feedback classes a single probe can distinguish").toBeLessThanOrEqual(ITEMS.length);
  });
});
