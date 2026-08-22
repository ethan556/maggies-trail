import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/lines-angles/lessons");
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

describe("S278 Lines & Angles P0 visual-truth packet", () => {
  it("retains the regular-shape visual only for its exact claim and withholds it from the rectangle contrast", () => {
    const regular = step("la-04-02", "c1");
    expect(regular.figure).toBe("la-symmetry-regular");
    expect(regular.body).toContain("regular shape");

    const rectangle = step("la-04-02", "c2");
    expect(rectangle.figure).toBeUndefined();
    for (const fragment of ["rectangle (unequal sides)", "only **2**", "diagonals do NOT"]) {
      expect(rectangle.body).toContain(fragment);
    }
  });

  it("keeps every current course lesson schema- and pedagogy-clean", () => {
    for (const lesson of Object.values(lessons)) {
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
