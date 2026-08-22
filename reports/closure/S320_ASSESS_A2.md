# S320-A2 — Independent Assessment: `radical-functions`, `rational-functions`, `sequences-series`

Independent Cowork assessment of three complete Algebra 2 (grade 11) courses —
`content/courses/radical-functions` (15 lessons), `content/courses/rational-functions`
(15 lessons), and `content/courses/sequences-series` (15 lessons), 45 lessons total.
Every lesson JSON and all three `course.json` files were read in full, twice each for
`radical-functions` and `rational-functions` (once before this session's compaction,
once again afterward to pin exact numeric detail for this report) and once each for
`sequences-series`. Every radical/rational-exponent conversion, domain, rationalization,
equation solution and extraneous-root check, asymptote/hole classification, and
arithmetic/geometric series sum and convergence claim was recomputed by hand against the
prompt/widget/feedback/explanation text. Read-only on all content; the only writes are
this report and the disposition NDJSON at
`reports/closure/cowork-staging/laneB-s320-A2-dispositions.jsonl`.

This report was produced starting from the `MT-V4-WORKER-PREFIX-1` block in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache is evidence only, nothing
here approves its own work, and this packet does not touch the ledger.

## Result counts

- `radical-functions`: 15 lessons reviewed — **15 KEEP**, 0 REVISE, 0 ESCALATE.
- `rational-functions`: 15 lessons reviewed — **15 KEEP**, 0 REVISE, 0 ESCALATE.
- `sequences-series`: 15 lessons reviewed — **15 KEEP**, 0 REVISE, 0 ESCALATE.
- Combined: 45/45 lessons signed, **45 KEEP / 0 REVISE / 0 ESCALATE**.

No mathematical error, answer leak, false feedback, missing/mismatched visual, option-parity
leak, or duplication was found in any of the 45 lessons. Every `decision` is KEEP, every
`visualDecision` is SUFFICIENT, every `gradeLanguageDecision` is FIT.

## REVISE list

None. No lesson required a REVISE or ESCALATE disposition.

## Programmatic duplication scan

Ran the corpus's own duplicate-detection module
(`scripts/audit/lesson-review-authority-s246.mjs`, `loadLessonReviewAuthority` →
`duplicateInventory.byLesson`) against all 45 target lesson IDs, corpus-wide (not just
within these three courses):

```
IDS_CHECKED: 45
TOTAL_RELEVANT_CLUSTERS: 0
```

Zero MCQ duplicate clusters (identity = prompt + sorted option labels) touch any of the
45 lessons, within-lesson or cross-corpus.

## Figure-registry scan

Extracted every `"figure"` id referenced anywhere in the 45 lesson files (104 unique
ids) and confirmed each resolves to a registered component in
`src/components/figures.tsx`:

```
Total unique figure ids referenced: 104
Missing (not found at all in figures.tsx): []
```

Zero missing or dangling figure references across all three courses. A sample of
figures were also read in full and checked against the mathematical content they
illustrate in earlier passes this session (`ParentFunctions`, `SqrtDomainGraph`,
`ExtraneousIntersection`, `ReGraphIntersect`, `ReReciprocalCancel`, `ReEvenNumerator`,
`ReOddNumerator`, and others) — all render the exact quantities their steps describe.

## Notes on borderline calls resolved as KEEP

- **S304/S310 already-repaired items not re-flagged.** Per task instructions, the
  choice-parity repairs documented in `S310_RADICAL_FUNCTIONS_CHOICE_PARITY.md`
  (`re-04-01` k3; `re-04-03` i2, k3; `re-05-02` k3) and
  `S304_RATIONAL_FUNCTIONS_CHOICE_PARITY.md` (`rf-01-01` i2, k3; `rf-01-02` k1;
  `rf-04-01` k1; `rf-04-02` k2, k3; `rf-04-03` i2; `rf-05-01` k3) were confirmed present
  in current source (read directly, matched to each script's documented "after" state)
  and excluded from this review's option-parity scan.
- **`re-05-02` step `i2` — option-length spread screened, cleared.** MCQ "Plugging
  5+10+20+⋯ into a₁/(1−r) gives 5/(1−2)=−5. What's wrong?" has a correct option
  (~73 chars, naming the |r|<1 precondition and the divergence) against three shorter
  distractors (~22–33 chars: denial, arithmetic-blame, wrong-value-blame). This is not a
  template-break-plus-outlier leak: the four options are four different *kinds* of
  answer to a diagnose-the-misconception question (a full causal explanation vs. three
  one-line deflections), not four instances of one shared template with a single
  conspicuous outlier. The length difference is inherent to correctly stating a
  precondition failure. No parity defect.
- **`sr-05-02` step `i2` — same MCQ shape, same screening result.** Identical
  diagnose-the-error structure and identical conclusion: cleared, not a defect.
- **`predict` widgets categorically exempt from option-parity scrutiny.** Confirmed via
  `src/lib/predictionReview.ts` that `predict` blocks are never graded and never touch
  mastery — they exist solely to schedule spaced review of missed predictions. Several
  predict blocks in this corpus (e.g. `re-03-02` i1, `rf-01-01` i1, `sr-05-01`/`sr-05-02`
  i1) deliberately pair a longer, nuanced correct insight against terser naive
  misconceptions; this is the intended design of a prediction, not an answer leak.
- **`sr-05-03` step `k3` — `"unit": "meters"` field on a `numeric` widget.** Confirmed
  via `src/lib/evaluate.ts` (`spec.unit` used in the numeric display-answer formatter,
  e.g. lines ~2708/2714/3121/3131) that this is a supported, decorative display field,
  not a grading defect.
- **Seeded-shuffle confirmed for `mcq`/`predict`, not re-audited.** `src/lib/prng.ts`
  `seededShuffle` is applied to `mcq` options (`src/components/widgets.tsx`) and
  `predict` options (`src/components/LessonPlayer.tsx`) at render time, so authored JSON
  option order is never what a learner sees for those two widget types — consistent with
  the task's framing. `sequenceBuild`/lab-widget `choices` shuffle-fixing (S316) was
  treated as already resolved per the task's authority note and not re-litigated.

## Per-lesson verdict lines

### radical-functions

- `re-01-01` — KEEP / SUFFICIENT / FIT — x^(m/n)=ⁿ√(xᵐ) conversion both directions;
  16^(3/2)=64, 27^(4/3)=81 verified.
- `re-01-02` — KEEP / SUFFICIENT / FIT — product/quotient/power-of-power on fractional
  exponents verified incl. reciprocal-exponent cancellation to x¹.
- `re-01-03` — KEEP / SUFFICIENT / FIT — even/odd exponent splitting under radicals;
  √(72x⁵)=6x²√(2x) and other mixed cases verified.
- `re-02-01` — KEEP / SUFFICIENT / FIT — monomial rationalizing incl.
  simplify-radical-first shortcut (4/√8=√2) verified.
- `re-02-02` — KEEP / SUFFICIENT / FIT — FOIL/squaring on radical binomials;
  (2+√3)²=7+4√3 and cross-term combination verified.
- `re-02-03` — KEEP / SUFFICIENT / FIT — conjugate identity a²−b and binomial-denominator
  rationalizing verified; S310 repairs confirmed present, not re-flagged.
- `re-03-01` — KEEP / SUFFICIENT / FIT — √x domain/range/principal-root semantics
  verified; ParentFunctions figure matches description.
- `re-03-02` — KEEP / SUFFICIENT / FIT — inside≥0 domain rule across
  coefficient/negative-slope/odd-root cases verified; SqrtDomainGraph figure matches.
- `re-03-03` — KEEP / SUFFICIENT / FIT — shift/reflect transformation toolkit on √x
  verified across start-point, range, and combined-profile cases.
- `re-04-01` — KEEP / SUFFICIENT / FIT — isolate-then-square method verified;
  extraneousRootLab true/phantom pair (3/−2) for √(x+6)=x confirmed.
- `re-04-02` — KEEP / SUFFICIENT / FIT — extraneous-root mechanism fully worked
  (√(x+7)=x+1 → x=2 keeps, x=−3 fails) and cml explanation option verified correct.
- `re-04-03` — KEEP / SUFFICIENT / FIT — root=root, cube-root sign-preservation, and
  ±-domain cases all verified; capstone extraneous pair (5 valid, 0 phantom) confirmed.
- `re-05-01` — KEEP / SUFFICIENT / FIT — reciprocal-power solving verified
  (x^(3/2)=27→x=9, x^(2/5)=4→x=32) against evaluate.ts semantics.
- `re-05-02` — KEEP / SUFFICIENT / FIT — even/odd-numerator ± rule verified across four
  regimes; i2 option-length spread screened and cleared (see notes above).
- `re-05-03` — KEEP / SUFFICIENT / FIT — skid/falling-object/pendulum models verified
  forward and backward; √-growth ×4→×2 scaling confirmed.

### rational-functions

- `rf-01-01` — KEEP / SUFFICIENT / FIT — denominator-only exclusion rule verified across
  factored/GCF/never-zero cases.
- `rf-01-02` — KEEP / SUFFICIENT / FIT — factor-and-cancel simplification, terms-vs-
  factors distinction, and inherited restrictions verified.
- `rf-01-03` — KEEP / SUFFICIENT / FIT — opposite-factor (−1) identity verified
  numerically and symbolically; addition-commutes non-case correctly distinguished.
- `rf-02-01` — KEEP / SUFFICIENT / FIT — multiply-and-cancel-across pipeline verified;
  restriction persistence through cancelled factors confirmed via signChart.
- `rf-02-02` — KEEP / SUFFICIENT / FIT — keep-change-flip verified incl. the
  divisor's-numerator-becomes-new-exclusion rule.
- `rf-02-03` — KEEP / SUFFICIENT / FIT — chained-operation restriction bookkeeping
  verified (3-value banned list correctly derived).
- `rf-03-01` — KEEP / SUFFICIENT / FIT — like-denominator combine incl. the
  distribute-the-minus trap verified.
- `rf-03-02` — KEEP / SUFFICIENT / FIT — factor-first, highest-power-per-factor LCD
  construction verified across shared/repeated/triple-denominator cases.
- `rf-03-03` — KEEP / SUFFICIENT / FIT — full LCD pipeline verified; numeric spot-check
  at x=2 matches symbolic result exactly.
- `rf-04-01` — KEEP / SUFFICIENT / FIT — reciprocal-function asymptote structure verified
  incl. shifted cases; graphZoom infinite-behaviour widget confirmed.
- `rf-04-02` — KEEP / SUFFICIENT / FIT — hole-vs-asymptote 0/0-vs-nonzero/0 signature
  verified incl. squared-factor case; graphZoom removable-limit values match hand
  computation.
- `rf-04-03` — KEEP / SUFFICIENT / FIT — horizontal-asymptote degree-comparison rule
  verified across all three regimes plus large-x numerical confirmation.
- `rf-05-01` — KEEP / SUFFICIENT / FIT — LCD-clearing verified incl. candidate-filtering,
  no-solution, and identity cases.
- `rf-05-02` — KEEP / SUFFICIENT / FIT — cross-multiplication and work-rate
  (rates-add-not-times) model verified incl. joint-time sanity check.
- `rf-05-03` — KEEP / SUFFICIENT / FIT — inverse-vs-direct fingerprint and joint
  variation z=kxy verified; gas-law application confirmed.

### sequences-series

- `sr-01-01` — KEEP / SUFFICIENT / FIT — recursive-vs-explicit contrast verified
  (a₆=19 via five hops, not six).
- `sr-01-02` — KEEP / SUFFICIENT / FIT — recursion's generality and its
  all-48-intermediate-terms weakness both verified.
- `sr-01-03` — KEEP / SUFFICIENT / FIT — recursive↔explicit conversion verified both
  directions (arithmetic and geometric), incl. n-vs-(n−1) sanity checks.
- `sr-02-01` — KEEP / SUFFICIENT / FIT — sigma anatomy and unroll-substitute-add
  evaluation verified; constant-rule-still-runs-the-counter case confirmed.
- `sr-02-02` — KEEP / SUFFICIENT / FIT — non-1-starting bounds, fencepost term-counting,
  and constant-multiplier factoring all hand-recomputed correctly.
- `sr-02-03` — KEEP / SUFFICIENT / FIT — sum→sigma rule/bound construction verified;
  equivalent shifted-index forms hand-expanded and confirmed equal.
- `sr-03-01` — KEEP / SUFFICIENT / FIT — Gauss pairing and the write-it-twice proof
  hand-recomputed (2S=4·12=48→S=24).
- `sr-03-02` — KEEP / SUFFICIENT / FIT — both arithmetic sum formulas verified and
  cross-checked for agreement; first-30-odd-numbers=30² identity confirmed.
- `sr-03-03` — KEEP / SUFFICIENT / FIT — word-problem extraction and sigma-as-
  arithmetic-series recognition verified; term-vs-total drilled correctly.
- `sr-04-01` — KEEP / SUFFICIENT / FIT — Gauss-fold failure on geometric series and the
  shift-and-subtract derivation verified across three ratio cases.
- `sr-04-02` — KEEP / SUFFICIENT / FIT — general finite-geometric formula verified
  against sr-04-01's derivation and fresh cases; rⁿ-vs-rⁿ⁻¹ distinction drilled.
- `sr-04-03` — KEEP / SUFFICIENT / FIT — geometric word-problem extraction and
  sigma-as-geometric-series recognition verified.
- `sr-05-01` — KEEP / SUFFICIENT / FIT — |r|<1 convergence rule verified across a full
  classification set; harmonic-series counterexample correctly used.
- `sr-05-02` — KEEP / SUFFICIENT / FIT — infinite-sum formula verified across
  positive/alternating/backward-solve cases; i2 |r|<1-precondition MCQ screened and
  cleared (see notes above).
- `sr-05-03` — KEEP / SUFFICIENT / FIT — repeating-decimal conversion and bouncing-ball
  motion model hand-recomputed; three-tool selection verified.

## Return contract

`packet_id=S320-A2-radical-rational-sequences-assessment, base_commit=<unresolved, no
git repo present at /home/user/maggies-trail>, contract_hash=<n/a — no packet contract
file supplied for this task>, role=independent-assessor, model=claude-sonnet-5,
effort=high, speed=n/a, scope_ids=[re-01-01..re-05-03, rf-01-01..rf-05-03,
sr-01-01..sr-05-03] (45 lessons), status=complete, changed_file_hashes=<none — read-only
on content; report+disposition NDJSON are new files, not content changes>,
evidence_refs=[content/courses/radical-functions/**,
content/courses/rational-functions/**, content/courses/sequences-series/**,
src/components/figures.tsx, src/lib/evaluate.ts, src/lib/schema.ts,
src/lib/predictionReview.ts, scripts/audit/lesson-review-authority-s246.mjs],
gates_passed=[math-recomputation(45/45), answer-leak-check(45/45),
feedback-specificity-check(45/45), duplicate-scan(45/45, 0 clusters),
figure-registry-check(104/104 resolved), option-parity-screen(45/45, 2 candidates
reviewed in full context and cleared)], gates_failed=[none], cache_invalidations=none,
new_decision_required=none, risks=[none identified], next_owner=none — no REVISE items
to route to an implementation lane.`
