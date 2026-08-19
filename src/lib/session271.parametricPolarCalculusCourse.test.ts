import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/parametric-polar-calculus/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/parametric-polar-calculus/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = new Map<string, string[]>([
  ["pc-01-01", ["c1", "k1", "i1", "k2", "c2", "k3", "ch1", "r1"]],
  ["pc-01-02", ["c1", "k1", "i1", "k2", "c2", "k3", "ch1", "r1"]],
  ["pc-02-01", ["c1", "i1", "k1", "k2", "c2", "k3", "ch1", "r1"]],
  ["pc-03-01", ["c1", "k1", "i1", "i1b", "k2", "c2", "k3", "ch1", "r1"]],
]);
const widgetTypes = new Map<string, string[]>([
  ["pc-01-01", ["numeric", "steppedReveal", "mcq", "numeric", "numeric", "numeric"]],
  ["pc-01-02", ["numeric", "steppedReveal", "numeric", "mcq", "numeric", "numeric"]],
  ["pc-02-01", ["sliceSum", "mcq", "circleMeasureExplore", "numeric", "numeric", "numeric"]],
  ["pc-03-01", ["numeric", "vectorExplore", "vectorExplore", "vectorExplore", "numeric", "numeric", "numeric"]],
]);
const lessons = new Map([...expectedSteps.keys()].map((id) => [
  id,
  JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson,
]));
const withheld = new Map<string, string>([
  ["pc-01-01:c1", "dy/dx = (dy/dt) / (dx/dt)"],
  ["pc-01-01:c2", "d²y/dx² = d/dt[dy/dx] ÷ (dx/dt)"],
  ["pc-01-01:rc1", "Divide the second by the first"],
  ["pc-03-01:c2", "a · v = 0"],
]);

function step(lessonId: string, stepId: string): Step {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const found = [...lesson.steps, ...(lesson.remedials ?? []).map((remedial) => remedial.concept)]
    .find((item) => item.id === stepId);
  if (!found) throw new Error(`missing step ${lessonId}:${stepId}`);
  return found;
}

describe("S271 Parametric and Polar Calculus source implementation", () => {
  it("preserves all four manifest lessons, their step IDs, remedials, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([...expectedSteps.keys()]);
    for (const [lessonId, ids] of expectedSteps) {
      const lesson = lessons.get(lessonId);
      if (!lesson) throw new Error(`missing lesson ${lessonId}`);
      expect(lesson.id).toBe(lessonId);
      expect(lesson.steps.map((item) => item.id)).toEqual(ids);
      expect(lesson.remedials).toHaveLength(1);
      expect(lesson.remedials?.[0]?.concept.id).toBe("rc1");
      expect(lesson.remedials?.[0]?.check.id).toBe("rk1");
      const observedTypes = [...lesson.steps, lesson.remedials![0]!.check]
        .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
      expect(observedTypes).toEqual(widgetTypes.get(lessonId));
    }
  });

  it("fail-closes all four incompatible fixed chain-gear illustrations", () => {
    expect(withheld.size).toBe(4);
    for (const [key, signature] of withheld) {
      const [lessonId, stepId] = key.split(":");
      if (!lessonId || !stepId) throw new Error(`malformed disposition ${key}`);
      const item = step(lessonId, stepId);
      expect(item.body).toContain(signature);
      expect(item.figure).toBeUndefined();
    }
  });

  it("keeps every retained figure registered and every evaluator schema-valid with numeric and choice truth intact", () => {
    for (const [lessonId, lesson] of lessons) for (const item of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]) {
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
    }
  });
});
