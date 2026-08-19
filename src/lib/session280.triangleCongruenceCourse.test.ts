import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/triangle-congruence/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/triangle-congruence/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const labels = new Map<string, string[]>([
  ["tc-01-02:i2", ["They are similar, not necessarily congruent", "They are congruent, not merely similar", "They have the same side lengths", "No relationship follows from equal angles"]],
  ["tc-01-03:ch", ["SAS: sides with their included angle", "SSS: three equal side pairs", "ASA: angles with included side", "AAS: angles with nonincluded side"]],
  ["tc-01-03:i2", ["ASA: angles with their included side", "SSS: three equal side pairs", "SAS: two equal sides and an angle", "SSA: two equal sides and an angle"]],
  ["tc-02-01:i2", ["SAS: legs with their included angle", "ASA: two angles and one side", "SSS: three equal side pairs", "AAA: three equal angle pairs"]],
  ["tc-02-02:ch", ["Prove triangles congruent, then use CPCTC", "Measure the target segments in the figure", "Assume the target segments are equal first", "Show the target segments are parallel first"]],
  ["tc-02-03:i3", ["Which triangles contain the target angles?", "What are the target angle measures?", "Are the target angles acute or obtuse?", "How large is the whole diagram?"]],
  ["tc-02-03:k2", ["A CPCTC result supplies the next proof", "The second proof ignores the first proof", "Both proofs use the same criterion", "The same pair of triangles is reused"]],
  ["tc-03-02:i1", ["Equal base angles imply equal legs", "Unequal base angles imply unequal legs", "Equal legs imply equal base angles", "All three triangle angles are equal"]],
  ["tc-05-02:k1", ["A wider included angle separates the endpoints", "The two fixed sides become longer", "The triangle keeps the same area", "The third side is always longest"]],
  ["tc-05-03:i1", ["Angle A, opposite side a = 10", "Angle B, opposite side b = 7", "Angle C, opposite side c = 5", "All three angles are equal"]],
  ["tc-05-03:i3", ["The larger angle faces the longer side", "Use the hinge theorem between two triangles", "Use SAS congruence to compare lengths", "Use the midsegment theorem to compare sides"]],
]);
const lessons = new Map(lessonIds.map((lessonId) => [
  lessonId,
  JSON.parse(fs.readFileSync(path.join(dir, `${lessonId}.json`), "utf8")) as Lesson,
]));

function step(key: string): Step {
  const [lessonId, stepId] = key.split(":");
  if (!lessonId || !stepId) throw new Error(`malformed target ${key}`);
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`missing lesson ${lessonId}`);
  const item = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!item) throw new Error(`missing step ${key}`);
  return item;
}

describe("S280 Triangle Congruence source implementation", () => {
  it("preserves the fifteen-lesson manifest and all eleven stable target IDs", () => {
    expect(lessonIds).toEqual([
      "tc-01-01", "tc-01-02", "tc-01-03", "tc-02-01", "tc-02-02", "tc-02-03", "tc-03-01", "tc-03-02", "tc-03-03",
      "tc-04-01", "tc-04-02", "tc-04-03", "tc-05-01", "tc-05-02", "tc-05-03",
    ]);
    expect(new Set(lessonIds).size).toBe(15);
    expect(labels.size).toBe(11);
    for (const key of labels.keys()) expect(step(key).id).toBe(key.split(":")[1]);
  });

  it("keeps each choice concise, parallel, distinct, and evaluator-true without explanation text", () => {
    for (const [key, expected] of labels) {
      const item = step(key);
      const widget = WidgetSpec.parse(item.widget);
      expect(widget.type, `${key} type`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error(`${key} must stay an mcq`);
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]);
      expect(widget.options.map((option) => option.label)).toEqual(expected);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]);
      expect(new Set(expected.map((label) => label.toLowerCase())).size, `${key} distinct labels`).toBe(4);
      expect(expected.some((label) => /—|\bbecause\b|\bsince\b|\btherefore\b/i.test(label)), `${key} rationale leak`).toBe(false);
      const sizes = expected.map((label) => label.length);
      expect(Math.max(...sizes) - Math.min(...sizes), `${key} label parity`).toBeLessThanOrEqual(14);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${key}/${option.id}`).toBe(option.correct);
    }
  });

  it("preserves all registered figures and whole-course widget integrity", () => {
    let widgets = 0;
    for (const [lessonId, lesson] of lessons) {
      const items = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])];
      for (const item of items) {
        if (!item) continue;
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
        widgets += 1;
      }
    }
    expect(widgets).toBeGreaterThan(90);
  });
});
