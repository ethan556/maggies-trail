// @vitest-environment jsdom
/**
 * S318 Lane A — WITHHELD figure-placement clearance for division-fluency-g3,
 * multiplication-division, word-problems-g3 (19 placements from
 * reports/vis/VIS01_PLACEMENTS.csv whose cause != RENDERS).
 *
 * mult3-missing-factor (7 division-fluency-g3 placements + 1 word-problems-g3
 * placement) and mult3-fact-family (1 placement) share ONE truthful pattern:
 * a new, additive, typed-props helper (`Mult3MissingFactorExample`,
 * `Mult3FactFamilyExample`) that lets each lesson step bind its OWN real
 * numbers, instead of eight prose contortions forced around one fixed 4×▢=12
 * (or 3/4/12) exemplar. mult3-fair-shares, mult3-estimate, and
 * number-line-jumps each get one similar parameterized instance where the
 * lesson's own worked example genuinely differs from the fixed exemplar.
 * mult3-array, mult3-flip, mult3-break-apart, number-line-jumps (x2),
 * g3w-subtract-once, and g3w-multiply-then-add are cleared by rewording the
 * adjacent lesson prose to state the fixed figure's own real numbers — no
 * component change needed there. The original fixed components
 * (`Mult3MissingFactor`, `Mult3FactFamily`, `Mult3FairShares`,
 * `Mult3Estimate`, `NumberLineJumps`, `Mult3Array`, `Mult3Flip`,
 * `Mult3BreakApart`, `G3wSubtractOnce`, `G3wMultiplyThenAdd`) and every one
 * of their OTHER bindings are byte-unmutated.
 *
 * Verifies:
 *  1. All touched lesson JSON files still parse cleanly.
 *  2. Every touched (figureId, step-body) binding recomputes as NOT withheld
 *     via the repo's own `figureTextAlignment` module (the same function
 *     LessonPlayer/FigureView gate rendering on) and is registered in the
 *     synchronous `FIGURE_IDS` existence set.
 *  3. None of the 19 bindings collide with any key in the generated
 *     figure/text mismatch blocklist (proof no hand-edit of that file was
 *     needed or made).
 *  4. Every touched body is <=80 words.
 *  5. The 11 new parameterized figure components render with role="img", a
 *     <title>, and the real bound numbers in their visible text/aria-label.
 *  6. Every non-target figure/concept.figure key in the touched lesson files
 *     is unchanged (only the 19 named placements were rebound/reworded).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";
import { figureTextBindingKey, isFigureTextAligned } from "@/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "@/lib/figureTextMismatchBlocklist.generated";

const ROOT = process.cwd();

type Step = { id: string; body?: string; figure?: string };
type RemedialConcept = { id: string; body?: string; figure?: string };
type Remedial = { concept: RemedialConcept; check?: { id: string; body?: string } };
type Lesson = { id: string; steps: Step[]; remedials?: Remedial[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as Lesson; // throws (fails the test) on any parse error
}

function findBody(lesson: Lesson, stepId: string): string {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (step) return step.body ?? "";
  const remedial = lesson.remedials?.find((r) => r.concept.id === stepId);
  if (remedial) return remedial.concept.body ?? "";
  throw new Error(`step ${stepId} not found`);
}

function findFigure(lesson: Lesson, stepId: string): string | undefined {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (step) return step.figure;
  const remedial = lesson.remedials?.find((r) => r.concept.id === stepId);
  if (remedial) return remedial.concept.figure;
  throw new Error(`step ${stepId} not found`);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

type Target = { courseDir: string; lessonId: string; stepId: string; figure: string };

const targets: Target[] = [
  { courseDir: "division-fluency-g3", lessonId: "df3-01-04", stepId: "c1", figure: "mult3-missing-factor-6x7" },
  { courseDir: "division-fluency-g3", lessonId: "df3-01-04", stepId: "rem-g3d-div67-c", figure: "mult3-missing-factor-6x5" },
  { courseDir: "division-fluency-g3", lessonId: "df3-02-01", stepId: "c1", figure: "mult3-missing-factor-8x9" },
  { courseDir: "division-fluency-g3", lessonId: "df3-02-03", stepId: "c1", figure: "mult3-missing-factor-7x8" },
  { courseDir: "division-fluency-g3", lessonId: "df3-02-03", stepId: "rem-g3d-think-mult-c", figure: "mult3-missing-factor-7x7" },
  { courseDir: "division-fluency-g3", lessonId: "df3-02-04", stepId: "c1", figure: "mult3-missing-factor-6x9" },
  { courseDir: "division-fluency-g3", lessonId: "df3-02-04", stepId: "rem-g3d-missing-c", figure: "mult3-missing-factor-8x7" },
  { courseDir: "division-fluency-g3", lessonId: "df3-03-03", stepId: "rem-g3d-mixed-c", figure: "mult3-fact-family-5x7" },
  { courseDir: "word-problems-g3", lessonId: "g3w-02-01", stepId: "c2", figure: "mult3-missing-factor-6x7" },
  { courseDir: "multiplication-division", lessonId: "mult-01-02", stepId: "c2", figure: "mult3-array" },
  { courseDir: "multiplication-division", lessonId: "mult-01-03", stepId: "c1", figure: "number-line-jumps" },
  { courseDir: "multiplication-division", lessonId: "mult-01-04", stepId: "c2", figure: "number-line-jumps" },
  { courseDir: "multiplication-division", lessonId: "mult-01-05", stepId: "c2", figure: "mult3-flip" },
  { courseDir: "multiplication-division", lessonId: "mult-02-01", stepId: "c2", figure: "mult3-fair-shares-15-over-5" },
  { courseDir: "multiplication-division", lessonId: "mult-02-03", stepId: "c2", figure: "number-line-jumps-7x5" },
  { courseDir: "multiplication-division", lessonId: "mult-03-05", stepId: "c1", figure: "mult3-break-apart" },
  { courseDir: "multiplication-division", lessonId: "mult-04-05", stepId: "c2", figure: "mult3-estimate-6x9" },
  { courseDir: "word-problems-g3", lessonId: "g3w-01-03", stepId: "c2", figure: "g3w-subtract-once" },
  { courseDir: "word-problems-g3", lessonId: "g3w-03-04", stepId: "c2", figure: "g3w-multiply-then-add" },
];

describe("S318 lane A (G3 mult/div): parses cleanly", () => {
  it("every touched lesson JSON parses", () => {
    for (const t of new Map(targets.map((t) => [`${t.courseDir}/${t.lessonId}`, t])).values()) {
      expect(() => loadLesson(t.courseDir, t.lessonId)).not.toThrow();
    }
  });
});

describe("S318 lane A (G3 mult/div): figure key correct, body passes isFigureTextAligned", () => {
  for (const t of targets) {
    it(`${t.lessonId}/${t.stepId} (${t.figure}) is registered, aligned, unblocklisted, <=80 words`, () => {
      const lesson = loadLesson(t.courseDir, t.lessonId);
      expect(findFigure(lesson, t.stepId)).toBe(t.figure);
      expect(FIGURE_IDS.has(t.figure)).toBe(true);
      expect(FIGURES[t.figure]).toBeDefined();

      const body = findBody(lesson, t.stepId);
      expect(wordCount(body)).toBeLessThanOrEqual(80);

      const key = figureTextBindingKey(t.figure, body);
      expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key)).toBe(false);
      expect(isFigureTextAligned(t.figure, body)).toBe(true);
    });
  }
});

describe("S318 lane A (G3 mult/div): the 11 new parameterized figures render truthfully", () => {
  const cases: { id: string; expectSubstrings: string[] }[] = [
    { id: "mult3-missing-factor-6x7", expectSubstrings: ["6 × ▢ = 42", "▢ = 7"] },
    { id: "mult3-missing-factor-6x5", expectSubstrings: ["6 × ▢ = 30", "▢ = 5"] },
    { id: "mult3-missing-factor-8x9", expectSubstrings: ["8 × ▢ = 72", "▢ = 9"] },
    { id: "mult3-missing-factor-7x8", expectSubstrings: ["7 × ▢ = 56", "▢ = 8"] },
    { id: "mult3-missing-factor-7x7", expectSubstrings: ["7 × ▢ = 49", "▢ = 7"] },
    { id: "mult3-missing-factor-6x9", expectSubstrings: ["6 × ▢ = 54", "▢ = 9"] },
    { id: "mult3-missing-factor-8x7", expectSubstrings: ["8 × ▢ = 56", "▢ = 7"] },
    { id: "mult3-fact-family-5x7", expectSubstrings: ["5×7=35", "7×5=35", "35÷5=7", "35÷7=5"] },
    { id: "mult3-fair-shares-15-over-5", expectSubstrings: ["15 ÷ 5 = 3", "15 shared into 5 groups"] },
    { id: "mult3-estimate-6x9", expectSubstrings: ["6 × 9 ≈ 6 × 10 =", "exact 54 is close to 60"] },
    { id: "number-line-jumps-7x5", expectSubstrings: ["7 hops of 5", "lands on 35"] },
  ];
  for (const c of cases) {
    it(`${c.id} renders role="img" with a title and its real numbers`, () => {
      const Component = FIGURES[c.id];
      expect(Component).toBeDefined();
      const markup = renderToStaticMarkup(createElement(Component));
      expect(markup).toContain('role="img"');
      expect(markup).toMatch(/<title>/);
      for (const s of c.expectSubstrings) expect(markup).toContain(s);
    });
  }

  it("mult3-missing-factor-6x7 and mult3-missing-factor-8x7/-7x8 stay distinct instances (order matters)", () => {
    const a = renderToStaticMarkup(createElement(FIGURES["mult3-missing-factor-7x8"]));
    const b = renderToStaticMarkup(createElement(FIGURES["mult3-missing-factor-8x7"]));
    expect(a).toContain("7 × ▢ = 56");
    expect(b).toContain("8 × ▢ = 56");
    expect(a).not.toBe(b);
  });

  it("new missing-factor/fact-family/estimate titles carry no digits, so they are not admitted to the renderer-derived numeric-claims map", () => {
    for (const id of ["mult3-missing-factor-6x7", "mult3-missing-factor-6x5", "mult3-missing-factor-8x9", "mult3-missing-factor-7x8", "mult3-missing-factor-7x7", "mult3-missing-factor-6x9", "mult3-missing-factor-8x7", "mult3-estimate-6x9"]) {
      const markup = renderToStaticMarkup(createElement(FIGURES[id]));
      const title = markup.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
      expect(/\d/.test(title)).toBe(false);
    }
  });
});

describe("S318 lane A (G3 mult/div): original fixed components are byte-unmutated", () => {
  it("Mult3MissingFactor still renders the fixed 4×▢=12 exemplar", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["mult3-missing-factor"]));
    expect(markup).toContain("4 × ▢ = 12");
    expect(markup).toContain("▢ = 3");
  });
  it("Mult3FactFamily still renders the fixed 3/4/12 exemplar", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["mult3-fact-family"]));
    expect(markup).toContain("A fact family from 3, 4, and 12.");
  });
  it("Mult3FairShares still renders the fixed 12÷3=4 exemplar", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["mult3-fair-shares"]));
    expect(markup).toContain("12 ÷ 3 = 4 each");
  });
  it("Mult3Estimate still renders the fixed 4×19≈80 exemplar", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["mult3-estimate"]));
    expect(markup).toContain("exact 76 is close to 80");
  });
  it("NumberLineJumps still renders the fixed 3-hops-of-4 exemplar", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["number-line-jumps"]));
    expect(markup).toContain("3 hops of 4 → lands on 12");
  });
  it("Mult3Array, Mult3Flip, Mult3BreakApart, G3wSubtractOnce, G3wMultiplyThenAdd are unchanged", () => {
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-array"]))).toContain("4 rows × 6 columns = 24");
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-flip"]))).toContain("3 × 4");
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-break-apart"]))).toContain("7 × 6 = 5×6 + 2×6");
    expect(renderToStaticMarkup(createElement(FIGURES["g3w-subtract-once"]))).toContain("20 − 3 = 17");
    expect(renderToStaticMarkup(createElement(FIGURES["g3w-multiply-then-add"]))).toContain("(5 × 6) + 4 = 34");
  });
});

describe("S318 lane A (G3 mult/div): only the 19 named placements were touched", () => {
  it("every other figure/concept.figure key in the 16 touched lesson files is unchanged", () => {
    const expected: Record<string, { courseDir: string; steps: Record<string, string | undefined> }> = {
      "df3-01-04": { courseDir: "division-fluency-g3", steps: { c1: "mult3-missing-factor-6x7", c2: "mult3-fact-family", "rem-g3d-div67-c": "mult3-missing-factor-6x5" } },
      "df3-02-01": { courseDir: "division-fluency-g3", steps: { c1: "mult3-missing-factor-8x9", c2: "mult3-divide-by-nine", "rem-g3d-div89-c": "mult3-divide-by-nine" } },
      "df3-02-03": { courseDir: "division-fluency-g3", steps: { c1: "mult3-missing-factor-7x8", c2: "mult3-fact-family", "rem-g3d-think-mult-c": "mult3-missing-factor-7x7" } },
      "df3-02-04": { courseDir: "division-fluency-g3", steps: { c1: "mult3-missing-factor-6x9", c2: "mult3-fact-family", "rem-g3d-missing-c": "mult3-missing-factor-8x7" } },
      "df3-03-03": { courseDir: "division-fluency-g3", steps: { c1: "mult3-fact-family", c2: "mult3-array", "rem-g3d-mixed-c": "mult3-fact-family-5x7" } },
      "g3w-02-01": { courseDir: "word-problems-g3", steps: { c1: "ee-variable", c2: "mult3-missing-factor-6x7", "rem-g3w-variable-c": "mult3-missing-factor" } },
      "mult-01-02": { courseDir: "multiplication-division", steps: { c1: "mult3-array", c2: "mult3-array" } },
      "mult-01-03": { courseDir: "multiplication-division", steps: { c1: "number-line-jumps", c2: "number-line-jumps" } },
      "mult-01-04": { courseDir: "multiplication-division", steps: { c1: "number-line-jumps", c2: "number-line-jumps" } },
      "mult-01-05": { courseDir: "multiplication-division", steps: { c1: "mult3-flip", c2: "mult3-flip" } },
      "mult-02-01": { courseDir: "multiplication-division", steps: { c1: "mult3-fair-shares", c2: "mult3-fair-shares-15-over-5" } },
      "mult-02-03": { courseDir: "multiplication-division", steps: { c1: "mult3-missing-factor", c2: "number-line-jumps-7x5" } },
      "mult-03-05": { courseDir: "multiplication-division", steps: { c1: "mult3-break-apart", c2: "mult3-break-apart" } },
      "mult-04-05": { courseDir: "multiplication-division", steps: { c1: "mult3-estimate", c2: "mult3-estimate-6x9" } },
      "g3w-01-03": { courseDir: "word-problems-g3", steps: { c1: "mb-multistep", c2: "g3w-subtract-once" } },
      "g3w-03-04": { courseDir: "word-problems-g3", steps: { c1: "dop-word-expr", c2: "g3w-multiply-then-add" } },
    };
    for (const [lessonId, { courseDir, steps }] of Object.entries(expected)) {
      const lesson = loadLesson(courseDir, lessonId);
      for (const [stepId, figure] of Object.entries(steps)) {
        expect(findFigure(lesson, stepId)).toBe(figure);
      }
    }
  });
});
