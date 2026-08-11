# Maggie's Trail — Claude Cowork transfer manifest (S237)

## Transfer decision

Use the Git repository as the transfer package. Do not upload a hand-picked source subset unless
Claude Cowork cannot clone GitHub.

- Repository: `https://github.com/ethan556/maggies-trail.git`
- Source branch after publication: `main`
- Required implementation ancestor: `4b66fe16361ccc03f59ea930013c2d0c94f48e14`
- Checkpoint subject: `S231-S236 premium learner experience checkpoint`
- Production comparison target: `https://maggies-trail.vercel.app/`

The required ancestor is the S231–S236 implementation checkpoint. The S237 Cowork handoff commit
sits on top of it on `main`; use the published `main` head as the Cowork baseline and verify that it
contains the required implementation ancestor.

Recommended bootstrap:

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail
git fetch origin main
git switch -c cowork/s237 origin/main
git merge-base --is-ancestor 4b66fe16361ccc03f59ea930013c2d0c94f48e14 HEAD
npm ci
```

The ancestry command must exit 0 before work begins. Record the actual `main` head as the execution
base; do not reset it back to the earlier implementation ancestor.

## Source-of-truth precedence

Read once in this order and cache the results. Do not make every worker reread the corpus.

1. The current user directive and `CLAUDE_COWORK_EXECUTION_PROMPT_S237.md`.
2. This transfer manifest.
3. `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` and its generator
   `scripts/audit/consolidate-pending-workload-s236.mjs`.
4. The latest row for each ID in `CLOSURE_LEDGER.md`. Later rows supersede earlier rows with the
   same ID.
5. Current deterministic audits: engine, illustration, typesetting, MCQ, prediction, interaction,
   and figure/text audits listed below.
6. `PREMIUM_REBUILD_PLAN.md`, `HANDOVER_S237.md`, and the S226–S236 execution/QA artifacts.
7. Older session documents are provenance only. They do not override current source or current
   audit output.

The root `CLAUDE.md` is explicitly a variant-generation operating manual. Its variant-only content
freeze applies when doing variant-generation work; it is not the task definition for the premium
remediation queue. Its deterministic-generation and gate-discipline rules remain valuable. Do not
edit variant machinery unless a leased work item explicitly requires it.

## Current product truth

- 1,701 lessons and 127 registered widget engines.
- The accepted S236 active/retry screen contains the equation or other mathematical object, model,
  direct controls, optional learner-facing model description, one specific diagnosis, and one next
  action. Authoring, lifecycle, invariant, transfer, mastery, and process telemetry are absent.
- Correct answers save a checkpoint; they do not lock meaningful interaction. Post-checkpoint state
  checks are ungraded and cannot duplicate attempts, XP, mastery evidence, review evidence, or
  result callbacks.
- The landing equal-groups widget allows 0–8 groups around target 5, not merely the correct state.
- 2,738 illustration placements render safely. 1,078 misleading placements are withheld. Withheld
  is containment, not replacement and not completion.
- The canonical math boundary uses KaTeX plus MathML, but 9,579 corpus strings remain open for
  conversion review. Do not mass-rewrite mathematics without row evidence.

## Closure review — all 61 current ledger items

The latest-row rule yields **32 closed** items and **29 open or partial** items. The consolidated
queue includes 27 explicit ledger rows; CL-P1-048 and CL-P1-057 are represented by their detailed
MCQ and engine child rows rather than duplicated ledger rows.

### Closed at the current checkpoint (32)

| ID | Closed outcome |
|---|---|
| CL-P0-001 | Product-state integrity |
| CL-P0-002 | Generated artifacts |
| CL-P0-004 | Release environment/runtime restored |
| CL-P0-005 | Dependency security |
| CL-P0-007 | Current K–8 interaction coverage audit |
| CL-P0-027 | Historical generated-proof integrity |
| CL-P0-046 | Premium rebuild corpus triage |
| CL-P0-055 | Landing mathematical model and shared slider |
| CL-P0-058 | Shared correct-checkpoint exploration contract |
| CL-P1-006 | Supported toolchain runtime |
| CL-P1-024 | Demo social proof removed from source |
| CL-P1-025 | QA measurement correction |
| CL-P1-026 | Source-release integrity |
| CL-P1-028 | Automated 90-capture shell matrix scope |
| CL-P1-029 | Unsafe dependency workaround refused/restored |
| CL-P1-030 | Seal portability |
| CL-P1-032 | Automated touch-target gate |
| CL-P1-034 | Current dependency-security repair |
| CL-P1-036 | Interaction audit-state integrity |
| CL-P1-037 | Core mathematical typography surfaces |
| CL-P1-038 | Algebra I acquisition lift |
| CL-P1-039 | Quotient-rule mechanism |
| CL-P1-041 | U-substitution acquisition |
| CL-P1-042 | Rolle acquisition |
| CL-P1-043 | Range/disclosure target robustness |
| CL-P1-045 | Lesson-player Wave A hierarchy |
| CL-P1-047 | Wave B canonical typesetting boundary |
| CL-P1-050 | Dark-theme math contrast |
| CL-P1-052 | Learner-screen progressive disclosure |
| CL-P1-053 | Rule-specific exponent visuals |
| CL-P1-060 | Active/retry learner-screen simplification |
| CL-P1-061 | Consolidated pending-workload truth |

Closed means the stated scope and reopen condition are satisfied. It does not close a related
broader program item. For example, the Wave B rendering boundary is closed while row-level
typesetting review remains queued.

### Open or partial at the current checkpoint (29)

| ID | Current state | Dependency or next evidence |
|---|---|---|
| CL-P0-003 | Source closed; runtime reproof open | Reprove canonical placement route/persistence/accessibility |
| CL-P0-008 | In progress | Finish HS premium-density necessity decisions |
| CL-P0-009 | Open | State-aware adaptation for important engines |
| CL-P0-013 | Design decision | Judge-versus-explore demand without answer leakage |
| CL-P0-016 | Open/external | Real billing processor and entitlement lifecycle |
| CL-P0-017 | Open/external | Production email delivery lifecycle |
| CL-P0-018 | Open/external | Durable cross-device/class sync |
| CL-P0-020 | Open/external | Production observability and release correlation |
| CL-P0-022 | Open/research | Empirical calibration, retention, transfer, subgroup evidence |
| CL-P0-023 | Open/external | Commercial production end-to-end proof |
| CL-P0-054 | Runtime safe; replacement backlog open | Restore only after visible/accessible parity |
| CL-P0-056 | 1,078 replacements open | Concept-specific illustration replacements |
| CL-P1-010 | Open | Exact accessible state for 13 priority engines |
| CL-P1-011 | Open/manual+source | Three low-mobile engines and real-device proof |
| CL-P1-012 | Open | Distribution-compare label collision repair |
| CL-P1-014 | Open | Evidence-backed second algebra-tiles deployment decision |
| CL-P1-015 | 4/7 closed | Nested rules, error propagation, growth race remain |
| CL-P1-019 | Open/external | Live LTI AGS delivery or support decision |
| CL-P1-021 | Open | Current performance profiling and budgets |
| CL-P1-031 | External execution dependency | Reprove current branch in supported release/CI environment |
| CL-P1-033 | Open | 15/12,813 Vitest tests currently fail on Windows |
| CL-P1-035 | Human/hardware | Touch device, NVDA/VoiceOver math, 200% zoom, motion review |
| CL-P1-040 | Tooling only | Normalize later historical verifiers after S146 |
| CL-P1-044 | Pre-existing content | Strict CML findings in `re-04-02` |
| CL-P1-048 | In progress, 125/697 | 572 MCQ rows remain for human review |
| CL-P1-049 | Wave D open | 200 prediction gates |
| CL-P1-051 | Wave E open | Mobile triangle-label defect |
| CL-P1-057 | In progress | Engine/lab premium quality |
| CL-P1-059 | 17 engine families open | Reversible/direct play remediation |

External, research, assistive-technology, or vendor-dependent items may be planned and instrumented
locally, but must not be marked closed without the named external evidence.

## Consolidated executable queue

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` contains **11,487 open rows**:

| Workstream | Rows | Current queue status |
|---|---:|---|
| MATH_TYPESETTING | 9,579 | `OPEN_CONVERSION_REVIEW` |
| ILLUSTRATION_REPLACEMENT | 1,078 | `OPEN_REPLACEMENT_REQUIRED` |
| MCQ_DISTRACTOR_REVIEW | 572 | `OPEN_HUMAN_REVIEW` |
| PREDICTION_GATE_REVIEW | 200 | `OPEN_REMOVE_OR_REDESIGN` |
| CLOSURE_LEDGER | 27 | Mixed current open/partial states |
| ENGINE_REVERSIBLE_PLAY | 17 | `OPEN_ENGINE_REMEDIATION` |
| PREMIUM_REBUILD_WAVE | 8 | `OPEN_PROGRAM_WAVE` |
| INTERACTION_NECESSITY_REVIEW | 3 | Audit/open or next |
| ENGINE_DISPOSITION_REVIEW | 3 | `OPEN_DISPOSITION_REVIEW` |

Priority distribution: 977 P0, 10,507 P1, and 3 P2. Program and ledger rows are umbrellas; they do
not replace or double the detailed child work.

## Engine/lab state requiring immediate extension

`PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` covers all 127 registered engines:

- 107 `KEEP_WITH_EXPLORATION_REGRESSION`
- 17 `REMEDIATE_ENGINE_PLAY`
- 3 `REVIEW_EXISTING_DISPOSITION`

The 17 remediation families are `exactNumberLab`, `buildExpression`, `dragBucket`, `matchPairs`,
`dragOrder`, `numeric`, `mcq`, `steppedReveal`, `fractionEntry`, `placeCompare`,
`rationalCompare`, `pointEntry`, `subitizeFlash`, `absValueLine`, `fractionCompare`,
`toggleExplore`, and `radicalCheck`.

The three disposition reviews are `compassConstruct`, `systemsExplore`, and `matrixTransform`.

S236 proved the learner-focus rule on one quadratic flow and shared shell boundaries. It did **not**
certify every engine-specific active/retry composition. The first Cowork work package must audit all
127 engine/lab families for visible learner copy and extend the same mathematics-first boundary.

## Files/folders Claude needs

### Preferred: clone the entire Git branch

The repository is highly cross-linked. A full clone preserves provenance, generated audits, test
fixtures, and content references while Git naturally excludes ignored build products.

### Minimum executable folder set if cloning is impossible

- `src/` — app, player, engines, evaluators, schemas, state, tests.
- `content/` — all 1,701 authored lessons and course metadata.
- `scripts/` — content, audit, registration, verification, packaging, and queue generators.
- `public/` — figures, fonts, and browser assets.
- `e2e/` and `tests/` — browser and integration gates.
- `data/`, `db/`, and `docs/` — runtime fixtures, migration/schema support, architecture contracts.
- Root build/control files: `package.json`, `package-lock.json`, `tsconfig.json`,
  `tsconfig.cml.json`, `next.config.mjs`, `playwright.config.ts`, `vitest.config.ts`,
  `vitest.setup.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.cjs`, `.gitignore`,
  `next-env.d.ts`, `README.md`, and `CLAUDE.md`.

### Required current planning/evidence files

- `CLAUDE_COWORK_TRANSFER_MANIFEST_S237.md`
- `CLAUDE_COWORK_EXECUTION_PROMPT_S237.md`
- `HANDOVER_S237.md`
- `CLOSURE_LEDGER.md`
- `PREMIUM_REBUILD_PLAN.md`
- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
- `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md`
- `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv`
- `PREMIUM_ENGINE_PRIORITY.csv`
- `PREMIUM_ENGINE_LAB_REVIEW_S234.md`
- `PREMIUM_EXPLORATION_CHECKPOINT_S235.md`
- `PREMIUM_LEARNER_SCREEN_FOCUS_S236.md`
- `MATH_TYPESETTING_AUDIT.csv`
- `MATH_TYPESETTING_WAVE_B_RESIDUAL.csv`
- `MCQ_DISTRACTOR_AUDIT.csv`
- `PREDICTION_GATE_AUDIT.csv`
- `PREMIUM_INTERACTION_PRIORITY.csv`
- `DIRECT_MANIPULATION_AUDIT.csv`
- `VISUAL_REBUILD_QUEUE.csv`
- `FIGURE_TEXT_ALIGNMENT_AUDIT.csv`
- `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv`
- `PREMIUM_REBUILD_SCREENSHOTS_S226/`, `S227/`, `S228/`, and `S232/` through `S236/`.

The full clone contains the implementation, audits, queues, evidence, and S237 Cowork handoff
files. Do not duplicate the large audits into the chat prompt context.

### Do not transfer or index

- `node_modules/`
- `.next/`
- `test-results/`
- `playwright-report/`
- `tsconfig.tsbuildinfo`
- development PID/stdout/stderr logs
- OS temp/cache directories
- old extracted copies of session archives

These are regenerated or noisy. Historical sealed archives are optional provenance, not active
context. Never index dependencies or build output into the model context.

## Current validation truth

- TypeScript typecheck: PASS at checkpoint.
- Production build: PASS at checkpoint, with existing non-blocking warnings.
- Focused learner/exploration suites: 66/66 PASS at checkpoint.
- Full Vitest on Windows: **12,798/12,813 pass; 15 failures across 6 files**. This is open
  CL-P1-033, not a green suite.
- Content and pedagogy rerun was interrupted by a Windows `tsx`/libuv `ENOMEM` environment error.
  Do not claim a new green result until rerun in Cowork.
- Registration and engine-registration gates: PASS at checkpoint.
- Build and production-browser accepted state: PASS for the bounded S236 comparison.
- Manual real-device, screen-reader, 200% zoom, and normal-motion gates remain open.

## Non-negotiable closure rules

1. Learner-facing active/retry screens show only mathematics, clear instructions, direct controls,
   concise state feedback, and the next action. Preserve optional accessible model descriptions.
2. Do not expose authoring stages, lifecycle labels, internal invariants, transfer-family names,
   mastery telemetry, or process metadata during active/retry work.
3. Do not change curriculum mathematics, grading truth, correct markers, misconception feedback, or
   sequencing without lesson-level evidence and Fable approval.
4. Hidden or suppressed content is not fixed. An illustration closes only with a truthful visible
   replacement and matching accessible description.
5. Correct-state exploration cannot create new graded evidence or lock a meaningful model.
6. A queue row is not complete because code was edited. Regenerate the governing audit and pending
   queue, then prove its closure condition.
7. Never weaken tests or gates to make a batch pass. Record pre-existing failures separately.
8. Never close external/manual/research items with source-only evidence.
