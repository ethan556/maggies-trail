import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";

const GENERATOR = "g13-parametric-polar-calculus";
const FORMS = [
  "parametric-polar-calculus__pc-parametric-derivative__numeric",
  "parametric-polar-calculus__pc-parametric-derivative__mcq",
  "parametric-polar-calculus__pc-second-derivative__numeric",
  "parametric-polar-calculus__pc-arc-length__numeric",
  "parametric-polar-calculus__pc-arc-length__mcq",
] as const;
type Pc01Form = typeof FORMS[number];

const EXPECTED_TYPE: Record<Pc01Form, "numeric" | "mcq"> = {
  "parametric-polar-calculus__pc-parametric-derivative__numeric": "numeric",
  "parametric-polar-calculus__pc-parametric-derivative__mcq": "mcq",
  "parametric-polar-calculus__pc-second-derivative__numeric": "numeric",
  "parametric-polar-calculus__pc-arc-length__numeric": "numeric",
  "parametric-polar-calculus__pc-arc-length__mcq": "mcq",
};

function assertPromptTruth(form: Pc01Form, generated: { widget: unknown; answer: unknown }, seed: string) {
  const widget = WidgetSpec.parse(generated.widget);
  const truth = solveCalculusPrompt(form, widget.prompt);
  expect(widget.type, seed).toBe(EXPECTED_TYPE[form]);
  if (widget.type === "numeric") {
    expect(widget.answer, seed).toBe(truth);
    expect(generated.answer, seed).toBe(truth);
    expect(new Set(widget.commonErrors.map((error) => error.value)).size, seed).toBe(widget.commonErrors.length);
    expect(widget.commonErrors.every((error) => error.value !== truth), seed).toBe(true);
  } else if (widget.type === "mcq") {
    const correct = widget.options.filter((option) => option.correct);
    expect(correct, seed).toHaveLength(1);
    expect(correct[0]!.label, seed).toBe(truth);
    expect(correct[0]!.id, seed).toBe(generated.answer);
    expect(new Set(widget.options.map((option) => option.label)).size, seed).toBe(widget.options.length);
    const lengths = widget.options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths), `${seed}: option-length parity`).toBeLessThanOrEqual(8);
  } else {
    throw new Error(`${form} emitted unsupported surface ${widget.type}`);
  }
  return { prompt: widget.prompt, truth: JSON.stringify(truth) };
}

describe("S246 parametric-polar-calculus pc-01 generator assurance", () => {
  it("covers the exact eight consumers and five coherent forms", () => {
    const counts = new Map<string, number>();
    for (const lessonId of ["pc-01-01", "pc-01-02"]) {
      const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "parametric-polar-calculus", "lessons", `${lessonId}.json`), "utf8"));
      for (const step of lesson.steps) {
        const form = step.variant?.gen === GENERATOR ? step.variant.form : undefined;
        if (form && FORMS.includes(form)) counts.set(form, (counts.get(form) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(counts)).toEqual({
      "parametric-polar-calculus__pc-parametric-derivative__numeric": 2,
      "parametric-polar-calculus__pc-parametric-derivative__mcq": 1,
      "parametric-polar-calculus__pc-second-derivative__numeric": 1,
      "parametric-polar-calculus__pc-arc-length__numeric": 3,
      "parametric-polar-calculus__pc-arc-length__mcq": 1,
    });
    expect([...counts.values()].reduce((sum, count) => sum + count, 0)).toBe(8);
  });

  it("ratchets twelve prompt-derived truth states per form with deterministic replay", () => {
    const generator = CALCULUS_GENERATORS.find((candidate) => candidate.tag === GENERATOR)!;
    for (const form of FORMS) {
      const prompts = new Set<string>();
      const truths = new Set<string>();
      const positions = new Set<number>();
      for (let index = 0; index < 280; index += 1) {
        const seed = `s246-pc01|${form}|${index}`;
        const first = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), "core", form);
        expect(replay, seed).toEqual(first);
        const observed = assertPromptTruth(form, first, seed);
        prompts.add(observed.prompt);
        truths.add(observed.truth);
        if (first.widget.type === "mcq") positions.add(first.widget.options.findIndex((option: { correct?: boolean }) => option.correct));
      }
      expect(prompts.size, `${form} prompt pool`).toBe(12);
      expect(truths.size, `${form} truth pool`).toBe(12);
      if (EXPECTED_TYPE[form] === "mcq") expect(positions.size, `${form} answer positions`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps unseen resolver seeds schema-valid, surface-preserving, and prompt-solvable", () => {
    for (const form of FORMS) {
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-pc01-resolver|${form}|${index}`;
        const step = { widget: { type: EXPECTED_TYPE[form] }, variant: { gen: GENERATOR, form } };
        const first = variantForStep(step, seed, "stretch");
        expect(first, seed).not.toBeNull();
        expect(variantForStep(step, seed, "stretch"), seed).toEqual(first);
        assertPromptTruth(form, first!, seed);
      }
    }
  });

  it("recomputes changed mathematics and rejects invalid or malformed mutations", () => {
    expect(solveCalculusPrompt(FORMS[0], "x(t) = 4t + 9 and y(t) = 7t² - 3. Find dy/dx at t = 5. Give three decimals if needed.")).toBe(17.5);
    expect(solveCalculusPrompt(FORMS[1], "For x(t) = 4t + 9 and y(t) = 7t² - 3, which value is dy/dx at t = 5?")).toBe("dy/dx = 17.5");
    expect(solveCalculusPrompt(FORMS[2], "x(t) = 4t + 9 and y(t) = 7t³ - 3. Find d²y/dx² at t = 5. Give three decimals if needed.")).toBe(13.125);
    expect(solveCalculusPrompt(FORMS[3], "The curve has x(t) = 9t - 2 and y(t) = 12t + 8 for 0 ≤ t ≤ 3. Find its arc length.")).toBe(45);
    expect(() => solveCalculusPrompt(FORMS[0], "x(t) = 0t + 9 and y(t) = 7t² - 3. Find dy/dx at t = 5.")).toThrow(/nonzero/);
    expect(() => solveCalculusPrompt(FORMS[3], "The curve has x(t) = 9t - 2 and y(t) = 12t + 8 for 2 ≤ t ≤ 0. Find its arc length.")).toThrow(/unrecognized/);
  });
});
