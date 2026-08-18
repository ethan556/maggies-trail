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
  "limits-continuity__lc-limit-idea__mcq",
  "limits-continuity__lc-limit-idea__numeric",
  "limits-continuity__lc-read-limit__numeric",
  "limits-continuity__lc-dne__mcq",
  "limits-continuity__lc-dne__numeric",
] as const;

type Lc01Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<Lc01Form, "numeric" | "mcq"> = {
  "limits-continuity__lc-limit-idea__mcq": "mcq",
  "limits-continuity__lc-limit-idea__numeric": "numeric",
  "limits-continuity__lc-read-limit__numeric": "numeric",
  "limits-continuity__lc-dne__mcq": "mcq",
  "limits-continuity__lc-dne__numeric": "numeric",
};

function assertPromptTruth(form: Lc01Form, generated: { widget: unknown; answer: unknown }, seed: string) {
  const widget = WidgetSpec.parse(generated.widget);
  const truth = solvePrecalculusPrompt(form, widget.prompt);
  expect(widget.type, seed).toBe(EXPECTED_TYPE[form]);
  if (widget.type === "numeric") {
    expect(widget.answer, seed).toBe(truth);
    expect(generated.answer, seed).toBe(truth);
    expect(widget.commonErrors.length, seed).toBeGreaterThanOrEqual(2);
    expect(new Set(widget.commonErrors.map((error) => error.value)).size, seed).toBe(widget.commonErrors.length);
    expect(widget.commonErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else if (widget.type === "mcq") {
    const correct = widget.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(truth);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(widget.options.map((option) => option.label)).size, seed).toBe(widget.options.length);
    const lengths = widget.options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(20);
  } else {
    throw new Error(`${form} emitted unsupported surface ${widget.type}`);
  }
  return { prompt: widget.prompt, truth: JSON.stringify(truth) };
}

describe("S246 limits-continuity lc-01 generator assurance", () => {
  it("covers the exact 11 declared consumers across five coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["lc-01-01", "lc-01-02", "lc-01-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "limits-continuity", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "limits-continuity__lc-limit-idea__numeric": 3,
      "limits-continuity__lc-limit-idea__mcq": 1,
      "limits-continuity__lc-read-limit__numeric": 3,
      "limits-continuity__lc-dne__mcq": 3,
      "limits-continuity__lc-dne__numeric": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(11);
  });

  it("ratchets twelve prompt and truth states per form with deterministic replay", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      const correctPositions = new Set<number>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-limits-lc01|${form}|${index}`;
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

  it("keeps unseen resolver seeds schema-valid, surface-preserving, and independently solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-limits-lc01-resolver|${form}|${index}`;
        const step = {
          widget: { type: EXPECTED_TYPE[form] },
          conceptTag: form.split("__", 2)[1],
          variant: { gen: GENERATOR, form },
        };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        assertPromptTruth(form, first!, seed);
      }
    }
  });

  it("recomputes valid mutations and rejects prompts that violate the mathematical contract", () => {
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-limit-idea__numeric",
      "Near x = 3, a table shows 7.8 from the left and 8.2 from the right. What value do both sides approach?",
    )).toBe(8);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-limit-idea__numeric",
      "Near x = 3, a table shows 8.2 from the left and 7.8 from the right. What value do both sides approach?",
    )).toThrow(/symmetrically bracket/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-read-limit__numeric",
      "The graph is the continuous line f(x) = -5x + 4. Find the limit as x approaches -3.",
    )).toBe(19);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-limit-idea__mcq",
      "As x approaches 2, the curve approaches 7, while the plotted point gives f(2) = 7. What is the limit?",
    )).toThrow(/does not distinguish/);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-dne__mcq",
      "At x = 2, the left-hand limit is 5 and the right-hand limit is 5. What is the two-sided limit?",
    )).toThrow(/equal one-sided limits/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-dne__numeric",
      "At x = 9, both the left-hand and right-hand limits equal -12. What is the two-sided limit?",
    )).toBe(-12);
  });
});
