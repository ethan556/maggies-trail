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
  "integration-accumulation__in-usub__mcq",
  "integration-accumulation__in-usub__numeric",
  "integration-accumulation__in-usub-limits__mcq",
  "integration-accumulation__in-usub-limits__numeric",
  "integration-accumulation__in-choosing-u__mcq",
  "integration-accumulation__in-choosing-u__numeric",
  "integration-accumulation__in-choosing-u__dragBucket",
] as const;

type In05Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<In05Form, "numeric" | "mcq" | "dragBucket"> = {
  "integration-accumulation__in-usub__mcq": "mcq",
  "integration-accumulation__in-usub__numeric": "numeric",
  "integration-accumulation__in-usub-limits__mcq": "mcq",
  "integration-accumulation__in-usub-limits__numeric": "numeric",
  "integration-accumulation__in-choosing-u__mcq": "mcq",
  "integration-accumulation__in-choosing-u__numeric": "numeric",
  "integration-accumulation__in-choosing-u__dragBucket": "dragBucket",
};

const assertPromptDerivedTruth = (
  form: In05Form,
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
  } else if (parsed.type === "dragBucket") {
    const bucketLabelById = new Map(parsed.buckets.map((bucket) => [bucket.id, bucket.label]));
    const actualByLabel = Object.fromEntries(
      parsed.items.map((item) => [item.label, bucketLabelById.get(item.bucketId)]),
    );
    expect(actualByLabel, seed).toEqual(independent);
    expect(generated.answer, seed).toEqual(Object.fromEntries(parsed.items.map((item) => [item.id, item.bucketId])));
    expect(new Set(parsed.items.map((item) => item.bucketId)).size, seed).toBe(parsed.buckets.length);
  } else {
    throw new Error(`${form} produced unsupported widget ${parsed.type}`);
  }
  return { prompt: parsed.prompt, truth: JSON.stringify(independent) };
};

describe("S246 in-05 substitution generator assurance", () => {
  it("covers the exact 12 declared consumers across seven coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["in-05-01", "in-05-02", "in-05-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "integration-accumulation", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "integration-accumulation__in-usub__mcq": 1,
      "integration-accumulation__in-usub__numeric": 3,
      "integration-accumulation__in-usub-limits__mcq": 1,
      "integration-accumulation__in-usub-limits__numeric": 3,
      "integration-accumulation__in-choosing-u__mcq": 1,
      "integration-accumulation__in-choosing-u__numeric": 2,
      "integration-accumulation__in-choosing-u__dragBucket": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(12);
  });

  it("ratchets 12 prompt and truth variants per form with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-integration-in05|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
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
        const seed = `s246-integration-in05-resolver|${form}|${index}`;
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

  it("recomputes changed prompts and rejects invalid substitution receipts and limits", () => {
    expect(solveCalculusPrompt(
      "integration-accumulation__in-usub__numeric",
      "Evaluate the integral from 0 to 1 of 6x^2(x^3 + 2)^2 dx. Give a decimal to three places.",
    )).toBe(12.667);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-usub__numeric",
      "Evaluate the integral from 0 to 1 of 5x^2(x^3 + 2)^2 dx. Give a decimal to three places.",
    )).toThrow(/receipt or interval/);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-usub-limits__mcq",
      "For the integral from 0 to 2 of 4(4x + 1)^2 dx with u = 3x + 1, what are the u-limits?",
    )).toThrow(/inconsistent substitution/);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-usub-limits__numeric",
      "Evaluate the integral from 2 to 0 of 4(4x + 1)^2 dx by changing to u-limits.",
    )).toThrow(/receipt or interval/);
    expect(() => solveCalculusPrompt(
      "integration-accumulation__in-choosing-u__dragBucket",
      "Use p = 1 and c = 2. Sort each integral by whether a direct u-substitution has its derivative receipt.",
    )).toThrow(/nonlinear inside/);
  });
});
