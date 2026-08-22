import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { exactNumberTruth, WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-integration-accumulation";
const FORMS = [
  "integration-accumulation__in-riemann__numeric",
  "integration-accumulation__in-riemann__mcq",
  "integration-accumulation__in-squeeze__numeric",
  "integration-accumulation__in-squeeze__mcq",
  "integration-accumulation__in-definite-integral__numeric",
  "integration-accumulation__in-definite-integral__matchPairs",
  "integration-accumulation__in-signed-area__mcq",
] as const;

type IntegrationForm = typeof FORMS[number];

const solverInput = (widget: ReturnType<typeof WidgetSpec.parse>): string => {
  if (widget.type === "mcq") return `${widget.prompt}||${widget.options.map((option) => option.label).join(";;")}`;
  if (widget.type === "matchPairs") {
    return `${widget.prompt}||${widget.left.map((item) => item.label).join("\u001f")}||${widget.right.map((item) => item.label).join("\u001f")}`;
  }
  return widget.prompt;
};

const expectedWidgetType = (form: IntegrationForm): "numeric" | "mcq" | "exactNumberLab" | "matchPairs" => {
  if (form.endsWith("__mcq")) return "mcq";
  if (form.endsWith("__matchPairs")) return "matchPairs";
  if (form === "integration-accumulation__in-definite-integral__numeric") return "exactNumberLab";
  return "numeric";
};

describe("S246 in-01 integration foundations generator assurance", () => {
  it("varies real mathematics, replays exactly, and agrees with prompt-only truth", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      for (let index = 0; index < 180; index += 1) {
        const seed = `s246-integration-foundations|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const parsed = WidgetSpec.parse(first.widget);
        expect(parsed.type, seed).toBe(expectedWidgetType(form));
        const independent = solveCalculusPrompt(form, solverInput(parsed));
        if (parsed.type === "numeric") {
          expect(first.answer, seed).toBe(independent);
          expect(new Set(parsed.commonErrors.map((error) => error.value)).size, seed).toBe(parsed.commonErrors.length);
          expect(parsed.commonErrors.every((error) => error.value !== first.answer), seed).toBe(true);
        } else if (parsed.type === "mcq") {
          const correct = parsed.options.filter((option) => option.correct);
          expect(correct, seed).toHaveLength(1);
          expect(correct[0]!.label, seed).toBe(independent);
          expect(correct[0]!.id, seed).toBe(first.answer);
          expect(new Set(parsed.options.map((option) => option.label)).size, seed).toBe(parsed.options.length);
        } else if (parsed.type === "exactNumberLab") {
          expect(first.answer, seed).toBe(independent);
          expect(exactNumberTruth(parsed).answerNumber, seed).toBe(independent);
          expect(new Set(parsed.numericErrors.map((error) => error.value)).size, seed).toBe(parsed.numericErrors.length);
        } else if (parsed.type === "matchPairs") {
          const leftLabels = new Map(parsed.left.map((item) => [item.id, item.label]));
          const rightLabels = new Map(parsed.right.map((item) => [item.id, item.label]));
          const actualLabels = Object.fromEntries(
            Object.entries(parsed.pairs).map(([left, right]) => [leftLabels.get(left)!, rightLabels.get(right)!]),
          );
          expect(actualLabels, seed).toEqual(independent);
          expect(first.answer, seed).toEqual(parsed.pairs);
          expect(parsed.left.every((item, position) => parsed.pairs[item.id] === parsed.right[position]?.id), seed).toBe(false);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
        prompts.add(parsed.prompt);
        truths.add(JSON.stringify(independent));
      }
      expect(prompts.size, `${form} prompt variation`).toBeGreaterThanOrEqual(10);
      const minimumTruths = form === "integration-accumulation__in-riemann__mcq" ? 2 : 10;
      expect(truths.size, `${form} truth variation`).toBeGreaterThanOrEqual(minimumTruths);
    }
  });

  it("keeps unseen resolver seeds deterministic, schema-valid, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 72; index += 1) {
        const seed = `s246-integration-foundations-resolver|${form}|${index}`;
        const step = {
          widget: { type: expectedWidgetType(form) },
          conceptTag: form.split("__", 2)[1],
          variant: { gen: GENERATOR, form },
        };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        const parsed = WidgetSpec.parse(first!.widget);
        const independent = solveCalculusPrompt(form, solverInput(parsed));
        if (parsed.type === "numeric" || parsed.type === "exactNumberLab") {
          expect(first!.answer, seed).toBe(independent);
        } else if (parsed.type === "mcq") {
          expect(parsed.options.find((option) => option.correct)?.label, seed).toBe(independent);
        } else if (parsed.type === "matchPairs") {
          const leftLabels = new Map(parsed.left.map((item) => [item.id, item.label]));
          const rightLabels = new Map(parsed.right.map((item) => [item.id, item.label]));
          expect(Object.fromEntries(Object.entries(parsed.pairs).map(([left, right]) => [leftLabels.get(left)!, rightLabels.get(right)!])), seed).toEqual(independent);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
      }
    }
  });
});
