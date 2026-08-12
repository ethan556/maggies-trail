// @vitest-environment jsdom
/**
 * S238 waves 10–14 — THE FIGURES LEDGER RATCHET (always-on).
 *
 * figuresCollision.s238.test.tsx (opt-in, FIGURE_SWEEP=1) MEASURES the ledger; this file
 * FREEZES it. Waves 10–13 closed the worst 78 figures by exposure (pairs × authored uses):
 * 352 → 307 → 267 → 197 → 137 pairs. Wave 14 closed the ENTIRE 120-figure remainder in
 * three chunks: 137 → 99 → 68 → 0. The ledger is CLOSED: the baseline is empty, and every
 * one of the 1,871 registered figures must render with ZERO colliding text pairs. A new
 * collision anywhere in the registry fails immediately. Do not reintroduce a baseline to
 * make a build pass — fix the figure.
 *
 * The box model's honesty rules apply (textBoxes.testkit.ts): rotated labels and tspans are
 * not modelled here — the opt-in sweep counts those per figure (156 corpus-wide) so nothing
 * goes quiet by becoming unmeasurable.
 */
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";
import { collisions, scanTextBoxes, describeCollision } from "./textBoxes.testkit";

const BASELINE = new Map<string, number>([]);

describe("figures.tsx label collisions — the ratchet", () => {
  it("every registered figure renders with zero colliding pairs (ledger closed, wave 14)", () => {
    const worse: string[] = [];
    const stale: string[] = [];
    let measured = 0;
    for (const [id, F] of Object.entries(FIGURES)) {
      const { container } = render(<F />);
      let pairs = 0;
      const details: string[] = [];
      for (const svg of Array.from(container.querySelectorAll("svg"))) {
        const { boxes } = scanTextBoxes(svg);
        const hits = collisions(boxes);
        pairs += hits.length;
        details.push(...hits.slice(0, 2).map(describeCollision));
      }
      cleanup();
      measured++;
      const allowed = BASELINE.get(id) ?? 0;
      if (pairs > allowed) worse.push(`${id}: ${pairs} pairs (baseline ${allowed}) — ${details.join(" | ")}`);
      if (pairs === 0 && BASELINE.has(id)) stale.push(id);
    }
    expect(measured).toBeGreaterThan(1000);
    expect(worse, "a figure got WORSE or a clean figure started colliding").toEqual([]);
    expect(stale, "these figures are FIXED — remove them from the baseline so the ratchet tightens").toEqual([]);
  }, 300_000);

  it("the seventy-eight wave-10/11/12/13 fixes hold at exactly zero, by name", () => {
    // Redundant with the ratchet above, but named: these are the fixes this wave shipped,
    // and a regression should say so rather than reporting a generic baseline violation.
    for (const id of [
      "compound-event-tree", "two-population-compare", "si-claim-ladder", "side-splitter",
      "si-study-types", "probability-line", "dr-tangent-line", "ca-first-derivative-story",
      "dd-pipeline", "in-ftc-slope-is-height",
      "ia-strip-to-disc", "dpv-round-whole", "line-plot", "magnitude-scale",
      "equation-solution-types", "lc-indeterminate", "sample-to-population", "dop-remainder",
      "line-intercepts", "si-accuracy-precision", "sc-taylor-hug-peel", "dr-e-self-derivative",
      "mult3-which-op", "substitution-flow", "dr-implicit-circle",
      "rno7-add-diff-line", "rno7-add-same-line", "rno7-zero-pair", "rno7-change-line",
      "defined-terms-anatomy", "cpr-permutation-slots", "dc-speeding-up-signs", "vec-dot-angle",
      "quad-family-tree", "extended-shapes", "percent-price", "md3-lineplot", "gauss-pairing",
      "sohcahtoa-triangle", "cpr-event-as-set", "si-null-pile", "co-conic-type", "pr7-point-1k",
      "bt-probability-expansion", "cpr-indep-vs-disjoint", "si-confounding",
      "si-effect-vs-significance", "dc-lhopital-tangents",
      "vec-compose", "solid-shapes", "place-by-place-compare", "rno-same-sign",
      "dd-stat-question", "pv4-round-place", "pv3-jump", "rigid-transformations",
      "dilation-scale", "ev-distribution-inventory", "ev-risk-outside-expectation",
      "sp-gap-vs-wobble", "si-margin-band", "in-riemann-trap", "vm-line-plot-read",
      "halves-quarters", "pv3-borrow-zero", "distribution-story", "transversal-angles",
      "approaching-e", "sigma-anatomy", "angle-pairs", "undefined-terms-trio",
      "ft-inverse-reversed-machine", "esn8-zero-exponent", "cpr-row-vs-column",
      "pc-polar-wedge", "se-graph-cross", "as-fact-family", "pra-pipeline"
    ]) {
      const F = FIGURES[id];
      expect(F, `${id} left the registry`).toBeDefined();
      const { container } = render(<F />);
      for (const svg of Array.from(container.querySelectorAll("svg"))) {
        const { boxes } = scanTextBoxes(svg);
        expect(collisions(boxes).map(describeCollision), id).toEqual([]);
      }
      cleanup();
    }
  });

  it("the hundred-and-twenty wave-14 fixes hold at exactly zero, by name", () => {
    // The entire former baseline — wave 14's three chunks emptied it. Named so a regression
    // says which fix broke rather than reporting a generic ratchet violation.
    for (const id of [
      "as100-odd-even", "as100-sub-tens-40", "avp-distance-definition", "avp-open-closed-circle",
      "avp-pick-branch-then-apply", "avp-right-side-decides", "avp-same-distance-different-side", "both-sides-scale",
      "bt-theorem-line", "bv-three-diagnoses", "centroid", "cg-pair-terms",
      "chart-down-ten", "circle-equation-distance", "circumcenter", "cn-four-methods",
      "cnp-drawing-vs-proof", "co-parabola-def", "composition-path", "cr-linear-vs-quadratic",
      "cross-sections", "distance-right-triangle", "dm-least-precise-wins", "dm-shape-outlier",
      "dop-order-matters", "dop-partial-products", "dop-standard-algo", "dpv-place-names",
      "ev-weighted-not-plain", "exp-mirror", "exponent-unfold", "extraneous-intersection",
      "fna-hlt", "fna-properties-anywhere", "fna-secant-aroc", "formula-rearrange",
      "ft-inverse-swap", "g7-aaa-same-shape", "g7-perp-bisector-arcs", "geo3-square-is-rect",
      "gf-figure-vs-measure", "gf-notation-hats", "hole-vs-asymptote", "hundred-more",
      "iar-dashed-solid-rule", "iar-name-the-failure", "iar-region-corners", "incenter",
      "inverse-reflection", "kite-diagonals", "lc-partial-sums", "lcd-clear",
      "lf-same-line", "mc-classify-angles", "mc-length-ladder", "mean-outlier-pull",
      "near-double", "nls-horizontal-cases", "nls-no-phantom-here", "nls-substitute-recipe",
      "odometer-roll", "partition-ratio", "perp-bisector-stage2", "perp-bisector-stage3",
      "perp-bisector-why", "perpendicular-rotation", "place-value-ladder", "pp-limacon",
      "pr-percent-change", "pr-which-on-top", "pr7-commission-split", "pr7-error-vs-size",
      "pr7-flat-fee", "pr7-interest-over-time", "pr7-k-three-ways", "pv1000-placeholder-507",
      "pv4-carry-chain", "pv4-ladder", "ratio-groups", "regroup-bundle",
      "rno-change-sign", "rno-opposites-cancel", "rno7-sign-rules", "rns-predict-decimal",
      "rns-rational-def", "sa7-lateral-shortcut", "sa7-many-correct-cuts", "sa7-same-rule-any-base",
      "sa7-triangular-prism-parts", "sa7-units-squared", "shape-attributes", "si-empirical-rule",
      "si-moe-vs-n", "smg1-half-ways", "smg1-pizza-share", "sp-overlap",
      "sp-same-gap-different-verdict", "sp7-prob-scale", "sp7-tree", "square-vs-cube-solutions",
      "ssa-ambiguous", "ssg2-thirds-vs-fourths", "sy-dilation-parallel", "synthetic-division",
      "tangent-radius", "thales-right-angle", "ti-six-functions", "ti-twin-ladder",
      "tm8-reflect-rule", "tno-add-tens-66", "tno-add-tens-85", "tno-digits-72",
      "tno-sub-tens-50", "tse-balance-same-both", "tse-undo-order-track", "tse7-factor-gcf-choice",
      "tse7-factor-two-ways", "unbundle-break", "vec-components", "vec-tiptotail",
    ]) {
      const F = FIGURES[id];
      expect(F, `${id} left the registry`).toBeDefined();
      const { container } = render(<F />);
      for (const svg of Array.from(container.querySelectorAll("svg"))) {
        const { boxes } = scanTextBoxes(svg);
        expect(collisions(boxes).map(describeCollision), id).toEqual([]);
      }
      cleanup();
    }
  });
});
