# S247 engine-disposition closure

## Scope

This packet closes the three `ENGINE_DISPOSITION_REVIEW` rows for `compassConstruct`,
`systemsExplore`, and `matrixTransform`. It does not claim that the separate 17-engine
`ENGINE_REVERSIBLE_PLAY` remediation portfolio is complete.

## Evidence

All three engines already had a shared correctness checkpoint, unlocked post-verdict controls,
ungraded rechecks, diagnostic wrong-state feedback, and a multi-state authored domain. The
missing evidence was the explicit regression requested by the S235 audit.

`session247.engineDispositionPostVerdict.test.tsx` now renders each real engine after reveal with
controls unlocked, starts at a correct state, moves to a distinct wrong state, and returns to the
correct state. Every transition is independently checked through `evaluate`; no grading contract
or learner value schema changed.

The deterministic S235 generator now records only these three named, regression-backed engines as
`KEEP_WITH_EXPLORATION_REGRESSION`. Regeneration reports 110 KEEP rows and the original 17
remediation rows. The queue consolidator therefore removes exactly three P2 review rows on its
next serialized regeneration.

## Acceptance gates

- Component post-verdict regression: 3/3.
- Audit artifact contract: all three rows KEEP with checkpoint, unlocked controls, ungraded
  recheck, and multi-state domain PASS.
- No widget, evaluator, schema, lesson, or grading behavior changed.
