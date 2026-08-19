import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Choice = { id: string; label: string; correct: boolean; feedback: string };
type Widget = {
  type: string;
  prompt?: string;
  options?: Choice[];
  hotspots?: { id: string; label: string; correct?: boolean; feedback?: string }[];
  targetArea?: number;
  requireFactors?: { w: number; h: number };
  min?: number; max?: number; start?: number; hop?: number; hops?: number; direction?: "forward" | "back";
  answer?: number; successFeedback?: string; missFeedback?: string;
};
type Step = { id: string; kind?: string; figure?: string; body?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[]; remedials?: { concept?: Step; check?: Step }[] };

const dir = "content/courses/patterns-factors-g4/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Lesson);
const expectedIds = ["g4p-01-01", "g4p-01-02", "g4p-01-03", "g4p-01-04", "g4p-02-01", "g4p-02-02", "g4p-03-01", "g4p-03-02", "g4p-03-03", "g4p-03-04"];
const expectedI2Prompts = new Map([
  ["g4p-01-01", "area 36"], ["g4p-01-02", "Test 30"], ["g4p-01-03", "Count by 7s"], ["g4p-01-04", "54"], ["g4p-02-01", "21 is composite"],
  ["g4p-02-02", "multiples-of-5"], ["g4p-03-01", "5, 10, 20, 40"], ["g4p-03-02", "4 squares, then 8"], ["g4p-03-03", "add 5"], ["g4p-03-04", "from 3"]
]);
const progressionChecks = new Map([
  ["g4p-01-01/ch1", "How many factor pairs does 24"], ["g4p-01-02/ch1", "Which multiplication proves"], ["g4p-01-03/ch1", "42 is a multiple"],
  ["g4p-02-02/k3", "why can 7 remain"], ["g4p-03-01/ch1", "fourth term"], ["g4p-03-02/ch1", "step 6"],
  ["g4p-03-03/ch1", "add 5"], ["g4p-03-04/ch1", "step 6"]
]);

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`missing ${lesson.id}/${id}`);
  return found;
}

function assertMcq(widget: Widget | undefined): asserts widget is Widget & { type: "mcq"; options: Choice[] } {
  expect(widget?.type).toBe("mcq");
  const options = widget?.options ?? [];
  expect(options.length).toBeGreaterThanOrEqual(2);
  expect(options.map((option) => option.id)).toEqual(options.map((_, index) => `o${index}`));
  expect(options.filter((option) => option.correct)).toHaveLength(1);
  expect(options.find((option) => option.correct)?.id).toBe("o0");
  expect(new Set(options.map((option) => option.label)).size).toBe(options.length);
  for (const option of options) expect(option.feedback.length).toBeGreaterThan(24);
}

describe("S264 patterns-factors-g4 source implementation", () => {
  it("covers the complete clean ten-lesson course", () => {
    expect(files).toHaveLength(10);
    expect(lessons.map((lesson) => lesson.id)).toEqual(expectedIds);
  });

  it("removes every fixed 4 + 3 = 7 mismatch and retains only the exact prime/composite figure", () => {
    let removed = 0;
    let rebound = 0;
    for (const lesson of lessons) for (const id of ["c1", "c2"]) {
      const concept = step(lesson, id);
      expect(concept.figure).not.toBe("count-on-hops");
      if (concept.figure === "mb-prime-composite") {
        expect(`${lesson.id}/${id}`).toBe("g4p-02-01/c1");
        rebound += 1;
      } else {
        expect(concept.figure).toBeUndefined();
        removed += 1;
      }
    }
    expect(removed).toBe(19);
    expect(rebound).toBe(1);
  });

  it("keeps all surviving figures registered", () => {
    for (const lesson of lessons) for (const item of lesson.steps) if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
  });

  it("turns every second interaction into a distinct, evaluator-safe transfer job", () => {
    expect(expectedI2Prompts.size).toBe(10);
    for (const lesson of lessons) {
      const i1 = step(lesson, "i1");
      const i2 = step(lesson, "i2");
      expect(i2.widget?.type).toBe(i1.widget?.type);
      expect(i2.body).not.toBe("Try it again.");
      expect(i2.widget?.prompt).not.toBe(i1.widget?.prompt);
      expect(i2.widget?.prompt).toContain(expectedI2Prompts.get(lesson.id));
      if (i2.widget?.type === "areaModel") {
        const factors = i2.widget.requireFactors;
        if (!factors) throw new Error(`${lesson.id}/i2: missing factor contract`);
        expect(i2.widget.targetArea).toBe(factors.w * factors.h);
      }
      if (i2.widget?.type === "numberLineHop") {
        const delta = (i2.widget.direction === "back" ? -1 : 1) * (i2.widget.hop ?? 0) * (i2.widget.hops ?? 0);
        const landing = (i2.widget.start ?? 0) + delta;
        expect(landing).toBeGreaterThanOrEqual(i2.widget.min ?? Number.POSITIVE_INFINITY);
        expect(landing).toBeLessThanOrEqual(i2.widget.max ?? Number.NEGATIVE_INFINITY);
        expect(i2.widget.successFeedback).toContain(String(landing));
      }
      if (i2.widget?.type === "tapDiagram") {
        const correct = i2.widget.hotspots?.filter((hotspot) => hotspot.correct) ?? [];
        expect(correct).toHaveLength(2);
        expect(i2.widget.successFeedback).not.toMatch(/Fourths|Bars A and D/);
        expect(i2.widget.missFeedback).not.toMatch(/Fourths|Bars A and D/);
      }
    }
  });

  it("repairs every repeated progression-check surface while preserving evaluator and option contracts", () => {
    for (const [key, phrase] of progressionChecks) {
      const [lessonId, stepId] = key.split("/");
      const lesson = lessons.find((item) => item.id === lessonId);
      if (!lesson) throw new Error(`missing ${lessonId}`);
      const checked = step(lesson, stepId);
      expect(checked.widget?.prompt).toContain(phrase);
      if (checked.widget?.type === "mcq") assertMcq(checked.widget);
      if (checked.widget?.type === "numeric") {
        expect(Number.isFinite(checked.widget.answer)).toBe(true);
        expect(checked.widget.successFeedback).toContain(String(checked.widget.answer));
      }
    }
  });

  it("has no misleading fractional-bar feedback and keeps all authored MCQs unambiguous", () => {
    for (const lesson of lessons) for (const item of lesson.steps) {
      const widget = item.widget;
      if (widget?.type === "tapDiagram") {
        expect(widget.successFeedback).not.toMatch(/Fourths|Bars A and D/);
        expect(widget.missFeedback).not.toMatch(/Fourths|Bars A and D/);
      }
      if (widget?.type === "mcq") assertMcq(widget);
    }
  });
});
