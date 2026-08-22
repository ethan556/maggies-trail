import { describe, expect, it } from "vitest";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g10-geometry-foundations";
const FORMS = [
  "gf-composition__numeric",
  "gf-composition__mcq",
  "gf-line-symmetry__numeric",
  "gf-line-symmetry__mcq",
  "gf-rotational-symmetry__numeric",
  "gf-rotational-symmetry__mcq",
] as const;

const promptTruth = (form: typeof FORMS[number], widget: ReturnType<typeof WidgetSpec.parse>): number | string => {
  const input = widget.type === "mcq"
    ? `${widget.prompt}||${widget.options.map((option) => option.label).join(";;")}`
    : widget.prompt;
  return solveGeometryPrompt(form, input) as number | string;
};

describe("S246 Grade 10 composition and symmetry generator assurance", () => {
  it("provides varied mathematics, deterministic replay, and prompt-only truth", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<number | string>();
      for (let index = 0; index < 180; index += 1) {
        const seed = `s246-composition-symmetry|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const parsed = WidgetSpec.parse(first.widget);
        const independent = promptTruth(form, parsed);
        if (parsed.type === "numeric") {
          expect(first.answer, seed).toBe(independent);
          expect(new Set(parsed.commonErrors.map((error) => error.value)).size, seed).toBe(parsed.commonErrors.length);
          expect(parsed.commonErrors.every((error) => error.value !== first.answer), seed).toBe(true);
          if (form === "gf-rotational-symmetry__numeric") {
            const order = Number(parsed.prompt.match(/order (\d+)/)?.[1]);
            expect(Number(first.answer) * order, seed).toBe(360);
          }
        } else if (parsed.type === "mcq") {
          const correct = parsed.options.filter((option) => option.correct);
          expect(correct, seed).toHaveLength(1);
          expect(correct[0]!.label, seed).toBe(independent);
          expect(correct[0]!.id, seed).toBe(first.answer);
          expect(new Set(parsed.options.map((option) => option.label)).size, seed).toBe(parsed.options.length);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
        prompts.add(parsed.prompt);
        truths.add(independent);
      }
      expect(prompts.size, `${form} prompt variation`).toBeGreaterThanOrEqual(10);
      expect(truths.size, `${form} truth variation`).toBeGreaterThanOrEqual(8);
    }
  });

  it("keeps unseen resolver seeds deterministic, valid, and independently solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 72; index += 1) {
        const seed = `s246-composition-symmetry-resolver|${form}|${index}`;
        const step = {
          widget: { type: form.endsWith("__mcq") ? "mcq" as const : "numeric" as const },
          conceptTag: form.split("__", 1)[0],
          variant: { gen: GENERATOR, form },
        };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        const parsed = WidgetSpec.parse(first!.widget);
        const independent = promptTruth(form, parsed);
        if (parsed.type === "numeric") {
          expect(first!.answer, seed).toBe(independent);
        } else if (parsed.type === "mcq") {
          expect(parsed.options.find((option) => option.correct)?.label, seed).toBe(independent);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
      }
    }
  });
});
