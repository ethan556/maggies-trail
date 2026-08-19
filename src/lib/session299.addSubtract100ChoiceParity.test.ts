import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "add-subtract-100", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

describe("S299 add-subtract-100 choice parity repair", () => {
  it("distributes every stable-ID correct choice away from the first position", () => {
    const choices = lessons.flatMap((lesson) => lesson.steps
      .filter((step) => step.widget?.type === "mcq")
      .map((step) => [lesson.id, step] as const));

    expect(choices).toHaveLength(16);
    const correctIndices = choices.map(([lessonId, step], index) => {
      const widget = WidgetSpec.parse(step.widget);
      expect(widget.type, `${lessonId}/${step.id}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${step.id}`).toEqual(["a", "b", "c"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${step.id}`).toEqual(["a"]);
      for (const option of widget.options)
        expect(evaluate(widget, option.id).correct, `${lessonId}/${step.id}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${step.id}`).toBe(index % 2 + 1);
      return correctIndex;
    });

    expect(new Set(correctIndices)).toEqual(new Set([1, 2]));
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(8);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(8);
  });

  it("keeps all sixteen Add and Subtract Within 100 lessons schema-valid", () => {
    expect(lessons).toHaveLength(16);
    expect(lessons.every((lesson) => lesson.steps.some((step) => step.widget?.type === "mcq"))).toBe(true);
  });
});
