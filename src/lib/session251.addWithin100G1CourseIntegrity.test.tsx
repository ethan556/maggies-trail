import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: unknown;
};

type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const lessonDir = join(process.cwd(), "content", "courses", "add-within-100-g1", "lessons");
const lessons = readdirSync(lessonDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(lessonDir, name), "utf8")) as RawLesson);

const normalizedPrompt = (prompt: string) =>
  prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const allSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter((step): step is RawStep => Boolean(step)),
  ),
];

describe("S251 add-within-100-g1 whole-course repair", () => {
  it("keeps the 14-lesson course schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("add-within-100-g1");
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("replaces all 28 fixed-example placeholders with registered accessible semantic figures", () => {
    const figureIds: string[] = [];
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      expect(concepts[0].figure, `${lesson.id}: repeated concept figure`).not.toBe(concepts[1].figure);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, concept.figure).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup, concept.figure).toContain("<title>");
        expect(markup, concept.figure).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        figureIds.push(concept.figure!);
      }
    }
    expect(figureIds).toHaveLength(28);
    expect(new Set(figureIds).size).toBeGreaterThanOrEqual(20);
  });

  it("closes every copied interaction and number-normalized same-sitting prompt", () => {
    for (const lesson of lessons) {
      const widgetSteps = lesson.steps.filter((step) => step.widget);
      const prompts = widgetSteps.map((step) => WidgetSpec.parse(step.widget).prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompt collision`).toBe(prompts.length);
      expect(new Set(prompts.map(normalizedPrompt)).size, `${lesson.id}: normalized prompt collision`).toBe(prompts.length);

      const i1 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i1")!.widget);
      const i2 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i2")!.widget);
      expect(`${i2.type}:${i2.prompt}`, lesson.id).not.toBe(`${i1.type}:${i1.prompt}`);
      expect(i2.type, lesson.id).toBe("tapDiagram");
    }
  });

  it("keeps every authored response evaluator-true and its feedback readable", () => {
    for (const lesson of lessons) {
      for (const step of allSteps(lesson)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type === "numeric") {
          expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
          expect(widget.successFeedback, `${lesson.id}/${step.id}`).toMatch(/^Correct — .+\.$/);
          expect(widget.successFeedback).not.toMatch(/\?\s*\d/);
          expect(widget.fallbackFeedback).not.toBe("Recompute the quantities and relationship shown, one step at a time.");
        }
        if (widget.type === "mcq") {
          expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
          for (const option of widget.options) {
            const result = evaluate(widget, option.id);
            expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
            expect(result.feedback).toBe(option.feedback);
          }
        }
        if (widget.type === "tapDiagram") {
          expect(widget.hotspots.filter((hotspot) => hotspot.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
          for (const hotspot of widget.hotspots) {
            const result = evaluate(widget, [hotspot.id]);
            expect(result.correct, `${lesson.id}/${step.id}/${hotspot.id}`).toBe(hotspot.correct);
          }
        }
      }
    }
  });
});
