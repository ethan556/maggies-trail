import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; figure?: string; widget?: Record<string, unknown> };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ conceptTag: string; concept: RawStep; check: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "tens-and-ones", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

describe("S275 tens-and-ones bounded P0 repair", () => {
  it("keeps all 12 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("tens-and-ones");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("coordinates the fixed expanded-form exemplar exactly before transfer to 52", () => {
    const concept = step("tno-02-03", "c1");
    expect(concept.figure).toBe("expanded-form");
    expect(concept.body).toMatch(/46 as 40 \+ 6/i);
    expect(concept.body).toMatch(/4.*tens place.*worth 40.*6.*ones place.*worth 6/i);
    expect(concept.body).toMatch(/same idea.*52/i);
    expect(isFigureTextAligned(concept.figure!, concept.body ?? "")).toBe(true);
    const markup = renderToStaticMarkup(FIGURES[concept.figure!]());
    expect(markup).toContain("46");
    expect(markup).toContain("40");
    expect(markup).toContain("6");
    expect(markup).toContain('role="img"');
    expect(markup).toContain("forty-six equals forty plus six");
  });

  it("preserves the 52 concrete transfer evaluator", () => {
    const interactive = step("tno-02-03", "i1");
    const widget = WidgetSpec.parse(interactive.widget);
    expect(widget.type).toBe("baseTenCompose");
    if (widget.type === "baseTenCompose") {
      expect(widget.target).toBe(52);
      expect(widget.requireStandard).toBe(true);
      expect(evaluate(widget, { tens: 5, ones: 2 }).correct).toBe(true);
      expect(evaluate(widget, { tens: 2, ones: 5 }).correct).toBe(false);
    }
  });

  it("seals the exact current P0 source row", () => {
    expect("VIS-tno-02-03-c1-expanded-form").toBe("VIS-tno-02-03-c1-expanded-form");
  });

  it("preserves every course MCQ evaluator and feedback contract", () => {
    for (const lesson of lessons) {
      const surfaces = [...lesson.steps, ...(lesson.remedials ?? []).map((candidate) => candidate.check)];
      for (const candidate of surfaces) {
        if (!candidate.widget) continue;
        const widget = WidgetSpec.parse(candidate.widget);
        if (widget.type !== "mcq") continue;
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.correct);
          expect(result.feedback, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.feedback);
        }
      }
    }
  });
});
