// THE RESOLVER GATE.
//
// The alias table is the only thing standing between a generated algebra prompt and a Grade-2
// learner. It is hand-written, and hand-written tables rot: a tag gets renamed in content, a
// generator gets removed, someone adds an entry from a name-similarity hunch. Each failure below is
// silent in production — the swap just happens, and the learner sees a problem from the wrong course.
//
// So every entry is re-derived from disk here rather than trusted:
//
//   TARGET EXISTS   every alias points at a generator that is actually in the registry
//   NOT SHADOWED    no alias key is itself a generator tag (the entry would be dead code)
//   TAG IS REAL     every alias key appears on an authored step (catches typos and content drift)
//   GRADE MATCHES   no alias crosses into a K-5 course, where these generators do not belong
//   IT GRADES       the aliased variant's answer is marked right and every trap is marked wrong
//   STILL DETERMINISTIC  same (tag, seed) is stable, and two tags sharing a generator diverge
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { CONCEPT_ALIASES, VARIANT_GENERATORS, hasVariants, resolveGeneratorTag, variantFor, variantForStep } from "./variants";
import type { VariantForm } from "./variants";
import { WidgetSpec } from "./schema";

const GEN_TAGS = new Set(VARIANT_GENERATORS.map((g) => g.tag));
const ALIASES: Array<[string, string, VariantForm]> = Object.entries(CONCEPT_ALIASES).map(([tag, a]) =>
  typeof a === "string" ? [tag, a, "default"] : [tag, a.gen, a.form]
);
const FORMS = new Map(VARIANT_GENERATORS.map((g) => [g.tag, new Set<VariantForm>(["default", ...(g.forms ?? [])])]));

/** Every (conceptTag → course) pairing on disk, read fresh so content drift shows up here. */
function authoredTags(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const root = "content/courses";
  const walk = (dir: string, course: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, course);
      else if (e.name.endsWith(".json")) {
        let parsed: { steps?: Array<{ conceptTag?: string }> };
        try {
          parsed = JSON.parse(readFileSync(p, "utf8")) as typeof parsed;
        } catch {
          continue;
        }
        for (const s of parsed.steps ?? []) {
          if (!s.conceptTag) continue;
          if (!out.has(s.conceptTag)) out.set(s.conceptTag, new Set());
          out.get(s.conceptTag)!.add(course);
        }
      }
    }
  };
  for (const c of readdirSync(root, { withFileTypes: true })) {
    if (c.isDirectory()) walk(join(root, c.name), c.name);
  }
  return out;
}

/** Which band each generator belongs to. The first version of this guard simply banned every alias
 * from reaching an early-years course, which was right while every generator was Grade 7+ — and
 * wrong the moment a K-2 clock generator arrived. Banning a band is a proxy; the real rule is that a
 * generator must not fire in a course from a band it was not written for, in EITHER direction. An
 * algebra prompt in front of a six-year-old and a clock face in front of an Algebra 2 student are the
 * same defect. */
/** Read the band off each course's declared gradeLevel rather than guessing from its directory name.
 * The name-pattern version of this shipped for one commit and immediately missed `counting-to-20-k`,
 * a Kindergarten course whose slug matches none of the obvious prefixes — the guard caught it, but a
 * guard that depends on naming conventions is one rename away from silently passing. K-2 is the
 * boundary because that is where the manipulative generators live. */
function courseBands(): Map<string, "early" | "later"> {
  const out = new Map<string, "early" | "later">();
  for (const c of readdirSync("content/courses", { withFileTypes: true })) {
    if (!c.isDirectory()) continue;
    let grade = 99;
    try {
      grade = (JSON.parse(readFileSync(join("content/courses", c.name, "course.json"), "utf8")) as { gradeLevel?: number })
        .gradeLevel ?? 99;
    } catch {
      /* a course without a manifest is treated as later — the stricter default */
    }
    out.set(c.name, grade <= 2 ? "early" : "later");
  }
  return out;
}
const GENERATOR_BAND: Record<string, "early" | "later"> = {
  // Session 101: sixty tags had accumulated without a band declaration across the manifest
  // batches (g0–g4 early-grades, a1/a2, g10/g12/g13, and two core tags). K–2 manifests are
  // "early"; every grade-4+ family is "later".
  "fraction-scaling": "later",
  "decimal-representation": "later",
  "g0-counting": "early",
  "k0-add-subtract": "early",
  "k0-count-100": "early",
  "g0-shapes-sorting": "early",
  "g1-add-subtract": "early",
  "g1-data": "early",
  "g3-mult-fluency": "later",
  "g3-div-fluency": "later",
  "g1-counting-120": "early",
  "g1-shapes-measure": "early",
  "g1-tens-ones": "early",
  "g2-add-subtract-100": "early",
  "g2-fluency": "early",
  "g2-measure-money-time": "early",
  "g2-place-value-1000": "early",
  "g2-shapes-shares": "early",
  "g4-fractions": "later",
  "g4-decimals": "later",
  "g4-lines-angles": "later",
  "g4-measure": "later",
  "g4-multiply": "later",
  "g4-place-million": "later",
  "a1-exponential": "later",
  "a1-polynomials": "later",
  "a1-functions-sequences": "later",
  "a1-linear-functions": "later",
  "a1-quadratics": "later",
  "a1-radicals": "later",
  "a1-solving-equations": "later",
  "a1-systems": "later",
  "a2-complex": "later",
  "a2-transformations": "later",
  "a2-logarithms": "later",
  "a2-polynomials": "later",
  "a2-radicals": "later",
  "a2-rationals": "later",
  "a2-series": "later",
  "a2-statistics": "later",
  "a2-trig": "later",
  "g10-circle-theorems": "later",
  "g10-constructions-proof": "later",
  "g10-coordinate-proofs": "later",
  "g10-geometry-foundations": "later",
  "g10-polygons-quadrilaterals": "later",
  "g10-right-triangles": "later",
  "g10-similarity": "later",
  "g10-solid-geometry": "later",
  "g10-triangle-congruence": "later",
  "g12-conic-sections": "later",
  "g12-function-analysis": "later",
  "g12-limits-continuity": "later",
  "g12-polar-parametric": "later",
  "g12-polynomial-rational-analysis": "later",
  "g12-trig-graphs-inverses": "later",
  "g12-trig-identities-equations": "later",
  "g12-vectors-matrices": "later",
  "g13-curve-analysis": "later",
  "g13-derivative-rules": "later",
  "g13-derivatives-in-context": "later",
  "g13-differential-equations": "later",
  "g13-integration-accumulation": "later",
  "g13-integration-applications": "later",
  "g13-parametric-polar-calculus": "later",
  "g13-series-convergence": "later",
  "g10-conditional-probability": "later",
  "time-set-clock": "early",
  "count-on-line": "early",
  "place-compare": "early",
  "coin-total": "early",
  "probability-fraction": "later",
  "repeat-decimal": "later",
  "neg-rational-exp": "later",
  "unit-frac-divide": "later",
  "fraction-meaning": "later",
  "whole-times-fraction": "later",
  "frac-sign-ops": "later",
  "decimal-place-value": "later",
  "unit-rate-frac": "later",
  "line-plot-frac": "later",
  "hyperbola-anatomy": "later",
  "hyperbola-cab": "later",
  "sci-compute": "later",
  "coordinate-plot": "later",
  "proportional-plot": "later",
  "back-substitute": "later",
  "point-transform": "later",
  "vec-displacement": "later",
  "matrix-apply": "later",
  "reflect-compose": "later",
  "critical-count": "later",
  "evt-candidates": "later",
  "second-deriv-eval": "later",
  "rolle-c": "later",
  "mvt-c": "later",
  "mvt-bound": "later",
  "end-behavior": "later",
  "opt-setup": "later",
  "opt-box": "later",
  "trig-deriv": "later",
  "inverse-deriv": "later",
  "second-deriv-poly": "later",
  "implicit-diff": "later",
  "const-sum-rule": "later",
  "choose-rule": "later",
  "arc-measure": "later",
  "array-model": "early",
  "share-division": "early",
  "missing-factor": "early",
  "triangle-area-calc": "later",
  "secant-slope": "later",
  "conditional-prob": "later",
  "tree-chain": "later",
  "permutation-count": "later",
  "extrema-value": "later",
  "composite-tri": "later",
  "even-odd-classify": "later",
  "vertical-shift": "later",
  "combined-shift": "later",
  "trig-inside": "later",
  "add-like-denom": "early",
  "box-surface-area": "later",
  "association-type": "later",
  "double-angle-solve": "later",
  "domain-restrict": "later",
  "to-polar": "later",
  "chord-perp": "later",
  "parent-functions": "later",
  "times-five-ten": "early",
  "solve-trig-all": "later",
  "box-volume": "later",
  "line-of-fit": "later",
  "set-ops": "later",
  "hop-multiply": "early",
  "unknown-letter": "early",
  "reasonableness": "early",
  "round-half": "early",
  "equal-parts": "early",
  "nl-partition": "early",
  "nl-fraction": "early",
  "equivalent-fractions": "early",
  "whole-as-fraction": "early",
  "compare-same-denom": "early",
  "same-whole": "early",
  "mult-meaning": "early",
  "times-2": "early",
  "double-double": "early",
  "commutativity": "early",
  "distributive": "early",
  "op-choice": "early",
  "unknown-position": "early",
  "addition-patterns": "early",
  "mult-patterns": "early",
  "read-clock": "early",
  "elapsed-time": "early",
  "volume": "early",
  "perimeter": "early",
  "missing-side": "early",
  "pictograph": "early",
  "bar-graph": "early",
  "line-plot": "early",
  "tiling": "early",
  "area-multiply": "early",
  "area-distributive": "early",
  "area-vs-perimeter": "early",
  "time-relative": "early",
  "mass": "early",
  "compare-same-num": "early",
  "unit-size": "early",
  "equiv-models": "early",
  "nl-beyond-one": "early",
  "nl-unit": "early",
  "build-fraction": "early",
  "estimation": "early",
  "unit-fraction": "early",
  "num-denom": "early",
  "attributes": "early",
  "quadrilaterals": "early",
  "shape-hierarchy": "early",
  "sorting-rules": "early",
  "non-examples": "early",
  "partition-shapes": "early",
  "parts-as-fractions": "early",
  "place-value": "early",
  "expanded-form": "early",
  "compare-numbers": "early",
  "unit-trading": "early",
  "mental-add": "early",
  "regroup-add": "early",
  "regroup-sub": "early",
  "estimate-check": "early",
  "mult-tens": "early",
  "zero-pattern": "early",
  "tens-problems": "early",
  "round-ten": "early",
  "round-hundred": "early",
  "parity": "early",
  "identity-zero": "early",
  "addition-rule": "later",
  "two-way-table": "later",
  "fraction-volume": "later",
  "times-nine": "early",
  "stretch-scale": "later",
  "chord-dist": "later",
  "range-floor": "later",
  "scatter-features": "later",
  "prism-surface-area": "later",
  "subtract-like-denom": "early",
  "reflect-fn": "later",
  "horizontal-shift": "later",
  "step-function": "later",
  "composite-multi": "later",
  "piecewise-eval": "later",
  "combination-count": "later",
  "independence-def": "later",
  "independence-test": "later",
  "count-prob": "later",
  "multiplication-rule": "later",
  "rate-interpret": "later",
  "area-formula-pick": "later",
  "lshape-decompose": "later",
  "fact-family": "early",
  "group-division": "early",
  "skip-count": "early",
  "inscribed-angle": "later",
  "thales-right-angle": "later",
  "full-sketch": "later",
  "conic-classify": "later",
  "circle-complete": "later",
  "conic-general": "later",
  "ecc-classify": "later",
  "directrix-ecc": "later",
  "orbit-ecc": "later",
  "rect-measure": "later",
  "angle-sum": "later",
  "metric-convert": "later",
  "round-place": "later",
  "inverse-pipeline": "later",
  "subtract-within-20": "early",
  "subtract-within-100": "early",
  "polygon-angles": "later",
  "circle-sector": "later",
  "avg-rate-change": "later",
  "limit-laws": "later",
  "arith-series": "later",
  "geo-series": "later",
  "sigma-eval": "later",
  "deriv-product": "later",
  "deriv-quotient": "later",
  "deriv-explog": "later",
  "eval-expression": "later",
  "variable-meaning": "later",
  "linear-predict": "later",
  "lcm-pair": "later",
  "pythagorean": "later",
  "power-ten-exponent": "later",
  "exp-function": "later",
  "exp-solve": "later",
  "power-product": "later",
  "poly-read": "later",
  "poly-addsub": "later",
  "poly-mul-mono": "later",
  "decimal-align-addsub": "early",
  "decimal-mul-places": "early",
  "decimal-shift-divide": "early",
  "grouping-first": "early",
  "estimate-round": "early",
  "common-denom": "early",
  "fraction-of": "early",
  "remainder-word": "early",
  "equiv-test": "early",
  "solve-mult-div": "early",
  "negative-intro": "early",
  "decimal-compute": "early",
  "fn-evaluate": "later",
  "partial-products": "early",
  "two-row-multiply": "early",
  "long-div-2digit": "early",
  "ladder-shift": "early",
  "order-decimals": "early",
  "measure-word": "early",
  "graph-read": "early",
  "area-compose": "early",
  "fn-arith-seq": "later",
  "coord-distance": "later",
  "coord-midpoint": "later",
  "coord-perimeter": "later",
  "coord-area-box": "later",
  "gf-segment-add": "later",
  "gf-angle-add": "later",
  "pq-para-side": "later",
  "pq-para-angle": "later",
  "pq-rhombus": "later",
  "pq-trapezoid": "later",
  "pq-kite": "later",
  "two-step-order": "early",
  "make-ten-choice": "early",
  "multiple-test": "early",
  "grid-count": "early",
  "ten-frame-fill": "early",
  "root-solve": "later",
  "make-ten-sum": "early",
  "sequence-order": "early",
  "sr-recursive": "later",
  "parabola-focal": "later",
  "compare-groups": "early",
  "compare-numerals": "early",
  "shape-identify": "early",
  "prob-fraction": "later",
  "match-sum": "early",
  "match-object-shape": "early",
  "match-solve": "later",
  "match-parity": "early",
  "match-times-ten": "early",
  "parabola-shifted": "later",
  "ellipse-axes": "later",
  "ellipse-abc": "later",
  "cn-i-def": "later",
  "cn-square": "later",
  "cn-cts-solve": "later",
  "cn-cts-vertex": "later",
  "cn-i-powers": "later",
  "cn-add-sub": "later",
  "cn-multiply": "later",
  "cn-conjugate": "later",
  "cn-disc-repeat": "later",
  "cn-sum-product": "later",
  "cn-solve-any": "later",
  "event-sort": "later",
  "seq-recursive": "later",
  "complex-i-square": "later",
  "trig-model": "later",
  "fn-inverse-rule": "later",
  "two-step-arith": "early",
  "two-step-solve": "later",
  "multiple-find": "early",
  "sci-notation": "later",
  "base-ten-build": "early",
  "fraction-benchmark": "early",
  "mixed-convert": "early",
  "radian-convert": "later",
  "quad-shape-area": "later",
  "angle-equation": "later",
  "frac-unlike-addsub": "early",
  "frac-multiply": "early",
  "length-compare": "early",
  "eq-two-step": "later",
  "int-subtract-negative": "later",
  "pct-of-number": "later",
  "lf-slope-two-points": "later",
  "sys-two-linear": "later",
  "dr-power-rule": "later",
  "dr-chain-rule": "later",
  "in-definite-power": "later",
  "g7-read-scale": "later",
  "g7-scale-to-actual": "later",
  "g7-scaled-area": "later",
  "g7-circle-parts": "later",
  "g7-circumference": "later",
  "g7-circle-area": "later",
  "g7-vertical-angles": "later",
  "g7-triangle-inequality": "later",
  "composite-area-lab": "later",
  "g7-cross-sections": "later",
  "pr-unit-rate-g7": "later",
  "pr-test-proportional-g7": "later",
  "pr-constant-k-g7": "later",
  "pr-graph-rate-g7": "later",
  "pr-add-percent-g7": "later",
  "pr-price-adjust-g7": "later",
  "pr-percent-change-g7": "later",
  "g7-signed-addition": "later",
  "g7-signed-multiply-divide": "later",
  "g7-signed-decimal-add": "later",
  "g7-mixed-rational": "later",
  "g7-tse-expression-build": "later",
  "g7-tse-evaluate-distribution": "later",
  "g7-tse-context-equation": "later",
  "g7-tse-balance-solve": "later",
  "g7-tse-inequality-build": "later",
  "g7-sp-sample-estimate": "later",
  "g7-sp-sampling-bias": "later",
  "g7-sp-sample-reliability": "later",
  "g7-sp-gap-units": "later",
  "g6-data-literacy": "later",
  "g6-center-spread": "later",
  "g7-sp-overlap-interpret": "later",
  "g7-sp-likelihood-words": "later",
  "g7-sp-counting-principle": "later",
  "g7-sp-compound-model": "later",
  "g7-complementary": "later",
  "g8-esn-power-meaning": "later",
  "g8-esn-place-value": "later",
  "g8-esn-root-context": "later",
  "g8-esn-compare": "later",
  "g8-esn-context-compute": "later",
  "g8-rns-decimal-classify": "later",
  "g8-rns-root-classify": "later",
  "g8-rns-density": "later",
  "g8-rns-root-estimate": "later",
  "g8-rns-compare-estimate": "later",
  "g8-tm-triangle-exterior": "later",
  "g8-tm-pythagorean-why": "later",
  "g8-tm-rigid-motion": "later",
  "g8-tm-congruence": "later",
  "g8-tm-dilation-similarity": "later",
  "g8-tm-transversal": "later",
  "g8-tm-angle-angle": "later",
  "g8-tm-pythagorean-converse": "later",
  "g8-tm-cylinder-volume": "later",
  "g8-tm-cone-volume": "later",
  "g8-tm-sphere-volume": "later",
  "g8-les-isolate-variable": "later",
  "g8-les-distribute-solve": "later",
  "g8-les-solution-count": "later",
  "g8-les-system-meaning": "later",
  "g8-les-system-graphing": "later",
  "g8-les-system-count": "later",
  "g8-les-substitution-method": "later",
  "g8-les-system-verify": "later",
  "g8-les-systems-word": "later",
  "g8-fn-function-definition": "later",
  "g8-fn-vertical-line": "later",
  "g8-fn-rate-of-change": "later",
  "g8-fn-constant-slope": "later",
  "g8-fn-initial-value": "later",
  "g8-fn-same-function-forms": "later",
  "g8-fn-compare-rates": "later",
  "g8-fn-compare-full": "later",
  "g8-fn-compare-context": "later",
  "g8-fn-linear-nonlinear": "later",
  "g8-fn-qualitative-graphs": "later",
  "g8-fn-graph-stories": "later",
  "g8-bv-scatter-basics": "later",
  "g8-bv-outlier-impact": "later",
  "g8-bv-fit-idea": "later",
  "g8-bv-judge-fit": "later",
  "g8-bv-interpret": "later",
  "g8-bv-prediction-limits": "later",
  "g8-bv-relative-frequency": "later",
  "g8-bv-categorical-association": "later",
};

/** Every step in the corpus that declares its own generator. Item-level declaration is content, so
 * a typo in a lesson file is a content bug that no type system catches — these gates are the only
 * thing standing between a mistyped form and an item that silently stops refreshing. */
function declaredSteps(): Array<{ file: string; id: string; surface: string; decl: { gen: string; form?: string } }> {
  const out: Array<{ file: string; id: string; surface: string; decl: { gen: string; form?: string } }> = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!e.name.endsWith(".json")) continue;
      let j: { steps?: Array<{ id: string; widget?: { type?: string }; variant?: { gen: string; form?: string } }> };
      try {
        j = JSON.parse(readFileSync(p, "utf8"));
      } catch {
        continue;
      }
      for (const st of j.steps ?? []) {
        if (st.variant && st.widget?.type) out.push({ file: e.name, id: st.id, surface: st.widget.type, decl: st.variant });
      }
    }
  };
  walk(join(process.cwd(), "content", "courses"));
  return out;
}

describe("item-level variant declarations", () => {
  const declared = declaredSteps();

  it("names a generator that exists, and a form that generator implements", () => {
    for (const d of declared) {
      const g = VARIANT_GENERATORS.find((x) => x.tag === d.decl.gen);
      expect(g, `${d.file}/${d.id}: no generator named ${d.decl.gen}`).toBeDefined();
      if (d.decl.form && d.decl.form !== "default") {
        expect(g!.forms ?? [], `${d.file}/${d.id}: ${d.decl.gen} does not implement form ${d.decl.form}`).toContain(
          d.decl.form
        );
      }
    }
  });

  it("produces the SAME widget surface the step was authored on", () => {
    // The whole point of declaring per step is to refresh a manipulative in its own surface. A
    // declaration that yields a different type is worse than none: variantForStep declines it, so the
    // author gets silence instead of freshness.
    for (const d of declared) {
      const v = variantForStep({ widget: { type: d.surface }, variant: d.decl }, `decl:${d.file}:${d.id}`);
      expect(v, `${d.file}/${d.id}: declared ${d.decl.gen} but it does not serve ${d.surface}`).not.toBeNull();
      expect(v!.widget.type).toBe(d.surface);
    }
  });

  it("is deterministic: the same seed always rebuilds the same problem", () => {
    for (const d of declared) {
      const a = variantForStep({ widget: { type: d.surface }, variant: d.decl }, `s:${d.file}:${d.id}`);
      const b = variantForStep({ widget: { type: d.surface }, variant: d.decl }, `s:${d.file}:${d.id}`);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("is FRESH: varying the seed varies the problem", () => {
    // Two steps in one lesson that declare the same generator and form receive the same problem on
    // the same seed — correctly, that is determinism. Distinctness is the SEED's job: both call sites
    // key it per item (`${roundSeed}:${item.key}`, `${ri.key}:${ri.box}:${today}`). This asserts the
    // generator actually responds to that, because a generator that ignores its seed would look
    // perfectly deterministic and be perfectly useless.
    for (const d of declared) {
      const seen = new Set<string>();
      for (let i = 0; i < 12; i++) {
        const v = variantForStep({ widget: { type: d.surface }, variant: d.decl }, `fresh:${d.id}:${i}`);
        if (v) seen.add(JSON.stringify(v.widget));
      }
      expect(seen.size, `${d.file}/${d.id}: ${d.decl.gen} ignores its seed`).toBeGreaterThan(3);
    }
  });
});

describe("variant resolver", () => {
  it("every alias points at a generator that exists", () => {
    for (const [tag, target] of ALIASES) {
      expect(GEN_TAGS.has(target), `${tag} → ${target} (no such generator)`).toBe(true);
    }
  });

  it("no alias key is shadowed by a generator of the same name", () => {
    for (const [tag] of ALIASES) {
      expect(GEN_TAGS.has(tag), `${tag} is already a generator tag — the alias is dead`).toBe(false);
    }
  });

  it("every alias key is a conceptTag that actually exists in authored content", () => {
    const authored = authoredTags();
    for (const [tag] of ALIASES) {
      expect(authored.has(tag), `${tag} is aliased but appears on no authored step`).toBe(true);
    }
  });

  it("every generator is declared with a band", () => {
    for (const g of VARIANT_GENERATORS) {
      expect(GENERATOR_BAND[g.tag], `${g.tag} has no band declared`).toBeTypeOf("string");
    }
  });

  it("no alias fires in a course from the wrong band", () => {
    const authored = authoredTags();
    const bands = courseBands();
    for (const [tag, target] of ALIASES) {
      const want = GENERATOR_BAND[target];
      for (const course of authored.get(tag) ?? []) {
        const courseBand = bands.get(course) ?? "later";
        expect(courseBand, `${tag} → ${target} (${want}) would fire in ${course} (${courseBand})`).toBe(want);
      }
    }
  });

  it("every alias asks for a form its generator actually implements", () => {
    for (const [tag, target, form] of ALIASES) {
      expect(FORMS.get(target)?.has(form), `${tag} → ${target} wants form "${form}", which it cannot emit`).toBe(true);
    }
  });

  it("resolves aliases and leaves exact generator tags alone", () => {
    expect(resolveGeneratorTag("tse-solve-two-step")).toEqual({ gen: "eq-two-step", form: "default" });
    expect(resolveGeneratorTag("eq-two-step")).toEqual({ gen: "eq-two-step", form: "default" });
    expect(resolveGeneratorTag("rno-decimal-subtract")).toEqual({
      gen: "int-subtract-negative",
      form: "decimal",
    });
    expect(resolveGeneratorTag("ca-mvt-consequences")).toBeNull();
    expect(hasVariants("percent-of")).toBe(true);
    expect(hasVariants("two-step")).toBe(false); // Grade 2 word problems — explicitly rejected
  });

  it("grades every aliased variant: answer right, every trap wrong", () => {
    for (const [tag] of ALIASES) {
      for (let s = 0; s < 40; s++) {
        const v = variantFor(tag, `resolver:${s}`);
        expect(v, `${tag} resolved to nothing`).not.toBeNull();
        const w = WidgetSpec.parse(v!.widget);
        expect(evaluate(w, v!.answer).correct, `${tag} seed ${s}: answer marked wrong`).toBe(true);
        if (w.type !== "numeric") continue; // manipulatives carry slots, not a distractor value list
        const errs = "commonErrors" in w ? (w.commonErrors ?? []) : [];
        for (const e of errs) {
          expect(
            evaluate(w, e.value).correct,
            `${tag} seed ${s}: trap ${e.value} is marked CORRECT — it is not a trap, it is a bug`
          ).toBe(false);
        }
      }
    }
  });

  it("recomputes every FORM's answer along an independent route", () => {
    // The 400-seed gate in variants.test.ts exercises each generator's DEFAULT form only — it calls
    // variantFor(g.tag), which resolves to "default" every time. The forms reached through aliases
    // would otherwise ship ungated, so they get the same dual-route treatment here: the generator
    // solves algebraically, this solves by exhaustive search over the integers, and the two must agree.
    const bruteForce = (holds: (x: number) => boolean): number => {
      for (let x = -400; x <= 400; x++) if (holds(x)) return x;
      throw new Error("no integer solution — the generated equation is unsolvable");
    };
    // Returns the probability as a decimal so it can share the numeric comparison below; the exact
    // rational is re-checked by value in variants.test.ts. All three surfaces the generator emits are
    // handled here, because the main gate only ever exercises a generator's DEFAULT form — every one
    // of these is reached through an alias and would otherwise ship with no independent route at all.
    const probFromPrompt = (p: string): number => {
      const rel = p.match(/(\d+) times? out of (\d+) spins/);
      if (rel) return Number(rel[1]) / Number(rel[2]);
      const sec = p.match(/(\d+) equal sections, (\d+) of them/);
      if (sec) return Number(sec[2]) / Number(sec[1]);
      // Compound: price each named event independently of the generator's own table.
      const P: Array<[RegExp, number]> = [
        [/greater than 4 on a die/, 2 / 6],
        [/even number on a die/, 3 / 6],
        [/less than 3 on a die/, 2 / 6],
        [/heads on a coin/, 1 / 2],
        [/red card from a deck/, 1 / 2],
        [/a 6 on a die/, 1 / 6],
      ];
      const parts = p.split(" AND ");
      return parts.reduce((acc, part) => acc * P.find(([re]) => re.test(part))![1], 1);
    };
    /** Rounding by half-up on scaled INTEGERS, stated as its own rule rather than delegating to
     * Math.round — the point of a second route is that it can disagree. */
    const roundFromPrompt = (p: string): number => {
      const m = p.match(/Round \$?([\d,.]+) to the nearest ([\w-]+)/)!;
      const thousandths = Math.round(Number(m[1].replace(/,/g, "")) * 1000);
      const dp = m[2] === "whole" ? 0 : m[2] === "tenth" ? 1 : 2;
      const unit = Math.pow(10, 3 - dp); // how many thousandths in one place-unit
      const q = Math.floor(thousandths / unit);
      const rem = thousandths - q * unit;
      const up = rem * 2 >= unit ? 1 : 0;
      return ((q + up) * unit) / 1000;
    };
    /** a \u2212 b, found by counting UP from b until a is reached. Slow on purpose: it is the
     * definition of a difference, not a restatement of the minus sign. */
    const subFromPrompt = (p: string): number => {
      const m = p.match(/^(\d+) \u2212 (\d+) =/)!;
      const [a, b] = [Number(m[1]), Number(m[2])];
      let n = 0;
      for (let v = b; v < a; v++) n++;
      return n;
    };
    const checks: Record<string, (p: string) => number | string> = {
      // a(x ± c) = d
      "tse-parens-solve": (p) => {
        const m = p.match(/(-?\d+)\(x ([−+]) (\d+)\) = (-?\d+)/)!;
        const [a, sign, c, d] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
        const cc = sign === "−" ? -c : c;
        return bruteForce((x) => a * (x + cc) === d);
      },
      // ax ± b = c with a < 0
      "tse-solve-negative-coeff": (p) => {
        const m = p.match(/(-?\d+)x ([−+]) (\d+) = (-?\d+)/)!;
        const [a, sign, b, c] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
        const bb = sign === "−" ? -b : b;
        return bruteForce((x) => a * x + bb === c);
      },
      // a − (−b) over decimals: compare in hundredths so the check itself cannot drift on floats.
      "rno-decimal-subtract": (p) => {
        const m = p.match(/(-?[\d.]+) − \(−([\d.]+)\)/)!;
        return (Math.round(Number(m[1]) * 100) + Math.round(Number(m[2]) * 100)) / 100;
      },
      // Probability, re-derived from the prompt's own counts. The sweep in variants.test.ts only ever
      // calls form "default", so relFreq, mixed and compound are reached ONLY through their aliases —
      // without these three they would ship with no independent route at all. sp-theoretical-prob IS
      // the default form and is already swept; it is listed anyway so the alias path itself is covered
      // and so nobody has to remember which of the four is the default one.
      "sp-theoretical-prob": (p) => probFromPrompt(p),
      "sp-relative-freq": (p) => probFromPrompt(p),
      "sp-mixed-prob": (p) => probFromPrompt(p),
      "sp-compound-prob": (p) => probFromPrompt(p),
      // The nine forms the four Grade 3-5 generators reach only through aliases. Each is re-derived
      // here by a route deliberately unlike both the generator AND the default-form check in
      // variants.test.ts — brute force where the generator uses a formula, a common-base table where
      // it uses a step factor.
      "area-formula": (p) => {
        const m = p.match(/(\d+) units long and (\d+) units wide/)!;
        return Number(m[1]) * Number(m[2]);
      },
      "area-perimeter-word-problems": (p) => {
        const m = p.match(/(\d+) (?:units|m) long and (\d+) (?:units|m) wide/)!;
        const [L, W] = [Number(m[1]), Number(m[2])];
        // Count the edge by walking it, rather than applying 2(L+W).
        return /area/.test(p) ? L * W : [L, W, L, W].reduce((a, b) => a + b, 0);
      },
      "additive-angles": (p) => [...p.matchAll(/(\d+)°/g)].reduce((a, m) => a + Number(m[1]), 0),
      "missing-angle": (p) => {
        const given = [...p.matchAll(/(\d+)°/g)].reduce((a, m) => a + Number(m[1]), 0);
        const whole = /right angle/.test(p) ? 90 : 180;
        return bruteForce((x) => x + given === whole);
      },
      "multistep-convert": (p) => {
        const BASE: Record<string, number> = {
          kilometer: 1000, meter: 1, centimeter: 0.01, millimeter: 0.001, liter: 1000, milliliter: 1,
        };
        const m = p.match(/^([\d.]+) (\w+)s = how many (\w+)s\?$/)!;
        return Math.round(((Number(m[1]) * BASE[m[2]]) / BASE[m[3]]) * 1e6) / 1e6;
      },
      "round-to-whole": (p) => roundFromPrompt(p),
      "round-any-decimal-place": (p) => roundFromPrompt(p),
      // The seven alias-only subtraction forms. Every one is re-derived by ADDING UP from the
      // subtrahend — the inverse operation — so neither the generator's arithmetic nor the column
      // routine in variants.test.ts is repeated here.
      "count-back": (p) => subFromPrompt(p),
      "difference": (p) => subFromPrompt(p),
      "sub-facts": (p) => subFromPrompt(p),
      "sub-ones": (p) => subFromPrompt(p),
      "tno-subtract-tens": (p) => subFromPrompt(p),
      "sub-2digit": (p) => subFromPrompt(p),
      "unbundle-sub": (p) => subFromPrompt(p),
      // The polygon-angle tags are DECLARED per step rather than aliased, because each authored
      // lesson asks the same family six different ways. Their per-step routes are covered by the
      // declaration gates below; what is checked here is that the tag-level table has not silently
      // grown an alias for them, which would flip every item in the tag to one form.
      // The system, by substitution rather than the generator's elimination.
      "substitute-isolated": (p) => {
        const m = p.match(/x \+ y = (-?\d+)\s+and\s+(\d*)x − y = (-?\d+)/)!;
        const [sum, k, d] = [Number(m[1]), m[2] === "" ? 1 : Number(m[2]), Number(m[3])];
        const x = bruteForce((xv) => k * xv - (sum - xv) === d);
        return /What is x\?/.test(p) ? x : sum - x;
      },
    };
    for (const [tag, check] of Object.entries(checks)) {
      for (let s = 0; s < 60; s++) {
        const v = variantFor(tag, `indep:${s}`)!;
        const w = WidgetSpec.parse(v.widget);
        const got = check("prompt" in w ? w.prompt : "");
        if (w.type === "fractionEntry") {
          expect(got as number, `${tag} seed ${s}`).toBeCloseTo(w.answerNum / w.answerDen, 9);
        } else {
          expect(got, `${tag} seed ${s}`).toBeCloseTo(v.answer as number, 9);
        }
      }
    }
  });

  it("stays deterministic, and aliased tags do not collide", () => {
    const a = variantFor("rno-subtract-change", "same-seed")!;
    const b = variantFor("rno-subtract-change", "same-seed")!;
    expect(a.widget).toEqual(b.widget);
    // Three tags share int-subtract-negative; on one seed they must not be the same problem.
    const c = variantFor("rno-subtract-opposite", "same-seed")!;
    const d = variantFor("rno-mixed-ops", "same-seed")!;
    const prompts = new Set([a, c, d].map((v) => JSON.stringify(v.widget)));
    expect(prompts.size).toBe(3);
  });

  it("the decimal form emits decimals, exact to two places", () => {
    let sawFraction = false;
    for (let s = 0; s < 120; s++) {
      const v = variantFor("rno-decimal-subtract", `dec:${s}`)!;
      const w = WidgetSpec.parse(v.widget);
      const values = [v.answer, ...("commonErrors" in w ? (w.commonErrors ?? []).map((e) => e.value) : [])];
      for (const n of values as number[]) {
        // Binary floating point is the whole risk here: with tolerance 0, an answer that lands on
        // 1.2000000000000002 marks a correct learner wrong. Every value must be exact at 2 dp.
        expect(Math.round(n * 100), `seed ${s}: ${n} is not exact to two places`).toBeCloseTo(n * 100, 9);
        if (!Number.isInteger(n)) sawFraction = true;
      }
    }
    expect(sawFraction, "decimal form never produced a non-integer").toBe(true);
  });

  it("the integer form is untouched by the addition of a decimal form", () => {
    // Regression: these three tags must still receive whole numbers only.
    for (const tag of ["rno-subtract-change", "rno-subtract-opposite", "rno-mixed-ops"]) {
      for (let s = 0; s < 40; s++) {
        const v = variantFor(tag, `int:${s}`)!;
        expect(Number.isInteger(v.answer as number), `${tag} seed ${s} produced ${v.answer}`).toBe(true);
      }
    }
  });

  it("does not change what an exact-tag seed already produced", () => {
    // dr-power-rule matched by name before the resolver existed. Routing through it must be a no-op.
    const v = variantFor("dr-power-rule", "regression-seed")!;
    expect(v.tag).toBe("dr-power-rule");
    expect(v.widget).toEqual(variantFor("dr-power-rule", "regression-seed")!.widget);
  });
});
