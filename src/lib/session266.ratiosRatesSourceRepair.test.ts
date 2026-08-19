import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { WidgetSpec, type TWidget } from "./schema";

type Step = { id: string; figure?: string; widget?: unknown };
type Lesson = { id: string; steps: Step[] };
const lessonDir = join(__dirname, "../../content/courses/ratios-rates/lessons");
const lessons = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort()
  .map((file) => JSON.parse(readFileSync(join(lessonDir, file), "utf8")) as Lesson);
const withheld = ["rr-01-02/c2", "rr-03-03/c1", "rr-03-03/c2", "rr-04-02/c1", "rr-04-02/c2", "rr-04-03/c2"];
function stepAt(path: string) { const [lessonId, stepId] = path.split("/"); return lessons.find((lesson) => lesson.id === lessonId)!.steps.find((step) => step.id === stepId)!; }

describe("S266 ratios and rates source repair", () => {
  it("withholds all six fixed-number visual mismatches", () => {
    expect(lessons).toHaveLength(16);
    expect(withheld.map(stepAt).every((step) => step.figure === undefined)).toBe(true);
  });

  it("keeps the repaired answer surface balanced and mathematically executable", () => {
    const choice = WidgetSpec.parse(stepAt("rr-02-02/k2").widget) as Extract<TWidget, { type: "mcq" }>;
    const lengths = choice.options.map((option) => option.label.length);
    expect(Math.max(...lengths) / Math.min(...lengths)).toBeLessThanOrEqual(1.1);
    expect(evaluate(choice, "a").correct).toBe(true);
    const percent = WidgetSpec.parse(stepAt("rr-04-02/k2").widget) as Extract<TWidget, { type: "numeric" }>;
    expect(percent.prompt).toContain("jacket costs $90");
    expect(evaluate(percent, 27).correct).toBe(true);
  });
});
