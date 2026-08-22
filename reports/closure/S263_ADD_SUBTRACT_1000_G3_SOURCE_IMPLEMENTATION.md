# S263 — Add/Subtract Within 1,000 (Grade 3) source implementation

## Scope and source seal

- Course: `add-subtract-1000-g3`
- Source lessons: 10 (the manifest has 4 + 3 + 3 lessons; it does not have 12)
- Course source seal (manifest plus all 10 lesson JSON files): `77e3e96dd7052800ecc60d972148d4a62cdc280cecd4a86e5aa55bb4088af452`
- Idempotent repair: `scripts/session/s263-add-subtract-1000-g3-course-repair.mjs` (`db9e9cc2eebfd8881ce9065dab59d9cf98877222f567af374873f078fd3fa050`)
- Aggregate regression: `src/lib/session263.addSubtract1000G3Course.test.ts` (`501b6488ec7d5b32e902cfc208ee065c0291bdfc9dca9377c582fde7ddbf4fe5`)

Only the course's ten lesson sources, this repair, this regression, and this evidence report were changed. Shared figure registry/runtime, backlog queue, review cards, and cache were not changed.

## Closed source causes

- All 20 stale `count-on-hops` concept placements were removed.
- 12 placements now use an existing figure only where its displayed quantity and representation are truthful for the concept: place-value decomposition, regrouping up/down, cascading through zero, and operation-choice strategy.
- 8 placements are deliberately figure-free because the available asset would show a different numerical situation or a different representation. This includes the former compensation illustration labelled `47 + 23 → 70`; it was fail-closed rather than presented beside three-digit compensation.
- The ten formerly repeated `i2` evaluators now keep their stable IDs and widget families but use distinct transfer inputs/tasks. Exact evaluator signatures, exact prompts, and the pending-workload scanner's number-normalized prompt templates are unique within every lesson.
- Corrected four stale base-ten target messages: two original targets were incorrectly described as needing to match 500, and two transfer targets are now explicitly validated against 468 and 433.
- Corrected all 12 column-calculation success/fallback messages, which had carried an unrelated `35 × 4 = 140` statement. Feedback now interpolates the actual operands, operation, and result.
- Replaced the six newly-authored `columnCalc` misconception outcomes with values produced by the engine's own `columnCalcReachable` model, so every feedback branch is live.
- The `numberLineHop` transfer now has a stated, internally correct landing: `246 + 3 × 100 = 546`.

This closes the course-local sources for the 30 P0 causes in the scoped 60-row snapshot: 20 unsafe illustration bindings plus 10 lesson progression/duplication causes.

## Deliberate residuals

- 8 concept slots remain figure-free until a number- and representation-matched course-specific asset exists. They are not learner-visible mismatches and are fail-closed by regression.
- The remaining 30 scoped P1 rows are generic review/disposition work. They were not self-closed because this source-only wave has no authority to alter queue, cards, cache, or review evidence.
- The upstream `build-add-subtract-1000-g3.mjs` generator remains out of scope. Re-run this idempotent repair after any generator rebuild; it is the canonical course-local post-generation closure.

## Reproducible gates

1. `node scripts/session/s263-add-subtract-1000-g3-course-repair.mjs` — run twice; second run is source-stable.
2. `pnpm exec vitest run src/lib/session263.addSubtract1000G3Course.test.ts` — 5/5 tests pass.
3. `pnpm exec eslint scripts/session/s263-add-subtract-1000-g3-course-repair.mjs src/lib/session263.addSubtract1000G3Course.test.ts` — clean.
4. `pnpm run cml:lint:strict` — `0 error(s), 0 warning(s)`.
5. `pnpm run validate:content` — 1840/1840 files clean.
6. `pnpm typecheck` — clean.

The regression asserts the manifest and stable step IDs, all 20 conceptual placements, registered figure IDs, the 12/8 exact/fail-closed boundary, truth of all base-ten/column/number-line evaluator facts, live column-calculation misconception paths, and all duplicate detector dimensions.