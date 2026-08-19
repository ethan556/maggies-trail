import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/systems-equations/lessons");
const lessons = Object.fromEntries(
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8")) as { id: string; steps: Array<{ id: string; body?: string; figure?: string }> };
      return [lesson.id, lesson];
    }),
);

function step(lessonId: string, stepId: string) {
  const found = lessons[lessonId]!.steps.find((candidate) => candidate.id === stepId);
  if (!found) throw new Error(`${lessonId}/${stepId} is missing`);
  return found;
}

describe("S275 Systems of Equations P0 visual-truth packet", () => {
  it("withholds a fixed coordinate walk from an unrelated substitution explanation", () => {
    expect(step("se-02-02", "c1").figure).toBeUndefined();
    expect(step("se-02-02", "c2").figure).toBe("se-isolate-first");
  });

  it("retains the exact scale-both visual only with its matching arithmetic", () => {
    const concept = step("se-03-03", "c2");
    expect(concept.figure).toBe("se-scale-both");
    for (const fragment of ["2x + 3y = 13", "3x + 2y = 12", "6x + 9y = 39", "6x + 4y = 24", "y = 3", "x = 2"]) {
      expect(concept.body).toContain(fragment);
    }
  });

  it("keeps every current course lesson schema- and pedagogy-clean", () => {
    for (const lesson of Object.values(lessons)) {
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
