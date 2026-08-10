/** absValueLine — schema, magnitude-truth integrity, grading, reveal + learner echo.
 * The engine owns the "farther from zero / larger magnitude" pocket that a value
 * relation (<, =, >) cannot express: the operand smaller in VALUE can be larger in
 * DISTANCE, and integrity re-derives that truth from |value|. */
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate, canCheck, correctAnswerText, learnerAnswerText } from "./evaluate";
import { describeWidgetState } from "./describeState";

const base = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({
    type: "absValueLine",
    prompt: "Which number is FARTHER from zero: -2 or -8?",
    items: [
      { id: "a", value: -8, label: "-8" },
      { id: "b", value: -2, label: "-2", feedback: "-2 is only 2 steps from zero; -8 is 8 steps away." }
    ],
    answerId: "a",
    equalLabel: "Same distance",
    equalFeedback: "|-2| = 2 but |-8| = 8 — different distances.",
    missFeedback: "Distance from zero is the bracket length — compare the two.",
    successFeedback: "Right — |-8| = 8 beats |-2| = 2, so -8 is farther from zero.",
    ...over
  });

describe("absValueLine — schema", () => {
  it("accepts two signed operands with an equal chip", () => {
    expect(base().type).toBe("absValueLine");
  });
  it("rejects fewer than two operands", () => {
    expect(() => base({ items: [{ id: "a", value: -8, label: "-8" }] })).toThrow();
  });
});

describe("absValueLine — integrity (magnitude truth re-derived)", () => {
  it("a clean spec has no integrity errors", () => {
    expect(widgetIntegrityErrors(base())).toEqual([]);
  });
  it("the operand FARTHER from zero is the answer even when it is the smaller value (-8 beats -2)", () => {
    // -8 < -2 in value, but |-8| > |-2|; answerId 'a' (-8) is correct.
    expect(widgetIntegrityErrors(base())).toEqual([]);
  });
  it("a wrong answerId contradicts the magnitudes", () => {
    const s = base({
      answerId: "b",
      // move feedback so the slot discipline does not mask the contradiction
      items: [
        { id: "a", value: -8, label: "-8", feedback: "x" },
        { id: "b", value: -2, label: "-2" }
      ]
    });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("contradicts the magnitudes"))).toBe(true);
  });
  it("mixed signs compare by distance, not position (-4 beats 3)", () => {
    const s = base({
      prompt: "Which is farther from zero: -4 or 3?",
      items: [
        { id: "a", value: -4, label: "-4" },
        { id: "b", value: 3, label: "3", feedback: "3 is greater, but |-4| = 4 > |3| = 3." }
      ],
      answerId: "a",
      equalFeedback: "|-4| = 4 and |3| = 3 differ."
    });
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });
  it("a real tie makes 'equal' the truth; equalFeedback must then be absent", () => {
    const tie = base({
      items: [
        { id: "a", value: -5, label: "-5", feedback: "d" },
        { id: "b", value: 5, label: "5", feedback: "d" }
      ],
      answerId: "equal",
      equalFeedback: undefined
    });
    expect(widgetIntegrityErrors(tie)).toEqual([]);
    const withOwnSlot = base({
      items: [
        { id: "a", value: -5, label: "-5", feedback: "d" },
        { id: "b", value: 5, label: "5", feedback: "d" }
      ],
      answerId: "equal"
    });
    expect(widgetIntegrityErrors(withOwnSlot).some((e) => e.includes("ANSWER's own slot"))).toBe(true);
  });
  it("the answer operand's own feedback can never fire", () => {
    const s = base({
      items: [
        { id: "a", value: -8, label: "-8", feedback: "can never fire" },
        { id: "b", value: -2, label: "-2", feedback: "d" }
      ]
    });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("can never fire"))).toBe(true);
  });
  it("'equal' is a reserved id", () => {
    const s = base({
      items: [
        { id: "equal", value: -8, label: "-8" },
        { id: "b", value: -2, label: "-2", feedback: "d" }
      ],
      answerId: "equal"
    });
    expect(widgetIntegrityErrors(s).some((e) => e.includes("reserved"))).toBe(true);
  });
});

describe("absValueLine — grading", () => {
  it("the farther operand grades correct with success feedback", () => {
    const r = evaluate(base(), "a");
    expect(r.correct).toBe(true);
    expect(r.feedback).toContain("farther from zero");
  });
  it("the nearer operand fires its own authored diagnosis", () => {
    expect(evaluate(base(), "b").correct).toBe(false);
    expect(evaluate(base(), "b").feedback).toContain("8 steps away");
  });
  it("the equal chip fires equalFeedback", () => {
    expect(evaluate(base(), "equal").feedback).toContain("different distances");
  });
  it("an operand without its own feedback falls back to missFeedback", () => {
    const s = base({
      items: [
        { id: "a", value: -8, label: "-8" },
        { id: "b", value: -2, label: "-2" } // no feedback
      ]
    });
    expect(evaluate(s, "b").feedback).toContain("bracket length");
  });
});

describe("absValueLine — canCheck, reveal, echo, SR narration", () => {
  it("canCheck only when a chip is chosen", () => {
    expect(canCheck(base(), "a")).toBe(true);
    expect(canCheck(base(), "equal")).toBe(true);
    expect(canCheck(base(), null)).toBe(false);
    expect(canCheck(base(), "")).toBe(false);
  });
  it("reveal text names the farther operand", () => {
    expect(correctAnswerText(base())).toBe("-8");
  });
  it("learner echo returns the chosen label; nonsense is null", () => {
    expect(learnerAnswerText(base(), "b")).toBe("-2");
    expect(learnerAnswerText(base(), "equal")).toBe("Same distance");
    expect(learnerAnswerText(base(), null)).toBeNull();
  });
  it("describeWidgetState narrates each operand's distance from zero", () => {
    const d = describeWidgetState(base(), "a");
    expect(d).toContain("8 units left of zero");
    expect(d).toContain("2 units left of zero");
    expect(d).toContain("ignores the sign");
  });
});
