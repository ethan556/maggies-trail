// @vitest-environment jsdom
/**
 * S329 — CL-P1-051 targeted regression: asv-01-01's `TriangleHalfRectangle` figure.
 *
 * figures.labelCollision.s238.test.tsx's corpus-wide ratchet only models TEXT-vs-TEXT
 * collisions (textBoxes.testkit.ts's collisions()); it has no notion of a label clipping past
 * its own <svg viewBox>, and no notion of a label overlapping a drawn SHAPE (a <polygon>
 * stroke, not a <text>). CL-P1-051 was exactly those two bug classes — the right-side "height"
 * label clipped past the viewBox, and the center caption sat on the hypotenuse — so this file
 * adds the two missing checks, scoped to this one figure, reusing the SAME box model
 * (textBoxes.testkit.ts's exact 0.72em/0.98em/0.28em constants) plus a Liang-Barsky
 * segment-vs-rect intersection test for the shape-crossing case. The hypotenuse is read from
 * the rendered DOM (not hardcoded coordinates), so this stays correct if the figure's geometry
 * changes later. See reports/closure/S329_CLOSURE_CL2.md for the full before/after numbers.
 */
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";
import { scanTextBoxes, collisions, describeCollision, type TextBox } from "./textBoxes.testkit";

/** Liang-Barsky segment-vs-axis-aligned-box intersection (parametric t in [0,1] on both axes). */
function segmentHitsBox(p0: [number, number], p1: [number, number], box: TextBox): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  return (
    clip(-dx, p0[0] - box.x0) &&
    clip(dx, box.x1 - p0[0]) &&
    clip(-dy, p0[1] - box.y0) &&
    clip(dy, box.y1 - p0[1])
  );
}

describe("figures.tsx — CL-P1-051 asv-01-01 triangle-half-rectangle (S329)", () => {
  it("every label stays inside the svg's own viewBox (no clip, at any render width)", () => {
    const F = FIGURES["triangle-half-rectangle"];
    expect(F, "triangle-half-rectangle left the registry").toBeDefined();
    const { container } = render(<F />);
    const svg = container.querySelector("svg")!;
    const viewBox = (svg.getAttribute("viewBox") ?? "").trim().split(/\s+/).map(Number);
    const [, , vbW, vbH] = viewBox;
    const { boxes, skipped } = scanTextBoxes(svg);
    cleanup();
    expect(skipped).toEqual([]);
    expect(boxes.length).toBe(3);
    for (const b of boxes) {
      expect(b.x0, `"${b.text}" left-clipped`).toBeGreaterThanOrEqual(0);
      expect(b.x1, `"${b.text}" right-clipped (viewBox width ${vbW})`).toBeLessThanOrEqual(vbW);
      expect(b.y0, `"${b.text}" top-clipped`).toBeGreaterThanOrEqual(0);
      expect(b.y1, `"${b.text}" bottom-clipped (viewBox height ${vbH})`).toBeLessThanOrEqual(vbH);
    }
  });

  it("zero text-vs-text collisions (the corpus ratchet's own check, asserted directly for this figure)", () => {
    const F = FIGURES["triangle-half-rectangle"];
    const { container } = render(<F />);
    const svg = container.querySelector("svg")!;
    const { boxes } = scanTextBoxes(svg);
    cleanup();
    expect(collisions(boxes).map(describeCollision)).toEqual([]);
  });

  it("no label overlaps the triangle's hypotenuse stroke", () => {
    const F = FIGURES["triangle-half-rectangle"];
    const { container } = render(<F />);
    const svg = container.querySelector("svg")!;
    // The stroked (outline, fill="none") triangle polygon's diagonal edge is the hypotenuse:
    // points = "bottom-left bottom-right top-right", so the diagonal is point[0] -> point[2].
    const strokedTriangle = Array.from(svg.querySelectorAll("polygon")).find(
      (p) => p.getAttribute("fill") === "none"
    );
    expect(strokedTriangle, "stroked (outline) triangle polygon").toBeTruthy();
    const pts = strokedTriangle!
      .getAttribute("points")!
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(",").map(Number) as [number, number]);
    expect(pts.length).toBe(3);
    const hypotenuse: [[number, number], [number, number]] = [pts[0], pts[2]];
    const { boxes } = scanTextBoxes(svg);
    cleanup();
    for (const b of boxes) {
      expect(segmentHitsBox(hypotenuse[0], hypotenuse[1], b), `hypotenuse crosses "${b.text}"`).toBe(false);
    }
  });
});
