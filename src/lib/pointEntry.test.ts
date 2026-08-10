import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { PointEntrySpec, WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { widgetWrongPaths } from "./pedagogy";

// A minimal well-formed pointEntry spec (parsed, so zod defaults materialize).
const base = () =>
  WidgetSpec.parse({
    type: "pointEntry",
    prompt: "Enter (x, y).",
    answer: [-2, 3],
    commonEntries: [
      { values: [3, -2], feedback: "Coordinates swapped — x first, then y." },
      { values: [2, 3], feedback: "Check the x-sign: it moved LEFT, so x is negative." }
    ],
    fallbackFeedback: "Read the x-move and y-move separately.",
    successFeedback: "Yes — (−2, 3)."
  }) as Extract<TWidget, { type: "pointEntry" }>;

describe("pointEntry — schema + defaults", () => {
  it("defaults delimiter to paren and commonEntries to []", () => {
    const s = PointEntrySpec.parse({
      type: "pointEntry",
      prompt: "p",
      answer: [1, 2],
      fallbackFeedback: "f"
    });
    expect(s.delimiter).toBe("paren");
    expect(s.commonEntries).toEqual([]);
  });
  it("rejects a tuple shorter than 2", () => {
    expect(() =>
      PointEntrySpec.parse({ type: "pointEntry", prompt: "p", answer: [1], fallbackFeedback: "f" })
    ).toThrow();
  });
});

describe("pointEntry — grading", () => {
  it("grades the exact ordered tuple correct", () => {
    const r = evaluate(base(), [-2, 3]);
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("Yes — (−2, 3).");
  });
  it("a swapped tuple fires its own trap, not the fallback", () => {
    expect(evaluate(base(), [3, -2]).feedback).toBe("Coordinates swapped — x first, then y.");
  });
  it("the sign trap fires its own diagnosis", () => {
    expect(evaluate(base(), [2, 3]).feedback).toBe("Check the x-sign: it moved LEFT, so x is negative.");
  });
  it("a wrong tuple with no trap gets the fallback", () => {
    const r = evaluate(base(), [5, 5]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("Read the x-move and y-move separately.");
  });
  it("incomplete input is not correct and not a trap", () => {
    expect(evaluate(base(), null).correct).toBe(false);
    expect(evaluate(base(), [(-2) as number]).correct).toBe(false); // wrong length
  });
  it("order matters — reversed answer is wrong", () => {
    expect(evaluate(base(), [3, -2]).correct).toBe(false);
  });
});

describe("pointEntry — canCheck + correctAnswerText", () => {
  it("canCheck requires every slot present and numeric", () => {
    expect(canCheck(base(), [-2, 3])).toBe(true);
    expect(canCheck(base(), [null, 3] as unknown)).toBe(false);
    expect(canCheck(base(), [-2] as unknown)).toBe(false);
    expect(canCheck(base(), null)).toBe(false);
  });
  it("renders parens by default and angle brackets for vectors", () => {
    expect(correctAnswerText(base())).toBe("(-2, 3)");
    const vec = WidgetSpec.parse({
      type: "pointEntry",
      prompt: "v",
      answer: [3, -4],
      delimiter: "angle",
      commonEntries: [
        { values: [-3, 4], feedback: "reversed" },
        { values: [-1, 6], feedback: "added" }
      ],
      fallbackFeedback: "tip − tail"
    }) as Extract<TWidget, { type: "pointEntry" }>;
    expect(correctAnswerText(vec)).toBe("\u27e83, -4\u27e9");
  });
});

describe("pointEntry — integrity", () => {
  it("flags a trap equal to the answer", () => {
    const s = { ...base(), commonEntries: [{ values: [-2, 3], feedback: "x" }, { values: [0, 0], feedback: "y" }] } as TWidget;
    expect(widgetIntegrityErrors(s).some((e) => e.includes("equals the answer"))).toBe(true);
  });
  it("flags two traps sharing a tuple", () => {
    const s = { ...base(), commonEntries: [{ values: [1, 1], feedback: "a" }, { values: [1, 1], feedback: "b" }] } as TWidget;
    expect(widgetIntegrityErrors(s).some((e) => e.includes("share the tuple"))).toBe(true);
  });
  it("flags a trap whose slot count differs from the answer", () => {
    const s = { ...base(), commonEntries: [{ values: [1, 2, 3], feedback: "a" }, { values: [9, 9], feedback: "b" }] } as TWidget;
    expect(widgetIntegrityErrors(s).some((e) => e.includes("slots but the answer has"))).toBe(true);
  });
  it("a clean spec has no integrity errors", () => {
    expect(widgetIntegrityErrors(base())).toEqual([]);
  });
});

describe("pointEntry — wrong-path surface (audit + generic-feedback gate)", () => {
  it("exposes every trap feedback plus the fallback, in order", () => {
    expect(widgetWrongPaths(base())).toEqual([
      "Coordinates swapped — x first, then y.",
      "Check the x-sign: it moved LEFT, so x is negative.",
      "Read the x-move and y-move separately."
    ]);
  });
});
