# S246 Bivariate Statistics Choice-Surface Packet

## Scope

- Course: `bivariate-statistics`
- Queue-defined authored rows: 11 (`CHOICE-0008` through `CHOICE-0018`)
- Lessons changed: 6
- Primary source fields changed: option labels
- One mathematical correction: `bv-05-03/k2` now says raising the intercept raises the other predictions, matching the prompt and the resulting negative residuals
- Preserved: prompts, stable option IDs, correct markers, option feedback, figures, generator bindings, grading, and standards intent
- Excluded by ownership: generated-form aliases and shared evidence

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined authored rows | 11 | 11 |
| Leaking rows | 11 | 0 |
| Mean option-length spread | 35.55 | 7.00 |
| Maximum option-length spread | 53 | 10 |
| Mean correct-vs-distractor skew | 31.52 | 4.68 |
| Maximum correct-vs-distractor skew | 52 | 8 |

## Construction improvements

- Made every set parallel by answer job: scatter-plot interpretation, model purpose, extrapolation diagnosis, association judgment, rate comparison, residual purpose, or fit-quality claim.
- Moved causal reasoning out of labels and retained it in the existing diagnostic feedback.
- Kept plausible misconception families, including outlier/cluster confusion, association-by-rate errors, extrapolation errors, and point-contact misconceptions.
- Preserved the authored three-option surfaces in the residual lessons and four-option surfaces elsewhere.
- Corrected the single direction error without changing the prompt, answer marker, or grading behavior.

## Ratchet and gates

`src/lib/session246.bivariateStatisticsChoiceIntegrity.test.ts` seals the exact 11-row target, exact aggregate parity metrics, per-item stable IDs, unique labels, evaluator truth, feedback routing, deterministic seeded shuffling, schema/pedagogy validity for all six changed lessons, and the corrected line-shift direction.

- Focused integrity packet: PASS, 4/4 tests.
- Changed-lesson schema and pedagogy validation: PASS, 6/6 lessons.
- Typecheck: PASS.
- Strict causal lint: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.

The standalone whole-corpus `tsx` launcher remains unable to start on this Windows runner because `uv_os_get_passwd` returns `ENOMEM` before content loading. The focused Vitest gate invokes the same `Lesson` schema and `lintLesson` implementation directly against every changed lesson and passed.
