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
const dir = join(process.cwd(), "content", "courses", "compare-numbers-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];

const expectedFigures: Record<string, [string, string]> = {
  "kcm-01-01": ["kc-fewer", "khm-paired-groups-leftover"],
  "kcm-01-02": ["khm-paired-groups-leftover", "kc-fewer"],
  "kcm-01-03": ["khm-one-more-compare", "kc-fewer"],
  "kcm-01-04": ["kc-fewer", "kc-greater"],
  "kcm-02-01": ["khm-any-order-same-total", "khm-paired-groups-leftover"],
  "kcm-02-02": ["khm-paired-groups-leftover", "kc-fewer"],
  "kcm-02-03": ["kc-greater", "kc-fewer"],
  "kcm-02-04": ["kc-greater", "kc-count-on"],
  "kcm-03-01": ["kc-fewer", "kc-greater"],
  "kcm-03-02": ["khm-any-order-same-total", "khm-any-order-same-total"],
  "kcm-03-03": ["kc-order", "kc-greater"],
  "kcm-03-04": ["kc-order", "kc-greater"],
};

describe("S253 compare-numbers-k whole-course repair", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("renders all 24 synchronized semantic concept placements", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        expect(concept.figure).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        count += 1;
      }
    }
    expect(count).toBe(24);
  });

  it("eliminates exact, payload, and number-normalized progression collisions", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = widgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
      const i1 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i1")!.widget);
      const i2 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i2")!.widget);
      expect(i2.prompt).not.toBe(i1.prompt);
    }
  });

  it("keeps every answer route truthful and choice labels parallel", () => {
    const targeted = new Set(["kcm-01-03/k2", "kcm-02-02/k1", "kcm-02-04/k1", "kcm-03-01/k3"]);
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
        for (const option of widget.options) {
          expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
        }
        if (targeted.has(`${lesson.id}/${step.id}`)) {
          const lengths = widget.options.map((option) => option.label.length);
          expect(Math.max(...lengths) - Math.min(...lengths), `${lesson.id}/${step.id}`).toBeLessThanOrEqual(15);
        }
      }
    }
  });
});
