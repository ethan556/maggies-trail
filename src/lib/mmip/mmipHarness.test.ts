// @vitest-environment jsdom
//
// Self-tests for the MMIP harness (`mmipHarness.ts`). The discipline here is "harness catches the
// bug": for every check, a fixture with a DELIBERATE, realistic defect must make the check FAIL,
// and a corrected fixture must make it PASS. A harness that can only pass is decoration.
//
// Two families of fixture are used:
//   - A toy two-representation counter model (`count` -> a text view and a parity view), used
//     where the point is to isolate ONE specific bug shape cheaply (stale cache, origin drift,
//     off-by-one derive, wrong undo).
//   - A real fixture built directly on PURE exports from `src/lib/schema.ts`
//     (`solveBalanceHolds`, `solveBalanceWitness`) modelling solveBalance's own pan arithmetic —
//     proving the harness works against the actual mathematics an engine proof would use, not
//     just a toy.

import { describe, expect, it } from "vitest";
import { solveBalanceHolds, solveBalanceWitness, type SolveBalanceRel } from "../schema";
import {
  answerLeakCheck,
  deepEqual,
  equivalenceCheck,
  evaluatorRendererAgreement,
  keyboardParityCheck,
  type MmipModel,
  type Origin,
  reducedMotionCheck,
  roundTripCheck,
  srStateCheck,
  staleStateCheck,
  stubPrefersReducedMotion,
  transactionCheck,
  type TransactionLike,
  undoCheck,
} from "./mmipHarness";
import { solveBalanceCanonicalModel, SB_REPRESENTATIONS, type SolveBalanceEdit, type SolveBalanceState } from "./solveBalanceModel";
import type { EditOrigin } from "./mmipTypes";

// =================================================================================================
// deepEqual — the primitive everything else is built on
// =================================================================================================

describe("deepEqual", () => {
  it("treats structurally identical objects and arrays as equal regardless of key order", () => {
    expect(deepEqual({ a: 1, b: [1, 2, { c: 3 }] }, { b: [1, 2, { c: 3 }], a: 1 })).toBe(true);
  });

  it("treats NaN as equal to itself", () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it("distinguishes objects that differ in a nested value", () => {
    expect(deepEqual({ a: [1, 2] }, { a: [1, 3] })).toBe(false);
  });

  it("distinguishes an object from an array even with matching indices", () => {
    expect(deepEqual({ 0: "x" }, ["x"])).toBe(false);
  });
});

// =================================================================================================
// Fixture 1: a toy two-representation counter model
// =================================================================================================

interface CounterState {
  readonly count: number;
}
interface CounterViews {
  readonly text: string;
  readonly parity: "even" | "odd";
}

/** `buttonADelta` lets a fixture simulate ORIGIN DRIFT: two origins that are supposed to edit the
 * same quantity consistently (a "+1" button and a typed delta) silently disagree about what "+1"
 * means. `deriveOffset` lets a fixture simulate a plain off-by-one bug in `derive` itself. */
function makeCounterModel(opts: { buttonADelta?: number; deriveOffset?: number } = {}): MmipModel<CounterState, CounterViews> {
  const buttonADelta = opts.buttonADelta ?? 1;
  const deriveOffset = opts.deriveOffset ?? 0;
  return {
    origins: ["buttonA", "typed"],
    init: () => ({ count: 0 }),
    applyEdit: (state, origin, edit) => {
      const delta = origin === "buttonA" ? buttonADelta : (edit as { delta: number }).delta;
      return { count: state.count + delta };
    },
    derive: (state) => {
      const n = state.count + deriveOffset;
      return { text: `count is ${n}`, parity: n % 2 === 0 ? "even" : "odd" };
    },
  };
}

/** Independent recompute: same mathematical content, deliberately written a different way (no
 * offset, `Math.abs` before the modulo) so it is not textually or structurally the same function
 * as `derive` above — and, per the harness's contract, is never the SAME reference as it. */
const independentCounterDerive = (state: CounterState): CounterViews => ({
  text: `count is ${state.count}`,
  parity: Math.abs(state.count) % 2 === 0 ? "even" : "odd",
});

const counterRandomEdit = (_state: CounterState, origin: Origin, rand: () => number): unknown =>
  origin === "buttonA" ? undefined : { delta: Math.floor(rand() * 5) - 2 };

/** A model whose `derive` caches `parity` in a closure the FIRST time it is called and never
 * recomputes it — a stale cached view. This is the real bug class `staleStateCheck` exists to
 * catch: a representation that happens to be right for the initial state and silently stops
 * tracking every edit after that. */
function makeStaleCounterModel(): MmipModel<CounterState, CounterViews> {
  let cachedParity: "even" | "odd" | null = null;
  return {
    origins: ["buttonA", "typed"],
    init: () => {
      cachedParity = null;
      return { count: 0 };
    },
    applyEdit: (state, origin, edit) => {
      const delta = origin === "buttonA" ? 1 : (edit as { delta: number }).delta;
      return { count: state.count + delta };
    },
    derive: (state) => {
      if (cachedParity === null) cachedParity = state.count % 2 === 0 ? "even" : "odd";
      return { text: `count is ${state.count}`, parity: cachedParity };
    },
  };
}

// =================================================================================================
// Fixture 2: a real solveBalance-shaped model, built on schema.ts's own pure functions
// =================================================================================================
//
// Spec: 3x + 2 = 14 (a=3, b=2, c=14) — the true x is 4, and (c-b)/a is exact by construction, same
// invariant `SolveBalanceSpec`'s own comment documents. Two origins: "tileTap" (the pan-tile
// gesture — add/remove one tile at a time on one field) and "typed" (set fields directly, as a
// learner typing into the equation editor would).

interface SBState {
  readonly leftX: number;
  readonly leftUnits: number;
  readonly rightUnits: number;
}
interface SBViews {
  readonly L: number;
  readonly R: number;
  readonly holds: boolean;
  readonly sentence: string;
}

const SB_SPEC = { a: 3, b: 2, c: 14, rel: "eq" as SolveBalanceRel };
// The true x, computed here directly rather than through `solveBalanceWitness`, so the independent
// recompute below shares no code path with the model's own derive.
const SB_X_TRUE = (SB_SPEC.c - SB_SPEC.b) / SB_SPEC.a;

function makeSolveBalanceModel(bug: "none" | "dropsLeftUnits" = "none"): MmipModel<SBState, SBViews> {
  return {
    origins: ["tileTap", "typed"],
    init: () => ({ leftX: SB_SPEC.a, leftUnits: SB_SPEC.b, rightUnits: SB_SPEC.c }),
    applyEdit: (state, origin, edit) => {
      if (origin === "typed") return { ...state, ...(edit as Partial<SBState>) };
      const tap = edit as { field: keyof SBState; delta: number };
      return { ...state, [tap.field]: state[tap.field] + tap.delta };
    },
    derive: (state) => {
      const wx = solveBalanceWitness(SB_SPEC.a, SB_SPEC.b, SB_SPEC.c, SB_SPEC.rel);
      // BUG (dropsLeftUnits): the left pan's constant term is silently left out of the weighing —
      // exactly the shape of bug a term-addressable Spotlight refactor could introduce by wiring
      // one term's tiles but forgetting another.
      const L = bug === "dropsLeftUnits" ? state.leftX * wx : state.leftX * wx + state.leftUnits;
      const R = state.rightUnits;
      return { L, R, holds: solveBalanceHolds(L, R, SB_SPEC.rel), sentence: `${state.leftX}x + ${state.leftUnits} = ${state.rightUnits}` };
    },
  };
}

/** Independent recompute for the solveBalance fixture: uses the hardcoded true x (not
 * `solveBalanceWitness`) and plain `===` (not `solveBalanceHolds`'s comparator switch) — a
 * genuinely different code path to the same mathematical fact. */
const independentSBDerive = (state: SBState): SBViews => {
  const L = state.leftX * SB_X_TRUE + state.leftUnits;
  const R = state.rightUnits;
  return { L, R, holds: L === R, sentence: `${state.leftX}x + ${state.leftUnits} = ${state.rightUnits}` };
};

const SB_CASES = [
  { origin: "tileTap", edit: { field: "leftUnits" as const, delta: -1 } },
  { origin: "tileTap", edit: { field: "rightUnits" as const, delta: -1 } },
  { origin: "typed", edit: { leftX: 1, leftUnits: 0, rightUnits: 4 } },
];

// =================================================================================================
// 1. roundTripCheck
// =================================================================================================

describe("roundTripCheck", () => {
  it("passes on a correct model, driven from every origin, against an independent recompute", () => {
    const result = roundTripCheck(makeSolveBalanceModel("none"), SB_CASES, independentSBDerive);
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.casesRun).toBe(SB_CASES.length);
  });

  it("catches a derive() that silently drops a term from the weighing", () => {
    const result = roundTripCheck(makeSolveBalanceModel("dropsLeftUnits"), SB_CASES, independentSBDerive);
    expect(result.ok).toBe(false);
    // The bug is origin-independent (it's in derive, not in any one edit path) — it surfaces on
    // every case where the dropped term is nonzero. Case 3's state happens to have leftUnits = 0
    // (the fully solved tile counts), so dropping "+ 0" changes nothing there; the other two do.
    expect(result.failures).toHaveLength(SB_CASES.length - 1);
    expect(result.failures.map((f) => f.origin)).toEqual(["tileTap", "tileTap"]);
  });

  it("refuses independentDerive === model.derive", () => {
    const model = makeSolveBalanceModel("none");
    expect(() => roundTripCheck(model, SB_CASES, model.derive)).toThrow(/independentDerive must not be model\.derive/);
  });

  it("refuses an empty case list", () => {
    const model = makeSolveBalanceModel("none");
    expect(() => roundTripCheck(model, [], independentSBDerive)).toThrow(/at least one case/);
  });

  it("refuses a case whose origin is not declared on the model", () => {
    const model = makeSolveBalanceModel("none");
    expect(() =>
      roundTripCheck(model, [{ origin: "telepathy", edit: {} }], independentSBDerive)
    ).toThrow(/not declared in model\.origins/);
  });
});

// =================================================================================================
// 2. staleStateCheck
// =================================================================================================

describe("staleStateCheck", () => {
  it("passes a long seeded random walk when every representation re-derives fully each step", () => {
    const result = staleStateCheck(makeCounterModel(), independentCounterDerive, {
      seed: 12345,
      steps: 40,
      randomEdit: counterRandomEdit,
    });
    expect(result.ok).toBe(true);
    expect(result.stepsRun).toBe(40);
  });

  it("catches a stale cached view that stops updating after the first derive", () => {
    const result = staleStateCheck(makeStaleCounterModel(), independentCounterDerive, {
      seed: 12345,
      steps: 40,
      randomEdit: counterRandomEdit,
    });
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
    // The very first step already lands on an odd count via the walk below, or an even one that
    // stays cached — either way the walk is long enough that at least one step must disagree with
    // a cache frozen at step 0's parity.
    expect(result.failures.some((f) => f.state.count % 2 !== 0 || f.expected.parity !== f.actual.parity)).toBe(true);
  });

  it("is deterministic for a fixed seed — the whole point of not using Math.random", () => {
    const opts = { seed: 777, steps: 20, randomEdit: counterRandomEdit };
    const r1 = staleStateCheck(makeCounterModel(), independentCounterDerive, opts);
    const r2 = staleStateCheck(makeCounterModel(), independentCounterDerive, opts);
    expect(r1).toEqual(r2);
  });

  it("refuses independentDerive === model.derive", () => {
    const model = makeCounterModel();
    expect(() =>
      staleStateCheck(model, model.derive, { seed: 1, steps: 5, randomEdit: counterRandomEdit })
    ).toThrow(/independentDerive must not be model\.derive/);
  });

  it("refuses a non-positive step count", () => {
    expect(() =>
      staleStateCheck(makeCounterModel(), independentCounterDerive, { seed: 1, steps: 0, randomEdit: counterRandomEdit })
    ).toThrow(/positive integer/);
  });
});

// =================================================================================================
// 3. equivalenceCheck
// =================================================================================================

describe("equivalenceCheck", () => {
  it("passes when two different edit sequences reach the same mathematical state (solveBalance)", () => {
    // Path A: type the solved tile counts directly.
    const pathA = [{ origin: "typed", edit: { leftX: 1, leftUnits: 0, rightUnits: 4 } }];
    // Path B: subtract 2 from both sides one tile at a time, then divide by 3 — a different
    // origin, a different number of steps, the same underlying equation move.
    const pathB = [
      { origin: "tileTap", edit: { field: "leftUnits" as const, delta: -1 } },
      { origin: "tileTap", edit: { field: "leftUnits" as const, delta: -1 } },
      { origin: "tileTap", edit: { field: "rightUnits" as const, delta: -1 } },
      { origin: "tileTap", edit: { field: "rightUnits" as const, delta: -1 } },
      { origin: "typed", edit: { leftX: 1, rightUnits: 4 } },
    ];
    const result = equivalenceCheck(makeSolveBalanceModel("none"), pathA, pathB);
    expect(result.ok).toBe(true);
    expect(result.viewsA).toEqual(result.viewsB);
  });

  it("catches origin drift: two origins editing the same quantity that silently disagree", () => {
    // BUG: the "+1" button actually adds 2. Three button taps and one typed "+3" edit are supposed
    // to be the same move and are not.
    const driftedModel = makeCounterModel({ buttonADelta: 2 });
    const seqA = [{ origin: "buttonA", edit: undefined }, { origin: "buttonA", edit: undefined }, { origin: "buttonA", edit: undefined }];
    const seqB = [{ origin: "typed", edit: { delta: 3 } }];
    const result = equivalenceCheck(driftedModel, seqA, seqB);
    expect(result.ok).toBe(false);
    expect(result.viewsA).not.toEqual(result.viewsB);
  });

  it("passes the same two sequences once the origin drift is fixed", () => {
    const fixedModel = makeCounterModel();
    const seqA = [{ origin: "buttonA", edit: undefined }, { origin: "buttonA", edit: undefined }, { origin: "buttonA", edit: undefined }];
    const seqB = [{ origin: "typed", edit: { delta: 3 } }];
    const result = equivalenceCheck(fixedModel, seqA, seqB);
    expect(result.ok).toBe(true);
  });
});

// =================================================================================================
// 4. undoCheck
// =================================================================================================

interface HistCounterState {
  readonly count: number;
  readonly hist: readonly number[];
}
interface HistCounterViews {
  readonly text: string;
}

const histCounterModel: MmipModel<HistCounterState, HistCounterViews> = {
  origins: ["buttonA", "typed"],
  init: () => ({ count: 0, hist: [] }),
  applyEdit: (state, origin, edit) => {
    const delta = origin === "buttonA" ? 1 : (edit as { delta: number }).delta;
    return { count: state.count + delta, hist: [...state.hist, state.count] };
  },
  derive: (state) => ({ text: `count is ${state.count}` }),
};

const correctUndo = (state: HistCounterState): HistCounterState => {
  if (state.hist.length === 0) return state;
  const prevCount = state.hist[state.hist.length - 1];
  return { count: prevCount, hist: state.hist.slice(0, -1) };
};

// BUG: always steps back by exactly 1, regardless of the edit's actual magnitude — correct for a
// buttonA tap, silently wrong for any other-sized typed edit (a real snapshot/undo bug shape: undo
// reconstructed from "the inverse of a generic small step" instead of from an actual snapshot).
const brokenUndo = (state: HistCounterState): HistCounterState => {
  if (state.hist.length === 0) return state;
  return { count: state.count - 1, hist: state.hist.slice(0, -1) };
};

describe("undoCheck", () => {
  const sequence = [
    { origin: "typed", edit: { delta: 3 } },
    { origin: "buttonA", edit: undefined },
    { origin: "typed", edit: { delta: -2 } },
  ];

  it("passes when undo restores state exactly, step by step, with matching derived views", () => {
    const result = undoCheck(histCounterModel, correctUndo, sequence);
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("catches an undo that does not restore state exactly for a non-unit edit", () => {
    const result = undoCheck(histCounterModel, brokenUndo, sequence);
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
    expect(result.failures.some((f) => f.kind === "state")).toBe(true);
  });

  it("refuses an empty edit sequence", () => {
    expect(() => undoCheck(histCounterModel, correctUndo, [])).toThrow(/at least one edit/);
  });
});

// =================================================================================================
// 4b. transactionCheck — wired against the REAL solveBalanceModel transactions (S209)
// =================================================================================================
//
// `solveBalanceCanonicalModel` is the frozen `CanonicalModel` from `mmipTypes.ts` (see
// `docs/MMIP_V1_API.md` §2). The bridge below is exactly the "thin bridge" the doc comment on
// `MmipModel.applyTransaction` describes: `applyEdit` unwraps `.after` for the existing checks,
// `applyTransaction` hands the harness the whole `SyncTransaction` untouched. No widget, no DOM —
// `model.apply` is a pure function and this is a direct, real proof of it.

const SB_TX_SPEC = { a: 2, b: 3, c: 11 }; // (11-3)/2 = 4, exact by construction — a legal problem.
const SB_TX_ORIGINS: readonly Origin[] = ["physical", "control", "symbolic", "system"];

function makeRealSolveBalanceTxModel() {
  const canon = solveBalanceCanonicalModel(SB_TX_SPEC);
  return {
    origins: SB_TX_ORIGINS,
    init: () => canon.initial,
    applyEdit: (state: SolveBalanceState, origin: Origin, edit: unknown) =>
      canon.apply(state, edit as SolveBalanceEdit, origin as EditOrigin, SB_REPRESENTATIONS.tiles).after,
    derive: (state: SolveBalanceState) => canon.views(state),
    applyTransaction: (state: SolveBalanceState, origin: Origin, edit: unknown): TransactionLike<SolveBalanceState> =>
      canon.apply(state, edit as SolveBalanceEdit, origin as EditOrigin, SB_REPRESENTATIONS.tiles),
  } satisfies MmipModel<SolveBalanceState, unknown>;
}

describe("transactionCheck (real solveBalanceModel)", () => {
  // A sequential log exercising all three transaction shapes on the real engine:
  //   1. physical tap: leftUnits 3 -> 2 — accepted, changed, one "subtract" op. Hand-computed.
  //   2. control negate while every tile is positive (leftX 2, leftUnits 2, rightUnits 11, all
  //      non-negative) — REFUSED by the real model (code "nothing-to-negate").
  //   3. symbolic setLeftCoefficient to the value already there (2) — accepted, UNCHANGED, no ops:
  //      the state after step 2 is unchanged (the refusal did nothing), so leftX is still 2.
  //   4. control reset — accepted, changed (leftUnits is 2, not the initial 3), one "restore" op.
  const realCases = [
    { origin: "physical", edit: { kind: "tapLeftUnit" } },
    { origin: "control", edit: { kind: "negate" } },
    { origin: "symbolic", edit: { kind: "setLeftCoefficient", value: 2 } },
    { origin: "control", edit: { kind: "reset" } },
  ];

  it("passes against the real engine's transactions across accepted, rejected and no-op edits", () => {
    const result = transactionCheck(makeRealSolveBalanceTxModel(), realCases);
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.casesRun).toBe(realCases.length);
  });

  it("independently confirms the rejection in the log is the negate refusal", () => {
    // Not part of transactionCheck itself — a sanity check that case 2 above really does exercise
    // the rejected branch, so the passing result above is not vacuous.
    const canon = solveBalanceCanonicalModel(SB_TX_SPEC);
    const afterTap = canon.apply(canon.initial, { kind: "tapLeftUnit" }, "physical" as EditOrigin, SB_REPRESENTATIONS.tiles).after;
    const tx = canon.apply(afterTap, { kind: "negate" }, "control" as EditOrigin, SB_REPRESENTATIONS.controls);
    expect(tx.rejected).toBe(true);
    expect(tx.rejection?.code).toBe("nothing-to-negate");
    expect(tx.after).toEqual(afterTap);
  });

  // S213 Task 1 — `algebraTilesModel.ts` and `solveBalanceModel.ts` independently carried the
  // identical defensive line `ops: changed ? ops : []` (a real frozen-contract violation this very
  // `transactionCheck` exists to catch), hoisted here into `mmipTypes.ts`'s new `acceptTransaction`.
  // This proves the hoist did not weaken detection: if the guard were ever reverted — in
  // `acceptTransaction` itself, or copy-pasted wrong into a third engine — `transactionCheck` would
  // still catch it.
  it("MUTATION CHECK — still catches a reverted acceptTransaction guard on the real engine's own no-op shape", () => {
    const canon = solveBalanceCanonicalModel(SB_TX_SPEC);
    // The exact no-op case the hoisted rule governs: typing the coefficient's OWN current value.
    const noOpEdit: SolveBalanceEdit = { kind: "setLeftCoefficient", value: canon.initial.leftX };
    const noOpTx = canon.apply(canon.initial, noOpEdit, "symbolic" as EditOrigin, SB_REPRESENTATIONS.symbol);
    expect(noOpTx.changed).toBe(false);
    expect(noOpTx.ops).toEqual([]); // the FIXED, current behaviour — confirmed before mutating it below

    // The ops a genuinely CHANGED edit of the same kind produces — what a reverted `changed ?
    // ops : []` guard would attach to the no-op transaction above instead of leaving it [].
    const changedTx = canon.apply(
      canon.initial,
      { kind: "setLeftCoefficient", value: canon.initial.leftX - 1 },
      "symbolic" as EditOrigin,
      SB_REPRESENTATIONS.symbol
    );
    expect(changedTx.ops.length).toBeGreaterThan(0);

    // Simulate the revert: the real no-op transaction, but with ops attached anyway — exactly the
    // shape `accept()` produced in both engines before S212/S213, and exactly what `transactionCheck`
    // must still refuse to pass.
    const reverted: TransactionLike<SolveBalanceState> = { ...noOpTx, ops: changedTx.ops };
    const replayModel = {
      origins: ["symbolic"] as readonly Origin[],
      init: () => canon.initial,
      applyEdit: () => reverted.after,
      derive: () => null,
      applyTransaction: () => reverted,
    } satisfies MmipModel<SolveBalanceState, unknown>;

    const result = transactionCheck(replayModel, [{ origin: "symbolic", edit: noOpEdit }]);
    expect(result.ok).toBe(false);
    expect(result.failures[0].reason).toMatch(/accepted, unchanged \(no-op\) transaction carries non-empty ops/);
  });

  it("refuses to run when applyTransaction is not supplied", () => {
    const bare = { origins: ["control"], init: () => ({ n: 0 }) };
    expect(() => transactionCheck(bare, [{ origin: "control", edit: {} }])).toThrow(/applyTransaction is not supplied/);
  });

  it("refuses an empty case list", () => {
    expect(() => transactionCheck(makeRealSolveBalanceTxModel(), [])).toThrow(/at least one case/);
  });
});

// Minimal synthetic fixtures for the three violation shapes the coordinator named explicitly. A
// real, correct engine (above) cannot exhibit any of these — that's the point of a hand-built
// counter-example: it isolates exactly one broken rule at a time.

interface TinyTxState {
  readonly n: number;
}

function makeBrokenTxModel(bug: "oplessChanged" | "rejectedButMutated" | "wrongBefore") {
  return {
    origins: ["control"] as readonly Origin[],
    init: () => ({ n: 0 }),
    applyEdit: (state: TinyTxState, _origin: Origin, edit: unknown) => ({ n: state.n + (edit as { delta: number }).delta }),
    derive: (state: TinyTxState) => state,
    applyTransaction: (state: TinyTxState, origin: Origin, edit: unknown): TransactionLike<TinyTxState> => {
      const delta = (edit as { delta: number }).delta;
      const after = { n: state.n + delta };
      if (bug === "oplessChanged") {
        // BUG: a real mutation (n changed) reported with an empty ops array — a motion layer, or
        // this very check, would have no way to know anything moved.
        return { before: state, after, origin, ops: [], changed: true, rejected: false };
      }
      if (bug === "rejectedButMutated") {
        // BUG: rejected: true, but `after` is NOT `before` — a refusal that mutated state anyway.
        return {
          before: state,
          after,
          origin,
          ops: [],
          changed: false,
          rejected: true,
          rejection: { code: "refused", message: "This move is not available." },
        };
      }
      // wrongBefore — BUG: `before` is a fabricated snapshot, not the state this edit actually saw.
      return { before: { n: -999 }, after, origin, ops: [{ sides: ["left"] }], changed: true, rejected: false };
    },
  } satisfies MmipModel<TinyTxState, TinyTxState>;
}

describe("transactionCheck (synthetic violations)", () => {
  const cases = [{ origin: "control", edit: { delta: 1 } }];

  it("catches a changed, accepted transaction with no ops", () => {
    const result = transactionCheck(makeBrokenTxModel("oplessChanged"), cases);
    expect(result.ok).toBe(false);
    expect(result.failures[0].reason).toMatch(/carries no ops/);
  });

  it("catches a rejected transaction that mutated state anyway", () => {
    const result = transactionCheck(makeBrokenTxModel("rejectedButMutated"), cases);
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => /after differs from before/.test(f.reason))).toBe(true);
  });

  it("catches a transaction whose before does not match the state it was actually applied to", () => {
    const result = transactionCheck(makeBrokenTxModel("wrongBefore"), cases);
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => /tx\.before does not match/.test(f.reason))).toBe(true);
  });

  it("passes a hand-built, fully correct synthetic transaction", () => {
    const correct = {
      origins: ["control"] as readonly Origin[],
      init: () => ({ n: 0 }),
      applyEdit: (state: TinyTxState, _origin: Origin, edit: unknown) => ({ n: state.n + (edit as { delta: number }).delta }),
      derive: (state: TinyTxState) => state,
      applyTransaction: (state: TinyTxState, origin: Origin, edit: unknown): TransactionLike<TinyTxState> => {
        const delta = (edit as { delta: number }).delta;
        if (delta === 0) return { before: state, after: state, origin, ops: [], changed: false, rejected: false };
        const after = { n: state.n + delta };
        return {
          before: state,
          after,
          origin,
          ops: [{ sides: ["left"] }],
          changed: true,
          rejected: false,
        };
      },
    } satisfies MmipModel<TinyTxState, TinyTxState>;
    const result = transactionCheck(correct, [{ origin: "control", edit: { delta: 1 } }, { origin: "control", edit: { delta: 0 } }]);
    expect(result.ok).toBe(true);
  });
});

// =================================================================================================
// 8. evaluatorRendererAgreement (real solveBalance grading truth vs. a rendered label)
// =================================================================================================

describe("evaluatorRendererAgreement", () => {
  interface AgreeState {
    readonly L: number;
    readonly R: number;
  }
  const spec = { rel: "eq" as SolveBalanceRel };
  const cases = [
    { spec, state: { L: 14, R: 14 } as AgreeState, label: "balanced" },
    { spec, state: { L: 10, R: 14 } as AgreeState, label: "not balanced" },
    { spec, state: { L: 20, R: 14 } as AgreeState, label: "not balanced (other direction)" },
  ];
  const evaluate = (s: { rel: SolveBalanceRel }, st: AgreeState) => solveBalanceHolds(st.L, st.R, s.rel);
  const correctRenderText = (_s: unknown, st: AgreeState) => (st.L === st.R ? "balanced" : "not balanced");
  // BUG: the renderer hardcodes "balanced" — a real regression shape when a success state's copy
  // is left in place after a refactor that was supposed to make the label state-dependent again.
  const brokenRenderText = () => "balanced";
  const agrees = (truth: unknown, text: string) => (truth === true ? text === "balanced" : text === "not balanced");

  it("passes when the rendered label and the grading truth agree on every case", () => {
    const result = evaluatorRendererAgreement(cases, evaluate, correctRenderText, agrees);
    expect(result.ok).toBe(true);
  });

  it("catches a renderer that disagrees with the grading truth", () => {
    const result = evaluatorRendererAgreement(cases, evaluate, brokenRenderText, agrees);
    expect(result.ok).toBe(false);
    // The two unbalanced cases both mislabel; the balanced one is fine by coincidence.
    expect(result.failures).toHaveLength(2);
  });

  it("refuses an empty case list", () => {
    expect(() => evaluatorRendererAgreement([], evaluate, correctRenderText, agrees)).toThrow(/at least one case/);
  });
});

// =================================================================================================
// 5a. keyboardParityCheck (jsdom)
// =================================================================================================

describe("keyboardParityCheck", () => {
  it("passes when every pointer affordance is natively focusable", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile" data-testid="t1">tile</button>
      <button data-role="tile" data-testid="t2">tile</button>
      <a data-role="tile" data-testid="t3" href="#tile">tile</a>
    `;
    const result = keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' });
    expect(result.ok).toBe(true);
    expect(result.checked).toBe(3);
  });

  it("catches a pointer-only affordance: a clickable div with no tabindex and no native semantics", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile" data-testid="t1">tile</button>
      <div data-role="tile" data-testid="t2">tile</div>
    `;
    const result = keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' });
    expect(result.ok).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].description).toContain('"t2"');
  });

  it("accepts a non-native element once it is given an explicit non-negative tabindex", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div data-role="tile" data-testid="t1" tabindex="0" role="button">tile</div>`;
    const result = keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' });
    expect(result.ok).toBe(true);
  });

  it("supports a named selector map and reports failures with their group", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile">tile</button>
      <div data-role="handle" data-testid="h1">handle</div>
    `;
    const result = keyboardParityCheck(container, {
      pointerSelectors: { tile: '[data-role="tile"]', handle: '[data-role="handle"]' },
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0].group).toBe("handle");
  });

  it("refuses to trivially pass when the selector matches nothing", () => {
    const container = document.createElement("div");
    expect(() => keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' })).toThrow(/matched no elements/);
  });

  // S209 adversarial review, condition S1 — the disabled-exemption must be `el.disabled` ONLY.
  // `aria-disabled` is advisory: it blocks neither pointer activation nor the tab stop, so
  // exempting it would silently hide the exact "pointer-operable, keyboard-unreachable" shape this
  // check exists to catch (docs/MMIP_V1_API.md's own accessibility contract, §6).
  it("(S1a) exempts a genuinely (natively) disabled control — it offers no affordance on either channel", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile" data-testid="t1">tile</button>
      <button data-role="tile" data-testid="t2" disabled>tile</button>
    `;
    const result = keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' });
    expect(result.ok).toBe(true);
    // Only the one enabled control counts as something to certify — the disabled one is exempt,
    // not silently passed as "reachable".
    expect(result.checked).toBe(1);
  });

  it("(S1b) FLAGS an aria-disabled-but-pointer-operable div — the reviewer's exact counterexample", () => {
    const container = document.createElement("div");
    // `role="button" aria-disabled="true"` with no `tabindex` and no native semantics: a mouse can
    // still click it (aria-disabled does not prevent pointer activation or remove it from the tab
    // order — it is advisory only), but nothing here gives it a keyboard path. This must be a real
    // parity failure, never a silent exemption.
    container.innerHTML = `<div data-role="tile" data-testid="t1" role="button" aria-disabled="true">tile</div>`;
    const result = keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' });
    expect(result.ok).toBe(false);
    expect(result.checked).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].description).toContain('"t1"');
  });

  // S209 adversarial review, condition S2 — a selector whose every match is exempt (genuinely
  // disabled) must not silently report `{ ok: true, checked: 0 }`. That is the same trivial-pass
  // shape the "matched no elements" guard already refuses, just reached after filtering instead of
  // before it, and it is reachable in practice: a widget rendered fully `disabled` (a finished or
  // revealed state) can have every control in a group natively disabled at once.
  it("(S2) refuses to certify a group whose every match is exempt as disabled — no silent ok:true/checked:0", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile" data-testid="t1" disabled>tile</button>
      <button data-role="tile" data-testid="t2" disabled>tile</button>
    `;
    expect(() => keyboardParityCheck(container, { pointerSelectors: '[data-role="tile"]' })).toThrow(
      /every one of them is genuinely disabled/
    );
  });

  it("(S2) the all-exempt refusal is per GROUP — one exhausted group still throws even if another group is fine", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-role="tile" data-testid="t1">tile</button>
      <button data-role="handle" data-testid="h1" disabled>handle</button>
    `;
    expect(() =>
      keyboardParityCheck(container, {
        pointerSelectors: { tile: '[data-role="tile"]', handle: '[data-role="handle"]' },
      })
    ).toThrow(/group "handle".*every one of them is genuinely disabled/);
  });
});

// =================================================================================================
// 5b. srStateCheck (jsdom)
// =================================================================================================

describe("srStateCheck", () => {
  it("passes when the accessible text communicates the mathematical state", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div role="img" aria-label="Left side 14, right side 14; balanced."></div>`;
    const result = srStateCheck(container, { expectedSubstrings: ["14", "balanced"] });
    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("catches accessible text that fails to communicate the mathematical state", () => {
    const container = document.createElement("div");
    // BUG: the label was written before the pan values were wired up — generic copy that never
    // updates, the aria equivalent of the stale-cache bug above.
    container.innerHTML = `<div role="img" aria-label="Left pan, right pan."></div>`;
    const result = srStateCheck(container, { expectedSubstrings: ["14", "balanced"] });
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["14", "balanced"]);
  });

  it("collects text from live/status regions as well as aria-label", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div role="status">x is now 4</div>`;
    const result = srStateCheck(container, { expectedSubstrings: ["x is now 4"] });
    expect(result.ok).toBe(true);
  });

  it("refuses an empty expectation list", () => {
    const container = document.createElement("div");
    expect(() => srStateCheck(container, { expectedSubstrings: [] })).toThrow(/must be non-empty/);
  });
});

// =================================================================================================
// 6. answerLeakCheck (jsdom)
// =================================================================================================

describe("answerLeakCheck", () => {
  it("passes when the answer appears nowhere in the rendered tree", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div>Solve for x. Left pan, right pan.</div>`;
    const result = answerLeakCheck(container, ["x=4"]);
    expect(result.ok).toBe(true);
    expect(result.leaked).toHaveLength(0);
  });

  it("catches an answer leaked into a hidden data attribute", () => {
    const container = document.createElement("div");
    // BUG: a debug attribute left on the DOM node leaks the answer before reveal — invisible to a
    // sighted learner, fully readable by dev tools or a screen reader's attribute inspection.
    container.innerHTML = `<div data-debug-answer="x=4">Solve for x.</div>`;
    const result = answerLeakCheck(container, ["x=4"]);
    expect(result.ok).toBe(false);
    expect(result.leaked).toEqual(["x=4"]);
  });

  it("catches an answer leaked into an aria-label rather than visible text", () => {
    const container = document.createElement("div");
    container.innerHTML = `<button aria-label="Reveal the answer, x=4">Reveal</button>`;
    const result = answerLeakCheck(container, ["x=4"]);
    expect(result.ok).toBe(false);
  });

  it("refuses an empty forbidden list", () => {
    const container = document.createElement("div");
    expect(() => answerLeakCheck(container, [])).toThrow(/at least one answer string/);
  });
});

// =================================================================================================
// 7. reducedMotionCheck / stubPrefersReducedMotion (jsdom)
// =================================================================================================

describe("reducedMotionCheck", () => {
  it("activates prefers-reduced-motion for the duration of render, then restores matchMedia", () => {
    const before = window.matchMedia;
    let observedDuringRender: boolean | null = null;
    reducedMotionCheck({
      render: () => {
        observedDuringRender = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const el = document.createElement("div");
        el.textContent = "x = 4 (final)";
        return el;
      },
      assertMeaningful: (container) => {
        expect(container.textContent).toContain("x = 4");
      },
    });
    expect(observedDuringRender).toBe(true);
    expect(window.matchMedia).toBe(before);
  });

  it("catches a component that renders no meaningful content under reduced motion", () => {
    // BUG: the component communicates its final state only via an animation callback that fires
    // after a CSS transition — with motion suppressed, that callback never runs, so the "final"
    // render is an empty shell.
    expect(() =>
      reducedMotionCheck({
        render: () => document.createElement("div"),
        assertMeaningful: (container) => {
          if (!container.textContent || container.textContent.trim() === "") {
            throw new Error("reduced-motion render produced no meaningful content");
          }
        },
      })
    ).toThrow(/no meaningful content/);
  });

  it("restores matchMedia even when assertMeaningful throws", () => {
    const before = window.matchMedia;
    expect(() =>
      reducedMotionCheck({
        render: () => document.createElement("div"),
        assertMeaningful: () => {
          throw new Error("boom");
        },
      })
    ).toThrow(/boom/);
    expect(window.matchMedia).toBe(before);
  });
});

describe("stubPrefersReducedMotion", () => {
  it("reports false for unrelated media queries", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      expect(window.matchMedia("(min-width: 600px)").matches).toBe(false);
      expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
    } finally {
      restore();
    }
  });

  it("can also stub the OFF state explicitly", () => {
    const restore = stubPrefersReducedMotion(false);
    try {
      expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(false);
    } finally {
      restore();
    }
  });
});
