import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";

const GENERATOR = "g13-derivative-rules";
const FORMS = [
  "derivative-rules__dr-chain-nested__numeric",
  "derivative-rules__dr-critical-point__numeric",
  "derivative-rules__dr-derivative-function__numeric",
  "derivative-rules__dr-differentiability__numeric",
  "derivative-rules__dr-exp-log__numeric",
  "derivative-rules__dr-implicit__numeric",
  "derivative-rules__dr-sign-of-derivative__numeric",
  "derivative-rules__dr-tangent-line__numeric",
] as const;

describe("S246 Grade 13 derivative-rules generator assurance", () => {
  it.each(FORMS)("makes %s deterministic, valid, and independently solvable", (form) => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-derivative-rules|${form}|${index}`;
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
    if (form !== "derivative-rules__dr-critical-point__numeric") {
      expect(answers.size).toBeGreaterThanOrEqual(4);
    } else {
      expect(answers).toEqual(new Set([0, 1, 2]));
    }
  });
});
