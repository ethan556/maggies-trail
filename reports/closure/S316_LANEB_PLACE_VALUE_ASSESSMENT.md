# S316 Lane B — Place Value (grade 3) — Independent Assessment

Reviewer: Claude Cowork independent assessor (place-value S316)
Scope: content/courses/place-value/course.json + all 15 lessons in
content/courses/place-value/lessons/. Read-only; dispositions staged to
reports/closure/cowork-staging/laneB-place-value-dispositions.jsonl.

## Course summary

15 lessons across 4 chapters (Inside a Number; Rounding; Adding & Subtracting to
1,000; Multiplying by Tens). course.json declares `gradeLevel: 3`. All 15 lessons and
course.json were read in full. Every `figure` key referenced by a step (14 distinct figure
IDs) was confirmed registered in `src/components/figureIds.ts`, and the SVG-producing
component for each was read in `src/components/figures.tsx` to compare its hardcoded numbers
against the prose of every step that cites it. Every `variant`-generator-declared MCQ/numeric
widget's `commonErrors`/`commonBuilds`/`commonResults`/`commonPlacements` arithmetic claims
were independently recomputed. Every widget `type` used in the course (mcq, numeric,
dragBucket, slider, numberLinePlace, matchPairs, baseTenCompose, steppedReveal,
placeValueTransformLab, placeValue, estimateSlider, dragOrder, columnCalc, plotPoint,
doubleNumberLine, buildExpression) was checked against known choice-surface-shuffle status.

**Decisions: 3 KEEP, 12 REVISE, 0 ESCALATE.**

## P0 finding — ILLUSTRATION_REPLACEMENT: concept-step prose doesn't match its own figure's baked-in numbers

Six of the fourteen figures in this course are static SVGs with fixed, hardcoded numeric
examples (`src/components/figures.tsx`, e.g. `Pv3PlaceChart` always renders "342", regardless
of caller). In several lessons the **first** concept step that introduces a figure writes a
worked example using *different* numbers than what the figure actually shows, while a **later**
step that reuses the same figure ID correctly matches it. This means a learner reading the
first occurrence sees a figure that renders neither the quantity nor (in one case) the
direction of the relationship the adjacent prose just described:

| Lesson | Step | Prose says | Figure (`pv3-*`) actually renders | Severity |
|---|---|---|---|---|
| pv-01-01 | c1 | "In 347, the 3 parks in hundreds, 4 in tens, 7 in ones" | `pv3-place-chart`: 342 = 3 hundreds, 4 tens, **2** ones | digit mismatch |
| pv-01-03 | c1 | "452 vs 449: hundreds tie, tens differ, 452 wins" | `pv3-compare`: 342 vs 328 | different pair entirely |
| pv-02-02 | c1 | "368 lives between 300 and 400 ... rounds to **400**" | `pv3-round-hundred`: 349 rounds **down** to 300 | opposite rounding direction — most severe |
| pv-03-01 | c1 | "268 + 47: hop +2 to 270, +40 to 310, +5 to 315" | `pv3-jump`: 47 + 23, hop +3, target 70 | unrelated problem |
| pv-02-04 | c1 | estimating 289 + 512 ≈ 800 (two-addend story) | `pv3-round-hundred`: single-number 349 → 300 | off-topic recycled figure |
| pv-03-04 | c1 | 512 − 289 ≈ 200 guard workflow | `pv3-round-hundred`: single-number 349 → 300 | off-topic recycled figure |

In every one of these lessons, a **second** concept step (c2) that reuses the identical figure
ID correctly narrates the figure's actual fixed content (pv-01-03 c2: "342 > 328"; pv-02-02 c2:
"349 ... rounds down to 300"; pv-03-04 c2: "the figure shows 349 rounding to 300"). The pattern
is therefore specific and consistent: the figure's own baked-in example was written once and is
correct where later prose defers to it, but the *first* introduction of that figure was drafted
independently with a fresh illustrative example that nobody checked against the SVG. This is a
genuine "promised visual does not render the actual quantity/relationship" defect, not a
false-positive — verified by reading `figures.tsx`'s source directly, not just the figure ID
string. All six affected lessons are marked REVISE with `visualDecision: REQUIRED`.

Every other figure in the course (`pv3-expanded`, `pv3-trade`, `pv3-trade-down`, `pv3-halfway`,
`pv3-regroup`, `pv3-borrow-zero`, `pv3-times-tens`, `pv3-zero-pattern`) was confirmed correctly
synchronized with its adjacent prose in every occurrence.

## Finding 2 — systemic length-based answer leak in MCQ options

Across the course's 36 `mcq` widgets, the correct option is the single longest label **64% of
the time** (23/36) — far above the ~25–33% chance baseline for 3–4-option MCQs — while it is the
single shortest only 25% of the time (roughly chance). In 13 of those cases the correct option
outruns the next-longest distractor by 10–42 characters, because the correct option is written
as a self-justifying explanation ("401 — its hundreds digit wins (4 > 3), and the 99 can't catch
up") while distractors are terse ("399 — it's full of big digits"). This is independent of, and
not fixed by, the seeded-shuffle-at-render convention (`McqW` already shuffles order; it does
not — and cannot — equalize label length). A learner who notices "the longest answer is usually
right" across this course's `k1`-style conceptual-reasoning checks would be rewarded well above
chance without doing the math. Affected steps (gap ≥ 10 chars): pv-01-03 (k1, k2), pv-02-01
(k3), pv-02-02 (k1), pv-02-03 (k1), pv-02-04 (k1, k3), pv-03-02 (k1), pv-03-03 (k1), pv-03-04
(k1, k3), pv-04-02 (k1), pv-04-03 (k3). This is a content-authoring parity defect (option-label
construction), not a rendering-layer defect — fixable by shortening the correct option or
lengthening distractors to equalize label length, without changing which option is correct.

Cross-checked against precedent: the constructions-and-proof S316 assessment explicitly checked
for this exact pattern and found option-length spreads that were **not** systematic (correct
option not predictably longest/shortest). This course's 64%-longest rate is the opposite result
and is flagged accordingly.

## Finding 3 — one confirmed false-feedback (math-truth) defect

`pv-03-01` step `k2` (`456 + 99 = ?`, answer 555, "use the overshoot" strategy): the
`commonErrors` entry for value **545** reads "545 repaid 10 instead of 1. The overshoot was only
1 over (100 instead of 99), so only 1 goes back." Recomputing that exact described operation:
456 + 100 = 556, then 556 − 10 = **546**, not 545. The stated arithmetic does not produce the
flagged distractor value — an off-by-one mismatch between the labeled misconception and the
number a learner would actually see flagged. This violates "feedback must be literally true of
the drawn problem." Every other `commonErrors`/`commonBuilds`/`commonResults`/`commonPlacements`
value checked in this course (dozens, across all 15 lessons) was verified to trace accurately to
its stated misconception; this is an isolated, single-value defect, not a systemic one.

## Choice-surface / shuffle status (no defect)

Both `placeValueTransformLab` instances in this course (`pv-01-03` `i1`, `pv-04-02` `i1`) are
confirmed already fixed by the S316 lab-choice-shuffle sweep (`S316_LAB_CHOICE_SHUFFLE_SWEEP.md`
explicitly cites `pv-01-03` as its authored-bias evidence example for this widget). All 36 `mcq`
widgets and all `predict` blocks render through the already-shuffled `McqW`/`predict` paths. No
other lab-style unshuffled widget type from that sweep (`proportionalReasoningLab`,
`percentChangeLab`, etc.) is used anywhere in this course. `dragBucket`, `matchPairs`,
`dragOrder`, and `buildExpression` are drag/match/build interactions, not linear pick-one
selections, so authored-order position bias does not apply to them the same way.

## Duplication check (no defect)

No byte-identical widget `prompt` string is reused anywhere in this course — checked
programmatically across all 15 lessons' primary steps and remedial checks. Numbers are varied
lesson-to-lesson and step-to-step (e.g. the "round-then-add" warm-up pattern recurs across
pv-02-01/02/03/04's `k4` steps, but each uses a fresh number pair). Own-lesson
remedial-mirrors-primary duplication (a course-wide convention seen elsewhere in this codebase)
is not present here either — every remedial in this course uses numbers distinct from its
lesson's primary steps (e.g. pv-01-01's remedial uses 74, never used elsewhere in that lesson).

## Grade-language check (no defect)

course.json declares `gradeLevel: 3`. Vocabulary and metaphors ("parking garage," "trading
post," "worth-pieces," "trade receipt," "unit badge," "friendly numbers," "guard the answer")
are consistently playful, concrete, and read-aloud-appropriate for grade 3 throughout all 15
lessons. No lesson uses vocabulary or sentence complexity outside that band.
`gradeLanguageDecision: FIT` for all 15 lessons.

## Per-lesson verdicts

| Lesson | Decision | Visual | Key reason |
|---|---|---|---|
| pv-01-01 | REVISE | REQUIRED | c1 prose (347) doesn't match `pv3-place-chart` figure (342) |
| pv-01-02 | KEEP | SUFFICIENT | Figure matches both occurrences; no other defects |
| pv-01-03 | REVISE | REQUIRED | c1 prose (452/449) doesn't match `pv3-compare` figure (342/328); k1/k2 length-leak |
| pv-01-04 | KEEP | SUFFICIENT | Generic figures, no numeric conflict; no other defects |
| pv-02-01 | REVISE | SUFFICIENT | k3 length-leak (44-char correct option) |
| pv-02-02 | REVISE | REQUIRED | c1 prose (368→400) contradicts `pv3-round-hundred` figure (349→300, opposite direction); k1 length-leak |
| pv-02-03 | REVISE | SUFFICIENT | k1 length-leak (largest gap in course, 42 chars) |
| pv-02-04 | REVISE | REQUIRED | c1 reuses off-topic `pv3-round-hundred` figure; k1/k3 length-leak |
| pv-03-01 | REVISE | REQUIRED | c1 prose (268+47 jumps) doesn't match `pv3-jump` figure (47+23); k2 commonError value 545 is arithmetically false |
| pv-03-02 | REVISE | SUFFICIENT | k1 length-leak |
| pv-03-03 | REVISE | SUFFICIENT | k1 length-leak |
| pv-03-04 | REVISE | REQUIRED | c1 reuses off-topic `pv3-round-hundred` figure; k1/k3 length-leak |
| pv-04-01 | KEEP | SUFFICIENT | Figure matches both occurrences; k1 correct option not longest; no other defects |
| pv-04-02 | REVISE | SUFFICIENT | k1 length-leak |
| pv-04-03 | REVISE | SUFFICIENT | k3 length-leak |

## Implementation contracts for each REVISE

**pv-01-01** — Fix `c1`'s prose to describe 342 (matching the existing `pv3-place-chart` figure),
or replace the figure with one hardcoded to 347. Prefer editing prose (smaller diff, figure is
shared-infra out of this packet's lesson-JSON scope): change "In 347, the 3 parks in the hundreds
spot, the 4 in tens, the 7 in ones" to the 342 example. No other step, answer, or feedback text
changes.

**pv-01-03** — `c1`: change the worked example from "452 vs 449" to "342 vs 328" (matching
`pv3-compare`), keeping the same comparison logic ("hundreds tie, tens differ, X wins"). `k1`/`k2`:
shorten the correct option's justification clause (or lengthen distractors) so no option is more
than ~10 characters longer than the others; do not change which option is marked `correct` or any
feedback text.

**pv-02-01** — `k3`: rebalance option-label lengths (correct: "30 is the ten closest to 27 — just
3 steps away" vs. distractors averaging ~31 chars) without changing meaning or correctness.

**pv-02-02** — `c1`: change the worked example from "368 ... rounds to 400" to "349 ... rounds
down to 300" (matching `pv3-round-hundred`) — this is the highest-priority fix in the course
because the current mismatch teaches the *opposite* rounding outcome from what the figure shows.
`k1`: rebalance option-label lengths.

**pv-02-03** — `k1`: rebalance option-label lengths (largest gap in the course, 42 characters).

**pv-02-04** — `c1`: either swap in a figure that actually depicts rounding-two-addends-then-
adding (out of this packet's scope if no such figure exists yet), or rewrite `c1`'s prose to
describe the single-number rounding-to-hundred skill the existing `pv3-round-hundred` figure
shows, moving the two-addend estimation story to a step without a figure claim. `k1`/`k3`:
rebalance option-label lengths.

**pv-03-01** — `c1`: change the worked example from "268 + 47 via +2/+40/+5" to "47 + 23 via
+3, target 70" (matching `pv3-jump`), or vice versa if the pedagogical intent favors the current
prose (in which case the figure needs to change, which is out of this lesson-JSON packet's
scope — flag for the figure owner). `k2`: fix the value-545 commonError — either change the
flagged value to 546 (matching the stated "repaid 10 instead of 1" misconception) or rewrite the
feedback to describe an operation that actually produces 545.

**pv-03-02** — `k1`: rebalance option-label lengths.

**pv-03-03** — `k1`: rebalance option-label lengths.

**pv-03-04** — `c1`: same fix pattern as pv-02-04 (recycled `pv3-round-hundred` figure doesn't
match the two-number guard-estimate story); c2 already narrates the figure correctly and needs
no change. `k1`/`k3`: rebalance option-label lengths.

**pv-04-02** — `k1`: rebalance option-label lengths.

**pv-04-03** — `k3`: rebalance option-label lengths.

## Gate status

Per task instructions, no `npm`/`vitest`/`tsc` commands were run for this assessment (read-only
review). All findings above were verified by direct source reading (`figures.tsx` component
bodies, not just figure-ID registration) and independent recomputation of arithmetic in
`commonErrors`/`commonBuilds`/`commonResults`/`commonPlacements`, not by running the project's
test suite.
