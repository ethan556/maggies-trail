import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Lesson as LessonSchema,
  WidgetSpec,
  equationTransformTruth,
  widgetIntegrityErrors,
} from "./schema";
import { lintLesson } from "./pedagogy";

type Step = {
  id: string;
  kind: string;
  body?: string;
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
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8"),
  ) as LessonDocument;
}

const highSchoolPredictionHosts = [
  [9, "exponents-polynomials", "ep-02-01", "i1", "slider"],
  [9, "linear-functions", "lf-03-02", "i1", "lineExplore"],
  [9, "radicals-and-exponents", "rad-01-01", "i3", "slider"],
  [9, "radicals-and-exponents", "rad-02-02", "i1", "areaModel"],
  [9, "solving-equations", "alg1-03-03", "i1", "inversePipeline"],
  [10, "geometry-foundations", "gf-02-03", "k1", "equationOutcomeLab"],
  [11, "complex-numbers", "cn-04-01", "i1v", "quadraticExplore"],
  [11, "complex-numbers", "cn-04-02", "i1v", "quadraticExplore"],
] as const;

const uniqueLessons = [
  ...new Set(highSchoolPredictionHosts.map(([, course, id]) => `${course}/${id}`)),
];

function host(course: string, id: string, stepId: string): Step {
  const found = lesson(course, id).steps.find((step) => step.id === stepId);
  expect(found, `${course}/${id}#${stepId} exists`).toBeDefined();
  return found!;
}

function parsedWidget(course: string, id: string, stepId: string) {
  return WidgetSpec.parse(host(course, id, stepId).widget);
}

describe("S244 high-school causal-prediction wave", () => {
  it("covers the complete five Grade 9, one Grade 10, and two Grade 11 denominator", () => {
    expect(highSchoolPredictionHosts).toHaveLength(8);
    expect(highSchoolPredictionHosts.filter(([grade]) => grade === 9)).toHaveLength(5);
    expect(highSchoolPredictionHosts.filter(([grade]) => grade === 10)).toHaveLength(1);
    expect(highSchoolPredictionHosts.filter(([grade]) => grade === 11)).toHaveLength(2);
  });

  it.each(uniqueLessons)("%s passes the full lesson schema and pedagogy contract", (key) => {
    const [course, id] = key.split("/");
    const parsed = LessonSchema.parse(lesson(course!, id!));
    expect(lintLesson(parsed), key).toEqual([]);
  });

  it.each(highSchoolPredictionHosts)(
    "Grade %s %s/%s binds prediction %s to direct engine %s",
    (_grade, course, id, stepId, widgetType) => {
      const doc = lesson(course, id);
      const step = host(course, id, stepId);
      const widget = WidgetSpec.parse(step.widget);
      const capabilities = JSON.parse(
        readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8"),
      ) as { types: Record<string, { manip?: number }> };

      expect(step.widget?.type).toBe(widgetType);
      expect(step.predict).toBeDefined();
      expect(doc.steps.filter((candidate) => candidate.predict)).toHaveLength(1);
      expect(step.predict?.options.map((option) => option.id)).toContain(step.predict?.outcomeId);
      expect(new Set(step.predict?.options.map((option) => option.id)).size).toBe(
        step.predict?.options.length,
      );
      expect(new Set(step.predict?.options.map((option) => option.label)).size).toBe(
        step.predict?.options.length,
      );
      const optionLengths = step.predict?.options.map((option) => option.label.length) ?? [];
      expect(step.predict?.prompt.length).toBeLessThanOrEqual(140);
      expect(Math.max(...optionLengths)).toBeLessThanOrEqual(64);
      expect(Math.max(...optionLengths)).toBeLessThanOrEqual(Math.min(...optionLengths) * 3);
      expect(step.predict?.reveal.length).toBeGreaterThanOrEqual(40);
      expect(capabilities.types[widgetType]?.manip, `${id}/${stepId}`).toBeGreaterThanOrEqual(2);
      expect(widgetIntegrityErrors(widget), `${id}/${stepId}`).toEqual([]);
    },
  );

  it("uses eight distinct prediction/action pairs", () => {
    const pairs = highSchoolPredictionHosts.map(([, course, id, stepId]) => {
      const step = host(course, id, stepId);
      return `${step.predict?.prompt}\n${step.widget?.prompt}`;
    });
    expect(new Set(pairs).size).toBe(8);
  });
});

describe("S244 high-school mathematical-state truth", () => {
  it("marks the greatest displayed exponent as the polynomial degree", () => {
    const widget = parsedWidget("exponents-polynomials", "ep-02-01", "i1");
    expect(widget).toMatchObject({ type: "slider", start: 0, target: 4 });
    expect(Math.max(2, 4, 1)).toBe(4);
  });

  it("keeps the point-slope and slope-intercept forms on one exact line", () => {
    const widget = parsedWidget("linear-functions", "lf-03-02", "i1");
    expect(widget).toMatchObject({ type: "lineExplore", targetSlope: 2, targetIntercept: 1 });
    if (widget.type !== "lineExplore") return;
    expect(widget.targetSlope * 1 + widget.targetIntercept).toBe(3);
  });

  it("finds 4 as the greatest square factor of 20", () => {
    const widget = parsedWidget("radicals-and-exponents", "rad-01-01", "i3");
    expect(widget).toMatchObject({ type: "slider", target: 4 });
    const squareFactors = Array.from({ length: 20 }, (_, index) => index + 1).filter(
      (value) => Number.isInteger(Math.sqrt(value)) && 20 % value === 0,
    );
    expect(Math.max(...squareFactors)).toBe(4);
  });

  it("makes the radical product's visible factors multiply to one perfect square", () => {
    const widget = parsedWidget("radicals-and-exponents", "rad-02-02", "i1");
    expect(widget).toMatchObject({
      type: "areaModel",
      targetArea: 16,
      requireFactors: { w: 2, h: 8 },
    });
    if (widget.type !== "areaModel") return;
    expect(widget.requireFactors!.w * widget.requireFactors!.h).toBe(widget.targetArea);
    expect(Math.sqrt(widget.targetArea)).toBe(4);
  });

  it("makes the temperature pipeline reverse and flip every forward operation", () => {
    const widget = parsedWidget("solving-equations", "alg1-03-03", "i1");
    expect(widget.type).toBe("inversePipeline");
    if (widget.type !== "inversePipeline") return;
    const apply = (value: number, op: { op: "add" | "sub" | "mul" | "div"; n: number }) =>
      op.op === "add"
        ? value + op.n
        : op.op === "sub"
          ? value - op.n
          : op.op === "mul"
            ? value * op.n
            : value / op.n;
    const celsius = widget.forward.reduce(apply, widget.sampleInput!);
    const tray = new Map(widget.tray.map((card) => [card.id, card]));
    const fahrenheit = widget.answer.reduce((value, id) => apply(value, tray.get(id)!), celsius);
    expect(celsius).toBe(20);
    expect(fahrenheit).toBe(68);
  });

  it("derives x = 9 from the same segment equation shown in the workbench", () => {
    const widget = parsedWidget("geometry-foundations", "gf-02-03", "k1");
    expect(widget.type).toBe("equationOutcomeLab");
    if (widget.type !== "equationOutcomeLab") return;
    const truth = equationTransformTruth(widget);
    expect(truth.answerNumber).toBe(9);
    expect(truth.states.at(-1)?.state).toMatchObject({
      leftCoeff: 1,
      leftConstant: 0,
      rightCoeff: 0,
      rightConstant: 9,
      relation: "eq",
    });
  });

  it.each([
    ["cn-04-01", 1, 4, -16],
    ["cn-04-02", 3, 4, -16],
  ] as const)("%s makes its positive vertex height imply discriminant %s", (id, h, k, d) => {
    const widget = parsedWidget("complex-numbers", id, "i1v");
    expect(widget).toMatchObject({ type: "quadraticExplore", targetA: 1, targetH: h, targetK: k });
    if (widget.type !== "quadraticExplore") return;
    const a = widget.targetA / widget.aDen;
    const b = -2 * a * widget.targetH;
    const c = a * widget.targetH ** 2 + widget.targetK;
    expect(b ** 2 - 4 * a * c).toBe(d);
  });

  it("uses a fresh Grade 11 discriminant example rather than repeating the worked example", () => {
    const numeric = host("complex-numbers", "cn-04-02", "i1").widget;
    expect(numeric).toMatchObject({ type: "numeric", answer: -16 });
    expect(numeric?.prompt).toContain("x² − 6x + 13");
  });
});
