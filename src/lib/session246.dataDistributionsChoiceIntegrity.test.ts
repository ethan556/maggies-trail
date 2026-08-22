import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "dd-01-01": ["k1", "k3"],
  "dd-01-03": ["k3"],
  "dd-02-01": ["k2"],
  "dd-02-02": ["ch1", "k2", "k3"],
  "dd-02-03": ["ch1", "k1", "k2"],
  "dd-04-03": ["ch1"],
  "dd-04b-02": ["k2"],
  "dd-05-01": ["ch1"],
  "dd-05-03": ["k3"],
} as const;

type Lesson = { steps: Array<{ id: string; widget?: unknown }> };
const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, stepIds]) => {
  const lesson = JSON.parse(readFileSync(join(
    process.cwd(), "content", "courses", "data-distributions", "lessons", `${lessonId}.json`,
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

describe("S246 data-distributions choice-surface integrity", () => {
  it("closes all fourteen queue findings with parallel, cue-resistant labels", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options).toHaveLength(3);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.id)).size, `${key}: stable IDs`).toBe(3);
      expect(new Set(widget.options.map((option) => option.label.toLowerCase())).size,
        `${key}: distinct labels`).toBe(3);
      const correct = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      const spread = Math.max(...lengths) - Math.min(...lengths);
      const skew = Math.abs(correct.label.length - wrong.reduce((sum, option) => sum + option.label.length, 0) / 2);
      const leaks = correct.label.length > maxWrong * 1.5 && correct.label.length - maxWrong >= 12;
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(10);
      expect(leaks, `${key}: answer-length clue`).toBe(false);
      for (const option of widget.options) {
        expect(option.label, `${key}/${option.id}: explanation belongs in feedback`).not.toMatch(
          /—|\bbecause\b|\bsince\b|\btherefore\b/i,
        );
      }
      return { spread, skew };
    });
    expect(rows).toHaveLength(14);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(71);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(49.5, 12);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(9);
    expect(Math.max(...rows.map((row) => row.skew))).toBe(8);
  });

  it("keeps units parallel and preserves feedback, truth, and stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size,
        `${key}: distinct diagnoses`).toBe(3);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful feedback`).toBeGreaterThan(35);
        const result = evaluate(widget, option.id);
        expect(result.correct).toBe(option.correct);
        expect(result.feedback).toBe(option.feedback);
      }
      const ids = widget.options.map((option) => option.id).sort();
      const order = (seed: string) => seededShuffle(widget.options, seed).map((option) => option.id);
      expect(order(`s246:${key}`)).toEqual(order(`s246:${key}`));
      expect([...order(`s246:${key}`)].sort()).toEqual(ids);
    }

    const unitItem = targetWidgets().find(({ key }) => key === "dd-04-03/ch1")!.widget;
    expect(unitItem.options.every((option) => /hours/.test(option.label))).toBe(true);
  });
});
