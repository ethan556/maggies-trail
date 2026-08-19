# S273 — Place Value within 1,000 source implementation

## Scope and disposition

- Course: `place-value-1000`; source ownership was clean before this packet.
- P0 closure: **3/3** illustration causes addressed across `pv1000-02-01`, `pv1000-04-02`, and `pv1000-04-03`.
- Every affected slot was an authoritative `WITHHELD_BLOCKLIST_FINGERPRINT`. The figures used fixed numbers from a different exemplar or an otherwise unsynchronized story, so each was fail-closed rather than shown beside unrelated learner-visible quantities.
- Step IDs, remedial IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant declarations remain unchanged.
- P1 residual: **48** review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `pv1000-02-01:c1` | fail-closed | The copy skip-counts `320, 330, 340, 350`; `skip-count-line` instead illustrates a fixed hundred-count sequence `200` through `600`. |
| `pv1000-04-02:c1` | fail-closed | The copy subtracts `486 − 253 = 233`; `decompose-combine` is a fixed addition model for `324 + 251 = 575`, an incompatible operation and data set. |
| `pv1000-04-03:c2` | fail-closed | The figure repeats the stadium total `247 + 186 = 433` without representing the stated ones-place trade, so it cannot serve as synchronized evidence for the procedure. |

Existing `numberLineHop`, `baseTenCompose`, and numeric assessment widgets remain in place as learner-visible, parameterized evidence. The three slots stay blank until exact registered figures are available.

## Regression and reproducibility

`src/lib/session273.placeValue1000Course.test.ts` verifies the twelve-lesson manifest, stable targeted step IDs, remedials, evaluator surfaces, all three fail-closures, retained-figure registration, schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s273-place-value-1000-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session273.placeValue1000Course.test.ts src/lib/session145.place-value-transform.test.ts` — **7/7 passed**.
- Source seal: `b57c3854d7e6a4d3c95d8f91bbcbd315ef0fb894333e940be0eef35896f27ae4` (SHA-256 over the three sorted repaired lesson filenames and bytes, NUL-delimited).
- Scoped lint: `pnpm exec eslint scripts/session/s273-place-value-1000-course-repair.mjs src/lib/session273.placeValue1000Course.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
