import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Lesson as LessonSchema,
  WidgetSpec,
  compositeAreaTarget,
  evalTokens,
  placeValueTransformChoiceCorrect,
  shapeHierarchyChoiceCorrect
} from "./schema";
import { lintLesson } from "./pedagogy";

type Step = {
  id: string;
  kind: string;
  widget?: Record<string, unknown> & { type?: string };
  predict?: {
    options: Array<{ id: string; label: string }>;
    outcomeId: string;
    reveal: string;
  };
};

type LessonDocument = { id: string; steps: Step[] };

const root = process.cwd();

function lesson(course: string, id: string): LessonDocument {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as LessonDocument;
}

const grade3PredictionHosts = [
  ["fractions", "fr-01-03", "i1", "fractionBar"],
  ["fractions", "fr-03-02", "i1", "fractionBar"],
  ["fractions", "fr-04-03", "i1", "fractionBar"],
  ["fractions", "fr-04-04", "i1", "lengthCompare"],
  ["measurement-data", "md-01-02", "i1", "clockSet"],
  ["measurement-data", "md-03-03", "i1", "barBuilder"],
  ["measurement-data", "md-03-04", "i1", "dotPlot"],
  ["measurement-data", "md-04-03", "i1", "compositeAreaLab"],
  ["measurement-data", "md-04-04", "i1", "compositeAreaLab"],
  ["measurement-data", "md-05-03", "i1", "compositeAreaLab"],
  ["multiplication-division", "mult-01-03", "i1", "numberLineHop"],
  ["multiplication-division", "mult-01-05", "i1", "areaModel"],
  ["multiplication-division", "mult-02-04", "i1", "areaModel"],
  ["multiplication-division", "mult-02-05", "i2", "slider"],
  ["multiplication-division", "mult-03-01", "i1", "oddEvenPairs"],
  ["multiplication-division", "mult-03-03", "i2", "areaModel"],
  ["multiplication-division", "mult-03-05", "i1", "compositeAreaLab"],
  ["multiplication-division", "mult-04-02", "i1", "plotPoint"],
  ["multiplication-division", "mult-04-03", "i1", "balanceScale"],
  ["multiplication-division", "mult-04-04", "i1", "evalOrder"],
  ["multiplication-division", "mult-05-03", "i1", "areaModel"],
  ["place-value", "pv-01-02", "i1", "placeValue"],
  ["place-value", "pv-01-03", "i1", "placeValueTransformLab"],
  ["place-value", "pv-04-01", "i1", "baseTenCompose"],
  ["place-value", "pv-04-02", "i1", "placeValueTransformLab"],
  ["place-value", "pv-04-03", "i1", "doubleNumberLine"],
  ["shapes-space", "geo-01-03", "i1", "shapeHierarchyLab"],
  ["shapes-space", "geo-02-01", "i1", "shapeHierarchyLab"],
  ["shapes-space", "geo-02-02", "i1", "shapeHierarchyLab"]
] as const;

function parsedWidget(course: string, id: string, stepId: string) {
  const step = lesson(course, id).steps.find((candidate) => candidate.id === stepId);
  expect(step, `${id}/${stepId} exists`).toBeDefined();
  return WidgetSpec.parse(step?.widget);
}

describe("S244 Grade 3 causal-prediction wave", () => {
  it.each(grade3PredictionHosts)(
    "%s/%s passes the full lesson schema and pedagogy contract",
    (course, id) => {
      const parsed = LessonSchema.parse(lesson(course, id));
      expect(lintLesson(parsed), `${course}/${id}`).toEqual([]);
    }
  );

  it.each(grade3PredictionHosts)(
    "%s/%s binds its prediction to %s (%s)",
    (course, id, stepId, widgetType) => {
      const doc = lesson(course, id);
      const host = doc.steps.find((step) => step.id === stepId);
      const predictions = doc.steps.filter((step) => step.predict);
      const capabilities = JSON.parse(
        readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
      ) as { types: Record<string, { manip?: number }> };

      expect(host?.kind).toBe("interactive");
      expect(host?.widget?.type).toBe(widgetType);
      expect(host?.predict).toBeDefined();
      expect(predictions).toHaveLength(1);
      expect(host?.predict?.options.map((option) => option.id)).toContain(host?.predict?.outcomeId);
      expect(host?.predict?.reveal.length).toBeGreaterThanOrEqual(25);
      expect(capabilities.types[widgetType]?.manip, `${id}/${stepId} uses ${widgetType}`).toBeGreaterThanOrEqual(2);
      expect(() => WidgetSpec.parse(host?.widget)).not.toThrow();
    }
  );

  it.each([
    ["measurement-data", "md-04-03", "i1", 42],
    ["measurement-data", "md-04-04", "i1", 14],
    ["measurement-data", "md-05-03", "i1", 4],
    ["multiplication-division", "mult-03-05", "i1", 56]
  ] as const)("%s/%s derives one exact composite-area answer", (course, id, stepId, answer) => {
    const widget = parsedWidget(course, id, stepId);
    expect(widget.type).toBe("compositeAreaLab");
    if (widget.type !== "compositeAreaLab") return;
    const target = compositeAreaTarget(widget);
    expect(target).toBe(answer);
    expect(widget.choices.filter((choice) => choice.value === target)).toHaveLength(1);
  });

  it.each([
    ["mult-01-05", "i1", 10, 2, 5],
    ["mult-02-04", "i1", 12, 3, 4],
    ["mult-03-03", "i2", 24, 3, 8],
    ["mult-05-03", "i1", 28, 4, 7]
  ] as const)("%s/%s pins the intended array", (id, stepId, area, w, h) => {
    const widget = parsedWidget("multiplication-division", id, stepId);
    expect(widget.type).toBe("areaModel");
    if (widget.type !== "areaModel") return;
    expect(widget.targetArea).toBe(area);
    expect(widget.requireFactors).toEqual({ w, h });
    expect(w * h).toBe(area);
  });

  it.each([
    ["geo-01-03", "sometimes"],
    ["geo-02-01", "sometimes"],
    ["geo-02-02", "never"]
  ] as const)("%s has one evidence-backed shape verdict", (id, expectedClaim) => {
    const widget = parsedWidget("shapes-space", id, "i1");
    expect(widget.type).toBe("shapeHierarchyLab");
    if (widget.type !== "shapeHierarchyLab") return;
    const correct = widget.choices.filter((choice) => shapeHierarchyChoiceCorrect(widget, choice));
    expect(correct).toHaveLength(1);
    expect(correct[0]?.claim).toBe(expectedClaim);
  });

  it.each([
    ["pv-01-03", "relation:lt"],
    ["pv-04-02", "shift:1"]
  ] as const)("%s has one derived place-value claim", (id, expectedClaim) => {
    const widget = parsedWidget("place-value", id, "i1");
    expect(widget.type).toBe("placeValueTransformLab");
    if (widget.type !== "placeValueTransformLab") return;
    const correct = widget.choices.filter((choice) => placeValueTransformChoiceCorrect(widget, choice));
    expect(correct).toHaveLength(1);
    expect(correct[0]?.claim).toBe(expectedClaim);
  });

  it("makes the two-step story visibly evaluate to 7", () => {
    const widget = parsedWidget("multiplication-division", "mult-04-04", "i1");
    expect(widget.type).toBe("evalOrder");
    if (widget.type !== "evalOrder") return;
    expect(evalTokens(widget.tokens)).toBe(7);
    expect(widget.target).toBe(7);
  });

  it("makes the skip-count hops land on 8", () => {
    const widget = parsedWidget("multiplication-division", "mult-01-03", "i1");
    expect(widget.type).toBe("numberLineHop");
    if (widget.type !== "numberLineHop") return;
    expect(widget.start + widget.hop * widget.hops).toBe(8);
  });
});
