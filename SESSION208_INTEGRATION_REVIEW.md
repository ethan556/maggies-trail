# Session 208 — Wave 1 (MMIP v1) Independent Integration Review

Reviewer: independent Opus integration reviewer. Wrote none of this code. Posture: adversarial —
looking for reasons to reject before the wave is sealed.

## Probes actually run (all foreground, within budget)

| probe | result |
|---|---|
| `npx vitest run src/components/widgets.solveBalance.s114.test.tsx src/components/widgets.mmip.o1.s208.test.tsx --maxWorkers=1 --reporter=dot` | 2 files / **60 passed** |
| `npx vitest run src/lib/mmip --maxWorkers=1 --reporter=dot` | 6 files / **223 passed** |
| `npm run typecheck` | clean |
| `node -e` hand-arithmetic (6 independent re-derivations) | all agree with the model |
| `node` content sweep for authored `solveBalance` specs | 28 widgets, 3 grouped, **1 negative multiplier** |

No source or test file was edited. `scripts/engine-capabilities.json` mtime is **Aug 7 21:11**, i.e.
before this session's first write (Aug 8 18:21) — **UNCHANGED, verified**. `find` over the whole
repo for files newer than 17:00 returns exactly the 14 source/test files, 2 docs and
`CO_WORK_PLAN.json`. **No authored lesson content changed. No worker claims content edits.**

---

## 1. Mathematical truth

**Verdict: sound.** I hand-verified six edits against an independent re-derivation from the spec
alone (`node -e`, not by calling the model):

1. `3x + 4 = 19`, witness `(19−4)/3 = 5`; left `3·5+4 = 19` = right; one left-unit tap → `18` vs `19`.
   Matches `solveBalanceWeights` (solveBalanceModel.ts:252).
2. **Zero crossing.** `setLeftConstant 5 → −3` on `−2x + 5 = −7` (witness `(−7−5)/−2 = 6`).
   `unitOps` (solveBalanceModel.ts:534) splits into `leg(5,0)` amount `−5` kind `subtract`, then
   `leg(0,−3)` amount `−3` kind `add`. Net `−8`; `5 + (−8) = −3`. Correct, and the two-op split is
   the right mathematical story (the tiles that were there leave, the opposite tiles arrive).
3. **Divide.** `split` on `3x = 15`: `k = |leftX| = 3`, `leftX/k = 1`, `rightUnits/k = 5`. `k` is a
   magnitude, so sign is preserved and an inequality's direction is preserved. Correct
   (solveBalanceModel.ts:606-637).
4. **Distribute.** `−5(x + 3) = −20`, `gSign = −1`, `st.groups = 5`: `xArrivals = 5·(−1)·1 = −5`,
   `unitArrivals = 5·(−1)·3 = −15` → `−5x − 15 = −20`, witness `1`, both pans `−20`. Correct.
5. **Inequality.** `negate` (solveBalanceModel.ts:638) deliberately does **not** flip `rel`. I
   checked this is right rather than a bug: `−2x ≤ 6` → negate → state claims `2x ≤ −6`, which is a
   *different* claim, `holds` goes false, `sb-contradiction` fires, and the learner must use
   `flipRelation`. That is the engine's whole pedagogy and `evaluate.ts:805-811`
   (`notFlippedFeedback`) diagnoses exactly it. The op's `describe` claims only "multiplied both
   pans by −1", which is true. No dishonest claim.
6. **Tilt** `((right−left)/max(|c|,1))·14` clamped ±7: for `18` vs `19` → `−0.737`. Sign convention
   (left heavier ⇒ negative rotation) is self-consistent with `heavier`.

**The `fold(apply, decompose(e)) === apply(e).after` invariant is tested meaningfully.**
solveBalanceModel.test.ts:264-286 runs 8 cases including two zero-crossings and three coefficient
walks, asserts each primitive is one of the five single-tile affordances, and folds. The expected
step counts (5, 8, 5, 9, 2, 1, 3, 6) are hand-stated, not read back. This is a real proof, not a
tautology.

One fragility worth recording: `solveBalanceDecompose`'s `walk` (solveBalanceModel.ts:786-791) uses
`tapLeftX` for **both** the tap and the step branch of the coefficient case
(solveBalanceModel.ts:799). It is correct only because `growing`/`flipping` is refused two lines
earlier. If that guard is ever relaxed, `decompose` silently starts lying and the invariant test
would still pass for the currently-enumerated cases. See NEXT_WAVE.

**lineFamilyModel's exact-rational policy: no hidden float path found.** `Rat` is integer n/d with
`safe()` overflow guards on every product (lineFamilyModel.ts:113-128); `ratRoundToInteger`
(line 168) rounds in integers; `ratSnap` snaps the quotient, not the value. `ratFromNumber`
(line 141) is the single documented float door (continued fractions, bounded denominator) and
`ratToNumber` (line 129) is used only for op `amount` fields (lines 966/978/1007/1019) and for
`EditableSlot` bounds/values (lines 1160-1174) — i.e. for reporting, never absorbed back into
canonical state. The stated policy holds.

---

## 2. State ownership

**One parallel truth source remains in `SolveBalanceW`.** widgets.tsx:8378:

```ts
const xTrue = (spec.c - spec.b) / spec.a;
```

This recomputes the solution in the component instead of using `frame.witness`. It is frame-derived
(not state-derived) so it cannot go stale against the pans, and it is used only in the reveal ghost
(widgets.tsx:8972-8979) where for an inequality it must be the *boundary*, not the witness — so the
duplication is deliberate. Still: it is the last piece of arithmetic in the renderer, and the whole
claim of this wave is that there is none. It belongs in the model as a `deriveReveal(frame)`.
Everything else — `L`, `R`, `holds`, `tilt`, `done`, `ctl`, `sym`, the sentence tokens, the group
glyph — is read from the model. `useState` in the component holds only `symOpen`, `symDraft`,
`symNotice`, `morph`, `planStack`, `sbPin`, `sbHover`: all perceptual, none graded.

**`repSyncGraph` stale-cache risk: none found.** `commit` (repSyncGraph.ts:294-309) replaces
`canonical` and re-derives **every** view wholesale; there is no per-node cache, no incremental
path, and `view()` reads the current bundle. Re-entrancy is *enforced*, not trusted
(repSyncGraph.ts:345-352). This is the strongest module in the wave.

---

## 3. Alternate strategies

* **Subtract-first still works** (pinned: widgets.mmip.o1.s208.test.tsx:195-204 and the classic
  S114 flow).
* **Divide-first does not work, and never did.** `canSplit` requires `st.leftUnits === 0`
  (solveBalanceModel.ts:458). For `2x + 4 = 10` the share-out into 2 groups of `(x + 2)` against
  `5` is physically performable and mathematically valid, but the engine refuses it. This is
  faithfully ported pre-existing behaviour (S114 test line 161 pins the clear-then-split flow), not
  a regression — but the answer to "do multiple legitimate solve paths still work" is **no**, and
  neither `docs/MMIP_V1_API.md` nor the model's prose says so.
* **Distribute strategies both survive** — `distributeAll` vs `distributeXOnly`, both named, both
  reachable, the misconception still visible in the beam (S114:202-217 green).
* **The `no-x-conjuring` refusal is mathematically right.** No affordance anywhere in the engine
  puts an x-tile onto a pan, so a symbolic surface that could would be strictly stronger than the
  manipulative. `split` and `distribute` still change the coefficient because those are moves the
  pans genuinely perform. **It blocks no authored strategy**: I found no lesson requiring the
  coefficient to grow via the strip (the strip is opt-in and closed by default in all 28 authored
  `solveBalance` steps).

**But**: the strip *does* materially lower the cost of reaching a graded-correct position without
doing algebra. `3x + 4 = 19`: three keystrokes (`lx→1`, `lu→0`, `ru→5`) produce `x = 5`, which
`evaluate` marks correct. Pre-S208 the same position needed ~20 deliberate taps against a visibly
tipping beam. `docs/MMIP_V1_API.md:220-225` discloses this honestly ("the engine grades a position,
not a path — it always has") and the reachable *set* is genuinely unchanged. I accept the reasoning,
but the cost collapse is a real change in assessment friction and should be recorded rather than
absorbed into "no widening".

---

## 4. Representation consistency

**No derivation is done in JSX.** The sentence comes from `sym.leftTokens`/`sym.rightTokens`
(widgets.tsx:8558-8559), the pans from `st` counts, the strip fields from `sym.slots`. Tiles, term
controls, equation strip and canonical sentence are all pure functions of one `st`, computed in one
render pass — they cannot disagree, because there is nothing for them to disagree *about*.

**The `+ −2` skeleton risk O1 documented is genuinely benign.** The strip renders
`[a] x + [b] REL [c]` with signed values, so `−2` reads as `+ −2` visually. The canonical sentence
directly above (`sb-equation`) always shows the correctly-signed form — I traced `sbTermTokens`
(solveBalanceModel.ts:85-98) and it is byte-identical to the classic string (pinned:
S114:82, S114:246, `"3x + 4 = 19"` / `"−2x + 5 = −7"`). The strip's `+` glyph is
`aria-hidden="true"` (widgets.tsx:8786), so a screen reader never hears the ambiguous form at all,
and each field's own value is unambiguous. `3x + −2` and `3x − 2` are the same claim. Acceptable.

**One real transient disagreement**: `symDraft` (widgets.tsx:8693) lets a field show a number the
pans do not hold while a keystroke is in flight. It is retired by any non-symbolic edit
(widgets.tsx:8468) and on blur (8703), and pinned by widgets.mmip.o1.s208.test.tsx:206-213. Draft is
perceptual, not mathematics. Acceptable — but see DEFECT 4, which is the *committed* version of the
same thing and is not acceptable.

---

## 5. Accessibility semantics

Good: every new affordance is a native `<button>`/`<input>` at `min-h-11 min-w-11` (= 44 px);
`aria-expanded`/`aria-controls` on the toggle; `EditableSlot.meaning` gives each field a
mathematical name ("how many unit tiles stand on the left pan, currently 4") rather than a
positional one; `min`/`max` are on the element; the disabled stepper's `aria-label` explains the
*mathematics* of why (widgets.tsx:8660-8665); signs are in the glyph, never colour alone; pointer
and keyboard reach identical states (pinned: o1 test 268-289).

**Reduced motion is genuinely meaning-preserving — where the channel exists.** `stage`
(widgets.tsx:8446-8453) reads the setting at edit time, plays nothing, and routes
`reducedMotion(plan).phases[0].describe` — every phase's words plus the net state delta — to the
live region. `reducedMotion` (equationMorph.ts:337-357) concatenates *all* phase descriptions, so a
two-beat zero-crossing is not truncated to one beat. Verified by o1 test 468-484. And `tx.after` is
a complete rendering on its own: the pans and the sentence really moved.

**The documented limitation is NOT acceptable as-is.** The only `role="status"` region lives
*inside* the open strip (widgets.tsx:8797-8804). `docs/MMIP_V1_API.md:236` promises without
qualification: "A refused edit is announced through a `role="status"` region carrying
`transactionSentence(tx)` — the rejection message, never silence." That promise is not kept for
refusals originating outside the strip. Reachable case: the `±1` adders (widgets.tsx:8876-8898) are
always enabled; pressing `+1` at the `unitBound` returns `pan-too-full`
(solveBalanceModel.ts:597-601), the state does not move, and **nothing is announced or shown**. This
is not a regression of an existing channel (`sb-equation`'s `aria-live` still announces every state
*change*), but it is a frozen contract that the implementation does not meet.

---

## 6. Engine-fit honesty

* `scripts/engine-capabilities.json` — **unchanged**, mtime predates the session. Verified.
* No content file touched — full-repo `find -newermt` confirms.
* Worker reports claim no content edits.
* `docs/MMIP_V1_API.md:255-260` discloses the evaluator divergence on unopened negative brackets
  rather than silently patching `evaluate.ts`. That is exactly the right instinct and I want it on
  the record as a credit.

**But one honesty claim in that same paragraph is false.** It says: *"No authored lesson currently
grades that position."* It does. `content/courses/two-step-equations/lessons/tse-03-02.json` is
`a: −5, b: −15, c: −20, groups: {count: −5, x: 1, unit: 3}` — literally the `−5(x + 3) = −20` case
the paragraph names. Traced end to end for the untouched start state
`{leftX:0, leftUnits:0, rightUnits:−20, groups:5}`:

| | left weight | verdict |
|---|---|---|
| model / beam (`solveBalanceWeights`, solveBalanceModel.ts:254) | `5·(−1)·(1·1+3) = −20` | level, `holds = true`, no `sb-tipped` |
| grader (`evaluate.ts:781`) | `5·(1·1+3) = +20` | `holds = false` → `unbalancedFeedback` |

So a learner who submits `tse-03-02` before distributing sees a **level beam** and is told they
**unbalanced the pans**; and the `unexpandedFeedback` branch (`evaluate.ts:819`) is *unreachable*
for that lesson because `!holds` returns first at line 818. The divergence is pre-existing
(`evaluate.ts` untouched) and out of scope, but the sentence asserting no lesson is affected must
not be sealed.

---

## 7. Architecture

**`mmipTypes.ts` is genuinely minimal and engine-agnostic** — 187 lines, no import of any engine, two
tiny helpers, no DOM, no React. Good.

**But MMIP v1 is being frozen as three parallel model contracts, and the first adopter implements
none of them.**

| contract | producers | consumers |
|---|---|---|
| `mmipTypes.CanonicalModel` / `RepresentationBinding` | `solveBalanceModel.ts:843`, `lineFamilyModel.ts:1128` | **none outside tests** |
| `mmipHarness.MmipModel` (`init`/`applyEdit`/`derive`, mmipHarness.ts:52-65) | test adapters | the 8 harness checks |
| `repSyncGraph.RepSyncConfig`/`RepDef` | `lineFamilyModel` | `repSyncGraph` |

`SolveBalanceW` calls the loose functions (`solveBalanceApply`, `deriveTiles/Symbol/Controls`)
directly and never touches `CanonicalModel` or `solveBalanceRepresentations`. `repSyncGraph.ts:502-503`
only *comments* the correspondence to MMIP; it does not implement it. So the load-bearing seam is
`solveBalanceApply` + `derive*` + `SyncTransaction`, and the ceremonially-frozen `CanonicalModel` is
decorative. A Wave-2 engine author reading "MMIP v1 is frozen" has three shapes to choose from.

The harness's own `MmipModel` decoupling is an **acceptable seam for what it checks** (view
agreement, staleness, path-independence, undo) — but note it cannot see `SyncTransaction`,
`origin`, `ops` or rejections at all, so **no harness check verifies invariant 2 or the rejection
contract**. That should be said out loud in the freeze doc rather than left to be discovered.

**equationMorph's no-crossfade invariant is assertable-only-by-construction, and unguarded.** The
module's contract (equationMorph.ts:44-49, mmipTypes.ts:81) is that every phase has ≥1 actor.
`actorsFor` (equationMorph.ts:200-202) is `op.sides.map(...)`, which returns `[]` for `sides: []` —
and `MmipOperation.sides` is typed `readonly string[]`, which permits it. Nothing throws, nothing
falls back; the result is exactly the actorless phase the doc says can never exist. solveBalance
never emits one, and `equationMorph.test.ts` has no `sides: []` case. Because the type is being
**frozen this session**, tightening it later is a breaking change. This is the cheapest, highest-
leverage fix in the whole review.

**Duplicate undo ownership (O2's flag).** Three stacks will exist after Wave 2 wiring:
`SolveBalanceW`'s `st.hist` + `planStack` (widgets.tsx:8455, 8407), `repSyncGraph`'s `undoStack`
(repSyncGraph.ts:283), and the lesson-player's own. **Severity for Wave 2: high as a design
decision, zero as a current defect** — `repSyncGraph` is unwired, so nothing is broken today. My
recommendation for Wave 2: `repSyncGraph`'s stack should win (it already has the gesture-coalescing
rule at repSyncGraph.ts:324-332 that the widget needs — see DEFECT 4), and the widget's `hist`
should become a projection of it, not a peer.

---

## 8. Regression risk (the hot zone)

I read `SolveBalanceW` in full (widgets.tsx:8358-8983) plus the module header (8296-8357).

* **Closed-strip rendering.** With the strip closed, `showAddersNow === showAdders`, no signed
  chrome leaks, `sb-equation` textContent is byte-identical (`"3x + 4 = 19"`, S114:82 green;
  `"−5(x + 3) = −20"`, S114:193 green). The one genuine change is that a new `sb-sym-toggle`
  button is now rendered in **every** `solveBalance` step. That is the unavoidable entry point for
  an opt-in feature, but it does mean CO_WORK_PLAN's acceptance line "classic rendering
  byte-identical when feature not engaged" is met *in substance*, not literally. Call it as such.
* **Testids / accessible names.** All S207-pinned ids survive (`sb-equation`, `sb-rel`, `sb-left`,
  `sb-right`, `sb-group`, `sb-split`, `sb-undo`, `sb-reset`, `sb-negate`, `sb-flip`, `sb-dist-all`,
  `sb-dist-x`, `sb-tipped`, `sb-contradiction`, `sb-agrees`, `sb-done`, `sb-term-*`,
  `sb-left-add/sub`, `sb-right-add/sub`, `slb-ghost`). 60/60 pinned + new tests green.
* **WAAPI guard is total.** `(el as HTMLElement).animate?.(...)` (widgets.tsx:8431) — optional call,
  so jsdom's missing `animate` is a no-op, while `data-morph-motion`/`data-morph-ms` are written
  unconditionally and *are* asserted (o1 test 394-466). Good design.
* **No timers.** No `setTimeout`/`setInterval` anywhere in the morph path — confirmed by reading the
  whole effect (8415-8441). The "no timers to leak into a test" claim is true.
* **Animation cleanup is absent but low-risk.** The effect returns no cleanup, so `Animation`
  objects from `el.animate()` are never `cancel()`ed; on rapid edits two animations can overlap on
  one element, and `data-morph-*` attributes persist on the DOM until the *next* morph. `fill:
  "none"` means no residual style, and detached elements' animations go idle, so there is no true
  leak — but it is untidy and the stale attributes are observable.
* **`relation:left` + `relation:right` both select the single `sb-rel` span** (widgets.tsx:8740), so
  a two-sided `reorient` calls `animate()` on it twice with different delays — a double pivot.
  Cosmetic.
* **Event-handler churn**: `run` is the single funnel and `disabled` short-circuits at 8462 before
  any state is touched. `setPlanStack([...planStack, plan])` (8475) closes over a possibly-stale
  `planStack`, which only matters for two edits inside one tick — not reachable through real events.

---

# DEFECTS_FOUND

1. **[MEDIUM · architecture]** `MmipOperation.sides` is frozen as `readonly string[]`, so an
   actorless phase is representable and `equationMorph.actorsFor` (equationMorph.ts:200) produces
   `actors: []` with no guard — exactly the "phase with no motion" the module's own contract
   (equationMorph.ts:44-49) declares impossible. No test covers `sides: []`. Tightening after the
   freeze is a breaking change.
2. **[MEDIUM · honesty]** `docs/MMIP_V1_API.md:259` — "No authored lesson currently grades that
   position" is false: `content/courses/two-step-equations/lessons/tse-03-02.json` is the
   `−5(x + 3) = −20` case. At its untouched start the beam reads **level** (model:
   `5·(−1)·4 = −20`) while `evaluate.ts:781` reads `+20` and returns `unbalancedFeedback`, making
   `evaluate.ts:819`'s `unexpandedFeedback` unreachable for that lesson.
3. **[MEDIUM · accessibility]** The `role="status"` region exists only inside the open strip
   (widgets.tsx:8797-8804), so `MMIP_V1_API.md:236`'s unqualified "never silence" promise is not
   kept. Live case: `±1` adder at the `unitBound` → `pan-too-full`
   (solveBalanceModel.ts:597) → silent no-op with the strip closed.
4. **[MEDIUM · correctness of affordance]** Per-keystroke commit. `symField`'s `onChange`
   (widgets.tsx:8698-8702) commits every intermediate integer as a real one-sided move. Typing
   `21` over `19` in `sb-sym-ru` commits `rightUnits = 2` first — a wild beam swing, an animation,
   and an undo entry for a position the learner never intended; `Undo` then returns to `2`, not
   `19`. Structurally invisible to the tests, because the `type()` helper fires a single
   `fireEvent.change` with the final string. `repSyncGraph.ts:324-332` already implements the
   gesture-coalescing rule that fixes this.
5. **[MEDIUM · invariant]** `undo` (widgets.tsx:8505-8524) mutates canonical state **outside**
   `solveBalanceApply`: it decodes the snapshot by hand and calls `onChange` directly. This
   contradicts MMIP invariant 2 (`MMIP_V1_API.md:30`, "Nothing mutates state outside `apply`") and
   the widget's own comment at 8456 ("THE ONLY MUTATION PATH"). No mathematics is invented (the
   snapshot came from `apply`), so this is a truth-in-labelling defect on a frozen contract, not a
   wrong answer.
6. **[MEDIUM · verification]** `CO_WORK_PLAN.json` assigns S1
   `src/components/widgets.mmip.solveBalance.s208.test.tsx`. **It was not delivered.** The only
   widget-level MMIP suite is `widgets.mmip.o1.s208.test.tsx` — written by the author of the widget.
   The wave therefore has no independent jsdom verification of `SolveBalanceW`, which is the
   discipline `CLAUDE.md` insists on everywhere else ("an INDEPENDENT route that never reuses the
   shortcut under test"). The model-level tests *are* independent and excellent; the widget-level
   ones are not.
7. **[LOW · architecture]** `mmipTypes.CanonicalModel` and `RepresentationBinding` have producers
   (`solveBalanceModel.ts:843`, `lineFamilyModel.ts:1128`) and **zero non-test consumers**;
   `SolveBalanceW` and `repSyncGraph` both bypass them. Freezing a contract nobody implements-and-
   consumes invites Wave-2 fragmentation across three shapes.
8. **[LOW · state ownership]** `xTrue` (widgets.tsx:8378) is the one arithmetic left in the
   renderer. Frame-derived so it cannot go stale, but it should be a model derivation.
9. **[LOW · a11y/HTML]** `id="sb-sym-panel"` (widgets.tsx:8776) is a static id used as an
   `aria-controls` target. Two `solveBalance` widgets on one page (reachable today via
   `src/app/dev/widgets/page.tsx:75`'s `SAMPLES.map`) produce duplicate ids and an ambiguous
   `aria-controls`. `useId` is the one-line fix; `useId` is currently used 0 times in `widgets.tsx`.
10. **[LOW · dead code]** `groupText` (widgets.tsx:8528) is assigned and never used — the sentence
    now gets its group glyph from `sym.leftTokens`. ESLint `no-unused-vars` is `warn`, so it will
    not fail the build, but it will surface in `npm run lint`.
11. **[LOW · doc/code mismatch]** `summarizeStateDelta`'s comment (equationMorph.ts:315-318) says
    "Targets with zero net signed amount are omitted"; the code omits zero-amount *ops*
    (line 321), not zero-net *targets*. No live case (solveBalance never nets a target to zero), but
    a future engine would get `"leftUnits +0"`.
12. **[LOW · motion]** A two-sided `reorient` animates the single `sb-rel` span twice
    (widgets.tsx:8740 carries both `relation:left` and `relation:right`); and the morph effect
    (8415-8441) never `cancel()`s the `Animation`s it starts, so overlapping edits stack
    animations and `data-morph-*` attributes persist until the next morph.
13. **[INFO · pedagogy, disclosed]** The strip reduces a graded-correct-without-algebra position on
    `3x + 4 = 19` from ~20 taps to 3 keystrokes. The reachable *set* is unchanged and
    `MMIP_V1_API.md:220-225` says so honestly; the change in friction is real and should be
    recorded, not absorbed.
14. **[INFO · pre-existing]** `canSplit` requires `leftUnits === 0` (solveBalanceModel.ts:458), so
    "divide first" — legitimate and physically performable for e.g. `2x + 4 = 10` — is refused. Not
    a regression; faithfully ported. Undocumented.

---

# CONDITIONS

Each must land **before seal**. All are small.

1. **`src/lib/mmip/mmipTypes.ts:81`** — change `readonly sides: readonly string[]` to
   `readonly sides: readonly [string, ...string[]]` (non-empty), **or** add an explicit guard in
   `src/lib/mmip/equationMorph.ts:200-202` that throws (or falls back to
   `[`${op.target}:equation`]`) when `op.sides.length === 0`, plus one test case in
   `equationMorph.test.ts`. Doing this after the v1 freeze is a breaking change; doing it now is
   additive-safe.
2. **`docs/MMIP_V1_API.md:259`** — delete or correct "No authored lesson currently grades that
   position." Replace with the named lesson and its consequence, e.g.: *"`tse-03-02`
   (`−5(x + 3) = −20`) is exactly this position. A learner submitting before distributing sees a
   level beam and receives `unbalancedFeedback`; `evaluate.ts:819`'s `unexpandedFeedback` branch is
   unreachable for that lesson. `evaluate.ts` was out of scope this session; fixing the sign at
   `evaluate.ts:781` and `787-788` is a Wave-2 release item."*
3. **`src/components/widgets.solveBalance.s114.test.tsx` (near line 190)** — add one assertion
   pinning the beam state at the **unexpanded negative-bracket start** (`sb-tipped` present/absent
   for the `−5(x + 3) = −20` spec before `sb-dist-all`). No existing test covers it, so the new
   model's `gSign` convention could have silently changed `tse-03-02`'s rendering and nothing would
   have failed. Pin whichever behaviour the S207 tree had.
4. **`src/components/widgets.tsx:8797-8804`** — render the `sb-sym-status` region unconditionally
   (visually hidden while the strip is closed) so every refusal reaches a live region, **or** narrow
   `docs/MMIP_V1_API.md:236` to "a refused edit made *in the equation strip* is announced…". Do not
   seal the unqualified promise against an implementation that cannot keep it.
5. **`src/components/widgets.tsx:8505-8524` + `:8456`** — either add a `restore`-shaped member to
   `SolveBalanceEdit` so `undo` routes through `solveBalanceApply` (engine-level, additive, allowed
   post-freeze), **or** amend both `docs/MMIP_V1_API.md` §1 invariant 2 and the widget comment at
   8456 to record undo as the single named exception. "THE ONLY MUTATION PATH" must stop being
   false.
6. **`src/components/widgets.tsx:8698-8702`** — coalesce consecutive symbolic edits to the same
   `slot.target` into ONE history entry (mirror `repSyncGraph.ts:324-332`), so typing `21` over `19`
   leaves one undo step landing on `19`, not two landing on `2`. Add a test that dispatches
   digit-by-digit (`fireEvent.change` with `"2"`, then `"21"`) — the current `type()` helper cannot
   catch this class of bug.
7. **`docs/MMIP_V1_API.md` §2** — state which contract is normative for a Wave-2 engine
   (`CanonicalModel`, `mmipHarness.MmipModel`, or `repSyncGraph.RepDef`), and record that
   `CanonicalModel`/`RepresentationBinding` currently have no non-test consumer and that **no
   harness check verifies invariant 2 or the rejection contract**. One paragraph; it prevents Wave 2
   from forking three ways.

---

# NEXT_WAVE_NOTES

1. **`evaluate.ts` sign fix for standing negative brackets** (`evaluate.ts:781`, `787-788`) — the
   only place in the wave where the picture and the grader genuinely contradict each other on
   authored content (`tse-03-02`). Release-blocking for any wave that touches grading.
2. **Undo ownership.** Three stacks after wiring (`st.hist`, `planStack`, `repSyncGraph.undoStack`).
   Recommend `repSyncGraph` owns it — it already has gesture coalescing — and the widget's `hist`
   becomes a projection. Do this *before* wiring `repSyncGraph` into any widget, not after.
3. **`solveBalanceDecompose`'s coefficient walk** (solveBalanceModel.ts:799) uses `tapLeftX` for
   both branches; correct only under the `no-x-conjuring` guard. Add a property test asserting every
   emitted primitive strictly reduces `|leftX|`, so relaxing the guard fails loudly.
4. **Move `xTrue` into the model** as `deriveReveal(frame)` (widgets.tsx:8378) — last arithmetic in
   the renderer.
5. **`useId` for `sb-sym-panel`** (widgets.tsx:8776) and an audit of any other static id introduced
   by Wave-2 panels.
6. **Cancel WAAPI animations** on unmount and on the next morph (widgets.tsx:8415-8441); dedupe
   actors so `sb-rel` is not animated twice by a two-sided `reorient`.
7. **Document the divide-first limitation** (solveBalanceModel.ts:458) in the engine's capability
   record — the manipulative can share `2x + 4 = 10` into two groups of `(x + 2)`, the software
   cannot. Either relax `canSplit` to `rightUnits % k === 0 && leftUnits % k === 0` (with a real
   two-part partition motion) or say plainly that only subtract-first is supported.
8. **Assessment friction.** If the strip stays, consider recording `origin` in the graded value so a
   position reached entirely by `symbolic` edits can at least be *distinguished* in telemetry from
   one reached physically. Do not change the grader without a separate decision.
9. **`summarizeStateDelta` comment vs code** (equationMorph.ts:315-321) — align before a second
   engine emits multi-op transactions on one target.
10. **Independent widget-level suite.** S1's `widgets.mmip.solveBalance.s208.test.tsx` is still
    owed. Wave 2 should not add a second widget adopter until a non-author has driven the first one
    through jsdom.

---

VERDICT: ACCEPT-WITH-CONDITIONS

The mathematics is correct in every case I hand-verified, including a zero-crossing, a distribute
with a negative multiplier, a divide, and two inequality paths. The `fold(apply, decompose(e)) ===
apply(e).after` invariant is a real proof with hand-stated expectations, not a tautology. There is
no parallel truth source of consequence in `SolveBalanceW`, no stale-cache risk in `repSyncGraph`,
no content change, no capability-file change, no weakened gate, and 283 tests plus a clean typecheck
back it. This is strong work and it should land.

It should not land *as written*, because three of the things being frozen are not true as stated —
an unqualified accessibility promise the code cannot keep (C4), an "only mutation path" that has a
second one (C5), and a "no authored lesson is affected" that names no lesson but describes one
(C2) — and because one frozen type permits the exact state its consumer's contract declares
impossible (C1). Those are the conditions. C3 and C6 close two places where a real behaviour is
untested and therefore unpinned; C7 stops Wave 2 forking across three model shapes.

---
---

# DELTA REVIEW (W2-A / W2-B)

Scoped to the two Wave-2 increments. Wave-1 conditions C1–C7 are confirmed landed (spot-checked
C4 at widgets.tsx:8866-8877 — the live region is now mounted unconditionally, `sr-only` while the
strip is closed, and empty unless the last edit was refused, which is exactly what C4 asked for).

## Probes run (delta budget: 2 vitest runs)

| probe | result |
|---|---|
| `vitest run widgets.mmip.o2.s208 + lineFamily.harness.s208 + evaluate.negBracket.s208 + repSyncGraph.test + lineFamilyModel.test` | 5 files / **121 passed** |
| `vitest run widgets.drag + LessonPlayer.ui + ladder.s41 + LessonPlayer.ladder.s41 + widgets.keyboard + widgets.emitters + widgets.tone + evaluate.new` | 8 files / **333 passed** |
| `node` — full 1701-file sha256 sweep vs `SESSION205_LESSON_HASHES.json` | **0 mismatches, 0 missing** |
| `node` — independent old-vs-new evaluator enumeration, 5,581,500 states | 4 symmetric classes, **0 CORRECT diffs** |
| `node` — reachable-subspace enumeration + beam-direction check, 18,605 states | 490 diffs, **0 disagreements with the beam** |

## 6. Content and capability freeze — VERIFIED, stronger than mtime

I did not take the mtime argument on trust. I hashed **every one of the 1701 authored lesson JSON
files** against `SESSION205_LESSON_HASHES.json`: **0 mismatches, 0 missing**, including
`content/courses/curve-analysis/lessons/ca-01-03.json` (sha256
`322897cc…4bba1`). The test-touched mtime is benign; the bytes are identical. Content freeze holds.

`scripts/engine-capabilities.json` — still **Aug 7 21:11**, unchanged since before the session began.

---

## 1. W2-A state ownership

**No line algebra in JSX — the claim holds.** Everything drawn comes from `graph.view(...)`
(widgets.tsx:11549-11551) through `sx`/`sy` pixel scales. The equation readout is assembled from
model-provided *parts* (`eq.parts.sign` + `eq.parts.interceptMagnitude`, widgets.tsx:11718), which
is exactly the right fix for the `+ −2` class of problem I flagged in Wave 1 — the sign is the
model's, not a raw signed number dropped next to a `+`.

Two residual arithmetic expressions, both **label placement only**:
`sx((n(tri.anchor.x) + cornerX) / 2)` (11748) and `sy(anchorY + n(tri.rise) / 2)` (11749) — the
midpoints of the run and rise legs, for positioning the "run 1"/"rise −3" captions. Neither can
make a representation disagree with another; both would be cleaner as derived label anchors.

**The reconcile is sound — but only because of a coincidence that Wave 3 will break.**
`leCanonicalFor` (widgets.tsx:11500-11524) hardcodes `anchorX: ZERO`, `run: ONE`,
`domain: {start:0, step:1, count:2}`, plus window/policy from the spec. The persisted value is
`{m, b}` — **strictly narrower than `LineCanonical`**. The reconstruction is faithful *today* only
because the four wired edits (`setSlope`, `setIntercept`, `dragPoint handle:"intercept"`,
`dragPoint handle:"unit"`) provably never touch any other field: I read `absorbLineEdit`
(lineFamilyModel.ts:487-530) and each of those four returns `setParameters(c, {m|b})`, which
spreads `...c` and replaces only `m`/`b`.

But `absorbLineEdit` **already implements** `setRunRise` (which returns `{...c, m, run: edit.run}`),
`setRun`, `setInputCell` and `setDomain`. The moment any of those is wired into `LineExploreW`, the
graph's canonical will differ from `leCanonicalFor(spec, m, b)` on `run`/`domain`, the key check at
widgets.tsx:11546 will fail on **every render**, and the widget will `reset(…, {history:"clear"})`
every render — undo permanently dead, and the learner's own triangle silently snapping back to
run 1. `setRunRise` is precisely the slope-triangle lesson, so this is a live tripwire, not a
hypothetical. Nothing at the call site says so. **Condition D1.**

**Ref-mutation-during-render (their RISK 3) is safe under StrictMode.** `useRef` returns the same
object across a double-invoked render, so the lazy init at 11544 runs once; and the reconcile at
11546 is idempotent — after `reset`, `graph.getState().key === leStableKey(canonicalNow)`, so the
second pass is a no-op. `reactStrictMode` defaults to true in the App Router and the o2 suite is
green under it. The genuine hazard is a *discarded* concurrent render (the history clear would
persist while the render is thrown away), but `WidgetView` puts the `next/dynamic` Suspense
boundary **above** `LineExploreW`, and there is no `startTransition`/`useTransition` anywhere in
`src/app` or `src/components`, so it is not reachable today. Latent, not live — NEXT_WAVE.

One related latency: `reset()` calls `commit()` → `notify()` **synchronously during render**
(repSyncGraph.ts:488-497). `listeners` is empty today. The first component that calls
`graph.subscribe(…)` with a `setState` inside will get a "cannot update while rendering" error, and
it will look like the subscriber's bug rather than the reconcile's.

**Can a stale graph survive a value round-trip through the player store? No.** Three reasons,
each checked:
1. `slopeStep`/`interceptStep` are `1`, so every committed `m`/`b` is an integer; `ratToNumber` →
   `exact()` (widgets.tsx:11501-11502) round-trips integers exactly, with no float door taken.
2. The check is a **value** fingerprint (`leStableKey`), not object identity, so a parent that
   re-creates `spec` every render cannot cause a spurious reset. This is the right design and it
   defuses the obvious churn hazard.
3. `eq`/`plot`/`tri` are all read *after* the reconcile (11549-11551), and both sliders read
   `graph.getCanonical()` (11818, 11838) rather than the props — consistent only because the
   reconcile runs first in the same render pass. Correct, but order-dependent and unremarked.

A host that *ignores* `onChange` makes every edit revert and clears history — correct
"props are the authority" behaviour, and o2 test 256-266 exercises exactly it.

**The rounding convention is bit-identical to the old `snapToStep`, which is the subtle thing that
could have silently changed every drag.** `ratSnap` → `ratRoundToInteger(a) = floor((2n + d)/(2d))`
(lineFamilyModel.ts:168) is half-toward-+∞: −0.5→0, −1.5→−1, −2.5→−2 — the same as JS `Math.round`
on all three. Snap-then-clamp ordering (guardParameter, lineFamilyModel.ts:364-393) matches too.
The three pinned drag expectations (widgets.drag.test.tsx:132-158) pass unmodified, and now I know
*why* rather than merely that.

## 2. W2-A regression surface — the non-`role="status"` live region

**It is not an a11y regression.** `aria-live="polite"` is the normative live-region mechanism;
`role="status"` is a role whose only additional normative effect is an implicit
`aria-atomic="true"`. Here the region's entire content is a single text node replaced wholesale
(widgets.tsx:11810), so atomic and non-atomic announcement are equivalent. It is `sr-only`, which
keeps it in the accessibility tree. It is mounted empty from first render, which is the *correct*
pattern — a live region must exist before content is injected to be announced reliably. Refusals
and clamp/snap sentences both land in it (`run`, widgets.tsx:11650-11651, 11663/11666), and
clamp/snap was previously **fully silent**. Net gain for AT users.

**The constraint they were working around is real.** `LessonPlayer.ui.test.tsx:197` does use
singular `getByRole("status")` on a lesson containing a `lineExplore` step after a slider change and
a Check; a second `role="status"` in the widget would make it throw. So this was a genuine trade,
not laziness.

**But the convention is now inconsistent on a test-shaped boundary, not a principled one.**
`LineExploreW` *already* renders `role="status"` on both lock chips (widgets.tsx:11826, 11846) — so
the same component uses both conventions depending on which branch renders. And `SolveBalanceW`
now mounts an unconditional `role="status"` (C4), so the two flagship MMIP widgets differ for no
user-facing reason. The principled fix is to scope the player test's query
(`getAllByRole("status")[0]`, or `within(footer).getByRole(…)`) and give both widgets the same
role — but that edits a pinned S207 suite, which is the worse trade at seal. NEXT_WAVE.

**The asymmetry that actually matters is not the role — it is visibility.** `LineExploreW`'s region
is `sr-only`, so a **sighted** learner with reduced motion sees nothing of the snap/clamp sentence,
whereas `SolveBalanceW` shows its reduced-motion text visibly inside the open strip. Under
`prefers-reduced-motion` the line still moves (so the state change is legible), but the *words*
explaining a snap reach only AT. Worth stating in the docs rather than leaving implied.

## 3. W2-A API additivity — VERIFIED default-preserving

| change | default-preserving? |
|---|---|
| `reset(c, options?: {history?: "push" \| "clear"})` (repSyncGraph.ts:478-499) | ✓ `options?.history ?? "push"` reproduces the old unconditional `pushHistory(null)` |
| `RepSyncConfig.history?: readonly C[]` (:284, :301-303) | ✓ `(config.history ?? [])` = the old `[]`; `.slice(-limit)` drops from the oldest end, as documented |
| `snapshots(): readonly C[]` (:502) | ✓ new method, no existing shape touched |
| `toSyncTransaction<C, M, TTarget = string>` (:541) | ✓ third generic defaulted to `string`; `ops` already defaulted to `[]` |
| `createLineFamilyGraph(initial = {}, options = {})` (lineFamilyModel.ts:898-908) | ✓ both parameters defaulted |

**The decisive evidence is not the reading — it is that O2's original suites were never touched.**
`src/lib/mmip/repSyncGraph.test.ts` (Aug 8 **18:26**) and `src/lib/mmip/lineFamilyModel.test.ts`
(Aug 8 **18:35**) both predate every Wave-2 write (earliest 20:07) and are byte-unmodified; both
pass against the changed modules in my run. An API change that required zero edits to 67 existing
`it(` blocks is additive in fact, not just in intent.

## 4. W2-B — the gSign fix, hand-verified against the renderer's convention

The evaluator's new expression (evaluate.ts:791) is
`spec.groups && spec.groups.count < 0 ? -1 : 1`; the model's (solveBalanceModel.ts:199) is
`g && g.count < 0 ? -1 : 1`. **Character-identical modulo the variable name.** It is applied in all
three places that needed it — `groupWeight` (:792), `coefX` (:802), `unitsX` (:803) — and applying
it to `coefX`/`unitsX` as well as to the weight is *necessary*, because otherwise the inequality
solution-set comparison would contradict the beam the weight computes. They got that right.

Three cases, hand-checked:

* **`count < 0`** (tse-03-02, `−5(x + 3) = −20`, witness 1): the renderer draws `st.groups` chips
  each glyphed `−(x + 3)` (widgets.tsx:8618). Five of them weigh `5·(−1)·(1·1 + 3) = −20`, which
  equals the right pan — level, as drawn. New evaluator: `−20`. ✓ Old: `+20`. ✗
* **`count > 0`**: `count < 0` is false → `gSign = 1` → every expression reduces **literally** to
  the pre-patch text. Bit-for-bit unchanged. ✓
* **`groups === 0` or no `spec.groups`**: the whole term is `0` (or the `spec.groups ? … : 0`
  guard short-circuits) regardless of sign. Inert. ✓

**"Zero correctness verdicts changed" is a proof, not a statistic.** `correct: true` is returned at
exactly one place, evaluate.ts:821-822, which is reachable only *after* the `groupsLeft > 0` early
return at :819. So every `correct` verdict has `groupsLeft === 0`, and `groupsLeft · gSign · (…)`
is `0` for either sign. The claim cannot fail.

**I re-derived the diff independently** rather than trusting the transcription — I wrote both
branches myself from evaluate.ts:767-823, importing nothing from the repo, so a mis-transcribed
baseline in their script cannot contaminate my result. Over 5,581,500 states of tse-03-02
(`leftX −12…12`, `leftUnits`/`rightUnits` −30…30, `groups` 0…5, `partial` 0/1, all five relations):

```
verdict diffs: 1,263,876
 UNEXPANDED -> UNBALANCED : 315,969      UNBALANCED -> UNEXPANDED : 315,969
 UNEXPANDED -> PARTIAL    : 315,969      PARTIAL    -> UNEXPANDED : 315,969
diffs touching a CORRECT verdict: 0
```

Four classes, exactly symmetric, zero correctness movement. **The structure of their result
reproduces.**

## 5. W2-B — the UNEXPANDED→UNBALANCED direction (234 cases in their count)

**Confirmed correct, in both directions.** I restricted to the *learner-reachable* subspace, which
is much smaller than the raw product: while a bracket stands `leftX ≡ 0` (only `distributeAll`/
`distributeXOnly` change `leftX`, and both zero `groups`); `partial === 1` implies `groups === 0`
(`distributeXOnly` sets `groups: 0, partial: 1`); and `st.rel ≡ "eq"` on an equation
(`flipRelation` refuses with `equation-has-no-flip`). Over those 18,605 states:

```
490 diffs — UNEXPANDED -> UNBALANCED: 245,  UNBALANCED -> UNEXPANDED: 245
cases where the NEW verdict disagrees with the beam: 0
```

I checked the new verdict against an independently re-derived beam (`leftX·wx + leftUnits +
groups·gSign·(g.x·wx + g.unit)`, the renderer's convention) and it agrees in **100% of diffs, both
ways**. Witness for the direction asked about — `leftUnits = −30, rightUnits = −26, groups = 1`:
old `L = −26`, which equals the right pan, so the old grader said "level, merely unexpanded"; the
true beam is `−34 ≠ −26`. The pans genuinely differ and UNBALANCED is the honest verdict. The
reverse class is correct by the same construction.

**However, the proof of record does not reconcile and is not reproducible.** There is no committed
script and no committed artifact for the "1,708,798 states / 936 diffs" figure — I searched the
tree for both numbers and found only unrelated hash substrings. Neither number matches an
independent enumeration (I get 1,263,876 over 5.58M unfiltered, or 490 over the 18,605 reachable
states). More pointedly: **on the reachable subspace only two classes can exist**, because
`partial === 1` implies `groups === 0` and therefore cannot diff — so a *four*-class result implies
the enumeration ranged over learner-unreachable states, which makes "936" an unfiltered count over
bounds I cannot reproduce. The fix is right; I proved that myself. But the number quoted to justify
a grader change is currently unverifiable at seal time, which is exactly the mis-transcribed-
baseline failure mode this review was asked to guard against. **Condition D2.**

The C3 pin landed correctly: `widgets.solveBalance.s114.test.tsx:217-250` now pins both halves —
the beam stays level with the bracket standing (`sb-tipped` null, :230) and the grader now returns
`"brackets"`, "the branch that used to be dead" (:250). Render half unchanged, grader half
strictly extended.

---

VERDICT: ACCEPT-WITH-CONDITIONS

Both increments are correct. W2-A's state ownership is real (no line algebra in JSX, one canonical
line, undo settled graph-side exactly as NEXT_WAVE_NOTE 2 asked, gesture coalescing pinned by three
tests), its API changes are additive in fact — proven by O2's 67 original `it(` blocks passing
byte-unmodified — and its rounding convention is bit-identical to the code it replaced. W2-B is
correct by a structural proof I re-derived independently over 5.58M states without importing a line
of the repo, and its diff directions agree with the beam in 100% of cases both ways. 454 tests
green across the delta's regression surface, all 1701 lesson hashes match, capabilities file
untouched. The non-`role="status"` live region is a defensible trade, not an a11y regression.

Two conditions, both about recording truth rather than changing behaviour.

CONDITIONS:

D1. **`src/components/widgets.tsx:11500`** (`leCanonicalFor`) — add a comment recording that the
    persisted value `{m, b}` is **narrower than `LineCanonical`**, and that the props→graph
    reconcile at :11546 is only sound while every wired edit leaves `anchorX`, `run`, `domain`,
    `window`, `policy` and `context` untouched. Name the tripwire explicitly: `setRunRise`, `setRun`,
    `setInputCell` and `setDomain` are already implemented in `absorbLineEdit`
    (lineFamilyModel.ts:585-600), and wiring any of them without widening the persisted value will
    make the key check fail on **every render**, resetting the graph and clearing undo each time.
    Mirror one sentence into `docs/RSG_DESIGN.md`. (Comment-only; no behaviour change.)

D2. **W2-B's exhaustive diff** — commit the enumeration script (e.g. under `scripts/audit/`) or its
    JSON artifact, **or** restate the claim in `SESSION208_EXECUTION_REPORT.md` using numbers that
    reconcile. As it stands the "1,708,798 states / 936 diffs / four symmetric classes" figure has
    no reproducible source in the tree and does not match an independent enumeration; on the
    learner-reachable subspace only two classes are possible. The load-bearing sentence — "zero
    correctness verdicts changed" — should be justified by the structural argument
    (`correct` is reachable only when `groupsLeft === 0`, where `gSign` multiplies zero,
    evaluate.ts:819-822), which is airtight and needs no enumeration at all.

DEFECTS_FOUND:

1. **[MEDIUM · latent]** `leCanonicalFor` (widgets.tsx:11500-11524) reconstructs `LineCanonical`
   from `{m, b}` alone; the reconcile at :11546 silently degrades to reset-every-render the moment
   an edit touching `run`/`anchorX`/`domain` is wired. Addressed by D1.
2. **[LOW · latent]** `graph.reset()` is called during render (widgets.tsx:11546) and synchronously
   `notify()`s subscribers (repSyncGraph.ts:497). Harmless with zero listeners; the first
   `subscribe` that calls `setState` will produce a render-phase update error attributed to the
   wrong component.
3. **[LOW · consistency]** Two live-region conventions now coexist: `SolveBalanceW` uses
   `role="status"` (widgets.tsx:8878), `LineExploreW` uses bare `aria-live="polite"`
   (widgets.tsx:11810) while its own lock chips use `role="status"` (11826, 11846). The distinction
   tracks which pinned test renders which widget, not any user-facing difference.
4. **[LOW · a11y]** `LineExploreW`'s status region is `sr-only`, so a sighted reduced-motion learner
   gets no visible text for a snap or clamp; `SolveBalanceW`'s equivalent is visible. Still a net
   improvement (both were previously silent), but the asymmetry is undocumented.
5. **[LOW · residual]** Two label-midpoint arithmetic expressions remain in JSX
   (widgets.tsx:11748, 11749). Presentation only; cannot desynchronise a representation.
6. **[LOW · process]** The W2-B exhaustive-diff evidence is not reproducible from the tree.
   Addressed by D2.
7. **[INFO · unverified, likely pre-existing]** `dragM`/`dragB` (widgets.tsx:11695-11710) gate only
   on `disabled`, not on `mLocked`/`bLocked`, so a locked parameter can still be changed by
   dragging its handle while the slider is disabled and the lock chip is showing. The lock tests
   (`ladder.s41.test.tsx:103`, `LessonPlayer.ladder.s41.test.tsx:126`) only assert chip presence, so
   nothing pins it either way. I could not establish whether W2-A changed this; flagged for
   confirmation rather than asserted as a delta regression.

NEXT_WAVE_NOTES:

1. **Widen the persisted lineExplore value** to carry the triangle (`run`, `anchorX`) before wiring
   `setRunRise` — otherwise D1's tripwire fires. This is the natural Wave-3 prerequisite for the
   slope-triangle lesson.
2. **Unify the live-region convention**: give `LineExploreW` `role="status"` and scope
   `LessonPlayer.ui.test.tsx:197` to the footer (`getAllByRole("status")[0]` or a `within(...)`
   query). Pinned-suite edit, so it wants its own window rather than a seal-time patch.
3. **Move the props→graph reconcile out of the render phase** (`useEffect` + a pending-canonical
   state, or `useSyncExternalStore`) if the app ever adopts `startTransition`/concurrent routing.
   Not needed today — `next/dynamic`'s Suspense boundary sits above the widget and no transition API
   is used anywhere in `src/app` or `src/components`.
4. **Retire the `evaluate.ts` / `solveBalanceModel.ts` duplicate arithmetic.** The gSign expression
   now exists in two files that must stay character-identical forever
   (evaluate.ts:791, solveBalanceModel.ts:199), as do `groupWeight`/`coefX`/`unitsX`. The grader
   should call `solveBalanceClaim`/`solveBalanceWeights` rather than re-implement them; this whole
   defect class existed only because there were two copies.
5. **Derive the triangle label anchors** in `lineFamilyModel` so widgets.tsx:11748-11749 becomes a
   readout like every other coordinate.
6. **Confirm defect 7** (drag vs `locks`) against the S207 tree and pin whichever behaviour is
   intended.

---
---

# S209 REVIEW

Four workstreams (A1, A2, A3, B1) against the sealed S208 tarball
(`/home/claude/maggie/maggies-trail-session-208.tar.gz`), which gives this pass something the
earlier ones lacked: a real baseline to diff against instead of inference.

## Probes run

| probe | result |
|---|---|
| `vitest run src/lib/mmip + widgets.mmip.{s1.s209,o2.s209,o1.s208,o2.s208}` | 11 files / **344 passed** |
| `vitest run slopeTriangle.s123 + affineRelationship.s147 + solveBalance.s114 + drag + LessonPlayer.ui + keyboard + session147 + session154` | 8 files / **244 passed** |
| `vitest run emitters + tone + ladder.s41 ×2 + LessonPlayer.process + processSignals + evaluate.negBracket` | 7 files / **104 passed** |
| `diff` vs sealed tarball: `mmipTypes.ts`, `content/**`, `engine-capabilities.json`, `evaluate.ts` | **byte-identical** |
| `node` — exhaustive sweep of all 10 authored `slopeTriangle` specs at their own `legMax` (7,930 states) | old-vs-grader: **1** disagreement; new-vs-grader: **0** |
| `node` — A3 spot-checks against `vec-05-03.json`, `lf-02-01.json`, `MatrixTransformSpec` | both verdicts **confirmed** |

**692 tests green.** No S207-pinned suite was edited.

## 5. Cross-cutting integrity — VERIFIED against the seal, not inferred

* **`src/lib/mmip/mmipTypes.ts` is byte-for-byte identical to the S208 seal.** The frozen contract
  held through four workstreams. ✓
* **`content/**` is byte-for-byte identical** (`diff -rq` over the whole tree, zero differences).
  A3 was read-only as claimed. ✓
* **`scripts/engine-capabilities.json` byte-identical** ✓ — and `src/lib/evaluate.ts` byte-identical,
  so the S208 W2-B grader fix stands untouched and no new capability claim was made.
* **Every edited test file was checked for removed assertions.** Totals (+added/−removed):
  `mmipHarness.test.ts` +159/−0, `widgets.mmip.o1.s208.test.tsx` +52/−0,
  `solveBalanceModel.test.ts` +14/−3, `lineFamilyModel.test.ts` +189/−7,
  `lineFamily.harness.s208.test.ts` +81/−1. **Every one of the 11 removed lines is a rename**
  (`solveBalanceModel` → `solveBalanceCanonicalModel`, `lineFamilyCanonicalModel` const → factory
  call), and I confirmed each was re-added in stronger form — e.g. the sealed
  `"the model object answers the CanonicalModel contract"` became
  `"the assembled object answers the CanonicalModel contract, bindings and all"` with new
  assertions on `model.representations` and `model.views`. **No assertion was weakened.**
* **My S208 conditions landed and were generalised.** C5 (undo through `apply`) is now an ordinary
  `restore` transaction (widgets.tsx:8683-8691); C6 (`coalesceKey`) is implemented with the exact
  rationale I gave (widgets.tsx:8670-8676); D1's tripwire comment is at widgets.tsx:11682-11690 —
  and the same warning was **proactively written for the new adopter** at widgets.tsx:6184-6188
  before anyone asked. That is the right instinct.
* **New parallel truth sources: none found.** `SlopeTriangleW` reads `hits = verdict.passes`
  (widgets.tsx:6364) from `model.views`; the old float formula survives only inside a comment
  (6192). `LineExploreW` and `affineRelationshipLab` derive through the assembled models.

## 1. A2's `keyboardParityCheck` — the permissiveness change ⚠️ **the one real problem**

The change is at mmipHarness.ts:594-596: `if (isDisabledForInteraction(el)) return;` before
`checked += 1`, replacing the sealed `checked += els.length`.

**The exemption was necessary, and half of it is correct.** `isNativelyFocusable` (mmipHarness.ts:516)
returns `!(el as HTMLButtonElement).disabled`, so a disabled native control was previously *flagged
as a parity failure*. It should not be: for the `disabled` IDL property the platform guarantees the
control is unavailable on **both** channels — no focus, and no click events fire — so it is a
legitimately-equal state, not a keyboard gap. The `el.disabled === true` clause is right.

**The `aria-disabled` clause is not, and it is the exact category the project says is never allowed
silently.** `aria-disabled="true"` is *advisory only*: it does not prevent pointer activation and
does not remove the element from the tab order. So

```html
<div role="button" aria-disabled="true" onClick={…}>   <!-- clickable by mouse, unreachable by keyboard -->
```

is a **genuine parity failure that the check now silently skips**. Worse, `aria-disabled` on a
control that is *not* natively disabled is the standard pattern authors use precisely to keep a
control focusable and announceable — exempting those is backwards.

Answering the question directly: **the exemption does not verify the control is equally unavailable
to pointer users — it takes it on faith.** For `el.disabled` the faith is warranted by the platform;
for `aria-disabled` nothing warrants it. And the doc comment (mmipHarness.ts:527-532) justifies the
exemption *entirely* in terms of "a disabled native `<button>` drops out of the tab order — a mouse
cannot activate it either", never mentioning `aria-disabled`. **The implementation is broader than
its own stated rationale**, which is the signature of a check quietly loosened past what was needed.

Latent today (`grep -rn 'aria-disabled' src/` → zero hits outside the harness), but `mmipHarness`
is explicitly the reusable cross-engine harness — its own header says it exists to keep "every
future engine proof honest against the same discipline". **Condition S1.**

**Second problem: the change opened a vacuity hole.** The "selector matched no elements" guard
(mmipHarness.ts:588-593) runs on the **pre-filter** `els.length`, but `checked` now counts only
non-exempt elements. So a selector matching *only* disabled controls passes the guard and returns
`{ ok: true, checked: 0 }` — the check trivially passing over a widget, which is precisely what that
guard's own comment says it refuses to do. This is reachable: a widget rendered in the finalized
state (`disabled: true`, the reveal) has every control disabled. Three of the four call sites defend
themselves (`s1.s209:225` `checked > 0`; `harness.s208:522` `>= 26`; `o2.s208:313` `toBe(3)`), but
**`widgets.mmip.o2.s209.test.tsx:258` asserts only `parity.failures`**. **Condition S2.**

**Third: the new branch has zero test coverage.** `mmipHarness.test.ts` gained +159 lines, all of
them for `transactionCheck`. Nothing tests that a disabled control is exempted, and nothing tests
that an `aria-disabled` pointer-only element is still caught — which is just as well, because it
would fail. A behaviour change to a shared check shipped unpinned.

`transactionCheck` itself is good: the three violation fixtures are real, and the S209 addition wires
it against the **real** `solveBalanceCanonicalModel` with a genuine refusal in the log
(`nothing-to-negate`), independently re-confirmed in a separate test rather than asserted by the
check alone.

## 2. A1's source-level pin — sound, brittle in the safe direction

I ran every assertion against the current source. Positive strings occur 3 / 1 / 1 / 1 times; all
six negative strings are absent; the seam `model.apply(st, edit, origin, source)` sits at
widgets.tsx:8692 inside `SolveBalanceW`. So the pin is **non-vacuous today**.

On the rot question:
* **Positive assertions (`toContain`) fail loudly** if the string disappears, including under the
  file-split scenario — if `SolveBalanceW` moved out of `widgets.tsx`, `model.apply(st, edit,
  origin, source)` would vanish from the file and the test would fail. So a file split is caught.
* **Negative assertions can only silently pass** by renaming the thing they forbid: a re-introduced
  `sbApply(...)` would sail through. That is inherent to grep-pinning and acceptable — they still
  catch the literal regression described.
* **The weakest link is `expect(src).toContain("solveBalanceCanonicalModel")`** — satisfied by a
  *comment* alone. Scope it to the import (`from "@/lib/mmip/solveBalanceModel"` on the same
  statement) and it becomes load-bearing.
* `toContain("model.apply(st, edit, origin, source)")` pins exact argument spelling and whitespace,
  so a rename of `st` or a prettier reflow fails a green build. False-positive-generating, not
  unsafe. Both are NEXT_WAVE nits, not conditions.

The companion `"what the widget draws is exactly what the model's bindings derive"` test
(o1.s208.test.tsx:617-634) is the stronger half — it builds the model independently and checks the
DOM against `views`, so the seam is proved behaviourally as well as textually.

## 3. B1's `TriangleCanonical` — the mathematics holds, and I verified both behaviour changes

**"1:2 and 2:4 are different canonical states" is consistent with the equivalence machinery, and it
is the *only* consistent reading.** The two mechanisms do exactly their documented jobs:
`stableKey` is the identity of the **picture** (different triangles ⇒ different keys ⇒ correctly
distinct undo entries), while `CanonicalModel.equivalent` is the identity of the **claim** —
mmipTypes.ts:161-163 defines it as "not structural equality; `2x = 10` and `x = 5` are equivalent
claims in different positions". And `lineFamilyModel.test.ts` now pins precisely the lesson:
`slopeTriangleCanonicalModel().equivalent(half(2,1), half(4,2)) === true`,
`equivalent(half(2,1), half(2,2)) === false`. So a lesson that teaches "1:2 and 2:4 are the same
slope" is served by `equivalent`, not contradicted by `key`. The rationale in RSG_DESIGN.md — that
the canonical object is a pair of legs and the *line* is the partial derivation — is the right call,
and the argument against the `VerticalLine` variant (it would make `deriveEquation`, `deriveTable`,
`lineValueAt`, `deriveContext` all partial) is correct.

**The 1156-case test exists and is genuinely independent** (lineFamilyModel.test.ts:962-987):
4 problems × 17 × 17 legs, compared against `slopeTriangleMatches` from `@/lib/schema` — a different
module with its own case analysis — plus an anti-vacuity guard (`agreedTrue > 20`).

**But its lattice is narrower than the authored reach.** The test uses `policy: { legMax: rat(8) }`,
legs −8…8 and windows ±10. I swept the authored corpus: **10 `slopeTriangle` specs**, of which
**8 carry `legMax: 14` on `gridMax: 16`**, and one (`lf-01-02`, A(−1,2) B(3,14)) has a coordinate of
14. So the proof covers ±8 while content permits ±14 — and the untested region is exactly where a
float-vs-exact disagreement would live. The test's own title says "EVERY buildable triangle".
**Condition S3.**

**I closed the gap myself.** Sweeping all 7,930 (run, rise) states reachable in the 10 authored
specs *at each spec's own `legMax`*, with the old float verdict transcribed from the **sealed**
widgets.tsx:6203 and the grader from schema.ts:3753:

```
NEW exact verdict vs shipped grader : 0 disagreements   ← the gap is not a correctness risk
OLD widget      vs shipped grader   : 1 disagreement
  └─ lf-01-03  A(4,1) B(4,7)  run 0, rise 0  → old "passes through B", grader false
of which float-caused: 0
```

This independently confirms **both** of B1's claims *at the severities they assigned*:

* **The empty-triangle contradiction was LIVE, and it is the only live one.** The sealed code read
  `hits = v.run === 0 ? spec.bx === spec.ax : …` — true for a vertical problem *regardless of rise*,
  so at run 0 / rise 0 the widget simultaneously printed `slopeText = "no triangle"` and the chip
  `"✓ passes through B"` while the grader said false. `lf-01-03`'s vertical sample starts at
  `runStart: 1, riseStart: 0`, so **one keypress** (run 1→0) reaches it. B1's description is exact.
* **The float divergence is genuinely LATENT.** Zero float-caused disagreements anywhere in
  authored range. **O2's self-correction — initially claiming live, then downgrading — was right**,
  and correcting itself against its own earlier claim is worth more than the fix.

**The empty-triangle change is safe as well as correct.** All 10 authored specs start at
`runStart: 1, riseStart: 0`; **none starts empty**, so no lesson's first render depended on the
phantom. And the phantom could never have been load-bearing pedagogy: it asserted "passes through B"
on a readout that in the same breath said "no triangle".

## 4. A3 adjudication — both spot-checks confirmed from the JSON

**PASS `vec-05-03/k1` → `matrixTransform`: correct on all four gates.**
The lesson step really is an `mcq` with the quoted prompt and a correct option "90° clockwise
rotation". The mathematics checks out: reflect over `y = x` is `[[0,1],[1,0]]`, reflect over the
x-axis is `[[1,0],[0,−1]]`, and the composition (second ∘ first) is `[[0,1],[−1,0]]`, which is
exactly the 90° clockwise rotation matrix `[[cos(−90), −sin(−90)],[sin(−90), cos(−90)]]`. The spec
sketch is well-formed against the real `MatrixTransformSpec` (schema.ts:2744-2764): `ta/tb/tc/td`
are `int().min(-3).max(3)` and the target `0,1,−1,0` fits; `sa/sb/sc/sd` default to the identity the
sketch supplies; `targetName` is required and given. The lesson has exactly 5 answerable steps
(i1, k1, k2, k3, ch1), matching the "0/5 rich" claim. ✓

**REFUSE `lf-02-01/i3` on NOVELTY: correct, and the evidence is exact.**
The lesson has exactly the 8 answerable steps listed. `k2` and `ch1` are both
`exactNumberLab` / `task: "approximationEvaluate"` / `answerMode: "numeric"`, and — the decisive
detail — they carry the **identical `approxFormula` AST**, `add(multiply(m, x), c)`. `i3` is a plain
`numeric` asking the same shape ("For y = 5x + 3, find y when x = 1"). With `e1` (`lineExplore`)
that is 3 rich of 8 = **37.5%**, exactly as claimed. Converting `i3` would be a third instance of
the same doing-moment. The refusal is right, and it is CLAUDE.md's "rejecting is a SUCCESS" applied
honestly rather than padding the count.

Both verdicts check out, so the method is sound. The pool-thinness conclusion — that 62 insertions
would need ~680 adjudications at a 9% pass rate, and that the pool is thinner than the mandate
assumed — is stated with its own caveats about the adversarial sample, and A3 changed zero content.
The one sub-claim I could not verify is the live `step-mix.mjs` re-scoring (310/3,075 rows already
rich); it is internally consistent with everything I did check.

---

VERDICT: ACCEPT-WITH-CONDITIONS

The frozen contract survived four workstreams byte-for-byte; content and capabilities are untouched
against the sealed baseline; no pinned suite was edited and no assertion anywhere was weakened —
every removal was a rename that came back stronger. A1's seam is real and pinned two ways. B1's
`TriangleCanonical` reasoning is the correct resolution of the vertical-line question, its
`key`/`equivalent` split is exactly the documented semantics, and I independently reproduced both
of its behaviour-change claims at the severities it assigned — including confirming that its own
downgrade from "live" to "latent" was the honest call. A3's method survived two adversarial
spot-checks. My S208 conditions landed and their pattern was generalised to the new adopter unasked.

The block is A2. A shared verification check was made more permissive, half of it correctly and
half of it not, with the implementation reaching further than its own written rationale, with a new
vacuity hole, and with zero tests on the new branch. That is the one category this project does not
allow to pass quietly, and the fix is a few lines.

CONDITIONS:

1. **`src/lib/mmip/mmipHarness.ts:533-535`** — remove the `aria-disabled` clause from
   `isDisabledForInteraction`, leaving `(el as { disabled?: boolean }).disabled === true`.
   `aria-disabled` neither blocks pointer activation nor removes the tab stop, so exempting it
   masks the exact bug class the check exists to catch, and the justifying comment (527-532)
   covers only the native case. If `aria-disabled` must stay exempt, the comment has to say why a
   pointer-operable element is not a parity gap — and it cannot, because it is one.
   **Add the two missing tests** to `mmipHarness.test.ts`: (a) a `<button disabled>` is exempted and
   does not fail the check; (b) a `<div role="button" aria-disabled="true">` with no `tabindex`
   **is still reported as a failure**. Test (b) is the one that must fail before the fix.

2. **`src/lib/mmip/mmipHarness.ts:588-596`** — close the vacuity hole opened by the exemption. The
   "matched no elements" guard runs on the pre-filter `els.length`, so a group matching only
   exempted elements now returns `{ ok: true, checked: 0 }`, which is the trivial pass that guard
   exists to refuse. Either throw when a group contributes zero *checked* elements, or — minimum —
   add `expect(parity.checked).toBeGreaterThan(0)` at
   **`src/components/widgets.mmip.o2.s209.test.tsx:258`**, the only one of the four call sites that
   does not already defend itself.

3. **`src/lib/mmip/lineFamilyModel.test.ts:962-987`** — the test claims agreement on "EVERY
   buildable triangle" but bounds itself to legs −8…8 with `policy: { legMax: rat(8) }` and windows
   ±10, while 8 of the 10 authored `slopeTriangle` specs use `legMax: 14` on `gridMax: 16`
   (`lf-01-02`, `lf-01-03`) with a coordinate reaching 14. Widen the loop to ±14 and add at least
   the two authored problem shapes `A(−1,2) B(3,14)` and `A(4,1) B(4,7)`. I verified the widened
   range is clean (0 disagreements over all 7,930 authored states), so this pins a result already
   known to hold — but the repo's own proof should cover the repo's own content, and the test's
   title should not outrun its bounds.

DEFECTS_FOUND:

1. **[MEDIUM · a11y check weakened]** `aria-disabled` exemption in `isDisabledForInteraction`
   (mmipHarness.ts:534) silently skips pointer-operable, keyboard-unreachable elements. Latent —
   zero `aria-disabled` in `src/` today — but this is the shared cross-engine harness. Condition 1.
2. **[MEDIUM · vacuity]** `keyboardParityCheck` can now return `ok: true, checked: 0`
   (mmipHarness.ts:588-596). Condition 2.
3. **[MEDIUM · unpinned behaviour change]** The disabled-exemption branch has no test in
   `mmipHarness.test.ts` (+159 lines, all `transactionCheck`). Condition 1.
4. **[MEDIUM · proof narrower than its claim]** The 1156-case verdict test bounds legs at ±8 while
   authored content permits ±14 (lineFamilyModel.test.ts:962). Condition 3. Verified harmless.
5. **[LOW · pin strength]** `expect(src).toContain("solveBalanceCanonicalModel")`
   (o1.s208.test.tsx:600) is satisfiable by a comment alone; scope it to the import statement.
6. **[LOW · pin brittleness]** `toContain("model.apply(st, edit, origin, source)")`
   (o1.s208.test.tsx:612) pins exact argument spelling and whitespace — a rename of `st` or a
   reformat fails a green build. False-positive-generating, not unsafe.
7. **[LOW · fragmentation]** `TransactionLike`/`TransactionOpLike` (mmipHarness.ts:84-96) duplicate
   `SyncTransaction`/`MmipOperation` field-for-field as a fourth structural shape. The comment
   (76-83) explicitly answers my S208 defect 7 and argues it is a test-only adapter rather than a
   model shape — I accept the argument, but nothing pins the mirror against the original, so a
   future additive field on `SyncTransaction` will drift silently.
8. **[LOW · latent, carried]** Render-phase graph mutation (`graph.reset(...)` inside the component
   body) now exists in a **second** adopter, widgets.tsx:6241, alongside 11546. Still unreachable
   today (no `startTransition`; the `next/dynamic` Suspense boundary sits above the widget), but the
   pattern is spreading ahead of the fix.

NEXT_WAVE_NOTES:

1. **Move the props→graph reconcile out of the render phase** before a third adopter — it is now
   copy-pasted twice and will be three times in Wave 4. `useSyncExternalStore` is the shaped-for fit
   the RSG doc already anticipates.
2. **Pin `TransactionLike` against `SyncTransaction`** with a type-level assertion
   (`const _: TransactionLike<S> = {} as SyncTransaction<S>`), so the deliberate decoupling cannot
   become an accidental divergence.
3. **Scope the source-level pins** (defects 5-6) to import statements and to the enclosing function,
   so they fail on regression rather than on reformatting.
4. **`LinePairCanonical`** for `affineRelationshipLab`'s intersections — RSG_DESIGN's own open
   question 3, and the honest reason the lab stayed derive-only this session.
5. **Re-check the A3 pool conclusion against `step-mix.mjs` directly** before any mandate is
   re-scoped on it; it is the one A3 input I could not independently reproduce.
6. **Unify the live-region convention** (carried from S208 delta): `SolveBalanceW` uses
   `role="status"`, `LineExploreW` bare `aria-live`, and `SlopeTriangleW` now adds a third adopter
   to that inconsistency.

---
---

# S210 REVIEW

Three workstreams against the sealed S209 tarball. The content gate gets the scrutiny it deserves:
this is the first authored-content change since S205 and it re-points the hash chain.

## Probes run

| probe | result |
|---|---|
| `vitest run src/lib/mmip + widgets.mmip.o1.s210 + variants.resolver + keyboard + revealGhost.s103 + tone + evaluate.new` | 16 files / **737 passed** |
| `vitest run src/lib/content.widgets.audit.test.ts` (solo per trapB) | **2 passed** (validates every authored widget spec) |
| `vitest run src/lib/variants.test.ts` (solo per trapB) | **3,988 passed** |
| full-tree `diff` vs S209 seal: `content/**`, `src/**`, `mmipTypes.ts`, `engine-capabilities.json` | see below |
| `node` — S205 vs S210 manifest entry-by-entry + S210 manifest vs disk (1701 files) | **exactly 2 changed, 0 mismatches** |
| `node scripts/session/content-change-proof-s151c.mjs` | **passed** |

**4,727 tests green.**

---

## 1. The content gate — verified harder than the ledger claims, and it holds

### (a) Diff discipline

`diff -rq` over the **entire** `content/` tree against the S209 seal returns **exactly two files**:
`sy-02-03.json` and `vec-05-03.json`. Lesson-file count unchanged on both sides.

* **`vec-05-03`** — one hunk. The `widget` object replaced (`mcq` → `matrixTransform`) and the
  `"variant": {"gen": "reflect-compose"}` block deleted. `body`, `conceptTag`, both
  `explanationVariants`, step id and every neighbouring step are byte-identical. No reformatting.
* **`sy-02-03`** — one purely additive hunk: 22 lines inserting step `i4` between `i3` and `ch`.
  Nothing else in the file moved.

Both match the ledger exactly.

### The re-baselining check — this is the one that mattered, and it is clean

Re-pointing `hash:proof`/`hash:snapshot` from `SESSION205_LESSON_HASHES.json` to
`SESSION210_LESSON_HASHES.json` is the moment a content gate can silently absorb unrelated drift.
It did not:

```
S205 vs S210 manifests: 1701 entries each, 0 added, 0 removed
entries whose hash changed: 2
  content/courses/similarity/lessons/sy-02-03.json
  content/courses/vectors-matrices/lessons/vec-05-03.json
S210 manifest vs tree on disk: 1701 checked, 0 missing, 0 mismatches
```

Combined with my earlier passes (S205 manifest ≡ S208 tree, S208 ≡ S209), the chain
**S205 ≡ S208 ≡ S209 ≡ S210 − {these two files}** is intact, and `SESSION205_LESSON_HASHES.json` is
retained on disk so the chain stays auditable. The new baseline blesses nothing that was not
adjudicated. ✓

### (b) The mathematics, hand-verified

**`vec-05-03`.** Reflect over `y = x` is `B = [[0,1],[1,0]]`; reflect over the x-axis is
`A = [[1,0],[0,−1]]`; `A·B = [[0,1],[−1,0]]` ✓, which is rotation by −90°
(`[[cos(−90), −sin(−90)],[sin(−90), cos(−90)]]`) — a 90° **clockwise** rotation ✓, matching
`targetName` and the lesson's own unchanged `explanationVariants`. `det = 0·0 − 1·(−1) = 1` ✓, so
"rotations never change area" is right.

The schema declares the convention at `schema.ts:2747`: *"(ta,tc) = image of î, (tb,td) = image of
ĵ"*. Against that, **all four feedback strings are correct**, which is where a converted spec
usually goes wrong:

| branch | grader condition (`evaluate.ts:1027-1035`) | matrix it fires on | feedback claims | ✓ |
|---|---|---|---|---|
| success | `v == target` | `[[0,1],[−1,0]]` | "î ↦ (0,−1), ĵ ↦ (1,0)", det 1 | ✓ |
| swapped | `v.a==tb, v.c==td, v.b==ta, v.d==tc` | `[[1,0],[0,−1]]` | "a single reflection over the x-axis" | ✓ |
| sign | `v.b==−tb, v.c==−tc` (guarded `tb≠0`) | `[[0,−1],[1,0]]` | "a 90° COUNTER-clockwise rotation" | ✓ |
| fallback | otherwise | e.g. the identity start | "track one basis vector at a time" | ✓ |

All four are **distinctly reachable** for this spec (`tb = 1 ≠ 0` so the sign branch is live; swap,
sign-flip and target are three different matrices), and the identity start hits fallback rather
than a trap. Every required schema field is present; `sa/sb/sc/sd` are supplied as the identity and
differ from the target as the schema requires.

**`sy-02-03`.** Side-splitter at `targetK = 0.6` on `shape [[0,0],[10,0],[3,6]]`, `center [0,0]` = A:
D = (6,0), E = (1.8,3.6); `DE = (−4.2,3.6) = 0.6·(−7,6) = 0.6·BC`, so **DE ∥ BC** ✓.
`AD/DB = 6/4 = 1.5` ✓ and `AE/EC = √16.2 / √7.2 = 1.5` ✓ — the theorem, exactly as the feedback
states. `targetK = 0.6` is inside `[kMin 0.2, kMax 0.9]` and reachable from `kStart 0.3` in three
`kStep 0.1` moves ✓. I checked the obvious trap: three float additions give `0.6000000000000001`,
but the grader is `Math.abs(v.k − targetK) < 1e-9` (`evaluate.ts:544`), so it is safe ✓.
`showRatios: ["segments"]` is a valid enum member whose schema doc (`schema.ts:1411-1413`) describes
precisely this figure.

### (c) The proof-script edit, audited line by line

The script's baseline is **fixed** (`SESSION151_LESSON_HASHES.json`), so `changed` is a cumulative
count of every lesson differing from S151. Two more files now differ, so **807 → 809 is exactly
consistent** with the counting semantics ✓. The AUTHORIZED extension is in the established format
(a `// S210:` batch comment followed by `'path':'reason'` entries, identical in shape to all 30-odd
prior batches) ✓.

**Could the edit mask a future unauthorized change? No, and I checked all three locks:**
* `unexpected` = changed files **not keyed** in AUTHORIZED. The extension is file-keyed, so it
  cannot cover any other path — a third file changing still fails.
* `missing` = AUTHORIZED entries that did **not** change, so a later revert of either lesson fails.
* `changed.length === 809` is an **independent second lock**: a third changed file added to
  AUTHORIZED without bumping the constant gives 810 and fails. The count bump was mandatory, not
  cosmetic.

The gate is exactly as strong for every other file as it was before. ✓ The script runs and passes.

**One blemish:** its success line still prints a hardcoded S151-era denominator —
`content-change proof S151C passed: 809/686 authorized changes` — which is now a nonsensical ratio
in the gate's own report. **Condition 3.**

### (d) The removed variant — required, but a real capability loss the ledger does not name

Removal was **genuinely required**: `variants.resolver.test.ts:576-585` asserts, for every step
carrying a `variant`, that `variantForStep(...)` is non-null and that `v.widget.type ===
d.surface`. `reflect-compose`'s default form emits an mcq, so leaving the declaration on a
`matrixTransform` step fails that invariant. ✓

**But I checked whether a `form:` could have saved it, and none can.** `reflect-compose` declares
`forms: ["basisColumn", "reverseOrder", "matMul"]` (`variants.ts:19301`); `basisColumn` emits
`pointEntry`, `reverseOrder` and the default emit `mcq`, and none emits `matrixTransform`. So
deletion was the only route — **and it is a genuine content-capability regression for that step**.
The generator's own comment says it draws "six genuinely different compositions across three
rotation outcomes"; `k1` now has one fixed problem and no re-askability, permanently.

The ledger (lines 86-97) explains the *mechanism* correctly and at length, but calls the
declaration "stale" and frames removal as clearing "a dangling, structurally-impossible
declaration". It was not stale — **the conversion made it stale**, and the trade (freshness for
manipulability) is never stated as a cost. That is the same species of framing as S208's "no
authored lesson currently grades that position", and it should be named. **Condition 1.**
Mitigating and worth recording: `reflect-compose` retains **7** other declarations in content, so
the generator is not orphaned and its 4 test blocks still earn their keep.

### (e) Validation and grading — green

`content.widgets.audit.test.ts` (which parses and integrity-checks every authored widget spec in
the corpus) passes solo, so both new specs validate. `variants.test.ts` passes solo — 3,988 tests,
including the resolver invariant that motivated the removal. Grading traced by hand above.

### (f) Voice and pedagogy

**`sy-02-03/i4` is the strongest single piece of authoring in this session.** The ledger claims the
numbers were chosen to match the `ch` step; they do, and more exactly than claimed. `ch` reads
*"AD = 6, DB = 4, and AE = 9. Find AC"* (answer 15: `AE/EC = AD/DB = 1.5 → EC = 6 → AC = 15` ✓). At
`targetK = 0.6` on a base of 10, `i4` puts **AD = 6 and DB = 4** on the screen — not merely the same
*ratio* but the same *absolute lengths* the challenge then asks the learner to compute with. The
sequence `i3` (prove △ADE ~ △ABC by AA) → `i4` (watch the ratio stay locked) → `ch` (compute AC) is
prove → see → compute on one figure, and `i4`'s prompt opens with the identical framing clause as
`i3`. Voice and construction both check out.

**`vec-05-03/k1` is weaker than the conversion implies, and this is my one pedagogy objection.**
The old mcq asked the learner to *classify* the composed matrix against three distractors — which is
the lesson's stated claim (`body`: "Two reflections make a rotation"; `conceptTag: vec-compose`).
The new prompt is:

> "Reflecting over y = x, then over the x-axis, **composes to the matrix [[0, 1], [−1, 0]]**. Build
> it and watch what it does."

The graded answer is **printed verbatim in the prompt**. The learner reaches `correct` by
transcribing four numbers into the right four boxes; the classification claim now lives only in
`targetName` and the success text, not in anything the learner answers. The demand does not vanish
— the swapped/sign traps genuinely test the column convention, and the rotating unit square is a
better *readout* than three words — but it has moved from discrimination to construction-with-the-
answer-supplied, and combined with (d) this step is now fixed, un-re-askable, and self-answering.
The fix is one clause: stop printing the matrix (the schema draws the target as a dashed ghost to
build toward, so the task stays reachable). **Condition 2.**

---

## 2. T1 — algebraTiles: diff boundary proven, no schema or grader movement

**The mis-targeted edit left zero trace.** `widgets.tsx` differs from the S209 seal in 16 hunks: one
8-line import block, and fifteen in the region 4943-5215. `AlgebraTilesW` begins at current line
4958, and the hunks just above it are the new `ATValue` doc-comment and type. Offset-correcting for
the import insert, **sealed lines 42-4942 are byte-identical to current lines 50-4950** — which
covers the branching-diagram widget (line ~1311) and every other component in the file. Nothing
outside `AlgebraTilesW` changed. ✓

Two claims verified by diff rather than assertion:
* **`src/lib/schema.ts` is byte-identical to the seal** → "no schema change" is true. ✓
* **`src/lib/evaluate.ts` is byte-identical** → the frozen `{x, c}` grader contract really was left
  alone. ✓ (`src/lib/variants.ts` is also identical, confirming the variant removal was
  content-side only, as the ledger states.)

The section property holds by construction, not by luck: `split(n) = {pos: max(n,0), neg: max(−n,0)}`
gives `pos − neg = n` for every sign and `min(pos,neg) = 0`, so `net(minimal(n)) === n` with no zero
pairs — a well-defined section of the net projection (`algebraTilesModel.ts:124-140`). `normalize`
prefers `mat` when present and reconstructs from `{x, c}` otherwise, so the persisted-derived-value
tie-break is defined rather than ambiguous.

Persisting the net pair alongside `mat` is a deliberate exception to MMIP invariant 1, forced by a
grader contract that may not move. It is **declared in the type's own doc comment**, bounded ("never
read back as truth while `mat` is present"), and the alternative was editing `evaluate.ts`. Correct
call, correctly disclosed.

**Credit where it is due:** `distribute`/`factor` are *not emitted* because the spec has no x² tiles
and the operations would have no honest tile meaning (`algebraTilesModel.ts:33-38`). Faking two
motion verbs to fill out the table would have been invisible in every test. Withholding them and
saying so is the discipline this whole review series has been asking for.

## 3. T2 — linePair: the relation node is legitimate, not a contract violation

**It does not violate "views are never read back."** The RSG contract gives *every* node an optional
`absorb` — RSG_DESIGN's own wording is "omit `absorb` and the node is read-only *at compile time*"
— so a node that both derives and absorbs is the ordinary editable-node shape, not an exception
(the line-family `equation` node has done exactly this since S208). The rule forbids feeding a
derived view `V` back as model input, and `absorbLinePairEdit(c, edit)` takes the **canonical** `c`
and an edit; it never receives a view. Its internal `deriveRelation(c)` call
(`linePairModel.ts:252`) is a *recompute from canonical inside absorb*, structurally identical to
`solveBalanceApply` calling `deriveControls(frame, st)` to decide whether `split` is legal — a
pattern reviewed and accepted in Wave 1. This is MMIP invariant 3 working as designed: an edit made
"in" the relation view is expressed as an edit to canonical state.

The design is careful in the way that matters: `matchSlope` and `setIntersection` both route back
through `absorbLineEdit` so each line's own policy still decides clamping
(`linePairModel.ts:248, 266`) — no duplicated guard logic — and the single refusal
(`setIntersection` on parallel/coincident) is mathematically necessary and separately named for
each case.

**Equivalence vs `key` is the same correct split I validated for `TriangleCanonical`.** `equivalent`
sorts the two `lineIdentityKey`s (`linePairModel.ts:408-411`), so `{L₁, L₂}` and `{L₂, L₁}` are the
same *claim* — right, because a system of two lines is an unordered geometric object — while
`stableKey` distinguishes them, so swapping A and B is a real state change with its own undo entry.
`lineIdentityKey` is `m|b` only, so presentation (window, triangle, domain) correctly does not enter
the claim. Consistent with `mmipTypes.ts:161-163`.

The shared-window duplication is argued honestly (storing it once would leave `c.a` an incomplete
line no single-line derivation could consume) and the invariant is asserted after every edit of a
random walk rather than assumed.

## 4. Cross-cutting

* **`src/lib/mmip/mmipTypes.ts` byte-identical to the S209 seal** — frozen through three more
  workstreams. ✓
* **`scripts/engine-capabilities.json` byte-identical.** ✓
* **Zero existing test files were edited.** The entire `src` delta is: `widgets.tsx` (imports +
  `AlgebraTilesW`) plus five **new** files. Stronger than S209, where five suites were touched for
  renames. ✓
* **Doc split — no.** `docs/RSG_DESIGN.md` is 149 lines. A design doc that can be read in one sitting
  is an asset, and the vertical-line decision, the undo-ownership settlement and the adopter table
  earn their place beside each other; splitting now would scatter exactly the reasoning a Wave-4
  adopter needs in one pass. Revisit when it passes ~400 lines or when a second engine family
  (not a second adopter) appears.

---

VERDICT: ACCEPT-WITH-CONDITIONS

The content change survives the hardest checks I could put to it. Exactly two files differ across
the whole tree; each diff is precisely what was claimed; the re-pointed hash chain differs from
S205 in exactly those two entries and matches the tree on all 1701; the proof script's three locks
are intact and its count bump was mandatory rather than decorative; both specs validate, both grade
correctly through every branch, and both are mathematically right — I re-derived the matrix
composition, the determinant, all four feedback claims against the schema's own basis convention,
and the side-splitter ratios and parallelism from coordinates. `sy-02-03/i4` is better than the
ledger sells it: it hands the learner the challenge step's own AD = 6 and DB = 4 to build by hand
before computing with them. T1's blast radius is proven by an offset-corrected byte comparison —
the reverted mis-edit left nothing — and `schema.ts`/`evaluate.ts` are untouched, so "no schema
change" and "frozen grader" are facts, not claims. T2's relation node is within the RSG contract,
not a breach of it.

Two things are not yet honest on the page, and one number in a proof artifact is wrong. All three
are text.

CONDITIONS:

1. **`SESSION210_CONTENT_CHANGE_LEDGER.md:86-97`** — the variant removal is described as clearing a
   "stale" declaration. It was not stale; the conversion made it so. Add one sentence naming the
   cost: *step `k1` loses re-askability — `reflect-compose` generated six distinct compositions
   across three rotation outcomes for it, and none of its three forms (`basisColumn` → `pointEntry`,
   `reverseOrder`/default → `mcq`, `matMul`) emits `matrixTransform`, so no `form:` could preserve
   the declaration. The generator retains 7 other declarations and is not orphaned.* Record
   "teach `reflect-compose` a `matrixTransform` form" as follow-up work.

2. **`content/courses/vectors-matrices/lessons/vec-05-03.json`, step `k1` prompt** — the graded
   answer `[[0, 1], [−1, 0]]` is printed verbatim in the prompt the learner answers, so the step is
   gradeable by transcription and the classification claim its `conceptTag` names is no longer
   anything the learner supplies. Either drop the matrix from the prompt (e.g. *"…composes to a
   single transformation. Build the matrix that performs it."* — still reachable, since the schema
   draws the target as a dashed ghost to build toward), **or** record explicitly in the ledger that
   the step's graded demand moved from classification to construction and why that is an acceptable
   trade for this lesson. Do not leave it implicit; the adjudication's READOUT gate argued the
   rotating square *replaces* the classification, and that argument should be on the page next to
   the prompt that gives the answer away.

3. **`scripts/session/content-change-proof-s151c.mjs:766`** — the success line prints
   `${changed.length}/686 authorized changes`, so the gate now reports "809/686". Replace `686` with
   `Object.keys(AUTHORIZED).length` (or the current constant) so a content-gate artifact stops
   emitting a number that cannot be true.

DEFECTS_FOUND:

1. **[MEDIUM · pedagogy/assessment]** `vec-05-03/k1`'s new prompt contains the graded answer
   verbatim; the demand moved from discriminating three distractors to transcribing four printed
   entries. Compounded by defect 2. Condition 2.
2. **[MEDIUM · undisclosed capability loss]** `vec-05-03/k1` permanently loses variant
   re-askability; the ledger frames the removal as tidying a "stale" key rather than as a cost of
   the conversion. Condition 1.
3. **[LOW · proof artifact]** Stale `/686` denominator in the content-gate success line
   (`content-change-proof-s151c.mjs:766`). Condition 3.
4. **[LOW · wording]** The compressed AUTHORIZED reason string for `vec-05-03` says
   "prose/answer target unchanged" (`content-change-proof-s151c.mjs:745`). The answer target is
   unchanged and `body`/`explanationVariants` are byte-identical, but the *prompt* was rewritten.
   The ledger body is precise about this; only the one-line reason string is loose.
5. **[INFO · declared exception]** `algebraTiles` persists the derived net pair `{x, c}` beside
   canonical `mat` — a bounded, documented exception to MMIP invariant 1 forced by the frozen
   grader contract, with a defined tie-break (`mat` wins in `normalize`). Correct call; noted so it
   does not become precedent by silence.

NEXT_WAVE_NOTES:

1. **Teach `reflect-compose` a `matrixTransform` form** so `vec-05-03/k1` can regain a variant, and
   check the same trap before any future mcq→manipulative conversion: *does the step carry a
   `variant`, and does its generator have a form serving the target surface?* Add that question to
   the rich-mix adjudication gate list — it is a conversion cost the current four gates (FIT, REACH,
   READOUT, NOVELTY) do not ask about.
2. **A fifth adjudication gate — DEMAND.** Both S210 conversions were adjudicated on whether the
   manipulative *shows* the claim; neither asked whether the learner still has to *supply* it.
   `vec-05-03` is the case that shows why the question is needed.
3. **Carried from S209, still open:** unify the live-region convention across the now-four MMIP
   adopters; move the props→graph reconcile out of the render phase before a fifth adopter; pin
   `TransactionLike` against `SyncTransaction`.
4. **`docs/RSG_DESIGN.md` split — revisit at ~400 lines**, not at 149.

---
---

# S211 REVIEW

Baseline: the S210 seal. **4,955 tests green** across three runs (442 / 524 / 3,989).

## Cross-cutting — all verified by diff, not assertion

| check | result |
|---|---|
| `src/lib/mmip/mmipTypes.ts` vs seal | **byte-identical** ✓ |
| `scripts/engine-capabilities.json` vs seal | **byte-identical** ✓ |
| `content/**` full-tree vs seal | **exactly 1 file** — `vec-05-03.json`, and its diff is exactly the 4-line variant key ✓ |
| `SESSION210_LESSON_HASHES.json` vs the S210-sealed manifest | **exactly 1 entry changed**, `vec-05-03.json`; 0 added/removed; 0 disk mismatches over 1701 ✓ |
| `content-change-proof-s151c.mjs` | passes **809/809**, 1701 lessons ✓ |
| `package.json` | byte-identical ✓ |
| pinned tests | only `variants.test.ts` touched: **+92 / −0** — extended, never weakened ✓ |

**The AUTHORIZED path-keyed claim is correct, and I checked it against the script's actual
semantics rather than the assertion.** `changed` counts lessons differing from the *fixed* S151
baseline; `vec-05-03` already differed and was already keyed, so a second edit to it moves neither
`changed.length` (still 809) nor `unexpected` nor `missing`. The only script edit is the
human-readable reason string (`:745`); the key and the count constant are untouched. ✓

## W1-A — the refactor preserves semantics, and I verified the two hard cases by diff

**Reduced-motion narration is preserved by construction, not by luck.** `useMorphStage.stage`
(`widgetMorph.ts:167-175`) computes
`reduced && !shown.rejected && shown.phases.length > 0 ? shown.phases[0].describe : fallback` —
**character-identical** to the expression it replaced in each widget. S1's independently-pinned
strings cannot drift without this line changing.

**SolveBalanceW's C6 coalescing is equivalent.** Sealed guard:
`key !== null && key === symRun && st.hist.length > 0`. Current:
`morphHistory.continues(key) && st.hist.length > 0`, where `continues` additionally requires
`stack.length > 0`. That extra clause is **redundant, not behaviour-changing**: `runKey` is set
non-null only by a push (which leaves `stack.length ≥ 1`), and both `takeReverse` and `clear` null
it. The one case where the two could differ — a session restored from storage with `hist` populated
but no motion stack — resolves identically, because `symRun`/`runKey` both start `null`. Push and
coalesce branches assign `runKey` exactly as before, and `netPlan`/`plan` land on the stack in the
same slots.

**The `useState` → `useRef` change for the plan stack has no render consequence**: undo enablement
reads `st.hist.length` (SolveBalance) or `graph.canUndo()` (line family), and `depth()` is
referenced only by the helper's own test — nothing renders from motion depth.

**`playMorphPlan`'s ms/stagger/delay arithmetic is identical.** The two additions are my S208
defect 12: the `seen` Set (two-sided actor dedupe) and returning `Animation[]` so `useMorphStage`
can cancel on next-morph and unmount. **The jsdom-inert claim is correct** — the sealed code set the
same `data-morph-*` attributes twice with the same values, and `Element.animate` is absent, so the
DOM observables are unchanged; in a real browser both are the fixes I asked for.

**AlgebraTilesW's missing stagger term: identity proved, not asserted.** Every op in
`algebraTilesModel.ts` is built at a single site (line 296) with `sides: ["mat"]`. One holder ⇒ one
actor per phase ⇒ `buildSinglePhase` sets `stagger: 0`; and a merged phase needs two ops on
*different* sides, which is unreachable when every op names the same holder. So both `stagger` and
`max(0, actors.length − 1)` are identically zero for this engine. ✓

**`recordAs` is a second path, and it can drift — but not today.** `record` maintains `stack` *and*
`runKey`; `recordAs` maintains `stack` only. A widget mixing them would leave `runKey` stale and
`continues()` would answer wrongly. I checked every call site: `AlgebraTilesW` and `SolveBalanceW`
use `record`; `SlopeTriangleW` and `LineExploreW` use `recordAs`. **No widget mixes them.** But
nothing enforces the separation, and `recordAs("coalesce", …)` silently *pushes* when the stack is
empty — so the "widget motion depth === graph history depth" lockstep that settled S208's duplicate
undo ownership is a convention with no check anywhere. **Condition 1.**

## W1-B — the seam is clean and genuinely releasable

The `schema.ts` diff is five `.optional()` fields, **none carrying `.default()`**, plus one
exported pure function; the only other change is a comma after `constFeedback`. Additive,
optional, no-default — verified line by line.

**Nothing outside the new test reads them.** Grepping `targetSquare|squareStart|
partialProductFeedback|frameMismatchFeedback|algebraTilesPartials` across `src/`, `scripts/` and
`content/` returns hits in exactly one file: `schema.algebraTilesArea.s211.test.ts` (15). The two
other `.area` matches are unrelated identifiers in a different widget and in `repSyncGraph`'s own
fixture. So there is **no half-wired state**: the model, evaluator and widget genuinely stop at the
seam, and a spec omitting the fields parses to the object it always parsed to. Releasable. ✓
`algebraTilesPartials` is the multiplication table (`w₁h₁`, `w₁h₀ + w₀h₁`, `w₀h₀`) with a `-0`
normaliser — correct by inspection.

## V — every sub-claim verified numerically

**(a) The collision claim is exactly right.** Of 12 ordered pairs, the 4 with `|i − j| = 2` all
compose to the single matrix `[−1,0,0,−1]` with **both off-diagonals zero**; the kept pool of 8 has
every off-diagonal nonzero, so the sign trap is always a real turn-reversal. One precision fix: the
comment says such a trap "would silently grade correct" — in fact `evaluate.ts:1033` guards
`(tb !== 0 || tc !== 0)`, so the trap would be **unreachable** (the sign-flipped matrix *is* the
target, which hits the success branch first), not mis-graded. The restriction is still correct;
the stated reason is not. **Condition 2.** *Freshness caveat worth recording:* the restricted pool
is **8 distinct prompts but only 2 distinct target matrices** — real prompt freshness, limited
answer freshness.

**(b) The independent route is genuinely independent, and I mutation-tested it.** It parses the
*prompt*, reflects î and ĵ by geometric case analysis on the line name (x-axis → (x,−y); y=x →
(y,x); y-axis → (−x,y); y=−x → (−y,−x) — all four correct), never constructs or multiplies a
matrix, and throws on an unrecognised line name so a prompt rewording fails loudly. I flipped each
of the 8 nonzero entries of the generator's `R` table in turn: **all 8 mutations are detected.** ✓

**(c) The swap algebra is case-correct, and the brief mischaracterised it.** The code does not claim
"y-axis always" — it looks up `SWAP_LINE = {"0,-1,1,0": 2, "0,1,-1,0": 0}`. I verified
`swap(M) === R[SWAP_LINE[M]]` for **every** kept draw: swap(90° CCW) = reflect y-axis, swap(90° CW)
= reflect x-axis. Both branches right. ✓

**(d) DEMAND satisfied.** The generated prompt is *"Reflect over X, then over Y … Build the single
matrix that performs both"* — it does **not** print the answer. My S210 NEXT_WAVE 2 applied. ✓

**(e) The gate branch is real.** It round-trips the answer through the independent route into the
spec fields, asserts each trap is distinct from the answer *and* from the other trap, asserts each
trap **bites** with its own feedback through `evaluate`, checks the fallback lands, and adds
range/integrality/`start ≠ answer`/voice checks. All five requested properties covered. ✓

## W2

**The 44-spec agreement oracle is a transcribed predecessor, not the new path twice.** `affineClean`
is hand-transcribed with its rule stated (`:36`), composed with `rawIntersection`, and the specs are
read off disk. Better: the suite explicitly separates the *two* predecessors and pins `se-03-03`
where raw doubles miss by 1.3e-15 while the cleaned route lands exactly on 3 — with the correct
reasoning that testing against the wrong predecessor "manufactures a disagreement that never
existed on screen". That is the right instinct, stated in the file. ✓

**The systemsExplore distance change cannot touch authored grading — verified by enumeration.** All
five authored specs have distinct rates: `iar-02-02` (1, 0), `les-03-01` (1, −2), `les-04-01`
(3, 1), `se-01-01` (2, −1), `se-01-02` (1, −1). **No authored spec has equal rates**, so a change
that only differs when `m1 === m2` is inert across the corpus, and all five are unique-crossing, so
the verdict surface really is byte-identical today. ✓

**The window-sensitive DOM fixture is sound, not flaky.** No async, no timers, no randomness, no
layout measurement — jsdom returns literal attributes, and the crossing is solved from the rendered
endpoints independently of the wiring under test. Its two brittle points (the `stroke-width="3"`
selector and the hardcoded viewBox height 230) fail **loudly**. The one silent weakness is an
unstated assumption: the single-equation `t` solve is only meaningful because both segments span
the same x-range; if a future change drew them over different extents, `t` could still land in
(0,1) and pass vacuously. Worth one comment, not a condition.

## RSG_DESIGN split — **yes, now**

At 172 lines it has crossed from "one read" into two audiences with different volatility: a stable
**contract** (nodes/edges, the invariant table, the six adoption steps) and an append-only
**decision log** (the vertical-line settlement, undo ownership, per-adopter status, open questions).
Guidance: split by *audience and volatility, not by topic* — keep `RSG_DESIGN.md` as the contract a
Wave-5 adopter reads once, move the dated decisions to `RSG_DECISIONS.md` as an append-only log
where each entry is dated and names what it retires. Leave one line in the contract pointing at it.

---

VERDICT: ACCEPT-WITH-CONDITIONS

The hoist is a genuine refactor: I checked the two places semantics could hide — SolveBalanceW's
coalescing guard and the reduced-motion narration expression — and both are preserved, the second
character-for-character. The AlgebraTiles stagger identity is provable from a single construction
site rather than merely plausible. W1-B's seam is real: nothing outside its own test reads the five
new fields, so stopping there ships nothing half-wired. Every one of V's five claims survived
independent numeric checking, including a mutation test that the oracle catches all 8 single-sign
corruptions, and the generator applies the DEMAND gate I asked for in S210. W2's agreement oracle is
a hand-transcribed predecessor that even distinguishes the two candidate predecessors, and the
equal-rates enumeration closes the process-evidence question. Content moved by exactly one key in
exactly one file, the hash chain reconciles at 809/809 and 1701/1701, and the one pinned suite that
changed only grew.

Two conditions, both small.

CONDITIONS:

1. **`src/lib/mmip/widgetMorph.ts:205, 237-243`** — the `record`/`recordAs` split has no guard.
   `recordAs` never touches `runKey`, so a widget mixing the two paths would silently get wrong
   run-detection, and `recordAs("coalesce", …)` quietly pushes when the stack is empty, so a
   widget/graph depth desync produces an extra undo step rather than an error. Either (a) have
   `recordAs` take the graph's expected resulting depth and assert against `stack.current.length`,
   or (b) make the two paths mutually exclusive at the type level (one hook returns `record`, the
   other `recordAs`) so mixing cannot compile. Add one test that a `recordAs` engine's motion depth
   tracks its graph's history depth across a coalesced run plus an undo — the lockstep that settled
   S208's duplicate undo ownership is currently a convention with nothing checking it.

2. **`src/lib/variants.ts:19315-19319` and the `composeMatrix` body** — two fixes in the same block.
   (i) Correct the stated reason for the `|i − j| ≠ 2` restriction: with both off-diagonals zero the
   sign trap is **unreachable** (the "flipped" matrix equals the target and hits the success branch,
   and `evaluate.ts:1033` guards the branch off anyway), not "a trap that would silently grade
   correct". The restriction is right; someone relaxing it on the current wording would conclude the
   harm is smaller than it is. (ii) Replace the non-null assertions `SWAP_LINE[M.join(",")]!` and
   `OPPOSITE[name]!` with a throw. If the draw restriction ever regresses, today's code emits
   `"a single reflection over undefined"` into learner-facing feedback, and the variants gate's
   length- and voice-checks would not catch it.

DEFECTS_FOUND:

1. **[LOW · unchecked invariant]** `recordAs` lockstep with `repSyncGraph` history depth is
   unasserted; the two record paths can drift if ever mixed. Condition 1. Not live — no widget mixes
   them.
2. **[LOW · inaccurate rationale]** The `|i − j| ≠ 2` comment misstates the failure mode it prevents.
   Condition 2(i).
3. **[LOW · silent-garbage risk]** `SWAP_LINE`/`OPPOSITE` non-null assertions would put `undefined`
   into learner-facing prose if the draw invariant regressed. Condition 2(ii).
4. **[LOW · freshness]** `composeMatrix`'s restricted pool gives 8 distinct prompts but only **2**
   distinct target matrices, so a re-asked learner sees the same answer half the time. Honest for
   one step; record it so the restored variant is not later cited as full freshness.
5. **[LOW · latent test weakness]** The affine window fixture's `t` solve assumes both drawn
   segments share an x-range; a future change to the plotted extent could make it pass vacuously.
   One clarifying comment or an x-range assertion closes it.

NEXT_WAVE_NOTES:

1. **Split `docs/RSG_DESIGN.md`** as described above (contract vs dated decision log).
2. **The algebraTiles area seam** is now the largest un-landed surface in the repo: five schema
   fields with no reader. Land the model/evaluator/widget together or remove them — an optional
   field nothing reads is invisible to every gate and ages badly.
3. **Carried and still open:** unify the live-region convention across the four MMIP adopters; move
   the props→graph reconcile out of the render phase (now in three widgets); pin `TransactionLike`
   against `SyncTransaction`.
4. **Teach `reflect-compose` a fourth outcome** if `composeMatrix` is ever re-asked heavily — the
   180° pair is excluded for a good reason, so widening freshness means a different mirror family,
   not relaxing the guard.

---
---

# S212 REVIEW

Baseline: the S211 seal. **1,081 tests green** (455 / 624 / 2).

## 5. Cross-cutting — clean

`content/**` **byte-identical** to the seal (zero changes, as expected). `mmipTypes.ts`,
`scripts/engine-capabilities.json`, `package.json` all byte-identical. `schema.ts` is the new
`SystemsLineEditSpec` plus `editLine1`/`editLine2` as `.optional()` with **no `.default()`** — the
only removed line is a comma. `content.widgets.audit` passes solo, so the schema change disturbs
none of the 1701 lessons.

**Pinned-suite judgment — all five touched files are additive or *stronger*:**
`algebraTiles.harness` +88/−0, `lineFamily.harness` +91/−0, `solveBalance.harness` +61/−0 (purely
additive). `algebraTilesModel.test.ts`'s `mat` helper gained defaults plus an `extra` override, so
every existing call site keeps identical semantics. And the two flagged mat-shape assertions in
`widgets.mmip.o1.s210.test.tsx:106,125` kept **`toEqual`** and simply spell out
`sqPos: 0, sqNeg: 0, framed: false`. Under exact deep equality that is the strictest possible
update: it now pins that a classic spec never leaks a square tile or a closed frame. **Documenting
and strengthening, not weakening.** ✓

## 1. evaluate.ts — both gates provably closed, both transcriptions faithful

The diff is four hunks, and the **only removed lines are the import and the two
`const v = value as …` declarations** (widened for the new optional shapes). I compared both old
paths against the sealed file line for line: `systemsExplore`'s four lines and `algebraTiles`'
three lines stand verbatim below their gates. "Reduces literally to the code it always was" is true.

**Gates closed for all shipped content, verified by enumeration:** 5 authored `systemsExplore`
specs, **0** with `editLine1`/`editLine2`; 27 authored `algebraTiles` specs, **0** with
`area`/`targetSquare`/`squareStart`.

**The transcription pins are genuine.** `preS213` (`evaluate.systemsLines.s213.test.ts:17-27`) and
`preS212` (`evaluate.algebraTilesArea.s212.test.ts:20-24`) are standalone hand-written functions
that never call `evaluate`; I checked each against the sealed source and both reproduce it line for
line, including the guard strings. Not the new code called twice. ✓

**The degenerate decision: the grading is right, the message is not shippable-by-default.**
Grading coincident as incorrect is correct and I would have argued for it — `on1 && on2` would hand
out `successFeedback` for collapsing the system, i.e. reward destroying the question, and
`correctAnswerText` already divides by `(m1 − m2)` so a degenerate system has no answer to name.
The problem is the borrowed string: in the coincident case the learner's point **is** on both lines
and the reused chain tells them it is off one. The code flags this honestly and names the fix.

Unreachable today — but everything *else* about the capability is now landed: the schema accepts
`editLine1`, the adapter wires it, the widget renders it, and `evaluate` grades it. An author who
enables it tomorrow inherits a learner-facing statement that is false, with nothing stopping them.
That is the same half-wired shape I flagged for the algebraTiles area fields in S211, except here
the reader landed and only the string is missing. **Condition 1.**

## 2. The decomposition invariant — hand-verified

* **3(x + 2) → 10.** `algebraTilesPartials([0,3],[1,2])` = `{square: 0·1 = 0, x: 0·2 + 3·1 = 3,
  unit: 3·2 = 6}` → 9 placements + 1 outline lift = **10** ✓, matching the test's own stated
  arithmetic (`1 + 3 + 6 = 10`, `algebraTilesModel.test.ts:229-230`).
* **(x + 2)(x + 3) → 13.** `partials([1,2],[1,3])` = `{square: 1, x: 1·3 + 2·1 = 5, unit: 6}` → 12 +
  1 = **13** ✓. `FACT_SPEC`'s initial state `{xPos: 5, uPos: 6, sqPos: 1}` and derived sentence
  `"x² + 5x + 6"` agree — and (x+2)(x+3) really is x² + 5x + 6.
* **`distributePartial`'s a(x + b)-only refusal is mathematically motivated, not convenience.** The
  misconception it names requires a *scalar* multiplier outside the bracket that can stop at the x;
  for (x + a)(x + b) both edges are binomials, so there is no distinguished "stopped early" state —
  omitting any of the four cells would be equally arbitrary. The refusal message
  (`algebraTilesModel.ts:602-605`) says exactly that; the partial's unit count is `height[1]`, i.e.
  one copy of b instead of a of them; and `evaluate.ts:1676` mirrors the condition as
  `spec.area.width[0] === 0` (no x-part in the width ⟺ scalar multiplier). Model and grader agree
  on the same criterion. ✓

## 3. Widget regression

**Blast radius:** imports, `AlgebraTilesW` (6 hunks), `SystemsExploreW` (11 hunks), and one hunk
that is the `SystemsExploreW` preamble comment. Nothing else in the file moved.

**The `byType` claim is true but undersells itself.** Three suites resolve samples by first match —
`widgets.keyboard.test.tsx:19`, `widgets.aria.test.tsx:46`, `evaluate.learnerAnswer.test.ts:10` —
not one. Placing the area sample after the classic satisfies all three (all green), but the comment
in `widgetSamples.ts:1289` credits only "the keyboard gate", so a load-bearing ordering invariant is
documented for one of its three dependents.

**A React `Received NaN for the y1/y2 attribute` warning surfaced during run 2.** I chased it:
`AlgebraTilesW` renders no `y1` attribute at all, `SystemsExploreW`'s grid `y1`/`y2` come from
unchanged `spec.yMin`/`yMax`, and **no changed hunk in `widgets.tsx` touches a `y1`/`y2`
attribute** — so S212 did not introduce it. It is pre-existing and a green suite is swallowing it.
Not a blocker for this wave; worth a separate chase.

## 4. Persistence

**No classic-spec path can write the lines envelope — I tried to construct one.**
`systemsPairPersist` (`systemsPairAdapter.ts:160-172`) is the single writer and emits `lines` only
when a parameter differs from the authored spec. For a classic spec: the line controls sit behind
`{editable && …}` with `editable = systemsPairEditable(spec)` false; the undo path restores prior
canonicals, which never moved; the point path passes `canonical` through untouched. So `untouched`
is always true. ✓ Residual: `untouched` is float equality on `ratToNumber` round-trips — exact for
all five authored specs because every m/b is an integer, but a future non-integer spec could write
an envelope spuriously.

**S210-era persisted values normalize identically.** `algebraTilesNormalize:222-233` reads a
four-population `mat` and falls back to `start.sqPos`/`start.sqNeg`/`start.framed`, which for a
classic spec are `0/0/false` — exactly what the two updated assertions now pin. ✓ (Prose slip: the
comment says "the two new fields" where there are three.)

**The `accept()` fix is a real find and the harness earned its keep.** Sealed code returned `ops`
unconditionally, so `reset` on an untouched board produced `changed: false` with one `restore` op —
a violation of the frozen contract (`MMIP_V1_API.md` §3: "`ops` is empty exactly when nothing
happened or the edit was refused"), caught by S209's `transactionCheck`. The fix is right. **But it
has an unpinned observable consequence:** `transactionSentence(tx)` for that reset now returns
"Nothing changed." where it previously returned "Put every tile back where the problem started.",
and that string reaches the live region. Nothing pins either string for reset-on-untouched.
**Condition 2.**

---

VERDICT: ACCEPT-WITH-CONDITIONS

The hottest file came through cleanest: four hunks, two removed declarations, both old paths
verbatim, both new gates closed by enumeration over all 32 shipped specs, and both transcription
pins genuinely hand-written rather than the new code called twice — I checked each against the
sealed source. The decomposition counts are right by hand (10 and 13), and `distributePartial`'s
refusal is motivated by the mathematics rather than by convenience, with the model and grader
agreeing on the same criterion. No classic path can write the systems envelope; S210-era mats
normalize unchanged; content is byte-identical; and every touched pinned assertion got *stricter*.
The `accept()` bug is the best thing in the wave — a frozen-contract violation found by the harness
that was built to find exactly that.

Two conditions, both small.

CONDITIONS:

1. **`src/lib/evaluate.ts:481` (the `m1 === m2` branch) — make the unshippable state explicit
   rather than latent.** The systems-editing capability is now fully wired end to end, so an author
   can set `editLine1` at any time and inherit a message that tells a learner they are off a line
   they are standing on. Either add `degenerateSystemFeedback` to `SystemsExploreSpec` (required
   whenever `editLine1`/`editLine2` is present) and use it in both degenerate branches, **or** add a
   `widgetIntegrityErrors` rule that refuses a `systemsExplore` spec carrying `editLine1`/
   `editLine2` until that field exists. Do not leave a knowingly-wrong learner-facing string
   reachable by a one-key authoring change; the comment documents the defect but nothing prevents it.

2. **Pin the reset-on-untouched announcement.** The `accept()` contract fix silently changes what
   `transactionSentence` returns for `reset` on an unmoved board ("Put every tile back where the
   problem started." → "Nothing changed."), and that text reaches the `role="status"` region. Add
   one assertion — in `widgets.mmip.o1.s208.test.tsx` or `solveBalance.harness.s208.test.ts` —
   pinning whichever wording is intended, so a correct contract fix does not carry an unnoticed
   copy change. (If "Nothing changed." is judged worse for the learner, the fix is a `restore` op
   emitted only when `changed`, not a revert of `accept()`.)

DEFECTS_FOUND:

1. **[MEDIUM · reachable-by-one-key]** The degenerate-system message is knowingly wrong for the
   coincident case and nothing gates the capability that reaches it. Condition 1.
2. **[LOW · unpinned copy change]** Reset-on-untouched now announces "Nothing changed."
   Condition 2.
3. **[LOW · comment overstates the code]** `evaluate.ts:1663-1665` says the tiles "are checked too
   rather than trusted", but the `framed` branch returns `correct: true` **before** any tile check;
   the tile checks run only on the not-framed paths. Ambiguous at best in a grader comment.
4. **[LOW · undocumented invariant]** "Classic sample must stay first in `widgetSamples.ts`" is now
   load-bearing for three suites (`widgets.keyboard`, `widgets.aria`, `evaluate.learnerAnswer`); the
   comment at `widgetSamples.ts:1289` names only one.
5. **[LOW · pre-existing, unchased]** A React `Received NaN for the y1/y2 attribute` warning is
   emitted during the sample sweep. Verified **not** introduced by S212 (no changed hunk touches a
   y-attribute), but a green suite is swallowing it.
6. **[LOW · prose]** `algebraTilesModel.ts:223` says "the two new fields" where three were added.
7. **[INFO · latent]** `systemsPairPersist`'s `untouched` test is float equality on `ratToNumber`
   round-trips; exact today because every authored m/b is an integer.

NEXT_WAVE_NOTES:

1. **Add `degenerateSystemFeedback`** and make the systems-editing surface authorable — it is one
   string away from usable, and this is the last thing holding it back.
2. **Chase the NaN warning** (defect 5) and consider failing the suite on unexpected React
   warnings; a green run that prints NaN is a gate with a hole in it.
3. **Assert on the resolved sample** in the three `byType` consumers rather than relying on array
   order, so the ordering invariant stops being tacit.
4. **Carried and still open:** unify the live-region convention across the MMIP adopters; move the
   props→graph reconcile out of the render phase (now in four widgets); pin `TransactionLike`
   against `SyncTransaction`; the `recordAs` lockstep check from S211.
