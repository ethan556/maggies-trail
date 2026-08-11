# Session 235 — Correct checkpoints, not interaction padlocks

## Product decision

A correct answer is now a durable grading checkpoint, not the end of the model. Learners may continue manipulating after a correct result, test alternate correct or wrong states, and then continue when ready. Post-verdict exploration never adds attempts, XP, mastery evidence, review items, or duplicate result callbacks.

## Implemented surfaces

### Landing equal-groups model

- Domain expanded from 0 through 8 groups; target remains 5.
- The model begins at 1 group, may move down to 0, and may overshoot to 6–8.
- Rows 6–8 appear only when built, preserving the five-row target guide at the initial state.
- Correct feedback says the checkpoint is saved and explicitly invites continued exploration.
- Add, Remove, and Check remain enabled after the correct state.
- Low and high wrong-state feedback can be tested after success.

### Lesson player

- All registered widget engines receive an unlocked post-verdict surface through the shared `WidgetView` boundary.
- Manipulation after `correct` or `revealed` enters an ungraded exploration state.
- `Check this state` evaluates the current state without touching attempts, history, mastery, review scheduling, XP, or the saved checkpoint.
- Continue remains available throughout exploration.
- The stage and feedback banner distinguish untested, correct, and wrong exploration states.

### Review and practice

- `QuizShell` implements the same checkpoint contract.
- Its result callback fires exactly once for the graded attempt; later exploration checks do not report another result.
- Finish/Continue remains available while the model stays live.

## Engine/lab audit

`PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` contains all 127 registered engines.

- 127/127 inherit the saved-checkpoint, unlocked-control, ungraded-recheck, and wrong-feedback contract.
- 107 are KEEP with exploration regression coverage.
- 17 require engine-specific work for richer reversible play or direct manipulation.
- 3 retain an existing polish/deprecation review disposition.
- Slider placements receive an explicit authored-range review because a target at `min` or `max` may still prevent meaningful exploration on both sides.

The shared change removes the global padlock. It does not falsely claim that every engine is already equally playful: one-way or answer-only engines remain in the engine-specific remediation queue.

## Evidence

- Browser captures record the prior locked checkpoint, the new unlocked correct checkpoint, and a checked six-row wrong state:
  - `PREMIUM_REBUILD_SCREENSHOTS_S235/01-before-correct-lock.png`
  - `PREMIUM_REBUILD_SCREENSHOTS_S235/03-correct-checkpoint-unlocked.png`
  - `PREMIUM_REBUILD_SCREENSHOTS_S235/04-overshoot-wrong-state.jpg`
- Landing initial/correct/overshoot/undershoot behavior is covered in `HeroWidget.test.tsx`.
- Lesson checkpoint immutability and ungraded rechecks are covered in `playerStore.guards.test.ts`.
- Real lesson-player post-correct manipulation and wrong-state feedback are covered in `LessonPlayer.process.test.tsx`.
- Review/practice callback idempotence is covered in `QuizShell.exploration.test.tsx`.
- Global keyboard engine suite remains part of the focused gate.

## Reopen conditions

Reopen if any graded success disables a still-meaningful model, if an exploration recheck changes learner evidence, if Continue disappears during exploration, or if an engine is marked fully exploratory without a reversible alternate state.
