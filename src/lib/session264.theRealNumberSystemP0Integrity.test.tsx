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

const dir = join(process.cwd(), "content", "courses", "the-real-number-system", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

const p0Rows = new Set([
  "VIS-rns-01-03-c1-rns-convert-repeating",
  "VIS-rns-01-03-c2-rns-convert-repeating",
  "PROGRESSION-rns-03-03",
]);

describe("S264 the-real-number-system bounded P0 repair", () => {
  it("keeps all 9 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(9);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("the-real-number-system");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders both repeating-decimal placements with exact visible and accessible parity", () => {
    for (const id of ["c1", "c2"]) {
      const concept = step("rns-01-03", id);
      expect(concept.figure).toBe("rns-convert-repeating");
      expect(concept.body).toContain("0.45 repeating = 45/99 = 5/11");
      expect(isFigureTextAligned(concept.figure!, concept.body ?? ""), id).toBe(true);
    }
    const Figure = FIGURES["rns-convert-repeating"];
    expect(Figure).toBeDefined();
    const markup = renderToStaticMarkup(Figure());
    expect(markup).toContain("0.45 repeating = 45/99 = 5/11.");
    expect(markup).toContain('role="img"');
    expect(markup).toContain("Converting a repeating decimal to a fraction");
  });

  it("gives the challenge a distinct interval-bracketing job without changing its evaluator truth", () => {
    const lesson = byId["rns-03-03"]!;
    const challenge = step("rns-03-03", "ch1");
    expect(challenge.body).toBe("Bracket 3 with nearby rational and irrational values.");
    expect(challenge.widget?.prompt).toMatch(/interval chain that brackets 3/i);
    const otherPrompts = lesson.steps.filter((candidate) => candidate.id !== "ch1" && candidate.widget)
      .map((candidate) => candidate.widget!.prompt);
    expect(otherPrompts).not.toContain(challenge.widget?.prompt);
    const widget = WidgetSpec.parse(challenge.widget);
    expect(widget.type).toBe("dragOrder");
    if (widget.type === "dragOrder") {
      expect(widget.correctOrder).toEqual(["sqrt8", "twoNine", "three", "sqrt10"]);
      expect(evaluate(widget, widget.correctOrder)).toEqual({ correct: true, feedback: widget.successFeedback });
      expect(evaluate(widget, ["twoNine", "sqrt8", "three", "sqrt10"]).correct).toBe(false);
    }
  });

  it("seals exactly the three current source-compatible P0 rows", () => {
    expect([...p0Rows].sort()).toEqual([
      "PROGRESSION-rns-03-03",
      "VIS-rns-01-03-c1-rns-convert-repeating",
      "VIS-rns-01-03-c2-rns-convert-repeating",
    ]);
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
