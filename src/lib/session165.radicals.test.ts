import { describe, expect, it } from "vitest";
import { WidgetSpec, exactNumberTruth, evalApproxExpr } from "./schema";
import { canCheck, evaluate } from "./evaluate";

/** S165: radical-equation tasks solve from SURFACE coefficients with integer-exact arithmetic —
 * every division asserts divisibility and every root asserts a perfect power, so a float can
 * never decide an answer. The extraneous task must reject the algebraic ghost root. The sqrt
 * op extends approximationEvaluate to authored square-root models. */

describe("exactNumberLab radical-equation tasks (S165)", () => {
  it("radicalEquationSolve: m·root(kx+b)+d = rhs across square and cube roots", () => {
    // √x + 3 = 10  →  x = 49
    expect(exactNumberTruth({ task: "radicalEquationSolve", values: [], radOuterConst: 3, radRhs: 10 }).answerNumber).toBe(49);
    // √(3x + 1) = 4  →  x = 5
    expect(exactNumberTruth({ task: "radicalEquationSolve", values: [], radInsideCoef: 3, radInsideConst: 1, radRhs: 4 }).answerNumber).toBe(5);
    // 3√(x − 1) − 6 = 0  →  x = 5
    expect(exactNumberTruth({ task: "radicalEquationSolve", values: [], radInsideConst: -1, radOuterCoef: 3, radOuterConst: -6, radRhs: 0 }).answerNumber).toBe(5);
    // ∛(2x + 11) = 3  →  x = 8
    expect(exactNumberTruth({ task: "radicalEquationSolve", values: [], radRootIndex: 3, radInsideCoef: 2, radInsideConst: 11, radRhs: 3 }).answerNumber).toBe(8);
    // domain boundary of √(5x − 20): inside = 0  →  x = 4
    expect(exactNumberTruth({ task: "radicalEquationSolve", values: [], radInsideCoef: 5, radInsideConst: -20, radRhs: 0 }).answerNumber).toBe(4);
  });

  it("radicalEquationSolve throws on non-integer intermediate states — never rounds", () => {
    expect(() => exactNumberTruth({ task: "radicalEquationSolve", values: [], radOuterCoef: 2, radRhs: 5 })).toThrow(/not divisible/);
    expect(() => exactNumberTruth({ task: "radicalEquationSolve", values: [], radInsideCoef: 3, radInsideConst: 1, radRhs: 3 })).toThrow(/not divisible/);
    expect(() => exactNumberTruth({ task: "radicalEquationSolve", values: [], radOuterConst: 5, radRhs: 2 })).toThrow(/cannot be negative/);
  });

  it("radicalEquationExtraneous keeps only the root that satisfies the original equation", () => {
    // √(x + 11) = x − 1: candidates 5 and −2; only 5 survives
    const t = exactNumberTruth({ task: "radicalEquationExtraneous", values: [], extInsideConst: 11, extRhsShift: 1 });
    expect(t.answerNumber).toBe(5);
    expect(t.stages.map((s) => s.key)).toEqual(["radx:square", "radx:quadratic", "radx:check"]);
    // √(x + 4) = x − 2  →  5
    expect(exactNumberTruth({ task: "radicalEquationExtraneous", values: [], extInsideConst: 4, extRhsShift: 2 }).answerNumber).toBe(5);
    // √(x + k) = x with k = s² − s (live-generator shape, b = 0)
    expect(exactNumberTruth({ task: "radicalEquationExtraneous", values: [], extInsideConst: 42, extRhsShift: 0 }).answerNumber).toBe(7);
  });

  it("rationalExponentSolve: c(x+s)^(p/q) = rhs via a perfect-power pivot", () => {
    expect(exactNumberTruth({ task: "rationalExponentSolve", values: [], rexP: 3, rexQ: 2, rexRhs: 27 }).answerNumber).toBe(9);
    expect(exactNumberTruth({ task: "rationalExponentSolve", values: [], rexP: 2, rexQ: 5, rexRhs: 4 }).answerNumber).toBe(32);
    expect(exactNumberTruth({ task: "rationalExponentSolve", values: [], rexCoef: 2, rexP: 3, rexQ: 2, rexRhs: 16 }).answerNumber).toBe(4);
    expect(exactNumberTruth({ task: "rationalExponentSolve", values: [], rexShift: 1, rexP: 3, rexQ: 2, rexRhs: 8 }).answerNumber).toBe(3);
    expect(() => exactNumberTruth({ task: "rationalExponentSolve", values: [], rexP: 3, rexQ: 2, rexRhs: 30 })).toThrow(/perfect/);
  });

  it("approximationEvaluate sqrt op: exact on perfect squares, throws on negatives", () => {
    expect(evalApproxExpr({ op: "sqrt", arg: { op: "lit", value: 144 } }, [])).toBe(12);
    expect(evalApproxExpr({ op: "divide", left: { op: "sqrt", arg: { op: "lit", value: 36 } }, right: { op: "lit", value: 4 } }, [])).toBe(1.5);
    expect(() => evalApproxExpr({ op: "sqrt", arg: { op: "lit", value: -1 } }, [])).toThrow(/negative/);
  });

  it("round-trips a converted spec through Zod, gates, grades, and routes the misconception", () => {
    const spec = WidgetSpec.parse({
      type: "exactNumberLab", prompt: "Solve √(3x + 1) = 4.",
      task: "radicalEquationSolve", values: [], radInsideCoef: 3, radInsideConst: 1, radRhs: 4,
      answerMode: "numeric", tolerance: 0, choices: [],
      numericErrors: [{ value: 16, feedback: "That squares the right side but forgets to remove the +1 and divide by 3." }],
      authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
      explorationFeedback: "Inspect the required exact-number states before checking.",
      fallbackFeedback: "Square both sides, then solve 3x + 1 = 16.",
      successFeedback: "Squaring gives 3x + 1 = 16, so x = 5.",
    }) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
    const truth = exactNumberTruth(spec);
    expect(truth.answerNumber).toBe(5);
    const keys = truth.stages.map((s) => s.key);
    expect(canCheck(spec, { revealed: [], numeric: 5 })).toBe(false);
    expect(canCheck(spec, { revealed: keys, numeric: 5 })).toBe(true);
    expect(evaluate(spec, { revealed: keys, numeric: 5 }).correct).toBe(true);
    const mis = evaluate(spec, { revealed: keys, numeric: 16 });
    expect(mis.correct).toBe(false);
    expect(mis.feedback).toBe("That squares the right side but forgets to remove the +1 and divide by 3.");
  });
});
