# S246 Data Distributions Choice-Surface Packet

## Scope

- Course: `data-distributions`
- Queue-defined rows: 14 authored MCQs across 9 lessons
- Findings entering the packet: 13 correct-answer length clues and one unit-parity clue
- Source fields changed: option labels only
- Preserved: prompts, stable IDs, correct markers, feedback, grading, figures, and generator bindings

## Repair

- Recast every set as one parallel response job: statistical/non-statistical classification, display choice, distribution shape, outlier role, box-plot comparison, or two-number report.
- Removed explanations and worked reasoning from the correct option while retaining the existing misconception-specific feedback after selection.
- Replaced terse dot-plot distractors with equally readable descriptions that still represent the original mistakes: ignoring stack frequency or treating counts as data values.
- Put `hours` on every option in the two-number report so units cannot identify the answer.
- Kept three strong, mutually exclusive choices rather than padding the sets.

## Deterministic evidence

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined findings | 14 | 0 |
| Correct-answer length clues | 13 | 0 |
| Unit-parity clues | 1 | 0 |
| Mean option-length spread | not used as an acceptance shortcut | 5.07 |
| Maximum option-length spread | 71 | 9 |
| Mean correct-vs-distractor skew | not used as an acceptance shortcut | 3.54 |
| Maximum correct-vs-distractor skew | 70 | 8 |

`src/lib/session246.dataDistributionsChoiceIntegrity.test.ts` seals the exact 14 targets, one defensible answer, stable IDs, label uniqueness, option parity, unit parity, evaluator truth, feedback routing, and deterministic shuffling.

Focused tests, typecheck, strict causal lint, targeted lint, and scoped diff validation pass. Shared MCQ, queue, card, and cache evidence is intentionally regenerated once after the entire concurrent cohort lands.
