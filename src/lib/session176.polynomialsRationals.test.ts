import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";

/** S175/S176: lg-ln (e^(ln n)=n identity, closes lg-04-02), and nine forms across
 * a2-polynomials/a2-rationals — polynomial evaluation, synthetic division, rational-function
 * asymptotes, variation, and work-rate problems. All reuse existing tasks (approximationEvaluate,
 * polynomialEvaluate, rationalLimitAtInfinity); no new schema surface this wave. */

describe("lg-ln: the e^(ln n) identity, plus the two frozen sibling instances", () => {
  it("closes lg-04-02: e^(ln 5)=5, 3*ln2 given ln2~=0.693, and ln(e^3*e^4)=7", () => {
    const d = JSON.parse(readFileSync("content/courses/logarithms/lessons/lg-04-02.json", "utf8"));
    for (const [id, expected] of [["k1", 5], ["k3", 2.079], ["ch1", 7]] as const) {
      const step = d.steps.find((s: any) => s.id === id);
      expect(step.widget.type).toBe("exactNumberLab");
      const spec = WidgetSpec.parse(step.widget) as any;
      const truth = exactNumberTruth(spec);
      expect(Math.abs(truth.answerNumber! - expected)).toBeLessThanOrEqual((spec.tolerance ?? 0) + 1e-9);
    }
  });
  it("the live generator always produces the e^(ln n) identity shape and self-derives", () => {
    const g = VARIANT_GENERATORS.find((x: any) => x.tag === "a2-logarithms")!;
    for (let seed = 1; seed <= 30; seed++) {
      const v = g.gen(() => (seed * 0.031) % 1, "core", "lg-ln__numeric" as VariantForm);
      expect(v.widget.type).toBe("exactNumberLab");
      expect(exactNumberTruth(v.widget as any).answerNumber).toBe(Number(v.answer));
    }
  });
});

describe("a2-polynomials and a2-rationals: nine forms converted (S176)", () => {
  const cases: [string, string, string][] = [
    ["polynomial-functions", "pf-01-01", "k1"], ["polynomial-functions", "pf-01-01", "k2"], ["polynomial-functions", "pf-01-01", "ch1"],
    ["polynomial-functions", "pf-03-01", "k3"], ["polynomial-functions", "pf-03-02", "k2"],
    ["polynomial-functions", "pf-05-02", "k3"], ["polynomial-functions", "pf-05-02", "ch1"],
    ["polynomial-functions", "pf-05-03", "k3"], ["polynomial-functions", "pf-05-03", "ch1"],
    ["rational-functions", "rf-03-01", "k3"], ["rational-functions", "rf-04-03", "k2"],
    ["rational-functions", "rf-05-02", "k3"], ["rational-functions", "rf-05-02", "ch1"],
    ["rational-functions", "rf-05-03", "k1"], ["rational-functions", "rf-05-03", "k3"], ["rational-functions", "rf-05-03", "ch1"],
  ];
  it("every converted step parses and self-derives a numeric answer", () => {
    for (const [course, lesson, stepId] of cases) {
      const d = JSON.parse(readFileSync(`content/courses/${course}/lessons/${lesson}.json`, "utf8"));
      const step = d.steps.find((s: any) => s.id === stepId);
      expect(step.widget.type, `${lesson}/${stepId}`).toBe("exactNumberLab");
      const spec = WidgetSpec.parse(step.widget) as any;
      expect(exactNumberTruth(spec).answerNumber, `${lesson}/${stepId}: ${step.widget.prompt}`).toBeTypeOf("number");
    }
  });

  it("rf-ha reuses rationalLimitAtInfinity directly: (10x+3)/(2x-1) -> horizontal asymptote 5", () => {
    const d = JSON.parse(readFileSync("content/courses/rational-functions/lessons/rf-04-03.json", "utf8"));
    const step = d.steps.find((s: any) => s.id === "k2");
    expect(step.widget.task).toBe("rationalLimitAtInfinity");
    expect(exactNumberTruth(step.widget as any).answerNumber).toBe(5);
  });

  it("S177 reverted pf-turning; S178 RESOLVED it with a genuine parity-aware task. The concurrent " +
    "instance's generator-safety argument was always correct (re-verified below) — the objection " +
    "was that turns+1 is not a valid DERIVATION of ch1's concept, only a coincidentally-matching " +
    "number: turns+1=3 is right there solely because 3 is already odd, while turns=3 under the " +
    "same odd-parity constraint would give 4, which is both the wrong parity and unrealizable " +
    "(true answer 5). polynomialMinimumDegree now encodes the parity step explicitly.", () => {
    const g = VARIANT_GENERATORS.find((x: any) => x.tag === "a2-polynomials")!;
    for (let seed = 1; seed <= 40; seed++) {
      const v = g.gen(() => (seed * 0.047) % 1, "core", "pf-turning__numeric" as VariantForm);
      expect(String(v.widget.prompt)).not.toMatch(/falls|rises/i); // generator still only poses the unconstrained shape
    }
    const d = JSON.parse(readFileSync("content/courses/polynomial-functions/lessons/pf-05-02.json", "utf8"));
    const ch1 = d.steps.find((s: any) => s.id === "ch1");
    expect(ch1.widget.task).toBe("polynomialMinimumDegree");
    expect(ch1.widget.pmdEndBehavior).toBe("opposite"); // the constraint is now DATA, not an assumption
    const truth = exactNumberTruth(ch1.widget as any);
    expect(truth.answerNumber).toBe(3);
    // The learner-visible reasoning now includes the parity step that was missing before.
    expect(truth.stages.map((s: any) => s.key)).toEqual(["pmd:floor", "pmd:parity"]);
    // And the task gets the counter-example right, which turns+1 could not.
    expect(exactNumberTruth({ task: "polynomialMinimumDegree", values: [], pmdTurningPoints: 3, pmdEndBehavior: "opposite" } as any).answerNumber).toBe(5);
    expect(exactNumberTruth({ task: "polynomialMinimumDegree", values: [], pmdTurningPoints: 2, pmdEndBehavior: "same" } as any).answerNumber).toBe(4);
  });
});
