import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "properties-strategies-g1", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];

describe("S251 properties-strategies-g1 whole-course repair", () => {
  it("keeps all 14 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("properties-strategies-g1");
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) {
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("replaces all 28 placeholders with distinct registered accessible semantic figures", () => {
    const ids: string[] = [];
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts).toHaveLength(2);
      expect(concepts[0].figure, lesson.id).not.toBe(concepts[1].figure);
      for (const concept of concepts) {
        expect(concept.figure).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, concept.figure).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        ids.push(concept.figure!);
      }
    }
    expect(ids).toHaveLength(28);
    expect(new Set(ids).size).toBeGreaterThanOrEqual(20);
  });

  it("closes every copied interaction and normalized same-sitting prompt", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      const first = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i1")!.widget);
      const second = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i2")!.widget);
      expect(`${second.type}:${second.prompt}`).not.toBe(`${first.type}:${first.prompt}`);
      expect(second.type).toBe("tapDiagram");
    }
  });

  it("keeps every authored response evaluator-true with readable feedback", () => {
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
        expect(widget.successFeedback).toMatch(/^Correct — .+\.$/);
        expect(widget.successFeedback).not.toMatch(/\?\s*\d/);
      }
      if (widget.type === "mcq") for (const option of widget.options) {
        const result = evaluate(widget, option.id);
        expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
        expect(result.feedback).toBe(option.feedback);
      }
      if (widget.type === "tapDiagram") for (const hotspot of widget.hotspots) {
        expect(evaluate(widget, [hotspot.id]).correct, `${lesson.id}/${step.id}/${hotspot.id}`).toBe(hotspot.correct);
      }
    }
  });
});
