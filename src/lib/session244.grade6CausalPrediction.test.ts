import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Lesson as LessonSchema,
  WidgetSpec,
  compositeAreaTarget,
  fmOutput,
  geometricTerm,
  widgetIntegrityErrors
} from "./schema";
import { lintLesson } from "./pedagogy";

type Step = {
  id: string;
  kind: string;
  widget?: Record<string, unknown> & { type?: string; prompt?: string };
  predict?: {
    prompt: string;
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

const grade6PredictionHosts = [
  ["area-surface-volume", "asv-01-03", "i1", "compositeAreaLab"],
  ["area-surface-volume", "asv-02-01", "i1", "compositeAreaLab"],
  ["area-surface-volume", "asv-02-02", "i1", "compositeAreaLab"],
  ["data-distributions", "dd-01-02", "i1", "dotPlot"],
  ["data-distributions", "dd-03-02", "i1", "dotPlot"],
  ["data-distributions", "dd-04-03", "i1", "boxPlot"],
  ["data-distributions", "dd-05-02", "i1", "dotPlot"],
  ["expressions-equations", "ee-01-01", "i1", "volumeBuilder"],
  ["expressions-equations", "ee-01-02", "i1", "sequenceBuild"],
  ["expressions-equations", "ee-02-01", "i1", "functionMachine"],
  ["expressions-equations", "ee-02-03", "i1", "functionMachine"],
  ["expressions-equations", "ee-03-03", "i1", "functionMachine"],
  ["expressions-equations", "ee-04-01", "i1", "balanceScale"],
  ["expressions-equations", "ee-05-03", "i1", "functionMachine"],
  ["number-system", "ns-04-02", "i1", "numberLinePlace"],
  ["number-system", "ns-04-02", "i2", "numberLinePlace"],
  ["number-system", "ns-05-02", "i1", "numberLinePlace"],
  ["number-system", "ns-05-02", "i2", "numberLinePlace"],
  ["number-system", "ns-05-03", "i1", "numberLinePlace"],
  ["number-system", "ns-05-03", "i2", "numberLinePlace"],
  ["ratios-rates", "rr-01-01", "i1", "ratioTable"],
  ["ratios-rates", "rr-01-02", "i1", "ratioTable"],
  ["ratios-rates", "rr-02-03", "i1", "ratioTable"],
  ["ratios-rates", "rr-04-03", "i1", "percentBar"],
  ["ratios-rates", "rr-05-01", "i1", "doubleNumberLine"]
] as const;

const uniqueLessons = [...new Set(grade6PredictionHosts.map(([course, id]) => `${course}/${id}`))];

function host(course: string, id: string, stepId: string) {
  const found = lesson(course, id).steps.find((step) => step.id === stepId);
  expect(found, `${course}/${id}#${stepId} exists`).toBeDefined();
  return found!;
}

function parsedWidget(course: string, id: string, stepId: string) {
  return WidgetSpec.parse(host(course, id, stepId).widget);
}

describe("S244 Grade 6 causal-prediction wave", () => {
  it.each(uniqueLessons)("%s passes the full lesson schema and pedagogy contract", (key) => {
    const [course, id] = key.split("/");
    const parsed = LessonSchema.parse(lesson(course!, id!));
    expect(lintLesson(parsed), key).toEqual([]);
  });

  it.each(grade6PredictionHosts)(
    "%s/%s binds prediction %s to direct engine %s",
    (course, id, stepId, widgetType) => {
      const step = host(course, id, stepId);
      const widget = WidgetSpec.parse(step.widget);
      const capabilities = JSON.parse(
        readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
      ) as { types: Record<string, { manip?: number }> };

      expect(step.kind).toBe("interactive");
      expect(widget.type).toBe(widgetType);
      expect(step.predict).toBeDefined();
      expect(step.predict?.options.map((option) => option.id)).toContain(step.predict?.outcomeId);
      expect(new Set(step.predict?.options.map((option) => option.id)).size).toBe(
        step.predict?.options.length
      );
      expect(step.predict?.reveal.length).toBeGreaterThanOrEqual(25);
      expect(capabilities.types[widgetType]?.manip, `${id}/${stepId}`).toBeGreaterThanOrEqual(2);
      expect(widgetIntegrityErrors(widget), `${id}/${stepId}`).toEqual([]);
    }
  );

  it("uses 25 distinct prediction/action pairs rather than repeating one question", () => {
    const pairs = grade6PredictionHosts.map(([course, id, stepId]) => {
      const step = host(course, id, stepId);
      return `${step.predict?.prompt}\n${step.widget?.prompt}`;
    });
    expect(new Set(pairs).size).toBe(25);
  });
});

describe("S244 Grade 6 mathematical-state truth", () => {
  it.each([
    ["asv-01-03", 18],
    ["asv-02-01", 30],
    ["asv-02-02", 52]
  ] as const)("%s derives composite area %s from its visible pieces", (id, answer) => {
    const widget = parsedWidget("area-surface-volume", id, "i1");
    expect(widget.type).toBe("compositeAreaLab");
    if (widget.type !== "compositeAreaLab") return;
    expect(compositeAreaTarget(widget)).toBe(answer);
    expect(widget.choices.filter((choice) => choice.value === answer)).toHaveLength(1);
  });

  it("keeps each data plot's target equal to the authored data", () => {
    const zero = parsedWidget("data-distributions", "dd-01-02", "i1");
    expect(zero).toMatchObject({ type: "dotPlot", given: [1, 2, 1, 1], target: [1, 2, 1, 1], askIndex: 0 });

    const median = parsedWidget("data-distributions", "dd-03-02", "i1");
    expect(median).toMatchObject({ type: "dotPlot", values: [2, 4, 7, 9], target: [1, 1, 1, 1] });

    const outlier = parsedWidget("data-distributions", "dd-05-02", "i1");
    expect(outlier).toMatchObject({
      type: "dotPlot",
      values: [10, 12, 14, 16, 18, 20, 64],
      target: [1, 2, 2, 1, 1, 0, 1]
    });
    if (outlier.type === "dotPlot") expect(outlier.target.reduce((sum, count) => sum + count, 0)).toBe(8);
  });

  it("draws Class B with median 7 and IQR 10", () => {
    const widget = parsedWidget("data-distributions", "dd-04-03", "i1");
    expect(widget).toMatchObject({ type: "boxPlot", targetQ1: 2, targetMed: 7, targetQ3: 12 });
    if (widget.type === "boxPlot") expect(widget.targetQ3 - widget.targetQ1).toBe(10);
  });

  it("makes the exponent models land exactly on 2 cubed and 2 to the fourth", () => {
    const cube = parsedWidget("expressions-equations", "ee-01-01", "i1");
    expect(cube).toMatchObject({ type: "volumeBuilder", targetVolume: 8, lMax: 2, wMax: 2, hMax: 2 });

    const power = parsedWidget("expressions-equations", "ee-01-02", "i1");
    expect(power).toMatchObject({ type: "sequenceBuild", mode: "geometricTerm", first: 1, atPosition: 5, targetTerm: 16 });
    if (power.type === "sequenceBuild") expect(geometricTerm(power.first, 2, power.atPosition)).toBe(16);
  });

  it("pins each expression engine to its stated algebra", () => {
    const plusThree = parsedWidget("expressions-equations", "ee-02-01", "i1");
    expect(plusThree).toMatchObject({ type: "functionMachine", a: 1, b: 3, targetOutput: 13 });
    if (plusThree.type === "functionMachine")
      expect(fmOutput(10, plusThree.a, plusThree.b, plusThree.square, plusThree.stage2, plusThree.join)).toBe(13);

    const moreThan = parsedWidget("expressions-equations", "ee-02-03", "i1");
    expect(moreThan).toMatchObject({ type: "functionMachine", a: 1, b: 7, targetOutput: 10 });
    if (moreThan.type === "functionMachine")
      expect(fmOutput(3, moreThan.a, moreThan.b, moreThan.square, moreThan.stage2, moreThan.join)).toBe(10);

    const equivalent = parsedWidget("expressions-equations", "ee-03-03", "i1");
    expect(equivalent).toMatchObject({
      type: "functionMachine", a: 1, b: 1, targetOutput: 32,
      stage2: { a: 4, b: 0, square: false }, join: "compose"
    });
    if (equivalent.type === "functionMachine")
      expect(fmOutput(7, equivalent.a, equivalent.b, equivalent.square, equivalent.stage2, equivalent.join)).toBe(32);
    expect(parsedWidget("expressions-equations", "ee-04-01", "i1")).toMatchObject({
      type: "balanceScale", a: 1, b: 3, c: 7
    });

    const pay = parsedWidget("expressions-equations", "ee-05-03", "i1");
    expect(pay).toMatchObject({ type: "functionMachine", a: 8, b: 0, targetOutput: 16 });
    if (pay.type === "functionMachine")
      expect(fmOutput(2, pay.a, pay.b, pay.square, pay.stage2, pay.join)).toBe(16);
  });

  it.each([
    ["ns-04-02", "i1", -5, -2],
    ["ns-04-02", "i2", 0, -8],
    ["ns-05-02", "i1", -8, -2],
    ["ns-05-02", "i2", 3, -4],
    ["ns-05-03", "i1", 2, 3],
    ["ns-05-03", "i2", 1.5, -2]
  ] as const)("%s#%s moves from %s to the intended number-line target %s", (id, stepId, start, target) => {
    const widget = parsedWidget("number-system", id, stepId);
    expect(widget).toMatchObject({ type: "numberLinePlace", start, target });
    if (widget.type !== "numberLinePlace") return;
    expect(widget.min).toBeLessThanOrEqual(Math.min(start, target));
    expect(widget.max).toBeGreaterThanOrEqual(Math.max(start, target));
  });

  it.each([
    ["rr-01-01", 3, 2, 6, 4],
    ["rr-01-02", 3, 5, 6, 10],
    ["rr-02-03", 2, 5, 8, 20]
  ] as const)("%s preserves the exact ratio %s:%s at %s:%s", (id, a, b, askA, targetB) => {
    const widget = parsedWidget("ratios-rates", id, "i1");
    expect(widget).toMatchObject({ type: "ratioTable", askA, targetB });
    expect(a * targetB).toBe(b * askA);
  });

  it("makes 100% the complete 60-unit bar", () => {
    expect(parsedWidget("ratios-rates", "rr-04-03", "i1")).toMatchObject({
      type: "percentBar", whole: 60, targetPercent: 100
    });
  });

  it("aligns 3 feet with 36 inches", () => {
    const widget = parsedWidget("ratios-rates", "rr-05-01", "i1");
    expect(widget).toMatchObject({
      type: "doubleNumberLine", topPerStep: 12, bottomPerStep: 1, askAtStep: 3, targetTop: 36
    });
    if (widget.type === "doubleNumberLine")
      expect(widget.topPerStep * widget.askAtStep).toBe(widget.targetTop);
  });
});
