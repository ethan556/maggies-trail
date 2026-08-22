# S322 Assessment F6 — the-real-number-system, binomial-theorem, expected-value

Independent course assessor pass over three complete courses (21 lessons total): Grade 8
`the-real-number-system` (9 lessons), Precalculus `binomial-theorem` (6 lessons), Grade 11
`expected-value` (6 lessons). Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s322-F6-dispositions.jsonl`. Every disposition supersedes
any prior decision on these lesson IDs.

Method: read every lesson JSON in full; hand-recomputed every numeric/mcq/challenge answer against
its stated tolerance; cross-checked interactive-widget math against the prose so the rendered
visual is confirmed to carry the literal quantity discussed, not just a plausible-looking one
(`binomialAreaLab`'s `binomialExpand` in `src/lib/schema.ts` — independently unit-tested against
hand expansion in `src/lib/binomialAreaLab.s118.test.ts`; `treeDiagram`, `areaModel`/`countGrid`,
`probabilityArea`, `spinnerSim`, `distributionCompareLab`, `estimateSlider` in `src/lib/evaluate.ts`);
confirmed all figure components (`src/components/figures.tsx`) referenced by these lessons exist,
are registered, and render the exact numbers/labels the prose claims; ran the corpus-wide MCQ-identity
duplicate scan (`scripts/audit/lesson-review-authority-s246.mjs` via `buildDuplicateInventory`,
1701 lessons) — zero clusters touch any of these 21 lesson IDs; ran a raw option-length-ratio scan
scoped to these 21 lessons across every mcq/choices/predict widget, then re-checked every ratio
where the CORRECT option itself was the length outlier (not just an outlier distractor) against the
severity bar set by the prior S321 assessment (2.3×–7.7× with tightly-clustered distractors) — the
two remaining candidates (`bt-01-03/k3` at 1.93×, `ev-01-01/k3` at 2.12×, both 3-option mcqs) have
length differences fully explained by the correct answer's genuinely longer causal/nominal phrasing
and are well below the flagged severity bar, so neither is treated as a leak; confirmed `mcq` and
`predict` widgets both shuffle options via `seededShuffle` at render (`src/components/widgets.tsx`,
`src/components/LessonPlayer.tsx:116-118`) across every widget type used in these 21 lessons.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| the-real-number-system | 9 | 9 | 0 | 0 |
| binomial-theorem | 6 | 3 | 3 | 0 |
| expected-value | 6 | 6 | 0 | 0 |
| **Total** | **21** | **18** | **3** | **0** |

All 21 lessons: `visualDecision = REQUIRED` (every lesson's interactive widget — `quotientReasoningLab`,
`exactNumberLab`, `numberLinePlace`, `dragOrder`/`dragBucket`, `binomialAreaLab`, `treeDiagram`,
`areaModel`, `probabilityArea`, `spinnerSim`, `distributionCompareLab`, `estimateSlider` — is the
load-bearing mechanism for the concept, not decorative), `gradeLanguageDecision = FIT` (Grade 8 /
Precalculus / Grade 11 register throughout, no grade-inappropriate language found).

## REVISE list (one-phrase reasons)

1. **bt-01-03** (`Why Combinations Appear`) — step `i1`'s `treeDiagram` widget structurally computes
   `targetA × targetB` (3 × 2 = 6, drawn as 6 leaves and printed on screen) but the prompt/
   successFeedback claim a 3-stage 2³ = 8 model the widget cannot render.
2. **bt-02-02** (`Finding a Single Term`) — `c2` and `i1`'s predict reveal assert the C(n,k)=C(n,n−k)
   symmetry "sometimes" fails to forgive a wrong-exponent read for larger n (illustrated with a
   false "(a+b)⁸ gives 70 instead of 56" claim); this is mathematically impossible since the
   identity is unconditional, and `k2`'s commonError feedback for value 70 misattributes it to a
   mechanism that actually computes 56.
3. **bt-02-03** (`Binomials Meet Probability`) — same defect class as bt-01-03: step `i1`'s
   `treeDiagram` (4 × 2 = 8, drawn/printed) contradicts the prompt/successFeedback's claimed 4-stage
   2⁴ = 16 model; step `i2` in the same lesson already renders 2⁴ = 16 correctly via a `countGrid`
   `areaModel`, so the lesson holds two contradictory representations of the same quantity.

No mathematical, visual, duplication, or accessibility defects were found in the other 18 lessons;
every numeric answer, tolerance, commonError, figure, and widget-rendered quantity across all three
courses was independently hand-recomputed and confirmed correct.

## Implementation contract per REVISE

### bt-01-03 — `content/courses/binomial-theorem/lessons/bt-01-03.json`, step `i1`
- Current: `widget.type = "treeDiagram"`, `targetA: 3, targetB: 2, stage1Label: "Brackets",
  stage2Label: "Choices per bracket"`. `TreeDiagramSpec` (`src/lib/schema.ts`) is documented as "choose
  how many branches at each of TWO stages"; `TreeDiagramW` (`src/components/widgets.tsx`) always draws
  and prints `{a} × {b} = {leaves} outcomes` with `leaves = a * b`. With targetA=3, targetB=2 this is
  literally "3 × 2 = 6 outcomes" on screen, while `successFeedback` says "8 paths — and 2³ = 8".
- Fix: reframe the two stages so the widget's real a×b model legitimately equals 8, e.g. split the 3
  brackets into "first bracket" (2 choices) × "remaining 2 brackets" (4 combined choices):
  `targetA: 2, targetB: 4` (or the transpose), with `stage1Label`/`stage2Label` and `prompt` reworded
  to describe that grouping instead of "3 stages of 2". Update `successFeedback` to describe the
  resulting 2 × 4 = 8 breakdown consistently with the on-screen text. Preserve the lesson's point
  (2³ = 8 total choice sequences, matching row 3's sum) — only the widget's stage framing, target
  values, and their surrounding prose need to change.
- Scope: this file only, step `i1`'s widget block and its `prompt`/`successFeedback`/`stage*Label`
  fields. Do not alter c1/c2/k1/k2/k3/ch1/r1 — their math is independently correct.

### bt-02-02 — `content/courses/binomial-theorem/lessons/bt-02-02.json`, steps `c2`, `i1`, `k2`
- Current: `c2`'s body and `i1`'s `predict.reveal` both claim the C(n,k)=C(n,n−k) mix-up "sometimes"
  gives the right answer by luck and won't for larger n, citing "(a+b)⁸ ... would give 70 instead of
  56." `k2`'s `widget.commonErrors` entry `{"value": 70, "feedback": "70 is C(8,4) — k was read off
  the power of a."}` repeats the same false mechanism (reading k off a's power, i.e. k=5, actually
  gives C(8,5)=56, not 70).
- Fix: remove or rewrite the "sometimes forgiven, sometimes not" framing in `c2` and `i1.predict.reveal`
  — the symmetry identity C(n,k)=C(n,n−k) holds unconditionally, so swapping which exponent supplies
  k can never change the resulting coefficient, for any n. Either drop the "(a+b)⁸ gives 70" claim
  entirely, or replace it with a genuinely different, mechanism-accurate misconception (e.g. an
  off-by-one confusion between a term's 1-indexed position and its k value, tying into this same
  lesson's `k3` step, which is a plausible route to 70 = C(8,4) for the a⁵b³ term if the base is
  confused). Correct `k2`'s `commonErrors` value-70 feedback to describe whatever mechanism is
  chosen accurately. The graded answer (56) and every other numeric fact in the lesson are correct
  and need no change.
- Scope: this file only, the `c2.body` string, `i1.widget.predict.reveal` string, and
  `k2.widget.commonErrors[0].feedback` string. Do not alter k1/k3/ch1/r1 or any numeric `answer`
  field — every computed value in the lesson is correct.

### bt-02-03 — `content/courses/binomial-theorem/lessons/bt-02-03.json`, step `i1`
- Current: `widget.type = "treeDiagram"`, `targetA: 4, targetB: 2`, drawing/printing "4 × 2 = 8
  outcomes" while `prompt` says "Set the tree to 4 stages of 2" and `successFeedback` claims "16
  equally likely paths — 2⁴."
- Fix: retarget to a grouping the widget's real a×b model can render as 16, e.g. "first two flips"
  (4 outcomes) × "last two flips" (4 outcomes): `targetA: 4, targetB: 4` (adjust `maxA`/`maxB`/
  `aStart`/`bStart` accordingly), with `stage1Label`/`stage2Label`/`prompt` reworded to match — this
  mirrors the SAME 2-and-2 split already used correctly by this lesson's own step `i2`
  (`areaModel`/`countGrid`, 4-by-4 grid, `targetArea: 16`). Update `successFeedback` to reference the
  4 × 4 = 16 breakdown instead of "4 stages of 2."
- Scope: this file only, step `i1`'s widget block and its `prompt`/`successFeedback`/`stage*Label`/
  `targetA`/`targetB`/`maxA`/`maxB`/`aStart`/`bStart` fields. Do not alter i2/k1/c2/k2/k3/ch1/r1 —
  their math (C(4,2)=6, P(4 heads)=1/16, 1+4+6+4+1=16, C(3,2)/8=3/8) is independently correct.

## Raw data

- Review basis hashes (via `node scripts/session/print-review-basis.mjs <ids>`), staged
  dispositions, and all evidence refs are recorded per-lesson in
  `reports/closure/cowork-staging/laneB-s322-F6-dispositions.jsonl` (21 NDJSON records, `recordId`
  = `S322-F6-<lessonId>`).
- Duplicate scan: `buildDuplicateInventory` over the full 1701-lesson corpus returned zero MCQ
  identity clusters touching any of these 21 lesson IDs (corpus summary: 22 clusters / 50
  placements / 48 affected lessons total, none in this scope).
- Widget-truth cross-check: `binomialExpand(1,3,1,3).middle=6` matches (x+3)²'s 6x; `binomialExpand`
  outputs for bt-01-01/bt-01-02/bt-02-01/bt-02-02's `binomialAreaLab` targets all match their stated
  successFeedback expansions. `probabilityArea`'s `v*targetDen === rows*cols*targetNum` check matches
  ev-01-01's 3/8 target exactly. `distributionCompareLab`'s measure-mode exact-match check matches
  ev-01-03/ev-02-03's standardized-gap answers (2 and 3) exactly. `treeDiagram`'s `leaves = a*b`
  rendering was cross-checked against every other in-corpus usage (`cpr-05-01/i1`, `sp-04-01/e1`,
  `sp-04-01/i3`, `si-01-03/i1`) — all four are genuine two-stage multiplication scenarios that match
  the widget's actual model; only the two binomial-theorem usages (bt-01-03/i1, bt-02-03/i1) misuse
  it as an n-stage 2ⁿ binary tree, which is the confirmed defect above.
- Figures verified present, registered, and numerically matched to prose: `RightTriangle`,
  `RnsRationalDef`, `RepeatingDecimalCycle`, `RnsPredictDecimal`, `RnsConvertRepeating`, `RnsClassify`,
  `RnsDensity`, `NumberLineBetweenIntegers`, `RnsCompareIrr` (real-number-system); `BtCrossTerms`,
  `BtTermCountGrows`, `BtPascalTriangle`, `BtSymmetryAndSum`, `BtChooseFromEachBracket`,
  `BtEntryIsChoose`, `BtTheoremLine`, `BtSubstituteWholeBlocks`, `BtSingleTermExtraction`,
  `BtSymmetryTrap`, `BtProbabilityExpansion`, `BtFairCoinPaths` (binomial-theorem);
  `EvRandomVariableMap`, `EvOutcomesShareValue`, `EvDistributionInventory`, `EvReadingShape`,
  `EvLongRunAverage`, `EvWeightedNotPlain`, `EvCostIsNegative`, `EvNetExpectation`, `EvFairGameZero`,
  `EvFairnessSetsPrice`, `EvLongRunDomain`, `EvRiskOutsideExpectation` (expected-value).
