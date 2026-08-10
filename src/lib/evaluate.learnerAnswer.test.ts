import { describe, expect, it } from "vitest";
import { correctAnswerText, learnerAnswerText } from "./evaluate";
import { WidgetSpec, type TWidget } from "./schema";
import { SAMPLES } from "@/components/widgetSamples";

// Reuse the canonical per-type sample specs (same source the keyboard gate and
// the existing evaluate wrong-path tests parse), so these fixtures stay valid.
const specs = SAMPLES.map((s) => WidgetSpec.parse(s));
const byType = <T extends TWidget["type"]>(t: T) =>
  specs.find((s) => s.type === t) as Extract<TWidget, { type: T }>;

describe("learnerAnswerText — echoes the learner's own submission on reveal", () => {
  it("mcq: renders the chosen option's label; unknown/absent selections give null", () => {
    const s = byType("mcq");
    const chosen = s.options[1];
    expect(learnerAnswerText(s, chosen.id)).toBe(chosen.label);
    expect(learnerAnswerText(s, "no-such-id")).toBeNull();
    expect(learnerAnswerText(s, null)).toBeNull();
  });

  it("numeric: renders the number, with the unit when the spec has one; NaN gives null", () => {
    const s = byType("numeric"); // sample has no unit
    expect(learnerAnswerText(s, 7)).toBe("7");
    expect(learnerAnswerText(s, Number.NaN)).toBeNull();
    expect(learnerAnswerText(s, null)).toBeNull();
    const withUnit = {
      type: "numeric",
      prompt: "x",
      answer: 5,
      tolerance: 0,
      commonErrors: [],
      fallbackFeedback: "f",
      unit: "cm"
    } as unknown as Extract<TWidget, { type: "numeric" }>;
    expect(learnerAnswerText(withUnit, 5)).toBe("5 cm");
  });

  it("fractionEntry: renders whole/fraction/sign the same way the grader parses them", () => {
    const s = byType("fractionEntry"); // sample unit is "°C"
    expect(learnerAnswerText(s, { whole: 1, num: 1, den: 2 })).toBe("1 1/2 °C");
    expect(learnerAnswerText(s, { sign: -1, whole: 0, num: 2, den: 3 })).toBe("\u22122/3 °C");
    expect(learnerAnswerText(s, { whole: 0, num: 0, den: 1 })).toBe("0 °C");
    expect(learnerAnswerText(s, { whole: 0, num: 3, den: 0 })).toBeNull(); // den < 1
    expect(learnerAnswerText(s, null)).toBeNull();
  });

  it("placeCompare: maps the chosen relation to a symbol; anything else is null", () => {
    const s = byType("placeCompare"); // left "63", right "38"
    expect(learnerAnswerText(s, "lt")).toBe(`${s.left} < ${s.right}`);
    expect(learnerAnswerText(s, "gt")).toBe(`${s.left} > ${s.right}`);
    expect(learnerAnswerText(s, "eq")).toBe(`${s.left} = ${s.right}`);
    expect(learnerAnswerText(s, "??")).toBeNull();
  });

  it("pointEntry: renders the tuple with the spec's delimiter; wrong arity is null", () => {
    const s = byType("pointEntry"); // answer [-2, 3], paren delimiter
    expect(learnerAnswerText(s, [7, 8])).toBe("(7, 8)");
    expect(learnerAnswerText(s, [1])).toBeNull(); // wrong length
    expect(learnerAnswerText(s, null)).toBeNull();
    const angle = {
      type: "pointEntry",
      prompt: "x",
      answer: [1, 2],
      delimiter: "angle",
      commonEntries: [],
      fallbackFeedback: "f"
    } as unknown as Extract<TWidget, { type: "pointEntry" }>;
    expect(learnerAnswerText(angle, [3, 4])).toBe("\u27e83, 4\u27e9");
  });

  it("returns null for widgets that already narrate their own state", () => {
    // A slider self-narrates via its live readout, so there is no honest
    // one-line echo here — the reveal banner just shows the answer alone.
    expect(learnerAnswerText(byType("slider"), 3)).toBeNull();
  });

  it("a wrong submission never coincidentally equals the correct-answer text", () => {
    // The reveal UI suppresses the "you answered" line when it equals the
    // answer; verify the two helpers are independent strings for a wrong pick.
    const s = byType("placeCompare"); // answer "gt"
    const wrong = learnerAnswerText(s, "lt");
    expect(wrong).not.toBeNull();
    expect(wrong).not.toBe(correctAnswerText(s));
  });
});
