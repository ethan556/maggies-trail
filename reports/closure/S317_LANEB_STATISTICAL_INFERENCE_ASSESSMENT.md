# S317 Lane B Independent Assessment — statistical-inference

Reviewer: Claude Cowork independent assessor (statistical-inference S317)
Reviewed: 2026-08-20T08:18:04.000Z
Scope: content/courses/statistical-inference/course.json and all 18 lessons in
content/courses/statistical-inference/lessons/. Read-only review; dispositions staged to
reports/closure/cowork-staging/laneB-statistical-inference-dispositions.jsonl.

## Course-level summary

18/18 lessons reviewed: **11 KEEP, 7 REVISE, 0 ESCALATE**.

Statistical Inference (Math, gradeLevel 11) covers, in course.json chapter order: how data is
made (design/bias/experiments), sampling variability, margin of error & confidence, the bell
curve (68-95-99.7, z-scores), significance testing, and judging claims in the wild. Note: the
chapters array places `ch6-the-bell` between `ch3-margin-of-error` and
`ch4-is-the-difference-real`, which looks out of numeric order by id but is the *correct*
pedagogical position — si-03-03's teaser explicitly promises "the bell curve, its 68-95-99.7
promise, and a ruler called z" next, and si-06-03's recap hands off to "Is the Difference Real?".
This is an id-naming artifact, not a sequencing defect, and every lesson's teaser/recap pair was
checked against its actual successor in the chapters array.

### Mathematical truth (recomputed independently, not trusted from authored feedback text)

Every margin-of-error, standard-error, confidence-interval, p-value, and randomization-test claim
in the course was recomputed from scratch, including two exhaustive enumerations of the shuffle-
test null distributions (Python, all C(10,5)=252 relabellings):

- **si-04-01** shuffleTest (groups summing to means 15 and 11, gap=4): exhaustive count gives
  exactly 6/252 ≈ 2.38% of relabellings reach |gap|≥4 — matches the lesson's "6 of the 252... about
  2%" exactly.
- **si-04-02** shuffleTest (gap=0.6): exhaustive count gives 198/252 ≈ 78.6% — matches "about 79%"
  exactly. The p-value numeric step (6/252≈2.4%) is internally consistent with si-04-01's count.
- **Standard error / margin of error**: SE=√(p(1−p)/n) checked at every worked value —
  p=0.5,n=100→5pts; p=0.6,n=600→2SE=4pts; p=0.5,n=1000→2SE≈3.2pts (the canonical ±3 on a
  1,000-poll); p=0.5,n=400→2.5pts; p=0.48,n=1000→2SE≈3.2pts. All match.
- **√n scaling**: 400→1600 (4×) halves ±5 to ±2.5; 250→2250 (9×) cuts ±6 to ±2; 100→400 (4×) halves
  ±10 to ±5; 400-person ±5 → 10,000-person ±1 (25×) — all consistent with wobble ∝ 1/√n.
- **si-06-01/02/03 figure numbers**: n=10/±31, n=40/±16, n=100/±10 in si-sampling-dist-sizes match
  2×√(0.6×0.4/n) to the point of being locked by a dedicated regression test
  (`src/lib/session272.statisticalInferenceFigureTruth.test.ts`), which this review independently
  re-derived rather than merely trusting.
- **68-95-99.7 arithmetic** (si-06-02): 1σ=68%, 2σ=95%, one tail beyond 2σ=2.5%, the 1σ-to-2σ band
  on one side=(95−68)/2=13.5%, beyond 3σ=100−99.7=0.3% — all correct and internally chained.
- **z-scores** (si-06-03): 115→z=1.5, 85→z=−1.5, z=2→x=120, and the cross-scale equivalence
  (130 with μ=100,σ=10) and (65 with μ=50,σ=5) both give z=3 — correct.
- **Base-rate reversal** (si-05-02): disease prevalence 1%, 95% sensitivity, 5% false-positive
  rate, N=10,000 → 95 true positives + 495 false positives = 590 total positives → P(disease |
  positive) = 95/590 ≈ 16%, versus the headline's 95% = P(positive | disease). Recomputed and
  correct.
- **Regression/extrapolation** (si-05-02 scatterFit): least-squares fit on the five (time, score)
  points gives slope≈0.78, intercept≈36.4 (lesson states "≈0.77x+37"); at x=600 the line predicts
  ≈504 (lesson states "near 500"). Matches.

### The CI-interpretation check (explicitly requested)

**si-03-02** is where the course teaches the meaning of "95% confidence," and it deliberately
teaches the **correct** frequentist interpretation: the concept text states plainly that the
parameter is fixed and the 95% is a property of the interval-*making method*, not a probability
attached to the parameter. The ciCapture widget (95% level, ~19/20 of 20 bars catching a fixed
dashed truth line) demonstrates this mechanically rather than just asserting it, and the figure
si-ci-meaning's SVG title and captions repeat the same framing. Crucially, the **distractors
correctly encode the misinterpretation**: k1's wrong option 2 reads "There is a 95% probability
the true value lies between 44% and 52%" with feedback explaining the reversal (parameter is
fixed, interval is random); the ch1 challenge asks students to identify this exact sentence as the
WRONG one among four candidates, three of which restate the correct long-run-frequency framing in
different words. This is exactly the defensible pattern the review brief asked to verify, and it
is applied consistently — si-05-02's base-rate reversal and si-04-02's p-value-is-not-P(no effect)
material are the same "don't swap the conditional" lesson recurring in new, non-duplicative
contexts rather than being re-taught identically.

### Visuals (visualDecision: SUFFICIENT across all 18 lessons)

All 18 figure ids referenced by the course (si-study-types, si-bias-not-fixed, si-confounding,
si-random-assignment, si-parameter-vs-statistic, si-sampling-dist-sizes, si-accuracy-precision,
si-margin-band, si-ci-meaning, si-poll-overlap, si-null-pile, si-effect-vs-significance,
si-claim-ladder, si-stack-the-wobbles, si-normal-curve, si-empirical-rule, si-split-the-tails,
si-z-score) are registered in `src/components/figureIds.ts` and mapped to real React components in
`src/components/figures.tsx` — none are unmapped placeholders. Spot-checked components
(SiStudyTypes, SiBiasNotFixedByN, SiCiMeaning, SiPollOverlap, SiNullPile) each carry an `<svg
role="img">` with a `<title>` describing the actual rendered relationship, and use redundant text
labels (e.g. "A: 48% ± 3", "the truth (never moves)") alongside colour rather than colour alone —
satisfying the non-colour-cue accessibility requirement. SiCiMeaning's per-bar miss/catch
computation was independently re-derived from its embedded offsets: exactly 1 of 20 bars (offset
+34) misses the truth line at half-width 30, matching the "19 of these 20" caption exactly. All 15
widget types used across the course (mcq, numeric, matchPairs, dragBucket, dragOrder,
estimateSlider, exactNumberLab, sampleSim, samplingBiasLab, scatterFit, shuffleTest, ciCapture,
distributionCompareLab, steppedReveal, treeDiagram) resolve to implemented components — no
orphaned widget types that would fail to render.

### Grade-language (gradeLanguageDecision: FIT across all 18 lessons)

Language is consistently grade-11-appropriate: precise use of "parameter," "statistic," "null
model," "conditional," and correct handling of causal-verb discipline (association vs cause)
throughout, without over-simplifying the CI or p-value semantics. si-06-01–03 (Bell Curve chapter)
run slightly more colloquial ("50-bell," contractions) than the rest of the course but remain
mathematically precise and age-appropriate; this was not treated as a defect.

### Cross-cutting finding: MCQ option label-length parity

Per the review brief's explicit instruction to check whether the correct option is systematically
the longest, this review measured every MCQ's option-label character lengths across all 18 lessons
(57 total MCQs, main-lesson steps + remedials):

| n options | count | correct = longest | chance baseline |
|---|---|---|---|
| 2 | 12 | 8 (67%) | 50% |
| 3 | 7 | 6 (86%) | 33% |
| 4 | 38 | 23 (61%) | 25% |

All three buckets sit well above chance, and above the comparison baseline measured in the
previously-KEEP-approved `logarithms` course (40% for its 4-option MCQs). This is a real,
course-wide pattern: correct answers tend to carry more explanatory/hedging text ("Right, but...",
"No — ... , because ...") than distractors, which is pedagogically natural but creates a
length-based answer-leak a test-savvy student could exploit independent of the seeded shuffle
(shuffling reorders options but cannot shorten or lengthen their text).

This was **not** used to blanket-REVISE every lesson — most individual instances have small
length gaps (a few characters) that are unlikely to be consciously exploitable, and several
lessons (si-02-01, si-03-02) show balanced or even inverted length distributions. It **was** used,
applying one consistent rule, to REVISE every lesson carrying at least one MCQ where the correct
option's label is ≥15 characters longer than the next-longest distractor (main-lesson-path items
and remedial-only items treated the same way, since both are content a real learner encounters):

- **Main-path, large gap**: si-02-02 (k4, 82 vs 61 chars, gap 21), si-04-03 (k1, 73 vs 55 chars,
  gap 18), si-05-01 (k2, 74 vs 50 chars, gap 24).
- **Remedial-only, large gap**: si-01-03 (rk1, 66 vs 18 chars, gap 48), si-04-02 (rk1, 76 vs 47
  chars, gap 29), si-05-01 (rk1, 45 vs 28 chars, gap 17, in addition to its main-path k2 gap),
  si-05-03 (rk1, 76 vs 38 chars, gap 38).

Every one of these seven lessons is otherwise mathematically and pedagogically sound (see the
per-lesson rationale in the staged NDJSON); the length-parity defect is the only thing separating
them from KEEP.

## Per-lesson verdicts

| Lesson | Decision | Visual | Grade Lang | One-line reason |
|---|---|---|---|---|
| si-01-01 How the Data Was Made | KEEP | SUFFICIENT | FIT | Design→claim ceiling correct; balanced options |
| si-01-02 Bias vs. Bigger Sample | **REVISE** | SUFFICIENT | FIT | Teaser previews the wrong next lesson |
| si-01-03 Designing an Experiment | **REVISE** | SUFFICIENT | FIT | Remedial rk1 large length gap (48 chars) |
| si-02-01 The Statistic Wobbles | KEEP | SUFFICIENT | FIT | Correct parameter/statistic distinction; 0/4 MCQs favor length |
| si-02-02 The Sampling Distribution | **REVISE** | SUFFICIENT | FIT | k4 main-path length gap (21 chars) |
| si-02-03 Putting a Number on the Wobble | KEEP | SUFFICIENT | FIT | SE arithmetic verified at every step |
| si-03-01 The Margin of Error | KEEP | SUFFICIENT | FIT | 2×SE build recomputed and correct |
| si-03-02 What "95% Confident" Counts | KEEP | SUFFICIENT | FIT | Correct CI interpretation taught; distractors encode the misconception |
| si-03-03 Reading a Poll | KEEP | SUFFICIENT | FIT | Band-overlap arithmetic verified |
| si-04-01 What Chance Alone Produces | KEEP | SUFFICIENT | FIT | Exhaustive 252-split enumeration confirms 6/252≈2% |
| si-04-02 How Unusual Is Unusual? | **REVISE** | SUFFICIENT | FIT | Remedial rk1 large length gap (29 chars) |
| si-04-03 What "Significant" Does Not Say | **REVISE** | SUFFICIENT | FIT | k1 main-path length gap (18 chars) |
| si-05-01 Reading a Study's Design | **REVISE** | SUFFICIENT | FIT | k2 main-path (24 chars) + rk1 (17 chars) length gaps |
| si-05-02 Right Number, Wrong Claim | KEEP | SUFFICIENT | FIT | Regression and base-rate reversal both recomputed and correct |
| si-05-03 The Statistics Detective | **REVISE** | SUFFICIENT | FIT | Remedial rk1 large length gap (38 chars) |
| si-06-01 The Bell That Wobble Builds | KEEP | SUFFICIENT | FIT | Correct chapter sequencing; die-histogram counterexample sound |
| si-06-02 68, 95, 99.7 | KEEP | SUFFICIENT | FIT | All empirical-rule arithmetic chained and correct |
| si-06-03 z: Distance in Wobbles | KEEP | SUFFICIENT | FIT | z-score arithmetic and cross-scale comparison correct |

## Implementation contracts for each REVISE

### si-01-02 — teaser mismatch
- **File**: `content/courses/statistical-inference/lessons/si-01-02.json`, step `r1.teaser`.
- **Current**: `"Next: watch a good estimate wobble, and measure exactly how much."` (this describes
  si-02-01's content).
- **Fix**: Replace with a teaser that previews the *actual* next lesson, si-01-03 (Designing an
  Experiment That Can Answer — control, random assignment, blinding, replication), e.g. something
  in the voice of `"Next: a sample can be perfectly unbiased and the experiment around it can
  still be broken. Four parts every experiment needs — and what happens when one is missing."`
  Do not change si-01-01's teaser (it already correctly points to si-01-02) or si-01-03's own
  teaser (it already correctly points to si-02-01).
- **Verification**: after the edit, si-01-02's teaser should reference control/assignment/
  blinding/replication content, not sampling variability/wobble content.

### si-02-02 — k4 label-length gap
- **File**: `content/courses/statistical-inference/lessons/si-02-02.json`, step `k4.widget.options`.
- **Current**: correct option o1 is 82 characters ("No — a bigger sample narrows the pile, but the
  pile is centred in the wrong place."); next-longest distractor o2 is 61 characters.
- **Fix**: Either shorten o1 by moving its second clause into the feedback field (feedback is not
  length-scored), or lengthen o3/o4 with an equivalent clause of misconception-specific reasoning
  so no option is a length outlier. Preserve the exact misconception content of each option;
  change only length balance.

### si-04-03 — k1 label-length gap
- **File**: `content/courses/statistical-inference/lessons/si-04-03.json`, step `k1.widget.options`.
- **Current**: correct option o1 is 73 characters ("Probably not — the effect is real but far too
  small to be worth the cost."); next-longest distractor o4 is 55 characters.
- **Fix**: Same approach as above — trim o1's justification clause into feedback, or add a
  comparably-detailed misconception clause to o3/o4.

### si-05-01 — k2 and rk1 label-length gaps
- **File**: `content/courses/statistical-inference/lessons/si-05-01.json`, steps `k2.widget.options`
  and `remedials[0].check.widget.options` (rk1).
- **Current**: k2 correct option is 74 chars vs 50-char next-longest distractor; rk1 correct
  option is 45 chars vs 28-char sole distractor.
- **Fix**: For k2, shorten the correct option's trailing clause or add matching detail to the
  weakest distractor. For rk1 (2-option remedial), lengthen the distractor
  ("Volunteering REDUCES stress.") with a short misconception clause (e.g. naming the specific
  wrong mechanism) so the two options are closer in length without changing which is correct.

### si-01-03, si-04-02, si-05-03 — remedial-only length gaps
- **Files**: `si-01-03.json` remedials[0].check (rk1), `si-04-02.json` remedials[0].check (rk1),
  `si-05-03.json` remedials[0].check (rk1).
- **Pattern**: each is a 2-option remedial MCQ where the correct option carries a full explanatory
  clause and the sole distractor is a short causal-verb or single-term phrase (gaps of 48, 29, and
  38 characters respectively).
- **Fix**: Lengthen each distractor with a short, specific misconception clause (mirroring the
  style already used in si-01-01's rk1 and si-03-02's rk1, which are balanced) rather than leaving
  it as a bare noun phrase. These are reached only after an incorrect first attempt on the main
  check, but they are still real learner-facing content and were held to the same ≥15-character
  threshold as main-path items.

## Notable findings (non-blocking)

- The chapter ordering in `course.json` (`ch1, ch2, ch3, ch6-the-bell, ch4, ch5`) is intentional
  and correctly matches every lesson's teaser/recap narrative — flagged only so a future editor
  does not "fix" it into id order and break the si-03-03 → si-06-01 → si-04-01 handoff.
- si-06-02 has no `remedials` block, unlike every other lesson in the course. Not flagged as
  REVISE: each of its five checks is a direct, single-rule application with immediate
  value-specific `commonErrors` feedback, so there is no under-supported concept left for a
  remedial to backstop.
- No mathematical, notational, or answer-leak-via-content errors were found anywhere in the
  course; every numeric widget's `answer`/`commonErrors` values were independently recomputed and
  matched.
