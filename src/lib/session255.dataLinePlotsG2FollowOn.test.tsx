import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { graphReadAnswer, Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: Record<string, unknown> };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials: Array<{ concept: RawStep; check: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "data-line-plots-g2", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId.get(lessonId)!.steps.find((entry) => entry.id === stepId)!;
const normalized = (text: string) => text.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...lesson.remedials.flatMap((route) => [route.concept, route.check])];

const expectedRemedialFigures: Record<string, string> = {
  "g2g-01-01": "g2g-shared-unit-compare", "g2g-01-02": "g2g-record-repeats",
  "g2g-01-03": "vm-line-plot-read", "g2g-01-04": "vm-line-plot-read", "g2g-01-05": "vm-line-plot-read",
  "g2g-02-01": "mmt-picture-graph", "g2g-02-02": "mmt-picture-graph", "g2g-02-03": "single-scale-graph",
  "g2g-02-04": "g2g-bar-gap", "g2g-03-01": "single-scale-graph", "g2g-03-02": "g2g-bar-gap",
  "g2g-03-03": "g2g-display-choice",
};

describe("S255 data-line-plots-g2 follow-on", () => {
  it("keeps all 12 lessons schema-, pedagogy-, and evaluator-valid", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) {
        if (!entry.widget) continue;
        const widget = WidgetSpec.parse(entry.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${entry.id}`).toEqual([]);
        if (widget.type === "numeric") {
          expect(evaluate(widget, widget.answer).correct, `${raw.id}/${entry.id}`).toBe(true);
          for (const error of widget.commonErrors) expect(evaluate(widget, error.value).correct).toBe(false);
        } else if (widget.type === "mcq") {
          for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
        } else if (widget.type === "graphRead") {
          expect(evaluate(widget, { picked: graphReadAnswer(widget) }).correct, `${raw.id}/${entry.id}`).toBe(true);
        }
      }
    }
  });

  it("gives every remedial a registered visual, a new concept explanation, and a distinct check", () => {
    for (const lesson of lessons) {
      const remedial = lesson.remedials[0];
      const c2 = lesson.steps.find((entry) => entry.id === "c2")!;
      const k1 = lesson.steps.find((entry) => entry.id === "k1")!;
      expect(remedial.concept.figure, lesson.id).toBe(expectedRemedialFigures[lesson.id]);
      expect(FIGURES[remedial.concept.figure!], remedial.concept.figure).toBeDefined();
      expect(remedial.concept.body).not.toBe(c2.body);
      expect(remedial.concept.narration).toBe(remedial.concept.body);
      expect((remedial.check.widget as { prompt: string }).prompt).not.toBe((k1.widget as { prompt: string }).prompt);
      expect(normalized((remedial.check.widget as { prompt: string }).prompt)).not.toBe(normalized((k1.widget as { prompt: string }).prompt));
      expect(JSON.stringify(remedial.check.widget)).not.toBe(JSON.stringify(k1.widget));
    }
  });

  it("balances all 15 MCQ keys deterministically while preserving stable option IDs and label parity", () => {
    const positions = [0, 0, 0, 0];
    let count = 0;
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (entry.widget?.type !== "mcq") continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type !== "mcq") continue;
      count += 1;
      const correctIndex = widget.options.findIndex((option) => option.correct);
      positions[correctIndex] += 1;
      expect(new Set(widget.options.map((option) => option.id))).toEqual(new Set(["o0", "o1", "o2", "o3"]));
      expect(widget.options.find((option) => option.correct)?.id).toBe("o0");
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) / Math.min(...lengths), `${lesson.id}/${entry.id}`).toBeLessThanOrEqual(1.25);
    }
    expect(count).toBe(15);
    expect(positions).toEqual([3, 4, 4, 4]);
  });

  it("aligns the modal-value prompt with the stack-marking action without a value-frequency collision", () => {
    for (const id of ["i1", "i2"]) {
      const widget = WidgetSpec.parse(step("g2g-01-05", id).widget);
      expect(widget.type).toBe("dotPlot");
      if (widget.type !== "dotPlot" || !widget.given || widget.askIndex === undefined) continue;
      expect(widget.prompt).toMatch(/tap every x in (that|the tallest) stack/i);
      const value = widget.values[widget.askIndex] / (widget.denominator ?? 1);
      const frequency = widget.given[widget.askIndex];
      expect(value).toBe(6);
      expect(frequency).toBe(5);
      expect(value).not.toBe(frequency);
      const marks = widget.given.map((_, index) => index === widget.askIndex ? frequency : 0);
      expect(evaluate(widget, marks).correct).toBe(true);
    }
  });

  it("renders four narrow semantic figures with visible and accessible data parity", () => {
    const expected = {
      "g2g-shared-unit-compare": ["4 cm", "6 cm", "same centimeter"],
      "g2g-record-repeats": ["5 cm", "6 cm", "two ribbons"],
      "g2g-bar-gap": ["cats 3", "dogs 6", "gap 3"],
      "g2g-display-choice": ["measurements", "line plot", "named choices", "bar graph"],
    } as const;
    for (const [figureId, tokens] of Object.entries(expected)) {
      const Figure = FIGURES[figureId];
      expect(Figure, figureId).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain('role="img"');
      expect(markup).toContain("<title>");
      for (const token of tokens) expect(markup.toLowerCase(), `${figureId}/${token}`).toContain(token.toLowerCase());
    }
  });

  it("removes every exact assessed phrase and retained meta-language cause", () => {
    const text = JSON.stringify(lessons).toLowerCase();
    for (const phrase of ["building it is transcription", "wears the tallest stack", "different crowns", "transfer to a new graph", "step one of a put-together", "unit-scale", "y-axis label", "adding the marks measures nothing"]) {
      expect(text).not.toContain(phrase);
    }
  });
});
