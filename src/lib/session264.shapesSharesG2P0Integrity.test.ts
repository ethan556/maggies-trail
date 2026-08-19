import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  widget?: Record<string, unknown>;
  variant?: unknown;
  explanationVariants?: string[];
};
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept: RawStep; check: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "shapes-shares-g2", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

const p0Rows = new Set([
  "EXCELLENCE-ssg2-03-03",
  "PROGRESSION-ssg2-01-01",
  "PROGRESSION-ssg2-01-02",
  "PROGRESSION-ssg2-01-03",
  "PROGRESSION-ssg2-03-02",
  "PROGRESSION-ssg2-03-03",
]);

describe("S264 shapes-shares-g2 bounded P0 repair", () => {
  it("keeps the complete nine-lesson course schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(9);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("shapes-shares-g2");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("gives ssg2-01-01 landmark, corner-inference, and neighboring-name jobs", () => {
    const landmark = step("ssg2-01-01", "i3");
    const corners = step("ssg2-01-01", "k3");
    const neighbor = step("ssg2-01-01", "ch1");
    expect(landmark.widget?.prompt).toMatch(/stop-sign outline/i);
    expect(corners.widget?.prompt).toMatch(/8 corners/i);
    expect(neighbor.widget?.prompt).toMatch(/one fewer side than an octagon/i);
    expect(neighbor.variant).toBeUndefined();
    expect(new Set([landmark.widget?.prompt, corners.widget?.prompt, neighbor.widget?.prompt]).size).toBe(3);
  });

  it("replaces direct repeats with composite, bounded, corrective, and reconstruction jobs", () => {
    const pyramid = step("ssg2-01-02", "ch1");
    expect(pyramid.body).toBe("Combine the two edge groups.");
    expect(pyramid.widget?.prompt).toMatch(/4 base edges and 4 sloping edges/i);
    expect(pyramid.widget?.answer).toBe(8);
    expect(pyramid.variant).toBeUndefined();

    const nextShape = step("ssg2-01-03", "i3");
    const bounded = step("ssg2-01-03", "k2");
    const correction = step("ssg2-01-03", "ch1");
    expect(nextShape.widget?.prompt).toMatch(/one more side than a pentagon/i);
    expect(bounded.widget?.prompt).toMatch(/more sides than a hexagon but fewer sides than an octagon/i);
    expect(correction.widget?.prompt).toMatch(/calls a 7-sided polygon an octagon.*fixes/i);
    expect(correction.variant).toBeUndefined();
    expect(new Set([nextShape.widget?.prompt, bounded.widget?.prompt, correction.widget?.prompt]).size).toBe(3);

    const thirds = step("ssg2-03-02", "k1");
    expect(thirds.body).toBe("Rebuild one whole from thirds.");
    expect(thirds.widget?.prompt).toMatch(/Three equal shares must rebuild the whole/i);
    expect(thirds.widget?.targetNum).toBe(1);
    expect(thirds.widget?.targetDen).toBe(3);
  });

  it("uses contextual fair-sharing and a novel goal-based challenge in ssg2-03-03", () => {
    const fairShare = step("ssg2-03-03", "k3");
    expect(fairShare.body).toBe("Compare fair shares in context.");
    expect(fairShare.widget?.prompt).toMatch(/shared among 3 children.*among 4.*smaller share/i);
    expect(fairShare.widget?.options).toEqual(expect.arrayContaining([expect.objectContaining({ id: "a", label: "a fourth", correct: true })]));

    const decision = step("ssg2-03-03", "ch1");
    expect(decision.body).toBe("Choose a share for a goal.");
    expect(decision.widget?.prompt).toMatch(/wants the bigger share/i);
    expect(decision.widget?.options).toEqual(expect.arrayContaining([expect.objectContaining({ id: "a", label: "one half", correct: true })]));
    expect(decision.variant).toBeUndefined();
  });

  it("preserves whole-course evaluator correctness and exact feedback", () => {
    for (const lesson of lessons) {
      const surfaces = [...lesson.steps, ...(lesson.remedials ?? []).map((route) => route.check)];
      for (const candidate of surfaces) {
        if (!candidate.widget) continue;
        const widget = WidgetSpec.parse(candidate.widget);
        if (widget.type === "mcq") {
          expect(widget.options.filter((option) => option.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
          for (const option of widget.options) {
            const result = evaluate(widget, option.id);
            expect(result.correct, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.correct);
            expect(result.feedback, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.feedback);
          }
        }
        if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${candidate.id}`).toBe(true);
      }
    }
  });

  it("seals all six source-compatible P0 rows with zero residuals", () => {
    expect(p0Rows.size).toBe(6);
  });
});
