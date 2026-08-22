import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/polygons-quadrilaterals/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/polygons-quadrilaterals/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = ["c1", "k1", "k2", "c2", "k3", "i1", "i2", "ch", "r1"];
const widgetTypes = ["exactNumberLab", "numeric", "exactNumberLab", "mcq", "numeric", "numeric", "numeric"];
const lesson = JSON.parse(fs.readFileSync(path.join(dir, "pq-01-03.json"), "utf8")) as Lesson;

describe("S276 Polygons & Quadrilaterals source implementation", () => {
  it("preserves the fifteen-lesson manifest, target IDs, remedial, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([
      "pq-01-01", "pq-01-02", "pq-01-03",
      "pq-02-01", "pq-02-02", "pq-02-03",
      "pq-03-01", "pq-03-02", "pq-03-03",
      "pq-04-01", "pq-04-02", "pq-04-03",
      "pq-05-01", "pq-05-02", "pq-05-03",
    ]);
    expect(lesson.id).toBe("pq-01-03");
    expect(lesson.steps.map((item) => item.id)).toEqual(expectedSteps);
    expect(lesson.remedials).toHaveLength(1);
    expect(lesson.remedials?.[0]?.concept.id).toBe("rem-pq-regular-angles-c");
    expect(lesson.remedials?.[0]?.check.id).toBe("rem-pq-regular-angles-k");
    const observedTypes = [...lesson.steps, lesson.remedials![0]!.check]
      .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
    expect(observedTypes).toEqual(widgetTypes);
  });

  it("fail-closes the withheld generic exterior-angle figure while preserving the exact source derivation", () => {
    const item = lesson.steps.find((candidate) => candidate.id === "c2");
    if (!item) throw new Error("missing pq-01-03:c2");
    expect(item.body).toContain("180 − 150 = 30°");
    expect(item.body).toContain("n = 360/30 = 12");
    expect(item.figure).toBeUndefined();
  });

  it("keeps every retained figure registered and every evaluator schema-valid with numeric and choice truth intact", () => {
    for (const item of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure), `pq-01-03:${item.id} figure`).toBe(true);
      if (!item.widget) continue;
      const widget = WidgetSpec.parse(item.widget);
      expect(widgetIntegrityErrors(widget), `pq-01-03:${item.id}`).toEqual([]);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `pq-01-03:${item.id}`).toBe(true);
      if (widget.type === "mcq") {
        const correct = widget.options.filter((option) => option.correct);
        expect(correct, `pq-01-03:${item.id} choices`).toHaveLength(1);
        expect(evaluate(widget, correct[0]!.id).correct, `pq-01-03:${item.id}`).toBe(true);
      }
    }
  });
});
