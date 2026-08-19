import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; label: string; correct?: boolean; feedback?: string };
type Step = { id: string; kind: string; body?: string; figure?: string; widget?: { type?: string; options?: Option[] } };
type Lesson = { id: string; courseId: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };

const courseDir = path.join(process.cwd(), "content", "courses", "fractions", "lessons");
const closures = ["CHOICE-0073", "CHOICE-0074", "CHOICE-0075", "CHOICE-0076", "CHOICE-0077", "CHOICE-0078", "CHOICE-0079", "CHOICE-0080", "CHOICE-0081"] as const;
const expected = [
  ["fr-01-01", "k3", ["Equal pieces give each piece name one dependable size.", "Equal pieces make every fair cut look evenly tidy.", "Equal pieces let close-enough cuts still count.", "Equal pieces make uneven cuts impossible to create."]],
  ["fr-02-03", "k3", ["At the halfway point on the line", "At the first quarter mark on the line", "At the number 2 mark on the line", "Near one whole on the line"]],
  ["fr-03-03", "k3", ["Five fifth-pieces rebuild the whole together.", "The two fives subtract away and disappear.", "Adding the two fives makes one whole.", "Five fifths should land at the number five."]],
  ["fr-04-01", "k3", ["Equal bottoms make equal-sized pieces, so count how many.", "Equal bottoms make top numbers settle every comparison.", "Equal bottoms make bigger numbers settle every comparison.", "Equal bottoms make pictures settle every comparison."]],
  ["fr-04-02", "k2", ["Ten cuts make smaller pieces, so 3/10 is less than 3/4.", "Ten cuts make larger pieces, so 3/10 is greater than 3/4.", "Add the top and bottom numbers to compare 3/10 and 3/4.", "Tenths are not real fractions, so they cannot be compared."]],
  ["fr-04-04", "ch1", ["Only Kim and Raj can compare; 2/3 is greater than 2/5.", "All three can compare; 3/4 is the greatest share.", "None can compare; the fractions have different parts.", "Only Nia wins; 3/4 is greater than every other share."]],
  ["fr-04-04", "k1", ["No — a fourth's amount depends on the whole it names.", "Yes — one fourth is the same amount, whatever whole is named.", "No — her sticky-note fourth must be the bigger amount.", "No — fractions cannot have size after a whole is named."]],
  ["fr-04-04", "k2", ["The pizzas differ in size, so fractions alone cannot compare the food.", "Leo ate more; one half always beats one fourth of any pizza.", "Ana ate more; a family fourth always beats a mini half of pizza.", "Pizza fractions cannot describe how much food anyone ate from a pizza."]],
  ["fr-04-04", "k3", ["They name parts of the same-sized whole.", "Their top numbers name the same amount.", "Their bottom numbers name the same amount.", "Both fractions name less than one whole."]],
] as const;

async function lesson(id: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(courseDir, `${id}.json`), "utf8")) as Lesson;
}

function findStep(current: Lesson, id: string): Step {
  const found = current.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${current.id}/${id} missing`);
  return found;
}

describe("S290 Fractions choice-surface parity", () => {
  it("closes nine exact choice causes with concise, parallel, evaluator-safe labels", async () => {
    expect(closures).toHaveLength(9);
    const loaded = new Map<string, Lesson>();
    for (const [lessonId] of expected) if (!loaded.has(lessonId)) loaded.set(lessonId, await lesson(lessonId));
    for (const [lessonId, stepId, labels] of expected) {
      const current = findStep(loaded.get(lessonId)!, stepId);
      expect(["check", "challenge"], `${lessonId}/${stepId}`).toContain(current.kind);
      expect(current.widget?.type, `${lessonId}/${stepId}`).toBe("mcq");
      const options = current.widget?.options ?? [];
      expect(options.map((option) => option.id), `${lessonId}/${stepId}`).toEqual(["a", "b", "c", "d"]);
      expect(options.map((option) => option.label), `${lessonId}/${stepId}`).toEqual(labels);
      expect(options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId}`).toEqual(["a"]);
      expect(options.every((option) => option.feedback?.trim()), `${lessonId}/${stepId}`).toBe(true);
      const lengths = options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12);
      expect(options.every((option) => !(/\b(correct|because)\b/i.test(option.label) || /^right(?:\s|—|!|,|\.)/i.test(option.label))), `${lessonId}/${stepId}`).toBe(true);
    }
  });

  it("retains all 15 course identities and registered, text-aligned figures", async () => {
    const files = (await readdir(courseDir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(15);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(courseDir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      expect(current.courseId).toBe("fractions");
      const allSteps = [...current.steps, ...(current.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])].filter(Boolean) as Step[];
      expect(allSteps.some((candidate) => candidate.widget)).toBe(true);
      for (const candidate of allSteps) {
        if (!candidate.figure) continue;
        expect(FIGURES[candidate.figure], `${current.id}/${candidate.id} must retain a registered figure`).toBeDefined();
        expect(isFigureTextAligned(candidate.figure, candidate.body ?? ""), `${current.id}/${candidate.id} figure text`).toBe(true);
      }
    }
  });
});
