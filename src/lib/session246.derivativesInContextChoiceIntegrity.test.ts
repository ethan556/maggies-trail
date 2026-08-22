import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec } from "./schema";

const TARGETS = {
  "dc-01-01": [{ stepId: "k3", correctLabel: "Moving backward steadily." }],
  "dc-01-02": [
    { stepId: "k1", correctLabel: "It is speeding up." },
    { stepId: "k2", correctLabel: "Backward and speeding up." },
  ],
  "dc-02-01": [{ stepId: "k2", correctLabel: "The radius was frozen." }],
  "dc-02-03": [
    { stepId: "k1", correctLabel: "Use similar triangles." },
    { stepId: "k3", correctLabel: "Use V = (1/12)πh³." },
  ],
  "dc-03-02": [{ stepId: "k3", correctLabel: "About 2%." }],
  "dc-03-03": [
    { stepId: "k2", correctLabel: "The curve with |f″| = 0.01." },
    { stepId: "k3", correctLabel: "No derivative exists at x = 0." },
  ],
  "dc-04-01": [{ stepId: "k3", correctLabel: "The form is not indeterminate." }],
  "dc-04-02": [{ stepId: "k2", correctLabel: "Rewrite as (ln x)/(1/x)." }],
} as const;

type LessonDocument = { steps: Array<{ id: string; widget?: unknown }> };

const rawLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(), "content", "courses", "derivatives-in-context", "lessons", `${lessonId}.json`,
), "utf8")) as LessonDocument;

const targetLessons = () => Object.keys(TARGETS).map((lessonId) => ({
  lessonId,
  document: Lesson.parse(rawLesson(lessonId)),
}));

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, expectations]) => {
  const lesson = rawLesson(lessonId);
  return expectations.map(({ stepId, correctLabel }) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget, correctLabel };
  });
});

describe("S246 Derivatives in Context choice-surface integrity", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const lessons = targetLessons();
    expect(lessons).toHaveLength(8);
    for (const { lessonId, document } of lessons) {
      expect(lintLesson(document), lessonId).toEqual([]);
    }
  });

  it("closes all eleven authored length leaks with concise parallel labels", () => {
    const rows = targetWidgets().map(({ key, widget, correctLabel }) => {
      expect(widget.options.map((option) => option.id), `${key}: stable IDs`).toEqual(["o1", "o2", "o3", "o4"]);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(widget.options.find((option) => option.correct)?.id, `${key}: answer marker`).toBe("o1");
      expect(widget.options.find((option) => option.correct)?.label, `${key}: mathematical truth`).toBe(correctLabel);
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
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(9);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    expect(rows).toHaveLength(11);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(9);
    expect(Math.max(...rows.map((row) => row.skew))).toBeCloseTo(20 / 3, 12);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(43);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(26, 12);
  });

  it("preserves evaluator truth, diagnostic feedback, and seeded ID-safe shuffling", () => {
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
});
