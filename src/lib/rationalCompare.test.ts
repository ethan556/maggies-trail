/** rationalCompare — schema, exact-rational integrity, grading, reveal text. */
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate, canCheck, correctAnswerText, learnerAnswerText } from "./evaluate";

const base = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({
    type: "rationalCompare",
    prompt: "Compare: 3/4 __ 0.5",
    left: { num: 3, den: 4 },
    right: { value: "0.5" },
    answer: "gt",
    ltFeedback: "0.5 is one half — 3/4 is a quarter more than that.",
    eqFeedback: "Close, but 0.5 = 2/4 and 3/4 has one more quarter.",
    successFeedback: "Yes — 0.5 = 2/4, and 3/4 > 2/4.",
    ...over
  });

describe("rationalCompare — schema", () => {
  it("accepts fraction and scalar operands, signed either way", () => {
    const s = base({ left: { num: -1, den: 2 }, right: { value: "-3" }, answer: "gt", eqFeedback: "e", ltFeedback: "l" });
    expect(s.type).toBe("rationalCompare");
  });
  it("rejects a scalar that is not a plain signed integer/decimal string", () => {
    expect(() => base({ right: { value: "1/2" } })).toThrow();
    expect(() => base({ right: { value: "abc" } })).toThrow();
    expect(() => base({ right: { value: ".5" } })).toThrow();
  });
  it("rejects a zero or negative denominator", () => {
    expect(() => base({ left: { num: 1, den: 0 } })).toThrow();
    expect(() => base({ left: { num: 1, den: -4 } })).toThrow();
  });
});

describe("rationalCompare — integrity (exact, no floats)", () => {
  it("a clean spec has no integrity errors", () => {
    expect(widgetIntegrityErrors(base())).toEqual([]);
  });
  it("authored answer must match the exact truth", () => {
    const s = base({ answer: "lt", ltFeedback: undefined, gtFeedback: "g", eqFeedback: "e" });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("contradicts"))).toBe(true);
  });
  it("3/4 vs 0.75 is EXACTLY equal (decimal parses to 75/100, cross-multiplied)", () => {
    const s = base({
      right: { value: "0.75" },
      answer: "eq",
      eqFeedback: undefined,
      ltFeedback: "same value in two costumes",
      gtFeedback: "same value in two costumes — greater"
    });
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });
  it("1/3 vs 0.3333 is gt, not eq — the float trap the exact check retires", () => {
    const wrong = base({
      left: { num: 1, den: 3 },
      right: { value: "0.3333" },
      answer: "eq",
      eqFeedback: undefined,
      ltFeedback: "l",
      gtFeedback: "g"
    });
    expect(widgetIntegrityErrors(wrong).some((e) => e.includes('truth is "gt"'))).toBe(true);
    const right = base({
      left: { num: 1, den: 3 },
      right: { value: "0.3333" },
      answer: "gt",
      gtFeedback: undefined,
      ltFeedback: "l",
      eqFeedback: "e"
    });
    expect(widgetIntegrityErrors(right)).toEqual([]);
  });
  it("negative pairs compare by value, not magnitude (-2 > -5)", () => {
    const s = base({
      left: { value: "-2" },
      right: { value: "-5" },
      answer: "gt",
      gtFeedback: undefined,
      ltFeedback: "l",
      eqFeedback: "e"
    });
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });
  it("the answer's own slot must be absent; the two wrong slots present", () => {
    const own = base({ gtFeedback: "can never fire" });
    expect(widgetIntegrityErrors(own).some((e) => e.includes("ANSWER's own slot"))).toBe(true);
    const missing = base({ eqFeedback: undefined });
    expect(widgetIntegrityErrors(missing).some((e) => e.includes("missing eqFeedback"))).toBe(true);
  });
});

describe("rationalCompare — grading", () => {
  it("the answer symbol grades correct with the success feedback", () => {
    const r = evaluate(base(), "gt");
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("Yes — 0.5 = 2/4, and 3/4 > 2/4.");
  });
  it("each wrong symbol fires its own authored diagnosis", () => {
    expect(evaluate(base(), "lt").feedback).toBe("0.5 is one half — 3/4 is a quarter more than that.");
    expect(evaluate(base(), "eq").feedback).toBe("Close, but 0.5 = 2/4 and 3/4 has one more quarter.");
  });
  it("no selection is not correct and not a diagnosis", () => {
    const r = evaluate(base(), null);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("Pick");
  });
});

describe("rationalCompare — canCheck + reveal + learner echo", () => {
  it("canCheck only for the three symbols", () => {
    expect(canCheck(base(), "lt")).toBe(true);
    expect(canCheck(base(), "gt")).toBe(true);
    expect(canCheck(base(), null)).toBe(false);
    expect(canCheck(base(), "bigger")).toBe(false);
  });
  it("reveal text renders both operand forms around the real symbol", () => {
    expect(correctAnswerText(base())).toBe("3/4 > 0.5");
  });
  it("learnerAnswerText echoes the learner's chosen relation; anything else is null", () => {
    expect(learnerAnswerText(base(), "lt")).toBe("3/4 < 0.5");
    expect(learnerAnswerText(base(), "eq")).toBe("3/4 = 0.5");
    expect(learnerAnswerText(base(), null)).toBeNull();
    expect(learnerAnswerText(base(), "??")).toBeNull();
  });
});
