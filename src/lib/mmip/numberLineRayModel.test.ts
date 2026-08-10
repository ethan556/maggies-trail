/**
 * numberLineRayModel — the proof.
 *
 * INDEPENDENCE, and how it is kept honest here:
 *
 *  · `handSatisfies` decides membership from the RAW INTEGER PARTS of the state by cross
 *    multiplication written out in this file. It never calls `raySatisfies`, `deriveSolution`,
 *    `ratCmp` or any other model function.
 *  · `checkSolutionClaim` verifies the solution set BY SEARCH plus an exact pinch: it never divides
 *    `c` by `a` (the only thing `deriveSolution` does) — it takes the model's claim and asks
 *    `handSatisfies` whether it is true at the boundary, one millionth either side of it, and at
 *    every point of a fine sweep of the drawn window. Two genuinely different methods, agreeing.
 *  · Every asserted STRING is typed out by hand in the test, character for character. Nothing
 *    compares the model against its own formatting.
 *  · `the independent routes really do bite` mutates both of them and asserts the suite then
 *    fails, so a silently-agreeing tautology cannot masquerade as a passing check.
 *
 * And the house rule adopted after S214: every generated sentence is checked by RENDERING THE
 * STATE THAT TRIGGERS IT and asserting the claim is true of that state — `"3 is a solution."` is
 * only accepted when 3 really does satisfy the relation, tested by the independent route.
 */

import { describe, expect, it } from "vitest";
import {
  RAY_TICK_LIMIT,
  absorbRayEdit,
  createNumberLineRayGraph,
  deriveLine,
  deriveMembership,
  deriveRelationView,
  deriveSolution,
  describeRayChange,
  makeRayCanonical,
  normalizeRayCanonical,
  numberLineRayCanonicalModel,
  rayClaimEq,
  raySatisfies,
  raySymbol,
  type NumberLineRayEdit,
  type RayCanonical,
  type RayDirection
} from "./numberLineRayModel";
import { rat, ratEq, type Rat } from "./lineFamilyModel";
import { isNoOp } from "./mmipTypes";

/* ── the independent routes ───────────────────────────────────────────────────────────────────── */

type IntFrac = { n: number; d: number };

/** INDEPENDENT membership: a·v compared with c, straight from the integer parts. Denominators are
 * positive by construction, so cross multiplication keeps the direction of the comparison. */
function handSatisfies(state: RayCanonical, v: IntFrac, flipForMutationTest = false): boolean {
  const leftN = state.coeff.n * v.n;
  const leftD = state.coeff.d * v.d;
  const cmp = leftN * state.constant.d - state.constant.n * leftD;
  const gt = flipForMutationTest ? state.relation === "lt" : state.relation === "gt";
  if (gt) return state.inclusive ? cmp >= 0 : cmp > 0;
  return state.inclusive ? cmp <= 0 : cmp < 0;
}

/** Exact rational addition on the raw integer parts — written here so the check below never calls
 * the model's arithmetic. Denominators stay small in every fixture. */
const plus = (a: IntFrac, b: IntFrac): IntFrac => ({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });

/**
 * INDEPENDENT verification of a claimed solution set, by SEARCH plus an exact pinch. A grid scan
 * alone cannot separate `x > 3` from `x ≥ 3 + ε`, so this does not try to reconstruct the boundary
 * by scanning — it takes the model's CLAIM and asks whether it is true, using only `handSatisfies`:
 *
 *   1. the claimed boundary's own membership must equal the claimed inclusivity;
 *   2. one millionth ABOVE the claimed boundary must satisfy exactly when the ray points up, and
 *      one millionth BELOW exactly when it points down — which pins the boundary to that width
 *      with exact arithmetic, not with a tolerance;
 *   3. across a fine sweep of the whole drawn window, the claimed ray must predict membership at
 *      every single point.
 *
 * Returns the violations, so the mutation test can assert they appear.
 */
function checkSolutionClaim(
  state: RayCanonical,
  claim: { boundary: IntFrac; direction: RayDirection; inclusive: boolean },
  mutate = false
): string[] {
  const bad: string[] = [];
  const b = claim.boundary;
  const up = claim.direction === "greater";
  if (handSatisfies(state, b, mutate) !== claim.inclusive) {
    bad.push(`the boundary ${b.n}/${b.d} claims inclusive=${claim.inclusive} but substitution disagrees`);
  }
  const eps: IntFrac = { n: 1, d: 1_000_000 };
  if (handSatisfies(state, plus(b, eps), mutate) !== up) bad.push("just above the boundary disagrees with the claimed direction");
  if (handSatisfies(state, plus(b, { n: -eps.n, d: eps.d }), mutate) === up) bad.push("just below the boundary disagrees with the claimed direction");
  const grain = 720;
  const lo = Math.round((state.window.min.n / state.window.min.d) * grain);
  const hi = Math.round((state.window.max.n / state.window.max.d) * grain);
  for (let k = lo; k <= hi; k += 1) {
    const v: IntFrac = { n: k, d: grain };
    const onRay = k * b.d === b.n * grain ? claim.inclusive : up ? k * b.d > b.n * grain : k * b.d < b.n * grain;
    if (handSatisfies(state, v, mutate) !== onRay) {
      bad.push(`the claimed ray disagrees with substitution at ${k}/${grain}`);
      break;
    }
  }
  return bad;
}

/* ── fixtures ─────────────────────────────────────────────────────────────────────────────────── */

/** `x > 3` on a −6..6 line, integer positions, drag-friendly clamp/snap. */
const PLAIN = (over: Partial<Parameters<typeof makeRayCanonical>[0]> = {}): RayCanonical =>
  makeRayCanonical({
    coeff: rat(1),
    constant: rat(3),
    relation: "gt",
    inclusive: false,
    window: { min: rat(-6), max: rat(6), tickStep: rat(1) },
    policy: { step: rat(1), outOfRange: "clamp", offLattice: "snap" },
    ...over
  });

/** `−2x ≥ −6` — the same solution set as `x ≤ 3`, written the way a mid-solve line looks. */
const SCALED = makeRayCanonical({
  coeff: rat(-2),
  constant: rat(-6),
  relation: "gt",
  inclusive: true,
  window: { min: rat(-6), max: rat(6), tickStep: rat(1) },
  policy: { step: rat(1), outOfRange: "clamp", offLattice: "snap" }
});

/** Halves, a negative non-integer boundary, and a strict policy that REFUSES rather than clamps. */
const HALVES = makeRayCanonical({
  coeff: rat(1),
  constant: rat(-1, 2),
  relation: "lt",
  inclusive: true,
  window: { min: rat(-3), max: rat(3), tickStep: rat(1) },
  policy: { step: rat(1, 2), outOfRange: "reject", offLattice: "reject" }
});

const run = (state: RayCanonical, edit: NumberLineRayEdit): RayCanonical => {
  const outcome = absorbRayEdit(state, edit);
  if (!outcome.ok) throw new Error(`unexpected rejection ${outcome.code}: ${outcome.reason}`);
  return outcome.canonical;
};

const reject = (state: RayCanonical, edit: NumberLineRayEdit) => {
  const outcome = absorbRayEdit(state, edit);
  if (outcome.ok) throw new Error("expected a rejection, got an accepted edit");
  return outcome;
};

/* ── the suite ────────────────────────────────────────────────────────────────────────────────── */

describe("numberLineRay — the solution set, two ways", () => {
  it("search and algebra agree on boundary, direction and inclusion", () => {
    const cases: RayCanonical[] = [
      PLAIN(),
      PLAIN({ inclusive: true }),
      PLAIN({ relation: "lt" }),
      PLAIN({ relation: "lt", inclusive: true }),
      PLAIN({ constant: rat(-4) }),
      SCALED,
      run(SCALED, { kind: "flipRelationSymbol" }),
      HALVES,
      makeRayCanonical({ coeff: rat(-1, 3), constant: rat(1), relation: "lt", inclusive: false }),
      makeRayCanonical({ coeff: rat(3), constant: rat(-4), relation: "gt", inclusive: true })
    ];
    for (const state of cases) {
      const derived = deriveSolution(state);
      expect(
        checkSolutionClaim(state, {
          boundary: { n: derived.boundary.n, d: derived.boundary.d },
          direction: derived.direction,
          inclusive: derived.inclusive
        }),
        derived.text
      ).toEqual([]);
    }
  });

  it("membership is decided by substitution and agrees with the drawn ray at every sample", () => {
    for (const state of [PLAIN(), SCALED, HALVES, PLAIN({ relation: "lt", inclusive: true })]) {
      const membership = deriveMembership(state);
      const solution = deriveSolution(state);
      expect(membership.samples.length).toBeGreaterThan(4);
      for (const sample of membership.samples) {
        // 1. the model's substitution agrees with the hand route
        expect(sample.satisfies, sample.sentence).toBe(handSatisfies(state, sample.value));
        // 2. and the PICTURE agrees with both: is the sample on the shaded side of the endpoint?
        const v = sample.value.n / sample.value.d;
        const b = solution.boundary.n / solution.boundary.d;
        const onRay =
          solution.direction === "greater"
            ? v > b || (solution.inclusive && Math.abs(v - b) < 1e-12)
            : v < b || (solution.inclusive && Math.abs(v - b) < 1e-12);
        expect(onRay, `${sample.text} vs ${solution.text}`).toBe(sample.satisfies);
      }
    }
  });

  it("open and closed at the same value differ by EXACTLY one point", () => {
    const open = PLAIN({ inclusive: false });
    const closed = run(open, { kind: "toggleInclusive" });
    const differ: string[] = [];
    for (let k = -12; k <= 12; k += 1) {
      const v = { n: k, d: 2 };
      if (handSatisfies(open, v) !== handSatisfies(closed, v)) differ.push(`${k}/2`);
    }
    expect(differ).toEqual(["6/2"]); // 3 itself, and nothing else
    expect(deriveSolution(open).boundary).toEqual(deriveSolution(closed).boundary);
    expect(deriveLine(open).filled).toBe(false);
    expect(deriveLine(closed).filled).toBe(true);
  });

  it("the independent routes really do bite", () => {
    // Mutating handSatisfies' relation must make it disagree with the model — otherwise the
    // agreement above proves nothing.
    const state = PLAIN();
    const straight = deriveMembership(state).samples.map((s) => handSatisfies(state, s.value));
    const mutated = deriveMembership(state).samples.map((s) => handSatisfies(state, s.value, true));
    expect(mutated).not.toEqual(straight);
    // And the claim checker must REPORT violations once its oracle is mutated — a checker that
    // returns [] either way certifies nothing.
    const derived = deriveSolution(state);
    const claim = {
      boundary: { n: derived.boundary.n, d: derived.boundary.d },
      direction: derived.direction,
      inclusive: derived.inclusive
    };
    expect(checkSolutionClaim(state, claim)).toEqual([]);
    expect(checkSolutionClaim(state, claim, true).length).toBeGreaterThan(0);
    // It must also bite on a WRONG claim about a correct state: the three ways a claim can be
    // wrong are each caught.
    expect(checkSolutionClaim(state, { ...claim, inclusive: true }).length).toBeGreaterThan(0);
    expect(checkSolutionClaim(state, { ...claim, direction: "less" }).length).toBeGreaterThan(0);
    expect(checkSolutionClaim(state, { ...claim, boundary: { n: 4, d: 1 } }).length).toBeGreaterThan(0);
  });
});

describe("numberLineRay — the strings say what is true of the state", () => {
  it("x > 3: every sentence, typed out by hand", () => {
    const state = PLAIN();
    const relation = deriveRelationView(state);
    const solution = deriveSolution(state);
    const line = deriveLine(state);
    expect(relation.text).toBe("x > 3");
    expect(solution.text).toBe("x > 3");
    expect(solution.interval).toBe("(3, ∞)");
    expect(solution.sentence).toBe("all values greater than 3, 3 not included");
    expect(solution.boundarySentence).toBe("3 is not a solution.");
    expect(line.endpointLabel).toBe("3 not included");
    expect(line.sentence).toBe("A number line shaded for all values greater than 3, 3 not included.");
    // …and the claims are TRUE of this state, by the independent route.
    expect(handSatisfies(state, { n: 3, d: 1 })).toBe(false);
    expect(handSatisfies(state, { n: 7, d: 2 })).toBe(true);
    expect(handSatisfies(state, { n: 5, d: 2 })).toBe(false);
    expect(relation.solved).toBe(true);
  });

  it("x ≥ 3: closing the endpoint changes the symbol, the words, and the truth at 3", () => {
    const state = run(PLAIN(), { kind: "toggleInclusive" });
    const solution = deriveSolution(state);
    expect(solution.text).toBe("x ≥ 3");
    expect(solution.interval).toBe("[3, ∞)");
    expect(solution.sentence).toBe("all values greater than or equal to 3, 3 included");
    expect(solution.boundarySentence).toBe("3 is a solution.");
    expect(deriveLine(state).endpointLabel).toBe("3 included");
    expect(handSatisfies(state, { n: 3, d: 1 })).toBe(true);
  });

  it("−2x ≥ −6 is drawn as x ≤ 3, and says so in both alphabets", () => {
    const relation = deriveRelationView(SCALED);
    const solution = deriveSolution(SCALED);
    expect(relation.text).toBe("−2x ≥ −6");
    expect(relation.solved).toBe(false);
    expect(solution.text).toBe("x ≤ 3");
    expect(solution.interval).toBe("(−∞, 3]");
    expect(solution.sentence).toBe("all values less than or equal to 3, 3 included");
    expect(solution.reversed).toBe(true);
    // TRUE of the state: 3 works, 4 does not, 0 does.
    expect(handSatisfies(SCALED, { n: 3, d: 1 })).toBe(true);
    expect(handSatisfies(SCALED, { n: 4, d: 1 })).toBe(false);
    expect(handSatisfies(SCALED, { n: 0, d: 1 })).toBe(true);
  });

  it("a fractional boundary and a fractional coefficient are written exactly", () => {
    expect(deriveSolution(HALVES).text).toBe("x ≤ −1/2");
    expect(deriveSolution(HALVES).interval).toBe("(−∞, −1/2]");
    expect(deriveRelationView(HALVES).text).toBe("x ≤ −1/2");
    const third = makeRayCanonical({ coeff: rat(-1, 3), constant: rat(1), relation: "lt", inclusive: false });
    expect(deriveRelationView(third).text).toBe("(−1/3)x < 1");
    expect(deriveSolution(third).text).toBe("x > −3");
    expect(handSatisfies(third, { n: -3, d: 1 })).toBe(false);
    expect(handSatisfies(third, { n: -2, d: 1 })).toBe(true);
    expect(handSatisfies(third, { n: -4, d: 1 })).toBe(false);
  });

  it("−x < 2 keeps the bare minus and reverses", () => {
    const state = makeRayCanonical({ coeff: rat(-1), constant: rat(2), relation: "lt", inclusive: false });
    expect(deriveRelationView(state).text).toBe("−x < 2");
    expect(deriveSolution(state).text).toBe("x > −2");
    expect(handSatisfies(state, { n: -1, d: 1 })).toBe(true);
    expect(handSatisfies(state, { n: -3, d: 1 })).toBe(false);
  });

  it("every membership sentence is true of the value it names", () => {
    for (const state of [PLAIN(), SCALED, HALVES]) {
      for (const sample of deriveMembership(state).samples) {
        const truth = handSatisfies(state, sample.value);
        expect(sample.sentence.endsWith(truth ? `so ${sample.text} is a solution.` : `so ${sample.text} is not a solution.`),
          sample.sentence).toBe(true);
        expect(sample.sentence.includes(truth ? "is true" : "is false"), sample.sentence).toBe(true);
      }
    }
    // …and the substitution it prints is the real arithmetic, not a template.
    const sample = deriveMembership(SCALED).samples.find((s) => ratEq(s.value, rat(2)))!;
    expect(sample.sentence).toBe("−2 × 2 = −4, and −4 ≥ −6 is true, so 2 is a solution.");
    const outside = deriveMembership(SCALED).samples.find((s) => ratEq(s.value, rat(4)))!;
    expect(outside.sentence).toBe("−2 × 4 = −8, and −8 ≥ −6 is false, so 4 is not a solution.");
  });

  it("raySymbol covers all four glyphs and nothing else", () => {
    expect(raySymbol("lt", false)).toBe("<");
    expect(raySymbol("lt", true)).toBe("≤");
    expect(raySymbol("gt", false)).toBe(">");
    expect(raySymbol("gt", true)).toBe("≥");
  });
});

describe("numberLineRay — inequality reversal, the reason this engine exists", () => {
  it("multiplying both sides by a negative number and NOT turning the sign round moves the solution set", () => {
    const before = PLAIN(); // x > 3
    const after = run(before, { kind: "scaleBothSides", factor: rat(-2) }); // −2x > −6
    expect(deriveRelationView(after).text).toBe("−2x > −6");
    // The BOUNDARY is invariant — (kc)/(ka) = c/a — but the ray has turned round.
    expect(deriveSolution(after).boundary).toEqual(deriveSolution(before).boundary);
    expect(deriveSolution(before).direction).toBe("greater");
    expect(deriveSolution(after).direction).toBe("less");
    // Visibly wrong, by the independent route: 4 satisfied the first and does not satisfy the second.
    expect(handSatisfies(before, { n: 4, d: 1 })).toBe(true);
    expect(handSatisfies(after, { n: 4, d: 1 })).toBe(false);
    expect(handSatisfies(before, { n: 0, d: 1 })).toBe(false);
    expect(handSatisfies(after, { n: 0, d: 1 })).toBe(true);
  });

  it("turning the sign round restores it, and the model says the set is unchanged only when it is", () => {
    const start = PLAIN(); // x > 3
    const scaled = run(start, { kind: "scaleBothSides", factor: rat(-2) }); // −2x > −6
    const fixed = run(scaled, { kind: "flipRelationSymbol" }); // −2x < −6
    expect(deriveRelationView(fixed).text).toBe("−2x < −6");
    expect(deriveSolution(fixed).text).toBe("x > 3");
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    expect(model.equivalent(start, fixed)).toBe(true);
    expect(model.equivalent(start, scaled)).toBe(false);

    const moved = describeRayChange(start, scaled);
    expect(moved.map((o) => o.kind)).toEqual(["negate", "distribute"]);
    expect(moved[0].describe).toBe(
      "Multiply both sides by a negative number: x > 3 becomes −2x > −6. Every term reverses sign together."
    );
    expect(moved[1].describe).toBe(
      "Multiply both sides by 2: x and 3 become −2x and −6. The solution set moved from x > 3 to x < 3."
    );
    expect(moved.at(-1)!.describe).toContain("The solution set moved from x > 3 to x < 3.");
    const restored = describeRayChange(scaled, fixed);
    expect(restored.map((o) => o.kind)).toEqual(["reorient"]);
    expect(restored[0].describe).toContain("The solution set moved from x < 3 to x > 3.");

    // Multiplying by a POSITIVE number never moves it, and the sentence says so.
    const doubled = run(start, { kind: "scaleBothSides", factor: rat(2) });
    const kept = describeRayChange(start, doubled);
    expect(kept.at(-1)!.describe).toContain("The solution set is unchanged: still x > 3.");
    expect(deriveRelationView(doubled).text).toBe("2x > 6");
  });

  it("dividing both sides by a negative number is the same story", () => {
    const start = makeRayCanonical({ coeff: rat(-2), constant: rat(6), relation: "gt", inclusive: false });
    expect(deriveRelationView(start).text).toBe("−2x > 6");
    expect(deriveSolution(start).text).toBe("x < −3");
    const divided = run(start, { kind: "scaleBothSides", factor: rat(-1, 2) }); // ÷ (−2)
    expect(deriveRelationView(divided).text).toBe("x > −3");
    expect(deriveSolution(divided).text).toBe("x > −3");
    expect(handSatisfies(start, { n: -4, d: 1 })).toBe(true);
    expect(handSatisfies(divided, { n: -4, d: 1 })).toBe(false);
    const ops = describeRayChange(start, divided);
    expect(ops.map((o) => o.kind)).toEqual(["negate", "divide"]);
    expect(ops[1].amount).toBe(2);
    expect(ops[1].describe).toBe(
      "Split both sides into 2 equal parts: −2x and 6 become x and −3. The solution set moved from x < −3 to x > −3."
    );
    // A scale that is neither a whole-number stretch nor a clean split says what it IS.
    const oddly = run(start, { kind: "scaleBothSides", factor: rat(3, 2) });
    const odd = describeRayChange(start, oddly);
    expect(odd.map((o) => o.kind)).toEqual(["divide"]);
    expect(odd[0].describe).toBe(
      "Multiply both sides by 3/2: −2x and 6 become −3x and 9. The solution set is unchanged: still x < −3."
    );
    expect(ops.at(-1)!.describe).toContain("The solution set moved from x < −3 to x > −3.");
    // …and the flip restores it.
    const flipped = run(divided, { kind: "flipRelationSymbol" });
    expect(deriveSolution(flipped).text).toBe("x < −3");
    expect(describeRayChange(divided, flipped).at(-1)!.describe).toContain("The solution set moved from x > −3 to x < −3.");
  });

  it("multiplying both sides by 0 is refused, and empty/universal sets stay unreachable", () => {
    const outcome = reject(PLAIN(), { kind: "scaleBothSides", factor: rat(0) });
    expect(outcome.code).toBe("scale-by-zero");
    expect(outcome.reason).toContain("says nothing about x");
    // Every reachable state is a half-line: some value on the window satisfies it and some does not.
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    let state = model.initial;
    const walk: NumberLineRayEdit[] = [
      { kind: "scaleBothSides", factor: rat(-2) },
      { kind: "flipRelationSymbol" },
      { kind: "toggleInclusive" },
      { kind: "setBoundary", value: rat(-4) },
      { kind: "scaleBothSides", factor: rat(-1, 2) },
      { kind: "flipRay" }
    ];
    for (const edit of walk) {
      state = run(state, edit);
      const samples = deriveMembership(state).samples;
      expect(samples.some((s) => s.satisfies), deriveSolution(state).text).toBe(true);
      expect(samples.some((s) => !s.satisfies), deriveSolution(state).text).toBe(true);
      expect(state.coeff.n).not.toBe(0);
    }
  });
});

describe("numberLineRay — both representations edit the SAME object", () => {
  it("dragging the endpoint and typing the right-hand side reach an identical state", () => {
    const start = SCALED; // −2x ≥ −6, boundary 3
    const dragged = run(start, { kind: "setBoundary", value: rat(-1) });
    const typed = run(start, { kind: "setConstant", value: rat(2) }); // −2 × (−1) = 2
    expect(dragged).toEqual(typed);
    expect(deriveSolution(dragged).text).toBe("x ≤ −1");
    expect(deriveRelationView(dragged).text).toBe("−2x ≥ 2");
  });

  it("flipping the drawn ray and flipping the symbol reach the same state — even when a < 0", () => {
    expect(run(SCALED, { kind: "flipRay" })).toEqual(run(SCALED, { kind: "flipRelationSymbol" }));
    // setRayDirection speaks in DRAWN directions, so under a negative coefficient it must store
    // the opposite symbol. Check by what results, not by what it stores.
    const toGreater = run(SCALED, { kind: "setRayDirection", direction: "greater" });
    expect(deriveSolution(toGreater).direction).toBe("greater");
    expect(deriveSolution(toGreater).text).toBe("x ≥ 3");
    expect(toGreater.relation).toBe("lt");
    const toLess = run(toGreater, { kind: "setRayDirection", direction: "less" });
    expect(deriveSolution(toLess).direction).toBe("less");
    expect(toLess).toEqual(SCALED);
  });

  it("a symbolic edit lands on the same lattice the drag does", () => {
    const start = PLAIN();
    // −5/2 is not on the integer lattice: the constant route snaps exactly as the drag route does.
    const typed = absorbRayEdit(start, { kind: "setConstant", value: rat(-5, 2) });
    const dragged = absorbRayEdit(start, { kind: "setBoundary", value: rat(-5, 2) });
    expect(typed.ok && dragged.ok).toBe(true);
    if (!typed.ok || !dragged.ok) throw new Error("unreachable");
    expect(typed.canonical).toEqual(dragged.canonical);
    expect(typed.clamp?.code).toBe("boundary-snapped");
    expect(deriveSolution(typed.canonical).text).toBe("x > −2");
  });

  it("setting a value already held is a no-op, not an event", () => {
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    const tx = model.apply(model.initial, { kind: "setBoundary", value: rat(3) }, "physical", "line");
    expect(tx.rejected).toBe(false);
    expect(tx.changed).toBe(false);
    expect(tx.ops).toEqual([]);
    expect(isNoOp(tx)).toBe(true);
    expect(tx.after).toEqual(tx.before);
  });
});

describe("numberLineRay — the declared policy, and every rejection reachable", () => {
  it("clamps to the drawn line and says what moved", () => {
    const outcome = absorbRayEdit(PLAIN(), { kind: "setBoundary", value: rat(40) });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error("unreachable");
    expect(outcome.clamp?.code).toBe("boundary-clamped");
    expect(outcome.clamp?.reason).toBe("40 is off the drawn line, so the boundary stopped at 6.");
    expect(deriveSolution(outcome.canonical).boundary).toEqual(rat(6));
  });

  it("refuses an off-lattice boundary when the policy says reject", () => {
    const outcome = reject(HALVES, { kind: "setBoundary", value: rat(1, 3) });
    expect(outcome.code).toBe("boundary-off-lattice");
    expect(outcome.reason).toBe("this line marks positions every 1/2, and 1/3 is not one of them");
  });

  it("refuses an out-of-range boundary when the policy says reject", () => {
    const outcome = reject(HALVES, { kind: "setBoundary", value: rat(9, 2) });
    expect(outcome.code).toBe("boundary-out-of-range");
    expect(outcome.reason).toContain("the drawn line runs from −3 to 3");
    expect(outcome.reason).toContain("9/2");
  });

  it("refuses rather than approximates when the exact range runs out", () => {
    const huge = makeRayCanonical({
      coeff: rat(3_000_000_000),
      constant: rat(3_000_000_000),
      relation: "gt",
      window: { min: rat(-6), max: rat(6), tickStep: rat(1) }
    });
    const outcome = reject(huge, { kind: "scaleBothSides", factor: rat(3_000_000_000) });
    expect(outcome.code).toBe("rational-overflow");
    expect(outcome.reason).toContain("refuses the move rather than showing you a rounded picture");
  });

  it("every rejection reaches the transaction as a code AND a message, and mutates nothing", () => {
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    const tx = model.apply(model.initial, { kind: "scaleBothSides", factor: rat(0) }, "control", "relation");
    expect(tx.rejected).toBe(true);
    expect(tx.changed).toBe(false);
    expect(tx.ops).toEqual([]);
    expect(tx.after).toEqual(tx.before);
    expect(tx.rejection?.code).toBe("scale-by-zero");
    expect(tx.rejection?.message.length).toBeGreaterThan(20);
    expect(tx.source).toBe("relation");
    expect(tx.origin).toBe("control");
  });
});

describe("numberLineRay — the model contract", () => {
  it("normalize never throws and never lets a = 0 through", () => {
    const model = numberLineRayCanonicalModel({ coeff: rat(-2), constant: rat(-6), relation: "gt", inclusive: true });
    const junk: unknown[] = [
      null,
      undefined,
      42,
      "x > 3",
      {},
      { coeff: { n: 0, d: 1 } },
      { coeff: { n: 1, d: 0 } },
      { coeff: { n: 1.5, d: 2 } },
      { coeff: { n: Number.MAX_SAFE_INTEGER, d: 1 }, constant: { n: 1, d: 1 } },
      { relation: "sideways", inclusive: "yes" },
      { constant: { n: -7, d: 2 }, relation: "lt", inclusive: false }
    ];
    for (const raw of junk) {
      const state = model.normalize(raw);
      expect(state.coeff.n).not.toBe(0);
      expect(() => deriveSolution(state)).not.toThrow();
      expect(() => deriveMembership(state)).not.toThrow();
      expect(state.window).toEqual(model.initial.window);
      expect(state.policy).toEqual(model.initial.policy);
    }
    expect(model.normalize({ constant: { n: -7, d: 2 }, relation: "lt", inclusive: false }).constant).toEqual(rat(-7, 2));
    expect(normalizeRayCanonical({ relation: "lt" }, model.initial).relation).toBe("lt");
  });

  it("is pure: the same edit on the same state gives byte-identical results, forever", () => {
    const edits: NumberLineRayEdit[] = [
      { kind: "setBoundary", value: rat(-2) },
      { kind: "toggleInclusive" },
      { kind: "flipRay" },
      { kind: "scaleBothSides", factor: rat(-3) },
      { kind: "setConstant", value: rat(5) }
    ];
    for (const edit of edits) {
      const a = absorbRayEdit(SCALED, edit);
      const b = absorbRayEdit(SCALED, edit);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
    const views1 = numberLineRayCanonicalModel().views(SCALED);
    const views2 = numberLineRayCanonicalModel().views(SCALED);
    expect(JSON.stringify(views1)).toBe(JSON.stringify(views2));
  });

  it("equivalent() is about the claim, not the shape", () => {
    const model = numberLineRayCanonicalModel();
    const solved = makeRayCanonical({ coeff: rat(1), constant: rat(3), relation: "lt", inclusive: true });
    expect(model.equivalent(SCALED, solved)).toBe(true);
    expect(rayClaimEq(SCALED, solved)).toBe(false); // …and structurally they are NOT the same
    expect(model.equivalent(solved, makeRayCanonical({ coeff: rat(1), constant: rat(3), relation: "lt" }))).toBe(false);
  });

  it("declares which representations originate edits", () => {
    const model = numberLineRayCanonicalModel();
    const editable = model.representations.filter((r) => r.editable(model.initial)).map((r) => r.id).sort();
    expect(editable).toEqual(["line", "relation"]);
    expect(model.representations.map((r) => r.id).sort()).toEqual([
      "line",
      "membership",
      "model",
      "relation",
      "solution"
    ]);
  });

  it("the graph owns undo, restores exactly, and never goes stale", () => {
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    const graph = model.createGraph();
    const before = graph.getCanonical();
    graph.apply("line", { kind: "setBoundary", value: rat(-2) });
    graph.apply("relation", { kind: "scaleBothSides", factor: rat(-2) });
    expect(graph.verifyFresh()).toEqual([]);
    expect(deriveSolution(graph.getCanonical()).text).toBe("x < −2");
    graph.undo();
    expect(deriveSolution(graph.getCanonical()).text).toBe("x > −2");
    graph.undo();
    expect(graph.getCanonical()).toEqual(before);
    expect(graph.verifyFresh()).toEqual([]);
  });

  it("a drag's samples coalesce into ONE undo step", () => {
    const graph = createNumberLineRayGraph(PLAIN());
    for (const v of [1, 0, -1, -2]) graph.apply("line", { kind: "setBoundary", value: rat(v) }, { gesture: "drag-1" });
    expect(graph.history().length).toBe(1);
    graph.undo();
    expect(deriveSolution(graph.getCanonical()).boundary).toEqual(rat(3));
  });
});

describe("numberLineRay — the drawn frame", () => {
  it("ticks are bounded and complete for a sane window", () => {
    const line = deriveLine(PLAIN());
    expect(line.ticksComplete).toBe(true);
    expect(line.ticks.map((t) => t.text)).toEqual([
      "−6", "−5", "−4", "−3", "−2", "−1", "0", "1", "2", "3", "4", "5", "6"
    ]);
    expect(line.ticks[0].t).toBe(0);
    expect(line.ticks[12].t).toBe(1);
    expect(line.boundaryT).toBeCloseTo(0.75, 12);
    expect(line.openEnd).toBe("max");
    expect(deriveLine(PLAIN({ relation: "lt" })).openEnd).toBe("min");
  });

  it("an absurd window truncates rather than hanging, and says its labelling is partial", () => {
    const dense = makeRayCanonical({
      coeff: rat(1),
      constant: rat(0),
      window: { min: rat(0), max: rat(1000), tickStep: rat(1) }
    });
    const line = deriveLine(dense);
    expect(line.ticks.length).toBe(RAY_TICK_LIMIT);
    expect(line.ticksComplete).toBe(false);
  });

  it("a boundary off the drawn window reports boundaryIndex −1 rather than pretending", () => {
    const off = makeRayCanonical({
      coeff: rat(1),
      constant: rat(40),
      window: { min: rat(-6), max: rat(6), tickStep: rat(1) }
    });
    expect(deriveMembership(off).boundaryIndex).toBe(-1);
    expect(deriveMembership(PLAIN()).boundaryIndex).toBeGreaterThanOrEqual(0);
    expect(deriveMembership(PLAIN()).samples[deriveMembership(PLAIN()).boundaryIndex].text).toBe("3");
  });

  it("the coefficient slot is locked with a mathematical reason; the constant slot is not", () => {
    const view = deriveRelationView(SCALED);
    expect(view.coeffSlot.editable).toBe(false);
    expect(view.coeffSlot.lockedReason).toContain("BOTH sides");
    expect(view.coeffSlot.meaning).toBe("how many x the left-hand side holds, currently −2");
    expect(view.constantSlot.editable).toBe(true);
    expect(view.constantSlot.meaning).toBe("the number −2x is compared with, currently −6");
    // The bounds are the ends of the drawn line, mapped through the coefficient (a < 0 swaps them).
    expect(view.constantSlot.min).toBe(-12);
    expect(view.constantSlot.max).toBe(12);
    expect(view.constantSlot.step).toBe(2);
  });
});

describe("numberLineRay — the operation record a motion layer consumes", () => {
  it("moving the boundary is an ordered add/subtract on the ray", () => {
    const start = PLAIN();
    const up = describeRayChange(start, run(start, { kind: "setBoundary", value: rat(5) }));
    expect(up.map((o) => [o.kind, o.target, o.amount])).toEqual([["add", "boundary", 2]]);
    expect(up[0].sides).toEqual(["ray"]);
    expect(up[0].describe).toContain("Move the boundary up by 2: it goes from 3 to 5.");
    const down = describeRayChange(start, run(start, { kind: "setBoundary", value: rat(-1) }));
    expect(down.map((o) => [o.kind, o.amount])).toEqual([["subtract", -4]]);
    expect(down[0].describe).toContain("Move the boundary down by 4: it goes from 3 to −1.");
  });

  it("opening and closing the endpoint is a reorient naming the point that joined or left", () => {
    const open = PLAIN();
    const closed = run(open, { kind: "toggleInclusive" });
    const ops = describeRayChange(open, closed);
    expect(ops.map((o) => [o.kind, o.target])).toEqual([["reorient", "inclusive"]]);
    expect(ops[0].sides).toEqual(["endpoint"]);
    expect(ops[0].describe).toBe(
      "Close the endpoint: 3 joins the solutions, so > becomes ≥. The solution set moved from x > 3 to x ≥ 3."
    );
    expect(describeRayChange(closed, open)[0].describe).toBe(
      "Open the endpoint: 3 leaves the solutions, so ≥ becomes >. The solution set moved from x ≥ 3 to x > 3."
    );
    // …and the claims are true: 3 really does change membership and nothing else does.
    expect(handSatisfies(closed, { n: 3, d: 1 })).toBe(true);
    expect(handSatisfies(open, { n: 3, d: 1 })).toBe(false);
  });

  it("no state change means no operation, and every changed state has one", () => {
    const model = numberLineRayCanonicalModel({ coeff: rat(1), constant: rat(3), relation: "gt" });
    expect(describeRayChange(PLAIN(), PLAIN())).toEqual([]);
    const walk: NumberLineRayEdit[] = [
      { kind: "setBoundary", value: rat(1) },
      { kind: "toggleInclusive" },
      { kind: "scaleBothSides", factor: rat(-1) },
      { kind: "flipRay" },
      { kind: "setConstant", value: rat(-4) },
      { kind: "scaleBothSides", factor: rat(1, 2) },
      { kind: "setRelationSymbol", relation: "gt" }
    ];
    let state = model.initial;
    for (const edit of walk) {
      const tx = model.apply(state, edit, "control", "relation");
      expect(tx.rejected).toBe(false);
      if (tx.changed) {
        expect(tx.ops.length, JSON.stringify(edit)).toBeGreaterThan(0);
        for (const op of tx.ops) expect(op.sides.length).toBeGreaterThan(0);
      } else {
        expect(tx.ops).toEqual([]);
      }
      state = tx.after;
    }
  });

  it("every describe sentence quotes the numbers the state actually holds", () => {
    const start = SCALED;
    for (const edit of [
      { kind: "setBoundary", value: rat(-2) },
      { kind: "scaleBothSides", factor: rat(-1, 2) },
      { kind: "flipRelationSymbol" },
      { kind: "toggleInclusive" }
    ] as NumberLineRayEdit[]) {
      const after = run(start, edit);
      const beforeText = deriveSolution(start).text;
      const afterText = deriveSolution(after).text;
      const last = describeRayChange(start, after).at(-1)!;
      const same = beforeText === afterText;
      expect(last.describe.endsWith(same ? `The solution set is unchanged: still ${afterText}.` : `The solution set moved from ${beforeText} to ${afterText}.`),
        last.describe).toBe(true);
    }
  });
});

describe("numberLineRay — raySatisfies is the substitution, not the picture", () => {
  it("agrees with the hand route over a dense sweep of every fixture", () => {
    const values: Rat[] = [];
    for (let k = -12; k <= 12; k += 1) values.push(rat(k, 2));
    for (const state of [PLAIN(), PLAIN({ inclusive: true }), SCALED, HALVES]) {
      for (const v of values) {
        expect(raySatisfies(state, v), `${deriveSolution(state).text} at ${v.n}/${v.d}`).toBe(
          handSatisfies(state, { n: v.n, d: v.d })
        );
      }
    }
  });
});
