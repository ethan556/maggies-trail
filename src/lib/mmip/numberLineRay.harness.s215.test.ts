// @vitest-environment jsdom
//
// THE BRIDGE — numberLineRay's engine presented to the generic harness (`mmipHarness.ts`).
//
// `mmipHarness` asks for an `MmipModel<TState, TViews>` with `init/applyEdit/derive` and knows
// nothing about `repSyncGraph`, `AbsorbOutcome` or exact rationals. This file is the thin adapter
// between the two, and then runs every check the harness offers against it — the four pure ones,
// the transaction contract, and the four jsdom ones against the REAL widget.
//
// TWO THINGS THE ADAPTER ADDS, both faithful to the shipped engine rather than convenient:
//
//   · `applyEdit` must be PURE — the harness branches and replays from any prior state — while a
//     `RepSyncGraph` is a live, mutating object. So `TState` is the graph's SERIALIZATION (its
//     canonical state plus its undo stack), and every step builds a graph, drives it, and
//     serializes it back. Undo is therefore still `repSyncGraph.undo()`: there is no second undo
//     implementation anywhere in this file.
//   · `TViews` bundles the written relation, the solved form, the interval, the drawn endpoint and
//     the membership of every integer on the line AT ONCE, because the whole point of these checks
//     is that those cannot secretly disagree with each other.
//
// INDEPENDENCE: `handDerive` is a second, complete transcription of the same mathematics from its
// definition. It never touches `Rat`, never calls `deriveSolution`, `deriveRelationView`,
// `deriveLine`, `deriveMembership` or `raySatisfies`: it reduces `constant/coeff` with its own gcd,
// decides which way the ray points from the SIGN of the coefficient, assembles every string from
// its own tables, and decides membership by cross multiplication on the raw integers. Its own
// sharpness is checked (`the independent derive really does bite`) by mutating it and asserting it
// then disagrees, so a silently-agreeing tautology cannot masquerade as a passing check.

import { createElement, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  answerLeakCheck,
  equivalenceCheck,
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
  type TransactionLike
} from "./mmipHarness";
import {
  createNumberLineRayGraph,
  describeRayChange,
  deriveLine,
  deriveMembership,
  deriveRelationView,
  deriveSolution,
  makeRayCanonical,
  type NumberLineRayGraph,
  type RayCanonical,
  type RayLineEdit,
  type RayRelationEdit
} from "./numberLineRayModel";
import { rat, type Rat } from "./lineFamilyModel";
import { toSyncTransaction } from "./repSyncGraph";
import { NumberLineRayW } from "@/components/widgets/numberLineRay";
import { NumberLineRaySpec, type TNumberLineRay } from "@/lib/schema";

afterEach(cleanup);

/* ── the authored instance this file stands in for ────────────────────────────────────────────── */

/** `−2x ≥ −6` on a −6..6 integer line, with the two both-sides moves that make reversal reachable.
 * The learner's task is to reach the set `x > −1`, which the start does NOT already show. */
const SPEC: TNumberLineRay = NumberLineRaySpec.parse({
  type: "numberLineRay",
  prompt: "Make the line show every number strictly above the one the words name.",
  variable: "x",
  start: { coeff: { n: -2, d: 1 }, constant: { n: -6, d: 1 }, relation: "gt", inclusive: true },
  window: { min: { n: -6, d: 1 }, max: { n: 6, d: 1 }, tickStep: { n: 1, d: 1 } },
  step: { n: 1, d: 1 },
  outOfRange: "clamp",
  offLattice: "snap",
  transforms: [
    { id: "neg", factor: { n: -1, d: 1 }, label: "× (−1) both sides" },
    { id: "half", factor: { n: 1, d: 2 }, label: "÷ 2 both sides" }
  ],
  target: { coeff: { n: 1, d: 1 }, constant: { n: -1, d: 1 }, relation: "gt", inclusive: false }
});

const START: RayCanonical = makeRayCanonical({
  coeff: rat(-2),
  constant: rat(-6),
  relation: "gt",
  inclusive: true,
  variable: "x",
  window: { min: rat(-6), max: rat(6), tickStep: rat(1) },
  policy: { step: rat(1), outOfRange: "clamp", offLattice: "snap" }
});

/* ── the state the adapter carries: the graph, serialized ─────────────────────────────────────── */

type NLRState = { readonly canonical: RayCanonical; readonly history: readonly RayCanonical[] };

const graphFor = (state: NLRState): NumberLineRayGraph =>
  createNumberLineRayGraph(state.canonical, { history: state.history });

const serialize = (g: NumberLineRayGraph): NLRState => ({ canonical: g.getCanonical(), history: g.snapshots() });

/** The seven ways into this instance, named by (representation, gesture). */
const ORIGINS = [
  "line:drag",
  "line:dot",
  "line:arrow",
  "relation:constant",
  "relation:symbol",
  "relation:scale",
  // Multiplying both sides by zero. ALWAYS refused — which is what makes the rejection contract
  // checkable here rather than hypothetical.
  "relation:scale-zero"
] as const;
type NLROrigin = (typeof ORIGINS)[number];

type Routed =
  | { rep: "line"; edit: RayLineEdit }
  | { rep: "relation"; edit: RayRelationEdit };

/** An origin's payload is the number the learner produced there. The model decides what it MEANS. */
function editFor(origin: NLROrigin, value: number): Routed {
  switch (origin) {
    case "line:drag":
      return { rep: "line", edit: { kind: "setBoundary", value: rat(value) } };
    case "line:dot":
      return { rep: "line", edit: { kind: "setInclusive", inclusive: value >= 0 } };
    case "line:arrow":
      return { rep: "line", edit: { kind: "setRayDirection", direction: value >= 0 ? "greater" : "less" } };
    case "relation:constant":
      return { rep: "relation", edit: { kind: "setConstant", value: rat(value) } };
    case "relation:symbol":
      return { rep: "relation", edit: { kind: "setRelationSymbol", relation: value >= 0 ? "gt" : "lt" } };
    case "relation:scale":
      return { rep: "relation", edit: { kind: "scaleBothSides", factor: scaleFactor(value) } };
    case "relation:scale-zero":
      return { rep: "relation", edit: { kind: "scaleBothSides", factor: rat(0) } };
  }
}

const SCALES: Rat[] = [rat(-1), rat(-2), rat(-1, 2), rat(2), rat(1, 2)];
const scaleFactor = (value: number): Rat => SCALES[Math.abs(Math.round(value)) % SCALES.length];

/* ── the views both routes must agree on ──────────────────────────────────────────────────────── */

type NLRViews = {
  readonly relationText: string;
  readonly solvedText: string;
  readonly interval: string;
  readonly sentence: string;
  readonly boundaryText: string;
  readonly endpointLabel: string;
  readonly direction: "less" | "greater";
  readonly filled: boolean;
  /** Every integer on the drawn line, and whether it is a solution. */
  readonly membership: readonly (readonly [string, boolean])[];
};

const INTEGERS = Array.from({ length: 13 }, (_, i) => i - 6);

/** THE MODEL'S OWN ROUTE — everything from the shipped derivations, bundled so they cannot
 * secretly disagree with each other. */
function derive(state: NLRState): NLRViews {
  const c = state.canonical;
  const solution = deriveSolution(c);
  const relation = deriveRelationView(c);
  const line = deriveLine(c);
  const membership = deriveMembership(c);
  return {
    relationText: relation.text,
    solvedText: solution.text,
    interval: solution.interval,
    sentence: solution.sentence,
    boundaryText: line.boundaryText,
    endpointLabel: line.endpointLabel,
    direction: line.direction,
    filled: line.filled,
    membership: INTEGERS.map((k) => {
      const sample = membership.samples.find((s) => s.value.d === 1 && s.value.n === k);
      return [String(k), sample ? sample.satisfies : false] as const;
    })
  };
}

/* ── the independent transcription ────────────────────────────────────────────────────────────── */

type Frac = { n: number; d: number };

const hcf = (a: number, b: number): number => (b === 0 ? Math.abs(a) : hcf(b, a % b));
function reduceFrac(n: number, d: number): Frac {
  const sign = d < 0 ? -1 : 1;
  const k = hcf(Math.abs(n), Math.abs(d)) || 1;
  return { n: (sign * n) / k, d: (sign * d) / k };
}
const fracText = (f: Frac): string => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`).replace("-", "−");

/** Independent membership: cross multiplication on the raw integers. */
function handSatisfies(c: RayCanonical, k: number, mutate = false): boolean {
  const leftN = c.coeff.n * k;
  const leftD = c.coeff.d;
  const cmp = leftN * c.constant.d - c.constant.n * leftD;
  const gt = mutate ? c.relation === "lt" : c.relation === "gt";
  if (gt) return c.inclusive ? cmp >= 0 : cmp > 0;
  return c.inclusive ? cmp <= 0 : cmp < 0;
}

function handDerive(state: NLRState, mutate = false): NLRViews {
  const c = state.canonical;
  const boundary = reduceFrac(c.constant.n * c.coeff.d, c.constant.d * c.coeff.n);
  const written = c.relation === "gt" ? (c.inclusive ? "≥" : ">") : c.inclusive ? "≤" : "<";
  // The ray runs the way the WRITTEN symbol says, unless the coefficient is negative.
  const pointsUp = c.coeff.n < 0 ? c.relation === "lt" : c.relation === "gt";
  const solvedSymbol = pointsUp ? (c.inclusive ? "≥" : ">") : c.inclusive ? "≤" : "<";
  const left =
    c.coeff.n === 1 && c.coeff.d === 1
      ? "x"
      : c.coeff.n === -1 && c.coeff.d === 1
        ? "−x"
        : c.coeff.d === 1
          ? `${fracText(c.coeff)}x`
          : `(${fracText(c.coeff)})x`;
  const b = fracText(boundary);
  const comparison = pointsUp ? "greater than" : "less than";
  return {
    relationText: `${left} ${written} ${fracText(c.constant)}`,
    solvedText: `x ${solvedSymbol} ${b}`,
    interval: pointsUp ? `${c.inclusive ? "[" : "("}${b}, ∞)` : `(−∞, ${b}${c.inclusive ? "]" : ")"}`,
    sentence: `all values ${c.inclusive ? `${comparison} or equal to` : comparison} ${b}, ${b} ${
      c.inclusive ? "included" : "not included"
    }`,
    boundaryText: b,
    endpointLabel: `${b} ${c.inclusive ? "included" : "not included"}`,
    direction: pointsUp ? "greater" : "less",
    filled: c.inclusive,
    membership: INTEGERS.map((k) => [String(k), handSatisfies(c, k, mutate)] as const)
  };
}

/* ── the adapter ──────────────────────────────────────────────────────────────────────────────── */

const model: MmipModel<NLRState, NLRViews> = {
  origins: ORIGINS as unknown as readonly Origin[],
  init: () => ({ canonical: START, history: [] }),
  applyEdit(state, origin, edit) {
    const g = graphFor(state);
    const routed = editFor(origin as NLROrigin, typeof edit === "number" ? edit : 0);
    if (routed.rep === "line") g.apply("line", routed.edit);
    else g.apply("relation", routed.edit);
    return serialize(g);
  },
  derive,
  applyTransaction(state, origin, edit): TransactionLike<NLRState> {
    const g = graphFor(state);
    const before = serialize(g);
    const beforeCanonical = g.getCanonical();
    const routed = editFor(origin as NLROrigin, typeof edit === "number" ? edit : 0);
    const result = routed.rep === "line" ? g.apply("line", routed.edit) : g.apply("relation", routed.edit);
    const afterCanonical = g.getCanonical();
    const tx = toSyncTransaction(beforeCanonical, result, "control", describeRayChange(beforeCanonical, afterCanonical));
    return {
      before,
      after: tx.rejected ? before : serialize(g),
      // The harness's `origin` is the NAMED INPUT CHANNEL, which is finer than MMIP's four
      // edit-origin kinds; it is what makes an origin-shaped divergence visible.
      origin,
      ops: tx.ops,
      changed: tx.changed,
      rejected: tx.rejected,
      ...(tx.rejection ? { rejection: tx.rejection } : {})
    };
  }
};

const undo = (state: NLRState): NLRState => {
  const g = graphFor(state);
  g.undo();
  return serialize(g);
};

/* ═══════════════════════════ 1–4: the pure checks ═══════════════════════════ */

describe("roundTripCheck — one edit from every origin, against a second transcription", () => {
  it("every origin's edit derives identically by both routes", () => {
    const cases: EditStep[] = [
      { origin: "line:drag", edit: -1 },
      { origin: "line:drag", edit: 4 },
      { origin: "line:dot", edit: -1 },
      { origin: "line:arrow", edit: 1 },
      { origin: "line:arrow", edit: -1 },
      { origin: "relation:constant", edit: 8 },
      { origin: "relation:symbol", edit: -1 },
      { origin: "relation:scale", edit: 0 },
      { origin: "relation:scale", edit: 1 },
      { origin: "relation:scale", edit: 2 },
      { origin: "relation:scale-zero", edit: 0 }
    ];
    const r = roundTripCheck(model, cases, (s) => handDerive(s));
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(cases.length);
  });

  it("the independent derive really does bite", () => {
    const state = model.applyEdit(model.init(), "relation:scale", 0);
    expect(handDerive(state)).toEqual(derive(state));
    expect(handDerive(state, true)).not.toEqual(derive(state));
  });
});

describe("staleStateCheck — a long seeded walk, re-derived after every single step", () => {
  it("nothing goes stale over 140 edits rotating through all seven origins", () => {
    const r = staleStateCheck(model, (s) => handDerive(s), {
      seed: 215,
      steps: 140,
      randomEdit: (state, origin, rand) => {
        if (origin === "relation:scale") {
          // Keep the walk inside the exact-integer range by choosing a shrinking factor whenever
          // the coefficient has already grown, and a growing one when it has already shrunk.
          const c = (state as NLRState).canonical.coeff;
          if (Math.abs(c.n) >= 32) return 2; // rat(-1/2)
          if (c.d >= 32) return 3; // rat(2)
          return Math.floor(rand() * SCALES.length);
        }
        if (origin === "relation:scale-zero") return 0;
        return Math.round(rand() * 12) - 6;
      }
    });
    expect(r.failures).toEqual([]);
    expect(r.stepsRun).toBe(140);
  });
});

describe("equivalenceCheck — representation is not path-dependent", () => {
  it("dragging the endpoint and typing the right-hand side reach the same views", () => {
    // START is −2x ≥ −6, so a boundary of −1 is the right-hand side −2 × (−1) = 2.
    const r = equivalenceCheck(model, [{ origin: "line:drag", edit: -1 }], [{ origin: "relation:constant", edit: 2 }]);
    expect(r.ok).toBe(true);
    expect(r.viewsA.solvedText).toBe("x ≤ −1");
  });

  it("turning the drawn ray and turning the written symbol reach the same views", () => {
    const r = equivalenceCheck(model, [{ origin: "line:arrow", edit: 1 }], [{ origin: "relation:symbol", edit: -1 }]);
    expect(r.ok).toBe(true);
    expect(r.viewsA.solvedText).toBe("x ≥ 3");
  });

  it("scaling both sides and then turning the sign round is the same CLAIM as doing nothing", () => {
    // …but NOT the same written relation, which is exactly the distinction this engine teaches.
    const scaledThenFlipped = [
      { origin: "relation:scale", edit: 0 }, // × (−1)
      { origin: "relation:symbol", edit: -1 } // → lt
    ];
    const r = equivalenceCheck(model, scaledThenFlipped, []);
    expect(r.viewsA.solvedText).toBe(r.viewsB.solvedText);
    expect(r.viewsA.membership).toEqual(r.viewsB.membership);
    expect(r.viewsA.relationText).not.toBe(r.viewsB.relationText);
    expect(r.ok).toBe(false); // the whole bundle differs, because the WRITING differs
  });
});

describe("undoCheck — the graph restores the exact state, every step back", () => {
  it("walks a five-edit sequence backwards to the position it started from", () => {
    const r = undoCheck(model, undo, [
      { origin: "line:drag", edit: -1 },
      { origin: "line:dot", edit: -1 },
      { origin: "relation:scale", edit: 0 },
      // −1 selects "lt". `1` would re-select the symbol already standing, which is a legal but
      // UNCHANGED edit — it pushes nothing onto the undo stack, so a step back would jump two.
      { origin: "relation:symbol", edit: -1 },
      { origin: "relation:constant", edit: 4 }
    ]);
    expect(r.failures).toEqual([]);
  });
});

/* ═══════════════════════════ 4b: the transaction contract ═══════════════════════════ */

describe("transactionCheck — invariant 2 and the rejection contract", () => {
  it("a log mixing applied, no-op and refused edits obeys every clause", () => {
    const cases: EditStep[] = [
      { origin: "line:drag", edit: -1 },
      { origin: "line:drag", edit: -1 }, // the same value again: accepted, unchanged, no ops
      { origin: "relation:scale-zero", edit: 0 }, // refused
      { origin: "line:dot", edit: -1 },
      { origin: "relation:scale", edit: 0 },
      { origin: "relation:symbol", edit: -1 },
      { origin: "relation:scale-zero", edit: 0 },
      { origin: "line:arrow", edit: 1 },
      { origin: "relation:constant", edit: 6 }
    ];
    const r = transactionCheck(model, cases);
    expect(r.failures).toEqual([]);
    expect(r.casesRun).toBe(cases.length);
  });

  it("the refusal is mathematical, and the no-op really is a no-op", () => {
    const start = model.init();
    const refused = model.applyTransaction!(start, "relation:scale-zero", 0);
    expect(refused.rejected).toBe(true);
    expect(refused.ops).toEqual([]);
    expect(refused.rejection?.code).toBe("scale-by-zero");
    expect(refused.rejection?.message).toContain("says nothing about x");
    expect(refused.after).toEqual(refused.before);

    const noop = model.applyTransaction!(start, "line:drag", 3);
    expect(noop.rejected).toBe(false);
    expect(noop.changed).toBe(false);
    expect(noop.ops).toEqual([]);

    const real = model.applyTransaction!(start, "line:drag", -1);
    expect(real.changed).toBe(true);
    expect(real.ops.length).toBeGreaterThan(0);
    for (const op of real.ops) expect(op.sides.length).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════ 5–7: the jsdom checks, on the real widget ═══════════════════════════ */

function mountWidget(spec: TNumberLineRay = SPEC, tone?: "info"): HTMLElement {
  const Host = () => {
    const [v, setV] = useState<unknown>(undefined);
    return createElement(NumberLineRayW, { spec, value: v, onChange: setV, disabled: false, tone });
  };
  const { container } = render(createElement(Host));
  return container;
}

describe("keyboardParityCheck — every pointer affordance has a keyboard route", () => {
  it("the endpoint, the ray, the symbol, the field, the steppers and the transforms", () => {
    const container = mountWidget();
    const r = keyboardParityCheck(container, {
      pointerSelectors: {
        objectHandles: '[data-testid="nlr-endpoint"], [data-testid="nlr-direction"]',
        symbolic: '[data-testid="nlr-symbol"], [data-testid="nlr-inclusive"], [data-testid="nlr-constant"]',
        precision:
          '[data-testid="nlr-boundary-down"], [data-testid="nlr-boundary-up"], [data-testid="nlr-boundary-range"]',
        transforms: '[data-testid^="nlr-transform-"]',
        probes: 'button[data-testid^="nlr-probe-"]'
      }
    });
    expect(r.failures).toEqual([]);
    // 2 handles + 3 symbolic + 3 precision + 2 transforms + 3 probe controls, counted from the
    // spec by hand (the spec offers exactly two transforms).
    expect(r.checked).toBe(2 + 3 + 3 + 2 + 3);
  });
});

describe("srStateCheck — the mathematics reaches a screen reader, not just the screen", () => {
  it("says what the set IS, what the endpoint means, and what the last move did", () => {
    const container = mountWidget();
    fireEvent.click(screen.getByTestId("nlr-transform-neg")); // × (−1): 2x ≥ 6, drawn as x ≥ 3
    // Everything below is assembled from the arithmetic, not copied from the component:
    // −2 × (−1) = 2 and −6 × (−1) = 6, so the relation reads 2x ≥ 6; the boundary 6 ÷ 2 = 3 does
    // not move, and with a positive coefficient the ray now runs upward.
    const r = srStateCheck(container, {
      expectedSubstrings: [
        "all values greater than or equal to 3, 3 included",
        "3 is a solution.",
        "The ray runs toward larger numbers",
        "The relation symbol is ≥. Press Enter to turn it round: 2x ≥ 6 would become 2x ≤ 6.",
        "the number 2x is compared with, currently 6",
        "The solution set moved from x ≤ 3 to x ≥ 3."
      ]
    });
    expect(r.missing).toEqual([]);
  });

  it("the check is not vacuous: it does not find a claim about a state the widget is not in", () => {
    const container = mountWidget();
    const r = srStateCheck(container, { expectedSubstrings: ["all values greater than 3, 3 not included"] });
    expect(r.missing).toEqual(["all values greater than 3, 3 not included"]);
  });
});

describe("answerLeakCheck — nothing on the page knows the target yet", () => {
  it("no text, label or attribute carries x > −1 before the reveal", () => {
    const container = mountWidget();
    const r = answerLeakCheck(container, ["x > −1", "(−1, ∞)", "the target set is", "data-answer"]);
    expect(r.leaked).toEqual([]);
  });

  it("the check is not vacuous: it does find the reveal ghost when it is shown", () => {
    const container = mountWidget(SPEC, "info");
    expect(answerLeakCheck(container, ["x > −1"]).leaked).toEqual(["x > −1"]);
  });
});

describe("reducedMotionCheck — the move is legible with every animation switched off", () => {
  it("the ray turns, nothing travels, and the words carry the whole transformation", () => {
    reducedMotionCheck({
      render: () => {
        const container = mountWidget();
        fireEvent.click(screen.getByTestId("nlr-transform-neg"));
        return container;
      },
      assertMeaningful: (container) => {
        // the state change itself is complete without any motion
        expect(container.querySelector('[data-testid="nlr-solution"]')?.textContent).toContain("x ≥ 3");
        expect(container.querySelector('[data-testid="nlr-coeff"]')?.textContent).toContain("2x");
        expect(container.querySelector('[data-testid="nlr-endpoint-label"]')?.textContent).toBe("3 included");
        // and nothing was staged to travel
        expect(container.querySelectorAll("[data-morph-ms]")).toHaveLength(0);
        // the reduced plan's own words, including its net delta, reached the live region
        const status = container.querySelector('[data-testid="nlr-status"]')?.textContent ?? "";
        expect(status).toContain("Multiply both sides by a negative number");
        expect(status).toContain("The solution set moved from x ≤ 3 to x ≥ 3.");
        expect(status).toContain("State delta:");
      }
    });
  });
});
