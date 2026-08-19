# S271 — Parametric & Polar Calculus source implementation

## Scope and disposition

- Course: `parametric-polar-calculus`; source ownership was clean before this packet.
- P0 closure: **4/4** illustration causes addressed across `pc-01-01` and `pc-03-01`.
- Every affected slot used `dr-chain-gears`, a fixed numerical multiplication-chain figure (`3 × 5 = 15`). It is not evidence for parametric derivative division, second parametric differentiation, or perpendicular acceleration, so all four slots were fail-closed.
- Step IDs, remedial IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant declarations remain unchanged.
- P1 residual: **18** review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `pc-01-01:c1` | fail-closed | The copy defines `dy/dx = (dy/dt)/(dx/dt)`; chain gears instead asserts rate multiplication through an intermediate variable. |
| `pc-01-01:c2` | fail-closed | The copy teaches the second-parametric-derivative procedure `d/dt[dy/dx] ÷ (dx/dt)`, absent from the multiplication-chain figure. |
| `pc-01-01:rc1` | fail-closed | The remedial repeats the derivative-ratio procedure; the gear product is an incompatible operation and would miscue division. |
| `pc-03-01:c2` | fail-closed | The copy explains velocity/acceleration perpendicularity and `a · v = 0`; a scalar derivative-chain figure cannot represent that vector relationship. |

The learner-visible, parameterized widgets remain in place: the slope/second-derivative checks, reveal, vector exploration, and all numeric/MCQ assessments continue to provide truthful interactive evidence. The slots stay blank until an exact registered figure exists.

## Regression and reproducibility

`src/lib/session271.parametricPolarCalculusCourse.test.ts` verifies all four manifest lessons, stable main/remedial step IDs, evaluator surfaces, all four fail-closures, retained figure registration, schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s271-parametric-polar-calculus-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session271.parametricPolarCalculusCourse.test.ts src/lib/session246.parametricPolarPc01Freshness.test.ts src/lib/session244.flagshipVisualPacketB.test.ts` — **67/67 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s271-parametric-polar-calculus-course-repair.mjs src/lib/session271.parametricPolarCalculusCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
- Source seal: `87d7fff1550e9f2a60f951bf33f932c4b8ee587eb91dbb1bb156e109bd4502c5` (SHA-256 over the two sorted repaired lesson filenames and bytes, NUL-delimited).
