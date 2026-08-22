# S266 — Decimal Operations source implementation

## Scope and disposition

- Course: `decimal-operations`; six clean lesson sources held the nine P0 illustration rows.
- P0 closure: **9/9** source-verifiable fixed-exemplar conflicts fail-closed.
- The six lesson sources retain every authored step ID, evaluator family, evaluator payload, option ID, correct answer, and feedback. Only the conflicting `figure` property was removed.
- P1 residual: 53 review rows remain intentionally untouched. No queue, review cards, cache, registry, runtime, or ledger was modified.

## Visual evidence

No exact registered figure exists for any of the learner-visible worked examples below. The prior figure was either a different numerical calculation or a different operation, so retaining it would give learners two incompatible examples.

| Lesson step | Removed figure | Authored evidence retained in copy |
| --- | --- | --- |
| `dop-02-02:c1` | `dop-standard-algo` | `47 × 6 = 282`, not the figure's `23 × 4 = 92` |
| `dop-02-02:c2` | `dop-standard-algo` | `35 × 4 = 140`, not `23 × 4 = 92` |
| `dop-02-03:c2` | `dop-two-by-two` | `23 × 40 = 920`, not the figure's four-part `23 × 45` example |
| `dop-03-01:c2` | `dop-estimate-quotient` | `356 ÷ 58 ≈ 360 ÷ 60 = 6`, not `812 ÷ 39 ≈ 20` |
| `dop-04-02:c1` | `dop-pad-borrow` | addition `4.08 + 2.90`, not the figure's subtraction `5.00 − 1.75` |
| `dop-04-02:c2` | `dop-pad-borrow` | `10.00 − 3.47`, not `5.00 − 1.75` |
| `dop-05-02:c1` | `dop-count-places` | `2.5 × 1.4 = 3.5`, not `1.2 × 0.5 = 0.60` |
| `dop-05-02:c2` | `dop-estimate-quotient` | a decimal-product estimate, not a quotient estimate |
| `dop-05-03:c1` | `dop-count-places` | decimal division `4.8 ÷ 6 = 0.8`, not decimal multiplication |

These slots are deliberately blank until exact synchronized assets are available. This is a fail-closed disposition, not a replacement claim.

## Regression and reproducibility

`src/lib/session266.decimalOperationsCourse.test.ts` proves the six manifest memberships and stable step sequences, all nine withholding decisions, retained-figure registration, evaluator-family preservation, numeric/evaluator validity, and MCQ correctness.

- Repair: `node scripts/session/s266-decimal-operations-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session266.decimalOperationsCourse.test.ts` — **3/3 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s266-decimal-operations-course-repair.mjs src/lib/session266.decimalOperationsCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
- Source seal: `9d52a9d8cc426c03c70defa007704706e70e37deb3fe646be113e407809432a7` (SHA-256 over the six sorted repaired lesson filenames and bytes, NUL-delimited).
