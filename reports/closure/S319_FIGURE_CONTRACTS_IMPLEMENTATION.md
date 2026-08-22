# S319 — Figure-Class Contracts Implementation (Lane A)

Owner: `src/components/figures.tsx` (sole owner this round). Implements the 9 figure-class
contracts named across `S319_ASSESS_CA_DR.md`, `S319_ASSESS_ASV_PQ.md`, `S319_ASSESS_CP_SG.md`,
and `S319_ASSESS_DIG4_MDF4.md` (dg4-01-03 only). `S319_ASSESS_SIM_GF.md` was read for cross-lane
context; it names no figure-class contracts assigned to this packet and was not touched.

Per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the ChatGPT Work cache and prior assessor
reports are evidence, not authority; every binding below was independently re-verified against
the live `src/components/figures.tsx` SVG source and the repo's own `figureTextAlignment`/
`figureTextAdversarialAudit` gates, not accepted on the assessor's word alone.

## Scope discipline

- `figures.tsx` additions are additive only: 5 new components (`CaPlusCFamily`,
  `CaOpenBoxSetup`, `CaFenceAgainstWall`, `AsvSurfaceVsVolume`, `DpvTenthsNumberLine`), each
  registered under a new figure id in the `FIGURES` map. One existing component (`BoxLayers`)
  was parameterized in place per its own contract (asv-05-01), which explicitly named editing
  `BoxLayers` as the fix rather than a new component.
- Lesson JSON edits touch only the `figure` keys named by each contract, plus the two text
  fields explicitly named by the sg-03-02 ("sy" jargon) and dg4-01-03 (singular/plural grammar)
  contracts. No IDs, `conceptTag`s, answers, or evaluator-relevant fields were touched.
- `src/components/figureIds.ts` and `src/lib/figureNumericClaims.generated.ts` were regenerated
  via their own repo scripts (`scripts/gen-figure-ids.mjs`,
  `scripts/audit/generate-figure-numeric-claims.mts`) after every `figures.tsx` change — never
  hand-edited.
- Two pre-existing regression tests (`src/lib/session246.decimalsIntroProgression.test.ts`,
  `src/lib/session269.decimalsIntroFigureWithholding.test.ts`) hard-coded the *old, defective*
  `dg4-01-03` figure binding as "expected" state; both were updated to assert the corrected
  binding (`dpv-tenths-number-line`) for `dg4-01-03/c1` and `/c2` specifically, while every other
  lesson's untouched `dpv-hundredths-grid` binding is still asserted exactly as before.

## Per-lesson resolution

### 1. `curve-analysis/ca-03-03` — c2, "What the MVT Buys"
**Defect**: `figure: "dr-inverse-reciprocal"` renders the inverse-function reciprocal-slope
diagram, unrelated to the `F, F+C` antiderivative-family fact taught.
**Registry search**: grepped `constant|family|plus-c|antideriv|vertical-shift` under `ca-`/`dr-`/
`in-` prefixes — no match.
**Resolution**: built `CaPlusCFamily` (new) — two vertical shifts of one curve, tangent segments
at a shared x showing identical slope, title states the vertical-shift/tangent-slope relationship
without embedding conflicting digits. Registered as `ca-plus-c-family`. Rebound `c2.figure`.

### 2. `curve-analysis/ca-04-01` — c1/c2/rc1, "End Behaviour and Asymptotes"
**Defect**: all three cited `dr-power-rule-pattern` (the derivative power-rule table).
**Verification**: read `HaDegreePanels` (figures.tsx:9474) and `EndBehaviorQuadrants`
(figures.tsx:9226) SVG source directly — both render exactly the cases each step's prose states.
**Resolution**: `c1.figure` → `ha-degree-panels`; `c2.figure` → `end-behavior-quadrants`;
`remedials[0].concept.figure` (rc1) → `ha-degree-panels`. No new figures needed.

### 3. `curve-analysis/ca-05-02` — c1, "The Open-Top Box"
**Defect**: `dr-power-rule-pattern` unrelated to the open-top-box setup (`V = x(12−2x)²`,
`0 < x < 6`). No existing figure depicts a cut-corner sheet folded into a box.
**Resolution**: built `CaOpenBoxSetup` (new) — flat 12×12 sheet with side-x corner squares
marked for removal plus the folded open-top box (base `12−2x`, height `x`); title and caption
state the lesson's actual numbers. Registered as `ca-open-box-setup`. Rebound `c1.figure`.

### 4. `curve-analysis/ca-05-03` — c1/rc1, "Applied Optimisation"
**Defect**: both cited `dr-power-rule-pattern` for the fence-against-a-wall setup
(`2x + y = 100`, `A = x(100−2x)`). No existing figure shows a three-sided pen against a wall.
**Resolution**: built `CaFenceAgainstWall` (new) — hatched wall, two fence runs of length `x`
perpendicular to it, one run `y = 100−2x` parallel to it. Registered as
`ca-fence-against-wall`. Rebound both `c1.figure` and `remedials[0].concept.figure`.

### 5. `area-surface-volume/asv-04-03` — c2
**Defect**: `asv-boxes-fit` shows box-counting-by-division, not the surface-vs-volume
inside/outside/units contrast the step teaches (the figure is correctly used elsewhere, in
`asv-05-03`, for its actual box-counting concept).
**Resolution**: built `AsvSurfaceVsVolume` (new) — a 2×2×1 box contrasting its 6 outside faces
(16 sq units, hand-verified) against its 4 interior unit cubes (4 cu units). Registered as
`asv-surface-vs-volume`. Rebound `c2.figure`.

### 6. `area-surface-volume/asv-05-01` — c1/c2 (figure-only fix, no lesson JSON change)
**Defect**: `BoxLayers`'s baked labels ("base layer: 3 × 2", "3 layers tall") and `<title>`
describe an 18-cube box, contradicting the lesson's own 2×3 base × 4 layers = 24 example.
**Resolution**: parameterized `BoxLayers` in place — 4 `layer()` calls instead of 3, viewBox
grown 220×130 → 220×170 to avoid clipping the extra layer, label and `<title>` updated to "4
layers tall"/"...stacked 4 layers high". Deliberately did *not* add an explicit "2×3×4=24"
arithmetic sentence to the title: doing so would register the figure in the generated
exact-numeric-claims map and then conflict with `c2`'s reuse of the same figure for its own,
different worked example (a 4×3×6/72/108 box) — the title stays descriptive-only, per the
contract's literal minimal fix.

### 7. `coordinate-proofs/cx-02-02` + `cx-02-03` — c2 / c1
**Defect**: `cx-02-02/c2`'s figure `cx-perp-slopes` renders the not-yet-taught perpendicular
fact (`m₁·m₂ = −1`); `c2`'s prose is entirely the parallel-converse/uniqueness argument. The
same figure's true home, `cx-02-03/c1` (which literally derives `m₁·m₂ = −1`), had no figure.
**Registry search**: no existing figure depicts "one point + one slope ⇒ one line" without
perpendicular content; reusing `cx-parallel-slopes` at `c2` would duplicate `c1`'s own image in
the same lesson, so per the contract's primary fix the mismatched binding was removed rather
than force a same-lesson repeat.
**Resolution**: removed `figure` key from `cx-02-02/c2`; added `"figure": "cx-perp-slopes"` to
`cx-02-03/c1`.

### 8. `solid-geometry/sg-03-02` — c1/k2/k3
**Defect A**: `c1`'s figure `cone-fills-cylinder` ("cone = ⅓ of its cylinder") is bound to the
cube-tiling step; `k3` ("The cone joins", cone radius 3 height 10 matched to a pyramid,
coefficient 30) is the step that actually depicts the cone/cylinder relationship and had no
figure.
**Defect B**: `k2`'s mcq feedback used the unexplained internal course-slug "sy" (similarity):
"the sy course's k² law".
**Registry search**: no exact-match cube-splits-into-three-pyramids figure exists; per the
contract this is out of scope to build — `c1` remains without a figure.
**Resolution**: removed `figure` from `c1`; added `"figure": "cone-fills-cylinder"` to `k3`;
replaced "the sy course's" with "the similarity course's" in `k2`'s feedback.

### 9. `decimals-intro-g4/dg4-01-03` — c1/c2/ch1
**Defect A**: title/c1/c2 promise a 0-to-1 number-line walk, but both `c1.figure` and
`c2.figure` were `dpv-hundredths-grid` (a static 100-cell grid, "1 whole = 100 cells" — not a
number line).
**Defect B**: `ch1` had a singular/plural grammar defect wherever the shaded count is 1 ("1
shaded columns of 10 is 1 tenths", "1 columns writes as 0.1", "1 cells of a hundred-cell grid",
"1 columns means 1 tenths") — the only instance of this pattern in the lesson, confirmed by
full-file grep.
**Registry search**: no exact-match tenths-specific 0-to-1 number-line figure existed.
**Resolution**: built `DpvTenthsNumberLine` (new) — 0-to-1 number line, 10 equal tenth-steps,
point marked at 0.4 (matching `c2`'s own worked value "Shading 0.4 walks four of the ten
steps"), styled to match the course's existing `DpvRoundWhole` number-line figure. Registered
as `dpv-tenths-number-line`. Rebound `c1.figure` and `c2.figure`. Fixed all 5 grammar-defect
fields in `ch1` (`explanationVariants[0..1]`, `widget.commonErrors[0..1].feedback`,
`hints[1]`) to singular "1 column"/"1 tenth"/"1 cell", preserving every feedback string's
literal truth and length (all remain ≥25 chars). Left the `hundredthsGrid` widget type on
`i1`/`i2` untouched — the packet's item-9 boundary named only the figure binding and the ch1
text fields, not the widget type (which already renders as a 1×10 strip under `mode: "tenths"`,
not the 100-cell grid).

## Gate outputs (verbatim)

### `npx tsc --noEmit`
```
(no output — clean)
```

### `node scripts/check-registration.mjs`
```
registration: files ↔ course.json ↔ PLAN.md all consistent
```

### `npx vitest run src/components/figureTextAdversarialAudit.test.tsx`
```
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  1 passed (1)
```
(First run failed on `ca-plus-c-family`'s title carrying digits 3/6 that were disjoint from
`c2`'s own incidental numbers 4/0 in "C4"/"(F−G)′=0" — `EXAMPLE_NUMBER_CONFLICT`. Fixed by
rewording the `<title>` to state the relationship without embedding conflicting digits; re-run
green with zero new blocklist candidates.)

### `npx vitest run src/components/s319Figures.test.tsx` (new file, this packet)
```
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  23 passed (23)
```
Covers: all 5 new components render `role="img"` + `<title>` with the lesson's actual numbers;
all 5 new figure ids present in `figureIds.ts`; `box-layers` now renders 4 layers (polygon count
= 4×6×3 = 72) and no longer says "3 layers tall"; every one of the 13 new/rebound
(lessonId, stepId, figureId) bindings resolves `isFigureTextAligned === true` and is absent from
`FIGURE_TEXT_MISMATCH_BLOCKLIST`; `sg-03-02/c1` has no figure and `/k3` has `cone-fills-cylinder`;
`dg4-01-03/ch1` contains no remaining "1 columns"/"1 tenths"/"1 cells" and does contain the
corrected singular forms.

### Additional gates run (not in the original list, needed because new figures changed generated
files):
- `npx tsx scripts/audit/generate-figure-numeric-claims.mts` — regenerated
  `src/lib/figureNumericClaims.generated.ts` (3 new exact-arithmetic-title claims:
  `asv-surface-vs-volume`, `ca-fence-against-wall`, `ca-open-box-setup`); confirmed all three
  compare aligned against their bound lesson text via `compareExactFigureNumericParity`.
- `npx vitest run src/components/figures.test.ts` — green (registry integrity + every figure
  renders `<svg>` + `<title>` + all text ≥10-unit floor; caught and fixed two `fontSize="9"`
  labels in `AsvSurfaceVsVolume`, bumped to 10).
- `npx vitest run src/components/figureNumericClaims.generated.test.tsx` — green.
- `npx vitest run src/lib/session246.decimalsIntroProgression.test.ts
  src/lib/session269.decimalsIntroFigureWithholding.test.ts` — both updated (see Scope
  discipline above) and green.
- `npx vitest run src/lib/session245.solidGeometryChoiceIntegrity.test.ts
  src/lib/session246.curveAnalysisChoiceIntegrity.test.ts
  src/lib/session246.coordinateProofsChoiceIntegrity.test.ts
  src/lib/session269.areaSurfaceVolumeFigureWithholding.test.ts
  src/lib/figureNumericParity.test.ts` — all green, no changes needed.

### Pre-existing, out-of-scope failure noted (not caused by this packet)
`npx vitest run src/lib/figureTextAlignment.test.ts` fails one assertion
(`safelyWithheld.length` expected `>0`, got `0`) on a clean `git stash` of this session's changes
too — confirmed via `git stash && npx vitest run ... && git stash pop` before touching anything.
Pre-existing on `HEAD`, unrelated to any id this packet added or rebound (the corpus-wide
`FIXED_EXEMPLAR_FIGURES` set grew by the 3 new arithmetic-title ids, but every use of every
fixed-exemplar figure in the corpus — old and new — resolves aligned right now, for reasons
outside this packet's scope/authority to fix; flagging per house rules rather than silently
"fixing" a global invariant unrelated to the 9 assigned contracts).

## Raw data

- Per-lesson NDJSON: `reports/closure/cowork-staging/laneA-s319-figures.jsonl` (9 records, one
  per contract; `asv-05-01`'s record documents a figure-only fix with no lesson JSON change).
- Changed files: `src/components/figures.tsx`, `src/components/figureIds.ts`,
  `src/lib/figureNumericClaims.generated.ts`,
  `content/courses/curve-analysis/lessons/{ca-03-03,ca-04-01,ca-05-02,ca-05-03}.json`,
  `content/courses/area-surface-volume/lessons/asv-04-03.json`,
  `content/courses/coordinate-proofs/lessons/{cx-02-02,cx-02-03}.json`,
  `content/courses/solid-geometry/lessons/sg-03-02.json`,
  `content/courses/decimals-intro-g4/lessons/dg4-01-03.json`,
  `src/lib/session246.decimalsIntroProgression.test.ts`,
  `src/lib/session269.decimalsIntroFigureWithholding.test.ts` (regression-test updates, see
  Scope discipline), plus new `src/components/s319Figures.test.tsx`.

## Follow-up: `figureViewportParity.s260.test.tsx` numeral-overrun fix

### Diagnosis

The coordinator reported `outside=265` vs the ≤261 budget, with one named entry
(`ca-open-box-setup` numeral `"12"`) and an estimate of "4 NEW overruns from this packet's
figures." The test's own failure message only prints `outside.slice(0, 20)` — a truncated
sample of the full `outside` array — so the "4" figure could not be taken as an authoritative
enumeration. I read the test source to confirm the truncation, then built a temporary filtered
probe (`scanNumeralBoxes`/`boundsOf` logic copied verbatim from the S260 test, restricted to
this packet's own figure ids) to get the complete overrun list for exactly the figures I
touched, deleted after use.

That probe found **5** numeral-boxes outside their viewBox across 3 of my components:

- `ca-open-box-setup`: 1 (the "12" the coordinator named)
- `asv-surface-vs-volume`: 2 ("6 faces = 16 sq units", "4 unit cubes = 4 cu units")
- `box-layers`: 2 ("base layer: 3 × 2", "4 layers tall")

To separate strictly-new overruns from pre-existing ones, I ran `git stash push -m probe --
src/components/figures.tsx` (scoping the stash to only this file, so other lanes' concurrent
edits elsewhere in the repo were undisturbed), re-ran the full unfiltered S260 test against
that reverted-to-`HEAD` `figures.tsx`, and found the **true pre-edit baseline was already
`outside=262`** — i.e. 1 over budget before this packet touched anything, and unrelated to any
of the 9 contracts. Re-probing the reverted file confirmed `box-layers`'s two overruns (same
`x`, same `fontSize`, same text length) were already present pre-edit; only the y-position and
viewBox height had changed in my earlier edit (adding a 4th stacked layer), which does not
affect the x-axis overflow. I then `git stash pop`ed to restore my work.

So of the 5 overrunning numeral instances found in my components: **3 were strictly new**
(`ca-open-box-setup` ×1, `asv-surface-vs-volume` ×2 — introduced this packet, `262 → 265`), and
**2 pre-existed `box-layers`'s edit** (unrelated to the layer-count change, but in a component I
modified this round). I fixed all 5, since the coordinator's instruction was "every numeral in
your components sits inside its viewBox," and fixing the pre-existing two also gives headroom
against the shared budget rather than leaving it exactly at 261.

### Fixes (all in `src/components/figures.tsx`, additive layout-only — no title/label numbers,
props, or ids changed)

1. **`CaOpenBoxSetup`** — the left-edge "12" side-length label sat at `x = ox - 12` (=6) with
   `textAnchor="middle"`, so its 2-char box (fontSize 11) started at `x0 ≈ -1.9`, 1.9px left of
   the viewBox. Changed to `x={ox}` (=18) with `textAnchor="end"`, right-aligning the label
   against the sheet's left edge instead of centering it outside the sheet: `x0 ≈ 2.2`, fully
   inside `viewBox="0 0 340 190"`.
2. **`AsvSurfaceVsVolume`** — both group captions ("6 faces = 16 sq units" centered at `x=41`;
   "4 unit cubes = 4 cu units" centered at `x=157`) were too wide for `viewBox="0 0 210 108"`
   at their centers (`x0 ≈ -34.6` and `x1 ≈ 247.0` respectively). Split each into two shorter
   stacked `<text>` lines ("6 faces" / "= 16 sq units" and "4 unit cubes" / "= 4 cu units"),
   recentered at `x=48` and `x=160`, and grew the viewBox height from 108 to 120 to fit the
   second line. The required substrings `"16 sq units"` and `"4 cu units"` (asserted by
   `s319Figures.test.tsx`) are preserved verbatim, just on their own text nodes. All four
   resulting numeral boxes now sit inside the viewBox.
3. **`BoxLayers`** — both captions ("base layer: 3 × 2" and "4 layers tall", both `x=158`,
   default `text-anchor="start"`) overflowed the right edge of `viewBox="0 0 220 170"`
   (`x1 ≈ 287.6` and `x1 ≈ 251.6`). Widened the viewBox from `220` to `300` (no other geometry
   changed), which brings both labels' right edges inside without touching the required
   `"4 layers tall"` substring (`s319Figures.test.tsx` still asserts it, and still asserts
   `"3 layers tall"` is absent).

### Verification — net effect on the shared budget

Re-running the full (unfiltered) S260 scan after all 3 fixes: `outside=260` (down from the
pre-edit baseline of 262, and down from this packet's peak of 265) — 1 numeral of headroom
under the ≤261 budget, budget itself untouched.

### Verbatim gate output (this follow-up round)

```
$ npx vitest run src/components/figureViewportParity.s260.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  13:38:37
   Duration  8.77s (transform 3.74s, setup 101ms, import 3.55s, tests 3.93s, environment 766ms)

$ npx vitest run src/components/s319Figures.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  23 passed (23)
   Start at  13:38:49
   Duration  4.73s (transform 3.47s, setup 99ms, import 3.62s, tests 131ms, environment 690ms)

$ npx vitest run src/components/figureTextAdversarialAudit.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  13:38:56
   Duration  5.61s (transform 3.74s, setup 72ms, import 3.96s, tests 1.29s, environment 0ms)

$ npx tsc --noEmit
(no output — clean)
```

A temporary diagnostic file (`src/components/probeViewport.test.tsx`, a filtered copy of the
S260 scan restricted to this packet's figure ids, used only to get the complete — not
truncated — overrun list for my components) was created and deleted before this follow-up was
considered complete; it is not part of the final diff.
