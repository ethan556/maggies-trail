# Session 148 implementation report

## Breakthrough

Created `exactNumberLab`, a single normalized exact-number structure and order engine spanning seven lessons and 51 authored experiences. Forty-eight experiences were converted; three already-direct interactions were deliberately retained rather than replaced.

## Closed lessons

- `fa-02-02 — Fraction Benchmark Comparisons`
- `dop-01-02 — Grouping Symbols First`
- `ee-01-02 — Powers`
- `ee-05-01 — Inequalities`
- `rno-04-03 — Rational Operations`
- `rns-02-01 — Root Classification`
- `rns-02-03 — Root Density and Bracketing`

## Shared mathematical state

The engine normalizes integers and rationals exactly, represents roots as exact surd states with derived bounds, and derives ordering, equality, classification, grouping results, inequality membership, and density witnesses from that state. It supports:

- fraction comparison and benchmark-side decisions;
- grouping-symbol order and exact expression evaluation;
- power evaluation and comparison;
- strict and inclusive inequality membership and extremum claims;
- signed rational operations;
- perfect-square and irrational-root classification;
- root selection, listing, ordering, and bracketing;
- exact density witnesses between ordered values.

## Eight required surfaces

1. Plain `ZodObject` schema; cross-field validation remains in `widgetIntegrityErrors`.
2. Accessible renderer with exact stage labels and no color-only truth semantics.
3. Grading and `canCheck` derived from truth-approved exploration keys.
4. Correct-answer and learner-answer narration.
5. Misconception and wrong-path extraction.
6. CML catalog, mesh, kernel, and direct-manipulative routing.
7. Seeded generator wrappers plus an independent 27,648-case sweep.
8. Capability registry, samples, stage width, keyboard tests, and `gateOne` structural coverage.

## Retained direct interactions

The following already-appropriate direct interactions were preserved:

- `fa-02-02/i1` — `matchPairs`
- `fa-02-02/i2` — `dragBucket`
- `ee-05-01/i2` — `dragBucket`

## Failures found through execution

- Unicode `≤` and `≥` were not normalized by the inequality parser.
- The inequality parser assumed the variable was always `x`.
- Several semantic-choice forms carried numeric or relational truth rather than a claim string.
- Root select/list wrappers initially supplied no source values, making exploration impossible.
- A duplicate-source guard incorrectly rejected mathematically valid repeated operands such as `−7 × −7`.
- The historical Session 147 content proof assumed no later lesson changes and required an explicit Session 148 follow-through allowance.

Each defect was repaired before packaging; no authored prompt, answer, diagnostic feedback, variant declaration, ID, ordering, hint, explanation, prediction, or remedial mapping changed.
