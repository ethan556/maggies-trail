import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { evaluate } from "./evaluate";
import { WidgetSpec, evalOrderReachable, widgetIntegrityErrors, type TWidget } from "./schema";

const lesson = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const widget = (path: string, stepId: string): TWidget => {
  const spec = lesson(path).steps.find((step: { id: string }) => step.id === stepId)?.widget;
  return WidgetSpec.parse(spec);
};

const MMT02 = "content/courses/measure-money-time/lessons/mmt-01-02.json";
const MMT03 = "content/courses/measure-money-time/lessons/mmt-01-03.json";

describe("Session 128 proof-carrying reuse", () => {
  it("all four converted ruler specs are valid, physically consistent, and exactly graded", () => {
    for (const [path, stepId] of [[MMT02, "i1"], [MMT02, "i2"], [MMT02, "i3"], [MMT03, "i2"]] as const) {
      const spec = widget(path, stepId);
      expect(spec.type).toBe("unitRuler");
      if (spec.type !== "unitRuler") throw new Error("narrowing failed");
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(spec.objectEnd - spec.objectStart).toBe(spec.requiredPlacements * spec.targetUnitSize);
      expect(evaluate(spec, { zeroAligned: true, unitSize: 1, placements: spec.requiredPlacements, spacing: "exact" }).correct).toBe(true);
    }
  });

  it("preserves each authored ruler misconception as a distinct reachable placement", () => {
    for (const [path, stepId] of [[MMT02, "i1"], [MMT02, "i2"], [MMT02, "i3"], [MMT03, "i2"]] as const) {
      const spec = widget(path, stepId);
      if (spec.type !== "unitRuler") throw new Error("expected unitRuler");
      for (const wrong of spec.commonPlacements) {
        const result = evaluate(spec, { zeroAligned: true, unitSize: 1, placements: wrong.placements, spacing: "exact" });
        expect(result).toEqual({ correct: false, feedback: wrong.feedback });
      }
    }
  });

  it("rejects evalOrder reuse for the grouping lesson because the authored errors are unreachable", () => {
    const reachable = evalOrderReachable(["(", "2", "+", "3", ")", "×", "4"]);
    expect([...reachable]).toEqual([20]);
    expect(reachable.has(14)).toBe(false);
    expect(reachable.has(24)).toBe(false);
  });

  it("rejects estimateSlider reuse because it widens a discrete answer into an interval", () => {
    const spec = WidgetSpec.parse({
      type: "estimateSlider", prompt: "best estimate", min: 1, max: 20, start: 1, target: 8,
      acceptFactor: 1.1, ticks: [1, 8, 20], lowFeedback: "low", highFeedback: "high", successFeedback: "right"
    });
    expect(evaluate(spec, 8).correct).toBe(true);
    expect(evaluate(spec, 8.5).correct).toBe(true); // not one of the authored choices
  });

  it("rejects covariationScrubber reuse when moving the given input alone would solve the task", () => {
    const spec = WidgetSpec.parse({
      type: "covariationScrubber", prompt: "12 dollars each for 6 hours", a: 12, b: 0,
      inputMin: 0, inputMax: 8, inputStart: 1, targetInput: 6, inputLabel: "hours", outputLabel: "dollars",
      contextTemplate: "{x} hours earns ${y}.", successFeedback: "72", lowFeedback: "low", highFeedback: "high"
    });
    expect(evaluate(spec, 6)).toEqual({ correct: true, feedback: "72" });
  });
});
