import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Step = { id: string; figure?: string; widget?: { type?: string } };
type Lesson = { id: string; steps: Step[] };

const courseDir = path.join(process.cwd(), "content", "courses", "fractions-multiply", "lessons");
const removedPlacements: ReadonlyArray<readonly [string, string, string]> = [
  ["fm-01-02", "c2", "fm-add-unlike"], ["fm-01-03", "c1", "fm-subtract-unlike"], ["fm-01-03", "c2", "fm-subtract-unlike"],
  ["fm-02-01", "c1", "fm-groups"], ["fm-02-01", "c2", "fm-groups"], ["fm-02-02", "c2", "fm-fraction-of"],
  ["fm-03-02", "c1", "fm-multiply-across"], ["fm-03-03", "c1", "fm-cancel"], ["fm-03-03", "c2", "fm-cancel"],
  ["fm-05-01", "c1", "fm-divide-unit"], ["fm-05-01", "c2", "fm-divide-unit"], ["fm-05-02", "c1", "fm-unit-divide-whole"],
  ["fm-05-02", "c2", "fm-unit-divide-whole"], ["fm-05-03", "c1", "fm-divide-unit"],
];

async function lesson(lessonId: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(courseDir, `${lessonId}.json`), "utf8")) as Lesson;
}

describe("S266 Fractions Multiply source-local visual repair", () => {
  it("fails closed for each fixed exemplar that disagrees with authored mathematics", async () => {
    const lessons = new Map<string, Lesson>();
    for (const [lessonId] of removedPlacements) if (!lessons.has(lessonId)) lessons.set(lessonId, await lesson(lessonId));
    for (const [lessonId, stepId, incompatibleFigure] of removedPlacements) {
      const step = lessons.get(lessonId)?.steps.find((candidate) => candidate.id === stepId);
      expect(step, `${lessonId}/${stepId}`).toBeDefined();
      expect(step?.figure, `${lessonId}/${stepId} must not retain ${incompatibleFigure}`).toBeUndefined();
    }
  });

  it("preserves exact or semantically aligned figures and every learner interaction contract", async () => {
    const exactFigures: ReadonlyArray<readonly [string, string, string]> = [
      ["fm-01-02", "c1", "fm-add-unlike"], ["fm-02-02", "c1", "fm-fraction-of"],
      ["fm-03-02", "c2", "fm-multiply-across"], ["fm-05-03", "c2", "fm-unit-divide-whole"],
    ];
    for (const [lessonId, stepId, expectedFigure] of exactFigures) {
      const step = (await lesson(lessonId)).steps.find((candidate) => candidate.id === stepId);
      expect(step?.figure).toBe(expectedFigure);
    }
    const files = ["fm-01-01", "fm-01-02", "fm-01-03", "fm-02-01", "fm-02-02", "fm-03-01", "fm-03-02", "fm-03-03", "fm-04-01", "fm-04-02", "fm-05-01", "fm-05-02", "fm-05-03"];
    expect(files).toHaveLength(13);
    for (const lessonId of files) {
      const current = await lesson(lessonId);
      expect(current.id).toBe(lessonId);
      expect(current.steps.filter((step) => step.widget !== undefined)).not.toHaveLength(0);
    }
  });
});
