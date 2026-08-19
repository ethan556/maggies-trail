import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown; variant?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "fractions-deeper-g3", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];

const expectedFigures: Record<string, [string, string]> = {
  "g3f-01-01": ["frac-equal-vs-unequal", "frac-equal-vs-unequal"],
  "g3f-01-02": ["frac-unit-fourth", "thirds-compare"],
  "g3f-01-03": ["frac-three-fourths", "frac-top-bottom"],
  "g3f-01-04": ["fm-fraction-of", "fm-fraction-of"],
  "g3f-01-05": ["frac-numline-fourths", "mc-ruler-eighths"],
  "g3f-02-01": ["frac-numline-fourths", "frac-numline-unit"],
  "g3f-02-02": ["thirds-compare", "thirds-compare"],
  "g3f-02-03": ["frac-equiv-half", "fa-multiplier"],
  "g3f-02-04": ["frac-equiv-numline", "frac-equiv-numline"],
  "g3f-02-05": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-01": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-02": ["frac-compare-wholes", "frac-compare-same-denom"],
  "g3f-03-03": ["frac-compare-same-denom", "frac-compare-same-numer"],
  "g3f-03-04": ["frac-top-bottom", "frac-top-bottom"],
};

describe("S252 fractions-deeper-g3 whole-course repair", () => {
  it("keeps all 14 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
    }
  });

  it("renders 28 synchronized semantic concept placements with no withheld generic exemplar", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        count += 1;
      }
    }
    expect(count).toBe(28);
  });

  it("eliminates all 14 exact, widget-payload, and number-normalized progression collisions", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
      const i1 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i1")!.widget);
      const i2Step = lesson.steps.find((step) => step.id === "i2")!;
      const i2 = WidgetSpec.parse(i2Step.widget);
      expect(i2Step.body).toBe("Repair the misconception.");
      expect(i2.prompt).not.toBe(i1.prompt);
      expect(i2.type).toBe(i1.type);
    }
  });

  it("removes false half-target feedback while retaining evaluator and option truth", () => {
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      const serialized = JSON.stringify(widget);
      expect(serialized, `${lesson.id}/${step.id}`).not.toMatch(/target half|longer than half|shorter than half/i);
      if (widget.type === "fractionBar") {
        expect(widget.lowFeedback).toContain(`${widget.targetNum}/${widget.targetDen}`);
        expect(widget.highFeedback).toContain(`${widget.targetNum}/${widget.targetDen}`);
        expect(evaluate(widget, { n: widget.targetNum, d: widget.targetDen }).correct, `${lesson.id}/${step.id}`).toBe(true);
      }
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      }
    }
  });
});
