# REUSE_WAVE_S128 — proof-carrying exact-fit reuse

## Result

- 2 lessons converted; 4 interactive steps.
- K–8 reviewed C/D backlog at Session 128 close: 64 → 62. Current live queue: 0.
- Tier movement: B +2; C -2.
- 3 apparent reuse candidates rejected before mutation.

## Shipped exact fits

| lesson | step | engine | derived answer | preserved wrong placements |
|---|---|---|---:|---|
| mmt-01-02 | i1 | unitRuler | 6 | 10, 14 |
| mmt-01-02 | i2 | unitRuler | 5 | 6, 7 |
| mmt-01-02 | i3 | unitRuler | 8 | 11, 14 |
| mmt-01-03 | i2 | unitRuler | 7 | 0, 8 |

The unitRuler engine now accepts optional named `commonPlacements`, validates its physical invariant, keeps all named errors reachable on the 0–20 ruler, and supports reversible add/remove controls.

## Rejected apparent reuses

1. **mmt-02-01 → estimateSlider: EXTEND.** estimateSlider grades a continuous multiplicative acceptance interval; the authored task compares three discrete candidates. Reuse would change the assessed action and answer set.

2. **dop-01-02 → evalOrder: BUILD.** With tokens ( 2 + 3 ) × 4, evalOrder permits only the parenthesized + before ×; its reachable final set is {20}. Authored wrong results 14 and 24 are unreachable.

3. **rr-03-03 → covariationScrubber / doubleNumberLine: BUILD.** covariationScrubber asks the learner to set the already-given input; doubleNumberLine/ratioTable expose only low/high feedback and merge distinct authored misconceptions.

## Content-change ledger

Four widget specifications in two lesson files changed. Prompts, bodies, IDs, order, hints, explanations, concept tags, variants, answers, and all non-target steps are hash-proved unchanged. Existing misconception feedback was preserved verbatim inside reachable engine states.
