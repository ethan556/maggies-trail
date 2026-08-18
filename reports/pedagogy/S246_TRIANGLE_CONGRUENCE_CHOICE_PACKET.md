# S246 Triangle-Congruence Choice-Surface Packet

## Scope

- Course: `g10-triangle-congruence` (`content/courses/triangle-congruence`)
- Reported rows: 10 authored MCQs in 9 lessons
- Changed fields: option labels only
- Preserved: prompts, stable option IDs, correct markers, misconception-specific feedback, generator bindings, and standards intent

## Deterministic before/after evidence

The leakage rule is the existing audit condition: the correct option is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Reported rows | 10 | 10 |
| Leaking rows | 10 | 0 |
| Mean option-length spread | 48.7 | 7.1 |
| Maximum option-length spread | 67 | 12 |
| Mean correct-vs-distractor skew | 41.4 | 2.63 |
| Maximum correct-vs-distractor skew | 54.33 | 5.33 |

## Construction contract

- Labels now state only the selectable claim or named theorem.
- Explanatory rationale remains in feedback, where it cannot signal the answer before selection.
- Options use parallel grammatical forms: theorem names, relation statements, circle descriptions, or median/altitude comparisons.
- Every row retains four distinct choices and exactly one defensible correct answer.
- Stable IDs remain `o1`–`o4`; runtime shuffling therefore changes position without changing grading truth.

## Ratchet and shared-artifact note

`src/lib/session246.triangleCongruenceChoiceIntegrity.test.ts` seals the exact 10-row target, parity metrics, one-answer truth, feedback agreement, stable IDs, and seeded-shuffle grading.

Global MCQ indexes, queues, cards, caches, and consolidated evidence were intentionally not regenerated. Root must rebuild those shared deterministic artifacts after all active content lanes finish.
