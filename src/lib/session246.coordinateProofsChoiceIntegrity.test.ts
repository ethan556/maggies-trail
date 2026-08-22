import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec } from "./schema";

const TARGETS = {
  "cx-01-01": ["i1"],
  "cx-01-02": ["i2"],
  "cx-01-03": ["i2"],
  "cx-02-02": ["k3"],
  "cx-02-03": ["k3"],
  "cx-03-01": ["k3"],
  "cx-03-02": ["k1", "k2", "ch"],
  "cx-03-03": ["k3"],
  "cx-04-03": ["k3", "i2"],
  "cx-05-01": ["i2"],
  "cx-05-03": ["k3", "i2"],
} as const;

type LessonDocument = { steps: Array<{ id: string; widget?: unknown }> };

const targetLessons = () => Object.keys(TARGETS).map((lessonId) => ({
  lessonId,
  document: Lesson.parse(JSON.parse(readFileSync(join(
    process.cwd(), "content", "courses", "coordinate-proofs", "lessons", `${lessonId}.json`,
  ), "utf8"))),
}));

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, stepIds]) => {
  const lesson = JSON.parse(readFileSync(join(
    process.cwd(), "content", "courses", "coordinate-proofs", "lessons", `${lessonId}.json`,
  ), "utf8")) as LessonDocument;
  return stepIds.map((stepId) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget };
  });
});

describe("S246 Coordinate Proofs choice-surface integrity", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const lessons = targetLessons();
    expect(lessons).toHaveLength(11);
    for (const { lessonId, document } of lessons) {
      expect(lintLesson(document), lessonId).toEqual([]);
    }
  });

  it("closes all fifteen authored length leaks with parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget }) => {
      expect(widget.options, `${key}: four choices`).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(widget.options.map((option) => option.id), `${key}: stable IDs`).toEqual([
        "o1", "o2", "o3", "o4",
      ]);
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
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(12);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    expect(rows).toHaveLength(15);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(12);
    expect(Math.max(...rows.map((row) => row.skew))).toBeCloseTo(28 / 3, 12);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(122);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(175 / 3, 12);
  });

  it("preserves truth, misconception feedback, and stable-ID shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(widget.options.find((option) => option.correct)?.id, `${key}: answer marker`).toBe("o1");
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
