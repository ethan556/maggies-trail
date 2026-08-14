# WS-B — Continuous Mathematical Morphing (CMM): Scoping Plan

Drafted 2026-08-14, Cowork session following S240. **Status: SCOPING ONLY — no code or content
changes in this pass. Every decision point below is OPEN; nothing here is pre-decided.**
`OPTIMIZATION_PLAN_V3.md` §WS-B (lines ~90-93) remains canonical. Companion scoping docs:
`WS_A_BRAND_PLAN.md`, `WS_H_LANDING_PLAN.md`, `WS_G_QA_FACTORIES_PLAN.md`,
`WS_E_PREDICTION_PURGE_PLAN.md`, and `WS_F_SOUND_VOICE_PLAN.md` (written alongside this one).
Queue context: `HANDOVER_COWORK_S240.md` §3 lists WS-F explicitly as "untouched, no plan doc yet";
WS-B is not on §3's open list at all — it is doubly unowned (no plan doc AND absent from the
queue), which is itself a finding: nobody has claimed this workstream since Plan v3 was written.

**The headline finding of this pass, and a direct rhyme with `WS_E_PREDICTION_PURGE_PLAN.md`'s
world-layer discovery: a substantial, frozen, tested semantic motion system — MMIP v1
("Multi-Modal Interaction Protocol"), `src/lib/mmip/`, 26 files, `docs/MMIP_V1_API.md`, built
S208–S215 — already implements the core of what WS-B asks for, and `OPTIMIZATION_PLAN_V3.md`
never mentions it (zero references to `MMIP`, `equationMorph`, `widgetMorph`, `repSyncGraph`,
or "Multi-Modal Interaction" — confirmed by direct grep, 0 hits).** WS-B's text ("every stateful
manipulative defines `previousState → transition semantics → nextState`; renderers never
teleport; built as reusable primitives per semantic") describes, almost clause for clause, the
architecture MMIP already has. WS-B should not be scoped as a greenfield motion-system build; it
is an **extend-vocabulary-and-widen-adoption** problem — currently ~7 adopting engines out of 129
registered — unless someone explicitly rules otherwise (§3).

---

## 1. The bar — restated from `OPTIMIZATION_PLAN_V3.md`

Replace the animation *collection* with a semantic motion *system*. Every stateful manipulative
defines `previousState → transition semantics → nextState`; renderers never teleport. Thirteen
core semantics, adopted verbatim from the S218 review: **Conservation, Cancellation, Partition,
Combine, Translation, Rotation, Reflection, Scaling, Correspondence, Accumulation, Decomposition,
Substitution, Equivalence.** Concrete exemplars: solving `3x + 6 = 15` shows six units leaving
both pans while the symbolic equation morphs in sync; a coefficient change continuously deforms
the existing parabola; a Riemann sum visibly converges. Built as **reusable primitives per
semantic** (translation/scale/reflection kit, cancellation/grouping kit, graph-morph kit,
correspondence-highlight kit, accumulation kit) consumed by engine teams — preventing 30
slightly-different animations. Secondary layer, fenced *outside* reasoning: celebration set
(summit sequence, streak flame, XP flight with reconciled arithmetic), branded loader, View
Transitions between steps, `prefers-reduced-motion` end-to-end. Fix the resume-faded-stage bug;
CLS = 0 via reserved feedback slots. **Bar:** ≥90% of important state transitions preserve object
continuity (CMR metric); 60fps on a mid-tier Chromebook.

---

## 2. Current state — what actually exists in the repo

### 2.1 The primary layer is substantially built and the plan doesn't know it

**MMIP v1** (`src/lib/mmip/`, 26 files; spec `docs/MMIP_V1_API.md`, "FROZEN at Session 208,
additive change only"; design records `docs/RSG_DESIGN.md`, `docs/RSG_DECISIONS.md`):

- **`mmipTypes.ts`** — one canonical mathematical state per engine; every on-screen
  representation is a pure derivation (`RepresentationBinding.derive(state)`); every mutation is
  an edit-origin transaction (`apply(state, edit, origin, source)` → `SyncTransaction` recording
  the *named mathematical operations* that took `before` to `after`). This is exactly WS-B's
  "previousState → transition semantics → nextState" contract, already enforced in the type
  system.
- **`equationMorph.ts`** — a pure, deterministic motion-planning layer: compiles a
  `SyncTransaction` into a `MorphPlan` of phases. Nine operation kinds each carry a named motion
  semantic: add→join, subtract→leave, cancel→collapse, divide→partition, distribute→branch,
  factor→gather, negate→reflect, reorient→pivot, restore→rewind. Explicit "NO STRING CROSSFADES"
  rule — "a fade between two strings explains nothing" — the same principle as WS-B's
  "renderers never teleport."
- **`widgetMorph.ts`** — the shared widget half (one keyframe set per motion verb, Web
  Animations API, `data-morph-actor` targeting, one ratio→ms base per engine,
  `prefers-reduced-motion` read at edit time with the reduced plan's *words* handed to the
  caller's live region). Extracted precisely because "three copies is where a fourth engine
  starts inventing a fourth dialect" — the same anti-proliferation motive as WS-B's "reusable
  primitives per semantic."
- **`repSyncGraph.ts`** — representation-synchronization (graph ⇄ equation ⇄ table), i.e. a
  working instance of the grammar's Representation-sync rule and a partial implementation of the
  plan's *Correspondence* semantic.
- **`mmipHarness.ts` / per-engine harness tests** — invariant harnesses including
  `reducedMotionCheck` ("the move is legible with every animation switched off") — a natural
  home for a future CMR measurement (none exists today, see §2.3).

**Adoption is the gap, not architecture.** Direct grep of `useMorphStage`/`equationMorphPlan`
call sites finds ~7 adopting engines: solveBalance, algebraTiles, slopeTriangle, linePair,
lineFamily (`widgets.tsx` lines ~5852/7619/10205-10334/13296/14163), numberLineRay
(`src/components/widgets/numberLineRay.tsx` — already extracted per the extract-on-touch rule),
and the systemsPair adapter (`src/lib/mmip/systemsPairAdapter.ts`). That is ~7 of the **129
registered engines** (`engine-registration-contract.mjs`, 129/129 per `HANDOVER_COWORK_S240.md`
§2). All current adopters are algebraic/linear; no geometry, trig, stats, or calculus engine
morphs today.

**Semantics coverage against the plan's list of 13:** MMIP's nine operation kinds cover the
algebraic half well — Cancellation (cancel), Partition (divide), Combine (add/factor),
Decomposition (distribute), Substitution/Equivalence approximately (via transaction phases),
Conservation implicitly (the single-canonical-state invariant *is* conservation). **Not built:
Translation, Rotation, Reflection (geometric — MMIP's `negate→reflect` is a sign flip, not a
rigid motion), Scaling, Accumulation** (Riemann convergence, accumulation functions), and
Correspondence only partially (repSyncGraph syncs representations but there is no
correspondence-*highlight* kit). The plan's marquee exemplars split accordingly: "3x+6=15 with
six units leaving both pans in sync" **exists today** (solveBalance is MMIP's first adopter,
proven in `widgets.mmip.o1.s208.test.tsx`); "coefficient change continuously deforms the
parabola" and "a Riemann sum visibly converges" **do not** (quadraticExplore, accumulateArea,
sliceSum are not adopters).

### 2.2 The shared motion substrate and the secondary layer

- **`src/lib/motion.ts`** — a central timing/easing vocabulary (`MOTION.settleMs/snapMs/ease`),
  `gatedKeyframes()` (reduced-motion-gated scoped keyframes), `prefersReducedMotion()` honoring
  **both** the OS setting and an in-app toggle (`ProfileClient.tsx:429-436` writes
  `profile.reduceMotion` → root `data-reduce-motion` attribute), and `useCountUp` for XP/total
  reveals. Deliberately no animation library.
- **`globals.css`** — the celebration keyframes Plan v1 called out (`trailWalk`,
  `summitPathDraw`, `sparkFly`, plus `statusPop`, `summitIn`, `trailWalkedShine`) all exist and
  are **referenced from live components** (`LessonPlayer.tsx`, `playerChrome.tsx`,
  `DashboardClient.tsx`, `ui.tsx` all use spark/summit classes) — Plan v1's claim that they
  "exist unused mid-lesson" appears stale and must be re-verified from pixels, not inherited
  (same discipline as S240 §4's grade-vocabulary re-audit lesson: don't restate a carried-forward
  claim without re-checking).
- **View Transitions API: genuinely unused** — zero `startViewTransition` hits anywhere in
  `src/`. This plan item is real.
- **Reduced-motion is already end-to-end in the built parts:** ~15 `prefers-reduced-motion`
  gates in `globals.css`, `motion-reduce:` variants, widgetMorph's reduced plans narrating to
  live regions, and `mmipHarness.reducedMotionCheck` asserting legibility with motion off.

### 2.3 What is verifiably missing or unverified

1. **No CMR metric or harness exists.** The plan's headline bar (≥90% of important state
   transitions preserve object continuity) has no measurement anywhere — no inventory even
   classifies which of the 129 engines' state changes teleport (rerender) versus morph.
2. **No 60fps/perf harness for in-lesson motion.** `e2e/world-performance.spec.ts` exists as a
   precedent for perf assertions, but nothing measures widget-motion frame budgets, and no
   "mid-tier Chromebook" reference device is defined anywhere.
3. **Runtime defects named by the plan — status unverified, not confirmed-open:** the
   resume-faded-stage bug (LessonPlayer has a `resumedAt` banner, lines ~562-568, but whether
   the faded-stage repro still exists post-S237 rebuilds is unknown); the feedback-banner
   CLS/reserved-slot item (overlaps WS-D's feedback-locality mandate — boundary question, §7);
   the XP toast/counter mismatch (`useCountUp` exists; whether the reconciliation defect
   persists is unknown). Each needs a fresh repro attempt before any fix is scoped.
4. **The frozen-contract tension.** `docs/MMIP_V1_API.md` is explicitly frozen additive-only.
   The plan's 13 CMM semantics are a *different vocabulary* than MMIP's 9 operation kinds.
   Extending `MmipOperationKind` with geometric/analytic members is the additive path the freeze
   anticipates ("new members of `MmipOperationKind`" is listed as allowed) — but adopting the
   plan's CMM names wholesale would be a breaking rename. This is a naming-authority decision,
   not an engineering one (§3).

---

## 3. The decisions this plan can't make for you

1. **Extend MMIP, or build CMM beside/atop it?** (OPEN — working hypothesis: extend.) The same
   deliberate-shelving-or-oversight question WS-E asked about the world layer applies here in
   milder form: Plan v3 was written against S237+ state, MMIP landed S208–S215, and the plan
   references none of it. Everything found in §2.1 argues extension; but only a human ruling
   makes "MMIP is the CMM implementation vehicle" official, because it implicitly retires the
   plan's own vocabulary as the API surface.
2. **Vocabulary reconciliation.** (OPEN.) Do the 13 plan semantics become new
   `MmipOperationKind` members (additive, freeze-compatible), a documented mapping table
   (plan-name ↔ MMIP-name, no code change), or a v2 version bump? Whoever owns
   `docs/MMIP_V1_API.md`'s freeze must rule.
3. **Adoption ordering vs. WS-C.** (OPEN.) WS-C (direct-manipulation conversion, its own
   workstream, no plan doc yet either) touches the same ~84 slider-proxy engines. Converting an
   engine and then separately morph-adopting it means opening the same hot-file region twice.
   Plan v3 Wave 4's own ordering ("CMM primitives → engine adoption", after Wave 3 conversion)
   suggests primitives can be built now and adoption should ride WS-C's conversion order — but
   that sequencing choice belongs to whoever orchestrates the next implementation wave.

---

## 4. Phased implementation plan (proposal — every phase gated on §3's rulings)

**Phase 0 — Verify, don't inherit.** Fresh repro attempts for the three v1 runtime-defect claims
(§2.3 item 3) from a real browser (use the local-Playwright method `HANDOVER_COWORK_S240.md` §5
documents; Claude-in-Chrome is a confirmed dead end); re-check the "celebration keyframes unused
mid-lesson" claim from pixels. Output: a short evidence note per claim — CONFIRMED-OPEN /
ALREADY-FIXED / STALE. No fixes yet.

**Phase 1 — Vocabulary reconciliation design doc.** Resolve §3 items 1-2 into a one-page
decision record: the 13 CMM semantics mapped onto existing MMIP kinds, new additive kinds
proposed (candidates: `translate`, `rotate`, `scale`, `correspond`, `accumulate`), and which
plan exemplar each maps to. Requires the §3 ruling; nothing merges without it.

**Phase 2 — CMR baseline inventory.** Machine-assisted classification of all 129 registered
engines: does each meaningful state change morph (MMIP or hand-rolled continuous motion) or
teleport (rerender)? Extends the existing precache-index pattern (`engine-capabilities.json`
already carries per-engine capability axes — see `docs/CAPABILITY_AXES.md`). Output:
`CMM_BASELINE.csv` + the first honest CMR number. This defines "important state transitions" —
which is itself a judgment call to surface, not bury (§7 Q3).

**Phase 3 — Missing primitive kits.** Build the geometric/analytic kits as MMIP-conformant
modules in `src/lib/mmip/`: rigid-motion kit (translate/rotate/reflect), scaling kit,
correspondence-highlight kit, accumulation/convergence kit, graph-morph kit (continuous function
deformation — the parabola exemplar). Each kit ships with a harness test in the existing
`mmipHarness` pattern, including `reducedMotionCheck`. No engine adoption yet — kits first,
exactly per Plan v3 Wave 4's "primitives before conversions" ordering.

**Phase 4 — Engine adoption waves.** Adopt engines onto the kits in an order set by §3 item 3's
ruling (working hypothesis: ride WS-C's conversion lanes; an engine being converted to direct
manipulation adopts morphing in the same extraction). Extract-on-touch applies (`widgets.tsx` is
18,765 lines; `numberLineRay.tsx` is the established extraction precedent). Per-engine evidence
discipline as with S240's hero-tier pass: before/after captures at real widths, not assumptions.

**Phase 5 — Secondary layer.** Only what Phase 0 confirms open: resume-faded-stage fix, reserved
feedback slots / CLS 0 (coordinate with WS-D — §6), XP arithmetic reconciliation, branded loader,
View Transitions between steps (confirmed unbuilt). All fenced outside active reasoning per the
stop rules.

**Phase 6 — Measurement and gates.** A CMR re-measure against Phase 2's baseline; a motion perf
harness (60fps assertion on a defined reference device — §7 Q4); wire the CMR row into
`PREMIUM_EXPERIENCE_CONTRACT.md`'s machine checks the same way WS-E Phase 9 re-points the PGR
row — and with the same warning: don't certify the bar against a metric that measures something
weaker than the plan's prose.

---

## 5. Governance notes — what needs a human ruling

- **§3's three decisions** (extend-vs-beside, vocabulary authority, WS-C sequencing) are product
  rulings, not engineering calls — the S240 handover's own top note draws exactly this line
  (autonomous evidence-driven calls vs. rulings) and this plan keeps every one of these on the
  ruling side.
- **The MMIP freeze.** Any non-additive change to `mmipTypes.ts`/`MMIP_V1_API.md` needs an
  explicit ruling; additive kind-extensions are within the freeze's own letter but should still
  be logged in `docs/RSG_DECISIONS.md`'s decision-record pattern.
- **No content changes anywhere in this workstream.** WS-B is `src/`-only. If adoption work ever
  wants a lesson JSON tweak (e.g., a start-state nudge like S240 §2.5's `vyStart` fix), that is
  content and follows the established per-item ruling pattern.
- **CI stays manual** (S240 §2.8 item 1, durable ruling — do not re-ask): Phase 6's perf/CMR
  gates join the manual gate sequence, not a new CI pipeline.
- **Reduced-motion is a hard invariant, not a polish item:** every new kit must pass
  `reducedMotionCheck` (base render == final state, words to the live region) — this is the
  existing house rule, restated so no wave relaxes it for a "cinematic" effect.

---

## 6. Non-goals for WS-B

- **WS-C's conversions themselves** — slider→drag substrate, snapping, forgiveness radius.
  WS-B's kits are consumed by conversions; they don't perform them.
- **WS-D's chrome/stage surgery** — stage sizing, chrome purge, feedback *placement*. The
  reserved-slot CLS fix sits on the boundary: this plan proposes WS-B owns the "reserve the
  slot so nothing shifts" mechanics and WS-D owns *where* the slot lives — flagged OPEN (§7 Q5),
  not assumed.
- **Sound** — motion may want audio confirmation later; that is WS-F's channel architecture.
- **Re-animating things that already communicate** — stop rule adopted verbatim: "don't animate
  because a screen is static; don't redraw a clear figure."
- **A per-lesson authored-animation system** — CMM is semantic and engine-level; nothing here
  adds animation authoring to lesson JSON.

---

## 7. Open questions for whoever starts implementation

1. **§3 item 1** — is MMIP officially the CMM vehicle? (Working hypothesis yes; needs the
   ruling before Phase 1 merges anything.)
2. **§3 item 2** — additive kinds, mapping table, or v2 bump? Who owns the freeze?
3. **What counts as an "important state transition" for CMR's ≥90%?** Phase 2 must propose an
   operational definition and get it ruled on — otherwise the metric is gameable by
   classification, the exact failure mode WS-E found in the prediction CSV (a green gate
   measuring something weaker than the bar it certifies).
4. **What is the "mid-tier Chromebook" reference device**, and how is 60fps measured in this
   sandbox (no real Chromebook available; local Playwright + CDP tracing is the plausible proxy
   — is that acceptable evidence, or does this need out-of-environment verification)?
5. **Boundary ruling with WS-D** on feedback-slot/CLS ownership (§6), ideally decided when
   WS-D gets its own scoping doc — neither workstream has one today (WS-C and WS-D remain the
   two unplanned implementation workstreams after this pass; WS-I too).
6. **Does the S240 §2.6 hero-tier follow-on list interact with adoption order?** Self-capped
   multi-rep engines (quadraticExplore, unitCircleExplore, derivativeTrace, accumulateArea…)
   are simultaneously hero-tier candidates, WS-C conversion targets, and the exact engines the
   plan's unbuilt exemplars (parabola deformation, Riemann convergence) live in — one combined
   per-engine pass or three separate ones is a real orchestration choice with hot-file cost
   either way.
