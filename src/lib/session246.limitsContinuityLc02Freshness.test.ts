import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solvePrecalculusPrompt } from "./precalculusIndependent.cjs";
import { PRECALCULUS_GENERATORS } from "./precalculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep, VARIANT_GENERATORS } from "./variants";

const GENERATOR = "g12-limits-continuity";
const FORMS = [
  "limits-continuity__lc-factor__numeric",
  "limits-continuity__lc-rationalize__mcq",
  "limits-continuity__lc-rationalize__numeric",
] as const;
type Lc02Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<Lc02Form, "numeric" | "mcq" | "exactNumberLab"> = {
  "limits-continuity__lc-factor__numeric": "numeric",
  "limits-continuity__lc-rationalize__mcq": "mcq",
  "limits-continuity__lc-rationalize__numeric": "exactNumberLab",
};

function assertPromptTruth(form: Lc02Form, generated: { widget: unknown; answer: unknown }, seed: string) {
  const widget = WidgetSpec.parse(generated.widget);
  const truth = solvePrecalculusPrompt(form, widget.prompt);
  expect(widget.type, seed).toBe(EXPECTED_TYPE[form]);
  if (widget.type === "numeric") {
    expect(generated.answer, seed).toBe(truth);
    expect(widget.answer, seed).toBe(truth);
    expect(new Set(widget.commonErrors.map((error) => error.value)).size, seed).toBe(widget.commonErrors.length);
    expect(widget.commonErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else if (widget.type === "mcq") {
    const correct = widget.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(truth);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(widget.options.map((option) => option.label)).size, seed).toBe(widget.options.length);
    const lengths = widget.options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(18);
  } else if (widget.type === "exactNumberLab") {
    expect(generated.answer, seed).toBe(truth);
    expect(widget.answerMode, seed).toBe("numeric");
    expect(widget.numericErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else {
    throw new Error(`${form} emitted unsupported surface ${widget.type}`);
  }
  return { prompt: widget.prompt, truth: JSON.stringify(truth) };
}

function solveLimitLawPrompt(prompt: string): number {
  let match = /lim f = (\d+) and lim g = (\d+).*\(f · g\)/.exec(prompt);
  if (match) return Number(match[1]) * Number(match[2]);
  match = /lim\(x→a\) f = (\d+) and lim\(x→a\) g = (\d+).*\(f \+ g\)/.exec(prompt);
  if (match) return Number(match[1]) + Number(match[2]);
  match = /lim\(x→(\d+)\) \(x² − (\d*)x \+ (\d+)\)/.exec(prompt);
  if (match) return Number(match[1]) ** 2 - Number(match[2] || 1) * Number(match[1]) + Number(match[3]);
  match = /lim\(x→(\d+)\) \(x² \+ (\d+)\)\/\(x − (\d+)\)/.exec(prompt);
  if (match) return (Number(match[1]) ** 2 + Number(match[2])) / (Number(match[1]) - Number(match[3]));
  throw new Error(`unrecognized limit-laws prompt: ${prompt}`);
}

describe("S246 limits-continuity lc-02 generator assurance", () => {
  it("covers all 12 consumers and preserves the chapter's two-generator boundary", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["lc-02-01", "lc-02-02", "lc-02-03"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "limits-continuity", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        if (!step.variant?.gen) continue;
        const key = `${step.variant.gen}::${step.variant.form ?? "default"}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "limit-laws::default": 1,
      "limit-laws::product": 1,
      "limit-laws::polySub": 1,
      "limit-laws::rationalSub": 1,
      "g12-limits-continuity::limits-continuity__lc-factor__numeric": 4,
      "g12-limits-continuity::limits-continuity__lc-rationalize__numeric": 3,
      "g12-limits-continuity::limits-continuity__lc-rationalize__mcq": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(12);
  });

  it("ratchets twelve prompt and truth states for each factor-and-conjugate form", () => {
    const generator = PRECALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      const correctPositions = new Set<number>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-limits-lc02|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const observed = assertPromptTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
        if (first.widget.type === "mcq") correctPositions.add(first.widget.options.findIndex((option: { correct?: boolean }) => option.correct));
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(12);
      if (EXPECTED_TYPE[form] === "mcq") expect(correctPositions.size, `${form} answer positions`).toBe(4);
    }
  });

  it("retains at least twelve prompt-derived cases in every direct-substitution form", () => {
    const generator = VARIANT_GENERATORS.find((candidate) => candidate.tag === "limit-laws")!;
    for (const form of ["default", "product", "polySub", "rationalSub"] as const) {
      const prompts = new Set<string>();
      const truths = new Set<number>();
      for (let index = 0; index < 320; index += 1) {
        const seed = `s246-limit-laws-lc02|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const widget = WidgetSpec.parse(first.widget);
        expect(widget.type, seed).toBe("numeric");
        const independent = solveLimitLawPrompt(widget.prompt);
        expect(first.answer, seed).toBe(independent);
        expect(widget.type === "numeric" ? widget.answer : undefined, seed).toBe(independent);
        prompts.add(widget.prompt);
        truths.add(independent);
      }
      expect(prompts.size, `${form} prompt cases`).toBeGreaterThanOrEqual(12);
      expect(truths.size, `${form} distinct answers`).toBeGreaterThanOrEqual(6);
    }
  });

  it("keeps all new forms deterministic and solvable through the item resolver", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-limits-lc02-resolver|${form}|${index}`;
        const step = { widget: { type: EXPECTED_TYPE[form] }, variant: { gen: GENERATOR, form } };
        const first = variantForStep(step, seed, "stretch");
        const replay = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(replay, seed).toEqual(first);
        assertPromptTruth(form, first!, seed);
      }
    }
  });

  it("recomputes valid mutations and rejects inconsistent cancellation or conjugate data", () => {
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-factor__numeric",
      "Find the limit as x approaches 4 of [(x - 4)(x + 3)]/(x - 4).",
    )).toBe(7);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-factor__numeric",
      "Find the limit as x approaches 4 of [(x - 5)(x + 3)]/(x - 4).",
    )).toThrow(/inconsistent removable factor/);
    expect(solvePrecalculusPrompt(
      "limits-continuity__lc-rationalize__numeric",
      "Find the limit as x approaches 0 of [√(x + 196) - 14]/x. Give a decimal to three places.",
    )).toBe(0.036);
    expect(() => solvePrecalculusPrompt(
      "limits-continuity__lc-rationalize__numeric",
      "Find the limit as x approaches 0 of [√(x + 196) - 13]/x. Give a decimal to three places.",
    )).toThrow(/inconsistent square-root constant/);
  });
});
