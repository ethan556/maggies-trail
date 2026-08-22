import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "number-writing-k", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const expectedInventoryHash = "46d758095792f4248990bd83976075b8664be3ed24504ac9b0e830a2b3bf39f7";
// Re-pinned: signed S322-kcw-03-04 changed k2 from the 6-dots duplicate of
// kcw-01-02/k2 to a truthful 16-dots pattern (S326-R1 reconcile).
const expectedSemanticHash = "cac7918d46533a6acbf61eb2cce9e5ce98d1f1c845fa44544fa68450a5a4708f";

describe("S313 Kindergarten Number Writing choice-order repair", () => {
  it("removes the fixed-answer position while preserving the complete semantic and evaluator contract", () => {
    const mcqs = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => {
      if (step.widget?.type !== "mcq") return [];
      return [{ lesson, step }];
    }));
    expect(mcqs).toHaveLength(35);
    const correctIndices = mcqs.map(({ lesson, step }, index) => {
      const widget = WidgetSpec.parse(step.widget);
      expect(widget.type, `${lesson.id}/${step.id}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(widget.options.map((option) => option.id).sort(), `${lesson.id}/${step.id} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lesson.id}/${step.id} correct ID`).toEqual(["o0"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lesson.id}/${step.id}`).toBe(index % 3 + 1);
      return correctIndex;
    });
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(12);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(12);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(11);
    const semanticRows = mcqs.map(({ lesson, step }) => {
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      return {
        lesson: lesson.id,
        step: step.id,
        figure: step.figure ?? null,
        prompt: widget.prompt,
        options: widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)),
      };
    });
    expect(hash(JSON.stringify(semanticRows))).toBe(expectedSemanticHash);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(14);
    const keys = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [`${lesson.id}/${step.id}`] : []));
    expect(keys).toHaveLength(35);
    expect(hash(keys.join("\n"))).toBe(expectedInventoryHash);
  });
});
