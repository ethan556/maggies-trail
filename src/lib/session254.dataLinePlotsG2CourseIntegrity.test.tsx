import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { graphReadAnswer, Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "data-line-plots-g2", "lessons");
const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
const lessons = files.map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const findLesson = (id: string) => lessons.find((lesson) => lesson.id === id)!;
const findStep = (lesson: RawLesson, id: string) => lesson.steps.find((entry) => entry.id === id)!;
const allSteps = (lesson: RawLesson) => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry))),
];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const figures: Record<string, Record<string, string>> = {
  "g2g-01-01": { c1: "ruler-measure", c2: "g2g-shared-unit-compare" },
  "g2g-01-02": { c1: "g2g-record-repeats", c2: "vm-line-plot-read" },
  "g2g-01-03": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-01-04": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-01-05": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-02-01": { c1: "mmt-picture-graph", c2: "mmt-picture-graph" },
  "g2g-02-02": { c1: "mmt-picture-graph", c2: "mmt-picture-graph" },
  "g2g-02-03": { c1: "single-scale-graph", c2: "single-scale-graph" },
  "g2g-02-04": { c1: "single-scale-graph", c2: "g2g-bar-gap" },
  // g2g-03-01/c2 is deliberately unillustrated, not an omission: session261's VIS-03 fail-close guard
  // pins this exact position to no figure (an earlier safety audit found no figure whose caption
  // truthfully matches this step's text — "Cats have 3 votes and birds have 4 votes... 7 votes" — and
  // left it unillustrated rather than show a mismatched one), and session290's audited single-scale-graph
  // caption allowlist (7 items) does not include it either — only c1 and this lesson's remedial concept
  // do. This row previously also claimed c2, which required the content to carry a figure/text mismatch
  // to satisfy; corrected the map instead of re-breaking the content (S330 round-2 final gate).
  "g2g-03-01": { c1: "single-scale-graph" },
  "g2g-03-02": { c1: "g2g-bar-gap", c2: "single-scale-graph" },
  "g2g-03-03": { c1: "vm-line-plot-read", c2: "single-scale-graph" },
};

describe("S254 data-line-plots-g2 whole-course integrity", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(files).toHaveLength(12);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(12);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("data-line-plots-g2");
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) {
        if (!entry.widget) continue;
        const widget = WidgetSpec.parse(entry.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${entry.id}`).toEqual([]);
      }
    }
  });

  it("binds all 23 concepts to registered, accessible semantic figures", () => {
    let count = 0;
    for (const [lessonId, plan] of Object.entries(figures)) for (const [stepId, figureId] of Object.entries(plan)) {
      count += 1;
      const concept = findStep(findLesson(lessonId), stepId);
      expect(concept.figure, `${lessonId}/${stepId}`).toBe(figureId);
      expect(concept.figure).not.toBe("count-on-hops");
      expect(concept.narration).toBe(concept.body);
      const Figure = FIGURES[figureId];
      expect(Figure, figureId).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
    }
    expect(count).toBe(23);
  });

  it("eliminates exact, normalized, and full-payload collisions among main learner jobs", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
    }
  });

  it("keeps numeric, MCQ, and graph-reading evaluators aligned across main and remedial routes", () => {
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const error of widget.commonErrors ?? []) {
          expect(error.value).not.toBe(widget.answer);
          expect(evaluate(widget, error.value).correct).toBe(false);
        }
      } else if (widget.type === "mcq") {
        expect(new Set(widget.options.map((option) => option.id)).size).toBe(widget.options.length);
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      } else if (widget.type === "graphRead") {
        const truth = graphReadAnswer(widget);
        expect(evaluate(widget, { picked: truth }).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const result of widget.commonResults) {
          expect(result.value).not.toBe(truth);
          expect(result.value).toBeGreaterThanOrEqual(0);
          expect(result.value).toBeLessThanOrEqual(widget.scaleMax);
          expect(evaluate(widget, { picked: result.value }).feedback).toBe(result.feedback);
        }
      }
    }
  });

  it("preserves the repaired two-step graph jobs and concept-to-figure truth", () => {
    const putTogether = findLesson("g2g-03-01");
    expect((findStep(putTogether, "i1").widget as { categoryLabel: string; drawn: number })).toMatchObject({ categoryLabel: "Monday", drawn: 5 });
    expect((findStep(putTogether, "i2").widget as { categoryLabel: string; drawn: number })).toMatchObject({ categoryLabel: "Tuesday", drawn: 6 });
    expect(findStep(putTogether, "c2").body).toContain("Cats have 3 votes and birds have 4");

    const compare = findLesson("g2g-03-02");
    expect((findStep(compare, "i1").widget as { categoryLabel: string; drawn: number })).toMatchObject({ categoryLabel: "Thursday", drawn: 9 });
    expect((findStep(compare, "i2").widget as { categoryLabel: string; drawn: number })).toMatchObject({ categoryLabel: "Wednesday", drawn: 4 });
    expect(findStep(compare, "c1").body).toContain("dogs bar reaches 6 and the cats bar reaches 3");

    const choose = findLesson("g2g-03-03");
    expect((findStep(choose, "i1").widget as { type: string }).type).toBe("barBuilder");
    expect((findStep(choose, "i2").widget as { type: string }).type).toBe("dotPlot");
  });

  it("removes the audited learner-visible false and malformed claims", () => {
    const text = JSON.stringify(lessons);
    for (const phrase of [
      "count-on-hops",
      "one picture per counted thing",
      "keeps EVERYTHING",
      "count means nothing",
      "shells pictures",
      "pinecones pictures",
      "stickers pictures",
      "apples pictures",
    ]) expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
  });
});
