# S280 — Triangle Congruence source implementation

## Scope and disposition

- Course: `triangle-congruence`; the course tree was clean and collision-checked before this packet.
- P1 source-verifiable disposition: **11/11** deterministic choice-surface causes repaired across eight lessons.
- Every repaired option set now uses concise, parallel labels; the explanation and misconception diagnosis remain in feedback rather than telegraphing the keyed answer by length or prose detail.
- All lesson and step IDs, widget types, option IDs, correct flags, evaluator contracts, feedback, figures, and generated-variant contracts remain unchanged.
- **45** P1 rows remain intentionally open: 15 grade-language, 15 whole-lesson completion, and 15 visual-first representation dispositions require an explicit assessor decision. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Source-verifiable evidence

| Cause class | Rows | Repair boundary |
| --- | ---: | --- |
| `CHOICE_SURFACE_INTEGRITY` | 11 | Replaced only the four learner-visible option labels in each named MCQ, preserving exact option identity, truth value, feedback, and evaluation. |
| Assessor-only lesson dispositions | 45 | Not inferred or closed by this source packet. |

The repaired MCQs cover AAA versus congruence, SAS/ASA/AAS distinctions, HL, CPCTC planning and relay reasoning, the isosceles converse, the hinge theorem, and side-angle ordering. Each wrong option remains a specific misconception rather than a vague filler.

## Regression and reproducibility

`src/lib/session280.triangleCongruenceCourse.test.ts` verifies the 15-lesson manifest, all 11 target step IDs, exact option labels, unique truth, option-ID stability, evaluator truth, label parity, figure registration, and whole-course schema integrity.

- Repair: `node scripts/session/s280-triangle-congruence-course-repair.mjs` — replayed idempotently (0 changes after the initial 44 label updates).
- Focused regression: `pnpm exec vitest run src/lib/session280.triangleCongruenceCourse.test.ts src/lib/session246.triangleCongruenceChoiceIntegrity.test.ts` — **5/5 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s280-triangle-congruence-course-repair.mjs src/lib/session280.triangleCongruenceCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check`: **passed**.
- Source seal: `c2d465de0569c08362a3c7387066bbd537d87a2cf45b47c9719bfede0c72f493` (SHA-256 over the eight sorted repaired lesson filenames and bytes, NUL-delimited).


## Isolated external failure

The broad `src/lib/conversions.s120.test.ts` corpus test was also attempted but is not part of this course-local gate: it currently fails at unrelated, externally modified `similarity/sy-01-01:i2` because that `dilationExplore` widget has an unreachable `lowFeedback` branch. No Triangle Congruence source participates in that failure; the focused course and legacy Triangle Congruence integrity tests pass.
