import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Lesson as LessonSchema,
  WidgetSpec,
  algebraTilesPartials,
  equationOutcomeTruth,
  numberLineRayIsSolvedForm,
  numberLineRaySameSolutionSet,
  placeValueTransformTruth,
  quotientReasoningTruth,
  rootsFormCoefs,
  triangleClosureForms,
  widgetIntegrityErrors,
} from "./schema";
import { lintLesson } from "./pedagogy";

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
};

type LessonDocument = { id: string; steps: Step[] };

const root = process.cwd();
const capabilities = JSON.parse(
  readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8"),
) as { types: Record<string, { manip?: number }> };

function lesson(course: string, id: string): LessonDocument {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8"),
  ) as LessonDocument;
}

const predictionHosts = [
  [7, "geometry-g7", "g7-04-01", "triangleClosureLab"],
  [7, "geometry-g7", "g7-04-02", "solidSliceLab"],
  [7, "two-step-equations", "tse-04-03", "numberLineRay"],
  [8, "bivariate-statistics", "bv-01-02", "scatterFit"],
  [8, "bivariate-statistics", "bv-01-03", "scatterFit"],
  [8, "bivariate-statistics", "bv-03-02", "lineExplore"],
  [8, "bivariate-statistics", "bv-03-03", "scatterFit"],
  [8, "exponents-scientific-notation", "esn-02-01", "quadraticExplore"],
  [8, "exponents-scientific-notation", "esn-02-02", "volumeBuilder"],
  [8, "exponents-scientific-notation", "esn-03-01", "placeValueTransformLab"],
  [8, "exponents-scientific-notation", "esn-03-02", "placeValueTransformLab"],
  [8, "exponents-scientific-notation", "esn-04-01", "placeValueTransformLab"],
  [8, "exponents-scientific-notation", "esn-04-02", "placeValueTransformLab"],
  [8, "exponents-scientific-notation", "esn-04-03", "placeValueTransformLab"],
  [8, "functions-g8", "fg-01-02", "verticalLineScanner"],
  [8, "functions-g8", "fg-04-01", "covariationScrubber"],
  [8, "linear-equations-systems", "les-01-02", "solveBalance"],
  [8, "linear-equations-systems", "les-01-03", "algebraTiles"],
  [8, "linear-equations-systems", "les-02-03", "equationOutcomeLab"],
  [8, "linear-equations-systems", "les-03-03", "systemsExplore"],
  [8, "the-real-number-system", "rns-01-02", "quotientReasoningLab"],
  [8, "the-real-number-system", "rns-02-02", "quotientReasoningLab"],
  [8, "transformations-measurement", "tm-02-01", "transformExplore"],
] as const;

function parsedWidget(course: string, id: string) {
  const host = lesson(course, id).steps.find((step) => step.id === "i1");
  expect(host, `${id}/i1 exists`).toBeDefined();
  return WidgetSpec.parse(host?.widget);
}

function meanSquaredError(points: readonly (readonly [number, number])[], m: number, b: number) {
  return points.reduce((sum, [x, y]) => sum + (y - (m * x + b)) ** 2, 0) / points.length;
}

describe("S244 Grade 7-8 causal-prediction wave", () => {
  it("covers the complete assigned denominator", () => {
    expect(predictionHosts).toHaveLength(23);
    expect(predictionHosts.filter(([grade]) => grade === 7)).toHaveLength(3);
    expect(predictionHosts.filter(([grade]) => grade === 8)).toHaveLength(20);
  });

  it.each(predictionHosts)(
    "Grade %i %s/%s binds one prediction to a direct %s surface",
    (_grade, course, id, widgetType) => {
      const doc = lesson(course, id);
      const parsed = LessonSchema.parse(doc);
      const host = doc.steps.find((step) => step.id === "i1");
      const predictions = doc.steps.filter((step) => step.predict);
      const widget = WidgetSpec.parse(host?.widget);

      expect(lintLesson(parsed), `${course}/${id}`).toEqual([]);
      expect(host?.kind).toBe("interactive");
      expect(host?.widget?.type).toBe(widgetType);
      expect(predictions).toHaveLength(1);
      expect(host?.predict?.options.map((option) => option.id)).toContain(host?.predict?.outcomeId);
      expect(host?.predict?.reveal.length).toBeGreaterThanOrEqual(25);
      expect(capabilities.types[widgetType]?.manip, `${id}/i1 uses ${widgetType}`).toBeGreaterThanOrEqual(2);
      expect(widgetIntegrityErrors(widget), `${id}/i1 integrity`).toEqual([]);

      const labels = host?.predict?.options.map((option) => option.label) ?? [];
      const lengths = labels.map((label) => label.length);
      expect(host?.predict?.prompt.length).toBeLessThanOrEqual(140);
      expect(new Set(labels).size).toBe(labels.length);
      expect(Math.min(...lengths)).toBeGreaterThanOrEqual(12);
      expect(Math.max(...lengths)).toBeLessThanOrEqual(60);
      expect(Math.max(...lengths)).toBeLessThanOrEqual(Math.min(...lengths) * 2.5);
    },
  );

  it("derives the Grade 7 closure, slice, and inequality states", () => {
    const triangle = parsedWidget("geometry-g7", "g7-04-01");
    expect(triangle.type).toBe("triangleClosureLab");
    if (triangle.type === "triangleClosureLab") expect(triangleClosureForms(triangle.sides)).toBe(true);

    const slice = parsedWidget("geometry-g7", "g7-04-02");
    expect(slice.type).toBe("solidSliceLab");
    if (slice.type === "solidSliceLab") {
      expect(slice.solid).toBe("cylinder");
      expect(slice.comparisonRequired).toBe(false);
    }

    const ray = parsedWidget("two-step-equations", "tse-04-03");
    expect(ray.type).toBe("numberLineRay");
    if (ray.type === "numberLineRay" && ray.target) {
      expect(numberLineRaySameSolutionSet(ray.start, ray.target)).toBe(true);
      expect(numberLineRayIsSolvedForm(ray.target)).toBe(true);
      expect(ray.target.constant).toEqual({ n: 6, d: 1 });
      expect(ray.target.inclusive).toBe(true);
    }
  });

  it("makes every bivariate prediction visible in its fitted state", () => {
    const cases = [
      ["bv-01-02", 1.5, 1],
      ["bv-01-03", 1, 2],
      ["bv-03-03", 2, 1],
    ] as const;
    for (const [id, m, b] of cases) {
      const widget = parsedWidget("bivariate-statistics", id);
      expect(widget.type).toBe("scatterFit");
      if (widget.type !== "scatterFit") continue;
      expect(meanSquaredError(widget.points, m, b)).toBeLessThanOrEqual(widget.tolerance);
    }

    const phone = parsedWidget("bivariate-statistics", "bv-03-02");
    expect(phone.type).toBe("lineExplore");
    if (phone.type === "lineExplore") {
      expect(phone.targetSlope).toBe(2);
      expect(phone.targetIntercept).toBe(10);
    }
  });

  it("derives the exponent, root, and scientific-notation answers", () => {
    const roots = parsedWidget("exponents-scientific-notation", "esn-02-01");
    expect(roots.type).toBe("quadraticExplore");
    if (roots.type === "quadraticExplore")
      expect(rootsFormCoefs(roots.targetA, roots.targetR1 ?? 0, roots.targetR2 ?? 0)).toEqual({ a: 1, b: 0, c: -25 });

    const cube = parsedWidget("exponents-scientific-notation", "esn-02-02");
    expect(cube.type).toBe("volumeBuilder");
    if (cube.type === "volumeBuilder") {
      expect(cube.lockW && cube.lockH).toBe(true);
      expect(cube.targetVolume / (cube.wStart * cube.hStart)).toBe(4);
    }

    const cases = [
      ["esn-03-01", "scientific:3.2:8", undefined],
      ["esn-03-02", "scientific:5.6:-3", undefined],
      ["esn-04-01", "number:7", 7],
      ["esn-04-02", "number:3000", 3000],
      ["esn-04-03", "number:6", 6],
    ] as const;
    for (const [id, claim, answer] of cases) {
      const widget = parsedWidget("exponents-scientific-notation", id);
      expect(widget.type).toBe("placeValueTransformLab");
      if (widget.type !== "placeValueTransformLab") continue;
      const truth = placeValueTransformTruth(widget);
      expect(truth.answerClaim).toBe(claim);
      if (answer !== undefined) expect(truth.answerNumber).toBe(answer);
    }
  });

  it("derives the function and equation relationships independently", () => {
    const linear = parsedWidget("functions-g8", "fg-04-01");
    expect(linear.type).toBe("covariationScrubber");
    if (linear.type === "covariationScrubber") {
      expect([0, 1, 2, 3].map((x) => linear.a * x + linear.b)).toEqual([1, 4, 7, 10]);
    }

    const balance = parsedWidget("linear-equations-systems", "les-01-02");
    expect(balance.type).toBe("solveBalance");
    if (balance.type === "solveBalance") expect((balance.c - balance.b) / balance.a).toBe(4);

    const tiles = parsedWidget("linear-equations-systems", "les-01-03");
    expect(tiles.type).toBe("algebraTiles");
    if (tiles.type === "algebraTiles" && tiles.area)
      expect(algebraTilesPartials(tiles.area.width, tiles.area.height)).toEqual({ square: 0, x: 3, unit: 12 });

    const outcome = parsedWidget("linear-equations-systems", "les-02-03");
    expect(outcome.type).toBe("equationOutcomeLab");
    if (outcome.type === "equationOutcomeLab") expect(equationOutcomeTruth(outcome)).toBe("none");

    const system = parsedWidget("linear-equations-systems", "les-03-03");
    expect(system.type).toBe("systemsExplore");
    if (system.type === "systemsExplore") {
      const x = (system.b2 - system.b1) / (system.m1 - system.m2);
      expect([x, system.m1 * x + system.b1]).toEqual([2, 5]);
    }
  });

  it("derives the real-number classifications and rigid-motion target", () => {
    const terminating = parsedWidget("the-real-number-system", "rns-01-02");
    expect(terminating.type).toBe("quotientReasoningLab");
    if (terminating.type === "quotientReasoningLab") {
      const truth = quotientReasoningTruth(terminating);
      expect(truth.answerClaim).toBe("classification:terminates");
      expect(truth.decimal?.text).toBe("0.0625");
    }

    const repeating = parsedWidget("the-real-number-system", "rns-02-02");
    expect(repeating.type).toBe("quotientReasoningLab");
    if (repeating.type === "quotientReasoningLab") {
      const truth = quotientReasoningTruth(repeating);
      expect(truth.answerClaim).toBe("rational:yes");
      expect(truth.decimal?.text).toBe("0.(3)");
    }

    const transform = parsedWidget("transformations-measurement", "tm-02-01");
    expect(transform.type).toBe("transformExplore");
    if (transform.type === "transformExplore") {
      const reflectedAndShifted = transform.shape.map(([x, y]) => [-x + 5, y] as [number, number]);
      expect(reflectedAndShifted).toEqual(transform.target);
    }
  });
});
