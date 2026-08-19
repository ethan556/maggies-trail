import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/conditional-probability/lessons");
const lessons = Object.fromEntries(
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8")) as { id: string; steps: Array<{ id: string; body?: string; figure?: string }>; remedials?: Array<{ concept: { id: string; body?: string; figure?: string } }> };
      return [lesson.id, lesson];
    }),
);

function step(lessonId: string, stepId: string) {
  const found = lessons[lessonId]!.steps.find((candidate) => candidate.id === stepId);
  if (!found) throw new Error(`${lessonId}/${stepId} is missing`);
  return found;
}

describe("S273 Conditional Probability source-local visual packet", () => {
  it("keeps figures only when their exact numeric and semantic contract is stated", () => {
    const unionRemedial = lessons["cpr-02-03"]!.remedials![0]!.concept;
    expect(unionRemedial.figure).toBe("cpr-table-union");
    expect(unionRemedial.body).toContain("100 take the bus, 110 play a sport, and 40 do both");
    expect(unionRemedial.body).toContain("170/200 = 0.85");

    const multiplication = step("cpr-03-03", "c1");
    expect(multiplication.figure).toBe("cpr-multiplication-area");
    expect(multiplication.body).toContain("0.5 × 0.4 = 0.20");

    expect(step("cpr-05-03", "c1").figure).toBe("cpr-count-prob-bars");
    expect(step("cpr-05-03", "c2").figure).toBeUndefined();
  });

  it("keeps every current course lesson schema- and pedagogy-clean", () => {
    for (const lesson of Object.values(lessons)) {
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
