// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { PointSetReasoningLabSpec } from "@/lib/schema";

/**
 * S237 — WHAT THE unitRate TASK ACTUALLY DRAWS.
 *
 * The schema gate next door proves the arithmetic. This one exists because the first render was
 * wrong in two ways a green schema gate could never see, and both were found by printing the SVG
 * and reading it:
 *
 *   1. THE POINT LANDED IN THE CORNER. With one plotted point the domain is exactly [0, x] by
 *      [0, y], so the dot mapped to the top-right corner, its "(4, 20)" label ran past the 440-unit
 *      viewBox, and the ray stopped dead at the dot — drawing a segment to a point rather than a
 *      relationship that continues. Headroom is asserted here as a POSITION, because "it has a
 *      ray" was true of the broken version too.
 *   2. THE RAY IS THE WHOLE POINT. A lone dot is not a proportional graph. The line through the
 *      origin is what makes "y ÷ x is the same everywhere on this line" visible, and it is the
 *      figure the lesson prose already names ("proportional-line").
 *
 * The negative case matters as much: ten other tasks share this component and must scale exactly
 * as they did before, so pointRead on the same points is asserted to have NO ray and to keep the
 * unpadded corner placement.
 */

const base = {
  type: "pointSetReasoningLab" as const, answerMode: "numeric" as const,
  prompt: "The graphed point (4, 20) represents a car trip. What is the rate?",
  xLabel: "hours", yLabel: "miles", answerUnit: "miles per hour",
  sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "the plotted point", x: 4, y: 20 }] }],
  targetSetId: "trip", targetPointId: "p1",
  choices: [], numericErrors: [], authoredStages: [],
  requiredStageKeys: [], requiredExplorations: 1,
  successFeedback: "Yes — 20 miles over 4 hours is 5 miles per hour.",
  explorationFeedback: "Read the point and divide before checking.",
  fallbackFeedback: "20 divided by 4 is 5.", tolerance: 0,
};

function svgOf(spec: unknown) {
  const { container } = render(<WidgetRenderer spec={spec as never} value={null} onChange={() => {}} disabled={false} />);
  const svg = container.querySelector("svg")!;
  const ray = svg.querySelector("[data-testid='point-set-ray']");
  const circle = svg.querySelector("circle")!;
  const label = svg.querySelector("g text");
  const out = {
    ray: ray && { x1: Number(ray.getAttribute("x1")), y1: Number(ray.getAttribute("y1")), x2: Number(ray.getAttribute("x2")), y2: Number(ray.getAttribute("y2")) },
    cx: Number(circle.getAttribute("cx")), cy: Number(circle.getAttribute("cy")),
    labelX: label ? Number(label.getAttribute("x")) : null,
    aria: svg.getAttribute("aria-label") ?? "",
  };
  cleanup();
  return out;
}

describe("S237 unitRate renders a proportional line", () => {
  const rate = svgOf(PointSetReasoningLabSpec.parse({ ...base, task: "unitRate" }));
  const read = svgOf(PointSetReasoningLabSpec.parse({ ...base, task: "pointRead", targetAxis: "y" }));

  it("draws a ray that starts at the origin", () => {
    expect(rate.ray).not.toBeNull();
    // The x-axis sits at sy(0) and the y-axis at sx(0); the ray must begin exactly where they meet,
    // not at the plot's bottom-left corner, or it stops meaning "through the origin".
    expect(rate.ray!.x1).toBe(45);
    expect(rate.ray!.y1).toBe(215);
  });

  it("the ray passes THROUGH the point and continues past it", () => {
    // Continuing past is the assertion that failed on the first draft. Colinearity is checked
    // rather than assumed: the dot must lie on the segment, not merely near its end.
    const { x1, y1, x2, y2 } = rate.ray!;
    const t = (rate.cx - x1) / (x2 - x1);
    expect(t).toBeGreaterThan(0.5);
    expect(t).toBeLessThan(1); // strictly inside — the ray extends beyond the dot
    expect(y1 + t * (y2 - y1)).toBeCloseTo(rate.cy, 6);
  });

  it("the coordinate label fits inside the viewBox", () => {
    // "(4, 20)" at 13px bold is roughly 55 units wide. In the corner-placed version the label
    // started at 405 of 440 and ran off the card.
    expect(rate.labelX!).toBeLessThan(440 - 60);
  });

  it("says so in the accessible name", () => {
    expect(rate.aria).toContain("straight line runs from the origin");
    expect(read.aria).not.toContain("straight line");
  });

  it("SELF-CHECK: the other ten tasks are unchanged — no ray, no headroom", () => {
    expect(read.ray).toBeNull();
    // Unpadded, the same point maps to the far corner: sx = 45 + 350 = 395, sy = 215 - 170 = 45.
    // If this ever equals the unitRate position, the headroom leaked into every task.
    expect([read.cx, read.cy]).toEqual([395, 45]);
    expect([rate.cx, rate.cy]).not.toEqual([395, 45]);
  });
});
