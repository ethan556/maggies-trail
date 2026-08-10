import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { ConditionalTableLabSpec, conditionalTableReadTruth, widgetIntegrityErrors } from "./schema";

const base = {
  type: "conditionalTableLab" as const,
  mode: "read" as const,
  prompt: "Read the table.",
  rowLabels: ["child", "adult"] as [string, string],
  colLabels: ["dog", "cat"] as [string, string],
  counts: [20, 10, 5, 15] as [number, number, number, number],
  targetCondition: "row0" as const,
  targetCell: "r0c0" as const,
  startCondition: "col0" as const,
  requiredSwitches: 1,
  readMetric: "relativeRow" as const,
  answerChoices: [
    { id: "a", label: "66.67%", value: 66.6667, feedback: "Correct denominator." },
    { id: "b", label: "40%", value: 40, feedback: "That uses the grand total instead of the child row." },
    { id: "c", label: "80%", value: 80, feedback: "That uses the dog column instead of the child row." }
  ],
  successFeedback: "The cell is 20 out of the 30 children.",
  explorationFeedback: "Choose a claim.",
  conditionFeedback: "Use the named denominator.",
  cellFeedback: "Use the intersection cell."
};

describe("Session 142 conditionalTableLab read mode", () => {
  it("derives every count and denominator from one table truth", () => {
    expect(conditionalTableReadTruth(base.counts, "cell", "r1c1").value).toBe(15);
    expect(conditionalTableReadTruth(base.counts, "rowTotal", "r1c0").value).toBe(20);
    expect(conditionalTableReadTruth(base.counts, "colTotal", "r0c0").value).toBe(25);
    expect(conditionalTableReadTruth(base.counts, "grandTotal", "r0c0").value).toBe(50);
    expect(conditionalTableReadTruth(base.counts, "relativeRow", "r0c0")).toEqual({ numerator: 20, denominator: 30, value: 66.6667 });
  });
  it("grades exact claims and preserves named wrong-path feedback", () => {
    const spec = ConditionalTableLabSpec.parse(base);
    expect(evaluate(spec, "a").correct).toBe(true);
    expect(evaluate(spec, "b")).toEqual({ correct: false, feedback: base.answerChoices[1].feedback });
  });
  it("rejects duplicate values and ambiguous independently-derived answers", () => {
    const parsed = ConditionalTableLabSpec.parse({ ...base, answerChoices: [...base.answerChoices, { id: "d", label: "also correct", value: 66.6667, feedback: "Duplicate." }] });
    expect(widgetIntegrityErrors(parsed).length).toBeGreaterThan(0);
  });
  it("keeps legacy conditional mode valid", () => {
    const legacy = ConditionalTableLabSpec.parse({ ...base, mode: "conditional", readMetric: undefined, answerChoices: [], targetCondition: "row0", targetCell: "r0c0" });
    expect(widgetIntegrityErrors(legacy)).toEqual([]);
  });
});
