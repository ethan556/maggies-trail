/**
 * S118 — binomialAreaLab, the 2D tile engine the ep- cluster was blocked on.
 *
 * Every claim is checked against arithmetic computed IN THE TEST — expanding the product by hand
 * — rather than against `binomialExpand`, so a bug in the shared truth function fails here instead
 * of verifying itself. That is the same discipline `extraneousHolds` gives the radical lab.
 *
 * The engine's whole pedagogical claim is that the middle coefficient is a SUM. The add-vs-multiply
 * misconception is therefore not a message but a reachable state, and the integrity gate refuses
 * any authoring where that state would be indistinguishable from the right answer.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, binomialExpand } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import { describeWidgetState } from "./describeState";

const base = {
  type: "binomialAreaLab" as const,
  prompt: "p",
  pX: 1,
  qX: 1,
  targetA: 2,
  targetB: 3,
  startA: 0,
  startB: 0,
  asks: "middle" as const,
  requiredMoves: 3,
  successFeedback: "ok",
  productMiddleFeedback: "you multiplied the constants",
  partialFeedback: "one side right",
  signFeedback: "right size, wrong direction"
};
const parse = (o: unknown) => WidgetSpec.parse(o);
const spec = (o: Record<string, unknown> = {}) => parse({ ...base, ...o }) as typeof base;

describe("binomialExpand agrees with hand expansion", () => {
  // (pX·x + a)(qX·x + b) = pq·x² + (p·b + q·a)x + ab, checked term by term on real cases.
  const cases: Array<[number, number, number, number, number, number, number]> = [
    // pX, a, qX, b, x², middle, constant
    [1, 2, 1, 3, 1, 5, 6], // (x+2)(x+3) = x²+5x+6
    [1, 5, 1, -2, 1, 3, -10], // (x+5)(x−2) = x²+3x−10
    [1, -4, 1, -1, 1, -5, 4], // (x−4)(x−1) = x²−5x+4
    [1, 4, 1, 4, 1, 8, 16], // (x+4)² = x²+8x+16
    [1, 6, 1, -6, 1, 0, -36], // (x+6)(x−6) = x²−36
    [3, 0, 1, 4, 3, 12, 0] // (3x)(x+4) = 3x²+12x
  ];
  it.each(cases)("(%ix + %i)(%ix + %i) expands to %ix² + %ix + %i", (p, a, q, b, x2, mid, k) => {
    expect(binomialExpand(p, a, q, b)).toEqual({ x2, middle: mid, constant: k });
  });

  it("the middle coefficient is a SUM of the two strips, never their product", () => {
    // The engine's entire pedagogical claim, asserted as arithmetic.
    for (const [p, a, q, b] of cases) {
      const strips = q * a + p * b;
      expect(binomialExpand(p, a, q, b).middle).toBe(strips);
    }
    // And for the canonical case the sum and the product genuinely differ, which is what makes
    // the misconception visible rather than accidental.
    expect(2 + 3).not.toBe(2 * 3);
  });

  it("(x+6)(x−6) loses its middle term because the two strips are equal and opposite", () => {
    expect(1 * -6 + 1 * 6).toBe(0);
    expect(binomialExpand(1, 6, 1, -6).middle).toBe(0);
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed lab", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });

  it("refuses a start position that is already the answer", () => {
    expect(widgetIntegrityErrors(spec({ startA: 2, startB: 3 })).join(" ")).toMatch(/start position IS the target/);
  });

  it("refuses both constants zero — no strips, no corner, nothing to see", () => {
    expect(widgetIntegrityErrors(spec({ targetA: 0, targetB: 0, startA: 1 })).join(" ")).toMatch(/no strips/);
  });

  it("refuses asking for a constant term when a partition is 0", () => {
    expect(widgetIntegrityErrors(spec({ targetA: 0, targetB: 4, asks: "constant", startA: 1 })).join(" ")).toMatch(
      /no corner region/
    );
  });

  it("REFUSES authoring where the product of the constants equals the middle coefficient", () => {
    // (x+2)(x+2): middle 4, product 4 — the add-vs-multiply misconception would be
    // indistinguishable from the right answer, so productMiddleFeedback would be dead copy.
    expect(2 + 2).toBe(2 * 2);
    expect(widgetIntegrityErrors(spec({ targetA: 2, targetB: 2 })).join(" ")).toMatch(/no distinguishable state/);
  });

  it("allows (x+4)² — 8 ≠ 16, so the misconception IS distinguishable there", () => {
    expect(widgetIntegrityErrors(spec({ targetA: 4, targetB: 4, asks: "middle" }))).toEqual([]);
  });
});

describe("grading — four distinguishable paths", () => {
  const s = spec();
  it("refuses to grade before the learner has swept", () => {
    expect(evaluate(s, { a: 2, b: 3, moves: 1 })).toEqual({ correct: false, feedback: s.partialFeedback });
  });

  it("accepts the target", () => {
    expect(evaluate(s, { a: 2, b: 3, moves: 3 }).correct).toBe(true);
  });

  it("accepts the SWAP when the x-coefficients match — the same rectangle turned on its side", () => {
    expect(evaluate(s, { a: 3, b: 2, moves: 3 }).correct).toBe(true);
  });

  it("REJECTS the swap when the x-coefficients differ, because that changes the product", () => {
    const asym = spec({ pX: 3, qX: 1, targetA: 0, targetB: 4, startA: 1, startB: 1, asks: "middle" });
    // (3x)(x+4) = 3x²+12x, but (3x+4)(x) = 3x²+4x — genuinely different products.
    expect(binomialExpand(3, 0, 1, 4)).not.toEqual(binomialExpand(3, 4, 1, 0));
    expect(evaluate(asym, { a: 4, b: 0, moves: 3 }).correct).toBe(false);
  });

  it("diagnoses a sign error specifically", () => {
    const dos = spec({ targetA: 6, targetB: -6, asks: "constant", startA: 1, startB: 1 });
    expect(evaluate(dos, { a: 6, b: 6, moves: 3 })).toEqual({ correct: false, feedback: dos.signFeedback });
  });

  it("diagnoses the add-vs-multiply misconception as a reachable STATE", () => {
    // Target (2,3): middle 5, and the misconception's answer is 6. A learner who lays out a
    // rectangle whose middle coefficient is 6 gets told which quantity they used.
    const r = evaluate(s, { a: 0, b: 6, moves: 3 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(s.productMiddleFeedback);
    expect(binomialExpand(1, 0, 1, 6).middle).toBe(6);
    expect(6).toBe(2 * 3);
  });

  it("falls back to partial for everything else", () => {
    expect(evaluate(s, { a: 2, b: 7, moves: 3 })).toEqual({ correct: false, feedback: s.partialFeedback });
  });
});

describe("surfaces", () => {
  it("canCheck requires both partitions", () => {
    expect(canCheck(spec(), { a: 1, b: 2, moves: 1 })).toBe(true);
    expect(canCheck(spec(), { a: 1, moves: 1 })).toBe(false);
    expect(canCheck(spec(), null)).toBe(false);
  });

  it("correctAnswerText names the sides and the asked coefficient", () => {
    expect(correctAnswerText(spec())).toContain("x + 2");
    expect(correctAnswerText(spec())).toContain("5");
    expect(correctAnswerText(spec({ asks: "constant", targetA: 6, targetB: -6, startA: 1, startB: 1 }))).toContain("-36");
  });

  it("describeState narrates the mathematical state, not the widget", () => {
    const d = describeWidgetState(spec(), { a: 1, b: 1, moves: 2 });
    expect(d).toMatch(/x/);
    expect(d).toContain("x coefficient");
  });

  it("describeState handles the unplaced state without inventing numbers", () => {
    expect(describeWidgetState(spec(), null)).toMatch(/neither partition is placed/);
  });
});
