import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

const ROOT = join(process.cwd(), "content", "courses", "add-subtract-10-k", "lessons");
const LESSON_IDS = ["koa-02-01", "koa-02-02", "koa-02-03", "koa-02-04", "koa-02-05"] as const;

type Lesson = {
  id: string;
  steps: Array<{
    id: string;
    kind: string;
    figure?: string;
    widget?: Record<string, unknown> & { type?: string; prompt?: string };
    variant?: { form?: string };
  }>;
  remedials: Array<{ check: { widget: Record<string, unknown> & { prompt?: string } } }>;
};

const lessons = Object.fromEntries(LESSON_IDS.map((id) => [
  id,
  JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson,
]));

const normalizedPrompt = (prompt: string) => prompt
  .toLowerCase()
  .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
  .replace(/\s+/g, " ");

const repeatedTemplateIds = (lesson: Lesson) => {
  const widgets = lesson.steps.filter((step) => step.widget).map((step) => ({
    id: step.id,
    template: normalizedPrompt(String(step.widget?.prompt ?? "").trim()),
  }));
  return [...new Set(widgets.filter((item, index) => item.template &&
    widgets.findIndex((candidate) => candidate.template === item.template) !== index)
    .map((item) => item.id))];
};

const step = (lesson: Lesson, id: string) => lesson.steps.find((candidate) => candidate.id === id)!;

describe("S246 Kindergarten Chapter 2 progression and duplication packet", () => {
  it("closes the five queue-defined number-normalized repetition rows", () => {
    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId]!;
      expect(repeatedTemplateIds(lesson), lessonId).toEqual([]);
      for (const lessonStep of lesson.steps.filter((candidate) => candidate.widget)) {
        const parsed = WidgetSpec.parse(lessonStep.widget);
        expect(widgetIntegrityErrors(parsed), `${lessonId}/${lessonStep.id}`).toEqual([]);
      }
    }
  });

  it("preserves visual and causal hosts while assigning distinct question jobs", () => {
    const contract = {
      "koa-02-01": { figure: "koa-take-away-removal", k2: /cross out/i, k3: /Ava says/i, challenge: /birds/i },
      "koa-02-02": { figure: "koa-subtraction-cross-out", k2: /predict/i, k3: /Mina.*says/i, challenge: /cats/i },
      "koa-02-03": { figure: "koa-subtraction-act-out", k2: /stand.*sit down/i, k3: /Leo.*answers/i, challenge: /ducks/i },
      "koa-02-04": { figure: "koa-subtraction-sentence", k2: /picture.*crossed out/i, k3: /Nia.*writes/i, challenge: /counter.*hops back/i },
      "koa-02-05": { figure: "koa-count-back-left", k2: /fingers/i, k3: /Jo.*says/i, challenge: /kites/i },
    } as const;

    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId]!;
      const expected = contract[lessonId];
      expect(step(lesson, "c1").figure, `${lessonId}/c1 figure`).toBe(expected.figure);
      expect(step(lesson, "c2").figure, `${lessonId}/c2 figure`).toBe(expected.figure);
      expect(step(lesson, "i1").widget?.type, `${lessonId}/i1 causal host`).toBe("numberLineHop");
      expect(step(lesson, "i2").widget?.type, `${lessonId}/i2 causal host`).toBe("numberLineHop");
      expect(step(lesson, "k2").widget?.prompt, `${lessonId}/k2 action job`).toMatch(expected.k2);
      expect(step(lesson, "k3").widget?.prompt, `${lessonId}/k3 misconception job`).toMatch(expected.k3);
      const challenge = step(lesson, "ch1");
      expect(challenge.kind, `${lessonId}/challenge kind`).toBe("challenge");
      expect(challenge.widget?.type, `${lessonId}/challenge surface`).toBe("mcq");
      expect(challenge.widget?.prompt, `${lessonId}/challenge transfer`).toMatch(expected.challenge);
    }
  });

  it("uses a distinct, simpler remedial action instead of copying a lesson check", () => {
    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId]!;
      const primaryTemplates = new Set(lesson.steps
        .filter((candidate) => candidate.widget?.prompt)
        .map((candidate) => normalizedPrompt(String(candidate.widget!.prompt))));
      expect(lesson.remedials).toHaveLength(1);
      const remedial = lesson.remedials[0]!.check.widget;
      const parsed = WidgetSpec.parse(remedial);
      expect(widgetIntegrityErrors(parsed), `${lessonId}/remedial`).toEqual([]);
      expect(primaryTemplates.has(normalizedPrompt(String(remedial.prompt))), `${lessonId}/remedial copy`).toBe(false);
      expect(String(remedial.prompt), `${lessonId}/remedial action`).toMatch(/put|draw|set out|blocks|cover/i);
    }
  });
});
