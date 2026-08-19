import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec } from "./schema";

const TARGETS = {
  "bv-01-03": [{ stepId: "k2", ids: ["a", "b", "c", "d"], correct: "a" }],
  "bv-02-01": [
    { stepId: "i1", ids: ["a", "b", "c", "d"], correct: "a" },
    { stepId: "k3", ids: ["a", "b", "c", "d"], correct: "a" },
  ],
  "bv-03-03": [
    { stepId: "i2", ids: ["a", "b", "c", "d"], correct: "a" },
    { stepId: "k3", ids: ["a", "b", "c", "d"], correct: "a" },
  ],
  "bv-04-03": [
    { stepId: "ch1", ids: ["a", "b", "c", "d"], correct: "a" },
    { stepId: "i2", ids: ["a", "b", "c", "d"], correct: "a" },
    { stepId: "k1", ids: ["a", "b", "c", "d"], correct: "a" },
  ],
  "bv-05-02": [{
    stepId: "k3", ids: ["amplify", "pretty", "required"], correct: "amplify",
  }],
  "bv-05-03": [
    { stepId: "ch1", ids: ["yes", "no", "two"], correct: "yes" },
    { stepId: "k2", ids: ["no", "yes", "depends"], correct: "no" },
  ],
} as const;

type LessonDocument = { steps: Array<{
  id: string;
  widget?: unknown;
  explanationVariants?: string[];
}> };

const rawLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(), "content", "courses", "bivariate-statistics", "lessons", `${lessonId}.json`,
), "utf8")) as LessonDocument;

const targetLessons = () => Object.keys(TARGETS).map((lessonId) => ({
  lessonId,
  document: Lesson.parse(rawLesson(lessonId)),
}));

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, expectations]) => {
  const lesson = rawLesson(lessonId);
  return expectations.map(({ stepId, ids, correct }) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget, ids: [...ids], correct };
  });
});

describe("S246 Bivariate Statistics choice-surface integrity", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const lessons = targetLessons();
    expect(lessons).toHaveLength(6);
    for (const { lessonId, document } of lessons) {
      expect(lintLesson(document), lessonId).toEqual([]);
    }
  });

  it("closes all eleven authored length leaks with parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget, ids, correct }) => {
      expect(widget.options.map((option) => option.id), `${key}: stable IDs`).toEqual(ids);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(widget.options.find((option) => option.correct)?.id, `${key}: answer marker`).toBe(correct);
      expect(new Set(widget.options.map((option) => option.label.trim().toLowerCase())).size,
        `${key}: distinct labels`).toBe(widget.options.length);

      const answer = widget.options.find((option) => option.correct)!;
      const wrong = widget.options.filter((option) => !option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      const maxWrong = Math.max(...wrong.map((option) => option.label.length));
      const wrongMean = wrong.reduce((sum, option) => sum + option.label.length, 0) / wrong.length;
      const spread = Math.max(...lengths) - Math.min(...lengths);
      const skew = Math.abs(answer.label.length - wrongMean);
      const leaks = answer.label.length > maxWrong * 1.5 && answer.label.length - maxWrong >= 12;

      for (const option of widget.options) {
        expect(option.label, `${key}/${option.id}: rationale belongs in feedback`).not.toMatch(
          /—|\bbecause\b|\bsince\b|\bso that\b|\btherefore\b/i,
        );
      }
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(10);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    expect(rows).toHaveLength(11);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(10);
    expect(Math.max(...rows.map((row) => row.skew))).toBe(8);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(74);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(49, 12);
  });

  it("preserves evaluator truth, diagnostic feedback, and seeded shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size,
        `${key}: distinct diagnoses`).toBe(widget.options.length);
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

  it("keeps the bv-05-03 line-shift explanation directionally true", () => {
    const lesson = rawLesson("bv-05-03");
    const explanation = lesson.steps.find((step) => step.id === "k2")?.explanationVariants?.[0];
    expect(explanation).toContain("Raising b");
    expect(explanation).toContain("raises every other prediction");
    expect(explanation).not.toMatch(/Lowering|drops every other prediction/);
  });
});
