# S300 — Tens and Ones Grade 1 Prediction-Order Parity

## Source evidence

Fresh live source auditing found one learner-facing prediction block in each of the 12 clean `tens-and-ones` lesson sources. All 12 have three stable option IDs and a stable `outcomeId`, yet 11 of the 12 authored arrays placed the outcome first; none placed it in the middle and one placed it last. This is a source-verifiable P1 choice/progression pattern in the course’s prediction-before-action loop.

The exact pre-repair source-set SHA-256 (the 12 lesson JSON files in sorted filename order) was `9519c8e57ac5822f8aeefba197d9829792c1eef30d63e6a7138ecef737ace1d3`.

## Repair

The 12 prediction option arrays are deterministically reordered so their existing `outcomeId` renders at index 1 or 2, six cases each. Stable option IDs, labels, outcome IDs, prompt wording, reveals, models, widgets, CML contracts, and all evaluator behavior remain unchanged. This is an authored-order-only repair; the player’s seeded display ordering and ID-based reveal lookup continue to operate unchanged.

`scripts/session/s300-tens-and-ones-prediction-order-repair.mjs` accepts only the exact pre-repair order or the exact expected repaired order for each prediction and fails on source drift. It preserves all surrounding source whitespace.

The repaired source-set SHA-256 is `cafe962e37bcd30741f869ebf5b696fef1bf45595f43d08d0975f2b118a0e9f1`.

## Boundaries

Only the 12 course lesson files, the guarded replay script, the focused regression, and this report change. Prediction and learner-job IDs, option and reveal wording, outcome semantics, evaluator behavior, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s300-tens-and-ones-prediction-order-repair.mjs
node scripts/session/s300-tens-and-ones-prediction-order-repair.mjs
pnpm exec vitest run src/lib/session300.tensAndOnesPredictionOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/tens-and-ones scripts/session/s300-tens-and-ones-prediction-order-repair.mjs src/lib/session300.tensAndOnesPredictionOrder.test.ts reports/quality/S300_TENS_AND_ONES_PREDICTION_ORDER.md
```
