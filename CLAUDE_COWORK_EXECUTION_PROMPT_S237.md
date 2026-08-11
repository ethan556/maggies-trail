# Paste-ready Claude Cowork execution prompt — Maggie's Trail S237+

You are taking over Maggie's Trail from an exact Git checkpoint and must execute the remaining
closure program efficiently without rediscovering completed work.

## Objective

Continue from the published `main` branch, which must contain implementation ancestor
`4b66fe16361ccc03f59ea930013c2d0c94f48e14`. First extend the accepted S236
mathematics-first learner-screen treatment across **all 127 registered engines/labs**. Then work the
entire consolidated pending queue in evidence-ranked, bounded batches until every locally feasible
row is closed and only explicitly evidenced external/manual/research blockers remain.

Production comparison target: `https://maggies-trail.vercel.app/`.

Do not ask me to restate the backlog. The repository contains the authoritative inventories. Make
reasonable, reversible assumptions and proceed. Ask only when a missing vendor/product decision or
external credential would materially change the product.

## Mandatory first actions — serial, before workers edit

1. Clone/fetch the repository, create a new Cowork branch from `origin/main`, and run
   `git merge-base --is-ancestor 4b66fe16361ccc03f59ea930013c2d0c94f48e14 HEAD`. It must exit 0.
   Record the actual `main` head as the execution base; do not reset to the earlier ancestor.
2. Read completely, once, in this order:
   - `CLAUDE_COWORK_TRANSFER_MANIFEST_S237.md`
   - `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md`
   - `HANDOVER_S237.md`
   - `PREMIUM_REBUILD_PLAN.md`
   - `CLOSURE_LEDGER.md` using the latest row per ID
   - `PREMIUM_ENGINE_LAB_REVIEW_S234.md`
   - `PREMIUM_EXPLORATION_CHECKPOINT_S235.md`
   - `PREMIUM_LEARNER_SCREEN_FOCUS_S236.md`
   - package scripts and the audit generators named in the manifest
3. Confirm the queue counts: 11,487 total; 9,579 typesetting; 1,078 illustration; 572 MCQ; 200
   prediction; 27 ledger; 17 engine play; 8 program waves; 3 interaction; 3 disposition.
4. Run the cheapest baseline gates first: package identity, `npm ci`, typecheck, focused S235/S236
   tests, content/schema, pedagogy, registration, engine registration, then the full suite in shards.
   Record exact pass/fail counts. Preserve known failures as CL-P1-033 until actually repaired.
5. Fable must publish a compact cached repository map and execution ledger before implementation.

## Role model

### Fable — planner, architect, and independent quality assessor

Fable is read-only on product/content source by default. Fable owns:

- dependency graph, priority order, work-item leasing, and file-lock table;
- the compact context cache described below;
- architectural acceptance criteria and curriculum-risk decisions;
- adversarial review of every integrated batch;
- closure verdicts and reopen-condition checks.

Fable must not accept a worker's self-reported PASS without inspecting the diff and primary evidence.
Fable can edit only coordination/QA artifacts and the closure ledger after evidence is proven.

### Opus — lead orchestrator and high-risk integrator

Opus owns shared architecture, cross-cutting player boundaries, complex engine behavior, merge
conflicts, and final integration. Only one Opus worker may write shared files such as
`LessonPlayer.tsx`, `QuizShell.tsx`, `WidgetView.tsx`, `widgets.tsx`, schema/evaluator files, shared
styles, or queue generators during a write window.

Use Opus for mathematically delicate curriculum decisions, reusable illustration architecture,
engine-state contracts, security/external architecture, and adversarial bug repair.

### Sonnet — bounded implementors and audit workers

Use Sonnet for deterministic corpus scans, disjoint CSV shards, focused component tests, clearly
specified per-engine changes, reviewed content batches, screenshot capture, and mechanical
cross-platform fixes. Each worker receives only its queue slice, relevant files, invariants, and
acceptance commands.

No two workers may write the same file. Workers return a commit hash, changed-file list, exact gate
results, and unresolved risks—not narrative file dumps.

## Precache once; do not reread the corpus in every worker

Fable and one read-only Sonnet indexer should create a session-local cache outside tracked source:

- `repo-map.md`: component boundaries, engine registry, evaluator, schema, content layout, browser
  routes, and shared learner shell.
- `gate-map.md`: exact commands, runtime requirements, known failures, and cheap-to-expensive order.
- `engine-map.csv`: 127 engines with authored uses, representative lesson/step, component owner,
  evaluator branch, describe-state branch, current exploration decision, and learner-focus status.
- `work-index.json`: queue row offsets grouped by workstream, priority, repeated family, source file,
  and file owner.
- `coordination-ledger.csv`: batch ID, leased work IDs, worker, files, base commit, status, result
  commit, tests, Fable verdict, and queue delta.

Cache summaries and hashes, not full lesson prose or dependency files. Use `rg`, the existing audit
scripts, streaming CSV reads, and Git diffs. Never index `node_modules`, `.next`, test output, or old
archives. Refresh only the affected cache partition after a batch.

## Work package 1 — all-engine/lab learner-focus audit (start here)

The S236 quadratic comparison is accepted, but it is only a bounded proof. Apply its rule to all
127 engines/labs.

### Learner-facing contract

In active and retry states, show only:

1. the mathematical object/equation/diagram;
2. one clear task instruction;
3. direct controls with visible consequence;
4. optional learner-facing `Describe this model` disclosure when a nonvisual equivalent is useful;
5. one state-specific mathematical diagnosis after a wrong check;
6. one next action.

Do not show mastery labels, lifecycle badges, build/deep-dive tags, authoring stages, representation
taxonomy, internal invariants, transfer-family identifiers, process telemetry, move counts, or
program metadata during active/retry work. Equivalent mathematical forms may appear only after a
saved checkpoint and must remain concise. Do not remove accessibility content merely to make a
screen look sparse.

### Audit all 127, not only screenshots

Create `PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv` with one row per registered engine and at
least these fields:

`widget_type, authored_uses, grade_reach, representative_lesson, representative_step,
active_visible_text, retry_visible_text, post_checkpoint_visible_text, instruction_clear,
math_object_primary, metadata_leak, specific_diagnosis, next_action_clear,
describe_state_available, keyboard_contract, touch_target_contract, reduced_motion_contract,
overflow_risk, decision, evidence, next_action`.

Run an automated DOM/text inventory for every engine using representative authored specs and all
meaningful tones/states: neutral/active, error/retry, success/checkpoint, and info/reveal where the
engine supports them. If an engine has no authored use, mark that truth explicitly; do not invent a
lesson or claim browser certification.

Parallelize the read-only audit into three disjoint engine shards (1–42, 43–84, 85–127). Shard
workers may write only separate temporary CSVs. Fable joins and checks exactly 127 unique rows with
no missing/duplicate registry entries.

Then let the single Opus shared-shell owner fix systemic leaks first. After shared fixes, rerun all
127 rows. Assign engine-specific repairs to Sonnet only when component files are disjoint. Browser
verify every changed family at 390, 768, and 1440 px, light/dark, including active and retry states;
for untouched KEEP families, use automated regression plus a risk-stratified browser sentinel set.

For changed surfaces check keyboard, touch, reduced motion, forced colors where available, 200%
zoom/reflow where automatable, overflow, focus order, accessible name/state, and >=44 px targets.
Retain explicit manual gates for real devices and screen readers.

### Completion gate for work package 1

- 127/127 engine rows audited with no duplicate or missing engine.
- Zero active/retry authoring or mastery metadata leaks.
- Every changed retry state has one mathematically specific diagnosis and one next action.
- Optional descriptions remain learner-facing and nonvisual-state accurate.
- Targeted tests, typecheck, content, pedagogy, registration, engine registration, build, and
  touched-surface browser checks pass, or a pre-existing failure is separately evidenced.
- Fable issues `PASS`, `PASS_WITH_EXTERNAL_GATES`, or `REJECT` with reasons.
- Regenerate `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`; do not hand-edit away open work.

## Work package 2 — 17 reversible-play engine families

Use `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv`, ranked by learner harm x frequency x visibility x
strategic importance. Begin with high-use `exactNumberLab`, `buildExpression`, `dragBucket`,
`matchPairs`, and `dragOrder`; assess `numeric` and `mcq` as high-frequency answer surfaces without
pretending typed/choice input is automatically a rich lab.

For each family prove:

- one reachable correct state;
- reversal away from that state;
- at least one meaningful wrong/alternate state, and both sides of a continuous target when valid;
- direct visual consequence, keyboard/touch parity, Reset/Undo where appropriate;
- correct checkpoint remains immutable while post-checkpoint checks remain ungraded;
- renderer, evaluator, accessible state, and feedback agree;
- no curriculum answer or grading evidence changes merely to manufacture playfulness.

Use one engine family per implementation branch unless two families share the same component and
must be serialized. Fable approves each family before its queue row closes.

## Remaining queue — dependency-ordered execution

Work in this order after the learner-focus boundary is stable. Within each stream rank by learner
harm x frequency x visibility x strategic importance, then exploit repeated-family leverage.

1. **Repair baseline portability (isolated technical-health batch):** CL-P1-033 and CL-P1-040.
   Fix path separators, temp cleanup, and verifier portability without altering mathematical
   expectations. Prove Windows and Linux where environments exist.
2. **MCQ Wave C — 572 rows:** human-review batches of 20–50 rows or one repeated family set.
   Preserve prompts, distractors, feedback, correct markers, IDs, and lesson structure unless a
   separate curriculum-truth review authorizes a change. Remove length/punctuation leakage by
   concise parallel labels grounded in existing misconception rationales.
3. **Prediction Wave D — 200 rows:** batches of 20–40. Keep informative ungraded prediction ->
   action -> reveal loops; remove or redesign duplicate/non-causal ceremony. Do not leak answers.
4. **Typesetting — 9,579 rows:** batches of 100–250 grouped by syntax family and shared renderer.
   Use the canonical KaTeX+MathML path. Preserve mathematical semantics byte-for-byte at the parsed
   expression level; sample every batch visually and with accessible output. Reject ambiguous
   notation for human review instead of guessing.
5. **Illustration replacement — 1,078 rows:** group by mathematical concept and shared asset, not
   merely placement count. Start with highest-harm repeated families, but a replacement must
   represent each lesson's actual quantities/relationship. Visible labels, lesson prose, narration,
   and accessible description must agree. Restore only after parity review. Hidden is not fixed.
6. **Interaction necessity — 3 rows and engine disposition — 3 rows:** decide KEEP/CHANGE/REFUSE
   from learner demand, not novelty. Extend existing engines before creating new ones.
7. **Remaining local ledger items:** accessible state, mobile source repairs, dCL label, algebra
   tiles, remaining advanced-engine decisions, strict CML, performance budgets, and runtime reproof.
8. **External/manual/research ledger items:** billing, email, cross-device sync, LTI, observability,
   calibration, commercial deployment, real-device/screen-reader/zoom/motion. Produce architecture,
   test harnesses, and explicit blockers, but do not close without real external evidence.
9. **Waves H–J:** grade-aware density, full accessibility/performance hardening, final comparison,
   deployment identity, closure ledger, and sealed release archive.

## Batch protocol

For every batch:

1. Fable leases exact queue work IDs and freezes owned files.
2. Worker records base commit and reads only the queue slice, referenced lessons, relevant shared
   contract, and targeted tests.
3. Worker writes tests or an audit assertion before/beside the fix when practical.
4. Run cheap local gates first; stop a bad batch before build/browser work.
5. Worker commits only its owned files and reports exact evidence.
6. Opus reviews/merges into the integration branch; no blind cherry-pick on conflicts.
7. Fable adversarially checks the diff, reruns the decisive audit, and issues a verdict.
8. Regenerate affected audits and `npm run audit:pending-workload`.
9. Update the closure ledger only when the stated reopen condition is satisfied.
10. Commit a bounded checkpoint with execution report, adversarial QA, queue delta, and next batch.

Prefer 4–6 useful concurrent workers, fewer when shared-file contention dominates. Never parallelize
the final integration gate or writes to the same content file. Do not leave workers idle while
independent read-only audits, screenshots, or disjoint content batches are available.

## Verification ladder

Use package scripts as the executable authority. Run in increasing cost:

1. targeted unit/component tests for touched files;
2. `npm run typecheck`;
3. `npm run validate:content` and `npm run lint:pedagogy` for content-affecting batches;
4. `npm run check:registration` and `npm run check:engine-registration`;
5. relevant deterministic audits and `npm run audit:pending-workload`;
6. full Vitest, sharded if needed;
7. `npm run validate:native` and security audit;
8. `npm run build`, checked by exit code;
9. Playwright/browser verification against current source, then compare with the live deployment;
10. manual gates when hardware/assistive technology is actually available.

For touched learner surfaces, capture 390/768/1440 in light/dark and exercise initial, changed,
wrong/retry, correct/checkpoint, and post-checkpoint exploration states as applicable. A screenshot
alone is not state, accessibility, or mathematics proof.

## Hard prohibitions

- Do not use a `main` baseline that lacks the required implementation ancestor.
- Do not silently change curriculum mathematics, correct answers, grading, feedback truth, or
  sequencing.
- Do not treat a heuristic audit flag as authorization for a curriculum edit.
- Do not mark suppressed illustrations fixed.
- Do not expose internal metadata on learner active/retry screens.
- Do not lock meaningful controls after success or duplicate learning evidence during exploration.
- Do not weaken tests, raise timeouts to mask defects, or relabel red gates green.
- Do not let workers overwrite one another's files.
- Do not close external/manual/research rows with mocked or source-only evidence.
- Do not package `node_modules`, `.next`, test output, or caches into handoffs.

## Required continuing output

Maintain a concise dashboard after every integrated batch:

- exact branch and commit;
- completed work IDs and queue delta by workstream;
- current 61-item closure-ledger rollup;
- tests/gates with exact counts and environment;
- screenshots/evidence links;
- Fable verdict and reopen conditions;
- active blockers and the next parallel batch;
- clean/dirty Git status.

Continue autonomously through locally feasible batches. Stop only for a genuine external decision,
credential, hardware gate, or mathematical ambiguity that cannot be resolved from authored lesson
evidence. Never substitute activity, suppression, or a generated report for verified closure.
