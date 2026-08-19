import fs from "node:fs";
import { describe, expect, it } from "vitest";

const closed = [
  ["coordinate-proofs", "cx-02-03", "c1"], ["data-line-plots-g2", "g2g-03-01", "c2"],
  ["exponents-polynomials", "ep-01-03", "c1"], ["expressions-equations", "ee-01-02", "c2"],
  ["expressions-equations", "ee-04-03", "c1"], ["function-transformations", "ft-04-03", "c1"],
] as const;

describe("S261 VIS-03 singleton fail-closures", () => {
  it.each(closed)("%s/%s/%s has no misleading figure binding", (course, lessonId, stepId) => {
    const lesson = JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${lessonId}.json`, "utf8"));
    expect(lesson.steps.find((step: { id: string }) => step.id === stepId)?.figure).toBeUndefined();
  });
});
