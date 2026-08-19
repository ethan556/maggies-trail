import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

const dir = join(process.cwd(), "content/courses/sampling-and-probability/lessons");
const lessons = Object.fromEntries(
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8")) as { id: string; steps: Array<{ id: string; widget?: unknown }> };
      return [lesson.id, lesson];
    }),
);

function widget(lessonId: string, stepId: string) {
  const found = lessons[lessonId]!.steps.find((step) => step.id === stepId)?.widget;
  if (!found) throw new Error(`${lessonId}/${stepId} has no widget`);
  return found as { type: string; prompt: string; options?: Array<{ correct?: boolean }>; pairs?: Record<string, string>; answerNum?: number; answerDen?: number };
}

describe("S274 Sampling and Probability P0 source packet", () => {
  it("replaces the three repeated assessed sequences with distinct, evaluator-safe jobs", () => {
    expect(widget("sp-03-02", "ch1").type).toBe("matchPairs");
    expect(widget("sp-03-02", "ch1").pairs).toEqual({ experimental: "threeFifths", theoretical: "oneHalf", comparison: "oneTenthHigher" });

    expect(widget("sp-04-01", "i3").type).toBe("treeDiagram");
    expect(widget("sp-04-01", "k2").prompt).toMatch(/calculation counts every/i);
    expect(widget("sp-04-01", "k3").prompt).toMatch(/Why do 4 coin flips/i);
    expect(widget("sp-04-01", "ch1").type).toBe("matchPairs");

    expect(widget("sp-04-02", "i3").type).toBe("matchPairs");
    expect(widget("sp-04-02", "k3")).toMatchObject({ type: "fractionEntry", answerNum: 1, answerDen: 18 });
    expect(widget("sp-04-02", "ch1").prompt).toMatch(/multiple of 3/i);
  });

  it("keeps all revised MCQs single-correct and the complete course valid", () => {
    for (const [lessonId, stepId] of [["sp-04-01", "k2"], ["sp-04-01", "k3"], ["sp-04-02", "ch1"]] as const) {
      expect(widget(lessonId, stepId).options!.filter((option) => option.correct)).toHaveLength(1);
    }
    for (const lesson of Object.values(lessons)) {
      for (const step of lesson.steps) if (step.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${lesson.id}/${step.id}`).toEqual([]);
      }
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
