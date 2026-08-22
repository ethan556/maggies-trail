import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "tc-01-01": ["k1", "ch"],
  "tc-01-02": ["k1"],
  "tc-02-01": ["k1"],
  "tc-02-02": ["k1"],
  "tc-02-03": ["ch"],
  "tc-03-02": ["k1"],
  "tc-04-01": ["k1"],
  "tc-04-02": ["k2"],
  "tc-05-03": ["ch"],
} as const;

type Lesson = { steps: Array<{ id: string; widget?: unknown }> };

const loadLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(),
  "content/courses/triangle-congruence/lessons",
  `${lessonId}.json`,
), "utf8")) as Lesson;

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, stepIds]) => {
  const lesson = loadLesson(lessonId);
  return stepIds.map((stepId) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget };
  });
});

describe("S246 triangle-congruence choice-surface integrity", () => {
  it("closes all ten reported length leaks with concise parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options, `${key}: four choices`).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: unique truth`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.id)).size, `${key}: stable IDs`).toBe(4);
      expect(new Set(widget.options.map((option) => option.label.trim().toLowerCase())).size,
        `${key}: distinct choices`).toBe(4);

      const correct = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      const wrongMean = wrong.reduce((sum, option) => sum + option.label.length, 0) / wrong.length;
      const spread = Math.max(...lengths) - Math.min(...lengths);
      const skew = Math.abs(correct.label.length - wrongMean);
      const leaks = correct.label.length > maxWrong * 1.5 && correct.label.length - maxWrong >= 12;

      expect(correct.label, `${key}: rationale belongs in feedback`).not.toMatch(
        /—|\bbecause\b|\bsince\b|\bso that\b|\bwhich means\b|\btherefore\b/i,
      );
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(12);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    const metrics = {
      rows: rows.length,
      leakingRows: rows.filter((row) => row.leaks).length,
      meanSpread: rows.reduce((sum, row) => sum + row.spread, 0) / rows.length,
      maxSpread: Math.max(...rows.map((row) => row.spread)),
      meanCorrectSkew: rows.reduce((sum, row) => sum + row.skew, 0) / rows.length,
      maxCorrectSkew: Math.max(...rows.map((row) => row.skew)),
    };
    expect(metrics).toMatchObject({
      rows: 10,
      leakingRows: 0,
      meanSpread: 7.1,
      maxSpread: 12,
    });
    expect(metrics.meanCorrectSkew).toBeCloseTo(79 / 30, 12);
    expect(metrics.maxCorrectSkew).toBeCloseTo(16 / 3, 12);
    expect(metrics.meanSpread).toBeLessThan(48.7);
    expect(metrics.meanCorrectSkew).toBeLessThan(41.4);
  });

  it("preserves stable IDs, evaluator truth, and misconception-specific feedback", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(widget.prompt, `${key}: age-appropriate stem`).not.toMatch(/reasoning check|select the best statement/i);
      expect(new Set(widget.options.map((option) => option.feedback)).size, `${key}: distinct diagnoses`).toBe(4);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful explanation`).toBeGreaterThan(45);
        const result = evaluate(widget, option.id);
        expect(result.correct, `${key}/${option.id}: evaluator truth`).toBe(option.correct);
        expect(result.feedback, `${key}/${option.id}: feedback truth`).toBe(option.feedback);
      }

      const ids = widget.options.map((option) => option.id).sort();
      const order = (seed: string) => seededShuffle(widget.options, seed).map((option) => option.id);
      expect(order(`s246:${key}`)).toEqual(order(`s246:${key}`));
      expect([...order(`s246:${key}`)].sort()).toEqual(ids);
      expect(new Set(Array.from({ length: 8 }, (_, index) => order(`s246:${key}:${index}`).join("|"))).size)
        .toBeGreaterThan(1);
    }
  });
});
