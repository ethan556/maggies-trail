# S320 Independent Course Assessment — Lane A1

Reviewer: Claude Cowork independent assessor (S320)
Reviewed at: 2026-08-20T18:20:17.000Z
Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (repository source + human-decision ledgers are authoritative; the ChatGPT Work cache is a derived evidence accelerator only).
Scope: THREE complete courses, course.json + every lesson in full, READ-ONLY on content. Dispositions written to `reports/closure/cowork-staging/laneB-s320-A1-dispositions.jsonl` (40 lesson-disposition records, one per lesson, NDJSON). This file is the companion rationale + implementation-contract report. The ledger was not written.

All widget math (numeric answers, commonErrors/commonBuilds/commonLandings, mcq option correctness, graphRead/plotData derivations) was recomputed by hand against each lesson's own numbers. Prior S316/S318 dispositions present on some lessons (e.g. g2b-02-06) were treated as informational only — this pass is a fresh, independent signature that supersedes them per the task's instruction.

## Per-course totals

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| add-subtract-1000-g2 | 16 | 14 | 2 | 0 |
| data-graphs-g1 | 12 | 8 | 4 | 0 |
| data-line-plots-g2 | 12 | 8 | 4 | 0 |
| **Total** | **40** | **30** | **10** | **0** |

---

## add-subtract-1000-g2 (16 lessons — 14 KEEP, 2 REVISE)

- **g2b-01-01** — REVISE. Challenge step `ch1`'s numeric prompt/answer ("300 + 200 = ?" → 500) is byte-identical to concept step `c1`'s worked example, so it re-tests nothing new — every sibling lesson in the course uses fresh numbers for its challenge. **Implementation contract:** replace `ch1.widget.prompt/answer/commonErrors/successFeedback` with an unused single-nonzero-digit-hundreds addition pair (e.g. 600 + 100 = 700), preserving the existing two-misconception commonError shape (mistaking a hundred for a one; subtracting instead of adding) with values that don't collide with the new answer.
- **g2b-01-02** — KEEP. All sums, `baseTenCompose` commonBuilds, and figures recompute correct.
- **g2b-01-03** — KEEP. All `numberLineHop` landings, numeric answers, and mcq logic recompute correct.
- **g2b-01-04** — KEEP. All hundreds/tens/ones math and commonErrors recompute correct.
- **g2b-01-05** — KEEP. All widget math recomputes correct with properly distinct commonErrors.
- **g2b-02-01** — KEEP. All subtraction math correct; `k3`'s estimate reusing `i1`'s pair (568, 234) is a distinct instructional job (estimation vs. concrete build), not duplication.
- **g2b-02-02** — KEEP. Breaking-a-ten commonBuilds/commonErrors recompute correct.
- **g2b-02-03** — KEEP. Breaking-a-hundred math recomputes correct throughout.
- **g2b-02-04** — KEEP. Subtracting-across-zero math correct; 402 / 402−188 reused across `k1`/`ch1` serve distinct jobs (method choice vs. procedural sequencing).
- **g2b-02-05** — KEEP. All `numberLineHop` landings and numeric checks recompute correct.
- **g2b-02-06** — KEEP. Independently reconfirms the prior S318-V2 KEEP/SUFFICIENT/FIT disposition; review-basis hash is byte-identical to that review, and a fresh recompute concurs.
- **g2b-03-01** — KEEP. All math verified, including non-standard-form equalities.
- **g2b-03-02** — KEEP. All math recomputes correct.
- **g2b-03-03** — REVISE. `k3`'s numeric commonError value **517** is presented as the "how many more"/subtraction-instead-of-addition misconception for "175 + 332 = ?" (answer 507), but the true difference |332−175| = **157**, not 517 — this is false feedback (the stated value does not match the misconception it claims to represent). Confirmed against the identically-templated sibling lesson g2b-03-04, whose analogous commonError correctly equals the true difference. **Implementation contract:** change the commonError value from `517` to `157` in `k3.widget.commonErrors`; keep the feedback text unchanged (it already correctly describes the misconception once the value is fixed); verified 157 collides with neither the answer (507) nor the other commonError (497).
- **g2b-03-04** — KEEP. Clean reference lesson; every commonError correctly matches |a−b| or sum±10 patterns.
- **g2b-03-05** — KEEP. All math recomputes correct; ch1 reusing k1's 402−188 pair is a distinct instructional job (procedural sequencing vs. strategy choice).

---

## data-graphs-g1 (12 lessons — 8 KEEP, 4 REVISE)

- **dgr1-01-01** — KEEP. All graphRead/mcq math correct; shared "GdQuestionMcq" wrong-option template reuse across k1/k3/ch1 is legitimate interleaved practice (each item's correct answer/topic differs; option order is render-shuffled).
- **dgr1-01-02** — KEEP. dragBucket/barBuilder/mcq math correct; same legitimate template-reuse pattern.
- **dgr1-01-03** — REVISE. `k1`'s hints contain the ungrammatical string **"1 groups."** (should be "1 group."), confirmed as a templating bug by contrast with `k3` in the same lesson, which correctly renders "2 groups." when the value is 2. All numeric math (floor/mod arithmetic) recomputes correct. **Implementation contract:** change `hints[2]` in step `k1` from `"1 groups."` to `"1 group."`.
- **dgr1-01-04** — REVISE. `k1`'s check ("2 crossed five-groups and 2 single marks" = 12) is identical in scenario and numbers to `i1`'s predict AND `i1`'s graphRead target — the same exact fact tested three times in one lesson, breaking the lesson's own convention that every other check (k2/i2, k3, ch1) uses numbers distinct from its neighboring interactive step. **Implementation contract:** change `k1.widget.prompt` to a fresh, unused combination (e.g. "1 crossed five-group and 2 single marks" = 7, distinct from 12/9/8/16/14 already used in this lesson), updating `commonErrors`/`hints` to match the new answer.
- **dgr1-02-01** — KEEP. All barBuilder/mcq/numeric math correct; Cats/Dogs/Fish dataset reused across i1/k1/k2 for distinct instructional angles (build/max/total) is legitimate.
- **dgr1-02-02** — KEEP. Same legitimate shared-dataset pattern (Soccer/Tag/JumpRope); all math correct.
- **dgr1-02-03** — REVISE. `k2`'s mcq ("Votes: Cats 6, Dogs 3, Fish 5. Which got the MOST votes?", full option/feedback/hint set) is byte-for-byte identical to dgr1-02-01's `k1` — a genuine cross-lesson duplicate check item, distinct from this lesson's own legitimate reuse of the same data to *build* a bar graph in `i1`. **Implementation contract:** change `k2`'s dataset (prompt/options/feedback/hints/explanationVariants) to a fresh triple not already used as a graded check elsewhere in the course (e.g. Red 5 / Blue 8 / Green 3).
- **dgr1-02-04** — KEEP. All graphRead/numeric/mcq math correct.
- **dgr1-03-01** — KEEP. All totals recompute correct.
- **dgr1-03-02** — KEEP. All differences recompute correct; cross-lesson category-set reuse from 03-01 is legitimate since each item computes a different quantity (difference vs. total).
- **dgr1-03-03** — REVISE. `k1`'s mcq ("Votes: Red 7, Blue 4, Green 2. Which got the MOST votes?", full option/feedback/hint/explanationVariants set) is confirmed byte-identical to dgr1-02-01's `ch1` challenge — this lesson recycles an earlier lesson's hardest question as its own first check. All other content (i2/k2/k3/ch1 on Ham/Egg/Jam) recomputes correct and is non-duplicate. **Implementation contract:** replace the shared Red/Blue/Green (7/4/2) dataset used in `i1` (build + predict), `k1` (MOST check), `k2` (FEWEST check), and the remedial check with a fresh triple not used elsewhere in the course as a graded item (e.g. Yellow 9 / Orange 6 / Purple 3), updating all numeric references, feedback text, and hints consistently across those steps.
- **dgr1-03-04** — KEEP. All "truthfully" mcq logic recomputes correct across every distractor; i1's tally graphRead (5+3=8) correct. Category-label reuse from 03-01/03-02 uses swapped number assignments and a fresh computed quantity each time, so it is not duplication.

---

## data-line-plots-g2 (12 lessons — 8 KEEP, 4 REVISE)

- **g2g-01-01** — KEEP. All `unitRuler` placement counts and mark-to-mark subtraction recompute correct.
- **g2g-01-02** — REVISE. `k1` and `k3`'s hints ("One shared unit for all." / "Mark to mark is the length." / "Record as you go.") are leftover ruler-measurement scaffolding on questions that involve no ruler or marks at all (they are multiset/record-matching MCQs); the underlying multiset math itself is correct (verified all four options on each). **Implementation contract:** replace `k1` and `k3`'s `hints` arrays with record-appropriate scaffolding, e.g. `["Every original result must still appear.", "Compare counts of each number, not just which numbers appear.", "A changed or missing repeat means lost data."]`; leave `k2`/`ch1`'s hints unchanged (those items are genuine mark-to-mark ruler subtraction and the existing hints are correct there).
- **g2g-01-03** — REVISE. `k3`'s hints are the same leftover ruler-measurement triple, inconsistent with this lesson's own correctly-tailored `k1`/`k2`/`ch1` hints ("One x per measurement." / "Stacks sit on their value." / "Height is frequency.") and irrelevant to `k3`'s actual stack-matching task. All dotPlot/numeric/plotData math recomputes correct (plotData block already verified truthful in a prior pass). **Implementation contract:** replace `k3.hints` with `["One x per measurement.", "Stacks sit on their value.", "Height is frequency."]` to match its siblings.
- **g2g-01-04** — KEEP. All dotPlot reads and numeric answers recompute correct; hints internally consistent.
- **g2g-01-05** — KEEP. All mode/tallest-stack math recomputes correct, including feedback that deliberately puns stack-height numbers against category-value distractors (verified accurate under both readings, e.g. "Five is the number of Xs in the tallest stack, not its measurement").
- **g2g-02-01** — KEEP. All barBuilder/graphRead picture-mode math recomputes correct (key=1 reads, doubling distractors). Hint terminology ("stacks"/"height") is generic/imprecise for a picture-graph row but still describes the same label-vs-count reading skill, not a different procedure — not flagged.
- **g2g-02-02** — KEEP. All picture-graph reads and compare-question subtraction recompute correct.
- **g2g-02-03** — KEEP. All bar-graph build/read math recomputes correct. `k3`'s "which display fits repeated ribbon lengths" mcq is this course's original, first occurrence of that item.
- **g2g-02-04** — REVISE. `ch1`'s numeric pair ("Wednesday has 5 votes and Thursday has 9 votes. How many more...?" → 4) duplicates g2g-02-02's `ch1` ("Tuesday has 5 votes and Wednesday has 9 votes...?" → 4) verbatim in numbers, operation, commonErrors (14, 9), and feedback template, with only the day labels swapped. **Implementation contract:** replace `ch1`'s pair with numbers/difference not already used elsewhere in the course as a compare-question challenge (course already uses differences 4, 4, 4, 5, 5, 2 elsewhere — pick a fresh pair such as 4 and 10 → 6), updating `commonErrors` and feedback text to match.
- **g2g-03-01** — KEEP. All two-digit addition and graphRead math recomputes correct, including carry-error commonErrors.
- **g2g-03-02** — KEEP. All compare-question subtraction and two-digit addition recomputes correct; no pair duplicates an earlier lesson.
- **g2g-03-03** — REVISE (most significant finding in this course). This capstone lesson's graded items are substantially recycled: `k1` is byte-identical to g2g-02-03's `k3` (ribbon-lengths "which display fits" mcq, confirmed via full-text grep match), `k2` is byte-identical to g2g-02-01's `k3` (trip-choices "which display fits" mcq, confirmed via full-text grep match), and `ch1` ("Monday has 5 votes and Tuesday has 9 votes...?" → 4) repeats the same pair already duplicated in g2g-02-04's `ch1`. Only `k3` (most-common-stack mcq, plotData [2,4,3,1]) and `i1`/`i2` (barBuilder/dotPlot) are verified-fresh, correct content. **Implementation contract:** replace `k1` with a fresh measurement-repeat scenario (new object/unit, not ribbons-in-cm), replace `k2` with a fresh categorical-choice scenario (new vote topic, not the four-trip-choices wording), and replace `ch1`'s numeric pair with one whose difference isn't already used course-wide for this question type (avoid re-using 4, 5, or 2 as the difference); keep the same three skills being assessed (choose-line-plot, choose-bar, compare-subtraction) since that fits this lesson's integrative/capstone role — only the specific recycled content needs to change.

---

## REVISE list (one-phrase reasons)

1. **g2b-01-01** — challenge step duplicates the concept step's worked example verbatim.
2. **g2b-03-03** — commonError value (517) doesn't match the misconception it claims (should be 157); false feedback.
3. **dgr1-01-03** — "1 groups." grammar bug in hints (should be "1 group.").
4. **dgr1-01-04** — same fact ("2 five-groups + 2 singles" = 12) tested 3× within one lesson.
5. **dgr1-02-03** — check item byte-identical to dgr1-02-01's check (cross-lesson duplicate).
6. **dgr1-03-03** — check item byte-identical to dgr1-02-01's challenge (cross-lesson duplicate).
7. **g2g-01-02** — hints reference ruler/marks on a non-ruler record-matching question.
8. **g2g-01-03** — one check's hints leftover from ruler-lesson template, inconsistent with its own siblings.
9. **g2g-02-04** — challenge item is a numbers-only relabel of g2g-02-02's challenge (cross-lesson duplicate).
10. **g2g-03-03** — 3 of 4 graded items are cross-lesson duplicates of g2g-02-01, g2g-02-03, and g2g-02-04/g2g-02-02.

## Notes on scope decisions

- **mcq/predict option order**: authored order in JSON is irrelevant (render-time seeded shuffle per authority doc); no findings are based on authored option order.
- **CML metadata blocks**: templated boilerplate on nearly every step, not graded content — not a focus of defect-hunting, consistent with prior lanes.
- **Shared "running example" text in concept steps** (e.g. the recurring "cats=3, dogs=6, birds=4" bar-graph illustration reused across several data-line-plots-g2 concept steps): treated as legitimate recurring-textbook-example convention, not duplication, since concept steps are expository prose, not graded questions with a "distinct instructional job" requirement.
- **Generic-but-substantive numeric feedback** (e.g. "That read the end mark as the length — subtract where the ribbon starts." without restating the specific digits): occurs as an intentional, consistent template across many `MmtRulerSubtractNumeric`/`MmtLinePlotNumeric` widgets. Passes the pedagogy linter's blocklist/MIN_DIAGNOSIS_CHARS gates and correctly names the error mechanism; not flagged as a defect since it is deliberate and consistently applied, not an isolated authoring slip.
