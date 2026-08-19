# S259 mult-fluency-g3 four-figure cleanup

## Result

The final four registered-figure gaps in `mult-fluency-g3` are closed with exact semantic representations:

| Placement | Figure | Mathematical message |
| --- | --- | --- |
| `mf3-02-03/c1` | `mult3-times-ten-place-value` | 7 ones multiplied by 10 become 7 tens; `7 × 10 = 70` |
| `mf3-02-03/c2` | `mult3-times-ten-empty-ones` | `70` contains 7 tens and 0 ones; zero records the empty ones place |
| `mf3-02-04/c1` | `mult3-square-array` | equal 3-row and 3-column side counts make a square array with 9 tiles |
| `mf3-02-04/c2` | `mult3-next-square-growth` | a 3×3 square grows to 4×4 by adding a row of 4 and a column of 3; `9 + 7 = 16` |

Each figure has visible labels, an accessible image role and title, and visible/accessible quantities in agreement. The lesson bodies and narrations remain exactly equal. The next-square figure explicitly avoids double-counting the new corner.

`src/components/figureIds.ts` was regenerated from the registry and now contains 1,970 IDs.

## Evidence

- Focused lesson/semantic/collision suites: 3 files, 23 tests passed.
- Four new figure bindings, four accessibility/semantic assertions, four zero-collision assertions, and the 16-tile next-square count ratchet all pass.
- Full content schema: 1,840/1,840 files clean.
- Visual-explanation coverage: 3,684/3,684 concept steps, 100%.
- Figure registration: files, course manifests, and plans consistent.
- Figure/text alignment audit completed: 3,901 uses; 368 fixed exemplars; 11 rendered fixed; 357 suppressed.

The global render/collision sweep currently reports unrelated concurrent `word-problems-g3` defects: a 9-unit label in `g3w-share-then-add` and two label collisions in `g3w-relevant-information`. All four figures in this packet pass the same render-size and collision helpers in the focused ratchet.

## Residual alignment inventory

The aggregate `mult-fluency-g3` test now records three pre-existing alignment-suppressed placements outside this four-gap packet: `mf3-02-02/c2`, `mf3-02-05/c1`, and `mf3-03-02/c1`. They remain registered placements but are withheld by current figure/text alignment authority. This packet does not relabel them as repaired.

## Files

- `content/courses/mult-fluency-g3/lessons/mf3-02-03.json`
- `content/courses/mult-fluency-g3/lessons/mf3-02-04.json`
- `src/components/figures.tsx`
- `src/components/figureIds.ts` (generated)
- `src/components/multFluencyConceptFigures.s259.test.tsx`
- `src/lib/session248.multFluencyG3CourseIntegrity.test.ts`
- `reports/pedagogy/S259_MULT_FLUENCY_G3_FOUR_FIGURE_CLEANUP.md`

No queue, card, cache, ledger, standards, candidate, commit, push, or deployment artifact was changed.
