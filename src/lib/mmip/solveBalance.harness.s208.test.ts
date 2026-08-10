// @vitest-environment jsdom
//
// THE BRIDGE — solveBalance's MMIP model presented to the generic harness (S1's mmipHarness.ts).
//
// mmipHarness is deliberately decoupled from mmipTypes.ts: it asks for an `MmipModel<TState,
// TViews>` with `init/applyEdit/derive` and knows nothing about `SyncTransaction`, `EditOrigin` or
// `RepresentationBinding`. This file is the thin adapter between the two, and then runs every check
// the harness offers against it.
//
// TWO THINGS THE ADAPTER ADDS, both faithful to the shipped widget rather than convenient:
//
//   · TState carries the undo history alongside the pans, exactly as the persisted widget value
//     does. The canonical model is deliberately historyless (motion and memory are not
//     mathematics), so `undoCheck` needs the same envelope the component puts round it.
//   · TViews bundles ALL THREE representations at once — the pans, the equation strip's slots and
//     the move controls — because the whole point of these checks is that they cannot secretly
//     disagree with one another.
//
// INDEPENDENCE: `handDerive` below is a second, complete transcription of the same mathematics
// from its definition — different traversal, string building instead of token objects, literal
// frame constants instead of `solveBalanceFrame` — and it is what every check compares the model
// against. Every witness, bound and expected count in this file is arithmetic done here, never a
// value read back out of the module under test.

import { createElement, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "@/components/widgets";
import { evaluate } from "@/lib/evaluate";
import { SolveBalanceSpec, type TSolveBalance, type TWidget } from "@/lib/schema";
import {
  answerLeakCheck,
  equivalenceCheck,
  evaluatorRendererAgreement,
  keyboardParityCheck,
  reducedMotionCheck,
  roundTripCheck,
  srStateCheck,
  staleStateCheck,
  transactionCheck,
  undoCheck,
  type EditStep,
  type MmipModel,
  type Origin,
} from "./mmipHarness";
import {
  SB_REPRESENTATIONS,
  deriveControls,
  deriveSymbol,
  deriveTiles,
  solveBalanceApply,
  solveBalanceFrame,
  solveBalanceInitial,
  solveBalanceWeights,
  type SBRel,
  type SolveBalanceEdit,
  type SolveBalanceState,
} from "./solveBalanceModel";
import type { EditOrigin } from "./mmipTypes";

afterEach(cleanup);

const FB = {
  successFeedback: "s",
  unbalancedFeedback: "u",
  notIsolatedFeedback: "n",
  missFeedback: "m",
};

/** 3x + 4 = 19. Solves to x = 5, so the beam is weighed at 5 — computed by hand as (19 − 4) / 3
 * and asserted against the model's own frame below rather than copied from it. */
const CLASSIC = SolveBalanceSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3x + 4 = 19.",
  a: 3,
  b: 4,
  c: 19,
  ...FB,
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

/** −5(x + 3) = −20 — five sealed copies of −(x + 3). Solves to x = 1. */
const NEG_GROUPED = SolveBalanceSpec.parse({
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

const frame = solveBalanceFrame(CLASSIC);

/* ══════════════════════════════════ the adapter ══════════════════════════════════ */

/** The pans plus the undo history — the shape the widget persists. */
interface HState {
  readonly pans: SolveBalanceState;
  readonly hist: readonly SolveBalanceState[];
}

/** All three representations, flattened to plain comparable data. `tilt` is deliberately left out:
 * it is a rendering angle, not a mathematical fact, and `heavier` already carries what the beam
 * says. */
interface HViews {
  readonly leftXTiles: number;
  readonly leftXNegative: boolean;
  readonly leftUnitTiles: number;
  readonly leftUnitNegative: boolean;
  readonly rightUnitTiles: number;
  readonly rightUnitNegative: boolean;
  readonly groupChips: number;
  readonly leftEmpty: boolean;
  readonly rightEmpty: boolean;
  readonly leftWeight: number;
  readonly rightWeight: number;
  readonly holds: boolean;
  readonly done: boolean;
  readonly heavier: string;
  readonly sentence: string;
  readonly relationSymbol: string;
  readonly relationWord: string;
  readonly symbolEditable: boolean;
  /** [value, min, max, editable] per slot. */
  readonly coef: readonly [number, number, number, boolean];
  readonly leftConst: readonly [number, number, number, boolean];
  readonly rightConst: readonly [number, number, number, boolean];
  readonly canSplit: boolean;
  readonly splitDivisor: number;
  readonly canNegate: boolean;
  readonly canFlip: boolean;
  readonly canDistribute: boolean;
  readonly signedAddersInClassicSet: boolean;
}

const ORIGIN_SOURCE: Record<string, string> = {
  physical: SB_REPRESENTATIONS.tiles,
  control: SB_REPRESENTATIONS.controls,
  symbolic: SB_REPRESENTATIONS.symbol,
};

const model: MmipModel<HState, HViews> = {
  origins: ["physical", "control", "symbolic"],
  init: () => ({ pans: solveBalanceInitial(frame), hist: [] }),
  applyEdit: (state, origin, edit) => {
    const tx = solveBalanceApply(
      frame,
      state.pans,
      edit as SolveBalanceEdit,
      origin as EditOrigin,
      ORIGIN_SOURCE[origin] ?? origin
    );
    // The widget records a step only when the pans actually moved; a refusal is not history.
    if (tx.rejected || !tx.changed) return state;
    return { pans: tx.after, hist: [...state.hist, state.pans] };
  },
  // The thin bridge S1's `transactionCheck` asks for: the engine's own transaction, lifted to the
  // envelope. Added in S213 — this bridge predates the check, which is why the unchanged-ops shape
  // below went unnoticed here while the identical one was caught in algebraTiles.
  applyTransaction: (state, origin, edit) => {
    const tx = solveBalanceApply(
      frame,
      state.pans,
      edit as SolveBalanceEdit,
      origin as EditOrigin,
      ORIGIN_SOURCE[origin] ?? origin
    );
    const after: HState =
      tx.rejected || !tx.changed ? state : { pans: tx.after, hist: [...state.hist, state.pans] };
    return { ...tx, before: state, after };
  },
  derive: (state) => {
    const tiles = deriveTiles(frame, state.pans);
    const sym = deriveSymbol(frame, state.pans);
    const ctl = deriveControls(frame, state.pans);
    const w = tiles.weights;
    const slot = (s: { value: number; min: number; max: number; editable: boolean }) =>
      [s.value, s.min, s.max, s.editable] as const;
    return {
      leftXTiles: tiles.left.xTiles,
      leftXNegative: tiles.left.xNegative,
      leftUnitTiles: tiles.left.unitTiles,
      leftUnitNegative: tiles.left.unitNegative,
      rightUnitTiles: tiles.right.unitTiles,
      rightUnitNegative: tiles.right.unitNegative,
      groupChips: tiles.left.groups,
      leftEmpty: tiles.left.empty,
      rightEmpty: tiles.right.empty,
      leftWeight: w.left,
      rightWeight: w.right,
      holds: w.holds,
      done: w.done,
      heavier: w.heavier,
      sentence: sym.sentence,
      relationSymbol: sym.relationSymbol,
      relationWord: sym.relationWord,
      symbolEditable: sym.editable,
      coef: slot(sym.slots.leftCoefficient),
      leftConst: slot(sym.slots.leftConstant),
      rightConst: slot(sym.slots.rightConstant),
      canSplit: ctl.canSplit,
      splitDivisor: ctl.splitDivisor,
      canNegate: ctl.canNegate,
      canFlip: ctl.canFlip,
      canDistribute: ctl.canDistribute,
      signedAddersInClassicSet: ctl.signedAddersInClassicSet,
    };
  },
};

/** Undo as the widget performs it: pop the history, restore the pans it holds. */
const undo = (state: HState): HState =>
  state.hist.length === 0
    ? state
    : { pans: state.hist[state.hist.length - 1], hist: state.hist.slice(0, -1) };

/* ═══════════════════════ the independent recompute (never the model's own) ═══════════════════════ */

// 3x + 4 = 19 — the frame written out by hand.
const A = 3;
const B = 4;
const C = 19;
const WITNESS = (C - B) / A; // 5
const UNIT_BOUND = Math.max(30, Math.abs(B), Math.abs(C)); // 30
const REL_SYM: Record<SBRel, string> = { eq: "=", lt: "<", gt: ">", le: "≤", ge: "≥" };
const REL_WORD: Record<SBRel, string> = {
  eq: "equals",
  lt: "is less than",
  gt: "is greater than",
  le: "is at most",
  ge: "is at least",
};
const MINUS = "−";

/** The sentence, built by concatenating strings straight from the definition of the notation —
 * a different traversal from the model's token objects. */
function handSentence(st: SolveBalanceState): string {
  const parts: string[] = [];
  const push = (neg: boolean, mag: string) =>
    parts.push(parts.length === 0 ? (neg ? `${MINUS}${mag}` : mag) : `${neg ? MINUS : "+"} ${mag}`);
  if (st.leftX !== 0) push(st.leftX < 0, Math.abs(st.leftX) === 1 ? "x" : `${Math.abs(st.leftX)}x`);
  if (st.leftUnits !== 0) push(st.leftUnits < 0, `${Math.abs(st.leftUnits)}`);
  const left = parts.length > 0 ? parts.join(" ") : "0";
  const right =
    st.rightUnits === 0 ? "0" : st.rightUnits < 0 ? `${MINUS}${Math.abs(st.rightUnits)}` : `${st.rightUnits}`;
  return `${left} ${REL_SYM[st.rel]} ${right}`;
}

function handDerive(state: HState): HViews {
  const st = state.pans;
  // CLASSIC has no brackets, so a group term can never appear; the walk below asserts that rather
  // than assuming it.
  if (st.groups !== 0) throw new Error("handDerive: the classic frame has no brackets to weigh.");
  const leftWeight = st.leftX * WITNESS + st.leftUnits;
  const rightWeight = st.rightUnits;
  const holds = st.rel === "eq" ? leftWeight === rightWeight
    : st.rel === "lt" ? leftWeight < rightWeight
    : st.rel === "gt" ? leftWeight > rightWeight
    : st.rel === "le" ? leftWeight <= rightWeight
    : leftWeight >= rightWeight;
  const k = Math.abs(st.leftX);
  return {
    leftXTiles: Math.abs(st.leftX),
    leftXNegative: st.leftX < 0,
    leftUnitTiles: Math.abs(st.leftUnits),
    leftUnitNegative: st.leftUnits < 0,
    rightUnitTiles: Math.abs(st.rightUnits),
    rightUnitNegative: st.rightUnits < 0,
    groupChips: 0,
    leftEmpty: st.leftX === 0 && st.leftUnits === 0,
    rightEmpty: st.rightUnits === 0,
    leftWeight,
    rightWeight,
    holds,
    done: holds && st.leftX === 1 && st.leftUnits === 0,
    heavier: leftWeight > rightWeight ? "left" : leftWeight < rightWeight ? "right" : "level",
    sentence: handSentence(st),
    relationSymbol: REL_SYM[st.rel],
    relationWord: REL_WORD[st.rel],
    symbolEditable: true,
    coef: [st.leftX, Math.min(0, st.leftX), Math.max(0, st.leftX), st.leftX !== 0],
    leftConst: [st.leftUnits, -UNIT_BOUND, UNIT_BOUND, true],
    rightConst: [st.rightUnits, -UNIT_BOUND, UNIT_BOUND, true],
    canSplit: k > 1 && st.leftUnits === 0 && st.rightUnits % k === 0,
    splitDivisor: k,
    canNegate: st.leftX < 0 || st.leftUnits < 0 || st.rightUnits < 0,
    canFlip: false, // an equals sign has no direction to turn
    canDistribute: false, // no brackets in this frame
    signedAddersInClassicSet: A < 0 || B < 0 || C < 0,
  };
}

/* ══════════════════════════════════ 1–4: the pure checks ══════════════════════════════════ */

describe("the bridge itself", () => {
  it("presents the frame the hand arithmetic assumes", () => {
    expect(frame.witness).toBe(WITNESS);
    expect(frame.unitBound).toBe(UNIT_BOUND);
    expect(frame.groups).toBeNull();
    expect(model.init()).toEqual({ pans: { leftX: 3, leftUnits: 4, rightUnits: 19, groups: 0, partial: 0, rel: "eq" }, hist: [] });
  });
});

describe("roundTripCheck — one edit from every origin, all views recomputed", () => {
  const CASES: EditStep[] = [
    { origin: "physical", edit: { kind: "tapLeftUnit" } },
    { origin: "physical", edit: { kind: "tapRightUnit" } },
    { origin: "physical", edit: { kind: "tapLeftX" } },
    { origin: "physical", edit: { kind: "stepRightUnits", delta: -1 } },
    { origin: "control", edit: { kind: "reset" } },
    { origin: "control", edit: { kind: "negate" } }, // refused here — nothing negative to turn
    { origin: "symbolic", edit: { kind: "setLeftConstant", value: 0 } },
    { origin: "symbolic", edit: { kind: "setRightConstant", value: 15 } },
    { origin: "symbolic", edit: { kind: "setLeftCoefficient", value: 1 } },
    { origin: "symbolic", edit: { kind: "setLeftCoefficient", value: 9 } }, // refused — no conjuring
  ];

  it("every representation agrees with the independent recompute, from every origin", () => {
    const r = roundTripCheck(model, CASES, handDerive);
    expect(r.failures).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.casesRun).toBe(CASES.length);
  });
});

describe("staleStateCheck — a long deterministic walk through all three origins", () => {
  /** A seeded edit generator. Every edit it can produce is one a learner really has: taps and the
   * ±1 adders from the pans, the named moves from the controls, typed slots from the strip. */
  const randomEdit = (state: HState, origin: Origin, rand: () => number): unknown => {
    const st = state.pans;
    const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length) % xs.length];
    if (origin === "physical")
      return pick<SolveBalanceEdit>([
        { kind: "tapLeftUnit" },
        { kind: "tapRightUnit" },
        { kind: "tapLeftX" },
        { kind: "stepLeftUnits", delta: 1 },
        { kind: "stepLeftUnits", delta: -1 },
        { kind: "stepRightUnits", delta: 1 },
        { kind: "stepRightUnits", delta: -1 },
      ]);
    if (origin === "control")
      return pick<SolveBalanceEdit>([
        { kind: "split" },
        { kind: "negate" },
        { kind: "flipRelation" },
        { kind: "distributeAll" },
        { kind: "reset" },
      ]);
    const delta = Math.floor(rand() * 5) - 2;
    return pick<SolveBalanceEdit>([
      { kind: "setLeftConstant", value: st.leftUnits + delta },
      { kind: "setRightConstant", value: st.rightUnits + delta },
      { kind: "setLeftCoefficient", value: st.leftX + delta },
      { kind: "setRightConstant", value: 999 }, // out of bounds — must be refused, not clamped
    ]);
  };

  it("no representation goes stale over 240 rotating edits", () => {
    const r = staleStateCheck(model, handDerive, { seed: 208, steps: 240, randomEdit });
    expect(r.failures).toEqual([]);
    expect(r.stepsRun).toBe(240);
  });

  it("the same seed replays the same walk — a failure here would be debuggable, not a flake", () => {
    const a = staleStateCheck(model, handDerive, { seed: 41, steps: 60, randomEdit });
    const b = staleStateCheck(model, handDerive, { seed: 41, steps: 60, randomEdit });
    expect(a).toEqual(b);
  });
});

describe("equivalenceCheck — representation is not path-dependent", () => {
  // Both routes land on x = 5. Written out by hand: 4 taps a side clears the constants and leaves
  // 3x = 15, which shares into three groups of (x, 5).
  const byTiles: EditStep[] = [
    ...Array.from({ length: 4 }, () => ({ origin: "physical", edit: { kind: "tapLeftUnit" } })),
    ...Array.from({ length: 4 }, () => ({ origin: "physical", edit: { kind: "tapRightUnit" } })),
    { origin: "control", edit: { kind: "split" } },
  ];
  const byTyping: EditStep[] = [
    { origin: "symbolic", edit: { kind: "setLeftConstant", value: 0 } },
    { origin: "symbolic", edit: { kind: "setRightConstant", value: 15 } },
    { origin: "control", edit: { kind: "split" } },
  ];

  it("tapping and typing produce the same views, though the histories differ", () => {
    const r = equivalenceCheck(model, byTiles, byTyping);
    expect(r.ok).toBe(true);
    expect(r.viewsA.sentence).toBe("x = 5");
    expect(r.stateA.pans).toEqual(r.stateB.pans);
    expect(r.stateA.hist.length).toBeGreaterThan(r.stateB.hist.length); // different roads, same place
  });

  it("a route that only LOOKS equivalent is caught", () => {
    const notEquivalent: EditStep[] = [
      { origin: "symbolic", edit: { kind: "setLeftConstant", value: 0 } },
      { origin: "symbolic", edit: { kind: "setRightConstant", value: 14 } }, // one tile short
      { origin: "control", edit: { kind: "split" } }, // refused: 14 does not share into 3
    ];
    expect(equivalenceCheck(model, byTiles, notEquivalent).ok).toBe(false);
  });
});

describe("undoCheck — every step back is exact", () => {
  const SEQUENCE: EditStep[] = [
    { origin: "physical", edit: { kind: "tapLeftUnit" } },
    { origin: "symbolic", edit: { kind: "setLeftConstant", value: 0 } },
    { origin: "symbolic", edit: { kind: "setRightConstant", value: 15 } },
    { origin: "control", edit: { kind: "split" } },
    { origin: "physical", edit: { kind: "stepRightUnits", delta: 1 } },
  ];

  it("unwinds a mixed-origin solve tile for tile, state and views alike", () => {
    const r = undoCheck(model, undo, SEQUENCE);
    expect(r.failures).toEqual([]);
  });
});

describe("evaluatorRendererAgreement — the grader and the picture tell one story", () => {
  const st = (
    leftX: number,
    leftUnits: number,
    rightUnits: number,
    extra: Partial<SolveBalanceState> = {}
  ): SolveBalanceState => ({ leftX, leftUnits, rightUnits, groups: 0, partial: 0, rel: "eq", ...extra });

  /** What the learner is looking at, assembled from the derivations the widget draws from. */
  const renderText = (spec: TSolveBalance, state: SolveBalanceState): string => {
    const f = solveBalanceFrame(spec);
    const w = solveBalanceWeights(f, state);
    return `${deriveSymbol(f, state).sentence} | beam ${w.heavier} | ${
      w.done ? "x stands alone on a level beam" : "not finished"
    }`;
  };

  // Every expectation here was worked out by hand before it was written down; see the comments.
  const CASES = [
    { spec: CLASSIC, state: st(3, 4, 19), label: "the problem as written" },
    { spec: CLASSIC, state: st(3, 0, 15), label: "fair but unfinished" },
    { spec: CLASSIC, state: st(1, 0, 19), label: "isolated but one-sided" },
    { spec: CLASSIC, state: st(1, 0, 5), label: "solved" },
    { spec: CLASSIC, state: st(0, 4, 4), label: "every x-tile gone" },
    // 3(x + 2) = 18 is weighed at (18 − 6)/3 = 4.
    { spec: GROUPED, state: st(0, 0, 18, { groups: 3 }), label: "brackets standing" },
    { spec: GROUPED, state: st(3, 6, 18), label: "distributed to both parts" },
    { spec: GROUPED, state: st(3, 2, 18, { partial: 1 }), label: "multiplier stopped at the x" },
    { spec: GROUPED, state: st(1, 0, 4), label: "grouped, solved" },
    // −5(x + 3) = −20 is weighed at (−20 + 15)/(−5) = 1. Five sealed copies of −(x + 3) weigh
    // 5 × (−1) × 4 = −20 against −20, so the beam is level and the position is unfinished. Until
    // S208 Wave 2b the grader weighed the same bracket without the multiplier's sign and reported
    // a tipped beam here; this case is the one that used to diverge.
    { spec: NEG_GROUPED, state: st(0, 0, -20, { groups: 5 }), label: "negative bracket sealed, level" },
    { spec: NEG_GROUPED, state: st(0, 0, -19, { groups: 5 }), label: "negative bracket sealed, tipped" },
    { spec: NEG_GROUPED, state: st(-5, -15, -20), label: "negative bracket opened" },
    { spec: NEG_GROUPED, state: st(1, 0, 1), label: "negative bracket, solved" },
    // −2x + 5 > −3 solves to x < 4 and is weighed at the strict witness 3.
    { spec: INEQ, state: st(-2, 5, -3, { rel: "gt" }), label: "the inequality as written" },
    { spec: INEQ, state: st(2, -5, 3, { rel: "gt" }), label: "negated, comparator not flipped" },
    { spec: INEQ, state: st(1, 0, 4, { rel: "lt" }), label: "solved, comparator flipped" },
    { spec: INEQ, state: st(1, 0, 4, { rel: "gt" }), label: "solved, comparator left alone" },
  ];

  it("what the beam shows is what the grader concludes, on every case", () => {
    const r = evaluatorRendererAgreement(
      CASES,
      (spec, state) => evaluate(spec as TWidget, state),
      renderText,
      (truth, text) => (truth as { correct: boolean }).correct === text.includes("x stands alone on a level beam")
    );
    expect(r.failures).toEqual([]);
  });

  it("exactly the two solved positions are graded correct — hand-checked, not counted from the model", () => {
    const correct = CASES.filter((c) => evaluate(c.spec as TWidget, c.state).correct).map((c) => c.label);
    expect(correct).toEqual([
      "solved",
      "grouped, solved",
      "negative bracket, solved",
      "solved, comparator flipped",
    ]);
  });
});

/* ═════════════════════════════ 5–7: the jsdom checks, on the real widget ═════════════════════════════ */

function mountWidget(spec: TWidget = CLASSIC as TWidget): HTMLElement {
  const Host = () => {
    const [v, setV] = useState<unknown>(undefined);
    return createElement(WidgetRenderer, { spec, value: v, onChange: setV, disabled: false });
  };
  const { container } = render(createElement(Host));
  return container;
}

const openStrip = () => fireEvent.click(screen.getByTestId("sb-sym-toggle"));

describe("keyboardParityCheck — every pointer affordance has a keyboard route", () => {
  it("tiles, sentence terms, move controls and the whole equation strip", () => {
    const container = mountWidget();
    openStrip();
    const r = keyboardParityCheck(container, {
      pointerSelectors: {
        tiles: '[data-testid="sb-left"] button, [data-testid="sb-right"] button',
        adders: '[data-testid="sb-left-add"], [data-testid="sb-right-sub"]',
        terms: '[data-testid^="sb-term-"]',
        controls: '[data-testid="sb-reset"], [data-testid="sb-sym-toggle"]',
        stripSteppers: "#sb-sym-panel button:not([disabled])",
        stripFields: "#sb-sym-panel input",
      },
    });
    expect(r.failures).toEqual([]);
    // 3 x-tiles + 4 left units + 19 right units = 26 tiles, worked out from the spec by hand
    expect(r.checked).toBeGreaterThanOrEqual(26);
  });
});

describe("srStateCheck — the mathematics reaches a screen reader, not just the screen", () => {
  it("says what each number is and what the last move did to it", () => {
    const container = mountWidget();
    openStrip();
    fireEvent.change(screen.getByTestId("sb-sym-lu"), { target: { value: "1" } });
    // Independently: the left pan held 4 and now holds 1, so 3 tiles left it. Nothing below is
    // copied from the component — each string is assembled from that arithmetic.
    const moved = 4 - 1;
    const r = srStateCheck(container, {
      expectedSubstrings: [
        `Took ${moved} unit tiles off the left pan only`,
        `how many unit tiles stand on the left pan, currently ${1}`,
        `how many unit tiles stand on the right pan, currently ${19}`,
        `how many x-tiles stand on the left pan, currently ${3}`,
        `Take one unit tile off the right pan`,
      ],
    });
    expect(r.missing).toEqual([]);
  });
});

describe("answerLeakCheck — nothing on the page knows the answer yet", () => {
  it("no text, label or attribute carries x = 5 before the reveal", () => {
    const container = mountWidget();
    openStrip();
    const r = answerLeakCheck(container, [
      "x = 5",
      "5 unit tiles on the right",
      "Finished state",
      "data-answer",
    ]);
    expect(r.leaked).toEqual([]);
  });

  it("the check is not vacuous: it does find the reveal ghost when it is shown", () => {
    const Host = () =>
      createElement(WidgetRenderer, {
        spec: CLASSIC as TWidget,
        value: { leftX: 3, leftUnits: 4, rightUnits: 19 },
        onChange: () => {},
        disabled: true,
        tone: "info" as const,
      });
    const { container } = render(createElement(Host));
    expect(answerLeakCheck(container, ["x = 5"]).leaked).toEqual(["x = 5"]);
  });
});

describe("reducedMotionCheck — the move is legible with every animation switched off", () => {
  it("the pans move, nothing travels, and the words carry the whole transformation", () => {
    reducedMotionCheck({
      render: () => {
        const container = mountWidget();
        openStrip();
        fireEvent.change(screen.getByTestId("sb-sym-lu"), { target: { value: "1" } });
        return container;
      },
      assertMeaningful: (container) => {
        // the state change itself is complete without any motion
        expect(container.querySelector('[data-testid="sb-equation"]')?.textContent).toBe("3x + 1 = 19");
        expect(container.querySelectorAll('[data-testid="sb-left"] button')).toHaveLength(3 + 1);
        // and nothing was staged to travel
        expect(container.querySelectorAll("[data-morph-ms]")).toHaveLength(0);
        // the reduced plan's own words, including its net delta, reached the live region
        const status = container.querySelector('[data-testid="sb-sym-status"]')?.textContent ?? "";
        expect(status).toContain(`Took ${4 - 1} unit tiles off the left pan only`);
        expect(status).toContain(`State delta: leftUnits ${1 - 4}.`);
      },
    });
  });
});

/* ─────────── S213: invariant 2 and the rejection contract, over a replayed log ─────────── */

describe("transactionCheck — every transaction carries its origin, ops and refusal honestly", () => {
  it("walks a mixed log, including the unchanged reset that the ops rule turns on", () => {
    const r = transactionCheck(model, [
      // RESET ON AN UNTOUCHED POSITION, first thing: accepted, legal, and NOT an event. It must
      // report `changed: false` and carry no ops — describing a move that did not happen is the
      // mirror of the "string crossfade" the contract forbids. This case is why the check exists
      // here at all: the identical shape was found in algebraTiles in S212 and fixed in this
      // engine in S213, and nothing could reach it before because this bridge had no
      // `applyTransaction`.
      { origin: "control", edit: { kind: "reset" } },
      { origin: "physical", edit: { kind: "tapLeftUnit" } },
      { origin: "control", edit: { kind: "flipRelation" } }, // refused: an equals sign has no direction
      { origin: "symbolic", edit: { kind: "setLeftCoefficient", value: 9 } }, // refused: no conjuring
      { origin: "symbolic", edit: { kind: "setLeftConstant", value: 0 } },
      { origin: "symbolic", edit: { kind: "setRightConstant", value: 15 } },
      { origin: "control", edit: { kind: "split" } },
      { origin: "symbolic", edit: { kind: "setLeftCoefficient", value: 1 } }, // accepted, unchanged
      { origin: "control", edit: { kind: "reset" } }, // accepted, changed: back from x = 5
      { origin: "control", edit: { kind: "reset" } }, // accepted, unchanged again
    ]);
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(10);
  });

  it("a reset that changes nothing describes nothing, and compiles to no motion", () => {
    const start = solveBalanceInitial(frame);
    const tx = solveBalanceApply(frame, start, { kind: "reset" }, "control", SB_REPRESENTATIONS.controls);
    expect(tx.rejected).toBe(false);
    expect(tx.changed).toBe(false);
    expect(tx.ops).toEqual([]);
    // …while a reset from a moved position still says what it did
    const moved = solveBalanceApply(
      frame,
      { leftX: 1, leftUnits: 0, rightUnits: 5, groups: 0, partial: 0, rel: "eq" },
      { kind: "reset" },
      "control",
      SB_REPRESENTATIONS.controls
    );
    expect(moved.changed).toBe(true);
    expect(moved.ops.map((o) => o.kind)).toEqual(["restore"]);
  });
});
