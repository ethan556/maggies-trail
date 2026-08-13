# Plan v3 — Implementation Wave 1 (WS-A, WS-H, WS-G, WS-E, WS-J)

Prepared 2026-08-13, session S240. This wave moved five `OPTIMIZATION_PLAN_V3.md` workstreams
from scoping plans (`WS_A_BRAND_PLAN.md`, `WS_H_LANDING_PLAN.md`, `WS_G_QA_FACTORIES_PLAN.md`,
`WS_E_PREDICTION_PURGE_PLAN.md`; WS-J had no prior plan) to a first, real, gate-verified
implementation slice each. Execution pattern per the user's standing instruction: a fable-model
agent resolved each plan's open questions against live evidence, an opus-model agent turned
resolutions into concrete task lists (WS-A/H/G/E only — WS-J's fable pass did both jobs itself),
and sonnet-model agents implemented. Two background workflows ran this: `wf_9aa38109-00d`
(WS-A → WS-H/G/E in parallel, 9 agents, ~7.8M ms wall time, 1,165,437 tokens, 520 tool calls) and
`wf_b88c70df-334` (WS-J, 2 agents, ~1.65M ms, 306,332 tokens, 90 tool calls).

**Every gate result below was re-run and independently confirmed by the orchestrating session
after all commits landed — not taken on any agent's self-report.** See §7.

## 1. What shipped, by workstream

| WS | Commit | What it is |
|---|---|---|
| J | `53f5817` | Avatar concept ledger, production spec, canonical `avatars.ts` manifest (16 concepts, all `enabled: false`), honesty-gated tests, placeholder silhouette. Zero production art — none exists yet, by design. |
| A | `134c5f3` | Real Maggie's Trail brand system (mark, wordmark, `brand.tsx`) replacing "Tally Peak" everywhere it rendered. |
| H | `3b8df69` | Real hero manipulative on the landing page (not a mockup), honest catalogue-derived proof strip, public nav, `HeroWidget` retired. |
| G | `21a0726` | Two MCQ integrity gates (exactly-one-correct; near-duplicate option labels) — both fire clean on the full corpus. |
| E | `366860b` | Real prediction-gate adjudication rubric + read-only evidence generator + 23-gate hand-adjudicated pilot, replacing a rubber-stamp CSV. |

Five commits, all on `cowork/s237`, all independently gate-verified after the fact (§7). Zero
edits to `content/courses/` across the entire wave. Zero CI/workflow/hosting files created
anywhere in the wave (two workstreams explicitly wanted this and were barred — see §3).

## 2. WS-J — student avatars

No prior scoping doc existed for this workstream, so the fable pass did research and
architecture in one sitting rather than resolving a plan's open questions.

**Shipped:** `AVATAR_CONCEPT_LEDGER.md` (catalogs all 16 board concepts by non-sensitive visual
traits only — no race/ethnicity, no invented names; flags the summit/9-12 band's **zero board
anchors** as the top regeneration priority). `AVATAR_ART_PRODUCTION_SPEC.md` (the commissioning
spec real portraits must be re-rendered to). `src/lib/avatars.ts` (manifest + resolver service,
16 entries, every one `enabled: false`). `src/lib/avatars.test.ts` (18 tests including a
permanent honesty gate: an `enabled: true` entry with no file on disk fails the suite,
structurally blocking silent board-crop substitution). `public/avatars/placeholder-neutral.svg`
(the only shipped image — a featureless silhouette labeled a placeholder three separate ways).

**Deliberately not done:** `Profile.avatarId` + `sync.ts` merge/validation lines (hot,
deeply-tested shared files — left as an isolated ~10-line follow-up), picker component,
propagation to any render surface, service-worker precache, all actual portrait/symbol art.

**Decisions needed:** none. Stayed off every hot shared file on purpose.

## 3. WS-A — brand system

**Decided by the fable pass** (none escalation-grade — all git-reversible, zero new infra/cost):
Tally Peak scrapped entirely, no motif carryover. Vectors hand-authored in-session as outlined
SVG paths (this repo has zero font infrastructure, so `<text>` would system-font-degrade).
Palette Option A — `src/lib/palette.ts`'s 5 math-semantic hexes untouched; the new brand hexes
(`#0D1B2A`/`#F7F3EC`/`#F08A24`) are an independent namespace. `src/app/page.tsx` deliberately
held for WS-H to compose rather than WS-A reinventing an insertion WS-H would just rewrite.

**Shipped:** `public/brand/maggies-{mark,wordmark}{,-mono}.svg`, `src/components/brand.tsx`
(`MaggieMark`/`MaggieWordmark`/`MaggieBrandLockup` — the lockup's wordmark is a live text slot,
never baked art, because the nav's personalized "`{name}`'s Trail" is a runtime string). Swapped
into `SiteNav.tsx`, `LessonPlayer.tsx`, both `icon.svg` files, `layout.tsx`. Five superseded
`public/brand/*.svg` files deleted after confirming zero remaining references.

**Caught during implementation, not shipped broken:** the mono wordmark's generator was baking
literal hex into stroked sub-elements despite the group using `currentColor` (an orange "R" in
the mono render) — caught by rendering and actually looking at it, fixed, re-verified.

**Disclosed simplification:** the wordmark is a hand-authored geometric monoline slab-serif, not
true high-contrast bezier letterforms. Stated plainly rather than silently approximated.

## 4. WS-H — landing page

**Decided by the fable pass:** hero engine is `CovariationScrubberW`, not `LineExploreW` — the
plan's own §2.3 hadn't caught that `lineExplore` never actually cleared the S240 evidence-driven
hero tier (`stageWidth.ts:148` keeps it `"wide"`, and its SVG self-caps at `max-w-xl`, the exact
"promoting width does nothing" exclusion class), while `covariationScrubber` is hero-promoted
with real 1440px pixel QA.

**Shipped:** `covariationScrubber.tsx` extracted from the `widgets.tsx` monolith (a genuine
correction happened here — the plan described `AxisCaptions`/`LabReadout` as covariation-local
helpers safe to move; the implementer verified 27 and 36 other live call sites respectively still
depend on them in `widgets.tsx` and copied instead of moved, avoiding breaking ~60 unrelated
widgets). `LandingHero.tsx` — a real, functioning manipulative on the homepage (real
`evaluate()`/`canCheck()`, not a mockup), lazy-loaded so the widget engine never enters the
initial marketing bundle. `ProofStrip.tsx` — every number sourced from the live catalogue, no
invented social proof. A new public nav composing WS-A's `MaggieBrandLockup`. `HeroWidget.tsx`
retired.

**Real bug found and fixed along the way:** `useCountUp`'s second parameter was implicitly typed
to the literal `280` inferred from an `as const` object, which `ProofStrip`'s call couldn't
satisfy — fixed with an explicit `number` annotation, verified non-breaking against its one other
caller.

## 5. WS-G — QA factories

**Decided by the fable pass:** "Fable-Q" has real precedent in this codebase under the adjacent
name **"Fable-QA"** (S213–S217: a fresh, independent session executing a written rubric against
measured evidence, never the implementer self-certifying) — this also answers the identical open
question in WS-E's own plan.

**Shipped:** an exactly-one-correct integrity check for the plain `mcq` widget type (closes a
live grading hole — `evaluate.ts` would grade a learner correct on whichever flagged option it
finds first if two were ever marked `correct: true`, and nothing previously caught that). A
conservative near-duplicate option-label detector, honoring the existing exact-duplicate check's
S238 design constraint (never collapses "8" vs "8 remainder 2"). **Both fire clean on the full
1840/1840 + 1711/1711 corpus** — no remediation queue was needed, nothing shipped as
warning-only.

**Correction flagged:** the plan expected the mcq-correctness check to show up under
`validate:content`; the actual call graph means it structurally only can under `lint:pedagogy`.
Verified via the call graph, not assumed — a documentation correction, not a design problem.

## 6. WS-E — prediction gate reform

**Decided by the fable pass:** the world-layer system (`src/world/`) was **oversight, not a
deliberate shelving decision** — no deprecation ruling appears in any handover/ledger, the world
routes were actively maintained after S221, and `/courses/[slug]` still live-redirects into
`/basecamp/` (nobody leaves a live main-path redirect into a system they deliberately shelved).
Phase 5 is scoped as extend-and-integrate, not deprecate-and-rebuild — not executed this wave,
just unblocked for later.

**Shipped, strictly read-only over `content/courses/`:** `WS_E_PREDICTION_RUBRIC.md` —
operationalizes the plan's 5 categories into per-gate rules that require quoting the gate's own
prompt/reveal text; `widget_type` lookup is explicitly forbidden as verdict evidence (that's the
old system's exact failure mode — its `reason` column repeats one boilerplate sentence across all
1,362 rows). `scripts/audit/prediction-gate-evidence.mjs` — read-only evidence generator.
`PREDICTION_GATE_ADJUDICATION.csv` (1,362 gates, full context, rubric columns empty) and
`PREDICTION_GATE_ADJUDICATION_PILOT.csv` (23 gates, hand-adjudicated).

**Notable finding — hedged appropriately, single-course signal, not a corpus claim:** the pilot's
result ran counter to the plan's "count may drop steeply" expectation: **19 KEEP / 4 REWRITE / 0
REMOVE**, nearly the reverse of the old CSV's 9 KEEP / 14 REMOVE for the same 23 gates. Widget
types the old CSV blanket-removed for lacking "direct manipulation" capability turned out, on
actual reading, to carry the most conceptually rich reveal writing in this batch. This should not
be extrapolated to the other 1,339 gates without reading them — but it's real evidence that
Phase 2's yield could run counter to the plan's assumption for at least some of the corpus.

**Pilot cost measurement** (the concrete input the escalated Q3 below needs): ~30% of gates
(7/23) needed real hard judgment, not mechanical rubric lookup, even with worked examples in
hand. ~13% (3/23) are flagged wanting a second reader. Extrapolated to all 1,362 gates: roughly
**400 genuinely-hard calls, roughly 180 wanting a second reader** — a staffing number, not a
guess.

`PREDICTION_GATE_AUDIT.csv` (the old file) is untouched — `PREMIUM_EXPERIENCE_CONTRACT.md` row
5's machine check still reads it live; repointing that check is a later phase, only after real
re-adjudication exists.

## 7. Independent verification (re-run by the orchestrating session, not agent self-report)

Every gate below was re-run from a clean checkout of the combined result, after all four
commits landed, by the session coordinating this wave — not copied from any agent's report.

```
npm run typecheck                 EXIT 0, clean
npx vitest run --shard=1/4        90 files passed, 5583 tests passed
npx vitest run --shard=2/4        89 passed + 1 skipped, 4225 tests passed + 1 skipped
npx vitest run --shard=3/4        89 passed + 1 skipped, 2368 tests passed + 1 skipped
npx vitest run --shard=4/4        89 files passed, 1253 tests passed
  totals                          357/359 files, 13,429 tests passed, 2 pre-existing skips, 0 failed
npm run validate:content          schema: 1840/1840 clean
npm run lint:pedagogy             pedagogy: 1711/1711 clean
npm run validate:native           3 findings, all 3 the CLAUDE.md-documented archive-only set
                                   (node_modules, .next, tsconfig.tsbuildinfo) — nothing else
node scripts/check-registration.mjs   files ↔ course.json ↔ PLAN.md all consistent
npm run build                     EXIT 0, 57/57 static pages, zero "error" strings anywhere in
                                   the build log, homepage route confirmed 4.26 kB / 216 kB
                                   First Load JS (the next/dynamic hero code-split still works)
```

`git status --porcelain -- content/courses/` returned empty before, during, and after every
commit in this wave. `git status --porcelain -- design-reference/` and the WS-J files
(`src/lib/avatars.ts` etc.) were confirmed untouched by this wave. `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
(Trap K — regenerates on any `vitest run`, per this repo's own documented gotcha) was reset via
`git checkout --` before every commit.

## 8. Decisions needed from you (consolidated, deduplicated across workstreams)

Nothing below blocks anything already shipped in this wave — every item is either genuinely
optional-until-decided or has an honest fallback already in place.

**CI — does this repo get one, and on what platform?** Raised independently by both WS-H (perf
budget enforcement) and WS-G (the QA-factory gate sequence). No `.github/` or `.husky/` exists
today; standing one up is a new infrastructure/hosting/cost commitment and a change to 240
sessions of deliberate manual-gate discipline — not something either workstream should decide by
implication. One ruling resolves both.

**Avatar / brand art production path.** Raised independently by WS-A §6.2 and WS-E Q4 (both flag
the other, expecting one answer to cover both — and it also covers WS-J, which hit the identical
question researching this session): should final portrait/brand art beyond what's hand-authorable
as simple vector geometry be produced in-session, commissioned externally, or something else?
Nothing is blocked either way — every workstream's fallback (structure + spec + honest
placeholder) is already what's shipped.

**WS-E Phase 4's batch-checkpoint mechanism.** How should ~1,362 prediction-gate re-adjudications
(and the ~400 genuinely-hard, ~180 want-a-second-reader subset the pilot measured) actually get
your sign-off — per-batch rulings like this session's frozen-content precedent, a sampled audit,
or something else? This is the design of your own consent process for corpus-scale content
review; it isn't something the executing session can decide for you.

**WS-A's Option A/B palette question** is already decided (Option A, decoupled) but the deferred
Option B chrome retint (`#22314F` → `#0D1B2A` app-wide) remains a real future decision if you want
the interim navy/ink mismatch resolved sooner rather than later — not urgent, no gate depends on
it.

## 9. What's deliberately deferred (not forgotten, not blocking)

WS-A: raster PWA icons (192/512/maskable), OG image + route, Phase 3 chrome retint, Phase 4
typography, Phase 5 cleanup. WS-H: Phase 4 explainer panels, Phase 5 breadth rail, Phase 7 perf
CI. WS-G: the 572-row MCQ remediation burn-down, `authoredMath.ts` extension, e2e corpus-scaling,
the 5 never-measured `PREMIUM_EXPERIENCE_CONTRACT.md` rows, cross-lesson consistency pass. WS-E:
Phase 2's full 1,362-gate re-adjudication, Phase 3's `LessonPlayer.tsx` interruption-cost
softening, Phase 7 art. WS-J: `Profile.avatarId` + sync merge lines, the picker component, all
render-surface propagation, service-worker precache, all actual art.
