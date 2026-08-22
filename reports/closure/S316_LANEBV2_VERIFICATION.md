# S316 Lane B v2 — Independent Verification

Reviewer: Claude Cowork independent verifier (S316). Read-only; edits nothing except the two
staging files this task names (`reports/closure/cowork-staging/laneBV2-dispositions.jsonl`, this
report). No `npm`/`vitest`/`tsc` was run — all verification below is independent hand
recomputation, direct source reading (`src/lib/schema.ts`, `src/components/widgets.tsx`,
`src/components/figures.tsx`, `src/components/LessonPlayer.tsx`, `src/lib/g2Variants.ts`,
`src/lib/figureTextAlignment.ts`), and `git diff HEAD` on each of the 9 named lesson files.

Method, applied per lesson: read the governing assessor contract and, for `g5u`, the S316-R
remedial-distinctness standard → read the current JSON and `git diff HEAD` **before** reading any
implementer claim → independently recompute every drawn numeric/graded fact → check every
hint/explanation/feedback string is literally true of the widget it accompanies → check for
collateral changes outside the named fields → **only then** read the implementer's own change-note
and cross-check for discrepancies.

## Verdict counts

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 6 | mmt-04-03, mmt-05-02, mmt-05-03, lc-03-03, tg-04-01, tg-05-01 |
| REVISE | 3 | mmt-02-01, g5u-01-02, g5u-01-04 |
| ESCALATE | 0 | — |

All 9: `gradeLanguageDecision = APPROPRIATE`. `visualDecision = REQUIRED` on g5u-01-02/g5u-01-04
only (the two new visual-leak findings below); `SUFFICIENT` on the other 7.

## KEEP (6) — contract fulfilled, no collateral damage

- **mmt-04-03.** `ch1` hints and explanationVariants now walk the drawn widget (minute hand 8 →
  8×5=40, hour just past 2 → 2:40) throughout; independently reverified against option `b`
  ("2:40", feedback "8 five-minute marks is 40 minutes, and the short hand says 2") and the two
  distractor feedbacks. No stray reference to 9 or 45 remains. Only the two named fields changed.
- **mmt-05-02.** `ch1` hints/explanationVariants no longer argue for the labeled-wrong distractor
  "11"; both now land on 11 − 6 = 5, independently reverified by direct subtraction and against
  the untouched option-c feedback ("11 is the blue bar's total, not how many more it shows"),
  which the old hints directly contradicted. Most severe of the three mmt hint defects, fully
  closed.
- **mmt-05-03.** `i1`/`k1`/`i3`/`k3` gained `plotData` blocks that exactly match their own
  (truthfully extended) prompts: `[5,6]/[3,1]`, `[8,9]/[6,2]`, `[3,4]/[2,1]`, `[6,7]/[10,1]`.
  Verified the single-value plotData the assessor contract literally suggested (e.g.
  `{values:[5],counts:[3]}`) would have failed `plotDataParts()`'s own `values.length>=2`
  requirement (`src/lib/schema.ts:96`) — the prompt-extension deviation was necessary, not scope
  creep. `k3`'s count of 10 checked against `MAX_PLOT_STACK=10`: 10 itself is allowed (only `>10`
  is rejected), so no split was needed. `variant` removal from `k1`/`k3` confirmed justified: read
  `src/lib/g2Variants.ts:59` — `MmtLinePlotNumeric`'s shared `num()` builder constructs its widget
  literal with no `plotData` field, so leaving the declaration would silently drop the visual on
  re-ask. Cross-checked this lesson's computed `reviewBasisHash` against the one cited in
  `S316_RESIDUAL_FIXES_3.md`'s final follow-up (`89f8e53c…`) — **identical**, confirming the file
  is in the exact state that report says closes `content.plotData.s237.test.ts` to 30/30.
- **lc-03-03.** `i1`'s `graphZoom` prompt/successFeedback/moreZoomFeedback/wrongVerdictFeedback
  reworded to drop every asymmetric claim and match `lc-04-02`'s own direction-neutral convention
  almost verbatim ("Do the y-values settle on any number at all?" / "They never settle — the
  closer you look..."). Confirmed `GraphZoomW`'s `"infinite"` branch (`1/(d*d)`, symmetric,
  always-positive) can produce "grows without bound"/"never settles" but never "one side dives" —
  the new wording claims only what the renderer can produce. `git diff --stat`: 1 file, 4 lines,
  all inside the four named text fields; `behaviour`/`a`/`leftValue`/`rightValue`/`fAtA`/
  `targetVerdict`/`requiredZoom` and every other step confirmed untouched.
- **tg-04-01.** `k2`/`k3` prompts reworded to foreground their real jobs (in-branch negative
  evaluation vs. domain-boundary check); remedial's `"What is arcsin(0)?"` correctly left alone
  per the contract's stated low priority. Recomputed `arcsin(−1/2)=−π/6` and `arcsin(2)` undefined
  — both still correctly keyed, options/feedback untouched (diff shows only the prompt lines
  changed). Ran the S255 normalize (digits→#) over all six widget-bearing prompts in the lesson:
  all six now normalize to distinct strings, closing the three-way `k2`/`k3`/remedial collision.
- **tg-05-01.** `k3` recast from a near-duplicate Quadrant-II case to a genuinely different
  Quadrant-IV case. Recomputed `sin(5π/3)=−√3/2`, `arcsin(−√3/2)=−π/3` — matches new correct option.
  Both traps recomputed and verified real: `5π/3` (kept-original-angle, "far outside the branch")
  and `−2π/3` (misapplied `π−x` mirror outside its valid domain `[π/2,3π/2]` — a genuinely new,
  previously-untaught boundary misconception). All three values numerically distinct, no
  trap/trap or trap/answer collision. Quadrant coverage across the lesson (k1=QII, k3=QIV,
  ch1=QIII, k2=safe in-branch, remedial=boundary) is now non-overlapping. Widget type, option
  count, and `variant` declaration confirmed intact per the contract.

## REVISE (3)

### mmt-02-01 — residual defect in a sibling field the contract didn't examine

`ch1`'s `hints` were correctly rewritten to walk the real 3-item `matchPairs` (book 9in→10in,
key 4in→5in, marker 12in→13in). But `explanationVariants` on the same step was **left
byte-identical** to its pre-fix text and still reads: *"9 is close to the actual 8 inches — a
good estimate."* / *"Being off by just 1 inch is a good estimate."* No object in this widget has
an actual length of 8 — this is the identical leftover-single-object-draft defect the assessor
named for `hints`, surviving in a sibling reveal field. `explanationVariants` is rendered
post-answer (`src/components/LessonPlayer.tsx:892-894`) and is held to the same "literally true of
the drawn problem" bar as `hints` — the implementation's own change-note scoped its check to
"hints" only and did not examine this field. No widget/answer/option change is needed; only
`explanationVariants` needs the rewrite `hints` already received.

### g5u-01-02 — regression correctly fixed; new figure-reveals-answer defect found

The named regression (mcq check that had lost its model-backed surface) is genuinely fixed:
`remedials[0].check.widget` is restored to `numeric` with `previewDenominator: 6` (verified this
renders a live partition bar per `numericPreviewParts` in `schema.ts`), `answer: 3`, and the S253
"visual diagnostic transfer" requirement is met on the check side. Both traps (1, 6) recomputed
correct and distinct; prompt confirmed distinct (exact and normalized) from every other prompt in
the lesson and not producible by the lesson's declared generator forms.

**New finding, not caught by the prior LANEAV2 pass or by this residual-fix packet:**
`remedials[0].concept.figure` (`fa-multiplier`, `src/components/figures.tsx:3608`, unchanged
through both passes) draws, as literal visible SVG text immediately before the check, `"1/2"` →
`"× 3/3 ↓"` → `"3/6"` — i.e. it draws the exact worked answer (numerator 3, renaming 1/2 to
sixths) that the check then asks the learner to supply. This is the same defect class already
named and fixed as text (adjudication defect (i)/g4v-01-02; LANEAV2's g5u-01-04 R6 finding) — the
leak simply moved from prose into the figure's own drawn numerals, which R6's text-scoped wording
did not anticipate. `LessonPlayer.tsx:615-617` confirms the figure renders alongside `concept.body`
for every concept step (gated only by `isFigureTextAligned`, which read-confirmed passes here via
its unconditional fallback since the body no longer makes an explicit numeric claim). **Fix:**
either detach `fa-multiplier` from this remedial (course precedent `mf3-01-01` holds KEEP with no
remedial figure) or change the check's fraction pair so it is not the identical case the figure
already fully solves.

Also flagged: the whole file was re-serialised with `ensure_ascii=True` in this session (17
authored em-dashes / 4 `×` at `HEAD`, 0 literal / 18 `—` / 4 `×` at working tree,
confirmed byte-for-byte against `git show HEAD`) — the exact anti-pattern the adjudication names
and explicitly bans (guidance #5). Semantically inert but should be corrected.

### g5u-01-04 — text-side R6 leak correctly closed; the same leak survives through the figure

The named defect (concept body naming which scaling factor belongs to which fraction, directly
answering the following mcq) is genuinely fixed: the reworded body/narration ("each fraction is
scaled up by whatever factor turns its OWN denominator into 6, and that factor can differ from one
fraction to the next") is generic and names no `×2`/`×3`-to-fraction pairing, verified against the
mcq's correct option ("1/3 needs ×2, not ×3 — only 1/2 needs ×3 to reach sixths") — no phrase in
the new body resolves it. body/narration kept byte-identical to each other (R8). Figure and check
step confirmed untouched exactly as the fix note claims.

**New finding:** the untouched figure, `fm-common-denom` (`src/components/figures.tsx:3450`),
draws as literal visible SVG text in the same injected concept, immediately before the check:
`"1/2 → 3/6"` and `"1/3 → 2/6"` — i.e. it visually states the exact per-fraction scaling facts
(1/2 needs ×3, 1/3 needs ×2) that the mcq's correct option names in prose. A learner reading the
figure sees "1/3 → 2/6" directly above a check asking why a "scale both by ×3" plan is wrong; the
visual answers the diagnostic without requiring the reasoning the check exists to test. This is a
sharper instance of the same defect the LANEAV2 pass already flagged once on this lesson's body
text — the fix closed the prose instance but not the figure instance, because the fix's own
verification note explicitly reasoned "figure ... untouched" as sufficient without re-checking
whether the (unchanged) figure itself still leaked. **Fix:** either swap to a figure that does not
spell out both fractions' destination numerators (or drop the figure, per `mf3-01-01` precedent),
or change the check's fraction pair so the figure's worked example is not the specific fact being
diagnosed.

Also flagged: same `ensure_ascii=True` re-serialisation as g5u-01-02 (12 em-dashes / 5 `×` at
`HEAD`; 0 literal / 14 `—` / 14 `×` at working tree).

## Cross-check against implementer claims

`reports/closure/cowork-staging/laneB-mmt-lc-tgi-implementation.jsonl` (7 rows, mmt×4 + lc×1 +
tg×2) and `reports/closure/S316_RESIDUAL_FIXES_3.md` (g5u×2 + one gate file) were read only after
independently forming the view above. No discrepancy was found on any of the 6 KEEP lessons —
every arithmetic claim in the implementer notes was independently reproduced. On the 3 REVISE
lessons:

- **mmt-02-01**: the implementer's own change-note states its scope as `"steps[ch1].hints"` only
  and does not mention `explanationVariants` — consistent with what this review found (the field
  genuinely was not examined, not silently skipped).
- **g5u-01-02 / g5u-01-04**: `S316_RESIDUAL_FIXES_3.md` explicitly verified "the concept's attached
  figure (`fa-multiplier`) truthfully matches" (g5u-01-02, quoting the antecedent LANEAV2 report)
  and states `remedials[0].concept.figure (fm-common-denom) ... untouched` as a closing condition
  for g5u-01-04 — both treat "the figure is topically correct / left alone" as sufficient without
  independently asking whether the figure's own drawn numerals pre-answer the paired check. That
  is the gap this review closes; it is a **new finding**, not a contradiction of anything either
  packet claimed.
- One reported item was cross-checked but is **out of this task's lesson scope**:
  `S316_RESIDUAL_FIXES_3.md`'s item 3 (`src/lib/content.plotData.s237.test.ts`) reports the gate
  finishing at 30/30 with `mmt-05-03`'s `reviewBasisHash` matching this review's own computed hash
  exactly (`89f8e53c…`) — cited above under mmt-05-03 as corroborating evidence, not independently
  re-run (no `vitest` was executed by this review per task instructions).

## Gate note

Per task instructions, no `npm`/`vitest`/`tsc` was run by this review. All verification above is
independent hand recomputation and direct source reading. The `content.plotData.s237.test.ts`
30/30 result and the `session252.unlikeFractionsG5CourseIntegrity` evaluator-pin note (carried on
all `g5u` dispositions per `S316_LANEAV2_G5U_VERIFICATION.md`, not content defects) are cited as
reported by upstream packets, not re-verified by execution here.
