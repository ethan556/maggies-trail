import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/two-step-equations/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/two-step-equations/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = new Map<string, string[]>([
  ["tse-01-02", ["c1", "e1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
  ["tse-01b-02", ["c1", "i1", "k1", "k2", "c2", "i2", "k3", "ch1", "r1"]],
]);
const widgetTypes = new Map<string, string[]>([
  ["tse-01-02", ["algebraTiles", "mcq", "buildExpression", "mcq", "mcq", "buildExpression", "buildExpression", "buildExpression", "mcq", "mcq"]],
  ["tse-01b-02", ["percentChangeLab", "numeric", "mcq", "percentChangeLab", "numeric", "mcq"]],
]);
const expectedRemedialCounts = new Map<string, number>([
  ["tse-01-02", 2],
  ["tse-01b-02", 0],
]);
const lessons = new Map([...expectedSteps.keys()].map((id) => [
  id,
  JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson,
]));
const withheld = new Map<string, string>([
  ["tse-01-02:c2", "4n + 3 + 2n"],
  ["tse-01b-02:c2", "1.05 × 1.05"],
]);

function step(lessonId: string, stepId: string): Step {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const found = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]
    .find((item) => item.id === stepId);
  if (!found) throw new Error(`missing step ${lessonId}:${stepId}`);
  return found;
}

describe("S275 Two-Step Equations source implementation", () => {
  it("preserves the seventeen-lesson manifest, target step IDs, remedials, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([
      "tse-01-01", "tse-01-02", "tse-01-03",
      "tse-01b-01", "tse-01b-02", "tse-01b-03",
      "tse-02-01", "tse-02-02", "tse-02-03", "tse-02-04", "tse-02-05",
      "tse-03-01", "tse-03-02", "tse-03-03",
      "tse-04-01", "tse-04-02", "tse-04-03",
    ]);
    for (const [lessonId, ids] of expectedSteps) {
      const lesson = lessons.get(lessonId);
      if (!lesson) throw new Error(`missing lesson ${lessonId}`);
      expect(lesson.id).toBe(lessonId);
      expect(lesson.steps.map((item) => item.id)).toEqual(ids);
      const remedialCount = expectedRemedialCounts.get(lessonId);
      if (remedialCount === undefined) throw new Error(`missing remedial count ${lessonId}`);
      expect(lesson.remedials ?? []).toHaveLength(remedialCount);
      const observedTypes = [...lesson.steps, ...(lesson.remedials ?? []).map((remedial) => remedial.check)]
        .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
      expect(observedTypes).toEqual(widgetTypes.get(lessonId));
    }
  });

  it("fail-closes both fixed-exemplar visual mismatches", () => {
    expect(withheld.size).toBe(2);
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
