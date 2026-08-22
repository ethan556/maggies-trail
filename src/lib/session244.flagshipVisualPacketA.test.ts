import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Lesson as LessonSchema,
  WidgetSpec,
  columnCalcTruth,
  conditionalTableReadTruth,
  fmOutput,
  rotationLabImage,
  widgetIntegrityErrors
} from "./schema";
import { traceSlopeAt } from "./evaluate";
import { lintLesson } from "./pedagogy";

type StepDocument = {
  id: string;
  kind: string;
  widget?: Record<string, unknown> & { type?: string };
  variant?: unknown;
  cml?: { flagship?: boolean; invariants?: string[] };
};

type LessonDocument = { id: string; steps: StepDocument[] };

const root = process.cwd();
const capabilities = JSON.parse(
  readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
) as { types: Record<string, { manip?: number }> };
const responseOnly = new Set(["numeric", "mcq", "fractionEntry", "pointEntry", "subitizeFlash"]);

const packet = [
  ["bivariate-statistics", "bv-04-03", "k3", "conditionalTableLab", "i1", "samplingBiasLab", "relative-frequency-comparable"],
  ["circle-theorems", "cr-03-02", "i2", "angleMeasure", "i1", "circleMeasureExplore", "tangent-radius-perpendicular"],
  ["complex-numbers", "cn-03-02", "i2", "argandExplore", "i1", "argandExplore", "arguments-add"],
  ["conic-sections", "co-05-02", "k1", "conicLocusLab", "i1", "conicLocusLab", "eccentricity-classifies-conic"],
  ["coordinate-geometry", "cg-01-01", "ch1", "plotPoint", "i1", "plotPoint", "ordered-pair-axis-meaning"],
  ["coordinate-proofs", "cx-01-03", "k1", "distanceGrid", "i1", "coordinateProofLab", "parallelogram-diagonals-bisect"],
  ["data-distributions", "dd-01-03", "ch1", "dotPlot", "i1", "samplingBiasLab", "sampling-method-declared"],
  ["decimal-operations", "dop-02-02", "k1", "columnCalc", "k3", "columnCalc", "place-value-preserved"],
  ["derivative-rules", "dr-03-01", "k1", "derivativeTrace", "i1", "derivativeRuleLab", "first-order-change-survives-limit"],
  ["derivatives-in-context", "dc-02-02", "ch1", "relatedRatesLab", "i1", "relatedRatesLab", "ladder-length-fixed"],
  ["differential-equations", "de-01-02", "ch1", "slopeField", "i1", "slopeField", "solution-follows-local-slopes"],
  ["exponents-polynomials", "ep-02-02", "k1", "algebraTiles", "i1", "algebraTiles", "only-like-units-combine"],
  ["function-analysis", "fna-02-02", "k1", "quadraticExplore", "i1", "secantSlope", "tangent-is-secant-limit"],
  ["function-transformations", "ft-03-01", "k1", "transformExplore", "i1", "quadraticExplore", "output-sign-reversed"],
  ["functions-and-sequences", "fn-01-01", "i2", "functionMachine", "i1", "functionMachine", "one-output-per-input"],
  ["geometry-foundations", "gf-04-01", "k1", "rotationLab", "i1", "transformExplore", "translation-vectors-add"],
  ["integration-accumulation", "in-02-01", "ch1", "accumulateArea", "i1", "accumulateArea", "accumulation-changes-at-integrand-rate"],
  ["limits-continuity", "lc-01-02", "k2", "graphZoom", "i1", "graphZoom", "limit-depends-on-approach"],
  ["linear-equations-systems", "les-03-01", "k2", "affineRelationshipLab", "i1", "systemsExplore", "shared-solution"],
  ["logarithms", "lg-01-03", "k2", "expLogExplore", "i1", "expLogExplore", "exponential-logarithm-inverse-pair"]
] as const;

function lesson(course: string, id: string): LessonDocument {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as LessonDocument;
}

function step(course: string, id: string, stepId: string): StepDocument {
  const found = lesson(course, id).steps.find((candidate) => candidate.id === stepId);
  expect(found, `${course}/${id}#${stepId} exists`).toBeDefined();
  return found!;
}

function widget(course: string, id: string, stepId: string) {
  return WidgetSpec.parse(step(course, id, stepId).widget);
}

describe("S244 flagship visual-first packet A contract", () => {
  it.each(packet)(
    "%s/%s keeps exact host %s on direct engine %s",
    (course, id, stepId, widgetType, flagshipId, flagshipType, invariant) => {
      const document = LessonSchema.parse(lesson(course, id));
      const host = document.steps.find((candidate) => candidate.id === stepId)!;
      const parsedWidget = WidgetSpec.parse(host.widget);
      const flagship = document.steps.find((candidate) => candidate.id === flagshipId)!;

      expect(parsedWidget.type).toBe(widgetType);
      expect(host.variant, `${id}#${stepId} must not be replaced by a generated response surface`).toBeUndefined();
      expect(capabilities.types[widgetType]?.manip, `${id}#${stepId} is direct`).toBeGreaterThanOrEqual(2);
      expect(widgetIntegrityErrors(parsedWidget), `${id}#${stepId}`).toEqual([]);
      expect(flagship.widget?.type).toBe(flagshipType);
      expect(flagship.cml?.flagship).toBe(true);
      expect(flagship.cml?.invariants).toContain(invariant);
    }
  );

  it.each(packet.map(([course, id]) => [course, id] as const))(
    "%s/%s passes schema, pedagogy, and the response-heavy threshold",
    (course, id) => {
      const parsed = LessonSchema.parse(lesson(course, id));
      const types = parsed.steps.flatMap((candidate) => candidate.widget ? [candidate.widget.type] : []);
      const directCount = types.filter((type) => (capabilities.types[type]?.manip ?? 0) >= 2).length;
      const responseCount = types.filter((type) => responseOnly.has(type)).length;

      expect(lintLesson(parsed), `${course}/${id}`).toEqual([]);
      expect(directCount, `${course}/${id} has two mathematical action surfaces`).toBeGreaterThanOrEqual(2);
      expect(responseCount / Math.max(types.length, 1), `${course}/${id} response-only share`).toBeLessThanOrEqual(0.75);
    }
  );
});

describe("S244 flagship visual-first packet A mathematical truth", () => {
  it("reads the adult conditional rate from the correct row denominator", () => {
    const parsed = widget("bivariate-statistics", "bv-04-03", "k3");
    expect(parsed).toMatchObject({
      type: "conditionalTableLab", mode: "read", counts: [20, 10, 5, 15],
      targetCondition: "row1", targetCell: "r1c1", readMetric: "relativeRow"
    });
    if (parsed.type !== "conditionalTableLab") return;
    expect(conditionalTableReadTruth(parsed.counts, parsed.readMetric!, parsed.targetCell)).toEqual({
      numerator: 15, denominator: 20, value: 75
    });
  });

  it("constructs the tangent right angle and the complex quarter-turn product", () => {
    expect(widget("circle-theorems", "cr-03-02", "i2")).toMatchObject({
      type: "angleMeasure", targetAngle: 90
    });
    const product = widget("complex-numbers", "cn-03-02", "i2");
    expect(product).toMatchObject({ type: "argandExplore", mode: "multiply", mulRe: 0, mulIm: 3, targetRe: -15, targetIm: 0 });
    if (product.type !== "argandExplore") return;
    const z = { re: 0, im: 5 };
    expect([z.re * product.mulRe - z.im * product.mulIm, z.re * product.mulIm + z.im * product.mulRe]).toEqual([-15, 0]);
  });

  it("classifies e = 0.8 and preserves the intended coordinate geometry", () => {
    const conic = widget("conic-sections", "co-05-02", "k1");
    expect(conic).toMatchObject({ type: "conicLocusLab", targetEccentricityTenths: 8 });
    if (conic.type === "conicLocusLab") expect(conic.targetEccentricityTenths / 10).toBeLessThan(1);

    const vertical = widget("coordinate-geometry", "cg-01-01", "ch1");
    expect(vertical).toMatchObject({ type: "plotPoint", targets: [{ x: 3, y: 6 }, { x: 3, y: 1 }], connectTargets: true });
    if (vertical.type === "plotPoint") {
      expect(vertical.targets[0]!.x).toBe(vertical.targets[1]!.x);
      expect(Math.abs(vertical.targets[0]!.y - vertical.targets[1]!.y)).toBe(5);
    }

    const distance = widget("coordinate-proofs", "cx-01-03", "k1");
    expect(distance).toMatchObject({ type: "distanceGrid", anchor: [0, 0], targetPoint: [3, 5] });
    expect(Math.hypot(3, 5)).toBeCloseTo(Math.sqrt(34), 12);
    expect(Math.hypot(6 - 3, 0 - 5)).toBeCloseTo(Math.sqrt(34), 12);
  });

  it("keeps every data mark and every carried place-value unit", () => {
    const plot = widget("data-distributions", "dd-01-03", "ch1");
    expect(plot).toMatchObject({ type: "dotPlot", values: [0, 1, 2, 3, 4], target: [1, 3, 4, 2, 2] });
    if (plot.type === "dotPlot") expect(plot.target.reduce((sum, count) => sum + count, 0)).toBe(12);

    const column = widget("decimal-operations", "dop-02-02", "k1");
    expect(column).toMatchObject({ type: "columnCalc", op: "multiply", a: 28, b: 3 });
    if (column.type === "columnCalc") expect(columnCalcTruth(column.op, column.a, column.b)).toBe(84);
  });

  it("coordinates derivative, ladder-rate, and logistic-field states", () => {
    const derivative = widget("derivative-rules", "dr-03-01", "k1");
    expect(derivative).toMatchObject({ type: "derivativeTrace", fn: "cubic", mode: "point", targetX: 2 });
    expect(traceSlopeAt("cubic", 2)).toBe(12);
    expect(1 * 2 ** 2 + 2 * (2 * 2)).toBe(12);

    const ladder = widget("derivatives-in-context", "dc-02-02", "ch1");
    expect(ladder).toMatchObject({ type: "relatedRatesLab", model: "ladder", ladderLength: 10, horizontalRate: 2, targetX: 8 });
    const y = Math.sqrt(10 ** 2 - 8 ** 2);
    expect(y).toBe(6);
    expect(-(8 / y) * 2).toBeCloseTo(-8 / 3, 12);

    const field = widget("differential-equations", "de-01-02", "ch1");
    expect(field).toMatchObject({ type: "slopeField", equation: "logistic", targetY0: 6 });
    const logisticSlope = (population: number) => 1.8 * population * (1 - population / 4);
    expect(logisticSlope(6)).toBeLessThan(0);
    expect(logisticSlope(4)).toBe(0);
  });

  it("builds like terms, a maximum, and an x-axis reflection exactly", () => {
    expect(widget("exponents-polynomials", "ep-02-02", "k1")).toMatchObject({
      type: "algebraTiles", targetX: -3 + 7, targetConst: 2 - 6
    });
    expect(widget("function-analysis", "fna-02-02", "k1")).toMatchObject({
      type: "quadraticExplore", targetA: -1, targetH: 2, targetK: 9
    });
    const reflected = widget("function-transformations", "ft-03-01", "k1");
    expect(reflected).toMatchObject({
      type: "transformExplore",
      shape: [[-2, 2], [0, 0], [2, 2]],
      target: [[-2, -2], [0, 0], [2, -2]]
    });
    if (reflected.type === "transformExplore") {
      expect(reflected.shape.map(([x, y]) => [x, y === 0 ? 0 : -y])).toEqual(reflected.target);
    }
  });

  it("keeps the function machine and transformation composition mathematically exact", () => {
    const machine = widget("functions-and-sequences", "fn-01-01", "i2");
    expect(machine).toMatchObject({ type: "functionMachine", a: 1, b: 1, square: true, targetOutput: 10 });
    if (machine.type === "functionMachine") {
      expect(fmOutput(3, machine.a, machine.b, machine.square, machine.stage2, machine.join)).toBe(10);
    }

    const rotation = widget("geometry-foundations", "gf-04-01", "k1");
    expect(rotation).toMatchObject({ type: "rotationLab", point: [4, 2], centre: [0, 0], targetAngle: 180 });
    if (rotation.type === "rotationLab") {
      expect(rotationLabImage(rotation.point!, rotation.centre, rotation.targetAngle)).toEqual([-4, -2]);
    }
  });

  it("shows accumulation difference, removable limit, shared system point, and log inverse", () => {
    const area = widget("integration-accumulation", "in-02-01", "ch1");
    expect(area).toMatchObject({ type: "accumulateArea", fn: "line", mode: "point", start: 2, targetX: 3 });
    expect(3 ** 2 - 2 ** 2).toBe(5);

    expect(widget("limits-continuity", "lc-01-02", "k2")).toMatchObject({
      type: "graphZoom", behaviour: "removable", a: 2, leftValue: 4, rightValue: 4, fAtA: 1, targetVerdict: "limit-exists"
    });

    const system = widget("linear-equations-systems", "les-03-01", "k2");
    expect(system).toMatchObject({
      type: "affineRelationshipLab", task: "intersectionPoint", answerMode: "point",
      lines: [{ m: -1, b: 4 }, { m: 2, b: -5 }]
    });
    if (system.type === "affineRelationshipLab") {
      const [first, second] = system.lines;
      const x = (second!.b - first!.b) / (first!.m - second!.m);
      expect([x, first!.m * x + first!.b]).toEqual([3, 1]);
    }

    const logarithm = widget("logarithms", "lg-01-03", "k2");
    expect(logarithm).toMatchObject({ type: "expLogExplore", mode: "logarithm", x: 0.25, targetBase: 2 });
    if (logarithm.type === "expLogExplore") {
      expect(Math.log(logarithm.x) / Math.log(logarithm.targetBase)).toBe(-2);
      expect(logarithm.targetBase ** -2).toBe(logarithm.x);
    }
  });
});
