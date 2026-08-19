import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Option = { id: string; label: string; correct?: boolean; feedback?: string };
type Step = { id: string; widget?: { type?: string; options?: Option[] } };
type Lesson = { id: string; courseId: string; steps: Step[] };
const dir = path.join(process.cwd(), "content", "courses", "multiplication-division", "lessons");
const repairs = [
  ["mult-02-04", "k3", ["2: one multiplication and one division.", "4: the two multiplication forms are different.", "1: all facts collapse into one statement.", "3: only the division fact repeats."]],
  ["mult-04-04", "k3", ["Find van riders, then subtract absences.", "Find the total van riders by multiplying.", "Find total friends by adding once.", "Find riders per van by dividing once."]],
  ["mult-04-05", "k1", ["32 cannot be one share from a total of 28.", "The quotient is 7 riders per bus.", "A bus holds about 50 riders.", "You must recompute to reject 32."]],
  ["mult-05-01", "k2", ["Even: both addends are even.", "Odd: larger sums are usually odd.", "Even: every sum is even.", "Unknown until you add them."]],
  ["mult-05-02", "k3", ["Ten is two groups of five.", "Both rows always end in zero.", "Small rows happen to overlap.", "Larger rows always contain smaller rows."]],
  ["mult-05-03", "k1", ["An even factor makes the product even.", "A factor ending in 5 makes it even.", "The exact product happens to be even.", "You cannot know before multiplying."]],
  ["mult-05-04", "k1", ["Each jump moves one full row.", "Every multiple ends in zero.", "Ten is the largest one-digit jump.", "The multiples make a diagonal."]],
] as const;

async function lesson(id: string) { return JSON.parse(await readFile(path.join(dir, `${id}.json`), "utf8")) as Lesson; }
function step(current: Lesson, id: string) { const found = current.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }

describe("S296 Multiplication & Division choice-parity repair", () => {
  it("seals all seven labels while preserving evaluator, option-order, correctness, and feedback contracts", async () => {
    for (const [lessonId, stepId, labels] of repairs) {
      const current = step(await lesson(lessonId), stepId);
      const options = current.widget?.options ?? [];
      expect(current.widget?.type).toBe("mcq");
      expect(options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
      expect(options.map((option) => option.label)).toEqual(labels);
      expect(options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      expect(Math.max(...options.map((option) => option.label.length)) - Math.min(...options.map((option) => option.label.length))).toBeLessThanOrEqual(15);
    }
  });

  it("retains all twenty-four course identities", async () => {
    const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(24);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(dir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      expect(current.courseId).toBe("multiplication-division");
    }
  });
});
