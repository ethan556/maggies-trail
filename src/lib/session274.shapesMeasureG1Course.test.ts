import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/shapes-measure-g1/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/shapes-measure-g1/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = new Map<string, string[]>([
  ["smg1-02-02", ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
  ["smg1-04-02", ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]],
]);
const widgetTypes = new Map<string, string[]>([
  ["smg1-02-02", ["numeric", "fractionBar", "mcq", "numeric", "mcq", "mcq", "numeric", "numeric"]],
  ["smg1-04-02", ["clockSet", "clockSet", "clockSet", "clockSet", "clockSet", "clockSet", "clockSet", "mcq"]],
]);
const lessons = new Map([...expectedSteps.keys()].map((id) => [
  id,
  JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8")) as Lesson,
]));
const withheld = new Map<string, string>([
  ["smg1-02-02:c1", "Splitting a whole into **fourths**"],
  ["smg1-04-02:c1", "minute hand points straight down to 6"],
]);

function step(lessonId: string, stepId: string): Step {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const found = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]
    .find((item) => item.id === stepId);
  if (!found) throw new Error(`missing step ${lessonId}:${stepId}`);
  return found;
}

describe("S274 Shapes & Measurement G1 source implementation", () => {
  it("preserves the twelve-lesson manifest, target step/remedial IDs, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([
      "smg1-01-01", "smg1-01-02", "smg1-01-03",
      "smg1-02-01", "smg1-02-02", "smg1-02-03",
      "smg1-03-01", "smg1-03-02", "smg1-03-03",
      "smg1-04-01", "smg1-04-02", "smg1-04-03",
    ]);
    for (const [lessonId, ids] of expectedSteps) {
      const lesson = lessons.get(lessonId);
      if (!lesson) throw new Error(`missing lesson ${lessonId}`);
      expect(lesson.id).toBe(lessonId);
      expect(lesson.steps.map((item) => item.id)).toEqual(ids);
      expect(lesson.remedials).toHaveLength(1);
      const observedTypes = [...lesson.steps, lesson.remedials![0]!.check]
        .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
      expect(observedTypes).toEqual(widgetTypes.get(lessonId));
    }
  });

  it("fail-closes the two withheld figure bindings and diversifies the duplicate challenge without changing its numeric truth", () => {
    expect(withheld.size).toBe(2);
    for (const [key, signature] of withheld) {
      const [lessonId, stepId] = key.split(":");
      if (!lessonId || !stepId) throw new Error(`malformed disposition ${key}`);
      const item = step(lessonId, stepId);
      expect(item.body).toContain(signature);
      expect(item.figure).toBeUndefined();
    }
    const first = WidgetSpec.parse(step("smg1-02-02", "i1").widget);
    const challenge = WidgetSpec.parse(step("smg1-02-02", "ch1").widget);
    expect(first.type).toBe("numeric");
    expect(challenge.type).toBe("numeric");
    if (first.type !== "numeric" || challenge.type !== "numeric") throw new Error("fourths checks must be numeric");
    expect(step("smg1-02-02", "ch1").body).toBe("Build the whole.");
    expect(challenge.prompt).toBe("A whole has 4 equal parts. How many fourths make the whole?");
    expect(challenge.prompt).not.toBe(first.prompt);
    expect(challenge.answer).toBe(4);
    expect(challenge.tolerance).toBe(0);
    expect(evaluate(challenge, challenge.answer).correct).toBe(true);
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
