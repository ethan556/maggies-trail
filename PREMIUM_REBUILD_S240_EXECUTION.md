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
- Grade-vocabulary CSV and the other §4 defects carried in S238/S239 — unchanged, still frozen
  prose awaiting a ruling.
