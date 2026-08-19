# S276 — Polygons & Quadrilaterals source implementation

## Scope and disposition

- Course: `polygons-quadrilaterals`; source ownership was clean before this packet.
- P0 closure: **1/1** authoritative `WITHHELD_BLOCKLIST_FINGERPRINT` illustration cause in `pq-01-03:c2`.
- `pq-exterior` was fail-closed. Its generic `360° / n` statement does not synchronize with the source’s exact backward derivation `150° → 30° → n = 12`.
- Step IDs, remedial IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant declarations remain unchanged.
- P1 review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `pq-01-03:c2` | fail-closed | The copy teaches supplement first (`180 − 150 = 30°`), then the exterior lap (`n = 360/30 = 12`); the generic visual omits that learner-visible relationship and is explicitly withheld. |

The exact-number, numeric, and MCQ widgets remain as truthful learner-visible evidence. The slot stays blank until an exact registered figure is available.

## Regression and reproducibility

`src/lib/session276.polygonsQuadrilateralsCourse.test.ts` verifies the fifteen-lesson manifest, stable target step/remedial IDs, evaluator surfaces, the fail-closure, retained-figure registration, widget schema integrity, and numeric/MCQ self-grading truth.

- Repair: `node scripts/session/s276-polygons-quadrilaterals-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session276.polygonsQuadrilateralsCourse.test.ts src/lib/session174.polygonAngles.test.ts` — **9/9 passed**.
- P1 residual: **51** review rows remain intentionally untouched.
- Source seal: `0d78e29f645b667680cdb17a355bb43fea09e5fc427ec2a3e6a317cbe62beba6` (SHA-256 over the repaired lesson filename and bytes, NUL-delimited).
- Scoped lint: `pnpm exec eslint scripts/session/s276-polygons-quadrilaterals-course-repair.mjs src/lib/session276.polygonsQuadrilateralsCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
