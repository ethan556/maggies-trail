# S324 Verify V2 — independent audit of S323 P4 + P6 fixes

Verifier: cowork-s324-V2-verifier. Method: independent recomputation (node one-offs, read-only on
content/src), contract re-read (S322_ASSESS_F3/F5/F8/F10, queue rows, S316 remedial standard),
fresh basisHash via scripts/session/print-review-basis.mjs. No npm/vitest/tsc.

Hash freshness: all 30 scoped lessons' current reviewBasisHash values match the hashes signed in
laneA-s323-P4.jsonl / laneA-s323-P6.jsonl (zero drift since the fixer signed).

## sampling-and-probability (P4 KEEP-no-edit audit)

Src fix independently confirmed: `src/components/widgets.tsx` DistributionCompareLabW defines
`orderedMeasureChoices` via `seededShuffle(spec.measureChoices, "distributionCompareLab:measure:" +
(seed ?? values.join("|")))` (mirrors the judge-mode canary) and the measure render maps
`orderedMeasureChoices`; `seededShuffle` is a real seeded Fisher–Yates (src/lib/prng.ts:30).
`src/lib/evaluate.ts` "distributionCompareLab" measure case grades strictly by membership of
`choice.value` in `measureChoices` plus `|value − answer| ≤ tolerance` — position-independent, so
the display shuffle is evaluator-safe. Judge mode grades by option id. Every measure step in all
six lessons was recomputed: gap/variability math correct, answer within tolerance, and EXACTLY ONE
measureChoice inside tolerance (no double-correct after shuffle).

- sp-02-01 — CLEAN. 7 measure steps recomputed: i1 12/4=3, k1 12/3=4, i2 0/2=0, i3 24/6=4,
  k2 15/5=3, k3 15/5=3 (signed distractor −3), ch1 24/8=3; all answers members of choices, one
  choice per step within tol. Progression repeats are distinct data per step as signed.
- sp-02-02 — CLEAN. Measure k1 30/5=6, i3 12/4=3, k3 24/6=4; judge steps i1,i2,k2,ch1 each have
  exactly one correct option, id-graded.
- sp-02-03 — CLEAN. Measure i1 12/4=3, i2 2/8=0.25 vs answer 0 tol 0.26 (only choice 0 within tol;
  2 and 8 outside), i3 36/9=4, k2 24/8=3, ch1 30/10=3; judge k1,k3 single-correct.
- sp-02b-01 — CLEAN. i2 gap 6, MAD 4, 6/4=1.5 = answer (tol 0.01), unique in [2,1.5,24,3]; other
  graded steps numeric/mcq (no positional channel).
- sp-02b-02 — CLEAN. i2 6/6=1 unique in [6,1,36,0]. CHOICE-0077 k3 rebalance verified on current
  bytes: labels exactly 41/41/41 chars ("The gap is too small to be convincing yet"* / "Group D is
  definitely higher than Group C" / "The two groups are proven to be identical"); justification
  lives only in feedback; single defensible answer (a).
- sp-02b-03 — CLEAN. i2 gap 1.2, MAD 0.4, =3 = answer (tol 0.01), unique in [1.2,3,0.48,0.8].

## unlike-fractions-g5 (P4)

Course-wide duplicate probe (all 14 lessons, steps + remedials, byte-identical on
JSON.stringify(widget) and digits→# normalized prompts): ZERO byte-identical widget duplicates
remain anywhere in the course — the three-way k1/k2/k2 dup and the g5u-03-01/k3 == g5u-03-03/k1
dup are both broken. Remaining digit-normalized template families are pre-existing and outside the
F10 contract (which names byte-identical dups + grammar only).

Parsed-content diff of all seven modified files vs git HEAD shows ONLY the intended paths (the one
rewritten widget per dup lesson; a single commonErrors feedback string per grammar lesson) — the
disclosed UTF-8 re-serialization of g5u-01-03 (no \uXXXX escapes remain in the 01-0x files) left
parsed content identical to intent.

- g5u-01-02 — CLEAN. k1 now "1/3 = ?/12" ans 4 ✓ (traps 1 = kept top, 9 = 12−3; feedbacks literally
  true); breaks the number-identical overlap with own k3.
- g5u-01-03 — CLEAN. k2 now "For the LCD 12: 1/6 = ?/12" ans 2 ✓ (traps 1, 6 = 12−6); ties to the
  lesson's LCD-12 storyline; re-serialization verified content-identical.
- g5u-01-04 — CLEAN. k2 now "3/4 = ?/12" ans 9 ✓ (traps 3 = kept top, 8 = 12−4); distinct from own
  k1/k3/ch1.
- g5u-02-02 — CLEAN. k2 (5 1/6 → 31/6, error 30) feedback now "dropped the 1 piece already in
  hand."; sibling grammatical "11 pieces"/"3 pieces" strings untouched; only that one path differs
  from HEAD.
- g5u-03-01 — CLEAN. k3 now the 7/8-benchmark item ans 1 ✓ (8/8−7/8=1/8; traps 7 counted-shaded,
  8 piece-size); byte-differs from g5u-03-03/k1; serves g5u-benchmark tag.
- g5u-03-03 — CLEAN. k1 jug story retained (byte-dup broken from the other side); k3 (1/6+3/6,
  error 3=1×3) feedback now "1 piece and 3 more make 4." ✓.
- g5u-03-04 — CLEAN. k2 same generator bug fixed identically; error value 3 on 1/6+3/6 ✓.

## bivariate-statistics (P4)

Parsed diff of all four files vs HEAD shows only the contracted paths (label strings; bv-05-02
tolerance) — nothing else moved.

- bv-02-01 — CLEAN. rem-bv0201-k (bv-fit-idea) recomputed lengths: correct 44 vs wrongs 43/45/43
  (0.98x, −1 gap); each reworded wrong label preserves its misconception and matches its authored
  feedback; single defensible answer.
- bv-02-02 — CLEAN. k2 recomputed: correct 34 vs wrongs 30/28/26 (1.13x, +4); the residuals
  terminology now lives only in the success feedback; one defensible answer.
- bv-03-02 — CLEAN. rem-bv0302-k recomputed: correct 45 vs wrongs 40/41/38 (1.10x, +4); wrong
  labels keep intercept/total/point-value misconceptions matching their feedbacks; diff is exactly
  the 3 label lines.
- bv-05-02 — CLEAN. Independent grid search of i1b's full authored board (m 0..7 step 0.5 ×
  b −7..3 step 0.5 = 315 cells, MSE per evaluate.ts's scatterFit formula): minimum MSE = 1.0 at
  (m=5, b=−5) — exactly the ŷ = 5x − 5 the successFeedback names; residuals +1,−1,−1,+1 as stated;
  next-best cells 1.25 > 1.05, so tolerance 1.05 admits EXACTLY the one intended cell. Continuous
  least-squares also lands at (5,−5), MSE 1.0. Only field changed: tolerance 0.5 → 1.05.

## arrays-even-odd-g2 (P6)

Course-wide probe (70 widgets, byte-identical + digits→# normalized prompts): every contracted
duplicate is broken — g2a-01-02/k2 vs g2a-01-01/k2, g2a-02-02/k2 vs g2a-02-01/k3, g2a-02-02/k3 vs
g2a-02-01/k2, g2a-03-02/k1 vs g2a-02-03/k3, g2a-03-02/k2 vs g2a-02-01/k1, g2a-03-03/k1 vs
g2a-03-01/ch1, g2a-03-03/k2 vs the 4r5 mcq family. Remaining byte-dups are exactly the disclosed
uncontracted remedial debt class (k1==rem0 copies; g2a-03-02/rem0==g2a-02-03/k3;
g2a-03-03/rem0==g2a-03-01/ch1). Solver claims independently confirmed against
src/lib/g2Independent.cjs (OddEvenOddEvenPairs n[0] parity; OddEvenMcq unique-even;
DoublesMcq first equal-addend '+' option; Add2DigitNumeric/DoublesNumeric first "a + b" in prompt).

- g2a-01-02 — CLEAN. k1 options 36*/15/39/41 (36 sole even, correct at o0, zero overlap with
  g2a-01-01/k3's 28/13/25/21; 36=18 pairs feedback true). k2 "Is 9 odd or even?" n=9 answer odd,
  9=4 pairs+1 ✓, evenFeedback 55 chars. Residual k1↔rem0 prompt echo is as disclosed (payloads
  differ; uncontracted).
- g2a-01-04 — CLEAN. ch1 un-doubling capstone: 6+6=12* at o0; traps 12+12=24 ✓, 5+7=12-but-unequal
  ✓, 3+3=6 ✓, all feedbacks literally true; template no longer collides with k1; adjacent steps
  carry no answer leak (k2 "8+8=16" two steps earlier; contract's "e.g. numeric" satisfied in mcq
  form with disclosed solver-block reasoning).
- g2a-02-02 — CLEAN. k2 16+8=24 ✓ (traps 32=fourth-row, 8=took-a-row); k3 3r7 BY ROWS = 7+7+7* with
  columns-view 3×7 ✓, 3+7 ✓, 8+8+8 ✓; distinct from 4r5/4r6/3r6/5r4 siblings.
- g2a-03-02 — CLEAN. k1 new 20-dot item (2×10=4×5=20 ✓), lengths 48* vs 51/50/45 — CHOICE-0033
  closed; stem normalizes differently from k3 — PROGRESSION closed. k2 8+8=16 ✓ (traps 10=8+2,
  24=three rows), pair distinct from 4+4/5+5/6+6 family. k3 lengths 33* vs 32/34/39 — CHOICE-0034
  closed; 2×9=3×6=18 ✓; feedbacks literally true.
- g2a-03-03 — CLEAN. k1 5 rows of 5: 4×5=20, 20+5=25 ✓ (traps 20 unplanted-row, 30); k2 5r4 BY
  ROWS = 4+4+4+4+4* (5 fours) with 4-columns-of-5 misconception ✓; both distinct course-wide.

## four-addends-g2 (P6)

Course-wide probe (56 widgets): the four-way "(17 + 3) + 25" k3 byte-dup is broken; g2n-01-01/k3
retains the original (KEEP as contracted); the three new k3s appear in no byte or normalized dup
group. Remaining byte-dups are the disclosed k1==rem0 class only.

- g2n-01-02 — CLEAN. k3 recomputed: 34+19+6+1 = (19+1)+(34+6) = 20+40 = 60 ✓; correct at o0, no
  variant on k3, lens 41/33/29/41, wrong feedbacks distinct and literally true.
- g2n-02-03 — CLEAN. k3: 16+9+4 = (16+4)+9 = 29 ✓; left-to-right walk 16,25,29 ✓; lens 33/37/32/33.
- g2n-03-02 — CLEAN. k3: 21+15+5 = 41 = 5+15+21 ✓; lens 25/25/33/40 (correct shortest); back-to-
  front check feedback starts 5+15 ✓.

## add-subtract-10-k (P6 KEEP-no-edit audit)

The signed rationale is accurate. S316_ADJUDICATION_REMEDIAL_STANDARD.md §2 rules decisively that
"koa-02-01…koa-02-05 pass R1/R2/R3 today… The course carries its own answer", and §8 confirms the
redispatch covered only the other 15 koa lessons. Current bytes re-verified against R1–R6:

- koa-02-01 — CLEAN. rem prompt "Put 5 counters… Slide 2 away" R1/R3 pass, R2 zero normalized
  clashes vs all widget steps; 5−2=3 ✓ traps {5,2} recompute from printed numbers, feedbacks 81/81
  chars and literally true; concept body states no digits (R6).
- koa-02-02 — CLEAN. "Draw 5 circles, cross out 3" 5−3=2 ✓ traps {3,5}; R1–R6 pass.
- koa-02-03 — CLEAN. "Set out 4 toy people, move 1 home" 4−1=3 ✓ traps {4,1}; R1–R6 pass.
- koa-02-04 — CLEAN. mcq "Four blocks out, one put away": unique correct 4−1=3; distractors 4+1=5
  (join misconception) and 4−1=4 (group-didn't-shrink) with literally-true feedback; R1–R6 pass.
- koa-02-05 — CLEAN. "Draw 6 balloons, cover 2" 6−2=4 ✓ traps {2,6}; R1–R6 pass.

All five carry hands-on manipulative directives (Put/Draw/Set out/Cover) — a different phrasing
family from the Koa* story generators (R4 via route change). The remedials[0].concept.body ==
c2.body twin in all five is the concept-side debt the standard's own §2 table and §6 log as
unsigned residual "for a human", correctly recorded-not-fixed by the fixer.

## Summary

- Verified clean: 30 / 30 scoped lessons.
- Findings (REVISE/ESCALATE): 0 — laneV-s324-V2.jsonl intentionally carries no records (findings-
  only lane; nothing to sign).
- Hash mismatches: 0 (all 30 current basis hashes equal the fixer-signed hashes).

