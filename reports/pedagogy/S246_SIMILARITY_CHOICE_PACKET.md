# S246 Similarity Choice-Surface Packet

## Scope

- Course: `similarity`
- Queue-defined rows: 17 authored MCQs across 11 lessons
- Source fields changed: option labels only
- Preserved: prompts, stable option IDs, correct markers, feedback, figures, generator bindings, grading, and standards intent

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined rows | 17 | 17 |
| Leaking rows | 17 | 0 |
| Mean option-length spread | 44.41 | 8.06 |
| Maximum option-length spread | 62 | 13 |
| Mean correct-vs-distractor skew | 38.29 | 4.24 |
| Maximum correct-vs-distractor skew | 58 | 11.33 |

## Construction improvements

- Moved causal reasoning and worked ratio calculations out of answer labels; the existing post-selection feedback retains those explanations.
- Made every option set parallel by answer job: theorem criterion, similarity relationship, proportionality conclusion, angle correspondence, triangle classification, or geometric-mean product.
- Kept plausible misconception families rather than padding sets with generic alternatives.
- Kept the options concise enough to resist visual cueing while retaining the vocabulary expected in a secondary geometry course.
- Preserved exactly one defensible answer and the original misconception-specific feedback for every choice.

## Ratchet and gates

`src/lib/session246.similarityChoiceIntegrity.test.ts` seals the exact 17-row target, length/parity metrics, stable IDs, unique labels, evaluator truth, feedback routing, and deterministic seeded shuffling.

- Focused choice-integrity packet: PASS, 2/2 tests.
- Schema/content test: PASS.
- Typecheck: PASS.
- Strict causal lint: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.

The shared evidence was regenerated once after both completed packets. The choice queue fell from 566 to 546 rows: the 17 authored Similarity rows above plus three generated Integration rows whose small authored banks were replaced by the `in-03`/`in-04` freshness work. No new choice row appeared. The total V4 queue fell from 14,725 to 14,705.

The MCQ evidence now binds both the base commit and a hash of the 1,965 actual authored/generator input files, so a dirty-worktree audit no longer masquerades as HEAD-only evidence. The MCQ index, queue, lesson cards, and cache reproduced with zero hash differences on a second complete generation pass.
