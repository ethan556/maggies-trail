# Representation Synchronization Graph (RSG) — the contract

`src/lib/mmip/repSyncGraph.ts` (engine) · `src/lib/mmip/lineFamilyModel.ts` (first proof) ·
`src/components/widgets.tsx` `LineExploreW` (first adopter)

A multi-representation manipulative usually elects one representation as "the real one". The moment
a second becomes editable it grows a second source of truth, and the two drift. The RSG removes
the possibility instead of testing for it.

## The contract

**Nodes.** One canonical state `C`. Each representation is a node holding a *derived view* — a pure
function of `C`, a rendering payload, never read back as model input. The canonical node (`model`)
is display-only, so nothing can mutate state except through a representation.

**Edges.** Two pure functions per node: `derive: C -> V`, and `absorb: (C, E) -> AbsorbOutcome<C>`
— omit `absorb` and the node is read-only *at compile time* (`EditOf` resolves to `never`).
`AbsorbOutcome` is `{ ok: true, canonical, clamp? }` or `{ ok: false, code, reason, detail? }`.
Rejection is the default for any state the model cannot represent, and `reason` is mathematical
prose ("a run of 0 describes a vertical line, and a vertical line is not the graph of y = mx + b").
Clamping happens only where the model declares a policy, and every clamp still returns a note.

**Transaction.** `apply(rep, edit)` is exactly: origin absorbs → canonical replaced → **every**
view re-derived. Depth is always 1; the graph is a star, so it is acyclic per transaction by
construction. Re-entering `apply` from inside an `absorb` throws (`reentrant-edit`).

**Guarantees that follow structurally, not by discipline.**

| Property | Why it holds |
| --- | --- |
| No stale views | Commit *always* recomputes all views; no incremental path exists. `verifyFresh()` must always return `[]`, asserted after every edit of a 100-edit walk. |
| Determinism | `absorbEdit` / `deriveViews` are free functions of `(reps, canonical, edit)`. |
| Equivalence classes | Views are a pure function of the canonical alone, so equal canonical ⇒ byte-identical views. `state.key` (a sorted-key structural fingerprint) names the class. |
| Views are inert | Every derived payload is deep-frozen; writing to one throws. |
| Undo | Whole canonical snapshots, so restoration is exact. Edits sharing a `gesture` id collapse into one entry — a 40-sample drag is one thing the learner did. |
| Motion | `state.origin` records rep, edit, gesture, status, revisions, clamp/rejection, and `changedViews` — which representations must move — with no diffing. |

## How an engine adopts it

1. Define a canonical state that stores **only** independent facts. If a value is derivable, do not
   store it — that is precisely the second source of truth being abolished.
2. Write `derive` per representation and `absorb` per *editable* representation.
3. Assemble a `CanonicalModel` factory per problem (`lineFamilyCanonicalModel`,
   `slopeTriangleCanonicalModel`) exposing `views`, `representations` and `createGraph`, and have
   the renderer reach nothing else — pin it at source level so the seam stays load-bearing.
4. Render from `model.views(state)`; subscribe with `graph.subscribe` (shaped for
   `useSyncExternalStore`), or serialize with `snapshots()`/`RepSyncConfig.history`.
5. MMIP bridge: `toSyncTransaction(before, result, origin, ops)` produces the `SyncTransaction`;
   the engine supplies the named `MmipOperation`s, and `mmipHarness.transactionCheck` verifies it.

## The line family (first proof)

`LineCanonical` stores `m`, `b` (exact rationals), `anchorX` + `run`, `domain`, `window`, `context`,
`policy`. Not stored, because derivable: rise (`m·run`), anchor y, table rows, equation strings,
lattice points. Five editable origins converge on it: `equation`, `graph` (dragPoint: `intercept`
slides / `unit` tilts about (0,b) / `free` pivots about the anchor), `table`, `triangle`, `context`.

**Numeric policy.** No floating point mathematics is ever stored. `Rat` is an exact rational in
lowest terms with a positive safe-integer denominator; arithmetic is integer arithmetic, and
leaving the safe range is a `rational-overflow` rejection rather than a silent approximation.
Floats cross the boundary once, inbound, through `ratFromNumber`, so drift is *zero*, not bounded
— the suite asserts bit-identical state after 500 drag/table round trips and 400 float-sourced
slope edits. A state is accepted only if every representation derives exactly, so the model never
holds a state it cannot show.

**Rejection catalogue** (each carries prose): `run-zero`, `pivot-at-intercept`, `pivot-at-anchor`,
`table-not-collinear`, `table-duplicate-input`, `table-vertical`, `table-underdetermined`,
`table-pivot-at-zero`, `table-row-missing`, `domain-step-zero`, `domain-count-out-of-range`,
`slope|intercept-out-of-range`, `slope|intercept-off-lattice`, `rational-overflow`.

## Decisions and wiring history

Settled decisions and the adopter-by-adopter wiring record live in **`docs/RSG_DECISIONS.md`**
(append-only): the vertical-line decision (S209 — the slope triangle's canonical object is a pair
of legs, so `LineCanonical` stays total), the two-line decision (S210 — `LinePairCanonical` is its
own type because a node reading two canonicals cannot exist in this contract), and the wiring
status of every adopter. Read that file before re-opening any of them.

## Undo ownership (settled, S209)

`repSyncGraph` owns undo: the only stack, whole canonical snapshots, gesture coalescing built in.
A widget keeps no state history — each adopter's `planStack` is a MOTION history popped in
lockstep, never a second source of positions. The graph outlives renders but the props are the
authority, so an external value change calls `reset(canonical, { history: "clear" })`.

## Open questions

1. **Where clamp notes surface.** Both adopters use a visually hidden `aria-live` region so the visual rendering stays byte-identical. Should a snap also be visible?
2. **Player history.** The player has its own step history; no collision yet, but check before a third widget adopts undo.
