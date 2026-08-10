/**
 * MMIP v1 — the Multi-Modal Interaction Protocol.
 *
 * ONE canonical mathematical state; every representation on screen is a pure DERIVATION of it.
 * A learner may act through any representation — physical manipulative, term control, symbolic
 * strip — and every other representation re-derives. There is no second copy of the truth, so two
 * representations cannot drift apart: it is not that they are kept in sync, it is that there is
 * only one thing to be in sync with.
 *
 * The three rules this file exists to enforce, in the type system where possible and in the
 * documented contract where not:
 *
 *   1. SINGLE CANONICAL STATE. A representation never holds mathematics of its own. Anything a
 *      representation shows is produced by `RepresentationBinding.derive(state)`, which is pure.
 *   2. EDIT-ORIGIN TRANSACTIONS. Every mutation is `apply(state, edit, origin, source)` and returns
 *      a `SyncTransaction`: before, after, who touched what, and the named mathematical operations
 *      that took the one into the other. Nothing mutates state outside `apply`.
 *   3. NO DERIVED-STATE WRITES. A derived view is read-only. An edit made "in" a derived view is
 *      expressed as an edit to the canonical state, never as a patch of the view.
 *
 * Everything here is engine-agnostic: solveBalance (pan tiles ↔ term controls ↔ equation strip) is
 * the first adopter, the line/function family (graph ↔ equation ↔ table ↔ slope triangle) is the
 * second. Nothing in this file knows about either.
 *
 * FROZEN at S208 for consumption by the Representation Synchronization Graph (repSyncGraph) and
 * the Equation Morph motion layer (equationMorph). Additive change only: new members of
 * `MmipOperationKind`, new optional fields. No existing field may change meaning.
 */

/** Which surface the learner touched. The mathematics is identical from every origin — this exists
 * so a motion layer can animate the representation the learner did NOT touch, and so a transaction
 * log can answer "did they reason physically or symbolically?" without a second state. */
export type EditOrigin =
  /** A manipulative was acted on directly (a tile tapped, a point dragged). */
  | "physical"
  /** A named control was operated (split, distribute, negate, undo button). */
  | "control"
  /** A symbolic form was edited (a coefficient typed, a constant stepped). */
  | "symbolic"
  /** Not a learner edit: initialisation, restore-from-storage, reset. */
  | "system";

/**
 * The named mathematical operations a motion layer can animate. These are OPERATIONS ON THE
 * MATHEMATICS, not on the pixels: "subtract 4 from the left side", never "fade out four divs".
 *
 * The motion semantics each kind is expected to carry (S2's contract):
 *   add        → JOIN      new terms enter and settle into the expression
 *   subtract   → LEAVE     terms depart; the survivors close the gap
 *   cancel     → COLLAPSE  a pair annihilates in place (zero pair, common factor)
 *   divide     → PARTITION the side is shown as k equal parts and k−1 of them leave
 *   distribute → BRANCH    one factor reaches each term inside a bracket
 *   factor     → GATHER    the inverse of branch; terms collect under one factor
 *   negate     → REFLECT   every term reverses sign together (and an order relation turns round)
 *   reorient   → PIVOT     the relation symbol itself changes (comparator flip)
 *   restore    → REWIND    a previous state is re-entered (undo/reset); motion runs backwards
 */
export type MmipOperationKind =
  | "add"
  | "subtract"
  | "cancel"
  | "divide"
  | "distribute"
  | "factor"
  | "negate"
  | "reorient"
  | "restore";

/** One named mathematical step inside a transaction. A transaction may carry several (distributing
 * a bracket touches the x part and the constant part), and they are ordered: a motion layer plays
 * them in array order. */
export interface MmipOperation<TTarget extends string = string> {
  readonly kind: MmipOperationKind;
  /** Which slot of the canonical state this step acts on. Engine-defined, stable, machine-readable. */
  readonly target: TTarget;
  /** Signed magnitude in the operation's own units — tiles added/removed, the divisor for `divide`,
   * the multiplier for `distribute`. `0` when the kind carries no magnitude (`reorient`). */
  readonly amount: number;
  /** Which holders take part — e.g. ["left"], ["left","right"]. A one-sided operation is exactly an
   * operation whose `sides` has length 1, which is what makes a broken equality visible.
   *
   * NON-EMPTY BY TYPE (S208 review, condition 1). An operation with no holders has nothing on
   * stage, and a motion layer given one can only cross-fade a caption — the single failure mode
   * the morph contract exists to forbid. Making the emptiness unrepresentable is cheaper than
   * every consumer defending against it, so the tuple is normative and `equationMorph` keeps a
   * runtime fallback purely for JavaScript callers the type cannot reach. */
  readonly sides: readonly [string, ...string[]];
  /** The mathematics in words, true of the actual numbers. Never "slider at 3" — always what the
   * number MEANS. This is the string a screen reader hears and the caption a morph may show. */
  readonly describe: string;
}

/** Why an edit was refused. Refusals are mathematical, never mechanical: a learner is told what the
 * mathematics does not permit, not that a field rejected input. */
export interface MmipRejection {
  /** Stable machine code for tests and telemetry. */
  readonly code: string;
  /** Learner-facing sentence. */
  readonly message: string;
}

/**
 * The record of one attempted mutation. This is the unit S2's morph layer consumes and the unit a
 * harness replays. `before` and `after` are whole canonical states, so a morph plan is a pure
 * function of (before, ops, after) with nothing else needed.
 */
export interface SyncTransaction<S, TTarget extends string = string> {
  readonly before: S;
  readonly after: S;
  readonly origin: EditOrigin;
  /** Id of the representation the learner touched (`RepresentationBinding.id`). */
  readonly source: string;
  readonly ops: readonly MmipOperation<TTarget>[];
  /** `after` differs from `before`. A rejected transaction is never changed; an accepted one may
   * still be unchanged if the edit was a no-op (typing the value that is already there). */
  readonly changed: boolean;
  /** The edit was refused — `after` is `before`, and `rejection` says why in the learner's terms. */
  readonly rejected: boolean;
  readonly rejection?: MmipRejection;
}

/**
 * A numeric hole a learner may edit inside a symbolic (or tabular) representation. Carries its own
 * bounds and — the part that matters for accessibility — what the number IS. `meaning` is written
 * to be spoken: "the number of x-tiles on the left pan", not "field 1".
 */
export interface EditableSlot<TTarget extends string = string> {
  readonly target: TTarget;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly editable: boolean;
  /** Present exactly when `editable` is false: the mathematical reason, learner-facing. */
  readonly lockedReason?: string;
  /** What this number means in the mathematics on screen. */
  readonly meaning: string;
}

/**
 * One representation of the canonical state. `derive` is pure and total: same state ⇒ same view,
 * forever. `editable` reports whether this representation currently accepts edits — a representation
 * may be legible but locked (brackets still standing, a revealed step).
 */
export interface RepresentationBinding<S, V> {
  readonly id: string;
  /** Human name, used in accessible descriptions ("the pan balance", "the equation strip"). */
  readonly label: string;
  readonly derive: (state: S) => V;
  readonly editable: (state: S) => boolean;
}

/**
 * The canonical model for one engine. An engine adopts MMIP by providing exactly this — no widget
 * code, no React, no DOM. Everything must be pure and deterministic: no `Math.random`, no
 * `Date.now`, no network, no ambient mutable state.
 */
export interface CanonicalModel<S, E, TTarget extends string = string> {
  readonly id: string;
  /** The state a fresh interaction starts in. */
  readonly initial: S;
  /** Coerce anything (a value restored from storage, an older shape, a partial from a test) into a
   * whole canonical state. Must never throw. */
  readonly normalize: (raw: unknown) => S;
  /** The ONLY mutation path. */
  readonly apply: (state: S, edit: E, origin: EditOrigin, source: string) => SyncTransaction<S, TTarget>;
  /** Do two states make the same mathematical claim? Not structural equality — `2x = 10` and
   * `x = 5` are equivalent claims in different positions. */
  readonly equivalent: (a: S, b: S) => boolean;
}

/** A transaction that changed nothing and was not refused — the learner re-entered what was there. */
export function isNoOp<S, T extends string>(tx: SyncTransaction<S, T>): boolean {
  return !tx.rejected && !tx.changed;
}

/** The transaction as one spoken sentence: every operation's own words, in order. Refusals speak
 * their reason instead, because "nothing happened" is never an acceptable thing to hear. */
export function transactionSentence<S, T extends string>(tx: SyncTransaction<S, T>): string {
  if (tx.rejected) return tx.rejection?.message ?? "That move is not available here.";
  if (tx.ops.length === 0) return "Nothing changed.";
  return tx.ops.map((o) => o.describe).join(" ");
}

/** Build a transaction that refuses an edit. Kept here so every engine refuses in the same shape. */
export function rejectTransaction<S, T extends string>(
  before: S,
  origin: EditOrigin,
  source: string,
  rejection: MmipRejection
): SyncTransaction<S, T> {
  return { before, after: before, origin, source, ops: [], changed: false, rejected: true, rejection };
}

/**
 * Build a transaction that accepts an edit. Kept here, beside `rejectTransaction`, so the ONE rule
 * every accepted transaction must obey lives in a single place rather than in every engine's
 * memory: an UNCHANGED transaction (`before` and `after` are the same state) carries NO ops,
 * because there is nothing to describe — `reset` on an already-initial position, or a typed value
 * equal to the one already there, is legal and reachable, but it is not an event, and a motion
 * layer handed ops for it would animate a move that never happened.
 *
 * HOISTED S213 (additive — see the mmipTypes.ts frozen-contract note above this comment stays true:
 * no existing type or export changed shape). The defensive line `ops: changed ? ops : []` was
 * independently written, identically, in two engines — `algebraTilesModel.ts`'s `accept()` (S212)
 * and `solveBalanceModel.ts`'s `accept()` (S212, in the same session, from the same lesson) —
 * before either engine knew the other had needed it. `mmipHarness`'s `transactionCheck` is what
 * caught it in the first place (an accepted, unchanged transaction carrying non-empty ops is one of
 * the exact shapes it asserts against), which is precisely the case for making the rule structural
 * rather than trusted to be remembered a third time: a check can catch a violation, but hoisting the
 * one correct implementation here means a third engine has nothing to remember to get right.
 *
 * `changed` is supplied by the CALLER rather than computed here, because only the engine knows
 * which fields of its own state are the mathematics — some engine state may carry perceptual-only
 * fields (a draft, a UI-only flag) that must never be compared, per invariant 1's "no derived-state
 * writes" rule (§1 above): comparing them here would make a change to perceptual state alone read
 * as a mathematical change, which is exactly the kind of drift MMIP exists to make impossible. */
export function acceptTransaction<S, T extends string>(
  before: S,
  after: S,
  origin: EditOrigin,
  source: string,
  changed: boolean,
  ops: readonly MmipOperation<T>[]
): SyncTransaction<S, T> {
  return { before, after, origin, source, ops: changed ? ops : [], changed, rejected: false };
}
