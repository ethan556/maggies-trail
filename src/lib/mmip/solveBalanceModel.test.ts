/**
 * MMIP v1 — the solveBalance canonical model, gated at the mathematics.
 *
 * The expectations in this file are derived INDEPENDENTLY of the module under test:
 *
 *  · "do these two positions make the same claim about x?" is decided by SCANNING a dense grid of
 *    rationals with exact integer arithmetic (multiply through by the denominator), never by
 *    calling solveBalanceEquivalent or solveBalanceSet;
 *  · "is this position graded correct?" is checked against evaluate(), which is a separate
 *    implementation written for the grader — renderer/evaluator agreement is the assertion, not an
 *    assumption;
 *  · every expected pan count and every expected sentence is written out by hand.
 *
 * The claim the whole design rests on is pinned in "a symbolic edit is a sequence of tile moves":
 * typing into the equation strip can reach exactly the positions the tiles can reach, and no others.
 */

import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { equationMorphPlan, reducedMotion, reversePlan } from "./equationMorph";
import { SolveBalanceSpec, type TSolveBalance } from "@/lib/schema";
import {
  SB_REPRESENTATIONS,
  deriveControls,
  deriveSymbol,
  deriveTiles,
  solveBalanceApply,
  solveBalanceClaim,
  solveBalanceDecompose,
  solveBalanceEquivalent,
  solveBalanceFrame,
  solveBalanceInitial,
  solveBalanceCanonicalModel,
  solveBalanceNormalize,
  solveBalanceRepresentations,
  solveBalanceWeights,
  type SBRel,
  type SolveBalanceEdit,
  type SolveBalanceFrame,
  type SolveBalanceState,
  type SolveBalanceTransaction,
} from "./solveBalanceModel";

const FB = {
  successFeedback: "s",
  unbalancedFeedback: "u",
  notIsolatedFeedback: "n",
  missFeedback: "m",
};

const CLASSIC = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3x + 4 = 19.",
  a: 3,
  b: 4,
  c: 19,
  ...FB,
}) as TSolveBalance;

const SIGNED = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve −2x + 5 = −7.",
  a: -2,
  b: 5,
  c: -7,
  ...FB,
}) as TSolveBalance;

const INEQ = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve −2x + 5 > −3.",
  a: -2,
  b: 5,
  c: -3,
  relation: "gt",
  ...FB,
  notFlippedFeedback: "flip",
}) as TSolveBalance;

const GROUPED = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3(x + 2) = 18.",
  a: 3,
  b: 6,
  c: 18,
  groups: { count: 3, x: 1, unit: 2 },
  ...FB,
  unexpandedFeedback: "brackets",
  partialDistributeFeedback: "partial",
}) as TSolveBalance;

const SRC = SB_REPRESENTATIONS.symbol;

/* ───────────────────── independent machinery: exact rational scanning ───────────────────── */

/** Does `coef·(n/d) + units REL rhs` hold? Multiplied through by d > 0, so this is exact integer
 * arithmetic with no float anywhere and no reduced-fraction reasoning borrowed from the module. */
function admits(coef: number, units: number, rhs: number, rel: SBRel, n: number, d: number): boolean {
  const L = coef * n + units * d;
  const R = rhs * d;
  return rel === "eq" ? L === R : rel === "lt" ? L < R : rel === "gt" ? L > R : rel === "le" ? L <= R : L >= R;
}

const DENOMS = [1, 2, 3, 4, 5, 6, 8, 12];
/** Two claims admit the same x, checked point by point over a dense grid of rationals. Independent
 * of solveBalanceSet: this knows nothing about boundaries, reduction, or comparator reversal. */
function sameClaimByScan(
  p: { coefX: number; units: number; rhs: number; rel: SBRel },
  q: { coefX: number; units: number; rhs: number; rel: SBRel }
): boolean {
  for (const d of DENOMS) {
    for (let n = -60 * d; n <= 60 * d; n++) {
      if (admits(p.coefX, p.units, p.rhs, p.rel, n, d) !== admits(q.coefX, q.units, q.rhs, q.rel, n, d)) return false;
    }
  }
  return true;
}

/** The claim a position makes, written out by hand from the pans — not via solveBalanceClaim. */
function claimByHand(spec: TSolveBalance, st: SolveBalanceState) {
  const g = spec.groups;
  const sign = g && g.count < 0 ? -1 : 1;
  return {
    coefX: st.leftX + (g ? st.groups * sign * g.x : 0),
    units: st.leftUnits + (g ? st.groups * sign * g.unit : 0),
    rhs: st.rightUnits,
    rel: st.rel,
  };
}

const stateOf = (
  leftX: number,
  leftUnits: number,
  rightUnits: number,
  extra: Partial<SolveBalanceState> = {}
): SolveBalanceState => ({ leftX, leftUnits, rightUnits, groups: 0, partial: 0, rel: "eq", ...extra });

const run = (frame: SolveBalanceFrame, st: SolveBalanceState, edit: SolveBalanceEdit) =>
  solveBalanceApply(frame, st, edit, "symbolic", SRC);

const fold = (frame: SolveBalanceFrame, st: SolveBalanceState, edits: readonly SolveBalanceEdit[]) =>
  edits.reduce((acc, e) => solveBalanceApply(frame, acc, e, "physical", SB_REPRESENTATIONS.tiles).after, st);

/* ─────────────────────────────── the state is the pans ─────────────────────────────── */

describe("the canonical state", () => {
  it("starts as the problem is written, brackets closed", () => {
    expect(solveBalanceInitial(solveBalanceFrame(CLASSIC))).toEqual({
      leftX: 3,
      leftUnits: 4,
      rightUnits: 19,
      groups: 0,
      partial: 0,
      rel: "eq",
    });
    expect(solveBalanceInitial(solveBalanceFrame(GROUPED))).toEqual({
      leftX: 0,
      leftUnits: 0,
      rightUnits: 18,
      groups: 3,
      partial: 0,
      rel: "eq",
    });
  });

  it("normalises a three-field value restored from storage without throwing", () => {
    const frame = solveBalanceFrame(CLASSIC);
    expect(solveBalanceNormalize(frame, { leftX: 1, leftUnits: 0, rightUnits: 5 })).toEqual({
      leftX: 1,
      leftUnits: 0,
      rightUnits: 5,
      groups: 0,
      partial: 0,
      rel: "eq",
    });
    expect(solveBalanceNormalize(frame, null)).toEqual(solveBalanceInitial(frame));
    expect(solveBalanceNormalize(frame, { rel: "banana" })).toEqual(solveBalanceInitial(frame));
    expect(solveBalanceNormalize(frame, "nonsense")).toEqual(solveBalanceInitial(frame));
  });

  it("is pure: the same edit from the same state gives byte-identical results, and never mutates", () => {
    const frame = solveBalanceFrame(CLASSIC);
    const st = solveBalanceInitial(frame);
    const frozen = { ...st };
    const a = run(frame, st, { kind: "setLeftConstant", value: 0 });
    const b = run(frame, st, { kind: "setLeftConstant", value: 0 });
    expect(a.after).toEqual(b.after);
    expect(a.ops).toEqual(b.ops);
    expect(st).toEqual(frozen);
  });
});

/* ───────────────────────── ROUND TRIP: tiles → symbol → tiles ───────────────────────── */

describe("round trip — a tile move is read off the symbol, and read back onto the tiles", () => {
  const frame = solveBalanceFrame(CLASSIC);

  it("tiles → symbol: two taps on the left pan show up as the constant, by hand 4 − 2 = 2", () => {
    let st = solveBalanceInitial(frame);
    st = solveBalanceApply(frame, st, { kind: "tapLeftUnit" }, "physical", SB_REPRESENTATIONS.tiles).after;
    st = solveBalanceApply(frame, st, { kind: "tapLeftUnit" }, "physical", SB_REPRESENTATIONS.tiles).after;
    const sym = deriveSymbol(frame, st);
    expect(sym.slots.leftConstant.value).toBe(2);
    expect(sym.slots.leftCoefficient.value).toBe(3);
    expect(sym.slots.rightConstant.value).toBe(19);
    expect(sym.sentence).toBe("3x + 2 = 19");
  });

  it("symbol → tiles: typing the constant down to 0 empties exactly that pile and nothing else", () => {
    let st = solveBalanceInitial(frame);
    st = run(frame, st, { kind: "setLeftConstant", value: 0 }).after;
    const view = deriveTiles(frame, st);
    expect(view.left.unitTiles).toBe(0);
    expect(view.left.xTiles).toBe(3);
    expect(view.right.unitTiles).toBe(19);
    // One-sided: 3·5 + 0 = 15 against 19, so the beam is not level. That is the point of the engine.
    expect(view.weights.left).toBe(15);
    expect(view.weights.right).toBe(19);
    expect(view.weights.holds).toBe(false);
  });

  it("tiles → symbol → tiles returns the position it started in, exactly", () => {
    const st0 = solveBalanceInitial(frame);
    const tapped = solveBalanceApply(frame, st0, { kind: "tapLeftUnit" }, "physical", SB_REPRESENTATIONS.tiles).after;
    // read the tiles off the symbol, then write that number back
    const back = run(frame, tapped, { kind: "setLeftConstant", value: deriveSymbol(frame, st0).slots.leftConstant.value }).after;
    expect(back).toEqual(st0);
  });

  it("symbol → tiles → symbol returns the sentence it started with", () => {
    const st0 = solveBalanceInitial(frame);
    const typed = run(frame, st0, { kind: "setRightConstant", value: 15 }).after;
    expect(deriveSymbol(frame, typed).sentence).toBe("3x + 4 = 15");
    // four taps on the right pan, one at a time, walk it back to 19? no — taps only shrink. Use the
    // adder, which is the tile route the strip reveals.
    let st = typed;
    for (let i = 0; i < 4; i++)
      st = solveBalanceApply(frame, st, { kind: "stepRightUnits", delta: 1 }, "physical", SB_REPRESENTATIONS.tiles).after;
    expect(st).toEqual(st0);
    expect(deriveSymbol(frame, st).sentence).toBe("3x + 4 = 19");
  });

  it("a full solve reached symbolically and a full solve reached physically land on ONE state", () => {
    const st0 = solveBalanceInitial(frame);
    // physical: four taps off each pan, then split
    let physical = st0;
    for (let i = 0; i < 4; i++) {
      physical = solveBalanceApply(frame, physical, { kind: "tapLeftUnit" }, "physical", SB_REPRESENTATIONS.tiles).after;
      physical = solveBalanceApply(frame, physical, { kind: "tapRightUnit" }, "physical", SB_REPRESENTATIONS.tiles).after;
    }
    physical = solveBalanceApply(frame, physical, { kind: "split" }, "control", SB_REPRESENTATIONS.controls).after;
    // symbolic: type both constants, then use the same split control
    let symbolic = run(frame, st0, { kind: "setLeftConstant", value: 0 }).after;
    symbolic = run(frame, symbolic, { kind: "setRightConstant", value: 15 }).after;
    symbolic = solveBalanceApply(frame, symbolic, { kind: "split" }, "control", SB_REPRESENTATIONS.controls).after;
    expect(symbolic).toEqual(physical);
    expect(deriveSymbol(frame, symbolic).sentence).toBe("x = 5");
    expect(evaluate(CLASSIC, symbolic).correct).toBe(true);
  });
});

/* ────────────── the load-bearing claim: symbolic edits add no reach over the tiles ────────────── */

describe("a symbolic edit IS a sequence of tile moves", () => {
  const frame = solveBalanceFrame(SIGNED); // −2x + 5 = −7, so both signs are in play

  const CASES: Array<{ from: SolveBalanceState; edit: SolveBalanceEdit; steps: number }> = [
    { from: stateOf(-2, 5, -7), edit: { kind: "setLeftConstant", value: 0 }, steps: 5 },
    { from: stateOf(-2, 5, -7), edit: { kind: "setLeftConstant", value: -3 }, steps: 8 }, // crosses zero
    { from: stateOf(-2, 5, -7), edit: { kind: "setRightConstant", value: -12 }, steps: 5 },
    { from: stateOf(-2, 5, -7), edit: { kind: "setRightConstant", value: 2 }, steps: 9 }, // crosses zero
    { from: stateOf(-2, 5, -7), edit: { kind: "setLeftCoefficient", value: 0 }, steps: 2 },
    { from: stateOf(-2, 5, -7), edit: { kind: "setLeftCoefficient", value: -1 }, steps: 1 },
    { from: stateOf(4, 3, 9), edit: { kind: "setLeftCoefficient", value: 1 }, steps: 3 },
    { from: stateOf(4, 3, 9), edit: { kind: "setLeftConstant", value: 9 }, steps: 6 },
  ];

  it.each(CASES)("$edit.kind to $edit.value decomposes into $steps single-tile moves", ({ from, edit, steps }) => {
    const primitives = solveBalanceDecompose(frame, from, edit);
    expect(primitives).toHaveLength(steps);
    // every primitive really is a single-tile affordance
    for (const p of primitives)
      expect(["tapLeftUnit", "tapRightUnit", "tapLeftX", "stepLeftUnits", "stepRightUnits"]).toContain(p.kind);
    // and the whole typed edit equals doing them one at a time
    expect(fold(frame, from, primitives)).toEqual(run(frame, from, edit).after);
  });

  it("the tile route is walked one tile at a time — no step ever moves two", () => {
    const primitives = solveBalanceDecompose(frame, stateOf(-2, 5, -7), { kind: "setRightConstant", value: 2 });
    let cur = -7;
    for (const p of primitives) {
      const next =
        p.kind === "tapRightUnit" ? cur - Math.sign(cur) : cur + (p.kind === "stepRightUnits" ? p.delta : 0);
      expect(Math.abs(next - cur)).toBe(1);
      cur = next;
    }
    expect(cur).toBe(2);
  });

  it("x-tiles cannot be conjured: growing the coefficient is refused, in mathematics", () => {
    const tx = run(frame, stateOf(2, 0, 10), { kind: "setLeftCoefficient", value: 5 });
    expect(tx.rejected).toBe(true);
    expect(tx.after).toEqual(tx.before);
    expect(tx.rejection?.code).toBe("no-x-conjuring");
    expect(tx.rejection?.message).toMatch(/never put on one/);
    // ...and the same refusal for a sign flip, which is a growth in disguise
    expect(run(frame, stateOf(2, 0, 10), { kind: "setLeftCoefficient", value: -2 }).rejection?.code).toBe(
      "no-x-conjuring"
    );
    // the slot advertises the same rule before it is broken
    const slot = deriveSymbol(frame, stateOf(2, 0, 10)).slots.leftCoefficient;
    expect([slot.min, slot.max]).toEqual([0, 2]);
    expect(deriveSymbol(frame, stateOf(-2, 0, 10)).slots.leftCoefficient).toMatchObject({ min: -2, max: 0 });
  });

  it("a pan cannot be filled past what can be counted by eye", () => {
    const tx = run(frame, stateOf(-2, 5, -7), { kind: "setRightConstant", value: 400 });
    expect(tx.rejected).toBe(true);
    expect(tx.rejection?.code).toBe("pan-too-full");
    expect(run(frame, stateOf(-2, 5, -7), { kind: "setLeftConstant", value: 1.5 }).rejection?.code).toBe("non-integer");
  });

  it("a standing bracket makes the whole strip inert — distribute first", () => {
    const gf = solveBalanceFrame(GROUPED);
    const st = solveBalanceInitial(gf);
    const sym = deriveSymbol(gf, st);
    expect(sym.editable).toBe(false);
    expect(sym.lockedReason).toMatch(/unopened brackets/);
    for (const slot of [sym.slots.leftCoefficient, sym.slots.leftConstant, sym.slots.rightConstant])
      expect(slot.editable).toBe(false);
    expect(run(gf, st, { kind: "setRightConstant", value: 12 }).rejection?.code).toBe("brackets-standing");
    // once the brackets are opened it is editable, and the sentence is the flat form
    const flat = solveBalanceApply(gf, st, { kind: "distributeAll" }, "control", SB_REPRESENTATIONS.controls).after;
    expect(flat).toEqual(stateOf(3, 6, 18));
    expect(deriveSymbol(gf, flat).editable).toBe(true);
    expect(deriveSymbol(gf, flat).sentence).toBe("3x + 6 = 18");
  });
});

/* ──────────────────── renderer / evaluator agreement, derived independently ──────────────────── */

describe("what the beam shows and what the grader concludes are the same fact", () => {
  const SWEEP: SolveBalanceState[] = [];
  for (const leftX of [0, 1, 2, 3]) {
    for (const leftUnits of [0, 1, 4]) {
      for (const rightUnits of [0, 5, 15, 19]) {
        SWEEP.push(stateOf(leftX, leftUnits, rightUnits));
      }
    }
  }

  it("the pans weigh what hand arithmetic says they weigh, at the hidden x", () => {
    const frame = solveBalanceFrame(CLASSIC);
    expect(frame.witness).toBe(5); // (19 − 4) / 3
    for (const st of SWEEP) {
      const w = solveBalanceWeights(frame, st);
      expect(w.left).toBe(st.leftX * 5 + st.leftUnits);
      expect(w.right).toBe(st.rightUnits);
      expect(w.holds).toBe(w.left === w.right);
      expect(w.heavier).toBe(w.left > w.right ? "left" : w.left < w.right ? "right" : "level");
    }
  });

  it("an equation: evaluate() marks correct exactly when the beam holds and x stands alone", () => {
    const frame = solveBalanceFrame(CLASSIC);
    const truth = claimByHand(CLASSIC, solveBalanceInitial(frame));
    for (const st of SWEEP) {
      const independent =
        sameClaimByScan(claimByHand(CLASSIC, st), truth) && st.leftX === 1 && st.leftUnits === 0 && st.groups === 0;
      expect([st, evaluate(CLASSIC, st).correct]).toEqual([st, independent]);
      expect([st, solveBalanceWeights(frame, st).done]).toEqual([st, independent]);
    }
  });

  it("an inequality: correctness is SET equality, and the model agrees point by point", () => {
    const frame = solveBalanceFrame(INEQ);
    const truth = claimByHand(INEQ, solveBalanceInitial(frame));
    const rels: SBRel[] = ["gt", "lt"];
    for (const rel of rels) {
      for (const leftX of [-2, -1, 1, 2]) {
        for (const leftUnits of [0, 5, -5]) {
          for (const rightUnits of [-8, -3, 3, 4]) {
            const st = stateOf(leftX, leftUnits, rightUnits, { rel });
            const sameSet = sameClaimByScan(claimByHand(INEQ, st), truth);
            expect([st, solveBalanceEquivalent(frame, st, solveBalanceInitial(frame))]).toEqual([st, sameSet]);
            expect([st, evaluate(INEQ, st).correct]).toEqual([
              st,
              sameSet && st.leftX === 1 && st.leftUnits === 0 && st.groups === 0,
            ]);
          }
        }
      }
    }
  });

  it("a NEGATIVE bracket: the grader now agrees with the beam at every sealed position (S208 Wave 2b)", () => {
    // −5(x + 3) = −20, weighed at x = 1. This is the position where `evaluate.ts` used to weigh a
    // standing bracket without `sign(count)` and contradict the picture. The expectation is derived
    // from the dense rational grid — the same independent route used for the equation and the
    // inequality above — never from the model's own set arithmetic.
    const spec = SolveBalanceSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5,
      b: -15,
      c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TSolveBalance;
    const frame = solveBalanceFrame(spec);
    expect(frame.witness).toBe(1);
    const truth = claimByHand(spec, solveBalanceInitial(frame));

    let checked = 0;
    for (const groups of [0, 5]) {
      for (const leftX of [-5, -1, 0, 1]) {
        for (const leftUnits of [-15, -3, 0, 2]) {
          for (const rightUnits of [-20, -19, -5, -1, 1]) {
            const st = stateOf(leftX, leftUnits, rightUnits, { groups });
            checked++;
            // 1. correctness: set equality plus isolation, both derived independently
            const independent =
              sameClaimByScan(claimByHand(spec, st), truth) &&
              st.leftX === 1 &&
              st.leftUnits === 0 &&
              st.groups === 0;
            expect([st, evaluate(spec, st).correct]).toEqual([st, independent]);
            // 2. the diagnosis: the grader may only call a position broken when the beam is tipped
            const level = solveBalanceWeights(frame, st).holds;
            const fb = evaluate(spec, st).feedback;
            const graderSaysBroken = fb === "u" || fb === "partial";
            const coefX = claimByHand(spec, st).coefX;
            if (coefX === 0 && st.groups === 0) continue; // the "no x left" branch pre-empts the beam
            expect([st, level]).toEqual([st, !graderSaysBroken]);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
    // and the headline: the sealed start is level, so it is unfinished rather than broken
    expect(evaluate(spec, solveBalanceInitial(frame)).feedback).toBe("brackets");
    expect(solveBalanceWeights(frame, solveBalanceInitial(frame)).holds).toBe(true);
  });

  it("the witness really satisfies the claim being made, so a true claim tilts the beam on purpose", () => {
    for (const spec of [CLASSIC, SIGNED, INEQ]) {
      const frame = solveBalanceFrame(spec);
      const rel = spec.relation ?? "eq";
      expect(admits(spec.a, spec.b, spec.c, rel, frame.witness, 1)).toBe(true);
    }
  });

  it("equivalence is about the SET of x, not the shape of the sentence", () => {
    const frame = solveBalanceFrame(CLASSIC);
    // 3x = 15 and x = 5 are the same claim written twice; 3x = 14 is not.
    expect(solveBalanceEquivalent(frame, stateOf(3, 0, 15), stateOf(1, 0, 5))).toBe(true);
    expect(solveBalanceEquivalent(frame, stateOf(3, 0, 14), stateOf(1, 0, 5))).toBe(false);
    expect(solveBalanceEquivalent(frame, stateOf(3, 4, 19), stateOf(1, 0, 5))).toBe(true);
    // and the independent scan says the same thing
    expect(
      sameClaimByScan(claimByHand(CLASSIC, stateOf(3, 0, 15)), claimByHand(CLASSIC, stateOf(1, 0, 5)))
    ).toBe(true);
    expect(
      sameClaimByScan(claimByHand(CLASSIC, stateOf(3, 0, 14)), claimByHand(CLASSIC, stateOf(1, 0, 5)))
    ).toBe(false);
  });

  it("solveBalanceClaim counts a standing bracket at what it weighs", () => {
    const gf = solveBalanceFrame(GROUPED);
    expect(solveBalanceClaim(gf, solveBalanceInitial(gf))).toEqual({ coefX: 3, units: 6, rhs: 18, rel: "eq" });
  });
});

/* ─────────────────────────── the classic moves still mean what they meant ─────────────────────────── */

describe("the named moves", () => {
  it("splitting is division done to both pans, and is offered only when it is exact", () => {
    const frame = solveBalanceFrame(CLASSIC);
    expect(deriveControls(frame, stateOf(3, 0, 15)).canSplit).toBe(true);
    expect(deriveControls(frame, stateOf(3, 0, 14)).canSplit).toBe(false);
    expect(deriveControls(frame, stateOf(3, 4, 19)).canSplit).toBe(false);
    expect(deriveControls(frame, stateOf(1, 0, 5)).canSplit).toBe(false);
    const tx = solveBalanceApply(frame, stateOf(3, 0, 15), { kind: "split" }, "control", SB_REPRESENTATIONS.controls);
    expect(tx.after).toEqual(stateOf(1, 0, 5));
    expect(tx.ops[0]).toMatchObject({ kind: "divide", amount: 3, sides: ["left", "right"] });
    const no = solveBalanceApply(frame, stateOf(3, 0, 14), { kind: "split" }, "control", SB_REPRESENTATIONS.controls);
    expect(no.rejected).toBe(true);
    expect(no.rejection?.message).toMatch(/14 does not share into 3/);
  });

  it("splitting keeps the sign and divides by the magnitude", () => {
    const frame = solveBalanceFrame(SolveBalanceSpec.parse({ ...SIGNED, b: 0, c: -12 }) as TSolveBalance);
    const tx = solveBalanceApply(frame, stateOf(-2, 0, -12), { kind: "split" }, "control", SB_REPRESENTATIONS.controls);
    expect(tx.after).toMatchObject({ leftX: -1, rightUnits: -6 });
  });

  it("×(−1) turns every tile over and is refused when there is nothing negative to turn", () => {
    const frame = solveBalanceFrame(SIGNED);
    const tx = solveBalanceApply(frame, stateOf(-1, 0, -6), { kind: "negate" }, "control", SB_REPRESENTATIONS.controls);
    expect(tx.after).toEqual(stateOf(1, 0, 6));
    expect(tx.ops[0]).toMatchObject({ kind: "negate", sides: ["left", "right"] });
    expect(
      solveBalanceApply(solveBalanceFrame(CLASSIC), stateOf(3, 4, 19), { kind: "negate" }, "control", "x").rejected
    ).toBe(true);
  });

  it("the comparator turns round only where there is a direction to turn", () => {
    const frame = solveBalanceFrame(INEQ);
    const tx = solveBalanceApply(frame, stateOf(2, -5, 3, { rel: "gt" }), { kind: "flipRelation" }, "control", "c");
    expect(tx.after.rel).toBe("lt");
    expect(tx.ops[0]).toMatchObject({ kind: "reorient", target: "relation" });
    expect(
      solveBalanceApply(solveBalanceFrame(CLASSIC), stateOf(3, 4, 19), { kind: "flipRelation" }, "control", "c").rejected
    ).toBe(true);
  });

  it("distributing to both parts conserves the pan; to the x alone it does not — and both are named", () => {
    const gf = solveBalanceFrame(GROUPED);
    const st = solveBalanceInitial(gf);
    const all = solveBalanceApply(gf, st, { kind: "distributeAll" }, "control", "c");
    expect(all.after).toEqual(stateOf(3, 6, 18));
    expect(solveBalanceWeights(gf, all.after).holds).toBe(true);
    expect(all.ops.map((o) => o.kind)).toEqual(["distribute", "distribute"]);
    expect(all.ops.map((o) => o.amount)).toEqual([3, 6]);

    const partial = solveBalanceApply(gf, st, { kind: "distributeXOnly" }, "control", "c");
    expect(partial.after).toEqual(stateOf(3, 2, 18, { partial: 1 }));
    expect(solveBalanceWeights(gf, partial.after).holds).toBe(false);
    expect(partial.ops[1].amount).toBe(2); // one copy of the constant survived
    expect(evaluate(GROUPED, partial.after).feedback).toBe("partial");
  });

  it("a negative multiplier sends the minus to every chip inside the bracket", () => {
    const spec = SolveBalanceSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5,
      b: -15,
      c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TSolveBalance;
    const frame = solveBalanceFrame(spec);
    const st = solveBalanceInitial(frame);
    expect(frame.gSign).toBe(-1);
    expect(solveBalanceApply(frame, st, { kind: "distributeAll" }, "control", "c").after).toEqual(
      stateOf(-5, -15, -20)
    );
    expect(solveBalanceApply(frame, st, { kind: "distributeXOnly" }, "control", "c").after).toEqual(
      stateOf(-5, -3, -20, { partial: 1 })
    );
  });

  it("restore is an ordinary transaction, so undo is not a second mutation path", () => {
    // S208 review, condition 5. The session owns the stack — the model stays historyless — but the
    // step back itself goes through `apply` like every other move: described, normalised, and
    // compiled to motion.
    const frame = solveBalanceFrame(CLASSIC);
    const tx = solveBalanceApply(
      frame,
      stateOf(1, 0, 5),
      { kind: "restore", to: stateOf(3, 0, 15) },
      "control",
      SB_REPRESENTATIONS.controls
    );
    expect(tx.after).toEqual(stateOf(3, 0, 15));
    expect(tx.rejected).toBe(false);
    expect(tx.changed).toBe(true);
    expect(tx.ops).toHaveLength(1);
    expect(tx.ops[0]).toMatchObject({ kind: "restore", target: "equation", sides: ["left", "right"] });
    expect(tx.ops[0].describe).toBe("Stepped back to the position before that move: 3x = 15.");
  });

  it("restore normalises what it is handed — undo is not a door for a malformed state", () => {
    const frame = solveBalanceFrame(CLASSIC);
    // A pre-S114 snapshot carries only the three pan counts; the rest must fall to the problem's
    // own defaults rather than arriving as undefined.
    const legacy = { leftX: 2, leftUnits: 1, rightUnits: 11 } as unknown as SolveBalanceState;
    const tx = solveBalanceApply(frame, stateOf(1, 0, 5), { kind: "restore", to: legacy }, "control", "c");
    expect(tx.after).toEqual({ leftX: 2, leftUnits: 1, rightUnits: 11, groups: 0, partial: 0, rel: "eq" });
    // and outright nonsense lands on the problem as written rather than throwing
    const junk = solveBalanceApply(frame, stateOf(1, 0, 5), { kind: "restore", to: { rel: "banana" } as unknown as SolveBalanceState }, "control", "c");
    expect(junk.after).toEqual(solveBalanceInitial(frame));
  });

  it("restoring the position already stood in changes nothing and is not an error", () => {
    const frame = solveBalanceFrame(CLASSIC);
    const tx = solveBalanceApply(frame, stateOf(3, 4, 19), { kind: "restore", to: stateOf(3, 4, 19) }, "control", "c");
    expect(tx.rejected).toBe(false);
    expect(tx.changed).toBe(false);
    expect(equationMorphPlan(tx).phases).toEqual([]);
  });

  it("reset puts every tile back and says so", () => {
    const frame = solveBalanceFrame(CLASSIC);
    const tx = solveBalanceApply(frame, stateOf(1, 0, 5), { kind: "reset" }, "control", "c");
    expect(tx.after).toEqual(solveBalanceInitial(frame));
    expect(tx.ops[0]).toMatchObject({ kind: "restore" });
  });
});

/* ───────────────────────── the transaction record the morph layer reads ───────────────────────── */

describe("the operation log", () => {
  const frame = solveBalanceFrame(CLASSIC);

  it("carries origin, source, before, after and named operations for every edit", () => {
    const tx = solveBalanceApply(frame, stateOf(3, 4, 19), { kind: "tapLeftUnit" }, "physical", SB_REPRESENTATIONS.tiles);
    expect(tx.origin).toBe("physical");
    expect(tx.source).toBe("solveBalance.tiles");
    expect(tx.before).toEqual(stateOf(3, 4, 19));
    expect(tx.after).toEqual(stateOf(3, 3, 19));
    expect(tx.changed).toBe(true);
    expect(tx.rejected).toBe(false);
    expect(tx.ops).toEqual([
      {
        kind: "subtract",
        target: "leftUnits",
        amount: -1,
        sides: ["left"],
        describe: "Took 1 unit tile off the left pan only — it now holds 3.",
      },
    ]);
  });

  it("a move that crosses zero is TWO operations — the tiles leave, then the opposite tiles arrive", () => {
    const tx = run(frame, stateOf(3, 2, 19), { kind: "setLeftConstant", value: -2 });
    expect(tx.ops.map((o) => [o.kind, o.amount])).toEqual([
      ["subtract", -2],
      ["add", -2],
    ]);
    expect(tx.after.leftUnits).toBe(-2);
  });

  it("the ±1 adder that meets a negative pile reports a zero pair, not a removal", () => {
    const sf = solveBalanceFrame(SIGNED);
    const tx = solveBalanceApply(sf, stateOf(-2, -3, -7), { kind: "stepLeftUnits", delta: 1 }, "physical", "t");
    expect(tx.ops[0].kind).toBe("cancel");
    expect(tx.ops[0].describe).toMatch(/zero pair/);
  });

  it("every operation describes the mathematics, never the machinery", () => {
    const edits: SolveBalanceEdit[] = [
      { kind: "tapLeftUnit" },
      { kind: "tapRightUnit" },
      { kind: "tapLeftX" },
      { kind: "stepLeftUnits", delta: -1 },
      { kind: "split" },
      { kind: "reset" },
    ];
    for (const e of edits) {
      const tx = solveBalanceApply(frame, stateOf(3, 0, 15), e, "physical", "t");
      for (const o of tx.ops) {
        expect(o.describe.length).toBeGreaterThan(24);
        expect(o.describe).not.toMatch(/slider|field|button|click|tap the/i);
        expect(o.sides.length).toBeGreaterThan(0);
      }
    }
  });

  it("never leaks the answer: no description, slot meaning or rejection names the hidden x", () => {
    // 3x + 4 = 19 solves to 5. Nothing derived from a mid-solve state may say so.
    const st = stateOf(3, 4, 19);
    const strings = [
      ...deriveSymbol(frame, st).slots.leftCoefficient.meaning,
      deriveSymbol(frame, st).sentence,
      deriveSymbol(frame, st).slots.leftConstant.meaning,
      deriveSymbol(frame, st).slots.rightConstant.meaning,
      ...[
        { kind: "tapLeftUnit" } as const,
        { kind: "tapRightUnit" } as const,
        { kind: "setLeftConstant", value: 0 } as const,
      ].flatMap((e) => solveBalanceApply(frame, st, e, "symbolic", SRC).ops.map((o) => o.describe)),
    ].join(" ");
    expect(strings).not.toMatch(/x = 5|x is 5|equals 5|answer/i);
    // the witness is in the frame, where the renderer needs it, and in no derived string
    expect(frame.witness).toBe(5);
  });
});

/* ───────────────────────────── the MMIP surface itself ───────────────────────────── */

describe("the MMIP participant surface", () => {
  it("exposes three representations, all derived from the same state, one of them gated", () => {
    const frame = solveBalanceFrame(GROUPED);
    const [tilesRep, controlsRep, symRep] = solveBalanceRepresentations(frame);
    const st = solveBalanceInitial(frame);
    expect(tilesRep.id).toBe("solveBalance.tiles");
    expect(tilesRep.derive(st)).toEqual(deriveTiles(frame, st));
    expect(controlsRep.derive(st)).toEqual(deriveControls(frame, st));
    expect(symRep.derive(st)).toEqual(deriveSymbol(frame, st));
    expect(symRep.editable(st)).toBe(false); // brackets standing
    expect(symRep.editable({ ...st, groups: 0 })).toBe(true);
  });

  it("the assembled object answers the CanonicalModel contract, bindings and all", () => {
    const model = solveBalanceCanonicalModel(CLASSIC);
    // the three representations derive through the bindings, not around them
    expect(model.representations.map((r) => r.id)).toEqual([
      "solveBalance.tiles",
      "solveBalance.controls",
      "solveBalance.symbol",
    ]);
    expect(model.views(model.initial)).toEqual({
      tiles: deriveTiles(model.frame, model.initial),
      controls: deriveControls(model.frame, model.initial),
      symbol: deriveSymbol(model.frame, model.initial),
    });
    expect(model.id).toBe("solveBalance");
    expect(model.initial).toEqual(stateOf(3, 4, 19));
    expect(model.normalize(undefined)).toEqual(model.initial);
    expect(model.equivalent(stateOf(3, 0, 15), stateOf(1, 0, 5))).toBe(true);
    const tx = model.apply(model.initial, { kind: "tapLeftUnit" }, "physical", "t");
    expect(tx.after).toEqual(stateOf(3, 3, 19));
  });
});

/* ───────────── the morph layer's live producer: plans compiled from REAL transactions ───────────── */

/**
 * S2's smoke check, run against this engine rather than against hand-written ops. Every phase must
 * have something on stage — a phase with no actors is precisely the "crossfade two strings" failure
 * the morph contract forbids — and no learner action may compile to more than four phases, because
 * a five-beat animation for one move is no longer an explanation.
 */
describe("equationMorphPlan over this engine's own transactions", () => {
  const cf = solveBalanceFrame(CLASSIC);
  const sf = solveBalanceFrame(SIGNED);
  const gf = solveBalanceFrame(GROUPED);
  const nf = solveBalanceFrame(INEQ);
  const T = SB_REPRESENTATIONS.tiles;
  const C = SB_REPRESENTATIONS.controls;

  const CASES: Array<{ label: string; tx: SolveBalanceTransaction }> = [
    { label: "tap a left unit", tx: solveBalanceApply(cf, stateOf(3, 4, 19), { kind: "tapLeftUnit" }, "physical", T) },
    { label: "tap an x-tile", tx: solveBalanceApply(cf, stateOf(3, 4, 19), { kind: "tapLeftX" }, "physical", T) },
    { label: "adder onto a negative pile", tx: solveBalanceApply(sf, stateOf(-2, -3, -7), { kind: "stepLeftUnits", delta: 1 }, "physical", T) },
    { label: "split", tx: solveBalanceApply(cf, stateOf(3, 0, 15), { kind: "split" }, "control", C) },
    { label: "negate", tx: solveBalanceApply(sf, stateOf(-1, 0, -6), { kind: "negate" }, "control", C) },
    { label: "flip the comparator", tx: solveBalanceApply(nf, stateOf(2, -5, 3, { rel: "gt" }), { kind: "flipRelation" }, "control", C) },
    { label: "distribute to both parts", tx: solveBalanceApply(gf, solveBalanceInitial(gf), { kind: "distributeAll" }, "control", C) },
    { label: "distribute to the x only", tx: solveBalanceApply(gf, solveBalanceInitial(gf), { kind: "distributeXOnly" }, "control", C) },
    { label: "reset", tx: solveBalanceApply(cf, stateOf(1, 0, 5), { kind: "reset" }, "control", C) },
    { label: "typed constant down", tx: run(cf, stateOf(3, 4, 19), { kind: "setLeftConstant", value: 1 }) },
    { label: "typed constant across zero", tx: run(cf, stateOf(3, 2, 19), { kind: "setLeftConstant", value: -2 }) },
    { label: "typed right side up", tx: run(cf, stateOf(3, 4, 19), { kind: "setRightConstant", value: 21 }) },
    { label: "typed coefficient down", tx: run(cf, stateOf(3, 4, 19), { kind: "setLeftCoefficient", value: 1 }) },
  ];

  /** Two typed edits, one per pan, recorded as one transaction — the shape a future "do the same to
   * both sides" affordance emits, built here out of ops this model really produced. */
  const bothSides: SolveBalanceTransaction = (() => {
    const left = run(cf, stateOf(3, 4, 19), { kind: "setLeftConstant", value: 0 });
    const right = run(cf, left.after, { kind: "setRightConstant", value: 15 });
    return { ...right, before: left.before, ops: [...left.ops, ...right.ops] };
  })();

  it("never compiles a phase with nothing on stage, and never exceeds four phases", () => {
    for (const { label, tx } of [...CASES, { label: "both pans at once", tx: bothSides }]) {
      const plan = equationMorphPlan(tx);
      expect([label, plan.rejected]).toEqual([label, false]);
      expect([label, plan.phases.length > 0 && plan.phases.length <= 4]).toEqual([label, true]);
      for (const phase of plan.phases) {
        // an empty actor list IS the crossfade case the contract forbids
        expect([label, phase.actors.length >= 1]).toEqual([label, true]);
        expect([label, phase.describe.length > 12]).toEqual([label, true]);
        // actors are the plan's own "<target>:<side>" ids, not fabricated names
        for (const actor of phase.actors) {
          const [target, side] = actor.split(":");
          expect(["leftX", "leftUnits", "rightUnits", "groups", "relation", "equation"], label).toContain(target);
          expect(["left", "right"], label).toContain(side);
        }
      }
    }
  });

  it("two one-sided typed edits read as ONE both-pans motion, not two", () => {
    const plan = equationMorphPlan(bothSides);
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0].motion).toBe("leave");
    expect(plan.phases[0].actors).toEqual(["leftUnits:left", "rightUnits:right"]);
    expect(plan.phases[0].fromRole).toBe("equation-slot");
  });

  it("a refused edit compiles to no motion at all — only the refusal is spoken", () => {
    const refused = run(cf, stateOf(3, 4, 19), { kind: "setLeftCoefficient", value: 9 });
    const plan = equationMorphPlan(refused);
    expect(plan.rejected).toBe(true);
    expect(plan.phases).toEqual([]);
    expect(plan.message).toMatch(/never put on one/);
    expect(reducedMotion(plan)).toEqual(plan);
    expect(reversePlan(plan)).toEqual(plan);
  });

  it("under reduced motion one still phase carries every description plus the net delta", () => {
    const plan = equationMorphPlan(run(cf, stateOf(3, 2, 19), { kind: "setLeftConstant", value: -2 }));
    expect(plan.phases).toHaveLength(2);
    const still = reducedMotion(plan);
    expect(still.phases).toHaveLength(1);
    expect(still.phases[0].durationWeight).toBe(0);
    for (const p of plan.phases) expect(still.phases[0].describe).toContain(p.describe);
    expect(still.phases[0].describe).toMatch(/State delta/);
  });

  it("undo is the same plan read backwards", () => {
    const plan = equationMorphPlan(solveBalanceApply(cf, stateOf(3, 4, 19), { kind: "tapLeftUnit" }, "physical", T));
    expect(plan.phases[0].motion).toBe("leave");
    const undone = reversePlan(plan);
    expect(undone.phases[0].motion).toBe("join");
    expect(undone.phases[0].fromRole).toBe(plan.phases[0].toRole);
    expect(reversePlan(undone)).toEqual(plan);
  });
});
