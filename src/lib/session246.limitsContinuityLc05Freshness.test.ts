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
  "limits-continuity__lc-avg-rate__mcq",
  "limits-continuity__lc-avg-rate__numeric",
  "limits-continuity__lc-derivative__mcq",
  "limits-continuity__lc-derivative__numeric",
  "limits-continuity__lc-series-limit__mcq",
  "limits-continuity__lc-series-limit__numeric",
] as const;
type LimitForm = typeof FORMS[number];

const EXPECTED_TYPE: Record<LimitForm, "numeric" | "mcq" | "exactNumberLab"> = {
  "limits-continuity__lc-avg-rate__mcq": "mcq",
  "limits-continuity__lc-avg-rate__numeric": "numeric",
  "limits-continuity__lc-derivative__mcq": "mcq",
  "limits-continuity__lc-derivative__numeric": "numeric",
  "limits-continuity__lc-series-limit__mcq": "mcq",
  "limits-continuity__lc-series-limit__numeric": "exactNumberLab",
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
    expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(25);
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

describe("S246 limits-continuity lc-05 generator assurance", () => {
  it("covers the exact twelve consumers and six coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["lc-05-01", "lc-05-02", "lc-05-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "limits-continuity", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "limits-continuity__lc-avg-rate__numeric": 3,
      "limits-continuity__lc-avg-rate__mcq": 1,
      "limits-continuity__lc-derivative__mcq": 1,
      "limits-continuity__lc-derivative__numeric": 3,
      "limits-continuity__lc-series-limit__numeric": 3,
      "limits-continuity__lc-series-limit__mcq": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(12);
  });

  it("ratchets twelve prompt-derived truth states per form with deterministic replay", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      const correctPositions = new Set<number>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-limits-lc05|${form}|${index}`;
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
        const seed = `s246-limits-lc05-resolver|${form}|${index}`;
        const step = { widget: { type: EXPECTED_TYPE[form] }, variant: { gen: GENERATOR, form } };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        assertPromptTruth(form, first!, seed);
      }
    }
  });

  it("recomputes adversarial prompts and rejects inconsistent mathematics", () => {
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-avg-rate__numeric",
      "For f(x) = 7x² − 3x + 2, find the average rate of change on [-4, 6].",
    )).toBe(11);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-avg-rate__numeric",
      "For f(x) = 7x² − 3x + 2, find the average rate of change on [6, -4].",
    )).toThrow(/not increasing/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-derivative__mcq",
      "For f(x) = 6x² + 5x − 8, the difference quotient simplifies to 12a + 5 + 6h. As h approaches 0, which formula is f′(a)?",
    )).toBe("f′(a) = 12a + 5");
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-derivative__mcq",
      "For f(x) = 6x² + 5x − 8, the difference quotient simplifies to 11a + 5 + 6h. As h approaches 0, which formula is f′(a)?",
    )).toThrow(/inconsistent/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-derivative__numeric",
      "For f(x) = 6x² + 5x − 8, use the difference-quotient limit to find f′(-3).",
    )).toBe(-31);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-series-limit__numeric",
      "A geometric series has first term 7/8 and common ratio 2/5. Find its infinite sum a/(1 − r). Give a decimal to three places.",
    )).toBe(1.458);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-series-limit__mcq",
      "A geometric series has first term 7/8 and common ratio 5/4. Which infinite sum is correct?",
    )).toThrow(/does not converge/);
  });
});