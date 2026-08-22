# S316 — Lane B Independent Assessment: `trig-graphs-inverses`

Independent read-only course assessment. Reviewer: Claude Cowork independent assessor
(trig-graphs-inverses S316). All 15 lessons read in full, alongside `course.json`, the
S301 choice-parity closure report, and the open rows of
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` naming this course. Dispositions are staged at
`reports/closure/cowork-staging/laneB-trig-graphs-inverses-dispositions.jsonl` (one
NDJSON row per lesson; this worker does not write the ledger itself).

## Method

For every lesson: recomputed every amplitude/period/phase-shift/midline claim, every
inverse-trig principal-value answer (checking domain/range restrictions), every
unit-circle coordinate and quadrant-sign claim, and every helper-triangle ratio, by hand
against the prompt, options/answer, feedback, and reveal text. Checked MCQ distractors
for parity (no length/specificity answer-leak), checked every trap's feedback for
truth-of-the-drawn-numbers, checked figures against `src/components/figures.tsx` for
registration, accessible `<title>`/`aria-label` presence, and (spot-checked) rendered-shape
correctness. Cross-referenced the open `LESSON_PROGRESSION_AND_DUPLICATION` and
`CHOICE_SURFACE_INTEGRITY` rows for this course and verified in source whether each was
still live or already repaired by S301.

## Decision counts

- **KEEP: 13**
- **REVISE: 2** (tg-04-01, tg-05-01)
- **ESCALATE: 0**

All 15 lessons: `visualDecision = SUFFICIENT`, `gradeLanguageDecision = APPROPRIATE`.

## REVISE list

| Lesson | One-phrase reason |
|---|---|
| tg-04-01 | Three "What is arcsin(N)?" steps (k2, k3, remedial) share one literal surface template — distinct jobs, needs phrasing diversity |
| tg-05-01 | k1 and k3 are a genuine near-duplicate: both Quadrant-II `arcsin(sin x)` reflection cases, same method and misconception, different numbers only |

## Per-lesson verdicts

### Chapter 1 — Phase Shift & the Full Sinusoid

- **tg-01-01 (Phase Shift) — KEEP.** All phase-shift arithmetic verified: `sin(x+π/3)`
  shifts left π/3; `sin(4x−π)` factors to π/4 right; `2sin(2x−π/3)` at `x=5π/12` evaluates
  to exactly 2; `sin(3x+π/2)` factors to π/6 left. `unitCircleExplore` targets match the
  stated peak locations.
- **tg-01-02 (The Full Sinusoid) — KEEP.** Min `=D−A=−2`; first peak of
  `3sin(2(x−π/4))+1` at `x=π/2`; `D=4` from extremes 7/1; `B=2π/6π≈0.33`, correctly
  rounded once per the prompt's explicit instruction. Four independent dial jobs, no
  overlap.
- **tg-01-03 (Graphing One Clean Period) — KEEP.** Five-point sequence for
  `2sin(2(x−π/6))−1` verified (trough at `11π/12`, height −3); negative-A flip verified
  (`−3sin x+5` gives 2 one quarter-period in); peak height `D+A=6` for
  `4sin(3(x−π/3))+2` verified.

### Chapter 2 — Cosine & Sinusoid Equivalence

- **tg-02-01 (Cosine's Graph) — KEEP.** `2cos x+3` trough (1, at `x=π`) and first midline
  crossing (`x=π/2`) verified; `3cos(2x)−1` trough (−4) verified; landmark-read challenge
  (trough value 3) verified. k2 is CHOICE-0259's target — its three options are already
  parallel-length restatements; the S301 repair is live, **not re-flagged**.
- **tg-02-02 (Cosine Is Shifted Sine) — KEEP.** Both cofunction identities verified
  (`cos x=sin(x+π/2)`, `sin x=cos(x−π/2)`); the buildExpression peak-anchored form
  `5cos(x−π/3)` verified; the `unitCircleExplore` ghost-formula pair has no trap-vs-answer
  collision at any θ, including the θ=0 edge case.
- **tg-02-03 (Reflections & Equivalent Rules) — KEEP.** Every half-period-flip claim
  verified (`sin(3π/2)=−1`, `sin(x+π)=−sin x`, `cos(x−π)=−cos x`, the `2sin(x+π/2)` vs
  `2cos(x+π)` audit giving 2 and −2, the `sin(x−π)` odd-one-out check). k3 is CHOICE-0260's
  target and is already repaired; not re-flagged. No PROGRESSION row remains open for
  this lesson in the current queue.

### Chapter 3 — The Tangent Graph

- **tg-03-01 (Tangent: the Wave That Isn't) — KEEP.** `tan(5π/4)=1`, tan's zeros at
  multiples of π, and the wall count in `(0,3π)` (3 walls: π/2, 3π/2, 5π/2) all verified.
  CML explanation options are mechanism-vs-appearance distinct with no answer-leak.
- **tg-03-02 (Exact Values & Life Near a Wall) — KEEP.** `tan(π/6)≈0.58`,
  `tan(1.55)≈+48` (recomputed via `sin(1.55)≈0.9998`, `cos(1.55)≈0.0208`),
  `tan(3π/4)=−1`, and the monotonic ordering `tan(1.0)<tan(1.3)<tan(1.5)` all verified.
- **tg-03-03 (Transforming Tangent) — KEEP.** `tan(2x)` wall at `x=π/4`; no-maximum
  property of `3tan x`; `3tan(2·π/8)=3`; slid wall of `tan(x−π/6)` at `2π/3` (n=3) — all
  verified. k2 is CHOICE-0261's target and is already repaired; not re-flagged.

### Chapter 4 — Inverse Trig, Formalized

- **tg-04-01 (Arcsine: a Rescued Inverse) — REVISE.** All arcsin values verified
  (`arcsin(1/2)=π/6` not `5π/6`; `arcsin(−1/2)=−π/6`; `arcsin(2)` undefined;
  `arcsin(1)=π/2`; `arcsin(0)=0`). k1/k3 (CHOICE-0262/0263) are already repaired; not
  re-flagged. **Open finding:** this is the lesson named by workload-queue row
  `PROGRESSION-tg-04-01` (`frequency 3`, location `k3`). k2 ("What is arcsin(−1/2)?"),
  k3 ("What is arcsin(2)?"), and the remedial ("What is arcsin(0)?") share one literal
  prompt template even though their instructional jobs differ (valid negative
  evaluation vs. an out-of-domain undefined check vs. a boundary identity). See
  implementation contract below.
- **tg-04-02 (Arccosine: a Different Branch) — KEEP.** Verified `cos(−π/3)=cos(π/3)=1/2`
  is a genuine collision (the domain-restriction guard is not deleting valid content);
  `arccos(−1/2)=2π/3`; `arctan(1)=π/4`; `arctan(x)→π/2` as `x→∞` without reaching it
  (`arctan(1000)≈1.5698<π/2`); `arccos(−1)=π≈3.14`. CHOICE-0264 (challenge) and
  CHOICE-0265 (k1) both already repaired; the challenge item correctly remains a
  challenge tier.
- **tg-04-03 (The Inverse Graphs & the y=x Mirror) — KEEP.** `arccos(1)=0`; arccos's
  descent π→0 over input −1→1; arctan's output fence (1.5 reachable, 2 is not); the
  `(0,π/2)`-descending graph correctly identified as arccos; the mirror point
  `(1,π/4)` for `(π/4,1)` on arctan. The remedial's third distractor correctly avoids a
  false claim about `(−1,−π/4)` (it IS on arctan, just not the mirror asked for) —
  careful, non-misleading feedback.

### Chapter 5 — Compositions & Solving

- **tg-05-01 (Round Trips & the arcsin(sin x) Trap) — REVISE.** All `arcsin(sin x)`
  round trips verified (`5π/6→π/6`, `0.4→0.4`, `3π/4→π/4`, `7π/6→−π/6`, `π→0`). **Open
  finding:** this is the lesson named by workload-queue row `PROGRESSION-tg-05-01`
  (location `k3 ch1`), and the finding is substantive, not just a shape-match false
  positive: k1 (`5π/6`) and k3 (`3π/4`) are both Quadrant-II inputs solved by the
  identical method and targeting the identical misconception (mistaking the original
  angle for the branch answer instead of computing `π−x`) — they differ only in which
  fraction of π is used. k2 (already-in-branch case), ch1 (Quadrant III, negative sine),
  and the remedial (the `sin=0` boundary at π) are each a distinct job and are not
  implicated. See implementation contract below.
- **tg-05-02 (Mixed Compositions & the Helper Triangle) — KEEP.** `cos(arcsin(3/5))=4/5`;
  `cos(arcsin(−3/5))=+4/5` (branch cosine always nonnegative); `tan(arccos(5/13))=12/5`
  via the 5-12-13 triple; `sin(arctan(3/4))=3/5` via the 3-4-5 triple — all verified.
  k2 is CHOICE-0266's target and is already repaired; not re-flagged. The `distanceGrid`
  widget's `wrongPointFeedback` numerically matches its named traps (34 = 5²+3² for the
  add-instead-of-subtract error; 2 = 5−3 for the unsquared-subtraction error).
- **tg-05-03 (Solving: One Answer from the Inverse, All from the Circle) — KEEP.** Every
  solution set verified: `sin x=1/2 → π/6,5π/6`; `cos x=−1/2 → 2π/3,4π/3` (sum
  `2π≈6.28`); `tan x=1` has 2 solutions on `[0,2π)`; `sin x=−1/2 → 7π/6,11π/6`;
  `2sin x−1=0` sum `π≈3.14`. k4 deliberately reuses k1's found solution set to test a
  distinct arithmetic job (summing) rather than re-deriving it — legitimate scaffolding,
  not duplication. No open PROGRESSION row for this lesson.

## Implementation contracts for the two REVISE items

Both contracts are phrasing-only: no answer, option ID, feedback claim, `conceptTag`,
figure, or `variant` declaration changes. Only the `prompt` (and, where natural, the
`body`) text of the named steps changes, to break the literal-template collision while
preserving every frozen field.

### tg-04-01 (PROGRESSION-tg-04-01)

- Steps k2, k3, and the remedial check all currently open with `"What is arcsin(N)?"`.
- Reword k2's prompt to foreground its actual job (evaluating a negative in-branch
  input), e.g. `"Evaluate arcsin(−1/2)."` or `"arcsin(−1/2) equals what angle?"` —
  keep `answer`/options/feedback untouched.
- Reword k3's prompt to foreground the domain-boundary job it actually tests, e.g.
  `"arcsin(2): what does the branch return?"` — keep untouched otherwise.
- Leave the remedial's `"What is arcsin(0)?"` as-is (or diversify last, lowest
  priority) since it sits on the remediation-only track and is not exposed to a learner
  in the same pass as k2/k3.
- Re-run `npx tsx scripts/measure/verify.mts` and any duplication/number-normalization
  scan used to populate `PROGRESSION-tg-04-01` to confirm the row closes.

### tg-05-01 (PROGRESSION-tg-05-01)

- k1 and k3 both test Quadrant-II `arcsin(sin x)` via the identical `π−x` reflection
  and the identical "kept the wrong angle" misconception.
- Recommended fix: replace k3's *case*, not just its number, with a job the lesson does
  not yet cover explicitly at the "check" tier — e.g. a Quadrant-IV negative-input case
  (parallel to ch1's Quadrant-III case, giving full quadrant coverage II/III/IV across
  k1/k3/ch1), or promote k3 to applying the general rule symbolically
  (`arcsin(sin(π−a))` for a stated `0<a<π/2`) rather than a second concrete Quadrant-II
  number.
- Whichever replacement case is chosen, keep the `mcq` widget shape, option count, and
  `variant` form (`trig-graphs-inverses__tg-composition-trap__mcq`) intact; only the
  `prompt`, `answer`/options, and feedback numbers change to match the new case, per the
  NON-NEGOTIABLE rule that every trap must be a real, guarded misconception with
  feedback true of the drawn numbers.
- Re-run the duplication scan to confirm `PROGRESSION-tg-05-01` closes without
  introducing a new collision against k1, k2, ch1, or the remedial.

## Notable findings (informational, not scoped for this worker to fix)

- **CHOICE-0259 through CHOICE-0266** (this course's eight S301 targets) were all
  checked in source and are already repaired — option-label spreads are well inside
  S301's 12-character bound at every location (tg-02-01/k2, tg-02-03/k3, tg-03-03/k2,
  tg-04-01/k1, tg-04-01/k3, tg-04-02/ch1, tg-04-02/k1, tg-05-02/k2). The pending-workload
  CSV snapshot listing these as `OPEN_STEM_OPTION_AND_VISUAL_REVIEW` is stale relative to
  source and should be regenerated (`npm run audit:pending-workload`) rather than acted
  on again.
- **CHOICE-0367 through CHOICE-0371** in the same queue point at
  `generator:g12-trig-graphs-inverses` / variant-form IDs (not lesson JSON) — these are
  the runtime MCQ-shuffle surface for the variant generator, a separate governed
  workstream (see the repo's variant-generation `CLAUDE.md`). Out of scope for this
  lesson-source disposition; flagged here only so the queue owner routes them correctly.
- **Figures.** All 29 `figure` IDs referenced across the 15 lessons resolve in
  `src/components/figureIds.ts` and have a rendering component in `figures.tsx`; every
  spot-checked SVG carries both a `<title>` and a descriptive `aria-label`, and uses
  non-colour cues (dashed asymptote lines, labeled dots, arrows) alongside colour. Two
  figures (`TgReadLandmarks`, `TgFivePoints`) carry an explicit code comment
  documenting a prior peak/trough-marker-vs-Bézier-control-point defect (S242/VIS-00)
  that has since been fixed — confirmed the markers now sit on the actual curve height,
  not the old control points.
- **Grade language.** Vocabulary (branch, quotient, restricted domain, one-to-one,
  asymptote, midline) is consistently precalculus-appropriate for the stated
  `gradeLevel: 12`; no simplification that would weaken the mathematics was found
  necessary or present.
