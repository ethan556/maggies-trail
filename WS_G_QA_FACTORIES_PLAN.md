# WS-G — Consistency, QA Factories & the Premium Experience Contract: Scoping Plan

Drafted 2026-08-13, Cowork session S240 continuation. **Status: SCOPING ONLY — no code in this
pass.** Scoping 3 of 4 in the sequence confirmed for item 3 of the user's S240 "1->2->3" order
(WS-A → WS-H → **WS-G** → WS-E). `OPTIMIZATION_PLAN_V3.md` §WS-G (lines ~116-123) remains
canonical. See `WS_A_BRAND_PLAN.md` and `WS_H_LANDING_PLAN.md` for the first two scoping passes.

**The headline finding of this pass, ahead of the detail below: WS-G is far less greenfield than
its five-bullet plan-doc summary suggests.** Two of its five sub-deliverables are substantially
complete continuations with a known remaining queue; a third has real infrastructure but is
checking a different axis than the contract needs; only two pieces (the cross-lesson consistency
pass, and about half the contract's own rows) have never been touched by any prior session. The
plan below is organized by that readiness gradient, not by the plan doc's original item order,
because "finish what's 90% done" and "build what's 0% done" are different kinds of work with very
different risk profiles.

---

## 1. The bar — and a correction: it already exists as a real file, not just plan-doc text

`PREMIUM_EXPERIENCE_CONTRACT.md` **already exists in this repo** (46 lines, "adopted 2026-08-12" —
one day before this scoping pass) and its 13-row table is word-for-word the same list in
`OPTIMIZATION_PLAN_V3.md` lines 116-123. It is not a stub — it's the live artifact, and it already
self-annotates each row with a check-type tag (`pixels` = manual/adversarial review only,
`machine` = CI-gateable). That tagging is itself the most useful piece of pre-existing scoping
work here, reproduced in full in §2.4.

Plan doc's stated bar: linter 1,701/1,701 (i.e., corpus-wide, not sampled); contract violations =
0 on shipped surfaces.

---

## 2. Current state per sub-deliverable, ordered by readiness (most-done first)

### 2.1 MCQ factory (plan item 3) — audit phase complete, a known 572-row queue remains

`MCQ_DISTRACTOR_AUDIT.csv` (repo root, 3,293 rows, generator: `scripts/audit/
premium-rebuild-baseline-s226.mjs`) already does everything item 3 asks for: length-leakage
columns (`correct_length`/`longest_wrong_length`/`longest_option_leak`), `punctuation_leak`,
`blind_guess_test` (answerable-without-reading-the-question PASS/FAIL), `distractor_taxonomy`
(misconception tag per distractor), `unmapped_distractors`, and a `decision` column. Breakdown:
**2,565 non-remedial MCQ moments** (the plan's "2,566" figure, off by one — almost certainly drift
since the plan was drafted) + 728 remedial-pair variants = 3,293 total, spanning 1,351 lessons.
Decisions: **2,721 KEEP, 572 REMEDIATE** — that 572 is the exact number the contract itself cites
as the "Wave C queue," tracked with a live burn-down in `CLOSURE_LEDGER.md` row `CL-P1-048`
("125/697 REMEDIATED... regenerated queue has 572 rows"). Confirmed still open, not silently
finished or abandoned: `HANDOVER_COWORK_S240.md` and `PREMIUM_REBUILD_S240_EXECUTION.md` (both
timestamped today) explicitly list "WS-G MCQ factory" under work S240 did not do.

**Two small, well-scoped, NEW gates surfaced by this audit, not previously identified anywhere:**

1. The base `mcq` widget type (`McqSpec`, `src/lib/schema.ts:51`) has **no integrity check
   enforcing exactly one correct option.** ~10 newer "Lab" choice-widgets (`scaledCircleLab`,
   `percentChangeLab`, `equationOutcomeLab`, `signedFractionLab`, `triangleClosureLab`,
   `shapeHierarchyLab`, `pointSetReasoningLab`, `geometricConstraintLab`,
   `distributionCompareLab`, `compoundEventLab`, `compositeAreaLab`) already have an explicit
   `if (correct.length !== 1) errs.push(...)` in `widgetIntegrityErrors`
   (`schema.ts:6973-8189`) — plain `mcq` doesn't. `evaluate.ts:428-432` grades by looking up the
   selected option's `correct` flag directly, so if an author ever marks two options `correct:
   true`, a learner is graded right on either pick and nothing today catches it. Small, mechanical,
   clearly in scope for item 3's "unique correctness verified."
2. `pedagogy.ts:508-517` already rejects two MCQ options sharing **identical** label text, but has
   no near-duplicate-phrasing check — `PREMIUM_REBUILD_S240_EXECUTION.md` states this outright as
   still-needed. Also in scope for item 3.

### 2.2 Typography factory (plan item 4) — the renderer exists and is broadly adopted; the gap is higher-math notation

`OPTIMIZATION_PLAN_V3.md` line 44 lists "math rendered as plain text (no KaTeX/MathML)" as a
current defect — **that line is stale.** KaTeX 0.16.30 is fully wired:
`src/lib/math/renderMath.ts` (the sanctioned renderer, emits MathML alongside HTML specifically
for screen readers), `src/components/math/MathText.tsx` (`MathInline`/`MathDisplay`/`MathProse`,
lazy-loads KaTeX assets only when a lesson has math tokens, reserves `minHeight` for zero CLS), and
`src/lib/math/authoredMath.ts` (a shorthand-to-TeX converter so authors write plain `x^2`/`1/2`/
`sqrt(9)` in JSON; includes a tested "false numeric claim" guard that refuses to typeset an
arithmetic snippet whose two sides don't actually compute equal — a defect class from session
S237 it was specifically built to prevent). Adoption is broad: `Rich()` in `playerChrome.tsx:81`
(the standard renderer for every lesson concept-step body) routes all body text through it, with
~193 call sites across `widgets.tsx`, `LessonPlayer.tsx`, `QuizShell.tsx`,
`CausalMasteryPanel.tsx`. A dedicated gate, `npm run verify:math-format` →
`scripts/verify-math-format.mjs`, enforces a single-importer rule, zero raw-LaTeX-command lesson
files, and CSS contracts (dark-mode color inheritance, horizontal scroll instead of page overflow
at 360px). There's also a browser-level check, `e2e/wave04-math-rendering.spec.ts`.

**The real, narrower remaining gap:** `authoredMath.ts`'s shorthand parser has no handling for
integral, summation, or limit notation. Genuine Unicode `∫`/`Σ`/`lim` characters render as literal
prose text (not KaTeX) in **63 content files**, concentrated in Calculus/Precalc
(`integration-accumulation/`, `limits-continuity/`, `series-convergence/`, `data-and-models/`,
`integration-applications/`, `sequences-series/` — e.g. `in-01-03.json` has 46 `∫` occurrences,
`lc-02-01.json` has 43 `lim`, `sc-01-02.json` has 31 `Σ`). This matches the contract's own
retrospective note ("Wave B → WS-C typesetting, largely done") — largely, not entirely.

### 2.3 Lesson linter (plan item 2) — a mature sibling exists, but checks a different axis; nothing runs in CI

`npm run validate:content` / `npm run lint:pedagogy` (both map to `scripts/content-check.ts`,
schema and pedagogy modes) are real, mature, and passing at corpus scale today — **1840/1840** and
**1711/1711** respectively (verified live during this audit; note `CLAUDE.md`'s own gate-sequence
section cites stale figures, 1223/1223 and 1139/1139, left over from when the corpus was smaller —
don't treat that file as current truth for these counts, only for the gate *names* and *process*).
`lint:pedagogy` (`src/lib/pedagogy.ts`, 675 lines) concretely checks: step-count bounds,
concept-body word caps, action-steps require a widget, check/challenge steps require
`conceptTag`+2 distinct `explanationVariants`, challenges need exactly 3 hints in the final third,
recap-last-with-teaser, predictions only on interactive widget steps, no pre-solved
sliders/dragOrder/toggleExplore, ≥2 diagnostic wrong-paths on numeric/fractionEntry/pointEntry
checks, no shared `commonErrors` values, no duplicate MCQ option text, no generic dismissive
feedback, ≥25-char wrong-path feedback, no shared distractor feedback text.

**This is content-integrity/pedagogy-structure checking, not the Premium Experience Contract's
checklist** — zero of its rules cover MVA, direct manipulation, control-panel syndrome, 390px,
keyboard/reduced-motion, label collisions, or typography. Those live in genuinely separate,
scattered tooling: `DIRECT_MANIPULATION_AUDIT.csv` (one-time 121-row classification snapshot, not
a live gate), `src/components/widgets.labelCollision.s237.test.tsx` +
`figures.labelCollision.s238.test.tsx` + `e2e/s237-label-collision.spec.ts` (real, but the e2e
layer samples only 2 lessons), and 390px/keyboard/axe e2e coverage on only 4 hand-picked lessons.
**None of it — old or new — runs in CI, because no CI exists in this repo at all** (no
`.github/workflows`, no `.husky`, confirmed by direct search). Every gate in this project,
including the mature ones, runs manually per session per `CLAUDE.md`'s standing instruction.

Item 2's actual scope, given this: not a from-scratch linter, but (a) extending
`content-check.ts`/`pedagogy.ts` with new rule categories for the contract's machine-checkable
rows, or a second consolidated linter that unifies the scattered e2e/CSV checks; (b) scaling the
sampled e2e checks (label collision, 390px, keyboard/a11y) to the full 1,701-lesson corpus instead
of a handful; (c) adding the two items the plan explicitly names that nothing currently checks at
all — TTS strings and XP arithmetic; (d) standing up CI so any of this runs automatically, which is
a distinct infrastructure decision (§4 Phase 5) bigger than "write more checks."

### 2.4 The contract's own rows — half real, half never measured

Reproducing the contract file's own self-tagging, since it's already the correct scoping signal:

| Row | Tag | What actually exists |
|---|---|---|
| MVA ≥60% | pixels | **Nothing** — no script, no prior mention anywhere outside the contract/plan. |
| Direct manipulation | pixels + CSV | `DIRECT_MANIPULATION_AUDIT.csv`, 121 rows (68 DIRECT/47 HYBRID/6 KEEP-SLIDER) — one-time snapshot, not live. |
| Continuous transitions | pixels | **Nothing** (no CMR-computing tool). |
| Chrome census | machine + pixels | **Doesn't exist as code anywhere** — text-only in the contract file. |
| Purpose-free predictions | machine, CSV | `PREDICTION_GATE_AUDIT.csv`, 1,362 rows, real KEEP/CONVERT verdicts — this is WS-E's own input, see that plan. |
| Immediate response | pixels | **Nothing.** |
| Excellent at 390px | machine (e2e) + pixels | Real, but only 4 hand-picked lessons. |
| Keyboard + reduced-motion | machine (e2e+axe) | Real but partial, same 4-lesson sample. |
| Typography | machine | Real and mature — §2.2. |
| Label collisions | machine | Real — §2.3 — but e2e layer samples only 2 lessons (the unit-test layer, `COLLISION_SWEEP=1`, IS corpus-wide at 11,957 specs; the two layers check different things — see `HANDOVER_COWORK_S240.md` §2.6 for a fresh example of the unit-test layer's own blind spot, a viewBox-overflow case it didn't catch). |
| Feedback-only state change | pixels | **Nothing.** |
| Control-panel syndrome | pixels | **Nothing** — zero mentions anywhere in 240+ sessions of history except the contract and the plan. |
| MCQ answer-shape leakage | machine, CSV | Most mature row in the whole contract — §2.1. |

Four rows (MVA, continuous transitions, immediate response, feedback-only state change,
control-panel syndrome — five, not four) have **never been measured once**, by any prior session,
in any form. That's the honest greenfield core of WS-G, and it's smaller than the plan doc's
five-bullet summary implies once the MCQ/typography/linter continuations are separated out.

### 2.5 Cross-lesson consistency pass (plan item 5) — fully greenfield

No prior script, CSV, or even informal mention found anywhere. The plan doc's own description
(Fable-Q scores transitions between consecutive steps/lessons on band samples — 20 K–2, 20 3–5, 20
6–8, 30 HS, 10 Calc — target XLC ≥9.5) is detailed enough to scope directly, but "Fable-Q" as an
operational role isn't something this audit could confirm a concrete precedent for in this
codebase's own session history — flagged as an open question in §5, not assumed.

---

## 3. Phased implementation plan — ordered by leverage and readiness, not the plan doc's item order

**Phase 1 — Close the two small MCQ integrity gates (§2.1).** Add the missing
`correct.length !== 1` check to plain `mcq` in `widgetIntegrityErrors`, matching the pattern the
~10 Lab widgets already use. Add near-duplicate (not just exact-duplicate) option-label detection
to `pedagogy.ts`. Both are mechanical, well-scoped, low-risk, and immediately reduce the class of
bug the MCQ factory exists to prevent — do these before, not after, burning down the 572-row queue,
since new content authored during that burn-down should already be protected by both checks.

**Phase 2 — Finish the 572-row MCQ remediation queue (§2.1).** Continuation of existing work,
already tracked in `CLOSURE_LEDGER.md` `CL-P1-048`; follow the existing batch-review process
(`CLAUDE_COWORK_EXECUTION_PROMPT_S237.md:185`, 20-50 rows per human-reviewed batch).

**Phase 3 — Extend `authoredMath.ts` for ∫/Σ/lim notation (§2.2).** Add shorthand recognition for
integral/summation/limit forms, then convert the 63 flagged Calc-band files from literal Unicode to
real KaTeX. Narrow, well-scoped, and the file list is already known.

**Phase 4 — Consolidate and corpus-scale the contract's sampled machine checks (§2.3/§2.4).**
Take label-collision, 390px, and keyboard/reduced-motion coverage from their current 2-4-lesson
e2e samples to the full 1,701-lesson corpus (the unit-test collision layer is already corpus-wide
at 11,957 specs and can likely be the model for the others, rather than trying to scale Playwright
e2e itself to 1,701 lessons — that distinction is worth resolving explicitly before building, since
e2e-per-lesson at that scale has very different runtime cost than a unit-test sweep).

**Phase 5 — Decide on and stand up CI.** No CI exists in this repo in any form. This is a bigger
infrastructure decision than the rest of WS-G and probably deserves its own explicit go/no-go
rather than being assumed — see §5. If yes: wire Phases 1-4's gates plus the existing mature ones
(`validate:content`, `lint:pedagogy`, `validate:native`, `check:registration`) into an actual CI
pipeline so "in CI" (the plan's own phrase for item 2) becomes literally true instead of "run
manually every session," which is today's actual practice.

**Phase 6 — Build the genuinely-unmeasured contract rows, easiest first.** Of the five
never-measured rows (§2.4), triage by how mechanically checkable each one actually is before
starting: "chrome census" (count persistent controls/labels per screen against a threshold) sounds
tractable as a static or e2e check; "immediate response" (response latency) is plausibly
measurable via existing e2e infra; "feedback-only state change" and "control-panel syndrome" are
closer to judgment calls needing a rubric before any tooling can check them; "MVA" (mathematical
object's share of visual area) needs a defined measurement methodology (pixel-area of the
widget's bounding box vs. total content area, at a specified viewport) decided before any script
can compute it. Recommend starting with chrome census and immediate response, and treating MVA/
control-panel-syndrome/continuous-transitions/feedback-only-state-change as a follow-on batch once
a rubric exists — don't let the five get treated as equally ready to build.

**Phase 7 — Cross-lesson consistency pass (§2.5).** The most under-specified item relative to this
codebase's own conventions; resolve §5's Fable-Q question before scoping this phase further, since
the answer changes whether this is a scriptable rubric-based check or a review process needing a
human/agent panel.

---

## 4. Non-goals for WS-G

- The prediction-gate adjudication itself (`PREDICTION_GATE_AUDIT.csv`'s 1,362 rows) — that's
  WS-E's deliverable; WS-G's contract row 5 references the same CSV as an input but doesn't own
  the purge.
- Rebuilding `content-check.ts`/`pedagogy.ts` from scratch — Phase 1/4 extend it; it's mature and
  shouldn't be replaced.
- Widget-level direct-manipulation conversions themselves (the `DIRECT_MANIPULATION_AUDIT.csv`
  121-row classification) — that's WS-C's completed/ongoing work; WS-G only measures and gates it.

---

## 5. Open questions for whoever starts implementation

1. **CI, yes or no (Phase 5)** — standing up CI from zero is a meaningfully different kind of
   decision (hosting, secrets, run-time budget for a 1,701-lesson corpus's full gate sequence) than
   the rest of WS-G's content/tooling work. Worth an explicit call before Phase 5, not an assumed
   yes.
2. **What "Fable-Q"/"Fable-A" concretely means in execution terms.** `OPTIMIZATION_PLAN_V3.md`
   references these roles throughout (legibility ladder review, token-map approval, the cross-lesson
   consistency pass, art-consistency QA), but this audit found no confirmed precedent in past
   session docs for what executes that role mechanically — a rubric a session runs itself, a
   dedicated review pass, something else. Resolving this affects Phase 6 and Phase 7 specifically.
3. **MVA's measurement methodology** — needs to be defined (bounding-box pixel-area ratio? at what
   viewport? which DOM element counts as "the mathematical object" vs. "chrome"?) before Phase 6 can
   build anything for that row.
4. **e2e-per-lesson vs. unit-test-sweep for Phase 4** — flagged inline above; resolve which
   mechanism scales to 1,701 lessons before committing engineering time to either.
