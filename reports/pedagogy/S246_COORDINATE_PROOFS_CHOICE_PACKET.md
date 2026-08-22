# S246 Coordinate Proofs Choice-Surface Packet

## Scope

- Course: `coordinate-proofs`
- Queue-defined authored rows: 15 (`CHOICE-0045` through `CHOICE-0059`)
- Lessons changed: 11
- Source fields changed: option labels only
- Preserved: prompts, stable option IDs, correct markers, feedback, figures, generator bindings, grading, and standards intent
- Excluded by ownership: generated-form aliases in the shared queue; this packet does not edit generators or shared evidence

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined authored rows | 15 | 15 |
| Leaking rows | 15 | 0 |
| Mean option-length spread | 76.47 | 8.13 |
| Maximum option-length spread | 109 | 12 |
| Mean correct-vs-distractor skew | 69.02 | 3.89 |
| Maximum correct-vs-distractor skew | 105.67 | 9.33 |

## Construction improvements

- Moved calculations, proof chains, and causal explanations out of answer labels; the existing option-specific feedback retains every worked justification.
- Made each set parallel by answer job: classification, geometric criterion, line relationship, proof engine, intersection count, or locus position.
- Retained misconception-based distractors rather than padding sets with generic alternatives.
- Kept exactly one defensible answer and all original diagnostic feedback.
- Kept the labels concise enough to resist length cueing while preserving secondary-geometry vocabulary.

## Ratchet and gates

`src/lib/session246.coordinateProofsChoiceIntegrity.test.ts` seals the exact 15-row target, exact aggregate parity metrics, stable IDs, unique labels, evaluator truth, feedback routing, deterministic seeded shuffling, and schema/pedagogy validity for all 11 changed lessons.

- Focused integrity packet: PASS, 3/3 tests.
- Changed-lesson schema and pedagogy validation: PASS, 11/11 lessons.
- Typecheck: PASS.
- Strict causal lint: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.

The standalone whole-corpus `tsx` launcher could not start on this Windows runner because `uv_os_get_passwd` returned `ENOMEM`; this is an environment-launch failure before content loading, not a content finding. The focused Vitest gate invokes the same `Lesson` schema and `lintLesson` implementation directly against every changed lesson and passed.
