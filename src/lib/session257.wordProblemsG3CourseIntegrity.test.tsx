import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown; cml?: { actionGoal?: string; invariants?: string[]; misconceptions?: string[] } };
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "word-problems-g3", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry)))];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const expectedFigures: Record<string, [string, string]> = {
  "g3w-01-01": ["mb-multistep", "mb-multistep"], "g3w-01-02": ["dop-grouping", "mult3-equal-groups"],
  "g3w-01-03": ["mb-multistep", "g3w-subtract-once"], "g3w-01-04": ["mult3-fair-shares", "g3w-share-then-add"],
  "g3w-02-01": ["ee-variable", "mult3-missing-factor"], "g3w-02-02": ["dop-order-matters", "dop-word-expr"],
  "g3w-02-03": ["g3w-subtract-once", "mb-multistep"], "g3w-02-04": ["mmt-estimate", "mmt-estimate-catch"],
  "g3w-03-01": ["pv3-round-ten", "mult3-estimate"], "g3w-03-02": ["mmt-estimate-catch", "mb-multistep"],
  "g3w-03-03": ["g3w-relevant-information", "mult3-equal-groups"], "g3w-03-04": ["dop-word-expr", "g3w-multiply-then-add"],
};

describe("S257 word-problems-g3 whole-course integrity", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, widget-integral, and lesson-specific in CML", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) {
        if (entry.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(entry.widget)), `${raw.id}/${entry.id}`).toEqual([]);
        if (entry.cml) {
          expect(entry.cml.actionGoal, `${raw.id}/${entry.id}`).not.toMatch(/g3w |hidden question first/i);
          expect(entry.cml.invariants?.join(" "), `${raw.id}/${entry.id}`).not.toMatch(/g3w /i);
          expect(entry.cml.misconceptions?.join(" "), `${raw.id}/${entry.id}`).not.toMatch(/g3w /i);
        }
      }
    }
  });

  it("renders all 24 exact registered accessible semantic figures", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((entry) => entry.kind === "concept");
      expect(concepts.map((entry) => entry.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup, `${lesson.id}/${concept.id}`).toContain("<title>");
        expect(markup, `${lesson.id}/${concept.id}`).toContain('role="img"');
        expect(concept.narration).toBe(concept.body);
        count += 1;
      }
    }
    expect(count).toBe(24);
  });

  it("closes all 12 progression causes across lesson and remedial checks", () => {
    for (const lesson of lessons) {
      const widgets = allSteps(lesson).filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompts`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized prompts`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payloads`).toBe(widgets.length);
      expect(lesson.steps.find((entry) => entry.id === "i1")?.widget).not.toEqual(lesson.steps.find((entry) => entry.id === "i2")?.widget);
      expect(lesson.steps.find((entry) => entry.id === "k1")?.widget).not.toEqual(lesson.remedials?.[0]?.check?.widget);
    }
  });

  it("keeps evaluator targets, choices, selection sets, and feedback aligned", () => {
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
        expect(widget.tolerance).toBe(0);
        for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
      } else if (widget.type === "mcq") {
        expect(widget.options.map((option) => option.id), `${lesson.id}/${entry.id}`).toEqual(["o0", "o1", "o2", "o3"]);
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${entry.id}`).toHaveLength(1);
        expect(widget.options[0].correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      } else if (widget.type === "numberLinePlace") {
        expect(evaluate(widget, widget.target).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const placement of widget.commonPlacements) expect(evaluate(widget, placement.value).correct).toBe(false);
      } else if (widget.type === "estimateSlider") {
        expect(widget.choices).toHaveLength(3);
        expect(widget.choices.filter((choice) => choice.correct), `${lesson.id}/${entry.id}`).toHaveLength(1);
        for (const choice of widget.choices) expect(evaluate(widget, choice.value).correct).toBe(choice.correct);
      } else if (widget.type === "numberLineHop") {
        const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops;
        expect(evaluate(widget, landing).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const common of widget.commonLandings) expect(evaluate(widget, common.value).correct).toBe(false);
      } else if (widget.type === "barBuilder") {
        expect(evaluate(widget, widget.target).correct, `${lesson.id}/${entry.id}`).toBe(true);
      } else if (widget.type === "tapDiagram") {
        const correctIds = widget.hotspots.filter((spot) => spot.correct).map((spot) => spot.id);
        expect(evaluate(widget, correctIds).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const spot of widget.hotspots.filter((candidate) => !candidate.correct)) expect(evaluate(widget, [...correctIds, spot.id]).correct).toBe(false);
      }
    }
  });

  it("repairs copied feedback, estimation truth, context drift, and generic figures", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/count-on-hops|Fourths needs|Bars A and D pass|63's neighbors|arriving shelve|arriving boxe|Name the hidden question first, answer it/i);
    const estimate = lessons.find((lesson) => lesson.id === "g3w-02-04")!;
    const opening = WidgetSpec.parse(estimate.steps.find((entry) => entry.id === "i1")!.widget);
    expect(opening.type).toBe("estimateSlider");
    if (opening.type === "estimateSlider") {
      expect(opening.target).toBe(250);
      expect(opening.choices.find((choice) => choice.correct)?.value).toBe(250);
      expect(evaluate(opening, 240).correct).toBe(false);
    }
    const extra = lessons.find((lesson) => lesson.id === "g3w-03-03")!;
    for (const id of ["i1", "i2"]) {
      const widget = WidgetSpec.parse(extra.steps.find((entry) => entry.id === id)!.widget);
      expect(widget.type).toBe("tapDiagram");
      if (widget.type === "tapDiagram") expect(widget.successFeedback).toMatch(/extra|irrelevant/i);
    }
  });
});
