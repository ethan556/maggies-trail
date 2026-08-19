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
const dir = join(process.cwd(), "content", "courses", "multistep-g4", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?[\d,]+(?:[./]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const expectedBindings: Record<string, string> = {
  "g4s-01-01/c1": "mb-multistep", "g4s-01-01/c2": "g3w-subtract-once",
  "g4s-01-02/c1": "two-step-bar", "g4s-01-02/c2": "dop-word-expr",
  "g4s-01-03/c1": "mb-times-compare", "g4s-01-03/c2": "mb-more-vs-times",
  "g4s-02-01/c1": "mb-remainder", "g4s-02-01/c2": "dop-remainder",
  "g4s-02-02/c1": "ee-variable", "g4s-02-02/c2": "ee-mult-div-solve",
  "g4s-02-03/c1": "mult3-estimate", "g4s-02-03/c2": "mult3-estimate",
  "g4s-03-01/c1": "mult3-estimate", "g4s-03-01/c2": "mult3-estimate",
  "g4s-03-02/c1": "mb-multistep", "g4s-03-02/c2": "two-step-bar",
};

const progressionPlacements: Record<string, string[]> = {
  "g4s-01-01": ["i2"],
  "g4s-01-02": ["i2"],
  "g4s-01-03": ["i2"],
  "g4s-02-01": ["i2", "ch1"],
  "g4s-02-02": ["i2", "k3"],
  "g4s-02-03": ["i2", "k3"],
  "g4s-03-01": ["i2"],
  "g4s-03-02": ["i2"],
};

describe("S263 multistep-g4 bounded P0 repair", () => {
  it("keeps all eight lessons schema-valid, pedagogy-clean, widget-integral, and stable-shaped", () => {
    expect(lessons).toHaveLength(8);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("multistep-g4");
      expect(raw.steps.map((candidate) => candidate.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders all 16 P0 placements as synchronized, accessible semantic figures", () => {
    expect(Object.keys(expectedBindings)).toHaveLength(16);
    for (const [placement, figureId] of Object.entries(expectedBindings)) {
      const [lessonId, stepId] = placement.split("/");
      const concept = step(lessonId!, stepId!);
      expect(concept.figure, placement).toBe(figureId);
      expect(concept.figure, placement).not.toBe("count-on-hops");
      expect(concept.body, placement).toBe(concept.narration);
      expect(isFigureTextAligned(figureId, `${concept.body ?? ""} ${concept.narration ?? ""}`), placement).toBe(true);
      const Figure = FIGURES[figureId];
      expect(Figure, `${placement}/${figureId}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup, placement).toContain("<title>");
      expect(markup, placement).toContain('role="img"');
    }
    for (const lesson of lessons) {
      expect(lesson.steps.filter((candidate) => candidate.kind === "concept").map((candidate) => candidate.figure), lesson.id).not.toContain("count-on-hops");
      const remedialConcept = lesson.remedials?.[0]?.concept;
      if (remedialConcept) {
        expect(remedialConcept.figure, `${lesson.id}/remedial`).toBe(step(lesson.id, "c2").figure);
        expect(remedialConcept.body, `${lesson.id}/remedial`).toBe(step(lesson.id, "c2").body);
      }
    }
  });

  it("closes all eight progression causes, including the two extra normalized collisions", () => {
    expect(Object.keys(progressionPlacements)).toHaveLength(8);
    for (const [lessonId, repairedIds] of Object.entries(progressionPlacements)) {
      const widgets = byId[lessonId]!.steps.filter((candidate) => candidate.widget).map((candidate) => ({
        id: candidate.id,
        widget: WidgetSpec.parse(candidate.widget),
      }));
      for (const repairedId of repairedIds) {
        const repaired = widgets.find((candidate) => candidate.id === repairedId)!;
        const peers = widgets.filter((candidate) => candidate.id !== repairedId);
        expect(peers.map((candidate) => candidate.widget.prompt), `${lessonId}/${repairedId} exact`).not.toContain(repaired.widget.prompt);
        expect(peers.map((candidate) => normalized(candidate.widget.prompt)), `${lessonId}/${repairedId} normalized`).not.toContain(normalized(repaired.widget.prompt));
        expect(peers.map((candidate) => JSON.stringify(candidate.widget)), `${lessonId}/${repairedId} payload`).not.toContain(JSON.stringify(repaired.widget));
      }
    }
    expect((step("g4s-02-01", "ch1").widget as { prompt: string }).prompt).toMatch(/vans are needed/i);
    expect((step("g4s-02-02", "k3").widget as { prompt: string }).prompt).toMatch(/6 × n = 42/i);
    expect((step("g4s-02-03", "k3").widget as { prompt: string }).prompt).toMatch(/3,860/i);
  });

  it("preserves evaluator types, stable correct IDs, and diagnostic feedback", () => {
    for (const lesson of lessons) for (const candidate of lesson.steps) {
      if (!candidate.widget) continue;
      const widget = WidgetSpec.parse(candidate.widget);
      if (widget.type === "mcq") {
        expect(widget.options.filter((choice) => choice.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
        expect(widget.options[0]?.correct, `${lesson.id}/${candidate.id}/correct-id`).toBe(true);
        for (const choice of widget.options) {
          const result = evaluate(widget, choice.id);
          expect(result.correct, `${lesson.id}/${candidate.id}/${choice.id}`).toBe(choice.correct);
          expect(result.feedback, `${lesson.id}/${candidate.id}/${choice.id}`).toBe(choice.feedback);
        }
      }
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${candidate.id}`).toBe(true);
    }
    expect((step("g4s-01-01", "i2").widget as { type: string }).type).toBe("barBuilder");
    expect((step("g4s-01-02", "i2").widget as { type: string }).type).toBe("estimateSlider");
    expect((step("g4s-02-01", "i2").widget as { type: string }).type).toBe("numberLineHop");
    expect((step("g4s-02-02", "i2").widget as { type: string }).type).toBe("areaModel");
  });

  it("removes the learner-visible place-value overclaim and seals all 24 P0 closures", () => {
    const corpus = JSON.stringify(lessons);
    expect(corpus).not.toMatch(/misplaced digit, which is wrong by a factor of ten/i);
    expect(step("g4s-02-03", "c2").body).toMatch(/much larger place-value range/i);
    expect(Object.keys(expectedBindings).length + Object.keys(progressionPlacements).length).toBe(24);
  });
});
