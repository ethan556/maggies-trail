import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "teen-numbers-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];

const expectedFigures: Record<string, [string, string]> = {
  "knb-01-01": ["teen-ten-and-more", "nwk-teen-count-on"],
  "knb-01-02": ["nwk-teen-ten-four", "teen-ten-and-more"],
  "knb-01-03": ["kc-teen-14", "nwk-teen-ten-four"],
  "knb-01-04": ["c120-teen-13", "nwk-teens-pattern"],
  "knb-02-01": ["kc-teen-14", "nwk-teens-pattern"],
  "knb-02-02": ["kc-to-20", "nwk-teens-pattern"],
  "knb-02-03": ["nwk-teen-ten-four", "tno-ten-is-ten"],
  "knb-02-04": ["nwk-teen-ten-four", "teen-ten-and-more"],
  "knb-03-01": ["nwk-teen-ten-four", "kc-teen-14"],
  "knb-03-02": ["kc-to-20", "nwk-teen-count-on"],
  "knb-03-03": ["nwk-teen-ten-four", "kc-teen-14"],
  "knb-03-04": ["teen-ten-and-more", "nwk-teens-pattern"],
};

describe("S253 teen-numbers-k whole-course repair", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("renders all 24 synchronized semantic teen-number concept placements", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        expect(concept.figure).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        count += 1;
      }
    }
    expect(count).toBe(24);
  });

  it("eliminates exact, payload, and number-normalized progression collisions", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
    }
  });

  it("keeps teen decompositions and the repaired choice surface truthful", () => {
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type === "tenFrame") {
        expect(evaluate(widget, widget.target).correct, `${lesson.id}/${step.id}`).toBe(true);
        expect(widget.successFeedback).toMatch(/ten|built|frame|correct|teen/i);
      }
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
        if (`${lesson.id}/${step.id}` === "knb-01-02/k2") {
          const lengths = widget.options.map((option) => option.label.length);
          expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(12);
        }
      }
    }
  });
});
