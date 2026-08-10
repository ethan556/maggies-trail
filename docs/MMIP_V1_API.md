# MMIP v1 — the Multi-Modal Interaction Protocol

**Status: FROZEN at Session 208.** Additive change only — new members of `MmipOperationKind`, new
optional fields, new engines. No existing field may change meaning without a version bump.

Source of truth: `src/lib/mmip/mmipTypes.ts`.
First adopter: `src/lib/mmip/solveBalanceModel.ts` (proved in `solveBalanceModel.test.ts` and
`src/components/widgets.mmip.o1.s208.test.tsx`).

---

## 1. What the protocol is for

A manipulative and a piece of notation are usually two programs that agree by accident. MMIP says
they are one program:

> **ONE canonical mathematical state. Every representation on screen is a pure derivation of it.
> A learner may act through any representation; every other representation re-derives.**

It is not that the representations are kept in sync. It is that there is only one thing to be in
sync with.

### The three invariants

1. **Single canonical state.** A representation never holds mathematics of its own. Everything it
   shows comes from `RepresentationBinding.derive(state)`, which is pure and total. No component
   state, no memo, no `useRef` may carry a number the canonical state does not carry. (Perceptual
   state — a hover spotlight, a draft mid-keystroke, whether a panel is open — is *not*
   mathematics and may live in the view. If it can change a graded answer, it is mathematics.)
2. **Edit-origin transactions.** Every mutation is `apply(state, edit, origin, source)` returning a
   `SyncTransaction`. Nothing mutates state outside `apply` — **including undo**, which is an
   ordinary edit (`{ kind: "restore", to }` in solveBalance) and not a second path that rebuilds
   state behind the model's back. The session owns the undo *stack*, because history is not
   mathematics and the model stays historyless; the step back itself is a transaction, normalised on
   the way in, described in words, and compiled to motion like every other move. The transaction
   records who touched what and the named mathematical operations that took `before` into `after`.
3. **No derived-state writes.** A derived view is read-only. An edit made "in" a derived view is
   expressed as an edit to the canonical state, never as a patch of the view. This is what makes
   stale state structurally impossible: there is no second copy to go stale.

### Purity

Models are pure and deterministic. No `Math.random`, no `Date.now`, no network, no ambient mutable
state, no React. Same inputs ⇒ byte-identical outputs, forever. This is what lets a harness replay a
transaction log and a morph layer plan motion offline.

---

## 2. The types

```ts
type EditOrigin = "physical" | "control" | "symbolic" | "system";

type MmipOperationKind =
  | "add" | "subtract" | "cancel" | "divide"
  | "distribute" | "factor" | "negate" | "reorient" | "restore";

interface MmipOperation<TTarget extends string = string> {
  kind: MmipOperationKind;
  target: TTarget;              // which slot of the canonical state this step acts on
  amount: number;               // signed magnitude in the operation's own units; 0 when none
  sides: readonly string[];     // which holders take part — length 1 means ONE-SIDED
  describe: string;             // the mathematics in words, true of the actual numbers
}

interface SyncTransaction<S, TTarget extends string = string> {
  before: S; after: S;
  origin: EditOrigin;
  source: string;               // RepresentationBinding.id the learner touched
  ops: readonly MmipOperation<TTarget>[];
  changed: boolean;             // after differs from before
  rejected: boolean;            // refused: after === before
  rejection?: { code: string; message: string };
}

interface EditableSlot<TTarget extends string = string> {
  target: TTarget; value: number; min: number; max: number; step: number;
  editable: boolean; lockedReason?: string;
  meaning: string;              // what the number IS — never "slider at 3"
}

interface RepresentationBinding<S, V> {
  id: string; label: string;
  derive: (state: S) => V;
  editable: (state: S) => boolean;
}

interface CanonicalModel<S, E, TTarget extends string = string> {
  id: string;
  initial: S;
  normalize: (raw: unknown) => S;                                    // never throws
  apply: (s: S, e: E, origin: EditOrigin, source: string) => SyncTransaction<S, TTarget>;
  equivalent: (a: S, b: S) => boolean;                               // same claim, not same shape
}
```

Helpers: `isNoOp(tx)`, `transactionSentence(tx)`, `rejectTransaction(before, origin, source, r)`.

### Which contract is normative (read this before writing a Wave-2 engine)

Three model-shaped interfaces exist in `src/lib/mmip` and they are **not** three alternatives.
`CanonicalModel<S, E, TTarget>` in this file is the **one normative engine contract**: it is the only
one that carries `EditOrigin`, `MmipOperation` and `MmipRejection`, so it is the only one in which
invariants 2 and 3 can even be stated — a shape whose `apply` returns a bare state cannot record who
edited, what mathematical operation happened, or that an edit was refused and why. Every Wave-2
engine implements `CanonicalModel` (plus `RepresentationBinding` per representation) and treats the
other two as consumers of it: `repSyncGraph.RepDef` is the **composition** layer, adopted when an
engine has three or more interdependent representations and needs propagation order, revisions and
undo coalescing (its `toSyncTransaction` bridges back to this contract); `mmipHarness.MmipModel` is a
**test-only adapter**, deliberately decoupled from these types, and each engine supplies a thin
bridge to it (see `src/lib/mmip/solveBalance.harness.s208.test.ts`) rather than reshaping itself to
fit a test harness.

Two honest gaps were recorded at the S208 freeze so Wave 2 would not mistake silence for coverage.
The first is **CLOSED as of S209**, and a second engine joined in S210 (`AlgebraTilesW` through
`algebraTilesCanonicalModel`, whose canonical state is signed tile POPULATIONS so that a zero pair
is a state a learner can build and collapse rather than an event; S212 extended it with x²
populations and an area frame, so `distribute` → BRANCH and `factor` → GATHER are now emitted by a
shipping engine rather than reserved — a rectangle opens into the partial products
`algebraTilesPartials` names, and those tiles gather back into it): `SolveBalanceW` now runs through the assembled
`solveBalanceCanonicalModel(spec)` — `model.normalize` for a restored value, `model.apply` for every
mutation including undo, and `model.views` (which derives through the `RepresentationBinding`s) for
every representation it draws. `CanonicalModel` and `RepresentationBinding` therefore have a
non-test consumer, and narrowing either interface is now a compile error in a renderer rather than a
document drifting away from the code. The loose pure functions remain exported — they are what the
object wraps and what the engine tests exercise directly. Second, **no harness check verifies
invariant 2 or the rejection contract** — `MmipModel.applyEdit` returns a state, so nothing in `mmipHarness`
can observe `ops`, `origin` or `rejection`. Those are currently proved only by engine-level tests
(`solveBalanceModel.test.ts`) and, for motion, by `equationMorph.test.ts`. Closing either gap is a
Wave-2 item, not something to assume already done.

---

## 3. The operation record S2's morph layer consumes

A morph plan is a pure function of `(tx.before, tx.ops, tx.after)`. Nothing else is needed — no DOM,
no previous plan, no timers.

Each `MmipOperationKind` names a motion semantic. These are the animations; there are no string
crossfades, because a crossfade is not a mathematical statement.

| kind         | motion semantic | what the learner sees |
|--------------|-----------------|-----------------------|
| `add`        | **join**        | new terms enter and settle into the expression |
| `subtract`   | **leave**       | terms depart; the survivors close the gap |
| `cancel`     | **collapse**    | a pair annihilates in place (zero pair, common factor) |
| `divide`     | **partition**   | the side is shown as *k* equal parts; *k−1* of them leave |
| `distribute` | **branch**      | one factor reaches each term inside a bracket |
| `factor`     | **gather**      | the inverse of branch; terms collect under one factor |
| `negate`     | **reflect**     | every term reverses sign together (an order relation turns round) |
| `reorient`   | **pivot**       | the relation symbol itself changes |
| `restore`    | **rewind**      | a previous state is re-entered; motion runs backwards |

Rules a morph layer may rely on:

* `ops` is **ordered**; play it in array order.
* `ops` is empty exactly when nothing happened (`isNoOp`) or the edit was refused.
* `sides.length === 1` means a **one-sided** operation. For an engine with an equality claim, that
  is the interesting case: the claim is about to break, and the motion should not pretend otherwise.
* `amount` is signed and in the operation's own units. For `add`/`subtract`/`cancel` it is the
  signed count of objects arriving or leaving. For `divide` it is the divisor. For `distribute` it
  is the signed count of objects arriving at `target`.
* A single learner action may emit **several** ops (distributing a bracket emits one per term; a
  constant edited across zero emits `subtract` then `add`).
* `describe` is a complete sentence about the mathematics, safe to caption or to speak.
* **Reduced motion**: the state change is legible without any of this. `tx.after` alone is a
  complete, correct rendering; motion is an explanation, never the channel the meaning travels on.

### Non-normative: how the first adopter maps the plan to pixels (S208)

This does **not** change the contract — the weights stay relative and every adopter owns its own
base — but it is the reference wiring, in `SolveBalanceW`:

* one constant, `MORPH_BASE_MS = 220`; a phase runs for `round(durationWeight × 220)` ms and its
  actors start `round(stagger × 220)` ms apart. Nothing else in the widget converts a ratio to time.
* actors are located by the plan's own ids: each holder carries
  `data-morph-actor="<target>:<side> …"` and the effect selects with `[data-morph-actor~="…"]`.
  There is no second, hand-maintained map of what moves.
* the motion is played through `Element.animate` (Web Animations API), so there is no stylesheet,
  no dependency and no timer. Under jsdom `animate` is absent and the call is a guarded no-op,
  while the same effect writes `data-morph-motion` / `data-morph-ms` — which makes the plan, and
  the ratio→ms mapping, directly assertable in a DOM test.
* `prefers-reduced-motion: reduce` is read at edit time; the widget then plays nothing and routes
  `reducedMotion(plan).phases[0].describe` (every phase's words plus the net state delta) to its
  existing `role="status"` live region.
* `Undo` replays `reversePlan` of the plan it is undoing. Motion history is component state, never
  persisted: a session restored from storage has pans but no plans, and undo there is silent
  rather than inventing an animation for a move it never saw.

`factor` is unused by solveBalance — that engine offers no re-bracketing move — but is emitted by
algebraTiles' area workspace (S212), where gathering loose tiles into a rectangle is the lesson. So
every one of the nine motion semantics now has at least one shipping producer.

---

## 4. How a new engine adopts MMIP

1. **Name the canonical state.** The smallest thing that determines every representation. For
   solveBalance it is literally what the pans hold: `{leftX, leftUnits, rightUnits, groups, partial,
   rel}`. Everything else — the sentence, the beam angle, which controls are enabled, the slot
   bounds — is derived. If you are tempted to store a derived value, you have found a bug.
2. **Name the frame.** The problem constants, which no learner action changes (`{a,b,c,relation,
   groups, witness, bounds}` for solveBalance). Frame is not state. Keeping them apart is what makes
   `normalize` safe against a value restored from storage.
3. **Enumerate the edits, one union.** Include the primitive ones (one object, one holder, one
   gesture) explicitly — they are what everything else decomposes into.
4. **Write `apply`.** One switch, total over the union. Refuse illegal edits with a `code` and a
   learner-facing `message` that is about the mathematics, never about the input control.
5. **Write the derivations.** One function per representation, each returning a plain data view.
   Never render from the state directly in a component; render from a derivation, so a test can
   assert the view without a DOM.
6. **Write `decompose` if any representation is stronger than another.** See §5 — this is the part
   that keeps a keyboard/typing surface from being a cheat code.
7. **Prove it.** Model tests must derive expected values by independent search or hand arithmetic,
   never by calling the model. At minimum: round trip in both directions, evaluator agreement,
   purity, and every rejection reachable.
8. **Wire the widget last, as a renderer.** The component holds perceptual state only and routes
   every mutation through one `run(edit, origin, source)` helper.

---

## 5. The reachability rule (why typing is not a cheat code)

A symbolic surface is stronger than a manipulative unless it is deliberately weakened: `3x + 4 = 19`
could become `x = 5` in one keystroke and the manipulative would have shown nothing.

MMIP's answer is a proof obligation on the engine, not a policy:

> **Every symbolic edit must decompose into a finite sequence of edits the learner can perform, and
> watch, on the manipulative.**

`solveBalanceDecompose(frame, state, edit)` returns that sequence, and the test
`"a symbolic edit IS a sequence of tile moves"` asserts

```
fold(apply, decompose(edit)) === apply(edit).after
```

for every symbolic edit shape, including the ones that cross zero. The symbolic strip is therefore a
*faster way to do tile moves*, never a way to do algebra the tiles cannot show.

### solveBalance's three consequences (the pedagogy, decided conservatively)

1. **A coefficient may only travel toward zero.** No affordance anywhere in this engine puts an
   x-tile onto a pan — you would have to know what x weighs — so the strip cannot either. Growing or
   sign-flipping the coefficient is refused with code `no-x-conjuring`. Split and distribute still
   change it, because those are moves the pans genuinely perform.
2. **A constant may move either way**, because the pans have ±1 adders. Opening the strip reveals
   those adders on both pans for every spec, so the tile route is visible rather than notional.
   Editing one side's constant is a **one-sided move**: the beam tips, on purpose. That is this
   engine's whole pedagogy, and the strip inherits it rather than hiding it.
3. **A standing bracket makes the strip inert** (`brackets-standing`). `3(x + 2)` is a physical
   object with an unopened multiplier; there is no honest tile meaning for typing over its parts.
   Distribute first.

The relation symbol is not typeable. In an equation it is the problem statement; in an inequality
the only legal change is the flip, which the existing control performs and the model exposes as
`flipRelation`.

Note that the engine grades a **position**, not a path — it always has. A learner could already
reach `x = 5` by illegal taps and be marked correct. The strip does not widen that hole, because it
reaches exactly the positions the tiles reach; closing it would be a change to the grader, not to
this protocol.

---

## 6. Accessibility contract for an editable representation

* Every affordance is a native `<button>` / `<input>`, keyboard-operable, target ≥ 44 px.
* Every numeric slot carries `EditableSlot.meaning`: **what the number is**, not where it sits.
  "how many unit tiles stand on the left pan, currently 4" — never "field 2" or "slider at 4".
* `min`/`max` are on the element, so a screen reader hears the rule before it is broken; a refusal
  still explains itself in mathematics.
* A refused edit is announced through a `role="status"` region carrying
  `transactionSentence(tx)` — the rejection message, never silence. **The region is mounted
  unconditionally**, not only while the editable representation is on screen: refusals are reachable
  from affordances that ship in the classic surface (in solveBalance, a ±1 adder pressed past a pan's
  readable limit), so a region that exists only alongside the editor cannot keep this promise. While
  the editor is closed the region is visually hidden and stays EMPTY for accepted moves — an adopter
  must not turn this contract into a second announcement of every ordinary action, which is chatter,
  not access.
* No colour-only signalling: signs live in the glyph, states live in words.
* Reduced motion: `tx.after` is a complete rendering on its own. Motion explains; it never carries.
* Pointer and keyboard routes must reach **identical states** (pinned: "the stepper and the field
  are the same edit by two routes").

---

## 7. Open questions (and one closed one)

* **Editing the right-hand side while a bracket stands** is currently refused along with everything
  else in the strip. It would be tile-expressible (the right pan is plain tiles). Left refused so
  the rule a learner meets is one sentence — *open the bracket first* — rather than a table.
* **`ax + b` skeleton rendering.** The strip renders `[a] x + [b] REL [c]` with signed values in the
  fields, so a negative constant reads as `+ −2` in the skeleton. The canonical sentence directly
  above it (`sb-equation`) always shows the correctly signed form. Changing the skeleton's operator
  glyph from the field's sign would make the field's own value ambiguous.
* **Evaluator divergence on unopened negative brackets — FIXED in S208 Wave 2b (historical).**
  `src/lib/evaluate.ts` used to compute a standing bracket's weight without the multiplier's sign,
  where the renderer and this model include it. `−5(x + 3)` is five copies of `−(x + 3)`, so five
  sealed copies weigh `5 × (−1) × (1·x + 3)`; the grader multiplied the copy count by the bracket's
  contents and dropped `sign(count)`, reading the left pan with the wrong sign whenever the
  multiplier was negative.

  It was shipped, not hypothetical. `tse-03-02` (`−5(x + 3) = −20`) opens with a level beam, and a
  learner who pressed Check before distributing was told *"The beam tipped — a tile moved on one pan
  only"* having moved nothing at all; the lesson's own `unexpandedFeedback` (*"The pan balances, but
  tiles locked inside a group cannot be moved one at a time"*) described a state the grader could not
  produce, so that branch was dead for the lesson.

  **The fix** adds `gSign = sign(spec.groups.count)` to the group weight and to the `coefX`/`unitsX`
  reconstruction, so the grader now weighs a sealed bracket exactly as the beam draws it. It is a
  strict no-op wherever `groups === 0` (the group terms vanish) or `groups.count > 0` (`gSign` is
  +1) — verified by an exhaustive sweep of all 28 authored `solveBalance` instances over 1,708,798
  states, in which `tse-03-02` is the only spec whose grading moves at all, and only at positions
  with brackets still sealed.

  Pinned in three places, each by an independent route: `src/lib/evaluate.negBracket.s208.test.ts`
  (hand arithmetic on the tile counts, plus the shipped lesson JSON), the dense-rational-grid
  agreement case in `src/lib/mmip/solveBalanceModel.test.ts`, and the renderer/grader pair in
  `src/components/widgets.solveBalance.s114.test.tsx`. Renderer and evaluator now agree at **every**
  position of every authored spec.
