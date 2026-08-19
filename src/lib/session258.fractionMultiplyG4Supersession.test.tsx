import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown; variant?: { form?: string } };
type RawLesson = { id: string; steps: RawStep[]; remedials: Array<{ concept: RawStep; check: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "fraction-multiply-g4", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const specializedVisualPlacements = new Set([
  "g4x-01-03/c1", "g4x-02-01/c2", "g4x-02-02/c1", "g4x-02-02/c2", "g4x-02-03/c2", "g4x-02-04/c1",
  "g4x-02-04/c2", "g4x-03-02/c1", "g4x-03-03/c1", "g4x-03-04/c1", "g4x-03-04/c2",
]);
const literalContractPlacements = new Set([
  "g4x-01-01/ch1", "g4x-01-02/k2", "g4x-01-02/ch1", "g4x-01-03/k2", "g4x-01-03/ch1", "g4x-01-04/k3",
  "g4x-02-01/k2", "g4x-02-01/ch1", "g4x-02-02/k2", "g4x-02-03/k2", "g4x-02-03/ch1", "g4x-03-01/k3",
  "g4x-03-03/k2", "g4x-03-04/k2",
]);

function expectEvaluatorTruth(lessonId: string, entry: RawStep) {
  if (!entry.widget) return;
  const widget = WidgetSpec.parse(entry.widget);
  expect(widgetIntegrityErrors(widget), `${lessonId}/${entry.id}`).toEqual([]);
  if (widget.type === "numeric") {
    expect(evaluate(widget, widget.answer).correct, `${lessonId}/${entry.id}`).toBe(true);
    for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
  } else if (widget.type === "mcq") {
    expect(widget.options.filter((choice) => choice.correct), `${lessonId}/${entry.id}`).toHaveLength(1);
    for (const choice of widget.options) expect(evaluate(widget, choice.id).correct).toBe(choice.correct);
  } else if (widget.type === "fractionBar") {
    expect(evaluate(widget, { n: widget.targetNum, d: widget.targetDen }).correct).toBe(true);
  } else if (widget.type === "numberLinePlace") {
    expect(evaluate(widget, widget.target).correct).toBe(true);
  } else if (widget.type === "estimateSlider") {
    const correct = widget.choices.find((choice) => choice.correct);
    expect(evaluate(widget, correct?.value ?? widget.target).correct).toBe(true);
  }
}

describe("S258 fraction-multiply-g4 supersession", () => {
  it("keeps all twelve lessons schema-valid, pedagogy-clean, and evaluator-aligned", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const entry of [...raw.steps, ...raw.remedials.flatMap((route) => [route.concept, route.check])]) expectEvaluatorTruth(raw.id, entry);
    }
  });

  it("restores all fourteen faWholeTimesFractionNumeric literal contracts", () => {
    const affected = lessons.flatMap((lesson) => lesson.steps.map((entry) => ({ lesson, entry })))
      .filter(({ lesson, entry }) => literalContractPlacements.has(`${lesson.id}/${entry.id}`));
    expect(affected).toHaveLength(14);
    for (const { lesson, entry } of affected) {
      const widget = WidgetSpec.parse(entry.widget);
      expect(widget.type).toBe("numeric");
      if (widget.type !== "numeric") continue;
      const match = widget.prompt.match(/^Compute (\d+) × (\d+)\/(\d+)/);
      expect(match, `${lesson.id}/${entry.id}`).toBeTruthy();
      expect(Number(match?.[1]) * Number(match?.[2])).toBe(widget.answer);
    }
  });

  it("explicitly synchronizes the eleven audited another-example visual placements", () => {
    let count = 0;
    for (const lesson of lessons) for (const entry of lesson.steps) {
      if (!specializedVisualPlacements.has(`${lesson.id}/${entry.id}`)) continue;
      expect(entry.body, `${lesson.id}/${entry.id}`).toMatch(/The figure shows (?:another|the same|the inverse)/);
      expect(entry.narration).toBe(entry.body);
      count += 1;
    }
    expect(count).toBe(11);
  });

  it("gives every remedial route an accessible registered visual and a distinct transfer check", () => {
    let figures = 0;
    let transfers = 0;
    for (const lesson of lessons) {
      expect(lesson.remedials).toHaveLength(1);
      const route = lesson.remedials[0];
      expect(route.concept.figure, lesson.id).toBeTruthy();
      const Figure = FIGURES[route.concept.figure!];
      expect(Figure, `${lesson.id}/${route.concept.id}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(route.concept.narration).toBe(route.concept.body);
      expect(route.concept.body).toMatch(/The figure (?:shows|identifies|stacks|regroups|groups|separates|benchmarks)/);
      const retry = WidgetSpec.parse(route.check.widget);
      const main = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      expect(main.map((widget) => widget.prompt)).not.toContain(retry.prompt);
      expect(main.map((widget) => normalized(widget.prompt))).not.toContain(normalized(retry.prompt));
      expect(main.map((widget) => JSON.stringify(widget))).not.toContain(JSON.stringify(retry));
      figures += 1;
      transfers += 1;
    }
    expect(figures).toBe(12);
    expect(transfers).toBe(12);
  });
});
