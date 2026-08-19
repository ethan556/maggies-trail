import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/function-analysis/lessons");
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

describe("S277 Function Analysis P0 visual-truth packet", () => {
  it("withholds a fixed reflected line from the generic inverse-composition proof", () => {
    const concept = step("fna-05-03", "c1");
    expect(concept.figure).toBeUndefined();
    for (const fragment of ["f(g(x)) = x", "g(f(x)) = x", "right domains"]) {
      expect(concept.body).toContain(fragment);
    }
  });

  it("keeps every current course lesson schema- and pedagogy-clean", () => {
    for (const lesson of Object.values(lessons)) {
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
