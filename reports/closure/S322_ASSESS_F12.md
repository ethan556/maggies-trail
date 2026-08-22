# S322 Assessment F12 — place-value-1000, tens-and-ones, radicals-and-exponents

Independent course assessor pass over three complete courses (36 lessons total: 12 + 12 + 12).
Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s322-F12-dispositions.jsonl`. Every disposition supersedes
any prior decision on these lesson IDs.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and obeyed: the repository source and
this session's own re-derivation are authoritative; the ChatGPT Work cache and any prior
assessor's prose are evidence only, not self-approving. A prior attempt at this same task was cut
off mid-run with no usable staging output; this session started fresh and produced no residue from
that attempt.

## Method

For every one of the 36 lessons, `node scripts/session/print-review-basis.mjs <id>` was run to get
the current review-basis hash (36/36 resolved, 0 unknown), then cross-checked against every
`reviewedBasisHash`/`reviewBasisHash` recorded in `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`
and every `reports/closure/cowork-staging/*.jsonl` file: **0/36 matched** — every lesson's source
moved since its last recorded review (all three courses received the S320 progression-dedup wave,
which touched every lesson in all three; `reports/closure/S320_PROGRESSION_DEDUP.md` confirms
12/12/12/9-of-12 rows fixed with all 12/12/12 lesson files re-verified for `place-value-1000`,
`tens-and-ones`, `radicals-and-exponents`). Every lesson was therefore read and assessed in full at
current state: every step's body, widget (prompt, answer/target, `commonErrors`/`numericErrors`,
`explanationVariants`, options), remedial, and cited figure was read; every numeric, MCQ,
`exactNumberLab`, `geometricConstraintLab`, `placeValueTransformLab`, `baseTenCompose`, and
`fractionEntry` answer was hand-recomputed against the authored prompt (and, for the lab-widget
task types, against the truth formulas in `src/lib/schema.ts` — `pythagoreanArea`'s
`c² = legA² + legB²`/`legLength = √(hyp² − knownLegArea)`, `radicalProduct`/`radicalCombine`/
`radicalSimplifyCoef`'s factor-over-target-radicand logic, `rationalExponentEvaluate`'s
root-then-power logic, and `decidingPlace`'s left-to-right digit-comparison logic).

Two duplicate scans were run, per the task's dedup-verification instruction:

1. **Byte-identical / normalized-template, within-lesson**: a direct hand-replica of the live
   detector in `scripts/audit/consolidate-pending-workload-s236.mjs` (`repeatedWidgets` — exact
   `stable()` signature match, `repeatedPrompts` — exact prompt-string match, `repeatedTemplates` —
   prompt normalized by `.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g,"#").replace(/\s+/g," ")`),
   run against every one of the 36 lessons' `steps` array. **Result: 0/36 lessons flagged** — the
   S320 dedup wave holds, no residual normalized-template duplicates.
2. **Prompt-excluded structural, cross-lesson**: an independent scan (not a live detector — built
   for this assessment) comparing every widget's *operand set + answer* across every pair of
   lessons within each course, ignoring wrapper prose. This is what the live detectors do not
   check (they only look within one lesson, or — for MCQ — at byte-identical prompt+options
   clusters courseset-wide). **Result: `tens-and-ones` clean (0 collisions). `place-value-1000`
   found `pv1000-04-03`'s entire check tier reusing `pv1000-04-01`/`pv1000-04-02` operand pairs.
   `radicals-and-exponents` found one collision, `rad-02-03/i3` vs `rad-02-02/i3`.** Both are
   detailed below and drove the two REVISE dispositions.

The global byte-identical MCQ prompt+options cluster check (`buildDuplicateInventory` in
`scripts/audit/lesson-review-authority-s246.mjs`) was also replicated courseset-wide: 22 clusters
exist across the full repo, **0 touch any of these 36 lessons**.

Every cited figure (78 distinct figure IDs across the three courses) was confirmed to resolve in
`src/components/figures.tsx`'s registry map, and a sample was opened and read to confirm the
rendered quantities/labels match the citing lesson's own numbers (e.g. `Pv1000Placeholder507` shows
5/0/7 for the 507 placeholder-zero lesson; `TnoMoreTens` shows 40 > 39; `TnoSameTensOnes` shows
71 < 76). All widget types used in these three courses (`areaModel`, `baseTenCompose`,
`buildExpression`, `distanceGrid`, `dragOrder`, `exactNumberLab`, `expLogExplore`,
`fractionEntry`, `geometricConstraintLab`, `mcq`, `numberLineHop`, `numberLinePlace`, `numeric`,
`placeCompare`, `placeValue`, `placeValueTransformLab`, `slider`) were confirmed implemented in
`src/components/widgets.tsx`. The S316/S320 lab-choice seeded-shuffle fix
(`orderedChoices = seededShuffle(spec.choices, seed ?? ...)`) was confirmed still present and
unreverted in `ExactNumberLabW` and `PlaceValueTransformLabW`, the two lab-choice widget families
used by `radicals-and-exponents` and `place-value-1000` respectively. MCQ option sets were scanned
for correct-count ≠ 1, duplicate ids/labels, and label-length spread > 12 chars (a length-leak
heuristic): 0 hits. Every option/commonError/numericError feedback string was read; only one
correct-option feedback ("Yes.") was terser than the house style (`pv1000-03-01/rem-pww-k`) — a
cosmetic nit, not a misconception-feedback failure, not flagged as a defect.

Remedial checks that literally re-quote one of the lesson's own step prompts verbatim (a
"re-test the missed question after reteaching" pattern) were found on ~19/36 of these lessons.
This pattern was checked repo-wide (280 instances across all 1,701 lesson files in the repo) and
found to be an established, pre-existing, courseset-wide design convention, not something
introduced by or specific to these three courses — it was not treated as a defect.

No npm/vitest/tsc was run (per instructions). Math was verified by hand; figure and widget code
was read directly, not rendered in a browser.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| place-value-1000 | 12 | 11 | 1 | 0 |
| tens-and-ones | 12 | 12 | 0 | 0 |
| radicals-and-exponents | 12 | 11 | 1 | 0 |
| **Total** | **36** | **34** | **2** | **0** |

## REVISE list (one-phrase reasons)

1. **pv1000-04-03** (`Adding and Subtracting in Real Situations`) — all 7 numeric/`baseTenCompose`
   check items reuse the exact operand pairs already used as checks in pv1000-04-01/04-02, giving
   zero fresh computation in the "real situations" application lesson.
2. **rad-02-03** (`Distributing Radicals`) — step `i3` (`√2 · √6 = a√3...`) is the identical problem
   to `rad-02-02/i3` (`√6 · √2 = a√3...`) with operands commutatively swapped, not a distinct job.

No mathematical falsehood, missing-visual promise, MCQ option-length leak, misconception-feedback
gap, or within-lesson normalized-template duplicate was found in any of the 34 KEEP lessons; every
KEEP lesson's answers, traps, and cited figures were independently recomputed/checked and confirmed
correct and synchronized at current source.

## Implementation contract per REVISE

### pv1000-04-03 — `content/courses/place-value-1000/lessons/pv1000-04-03.json`, steps `i1`, `k1`, `i2`, `i3`, `k2`, `k3`, `ch1`
- Current: every check-tier widget's operand pair duplicates an earlier check in this chapter —
  `i1`(324+251)=04-01/`i1`, `k1`(486−253)=04-02/`i1`+remedial, `i2`(247+186)=04-01/`i2`,
  `i3`(342−127)=04-02/`i2`, `k2`(213+142)=04-01/`k1`, `k3`(579−245)=04-02/`k1`,
  `ch1`(358+267)=04-01/`i3`. (`c1`/`c2` reusing a worked example as concept recap text is normal
  and does not need to change.)
- Fix: regenerate fresh operand pairs for all 7 check-tier widgets, preserving each item's
  trade/cascade shape (no-trade, single-trade, cascading-trade) and word-problem framing so the
  lesson's own difficulty progression is unchanged — only the specific numbers need to be new
  relative to 04-01/04-02's already-used pairs. Keep every `commonErrors` structure and
  `explanationVariants` pattern, just re-derived for the new numbers.
- Scope: this lesson's 7 check-tier `widget` blocks only; step ids, `conceptTag`s, and the
  recap/remedial content are otherwise correct as written.

### rad-02-03 — `content/courses/radicals-and-exponents/lessons/rad-02-03.json`, step `i3`
- Current: `i3`'s prompt `"√2 · √6 = a√3 after simplifying. What is a?"` (answer 2) is the same
  multiplication as `rad-02-02/i3`'s `"√6 · √2 = a√3 after simplifying. What is a?"` (answer 2),
  with near-identical `numericErrors`/`fallbackFeedback` text, and does not exercise this lesson's
  own `c3` concept (combine like radicals after distributing/multiplying).
- Fix: replace `i3` with a fresh "multiply, then simplify" problem using new radicands (not
  6-and-2), or better, one that actually demonstrates `c3`'s combine-after-distributing idea (e.g.
  `√3 · (√6 + √3) = √18 + 3 = 3√2 + 3`, asking for a coefficient or constant term) so the item
  matches its own lesson's concept instead of duplicating the prior lesson's multiply-then-simplify
  slot verbatim.
- Scope: this lesson's `i3.widget` only; `c1`/`i1`/`k1`/`c2`/`i2`/`c3`/`k2`/`k3`/`ch1`/`r1`/remedial
  are all correct and distinct as written.

## Raw data

- Review basis hashes for all 36 lessons obtained via
  `node scripts/session/print-review-basis.mjs <ids>` (36/36 resolved, 0 unknown); 0/36 matched any
  prior signed record in `LESSON_REVIEW_DECISIONS_S244.jsonl` or any `cowork-staging/*.jsonl` file
  (source moved for all 36 since the S320 dedup wave).
- Within-lesson dedup replica (`repeatedWidgets`/`repeatedPrompts`/`repeatedTemplates`, exact
  detector logic from `scripts/audit/consolidate-pending-workload-s236.mjs`): 0/36 lessons flagged.
- Cross-lesson operand+answer scan (assessment-only tool, not a live detector): `tens-and-ones`
  0 collisions/12 lessons; `place-value-1000` 1 lesson flagged (`pv1000-04-03`, 7/7 of its own
  check-tier items duplicating 04-01/04-02); `radicals-and-exponents` 1 collision
  (`rad-02-03/i3` ≡ `rad-02-02/i3`).
- Global byte-identical MCQ prompt+options cluster check (`buildDuplicateInventory` replica): 22
  clusters exist courseset-wide, 0 touch any of these 36 lessons.
- Figure registry resolution: 78 distinct figure IDs cited across the three courses, 78/78 resolve
  in `src/components/figures.tsx`; a sample (`Pv1000Placeholder507`, `Pv1000Build`,
  `Pv1000Cascade`, `Pv1000OrderList`, `Pv1000WriteCompare`, `TnoMoreTens`, `TnoSymbolOpens`,
  `TnoSameTensOnes`, `TnoEqual`, `CompareStacks`) was opened and confirmed to render the citing
  lesson's own numbers/labels, not a generic placeholder.
- Widget-type implementation check: all 17 widget types used in these three courses confirmed
  present as `case` branches in `src/components/widgets.tsx`.
- S316/S320 lab-choice seeded-shuffle fix confirmed still in place (not reverted) in
  `ExactNumberLabW` (`src/components/widgets.tsx:8749-8751`, used by `radicals-and-exponents`) and
  `PlaceValueTransformLabW` (`src/components/widgets.tsx:8548-8549`, used by `place-value-1000`).
- MCQ integrity scan (all `mcq`-type widgets across steps + remedials, 36 lessons): correct-count
  ≠ 1 → 0 hits; duplicate option id/label → 0 hits; option-label-length spread > 12 chars
  (length-leak heuristic) → 0 hits; feedback string < 15 chars → 1 hit (`pv1000-03-01/rem-pww-k`
  correct-option feedback `"Yes."`, cosmetic, not flagged).
- Remedial-restates-a-step-prompt pattern: found on ~19/36 of these lessons; confirmed via a
  repo-wide scan (280 instances / 1,701 total lesson files) to be an established, pre-existing,
  courseset-wide convention, not specific to or introduced in these three courses — not treated as
  a defect.
- Deliverables written: this file, and
  `reports/closure/cowork-staging/laneB-s322-F12-dispositions.jsonl` (36 lines, `recordId` =
  `S322-F12-<lessonId>`, `reviewer` = "Claude Cowork independent assessor (S322)").
