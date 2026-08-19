import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec } from "./schema";

const raw = JSON.parse(readFileSync(join(
  process.cwd(),
  "content",
  "courses",
  "bivariate-statistics",
  "lessons",
  "bv-05-03.json",
), "utf8")) as { steps: Array<{
  id: string;
  body?: string;
  takeaways?: string[];
  explanationVariants?: string[];
  predict?: { reveal: string };
  widget?: unknown;
}> };

const step = (id: string) => {
  const result = raw.steps.find((candidate) => candidate.id === id);
  if (!result) throw new Error(`Missing bv-05-03/${id}`);
  return result;
};

const leastSquares = (points: Array<[number, number]>) => {
  const meanX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const meanY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const sxx = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const sxy = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const m = sxy / sxx;
  const b = meanY - m * meanX;
  const residuals = points.map(([x, y]) => y - (m * x + b));
  return {
    m,
    b,
    residuals,
    signedSum: residuals.reduce((sum, value) => sum + value, 0),
    squaredSum: residuals.reduce((sum, value) => sum + value ** 2, 0),
  };
};

describe("S247 bv-05-03 least-squares truth repair", () => {
  it("is schema-valid, pedagogy-clean, and names the actual criterion", () => {
    const lesson = Lesson.parse(raw);
    expect(lintLesson(lesson)).toEqual([]);
    expect(step("c1").body).toContain("sum of the squared residuals");
    expect(step("r1").takeaways?.join(" ")).toContain("balance alone does not identify the best line");
  });

  it("makes the exact least-squares line the only accepted slider state", () => {
    const widget = WidgetSpec.parse(step("i1").widget);
    expect(widget.type).toBe("scatterFit");
    if (widget.type !== "scatterFit") throw new Error("bv-05-03/i1 is not scatterFit");

    const fit = leastSquares(widget.points);
    expect(fit.m).toBeCloseTo(1.9, 12);
    expect(fit.b).toBeCloseTo(1.5, 12);
    expect(fit.residuals).toEqual([
      expect.closeTo(-0.4, 12),
      expect.closeTo(0.7, 12),
      expect.closeTo(-0.2, 12),
      expect.closeTo(-0.1, 12),
    ]);
    expect(fit.signedSum).toBeCloseTo(0, 12);
    expect(fit.squaredSum).toBeCloseTo(0.7, 12);

    const accepted: string[] = [];
    const mCount = Math.round((widget.mMax - widget.mMin) / widget.mStep);
    const bCount = Math.round((widget.bMax - widget.bMin) / widget.bStep);
    for (let mi = 0; mi <= mCount; mi += 1) {
      const m = Number((widget.mMin + mi * widget.mStep).toFixed(10));
      for (let bi = 0; bi <= bCount; bi += 1) {
        const b = Number((widget.bMin + bi * widget.bStep).toFixed(10));
        if (evaluate(widget, { m, b }).correct) accepted.push(`${m}|${b}`);
      }
    }
    expect(accepted).toEqual(["1.9|1.5"]);
  });

  it("keeps signed balance separate from the least-squares objective", () => {
    const k1 = WidgetSpec.parse(step("k1").widget);
    expect(k1.type).toBe("numeric");
    if (k1.type !== "numeric") throw new Error("bv-05-03/k1 is not numeric");
    expect(evaluate(k1, 0).correct).toBe(true);
    expect(evaluate(k1, 0.7).correct).toBe(false);

    const k2 = WidgetSpec.parse(step("k2").widget);
    expect(k2.type).toBe("mcq");
    if (k2.type !== "mcq") throw new Error("bv-05-03/k2 is not mcq");
    expect(evaluate(k2, "no").correct).toBe(true);
    expect(k2.options.find((option) => option.id === "no")?.feedback).toContain("0.70 to 2.66");
  });

  it("removes the false invented-data and approximate-balance claims", () => {
    const learnerText = JSON.stringify(raw);
    expect(learnerText).not.toMatch(/data was invented|essentially balanced|\+1 ≈ 0/i);
    expect(step("i1").predict?.reveal).toContain("real or simulated data");
  });
});
