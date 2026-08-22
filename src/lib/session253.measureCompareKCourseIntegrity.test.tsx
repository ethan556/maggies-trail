import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "measure-compare-k", "lessons");
const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
const lessons = files.map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry))),
];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const findLesson = (id: string) => lessons.find((lesson) => lesson.id === id)!;
const findStep = (lesson: RawLesson, id: string) => lesson.steps.find((entry) => entry.id === id)!;

const figures: Record<string, Record<string, string>> = {
  "kmd-01-01": { c1: "ks-size-trick", c2: "ks-seesaw" },
  // c2 figure removed per S327_ASSESS_A4.md kmd-01-02: "length-compare" (pencil-vs-eraser
  // paperclip comparison) mismatched c2's actual point (one object's length renamed by
  // orientation); no suitable replacement figure exists in the registry.
  "kmd-01-02": { c1: "ks-compare-length" },
  "kmd-01-03": { c1: "ks-seesaw", c2: "ks-size-trick" },

  "kmd-02-01": { c1: "ks-compare-length", c2: "length-compare" },
  "kmd-02-02": { c1: "ks-seesaw", c2: "add-balance-scale" },
  "kmd-02-03": { c1: "ks-same-end-fair", c2: "ks-compare-length" },
  "kmd-02-04": { c1: "ks-compare-length", c2: "length-compare" },
  // c2 figure removed per S327_ASSESS_A4.md kmd-03-01: "geo3-sort-yesno" (a single Grade-3 shape
  // tested against one yes/no rule) does not depict c2's rule-switching point (same object, two
  // homes under two different rules); no suitable replacement figure exists in the registry.
  "kmd-03-01": { c1: "ks-sort-count" },
  "kmd-03-02": { c1: "geo3-sort-yesno", c2: "ks-compare-length" },
  "kmd-03-03": { c1: "ks-sort-count", c2: "ks-count-groups" },
  "kmd-03-04": { c1: "ks-count-groups", c2: "ks-sort-count" },
};

const repairedChoices: Array<[string, string]> = [
  ["kmd-01-01", "k3"], ["kmd-01-04", "ch1"], ["kmd-03-01", "k2"], ["kmd-03-02", "k1"],
];

describe("S253 measure-compare-k whole-course integrity", () => {
  it("keeps the complete 12-lesson portfolio schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(files).toHaveLength(12);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(12);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("measure-compare-k");
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) {
        if (!entry.widget) continue;
        const widget = WidgetSpec.parse(entry.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${entry.id}`).toEqual([]);
      }
    }
  });

  it("replaces all 24 placeholders with registered accessible semantic figures", () => {
    let count = 0;
    for (const [lessonId, plan] of Object.entries(figures)) for (const [stepId, figureId] of Object.entries(plan)) {
      count += 1;
      expect(findStep(findLesson(lessonId), stepId).figure, `${lessonId}/${stepId}`).toBe(figureId);
      expect(figureId).not.toBe("count-on-hops");
      const Figure = FIGURES[figureId];
      expect(Figure, figureId).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
    }
    expect(count).toBe(20);
    expect(findStep(findLesson("kmd-01-04"), "c1").figure).toBe("kmd-capacity-same-scoop");
    expect(findStep(findLesson("kmd-01-04"), "c2").figure).toBe("kmd-capacity-same-scoop");
  });

  it("eliminates exact, payload, and number-normalized progression collisions course-wide", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
    }
  });

  it("keeps all four repaired choices cue-resistant with stable IDs and evaluator truth", () => {
    for (const [lessonId, stepId] of repairedChoices) {
      const widget = WidgetSpec.parse(findStep(findLesson(lessonId), stepId).widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") continue;
      // reports/quality/S305_MEASURE_COMPARE_K_CHOICE_ORDER.md deliberately reordered every
      // main-sequence MCQ's options array so the correct option (always id o0) no longer renders
      // at a fixed index-0 position; ids stay stable, array order does not. Compare the id set.
      expect([...widget.options.map((option) => option.id)].sort()).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(8);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
    }
  });

  it("keeps every numeric and MCQ evaluator aligned with authored correctness", () => {
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
        for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
      }
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      }
    }
  });

  it("removes the audited false and irrelevant feedback claims", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toContain("Yes — a circle is round all the way");
    expect(text).not.toContain("Every object answers measurement questions");
    expect(text).not.toContain("Every block must be the same size, or the count means nothing.");
    expect(text).not.toContain("that number IS its length");
    expect(text).not.toContain("You can always tell — count each group");
    expect((WidgetSpec.parse(findStep(findLesson("kmd-03-04"), "i2").widget) as { prompt: string }).prompt).toContain("fewest");
  });
});
