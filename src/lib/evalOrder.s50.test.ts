import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { EvalOrderSpec, evalTokens, evalOrderReachable, applyEvalOp, isEvalOp, widgetIntegrityErrors } from "./schema";

/** s50 — evalOrder is the precedence laboratory. The point of the engine is that collapsing in
 * the WRONG order is allowed and produces a visibly wrong number, so the lesson's authored
 * misconception ("you added before multiplying") lands on a state the learner actually built. */

const spec = EvalOrderSpec.parse({
  type: "evalOrder",
  prompt: "Work out 2 + 3 × 4.",
  tokens: ["2", "+", "3", "×", "4"],
  target: 14,
  commonResults: [{ value: 20, feedback: "20 collapses left to right. × binds tighter: 2 + 12 = 14." }],
  fallbackFeedback: "× goes before +: 3 × 4 = 12, then 2 + 12 = 14.",
  successFeedback: "Right — 2 + 3 × 4 = 2 + 12 = 14."
});

describe("evalTokens — standard precedence", () => {
  it("binds × and ÷ tighter than + and −", () => {
    expect(evalTokens(["2", "+", "3", "×", "4"])).toBe(14);
    expect(evalTokens(["10", "−", "2", "×", "3"])).toBe(4);
    expect(evalTokens(["20", "÷", "4", "+", "1"])).toBe(6);
  });

  it("honours parentheses over precedence", () => {
    expect(evalTokens(["(", "2", "+", "3", ")", "×", "4"])).toBe(20);
    expect(evalTokens(["3", "×", "(", "4", "+", "2", ")"])).toBe(18);
  });

  it("binds ^ tightest and right-associatively", () => {
    expect(evalTokens(["2", "+", "3", "^", "2"])).toBe(11);
    expect(evalTokens(["2", "^", "3", "^", "2"])).toBe(512); // 2^(3^2), not (2^3)^2 = 64
  });

  it("evaluates same-precedence operators left to right", () => {
    expect(evalTokens(["10", "−", "3", "−", "2"])).toBe(5);
    expect(evalTokens(["12", "÷", "3", "÷", "2"])).toBe(2);
  });

  it("returns null for a malformed stream rather than inventing an answer", () => {
    expect(evalTokens(["2", "+"])).toBeNull();
    expect(evalTokens(["(", "2", "+", "3"])).toBeNull();
    expect(evalTokens(["2", "+", "x"])).toBeNull();
    expect(evalTokens(["1", "÷", "0"])).toBeNull();
  });

  it("classifies operators and applies them", () => {
    expect(isEvalOp("×")).toBe(true);
    expect(isEvalOp("7")).toBe(false);
    expect(applyEvalOp("−", 9, 4)).toBe(5);
    expect(applyEvalOp("^", 3, 2)).toBe(9);
  });
});

describe("evalOrder grading", () => {
  it("is uncheckable until the expression is a single number", () => {
    expect(canCheck(spec, { tokens: ["2", "+", "12"] })).toBe(false);
    expect(canCheck(spec, { tokens: ["14"] })).toBe(true);
  });

  it("accepts the fully collapsed target", () => {
    expect(evaluate(spec, { tokens: ["14"] }).correct).toBe(true);
  });

  it("gives the authored diagnosis for the left-to-right collapse", () => {
    const wrong = evaluate(spec, { tokens: ["20"] });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toBe(spec.commonResults[0].feedback);
  });

  it("falls back for an unlisted wrong value, and nudges when unfinished", () => {
    expect(evaluate(spec, { tokens: ["9"] }).feedback).toBe(spec.fallbackFeedback);
    expect(evaluate(spec, { tokens: ["2", "+", "12"] }).feedback).toContain("Keep collapsing");
    expect(evaluate(spec, null).feedback).toContain("Tap an operator");
  });

  it("reports the correct answer text", () => {
    expect(correctAnswerText(spec)).toBe("14");
  });
});

describe("evalOrder integrity gate — the engine owns correctness", () => {
  const errs = (o: Record<string, unknown>) =>
    widgetIntegrityErrors(EvalOrderSpec.parse({ ...spec, ...o }));

  it("passes a consistent spec", () => {
    expect(errs({})).toEqual([]);
  });

  it("rejects a target that contradicts the expression", () => {
    expect(errs({ target: 20 }).join(" ")).toContain("contradicts the expression");
  });

  it("rejects a misconception landing that equals the correct value", () => {
    expect(errs({ commonResults: [{ value: 14, feedback: "x" }] }).join(" ")).toContain(
      "equals the correct value"
    );
  });

  it("rejects an unparseable token stream", () => {
    expect(errs({ tokens: ["2", "+", "+"], target: 14 }).join(" ")).toContain("does not parse");
  });
});

describe("evalOrderReachable — the precedence decision must be live", () => {
  it("finds both the correct value and the left-to-right trap", () => {
    const r = evalOrderReachable(["2", "+", "3", "×", "4"]);
    expect([...r].sort((a, b) => a - b)).toEqual([14, 20]);
  });

  it("collapses to a single value when parentheses remove the choice", () => {
    expect(evalOrderReachable(["(", "2", "+", "3", ")", "×", "4"])).toEqual(new Set([20]));
    expect(evalOrderReachable(["2", "^", "4"])).toEqual(new Set([16]));
  });

  it("exposes the add-before-power trap", () => {
    const r = evalOrderReachable(["2", "+", "3", "^", "2"]);
    expect(r.has(11)).toBe(true); // 2 + 9
    expect(r.has(25)).toBe(true); // (2 + 3)^2
  });

  it("rejects a spec whose only collapse order is forced (no wrong path to learn from)", () => {
    const errs = widgetIntegrityErrors(
      EvalOrderSpec.parse({
        type: "evalOrder",
        prompt: "Work out (2 + 3) × 4.",
        tokens: ["(", "2", "+", "3", ")", "×", "4"],
        target: 20,
        fallbackFeedback: "x",
        successFeedback: "y"
      })
    );
    expect(errs.join(" ")).toContain("no precedence decision");
  });

  it("rejects an authored misconception no collapse order can produce", () => {
    const errs = widgetIntegrityErrors(
      EvalOrderSpec.parse({ ...spec, commonResults: [{ value: 99, feedback: "never fires" }] })
    );
    expect(errs.join(" ")).toContain("dead feedback");
  });
});
