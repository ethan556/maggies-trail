# Session 102 — The Reveal-Ghost Programme (2026-07-24)

Ten flagship engines were lifted from err=2 to err=3 in a single coordinated
pass. This document is the session's evidence record; read it beside
`REGRESSION_AUDIT_SESSION_101.md` (whose invariants all still hold) and
`UX_POLISH_SESSION_101.md` (whose backlog item 1 this session closes).

## What a reveal ghost is, and the contract every one obeys

A revealed answer must not be a dead display. On reveal (`tone="info"`), each
ghosted engine overlays the CORRECT state — dashed, tangerine, `aria-hidden`,
under a `data-testid="…-ghost"` — against the learner's untouched work. The
codebase's standing ghost grammar was followed exactly:

1. **The ghost predicate mirrors `evaluate.ts`** — same fields, same
   comparisons, same tolerances. If evaluate would grade the state correct,
   the ghost does not render (no redundant overlay on a right answer).
2. **Reveal-phase only.** Working, retry, and success states never show it.
3. **Goal-visible and goal-achieved states are skipped** (the fb-ghost rule).
4. **The correct *state* is shown, not the correct *process*.** `evalOrder`
   ghosts the destination number, never the collapse order; `mixedRegroup`
   names the destination columns, never the exchange sequence; `scatterFit`
   leaves the residual whiskers attached to the learner's line.

## The ten engines

| Engine | testid | Ghost content | Mirrors |
| --- | --- | --- | --- |
| `lineRelationLab` | `lr-ghost` | Target line at the target relation, off the base line for parallel | relation + offset≠0 + requiredMoves |
| `conicLocusLab` | `cl-ghost` | The conic at target eccentricity, labeled `e → family` | `eTenths === target` |
| `relatedRatesLab` | `rr-ghost` | Ladder at the target foot, invariant length preserved | `x === targetX` |
| `argandExplore` | `ag-ghost` | The pre-image z\* = target·w̄ ÷ \|w\|² — where z must GO so z·w lands on the visible ring (multiply mode; place mode's ring already is the answer) | product === target |
| `scatterFit` | `scf-ghost` | The least-squares line — the canonical member of the mse ≤ tolerance accept set | mse ≤ tolerance |
| `mixedRegroup` | `mr-ghost` | "correct state: W wholes and n/d" via `mixedRegroupTruth` | mrFinal vs truth |
| `columnCalc` | `cc-ghost` | "correct result: N" via `columnCalcTruth` | ccAssemble vs truth |
| `evalOrder` | `eo-ghost` | "collapses to: N" — destination only | single token === target |
| `conditionalTableLab` | `ct-ghost` | The asked conditional assembled: given / cell / fraction | condition AND cell |
| `derivativeRuleLab` | `dr-ghost` (×2) | Product mode: the target h and vanishing corner term; chain mode: the asked rate pair and product | mode-split predicate |

Capability ledger: `scripts/engine-capabilities.json` err 2→3 for the ten —
**54 engines rated err=3 as of this session** (was 44; Session 103's tranche 2
later brought the total to 61, leaving 29 at err=2). The consistency
gate's site count stands at 58 ghost testids ≥ 54 rated.

## New permanent gate

`src/components/widgets.revealGhost.s102.test.tsx` — **40 assertions**, four
per engine: ghost present on reveal+wrong; absent on reveal+correct; absent
outside the revealed phase; `aria-hidden="true"`. This pins the
evaluate-mirror identity so a future evaluate change cannot silently strand a
ghost, and a future restyle cannot silently drop one.

## Verification matrix (run on a fresh container after an environment restart)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 — after each of the three patch batches |
| `npx vitest run` | ✅ **112/112 files, 8,171/8,171 tests** (8,131 prior + 40 new), 438 s |
| `engineCapabilities.test.ts` | ✅ 3/3 with the lifted table |
| `npm run build` | ✅ exit 0, 53 s; lesson route 558 kB first load (+1 kB for all ten ghosts) |
| Playwright (production build) | ✅ 3/3, 15.8 s, via `PW_CHROMIUM_EXE=/tmp/chromium` |
| Content hash-proof | ✅ **1,213/1,213 byte-identical** to the Session-100 baseline — zero drift |

Gates not re-run because their inputs are untouched: `validate:content`,
`lint:pedagogy`, `cml:lint:strict`, `check-registration` (no content, schema,
registry, or step-sequence changes this session; their Session-101 results
stand, including the two documented reds).

## Scope of change

Changed: `src/components/widgets.tsx` (ten ghost blocks + `tone` in ten
destructures + two truth-helper imports), `scripts/engine-capabilities.json`
(ten err ratings), `UX_POLISH_SESSION_101.md` (backlog item closed).
Added: `src/components/widgets.revealGhost.s102.test.tsx`.
Untouched: content, schema, evaluate, the player state machine, all solvers.

## Session 103 addendum

A follow-up tranche (reconciled and completed in Session 103; see
`SESSION_NOTES.md` §103) lifted seven more engines — `accumulateArea`,
`balanceScale`, `functionMachine`, `signChart`, `slopeField`, `solveBalance`,
`polarTrace` — to err=3 (**61 total**), fixed a cross-engine testid collision
(`sb-` → `slb-` for solveBalance), settled the aria grammar (every ghost
aria-hidden), and added a permanent cross-engine testid uniqueness gate to
`widgets.revealGhost.s103.test.tsx`. Ghost gates now total 72 assertions.

## Honest boundary

- 29 engines remain at err=2 (after Session 103's tranche); the pattern is
  now mechanical but the work is not done.
- Ghost quality was verified in jsdom and by source inspection, not on a real
  device; visual tuning (dash rhythm, label collision at 360 px) belongs to
  the deferred density pass.
- No learner outcomes were measured. The claim is narrower and solid: on
  reveal, these ten engines now *show* the correct state against the
  learner's own, instead of telling them about it.
