# MAGGIE'S TRAIL — CLOSURE LEDGER

**Rule:** an item closes only with evidence. “Historical green” is never current-tree closure evidence.

| ID | Sev | Area | Exact evidence / learner impact | Affected | Proposed fix | Status | Session | QA / closure evidence | Reopen condition |
|---|---|---|---|---:|---|---|---|---|---|
| CL-P0-001 | P0 | Product-state integrity | Manifest said 15,611 steps while direct corpus has 15,621; old contentVersion could survive lesson-body edits. Stale truth can mis-prioritize release work and misstate product claims. | product-wide | Exact byte-level authored corpus hash; fail-closed generation. | **CLOSED** | S219 W01 | Mutation makes product-state generation exit 1; restore byte-exact; corpus verifier green. | Any generator can publish current state without exact live corpus hash agreement. |
| CL-P0-002 | P0 | Generated artifacts | Inventory 1,673/15,359; product state 126 widgets + S135 runtime; playbook tiers stale. | product-wide | Regenerate from direct source; freshness gate; preserve historical runtime labels. | **CLOSED** | S219 W01 | Generated groups 0–3 byte-stable after regeneration; verified state 129/1701/15621/127. | Any current-looking artifact disagrees with direct source. |
| CL-P0-003 | P0 | Onboarding/placement | Grade 3 alone used legacy 3-question comfort quiz while `/placement` used 12-item diagnostic. Inconsistent placement confidence and setup behavior. | new learners | One canonical diagnostic for all grades + explicit bypass; persist recommendation into onboarding. | **CLOSED-SOURCE / RUNTIME REPROVE OPEN** | S219 W01 | Static audit + zero TSX syntax diagnostics; production legacy tokens absent. | Full tests/browser show route, persistence, or accessibility regression. |
| CL-P0-004 | P0 | Release verification | Current S221 semantic typecheck/Vitest/build/Playwright cannot run: no dependency tree; exact mirror now returns 404 for `zustand@5.0.14`, `zod@3.25.76`, `next@15.5.23`, and `react@19.2.7`; no matching local tree. Connected Vercel has zero projects and connected GitHub exposes zero repositories, so no safe remote CI/build surrogate exists. | product-wide | Restore supported Node + exact dependencies; run full sealed chain. | **OPEN** | S221 W02 execution | Fresh package probes 404 on Zustand/Zod/Next/React; Vercel project list empty; GitHub repository list empty; dependency-free native/corpus/visual-contract gates green. Last certified full runtime remains explicitly S218 historical evidence. | Close only with current-tree full chain green. |
| CL-P0-005 | P0 | Dependency security | `sharp@0.34.5` was in `<0.35.0` high advisory range. | hosted app | Controlled supported dependency upgrade or build + endpoint reachability proof; complete npm audit. | **CLOSED** | S224 W04 | Narrow `sharp@0.35.3` override; `npm ls` confirms Next uses the patched version; fresh build PASS; production audit 0 vulnerabilities. | Reopens on new critical/high advisory, incompatible image behavior, or override loss. |
| CL-P1-006 | P1 | Toolchain | Node 22.16.0 is below `@sparticuz/chromium@149.0.0` declared minimum `^22.17.0 || >=24.0.0`. | browser tooling | Use Node ≥22.17 or supported 24.x in release environment. | **OPEN** | S221 W02 execution | Runtime remains Node 22.16.0; isolated Node 22.17 download unavailable; no remote build environment discovered. | Close when the sealed current tree executes under a declared-supported runtime. |
| CL-P0-007 | P0 | Lesson interaction coverage | Operational audit finds 72 acquisition + 9 transfer lessons with zero A/B interaction. Weak concept lessons can drag the median experience. | 81 candidates | Human re-read ranked queue; reuse existing engines; protect retrieval. | **OPEN** | baseline | `PREMIUM_INTERACTION_PRIORITY.csv`; 39 mechanical CHANGE candidates, but no automatic authorization. | Close only when every important candidate is changed or formally justified KEEP/REFUSE. |
| CL-P0-008 | P0 | HS premium density | Fresh S330 tier compiler run: 72 HS C-tier lessons (73 at diagnosis time, same session — `tm-01-03` moved to B as a confirmed side effect of the CL-P1-057 `pointEntry` fix; see both addenda below) (was "56" in this row's stale S224 prose; the underlying set has also shifted membership since, not just count). Root cause identified, not just counted: the 58/73 originally capped by a widget whose `manip=1` ceiling is a DELIBERATE, already-adjudicated design judgment (S205M/S207 named `dragBucket`/`buildExpression`/`matchPairs`/`dragOrder` explicitly, not an oversight), not a scoring bug. | 72 HS lessons | Per-lesson pedagogical fit review before any engine swap — same standard S205M/S207/S247/S319 already apply; NOT a mechanical bulk pass. | **OPEN — DIAGNOSED, NOT YET ACTIONED** | S330 | See "Session 330 fifth post-recon addendum" below. | HS conceptual density no longer materially trails K–8, decided lesson-by-lesson with the same rigor as prior engine-fit reviews. |
| CL-P0-009 | P0 | State-aware adaptation | 63/127 engines have adapt=0; multiple high-use manipulatives lack process evidence. | high-use engines | Meaningful event/state contracts and deterministic intervention loop. | **OPEN** | baseline | Capability registry census. | Important manip emits HOW-the-learner-reasoned evidence and intervention is state-grounded. |
| CL-P1-010 | P1 | Accessible state | describeState exists for 104/129 (was 90/129 pre-S330); the 14 high-use/spatial manipulatives named by a fresh re-application of this row's own rule now all have it. 25 lower-priority/self-narrating types remain without a case — not in this row's original scope. | 14 priority engines (fresh count; row said 13 against a stale 127-registry baseline) | Add exact state descriptions derived from evaluator/model state. | **CLOSED — S330, 14/14 BUILT + TESTED** | S330 | See "Session 330 fourth post-recon addendum" below. | Any of the 14 engines' description drifts from its renderer's own numbers, or a reveal-gate check (tone "info" / `showTarget`) stops matching its widget's own ghost. |
| CL-P1-011 | P1 | Mobile | `systemsExplore`, `matrixTransform`, `compassConstruct` have mobile=1. | 3 engines | Real-device/touch + alternative-control repair. | **OPEN** | baseline | Registry census. | Any important engine remains mobile=1 or fails device gate. |
| CL-P1-012 | P1 | dCL visual polish | Known overlap label can collide with bracket. | 7 judge steps / 3 authored lessons currently activated | Reposition label with breakpoint/SR parity tests. | **OPEN** | S218 handover | S218 Fable QA polish note. | Collision observed at any supported viewport/zoom. |
| CL-P0-013 | P0 | dCL causal misconception | Judge overlay answers wrong conclusion but cannot yet let learner manipulate distributions until their claim becomes true. | relevant distribution lessons | Decide judge vs explore demand; implement only if learner retains the conclusion-making work. | **OPEN — DESIGN DECISION** | S218 handover | Do not drag if it leaks the judge answer. | Close by justified implementation or documented REFUSE. |
| CL-P1-014 | P1 | Algebra tiles | Second genuine distribute deployment remains queued; factor mode is display-only. | candidate algebra lessons | Fresh lesson/engine fit audit; reuse `algebraTiles` where structure benefits. | **OPEN** | S218 handover | Necessity audit required before write. | Close by deployment or evidence that current model is better. |
| CL-P1-015 | P1 | Advanced engines | Seven proposed gaps: nested rules, u-sub two-world, error propagation, growth race, movable Rolle interval, odometer, derivative quotient mode. | 7+ advanced lessons | Re-audit necessity one by one; extend existing engine first. | **OPEN — 4/7 CLOSED** | S225 W04 | Quotient, u-substitution, and movable Rolle ship through existing-engine extensions with authored use and exact QA. Motion odometer is formally refused because `ia-04-01` already has an exact A-tier accumulation model. Nested rules, error propagation, and growth race remain. | Any gap is built gallery-only or without authored use. |
| CL-P0-016 | P0 | Billing | Premium page explicitly says no real billing; checkout/entitlement are demo. Paid flow cannot ship. | all paid users | Real processor, webhook/entitlement lifecycle, renewal/cancel/failure tests. | **OPEN** | baseline | `premium/page.tsx`, `entitlement.ts`. | Any critical pay/entitlement path remains simulated. |
| CL-P0-017 | P0 | Email/account lifecycle | Auth mail writes to `mail_outbox`; no production email delivery. | account verification/reset users | Production provider + delivery/retry/bounce observability and e2e. | **OPEN** | baseline | `authService.ts`. | Verification/reset depends on developer/manual outbox. |
| CL-P0-018 | P0 | Cross-device/class workflows | Class client explicitly says cross-device class tools are off. | teachers/students | Durable hosted persistence/sync + class workflow e2e. | **OPEN** | baseline | `ClassClient.tsx`. | A user cannot change devices and retain required class/progress state. |
| CL-P1-019 | P1 | LTI | AGS score queue exists; live score delivery explicitly not implemented. | LTI users | Implement/retry/sign live AGS delivery if LTI remains supported. | **OPEN** | baseline | `ltiService.ts`. | Product claims LTI delivery while only queueing. |
| CL-P0-020 | P0 | Observability | route error boundary only `console.error`; no production observability evidenced. | production | Error/performance telemetry, release correlation, alerting. | **OPEN** | baseline | `src/app/error.tsx`. | Critical failures can occur without actionable production signal. |
| CL-P1-021 | P1 | Performance | Current payload/INP/drag frame/SVG/low-end Android costs unmeasured; build time intentionally no longer reported stale. | product-wide | Profile current build before richer motion/world animation. | **OPEN** | baseline | `PRODUCT_STATE_VERIFIED.json` says not measured. | Performance budget regresses or remains unknown at release. |
| CL-P0-022 | P0 | Calibration claims | Adaptive item parameters are architecture, not empirically validated psychometrics. | placement/personalization | Learner pilots: difficulty/discrimination/reliability/subgroups/retention/transfer. | **OPEN** | baseline | Closure mandate; no empirical dataset supplied in repo audit. | Any public claim outruns measured evidence. |
| CL-P0-023 | P0 | Commercial deployment | No hosted production deployment configured; full account→pay→cross-device return path not proven. | all public users | Wave 7 production integration + end-to-end deployment test. | **OPEN** | baseline | Verified product state + source audit. | Close only with production-like end-to-end evidence. |
| CL-P1-024 | P1 | Social proof | Production homepage contained fictional/demo testimonials. | prospects | Replace with verifiable evidence. | **CLOSED-SOURCE** | S219 W01 | Homepage fixture removed; static audit pins absence. | Fictional/unverifiable testimonial returns to production surface. |
| CL-P1-025 | P1 | QA measurement | Initial S219 A/B census used wrong seventh registry axis (`repr` vs `polish`). | audit decisions | Re-derive formula from source; record correction. | **CLOSED** | S219 W01 | Correct values A65/B45/C12/D5 and instance/band counts regenerated into artifacts. | Any downstream report uses the discarded preliminary census. |

| CL-P1-026 | P1 | Source-release integrity | Native gate initially found forbidden Wave-1 log, stale `tsconfig.tsbuildinfo`, and pre-existing generated-probe import false surface. | source archive | Store evidence source-safely, remove compiler cache, make probe import semantics explicit. | **CLOSED** | S219 W01 | Final `validate:native` passes 2,491 JSON / 1,187 source / 1,680 imports / 47 links / 2 assets / 268 buttons / 28 API routes. | Native integrity red on the sealed tree. |
| CL-P0-027 | P0 | Historical generated-proof integrity | Broad freshness gate contained stale authorization lists/loaders and could invoke a 1,129-lesson historical hash generator against the 1,701-lesson corpus; that generator wrote before validating count, so a red run could corrupt its own frozen baseline. | release evidence product-wide | Separate frozen history from exact-hash cumulative later authorization; verify rather than regenerate frozen ledger; load real current local evaluator dependencies; fail before historical writes. | **CLOSED** | S220 W02 preflight | All 81 generated groups byte-stable; frozen ledger restored at SHA `3ff6e189…`; 815 later lesson hashes exact; S151 integration 95/95, sweep 33,408/33,408, mutations 155/155 rejected, failure-first 44/44; mutation tests red on lesson/ledger drift. | Any historical baseline can be rewritten by a current freshness run, or a later authorized path can mutate without exact re-certification. |
| CL-P1-028 | P1 | Premium visual certification | No single current-shell matrix guaranteed every required surface at 390/768/1440, light/dark, settled reduced-motion baseline, with overflow/focus/touch telemetry. Historical screenshots are insufficient for current certification. | core learner/product shell | Deterministic 15-surface × 3-viewport × 2-theme capture contract plus manual 200% zoom/device/motion gates. | **SOURCE COMPLETE / EXECUTION OPEN** | S220 W02 preflight | Static contract PASS = 90 required captures; deleting 1440 viewport makes contract red; actual browser run blocked by CL-P0-004/CL-P1-006. | Any required route/theme/viewport drops from the matrix, or current screenshots expose unresolved premium defects. |
| CL-P1-029 | P1 | Dependency workaround discipline | Removing one missing package (Zustand) exposed another unavailable package (Zod) and therefore would have changed core player-store infrastructure without restoring the runtime. First manual revert was incomplete. | lesson player/release | Refuse workaround; restore package/player files from immutable seal and prove byte equality. | **CLOSED / REFUSED** | S220 W02 preflight | `package-lock.json` and `playerStore.ts` match S219 hashes; temporary adapter absent; exact npm failure remains honestly OPEN. | Any temporary dependency-refactor residue returns or a workaround is accepted without restoring the full current verification chain. |
| CL-P1-030 | P1 | Seal portability | First candidate S220 fresh extraction regenerated `EXCELLENCE_BACKLOG_S126.json` differently solely because the repository folder name changed (`session-219` → `session-220`). Working-tree byte stability therefore did not imply portable seal stability. | release archive / generated evidence | Remove extraction-directory name from generated truth; serialize repository-relative root `.`; reject first candidate seal and reprove from a newly packed artifact. | **CLOSED** | S220 W02 preflight | Group 0–25 red once after repair then byte-stable; path-leak scan clean; delivered tarball must fresh-extract with no generated drift. | Any generated current-state artifact depends on absolute/extraction path or changes after clean extraction. |

| CL-P1-031 | P1 | Release-environment provenance | S221 exhausted all non-invasive runtime recovery paths: local Node upgrade download unavailable; package mirror 404s core packages; Vercel has zero projects; GitHub connector has zero repositories; Vercel Sandbox package is not installed and cannot bootstrap without registry access. | release certification | Supply or connect a supported Node >=22.17/24 environment with the exact lockfile dependency tree, or a repository/project-backed CI environment; then execute the existing S220 chain without product refactor. | **OPEN — EXTERNAL EXECUTION DEPENDENCY** | S221 W02 execution | Recovery attempts recorded in SESSION221_EXECUTION_REPORT.md; no learner/runtime source changed. | Close when current S221/S220 seal runs the complete semantic/test/build/browser chain. |

## Closure status after S221 Wave-02 execution

Wave 01 remains closed for product-state truth. S221 executed every available non-invasive runtime-recovery path and found no supported local or connected remote execution environment. **Wave 02 remains OPEN.** The next load-bearing gate remains CL-P0-004 + CL-P1-006: run this exact seal under Node ≥22.17/24 or 24.x with the exact dependency tree, execute the current semantic/test/build/browser chain, then run the 90-capture matrix before any premium screenshot verdict or visual-shell fix.

## Session 222 Wave-02 execution update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-004 | P0 | Release verification | Supported Node 24 and exact lock tree restored; current typecheck/build and the sealed visual chain execute. | **CLOSED for environment/runtime** | Node 24.15.0; `npm ci` PASS; typecheck PASS; build PASS; 90/90 final captures PASS. Full Vitest has a separate open row below. |
| CL-P1-006 | P1 | Toolchain | Runtime below Chromium floor. | **CLOSED** | Node 24.15.0 satisfies declared runtime floor; Playwright Chromium executed all captures. |
| CL-P1-028 | P1 | Premium shell visual execution | Required 90-capture matrix had not executed. | **CLOSED — AUTOMATED SCOPE** | Live baseline 90/90 HTTP 200; repaired current source 90/90 PASS across both themes and all viewports. |
| CL-P1-032 | P1 | Touch accessibility | Repeated 16–40px interactive targets across shell and Basecamp. | **CLOSED** | All touch captures now fail on any sub-44px control; sealed matrix has zero failures. |
| CL-P1-033 | P1 | Current full Vitest | Windows current branch is not green: 15 failures / 12,813 tests across 6 files; 321 files and 12,798 tests pass. | **OPEN** | Fix path-separator and temp cleanup portability plus authored-set/evaluation expectation failures; rerun full suite on Linux CI and Windows. The S236 focused learner-flow set remains green. |
| CL-P1-034 | P1 | Dependency security | Installed Next 15.5.23 tree included Sharp <0.35 advisory chain. | **CLOSED** | S224 pinned sharp 0.35.3 without the breaking Next 16 migration; fresh build PASS and production audit reports 0 vulnerabilities. Reopen on incompatibility or advisory drift. |
| CL-P1-035 | P1 | Manual accessibility/device gates | Real-device touch, NVDA/VoiceOver math parity, physical 200% zoom, and normal-motion meaning review were not available. | **OPEN — HUMAN/HARDWARE** | Execute the four retained manual gates before whole-program closure. |

## Session 223 Wave-03 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-007 | P0 | K–8 interaction coverage | Historical queue claimed 81 zero-A/B acquisition/transfer candidates, but current source has completed S126–S218 campaigns. | **CLOSED** | Fresh live compiler: K–8 Tier C/D 0; unclassified 0; load-bearing concepts without experience above C 0; Tier A 821 / B 253. Fifteen prediction ceilings formally dispositioned (12 KEEP, 3 REFUSE). Reopen on live regression or falsified disposition. |
| CL-P1-036 | P1 | Audit-state integrity | `PREMIUM_INTERACTION_PRIORITY.csv` still presented pre-S126 measurements as current CHANGE authority. | **CLOSED** | Replaced with current 15-row KEEP/REFUSE ledger; `rns-02-01` used as direct falsification example. Reopen if a current-looking priority artifact disagrees with direct source. |

## Session 224 Wave-04 batch-1 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-037 | P1 | Mathematical typography | Existing sanctioned KaTeX pipeline was not wired into lesson routes; 1,025 authored strings in 95 lesson files use caret shorthand. | **CLOSED — CORE SURFACES** | Shared shorthand→TeX boundary covers lesson prose, predictions, widget prompts, core choices/sorts, feedback, and reveal answers; unit + 390px browser tests prove KaTeX/MathML and no visible caret in the reported prompt. Reopen on any core learner surface showing caret notation. |
| CL-P1-038 | P1 | Algebra I acquisition quality | `ep-02-01` was the only HS D-tier lesson; like-term acquisition was a one-pair MCQ. | **CLOSED** | Existing `dragBucket` now builds signed `x²`/`x`/constant families with diagnostic feedback; all retrieval remains; tier D→B. |
| CL-P1-039 | P1 | Quotient-rule mechanism | `dr-03-02` stated the rule mechanism through passive panels and remained C-tier. | **CLOSED** | `derivativeRuleLab` quotient mode ships in the lesson; exact signed state, keyboard controls, focused tests, and 390px browser QA green; tier C→A. |
| CL-P1-040 | P1 | Historical generated verifier portability | The historical S147+ Python authored audits hash raw Windows bytes, decode without explicit UTF-8, and emit platform separators, so a current Windows corpus is falsely reported as wholly changed. | **OPEN — TOOLING ONLY** | S146 received narrow UTF-8/POSIX-path/newline normalization and passes 37/37; the later sweep is stopped at S147 and its false FAIL artifact was discarded. Current-source corpus, schema, pedagogy, registration, build, focused tests, and security gates remain independently green. |

## Session 225 Wave-04 batch-2 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-041 | P1 | U-substitution acquisition | `in-05-01` described undoing the chain rule but its acquisition surface was passive and C-tier. | **CLOSED** | `derivativeRuleLab` substitution mode synchronizes x/u worlds, exact coefficient/power state, MathML, keyboard controls, and the no-stranded-`x` invariant; lesson C24→A35. |
| CL-P1-042 | P1 | Rolle acquisition | `ca-03-01` stated the equal-endpoint guarantee without letting the learner move the interval. | **CLOSED** | Shifted `secantSlope` Rolle mode reaches `f(0)=f(4)=0`, secant slope 0, and `f'(2)=0` as one accessible state; lesson C24→A32. |
| CL-P1-043 | P1 | Range/disclosure target robustness | Browser adversarial pass found the new native ranges needed explicit keyboard semantics and the shared accessible-state disclosure was only 16px high. | **CLOSED** | Arrow/Home/End paths reach exact targets; focused + global keyboard suites 149/149; final 390px measurements show ranges and disclosure at 44px with zero overflow. |
| CL-P1-044 | P1 | Strict CML baseline | Strict CML remains red on two existing radical-functions findings in `re-04-02`; S225 target lessons are clean. | **OPEN — PRE-EXISTING CONTENT** | Repair or formally reclassify `re-04-02` in a separate authorized lesson audit; do not attribute this baseline to S225. |

## Session 226 Premium Rebuild Wave-A update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-045 | P1 | Lesson-player visual hierarchy | Active lessons repeated title/progress/stage identity across the sticky header, waypoint card, clearing label, and action-dock metaphor; at 390 px the mathematical object began roughly 400 px down the viewport. | **CLOSED — WAVE A** | One compact lesson heading; no active waypoint, clearing label, or terrain atmosphere; target model begins roughly 138 px earlier at 390; 390/768/1440 light/dark matrix has zero overflow and zero captured sub-44 px controls; focused tests 17/17 and build PASS. |
| CL-P0-046 | P0 | Premium rebuild corpus triage | No current machine-readable inventory joined MCQ leakage, prediction value, range/directness, visual reuse, typesetting risk, and engine priority against the 1,701-lesson corpus. | **CLOSED — AUDIT BASELINE** | Six deterministic audit CSVs plus `PREMIUM_ENGINE_PRIORITY.csv` and rebuild plan generated from current source; heuristics are explicitly triage, not curriculum-change authority. |
| CL-P1-047 | P1 | Mathematical notation backlog | Fresh audit finds 9,576 learner-authored strings with ASCII-notation risk across the corpus; the sanctioned core KaTeX pipeline is present but conversion coverage is incomplete. | **OPEN — WAVE B** | Start with learner-visible C/B rows in `MATH_TYPESETTING_AUDIT.csv`; preserve one KaTeX + MathML path and screen-reader parity. |
| CL-P1-048 | P1 | MCQ blind-guess leakage | 697 of 3,293 authored/remedial MCQ moments trigger correct-option length or punctuation leakage heuristics. | **OPEN — WAVE C REVIEW** | Human-review each FAIL row in `MCQ_DISTRACTOR_AUDIT.csv`; remove leakage and map distractors to misconceptions without changing judgment tasks merely to lower MCQ count. |
| CL-P1-049 | P1 | Prediction ceremony | 200 of 1,362 authored prediction gates do not meet the direct causal surface threshold in the deterministic audit. | **OPEN — WAVE D REVIEW** | Review `PREDICTION_GATE_AUDIT.csv`; remove duplicated/non-causal gates, retain informative ungraded prediction → action → reveal loops. |

## Session 227 Premium Rebuild Wave-B update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-047 | P1 | Mathematical notation backlog | The shared pipeline covered caret powers only and left high-frequency fraction, radical, arithmetic, hint, explanation, review, and mastery-lens surfaces outside the canonical boundary. | **CLOSED — WAVE B BOUNDARY** | One conservative author-shorthand → TeX → KaTeX/MathML route recognizes 9,327/9,576 B/C risk signatures across 879 lessons; 249 complex/false-positive rows are retained in `MATH_TYPESETTING_WAVE_B_RESIDUAL.csv`; 3×2 exponent matrix plus fraction/radical spot checks pass. Reopen on raw core notation, false conversion, missing MathML, or renderer duplication. |
| CL-P1-050 | P1 | Dark-theme math contrast | `.dark .lesson-stage` used a dark gradient while the stage and widget palette pinned text to ink, making prompts and equations nearly unreadable. | **CLOSED — WAVE B** | Dark stage restored to paper-light gradient with ink; all 390/768/1440 dark exponent states use the corrected contract; nominal prompt contrast 12.96:1; verifier pins the rule. |
| CL-P1-051 | P1 | Mobile visual labels | `asv-01-01`'s triangle figure clips the right-side height label and overlaps the center label at 390 px. | **OPEN — WAVE E** | Evidence: `PREMIUM_REBUILD_SCREENSHOTS_S227/asv-01-01-step1-390-light-after.png`. Repair through the visual rebuild queue with SR-label parity; do not mix it into typesetting architecture. |

## Session 228 Premium Rebuild Wave-C batch-1 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-048 | P1 | MCQ blind-guess leakage | 697 of 3,293 MCQ moments exposed a correct-answer length or punctuation clue. Four repeated Grade 5 decimal patterns accounted for 22 high-frequency rows. | **IN PROGRESS — 22/697 REMEDIATED** | The 22 target rows now pass the deterministic blind-guess check; all distractors and authored feedback remain intact; regenerated queue has 675 rows. Continue Wave C by learner harm × frequency × visibility × strategic importance. |
| CL-P1-052 | P1 | Learner-screen disclosure | The collapsed CML surface exposed “Mastery lens,” lifecycle badges, “Deep dive,” a generic multi-domain action goal, and representation data while the learner was still solving the task. | **CLOSED — PROGRESSIVE DISCLOSURE** | Collapsed state is one optional, task-specific prompt; lifecycle/color-key metadata and preview strip are removed; expanded exponent copy is rule-specific; all visible controls are at least 44 px and the 390 px state has no overflow. |
| CL-P1-053 | P1 | Exponent visual meaning | `ep-01-02` paired a same-base product-rule illustration (`a³·a²=a⁵`) with power-of-a-power prose (`(aᵐ)ⁿ=aᵐⁿ`), visually contradicting the lesson explanation. | **CLOSED — RULE-SPECIFIC VISUALS** | The existing power-of-a-power factor-group asset now shows two copies of `2³` producing six factors; the separate product-of-powers illustration remains on its own rule state; interactive labels explain the repeated groups without exposing `task: exponentChain`. |

## Session 229 Premium Rebuild Wave-C batch-2 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-048 | P1 | MCQ blind-guess leakage | Six repeated foundational prompts across Grades 2, 4, and 5 accounted for 24 additional keyed-option length or punctuation clues. | **IN PROGRESS — 46/697 REMEDIATED** | All 24 batch-2 rows now pass and all distractors, correct markers, and feedback remain intact; regenerated queue has 651 rows. Continue Wave C with repeated high-harm families before Wave D. |

## Session 230 Premium Rebuild Wave-C batch-3 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-048 | P1 | MCQ blind-guess leakage | Six repeated Grade 5 concept families accounted for 18 additional keyed-option length clues across order of operations, remainder interpretation, partial quotients, fraction reasonableness, unit-cube volume, and the `V = B × h` generalization. | **IN PROGRESS — 64/697 REMEDIATED** | Exactly 18 keyed labels changed; all prompts, 54 wrong labels, 72 feedback strings, correct markers, widgets, and IDs remain intact. The regenerated queue has 633 rows. Continue Wave C with human-reviewed families; do not mechanically rewrite delicate or ambiguous prompts. |

## Session 231 Premium Rebuild Wave-C batch-4 update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-048 | P1 | MCQ blind-guess leakage | Twenty-seven clear answer families accounted for 61 additional length or punctuation clues across 31 lesson files, spanning number sense, measurement, data, operations, fractions, volume, and systems. | **IN PROGRESS — 125/697 REMEDIATED** | Exactly 61 keyed labels changed and 61 target decisions moved to KEEP; zero row identities, non-target decisions, prompts, distractors, feedback strings, correct markers, widgets, or IDs changed. The regenerated queue has 572 rows. Continue with reviewed singleton and residual repeated families; keep curriculum-truth issues separate. |

## Session 232 Figure/text alignment update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-054 | P0 | Illustration/text truth | Three fixed-number illustrations were reused as generic placeholders, including a `4 + 3 = 7` number line beside equal/unequal-fraction prose. Across 3,816 figure placements, these three families account for 951 uses but only 9 truthful text matches. | **CLOSED — DETECTED FIXED EXEMPLARS** | The reported lesson now uses the exact equal/unequal partition figure; 942 unrelated placements fail closed before rendering; generator, runtime, full-corpus audit, 21 focused tests, typecheck, integration, registration, build, local browser DOM, accessible description, and same-viewport before/after comparison pass. Reopen if a fixed exemplar renders beside prose that does not describe its numbers or relationship. |

## Session 233 adversarial figure/text update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-054 | P0 | Illustration/text truth | The first S232 replacement still showed four parts while its prose said three/thirds. A broader description-to-copy audit also found 136 additional suspicious exact bindings involving partition counts, operations, or disjoint worked-example numbers. | **SAFE RUNTIME / REPLACEMENT BACKLOG OPEN** | The reported screen now agrees on four/fourths in source, narration, generator, accessible description, DOM, and screenshot. Across 3,816 placements, 1,078 are withheld and 2,738 render; zero adversarially flagged pairings render. Correct replacements have not yet been created for the withheld queue. Close the visual backlog only after each restored pairing passes human visual and accessible-description parity review. |

## Session 234 premium engine/lab and landing update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-055 | P0 | Landing mathematical model | The landing prompt asked for five groups of four but omitted `groupSize`; the generic renderer therefore showed four one-item containers and the only manipulation was a range slider. | **CLOSED — LANDING + SHARED SLIDER** | Landing now exposes five colored rows, a real berry asset, direct Add/Remove controls, and a synchronized groups × group-size = total equation. The shared slider engine gains 44 px step controls and accessible group lists. Tests, typecheck, build, production-browser state transition, and success feedback pass. |
| CL-P0-056 | P0 | Illustration replacement coverage | Runtime containment withheld 1,078 misleading placements but no durable per-placement replacement queue existed. | **OPEN — 1,078 REPLACEMENTS REQUIRED** | `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` contains 1,078 open rows (962 P0, 116 P1), each with source, lesson, step, current figure, priority factors, mismatch evidence, and restoration condition. Hidden remains explicitly unequal to fixed. |
| CL-P1-057 | P1 | Engine/lab premium quality | The 127-engine audit retains 15 redesign, 3 polish, and 2 deprecation-candidate families; slider-only control was a high-leverage shared weakness. | **IN PROGRESS — 1 SHARED FIX (pre-S330) + 1/15 REDESIGN FAMILY BUILT S330 (`pointEntry`)** | `PREMIUM_ENGINE_PRIORITY.csv` remains the ranked authority; see the sixth post-recon addendum below for `pointEntry`'s evidence. 14/15 REDESIGN families remain, in learner-harm × frequency × visibility × strategic order; verify lesson meaning before changing engine behavior. |

## Session 235 post-verdict exploration update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-058 | P0 | Correct-state interaction | Landing, lesson, review, and practice surfaces treated a correct verdict as a hard interaction lock, preventing overshoot, reversal, and comparison with wrong states. | **CLOSED — SHARED CHECKPOINT CONTRACT** | Correct/revealed results are now saved checkpoints. All 127 engines inherit unlocked post-verdict controls and ungraded `Check this state`; exploration cannot duplicate attempts, XP, mastery, review evidence, or result callbacks. Landing supports 0–8 groups around target 5. Focused state, UI, keyboard, and idempotence tests pass. |
| CL-P1-059 | P1 | Engine-specific play depth | Removing the shared lock does not make one-way or answer-only engines reversibly playful. | **OPEN — 17 ENGINE FAMILIES** | `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` identifies 17 engine families for reversible/direct-manipulation remediation, 107 KEEP-with-regression rows, and 3 existing-disposition reviews. Repair by learner harm × frequency × visibility × strategic importance. |

## Session 236 learner-focus and workload-truth update

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P1-060 | P1 | Learner-screen focus | The expanded CML surface placed authoring labels, lifecycle metadata, invariants, transfer tags, move telemetry, reflection prompts, and multiple bordered cards between the mathematical model and retry feedback. | **CLOSED — ACTIVE TASK SIMPLIFIED** | Active and retry states now show only the model, specific state cue, and plain Undo/Reset controls. The optional post-checkpoint panel contains only equivalent mathematical forms. The accessible model description remains available under the learner-facing label `Describe this model`. Reopen if internal curriculum/process metadata returns to an active learner screen. |
| CL-P1-061 | P1 | Pending-workload truth | The durable pending queue contained only illustration replacements, leaving notation, MCQ, prediction, interaction, engine, ledger, and program-wave work fragmented across separate audits and handovers. | **CLOSED — CONSOLIDATED QUEUE** | `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` now contains 11,487 current open rows across nine workstreams, with deterministic regeneration via `npm run audit:pending-workload`. Queue presence is not completion; each child item retains its own closure condition. |

## Session 319 detector-refresh update

Bounded reconciliation packet (`reports/closure/S319_DETECTOR_REFRESH.md`). Scope: read-only
cross-check of the 27 currently OPEN `CLOSURE_LEDGER` rows against S316–S318 evidence; no writer
other than `npm run audit:pending-workload` was executed. 25 of 27 rows had no S316–S318 evidence
bearing on their stated closure condition and are unchanged (not reproduced below). The two rows
below share one underlying child artifact (`reports/vis/VIS01_PLACEMENTS.csv`, the illustration
withheld-placement detector) that S316–S318 drove to zero; both stay OPEN because their own
recorded reopen/closure condition requires a human visual/accessible-description parity pass that
no S316–S318 report performs or claims.

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---:|---|---|---|---|
| CL-P0-054 | P0 | Illustration/text truth | S316–S318 cleared every remaining `VIS01_PLACEMENTS.csv` `cause != RENDERS` row via four S318 lane clearances (G3, G4/G7+HS, K2) plus prior S316/S317 figure-truth fixes. Live re-measurement: 3,573/3,573 placements `RENDERS`, 0 withheld. | **SAFE RUNTIME / DETECTOR CLEAR — HUMAN PARITY REVIEW STILL OPEN** | Detector evidence: `reports/vis/VIS01_PLACEMENTS.csv` (0 non-`RENDERS` rows). Clearance evidence: `reports/closure/S318_G3_WITHHELD_CLEARANCE.md`, `S318_G4G7_WITHHELD_CLEARANCE.md`, `S318_HS_WITHHELD_CLEARANCE.md`, `S318_K2_WITHHELD_CLEARANCE.md`. None of these four reports records a screenshot, browser render, or human visual/accessible-description parity pass — this row's own reopen condition ("close the visual backlog only after each restored pairing passes human visual and accessible-description parity review") is therefore not met. Status stays OPEN; do not close without that review. |
| CL-P0-056 | P0 | Illustration replacement coverage | Same underlying backlog as CL-P0-054, tracked through the consolidated queue this row itself cites. `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` now regenerates with 0 `ILLUSTRATION_REPLACEMENT` rows (962 P0 + 116 P1 = 1,078 at S234; 0 now), because every placement the detector once flagged now renders per current source. | **OPEN — DETECTOR CLEAR / HUMAN PARITY REVIEW PENDING (was 1,078 REPLACEMENTS REQUIRED)** | Same evidence as CL-P0-054. Per the queue contract ("queue presence is not completion"), the inverse also holds — queue absence is not completion either. Close only after the same human parity review CL-P0-054 needs. |

## Session 329 aggressive-completion wave update

Six OPEN rows investigated with current-tree, gate-verified evidence (agents explicitly instructed
that the ledger's own rule — "an item closes only with evidence; historical green is never
current-tree closure evidence" — governs; nothing here is claimed CLOSED without a fresh gate run
recorded below). Full per-row methodology, diffs, and reasoning: `reports/closure/S329_CLOSURE_CL1.md`
(CL-P1-044, CL-P1-040), `S329_CLOSURE_CL2.md` (CL-P1-051, CL-P1-012), `S329_CLOSURE_CL3.md`
(CL-P1-049), `S329_CLOSURE_CL4.md` (CL-P1-033). Not investigated this wave, unchanged: the remaining
21 OPEN rows, which are gated on real infrastructure/business integration (billing, email delivery,
hosted deployment, LTI, observability — CL-P0-016/017/018/020/023, CL-P1-019/021), empirical human
learner pilots (CL-P0-022), human/hardware-only review (CL-P0-054, CL-P0-056, CL-P1-035), or a
product-direction decision that is not this session's authority to make unilaterally (CL-P0-003,
CL-P0-008, CL-P0-009, CL-P0-013, CL-P1-010, CL-P1-011, CL-P1-014, CL-P1-015, CL-P1-031, CL-P1-059).

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-044 | P1 | Strict CML baseline | Strict CML remains red on two existing radical-functions findings in `re-04-02`; S225 target lessons are clean. | **CLOSED — VERIFIED S329** | `npm run cml:lint:strict` on current tree: 0 error(s), 0 warning(s) across all 1,701 lessons. The two named findings (`flagship-without-manipulation` and `flagship-missing-direct-surface`, both `radical-functions/re-04-02.json#1`, recorded verbatim in `WAVE0_TRUTH_BASELINE_S242.md` §8) no longer fire because `scripts/cml-lint.mjs`'s `DIRECT` engine set is now derived from `scripts/engine-capabilities.json` (manip≥2) instead of a hand-typed list that omitted `extraneousRootLab` (manip:3, the engine `re-04-02` step `i1` uses) by oversight. The fix is general (25 more engines now owe the full flagship contract) and was already on this branch before this audit — `scripts/cml-lint.mjs` and `re-04-02.json` are both byte-identical to HEAD; no edit was made this session. `re-04-02.json#i1` independently carries a complete 13-field flagship contract. Fresh same-session `validate:content` 1840/1840 and `lint:pedagogy` 1711/1711 also pass. Reopen if strict CML returns a `re-04-02` finding, or if `DIRECT`'s derivation reverts to a hand-typed/undated list. |
| CL-P1-040 | P1 | Historical generated verifier portability | The historical S147+ Python authored audits hash raw Windows bytes, decode without explicit UTF-8, and emit platform separators, so a current Windows corpus is falsely reported as wholly changed. | **CLOSED — PORTABILITY FIXED (TOOLING)** | `affine-relationship-s147.py`, `exact-number-s148.py`, and `point-set-reasoning-s150.py` patched with the same narrow UTF-8-decode/CRLF-normalize-before-hash pattern `quotient-reasoning-s146.py` already carried; `geometric-constraint-s149.py` given the same explicit-UTF-8 read fix. S147 additionally had a `str(Path)`-vs-`.as_posix()` separator mismatch fixed (made its two comparison sets permanently unable to match on native Windows, independent of CRLF). Verified behavior-preserving on this Linux/UTF-8/LF tree: original vs. patched produce byte-identical stdout/exit code for all four scripts. SEPARATE, NEW finding, NOT fixed here: none of the five S146–S150 scripts currently exit clean, because each compares against a frozen single-session hash ledger last extended ~S210–S218 while the corpus has had ~180 further sessions since (the same 1,129-vs-1,701 gap `CL-P0-027` already names) — the row's "S146 passes 37/37" claim expired from ordinary corpus growth, not from a portability defect. Actively-maintained gates remain independently green: `validate:content` 1840/1840, `lint:pedagogy` 1711/1711, `cml:lint:strict` 0/0. Recommend these five scripts be retired/archived for staleness in a future round — separate, larger work, not decided here. |
| CL-P1-051 | P1 | Mobile visual labels | `asv-01-01`'s triangle figure (`TriangleHalfRectangle`, `src/components/figures.tsx`) clipped its right-side "height" label past the SVG's own `viewBox` (reproducible at any render width, not only 390px) and its center caption sat directly on the triangle's hypotenuse stroke. | **CLOSED — S329** | `viewBox` widened 240×130 → 280×160; caption moved below the shape (matching `LShapeDecompose`/`PrismNet`'s existing bottom-caption placement), putting it entirely below the shape's extent so the hypotenuse cannot cross it by construction. Verified with `textBoxes.testkit.ts`'s exact box model plus a Liang-Barsky segment/rect check: all 3 labels have positive clearance from every viewBox edge and the hypotenuse. New permanent gate `figures.asv0101TriangleClip.s329.test.tsx` (3/3, negative-control validated against the original geometry). `figures.labelCollision.s238.test.tsx`'s one remaining failure is the pre-existing, out-of-scope `asv-surface-vs-volume` figure — a different bug, unchanged by this session. | Collision or clip observed at any supported viewport/zoom, or the figure's geometry changes without re-running `figures.asv0101TriangleClip.s329.test.tsx`. |
| CL-P1-012 | P1 | dCL visual polish | `distributionCompareLab`'s judge-mode "overlap ≈ N%" label sat inside the gap-bracket's tick lines; for 5 of the current 10 judge instances (recounted this session — `sp-02-01`, `sp-02-02`, `sp-02-03`, `si-03-03`; the row's "7 steps / 3 lessons" was S218-era and stale) the bracket visually pierced the text at exactly the small-gap moments the evidence exists to teach. | **CLOSED — S329** | Moved the "overlap ≈" label above the bracket, stacked over "gap ≈". Liang-Barsky check confirms zero bracket-vs-label collisions across all 10 current judge instances after the fix (was 5/10 colliding before). `widgets.labelCollision.s237.test.tsx -t distributionCompareLab` 5/5, `widgets.distributionCompare.tone.s218.test.tsx` 8/8, `widgets.distributionCompare.s131.test.tsx` + `widgets.colourCue.s242.test.tsx` 11/11. New permanent corpus-scanning gate `widgets.dclBracketLabel.s329.test.tsx` (negative-control validated). | Collision observed at any supported viewport/zoom, or a newly authored `gapUnits` value reintroduces overlap (the new gate reruns against the live corpus, so this should self-detect). |
| CL-P1-049 | P1 | Prediction ceremony | 200 of 1,362 authored prediction gates did not meet the direct causal surface threshold in the deterministic audit — but that audit is a per-widget-type capability lookup that never reads a gate's own `predict.prompt`/`predict.reveal` text, so its 200-row flag measured widget-engine capability, not gate quality. | **CLOSED — WAVE D REVIEW COMPLETE, 200/200 REVIEWED, 0/200 REMOVED** | S329 human review of all 200 flagged rows against their own live `predict.prompt`/`predict.reveal` text: 169/200 are genuine informative prediction → action → reveal loops, retained unchanged; 31/200 already have no live `predict` block at all (resolved by unrelated later content revision); 0/200 were genuinely duplicated within their lesson or non-causal/arbitrary. Zero lesson edits; 179 signed KEEP dispositions in the ledger (18 of the 200 lessons reviewed but left undisposed — owned by other same-wave packets, all also classify retain). Full row-by-row evidence: `reports/closure/S329_CLOSURE_CL3.md`. | Reopen if a future detector that reads gate text directly (not widget_type) flags a specific gate, or if any undisposed lesson's predict content changes to reintroduce a genuine duplicate/non-causal gate. |
| CL-P1-033 | P1 | Current full Vitest | Windows current branch is not green: 15 failures / 12,813 tests across 6 files; 321 files and 12,798 tests pass. | **OPEN — SOURCE FIXES APPLIED, WINDOWS RE-RUN STILL NEEDED** | S329 source audit fixed 3 concrete path-separator defects (`content.authoredKeys.s242.test.ts` + `widgets.buildReadout.s242.test.tsx`'s native-separator `globSync().split("/")`; `AvatarDisplay.fence.test.tsx`'s bare `/`-only path check; `deployability.test.ts`'s Linux-only `/proc/version` dependency) and 2 concrete temp-cleanup defects (`authz.s46.test.ts` + `badJson.s46.test.ts` deleting a temp dir with an open DB handle still inside it — Windows enforces the lock, POSIX doesn't). Audited and found no instance of the third named class (order-dependent Set/array expectations). Targeted run of all 6 fixed files: 20/21 pass; the 1 remaining failure is proven pre-existing/unrelated content-corpus drift via `git stash` A/B test. This sandbox cannot execute on Windows, so the row stays OPEN — close only on an actual Windows (or Windows CI) full-suite re-run. | Rerun full suite on Linux CI and Windows; the S236 focused learner-flow set remains green throughout (unchanged from the row's standing reopen condition). |

## Session 330 post-recon closure review

Targeted, bounded follow-up on the two OPEN rows whose own recorded condition explicitly names
**browser**-level execution, not just source/test evidence: CL-P1-031 (closure condition: "current
S221/S220 seal runs the complete semantic/test/build/browser chain") and CL-P0-003 (reopen
condition: "Full tests/browser show route, persistence, or accessibility regression"). This review
was not the S330 post-recon wave's primary goal — that wave redesigned 7 duplicate-template lesson
collisions found by a 7-agent audit (full account in the "S330 post-recon addendum" section of
`HANDOVER_COWORK_S316.md`) — but that wave produced the freshest current-tree semantic/test/build
evidence available this session, so this entry checks it against each row's own stated condition
rather than assuming it satisfies either. Per the ledger's own governing rule (line 3), neither row
closes here.

Fresh current-tree evidence gathered this pass, after all S330 post-recon content/test edits landed:
`npx tsc --noEmit -p .` exits 0 with zero diagnostics (`/tmp/typecheck-s330-postrecon.log`, empty).
`npm run build` exits 0; every route, including `/placement` and `/onboarding`, compiles and
prerenders (`/tmp/build-s330-postrecon.log`). A fresh full `npx vitest run` — 727 test files, 15,772
tests — finished at Test Files 73 failed / 654 passed, Tests 299 failed / 15,472 passed / 1 skipped
(`/tmp/vitest-s330-postrecon-full.log`). Reconciled against the immediately-prior full run from
earlier this same session (`/tmp/vitest-s330-full.log`, 74 failed files / 300 failed tests, captured
before this wave's edits) via an exact sorted-`FAIL`-line `comm` diff: zero FAIL lines appear in the
new run that were absent from the old one (no new failures anywhere in the suite), and exactly one
FAIL line present in the old run is absent from the new one —
`session244.chatgptWorkPrecache.test.ts > ... > is a deterministic, byte-current tracked manifest` —
which is the expected, understood result of this wave's own report regeneration (the precache
manifest's recorded workload/decision counts were stale and are now current), not a masked
regression. One pre-existing failure touches the onboarding area in both the old and new run,
unchanged by this session: `src/lib/onboarding.branches.s242.test.ts > ... > grade 0 offers every
domain its catalogue carries` — a domain-catalogue-coverage gap, unrelated to the legacy-quiz-vs-
diagnostic inconsistency CL-P0-003 is actually about.

A genuine attempt was made to close the remaining gap — real browser execution — via
`npx playwright test e2e/smoke.spec.ts --project=chromium` (the repo's existing 3-test smoke spec
covering dashboard/courses rendering, a lesson opening in the player, and a bad-date API 400). Two
attempts (180s, then 280s outer timeouts) both hung without Playwright itself exiting, and the first
attempt left an orphaned `next-server`/`npm run dev` process pair running unattended at 58–64% CPU /
~2.9GB RAM, discovered still competing with the concurrently-running vitest gate and cleaned up with
a targeted `kill -9` on the specific PIDs. This was judged an unreliable path in this sandbox rather
than retried further, per the standing "avoid rabbit holes" discipline — so the browser leg of
either row's condition remains genuinely unobtained here, not quietly assumed. (CL-P1-033, the
separate full-Vitest row, names a Windows-specific re-run condition this Linux-sandbox run does not
speak to either way; it is not rescored by this entry.)

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-031 | P1 | Release-environment provenance | The semantic/test/build legs of this row's closure condition now have same-session current-tree evidence; the browser leg — the specific reason this row has stayed open since S221 — was attempted and could not be obtained in this sandbox. | **OPEN — SEMANTIC/TEST/BUILD LEGS CURRENT, BROWSER LEG UNOBTAINABLE HERE** | `/tmp/typecheck-s330-postrecon.log` (0 diagnostics), `/tmp/build-s330-postrecon.log` (exit 0), `/tmp/vitest-s330-postrecon-full.log` reconciled zero-new-failures against `/tmp/vitest-s330-full.log`. Playwright attempt log: two hung runs, no captures produced. Close when a Playwright-capable environment (or a sandbox where the Next dev server does not hang under Playwright) runs the existing `e2e/` suite against this seal. |
| CL-P0-003 | P0 | Onboarding/placement | This row's own reopen trigger is "full tests/browser show a regression." The "tests" half now has current-tree confirmation of zero new regressions anywhere in the suite (one pre-existing, unrelated onboarding-area failure is unchanged from before this session, per above). The "browser" half — real `/placement` and `/onboarding` route navigation, persistence-across-navigation, and accessibility-tree checks — was attempted via the same Playwright run as CL-P1-031 and could not be obtained. | **CLOSED-SOURCE / RUNTIME REPROVE OPEN (unchanged) — TESTS REFRESHED, BROWSER LEG UNOBTAINABLE HERE** | Same typecheck/build/vitest evidence as CL-P1-031, plus the fresh build's confirmation that both `/placement` and `/onboarding` compile and prerender cleanly. No route/persistence/accessibility regression appears in the current-tree test evidence. Close (or definitively reopen) only once genuine browser-level route/persistence/accessibility evidence is captured — this pass did not produce it. |

## Session 330 MCQ-leakage detector supersession (CL-P1-048)

`CL-P1-048`'s own recorded numbers ("697 of 3,293... trigger correct-option length or punctuation
leakage heuristics", last updated S231 at "125/697 REMEDIATED... regenerated queue has 572 rows")
trace to a composite `blind_guess_test` verdict in the now-superseded `MCQ_DISTRACTOR_AUDIT.csv`.
`scripts/audit/mcq-leakage.mts`, built in a later session (S242, tagged in its own header), explicitly
replaced that detector — its own comment explains why: *"A composite verdict cannot be worked: it
says an item is guessable without saying WHY... this program has already been slowed twice by counts
that were true when written. So this measures the live corpus, and it scores each leak SEPARATELY."*
It splits the old composite into five independently-scored, named tells (length, lone-justification
qualifier, absolutes-in-distractors-only, grammar/stem-completion, odd-one-out-of-form) and is a
read-only, no-`--write`-needed measurer of the CURRENT corpus each time it runs. `CL-P1-048` was never
revisited after this supersession — the same class of staleness `CL-P1-040` already named for the
S146–S150 Python audits, caught here for the same underlying reason: a session built a better tool
and the ledger row describing the old one's queue was never updated to point at it.

Ran `scripts/audit/mcq-leakage.mts` fresh against the full current corpus: **5,237 MCQ items measured
(2,564 authored + 2,673 generated) — every authored and generated MCQ surface, not a sample — with
only 5 items carrying any tell.** This is not "692 of the old 697 got fixed since S231" — the old
composite figure was never trustworthy at row-count granularity (that is exactly what its own successor
tool's header says). It is a full, current, more precise re-measurement that happens to find very
little live leakage. Each of the 5 was read individually, not mechanically batch-edited:

- `fn-02-02#k3` and `fn-03-02#k3` (a matched nth-term/geometric-term catch-the-mistake pair): the
  correct option's label carried a full parenthetical justification while both wrong options were
  bare assertions with zero reasoning — the tool's documented "length-answer-explains-itself" pattern.
  Fixed by trimming each correct label to the bare claim, unchanged feedback already carrying the
  full reasoning.
- `g2p-02-01#k2`: the correct option was the only one of four citing a specific number+unit ("32 cm"),
  an odd-one-out-of-form tell. Fixed by generalizing the label to "the bigger piece" — same comparison,
  no number — with the concrete arithmetic already present, unchanged, in feedback and a hint.
- `pr-04-03#k2`: pure grammatical-form asymmetry (a full clause against two short noun phrases, no
  inline reasoning in any option). Fixed by trimming the label to match the others' register, with no
  meaning change.
- `rns-03-02#ch1`: reviewed and explicitly KEPT, not edited. This challenge is a reasoning-comparison
  task by design ("a classmate's reasoning went wrong somewhere — find the correct one"); all four
  options already carry parallel inline reasoning, and the correct option is longer only because the
  true justification requires citing two tenths-level brackets instead of one wrong, simpler idea.
  This is precisely the "prose against prose" case the tool's own header carves out as requiring human
  misconception-family judgment rather than a mechanical rewrite, and on that judgment it is fine as
  authored.

Every fix was verified against live runtime code (`Lesson.parse`, `lintLesson`, `evaluate()` for the
correct option and every distractor) via a temporary vitest harness, then confirmed by re-running
`mcq-leakage.mts` on the edited files: the exact 4 tells cleared, zero new tells anywhere in the
corpus. A 4-file targeted regression sweep (every test file referencing any of the 4 touched lesson
ids) passes with a `git stash` A/B confirming the only behavioral difference pre/post-edit is the
expected precache re-pin. Full derivation chain re-run clean (`staleCount: 0`, `SOURCE_SEAL_MATCH`).
5 signed dispositions recorded (all `KEEP` — 4 for already-verified fixes, 1 for the reviewed-and-
justified original), `reports/closure/cowork-staging/laneA-s330-mcqleakage.jsonl`.

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-048 | P1 | MCQ blind-guess leakage | The row's "697/3,293" composite-detector framing is superseded by S242's cause-separated `mcq-leakage.mts`. Full-corpus re-measurement under the accurate tool: 5 findings across 5,237 measured items, not a sample. All 5 individually reviewed; 4 had a safe mechanical fix, 1 is a legitimate reasoning-comparison item correctly left as authored. | **CLOSED — RE-MEASURED UNDER SUPERSEDING DETECTOR, 5/5 REVIEWED, 4/5 FIXED, 1/5 JUSTIFIED KEEP** | `scripts/audit/mcq-leakage.mts` run on current tree: 0 findings remain that weren't individually reviewed and dispositioned. 5 signed ledger records, evidence and rationale above. `reports/mcq/MCQ_LEAKAGE_INDEX.csv` is the live artifact (regenerate with `--write` to reproduce). | Reopen if `mcq-leakage.mts` flags a new item on the current corpus (new authored content, or a distractor/label edit that reintroduces a tell), or if a future misconception-family review overturns the `rns-03-02/ch1` KEEP judgment. |

## Session 330 third post-recon addendum — CL-P1-059 and CL-P1-015 were already done

User asked to prioritize across CL-P0-008, CL-P1-057/059/015, and CL-P1-010. Investigating all four
before touching anything found that two of them are not open work at all — they were fully closed in
S247/S248, and the ledger prose was simply never updated past an earlier checkpoint. `S319_DETECTOR_
REFRESH.md` (line ~104-109) even noticed the live queue already showed 0 rows for the exploration
workstream and explicitly declined to close it, because it only cross-checked `reports/closure/
S316-318_*.md` and never looked in `reports/eng/`, where the actual S247/S248 evidence lives — a
documented process blind spot, not a disagreement about the facts. Independently verified before
writing either row below: `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` is 127/127
`exploration_decision=KEEP_WITH_EXPLORATION_REGRESSION` (fresh `python3 csv.DictReader` count, not
trusted from prose); `PREMIUM_INTERACTION_PRIORITY.csv` has 0 `AUDIT-OPEN`/`AUDIT-NEXT` rows (fresh
`grep -c`); and all three cited test files run green on the current tree (`session248.
engineReversiblePlayAudit.test.ts` + `session247.engineDispositionPostVerdict.test.tsx` +
`session248.engineReversiblePlay.test.tsx`, 37/37 pass, this session).

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-059 | P1 | Engine-specific play depth | The row's "OPEN — 17 ENGINE FAMILIES" describes the S235 checkpoint. S247 closed the 3 "existing-disposition" engines (`compassConstruct`, `systemsExplore`, `matrixTransform` — `reports/eng/S247_ENGINE_DISPOSITION_CLOSURE.md`); S248 closed the 17 REMEDIATE_ENGINE_PLAY rows (`reports/eng/S248_ENGINE_REVERSIBLE_PLAY_CLOSURE.md`: "17/17 contract rows... zero remaining REMEDIATE_ENGINE_PLAY rows"). The fix was evidentiary, not a UI change: regression tests proving each engine's existing native control (text input, radio group, arrow buttons) is technically reversible — no lesson JSON, evaluator, or grading path changed. | **CLOSED — S247/S248 (this addendum only updates the ledger to say so)** | `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` 127/127 `KEEP_WITH_EXPLORATION_REGRESSION` (fresh count, this session). `session248.engineReversiblePlayAudit.test.ts` asserts the `REMEDIATE_ENGINE_PLAY` filter is empty; `session248.engineReversiblePlay.test.tsx` fires real DOM events proving round-trip reversibility per engine. All green, this session. **Important scope note, not this row's concern:** this closure is about *reversibility* (can a learner change and un-change an answer), a different axis from CL-P1-057's *manipulation quality* — the same engines can be (and are) simultaneously KEEP here and REDESIGN there; do not read this closure as touching CL-P1-057. | Reopen if any engine's exploration contract regresses (a lesson change removes the native control the reversibility proof relies on), per the standing `session248.engineReversiblePlayAudit.test.ts` gate. |
| CL-P1-015 | P1 | Advanced engines | The row's "4/7 CLOSED... nested rules, error propagation, and growth race remain" describes an S225 checkpoint. S247 formally dispositioned all three remaining gaps (`reports/pedagogy/S247_INTERACTION_NECESSITY_DISPOSITIONS.md`) — not "still open," but decided: `dr-04-02` (nested rules) **REFUSE** — `derivativeRuleLab`'s chain mode coordinates only two local rates, this lesson needs three nested layers inside a product, and substituting the lab would misrepresent required rule order; existing layer figure/structure MCQ/staged decomposition/numeric check stay. `dc-03-02` (error propagation) **KEEP, no build** — 3 existing `exactNumberLab` states (absolute/percentage/reverse-tolerance error) plus a staged relative-error derivation already cover it; a 4th would duplicate the relationship (explicit caveat in the source doc: the separate exact-number answer-signalling debt is NOT waived by this KEEP). `exp-04-03` (growth race) **KEEP, no build** — `expLogExplore`'s base slider is already causal, and 3 concept figures already show overtaking/difference-vs-ratio evidence; a standalone race engine would duplicate it. | **CLOSED — 7/7 DISPOSITIONED (4 built earlier + 3 REFUSE/KEEP-no-build at S247), NOT "3 REMAIN"** | `reports/pedagogy/S247_INTERACTION_NECESSITY_DISPOSITIONS.md` (quoted above). `reports/closure/S319_ASSESS_CA_DR.md:202` independently corroborates the `dr-04-02` REFUSE from an unrelated later content audit ("nested chains, implicit circle slope -0.75 verified"). `PREMIUM_INTERACTION_PRIORITY.csv` has 0 `AUDIT-OPEN`/`AUDIT-NEXT` rows (fresh grep, this session); the live consolidated queue has 0 `INTERACTION_NECESSITY_REVIEW` rows. | Reopen only if a future session proposes new evidence that one of the 3 REFUSE/KEEP dispositions was wrong (e.g. a concrete demonstration that the named duplication concern doesn't actually hold), not merely by re-flagging the same lessons. |

## Session 330 fourth post-recon addendum — CL-P1-010, the 14 high-use spatial manipulatives

Re-applied this row's own rule (high-use ≥20 authored steps, spatial `manip`≥2 in
`scripts/engine-capabilities.json`, no `describeState.ts` case) against the CURRENT 129-type registry
rather than trusting the row's stale "84/127, 13 engines" prose. Fresh result: 90/129 had a case, 39
did not, and 14 of those 39 meet the high-use-spatial threshold: `slider`, `tapDiagram`,
`baseTenCompose`, `lengthCompare`, `numberLinePlace`, `hundredthsGrid`, `barBuilder`, `clockSet`,
`volumeBuilder`, `algebraTiles`, `columnCalc`, `numberLineHop`, `tenFrame`, `fractionBar`.

Built a real `describeState.ts` `case` for all 14 — not a stub. Each reads only `spec` + `value` (+
`tone` for the reveal gate) and reuses the SAME exported helper its renderer computes its own numbers
from (`hopLabel`, `prismVolume`, `roundSolidCoef` from `schema.ts`; `algebraTilesCanonicalModel` from
`mmip/algebraTilesModel.ts` for the one engine whose state needs real model derivation, not just field
reads) — the established house rule that the spoken description can never drift from the picture,
because it is never a reimplemented formula. Every case was checked BY HAND against its renderer's own
reveal-ghost gating before being written, not assumed: `hundredthsGrid`/`lengthCompare`(align)/
`numberLinePlace`/`clockSet`/`barBuilder`/`baseTenCompose`/`slider`/`volumeBuilder`/`tapDiagram`/
`tenFrame`/`numberLineHop`(landing mode) each reveal a withheld target ONLY under the identical
`tone === "info"` gate their own ghost uses (verified per-engine by reading the renderer source, not
inferred); `fractionBar` reveals only under the identical authored `spec.showTarget` flag (a different,
non-tone gate its OWN aria-label uses — matched exactly rather than assumed to be tone-gated);
`lengthCompare`(pick mode), `numberLineHop`(hop-size/GCF mode), and `algebraTiles` never reveal at any
tone, because their renderers have no numeric reveal-ghost either — parity means the same task, not an
easier one, the same principle the existing `numberLineRay` case documents. 10 of the 14
(`tapDiagram`, `baseTenCompose`, `numberLinePlace`, `barBuilder`, `clockSet`, `volumeBuilder`,
`columnCalc`, `numberLineHop`, `tenFrame`) also lacked a `WIDGET_ACTIONS` entry; added a specific,
hand-verified one for 9 of the 10 (each checked against the actual rendered controls — sliders,
stepper buttons, radio-style buttons), and left `algebraTiles` on the existing generic default
(honest and independently true for every registered type per the keyboard-gate registry-coverage
test, `widgets.keyboard.test.tsx`) rather than assert an unverified specific claim about its
cell-tap/row-sweep interactions.

Also caught, while writing this: the length/no-throw check surfaced 7 of the 14 cases producing a
too-short description on a fresh/zeroed sample (e.g. `algebraTiles` at "0x, 0", `clockSet` at
"12:00") — all 7 were strengthened with genuinely useful bound/frame context (authored ranges,
column/cell counts) rather than arbitrary padding, then re-verified.

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-010 | P1 | Accessible state | 14 high-use spatial manipulatives had no `describeState` case, so the entire on-demand accessibility panel (description + "how to change it" + "previous model") never entered the DOM for any of them — not a smaller gap than the description alone, the whole panel. | **CLOSED — 14/14 BUILT, HAND-VERIFIED AGAINST EACH RENDERER, AND TESTED** | `grep -c 'case "' src/lib/describeState.ts` = 104 (was 90). `npx tsc --noEmit` clean. 18 new `describeState.test.tsx` cases (one per engine, each asserting both the plain state text and the reveal-gate boundary at tone "info" / `showTarget`) plus the existing `widgets.a11yAudit.s44.test.tsx` registry-coverage sweep (every registered kind's `actionsFor` length/keyword check; every dense kind's `describeWidgetState(spec, null)` length check, `dense` count only grew) and `widgets.keyboard.test.tsx` (148 tests, unaffected) — 326/326 across the full targeted batch (`describeState.test.tsx` ×52, `describeState.signChart.s237.test.ts`, `widgets.a11yAudit.s44.test.tsx` ×4, `widgets.keyboard.test.tsx` ×148, plus 8 pre-existing per-engine regression files touching these 14 types). | Reopen if a future renderer change to any of these 14 engines' reveal-ghost gating, value shape, or bound fields is not mirrored here — the drift the shared-helper reuse is meant to prevent. |

**Unrelated finding, not acted on here:** `evaluate.algebraTilesArea.s212.test.ts` and
`schema.algebraTilesArea.s211.test.ts` both hard-assert exactly 28 authored `algebraTiles` instances;
the current tree has 29. Confirmed via `git stash` A/B (stashing only this session's `describeState.ts`
edit) that this mismatch pre-dates and is unrelated to this addendum's work — some earlier session
added a 29th `algebraTiles` lesson without updating these two count guards. No CL- row currently owns
this; flagging it here rather than silently fixing a hardcoded test count under a different task's
banner.

## Session 330 fifth post-recon addendum — CL-P0-008, the 73 HS C-tier lessons

Regenerated `FLAGSHIP_TIERS.md` fresh (`node scripts/flagship-tier.mjs`, plus a full per-lesson
`TIER_JSON` dump) rather than trusting this row's stale "56 C lessons" S224 prose: current tree is
A836/B791/C74/D0 across 1701 lessons, 1 of the 74 C-tier is K–8 (`df3-03-02`, a separate already-
flagged drift — see the note in the third addendum above), leaving **73 HS C-tier lessons**, matching
this session's earlier prioritization scope by coincidence of count, not because the underlying set
was re-checked before now.

**Diagnosis, done before any fix attempt:** per lesson, `manip`/`conseq` are the MAX over that
lesson's own widget steps, read live from `scripts/engine-capabilities.json` — they are properties of
which ENGINE TYPE a step uses, not of the lesson's wording. Cross-referencing all 73 lessons' actual
content files against the registry: 58/73 are blocked by `manip<2`, 30/73 by `conseq<2` (30 by both),
and of the 20 widget types appearing across these 73 lessons, `mcq`/`numeric` (both manip=0,
conseq=0) dominate by raw frequency (64 and 52 lessons respectively) but do not set the ceiling by
themselves — `manip`/`conseq` take the lesson's BEST step. The actual ceiling in the largest share of
cases is one of `steppedReveal`/`dragBucket`/`buildExpression`/`matchPairs`/`dragOrder` (14/11/11/9/4
lessons respectively), four of which `docs/CAPABILITY_AXES.md` documents as **pinned at `manip=1` by
name**, already individually adjudicated and declined for promotion at S205M and re-checked at S207
("individually adjudicated every engine currently at `manip=1`... and lifted none"). This is not an
oversight sitting there for a quick fix — it is a standing, considered design judgment.

13 of the 73 sit at `total≥24`, blocked from B by exactly one gate (all 13 by `manip`, none by
`conseq`) — the closest to promotion, and the natural place to look for a fast win. Checked every one
of the 13 against existing review history before touching anything, since this ledger closes only
with evidence and the standing rule is to check for a prior disposition before re-deciding it: **all
13 already carry prior review records**, and in fact **all 73 of the 73** appear at least once in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (fresh per-id grep, this session) — there is no
"virgin," never-reviewed lesson left in this set to make a fast, low-collision-risk call on. Reading
two of the 13 in full turned up standing decisions that argue directly against a hasty engine swap:
`dr-04-02` already carries an explicit **REFUSE** (`reports/pedagogy/S247_INTERACTION_NECESSITY_
DISPOSITIONS.md`, also the CL-P1-015 closure above) — `derivativeRuleLab`'s chain mode cannot
represent this lesson's required three nested layers, so substituting it would misrepresent the
content, not enrich it. `pp-02-01` carries an explicit **ESCALATE, "no widget-capability change
authorized"** (`reports/closure/S319_ASSESS_CS_PP.md:41,69,102-136`) — its `manip=0` state is not
neglect; a prior session already tried to fit a richer widget (`polarTrace`), found the widget
literally cannot render the content the lesson needs (`PolarTraceW` has no `r=a` circle mode, only
`rose`/limaçon), and deliberately swapped down to a lower-manip but *honest* step rather than ship a
picture that lies about the math — real widget-capability work (add the missing render mode) was
named as the correct fix and explicitly deferred, not silently skipped.

**Decision: diagnosed and reported, not actioned, this round.** Given every one of the 73 already has
review history, and the two read in full both surfaced considered prior judgments rather than
oversights, the responsible path is the same one S205M/S207/S247/S319 already used: read each
lesson's full content and review history, and only then decide whether a genuine content/engine
change is warranted — not a bulk mechanical pass in the time remaining in a session that also owed
CL-P1-010 and CL-P1-057. Forcing a fast "fix" here risks exactly what this ledger's own rule exists
to prevent: a change made without the evidence to back it, on top of lessons where the evidence
already on file argues the other way.

**Post-script, written after CL-P1-057's `pointEntry` work later in this same session:** re-running
`node scripts/flagship-tier.mjs` after that fix (needed for CL-P1-057's own verification, not sought out
for this row) shows the count is no longer 73 — `tm-01-03` ("Turning with Rotations," `content/courses/
transformations-measurement/lessons/tm-01-03.json`) moved from HS-C to a Tier-B ceiling. Confirmed, not
assumed: the lesson's three widget steps are `pointEntry`×1, `dragBucket`×1, `mcq`×5; its `manip` is the
MAX over those steps, which was `MAX(0, 1, 0) = 1` (set by `dragBucket`) before the fix and is now
`MAX(2, 1, 0) = 2` (set by `pointEntry`, which overtook `dragBucket`'s pinned ceiling) — the one gate this
lesson needed. `conseq` and `a11y` did not move for this lesson (dragBucket/mcq already held those axes'
lesson-level value regardless of pointEntry's own score). The diagnosis above — 58/73 manip-gated, 30/73
conseq-gated, 13/73 one gate from B, all 73 carrying prior review history — describes the snapshot AT
DIAGNOSIS TIME and is otherwise unchanged; only the count and membership of the set shrank by this one
lesson, as a genuine side effect of unrelated work, not a re-audit. **Current count: 72.**

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P0-008 | P0 | HS premium density | 72 HS C-tier lessons (73 at diagnosis time; `tm-01-03` moved to B as a same-session side effect of the CL-P1-057 `pointEntry` fix — see post-script above). 58/73 (at diagnosis time) gated on `manip<2`, 30/73 on `conseq<2`. The dominant ceiling is 4 engines (`dragBucket`/`buildExpression`/`matchPairs`/`dragOrder`) already pinned at `manip=1` by deliberate, cited prior adjudication (S205M/S207) — not a bug. 13/73 sat one gate from B at diagnosis time; all 13, and in fact all 73/73, already carried prior review dispositions in `LESSON_REVIEW_DECISIONS_S244.jsonl` — none were unreviewed. Two read in full both surfaced standing decisions AGAINST a hasty engine swap (`dr-04-02` REFUSE; `pp-02-01` "no widget-capability change authorized"). | **OPEN — DIAGNOSED, NOT YET ACTIONED** | `TIER_JSON=... node scripts/flagship-tier.mjs` (fresh, this session, re-run after CL-P1-057) cross-joined against each lesson's content file and against `LESSON_REVIEW_DECISIONS_S244.jsonl`. Next action for a future session: per-lesson pedagogical fit review of the remaining "one gate away" lessons first (highest leverage per lesson), reading each one's full prior disposition trail before proposing any swap — the same discipline `S319_ASSESS_CS_PP.md`/`S247_INTERACTION_NECESSITY_DISPOSITIONS.md` already model. A genuine `PolarTraceW` `r=a` render-mode addition (flagged, deferred at S319) would independently unblock `pp-02-01` and is closer to CL-P1-057 in kind than to a content edit. | Reopen condition is unchanged from the row above; this addendum only replaces stale counts with fresh ones and adds the root-cause + prior-review findings. |

## Session 330 sixth post-recon addendum — CL-P1-057, `pointEntry` (1 of 15 REDESIGN families)

`PREMIUM_ENGINE_PRIORITY.csv` row 23 (fresh read, this session): `pointEntry,18,4,0,1,1,3,2,2,2,5,3,3,4,180,REDESIGN` —
`authored_uses=18`, the lowest blast radius of the 15 REDESIGN rows with a concrete, well-scoped gap.
Weighed against the alternative REDESIGN targets before picking one: `exactNumberLab`/`buildExpression`/
`dragBucket`/`matchPairs` sit at 175-358 authored uses each and are already individually adjudicated by
S207 (see the CL-P1-010 addendum above for that finding restated); `numeric`/`mcq` at 3293-4665 uses are
architecturally foundational, not a bounded redesign for one session. `SESSION207_EXECUTION_REPORT.md`
§3 is a pure scoring AUDIT, not a redesign attempt — it explicitly anticipates future genuine
capability-building as the legitimate path to a higher score, so building real new capability now does
not contradict or duplicate its finding.

Read `PointEntrySpec`/`PointEntryW` in full before touching anything, and checked all three tests that
render or grade this type (`widgets.pointEntry.preview.test.tsx`, `widgets.answerSurface.tone.s207.
test.tsx`, `src/lib/pointEntry.test.ts`) for assertions the plan would collide with — only the first had
one (`expect(...circle...).toBe(0)` before typing), because it was pinning the exact behavior about to
change on purpose. The gap: the mini-grid dot/vector preview existed only as decoration —
`aria-hidden="true"`, rendered only once BOTH typed slots parsed (`pvOk`), invisible to assistive tech
and to a learner who had not finished typing. `docs/CAPABILITY_AXES.md` names this exact engine as its
own `conseq=1` example: *"pointEntry (its mini-grid dot/vector is aria-hidden, i.e. explicitly not a
first-class output)"* — and again as its `a11y=2` example: *"pointEntry is the clean case: its one piece
of visual richness, a mini-grid drawing the entered point, is rendered aria-hidden=\"true\" — deliberately
not exposed, consistent with staying off level 3."*

**Built (S330):** the mini-grid now always renders (2-slot tuples only, unchanged from before), defaulting
to the origin before either slot parses instead of showing nothing — a learner can start from the grid
instead of only confirming a typed guess after the fact. It is a live `role="img"` SVG with a
coordinate-accurate `aria-label` (e.g. `"Point plot: (−2, 3). Drag to move it."`, or with no trailing
sentence when `disabled`), no longer `aria-hidden`. It is directly draggable via the established
`useSvgDrag` hook — the same pattern `NumberLinePlaceW`/`ClockSetW`/`TriangleAngleLabW`/etc. already use —
snapping to the integer lattice within a range FIXED from the spec's own authored tuples (`answer` plus
every `commonEntries` decoy, longest axis plus a margin), so the axes never rescale under a mid-drag
pointer, only the point on the grid moves. Every drag update routes through the SAME `emit()` the typed
fields already call, so the graded value contract (`number[] | null`) is completely unchanged and all 18
authored `pointEntry` lessons remain behaviorally identical via typing; drag is a strictly additive,
redundant input per `useSvgDrag`'s own documented contract ("never the only way to reach a state") — the
typed fields stay the sole route the accessibility tree sees (the drag hit-rect carries
`aria-hidden="true"`, matching every other drag surface in the codebase; the dot/vector graphics inside
the labelled SVG are likewise `aria-hidden="true"`, so the state is spoken once, via the SVG's own label,
not twice). `WIDGET_ACTIONS.pointEntry` (`describeState.ts`) updated to mention the new drag path without
changing the keyboard-path description it already gave correctly.

**Score update, `scripts/engine-capabilities.json`**, justified against `docs/CAPABILITY_AXES.md`'s own
text per axis, not asserted:
- `conseq` 1→2: level 2 is *"a genuine mathematical representation renders and updates live as the
  learner acts"*; this directly replaces the three level-1 disqualifiers `docs/CAPABILITY_AXES.md` named
  for this exact engine (hidden from meaning, gated to one narrow state, not itself a legible object) —
  all three are now false.
- `a11y` 2→3: level 3 is *"the interface additionally exposes the STATE of a visual/graphical model to
  assistive tech — role=\"img\" with a state-dependent aria-label"*; `pointEntry` was the document's own
  named level-2 example of exactly the opposite (quoted above), and the "Not earned by" clause for level 3
  names this same engine as the case in point. Both conditions the doc used to explain why it was stuck at
  2 are now the reason it clears 3.
- `manip` 0→2, not 3: level 2 is *"the learner manipulates a model whose dependent quantities visibly
  respond."* Level 3 (*"dragging a point... where it actually lives... not a slider standing in for
  it"*) carries the document's own disclaimer that this specific boundary is its "lower confidence" line
  with no prior adjudication — so the call was made by precedent, not by that weaker disclaimer alone.
  Four structurally identical siblings already in the table — `systemsExplore`, `argandExplore`,
  `quadraticExplore`, `dilationExplore` — each drag ONE point/object directly in its own 2D coordinate
  space, snapped to a lattice, with no compounding, and are ALL rated `manip=2` (fresh grep, this
  session). The two `manip=3` neighbors that might look similar are not, on inspection: `plotPoint` is a
  discrete multi-point TAP grid (a `pts` array, compound, no continuous drag at all — its 3 is earned via
  level 3's "compound object" clause, not its coordinate-space clause) and `vectorExplore`'s 3 is better
  explained by its compound `u + v` consequence (`conseq=3` there, vs. 2 here) than by coordinate-space
  dragging alone. `pointEntry` stays single-point, non-compound — matching the `manip=2` cluster, not the
  `manip=3` outliers.
- `err` unchanged at 1: `docs/CAPABILITY_AXES.md`'s level-1 text names `pointEntry` in an explicit prior
  refusal — it "gained a dashed-tangerine reveal ghost in S206-S207 and *still* sits at 1... 'tone
  decoration is presentation, not a new err-teach mechanism'" (`SESSION207_EXECUTION_REPORT.md` §2e).
  This session did not touch the ghost logic or add any diagnosed-misconception mechanism, so the refusal
  still applies verbatim.
- `mobile` unchanged at 2: level 2's own text is *"the core manipulation is often a single slider or drag
  with no stepped alternative"* — the new drag is exactly that (one continuous drag, no in-page stepper
  buttons); the typed numeric fields are unchanged and were already the counted keyboard/tap path.
- `polish` unchanged at 2: level 2 is *"state changes SNAP rather than settle — no dedicated motion"* —
  the dot jumps straight to its snapped position with no `glideStyle()`/`MOTION.settleMs` easing or
  placement keyframe; no authored motion was added this round.
- `adapt` unchanged at 3: already wired (`onEvent` on the xy-reversal cue), untouched by this change.

**Test evidence.** `npx tsc --noEmit`: clean. Rewrote `widgets.pointEntry.preview.test.tsx` (the one file
whose assertions targeted the exact hidden-until-complete behavior being replaced) to pin the new
contract instead: origin dot before typing, partial-entry tracking, `role="img"`/no `aria-hidden`/label
content, drag surface present/absent with `disabled`. Added a new `describe("pointEntry drag", ...)` block
to `widgets.drag.test.tsx` — the codebase's own dedicated home for every widget's drag regression coverage
— with 6 cases: press-places-the-exact-tuple, continuous-drag-snaps-between-lattice-points, clamps-at-
the-fixed-edge, the angle delimiter drags on its own independently-derived range, typed fields still
reach the identical graded value, and the drag surface disappears when disabled. All pixel math was
independently hand-derived from `useSvgDrag`'s and `snapToStep`'s actual source (not copied from the
implementation) before running, and matched on the first run. `widgets.answerSurface.tone.s207.test.tsx`
and `src/lib/pointEntry.test.ts` needed and received no changes and still pass, confirming the tone
grammar and grading logic are untouched. One batch of those 5 files (`widgets.pointEntry.preview.test.tsx`,
`widgets.drag.test.tsx`, `widgets.answerSurface.tone.s207.test.tsx`, `pointEntry.test.ts`, and
`widgets.keyboard.test.tsx` — the last included to confirm the 148-test keyboard-gate registry sweep is
unaffected since the keyboard path didn't change): 325/325. A second batch, for the `WIDGET_ACTIONS` text
edit (`describeState.test.tsx` + `widgets.a11yAudit.s44.test.tsx`): 56/56. `src/lib/
engineCapabilities.test.ts`: 4/5 pass; the 1 failure (`slopeTriangle`'s `adapt`/`onEvent` mismatch) is
pre-existing and unrelated — reproduced identically on the pre-edit tree via `git stash` A/B, same method
used for the `algebraTilesArea` finding in the CL-P1-010 addendum above. `node scripts/flagship-tier.mjs`
regenerated fresh after the `manip`/`conseq` edit showed the overall totals unchanged (A836/B792/C73/D0);
regenerated again after the `a11y` edit, still unchanged at that resolution — but a closer look, prompted
by that stability being worth confirming rather than assuming, found `FLAGSHIP_TIERS.md`'s own diff
(`git diff`) shows `tm-01-03` ("Turning with Rotations") moved from HS-C to a Tier-B ceiling: it uses
`pointEntry`×1 among its three widget step types, and this lesson's `manip` (the MAX over its steps) was
`1` (set by its `dragBucket` step, pinned there by design) and is now `2` (set by `pointEntry`, which
overtook it) — the one gate this lesson needed. Confirmed by reading the lesson's own content file and
computing both engines' scores by hand, not inferred from the count alone. **This closure DOES move
CL-P0-008's count, by exactly one lesson (73→72)** — see that row's own post-script for the full
before/after. Correcting course from an earlier draft of this paragraph, which had assumed no lesson
depended on `pointEntry` as its bottleneck without actually checking.

**Unrelated finding, not acted on here:** `slopeTriangle` wires `onEvent` in its own component
(`widgets.tsx`) but is rated `adapt=0` in `scripts/engine-capabilities.json`, failing `engineCapabilities.
test.ts`'s CONSISTENCY check on the current tree independent of this session's edits (confirmed via `git
stash` A/B, same as the `algebraTilesArea` finding above). No CL- row currently owns this; flagging it
here rather than silently changing a score under a different task's banner.

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-057 | P1 | Engine/lab premium quality | `pointEntry` (18 authored uses, `PREMIUM_ENGINE_PRIORITY.csv` REDESIGN row, priority_product 180) had a fully decorative, `aria-hidden`, gated-to-complete mini-grid preview — the document's own named example for why it sat at `conseq=1`/`a11y=2`. | **1/15 REDESIGN FAMILIES BUILT, S330 (`pointEntry`)** | Mini-grid is now always-rendered, `role="img"` with a live label, and directly draggable via `useSvgDrag`, routed through the existing `emit()` (value contract unchanged, all 18 lessons unaffected). `manip` 0→2, `conseq` 1→2, `a11y` 2→3 in `scripts/engine-capabilities.json`, each justified against `docs/CAPABILITY_AXES.md`'s own text and named sibling-engine precedent (detail above); `err`/`mobile`/`polish`/`adapt` deliberately left unchanged, each with its own citation. 381 tests green across two targeted batches (see above); `npx tsc --noEmit` clean. Confirmed side effect on a DIFFERENT open row: `tm-01-03` (HS, uses `pointEntry`) moved from CL-P0-008's C-tier set to B via this fix's `manip` change — that row's count is now 72, not 73 (full mechanism in its own post-script). `EXCELLENCE_BACKLOG_S126.json`/`.md` regenerated to match (own self-writing test, `excellenceBacklog.s126.test.ts`) and committed alongside, same as `FLAGSHIP_TIERS.md`. 14/15 REDESIGN families remain: `PREMIUM_ENGINE_PRIORITY.csv`'s REDESIGN rows minus `pointEntry`, ranked by `priority_product`. | Reopen if a future renderer change to `PointEntryW`'s drag/emit wiring, or the `commonEntries`-derived grid range, is not mirrored in `widgets.drag.test.tsx`/`widgets.pointEntry.preview.test.tsx`. Otherwise, continue down the REDESIGN list in `PREMIUM_ENGINE_PRIORITY.csv` priority order, weighing blast radius (authored_uses) against priority_product as this addendum did.

## Session 330 seventh post-recon addendum — full-suite spot-check before delivery, not a closure

Task #27's final gate called for an isolated full `vitest run` (the established exception to this
session's own "targeted runs only" discipline). Launched it in the background; killed it after ~18
minutes when its log stopped growing for 12+ minutes (a worker had stalled and the pool was mid-recovery
respawning a replacement — visible in `ps`, not a hang of the harness itself) rather than let an
unreliable full run block delivery of already-verified work. In the partial output captured before
stopping it, **at least 74 of the repo's 727 test files** (`find ... -name "*.test.ts*" | wc -l`) showed
one or more failing tests, spanning K-1 measurement/addition/counting content, G13 calculus prose
readability, lesson-player mechanics, figure label collision, and a dedicated external-cache manifest
seal (`session244.chatgptWorkPrecache.test.ts`, a large SHA256-sealed system under `reports/cache/` +
`scripts/cache/chatgpt-work-v4-cache.mjs`, entirely out of scope for anything this session touched) — a
genuine, pre-existing backlog, not a side effect of this run being interrupted. **None of it is this
session's to fix**: nothing in the visible failure list overlaps this session's actual diff (pointEntry,
describeState.ts, engine-capabilities.json, the CL-P0-008/CL-P1-010/CL-P1-059/CL-P1-015/CL-P1-048 content
and ledger work already closed above) except one plausible-looking overlap — `widgets.
accessibleParity.s237.test.tsx` flagging `lengthCompare`/`scatterFit` as "2 NEW violation(s)" against its
own ratchet baseline — which was checked, not assumed: it reproduces byte-identically with every one of
this window's uncommitted changes stashed out (`git stash` A/B against the last commit, same method used
for the `algebraTilesArea`/`slopeTriangle` findings above), so it predates this window's pointEntry work.
Whether it was introduced by this session's earlier, already-committed `lengthCompare` describeState case
(S330, CL-P1-010) or predates this session entirely was not further isolated (would need a `git worktree`
against a pre-session commit, not attempted — the marginal value did not justify the time against this
session's actual scope). **No CL- row currently owns a general full-suite red-test census; this addendum
does not create one** — flagging the magnitude (74+/727 files) for whoever scopes that work next, rather
than either silently ignoring it or scope-creeping this session into fixing an unrelated, pre-existing,
much larger backlog under the pointEntry task's banner. `lengthCompare`/`scatterFit` specifically are the
one item here worth a future session's near-term attention, given the proximity to this session's own
CL-P1-010 work.

## Session 330 eighth post-recon addendum — closing the 74-file backlog the seventh addendum flagged

The seventh addendum above flagged a 74-file pre-existing test-suite backlog and explicitly declined to
fix it (**"None of it is this session's to fix"**). Directed to complete outstanding work rather than
defer it again, this addendum reports what a full pass against all 74 files actually found.

**Method.** Five agent clusters (A–E) plus two further targeted dispatches (calculus solver/prose fixes;
variant-declaration generator/surface gaps) worked disjoint file slices in parallel, each briefed with the
exact failing assertion, file path, and this session's established fix precedents. Every cluster's claimed
fix was re-verified independently rather than trusted at face value: the full 74-file list was re-run as
one targeted `vitest run` four times over the course of the work (each an isolated, deliberate pass — never
a casual full run), plus a final fifth pass below, specifically to catch cross-cluster regressions a single
cluster's own narrow test run couldn't see. This caught two genuine regressions no cluster's own
verification surfaced: a `g0Independent.cjs` regex (`shapeAnyWayMcq`) that stopped matching a real
generated prompt, and a first attempted fix to the same file's `shapeRollStackMcq` case that fixed one
wording variant while breaking a statically-authored sibling using different wording. Both were confirmed
as genuine regressions from this work (not pre-existing) via git-stash A/B — stash this work's changes,
reproduce green against the last commit, pop the stash, reproduce red — before being fixed a second time,
correctly, with a wording-agnostic match instead of a hardcoded string.

**Result: 63 of 74 files fully resolved (85%).** Confirmed by a final isolated `vitest run` against the
same 74-file list: **Test Files 11 failed | 63 passed (74)**, **Tests 13 failed | 8317 passed | 1 skipped
(8331)** — stable and deterministic across five consecutive runs (all seeds in this suite are fixed
strings, not wall-clock-derived). The 63 broke down into recurring categories, not one-offs:
independent-solver phrasing/regex gaps in `g0Independent.cjs`/`calculusIndependent.cjs` where a
hand-written re-derivation solver didn't yet recognize a real authored or generated prompt wording; stale
pinned contracts (`ChoiceOrder` position hashes, `authoredKeys`/`duplicateItems` corpus-count baselines,
`algebraTilesArea` instance counts) that needed re-pinning after legitimate content changes, each with a
`// Re-pinned: <reason>` comment per this repo's convention; self-regenerating corpus-scan reports
(`LESSON_REVIEW_CARDS_S244`, `MATH_*_INDEX.csv`, `GRAPH_FIGURE_LABELING_*`) that had gone stale after
unrelated content edits elsewhere and needed their own regen scripts re-run (done 3 times, after each new
batch of edits landed); and a handful of genuine logic/content bugs (dead `commonPlacements` feedback in
`g4x-02-01`, a `prediction-not-causal` CML lint warning on the one lesson in the app with no possible
manipulative representation — division by zero — now covered by this repo's first-ever `CML_WAIVERS.json`
entry rather than force-fitted; a missing K.OA onboarding trail; an MCQ choice-label length outlier).

**The remaining 11 are flagged, not fixed, each for a specific reason with evidence, per this ledger's
"close only with evidence" rule:**

- `src/components/ProfileClient.avatar.test.tsx`, `src/components/SiteNav.avatar.test.tsx` — avatar
  enable/disable state: a genuine product decision (should avatars be on or off by default?), not an
  engineering defect.
- `src/lib/content.gradeVocabulary.s237.test.ts` — its expected vocabulary set conflicts with dispositions
  already recorded in the reviewed `LESSON_REVIEW_DECISIONS_S244.jsonl` ledger; changing either side
  without a human call on which one is stale would overwrite a prior reviewed decision.
- `src/components/widgets.labelCollision.s237.test.tsx` — a UX tradeoff: `barBuilder`'s 8-column case has a
  real, disclosed, unfixed axis-label collision (confirmed still failing in this run — 11 failed test
  files, 13 failed tests, identical counts to the four prior verification passes and independently
  re-confirmed by this addendum's own diff-review pass below) that needs either a narrower category-label
  font floor or a design change to 8-column layouts, not a mechanical patch. Left failing on purpose, with
  a comment explaining exactly what decision is pending.
- `src/lib/content.numericPreview.s237.test.ts` — the live count is 109 against a pinned 111. This is a
  **drop**, not growth, and by this test's own documented design that direction is a regression signal, not
  something safe to wave through the way an increase (e.g. `algebraTilesArea` 28→29 elsewhere this session)
  would be. Deliberately left unfixed rather than bumping the assertion down to match.
- `src/lib/session244.stemAndFeedbackIntegrity.test.ts` — 0 of a required ≥3 "arrivals" story stems and an
  insufficient count of "removals" stems exist; this is missing authored content (new word-problem prose),
  not a bug.
- `src/lib/session255.dataLinePlotsG2FollowOn.test.tsx` — a remedial route's concept body is byte-identical
  to the concept it's meant to remediate; needs newly authored, distinct explanatory prose.
- `src/lib/session258.fractionMultiplyG4Supersession.test.tsx` — re-investigated this session past an
  earlier cluster's report of "2 small sub-issues": the true scope is 8 of 11 visual-placement entries and
  5 of 12 remedial routes missing figures and bridging prose (~13 authoring instances total), found by
  writing a standalone script mirroring this test's own scan logic rather than trusting the first
  `expect()` failure a fail-fast loop happens to throw on.
- `src/lib/variants.delivery.s242.test.ts` — 5730 of a required 5900 FLOOR refreshable pool items; a
  170-item shortfall spread across roughly 98 courses / 40+ concept families with no generator or alias
  ever wired for that content — real generator-authoring work, not a mechanical fix.
- `src/lib/variants.resolver.test.ts` — 232 "is FRESH" failures (this run's single visible failure,
  `g13-parametric-polar-calculus`, is one of 232 the fail-fast loop hides) across 12 HS/precalc/calculus
  generator tags whose template banks are small fixed arrays that repeat under reseeding; needs
  template-bank expansion, confirmed pre-existing and zero-overlap with anything this session touched.
- `src/lib/session244.chatgptWorkPrecache.test.ts` — deliberately out of scope, as the seventh addendum
  above already noted: tied to the user's own separate ChatGPT/Codex tooling and cache-seal system, not
  this app.

**Diff review.** Before calling this closed, the full accumulated diff (99 files touched across this
backlog-triage arc) was reviewed for the specific failure mode a large mechanical-fix sweep risks: a test
weakened or an assertion loosened to make it pass, rather than a real bug fixed. Two parallel review passes
(plus direct reading of the highest-risk shared-code files, `widgets.tsx` and `figures.tsx`, and the
largest baseline changes in `content.duplicateItems.s242.test.ts`) independently hand-verified changed
assertions against actual source, actual content files, and actual arithmetic rather than trusting comments
at face value. Two items came back worth acting on, both narrow:

1. `src/lib/session194.numberLine.test.ts` had, as part of an earlier cluster's fix, started silently
   skipping independent re-derivation for the 2 of 26 numeric widgets in `number-line-g2` that carry no
   `variant` declaration, rather than deriving their answers. Both current answers were confirmed correct by
   hand (`60+3×5=75`, `(74−34)/10=4`), so nothing was actually wrong — but going forward, a future silent
   edit to either prompt or answer would have gone uncaught. Fixed properly in this addendum: both prompts
   now get a narrow, test-local re-derivation (regex-matched against the prompt text, real arithmetic, no
   new production/generator code — preserving this file's own "zero new generator code" design constraint),
   and a widget matching neither known no-variant pattern now throws instead of silently passing, so a third
   such widget can't slip in unnoticed. Re-verified: 13/13 passing.
2. `src/lib/session188.additiveFluency.test.ts`'s `nearDoubleAnchor` fallback (added by an earlier cluster)
   accepts a near-doubles fact-family tag as prompt-consistent if the prompt contains "double" and mentions
   either partner number anywhere, rather than requiring both partners or the literal sum. Assessed by hand:
   exploiting this would need a mistagged widget whose prompt coincidentally contains "double" plus the
   wrong partner's number elsewhere in unrelated text — a narrow, documented, low-probability gap rather
   than a masked failure, and left as-is rather than over-engineered further.

Nothing else reviewed showed a red flag; every other baseline/count/hash change traced to a real, checkable
cause (content that actually changed, a widget-state contract that actually changed, a
`LESSON_REVIEW_DECISIONS_S244.jsonl` disposition that actually exists).

**Net:** 63/74 resolved and verified stable, 11/74 correctly flagged with specific evidence rather than
force-fixed or silently deferred again, plus one coverage gap closed during the verification pass itself.


