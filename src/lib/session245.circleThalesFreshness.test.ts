import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";
import type { Band } from "./difficulty";

const FORM = "cr-thales__numeric";
const GENERATOR = "g10-circle-theorems";
const FRESH_FORMS = [
  "cr-chord-arc__numeric",
  "cr-cyclic-quad__numeric",
  "cr-power-point__numeric",
  "cr-secant-angles__numeric",
  "cr-sector-area__numeric",
  "cr-tangent-apps__numeric",
  "cr-tangent-chord__numeric",
  "cr-tangent-perp__numeric",
  "cr-thales__numeric",
  "cr-two-tangent__numeric",
] as const;
const PROMPT =
  /^AB is a diameter of a circle and C lies on the circle\. If ∠ACB = \((\d+)x \+ (\d+)\)°, find x\.$/;

function lessonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return lessonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function matchingConsumers(): Array<{
  file: string;
  id: string;
  surface: string;
}> {
  const found: Array<{ file: string; id: string; surface: string }> = [];
  for (const file of lessonFiles("content/courses")) {
    const lesson = JSON.parse(readFileSync(file, "utf8"));
    for (const step of lesson.steps ?? []) {
      if (step.variant?.gen === GENERATOR && step.variant?.form === FORM) {
        found.push({
          file: file.replaceAll("\\", "/"),
          id: step.id,
          surface: step.widget?.type,
        });
      }
    }
  }
  return found;
}

function changedFormConsumers(): Array<{ form: string; surface: string }> {
  const found: Array<{ form: string; surface: string }> = [];
  for (const file of lessonFiles("content/courses")) {
    const lesson = JSON.parse(readFileSync(file, "utf8"));
    for (const step of lesson.steps ?? []) {
      if (
        step.variant?.gen === GENERATOR &&
        FRESH_FORMS.includes(step.variant?.form as (typeof FRESH_FORMS)[number])
      ) {
        found.push({ form: step.variant.form, surface: step.widget?.type });
      }
    }
  }
  return found;
}

function exerciseSeed(seed: string, band: Band) {
  const generator = GEOMETRY_GENERATORS.find(
    (candidate) => candidate.tag === GENERATOR,
  )!;
  const first = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  const replay = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  expect(replay, seed).toEqual(first);

  const widget = first.widget;
  expect(WidgetSpec.safeParse(widget).success, seed).toBe(true);
  expect(widget.type, seed).toBe("numeric");
  const match = widget.prompt.match(PROMPT);
  expect(match, seed).not.toBeNull();

  const coefficient = Number(match![1]);
  const constant = Number(match![2]);
  const independentlyDerived = (90 - constant) / coefficient;
  expect(Number.isInteger(independentlyDerived), seed).toBe(true);
  expect(first.answer, seed).toBe(independentlyDerived);
  expect(widget.answer, seed).toBe(independentlyDerived);
  expect(solveGeometryPrompt(FORM, widget.prompt), seed).toBe(
    independentlyDerived,
  );

  const traps = widget.commonErrors.map(
    (error: { value: number }) => error.value,
  );
  expect(new Set(traps).size, seed).toBe(traps.length);
  expect(traps, seed).not.toContain(independentlyDerived);
  expect(widget.fallbackFeedback, seed).toContain(
    `${coefficient}x + ${constant} = 90`,
  );
  expect(widget.successFeedback, seed).toContain(`x = ${independentlyDerived}`);
  return first;
}

describe("S245 g10 circle-theorems Thales freshness", () => {
  it("has exactly one audited learner consumer on the expected numeric surface", () => {
    expect(matchingConsumers()).toEqual([
      {
        file: "content/courses/circle-theorems/lessons/cr-01-03.json",
        id: "k1",
        surface: "numeric",
      },
    ]);
  });

  it("accounts for every consumer of every repaired circle-theorems form", () => {
    const consumers = changedFormConsumers();
    const expected: Record<string, { count: number; surface: string }> = {
      "cr-chord-arc__numeric": { count: 3, surface: "numeric" },
      "cr-cyclic-quad__numeric": { count: 2, surface: "numeric" },
      "cr-power-point__numeric": { count: 4, surface: "exactNumberLab" },
      "cr-secant-angles__numeric": { count: 3, surface: "exactNumberLab" },
      "cr-sector-area__numeric": { count: 2, surface: "numeric" },
      "cr-tangent-apps__numeric": { count: 4, surface: "exactNumberLab" },
      "cr-tangent-chord__numeric": { count: 3, surface: "numeric" },
      "cr-tangent-perp__numeric": { count: 3, surface: "numeric" },
      "cr-thales__numeric": { count: 1, surface: "numeric" },
      "cr-two-tangent__numeric": { count: 4, surface: "numeric" },
    };

    expect(consumers).toHaveLength(29);
    for (const form of FRESH_FORMS) {
      const matching = consumers.filter((consumer) => consumer.form === form);
      expect(matching, form).toHaveLength(expected[form].count);
      expect(
        new Set(matching.map((consumer) => consumer.surface)),
        form,
      ).toEqual(new Set([expected[form].surface]));
    }
  });

  it("varies mathematical givens and answers while preserving one question job", () => {
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const bands: Band[] = ["support", "core", "stretch"];
    for (let index = 0; index < 64; index += 1) {
      const variant = exerciseSeed(
        `s245-thales-audit|${index}`,
        bands[index % bands.length],
      );
      prompts.add(variant.widget.prompt);
      answers.add(variant.answer as number);
    }
    expect(prompts.size).toBeGreaterThanOrEqual(8);
    expect(answers.size).toBeGreaterThanOrEqual(8);
  });

  it("recomputes unseen seeds independently and clears the real resolver path", () => {
    const unseenPrompts = new Set<string>();
    const unseenAnswers = new Set<number>();
    for (let index = 0; index < 64; index += 1) {
      const seed = `s245-thales-unseen|${index}`;
      const direct = exerciseSeed(seed, "stretch");
      unseenPrompts.add(direct.widget.prompt);
      unseenAnswers.add(direct.answer as number);

      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "cr-thales",
          variant: { gen: GENERATOR, form: FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(
        solveGeometryPrompt(FORM, resolved!.widget.prompt),
      );
    }
    expect(unseenPrompts.size).toBeGreaterThanOrEqual(8);
    expect(unseenAnswers.size).toBeGreaterThanOrEqual(8);
  });

  it("gives every repaired form deterministic, independently solvable unseen variation", () => {
    const generator = GEOMETRY_GENERATORS.find(
      (candidate) => candidate.tag === GENERATOR,
    )!;
    const bands: Band[] = ["support", "core", "stretch"];

    for (const form of FRESH_FORMS) {
      const prompts = new Set<string>();
      const answers = new Set<number>();
      for (let index = 0; index < 64; index += 1) {
        const seed = `s245-circle-family-unseen|${form}|${index}`;
        const band = bands[index % bands.length];
        const first = generator.gen(mulberry32(hashSeed(seed)), band, form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), band, form);
        expect(replay, seed).toEqual(first);
        expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
        expect(solveGeometryPrompt(form, first.widget.prompt), seed).toBe(
          first.answer,
        );

        const traps =
          first.widget.type === "numeric"
            ? first.widget.commonErrors.map(
                (error: { value: number }) => error.value,
              )
            : first.widget.numericErrors.map(
                (error: { value: number }) => error.value,
              );
        expect(new Set(traps).size, seed).toBe(traps.length);
        expect(traps, seed).not.toContain(first.answer);
        prompts.add(first.widget.prompt);
        answers.add(first.answer as number);
      }
      expect(prompts.size, `${form} prompt variation`).toBeGreaterThanOrEqual(
        8,
      );
      expect(answers.size, `${form} answer variation`).toBeGreaterThanOrEqual(
        6,
      );
    }
  });
});
