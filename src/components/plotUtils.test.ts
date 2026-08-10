import { describe, expect, it } from "vitest";
import { gridScales, integers, linScale, samplePolyline } from "./plotUtils";

describe("linScale", () => {
  it("maps endpoints and interpolates the midpoint", () => {
    const s = linScale(0, 10, 100, 200);
    expect(s(0)).toBe(100);
    expect(s(10)).toBe(200);
    expect(s(5)).toBe(150);
  });
  it("handles inverted ranges (pixel y grows downward)", () => {
    const s = linScale(0, 10, 200, 100);
    expect(s(0)).toBe(200);
    expect(s(10)).toBe(100);
  });
});

describe("gridScales reproduces the widgets' original formulas exactly", () => {
  // quadraticExplore / lineExplore: G-based, pad 12, W=H=300
  it("matches the G-based scale", () => {
    const G = 7, W = 300, H = 300, pad = 12, span = 2 * G;
    const { sx, sy } = gridScales({ xMin: -G, xMax: G, yMin: -G, yMax: G, W, H, pad });
    const oldSx = (x: number) => pad + ((x + G) / span) * (W - 2 * pad);
    const oldSy = (y: number) => pad + ((G - y) / span) * (H - 2 * pad);
    for (const v of [-7, -3, 0, 2.5, 6, 7]) {
      expect(sx(v)).toBeCloseTo(oldSx(v), 9);
      expect(sy(v)).toBeCloseTo(oldSy(v), 9);
    }
  });
  // systemsExplore: explicit ranges, pad 14
  it("matches the explicit-range scale", () => {
    const xMin = 0, xMax = 6, yMin = 0, yMax = 7, W = 300, H = 300, pad = 14;
    const { sx, sy } = gridScales({ xMin, xMax, yMin, yMax, W, H, pad });
    const oldSx = (vx: number) => pad + ((vx - xMin) / (xMax - xMin)) * (W - 2 * pad);
    const oldSy = (vy: number) => H - pad - ((vy - yMin) / (yMax - yMin)) * (H - 2 * pad);
    for (const v of [0, 2, 3, 6]) expect(sx(v)).toBeCloseTo(oldSx(v), 9);
    for (const v of [0, 2, 3, 7]) expect(sy(v)).toBeCloseTo(oldSy(v), 9);
  });
});

describe("integers", () => {
  it("is inclusive on both ends", () => {
    expect(integers(-2, 2)).toEqual([-2, -1, 0, 1, 2]);
    expect(integers(0, 6)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("samplePolyline", () => {
  it("samples a function and drops points outside the y-clip", () => {
    const s = samplePolyline((x) => x, 0, 10, (x) => x, (y) => y, { steps: 10 });
    expect(s.split(" ").length).toBe(11);
    const clipped = samplePolyline((x) => x, 0, 10, (x) => x, (y) => y, { steps: 10, yClip: [0, 5] });
    expect(clipped.split(" ").length).toBe(6); // y=0..5 only
  });
});
