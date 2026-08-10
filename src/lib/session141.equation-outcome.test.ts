import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { EquationOutcomeLabSpec, equationOutcomeTruth, widgetIntegrityErrors } from "./schema";

const base = {
  type: "equationOutcomeLab" as const,
  prompt: "Classify the equation.",
  leftDisplay: "4x + 1", rightDisplay: "4x + 9",
  leftCoeff: 4, leftConstant: 1, rightCoeff: 4, rightConstant: 9,
  choices: [
    { id: "a", label: "No solution", outcome: "none" as const, feedback: "The residue is false." },
    { id: "b", label: "One solution", outcome: "one" as const, feedback: "No variable remains." },
    { id: "c", label: "Infinitely many", outcome: "infinite" as const, feedback: "The constants differ." }
  ],
  fallbackFeedback: "Inspect the residue.", successFeedback: "False residue means no solution."
};

describe("Session 141 equationOutcomeLab", () => {
  it("derives none, infinite, and one from normalized coefficients", () => {
    expect(equationOutcomeTruth(base)).toBe("none");
    expect(equationOutcomeTruth({ ...base, rightConstant: 1 })).toBe("infinite");
    expect(equationOutcomeTruth({ ...base, rightCoeff: 3 })).toBe("one");
  });
  it("grades every authored claim through the same truth", () => {
    const spec = EquationOutcomeLabSpec.parse(base);
    expect(evaluate(spec, "a").correct).toBe(true);
    expect(evaluate(spec, "b").feedback).toBe(base.choices[1].feedback);
    expect(evaluate(spec, "c").correct).toBe(false);
  });
  it("rejects duplicate labels and ambiguous correct outcomes", () => {
    const duplicate = { ...base, choices: [...base.choices, { ...base.choices[0], id: "d" }] };
    expect(widgetIntegrityErrors(EquationOutcomeLabSpec.parse(duplicate)).join(" ")).toMatch(/labels|exactly one/);
  });
});
