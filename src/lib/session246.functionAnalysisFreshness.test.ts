import { describe, expect, it } from "vitest";
import { solvePrompt } from "./precalculusIndependent.cjs";
import { PRECALCULUS_GENERATORS } from "./precalculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";

const GENERATOR = "g12-function-analysis";
const FORM = "function-analysis__fna-graph-read__numeric";
const COMPOSE_ORDER_FORM = "function-analysis__fna-compose-order__numeric";
const COMPOSE_DOMAIN_FORM = "function-analysis__fna-compose-domain__numeric";
const DECOMPOSE_FORM = "function-analysis__fna-decompose__numeric";
const ONE_TO_ONE_FORM = "function-analysis__fna-one-to-one__numeric";
const RESTRICTED_FORM = "function-analysis__fna-restricted__numeric";
const INVERSE_POINT_FORM = "function-analysis__fna-inverse-verify__pointEntry";
const INVERSE_VERIFY_FORM = "function-analysis__fna-inverse-verify__numeric";

describe("S246 function-analysis generator assurance", () => {
  it("varies vertex-form graph reading and independently evaluates every prompt", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-function-analysis|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "stretch", FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(solvePrompt(FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
  });

  it("varies both composition orders while preserving the exact-number lab", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>(); const orders = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-compose-order|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", COMPOSE_ORDER_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(COMPOSE_ORDER_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
      orders.add(first.widget.prompt.includes("g(f") ? "gof" : "fog");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
    expect(orders).toEqual(new Set(["gof", "fog"]));
  });

  it("varies square-root domain floors and caps in the exact-number lab", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>(); const directions = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-compose-domain|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", COMPOSE_DOMAIN_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(COMPOSE_DOMAIN_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
      directions.add(first.widget.prompt.includes("maximum") ? "maximum" : "minimum");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
    expect(directions).toEqual(new Set(["minimum", "maximum"]));
  });

  it("varies inner linear maps and outer powers in the decomposition lab", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>(); const powers = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-decompose|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", DECOMPOSE_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(DECOMPOSE_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
      powers.add(first.widget.prompt.match(/x\^(\d+)/)?.[1] ?? "");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
    expect(powers).toEqual(new Set(["2", "3", "4"]));
  });

  it("varies absolute-value collisions while preserving the exact-number model", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-one-to-one|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", ONE_TO_ONE_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(ONE_TO_ONE_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
  });

  it("varies both restricted inverse branches and target values", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>(); const branches = new Set<string>();
    for (let index = 0; index < 192; index += 1) {
      const seed = `s246-restricted-inverse|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", RESTRICTED_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(RESTRICTED_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
      branches.add(first.widget.prompt.includes(">=") ? "right" : "left");
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
    expect(branches).toEqual(new Set(["right", "left"]));
  });

  it("varies inverse-graph point reflections with stable coordinate grading", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<string>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-inverse-point|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", INVERSE_POINT_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("pointEntry");
      expect(solvePrompt(INVERSE_POINT_FORM, first.widget.prompt), seed).toEqual(first.answer);
      prompts.add(first.widget.prompt); answers.add(JSON.stringify(first.answer));
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(10);
  });

  it("varies affine inverse round trips in the exact-number lab", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    const prompts = new Set<string>(); const answers = new Set<number>();
    for (let index = 0; index < 160; index += 1) {
      const seed = `s246-inverse-verify|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "stretch", INVERSE_VERIFY_FORM);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("exactNumberLab");
      expect(solvePrompt(INVERSE_VERIFY_FORM, first.widget.prompt), seed).toBe(first.answer);
      prompts.add(first.widget.prompt); answers.add(first.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(10);
    expect(answers.size).toBeGreaterThanOrEqual(8);
  });
});
