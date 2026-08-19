# S247 bivariate least-squares truth repair

## Scope

This packet repairs the release-blocking mathematical disagreement in `bivariate-statistics/bv-05-03` only. It changes the learner-facing lesson and adds a prompt-independent mathematical regression. It does not close the lesson disposition, regenerate shared evidence, or alter the shared `scatterFit` evaluator.

## Defect reproduced

For the authored points `(1,3), (2,6), (3,7), (4,9)`, the lesson called `ŷ = 2x + 1` optimal. That line has residuals `0, +1, 0, 0`, signed sum `+1`, and squared-residual sum `1.00`. The actual ordinary least-squares line with an intercept is:

- slope `m = 1.9`;
- intercept `b = 1.5`;
- residuals `−0.4, +0.7, −0.2, −0.1`;
- signed sum `0`;
- squared-residual sum `0.70`.

The previous success feedback, prediction reveal, balance check, line-shift comparison and recap therefore disagreed with the evaluator's stated least-squares purpose.

## Repair

- The `scatterFit` lattice now represents the exact optimum with `mStep = 0.1` and `bStep = 0.1`.
- The threshold is `0.176` mean squared residual, making `(1.9, 1.5)` the only accepted lattice state.
- Success feedback, residual arithmetic and explanations use the independently derived residuals and distinguish signed balance from the least-squares objective.
- The line-shift question now compares squared-residual totals: raising the intercept by `0.7` increases the total from `0.70` to `2.66` despite creating one exact hit.
- The false claim that zero residuals imply invented data is removed. Exactly linear real or simulated observations can have zero residuals.
- The recap now states that a zero signed residual sum is a fitted-intercept property, not enough by itself to identify the best line.

## QA contract

`src/lib/session247.bivariateLeastSquaresTruth.test.ts` independently:

1. derives the ordinary least-squares slope and intercept from the printed points;
2. recomputes every residual, signed sum and squared sum;
3. enumerates the complete authored slider lattice and proves there is exactly one accepted state;
4. checks evaluator truth for the signed-sum and shift questions; and
5. rejects the prior invented-data and approximate-balance claims.

## Verification

- focused bivariate/new truth tests plus prior chapter regression: 3 files, 44 tests passed;
- canonical content and pedagogy tests: 2 files, 19 tests passed;
- TypeScript typecheck: passed;
- strict CML: 0 errors, 0 warnings;
- targeted ESLint: passed;
- diff check: passed, with only the repository's line-ending notice.

Independent semantic reassessment and serial queue/card/cache reconciliation remain required before the `ESCALATE` disposition can be superseded.
