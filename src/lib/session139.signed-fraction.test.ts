import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, signedFractionChoiceCorrect, signedFractionTruth, widgetIntegrityErrors, type TSignedFractionLab } from "./schema";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { variantForGenForm } from "./variants";

const fixture = (overrides: Partial<TSignedFractionLab> = {}): TSignedFractionLab => WidgetSpec.parse({
  type: "signedFractionLab",
  prompt: "−3/4 ÷ 1/2 = ?",
  operation: "divide",
  left: { sign: -1, num: 3, den: 4 },
  right: { sign: 1, num: 1, den: 2 },
  form: "any",
  choices: [
    { id: "correct", label: "−3/2", sign: -1, num: 3, den: 2, path: "correct", feedback: "correct" },
    { id: "sign", label: "3/2", sign: 1, num: 3, den: 2, path: "wrongSign", feedback: "sign" },
    { id: "kept", label: "−3/8", sign: -1, num: 3, den: 8, path: "keptDivisor", feedback: "kept" }
  ],
  fallbackFeedback: "fallback",
  successFeedback: "success",
  ...overrides
}) as TSignedFractionLab;

function lesson() {
  return JSON.parse(readFileSync(join(process.cwd(), "content/courses/rational-number-operations/lessons/rno-04-01.json"), "utf8"));
}

describe("Session 139 signedFractionLab mathematical contract", () => {
  it("derives multiply and divide truth through independent sign and reciprocal channels", () => {
    expect(signedFractionTruth(fixture())).toEqual({ sign: -1, num: 3, den: 2, rawNum: 6, rawDen: 4 });
    const multiply = fixture({
      operation: "multiply",
      left: { sign: -1, num: 2, den: 5 },
      right: { sign: -1, num: 3, den: 4 },
      choices: [
        { id: "correct", label: "3/10", sign: 1, num: 3, den: 10, path: "correct", feedback: "correct" },
        { id: "sign", label: "−3/10", sign: -1, num: 3, den: 10, path: "wrongSign", feedback: "sign" },
        { id: "magnitude", label: "6/9", sign: 1, num: 6, den: 9, path: "magnitudeError", feedback: "magnitude" }
      ]
    });
    expect(signedFractionTruth(multiply)).toEqual({ sign: 1, num: 3, den: 10, rawNum: 6, rawDen: 20 });
  });

  it("grades exactly one exact claim and keeps every named wrong path distinct", () => {
    const spec = fixture();
    expect(spec.choices.filter((choice) => signedFractionChoiceCorrect(spec, choice))).toHaveLength(1);
    expect(evaluate(spec, "correct")).toEqual({ correct: true, feedback: "success" });
    expect(evaluate(spec, "sign")).toEqual({ correct: false, feedback: "sign" });
    expect(evaluate(spec, "kept")).toEqual({ correct: false, feedback: "kept" });
    expect(canCheck(spec, "correct")).toBe(true);
    expect(canCheck(spec, "missing")).toBe(false);
    expect(correctAnswerText(spec)).toBe("−3/2");
  });

  it("rejects structurally false sign, divisor, duplicate, and lowest-terms claims", () => {
    const duplicate = fixture({ choices: [
      { id: "a", label: "−3/2", sign: -1, num: 3, den: 2, path: "correct", feedback: "a" },
      { id: "b", label: "−6/4", sign: -1, num: 6, den: 4, path: "correct", feedback: "b" },
      { id: "c", label: "3/2", sign: 1, num: 3, den: 2, path: "wrongSign", feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(duplicate).join(" ")).toMatch(/exactly one correct|marked correct/);

    const keptOnMultiply = fixture({ operation: "multiply", choices: [
      { id: "correct", label: "−3/8", sign: -1, num: 3, den: 8, path: "correct", feedback: "a" },
      { id: "sign", label: "3/8", sign: 1, num: 3, den: 8, path: "wrongSign", feedback: "b" },
      { id: "kept", label: "−3/8 again", sign: -1, num: 3, den: 8, path: "keptDivisor", feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(keptOnMultiply).join(" ")).toMatch(/keptDivisor is valid only for division/);

    const unreduced = fixture({ operation: "multiply", form: "lowestTerms", choices: [
      { id: "correct", label: "−3/8", sign: -1, num: 3, den: 8, path: "correct", feedback: "a" },
      { id: "sign", label: "3/8", sign: 1, num: 3, den: 8, path: "wrongSign", feedback: "b" },
      { id: "unreduced", label: "−3/8 unchanged", sign: -1, num: 3, den: 8, path: "unreduced", feedback: "c" }
    ] });
    expect(widgetIntegrityErrors(unreduced).join(" ")).toMatch(/unreduced path must be equivalent but not lowest terms/);
  });

  it("preserves all nine authored experiences and both remedial routes on one causal surface", () => {
    const doc = lesson();
    const main = doc.steps.filter((step: { widget?: { type?: string } }) => step.widget?.type === "signedFractionLab");
    const remedial = doc.remedials.map((route: { check: { widget?: { type?: string } } }) => route.check).filter((step: { widget?: { type?: string } }) => step.widget?.type === "signedFractionLab");
    expect(main).toHaveLength(7);
    expect(remedial).toHaveLength(2);
    for (const step of [...main, ...remedial]) {
      const spec = WidgetSpec.parse(step.widget);
      if (spec.type !== "signedFractionLab") throw new Error("surface drift");
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(spec.choices.filter((choice) => signedFractionChoiceCorrect(spec, choice))).toHaveLength(1);
    }
  });

  it("keeps all four seeded forms deterministic and exact across bands", () => {
    for (const form of ["default", "mulDiff", "divSame", "divDiff"] as const) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 0; seed < 24; seed += 1) {
          const problem = variantForGenForm("frac-sign-ops", form, `s139-${seed}`, band);
          expect(problem?.widget.type).toBe("signedFractionLab");
          if (!problem || problem.widget.type !== "signedFractionLab") continue;
          const lab = problem.widget;
          expect(widgetIntegrityErrors(lab)).toEqual([]);
          expect(lab.choices.filter((choice) => signedFractionChoiceCorrect(lab, choice))).toHaveLength(1);
        }
      }
    }
  });
});
