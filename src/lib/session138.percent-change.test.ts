import { describe, expect, it } from "vitest";
import { WidgetSpec, percentChangeAmount, percentChangeChoiceCorrect, percentChangeTarget, widgetIntegrityErrors, type TPercentChangeLab } from "./schema";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";

const fixture = (overrides: Partial<TPercentChangeLab> = {}): TPercentChangeLab => WidgetSpec.parse({
  type: "percentChangeLab",
  prompt: "A $40 backpack is marked down 25%. Which is the sale price?",
  base: 40,
  percent: 25,
  direction: "markdown",
  currency: "$",
  choices: [
    { id: "correct", label: "$30.00", value: 30, feedback: "Yes — $40 − $10 = $30." },
    { id: "change", label: "$10.00", value: 10, feedback: "That is only the discount amount." },
    { id: "decimal", label: "$39.75", value: 39.75, feedback: "25% means $10 here, not $0.25." }
  ],
  fallbackFeedback: "Find the percent amount, then subtract it.",
  successFeedback: "Yes — $40 − $10 = $30.",
  ...overrides
}) as TPercentChangeLab;

describe("Session 138 percentChangeLab mathematical contract", () => {
  it("derives change and final price for markup and markdown", () => {
    const markdown = fixture();
    const markup = fixture({ base: 10, percent: 25, direction: "markup", choices: [
      { id: "correct", label: "$12.50", value: 12.5, feedback: "correct" },
      { id: "decimal", label: "$10.25", value: 10.25, feedback: "decimal" },
      { id: "change", label: "$2.50", value: 2.5, feedback: "change" }
    ] });
    expect(percentChangeAmount(markdown)).toBe(10);
    expect(percentChangeTarget(markdown)).toBe(30);
    expect(percentChangeAmount(markup)).toBe(2.5);
    expect(percentChangeTarget(markup)).toBe(12.5);
  });

  it("grades exactly one authored final-price claim", () => {
    const spec = fixture();
    expect(percentChangeChoiceCorrect(spec, spec.choices[0])).toBe(true);
    expect(evaluate(spec, "correct")).toEqual({ correct: true, feedback: spec.successFeedback });
    expect(evaluate(spec, "change")).toEqual({ correct: false, feedback: spec.choices[1].feedback });
    expect(canCheck(spec, "decimal")).toBe(true);
    expect(canCheck(spec, "missing")).toBe(false);
    expect(correctAnswerText(spec)).toBe("$30.00");
  });

  it("rejects duplicate and ambiguous claims while allowing a zero-price 100% markdown", () => {
    const duplicate = fixture({ choices: [
      { id: "a", label: "$30", value: 30, feedback: "a" },
      { id: "b", label: "$30 again", value: 30, feedback: "b" },
      { id: "c", label: "$10", value: 10, feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(duplicate).join(" ")).toMatch(/choice values must be unique|exactly one correct/);

    const ambiguous = fixture({ choices: [
      { id: "a", label: "$30", value: 30, feedback: "a" },
      { id: "b", label: "$30.00", value: 30, feedback: "b" },
      { id: "c", label: "$10", value: 10, feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(ambiguous).join(" ")).toMatch(/choice values must be unique|exactly one correct/);

    const negative = fixture({ base: 20, percent: 100, direction: "markdown", choices: [
      { id: "correct", label: "$0", value: 0, feedback: "a" },
      { id: "b", label: "$20", value: 20, feedback: "b" },
      { id: "c", label: "$100", value: 100, feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(negative)).toEqual([]);
  });
});
