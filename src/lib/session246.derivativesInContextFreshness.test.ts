import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";

const GENERATOR = "g13-derivatives-in-context";
const FORM = "derivatives-in-context__dc-choosing-relation__numeric";
const MOTION_FORM = "derivatives-in-context__dc-motion__numeric";
const SPEED_FORM = "derivatives-in-context__dc-speed__numeric";
const DISTANCE_FORM = "derivatives-in-context__dc-distance__numeric";
const RELATED_RATES_FORM = "derivatives-in-context__dc-related-rates__numeric";
const LADDER_FORM = "derivatives-in-context__dc-ladder__numeric";
const LINEARISATION_FORM = "derivatives-in-context__dc-linearisation__numeric";
const DIFFERENTIALS_FORM = "derivatives-in-context__dc-differentials__numeric";
const LINEARISATION_LIMITS_FORM = "derivatives-in-context__dc-linearisation-limits__numeric";
const LHOPITAL_FORM = "derivatives-in-context__dc-lhopital__numeric";
const OTHER_FORMS_NUMERIC = "derivatives-in-context__dc-other-forms__numeric";

describe("S246 derivatives-in-context related-rates canary", () => {
  it("varies the perpendicular motion and independently recomputes the separation rate", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-derivatives-context|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "stretch", FORM);
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

  it("varies motion jobs and independently recomputes acceleration, rest count, or position", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const jobs = new Set<string>();
    for (let index = 0; index < 256; index += 1) {
      const seed = `s246-motion-context|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", MOTION_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "stretch", MOTION_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(MOTION_FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
      jobs.add(first.widget.prompt.includes("acceleration") ? "acceleration" : first.widget.prompt.includes("how many") ? "count" : "position");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(6);
    expect(jobs).toEqual(new Set(["acceleration", "count", "position"]));
  });

  it("varies the speed-analysis domain and recomputes every sign interval", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-speed-context|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", SPEED_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(SPEED_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(2);
  });

  it("varies displacement, journey-leg, and total-distance jobs", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const jobs = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-distance-context|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "support", DISTANCE_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(DISTANCE_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      jobs.add(first.widget.prompt.includes("displacement") ? "displacement" : first.widget.prompt.includes("motion legs") ? "legs" : "distance");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(jobs).toEqual(new Set(["displacement", "legs", "distance"]));
  });

  it("varies circle and sphere related-rate states with prompt-derived answers", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const shapes = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-related-rates|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", RELATED_RATES_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(RELATED_RATES_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
      shapes.add(first.widget.prompt.includes("sphere") ? "sphere" : "circle");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
    expect(shapes).toEqual(new Set(["circle", "sphere"]));
  });

  it("varies ladder geometry and downward-rate calculations", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const jobs = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-ladder|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", LADDER_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(LADDER_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      jobs.add(first.widget.prompt.includes("How high") ? "height" : "rate");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(jobs).toEqual(new Set(["height", "rate"]));
  });

  it("varies square-root slopes and square-root/cubic tangent estimates", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const jobs = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-linearisation|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", LINEARISATION_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(LINEARISATION_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      jobs.add(/find f(?:'|′)/.test(first.widget.prompt) ? "slope" : /sqrt|√/.test(first.widget.prompt) ? "sqrt-estimate" : "cubic-estimate");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(jobs).toEqual(new Set(["slope", "sqrt-estimate", "cubic-estimate"]));
  });

  it("varies structured differential error models without flattening the lab", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const jobs = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-differentials|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", DIFFERENTIALS_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solveCalculusPrompt(DIFFERENTIALS_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      jobs.add(first.widget.prompt.includes("volume error") ? "absolute" : first.widget.prompt.includes("percentage error") ? "relative" : "tolerance");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(jobs).toEqual(new Set(["absolute", "relative", "tolerance"]));
  });

  it("varies the quadratic distance factor in the linearisation-error model", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-linearisation-limits|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", LINEARISATION_LIMITS_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(LINEARISATION_LIMITS_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
  });

  it("varies quadratic and cubic indeterminate limits with independent differentiation", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-lhopital|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", LHOPITAL_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(LHOPITAL_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
  });

  it("varies polynomial/exponential and power/logarithm limit forms", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>();
    const jobs = new Set<string>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-other-limit-forms|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", OTHER_FORMS_NUMERIC);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solveCalculusPrompt(OTHER_FORMS_NUMERIC, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt);
      jobs.add(first.widget.prompt.includes("infinity") ? "infinity" : "zero-product");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(jobs).toEqual(new Set(["infinity", "zero-product"]));
  });
});
