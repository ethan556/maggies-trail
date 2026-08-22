import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Widget = {
  type: string;
  prompt?: string;

  min?: number;
  max?: number;
  start?: number;
  hop?: number;
  hops?: number;
  direction?: "forward" | "back";
  target?: number[] | number;
  successFeedback?: string;
  commonLandings?: { value: number; feedback: string }[];
};
type Step = { id: string; figure?: string; body?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };

const dir = "content/courses/long-division-g5/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Lesson);
const expectedIds = ["g5l-01-01", "g5l-01-02", "g5l-02-01", "g5l-02-02", "g5l-03-01", "g5l-03-02"];
const exactFigures = new Map([["g5l-01-01/c2", "dop-estimate-quotient"], ["g5l-02-02/c1", "dop-long-division"]]);
const expectedI2Prompts = new Map([
  ["g5l-01-01", "714 ÷ 21"], ["g5l-01-02", "40s fit in 360"], ["g5l-02-01", "672 ÷ 28"],
  ["g5l-02-02", "756 by 27"], ["g5l-03-01", "subtracting 104 from the 119"], ["g5l-03-02", "Quotient 18, divisor 27, remainder 13"]
]);

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`missing ${lesson.id}/${id}`);
  return found;
}

function slider(widget: Widget | undefined): asserts widget is Widget & { type: "estimateSlider"; target: number; min: number; max: number } {
  expect(widget?.type).toBe("estimateSlider");
  if (typeof widget?.target !== "number" || widget.min === undefined || widget.max === undefined) throw new Error("incomplete estimate slider");
  expect(widget.target).toBeGreaterThanOrEqual(widget.min);
  expect(widget.target).toBeLessThanOrEqual(widget.max);
}

describe("S265 long-division-g5 source implementation", () => {
  it("covers the clean six-lesson course", () => {
    expect(files).toHaveLength(6);
    expect(lessons.map((lesson) => lesson.id)).toEqual(expectedIds);
  });

  it("removes all fixed 4 + 3 = 7 mismatches and retains only exact generic division figures", () => {
    let removed = 0;
    let rebound = 0;
    for (const lesson of lessons) for (const id of ["c1", "c2"]) {
      const concept = step(lesson, id);
      const key = `${lesson.id}/${id}`;
      expect(concept.figure).not.toBe("count-on-hops");
      if (exactFigures.has(key)) {
        expect(concept.figure).toBe(exactFigures.get(key));
        rebound += 1;
      } else {
        expect(concept.figure).toBeUndefined();
        removed += 1;
      }
    }
    expect(removed).toBe(10);
    expect(rebound).toBe(2);
  });

  it("keeps each surviving figure registered", () => {
    for (const lesson of lessons) for (const item of lesson.steps) if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
  });

  it("turns every duplicate second interaction into a distinct evaluator-preserving transfer", () => {
    for (const lesson of lessons) {
      const i1 = step(lesson, "i1");
      const i2 = step(lesson, "i2");
      expect(i2.widget?.type).toBe(i1.widget?.type);
      expect(i2.body).not.toBe("Try it again.");
      expect(i2.widget?.prompt).not.toBe(i1.widget?.prompt);
      expect(i2.widget?.prompt).toContain(expectedI2Prompts.get(lesson.id));
    }
  });

  it("keeps all six repaired evaluator targets mathematically coherent", () => {
    const compatible = step(lessons[0], "i2").widget;
    slider(compatible);
    expect(compatible.target).toBe(714 / 21);

    const tens = step(lessons[1], "i2").widget;
    expect(tens?.type).toBe("numberLineHop");
    const tensLanding = (tens?.start ?? 0) + (tens?.hop ?? 0) * (tens?.hops ?? 0);
    expect(tensLanding).toBe(360);
    expect(tens?.successFeedback).toContain("360");

    const partial = step(lessons[2], "i2").widget;
    expect(partial?.type).toBe("barBuilder");
    const partialTarget = partial?.target;
    if (!Array.isArray(partialTarget)) throw new Error("missing partial quotient targets");
    expect(partialTarget).toEqual([20, 4, 24]);
    expect(28 * partialTarget[2]).toBe(672);

    const standard = step(lessons[3], "i2").widget;
    slider(standard);
    expect(standard.target).toBe(20);

    const adjustment = step(lessons[4], "i2").widget;
    slider(adjustment);
    /* PROGRESSION-g5l-03-01 (laneA-s318-prog.jsonl): i2 redesigned to ask for the REMAINDER after
     * the corrected digit (119 − 4×26 = 15), not i1's corrected-product job. Remainder must stay
     * below the 26 divisor — the lesson's "never a negative remainder" teaching point. */
    expect(adjustment.target).toBe(119 - 4 * 26);
    expect(adjustment.target).toBeLessThan(26);

    const check = step(lessons[5], "i2").widget;
    slider(check);
    expect(check.target).toBe(18 * 27 + 13);
    expect(13).toBeLessThan(27);
  });

  it("keeps every number-line alternative inside its declared range", () => {
    const widget = step(lessons[1], "i2").widget;
    if (widget?.type !== "numberLineHop") throw new Error("expected numberLineHop");
    const landing = (widget.start ?? 0) + (widget.hop ?? 0) * (widget.hops ?? 0);
    expect(landing).toBeGreaterThanOrEqual(widget.min ?? Number.POSITIVE_INFINITY);
    expect(landing).toBeLessThanOrEqual(widget.max ?? Number.NEGATIVE_INFINITY);
    for (const common of widget.commonLandings ?? []) {
      expect(common.value).toBeGreaterThanOrEqual(widget.min ?? Number.POSITIVE_INFINITY);
      expect(common.value).toBeLessThanOrEqual(widget.max ?? Number.NEGATIVE_INFINITY);
      expect(common.value).not.toBe(landing);
      expect(common.feedback.length).toBeGreaterThan(24);
    }
  });
});
