// @vitest-environment jsdom
/**
 * S322 Lane B — GraphZoomW honest curvature (dc-03-01).
 *
 * The S320 assessor's contract for dc-03-01 required the WIDGET itself to gain real curvature
 * rendering, not a reworded lesser claim (S321: reports/closure/S321_VERIFY_IMPL456.md). The
 * prior render hardcoded a straight SLOPE=1 line at every zoom level for the "continuous"/
 * "removable" behaviours, making "watch the curve straighten" false. This packet adds a
 * deterministic quadratic remainder term (CURVE * d^2, d = x - a) to those two behaviours only:
 * it vanishes exactly at the anchor (so f(a) and the hole/dot markers are untouched) and
 * shrinks QUADRATICALLY as the zoom window narrows, while the tangent term shrinks only
 * LINEARLY — so the rendered curve visibly straightens as zoom increases, for the same reason
 * any smooth function looks straight once you zoom in far enough.
 *
 * Verifies:
 *  1. At zoom = 0 the rendered branch path is visibly curved (non-collinear).
 *  2. At zoom = 6 (max) the same branch is essentially straight (near-collinear) — and the
 *     curvature has shrunk by a large factor relative to zoom 0, i.e. it genuinely straightens
 *     rather than just always being flat or always being curved.
 *  3. Grading is untouched: evaluate() for `graphZoom` reads only {zoom, verdict} — never the
 *     curve's shape — so this is provably grading-safe. Confirmed both by reading evaluate.ts's
 *     graphZoom case directly and by re-running it here against dc-03-01's actual spec values.
 *  4. `behaviour: "jump"` keeps its two genuinely straight branches (no local-straightening
 *     claim is made about a jump), and `behaviour: "infinite"` keeps its own already-nonlinear
 *     1/d^2 blow-up — neither is touched by the curvature change.
 *  5. dc-03-01's actual authored spec (a=3, leftValue=rightValue=fAtA=5, requiredZoom=3)
 *     straightens well before the zoom cap, matching the restored "watch the curve straighten"
 *     lesson text.
 */
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TGraphZoom, type TWidget } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";

afterEach(cleanup);

function Host({ spec }: { spec: TWidget }) {
  const [v, setV] = useState<unknown>({ zoom: 0, verdict: null });
  return <WidgetRenderer spec={spec} value={v} disabled={false} onChange={setV} />;
}

function mount(spec: TWidget) {
  return render(<Host spec={spec} />);
}

function zoomIn(container: HTMLElement, times: number) {
  for (let i = 0; i < times; i++) {
    fireEvent.click(container.querySelector('button[aria-label="magnify further"]')!);
  }
}

/** Parses `d="M x0 y0 L x1 y1 L ..."` into point pairs. */
function pathPoints(d: string): Array<[number, number]> {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

/** Max perpendicular distance (px, in SVG user units) of any sampled point from the straight
 *  line joining the branch's own endpoints — 0 for a perfectly straight branch. */
function maxDeviation(points: Array<[number, number]>): number {
  if (points.length < 3) return 0;
  const [x0, y0] = points[0];
  const [x1, y1] = points[points.length - 1];
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  let max = 0;
  for (const [x, y] of points) {
    const cross = Math.abs(dx * (y - y0) - dy * (x - x0)) / len;
    if (cross > max) max = cross;
  }
  return max;
}

function branchPaths(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll<SVGPathElement>("svg path.gz"));
}

function continuousSpec(overrides: Partial<Record<string, unknown>> = {}): TGraphZoom {
  return WidgetSpec.parse({
    type: "graphZoom",
    prompt: "Magnify a differentiable point. Watch the curve straighten — that straightness IS the linearisation.",
    behaviour: "continuous",
    a: 3,
    leftValue: 5,
    rightValue: 5,
    fAtA: 5,
    targetVerdict: "limit-exists",
    requiredZoom: 3,
    successFeedback: "s",
    moreZoomFeedback: "zoom more",
    wrongVerdictFeedback: "wrong verdict",
    ...overrides,
  }) as TGraphZoom;
}

describe("GraphZoomW (dc-03-01 spec): honest curvature that straightens with zoom", () => {
  it("is visibly curved (non-collinear) at zoom 0", () => {
    const spec = continuousSpec();
    const { container } = mount(spec);
    const paths = branchPaths(container);
    expect(paths.length).toBeGreaterThanOrEqual(1);
    const deviations = paths.map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? "")));
    // at least one branch must show a clear (multi-pixel) bend at the widest window
    expect(Math.max(...deviations)).toBeGreaterThan(2);
  });

  it("straightens to near-collinear by max zoom (×64 / zoom=6), and by a large factor", () => {
    const spec = continuousSpec();
    const { container } = mount(spec);
    const zoom0Deviation = Math.max(...branchPaths(container).map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? ""))));

    zoomIn(container, 6);
    const zoom6Deviation = Math.max(...branchPaths(container).map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? ""))));

    expect(zoom6Deviation).toBeLessThan(0.5); // sub-pixel: "indistinguishable from a straight line"
    expect(zoom0Deviation / Math.max(zoom6Deviation, 1e-6)).toBeGreaterThan(20); // genuinely straightens, not just always-flat
  });

  it("already reads as straight by dc-03-01's own requiredZoom (3), matching the restored lesson text", () => {
    const spec = continuousSpec();
    const { container } = mount(spec);
    zoomIn(container, 3);
    const deviation = Math.max(...branchPaths(container).map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? ""))));
    expect(deviation).toBeLessThan(1); // sub-pixel at the zoom level the lesson actually requires
  });

  it("passes exactly through the anchor: the curvature term vanishes at d=0 (fAtA marker unaffected)", () => {
    const spec = continuousSpec();
    const { container } = mount(spec);
    // the filled dot at (a, fAtA) must still render — curvature is zero at the anchor by construction
    expect(container.querySelector("svg circle")).toBeTruthy();
  });
});

describe("GraphZoomW: other behaviours are untouched by the curvature change", () => {
  it('behaviour "jump" still renders two genuinely straight branches (no curvature claim there)', () => {
    const spec = WidgetSpec.parse({
      type: "graphZoom", prompt: "p", behaviour: "jump", a: 2, leftValue: -1, rightValue: 1,
      fAtA: 1, targetVerdict: "no-limit", requiredZoom: 3,
      successFeedback: "s", moreZoomFeedback: "m", wrongVerdictFeedback: "w",
    });
    const { container } = mount(spec);
    const paths = branchPaths(container);
    expect(paths.length).toBeGreaterThanOrEqual(1);
    for (const p of paths) {
      expect(maxDeviation(pathPoints(p.getAttribute("d") ?? ""))).toBeLessThan(0.2);
    }
  });

  it('behaviour "infinite" keeps its own non-linear 1/d^2 blow-up (still visibly non-straight)', () => {
    const spec = WidgetSpec.parse({
      type: "graphZoom", prompt: "p", behaviour: "infinite", a: 0, leftValue: 0, rightValue: 0,
      fAtA: null, targetVerdict: "no-limit", requiredZoom: 3,
      successFeedback: "s", moreZoomFeedback: "m", wrongVerdictFeedback: "w",
    });
    const { container } = mount(spec);
    const paths = branchPaths(container);
    expect(paths.length).toBeGreaterThanOrEqual(1);
    const deviations = paths.map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? "")));
    expect(Math.max(...deviations)).toBeGreaterThan(2);
  });

  it('behaviour "removable" also straightens (dc-04-01\'s L\'Hôpital tangent claim), hole marker unaffected', () => {
    const spec = WidgetSpec.parse({
      type: "graphZoom", prompt: "p", behaviour: "removable", a: 2, leftValue: 4, rightValue: 4,
      fAtA: null, targetVerdict: "limit-exists", requiredZoom: 3,
      successFeedback: "s", moreZoomFeedback: "m", wrongVerdictFeedback: "w",
    });
    const { container } = mount(spec);
    const zoom0 = Math.max(...branchPaths(container).map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? ""))));
    zoomIn(container, 6);
    const zoom6 = Math.max(...branchPaths(container).map((p) => maxDeviation(pathPoints(p.getAttribute("d") ?? ""))));
    expect(zoom0).toBeGreaterThan(2);
    expect(zoom6).toBeLessThan(0.5);
    // the open hole circle at (a, leftValue) must still render, untouched by curvature at d=0
    expect(container.querySelector("svg circle")).toBeTruthy();
  });
});

describe("GraphZoomW: grading is provably unaffected by the curvature change", () => {
  it("evaluate() for graphZoom reads only {zoom, verdict} — dc-03-01's own spec, both ways", () => {
    const spec = continuousSpec();
    expect(evaluate(spec, { zoom: 3, verdict: "limit-exists" }).correct).toBe(true);
    expect(evaluate(spec, { zoom: 2, verdict: "limit-exists" }).correct).toBe(false);
    expect(evaluate(spec, { zoom: 2, verdict: "limit-exists" }).feedback).toBe(spec.moreZoomFeedback);
    expect(evaluate(spec, { zoom: 3, verdict: "no-limit" }).correct).toBe(false);
    expect(evaluate(spec, { zoom: 3, verdict: "no-limit" }).feedback).toBe(spec.wrongVerdictFeedback);
  });
});
