import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; steps: RawStep[]; remedials: Array<{ concept: RawStep; check: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "equations-unknowns-g1", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const expectedFigures: Record<string, [string, string]> = {
  "g1e-01-01": ["as-equal-sign", "add-balance-scale"],
  "g1e-01-02": ["as-equal-sign", "add-balance-scale"],
  "g1e-01-03": ["add-balance-scale", "balance-unknown"],
  "g1e-01-04": ["add-balance-scale", "balance-unknown"],
  "g1e-01-05": ["add-balance-scale", "as-equal-sign"],
  "g1e-02-01": ["bar-join", "koa-join-two-groups"],
  "g1e-02-02": ["balance-unknown", "bar-part-whole"],
  "g1e-02-03": ["bar-part-whole", "as-part-whole"],
  "g1e-02-04": ["difference-gap", "fact-family"],
  "g1e-03-01": ["fact-family", "as-fact-family"],
  "g1e-03-02": ["balance-unknown", "as-unknown"],
  "g1e-03-03": ["as-equal-sign", "add-balance-scale"],
};

function assertEvaluatorTruth(lessonId: string, entry: RawStep) {
  if (!entry.widget) return;
  const widget = WidgetSpec.parse(entry.widget);
  expect(widgetIntegrityErrors(widget), `${lessonId}/${entry.id}`).toEqual([]);
  if (widget.type === "numeric") {
    expect(evaluate(widget, widget.answer).correct, `${lessonId}/${entry.id}`).toBe(true);
    for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
  } else if (widget.type === "mcq") {
    expect(widget.options.filter((choice) => choice.correct), `${lessonId}/${entry.id}`).toHaveLength(1);
    for (const choice of widget.options) expect(evaluate(widget, choice.id).correct).toBe(choice.correct);
  } else if (widget.type === "tenFrame") {
    expect(evaluate(widget, widget.target).correct, `${lessonId}/${entry.id}`).toBe(true);
  } else if (widget.type === "numberLineHop") {
    const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops;
    expect(evaluate(widget, landing).correct, `${lessonId}/${entry.id}`).toBe(true);
  }
}

describe("S259 equations-unknowns-g1 whole-course integrity", () => {
  it("keeps all twelve lessons schema-valid, pedagogy-clean, and evaluator-aligned", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const entry of [...raw.steps, ...raw.remedials.flatMap((route) => [route.concept, route.check])]) assertEvaluatorTruth(raw.id, entry);
    }
  });

  it("replaces all 24 concept placeholders with registered accessible semantic figures", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((entry) => entry.kind === "concept");
      expect(concepts.map((entry) => entry.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.narration).toBe(concept.body);
        count += 1;
      }
    }
    expect(count).toBe(24);
    expect(JSON.stringify(lessons)).not.toContain('"figure":"count-on-hops"');
  });

  it("closes all twelve progression causes with distinct actions, prompts, and payloads", () => {
    for (const lesson of lessons) {
      const i1 = lesson.steps.find((entry) => entry.id === "i1")!;
      const i2 = lesson.steps.find((entry) => entry.id === "i2")!;
      expect((i2.widget as { prompt: string }).prompt).not.toBe((i1.widget as { prompt: string }).prompt);
      expect(JSON.stringify(i2.widget)).not.toBe(JSON.stringify(i1.widget));
      const main = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = main.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompts`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized prompts`).toBe(prompts.length);
      expect(new Set(main.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payloads`).toBe(main.length);
    }
  });

  it("gives every remedial route a visual and a distinct misconception-transfer check", () => {
    for (const lesson of lessons) {
      expect(lesson.remedials).toHaveLength(1);
      const route = lesson.remedials[0];
      const Figure = FIGURES[route.concept.figure!];
      expect(Figure, `${lesson.id}/${route.concept.id}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(route.concept.narration).toBe(route.concept.body);
      const retry = WidgetSpec.parse(route.check.widget);
      const main = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      expect(main.map((widget) => widget.prompt), lesson.id).not.toContain(retry.prompt);
      expect(main.map((widget) => normalized(widget.prompt)), lesson.id).not.toContain(normalized(retry.prompt));
      expect(main.map((widget) => JSON.stringify(widget)), lesson.id).not.toContain(JSON.stringify(retry));
    }
  });

  it("removes the audited false equation and opaque Grade 1 wording", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/not yet an equation worth keeping|only an equation once|No — 3 \+ 4 = 7, not 7|A written equation must be TRUE|value the (?:left|right) side/i);
    expect(text).toContain("An equation can be false");
    expect(text).toContain("An expression has no equal sign. An equation has one");
    expect(text).toContain("Putting a number in for a blank or x is called substitution");
  });
});
