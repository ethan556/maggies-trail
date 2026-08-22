import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import {
  WidgetSpec,
  compoundEventChoiceCorrect,
  compoundEventFavourable,
  compoundEventTotal,
  shapeHierarchyChoiceCorrect,
  widgetIntegrityErrors,
  type TCompoundEventLab,
} from "./schema";
import { seededShuffle } from "./prng";

const COURSE_ROOT = join(process.cwd(), "content/courses");
const lesson = (course: string, id: string) => JSON.parse(readFileSync(join(COURSE_ROOT, course, "lessons", `${id}.json`), "utf8")) as {
  steps: Array<{ id: string; kind: string; widget?: unknown }>;
  remedials: Array<{ check: { id: string; kind: string; widget?: unknown } }>;
};
const experience = (doc: ReturnType<typeof lesson>, id: string) =>
  [...doc.steps, ...doc.remedials.map((route) => route.check)].find((step) => step.id === id);

const SHAPE_TARGETS = [
  ["cg-03-01", "k1"],
  ["cg-03-01", "k2"],
  ["cg-03-01", "ch1"],
  ["cg-03-03", "i2"],
  ["cg-04-02", "k2"],
  ["cg-04-02", "k3"],
] as const;

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const fractionKey = (num: number, den: number) => {
  const divisor = gcd(num, den);
  return `${num / divisor}/${den / divisor}`;
};
const answerKey = (spec: TCompoundEventLab) => spec.mode === "count"
  ? String(compoundEventTotal(spec))
  : fractionKey(compoundEventFavourable(spec), compoundEventTotal(spec));
const choiceKey = (spec: TCompoundEventLab, choice: TCompoundEventLab["choices"][number]) => {
  const value = choice as { count?: number; num?: number; den?: number };
  return spec.mode === "count"
    ? String(value.count)
    : fractionKey(value.num ?? 0, value.den ?? 1);
};
const profile = (spec: TCompoundEventLab) => [
  spec.mode,
  spec.stages.map((stage) => stage.outcomes.length).join("x"),
  spec.stages.map((stage) => stage.favourable.length).join("x"),
  answerKey(spec),
].join("|");

describe("S245 authored shape and compound-event debt closure", () => {
  it("reduces all six shape option-clue skews from the measured baseline", () => {
    const rows = SHAPE_TARGETS.map(([lessonId, stepId]) => {
      const step = experience(lesson("coordinate-geometry", lessonId), stepId);
      const spec = WidgetSpec.parse(step?.widget);
      expect(spec.type).toBe("shapeHierarchyLab");
      if (spec.type !== "shapeHierarchyLab") throw new Error(`${lessonId}/${stepId}: wrong widget`);
      const correctIndex = spec.choices.findIndex((choice) => shapeHierarchyChoiceCorrect(spec, choice));
      expect(correctIndex, `${lessonId}/${stepId}: unique truth`).toBeGreaterThanOrEqual(0);
      const lengths = spec.choices.map((choice) => choice.label.length);
      const wrongMean = spec.choices
        .filter((_, index) => index !== correctIndex)
        .reduce((sum, choice) => sum + choice.label.length, 0) / (spec.choices.length - 1);
      for (const choice of spec.choices) {
        expect(choice.label.trim().split(/\s+/).length, `${lessonId}/${stepId}/${choice.id}: concise`).toBeLessThanOrEqual(8);
        expect(choice.feedback.trim().length, `${lessonId}/${stepId}/${choice.id}: diagnostic`).toBeGreaterThan(25);
      }
      expect(new Set(spec.choices.map((choice) => choice.feedback)).size).toBe(spec.choices.length);
      expect(spec.choices.filter((choice) => shapeHierarchyChoiceCorrect(spec, choice))).toHaveLength(1);
      return {
        spread: Math.max(...lengths) - Math.min(...lengths),
        correctSkew: Math.abs(lengths[correctIndex] - wrongMean),
      };
    });
    const metrics = {
      meanSpread: rows.reduce((sum, row) => sum + row.spread, 0) / rows.length,
      maxSpread: Math.max(...rows.map((row) => row.spread)),
      meanCorrectSkew: rows.reduce((sum, row) => sum + row.correctSkew, 0) / rows.length,
    };
    expect(metrics).toEqual({ meanSpread: 13 / 3, maxSpread: 6, meanCorrectSkew: 11 / 6 });
    expect(metrics.meanSpread).toBeLessThan(35.1667); // measured pre-repair baseline
    expect(metrics.maxSpread).toBeLessThan(47); // measured pre-repair baseline
    expect(metrics.meanCorrectSkew).toBeLessThan(26.8334); // measured pre-repair baseline
  });

  it("gives all eight compound-event placements distinct prompts, models, answers, and misconception paths", () => {
    const doc = lesson("sampling-and-probability", "sp-04-03");
    const rows = [...doc.steps, ...doc.remedials.map((route) => route.check)]
      .filter((step) => (step.widget as { type?: string } | undefined)?.type === "compoundEventLab")
      .map((step) => ({ step, spec: WidgetSpec.parse(step.widget) })) as Array<{ step: { id: string; kind: string }; spec: TCompoundEventLab }>;
    expect(rows).toHaveLength(8);
    expect(new Set(rows.map(({ spec }) => spec.prompt)).size).toBe(8);
    expect(new Set(rows.map(({ spec }) => profile(spec))).size).toBe(8);
    expect(new Set(rows.map(({ spec }) => answerKey(spec))).size).toBe(8);
    expect(new Set(rows.map(({ spec }) => spec.stages.length))).toEqual(new Set([2, 3, 4]));
    expect(rows.filter(({ spec }) => spec.mode === "count")).toHaveLength(5);
    expect(rows.filter(({ spec }) => spec.mode === "probability")).toHaveLength(3);
    for (const { step, spec } of rows) {
      expect(widgetIntegrityErrors(spec), step.id).toEqual([]);
      expect(spec.prompt.endsWith("?"), `${step.id}: question stem`).toBe(true);
      expect(spec.prompt.length, `${step.id}: concise stem`).toBeLessThanOrEqual(165);
      expect(spec.choices.filter((choice) => compoundEventChoiceCorrect(spec, choice)), step.id).toHaveLength(1);
      expect(new Set(spec.choices.map((choice) => choiceKey(spec, choice))).size, `${step.id}: no equivalent options`).toBe(spec.choices.length);
      expect(new Set(spec.choices.map((choice) => choice.feedback)).size, `${step.id}: distinct diagnoses`).toBe(spec.choices.length);
      for (const choice of spec.choices) {
        const result = evaluate(spec, choice.id);
        expect(result.correct, `${step.id}/${choice.id}: evaluator truth`).toBe(compoundEventChoiceCorrect(spec, choice));
        expect(result.feedback).toBe(choice.feedback);
        expect(choice.feedback.trim().length, `${step.id}/${choice.id}: useful feedback`).toBeGreaterThan(25);
      }
      const ids = spec.choices.map((choice) => choice.id).sort();
      const order = (seed: string) => seededShuffle(spec.choices, seed).map((choice) => choice.id);
      expect(order(`s245:${step.id}`)).toEqual(order(`s245:${step.id}`));
      expect([...order(`s245:${step.id}`)].sort()).toEqual(ids);
      expect(new Set(Array.from({ length: 8 }, (_, index) => order(`s245:${step.id}:${index}`).join("|"))).size).toBeGreaterThan(1);
    }
  });

  it("makes the challenge a genuine three-stage transfer and the remedial a smaller new model", () => {
    const doc = lesson("sampling-and-probability", "sp-04-03");
    const challenge = WidgetSpec.parse(experience(doc, "ch1")?.widget);
    const first = WidgetSpec.parse(experience(doc, "i1")?.widget);
    const remedial = WidgetSpec.parse(experience(doc, "rem-srp-k")?.widget);
    expect(challenge.type).toBe("compoundEventLab");
    expect(first.type).toBe("compoundEventLab");
    expect(remedial.type).toBe("compoundEventLab");
    if (challenge.type !== "compoundEventLab" || first.type !== "compoundEventLab" || remedial.type !== "compoundEventLab") return;
    expect(challenge.mode).toBe("probability");
    expect(challenge.stages).toHaveLength(3);
    expect(answerKey(challenge)).toBe("1/10");
    expect(challenge.choices.filter((choice) => !compoundEventChoiceCorrect(challenge, choice)).map((choice) => choiceKey(challenge, choice)).sort()).toEqual(["1/4", "1/5"]);
    expect(profile(challenge)).not.toBe(profile(WidgetSpec.parse(experience(doc, "k1")?.widget) as TCompoundEventLab));
    expect(compoundEventTotal(remedial)).toBeLessThan(compoundEventTotal(first));
    expect(profile(remedial)).not.toBe(profile(first));
  });
});
