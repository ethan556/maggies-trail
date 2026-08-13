# Session 130 — Fixed-grid counting

## Result

- **Engine extension:** areaModel fixed-grid counting mode.
- **Converted experiences:** 16.
- **Lessons:** ssg2-02-02, ssg2-02-03; each C22 → **B29** (B28 at s130 sealing; areaModel adapt capability later raised).
- **Reviewed K–8 queue:** 61 → **0**, zero unreviewed.
- **Product tiers:** A 1190 · B 457 · C 54 · D 0.

## Independently derived grids

| lesson | experience | fixed grid | answer | preserved misconception counts |
|---|---|---:|---:|---|
| ssg2-02-02 | i1 | 5 × 5 | 25 | 10, 5 |
| ssg2-02-02 | k1 | 7 × 2 | 14 | 9, 7 |
| ssg2-02-02 | i2 | 2 × 7 | 14 | 9, 2 |
| ssg2-02-02 | i3 | 6 × 6 | 36 | 12, 6 |
| ssg2-02-02 | k2 | 3 × 7 | 21 | 10, 7 |
| ssg2-02-02 | k3 | 8 × 3 | 24 | 11, 3 |
| ssg2-02-02 | ch1 | 7 × 7 | 49 | 14, 7 |
| ssg2-02-02 | remedial | 5 × 5 | 25 | 10, 5 |
| ssg2-02-03 | i1 | 4 × 6 | 24 | 10, 6 |
| ssg2-02-03 | k1 | 3 × 3 | 9 | 6, 3 |
| ssg2-02-03 | i2 | 8 × 8 | 64 | 16, 8 |
| ssg2-02-03 | i3 | 4 × 5 | 20 | 9, 5 |
| ssg2-02-03 | k2 | 5 × 4 | 20 | 9, 4 |
| ssg2-02-03 | k3 | 6 × 3 | 18 | 9, 3 |
| ssg2-02-03 | ch1 | 9 × 4 | 36 | 13, 4 |
| ssg2-02-03 | remedial | 4 × 6 | 24 | 10, 6 |

## Breakthrough interaction

The engine now separates **reading a given array** from **constructing a factor pair**. The grid is fixed and visible. The learner marks counted cells using reversible +1, next-row, −1, and reset controls; the dimensions never move. This makes row grouping causal while preserving every authored addition and one-row misconception as an exact reachable state.

## Adversarial contract

- given rows and columns are visible before interaction
- the learner marks counted squares; dimensions never resize
- every authored numeric wrong path is reachable as an exact count
- practice variants preserve the areaModel surface
- row grouping accelerates counting without auto-solving
- reveal ghosts the complete grid without replacing learner work

## Frozen-content ledger

Two lesson JSON files changed under the broken-representation and broken-remedial-interaction exceptions: 16 widget nodes and 8 variant-form declarations. Every other authored surface is hash-proved unchanged in `SESSION130_CONTENT_CHANGE_LEDGER.json`.
