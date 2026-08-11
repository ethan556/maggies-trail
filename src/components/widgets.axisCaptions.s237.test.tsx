// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

/**
 * S237 — A COORDINATE PLANE SAYS WHAT ITS AXES MEASURE.
 *
 * Reported from the app alongside the unlabelled number line. Measured across the registry: 94
 * widget types draw an SVG, 32 of them draw a coordinate plane, and 28 of those named neither
 * axis. Numeric ticks are a SEPARATE property and a separate defect — they say where you are, not
 * what is being measured — so engines like coordinateProofLab drew full tick loops on both edges
 * while still leaving the plane anonymous.
 *
 * COVERAGE, AND WHAT IS DELIBERATELY LEFT. 23 engines are captioned across two batches — 17 that
 * share the `viewBox={`0 0 ${W} ${H}`}` shape, then 6 more placed individually from whatever each
 * component actually had in scope. Two were examined and correctly left alone (see below), and
 * four remain OPEN pending a ruling rather than a patch: unitCircleExplore, polarTrace,
 * vectorExplore and matrixTransform draw abstract planes where "what does x measure?" may have no
 * honest answer. This test asserts what is done and names what is not; it does not imply the sweep
 * is finished. The full list is COWORK_CACHE/axis-label-worklist-s237.csv.
 */

const TOUCHED = [
  "distanceGrid", "graphZoom", "expLogExplore", "secantSlope", "riemannSum", "slopeField",
  "taylorApprox", "slopeTriangle", "affineRelationshipLab", "scatterFit", "extraneousRootLab",
  "transformExplore", "systemsExplore", "lineExplore", "coordinateProofLab", "verticalLineScanner",
  "covariationScrubber",
  // Second batch: non-uniform viewBoxes, each placed from what that component actually has in
  // scope (a square S, a W-by-W box, a composite stacked height, two literals).
  "quadDrag", "rotationLab", "relatedRatesLab", "quadraticExplore",
  // Third batch: the four that were held for a ruling. vectorExplore and matrixTransform are
  // ordinary Cartesian planes — the vectors and the unit square live in x-y, so x/y is honest.
  // unitCircleExplore plots a wave against ANGLE, so it gets angle°/value: calling its horizontal
  // axis "x" would name the wrong quantity, which is worse than naming nothing.
  "vectorExplore", "matrixTransform", "unitCircleExplore",
] as const;

/**
 * polarTrace is DELIBERATELY BARE, and that is the ruling rather than an omission. It draws a
 * polar curve in a Cartesian projection: the quantities the learner manipulates are r and θ, but
 * the horizontal and vertical directions on screen are not r and θ — they are the projection.
 * Captioning them "x"/"y" would name axes the lesson never asks about, and captioning them
 * "r"/"θ" would be false. The honest answer for this one engine is silence.
 */
const BARE_BY_RULING = ["polarTrace"] as const;

/**
 * X-AXIS ONLY, DELIBERATELY. A stacked plot shares one x-axis but gives each panel its own y
 * meaning — derivativeTrace stacks f, f′ and f″; accumulateArea stacks the curve over the running
 * area. A single y caption at the outer edge would name the top panel and silently mislabel the
 * rest, so these pass y="" and keep naming their panels in their own titles.
 */
const X_ONLY = ["derivativeTrace", "accumulateArea"] as const;

/**
 * NOT CAPTIONED, AND THE WORKLIST WAS WRONG ABOUT THEM. The automated classification counted any
 * multi-line SVG as a coordinate plane, which over-counted twice:
 *   pointEntry      — its "plane" is a 96px thumbnail that only appears once a point is entered,
 *                     already aria-hidden. Captioning a preview swatch is clutter, not clarity.
 *   dilationExplore — dispatches to DilationScaleW / AltitudeMeanW / SideSplitterW, which draw
 *                     similar triangles and side-splitter figures. No axes exist to name; only
 *                     quadraticExplore's two sub-components reference sx(0)/sy(0) and are real
 *                     planes.
 * Found by checking each for an axis-at-zero reference rather than trusting the class column.
 */

const authored = new Map<string, TWidget>();
(function walk(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".json")) {
      let parsed: unknown;
      try { parsed = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
      (function rec(node: unknown) {
        if (!node || typeof node !== "object") return;
        const record = node as Record<string, unknown>;
        if (typeof record.type === "string" && [...TOUCHED, ...X_ONLY].includes(record.type as never) && !authored.has(record.type)) {
          const spec = WidgetSpec.safeParse(record);
          if (spec.success) authored.set(record.type, spec.data as TWidget);
        }
        for (const value of Object.values(record)) rec(value);
      })(parsed);
    }
  }
})("content");

function captionsOf(spec: TWidget): string[] | null {
  const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
  const group = container.querySelector("[data-testid='axis-captions']");
  const labels = group ? Array.from(group.querySelectorAll("text")).map((n) => (n.textContent ?? "").trim()) : null;
  cleanup();
  return labels;
}

describe("S237 axis captions", () => {
  it("every touched engine has an authored spec to test against", () => {
    const missing = TOUCHED.filter((t) => !authored.has(t));
    expect(missing).toEqual([]);
  });

  it("each names both axes with something non-empty", () => {
    const bare: string[] = [];
    for (const type of TOUCHED) {
      const labels = captionsOf(authored.get(type)!);
      if (!labels || labels.length !== 2 || labels.some((l) => !l)) bare.push(`${type}: ${JSON.stringify(labels)}`);
    }
    expect(bare).toEqual([]);
  });

  it("stacked plots name the shared x-axis and correctly leave y alone", () => {
    for (const type of X_ONLY) {
      const spec = authored.get(type);
      if (!spec) continue;
      expect(captionsOf(spec), type).toEqual(["x"]);
    }
  });

  it("captions are decorative — they add nothing to the accessible name", () => {
    // The engines already state their axes in describeState; a stray "x" in the accessible tree
    // would be noise, and worse, could collide with a single-letter answer.
    for (const type of TOUCHED.slice(0, 6)) {
      const { container } = render(
        <WidgetRenderer spec={authored.get(type)!} value={null} onChange={() => {}} disabled={false} />
      );
      const group = container.querySelector("[data-testid='axis-captions']");
      expect(group?.getAttribute("aria-hidden"), type).toBe("true");
      cleanup();
    }
  });

  it("unitCircleExplore names the angle, not x", () => {
    const spec = authored.get("unitCircleExplore");
    if (spec) expect(captionsOf(spec)).toEqual(["angle°", "value"]);
  });

  it("polarTrace stays bare on purpose", () => {
    // Asserted so a future sweep does not "finish the job" by captioning it. See the note above.
    const specs: TWidget[] = [];
    (function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (file.endsWith(".json")) {
          let parsed: unknown;
          try { parsed = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
          (function rec(node: unknown) {
            if (!node || typeof node !== "object") return;
            const record = node as Record<string, unknown>;
            if (record.type === BARE_BY_RULING[0]) {
              const spec = WidgetSpec.safeParse(record);
              if (spec.success) specs.push(spec.data as TWidget);
            }
            for (const value of Object.values(record)) rec(value);
          })(parsed);
        }
      }
    })("content");
    for (const spec of specs.slice(0, 3)) expect(captionsOf(spec)).toBeNull();
  });

  it("an engine that authors axis meanings uses them, not x and y", () => {
    // covariationScrubber carries inputLabel/outputLabel. Defaulting it to x/y would have been
    // less honest than leaving it bare — the plane is hours against dollars, not x against y.
    const specs: TWidget[] = [];
    (function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (file.endsWith(".json")) {
          let parsed: unknown;
          try { parsed = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
          (function rec(node: unknown) {
            if (!node || typeof node !== "object") return;
            const record = node as Record<string, unknown>;
            if (record.type === "covariationScrubber") {
              const spec = WidgetSpec.safeParse(record);
              if (spec.success) specs.push(spec.data as TWidget);
            }
            for (const value of Object.values(record)) rec(value);
          })(parsed);
        }
      }
    })("content");
    expect(specs.length).toBeGreaterThan(1);
    for (const spec of specs) {
      const s = spec as Extract<TWidget, { type: "covariationScrubber" }>;
      expect(captionsOf(spec)).toEqual([s.inputLabel, s.outputLabel]);
    }
  });
});
