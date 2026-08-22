import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "sg-01-01": ["k1", "k2", "i2"],
  "sg-01-02": ["i2"],
  "sg-01-03": ["k1", "k3", "i2"],
  "sg-02-01": ["k1"],
  "sg-02-02": ["k3", "i2"],
  "sg-02-03": ["k1", "k2", "k3"],
  "sg-03-01": ["k2", "i2"],
  "sg-03-02": ["k2", "i2"],
  "sg-03-03": ["i1"],
  "sg-04-01": ["i1"],
  "sg-05-02": ["k3", "i2"],
  "sg-05-03": ["k3"],
} as const;

type Lesson = {
  steps: Array<{ id: string; widget?: unknown }>;
  remedials: Array<{ check: { id: string; widget?: unknown } }>;
};

const loadLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(),
  "content/courses/solid-geometry/lessons",
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

describe("S245 solid-geometry choice-surface integrity", () => {
  it("keeps seam continuity separate from additive component volume", () => {
    const lesson = loadLesson("sg-04-01");
    const step = lesson.steps.find((candidate) => candidate.id === "i1");
    const widget = WidgetSpec.parse(step?.widget);
    expect(widget.type).toBe("mcq");
    if (widget.type !== "mcq") throw new Error("Wrong widget at sg-04-01/i1");

    const correct = widget.options.find((option) => option.correct);
    expect(correct?.label).toBe("To make one continuous circular seam.");
    expect(correct?.feedback).toMatch(/volumes would still add if the radii differed/i);
    expect(widget.options.find((option) => option.id === "o3")?.feedback).toMatch(
      /volumes add whether or not the radii match.*ledge at the join/i,
    );
    expect(widget.options.map((option) => option.feedback).join(" ")).not.toMatch(
      /extra terms|gap or overlap accounting|misprices/i,
    );
  });

  it("closes all twenty-two live-queue length leaks without answer rationales", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: unique truth`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.id)).size, `${key}: stable IDs`).toBe(4);
      expect(new Set(widget.options.map((option) => option.label.trim().toLowerCase())).size, `${key}: distinct choices`).toBe(4);
      const correct = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      const wrongMean = wrong.reduce((sum, option) => sum + option.label.length, 0) / wrong.length;
      expect(correct.label, `${key}: rationale belongs in feedback`).not.toMatch(/—|\bbecause\b|\bsince\b|\bso that\b|\bwhich means\b|\bas a result\b|\btherefore\b/i);
      expect(Math.max(...lengths) - Math.min(...lengths), `${key}: option parity`).toBeLessThanOrEqual(20);
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
    expect(metrics.rows).toBe(22);
    expect(metrics.leakingRows).toBe(0);
    expect(metrics.meanSpread).toBeCloseTo(205 / 22, 12);
    expect(metrics.maxSpread).toBe(20);
    expect(metrics.meanCorrectSkew).toBeCloseTo(169 / 33, 12);
    expect(metrics.maxCorrectSkew).toBeCloseTo(41 / 3, 12);
    expect(metrics.meanSpread).toBeLessThan(806 / 11); // measured pre-repair baseline
    expect(metrics.meanCorrectSkew).toBeLessThan(1469 / 22); // measured pre-repair baseline
  });

  it("preserves distinct misconception feedback, evaluator truth, and stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size, `${key}: distinct diagnoses`).toBe(4);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful diagnosis`).toBeGreaterThan(38);
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
