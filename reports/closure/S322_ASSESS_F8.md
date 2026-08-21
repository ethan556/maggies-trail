# S322 Assessment F8 — bivariate-statistics, data-and-models, parametric-polar-calculus

Independent course assessor pass over three complete courses (23 lessons total: 15 + 4 + 4).
Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s322-F8-dispositions.jsonl`. Every disposition supersedes any
prior decision on these lesson IDs.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and obeyed: the repository source and
this session's own re-derivation are authoritative; the ChatGPT Work cache, any prior assessor's
prose, and the task's own framing notes are evidence only, not self-approving (see "task-framing
mismatch" below, which this rule required surfacing rather than silently trusting).

## Method

For every one of the 23 lessons, `node scripts/session/print-review-basis.mjs <id>` was run to get
the current review-basis hash, then compared against every `reviewedBasisHash` recorded anywhere in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` and every `reports/closure/cowork-staging/*.jsonl`
file:

- **8 lessons** (bv-01-01, bv-02-02, bv-02-03, bv-03-01, bv-04-01, bv-04-02, bv-05-01, bv-05-03) carry
  a current-hash byte-match against a prior independently signed disposition. These were still
  independently spot-verified in full (every widget's math hand-recomputed, every figure ID checked
  against `src/components/figureIds.ts`, every MCQ's option-length ratio checked) rather than trusted
  on the strength of the old signature — this surfaced two new, previously unflagged defects on
  hash-matched lessons (bv-02-02, and the bv-05-03 supersession was reconfirmed clean).
- **15 lessons** have no current-hash match anywhere and were read and assessed in full at current
  state from scratch: every step's body, widget, `commonErrors`/`pointErrors`/`numericErrors`,
  predict/reveal, remedial, and cited figure was read; every numeric/mcq/challenge answer and every
  `scatterFit` regression was hand-recomputed and then independently cross-checked with a small
  Node script that grid-searches every `scatterFit` widget's `(m, b)` space against `evaluate.ts`'s
  actual `mse <= tolerance` gate (`src/lib/evaluate.ts:1043-1054`).
- Every MCQ's correct-vs-longest-wrong option-length ratio was computed programmatically and checked
  against the ratio this codebase's own repair scripts already use to define a "choice-length leak"
  (`correct.length > longestWrong.length * 1.5 AND correct.length - longestWrong.length >= 12`, e.g.
  `scripts/session/s285-circle-theorems-choice-progression-guard.mjs:32`), rather than an invented
  threshold.
- Every `"figure"` ID cited across all 23 lessons was checked for registration in
  `src/components/figureIds.ts` (all 32 distinct IDs used are registered — no missing figures), and
  each figure's actual rendered content was read in `src/components/figures.tsx` and compared against
  the concept text it sits beside.

No npm/vitest/tsc was run (per instructions). Math was verified by hand and cross-checked
programmatically for `scatterFit` least-squares reachability; figure code was read directly, not
rendered.

**Task-framing mismatch (flagged, not silently trusted):** the task briefing states "parametric-polar-
calculus had an S315 choice repair." `reports/closure/S315_POLAR_PARAMETRIC_CHOICE_PARITY.md` closes
exactly four lesson IDs — `pp-02-03/k3`, `pp-03-03/k2`, `pp-04-01/k3`, `pp-05-03/k1` — all in the
course `polar-parametric` (a distinct course directory, Grade-12 `pp-*` lesson IDs). No source
reference to any `pc-*` lesson exists anywhere in `reports/closure/` or `reports/cache/` except the
original `S271_PARAMETRIC_POLAR_CALCULUS_SOURCE_IMPLEMENTATION.md`. This course's four lessons were
therefore assessed from a clean slate, not screened against an S315 repair that never touched them.

**Staging-directory schema drift (observed, not adopted):** six other `laneB-s322-F*-dispositions.jsonl`
files already present in `reports/closure/cowork-staging/` (F1, F2, F3, F5, F6, F12, F13) use three
mutually inconsistent field schemas for the same record type (`courseId`+no-space compact JSON in F1;
`course`/`reviewBasisHash` in F12; `reviewedBasisHash` with spaces in F3/F5/F6/F13), all timestamped
within minutes of this session's own clock. Per the prefix's authority rule ("recommendations...and
earlier KEEP labels are evidence only; they cannot approve their own work"), this file's schema
follows the task's own explicit field instructions and the internally-consistent S244–S321 precedent
instead of any of those three drifted variants.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| bivariate-statistics | 15 | 11 | 4 | 0 |
| data-and-models | 4 | 2 | 2 | 0 |
| parametric-polar-calculus | 4 | 0 | 4 | 0 |
| **Total** | **23** | **13** | **10** | **0** |

## REVISE list (one-phrase reasons)

1. **bv-02-01** (`The Line of Best Fit`) — remedial check `rem-bv0201-k`'s correct option is a
   choice-length leak (44 vs. 26 longest-wrong chars, 1.69x).
2. **bv-02-02** (`Judging a Good Fit`) — `k2`'s correct option is a choice-length leak (60 vs. 30
   chars, 2.0x); previously hash-matched and signed KEEP without this being caught.
3. **bv-03-02** (`What Slope and Intercept Mean`) — remedial check `rem-bv0302-k`'s correct option is
   a choice-length leak (45 vs. 27 chars, 1.67x).
4. **bv-05-02** (`Reading the Leftovers`) — step `i1b`'s `scatterFit` tolerance (0.5) is below the
   true minimum achievable MSE (1.0) for its own y=x² dataset, making the interactive's own quoted
   successFeedback mathematically unreachable.
5. **dm-02-01** (`Fitting a Line, and Reading What It Says`) — both `scatterFit` interactives (`i1`,
   `i2`) have unreachable success thresholds (true MSE minima 0.746 and 2.16 vs. tolerance 0.4 each);
   `k2`'s correct option is also a choice-length leak (84 vs. 46 chars, 1.83x).
6. **dm-02-02** (`How Good Is the Fit? Residuals and Correlation`) — `i1` repeats dm-02-01's
   unreachable-tolerance dataset; `i2`'s `scatterFit` tolerance (0.8) is ~39x below its true minimum
   achievable MSE (30.95).
7. **pc-01-01** (`Differentiating a Parametric Curve`) — `k2`'s correct option is a choice-length leak
   (71 vs. 19 chars, 3.7x); math otherwise fully correct.
8. **pc-01-02** (`Arc Length: a Sum of Tiny Hypotenuses`) — `c1`/`c2` cite figures `dr-tangent-line`
   and `dr-derivative-as-function`, both borrowed from the unrelated `derivative-rules` course and
   depicting content (a tangent-line slope demo; a scalar function-vs-derivative plot) that has
   nothing to do with arc length; `k3`'s correct option is also a choice-length leak (62 vs. 25
   chars, 2.5x).
9. **pc-02-01** (`Polar Area: the Slices Are Triangles`) — `i1`'s predict/`cml.explanation` blocks
   discuss "volume slices" and a "limiting volume," copy-pasted from a solid-of-revolution template
   and never adapted to this lesson's actual 2-D polar-area topic; the remedial concept's cited
   figure `dr-power-rule-pattern` renders an unrelated power-rule derivative table; `k1`'s correct
   option is also a choice-length leak (71 vs. 39 chars, 1.8x).
10. **pc-03-01** (`Motion as a Vector`) — `c1` and the remedial concept both cite figure
    `dr-derivative-as-function`, a single-variable scalar function/derivative plot with no vectors,
    unrelated to this lesson's position/velocity/acceleration-vector content.

No mathematical falsehood was found in any lesson's *concept text or answer keys* — every REVISE
above is a widget-threshold, figure-binding, or option-parity defect layered on top of otherwise
correct mathematics. All 32 distinct figure IDs cited resolve in `figureIds.ts` (no missing figures);
the three `parametric-polar-calculus` figure mismatches are wrong-content bindings, not absent ones.
The 13 KEEP lessons had every numeric answer, `commonErrors`/`pointErrors`/`numericErrors`,
predict/reveal claim, `scatterFit` achievability, and cited figure independently
recomputed/checked and confirmed correct at current source.

## Implementation contract per REVISE

### bv-02-01 — `content/courses/bivariate-statistics/lessons/bv-02-01.json`, step `remedials[0].check`
- Current: correct option `"Through the middle, balanced above and below"` (44 chars) vs. longest
  wrong option `"Along the very top edge"` (26 chars).
- Fix: lengthen the wrong options (or trim the correct one) so no option exceeds 1.5x / +12 chars
  over the others, without changing which option is correct or its feedback's substance.
- Scope: this remedial check's `widget.options[*].label` text only; no other step needs change.

### bv-02-02 — `content/courses/bivariate-statistics/lessons/bv-02-02.json`, step `k2`
- Current: correct option `"How far the dots sit from the line overall (their residuals)"` (60
  chars) vs. longest wrong `"How many dots the line touches"` (30 chars).
- Fix: rebalance option lengths (e.g. shorten the correct option to its essential claim, or add a
  matching qualifying clause to the wrong options) while preserving each option's `correct`/
  `feedback` meaning.
- Scope: `k2.widget.options[*].label` only.

### bv-03-02 — `content/courses/bivariate-statistics/lessons/bv-03-02.json`, step `remedials[0].check`
- Current: correct option `"The amount y changes for each extra unit of x"` (45 chars) vs. longest
  wrong `"The starting value at x = 0"` (27 chars).
- Fix: same rebalancing approach as bv-02-01's remedial.
- Scope: this remedial check's `widget.options[*].label` text only.

### bv-05-02 — `content/courses/bivariate-statistics/lessons/bv-05-02.json`, step `i1b.widget`
- Current: `points: [[1,1],[2,4],[3,9],[4,16]]`, `tolerance: 0.5`; true OLS line (m=5, b=-5 — exactly
  the pair named in `successFeedback`) has minimum MSE=1.0.
- Fix: raise `tolerance` to at least ~1.0 (e.g. 1.05 for float-safety margin, matching the pattern
  bv-05-03 already uses: tolerance set just above the true MSE minimum), OR reduce the curvature of
  the underlying data so a smaller minimum MSE is achievable. Raising tolerance is the smaller,
  lower-risk change since the lesson's entire pedagogical point is "force a straight line through
  curved data and read the leftover pattern" — the four residuals (+1,-1,-1,+1) and the "two
  negative" answer in `k0b` must stay unchanged.
- Scope: `i1b.widget.tolerance` only; no point, slider-range, or other step content needs to change.

### dm-02-01 — `content/courses/data-and-models/lessons/dm-02-01.json`, steps `i1`, `i2`, `k2`
- Current: `i1.widget.tolerance=0.4` against 6 points with true MSE_min=0.746; `i2.widget.tolerance=0.4`
  against 5 points with true MSE_min=2.16; `k2.widget.options[*]` has a 84-vs-46-char leak.
- Fix: raise `i1.tolerance` to ≥0.75 and `i2.tolerance` to ≥2.2 (both just above the true minima, on
  the pattern bv-05-03 already demonstrates), leaving `successFeedback`'s "About y = 5x + 60" / "About
  y = −2x + 180" approximate language unchanged since it was already correctly hedged with "About."
  Separately rebalance `k2`'s option lengths.
- Scope: `i1.widget.tolerance`, `i2.widget.tolerance`, `k2.widget.options[*].label` only.

### dm-02-02 — `content/courses/data-and-models/lessons/dm-02-02.json`, steps `i1`, `i2`
- Current: `i1` reuses dm-02-01's exact dataset/tolerance (same defect); `i2.widget.tolerance=0.8`
  against a noisier 6-point dataset with true MSE_min=30.95.
- Fix: raise `i1.tolerance` to match dm-02-01's fix (≥0.75) so both lessons stay consistent since they
  intentionally reuse the same dataset. For `i2`, either raise `tolerance` to ≥32 (a large, honest
  number reflecting how noisy this dataset really is — consistent with the lesson's own point that
  noisier data means bigger residuals and a weaker fit), or replace the dataset with less-scattered
  points if a tighter tolerance is pedagogically intended. Raising tolerance is lower-risk.
- Scope: `i1.widget.tolerance`, `i2.widget.tolerance` only.

### pc-01-01 — `content/courses/parametric-polar-calculus/lessons/pc-01-01.json`, step `k2`
- Current: correct option (71 chars) is 3.7x the longest wrong option (19 chars).
- Fix: expand the three wrong options with comparable explanatory clauses (e.g. "When dx/dt = 0 — the
  curve's x-motion has stopped while y carries on.") so all four options read as parallel, similarly-
  weighted sentences, without changing `correct`/`feedback`/answer.
- Scope: `k2.widget.options[*].label` only.

### pc-01-02 — `content/courses/parametric-polar-calculus/lessons/pc-01-02.json`, steps `c1`, `c2`, `k3`
- Current: `c1.figure="dr-tangent-line"` (tangent-to-y=x² demo), `c2.figure="dr-derivative-as-
  function"` (f(x)=x² vs. f'(x)=2x plot) — both from `derivative-rules`, unrelated to arc length;
  `k3.widget.options[*]` has a 62-vs-25-char leak.
- Fix: bind `c1`/`c2` to a new or existing figure that actually shows a curve cut into tiny straight
  segments with a Pythagorean dx/dy/hypotenuse label (matching `c1`'s own text), and — for `c2` — a
  figure connecting the arc-length integrand to velocity magnitude/speed, not a scalar function-and-
  its-derivative plot. This needs `src/components/figures.tsx` write access, outside lesson-JSON
  scope. Separately rebalance `k3`'s option lengths.
- Scope: `c1.figure`, `c2.figure` (new figure component/registration), `k3.widget.options[*].label`;
  no other step content needs to change.

### pc-02-01 — `content/courses/parametric-polar-calculus/lessons/pc-02-01.json`, step `i1`; `remedials[0].concept`; step `k1`
- Current: `i1.predict` and `i1.cml.explanation` both use "volume slices"/"volume integral" language
  attached to a polar-area `sliceSum` widget; `remedials[0].concept.figure="dr-power-rule-pattern"`
  (power-rule derivative table); `k1.widget.options[*]` has a 71-vs-39-char leak.
- Fix: rewrite `i1.predict.prompt`/`options`/`reveal` and `i1.cml.explanation.prompt`/`options` to
  talk about polar-area wedges/sectors and a "limiting area," not volume — the widget itself
  (`sliceSum` in `mode: "sector"`) is already correct and just needs its accompanying text fixed to
  match. Rebind `remedials[0].concept.figure` to `pc-polar-wedge` (already correctly built and used
  in `c1`/`c2` of this same lesson) or a dedicated remedial variant, replacing the unrelated power-
  rule table. Rebalance `k1`'s option lengths.
- Scope: `i1.predict`, `i1.cml.explanation`, `remedials[0].concept.figure`,
  `k1.widget.options[*].label`; the `sliceSum` widget's own spec, `k1`–`k3`/`ch1`'s math, and
  `pc-polar-wedge` itself are all correct as written and need no change.

### pc-03-01 — `content/courses/parametric-polar-calculus/lessons/pc-03-01.json`, step `c1`; `remedials[0].concept`
- Current: both cite `figure="dr-derivative-as-function"` (scalar f(x)=x² vs. f'(x)=2x plot), no
  vectors depicted.
- Fix: bind `c1` and the remedial concept to a new figure showing a position vector r(t)=⟨x(t),y(t)⟩
  with its velocity/acceleration arrows (or reuse an existing vector-diagram figure from this course
  if one exists that isn't already cited elsewhere in this lesson). Needs `figures.tsx` write access,
  outside lesson-JSON scope.
- Scope: `c1.figure`, `remedials[0].concept.figure`; no other step content needs to change — every
  numeric/vectorExplore answer in this lesson was independently recomputed and is correct as written.

## Raw data

- Review basis hashes for all 23 lessons obtained via
  `node scripts/session/print-review-basis.mjs <ids>` (23/23 resolved, 0 unknown).
- Staged dispositions, hashes, and evidence refs are recorded per-lesson in
  `reports/closure/cowork-staging/laneB-s322-F8-dispositions.jsonl` (23 NDJSON records, `recordId` =
  `S322-F8-<lessonId>`, `reviewer` = "Claude Cowork independent assessor (S322)").
- Hash-match cross-reference: `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` plus every
  `reports/closure/cowork-staging/*.jsonl` file scanned for `lessonId` + matching `reviewedBasisHash`;
  8/23 lessons matched a prior signed record exactly (bv-01-01, bv-02-02, bv-02-03, bv-03-01,
  bv-04-01, bv-04-02, bv-05-01, bv-05-03 — the last via the S317 ScatterFitW/bv-05-03 supersession
  record specifically); 15/23 matched none.
- `scatterFit` reachability check: a Node script computed, for every `scatterFit` widget across all
  three courses (12 total instances), both the continuous-OLS minimum MSE and a full grid-search
  minimum MSE over the widget's own `mMin/mMax/mStep/bMin/bMax/bStep`, compared against
  `tolerance`. Results: 7/12 achievable and correct (bv-01-02, bv-01-03, bv-02-01, bv-02-02, bv-03-01,
  bv-03-03, bv-05-03, dm-03-01 — note bv-05-03's 0.176-vs-0.175 margin is intentionally tight and
  correctly tuned), 5/12 unreachable (bv-05-02 `i1b`; dm-02-01 `i1`/`i2`; dm-02-02 `i1`/`i2`).
- Choice-length-leak check: every MCQ's correct-vs-longest-wrong-option character-length ratio was
  computed across all three courses (59 MCQs total) and checked against this codebase's own
  established guard threshold (`correct > 1.5 * longestWrong AND correct - longestWrong >= 12`,
  taken verbatim from `scripts/session/s285-circle-theorems-choice-progression-guard.mjs:32` and
  five sibling per-course repair guards). 7 MCQs crossed that threshold: bv-02-01 `rem-bv0201-k`,
  bv-02-02 `k2`, bv-03-02 `rem-bv0302-k`, dm-02-01 `k2`, pc-01-01 `k2`, pc-01-02 `k3`, pc-02-01 `k1`.
- Figure registration/content check: all 32 distinct `"figure"` IDs cited across the 23 lessons
  resolve in `src/components/figureIds.ts`. Each figure's rendering component in
  `src/components/figures.tsx` was read directly and compared against the concept text citing it;
  three figures (`dr-tangent-line`, `dr-derivative-as-function`, `dr-power-rule-pattern`) — all
  borrowed from the unrelated `derivative-rules` course's own figure catalog — depict content
  unrelated to the `parametric-polar-calculus` lessons citing them (see REVISE items 8-10).
- Task-framing check: `reports/closure/S315_POLAR_PARAMETRIC_CHOICE_PARITY.md` was read in full and
  confirmed to close lesson IDs in the course `polar-parametric` (Grade 12, `pp-*`), not
  `parametric-polar-calculus` (Grade 13/Calculus BC, `pc-*`); no repair record anywhere references
  any `pc-*` lesson ID.
