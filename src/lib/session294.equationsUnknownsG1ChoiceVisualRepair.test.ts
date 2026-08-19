import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; figure?: string; body?: string; narration?: string; widget?: unknown };
type RawLesson = { id: string; steps: RawStep[] };
const directory = join(process.cwd(), "content", "courses", "equations-unknowns-g1", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => JSON.parse(readFileSync(join(directory, file), "utf8")) as RawLesson);
const lesson = (id: string) => lessons.find((candidate) => candidate.id === id)!;
const step = (lessonId: string, stepId: string) => lesson(lessonId).steps.find((candidate) => candidate.id === stepId)!;

describe("S294 equations-unknowns-g1 visual and choice repair", () => {
  it("binds the true-equation explanation to the exact balance equality", () => {
    const concept = step("g1e-03-03", "c2");
    expect(concept).toMatchObject({
      figure: "add-balance-scale",
      body: "An expression has no equal sign. An equation has one. The balance shows 6 + 4 = 10, so both sides match.",
      narration: "An expression has no equal sign. An equation has one. The balance shows 6 + 4 = 10, so both sides match.",
    });
    expect(FIGURE_IDS.has(concept.figure ?? "")).toBe(true);
    expect(isFigureTextAligned(concept.figure ?? "", concept.body ?? "")).toBe(true);
  });

  it("rotates all 19 stable-ID MCQs without changing their correct option or evaluator truth", () => {
    const choices = lessons.flatMap((current) => current.steps.filter((entry) => (entry.widget as { type?: string } | undefined)?.type === "mcq").map((entry) => [current.id, entry] as const));
    expect(choices).toHaveLength(19);
    const correctIndices = choices.map(([lessonId, entry], index) => {
      const widget = WidgetSpec.parse(entry.widget);
      expect(widget.type, `${lessonId}/${entry.id}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${entry.id}`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${entry.id}`).toEqual(["o0"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${entry.id}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${entry.id}`).toBe(index % 3 + 1);
      return correctIndex;
    });
    expect(new Set(correctIndices)).toEqual(new Set([1, 2, 3]));
  });

  it("uses direct Grade 1 missing-number and check language without changing the answer path", () => {
    expect((step("g1e-02-01", "i1").widget as { prompt: string }).prompt).toContain("Find the missing number in 9 + 3 = __.");
    expect((step("g1e-02-02", "i1").widget as { prompt: string }).prompt).toContain("Find the missing number in 5 + __ = 12.");
    expect((step("g1e-02-03", "i1").widget as { prompt: string }).prompt).toContain("Find the missing number in __ + 4 = 11.");
    const check = WidgetSpec.parse(step("g1e-03-02", "ch1").widget);
    expect(check.type).toBe("mcq");
    if (check.type === "mcq") expect(check.options.find((option) => option.id === "o0")?.label).toBe("Put in 8 and check: 8 + 5 = 13");
    for (const raw of lessons) Lesson.parse(raw);
  });
});
