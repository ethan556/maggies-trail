// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";
import { isFigureTextAligned } from "@/lib/figureTextAlignment";

const ROOT = join(process.cwd(), "content", "courses", "add-subtract-1000-g2");
const course = JSON.parse(readFileSync(join(ROOT, "course.json"), "utf8"));
const lessonIds = course.chapters.flatMap((chapter: { lessonIds: string[] }) => chapter.lessonIds);
type McqOption = { id: string; correct: boolean; feedback: string };
type CourseWidget = { type: string; prompt: string; options?: McqOption[] };
type CourseStep = { id: string; kind: string; body: string; narration?: string; figure?: string; widget?: CourseWidget };
type CourseLesson = { id: string; steps: CourseStep[]; remedials: Array<{ concept: { figure?: string } }> };
type NumberLineWidget = CourseWidget & {
  type: "numberLineHop";
  start: number;
  direction: "forward" | "back";
  hop: number;
  hops: number;
  min: number;
  max: number;
  missFeedback: string;
  successFeedback: string;
};

const lessons: CourseLesson[] = lessonIds.map((id: string) => JSON.parse(readFileSync(join(ROOT, "lessons", `${id}.json`), "utf8")) as CourseLesson);

const expectedFigures: Record<string, string> = {
  "g2b-01-01": "skip-count-line",
  "g2b-01-02": "pv1000-decompose",
  "g2b-01-03": "pv1000-trade-ones",
  "g2b-01-04": "pv1000-cascade",
  "g2b-01-05": "pv1000-stadium",
  "g2b-02-01": "pv1000-decompose",
  "g2b-02-02": "pv1000-trade-down",
  "g2b-02-03": "pv1000-cascade-down",
  "g2b-02-05": "pv1000-skip-anywhere",
  "g2b-02-06": "skip-count-line",
  "g2b-03-01": "pv3-jump",
  "g2b-03-02": "pv1000-same-value",
  "g2b-03-03": "pv1000-trade-ones",
  "g2b-03-04": "pv1000-stadium",
  "g2b-03-05": "as100-name-tool",
};

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
const template = (prompt: string): string => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ");

// S287 replaced g2b-02-04's clipped Grade 3 borrow exemplar (pv3-borrow-zero, shared by both
// concepts and the remedial) with two distinct, grade-aligned trading diagrams: c1's first trade
// and c2/remedial's second trade (see src/lib/session287.addSubtract1000G2VisualRepair.test.ts,
// which independently verifies both bindings text-aligned and registered).
const splitConceptFigures: Record<string, [string, string]> = {
  "g2b-02-04": ["pv1000-cascade-down", "pv1000-trade-down"],
};

describe("S247 Grade 2 add/subtract within 1,000 course portfolio", () => {
  it("binds all concept and remedial moments to registered, visible semantic figures", () => {
    expect(lessons).toHaveLength(16);
    for (const lesson of lessons) {
      const split = splitConceptFigures[lesson.id];
      const expected = expectedFigures[lesson.id];
      const concepts = lesson.steps.filter((step: { kind: string }) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      const perConcept = split ?? [expected, expected];
      expect(concepts.map((step: { figure?: string }) => step.figure), lesson.id).toEqual(perConcept);
      expect(lesson.remedials[0].concept.figure, lesson.id).toBe(perConcept[1]);
      expect(concepts.every((step: { body: string }, index: number) => isFigureTextAligned(perConcept[index], step.body)), lesson.id).toBe(true);
      for (const figureId of new Set(perConcept)) {
        expect(FIGURE_IDS.has(figureId), lesson.id).toBe(true);
        const markup = renderToStaticMarkup(FIGURES[figureId]());
        expect(markup, figureId).toContain("<svg");
        expect(markup, figureId).toContain("<title>");
        expect(markup, figureId).toContain('role="img"');
      }
    }
  });

  it("gives every lesson distinct widget, exact-prompt, and normalized-prompt jobs", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((step) => step.widget).map((step) => ({
        id: step.id,
        signature: stable(step.widget),
        prompt: step.widget!.prompt.trim(),
        template: template(step.widget!.prompt.trim()),
      }));
      for (const field of ["signature", "prompt", "template"] as const) {
        expect(new Set(widgets.map((widget: { signature: string; prompt: string; template: string }) => widget[field])).size, `${lesson.id}:${field}`).toBe(widgets.length);
      }
    }
  });

  it("keeps every new number-line interaction mathematically synchronized", () => {
    const hops = lessons.flatMap((lesson) => lesson.steps
      .filter((step) => step.id === "i2" && step.widget?.type === "numberLineHop")
      .map((step) => ({ lessonId: lesson.id, ...(step.widget as NumberLineWidget) })));
    expect(hops).toHaveLength(5);
    for (const hop of hops) {
      const landing = hop.start + (hop.direction === "forward" ? 1 : -1) * hop.hop * hop.hops;
      expect(landing, hop.lessonId).toBeGreaterThanOrEqual(hop.min);
      expect(landing, hop.lessonId).toBeLessThanOrEqual(hop.max);
      expect(hop.missFeedback, hop.lessonId).toContain(String(landing));
      expect(hop.successFeedback, hop.lessonId).toContain(String(landing));
    }
  });

  it("keeps every MCQ singularly keyed with display-order-safe semantic IDs", () => {
    for (const lesson of lessons) {
      for (const step of lesson.steps.filter((candidate) => candidate.widget?.type === "mcq")) {
        const options = step.widget?.options ?? [];
        expect(options.filter((option) => option.correct), `${lesson.id}:${step.id}`).toHaveLength(1);
        expect(new Set(options.map((option) => option.id)).size, `${lesson.id}:${step.id}`).toBe(options.length);
        expect(options.every((option) => option.feedback.trim().length >= 20), `${lesson.id}:${step.id}`).toBe(true);
      }
    }
  });

  it("removes the reviewed Grade 2 language hazards from learner-facing JSON", () => {
    const corpus = lessons.map((lesson: unknown) => JSON.stringify(lesson)).join("\n");
    expect(corpus).not.toMatch(/count-on-hops|pay(?:s|ing)? (?:its|their) (?:bill|own)|sanity check|keeps the check honest|paper earns its keep|messy trades|one breath|\b1 ones\b|\b1 hundreds\b/i);
    for (const lesson of lessons) {
      for (const concept of lesson.steps.filter((step: { kind: string }) => step.kind === "concept")) {
        expect(concept.body, lesson.id).toBe(concept.narration);
        expect(concept.body.length, lesson.id).toBeLessThanOrEqual(110);
      }
    }
  });
});
