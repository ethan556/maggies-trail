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
const course = join(process.cwd(), "content", "courses", "four-addends-g2", "lessons");
const lessons = readdirSync(course).filter((file) => file.endsWith(".json")).sort().map((file) => JSON.parse(readFileSync(join(course, file), "utf8")) as RawLesson);
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[−-]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const expected: Record<string, [string | undefined, string | undefined]> = {
  "g2n-01-01": ["bar-join", "make-ten-bridge"],
  "g2n-01-02": ["as100-name-tool", "as100-four-tools"],
  "g2n-01-03": ["tens-partners", undefined],
  "g2n-02-01": ["as100-add-by-place-86", undefined],
  "g2n-02-02": ["as100-four-tools", "as100-name-tool"],
  "g2n-02-03": ["as100-name-tool", "bar-join"],
  "g2n-03-01": ["bar-join", "as100-four-tools"],
  "g2n-03-02": ["as100-name-tool", "add-balance-scale"],
};

describe("S263 four-addends-g2 source repair", () => {
  it("keeps all lessons schema-valid, pedagogically clean, and widget-integral", () => {
    expect(lessons).toHaveLength(8);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lesson.courseId, raw.id).toBe("four-addends-g2");
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of raw.steps) if (step.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
    }
  });

  it("removes all count-on placeholders and renders every retained semantic figure accessibly", () => {
    let retained = 0;
    let withheld = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expected[lesson.id]);
      for (const concept of concepts) {
        expect(concept.figure).not.toBe("count-on-hops");
        if (!concept.figure) { withheld += 1; continue; }
        expect(isFigureTextAligned(concept.figure, concept.body ?? ""), `${lesson.id}/${concept.id}`).toBe(true);
        const Figure = FIGURES[concept.figure];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        retained += 1;
      }
    }
    expect(retained).toBe(14);
    expect(withheld).toBe(2);
  });

  it("turns every i2 into a distinct evaluator-safe learner-repair state", () => {
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
      if (retry.type === "numberLineHop" && first.type === "numberLineHop") expect([retry.start, retry.hop, retry.hops], lesson.id).not.toEqual([first.start, first.hop, first.hops]);
      if (retry.type === "tapDiagram" && first.type === "tapDiagram") expect(retry.hotspots.map((spot) => spot.label), lesson.id).not.toEqual(first.hotspots.map((spot) => spot.label));
    }
  });

  it("removes exact, normalized, and full-widget collisions while retaining stable MCQ IDs", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => ({ id: step.id, widget: WidgetSpec.parse(step.widget) }));
      const prompts = widgets.map(({ widget }) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: normalized`).toBe(prompts.length);
      expect(new Set(widgets.map(({ widget }) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(widgets.length);
      for (const { widget } of widgets) if (widget.type === "mcq") {
        expect(widget.options.map((option) => option.id)).toEqual(["o0", "o1", "o2", "o3"]);
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
      }
    }
  });
});
