import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WidgetSpec,
  compositeAreaTarget,
  evalTokens,
  placeValueTransformTruth,
  proportionalReasoningTruth,
  quotientReasoningTruth,
  sequenceReasoningTruth,
} from "./schema";

type Step = {
  id: string;
  kind: string;
  body: string;
  widget?: Record<string, unknown> & { type?: string };
  predict?: {
    prompt: string;
    options: Array<{ id: string; label: string }>;
    outcomeId: string;
    reveal: string;
  };
  variant?: unknown;
};

type Lesson = { id: string; steps: Step[] };

const root = process.cwd();

function lesson(course: string, id: string): Lesson {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", id + ".json"), "utf8"),
  ) as Lesson;
}

const grade45PredictionHosts = [
  ["decimal-operations", "dop-01-02", "evalOrder"],
  ["decimals-place-value", "dpv-02-01", "placeValueTransformLab"],
  ["decimals-place-value", "dpv-02-02", "hundredthsGrid"],
  ["decimals-place-value", "dpv-02-03", "placeValueTransformLab"],
  ["fractions-add", "fa-01-03", "fractionBar"],
  ["fractions-add", "fa-02-01", "fractionBar"],
  ["fractions-add", "fa-03-02", "fractionBar"],
  ["fractions-add", "fa-03-03", "fractionBar"],
  ["fractions-add", "fa-05-02", "fractionBar"],
  ["lines-angles", "la-01-01", "lineRelationLab"],
  ["lines-angles", "la-01-03", "triangleAngleLab"],
  ["lines-angles", "la-02-03", "lineRelationLab"],
  ["lines-angles", "la-03-01", "shapeHierarchyLab"],
  ["lines-angles", "la-04-01", "shapeHierarchyLab"],
  ["lines-angles", "la-04-02", "shapeHierarchyLab"],
  ["lines-angles", "la-04-03", "shapeHierarchyLab"],
  ["measure-convert", "mc-02-01", "areaModel"],
  ["measure-convert", "mc-02-02", "unitRuler"],
  ["measure-convert", "mc-02-03", "areaModel"],
  ["measure-convert", "mc-03-03", "angleMeasure"],
  ["measure-convert", "mc-04-01", "angleMeasure"],
  ["measure-convert", "mc-04-02", "angleMeasure"],
  ["measure-convert", "mc-04-03", "rotationLab"],
  ["measure-convert", "mc-05-01", "unitRuler"],
  ["measure-convert", "mc-05-02", "dotPlot"],
  ["measure-convert", "mc-05-03", "dotPlot"],
  ["multiply-bigger", "mb-01-02", "proportionalReasoningLab"],
  ["multiply-bigger", "mb-01-03", "proportionalReasoningLab"],
  ["multiply-bigger", "mb-03-02", "compositeAreaLab"],
  ["multiply-bigger", "mb-04-01", "quotientReasoningLab"],
  ["multiply-bigger", "mb-04-02", "quotientReasoningLab"],
  ["multiply-bigger", "mb-04-03", "quotientReasoningLab"],
  ["multiply-bigger", "mb-05-01", "sequenceBuild"],
  ["multiply-bigger", "mb-05-02", "evalOrder"],
  ["place-value-million", "pv2-01-01", "placeValueTransformLab"],
  ["place-value-million", "pv2-01-02", "placeValueTransformLab"],
  ["place-value-million", "pv2-01-03", "placeValueTransformLab"],
  ["place-value-million", "pv2-02-01", "placeValueTransformLab"],
  ["place-value-million", "pv2-02-02", "placeValueTransformLab"],
  ["place-value-million", "pv2-02-03", "placeValueTransformLab"],
  ["place-value-million", "pv2-03-03", "numberLinePlace"],
  ["place-value-million", "pv2-05-02", "placeValueTransformLab"],
] as const;

function parsedWidget(course: string, id: string) {
  const host = lesson(course, id).steps.find((step) => step.id === "i1");
  expect(host, id + "/i1 exists").toBeDefined();
  return WidgetSpec.parse(host?.widget);
}

describe("S244 Grade 4-5 causal-prediction wave", () => {
  it("covers the complete assigned denominator", () => {
    expect(grade45PredictionHosts).toHaveLength(42);
    expect(grade45PredictionHosts.filter(([course]) => course === "decimal-operations" || course === "decimals-place-value")).toHaveLength(4);
    expect(grade45PredictionHosts.filter(([course]) => course !== "decimal-operations" && course !== "decimals-place-value")).toHaveLength(38);
  });

  it.each(grade45PredictionHosts)(
    "%s/%s binds one prediction to a direct %s surface",
    (course, id, widgetType) => {
      const doc = lesson(course, id);
      const host = doc.steps.find((step) => step.id === "i1");
      const predictions = doc.steps.filter((step) => step.predict);
      const capabilities = JSON.parse(
        readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8"),
      ) as { types: Record<string, { manip?: number }> };

      expect(host?.kind).toBe("interactive");
      expect(host?.widget?.type).toBe(widgetType);
      expect(host?.body.length).toBeGreaterThanOrEqual(24);
      expect(host?.predict).toBeDefined();
      expect(predictions).toHaveLength(1);
      expect(host?.predict?.options.map((option) => option.id)).toContain(host?.predict?.outcomeId);
      expect(new Set(host?.predict?.options.map((option) => option.id)).size).toBe(host?.predict?.options.length);
      expect(new Set(host?.predict?.options.map((option) => option.label)).size).toBe(host?.predict?.options.length);
      const optionLengths = host?.predict?.options.map((option) => option.label.length) ?? [];
      expect(host?.predict?.prompt.length).toBeLessThanOrEqual(140);
      expect(Math.max(...optionLengths)).toBeLessThanOrEqual(60);
      expect(Math.max(...optionLengths)).toBeLessThanOrEqual(Math.min(...optionLengths) * 3);
      expect(host?.predict?.reveal.length).toBeGreaterThanOrEqual(25);
      expect(capabilities.types[widgetType]?.manip, id + "/i1 uses " + widgetType).toBeGreaterThanOrEqual(2);
      expect(() => WidgetSpec.parse(host?.widget)).not.toThrow();
    },
  );

  it.each([
    ["dop-01-02", 14],
    ["mb-05-02", 23],
  ] as const)("%s derives one exact operation-order result", (id, answer) => {
    const course = id.startsWith("dop") ? "decimal-operations" : "multiply-bigger";
    const widget = parsedWidget(course, id);
    expect(widget.type).toBe("evalOrder");
    if (widget.type !== "evalOrder") return;
    expect(evalTokens(widget.tokens)).toBe(answer);
    expect(widget.target).toBe(answer);
  });

  it("keeps both multiplicative comparisons on one scaled-pair model", () => {
    const cases = [
      ["mb-01-02", 40],
      ["mb-01-03", 12],
    ] as const;
    for (const [id, answer] of cases) {
      const widget = parsedWidget("multiply-bigger", id);
      expect(widget.type).toBe("proportionalReasoningLab");
      if (widget.type !== "proportionalReasoningLab") continue;
      expect(proportionalReasoningTruth(widget).answerNumber).toBe(answer);
    }
  });

  it("derives the distributive whole from both visible rectangles", () => {
    const widget = parsedWidget("multiply-bigger", "mb-03-02");
    expect(widget.type).toBe("compositeAreaLab");
    if (widget.type !== "compositeAreaLab") return;
    expect(compositeAreaTarget(widget)).toBe(204);
    expect(widget.choices.filter((choice) => choice.value === 204)).toHaveLength(1);
  });

  it("derives each quotient and remainder answer from the grouping state", () => {
    const cases = [
      ["mb-04-01", 0],
      ["mb-04-02", 21],
      ["mb-04-03", 7],
    ] as const;
    for (const [id, answer] of cases) {
      const widget = parsedWidget("multiply-bigger", id);
      expect(widget.type).toBe("quotientReasoningLab");
      if (widget.type !== "quotientReasoningLab") continue;
      expect(quotientReasoningTruth(widget).answerNumber).toBe(answer);
    }
  });

  it("derives the doubling rule from the rendered sequence", () => {
    const widget = parsedWidget("multiply-bigger", "mb-05-01");
    expect(widget.type).toBe("sequenceBuild");
    if (widget.type !== "sequenceBuild") return;
    expect(sequenceReasoningTruth(widget).answerClaim).toBe("recursive:multiply:2");
  });

  it("keeps the place-value shift and comparison truths independently derived", () => {
    const numericCases = [
      ["pv2-01-01", 6000],
      ["pv2-01-02", 340],
    ] as const;
    for (const [id, answer] of numericCases) {
      const widget = parsedWidget("place-value-million", id);
      expect(widget.type).toBe("placeValueTransformLab");
      if (widget.type !== "placeValueTransformLab") continue;
      expect(placeValueTransformTruth(widget).answerNumber).toBe(answer);
    }

    const comparison = parsedWidget("place-value-million", "pv2-05-02");
    expect(comparison.type).toBe("placeValueTransformLab");
    if (comparison.type === "placeValueTransformLab")
      expect(placeValueTransformTruth(comparison).answerClaim).toBe("relation:lt");
  });

  it("removes the response-only variant from the ×10 causal host", () => {
    const host = lesson("place-value-million", "pv2-01-02").steps.find((step) => step.id === "i1");
    expect(host?.variant).toBeUndefined();
  });
});
