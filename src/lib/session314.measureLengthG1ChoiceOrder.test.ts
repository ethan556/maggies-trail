import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "measure-length-g1", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
// Re-pinned: g1m-03-02/k3 converted numeric -> mcq by S327 (reports/closure/S327_ASSESS_A6.md,
// "s327-A6-g1m-03-02", reviewBasisHash 47f1817e8bdf3c2ecb409d03ca496ec824f512814fc12beb80fa8f0585bcc160)
// to fix a question-job mismatch (k3's widget tested the wrong concept; the target misconception is
// a yes/no judgment, not a computed value). This grows the course's main-sequence MCQ count 22 -> 23.
const expectedInventoryHash = "427184b3e0e769b4954a0bc44ba248a193ef037a35c578c687f5f912a4460898";
// Re-pinned: signed S320-IMPL-g1m-03-01 (k1 9-cubes/ribbon -> 11-blocks/scarf) and
// S320-IMPL-g1m-03-03 (k1 12-cubes/stick -> 15-blocks/rope; k3 8-cubes/ribbon ->
// 10-blocks/belt) dedup rewrites, verified S321-V1 (S326-R1 reconcile), plus the S327
// g1m-03-02/k2+k3 rewrite above (same evidence report).
const expectedSemanticHash = "ea18652608e78ad8c5307d30a34e0c2f3b104387b84c4e1f5510e4cb0a833f19";

describe("S314 Grade 1 Measurement choice-order repair", () => {
  it("removes the fixed-answer position while preserving the complete semantic and evaluator contract", () => {
    const mcqs = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [{ lesson, step }] : []));
    expect(mcqs).toHaveLength(23);
    const correctIndices = mcqs.map(({ lesson, step }) => {
      const widget = WidgetSpec.parse(step.widget); if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(widget.options.map((option) => option.id).sort(), `${lesson.id}/${step.id} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lesson.id}/${step.id} correct ID`).toEqual(["o0"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      // The fixed-answer-position defect this suite guards against is "correct answer always at
      // raw array index 0" (o0 authored first); every main-sequence MCQ must place it elsewhere.
      const correctIndex = widget.options.findIndex((option) => option.correct); expect(correctIndex, `${lesson.id}/${step.id}`).not.toBe(0); return correctIndex;
    });
    // Re-pinned alongside the hashes above: g1m-03-02/k3's new o0 lands at raw index 1, which
    // shifts the tail of the course's round-robin position sequence by one slot (unchanged
    // content in g1m-03-02/ch1 and g1m-03-03/k1-k3 keeps its own pre-existing raw option order).
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(9); expect(correctIndices.filter((index) => index === 2)).toHaveLength(7); expect(correctIndices.filter((index) => index === 3)).toHaveLength(7);
    const semanticRows = mcqs.map(({ lesson, step }) => { const widget = WidgetSpec.parse(step.widget); if (widget.type !== "mcq") throw new Error("Expected MCQ"); return { lesson: lesson.id, step: step.id, figure: step.figure ?? null, prompt: widget.prompt, options: widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)) }; });
    expect(hash(JSON.stringify(semanticRows))).toBe(expectedSemanticHash);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(10); const keys = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [`${lesson.id}/${step.id}`] : [])); expect(keys).toHaveLength(23); expect(hash(keys.join("\n"))).toBe(expectedInventoryHash);
  });
});
