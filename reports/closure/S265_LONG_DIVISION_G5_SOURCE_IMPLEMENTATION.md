# S265 — Long Division G5 source implementation

## Boundary

- Course: `long-division-g5`
- Lessons: 6 (`g5l-01-01` through `g5l-03-02`)
- Changed only course lesson JSONs, this evidence report, a guarded repair script, and an aggregate regression.
- Not changed: widgets, schemas, figure registry/IDs, queue, cards, cache, ledgers, standards, or other courses.

## Exact P0 disposition

The current planning portfolio contains 37 rows: **18 P0** and 19 P1. The 18 P0 rows are exactly 12 illustration replacements plus six progression/duplication causes.

| Source-controlled cause | Baseline | Closure | Evidence |
| --- | ---: | ---: | --- |
| Fixed `count-on-hops` visual mismatch | 12 | 12 | 10 numeric mismatches fail-closed; two exact generic registered division figures retained. |
| Repeated `i2` progression | 6 | 6 | Each second interaction now has a distinct evaluator-preserving transfer/check job. |

The only retained figures are `g5l-01-01/c2 → dop-estimate-quotient` and `g5l-02-02/c1 → dop-long-division`. Both support number-free concept text without asserting incompatible authored numbers. All other inherited figures rendered `4 + 3 = 7`, which is incompatible with long-division concepts and has been removed rather than deceptively rebound.

The **19 P1 rows remain untouched**: 18 generic assessor-controlled lesson/visual/language dispositions and one choice-surface review. No queue or ledger row was self-closed.

## Mathematical/evaluator audit

- `714 ÷ 21 = 34` is estimated from `700 ÷ 20 ≈ 35`.
- Nine `40`-hops land exactly on `360`; both common erroneous landings remain within the widget range.
- Partial quotients reconstruct `672 ÷ 28 = 24` through batches `20 + 4`.
- The first standard-algorithm digit for `756 ÷ 27` represents 20 groups.
- The corrected trial product is `4 × 26 = 104 < 119`, leaving 15 rather than a negative remainder.
- The check interaction satisfies `18 × 27 + 13 = 499` and `13 < 27`.
- All repair actions preserve interactive IDs and evaluator types; no answer-key or choice-surface contract was altered.

## Reproducible evidence

```sh
pnpm exec node scripts/session/s265-long-division-g5-course-repair.mjs
pnpm exec node scripts/session/s265-long-division-g5-course-repair.mjs
pnpm exec vitest run src/lib/session265.longDivisionG5Course.test.ts
```

The sealed second repair run reports zero changes. The focused regression passes **6/6** tests.

Additional gates passed:

- `pnpm exec eslint src/lib/session265.longDivisionG5Course.test.ts scripts/session/s265-long-division-g5-course-repair.mjs`
- `pnpm run validate:content` — **1840/1840** clean
- `pnpm run lint:pedagogy` — **1711/1711** clean
- `pnpm run cml:lint:strict` — **0 errors, 0 warnings**
- `pnpm run cml:integration` — **1701** lesson JSON files parsed
- `pnpm exec tsc --noEmit --pretty false`
- scoped `git diff --check`

## Current lesson SHA-256 evidence

| Lesson | SHA-256 |
| --- | --- |
| `g5l-01-01` | `858d30decd39710121afe63158f7a4fad32c64b0c34430e32b3d6688b2bb3aae` |
| `g5l-01-02` | `96b980d2c823b4f816f25917c1a87cd6e4a0b7d1a816d5ad335c1fd0e8c55777` |
| `g5l-02-01` | `e0bd1e6632ba7158a2c1e2dc46cb606c9beb7ae72de79edd771653e9b4fe6d38` |
| `g5l-02-02` | `487d94a98da4b201159c46bac62907291dd08200046d5e62658c1576e4d3ef86` |
| `g5l-03-01` | `dc12e9822a4c6e0da6fa01ef89363cc03a34d6a1b4ef02fe8d18b753dd60d18b` |
| `g5l-03-02` | `07ac2c09a1775d9311a8edafb8b54f9db4fc15b911a13eb8537e2fe04b534fa2` |
