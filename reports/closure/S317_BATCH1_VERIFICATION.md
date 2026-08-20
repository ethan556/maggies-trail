# S317 Batch-1 — Independent Verification

Reviewer: Claude Cowork independent verifier (S317). Read-only; edits nothing except the two
staging files this task names (`reports/closure/cowork-staging/laneV-s317-batch1-dispositions.jsonl`,
this report). No `npm`/`vitest`/`tsc` was run — all verification below is independent hand
recomputation, direct source reading (`src/lib/schema.ts`, `src/components/widgets.tsx`,
`src/components/figures.tsx`, `src/components/figureIds.ts`, `src/lib/evaluate.ts`,
`src/lib/describeState.ts`, `src/lib/g2Variants.ts`), and `git diff HEAD` on every named lesson
and source file.

Method, applied per lesson: read the governing contract(s) (`S316_LANEB_PLACE_VALUE_ASSESSMENT.md`,
`S316_LANEB_MEASUREMENT_DATA_ASSESSMENT.md`, the S316-V4 REVISE records in
`cowork-staging/laneAV4-g2-g3-dispositions.jsonl`, `S316_LAB_CHOICE_SHUFFLE_SWEEP.md`, the bv-05-03
ledger's `S247-BV-bv-05-03-OLS-SUPERSESSION[-lfnorm]` reopenCondition, and `S316_ADJUDICATION_
REMEDIAL_STANDARD.md`'s S316-R standard) → read the current lesson JSON and `git diff HEAD` on it
**before** reading any implementer claim → independently recompute every drawn numeric/graded fact
and every figure's hardcoded rendering → re-run the S255-style `normalized()` clause by hand against
every widget-bearing step in the lesson → check for collateral changes outside the named contract →
**only then** read the implementer's own reports (`S317_PLACE_VALUE_IMPLEMENTATION.md`,
`S317_F20_G3F_MMT_FIXES.md`, `S317_SCATTERFIT_BARDATA.md`) and cross-check for discrepancies.
Review-basis hashes for all 22 lessons were computed in one bulk invocation of
`node scripts/session/print-review-basis.mjs <all 22 ids>` and match `content/courses/**/lessons/*.json`
+ `course.json` at the current working tree.

## Verdict counts

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 20 | pv-01-01, pv-01-03, pv-02-01, pv-02-02, pv-02-03, pv-02-04, pv-03-01, pv-03-02, pv-03-03, pv-03-04, pv-04-02, pv-04-03, f20-01-01, f20-01-03, f20-01-04, f20-02-02, f20-02-04, g3f-01-04, mmt-02-01, md-03-03 |
| REVISE | 2 | md-03-02, bv-05-03 |
| ESCALATE | 0 | — |

`gradeLanguageDecision = FIT` on all 22 — none of this batch's edits touched vocabulary/register in
a way that moved any lesson outside its declared grade band. `visualDecision = SUFFICIENT` on the 20
KEEPs; `REQUIRED` on the 2 REVISEs (both are open visual/accessibility defects, detailed below).

## Non-KEEP reasons (2)

### md-03-02 — REVISE, visualDecision REQUIRED (new defect, not present at HEAD)

The `barData`/`BarChartFigure` mechanism (schema.ts, widgets.tsx) is well-built — additive,
non-throwing, correctly wired into `mcq`/`numeric`/`matchPairs`/`dragOrder`/`dragBucket`,
`MAX_BAR_COLUMNS` mirrors `MAX_PLOT_COLUMNS` — and 3 of the 5 named steps (`k1`, `i2`, and the
`k2` fail-close) are correct and non-leaking. **`i1` and `ch1` fail the governing assessment's own
explicit anti-leak clause**: `S316_LANEB_MEASUREMENT_DATA_ASSESSMENT.md`'s md-03-02 implementation
contract calls for an aria-label "describing the scale and each bar's position (**not** its numeric
value, to avoid answer-leaking on steps where the value is what's being asked)." `BarChartFigure`
instead prints every bar's literal value as visible SVG text (`data-testid="bar-chart-value"`) and
states it verbatim in the aria-label (the `spoken` string), unconditionally, for every consuming
step.

- **`i1`** (matchPairs) asks the learner to derive each bar's value from line-count × scale-step
  (5); its own `pairErrors` block exists specifically to catch that multiplication misconception
  ("2nd line on a by-5 scale is 2×5=10, not 20. Count the LINES, then multiply by 5."). With the
  value printed directly on the bar and spoken in the aria-label, the matching task is trivially
  solvable by reading the picture — the multiplication check is mooted entirely.
- **`ch1`** asks for Bar B's value, described only as "stops halfway between the 8-line and the
  12-line" (never stated as a number — this is the exact quantity ch1's own answer of
  2 = BarB(10) − BarA(8) requires the learner to compute). `BarChartFigure` prints "10" directly on
  the Bar B bar and speaks it in the aria-label, leaking the intermediate value the check exists to
  test.

This is a **new** defect introduced by this implementation (previously nothing rendered on these
steps, so no leak was possible), confirmed against the codebase's own established anti-leak
convention (`Md3QuestionPictograph`, `figures.tsx`, whose aria text explicitly states "No total is
shown" for the analogous total-leak case in the accepted pictograph pattern), and it is **not**
caught by the implementer's own regression test (`widgets.barData.s317.test.tsx` explicitly
*requires* the aria-label to contain every value — the test enshrines the leak rather than catching
it). `k1` and `i2` need no change (`k1`'s values are already stated verbatim in its own prompt;
`i2`'s item labels already parenthetically state each bar's real value, pre-existing and unchanged
by this diff, so drawing the same numbers is not a new leak). `k2`'s fail-close (no `barData`,
single-bar prompt) is correctly justified and independently reconfirmed. **Fix needed, `i1` and
`ch1` only**: suppress the printed per-bar literal value/aria-value clause so the figure draws
height/position only, per the contract's own instruction.

### bv-05-03 — REVISE, visualDecision REQUIRED (contract half-satisfied, disclosed by implementer)

`S247-BV-bv-05-03-OLS-SUPERSESSION[-lfnorm]`'s reopenCondition names two requirements for
promotion to KEEP: (a) name the displayed quantity correctly, (b) the **SVG/state** accessibility
description communicates data points, residual evidence, and the current scored fit metric.

- **(a) fully satisfied.** Independently reverified `ScatterFitW`'s `mse` is
  `sum((py − (m·px + b))²) / points.length` — a genuine **mean** over points, not a sum — and
  `evaluate.ts`'s `scatterFit` case (zero diff from HEAD) grades the identical formula against
  `spec.tolerance`. The readout was relabelled from the ambiguous "miss" to "mean squared residual
  (MSE)" — literally true of the computed quantity, and correctly *not* relabelled "SSE" (which
  would be false, since the formula divides by `n`). No grading change anywhere.
- **(b) partially satisfied.** The SVG's `aria-label` now appends per-point residuals and a
  metric-with-tolerance sentence, and a new always-visible `sf-residual-readout` paragraph states
  the same residuals in ordinary (non-hidden) document flow — both independently correct. **However
  `src/lib/describeState.ts`'s `scatterFit` case — the corpus-wide "Describe this model" on-demand
  accessibility panel `WidgetRenderer` builds for every widget type — was not touched** and still
  returns only the point range and current fit line; no residual evidence, no fit metric. This
  leaves one of the two surfaces the reopenCondition names ("SVG/**state**") stale and inconsistent
  with the SVG's own now-richer description.

This gap is **disclosed, not silent** — `S317_SCATTERFIT_BARDATA.md`, "Out of scope, correctly,"
states the packet's declared ownership was `widgets.tsx` + `schema.ts` only and argues the fix is
complete from within those files. That is a defensible scope call, but the *reopenCondition itself*
still names the "state" description explicitly, and it remains unmet, so promotion to full KEEP is
premature under the reopenCondition as signed. `bv-05-03.json` is otherwise unchanged (zero diff);
the mathematics, evaluator, and success/challenge feedback continue to be correct as established by
S247's supersession of the original ESCALATE.

## Discrepancies with implementer self-reports

- **`S317_SCATTERFIT_BARDATA.md` correctly discloses** the `describeState.ts` gap above rather than
  claiming full closure — its own report does not claim bv-05-03 is ready for KEEP, and this
  verification agrees with that self-assessment (REVISE stands, not the implementer's error).
- **`S317_SCATTERFIT_BARDATA.md`'s "A design call surfaced, not buried" section identifies the
  same tension** this verification flags for md-03-02 (printing literal bar values) but concludes
  it is "not a NEW leak beyond what rendering the promised visual at all necessarily discloses" for
  "a handful of steps (md-03-02/i1, ch1; md-03-03's numeric steps)." This verification **disagrees
  for `i1` and `ch1` specifically**: unlike every md-03-03 step (whose raw numbers are already
  stated in the prompt text, so charting them adds nothing new), `i1`'s value is the graded quantity
  of a match task and `ch1`'s Bar-B value is an uncomputed intermediate the check exists to test —
  in both cases the prompt text does **not** already state the number the chart now prints, so
  rendering it is a genuine new leak, not a restatement of already-visible information. `k1` (both
  lessons) and `i2`/`k3` are correctly not leaks, and the report's characterization of those is
  correct.
- All other implementer claims (place-value figure/MCQ fixes, f20 R6 fixes, g3f-01-04 residuals,
  mmt-02-01 choice reorder) were independently re-derived from source and matched the reports'
  stated numbers, traps, and normalized-string comparisons exactly — no discrepancy found.

## KEEP (20) — contract fulfilled, no collateral damage, no new defect found

### A. place-value (12)

- **pv-01-01.** `c1` rewritten to "In 342, the 3 parks in the hundreds spot, the 4 in tens, the 2
  in ones" — matches `Pv3PlaceChart`'s hardcoded render exactly. Single 1-line diff; no MCQ issue
  was named or found.
- **pv-01-03.** `c1` rewritten to "342 vs 328" (was "452 vs 449"), matching `Pv3Compare`'s hardcoded
  342/328 render and c2's pre-existing correct narration. `k1`/`k2` option-label gaps to the nearest
  distractor now 7 and −3 chars (were ≥10); no feedback/correctness changed.
- **pv-02-01.** `k3` correct-option gap now 1 char (was flagged for length-leak); no other change.
- **pv-02-02.** `c1` rewritten to "349 lives between 300 and 400 ... 49 steps past 300 but 51 steps
  short of 400 — so 349 rounds down to 300" (49+51=100, verified) — fixes the course's most severe
  defect (previously taught the *opposite* rounding direction from the figure). `k1` gap now −7.
- **pv-02-03.** `k1` gap now 5 chars (was the course's largest leak, 42 chars).
- **pv-02-04.** `c1`'s figure swapped to new `Pv3EstimateAddPair` (289→300, 512→500, 300+500=800),
  verified against the lesson's own `i1` (target 800) and `predict` block — exact match. Registered
  in `figureIds.ts`. `k1`/`k3` gaps now 5/4 chars.
- **pv-03-01.** `c1` rewritten to "47 + 23: hop +3 to 50, then +20 to 70," matching `Pv3Jump`
  exactly. `k2`'s commonError value corrected 545→546 (456+100=556, 556−10=546, independently
  recomputed) — the misconception label ("repaid 10 instead of 1") is now literally true.
- **pv-03-02.** `k1` gap now −2 chars.
- **pv-03-03.** `k1` gap now 3 chars.
- **pv-03-04.** `c1`'s figure swapped to new `Pv3EstimateSubPair` (512→500, 289→300, 500−300=200),
  matching c1's own prose exactly. `c2` (untouched) still correctly narrates its own separate
  `pv3-round-hundred` reference — no new cross-step inconsistency. `k1`/`k3` gaps now 4/0.
- **pv-04-02.** `k1` gap now −3 chars.
- **pv-04-03.** `k3` gap now −1 chars.

All 12: every MCQ option-label rebalance is a pure label-text edit — `id`, `correct` flag, and
feedback strings independently confirmed byte-identical to HEAD in every diff hunk; the
`545→546` value fix is the only answer/grading-relevant change in the whole lane, and it is
arithmetically correct.

### B. fluency-20-g2 (5) — R6 resolved

`f20-01-01`, `f20-01-03`, `f20-01-04`, `f20-02-02`, `f20-02-04`: in each, `remedials[0].concept.body`
stays frozen (unchanged) while `remedials[0].check.widget` now draws a fresh, disjoint-numbered
instance of the same fact family (doubles / make-ten / ten-plus / bridge-to-16 / ten's-partners
respectively). Independently re-derived every new answer and every recomputed `commonErrors` trap —
all correct — and re-ran the S255 `normalized()` clause against every widget-bearing step in each
lesson: zero collisions. Each lesson's `k1`-declared generator (`g2Variants.ts fluencyHandlers`)
only emits its bare-equation template, never the word-problem phrasing used in the remedial, so R4
holds independent of the new numbers. No visual defect was named for this lane, so R7–R9 are not
binding (S316-R §1.4).

### C. g3f-01-04

Remedial stem reworded from an operand-swap under k1's exact template (independently reconfirmed
identical-post-normalization to k1's prompt at HEAD) to a genuinely distinct sharing-context
template ("18 stickers are shared equally among 3 friends...") — re-ran the normalizer against all
6 widget-bearing steps: zero collisions. Numbers/answer/commonErrors values unchanged and correct;
feedback reworded to match. `k1`/`k3`/remedial `explanationVariants` rewritten to walk each step's
own current division numbers (15÷3=5, 24÷6=4, 18÷3=6) — all independently recomputed correct,
replacing stale pre-redesign row×column phrasing. `remedials[0].concept.body`/`narration` correctly
left untouched (frozen authored prose).

### D. mmt-02-01

All 4 `estimateSlider` `choices` arrays reordered ascending-by-value, matching the convention the
other 11 authored instances of this widget already follow corpus-wide. Confirmed
`DiscreteEstimateCompareW` renders in array order (a real position exploit before this fix) but
grades by `value` via `.find()`, not position — reorder is evaluator-safe. `git diff` confirms pure
whole-object reorders in all 4 hunks; no `value`/`label`/`feedback`/`correct` string changed.

### E. md-03-03

All 5 `barData` blocks (`k1`, `k2`, `i2`, `k3`, `ch1`) match their own step's narrated data exactly,
and every graded `answer` was independently re-derived from the same `barData` values (8−3=5;
4+7+7+2=20; 6+5=11; (9+6)−(4+5)=6) — all correct. Unlike md-03-02, every one of these prompts
already states its raw numbers in text, so rendering the identical numbers on a synced chart adds
no new leak.

## Raw data

- Dispositions written: `reports/closure/cowork-staging/laneV-s317-batch1-dispositions.jsonl` (22
  NDJSON records, `recordId = S317-V-<lessonId>`, `reviewer = "Claude Cowork independent verifier
  (S317)"`, `reopenCondition = "Lesson or course source bytes change (review basis hash drift)."` on
  every record).
- Review-basis hashes: computed via one bulk call to
  `node scripts/session/print-review-basis.mjs pv-01-01 pv-01-03 pv-02-01 pv-02-02 pv-02-03 pv-02-04
  pv-03-01 pv-03-02 pv-03-03 pv-03-04 pv-04-02 pv-04-03 f20-01-01 f20-01-03 f20-01-04 f20-02-02
  f20-02-04 g3f-01-04 mmt-02-01 md-03-02 md-03-03 bv-05-03`, each matched into its record's
  `reviewedBasisHash`.
- Files read in full for this verification: all 12 `place-value` lesson JSONs named above; all 5
  `fluency-20-g2` lesson JSONs named above; `fractions-deeper-g3/lessons/g3f-01-04.json`;
  `measure-money-time/lessons/mmt-02-01.json`; `measurement-data/lessons/md-03-02.json` and
  `md-03-03.json`; `bivariate-statistics/lessons/bv-05-03.json`; `src/lib/schema.ts`,
  `src/components/widgets.tsx`, `src/components/figures.tsx`, `src/components/figureIds.ts`
  (diffs against HEAD); `src/lib/evaluate.ts` and `src/lib/describeState.ts` (confirmed zero diff);
  `src/lib/g2Variants.ts` (`fluencyHandlers`); `git diff HEAD` on every touched file.
- No content was edited. No `npm run validate:content`, `npm run lint:pedagogy`, `npx vitest`, or
  `tsc` was run by this verification, per task instruction — all correctness claims above are
  independent hand/script recomputation and direct source reading.

## Addendum — Round 2 re-verification (both REVISEs closed)

Follow-up scope: re-verify `reports/closure/S317_SCATTERFIT_BARDATA.md`'s "Round 2" fixes for the
two lessons this report REVISEd. Method unchanged (read contract/round-2 report **for context
only**, then re-derive from current source before trusting any claim). Both are now **KEEP**.
Dispositions: `reports/closure/cowork-staging/laneV-s317-final-dispositions.jsonl` (2 records,
`recordId = S317-VF-<lessonId>`).

**md-03-02 — KEEP, visualDecision SUFFICIENT.** `BarDataSpec` gained an optional
`valueLabels: "all" | "none"` field (absent → `"all"`, byte-identical to round 1). Independently
re-read `BarChartFigure`: in `"none"` mode the per-bar `bar-chart-value` SVG text is omitted and the
aria-label's per-bar clause switches from the flat `"category: value"` fact to an ordinal
gridline-position sentence (`ordinalWord`/`barGridlinePosition`, new pure helpers). `git diff`
confirms `valueLabels: "none"` is authored on exactly `i1` and `ch1`'s `barData` blocks (2 of 9
corpus locations); `k1`/`i2` and all 5 `md-03-03` locations are untouched, `md-03-03.json` has zero
diff. Independently recomputed both fixed steps' new aria sentences from source (not from the
report's claim): `i1`'s three bars all sit exactly on a gridline (values 10/15/20 at scaleStep 5)
and each now reads e.g. "Bar reaching the 2nd line ends on the 2nd gridline above zero" — this
repeats only the ordinal already present in the category's own label, never the numeral, so the
`pairErrors` multiplication-misconception check (line-count × scale-step) is live again; `ch1`'s
Bar B (value 10, the un-stated graded quantity) now reads "ends halfway between the 2nd gridline
and the 3rd gridline above zero," which independently checked is logically equivalent to — no more
informative than — what `ch1`'s own prompt already states verbatim ("stops halfway between the
8-line and the 12-line"); the numeral 10 and the graded gap 2 appear nowhere in the chart or its
aria-label. Read both updated test files directly rather than trusting the "tests pass" claim:
`widgets.barData.s317.test.tsx` asserts, in `"none"` mode, the absence of the value text node and
the flat-fact substring, and separately hard-codes and checks the exact expected position sentences
plus the absence of `"line: 10"`/`"Bar A: 8"`/`"Bar B: 10"` — a genuine, non-vacuous leak check, not
a restatement of the leak. `content.barData.s317.test.ts` independently cross-checks every
`"all"`-mode value against the widget's own JSON with `barData` stripped from the search haystack
first (so it cannot pass vacuously) and re-pins the `k2` fail-close. No field outside the two
`barData` blocks was touched (`hints`/`commonErrors`/`explanationVariants`/`pairErrors`/etc. are
pre-existing, opt-in, reactive-only surfaces unrelated to this fix, already accepted at S316).

**bv-05-03 — KEEP, visualDecision SUFFICIENT.** Independently read the `describeState.ts` diff:
the `scatterFit` case's fit-line branch now computes `residuals` and `mse = Σ(py−(m·px+b))² / n` —
confirmed byte-for-byte identical to `ScatterFitW`'s own `mse` (re-confirmed zero *additional* diff
to `widgets.tsx` beyond round 1 — `ScatterFitW` itself is untouched this round) and to
`evaluate.ts`'s `scatterFit` grading case (confirmed zero diff from HEAD for `evaluate.ts` — no
grading-path change anywhere). The panel now states `"Residuals: ..."` and `"Mean squared residual
(MSE): X, at or under/above the target tolerance of Y"`, matching `ScatterFitW`'s own wording and
its `mse <= spec.tolerance` correctness test exactly; the `value === null` branch is unchanged.
`content.barData.s317.test.ts`'s new `describeWidgetState` tests re-derive the expected
residual/MSE strings straight from `spec.points` inside the test itself (a separately-typed
formatter, not imported from `describeState.ts`) and check both `bv-05-03`'s own signed numbers
(`m=1.9, b=1.5` → MSE 0.175, under tolerance 0.176) and a deliberately poor fit (`m=0, b=0`, "above"
tolerance) — a genuine independent cross-check. `bv-05-03.json` remains at zero diff from HEAD
(`reviewedBasisHash` unchanged from the batch-1 record) — the fix lives entirely in shared engine
code, as it must. Both surfaces the reopenCondition names ("SVG/state accessibility description")
now communicate data points, residual evidence, and the current scored fit metric with one shared
formula and consistent wording.

No discrepancies found between this re-verification and `S317_SCATTERFIT_BARDATA.md`'s Round 2
claims. No content was edited; no `npm`/`vitest`/`tsc` was run for this addendum either.

**pv-02-04 re-sign (`S317-VF-pv-02-04`, KEEP/SUFFICIENT/FIT):** field-by-field diff against a
reconstructed my-signature version confirms the integrator's edit is isolated to c1's trailing
clause ("...in the multiplication course." → "...in earlier courses.", an audit false-positive
fix) with no other field changed and meaning/truth preserved.
