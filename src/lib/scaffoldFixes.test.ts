/**
 * Regression guard for the "gradual difficulty, intermediate steps tested before combining"
 * fix pass: 18 lessons whose challenge step required a skill combination no earlier step had
 * rehearsed (found via scripts/scaffold-gap-audit.mjs, then hand-reviewed — see DECISIONS.md
 * for which candidates were real gaps vs. already well-scaffolded). Each got one new `check`
 * step inserted immediately before its `challenge`, isolating the previously-unrehearsed
 * combination at an easier difficulty.
 *
 * This locks in, per lesson: the new step exists at the right id, sits directly before the
 * challenge (not appended at the end, not lost in a reorder), and — checked against the REAL
 * grader, not just schema shape — its correct answer grades correct and every named wrong-path
 * feedback fires for its own specific wrong value (proving the misconception diagnoses are real,
 * not just present).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { Lesson, proportionalReasoningTruth, exactNumberTruth, exactNumberExplorationKeys } from "@/lib/schema";

const FIXES: Array<{ course: string; lessonId: string; stepId: string; conceptTag: string }> = [
  { course: "place-value", lessonId: "pv-02-01", stepId: "k4", conceptTag: "round-10" },
  { course: "place-value", lessonId: "pv-02-02", stepId: "k4", conceptTag: "round-100" },
  { course: "place-value", lessonId: "pv-02-03", stepId: "k4", conceptTag: "round-half" },
  { course: "place-value", lessonId: "pv-02-04", stepId: "k4", conceptTag: "estimation" },
  { course: "multiplication-division", lessonId: "mult-05-03", stepId: "k4", conceptTag: "parity" },
  { course: "multiply-bigger", lessonId: "mb-05-02", stepId: "k4", conceptTag: "multi-step" },
  { course: "multiplication-division", lessonId: "mult-02-04", stepId: "k4", conceptTag: "fact-families" },
  { course: "multiplication-division", lessonId: "mult-02-05", stepId: "k4", conceptTag: "identity-zero" },
  { course: "ratios-rates", lessonId: "rr-05-03", stepId: "k4", conceptTag: "ratios-capstone" },
  { course: "area-surface-volume", lessonId: "asv-01-03", stepId: "k4", conceptTag: "area-formula-choice" },
  { course: "expressions-equations", lessonId: "ee-04-02", stepId: "k4", conceptTag: "solve-add-sub" },
  { course: "expressions-equations", lessonId: "ee-04-03", stepId: "k4", conceptTag: "solve-mult-div" },
  { course: "solid-geometry", lessonId: "sg-05-01", stepId: "k4", conceptTag: "sg-scale-effects" },
  { course: "polar-parametric", lessonId: "pp-01-03", stepId: "k4", conceptTag: "pp-to-polar" },
  { course: "sequences-series", lessonId: "sr-05-03", stepId: "k3", conceptTag: "sr-inf-apply" },
  { course: "trig-graphs-inverses", lessonId: "tg-05-03", stepId: "k4", conceptTag: "tg-solve-all" },
  { course: "trig-identities-equations", lessonId: "ti-01-03", stepId: "k4", conceptTag: "ti-inside-ladder" },
  { course: "trig-identities-equations", lessonId: "ti-04-03", stepId: "k3", conceptTag: "ti-double-action" }
];

function loadLesson(course: string, lessonId: string) {
  const raw = JSON.parse(readFileSync(join("content", "courses", course, "lessons", `${lessonId}.json`), "utf8"));
  return Lesson.parse(raw);
}

/** proportionalReasoningLab's exploration gate is not `revealed`/`requiredExplorations` (that
 * convention belongs to its sibling Lab types) — it is `proportionalUnitRatesAreVerified` in
 * evaluate.ts, matching the real widget: `ProportionalReasoningLabW` requires the learner to type
 * and verify EVERY series pair's unit rate before a final numeric/choice answer is even accepted.
 * Every key present in `unitRates` at its true rate, and listed in `verifiedUnitRates`, is what
 * actually unlocks grading. */
function proportionalVerifiedState(truth: ReturnType<typeof proportionalReasoningTruth>) {
  const unitRates: Record<string, number> = {};
  const verifiedUnitRates: string[] = [];
  for (const series of truth.series) {
    series.pairs.forEach((_, index) => {
      const key = `${series.id}:${index}`;
      unitRates[key] = series.rates[index]!;
      verifiedUnitRates.push(key);
    });
  }
  return { unitRates, verifiedUnitRates };
}

describe.each(FIXES)("scaffold fix — $course/$lessonId ($stepId)", ({ course, lessonId, stepId, conceptTag }) => {
  const lesson = loadLesson(course, lessonId);
  const idx = lesson.steps.findIndex((s) => s.id === stepId);
  const step = lesson.steps[idx];
  const next = lesson.steps[idx + 1];

  it("exists, is a graded check, and sits immediately before the challenge", () => {
    expect(idx).toBeGreaterThan(-1);
    expect(step.kind).toBe("check");
    expect(next?.kind).toBe("challenge");
  });

  it("carries the lesson's own conceptTag (so adaptive remediation groups it correctly)", () => {
    expect(step.conceptTag).toBe(conceptTag);
  });

  it("has two genuinely different explanationVariants (pedagogy gate's own requirement)", () => {
    expect(step.explanationVariants).toBeTruthy();
    const [a, b] = step.explanationVariants!;
    expect(a.trim()).not.toBe(b.trim());
  });

  it("grades its own correct answer as correct, via the real evaluator", () => {
    // rr-05-03/k4 was later upgraded from a plain numeric widget to proportionalReasoningLab
    // (a genuine engine upgrade, not a regression) — its answer is the choice/id the correct
    // exploration derives, not a bare `answer` field on the widget itself.
    if (step.widget!.type === "proportionalReasoningLab") {
      const truth = proportionalReasoningTruth(step.widget as never);
      const { unitRates, verifiedUnitRates } = proportionalVerifiedState(truth);
      expect(evaluate(step.widget!, { unitRates, verifiedUnitRates, numeric: truth.answerNumber }).correct).toBe(true);
      return;
    }
    // sg-05-01/k4 was likewise upgraded to exactNumberLab (S169 solid-geometry wave). The answer
    // is re-derived by the truth function rather than stored on the widget, so assert the same
    // property — the correct value grades correct — through that engine's own API.
    if (step.widget!.type === "exactNumberLab") {
      const revealed = exactNumberExplorationKeys(step.widget as never);
      const truth = exactNumberTruth(step.widget as never);
      expect(truth.answerNumber).toBeTypeOf("number");
      expect(evaluate(step.widget!, { revealed, numeric: truth.answerNumber }).correct).toBe(true);
      return;
    }
    const w = step.widget as { type: "numeric"; answer: number };
    expect(w.type).toBe("numeric");
    expect(evaluate(step.widget!, w.answer).correct).toBe(true);
  });

  it("fires each commonError's OWN diagnostic feedback for its OWN wrong value (not a generic fallback)", () => {
    if (step.widget!.type === "proportionalReasoningLab") {
      const w = step.widget as { type: "proportionalReasoningLab"; numericErrors: Array<{ value: number; feedback: string }> };
      expect(w.numericErrors.length).toBeGreaterThanOrEqual(2);
      const { unitRates, verifiedUnitRates } = proportionalVerifiedState(proportionalReasoningTruth(step.widget as never));
      for (const ce of w.numericErrors) {
        const r = evaluate(step.widget!, { unitRates, verifiedUnitRates, numeric: ce.value });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(ce.feedback);
      }
      return;
    }
    if (step.widget!.type === "exactNumberLab") {
      const w = step.widget as { type: "exactNumberLab"; numericErrors: Array<{ value: number; feedback: string }> };
      expect(w.numericErrors.length).toBeGreaterThanOrEqual(2);
      const revealed = exactNumberExplorationKeys(step.widget as never);
      for (const ce of w.numericErrors) {
        const r = evaluate(step.widget!, { revealed, numeric: ce.value });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(ce.feedback);
      }
      return;
    }
    const w = step.widget as { type: "numeric"; commonErrors: Array<{ value: number; feedback: string }> };
    expect(w.commonErrors.length).toBeGreaterThanOrEqual(2);
    for (const ce of w.commonErrors) {
      const r = evaluate(step.widget!, ce.value);
      expect(r.correct).toBe(false);
      expect(r.feedback).toBe(ce.feedback);
    }
  });
});
