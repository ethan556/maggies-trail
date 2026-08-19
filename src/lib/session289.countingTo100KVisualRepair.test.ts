import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

type ConceptPlacement = {
  id: string;
  figure?: string;
  body?: string;
  narration?: string;
};

type RawLesson = {
  id: string;
  courseId: string;
  steps: ConceptPlacement[];
  remedials?: Array<{ conceptTag: string; concept: ConceptPlacement }>;
};

const directory = join(process.cwd(), "content", "courses", "counting-to-100-k", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => {
  const raw = JSON.parse(readFileSync(join(directory, file), "utf8"));
  Lesson.parse(raw);
  return raw as RawLesson;
});
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));

function step(lessonId: string, stepId: string) {
  const placement = byId[lessonId]!.steps.find((candidate) => candidate.id === stepId);
  expect(placement, `${lessonId}/${stepId}`).toBeDefined();
  return placement!;
}

function remedial(lessonId: string, conceptTag: string) {
  const placement = byId[lessonId]!.remedials?.find((candidate) => candidate.conceptTag === conceptTag)?.concept;
  expect(placement, `${lessonId}/${conceptTag}`).toBeDefined();
  return placement!;
}

const expected = [
  [step("k100-01-03", "c1"), "chart-120", "The blue chart row runs from 41 to 50. Read across from 41, 42, 43 to 50.", "On the blue row, read 41, 42, 43 and continue to 50."],
  [step("k100-02-05", "c1"), "tno-count-down-tens", "Count backward by 10: 65, 55, 45, 35. Each hop subtracts 10.", "Start at 65. Count back by 10: 55, 45, 35."],
  [step("k100-02-05", "c2"), "tno-count-down-tens", "Follow the line backward by 10: 65, 55, 45, 35.", "Say 65, 55, 45, 35: each step is back 10."],
  [remedial("k100-02-05", "kcc-tens-back"), "tno-count-down-tens", "Follow the line backward by 10: 65, 55, 45, 35.", "Say 65, 55, 45, 35: each step is back 10."],
  [step("k100-03-03", "c1"), "chart-120", "The blue row continues 41 through 50. After 46 come 47, 48, and 49.", "After 46 on this row come 47, 48, and 49."],
  [step("k100-03-05", "c1"), "chart-rows", "The third chart row ends 29, 30. The next row begins 31.", "At the end of the third row, 29 is followed by 30. The next row starts at 31."],
  [step("k100-03-06", "c1"), "c120-missing-order", "The pictured row is 42, 43, ?, 45. Count one more after 43 to find 44.", "The covered square is 44: 42, 43, 44, 45."],
  [step("k100-03-06", "c2"), "c120-missing-order", "Read the pictured row: 42, 43, ?, 45. The missing number is 44.", "Say 42, 43, 44, 45. The missing square is 44."],
  [remedial("k100-03-06", "kcc-chart-missing"), "c120-missing-order", "Read the pictured row: 42, 43, ?, 45. The missing number is 44.", "Say 42, 43, 44, 45. The missing square is 44."],
] as const;

describe("S289 counting to 100, Kindergarten — visual source repair", () => {
  it("rebinds all nine source-verified P0 visual placements to the numbers learners see", () => {
    expect(expected).toHaveLength(9);
    for (const [placement, figure, body, narration] of expected) {
      expect(placement.figure, placement.id).toBe(figure);
      expect(placement.body, placement.id).toBe(body);
      expect(placement.narration, placement.id).toBe(narration);
      expect(FIGURE_IDS.has(figure), figure).toBe(true);
      expect(isFigureTextAligned(figure, body), `${placement.id}/${figure}`).toBe(true);
    }
  });

  it("leaves no figure-bearing Kindergarten concept text blocked or numerically mismatched", () => {
    for (const lesson of lessons) {
      for (const placement of [...lesson.steps, ...(lesson.remedials ?? []).map((route) => route.concept)]) {
        if (!placement.figure || !placement.body) continue;
        expect(FIGURE_IDS.has(placement.figure), `${lesson.id}/${placement.id}`).toBe(true);
        expect(isFigureTextAligned(placement.figure, placement.body), `${lesson.id}/${placement.id}`).toBe(true);
      }
    }
  });
});
