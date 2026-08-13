# WS-E — Storytelling, Prediction Reform & Lesson Purposes: Scoping Plan

Drafted 2026-08-13, Cowork session S240 continuation. **Status: SCOPING ONLY — no code or content
changes in this pass.** Scoping 4 of 4 in the sequence confirmed for item 3 of the user's S240
"1->2->3" order (WS-A → WS-H → WS-G → **WS-E**, the last of the four). `OPTIMIZATION_PLAN_V3.md`
§WS-E (lines ~106-111) remains canonical. See `WS_A_BRAND_PLAN.md`, `WS_H_LANDING_PLAN.md`,
`WS_G_QA_FACTORIES_PLAN.md` for the first three passes.

**The headline finding of this pass, ahead of the detail below, and the most consequential single
fact across all four scoping docs: a substantial, tested "World Architecture" system —
`src/world/`, 23 files, real routes, real tests — already exists in this codebase, predates
`OPTIMIZATION_PLAN_V3.md`, and is never mentioned by it (zero references, confirmed by direct
search).** It is partially live in production today but disconnected from primary navigation. WS-E
part 3 ("world layer, fenced") reads, on its own, like a request to build this from zero. It
shouldn't be scoped that way without an explicit decision first — see §3. The other two
sub-deliverables (prediction purge, purpose-typed lessons) are more straightforwardly scoped below
and don't carry this risk.

---

## 1. The bar — restated from `OPTIMIZATION_PLAN_V3.md`

**Prediction purge:** inventory all prediction gates; evidence packet per gate; adjudicate in
batches; keep only gates with a counterintuitive consequence, common misconception, invariant,
estimate, or causal contrast; retained gates run predict → interact → observe → reconcile. Target
PGR 100% ("count may drop steeply — good"). **Purpose-typed lessons:** replace the universal
template with purpose categories (discovery/causal contrast/construction/worked transfer/fluency/
retrieval/mastery); structure follows purpose. **World layer, fenced:** living trail map replaces
the dashboard card list; age-banded art (K–2 storybook / 3–8 cartographic / HS topographic);
mascot appears at onboarding/hints/summits/empty-states/404; landmark stories always advance on
completion regardless of score; **never inside active reasoning** (explicit stop rule); the
learner's WS-J avatar marks position on the map. **Bar:** PGR 100%; no decorative world-building on
reasoning steps; a 7-year-old can point at the map and say where they are.

---

## 2. Current state per sub-deliverable

### 2.1 Prediction purge — a real audit exists, but it answers a different question than the plan asks, and has zero execution

`PREDICTION_GATE_AUDIT.csv` (root, generator `scripts/audit/premium-rebuild-baseline-s226.mjs`)
has **1,362 rows** (the plan doc cites three different counts in three places — 1,341, ~1,359,
and a footnote math — 1,362 is the current, live, independently-verified figure: it matches the
CSV exactly and matches a direct scan of every `content/courses/*/lessons/*.json` file with a
`predict` field, zero drift either direction). Decision breakdown: **KEEP 1,162 (85.3%), REMOVE
200 (14.7%)** — not "KEEP/CONVERT" as an earlier research pass on a different workstream
paraphrased it; the script codes a third value, `REFRAME`, that has never fired once (0/1,362).

**This is not the qualitative, per-gate adjudication the plan's prose describes.** The CSV has
zero classification against any of the plan's five categories (counterintuitive consequence,
common misconception, invariant, estimate, causal contrast — grepped, zero hits for the first
four; "estimate" only appears as a substring of widget names like `estimateSlider`). There are
only **two distinct `reason` strings in the entire 1,362-row file** — one boilerplate sentence for
every KEEP, one for every REMOVE. The verdict is **a pure function of `widget_type`**: every
instance of a given widget type gets the same decision regardless of the specific prompt or
lesson content (0 of 108 widget types have a mixed KEEP/REMOVE outcome), because the real
discriminator is a lookup into `scripts/engine-capabilities.json` asking "does this widget *type*
support direct manipulation with a visible consequence" — not "is this specific prediction
pedagogically earning its interruption." `CLOSURE_LEDGER.md:104` is self-aware of this, describing
the CSV family as "heuristics... explicitly triage, not curriculum-change authority."

**Zero execution since the audit was generated, confirmed three independent ways:** (a) every
status doc from `CLOSURE_LEDGER.md` through the four most recent Cowork handovers
(`HANDOVER_COWORK_S238.md`/`S239.md`/`S240.md`) lists this as still open, every time; (b) the CSV's
own git history shows exactly one commit, ever (`97a0b72`, S226) — never regenerated or
hand-edited since; (c) direct diff of the CSV's 1,362 `(course, lesson, step)` keys against live
content today: exact match, zero added, zero removed — including manually confirming one specific
REMOVE-flagged row (`as100-01-01/i1`) still has its exact `predict` block, untouched, in the live
lesson file.

**The good news buried in this finding:** the prediction → interaction → observed outcome →
reconciliation loop the plan wants for *retained* gates **already exists in the runtime, uniformly,
running on all 1,362 gates today** — this is not missing plumbing. `LessonPlayer.tsx`: line 92
blocks Enter-key progression until a prediction is committed; lines 591-618 render the "make a
prediction first" radio-group card; **line 635 doesn't even mount the widget in the DOM** until
commit (this is the exact mechanism that tripped up this session's own hero-tier screenshot QA,
documented in `HANDOVER_COWORK_S240.md` §5); lines 811-834 render the reconciliation banner
("Your prediction held ✓" / "Not what you predicted — that's the interesting part") comparing the
learner's pick against `outcomeId`'s `reveal` text; a session-long ledger renders "Predictions: X
of Y held" at lesson completion. **The actual gaps are:** (1) a real per-gate qualitative judgment
against the plan's five categories — pure greenfield, nothing like it exists; (2) interruption
cost — today's gate is a hard, blocking DOM-unmount for every retained gate alike, which is itself
the exact problem `OPTIMIZATION_PLAN_V3.md` Part 1.2 names ("a prediction must earn permission to
exist: expected learning gain > interruption cost") — softening this is a `LessonPlayer.tsx`
change needed even for gates that survive adjudication, not just the ones that don't; (3) nothing
selects gates on pedagogical merit today, only on widget-type capability.

**A risk worth flagging explicitly, not inheriting silently:** `PREMIUM_EXPERIENCE_CONTRACT.md`
row 5 ("0 purpose-free predictions, PGR 100%") already wires its machine check directly to this
CSV's KEEP/REMOVE verdicts as-is. If WS-E's execution simply certifies PGR against the existing
CSV unchanged, it certifies widget-type capability, not the plan's own five-category bar — a
passing gate that doesn't mean what the contract row claims it means. §4 Phase 3-4 treats
re-adjudication as required, not optional, for exactly this reason.

### 2.2 Purpose-typed lessons — fully greenfield, confirmed by direct corpus scan

No `purpose`/`type`/`template` field exists on `Lesson` or `Course` in `src/lib/schema.ts`, and a
direct scan of every lesson/course JSON file's top-level keys confirms none exists in content
either — `Lesson` has only `id/slug/title/courseId/chapterId/minutes/readingProfile/steps/
standards/remedials` (`readingProfile` is a K–2 word-complexity knob, not a pedagogical-purpose
field); `Course.category` is subject area (Math/Logic/CS/Data/Science), not lesson purpose.
**Independent confirmation of the plan's own "one template dominates" framing:** across all 1,701
lessons, `StepKind` sequences (the 5-value enum `concept|interactive|check|challenge|recap`) reduce
to only **94 distinct sequences total**; the single most common sequence covers **562 lessons
(33%)**; the top 3 cover **957 lessons (56%)**. The closest existing thing to a purpose taxonomy is
the optional, step-level (not lesson-level) `CMLStage` enum (`predict/construct/observe/explain/
revise/generalize/retrieve`) inside `CMLMeta` — vocabulary that partially rhymes with the plan's
proposed categories, but tags individual steps rather than structuring whole lessons, defaults
silently to `"construct"` when absent, and reaches full "flagship" depth on only 79 steps
corpus-wide (960/1,701 lessons have *some* `cml` field, far short of full instrumentation). This is
pilot-depth scaffolding, not a lesson-purpose system — genuinely open, no prior attempt to build
around.

### 2.3 World layer — substantially built, tested, and *disconnected* — not absent

This is not a "living trail map replacing a card list" greenfield build. It's an **integration and
reconciliation problem** with a system that already exists:

**What's real:** `content/world/world-manifest.json` (258KB, generated: 14 regions, 129 courses,
530 landmarks, 13 instruments). `scripts/gen-world-manifest.mjs` (generator). `src/world/` — 23
files: `WorldShell.tsx`, `Atlas.tsx`, `Basecamp.tsx`, `Trailhead.tsx`, `FieldJournal(.Client).tsx`,
`Instruments.tsx`, `RegionMap.tsx`, `ReturnPaths.tsx`, plus real test coverage (`world.test.ts`,
`worldSlice.test.ts`, `worldSurfaces.test.tsx` — 29KB of tests). Real Next.js routes:
`src/app/(shell)/{trailhead,atlas,basecamp/[courseId],journal}/`. `RegionMap.tsx:3-4` already
implements language nearly identical to the plan's own "3-8 cartographic, HS topographic" ask, and
it's actually rendered, not dead code. The "never inside active reasoning" stop rule the plan
requires **already has a working guard rail**: `WORLD_ARCHITECTURE.md:75-79` documents a
`verify:trail-voice` check enforcing that no world module is importable from the lesson player.

**Why the plan doesn't know about it:** `src/world/` landed in one squashed commit (`68b5814`,
"S221 closure baseline") — well before `OPTIMIZATION_PLAN_V3.md` (dated Aug 12, written against
S237+ state). It started as a Grade-3 "Pattern Valley" pilot (`GRADE_3_PATTERN_VALLEY_PILOT.md`),
was widened to all regions in session 201, and was **deliberately kept additive rather than a
replacement** at the time — "Legacy Dashboard remains available rather than being silently
deleted." `OPTIMIZATION_PLAN_V3.md` has zero references to `atlas|trailhead|basecamp|journal|
world-manifest|WorldShell|RegionMap` (grepped, case-insensitive). `WORLD_ARCHITECTURE.md`/
`WORLD_MANIFEST_SCHEMA.md` are referenced by exactly one other doc in the whole repo
(`SESSION_NOTES.md`) — not the plan, not the contract, not the ledger.

**Current reachability — mixed, not simply "off":** `DashboardClient.tsx`'s own course-listing
section is **literally labeled "The trail map"** (line 430) but is structurally a plain `<details>`
accordion of `<Link href="/courses/...">` cards with a dotted CSS line as the only "trail" motif —
exactly the plain card list the plan wants replaced, already mislabeled as a map in its own copy.
`SiteNav.tsx`'s primary and secondary link lists (lines 17-34) contain **no** link to Trailhead,
Atlas, or Journal — unreachable by any click path from the visible UI. But `/courses/[slug]`
**does** `redirect()` to `/basecamp/[courseId]` (`page.tsx:27`) — so clicking any course card
today lands a real user on a World-layer page whether anyone intended that or not — and the
dashboard's single featured-recommendation card falls back to `href="/atlas"` in one case
(`dashboardRecommendation.ts:68`). So: Basecamp is de-facto live, Atlas is reachable in one
fallback path, Trailhead and Journal are real and tested but orphaned from navigation entirely.

**What's genuinely missing, even within the existing system:** the **mascot is completely absent**
— grepped exhaustively, every "Maggie" hit in `src/` is the brand name "Maggie's Trail," never a
character; no mascot asset/component anywhere, in the world system or outside it; `not-found.tsx`
(404) is a plain bordered card with no illustration. **Distinct age-banded art** (storybook vs.
cartographic vs. topographic) is not confirmed built — `worldTypes.ts`'s `visualMaturity` field
exists and is populated per region, but currently drives copy/grammar strings more than distinct
illustration sets. **`conceptConnections` are 0/129 courses, 0 total** — Phase D of the world
schema's own design, self-documented as intentionally deferred. The original pilot **self-flagged
two open gaps that were never closed**: *"Young learner understands? Unverified — no
child-comprehension study was performed"* and *"Teacher/parent restrained? ... Human visual review
remains outstanding"* (`GRADE_3_PATTERN_VALLEY_PILOT.md`).

---

## 3. The decision this plan can't make for you: was shelving the world layer deliberate?

Before any world-layer phase in §4 can be scoped further, someone needs to answer: was leaving
`src/world/` unlinked from primary navigation a deliberate product decision made sometime after
session 221 (in which case WS-E part 3 should investigate *why* before touching it — maybe it was
found lacking for a real reason the self-flagged gaps hint at), or was it an oversight —
`OPTIMIZATION_PLAN_V3.md` simply written without whoever drafted it knowing this system existed
(plausible, given the zero-reference finding in §2.3)? The answer changes WS-E part 3 from "extend
and integrate a mostly-finished system" to "formally deprecate it and build something else" —
two very different bodies of work. This document recommends treating extension as the working
hypothesis (§4 Phase 5) given how much is already built and tested, but flags this explicitly as a
call for whoever starts implementation to confirm first, not assume.

---

## 4. Phased implementation plan

**Phase 1 — Design the real prediction-gate evidence rubric (§2.1).** Turn the plan's five
categories (counterintuitive consequence / common misconception / invariant / estimate / causal
contrast) into an actual per-gate adjudication process — this is closer to the batch-adjudication
pattern this project already uses for content rulings (see §5's governance note) than to
re-running a script. Greenfield; nothing to extend.

**Phase 2 — Re-adjudicate the 1,362 gates against the real rubric.** Expect the result to differ
from the existing CSV's 1,162/200 split — probably a steeper cut, per the plan's own "count may
drop steeply — good" framing, since the existing split was never actually measuring the plan's
bar (§2.1). Batch this the way the MCQ remediation queue is already batched elsewhere in this
project (20-50 rows at a time, human/Fable-reviewed), not as one mechanical pass.

**Phase 3 — Soften the retained-gate interaction.** `LessonPlayer.tsx`'s hard DOM-unmount-until-
commit (line 635) is today's *only* mode, applied uniformly. Needed even for gates that survive
Phase 2, since the plan's own "expected learning gain > interruption cost" framing applies to kept
gates too, not just removed ones.

**Phase 4 — Execute the purge on lesson content.** Remove/rework the `predict` blocks that don't
survive Phase 2's re-adjudication, across however many lesson files that ends up touching. **This
is authored-content structural change, not the variant-generation work `CLAUDE.md` governs** —
different rules likely apply; see §5's governance note before starting.

**Phase 5 — World layer: resolve §3, then integrate rather than rebuild (working hypothesis).**
If extension is confirmed: link Trailhead/Atlas/Journal into `SiteNav.tsx`'s primary or secondary
list; fix `DashboardClient.tsx`'s "The trail map" section to actually route into the World system
instead of being a mislabeled plain list (or relabel it honestly if integration is deferred
further); close the two self-flagged pilot gaps (a real child-comprehension check; the outstanding
teacher/parent visual review) before treating this as shippable, since they were flagged and never
resolved, not newly discovered here.

**Phase 6 — Mascot.** Net new regardless of §3's answer — appears at onboarding, hints, summits,
empty-states, and 404 per the plan. Coordinate with WS-A (brand identity) and WS-J (avatar system,
a separate workstream) so the mascot doesn't visually compete with either.

**Phase 7 — Age-banded art.** Distinct storybook/cartographic/topographic art sets keyed to the
existing `visualMaturity` field, which currently drives text more than imagery. Likely the
single biggest production-effort item in this whole document, comparable to WS-A's asset-production
risk (§ WS_A_BRAND_PLAN.md Phase 1) — flag the same "ship structure + spec + placeholders if
in-session art generation can't meet the bar" fallback.

**Phase 8 — Purpose-typed lesson taxonomy.** Design the 7 categories as an actual schema
addition (`Lesson.purpose` or similar) with structural implications per category (which `StepKind`
sequences a "fluency" lesson is allowed to use vs. a "discovery" one) — greenfield design work, no
existing scaffolding beyond the step-level `CMLStage` vocabulary noted in §2.2. Pilot on a small
sample (one course, one grade band) before any corpus-wide reclassification of 1,701 lessons.

**Phase 9 — Redefine the PGR contract metric.** Once Phase 2's real rubric exists, point
`PREMIUM_EXPERIENCE_CONTRACT.md` row 5's machine check at the re-adjudicated result, not the
original widget-type-triage CSV — closing the risk flagged in §2.1.

---

## 5. A governance note this plan should not skip

Phase 4 (executing the purge) and Phase 8 (reclassifying lessons) both modify authored lesson
content structure at potentially corpus-wide scale. This session's own established practice for
touching authored/frozen content — even a single distractor's format, even one step's closure
status — has been an explicit user ruling via structured confirmation before committing (see
`HANDOVER_COWORK_S240.md` §2.5's three widget conversions, §4's g5f-02-02/03 fix, and g5u-03-02's
closure, all confirmed this same session before landing). `CLAUDE.md`'s own non-negotiable rules
("never change authored lesson prose... a genuine content error goes in a log for a human") are
scoped explicitly to the variant-generation workstream, but the underlying caution they encode —
large-scale authored-content edits need a human decision point, not a script running unattended —
applies at least as strongly here, arguably more, since Phase 4 removes entire gate structures
rather than adding one key. Whoever implements WS-E should design Phases 2 and 4 with batch-level
checkpoints back to a human, not as a single unattended sweep across 1,362 gates.

---

## 6. Non-goals for WS-E

- WS-J's avatar system — the plan's own text scopes the world-layer avatar marker to WS-J;
  WS-E's world-layer phase (§4 Phase 5) consumes it, doesn't build it.
- A full redesign of `LessonPlayer.tsx` beyond the specific interruption-cost softening in Phase 3.
- Building `conceptConnections`/Phase-D-of-the-world-schema mapping — self-documented as
  intentionally deferred by the original world-layer design; not implicated by anything WS-E's
  plan text asks for.

---

## 7. Open questions for whoever starts implementation

1. **§3's core question** — deliberate shelving or oversight? Answer before Phase 5 scopes further.
2. **Who adjudicates Phase 1/2's rubric** — same "what does Fable-Q concretely mean in execution
   terms" question `WS_G_QA_FACTORIES_PLAN.md` §5 raises; both workstreams need the same answer.
3. **Phase 4's batch-checkpoint mechanism** — does the implementing session have access to the
   same kind of user-confirmation loop this session used (`AskUserQuestion` or equivalent), or
   does it need a different review process designed for corpus-wide scale (1,362 gates is much
   larger than the single-digit content rulings this session made)?
4. **Phase 7's art production path** — same open question as `WS_A_BRAND_PLAN.md` §6.2: can
   production-quality age-banded illustration actually be generated in whatever environment
   implements this, or does it need an external design pipeline?
