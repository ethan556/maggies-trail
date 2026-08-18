import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-integration-accumulation";
const FORMS = [
  "integration-accumulation__in-ftc1__mcq",
  "integration-accumulation__in-ftc1__numeric",
  "integration-accumulation__in-ftc2__numeric",
  "integration-accumulation__in-ftc2__mcq",
  "integration-accumulation__in-ftc-unified__dragOrder",
  "integration-accumulation__in-ftc-unified__dragBucket",
  "integration-accumulation__in-ftc-unified__numeric",
] as const;

type In03Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<In03Form, "numeric" | "mcq" | "dragOrder" | "dragBucket"> = {
  "integration-accumulation__in-ftc1__mcq": "mcq",
  "integration-accumulation__in-ftc1__numeric": "numeric",
  "integration-accumulation__in-ftc2__numeric": "numeric",
  "integration-accumulation__in-ftc2__mcq": "mcq",
  "integration-accumulation__in-ftc-unified__dragOrder": "dragOrder",
  "integration-accumulation__in-ftc-unified__dragBucket": "dragBucket",
  "integration-accumulation__in-ftc-unified__numeric": "numeric",
};

const EXPECTED_TRUTH_POOL: Record<In03Form, number> = {
  "integration-accumulation__in-ftc1__mcq": 12,
  "integration-accumulation__in-ftc1__numeric": 6,
  "integration-accumulation__in-ftc2__numeric": 12,
  "integration-accumulation__in-ftc2__mcq": 12,
  "integration-accumulation__in-ftc-unified__dragOrder": 12,
  "integration-accumulation__in-ftc-unified__dragBucket": 12,
  "integration-accumulation__in-ftc-unified__numeric": 12,
};

const assertPromptDerivedTruth = (
  form: In03Form,
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
  } else if (parsed.type === "dragOrder") {
    const labelById = new Map(parsed.items.map((item) => [item.id, item.label]));
    expect(parsed.correctOrder.map((id) => labelById.get(id)), seed).toEqual(independent);
    expect(generated.answer, seed).toEqual(parsed.correctOrder);
    expect(parsed.items.map((item) => item.id), seed).not.toEqual(parsed.correctOrder);
    expect(new Set(parsed.items.map((item) => item.id)).size, seed).toBe(parsed.items.length);
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

describe("S246 in-03 Fundamental Theorem generator assurance", () => {
  it("covers exact varied prompt and truth pools with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-integration-in03|${form}|${index}`;
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

  it("keeps unseen resolver seeds schema-valid, deterministic, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-integration-in03-resolver|${form}|${index}`;
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
});
