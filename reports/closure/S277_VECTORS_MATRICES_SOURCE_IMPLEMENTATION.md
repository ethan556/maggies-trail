# S277 — Vectors & Matrices source implementation

## Scope and disposition

- Course: `vectors-matrices`; source ownership was clean before this packet.
- P0 closure: **1/1** authoritative `WITHHELD_BLOCKLIST_FINGERPRINT` illustration cause in `vec-05-02:c1`.
- `vec-rotation` was fail-closed. It presents one fixed 90° rotation of `⟨3,2⟩`; the source establishes the general θ rotation matrix through the transformed basis vectors.
- Step IDs, remedial IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant declarations remain unchanged.
- P1 review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `vec-05-02:c1` | fail-closed | The source binds both columns to the general θ images of `î` and `ĵ`; the fixed 90° `⟨3,2⟩ → ⟨−2,3⟩` example neither represents those basis-vector columns nor licenses an arbitrary θ claim. |

The matrix-transform, MCQ, and exact-number widgets remain as truthful learner-visible evidence. The slot stays blank until an exact registered figure is available.

## Regression and reproducibility

`src/lib/session277.vectorsMatricesCourse.test.ts` verifies the fifteen-lesson manifest, stable target step/remedial IDs, evaluator surfaces, the fail-closure, retained-figure registration, widget schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s277-vectors-matrices-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session277.vectorsMatricesCourse.test.ts src/lib/session173.vectorsMatrices.test.ts` — **11/11 passed**.
- P1 residual: **55** review rows remain intentionally untouched.
- Source seal: `d899d5d125e44a3739b8f2f2d6eeb45c595ab269fa0cb49b411ba238c4f17d71` (SHA-256 over the repaired lesson filename and bytes, NUL-delimited).
- Scoped lint: `pnpm exec eslint scripts/session/s277-vectors-matrices-course-repair.mjs src/lib/session277.vectorsMatricesCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
