// @vitest-environment jsdom
/**
 * S316 regression guard for a production P0 defect in `UnitRulerW` (src/components/widgets.tsx):
 * with zero aligned and N unit-size-1 units placed exactly, the COVERED readout and the finish
 * marker printed `objectStart + N` (an absolute axis coordinate) instead of `N` (the length
 * actually covered), and the placed unit blocks / object bar were drawn from `objectStart`
 * instead of from the ruler's zero once "Align zero" was pressed.
 *
 * Root cause: `finish = (zeroAligned ? spec.objectStart : 0) + covered + ...` added the object's
 * absolute start coordinate on top of the covered length, then displayed `finish` under the
 * label "covered". For the shipped smg1-03-01/i1 step (objectStart=1, objectEnd=6,
 * requiredPlacements=5, targetUnitSize=1), 5 exact placements covers 5, but the readout showed
 * `finish.toFixed(1)` = "6.0".
 *
 * Fix: "Align zero" now moves the shared measurement origin to 0 for BOTH the unit track and the
 * object bar (`origin = zeroAligned ? 0 : spec.objectStart`), and the "covered" readout shows the
 * physical span from that origin (`covered`), not the mixed absolute coordinate.
 *
 * This is a display-only fix. `evaluate.ts`'s `unitRuler` case grades purely on
 * `{zeroAligned, spacing, unitSize, placements}` — it never reads `finish` or `covered` — so this
 * change cannot flip any authored answer (proven independently in evaluate's own test suite).
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer as WidgetView } from "./widgets";
import type { TUnitRuler } from "@/lib/schema";

afterEach(cleanup);

// Mirrors the shipped step content/courses/shapes-measure-g1/lessons/smg1-03-01.json#i1 exactly
// (the "Which Is Longer?" pencil step from the production screenshot).
const SPEC: TUnitRuler = {
  type: "unitRuler",
  prompt: "Measure the pencil. Align zero, use one-paperclip units, and cover it with five units exactly.",
  objectStart: 1,
  objectEnd: 6,
  allowedUnitSizes: [1, 2],
  targetUnitSize: 1,
  startUnitSize: 2,
  requiredPlacements: 5,
  commonPlacements: [],
  successFeedback: "Five equal paperclip units cover the pencil exactly, so its length is 5 paperclips.",
  alignFeedback: "Start the first unit at the pencil’s starting end.",
  gapOverlapFeedback: "Every paperclip unit must touch the next without gaps or overlaps.",
  unitFeedback: "Use one-paperclip units so the count is in paperclips."
};

function Host() {
  const [v, setV] = useState<unknown>(null);
  return <WidgetView spec={SPEC} value={v} disabled={false} onChange={(x: unknown) => setV(x)} />;
}

describe("S316 unitRuler geometry — align zero, five 1-unit placements", () => {
  it("COVERED reads the length covered (5.0), not objectStart + covered (6.0)", () => {
    const { container } = render(<Host />);

    fireEvent.click(screen.getByRole("button", { name: /Align zero/i }));
    fireEvent.click(screen.getByRole("button", { name: /^unit 1$/i }));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: /Place unit/i }));

    // "true length" and "units placed" were already correct pre-fix; assert them for completeness.
    expect(screen.getByText("true length").parentElement?.textContent).toContain("5");
    expect(screen.getByText("units placed").parentElement?.textContent).toContain("5/5");

    // The bug: this used to render "6.0" (objectStart=1 + covered=5).
    const coveredLabel = screen.getByText("covered");
    expect(coveredLabel.parentElement?.textContent).toContain("5.0");
    expect(coveredLabel.parentElement?.textContent).not.toContain("6.0");

    // The finish marker text in the SVG must match — same origin, same value.
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.textContent).toContain("finish 5.0");
    expect(svg.textContent).not.toContain("finish 6.0");
  });

  it("finish marker (x-tick position) sits at the covered length, at axis coordinate 5, not 6", () => {
    const { container } = render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: /Align zero/i }));
    fireEvent.click(screen.getByRole("button", { name: /^unit 1$/i }));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: /Place unit/i }));

    const svg = container.querySelector("svg") as SVGSVGElement;
    // x(n) = 24 + n*16 per widgets.tsx's UnitRulerW scale function.
    const xAt = (n: number) => 24 + n * 16;
    const markerLine = svg.querySelector('text[y="128"]');
    expect(markerLine?.getAttribute("x")).toBe(String(xAt(5)));
    expect(markerLine?.getAttribute("x")).not.toBe(String(xAt(6)));
  });

  it("object bar is drawn at exactly trueLength axis units, from the same origin as the placed units (0, once aligned)", () => {
    const { container } = render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: /Align zero/i }));
    fireEvent.click(screen.getByRole("button", { name: /^unit 1$/i }));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: /Place unit/i }));

    const svg = container.querySelector("svg") as SVGSVGElement;
    const xAt = (n: number) => 24 + n * 16;
    const trueLength = SPEC.objectEnd - SPEC.objectStart; // 5

    // The object bar: the thick tangerine line drawn with strokeWidth 12.
    const objectBar = svg.querySelector('line[stroke-width="12"]');
    expect(objectBar).toBeTruthy();
    const x1 = Number(objectBar!.getAttribute("x1"));
    const x2 = Number(objectBar!.getAttribute("x2"));
    expect(x2 - x1).toBe(xAt(trueLength) - xAt(0)); // width == trueLength * axis unit scale
    expect(x1).toBe(xAt(0)); // starts at the same origin as the units (0, once zero is aligned)

    // The first placed unit block must start at that same origin.
    const firstUnitBlock = svg.querySelector('rect[y="82"]');
    expect(firstUnitBlock).toBeTruthy();
    expect(Number(firstUnitBlock!.getAttribute("x"))).toBe(xAt(0));
  });

  it("before alignment, the object bar and units stay at their unaligned authored position (objectStart), not silently at 0", () => {
    const { container } = render(<Host />);
    // No "Align zero" click — st.zeroAligned stays false.
    fireEvent.click(screen.getByRole("button", { name: /^unit 1$/i }));
    fireEvent.click(screen.getByRole("button", { name: /Place unit/i }));

    const svg = container.querySelector("svg") as SVGSVGElement;
    const xAt = (n: number) => 24 + n * 16;
    const objectBar = svg.querySelector('line[stroke-width="12"]');
    expect(Number(objectBar!.getAttribute("x1"))).toBe(xAt(SPEC.objectStart));
  });
});
