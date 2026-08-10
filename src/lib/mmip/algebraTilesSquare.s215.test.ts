/**
 * S215 — the x² control, and what it makes reachable.
 *
 * Before this, `(x + a)(x + b)` could not be ATTEMPTED on this engine. Its rectangle holds an x²
 * cell; the mat could hold x² tiles (S211 gave it the populations) and the rectangle could count
 * them (S215 gave it the cells) — but no control could PRODUCE one. The only route to an x² tile
 * was `distribute`, which computes the whole expansion for the learner, which is the move
 * Fable-QA rejected. So the two-binomial product was reachable only by being handed over.
 *
 * The new edit is `setSquareCoefficient`, and it is deliberately the SAME edit the other two
 * coefficients are, in every respect that can be tested: it decomposes into single-tile moves, it
 * refuses whole-tile violations and out-of-range values, and it is refused outright while the
 * rectangle still stands. Those equalities are the tests below — plus the two announcement defects
 * that the x² pile had been carrying unreachably, and which this control would have made live.
 */
import { describe, expect, it } from "vitest";
import {
  algebraTilesApply,
  algebraTilesCanonicalModel,
  algebraTilesDecompose,
  algebraTilesFrame,
  algebraTilesInitial,
  algebraTilesNet,
  algebraTilesNetSquare,
  deriveArea,
  type AlgebraTilesEdit,
  type AlgebraTilesState
} from "./algebraTilesModel";
import { AlgebraTilesSpec } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";

/** (x + 3)(x + 2) — the shape the engine could not reach. Partials: 1 x², 5 x, 6 units. */
const binomialSpec = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Fill the rectangle (x + 3) by (x + 2).",
  targetX: 5,
  targetConst: 6,
  maxTiles: 8,
  area: { width: [1, 3], height: [1, 2], mode: "distribute" },
  successFeedback: "That is x² + 5x + 6 — every part of the rectangle produced.",
  xFeedback: "The long tiles do not match the rectangle's two x strips yet.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet."
});

/** (x − 2)(x + 3) — a negative factor part, so some cells are negative. Partials: 1 x², 1 x, −6. */
const mixedSpec = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Fill the rectangle (x - 2) by (x + 3).",
  targetX: 1,
  targetConst: -6,
  maxTiles: 8,
  area: { width: [1, -2], height: [1, 3], mode: "distribute" },
  successFeedback: "That is x² + x - 6 — every part of the rectangle produced.",
  xFeedback: "The long tiles do not match the rectangle's x strips yet.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet."
});

/** The shape the one authored area step uses: -3(x + 2). Every cell is negative, so its kinds do
 * not mix signs. Partials: 0 x², -3 x, -6 units. */
const authoredShapeSpec = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Fill the rectangle -3 by (x + 2).",
  targetX: -3,
  targetConst: -6,
  maxTiles: 8,
  area: { width: [0, -3], height: [1, 2], mode: "distribute" },
  successFeedback: "That is -3x - 6 — every part of the rectangle produced.",
  xFeedback: "The long tiles do not match the rectangle's x strips yet.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet."
});

/** A classic mat: no rectangle, no x², exactly the engine 27 authored steps use. */
const classicSpec = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Build 3x + 4.",
  targetX: 3,
  targetConst: 4,
  successFeedback: "That is 3x + 4 on the mat.",
  xFeedback: "The long tiles are not right yet.",
  constFeedback: "The unit tiles are not right yet."
});

const frameOf = (s: typeof binomialSpec) => algebraTilesFrame(s);
const mat = (over: Partial<AlgebraTilesState> = {}): AlgebraTilesState => ({
  xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false, ...over
});
const run = (spec: typeof binomialSpec, st: AlgebraTilesState, edit: AlgebraTilesEdit) =>
  algebraTilesApply(frameOf(spec), st, edit, "symbolic", "test");

describe("setSquareCoefficient — the same edit the other two coefficients are", () => {
  it("decomposes into single-tile moves, and the fold equals the whole edit", () => {
    // The MMIP decomposition invariant, over a dense grid of (where the mat is) × (where it is
    // asked to go). Every symbolic edit must BE a sequence of visible manipulative moves.
    const frame = frameOf(binomialSpec);
    for (let start = -6; start <= 6; start++) {
      for (let to = -6; to <= 6; to++) {
        const st = mat(start >= 0 ? { sqPos: start } : { sqNeg: -start });
        const edit: AlgebraTilesEdit = { kind: "setSquareCoefficient", value: to };
        const whole = algebraTilesApply(frame, st, edit, "symbolic", "test").after;
        const parts = algebraTilesDecompose(frame, st, edit);
        let folded = st;
        for (const p of parts) folded = algebraTilesApply(frame, folded, p, "physical", "test").after;
        expect(folded, `start=${start} to=${to}`).toEqual(whole);
        expect(algebraTilesNetSquare(whole), `start=${start} to=${to}`).toBe(to);
      }
    }
  });

  it("never invents a zero pair — it empties one pile before filling the other", () => {
    // The property `walk` was written for, asserted for the third pile as it is for the first two.
    const frame = frameOf(binomialSpec);
    const after = algebraTilesApply(frame, mat({ sqNeg: 3 }), { kind: "setSquareCoefficient", value: 2 }, "symbolic", "t").after;
    expect(after.sqNeg).toBe(0);
    expect(after.sqPos).toBe(2);
    expect(Math.min(after.sqPos, after.sqNeg)).toBe(0);
  });

  it("refuses a fraction and a value past the mat's range, with the same codes", () => {
    expect(run(binomialSpec, mat(), { kind: "setSquareCoefficient", value: 1.5 }).rejection?.code).toBe("non-integer");
    expect(run(binomialSpec, mat(), { kind: "setSquareCoefficient", value: 9 }).rejection?.code).toBe("out-of-range");
    // …the same two the x slot gives, so the discipline is shared rather than re-invented.
    expect(run(binomialSpec, mat(), { kind: "setXCoefficient", value: 1.5 }).rejection?.code).toBe("non-integer");
    expect(run(binomialSpec, mat(), { kind: "setXCoefficient", value: 9 }).rejection?.code).toBe("out-of-range");
  });

  it("is refused while the rectangle still stands — frame-standing, like the other two", () => {
    const framed = mat({ framed: true });
    const t = run(binomialSpec, framed, { kind: "setSquareCoefficient", value: 1 });
    expect(t.rejection?.code).toBe("frame-standing");
    expect(t.after).toEqual(framed);
    expect(run(binomialSpec, framed, { kind: "setXCoefficient", value: 1 }).rejection?.code).toBe("frame-standing");
    expect(run(binomialSpec, framed, { kind: "setConstant", value: 1 }).rejection?.code).toBe("frame-standing");
  });

  it("announces x² in the algebra, not a bare number", () => {
    const t = run(binomialSpec, mat(), { kind: "setSquareCoefficient", value: 2 });
    expect(t.ops[0].describe).toContain("x²");
    expect(t.ops[0].target).toBe("square");
  });

  it("moving nothing is accepted and carries no operations", () => {
    const t = run(binomialSpec, mat({ sqPos: 2 }), { kind: "setSquareCoefficient", value: 2 });
    expect(t.rejected).toBe(false);
    expect(t.ops).toEqual([]);
  });
});

describe("(x + a)(x + b) is now reachable by producing tiles", () => {
  it("an empty mat can be driven to the exact rectangle, and only then is it complete", () => {
    const frame = frameOf(binomialSpec);
    let st = algebraTilesInitial(frame);
    expect(deriveArea(frame, st)!.complete).toBe(false);
    for (const edit of [
      { kind: "setSquareCoefficient", value: 1 },
      { kind: "setXCoefficient", value: 5 },
      { kind: "setConstant", value: 6 }
    ] as AlgebraTilesEdit[]) {
      st = algebraTilesApply(frame, st, edit, "symbolic", "test").after;
    }
    const area = deriveArea(frame, st)!;
    expect(area.needs).toEqual({ square: 1, x: 5, unit: 6 });
    expect(area.have).toEqual({ square: 1, x: 5, unit: 6 });
    expect(area.complete).toBe(true);
    expect(area.overfilled).toBe(false);
    expect(area.filledCount).toBe(area.cells.length);
  });

  it("the x² cell stays a hole until an x² tile exists — it is the control that fills it", () => {
    const frame = frameOf(binomialSpec);
    const withoutSquare = mat({ xPos: 5, uPos: 6 });
    const a = deriveArea(frame, withoutSquare)!;
    expect(a.cells.filter((c) => c.kind === "square").every((c) => c.filled)).toBe(false);
    expect(a.complete).toBe(false);

    const withSquare = algebraTilesApply(frame, withoutSquare, { kind: "setSquareCoefficient", value: 1 }, "symbolic", "t").after;
    const b = deriveArea(frame, withSquare)!;
    expect(b.cells.filter((c) => c.kind === "square").every((c) => c.filled)).toBe(true);
    expect(b.complete).toBe(true);
  });

  it("`complete` is still EXACT — over-producing x² covers the cell and is NOT finished", () => {
    const frame = frameOf(binomialSpec);
    const over = mat({ sqPos: 3, xPos: 5, uPos: 6 });
    const area = deriveArea(frame, over)!;
    expect(area.filledCount).toBe(area.cells.length); // every cell covered…
    expect(area.surplus).toEqual({ square: 2, x: 0, unit: 0 }); // …with two x² tiles spare
    expect(area.complete).toBe(false);
    expect(area.overfilled).toBe(true);
  });

  it("the sign-match fill rule holds for x²: a negative x² tile does not fill a positive cell", () => {
    const frame = frameOf(binomialSpec);
    const wrongSign = mat({ sqNeg: 1, xPos: 5, uPos: 6 });
    const area = deriveArea(frame, wrongSign)!;
    const square = area.cells.find((c) => c.kind === "square")!;
    expect(square.sign).toBe(1);
    expect(square.filled).toBe(false);
    expect(area.complete).toBe(false);
  });

  it("a negative factor part makes negative cells, and only negative tiles fill them", () => {
    // (x − 2)(x + 3): x² is positive, the unit block is negative, the x strips are 3 positive and
    // 2 negative. Signs are the product of the two edge segments' signs — nothing is absolute.
    const frame = frameOf(mixedSpec);
    expect(frame.partials).toEqual({ square: 1, x: 1, unit: -6 });

    const right = mat({ sqPos: 1, xPos: 3, xNeg: 2, uNeg: 6 });
    const rArea = deriveArea(frame, right)!;
    expect(rArea.needs).toEqual({ square: 1, x: 1, unit: -6 });
    expect(rArea.complete).toBe(true);

    // The same magnitudes with every sign positive fills nothing negative.
    const flipped = mat({ sqPos: 1, xPos: 1, uPos: 6 });
    const fArea = deriveArea(frame, flipped)!;
    expect(fArea.cells.filter((c) => c.sign < 0).some((c) => c.filled)).toBe(false);
    expect(fArea.complete).toBe(false);
  });
});

describe("the two x²-pile defects the control would have made live", () => {
  it("placing an x² tile announces the x² count, not the constant", () => {
    // `placeTile` read `algebraTilesNet(after)["x" | "c"]`, so a square tile reported the CONSTANT.
    // Unreachable while only `distribute` could place one and no authored rectangle held an x².
    const t = algebraTilesApply(
      frameOf(binomialSpec),
      mat({ uPos: 4 }),
      { kind: "placeTile", tile: "square", sign: 1 },
      "physical",
      "test"
    );
    expect(t.ops[0].describe).toContain("x²");
    expect(t.ops[0].describe).not.toContain("reads 4");
    expect(algebraTilesNet(t.after).c).toBe(4); // the constant it used to name is untouched
  });

  it("a zero pair of x² tiles is announced as x² tiles, not as unit tiles", () => {
    const t = algebraTilesApply(frameOf(binomialSpec), mat(), { kind: "placeZeroPair", tile: "square" }, "physical", "t");
    expect(t.ops.map((o) => o.describe).join(" ")).toContain("x²");
    expect(t.ops.map((o) => o.describe).join(" ")).not.toContain("unit tile");
  });

  it("cancelling an x² pair reads the x² pair count, not the unit one", () => {
    // The mat below has a UNIT pair and no square pair. The old `avail` mapped "square" to
    // `unitPairs`, so this was accepted and drove both square piles to −1.
    const st = mat({ uPos: 1, uNeg: 1 });
    const t = algebraTilesApply(frameOf(binomialSpec), st, { kind: "cancelPair", tile: "square" }, "control", "test");
    expect(t.rejection?.code).toBe("no-pairs");
    expect(t.after).toEqual(st);
  });
});

describe("the classic mat is untouched", () => {
  it("has no rectangle, so `deriveArea` is null and nothing new can be asked of it", () => {
    const frame = frameOf(classicSpec);
    expect(deriveArea(frame, algebraTilesInitial(frame))).toBeNull();
    expect(algebraTilesNetSquare(algebraTilesInitial(frame))).toBe(0);
  });

  it("the x and unit coefficients still read back with the endings they always had", () => {
    const frame = frameOf(classicSpec);
    const x = algebraTilesApply(frame, mat(), { kind: "setXCoefficient", value: 3 }, "symbolic", "t");
    expect(x.ops[0].describe).toMatch(/reads 3x\.$/);
    expect(x.ops[0].describe).not.toContain("x²");
    const c = algebraTilesApply(frame, mat(), { kind: "setConstant", value: 4 }, "symbolic", "t");
    expect(c.ops[0].describe).toMatch(/reads 4\.$/);
    expect(c.ops[0].describe).not.toContain("x²");
  });

  it("the assembled model still exposes the two slots it always did, plus the new one", () => {
    const model = algebraTilesCanonicalModel(classicSpec);
    const slots = model.views(model.initial).expression.slots;
    expect(slots.xCoefficient.target).toBe("x");
    expect(slots.constant.target).toBe("unit");
    expect(slots.squareCoefficient.target).toBe("square");
    expect(slots.squareCoefficient.value).toBe(0);
  });
});

describe("the picture and the verdict say the same thing", () => {
  /** What the widget renders its progress line from, and what the grader is handed, side by side. */
  const both = (spec: typeof binomialSpec, st: AlgebraTilesState) => ({
    announced: deriveArea(frameOf(spec), st)!.complete,
    graded: evaluate(spec, { x: algebraTilesNet(st).x, c: algebraTilesNet(st).c, mat: st }).correct
  });

  it("agree on every SINGLE-PILE mat, for a rectangle whose parts are all one sign", () => {
    // A REGRESSION GUARD, and explicitly not evidence for the per-pile budget fix below.
    //
    // Fable-QA ran this exact grid against the pre-fix model and got 0 mismatches from BOTH — which
    // is correct and is the point: with one pile of a kind occupied the pile IS the net, so the two
    // budgets cannot disagree here however wrong one of them is. Worth keeping (it guards the
    // grader/announcement agreement, a different property), worthless as proof. The sweep that
    // actually distinguishes the two budgets is the next describe block.
    //
    // The slider route can only ever occupy ONE pile of a kind (`walk` empties before it fills), so
    // this grid is the reachable state space for a learner who only moves the three coefficients.
    for (const spec of [binomialSpec, authoredShapeSpec]) {
      for (let sq = -2; sq <= 2; sq++) {
        for (let x = -6; x <= 6; x++) {
          for (let u = -8; u <= 8; u++) {
            const st = mat({
              sqPos: Math.max(sq, 0), sqNeg: Math.max(-sq, 0),
              xPos: Math.max(x, 0), xNeg: Math.max(-x, 0),
              uPos: Math.max(u, 0), uNeg: Math.max(-u, 0)
            });
            const r = both(spec, st);
            expect(r.announced, `${spec.prompt} @ ${sq}/${x}/${u}`).toBe(r.graded);
          }
        }
      }
    }
  });

  it("DIVERGE on a mixed-sign rectangle — the documented boundary on what may be authored", () => {
    // (x − 2)(x + 3) holds five x strips: THREE positive and TWO negative. A mat carrying a single
    // positive x-tile is worth the right NET, so the grader — which compares nets, as it always
    // has — calls it correct. The rectangle disagrees, and it is right to: one tile is not five.
    //
    // This is not a defect in either. They measure different things, and for a rectangle whose
    // cells of each kind share a sign the two measures coincide (the test above). It is a
    // constraint on what may be AUTHORED: an area step whose edges would produce same-kind cells
    // of both signs cannot be graded by this grader. Pinned so the divergence cannot widen or be
    // silently "fixed" in one place only.
    const netCorrect = mat({ sqPos: 1, xPos: 1, uNeg: 6 });
    const r = both(mixedSpec, netCorrect);
    expect(r.graded).toBe(true);
    expect(r.announced).toBe(false);

    // The mat that genuinely holds the rectangle's parts — reachable, but only by building zero
    // pairs: set x to 3, put two zero pairs on, then set x back to 1, which spends the positives
    // and leaves the negatives standing.
    const partsPresent = mat({ sqPos: 1, xPos: 3, xNeg: 2, uNeg: 6 });
    const q = both(mixedSpec, partsPresent);
    expect(q.announced).toBe(true);
    expect(q.graded).toBe(true);
  });

  it("that zero-pair route really is reachable through the model's own edits", () => {
    const frame = frameOf(mixedSpec);
    let st = algebraTilesInitial(frame);
    const steps: AlgebraTilesEdit[] = [
      { kind: "setSquareCoefficient", value: 1 },
      { kind: "setXCoefficient", value: 3 },
      { kind: "placeZeroPair", tile: "x" },
      { kind: "placeZeroPair", tile: "x" },
      { kind: "setXCoefficient", value: 1 },
      { kind: "setConstant", value: -6 }
    ];
    for (const e of steps) {
      const t = algebraTilesApply(frame, st, e, "physical", "test");
      expect(t.rejected, `${e.kind} was refused`).toBe(false);
      st = t.after;
    }
    expect(st.xPos).toBe(3);
    expect(st.xNeg).toBe(2);
    expect(deriveArea(frame, st)!.complete).toBe(true);
  });
});

describe("the per-pile cell budget — a sweep over the states that can tell the two apart", () => {
  /**
   * THE PROOF, replacing one that was not one.
   *
   * `deriveArea` used to spend a single signed NET per kind: a cell was filled while the net still
   * had the right sign, and the net moved one step toward zero. It now spends each PILE. Those two
   * rules are indistinguishable wherever only one pile of a kind is occupied — the pile is the net
   * — which is every state the three sliders can reach on their own, and is why the previous sweep
   * passed against the broken model as happily as against the fixed one.
   *
   * They come apart the moment BOTH piles of a kind hold something, which the zero-pair panel makes
   * reachable: set x to 3, put two zero pairs on, set x back to 1, and the mat holds 3 positive and
   * 2 negative x-tiles for a net of 1. The old rule could fill ONE x cell out of five from that mat;
   * the new one fills all five, because the tiles are all genuinely there.
   *
   * The expectation is derived by a different route from the implementation: group the cells by
   * (kind, sign) and take the smaller of "cells wanted" and "tiles held", instead of walking the
   * grid in order drawing a budget down. Mutation-checked — reverting `deriveArea` to the signed-net
   * budget turns this red.
   */
  const independentFilled = (spec: typeof binomialSpec, st: AlgebraTilesState): number => {
    const cells = deriveArea(frameOf(spec), st)!.cells;
    const held: Record<string, number> = {
      "square:1": st.sqPos, "square:-1": st.sqNeg,
      "x:1": st.xPos, "x:-1": st.xNeg,
      "unit:1": st.uPos, "unit:-1": st.uNeg
    };
    const wanted = new Map<string, number>();
    for (const c of cells) {
      const key = `${c.kind}:${c.sign}`;
      wanted.set(key, (wanted.get(key) ?? 0) + 1);
    }
    let total = 0;
    for (const [key, n] of wanted) total += Math.min(n, held[key]);
    return total;
  };

  it("every cell a mat can pay for is filled, and no cell it cannot is — across both piles of every kind", () => {
    let states = 0;
    let bothPiles = 0;
    for (const spec of [authoredShapeSpec, binomialSpec, mixedSpec]) {
      const frame = frameOf(spec);
      for (let sqP = 0; sqP <= 2; sqP++)
        for (let sqN = 0; sqN <= 2; sqN++)
          for (let xP = 0; xP <= 4; xP++)
            for (let xN = 0; xN <= 4; xN++)
              for (let uP = 0; uP <= 6; uP++)
                for (let uN = 0; uN <= 6; uN++) {
                  const st = mat({ sqPos: sqP, sqNeg: sqN, xPos: xP, xNeg: xN, uPos: uP, uNeg: uN });
                  const area = deriveArea(frame, st)!;
                  const where = `${spec.prompt} @ sq${sqP}/${sqN} x${xP}/${xN} u${uP}/${uN}`;
                  expect(area.filledCount, where).toBe(independentFilled(spec, st));
                  states += 1;
                  if ((sqP > 0 && sqN > 0) || (xP > 0 && xN > 0) || (uP > 0 && uN > 0)) bothPiles += 1;
                }
    }
    // The coverage this sweep is claiming, stated rather than implied: the majority of these states
    // hold both piles of some kind, which is exactly the region the old rule got wrong.
    expect(states).toBe(3 * 3 * 3 * 5 * 5 * 7 * 7);
    expect(bothPiles).toBeGreaterThan(states / 2);
  });

  it("names a separating state on the ONE authored area spec, so the bite is legible", () => {
    // −3(x + 2). A same-sign rectangle, so this is not about the mixed-sign case at all: the old
    // rule was wrong on live content too. The mat holds a zero pair of x-tiles and a third negative
    // one, so it genuinely carries the three negative x-tiles the rectangle asks for — but its NET
    // is only −1, and a net budget could pay for one cell out of three.
    //
    //   xPos 2, xNeg 3   →   old: 1 x cell filled (net −1)   ·   new: 3 (three negative tiles held)
    //
    // The learner-visible difference is the progress line: "7 of 9 parts are covered", which was
    // false — they had produced a tile for every part — against "the rectangle is covered, but 2
    // x-tiles are left over with nowhere inside it to go", which is what is actually on the mat.
    const frame = frameOf(authoredShapeSpec);
    const st = mat({ xPos: 2, xNeg: 3, uNeg: 6 });
    const area = deriveArea(frame, st)!;
    expect(area.needs).toEqual({ square: 0, x: -3, unit: -6 });
    expect(area.cells.filter((c) => c.kind === "x" && c.filled).length).toBe(3);
    expect(area.filledCount).toBe(9);
    expect(area.cells.length).toBe(9);
    // Covered, and NOT finished: two positive x-tiles are surplus, so `complete` stays exact.
    expect(area.surplus).toEqual({ square: 0, x: 2, unit: 0 });
    expect(area.overfilled).toBe(true);
    expect(area.complete).toBe(false);
  });

  it("the zero-pair route to a both-piles mat really is reachable, on the authored spec", () => {
    const frame = frameOf(authoredShapeSpec);
    let st = algebraTilesInitial(frame);
    // Deliberately lands on the SEPARATING state above (xPos 2, xNeg 3), not merely on some
    // both-piles state: a reachability proof that stops short of the region the bug lived in would
    // be the same mistake as the sweep this block replaces.
    for (const e of [
      { kind: "setXCoefficient", value: -1 },
      { kind: "placeZeroPair", tile: "x" },
      { kind: "placeZeroPair", tile: "x" },
      { kind: "setConstant", value: -6 }
    ] as AlgebraTilesEdit[]) {
      const t = algebraTilesApply(frame, st, e, "physical", "test");
      expect(t.rejected, `${e.kind} was refused`).toBe(false);
      st = t.after;
    }
    expect({ xPos: st.xPos, xNeg: st.xNeg, uNeg: st.uNeg }).toEqual({ xPos: 2, xNeg: 3, uNeg: 6 });
    const area = deriveArea(frame, st)!;
    expect(area.filledCount).toBe(independentFilled(authoredShapeSpec, st));
    expect(area.filledCount).toBe(9); // the signed-net budget filled 7 of these 9
  });
});
