# S240 — the last 5 NOT-POSSIBLE rows close; two new engines; one collision defect found and fixed

**Session date:** 2026-08-13 · **Base:** `80a5c1c` (S239 final commit, WS-C closed) · **Canonical
plan:** `OPTIMIZATION_PLAN_V3.md`. Continues the user-approved queue: WS-C (done, S239) → **the 5
remaining NOT-POSSIBLE rows (this wave)**. Also closes two smaller items the user ruled on
mid-wave: the MathProse markdown-bold rendering gap (`cpr-01-03/i1`), and elapsedTime's zero
graded-practice exposure (`mmt-04-03`).

## Baseline verification (before any change)

typecheck clean · vitest 13,310 (9,762 + 3,548, two shards, both exit 0) · both opt-in sweeps
EMPTY · validate:content 1840/1840 · lint:pedagogy 1711/1711 · proof 871/871 ·
check-registration consistent. Matches `HANDOVER_COWORK_S239.md` §1 exactly.

## What this wave built

### The 5 NOT-POSSIBLE rows (`COWORK_CACHE/needs-manipulative-s237.csv`), all "alongside" shape

Each is a new `kind:"interactive"` step inserted immediately before an existing graded check, the
check's own id/prompt/answer/wrongPaths copied byte-for-byte from the authored source — never
retyped — and re-verified identical by `manipulativeAlongside.s237.test.ts`.

1. **`pr-04b-02/k3`** — `percentBar` gains a **flat-fee structure**: a fixed-width lead segment
   (`flatFee`, `feeLabel`) sits beside the existing percent track and holds still while the
   percent segment grows or shrinks, so the learner sees "fixed part + scaling part" as two
   physically different objects without the widget ever printing the combined total (the "don't
   print the answer" constraint — the combined total is k3's own answer). `flatFee` defaults to
   `0`, under which this whole branch is inert and all 10 pre-existing `percentBar` instances
   render byte-identical. Inherits the fill-edge drag `percentBar` already had from WS-C.
2. **`iar-03-01/ch1`, `iar-03-03/ch1`** — **`feasibleRegionExplore`**, a new engine (built this
   wave after the user's explicit approval of "build a small feasible-region widget" over the
   alternative of reusing `systemsExplore`). Draws a feasible region from a slanted constraint
   (`slantM`, `slantB`) clipped by a draggable **vertical fence** (`x ≤ verticalStart`, snapped to
   `verticalStep`, wired the same `useSvgDrag` substrate as WS-C's engines); the region's corners
   re-derive live via `feasibleRegionCorners(slantM, slantB, vertical)` — the same general
   function the schema exports and the gate audits against, so the picture is honest for any
   spec, including `iar-03-03`'s non-integer `(5, 1.5)` mixed corner. The FENCE is the learner's
   object, because that is literally what both host challenges ask about ("add a flour limit
   x ≤ 4", "the dough limit relaxes to x ≤ 5").
3. **`pp-04-01/k1`, `k2`** — **`parametricTrace`**, a new engine: a direction tracer for
   parametric curves. Two modes sharing one schema — **line** (`x = lineX0 + t`,
   `y = lineYK · t`) for k1, **circle** (`x = cos t`, `y = sin t`) for k2 — where dragging the
   point forward along the path accumulates a signed running angle/parameter (continuous, no
   backward-wrap at the circle's seam) and the traveled arc grows a trail of direction arrowheads
   behind the point. The POINT is the learner's object in both modes.

Both new engines wire `onEvent?.({control, dir})` from their drag setters (the same evidence
contract WS-C's engines use), which is why both need `adapt:3` in `engine-capabilities.json` —
see the gate catch below; I initially got this wrong.

### Two rulings from mid-wave `AskUserQuestion`s, both closed

4. **MathProse markdown-bold rendering gap** — `cpr-01-03/i1`'s authored `spinnerSim` prompt uses
   `**or**` and the widget-prompt pipeline didn't render it, so the learner saw literal asterisks
   (flagged in `HANDOVER_COWORK_S239.md` §4 item 5). User chose "fix the renderer" over rewriting
   the prose. Fixed in `src/components/math/MathText.tsx` (+ `MathText.test.tsx` coverage) —
   confirmed in this session's browser QA (`S240_SCREENSHOTS/13`): the prompt now reads "...a
   multiple of 3 OR a multiple of 4?" with no stray `**`.
5. **elapsedTime's zero graded-practice exposure** — `mmt-04-03`'s only authored step
   (`e1`) was a worked example (flagged in `HANDOVER_COWORK_S239.md` §4 item 6). User chose
   "author a new practice step now." Added `i4` (a second practice instance, recess
   10:05→10:35/30min, matching `e1`'s shape) and **`k4`, a new GRADED elapsedTime check** (movie
   1:20→1:50/30min) directly after it — the engine's first-ever graded exposure. `e1` and every
   pre-existing step stayed byte-identical.

## Gates — extended correctly, and caught two real gaps

`manipulativeAlongside.s237.test.ts` grew 17 → **22 rows** (5 new), including `percentBar`'s
first appearance as an *inserted* engine in this gate (previously only served as a downstream
check elsewhere) — its `space()`/`openedOn()`/mutation-discrimination cases didn't exist yet and
had to be added, not just extended by analogy. 159/159 passing.

`widgets.drag.test.tsx` grew 125 → **138 cases** (13 new): `percentBar` flatFee (drag-value
pinning against the fee-shifted geometry, fee-segment presence, `flatFee:0` absence, slider
parity), `feasibleRegionExplore` fence drag (press-to-target and clamp-to-range for both
`iar-03-01` and `iar-03-03`'s numbers), `parametricTrace` point drag in both modes — including
the circle mode's multi-step accumulation sequence proving continuous forward angle tracking with
no backward-wrap at the seam. Every pixel coordinate was hand-derived from the components' own
mapping formulas and passed on the first run — a real confidence signal on both the component
math and the derivation, not just the gate.

**What the gates caught that I had gotten wrong building the two new engines:**

1. **Two registration surfaces I had missed originally** — `REGISTERED_WIDGETS` (the flat array
   in `widgets.tsx` cross-checked by `widgets.registry.test.ts`/`widget-coverage.test.ts`) and
   `scripts/engine-capabilities.json` itself (that file's own test comment calls it "the ninth
   surface... the only one not type-checked"). Both engines were fully wired everywhere else
   (schema, evaluate, pedagogy, renderer, stageWidth, widgetSamples, keyboard gate) but silently
   absent from these two, which is exactly the kind of gap a partial checklist ships quietly.
   Found via 4 failing test files on the first full run, closed by adding both entries, confirmed
   against the authoritative `scripts/audit/engine-registration-contract.mjs` (129/129
   core-complete) rather than trusting the patch alone.
2. **`adapt:0` was wrong for both new engines.** `engineCapabilities.test.ts` asserts `adapt=3`
   iff the component source literally contains `"onEvent"` — I had mirrored `polarTrace`'s vector
   by analogy instead of checking the actual rule, and both new components genuinely do wire
   `onEvent`. Corrected both to `adapt:3` in `scripts/engine-capabilities.json`.

## The defect this session found and fixed: percentBar flatFee label collision

`COLLISION_SWEEP=1 npx vitest run src/components/collisionSweep.s238.test.tsx` (the opt-in
label-geometry sweep, re-run after every widget change per house rule) surfaced a real,
session-introduced collision: the flat-fee segment's `<text>` label and the pre-existing "0%"
percent-track tick label rendered at the **identical y-coordinate** (`barY - 6`), and their
modelled boxes overlapped both axes — confirmed across all 3 UI tones for the sole authored
instance, `pr-04b-02/i2b`.

**Fix** (`src/components/widgets.tsx`, `PercentBarW`): moved the fee label's `y` from `barY - 6`
to `barY - 18`, giving it its own row clear of the tick-label row rather than sharing one — chosen
over shrinking the font or repositioning horizontally because it fixes the root cause
(row-sharing) independent of `feeLabel` string length. Verified three ways: the collision sweep
re-run is clean (`label-collision-remainder-s238.csv` has zero data rows, `specs swept: 11957`,
`unmodellable texts: 288` — both unchanged in kind from before the fix, only the count of swept
specs moved, from this wave's new samples); the real-browser 1440px capture
(`S240_SCREENSHOTS/01`) shows "flat fee" sitting cleanly above and clear of "0%"; and the targeted
+ full vitest re-runs below show no ripple.

## Real-browser 1440px QA (13 captures, `S240_SCREENSHOTS/`)

Seeded directly to each target step via `localStorage` (same technique as
`e2e/wave04-math-rendering.spec.ts`'s `seedStep` — no manual click-through needed), screenshotted
against `next start -p 3100` with the throwaway script `scripts/qa/s240-screenshot-qa.mjs` (kept;
not a `.spec.ts`, so it cannot inflate the playwright count the way a leftover capture spec would
— the S238 trap). All 13 read clean, 0 Next.js error overlays:

- `01`/`02` — `pr-04b-02` i2b (the fixed percentBar flatFee) and k3, the check right after.
- `03`–`06` — `iar-03-01` and `iar-03-03`'s `feasibleRegionExplore` insertions and their ch1s.
- `07`–`10` — `pp-04-01`'s `parametricTrace` line mode (i1b/k1) and circle mode (i2/k2).
- `11`/`12` — `mmt-04-03`'s new elapsedTime `i4` and the new **graded** `k4`.
- `13` — `cpr-01-03/i1`'s markdown-bold fix, zoomed and confirmed no stray `**`.

Every check/challenge screenshot's prompt and option text was read against the gate row's
`servedPrompt`/`servedAnswer`/`servedWrongPaths` strings and matches verbatim.

## Gate results at session end

```
typecheck                clean
vitest (2 shards)        13,383 passing   (9,782 + 3,601; +73 vs S239 baseline; both EXIT:0)
playwright               132 / 132        ALL 5 projects, vs next start -p 3100
COLLISION_SWEEP=1        EMPTY            re-run after the widgets.tsx fix; 0 rows, 0 percentBar
FIGURE_SWEEP=1           EMPTY            figures.tsx untouched, re-verified anyway
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     873 / 873        871 -> 873: 2 new AUTHORIZED keys (pp-04-01,
                         mmt-04-03); pr-04b-02/iar-03-01/iar-03-03 already had entries from
                         earlier sessions and got appended reason clauses, not new keys
validate:native          archive-only findings (node_modules, .next) — expected
check-registration       consistent
build                    EXIT:0           re-run after the collision fix; BUILD_ID confirmed
                         newer than the widgets.tsx edit before next start / playwright ran
gen:reports              head green; exits 1 at place-value-transform-mutations-s145 M28
                         (34/35) — PRE-EXISTING, unchanged, documented since S145 and carried
                         forward unfixed through S238 and S239; not attempted here either
```

Both opt-in sweeps and the full suite were re-run a second time, after the collision fix, before
any of the above counts were written down — nothing here is pre-fix numbers.

## Content/registration defects investigated this session, found to be non-issues

- `src/lib/masteryMission.server.ts`'s `DIRECT` set already listed both new engines correctly
  (an 11th-ish registration surface not enumerated in prior handovers' "10 core surfaces" list —
  it was done correctly as part of the original engine build, this session just verified it via
  `git diff` rather than assuming).
- A visual read of the `feasibleRegionExplore` screenshots first *looked* like an inconsistent
  Check-button enablement between `iar-03-01` and `iar-03-03` (one looked disabled, one looked
  enabled, at a glance in a shrunk preview). Traced to source: `canCheck()` returns `true`
  unconditionally for `percentBar`/`feasibleRegionExplore`/`parametricTrace` (no gating on
  interaction), so both should always render enabled. Re-examined via pixel-level crops, not
  visual guesswork: both are in fact fully opaque/enabled. No code defect; the first read was
  wrong and this note exists so the next session doesn't re-open it.

## What S240 did NOT do (open, per Plan v3)

- WS-A brand productionization, WS-H landing rebuild, WS-J avatars (concept boards only) · WS-E
  prediction purge · WS-G MCQ factory · WS-F sound/voice.
- Hero tier: still empty by design (unchanged rationale from S239 §2 — 1440px pointer QA is a
  precondition, not yet run against the two new engines' own hero candidacy).
- `pv-03-03/k1`, `pv2-04-03/k3`, `pc-03-01/k2`, `cpr-05-03/k2` — the four rows that must NOT be
  converted without a separate user ruling (conversion changes what is graded). Still untouched.
- No gate compares option labels for near-duplication (S238 §4's class) — still worth building.
- Grade-vocabulary CSV and the other §4 defects carried in S238/S239 — true as of this wave's
  commit. **Superseded the same day by a post-commit re-audit — see the addendum below.**

---

## Addendum (same session, after the wave commit): grade-vocabulary CSV re-audited, closed

Written after `c058a2b` landed, prompted by asking "what's next" and finding the standing queue
actually empty. Before proposing new scope, the oldest carried-forward item — the
grade-vocabulary CSV, called "the highest harm-per-effort item" in every handover since S238 —
got a fresh look instead of another unverified restatement.

**Finding: all 60 flagged surfaces are already fixed. None of S238/S239/S240 had re-checked the
claim against live content — each just repeated the prior session's line.** Verification method,
in order of rigor: (1) whole-file substring search for each row's exact CSV text and bare term;
(2) a precise per-step search — locate the exact lesson/step the row names (including `remedials`,
which a first pass missed and briefly over-counted as "step gone"), then search only within that
step's JSON subtree; (3) manual full-JSON reads of a spread of ~10 rows across all 6 terms,
covering every status the script produced.

Result: zero rows are byte-identical to the S237 CSV text. Two rows (`la-02-02`/`la-03-02`,
`invariant`) still contain the term — but only inside the internal `cml` authoring-metadata block
(`kernel: "spatial-invariance"`, an `invariants` id array) that is never rendered to a learner;
both steps' actual learner-facing `body` text was already reworded ("make the right-angle
invariant visible" → "show that the right angle stays the same"; "their invariant sum" → "their
sum, which never changes"). Every other row is either reworded in place or its step was
restructured away entirely. Confirmed examples, old → new:

- `g2a-01-02/c1`: "the ONES digit carries the verdict" → "the ONES digit tells you"
- `fr-03-01/k3`: "Repair Rio's reasoning" / "What's the repair?" → "Fix Rio's thinking" / "What
  should we tell Rio?"
- `fr-04-02/i2`: "That verdict belongs to the 3/4 duel" → "That answer belongs to the 3/4 duel"
- `kgb-03-04/c1`: "Composition scales: four small triangles…" → "Shapes build bigger shapes: four
  small triangles…"
- `g1e-01-01` (`rem-g1e-equal-meaning-c`): "checking the claim" → "checking if it is true"
- `md-01-02`, `g4s-03-02`: both `reasoning` instances — confirmed zero occurrences of the word
  anywhere in either file (grepped raw, not just the flagged step).

This was not this session's edit — someone else's session fixed the prose at some point after
S237 without updating the backlog line (the repo's root `CLAUDE.md` describes a separate,
parallel "variant generation" workstream on this same content; that is the likeliest author, though
this addendum does not attempt to identify which session). `COWORK_CACHE/grade-vocabulary-s237.csv`
is left in place as a historical artifact — nothing reads it programmatically (checked) — but it
no longer describes current content and should not be re-flagged as open without re-checking first.

**Process note for future sessions: a standing "still open, unchanged" line in a handover is a
claim, not a fact, once enough time or parallel work has passed. Re-verify before restating it,
the same way a gate result is re-run rather than assumed.**

---

## Addendum 2 (same session, commit `3324778`): the near-duplication gate, built; `dc-02-01/ch1` fixed

S238 §4 had flagged, and every handover since carried forward unbuilt: "no gate compares option
labels for near-duplication." Investigated before building anything, and the real gap was
narrower than the label suggested.

**What already existed.** `fractionEntry` and `pointEntry` both already had a same-value
trap-collision integrity check in `schema.ts` — two distractors (or a distractor and the answer)
sharing a value is already rejected for those two widget types. `numeric` had no equivalent.
`evaluate.ts`'s numeric grading branch resolves via `commonErrors.find(e => e.value === v)` — an
array scan that returns the *first* match — so if two `commonErrors` entries happened to share a
value, the second one's diagnosis is silently unreachable: any learner whose wrong answer matches
that value gets the first entry's feedback, never the second's, and nothing in the existing gate
suite would have caught this.

**What was built.** A same-value check for `numeric` added to `pedagogy.ts`'s lint pass, matching
the existing `fractionEntry`/`pointEntry` shape. Plus a second, `mcq`-specific check that doesn't
fit the "shares a graded value" model at all: two `mcq` options whose *label text* is identical
after normalization (case/whitespace-insensitive comparison) — a learner cannot tell two such
options apart regardless of which one is marked correct, independent of anything about grading
values.

**Swept the full corpus before landing either check**, not just the two lessons already suspected:
1,701 lessons, every `mcq` and `numeric` widget. `mcq`'s new check found zero hits — no corpus
instance of the duplicate-label defect exists today. `numeric`'s new check found exactly one:
`dc-02-01/ch1`, already known and carried frozen/unfixed since S238 §4 ("found by the alongside
gate in wave 18").

**Why `dc-02-01/ch1` collides, and why it's not an authoring error.** The step's two
`commonErrors` traps are a sphere-surface-area slip (`4·π·r²`) and a sphere-volume slip
(`(4/3)·π·r³` computed while dropping the `π` factor) — two genuinely different misconceptions.
At this step's specific radius, `r = 3`: `4·π·(3)² = 36π ≈ 113.1`, which the surface-area trap
reports rounded; separately, `(4/3)·π·(3)³` with `π` dropped is `(4/3)·27 = 36` exactly. Both
traps' *displayed* values landed on the same integer, `36`, purely as a numeric coincidence of
this particular radius — not because either trap's formula was mistyped.

**Fix chosen: merge the two diagnoses into one, rather than change the number or ship the gate
red.** Changing `r` would dodge the coincidence rather than address it, and would touch an
authored, presumably-reviewed example value outside this task's scope. Instead, the single
`commonErrors` entry at value `36` now names *both* slips in its feedback text ("...whether you
dropped the π from the volume formula or read off the surface area instead...") so a learner who
lands on 36 via either route gets a diagnosis that's still true of what they likely did, instead
of one trap's diagnosis silently overwriting the other's. Answer, tolerance, and which values grade
right/wrong are all unchanged — this is explanation text only.
`manipulativeAlongside.s237.test.ts`'s `dc-02-01/ch1` row was pinned to the pre-fix feedback text
by design (so it would correctly go red the moment the fix landed, proving the pin was live, not
stale) — updated to match post-fix.

**Deliberately not covered:** near-duplicate-but-*distinct* label text (S238 §4 defect 1's class,
`g2g-01-05/k3` — e.g. two options that say almost-but-not-quite the same thing) is a semantic
judgment call. A mechanical string-similarity threshold would false-positive on legitimately
close-but-different options as often as it would catch real duplicates; noted inline in the lint
source so a future session doesn't re-attempt it as a quick follow-on without first solving the
false-positive problem.

**Gates:** typecheck clean; vitest 13,383 passing (9,782+3,601, both shards EXIT:0, 0 new
failures vs. the `c058a2b`/`d31ea6a` baseline); validate:content 1840/1840; lint:pedagogy
1711/1711 (the two new checks active and green against the full corpus — zero violations beyond
the one instance fixed here); validate:native archive-only (node_modules, .next);
check:registration consistent; build EXIT:0.

---

## Addendum 3 (same session, commit `c88d91b`): the three held-back rows converted, per user ruling

Four rows had been carried as "must NOT be converted without a user ruling" since S238 §3.2/§4:
`pv-03-03/k1`, `pv2-04-03/k3`, `pc-03-01/k2`, `cpr-05-03/k2` — each an `mcq` identification step
that a manipulative-conversion pass could mechanically turn into an execution widget, except that
doing so changes what is graded (recognizing a fact vs. producing one), which is a pedagogical
judgment call, not a mechanical one. Put to the user via `AskUserQuestion`. Ruling: keep
`pv-03-03/k1` as identification; convert the other three to execution.

### `pv2-04-03/k3` — `mcq` → `columnCalc`, 8003 − 3457

Reused the existing `g4-place-million`/`pvAcrossZerosColumn` generator rather than declare a new
one — this step's shape (a 4-digit subtraction crossing two zero columns) is exactly what that
generator already produces, so `variant: {gen: "g4-place-million", form: "pvAcrossZerosColumn"}`
was declared, not skipped.

**Correction to a hand-derivation, caught by re-deriving programmatically instead of trusting
arithmetic done by eye:** the truth is 4,546 (confirmed via `columnCalcTruth("subtract", 8003,
3457)`), but the full reachable-wrong-value set via `columnCalcReachable` is **{4546, 4554, 4654,
5454}** — three wrong values, not the two an initial hand-check produced (4554 was missed). Each
corresponds to a distinct legal-but-incomplete borrow-chain path: 5454 never borrows at all
(subtracts the smaller digit from the larger in every column); 4654 borrows correctly starting
only from the hundreds place; 4554 borrows correctly starting only from the tens place. The
widget's `commonResults` covers 5454 and 4654 (the two most pedagogically distinct wrong paths —
"never borrowed" vs. "borrowed too late by one column"); 4554 is reachable but its diagnosis
("borrowed too late by two columns," essentially the same lesson as 4654 one column over) is
absorbed by `fallbackFeedback` rather than given a third redundant entry that would repeat the
same teaching point with a different number.

### `pc-03-01/k2` — `mcq` → `vectorExplore`, add mode

The lesson's own physics framing: a particle on the unit circle, `r(t) = ⟨cos t, sin t⟩`, at
`t=0` sitting at `⟨1,0⟩`. The step asks the learner to steer `v` until `⟨1,0⟩ + v` lands on the
origin `⟨0,0⟩` — that displacement IS the acceleration at `t=0` (`a = ⟨−cos 0, −sin 0⟩ = ⟨−1,0⟩`),
which the success feedback makes explicit, including the easy-to-miss point that the
*magnitude* of that acceleration is 1, not 0, even though speed along the circle never changes.

No `pc-vector-motion`-tagged variant form produces a `vectorExplore` widget (the registered forms
for that tag are all `mcq`-shaped), so declaring a `variant` key here would either silently fail
to resolve (harmless but pointless) or — worse — resolve to a generator whose output `type`
doesn't match the authored `type`, which `variants.surface.test.ts` exists specifically to catch
and reject. Removed the key entirely rather than leave it stale, matching how the lesson's own
`i1`/`i1b` steps (added in S237, also `vectorExplore`) are already unvaried.

**A real rendering defect, found and fixed before it shipped.** First-draft starting position was
`vxStart=0, vyStart=0`. `widgets.labelCollision.s237.test.tsx`'s S238-batch-8 sweep — which
renders every authored spec of 16 "tail engine" types at `value=null` across all 3 UI tones —
failed at info tone: the "v here" reveal-ghost label and the "u + v" sum-readout label rendered
with overlapping bounding boxes (`6.2×12.6` units of overlap). Root cause traced into
`VectorExploreW`'s label placement, not this content: both labels are positioned via the shared
`s238Seat()` collision-avoidance helper, but each call only lists the *point* labels ("u", "v") as
obstacles to avoid — neither the ghost-reveal label's seat call nor the sum label's seat call
considers the *other* dynamic label as an obstacle. With `vxStart=vyStart=0`, both labels' natural
seats land in the same band, and nothing in the seat-picking logic knows to separate them. This is
a structural gap in shared engine code, not specific to this content — left unfixed here
(out of scope for a content-conversion task) and flagged for whoever next touches
`VectorExploreW`'s label logic.

Fixed at the content layer instead, which is sufficient and doesn't require touching shared code:
`vyStart=1` moves the drag's starting point enough that the two labels' natural seats no longer
overlap. This is safe because `vxStart`/`vyStart` only ever seed where the draggable point begins
— `evaluate.ts`'s grading reads `ux+vx`/`uy+vy` (or the dot-product equivalent) at *check* time,
never the starting values, so the required answer (`v = target − u = ⟨−1, 0⟩`) is completely
unaffected by which start position is chosen. Re-swept clean after the fix. `TAIL`'s
`vectorExplore` entry in the same test file — an exact per-engine authored-spec count, asserted
so a future silent addition/removal doesn't slip through unnoticed — updated `10 → 11` to reflect
the one new spec, which is the correct response to an intentional content addition, not a
weakened gate.

### `cpr-05-03/k2` — `mcq` → `probabilityArea`

The lesson had already established `P(all red) = 10/56` via combinations for both the numerator
and denominator counts earlier in the same lesson. This step asks *why both counts must use the
same style* by having the learner redo the count using permutations instead: `8P3 = 336` total
ordered arrangements of 3 marbles from 8, of which `5P3 = 5·4·3 = 60` are all-red — the same
probability, `60/336 = 10/56`, reached by a different (but equally valid, as long as consistent)
counting convention. The widget is a 16×21 grid (336 cells, matching the denominator exactly) that
the learner sweeps-shades to 60 cells; grading is the cross-multiplication `shaded·336 ==
336·60`, confirmed against `evaluate()` directly at several points including the boundary.

Same variant reasoning as `pc-03-01`: no `probabilityArea`-shaped form is registered for
`count-prob`/`ratioMismatch`, so `variant` was removed rather than left mismatched.

### Verification common to all three

- `manipulativeAlongside.s237.test.ts`'s `servedIdentity()` helper — which every row in that gate
  compares the *actual authored content* against, to catch drift between what a row's comment
  claims is served and what the JSON really contains — didn't have branches for `columnCalc` or
  `vectorExplore` (both new to that gate; only `pv2-04-03` and `pc-03-01` have rows there,
  `cpr-05-03` doesn't appear in this particular gate). Added both branches:
  `columnCalc`'s served answer is `columnCalcTruth(op,a,b)` stringified, served wrong-paths are
  each `commonResults` entry's `value|feedback`; `vectorExplore`'s served answer encodes
  mode+inputs+target, served wrong-paths are the low/high feedback pair. Both rows' `servedAnswer`/
  `servedWrongPaths` strings were computed by a throwaway probe script importing the real schema/
  evaluate functions, not hand-typed, so a transcription slip couldn't silently make the gate
  compare against the wrong ground truth.
- `content-change-proof-s151c.mjs`: `cpr-05-03` added as a brand-new `AUTHORIZED` key (it had
  never been touched by any prior session); `pc-03-01` and `pv2-04-03` already had entries from
  S237 and got an appended `s240-held-back-ruling` reason clause rather than a second key. Count
  moved `873 → 874` (one new key, not three, since two of the three conversions landed on
  already-AUTHORIZED lessons).
- Real-browser QA: **Claude-in-Chrome could not reach this session's own dev server** —
  `mcp__claude-in-chrome__*` navigate/screenshot calls against `127.0.0.1:3100` failed with
  `SecurityError`/a frame-error-page result, consistently across roughly 5 retries, even though
  `curl` from bash confirmed the server was live and responding; it appears to run outside this
  session's network namespace. Pivoted to a local Playwright script (`node`, pre-installed
  Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), seeding
  `localStorage["numera:lesson:v1:c1:<lessonId>"]` with a `LessonSnapshot` to jump directly to
  each target step. All three converted steps captured and visually read: correct prompt text in
  each case (verbatim against the authored JSON), correct widget geometry (columnCalc's 4-digit
  layout with the ones column active; vectorExplore's grid/vectors with the sum readout and no
  visible label collision, confirming the `vyStart` fix; probabilityArea's 16×21 grid at
  `shaded=0/336`), and correct step-position banners (`"Resumed at step N of M"` matching each
  step's actual index).
- `EXCELLENCE_BACKLOG_S126.json`/`.md`'s causal-widget-step counts shifted by exactly the 3
  conversions when the standard audit (`npm run audit:excellence`) was re-run as part of the full
  gate sequence — G3-5 `663 → 664` (`pv2-04-03`'s band), HS `574 → 576` (`pc-03-01` and
  `cpr-05-03`'s band, both HS) — regenerated output, not hand-edited, and internally consistent
  with the conversions actually made.

### Gate results (`c88d91b`, full re-run)

```
typecheck                clean
vitest (2 shards)        13,385 tests / 354 files — 13,383 passed, 2 pre-existing skips, 0 real
                          failures. 2 apparent failures in figures.test.ts under 2-shard
                          concurrent contention (5s test-timeout exceeded) were re-run in
                          isolation afterward and passed in 2.03s — contention, not a regression;
                          noted here so a future session recognizes the same pattern instead of
                          chasing a phantom bug.
validate:content          1840 / 1840
lint:pedagogy              1711 / 1711
validate:native           3 findings, all expected archive-only (node_modules, .next,
                          tsconfig.tsbuildinfo)
check:registration        consistent
content-change-proof      874 / 874 authorized, 827 lessons byte-identical to the sealed S151
                          ledger
build                     EXIT:0 (pre-existing eslint warnings elsewhere in the tree, unrelated
                          to this change; no errors)
widgets.labelCollision.s237.test.tsx (S238 batch 8) — passing, included in the vitest run above;
                          TAIL vectorExplore count 10 -> 11
```

**Not re-run this wave, stated plainly:** the `playwright test` e2e suite (132 specs) was run
partially (~27/132) and stopped deliberately — this sandbox's dev server takes 15–60s+ per
`/learn/[lessonId]` hit even warm, which exceeded e2e/axe's internal timeouts across many routes
unrelated to this change (`/`, `/dashboard`, `/courses`, `/daily`, `/review`, `/notebook`,
`/placement`, `/trailhead`, `/atlas`, `/basecamp/fractions` all timed out the same way; a handful
of already-simple routes passed quickly). Confirmed via grep that no e2e spec references
`pc-03-01`, `pv2-04-03`, `cpr-05-03`, or their slugs — this run gap does not cover the actual
change, but the suite-wide 132/132 figure quoted by earlier S240 addenda should not be assumed
current until re-run fresh. `gen:reports` was likewise not re-run this wave (nothing in this
diff's scope touches what it audits beyond what the gates above already re-confirmed).

**Delivery bundle verified via genuine isolated-clone technique, not a plain clone.** A disposable
copy of the repo (`git clone --no-hardlinks --no-local`, so no shared objects with the working
repo) had its branch reset to `c88d91b`'s parent, origin remote removed, reflog expired
(`--expire=now --all`), then `git gc --prune=now --aggressive` — confirmed via `git cat-file -e
c88d91b^{commit}` failing ("Not a valid object name") that the commit's objects were genuinely,
physically gone, not just unreferenced. Fetching *only* from the standalone bundle file then
restored the exact commit; `git cat-file -e` on the same hash succeeded, and `git diff` between
the pre-restore and post-restore state showed exactly the 9 files this commit touched with the
same insertion/deletion counts `git commit` originally reported. `git fsck --full --strict` on the
restored clone reported no issues. This proves the delivered bundle is complete and self-contained
— not reliant on any object that merely happened to still exist somewhere.

**Observed, not conclusively resolved: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (a Trap K sealed
artifact) was regenerated mid-sequence twice**, both times collapsing from its committed
11,488-line form to a 1,078-row consolidated form matching `CLOSURE_LEDGER.md`'s own "1,078 open
rows" claim — reproduced identically across two separate full gate runs in this session. The
circumstantial case points at `next build`'s static generation (the only full-system step run
both times a change was observed), but this was not conclusively isolated to one specific script.
Restored via `git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv` both times, matching Trap K's
established remedy — flagged here because it needed doing *twice* in one session, immediately
before staging for commit being the critical final time, and a future session should check once
more right before their own commit even if they already restored it earlier in the same session.

## Addendum 4 (same session, commit `19577e5`): cosmetic inversions disambiguated — g5f-02-02/g5f-02-03 fixed, g5u-03-02 confirmed not a defect

S238's content-defects note described "two cosmetic inversions where the decimal leads and the
fraction follows" (`g5u-03-02.json:38`; the distractor labels in `g5f-02-02`/`g5f-02-03`) as one
class of defect, carried forward unverified through S238/S239/early S240. Re-checking both against
live content found they are **not** the same thing.

### `g5u-03-02` — investigated, found to match a universal corpus convention, not a defect

`g5u-03-02.json:38`'s `successFeedback` ("About 0.83 — the exact answer is 5/6, comfortably
between 1/2 and 1.") is an `estimateSlider` widget — a decimal-estimate control by design. Swept
every `successFeedback` string in the corpus containing a fraction: `g5u-03-01`, `g5u-03-04`,
`g4x-03-04` ("About 6 — the exact value is 35/6, which is 5 5/6, just under seven."), and others
all use the identical "About [decimal estimate] — the exact value is [fraction]" shape. This is
the universal convention for this widget type corpus-wide, not an inversion of anything.

The user's first ruling on this item was "investigate further first," not an approval to close,
so before treating it as closed the investigation also checked whether a different corpus-wide
precedent existed that `g5u-03-02` should have matched instead. It doesn't: the one relevant prior
case, `pr-01-01`/`pr-01-03`'s decimal-axis fix (`CONVERSION_LOG.md`, S119 entry — a
`doubleNumberLine` axis-tick formatter that rendered 1/4 as "0.25" and was fixed to a true
fraction lattice via `hopLabel`), is a rendering bug: an axis label *accidentally* showing a
decimal when the lattice makes an exact fraction available. `g5u-03-02` is structurally different
— an estimation widget *correctly* reporting a decimal estimate alongside the exact fraction,
which is its designed function, not a formatter failing to reach a fraction it should have hit.

Taken back to the user with the concrete text side by side (`g5u-03-02` vs. `g4x-03-04`) and the
precedent distinction above. **User confirmed closure with no edit, 2026-08-13.** Dropped from the
content-defects list; no lesson file touched.

### `g5f-02-02`/`g5f-02-03` — a real, differently-shaped defect, fixed

Both lessons share one `mcq` ("To model 3 ÷ 1/4, what does the picture show?"), reused across 4
step instances (`g5f-02-02/k2`; `g5f-02-03/k1`, `g5f-02-03/ch1`, and `g5f-02-03`'s remedial
check). Two structurally parallel wrong options — each naming a wrong operation and its result —
were formatted inconsistently: `"3 cut into 4 equal parts, giving 3/4"` (fraction) vs. `"1/4 of 3,
giving 0.75"` (decimal, same value: 0.75 = 3/4). This is a within-widget sibling-format mismatch,
not the "decimal leads, fraction follows" ordering issue the old note described — a different
defect shape than `g5u-03-02`, despite both having been filed under the same old note.

Swept the full corpus for this exact defect class (`mcq` options mixing a fraction and a decimal
for what could be the same underlying value) before treating it as isolated: 7 total hits, 4 of
which are legitimate (`tf-01-03`, `sr-05-01` ×2, `ns-05-03` — genuinely different candidate
values, or the fraction-vs-decimal comparison IS the question). Only the g5f instance (counted 3×
due to reuse) is a real mismatch.

User's ruling: match the fraction, not the decimal — citing the same `pr-01-01`/`pr-01-03`
precedent above as support (a decimal "sidesteps the subject" in a fraction-focused lesson;
`fraction-division-g5` is the same situation). Changed `"giving 0.75"` → `"giving 3/4"` in all 4
JSON instances across both lesson files, and in `scripts/session/build-fraction-division-g5.mjs`
(the original scaffolding script, which still had the stale text — left alone it would have
silently regenerated the old wording on any future re-run). The script's first option text had
already drifted from the live JSON before this session for an unrelated reason; left as-is, out of
scope for this ruling. Grading is unaffected: both options are already `correct:false`, and the
fix is display text only.

**A tool-level catch worth recording:** the first `Edit` call against `g5f-02-03.json` used
`replace_all:false` against a non-unique `old_string` (the stale text appears 3 times in that
file). The tool reported success with no non-uniqueness warning, but only replaced the *last*
occurrence (the remedial's, deepest-nested). Caught by explicitly `grep -c`-verifying the file
afterward rather than trusting the tool's success message — 2 of 3 occurrences were still stale.
Fixed by re-running with `replace_all:true`, then re-verified via grep count. Same "trust but
verify" discipline as this wave's other ground-truth checks (§ above).

`content-change-proof-s151c.mjs`: both lessons were already `AUTHORIZED` (`s197-batch-f-new-
course`, both new-since-S197 content) — appended an `s240-fraction-decimal-format-ruling` clause
to both existing reasons rather than adding new keys, so the authorized count is unchanged at
874/874.

Real-browser screenshot (production server via `next start`, not `next dev` — see §1's speed note;
`g5f-02-02/k2`, captured with the same local-Playwright/localStorage-seed technique as Addendum
3): both `"giving 3/4"` options render as properly typeset stacked fractions, confirming the fix
through the math-typesetting pipeline, not just the source JSON.

### Gate results (`19577e5`, full re-run)

```
typecheck                clean
validate:content          1840 / 1840
lint:pedagogy              1711 / 1711
validate:native           2 findings, both expected archive-only (node_modules, .next)
check:registration        consistent
build                     EXIT:0
content-change-proof      874 / 874 authorized (no new key; two appended reason clauses)
vitest (2 shards)        354 files / 13,385 tests — all passing except 2 apparent failures under
                          2-shard-plus-two-concurrent-gates contention (validate:content and
                          lint:pedagogy were running at the same time as this vitest pass):
                          variants.surface.test.ts's full-corpus sweep and variants.test.ts's
                          g10-similarity 150-seed sweep, both "Test timed out in 5000ms." Neither
                          failure references g5f-02-02/g5f-02-03 or fraction/decimal formatting.
                          Re-ran both files together in isolation with zero concurrent load
                          (background, ~345s): 2/2 files, 3997/3997 tests passed — confirming
                          contention, not a regression, same pattern as figures.test.ts earlier
                          this session (§ above), just on different files this time.
```

Trap K's `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` regenerated a **third** time this session,
immediately after this addendum's `npm run build` — see this wave's handover §5 for the
session-total count and the now-effectively-confirmed link to `next build`. Restored via
`git checkout --` before staging this commit, same remedy as the first two occurrences.

## Addendum 5 (same session, next commit): hero stage tier — first pass, 7 engines promoted, 2 pre-existing label defects fixed

The user's own priority order for this session was 1) cosmetic inversions (Addendum 4) → 2) hero
tier pixel QA → 3) scope a Plan v3 workstream. This addendum is item 2: `src/components/
stageWidth.ts` has shipped a `hero` stage tier (1100–1280px, `max-w-6xl`) since S218/early Plan v3
work, but **zero widgets had ever been assigned it** — the code comment was explicit that
assignment must be "evidence-driven (pixel QA at 1440px per engine family)," not a guess, and
S239 §2's WS-D finding (some labs measured OVERSIZED, not undersized, the first time anyone
actually looked) was the standing reason nobody had done that measurement yet.

### Scoping: which "wide"-tier engines are even plausible candidates

`stageWidth.ts`'s own comment ties `hero` to "multi-representation systems" — genuinely showing a
synced graph/diagram PLUS a separate live symbolic or numeric readout, not just one large diagram.
Before spending screenshot budget, three parallel research passes read every one of the ~66
"wide"-tier engines' component source in `widgets.tsx` (18,765 lines, one file) for two facts:
whether it's genuinely multi-representation, and whether its own SVG/canvas sizing is capped by an
inner Tailwind `max-w-*` well under 1024px (in which case promoting the *stage* tier alone does
nothing — the inner cap is the real bottleneck, a distinct problem from this pass's scope).

Result: roughly two dozen engines are real multi-rep (a graph plus a live equation string, a table
plus a synced plot, dual LaTeX panels, etc.), but most of those self-cap their SVG at `max-w-md`/
`max-w-xl` (448–576px) — `derivativeTrace`, `accumulateArea`, `sliceSum`, `binomialAreaLab`, and
the whole algebra/precalc "explore" family (`quadraticExplore`, `matrixTransform`,
`unitCircleExplore`, `systemsExplore`, `numberLineRay`, etc.) all fall in this bucket. Those are
**not candidates for this pass** — widening the stage tier would only add padding around an
unchanged diagram; raising their own inner cap is a separate, more invasive change out of scope
here. Eight engines cleared both bars (genuine multi-rep AND uncapped/responsive inner sizing):
`trialProbabilityLab`, `samplingBiasLab`, `percentChangeLab`, `relatedRatesLab`,
`conditionalTableLab`, `derivativeRuleLab` (product mode), `covariationScrubber`,
`affineRelationshipLab`.

### Real 1440px pointer QA: before/after, at the actual promoted width

For each of the 8, found a real authored lesson step (`sp-03-03/i1`, `sp-01-02/i1`, `pr-04-02/i1`,
`dc-02-01/i1b`, `cpr-03-02/i1`, `dr-03-01/i1`, `fg-03-01/i1`, `fg-03-02/i1`), captured it at the
current `wide` tier (1024px), then temporarily reassigned all 8 to `hero` in `stageWidth.ts`,
rebuilt, and re-captured the identical steps at the real, live `hero` tier (1152px) — not a
simulated/dev-tools resize. Screenshots and the full per-engine table are in
`S240_SCREENSHOTS/14`–`23` and this file's reasoning below; the tier assignments themselves are
`stageWidth.ts`'s own record, not restated here.

**Seeding gotcha, caught before it produced false readings:** the first round of screenshots all
came back at the *narrow* (672px) tier regardless of the target widget, for every one of the 8 —
not 8 independent bugs, one systematic cause. `src/lib/lessonState.ts`'s `restoreQueue()` rejects
any snapshot with `i <= 0` (`i === 0` reads as "nothing worth resuming," so a fresh lesson loads
instead) — the seeding script had been passing a filtered array of just the widget's own step id
(index 0) rather than the lesson's FULL step-id sequence with the widget's real position in it.
Root-caused by reading `lessonState.ts` directly rather than guessing at a second workaround; fixed
by seeding the real per-lesson step order and the widget's actual index. A second round of
screenshots landed on "make a prediction first" gate cards instead of the widgets themselves (the
gate hides the manipulative until the learner commits, by design, S200-era) — fixed by clicking
the first `role="radio"` option first, the same interaction `LessonPlayer.play.test.tsx`'s own
`commitPrediction()` helper uses, before capturing.

### The verdict, per engine

Seven promoted: `trialProbabilityLab`, `samplingBiasLab`, `percentChangeLab`,
`conditionalTableLab`, `derivativeRuleLab`, `covariationScrubber`, `affineRelationshipLab`. All
scaled cleanly at hero width — content genuinely used the added room (a synced table+graph pair
got visibly more comfortable; an area-model diagram grew attractively rather than leaving empty
margin) — no new overflow, no broken layout.

One rejected: `relatedRatesLab`. Its sliding-ladder diagram is a naturally tall/narrow construction
(a ladder against a wall); the extra ~130px of hero width became empty margin to the right of the
diagram, not more diagram — the before and after screenshots (`S240_SCREENSHOTS/14`, vs. the
`wide`-tier baseline) show no benefit. Left at `wide`, with the reasoning recorded inline in
`stageWidth.ts` so a future session doesn't have to re-derive it from nothing.

### Two real, pre-existing defects found by this pass — unrelated to the tier itself, fixed

Both reproduced identically at wide AND hero width, proving they were never about container size:

1. **`trialProbabilityLab`'s "whole = N" axis label clipped its own viewBox.** `xFor(spec.total)`
   sits at the axis's own rightmost tick (x=494 of a 520-unit viewBox) whenever `spec.total ===
   axisMax` — the common case, no choice's claim exceeds the total. The label was
   `textAnchor="middle"` at that x, so roughly half a 9-character bold label overflowed past 520
   and clipped, regardless of the stage's rendered pixel width (a viewBox-internal coordinate
   problem). Fixed: `textAnchor="end"`, so the label's right edge sits at the tick instead of its
   center — the same convention a rightmost axis tick label commonly uses. `content/courses/
   sampling-and-probability`'s corpus wasn't touched; this is widget code, not content.
2. **`affineRelationshipLab`'s two-line legend overlapped.** S237b had already fixed the case where
   two lines clamp to the identical Y (same coordinates, one label unreadable) by separating
   same-clamped labels with a 16-unit gap — derived from `textBoxes.testkit.ts`'s modelled box
   height for 12px text (12 × 1.26 ≈ 15.1, so 16 "just" clears it). That file's own header warns
   the 1.26em constant "still UNDER-estimates a wide proportional word," and "Function A"/
   "Function B" are exactly that: a real browser rendered them touching, with the model itself only
   0.88 units from calling it a collision (which is why `COLLISION_SWEEP=1`'s corpus-wide sweep —
   11,957 specs × 3 tones, 0 hits — never caught it: technically clear by the model's own math, just
   not by enough to read cleanly). Fixed: gap 16 → 20, giving the model ~5 units of clearance
   instead of ~0.9, matching ordinary line-height convention for 12px text rather than its bare
   minimum. Both fixes re-verified by real-browser screenshot (`S240_SCREENSHOTS/15`-`16`,
   `22`-`23`) and by re-running `COLLISION_SWEEP=1` after the fix (still 0 hits corpus-wide, 11,957
   specs, 0 renders failed — confirms neither fix introduced a new collision anywhere else).

### Verification

- `npx tsc --noEmit`: clean (the `STAGE_TIER` Record stays exhaustive over `TWidget["type"]`;
  `"hero"` was already a valid `StageTier` member, just unused).
- `npx vitest run` (2 shards, run alone — not concurrent with `validate:content`/`lint:pedagogy`
  this time, learning from this session's earlier contention timeouts): 354 files / 13,385 tests —
  **13,383 passed, 2 pre-existing skips, 0 failures, exact match to this session's established
  baseline.** Zero regressions from either the tier reassignments or the two widget-code fixes.
- `validate:content` 1840/1840, `lint:pedagogy` 1711/1711, `validate:native` 2 expected
  archive-only findings, `check:registration` consistent, `content-change-proof` 874/874
  unchanged (no lesson content files touched — this wave is `src/` code only).
- `build` EXIT:0. Trap K's CSV regenerated again (the fourth time this session) immediately after
  this wave's build; restored via `git checkout --`, per the now-standard per-build check.
- `COLLISION_SWEEP=1`: 0 collisions, 11,957 specs, 0 renders failed — both before confirming the
  two fixes and after, corpus-wide.

### An environment note worth carrying forward

A stale `next start` process from earlier QA work in this same session survived across shell
calls and answered `curl` successfully, but `pgrep -af`/`ss -ltnp` intermittently failed to
surface it (the multi-line-script self-match hazard documented in this wave's handover §5 muddied
one check; a plain `ss -ltnp | grep 3100` missed it once too). `fuser 3100/tcp` reliably found the
owning PID every time in this session; `fuser -k 3100/tcp` is the clean kill. Prefer a port-based
check over a process-name pattern match when the goal is "is anything bound to this port," not
"is a process matching this text running" — the two questions aren't always answered the same way
by the same tool.
