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
  options?: Option[];
  commonErrors?: CommonError[];
  fallbackFeedback?: string;
  values?: unknown[];
  task?: string;
  target?: number;
  targetBase?: number;
  answerNum?: number;
  answerDen?: number;
};
type Step = { id: string; body: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type CourseManifest = { chapters: { lessonIds: string[] }[] };

const coursePath = "content/courses/radicals-and-exponents/course.json";
const dir = "content/courses/radicals-and-exponents/lessons";
const figures = new Map<string, string | undefined>([
  ["rad-01-01:c1", undefined],
  ["rad-01-03:c1", undefined],
  ["rad-02-03:c1", undefined],
  ["rad-03-01:c1", "rad-denom-root"],
  ["rad-03-02:c1", "rad-read-fraction"],
  ["rad-03-03:c1", "rad-neg-rational"],
]);
const signatures = new Map([
  ["rad-01-01:c1", "√49 = 7"],
  ["rad-01-03:c1", "√12 = 2√3"],
  ["rad-02-03:c1", "√2 · (√3 + √5)"],
  ["rad-03-01:c1", "a^(1/2)"],
  ["rad-03-02:c1", "8^(2/3)"],
  ["rad-03-03:c1", "8^(−1/3)"],
]);
const expectedTypes = new Map<string, string[]>([
  ["rad-01-01", ["numeric", "exactNumberLab", "numeric", "slider", "exactNumberLab", "exactNumberLab", "exactNumberLab"]],
  ["rad-01-03", ["mcq", "exactNumberLab", "mcq", "mcq", "exactNumberLab", "mcq", "mcq"]],
  ["rad-02-03", ["mcq", "exactNumberLab", "numeric", "numeric", "exactNumberLab", "exactNumberLab", "exactNumberLab"]],
  ["rad-03-01", ["expLogExplore", "exactNumberLab", "numeric", "numeric", "exactNumberLab", "exactNumberLab", "exactNumberLab"]],
  ["rad-03-02", ["expLogExplore", "exactNumberLab", "numeric", "numeric", "exactNumberLab", "exactNumberLab", "exactNumberLab"]],
  ["rad-03-03", ["expLogExplore", "fractionEntry", "mcq", "mcq", "fractionEntry", "fractionEntry", "fractionEntry"]],
]);
const lessonIds = [...expectedTypes.keys()];
const stepIds = ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"];
const lessons: Lesson[] = lessonIds.map((id) => JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson);

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`${lesson.id}:${id} is required`);
  return found;
}

describe("S268 radicals-and-exponents source implementation", () => {
  it("preserves all six manifest lessons, stable step IDs, and evaluator families", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = new Set(manifest.chapters.flatMap((chapter) => chapter.lessonIds));
    expect(lessons.map((lesson) => lesson.id)).toEqual(lessonIds);
    for (const lesson of lessons) {
      expect(manifestIds.has(lesson.id)).toBe(true);
      expect(lesson.steps.map((item) => item.id)).toEqual(stepIds);
      expect(lesson.steps.flatMap((item) => item.widget ? [item.widget.type] : [])).toEqual(expectedTypes.get(lesson.id));
    }
  });

  it("uses exact generic formula visuals and fail-closes the three fixed-number or wrong-operation examples", () => {
    let rebound = 0;
    let withheld = 0;
    for (const [key, wanted] of figures) {
      const [lessonId, stepId] = key.split(":");
      const lesson = lessons.find((item) => item.id === lessonId);
      if (!lesson) throw new Error(`${lessonId} missing`);
      const item = step(lesson, stepId);
      expect(item.body).toContain(signatures.get(key));
      if (wanted) {
        expect(item.figure).toBe(wanted);
        expect(FIGURE_IDS.has(wanted)).toBe(true);
        rebound += 1;
      } else {
        expect(item.figure).toBeUndefined();
        withheld += 1;
      }
    }
    expect(rebound).toBe(3);
    expect(withheld).toBe(3);
  });

  it("preserves numeric, choice, exact-number, slider, and fraction evaluator correctness", () => {
    for (const lesson of lessons) for (const item of lesson.steps) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
      const widget = item.widget;
      if (!widget) continue;
      expect(widget.prompt?.trim().length).toBeGreaterThan(4);
      if (widget.type === "numeric") {
        expect(Number.isFinite(widget.answer)).toBe(true);
        expect(widget.tolerance).toBe(0);
        expect(widget.commonErrors?.every((error) => error.value !== widget.answer && error.feedback.trim().length > 15)).toBe(true);
      }
      if (widget.type === "mcq") {
        expect(widget.options?.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options ?? []) expect(option.feedback.trim().length).toBeGreaterThan(15);
      }
      if (widget.type === "exactNumberLab") {
        expect(widget.task?.trim().length).toBeGreaterThan(4);
        expect(widget.values?.length).toBeGreaterThan(0);
      }
      if (widget.type === "slider") expect(Number.isFinite(widget.target)).toBe(true);
      if (widget.type === "expLogExplore") expect(Number.isFinite(widget.targetBase)).toBe(true);
      if (widget.type === "fractionEntry") {
        expect(Number.isFinite(widget.answerNum)).toBe(true);
        expect(Number.isFinite(widget.answerDen)).toBe(true);
        expect((widget.answerDen ?? 0) > 0).toBe(true);
      }
    }
  });
});
