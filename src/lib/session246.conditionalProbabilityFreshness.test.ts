import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { solvePrompt as solveStatProbabilityPrompt } from "./statProbabilityIndependent.cjs";
import { STAT_PROBABILITY_GENERATORS } from "./statProbabilityVariants";
import { hashSeed, mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { variantForStep } from "./variants";
import type { Band } from "./difficulty";

const GENERATOR = "g10-conditional-probability";
const FORM = "conditional-probability__cpr-overlap-count__numeric";
const JOINT_FORM = "conditional-probability__cpr-joint-prob__numeric";
const REPAIRED_NUMERIC_FORMS = [
  JOINT_FORM,
  "conditional-probability__cpr-marginal-prob__numeric",
  "conditional-probability__cpr-complement-table__numeric",
  "conditional-probability__cpr-conditional-table__numeric",
  "conditional-probability__cpr-reversal-error__numeric",
  "conditional-probability__cpr-table-union__numeric",
  "conditional-probability__cpr-indep-vs-disjoint__numeric",
] as const;

function lessonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return lessonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function consumers(): Array<{ file: string; id: string; surface: string }> {
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

function exercise(seed: string, band: Band) {
  const generator = STAT_PROBABILITY_GENERATORS.find(
    (candidate) => candidate.tag === GENERATOR,
  )!;
  const first = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  const replay = generator.gen(mulberry32(hashSeed(seed)), band, FORM);
  expect(replay, seed).toEqual(first);
  expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
  expect(first.widget.type, seed).toBe("numeric");
  expect(
    solveStatProbabilityPrompt(FORM, first.widget.prompt),
    seed,
  ).toBe(first.answer);
  expect(first.widget.answer, seed).toBe(first.answer);

  const traps = first.widget.commonErrors.map(
    (error: { value: number }) => error.value,
  );
  expect(new Set(traps).size, seed).toBe(traps.length);
  expect(traps, seed).not.toContain(first.answer);
  return first;
}

describe("S246 conditional-probability overlap freshness", () => {
  it("accounts for both authored numeric consumers", () => {
    expect(consumers()).toEqual([
      {
        file: "content/courses/conditional-probability/lessons/cpr-01-03.json",
        id: "k2",
        surface: "numeric",
      },
      {
        file: "content/courses/conditional-probability/lessons/cpr-01-03.json",
        id: "ch1",
        surface: "numeric",
      },
    ]);
  });

  it("gives joint probability genuine table-state variation and prompt-derived answers", () => {
    const generator = STAT_PROBABILITY_GENERATORS.find(
      (candidate) => candidate.tag === GENERATOR,
    )!;
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let index = 0; index < 96; index += 1) {
      const seed = `s246-conditional-joint|${index}`;
      const first = generator.gen(mulberry32(hashSeed(seed)), "core", JOINT_FORM);
      const replay = generator.gen(mulberry32(hashSeed(seed)), "core", JOINT_FORM);
      expect(replay, seed).toEqual(first);
      expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
      expect(first.widget.type, seed).toBe("numeric");
      expect(solveStatProbabilityPrompt(JOINT_FORM, first.widget.prompt), seed).toBe(first.answer);
      const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
      expect(new Set(traps).size, seed).toBe(traps.length);
      expect(traps, seed).not.toContain(first.answer);
      prompts.add(first.widget.prompt);
      answers.add(first.answer as number);
    }
    expect(prompts.size).toBe(8);
    expect(answers.size).toBeGreaterThanOrEqual(6);
  });

  it("gives every repaired numeric form deterministic, independently solved variation", () => {
    const generator = STAT_PROBABILITY_GENERATORS.find(
      (candidate) => candidate.tag === GENERATOR,
    )!;
    const bands: Band[] = ["support", "core", "stretch"];
    for (const form of REPAIRED_NUMERIC_FORMS) {
      const prompts = new Set<string>();
      const answers = new Set<number>();
      for (let index = 0; index < 96; index += 1) {
        const seed = `s246-conditional-family|${form}|${index}`;
        const band = bands[index % bands.length];
        const first = generator.gen(mulberry32(hashSeed(seed)), band, form);
        const replay = generator.gen(mulberry32(hashSeed(seed)), band, form);
        expect(replay, seed).toEqual(first);
        expect(WidgetSpec.safeParse(first.widget).success, seed).toBe(true);
        expect(first.widget.type, seed).toBe("numeric");
        expect(solveStatProbabilityPrompt(form, first.widget.prompt), seed).toBe(first.answer);
        const traps = first.widget.commonErrors.map((error: { value: number }) => error.value);
        expect(new Set(traps).size, seed).toBe(traps.length);
        expect(traps, seed).not.toContain(first.answer);
        prompts.add(first.widget.prompt);
        answers.add(first.answer as number);
      }
      expect(prompts.size, `${form} prompt variation`).toBeGreaterThanOrEqual(8);
      expect(answers.size, `${form} answer variation`).toBeGreaterThanOrEqual(4);
    }
  });

  it("varies contexts, unknown positions, givens, and answers across unseen seeds", () => {
    const prompts = new Set<string>();
    const answers = new Set<number>();
    const jobs = new Set<string>();
    const bands: Band[] = ["support", "core", "stretch"];
    for (let index = 0; index < 96; index += 1) {
      const variant = exercise(
        `s246-conditional-overlap|${index}`,
        bands[index % bands.length],
      );
      prompts.add(variant.widget.prompt);
      answers.add(variant.answer as number);
      jobs.add(/at least one/i.test(variant.widget.prompt) ? "union" : "intersection");
    }
    expect(prompts.size).toBe(10);
    expect(answers.size).toBe(10);
    expect(jobs).toEqual(new Set(["union", "intersection"]));
  });

  it("recomputes the answer from the printed quantities through the real resolver", () => {
    for (let index = 0; index < 64; index += 1) {
      const seed = `s246-conditional-resolver|${index}`;
      const resolved = variantForStep(
        {
          widget: { type: "numeric" },
          conceptTag: "cpr-overlap-count",
          variant: { gen: GENERATOR, form: FORM },
        },
        seed,
        "stretch",
      );
      expect(resolved, seed).not.toBeNull();
      expect(resolved!.answer, seed).toBe(
        solveStatProbabilityPrompt(FORM, resolved!.widget.prompt),
      );
    }
  });
});
