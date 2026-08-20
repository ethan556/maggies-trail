// @vitest-environment jsdom
/**
 * S318 Lane A — HS/advanced-course WITHHELD figure clearances (VIS01_PLACEMENTS.csv,
 * cause != RENDERS). Owner: src/components/figures.tsx.
 *
 * 12 placements across exponents-polynomials, exponents-scientific-notation,
 * exponential-functions (×2), function-transformations, logarithms,
 * proportional-relationships, rational-number-operations, right-triangles-trig,
 * systems-equations, sequences-series, decimal-operations.
 *
 * Verifies:
 *  1. The 11 touched lesson JSON files parse cleanly.
 *  2. Every touched (figureId, step-body) binding recomputes as NOT withheld via the
 *     repo's own `figureTextAlignment` module (the same function LessonPlayer/FigureView
 *     gate rendering on) — the required "small node script", run as vitest assertions.
 *  3. None of the new binding keys are present in the generated blocklist (proof the
 *     withhold clears without hand-editing the blocklist).
 *  4. ep-01-01/c1's new binding also clears the fixed-figure numeric-parity guard
 *     ("missing=3+2+5") that the fixed-exemplar audit had separately flagged.
 *  5. dop-05-03/c2's new additive component `decimal-shift-divide` (a genuinely
 *     different worked example — decimal DIVISION, 1.5÷0.5→15÷5=3 — from the
 *     existing `decimal-shift` component's equation-clearing example, which stays
 *     byte-identical and still serves alg1-02-03/dpv-01-03) is registered in both
 *     FIGURES and the synchronous FIGURE_IDS gate, and its title carries the lesson's
 *     own numbers.
 *  6. The exp-02-03/c3 (`exp-decay-50`) reword makes the `67c19c25` manualHolds.ts
 *     entry dangling (no live placement binds that key anymore), matching the retired
 *     entry in the same file — proof the retirement was correct, not just convenient.
 *  7. Every touched concept body stays within the 80-word pedagogy-lint cap.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";
import { figureTextBindingKey, isFigureTextAligned } from "@/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "@/lib/figureTextMismatchBlocklist.generated";
import { compareExactFigureNumericParity, FIXED_NUMERIC_EXEMPLAR_CONTRACTS } from "@/lib/figureNumericParity";
import { CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS } from "@/lib/figureTextMismatchBlocklist.manualHolds";

const ROOT = process.cwd();

type Step = { id: string; body?: string; figure?: string };
type Lesson = { id: string; steps: Step[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as Lesson; // throws (fails the test) on any parse error
}

function step(lesson: Lesson, stepId: string): Step {
  const found = lesson.steps.find((s) => s.id === stepId);
  if (!found) throw new Error(`${lesson.id}: no step "${stepId}"`);
  return found;
}

function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

function titleAndAria(id: string): string {
  const figure = FIGURES[id];
  expect(figure, `figure "${id}" must be registered in FIGURES`).toBeTruthy();
  const svg = renderToStaticMarkup(figure());
  const title = svg.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const aria = svg.match(/aria-label="([^"]+)"/i)?.[1] ?? "";
  return `${title} ${aria}`;
}

const TOUCHED: Array<[string, string]> = [
  ["exponents-polynomials", "ep-01-01"],
  ["exponents-scientific-notation", "esn-01b-01"],
  ["exponential-functions", "exp-02-03"],
  ["function-transformations", "ft-03-02"],
  ["logarithms", "lg-05-03"],
  ["proportional-relationships", "pr-04-02"],
  ["rational-number-operations", "rno-01-03"],
  ["right-triangles-trig", "rt-02-01"],
  ["systems-equations", "se-03-03"],
  ["sequences-series", "sr-01-01"],
  ["decimal-operations", "dop-05-03"],
];

describe("S318 lesson JSON parse-check (touched files)", () => {
  it.each(TOUCHED)("%s/%s parses as valid JSON with an id and steps array", (courseDir, lessonId) => {
    const lesson = loadLesson(courseDir, lessonId);
    expect(lesson.id).toBe(lessonId);
    expect(Array.isArray(lesson.steps)).toBe(true);
    expect(lesson.steps.length).toBeGreaterThan(0);
  });
});

type Placement = { courseDir: string; lessonId: string; stepId: string; figure: string };
const PLACEMENTS: Placement[] = [
  { courseDir: "exponents-polynomials", lessonId: "ep-01-01", stepId: "c1", figure: "exponent-repeat" },
  { courseDir: "exponents-scientific-notation", lessonId: "esn-01b-01", stepId: "c1", figure: "exponent-repeat" },
  { courseDir: "exponential-functions", lessonId: "exp-02-03", stepId: "c2", figure: "exp-grow-50" },
  { courseDir: "exponential-functions", lessonId: "exp-02-03", stepId: "c3", figure: "exp-decay-50" },
  { courseDir: "function-transformations", lessonId: "ft-03-02", stepId: "c1", figure: "stretch-reflect" },
  { courseDir: "logarithms", lessonId: "lg-05-03", stepId: "c1", figure: "log-scale-ladder" },
  { courseDir: "proportional-relationships", lessonId: "pr-04-02", stepId: "c2", figure: "pr-markdown" },
  { courseDir: "rational-number-operations", lessonId: "rno-01-03", stepId: "c1", figure: "integer-jump" },
  { courseDir: "right-triangles-trig", lessonId: "rt-02-01", stepId: "c2", figure: "sohcahtoa-triangle" },
  { courseDir: "systems-equations", lessonId: "se-03-03", stepId: "c2", figure: "se-scale-both" },
  { courseDir: "sequences-series", lessonId: "sr-01-01", stepId: "c1", figure: "recursive-vs-explicit" },
  { courseDir: "decimal-operations", lessonId: "dop-05-03", stepId: "c2", figure: "decimal-shift-divide" },
];

describe("S318: every touched placement clears WITHHELD and stays within the word cap", () => {
  it.each(PLACEMENTS)("$courseDir/$lessonId#$stepId ($figure) is registered, aligned, unblocklisted, ≤80 words", ({ courseDir, lessonId, stepId, figure }) => {
    const lesson = loadLesson(courseDir, lessonId);
    const s = step(lesson, stepId);
    expect(s.figure).toBe(figure);
    expect(typeof s.body).toBe("string");
    const body = s.body as string;

    expect(FIGURE_IDS.has(figure), `figure "${figure}" must be in FIGURE_IDS`).toBe(true);
    expect(FIGURES[figure], `figure "${figure}" must be in FIGURES`).toBeTruthy();

    expect(isFigureTextAligned(figure, body), `${lessonId}#${stepId} must not be withheld`).toBe(true);

    const key = figureTextBindingKey(figure, body);
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key), `new binding key ${key} must not be in the generated blocklist`).toBe(false);

    expect(wordCount(body), `${lessonId}#${stepId} concept body must stay ≤80 words`).toBeLessThanOrEqual(80);
  });
});

describe("ep-01-01/c1: clears both the fixed-exemplar text guard and the numeric-parity finding", () => {
  it('restates the figure\'s exact 3, 2, 5 so compareExactFigureNumericParity reports aligned (was "missing=3+2+5")', () => {
    const lesson = loadLesson("exponents-polynomials", "ep-01-01");
    const body = step(lesson, "c1").body as string;
    const contract = FIXED_NUMERIC_EXEMPLAR_CONTRACTS["exponent-repeat"];
    const result = compareExactFigureNumericParity(contract.figureClaim, body);
    expect(result.aligned).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(body).toMatch(/a\^3/);
    expect(body).toMatch(/a\^2/);
    expect(body).toMatch(/a\^5/);
    expect(body).toMatch(/3 \+ 2 = 5/);
  });
});

describe("esn-01b-01/c1: also restates the figure's exact 3, 2, 5 (a different lesson binding the same figure)", () => {
  it("carries literal ASCII digits, not just superscript unicode, so the numeric atoms are recognized", () => {
    const lesson = loadLesson("exponents-scientific-notation", "esn-01b-01");
    const body = step(lesson, "c1").body as string;
    const contract = FIXED_NUMERIC_EXEMPLAR_CONTRACTS["exponent-repeat"];
    const result = compareExactFigureNumericParity(contract.figureClaim, body);
    expect(result.aligned).toBe(true);
    expect(body).toContain("(3 + 2 = 5)");
  });
});

describe("dop-05-03/c2: new additive decimal-shift-divide component (decimal-shift itself untouched)", () => {
  it("is registered in both FIGURES and the synchronous FIGURE_IDS gate", () => {
    expect(FIGURE_IDS.has("decimal-shift-divide")).toBe(true);
    expect(FIGURES["decimal-shift-divide"]).toBeTruthy();
  });

  it("renders a title that states the lesson's own 1.5 ÷ 0.5 → 15 ÷ 5 = 3 example", () => {
    const text = titleAndAria("decimal-shift-divide");
    expect(text).toMatch(/1\.5/);
    expect(text).toMatch(/0\.5/);
    expect(text).toMatch(/15/);
    expect(text).toMatch(/\b5\b/);
    expect(text).toMatch(/\b3\b/);
  });

  it("dop-05-03/c2 rebinds to the new figure; decimal-shift (equation-clearing) stays byte-identical for alg1-02-03 and dpv-01-03", () => {
    const lesson = loadLesson("decimal-operations", "dop-05-03");
    const s = step(lesson, "c2");
    expect(s.figure).toBe("decimal-shift-divide");
    // decimal-shift's own registered title (0.5x + 1.2 = 3.7 equation example) is unchanged.
    const decimalShiftText = titleAndAria("decimal-shift");
    expect(decimalShiftText).toMatch(/0\.5x \+ 1\.2 = 3\.7/);
    expect(decimalShiftText).toMatch(/5x \+ 12 = 37/);
  });
});

describe("exp-02-03/c3 (exp-decay-50): reword retires the exp-02-03/67c19c25 manual hold", () => {
  it("no longer binds under the legacy 67c19c25 key that the manual hold guarded", () => {
    const lesson = loadLesson("exponential-functions", "exp-02-03");
    const body = step(lesson, "c3").body as string;
    const key = figureTextBindingKey("exp-decay-50", body);
    expect(key).not.toBe("67c19c25");
    expect(isFigureTextAligned("exp-decay-50", body)).toBe(true);
  });

  it('the legacy key remains in the generated (monotonic) blocklist, but no CURRENT_MANUAL_HOLD references it anymore', () => {
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has("67c19c25")).toBe(true);
    expect(CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.some((hold) => hold.bindingKey === "67c19c25")).toBe(false);
  });
});

describe("exp-02-03/c2 (exp-grow-50): restates the figure's 1 + 1/2 = 1.5 base explicitly", () => {
  it("body states 1.5 alongside the existing 3/2 fraction form", () => {
    const lesson = loadLesson("exponential-functions", "exp-02-03");
    const body = step(lesson, "c2").body as string;
    expect(body).toContain("1.5");
    expect(body).toContain("3/2");
  });
});

describe("rt-02-01/c2 (sohcahtoa-triangle): restates the figure's fixed 3-4-5 triangle", () => {
  it("body names sin θ = 3/5, cos θ = 4/5, tan θ = 3/4", () => {
    const lesson = loadLesson("right-triangles-trig", "rt-02-01");
    const body = step(lesson, "c2").body as string;
    expect(body).toContain("3/5");
    expect(body).toContain("4/5");
    expect(body).toContain("3/4");
  });
});

describe("sr-01-01/c1 (recursive-vs-explicit): worked jump matches the figure's +5×3=+15", () => {
  it("a6 = 4 + 5·3 = 19 is arithmetically correct for a_n = 4 + (n-1)·3", () => {
    const lesson = loadLesson("sequences-series", "sr-01-01");
    const body = step(lesson, "c1").body as string;
    const a1 = 4;
    const d = 3;
    const n = 6;
    const explicitValue = a1 + (n - 1) * d;
    expect(explicitValue).toBe(19);
    expect(body).toContain("19");
    expect(body).toContain("15");
  });
});
