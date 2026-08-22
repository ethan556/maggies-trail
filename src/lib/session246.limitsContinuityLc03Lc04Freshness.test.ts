import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solvePrecalculusPrompt } from "./precalculusIndependent.cjs";
import { PRECALCULUS_GENERATORS } from "./precalculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g12-limits-continuity";
const FORMS = [
  "limits-continuity__lc-onesided__mcq",
  "limits-continuity__lc-onesided__numeric",
  "limits-continuity__lc-infinity__numeric",
  "limits-continuity__lc-endbehavior__mcq",
  "limits-continuity__lc-continuity__mcq",
  "limits-continuity__lc-continuity__numeric",
  "limits-continuity__lc-discontinuity__mcq",
  "limits-continuity__lc-discontinuity__numeric",
  "limits-continuity__lc-ivt__mcq",
  "limits-continuity__lc-ivt__numeric",
] as const;
type LimitForm = typeof FORMS[number];

const EXPECTED_TYPE: Record<LimitForm, "numeric" | "mcq" | "exactNumberLab"> = {
  "limits-continuity__lc-onesided__mcq": "mcq",
  "limits-continuity__lc-onesided__numeric": "numeric",
  "limits-continuity__lc-infinity__numeric": "exactNumberLab",
  "limits-continuity__lc-endbehavior__mcq": "mcq",
  "limits-continuity__lc-continuity__mcq": "mcq",
  "limits-continuity__lc-continuity__numeric": "exactNumberLab",
  "limits-continuity__lc-discontinuity__mcq": "mcq",
  "limits-continuity__lc-discontinuity__numeric": "numeric",
  "limits-continuity__lc-ivt__mcq": "mcq",
  "limits-continuity__lc-ivt__numeric": "exactNumberLab",
};

function assertPromptTruth(form: LimitForm, generated: { widget: unknown; answer: unknown }, seed: string) {
  const widget = WidgetSpec.parse(generated.widget);
  const truth = solvePrecalculusPrompt(form, widget.prompt);
  expect(widget.type, seed).toBe(EXPECTED_TYPE[form]);
  if (widget.type === "numeric") {
    expect(widget.answer, seed).toBe(truth);
    expect(generated.answer, seed).toBe(truth);
    expect(new Set(widget.commonErrors.map((error) => error.value)).size, seed).toBe(widget.commonErrors.length);
    expect(widget.commonErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else if (widget.type === "mcq") {
    const correct = widget.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(truth);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(widget.options.map((option) => option.label)).size, seed).toBe(widget.options.length);
    const lengths = widget.options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(30);
  } else if (widget.type === "exactNumberLab") {
    expect(widget.answerMode, seed).toBe("numeric");
    expect(generated.answer, seed).toBe(truth);
    expect(new Set(widget.numericErrors.map((error) => error.value)).size, seed).toBe(widget.numericErrors.length);
    expect(widget.numericErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else {
    throw new Error(`${form} emitted unsupported surface ${widget.type}`);
  }
  return { prompt: widget.prompt, truth: JSON.stringify(truth) };
}

describe("S246 limits-continuity lc-03/lc-04 generator assurance", () => {
  it("covers the exact 24 consumers and ten coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["lc-03-01", "lc-03-02", "lc-03-03", "lc-04-01", "lc-04-02", "lc-04-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "limits-continuity", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "limits-continuity__lc-onesided__numeric": 2,
      "limits-continuity__lc-onesided__mcq": 2,
      "limits-continuity__lc-infinity__numeric": 4,
      "limits-continuity__lc-endbehavior__mcq": 4,
      "limits-continuity__lc-continuity__mcq": 2,
      "limits-continuity__lc-continuity__numeric": 2,
      "limits-continuity__lc-discontinuity__numeric": 2,
      "limits-continuity__lc-discontinuity__mcq": 2,
      "limits-continuity__lc-ivt__mcq": 2,
      "limits-continuity__lc-ivt__numeric": 2,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(24);
  });

  it("ratchets exactly twelve prompt-derived truth states per form with deterministic replay", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      const correctPositions = new Set<number>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-limits-lc03-lc04|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const observed = assertPromptTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
        if (first.widget.type === "mcq") correctPositions.add(first.widget.options.findIndex((option: { correct?: boolean }) => option.correct));
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(12);
      if (EXPECTED_TYPE[form] === "mcq") expect(correctPositions.size, `${form} answer positions`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps unseen resolver seeds schema-valid, surface-preserving, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-limits-lc03-lc04-resolver|${form}|${index}`;
        const step = { widget: { type: EXPECTED_TYPE[form] }, variant: { gen: GENERATOR, form } };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        assertPromptTruth(form, first!, seed);
      }
    }
  });

  it("handles degree boundaries and one-sided agreement without conflating their cases", () => {
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-endbehavior__mcq",
      "A rational function has leading terms 4x² in the numerator and 3x⁵ in the denominator (degrees 2 and 5). As x approaches +∞, which end behavior is correct?",
    )).toBe("limit 0; denominator degree 5 exceeds numerator degree 2");
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-endbehavior__mcq",
      "A rational function has leading terms -6x³ in the numerator and 4x³ in the denominator (degrees 3 and 3). As x approaches +∞, which end behavior is correct?",
    )).toBe("limit −1.5; numerator degree 3 equals denominator degree 3");
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-endbehavior__mcq",
      "A rational function has leading terms -2x⁵ in the numerator and 7x² in the denominator (degrees 5 and 2). As x approaches +∞, which end behavior is correct?",
    )).toBe("limit −∞; numerator degree 5 exceeds denominator degree 2");
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-onesided__mcq",
      "At x = 4, the left-hand limit is 9 and the right-hand limit is 9. What is the two-sided limit?",
    )).toBe("9; both one-sided limits agree");
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-onesided__mcq",
      "At x = 4, the left-hand limit is 9 and the right-hand limit is 3. What is the two-sided limit?",
    )).toBe("DNE; left 9 differs from right 3");
  });

  it("keeps every end-behavior option structurally parallel and degree-explicit", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const positions = new Set<number>();
    for (let index = 0; index < 240; index += 1) {
      const seed = `s246-limits-endbehavior-parity|${index}`;
      const generated = generator.gen(mulberry32(hashSeed(seed)), "core", "limits-continuity__lc-endbehavior__mcq");
      const widget = WidgetSpec.parse(generated.widget);
      expect(widget.type, seed).toBe("mcq");
      if (widget.type !== "mcq") continue;
      const degrees = /\(degrees (\d+) and (\d+)\)/.exec(widget.prompt);
      expect(degrees, seed).not.toBeNull();
      const [, numeratorDegree, denominatorDegree] = degrees!;
      for (const option of widget.options) {
        expect(option.label.startsWith("limit "), `${seed}: ${option.label}`).toBe(true);
        expect(option.label, `${seed}: numerator degree`).toContain(`degree ${numeratorDegree}`);
        expect(option.label, `${seed}: denominator degree`).toContain(`degree ${denominatorDegree}`);
      }
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(12);
      positions.add(widget.options.findIndex((option) => option.correct));
    }
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });
  it("recomputes valid mutations and rejects inconsistent branches, holes, jumps, and IVT claims", () => {
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-infinity__numeric",
      "For f(x) = (-11x³ + 1)/(4x³ - 2), find the limit as x approaches +∞. Give a decimal to three places.",
    )).toBe(-2.75);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-onesided__numeric",
      "For the left-hand branch, f(x) = 3x + 2 when x > 4. Find the left-hand limit at x = 4.",
    )).toThrow(/inconsistent/);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-continuity__numeric",
      "For x < 2, f(x) = 3x + 1; define f(3) = k. What value of k makes f continuous at x = 2?",
    )).toThrow(/inconsistent boundary/);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-discontinuity__numeric",
      "A graph has a removable hole at x = 4 from [(x - 5)(x + 3)]/(x - 4). What is the hole's y-value?",
    )).toThrow(/do not match/);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-discontinuity__mcq",
      "At x = 2, the left-hand limit is 5 and the right-hand limit is 5. Which discontinuity is shown?",
    )).toThrow(/matching one-sided/);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-ivt__mcq",
      "A function is continuous on [1, 4], with f(1) = 2 and f(4) = 7. What does the Intermediate Value Theorem guarantee?",
    )).toThrow(/sign change/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-ivt__numeric",
      "For the IVT sign check, let f(x) = x² + 3. Compute f(-4).",
    )).toBe(19);
  });
});
