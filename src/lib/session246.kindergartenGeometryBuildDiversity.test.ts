import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";

type Option = { id: string; label: string; correct: boolean };
type Widget = { type: string; prompt: string; options?: Option[] };
type Step = { id: string; kind: string; conceptTag?: string; widget?: Widget };
type Remedial = { conceptTag: string; check: Step & { widget: Widget } };
type Lesson = { id: string; readingProfile: string; steps: Step[]; remedials?: Remedial[] };

const LESSON_DIR = join(process.cwd(), "content/courses/shapes-build-k/lessons");
const lessons = readdirSync(LESSON_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(LESSON_DIR, file), "utf8")) as Lesson);

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const widgetsFor = (lesson: Lesson) => [
  ...lesson.steps.flatMap((step) => step.widget ? [{ lessonId: lesson.id, step, scope: "main" }] : []),
  ...(lesson.remedials ?? []).map((route) => ({ lessonId: lesson.id, step: route.check, scope: "remedial" })),
];

describe("S246 Kindergarten geometry-build diversity packet", () => {
  it("covers the complete 14-lesson early-reading family", () => {
    expect(lessons).toHaveLength(14);
    expect(lessons.every((lesson) => lesson.readingProfile === "early")).toBe(true);
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      "kgb-01-01", "kgb-01-02", "kgb-01-03", "kgb-01-04", "kgb-01-05",
      "kgb-02-01", "kgb-02-02", "kgb-02-03", "kgb-02-04", "kgb-02-05",
      "kgb-03-01", "kgb-03-02", "kgb-03-03", "kgb-03-04",
    ]);
  });

  it("has no exact prompt repeats across main, challenge, or remedial work", () => {
    const rows = lessons.flatMap(widgetsFor);
    expect(rows).toHaveLength(98);
    const byPrompt = new Map<string, string[]>();
    for (const row of rows) {
      const key = normalized(row.step.widget!.prompt);
      byPrompt.set(key, [...(byPrompt.get(key) ?? []), `${row.lessonId}/${row.step.id}/${row.scope}`]);
    }
    const duplicates = [...byPrompt.entries()].filter(([, placements]) => placements.length > 1);
    expect(duplicates).toEqual([]);
  });

  it("closes the reported authored-MCQ family from 9 clusters and 24 placements to zero", () => {
    const prompts = lessons.flatMap((lesson) => lesson.steps.flatMap((step) =>
      step.widget?.type === "mcq" ? [normalized(step.widget.prompt)] : [],
    ));
    const counts = new Map<string, number>();
    for (const prompt of prompts) counts.set(prompt, (counts.get(prompt) ?? 0) + 1);
    const duplicateCounts = [...counts.values()].filter((count) => count > 1);
    expect(duplicateCounts).toEqual([]);
    expect(duplicateCounts.reduce((sum, count) => sum + count, 0)).toBe(0);
  });

  it("uses a different visual or manipulative action for the second try", () => {
    for (const lesson of lessons) {
      const interactives = lesson.steps.filter((step) => step.kind === "interactive");
      expect(interactives, `${lesson.id}: two interactive tries`).toHaveLength(2);
      expect(normalized(interactives[1].widget!.prompt), `${lesson.id}: copied second try`)
        .not.toBe(normalized(interactives[0].widget!.prompt));
      expect(new Set(lesson.steps.flatMap((step) => step.widget ? [step.widget.type] : [])).size,
        `${lesson.id}: representation variety`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps remedials and challenges as new forms rather than answer-rehearsal copies", () => {
    for (const lesson of lessons) {
      const mainPrompts = new Set(lesson.steps.flatMap((step) => step.widget ? [normalized(step.widget.prompt)] : []));
      for (const route of lesson.remedials ?? []) {
        expect(mainPrompts.has(normalized(route.check.widget.prompt)), `${lesson.id}: copied remedial`).toBe(false);
        expect(route.check.conceptTag, `${lesson.id}: remedial concept`).toBe(route.conceptTag);
      }
      const challenge = lesson.steps.find((step) => step.kind === "challenge");
      const checkPrompts = new Set(lesson.steps
        .filter((step) => step.kind === "check" && step.widget)
        .map((step) => normalized(step.widget!.prompt)));
      expect(challenge?.widget, `${lesson.id}: challenge widget`).toBeDefined();
      expect(checkPrompts.has(normalized(challenge!.widget!.prompt)), `${lesson.id}: copied challenge`).toBe(false);
    }
  });

  it("keeps stems natural and every choice surface structurally truthful", () => {
    for (const lesson of lessons) {
      for (const { step } of widgetsFor(lesson)) {
        const prompt = step.widget!.prompt;
        expect(prompt, `${lesson.id}/${step.id}: unnatural stem`).not.toMatch(
          /teacher adds 0|one more, for the road|what features decide|which statement best|select all that apply/i,
        );
        const parsed = WidgetSpec.parse(step.widget) as TWidget;
        expect(widgetIntegrityErrors(parsed), `${lesson.id}/${step.id}: widget truth`).toEqual([]);
        if (step.widget!.type === "mcq") {
          const options = step.widget!.options ?? [];
          expect(options).toHaveLength(4);
          expect(options.filter((option) => option.correct), `${lesson.id}/${step.id}: unique answer`).toHaveLength(1);
          expect(new Set(options.map((option) => normalized(option.label))).size,
            `${lesson.id}/${step.id}: distinct choices`).toBe(4);
        }
      }
    }
  });
});
