import fs from "node:fs";
import { describe, expect, it } from "vitest";

/* cx-02-03/c1 was originally fail-closed (no figure). S319-A-cx-02-02 (laneA-s319-figures.jsonl;
 * S319_FIGURE_CONTRACTS_IMPLEMENTATION.md §7) moved cx-perp-slopes OFF the mismatched
 * cx-02-02/c2 placement and bound it here, its true home — c1 literally derives m₁·m₂ = −1.
 * The row now pins that exact truthful binding instead of the superseded fail-close. */
const closed = [
  ["coordinate-proofs", "cx-02-03", "c1", "cx-perp-slopes"], ["data-line-plots-g2", "g2g-03-01", "c2", undefined],
  ["exponents-polynomials", "ep-01-03", "c1", undefined], ["expressions-equations", "ee-01-02", "c2", undefined],
  ["expressions-equations", "ee-04-03", "c1", undefined], ["function-transformations", "ft-04-03", "c1", undefined],
] as const;

describe("S261 VIS-03 singleton fail-closures", () => {
  it.each(closed)("%s/%s/%s has no misleading figure binding", (course, lessonId, stepId, expectedFigure) => {
    const lesson = JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${lessonId}.json`, "utf8"));
    expect(lesson.steps.find((step: { id: string }) => step.id === stepId)?.figure).toBe(expectedFigure);
  });
});
