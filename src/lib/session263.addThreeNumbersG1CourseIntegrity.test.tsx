import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = join(process.cwd(), "content", "courses", "add-three-numbers-g1", "lessons");
const lessons = readdirSync(course).filter((file) => file.endsWith(".json")).sort().map((file) => JSON.parse(readFileSync(join(course, file), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[−-]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const expectedFigures: Record<string, [string, string]> = {
  "g1t-01-01": ["bar-join", "make-ten-bridge"],
  "g1t-01-02": ["ten-frame-make-ten", "make-ten-bridge"],
  "g1t-01-03": ["doubles-mirror", "near-double"],
  "g1t-01-04": ["bar-join", "as100-four-tools"],
  "g1t-02-01": ["as100-four-tools", "as100-name-tool"],
  "g1t-02-02": ["bar-join", "make-ten-bridge"],
  "g1t-02-03": ["as100-name-tool", "ten-frame-make-ten"],
  "g1t-03-01": ["make-ten-bridge", "ten-frame-make-ten"],
  "g1t-03-02": ["balance-unknown", "bar-part-whole"],
  "g1t-03-03": ["as100-four-tools", "as100-name-tool"],
};

describe("S263 add-three-numbers-g1 source repair", () => {
  it("keeps the complete course schema-valid, pedagogically clean, and widget-integral", () => {
    expect(lessons).toHaveLength(10);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lesson.courseId, raw.id).toBe("add-three-numbers-g1");
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of raw.steps) if (step.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
    }
  });

  it("replaces all twenty count-on placeholders with registered, aligned semantic models", () => {
    let placements = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      expect(new Set(concepts.map((step) => step.figure)).size, lesson.id).toBe(2);
      for (const concept of concepts) {
        expect(concept.figure).not.toBe("count-on-hops");
        expect(isFigureTextAligned(concept.figure!, concept.body ?? ""), `${lesson.id}/${concept.id}`).toBe(true);
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain('<title>');
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        placements += 1;
      }
    }
    expect(placements).toBe(20);
  });

  it("replaces every cloned retry with a distinct misconception-repair state", () => {
    for (const lesson of lessons) {
      const i1 = lesson.steps.find((step) => step.id === "i1")!;
      const i2 = lesson.steps.find((step) => step.id === "i2")!;
      const first = WidgetSpec.parse(i1.widget);
      const retry = WidgetSpec.parse(i2.widget);
      expect(retry.type, lesson.id).toBe(first.type);
      expect(i2.body, lesson.id).toBe("Repair the strategy.");
      expect(retry.prompt, lesson.id).toMatch(/learner/i);
      expect(retry.prompt, lesson.id).not.toBe(first.prompt);
      expect(JSON.stringify(retry), lesson.id).not.toBe(JSON.stringify(first));
      if (retry.type === "numberLineHop" && first.type === "numberLineHop") {
        expect([retry.start, retry.hops], lesson.id).not.toEqual([first.start, first.hops]);
      }
      if (retry.type === "tenFrame" && first.type === "tenFrame") expect(retry.preFilled, lesson.id).not.toBe(first.preFilled);
    }
  });

  it("eliminates exact, normalized, and full-widget prompt collisions without ID or answer-path drift", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => ({ id: step.id, widget: WidgetSpec.parse(step.widget) }));
      const prompts = widgets.map(({ widget }) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompts`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized prompts`).toBe(prompts.length);
      expect(new Set(widgets.map(({ widget }) => JSON.stringify(widget))).size, `${lesson.id}: widget payloads`).toBe(widgets.length);
      for (const { id, widget } of widgets) {
        expect(id).toMatch(/^(i[12]|k[1-3]|ch1)$/);
        if (widget.type === "mcq") {
          expect(widget.options.map((option) => option.id)).toEqual(["o0", "o1", "o2", "o3"]);
          expect(widget.options.filter((option) => option.correct), `${lesson.id}/${id}`).toHaveLength(1);
        }
      }
    }
  });
});
