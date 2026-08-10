/**
 * Representation Synchronization Graph (RSG) — MMIP wave 1, Session 208.
 *
 * The problem this solves: a manipulative that shows a mathematical object in several
 * representations (graph, equation, table, diagram, sentence) usually picks ONE of them as the
 * "real" one and lets the others read from it. The moment a second representation becomes
 * editable, the widget grows a second source of truth, and the two drift — the classic
 * stale-state bug that makes multi-representation manipulatives feel untrustworthy.
 *
 * The RSG removes the possibility rather than testing for it:
 *
 *   - There is exactly ONE canonical state `C`. Nothing else stores mathematics.
 *   - Every representation is a NODE holding a *derived view* — a pure function of `C`.
 *     A view is a rendering payload. It is never read back as input to the model.
 *   - An edge is a pair of pure functions:
 *       derive : C -> V              (canonical -> what this representation shows)
 *       absorb : (C, E) -> Outcome   (an edit made *in* this representation -> new canonical,
 *                                     or a rejection carrying a mathematical reason)
 *   - Propagation for one edit is exactly: origin.absorb -> canonical replaced -> EVERY view
 *     re-derived from the new canonical. Depth is always 1. The graph is a star, so it is
 *     acyclic per transaction by construction, not by convention.
 *   - Stale state is impossible because commit ALWAYS recomputes every view from scratch.
 *     No view caches a canonical field, and no partial/incremental update path exists.
 *   - Determinism: `absorbEdit` and `deriveViews` are exported as free functions. Given the
 *     same (canonical, rep, edit) they return the same outcome forever, independent of the
 *     graph instance, history, or call order.
 *   - Equivalence classes: because views are a pure function of the canonical alone, any two
 *     edit sequences that land on the same canonical state necessarily produce byte-identical
 *     views. `state.key` is a stable structural fingerprint that names the class.
 *
 * The engine is deliberately ignorant of mathematics, React, SVG and time. It knows about
 * canonical states, pure edges, history and an edit-origin record. A model module (see
 * `lineFamilyModel.ts`) supplies the mathematics; a widget supplies the pixels.
 */

import type {
  EditOrigin as MmipEditOrigin,
  MmipOperation,
  SyncTransaction
} from "./mmipTypes";

/** A short machine code plus a sentence a learner (or a test) can read. */
export type AbsorbNote = { readonly code: string; readonly reason: string };

/**
 * The result of absorbing an edit.
 *
 * `ok: true` with no `clamp` — the edit was taken exactly as offered.
 * `ok: true` with `clamp`   — the model has an EXPLICITLY DECLARED clamp/snap policy and it
 *                             fired. The adjustment is reported, never silent.
 * `ok: false`               — the edit describes a state the model cannot represent. The
 *                             canonical state is untouched and `reason` says why in
 *                             mathematical terms.
 */
export type AbsorbOutcome<C> =
  | { readonly ok: true; readonly canonical: C; readonly clamp?: AbsorbNote }
  | {
      readonly ok: false;
      readonly code: string;
      readonly reason: string;
      readonly detail?: Readonly<Record<string, unknown>>;
    };

/** One representation node. Omit `absorb` to declare the node read-only (display-only). */
export type RepDef<C, V, E> = {
  readonly label?: string;
  readonly derive: (canonical: C) => V;
  readonly absorb?: (canonical: C, edit: E) => AbsorbOutcome<C>;
};

/**
 * The node table. `unknown` view / `never` edit keep the constraint free of `any`; the concrete
 * per-node types survive on the literal object and are recovered by `ViewOf` / `EditOf`.
 */
export type RepMap<C> = {
  readonly [id: string]: {
    readonly label?: string;
    readonly derive: (canonical: C) => unknown;
    readonly absorb?: (canonical: C, edit: never) => AbsorbOutcome<C>;
  };
};

export type ViewOf<R> = R extends { derive: (canonical: never) => infer V } ? V : never;
/** `never` for read-only nodes — a missing `absorb` makes `apply` un-callable at compile time. */
export type EditOf<R> = R extends { absorb: (canonical: never, edit: infer E) => unknown } ? E : never;

export type RepId<M> = Extract<keyof M, string>;
export type RepViews<C, M extends RepMap<C>> = { readonly [K in keyof M]: ViewOf<M[K]> };

/**
 * The provenance of the most recent transaction. A motion layer reads this to answer "what did
 * the learner just touch, and which other representations must now move?" without diffing.
 */
export type EditOrigin<C, M extends RepMap<C>> = {
  readonly rep: RepId<M>;
  readonly edit: unknown;
  readonly gesture: string | null;
  readonly status: "applied" | "unchanged" | "rejected";
  readonly fromRevision: number;
  readonly toRevision: number;
  /** Views whose derived payload actually changed. Empty on `unchanged` and `rejected`. */
  readonly changedViews: readonly RepId<M>[];
  readonly beforeKey: string;
  readonly afterKey: string;
  readonly clamp?: AbsorbNote;
  readonly rejection?: AbsorbNote;
};

export type RepSyncState<C, M extends RepMap<C>> = {
  readonly canonical: C;
  readonly views: RepViews<C, M>;
  readonly revision: number;
  /** Stable structural fingerprint of `canonical` — the name of its equivalence class. */
  readonly key: string;
  readonly origin: EditOrigin<C, M> | null;
};

export type ApplyResult<C, M extends RepMap<C>> = {
  readonly status: "applied" | "unchanged" | "rejected";
  readonly state: RepSyncState<C, M>;
  readonly origin: EditOrigin<C, M>;
  readonly code?: string;
  readonly reason?: string;
  readonly detail?: Readonly<Record<string, unknown>>;
};

export type ApplyOptions = {
  /**
   * Consecutive edits sharing a gesture id collapse into ONE undo entry — a 40-sample drag is
   * one thing the learner did, not forty. Any edit without a gesture id (or with a different
   * one) starts a fresh entry.
   */
  readonly gesture?: string;
};

export class RepSyncError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "RepSyncError";
    this.code = code;
  }
}

/* ------------------------------------------------------------------ *
 * structural helpers                                                  *
 * ------------------------------------------------------------------ */

/**
 * Deterministic structural serialization: sorted keys, explicit tags for the JSON-hostile
 * values. Used for equivalence-class identity, staleness detection and change detection, so it
 * must never depend on property insertion order.
 */
export function stableKey(value: unknown): string {
  return write(value, new WeakSet<object>());
}

function write(value: unknown, seen: WeakSet<object>): string {
  if (value === null) return "null";
  const t = typeof value;
  if (t === "undefined") return "undef";
  if (t === "number") {
    const n = value as number;
    if (Number.isNaN(n)) return "nan";
    if (n === Infinity) return "+inf";
    if (n === -Infinity) return "-inf";
    return Object.is(n, -0) ? "0" : String(n);
  }
  if (t === "boolean") return value === true ? "true" : "false";
  if (t === "bigint") return `big:${String(value)}`;
  if (t === "string") return JSON.stringify(value);
  if (t === "function") throw new RepSyncError("unserializable-state", "canonical state and views must not contain functions");
  const obj = value as object;
  if (seen.has(obj)) throw new RepSyncError("cyclic-state", "canonical state and views must be acyclic");
  seen.add(obj);
  let out: string;
  if (Array.isArray(obj)) {
    out = `[${obj.map((item) => write(item, seen)).join(",")}]`;
  } else {
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    out = `{${keys
      .map((k) => `${JSON.stringify(k)}:${write((obj as Record<string, unknown>)[k], seen)}`)
      .join(",")}}`;
  }
  seen.delete(obj);
  return out;
}

/** Freeze a derived payload so a renderer physically cannot write mathematics back into a view. */
export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value as Record<string, unknown>)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  if (Array.isArray(value)) for (const item of value) deepFreeze(item);
  return value;
}

/* ------------------------------------------------------------------ *
 * pure edges (no instance required)                                   *
 * ------------------------------------------------------------------ */

/** Re-derive every representation from a canonical state. The only way a view is ever produced. */
export function deriveViews<C, M extends RepMap<C>>(reps: M, canonical: C): RepViews<C, M> {
  const out: Record<string, unknown> = {};
  for (const id of Object.keys(reps)) out[id] = deepFreeze(reps[id]!.derive(canonical));
  return deepFreeze(out) as unknown as RepViews<C, M>;
}

/**
 * Pure absorb: the whole mathematical content of a transaction, with no graph, history or
 * mutation involved. Determinism tests call this directly.
 */
export function absorbEdit<C, M extends RepMap<C>>(
  reps: M,
  canonical: C,
  rep: RepId<M>,
  edit: unknown
): AbsorbOutcome<C> {
  const def = reps[rep];
  if (!def) {
    return { ok: false, code: "unknown-representation", reason: `there is no representation named "${String(rep)}"` };
  }
  if (!def.absorb) {
    return {
      ok: false,
      code: "read-only-representation",
      reason: `the "${String(rep)}" representation is derived only; it cannot originate an edit`
    };
  }
  return (def.absorb as (c: C, e: unknown) => AbsorbOutcome<C>)(canonical, edit);
}

/* ------------------------------------------------------------------ *
 * the graph                                                           *
 * ------------------------------------------------------------------ */

export type RepSyncGraph<C, M extends RepMap<C>> = {
  readonly repIds: readonly RepId<M>[];
  getState(): RepSyncState<C, M>;
  getCanonical(): C;
  view<K extends keyof M>(rep: K): ViewOf<M[K]>;
  editable(rep: string): boolean;
  apply<K extends keyof M>(rep: K, edit: EditOf<M[K]>, options?: ApplyOptions): ApplyResult<C, M>;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): RepSyncState<C, M> | null;
  redo(): RepSyncState<C, M> | null;
  /**
   * Replace the canonical state outright (authoring, lesson reset, or a controlled host whose
   * props are the authority). `history: "push"` (the default) makes the replacement itself
   * undoable; `history: "clear"` drops the stack, which is what an EXTERNAL replacement means —
   * the moves on the stack belonged to a position that no longer exists, so offering to step back
   * into them would be offering to step back into a different problem.
   */
  reset(canonical: C, options?: { readonly history?: "push" | "clear" }): RepSyncState<C, M>;
  /** Fingerprints of the canonical states currently on the undo stack, oldest first. */
  history(): readonly string[];
  /**
   * The undo stack itself — whole canonical states, oldest first. Together with
   * `RepSyncConfig.history` this makes a graph SERIALIZABLE: a host that cannot keep a live
   * instance (a controlled React widget, a test adapter that must be a pure function of its
   * arguments) can round-trip the graph without reimplementing undo beside it.
   */
  snapshots(): readonly C[];
  /**
   * Diagnostic: recompute every view and report any that differs from the stored one. By the
   * construction above this must ALWAYS return `[]`; the test suite asserts it after every edit
   * of a long random walk, which is what turns "no stale state" from a claim into a check.
   */
  verifyFresh(): readonly RepId<M>[];
  subscribe(listener: (state: RepSyncState<C, M>) => void): () => void;
};

export type RepSyncConfig<C, M extends RepMap<C>> = {
  readonly canonical: C;
  readonly reps: M;
  /**
   * Seed the undo stack, oldest first — the other half of `snapshots()`. Entries beyond
   * `historyLimit` are dropped from the oldest end, exactly as pushing them would have.
   */
  readonly history?: readonly C[];
  /** Undo depth. Snapshots are whole canonical states — small, and exact by definition. */
  readonly historyLimit?: number;
};

export function createRepSyncGraph<C, M extends RepMap<C>>(config: RepSyncConfig<C, M>): RepSyncGraph<C, M> {
  const reps = config.reps;
  const ids = Object.keys(reps) as RepId<M>[];
  if (ids.length === 0) throw new RepSyncError("empty-graph", "a representation graph needs at least one node");
  const limit = config.historyLimit ?? 100;

  let canonical = deepFreeze(config.canonical);
  let views = deriveViews(reps, canonical);
  let revision = 0;
  let key = stableKey(canonical);
  let state: RepSyncState<C, M> = Object.freeze({ canonical, views, revision, key, origin: null });

  const undoStack: { canonical: C; key: string; gesture: string | null }[] = (config.history ?? [])
    .map((entry) => ({ canonical: deepFreeze(entry), key: stableKey(entry), gesture: null }))
    .slice(-limit);
  const redoStack: { canonical: C; key: string }[] = [];
  let lastGesture: string | null = null;
  let inTransaction = false;
  const listeners = new Set<(s: RepSyncState<C, M>) => void>();

  const notify = (): void => {
    for (const listener of [...listeners]) listener(state);
  };

  /** Commit a new canonical state: replace it, RE-DERIVE EVERYTHING, publish. No other path. */
  const commit = (next: C, origin: Omit<EditOrigin<C, M>, "changedViews" | "toRevision">): RepSyncState<C, M> => {
    const previousViews = views;
    canonical = deepFreeze(next);
    views = deriveViews(reps, canonical);
    key = origin.afterKey;
    revision += 1;
    const changed = ids.filter((id) => stableKey(views[id]) !== stableKey(previousViews[id]));
    state = Object.freeze({
      canonical,
      views,
      revision,
      key,
      origin: Object.freeze({ ...origin, toRevision: revision, changedViews: Object.freeze(changed) })
    });
    return state;
  };

  /** A transaction that did not move the canonical state still updates provenance. */
  const publishOrigin = (origin: Omit<EditOrigin<C, M>, "changedViews" | "toRevision">): RepSyncState<C, M> => {
    revision += 1;
    state = Object.freeze({
      canonical,
      views,
      revision,
      key,
      origin: Object.freeze({ ...origin, toRevision: revision, changedViews: Object.freeze([] as RepId<M>[]) })
    });
    return state;
  };

  const pushHistory = (gesture: string | null): void => {
    const coalesce = gesture !== null && gesture === lastGesture;
    if (!coalesce) {
      undoStack.push({ canonical, key, gesture });
      while (undoStack.length > limit) undoStack.shift();
    }
    redoStack.length = 0;
    lastGesture = gesture;
  };

  const graph: RepSyncGraph<C, M> = {
    repIds: Object.freeze(ids),
    getState: () => state,
    getCanonical: () => canonical,
    view: <K extends keyof M>(rep: K) => {
      if (!(rep in reps)) throw new RepSyncError("unknown-representation", `there is no representation named "${String(rep)}"`);
      return views[rep];
    },
    editable: (rep) => Boolean(reps[rep]?.absorb),

    apply<K extends keyof M>(rep: K, edit: EditOf<M[K]>, options?: ApplyOptions): ApplyResult<C, M> {
      if (inTransaction) {
        // The star topology only holds if an absorb never re-enters the graph. Enforced, not
        // trusted: a derive/absorb that calls back in is a design error, reported as one.
        throw new RepSyncError(
          "reentrant-edit",
          "absorb and derive must be pure: a representation may not apply an edit while another edit is propagating"
        );
      }
      const repId = rep as unknown as RepId<M>;
      const gesture = options?.gesture ?? null;
      const fromRevision = revision;
      const beforeKey = key;
      inTransaction = true;
      let outcome: AbsorbOutcome<C>;
      try {
        outcome = absorbEdit(reps, canonical, repId, edit);
      } finally {
        inTransaction = false;
      }

      if (!outcome.ok) {
        const rejection: AbsorbNote = { code: outcome.code, reason: outcome.reason };
        const next = publishOrigin({
          rep: repId,
          edit,
          gesture,
          status: "rejected",
          fromRevision,
          beforeKey,
          afterKey: beforeKey,
          rejection
        });
        notify();
        return {
          status: "rejected",
          state: next,
          origin: next.origin!,
          code: outcome.code,
          reason: outcome.reason,
          ...(outcome.detail ? { detail: outcome.detail } : {})
        };
      }

      const afterKey = stableKey(outcome.canonical);
      if (afterKey === beforeKey) {
        const next = publishOrigin({
          rep: repId,
          edit,
          gesture,
          status: "unchanged",
          fromRevision,
          beforeKey,
          afterKey,
          ...(outcome.clamp ? { clamp: outcome.clamp } : {})
        });
        notify();
        return { status: "unchanged", state: next, origin: next.origin! };
      }

      pushHistory(gesture);
      const next = commit(outcome.canonical, {
        rep: repId,
        edit,
        gesture,
        status: "applied",
        fromRevision,
        beforeKey,
        afterKey,
        ...(outcome.clamp ? { clamp: outcome.clamp } : {})
      });
      notify();
      return { status: "applied", state: next, origin: next.origin! };
    },

    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,

    undo() {
      const entry = undoStack.pop();
      if (!entry) return null;
      redoStack.push({ canonical, key });
      lastGesture = null;
      const next = commit(entry.canonical, {
        rep: ids[0]!,
        edit: { kind: "undo" },
        gesture: null,
        status: "applied",
        fromRevision: revision,
        beforeKey: key,
        afterKey: entry.key
      });
      notify();
      return next;
    },

    redo() {
      const entry = redoStack.pop();
      if (!entry) return null;
      undoStack.push({ canonical, key, gesture: null });
      lastGesture = null;
      const next = commit(entry.canonical, {
        rep: ids[0]!,
        edit: { kind: "redo" },
        gesture: null,
        status: "applied",
        fromRevision: revision,
        beforeKey: key,
        afterKey: entry.key
      });
      notify();
      return next;
    },

    reset(nextCanonical: C, options?: { readonly history?: "push" | "clear" }) {
      const afterKey = stableKey(nextCanonical);
      const beforeKey = key;
      if ((options?.history ?? "push") === "clear") {
        undoStack.length = 0;
        redoStack.length = 0;
        lastGesture = null;
      } else {
        pushHistory(null);
      }
      const next = commit(nextCanonical, {
        rep: ids[0]!,
        edit: { kind: "reset" },
        gesture: null,
        status: "applied",
        fromRevision: revision,
        beforeKey,
        afterKey
      });
      notify();
      return next;
    },

    history: () => undoStack.map((entry) => entry.key),
    snapshots: () => undoStack.map((entry) => entry.canonical),

    verifyFresh() {
      const fresh = deriveViews(reps, canonical);
      return ids.filter((id) => stableKey(fresh[id]) !== stableKey(views[id]));
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };

  return graph;
}

/* ------------------------------------------------------------------ *
 * MMIP v1 bridge                                                      *
 * ------------------------------------------------------------------ */

/**
 * The RSG and MMIP v1 (`mmipTypes.ts`, O1) describe the same discipline from two directions:
 * MMIP names the CONTRACT an engine signs (one canonical state, edit-origin transactions, no
 * derived-state writes), the RSG is a reusable ENGINE that satisfies it. The mapping is exact:
 *
 *   MMIP `RepresentationBinding.derive`   ≡  `RepDef.derive`
 *   MMIP `CanonicalModel.apply`           ≡  `absorbEdit` + commit (this module's `apply`)
 *   MMIP `SyncTransaction.before/after`   ≡  the canonical snapshots either side of a commit
 *   MMIP `SyncTransaction.source`         ≡  `EditOrigin.rep` — which representation was touched
 *   MMIP `MmipRejection`                  ≡  the `{ code, reason }` of a failed absorb
 *
 * The one thing the RSG adds and MMIP leaves to the engine is the NAMED OPERATIONS: only the
 * model knows that a particular canonical delta means "slide the line up by 3". So the bridge
 * takes them as an argument rather than inventing them.
 *
 * Import is type-only, so the engine keeps zero runtime dependencies.
 */
export function toSyncTransaction<C, M extends RepMap<C>, TTarget extends string = string>(
  before: C,
  result: ApplyResult<C, M>,
  origin: MmipEditOrigin,
  ops: readonly MmipOperation<TTarget>[] = []
): SyncTransaction<C, TTarget> {
  const source = String(result.origin.rep);
  if (result.status === "rejected") {
    return {
      before,
      after: before,
      origin,
      source,
      ops: [],
      changed: false,
      rejected: true,
      rejection: { code: result.code ?? "rejected", message: result.reason ?? "That move is not available here." }
    };
  }
  return {
    before,
    after: result.state.canonical,
    origin,
    source,
    ops: result.status === "applied" ? ops : [],
    changed: result.status === "applied",
    rejected: false
  };
}
