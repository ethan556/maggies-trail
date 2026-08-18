import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-integration-accumulation";
const FORMS = [
  "integration-accumulation__in-accumulation__numeric",
  "integration-accumulation__in-accumulation__mcq",
  "integration-accumulation__in-read-accumulation__mcq",
  "integration-accumulation__in-read-accumulation__matchPairs",
  "integration-accumulation__in-signed-area__numeric",
  "integration-accumulation__in-read-accumulation__numeric",
  "integration-accumulation__in-net-change__mcq",
  "integration-accumulation__in-net-change__numeric",
] as const;

const EXPECTED_TRUTH_POOL_SIZE: Record<(typeof FORMS)[number], number> = {
  "integration-accumulation__in-accumulation__numeric": 11,
  "integration-accumulation__in-accumulation__mcq": 11,
  "integration-accumulation__in-read-accumulation__mcq": 6,
  "integration-accumulation__in-read-accumulation__matchPairs": 12,
  "integration-accumulation__in-signed-area__numeric": 12,
  "integration-accumulation__in-read-accumulation__numeric": 6,
  "integration-accumulation__in-net-change__mcq": 12,
  "integration-accumulation__in-net-change__numeric": 10,
};

type In02Form = typeof FORMS[number];

const expectedWidgetType = (form: In02Form): "numeric" | "mcq" | "matchPairs" => {
  if (form.endsWith("__mcq")) return "mcq";
  if (form.endsWith("__matchPairs")) return "matchPairs";
  return "numeric";
};

const solverInput = (widget: ReturnType<typeof WidgetSpec.parse>): string => {
  if (widget.type === "matchPairs") {
    return `${widget.prompt}||${widget.left.map((item) => item.label).join("\u001f")}||${widget.right.map((item) => item.label).join("\u001f")}`;
  }
  return widget.prompt;
};

const assertPromptDerivedTruth = (
  form: In02Form,
  generated: { widget: unknown; answer: unknown },
  seed: string,
) => {
  const parsed = WidgetSpec.parse(generated.widget);
  const independent = solveCalculusPrompt(form, solverInput(parsed));
  expect(parsed.type, seed).toBe(expectedWidgetType(form));
  if (parsed.type === "numeric") {
    expect(generated.answer, seed).toBe(independent);
    expect(parsed.answer, seed).toBe(independent);
    expect(new Set(parsed.commonErrors.map((error) => error.value)).size, seed).toBe(parsed.commonErrors.length);
    expect(parsed.commonErrors.every((error) => error.value !== independent), seed).toBe(true);
  } else if (parsed.type === "mcq") {
    const correct = parsed.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(independent);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(parsed.options.map((option) => option.label)).size, seed).toBe(parsed.options.length);
  } else if (parsed.type === "matchPairs") {
    const leftLabels = new Map(parsed.left.map((item) => [item.id, item.label]));
    const rightLabels = new Map(parsed.right.map((item) => [item.id, item.label]));
    const actualLabels = Object.fromEntries(
      Object.entries(parsed.pairs).map(([left, right]) => [leftLabels.get(left)!, rightLabels.get(right)!]),
    );
    expect(actualLabels, seed).toEqual(independent);
    expect(generated.answer, seed).toEqual(parsed.pairs);
    expect(parsed.left.every((item, position) => parsed.pairs[item.id] === parsed.right[position]?.id), seed).toBe(false);
  } else {
    throw new Error(`${form} produced unsupported widget ${parsed.type}`);
  }
  return { prompt: parsed.prompt, truth: JSON.stringify(independent) };
};

describe("S246 in-02 accumulation and net-change generator assurance", () => {
  it("varies the mathematics, replays exactly, and agrees with prompt-derived truth", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 240; index += 1) {
        const seed = `s246-integration-in02|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const observed = assertPromptDerivedTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(EXPECTED_TRUTH_POOL_SIZE[form]);
    }
  });

  it("keeps unseen resolver seeds deterministic, schema-valid, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-integration-in02-resolver|${form}|${index}`;
        const step = {
          widget: { type: expectedWidgetType(form) },
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
