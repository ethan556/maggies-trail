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
 * COVERAGE IS PARTIAL AND THE LIST IS EXPLICIT. The 17 engines below share the
 * `viewBox={`0 0 ${W} ${H}`}` shape, so a caption can be placed from values already in scope. The
 * remainder do not, each for its own reason (PointEntryW is square-scaled off `S`; DerivativeTraceW
 * stacks three panels into a composite height; QuadDragW is `W`×`W`), and each needs a placement
 * decision rather than a mechanical insert. They are listed in
 * COWORK_CACHE/axis-label-worklist-s237.csv, and four more — unitCircleExplore, polarTrace,
 * vectorExplore, matrixTransform — are abstract planes where naming the axes needs a ruling, not a
 * patch. This test asserts what is done; it does not pretend the sweep is finished.
 */

const TOUCHED = [
  "distanceGrid", "graphZoom", "expLogExplore", "secantSlope", "riemannSum", "slopeField",
  "taylorApprox", "slopeTriangle", "affineRelationshipLab", "scatterFit", "extraneousRootLab",
  "transformExplore", "systemsExplore", "lineExplore", "coordinateProofLab", "verticalLineScanner",
  "covariationScrubber",
] as const;

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
        if (typeof record.type === "string" && (TOUCHED as readonly string[]).includes(record.type) && !authored.has(record.type)) {
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
