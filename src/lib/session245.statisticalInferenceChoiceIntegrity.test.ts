import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "si-01-01": ["ch1"],
  "si-01-02": ["ch1"],
  "si-01-03": ["k1", "k3", "ch1"],
  "si-04-03": ["k3", "ch1"],
  "si-05-01": ["k3", "ch1"],
  "si-05-03": ["k1", "ch1"],
} as const;

type Lesson = {
  steps: Array<{ id: string; widget?: unknown }>;
  remedials: Array<{ check: { id: string; widget?: unknown } }>;
};

const loadLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(),
  "content/courses/statistical-inference/lessons",
  `${lessonId}.json`,
), "utf8")) as Lesson;

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, stepIds]) => {
  const lesson = loadLesson(lessonId);
  const steps = [...lesson.steps, ...lesson.remedials.map((route) => route.check)];
  return stepIds.map((stepId) => {
    const step = steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget };
  });
});

describe("S245 statistical-inference choice-surface integrity", () => {
  it("removes all eleven answer-explains-itself and length tells", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: unique truth`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.id)).size, `${key}: stable IDs`).toBe(4);
      expect(new Set(widget.options.map((option) => option.label.trim().toLowerCase())).size, `${key}: distinct choices`).toBe(4);
      const correct = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const wrongMean = wrong.reduce((sum, option) => sum + option.label.length, 0) / wrong.length;
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      expect(correct.label, `${key}: reasoning belongs in feedback`).not.toMatch(/—|\bbecause\b|\bbut\b|\bso\b/i);
      expect(correct.label.length, `${key}: no keyed length tell`).toBeLessThanOrEqual(maxWrong + 15);
      expect(Math.max(...lengths) - Math.min(...lengths), `${key}: option parity`).toBeLessThanOrEqual(13);
      return {
        spread: Math.max(...lengths) - Math.min(...lengths),
        skew: Math.abs(correct.label.length - wrongMean),
        queueLeak: correct.label.length > maxWrong * 1.5 && correct.label.length - maxWrong >= 12,
      };
    });
    const metrics = {
      rows: rows.length,
      leakingRows: rows.filter((row) => row.queueLeak).length,
      meanSpread: rows.reduce((sum, row) => sum + row.spread, 0) / rows.length,
      maxSpread: Math.max(...rows.map((row) => row.spread)),
      meanCorrectSkew: rows.reduce((sum, row) => sum + row.skew, 0) / rows.length,
      maxCorrectSkew: Math.max(...rows.map((row) => row.skew)),
    };
    expect(metrics.rows).toBe(11);
    expect(metrics.leakingRows).toBe(0);
    expect(metrics.meanSpread).toBeCloseTo(87 / 11, 12);
    expect(metrics.maxSpread).toBe(13);
    expect(metrics.meanCorrectSkew).toBeCloseTo(49 / 11, 12);
    expect(metrics.maxCorrectSkew).toBeCloseTo(37 / 3, 12);
    expect(metrics.meanSpread).toBeLessThan(65); // measured pre-repair baseline
    expect(metrics.meanCorrectSkew).toBeLessThan(640 / 11); // measured pre-repair baseline
  });

  it("keeps every misconception diagnosis truthful after stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size, `${key}: distinct diagnoses`).toBe(4);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful diagnosis`).toBeGreaterThan(55);
        expect(option.feedback, `${key}/${option.id}: no generic retry copy`).not.toMatch(/^\s*(incorrect|try again|not quite)[.!]?\s*$/i);
        const result = evaluate(widget, option.id);
        expect(result.correct, `${key}/${option.id}: evaluator truth`).toBe(option.correct);
        expect(result.feedback, `${key}/${option.id}: feedback truth`).toBe(option.feedback);
      }
      const ids = widget.options.map((option) => option.id).sort();
      const order = (seed: string) => seededShuffle(widget.options, seed).map((option) => option.id);
      expect(order(`s245:${key}`)).toEqual(order(`s245:${key}`));
      expect([...order(`s245:${key}`)].sort()).toEqual(ids);
      expect(new Set(Array.from({ length: 8 }, (_, index) => order(`s245:${key}:${index}`).join("|"))).size).toBeGreaterThan(1);
    }
  });
});
