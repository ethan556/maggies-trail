import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/place-value-1000/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/place-value-1000/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = new Map<string, string[]>([
  ["pv1000-02-01", ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
  ["pv1000-04-02", ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
  ["pv1000-04-03", ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
]);
const widgetTypes = new Map<string, string[]>([
  ["pv1000-02-01", ["numberLineHop", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]],
  ["pv1000-04-02", ["baseTenCompose", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]],
  ["pv1000-04-03", ["baseTenCompose", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]],
]);
const lessons = new Map([...expectedSteps.keys()].map((id) => [
  id,
  JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson,
]));
const withheld = new Map<string, string>([
  ["pv1000-02-01:c1", "320, 330, 340, 350"],
  ["pv1000-04-02:c1", "486 − 253"],
  ["pv1000-04-03:c2", "247 + 186 = 433"],
]);

function step(lessonId: string, stepId: string): Step {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const found = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]
    .find((item) => item.id === stepId);
  if (!found) throw new Error(`missing step ${lessonId}:${stepId}`);
  return found;
}

describe("S273 Place Value within 1,000 source implementation", () => {
  it("preserves the twelve-lesson manifest, targeted step IDs, remedials, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([
      "pv1000-01-01", "pv1000-01-02", "pv1000-01-03",
      "pv1000-02-01", "pv1000-02-02", "pv1000-02-03",
      "pv1000-03-01", "pv1000-03-02", "pv1000-03-03",
      "pv1000-04-01", "pv1000-04-02", "pv1000-04-03",
    ]);
    for (const [lessonId, ids] of expectedSteps) {
      const lesson = lessons.get(lessonId);
      if (!lesson) throw new Error(`missing lesson ${lessonId}`);
      expect(lesson.id).toBe(lessonId);
      expect(lesson.steps.map((item) => item.id)).toEqual(ids);
      expect(lesson.remedials?.length).toBeGreaterThanOrEqual(1);
      const observedTypes = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.check])]
        .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
      expect(observedTypes).toEqual(widgetTypes.get(lessonId));
    }
  });

  it("fail-closes all three withheld fixed-exemplar illustrations", () => {
    expect(withheld.size).toBe(3);
    for (const [key, signature] of withheld) {
      const [lessonId, stepId] = key.split(":");
      if (!lessonId || !stepId) throw new Error(`malformed disposition ${key}`);
      const item = step(lessonId, stepId);
      expect(item.body).toContain(signature);
      expect(item.figure).toBeUndefined();
    }
  });

  it("keeps every retained figure registered and every evaluator schema-valid with numeric and choice truth intact", () => {
    for (const [lessonId, lesson] of lessons) for (const item of [
      ...lesson.steps,
      ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check]),
    ]) {
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
