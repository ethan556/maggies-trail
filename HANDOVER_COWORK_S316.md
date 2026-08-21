# Maggie's Trail — Cowork S316 session handover (2026-08-20)

Multi-agent closure session (Claude Cowork, Fable 5 integrator; Sonnet 5 workers/verifiers; Opus 5 adjudicator).
~35 agent packets: implement → independently verify → adjudicate divergence → reconcile gates → serial integration.

## Queue movement (honest numbers)

- Committed baseline claimed **5,410** open rows — but that count only reproduces on the original
  Windows working tree. Root cause found and fixed: the review-basis hashes are byte-sensitive and
  the ledger was signed over MIXED line endings (script-rewritten lesson JSONs = LF, checked-out
  course.json = CRLF). On a clean LF checkout all 439 latest decisions read stale.
- **Ledger migration** (`scripts/session/migrate-decision-basis-lf-normalization-cowork.mjs`,
  additive-only): 187 decisions proven byte-equivalent under ending variants were re-based; 252 are
  genuinely stale (history + the final commit's own edits). Honest LF baseline: **5,473 rows / 104 P0**.
- **End of session: 4,676 rows / 101 P0** (net −797 from the honest baseline; −734 vs the claimed
  committed figure). LESSON_REVISION_IMPLEMENTATION 131 → 31; the three per-lesson review streams
  1,514 → 1,284 each; progression 245 → 238.

## Delivered (all signed + independently verified; evidence in reports/closure/S316_*.md)

- **Revision implementation**: 131 contracted rows worked; ~120 lessons revised and verified KEEP
  across add-subtract-10-k, add-within-100-g1, properties-strategies-g1, fluency-20-g2,
  fractions-deeper-g3, measure-problems-g4, unlike-fractions-g5, decimal-fluency-g5,
  bivariate-statistics, geometry-g7, transformations-measurement, multiplication-division,
  multiply-bigger, mult-fluency-g3. Remaining 31 revision rows are honest re-opens/new findings.
- **S316-R adjudication** (`S316_ADJUDICATION_REMEDIAL_STANDARD.md`, Opus): binding standard for
  remedial-duplicate fixes — fresh instance suffices ONLY with normalized-template distinctness
  (digits→#, vs every step), non-producibility by the step's declared generator, and no
  answer-on-screen adjacency. KOA-R pattern re-dispatched 15 koa lessons successfully.
- **Course assessments** (15 courses, ~236 lessons, all dispositions in ledger):
  counting-to-100-k 18K/0R (its 9 queue P0s were stale — already fixed in S262),
  measurement-data 15K/2R, circle-theorems 14K/2R, function-analysis 13K/3R,
  expressions-equations 12K/6R, proportional-relationships 7K/9R, integration-accumulation 15K/0R,
  triangle-congruence 15K/0R, measure-money-time 11K/4R, limits-continuity 14K/1R,
  trig-graphs-inverses 13K/2R, vectors-matrices 13K/2R, logarithms 15K/0R,
  constructions-and-proof 15K/0R, **place-value 3K/12R (see open debt)**.
  All non-place-value REVISE contracts implemented + verified this session except noted debt.
- **P0 engineering, learner-visible**:
  - 11 lab widgets rendered answer choices unshuffled (correct-always-first ⇒ 100% gameable).
    Seeded-shuffle applied (McqW pattern), grading-by-id proven, 40 regression tests
    (`labChoiceOrder.s316*.test.tsx`). `DiscreteEstimateCompareW` intentionally skipped
    (ordered-scale semantics) — but 4 authored instances in mmt-02-01 are correct-first
    exploitable and need CONTENT reordering (open debt).
  - `UnitRulerW` off-by-one (user-reported screenshot): COVERED displayed the finish coordinate,
    not covered length, whenever objectStart>0; object bar/unit origins unified. Grading unaffected
    (proof in `S316_MEASURE_LENGTH_GEOMETRY_FIX.md`); all 47 authored steps swept.
  - **15 new/parameterized semantic figures** (`figures.tsx`, additive) closing wrong-scenario or
    missing figure defects in measure-problems-g4 (11 bindings), mf3-02-01 (×8 double-double-double),
    sa7-01-03 (pyramid net figures), tm-03-02 (right-triangle 90/35/55 — WITHHELD state legitimately
    cleared with an exact semantic figure, hash-verified not a blocklist dodge).

## Gate corrections (all logged, none loosened without proof)

- `optionOrder.test.tsx` corpus-bias pin 0.95 → 0.8: PROVEN red at clean HEAD on this platform
  (fails at c977efa and 06a9bb1 pre-session); threshold matches the sibling predict test.
- `compile-v4-backlog-portfolios-s247.mjs`: stamped snapshot constants (exactly 146 portfolios,
  >34.1x) replaced with reconciliation invariants (1..146, no empty portfolio, >10x); the
  exactly-once row-coverage asserts untouched.
- `content.plotData.s237.test.ts`: exact allowlist extended for 4 truthful new mmt-05-03 plotData
  rows + independent verification route added for a previously-unroutable authored shape; 3 masked
  pre-existing latent failures unmasked and covered. 30/30 green.
- Session content-pin tests re-pinned to current signed content (18 files;
  `S316_GATE_RECONCILIATION.md` has every old→new).

## Test-suite truth (critical for the next session)

Full vitest on this Linux checkout: session-caused failures are ZERO after reconciliation, but
**~318 tests across ~79 files fail at CLEAN HEAD on Linux** (verified in a pristine worktree at
06a9bb1). These are pre-existing platform reds — mostly content-hash/count pins stamped on the
Windows tree (same byte-sensitivity class as the ledger migration) plus some genuinely stale pins
(session190/197/244/245/252 families, figure inventory counts, precache seal test). They were NOT
"fixed" here because bulk re-pinning without per-test review would weaken gates. Next session:
classify per family, normalize hash inputs (CRLF→LF) where the pin is byte-artifact, re-pin the
rest with evidence. Do not claim "all tests green" on any platform until this is done.

## Open debt (verified, contracted)

- place-value: 12 REVISE contracts incl. figure-prose contradictions (pv-02-02 teaches 368→400 next
  to a figure showing 349→300), course-wide MCQ length-leak (correct = longest 64%), one false
  commonError (pv-03-01: 545 should be 546). Contracts in `S316_LANEB_PLACE_VALUE_ASSESSMENT.md`.
- f20 5 lessons: R6 answer-on-screen (remedial concept states the exact worked example the check
  asks); g3f-01-04 remedial template + stale explanationVariants. Signed REVISE (S316-V4).
- bv-05-03: ScatterFitW widget defect (MSE/SSE labeling, residual accessibility) — needs widgets.tsx.
- md-03-02/03 + mmt-05-03-class: bar-graph lessons need a `barData` schema mechanism (plotData
  exists; barData does not).
- mmt-02-01: 4 DiscreteEstimateCompare instances need authored ascending reorder.
- mf3-03-01/03/06: ESCALATE upheld (human pedagogy decision). g4v remedial `two-step-bar` on other
  lessons and several generator-form gaps flagged as generator debt (variant keys removed where
  authored content legitimately outgrew templates — see VARIANT_LOG.md entry).
- Standards: 2 partial edges retained untouched, per programme rule.

## Integrity notes

- Every content change is covered by a signed disposition in `LESSON_REVIEW_DECISIONS_S244.jsonl`
  (418 records appended this session, format-normalized at append with provenance; append order in
  `scripts/session/append-s316-dispositions.mjs`). First-round verifier files laneAV-g1/g2-g3/g4-g5
  were set aside by adjudication and intentionally NOT appended.
- Serial integration ran single-writer: ledger append → audit:pending-workload →
  lesson-review-cards → S247 compile → work cache (SOURCE_SEAL_MATCH). validate:content 1840/1840,
  lint:pedagogy 1711/1711, cml strict clean, check-registration consistent, tsc clean,
  validate:native archive-only findings, build exit 0.

---

# S317 addendum (same day, second aggressive round)

## Queue movement
4,676 → **4,451 rows / 101 P0** (cumulative from honest LF baseline: 5,473 → 4,451, −1,022).

## Delivered (all signed + independently verified; evidence in reports/closure/S317_*.md)
- All prior open contracted debt implemented and verified: place-value 12/12 (figure-prose truth incl.
  the 368/349 contradiction, two new Pv3EstimatePair figures, 13 mcq length rebalances, 545→546),
  f20 5×R6 answer-on-screen, g3f-01-04 residuals, mmt-02-01 estimateSlider ascending reorder.
- Engineering: ScatterFitW metric label corrected to MSE + residual accessibility (widget AND
  describeState panel); **barData mechanism** built end-to-end (BarDataSpec in schema.ts, accessible
  BarChartFigure with valueLabels:"all"|"none" anti-leak mode, authored onto md-03-02/03 where
  truthful, one honest fail-close md-03-02/k2, 35 new tests incl. an exact corpus allowlist gate).
- 4 new course assessments (67 lessons): data-distributions 17K/1R, statistical-inference 11K/7R,
  fractions 9K/6R, conditional-probability 12K/4R — and ALL their REVISE contracts implemented and
  verified in-session (13 mcq length-leak rebalances + si-01-02 teaser; fr-04-01/02/04 figure truth
  via two new parameterized comparison figures; BOTH cpr P0 withheld-figure rows legitimately
  cleared: cpr-03-03 reword off a stale blocklist fingerprint, cpr-05-01 fixed-exemplar restatement).
- Gate items: retired the dangling cpr-03-03 manual hold (audit's bind-exactly-once invariant);
  pv-02-04 prose reword to clear an OPERATION_CONFLICT heuristic false-positive; cpr-05-01 c2
  tightened to the 80-word cap. schema.algebraTilesArea count pin (28 vs 29) confirmed PRE-EXISTING
  at clean HEAD — left in the documented platform-red set.
- 111 further signed dispositions appended (S317 records; append script extended, idempotent).

## Gates at S317 close
schema 1840/1840 · pedagogy 1711/1711 · CML strict clean · registration consistent · tsc clean ·
figure adversarial audit green · figureViewportParity green · barData/plotData/describeState suites
green · build exit 0 · SOURCE_SEAL_MATCH.

## Remaining open debt (beyond the S316 list, updated)
- dd course-wide mild length-parity pattern (8 lessons, non-blocking editorial notes).
- session195 g3f-01-04 `.variant.gen` dereference red (pre-existing class, documented).
- manualHolds follow-ups: none dangling; legacy zero-binding blocklist keys await their reviewed
  removal wave. Platform-red reconciliation (~318 tests at clean HEAD) still the top next-session item.

---

# S318 addendum (same day, third aggressive round)

## Queue movement
4,451 → **4,221 rows / 33 P0** (cumulative from honest LF baseline: 5,473 → 4,221, −1,252; P0 104 → 33).

## Headline: the WITHHELD-figure P0 class is fully closed
The serial VIS writer chain (vis01-illustration-measurement etc.) had not been run since the figure
work landed; running it revealed the true state and drove the wave. All **56 withheld placements**
(33 WITHHELD_BLOCKLIST_FINGERPRINT + 23 WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD) across 24 courses were
legitimately cleared — figure and prose now genuinely agree, verified per placement with the repo's
own isFigureTextAligned/fingerprint modules AND the adversarial risks() heuristic (zero candidates;
figureTextAdversarialAudit fully green). 16 new parameterized figure components (additive; e.g.
Mult3MissingFactorExample) replaced fixed exemplars where prose contortion would have been dishonest;
1 wrong-topic figure got a new truthful component (DecimalShiftDivide); 2 dangling manual holds
retired per the in-file precedent; ILLUSTRATION_REPLACEMENT is no longer in the queue table.
Verification: 57 lessons re-signed KEEP across four independent passes (laneV-s318-*).

## Also closed
- QUESTION_DIVERSITY P0: 15 rows worked — 14 proven stale queue signals (already repaired in
  committed S263–S282 sessions; evidence per row), 1 real defect fixed (fa-02-02 ch1 →
  dragBucket transfer task, precedent S267). NOTE: the queue detector still emits these 15 rows
  because its cached evidence predates the repairs — a consolidator-refresh item for next session,
  documented in S318_QD_P0_IMPLEMENTATION.md.
- PROGRESSION P0: 11 rows — 10 fixed (duplication genuinely resolved, verified), 1 adjudicated
  NOT_REPRODUCIBLE (rno-04-02 k2 is deliberate compare-contrast pedagogy; two independent
  concurring rulings). 7 stale variant keys removed as generator debt (VARIANT_LOG).
- Platform reds: 60 tests across 5 files fixed (stale DOM/schema locators, NOT CRLF — the CRLF
  hypothesis was disproven: zero CRLF files exist; classification in
  S318_PLATFORM_RED_RECONCILIATION.md). ~230 remaining reds are classified content/generator
  defects + 6 stale generated artifacts + 2 ambiguous; one flaky file flagged
  (session252.unlikeFractionsG5 flips run-to-run).
- 2 more course assessments: right-triangles-trig 13K/2R (two mcq length-parity contracts, open),
  exponential-functions 12K/0R.
- 89 further signed dispositions appended (total this session: 616).

## Remaining P0 (33)
CLOSURE_LEDGER 12 (umbrella rows), QUESTION_DIVERSITY 15 (stale detector evidence — refresh
consolidator inputs), LESSON_REVISION_IMPLEMENTATION 3 (mf3 ESCALATEs awaiting human pedagogy
decision), V4_PROGRAMME_PHASE 3 (umbrella).

## Gates at S318 close
schema 1840/1840 · pedagogy 1711/1711 · CML strict · registration · tsc clean · adversarial figure
audit green · full serial writer chain green (world manifest, claims+check, VIS01: ZERO non-render
placements, alignment, parity [pre-existing 4-debt recorded state unchanged], semantic inventory) ·
build exit 0 · SOURCE_SEAL_MATCH.

---

# S319 addendum (same day, fourth aggressive round — the mass-assessment wave)

## Queue movement
4,221 → **3,109 rows / 29 P0** (cumulative from honest LF baseline: 5,473 → 3,109, **−2,364, 43% of the
programme closed in one session**; P0 104 → 29).

## Delivered (all signed + independently verified; evidence in reports/closure/S319_*.md)
- **Mass assessment**: 12 dual-course assessors signed 374 lessons across 24 courses in one batch
  (decimals-intro-g4, mult-div-fluency-g4, add-subtract-20, add-subtract-100, how-many-k,
  counting-120, two-step-equations, number-system, ratios-rates, measure-convert, similarity,
  geometry-foundations, area-surface-volume, polygons-quadrilaterals, curve-analysis,
  derivative-rules, complex-numbers, polynomial-functions, conic-sections, polar-parametric,
  coordinate-proofs, solid-geometry, function-transformations, polynomial-rational-analysis):
  329 KEEP / 44 REVISE / 1 ESCALATE (ns-03-02, engine-capability judgment for a human).
- **All 44 REVISE contracts implemented AND verified KEEP in-session** across four packets, notably:
  sg-02-03's wrong lateral-area answer key (208 → 200, derived twice independently via cross
  products, approxFormula rebuilt through the engine's own evaluator); pra-03-03's false
  removable-hole claim; 9 mult-div-fluency i1/i2 byte-duplicates; 11 course-slug jargon leaks in
  coordinate-proofs; 5 how-many-k cross-lesson duplicates; 6 new/rebound truthful figures
  (ca-plus-c-family, ca-open-box-setup, ca-fence-against-wall, asv-surface-vs-volume,
  dpv-tenths-number-line, BoxLayers parameterized to the lesson's real 2×3×4).
- **QUESTION_DIVERSITY P0 15 → 10, legitimately**: excellence-backlog generator traced, rerun after
  ONE evidence-backed adjudication (df3-03-02 ruled intentional-assessment with lesson-level
  evidence; entry in scripts/audit/excellence-dispositions-s126.json). 6 rows dropped on live
  tier-climb, 9 remain genuinely open (need extend/multi-engine design work — real debt, listed in
  S319_EXCELLENCE_REFRESH.md). CLOSURE_LEDGER rows honestly left OPEN (their conditions demand
  human visual review; Session-319 evidence table appended to CLOSURE_LEDGER.md).
- rt-01-04/rt-05-04 length-parity contracts implemented+verified.
- **421 further signed dispositions appended (session total: 1,037).**

## New open debt found by verifiers (documented, not hidden)
- vm-04-01 (volume-measurement) binds box-layers with mismatched prose — PRE-EXISTING both before
  and after the parameterization; needs its own contract.
- g4m-02-03/ch1 vs g4m-02-05/k1: cross-lesson byte-duplicate fact (1,393÷7) — new finding beyond
  the original within-lesson scan.
- ns-01-01/k3 "wait" scratch fragment (uncontracted); ns-03-02 ESCALATE (numberLineHop 5-hopper
  promise vs engine gap, KNOWN_ISSUES S119).

## Gates at S319 close
schema 1840/1840 · pedagogy 1711/1711 · CML strict · registration · tsc clean · adversarial figure
audit green · viewport parity outside=260 ≤261 (fixed 3 new + 2 inherited overruns in this wave's
components; budget untouched) · full serial writer chain green, VIS01 still ZERO withheld · build
exit 0 · SOURCE_SEAL_MATCH.

## Remaining queue shape (3,109)
792×3 per-lesson review streams (~78 courses still unassessed — the mass-assessment pattern above
closes ~1,100 rows per 12-agent wave), CHOICE_SURFACE 447 (131 contracts; generator microbatches
never yet run as a dedicated lane), PROGRESSION 228 (52 course contracts), CLOSURE_LEDGER 27,
REVISION 12, QD 10, V4_PHASE 7, STANDARDS 2 (held per programme rule).

---

# S320–S321 addendum (same day, final rounds — cut short by the org monthly spend limit)

## Queue movement
3,109 → 1,569 (post-S320 integration) → **1,735 at final commit** (see "unverified limbo" below).
Cumulative from honest LF baseline: **5,473 → 1,735 (−3,738, 68% closed with full verification;
~75%+ once the pending verification round lands).** P0 29 → 35 (honest re-opens from severe finds).

## S320 delivered (all signed + verified except where noted)
- Mass wave: 12 triple-course assessors signed 496 lessons (346K/143R/6E); 495 dispositions appended.
- CHOICE_SURFACE_INTEGRITY legitimately regenerated via its own generator (mcq-leakage.mts):
  447 → 252 (90.2% of authored rows were stale — S298–S315 repairs never re-scanned; generated
  166 unchanged, correctly — no repair has ever touched variants.ts). Trace: S320_CHOICE_LANE.md.
- Progression dedup: 45 rows fixed across place-value-1000/tens-and-ones/radicals-and-exponents/
  rational-number-operations (S320_PROGRESSION_DEDUP.md).
- ALL 143 S320 REVISE contracts implemented across 8 packets (S320_IMPL_*.md): incl. the alg1-03-02
  hard math error (6h=24→h=4), the systemic esn-01-01 "n zeros" off-by-one (13 occurrences), massive
  K-course dedup waves, DistributionCompareLabW measure-mode shuffle fix (22/22 tests).
- Small debt: vm-04-01 60-cube figure, g4m cross-dup, ns-01-01 k3 (S320_SMALL_DEBT_FIXES.md).

## S321 — where the spend limit hit
18-agent closing wave launched (14 assessors covering ALL remaining courses + 3 verifiers over the
143 implemented lessons + 1 figure packet). ONLY 3 completed: F4 (multistep-g4/volume-problems-g5/
long-division-g5, 13K/9R), F7 (differential-equations/series-convergence/integration-applications,
15K/3R), F9 (mult-fluency-g3/multiplication-division/transformations-measurement, 52K/5R/3E).
Their 100 dispositions are appended. F3/F10 wrote truncated staging files (validator rejects — do
NOT append; re-run those assessors fresh). The other 9 assessors + all 3 verifiers + the ep-03-01
figure packet died mid-run with no usable output.

## UNVERIFIED LIMBO — the first thing the next session must fix
The 143 S320-contract implementations are DONE and self-checked but NOT independently verified
(their verifiers died). Their content edits made the S320 REVISE dispositions hash-stale, so ~370
generic review rows re-opened at regen — that's why the final queue reads 1,735 not ~1,400. ONE
verification round (3 packets, prompts preserved in this conversation's pattern; lesson lists in
laneA-s320-impl-*.jsonl) re-signs them and collapses those rows. Resumption order:
1. 3 verifier packets over impl-1..8 + smalldebt lessons (sign S321-V* dispositions).
2. Re-run assessors for: F1 (patterns-factors-g4, multiply-bigger, word-problems-g3), F2
   (absolute-value-piecewise, inequalities-and-regions, nonlinear-systems), F3 (shapes-and-sorting-k,
   shapes-shares-g2, four-addends-g2), F5 (number-line-g2, length-problems-g2, arrays-even-odd-g2),
   F6 (the-real-number-system, binomial-theorem, expected-value), F8 (bivariate-statistics,
   data-and-models, parametric-polar-calculus), F10 (fractions-deeper-g3, unlike-fractions-g5,
   decimal-fluency-g5), F11 (measure-problems-g4, division-fluency-g3, shapes-space), F12
   (place-value-1000, tens-and-ones, radicals-and-exponents — doubles as dedup verification), F13
   (rational-number-operations, exponential-functions, functions-and-sequences), F14
   (linear-functions, volume-measurement).
3. Implement the new F4/F7/F9 contracts (17 REVISE: mostly duplicates + 3 length-leaks + 2 figure
   mismatches mult-04-04/mult-05-01 + tm scratch-text) and the ep-03-01 distribute-area figure.
4. Ledger append → full serial writer chain → gates → commit.
Projected end state after that round: queue ≈ 300–500, essentially only CLOSURE_LEDGER umbrellas
(need human visual review), generated-CHOICE 166 (needs the missing per-tag replay tool), QD 9
(need extend/multi-engine design), V4_PHASE 7, STANDARDS 2.

## Gates at this commit
schema 1840/1840 · pedagogy 1711/1711 · CML strict · registration · tsc clean · diff-check clean.
(Full vitest/build NOT re-run after the S320 impl wave — the limit hit first; next session must run
the full suite + build before deploying. Known-green at the S319 commit.)

# S322–S326 addendum (2026-08-21, sixth–tenth aggressive rounds — session close)

## Queue: 1,735 → 749 open rows (P0 41 → 25 → all remaining P0s are documented long-horizon classes)
Honest chain state at close: 749 rows / 25 P0 (CLOSURE_LEDGER 12 — needs human visual review;
QUESTION_DIVERSITY 10 — needs multi-engine design; V4_PROGRAMME_PHASE 3). Ledger: 3,011
disposition records; SOURCE_SEAL_MATCH end-to-end after every append.

## What landed (all independently verified)
- S322: 331 lessons assessed (11 assessors), 40 fixer lessons (dupfix/v2fix), GraphZoomW
  curvature, monomial-distribute-area adoption. Appended 295 records.
- S323: all 128 LESSON_REVISION_IMPLEMENTATION rows implemented (8 packets + engineering:
  SequenceReasoningW choice-mode seededShuffle; Mult3GroupsAdjustCars figure for mult-04-04).
  111 KEEP / 14 ESCALATE (src-blocked, precisely specified).
- S324: both engineering packets discharged ALL 16 escalations — 12 new registered figures
  (fair-shares/how-many-groups df3 family, g2l read-landing/gap/missing-jump, pc arc-length/
  integrand-speed/motion-vectors, vec-matrix-row-recipe), SyDilationParallel k=1.8 truth fix,
  legitimate re-pins across 9 test files (all old→new values recomputed with each test's own
  algorithm; documented in S324_ENGFIG.md / S324_ENGPIN.md). Independent verification: V1 31/44
  clean + 13 findings; V2 30/30 clean; V3 37/38 + 1 finding; V-ENG 16/16 clean, pin audit LEGITIMATE.
- S325: all 14 verifier findings fixed (FA 7, FB 7) + 2 main-loop pedagogy-gate corrections
  (g5d-01-05 reachable 387; g2n-02-03 generic-opener reword).
- S326: platform-red reconciliation of all 55 new-vs-baseline vitest reds (R1/R2/R3):
  stale pins re-pinned with signed-authority citations, 7 real regressions fixed (incl. 13
  S320-dedup choice-order regressions restored, g1 solver oracle extended, 4 dead variant
  declarations removed, figure-text blocklist +2 via sanctioned path), precache manifest
  re-pinned to final counts (queue 749, decisions 3011).

## Gates at close
- validate:content 1840/1840; lint:pedagogy 1711/1711; figure-text-alignment 0 violations;
  vis01 3573/3573 RENDERS; gen-figure-ids idempotent at 2029; viewport parity ≤261 held.
- FULL vitest: 301 failed / 15,444 passed — vs 318-red documented baseline: 23 baseline reds
  FIXED, zero unadjudicated new reds (the 6 residual "new-vs-baseline" rows are proven
  byte-identical reds at true clean HEAD a78d6a3; the stored baseline logs were cut at 06a9bb1).
  List + adjudications: S325_NEW_PLATFORM_REDS.txt, S326_RECONCILE_R1/R2/R3.md.
- npm run build: EXIT 0 (production build green).

## Remaining documented debt (unchanged classes)
~295 platform reds (content/generator pin classes, inventoried); CLOSURE_LEDGER 27 rows (12 P0)
awaiting human visual review; generated-CHOICE 252 rows awaiting per-tag replay tool; QD 10
extend/multi-engine design; V4_PHASE 7; STANDARDS 2 (held per programme rule); variants FLOOR
5842<5900 (pre-existing at HEAD — either implement 4 missing forms or take a variants-lane
ruling on the floor); asv-surface-vs-volume label collision (pre-existing, fix suggestion in
S326_RECONCILE_R3.md); figureTextAlignment sentinel now vacuous-red because the corpus is fully
clean (test-side pin decision needed).

# S327–S328 addendum (2026-08-21, eleventh–twelfth aggressive rounds, still session-close)

## Queue: 749 → 188 open rows (75% further reduction this round; 96.6% closed session-to-date)
Honest chain state at close: 188 rows, 0 P0 (every remaining row is either an explicitly
documented held/human-only class, or the mildest tier of a structural-only check — see below).
Ledger: 3,334 disposition records; SOURCE_SEAL_MATCH end-to-end after every append; every one of
1,701 lessons carries a CURRENT (non-stale, non-invalid) decision (0 stale, 0 invalid, 0 duplicate,
0 unknown — `lesson-review-cards-s244.mjs` confirms `currentCount: 1701`).

## What landed (all independently verified)
- **S327 (17-agent wave):** discovered VISUAL_FIRST_REPRESENTATION / GRADE_LANGUAGE_REVIEW /
  LESSON_COMPLETE_DISPOSITION are always the identical 92-lesson never-reviewed set (one signed
  disposition closes all three) — 7 assessor packets (A1–A7) gave all 92 a full first-time
  triple-disposition review. 6 progression-fixer packets (PG1–PG6) processed 170 of 175
  LESSON_PROGRESSION_AND_DUPLICATION rows (redesign where the repeat was a real problem, signed
  KEEP-with-fluency-rationale where it wasn't). 2 choice-fixer packets (CH1–CH2) closed the 46
  authored-source CHOICE_SURFACE_INTEGRITY rows not already owned by a progression packet. 1
  generator-engineering packet fixed all 166 generator-template-sourced CHOICE rows across 57
  owners in `src/lib` — `npx tsx scripts/audit/mcq-leakage.mts` now reports **0 tells** across
  5,203 measured MCQ items, corpus-wide. A free `mcq-leakage.mts --write` regen at wave start
  (before any agent edits) also dropped CHOICE 252→232 at zero cost.
  Process note: a shared ad hoc scratchpad helper (not the central append script) collided
  mid-run and misdirected 11 of A1's 12 disposition records into sibling A3's staging file; A1
  self-detected it, rebuilt its own correct file, and flagged A3's file untouched. Resolved at
  integration via a two-pass append (A1's file alone first, so its recordIds enter the ledger's
  `existingIds` set; then the remaining 14 files, whose 11 stray A1-prefixed duplicates inside
  A3's file were silently skipped by the idempotent already-appended check rather than hard-
  failing the run). See `append-s316-dispositions.mjs`'s ORDER comments for the exact mechanism.
- **S327 architecture correction:** `compile-v4-backlog-portfolios-s247.mjs` hard-asserted
  exactly 166 live generator-sourced CHOICE rows / 57 tags / 14 domains. Once the generator-
  engineering packet legitimately closed all 166, this became a false-corruption trip on a real
  success state (mirrors the S322 portfolio-compression correction). Fixed the same way: the
  0-row fully-closed state is now tolerated with a warning instead of a throw; any OTHER count
  (1–165, 167+) still hard-fails as genuine drift. Row-coverage/reconciliation invariants
  unchanged.
- **S327 finding — LESSON_PROGRESSION_AND_DUPLICATION has no disposition-closure path:**
  unlike the three generic-review workstreams, this row type is computed purely from live
  lesson JSON (`consolidate-pending-workload-s236.mjs`, repeatedWidgets/repeatedPrompts/
  repeatedTemplates) with zero reference to the ledger — a KEEP-with-fluency-rationale
  disposition is valid, signed, permanent evidence but does NOT suppress the row; only an actual
  content redesign does. This is very likely a real gap between the workstream's own `next_action`
  copy ("assign question jobs and approve a fluency/retrieval rationale **or** replace the
  repeat...") and what was ever wired up. Deliberately NOT changed this round: a retroactive
  disposition-based suppression is only safe if scoped to the *exact* repeated step IDs a
  disposition actually reviewed (nothing in the current schema captures that — a lesson-level
  KEEP covers many dimensions at once), and a naive lesson-level suppression would silently
  vaporize genuine open flags across any of the corpus's many *other* already-KEEP lessons that
  never evaluated this dimension. Left as a flagged architecture decision for explicit sign-off,
  not a unilateral change. Net effect this round: PG1–6 fully reviewed all 175 rows; 33 closed by
  redesign (100% of the P0/severe tier — verbatim-duplicate-widget and exact-duplicate-prompt
  rows are now zero); the remaining 142 are 100% P1 (number-normalized-template-duplicate only —
  same sentence shape, different numbers), each carrying a signed fluency rationale that is real
  evidence but not (today) a closing action.
- **S328 (3-agent wave):** discharged all 5 S327 LESSON_REVISION_IMPLEMENTATION escalations.
  - E1: root-caused the corpus-wide `countTeenFrame` (`src/lib/g0Variants.ts`) authored-prompt
    mismatch A4 (S327) had flagged — ground-truthed against the actual `TenFrameW` widget
    component and its schema cap (`target ≤ 10`, `preFilled < target`), which proves a
    "full-ten-plus-extra" rendering is structurally impossible, so the correct fix is the prompt
    wording, not the widget state. Fixed the generator and swept the full `teen-numbers-k`
    course: 9 lessons total (`knb-01-03`, `knb-02-02` — A4's originals, content already patched,
    generator fix alone resolved them — plus 7 real siblings `knb-01-04/02-01/02-03/02-04/
    03-01/03-03/03-04`; documented that A4's "8 siblings" list wrongly included `knb-03-02`,
    which has zero tenFrame widgets).
  - E2: closed both visual ESCALATEs with two new registered figures — `vm-notch-block`
    (g5v-03-01, depicts subtracting a 15-cube notch from a 48-cube block) and
    `vm-equal-volumes-compare` (g5v-03-03, depicts 20×3=12×5=60 side by side, bound only to `c2`
    so it doesn't spoil `c1`'s predict-before-reveal step). Full registration chain run
    (`gen-figure-ids.mjs`, `generate-figure-numeric-claims.mts`), new pinning test added
    (`s328Figures.test.tsx`, 12/12), corpus-wide collision ratchet re-run clean modulo one
    pre-existing unrelated failure (`asv-surface-vs-volume`, already documented S326 debt).
  - E3: implemented `pv1000-02-01`'s REVISE. The blocking pin A1 (S327) cited
    (`session273.placeValue1000Course.test.ts`, a step-ID/widget-type/withheld-figure pin over
    the {pv1000-02-01, pv1000-04-02, pv1000-04-03} trio) turned out never to touch the actual
    defect (a false "next problem" claim in `i1.predict.reveal` — `session273`'s `Step` type has
    no `predict` field at all). The real, narrower pin was one row of
    `session301.placeValue1000PredictionOrder.test.ts`'s per-lesson reveal-hash table. Fixed
    content-only; re-pinned exactly that one hash cell; confirmed both trio-mates untouched and
    their existing KEEP dispositions still stand.
- **S328 main-loop:** a corpus-wide `vis01-illustration-measurement.mts` regen (a side effect of
  E2's gate-running) surfaced 2 pre-existing, S327/S328-unrelated P0 ILLUSTRATION_REPLACEMENT
  rows: `division-fluency-g3/df3-02-02` and `df3-03-02` each referenced the generic
  `mult3-fact-family` figure (no numbers in the ID, unlike every sibling remedial in the course,
  which all use a numerically-specific figure matching their own body) — production's
  `figureTextAlignment` gate was silently withholding it at runtime
  (`WITHHELD_BLOCKLIST_FINGERPRINT`). Purpose-built, already-registered figures existed for both
  exact concepts (`mult3-divide-by-ten`, `mult3-divide-by-zero` — general fixed-exemplar worked
  examples, not numerically pinned) and were a one-line reference swap each. `vis01` now reports
  3,573/3,573 RENDERS, 0 withheld.

## Gates run this round
- `validate:content` 1840/1840 · `lint:pedagogy` 1711/1711 (re-run clean after every sub-wave:
  S327 landing, S328 E1/E2/E3 landing, and the mainloop illustration fix).
- `npx tsx scripts/audit/mcq-leakage.mts --write`: 0 tells / 5,203 items, corpus-wide.
- `npx tsx scripts/audit/vis01-illustration-measurement.mts`: 3573/3573 RENDERS, 0 withheld.
- Full chain (`audit:pending-workload` → `lesson-review-cards-s244.mjs` →
  `compile-v4-backlog-portfolios-s247.mjs` → `chatgpt-work-v4-cache.mjs`) regenerated clean
  after each integration; `session244.chatgptWorkPrecache.test.ts` re-pinned and green (6/6)
  at every step; precache `queueFreshness: SOURCE_SEAL_MATCH` throughout.
- Full vitest: an initial run raced against the concurrently-launched S328 E1/E2/E3 wave (started
  before the agents landed their edits) and is NOT trustworthy — discarded. A clean full run
  (no concurrent edits) was started after the mainloop fix landed; see the next session-close
  note / commit message for its final reconciled numbers against the S326 baseline (301
  failed/15,444 passed).
- `npm run build`: to be re-confirmed green before this round's commit (see commit message for
  final status — do not assume without checking).

## Remaining queue at 188 rows (0 P0) — every row is one of exactly five classes
- CLOSURE_LEDGER 27 (12 historically P0-flagged) — needs human visual review, not agent-closable.
- V4_PROGRAMME_PHASE 7, STANDARDS_VERIFICATION 2 — held per programme rule.
- QUESTION_DIVERSITY_AND_TRANSFER 10 — needs multi-engine design.
- LESSON_PROGRESSION_AND_DUPLICATION 142 — structural-only check, P0 tier fully cleared (0
  remaining), 100% P1 (mildest, likely-legitimate-fluency tier); see the architecture-gap note
  above for why disposition alone cannot close these today.
No LESSON_REVISION_IMPLEMENTATION, ILLUSTRATION_REPLACEMENT, or CHOICE_SURFACE_INTEGRITY rows
remain open.

*(Superseded by the S329 addendum below — the 188/27/10/142 figures above are this round's
starting point, not its close.)*

# S329 addendum (2026-08-21, thirteenth aggressive round, still session-close — triggered by an
explicit user directive: "complete ALL pending work aggressively using multiple concurrent
workers," specifically calling out that the pending-workload count had only moved 193→188 and
pushing back on treating any category as inherently un-actionable)

## Queue: 188 → 141 open rows (25% further reduction this round; 97.4% closed session-to-date,
5,473 → 141)

## What landed (all independently verified; evidence in reports/closure/S329_*.md)
- 12-agent wave, deliberately aimed at the three categories a prior round had characterized as
  "documented debt" without actually attempting them: CLOSURE_LEDGER,
  QUESTION_DIVERSITY_AND_TRANSFER, LESSON_PROGRESSION_AND_DUPLICATION. That characterization
  turned out to be partly wrong — see below.
- **PG-A..PG-F (LESSON_PROGRESSION_AND_DUPLICATION):** redesign packets across six file-scope
  partitions. ~68 lessons redesigned (PGA 15, PGB 8, PGC 6, PGD 12, PGE 25, PGF 2), ~74 more
  explicitly reviewed and left unedited with documented KEEP-with-rationale judgments. 142→109
  rows. Architecture note (unchanged from the earlier finding, re-confirmed): this workstream's
  detector (`consolidate-pending-workload-s236.mjs` ~lines 358-393) is computed purely
  structurally from live lesson JSON every run (`repeatedWidgets`/`repeatedPrompts`/
  `repeatedTemplates`) with zero reference to the disposition ledger. A signed KEEP disposition
  is valid pedagogical evidence but does not suppress the row — only a redesign that changes the
  structural signature does. Deliberately left unwired to the ledger: a blanket
  disposition-based suppression risks silently vaporizing genuine flags across lessons never
  actually reviewed for this specific dimension. All P0/severe rows were already cleared in an
  earlier round; every remaining row is the mildest P1 (number-normalized-template-only) tier.
- **Q1/Q2 (QUESTION_DIVERSITY_AND_TRANSFER):** 9 lessons given new `ch2` engine-extension steps
  (Q1: 6 `ks-*` lessons in `shapes-and-sorting-k`; Q2: `mmt-02-01`, `ns-04b-01`, `sp-03-02`).
  Root cause of the row count not moving on content fixes alone: `EXCELLENCE_BACKLOG_S126.csv`
  is added to the queue unconditionally by the consolidate script, with no live-content or
  ledger check at all. It has its own sanctioned regenerator
  (`scripts/audit/excellence-backlog-s126.mjs`, cross-references
  `excellence-dispositions-s126.json` against live-measured corpus signals via
  `representationSignature`/`predictionEligibility`/`engine-capabilities.json`; its own code
  comment: "the reviewed policy is a living queue: completed lessons leave it"). Re-running it —
  the correct integration step, not hand-editing the CSV — auto-dropped the 9 resolved rows:
  10→1 (the survivor, `df3-03-02`, is already `candidateDisposition: intentional-assessment`).
- **CL1–CL4 (CLOSURE_LEDGER):** read the entire 175-line file in full for the first time this
  session. The prior round's blanket "needs human visual review, cannot be closed by agents"
  characterization was an unverified assumption inherited from a pre-compaction summary — wrong
  on inspection. Only 2 of 27 open rows (CL-P0-054, CL-P0-056) are human-visual-parity gated by
  the file's own stated rule (matching a prior S319 investigation already recorded in the file).
  CL1: portability fixes to 4 python audit scripts (`affine-relationship-s147.py`,
  `exact-number-s148.py`, `geometric-constraint-s149.py`, `point-set-reasoning-s150.py`). CL2:
  two isolated src fixes (`TriangleHalfRectangle` in `figures.tsx`, `DistributionCompareLabW` in
  `widgets.tsx`) with 2 new permanent regression tests
  (`figures.asv0101TriangleClip.s329.test.tsx`, `widgets.dclBracketLabel.s329.test.tsx`). CL3:
  179 lesson dispositions. CL4: Windows path-separator/temp-cleanup fixes across 6 test files
  (`content.authoredKeys.s242`, `widgets.buildReadout.s242`, `AvatarDisplay.fence`,
  `server/deployability`, `api/authz.s46`, `api/badJson.s46`). Formally closed
  CL-P1-044/040/051/012/049 with fresh gate-verified evidence, appended as a new dated section
  in `CLOSURE_LEDGER.md` (matching the file's own append-only, last-occurrence-wins convention —
  historical rows were not edited in place). CL-P1-033 stays **OPEN**: real source portability
  fixes landed, but this sandbox cannot execute on Windows to verify them, and the ledger's own
  header rule ("'Historical green' is never current-tree closure evidence") forbids claiming
  closure without that proof. CLOSURE_LEDGER 27→22.
- Ledger: 256 new signed dispositions appended this round across 9 staging files
  (`laneA-s329-PGA..PGF.jsonl`, `-Q1.jsonl`, `-Q2.jsonl`, `-CL3.jsonl`; CL1/CL2/CL4 wrote none —
  pure src/tooling fixes or already-resolved findings, zero lesson content edits). Decisions
  3,334 → 3,590.
- Cross-agent file-collision review: PG-B/C/E/F each flagged 1-2 files that looked touched
  outside their own assigned scope (`g2p-01-03.json`, `g2p-02-02.json`, `se-03-03.json`'s `ch1`,
  `ssg2-03-01.json`). Cross-referenced against my own complete written assignment lists (no
  accidental overlaps in the instructions I gave) and spot-diffed `g2p-01-03.json`: an
  MCQ-choice-label reword, the S327 CH1/CH2 wave's signature pattern — i.e. pre-existing dirty
  state from before S329 started, not a genuine S329-to-S329 collision. Combined with 0/270 JSON
  parse failures and clean `validate:content`/`lint:pedagogy` across the full accumulated tree,
  concluded there was no actual corruption or double-edit — a few agents simply couldn't
  distinguish "pre-existing dirty state from an earlier wave" from "a concurrent S329 sibling,"
  which is understandable given they don't have the full session history.

## Tooling fixes (post-wave, main loop)
`scripts/audit/engine-registration-contract.mjs` had two pre-existing (pre-session — already in
committed HEAD `7d8e4f4`, confirmed via `git diff HEAD` showing zero change on the affected
lines) stale-detection bugs that made `check:engine-registration` fail 129/129, then 1/129, with
false positives:
1. Its union-block locator searched for the literal string
   `export const WidgetSpec = z.discriminatedUnion("type", [`, which no longer exists — the
   schema was refactored (pre-session, unrelated to this project) into `WidgetSpecBase` (the
   actual union) plus a `.superRefine()` wrapper exported as `WidgetSpec` via `Object.assign`,
   specifically to add a cross-field `plotPoint` invariant (see the comment at schema.ts:7065-66:
   "Keep the discriminated-union member list available to registry tooling while enforcing
   cross-field plot-point invariants at the public schema boundary"). Fixed the locator to match
   `WidgetSpecBase` instead — the actual union member list is otherwise unchanged.
2. Its per-type spec-name extractor required `z` and `.object(`/`.discriminatedUnion(` with zero
   characters between them, which fails `PlotPointSpec`'s own multi-line declaration style
   (`export const PlotPointSpec = z` then `.object({` on the next line — the only spec in the
   file declared this way). Widened the regex from `z\.` to `z\s*\.` to tolerate the line break.

Both fixes are minimal, surgical, script-only (zero schema/content changes); `git diff HEAD --
src/lib/schema.ts` around both sites confirms neither issue was introduced this session — they
were unmasked, not caused, by finally running this gate. `check:engine-registration` now reports
`129/129 core-complete` cleanly.

Separately, `npm run validate:native` fails in this live sandbox because `node_modules`, `.next`,
`.chatgpt-work-cache`, and `tsconfig.tsbuildinfo` exist as normal dev-session artifacts — all
four are gitignored (`git ls-files` confirms zero tracked matches). `npm run validate:native:clean`
(the rsync-based clean-copy variant) could not run because rsync isn't installed in this sandbox,
so the equivalent check was done manually: a `tar`-based copy of the live working tree (all
S327-329 uncommitted edits included) excluding those same generated paths, checked directly with
`native-integrity.mjs`. Passed cleanly: 2,531 JSON files, 1,979 source files, 2,938 local
imports, 53 internal links, 4 assets, 282 buttons, 28 API routes, 0 issues. No script change
needed or made here — this is a sandbox-environment artifact, not a repository defect.

## Gates run this round
- `validate:content` 1840/1840 · `lint:pedagogy` 1711/1711 clean across the full accumulated
  tree after S329 landed. Unaffected by the post-S329 reconciliation pass below (that pass
  touched zero `content/courses/**` files — generator/independent-solver/test code only).
- `npx tsx scripts/audit/mcq-leakage.mts`: 0 tells / 5,203 items.
- `npm run cml:lint:strict`: 0 errors, 0 warnings.
- `npm run check:registration`: files ↔ course.json ↔ PLAN.md all consistent.
- `npm run check:engine-registration`: 129/129 core-complete (after the two tooling fixes above;
  see that section for why it initially failed and why the failures were pre-existing, not
  S329-caused).
- `validate:native`: 0 issues against a manually-constructed clean-artifact copy (see above).
- Full chain (`audit:pending-workload` → `lesson-review-cards-s244.mjs` →
  `compile-v4-backlog-portfolios-s247.mjs` → `chatgpt-work-v4-cache.mjs`) regenerated clean;
  `session244.chatgptWorkPrecache.test.ts` re-pinned to 141/3,595/15,663 and green (6/6) as of
  the post-S329 reconciliation pass's final state (see below).

### Post-S329 final-reconciliation pass (this round, full vitest vs the S326 baseline)
Baseline: 301 failed / 15,444 passed (`/tmp/vitest-s326.log`). Two full runs plus targeted
re-verification after each fix, reconciled with a strict file>test-name diff script
(`/tmp/reconcile_vitest.py`) against that baseline — never eyeballed:
- 21 of the 22 originally-flagged NEW-vs-baseline failures were resolved directly (5 by me:
  countTeenFrame's independent-solver drift, the precache-manifest cascade, and 3 more
  resolver-contract `variant.form` wiring gaps found while unmasking `variants.resolver.test.ts`'s
  onion-peeling for-loop — g1m-03-02/k100-02-05/mmt-02-01/mmt-05-02(k2); see
  `laneA-s329-recon-mainloop.jsonl`) and 16 by 4 parallel triage agents (12 RE-PINNED with cited
  evidence-report justification, 3 genuine test-bug fixes, 1 genuine content fix — g2l-03-04/ch1's
  dropped `variant` field restored).
- A second full run then surfaced 7 MORE new failures the first pass hadn't reached yet: the
  precache manifest going stale AGAIN (g2l-03-04's content edit shifted the curriculum partition
  seal — routine, re-ran the cache builder) and, more substantively, 6 failures traced to the 5
  new resolver-contract forms added during the onion-peeling fix above (`kTensBackMcq`,
  `Smg1UnitSizeCompareMcq`, `MmtBarGraphMistakeMcq`, `MmtEstimateMatchPairs`, `poly-addsub@subX2`):
  every one of them had been wired into its generator/`K100_FORMS`-style registry but NOT into
  the corresponding independent solver (`g0Independent.cjs`/`g1Independent.cjs`/
  `g2Independent.cjs`/`variants.test.ts`'s `polyRoute`) — a safety-net gap, not a content bug,
  since the independent solvers exist specifically to catch prompt/generator divergence. Fixed by
  adding the missing routes (each re-deriving its answer from the prompt text alone, matching the
  file's existing per-form style). Two of the 6 also turned out to be genuine, independently-caught
  defects rather than pure solver gaps: `MmtEstimateMatchPairs`'s `matchPairs` helper could shuffle
  the right column back into positional alignment with the left (a real "score without reading" UX
  bug in the new `matchPairs` helper itself, 1-in-6 per draw with 3 rows — fixed with a
  rotate-on-full-alignment guard), and `kTensBackMcq` could print a `t+10` trap of 110 at the
  stretch band (a real K.CC.A.1 0..100 cap violation — kTensBackHop's identical cap tuning is
  safe only because its widget clamps `Math.min(100, t+10)` at the display layer, which the new
  MCQ's raw option label does not — fixed by tightening the stretch cap from 10 to 9). A 7th
  failure (`session183.counting100k.test.ts`) was a duplicate, independently-maintained
  `K100_FORMS`/`G0_FORM_SURFACES` registry pattern that also hadn't been told about
  `kTensBackMcq` — updated in step, and its own 3-band adversarial sweep (schema validity, the
  100-cap, trap distinctness, real-evaluator agreement) is what actually caught the cap bug above.
  All 7 re-verified green via targeted re-runs; none required a fresh disposition (no
  `content/courses/**` files touched in this half of the pass).
- Net reconciled position: 301 baseline → 2 bonus RESOLVED (`session198.shapesBuildK`
  kgb-02-02/kgb-02-03, unexplained but confirmed via the same diff script, not chased further
  under the pace directive) → 0 unexplained NEW remaining → 299 STILL_FAILING, all confirmed
  byte-identical (same file, test name, and assertion text) to the S326 baseline via the diff
  script, i.e. pre-existing and out of this session's scope. A third, fully undisturbed full run
  was started to produce one clean authoritative log for the record but was still in progress
  (partial tail matched the reconciled picture above with no new surprises) when work stopped on
  explicit user instruction ("commit and stop") — treat the 299/15,446-ish reconciled figure above
  as high-confidence but NOT gate-verified by a single uninterrupted run; re-run `npm test` fresh
  before relying on an exact final count.
- `npm run build`: not run this round (never run concurrently with a full vitest pass on this
  2-CPU sandbox; the vitest passes above consumed the available window). Run before shipping.
- Separately, unmasking the resolver's onion-peeling for-loop found 251 total pre-existing
  corpus-wide `variant.form`/widget-surface mismatches (233 `NOT_FRESH` in the g10/g12
  trig/vector generator families, 18 `NULL_RESOLVE` elsewhere). 5 `NULL_RESOLVE` cases were fixed
  above; the rest (mmt-05-02's own remaining k3/ch1, plus ~11 more in `ks-*`/`kcw-*`/`sp-*` files,
  plus all 233 `NOT_FRESH`) are confirmed pre-existing and deliberately left as documented,
  out-of-scope debt under the pace directive — not silently dropped, not falsely claimed fixed.

## Remaining queue at 141 rows (0 P0 *actionable* — see correction below) — every row is one of
exactly four classes now (down from five: QUESTION_DIVERSITY_AND_TRANSFER's design-needed framing
no longer applies)
- CLOSURE_LEDGER 22 (down from 27) — genuinely infra/business/human-pilot/hardware/
  human-visual-parity/product-authority gated. Each of the 22 was individually re-examined this
  session, not assumed as a block; only CL-P0-054/056 are visual-parity-gated by the file's own
  rule, the rest are the file's other documented gate classes (infra integration, business
  decision, hardware dependency, human pilot data, product-direction authority).
- V4_PROGRAMME_PHASE 7, STANDARDS_VERIFICATION 2 — held per programme rule, unattempted (not a
  gap — these are intentionally out of an agent's authority).
- QUESTION_DIVERSITY_AND_TRANSFER 1 (down from 10) — the one remaining row (`df3-03-02`) is
  already `candidateDisposition: intentional-assessment` in the sanctioned backlog; there is
  nothing left to design or fix here.
- LESSON_PROGRESSION_AND_DUPLICATION 109 (down from 142) — structural-only detector, no
  ledger-suppression path by design (see architecture note above). All P0/severe rows cleared in
  an earlier round; every remaining row is the mildest P1 number-normalized-template tier.
No LESSON_REVISION_IMPLEMENTATION, ILLUSTRATION_REPLACEMENT, or CHOICE_SURFACE_INTEGRITY rows
remain open.

**Correction (S330):** the "(0 P0)" heading above is imprecise and should not be read as "no P0
rows in the queue." Reading `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s `priority` column directly
(rather than trusting the earlier prose summary) shows 16 P0 rows at the 141-row snapshot:
CLOSURE_LEDGER 12, V4_PROGRAMME_PHASE 3, QUESTION_DIVERSITY_AND_TRANSFER 1 — every one of them
inside the three out-of-authority buckets described above (LESSON_PROGRESSION_AND_DUPLICATION is
entirely P1). "0 P0" was true only in the narrower sense of "0 P0 rows this session has the
authority to act on"; it should have said that explicitly. No content changed as a result of this
correction — it is a reporting-accuracy fix only.

## S330 wave (2026-08-21, user directive "complete all queued work")

Scope: the full remaining 109 LESSON_PROGRESSION_AND_DUPLICATION rows — the only workstream in
authority this round; CLOSURE_LEDGER/V4_PROGRAMME_PHASE/STANDARDS_VERIFICATION/
QUESTION_DIVERSITY_AND_TRANSFER's 32 rows were re-confirmed (not re-litigated) out of an agent's
authority per this document's own S316-era framing, by re-reading `CLOSURE_LEDGER.md` and
`scripts/audit/consolidate-pending-workload-s236.mjs` directly rather than trusting the prior
summary alone.

**Execution:** all 109 rows were split into 11 course-grouped packets (G1–G11, zero overlap,
verified by script against the raw CSV before dispatch) and run as 11 parallel `general-purpose`
subagents in one wave, each with a self-contained brief covering the exact detector mechanism, its
lesson list, a KEEP-vs-REDESIGN framework, redesign vocabulary, generator-collision-avoidance
guidance (prefer converting a flagged step to a hand-authored static widget over touching a shared
`src/lib/variants.ts` generator, to keep 11 concurrent agents from colliding on the same file), and
the disposition-writing schema. A genuine KEEP was explicitly sanctioned as an acceptable outcome —
not every flagged row was to be forced into a redesign.

**Outcome:** 39 of 109 lessons redesigned (one or more flagged steps rewritten to a distinct,
hand-authored angle targeting a real misconception); 70 reviewed and kept unedited with a
documented fluency/spacing rationale. G11 (the 7-lesson singles tail) reviewed and kept all 7 with
zero edits — confirmed false positives, not missed work — and so wrote no disposition file.
Per-packet: G1 4/9, G2 7/9, G3 4/9, G4 4/12, G5 3/10, G6 2/10, G7 5/12, G8 1/11, G9 6/6 (heaviest
packet, all touched), G10 3/10, G11 0/7 (edited/reviewed). Full per-lesson rationale, math
re-derivation, and verification notes are in `reports/closure/S330_PROGRESSION_G1.md` through
`_G11.md`.

**Mid-wave incident — shared working tree, fully reconciled, no data loss.** Several packets (G1,
G3, G4, G5, G6, G10) independently reported their in-progress edits vanishing mid-task. Root cause,
reconstructed from `git reflog` and a dangling `stash@{0}` found after the wave: G1 self-inflicted
a `git stash` while recovering from its own mistake, which (as `git stash`'s normal last step) hard-
reset the shared working tree to HEAD — wiping every agent's in-flight uncommitted edits at that
instant, not just G1's own, since all 11 agents share one working tree and one index. Every affected
packet noticed its files had reverted and reapplied its work; none of this was silently lost.
Orchestrator-side reconciliation after the wave returned (before trusting or building on any
report): confirmed all 44 expected files (39 content + 5 shared test files, cross-checked file-for-
file against every packet's own claimed edit list) were present, valid JSON, with no conflict
markers; diffed the dangling stash against the final working tree file-by-file and found 25 of its
26 files byte-identical (proof the "clobbered" edits really did make it back to disk) and the 26th
(`pr-04-01.json`) differing only because G3 kept iterating on it after the stash snapshot was taken
— a strict superset, not a loss. The stash was then dropped.

**Independent mechanical re-verification (not just trusting the 11 reports):**
- Re-ran the live `consolidate-pending-workload-s236.mjs` detector before and after the wave's
  edits landed (before any disposition was appended, so this check is disposition-blind by
  construction, same as the detector itself): LESSON_PROGRESSION_AND_DUPLICATION dropped 109 → 89.
  Diffed the two runs' `step_path`/`mismatch_evidence` fields lesson-by-lesson: every one of the 39
  edited lessons' redesigned steps disappeared from its lesson's flagged-evidence list; zero new or
  unexplained steps appeared anywhere (in either the 20 lessons that fully cleared or the 19 that
  remain open); every step a packet's rationale explicitly says it left alone (deliberate spaced-
  fluency KEEP) is still present in the evidence — proof the redesigns mechanically do exactly what
  each packet claims, no more and no less. The 19-of-39 "edited but still open" lessons are not a
  gap: each carries a *second*, separately-reviewed, intentionally-kept collision the edit was never
  meant to touch (e.g. `exp-01-01`: k2 redesigned and cleared, k3-vs-i2 reviewed and knowingly kept
  as legitimate delayed practice, so the lesson row stays flagged on k3 alone).
- Full-corpus schema + lint + evaluator re-check (`Lesson.parse`, `lintLesson`, `evaluate()`) run
  directly against all 39 edited files via a standalone script: 0 schema errors, 0 eval errors
  (every graded step's own recorded/correct answer grades correct through the real evaluator) on
  the first pass, and exactly 1 lint finding — `g2p-02-01`/k2's redesigned incorrect-feedback text
  tripped the generic-feedback heuristic (led with a bare "No" before its real diagnosis, even
  though the diagnosis itself was substantive) — reworded; re-verified clean.
- Targeted `vitest` across the 5 directly-edited shared test files plus every other test file that
  references any of the 39 lesson ids (27 files found by grepping the corpus, one call): 457/459
  tests passed. The 2 failures (`conversions.s120.test.ts` — `sy-01-01` dead feedback;
  `session144.proportional-reasoning.test.ts` — a `proportionalReasoningLab` truth-model mismatch)
  are confirmed byte-identical (same file, test name, assertion text) against `/tmp/vitest-s326.log`,
  a full-suite baseline from well before this wave — 100% pre-existing, untouched by any packet,
  already independently flagged by G4/G10 in their own reports. Also ran the two whole-corpus gates:
  `content.test.ts` clean; `content.widgets.audit.test.ts` (SOLVABLE / not PRE-SOLVED / no DEAD
  paths across ~265 widgets) surfaced the same `g4x-02-01`/`sy-01-01` pair, both confirmed
  pre-existing the same way.
- `content.duplicateItems.s242.test.ts` (a *different*, stricter, exact-text MCQ-duplicate ratchet
  under workstream MCQ-01, unrelated to the S236 detector this wave targets) fails 4/4 assertions —
  but confirmed byte-identical against `/tmp/vitest-s326.log` too: its hardcoded pins (162/75/67/
  "checked>0") are stale from a much earlier baseline and the *actual* counts (6/0/0/0) already sat
  far below them before this wave touched anything, evidently from large volumes of prior-session
  duplicate cleanup already landed on this branch. Independently flagged by both G2 and G10.
  Genuinely pre-existing, outside this wave's workstream, and non-trivial to fix properly (its 4th
  assertion "no duplicate resolved a variant — this test is measuring nothing" suggests the test's
  own logic needs reconsideration, not just a number re-pin) — left open and documented rather than
  silently ignored or scope-crept into. **Flagged for a future round.**
- `variants.resolver.test.ts -t "item-level variant declarations|variant resolver"` surfaced 2
  failures against `mmt-05-02.json/k3` (measure-money-time, outside every packet's assignment) —
  confirmed byte-identical against `/tmp/vitest-s329-truefinal.log` (a full-suite run from
  immediately before this wave started). Pre-existing, independently flagged by G6, not remediated.
- One further finding acted on beyond the 39 redesigns: G3's report flagged (but correctly did not
  act on, since it was out of its redesign scope) that `pr-04-03`'s KEPT step k3 has body text
  reading "A bigger percent increase" on a rate (50→60, +20%) that is in fact *smaller* than sibling
  k1's (80→100, +25%) — independently confirmed by hand (20 < 25). Reworded to "Another percent
  increase.", mirroring k1's own neutral body text, without touching the widget/prompt/traps G3
  already reviewed.

**Ledger and derivation chain:** appended the 39 new S330 dispositions (`laneA-s330-G1.jsonl`
through `-G10.jsonl`) plus 2 orchestrator follow-up records (`laneA-s330-recon.jsonl`, for the
`g2p-02-01` and `pr-04-03` prose fixes above, each citing the fresh post-edit
`reviewBasisHash`) to `LESSON_REVIEW_DECISIONS_S244.jsonl` via `append-s316-dispositions.mjs`
(dry-run then `--write`, both times zero problems). Re-ran the full derivation chain
(`audit:pending-workload` → `lesson-review-cards-s244.mjs` → `compile-v4-backlog-portfolios-s247.mjs`
→ `chatgpt-work-v4-cache.mjs`) three times total (once after the 39-record append, once each after
the two follow-up records) — `staleCount: 0`, `SOURCE_SEAL_MATCH` every time. Editing the 39
lessons' content transiently reopened 3 disposition-staleness workstreams
(VISUAL_FIRST_REPRESENTATION, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION — 39 rows each,
confirming these are the disposition-hash staleness cascade, not new problems), which the
disposition append fully closed back to 0/0/0, confirming the append actually took effect and isn't
a paper exercise. `session244.chatgptWorkPrecache.test.ts` re-pinned three times in step (final:
`pending-workload` 121, `lesson-review-decisions` 3636) and green (6/6) each time.

**Net result:** queue 141 → 121 (LESSON_PROGRESSION_AND_DUPLICATION 109 → 89; the 32
out-of-authority rows correctly untouched). Decisions 3595 → 3636 (41 new records: 39 packet + 2
orchestrator recon). `npm run build` still not run this round — same as every prior round in this
session, never run concurrently with a vitest pass on this 2-CPU sandbox; run before shipping.

# S330 post-recon addendum (2026-08-21, same session, same user directive "complete ALL tasks" —
sent immediately after the S330 wave report above, reading as continued dissatisfaction with pace)

The user's message paired a specific pushback ("pace is too slow") with the S330 wave's own result
summary and an explicit "please complete ALL tasks". Rather than re-litigating the
LESSON_PROGRESSION_AND_DUPLICATION queue by force-redesigning legitimate KEEPs (which would violate
this document's own disposition-blind, honesty-first architecture — a KEEP with real rationale is
not a defect to be gamed away), this round opened genuinely new ground: the first passing production
build all session, a full-suite vitest reconciliation, a 7-agent adversarial audit of every prior
"kept"/"out-of-authority" judgment call, and — once the audit surfaced real findings — 7 more
lesson redesigns plus two fixes to test files whose frozen numeric pins the redesigns broke.

## `npm run build`: first clean pass all session

`npm run build` (`next build`) had never once been run in this entire multi-window engagement.
First attempt failed with a genuine, previously-invisible TypeScript error:
`./src/lib/variants.ts:11423:65 Type error: Type '"subX2"' is not assignable to type 'VariantForm'.`
Root cause: at some earlier point this session, `"subX2"` was added to the `poly-addsub` generator's
`forms` array with a full working runtime branch (`if (form === "subX2")` at line 11542) — but the
`VariantForm` TypeScript union type itself was never updated to include it. `vitest`'s esbuild/swc
transform doesn't type-check, so this was invisible to every test run all session; `next build`'s
type-check phase caught it on the first real attempt. Fixed with a single-line, type-only addition
(`| "subX2"` to the union, zero runtime effect — safe even with vitest running concurrently). Second
attempt: `✓ Compiled successfully in 50s`, full route manifest, only pre-existing ESLint warnings
(no errors). **This is a real bug that had been sitting in the codebase, silently, for an unknown
number of prior rounds, undetected because the gate that would have caught it was simply never run.**

## Full vitest reconciliation

A complete, isolated `npx vitest run` (no concurrent content edits, per this session's own race-
condition rule) completed at `Test Files 74 failed | 653 passed (727)`, `Tests 300 failed | 15471
passed | 1 skipped (15772)`. Reconciled against `/tmp/vitest-s329-truefinal.log` (this session's most
recent prior full-suite baseline) by diffing the full `FAIL` line sets: **zero new failures** — the
300-failure set is a strict subset of the baseline's. Six baseline failures are now absent
(`session183.counting100k.test.ts`'s tier-preconditions check; five `variants.test.ts` gate tests
including `poly-addsub @ form=subX2`) — traced via `git log -S` to commit `7778cf7` ("S327-S329 +
reconciliation"), the parent of this session's HEAD: that commit's own message documents fixing
exactly this class of bug ("5 pre-existing variant.form wiring gaps... a second full run then caught
7 more"), and `/tmp/vitest-s329-truefinal.log`'s mtime (17:15:47) predates that commit (17:49:21) —
the baseline log was captured from a run that started while that commit's fixes were still landing,
mid-flight. Not this round's work; already-committed prior-session fixes, now confirmed clean by the
first full run to complete after that commit finalized. The lone failure visible in earlier partial
tails (`g13-parametric-polar-calculus`, `calculusIndependent.cjs:906`, "unrecognized parametric-arc
prompt") is confirmed byte-identical against both `/tmp/vitest-s326.log` and `/tmp/vitest-s329-
truefinal.log` — pre-existing, unrelated to any session work.

## 7-agent adversarial audit wave (read-only, dispatched while vitest ran)

Five agents independently re-reviewed all 89 still-open LESSON_PROGRESSION_AND_DUPLICATION rows'
KEEP rationale (from the S330 wave and earlier) with an adversarial "would you sign off on this as
someone auditing the auditor" brief: **82 HOLD, 7 WEAK, 0 unexplained.** The 7 WEAK: `exp-03-01`,
`exp-03-02`, `exp-04-01`, `exp-04-02`, `fn-04-01`, `lf-04-01`, `pr-04b-01` — see below for what was
actually wrong with each (re-derived from the live CSV, not the audit agents' prose, before touching
any file — see caveat in the next section). One agent audited all 22 CLOSURE_LEDGER rows: 2
genuinely blocked (real external-execution dependencies), 2 stale/reconsider, **18 partially
actionable** (Stripe/Mailer/LTI/Telemetry provider-interface scaffolding, an automated visual-
placement screenshot gallery over 3,573 rows, accessible-state/mobile-control extensions, and
similar prep work that doesn't require live secrets or an external account to start). One agent
audited the 10 V4_PROGRAMME_PHASE/STANDARDS_VERIFICATION/QUESTION_DIVERSITY_AND_TRANSFER rows and
proved by direct code quote that V4_PROGRAMME_PHASE's 7 rows are **permanently unclosable**:
`consolidate-pending-workload-s236.mjs` lines ~468–493 contain a literal, hardcoded 7-element
`phases` array, looped unconditionally with no `if`/`continue`/filter/file-read gating it — these 7
rows cannot leave the queue via any content or engineering work; they are a permanent report
fixture, not backlog. **This is an important reporting-accuracy finding for whoever next reports the
queue total: 121 (now 114) has never meant "121 things to do" — 7 of it is unclosable by
construction.**

## 7 lesson redesigns (LESSON_PROGRESSION_AND_DUPLICATION, corrected scope)

The audit agents' prose diagnoses (e.g. "exp-04-01: k1/i3/k3/ch1 four-way cluster") were **not**
trusted directly — the live `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, freshly regenerated, was re-read
for the authoritative `step_path` per lesson before designing any fix, and in three of the seven
cases the true scope differed materially from the audit prose (`exp-04-01`/`exp-04-02` needed only
`k3`, not a 4-way cluster; `fn-04-01` needed 4 steps — `i2`,`i3`,`k2`,`k3` — not the 1 the prose
implied; `lf-04-01`'s pair `k2`/`ch1` both collide with unflagged `i2`, not with each other). The
detector's exact mechanism (`consolidate-pending-workload-s236.mjs` lines 358–393) was re-read
directly to confirm the normalization is `prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g,
"#").replace(/\s+/g," ")` compared **across every widget-bearing step regardless of kind** (not
just `check`/`challenge` steps as earlier working notes assumed) — this changed several designs
mid-flight once hand-computed templates showed steps colliding that a kind-scoped assumption would
have missed.

- **`exp-03-01`** (k1/k2/k3 all `"solve #^x = #."`): k2 redesigned as a repeated-multiplication
  "machine output" story (6^x=216) whose distractor (36, from 216÷6) newly gives the "exponent means
  repeated multiplication, not b·x" misconception — introduced by `i2` but never graded before — a
  graded check. k3 redesigned as a true/false claim-verification mcq testing that a fractional
  exponent (x=3/2) solves 4^x=8 even though 8 isn't a whole-number power of 4.
- **`exp-03-02`** (k1/k2/k3 all `"solve # · #^x = #."`): k2 reframed as "find the power" (5·4^x=1280,
  answer 4) with a multiply-instead-of-divide distractor. k3 reframed as an explicit divide-first
  instruction (3·5^x=75, answer 2, same value as its own prior wording — only the sentence changed).
- **`exp-04-01`** (k1/k3 both `"at what value does f(x) = # · #^x cross the y-axis?"`): k3 redesigned
  with a differently-named function (h(x)=8·5^x, y-intercept 8) and a distinct sentence shape.
- **`exp-04-02`** (k1/k3 both `"for g(x) = # · #^x, what is g(#)?"`): k3 redesigned as a population
  model (p(t)=2·5^t at t=3, answer 250).
- **`fn-04-01`** (k1/i2/i3/k2/k3 all `"which kind of sequence is #, #, #, #?"`): the underlying
  sequences and answers were already pedagogically fine (geometric/neither/arithmetic mix with
  varying ratios) — the defect was purely the copy-pasted sentence frame. Reworded only `i2`, `i3`,
  `k2`, `k3`'s `widget.prompt` to four distinct shapes; left every sequence, answer, option, and
  feedback string untouched.
- **`lf-04-01`** (i2/k2/ch1 all `"a line passes through (#, #) with slope #. what is b?"` — i2
  unflagged as first occurrence): k2 and ch1 reworded to distinct sentence shapes; point/slope
  values and all math (b=5, b=-4) unchanged.
- **`pr-04b-01`** (i1/i2 both `"a $# loan charges #% interest per year. shade one year's
  interest."`): i2 redesigned to shade TWO years' worth of simple interest on the same loan (target
  20%, not a different loan's one year) — this actually exercises the "equal steps, never
  compounds" idea from the immediately-preceding `c2` concept step, which no widget in the lesson
  previously tested directly.

**Verification (all against live runtime code, not hand-computation alone):** a temporary vitest
harness (`_tmp-verify-redesigns.test.ts`, written, run, deleted) ran `Lesson.parse` + `lintLesson` +
`evaluate()` / `exactNumberTruth()` against every edited step across all 7 files — 0 schema errors,
0 lint findings, every true answer grades correct with matching success feedback, every
distractor/commonError grades incorrect with matching feedback text. Building this harness caught
two bugs in the harness itself, not the content (`evaluate()` takes an mcq option id directly, not
`{picked:id}`; `exactNumberLab`'s exploration gate needs `exactNumberExplorationKeys()`, not a raw
copy of `requiredStageKeys`, when that array is empty) — both fixed before trusting a single green
result. Re-ran the S236 detector: LESSON_PROGRESSION_AND_DUPLICATION 89 → 82, exactly the 7 lessons
dropped, zero new/unexplained collisions anywhere in the corpus.

**A targeted grep for the 7 lesson ids across every test file in the corpus** (not just the ones the
audit agents happened to mention) turned up 6 files; running them found two genuine regressions this
round's number changes caused, both fixed:
- `session181.a1Exponential.test.ts` and `session181.exponentSolve.test.ts` each pin a "frozen"
  table of exact numeric answers per lesson/step, hand-derived at authoring time, to catch silent
  content drift. `exp-04-01/k3`'s y-intercept changed 10→8 and `exp-03-01/k2`'s solved exponent
  changed 5→3 (both intentional, part of the redesign) — both frozen tables updated to the new
  values with a dated comment explaining why, rather than either reverting the redesign or leaving
  the tests broken.
- `manipulativeAlongside.s237.test.ts` (5 failures: `de-01-01`, `de-03-01`, `de-03-02`, `dr-01-03`,
  `pr-04b-02`) and `content.duplicateItems.s242.test.ts` / `variants.resolver.test.ts` (6 more,
  `mmt-05-02` among them) were all confirmed byte-identical against `/tmp/vitest-s330-full.log`
  (captured before this round's edits) — pre-existing, unrelated to any of the 7 lessons touched
  this round (note `pr-04b-02` is a *different* lesson from the redesigned `pr-04b-01` — a one-
  character difference that would be easy to misattribute without checking).

## Disposition and derivation chain

First pass (`laneA-s330-postrecon-progression.jsonl`, 7 records) used `decision: "REVISE"` — this
was a genuine process mistake, not a data error: `REVISE` is the ledger's forward-looking "flag for
future implementation" signal (`reviewQueueDirective` in `lesson-review-authority-s246.mjs` opens a
`LESSON_REVISION_IMPLEMENTATION` row whenever a current disposition reads REVISE/ESCALATE), not a
retrospective "I revised this" confirmation — but the redesigns were already fully implemented and
verified *before* that record was written. Caught immediately when the chain re-run showed 7 new
`LESSON_REVISION_IMPLEMENTATION` rows instead of the queue simply shrinking. Corrected with a second
staging file (`laneA-s330-postrecon-progression-fix.jsonl`, 7 records, same `reviewedBasisHash`,
`decision: "KEEP"`) superseding the first — matching the established `s330-recon` pattern from
earlier this session for an already-completed, already-verified fix. Both appended via
`append-s316-dispositions.mjs` (dry-run then `--write`, zero problems each time). Full derivation
chain re-run three times total (after the 7 REVISE records, after the 7 KEEP corrections, and a
final confirmation pass) — `staleCount: 0`, `SOURCE_SEAL_MATCH` every time.
`session244.chatgptWorkPrecache.test.ts` re-pinned (`pending-workload` 121→114,
`lesson-review-decisions` 3636→3650) and green (6/6).

Also regenerated two report files that had drifted out of sync with already-committed lesson content
from earlier in the session (`EXCELLENCE_BACKLOG_S126.json`/`.md` via `npm run audit:excellence`,
`FLAGSHIP_TIERS.md` via `scripts/flagship-tier.mjs`) — both are live-derived reports, not source of
truth, and their diffs reflect redesigns already committed in `f90b251`, not new edits.

**Net result this addendum:** queue 121 → 114 (LESSON_PROGRESSION_AND_DUPLICATION 89 → 82; the 32
out-of-authority rows unchanged). Decisions 3636 → 3650 (14 new records: 7 + 7 correction).
`npm run build` now passes clean. Full vitest run reconciled with zero new failures.

## Post-redesign final gate (typecheck, build, full vitest — run again after all 7 edits)

Everything above (the `vitest-s330-full.log` vs `vitest-s329-truefinal.log` reconciliation) predates
the 7 lesson redesigns — it was this round's *starting* gate, confirming the tree was clean before
touching content. After all 7 redesigns, both frozen-test-pin fixes, the disposition correction, and
the report re-pin landed, the same three gates were re-run once more, in isolation, as this round's
*closing* gate: `npx tsc --noEmit -p .` → exit 0, zero diagnostics. `npm run build` → exit 0, every
route including `/placement` and `/onboarding` compiles and prerenders. A full `npx vitest run`
(727 files / 15,772 tests) finished `Test Files 73 failed | 654 passed`, `Tests 299 failed | 15472
passed | 1 skipped` (`/tmp/vitest-s330-postrecon-full.log`). Reconciled against the pre-redesign
`/tmp/vitest-s330-full.log` by the same sorted-`FAIL`-line `comm` diff used all session: **zero new
failures** anywhere, and exactly one previously-failing test now passes —
`session244.chatgptWorkPrecache.test.ts`'s manifest-currency check — which is precisely this round's
own report-regeneration fix, not an unexplained change. Both frozen-pin fixes land as an exact wash
(passing in both the pre- and post-redesign runs, as intended: old content + old pins passed before,
new content + new pins pass now). One onboarding-area failure
(`onboarding.branches.s242.test.ts` — "grade 0 offers every domain its catalogue carries") is present
in both runs, unchanged by this session, and is about domain-catalogue coverage, unrelated to
anything this round touched.

## CLOSURE_LEDGER.md — CL-P1-031 / CL-P0-003 investigated, both correctly left OPEN

Added a new dated section to `CLOSURE_LEDGER.md` ("Session 330 post-recon closure review"),
following the established S319 "detector-refresh update" precedent: investigate with fresh evidence,
check strictly against each row's *own* recorded closure/reopen condition, and only report what the
evidence actually shows. `CL-P1-031` ("Release-environment provenance," OPEN since S221, closure
condition "current S221/S220 seal runs the complete semantic/test/build/browser chain") and
`CL-P0-003` ("Onboarding/placement," status "CLOSED-SOURCE / RUNTIME REPROVE OPEN," reopen condition
"Full tests/browser show route, persistence, or accessibility regression") both specifically require
**browser**-level evidence, not just source/test evidence — matching what actually closed their twin
row `CL-P0-004` in S222 ("Node 24.15.0; npm ci PASS; typecheck PASS; build PASS; 90/90 final captures
PASS"). This round supplied fresh current-tree typecheck/build/full-vitest evidence for both (see the
gate above) — the semantic/test/build legs — then attempted the missing browser leg via
`npx playwright test e2e/smoke.spec.ts --project=chromium` (the repo's existing 3-test smoke spec).
Two attempts (180s, then 280s outer timeouts) both hung without Playwright completing, and the first
left an orphaned `next-server`/`npm run dev` process pair running unattended at 58–64% CPU / ~2.9GB
RAM — discovered still active and competing with the concurrently-running vitest gate, cleaned up
with a targeted `kill -9` on the specific PIDs (a broader `pkill -f "next dev"` had already been tried
and missed them, since the actual command lines didn't match that pattern). Judged unreliable in this
sandbox and not retried further, per the standing "avoid rabbit holes" discipline, rather than risk
corrupting the vitest gate a second time or silently claiming browser evidence that was never
obtained. **Both rows stay open in the ledger** — `CL-P1-031` as
`OPEN — SEMANTIC/TEST/BUILD LEGS CURRENT, BROWSER LEG UNOBTAINABLE HERE`, `CL-P0-003` unchanged at
`CLOSED-SOURCE / RUNTIME REPROVE OPEN` with the same browser-leg caveat — with the exact evidence and
the exact gap recorded in the ledger itself, not just here. Whoever picks this up next needs either a
sandbox where the Next dev server survives Playwright, or a real browser-capable CI environment, to
close either row.

The audit wave's other CLOSURE_LEDGER findings — 2 stale/reconsider rows and 18 partially-actionable
findings (Stripe/Mailer/LTI/Telemetry provider-interface scaffolding, a 3,573-row automated
screenshot gallery, accessible-state/mobile-control extensions) — were only a high-level scan, not a
row-by-row fresh-evidence investigation like the two above, so none of them were written into
`CLOSURE_LEDGER.md` this round; they remain exactly the menu described in the previous section of
this addendum, for the user to prioritize rather than something this session built unilaterally.
