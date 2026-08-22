import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec } from "./schema";

const TARGETS = {
  "si-02-01": [
    { stepId: "ch1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k3", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-03-01": [
    { stepId: "k3", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-03-03": [
    { stepId: "ch1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-04-01": [
    { stepId: "ch1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k2", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-04-02": [
    { stepId: "ch1", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
    { stepId: "k2", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-05-02": [
    { stepId: "k2", ids: ["o1", "o2", "o3", "o4"], correct: "o1" },
  ],
  "si-06-01": [
    { stepId: "k1b", ids: ["neither", "low", "high"], correct: "neither" },
  ],
} as const;

type LessonDocument = {
  steps: Array<{ id: string; widget?: unknown; explanationVariants?: string[] }>;
  remedials: Array<{ check: { id: string; widget?: unknown; explanationVariants?: string[] } }>;
};

const rawLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(), "content", "courses", "statistical-inference", "lessons", `${lessonId}.json`,
), "utf8")) as LessonDocument;

const allSteps = (lesson: LessonDocument) => [
  ...lesson.steps,
  ...lesson.remedials.map((route) => route.check),
];

const targetLessons = () => Object.keys(TARGETS).map((lessonId) => ({
  lessonId,
  document: Lesson.parse(rawLesson(lessonId)),
}));

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, expectations]) => {
  const lesson = rawLesson(lessonId);
  return expectations.map(({ stepId, ids, correct }) => {
    const step = allSteps(lesson).find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget, ids: [...ids], correct };
  });
});

describe("S246 statistical-inference choice-surface integrity", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const lessons = targetLessons();
    expect(lessons).toHaveLength(7);
    for (const { lessonId, document } of lessons) {
      expect(lintLesson(document), lessonId).toEqual([]);
    }
  });

  it("closes all thirteen authored length leaks with concise parallel choices", () => {
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

    expect(rows).toHaveLength(13);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(10);
    expect(Math.max(...rows.map((row) => row.skew))).toBe(7);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(79);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(257 / 6, 12);
  });

  it("preserves evaluator truth, diagnostic feedback, and seeded shuffling", () => {
    for (const { key, widget } of targetWidgets()) {
      expect(new Set(widget.options.map((option) => option.feedback)).size,
        `${key}: distinct diagnoses`).toBe(widget.options.length);
      for (const option of widget.options) {
        expect(option.feedback.length, `${key}/${option.id}: useful feedback`).toBeGreaterThan(45);
        expect(option.feedback, `${key}/${option.id}: no generic retry copy`).not.toMatch(
          /^\s*(incorrect|try again|not quite)[.!]?\s*$/i,
        );
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

  it("states p-value evidence without reversing or overclaiming it", () => {
    const smallP = rawLesson("si-04-01").steps.find((step) => step.id === "ch1");
    const largeP = rawLesson("si-04-02").steps.find((step) => step.id === "k2");
    const smallPText = smallP?.explanationVariants?.join(" ") ?? "";
    const largePText = largeP?.explanationVariants?.join(" ") ?? "";

    expect(smallPText).toContain("evidence against the no-effect model");
    expect(smallPText).not.toMatch(/method probably did something|proves? (an? )?effect/i);
    expect(largePText).toContain("data are compatible with no effect");
    expect(largePText).not.toMatch(/chance explains (this|the) data perfectly|79% chance of no effect/i);
  });
});
