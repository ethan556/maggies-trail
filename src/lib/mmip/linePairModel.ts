/**
 * linePairModel — two lines as ONE canonical object (S210, MMIP wave 2).
 *
 * THE DECISION (retires the two-line open question in `docs/RSG_DESIGN.md`).
 *
 * Two candidates were on the table: a `LinePairCanonical` of its own, or a "relation node" reading
 * two independent line graphs. The second is not implementable inside the RSG contract, and the
 * reason is structural rather than aesthetic: a node's `derive` takes THE canonical state. A node
 * that reads two of them breaks the star topology outright — propagation is no longer depth-1,
 * "commit always re-derives every view from the canonical" stops being expressible at all, and
 * undo would have to span two stacks with no defined interleaving. It also fails the first rule
 * the architecture is built on, because "which pair of graphs are we relating?" would be a fact
 * living outside any canonical state.
 *
 * So a pair is its own canonical object. Line A and line B are genuinely independent facts —
 * neither is derivable from the other — and everything ABOUT the pair is derived: the crossing,
 * the classification, the solution set. That is the same shape the `TriangleCanonical` decision
 * took, and it earns the same property: `deriveRelation` is TOTAL, with the two degenerate cases
 * as NAMED branches rather than holes.
 *
 * THE THREE VERDICTS ARE ALL REACHABLE STATES, NEVER REJECTIONS. `unique`, `parallel` and
 * `coincident` are branches of one derivation, reached by ordinary line edits. Setting the two
 * slopes equal is a legal move that destroys the solution, and being able to DO that is the point:
 * a learner who breaks a unique solution and watches the crossing leave has learned what the
 * crossing was. The single rejection in this module is dragging a crossing that does not exist.
 *
 * NO ABSORB LOGIC IS DUPLICATED. A line edit is delegated verbatim to `absorbLineEdit`, so every
 * policy, clamp, snap and rejection the single-line model already proves continues to hold, and
 * `describeLinePairChange` retargets `describeLineChange`'s own operations rather than restating
 * them. This file adds exactly two things the single-line model cannot express: the crossing, and
 * the moves that are only meaningful between two lines.
 *
 * ON THE SHARED WINDOW. Each slot holds a complete `LineCanonical`, window included, and
 * construction and absorb keep the two windows equal. Storing the window once at pair level would
 * leave `c.a` an incomplete line that no single-line derivation could take, which would mean
 * reconstructing it on every derive — a worse trade than one normalized duplicate of a
 * presentation frame that carries no mathematics. `linePairWindowsAgree` states the invariant and
 * the suite asserts it after every edit of a random walk.
 */

import {
  absorbLineEdit,
  deriveContext,
  deriveEquation,
  deriveGraph,
  deriveTable,
  deriveTriangle,
  describeLineChange,
  lineIdentityKey,
  makeLineCanonical,
  normalizeLineCanonical,
  ratAdd,
  ratDiv,
  ratEq,
  ratIsZero,
  ratMul,
  ratSub,
  ratText,
  type LineCanonical,
  type LineCanonicalInit,
  type LineEdit,
  type LineFamilyViews,
  type LineTarget,
  type Rat,
  type RatPoint
} from "./lineFamilyModel";
import { createRepSyncGraph, type AbsorbNote, type AbsorbOutcome, type RepSyncGraph } from "./repSyncGraph";
import { rejectTransaction } from "./mmipTypes";
import type {
  CanonicalModel,
  MmipOperation,
  RepresentationBinding,
  SyncTransaction
} from "./mmipTypes";

/* ------------------------------------------------------------------ *
 * canonical state                                                     *
 * ------------------------------------------------------------------ */

export type LineSlot = "a" | "b";

export type LinePairCanonical = {
  readonly a: LineCanonical;
  readonly b: LineCanonical;
  readonly labels: { readonly a: string; readonly b: string };
};

export type LinePairInit = {
  readonly a?: LineCanonicalInit;
  readonly b?: LineCanonicalInit;
  readonly labels?: { readonly a?: string; readonly b?: string };
};

/** Both slots draw on one frame; a pair whose halves disagree about the window is malformed. */
export const linePairWindowsAgree = (c: LinePairCanonical): boolean =>
  c.a.window.xMin === c.b.window.xMin &&
  c.a.window.xMax === c.b.window.xMax &&
  c.a.window.yMin === c.b.window.yMin &&
  c.a.window.yMax === c.b.window.yMax;

export function makeLinePairCanonical(init: LinePairInit = {}): LinePairCanonical {
  const a = makeLineCanonical(init.a ?? {});
  // A's frame is authoritative; B is rebuilt on it so the pair can never hold two windows.
  const b = makeLineCanonical({ ...(init.b ?? {}), window: a.window });
  return Object.freeze({
    a,
    b,
    labels: { a: init.labels?.a ?? "Line A", b: init.labels?.b ?? "Line B" }
  });
}

/* ------------------------------------------------------------------ *
 * edits                                                               *
 * ------------------------------------------------------------------ */

export type LinePairEdit =
  /** Delegated verbatim to the single-line model — every policy and rejection it proves applies. */
  | { readonly kind: "line"; readonly line: LineSlot; readonly edit: LineEdit }
  /**
   * Drag the crossing itself: hold both slopes, slide both lines so they meet at (x, y). The only
   * genuinely pair-level GESTURE, and the only rejection in this module — parallel lines have no
   * crossing to take hold of.
   */
  | { readonly kind: "setIntersection"; readonly x: Rat; readonly y: Rat }
  /**
   * "Make these parallel": copy one slope onto the other line. Expressible as a line edit only if
   * you already know the value, and knowing it requires the pair — which is what makes it a
   * pair-level move. It lands on `parallel` or `coincident`, both legal, neither refused.
   */
  | { readonly kind: "matchSlope"; readonly from: LineSlot };

/* ------------------------------------------------------------------ *
 * derivations                                                         *
 * ------------------------------------------------------------------ */

/** Where the two lines stand to each other. Total: every pair is exactly one of these. */
export type RelationView =
  | {
      readonly kind: "unique";
      readonly at: RatPoint;
      readonly text: string;
      readonly reason: string;
    }
  | {
      readonly kind: "parallel";
      /** The constant vertical gap b_B − b_A: never zero here, which is what keeps them apart. */
      readonly gap: Rat;
      readonly text: string;
      readonly reason: string;
    }
  | { readonly kind: "coincident"; readonly text: string; readonly reason: string };

/** The same fact said as a system's solution set — the form an algebra lesson grades. */
export type SolutionSetView = {
  readonly count: "one" | "none" | "infinitely many";
  readonly text: string;
  readonly point: RatPoint | null;
  readonly sentence: string;
};

export function deriveRelation(c: LinePairCanonical): RelationView {
  const dm = ratSub(c.a.m, c.b.m);
  if (!ratIsZero(dm)) {
    // Setting the outputs equal: m_a·x + b_a = m_b·x + b_b ⇒ x = (b_b − b_a)/(m_a − m_b).
    const x = ratDiv(ratSub(c.b.b, c.a.b), dm);
    const y = ratAdd(ratMul(c.a.m, x), c.a.b);
    return {
      kind: "unique",
      at: { x, y },
      text: `(${ratText(x)}, ${ratText(y)})`,
      reason: `the rates ${ratText(c.a.m)} and ${ratText(c.b.m)} differ, so the lines close on each other and meet exactly once`
    };
  }
  if (ratEq(c.a.b, c.b.b)) {
    return {
      kind: "coincident",
      text: "every point on the line",
      reason: `the same rate ${ratText(c.a.m)} and the same starting value ${ratText(c.a.b)} describe one line written twice`
    };
  }
  const gap = ratSub(c.b.b, c.a.b);
  return {
    kind: "parallel",
    gap,
    text: "no crossing",
    reason: `both climb at ${ratText(c.a.m)}, so they keep a constant gap of ${ratText(gap)} and never meet`
  };
}

export function deriveSolutionSet(c: LinePairCanonical): SolutionSetView {
  const relation = deriveRelation(c);
  if (relation.kind === "unique") {
    return {
      count: "one",
      text: relation.text,
      point: relation.at,
      sentence: `One pair of numbers satisfies both: x = ${ratText(relation.at.x)} and y = ${ratText(relation.at.y)}.`
    };
  }
  if (relation.kind === "coincident") {
    return {
      count: "infinitely many",
      text: "every point on the line",
      point: null,
      sentence: "Both relationships are the same line, so every point on it satisfies both."
    };
  }
  return {
    count: "none",
    text: "no solution",
    point: null,
    sentence: `No pair of numbers satisfies both: the lines stay ${ratText(relation.gap)} apart forever.`
  };
}

const lineViews = (line: LineCanonical): LineFamilyViews => ({
  equation: deriveEquation(line),
  graph: deriveGraph(line),
  table: deriveTable(line),
  triangle: deriveTriangle(line),
  context: deriveContext(line)
});

/* ------------------------------------------------------------------ *
 * absorb                                                              *
 * ------------------------------------------------------------------ */

const no = (code: string, reason: string): AbsorbOutcome<LinePairCanonical> => ({ ok: false, code, reason });

/** Replace one slot, keeping the pair's single frame. */
const withLine = (c: LinePairCanonical, slot: LineSlot, line: LineCanonical): LinePairCanonical =>
  slot === "a"
    ? { ...c, a: line, b: { ...c.b, window: line.window } }
    : { ...c, b: { ...line, window: c.a.window } };

export function absorbLinePairEdit(c: LinePairCanonical, edit: LinePairEdit): AbsorbOutcome<LinePairCanonical> {
  if (edit.kind === "line") {
    const outcome = absorbLineEdit(edit.line === "a" ? c.a : c.b, edit.edit);
    if (!outcome.ok) return outcome;
    const next = withLine(c, edit.line, outcome.canonical);
    return outcome.clamp ? { ok: true, canonical: next, clamp: outcome.clamp } : { ok: true, canonical: next };
  }

  if (edit.kind === "matchSlope") {
    const source = edit.from === "a" ? c.a : c.b;
    const targetSlot: LineSlot = edit.from === "a" ? "b" : "a";
    // Straight back through the single-line absorb, so the target's own policy still decides.
    return absorbLinePairEdit(c, { kind: "line", line: targetSlot, edit: { kind: "setSlope", m: source.m } });
  }

  // setIntersection — the one refusal in this module.
  const relation = deriveRelation(c);
  if (relation.kind !== "unique") {
    return no(
      relation.kind === "parallel" ? "no-crossing-parallel" : "no-crossing-coincident",
      relation.kind === "parallel"
        ? `these lines are parallel — ${relation.reason}, so there is no crossing to move`
        : `these lines are the same line — ${relation.reason}, so they cross everywhere and nowhere in particular`
    );
  }
  // Hold both rates and slide both lines onto the point: b = y − m·x for each.
  const notes: AbsorbNote[] = [];
  let next = c;
  for (const slot of ["a", "b"] as const) {
    const line = slot === "a" ? next.a : next.b;
    const outcome = absorbLineEdit(line, { kind: "setIntercept", b: ratSub(edit.y, ratMul(line.m, edit.x)) });
    if (!outcome.ok) return outcome;
    if (outcome.clamp) notes.push(outcome.clamp);
    next = withLine(next, slot, outcome.canonical);
  }
  if (notes.length === 0) return { ok: true, canonical: next };
  return {
    ok: true,
    canonical: next,
    clamp: {
      code: notes.map((n) => n.code).join("+"),
      reason: notes.map((n) => n.reason).join("; ")
    }
  };
}

/* ------------------------------------------------------------------ *
 * the graph                                                           *
 * ------------------------------------------------------------------ */

export const linePairReps = {
  model: { label: "canonical pair", derive: (c: LinePairCanonical): LinePairCanonical => c },
  lineA: {
    label: "line A",
    derive: (c: LinePairCanonical) => lineViews(c.a),
    absorb: (c: LinePairCanonical, edit: LineEdit) => absorbLinePairEdit(c, { kind: "line", line: "a", edit })
  },
  lineB: {
    label: "line B",
    derive: (c: LinePairCanonical) => lineViews(c.b),
    absorb: (c: LinePairCanonical, edit: LineEdit) => absorbLinePairEdit(c, { kind: "line", line: "b", edit })
  },
  relation: {
    label: "how the lines meet",
    derive: deriveRelation,
    // The crossing is a representation a learner can take hold of, so it is an origin too.
    absorb: (c: LinePairCanonical, edit: { kind: "setIntersection"; x: Rat; y: Rat } | { kind: "matchSlope"; from: LineSlot }) =>
      absorbLinePairEdit(c, edit)
  },
  solutionSet: { label: "solution set", derive: deriveSolutionSet }
} as const;

export type LinePairReps = typeof linePairReps;
export type LinePairGraph = RepSyncGraph<LinePairCanonical, LinePairReps>;

/* ------------------------------------------------------------------ *
 * operations                                                          *
 * ------------------------------------------------------------------ */

export type LinePairTarget = `${LineSlot}:${LineTarget}`;

/**
 * Retarget the single-line model's own operations onto the slot they happened in. Nothing is
 * restated: the verbs, amounts and sentences are `describeLineChange`'s, which is what keeps one
 * description of "the rate tripled" in the codebase instead of two.
 *
 * No operation is emitted for a change of RELATION (unique → parallel and so on), because the
 * relation is derived, not canonical — an op that described it would be describing something no
 * edit wrote. A motion layer punctuates that from the `relation` view changing.
 */
export function describeLinePairChange(
  before: LinePairCanonical,
  after: LinePairCanonical
): MmipOperation<LinePairTarget>[] {
  const out: MmipOperation<LinePairTarget>[] = [];
  for (const slot of ["a", "b"] as const) {
    for (const op of describeLineChange(before[slot], after[slot])) {
      out.push({
        kind: op.kind,
        target: `${slot}:${op.target}` as LinePairTarget,
        amount: op.amount,
        sides: [`line-${slot}`],
        describe: `${slot === "a" ? before.labels.a : before.labels.b}: ${op.describe}`
      });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * the assembled model                                                 *
 * ------------------------------------------------------------------ */

export type LinePairViews = {
  readonly a: LineFamilyViews;
  readonly b: LineFamilyViews;
  readonly relation: RelationView;
  readonly solutionSet: SolutionSetView;
};

export interface LinePairModel
  extends CanonicalModel<LinePairCanonical, LinePairEdit, LinePairTarget> {
  readonly representations: RepresentationBinding<LinePairCanonical, unknown>[];
  readonly views: (state: LinePairCanonical) => LinePairViews;
  readonly createGraph: (start?: LinePairCanonical) => LinePairGraph;
}

/** One instance per authored problem, mirroring the other two engines' factories. */
export function linePairCanonicalModel(init: LinePairInit = {}): LinePairModel {
  const initial = makeLinePairCanonical(init);
  const bindings = (Object.keys(linePairReps) as (keyof LinePairReps)[]).map((id) => ({
    id,
    label: linePairReps[id].label,
    derive: (state: LinePairCanonical) => linePairReps[id].derive(state) as unknown,
    editable: () => Boolean((linePairReps[id] as { absorb?: unknown }).absorb)
  }));
  return {
    id: "linePair",
    initial,
    representations: bindings,
    /**
     * Delegated to the single-line normalizer, which already rebuilds every rational through
     * `rat` and so cannot let a malformed one (a zero denominator from corrupt storage) survive
     * into a state that throws at derive time. Writing a second sanitizer here would have been
     * the duplication this module exists to avoid — and would have missed that case, as the
     * suite's first run proved.
     */
    normalize: (raw: unknown): LinePairCanonical => {
      const src = (raw && typeof raw === "object" ? raw : {}) as { a?: unknown; b?: unknown };
      const slot = (value: unknown, fallback: LineCanonical): LineCanonical =>
        value && typeof value === "object" ? normalizeLineCanonical(value) : fallback;
      return makeLinePairCanonical({
        a: slot(src.a, initial.a),
        b: slot(src.b, initial.b),
        labels: initial.labels
      });
    },
    apply: (state, edit, origin, source): SyncTransaction<LinePairCanonical, LinePairTarget> => {
      const outcome = absorbLinePairEdit(state, edit);
      if (!outcome.ok) {
        return rejectTransaction<LinePairCanonical, LinePairTarget>(state, origin, source, {
          code: outcome.code,
          message: outcome.reason
        });
      }
      const ops = describeLinePairChange(state, outcome.canonical);
      return { before: state, after: outcome.canonical, origin, source, ops, changed: ops.length > 0, rejected: false };
    },
    /**
     * Two pairs make the same claim when they are the same SYSTEM — and a system is a set, not a
     * list, so naming the lines in the other order is the same claim.
     */
    equivalent: (p, q) => {
      const key = (c: LinePairCanonical) => [lineIdentityKey(c.a), lineIdentityKey(c.b)].sort().join(" & ");
      return key(p) === key(q);
    },
    views: (state) => ({
      a: linePairReps.lineA.derive(state),
      b: linePairReps.lineB.derive(state),
      relation: linePairReps.relation.derive(state),
      solutionSet: linePairReps.solutionSet.derive(state)
    }),
    createGraph: (start?: LinePairCanonical) =>
      createRepSyncGraph({ canonical: start ?? initial, reps: linePairReps })
  };
}
