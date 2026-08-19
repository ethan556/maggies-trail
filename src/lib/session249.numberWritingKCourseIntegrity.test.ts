import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
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

const lessonDir = join(process.cwd(), "content", "courses", "number-writing-k", "lessons");
const lessons = readdirSync(lessonDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(lessonDir, name), "utf8")) as RawLesson);

const normalizedPrompt = (prompt: string) =>
  prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const allSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter((step): step is RawStep => Boolean(step)),
  ),
];

describe("S249 number-writing-k whole-course repair", () => {
  it("keeps the exact 14-lesson portfolio schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("number-writing-k");
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("renders 28 unique, registered, accessible number-writing figures with no generic hop placeholder", () => {
    const figures: string[] = [];
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).toMatch(/^nwk-/);
        expect(concept.figure).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, concept.figure).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('data-number-writing-figure="true"');
        figures.push(concept.figure!);
      }
    }
    expect(figures).toHaveLength(28);
    expect(new Set(figures).size).toBe(28);
  });

  it("replaces every copied i2 with a different action and removes exact/normalized same-sitting prompts", () => {
    for (const lesson of lessons) {
      const i1 = lesson.steps.find((step) => step.id === "i1")!;
      const i2 = lesson.steps.find((step) => step.id === "i2")!;
      const w1 = WidgetSpec.parse(i1.widget);
      const w2 = WidgetSpec.parse(i2.widget);
      expect(`${w2.type}:${w2.prompt}`, lesson.id).not.toBe(`${w1.type}:${w1.prompt}`);

      const prompts = lesson.steps
        .filter((step) => step.widget)
        .map((step) => WidgetSpec.parse(step.widget).prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact prompt collision`).toBe(prompts.length);
      expect(new Set(prompts.map(normalizedPrompt)).size, `${lesson.id}: normalized prompt collision`).toBe(prompts.length);
    }
  });

  it("keeps all main MCQs evaluator-true, cue-resistant, and position-balanced", () => {
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type !== "mcq") continue;
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
        expect(new Set(widget.options.map((option) => option.label)).size).toBe(widget.options.length);
        expect(new Set(widget.options.map((option) => option.feedback)).size).toBe(widget.options.length);
        const lengths = widget.options.map((option) => option.label.length);
        expect(Math.max(...lengths) - Math.min(...lengths), `${lesson.id}/${step.id}`).toBeLessThanOrEqual(18);
        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
          expect(result.feedback).toBe(option.feedback);
        }
        const correctPositions = new Set<number>();
        for (let seed = 0; seed < 32; seed += 1) {
          const shuffled = seededShuffle(widget.options, `s249:${lesson.id}:${step.id}:${seed}`);
          correctPositions.add(shuffled.findIndex((option) => option.correct));
        }
        expect(correctPositions.size).toBe(widget.options.length);
      }
    }
  });
  it("pins every independently discovered place-value and flash-feedback truth repair", () => {
    const findWidget = (lessonId: string, stepId: string) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      expect(step?.widget, `${lessonId}/${stepId}`).toBeDefined();
      return WidgetSpec.parse(step!.widget);
    };

    const thirteen = findWidget("kcw-02-04", "k1");
    expect(thirteen.type).toBe("mcq");
    if (thirteen.type === "mcq") {
      expect(thirteen.options.find((option) => option.correct)?.label).toBe("3");
      expect(thirteen.options.map((option) => option.feedback).join(" ")).toContain("one full ten and 3 extra ones");
    }

    const twentyBuild = findWidget("kcw-02-05", "i1");
    expect(twentyBuild.type).toBe("baseTenCompose");
    if (twentyBuild.type === "baseTenCompose") expect(twentyBuild.target).toBe(20);

    const twentyZero = findWidget("kcw-02-05", "ch1");
    expect(twentyZero.type).toBe("mcq");
    if (twentyZero.type === "mcq") {
      expect(twentyZero.options.find((option) => option.correct)?.label).toBe("2 full tens and 0 extras");
    }

    const flashes = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => {
      if (!step.widget) return [];
      const widget = WidgetSpec.parse(step.widget);
      return widget.type === "subitizeFlash" ? [{ lessonId: lesson.id, stepId: step.id, widget }] : [];
    }));
    expect(flashes).toHaveLength(5);
    for (const { lessonId, stepId, widget } of flashes) {
      expect(widget.successFeedback, `${lessonId}/${stepId}`).toContain(String(widget.count));
      expect(widget.missFeedback, `${lessonId}/${stepId}`).toContain(String(widget.count));
    }
  });
});
