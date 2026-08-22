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
const dir = join(process.cwd(), "content", "courses", "fraction-multiply-g4", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry)))];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const expectedFigures: Record<string, string[]> = {
  "g4x-01-01": [], "g4x-01-02": [], "g4x-01-03": [], "g4x-01-04": ["fm-groups", "fa-repeated-add"],
  "g4x-02-01": ["number-line-jumps", "frac-numline-pastone"], "g4x-02-02": [], "g4x-02-03": ["frac-numline-pastone"],
  "g4x-02-04": ["fa-improper-mixed"], "g4x-03-01": [], "g4x-03-02": ["fa-improper-mixed"],
  "g4x-03-03": ["fm-groups"], "g4x-03-04": ["fa-benchmark-half"],
};

describe("S255 fraction-multiply-g4 whole-course integrity", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) if (entry.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(entry.widget)), `${raw.id}/${entry.id}`).toEqual([]);
    }
  });

  it("renders the remaining registered accessible semantic figures after exact P0 fail-closure", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((entry) => entry.kind === "concept");
      expect(concepts.filter((entry) => entry.figure).map((entry) => entry.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts.filter((entry) => entry.figure)) {
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        count += 1;
      }
    }
    expect(count).toBe(9);
  });

  it("closes all 12 detector-defined progression collisions with distinct jobs and payloads", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompts`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized prompts`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payloads`).toBe(widgets.length);

    }
  });

  it("keeps evaluator targets, choices, and feedback contracts aligned", () => {
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
        expect(widget.tolerance).toBe(0);
        for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
      } else if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${entry.id}`).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      } else if (widget.type === "fractionBar") {
        expect(evaluate(widget, { n: widget.targetNum, d: widget.targetDen }).correct, `${lesson.id}/${entry.id}`).toBe(true);
      } else if (widget.type === "numberLinePlace") {
        expect(evaluate(widget, widget.target).correct, `${lesson.id}/${entry.id}`).toBe(true);
      } else if (widget.type === "estimateSlider") {
        const correct = widget.choices.find((choice) => choice.correct);
        expect(evaluate(widget, correct?.value ?? widget.target).correct, `${lesson.id}/${entry.id}`).toBe(true);
      }
    }
  });

  it("removes the audited false target, domain, and singular-language defects", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/target half|shorter than half|longer than half|denominator never changes|just under seven|little less than 7|\b1 pieces\b|\b1 fourths\b/i);
    expect(text).not.toContain('"figure":"count-on-hops"');
    expect(text).toContain("requested unsimplified form");
    expect(text).toContain("Group the pieces into denominator-sized wholes");
    expect(text).toContain("Divide the numerator and denominator by the stated common factor");
    expect(text).toContain("5 5/6, just under six");
  });
});
