import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec } from "./schema";

const TARGETS = {
  "mb-01-01": [{
    stepId: "k3",
    prompt: "Sam has 10 cards. Dee has 12. Priya says, ‘Dee has 2 more.’ Marco says, ‘Dee has 2 times as many.’ Who is correct?",
    correctLabel: "Priya only",
  }],
  "mb-01-03": [{
    stepId: "k3",
    prompt: "Sara has 3 more books than Ben, who has 12. Leo answers 36. What mistake did Leo make?",
    correctLabel: "He multiplied by 3.",
  }],
  "mb-02-01": [
    { stepId: "k1", prompt: "Is 4 a factor of 20?", correctLabel: "Yes, it divides 20 evenly." },
    {
      stepId: "k3",
      prompt: "As you list the factor pairs of 30 in order, when can you stop?",
      correctLabel: "When the pair meets or crosses.",
    },
  ],
  "mb-02-03": [
    { stepId: "k2", prompt: "Is 1 prime, composite, or neither?", correctLabel: "Neither." },
    { stepId: "k3", prompt: "Which of these is NOT actually prime: 5, 9, 11, or 23?", correctLabel: "9" },
  ],
  "mb-03-01": [{
    stepId: "k3",
    prompt: "For 9 × 40, Sam wrote 36. What went wrong?",
    correctLabel: "He forgot the tens place.",
  }],
  "mb-03-02": [{
    stepId: "k3",
    prompt: "For 8 × 26, Mia found the tens rectangle 8 × 20 = 160 but stopped. Which rectangle did she forget?",
    correctLabel: "The 8 × 6 rectangle",
  }],
  "mb-03-03": [{
    stepId: "k3",
    prompt: "Leo breaks apart 16 × 24. He adds 200 + 40 + 120 = 360. Which rectangle is missing?",
    correctLabel: "The 6 × 4 rectangle",
  }],
  "mb-04-01": [{
    stepId: "k2",
    prompt: "Sam says 31 ÷ 6 is 4 remainder 7. How should he fix it?",
    correctLabel: "Change to 5 remainder 1.",
  }],
  "mb-04-03": [{
    stepId: "k1",
    prompt: "A boat holds 6 people; 34 people need to cross. How many boat trips are needed?",
    correctLabel: "6 trips",
  }],
} as const;

type LessonDocument = { steps: Array<{ id: string; widget?: unknown }> };

const rawLesson = (lessonId: string) => JSON.parse(readFileSync(join(
  process.cwd(), "content", "courses", "multiply-bigger", "lessons", `${lessonId}.json`,
), "utf8")) as LessonDocument;

const targetLessons = () => Object.keys(TARGETS).map((lessonId) => ({
  lessonId,
  document: Lesson.parse(rawLesson(lessonId)),
}));

const targetWidgets = () => Object.entries(TARGETS).flatMap(([lessonId, expectations]) => {
  const lesson = rawLesson(lessonId);
  return expectations.map(({ stepId, prompt, correctLabel }) => {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Missing ${lessonId}/${stepId}`);
    const widget = WidgetSpec.parse(step.widget);
    expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
    if (widget.type !== "mcq") throw new Error(`Wrong widget at ${lessonId}/${stepId}`);
    return { key: `${lessonId}/${stepId}`, widget, prompt, correctLabel };
  });
});

describe("S246 Multiply Bigger choice-surface integrity", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const lessons = targetLessons();
    expect(lessons).toHaveLength(9);
    for (const { lessonId, document } of lessons) {
      expect(lintLesson(document), lessonId).toEqual([]);
    }
  });

  it("uses clear grade-appropriate stems and closes all eleven authored length leaks", () => {
    const rows = targetWidgets().map(({ key, widget, prompt, correctLabel }) => {
      expect(widget.prompt, `${key}: sealed stem`).toBe(prompt);
      expect(widget.prompt, `${key}: complete question`).toMatch(/[?]$/);
      expect(widget.options.map((option) => option.id), `${key}: stable IDs`).toEqual(["a", "b", "c", "d"]);
      expect(widget.options.filter((option) => option.correct), `${key}: one answer`).toHaveLength(1);
      expect(widget.options.find((option) => option.correct)?.id, `${key}: answer marker`).toBe("a");
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
      expect(spread, `${key}: option-length parity`).toBeLessThanOrEqual(8);
      expect(leaks, `${key}: correct-answer length leak`).toBe(false);
      return { spread, skew, leaks };
    });

    expect(rows).toHaveLength(11);
    expect(rows.filter((row) => row.leaks)).toHaveLength(0);
    expect(Math.max(...rows.map((row) => row.spread))).toBe(8);
    expect(Math.max(...rows.map((row) => row.skew))).toBe(4);
    expect(rows.reduce((sum, row) => sum + row.spread, 0)).toBe(42);
    expect(rows.reduce((sum, row) => sum + row.skew, 0)).toBeCloseTo(19, 12);
  });

  it("preserves diagnostic feedback, evaluator agreement, and seeded ID-safe shuffling", () => {
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
