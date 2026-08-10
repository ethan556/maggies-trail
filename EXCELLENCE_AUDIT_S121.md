# EXCELLENCE_AUDIT_S121 — Phase-0 delta audit (lesson player & manipulatives)

Session 121. Read-only audit of the session-120 tree against the "Excellence Pass" mandates.
Everything below is measured from disk/browser this session; nothing is carried from summaries.

## 1. Baseline gates (untouched tree, this container)

| gate | result |
|---|---|
| typecheck | `TSC_EXIT:0` |
| vitest | **9977 passed (9977)**, 158 files, 442s, `VITEST_EXIT:0` |
| validate:content | `schema: 1223/1223 files clean`, exit 0 |
| lint:pedagogy | `pedagogy: 1139/1139 files clean`, exit 0 |
| lint (eslint) | `LINT:0` (194 pre-existing warnings, 0 errors) |
| check-registration | `files ↔ course.json ↔ PLAN.md all consistent` |
| build | `BUILD:0` (Compiled successfully in 68s) |
| validate:native | exit 1 on working tree (node_modules, tsbuildinfo present) — passes on packaged tree; re-verified at tar time |
| **Playwright** | **47 passed (2.2m), `PWEXIT:0`** — first browser-verified run since S117 |
| screenshots | 47 captures, 10 routes × 5 viewports, all HTTP 200 |

### Environment findings (recorded for every future session)

1. **The 76 "failures" on first vitest run were 100% environmental.** `npm install
   --ignore-scripts` skips better-sqlite3's install script, so no native binding exists and
   all 17 sqlite-touching institutional test files fail. Fix, ~5s, network-allowlisted:
   `cd node_modules/better-sqlite3 && npx --yes prebuild-install`. After the fix the identical
   tree passes 9977/9977. (A bare `node -e "require('better-sqlite3')"` from the repo root
   misleadingly succeeds — trust the vitest resolution, not that probe.)
2. **Playwright is runnable in this sandbox after all.** The stock browser CDN is outside the
   network allowlist (S118–120 conclusion, still true), but the repo's `@sparticuz/chromium`
   devDependency installs from npm and self-extracts a working Chromium 149 at `/tmp/chromium`;
   `playwright.config.ts` already honors `PW_CHROMIUM_EXE`. Runner: `scripts/run-browser-s121.sh`
   (S117 same-detached-session pattern: server + suite + screenshots in one setsid script).
3. `vitest run --reporter=line` is not a valid reporter in this vitest major — it crashes the
   whole run before any test executes. Use the default or `--reporter=basic`.

## 2. What Sessions 114–120 added beyond the S113 baseline (from SESSION_NOTES, spot-verified)

- A 13-dimension, rule-based **lesson tier system** (`scripts/flagship-tier.mjs` +
  `scripts/engine-capabilities.json`), regenerated deterministically. S120 close:
  **A 595 · B 202 · C 304 · D 28** (S113 had no tier ledger at all).
- 69 predict-only conversions in S120 alone under a new corpus gate
  (`scripts/measure/predict-qa.mjs`); 37 predict-only candidates remain.
- The K–8 C/D remediation workstream (S120i/j): 81 → 74 lessons remaining, measured fit rate
  **47%** (vs ~85% for HS), and two named engine gaps: **`unitChain`** and **dotPlot
  fractional ticks**.
- 73 duplicated prediction prompts/reveals found in legacy content (KNOWN_ISSUES; deliberately
  not rewritten — authoring pass with human review required).
- Test count 8,352 → 9,977; widget registry 85+ → **103**.

## 3. Measured usage (new: `scripts/measure/engine-usage-s121.mjs`)

1,129 lessons · 10,498 steps · **6,828 widget steps** · 101 types used (103 registered;
`toggleExplore`, `radicalCheck` unused). `numeric` (3,177) + `mcq` (1,895) = **74% of all
widget steps** — the answer surfaces, whose learning value lives in the player's
misconception-specific feedback, not in the widget class itself.

## 4. Engine matrix (new: `scripts/measure/engine-matrix-s121.mjs`)

Grades derived from the maintained 7-dimension capability scores (manip/conseq/err/adapt/
a11y/mobile/polish, 0–3) with the rule: A = manip≥2 ∧ conseq≥2 ∧ err≥2 ∧ Σ≥17;
B = manip≥2 ∧ conseq≥2 ∧ Σ≥13; D = any of conseq/a11y/mobile at 0 or Σ≤8; else C.

| grade | types | widget steps served |
|---|--:|--:|
| A | 43 | 389 |
| B | 44 | 486 |
| C | 11 | 812 |
| D | 5 | 5,141 |

**Reading this honestly:** the D mass is `numeric`/`mcq`/`fractionEntry` — answer surfaces that
are structurally manip-0 and are *supposed* to be; grading the class D does not make them
defects. The genuinely repair-relevant non-answer set is tiny and low-use:
`subitizeFlash` (D, 7 steps), `placeCompare`/`rationalCompare` (C, 32/19 steps),
`steppedReveal` (C, 75 steps), plus the two unused registrations. **87 of 103 types grade
A/B.** The manipulative catalogue is not the weak layer; conversion of C-tier *lessons onto*
strong engines is where the remaining value sits — exactly the S120i/j workstream.
Full per-type table: `ENGINE_MATRIX_S121.md`.

## 5. Prompt-A mandate classification (DONE / PARTIAL / MISSING)

### Part I — lesson player: effectively DONE (verified in source + browser)
| mandate | status | evidence |
|---|---|---|
| Screen hierarchy / progressive disclosure | DONE | widget on full stage width, prose in `max-w-xl` reading column; predict gate hides the widget until commitment; explanations gated on `finalized` |
| Responsive stage widths | DONE | `stageWidth.ts`: exhaustive 3-tier `Record<TWidget["type"], StageTier>` (compile error on omission), shared by header/main/footer |
| Action loop | DONE | one primary action per phase, `useEnterAdvance` drives check→retry→continue→next, disabled check via `canCheck`, `pressable` states |
| Prediction steps | DONE | commitment card, "No points on the line for this", preserved prediction chip, seeded option shuffle, mismatch banner "that's the interesting part" |
| Correct/retry/revealed states | DONE | restrained SparkBurst + XP chip; retry keeps work ("Your work is still on the stage"); reveal shows *yours vs answer* contrast with replay path |
| Spatially intelligent feedback | DONE | sticky (not fixed) footer takes layout space; internal `max-h-[42dvh]` scroll; `stageTone` links footer diagnosis to the stage ring; safe-area padding |
| Hints | DONE | rung-labelled ladder (`HINT_RUNGS`), latest emphasized, prior hints dimmed, authored text untouched |
| Completion | DONE | consolidation screen: SummitRoute, XP, GoalRing, streak, prediction reflection, reasoned next-step + Mastery Studio, replay, Enter-to-continue |

### Part II — manipulative system
| mandate | status | evidence / gap |
|---|---|---|
| Shared experience layer | PARTIAL | motion tokens (`motion.ts`), SR layer (`describeState.ts`, 55 widget cases), `LabReadout`, `STAGE_TONE_RING`, CML undo/restore panel exist — but no single stage-frame primitive; widgets.tsx is 12,577 lines of per-widget assembly |
| Semantic color syntax | DONE | `PALETTE` used semantically; contract documented and enforced in review |
| Direct manipulation | PARTIAL | drag/scrub labs across bands; named gaps: `unitChain` (missing), dotPlot fractional ticks; some slider-first widgets remain by design |
| Cause-and-effect | DONE (A/B engines) | 82/82 advanced manipulatives CML-wired (S96 audit), `onEvent` process signals across 117 sites |
| Motion quality | DONE | central MOTION vocabulary; CSS-only; reduced-motion = final state |
| Interaction-state standard | PARTIAL | tone rings + `pressable` widespread; the full 11-state vocabulary is not uniformly expressed per widget |
| Error-driven teaching | DONE for A-tier (err≥2 on 60+ types) / PARTIAL on C tail |
| Reset/undo/replay | PARTIAL | player-level CML undo + restore-first; per-widget reset inconsistent on multi-action builders |
| Age appropriateness | DONE | `data-band` theming, `readingProfile: early`, Narration/TTS, band-specific density |

### Parts V–VII
- Accessibility: DONE at the automated level (axe × routes × themes, forced-colors, keyboard
  suites — 47/47 in-browser this session); real-device sweep still owed (already documented).
- Validation: fully runnable end-to-end again, including browser gates (see §1).

## 6. New defects found this session

1. **[FIXED] Landing page horizontal overflow at phone widths.** `/` scrolled ~950–964px
   sideways at 360/390 (measured `scrollWidth−clientWidth`; every lesson route and the gallery
   measured 0). Cause: course-showcase `<li>` grid items lack `min-w-0`, so the track's auto
   minimum is the untruncated course title. Fix: `min-w-0` on the item (one class,
   `src/app/page.tsx`), comment documents the mechanism. Re-verified 0px overflow at 360/390
   post-fix in browser.
2. **[RECORDED] Pattern hazard:** grid + `truncate` without `min-w-0` on the grid item appears
   in several shell routes (AdminClient, FamilyClient, DailyClient…). Only `/` measured as
   overflowing; a probe sweep across shell routes belongs to Phase 1
   (`scripts/measure/overflow-probe-s121.cjs` is the tool).
3. Two registered-but-unused widget types (`toggleExplore`, `radicalCheck`) — dead registry
   weight; retire or justify in Phase 2.

## 7. Prioritized backlog (usage-weighted, evidence-cited)

**P0 (next sessions)**
1. Continue the K–8 Tier-C/D remediation backlog (74 lessons; 334 remedial routes end on C/D
   concepts — learners who fail are handed a copy of what failed them). Budget at ~50% fit.
2. Build **`unitChain`** engine (full 8-file contract) — serves vm-01-01/02/03, mmt-01-03 and
   the G5 measurement strand; the highest-yield named engine gap on the books.
3. dotPlot fractional ticks + total/share readout (unlocks vm-02-01/02).
4. Overflow probe sweep across shell routes; fix any measured blowouts (same one-class fix).

**P1**
5. 37 remaining predict-only conversions (cheapest tier-A yield; corpus gate exists).
6. `steppedReveal` enrichment (C, 75 steps/74 lessons — the widest-reach C engine).
7. Interaction-state uniformity pass over the B tier while touching those files.
8. The 73 duplicated predictions — authoring pass, flagged for human review (frozen-content).

**P2**
9. Modularize widgets.tsx only if it materially aids the above; retire unused registrations;
   `subitizeFlash` repair (7 steps) or retirement.

## 8. Content-change ledger

**No authored lesson content was changed.** Code changes this session, all outside content:
- `src/app/page.tsx` — `min-w-0` on course-showcase `<li>` (defect fix, §6.1).
- New read-only audit tooling under `scripts/measure/`: `engine-usage-s121.mjs`,
  `engine-matrix-s121.mjs`, `shots-s121.cjs`, `overflow-probe-s121.cjs`; runner
  `scripts/run-browser-s121.sh`.
- Two lint fixes inside those new scripts (prefer-const; removed unused helper).

---

## 9. Phase 1 execution (Session 121b) — appended after the audit

**Built: `unitChain`** (backlog item P0-2, the highest-yield named engine gap). Twelve
registration surfaces — the twelfth, `pedagogy.ts`'s `widgetWrongPaths`, was absent from the
standing "eleven surfaces" note and is now documented. Integrity gate rejects chain gaps,
mis-anchored hops, and factor-symmetric authoring where a wrong direction reproduces the answer.
Grading names WHICH hop was crossed the wrong way, derived from `unitChainWorlds` (2^hops).

**Converted:** 12 variant-free numeric steps across vm-01-01/02/03, every derived answer asserted
equal to the frozen authored answer before any write. **vm-01-01 C22 → A32 · vm-01-02 C22 → A32 ·
vm-01-03 C22 → A33.** Product tiers **A 595 → 598 · C 304 → 301**. K–8 backlog 74 → 71.

**Overflow sweep** (backlog item P0-4) completed: `min-w-0` on CatalogClient cards and the
/dev/widgets gallery sections, `overflow-x-clip` on the courses wrapper. All 47 browser captures
measure `hOverflow:0px`.

**Gates after Phase 1:** typecheck 0 · vitest **10,008 tests / 159 files** (10,006 pass in the
full run; the 2 stragglers are 5s *timeouts* on the two heaviest variant generators under CPU
contention — `variants.test.ts` alone passes **3845/3845**) · validate:content 1223/1223 ·
lint:pedagogy 1139/1139 · lint 0 errors · check-registration consistent · build exit 0 ·
**Playwright 47/47** · predict-qa 73 problems, all pre-existing legacy duplicates, zero added.

**Deferred with reason:** dotPlot fractional ticks (backlog P0-3) — the session budget rule caps
finished engines at 2 and `unitChain` plus the sweep consumed it; the vm-02-01/02 hosts remain
Tier C and are the first item for the next session.

### 9.1 Session 121c addendum — mc-01 cluster onto unitChain

Measurement redirected the plan: the G4 `measure-convert` mc-01 cluster needed only manip≥2
(was 1) to clear Tier A, and the widget swap alone provides it. `convert-mc01-s121.mjs` moved the
variant-free numeric steps of mc-01-01/02/03 onto `unitChain` under the same frozen-answer
assertions. **mc-01-01 B27 → A31 · mc-01-02 B27 → A32 · mc-01-03 B27 → A31.**

**Session close (regenerated from disk):** tiers **A 601 · B 199 · C 301 · D 28** (session start
A 595 · B 202 · C 304 · D 28) — twelve lessons to Tier A on one new engine. Registry **104**
types (98 manipulatives). Gates: typecheck 0 · **vitest 10,008/10,008 (159 files, clean
single-invocation run)** · validate:content 1223/1223 · lint:pedagogy 1139/1139 ·
check-registration consistent · build exit 0 · **Playwright 47/47, PWEXIT:0** · 47 browser
captures all `hOverflow:0px` · validate:native clean on the packaged tree.

### 9.2 Session 121d addendum — dotPlot given/read mode; the vm-02 pair

The S120j dotPlot spec was corrected by measurement, then the corrected design shipped the same
session: a **given/read mode** on a true fractional lattice (the S119 `denom` channel — exact
integer numerator units, no floats near grading). Six vm-02 steps whose line plot lived inside an
undrawn parenthetical now draw it; the learner marks the asked stack on the plot itself. vm-02-01
i1/i2 → dotPlot read; vm-02-02 i1 → numberLineHop rational hops (existing Tier-A engine). Every
frozen answer preserved (same abort-before-write assertions).

**Hazard recorded:** a new `canCheck` case can land inside an existing fall-through label group
in `evaluate.ts` and silently hand the labels above it the new body — type-legal, caught by
inspection, relocated with the shared body verified byte-identical.

**Session close (regenerated):** tiers **A 603 · B 199 · C 299 · D 28** — fourteen lessons to
Tier A this session (unitChain ×12, dotPlot-read/numberLineHop ×2). K–8 backlog 74 → **69**.
Gates: typecheck 0 · **vitest 10,030/10,030 (160 files)** · validate:content 1223/1223 ·
lint:pedagogy 1139/1139 · check-registration consistent · build exit 0 · **Playwright 47/47** ·
47 captures `hOverflow:0px` · validate:native clean on the packaged tree.

### 9.3 Session 122 addendum — coordinate-geometry cluster (no engine work)

Target chosen by measurement, not impression: 322 of 1,153 remedial routes still land on a
concept whose best experience is Tier C/D, and the weak-tag distribution is flat (max 2 routes
per tag), so leverage sits in course *clusters*. `coordinate-geometry` led the K–8 list with 6
weak lessons over an A-tier bench.

**Converted with zero engine work**, onto three existing A-tier engines: cg-02-01 i1 →
numberLineHop, cg-02-01 i2 → ratioTable, cg-04-01 i1 → shapeFamilyBuilder. **cg-02-01 C → A33 ·
cg-04-01 C → A32.** Four of the six declined with recorded reasons — the bench heuristic predicts
*availability*, not *fit*, and a widget that would change the assessed claim is a decline, not a
conversion.

**Close (regenerated from disk):** tiers **A 605 · B 199 · C 297 · D 28** (S121 start: A 595 ·
B 202 · C 304). Sixteen lessons to Tier A across S121+S122. K–8 backlog 74 → **67**; remedial
routes on weak concepts 334 → **318**. Gates: typecheck 0 · vitest 10,030/10,030 (160 files) ·
validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent ·
**build exit 0** · **Playwright 47/47** · 47 captures `hOverflow:0px` · native clean on the tar.

**Environment finding:** a build worker `SIGKILL` is memory pressure from resident vitest
workers, not a type error — pkill, verify `free -m`, rebuild with
`NODE_OPTIONS="--max-old-space-size=2560"`. Recorded in SESSION_NOTES.

### 9.4 Session 123 addendum — `slopeTriangle`, the catalogue's highest-centrality static pair

Target taken from FLAGSHIP.md's own ranking rather than the K–8 backlog: lf-01-02 (#21,
centrality **273**) and lf-01-03 (#22, centrality **272**) were 100% static with `engine fit: —`.
Centrality that high sits upstream of a large share of the prerequisite graph, so a Tier-B ceiling
there propagates further than anything left in the K–8 list.

**Built `slopeTriangle`** across all twelve registration surfaces (22 engine tests): two draggable
points with the rise/run triangle drawn between them, so slope is read off the legs rather than
recalled as a formula — and dragging the second point below the first flips the leg direction,
making the sign misconception visible instead of merely graded. **lf-01-02 B25 → A30 ·
lf-01-03 B26 → A30.**

**Defect caught mid-build:** two JSX text nodes carried *literal* escape sequences (`\u2212`,
`\u00d7` as text), rendering raw backslash-u strings in the browser while every test passed —
the strings were never asserted on. Recorded in SESSION_NOTES: escapes in JSX text are not
interpreted; use the character or an expression.

**Close (regenerated from disk):** tiers **A 607 · B 199 · C 295 · D 28**. Across S121–S123:
**A 595 → 607 · C 304 → 295**, eighteen lessons to Tier A, registry 103 → **105**, tests
9,977 → **10,061 (161 files)**. Gates: typecheck 0 · vitest 10,061/10,061 · validate:content
1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent · build exit 0 ·
**Playwright 47/47** · 47 captures `hOverflow:0px` · native clean on the packaged tree.

### 9.5 Session 124 addendum — fg-02-02, and the backlog measured rather than assumed

**Converted:** fg-02-02 i2 → `slopeTriangle` (S123's engine) + a prediction; the last non-variant
slope-through-two-points step in the corpus. Authored commonErrors were typed VALUES (6 = rise
alone, 3 = run alone); a construction engine has no "6" to type, so they were re-expressed as the
reachable BUILD errors carrying the same misconception. **C24 → A32.**

**Three corrections, each measured:**
1. A hypothesis raised this session — that much of the backlog is reasoning-assessment work that
   should never convert — was **disproved**. Across all 66 K–8 backlog lessons: 1 is reasoning-MCQ
   dominated (fg-03-02, 83%), 1 mixed, **64 computational and convertible in principle**.
2. **The backlog is engine-bound.** `manip<2` on **66 of 66**; blocked by prediction alone: **0**.
   Predictions can never finish a backlog lesson; every one needs an engine fitting its action.
3. The S122 "bench width predicts fit" heuristic is now wrong twice (cg 2/6, fg 1/5). Bench width
   predicts *availability*; fit is per-step and read from the authored claim.

**Declined with reasons:** fg-03-02/03-03 (distractors assess reasoning — "because it's an
equation", "because of the +10" — which a rate-comparison widget would delete); fg-04-02/04-03
(need a graph-story engine that does not exist). All four remain Tier C, correctly.

**Close (regenerated from disk):** tiers **A 608 · B 199 · C 294 · D 28** · registry **105** ·
tests **10,061 / 161 files**. Across S121–S124: **A 595 → 608 · C 304 → 294**, nineteen lessons to
Tier A, K–8 backlog 74 → **66**. Gates: typecheck 0 · vitest 10,061/10,061 · validate:content
1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent · build exit 0 ·
**Playwright 47/47** · 47 captures `hOverflow:0px` · native clean on the packaged tree.

### 9.6 Session 125 addendum — `graphRead`; and the "undrawn object" pattern, third occurrence

**Built `graphRead`** (twelve surfaces, 16 tests): picture graphs and bar graphs the learner
reads a value off. mmt-05-01/02 are Grade 2 lessons whose entire skill is getting a number off a
drawn display — and the display was never drawn; a seven-year-old was reading a *sentence* about
a graph and typing a number. Same class as the S121d dotPlot finding, now seen three times: when
a lesson's skill is reading a representation, check first that the representation is on screen.

**Converted** the six non-variant interactive steps, every derived value asserted equal to the
frozen authored answer. **mmt-05-01 C → B29 · mmt-05-02 C → B29** (manip 0 → 2, conseq 0 → 3).

**They stop at B deliberately.** Both miss Tier A only on `prediction: 0`, and no honest
prediction exists: the step order is c1 · i1 · c2 · i2 · c3 · i3, and each concept step states the
outcome its following interactive step would predict. Adding one would buy three rubric points
with a question the learner just read the answer to. **Consequence:** the "C-only load-bearing"
count now conflates engine-blocked lessons with lessons that are legitimately B, and should not
be read as a pure work queue.

**Close (regenerated from disk):** registry **106** · tiers **A 608 · B 201 · C 292 · D 28** ·
tests **10,092 / 162 files**. Across S121–S125: **A 595 → 608 · B 202 → 201 · C 304 → 292**,
registry 103 → 106, tests 9,977 → 10,092, K–8 backlog 74 → **64**. Gates: typecheck 0 ·
vitest 10,092/10,092 · validate:content 1223/1223 · lint:pedagogy 1139/1139 ·
check-registration consistent · **build exit 0** · **Playwright 47/47 (PWEXIT:0)** ·
32 captures HTTP 200, zero horizontal overflow · native clean on the packaged tree.
