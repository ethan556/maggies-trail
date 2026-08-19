# S281 — Limits and Continuity source implementation

## Scope and disposition

- Course: `limits-continuity`; the course tree was clean and collision-checked before this packet.
- P1 source-verifiable disposition: **10/10** deterministic choice-surface causes repaired across five lessons.
- The repaired answer labels are concise and structurally parallel. Each existing feedback message continues to hold the mathematical explanation and specific misconception diagnosis.
- All lesson and step IDs, widget types, option IDs, correct flags, evaluator contracts, feedback, figures, and generated-variant contracts remain unchanged.
- **45** P1 rows remain intentionally open: 15 grade-language, 15 whole-lesson completion, and 15 visual-first representation dispositions require explicit assessor decisions. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Source-verifiable evidence

| Cause class | Rows | Repair boundary |
| --- | ---: | --- |
| `CHOICE_SURFACE_INTEGRITY` | 10 | Replaced only the three learner-visible option labels in each named MCQ, preserving exact option identity, truth value, feedback, and evaluation. |
| Assessor-only lesson dispositions | 45 | Not inferred or closed by this source packet. |

The repairs cover unbounded and one-sided limits, end behavior by degree, continuity conditions, infinite discontinuity, and the IVT continuity hypothesis. Every distractor remains mathematically meaningful and maps to a documented misconception.

## Regression and reproducibility

`src/lib/session281.limitsContinuityCourse.test.ts` verifies the 15-lesson manifest, all ten target step IDs, exact option labels, unique truth, option-ID stability, evaluator truth, label parity, figure registration, and whole-course schema integrity.

- Repair: `node scripts/session/s281-limits-continuity-course-repair.mjs` — replayed idempotently (0 changes after the initial 30 label updates).
- Focused regression: `pnpm exec vitest run src/lib/session281.limitsContinuityCourse.test.ts src/lib/session246.limitsContinuityLc01Freshness.test.ts src/lib/session246.limitsContinuityLc03Lc04Freshness.test.ts` — **13/13 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s281-limits-continuity-course-repair.mjs src/lib/session281.limitsContinuityCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check`: **passed**.
- Source seal: `9153d8444efda1297585400ab42857e0f05f1b5762585889b65d6c480890603b` (SHA-256 over the six sorted repaired lesson filenames and bytes, NUL-delimited).
