import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; kind: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[] };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/exponents-scientific-notation/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/exponents-scientific-notation/course.json", "utf8")) as Course;
const courseLessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = new Map<string, string[]>([
  ["esn-01-01", ["c1", "i1", "c2", "k1", "i2", "k2", "i3", "k3", "ch1", "r1"]],
  ["esn-01-02", ["c1", "i1", "c2", "k1", "i2", "k2", "i3", "k3", "ch1", "r1"]],
  ["esn-01b-01", ["c1", "i1", "k1", "k2", "c2", "i2", "k3", "ch1", "r1"]],
  ["esn-02-01", ["c1", "i1", "c2", "k1", "i2", "k2", "k3", "i3", "ch1", "r1"]],
  ["esn-03-02", ["c1", "i1", "c2", "k1", "i2", "k2", "i3", "k3", "ch1", "r1"]],
  ["esn-04-01", ["c1", "i1", "c2", "k1", "i2", "k2", "k3", "ch1", "r1"]],
  ["esn-04-02", ["c1", "i1", "c2", "k1", "i2", "k2", "k3", "ch1", "r1"]],
  ["esn-04-03", ["c1", "i1", "c2", "k1", "i2", "k2", "k3", "ch1", "r1"]],
]);
const lessons = new Map([...expectedSteps.keys()].map((id) => [
  id,
  JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson,
]));
const withheld = new Map<string, string>([
  ["esn-01-01:c2", "10⁻² = 0.01"],
  ["esn-01-02:c2", "10³ ÷ 10⁻²"],
  ["esn-02-01:c2", "positive p in x² = p has two solutions"],
  ["esn-03-02:c1", "0.00032 = 3.2 × 10⁻⁴"],
  ["esn-03-02:c2", "0.000000091"],
  ["esn-04-01:c2", "12 × 10¹¹ = 1.2 × 10¹²"],
  ["esn-04-02:c2", "(5×10⁶) − (2×10⁵)"],
  ["esn-04-03:c2", "one significant digit"],
]);

function step(lessonId: string, stepId: string): Step {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const found = lesson.steps.find((item) => item.id === stepId);
  if (!found) throw new Error(`missing step ${lessonId}:${stepId}`);
  return found;
}

describe("S270 Exponents and Scientific Notation source implementation", () => {
  it("preserves all 15 manifest lessons, and stable IDs in every affected lesson", () => {
    expect(courseLessonIds).toHaveLength(15);
    expect(new Set(courseLessonIds).size).toBe(15);
    for (const [lessonId, ids] of expectedSteps) {
      expect(courseLessonIds).toContain(lessonId);
      expect(lessons.get(lessonId)?.id).toBe(lessonId);
      expect(lessons.get(lessonId)?.steps.map((item) => item.id)).toEqual(ids);
    }
  });

  it("withholds all eight unmatched fixed examples and retains the exact generic exponent factor-counting visual", () => {
    expect(withheld.size).toBe(8);
    for (const [key, signature] of withheld) {
      const [lessonId, stepId] = key.split(":");
      if (!lessonId || !stepId) throw new Error(`malformed disposition ${key}`);
      const item = step(lessonId, stepId);
      expect(item.body).toContain(signature);
      expect(item.figure).toBeUndefined();
    }
    const retained = step("esn-01b-01", "c1");
    expect(retained.body).toContain("a³ · a² = a⁵");
    expect(retained.figure).toBe("exponent-repeat");
    expect(FIGURE_IDS.has("exponent-repeat")).toBe(true);
  });

  it("preserves registered visuals and all graded evaluator contracts", () => {
    for (const [lessonId, lesson] of lessons) for (const item of lesson.steps) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure), `${lessonId}:${item.id} figure`).toBe(true);
      if (!item.widget) continue;
      const widget = WidgetSpec.parse(item.widget);
      expect(widgetIntegrityErrors(widget), `${lessonId}:${item.id}`).toEqual([]);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lessonId}:${item.id}`).toBe(true);
      if (widget.type === "mcq") {
        const correct = widget.options.filter((option) => option.correct);
        expect(correct, `${lessonId}:${item.id} choices`).toHaveLength(1);
        expect(evaluate(widget, correct[0]!.id).correct, `${lessonId}:${item.id}`).toBe(true);
      }
      if (widget.type === "buildExpression") expect(evaluate(widget, widget.correct).correct, `${lessonId}:${item.id}`).toBe(true);
    }
  });
});
