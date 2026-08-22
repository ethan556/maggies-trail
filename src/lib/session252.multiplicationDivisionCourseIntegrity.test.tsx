import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: unknown;
};
type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const dir = join(process.cwd(), "content", "courses", "multiplication-division", "lessons");
const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
const lessons = files.map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((route) =>
    [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry)),
  ),
];
const normalized = (prompt: string) =>
  prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const repairedVisuals: Record<string, [string, string]> = {
  // S318-V3-mult-02-01: mult3-fair-shares is a fixed 12÷3=4 exemplar; c2's body states "15 / 5 = 3"
  // verbatim, so the figure was moved to the lesson-matched mult3-fair-shares-15-over-5 (per=3,
  // recomputed correct), reaffirmed registered and text-aligned by S321-F9-mult-02-01.
  "mult-02-01": ["c2", "mult3-fair-shares-15-over-5"],
  // S318-V3-mult-02-03: c2 body states "35 / 5: ... seven hops" (7x5=35); figure moved to the
  // lesson-matched number-line-jumps-7x5, confirmed non-stale via the FIGURE_NUMERIC_CLAIMS check.
  "mult-02-03": ["c2", "number-line-jumps-7x5"],
  "mult-03-01": ["c1", "mult3-double"],
  // s323-eng-mult-04-04: rebound off the mismatched mult3-which-op onto a new dedicated figure
  // (Mult3GroupsAdjustCars, registered as mult3-groups-adjust-cars) matching the lesson's own
  // 5 rows x 8 cars, 6 removed once (5x8-6=34) per the S321_ASSESS_F9 contract.
  "mult-04-04": ["c2", "mult3-groups-adjust-cars"],
  // Figure moved to the lesson-matched mult3-estimate-6x9; reaffirmed registered and text-aligned
  // by S321-F9-mult-04-05.
  "mult-04-05": ["c2", "mult3-estimate-6x9"],
};

const repairedChoices: Array<[string, string]> = [
  ["mult-02-04", "k3"],
  ["mult-04-04", "k3"],
  ["mult-04-05", "k1"],
  ["mult-05-01", "k2"],
  ["mult-05-02", "k3"],
  ["mult-05-03", "k1"],
  ["mult-05-04", "k1"],
];

const findLesson = (id: string) => lessons.find((lesson) => lesson.id === id)!;
const findStep = (lesson: RawLesson, id: string) => lesson.steps.find((entry) => entry.id === id)!;

describe("S252 multiplication-division whole-course integrity", () => {
  it("keeps the complete 24-lesson portfolio schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(files).toHaveLength(24);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(24);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("multiplication-division");
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  // Originally fail-closed two high-confidence mismatches (mult-02-03, mult-04-05 on their prior
  // generic figures). Both were since repaired onto lesson-matched figures (see repairedVisuals
  // comments above) and are now text-aligned like the other three, so every entry expects true.
  it("keeps all five figures registered and text-aligned", () => {
    for (const [lessonId, [stepId, expectedFigure]] of Object.entries(repairedVisuals)) {
      const target = findStep(findLesson(lessonId), stepId);
      expect(target.figure).toBe(expectedFigure);
      expect(target.body).toBeTruthy();
      expect(isFigureTextAligned(expectedFigure, target.body ?? ""), `${lessonId}/${stepId}`).toBe(true);
      const Figure = FIGURES[expectedFigure];
      expect(Figure, expectedFigure).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
    }
  });

  it("eliminates exact, payload, and number-normalized progression collisions course-wide", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
    }
  });

  it("keeps all seven repaired MCQs cue-resistant with stable truth contracts", () => {
    for (const [lessonId, stepId] of repairedChoices) {
      const widget = WidgetSpec.parse(findStep(findLesson(lessonId), stepId).widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") continue;
      expect(widget.options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(18);
      for (const option of widget.options) {
        expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
        expect(option.feedback.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it("keeps every numeric and MCQ evaluator aligned with its authored feedback", () => {
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
        for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
      }
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options) {
          expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
        }
      }
    }
  });

  it("removes audited mathematical overclaims while preserving the corrected concepts", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/every times fact you know (?:hands|unlocks).*two division/i);
    expect(text).not.toMatch(/×10 shifts|shifts .* into the tens place|shifts one place left/i);
    expect(text).not.toContain("Wrong size = wrong operation, guaranteed.");
    expect(text).not.toContain("Every non-square product has exactly such a twin pair.");
    expect(text).not.toContain("6 only splits as 2 × 3");
    expect(text).not.toContain("10 is the biggest one-digit jump");
    expect(findStep(findLesson("mult-02-04"), "c2").body).toContain("When the factors match");
    expect(findStep(findLesson("mult-03-02"), "c1").body).toContain("ten times as much");
    expect(findStep(findLesson("mult-04-05"), "c1").body).toContain("more than one group");
    expect((WidgetSpec.parse(findStep(findLesson("mult-05-02"), "i2").widget) as { successFeedback: string }).successFeedback).toContain("Inside this 4-by-4 grid");
  });
});
