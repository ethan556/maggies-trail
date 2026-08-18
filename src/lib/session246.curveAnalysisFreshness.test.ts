import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-curve-analysis";
const FORM = "curve-analysis__ca-first-derivative-test__numeric";
const SIGN_FORM = "curve-analysis__ca-first-derivative-test__signChart";
const REMAINING_NUMERIC_FORMS = [
  "curve-analysis__ca-inflection__numeric",
  "curve-analysis__ca-read-f-prime__numeric",
  "curve-analysis__ca-three-charts__numeric",
  "curve-analysis__ca-optimisation-applied__numeric",
] as const;

describe("S246 Grade 13 first-derivative-test generator assurance", () => {
  it("varies the actual cubic and independently recomputes its local maximum", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-curve-analysis|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("numeric");
      expect(solveCalculusPrompt(FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
  });

  it("keeps unseen resolver outputs deterministic, valid, and prompt-solvable", () => {
    const step = {
      widget: { type: "numeric" as const },
      conceptTag: "ca-first-derivative-test",
      variant: { gen: GENERATOR, form: FORM },
    };
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-curve-analysis-resolver|${index}`;
      const first = variantForStep(step, seed, "stretch");
      const replay = variantForStep(step, seed, "stretch");
      expect(first, seed).not.toBeNull();
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first!.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(FORM, first!.widget.prompt), seed).toBe(first!.answer);
    }
  });

  it("varies the double/single-root sign chart and independently recomputes every interval", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-curve-sign|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", SIGN_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", SIGN_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("signChart");
      expect(solveCalculusPrompt(SIGN_FORM, first.widget.prompt), seed).toEqual(first.answer);
      prompts.add(first.widget.prompt);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
  });

  it.each(REMAINING_NUMERIC_FORMS)("gives %s genuine prompt-derived variation", (form) => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-curve-family|${form}|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", form);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "stretch", form);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("numeric");
      expect(solveCalculusPrompt(form, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    if (form !== "curve-analysis__ca-inflection__numeric") {
      expect(answers.size).toBeGreaterThanOrEqual(4);
    } else {
      expect(answers).toEqual(new Set([0, 1, 2]));
    }
  });
});
