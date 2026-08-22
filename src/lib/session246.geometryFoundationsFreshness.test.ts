import { describe, expect, it } from "vitest";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g10-geometry-foundations";
const FORMS = [
  "gf-translation-rule__numeric",
  "gf-translation-rule__mcq",
  "gf-reflection-rule__numeric",
  "gf-reflection-rule__mcq",
  "gf-rotation-rule__numeric",
  "gf-rotation-rule__mcq",
] as const;

describe("S246 Grade 10 transformation-rule generator assurance", () => {
  it("varies the mathematics, replays exactly, and agrees with prompt-only truth", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<number | string>();
      for (let index = 0; index < 180; index += 1) {
        const seed = `s246-foundations|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const parsed = WidgetSpec.parse(first.widget);
        const independent = parsed.type === "mcq"
          ? solveGeometryPrompt(form, `${parsed.prompt}||${parsed.options.map((option) => option.label).join(";;")}`)
          : solveGeometryPrompt(form, parsed.prompt);
        if (parsed.type === "numeric") {
          expect(independent, seed).toBe(first.answer);
          expect(new Set(parsed.commonErrors.map((error) => error.value)).size, seed).toBe(parsed.commonErrors.length);
          expect(parsed.commonErrors.every((error) => error.value !== first.answer), seed).toBe(true);
        } else if (parsed.type === "mcq") {
          const correct = parsed.options.filter((option) => option.correct);
          expect(correct, seed).toHaveLength(1);
          expect(correct[0]!.label, seed).toBe(independent);
          expect(correct[0]!.id, seed).toBe(first.answer);
          expect(new Set(parsed.options.map((option) => option.label)).size, seed).toBe(parsed.options.length);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
        prompts.add(parsed.prompt);
        truths.add(independent as number | string);
      }
      expect(prompts.size, `${form} prompt variation`).toBeGreaterThanOrEqual(10);
      expect(truths.size, `${form} truth variation`).toBeGreaterThanOrEqual(form.includes("rotation") && form.endsWith("__mcq") ? 3 : 4);
    }
  });

  it("keeps unseen resolver seeds deterministic, schema-valid, and independently solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 72; index += 1) {
        const seed = `s246-foundations-resolver|${form}|${index}`;
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
        const independent = parsed.type === "mcq"
          ? solveGeometryPrompt(form, `${parsed.prompt}||${parsed.options.map((option) => option.label).join(";;")}`)
          : solveGeometryPrompt(form, parsed.prompt);
        if (parsed.type === "numeric") {
          expect(first!.answer, seed).toBe(independent);
        } else if (parsed.type === "mcq") {
          expect(parsed.options.find((option) => option.correct)?.label, seed).toBe(independent);
        } else throw new Error(`${form} produced unsupported widget ${parsed.type}`);
      }
    }
  });
});
