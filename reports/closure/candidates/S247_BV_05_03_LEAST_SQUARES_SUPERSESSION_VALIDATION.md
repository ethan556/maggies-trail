# S247 `bv-05-03` least-squares supersession validation

Status: **PASS — the authoritative current decision is `REVISE / REQUIRED / FIT`.** The S247 superseding record is already appended. This validator is read-only and does not append records or regenerate queue, cards, or cache.

## Independent mathematical result

For `(1,3), (2,6), (3,7), (4,9)`, `x̄ = 2.5`, `ȳ = 6.25`, `Sxx = 5`, and `Sxy = 9.5`. Therefore the ordinary least-squares slope is `1.9` and the intercept is `1.5`.

The fitted predictions are `3.4, 5.3, 7.2, 9.1`; residuals are `−0.4, +0.7, −0.2, −0.1`. Their signed sum is `0`, SSE is `0.16 + 0.49 + 0.04 + 0.01 = 0.70`, and MSE is `0.175`.

Raising the intercept by `0.7` gives residuals `−1.1, 0, −0.9, −0.8`; the four squared contributions are `1.21, 0, 0.81, 0.64`, so shifted SSE is exactly `2.66`. This independently confirms every numeric claim added by the repair.

## Evaluator and control lattice

The actual `scatterFit` evaluator scores MSE against `tolerance`. Exhaustive enumeration of the authored `0.1 × 0.1` slope/intercept lattice finds exactly one accepted state: `(m,b) = (1.9,1.5)` with MSE `0.175 ≤ 0.176`. The nearest rejected state has MSE `0.185`; the threshold therefore does not admit a second lattice answer. Both keyboard sliders can select the accepted coordinates exactly, while direct manipulation snaps to the same lattice.

The focused S247 regression and the bivariate choice-integrity suite pass: 2 files, 8 tests. The test imports the real evaluator, independently derives OLS, enumerates the full authored lattice, and ratchets the signed-sum and shifted-SSE feedback.

## Language and choice construction

The false claims that `ŷ = 2x + 1` is optimal, that a residual sum of `+1` is balanced, and that exact collinearity implies invented data are gone. The concept, interaction prompt, k1, k2, explanations, and recap distinguish signed residual sum from SSE accurately.

The scored stems are natural and specific. `k2` names the `0.7` shift, the point hit, and the requested quantity. Its option labels are parallel action/consequence statements. `ch1` uses parallel yes/no claims. `k3` has a short distractor, but evaluator truth is clear and the course-level choice test reports no correctness leakage; this is not an escalation. Prediction options are ungraded prior-knowledge elicitation.

## Why the result is `REVISE`, not `KEEP`

The repair clears the prior mathematical release blocker, but a bounded shared-widget debt remains:

- the renderer computes MSE and displays `miss = 0.18`, while the lesson consistently teaches and reports SSE `0.70`; the quantities rank lines identically for four fixed points, but the unnamed scale change is learner-visible;
- the SVG `aria-label` announces only the current line equation, and `describeState` gives only the first/last data points plus slope/intercept; neither communicates the residual whiskers, residual values, or scored MSE/SSE metric to a nonvisual learner;
- slider labels, keyboard operation, numeric axes, residual whiskers, and the reduced-motion guard are present and consistent, so this is implementation debt suitable for `REVISE / REQUIRED`, not a continuing `ESCALATE`.

The superseding record is sealed to live review basis `f83a2f830c2e5527ac68ef305bf7c2044581b4e7f7cd821f79c8f282d49ff7f2`. The BV supersession is immutable append checkpoint `141`; the live ledger may contain later valid append-only records, with zero duplicate record IDs and zero invalid or unknown records. `S247-BV-bv-05-03-OLS-SUPERSESSION` resolves `CURRENT_HUMAN_DECISION` at that basis and exactly matches the isolated candidate; the older `S246-BV-bv-05-03` `ESCALATE` remains preserved as stale history. No append simulation is performed, so validation cannot fail merely because the current record already exists.

## Reproduction

```text
node reports/closure/candidates/validate-s247-bv-05-03-least-squares-supersession.mjs
pnpm exec vitest run src/lib/session247.bivariateLeastSquaresTruth.test.ts src/lib/session246.bivariateStatisticsChoiceIntegrity.test.ts --pool=threads --maxWorkers=1
```
