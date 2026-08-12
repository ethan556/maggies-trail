// @vitest-environment jsdom
/**
 * S238 wave 10 — THE FIGURES LEDGER RATCHET (always-on).
 *
 * figuresCollision.s238.test.tsx (opt-in, FIGURE_SWEEP=1) MEASURES the ledger; this file
 * FREEZES it. The baseline below is the measured remainder — 188 figures still carrying
 * label collisions after wave 10 closed the ten worst by exposure (pairs × authored uses):
 * compound-event-tree, two-population-compare, si-claim-ladder, side-splitter,
 * si-study-types, probability-line, dr-tangent-line, ca-first-derivative-story,
 * dd-pipeline, in-ftc-slope-is-height — 45 pairs, all to zero.
 *
 * BASELINE SEMANTICS — a ratchet, exactly like the accessibleParity one:
 *   · a figure NOT in the baseline must render with ZERO colliding pairs — a new collision
 *     anywhere in the 1,871-figure registry fails immediately;
 *   · a listed figure may only get BETTER — more pairs than its baseline fails;
 *   · a listed figure that reaches zero must LEAVE the list — the stale-entry check fails
 *     until it does, so the baseline is always exactly the dirty set, never an archive.
 * Entries only ever leave. Do not add to this list to make a build pass.
 *
 * The box model's honesty rules apply (textBoxes.testkit.ts): rotated labels and tspans are
 * not modelled here — the opt-in sweep counts those per figure (156 corpus-wide) so nothing
 * goes quiet by becoming unmeasurable.
 */
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";
import { collisions, scanTextBoxes, describeCollision } from "./textBoxes.testkit";

const BASELINE = new Map<string, number>([
  ["angle-pairs", 1],
  ["approaching-e", 3],
  ["as-fact-family", 2],
  ["as100-odd-even", 1],
  ["as100-sub-tens-40", 1],
  ["avp-distance-definition", 1],
  ["avp-open-closed-circle", 2],
  ["avp-pick-branch-then-apply", 2],
  ["avp-right-side-decides", 2],
  ["avp-same-distance-different-side", 1],
  ["both-sides-scale", 1],
  ["bt-probability-expansion", 5],
  ["bt-theorem-line", 1],
  ["bv-three-diagnoses", 2],
  ["centroid", 1],
  ["cg-pair-terms", 1],
  ["chart-down-ten", 1],
  ["circle-equation-distance", 1],
  ["circumcenter", 1],
  ["cn-four-methods", 1],
  ["cnp-drawing-vs-proof", 1],
  ["co-conic-type", 5],
  ["co-parabola-def", 1],
  ["composition-path", 1],
  ["cpr-event-as-set", 5],
  ["cpr-indep-vs-disjoint", 1],
  ["cpr-permutation-slots", 2],
  ["cpr-row-vs-column", 1],
  ["cr-linear-vs-quadratic", 1],
  ["cross-sections", 1],
  ["dc-lhopital-tangents", 1],
  ["dc-speeding-up-signs", 2],
  ["dd-stat-question", 2],
  ["defined-terms-anatomy", 7],
  ["dilation-scale", 1],
  ["distance-right-triangle", 1],
  ["distribution-story", 1],
  ["dm-least-precise-wins", 2],
  ["dm-shape-outlier", 1],
  ["dop-order-matters", 1],
  ["dop-partial-products", 1],
  ["dop-remainder", 2],
  ["dop-standard-algo", 1],
  ["dpv-place-names", 1],
  ["dpv-round-whole", 2],
  ["dr-e-self-derivative", 1],
  ["dr-implicit-circle", 1],
  ["equation-solution-types", 3],
  ["esn8-zero-exponent", 3],
  ["ev-distribution-inventory", 4],
  ["ev-risk-outside-expectation", 4],
  ["ev-weighted-not-plain", 1],
  ["exp-mirror", 1],
  ["exponent-unfold", 2],
  ["extended-shapes", 2],
  ["extraneous-intersection", 2],
  ["fna-hlt", 1],
  ["fna-properties-anywhere", 2],
  ["fna-secant-aroc", 1],
  ["formula-rearrange", 1],
  ["ft-inverse-reversed-machine", 3],
  ["ft-inverse-swap", 1],
  ["g7-aaa-same-shape", 1],
  ["g7-perp-bisector-arcs", 1],
  ["gauss-pairing", 6],
  ["geo3-square-is-rect", 1],
  ["gf-figure-vs-measure", 1],
  ["gf-notation-hats", 1],
  ["halves-quarters", 1],
  ["hole-vs-asymptote", 1],
  ["hundred-more", 1],
  ["ia-strip-to-disc", 2],
  ["iar-dashed-solid-rule", 1],
  ["iar-name-the-failure", 1],
  ["iar-region-corners", 1],
  ["in-riemann-trap", 1],
  ["incenter", 1],
  ["inverse-reflection", 2],
  ["kite-diagonals", 1],
  ["lc-indeterminate", 5],
  ["lc-partial-sums", 1],
  ["lcd-clear", 1],
  ["lf-same-line", 1],
  ["line-intercepts", 1],
  ["line-plot", 3],
  ["magnitude-scale", 6],
  ["mc-classify-angles", 1],
  ["mc-length-ladder", 1],
  ["md3-lineplot", 3],
  ["mean-outlier-pull", 1],
  ["mult3-which-op", 2],
  ["near-double", 2],
  ["nls-horizontal-cases", 1],
  ["nls-no-phantom-here", 1],
  ["nls-substitute-recipe", 1],
  ["odometer-roll", 1],
  ["partition-ratio", 1],
  ["pc-polar-wedge", 1],
  ["percent-price", 2],
  ["perp-bisector-stage2", 1],
  ["perp-bisector-stage3", 1],
  ["perp-bisector-why", 1],
  ["perpendicular-rotation", 1],
  ["place-by-place-compare", 2],
  ["place-value-ladder", 1],
  ["pp-limacon", 1],
  ["pr-percent-change", 1],
  ["pr-which-on-top", 1],
  ["pr7-commission-split", 1],
  ["pr7-error-vs-size", 1],
  ["pr7-flat-fee", 1],
  ["pr7-interest-over-time", 1],
  ["pr7-k-three-ways", 1],
  ["pr7-point-1k", 5],
  ["pra-pipeline", 2],
  ["pv1000-placeholder-507", 1],
  ["pv3-borrow-zero", 1],
  ["pv3-jump", 2],
  ["pv4-carry-chain", 1],
  ["pv4-ladder", 2],
  ["pv4-round-place", 1],
  ["quad-family-tree", 1],
  ["ratio-groups", 1],
  ["regroup-bundle", 1],
  ["rigid-transformations", 1],
  ["rno-change-sign", 1],
  ["rno-opposites-cancel", 1],
  ["rno-same-sign", 2],
  ["rno7-add-diff-line", 7],
  ["rno7-add-same-line", 3],
  ["rno7-change-line", 1],
  ["rno7-sign-rules", 2],
  ["rno7-zero-pair", 3],
  ["rns-predict-decimal", 1],
  ["rns-rational-def", 1],
  ["sa7-lateral-shortcut", 1],
  ["sa7-many-correct-cuts", 1],
  ["sa7-same-rule-any-base", 1],
  ["sa7-triangular-prism-parts", 2],
  ["sa7-units-squared", 1],
  ["sample-to-population", 2],
  ["sc-taylor-hug-peel", 2],
  ["se-graph-cross", 2],
  ["shape-attributes", 1],
  ["si-accuracy-precision", 4],
  ["si-confounding", 2],
  ["si-effect-vs-significance", 1],
  ["si-empirical-rule", 1],
  ["si-margin-band", 1],
  ["si-moe-vs-n", 1],
  ["si-null-pile", 1],
  ["sigma-anatomy", 3],
  ["smg1-half-ways", 1],
  ["smg1-pizza-share", 1],
  ["sohcahtoa-triangle", 2],
  ["solid-shapes", 2],
  ["sp-gap-vs-wobble", 2],
  ["sp-overlap", 1],
  ["sp-same-gap-different-verdict", 1],
  ["sp7-prob-scale", 1],
  ["sp7-tree", 2],
  ["square-vs-cube-solutions", 1],
  ["ssa-ambiguous", 2],
  ["ssg2-thirds-vs-fourths", 1],
  ["substitution-flow", 4],
  ["sy-dilation-parallel", 1],
  ["synthetic-division", 1],
  ["tangent-radius", 1],
  ["thales-right-angle", 1],
  ["ti-six-functions", 1],
  ["ti-twin-ladder", 2],
  ["tm8-reflect-rule", 1],
  ["tno-add-tens-66", 1],
  ["tno-add-tens-85", 1],
  ["tno-digits-72", 1],
  ["tno-sub-tens-50", 1],
  ["transversal-angles", 1],
  ["tse-balance-same-both", 1],
  ["tse-undo-order-track", 2],
  ["tse7-factor-gcf-choice", 1],
  ["tse7-factor-two-ways", 1],
  ["unbundle-break", 1],
  ["undefined-terms-trio", 3],
  ["vec-components", 1],
  ["vec-compose", 4],
  ["vec-dot-angle", 3],
  ["vec-tiptotail", 1],
  ["vm-line-plot-read", 3],
]);

describe("figures.tsx label collisions — the ratchet", () => {
  it("no figure outside the baseline collides; listed figures only get better; fixed ones leave", () => {
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

  it("the ten wave-10 fixes hold at exactly zero, by name", () => {
    // Redundant with the ratchet above, but named: these are the fixes this wave shipped,
    // and a regression should say so rather than reporting a generic baseline violation.
    for (const id of [
      "compound-event-tree", "two-population-compare", "si-claim-ladder", "side-splitter",
      "si-study-types", "probability-line", "dr-tangent-line", "ca-first-derivative-story",
      "dd-pipeline", "in-ftc-slope-is-height"
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
