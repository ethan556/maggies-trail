# S319 — Independent Assessment: Ratios & Rates + Measure & Convert

Prefix `MT-V4-WORKER-PREFIX-1` applied. Read-only assessment; source is authoritative; evidence
below is candidate for the independent human-decision ledger, not a self-approval.

Reviewer: Claude Cowork independent assessor (S319)
Reviewed at: 2026-08-20T12:31:47.000Z
Courses: `content/courses/ratios-rates` (course.json gradeLevel 6), `content/courses/measure-convert`
(course.json gradeLevel 4). Every lesson JSON in both courses was read in full; every ratio,
unit rate, percent, and metric/customary conversion in the review below was recomputed by hand.
Basis hashes were pulled in bulk via `node scripts/session/print-review-basis.mjs`.

Per-lesson NDJSON dispositions appended to
`reports/closure/cowork-staging/laneB-s319-rr-mc-dispositions.jsonl` (31 records, one per lesson,
`recordId` = `S319-E-<lessonId>`). This report does not write the ledger itself.

## Course decision counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| ratios-rates (6) | 16 | 15 | 1 | 0 |
| measure-convert (4) | 15 | 15 | 0 | 0 |
| **Total** | **31** | **30** | **1** | **0** |

## REVISE list (one-phrase reasons)

- **rr-05-03** (Ratios Capstone) — step `k4` `explanationVariants[0]` contains a leftover
  scratch-work artifact ("Wait — recompute with THESE numbers…") that briefly asserts an incorrect
  intermediate before self-correcting.

## Per-lesson verdict lines

### ratios-rates (grade 6)

- `rr-01-01` Two Quantities, One Relationship — **KEEP** / visual SUFFICIENT / language FIT. Ratio
  order, group-scaling (9 apples → 3 copies → 6 oranges), and simplification (12:18 → 2:3 by ÷6)
  verified.
- `rr-01-02` Part, Part, Whole — **KEEP** / SUFFICIENT / FIT. Part-to-whole sums (3+2=5, 4+3=7,
  5+3=8, 7+3=10, 5+4=9) verified.
- `rr-01-03` Equivalent Ratios — **KEEP** / SUFFICIENT / FIT. Scaling (2:3→10:15), additive-trap
  distractors (5:4, 6:5), and the 8:12-vs-12:16 non-equivalence check verified.
- `rr-02-01` Ratio Tables — **KEEP** / REQUIRED / FIT. All row-multiplier arithmetic verified;
  table is the lesson's core representation.
- `rr-02-02` Double Number Lines — **KEEP** / REQUIRED / FIT. covariationScrubber unit rate
  (3 apples:$2 → 2/3/apple → $4 at 6 apples) and every lap/minute value verified.
- `rr-02-03` Choose Your Tool — **KEEP** / SUFFICIENT / FIT. Tool-selection arithmetic verified.
- `rr-02b-01` Ratio Pairs on the Plane — **KEEP** / REQUIRED / FIT. Traced the plotPoint widget's
  1-indexed target→label mapping by hand (e.g. target `{x:3,y:5}` → displayed `(2,4)`) against
  every successFeedback/pointErrors string; all consistent.
- `rr-03-01` The Per-One Row — **KEEP** / REQUIRED / FIT. Unit-rate reasoning gated by
  `askAtStep`/`requiredExplorations` before reveal (core unit-rate requirement satisfied); all
  arithmetic verified.
- `rr-03-02` The Better Buy — **KEEP** / SUFFICIENT / FIT. Unit prices (25¢/20¢; three-jar
  30¢/25¢/30¢; 9mph/8mph) verified.
- `rr-03-03` Rates That Predict — **KEEP** / SUFFICIENT / FIT. Predict-forward/backward and
  steady-pace-assumption arithmetic verified.
- `rr-04-01` Percent Means Per Hundred — **KEEP** / REQUIRED / FIT. percentBar (35% of 200=70) and
  fraction↔percent conversions verified.
- `rr-04-02` A Percent of a Number — **KEEP** / REQUIRED / FIT. 25% of 80=20 (bar), 30% of
  40=12/90=27, 20% of 50=10 verified; whole-matters trap correct.
- `rr-04-03` Percents Over and Under — **KEEP** / REQUIRED / FIT. 150% of 20=30, whole-from-part
  (9→36, 15→50), 5% of 80=4 verified.
- `rr-05-01` Conversion Is a Ratio — **KEEP** / REQUIRED / FIT. doubleNumberLine (3 ft=36 in) and
  every multiply-vs-divide unit-size judgment verified.
- `rr-05-02` Chaining Conversions — **KEEP** / SUFFICIENT / FIT. Chained arithmetic (2h=7200s,
  2km=200,000cm) verified.
- `rr-05-03` Ratios Capstone — **REVISE** / SUFFICIENT / REVISE. See contract below; all other
  arithmetic in the lesson verified correct.

### measure-convert (grade 4)

- `mc-01-01` Metric Prefixes as Badges — **KEEP** / SUFFICIENT / FIT. Kilo/centi factor arithmetic
  verified (1kg=1000g, 1km=1000m, 1m=100cm, 1kL=1000L).
- `mc-01-02` Converting Length — **KEEP** / SUFFICIENT / FIT. Full length-ladder chain (mm↔cm↔m↔km)
  verified, including the two-hop 2km→200,000cm case.
- `mc-01-03` Converting Mass & Volume — **KEEP** / SUFFICIENT / FIT. kg/g and L/mL conversions and
  the recipe-subtraction word problem verified.
- `mc-02-01` The Area Formula — **KEEP** / REQUIRED / FIT. areaModel rotation invariance (3×8=8×3)
  and break-apart products (23×45=1035, 12×34=408, 18×12=216) verified by hand.
- `mc-02-02` The Perimeter Formula — **KEEP** / REQUIRED / FIT. Every same-perimeter/same-area pair
  in the dragBucket was independently recomputed and is correct; missing-side algebra verified.
- `mc-02-03` Formulas in Word Problems — **KEEP** / SUFFICIENT / FIT. Verb→formula discrimination
  arithmetic (paint, fence, field, park) verified.
- `mc-03-01` What a Degree Measures — **KEEP** / REQUIRED / FIT. Halving chain 360→180→90→45
  verified; slider targets are valid step multiples.
- `mc-03-02` Measuring with a Protractor — **KEEP** / REQUIRED / FIT. All clock-hour×30° values
  verified, including both short/long-path reflex readings (12→9: 90° vs 270°; 12→7: 150° vs
  210°).
- `mc-03-03` Classifying Angles — **KEEP** / REQUIRED / FIT. Every 90°/180° boundary case (89, 91,
  179, 150, 75) verified against the exact-boundary rule.
- `mc-04-01` Angles That Combine — **KEEP** / REQUIRED / FIT. All additive sums (70, 60, 90, 110)
  and matchPairs totals verified.
- `mc-04-02` Finding a Missing Angle — **KEEP** / REQUIRED / FIT. All 90°/180°-benchmark
  subtractions verified; dragBucket benchmark sort correct in every case.
- `mc-04-03` Benchmark Angles — **KEEP** / REQUIRED / FIT. All around-a-point sums verified
  (310→50, 290→70 ×2, 270→90); rotationLab 270° reflex target is a valid step and geometrically
  sound.
- `mc-05-01` Measuring to the Nearest Fraction — **KEEP** / REQUIRED / FIT. unitRuler 11-eighths=
  1 3/8 in verified; every GCF-simplification (6/8→3/4, 4/8→1/2, 3/8 and 5/8 already simplest)
  checked.
- `mc-05-02` Building a Line Plot — **KEEP** / REQUIRED / FIT. dotPlot target counts hand-tallied
  against the prompt's data list and match exactly; stack-total and tallest-stack arithmetic
  verified.
- `mc-05-03` Reading Line Plot Questions — **KEEP** / REQUIRED / FIT. dotPlot ">1/2" target
  hand-verified; strictly-more-than vs at-least boundary language correct; fraction
  difference/sum (3/4−1/4=1/2, 1/4+1/4=1/2) and final count comparison (5−3=2) verified.

## Implementation contract for REVISE

### `rr-05-03` (Ratios Capstone) — step `k4`

**File:** `content/courses/ratios-rates/lessons/rr-05-03.json`
**Field:** `steps[].id == "k4"` → `explanationVariants[0]`

**Current text (defective):**
```
"4 lb at $4/lb costs 4×4=$16. Wait — recompute with THESE numbers: 5 lb at $4/lb = $20. A 10% discount is 10% of 20 = $2. Final price: 20−2=$18."
```

**Defect:** The string is a leftover authoring/scratch-work artifact. It states an incorrect
intermediate result (4 lb × $4/lb = $16) that does not match the step's actual prompt ("You buy
5 pounds"), then interrupts itself mid-sentence ("Wait — recompute with THESE numbers") before
arriving at the correct figures. This is not grade-6-appropriate polished explanation copy — it
exposes an internal correction that should never reach the learner, and a learner skimming only
the first clause would see a wrong number "$16" presented as if factual.

**Correctness note:** The widget's `successFeedback` and `fallbackFeedback` for the same step are
already correct ("Multiply rate by quantity first (4×5=$20), find 10% of that ($2), then subtract
the discount: 20−2=$18."), so no numeric/logic error reaches the graded outcome — only
`explanationVariants[0]` needs a rewrite. `explanationVariants[1]` is already clean and correct
("Multiply rate by quantity first ($4×5=$20), find the discount amount second (10% of 20=$2), then
subtract: $20−$2=$18.") and can serve as the model for the fix.

**Required fix:** Replace `explanationVariants[0]` with a single clean sentence using the lesson's
actual numbers (5 lb at $4/lb, 10% off), consistent in form with the lesson's other
`explanationVariants` pairs (a "step-by-step" variant and a "compressed" variant). Suggested
replacement text (implementer should match house style, not necessarily use verbatim):

```
"5 lb × $4/lb = $20 before the coupon; 10% of $20 is $2 off, so the final price is 20−2=$18."
```

No other field in `rr-05-03.json` requires a change; `successFeedback`, `fallbackFeedback`,
`numericErrors`, and the `ch1` step's parallel discount problem were all independently verified
correct.

## Notes on scope

- All 31 `figure` IDs referenced across both courses were confirmed present in
  `src/components/figureIds.ts` (no missing-visual defects found).
- No `npm`/`vitest`/`tsc` commands were run, per instructions; all verification was manual
  arithmetic and static JSON/source reading.
- No answer leaks, label-length parity issues, bare "try again" feedback, or missing
  accessible-description patterns were found in either course during this pass.
