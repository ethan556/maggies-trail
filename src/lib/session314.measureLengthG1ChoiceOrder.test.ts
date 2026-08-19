import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "measure-length-g1", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const expectedInventoryHash = "3aadd34a6d836b0b5296f5c319364da196a62fd0347fa0f8433008a85b662bbd";
const expectedSemanticHash = "c21a1988503088f1a39473b2934e6d2c97be91637e1d5a5b76f4cd136e189e00";

describe("S314 Grade 1 Measurement choice-order repair", () => {
  it("removes the fixed-answer position while preserving the complete semantic and evaluator contract", () => {
    const mcqs = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [{ lesson, step }] : []));
    expect(mcqs).toHaveLength(22);
    const correctIndices = mcqs.map(({ lesson, step }, index) => {
      const widget = WidgetSpec.parse(step.widget); if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(widget.options.map((option) => option.id).sort(), `${lesson.id}/${step.id} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lesson.id}/${step.id} correct ID`).toEqual(["o0"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct); expect(correctIndex, `${lesson.id}/${step.id}`).toBe(index % 3 + 1); return correctIndex;
    });
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(8); expect(correctIndices.filter((index) => index === 2)).toHaveLength(7); expect(correctIndices.filter((index) => index === 3)).toHaveLength(7);
    const semanticRows = mcqs.map(({ lesson, step }) => { const widget = WidgetSpec.parse(step.widget); if (widget.type !== "mcq") throw new Error("Expected MCQ"); return { lesson: lesson.id, step: step.id, figure: step.figure ?? null, prompt: widget.prompt, options: widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)) }; });
    expect(hash(JSON.stringify(semanticRows))).toBe(expectedSemanticHash);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(10); const keys = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [`${lesson.id}/${step.id}`] : [])); expect(keys).toHaveLength(22); expect(hash(keys.join("\n"))).toBe(expectedInventoryHash);
  });
});
