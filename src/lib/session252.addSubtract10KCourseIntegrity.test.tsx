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
const dir = join(process.cwd(), "content", "courses", "add-subtract-10-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];

describe("S252 add-subtract-10-k whole-course repair", () => {
  it("keeps all 20 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(20);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
    }
  });

  it("renders all 40 concept placements and removes every remaining generic chapter-three binding", () => {
    let count = 0;
    for (const lesson of lessons) for (const concept of lesson.steps.filter((step) => step.kind === "concept")) {
      const Figure = FIGURES[concept.figure!];
      expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(concept.body).toBe(concept.narration);
      if (lesson.id.startsWith("koa-03-")) expect(concept.figure).not.toBe("count-on-hops");
      count += 1;
    }
    expect(count).toBe(40);
  });

  it("eliminates every exact and number-normalized same-sitting prompt collision", () => {
    for (const lesson of lessons) {
      const prompts = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget).prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
    }
  });

  it("keeps evaluator, response truth, and feedback aligned", () => {
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
        expect(widget.successFeedback).toMatch(/^Correct — .+\.$/);
      }
      if (widget.type === "mcq") for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      if (widget.type === "tapDiagram") for (const spot of widget.hotspots) expect(evaluate(widget, [spot.id]).correct, `${lesson.id}/${step.id}/${spot.id}`).toBe(spot.correct);
    }
  });
});
