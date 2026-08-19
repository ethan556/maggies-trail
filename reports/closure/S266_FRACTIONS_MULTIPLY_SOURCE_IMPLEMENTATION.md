# S266 — Fractions Multiply source-local implementation

## Scope and ownership

- Course: `fractions-multiply` (13 clean lesson sources at start; no shared runtime, registry, queue, card, cache, ledger, or standards changes).
- Live queue baseline: 63 rows, including 14 P0 `ILLUSTRATION_REPLACEMENT` rows across nine lessons.
- This packet closes only source-verifiable numeric-visual mismatches. Lesson, visual, language, choice, and progression dispositions remain independent assessor work unless specifically repaired as a source contract.

## Exact P0 closure

All 14 P0 placements were fixed registered exemplars that contradicted their nearby authored numbers. No registered parameterised figure exactly represents those alternatives, so each binding is intentionally removed rather than showing a false visual:

| Lesson/step | Removed fixed exemplar | Authored learner mathematics |
| --- | --- | --- |
| `fm-01-02/c2` | `fm-add-unlike` | `1/6 + 1/2 = 2/3` |
| `fm-01-03/c1`, `c2` | `fm-subtract-unlike` | `5/6 − 1/3 = 1/2`; `7/10 − 1/5 = 1/2` |
| `fm-02-01/c1`, `c2` | `fm-groups` | `3 × 2/5 = 6/5`; `2 × 3/8 = 3/4`, `6 × 1/2 = 3` |
| `fm-02-02/c2` | `fm-fraction-of` | `2/3 of 12 = 8` |
| `fm-03-02/c1` | `fm-multiply-across` | `2/3 × 4/5 = 8/15` |
| `fm-03-03/c1`, `c2` | `fm-cancel` | `4/9 × 3/8 = 1/6` |
| `fm-05-01/c1`, `c2` | `fm-divide-unit` | `4 ÷ 1/2 = 8` |
| `fm-05-02/c1`, `c2` | `fm-unit-divide-whole` | `1/2 ÷ 3 = 1/6`; `1/2 ÷ 4 = 1/8` |
| `fm-05-03/c1` | `fm-divide-unit` | `1/2 ÷ 3 = 1/6`; `3 ÷ 1/4 = 12` |

Three independently exact bindings remain in place: `fm-01-02/c1`, `fm-02-02/c1`, and `fm-03-02/c2`. `fm-05-03/c2` is also retained because its fixed `1/3 ÷ 2 = 1/6` model is an accurate, non-conflicting illustration of that step's intentionally general split-one-piece principle. Evaluator IDs, answers, distractors, and feedback are unchanged.

## Evidence and residuals

- Guarded, idempotent repair: `scripts/session/s266-fractions-multiply-course-repair.mjs`.
- Aggregate regression: `src/lib/session266.fractionsMultiplyCourse.test.ts` proves all 14 bad bindings are absent, four exact controls remain, all 13 lesson IDs load, and each still has learner interaction.
- P0 source closures: **14/14** (14 truthful fail-closures; 0 fabricated replacement figures).
- Residual generic assessor-controlled rows: 13 lesson dispositions, 13 visual dispositions, 13 language reviews, 9 progression reviews, and 1 choice-surface review. No queue/ledger status is asserted or changed by this packet.
