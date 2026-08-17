import { describe, expect, it } from "vitest";
import { solvePrompt as solvePrecalculusPrompt } from "./precalculusIndependent.cjs";
import { PRECALCULUS_GENERATORS } from "./precalculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";
import type { Band } from "./difficulty";

const GENERATOR = "g12-conic-sections";
const FORM = "conic-sections__co-parabola-def__numeric";
const ECCENTRICITY_FORM = "conic-sections__co-hyp-ecc__numeric";

function exercise(seed: string, band: Band) {
  const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
  const first = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  const replay = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  expect(replay, seed).toEqual(first);
  expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
  expect(first.widget.type, seed).toBe("numeric");
  expect(solvePrecalculusPrompt(FORM, first.widget.prompt), seed).toBe(first.answer);
  const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
  expect(new Set(traps).size, seed).toBe(traps.length);
  expect(traps, seed).not.toContain(first.answer);
  return first;
}

describe("S246 Grade 12 parabola-definition freshness", () => {
  it("varies vertical and horizontal parabolas with independently checked distances", () => {
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const orientations = new Set<string>();
    const bands: Band[] = ["support", "core", "stretch"];
    for (let index = 0; index < 96; index += 1) {
      const variant = exercise(`s246-parabola-definition|${index}`, bands[index % bands.length]);
      prompts.add(variant.widget.prompt);
      answers.add(variant.answer as number);
      orientations.add(variant.widget.prompt.includes("directrix x =") ? "horizontal" : "vertical");
    }
    expect(prompts.size).toBe(8);
    expect(answers.size).toBeGreaterThanOrEqual(4);
    expect(orientations).toEqual(new Set(["vertical", "horizontal"]));
  });

  it("passes through the real item resolver for unseen seeds", () => {
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-parabola-resolver|${index}`;
      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "co-parabola-def",
          variant: { gen: GENERATOR, form: FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(solvePrecalculusPrompt(FORM, resolved!.widget.prompt));
    }
  });

  it("varies hyperbola orientation and exact a-b-c states before rounding e", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const orientations = new Set<string>();
    for (let index = 0; index < 96; index += 1) {
      const seed = `s246-hyperbola-eccentricity|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", ECCENTRICITY_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", ECCENTRICITY_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solvePrecalculusPrompt(ECCENTRICITY_FORM, first.widget.prompt), seed).toBe(first.answer);
      expect(first.answer, seed).toBeGreaterThan(1);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps, seed).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
      orientations.add(first.widget.prompt.startsWith("For x²") ? "horizontal" : "vertical");
    }
    expect(prompts.size).toBe(8);
    expect(answers.size).toBe(8);
    expect(orientations).toEqual(new Set(["horizontal", "vertical"]));
  });
});
