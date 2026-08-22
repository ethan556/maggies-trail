# S279 — Exponential Functions source implementation

## Scope and disposition

- Course: `exponential-functions`; its source tree was clean before this packet.
- P0 evidence disposition: **1/1** queue-listed illustration cause reviewed at `exp-02-03:c3`.
  - **1** exact generic visual (`exp-decay-50`) retained after source and renderer verification.
- The source body requires the decay factor `1/2` for a 50% loss and illustrates the resulting `80, 40, 20` sequence. The registered renderer's accessible title independently states that losing 50% from 80 uses `80 × 0.5^x`, and its learner-visible label is `−50% → base 0.5`. It introduces no different fixed value, operation, or direction.
- All lesson and step IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant contracts remain unchanged.
- P1 residual: **45** review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `exp-02-03:c3` | retained | `exp-decay-50` exactly represents the source's `−50%` rate as base `0.5`; its accessible contract names the same starting value 80 and exponential form. The source holds the derived 80→40→20 sequence, so the compact rate visual reinforces rather than replaces the numeric explanation. |

The guard only restores that exact registered identifier if it is absent and rejects a conflicting binding. A fixed-number illustration would instead be withheld if any displayed value, operation, direction, or stated relationship diverged from its adjacent source copy.

## Regression and reproducibility

`src/lib/session279.exponentialFunctionsCourse.test.ts` verifies the twelve-lesson manifest, the target's stable IDs and remedial surfaces, the exact renderer contract, figure registration, schema integrity, and all current numeric, choice, and exact-number evaluator surfaces.

- Repair: `node scripts/session/s279-exponential-functions-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session279.exponentialFunctionsCourse.test.ts src/lib/session180.expFunction.test.ts src/lib/session181.a1Exponential.test.ts` — **15/15 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s279-exponential-functions-course-repair.mjs src/lib/session279.exponentialFunctionsCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check`: **passed**.
- Source seal: `ed8f9f02b11ae677bed449d9da10f8139e0ef026c9619a7ad1a21b461d25b1d7` (SHA-256 over `exp-02-03.json` filename and bytes, NUL-delimited).
