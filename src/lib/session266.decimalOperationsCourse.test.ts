import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Option = { id: string; label: string; correct?: boolean; feedback: string };
type CommonError = { value: number; feedback: string };
type Widget = {
  type: string;
  prompt?: string;
  answer?: number;
  tolerance?: number;
  options?: Option[];
  commonErrors?: CommonError[];
  fallbackFeedback?: string;
  a?: number;
  b?: number;
  op?: string;
  target?: number;
  values?: number[];
  task?: string;
};
type Step = { id: string; body: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type CourseManifest = { chapters: { lessonIds: string[] }[] };

const coursePath = "content/courses/decimal-operations/course.json";
const dir = "content/courses/decimal-operations/lessons";
const targets = new Map([
  ["dop-02-02:c1", { old: "dop-standard-algo", signature: "47 × 6" }],
  ["dop-02-02:c2", { old: "dop-standard-algo", signature: "35 × 4" }],
  ["dop-02-03:c2", { old: "dop-two-by-two", signature: "23 × 40 = 920" }],
  ["dop-03-01:c2", { old: "dop-estimate-quotient", signature: "360 ÷ 60 = 6" }],
  ["dop-04-02:c1", { old: "dop-pad-borrow", signature: "4.08 + 2.9" }],
  ["dop-04-02:c2", { old: "dop-pad-borrow", signature: "10.0 − 3.47" }],
  ["dop-05-02:c1", { old: "dop-count-places", signature: "2.5 × 1.4" }],
  ["dop-05-02:c2", { old: "dop-estimate-quotient", signature: "3 × 1 = 3" }],
  ["dop-05-03:c1", { old: "dop-count-places", signature: "4.8 ÷ 6" }],
]);
const expectedTypes = new Map<string, string[]>([
  ["dop-02-02", ["numeric", "columnCalc", "numeric", "mcq", "columnCalc", "numeric"]],
  ["dop-02-03", ["columnCalc", "numeric", "numeric", "mcq", "numeric", "numeric"]],
  ["dop-03-01", ["numberLinePlace", "numeric", "numeric", "mcq", "numeric", "numeric"]],
  ["dop-04-02", ["numeric", "numeric", "numeric", "columnCalc", "numeric"]],
  ["dop-05-02", ["numberLinePlace", "numeric", "numeric", "mcq", "numeric", "numeric"]],
  ["dop-05-03", ["placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab", "placeValueTransformLab"]],
]);
const expectedStepIds = new Map<string, string[]>([
  ["dop-02-02", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dop-02-03", ["c1", "i1", "c2", "k1", "k2", "i2", "k3", "ch1", "r1"]],
  ["dop-03-01", ["c1", "i1", "c2", "k1", "k2", "i2", "k3", "ch1", "r1"]],
  ["dop-04-02", ["c1", "i1", "k1", "c2", "k2", "i2", "ch1", "r1"]],
  ["dop-05-02", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
  ["dop-05-03", ["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]],
]);
const lessonIds = [...expectedTypes.keys()];
const lessons: Lesson[] = lessonIds.map((id) => JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson);

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`${lesson.id}:${id} is required`);
  return found;
}

describe("S266 decimal-operations source implementation", () => {
  it("keeps all six repaired lessons in the course manifest with their stable step IDs", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = new Set(manifest.chapters.flatMap((chapter) => chapter.lessonIds));
    expect(lessons.map((lesson) => lesson.id)).toEqual(lessonIds);
    for (const lesson of lessons) {
      expect(manifestIds.has(lesson.id)).toBe(true);
      expect(lesson.steps.map((item) => item.id)).toEqual(expectedStepIds.get(lesson.id));
    }
  });

  it("fail-closes every fixed-exemplar conflict without changing the learner-visible worked example", () => {
    expect(targets.size).toBe(9);
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

  it("preserves evaluator families, numeric validity, option correctness, and all registered retained figures", () => {
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
        if (widget.type === "columnCalc") {
          expect(widget.op).toMatch(/^(add|multiply)$/);
          expect(Number.isFinite(widget.a)).toBe(true);
          expect(Number.isFinite(widget.b)).toBe(true);
        }
        if (widget.type === "numberLinePlace") expect(Number.isFinite(widget.target)).toBe(true);
        if (widget.type === "placeValueTransformLab") {
          expect(widget.task).toMatch(/^(decimalDivision|divisionFirstMove)$/);
          expect(widget.values?.every(Number.isFinite)).toBe(true);
        }
      }
    }
  });
});
