import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Step = { id: string; kind: string; figure?: string; widget?: { prompt?: string } };
type Lesson = { id: string; steps: Step[] };

const lessonDir = join(__dirname, "../../content/courses/fraction-division-g5/lessons");
const lessons = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort()
  .map((file) => JSON.parse(readFileSync(join(lessonDir, file), "utf8")) as Lesson);

describe("S265 fraction division visual and transfer repair", () => {
  it("withholds every old count-on-hops concept binding rather than showing unrelated arithmetic", () => {
    expect(lessons).toHaveLength(12);
    const concepts = lessons.flatMap((lesson) => lesson.steps.filter((step) => step.kind === "concept"));
    expect(concepts).toHaveLength(24);
    expect(concepts.every((step) => step.figure === undefined)).toBe(true);
  });

  it("uses the three repaired jobs rather than their former normalized templates", () => {
    const step = (lessonId: string, stepId: string) => lessons.find((lesson) => lesson.id === lessonId)!.steps.find((entry) => entry.id === stepId)!;
    expect(step("g5f-01-01", "ch1").widget!.prompt).toMatch(/^A group shares 20 beads equally among 5 people/);
    expect(step("g5f-01-02", "i2").widget!.prompt).toMatch(/^7 granola bars are shared equally among 10 hikers/);
    expect(step("g5f-03-01", "k3").widget!.prompt).toMatch(/^Compute 3 × 1\/2\. How many half-pieces/);
  });
});
