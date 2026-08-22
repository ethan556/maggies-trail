import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Option = { id: string; correct?: boolean; feedback: string };
type CommonError = { value: number; feedback: string };
type Widget = {
  type: string;
  prompt?: string;
  answer?: number;
  tolerance?: number;
  target?: number;
  values?: number[];
  task?: string;
  options?: Option[];
  commonErrors?: CommonError[];
  fallbackFeedback?: string;
  correct?: string[];
  pairs?: Record<string, string>;
  correctOrder?: string[];
};
type Step = { id: string; body: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type CourseManifest = { chapters: { lessonIds: string[] }[] };

const coursePath = "content/courses/decimals-place-value/course.json";
const dir = "content/courses/decimals-place-value/lessons";
const targets = new Map([
  ["dpv-02-02:c1", { old: "dpv-expanded", signature: "0.375" }],
  ["dpv-02-02:c2", { old: "dpv-expanded", signature: "0.24" }],
  ["dpv-02-03:c1", { old: "dpv-words", signature: "0.375" }],
  ["dpv-02-03:c2", { old: "dpv-words", signature: "0.09" }],
  ["dpv-03-01:c2", { old: "dpv-line-up-compare", signature: "0.7 is greater than 0.68" }],
  ["dpv-03-03:c2", { old: "dpv-trailing-zero", signature: "0.300" }],
  ["dpv-04-02:c2", { old: "dpv-round-whole", signature: "nearest **hundredth**" }],
  ["dpv-04-03:c1", { old: "dpv-round-whole", signature: "$4.60" }],
]);
const expectedTypes = new Map<string, string[]>([
  ["dpv-02-02", ["hundredthsGrid", "buildExpression", "numeric", "matchPairs", "numeric", "numeric"]],
  ["dpv-02-03", ["placeValueTransformLab", "buildExpression", "numeric", "matchPairs", "buildExpression", "numeric"]],
  ["dpv-03-01", ["placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab"]],
  ["dpv-03-03", ["numberLinePlace", "numeric", "numeric", "dragOrder", "numeric"]],
  ["dpv-04-02", ["numberLinePlace", "numeric", "numeric", "mcq", "numeric", "numeric"]],
  ["dpv-04-03", ["placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab"]],
]);
const expectedStepIds = new Map<string, string[]>([
  ["dpv-02-02", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dpv-02-03", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dpv-03-01", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dpv-03-03", ["c1", "i1", "k1", "c2", "k2", "i2", "ch1", "r1"]],
  ["dpv-04-02", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dpv-04-03", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
]);
const lessonIds = [...expectedTypes.keys()];
const lessons: Lesson[] = lessonIds.map((id) => JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson);

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`${lesson.id}:${id} is required`);
  return found;
}

describe("S267 decimals-place-value source implementation", () => {
  it("keeps the six repaired lessons in the manifest with stable lesson and step IDs", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = new Set(manifest.chapters.flatMap((chapter) => chapter.lessonIds));
    expect(lessons.map((lesson) => lesson.id)).toEqual(lessonIds);
    for (const lesson of lessons) {
      expect(manifestIds.has(lesson.id)).toBe(true);
      expect(lesson.steps.map((item) => item.id)).toEqual(expectedStepIds.get(lesson.id));
    }
  });

  it("fail-closes all eight fixed-exemplar conflicts while retaining the authored, truthful example copy", () => {
    expect(targets.size).toBe(8);
    for (const [key, target] of targets) {
      const [lessonId, stepId] = key.split(":");
      const lesson = lessons.find((item) => item.id === lessonId);
      if (!lesson) throw new Error(`${lessonId} missing`);
      const item = step(lesson, stepId);
      expect(item.body).toContain(target.signature);
      expect(item.figure).toBeUndefined();
      expect(item.figure).not.toBe(target.old);
    }
  });

  it("preserves evaluator families and checks learner-visible evaluator correctness and retained figure registration", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.flatMap((item) => item.widget ? [item.widget] : []);
      expect(widgets.map((widget) => widget.type)).toEqual(expectedTypes.get(lesson.id));
      for (const item of lesson.steps) if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
      for (const widget of widgets) {
        expect(widget.prompt?.trim().length).toBeGreaterThan(4);
        if (widget.type === "numeric") {
          expect(Number.isFinite(widget.answer)).toBe(true);
          expect(widget.tolerance).toBe(0);
          expect(widget.commonErrors?.every((error) => error.value !== widget.answer && error.feedback.trim().length > 15)).toBe(true);
          expect(widget.fallbackFeedback?.trim().length).toBeGreaterThan(15);
        }
        if (widget.type === "mcq") {
          expect(widget.options?.filter((option) => option.correct)).toHaveLength(1);
          for (const option of widget.options ?? []) expect(option.feedback.trim().length).toBeGreaterThan(15);
        }
        if (widget.type === "numberLinePlace" || widget.type === "hundredthsGrid") expect(Number.isFinite(widget.target)).toBe(true);
        if (widget.type === "placeValueTransformLab") {
          expect(widget.values?.every(Number.isFinite)).toBe(true);
          expect(widget.task?.trim().length).toBeGreaterThan(3);
        }
        if (widget.type === "buildExpression") expect(widget.correct?.length).toBeGreaterThan(0);
        if (widget.type === "matchPairs") expect(Object.keys(widget.pairs ?? {})).not.toHaveLength(0);
        if (widget.type === "dragOrder") expect(widget.correctOrder?.length).toBeGreaterThan(1);
      }
    }
  });
});
