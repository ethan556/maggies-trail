import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

const courseDir = join(process.cwd(), "content", "courses", "number-system");
const lessonsDir = join(courseDir, "lessons");
const course = JSON.parse(readFileSync(join(courseDir, "course.json"), "utf8")) as {
  chapters: Array<{ lessonIds: string[] }>;
};
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);

type RawStep = {
  id: string;
  body?: string;
  figure?: string;
  conceptTag?: string;
  widget?: unknown;
};
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };

const lessons = new Map(lessonIds.map((lessonId) => [
  lessonId,
  JSON.parse(readFileSync(join(lessonsDir, `${lessonId}.json`), "utf8")) as RawLesson,
]));

function step(key: string): RawStep {
  const [lessonId, stepId] = key.split(":");
  const lesson = lessons.get(lessonId ?? "");
  const target = lesson?.steps.find((candidate) => candidate.id === stepId);
  if (!target) throw new Error(`missing ${key}`);
  return target;
}

const synchronizedFigures = new Map<string, { figure: string; evidence: string[] }>([
  ["ns-01-01:c2", { figure: "fm-divide-unit", evidence: ["2 ÷ 1/3 = 6", "2 wholes", "3 thirds"] }],
  ["ns-01-02:c1", { figure: "ns-flip-multiply", evidence: ["3/4 ÷ 1/2", "3/4 × 2/1", "3/2"] }],
  ["ns-02-02:c2", { figure: "dop-pad-borrow", evidence: ["5 − 1.75", "5.00 − 1.75 = 3.25"] }],
  ["ns-02-03:c1", { figure: "dop-count-places", evidence: ["1.2 × 0.5", "0.60"] }],
  ["ns-04-01:c2", { figure: "ns-opposites", evidence: ["opposite of 4 is −4", "opposite of −4 is 4"] }],
  ["ns-05-02:c2", { figure: "ns-abs-compare", evidence: ["−5 < 3", "|−5| = 5", "|3| = 3"] }],
]);

const withheldFigures = new Map([
  ["ns-01-02:c2", "ns-flip-multiply"],
  ["ns-01-03:c1", "fm-divide-unit"],
  ["ns-01-03:c2", "fm-divide-unit"],
  ["ns-02-03:c2", "decimal-shift"],
  ["ns-05-03:c2", "negative-number-line"],
]);

const progressionTargets = new Map<string, { body: string; prompt: string; type: string; answer?: unknown }>([
  ["ns-01-01:k3", { body: "Model a cut before counting.", prompt: "A 6/8-meter strip is cut into pieces that are 2/8 meter long. How many equal pieces fit?", type: "numeric", answer: 3 }],
  ["ns-01-02:k3", { body: "Audit the simplification.", prompt: "A learner gets 15/6 after keeping 5/6 and flipping 1/3. Reduce it to a fraction with denominator 2 — enter the numerator.", type: "quotientReasoningLab" }],
  ["ns-02-01:ch1", { body: "Verify a proposed quotient.", prompt: "A learner says 1248 ÷ 24 = 52. Check with multiplication, then enter the quotient.", type: "quotientReasoningLab" }],
  ["ns-02-02:k3", { body: "Estimate, then subtract.", prompt: "First estimate, then compute 15 − 6.25. Enter the exact difference.", type: "numeric", answer: 8.75 }],
  ["ns-02-03:k3", { body: "Make the divisor whole first.", prompt: "Shift both decimals to make the divisor whole, then compute 4.8 ÷ 0.4.", type: "numeric", answer: 12 }],
  ["ns-02-03:ch1", { body: "Decide whether the quotient is whole.", prompt: "Will 15.6 ÷ 2.6 be a whole number? Make the divisor whole, then enter the quotient.", type: "numeric", answer: 6 }],
  ["ns-03-02:k2", { body: "Use the containment shortcut.", prompt: "Without listing multiples, find the LCM of 5 and 10 when one number divides the other.", type: "numeric", answer: 10 }],
  ["ns-05-01:k3", { body: "Audit the zero boundary.", prompt: "A classmate says |0| = 1. Enter the correct value of |0|.", type: "numeric", answer: 0 }],
  ["ns-05-03:k3", { body: "Benchmark before comparing.", prompt: "Use 0.5 as a benchmark. Which is greater: 2/5 or 0.6?", type: "rationalCompare", answer: "lt" }],
]);

const choiceTargets = new Map<string, Array<{ id: string; correct: boolean; label: string }>>([
  ["ns-03-03:k2", [
    { id: "a", correct: true, label: "Expansion gives 36, not 30" },
    { id: "b", correct: false, label: "Expansion gives the same total" },
    { id: "c", correct: false, label: "The common factor is too large" },
  ]],
  ["ns-04-03:k3", [
    { id: "a", correct: true, label: "No quadrant: y-axis" },
    { id: "b", correct: false, label: "Quadrant I: upper right" },
    { id: "c", correct: false, label: "Quadrant II: upper left" },
  ]],
]);

describe("S282 Number System source implementation", () => {
  it("preserves the 16-lesson manifest and resolves each visual mismatch truthfully", () => {
    expect(lessonIds).toHaveLength(16);
    expect(new Set(lessonIds).size).toBe(16);
    expect(synchronizedFigures.size + withheldFigures.size).toBe(11);
    for (const [key, target] of synchronizedFigures) {
      const item = step(key);
      expect(item.figure, key).toBe(target.figure);
      expect(FIGURE_IDS.has(target.figure), `${key}: registered figure`).toBe(true);
      for (const claim of target.evidence) expect(item.body, `${key}: ${claim}`).toContain(claim);
    }
    for (const [key, legacyFigure] of withheldFigures) {
      const item = step(key);
      expect(item.figure, `${key}: unsafe ${legacyFigure} withheld`).toBeUndefined();
      expect(item.body, `${key}: retained explanation`).toBeTruthy();
    }
  });

  it("gives every queued progression target a distinct learner job without changing evaluator truth", () => {
    expect(progressionTargets.size).toBe(9);
    for (const [key, target] of progressionTargets) {
      const item = step(key);
      expect(item.body, `${key}: job`).toBe(target.body);
      const widget = WidgetSpec.parse(item.widget);
      expect(widget.type, `${key}: evaluator type`).toBe(target.type);
      expect(widget.prompt, `${key}: prompt`).toBe(target.prompt);
      if (target.answer !== undefined) expect(evaluate(widget, target.answer).correct, `${key}: evaluator truth`).toBe(true);
    }
    const jobs = [...progressionTargets.values()].map((target) => target.body);
    expect(new Set(jobs).size).toBe(jobs.length);
  });

  it("repairs both MCQ surfaces with stable ids, truth, concise parallel labels, and retained diagnostic feedback", () => {
    expect(choiceTargets.size).toBe(2);
    for (const [key, expectedOptions] of choiceTargets) {
      const item = step(key);
      const widget = WidgetSpec.parse(item.widget);
      expect(widget.type, key).toBe("mcq");
      if (widget.type !== "mcq") throw new Error(`${key} must remain MCQ`);
      expect(widget.options.map((option) => ({ id: option.id, correct: Boolean(option.correct), label: option.label }))).toEqual(expectedOptions);
      expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
      expect(widget.options.every((option) => Boolean(option.feedback?.trim()))).toBe(true);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${key}: label parity`).toBeLessThanOrEqual(7);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${key}/${option.id}`).toBe(Boolean(option.correct));
    }
  });

  it("counts both plot-point interactions as ordered-pair assessment evidence", () => {
    for (const key of ["ns-04b-01:i1", "ns-04b-01:i2"]) {
      const item = step(key);
      expect(item.conceptTag, key).toBe("ordered-pair-signs");
      expect(WidgetSpec.parse(item.widget).type, key).toBe("plotPoint");
    }
  });

  it("keeps every current lesson schema-, pedagogy-, figure-, and widget-integrity clean", () => {
    expect(readdirSync(lessonsDir).filter((file) => file.endsWith(".json")).sort()).toHaveLength(16);
    for (const lessonId of lessonIds) {
      const raw = JSON.parse(readFileSync(join(lessonsDir, `${lessonId}.json`), "utf8"));
      const lesson = Lesson.parse(raw);
      expect(lintLesson(lesson), lessonId).toEqual([]);
      for (const item of [...lesson.steps, ...lesson.remedials.flatMap((remedial) => [remedial.concept, remedial.check])]) {
        if (item.figure) expect(FIGURE_IDS.has(item.figure), `${lessonId}:${item.id}: figure`).toBe(true);
        if (item.widget) expect(widgetIntegrityErrors(item.widget), `${lessonId}:${item.id}: widget`).toEqual([]);
      }
    }
  });
});
