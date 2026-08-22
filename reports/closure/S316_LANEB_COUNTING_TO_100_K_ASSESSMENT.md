# S316 Lane B Independent Assessment — counting-to-100-k

Reviewer: Claude Cowork independent assessor (counting-to-100-k S316)
Reviewed: 2026-08-19T23:39:35.000Z
Scope: content/courses/counting-to-100-k/course.json and all 18 lessons in
content/courses/counting-to-100-k/lessons/. Read-only review; dispositions staged to
reports/closure/cowork-staging/laneB-counting-to-100-k-dispositions.jsonl.

## Course-level summary

18/18 lessons: **KEEP**. 0 REVISE. 0 ESCALATE.

This course (Math, gradeLevel 0 — Kindergarten "Counting to 100") is organized into three
chapters: Past Twenty (6 lessons), Counting by Tens (5 lessons), Starting Anywhere (7 lessons).
Every lesson follows the same nine-step shape (c1, i1, k1, c2, i2, k2, k3, ch1, r1) plus one
remedial route, and every lesson passed the quality bar on read-through:

- **Mathematical truth**: every numberLineHop, mcq, and dragOrder widget's stated answer,
  commonLandings/distractor values, and feedback are correct for the drawn numbers. Predict/
  reveal pairs (present in 8 of 18 lessons) all resolve to the mathematically correct outcome
  (e.g. k100-01-06/i1: 95 + 5 = 100 exactly, outcomeId "exact", not "yes"/pass).
- **Visual truth**: this course already underwent a prior repair session (S262,
  `src/lib/session262.countingTo100KCourseIntegrity.test.tsx`) that bound 26 concept-step
  figure placements to real, accessible SVG components (`FIGURES` in
  `src/components/figures.tsx`) and deliberately removed the figure from 9 placements where no
  synchronized visual could be produced (also stripping any visual-promising language from
  those steps' prose). I independently re-verified every one of the 26 bound figures by reading
  its component source: each renders `role="img"` + `<title>` with content that truthfully
  matches the concept step's body/narration (numbers, direction, highlighted row/column, etc.),
  and independently re-read all 9 residual (figure-less) placements to confirm their prose
  contains no unfulfilled visual promise ("the picture shows...", "the chart shows...", etc.).
  No mismatches found in either direction.
- **Distinct instructional jobs / traps**: every MCQ's distractors are computed from the drawn
  numbers and named in feedback (never bare "try again"); no trap collides with the correct
  answer or with another trap in any instance read. Correct-answer position across the course's
  31 MCQ instances is reasonably distributed (13/7/7/4 across positions 0-3) — not a fixed cue.
- **Variant generators**: all `variant.gen`/`variant.form` declarations resolve to real,
  pure-function generators (`k0-count-100` family in `src/lib/g0Variants.ts`, `sequence-order`
  in `src/lib/variants.ts`), each hard-capped at 100 and each producing traps structurally
  identical to the authored ones (same misconception, same feedback template, values
  substituted from the seed). `src/lib/session183.counting100k.test.ts` sweeps this generator
  specifically for this course.
- **Grade-appropriate language**: prose throughout is short, concrete, one idea per sentence,
  consistent with a Kindergarten read-aloud course. No derived-morphology artifacts, no spliced
  phrases, no dropped units observed.

## Per-lesson verdicts

| Lesson | Verdict | Notes |
|---|---|---|
| k100-01-01 Twenty-One and Beyond | KEEP | number-track (uniquely licensed) + c120-same-pattern figures truthful; predict correct. |
| k100-01-02 The Next Ten | KEEP | odometer-roll + c120-roll-ten figures truthful; decade-cross traps correct. |
| k100-01-03 Counting to Fifty | KEEP | chart-120 both concepts; before/after direction traps correct. |
| k100-01-04 Fifty to Seventy | KEEP | tno-move-tens-digit figure truthful for both concepts. |
| k100-01-05 Seventy to One Hundred | KEEP | kc-ten-hops-to-100 figure truthful; word-problem framing (Nia) consistent. |
| k100-01-06 All the Way to 100 | KEEP | c1 intentionally figure-less (no visual promise); landing-vs-passing 100 predict correct. |
| k100-02-01 Ten, Twenty, Thirty | KEEP | kc-by-tens figure truthful; tens-hop vs ones-hop predict correct. |
| k100-02-02 Tens All the Way to 100 | KEEP | kc-ten-hops-to-100 reused correctly; bundle word problems consistent. |
| k100-02-03 Rows of Ten on the Chart | KEEP | chart-120 (row/col) + chart-rows figures both truthful; row-below predict correct. |
| k100-02-04 Which Ten Comes Next? | KEEP | kc-ten-hops-to-100 figure truthful; next-ten predict correct. |
| k100-02-05 Counting Tens Backward | KEEP | tno-count-down-tens figure truthful; back-20 direction predict correct. |
| k100-03-01 Start at Seven | KEEP | c1/c2 intentionally figure-less, no visual promise; count-from-given traps correct. |
| k100-03-02 Start in the Middle | KEEP | figure-less by design; decade-crossing predict (34+4 stops at 38) correct. |
| k100-03-03 Pick Up Where It Stops | KEEP | chart-120 + c120-chart-row figures truthful; stop-before-50 predict correct. |
| k100-03-04 Counting On from Big Numbers | KEEP | figure-less by design; near-100 count-on traps correct. |
| k100-03-05 What Comes Next on the Chart? | KEEP | chart-rows + c120-chart-row figures truthful; exact-landing predict correct. |
| k100-03-06 Missing Numbers on the Chart | KEEP | c120-missing-order figure truthful across 4 placements; k3 correctly rebound to chart-120. |
| k100-03-07 Counting Backward from Twenty | KEEP | figure-less by design; backward dragOrder correctly inverted; direction predict correct. |

## P0 illustration findings

The task brief flagged 9 P0 queue rows for this course (ILLUSTRATION_REPLACEMENT among them).
On independent read-through, **no outstanding illustration defects were found**: the visual
repair implied by those P0 rows appears to have already landed and is now guarded by
`src/lib/session262.countingTo100KCourseIntegrity.test.tsx`, which:

- binds exactly 26 concept-step figure placements to real components and asserts each renders
  `<title>` + `role="img"` text-aligned with the step's body/narration (verified independently
  by reading the figure component source for every one of the 26 placements, not just trusting
  the test);
- asserts exactly 9 concept-step placements are figure-less residuals (`k100-01-06/c1`,
  `k100-03-01/c1,c2`, `k100-03-02/c1,c2`, `k100-03-04/c1,c2`, `k100-03-07/c1,c2`) — I confirmed
  none of these 9 steps' prose promises a picture, so no REVISE is warranted for missing
  visuals;
- asserts no c1/c2 outside `k100-01-01/c1` uses the generic `number-track` figure (guards
  against the kind of one-size-fits-all placeholder that a P0 illustration-replacement row would
  flag).

No REVISE items were generated by this review; no further illustration work is required for
this course under the current source hashes. If content bytes change, dispositions reopen per
`reopenCondition`.

## Implementation contracts for REVISE lessons

None. 0 lessons required REVISE.
