# Maggie's Trail — Competitive Review & Premium Rebuild Plan (v3)

**Prepared:** August 12, 2026 · **Supersedes:** v2 (same day)
**Inputs merged:** (1) my live hands-on review of https://maggies-trail.vercel.app/ (lessons walked K → Algebra, plus Review, Daily, Onboarding, Dashboard, landing, DOM/tech probes); (2) deep benchmark research on Brilliant (ustwo redesign, Rive case study, design-lead essays, interactives engineering specs, AI content pipeline) and DreamBox (support docs, Artefact case study, adaptive-learning patents incl. predictive lesson pre-download, educator reviews); (3) **the S218 source-tree audit review**, whose corpus-level counts and structural findings materially upgraded the plan; (4) **new in v3: the approved brand-identity concept board** (mountain/trail/summit-star mark, Deep Navy `#0D1B2A` / Warm Ivory `#F7F3EC` / Summit Orange `#F08A24`, serif wordmark) **and four avatar concept boards (16 candidate characters across visual-maturity bands), plus the brand + avatar integration specification** — treated throughout as *reference boards, not production-ready composite assets*.
**Status:** Plan only — nothing implemented.

---

## Part 0 — What changed from v1, and one correction

The S218 audit and my hands-on review agree on the diagnosis at every point where they overlap: chrome outweighs mathematics, feedback lands far from the object, richness collapses in higher grades, the landing page undersells a K–Calc product, and the fix is craft, not breadth. Where we differ, the source audit wins on internals and the hands-on wins on runtime behavior. Reconciliations:

1. **Correction to v1:** I reported "no slider or drag found anywhere." That was true of the pages I walked but wrong as a product claim — the source audit finds **84 widget functions with native range controls (100+ range elements)**. The real finding is better than either half: sliders exist *and are the problem* — they proxy objects the learner should grab directly. v1's "build drag" becomes v2's **"convert slider-as-proxy to direct manipulation."**
2. **Density reframed.** My sampled lessons (K intro material) showed empty text steps and sparse interaction; the corpus average is ~6 widgets/lesson across 15,621 steps. Both are true: raw density is high, but **62% of all widget instances are MCQ or numeric entry** (6,355 / 10,236), and early-course text steps are barren. So the metric v2 optimizes is the audit's: **meaningful mathematical state changes per learner-minute**, not widgets per lesson — while still enforcing my v1 floor (no zero-interaction concept steps rendering as an empty page).
3. **Prediction demoted from crown jewel to earned instrument.** v1 protected predict-first as a differentiator. The audit shows it has been *institutionalized*: ~79% of lessons carry a prediction gate (1,323 + 18×2), and 561 lessons share one identical 9-step template. The mechanic is still excellent — when there's something worth predicting. v2 adopts the rule: **a prediction must earn permission to exist** (`expected learning gain > interruption cost`), and the brand stops leading with it.
4. **Storytelling constrained.** v1's Maggie-character/trail-map world layer survives, but relocated: **world-building lives outside active reasoning** (dashboard map, summit, chapter seams). Inside a step, the S218 rule governs: prompt + mathematical object + one contextual action; everything else contextual, collapsible, or invisible. The audit's "stop rules" are adopted verbatim (§8.4).
5. **Consistency redefined.** The product has *schema* consistency (identical templates) but weak *experiential* consistency (125+ accumulated widget types of wildly varying quality). v2 replaces v1's "widget-coverage contract" with the audit's **single Maggie Interaction Grammar** plus a machine-checkable **Premium Experience Contract** — and keeps v1's linter/CI enforcement so it scales to 1,701 lessons.

**What v3 adds.** v2 called for a brand system and an illustration language but had nothing to anchor them to. v3 anchors both: the identity is now decided (mark, palette, typography direction), so WS-A stops being "commission a brand" and becomes "productionize this brand"; and a full **student avatar system** joins the plan as WS-J — the one personalization layer the competitors under-serve (Brilliant has no student avatars; DreamBox's 36 avatars are dated clip-art). Crucially, the avatar system obeys the same fencing rule as the world layer: identity accompanies the journey; mathematics owns the lesson. Two hard rules carry through every section that follows: **the supplied boards are concept references — no board crop ever ships as production art or as a selectable composite** — and **Summit Orange is a brand accent, never the universal interaction color.**

What v1 contributes that the S218 review lacked (all retained): runtime defects (resume-faded-stage bug; feedback-banner layout shift/CLS; XP toast/counter mismatch; system-font stack; robot `speechSynthesis` voice), the entire **sound & voice** workstream, the **service-worker precache/offline** flank (Brilliant has *no* offline mode; DreamBox patented predictive pre-download — US10347148B2), benchmark implementation intel (Rive-style celebration states, hint ladders, protected instructional audio channel, story-decoupled-from-performance rewards), and the spaced-review system (1/3/7/21) as an existing moat to protect.

---

## Part 1 — Findings (merged)

### 1.1 Strengths to protect (regression here fails QA)
Exact mathematical state engines with misconception-naming diagnosis ("That stops one finger short — touch each raised finger once as you count"); real spaced repetition (1/3/7/21, fresh numbers); K–Calculus continuity in one product (neither competitor has it — DreamBox stops at 8, Brilliant starts ~5); 129 courses / 1,701 lessons of honest scale; consistent lesson chrome skeleton; TTS on every step; dark mode; test-out; "See another form / Explain it differently"; a fast, simple Next.js 15 + localStorage foundation (TTFB ~145ms, DCL ~508ms).

### 1.2 The merged defect list

**Interaction quality.** High click density, moderate *causal manipulation* density: 62% of widget instances are MCQ/numeric; sliders proxy direct manipulation across ~84 engines (quadratic vertices, lines, vectors, angles, unit circle, transformations, Riemann sums, scatter fitting, constructions…); observed K lessons additionally contain one-sentence empty-screen text steps; Algebra's "Two-Step Equations" is a bare text input while K gets a ten-frame.

**Structural sameness.** One template dominates (561 lessons: `concept → interactive → check → concept → interactive → check → check → challenge → recap`; 224 more in a near-variant); ~79% of lessons carry a prediction gate regardless of whether anything is worth predicting.

**Fluidity & motion.** ~79 keyframes in `figures.tsx` plus a full generic animation library — but they are presentational (fade/pop/draw/pulse), not mathematical. State changes rerender instead of morphing: `3x + 6 = 15` is replaced by `3x = 9` rather than visibly cancelling. Runtime defects: resumed lessons render a faded near-blank stage until first click; feedback banners mount at viewport bottom ~500px from the widget and shift layout; celebration keyframes (`sparkFly`, `summitPathDraw`, `trailWalk`) exist unused mid-lesson; the XP toast and header counter briefly disagree.

**Stage & chrome.** Lesson stage caps at `max-w-3xl` (~768px) on 1440px displays — mathematics floats as a small diagram in a large page. Up to ~20 chrome elements can compete with it on one step (branding, course title, route dots, chapter title, step counter, XP chip, TrailWaypoint, TrailClearingLabel, prediction card + summary, process cue, mastery panel, hints, action dock, feedback banner, celebration). The app describes the journey more loudly than it presents the mathematics.

**Sound & voice.** None. Browser TTS robot voice is the only audio. (DreamBox: 4 human narrator voices, three audio channels, instructions never mutable.)

**Landing page.** System-font stack, one flat blue, generic bordered cards; the hero demo ("Build 5 equal groups" with orange-dot berries) makes a K–Calc product feel elementary; the six featured courses are all Kindergarten, visually contradicting "Kindergarten through calculus" one line above; the lead pillar markets the overused prediction mechanic; widget feedback shifts layout; no footer of substance; no motion, no imagery, no brand.

**Tech gaps.** No service worker (no offline, no precache), one prefetch link, unused View Transitions API, no per-lesson code splitting pressure yet (content compiled into bundle), math rendered as plain text (no KaTeX/MathML).

### 1.3 Merged scorecard

Two lenses, one table: *raw* rows use S218 source counts; *experiential* rows follow my hands-on review; competitor columns from published evidence. (Comparative design scores, not controlled studies.)

| Dimension | Maggie now | Brilliant | DreamBox | Target |
|---|---:|---:|---:|---:|
| Raw interaction density | 9.1 | 9.5 | 9.3 | 9.7 |
| **Meaningful interaction density** (state changes/min) | **7.8** | 9.6 | 9.3 | **9.8** |
| Direct manipulation | 7.2 | 9.7 | 9.2 | **9.8** |
| Visual fluidity (runtime, incl. defects) | 6.5 | 9.7 | 8.9 | **9.8** |
| Mathematical animation (continuity of state) | 7.4 | 9.5 | 8.9 | **9.8** |
| Tactile polish (sound, feedback locality, feel) | 6.8 | 9.7 | 9.1 | **9.8** |
| Compact interactive storytelling | 7.6 | 9.7 | 9.0 | **9.7** |
| Lesson-to-lesson experiential consistency | 7.8 | 9.5 | 9.2 | **9.7** |
| Mathematical state depth | **9.6** | 9.2 | 9.4 | **9.8** |
| Misconception diagnosis | **9.4** | 9.3 | 9.4 | **9.8** |
| Curriculum breadth | **9.7** | 8.5 | 8.3 | 9.7 |
| K–12/Calc continuity | **10** | ~8.5 | K–8 only | **10** |
| Real-time adaptation | 7.8 | ~9.3 | **9.8** | **9.5+** |
| Landing/premium perception | 3.5 | 9.5 | 6.5 | **9.8** |

**One-sentence thesis (merged):** Maggie's mathematics is more sophisticated than its interface makes it feel; the winning move is not more content or more widgets but one decisive shift — **stop presenting mathematical engines inside a lesson UI; make the mathematical engine become the lesson UI.**

---

## Part 2 — The Maggie Interaction Grammar (adopted from S218 review, now canonical)

Every premium manipulative conforms to twelve rules: **Object first** (the mathematical object dominates the viewport) · **Direct first** (manipulate the object; sliders/steppers/numeric are the *secondary* precision layer, never the primary) · **Immediate consequence** (no Apply button where avoidable) · **Continuous state** (transitions morph, never teleport) · **Local feedback** (consequences appear where the action occurred) · **Minimal controls** (reveal contextually) · **Representation sync** (graph ⇄ equation ⇄ number line update simultaneously) · **Undoability** (exploration feels safe) · **Precision fallback** (keyboard/stepper/numeric always available) · **State narration** (screen readers receive equivalent mathematical state) · **No premature reveal** (targets hidden where discovery matters) · **Meaningful completion** (the correct state feels mathematically resolved — not merely green).

This grammar, plus **Continuous Mathematical Morphing** (WS-B), replaces v1's looser "widget quality bar." One grammar produces more consistency than a hundred design tokens.

---

## Part 3 — Workstreams (v2)

### WS-A · Brand & design system — *productionize the approved identity*
The identity is decided: **mountain peaks + winding trail + summit star**, Deep Navy `#0D1B2A` / Warm Ivory `#F7F3EC` / Summit Orange `#F08A24`, high-contrast serif wordmark with restrained sans support. WS-A turns the concept board into a production system:
1. **Vector recreation, not board reuse.** Rebuild the mark cleanly as SVG — `/public/brand/maggies-mark.svg`, `-mono.svg`, `maggies-wordmark.svg`, `-mono.svg` — plus raster derivatives (favicon, Apple Touch, PWA 192/512, maskable, OG images). The concept board itself never ships. **Legibility ladder:** FABLE-Q inspects the mark at 16 / 24 / 32 / 48 / 128 / 512px; at tiny sizes the silhouette wins — simplify rather than preserve concept detail.
2. **One brand component system** — `<MaggieMark />`, `<MaggieWordmark />`, `<MaggieBrandLockup />` — replacing every hand-coded logo/favicon/header/login/email/certificate/loading variant found in audit.
3. **Token reconciliation, not global replace.** Map the palette into the existing token system: brand primary (navy), brand surface (ivory), brand accent (orange), interactive focus, selection, success/warning/error, and *math-semantic colors kept independent* so manipulative state colors never collide with brand. **Summit Orange is rationed:** selected state, summit/progress accents, the primary CTA, the logo star — overuse cheapens it. Accessible existing colors are not blindly overwritten.
4. **Typography split.** Serif display face = identity surfaces only (landing brand moments, premium marketing headings, certificates, major trail-world presentation). Clean UI sans (with a `Lexend`-class face for young readers) = lessons, controls, dashboards, math-adjacent copy. Brand sophistication never reduces legibility; the serif never enters mathematical UI. Kill the system-font stack everywhere.
5. **Discipline set (S218, kept):** ~two surface depths, two radii, one shadow vocabulary, one accent at a time, 8px grid; remove card/border/badge/gradient clutter. Ship as tokens + Tailwind preset + `/design` gallery.
**Bar:** mark legible at 16px; zero hand-rolled brand variants left; token map approved by FABLE-A; no screen confusable with default Tailwind; passes blind "$50k?" panel.

### WS-B · Continuous Mathematical Morphing (CMM) — the motion system
Replace the animation *collection* with a semantic motion *system*. Every stateful manipulative defines `previousState → transition semantics → nextState`; renderers never teleport. Core semantics (from S218, adopted verbatim): **Conservation, Cancellation, Partition, Combine, Translation, Rotation, Reflection, Scaling, Correspondence, Accumulation, Decomposition, Substitution, Equivalence.** Concretely: solving `3x + 6 = 15` shows six units leaving both pans while the symbolic equation morphs in sync; a coefficient change continuously deforms the existing parabola; a Riemann sum visibly converges. Built as **reusable primitives per semantic** (translation/scale/reflection kit, cancellation/grouping kit, graph-morph kit, correspondence-highlight kit, accumulation kit) that engine teams consume — preventing 30 slightly-different animations.
Secondary layer (from v1, kept but fenced *outside* reasoning): celebration set (summit sequence, streak flame, XP flight to counter with reconciled arithmetic), branded loader, View Transitions between steps, `prefers-reduced-motion` end-to-end. Fix the resume-faded-stage bug; CLS = 0 via reserved feedback slots.
**Bar:** ≥90% of important state transitions preserve object continuity (CMR metric); 60fps on a mid-tier Chromebook.

### WS-C · Direct-manipulation conversion — the biggest single win
Not "build more widgets": **convert the existing 125+ engines to the grammar.** Priority = the ~84 slider-proxy engines where the learner thinks "move the point" and should move the point: quadratic vertices, lines/slope, vectors, angle measures, circle & coordinate geometry, unit circle, transformations, Riemann sums, scatter fitting, derivative traces, constructions. Sliders survive only where the quantity is genuinely scalar (time, sample size, probability sweeps). Substrate built once: pointer/touch drag with snapping + forgiveness radius + inertia, ≥44px targets, arrow-key equivalence, haptics where available. Alongside: kill empty text steps (inline animated figure or merge into the adjacent interactive step); typeset math everywhere (KaTeX/MathLive; MathLive input replaces bare number boxes from ~Grade 5 up); every widget keeps/extends its misconception table — diagnosis is the moat and must scale with the conversion.
**Bar:** MDIR ≥85% (share of concept-acquisition interactions manipulating the relevant object directly, where geometrically meaningful); Algebra+ feels as tactile as K.

### WS-D · Lesson-player surgery — stage scale + chrome removal
Do this **before** mass lesson polish (S218 ordering adopted — otherwise workers polish content inside a shell that gets replaced).
1. **Stage sizing:** replace `xl/2xl/3xl` with semantic roles — Reading 600–680px · Compact manipulative 720–820px · Wide model 920–1080px · Hero lab 1100–1280px · Immersive canvas ≤~90vw. Text stays narrow; the mathematics does not.
2. **Chrome purge:** header reduced to exit + quiet progress + optional help; TrailWaypoint/TrailClearingLabel removed or made contextual; XP de-emphasized in-step; action dock shrunk; feedback docked adjacent to the object in a reserved slot.
3. Screen contract during active reasoning: **prompt + mathematical object + one contextual action.** Hint ladder (nudge → method → show me, DreamBox's graceful exit at the end). XP arithmetic unified and animated so numbers always reconcile.
**Bar:** MVA ≥60% (mathematical object's share of primary content area on visual concept steps); zero unnecessary persistent controls or pedagogical labels.

### WS-E · Storytelling, prediction reform & lesson purposes
1. **Prediction purge:** inventory all 1,341 gates (Haiku); evidence packet per gate (Sonnet); Fable adjudicates in batches. Keep only gates with a counterintuitive consequence, common misconception, invariant, estimate, or causal contrast; retained gates run `prediction → interaction → observed outcome → reconciliation`. Target PGR 100% (count may drop steeply — good).
2. **Purpose-typed lessons** replace the universal template: discovery / causal contrast / construction / worked transfer / fluency / retrieval / mastery — structure follows purpose (Fable classifies; templates diversify).
3. **World layer, fenced:** living trail map replaces the dashboard card list (age-banded art: K–2 storybook → 3–8 cartographic → HS topographic); Maggie appears at onboarding, hints, summits, empty states, 404; chapter landmark stories always advance on completion regardless of score (DreamBox decoupling). **Never inside active reasoning** (stop rule). **The learner's chosen avatar (WS-J) marks their current trail position** — a small circular portrait with a subtle navy/ivory rim and a tiny summit-orange position indicator on the current node. No animated walking character, no speech bubbles, no avatar covering landmarks: personal journey, not character game.
**Bar:** PGR 100%; no decorative world-building on reasoning steps; a 7-year-old can point at the map and say where they are.

### WS-F · Sound, voice & accessibility (kept from v1 — absent from S218 review)
SFX palette (12–18 sounds: place, snap, escalating corrects, gentle incorrect, XP tick, summit) mixed low, toggleable; neural TTS or recorded VO for K–2 instruction strings; DreamBox rule: muting sound never mutes instructions; captions synced. Accessibility: full keyboard operation of every converted widget (the grammar's precision-fallback rule doubles as the a11y path), state narration ("6 of 10 filled"), reduced-motion equivalents, AAA text contrast via tokens.
**Bar:** WCAG 2.2 AA minimum; keyboard-only completion of any lesson.

### WS-G · Consistency, QA factories & the Premium Experience Contract
1. **`PREMIUM_EXPERIENCE_CONTRACT.md`** (S218 table adopted): MVA ≥60% · direct manipulation where meaningful · continuous transitions where state changes · 0 unnecessary persistent controls/labels · 0 purpose-free predictions · immediate response · excellent at 390px · complete keyboard + reduced-motion · professional math typography · 0 label collisions · no feedback-only state change where the model can show it · no control-panel syndrome · no MCQ answer-shape leakage.
2. **Lesson linter** (v1, upgraded): machine-checks the contract's checkable rows + diagnosis-table completeness + hint ladder + TTS strings + XP arithmetic across all 1,701 lessons in CI.
3. **MCQ factory:** 2,566 MCQs sharded by band × domain, 100–200 per Sonnet batch — misconception behind every distractor, style equalized, answer-shape leakage removed, unique correctness verified; Haiku mechanical cue checks; Fable adversarial sampling. Target ACQ <1% leakage.
4. **Typography factory:** Haiku identifies math-bearing strings; Sonnet converts; shared renderer (LaTeX + MathML + a11y).
5. **Cross-lesson consistency pass:** Fable-Q scores *transitions between consecutive steps/lessons* on random per-band samples (20 K–2, 20 3–5, 20 6–8, 30 HS, 10 Calc) — hunting canvas shrinks, grammar breaks, juvenile carryover into HS, chrome regrowth. Target XLC ≥9.5.
**Bar:** linter 1,701/1,701; contract violations = 0 on shipped surfaces.

### WS-H · Landing page rebuild — six moments, K–Calc believable
S218 architecture adopted, v1 craft & perf folded in:
1. **Nav:** small Maggie mark + wordmark | Courses | For families | For educators | Sign in | Start learning. Full wordmark may appear in the footer; the hero is never a giant logo — the interactive product remains the hero art, with the brand making it feel expensive without becoming ornamental.
2. **Hero:** two-column; left = `K–CALCULUS` eyebrow, exceptional headline, ≤2-line sub, one primary + one quiet CTA; right = **one exceptional real manipulative demonstrating the actual moat: drag one object → graph, equation, and number readout all change in sync** (multi-representation function/transformation lab, understandable without advanced math). Replaces the K berry-grouping demo. No control panel, 60fps, zero layout shift. The product is the hero art.
3. **Proof strip:** one line — 129 courses · 1,701 lessons · K–Calculus · state-aware feedback (count-up on scroll).
4. **Three-second explanation:** *Move it · See it · Master it* — each panel a real mathematical state transition, not stock art. (Prediction demoted to a moment inside "See it.")
5. **Curriculum breadth rail:** `K → 2 → 5 → 8 → Algebra → Geometry → Calculus`; hover/tap swaps a single preview canvas — six grade-band destinations, **never** six Kindergarten cards.
6. **Final CTA:** "Start with any first chapter free."
Messaging shifts from interface mechanics ("slide, tap, and build") to understanding — direction: **"Math you can move. Ideas you can see."** / supporting: "A complete K–Calculus curriculum built on interactive mathematical models, exact feedback, and mastery that remembers."
**Perf & precache (whole app, from v1):** service worker precaching shell + current chapter + predicted next lesson (DreamBox's patented trick; Brilliant's open offline flank); hover/viewport route prefetch; font subsetting; LCP <1.2s, INP <100ms, CLS 0, Lighthouse ≥98; full offline lesson replay.
**Bar:** wins a blind cost-perception test against brilliant.org.

### WS-J · Student avatar & identity system (new in v3)
The one personalization layer both competitors under-serve. Design principle: the brand mark says *journey · mastery · summit*; the avatar says *this trail belongs to me*; **neither competes with the mathematics.**

**Assets.**
- The four supplied boards = an approved concept pool of **16 candidate characters**, catalogued first in `AVATAR_CONCEPT_LEDGER.md` (concept ID, source board, maturity band, distinctive non-sensitive visual traits, production status, regeneration priority). No race/ethnicity assignment; no invented names — these are selectable identities, not NPCs.
- **Non-negotiable asset rule:** every shipped avatar is an independent production asset (`/public/avatars/avatar-NNN-256.webp` + `-512.webp`, one canonical manifest). A student never selects a quadrant of a board, and no board crop is ever claimed as final art. Final portraits are individually re-rendered to `AVATAR_ART_PRODUCTION_SPEC.md`: identical framing (head-and-shoulders, consistent eye line/head scale/shoulder crop/margin), one restrained warm-neutral background, matched lighting/saturation/finish, dimensional-but-not-plasticky rendering, no embedded card chrome. **If production art cannot be generated in-environment, ship the complete architecture + spec + deterministic expected filenames + clearly-marked dev placeholders — never silently substitute board crops.**
- **Age-aware collections** preserving the boards' maturity range: `early` (K–2), `explorer` (3–5), `adventurer` (6–8), `summit` (9–12) — ~12 human portraits each, the 16 concepts as anchors, expanded to 48 so the library broadens skin tones, faces, hair textures (curls/coils/braids/locs/straight), glasses, head coverings where appropriate, and presentation *naturally* — never "one representative per ethnicity" tokenism. Plus **8–12 neutral/symbolic options** in the same art language (Maggie mark, compass, summit star, owl, fox, constellation, topographic badge…) — older students often prefer these; they must not look like emoji. HS avatars are not enlarged elementary characters; K–2 avatars are not unnaturally mature. Total 56–60.
- **Art-consistency QA:** FABLE-Q reviews the full library as a contact sheet; rejects outliers on head scale, eye line, lighting, background, saturation, sharpness, or age appearance. The criterion: *would a user assume one professional character-design team drew everything?* One weak portrait makes the picker feel generated.

**Data model & integration.**
- One manifest (`AvatarDefinition { id, src256, src512, ageBand, kind: human|symbol, order, enabled }`); no inferred race/ethnicity field, no gender field unless a real requirement exists. Profiles store **`avatarId` only** — never URLs — resolved everywhere through a small canonical service (`getAvatar`, `getAvatarSrc(id,size)`, `getAvatarsForAgeBand`, `getDefaultAvatarForGrade`, `isValidAvatarId`). Artwork stays replaceable forever.
- **Migration:** audit the current profile schema (`numera:profile:v1` in localStorage) and every component rendering identity; fallback chain `valid avatarId → retained legacy image → generated initials → default Maggie mark`. No broken accounts.
- **Picker (one component, used in onboarding and profile):** "Choose your avatar — pick one that feels right. You can change it anytime." Grade opens the right collection; **See all avatars** always available (a younger learner may pick any collection; an older one may pick a symbol). ~12 visible at a time, 2–3 columns on mobile, portraits never tiny. Selection = subtle 1.02–1.04 scale + one refined navy selection ring + small check + instant preview; keyboard accessible, SR-announced. No green fills, thick outlines, bouncing, or confetti. One choice + Continue — no save dialog.
- **Where it appears:** dashboard, account menu, trail-map position (WS-E), achievements, mastery summaries, streaks, lesson-completion, teacher/parent rosters, certificates. **Where it must not:** beside questions, hints, or manipulatives; as a talking head; behind diagrams. Acceptable in-lesson uses are rare and purposeful — completion, trail transition, major milestone.
- **Identity without labeling:** the UI never names ethnicity categories; accessibility labels are `Avatar 17` / `Avatar 17 selected` or concise non-sensitive descriptors ("Avatar with braids and green top") — never inferred identity.
- **Performance:** WebP/AVIF, 256 grid + 512 profile sizes, lazy loading, preload only the first visible 8–12 of the grade collection, idle-precache the rest of that collection, other collections load on *See all* — folded into WS-H's service worker. Never ship sixty 512px portraits at onboarding.
- **Future customization fenced:** the data model leaves room for restrained overlays later (glasses, badge, limited color variants) but no Sims-style builder — the authored illustration quality *is* the value.
**Bar:** every avatar an independent asset; profile stores only `avatarId`; one picker component; propagation verified across all surfaces; active lessons remain avatar-light; art passes the contact-sheet test; keyboard/SR path complete; image loading measured (LCP/interaction latency unharmed).

### WS-I · State-aware adaptation (new in v2 — the DreamBox-beating endgame)
Maggie already has exact state, process events, misconception classifiers, mastery, variants, remedials — connect them: `learner action → process state → misconception hypothesis → local intervention → next representation → re-check → mastery update`. Because the engines expose exact algebraic/geometric state (not just response history), the loop can be **more interpretable than DreamBox's** — interventions are explainable ("you're treating 4x+8 as 12x — here's the balance regrouped"). Runs last; consumes the converted widgets and diagnosis tables.
**Bar:** adaptation decisions carry a human-readable rationale; review queue and daily challenge feed from the same loop.

---

## Part 4 — Cowork execution plan (max parallelism, precaching, batch processing)

### 4.1 Model roles (merged; two-Fable topology adopted)

| Lane | Model | Mandate |
|---|---|---|
| **FABLE-A — Architect** | Fable 5 (max thinking) | Interaction grammar, CMM semantics, visual standards, pedagogy & prediction adjudication, engine priorities, lesson-story architecture. Never bulk code. |
| **FABLE-Q — Independent assessor** | Fable 5 (max thinking) | Adversarial certification from **pixels, not JSX** — prompt: *"Assume the implementor claims this beats Brilliant. Find evidence it does not."* Never reads the implementor's self-evaluation first. Empowered to reject entire implementations. |
| **Orchestrator** | Opus 5 (max) | Work graph, task packets, worktree allocation, file ownership, merge train, dependency ordering, failure routing, release ledger. Does not rewrite 500 MCQs. |
| **Implementation fleet** | Sonnet 5 (max) | Engines, CMM primitives, shell surgery, landing, conversions, tests. One worker = one packet = one worktree. |
| **Mechanical fleet** | Haiku | Inventories, classification, fixture generation, screenshot bookkeeping, lint repairs, metadata, cue checks. Never pedagogy decisions. |

**Allocation at 16 concurrent workers:** 1 FABLE-A · 1 FABLE-Q · 1 Opus · 9 Sonnet · 4 Haiku. If the cap is higher, scale Sonnet/Haiku only (reserve 3 frontier control workers; ~70% of the remainder Sonnet, ~30% Haiku).

### 4.2 Precache before any fan-out (S218 mechanics adopted, v1 context-pack folded in)
Opus builds a read-only canonical cache at `/.cowork-cache/` before implementation: `repo-map.json`, `file-hashes.json`, `import-graph.json`, `lesson-index.json`, `widget-usage.json`, `figure-usage.json`, `prediction-index.json`, `mcq-index.json`, `range-control-index.json`, `engine-capabilities.json`, `stage-role-index.json`, `process-event-index.json`, `visual-route-manifest.json`, `baseline-metrics.json`, `test-map.json`, `hot-file-map.json`, `competitor-contract.md`, `premium-experience-contract.md`, plus — for the brand/avatar track — `avatar-current-usage.json`, `profile-schema.json`, `onboarding-flow.json`, `brand-asset-usage.json`, `avatar-render-sites.json`, plus this document. Every worker receives the cache; **no worker re-scans 1,701 lessons, re-researches Brilliant, or recomputes widget usage.** Rule of the whole program: *read once, plan once (Fable), shard once (Opus), implement massively in parallel (Sonnet), verify mechanically in bulk (Haiku), integrate serially (Opus), certify adversarially (Fable-Q).*

**Visual baselines precached too:** before any modification, screenshot the representative matrix — widths 390/768/1440 × light/dark × 8 grade bands × states (initial, mid-manipulation, wrong, correct, revealed) → `/.cowork-cache/screenshots/before/`; afters mirrored. Fable-Q certifies from these pixels.

### 4.3 Collision avoidance & task packets
Hot files (`widgets.tsx`, `figures.tsx`, `LessonPlayer.tsx`, `globals.css`, schema files) would deadlock nine parallel writers. Adopt **extract-on-touch**: an engine entering rebuild is first moved to `src/components/widgets/<engine>.tsx` with behavior-preserving tests (don't modularize all 127 up front). Opus issues **immutable task packets** (`brief.md`, `affected-lessons.json`, `source-files.txt`, `baseline-screenshots/`, `target-contract.md`, `tests.txt`, `allowed-files.txt`) — each worker sees only what it needs. **Merge train:** worker branch → targeted tests → screenshot diff → merge candidate → integration tests → Fable review where flagged → integration branch; no direct pushes to main; same-file tasks serialized. **Differential QA:** workers run only affected tests/screenshots; Opus runs integration per batch; full suite per wave and before sealing.

### 4.4 Waves (S218 execution order adopted — shell before content, primitives before conversions)

| Wave | Content | Fleet shape |
|---|---|---|
| **0 — Baseline & contracts** | Precache build; audits (player, landing, direct-manip, motion, scale, consistency); Haiku inventories (predictions, MCQs, sliders, figures); FABLE-A writes grammar + CMM spec + contracts; FABLE-Q independent defect taxonomy. Deliverables: `PREMIUM_BASELINE.md`, `PREMIUM_EXPERIENCE_CONTRACT.md`, `PRIORITY_MATRIX.csv`. No product changes. | 10–14 ∥ |
| **1 — Lesson-player surgery** | Six Sonnet lanes on separate components: minimal chrome · waypoint removal · label removal · action dock · feedback locality · semantic stage roles. Screenshot review gate before merge. | 6 ∥ + QA |
| **2 — Landing rebuild** | Three Sonnet teams (page · hero manipulative · motion) once tokens stabilize; FABLE-A art-directs; FABLE-Q blind-compares against brilliant.org. | 3 ∥ + QA |
| **2B — Brand & avatar track (parallel)** | Runs beside Waves 2–4 once tokens stabilize; independent of engine hot files, so it costs the engine work nothing. Eight Sonnet lanes: **A** avatar data model + manifest · **B** onboarding picker · **C** profile picker reuse · **D** dashboard/profile propagation · **E** trail-map integration · **F** teacher/parent/roster propagation · **G** brand components + favicon/PWA derivatives · **H** image performance/precache pipeline. Haiku: asset inventory, filename/dimension validation, manifest construction, duplicate detection, WebP conversion, icon derivative generation, mechanical tests — never visual-representation judgments. FABLE-A: concept-ledger triage of the 16 candidates, age-band assignment, picker composition, where avatars must NOT appear, mark simplification per size rung. FABLE-Q adversarial pass at 390/768/1440 across K–2 / gr-5 / gr-8 / HS / neutral-icon users: hunting inconsistent artwork, childish HS presentation, tiny portraits, crowded grids, excessive orange, logo overuse, identity labeling, propagation gaps, oversized downloads, character decoration leaking into lessons. P0/P1 findings block release. Gate question: *premium identity system, or avatar feature bolted onto an ed app?* | 8 + Haiku ∥ |
| **3 — Direct-manipulation conversion** | Largest fan-out: 9 Sonnet lanes by non-overlapping engine family (lines/coords · quadratics/transforms · geometry/angles · fractions/number lines · algebra tiles/balance · stats/scatter · trig/unit circle/vectors · calculus family · elementary builders); Haiku generates fixtures, a11y checks, screenshot routes in parallel. | 9 + 4 ∥ |
| **4 — CMM primitives → engine adoption** | 5 lanes by *motion semantic* (translation/scale/reflection · cancellation/grouping · graph morphing · correspondence · accumulation/convergence) build primitives; engine lanes then consume them. | 5 → 9 ∥ |
| **5 — Storytelling & prediction purge** | FABLE-A leads; lessons classified by purpose; Haiku lists all gates → Sonnet evidence packets → Fable batch adjudication → Sonnet rewrites; world layer (map, Maggie, summits) built at the seams. | mixed |
| **6 — MCQ & typography factories** | Pipeline: 2,566 MCQs + math strings sharded by band×domain; Sonnet batches of 100–200; Haiku cue checks; Fable samples. Pure batch processing — no barriers. | pipeline |
| **7 — Visual maturity by band** | 5 teams (K–2 warm · 3–5 bright · 6–8 technical · HS editorial · Calc minimal); every figure classified KEEP / SCALE / REDRAW / INTERACTIVIZE / REMOVE — no redrawing for novelty. | 5 ∥ |
| **8 — Consistency pass** | FABLE-Q scores consecutive-step transitions on random band samples (XLC); high-frequency inconsistencies become systemic fixes, not per-lesson patches. | QA-led |
| **9 — Adaptation loop (WS-I)** | Wire state → hypothesis → intervention → re-check → mastery; explainable rationale required. | 4–6 ∥ |
| **10 — Red team & ship gate** | Perf/a11y/device matrix + **three independent Fable 5 max critics** scoring the build against Part 1's scorecard, each prompted to refute; ship requires unanimous ≥ target; failures route back with packets. | ∥ adversarial |

Do not reverse Waves 1–2 and 5–9: polishing content inside a shell that later changes is the expensive failure mode.

### 4.5 Stop rules (adopted verbatim — they gate every worker)
Don't optimize a lesson because its count is low · don't add a prediction because one is missing · don't animate because a screen is static · don't redraw a clear figure · don't replace retrieval with manipulation · no decorative world-building inside active reasoning · don't sterilize K–2 for consistency · don't infantilize calculus for brand · don't accept a slider because it works · don't accept a gesture that breaks keyboard access · don't ship without pixel-level QA.

---

## Part 5 — Success metrics (merged)

**Experience metrics (S218, adopted):** MDIR ≥85% (meaningful direct interaction rate, where appropriate) · MVA ≥60% (mathematical viewport allocation on visual concept steps) · PGR = 100% (every surviving prediction gate independently judged necessary) · CMR ≥90% (state transitions preserving object continuity where motion communicates mathematics) · ACQ <1% (MCQ answer-cue leakage) · XLC ≥9.5 (cross-lesson consistency on random consecutive samples).

**Runtime metrics (v1, kept):** LCP <1.2s · INP <100ms · CLS = 0 in the lesson player · 60fps motion on mid-tier Chromebook · Lighthouse ≥98 · full offline lesson replay · resume renders instantly (bug fixed) · XP arithmetic reconciles on screen.

**Integrity metrics (both):** linter passes 1,701/1,701 · WCAG 2.2 AA · zero regressions on the protected strengths (diagnosis quality, spaced review, K–Calc continuity) — guarded by golden-lesson tests.

**Brand & avatar criteria (v3):** every avatar an independent asset with no user-selectable composite boards · profile stores only canonical `avatarId` · one reusable picker; grade-appropriate default + See All · neutral options present (or architecture ready) · avatar changeable later and propagating to dashboard/trail/rosters/certificates · active lessons avatar-light · brand mark production vector, legible at 16px, powering favicon/PWA/OG · palette integrated through tokens with Summit Orange rationed · zero race/ethnicity labels anywhere in UI or a11y strings · contact-sheet art consistency approved · avatar image loading measured and controlled. **Deliverables:** `AVATAR_CONCEPT_LEDGER.md`, `AVATAR_ART_PRODUCTION_SPEC.md`, `AVATAR_INTEGRATION_BASELINE.md`, `AVATAR_MANIFEST_AUDIT.md`, `BRAND_INTEGRATION_SPEC.md`, `AVATAR_ACCESSIBILITY_QA.md`, `AVATAR_VISUAL_QA.md`, `AVATAR_INTEGRATION_EXECUTION_REPORT.md` — plus implementation, tests, manifest, vector brand assets, icon derivatives; and if production portrait art cannot be generated in-environment, an explicit list of missing assets with exact filenames/specs rather than silent substitutes.

**Ship definition:** three independent Fable-5 max critics, adversarially prompted, unanimously score every Part-1 target row as met, from pixels.

---

*Benchmark sources: brilliant.org product/positioning & help center; blog.brilliant.org ("Hand-crafted, machine-made"; "When almost right is catastrophically wrong — evals for AI learning games"); ustwo × Brilliant case study; Rive × Brilliant case study; Peter Cho (Brilliant design lead) essays; Brilliant Interactives engineering job specs; DreamBox/Discovery Education product pages & support docs; Artefact DreamBox case study; DreamBox patents US10347148B2 / US11462119B2; Common Sense Education reviews; S218 source-tree audit (corpus counts: 1,701 lessons / 15,621 steps / 10,236 widgets / 62% MCQ+numeric / 1,341 prediction gates / 84 slider engines / stage caps / chrome inventory).*
