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
  "integration-applications__ia-area-between__mcq",
  "integration-applications__ia-area-between__numeric",
  "integration-applications__ia-disc__mcq",
  "integration-applications__ia-disc__numeric",
  "integration-applications__ia-washer__mcq",
  "integration-applications__ia-washer__numeric",
  "integration-applications__ia-washer__matchPairs",
] as const;

type Ia01Form = typeof FORMS[number];
const EXPECTED_TYPE: Record<Ia01Form, "numeric" | "mcq" | "matchPairs"> = {
  "integration-applications__ia-area-between__mcq": "mcq",
  "integration-applications__ia-area-between__numeric": "numeric",
  "integration-applications__ia-disc__mcq": "mcq",
  "integration-applications__ia-disc__numeric": "numeric",
  "integration-applications__ia-washer__mcq": "mcq",
  "integration-applications__ia-washer__numeric": "numeric",
  "integration-applications__ia-washer__matchPairs": "matchPairs",
};

const assertPromptDerivedTruth = (
  form: Ia01Form,
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
  } else if (parsed.type === "matchPairs") {
    const rightLabelById = new Map(parsed.right.map((item) => [item.id, item.label]));
    const actualByLabel = Object.fromEntries(
      parsed.left.map((item) => [item.label, rightLabelById.get(parsed.pairs[item.id])]),
    );
    expect(actualByLabel, seed).toEqual(independent);
    expect(generated.answer, seed).toEqual(parsed.pairs);
    expect(new Set(parsed.left.map((item) => item.id)).size, seed).toBe(parsed.left.length);
  } else {
    throw new Error(`${form} produced unsupported widget ${parsed.type}`);
  }
  return { prompt: parsed.prompt, truth: JSON.stringify(independent) };
};

describe("S246 ia-01 area and solids generator assurance", () => {
  it("covers the exact 12 declared consumers across seven coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["ia-01-01", "ia-01-02", "ia-01-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "integration-applications", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "integration-applications__ia-area-between__mcq": 1,
      "integration-applications__ia-area-between__numeric": 3,
      "integration-applications__ia-disc__mcq": 2,
      "integration-applications__ia-disc__numeric": 2,
      "integration-applications__ia-washer__mcq": 1,
      "integration-applications__ia-washer__numeric": 2,
      "integration-applications__ia-washer__matchPairs": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(12);
  });

  it("ratchets 12 prompt and truth variants per form with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-integration-ia01|${form}|${index}`;
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
        const seed = `s246-integration-ia01-resolver|${form}|${index}`;
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

  it("recomputes changed application prompts and rejects inconsistent geometry", () => {
    expect(solveCalculusPrompt(
      "integration-applications__ia-area-between__numeric",
      "The curves y = 7x and y = 2x^2 meet at x = 0 and at what larger x-value? Give a decimal to four places.",
    )).toBe(3.5);
    expect(() => solveCalculusPrompt(
      "integration-applications__ia-area-between__mcq",
      "On the open interval from 0 to 4, which curve is on top: y = 3x or y = 2x^2?",
    )).toThrow(/does not end at the second intersection/);
    expect(solveCalculusPrompt(
      "integration-applications__ia-disc__numeric",
      "Revolve y = 2x^1 on [0, 2] about the x-axis. Find the volume to three decimal places.",
    )).toBe(Number((32 * Math.PI / 3).toFixed(3)));
    expect(() => solveCalculusPrompt(
      "integration-applications__ia-washer__mcq",
      "A washer has outer radius 2 and inner radius 3. What is its face area?",
    )).toThrow(/not ordered/);
    expect(() => solveCalculusPrompt(
      "integration-applications__ia-washer__numeric",
      "Revolve the region between y = 3 and y = 4x on [0, 1] about the x-axis.",
    )).toThrow(/exceeds the outer radius/);
  });
});
