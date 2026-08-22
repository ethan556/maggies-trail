import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";

const GENERATOR = "g13-differential-equations";
const FORMS = [
  "differential-equations__de-slope-field__numeric",
  "differential-equations__de-separable__numeric",
  "differential-equations__de-logistic__numeric",
  "differential-equations__de-equilibrium__numeric",
  "differential-equations__de-exponential__numeric",
  "differential-equations__de-euler__numeric",
] as const;

describe("S246 differential-equations generator assurance", () => {
  it.each(FORMS)("makes %s deterministic, valid, and independently solvable", (form) => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-differential-equations|${form}|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", form);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "stretch", form);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(form, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(4);
  });
});
