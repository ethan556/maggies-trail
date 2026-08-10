import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, extraneousCandidates, extraneousHolds } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";

/**
 * Block 6: extraneousRootLab — the only build-then-author engine in the playbook.
 *
 * The claim: squaring both sides of scale*sqrt(x + c) = m*x + b preserves every genuine solution
 * but can INVENT one, because squaring discards the sign of the right-hand side. The invented
 * candidate is exactly where the line, reflected up across the axis, meets the parabola.
 *
 * Everything below is checked against direct substitution into the ORIGINAL equation, never
 * against the quadratic the engine solves — otherwise a bug in that algebra would verify itself.
 */
const base = {
  type: "extraneousRootLab" as const,
  prompt: "p",
  probeStart: 0,
  requiredMoves: 2,
  successFeedback: "S",
  phantomPickedFeedback: "P",
  notSquaredFeedback: "N",
  signRegionFeedback: "R",
  domainConfusionFeedback: "D",
};

describe("extraneousRootLab (Block 6)", () => {
  it("derives the classic phantom, and direct substitution agrees", () => {
    // sqrt(x + 6) = x  ->  x^2 - x - 6 = 0  ->  x = 3 and x = -2.
    const d = extraneousCandidates({ c: 6, scale: 1 }, { m: 1, b: 0 });
    expect(d.candidates).toEqual([-2, 3]);
    expect(d.trueRoots).toEqual([3]);
    expect(d.phantomRoots).toEqual([-2]);
    // Substituting back: 3 works, -2 does not (sqrt(4) = 2, not -2).
    expect(extraneousHolds({ c: 6, scale: 1 }, { m: 1, b: 0 }, 3)).toBe(true);
    expect(extraneousHolds({ c: 6, scale: 1 }, { m: 1, b: 0 }, -2)).toBe(false);
    expect(Math.sqrt(-2 + 6)).toBe(2); // the phantom's real value — positive, not -2
  });

  it("the phantom is exactly where the RHS is negative", () => {
    const rad = { c: 6, scale: 1 }, line = { m: 1, b: 0 };
    for (const x of extraneousCandidates(rad, line).phantomRoots) {
      expect(line.m * x + line.b).toBeLessThan(0); // reflected region
      expect(x + rad.c).toBeGreaterThanOrEqual(0); // but still IN the domain
    }
  });

  it("distinguishes a phantom from an out-of-domain candidate", () => {
    // Out-of-domain means the radicand itself is negative — a different failure from a phantom.
    const d = extraneousCandidates({ c: 6, scale: 1 }, { m: 1, b: 0 });
    expect(d.outOfDomain).toEqual([]);
    for (const x of d.trueRoots) expect(extraneousHolds({ c: 6, scale: 1 }, { m: 1, b: 0 }, x)).toBe(true);
  });

  it("accepts an equation that invents NOTHING, with phantomRoot null", () => {
    // sqrt(x) = 2 -> x = 4 only. A lab implying every radical equation has a phantom would teach
    // a superstition, so the null case must be authorable.
    const d = extraneousCandidates({ c: 0, scale: 1 }, { m: 0, b: 2 });
    expect(d.trueRoots).toEqual([4]);
    expect(d.phantomRoots).toEqual([]);
    const spec = WidgetSpec.parse({ ...base, radical: { c: 0, scale: 1 }, line: { m: 0, b: 2 }, targetPhase: "identifyTrue", trueRoot: 4, phantomRoot: null });
    expect(widgetIntegrityErrors(spec)).toEqual([]);
  });

  it("refuses an authored root the equation does not actually have", () => {
    const swapped = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyPhantom", trueRoot: -2, phantomRoot: 3 });
    const errs = widgetIntegrityErrors(swapped).join(" ");
    expect(errs).toMatch(/authored trueRoot -2 but the equation actually solves at 3/);
    expect(errs).toMatch(/does not satisfy the original equation/);
  });

  it("refuses asking for a phantom where none exists, and refuses starting squared", () => {
    const noPhantom = WidgetSpec.parse({ ...base, radical: { c: 0, scale: 1 }, line: { m: 0, b: 2 }, targetPhase: "identifyPhantom", trueRoot: 4, phantomRoot: null });
    expect(widgetIntegrityErrors(noPhantom).join(" ")).toMatch(/squaring invents none here/);
    const preSquared = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, squared: true, targetPhase: "identifyPhantom", trueRoot: 3, phantomRoot: -2 });
    expect(widgetIntegrityErrors(preSquared).join(" ")).toMatch(/hands over the transformation/);
  });

  it("refuses non-integer candidates rather than rendering a rounded root", () => {
    // sqrt(x + 1) = x  ->  x^2 - x - 1 = 0, the golden ratio: irrational.
    const spec = WidgetSpec.parse({ ...base, radical: { c: 1, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyTrue", trueRoot: 2, phantomRoot: null });
    expect(widgetIntegrityErrors(spec).join(" ")).toMatch(/non-integer candidate/);
  });

  it("will not grade an answer given before the squaring", () => {
    const spec = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyPhantom", trueRoot: 3, phantomRoot: -2 });
    expect(evaluate(spec, { pick: -2, squared: false, moves: 0 }).feedback).toBe("N");
    expect(evaluate(spec, { pick: -2, squared: true, moves: 1 }).feedback).toBe("N"); // squared but not probed
    expect(evaluate(spec, { pick: -2, squared: true, moves: 2 }).correct).toBe(true);
  });

  it("diagnoses each wrong pick distinctly", () => {
    const spec = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyPhantom", trueRoot: 3, phantomRoot: -2 });
    expect(evaluate(spec, { pick: 3, squared: true, moves: 2 }).feedback).toBe("P");
    expect(evaluate(spec, { pick: 99, squared: true, moves: 2 }).feedback).toBe("D");
    expect(canCheck(spec, { pick: null, squared: true, moves: 2 })).toBe(false);
    expect(canCheck(spec, { pick: -2, squared: true, moves: 2 })).toBe(true);
  });

  it("reports the answer for the phase actually asked", () => {
    const phantom = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyPhantom", trueRoot: 3, phantomRoot: -2 });
    expect(correctAnswerText(phantom)).toMatch(/-2/);
    const truth = WidgetSpec.parse({ ...base, radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, targetPhase: "identifyTrue", trueRoot: 3, phantomRoot: -2 });
    expect(correctAnswerText(truth)).toMatch(/3/);
  });
});
