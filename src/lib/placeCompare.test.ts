/** placeCompare — schema, integrity, grading, reveal text. */
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";

const base = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({
    type: "placeCompare",
    prompt: "Compare: 63 __ 38",
    left: "63",
    right: "38",
    answer: "gt",
    ltFeedback: "Check the tens: 6 > 3, so 63 > 38.",
    eqFeedback: "They aren't equal — the tens differ.",
    successFeedback: "Yes — 6 tens beats 3 tens.",
    ...over
  });

describe("placeCompare — schema + integrity", () => {
  it("defaults placeLabels to true and accepts decimal digit strings", () => {
    const s = base({ left: "0.409", right: "0.41", answer: "lt", ltFeedback: undefined, gtFeedback: "The length is the trap.", eqFeedback: "Pad and compare." });
    expect(s.type === "placeCompare" && s.placeLabels).toBe(true);
  });
  it("rejects non-digit strings", () => {
    expect(() => base({ left: "6x" })).toThrow();
  });
  it("integrity: authored answer must match the numbers", () => {
    const s = base({ answer: "lt", ltFeedback: undefined, gtFeedback: "g", eqFeedback: "e" });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("contradicts"))).toBe(true);
  });
  it("integrity: the answer's own slot must be absent; the two wrong slots present", () => {
    const s = base({ gtFeedback: "can never fire" });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("ANSWER's own slot"))).toBe(true);
    const t = base({ eqFeedback: undefined });
    expect(widgetIntegrityErrors(t).some((e) => e.includes("missing eqFeedback"))).toBe(true);
  });
  it("a clean spec has no integrity errors", () => {
    expect(widgetIntegrityErrors(base())).toEqual([]);
  });
  it("integrity re-derives equality: eq answer demands equal values", () => {
    const s = base({ left: "77", right: "77", answer: "eq", eqFeedback: undefined, ltFeedback: "both digits match", gtFeedback: "both digits match — greater" });
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });
});

describe("placeCompare — grading", () => {
  it("the answer symbol grades correct with the success feedback", () => {
    const r = evaluate(base(), "gt");
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("Yes — 6 tens beats 3 tens.");
  });
  it("each wrong symbol fires its own authored diagnosis", () => {
    expect(evaluate(base(), "lt").feedback).toBe("Check the tens: 6 > 3, so 63 > 38.");
    expect(evaluate(base(), "eq").feedback).toBe("They aren't equal — the tens differ.");
  });
  it("no selection is not correct and not a diagnosis", () => {
    const r = evaluate(base(), null);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("Pick");
  });
});

describe("placeCompare — canCheck + reveal", () => {
  it("canCheck only for the three symbols", () => {
    expect(canCheck(base(), "lt")).toBe(true);
    expect(canCheck(base(), "eq")).toBe(true);
    expect(canCheck(base(), null)).toBe(false);
    expect(canCheck(base(), "yes")).toBe(false);
  });
  it("reveal text renders the real symbol", () => {
    expect(correctAnswerText(base())).toBe("63 > 38");
    const eq = base({ left: "77", right: "77", answer: "eq", eqFeedback: undefined, ltFeedback: "l", gtFeedback: "g" });
    expect(correctAnswerText(eq)).toBe("77 = 77");
  });
});
