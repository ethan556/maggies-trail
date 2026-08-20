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
const dir = join(process.cwd(), "content", "courses", "measure-problems-g4", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry)))];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const expectedFigures: Record<string, [string, string]> = {
  "g4v-01-01": ["mc-length-ladder", "g4v-meter-cm-table"], "g4v-01-02": ["g4v-meter-cm-table", "mc-length-ladder"],
  "g4v-01-03": ["mc-length-ladder", "g4v-length-both-ways-table"], "g4v-01-04": ["md3-mass-scale", "mc-mass-volume"],
  "g4v-02-01": ["g4v-liter-ml-jug", "mc-mass-volume"], "g4v-02-02": ["g4v-clock-60", "rr-chain"],
  "g4v-02-03": ["mb-multistep", "g4v-groups-adjust-distance"], "g4v-02-04": ["g4v-groups-adjust-time", "rr-chain"],
  "g4v-03-01": ["g4v-groups-adjust-money", "mb-multistep"], "g4v-03-02": ["g4v-quarter-inch-plot", "vm-total-length"],
  "g4v-03-03": ["mb-multistep", "rr-chain"], "g4v-03-04": ["g4v-groups-adjust-distance", "g4v-end-vs-inside-adjust"],
};

describe("S256 measure-problems-g4 whole-course integrity", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, widget-integral, and lesson-specific in CML", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) {
        if (entry.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(entry.widget)), `${raw.id}/${entry.id}`).toEqual([]);
        if (entry.cml) {
          expect(entry.cml.actionGoal, `${raw.id}/${entry.id}`).not.toContain("g4v ");
          expect(entry.cml.invariants?.join(" "), `${raw.id}/${entry.id}`).not.toContain("g4v ");
          expect(entry.cml.misconceptions?.join(" "), `${raw.id}/${entry.id}`).not.toContain("g4v ");
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
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.narration).toBe(concept.body);
        count += 1;
      }
    }
    expect(count).toBe(24);
  });

  it("closes all 12 progression collisions with distinct prompts, forms, and payloads", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompts`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized prompts`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payloads`).toBe(widgets.length);
    }
  });

  it("keeps evaluator targets, choices, and feedback aligned for every widget type", () => {
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
        const correct = widget.choices.filter((choice) => choice.correct);
        expect(correct, `${lesson.id}/${entry.id}`).toHaveLength(1);
        for (const choice of widget.choices) expect(evaluate(widget, choice.value).correct).toBe(choice.correct);
      } else if (widget.type === "numberLineHop") {
        const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops;
        expect(evaluate(widget, landing).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const common of widget.commonLandings) expect(evaluate(widget, common.value).correct).toBe(false);
      } else if (widget.type === "barBuilder") {
        expect(evaluate(widget, widget.target).correct, `${lesson.id}/${entry.id}`).toBe(true);
      }
    }
  });

  it("repairs the quarter-unit, estimate-range, context, and templated-language defects", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/count-on-hops|2\/4 of the way|target sits at the halfway|in tens of dollars|every measurement family there is|only new information in a conversion problem/i);
    const fractionLesson = lessons.find((lesson) => lesson.id === "g4v-03-02")!;
    const fractionWidgets = fractionLesson.steps.filter((entry) => ["i1", "i2"].includes(entry.id)).map((entry) => WidgetSpec.parse(entry.widget));
    expect(fractionWidgets.map((widget) => widget.type === "numberLinePlace" ? [widget.target, widget.step, widget.fractionDen] : null)).toEqual([[2, 0.25, undefined], [3, 0.25, undefined]]);
    const timeLesson = JSON.stringify(lessons.find((lesson) => lesson.id === "g4v-02-02"));
    expect(timeLesson).not.toContain("5 kilograms");
    const moneyLesson = JSON.stringify(lessons.find((lesson) => lesson.id === "g4v-03-01"));
    expect(moneyLesson).not.toContain("6 equal parts of 400 m");
  });
});
