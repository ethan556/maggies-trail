import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: Record<string, unknown>;
  variant?: unknown;
  explanationVariants?: string[];
};
type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ conceptTag: string; concept: RawStep; check: RawStep }>;
};

const dir = join(process.cwd(), "content", "courses", "counting-to-20-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;
const route = (lessonId: string, conceptTag: string) => byId[lessonId]!.remedials!.find((candidate) => candidate.conceptTag === conceptTag)!;

const p0Rows = new Set([
  "VIS-kc-02-02-c1-number-track",
  "VIS-kc-04-03-rem-kc0403-c-bar-part-whole",
  "EXCELLENCE-kc-01-01",
  "EXCELLENCE-kc-04-03",
  "PROGRESSION-kc-02-03",
]);

describe("S263 counting-to-20-k bounded P0 repair", () => {
  it("keeps all 13 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(13);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("counting-to-20-k");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders both queued replacements and the additional truth repair with accessible semantic parity", () => {
    const placements: Array<[string, RawStep, string]> = [
      ["kc-02-02/c1", step("kc-02-02", "c1"), "kc-fewer"],
      ["kc-04-03/rem-kc0403-c", route("kc-04-03", "kc-decompose").concept, "kc-break-apart"],
      ["kc-04-03/c1", step("kc-04-03", "c1"), "koa-join-two-groups"],
    ];
    for (const [placement, concept, figureId] of placements) {
      expect(concept.figure, placement).toBe(figureId);
      expect(concept.body, placement).toBe(concept.narration);
      expect(isFigureTextAligned(figureId, `${concept.body ?? ""} ${concept.narration ?? ""}`), placement).toBe(true);
      const Figure = FIGURES[figureId];
      expect(Figure, `${placement}/${figureId}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup, placement).toContain("<title>");
      expect(markup, placement).toContain('role="img"');
    }
  });

  it("replaces repeated challenge forms with authored conservation and transformation jobs", () => {
    const conservation = step("kc-01-01", "ch1");
    expect(conservation.widget?.type).toBe("subitizeFlash");
    expect(conservation.variant).toBeUndefined();
    expect(conservation.body).toBe("Predict without recounting.");
    expect(conservation.widget?.prompt).toMatch(/only moved.*Without adding or removing/i);
    expect(conservation.explanationVariants?.join(" ")).toMatch(/count stays 6|amount did not/i);

    const transformation = step("kc-04-03", "ch1");
    expect(transformation.widget?.type).toBe("mcq");
    expect(transformation.variant).toBeUndefined();
    expect(transformation.body).toBe("Move one, keep the whole.");
    expect(transformation.widget?.prompt).toMatch(/from the 5-part to the 2-part/i);
    const widget = WidgetSpec.parse(transformation.widget);
    expect(widget.type).toBe("mcq");
    if (widget.type === "mcq") {
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
      for (const option of widget.options) {
        expect(evaluate(widget, option.id).correct, option.id).toBe(option.correct);
      }
    }
  });

  it("gives the repeated ordering check an explicit zero-boundary job", () => {
    const boundary = step("kc-02-03", "k3");
    expect(boundary.body).toBe("Use zero as the boundary.");
    expect(boundary.widget?.prompt).toBe("Drag 0, 3, and 8 into order. Start with the number that means none.");
    const otherPrompts = byId["kc-02-03"]!.steps
      .filter((candidate) => candidate.id !== "k3" && candidate.widget)
      .map((candidate) => candidate.widget!.prompt);
    expect(otherPrompts).not.toContain(boundary.widget?.prompt);
    expect(boundary.widget?.correctOrder).toEqual(["n2", "n3", "n1"]);
  });

  it("removes the two fixed-exemplar contradictions and seals all five source-compatible P0 rows", () => {
    expect(p0Rows.size).toBe(5);
    expect(step("kc-02-02", "c1").figure).not.toBe("number-track");
    expect(step("kc-04-03", "c1").figure).not.toBe("bar-part-whole");
    expect(route("kc-04-03", "kc-decompose").concept.figure).not.toBe("bar-part-whole");
    expect(step("kc-02-02", "c1").body).toMatch(/3 mats.*5 cats.*fewer.*greater/i);
    expect(step("kc-04-03", "c1").body).toMatch(/2 blue counters.*3 orange counters.*make 5/i);
    expect(route("kc-04-03", "kc-decompose").concept.body).toMatch(/5 and 1.*4 and 2.*3 and 3.*makes 6/i);
  });

  it("preserves all course MCQ evaluator and feedback contracts", () => {
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
