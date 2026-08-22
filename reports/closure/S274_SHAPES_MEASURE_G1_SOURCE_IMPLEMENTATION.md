# S274 — Shapes & Measurement G1 source implementation

## Scope and disposition

- Course: `shapes-measure-g1`; source ownership was clean before this packet.
- P0 closure: **3/3** causes across `smg1-02-02` and `smg1-04-02`: two authoritative `WITHHELD_BLOCKLIST_FINGERPRINT` illustration bindings and one exact challenge duplication.
- Both figures were fail-closed; no exact registered figure can truthfully show the surrounding source state.
- The duplicate fourths challenge now uses a whole-building transfer prompt. Its ID, numeric widget type, answer `4`, tolerance `0`, error feedback, and evaluator behavior are unchanged.
- P1 rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual and progression evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `smg1-02-02:c1` | fail-closed | The figure simultaneously labels `2 halves` and `4 fourths`; the source teaches a fourths-only equal-parts claim, so the extra fixed half exemplar is withheld. |
| `smg1-04-02:c1` | fail-closed | `clock-face` depicts `3:00` with the minute hand at `12`, directly contradicting the half-past source rule (minute hand at `6`). |
| `smg1-02-02:ch1` | diversified | Replaced the exact duplicate count prompt with “How many fourths make the whole?” while preserving answer `4` and numeric evaluation. |

The existing fraction-bar and clock-setting widgets remain as truthful learner-visible, parameterized interaction. Withheld slots stay blank until exact registered figures are available.

## Regression and reproducibility

`src/lib/session274.shapesMeasureG1Course.test.ts` verifies the twelve-lesson manifest, stable step/remedial IDs, evaluator surfaces, both fail-closures, the transfer redesign, retained-figure registration, widget schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s274-shapes-measure-g1-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session274.shapesMeasureG1Course.test.ts` — **3/3 passed**.
- P1 residual: **40** review rows remain intentionally untouched.
- Source seal: `7a0d02c89d2be8b688e06a8d8d8c2d383ce12dc80fb67c064df1b7cae6bcf019` (SHA-256 over the two sorted repaired lesson filenames and bytes, NUL-delimited).
- Scoped lint: `pnpm exec eslint scripts/session/s274-shapes-measure-g1-course-repair.mjs src/lib/session274.shapesMeasureG1Course.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
