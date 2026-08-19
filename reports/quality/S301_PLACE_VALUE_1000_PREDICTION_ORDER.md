# S301 — Place Value to 1,000 Grade 2 Prediction-Order Parity

## Source evidence

Fresh live source auditing found one learner-facing prediction block in each of the 12 clean `place-value-1000` lesson sources. All 12 have three stable option IDs and a stable `outcomeId`, yet 11 of the 12 authored arrays placed the outcome first; none placed it in the middle and one placed it last. This is a source-verifiable P1 choice/progression pattern in the course’s prediction-before-action loop.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `a9ca347d804b99a6366bdd104bed498861abe86ca8b65338463336bed4d1e5bc`.

## Repair

The 12 prediction option arrays are deterministically reordered so their existing `outcomeId` renders at index 1 or 2, six cases each. Stable option IDs, labels, outcome IDs, prompt wording, reveals, models, widgets, CML contracts, and all evaluator behavior remain unchanged. This is an authored-order-only repair; the player’s seeded display ordering and ID-based reveal lookup continue to operate unchanged.

`scripts/session/s301-place-value-1000-prediction-order-repair.mjs` accepts only the exact pre-repair order or the exact expected repaired order for each prediction and fails on source drift. It preserves all surrounding source whitespace.

The repaired source-set SHA-256 is `ba16f80f06729dd630def76fb8af3f7bcd9965495b95d9d58fe4dcd7f60799d1`.

## Boundaries

Only the 12 course lesson files, the guarded replay script, the focused regression, and this report change. Prediction and learner-job IDs, option and reveal wording, outcome semantics, evaluator behavior, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s301-place-value-1000-prediction-order-repair.mjs
node scripts/session/s301-place-value-1000-prediction-order-repair.mjs
pnpm exec vitest run src/lib/session301.placeValue1000PredictionOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/place-value-1000 scripts/session/s301-place-value-1000-prediction-order-repair.mjs src/lib/session301.placeValue1000PredictionOrder.test.ts reports/quality/S301_PLACE_VALUE_1000_PREDICTION_ORDER.md
```
