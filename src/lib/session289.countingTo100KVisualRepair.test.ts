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

// Body text (not figure or narration) was subsequently retightened by S318-VF2/S318-V2 to meet the
// kindergarten 25-word concept-body reading cap (lint:pedagogy), independently re-verified truth-
// preserving and figure-text-aligned each time. See LESSON_REVIEW_DECISIONS_S244.jsonl for the
// per-lesson signatures (e.g. S318-VF2-k100-01-03, S318-V2-k100-02-05, S318-V2-k100-03-06).
const expected = [
  [step("k100-01-03", "c1"), "chart-120", "The forties row runs 41, 42, 43, across to 50 — ten numbers in one row. Reading left to right names every number in order.", "On the blue row, read 41, 42, 43 and continue to 50."],
  [step("k100-02-05", "c1"), "tno-count-down-tens", "Follow the numbers: 65, 55, 45, 35. Three hops back, each a whole ten lower, carries 65 down to 35.", "Start at 65. Count back by 10: 55, 45, 35."],
  [step("k100-02-05", "c2"), "tno-count-down-tens", "Track the count going backward: 65, 55, 45, 35 — three tens down. Every step down the line takes away a whole ten.", "Say 65, 55, 45, 35: each step is back 10."],
  [remedial("k100-02-05", "kcc-tens-back"), "tno-count-down-tens", "Track the count going backward: 65, 55, 45, 35 — three tens down. Every step down the line takes away a whole ten.", "Say 65, 55, 45, 35: each step is back 10."],
  [step("k100-03-03", "c1"), "chart-120", "This blue row keeps going past 46: 47, 48, 49, straight to 50 — ten numbers, one full row. Reading across continues the count.", "After 46 on this row come 47, 48, and 49."],
  [step("k100-03-05", "c1"), "chart-rows", "The third row ends with 29 then 30. The next row after it starts at 31, one more than the row that just ended.", "At the end of the third row, 29 is followed by 30. The next row starts at 31."],
  [step("k100-03-06", "c1"), "c120-missing-order", "The pictured row shows four numbers: 42, 43, the hidden square, and 45. Between 43 and 45 sits one number: 44.", "The covered square is 44: 42, 43, 44, 45."],
  [step("k100-03-06", "c2"), "c120-missing-order", "Read the pictured row of four numbers in order: 42, 43, hidden square, 45. Counting on from 43 fills the hidden square with 44.", "Say 42, 43, 44, 45. The missing square is 44."],
  [remedial("k100-03-06", "kcc-chart-missing"), "c120-missing-order", "Read the pictured row of four numbers in order: 42, 43, hidden square, 45. Counting on from 43 fills the hidden square with 44.", "Say 42, 43, 44, 45. The missing square is 44."],
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
