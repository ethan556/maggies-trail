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

const dir = join(process.cwd(), "content", "courses", "place-value", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

const retained = [
  ["pv-01-02", "c1", "pv3-expanded"],
  ["pv-01-02", "c2", "pv3-expanded"],
  ["pv-01-03", "c2", "pv3-compare"],
  ["pv-03-03", "c1", "pv3-borrow-zero"],
  ["pv-03-04", "c2", "pv3-round-hundred"],
  ["pv-04-03", "c1", "pv3-times-tens"],
] as const;
const withheld = [
  ["pv-02-04", "c2"],
  ["pv-03-01", "c2"],
  ["pv-04-03", "c2"],
] as const;
const sourceRows = [
  "VIS-pv-01-02-c1-pv3-expanded",
  "VIS-pv-01-02-c2-pv3-expanded",
  "VIS-pv-01-03-c2-pv3-compare",
  "VIS-pv-02-04-c2-pv3-round-ten",
  "VIS-pv-03-01-c2-pv3-jump",
  "VIS-pv-03-03-c1-pv3-borrow-zero",
  "VIS-pv-03-04-c2-pv3-round-hundred",
  "VIS-pv-04-03-c1-pv3-times-tens",
  "VIS-pv-04-03-c2-pv3-times-tens",
];

describe("S277 place-value disjoint P0 repair", () => {
  it("keeps all 15 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(15);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("place-value");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders all six retained fixed figures only beside synchronized text", () => {
    for (const [lessonId, stepId, figureId] of retained) {
      const concept = step(lessonId, stepId);
      expect(concept.figure, `${lessonId}/${stepId}`).toBe(figureId);
      expect(isFigureTextAligned(figureId, concept.body ?? ""), `${lessonId}/${stepId}`).toBe(true);
      const markup = renderToStaticMarkup(FIGURES[figureId]());
      expect(markup, figureId).toContain('role="img"');
      expect(markup, figureId).toContain("<title>");
      expect(markup, figureId).toContain("aria-label=");
    }
    expect(step("pv-01-02", "c1").body).toMatch(/342 = 300 \+ 40 \+ 2/);
    expect(step("pv-01-03", "c2").body).toMatch(/342 > 328.*4 tens > 2 tens/);
    expect(step("pv-03-03", "c1").body).toMatch(/305 − 128.*0 tens become 10 then 9/s);
    expect(step("pv-03-04", "c2").body).toMatch(/349 rounding to 300.*350/);
    expect(step("pv-04-03", "c1").body).toMatch(/4 × 60.*24 tens.*240/);
  });

  it("fails closed the three mismatched or instructionally irrelevant fixed visuals", () => {
    for (const [lessonId, stepId] of withheld) expect(step(lessonId, stepId).figure, `${lessonId}/${stepId}`).toBeUndefined();
    expect(step("pv-02-04", "c2").body).toMatch(/512 − 289.*500 − 300 = 200/);
    expect(step("pv-03-01", "c2").body).toMatch(/overshoot and repay.*356 \+ 99/s);
    expect(step("pv-04-03", "c2").body).toMatch(/Two-step stories/);
  });

  it("seals exactly nine owned P0 closures and excludes the dirty pv-03-02 row", () => {
    expect(sourceRows).toHaveLength(9);
    expect(new Set(sourceRows).size).toBe(9);
    expect(sourceRows.some((row) => row.includes("pv-03-02"))).toBe(false);
    expect(retained).toHaveLength(6);
    expect(withheld).toHaveLength(3);
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
