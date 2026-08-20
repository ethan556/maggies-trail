# S316 Lane B — Function Analysis — Independent Assessment

Reviewer: Claude Cowork independent assessor (function-analysis S316)
Scope: content/courses/function-analysis/course.json + all 16 lessons in
content/courses/function-analysis/lessons/. Read-only; dispositions staged to
reports/closure/cowork-staging/laneB-function-analysis-dispositions.jsonl.

## Course summary

16 lessons across 6 chapters (rates of change; graph behavior — rising/falling/extrema;
symmetry & piecewise functions; composition in depth; inverses formalized; comparing
representations). Grade level 12 (Precalculus) per course.json. All 16 lessons were read in
full; every numeric answer, `commonErrors`/`numericErrors` value, `exactNumberLab`
`approxFormula` tree, and mcq/buildExpression distractor was recomputed independently by hand
and checked against the authored value. Every `figure` id referenced was confirmed present in
`src/components/figureIds.ts` and wired to a component in `src/components/figures.tsx`; one
figure component (`FnaCubicBehavior`) was read in full and confirmed to render the correct
curve, extrema coordinates, and increasing/decreasing shading for the three lessons that reuse
it. For `secantSlope`/`derivativeTrace` interactive widgets, the underlying shared arithmetic
(`curveAt`, `curveSlopeAt`, `secantSlopeOver` in `src/lib/evaluate.ts`) was read and used to
independently recompute the value each widget's `successFeedback` claims.

**Decisions: 3 REVISE, 13 KEEP, 0 ESCALATE.**

The course's mathematics is unusually clean: across 16 lessons and roughly 90 authored
numeric/mcq/buildExpression items, only one arithmetic/feedback-truth defect was found (in
fna-01-03), and it is narrowly scoped to a single interactive step's success message, not the
graded check that follows it. The other two REVISE lessons share one root cause: a course
reordering (chapter 6, "Comparing Representations," was appended after chapter 5, "Inverses
Formalized") left two lessons' `recap` teasers pointing at the wrong "next" content — one lesson
falsely declares the course complete, and the actual final lesson's teaser points backward at
material the learner already finished.

## Finding 1 — math/feedback-truth defect: fna-01-03 `i1` narrates a different problem than the one drawn

`i1`'s `secantSlope` widget is `curve:"square"` (i.e. y = x², via `curveAt`/`secantSlopeOver` in
`src/lib/evaluate.ts`), `a:0`, `targetH:6`, with no `shiftX`/`shiftY` (so both are 0). The
widget's actual computed secant slope is `(curveAt(6) − curveAt(0)) / 6 = (36 − 0) / 6 = +6`, a
**rising** interval on an increasing curve. But the step's `successFeedback` narrates a wholly
different, fabricated scenario: *"a tank going from 48 to 12 gallons over 6 minutes changes at
(12 − 48)/6 = −6 gallons per minute."* The sign is flipped (−6 claimed vs. +6 actual) and the
numbers (48, 12) correspond to no computation the widget performs. A learner who builds the
interval correctly and reads the true value (rise 36, run 6, slope 6) is told a false, negative
story about draining. This is the single clearest violation of "feedback must be literally true
of the drawn problem" found in the course; every other step in this lesson (k1=300, k2, k3, ch1=
−2, the remedial=15) was independently verified correct.

## Finding 2 — lesson-progression defect: two teasers disagree with the actual course order

`course.json`'s `chapters` array places `ch6-comparing-representations` (lesson `fna-06-01`,
the only lesson in that chapter) **after** `ch5-inverses-formalized` (lessons `fna-05-01`
through `fna-05-03`). `src/lib/content.server.ts` iterates chapters in exactly this declared
order to build the course's flattened lesson sequence, so `fna-06-01` is unambiguously the
course's actual final lesson.

Two teasers contradict that:

- `fna-05-03` `r1.teaser`: *"Course complete — next course: polynomial and rational functions
  under the analysis microscope."* This is false — one more lesson (`fna-06-01`) remains.
- `fna-06-01` `r1.teaser`: *"next chapter: restricting a domain to build an inverse."* That
  description matches `fna-05-02` ("Restricting the Domain"), content the learner already
  completed two lessons earlier. As the actual final lesson, `fna-06-01`'s own teaser points
  backward at already-taught material instead of forward or toward course completion.

The pattern (a "course complete" claim followed immediately by a lesson whose own teaser is
orphaned mid-course) is best explained by chapter 6 having been appended to the course after
chapters 1–5 were finalized, without updating the two teasers that bracket the seam. This is a
lesson-sequencing/narrative-truth defect, not a mathematical-content defect: every computed value
in both lessons was independently verified correct (see per-lesson table below).

## Per-lesson verdicts

| Lesson | Decision | Key reason |
|---|---|---|
| fna-01-01 | KEEP | All AROC computations and commonErrors verified correct |
| fna-01-02 | KEEP | All secant-slope computations verified correct |
| fna-01-03 | REVISE | `i1` successFeedback narrates a fabricated, wrong-sign tank scenario that doesn't match the widget's actual y=x² computation (+6, not −6) |
| fna-02-01 | KEEP | Increasing/decreasing intervals and secant widget verified correct |
| fna-02-02 | KEEP | Extrema (local/absolute, value vs. location) verified correct |
| fna-02-03 | KEEP | Range-from-extrema reasoning verified correct |
| fna-03-01 | KEEP | Even/odd classifications verified by direct substitution |
| fna-03-02 | KEEP | Piecewise evaluations and boundary logic verified correct |
| fna-03-03 | KEEP | Absolute-value/step-function evaluations verified correct |
| fna-04-01 | KEEP | All composition-order evaluations verified correct |
| fna-04-02 | KEEP | Domain-of-composition checkpoints verified correct |
| fna-04-03 | KEEP | Decomposition/modeling evaluations verified correct |
| fna-05-01 | KEEP | One-to-one/horizontal-line-test reasoning verified correct |
| fna-05-02 | KEEP | Restricted-domain inverse evaluations verified correct |
| fna-05-03 | REVISE | Recap teaser falsely declares "Course complete" — chapter 6 (fna-06-01) still follows |
| fna-06-01 | REVISE | Recap teaser points backward at ch5 content already taught; orphaned relative to this lesson's actual final-lesson position |

## Implementation contracts for each REVISE

**fna-01-03 — fix the mismatched `i1` successFeedback (content-owned, single-step fix):**
Replace the fabricated tank narrative with feedback describing the actual drawn problem. The
widget computes rise `curveAt(6) − curveAt(0) = 36`, run `6`, slope `+6` on y = x². Recommended
replacement in the spirit of the lesson's other steps (which correctly connect the abstract
secant to a real-rate story): keep the water/rate framing from step `c1` but use numbers that
actually match a **positive**, **6**-per-unit rate consistent with what the widget shows, or —
more simply and more robustly against future widget-parameter changes — describe the interval
generically ("Rise 36 over run 6 = 6. Even though this abstract curve is rising, the same
division — output change over input change — is what would give you gallons-per-minute if this
were a tank's fill curve.") Do not reuse the specific 48-to-12-gallons figures; they do not
correspond to any value this widget can produce with its current `a`/`targetH` parameters.

**fna-05-03, fna-06-01 — fix the mismatched recap teasers (content-owned, two-line fix):**
Either (a) keep `course.json`'s current chapter order and rewrite both teasers so they agree
with it — `fna-05-03`'s teaser should point forward to "comparing functions across
representations" (chapter 6) instead of declaring the course complete, and `fna-06-01`'s teaser
should declare the course complete (taking over the "next course: polynomial and rational
functions" line currently misplaced on `fna-05-03`) — or (b) if chapter 6 was always intended to
sit before chapter 5 in the pedagogical sequence, move `ch6-comparing-representations` earlier in
`course.json`'s `chapters` array (e.g., between chapter 4 and chapter 5) and re-verify every
teaser in chapters 4–6 against the new order. Given `fna-06-01`'s content (comparing rates,
values, and intercepts across representations) does not depend on inverses, either fix is
mathematically valid; this is a sequencing/editorial decision for a human curriculum owner, not
one this read-only assessment can make unilaterally.

## What could not be fully verified from static content

Per-widget accessibility (focus order, live-region behavior, keyboard interaction) was not
independently re-verified beyond confirming every referenced figure has a `<title>` and
`aria-label` in `src/components/figures.tsx` (spot-checked on `FnaCubicBehavior`, `FnaPiecewise`,
`FnaHlt`) — a full runtime accessibility audit would require rendering, which is out of scope
for a read-only content assessor. `mcq` widgets in this course are seeded-shuffled at render
time per the known engineering context, so authored correct-first option order (observed
throughout, e.g. essentially every `mcq` in this course) is not itself a defect. The course uses
no `proportionalReasoningLab`/`percentChangeLab` widgets, so the known unshuffled-choice-surface
issue in those two widget types does not apply here. Standards evidence (`F-IF.C.9`, declared
only on `fna-06-01`) was noted but not independently re-derived against official standards text,
consistent with "standards evidence remains candidate-only" in the packet's authority contract.
