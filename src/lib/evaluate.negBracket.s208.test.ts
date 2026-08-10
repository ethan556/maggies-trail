/**
 * THE STANDING-NEGATIVE-BRACKET SIGN — S208 Wave 2b release fix.
 *
 * `−5(x + 3)` is FIVE COPIES OF `−(x + 3)`, not minus-five copies of `+(x + 3)`. The sign travels
 * with every chip, so five unopened copies weigh `5 × (−1) × (1·x + 3)`.
 *
 * The renderer has always weighed a standing bracket that way. `evaluate.ts` did not: it multiplied
 * the copy count by the bracket's contents and dropped `sign(count)` entirely. For a negative
 * multiplier that read the left pan with the wrong sign, so the grader and the picture told two
 * different stories about the same tiles — and the two stories crossed exactly where the lesson
 * lives:
 *
 *   · `tse-03-02` (`−5(x + 3) = −20`) opens with a LEVEL beam. A learner who pressed Check before
 *     opening the brackets was told "The beam tipped — a tile moved on one pan only", having moved
 *     nothing at all.
 *   · The lesson's own `unexpandedFeedback` begins "The pan balances, but tiles locked inside a
 *     group cannot be moved one at a time" — a sentence written for a state the grader could not
 *     reach. That branch was dead for this lesson.
 *
 * Every expectation below is hand arithmetic on the tile counts, written out in the comments.
 * Nothing is read back from the model or from the renderer.
 *
 * BLAST RADIUS (swept exhaustively over all 28 authored `solveBalance` instances, 1,708,798 states):
 * only `tse-03-02` changes. The fix is a bit-for-bit no-op wherever `groups === 0` (the group terms
 * vanish) and wherever `groups.count > 0` (`sign(count)` is +1), which is every other lesson. The
 * pins in this file hold that line.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { evaluate } from "@/lib/evaluate";
import { SolveBalanceSpec, solveBalanceWitness, type TSolveBalance, type TWidget } from "@/lib/schema";

/* ─────────────────────────────── the specs, and how to read a verdict ─────────────────────────────── */

/** Distinguishable feedback so a verdict can be named rather than string-matched. */
const FB = {
  successFeedback: "SUCCESS",
  unbalancedFeedback: "UNBALANCED",
  notIsolatedFeedback: "NOTISOLATED",
  missFeedback: "MISS",
  unexpandedFeedback: "UNEXPANDED",
  partialDistributeFeedback: "PARTIAL",
};

/** `−5(x + 3) = −20`, the shape `tse-03-02` teaches. (c − b)/a = (−20 + 15)/(−5) = 1, so x = 1 and
 * both pans are weighed at 1. */
const NEG = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve −5(x + 3) = −20.",
  a: -5,
  b: -15,
  c: -20,
  groups: { count: -5, x: 1, unit: 3 },
  ...FB,
}) as TSolveBalance;

/** `3(x + 2) = 18`, the shape `tse-03-01` teaches. (18 − 6)/3 = 4, so x = 4. A positive multiplier:
 * `sign(count)` is +1 and the fix cannot reach it. */
const POS = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3(x + 2) = 18.",
  a: 3,
  b: 6,
  c: 18,
  groups: { count: 3, x: 1, unit: 2 },
  ...FB,
}) as TSolveBalance;

/** `3x + 4 = 19`, no brackets at all. x = 5. */
const FLAT = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3x + 4 = 19.",
  a: 3,
  b: 4,
  c: 19,
  ...FB,
}) as TSolveBalance;

const st = (
  leftX: number,
  leftUnits: number,
  rightUnits: number,
  groups = 0,
  partial = 0
) => ({ leftX, leftUnits, rightUnits, groups, partial, rel: "eq" as const });

const verdict = (spec: TSolveBalance, state: ReturnType<typeof st>) => {
  const r = evaluate(spec as TWidget, state);
  return r.correct ? "SUCCESS" : r.feedback;
};

/* ─────────────────────── 1. a negative multiplier, beam level → unexpanded ─────────────────────── */

describe("a standing negative bracket that balances is UNFINISHED, not wrong", () => {
  it("weighs the problem at x = 1, so the untouched start is level", () => {
    // (c − b) / a = (−20 − (−15)) / (−5) = (−5) / (−5) = 1.
    expect(solveBalanceWitness(-5, -15, -20, "eq")).toBe(1);
    // One unopened copy of −(x + 3) weighs −(1·1 + 3) = −4; five of them weigh −20.
    // The right pan holds −20. The pans match, so nothing has been broken — only left undone.
    expect(verdict(NEG, st(0, 0, -20, 5))).toBe("UNEXPANDED");
  });

  it("names the same state for every count of copies still sealed", () => {
    // k copies weigh −4k, so the pan they balance is −4k. Each of these is a level beam.
    for (const k of [1, 2, 3, 4, 5]) {
      expect([k, verdict(NEG, st(0, 0, -4 * k, k))]).toEqual([k, "UNEXPANDED"]);
    }
  });

  it("still balances when the sealed groups sit beside loose tiles", () => {
    // 2 sealed copies (−8), 3 negative x-tiles (−3) and 1 negative unit (−1) weigh −12 at x = 1.
    expect(verdict(NEG, st(-3, -1, -12, 2))).toBe("UNEXPANDED");
    // 4 sealed copies (−16) plus 2 positive units (+2) weigh −14.
    expect(verdict(NEG, st(0, 2, -14, 4))).toBe("UNEXPANDED");
  });

  it("a level pan is never diagnosed as a broken distribute, even with the partial flag set", () => {
    // The partial branch is gated on the beam being tipped. Before the fix this state read as
    // tipped (left = +20 against −20) and was diagnosed PARTIAL — a distribute fault reported for
    // a pan that had not been distributed at all.
    expect(verdict(NEG, st(0, 0, -20, 5, 1))).toBe("UNEXPANDED");
  });
});

/* ──────────────────── 2. a negative multiplier genuinely broken → unbalanced ──────────────────── */

describe("a standing negative bracket that does NOT balance is still unbalanced", () => {
  it("one tile taken off one pan tips it, and is named as such", () => {
    // Five sealed copies weigh −20; the right pan lost one negative unit and holds −19.
    expect(verdict(NEG, st(0, 0, -19, 5))).toBe("UNBALANCED");
    // A positive unit added to the left only: −20 + 1 = −19 against −20.
    expect(verdict(NEG, st(0, 1, -20, 5))).toBe("UNBALANCED");
  });

  it("the position the old grader mistook for level is now named correctly", () => {
    // 6 negative x-tiles (−6), 15 negative units (−15) and 5 sealed copies (−20) weigh −41 at
    // x = 1, against −1 on the right. Emphatically tipped. The old grader computed the sealed
    // copies as +20, landed on −1, and called this position UNEXPANDED — "the pan balances".
    expect(verdict(NEG, st(-6, -15, -1, 5))).toBe("UNBALANCED");
  });

  it("a tipped pan with the partial flag keeps its named misconception", () => {
    // The multiplier reached the x and stopped: −5x with one copy of −3, so −5 − 3 = −8 at x = 1,
    // against −20. Tipped, partial → the distribute fault, exactly as before (groups === 0 here,
    // so this position is untouched by the fix and is pinned as a control).
    expect(verdict(NEG, st(-5, -3, -20, 0, 1))).toBe("PARTIAL");
  });

  it("the finished ladder is unchanged: distributed, cleared, split, flipped", () => {
    // Opened to −5x − 15 = −20: level (−5 − 15 = −20), but x is not alone.
    expect(verdict(NEG, st(-5, -15, -20))).toBe("NOTISOLATED");
    // Fifteen negative units off both pans: −5x = −5. Level, still not alone.
    expect(verdict(NEG, st(-5, 0, -5))).toBe("NOTISOLATED");
    // Split into five: −x = −1. Level, not alone (it is −x, not x).
    expect(verdict(NEG, st(-1, 0, -1))).toBe("NOTISOLATED");
    // ×(−1): x = 1.
    expect(verdict(NEG, st(1, 0, 1))).toBe("SUCCESS");
  });
});

/* ──────────── 3. the beam and the grader now tell one story, over the whole state space ──────────── */

describe("renderer/evaluator agreement for the negative bracket", () => {
  it("the grader calls a position broken exactly when hand arithmetic tips the beam", () => {
    const wx = 1; // hand-derived above
    const copyWeight = -1 * (1 * wx + 3); // sign(count) × (x·wx + unit) = −4
    let checked = 0;
    const mismatches: string[] = [];
    for (const groups of [0, 1, 2, 3, 4, 5]) {
      for (let leftX = -6; leftX <= 6; leftX++) {
        for (let leftUnits = -16; leftUnits <= 16; leftUnits++) {
          for (let rightUnits = -24; rightUnits <= 24; rightUnits++) {
            for (const partial of [0, 1]) {
              const coefX = leftX + groups * -1 * 1;
              // The "no x left at all" branch pre-empts the beam, by design; it is checked
              // separately below rather than folded into this equivalence.
              if (coefX === 0 && groups === 0) continue;
              const left = leftX * wx + leftUnits + groups * copyWeight;
              const level = left === rightUnits;
              const v = verdict(NEG, st(leftX, leftUnits, rightUnits, groups, partial));
              const graderSaysBroken = v === "UNBALANCED" || v === "PARTIAL";
              checked++;
              if (level === graderSaysBroken)
                mismatches.push(`(${leftX},${leftUnits},${rightUnits},g${groups},p${partial}) level=${level} → ${v}`);
            }
          }
        }
      }
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(checked).toBeGreaterThan(50000);
  });

  it("every x-tile gone with no brackets left is still the most specific diagnosis", () => {
    // 0·1 + (−4) = −4 against −4: the pans level, but there is no x to solve for.
    expect(verdict(NEG, st(0, -4, -4))).toBe("MISS");
  });
});

/* ─────────────────────────── 4. regression pins: nothing else may move ─────────────────────────── */

describe("a POSITIVE multiplier is bit-for-bit unchanged", () => {
  it("weighs 3(x + 2) = 18 at x = 4 and grades the whole ladder as it always did", () => {
    expect(solveBalanceWitness(3, 6, 18, "eq")).toBe(4);
    // One unopened copy of +(x + 2) weighs 1·4 + 2 = 6; three of them weigh 18, against 18.
    expect(verdict(POS, st(0, 0, 18, 3))).toBe("UNEXPANDED");
    // One negative unit off the right pan only: 18 against 17.
    expect(verdict(POS, st(0, 0, 17, 3))).toBe("UNBALANCED");
    // Opened to both parts: 3·4 + 6 = 18. Level, not alone.
    expect(verdict(POS, st(3, 6, 18))).toBe("NOTISOLATED");
    // The multiplier stopped at the x: 3·4 + 2 = 14 against 18. Tipped, partial.
    expect(verdict(POS, st(3, 2, 18, 0, 1))).toBe("PARTIAL");
    // Cleared and split: x = 4.
    expect(verdict(POS, st(1, 0, 4))).toBe("SUCCESS");
  });

  it("holds across every count of sealed copies", () => {
    // k copies weigh 6k and balance a pan of 6k — level, unfinished, for every k.
    for (const k of [1, 2, 3]) expect([k, verdict(POS, st(0, 0, 6 * k, k))]).toEqual([k, "UNEXPANDED"]);
    for (const k of [1, 2, 3]) expect([k, verdict(POS, st(0, 0, 6 * k + 1, k))]).toEqual([k, "UNBALANCED"]);
  });
});

describe("a lesson with no brackets cannot be touched by a bracket fix", () => {
  it("3x + 4 = 19 grades exactly as it has since S119", () => {
    expect(solveBalanceWitness(3, 4, 19, "eq")).toBe(5);
    expect(verdict(FLAT, st(1, 0, 5))).toBe("SUCCESS"); // 5 = 5, alone
    expect(verdict(FLAT, st(3, 0, 19))).toBe("UNBALANCED"); // 15 against 19
    expect(verdict(FLAT, st(3, 0, 15))).toBe("NOTISOLATED"); // 15 = 15, not alone
    expect(verdict(FLAT, st(0, 4, 4))).toBe("MISS"); // level, but no x remains
    expect(verdict(FLAT, st(3, 4, 19))).toBe("NOTISOLATED"); // the problem as written
  });

  it("a groups field the state never mentions leaves the arithmetic alone", () => {
    // Same states, `groups: 0` spelled out: the group terms multiply by zero either way.
    expect(verdict(FLAT, st(1, 0, 5, 0))).toBe("SUCCESS");
    expect(verdict(FLAT, st(3, 0, 19, 0))).toBe("UNBALANCED");
  });
});

/* ───────────────────── 5. the shipped lesson: the dead branch is alive again ───────────────────── */

describe("tse-03-02, the authored lesson this fix exists for", () => {
  const lesson = JSON.parse(
    readFileSync("content/courses/two-step-equations/lessons/tse-03-02.json", "utf8")
  ) as { steps: Array<{ widget?: Record<string, unknown> }> };
  const authored = SolveBalanceSpec.parse(
    lesson.steps.find((s) => s.widget && s.widget.type === "solveBalance" && s.widget.groups)!.widget
  ) as TSolveBalance;

  it("is the negative-multiplier shape, untouched by this session", () => {
    expect(authored.a).toBe(-5);
    expect(authored.b).toBe(-15);
    expect(authored.c).toBe(-20);
    expect(authored.groups).toEqual({ count: -5, x: 1, unit: 3 });
  });

  it("a learner who checks before opening the groups is told the groups are sealed", () => {
    const start = st(0, 0, -20, 5);
    const r = evaluate(authored as TWidget, start);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(authored.unexpandedFeedback);
    // …and NOT the message that says they moved a tile, which is what they used to receive
    // having moved nothing at all.
    expect(r.feedback).not.toBe(authored.unbalancedFeedback);
  });

  it("that message's own claim about the pans is now true", () => {
    // The authored sentence opens "The pan balances, but tiles locked inside a group cannot be
    // moved one at a time". It was written for a state the grader could not produce; the branch
    // was dead for this lesson until the sign was fixed.
    expect(authored.unexpandedFeedback).toMatch(/pan balances/);
    const left = 5 * -1 * (1 * 1 + 3); // −20, by hand
    expect(left).toBe(authored.c);
    expect(evaluate(authored as TWidget, st(0, 0, -20, 5)).feedback).toBe(authored.unexpandedFeedback);
  });

  it("a genuinely one-sided move still earns the tipped-beam message", () => {
    expect(evaluate(authored as TWidget, st(0, 0, -19, 5)).feedback).toBe(authored.unbalancedFeedback);
  });

  it("the rest of the lesson's ladder is unchanged", () => {
    expect(evaluate(authored as TWidget, st(-5, -15, -20)).feedback).toBe(authored.notIsolatedFeedback);
    expect(evaluate(authored as TWidget, st(-5, -3, -20, 0, 1)).feedback).toBe(authored.partialDistributeFeedback);
    expect(evaluate(authored as TWidget, st(1, 0, 1)).correct).toBe(true);
    expect(evaluate(authored as TWidget, st(1, 0, 1)).feedback).toBe(authored.successFeedback);
  });
});
