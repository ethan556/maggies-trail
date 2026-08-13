# WS-H — Landing Page Rebuild: Scoping Plan

Drafted 2026-08-13, Cowork session S240 continuation. **Status: SCOPING ONLY — no code in this
pass.** Scoping 2 of 4 in the sequence confirmed for item 3 of the user's S240 "1->2->3" order
(WS-A → **WS-H** → WS-G → WS-E). `OPTIMIZATION_PLAN_V3.md` §WS-H (lines ~124-135) remains
canonical; this document grounds it in the actual current `page.tsx`, found via read-only
research on 2026-08-13. See `WS_A_BRAND_PLAN.md` for WS-A's plan (scoping 1 of 4) — the two share
one touch point, flagged in §5.

---

## 1. The bar — restated from `OPTIMIZATION_PLAN_V3.md`

Six moments: (1) slim nav — brand mark + wordmark | Courses | For families | For educators | Sign
in | Start learning; (2) two-column hero — eyebrow/headline/CTA left, **one exceptional real
manipulative** right ("drag one object → graph, equation, and number readout all change in sync"),
replacing the K berry-grouping demo, "the product is the hero art"; (3) a one-line proof strip
(129 courses · 1,701 lessons · K–Calculus · state-aware feedback, count-up on scroll); (4) a
three-panel "Move it · See it · Master it" explainer, each panel a real mathematical state
transition, not stock art; (5) a curriculum breadth rail (K → 2 → 5 → 8 → Algebra → Geometry →
Calculus, hover/tap swaps one preview canvas, never six K cards); (6) final CTA, "Start with any
first chapter free." Plus, app-wide: service-worker precache (shell + current chapter + predicted
next lesson), hover/viewport route prefetch, font subsetting, targets LCP <1.2s / INP <100ms /
CLS 0 / Lighthouse ≥98, full offline lesson replay. **Bar:** wins a blind cost-perception test
against brilliant.org.

---

## 2. Current state — audit findings (2026-08-13)

### 2.1 `page.tsx` is not a blank slate — it's six rough precursors, not zero

`src/app/page.tsx` is 174 lines (correcting an earlier narrower read that only looked at the hero
section). `src/app/layout.tsx:16-26` has no header/nav component at all — the "no nav" gap is
real — but every other moment already has *something* on the page today, of varying fit:

| Current section | Lines | Target moment | Fit |
|---|---|---|---|
| Two-column hero + inline `<dl>` stat row | 48-84 | (2) hero + partial (3) | Layout shape (`grid md:grid-cols-[1.05fr_1fr]`) is already right; only the right column's content (§2.2) needs replacing. The stat row is proof-strip material but lives inside the hero, not as its own strip. |
| "Why it sticks" — 3 icon-badge pillars (Predict/Feedback/Review) | 86-100 | (4) Move it·See it·Master it | Same 3-up grid shape, wrong content — `AppIcon` badges, not real state-transition panels, and a different conceptual grouping (predict/feedback/review vs. move/see/master). |
| "Course showcase" — grid of `catalog.courses.slice(0,6)` | 102-135 | (5) breadth rail | Wrong mechanism: 6 individual *courses* in catalog order, not a curated 7-stop grade-*band* rail — and `.slice(0,6)` risks exactly the "six Kindergarten cards" anti-pattern the plan doc warns against, depending on catalog ordering. |
| "What you can verify" — 3-card evidence section | 137-160 | (3) proof strip | Message is close (lesson count, K–Calc span, "state-aware feedback" language, all from live `getCatalog()` data) but it's a 3-card grid, not one line, with no count-up-on-scroll. |
| Closing CTA — "Chapter 1 of every course is free" | 162-171 | (6) final CTA | Near-verbatim match to "Start with any first chapter free" already. |
| — | — | (1) nav | Genuinely absent — `layout.tsx` wraps nothing. Net-new. |

**Net for scoping:** nav (1) and the breadth rail (5) are real builds; the hero (2) is a content
swap on a layout that survives; the proof strip (3) and explainer (4) are rewrites of existing
sections with the right data already at hand, not from-zero builds; the CTA (6) essentially exists.

### 2.2 What's being replaced: `HeroWidget.tsx`

`src/components/HeroWidget.tsx` (156 lines) is a standalone, hand-rolled K-grade equal-groups
("berry") demo — `HERO_SPEC` (14-30) builds 5 groups of 4 berries via a custom
`visual:"groups"`/`groupSize`/`itemEmoji:"berry"` spec; local `useState` tracks groups/feedback;
"Add a group of 4"/"Remove row" buttons mutate state; a "Check" button calls the production
`evaluate(HERO_SPEC, groups)` from `@/lib/evaluate` (line 53); renders `<Image>` berry-token PNGs
(88-97), not SVG. It does **not** go through the shared widget catalog — it only imports
`evaluate`, bypassing `widgets.tsx`/`WidgetRenderer` entirely. Wired in at `page.tsx:7-11` (a
`next/dynamic` import with a skeleton loader) and rendered at `page.tsx:82`. Fully isolated —
referenced only by `page.tsx`, its own test file, and one contrast test — clean to remove.

### 2.3 The hero demo's replacement: two real candidates already exist, don't build from scratch

`stageWidth.ts:19-44`'s `hero` stage tier is explicitly reserved for **"multi-representation
systems (a synced graph/diagram PLUS a separate live symbolic or numeric readout, not just one
rich diagram)"** — the near-exact definition WS-H wants, vetted this session (S240) with real
1440px pointer QA (see `HANDOVER_COWORK_S240.md` §2.6). Of the 7 widgets that cleared that bar,
two are drag-a-point function/line explorers suited to a marketing audience (the rest — probability
labs, calculus rule labs, a contingency table — need more setup context than a landing page gives):

- **`CovariationScrubberW`** — `widgets.tsx:17899-17906`, schema `schema.ts:4463-4479`. Schema's
  own docstring: *"one input controls context, table, graph, equation, and unit rate."* **One**
  draggable point on a line (`widgets.tsx:17901-17903`: *"the POINT ON THE LINE is the learner's
  object"*) drives, in sync: a plain-language context sentence, an input/output table, the graph
  point, and three numeric readouts (`equation` `y=ax+b`, `unit rate`, `current pair (x,y)`). This
  is a literal match for "drag **one** object → graph, equation, and number readout." Used today in
  middle-school rate/proportional-relationship lessons (`rr-02-02`, `pr-02-02`, `fg-03-01`) —
  plausibly approachable cold, without prior instruction.
- **`LineExploreW`** — `widgets.tsx:14066-14369`, schema `schema.ts:782-800`. Docstring: *"a graph
  line, a rise/run triangle, and the y = mx + b equation all update together."* Visually more
  dramatic (the whole line reshapes, plus a labeled rise/run triangle) but has **two**
  independently-draggable handles (intercept point, slope point; `14197-14212`/`14279-14304`) both
  feeding one canonical model so the equation readout (`14306-14352`) never drifts. Used in
  `lf-02-01`, `lf-03-01`, `lf-04-01/02/03`, `fg-02-03`.

**Trade-off to resolve before Phase 2 (§4):** the plan text says "drag *one* object" —
`CovariationScrubberW` matches that literally; `LineExploreW` is arguably the more dramatic visual
but needs two handles to fully manipulate. Recommendation: **`CovariationScrubberW`**, on fidelity
to the spec's own wording, with `LineExploreW` as the fallback if a visual-impact review during
implementation prefers the bigger line-reshape motion.

**Both can run standalone, outside the full LessonPlayer — proven, not hypothetical:**
`WProps<S>` (`widgets.tsx:305-327`) explicitly documents non-lesson callers: `onEvent` is optional
because *"surfaces that don't adapt (gallery, hero) simply omit it"* (314-316); `seed` is optional
because widgets rendering outside a lesson *"(**the landing hero**, the /dev/widgets preview) fall
back to a hash of the option content"* (322-325) — the codebase's own types already anticipate this
exact use. `src/app/dev/widgets/page.tsx` (95 lines) is a live, working, standalone widget gallery
— `WidgetRenderer` plus a small local harness managing `value`/`evaluate()`/`canCheck()`, zero
LessonPlayer/lesson-JSON/routing dependency — a ready-made template for the embedding WS-H needs.

**One important piece of history to design around, not repeat blindly:**
`src/components/WidgetView.tsx`'s own doc comment (3-13) states that *before session S111,
`widgets.tsx` "was imported synchronously by the lesson player, the quiz shell, and the landing
hero"* — i.e., a past version of this hero DID render through the shared widget catalog, and was
deliberately pulled out, presumably for bundle-size reasons (which is also presumably why today's
`HeroWidget.tsx` is hand-rolled instead of catalog-sourced). `widgets.tsx` is now 18,779 lines
with ~129 registered widget types (`REGISTERED_WIDGETS`, `widgets.tsx:18649+`) — larger than it
was at S111. WS-H's plan to route the hero through a catalog widget again isn't repeating that
mistake **only if** it ships the chosen widget as its own extracted module with its own dynamic
import, not a bulk `WidgetRenderer` import — see Phase 2.

### 2.4 Performance/precache infrastructure — from scratch, across the board

- **Service worker:** none (no `sw.js`, no `workbox`, no `next-pwa`, no `navigator.serviceWorker`
  reference anywhere).
- **Web app manifest:** exists (`public/manifest.webmanifest`, wired at `layout.tsx:6`,
  `start_url:"/dashboard"`, `display:"standalone"`) — installability metadata only, one icon, no
  192/512 PNGs, no offline/caching behavior. (Same file WS-A's Phase 2 touches for icon content —
  coordinate, don't collide.)
  no CI Lighthouse/perf-budget check anywhere (no CI workflows exist in this repo at all).
- **Route prefetch:** no custom hover/viewport prefetch anywhere (`grep -rniE "prefetch" src/` is
  empty) — everything relies on Next's default `<Link>` prefetch.
- **Font loading:** no pipeline at all — this item is entangled with WS-A's Phase 4 typography
  split (§5), since "font subsetting" presupposes the brand typefaces WS-A's plan defines.
- **Lighthouse/perf-budget CI:** none found; no CI workflow files exist in this repo at all.

### 2.5 Curriculum breadth rail — the interaction model is genuinely net-new

`(shell)/courses/page.tsx` → `CatalogClient.tsx` (216 lines, **inside** the authenticated shell,
not public) renders one always-expanded section per distinct numeric grade level with a full card
grid underneath — a comprehensive scroll list, not a compact hover/tap band-selector swapping one
preview canvas. **That interaction model doesn't exist anywhere in the codebase today.** What is
reusable: the data layer (`getCatalog()`/`getUpcoming()`, already returns slug/gradeLevel/
title/tagline/lessonCount/chapters — no new plumbing needed) and `gradeBandLabel()`
(`src/lib/copy.ts:31-41`, a clean grade→label mapper, though it covers all ~14 discrete grades and
the rail needs its own curated 7-stop subset on top of it). `widgetSamples.ts` (2,442 lines, 161
sample specs K–Calculus) is a plausible source for "one preview widget per band" content, though
nothing in it is pre-organized by band today.

### 2.6 The public marketing nav has no precedent to reuse wholesale

`SiteNav.tsx` (324 lines) is the **authenticated in-app shell nav** (Home/Learn/Review/Daily +
account menu), wired only into `(shell)/layout.tsx` — never the public landing page — and its
link set (Notebook/Profile/Family/Teach/Admin/Standards/Account/Premium) doesn't match WS-H's
public nav (Courses/For families/For educators/Sign in/Start learning). Not reusable wholesale,
but it does contain a small brand-mark SVG subcomponent and a sticky/backdrop-blur header
treatment worth using as visual precedent (coordinate with WS-A Phase 2, which replaces that same
inline mark). `(shell)/family/page.tsx` and `(shell)/teach/page.tsx` already exist as real
destinations "For families"/"For educators" could link to — whether they're appropriate for a
logged-out visitor to land on directly is unverified and worth checking before wiring the nav.

---

## 3. Phased implementation plan

**Phase 1 — Nav (Moment 1).** Net new: slim public nav, brand mark + wordmark (sourced from
WS-A's Phase 2 components once they exist — see §5), Courses/For families/For educators/Sign
in/Start learning. Verify the family/teach destination pages are visitor-appropriate before
linking, per §2.6.

**Phase 2 — Hero (Moment 2).** Remove `HeroWidget.tsx` and its `page.tsx:7-11,82` wiring. Extract
the chosen widget (recommend `CovariationScrubberW`, §2.3) into its own module — following the
`numberLineRay.tsx` precedent (pulled out of the `widgets.tsx` monolith into its own file) — and
load it via a dedicated `next/dynamic` import, the same pattern `HeroWidget.tsx` already used, so
the hero doesn't pull in the full ~129-widget catalog against the LCP <1.2s budget. Build a small
standalone harness around it (the `dev/widgets/page.tsx` gallery, §2.3, is a ready template) rather
than mounting the full `LessonPlayer`. Keep the existing two-column grid layout (`page.tsx:48`) —
it doesn't need to change, only its right-column content.

**Phase 3 — Proof strip (Moment 3).** Rewrite the existing "What you can verify" 3-card section
(`page.tsx:137-160`) into one line with count-up-on-scroll. Data is already live
(`getCatalog()`-derived), so this is a presentation change, not a data change.

**Phase 4 — Three-panel explainer (Moment 4).** Rewrite "Why it sticks" (`page.tsx:86-100`) from
icon-badge pillars into three real state-transition panels ("Move it · See it · Master it").
Needs its own small content decision: each panel should show an actual mathematical transition
(candidates: reuse a trimmed-down version of the Phase 2 hero widget's motion, or three distinct
tiny widget snapshots) — flagged as an open question in §6 rather than resolved here, since it
determines whether this phase needs new widget-embedding work or can reuse Phase 2's plumbing.

**Phase 5 — Breadth rail (Moment 5).** Genuinely net-new UI (§2.5): curate the 7-stop list (K, 2,
5, 8, Algebra, Geometry, Calculus) on top of `gradeBandLabel()`, wire to `getCatalog()` for
counts/titles, source one preview widget per band (from `widgetSamples.ts` or a fresh curated
pick), build the hover/tap single-canvas-swap interaction fresh. Retire the current "Course
showcase" grid (`page.tsx:102-135`) once this replaces it — don't run both.

**Phase 6 — Final CTA (Moment 6).** Minor copy/placement pass only; `page.tsx:162-171` already
carries the intended message.

**Phase 7 — Perf & precache (app-wide, can run in parallel with Phases 1-6 since it's
infrastructure, not landing-page markup).** Service worker (shell + current chapter + predicted
next lesson precache), hover/viewport prefetch on `Link`/`LinkButton` usage, font
subsetting (blocked on WS-A Phase 4 defining the actual typefaces — see §5), and standing up
*some* form of Lighthouse/perf-budget check in CI, since none exists today to hold the LCP/INP/
CLS/Lighthouse targets to over time rather than just at ship.

---

## 4. Non-goals for WS-H (out of scope, don't let this workstream absorb them)

- The brand mark/wordmark asset production itself — that's WS-A Phase 1/2; WS-H's nav (Phase 1
  here) and hero panel (`page.tsx:81`'s wrapper) *consume* those assets but don't produce them.
- Rebuilding `CatalogClient.tsx`'s in-app (authenticated) course browsing — Phase 5 here is a new,
  separate public-facing rail, not a replacement for the logged-in `/courses` page.
- Widget-catalog architecture changes beyond extracting the one chosen hero widget into its own
  module (Phase 2) — a full audit of `widgets.tsx`'s monolith size is its own concern, not WS-H's.
- Typography choices — Phase 7's font subsetting consumes whatever WS-A's Phase 4 defines; WS-H
  doesn't pick the typefaces itself.

---

## 5. Coordination points with WS-A (already scoped, see `WS_A_BRAND_PLAN.md`)

Two literal file/asset overlaps, not conflicts, but sequencing matters:

1. **`src/app/page.tsx`** — WS-A's Phase 2 gives the landing page a brand mark/nav touchpoint;
   WS-H's Phase 1 builds the actual nav that mark lives in. WS_A_BRAND_PLAN.md §6 already asks
   "implement WS-A's landing touchpoint standalone first, or hold it until WS-H's rebuild" —
   this document's answer: **hold it.** Building a nav twice (once minimally for WS-A, again fully
   for WS-H) is wasted work; WS-H Phase 1 should be the only place the public nav gets built,
   consuming WS-A's `<MaggieBrandLockup />` once it exists.
2. **`public/manifest.webmanifest`** — WS-A's Phase 2 updates its icon array; WS-H's Phase 7
   updates it (or a service-worker config alongside it) for precaching. Different fields, same
   file — fine to land independently, just don't let one PR silently revert the other's edit.

---

## 6. Open questions for whoever starts implementation

1. **Hero widget pick** — confirm `CovariationScrubberW` over `LineExploreW` (§2.3), or run a
   quick side-by-side before committing, since this is the single most visible element on the page
   ("the product is the hero art").
2. **Explainer panel content (Phase 4)** — does each of the three "Move it/See it/Master it" panels
   need its own small live widget/animation, or can they be static frames extracted from the hero
   widget's own states? Determines whether Phase 4 is a copy-and-layout change or its own
   mini-embedding effort.
3. **Breadth rail preview content (Phase 5)** — pull one existing sample per band from
   `widgetSamples.ts` as-is, or hand-curate a "best foot forward" pick per band? The former is
   faster; the latter matches the "believable K–Calc" bar more deliberately.
4. **Perf budget enforcement (Phase 7)** — is standing up CI infrastructure (there is none of any
   kind in this repo today, not just for perf) in scope for WS-H, or should the Lighthouse/budget
   check be a separate, smaller follow-up once the rebuild ships and there's a baseline to hold?
5. **"For families"/"For educators" destinations** — confirm `(shell)/family` and `(shell)/teach`
   are safe/sensible for a logged-out visitor before Phase 1 links to them, or whether they need
   their own logged-out-friendly landing variants.

---

*Next in the confirmed scoping sequence: WS-G (consistency & QA factories).*
