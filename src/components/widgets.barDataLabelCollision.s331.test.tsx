// @vitest-environment jsdom
/* S331 — label collisions in the `barData` display figure (`BarChartFigure`, widgets.tsx).
 *
 * THE SAME FAILURE MODE BarBuilderW HAD, IN THE FIGURE NOBODY GATED. `BarChartFigure` shrinks its
 * category font to fit the column but floors it at 7 ("below that it stops being text"), which
 * means past ~7 columns the floor wins and a name can be WIDER than its own column: eight 6-char
 * names at size 7 are 30.24 units wide (0.72em per character, the S237 testkit's measured box
 * model) against a 28.5-unit column — an overlap no font this side of the floor can clear.
 * `widgets.labelCollision.s237.test.tsx` gates barBuilder, numberLineHop and numberLinePlace but
 * never covered the barData figure; this file closes that gap with the same box model, for the
 * S331 port of BarBuilderW's `catLabelPlan` row-stagger.
 *
 * Per that gate's own rule, every rejection is paired with an acceptance: the stagger must not
 * fix overlap by dropping labels, and a layout that already fits on one row must keep its exact
 * historical baseline (y = 193) and canvas (H = 220) — the port's "preserve current rendering"
 * contract, asserted rather than assumed.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

afterEach(cleanup);

/** A minimal mcq host — mcq renders `barData` through the same `barDataParts` → `BarChartFigure`
 * path as numeric/matchPairs/dragOrder/dragBucket, and mounts with a null value. */
function mcqWith(barData: Record<string, unknown>): TWidget {
  return WidgetSpec.parse({
    type: "mcq",
    prompt: "p",
    options: [
      { id: "a", label: "A", correct: true, feedback: "right, and here is why" },
      { id: "b", label: "B", feedback: "a computed misconception, named in full" }
    ],
    barData
  }) as TWidget;
}

function figureScan(barData: Record<string, unknown>) {
  const { container } = render(
    <WidgetRenderer spec={mcqWith(barData)} value={null} onChange={() => {}} disabled={false} tone="neutral" />
  );
  const svg = container.querySelector('[data-testid="bar-chart-figure"]');
  expect(svg, "the figure must draw").toBeTruthy();
  const scan = scanTextBoxes(svg!);
  const cats = Array.from(svg!.querySelectorAll('[data-testid="bar-chart-category"]'));
  const viewBox = svg!.getAttribute("viewBox");
  cleanup();
  return { ...scan, cats, viewBox };
}

describe("S331 label collisions — the barData figure", () => {
  it("eight named columns stagger onto rows instead of overlapping, dropping nothing", () => {
    const { boxes, skipped, cats, viewBox } = figureScan({
      categories: ["Pack 1", "Pack 2", "Pack 3", "Pack 4", "Pack 5", "Pack 6", "Pack 7", "Pack 8"],
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      axisMax: 8,
      scaleStep: 2,
      axisLabel: "packs"
    });
    // The rotated value-axis caption is the one transform the box model refuses by design — the
    // exact carve-out widgets.labelCollision.s237.test.tsx makes for barBuilder's.
    expect(skipped.filter((s) => !s.includes("non-translate transform"))).toEqual([]);
    const hits = collisions(boxes);
    expect(hits.map(describeCollision), hits.map(describeCollision).join("\n")).toEqual([]);
    // Acceptance: all eight names still render, on more than one row, on a canvas grown to fit.
    expect(cats.map((c) => c.textContent)).toHaveLength(8);
    expect(new Set(cats.map((c) => c.getAttribute("y"))).size).toBeGreaterThan(1);
    const h = Number(viewBox!.split(" ")[3]);
    expect(h).toBeGreaterThan(220);
  });

  it("a layout that fits on one row keeps the exact historical baseline and canvas", () => {
    const { boxes, skipped, cats, viewBox } = figureScan({
      categories: ["Cats", "Dogs", "Fish"],
      values: [3, 5, 2],
      axisMax: 6,
      scaleStep: 1
    });
    expect(skipped.filter((s) => !s.includes("non-translate transform"))).toEqual([]);
    expect(collisions(boxes)).toEqual([]);
    // Preserve-current-rendering: row 0 is baseY + 13 = 193, and the canvas stays 320 × 220.
    expect(cats.map((c) => c.getAttribute("y"))).toEqual(["193", "193", "193"]);
    expect(viewBox).toBe("0 0 320 220");
  });
});
