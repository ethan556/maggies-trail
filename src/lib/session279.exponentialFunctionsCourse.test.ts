import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { exactNumberTruth, WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; body?: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };
type Course = { chapters: Array<{ lessonIds: string[] }> };

const dir = "content/courses/exponential-functions/lessons";
const course = JSON.parse(fs.readFileSync("content/courses/exponential-functions/course.json", "utf8")) as Course;
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((lessonId) => [
  lessonId,
  JSON.parse(fs.readFileSync(path.join(dir, `${lessonId}.json`), "utf8")) as Lesson,
]));

function lesson(lessonId: string): Lesson {
  const current = lessons.get(lessonId);
  if (!current) throw new Error(`missing lesson ${lessonId}`);
  return current;
}

function step(lessonId: string, stepId: string): Step {
  const current = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
  if (!current) throw new Error(`missing step ${lessonId}:${stepId}`);
  return current;
}

describe("S279 Exponential Functions source implementation", () => {
  it("preserves the twelve-lesson manifest, exact target identity, and remedial surfaces", () => {
    expect(lessonIds).toEqual([
      "exp-01-01", "exp-01-02", "exp-01-03", "exp-02-01", "exp-02-02", "exp-02-03",
      "exp-03-01", "exp-03-02", "exp-03-03", "exp-04-01", "exp-04-02", "exp-04-03",
    ]);
    expect(new Set(lessonIds).size).toBe(12);
    expect(lesson("exp-02-03").remedials).toHaveLength(1);
    expect(lesson("exp-02-03").remedials?.[0]?.concept?.id).toBe("rem-epct-c");
    expect(lesson("exp-02-03").remedials?.[0]?.check?.id).toBe("rem-epct-k");
    expect(lesson("exp-02-03").steps.map((item) => item.id)).toEqual([
      "c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1",
    ]);
  });

  it("retains only the exact generic decay-rate visual for the verified 80-to-40-to-20 source contract", () => {
    const target = step("exp-02-03", "c3");
    expect(target.body).toContain("Losing 50% from 80");
    expect(target.body).toContain("D(x) = 80 · (1/2)ˣ");
    expect(target.body).toContain("80, 40, 20");
    expect(target.figure).toBe("exp-decay-50");
    expect(FIGURE_IDS.has("exp-decay-50")).toBe(true);

    const figures = fs.readFileSync("src/components/figures.tsx", "utf8");
    const start = figures.indexOf("function ExpDecay50()");
    const end = figures.indexOf("function ExpMatch25()", start);
    if (start < 0 || end < 0) throw new Error("ExpDecay50 renderer was not found");
    const renderer = figures.slice(start, end);
    expect(renderer).toContain("losing 50% from 80 uses 80 times 0.5 to the x");
    expect(renderer).toContain("−50% → base 0.5");
  });

  it("keeps all course visuals registered and all learner-facing evaluator contracts schema-valid", () => {
    let widgets = 0;
    for (const [lessonId, current] of lessons) {
      const items = [...current.steps, ...(current.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])];
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
        if (widget.type === "exactNumberLab") expect(exactNumberTruth(widget).answerNumber, `${lessonId}:${item.id}`).toBeDefined();
        widgets += 1;
      }
    }
    expect(widgets).toBe(97);
  });
});
