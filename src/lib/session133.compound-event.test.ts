import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  compoundEventChoiceCorrect,
  compoundEventFavourable,
  compoundEventTotal,
  widgetIntegrityErrors,
  type TCompoundEventLab
} from "./schema";
import { variantForGenForm } from "./variants";

const lessonFile = join(process.cwd(), "content/courses/sampling-and-probability/lessons/sp-04-03.json");

function specs(): TCompoundEventLab[] {
  const lesson = JSON.parse(readFileSync(lessonFile, "utf8")) as {
    steps: Array<{ widget?: unknown }>;
    remedials?: Array<{ check: { widget: unknown } }>;
  };
  const out: TCompoundEventLab[] = [];
  for (const step of lesson.steps) {
    if (!step.widget) continue;
    const parsed = WidgetSpec.parse(step.widget);
    if (parsed.type === "compoundEventLab") out.push(parsed);
  }
  for (const remedial of lesson.remedials ?? []) {
    const parsed = WidgetSpec.parse(remedial.check.widget);
    if (parsed.type === "compoundEventLab") out.push(parsed);
  }
  return out;
}

function probabilityFixture(): TCompoundEventLab {
  const parsed = WidgetSpec.parse({
    type: "compoundEventLab",
    prompt: "Flip heads and roll an even number.",
    mode: "probability",
    stages: [
      { label: "Coin", outcomes: ["H", "T"], favourable: [0] },
      { label: "Die", outcomes: ["1", "2", "3", "4", "5", "6"], favourable: [1, 3, 5] }
    ],
    choices: [
      { id: "correct", label: "1/4", num: 1, den: 4, feedback: "Three of twelve." },
      { id: "one-event", label: "1/2", num: 1, den: 2, feedback: "That counts one stage only." },
      { id: "one-pair", label: "1/12", num: 1, den: 12, feedback: "That counts one winning pair." }
    ],
    fallbackFeedback: "Use favourable ordered pairs over all ordered pairs.",
    successFeedback: "Three of twelve."
  });
  if (parsed.type !== "compoundEventLab") throw new Error("bad fixture");
  return parsed;
}

describe("Session 133 compound event lab", () => {
  it("converts all seven lesson tasks plus the remedial without merging count and probability grading", () => {
    const converted = specs();
    expect(converted).toHaveLength(8);
    expect(converted.filter((spec) => spec.mode === "count")).toHaveLength(5);
    expect(converted.filter((spec) => spec.mode === "probability")).toHaveLength(3);
    for (const spec of converted) {
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(spec.choices.filter((choice) => compoundEventChoiceCorrect(spec, choice))).toHaveLength(1);
      expect(spec.choices.filter((choice) => !compoundEventChoiceCorrect(spec, choice)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("derives sample-space size and favourable count from the same stage structure", () => {
    const spec = probabilityFixture();
    expect(compoundEventTotal(spec)).toBe(12);
    expect(compoundEventFavourable(spec)).toBe(3);
    expect(compoundEventChoiceCorrect(spec, spec.choices[0])).toBe(true);
    expect(compoundEventChoiceCorrect(spec, { num: 3, den: 12 })).toBe(true);
  });

  it("grades exact authored claims and returns each misconception diagnosis", () => {
    const spec = probabilityFixture();
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, "one-event")).toBe(true);
    expect(evaluate(spec, "correct")).toEqual({ correct: true, feedback: "Three of twelve." });
    expect(evaluate(spec, "one-event")).toEqual({ correct: false, feedback: "That counts one stage only." });
    expect(evaluate(spec, "one-pair")).toEqual({ correct: false, feedback: "That counts one winning pair." });
    expect(correctAnswerText(spec)).toBe("1/4");
    expect(learnerAnswerText(spec, "one-pair")).toBe("1/12");
  });

  it("rejects ambiguous, impossible, and mode-conflicting authoring", () => {
    const spec = probabilityFixture();
    const errors = [
      WidgetSpec.parse({ ...spec, stages: [{ ...spec.stages[0], favourable: [2] }, spec.stages[1]] }),
      WidgetSpec.parse({ ...spec, stages: [{ ...spec.stages[0], outcomes: ["H", "H"] }, spec.stages[1]] }),
      WidgetSpec.parse({ ...spec, choices: spec.choices.map((choice) => ({ ...choice, num: 1, den: 4 })) }),
      WidgetSpec.parse({ ...spec, mode: "count", stages: spec.stages, choices: spec.choices }),
      WidgetSpec.parse({ ...spec, stages: Array.from({ length: 3 }, (_, i) => ({ label: `S${i}`, outcomes: Array.from({ length: 6 }, (_, j) => String(j)), favourable: [0] })) })
    ].flatMap(widgetIntegrityErrors).join("\n");
    expect(errors).toContain("favourable index outside Coin");
    expect(errors).toContain("duplicate outcomes in Coin");
    expect(errors).toContain("expected exactly one correct choice");
    expect(errors).toContain("count): favourable outcomes must stay empty");
    expect(errors).toContain("outcome space 216 exceeds the 120-cell visual ceiling");
  });

  it("preserves every converted wrong path as a reachable exact choice", () => {
    for (const spec of specs()) {
      for (const choice of spec.choices.filter((candidate) => !compoundEventChoiceCorrect(spec, candidate))) {
        expect(evaluate(spec, choice.id)).toEqual({ correct: false, feedback: choice.feedback });
      }
    }
  });

  it("keeps all four declared variant forms on the compound-event surface across bands and seeds", () => {
    const forms = [
      ["g7-sp-compound-model", "spCompoundBasic"],
      ["g7-sp-compound-model", "spCompoundGame"],
      ["g7-sp-counting-principle", "spCountOutfitsReal"],
      ["g7-sp-counting-principle", "spCountCoinDieReal"]
    ] as const;
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 0; seed < 96; seed++) {
        for (const [gen, form] of forms) {
          const variant = variantForGenForm(gen, form, `s133:${gen}:${form}:${band}:${seed}`, band);
          expect(variant?.widget.type).toBe("compoundEventLab");
          if (variant?.widget.type !== "compoundEventLab") throw new Error("surface drift");
          const lab = variant.widget;
          expect(widgetIntegrityErrors(lab)).toEqual([]);
          expect(lab.choices.filter((choice) => compoundEventChoiceCorrect(lab, choice))).toHaveLength(1);
          expect(variant.answer).toBe(lab.choices.find((choice) => compoundEventChoiceCorrect(lab, choice))?.id);
        }
      }
    }
  });
});
