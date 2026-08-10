# Maggie's Trail — Session 130 execution report

## Executive result

Session 130 completed the two-lesson fixed-grid reading cluster without converting the task into factor construction. `areaModel` now has a distinct `countGrid` mode for arrays whose rows and columns are authored givens. Sixteen static, check, challenge, and remedial experiences across `ssg2-02-02/03` now draw the object the learner is asked to count.

## Measured movement

| measure | Session 129 input | Session 130 close |
|---|---:|---:|
| Tier A | 608 | 608 |
| Tier B | 204 | 206 |
| Tier C | 289 | 287 |
| Tier D | 28 | 28 |
| reviewed K–8 queue | 61 | 59 |
| unreviewed queue rows | 0 | 0 |
| engine registry | 106 | 106 |
| `describeState` coverage | 59 | 60 |

- `ssg2-02-02`: **C22 → B28**.
- `ssg2-02-03`: **C22 → B28**.
- Tier B is intentional. Prediction would repeat an array count explicitly established by the preceding instruction instead of creating a prediction–experiment cycle.

## Implemented interaction

- Fixed rows and columns are rendered before learner action.
- Learner-controlled sky marks show counted squares.
- `+1 square`, `Count next row`, `−1 square`, and `Reset` provide reversible counting.
- The target does not resize and is not answer-leaked before reveal.
- Reveal preserves learner work and ghosts only remaining cells with tangerine dashed outlines.
- Every authored rows+columns and one-row/one-column wrong path is reachable as an exact count.
- Screen-reader state names rows, columns, and counted total.
- Native buttons retain 44px targets.

## Variant integrity breakthrough

Eight variant-bearing checks now use dedicated read forms: `read`, `colTrapRead`, `squareRead`, and `Ssg2GridApplyRead`. The G2 generator uses a bounded reachable-trap builder rather than the generic numeric fallback. A 384-draw support/core/stretch test sweep protects the 2×2 collision where rows+columns equals the correct product and a generic `answer + d` replacement would exceed the visible grid.

## Authored-content ledger

Two lesson JSON files changed under the charter's broken-representation, broken-remedial-interaction, and variant-surface-continuity exceptions:

- 16 widget nodes changed from numeric entry to fixed-grid `areaModel`.
- 8 variant form declarations changed to preserve the same engine during deterministic regeneration.
- 1,127 non-target lesson files remain byte-identical to Session 129.
- Prompts, bodies, IDs, ordering, answers, hints, explanations, concept tags, remedial mappings, and non-target surfaces in both changed files are hash-proved unchanged.

See `SESSION130_CONTENT_CHANGE_LEDGER.json`.

## Test delta

- New declarations: **8 tests in 2 files**.
- `src/lib/session130.grid-read.test.ts`: 5 mathematical, integrity, evaluator, and deterministic-variant tests.
- `src/components/widgets.gridRead.s130.test.tsx`: 3 jsdom interaction and reveal-preservation tests.
- Last exact-lock certified runtime: 10,092 tests / 162 files from Session 125.
- Projected declarations after Sessions 128–130: **10,113**, pending exact-lock execution.

## Adversarial result

The implementation rejects resizable grids, mismatched products, duplicate/correct/out-of-grid misconceptions, premature checking, numeric fallback variants, generic feedback substitution, non-reversible controls, reveal replacement, and non-target lesson mutation. Full matrix: `SESSION130_MUTATION_MATRIX.md`.

## Verification status

All dependency-free source, content, generated-state, registration, native-integrity, hash, tidy, identity, and package-rehearsal gates passed. Exact-lock installation is externally blocked at the unchanged registry/Node prerequisites; runtime-backed TypeScript, Vitest, content/pedagogy validation, ESLint, build, Playwright, and screenshots are therefore blocked—not represented as passed. Full evidence: `SESSION130_GATE_EVIDENCE.md`.

## Diff scope

`SESSION130_DIFF_STATS.json` records 10 added and 36 modified non-recursive repository files, 3,181 additions, and 889 deletions. It excludes self-referential execution/gate/diff/artifact manifests and dependency/build outputs.

## Content statement

Authored lesson content changed only under the exceptions and exact boundaries documented above. No other authored lesson content was changed.
