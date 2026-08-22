import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { authoredMathParts } from "./math/authoredMath";
import { renderMath } from "./math/renderMath";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: unknown;
};

type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const lessonDir = join(
  process.cwd(),
  "content",
  "courses",
  "geometry-g7",
  "lessons",
);

const lessons = readdirSync(lessonDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map(
    (name) =>
      JSON.parse(readFileSync(join(lessonDir, name), "utf8")) as RawLesson,
  );

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));

const allSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter(
      (step): step is RawStep => Boolean(step),
    ),
  ),
];

const normalizedPrompt = (prompt: string) =>
  prompt
    .toLowerCase()
    .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
    .replace(/\s+/g, " ")
    .trim();

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectStrings);
};

describe("S248 geometry-g7 whole-course integrity", () => {
  it("keeps all 21 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(21);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("geometry-g7");
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual(
          [],
        );
      }
    }
  });

  it("places two synchronized, registered semantic figures in every lesson", () => {
    let conceptCount = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      conceptCount += concepts.length;
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).toBeTruthy();
        expect(
          FIGURE_IDS.has(concept.figure!),
          `${lesson.id}/${concept.id}/${concept.figure}`,
        ).toBe(true);
        expect(concept.narration, `${lesson.id}/${concept.id}`).toBe(
          concept.body,
        );
      }
    }
    expect(conceptCount).toBe(42);

    const p0 = byId.get("g7-03-03")!.steps.find((step) => step.id === "c1")!;
    expect(p0.figure).toBe("g7-comp-supp");
    expect(p0.figure).not.toBe("angle-pairs");
  });

  it("removes same-sitting prompt repetition, including the triangle-condition cause", () => {
    for (const lesson of lessons) {
      const prompts = lesson.steps
        .filter((step) => step.widget)
        .map((step) =>
          String((step.widget as { prompt?: string }).prompt ?? "").trim(),
        );
      expect(new Set(prompts).size, lesson.id).toBe(prompts.length);
      expect(
        new Set(prompts.map(normalizedPrompt)).size,
        `${lesson.id}: number-normalized prompt collision`,
      ).toBe(prompts.length);
    }

    const diagnosis = byId
      .get("g7-03b-02")!
      .steps.find((step) => step.id === "k3")!;
    const widget = WidgetSpec.parse(diagnosis.widget);
    expect(widget.type).toBe("mcq");
    if (widget.type !== "mcq") throw new Error("Expected the k3 MCQ");
    expect(widget.prompt).toContain("Which diagnosis is correct?");
    expect(widget.options.find((option) => option.correct)?.label).toBe(
      "No triangle; the angles total 190°.",
    );
  });

  it("keeps every main MCQ cue-resistant, shuffled, and evaluator-true", () => {
    let count = 0;
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type !== "mcq") continue;
        count += 1;
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        expect(new Set(widget.options.map((option) => option.id)).size).toBe(
          widget.options.length,
        );
        expect(new Set(widget.options.map((option) => option.label)).size).toBe(
          widget.options.length,
        );
        expect(new Set(widget.options.map((option) => option.feedback)).size).toBe(
          widget.options.length,
        );

        const lengths = widget.options.map((option) => option.label.length);
        expect(
          Math.max(...lengths) - Math.min(...lengths),
          `${lesson.id}/${step.id}`,
        ).toBeLessThanOrEqual(15);

        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(
            option.correct,
          );
          expect(result.feedback).toBe(option.feedback);
        }

        const positions = new Set<number>();
        for (let index = 0; index < 32; index += 1) {
          const seed = `s248:${lesson.id}:${step.id}:${index}`;
          const first = seededShuffle(widget.options, seed);
          const second = seededShuffle(widget.options, seed);
          expect(first.map((option) => option.id)).toEqual(
            second.map((option) => option.id),
          );
          positions.add(first.findIndex((option) => option.correct));
        }
        expect([...positions].sort()).toEqual(
          widget.options.map((_, index) => index),
        );
      }
    }
    expect(count).toBe(30);
  });

  it("authors complete circle formulas as renderable KaTeX islands", () => {
    const mathLessons = ["g7-02-01", "g7-02-02", "g7-02-03", "g7-04-03"].map(
      (id) => byId.get(id)!,
    );
    const learnerText = JSON.stringify(mathLessons);
    expect(learnerText).not.toMatch(/πd|πr|\dπ|²/);
    expect(learnerText).toContain("C = π × d = 2 × π × r");
    expect(learnerText).toContain("A = π × r^2");

    for (const formula of [
      "C = π × d = 2 × π × r",
      "A = π × r^2",
      "π = C ÷ d ≈ 3.14",
    ]) {
      const math = authoredMathParts(formula, { includeArithmetic: true }).filter(
        (part): part is typeof part & { tex: string; source: string } =>
          Boolean(part.tex && part.source),
      );
      expect(math.map((part) => part.source)).toContain(formula);
    }

    let formulaCount = 0;
    for (const text of collectStrings(mathLessons)) {
      const math = authoredMathParts(text, { includeArithmetic: true }).filter(
        (part): part is typeof part & { tex: string; source: string } =>
          Boolean(part.tex && part.source),
      );
      for (const part of math) {
        expect(renderMath(part.tex, false).error, part.source).toBeNull();
        formulaCount += 1;
      }
    }
    expect(formulaCount).toBeGreaterThan(50);
  });

  it("uses sentence-case Grade 7 copy while preserving criterion acronyms", () => {
    const learnerText = JSON.stringify(lessons);
    const tokens = new Set(learnerText.match(/\b[A-Z]{2,}\b/g) ?? []);
    expect([...tokens].sort()).toEqual(["AAS", "ASA", "SAS", "SSA", "SSS"]);
    expect(learnerText).not.toContain("the teacher adds 0");
  });
});
