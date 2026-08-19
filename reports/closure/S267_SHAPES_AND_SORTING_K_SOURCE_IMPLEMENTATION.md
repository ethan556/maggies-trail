# S267 — Shapes & Sorting K source-local implementation

## Scope

- Clean source boundary: `shapes-and-sorting-k` only; 9 lessons.
- Live queue baseline: 34 rows, including 7 P0 `QUESTION_DIVERSITY_AND_TRANSFER` rows across seven lessons.
- No shared runtime, figure registry, queue, card, cache, ledger, or standards files changed.

## P0 closure

Each flagged `ch1` now has a distinct challenge action and a transfer/formal-classification job, instead of another version of its existing check surface:

| Lesson | New challenge action | Learner job |
| --- | --- | --- |
| `ks-01-01` | MCQ | Preserve the name `hexagon` after a turn by using six sides. |
| `ks-01-02` | Match pairs | Name square, circle, and triangle despite turning or size. |
| `ks-01-03` | Drag buckets | Classify above/below/beside locations relative to one tree. |
| `ks-02-01` | MCQ | Identify a cone after its orientation changes. |
| `ks-02-03` | Drag buckets | Classify three shape-build recipes by finished form. |
| `ks-03-02` | Drag buckets | Infer heavier, lighter, or equal from seesaw clues. |
| `ks-03-03` | Match pairs | Apply a stated sorting rule to change an item's group. |

The seven source P0 causes are closed without new figures or shared-widget behavior. Stable lesson and step IDs are preserved; each MCQ has one correct option and every matching/sorting target is internally reachable.

## Evidence and residuals

- Guarded idempotent source repair: `scripts/session/s267-shapes-and-sorting-k-course-repair.mjs`.
- Aggregate regression: `src/lib/session267.shapesAndSortingKCourse.test.ts` checks all nine lesson sources, all seven new challenge types, and their answer contracts.
- P0 source closures: **7/7**.
- Residual independent assessor work: 9 lesson dispositions, 9 visual dispositions, 9 language reviews. Queue/ledger records remain untouched.
