import { describe, expect, it } from "vitest";
import { Lesson, WidgetSpec, type TWidget } from "./schema";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import seedLesson from "../../content/courses/multiplication-division/lessons/mult-01-01.json";

const mcq = WidgetSpec.parse({
  type: "mcq",
  prompt: "p",
  options: [
    { id: "a", label: "A", correct: true, feedback: "yes fb" },
    { id: "b", label: "B", feedback: "that mixes up adding and grouping" }
  ]
}) as TWidget;

const numeric = WidgetSpec.parse({
  type: "numeric",
  prompt: "p",
  answer: 12,
  tolerance: 0,
  commonErrors: [{ value: 7, feedback: "7 comes from adding instead of grouping" }],
  fallbackFeedback: "count one group at a time"
}) as TWidget;

const slider = WidgetSpec.parse({
  type: "slider",
  prompt: "p",
  min: 1,
  max: 6,
  start: 1,
  target: 5,
  visual: "groups",
  groupSize: 4,
  lowFeedback: "each bag adds 4 — go up",
  highFeedback: "each bag removed takes 4 — go down",
  successFeedback: "multiplied!"
}) as TWidget;

const tap = WidgetSpec.parse({
  type: "tapDiagram",
  prompt: "p",
  mode: "selectAll",
  canvas: { w: 4, h: 3 },
  hotspots: [
    { id: "p1", x: 25, y: 50, label: "three", icon: "🍪", count: 3, correct: true },
    { id: "p2", x: 75, y: 50, label: "two", icon: "🍪", count: 2, feedback: "that one holds 2" }
  ],
  missFeedback: "count each plate first",
  successFeedback: "found them"
}) as TWidget;

describe("evaluate", () => {
  it("mcq: routes per-option diagnostic feedback", () => {
    expect(evaluate(mcq, "a")).toEqual({ correct: true, feedback: "yes fb" });
    expect(evaluate(mcq, "b").correct).toBe(false);
    expect(evaluate(mcq, "b").feedback).toMatch(/mixes up/);
  });

  it("numeric: exact match, common-error diagnosis, fallback", () => {
    expect(evaluate(numeric, 12).correct).toBe(true);
    expect(evaluate(numeric, 7).feedback).toMatch(/adding instead/);
    expect(evaluate(numeric, 99).feedback).toMatch(/one group at a time/);
  });

  it("slider: directional feedback and exact target", () => {
    expect(evaluate(slider, 5).correct).toBe(true);
    expect(evaluate(slider, 2).feedback).toMatch(/go up/);
    expect(evaluate(slider, 6).feedback).toMatch(/go down/);
  });

  it("tapDiagram: set equality with wrong-pick diagnosis", () => {
    expect(evaluate(tap, ["p1"]).correct).toBe(true);
    expect(evaluate(tap, ["p1", "p2"]).feedback).toMatch(/holds 2/);
    expect(evaluate(tap, ["p2"]).correct).toBe(false);
  });

  it("canCheck gates empty values", () => {
    expect(canCheck(mcq, null)).toBe(false);
    expect(canCheck(mcq, "a")).toBe(true);
    expect(canCheck(numeric, null)).toBe(false);
    expect(canCheck(numeric, 3)).toBe(true);
    expect(canCheck(slider, null)).toBe(true);
    expect(canCheck(tap, [])).toBe(false);
  });

  it("exposes correct answers for the reveal state", () => {
    expect(correctAnswerText(mcq)).toBe("A");
    expect(correctAnswerText(numeric)).toBe("12");
    expect(correctAnswerText(tap)).toBe("three");
  });
});

describe("seed lesson content gates", () => {
  it("passes the Zod schema", () => {
    expect(() => Lesson.parse(seedLesson)).not.toThrow();
  });

  it("passes the pedagogy linter with zero findings", () => {
    const lesson = Lesson.parse(seedLesson);
    expect(lintLesson(lesson)).toEqual([]);
  });
});

describe("pedagogy linter catches violations", () => {
  it("flags generic feedback, missing variants, and misplaced challenges", () => {
    const base = Lesson.parse(seedLesson);
    const bad = structuredClone(base);
    // generic feedback
    const k1 = bad.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type === "mcq") k1.widget.options[1].feedback = "Incorrect, the answer is A.";
    // strip variants
    const k2 = bad.steps.find((s) => s.id === "k2");
    if (k2) delete (k2 as { explanationVariants?: unknown }).explanationVariants;
    // move the challenge to the front
    const chIdx = bad.steps.findIndex((s) => s.kind === "challenge");
    const [ch] = bad.steps.splice(chIdx, 1);
    bad.steps.unshift(ch);

    const errs = lintLesson(bad);
    expect(errs.some((e) => e.includes("generic incorrect-feedback"))).toBe(true);
    expect(errs.some((e) => e.includes("explanationVariants"))).toBe(true);
    expect(errs.some((e) => e.includes("final third"))).toBe(true);
  });

  it("flags a commonError that equals the correct answer", () => {
    const base = Lesson.parse(seedLesson);
    const bad = structuredClone(base);
    const numeric = bad.steps.find((s) => s.widget?.type === "numeric");
    if (numeric?.widget?.type === "numeric") {
      numeric.widget.commonErrors.push({
        value: numeric.widget.answer,
        feedback: "this feedback would fire on the RIGHT answer",
      });
    }
    const errs = lintLesson(bad);
    expect(errs.some((e) => e.includes("equals the correct answer"))).toBe(true);
  });

  it("applies the early-reader concept cap only when readingProfile is 'early'", () => {
    const base = Lesson.parse(seedLesson);
    const concept = base.steps.find((s) => s.kind === "concept");
    // A caption a 6-year-old shouldn't have to read: 30 short words.
    const longCaption = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");

    const standard = structuredClone(base);
    const sc = standard.steps.find((s) => s.id === concept!.id)!;
    sc.body = longCaption;
    // 30 words is fine under the standard ≤80 profile.
    expect(lintLesson(standard).some((e) => e.includes("reading profile"))).toBe(false);

    const early = structuredClone(base);
    early.readingProfile = "early";
    const ec = early.steps.find((s) => s.id === concept!.id)!;
    ec.body = longCaption;
    // The same 30 words trip the early ≤25 cap.
    expect(lintLesson(early).some((e) => e.includes("max 25"))).toBe(true);
  });
});
