# S246 Multiply Bigger Choice-Surface Packet

## Scope

- Course: `multiply-bigger`
- Queue-defined authored rows: 11 (`CHOICE-0177` through `CHOICE-0187`)
- Lessons changed: 9
- Source fields changed: option labels on all eleven surfaces and five question stems that benefited from simpler, more natural phrasing
- Preserved: stable option IDs, correct markers, option-specific feedback, figures, generator bindings, grading, explanations, and standards intent
- Excluded by ownership: generators and shared MCQ evidence

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined authored rows | 11 | 11 |
| Leaking rows | 11 | 0 |
| Mean option-length spread | 40.36 | 3.82 |
| Maximum option-length spread | 70 | 8 |
| Mean correct-vs-distractor skew | 35.33 | 1.73 |
| Maximum correct-vs-distractor skew | 61.67 | 4.00 |

## Construction improvements

- Replaced cue-bearing correct-answer explanations with short options that all perform the same answer job.
- Retained the mathematical reasoning in the existing post-commitment feedback and explanation variants.
- Kept plausible grade-appropriate misconception families: additive versus multiplicative comparison, factor tests, factor-pair stopping, classification of 1, place-value zeros, missing area-model rectangles, remainder constraints, and contextual rounding.
- Gave count answers consistent unit wording (`trips`) and kept factor/classification options deliberately spare where the stem already supplies the full context.
- Simplified five awkward or conversational stems without removing their mathematical evidence.
- Reviewed all eleven correct answers, feedback routes, and explanation variants. No learner-visible mathematical falsehood required correction.

## Ratchet and gates

`src/lib/session246.multiplyBiggerChoiceIntegrity.test.ts` seals the exact eleven-row target, revised stems, correct labels, aggregate parity metrics, stable IDs, evaluator truth, feedback routing, deterministic seeded shuffling, and schema/pedagogy validity for all nine changed lessons.

- Focused integrity packet: PASS, 3/3 tests.
- Whole-corpus schema: PASS, 1,840/1,840 files.
- Whole-corpus pedagogy: PASS, 1,711/1,711 files.
- Typecheck: PASS.
- Strict CML: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.
