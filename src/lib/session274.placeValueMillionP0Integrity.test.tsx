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

const dir = join(process.cwd(), "content", "courses", "place-value-million", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

describe("S274 place-value-million bounded P0 repair", () => {
  it("keeps all 14 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("place-value-million");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("uses the exact six-rung place-value ladder for named places", () => {
    const concept = step("pv2-01-03", "c1");
    expect(concept.figure).toBe("pv4-ladder");
    expect(concept.body).toMatch(/ones, tens, hundreds, thousands, ten-thousands, hundred-thousands/i);
    expect(concept.body).toMatch(/5 × 1,000 = 5,000/i);
    expect(isFigureTextAligned(concept.figure!, concept.body ?? "")).toBe(true);
    const markup = renderToStaticMarkup(FIGURES[concept.figure!]());
    for (const label of ["ones", "tens", "hundreds", "thousands", "ten-thous.", "hund-thous."]) expect(markup).toContain(label);
    expect(markup).toContain('role="img"');
    expect(markup).toContain("place-value ladder climbing by tens");
  });

  it("uses the exact Grade 4 across-zero chain and states its arithmetic truth", () => {
    const concept = step("pv2-04-03", "c1");
    expect(concept.figure).toBe("pv4-borrow-chain");
    expect(concept.body).toMatch(/4,002 − 1,357 = 2,645/);
    expect(concept.body).toMatch(/tens and hundreds are both zero.*reaches the 4 thousands/i);
    expect(isFigureTextAligned(concept.figure!, concept.body ?? "")).toBe(true);
    const markup = renderToStaticMarkup(FIGURES[concept.figure!]());
    expect(markup).toContain("4,002");
    expect(markup).toContain("1,357");
    expect(markup).toContain("2,645");
    expect(markup).toContain('role="img"');
    expect(markup).toContain("chain of borrows in subtraction");
  });

  it("seals exactly the two current P0 source rows", () => {
    expect([
      "VIS-pv2-01-03-c1-pv4-periods",
      "VIS-pv2-04-03-c1-pv3-borrow-zero",
    ]).toHaveLength(2);
    expect(step("pv2-01-03", "c1").figure).not.toBe("pv4-periods");
    expect(step("pv2-04-03", "c1").figure).not.toBe("pv3-borrow-zero");
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
