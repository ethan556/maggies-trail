import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solve: solveG4 } = require2("./g4Independent.cjs") as { solve: (form: string, widget: { prompt: string; options: unknown[] }) => number };

type Step = { id: string; figure?: string; widget?: { prompt: string; answer?: number }; variant?: { form: string } };
type Lesson = { id: string; steps: Step[] };
const lessonDir = join(__dirname, "../../content/courses/multiply-bigger/lessons");
const lessons = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort()
  .map((file) => JSON.parse(readFileSync(join(lessonDir, file), "utf8")) as Lesson);
const withheld = ["mb-01-01/c2", "mb-01-02/c1", "mb-01-02/c2", "mb-02-01/c1", "mb-03-01/c1", "mb-03-01/c2", "mb-03-02/c1", "mb-03-02/c2", "mb-03-03/c1", "mb-04-01/c1", "mb-04-02/c2"];

function stepAt(path: string) {
  const [lessonId, stepId] = path.split("/");
  return lessons.find((lesson) => lesson.id === lessonId)!.steps.find((step) => step.id === stepId)!;
}

describe("S265 multiply bigger source repair", () => {
  it("withholds all 11 fixed-exemplar diagram mismatches", () => {
    expect(lessons).toHaveLength(14);
    expect(withheld.map(stepAt).every((step) => step.figure === undefined)).toBe(true);
  });

  it("keeps the three replacement transfer prompts generator-safe", () => {
    for (const path of ["mb-03-01/k2", "mb-04-01/k3", "mb-05-01/k3"]) {
      const step = stepAt(path);
      expect(step.widget?.answer).toBe(solveG4(step.variant!.form, { prompt: step.widget!.prompt, options: [] }));
    }
  });
});
