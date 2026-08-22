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

const dir = join(process.cwd(), "content", "courses", "similarity", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

describe("S274 similarity bounded P0 repair", () => {
  it("keeps all 16 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(16);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("similarity");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders both repaired placements with exact diagram/body/accessibility parity", () => {
    const placements: Array<[string, RawStep]> = [
      ["sy-04-01/c1", step("sy-04-01", "c1")],
      ["sy-04-03/c2", step("sy-04-03", "c2")],
    ];
    for (const [placement, concept] of placements) {
      expect(concept.figure, placement).toBe("geometric-mean");
      expect(concept.body, placement).toMatch(/segments (?:are )?4 and 9|segments 4 and 9/i);
      expect(concept.body, placement).toMatch(/h = (?:√\(4·9\) = )?6/i);
      expect(isFigureTextAligned(concept.figure!, concept.body ?? ""), placement).toBe(true);
    }
    const Figure = FIGURES["geometric-mean"];
    expect(Figure).toBeDefined();
    const markup = renderToStaticMarkup(Figure());
    expect(markup).toContain("h = √(4·9) = 6");
    expect(markup).toContain('role="img"');
    expect(markup).toContain("segments of length four and nine");
  });

  it("keeps the two visual jobs mathematically distinct", () => {
    expect(step("sy-04-01", "c1").body).toMatch(/shares one acute angle.*AA.*similar/i);
    expect(step("sy-04-03", "c2").body).toMatch(/altitude uses the two segments.*leg uses the whole hypotenuse/i);
  });

  it("seals exactly the two current P0 source rows", () => {
    expect([
      "VIS-sy-04-01-c1-geometric-mean",
      "VIS-sy-04-03-c2-geometric-mean",
    ]).toHaveLength(2);
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
