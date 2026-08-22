import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "measure-convert", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

const expectedBindings: Record<string, string> = {
  "mc-02-01/c1": "mc-area-formula",
  "mc-02-01/c2": "dop-two-by-two",
  "mc-03-02/c1": "mc-protractor",
  "mc-03-02/c2": "mc-protractor",
  "mc-04-01/c1": "mc-additive",
  "mc-04-01/c2": "mc-additive",
  "mc-04-02/c1": "g7-comp-supp",
  "mc-04-02/c2": "mc-missing-angle",
};
const p0Placements = new Set([
  "mc-02-01/c1", "mc-02-01/c2",
  "mc-03-02/c1", "mc-03-02/c2",
  "mc-04-01/c1", "mc-04-01/c2",
  "mc-04-02/c1",
]);

describe("S263 measure-convert bounded P0 repair", () => {
  it("keeps the complete 15-lesson course schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(15);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("measure-convert");
      expect(raw.steps.map((candidate) => candidate.id)).toEqual(["c1", "i1", "k1", "c2", "k2", "i2", "k3", "ch1", "r1"]);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders all seven P0 replacements and the adjacent truth repair with accessible semantic parity", () => {
    expect(p0Placements.size).toBe(7);
    expect(Object.keys(expectedBindings)).toHaveLength(8);
    for (const [placement, figureId] of Object.entries(expectedBindings)) {
      const [lessonId, stepId] = placement.split("/");
      const concept = step(lessonId!, stepId!);
      expect(concept.figure, placement).toBe(figureId);
      expect(concept.body, placement).toBe(concept.narration);
      expect(isFigureTextAligned(figureId, `${concept.body ?? ""} ${concept.narration ?? ""}`), placement).toBe(true);
      const Figure = FIGURES[figureId];
      expect(Figure, `${placement}/${figureId}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup, placement).toContain("<title>");
      expect(markup, placement).toContain('role="img"');
    }
  });

  it("removes every known fixed-number contradiction rather than suppressing it", () => {
    expect(step("mc-02-01", "c1").body).toMatch(/5 × 3 = 15/);
    expect(step("mc-02-01", "c2").body).toMatch(/23 × 45/);
    expect(step("mc-03-02", "c1").body).toMatch(/0° to 180°/);
    expect(step("mc-04-01", "c1").body).toMatch(/30° next to 40°.*70°/);
    expect(step("mc-04-01", "c2").body).toMatch(/30° \+ 40° = 70°/);
    expect(step("mc-04-02", "c1").body).toMatch(/180° straight line/);
    expect(step("mc-04-02", "c2").body).toMatch(/90° − 55° = 35°/);
    const affectedConcepts = ["mc-02-01", "mc-03-02", "mc-04-01", "mc-04-02"]
      .flatMap((id) => [step(id, "c1").body, step(id, "c2").body]).join("\n");
    expect(affectedConcepts).not.toMatch(/8×6=48|23×14|30°\+60°|25°\+35°|180−110|90−35=\*\*55/i);
  });

  it("preserves authored evaluator correctness and feedback across the whole course", () => {
    for (const lesson of lessons) for (const candidate of lesson.steps) {
      if (!candidate.widget) continue;
      const widget = WidgetSpec.parse(candidate.widget);
      if (widget.type === "mcq") {
        expect(widget.options.filter((choice) => choice.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
        for (const choice of widget.options) {
          const result = evaluate(widget, choice.id);
          expect(result.correct, `${lesson.id}/${candidate.id}/${choice.id}`).toBe(choice.correct);
          expect(result.feedback, `${lesson.id}/${candidate.id}/${choice.id}`).toBe(choice.feedback);
        }
      }
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${candidate.id}`).toBe(true);
    }
  });

  it("seals seven source-compatible P0 closures with no P0 residual", () => {
    expect(p0Placements.size).toBe(7);
    expect([...p0Placements].every((placement) => expectedBindings[placement])).toBe(true);
  });
});
