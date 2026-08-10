// The MMIP test harness — reusable verification utilities that any Multi-representation
// Manipulative Interaction Proof (MMIP) engine must pass.
//
// A representation-sync engine (solveBalance's Direct Manipulation Layer and whatever follows it)
// lets a learner edit the SAME mathematical object from several places at once — drag a tile, type
// a coefficient, click a term in the sentence — and every other representation must re-derive
// itself in agreement. The bug class this invites is not "wrong answer": it is "two views of the
// same state that quietly disagree", which a conventional single-representation test never
// exercises because it only ever looks at one view at a time.
//
// This file is model-agnostic. It knows nothing about solveBalance, line families, or any other
// engine — it only knows the shape below (`MmipModel`). Each engine's own test file builds a
// small adapter around its real state/edit/derive functions and hands it to these checks. That
// keeps this file free to import (no engine-specific types leak into it) and keeps every future
// engine proof honest against the same discipline.
//
// DESIGN NOTE ON PURITY: checks 1–4 and 8 below are pure — no DOM, no I/O, nothing but function
// calls and comparisons. Checks 5–7 are jsdom helpers (they read `window`/`Element`) and are kept
// in their own clearly marked section at the bottom. Nothing in this file uses `Math.random` —
// `staleStateCheck`'s random walk is seeded with `mulberry32` (`src/lib/prng.ts`), so a failure is
// always reproducible from its seed alone, matching the determinism rule the rest of the repo
// lives by.

import { mulberry32 } from "../prng";

// ---------------------------------------------------------------------------------------------
// The model contract
// ---------------------------------------------------------------------------------------------

/** The name of an input channel an edit can come from — a drag gesture, a typed field, a tapped
 * term in the symbolic sentence. Representation-sync bugs are almost always ORIGIN-shaped: one
 * origin's edit handler drifts from another's, so the two never disagree until you drive the
 * SAME underlying change through both. */
export type Origin = string;

/** One edit, addressed by the origin it came from. `edit` is opaque to the harness — it is
 * whatever payload the model's own `applyEdit` expects for that origin (a delta, a typed value, a
 * tapped term id). The harness only ever passes it straight through. */
export interface EditStep {
  readonly origin: Origin;
  readonly edit: unknown;
}

/** The minimal shape every MMIP engine adapter must present to this harness.
 *
 * `TState` is the single source of truth — everything a re-derivation needs, and nothing more (no
 * cached view may live outside it, or a check below will not be able to see it drift).
 * `TViews` is every derived representation bundled into one object (the pan weights, the symbolic
 * sentence, the read-aloud string, whatever the engine shows) — one `derive` call must produce ALL
 * of them together, because the whole point of these checks is that they cannot secretly disagree
 * with each other. */
export interface MmipModel<TState, TViews> {
  /** Every origin an edit may legitimately come from. `roundTripCheck` and `staleStateCheck`
   * validate against this list rather than trusting the caller not to typo an origin name. */
  readonly origins: readonly Origin[];
  /** The state a fresh instance of the engine starts in. Must be pure — same call, same result. */
  init(): TState;
  /** Apply one edit from one origin, returning a NEW state. Must be pure (no mutation of `state`,
   * no reliance on anything but its own arguments) — every check below calls this repeatedly and
   * assumes it is safe to branch and replay from any prior state. */
  applyEdit(state: TState, origin: Origin, edit: unknown): TState;
  /** Recompute every representation from `state` alone. This is the function under test — the
   * thing that must never be stale, never cached across calls, never miss a representation. */
  derive(state: TState): TViews;
  /** OPTIONAL, ADDITIVE (S209). `applyEdit` above is deliberately the bare-state shape every check
   * 1–4 and 8 was built against, but a bare state cannot carry `docs/MMIP_V1_API.md`'s invariant 2
   * (every mutation is an edit-origin `SyncTransaction`) or its rejection contract — there is
   * nowhere in a bare `TState` to put `ops`, `origin`, or `rejection`. An engine that implements
   * `CanonicalModel` (the normative contract in `mmipTypes.ts`) can additionally expose that
   * transaction here, via a THIN BRIDGE (`(state, origin, edit) => model.apply(state, edit,
   * origin, source)`), and `transactionCheck` below will verify it. Omitting this field only means
   * `transactionCheck` cannot run against this model — every other check is unaffected. */
  readonly applyTransaction?: (state: TState, origin: Origin, edit: unknown) => TransactionLike<TState>;
}

/**
 * A structural mirror of `mmipTypes.ts`'s `SyncTransaction`, kept LOCAL to this file rather than
 * imported from there. That is a deliberate decoupling (see `docs/MMIP_V1_API.md` §2's "which
 * contract is normative" note: this harness is a test-only adapter, not a fourth model shape for
 * an engine to conform to) — any object with this shape can be checked, whether it came from a
 * real `CanonicalModel.apply` or a test fixture built by hand. Only the fields `transactionCheck`
 * actually reads are required; an engine's real transaction type is a structural superset of this
 * and needs no adapting beyond the bridge itself. */
export interface TransactionOpLike {
  readonly sides: readonly string[];
}

export interface TransactionLike<TState> {
  readonly before: TState;
  readonly after: TState;
  readonly origin: Origin;
  readonly ops: readonly TransactionOpLike[];
  readonly changed: boolean;
  readonly rejected: boolean;
  readonly rejection?: { readonly code: string; readonly message: string };
}

// ---------------------------------------------------------------------------------------------
// Structural equality
// ---------------------------------------------------------------------------------------------

/** Deep structural equality over the plain data (objects, arrays, primitives) every `TViews`
 * bundle is expected to be. `NaN` compares equal to itself (via `Object.is`) since a derived
 * numeric view legitimately produces `NaN` for some undefined states (e.g. a zero denominator) and
 * that must be a stable, comparable value rather than an automatic mismatch. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray || bIsArray) {
    if (!aIsArray || !bIsArray) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao).sort();
  const bk = Object.keys(bo).sort();
  if (ak.length !== bk.length) return false;
  for (let i = 0; i < ak.length; i++) if (ak[i] !== bk[i]) return false;
  return ak.every((k) => deepEqual(ao[k], bo[k]));
}

/** Guard shared by every check below that accepts an "independent recompute" function: refuses a
 * caller who passes the model's own `derive` back in. That is not independent verification — it is
 * the model agreeing with itself, which passes even when `derive` is completely wrong. This is a
 * REFERENCE check only (it cannot detect two functions that happen to compute the same wrong
 * answer by different code) — genuine independence, e.g. deriving the answer by search instead of
 * by formula, is the caller's responsibility, exactly as `CLAUDE.md`'s variant-generation rule
 * requires an INDEPENDENT route that never reuses the shortcut under test. */
function assertIndependent(fnName: string, derive: unknown, independent: unknown): void {
  if (independent === derive) {
    throw new Error(
      `${fnName}: independentDerive must not be model.derive itself — pass a genuinely ` +
        "independent recomputation (a different formula, a different code path), or this check " +
        "only proves the model agrees with itself, which is true of a broken model too."
    );
  }
}

// ---------------------------------------------------------------------------------------------
// 1. roundTripCheck
// ---------------------------------------------------------------------------------------------

export interface RoundTripFailure<TState, TViews> {
  readonly origin: Origin;
  readonly edit: unknown;
  readonly state: TState;
  readonly expected: TViews;
  readonly actual: TViews;
}

export interface RoundTripResult<TState, TViews> {
  readonly ok: boolean;
  readonly failures: readonly RoundTripFailure<TState, TViews>[];
  readonly casesRun: number;
}

/** Drive one edit from each of `cases`' origins (from a fresh `model.init()` each time) and assert
 * that `model.derive` agrees with an INDEPENDENTLY recomputed expectation for every representation
 * bundled in `TViews` at once.
 *
 * CONTRACT: `independentDerive` must not be `model.derive` (enforced — see `assertIndependent`)
 * and should compute the same views by a genuinely different route than the model does internally
 * (different formula, different traversal, a schema-level pure function rather than the widget's
 * own memoized path). The point of round-tripping through an edit from EVERY origin is that a
 * representation-sync bug is usually origin-shaped: `derive` can be correct for the state reached
 * by a drag but wrong for the identical state reached by typing, if the two paths quietly diverge
 * somewhere upstream. Comparing against one shared independent recompute exposes that regardless
 * of which origin produced the state. */
export function roundTripCheck<TState, TViews>(
  model: MmipModel<TState, TViews>,
  cases: readonly EditStep[],
  independentDerive: (state: TState) => TViews
): RoundTripResult<TState, TViews> {
  assertIndependent("roundTripCheck", model.derive, independentDerive);
  if (cases.length === 0) {
    throw new Error("roundTripCheck: at least one case is required — an empty list trivially passes.");
  }
  const failures: RoundTripFailure<TState, TViews>[] = [];
  for (const c of cases) {
    if (!model.origins.includes(c.origin)) {
      throw new Error(`roundTripCheck: origin "${c.origin}" is not declared in model.origins.`);
    }
    const state = model.applyEdit(model.init(), c.origin, c.edit);
    const expected = independentDerive(state);
    const actual = model.derive(state);
    if (!deepEqual(expected, actual)) {
      failures.push({ origin: c.origin, edit: c.edit, state, expected, actual });
    }
  }
  return { ok: failures.length === 0, failures, casesRun: cases.length };
}

// ---------------------------------------------------------------------------------------------
// 2. staleStateCheck
// ---------------------------------------------------------------------------------------------

export interface StaleStateFailure<TState, TViews> {
  readonly step: number;
  readonly origin: Origin;
  readonly state: TState;
  readonly expected: TViews;
  readonly actual: TViews;
}

export interface StaleStateResult<TState, TViews> {
  readonly ok: boolean;
  readonly failures: readonly StaleStateFailure<TState, TViews>[];
  readonly stepsRun: number;
}

export interface StaleStateOptions<TState> {
  /** Seeds a `mulberry32` generator — same seed, same walk, forever. Never `Math.random`. */
  readonly seed: number;
  /** How many edits to apply. Re-derivation is checked after EVERY step, not just at the end, so a
   * representation that goes stale for one step and then "catches up" on the next is still caught. */
  readonly steps: number;
  /** Produces one edit payload for the given origin and current state, drawing randomness only
   * from `rand` (never `Math.random`). May return `undefined` for an origin whose edit needs no
   * payload (e.g. "tap the next unit tile"). */
  readonly randomEdit: (state: TState, origin: Origin, rand: () => number) => unknown;
}

/** A seeded, deterministic random walk: apply `opts.steps` edits, rotating through
 * `model.origins` in order, and after EACH step assert `model.derive(state)` still agrees with an
 * independently recomputed expectation.
 *
 * This is the check that catches the representation-sync bug class a single scripted test tends to
 * miss: a view that is computed once and cached, or updated for some origins' edits but not
 * others, will agree with the independent recompute for a while and then silently diverge — a
 * fixed short script can happen to never take the path that exposes it, but a long rotating walk
 * almost always will. Determinism (the seed) is what makes a failure here debuggable rather than
 * a one-off flake: rerunning with the same seed reproduces exactly the same walk. */
export function staleStateCheck<TState, TViews>(
  model: MmipModel<TState, TViews>,
  independentDerive: (state: TState) => TViews,
  opts: StaleStateOptions<TState>
): StaleStateResult<TState, TViews> {
  assertIndependent("staleStateCheck", model.derive, independentDerive);
  if (model.origins.length === 0) {
    throw new Error("staleStateCheck: model.origins must be non-empty.");
  }
  if (!Number.isInteger(opts.steps) || opts.steps <= 0) {
    throw new Error("staleStateCheck: steps must be a positive integer.");
  }
  const rand = mulberry32(opts.seed >>> 0);
  const failures: StaleStateFailure<TState, TViews>[] = [];
  let state = model.init();
  for (let step = 0; step < opts.steps; step++) {
    const origin = model.origins[step % model.origins.length];
    const edit = opts.randomEdit(state, origin, rand);
    state = model.applyEdit(state, origin, edit);
    const expected = independentDerive(state);
    const actual = model.derive(state);
    if (!deepEqual(expected, actual)) failures.push({ step, origin, state, expected, actual });
  }
  return { ok: failures.length === 0, failures, stepsRun: opts.steps };
}

// ---------------------------------------------------------------------------------------------
// 3. equivalenceCheck
// ---------------------------------------------------------------------------------------------

export interface EquivalenceResult<TState, TViews> {
  readonly ok: boolean;
  readonly stateA: TState;
  readonly stateB: TState;
  readonly viewsA: TViews;
  readonly viewsB: TViews;
}

function runSequence<TState>(
  model: Pick<MmipModel<TState, unknown>, "init" | "applyEdit">,
  sequence: readonly EditStep[]
): TState {
  return sequence.reduce<TState>((state, step) => model.applyEdit(state, step.origin, step.edit), model.init());
}

/** Two edit sequences that are claimed to reach the SAME mathematical state by different paths
 * (different origins, different order, different intermediate steps — e.g. "subtract 2 from both
 * sides then divide by 3" versus "type the solved tile counts directly") must produce identical
 * derived views. This is the sync-graph promise made concrete: representation is not path-
 * dependent. A failure here means either the two sequences are not actually equivalent (a test
 * authoring mistake) or `applyEdit`/`derive` treats two origins inconsistently for what should be
 * the same underlying edit. */
export function equivalenceCheck<TState, TViews>(
  model: MmipModel<TState, TViews>,
  sequenceA: readonly EditStep[],
  sequenceB: readonly EditStep[]
): EquivalenceResult<TState, TViews> {
  const stateA = runSequence(model, sequenceA);
  const stateB = runSequence(model, sequenceB);
  const viewsA = model.derive(stateA);
  const viewsB = model.derive(stateB);
  return { ok: deepEqual(viewsA, viewsB), stateA, stateB, viewsA, viewsB };
}

// ---------------------------------------------------------------------------------------------
// 4. undoCheck
// ---------------------------------------------------------------------------------------------

export interface UndoFailure<TState> {
  readonly step: number;
  readonly kind: "state" | "views";
  readonly expectedState: TState;
  readonly actualState: TState;
}

export interface UndoResult<TState> {
  readonly ok: boolean;
  readonly failures: readonly UndoFailure<TState>[];
}

/** Snapshot every state along `sequence` (from `model.init()`), then walk backwards calling
 * `undo` and asserting EXACT restoration by deep equality — not "close enough", not "the derived
 * views happen to match" — the raw state itself must be byte-for-byte identical to what it was
 * before the edit it undoes. Only once state equality holds does the check go on to compare
 * derived views too (comparing views on top of an already-wrong state would just restate the same
 * failure in a more confusing shape, so that step is skipped when state itself mismatches). */
export function undoCheck<TState, TViews>(
  model: MmipModel<TState, TViews>,
  undo: (state: TState) => TState,
  sequence: readonly EditStep[]
): UndoResult<TState> {
  if (sequence.length === 0) {
    throw new Error("undoCheck: at least one edit is required — an empty sequence trivially passes.");
  }
  const states: TState[] = [model.init()];
  for (const step of sequence) {
    states.push(model.applyEdit(states[states.length - 1], step.origin, step.edit));
  }
  const failures: UndoFailure<TState>[] = [];
  for (let i = states.length - 1; i >= 1; i--) {
    const undone = undo(states[i]);
    if (!deepEqual(undone, states[i - 1])) {
      failures.push({ step: i, kind: "state", expectedState: states[i - 1], actualState: undone });
      continue;
    }
    const expectedViews = model.derive(states[i - 1]);
    const actualViews = model.derive(undone);
    if (!deepEqual(expectedViews, actualViews)) {
      failures.push({ step: i, kind: "views", expectedState: states[i - 1], actualState: undone });
    }
  }
  return { ok: failures.length === 0, failures };
}

// ---------------------------------------------------------------------------------------------
// 4b. transactionCheck (S209 — added to close the gap `docs/MMIP_V1_API.md` §2 records: nothing
//     in `mmipHarness` could previously observe `ops`, `origin` or `rejection`, so invariant 2 and
//     the rejection contract were proved only by engine-level tests. This runs against
//     `MmipModel.applyTransaction`, additive on the interface above.)
// ---------------------------------------------------------------------------------------------

export interface TransactionFailure {
  readonly index: number;
  readonly origin: Origin;
  readonly edit: unknown;
  readonly reason: string;
}

export interface TransactionCheckResult {
  readonly ok: boolean;
  readonly failures: readonly TransactionFailure[];
  readonly casesRun: number;
}

/**
 * Walk `cases` as a single sequential transaction LOG — `state` carries forward from one
 * transaction's `after` into the next call, exactly as a real session replays one — and for every
 * transaction assert:
 *
 *   - `tx.before` equals the state actually fed into this edit (not a stale or fabricated snapshot).
 *   - `tx.origin` equals the origin that drove the edit.
 *   - REJECTED transactions: `ops` is empty, `after` equals `before` (a refusal never mutates),
 *     `changed` is `false`, and `rejection` carries both a `code` and a `message` — a refusal is
 *     always mathematical, never silent (`docs/MMIP_V1_API.md` §2, invariant 2).
 *   - ACCEPTED, UNCHANGED transactions (a no-op edit, e.g. typing the value already there): `ops`
 *     is empty and `after` equals `before` — nothing happened, so nothing should be described.
 *   - ACCEPTED, CHANGED transactions: `ops` is NON-EMPTY (a real mutation with nothing to animate
 *     is exactly the failure mode `docs/MMIP_V1_API.md` §3 calls "a string crossfade"), `after`
 *     differs from `before`, and every op's `sides` is non-empty (an operation with no holders has
 *     nothing on stage — `MmipOperation.sides` is a non-empty tuple by type in `mmipTypes.ts`
 *     itself; this is the runtime half of that guarantee for a transaction replayed from a log or
 *     built by a JavaScript caller the type system cannot reach).
 *
 * Throws if `model.applyTransaction` is not supplied — there is nothing to check, and a silent
 * pass would look identical to a verified engine. */
export function transactionCheck<TState>(
  model: Pick<MmipModel<TState, unknown>, "origins" | "init" | "applyTransaction">,
  cases: readonly EditStep[]
): TransactionCheckResult {
  if (!model.applyTransaction) {
    throw new Error(
      "transactionCheck: model.applyTransaction is not supplied — this model does not expose a " +
        "SyncTransaction, so invariant 2 and the rejection contract cannot be checked for it. See " +
        "the `applyTransaction` doc comment on `MmipModel` for the thin-bridge shape expected here."
    );
  }
  if (cases.length === 0) {
    throw new Error("transactionCheck: at least one case is required — an empty list trivially passes.");
  }
  const applyTransaction = model.applyTransaction;
  const failures: TransactionFailure[] = [];
  let state = model.init();
  for (let index = 0; index < cases.length; index++) {
    const c = cases[index];
    if (!model.origins.includes(c.origin)) {
      throw new Error(`transactionCheck: origin "${c.origin}" is not declared in model.origins.`);
    }
    const before = state;
    const tx = applyTransaction(state, c.origin, c.edit);
    const fail = (reason: string) => failures.push({ index, origin: c.origin, edit: c.edit, reason });

    if (!deepEqual(tx.before, before)) {
      fail("tx.before does not match the state this edit was actually applied to.");
    }
    if (tx.origin !== c.origin) {
      fail(`tx.origin ("${tx.origin}") does not match the driving origin ("${c.origin}").`);
    }

    if (tx.rejected) {
      if (tx.changed) fail("a rejected transaction reports changed: true — a refusal is never a change.");
      if (tx.ops.length !== 0) fail("a rejected transaction carries non-empty ops — a refusal moved nothing to describe.");
      if (!deepEqual(tx.after, tx.before)) fail("a rejected transaction's after differs from before — a refusal must not mutate state.");
      if (!tx.rejection || !tx.rejection.code || !tx.rejection.message) {
        fail("a rejected transaction is missing rejection.code and/or rejection.message.");
      }
    } else if (!tx.changed) {
      if (tx.ops.length !== 0) fail("an accepted, unchanged (no-op) transaction carries non-empty ops.");
      if (!deepEqual(tx.after, tx.before)) fail("changed: false but tx.after differs from tx.before.");
    } else {
      if (tx.ops.length === 0) fail("a changed, accepted transaction carries no ops — nothing for a motion layer to animate.");
      if (deepEqual(tx.after, tx.before)) fail("changed: true but tx.after equals tx.before.");
      tx.ops.forEach((op, opIndex) => {
        if (!op.sides || op.sides.length === 0) {
          fail(`op[${opIndex}] has empty sides — an operation with no holders has nothing on stage.`);
        }
      });
    }

    state = tx.after;
  }
  return { ok: failures.length === 0, failures, casesRun: cases.length };
}

// ---------------------------------------------------------------------------------------------
// 8. evaluatorRendererAgreement (kept with the pure checks — no DOM required; the caller may or
//    may not draw `renderText` from a DOM tree, that is up to them)
// ---------------------------------------------------------------------------------------------

export interface AgreementCase<TSpec, TState> {
  readonly spec: TSpec;
  readonly state: TState;
  readonly label?: string;
}

export interface AgreementFailure<TSpec, TState> {
  readonly index: number;
  readonly label: string | undefined;
  readonly spec: TSpec;
  readonly state: TState;
  readonly truth: unknown;
  readonly renderedText: string;
}

export interface AgreementResult<TSpec, TState> {
  readonly ok: boolean;
  readonly failures: readonly AgreementFailure<TSpec, TState>[];
}

/** For every `{ spec, state }` case, compute the grading truth (`evaluate`) and the displayed
 * representation (`renderText`), and assert `agrees(truth, renderedText)` — caller-supplied,
 * because what "agreement" means is domain-specific (a balance's "balanced"/"not balanced" text
 * must match a boolean; a numeric readout must match a rounded truth to the same precision; a
 * multiple-choice highlight must match the graded index). The one invariant every MMIP engine
 * needs is this one: the grader and the picture the learner is looking at must never tell two
 * different stories about the same state. */
export function evaluatorRendererAgreement<TSpec, TState>(
  cases: readonly AgreementCase<TSpec, TState>[],
  evaluate: (spec: TSpec, state: TState) => unknown,
  renderText: (spec: TSpec, state: TState) => string,
  agrees: (truth: unknown, renderedText: string) => boolean
): AgreementResult<TSpec, TState> {
  if (cases.length === 0) {
    throw new Error("evaluatorRendererAgreement: at least one case is required.");
  }
  const failures: AgreementFailure<TSpec, TState>[] = [];
  cases.forEach((c, index) => {
    const truth = evaluate(c.spec, c.state);
    const renderedText = renderText(c.spec, c.state);
    if (!agrees(truth, renderedText)) {
      failures.push({ index, label: c.label, spec: c.spec, state: c.state, truth, renderedText });
    }
  });
  return { ok: failures.length === 0, failures };
}

// =================================================================================================
// jsdom helpers (checks 5–7) — everything below this line touches `window`/`Element` and is only
// meaningful under `// @vitest-environment jsdom`. Nothing above this line does.
// =================================================================================================

// ---------------------------------------------------------------------------------------------
// 5a. keyboardParityCheck
// ---------------------------------------------------------------------------------------------

const NATIVELY_FOCUSABLE_TAGS = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA"]);

function isNativelyFocusable(el: Element): boolean {
  if (el.tagName === "A") return el.hasAttribute("href");
  if (NATIVELY_FOCUSABLE_TAGS.has(el.tagName)) return !(el as HTMLButtonElement).disabled;
  return false;
}

function hasExplicitTabStop(el: Element): boolean {
  const raw = el.getAttribute("tabindex");
  if (raw === null) return false;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0;
}

/** A genuinely DISABLED control offers no affordance at all — neither to a pointer nor to a
 * keyboard. That is a legitimate, equally-disabled state on both channels, not a keyboard-specific
 * gap, so `keyboardParityCheck` exempts it rather than flagging it: a coefficient stepper correctly
 * disabled at its bound (S209's solveBalance equation strip, `docs/MMIP_V1_API.md` §5) must not
 * register as a parity failure just because a disabled native `<button>` drops out of the tab
 * order — a mouse cannot activate it either.
 *
 * DELIBERATELY the `disabled` IDL property ONLY — never `aria-disabled` (S209 adversarial review,
 * condition S1). `aria-disabled` is advisory: it neither prevents pointer activation nor removes
 * an element from the tab order, so `<div role="button" aria-disabled="true" onClick>` is pointer-
 * operable and keyboard-reachable exactly as much as it would be without the attribute — it is the
 * standard pattern for keeping a control focusable and announceable while visually inert. Treating
 * it as exempt would take an author's word for "equally unavailable to both channels" on faith
 * where the platform gives no such guarantee, and would silently hide the one shape this check
 * exists to catch: `<div onClick>` with no keyboard path at all. Only `el.disabled === true` is
 * exempt, because only the platform — not an attribute an author controls — enforces that promise. */
function isDisabledForInteraction(el: Element): boolean {
  return (el as { disabled?: boolean }).disabled === true;
}

/** Default "does this element have a keyboard path" test: natively focusable (a real `<button>`,
 * an `<a href>`, a form control) or explicitly given a non-negative `tabindex`. Both are necessary
 * conditions for Enter/Space activation to reach the element at all — a `<div onClick>` with
 * neither is a pointer-only affordance, full stop, regardless of what handler is wired to it. */
function defaultKeyboardReachable(el: Element): boolean {
  return isNativelyFocusable(el) || hasExplicitTabStop(el);
}

export interface KeyboardParityFailure {
  readonly group: string;
  readonly selector: string;
  readonly index: number;
  readonly description: string;
}

export interface KeyboardParityResult {
  readonly ok: boolean;
  readonly failures: readonly KeyboardParityFailure[];
  readonly checked: number;
}

export interface KeyboardParityOptions {
  /** Named CSS selectors, one per kind of pointer affordance the widget advertises (e.g.
   * `{ tile: '[data-role="tile"]', term: '[data-testid^="sb-term-"]' }`). A bare string is
   * shorthand for a single unnamed group. */
  readonly pointerSelectors: string | Record<string, string>;
  /** Override the default native-focusable-or-tabindex test, e.g. to also require a `role` the
   * default test does not know about. */
  readonly isKeyboardReachable?: (el: Element) => boolean;
}

function describeElement(el: Element): string {
  const id = el.getAttribute("data-testid") ?? el.getAttribute("id");
  return `<${el.tagName.toLowerCase()}${id ? ` "${id}"` : ""}>`;
}

/** Given a rendered widget container, assert every pointer affordance matching `pointerSelectors`
 * has a keyboard path (see `defaultKeyboardReachable`). Refuses to run — for each named group —
 * against a selector that leaves nothing ELIGIBLE to certify: neither a selector that matches zero
 * elements (the widget was never rendered) nor one whose every match is exempt as genuinely
 * disabled (S209 adversarial review, condition S2 — the first guard alone let a selector matching
 * only disabled controls, e.g. a fully disabled `reveal`-state render, return `{ ok: true, checked:
 * 0 }`, which is exactly the trivial pass this check exists to refuse). Both are a refusal to run,
 * not a silent pass: a check that can always find a way to report `ok: true` is decoration. */
export function keyboardParityCheck(container: ParentNode, opts: KeyboardParityOptions): KeyboardParityResult {
  const groups: Record<string, string> =
    typeof opts.pointerSelectors === "string" ? { default: opts.pointerSelectors } : opts.pointerSelectors;
  if (Object.keys(groups).length === 0) {
    throw new Error("keyboardParityCheck: pointerSelectors must name at least one selector.");
  }
  const reachable = opts.isKeyboardReachable ?? defaultKeyboardReachable;
  const failures: KeyboardParityFailure[] = [];
  let checked = 0;
  for (const [group, selector] of Object.entries(groups)) {
    const els = Array.from(container.querySelectorAll(selector));
    if (els.length === 0) {
      throw new Error(
        `keyboardParityCheck: selector "${selector}" (group "${group}") matched no elements — this ` +
          "check refuses to trivially pass over a widget that was never rendered."
      );
    }
    const eligible = els.filter((el) => !isDisabledForInteraction(el));
    if (eligible.length === 0) {
      throw new Error(
        `keyboardParityCheck: selector "${selector}" (group "${group}") matched ${els.length} ` +
          "element(s), but every one of them is genuinely disabled — there is nothing eligible left " +
          "to certify as keyboard-reachable. If this group is legitimately inert in the render under " +
          "test (e.g. every control disabled for a finished/revealed state), exclude that group from " +
          "`pointerSelectors` for this render rather than letting an all-exempt group report ok: true."
      );
    }
    eligible.forEach((el, index) => {
      checked += 1;
      if (!reachable(el)) {
        failures.push({
          group,
          selector,
          index,
          description: `${describeElement(el)} advertises a pointer affordance (group "${group}") but has ` +
            "no keyboard path: it is not natively focusable and has no tabindex >= 0.",
        });
      }
    });
  }
  return { ok: failures.length === 0, failures, checked };
}

// ---------------------------------------------------------------------------------------------
// 5b. srStateCheck
// ---------------------------------------------------------------------------------------------

export interface SrStateOptions {
  /** Substrings that must ALL appear somewhere in the collected accessible text, each derived
   * independently of the render (e.g. computed straight from the spec/state, not copy-pasted from
   * the component's own template string). Must be non-empty. */
  readonly expectedSubstrings: readonly string[];
  /** Elements whose accessible text is collected. Defaults to every live region / status role and
   * every `aria-label`, which is where a widget is expected to say what it is currently doing. */
  readonly liveRegionSelector?: string;
}

export interface SrStateResult {
  readonly ok: boolean;
  readonly missing: readonly string[];
  readonly combinedText: string;
}

const DEFAULT_LIVE_REGION_SELECTOR = '[aria-live], [role="status"], [role="alert"], [aria-label]';

/** Given a rendered widget container and a list of substrings the caller has computed
 * INDEPENDENTLY from the mathematical state (never copy-pasted from the widget's own template),
 * assert every one of them appears somewhere in the accessible text (`aria-label` values and the
 * text content of live/status regions). This is what proves a screen-reader user is told the same
 * mathematical fact a sighted user sees on the pans — not merely that SOME text is present. */
export function srStateCheck(container: ParentNode, opts: SrStateOptions): SrStateResult {
  if (opts.expectedSubstrings.length === 0) {
    throw new Error("srStateCheck: expectedSubstrings must be non-empty — an empty list trivially passes.");
  }
  const selector = opts.liveRegionSelector ?? DEFAULT_LIVE_REGION_SELECTOR;
  const els = Array.from(container.querySelectorAll(selector));
  const roots = container instanceof Element ? [container] : [];
  const parts: string[] = [];
  for (const el of [...roots, ...els]) {
    const label = el.getAttribute("aria-label");
    if (label) parts.push(label);
    parts.push(el.textContent ?? "");
  }
  const combinedText = parts.join(" \n ");
  const missing = opts.expectedSubstrings.filter((s) => !combinedText.includes(s));
  return { ok: missing.length === 0, missing, combinedText };
}

// ---------------------------------------------------------------------------------------------
// 6. answerLeakCheck
// ---------------------------------------------------------------------------------------------

export interface AnswerLeakResult {
  readonly ok: boolean;
  readonly leaked: readonly string[];
}

/** Given a rendered container and the answer spelled out in every format it might leak in
 * (`"3/4"`, `"0.75"`, `"seventy-five percent"`, a raw `data-*` debug attribute), assert NONE of
 * them appear anywhere in the rendered tree before reveal — not in visible text, not in an
 * `aria-label`, not in a `title`, not in any other attribute value. A leak in an attribute a
 * sighted learner never sees is still a leak: dev tools and a screen reader both read attributes,
 * and a `data-answer="4"` left on a DOM node for "debugging" is exactly the kind of thing this
 * check exists to catch. */
export function answerLeakCheck(container: Element, forbidden: readonly string[]): AnswerLeakResult {
  if (forbidden.length === 0) {
    throw new Error("answerLeakCheck: forbidden must list at least one answer string.");
  }
  const all = [container, ...Array.from(container.querySelectorAll("*"))];
  const texts: string[] = [];
  for (const el of all) {
    for (const attr of Array.from(el.attributes)) texts.push(attr.value);
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3 /* Node.TEXT_NODE */) texts.push(child.textContent ?? "");
    }
  }
  const combined = texts.join(" \n ");
  const leaked = forbidden.filter((s) => combined.includes(s));
  return { ok: leaked.length === 0, leaked };
}

// ---------------------------------------------------------------------------------------------
// 7. reducedMotionCheck
// ---------------------------------------------------------------------------------------------

/** Installs a `window.matchMedia` stub that reports `matches: <matches>` for
 * `(prefers-reduced-motion: reduce)` and `false` for every other query, and returns a function
 * that restores whatever `matchMedia` was before. `vitest.setup.ts` already installs a permanent
 * OFF stub feature-detected for a missing `matchMedia`; this helper temporarily overrides it (and
 * restores the prior value, whatever it was) so a test can assert the reduced-motion branch
 * specifically without leaking that override into any other test. */
export function stubPrefersReducedMotion(matches: boolean): () => void {
  if (typeof window === "undefined") {
    throw new Error("stubPrefersReducedMotion: no `window` — this helper only runs under jsdom.");
  }
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: /prefers-reduced-motion:\s*reduce/.test(query) ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

export interface ReducedMotionOptions {
  /** Renders (or re-renders) the component with `prefers-reduced-motion: reduce` already active,
   * returning the container to assert against. */
  readonly render: () => Element;
  /** Caller's assertion that the render is MEANINGFUL under reduced motion — not merely present.
   * Throw (e.g. via `expect(...)`) to fail. A component that communicates state only through an
   * in-flight animation (a sliding tile, a growing bar) and renders an empty shell the instant
   * motion is suppressed is exactly what this exists to catch. */
  readonly assertMeaningful: (container: Element) => void;
}

/** Runs `opts.render` with `prefers-reduced-motion: reduce` active (via `stubPrefersReducedMotion`,
 * always restored afterward, even on failure) and hands the result to `opts.assertMeaningful`. */
export function reducedMotionCheck(opts: ReducedMotionOptions): void {
  const restore = stubPrefersReducedMotion(true);
  try {
    const container = opts.render();
    opts.assertMeaningful(container);
  } finally {
    restore();
  }
}
