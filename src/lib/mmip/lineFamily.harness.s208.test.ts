// THE BRIDGE — the line family's RSG presented to the generic harness (S1's mmipHarness.ts).
//
// mmipHarness asks for an `MmipModel<TState, TViews>` with `init/applyEdit/derive` and knows
// nothing about `repSyncGraph`, `AbsorbOutcome` or exact rationals. This file is the thin adapter
// between the two, and then runs every pure check the harness offers against it.
//
// TWO THINGS THE ADAPTER ADDS, both faithful to the shipped widget rather than convenient:
//
//   · `applyEdit` must be PURE — the harness branches and replays from any prior state — while a
//     `RepSyncGraph` is a live, mutating object. So `TState` is the graph's SERIALIZATION (its
//     canonical state plus its undo stack, via `snapshots()` / `RepSyncConfig.history`), and every
//     step builds a graph, drives it, and serializes it back. Undo is therefore still
//     `repSyncGraph.undo()` — there is no second undo implementation anywhere in this file, which
//     is the whole point of the S208 review's undo-ownership note.
//   · `TViews` bundles the equation, the plotted segment, the slope triangle and the table at
//     once, because the point of these checks is that they cannot secretly disagree.
//
// INDEPENDENCE: `handDerive` is a second, complete transcription of the same mathematics from its
// definition. It never touches `Rat`, never calls `lineValueAt`, `deriveEquation`, `deriveGraph`,
// `deriveTable` or `deriveTriangle`, and computes every output of the line by REPEATED ADDITION of
// the slope rather than by multiplying — a genuinely different route to the same numbers. Its own
// sharpness is checked (`the independent derive really does bite`) by mutating it and asserting it
// then disagrees, so a silently-agreeing tautology cannot masquerade as a passing check.

import { describe, expect, it } from "vitest";
import { stableKey } from "./repSyncGraph";
import {
  equivalenceCheck,
  roundTripCheck,
  staleStateCheck,
  transactionCheck,
  undoCheck,
  type EditStep,
  type MmipModel,
  type Origin,
  type TransactionLike,
} from "./mmipHarness";
import { linePairCanonicalModel, type LinePairCanonical } from "./linePairModel";
import {
  createLineFamilyGraph,
  describeLineChange,
  lineFamilyCanonicalModel,
  makeLineCanonical,
  rat,
  ratToNumber,
  ONE,
  ZERO,
  type EquationEdit,
  type GraphEdit,
  type LineCanonical,
} from "./lineFamilyModel";

/* ── the state the adapter carries: the graph, serialized ─────────────────────────────────────── */

type LFState = { readonly canonical: LineCanonical; readonly history: readonly LineCanonical[] };

/** The four ways into an authored lineExplore, named by (representation, gesture). */
const ORIGINS = [
  "graph:intercept",
  "graph:unit",
  "equation:slope",
  "equation:intercept",
  // Dragging the unit handle while it sits ON the y-axis: the point at x = 0 IS the intercept, so
  // no tilt can move it. Always refused — which is exactly what makes the rejection contract
  // checkable rather than hypothetical.
  "graph:pivot-at-zero",
] as const;
type LFOrigin = (typeof ORIGINS)[number];

/** The authored spec this file stands in for: y = 2x + 1 on a ±6 grid, integer sliders −4..4 and
 * −5..5 — the same shape `widgetSamples.ts` ships and `widgets.drag.test.tsx` pins. */
const G = 6;
const START: LineCanonical = makeLineCanonical({
  m: ZERO,
  b: ZERO,
  anchorX: ZERO,
  run: ONE,
  domain: { start: rat(-2), step: ONE, count: 5 },
  window: { xMin: -G, xMax: G, yMin: -G, yMax: G },
  policy: {
    slopeMin: rat(-4),
    slopeMax: rat(4),
    interceptMin: rat(-5),
    interceptMax: rat(5),
    slopeStep: ONE,
    interceptStep: ONE,
    outOfRange: "clamp",
    offLattice: "snap",
  },
});

const graphFor = (state: LFState) =>
  createLineFamilyGraph(state.canonical, { history: state.history });

const serialize = (g: ReturnType<typeof graphFor>): LFState => ({
  canonical: g.getCanonical(),
  history: g.snapshots(),
});

/** An origin's payload is the number the learner produced there: a y-coordinate for a drag handle,
 * a slider value for a parameter. The model decides what each one MEANS. */
function editFor(origin: LFOrigin, value: number): { rep: "graph" | "equation"; edit: GraphEdit | EquationEdit } {
  switch (origin) {
    case "graph:intercept":
      return { rep: "graph", edit: { kind: "dragPoint", handle: "intercept", x: ZERO, y: rat(value) } };
    case "graph:unit":
      return { rep: "graph", edit: { kind: "dragPoint", handle: "unit", x: ONE, y: rat(value) } };
    case "equation:slope":
      return { rep: "equation", edit: { kind: "setSlope", m: rat(value) } };
    case "equation:intercept":
      return { rep: "equation", edit: { kind: "setIntercept", b: rat(value) } };
    case "graph:pivot-at-zero":
      return { rep: "graph", edit: { kind: "dragPoint", handle: "unit", x: ZERO, y: rat(value) } };
  }
}

/* ── the views both routes must agree on ──────────────────────────────────────────────────────── */

type LFViews = {
  readonly equationText: string;
  readonly display: string;
  readonly slopeText: string;
  readonly interceptText: string;
  readonly segment: readonly [string, string];
  readonly triangle: { readonly run: string; readonly rise: string; readonly anchor: string; readonly tip: string };
  readonly table: readonly string[];
  readonly lattice: readonly string[];
};

const model: MmipModel<LFState, LFViews> = {
  origins: [...ORIGINS],
  init: () => ({ canonical: START, history: [] }),
  applyEdit(state, origin, edit) {
    const g = graphFor(state);
    const { rep, edit: payload } = editFor(origin as LFOrigin, edit as number);
    if (rep === "graph") g.apply("graph", payload as GraphEdit);
    else g.apply("equation", payload as EquationEdit);
    return serialize(g);
  },
  /** THE THIN BRIDGE (S209). The transaction comes from the assembled `CanonicalModel` — the
   * normative contract — and is lifted from `LineCanonical` to this adapter's serialized state so
   * `transactionCheck` compares like with like. Nothing here re-decides anything: `ops`,
   * `rejected` and `rejection` are the model's own. */
  applyTransaction(state, origin, edit): TransactionLike<LFState> {
    const { rep, edit: payload } = editFor(origin as LFOrigin, edit as number);
    const tx = lineFamilyCanonicalModel(state.canonical).apply(
      state.canonical,
      payload,
      rep === "graph" ? "physical" : "symbolic",
      rep
    );
    const after = tx.rejected || !tx.changed ? state : model.applyEdit(state, origin, edit);
    return {
      before: state,
      after,
      origin,
      ops: tx.ops,
      changed: tx.changed,
      rejected: tx.rejected,
      ...(tx.rejection ? { rejection: tx.rejection } : {}),
    };
  },
  derive(state) {
    const g = graphFor(state);
    const eq = g.view("equation");
    const plot = g.view("graph");
    const tri = g.view("triangle");
    const table = g.view("table");
    const pt = (p: { x: { n: number; d: number }; y: { n: number; d: number } }) =>
      `${ratToNumber(p.x)},${ratToNumber(p.y)}`;
    return {
      equationText: eq.text,
      display: eq.display,
      slopeText: eq.slopeText,
      interceptText: eq.interceptText,
      segment: [pt(plot.from), pt(plot.to)],
      triangle: { run: tri.runText, rise: tri.riseText, anchor: pt(tri.anchor), tip: pt(tri.tip) },
      table: table.rows.map((row) => `${row.xText},${row.yText}`),
      lattice: plot.latticePoints.map(pt),
    };
  },
};

const undo = (state: LFState): LFState => {
  const g = graphFor(state);
  g.undo();
  return serialize(g);
};

/* ── the independent transcription ────────────────────────────────────────────────────────────── */

/**
 * y at x, by REPEATED ADDITION of the slope — the definition of a constant rate of change, and a
 * different route from the model's single multiplication. Exact for the integer lattice a
 * lineExplore can reach, which is every state this file drives.
 */
function stepTo(m: number, b: number, x: number): number {
  let y = b;
  for (let k = 0; k < Math.abs(x); k += 1) y += x > 0 ? m : -m;
  return y;
}

/** The reading form, assembled from parts rather than from the model's template. */
function readingForm(m: number, b: number): string {
  const minus = "−";
  const num = (v: number) => (v < 0 ? `${minus}${Math.abs(v)}` : `${v}`);
  if (m === 0) return `y = ${num(b)}`;
  const term = m === 1 ? "x" : m === -1 ? `${minus}x` : `${num(m)}x`;
  if (b === 0) return `y = ${term}`;
  return [`y =`, term, b < 0 ? minus : "+", `${Math.abs(b)}`].join(" ");
}

function handDerive(state: LFState, slopeBias = 0): LFViews {
  const c = state.canonical;
  const m = ratToNumber(c.m) + slopeBias;
  const b = ratToNumber(c.b);
  const win = c.window;
  const anchorX = ratToNumber(c.anchorX);
  const run = ratToNumber(c.run);
  const anchorY = stepTo(m, b, anchorX);
  const rise = stepTo(m, 0, run);
  const start = ratToNumber(c.domain.start);
  const step = ratToNumber(c.domain.step);

  const table: string[] = [];
  for (let i = 0; i < c.domain.count; i += 1) {
    const x = start + i * step;
    table.push(`${x},${stepTo(m, b, x)}`);
  }
  const lattice: string[] = [];
  for (let x = win.xMin; x <= win.xMax; x += 1) {
    const y = stepTo(m, b, x);
    if (Number.isInteger(y) && y >= win.yMin && y <= win.yMax) lattice.push(`${x},${y}`);
  }
  return {
    equationText: `y = ${m}x + ${b}`,
    display: readingForm(m, b),
    slopeText: `${m}`,
    interceptText: `${b}`,
    segment: [`${win.xMin},${stepTo(m, b, win.xMin)}`, `${win.xMax},${stepTo(m, b, win.xMax)}`],
    triangle: {
      run: `${run}`,
      rise: `${rise}`,
      anchor: `${anchorX},${anchorY}`,
      tip: `${anchorX + run},${anchorY + rise}`,
    },
    table,
    lattice,
  };
}

/* ── the checks ───────────────────────────────────────────────────────────────────────────────── */

describe("lineFamily · MMIP harness bridge", () => {
  it("the independent derive really does bite", () => {
    // A hand transcription that always agrees is worth nothing. Nudge its slope by one and every
    // check below must be able to tell — proof that agreement elsewhere is a result, not a
    // tautology. (2x + 1 vs 3x + 1 differ in the table, the segment, the triangle and the text.)
    const state = model.applyEdit(model.applyEdit(model.init(), "equation:slope", 2), "equation:intercept", 1);
    expect(handDerive(state)).toEqual(model.derive(state));
    const mutated = handDerive(state, 1);
    expect(mutated).not.toEqual(model.derive(state));
    expect(mutated.table).not.toEqual(model.derive(state).table);
    expect(mutated.segment).not.toEqual(model.derive(state).segment);
    expect(mutated.triangle.rise).not.toEqual(model.derive(state).triangle.rise);
  });

  it("round-trips one edit from every origin", () => {
    const cases: EditStep[] = [
      { origin: "graph:intercept", edit: 3 },
      { origin: "graph:unit", edit: 2 },
      { origin: "equation:slope", edit: -3 },
      { origin: "equation:intercept", edit: -5 },
    ];
    const result = roundTripCheck(model, cases, (s) => handDerive(s));
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.casesRun).toBe(4);
  });

  it("never goes stale across a 120-edit seeded walk over all four origins", () => {
    const result = staleStateCheck(model, (s) => handDerive(s), {
      seed: 20_802,
      steps: 120,
      randomEdit: (_state, _origin, rand) => Math.round(rand() * 16) - 8, // reaches beyond both ranges
    });
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stepsRun).toBe(120);
  });

  it("gives identical views to two different routes to the same line", () => {
    // y = 2x + 1 built symbolically, and the same line built by dragging: the unit handle to
    // (1, 3) tilts about b = 1, so the slope becomes 3 − 1 = 2.
    const symbolic: EditStep[] = [
      { origin: "equation:slope", edit: 2 },
      { origin: "equation:intercept", edit: 1 },
    ];
    const physical: EditStep[] = [
      { origin: "graph:intercept", edit: 1 },
      { origin: "graph:unit", edit: 3 },
    ];
    const result = equivalenceCheck(model, symbolic, physical);
    expect(result.ok).toBe(true);
    expect(result.viewsA.equationText).toBe("y = 2x + 1");
    // The states are equal too, not merely the views — same canonical, same stack depth.
    expect(result.stateA.canonical).toEqual(result.stateB.canonical);
  });

  it("undoes exactly, one whole canonical state at a time", () => {
    const sequence: EditStep[] = [
      { origin: "equation:slope", edit: 3 },
      { origin: "graph:intercept", edit: -2 },
      { origin: "equation:intercept", edit: 4 },
      { origin: "graph:unit", edit: 0 },
    ];
    const result = undoCheck(model, undo, sequence);
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("clamps and snaps exactly as the authored slider range does, and says so", () => {
    const g = graphFor(model.init());
    // 2.4 on the unit handle is 2 after snapping; 9 is 4 after clamping to the slider's top.
    const snapped = g.apply("graph", { kind: "dragPoint", handle: "unit", x: ONE, y: rat(12, 5) });
    expect(snapped.status).toBe("applied");
    expect(snapped.origin.clamp?.code).toBe("slope-snapped");
    expect(g.view("equation").slopeText).toBe("2");
    const clamped = g.apply("equation", { kind: "setSlope", m: rat(9) });
    expect(clamped.origin.clamp?.code).toBe("slope-clamped");
    expect(g.view("equation").slopeText).toBe("4");
    // The clamp is a real state, not a display trick: the hand route agrees with it.
    expect(handDerive(serialize(g))).toEqual(model.derive(serialize(g)));
  });

  it("keeps invariant 2 and the rejection contract on every transaction", () => {
    // One sequential log covering all three shapes: a real change, a no-op (the value already
    // there), and a refusal. `transactionCheck` asserts before/origin/ops/changed/rejection for
    // each, which is the half of `docs/MMIP_V1_API.md` §2 no harness could see before S209.
    const result = transactionCheck(
      { origins: model.origins, init: () => model.init(), applyTransaction: model.applyTransaction },
      [
        { origin: "equation:slope", edit: 2 },
        { origin: "equation:slope", edit: 2 }, // no-op: nothing changed, so nothing to describe
        { origin: "graph:intercept", edit: -3 },
        { origin: "graph:pivot-at-zero", edit: 5 }, // refused, with a reason
        { origin: "equation:intercept", edit: -3 }, // no-op again, reached by a different origin
        { origin: "graph:unit", edit: 1 },
      ]
    );
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.casesRun).toBe(6);
  });

  it("refuses the pivot at x = 0 with a mathematical reason, and changes nothing", () => {
    const before = model.applyEdit(model.init(), "equation:slope", 3);
    const tx = model.applyTransaction!(before, "graph:pivot-at-zero", 5);
    expect(tx.rejected).toBe(true);
    expect(tx.ops).toEqual([]);
    expect(tx.after).toEqual(before);
    expect(tx.rejection?.code).toBe("pivot-at-intercept");
    expect(tx.rejection?.message).toMatch(/IS the y-intercept/);
    // The independent route still describes the untouched state.
    expect(handDerive(before)).toEqual(model.derive(before));
  });

  it("describes a changed transaction with ops a motion layer can stage", () => {
    const before = model.init();
    const tx = model.applyTransaction!(before, "equation:slope", 3);
    expect(tx.changed).toBe(true);
    // Independently: 0 → 3 is an increase of 3 on the slope, and it must carry a holder.
    expect(tx.ops).toHaveLength(1);
    expect(tx.ops[0]).toMatchObject({ sides: ["line"] });
    expect(describeLineChange(before.canonical, (tx.after as LFState).canonical)).toEqual(tx.ops);
  });

  it("serializes and restores the whole graph, undo stack included", () => {
    let state = model.init();
    for (const step of [1, 2, 3]) state = model.applyEdit(state, "equation:slope", step);
    expect(state.history).toHaveLength(3);
    // A fresh graph seeded from the serialization steps back through the same positions.
    const restored = graphFor(state);
    expect(restored.canUndo()).toBe(true);
    restored.undo();
    expect(restored.view("equation").slopeText).toBe("2");
    restored.undo();
    expect(restored.view("equation").slopeText).toBe("1");
    restored.undo();
    expect(restored.view("equation").slopeText).toBe("0");
    expect(restored.canUndo()).toBe(false);
  });
});

/* ── the unchanged-ops blind spot, hunted directly (S213) ─────────── */

describe("changed, ops and the canonical state can never disagree", () => {
  /**
   * `transactionCheck` proves the contract over a scripted log. This proves the thing the script
   * cannot: that `changed` is the TRUTH about the state rather than a restatement of `ops.length`.
   *
   * Both models compute `changed: ops.length > 0`, so `changed ⟺ ops.length > 0` is a tautology
   * and worth nothing on its own. The load-bearing clause is the third one — `changed` must equal
   * "the canonical state actually moved". An edit that mutates a field no `describe*` function
   * knows about would report `changed: false` while `after` differs from `before`, and a motion
   * layer would then have nothing to play for a move that really happened. That is the failure O1
   * hit in solveBalance; this is the same net, cast over the line family and the pair.
   */
  const probe = <S,>(
    label: string,
    apply: (state: S, edit: unknown) => { before: S; after: S; ops: readonly unknown[]; changed: boolean; rejected: boolean },
    init: S,
    edits: readonly unknown[]
  ) => {
    let state = init;
    let applied = 0;
    let unchanged = 0;
    let refused = 0;
    for (const edit of edits) {
      const tx = apply(state, edit);
      const moved = stableKey(tx.after) !== stableKey(tx.before);
      expect([label, edit, "changed-vs-state", tx.changed]).toEqual([label, edit, "changed-vs-state", moved]);
      expect([label, edit, "changed-vs-ops", tx.changed]).toEqual([label, edit, "changed-vs-ops", tx.ops.length > 0]);
      if (tx.rejected) {
        refused += 1;
        expect([label, edit, tx.ops]).toEqual([label, edit, []]);
        expect(stableKey(tx.after)).toBe(stableKey(tx.before));
      } else if (tx.changed) applied += 1;
      else unchanged += 1;
      state = tx.after;
    }
    return { applied, unchanged, refused };
  };

  it("holds across every line edit, including the ones that move nothing", () => {
    const model = lineFamilyCanonicalModel({ m: rat(1), b: rat(0), domain: { start: ZERO, step: ONE, count: 3 } });
    const counts = probe(
      "line",
      (state: LineCanonical, edit) => model.apply(state, edit as never, "symbolic", "probe"),
      model.initial,
      [
        { kind: "setSlope", m: rat(3) },
        { kind: "setSlope", m: rat(3) }, // no-op
        { kind: "setIntercept", b: rat(-2) },
        // "reset at start": every field set to what it already holds.
        { kind: "setDomain", start: ZERO, step: ONE, count: 3 },
        { kind: "setAnchorX", x: ZERO }, // already 0
        { kind: "setRun", run: ONE }, // already 1
        { kind: "setRun", run: rat(4) },
        { kind: "setRunRise", run: rat(0), rise: rat(1) }, // refused: vertical
        { kind: "setOutputCell", row: 9, y: rat(1) }, // refused: no such row
        { kind: "setDomain", step: rat(2) },
        { kind: "setInputCell", row: 1, x: rat(5) },
        { kind: "setRows", rows: [{ x: rat(0), y: rat(0) }, { x: rat(1), y: rat(2) }, { x: rat(2), y: rat(5) }] }, // refused
      ]
    );
    expect(counts.applied).toBeGreaterThan(4);
    expect(counts.unchanged).toBeGreaterThan(2);
    expect(counts.refused).toBe(3);
  });

  it("holds across every pair edit too", () => {
    const model = linePairCanonicalModel({ a: { m: rat(3), b: rat(2) }, b: { m: rat(1), b: rat(6) } });
    const counts = probe(
      "pair",
      (state: LinePairCanonical, edit) => model.apply(state, edit as never, "symbolic", "probe"),
      model.initial,
      [
        { kind: "line", line: "a", edit: { kind: "setSlope", m: rat(5) } },
        { kind: "line", line: "a", edit: { kind: "setSlope", m: rat(5) } }, // no-op
        { kind: "setIntersection", x: rat(1), y: rat(4) },
        { kind: "matchSlope", from: "a" }, // makes them parallel or coincident
        { kind: "setIntersection", x: rat(0), y: rat(0) }, // refused: no crossing now
        { kind: "matchSlope", from: "a" }, // no-op: already equal
        { kind: "line", line: "b", edit: { kind: "setIntercept", b: rat(9) } },
      ]
    );
    expect(counts.applied).toBeGreaterThan(2);
    expect(counts.unchanged).toBeGreaterThanOrEqual(2);
    expect(counts.refused).toBe(1);
  });
});
