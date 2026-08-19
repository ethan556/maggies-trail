# S275 — Two-Step Equations source implementation

## Scope and disposition

- Course: `two-step-equations`; source ownership was clean before this packet.
- P0 closure: **2/2** authoritative fixed-exemplar illustration causes addressed in `tse-01-02` and `tse-01b-02`.
- Both bindings were fail-closed: their visible numbers do not match the source equation or multiplier relationship.
- Step IDs, remedial IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant declarations remain unchanged.
- P1 review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `tse-01-02:c2` | fail-closed | The copy simplifies `4n + 3 + 2n` to `6n + 3`; `tse-combine-like` instead displays `5x − 2x + 3 = 3x + 3`. |
| `tse-01b-02:c2` | fail-closed | The copy distinguishes repeated `1.05` increases and a `0.80` markdown; `pr7-percent-multiplier` displays the unrelated fixed example `$20 × 1.15 = $23`. |

The existing algebra-tile, expression-building, percent-change, numeric, and MCQ widgets remain as learner-visible, parameterized evidence. The two slots stay blank until exact registered figures are available.

## Regression and reproducibility

`src/lib/session275.twoStepEquationsCourse.test.ts` verifies the seventeen-lesson manifest, stable target step/remedial IDs, evaluator surfaces, both fail-closures, retained-figure registration, widget schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s275-two-step-equations-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session275.twoStepEquationsCourse.test.ts src/lib/session141.equation-outcome.test.ts` — **6/6 passed**.
- P1 residual: **63** review rows remain intentionally untouched.
- Source seal: `48aaf8956c771daedb5f5337f2fc79b0e2174961fe6e634818791fc9485f3a37` (SHA-256 over the two sorted repaired lesson filenames and bytes, NUL-delimited).
- Scoped lint: `pnpm exec eslint scripts/session/s275-two-step-equations-course-repair.mjs src/lib/session275.twoStepEquationsCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
