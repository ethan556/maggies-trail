import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; label: string; correct?: boolean; feedback?: string };
type Step = { id: string; kind: string; body?: string; figure?: string; widget?: { type?: string; options?: Option[] } };
type Lesson = { id: string; steps: Step[]; remedial?: { concept?: Step; check?: Step } };

const courseDir = path.join(process.cwd(), "content", "courses", "shapes-space", "lessons");
const closures = ["CHOICE-0100", "CHOICE-0101", "CHOICE-0102", "CHOICE-0103", "CHOICE-0104", "CHOICE-0105", "CHOICE-0106"] as const;
const expected = [
  ["geo-01-01", "ch1", ["A quadrilateral with four sides", "A triangle with three sides", "A circle with no straight sides", "A mystery with unknown sides"]],
  ["geo-01-01", "k2", ["A square, just turned", "A diamond, a new shape", "A triangle, just turned", "A shape set by the corner"]],
  ["geo-01-03", "k2", ["No — unequal sides can make a rectangle", "Yes — four right angles make a square", "Yes — every rectangle has equal sides", "It depends — color decides its shape"]],
  ["geo-02-02", "k3", ["They show the rule that fails", "They show every rule has failed", "They show definitions have no rules", "They show color decides the rules"]],
  ["geo-03-01", "k2", ["Both squares show equal fourths", "Only Square A shows equal fourths", "Only Square B shows equal fourths", "Neither square shows equal fourths"]],
  ["geo-03-01", "k3", ["The fourths are larger pieces", "The eighths are larger pieces", "The pieces are equal in size", "The pieces cannot be compared"]],
  ["geo-03-02", "k3", ["4/4, all parts shaded", "0/4, no parts shaded", "1/4, one part shaded", "4/1, four parts total"]],
] as const;

async function lesson(id: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(courseDir, `${id}.json`), "utf8")) as Lesson;
}

function findStep(current: Lesson, stepId: string): Step {
  const step = current.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`${current.id}/${stepId} missing`);
  return step;
}

describe("S287 Shapes & Space choice-surface parity", () => {
  it("closes all seven exact source causes with parallel, answer-neutral MCQ labels", async () => {
    expect(closures).toHaveLength(7);
    const lessons = new Map<string, Lesson>();
    for (const [lessonId] of expected) if (!lessons.has(lessonId)) lessons.set(lessonId, await lesson(lessonId));
    for (const [lessonId, stepId, labels] of expected) {
      const step = findStep(lessons.get(lessonId)!, stepId);
      expect(["check", "challenge"]).toContain(step.kind);
      expect(step.widget?.type).toBe("mcq");
      const options = step.widget?.options ?? [];
      expect(options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(options.map((option) => option.label)).toEqual(labels);
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
      expect(options.every((option) => option.feedback && option.feedback.trim().length > 0)).toBe(true);
      const lengths = options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(6);
      expect(options.every((option) => !(/\bbecause\b|\bcorrect\b/i.test(option.label) || /^right(?:\s|—|!|,|\.)/i.test(option.label)))).toBe(true);
    }
  });

  it("retains all seven lesson contracts and only registered, text-aligned remaining figures", async () => {
    const files = (await readdir(courseDir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(7);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(courseDir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      const allSteps = [...current.steps, current.remedial?.concept, current.remedial?.check].filter(Boolean) as Step[];
      expect(allSteps.some((step) => step.widget)).toBe(true);
      for (const step of allSteps) {
        if (!step.figure) continue;
        expect(FIGURES[step.figure], `${current.id}/${step.id} must retain a registered figure`).toBeDefined();
        expect(isFigureTextAligned(step.figure, step.body ?? ""), `${current.id}/${step.id} figure text`).toBe(true);
      }
    }
  });
});
