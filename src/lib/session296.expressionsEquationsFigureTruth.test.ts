import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson, WidgetSpec } from "./schema";

type Step = { id: string; kind: string; body?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: Step[] };

const directory = path.join(process.cwd(), "content", "courses", "expressions-equations", "lessons");
const withholds = [
  ["ee-02-02", "c2", "expression-machine", "x² at x = 3 means 3² = 3 × 3 = **9**"],
  ["ee-02b-02", "c2", "expression-machine", "3x + 1x, and once both coefficients are visible they add to 4x"],
  ["ee-02b-03", "c2", "ee-like-terms", "3(n + 2) + 4(n + 2) = 7(n + 2)"],
  ["ee-04-02", "c2", "balance-scale", "x − 5 = 12"],
  ["ee-04-03", "c2", "ee-mult-div-solve", "x ÷ 3 = 6"],
] as const;

async function load(id: string) {
  return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson;
}

function step(lesson: RawLesson, id: string) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}/${id} is missing`);
  return found;
}

describe("S296 expressions-equations fixed figure truth", () => {
  it("withholds exactly the five mismatched fixed exemplars without touching their lesson text or evaluator surfaces", async () => {
    for (const [lessonId, stepId, figure, excerpt] of withholds) {
      const concept = step(await load(lessonId), stepId);
      expect(concept.kind, `${lessonId}/${stepId}`).toBe("concept");
      expect(concept.figure, `${lessonId}/${stepId}`).toBeUndefined();
      expect(concept.widget, `${lessonId}/${stepId}`).toBeUndefined();
      expect(concept.body, `${lessonId}/${stepId}`).toContain(excerpt);
      expect(FIGURE_IDS.has(figure), figure).toBe(true);
    }
  });

  it("retains the one exact exponent illustration and seals its aligned claim", async () => {
    const concept = step(await load("ee-01-01"), "c2");
    expect(concept).toMatchObject({ figure: "ee-exponent-vs-mult" });
    expect(concept.body).toContain("2³ = 8, not 2 × 3 = 6");
    expect(FIGURE_IDS.has(concept.figure ?? "")).toBe(true);
    expect(isFigureTextAligned(concept.figure ?? "", concept.body ?? "")).toBe(true);
  });

  it("keeps all eighteen lesson identities and evaluator contracts valid", async () => {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(18);
    for (const file of files) {
      const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson;
      expect(file).toBe(`${raw.id}.json`);
      expect(raw.courseId).toBe("expressions-equations");
      Lesson.parse(raw);
      for (const current of raw.steps) if (current.widget !== undefined) WidgetSpec.parse(current.widget);
    }
  });
});
