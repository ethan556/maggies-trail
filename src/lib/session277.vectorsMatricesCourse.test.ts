import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept: Step; check: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/vectors-matrices/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/vectors-matrices/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const expectedSteps = ["c1", "i1", "k1", "c2", "k2", "k3", "ch1", "r1"];
const widgetTypes = ["matrixTransform", "mcq", "mcq", "exactNumberLab", "exactNumberLab", "mcq"];
const lesson = JSON.parse(fs.readFileSync(path.join(dir, "vec-05-02.json"), "utf8")) as Lesson;

describe("S277 Vectors & Matrices source implementation", () => {
  it("preserves the fifteen-lesson manifest, target IDs, remedial, and evaluator surfaces", () => {
    expect(lessonIds).toEqual([
      "vec-01-01", "vec-01-02", "vec-01-03",
      "vec-02-01", "vec-02-02", "vec-02-03",
      "vec-03-01", "vec-03-02", "vec-03-03",
      "vec-04-01", "vec-04-02", "vec-04-03",
      "vec-05-01", "vec-05-02", "vec-05-03",
    ]);
    expect(lesson.id).toBe("vec-05-02");
    expect(lesson.steps.map((item) => item.id)).toEqual(expectedSteps);
    expect(lesson.remedials).toHaveLength(1);
    expect(lesson.remedials?.[0]?.concept.id).toBe("rem-vec0502-c");
    expect(lesson.remedials?.[0]?.check.id).toBe("rem-vec0502-k");
    const observedTypes = [...lesson.steps, lesson.remedials![0]!.check]
      .flatMap((item) => item.widget ? [WidgetSpec.parse(item.widget).type] : []);
    expect(observedTypes).toEqual(widgetTypes);
  });

  it("fail-closes the withheld fixed 90-degree vector example while preserving the general rotation contract", () => {
    const item = lesson.steps.find((candidate) => candidate.id === "c1");
    if (!item) throw new Error("missing vec-05-02:c1");
    expect(item.body).toContain("[[cos θ, −sin θ], [sin θ, cos θ]]");
    expect(item.body).toContain("⟨1, 0⟩ → ⟨cos θ, sin θ⟩");
    expect(item.figure).toBeUndefined();
  });

  it("keeps every retained figure registered and every evaluator schema-valid with numeric and choice truth intact", () => {
    for (const item of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])]) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure), `vec-05-02:${item.id} figure`).toBe(true);
      if (!item.widget) continue;
      const widget = WidgetSpec.parse(item.widget);
      expect(widgetIntegrityErrors(widget), `vec-05-02:${item.id}`).toEqual([]);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `vec-05-02:${item.id}`).toBe(true);
      if (widget.type === "mcq") {
        const correct = widget.options.filter((option) => option.correct);
        expect(correct, `vec-05-02:${item.id} choices`).toHaveLength(1);
        expect(evaluate(widget, correct[0]!.id).correct, `vec-05-02:${item.id}`).toBe(true);
      }
    }
  });
});
