import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-integration-applications";
const FORMS = [
  "integration-applications__ia-average-value__numeric",
  "integration-applications__ia-average-value__mcq",
] as const;
type Ia03Form = typeof FORMS[number];
const EXPECTED_TYPE: Record<Ia03Form, "numeric" | "mcq"> = {
  "integration-applications__ia-average-value__numeric": "numeric",
  "integration-applications__ia-average-value__mcq": "mcq",
};

const assertPromptDerivedTruth = (form: Ia03Form, generated: { widget: unknown; answer: unknown }, seed: string) => {
  const parsed = WidgetSpec.parse(generated.widget);
  const independent = solveCalculusPrompt(form, parsed.prompt);
  expect(parsed.type, seed).toBe(EXPECTED_TYPE[form]);
  if (parsed.type === "numeric") {
    expect(parsed.answer, seed).toBe(independent);
    expect(generated.answer, seed).toBe(independent);
    expect(new Set(parsed.commonErrors.map((error) => error.value)).size, seed).toBe(parsed.commonErrors.length);
    expect(parsed.commonErrors.every((error) => error.value !== independent), seed).toBe(true);
  } else if (parsed.type === "mcq") {
    const correct = parsed.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(independent);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(parsed.options.map((option) => option.label)).size, seed).toBe(parsed.options.length);
  } else {
    throw new Error(`${form} produced unsupported widget ${parsed.type}`);
  }
  return { prompt: parsed.prompt, truth: JSON.stringify(independent) };
};

describe("S246 ia-03 average-value generator assurance", () => {
  it("covers the exact four declared consumers across two coherent forms", () => {
    const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "integration-applications", "lessons", "ia-03-01.json"), "utf8"));
    const counts = new Map<string, number>();
    for (const step of lesson.steps) {
      const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
      if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
    }
    expect(Object.fromEntries(counts)).toEqual({
      "integration-applications__ia-average-value__numeric": 3,
      "integration-applications__ia-average-value__mcq": 1,
    });
  });

  it("ratchets 12 prompt and truth variants per form with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-integration-ia03|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(generator.gen(mulberry32(hashSeed(seed)), "core", form), seed).toEqual(first);
        const observed = assertPromptDerivedTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(12);
    }
  });

  it("keeps unseen resolver seeds schema-valid, deterministic, surface-preserving, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-integration-ia03-resolver|${form}|${index}`;
        const step = { widget: { type: EXPECTED_TYPE[form] }, conceptTag: form.split("__", 2)[1], variant: { gen: GENERATOR, form } };
        const first = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(variantForStep(step, seed, "stretch"), seed).toEqual(first);
        assertPromptDerivedTruth(form, first!, seed);
      }
    }
  });

  it("recomputes changed averages and rejects zero-width intervals", () => {
    expect(solveCalculusPrompt(
      "integration-applications__ia-average-value__numeric",
      "Find the average value of f(x) = 5x^2 on [0, 6], to three decimal places.",
    )).toBe(60);
    expect(solveCalculusPrompt(
      "integration-applications__ia-average-value__numeric",
      "A velocity is v(t) = 7t + 3 on [0, 8]. Find the average velocity.",
    )).toBe(31);
    expect(() => solveCalculusPrompt(
      "integration-applications__ia-average-value__numeric",
      "Find the average value of f(x) = 5x^2 on [0, 0].",
    )).toThrow(/must be positive/);
    expect(() => solveCalculusPrompt(
      "integration-applications__ia-average-value__mcq",
      "For f(x) = 5x^2 on [0, 0], which expression gives the average value?",
    )).toThrow(/must be positive/);
  });
});
