import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "sy-01-02": ["k1"],
  "sy-01-03": ["ch"],
  "sy-02-01": ["i3"],
  "sy-02-02": ["k1", "ch"],
  "sy-02-03": ["k1"],
  "sy-03-01": ["i3", "k1"],
  "sy-03-02": ["i1", "ch"],
  "sy-03-03": ["k2"],
  "sy-04-01": ["k1", "k2", "ch"],
  "sy-04-02": ["k2"],
  "sy-05-01": ["k1", "k2"],
} as const;

type Lesson = { steps: Array<{ id: string; widget?: unknown }> };

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, stepIds]) => {
  const lesson = JSON.parse(readFileSync(join(
    process.cwd(), "content", "courses", "similarity", "lessons", `${lessonId}.json`,
  ), "utf8")) as Lesson;
  return stepIds.map((stepId) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget };
  });
});

describe("S246 similarity choice-surface integrity", () => {
  it("closes all seventeen queue-defined length leaks with parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options, `${key}: four choices`).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.id)).size, `${key}: stable IDs`).toBe(4);
      expect(new Set(widget.options.map((option) => option.label.trim().toLowerCase())).size,
        `${key}: distinct labels`).toBe(4);

      const correct = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      const wrongMean = wrong.reduce((sum, option) => sum + option.label.length, 0) / wrong.length;
      const spread = Math.max(...lengths) - Math.min(...lengths);
      const skew = Math.abs(correct.label.length - wrongMean);
      const leaks = correct.label.length > maxWrong * 1.5 && correct.label.length - maxWrong >= 12;

      for (const option of widget.options) {
        expect(option.label, `${key}/${option.id}: rationale belongs in feedback`).not.toMatch(
          /—|\bbecause\b|\bsince\b|\bso that\b|\btherefore\b/i,
        );
      }
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(13);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    expect(rows).toHaveLength(17);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(13);
    expect(Math.max(...rows.map((row) => row.skew))).toBeCloseTo(34 / 3, 12);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(137);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(72, 12);
  });

  it("preserves truth, misconception feedback, and stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size,
        `${key}: distinct diagnoses`).toBe(4);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful feedback`).toBeGreaterThan(35);
        const result = evaluate(widget, option.id);
        expect(result.correct, `${key}/${option.id}: evaluator truth`).toBe(option.correct);
        expect(result.feedback, `${key}/${option.id}: feedback route`).toBe(option.feedback);
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
