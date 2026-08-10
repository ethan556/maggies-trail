import { describe, expect, it } from "vitest";
import { WidgetSpec, exactNumberTruth, evalApproxExpr, type ApproxExpr } from "./schema";
import { canCheck, evaluate } from "./evaluate";

/** S164: approximationEvaluate carries AUTHORED constants and stated rounding as spec inputs.
 * The log-table principle: a given constant used as an input is not circular. These tests pin
 * the evaluator semantics, the rounding, the throw-on-bad-spec behavior, and one full
 * spec round-trip through Zod + canCheck + evaluate. */

const C = (id: string, label: string, value: number) => ({ id, label, value });
const lit = (value: number): ApproxExpr => ({ op: "lit", value });
const con = (id: string): ApproxExpr => ({ op: "const", id });

describe("exactNumberLab approximationEvaluate (S164)", () => {
  it("evaluates the four operators and negate over given constants", () => {
    const cs = [C("a", "a", 0.5), C("b", "b", -2)];
    expect(evalApproxExpr({ op: "add", left: con("a"), right: con("b") }, cs)).toBe(-1.5);
    expect(evalApproxExpr({ op: "subtract", left: con("a"), right: con("b") }, cs)).toBe(2.5);
    expect(evalApproxExpr({ op: "multiply", left: con("a"), right: con("b") }, cs)).toBe(-1);
    expect(evalApproxExpr({ op: "divide", left: con("b"), right: con("a") }, cs)).toBe(-4);
    expect(evalApproxExpr({ op: "negate", arg: con("b") }, cs)).toBe(2);
  });

  it("throws on an unknown constant and on division by zero — never guesses", () => {
    expect(() => evalApproxExpr(con("missing"), [])).toThrow(/unknown constant/);
    expect(() => evalApproxExpr({ op: "divide", left: lit(1), right: lit(0) }, [])).toThrow(/division by zero/);
  });

  it("derives the authored change-of-base answer: 1/0.301 rounded to 2 decimals = 3.32", () => {
    const truth = exactNumberTruth({
      task: "approximationEvaluate", values: [],
      approxConstants: [C("log2", "log 2", 0.301)],
      approxFormula: { op: "divide", left: lit(1), right: con("log2") },
      approxRound: 2,
    });
    expect(truth.answerNumber).toBe(3.32);
    expect(truth.stages.map((s) => s.key)).toEqual(["approx:log2", "approx:compute"]);
  });

  it("requires constants and a formula", () => {
    expect(() => exactNumberTruth({ task: "approximationEvaluate", values: [] })).toThrow(/requires approxConstants/);
  });

  it("round-trips a full spec through Zod, gates on exploration, grades, and rejects wrong answers", () => {
    const spec = WidgetSpec.parse({
      type: "exactNumberLab", prompt: "Given ln 2 ≈ 0.693, evaluate ln 8 to 3 decimal places.",
      task: "approximationEvaluate", values: [],
      approxConstants: [C("ln2", "ln 2", 0.693)],
      approxFormula: { op: "multiply", left: lit(3), right: con("ln2") },
      approxRound: 3,
      answerMode: "numeric", tolerance: 0, choices: [],
      numericErrors: [{ value: 0.693, feedback: "That is ln 2 itself; ln 8 = 3 ln 2." }],
      authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
      explorationFeedback: "Inspect the required exact-number states before checking.",
      fallbackFeedback: "Use the power rule: ln 8 = 3 ln 2.",
      successFeedback: "ln 8 = 3 ln 2 = 3(0.693) = 2.079.",
    }) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
    const truth = exactNumberTruth(spec);
    expect(truth.answerNumber).toBe(2.079);
    const keys = truth.stages.map((s) => s.key);
    expect(canCheck(spec, { revealed: [], numeric: 2.079 })).toBe(false);
    expect(canCheck(spec, { revealed: keys, numeric: 2.079 })).toBe(true);
    expect(evaluate(spec, { revealed: keys, numeric: 2.079 }).correct).toBe(true);
    expect(evaluate(spec, { revealed: keys, numeric: 2.08 }).correct).toBe(false);
    const mis = evaluate(spec, { revealed: keys, numeric: 0.693 });
    expect(mis.correct).toBe(false);
    expect(mis.feedback).toBe("That is ln 2 itself; ln 8 = 3 ln 2.");
  });
});
