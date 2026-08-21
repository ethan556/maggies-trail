import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/limits-continuity/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/limits-continuity/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const labels = new Map<string, string[]>([
  // lc-01-03:k1 distractors lengthened by S327 (reports/closure/S327_FIX_CH2.md #18, CHOICE-0043)
  // to close a length-prose-vs-prose leak (27-char distractor vs 41-char correct answer).
  ["lc-01-03:k1", ["does not exist; values grow without bound", "approaches 0; the values shrink toward it", "approaches 1; the values settle near it"]],
  ["lc-03-01:ch1", ["does not exist; sides approach 1 and 3", "approaches 2; average of 1 and 3", "approaches 1; the left-side value"]],
  ["lc-03-01:k2", ["does not exist; sides approach 3 and 4", "approaches 3.5; the two values averaged", "approaches 4; the right-side value"]],
  ["lc-03-03:ch1", ["grows to +∞; numerator degree is larger", "approaches 1/2; degrees are equal", "approaches 0; denominator degree is larger"]],
  ["lc-03-03:k1", ["leading terms 7x³ and x³ determine the limit", "constant terms determine the limit at infinity", "middle terms determine the limit at infinity"]],
  ["lc-03-03:k2", ["grows to −∞; numerator degree is larger", "grows to +∞; numerator degree is larger", "approaches −2; the degrees are equal"]],
  ["lc-03-03:k3", ["approaches 0; denominator degree is larger", "approaches 3; the degrees are equal", "grows to +∞; numerator degree is larger"]],
  ["lc-04-01:k3", ["f(a) is defined, limit exists, and they agree", "f(a) is defined, regardless of the limit", "limit exists, regardless of f(a)"]],
  ["lc-04-02:k3", ["infinite; a vertical asymptote at x = 0", "removable; a hole at x = 0", "jump; two finite sides at x = 0"]],
  ["lc-04-03:k3", ["A jump can skip an intermediate value", "Only continuous functions can have roots", "Continuity makes every function increase"]],
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

describe("S281 Limits and Continuity source implementation", () => {
  it("preserves the fifteen-lesson manifest and all ten stable target IDs", () => {
    expect(lessonIds).toEqual([
      "lc-01-01", "lc-01-02", "lc-01-03", "lc-02-01", "lc-02-02", "lc-02-03", "lc-03-01", "lc-03-02", "lc-03-03",
      "lc-04-01", "lc-04-02", "lc-04-03", "lc-05-01", "lc-05-02", "lc-05-03",
    ]);
    expect(new Set(lessonIds).size).toBe(15);
    expect(labels.size).toBe(10);
    for (const key of labels.keys()) expect(step(key).id).toBe(key.split(":")[1]);
  });

  it("keeps each choice concise, parallel, distinct, and evaluator-true without rationale leakage", () => {
    for (const [key, expected] of labels) {
      const item = step(key);
      const widget = WidgetSpec.parse(item.widget);
      expect(widget.type, `${key} type`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error(`${key} must stay an mcq`);
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3"]);
      expect(widget.options.map((option) => option.label)).toEqual(expected);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]);
      expect(new Set(expected.map((label) => label.toLowerCase())).size, `${key} distinct labels`).toBe(3);
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
    expect(widgets).toBe(90);
  });
});
