import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  trialProbabilityClaimCount,
  trialProbabilityEquivalent,
  widgetIntegrityErrors,
  type TTrialProbabilityLab
} from "./schema";
import { variantForGenForm } from "./variants";

const lessonFiles = ["sp-03-02.json", "sp-03-03.json"].map((file) =>
  join(process.cwd(), "content/courses/sampling-and-probability/lessons", file)
);

function convertedSpecs(): TTrialProbabilityLab[] {
  const out: TTrialProbabilityLab[] = [];
  for (const file of lessonFiles) {
    const lesson = JSON.parse(readFileSync(file, "utf8")) as {
      steps: Array<{ widget?: unknown }>;
      remedials?: Array<{ check: { widget: unknown } }>;
    };
    for (const step of lesson.steps) {
      if (!step.widget) continue;
      const parsed = WidgetSpec.parse(step.widget);
      if (parsed.type === "trialProbabilityLab") out.push(parsed);
    }
    for (const remedial of lesson.remedials ?? []) {
      const parsed = WidgetSpec.parse(remedial.check.widget);
      if (parsed.type === "trialProbabilityLab") out.push(parsed);
    }
  }
  return out;
}

function experimentalSpec(): TTrialProbabilityLab {
  const parsed = WidgetSpec.parse({
    type: "trialProbabilityLab",
    prompt: "A coin landed heads 6 times in 10 flips. Choose the relative frequency.",
    mode: "experimental",
    favourable: 6,
    total: 10,
    successLabel: "heads",
    totalLabel: "flips",
    outcomes: [],
    choices: [
      { id: "correct", label: "3/5", num: 3, den: 5, feedback: "Six out of ten is three fifths." },
      { id: "over-rest", label: "6/4", num: 6, den: 4, feedback: "That compares heads with tails." },
      { id: "theoretical", label: "1/2", num: 1, den: 2, feedback: "That is the theoretical probability, not this result." }
    ],
    fallbackFeedback: "Use favourable outcomes over all trials.",
    successFeedback: "Six out of ten is three fifths."
  });
  if (parsed.type !== "trialProbabilityLab") throw new Error("bad fixture");
  return parsed;
}

describe("Session 132 trial probability lab", () => {
  it("converts 15 fixed experiences while preserving 12 experimental and 3 theoretical tasks", () => {
    const specs = convertedSpecs();
    expect(specs).toHaveLength(15);
    expect(specs.filter((spec) => spec.mode === "experimental")).toHaveLength(12);
    expect(specs.filter((spec) => spec.mode === "theoretical")).toHaveLength(3);
    for (const spec of specs) {
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(spec.choices.filter((choice) => trialProbabilityEquivalent(spec, choice))).toHaveLength(1);
      expect(spec.choices.filter((choice) => !trialProbabilityEquivalent(spec, choice)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("grades the fraction by exact cross-product truth and returns the authored diagnosis", () => {
    const spec = experimentalSpec();
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, "correct")).toBe(true);
    expect(evaluate(spec, "correct")).toEqual({ correct: true, feedback: spec.successFeedback });
    expect(evaluate(spec, "over-rest")).toEqual({ correct: false, feedback: "That compares heads with tails." });
    expect(evaluate(spec, "theoretical")).toEqual({ correct: false, feedback: "That is the theoretical probability, not this result." });
    expect(correctAnswerText(spec)).toBe("3/5");
    expect(learnerAnswerText(spec, "over-rest")).toBe("6/4");
  });

  it("projects every claim onto the same total so complement and over-rest errors stay causal", () => {
    const spec = experimentalSpec();
    const correct = spec.choices.find((choice) => choice.id === "correct")!;
    const overRest = spec.choices.find((choice) => choice.id === "over-rest")!;
    const theoretical = spec.choices.find((choice) => choice.id === "theoretical")!;
    expect(trialProbabilityClaimCount(spec, correct)).toBe(6);
    expect(trialProbabilityClaimCount(spec, overRest)).toBe(15);
    expect(trialProbabilityClaimCount(spec, theoretical)).toBe(5);
  });

  it("uses equivalent fractions as truth without allowing an equivalent duplicate choice", () => {
    const spec = experimentalSpec();
    expect(trialProbabilityEquivalent(spec, { num: 6, den: 10 })).toBe(true);
    const duplicate = WidgetSpec.parse({ ...spec, choices: [...spec.choices, { id: "duplicate", label: "6/10", num: 6, den: 10, feedback: "same value" }] });
    expect(widgetIntegrityErrors(duplicate)).toContain("trialProbabilityLab: equivalent duplicate fraction choices are not allowed");
  });

  it("rejects ambiguous, impossible, and mode-conflicting authoring", () => {
    const spec = experimentalSpec();
    const errors = [
      WidgetSpec.parse({ ...spec, favourable: 11 }),
      WidgetSpec.parse({ ...spec, choices: spec.choices.map((choice) => ({ ...choice, num: choice.id === "correct" ? 2 : choice.num })) }),
      WidgetSpec.parse({ ...spec, referenceNum: 2 }),
      WidgetSpec.parse({ ...spec, outcomes: [{ label: "H", favourable: true }] }),
      WidgetSpec.parse({ ...spec, mode: "theoretical", outcomes: [{ label: "H", favourable: true }] })
    ].flatMap(widgetIntegrityErrors).join("\n");
    expect(errors).toContain("favourable 11 exceeds total 10");
    expect(errors).toContain("expected exactly one accepted fraction");
    expect(errors).toContain("referenceNum and referenceDen must appear together");
    expect(errors).toContain("experimental): outcomes must stay empty");
    expect(errors).toContain("expected 10 listed outcomes");
  });

  it("preserves every converted misconception feedback as a reachable exact choice", () => {
    for (const spec of convertedSpecs()) {
      const wrong = spec.choices.filter((choice) => !trialProbabilityEquivalent(spec, choice));
      expect(wrong.length).toBeGreaterThanOrEqual(2);
      for (const choice of wrong) {
        expect(evaluate(spec, choice.id)).toEqual({ correct: false, feedback: choice.feedback });
      }
    }
  });

  it("keeps both declared variant forms on the causal surface across bands and seeds", () => {
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 0; seed < 96; seed++) {
        for (const form of ["trialRelFreq", "trialTheoretical"] as const) {
          const variant = variantForGenForm("prob-fraction", form, `s132:${form}:${band}:${seed}`, band);
          expect(variant?.widget.type).toBe("trialProbabilityLab");
          if (variant?.widget.type !== "trialProbabilityLab") throw new Error("surface drift");
          const lab = variant.widget;
          expect(variant.answer).toBe("correct");
          expect(widgetIntegrityErrors(lab)).toEqual([]);
          expect(lab.choices.filter((choice) => trialProbabilityEquivalent(lab, choice))).toHaveLength(1);
        }
      }
    }
  });

  it("keeps theoretical outcome counts identical to the drawn favourable set", () => {
    for (const spec of convertedSpecs().filter((candidate) => candidate.mode === "theoretical")) {
      expect(spec.outcomes).toHaveLength(spec.total);
      expect(spec.outcomes.filter((outcome) => outcome.favourable)).toHaveLength(spec.favourable);
    }
  });
});
