/**
 * THE BRIDGE — algebraTiles' MMIP model presented to the generic harness (same shape as
 * solveBalance.harness.s208.test.ts).
 *
 * TState carries the undo history beside the mat, exactly as the widget does; TViews bundles all
 * three representations so they cannot secretly disagree. `handDerive` is a second, independent
 * transcription of the same mathematics — different traversal, literal frame constants — and it is
 * what every check compares the model against.
 */
import { describe, expect, it } from "vitest";
import {
  equivalenceCheck,
  roundTripCheck,
  staleStateCheck,
  transactionCheck,
  undoCheck,
  type EditStep,
  type MmipModel,
  type Origin,
} from "./mmipHarness";
import {
  AT_REPRESENTATIONS,
  algebraTilesCanonicalModel,
  type AlgebraTilesEdit,
  type AlgebraTilesState,
} from "./algebraTilesModel";
import type { EditOrigin } from "./mmipTypes";

/** Build −3x + 5x, read 2x. maxTiles 8. */
const model0 = algebraTilesCanonicalModel({ targetX: 2, targetConst: 0, maxTiles: 8, xStart: 0, constStart: 0 });
const MAX = 8;

interface HState {
  readonly mat: AlgebraTilesState;
  readonly hist: readonly AlgebraTilesState[];
}

interface HViews {
  readonly xPos: number;
  readonly xNeg: number;
  readonly uPos: number;
  readonly uNeg: number;
  readonly netX: number;
  readonly netConst: number;
  readonly xPairs: number;
  readonly unitPairs: number;
  readonly totalTiles: number;
  readonly simplified: boolean;
  readonly sentence: string;
  readonly unsimplified: string | null;
  readonly canCancelAll: boolean;
  readonly pairsAvailable: number;
  readonly matFull: boolean;
  readonly xSlot: readonly [number, number, number];
  readonly uSlot: readonly [number, number, number];
}

const SRC: Record<string, string> = {
  physical: AT_REPRESENTATIONS.mat,
  control: AT_REPRESENTATIONS.controls,
  symbolic: AT_REPRESENTATIONS.expression,
};

const model: MmipModel<HState, HViews> = {
  origins: ["physical", "control", "symbolic"],
  init: () => ({ mat: model0.initial, hist: [] }),
  applyEdit: (s, origin, edit) => {
    const tx = model0.apply(s.mat, edit as AlgebraTilesEdit, origin as EditOrigin, SRC[origin] ?? origin);
    if (tx.rejected || !tx.changed) return s;
    return { mat: tx.after, hist: [...s.hist, s.mat] };
  },
  // The thin bridge the harness asks for: the engine's own transaction, lifted to the envelope.
  applyTransaction: (s, origin, edit) => {
    const tx = model0.apply(s.mat, edit as AlgebraTilesEdit, origin as EditOrigin, SRC[origin] ?? origin);
    const after: HState = tx.rejected || !tx.changed ? s : { mat: tx.after, hist: [...s.hist, s.mat] };
    return { ...tx, before: s, after };
  },
  derive: (s) => {
    const v = model0.views(s.mat);
    return {
      xPos: v.mat.xPos,
      xNeg: v.mat.xNeg,
      uPos: v.mat.uPos,
      uNeg: v.mat.uNeg,
      netX: v.mat.netX,
      netConst: v.mat.netConst,
      xPairs: v.mat.xPairs,
      unitPairs: v.mat.unitPairs,
      totalTiles: v.mat.totalTiles,
      simplified: v.mat.simplified,
      sentence: v.expression.sentence,
      unsimplified: v.expression.unsimplified,
      canCancelAll: v.controls.canCancelAll,
      pairsAvailable: v.controls.pairsAvailable,
      matFull: v.controls.matFull,
      xSlot: [v.expression.slots.xCoefficient.value, v.expression.slots.xCoefficient.min, v.expression.slots.xCoefficient.max],
      uSlot: [v.expression.slots.constant.value, v.expression.slots.constant.min, v.expression.slots.constant.max],
    };
  },
};

const undo = (s: HState): HState =>
  s.hist.length === 0 ? s : { mat: s.hist[s.hist.length - 1], hist: s.hist.slice(0, -1) };

/* ── the independent recompute: written from the definitions, not from the module ── */

const MINUS = "−";
function handDerive(s: HState): HViews {
  const { xPos, xNeg, uPos, uNeg } = s.mat;
  const netX = xPos - xNeg;
  const netConst = uPos - uNeg;
  const xPairs = xPos < xNeg ? xPos : xNeg;
  const unitPairs = uPos < uNeg ? uPos : uNeg;
  const simplified = xPairs === 0 && unitPairs === 0;
  const bits: string[] = [];
  const push = (n: number, suf: string) => {
    if (n === 0) return;
    const mag = suf === "x" && (n === 1 || n === -1) ? "x" : `${Math.abs(n)}${suf}`;
    bits.push(bits.length === 0 ? (n < 0 ? `${MINUS}${mag}` : mag) : `${n < 0 ? MINUS : "+"} ${mag}`);
  };
  push(xPos, "x");
  push(-xNeg, "x");
  push(uPos, "");
  push(-uNeg, "");
  return {
    xPos,
    xNeg,
    uPos,
    uNeg,
    netX,
    netConst,
    xPairs,
    unitPairs,
    totalTiles: xPos + xNeg + uPos + uNeg,
    simplified,
    sentence: `${netX}x ${netConst >= 0 ? "+" : MINUS} ${Math.abs(netConst)}`,
    unsimplified: simplified ? null : bits.length > 0 ? bits.join(" ") : "0",
    canCancelAll: xPairs > 0 || unitPairs > 0,
    pairsAvailable: xPairs + unitPairs,
    matFull: xPos >= MAX || xNeg >= MAX || uPos >= MAX || uNeg >= MAX,
    xSlot: [netX, -MAX, MAX],
    uSlot: [netConst, -MAX, MAX],
  };
}

/* ────────────────────────────────── the checks ────────────────────────────────── */

describe("roundTripCheck — one edit from every origin", () => {
  const CASES: EditStep[] = [
    { origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } },
    { origin: "physical", edit: { kind: "placeTile", tile: "unit", sign: -1 } },
    { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
    { origin: "physical", edit: { kind: "removeTile", tile: "x", sign: 1 } }, // refused: empty mat
    { origin: "control", edit: { kind: "cancelAll" } }, // refused: no pairs
    { origin: "control", edit: { kind: "reset" } },
    { origin: "symbolic", edit: { kind: "setXCoefficient", value: 5 } },
    { origin: "symbolic", edit: { kind: "setConstant", value: -3 } },
    { origin: "symbolic", edit: { kind: "setXCoefficient", value: 99 } }, // refused: out of range
  ];
  it("every representation agrees with the independent recompute", () => {
    const r = roundTripCheck(model, CASES, handDerive);
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(CASES.length);
  });
});

describe("staleStateCheck — a long deterministic walk", () => {
  const randomEdit = (s: HState, origin: Origin, rand: () => number): unknown => {
    const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length) % xs.length];
    if (origin === "physical")
      return pick<AlgebraTilesEdit>([
        { kind: "placeTile", tile: "x", sign: 1 },
        { kind: "placeTile", tile: "x", sign: -1 },
        { kind: "placeTile", tile: "unit", sign: 1 },
        { kind: "placeTile", tile: "unit", sign: -1 },
        { kind: "removeTile", tile: "x", sign: 1 },
        { kind: "removeTile", tile: "unit", sign: -1 },
        { kind: "placeZeroPair", tile: "x" },
        { kind: "placeZeroPair", tile: "unit" },
      ]);
    if (origin === "control")
      return pick<AlgebraTilesEdit>([
        { kind: "cancelPair", tile: "x" },
        { kind: "cancelPair", tile: "unit" },
        { kind: "cancelAll" },
        { kind: "reset" },
      ]);
    const v = Math.floor(rand() * 19) - 9; // deliberately straddles the ±8 limit
    return pick<AlgebraTilesEdit>([
      { kind: "setXCoefficient", value: v },
      { kind: "setConstant", value: v },
    ]);
  };

  it("no representation goes stale over 240 rotating edits", () => {
    const r = staleStateCheck(model, handDerive, { seed: 210, steps: 240, randomEdit });
    expect(r.failures).toEqual([]);
    expect(r.stepsRun).toBe(240);
  });

  it("the same seed replays the same walk", () => {
    expect(staleStateCheck(model, handDerive, { seed: 7, steps: 60, randomEdit })).toEqual(
      staleStateCheck(model, handDerive, { seed: 7, steps: 60, randomEdit })
    );
  });
});

describe("equivalenceCheck — representation is not path-dependent", () => {
  // Both routes end on a mat worth 2x with no pairs left: five positives and three negatives
  // collapsed, versus two positives placed straight down.
  const byPairs: EditStep[] = [
    { origin: "symbolic", edit: { kind: "setXCoefficient", value: 2 } },
    { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
    { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
    { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
    { origin: "control", edit: { kind: "cancelAll" } },
  ];
  const direct: EditStep[] = [
    { origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } },
    { origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } },
  ];

  it("building through zero pairs and building direct end in the same place", () => {
    const r = equivalenceCheck(model, byPairs, direct);
    expect(r.ok).toBe(true);
    expect(r.viewsA.sentence).toBe("2x + 0");
    expect(r.stateA.mat).toEqual(r.stateB.mat);
  });

  it("a route that only LOOKS equivalent is caught", () => {
    const short: EditStep[] = [{ origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } }];
    expect(equivalenceCheck(model, byPairs, short).ok).toBe(false);
  });
});

describe("undoCheck — every step back is exact", () => {
  it("unwinds a mixed-origin build tile for tile", () => {
    const r = undoCheck(model, undo, [
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 2 } },
      { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
      { origin: "physical", edit: { kind: "placeZeroPair", tile: "unit" } },
      { origin: "control", edit: { kind: "cancelPair", tile: "x" } },
      { origin: "symbolic", edit: { kind: "setConstant", value: -2 } },
    ]);
    expect(r.failures).toEqual([]);
  });
});

describe("transactionCheck — invariant 2 and the rejection contract", () => {
  it("every transaction in a replayed log carries its origin, ops and refusal honestly", () => {
    const r = transactionCheck(model, [
      { origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } },
      { origin: "control", edit: { kind: "cancelAll" } }, // refused: no pairs yet
      { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
      { origin: "control", edit: { kind: "cancelAll" } }, // accepted, collapses
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 1 } }, // accepted, unchanged (already 1)
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 42 } }, // refused: out of range
      { origin: "physical", edit: { kind: "removeTile", tile: "unit", sign: 1 } }, // refused: none there
      { origin: "control", edit: { kind: "reset" } },
    ]);
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(8);
  });
});

/* ─────────────── S212: the area workspace through the same bridge ─────────────── */

/** 3(x + 2). Partials by hand: square 0; x 3; unit 6. */
const distModel = algebraTilesCanonicalModel({
  targetX: 3,
  targetConst: 6,
  maxTiles: 12,
  area: { width: [0, 3], height: [1, 2], mode: "distribute" },
});
/** (x + 2)(x + 3). Partials: square 1; x 5; unit 6. */
const factModel = algebraTilesCanonicalModel({
  targetX: 5,
  targetConst: 6,
  targetSquare: 1,
  maxTiles: 12,
  area: { width: [1, 2], height: [1, 3], mode: "factor" },
});

const areaBridge = (m: typeof distModel): MmipModel<HState, { sentence: string; framed: boolean; sq: number; x: number; c: number }> => ({
  origins: ["physical", "control", "symbolic"],
  init: () => ({ mat: m.initial, hist: [] }),
  applyEdit: (s, origin, edit) => {
    const tx = m.apply(s.mat, edit as AlgebraTilesEdit, origin as EditOrigin, SRC[origin] ?? origin);
    if (tx.rejected || !tx.changed) return s;
    return { mat: tx.after, hist: [...s.hist, s.mat] };
  },
  applyTransaction: (s, origin, edit) => {
    const tx = m.apply(s.mat, edit as AlgebraTilesEdit, origin as EditOrigin, SRC[origin] ?? origin);
    const after: HState = tx.rejected || !tx.changed ? s : { mat: tx.after, hist: [...s.hist, s.mat] };
    return { ...tx, before: s, after };
  },
  derive: (s) => {
    const v = m.views(s.mat);
    return { sentence: v.expression.sentence, framed: v.mat.framed, sq: v.mat.netSquare, x: v.mat.netX, c: v.mat.netConst };
  },
});

describe("transactionCheck over a distribute log", () => {
  it("every transaction carries its origin, ops and refusal honestly", () => {
    // S215: a distribute lesson starts with an EMPTY rectangle to fill, so the moves are the
    // learner producing tiles — not one press that opens a box.
    const r = transactionCheck(areaBridge(distModel), [
      { origin: "control", edit: { kind: "factor" } }, // refused: the mat is empty, it makes no rectangle
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 3 } }, // produce the x-cells
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } }, // produce the unit-cells
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } }, // accepted, unchanged
      { origin: "physical", edit: { kind: "placeZeroPair", tile: "x" } },
      { origin: "control", edit: { kind: "cancelAll" } },
      { origin: "control", edit: { kind: "reset" } },
      { origin: "control", edit: { kind: "reset" } }, // accepted, unchanged: back at the empty start
    ]);
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(8);
  });

  it("and over a factor log, where the mat starts loose", () => {
    const r = transactionCheck(areaBridge(factModel), [
      { origin: "symbolic", edit: { kind: "setConstant", value: 5 } }, // one unit short
      { origin: "control", edit: { kind: "factor" } }, // refused: frame mismatch
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } },
      { origin: "control", edit: { kind: "factor" } }, // accepted: gather
      { origin: "control", edit: { kind: "distribute" } }, // accepted: branch, straight back out
    ]);
    expect(r.failures).toEqual([]);
  });
});

describe("undoCheck and equivalenceCheck reach the rectangle too", () => {
  it("unwinds a production tile for tile", () => {
    const r = undoCheck(areaBridge(distModel), undo, [
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 3 } },
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } },
      { origin: "physical", edit: { kind: "placeZeroPair", tile: "unit" } },
      { origin: "control", edit: { kind: "cancelAll" } },
    ]);
    expect(r.failures).toEqual([]);
  });

  it("two production ORDERS cover the same rectangle and reach the same views", () => {
    // The rectangle does not care which region a learner fills first — 3(x + 2) is 3 x-tiles and
    // 6 units however they arrive.
    const xFirst: EditStep[] = [
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 3 } },
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } },
    ];
    const unitsFirst: EditStep[] = [
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } },
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 3 } },
    ];
    const r = equivalenceCheck(areaBridge(distModel), xFirst, unitsFirst);
    expect(r.ok).toBe(true);
    expect(r.viewsA.sentence).toBe("3x + 6");
    expect(r.viewsA.framed).toBe(false);
  });

  it("one tile at a time reaches the same place as setting the count outright", () => {
    const stepwise: EditStep[] = [
      ...Array.from({ length: 3 }, () => ({ origin: "physical", edit: { kind: "placeTile", tile: "x", sign: 1 } })),
      ...Array.from({ length: 6 }, () => ({ origin: "physical", edit: { kind: "placeTile", tile: "unit", sign: 1 } })),
    ];
    const typed: EditStep[] = [
      { origin: "symbolic", edit: { kind: "setXCoefficient", value: 3 } },
      { origin: "symbolic", edit: { kind: "setConstant", value: 6 } },
    ];
    expect(equivalenceCheck(areaBridge(distModel), stepwise, typed).ok).toBe(true);
  });
});
