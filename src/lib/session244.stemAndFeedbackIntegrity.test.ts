import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { CALCULUS_GENERATORS } from "./calculusVariants";
import { GEOMETRY_GENERATORS } from "./geometryVariants";
import { G0_GENERATORS } from "./g0Variants";
import { G1_GENERATORS } from "./g1Variants";
import { G2_GENERATORS } from "./g2Variants";
import { PRECALCULUS_GENERATORS } from "./precalculusVariants";
import { STAT_PROBABILITY_GENERATORS } from "./statProbabilityVariants";

const ROOT = process.cwd();

function readJson(relativePath: string): any {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function collectPrompts(value: unknown, out: Array<{ prompt: string; answer?: unknown }> = []): Array<{ prompt: string; answer?: unknown }> {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectPrompts(item, out));
    return out;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.prompt === "string") out.push({ prompt: record.prompt, answer: record.answer });
  Object.values(record).forEach((item) => collectPrompts(item, out));
  return out;
}

describe("S244 premium stem and feedback integrity", () => {
  it("keeps generated questions aligned with the response surface", () => {
    const generators = [
      ...CALCULUS_GENERATORS,
      ...PRECALCULUS_GENERATORS,
      ...STAT_PROBABILITY_GENERATORS,
      ...GEOMETRY_GENERATORS,
    ];
    let sampled = 0;
    for (const generator of generators) {
      const forms = generator.forms?.length ? generator.forms : ["default"];
      for (const form of forms) {
        for (const band of ["support", "core", "stretch"] as const) {
          const result = generator.gen(() => 0.314159, band, form as never);
          expect(result.widget.prompt, `${generator.tag}@${String(form)}:${band}`).not.toMatch(/Reasoning check:/i);
          sampled += 1;
        }
      }
    }
    expect(sampled).toBeGreaterThan(100);
  });

  it("never names one-half when a fraction bar targets a different value", () => {
    const lesson = readJson("content/courses/fractions-deeper-g3/lessons/g3f-01-01.json");
    const spec = lesson.steps.find((step: any) => step.id === "i1").widget;
    expect(spec.targetNum).toBe(1);
    expect(spec.targetDen).toBe(4);
    expect(evaluate(spec, { n: 1, d: 8 }).feedback).toContain("target quarter");
    expect(evaluate(spec, { n: 1, d: 2 }).feedback).toContain("target quarter");

    const staleSpec = {
      ...spec,
      targetNum: 3,
      targetDen: 4,
      lowFeedback: "Your bar is shorter than the target half.",
      highFeedback: "Your bar is longer than half.",
    };
    expect(evaluate(staleSpec, { n: 1, d: 4 }).feedback).toContain("target 3/4");
    expect(evaluate(staleSpec, { n: 1, d: 1 }).feedback).toContain("target 3/4");
  });

  it("stores genuine two-step Grade 3 stories with complete, natural stems", () => {
    const lessonDir = path.join(ROOT, "content/courses/word-problems-g3/lessons");
    const prompts = fs.readdirSync(lessonDir)
      .filter((name) => name.endsWith(".json"))
      .flatMap((name) => collectPrompts(JSON.parse(fs.readFileSync(path.join(lessonDir, name), "utf8"))));

    expect(prompts.map((item) => item.prompt).join("\n")).not.toMatch(/teacher returned 0|after the extra one arrived/i);

    const arrivals = prompts.filter((item) => /There were \d+ crates\. One more crate arrived\./.test(item.prompt));
    const removals = prompts.filter((item) => /shelves hold \d+ markers each\. Students take \d+ markers\./.test(item.prompt));
    expect(arrivals.length).toBeGreaterThanOrEqual(3);
    expect(removals.length).toBeGreaterThanOrEqual(7);

    for (const item of arrivals) {
      const match = item.prompt.match(/There were (\d+) crates\. One more crate arrived\. Each crate holds (\d+) (?:apples|pencils)\./)!;
      expect(item.answer).toBe((Number(match[1]) + 1) * Number(match[2]));
    }
    for (const item of removals) {
      const match = item.prompt.match(/(\d+) shelves hold (\d+) markers each\. Students take (\d+) markers\./)!;
      expect(item.answer).toBe(Number(match[1]) * Number(match[2]) - Number(match[3]));
    }
  });

  it("uses a grammatical zero-change Kindergarten story", () => {
    const lesson = readJson("content/courses/counting-to-20-k/lessons/kc-04-01.json");
    const prompts = collectPrompts(lesson);
    const zeroStory = prompts.find((item) => /No new eggs are added/i.test(item.prompt));
    expect(zeroStory).toBeDefined();
    const zeroStep = lesson.steps.find((step: any) => /No new eggs are added/i.test(step.widget?.prompt ?? ""));
    expect(zeroStep.widget.options.find((option: any) => option.correct)?.label).toBe("8");
    expect(prompts.map((item) => item.prompt).join("\n")).not.toMatch(/add 0 eggs/i);
  });

  it("uses complete Grade 2 story sentences instead of telegraphic quantity lists", () => {
    const text = ["as100-04-01", "as100-04-02", "as100-04-03"]
      .flatMap((id) => collectPrompts(readJson(`content/courses/add-subtract-100/lessons/${id}.json`)))
      .map((item) => item.prompt)
      .join("\n");
    expect(text).not.toMatch(/(?:^|\n)(?:\d+ (?:birds|marbles|fish|apples|stickers|shells|cookies|pencils|crayons|grapes)),/i);
    expect(text).toContain("Lee has 40 pencils.");
    expect(text).toContain("A bakery has 60 cookies.");
  });

  it("does not pad K–2 generated choices with generic filler", () => {
    for (const generator of [...G0_GENERATORS, ...G1_GENERATORS, ...G2_GENERATORS]) {
      for (const form of generator.forms ?? ["default"]) {
        for (const random of [0.07, 0.41, 0.83]) {
          const result = generator.gen(() => random, "core", form as never);
          if (result.widget.type !== "mcq") continue;
          const labels = result.widget.options.map((option: any) => option.label);
          expect(labels, `${generator.tag}@${String(form)}:${random}`).not.toContain("A different choice");
          expect(labels, `${generator.tag}@${String(form)}:${random}`).not.toContain("There is not enough information");
          expect(labels.every((label: string) => !/^Alternative \d+$/i.test(label))).toBe(true);
          expect(labels.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });
});
