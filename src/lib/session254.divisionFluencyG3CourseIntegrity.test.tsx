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
const dir = join(process.cwd(), "content", "courses", "division-fluency-g3", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((entry): entry is RawStep => Boolean(entry)))];
const expectedFigures: Record<string, [string, string]> = {
  "df3-01-01": ["mult3-fair-shares", "mult3-fact-family"], "df3-01-02": ["mult3-how-many-groups", "mult3-fact-family"],
  "df3-01-03": ["mult3-double-double", "mult3-fact-family"], "df3-01-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-02-01": ["mult3-missing-factor", "mult3-divide-by-nine"], "df3-02-02": ["mult3-divide-by-ten", "mult3-divide-by-ten"],
  "df3-02-03": ["mult3-missing-factor", "mult3-fact-family"], "df3-02-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-03-01": ["mult3-divide-one-self", "mult3-divide-one-self"], "df3-03-02": ["mult3-divide-by-zero", "mult3-divide-by-zero"],
  "df3-03-03": ["mult3-fact-family", "mult3-array"], "df3-03-04": ["mult3-which-op", "mult3-fair-shares"],
};

describe("S254 division-fluency-g3 whole-course integrity", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const entry of allSteps(raw)) if (entry.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(entry.widget)), `${raw.id}/${entry.id}`).toEqual([]);
    }
  });

  it("renders all 24 registered accessible semantic concept figures", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((entry) => entry.kind === "concept");
      expect(concepts.map((entry) => entry.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>"); expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration); count += 1;
      }
    }
    expect(count).toBe(24);
  });

  it("closes all 11 detector-defined progression collisions", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
    }
  });

  it("keeps evaluator, model, feedback, and choice truth aligned", () => {
    for (const lesson of lessons) for (const entry of allSteps(lesson)) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      if (widget.type === "numeric") {
        expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
        expect(widget.tolerance).toBe(0);
        for (const error of widget.commonErrors ?? []) expect(error.value).not.toBe(widget.answer);
      }
      if (widget.type === "areaModel" && widget.requireFactors) {
        expect(widget.requireFactors.w * widget.requireFactors.h, `${lesson.id}/${entry.id}`).toBe(widget.targetArea);
      }
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
        if (["df3-03-02/k1", "df3-03-02/k3"].includes(`${lesson.id}/${entry.id}`)) {
          expect(widget.options.map((option) => option.id)).toEqual(["o0", "o1", "o2", "o3"]);
          const lengths = widget.options.map((option) => option.label.length);
          expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(8);
        }
      }
    }
  });

  it("removes audited place-value and domain overclaims", () => {
    const text = JSON.stringify(lessons);
    expect(text).not.toMatch(/÷10 shifts|shifts every digit|digits move down|zero .* disappears/i);
    expect(text).not.toContain("A quotient can always be checked by multiplying it back.");
    expect(text).not.toContain("Every division fact has a multiplication twin");
    expect(text).not.toContain("dividing a number by itself gives 1");
    expect(text).toContain("dividing a nonzero number by itself gives 1");
    expect(text).toContain("Division by zero is undefined");
  });
});
