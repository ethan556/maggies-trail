import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { seededShuffle } from "./prng";
import { WidgetSpec } from "./schema";

const TARGETS = {
  "ca-01-01": ["k2", "k3"],
  "ca-01-03": ["k2"],
  "ca-02-01": ["k1", "k3"],
  "ca-02-02": ["k2", "k3"],
  "ca-02-03": ["k2"],
  "ca-03-01": ["k2"],
  "ca-03-03": ["k1", "k3"],
  "ca-04-01": ["k2", "k3"],
  "ca-04-02": ["k2", "k3"],
  "ca-04-03": ["k2"],
  "ca-05-01": ["k1"],
  "ca-05-02": ["k3"],
  "ca-05-03": ["k3"],
} as const;

type Lesson = { steps: Array<{ id: string; figure?: string; widget?: unknown }> };

const loadLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(),
  "content/courses/curve-analysis/lessons",
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
    return { key: `${lessonId}/${stepId}`, figure: step.figure, widget };
  });
});

describe("S246 curve-analysis choice-surface integrity", () => {
  it("closes all nineteen queue-defined length leaks with parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options, `${key}: four choices`).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: one defensible answer`).toHaveLength(1);
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
          /—|\bbecause\b|\bsince\b|\bso that\b|\bwhich means\b|\btherefore\b/i,
        );
      }
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(14);
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
    expect(metrics).toMatchObject({ rows: 19, leakingRows: 0, maxSpread: 14, maxCorrectSkew: 11 });
    expect(metrics.meanSpread).toBeCloseTo(162 / 19, 12);
    expect(metrics.meanCorrectSkew).toBeCloseTo(262 / 57, 12);
    expect(metrics.meanSpread).toBeLessThan(1004 / 19); // queue-defined pre-repair baseline
    expect(metrics.meanCorrectSkew).toBeLessThan(886 / 19); // queue-defined pre-repair baseline
  });

  it("preserves evaluator truth, feedback diagnoses, and stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size, `${key}: distinct diagnoses`).toBe(4);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful feedback`).toBeGreaterThan(45);
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

  it("keeps every no-figure stem self-contained and seals the corrected calculus claims", () => {
    for (const { key, figure, widget } of targetWidgets()) {
      expect(figure, `${key}: queue row unexpectedly gained a figure`).toBeUndefined();
      expect(widget.prompt, `${key}: hidden visual dependency`).not.toMatch(/(?:diagram|graph) (?:shown|above|below)|as shown/i);
    }

    const byKey = new Map(targetWidgets().map((row) => [row.key, row.widget]));
    expect(byKey.get("ca-02-03/k2")?.prompt).toContain("Which description is guaranteed?");
    expect(byKey.get("ca-02-03/k2")?.options.find((option) => option.correct)?.label)
      .toBe("Rising with a decreasing slope");
    expect(byKey.get("ca-02-03/k2")?.options.find((option) => option.correct)?.feedback).not.toMatch(/maximum|peak/i);
    expect(byKey.get("ca-03-03/k1")?.prompt).toMatch(/^On an interval,/);
    expect(byKey.get("ca-03-03/k3")?.prompt).toContain("on an interval");
    expect(byKey.get("ca-05-01/k1")?.prompt).toContain("one-variable objective");
    expect(byKey.get("ca-05-02/k3")?.prompt).toContain("algebraic zero");
    expect(byKey.get("ca-05-02/k3")?.options.find((option) => option.correct)?.label)
      .toBe("It makes the box degenerate");
  });
});
