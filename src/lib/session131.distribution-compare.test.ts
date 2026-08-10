import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  distributionGapUnits,
  distributionOverlapFraction,
  widgetIntegrityErrors,
  type TDistributionCompareLab
} from "./schema";
import { variantForGenForm } from "./variants";

const lessonFiles = ["sp-02-01.json", "sp-02-02.json", "sp-02-03.json"].map((file) =>
  join(process.cwd(), "content/courses/sampling-and-probability/lessons", file)
);

function convertedSpecs(): TDistributionCompareLab[] {
  const out: TDistributionCompareLab[] = [];
  for (const file of lessonFiles) {
    const lesson = JSON.parse(readFileSync(file, "utf8")) as {
      steps: Array<{ widget?: unknown }>;
      remedials?: Array<{ check: { widget: unknown } }>;
    };
    for (const step of lesson.steps) {
      if (!step.widget) continue;
      const parsed = WidgetSpec.parse(step.widget);
      if (parsed.type === "distributionCompareLab") out.push(parsed);
    }
    for (const remedial of lesson.remedials ?? []) {
      const parsed = WidgetSpec.parse(remedial.check.widget);
      if (parsed.type === "distributionCompareLab") out.push(parsed);
    }
  }
  return out;
}

function measureSpec(): TDistributionCompareLab {
  const parsed = WidgetSpec.parse({
    type: "distributionCompareLab",
    prompt: "How many variability-widths separate 18 and 6 when one width is 4?",
    mode: "measure",
    meanA: 18,
    meanB: 6,
    variability: 4,
    answer: 3,
    tolerance: 0.01,
    measureChoices: [
      { value: 12, feedback: "That is the raw mean difference." },
      { value: 3, feedback: "The means are three variability-widths apart." },
      { value: 4, feedback: "That uses the variability as the answer." }
    ],
    fallbackFeedback: "Compare the raw mean gap with one variability-width.",
    successFeedback: "The means are three variability-widths apart."
  });
  if (parsed.type !== "distributionCompareLab" || parsed.mode !== "measure") throw new Error("bad measure fixture");
  return parsed;
}

function judgeSpec(): TDistributionCompareLab {
  const parsed = WidgetSpec.parse({
    type: "distributionCompareLab",
    prompt: "What does a gap of four variability-widths imply?",
    mode: "judge",
    gapUnits: 4,
    judgeOptions: [
      { id: "little", label: "Little overlap", correct: true, feedback: "A four-width gap leaves little overlap." },
      { id: "heavy", label: "Heavy overlap", feedback: "Heavy overlap belongs to a much smaller gap." },
      { id: "same", label: "The groups are identical", feedback: "Separated means do not describe identical groups." }
    ],
    successFeedback: "A four-width gap leaves little overlap."
  });
  if (parsed.type !== "distributionCompareLab" || parsed.mode !== "judge") throw new Error("bad judge fixture");
  return parsed;
}

describe("Session 131 distribution comparison", () => {
  it("converts all 26 target experiences and derives every measure answer from the drawn quantities", () => {
    const specs = convertedSpecs();
    expect(specs).toHaveLength(26);
    expect(specs.filter((spec) => spec.mode === "measure")).toHaveLength(18);
    expect(specs.filter((spec) => spec.mode === "judge")).toHaveLength(8);
    for (const spec of specs) {
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      if (spec.mode === "measure") {
        const ans = spec.answer;
        if (ans === undefined) throw new Error("measure-mode variant shipped without an answer");
        expect(Math.abs(distributionGapUnits(spec) - ans)).toBeLessThanOrEqual(spec.tolerance);
        expect(spec.measureChoices.filter((choice) => Math.abs(choice.value - ans) <= spec.tolerance)).toHaveLength(1);
      } else {
        expect(spec.judgeOptions.filter((option) => option.correct)).toHaveLength(1);
      }
    }
  });

  it("grades measure choices through exact authored misconception states", () => {
    const spec = measureSpec();
    expect(distributionGapUnits(spec)).toBe(3);
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, 3)).toBe(true);
    expect(evaluate(spec, 3)).toEqual({ correct: true, feedback: spec.successFeedback });
    expect(evaluate(spec, 12)).toEqual({ correct: false, feedback: "That is the raw mean difference." });
    expect(evaluate(spec, 4)).toEqual({ correct: false, feedback: "That uses the variability as the answer." });
    expect(correctAnswerText(spec)).toBe("3 variability-units");
    expect(learnerAnswerText(spec, 4)).toBe("4 variability-units");
  });

  it("grades overlap conclusions without converting them into a numeric threshold task", () => {
    const spec = judgeSpec();
    expect(distributionGapUnits(spec)).toBe(4);
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, "little")).toBe(true);
    expect(evaluate(spec, "little")).toEqual({ correct: true, feedback: "A four-width gap leaves little overlap." });
    expect(evaluate(spec, "heavy")).toEqual({ correct: false, feedback: "Heavy overlap belongs to a much smaller gap." });
    expect(correctAnswerText(spec)).toBe("Little overlap");
    expect(learnerAnswerText(spec, "same")).toBe("The groups are identical");
  });

  it("uses a symmetric, deterministic gap and a monotone overlap proxy", () => {
    const a = measureSpec();
    expect(distributionGapUnits(a)).toBe(distributionGapUnits({ ...a, meanA: a.meanB, meanB: a.meanA }));
    expect(distributionOverlapFraction(0)).toBe(1);
    expect(distributionOverlapFraction(1)).toBeGreaterThan(distributionOverlapFraction(2));
    expect(distributionOverlapFraction(2)).toBeGreaterThan(distributionOverlapFraction(4));
  });

  it("permits the authored rounded-zero answer only inside its declared tolerance", () => {
    const parsed = WidgetSpec.parse({
      ...measureSpec(),
      meanA: 12,
      meanB: 11,
      variability: 4,
      answer: 0,
      tolerance: 0.26,
      measureChoices: [
        { value: 0, feedback: "The gap is tiny relative to one variability-width." },
        { value: 2, feedback: "That is too large." },
        { value: 8, feedback: "That confuses a raw value with the standardized gap." }
      ]
    });
    if (parsed.type !== "distributionCompareLab" || parsed.mode !== "measure") throw new Error("bad rounded fixture");
    expect(distributionGapUnits(parsed)).toBe(0.25);
    expect(widgetIntegrityErrors(parsed)).toEqual([]);
    expect(evaluate(parsed, 0).correct).toBe(true);
    expect(widgetIntegrityErrors({ ...parsed, tolerance: 0.24 })).toContain(
      "distributionCompareLab(measure): answer 0 contradicts derived gap 0.25 beyond tolerance 0.24"
    );
  });

  it("rejects contradictory, duplicate, and ambiguous authoring", () => {
    const measure = measureSpec();
    const judge = judgeSpec();
    const errors = [
      WidgetSpec.parse({ ...measure, answer: 2 }),
      WidgetSpec.parse({ ...measure, measureChoices: [...measure.measureChoices, measure.measureChoices[0]] }),
      WidgetSpec.parse({ ...judge, judgeOptions: judge.judgeOptions.map((option) => ({ ...option, correct: true })) }),
      WidgetSpec.parse({ ...judge, meanA: 1 })
    ].flatMap(widgetIntegrityErrors).join("\n");
    expect(errors).toContain("contradicts derived gap");
    expect(errors).toContain("duplicate choice values");
    expect(errors).toContain("expected exactly one correct option");
    expect(errors).toContain("measure-only fields are present");
  });

  it("keeps seeded variants on the same causal surface across bands and draws", () => {
    // The umbrella "g7-statistics" naming this test originally targeted never shipped; the live
    // registration is per-tag generators with real form lists (S135 fix). Driving every real
    // form of both tags is strictly stronger coverage than the draft loop was.
    const MEASURE_FORMS = ["spGapForwardA", "spGapForwardB", "spGapReverse", "spGapChallenge", "spGapOverlapA", "spGapOverlapB", "spGapRealA", "spGapRealB"] as const;
    const JUDGE_FORMS = ["spOverlapHeavy", "spOverlapModerate", "spCompareLarge", "spCompareSmall"] as const;
    for (const band of ["support", "core", "stretch"] as const) {
      for (const mForm of MEASURE_FORMS) for (let seed = 0; seed < 12; seed++) {
        const measure = variantForGenForm("g7-sp-gap-units", mForm, `s131:m:${band}:${seed}`, band);
        expect(measure?.widget.type).toBe("distributionCompareLab");
        if (measure?.widget.type !== "distributionCompareLab" || measure.widget.mode !== "measure") throw new Error("measure surface drift");
        expect(widgetIntegrityErrors(measure.widget)).toEqual([]);
        expect(Math.abs(distributionGapUnits(measure.widget) - Number(measure.answer))).toBeLessThanOrEqual(measure.widget.tolerance);

      }
      for (const jForm of JUDGE_FORMS) for (let seed = 0; seed < 12; seed++) {
        const judge = variantForGenForm("g7-sp-overlap-interpret", jForm, `s131:j:${band}:${seed}`, band);
        expect(judge?.widget.type).toBe("distributionCompareLab");
        if (judge?.widget.type !== "distributionCompareLab" || judge.widget.mode !== "judge") throw new Error("judge surface drift");
        expect(widgetIntegrityErrors(judge.widget)).toEqual([]);
        expect(judge.widget.judgeOptions.some((option) => option.id === judge.answer && option.correct)).toBe(true);
      }
    }
  });
});
