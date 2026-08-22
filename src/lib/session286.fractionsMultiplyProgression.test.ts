import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Widget = {
  type: string;
  prompt?: string;
  answer?: number;
  answerWhole?: number;
  answerNum?: number;
  answerDen?: number;
  options?: Array<{ id: string; label: string; correct?: boolean }>;
};
type Step = { id: string; kind: string; body?: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[]; remedial?: { concept?: Step; check?: Step } };

const courseDir = path.join(process.cwd(), "content", "courses", "fractions-multiply", "lessons");
const closureIds = [
  "CHOICE-0065",
  "PROGRESSION-fm-01-01",
  "PROGRESSION-fm-01-03",
  "PROGRESSION-fm-02-02",
  "PROGRESSION-fm-03-02",
  "PROGRESSION-fm-03-03",
  "PROGRESSION-fm-04-01",
  "PROGRESSION-fm-04-02",
  "PROGRESSION-fm-05-01",
  "PROGRESSION-fm-05-02",
] as const;

const targets = [
  ["fm-01-01", "k3", "Find the scale factor.", "To turn 1/2 into a fraction with denominator 8, by what factor must both parts be scaled?", "numeric", 4],
  ["fm-01-01", "ch1", "Complete an equivalent fraction.", "A fraction equal to 1/3 has denominator 15. What numerator completes ?/15?", "numeric", 5],
  ["fm-01-03", "k3", "Correct a denominator mistake.", "A learner writes 5/6 − 1/2 = 4/4. Use sixths to correct the answer. Enter the simplified difference.", "fractionEntry", [0, 1, 3]],
  ["fm-02-02", "i2", "Repair an equal-shares mistake.", "A learner says 3/5 of 10 is 2 because one fifth is 2. How many counters are in three fifths?", "numeric", 6],
  ["fm-02-02", "k3", "Read selected equal groups.", "Twelve counters are shared into 6 equal groups. Five groups are selected. How many counters are selected?", "numeric", 10],
  ["fm-02-02", "ch1", "Transfer to a shaded array.", "An array has 16 counters in 8 equal columns. Three full columns are shaded. How many counters are shaded?", "numeric", 6],
  ["fm-03-02", "k3", "Find the part that remains.", "One half of 2/3 is 2/3 × 1/2. What share of the whole remains? Enter it in lowest terms.", "fractionEntry", [0, 1, 3]],
  ["fm-03-02", "ch1", "Cancel a shared factor first.", "In 5/6 × 2/5, cancel the shared factor before multiplying. What simplest fraction remains?", "fractionEntry", [0, 1, 3]],
  ["fm-03-03", "i2", "Verify a simplification claim.", "A student says 30/60 simplifies to 1/2. What denominator confirms that the claim is correct?", "numeric", 2],
  ["fm-04-01", "k2", "Challenge a false claim.", "A student says 10 × 3/3 = 30. Is the product bigger than 10, smaller than 10, or exactly 10?", "mcq", "a"],
  ["fm-04-01", "k3", "Classify a shrink.", "Without calculating, is 12 × 5/6 bigger than 12, smaller than 12, or exactly 12?", "mcq", "a"],
  ["fm-04-02", "ch1", "Compare two scalers.", "Both products start with 12. Without finding either product, which scaler makes the greater result?", "mcq", "a"],
  ["fm-05-01", "ch1", "Count thirds in a collection.", "Six whole litres are poured into cups that each hold 1/3 litre. How many full cups can be filled?", "numeric", 18],
  ["fm-05-02", "ch1", "Share one piece equally.", "One third of a pan is shared equally among 3 people. What fraction of the whole pan does each person get?", "fractionEntry", [0, 1, 9]],
] as const;

async function readLesson(id: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(courseDir, `${id}.json`), "utf8")) as Lesson;
}

function step(lesson: Lesson, id: string): Step {
  const value = lesson.steps.find((candidate) => candidate.id === id);
  if (!value) throw new Error(`${lesson.id}/${id} missing`);
  return value;
}

describe("S286 Fractions Multiply progression follow-on", () => {
  it("binds every exact P1 source closure to a distinct learner job without changing evaluator contracts", async () => {
    expect(closureIds).toHaveLength(10);
    const lessons = new Map<string, Lesson>();
    for (const [lessonId] of targets) if (!lessons.has(lessonId)) lessons.set(lessonId, await readLesson(lessonId));

    for (const [lessonId, stepId, body, prompt, widgetType, expectedAnswer] of targets) {
      const current = step(lessons.get(lessonId)!, stepId);
      expect(current.body).toBe(body);
      expect(current.widget?.prompt).toBe(prompt);
      expect(current.widget?.type).toBe(widgetType);
      if (Array.isArray(expectedAnswer)) {
        expect([current.widget?.answerWhole, current.widget?.answerNum, current.widget?.answerDen]).toEqual(expectedAnswer);
      } else if (widgetType === "mcq") {
        expect(current.widget?.options?.filter((option) => option.correct).map((option) => option.id)).toEqual([expectedAnswer]);
      } else {
        expect(current.widget?.answer).toBe(expectedAnswer);
      }
    }

    const jobs = targets.map(([, , body, prompt]) => `${body}\n${prompt}`);
    expect(new Set(jobs).size).toBe(targets.length);
  });

  it("uses a balanced, answer-neutral prediction surface for CHOICE-0065", async () => {
    const current = step(await readLesson("fm-03-01"), "k3");
    const options = current.widget?.options ?? [];
    expect(options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
    expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
    const lengths = options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(1);
    expect(options.every((option) => !/because|right|correct/i.test(option.label))).toBe(true);
  });

  it("preserves the full 13-lesson course and every remaining figure binding is registered and text-aligned", async () => {
    const files = (await readdir(courseDir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(13);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(courseDir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      const allSteps = [...current.steps, current.remedial?.concept, current.remedial?.check].filter(Boolean) as Step[];
      expect(allSteps.some((candidate) => candidate.widget)).toBe(true);
      for (const candidate of allSteps) {
        if (!candidate.figure) continue;
        expect(FIGURES[candidate.figure], `${current.id}/${candidate.id} must retain a registered figure`).toBeDefined();
        expect(isFigureTextAligned(candidate.figure, candidate.body ?? ""), `${current.id}/${candidate.id} figure text`).toBe(true);
      }
    }
  });
});
