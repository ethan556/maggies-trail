import { describe, expect, it } from "vitest";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g10-coordinate-proofs";
const NUMERIC_FORMS = [
  { form: "cx-circle-cts__numeric", minAnswers: 6 },
  { form: "cx-circle-eq__numeric", minAnswers: 10 },
  { form: "cx-circle-position__numeric", minAnswers: 10 },
  { form: "cx-classify-quad__numeric", minAnswers: 10 },
  { form: "cx-classify-tri__numeric", minAnswers: 10 },
  { form: "cx-dist-apps__numeric", minAnswers: 8 },
  { form: "cx-general-proof__numeric", minAnswers: 10 },
  { form: "cx-parallel-proof__numeric", minAnswers: 8 },
  { form: "cx-partition__numeric", minAnswers: 9 },
  { form: "cx-perp-proof__numeric", minAnswers: 8 },
  { form: "cx-shoelace__numeric", minAnswers: 9 },
] as const;

describe("S246 Grade 10 coordinate-proof generator assurance", () => {
  it("gives every numeric form genuine prompt variation and independent truth", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const requirement of NUMERIC_FORMS) {
      const prompts = new Set<string>();
      const answers = new Set<number>();
      for (let index = 0; index < 160; index += 1) {
        const seed = `s246-coordinate|${requirement.form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", requirement.form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", requirement.form);
        expect(replay, seed).toEqual(first);
        expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
        expect(first.widget.type, seed).toBe("numeric");
        expect(solveGeometryPrompt(requirement.form, first.widget.prompt), seed).toBeCloseTo(first.answer, 10);
        const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
        expect(new Set(traps).size, seed).toBe(traps.length);
        expect(traps.some((value: number) => Math.abs(value - Number(first.answer)) <= first.widget.tolerance), seed).toBe(false);
        prompts.add(first.widget.prompt);
        answers.add(first.answer as number);
      }
      expect(prompts.size, `${requirement.form} prompt variation`).toBeGreaterThanOrEqual(10);
      expect(answers.size, `${requirement.form} answer variation`).toBeGreaterThanOrEqual(requirement.minAnswers);
    }
  });

  it("keeps unseen resolver outputs deterministic, schema-valid, and prompt-solvable", () => {
    for (const { form } of NUMERIC_FORMS) {
      for (let index = 0; index < 64; index += 1) {
        const seed = `s246-coordinate-resolver|${form}|${index}`;
        const step = {
          widget: { type: "numeric" as const },
          conceptTag: form.split("__", 1)[0],
          variant: { gen: GENERATOR, form },
        };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        expect(WidgetSpec.safeParse(first!.widget).success, seed).toBe(true);
        expect(Number(first!.answer), seed).toBeCloseTo(Number(solveGeometryPrompt(form, first!.widget.prompt)), 10);
      }
    }
  });
});
