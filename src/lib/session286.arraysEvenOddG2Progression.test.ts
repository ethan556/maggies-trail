import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

const directory = join(process.cwd(), "content", "courses", "arrays-even-odd-g2", "lessons");
const files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
const lessons = files.map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const expectedSecondJobs = {
  "g2a-01-01": { type: "oddEvenPairs", prompt: "Pair up 15 counters. Odd or even?", answer: "odd" },
  "g2a-01-02": { type: "oddEvenPairs", prompt: "18 ends in 8. Is it odd or even?", answer: "even" },
  "g2a-01-03": { type: "oddEvenPairs", prompt: "Pair up 12 counters. Odd or even?", answer: "even" },
  "g2a-01-04": { type: "oddEvenPairs", prompt: "Pair up 13 counters. Odd or even?", answer: "odd" },
  "g2a-02-01": { type: "tapDiagram", prompt: "Tap the counter in row 3, column 1.", correct: ["r3c1"] },
  "g2a-02-02": { type: "tapDiagram", prompt: "Tap every counter in the RIGHT column.", correct: ["r1c4", "r2c4", "r3c4"] },
  "g2a-02-03": { type: "tapDiagram", prompt: "Tap every counter in the BOTTOM row.", correct: ["r3c1", "r3c2", "r3c3", "r3c4"] },
  "g2a-03-01": { type: "tapDiagram", prompt: "This array shows 4 + 4 + 4. Tap the row that is the FIRST addend.", correct: ["r1c1", "r1c2", "r1c3", "r1c4"] },
  "g2a-03-02": { type: "tapDiagram", prompt: "This 2-by-6 array holds 12. Tap every counter in the TOP row.", correct: ["r1c1", "r1c2", "r1c3", "r1c4", "r1c5", "r1c6"] },
  "g2a-03-03": { type: "tapDiagram", prompt: "A seed tray: 3 rows of 5. Tap every counter in the BOTTOM row.", correct: ["r3c1", "r3c2", "r3c3", "r3c4", "r3c5"] },
} as const;

function interaction(lesson: (typeof lessons)[number], id: "i1" | "i2") {
  const step = lesson.steps.find((candidate) => candidate.id === id);
  expect(step, `${lesson.id}/${id}`).toBeDefined();
  return WidgetSpec.parse(step!.widget);
}

describe("S286 arrays-even-odd-g2 — source-sealed second-try progression", () => {
  it("covers the source-verified ten-lesson P0 packet", () => {
    expect(files).toHaveLength(10);
    expect(Object.keys(expectedSecondJobs).sort()).toEqual(lessons.map((lesson) => lesson.id).sort());
  });

  it("replaces every copied i2 learner job with the planned visual retrieval", () => {
    for (const lesson of lessons) {
      const first = interaction(lesson, "i1");
      const second = interaction(lesson, "i2");
      const expected = expectedSecondJobs[lesson.id as keyof typeof expectedSecondJobs];
      expect(second.type, lesson.id).toBe(expected.type);
      expect(second.prompt, lesson.id).toBe(expected.prompt);
      expect(JSON.stringify(second), `${lesson.id}: copied i1/i2 payload`).not.toBe(JSON.stringify(first));
      expect(widgetIntegrityErrors(second), `${lesson.id}/i2`).toEqual([]);

      if (second.type === "oddEvenPairs") {
        const expectedPairs = expected as { type: "oddEvenPairs"; prompt: string; answer: "odd" | "even" };
        expect(second.answer).toBe(expectedPairs.answer);
        const ones = second.mode === "onesDigit" ? second.n % 10 : second.n;
        expect(evaluate(second, { paired: Math.floor(ones / 2), choice: second.answer }).correct, `${lesson.id}/i2`).toBe(true);
      } else if (second.type === "tapDiagram") {
        const expectedTap = expected as { type: "tapDiagram"; prompt: string; correct: readonly string[] };
        const correct = second.hotspots.filter((spot) => spot.correct).map((spot) => spot.id);
        expect(correct).toEqual(expectedTap.correct);
        expect(evaluate(second, correct).correct, `${lesson.id}/i2`).toBe(true);
        const distractorFeedback = second.hotspots.filter((spot) => !spot.correct).map((spot) => spot.feedback);
        expect(new Set(distractorFeedback).size, `${lesson.id}/i2 distinct spatial feedback`).toBe(distractorFeedback.length);
      }
    }
  });
});
