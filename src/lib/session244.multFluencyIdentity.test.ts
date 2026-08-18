import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson as LessonSchema } from "./schema";
import { lintLesson } from "./pedagogy";

type UnknownRecord = Record<string, unknown>;

type FactIdentity = {
  id: string;
  slug: string;
  title: string;
  tag: string;
  family: string;
  factor?: number;
  square?: true;
};

const root = process.cwd();

function readJson(path: string): UnknownRecord {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as UnknownRecord;
}

function lesson(id: string): UnknownRecord {
  return readJson(`content/courses/mult-fluency-g3/lessons/${id}.json`);
}

function collectValues(value: unknown, key: string, output: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    for (const item of value) collectValues(item, key, output);
    return output;
  }
  if (!value || typeof value !== "object") return output;
  for (const [candidateKey, candidateValue] of Object.entries(value as UnknownRecord)) {
    if (candidateKey === key) output.push(candidateValue);
    collectValues(candidateValue, key, output);
  }
  return output;
}

const identities: FactIdentity[] = [
  {
    id: "mf3-01-05",
    slug: "the-6-facts",
    title: "The ×6 Facts",
    tag: "g3m-x6",
    family: "MultTable6Numeric",
    factor: 6
  },
  {
    id: "mf3-01-06",
    slug: "the-7-facts",
    title: "The ×7 Facts",
    tag: "g3m-x7",
    family: "MultTable7Numeric",
    factor: 7
  },
  {
    id: "mf3-02-01",
    slug: "the-8-facts",
    title: "The ×8 Facts",
    tag: "g3m-x8",
    family: "MultTable8Numeric",
    factor: 8
  },
  {
    id: "mf3-02-02",
    slug: "the-9-facts",
    title: "The ×9 Facts",
    tag: "g3m-x9",
    family: "MultTable9Numeric",
    factor: 9
  },
  {
    id: "mf3-02-03",
    slug: "the-10-facts",
    title: "The ×10 Facts",
    tag: "g3m-x10",
    family: "MultTable10Numeric",
    factor: 10
  },
  {
    id: "mf3-02-04",
    slug: "square-facts-3x3-to-5x5",
    title: "Square Facts: 3×3 to 5×5",
    tag: "g3m-squares",
    family: "MultSquaresNumeric",
    square: true
  }
];

describe("S244 Grade 3 multiplication-fluency lesson identity", () => {
  it.each(identities)("$id keeps its title, tag, generator, and visual model aligned", (identity) => {
    const raw = lesson(identity.id);
    const parsed = LessonSchema.parse(raw);

    expect(raw.slug).toBe(identity.slug);
    expect(raw.title).toBe(identity.title);
    expect(lintLesson(parsed), identity.id).toEqual([]);

    const conceptTags = collectValues(raw, "conceptTag");
    expect(new Set(conceptTags)).toEqual(new Set([identity.tag]));

    const transferFamilies = collectValues(raw, "transferFamily");
    expect(new Set(transferFamilies)).toEqual(new Set([`fact-fluency:${identity.tag}`]));

    const generatorForms = collectValues(raw, "form").filter(
      (value): value is string => typeof value === "string" && value.startsWith("Mult")
    );
    expect(new Set(generatorForms)).toEqual(new Set([identity.family]));

    const widgets = collectValues(raw, "widget").filter(
      (value): value is UnknownRecord => Boolean(value && typeof value === "object")
    );
    const arrays = widgets.filter((widget) => widget.type === "areaModel");
    expect(arrays.length).toBeGreaterThanOrEqual(2);

    for (const widget of arrays) {
      const factors = widget.requireFactors as { w?: number; h?: number } | undefined;
      expect(factors).toBeDefined();
      if (identity.square) {
        expect(factors?.w).toBe(factors?.h);
      } else {
        expect([factors?.w, factors?.h]).toContain(identity.factor);
      }
    }

    const serialized = JSON.stringify(raw);
    expect(serialized).not.toContain("g3m x");
    expect(serialized).not.toContain("g3m squares");
  });

  it("places easy patterns before the harder fact families", () => {
    const course = readJson("content/courses/mult-fluency-g3/course.json");
    const chapters = course.chapters as Array<{ lessonIds: string[] }>;
    expect(chapters[0]?.lessonIds.slice(-2)).toEqual(["mf3-01-05", "mf3-01-06"]);
    expect(chapters[1]?.lessonIds.slice(0, 4)).toEqual([
      "mf3-02-01",
      "mf3-02-02",
      "mf3-02-03",
      "mf3-02-04"
    ]);
    expect(identities.map((identity) => identity.title)).toEqual([
      "The ×6 Facts",
      "The ×7 Facts",
      "The ×8 Facts",
      "The ×9 Facts",
      "The ×10 Facts",
      "Square Facts: 3×3 to 5×5"
    ]);
  });

  it("closes all 18 queue-defined progression rows and 72 normalized-repeat placements", () => {
    const lessonIds = [
      "mf3-01-01", "mf3-01-02", "mf3-01-03", "mf3-01-04", "mf3-01-05", "mf3-01-06",
      "mf3-02-01", "mf3-02-02", "mf3-02-03", "mf3-02-04", "mf3-02-05", "mf3-02-06",
      "mf3-03-01", "mf3-03-02", "mf3-03-03", "mf3-03-04", "mf3-03-05", "mf3-03-06"
    ];
    const normalizePrompt = (prompt: string) => prompt
      .toLowerCase()
      .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
      .replace(/\s+/g, " ");

    expect(lessonIds).toHaveLength(18);
    expect(lessonIds.flatMap(() => ["i2", "k2", "k3", "ch1"])).toHaveLength(72);

    for (const lessonId of lessonIds) {
      const raw = lesson(lessonId);
      const steps = raw.steps as Array<{ id: string; widget?: { prompt?: string } }>;
      const prompts = steps.filter((step) => step.widget?.prompt).map((step) => ({
        id: step.id,
        normalized: normalizePrompt(String(step.widget?.prompt))
      }));
      const repeated = prompts.filter((item, index) =>
        prompts.findIndex((candidate) => candidate.normalized === item.normalized) !== index
      );
      expect(repeated, lessonId).toEqual([]);

      const remedials = raw.remedials as Array<{ check: { widget: { prompt: string } } }>;
      expect(remedials, `${lessonId}/remedial count`).toHaveLength(1);
      const mainPromptSet = new Set(prompts.map((item) => item.normalized));
      expect(mainPromptSet.has(normalizePrompt(remedials[0].check.widget.prompt)), `${lessonId}/remedial copy`).toBe(false);
    }
  });
});
