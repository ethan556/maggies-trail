# S264 — Measuring Length (Grade 1) source implementation

## Scope and source seal

- Course: `measure-length-g1`
- Source lessons: 10 (manifest sequence 4 + 3 + 3)
- Course source seal (manifest plus all ten lesson JSON files): `b5b46b9f209ee3cab50b76bd1afd1314ce6c97698fe30e142b98d7d5da077c4d`
- Idempotent repair: `scripts/session/s264-measure-length-g1-course-repair.mjs` (`ddc87e45b0abe8ba6c9022ebc77df5ed4ebd7600102763a10f7f31c462803212`)
- Aggregate regression: `src/lib/session264.measureLengthG1Course.test.ts` (`43f538de77c851e3b5773e9cea8430c3011436be7b911600f834a81b5e5f8abe`)

This is a source-local repair. The shared runtime/figure registry, pending queue, review cards, cache, and ledger were not changed.

## Closed source causes

- The scoped baseline contains 30 P0 causes: 20 stale `count-on-hops` concept bindings and 10 within-lesson progression duplicates.
- All 20 stale bindings are gone. Four concept slots now use exact registered visuals:
  - Direct fair comparison: `ks-compare-length`
  - Shifted-start unfair comparison: `ks-same-end-fair`
  - Ordering three measured objects: `smg1-three-counts`
  - Identifying the middle length: `smg1-middle-between`
- The other 16 slots are explicitly figure-free. They have no existing registered visual that faithfully shows their named relationship (indirect/transitive comparison, exact unit iteration, gaps/overlaps, equal units, paperclip units, or same object/different unit counts). A mismatched fixed-number illustration was not substituted.
- Every former `i2` repeat is now a distinct transfer with the same evaluator family and stable step ID:
  - Four `lengthCompare` tasks use distinct, internally true objects, lengths, offsets, and correct longer item.
  - Six `unitRuler` tasks use distinct, exactly coverable start/end/unit/placement contracts.
- The backlog detector's three duplicate dimensions are all eliminated in each lesson: evaluator signature, exact prompt, and number-normalized prompt template. Stable MCQ option IDs/correctness and numeric answer contracts are retained.

The source therefore closes all 30 scoped P0 causes without claiming authority over review/disposition work.

## Deliberate residuals

- 16 concept slots await a bespoke number- and representation-matched figure. They are fail-closed: no learner sees an unrelated calculation, unit, or diagram.
- The 30 scoped P1 review rows (10 visual-opportunity, 10 grade-language, 10 whole-lesson dispositions) remain untouched. This source wave has no authority to alter the queue, review cards, cache, or human-decision evidence.
- `scripts/session/build-measure-length-g1.mjs` is intentionally out of scope. Replay the idempotent repair after a generator rebuild.

## Reproducible gates

1. `node scripts/session/s264-measure-length-g1-course-repair.mjs` — run twice; second run is source-stable.
2. `pnpm exec vitest run src/lib/session264.measureLengthG1Course.test.ts` — 5/5 pass.
3. `pnpm exec eslint scripts/session/s264-measure-length-g1-course-repair.mjs src/lib/session264.measureLengthG1Course.test.ts` — clean.
4. `pnpm run cml:lint:strict` — `0 error(s), 0 warning(s)`.
5. `pnpm run validate:content` — `1840/1840 files clean`.
6. `pnpm typecheck` — clean.

The aggregate regression asserts the source manifest and stable IDs; the 4 exact/16 fail-closed visual boundary; registration; all new length and unit contracts; MCQ/numeric correctness surfaces; and all three pending-workload duplicate checks.