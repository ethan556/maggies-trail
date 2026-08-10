/**
 * RELEASE BLOCKER 1 — inequality solution-set equivalence.
 *
 * The engine graded an inequality by weighing the beam at ONE witness value. That proves nothing:
 * `2x + 3 > 11` has solution set `x > 4` and is weighed at x = 5, so a learner landing on `x > 3`
 * was checked as 5 > 3 — true — and marked correct. The same hole accepted `x ≥ 4` for `x > 4`,
 * and accepted any one-sided operation whose damage happened to miss the sampled point.
 *
 * These tests are adversarial by construction: each wrong answer below SURVIVES the old
 * single-witness check, and each must now be rejected. Where a test's point is that the old check
 * passed, that is asserted explicitly rather than asserted about.
 */
import { describe, it, expect } from "vitest";
import {
  WidgetSpec,
  solveBalanceSet,
  solveBalanceSetsEqual,
  solveBalanceHolds,
  solveBalanceWitness,
  type TWidget
} from "./schema";
import { evaluate } from "./evaluate";

const spec = (o: Record<string, unknown>) =>
  WidgetSpec.parse({
    type: "solveBalance",
    prompt: "p",
    a: 2,
    b: 3,
    c: 11,
    relation: "gt",
    successFeedback: "ok",
    unbalancedFeedback: "the sides stopped matching",
    notIsolatedFeedback: "x is not alone",
    missFeedback: "no x left",
    notFlippedFeedback: "the comparator is facing the wrong way",
    ...o
  }) as TWidget;

/** A learner state claiming `leftX·x + leftUnits REL rightUnits`. */
const st = (leftX: number, leftUnits: number, rightUnits: number, rel: string) => ({
  leftX,
  leftUnits,
  rightUnits,
  rel
});

describe("solveBalanceSet — canonical solution sets, exact integer arithmetic", () => {
  it("positive coefficient keeps the comparator", () => {
    expect(solveBalanceSet(2, 3, 11, "gt")).toEqual({ kind: "half", cmp: "gt", num: 4, den: 1 });
  });

  it("NEGATIVE coefficient reverses it — the reversal lives in one place", () => {
    // −2x > 8  ⟺  x < −4
    expect(solveBalanceSet(-2, 0, 8, "gt")).toEqual({ kind: "half", cmp: "lt", num: -4, den: 1 });
    // −3x ≤ 9  ⟺  x ≥ −3
    expect(solveBalanceSet(-3, 0, 9, "le")).toEqual({ kind: "half", cmp: "ge", num: -3, den: 1 });
  });

  it("keeps a non-integer boundary exact as a reduced fraction, never a float", () => {
    // 2x > 5  ⟺  x > 5/2
    expect(solveBalanceSet(2, 0, 5, "gt")).toEqual({ kind: "half", cmp: "gt", num: 5, den: 2 });
    // 4x > 6  ⟺  x > 3/2  (reduced, not 6/4)
    expect(solveBalanceSet(4, 0, 6, "gt")).toEqual({ kind: "half", cmp: "gt", num: 3, den: 2 });
  });

  it("a claim with no x is all-x or no-x, not a boundary", () => {
    expect(solveBalanceSet(0, 3, 11, "lt")).toEqual({ kind: "all" });
    expect(solveBalanceSet(0, 12, 11, "lt")).toEqual({ kind: "none" });
  });

  it("an equation is a point", () => {
    expect(solveBalanceSet(2, 3, 11, "eq")).toEqual({ kind: "point", num: 4, den: 1 });
  });

  it("equality is structural: boundary, strictness and direction all count", () => {
    const truth = solveBalanceSet(2, 3, 11, "gt"); // x > 4
    expect(solveBalanceSetsEqual(truth, solveBalanceSet(1, 0, 4, "gt"))).toBe(true);
    expect(solveBalanceSetsEqual(truth, solveBalanceSet(1, 0, 3, "gt"))).toBe(false); // bound
    expect(solveBalanceSetsEqual(truth, solveBalanceSet(1, 0, 4, "ge"))).toBe(false); // strictness
    expect(solveBalanceSetsEqual(truth, solveBalanceSet(1, 0, 4, "lt"))).toBe(false); // direction
  });

  it("an equivalent un-isolated form IS the same set — the check is not just syntactic", () => {
    // 2x > 8 is the same claim as x > 4.
    expect(solveBalanceSetsEqual(solveBalanceSet(2, 0, 8, "gt"), solveBalanceSet(1, 0, 4, "gt"))).toBe(true);
  });
});

describe("ADVERSARIAL — each of these survived the old single-witness check", () => {
  const s = spec({}); // 2x + 3 > 11, solution x > 4
  const witness = solveBalanceWitness(2, 3, 11, "gt");

  it("the witness really is a single point that the wrong answers satisfy", () => {
    expect(witness).toBe(5);
    // This is the hole, stated as arithmetic: every wrong claim below holds AT x = 5.
    expect(solveBalanceHolds(1 * witness + 0, 3, "gt")).toBe(true); // x > 3
    expect(solveBalanceHolds(1 * witness + 0, 4, "ge")).toBe(true); // x ≥ 4
  });

  it("x > 3 is REJECTED for x > 4 (wrong boundary)", () => {
    expect(evaluate(s, st(1, 0, 3, "gt")).correct).toBe(false);
  });

  it("x ≥ 4 is REJECTED for x > 4 (wrong strictness)", () => {
    const r = evaluate(s, st(1, 0, 4, "ge"));
    expect(r.correct).toBe(false);
    // Same boundary, wrong strictness — diagnosed as a comparator fault, not a broken transform.
    expect(r.feedback).toBe("the comparator is facing the wrong way");
  });

  it("x < 4 is REJECTED (reversed symbol)", () => {
    const r = evaluate(s, st(1, 0, 4, "lt"));
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("the comparator is facing the wrong way");
  });

  it("x > 4 is ACCEPTED", () => {
    expect(evaluate(s, st(1, 0, 4, "gt")).correct).toBe(true);
  });

  it("a ONE-SIDED operation is rejected even when it survives the witness", () => {
    // Took 3 off the left and left the right alone: x > 11, a different set entirely.
    expect(solveBalanceHolds(1 * 12 + 0, 11, "gt")).toBe(true); // survives at some samples
    expect(evaluate(s, st(1, 0, 11, "gt")).correct).toBe(false);
  });

  it("a transformation preserving ONE sample but not the SET is rejected", () => {
    // x > 4.5 agrees with x > 4 at x = 5 and disagrees at x = 4.2 — exactly the class the
    // witness check could not see. Expressed on the integer lattice as 2x > 9.
    expect(solveBalanceHolds(2 * 5, 9, "gt")).toBe(true); // agrees at the witness
    expect(solveBalanceSetsEqual(solveBalanceSet(2, 0, 9, "gt"), solveBalanceSet(2, 3, 11, "gt"))).toBe(false);
    expect(evaluate(s, st(2, 0, 9, "gt")).correct).toBe(false);
  });
});

describe("ADVERSARIAL — multiplying or dividing by a negative", () => {
  // −2x > 8  ⟺  x < −4. The comparator MUST turn around.
  const s = spec({ a: -2, b: 0, c: 8, relation: "gt" });

  it("the true set is x < −4", () => {
    expect(solveBalanceSet(-2, 0, 8, "gt")).toEqual({ kind: "half", cmp: "lt", num: -4, den: 1 });
  });

  it("x < −4 is ACCEPTED", () => {
    expect(evaluate(s, st(1, 0, -4, "lt")).correct).toBe(true);
  });

  it("x > −4 is REJECTED — dividing by −2 without turning the comparator", () => {
    const r = evaluate(s, st(1, 0, -4, "gt"));
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("the comparator is facing the wrong way");
  });

  it("keeping the negative coefficient is fine IF the claim is still the same set", () => {
    // −2x > 8 restated as −1x > 4 is the same set: x < −4.
    expect(solveBalanceSetsEqual(solveBalanceSet(-1, 0, 4, "gt"), solveBalanceSet(-2, 0, 8, "gt"))).toBe(true);
  });

  it("negating ONE side only is rejected", () => {
    // 2x > 8 (negated the left, not the right) is x > 4 — the opposite half-line.
    expect(evaluate(s, st(2, 0, 8, "gt")).correct).toBe(false);
  });
});

describe("ADVERSARIAL — inclusive comparators", () => {
  // 3x − 6 ≤ 9  ⟺  x ≤ 5
  const s = spec({ a: 3, b: -6, c: 9, relation: "le" });

  it("x ≤ 5 is ACCEPTED", () => {
    expect(solveBalanceSet(3, -6, 9, "le")).toEqual({ kind: "half", cmp: "le", num: 5, den: 1 });
    expect(evaluate(s, st(1, 0, 5, "le")).correct).toBe(true);
  });

  it("x < 5 is REJECTED — dropping the boundary value loses one solution", () => {
    expect(evaluate(s, st(1, 0, 5, "lt")).correct).toBe(false);
  });

  it("x ≤ 6 is REJECTED — right comparator, wrong boundary", () => {
    expect(evaluate(s, st(1, 0, 6, "le")).correct).toBe(false);
  });

  it("the boundary value itself distinguishes ≤ from <", () => {
    // x = 5 satisfies x ≤ 5 and not x < 5 — the single point the two sets disagree on.
    expect(solveBalanceHolds(5, 5, "le")).toBe(true);
    expect(solveBalanceHolds(5, 5, "lt")).toBe(false);
  });
});

describe("equations still behave exactly as before", () => {
  const s = spec({ relation: "eq", a: 2, b: 3, c: 11 });
  it("x = 4 is accepted and x = 3 is not", () => {
    expect(evaluate(s, st(1, 0, 4, "eq")).correct).toBe(true);
    expect(evaluate(s, st(1, 0, 3, "eq")).correct).toBe(false);
  });
  it("an un-isolated but true state is still 'not isolated', not 'unbalanced'", () => {
    // 2x = 8 is the same set as x = 4, but x is not alone yet.
    const r = evaluate(s, st(2, 0, 8, "eq"));
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("x is not alone");
  });
});
