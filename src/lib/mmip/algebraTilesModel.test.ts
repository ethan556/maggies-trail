/**
 * The algebraTiles canonical model — the ZERO-PAIR decision, gated.
 *
 * Every expected count below is counted by hand in the comment beside it. Nothing is read back
 * from the module under test.
 */
import { describe, expect, it } from "vitest";
import { equationMorphPlan } from "./equationMorph";
import { algebraTilesPartials } from "@/lib/schema";
import {
  AT_REPRESENTATIONS,
  algebraTilesApply,
  algebraTilesCanonicalModel,
  algebraTilesDecompose,
  algebraTilesEquivalent,
  algebraTilesFrame,
  algebraTilesInitial,
  algebraTilesNet,
  algebraTilesNormalize,
  algebraTilesNetSquare,
  deriveArea,
  AREA_X_LEN,
  AREA_UNIT_LEN,
  deriveControls,
  deriveExpression,
  deriveMat,
  type AlgebraTilesEdit,
  type AlgebraTilesState,
} from "./algebraTilesModel";

/** The gallery lesson: build −3x + 5x, read 2x. maxTiles 8. */
const SPEC = { targetX: 2, targetConst: 0, maxTiles: 8, xStart: 0, constStart: 0 };
const frame = algebraTilesFrame(SPEC);
const M = AT_REPRESENTATIONS.mat;

const mat = (xPos: number, xNeg: number, uPos = 0, uNeg = 0, extra: Partial<AlgebraTilesState> = {}): AlgebraTilesState => ({
  xPos, xNeg, uPos, uNeg, sqPos: 0, sqNeg: 0, framed: false, ...extra,
});
const run = (st: AlgebraTilesState, edit: AlgebraTilesEdit, origin: "physical" | "control" | "symbolic" = "physical") =>
  algebraTilesApply(frame, st, edit, origin, M);
const fold = (st: AlgebraTilesState, edits: readonly AlgebraTilesEdit[]) =>
  edits.reduce((acc, e) => run(acc, e).after, st);

describe("THE DECISION: a zero pair is a state, not an event", () => {
  it("holds five positive and three negative x-tiles at once — the thing net counts cannot hold", () => {
    // −3x + 5x built literally: five +x tiles and three −x tiles lying on the mat.
    let st = algebraTilesInitial(frame);
    for (let i = 0; i < 5; i++) st = run(st, { kind: "placeTile", tile: "x", sign: 1 }).after;
    for (let i = 0; i < 3; i++) st = run(st, { kind: "placeTile", tile: "x", sign: -1 }).after;
    expect(st).toEqual(mat(5, 3));
    const v = deriveMat(frame, st);
    expect(v.xPairs).toBe(3); // min(5, 3)
    expect(v.netX).toBe(2); // 5 − 3
    expect(v.totalTiles).toBe(8); // all eight really are on the mat
    expect(v.simplified).toBe(false);
    // both readings are available at once: what is there, and what it is worth
    const e = deriveExpression(frame, st);
    expect(e.unsimplified).toBe("5x − 3x");
    expect(e.sentence).toBe("2x + 0");
  });

  it("collapsing the pairs changes what is on the mat and NOT what it is worth", () => {
    const before = mat(5, 3);
    const tx = algebraTilesApply(frame, before, { kind: "cancelAll" }, "control", AT_REPRESENTATIONS.controls);
    expect(tx.after).toEqual(mat(2, 0)); // three pairs left together
    expect(algebraTilesNet(tx.after)).toEqual(algebraTilesNet(before)); // worth 2x either way
    expect(algebraTilesEquivalent(before, tx.after)).toBe(true);
    expect(deriveExpression(frame, tx.after).unsimplified).toBeNull(); // nothing left to say twice
    // the op is a CANCEL, which is what makes the morph layer collapse it in place
    expect(tx.ops).toHaveLength(1);
    expect(tx.ops[0]).toMatchObject({ kind: "cancel", target: "x", amount: -3, sides: ["mat"] });
  });

  it("a zero pair placed on the mat moves the expression not at all", () => {
    const tx = run(mat(2, 0), { kind: "placeZeroPair", tile: "x" });
    expect(tx.after).toEqual(mat(3, 1)); // one more of each
    expect(algebraTilesNet(tx.after)).toEqual({ x: 2, c: 0 }); // still worth 2x
    expect(tx.ops.map((o) => o.kind)).toEqual(["add", "add"]);
    expect(tx.ops[1].describe).toMatch(/zero pair/);
  });

  it("cancels one pair at a time, and refuses when there is no pair", () => {
    expect(run(mat(3, 1), { kind: "cancelPair", tile: "x" }, "control").after).toEqual(mat(2, 0));
    const no = run(mat(2, 0), { kind: "cancelPair", tile: "x" }, "control");
    expect(no.rejected).toBe(true);
    expect(no.rejection?.code).toBe("no-pairs");
    expect(no.after).toEqual(no.before);
  });

  it("cancels both kinds together, in one transaction", () => {
    // 4 +x, 2 −x → 2 pairs; 3 +1, 3 −1 → 3 pairs. Worth 2x + 0 before and after.
    const tx = run(mat(4, 2, 3, 3), { kind: "cancelAll" }, "control");
    expect(tx.after).toEqual(mat(2, 0, 0, 0));
    expect(tx.ops.map((o) => [o.kind, o.target, o.amount])).toEqual([
      ["cancel", "x", -2],
      ["cancel", "unit", -3],
    ]);
  });
});

describe("the net projection is derived, and the round trip through it is total", () => {
  it("reconstructs the pair-free population from a bare {x, c}", () => {
    expect(algebraTilesNormalize(frame, { x: 2, c: -3 })).toEqual(mat(2, 0, 0, 3));
    expect(algebraTilesNormalize(frame, { x: -4, c: 0 })).toEqual(mat(0, 4, 0, 0));
    // …and net(minimal(n)) === n for every value the mat can hold
    for (let n = -8; n <= 8; n++) expect(algebraTilesNet(algebraTilesNormalize(frame, { x: n, c: 0 })).x).toBe(n);
  });

  it("prefers the populations when they are there, so pairs survive a reload", () => {
    expect(algebraTilesNormalize(frame, { x: 2, c: 0, mat: mat(5, 3) })).toEqual(mat(5, 3));
  });

  it("never throws on nonsense", () => {
    expect(algebraTilesNormalize(frame, null)).toEqual(algebraTilesInitial(frame));
    expect(algebraTilesNormalize(frame, "junk")).toEqual(algebraTilesInitial(frame));
    expect(algebraTilesNormalize(frame, { x: "two" })).toEqual(algebraTilesInitial(frame));
  });
});

describe("a typed coefficient IS a sequence of tile moves", () => {
  const CASES: Array<{ from: AlgebraTilesState; edit: AlgebraTilesEdit; steps: number }> = [
    { from: mat(0, 0), edit: { kind: "setXCoefficient", value: 3 }, steps: 3 }, // place 3
    { from: mat(3, 0), edit: { kind: "setXCoefficient", value: 1 }, steps: 2 }, // remove 2
    { from: mat(1, 0), edit: { kind: "setXCoefficient", value: -2 }, steps: 3 }, // remove 1, place 2 negatives
    { from: mat(5, 3), edit: { kind: "setXCoefficient", value: 4 }, steps: 2 }, // 2 negatives leave: 5−1 = 4
    { from: mat(0, 0, 0, 2), edit: { kind: "setConstant", value: 1 }, steps: 3 }, // remove 2 negatives, place 1
  ];
  it.each(CASES)("$edit.kind to $edit.value is $steps single-tile moves", ({ from, edit, steps }) => {
    const primitives = algebraTilesDecompose(frame, from, edit);
    expect(primitives).toHaveLength(steps);
    for (const p of primitives) expect(["placeTile", "removeTile"]).toContain(p.kind);
    expect(fold(from, primitives)).toEqual(run(from, edit, "symbolic").after);
  });

  it("takes the SHORTEST tile route, and never invents a zero pair on the way", () => {
    // 5 +x and 3 −x, worth 2x. Typing 4 is quickest by taking two negative tiles away: 5 − 1 = 4.
    const after = run(mat(5, 3), { kind: "setXCoefficient", value: 4 }, "symbolic").after;
    expect(after).toEqual(mat(5, 1));
    expect(deriveMat(frame, after).xPairs).toBe(1); // min(5, 1)

    // Crossing zero empties one pile before filling the other, so no pair is ever conjured — this
    // is what keeps the classic slider drawing exactly the tiles it always drew.
    let st = mat(0, 0, 0, 2); // worth −2
    for (const target of [1, -3, 2, 0]) {
      st = run(st, { kind: "setConstant", value: target }, "symbolic").after;
      expect([target, deriveMat(frame, st).unitPairs]).toEqual([target, 0]);
      expect([target, algebraTilesNet(st).c]).toEqual([target, target]);
    }
  });

  it("refuses what the mat cannot hold", () => {
    expect(run(mat(0, 0), { kind: "setXCoefficient", value: 9 }, "symbolic").rejection?.code).toBe("out-of-range");
    expect(run(mat(0, 0), { kind: "setXCoefficient", value: 1.5 }, "symbolic").rejection?.code).toBe("non-integer");
    expect(run(mat(8, 0), { kind: "placeTile", tile: "x", sign: 1 }).rejection?.code).toBe("mat-full");
    expect(run(mat(0, 0), { kind: "removeTile", tile: "x", sign: 1 }).rejection?.code).toBe("none-to-remove");
  });
});

describe("the transaction record the morph layer reads", () => {
  it("stays at four phases or fewer and never puts nothing on stage", () => {
    const txs = [
      run(mat(0, 0), { kind: "placeTile", tile: "x", sign: 1 }),
      run(mat(1, 0), { kind: "removeTile", tile: "x", sign: 1 }),
      run(mat(2, 0), { kind: "placeZeroPair", tile: "x" }),
      run(mat(4, 2, 3, 3), { kind: "cancelAll" }, "control"),
      run(mat(5, 3), { kind: "setXCoefficient", value: 1 }, "symbolic"),
      run(mat(1, 0), { kind: "reset" }, "control"),
      run(mat(1, 0), { kind: "restore", to: mat(3, 1) }, "control"),
    ];
    for (const tx of txs) {
      const plan = equationMorphPlan(tx);
      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.phases.length).toBeLessThanOrEqual(4);
      for (const ph of plan.phases) {
        expect(ph.actors.length).toBeGreaterThan(0);
        expect(ph.describe.length).toBeGreaterThan(20);
      }
    }
  });

  it("a collapse is a COLLAPSE, and nothing else is", () => {
    const cancel = equationMorphPlan(run(mat(3, 1), { kind: "cancelAll" }, "control"));
    expect(cancel.phases.map((p) => p.motion)).toEqual(["collapse"]);
    expect(equationMorphPlan(run(mat(0, 0), { kind: "placeTile", tile: "x", sign: 1 })).phases[0].motion).toBe("join");
    expect(equationMorphPlan(run(mat(1, 0), { kind: "removeTile", tile: "x", sign: 1 })).phases[0].motion).toBe("leave");
    expect(equationMorphPlan(run(mat(1, 0), { kind: "reset" }, "control")).phases[0].motion).toBe("rewind");
  });

  it("a refusal compiles to no motion at all", () => {
    const plan = equationMorphPlan(run(mat(2, 0), { kind: "cancelPair", tile: "x" }, "control"));
    expect(plan.rejected).toBe(true);
    expect(plan.phases).toEqual([]);
  });
});

/* ─────────────────── S212: the rectangle, its partial products, and back ─────────────────── */

/** 3(x + 2). Partials by hand: square 0·1 = 0; x 0·2 + 3·1 = 3; unit 3·2 = 6. */
const DIST_SPEC = { targetX: 3, targetConst: 6, maxTiles: 12, area: { width: [0, 3] as const, height: [1, 2] as const, mode: "distribute" as const } };
/** (x + 2)(x + 3). Partials: square 1; x 1·3 + 2·1 = 5; unit 2·3 = 6. */
const FACT_SPEC = { targetX: 5, targetConst: 6, targetSquare: 1, maxTiles: 12, area: { width: [1, 2] as const, height: [1, 3] as const, mode: "factor" as const } };

describe("the area workspace", () => {
  const df = algebraTilesFrame(DIST_SPEC);
  const ff = algebraTilesFrame(FACT_SPEC);
  const C = AT_REPRESENTATIONS.controls;

  it("starts a distribute lesson with an EMPTY rectangle to fill — not a box to open (S215)", () => {
    expect(algebraTilesInitial(df)).toEqual({ xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false });
    expect(df.partials).toEqual({ square: 0, x: 3, unit: 6 });
    // nothing is closed, so there is no product-instead-of-sum caption to show
    expect(deriveExpression(df, algebraTilesInitial(df)).product).toBeNull();
  });

  it("starts a factor lesson with the trinomial loose and no rectangle", () => {
    // x² + 5x + 6 laid out: 1 square, 5 x-tiles, 6 units.
    expect(algebraTilesInitial(ff)).toEqual({ xPos: 5, xNeg: 0, uPos: 6, uNeg: 0, sqPos: 1, sqNeg: 0, framed: false });
    expect(deriveExpression(ff, algebraTilesInitial(ff)).sentence).toBe("x² + 5x + 6");
  });

  const framedMat: AlgebraTilesState = { xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: true };

  it("opening a CLOSED rectangle still lands every partial product, as a BRANCH", () => {
    const tx = algebraTilesApply(df, framedMat, { kind: "distribute" }, "control", C);
    expect(tx.after).toEqual({ xPos: 3, xNeg: 0, uPos: 6, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false });
    expect(tx.ops.map((o) => [o.kind, o.target, o.amount])).toEqual([
      ["distribute", "x", 3],
      ["distribute", "unit", 6],
    ]);
    expect(equationMorphPlan(tx).phases.map((p) => p.motion)).toEqual(["branch", "branch"]);
  });

  it("a distribute DECOMPOSES into the placements algebraTilesPartials names", () => {
    const st = framedMat;
    const primitives = algebraTilesDecompose(df, st, { kind: "distribute" });
    // the outline lifts away, then 3 x-tiles and 6 units land: 1 + 3 + 6 = 10 moves
    expect(primitives).toHaveLength(10);
    expect(primitives[0]).toEqual({ kind: "openFrame" });
    expect(primitives.filter((p) => p.kind === "placeTile" && p.tile === "x")).toHaveLength(3);
    expect(primitives.filter((p) => p.kind === "placeTile" && p.tile === "unit")).toHaveLength(6);
    const folded = primitives.reduce((acc, e) => algebraTilesApply(df, acc, e, "physical", C).after, st);
    expect(folded).toEqual(algebraTilesApply(df, st, { kind: "distribute" }, "control", C).after);
  });

  it("(x + 2)(x + 3) decomposes into one square, five x-tiles and six units", () => {
    const framed = framedMat;
    const primitives = algebraTilesDecompose(ff, framed, { kind: "distribute" });
    expect(primitives).toHaveLength(1 + 1 + 5 + 6);
    expect(primitives.filter((p) => p.kind === "placeTile" && p.tile === "square")).toHaveLength(1);
    const folded = primitives.reduce((acc, e) => algebraTilesApply(ff, acc, e, "physical", C).after, framed);
    expect(folded).toEqual(algebraTilesApply(ff, framed, { kind: "distribute" }, "control", C).after);
  });

  it("the multiplier stopping at the x leaves one copy of the constant, and only where that means something", () => {
    const tx = algebraTilesApply(df, framedMat, { kind: "distributePartial" }, "control", C);
    expect(tx.after).toMatchObject({ xPos: 3, uPos: 2 }); // 3x + 2, not 3x + 6
    // …and a product of two binomials has no single multiplier that could stop early
    expect(algebraTilesApply(ff, framedMat, { kind: "distributePartial" }, "control", C).rejection?.code).toBe("no-partial-shape");
  });

  it("gathering is refused until the tiles really make that rectangle, as a GATHER when they do", () => {
    const loose = algebraTilesInitial(ff);
    const short = { ...loose, uPos: 5 }; // one unit short
    const no = algebraTilesApply(ff, short, { kind: "factor" }, "control", C);
    expect(no.rejection?.code).toBe("frame-mismatch");
    expect(no.rejection?.message).toMatch(/needs 1 x², 5 x and 6 units/);
    const yes = algebraTilesApply(ff, loose, { kind: "factor" }, "control", C);
    expect(yes.after).toEqual({ xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: true });
    expect(yes.ops.map((o) => o.kind)).toEqual(["factor"]);
    expect(equationMorphPlan(yes).phases.map((p) => p.motion)).toEqual(["gather"]);
  });

  it("distribute and factor are inverses on the same rectangle", () => {
    const opened = algebraTilesApply(ff, framedMat, { kind: "distribute" }, "control", C).after;
    expect(algebraTilesApply(ff, opened, { kind: "factor" }, "control", C).after).toEqual(framedMat);
  });

  it("an old saved value still restores to old behaviour", () => {
    const classic = algebraTilesFrame({ targetX: 2, targetConst: 0, maxTiles: 8 });
    // a mat written before S211 carries four populations and no more
    expect(algebraTilesNormalize(classic, { x: 2, c: 0, mat: { xPos: 5, xNeg: 3, uPos: 0, uNeg: 0 } })).toEqual(
      { xPos: 5, xNeg: 3, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false }
    );
    expect(algebraTilesNormalize(classic, { x: -2, c: 3 })).toEqual(
      { xPos: 0, xNeg: 2, uPos: 3, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false }
    );
  });

  it("a rectangle lesson has no rectangle moves when the spec has none", () => {
    const classic = algebraTilesFrame({ targetX: 2, targetConst: 0, maxTiles: 8 });
    const ctl = deriveControls(classic, algebraTilesInitial(classic));
    expect([ctl.hasFrame, ctl.canDistribute, ctl.canFactor, ctl.canDistributePartial]).toEqual([false, false, false, false]);
    expect(algebraTilesApply(classic, algebraTilesInitial(classic), { kind: "distribute" }, "control", C).rejection?.code).toBe("no-frame");
  });
});

describe("a transaction that moved nothing describes nothing (S212 review, C2)", () => {
  const frameC = algebraTilesFrame({ targetX: 2, targetConst: 0, maxTiles: 8 });
  it("reset on an untouched mat is accepted, unchanged, and carries no ops", () => {
    const tx = algebraTilesApply(frameC, algebraTilesInitial(frameC), { kind: "reset" }, "control", AT_REPRESENTATIONS.controls);
    expect(tx.rejected).toBe(false); // nothing was refused
    expect(tx.changed).toBe(false); // and nothing moved
    expect(tx.ops).toEqual([]); // so there is nothing to say, and nothing to animate
    expect(equationMorphPlan(tx).phases).toEqual([]);
  });

  it("re-entering the number already on the mat is the same shape", () => {
    const st = mat(3, 0);
    const tx = algebraTilesApply(frameC, st, { kind: "setXCoefficient", value: 3 }, "symbolic", AT_REPRESENTATIONS.expression);
    expect([tx.rejected, tx.changed, tx.ops]).toEqual([false, false, []]);
    expect(equationMorphPlan(tx).phases).toEqual([]);
  });

  it("…while a reset from a moved mat still says what it did", () => {
    const tx = algebraTilesApply(frameC, mat(5, 3), { kind: "reset" }, "control", AT_REPRESENTATIONS.controls);
    expect(tx.changed).toBe(true);
    expect(tx.ops.map((o) => o.kind)).toEqual(["restore"]);
    expect(equationMorphPlan(tx).phases.map((p) => p.motion)).toEqual(["rewind"]);
  });
});

describe("the assembled model", () => {
  it("answers the CanonicalModel contract, bindings and all", () => {
    const model = algebraTilesCanonicalModel(SPEC);
    expect(model.id).toBe("algebraTiles");
    expect(model.representations.map((r) => r.id)).toEqual([
      "algebraTiles.mat",
      "algebraTiles.controls",
      "algebraTiles.expression",
    ]);
    expect(model.views(mat(5, 3))).toEqual({
      mat: deriveMat(frame, mat(5, 3)),
      area: deriveArea(frame, mat(5, 3)),
      controls: deriveControls(frame, mat(5, 3)),
      expression: deriveExpression(frame, mat(5, 3)),
    });
    expect(model.net(mat(5, 3))).toEqual({ x: 2, c: 0 });
    expect(model.equivalent(mat(5, 3), mat(2, 0))).toBe(true);
    expect(model.equivalent(mat(5, 3), mat(3, 0))).toBe(false);
  });

  it("is pure: same edit, same state, byte-identical result, and never mutates", () => {
    const st = mat(5, 3);
    const frozen = { ...st };
    const a = run(st, { kind: "cancelAll" }, "control");
    const b = run(st, { kind: "cancelAll" }, "control");
    expect(a.after).toEqual(b.after);
    expect(a.ops).toEqual(b.ops);
    expect(st).toEqual(frozen);
  });
});

/* ───────── S215: the rectangle as geometry, and the partial products as areas ───────── */

describe("deriveArea — the drawn rectangle IS the multiplication", () => {
  const at = (spec: Parameters<typeof algebraTilesFrame>[0]) => algebraTilesFrame(spec);
  const empty: AlgebraTilesState = { xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false };

  it("cuts each edge into one segment per unit of each factor part", () => {
    // 3(x + 2): the width is three unit-segments; the height is one x-segment and two units.
    const a = deriveArea(at(DIST_SPEC), empty)!;
    expect(a.columns.map((c) => c.kind)).toEqual(["unit", "unit", "unit"]);
    expect(a.rows.map((r) => r.kind)).toEqual(["x", "unit", "unit"]);
    // …so an x-edge really is drawn longer than a unit edge, which is the whole point
    expect(AREA_X_LEN).toBeGreaterThan(AREA_UNIT_LEN);
    expect(a.width).toBe(3 * AREA_UNIT_LEN);
    expect(a.height).toBe(AREA_X_LEN + 2 * AREA_UNIT_LEN);
  });

  it("a 3-wide rectangle is drawn exactly three times a 1-wide one", () => {
    const three = deriveArea(at(DIST_SPEC), empty)!;
    const one = deriveArea(at({ targetX: 1, targetConst: 2, maxTiles: 8, area: { width: [0, 1], height: [1, 2], mode: "distribute" } }), empty)!;
    expect(three.width).toBe(3 * one.width);
    expect(three.height).toBe(one.height);
  });

  it("counting the CELLS reproduces algebraTilesPartials — because that is what multiplying is", () => {
    for (const spec of [DIST_SPEC, FACT_SPEC,
      { targetX: 8, targetConst: 0, maxTiles: 20, area: { width: [2, 0] as const, height: [1, 4] as const, mode: "distribute" as const } },
      { targetX: 1, targetConst: -6, maxTiles: 20, area: { width: [1, -2] as const, height: [1, 3] as const, mode: "distribute" as const } },
    ]) {
      const f = at(spec);
      const a = deriveArea(f, empty)!;
      expect([spec.area.width, a.needs]).toEqual([spec.area.width, algebraTilesPartials(spec.area.width, spec.area.height)]);
      // and the cells really tile the rectangle, with no overlap and no gap
      expect(a.cells.length).toBe(a.columns.length * a.rows.length);
      const covered = a.cells.reduce((t, c) => t + c.w * c.h, 0);
      expect(covered).toBe(a.width * a.height);
    }
  });

  it("(x − 2)(x + 3): a negative factor part makes its cells negative, cell by cell", () => {
    // partials: square 1, x 1·3 + (−2)·1 = 1, unit (−2)·3 = −6
    const f = at({ targetX: 1, targetConst: -6, targetSquare: 1, maxTiles: 20, area: { width: [1, -2], height: [1, 3], mode: "distribute" } });
    const a = deriveArea(f, empty)!;
    expect(a.needs).toEqual({ square: 1, x: 1, unit: -6 });
    expect(a.cells.filter((c) => c.kind === "unit" && c.sign === -1)).toHaveLength(6);
    // width [1,−2] → one x-column plus two negative unit-columns; height [1,3] → one x-row plus
    // three unit-rows. Positive x-cells: the x-column against the three +1 rows = 3. Negative
    // x-cells: the two −1 columns against the x-row = 2. Net 3 − 2 = 1, which is partials.x.
    expect(a.cells.filter((c) => c.kind === "x" && c.sign === 1)).toHaveLength(3);
    expect(a.cells.filter((c) => c.kind === "x" && c.sign === -1)).toHaveLength(2);
    expect(a.cells).toHaveLength(3 * 4);
  });

  it("an unfilled rectangle is a HOLE in the picture — the misconception, visibly", () => {
    const f = at(DIST_SPEC);
    // nothing produced: every one of the 3 × 3 = 9 cells is empty
    expect(deriveArea(f, empty)!.filledCount).toBe(0);
    expect(deriveArea(f, empty)!.complete).toBe(false);
    // the multiplier stopped at the x — 3x + 2 — so the 3 x-cells fill and only 2 of the 6 units do
    const partial: AlgebraTilesState = { ...empty, xPos: 3, uPos: 2 };
    const pa = deriveArea(f, partial)!;
    expect(pa.filledCount).toBe(5);
    expect(pa.complete).toBe(false);
    expect(pa.cells.filter((c) => c.kind === "unit" && !c.filled)).toHaveLength(4); // the visible gap
    // produced in full — 3x + 6 — and the rectangle is covered
    const done: AlgebraTilesState = { ...empty, xPos: 3, uPos: 6 };
    expect(deriveArea(f, done)!.complete).toBe(true);
    expect(deriveArea(f, done)!.filledCount).toBe(9);
  });

  it("a tile of the WRONG SIGN does not cover a cell", () => {
    const f = at({ targetX: -3, targetConst: -6, maxTiles: 12, area: { width: [0, -3], height: [1, 2], mode: "distribute" } });
    const wrongSign: AlgebraTilesState = { xPos: 3, xNeg: 0, uPos: 6, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false };
    expect(deriveArea(f, wrongSign)!.filledCount).toBe(0); // every cell here is negative
    const right: AlgebraTilesState = { xPos: 0, xNeg: 3, uPos: 0, uNeg: 6, sqPos: 0, sqNeg: 0, framed: false };
    expect(deriveArea(f, right)!.complete).toBe(true);
  });

  it("OVER-PRODUCTION is not completion — a rectangle holds exactly its own area (S215b)", () => {
    const f = at(DIST_SPEC); // 3(x + 2): needs 3 x-cells and 6 unit-cells, 9 in all
    // Fable-QA reached this in one slider drag: 8 x-tiles cover the 3 x-cells and leave 5 with
    // nowhere to go, and the old rule called that "complete" and announced −8x − 8.
    const over: AlgebraTilesState = { ...empty, xPos: 8, uPos: 6 };
    const a = deriveArea(f, over)!;
    expect(a.filledCount).toBe(9); // every cell IS covered…
    expect(a.complete).toBe(false); // …and that is not the same as finished
    expect(a.overfilled).toBe(true);
    expect(a.surplus).toEqual({ square: 0, x: 5, unit: 0 });
    expect(a.have).toEqual({ square: 0, x: 8, unit: 6 });
    // the exact build is the only complete one
    const exact: AlgebraTilesState = { ...empty, xPos: 3, uPos: 6 };
    expect(deriveArea(f, exact)!.complete).toBe(true);
    expect(deriveArea(f, exact)!.overfilled).toBe(false);
    expect(deriveArea(f, exact)!.surplus).toEqual({ square: 0, x: 0, unit: 0 });
  });

  it("surplus of every kind is reported, including a surplus of the wrong sign", () => {
    const f = at(DIST_SPEC);
    const overUnits: AlgebraTilesState = { ...empty, xPos: 3, uPos: 9 };
    expect(deriveArea(f, overUnits)!.surplus).toEqual({ square: 0, x: 0, unit: 3 });
    expect(deriveArea(f, overUnits)!.complete).toBe(false);
    // a square tile on a rectangle that has no square cells is surplus too
    const stray: AlgebraTilesState = { ...empty, xPos: 3, uPos: 6, sqPos: 1 };
    expect(deriveArea(f, stray)!.surplus).toEqual({ square: 1, x: 0, unit: 0 });
    expect(deriveArea(f, stray)!.complete).toBe(false);
  });

  it("completeness and the GRADER agree in every over/under/exact state", () => {
    const f = at(DIST_SPEC);
    for (let x = 0; x <= 8; x++) {
      for (let u = 0; u <= 9; u++) {
        const st: AlgebraTilesState = { ...empty, xPos: x, uPos: u };
        const complete = deriveArea(f, st)!.complete;
        // the grader's own condition, written out independently: the mat equals the partials
        const graded = x === 3 && u === 6;
        expect([x, u, complete]).toEqual([x, u, graded]);
      }
    }
  });

  it("a classic lesson has no rectangle at all", () => {
    expect(deriveArea(at({ targetX: 2, targetConst: 0, maxTiles: 8 }), empty)).toBeNull();
  });
});
