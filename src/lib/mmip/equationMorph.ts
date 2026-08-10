/**
 * Equation Morph — MMIP wave 1, Session 208.
 *
 * A pure motion-planning layer. It turns a `SyncTransaction` (frozen contract, see
 * `docs/MMIP_V1_API.md` §3 and `mmipTypes.ts`) into a `MorphPlan`: an ordered list of phases whose
 * MOTION explains the mathematical transformation, never a caption bolted onto a static swap.
 *
 * This module knows nothing about pixels, timing units, React or any particular engine. It knows
 * `MmipOperation` and produces relative weights (`durationWeight`, `stagger`) that a widget layer
 * later maps to milliseconds. No `Math.random`, no `Date.now`, no DOM, no ambient state: the same
 * transaction always produces the byte-identical plan, forever.
 *
 * ── THE MOTION TABLE (owned by mmipTypes.ts, honored here exactly) ──────────────────────────────
 *
 *   add        → join       new terms enter and settle into the expression
 *   subtract   → leave      terms depart; the survivors close the gap
 *   cancel     → collapse   a pair annihilates in place (zero pair, common factor)
 *   divide     → partition  the side is shown as k equal parts; k−1 of them leave
 *   distribute → branch     one factor reaches each term inside a bracket
 *   factor     → gather     the inverse of branch; terms collect under one factor
 *   negate     → reflect    every term reverses sign together
 *   reorient   → pivot      the relation symbol itself changes
 *   restore    → rewind     a previous state is re-entered; motion runs backwards
 *
 * ── THE MERGE RULE ───────────────────────────────────────────────────────────────────────────
 *
 * A transaction's `ops` array is walked left to right. Two CONSECUTIVE ops merge into one phase
 * iff they share a `kind` AND each is one-sided (`sides.length === 1`) AND their sides are
 * DIFFERENT (one "left", one "right"). That is exactly the "both pans at once" reading: two
 * one-sided moves that are really a single two-sided mathematical act, told in two op records
 * only because the engine records one holder at a time. Ops that are already two-sided (a real
 * `divide`/`negate`/`reorient`/`restore` op with `sides.length > 1`) need no merge — they are
 * already one phase. Ops of the same kind on the SAME side (e.g. distribute's x-part and
 * constant-part, both `sides: ["left"]`) are NOT merged: they are two genuine sequential events
 * on one pan (the bracket opening onto the x population, then onto the constant population), and
 * merging them would hide that the multiplier can stop at the x alone (`distributeXOnly`). The
 * merge is greedy and non-overlapping, applied once per adjacent pair, which is what keeps a
 * multi-op transaction at ≤4 phases wherever the "both pans" reading actually applies.
 *
 * ── NO STRING CROSSFADES ─────────────────────────────────────────────────────────────────────
 *
 * Every phase carries at least one actor (derived from the op's `target` + `sides`, never
 * fabricated) and a `fromRole`/`toRole` pair. A phase is only "motionless" when `fromRole ===
 * toRole` AND there is nothing on stage to move, which never happens here: even in-place motions
 * (partition, branch, gather, reflect, pivot) carry real actors located at a real role, so the
 * plan is never reduced to prose. `restore` is given a real role transition too
 * (`off-stage` → `equation-slot`, the previous state re-entering) rather than treated as bare
 * text — no exception to the rule was needed in practice, but every phase still carries a
 * `reversible` flag recording that a motion layer (or `reversePlan`) may run it backwards, which
 * is what a rewind ultimately is.
 */

import type { MmipOperation, MmipOperationKind, SyncTransaction } from "./mmipTypes";

/* ─────────────────────────────────────── the vocabulary ─────────────────────────────────────── */

/** The nine motion semantics `mmipTypes.ts` names. One per `MmipOperationKind`, no more. */
export type MorphMotion =
  | "join"
  | "leave"
  | "collapse"
  | "partition"
  | "branch"
  | "gather"
  | "reflect"
  | "pivot"
  | "rewind";

/** Where an actor starts or ends, in representation terms — never a pixel coordinate. A morph
 * layer speaks in these four places; a widget maps each to wherever it draws that holder. */
export type MorphRole = "pan-left" | "pan-right" | "equation-slot" | "off-stage";

/** One phase of a `MorphPlan`. `ops` holds every `MmipOperation` this phase renders (one, or two
 * when the merge rule fired); `op` is the first of them, kept singular for callers that only need
 * "the operation this phase is about". */
export interface MorphPhase<TTarget extends string = string> {
  readonly op: MmipOperation<TTarget>;
  readonly ops: readonly MmipOperation<TTarget>[];
  readonly motion: MorphMotion;
  /** Stable ids of the glyphs/tiles that move, one per (target, side) pair across every op in this
   * phase — e.g. `"leftUnits:left"`. Never empty: an empty actor list is exactly what "a phase
   * with no motion" would mean, and this module never produces one for a changed transaction. */
  readonly actors: readonly string[];
  readonly fromRole: MorphRole;
  readonly toRole: MorphRole;
  /** Relative, unitless weight. A widget layer multiplies by its own base duration. */
  readonly durationWeight: number;
  /** Relative, unitless delay between this phase's actors starting — 0 when there is only one. */
  readonly stagger: number;
  /** `op.describe` (or both ops' `describe`, merged) augmented with the motion verb, safe for
   * `aria-live`. */
  readonly describe: string;
  /** Whether a motion layer may run this phase backwards. Always `true` here — every phase this
   * module builds is symmetric enough for `reversePlan` to invert — but the field is recorded
   * per-phase rather than assumed, since a future engine's phase might not be. */
  readonly reversible: boolean;
}

/** The plan a `SyncTransaction` compiles to. `phases` is empty exactly when nothing is to be
 * animated: the edit was refused, or it changed nothing. `message` carries the sentence a widget
 * shows instead of animating — the rejection reason, or "Nothing changed." */
export interface MorphPlan<TTarget extends string = string> {
  readonly phases: readonly MorphPhase<TTarget>[];
  readonly rejected: boolean;
  readonly message?: string;
}

const REJECTED_FALLBACK = "That move is not available here.";
const NOOP_MESSAGE = "Nothing changed.";

/* ───────────────────────────────────── the motion table ─────────────────────────────────────── */

const KIND_TO_MOTION: Record<MmipOperationKind, MorphMotion> = {
  add: "join",
  subtract: "leave",
  cancel: "collapse",
  divide: "partition",
  distribute: "branch",
  factor: "gather",
  negate: "reflect",
  reorient: "pivot",
  restore: "rewind",
};

const MOTION_LABEL: Record<MorphMotion, string> = {
  join: "Join",
  leave: "Leave",
  collapse: "Collapse",
  partition: "Partition",
  branch: "Branch",
  gather: "Gather",
  reflect: "Reflect",
  pivot: "Pivot",
  rewind: "Rewind",
};

/** Relative durations, unitless. Motions that reshape more of the state (partition, branch,
 * gather) read slower than a single tile arriving or leaving; a pivot — one glyph turning — is
 * the shortest. */
const MOTION_DURATION: Record<MorphMotion, number> = {
  join: 1,
  leave: 1,
  collapse: 1.2,
  partition: 1.5,
  branch: 1.5,
  gather: 1.5,
  reflect: 1,
  pivot: 0.75,
  rewind: 1,
};

/** An involution: applying it twice is the identity, which is what makes `reversePlan` a true
 * round trip. `collapse`/`partition`/`rewind` have no natural distinct inverse in this vocabulary
 * (the inverse of an annihilation is another annihilation reading backwards, not a different
 * verb), so they map to themselves — self-inverse, same as `reflect` (negating twice is the
 * identity) and `pivot` (turning the same relation glyph is its own reverse motion). */
const MOTION_INVERSE: Record<MorphMotion, MorphMotion> = {
  join: "leave",
  leave: "join",
  branch: "gather",
  gather: "branch",
  collapse: "collapse",
  partition: "partition",
  reflect: "reflect",
  pivot: "pivot",
  rewind: "rewind",
};

const UNDO_PREFIX = "Undo: ";

/** Toggle the undo prefix — add it if absent, strip it if present. An involution by construction,
 * which is what lets `reversePlan(reversePlan(plan))` come back byte-identical. */
function toggleUndoPrefix(s: string): string {
  return s.startsWith(UNDO_PREFIX) ? s.slice(UNDO_PREFIX.length) : `${UNDO_PREFIX}${s}`;
}

/* ─────────────────────────────────────── roles + actors ─────────────────────────────────────── */

function roleForSide(side: string): MorphRole {
  if (side === "left") return "pan-left";
  if (side === "right") return "pan-right";
  // Defensive fallback for a future engine whose holders aren't named "left"/"right" — the
  // equation as a whole is always a legible place to put an actor whose side this module does
  // not recognise.
  return "equation-slot";
}

/** The role a single op occupies. A one-sided op sits on its one pan; anything two-(or more-)
 * sided is the whole equation acting as one object — which is exactly the reading a "both pans at
 * once" merged phase wants too. */
function phaseRole<TTarget extends string>(op: MmipOperation<TTarget>): MorphRole {
  if (op.sides.length !== 1) return "equation-slot";
  return roleForSide(op.sides[0]);
}

function actorId<TTarget extends string>(op: MmipOperation<TTarget>, side: string): string {
  return `${op.target}:${side}`;
}

/** The stable ids of what this op moves.
 *
 * `MmipOperation.sides` is a NON-EMPTY tuple by type (mmipTypes.ts, S208 review condition 1), so a
 * TypeScript caller cannot reach the empty case at all. A JavaScript caller — or a `JSON.parse`d
 * transaction replayed from a log — still can, and an op with no holders would compile to a phase
 * with no actors: precisely the "cross-fade a caption" degeneracy this module refuses to produce.
 * So the empty case falls back to the equation itself acting as one object, which is exactly the
 * reading `phaseRole` already gives any op that is not one-sided. It never throws: a motion layer
 * that dies mid-transaction would leave the learner looking at a half-animated equation, which is
 * strictly worse than one honest whole-equation gesture. */
function actorsFor<TTarget extends string>(op: MmipOperation<TTarget>): string[] {
  if (op.sides.length === 0) return [`${op.target}:equation`];
  return op.sides.map((side) => actorId(op, side));
}

/** Where a phase's actors start and end, given its motion and the role they occupy. `join` and
 * `rewind` bring something onto stage; `leave`/`collapse` take something off; everything else is
 * a transformation in place — the role does not change, but the phase still has real actors and a
 * real motion, which is what keeps it out of "string crossfade" territory. */
function roleTransition(motion: MorphMotion, role: MorphRole): { fromRole: MorphRole; toRole: MorphRole } {
  switch (motion) {
    case "join":
      return { fromRole: "off-stage", toRole: role };
    case "leave":
    case "collapse":
      return { fromRole: role, toRole: "off-stage" };
    case "rewind":
      // The previous state re-enters — it is not merely re-typed, it comes back from history.
      return { fromRole: "off-stage", toRole: role };
    default:
      return { fromRole: role, toRole: role };
  }
}

/* ──────────────────────────────────────── phase building ─────────────────────────────────────── */

function buildSinglePhase<TTarget extends string>(op: MmipOperation<TTarget>): MorphPhase<TTarget> {
  const motion = KIND_TO_MOTION[op.kind];
  const role = phaseRole(op);
  const { fromRole, toRole } = roleTransition(motion, role);
  const actors = actorsFor(op);
  return {
    op,
    ops: [op],
    motion,
    actors,
    fromRole,
    toRole,
    durationWeight: MOTION_DURATION[motion],
    stagger: actors.length > 1 ? 0.12 : 0,
    describe: `${MOTION_LABEL[motion]}. ${op.describe}`,
    reversible: true,
  };
}

/** Two consecutive one-sided ops of the same kind, on different sides, merge into a single "both
 * pans at once" phase. See the merge-rule doc block at the top of this file. */
function canMergeOppositeSides<TTarget extends string>(
  a: MmipOperation<TTarget>,
  b: MmipOperation<TTarget>
): boolean {
  return a.kind === b.kind && a.sides.length === 1 && b.sides.length === 1 && a.sides[0] !== b.sides[0];
}

function buildMergedPhase<TTarget extends string>(
  a: MmipOperation<TTarget>,
  b: MmipOperation<TTarget>
): MorphPhase<TTarget> {
  const motion = KIND_TO_MOTION[a.kind];
  // Two different one-sided roles, merged: this is exactly the "equation-slot" reading, the same
  // role a genuinely two-sided op already occupies.
  const role: MorphRole = "equation-slot";
  const { fromRole, toRole } = roleTransition(motion, role);
  const actors = [...actorsFor(a), ...actorsFor(b)];
  return {
    op: a,
    ops: [a, b],
    motion,
    actors,
    fromRole,
    toRole,
    durationWeight: MOTION_DURATION[motion],
    stagger: 0.12,
    describe: `${MOTION_LABEL[motion]} (both sides). ${a.describe} ${b.describe}`,
    reversible: true,
  };
}

function buildPhases<TTarget extends string>(ops: readonly MmipOperation<TTarget>[]): MorphPhase<TTarget>[] {
  const phases: MorphPhase<TTarget>[] = [];
  let i = 0;
  while (i < ops.length) {
    const a = ops[i];
    const b = ops[i + 1];
    if (b && canMergeOppositeSides(a, b)) {
      phases.push(buildMergedPhase(a, b));
      i += 2;
    } else {
      phases.push(buildSinglePhase(a));
      i += 1;
    }
  }
  return phases;
}

/* ───────────────────────────────────────── the plan ──────────────────────────────────────────── */

/**
 * Compile a `SyncTransaction` into a `MorphPlan`. Pure function of `tx.rejected`, `tx.changed` and
 * `tx.ops` — nothing else is read, and nothing here is random or time-dependent, so the same
 * transaction always compiles to the byte-identical plan.
 */
export function equationMorphPlan<S, TTarget extends string>(
  tx: SyncTransaction<S, TTarget>
): MorphPlan<TTarget> {
  if (tx.rejected) {
    return { phases: [], rejected: true, message: tx.rejection?.message ?? REJECTED_FALLBACK };
  }
  if (!tx.changed || tx.ops.length === 0) {
    return { phases: [], rejected: false, message: NOOP_MESSAGE };
  }
  return { phases: buildPhases(tx.ops), rejected: false };
}

/* ─────────────────────────────────────── reduced motion ──────────────────────────────────────── */

/** A human-readable net-change summary, built only from the ops' own `target`/`amount` — never
 * from `before`/`after`, which this module never reads. Targets with zero net signed amount are
 * omitted (a crossing-zero pair like "leave 4, join 4" nets to nothing worth reporting numerically
 * even though both legs are meaningful motion). */
function summarizeStateDelta<TTarget extends string>(ops: readonly MmipOperation<TTarget>[]): string {
  const totals = new Map<string, number>();
  for (const o of ops) {
    if (o.amount === 0) continue;
    totals.set(o.target, (totals.get(o.target) ?? 0) + o.amount);
  }
  if (totals.size === 0) return "State delta: no net numeric change.";
  const parts = Array.from(totals.entries()).map(([target, amount]) => `${target} ${amount >= 0 ? "+" : ""}${amount}`);
  return `State delta: ${parts.join(", ")}.`;
}

/**
 * The degenerate plan: one phase, zero travel (`fromRole === toRole === "equation-slot"`,
 * `durationWeight: 0`, `stagger: 0`), but every `describe` string from the full plan survives —
 * concatenated in order — plus a `stateDelta` summary, so the meaning of the transaction is
 * complete from text alone. Never empty for a changed transaction: a rejected or unchanged plan
 * (already empty) passes through unchanged, because there is nothing to reduce.
 */
export function reducedMotion<TTarget extends string>(plan: MorphPlan<TTarget>): MorphPlan<TTarget> {
  if (plan.rejected || plan.phases.length === 0) return plan;
  const allOps = plan.phases.flatMap((p) => p.ops);
  const combinedDescribe = plan.phases.map((p) => p.describe).join(" ");
  const stateDelta = summarizeStateDelta(allOps);
  const actors = Array.from(new Set(plan.phases.flatMap((p) => p.actors)));
  const primary = plan.phases[0];
  const phase: MorphPhase<TTarget> = {
    op: primary.op,
    ops: allOps,
    motion: primary.motion,
    actors,
    fromRole: "equation-slot",
    toRole: "equation-slot",
    durationWeight: 0,
    stagger: 0,
    describe: `${combinedDescribe} ${stateDelta}`.trim(),
    reversible: true,
  };
  return { phases: [phase], rejected: false, message: plan.message };
}

/* ──────────────────────────────────────── reverse plan ───────────────────────────────────────── */

function reversePhase<TTarget extends string>(phase: MorphPhase<TTarget>): MorphPhase<TTarget> {
  const ops = [...phase.ops].reverse();
  return {
    op: ops[0],
    ops,
    motion: MOTION_INVERSE[phase.motion],
    actors: phase.actors,
    fromRole: phase.toRole,
    toRole: phase.fromRole,
    durationWeight: phase.durationWeight,
    stagger: phase.stagger,
    describe: toggleUndoPrefix(phase.describe),
    reversible: phase.reversible,
  };
}

/**
 * The plan for the undo animation: phases in reverse order, each phase's motion inverted
 * (`join`↔`leave`, `branch`↔`gather`, everything else self-inverse — see `MOTION_INVERSE`),
 * `fromRole`/`toRole` swapped, and the "Undo: " marker toggled onto (or off) each `describe`.
 * Every transform used is an involution, so `reversePlan(reversePlan(plan))` is deep-equal to
 * `plan` for every plan this module produces — asserted directly in the test file rather than
 * merely asserted here.
 */
export function reversePlan<TTarget extends string>(plan: MorphPlan<TTarget>): MorphPlan<TTarget> {
  if (plan.rejected || plan.phases.length === 0) return plan;
  const phases = [...plan.phases].reverse().map(reversePhase);
  return { phases, rejected: plan.rejected, ...(plan.message !== undefined ? { message: plan.message } : {}) };
}
