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
| CL-P0-008 | P0 | HS premium density | Fresh tier compiler found A365/B204/C57/D1 across 627 HS lessons. | HS/calc | Fresh necessity audit, then targeted existing-engine upgrades / justified advanced gaps. | **OPEN — PROGRESS** | S224 W04 | Batch 1: A366/B205/C56/D0; `ep-02-01` D→B and `dr-03-02` C→A. Continue classification of 56 C lessons. | HS conceptual density no longer materially trails K–8. |
| CL-P0-009 | P0 | State-aware adaptation | 63/127 engines have adapt=0; multiple high-use manipulatives lack process evidence. | high-use engines | Meaningful event/state contracts and deterministic intervention loop. | **OPEN** | baseline | Capability registry census. | Important manip emits HOW-the-learner-reasoned evidence and intervention is state-grounded. |
| CL-P1-010 | P1 | Accessible state | describeState exists for 84/127; 13 high-use/spatial manipulatives lack it. | 13 priority engines | Add exact state descriptions derived from evaluator/model state. | **OPEN** | baseline | Direct `describeState.ts` branch + authored-use scan. | High-use spatial engine has no equivalent nonvisual state. |
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
| CL-P1-057 | P1 | Engine/lab premium quality | The 127-engine audit retains 15 redesign, 3 polish, and 2 deprecation-candidate families; slider-only control was a high-leverage shared weakness. | **IN PROGRESS — 1 SHARED ENGINE UPGRADED** | `PREMIUM_ENGINE_PRIORITY.csv` remains the ranked authority. Continue with the 15 REDESIGN families in learner-harm × frequency × visibility × strategic order; verify lesson meaning before changing engine behavior. |

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

