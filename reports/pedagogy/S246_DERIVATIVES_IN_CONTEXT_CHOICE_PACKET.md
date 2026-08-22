# S246 Derivatives in Context Choice-Surface Packet

## Scope

- Course: `derivatives-in-context`
- Queue-defined authored rows: 11 (`CHOICE-0034` through `CHOICE-0044`)
- Lessons changed: 8
- Primary source fields changed: option labels
- Preserved: prompts, stable option IDs, correct markers, option feedback, figures, generator bindings, grading, explanations, and standards intent
- Excluded by ownership: generated-form aliases and shared evidence

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined authored rows | 11 | 11 |
| Leaking rows | 11 | 0 |
| Mean option-length spread | 63.18 | 3.91 |
| Maximum option-length spread | 100 | 9 |
| Mean correct-vs-distractor skew | 54.06 | 2.36 |
| Maximum correct-vs-distractor skew | 92.67 | 6.67 |

## Construction improvements

- Made each set parallel by answer job: motion state, related-rate setup, geometric relation, relative error, linearisation reliability, differentiability, or limit method.
- Moved answer reasoning out of visible labels while retaining it in the existing option-specific diagnostic feedback and post-answer explanations.
- Kept concise, plausible misconception choices instead of padding distractors merely to match length.
- Preserved the exact four-option shape, IDs, correct markers, and evaluator behavior on every surface.
- Reviewed all eleven stems, correct answers, explanations, and feedback routes. No learner-visible mathematical falsehood required correction in this family.

## Ratchet and gates

`src/lib/session246.derivativesInContextChoiceIntegrity.test.ts` seals the exact eleven-row target, exact aggregate parity metrics, correct mathematical labels, stable IDs, unique labels, evaluator truth, feedback routing, deterministic seeded shuffling, and schema/pedagogy validity for all eight changed lessons.

- Focused integrity packet: PASS, 3/3 tests.
- Changed-lesson schema and pedagogy validation: PASS, 8/8 lessons.
- Typecheck: PASS.
- Strict causal lint: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.

The focused Vitest gate invokes the production `Lesson` schema and `lintLesson` implementation directly against every changed lesson. The independently bootstrapped whole-corpus checks also passed at 1,840/1,840 schema files and 1,711/1,711 pedagogy files.
