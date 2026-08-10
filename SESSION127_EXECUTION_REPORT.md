# Maggie's Trail — Session 127 execution report

## Result

Session 127 implements the adversarial lesson-player and viewport harness defined by the Session-126
handoff. It does not perform lesson conversions or alter authored lesson content. Runtime browser
certification remains environment-blocked, and that limitation is explicit rather than converted
into an unsupported pass claim.

## Baseline measured from disk

- Existing browser gate: 47 executions from six declared tests, primarily route/theme accessibility
  loops, forced-colors checks, and smoke coverage.
- Existing Playwright configuration: one desktop Chromium project.
- Product state: 1,129 lessons, 10,487 steps, 106 registered widget types.
- Excellence queue: 64 K–8 C/D records, 64 classified, zero unreviewed.
- Flagship tiers unchanged: A 608 · B 201 · C 292 · D 28.

## Implemented work

### 1. Observable player-state contract

`LessonPlayer.tsx` now exposes existing phase, lesson, step, index, and step-count state through data
attributes. The feedback scroller has a test hook. These additions make the production state machine
observable without changing grading, content, navigation, mastery, XP, predictions, or resume.

### 2. State-machine specification

`e2e/player-state.spec.ts` adds six named tests:

1. prediction commitment blocks Enter and hides the lab until commitment;
2. retry preserves work, second miss reveals learner-versus-answer contrast, and rapid Enter cannot
   skip a step;
3. resume restores exact step and XP while Start over clears the durable snapshot;
4. completion consolidates the lesson and Enter follows the explicit next route;
5. keyboard order reaches the primary action with a computed 3px focus ring;
6. the app reduced-motion preference is present before paint and the base frame is already correct.

### 3. Six-project viewport specification

`e2e/player-viewport.spec.ts` adds three geometry tests across:

- 360×800;
- 390×844;
- 768×1024;
- 1024×768;
- 1440×900;
- 844×390 short landscape.

The tests enforce 44px controls, zero document-level horizontal overflow, feedback containment,
input ownership, action reachability, and long misconception feedback at XL text size.

### 4. Deliberate browser budget

The legacy 47 executions remain isolated in one project rather than being multiplied across all
viewports. Six state tests run once; three geometry tests run across six viewports:

```text
47 retained + 6 state + (3 × 6 viewport) = 71 projected executions
```

This is an increase of 24 browser executions with no redundant route/theme explosion.

### 5. Adversarial and visual evidence

- `PLAYER_HARNESS_CONTRACT_S127.md/json`: 36/36 static checks.
- `SESSION127_MUTATION_MATRIX.md`: 16 named mutations mapped to load-bearing assertions.
- `scripts/measure/shots-s127.cjs`: prediction, retry-preserved, reveal contrast, short-landscape
  feedback, resume, and completion captures.
- The canonical browser runner invokes the new state capture after a green Playwright run.

### 6. Release-contract repair

- package identity no longer expects a same-session copy of the Session-126 excellence ledger;
- identity and tidy checks derive the active session from the archive root;
- duplicate release-era `SESSION_NOTES` headings (Session 125 onward) are rejected;
- generated freshness includes the Session-127 harness contract;
- packaging includes the harness, mutation matrix, evidence, hashes, reports, and screenshots when
  produced;
- re-extraction reruns the static player-harness contract in addition to prior safe gates.

## Diff evidence

`SESSION127_DIFF_STATS.json` measures the implementation and living-document delta against the
Session-126 archive while excluding self-referential release reports and generated dependency/build
directories:

- 22 files changed;
- 8 added;
- 14 modified;
- 0 removed;
- 2,201 lines added;
- 71 lines removed.

The exact `package-lock.json` is byte-identical to Session 126.

## Verification

Green, independently rerun:

- harness contract 36/36;
- projected browser budget 71;
- changed TypeScript/TSX transpile diagnostics 0;
- changed Node-script syntax 0;
- registration consistent;
- excellence ledger 64/64, zero unreviewed;
- engine registration 106/106;
- native clean-copy integrity;
- generated freshness 9/9;
- lesson hash proof 1,129/1,129;
- package identity and tidy clean-copy.
- package rehearsal re-extraction: native, identity, hash, tidy, engine-registration, and harness-contract gates all exit 0.

Blocked by exact dependency availability:

- project-local TypeScript;
- targeted/full Vitest;
- content and pedagogy validation;
- ESLint;
- production build/server;
- Playwright 71/71;
- six screenshots.

The internal registry returns 404 for `zustand@5.0.14`; public npm DNS returns `EAI_AGAIN`. The
source dependency contract was not changed to bypass the exact lockfile. Full command evidence is in
`SESSION127_GATE_EVIDENCE.md`.

## Binding next action

Do not begin Session-128 lesson conversions until the unchanged lockfile is installed on Node 22.17+
and `npm run verify:session` completes the production build, 71/71 Playwright executions, and six
state screenshots. Once green, Session 128 may start the exact-fit reuse wave from
`EXCELLENCE_BACKLOG_S126.json`.

## Content-change ledger

**No authored lesson content was changed.** `SESSION127_LESSON_HASHES.json` proves all 1,129
lesson JSON files are byte-identical to the Session-126 input archive.
