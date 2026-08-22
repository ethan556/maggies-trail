# S267 — Decimals Place Value source implementation

## Scope and disposition

- Course: `decimals-place-value`; source tree was clean before repair. Eight P0 illustration causes spanned six lessons.
- P0 closure: **8/8** fixed-exemplar conflicts fail-closed.
- All learner-visible lesson copy, stable step IDs, evaluator families, evaluator data, options, answers, and feedback are preserved. Each change removes only a conflicting `figure` property.
- P1 residual: 42 review rows remain intentionally untouched. No queue, review cards, cache, registry, runtime, or ledger was modified.

## Visual evidence

Each existing registered figure displayed different fixed values or a different rounding target than the adjacent worked example. No exact registered replacement exists, so the accurate disposition is to withhold rather than imply that a nearby example proves the claim.

| Lesson step | Removed figure | Retained adjacent source evidence |
| --- | --- | --- |
| `dpv-02-02:c1` | `dpv-expanded` | `0.375 = 3/10 + 7/100 + 5/1000`, not the figure's `0.347` |
| `dpv-02-02:c2` | `dpv-expanded` | `2/10 + 4/100 = 0.24`, not `0.347` |
| `dpv-02-03:c1` | `dpv-words` | `0.375`, read in thousandths, not `0.47` hundredths |
| `dpv-02-03:c2` | `dpv-words` | `0.09` uses a tenths placeholder before hundredths |
| `dpv-03-01:c2` | `dpv-line-up-compare` | `0.7 > 0.68`, not `0.45 > 0.40` |
| `dpv-03-03:c2` | `dpv-trailing-zero` | ordering `0.300`, `0.250`, `0.301`, `0.310`, not equal-value `0.5 = 0.50` |
| `dpv-04-02:c2` | `dpv-round-whole` | nearest-hundredth rounding, not the figure's nearest-whole `3.7` |
| `dpv-04-03:c1` | `dpv-round-whole` | nearest-dollar `$4.60 → $5`, not `3.7 → 4` |

The eight slots are intentionally blank until synchronized source figures exist. This is a fail-closed visual decision, not a replacement claim.

## Regression and reproducibility

`src/lib/session267.decimalsPlaceValueCourse.test.ts` checks manifest/step stability, all eight explicit withholdings, retained-figure registration, evaluator-family preservation, numeric/choice/evaluator validity, and learner-visible correctness contracts.

- Repair: `node scripts/session/s267-decimals-place-value-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session267.decimalsPlaceValueCourse.test.ts` — **3/3 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s267-decimals-place-value-course-repair.mjs src/lib/session267.decimalsPlaceValueCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
- Source seal: `d594f5624249d1988d614c0796293ef59828f552745a48be73d22d2b079e52f6` (SHA-256 over the six sorted repaired lesson filenames and bytes, NUL-delimited).
