import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-integration-accumulation";
const FORMS = [
  "integration-accumulation__in-antiderivative__mcq",
  "integration-accumulation__in-antiderivative__numeric",
  "integration-accumulation__in-constant-of-integration__numeric",
  "integration-accumulation__in-constant-of-integration__mcq",
  "integration-accumulation__in-library__mcq",
  "integration-accumulation__in-library__numeric",
] as const;

type In04Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<In04Form, "numeric" | "mcq" | "exactNumberLab"> = {
  "integration-accumulation__in-antiderivative__mcq": "mcq",
  "integration-accumulation__in-antiderivative__numeric": "numeric",
  "integration-accumulation__in-constant-of-integration__numeric": "exactNumberLab",
  "integration-accumulation__in-constant-of-integration__mcq": "mcq",
  "integration-accumulation__in-library__mcq": "mcq",
  "integration-accumulation__in-library__numeric": "numeric",
};

const EXPECTED_TRUTH_POOL: Record<In04Form, number> = {
  "integration-accumulation__in-antiderivative__mcq": 12,
  "integration-accumulation__in-antiderivative__numeric": 12,
  "integration-accumulation__in-constant-of-integration__numeric": 10,
  "integration-accumulation__in-constant-of-integration__mcq": 12,
  "integration-accumulation__in-library__mcq": 12,
  "integration-accumulation__in-library__numeric": 12,
};

const assertPromptDerivedTruth = (
  form: In04Form,
  generated: { widget: unknown; answer: unknown },
  seed: string,
) => {
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
  } else if (parsed.type === "exactNumberLab") {
    expect(parsed.task, seed).toBe("antiderivativeInitialValue");
    expect(parsed.answerMode, seed).toBe("numeric");
    expect(generated.answer, seed).toBe(independent);
    expect(new Set(parsed.numericErrors.map((error) => error.value)).size, seed).toBe(parsed.numericErrors.length);
    expect(parsed.numericErrors.every((error) => error.value !== independent), seed).toBe(true);
    const prompt = /F'\(x\) = (\d+)x \+ (\d+) and F\((-?\d+)\) = (-?\d+)\. Find F\((-?\d+)\)\./.exec(parsed.prompt)!;
    expect(parsed.aivRate, seed).toEqual([Number(prompt[1]), Number(prompt[2])]);
    expect(parsed.aivAt0, seed).toBe(Number(prompt[3]));
    expect(parsed.aivInit, seed).toEqual([Number(prompt[4])]);
    expect(parsed.aivTarget, seed).toBe(Number(prompt[5]));
  } else {
    throw new Error(`${form} produced unsupported widget ${parsed.type}`);
  }
  return { prompt: parsed.prompt, truth: JSON.stringify(independent) };
};

describe("S246 in-04 antiderivative generator assurance", () => {
  it("covers the exact 12 declared consumers across six coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["in-04-01", "in-04-02", "in-04-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "integration-accumulation", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "integration-accumulation__in-antiderivative__mcq": 1,
      "integration-accumulation__in-antiderivative__numeric": 2,
      "integration-accumulation__in-constant-of-integration__numeric": 3,
      "integration-accumulation__in-constant-of-integration__mcq": 2,
      "integration-accumulation__in-library__mcq": 2,
      "integration-accumulation__in-library__numeric": 2,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(12);
  });

  it("ratchets exact varied prompt and truth pools with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-integration-in04|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const observed = assertPromptDerivedTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(EXPECTED_TRUTH_POOL[form]);
    }
  });

  it("keeps unseen resolver seeds schema-valid, deterministic, surface-preserving, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-integration-in04-resolver|${form}|${index}`;
        const step = {
          widget: { type: EXPECTED_TYPE[form] },
          conceptTag: form.split("__", 2)[1],
          variant: { gen: GENERATOR, form },
        };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        assertPromptDerivedTruth(form, first!, seed);
      }
    }
  });

  it("rejects semantic prompt mutations instead of certifying a memorized family answer", () => {
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-antiderivative__mcq",
      "What is the indefinite integral of 5x^2 dx?",
    )).toThrow(/not exactly divisible/);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-antiderivative__numeric",
      "Evaluate the integral from 0 to 2 of (4x^2 + 3x) dx.",
    )).toThrow(/does not have exact integer coefficients/);
    expect(solveCalculusPrompt(
      "integration-accumulation__in-constant-of-integration__numeric",
      "F'(x) = 4x + 2 and F(1) = 8. Find F(4).",
    )).toBe(44);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-library__numeric",
      "Evaluate the integral from 0 to pi/3 of 7 cos x dx.",
    )).toThrow(/unrecognized antiderivative-library numeric prompt/);
  });
});
