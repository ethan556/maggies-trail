import { describe, expect, it } from "vitest";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";
import type { Band } from "./difficulty";

const GENERATOR = "g10-constructions-proof";
const FORM = "cp-perp-at-point__numeric";
const FROM_POINT_FORM = "cp-perp-from-point__numeric";
const PARALLEL_FORM = "cp-parallel-through-point__numeric";
const HEXAGON_FORM = "cp-hexagon__numeric";
const REMAINING_NUMERIC_FORMS = [
  { form: "cp-square-triangle__numeric", minPrompts: 10, minAnswers: 8 },
  { form: "cp-conjecture-proof__numeric", minPrompts: 10, minAnswers: 4 },
  { form: "cp-converses__numeric", minPrompts: 10, minAnswers: 10 },
  { form: "cp-proving-transversal__numeric", minPrompts: 10, minAnswers: 6 },
  { form: "cp-transversal-family__numeric", minPrompts: 10, minAnswers: 8 },
  { form: "cp-vertical-angles__numeric", minPrompts: 8, minAnswers: 6 },
] as const;

function exercise(seed: string, band: Band) {
  const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
  const first = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  const replay = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  expect(replay, seed).toEqual(first);
  expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
  expect(first.widget.type, seed).toBe("numeric");
  expect(solveGeometryPrompt(FORM, first.widget.prompt), seed).toBe(first.answer);
  const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
  expect(new Set(traps).size, seed).toBe(traps.length);
  expect(traps, seed).not.toContain(first.answer);
  expect(first.widget.prompt, seed).not.toMatch(/Thales|semicircle/i);
  expect(first.widget.fallbackFeedback, seed).not.toMatch(/Thales|semicircle/i);
  return first;
}

describe("S246 Grade 10 perpendicular-at-a-point freshness", () => {
  it("varies the mathematical state and answer across two appropriate question jobs", () => {
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const jobs = new Set<string>();
    const bands: Band[] = ["support", "core", "stretch"];
    for (let index = 0; index < 96; index += 1) {
      const variant = exercise(`s246-perpendicular|${index}`, bands[index % bands.length]);
      prompts.add(variant.widget.prompt);
      answers.add(variant.answer as number);
      jobs.add(variant.widget.prompt.includes("labelled") ? "equation" : "partition");
    }
    expect(prompts.size).toBe(10);
    expect(answers.size).toBe(10);
    expect(jobs).toEqual(new Set(["equation", "partition"]));
  });

  it("passes independently checked unseen seeds through the real resolver", () => {
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-perpendicular-resolver|${index}`;
      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "cp-perp-at-point",
          variant: { gen: GENERATOR, form: FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(solveGeometryPrompt(FORM, resolved!.widget.prompt));
    }
  });

  it("varies horizontal and vertical perpendicular feet with prompt-derived answers", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const orientations = new Set<string>();
    for (let index = 0; index < 96; index += 1) {
      const seed = `s246-perpendicular-from-point|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", FROM_POINT_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", FROM_POINT_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveGeometryPrompt(FROM_POINT_FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps, seed).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
      orientations.add(first.widget.prompt.includes("horizontal") ? "horizontal" : "vertical");
    }
    expect(prompts.size).toBe(10);
    expect(answers.size).toBe(10);
    expect(orientations).toEqual(new Set(["horizontal", "vertical"]));
  });

  it("resolves unseen perpendicular-foot coordinates independently", () => {
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-perpendicular-from-point-resolver|${index}`;
      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "cp-perp-from-point",
          variant: { gen: GENERATOR, form: FROM_POINT_FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(solveGeometryPrompt(FROM_POINT_FORM, resolved!.widget.prompt));
    }
  });

  it("varies co-interior angle states and recomputes each supplementary partner", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 96; index += 1) {
      const seed = `s246-parallel-through-point|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", PARALLEL_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", PARALLEL_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveGeometryPrompt(PARALLEL_FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps, seed).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBe(10);
    expect(answers.size).toBe(10);
  });

  it("resolves unseen co-interior partners independently", () => {
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-parallel-through-point-resolver|${index}`;
      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "cp-parallel-through-point",
          variant: { gen: GENERATOR, form: PARALLEL_FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(solveGeometryPrompt(PARALLEL_FORM, resolved!.widget.prompt));
    }
  });

  it("varies central and interior regular-hexagon equations", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const angleTypes = new Set<string>();
    for (let index = 0; index < 96; index += 1) {
      const seed = `s246-hexagon|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", HEXAGON_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", HEXAGON_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveGeometryPrompt(HEXAGON_FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps, seed).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
      angleTypes.add(first.widget.prompt.includes("central") ? "central" : "interior");
    }
    expect(prompts.size).toBe(10);
    expect(answers.size).toBe(10);
    expect(angleTypes).toEqual(new Set(["central", "interior"]));
  });

  it("gives every remaining numeric construction form genuine, independently solvable variation", () => {
    const generator = GEOMETRY_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const requirement of REMAINING_NUMERIC_FORMS) {
      const prompts = new Set<string>();
      const answers = new Set<number>();
      for (let index = 0; index < 128; index += 1) {
        const seed = `s246-construction-family|${requirement.form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", requirement.form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", requirement.form);
        expect(replay, seed).toEqual(first);
        expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
        expect(solveGeometryPrompt(requirement.form, first.widget.prompt), seed).toBe(first.answer);
        const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
        expect(new Set(traps).size, seed).toBe(traps.length);
        expect(traps, seed).not.toContain(first.answer);
        prompts.add(first.widget.prompt);
        answers.add(first.answer as number);
      }
      expect(prompts.size, `${requirement.form} prompt variation`).toBeGreaterThanOrEqual(requirement.minPrompts);
      expect(answers.size, `${requirement.form} answer variation`).toBeGreaterThanOrEqual(requirement.minAnswers);
    }
  });
});
