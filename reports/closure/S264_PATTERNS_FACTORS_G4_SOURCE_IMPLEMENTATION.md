# S264 — Patterns, Factors & Multiples (G4) source implementation

## Boundary

- Course: `patterns-factors-g4`
- Lessons: 10 (`g4p-01-01` through `g4p-03-04`)
- Authorized sources: course lesson JSONs only, plus this report, the guarded repair script, and its aggregate regression.
- Not touched: shared widgets, schemas, figure registry/IDs, queue, cards, cache, ledgers, standards, and any other course.

## Source-derived baseline and disposition

The planning baseline contains **30 P0 rows**: 20 illustration replacements and 10 progression/duplication causes. It also contains **30 generic assessor-controlled rows** (one lesson, visual, and language disposition per lesson). There were no separately queued source-controlled choice-surface rows in this portfolio.

| Source-controlled cause | Baseline | Closure | Evidence |
| --- | ---: | ---: | --- |
| Fixed `count-on-hops` illustration mismatch | 20 | 20 | 19 fail-closed; `g4p-02-01/c1` rebound to the exact registered `mb-prime-composite` example. |
| Repeated/flat learner progression | 10 | 10 | Every `i2` now has an evaluator-preserving transfer, proof, reconstruction, or new-rule job. |
| Supporting repeated check surfaces | n/a | 8 repairs | Reworked only where necessary to prevent the progression cause recurring downstream; stable widget types, IDs, and correct answers remain intact. |
| Learner-visible feedback falsehoods | n/a | 2 repairs | Removed unrelated fractional-bar feedback from factor and pattern tap-diagrams. |

The 19 removals are intentional replacement debt, not fabricated visual substitutions: the registered factor/pattern figures are fixed examples (12 factor pairs, multiples of 3, or an add-3-from-2 pattern) and would contradict the authored values. The retained prime/composite figure is a literal 7-prime/12-composite example that supports the generic definition without asserting incompatible values.

Residual, by authority: **30 generic lesson/visual/language dispositions** remain exclusively for independent assessment. No ledger or queue row was self-closed.

## Evaluator and truth audit

- All repaired `areaModel` targets equal their required factor products: `36 = 9 × 4` and `21 = 7 × 3`.
- All repaired `numberLineHop` landings stay inside their declared range and state the calculated landing in success feedback: `35`, `54`, and `25`.
- Every repaired MCQ preserves `o0`–`o3`, one correct option (`o0`), unique labels, and diagnostic feedback. Existing two-option prime/composite checks remain valid and were not inflated just to satisfy an option-count metric.
- Both repaired `tapDiagram` interactions preserve hotspot IDs and correct selections while their prompts, labels, feedback, and learner-visible answer text agree.
- The regression rejects the stale `count-on-hops` visual and the false `Fourths`/`Bars A and D` feedback throughout the course.

## Reproducible evidence

1. Apply and verify idempotence:

   ```sh
   pnpm exec node scripts/session/s264-patterns-factors-g4-course-repair.mjs
   pnpm exec node scripts/session/s264-patterns-factors-g4-course-repair.mjs
   ```

   Sealed run: `0 safe figure removals, 0 exact figure rebound, 0 i2 repairs, 0 progression-check repairs, 0 truth-feedback repairs`.

2. Focused aggregate regression: `pnpm exec vitest run src/lib/session264.patternsFactorsG4Course.test.ts` — **6/6 passed**.
3. Full gates:

   - `pnpm run validate:content` — **1840/1840 clean**
   - `pnpm run lint:pedagogy` — **1711/1711 clean**
   - `pnpm run cml:lint:strict` — **0 errors, 0 warnings**
   - `pnpm run cml:integration` — **1701 lesson JSON files parsed**
   - `pnpm exec tsc --noEmit --pretty false` — **passed**
   - `pnpm run lint` — **0 errors, 460 pre-existing warnings**
   - `git diff --check` on the tracked course/test/script boundary — **clean**

## Current lesson SHA-256 evidence

| Lesson | SHA-256 |
| --- | --- |
| `g4p-01-01` | `ae936a3e319cf02a00e32a0d2ae1cc17cccb8f2130cbd0a92413b3d1d600b9a9` |
| `g4p-01-02` | `0966589f115eacabb82abcf021e09123eb6b0e548b56dcc8a1d25f55faf51d9f` |
| `g4p-01-03` | `5b92d63a428d07295b3e7de72136d2876e3ab3253057204f17b9b2afc7d38d6e` |
| `g4p-01-04` | `32232d6683adfc167b43ac9a3f24c50c295d1a73e51d540ca6554a37d10312d3` |
| `g4p-02-01` | `6b4a8be705da53abbc1395a0115face5f8dee90012e0a01e2239d99c8ea118de` |
| `g4p-02-02` | `e219b4739a679f1ec36d38a9dc8361d3c072591b45f22debfd6a6dd844653e10` |
| `g4p-03-01` | `de15005fe7de6020fcbaa6b15596e5cbb5af0b00c8f5e67c16c156beca2ce28d` |
| `g4p-03-02` | `1a51aa2cad72cfe0221c348bbe1b996b2abf6e2a25c40ea27764d96c5845b8d0` |
| `g4p-03-03` | `f9328fb08dfcba69c20b876685157350cb9a36106455086adab8d9023c607289` |
| `g4p-03-04` | `de38e7d59f75fab7493d3819fa6d8360213098cefb04b8cfcf31ea96603dc9d6` |
