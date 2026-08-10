# UX & Polish — Session 101 scope statement

This session's brief included visual-polish phases. This document states
plainly what was and was not done for the learner experience, so no reader
mistakes green gates for finished design work.

## What actually changed for learners this session

Almost everything learner-visible that changed is **correctness of generated
practice**, which is UX in the sense that matters most at a math product:

- **71 prose defects fixed at the generator source** — subject/verb and
  count/noun agreement ("1 marks" → "1 mark"), coin and currency wording
  ("1 pennies", "$3.5"), unicode ellipses instead of "...", terminating
  decimals instead of float noise (0.30000000000000004), fraction printing
  instead of 0.6666666666666666 in algebra prompts, pattern prompts that
  finally read like a teacher wrote them. Every one of these was a real
  string a learner could have been served.
- **Variant pools widened across g8, algebra 1–2, geometry, precalc,
  calculus** so repeated practice draws visibly different problems (the
  ≥6-distinct-in-12 floor now holds corpus-wide, per-form and per-item).
- **14 new keyboard-parity tests** over touched widget kinds, with the
  `widgets.tsx` fixes they forced — labels, testids, focusability.
- **Structured-widget contracts hardened** (matchPairs full derangement so no
  pair is pre-matched; dragOrder/matchPairs 4-entry minimums; `;;` option and
  `||` structure parts) — these directly remove degenerate interactions.

## What was consciously deferred, and why

The session opened with 295 failing tests and gates that had not truly
executed since Session 98. The judgment call — which I would make again — was
that **typography passes, motion tuning, and density audits are worthless on
top of a red foundation**, and dishonest to demo. The deferred backlog, in
priority order, with its prepared entry points:

1. ~~**Reveal ghosts for the ten err=2 engines**~~ — **DONE in Session 102.**
   All ten (`argandExplore`, `mixedRegroup`, `columnCalc`, `evalOrder`,
   `scatterFit`, `lineRelationLab`, `conditionalTableLab`, `conicLocusLab`,
   `derivativeRuleLab`, `relatedRatesLab`) now render a dashed, aria-hidden
   ghost of the correct state on reveal, with each ghost predicate mirroring
   `evaluate.ts` exactly, and are rated err=3 in
   `scripts/engine-capabilities.json` (54 engines at err=3 after Session 102;
   61 after Session 103; 70 after Session 104; **90/90 after Session 105 —
   the programme is COMPLETE**, with the shared GhostChip keeping the grammar
   uniform across every chip-form ghost). The pattern is pinned by 40 new assertions in
   `widgets.revealGhost.s102.test.tsx`: present when wrong, absent when
   correct, reveal-phase only, aria-hidden.
2. **Token/density audit of the stage** — `globals.css` custom properties are
   consistent; the remaining work is per-widget spacing rhythm at the
   360-px class, now tractable because `playerChrome.tsx` isolates chrome
   from stage.
3. **Motion coherence** — `useCountUp` and the settle/response timing tokens
   in `lib/motion.ts` are respected by the player; several widgets still
   snap state changes that deserve the 140–220 ms settle. Reduced-motion
   behavior is already correct (base render = final state).
4. **60 fps interaction profiling** on `figures.tsx` (~26.9k lines) and
   `widgets.tsx` (~9.9k) plus route-level code-splitting; the lesson route's
   557 kB first load is acceptable but not proud.
5. **A real-device sweep** — screen reader, touch, browser zoom — which no
   container work can substitute for.

## Why the decomposition is a UX investment

The `LessonPlayer.tsx` split (1,458 → 818 + `playerStore.ts` 406 +
`playerChrome.tsx` 248) is engineering, but its purpose is experiential: the
phase machine, XP, adaptive ladder and resume logic now cannot be touched by
a restyle, and the trail chrome can be iterated without re-proving grading.
Every deferred item above got cheaper and safer the moment that boundary
existed. The 8,131-test suite and the production-build e2e run are green on
both sides of the split — the refactor cost learners nothing.

## The claim boundary

Nothing in this session measured students. "Substantially easier, smoother,
clearer" remains the goal of the deferred backlog above; what this session
delivered is the working, verified, honestly-documented foundation that such
work requires — plus the removal of every broken string, stale pool, and
degenerate interaction the gates could catch.

## Session 106 addendum — the deferred design pass, executed

**Before → after, per the original brief's Phase 2/4 checklist:**

- *Signature moment* — before: none named; ghosts popped in with zero motion.
  After: **the Trail Ghost** — one attribute-suffix rule gives all 91 ghost
  sites the same orchestrated arrival (fade-up + one 14px dash-step, dur-4 /
  ease-out, both reduced-motion gates emit nothing). The product's nameable
  interaction: on reveal, the right path rises out of your own work.
- *Hover language* — before: two systems (token channels in widgets,
  `brightness-110` filters at 21 sites incl. the shared Button). After: one —
  `primary-hover` channel for sky, per-color `/90` alpha elsewhere,
  `.pressable` press cue, e1→e2 shadow lift. Zero filter hovers remain.
- *Trail reach* — before: atmosphere/waypoints/summit confined to the player;
  dashboard and courses were generic card layouts. After: `TrailMark`
  (currentColor route glyph) rides every dashboard action card's kicker in
  its semantic tone; `TrailAtmosphere` ridgelines sit behind the dashboard
  and courses index. The world is the app's, not the player's.
- *Instant response* — `.pressable` (100ms `--dur-1` + immediate active
  transform) now guaranteed on every solid CTA the sweep touched.

Verified: 113 files / 8,316 tests, build EXIT:0 (lesson route 561 kB — the
signature rule and trail reach cost 2 kB), Playwright 3/3, content zero-drift.
Still open from the brief: axe route sweep, forced-colors pass, density-by-band
tokens, figures.tsx code-splitting, real-device 60fps profiling.

## Session 107 addendum — accessibility executed, not audited

**Before → after, per the brief's Phase-5 checklist:**

- *Automated checks on every route* — before: "source-level audit only".
  After: **e2e/a11y.spec.ts is a committed gate** — 19 learner-facing routes
  swept with axe against the production build, zero serious/critical
  asserted. Baseline failed 18/19 (color-contrast ×18 + one invalid dl);
  six iterations later, 19/19 green.
- *Color, checked for WCAG AA in real use* — before: brand hues doubled as
  text colors (white-on-tangerine 2.35:1, sky text 4.06:1, muted 4.16:1).
  After: a computed audit of every pair in both modes; four **-ink text
  channels** (`sky-ink #2069BF`, `tangerine-ink #BA4A00`, `berry-ink
  #C93248`, `leaf-ink #17633F`) solved to hold ≥4.5:1 even over the /10
  brand tints, flipping in dark mode so `text-*-ink` is safe everywhere;
  three **non-flipping CTA fill channels** (`--cta/-good/-danger`) after
  catching that flipping fills would have regressed dark-mode button labels;
  tangerine CTAs keep the brand fill with `text-night` (7.14:1); muted text
  raised to 5.24:1 and every sub-AA text alpha swept to /70.
- *Findings the tool beat the arithmetic on* — axe measured the /15
  tint blend at 4.394:1 where the white-based envelope math said 4.55; the
  tints went to /10 and the channel values deepened. The tool was right.
- *One-offs* — family's invalid `<dl>` → `<ul>`; profile's locked badges
  lost their whole-card `opacity-50` (which halved every child's contrast)
  for a surface + lock-glyph treatment; three hardcoded pills → channels.

The brand hues are untouched for fills, strokes and graphics (≥3:1 as
graphical objects); what changed is that *text is never asked to be brand
decoration*. Still open: forced-colors pass, dark-mode axe automation
(dark tokens solved arithmetically), landmark/heading moderates on
/standards, /premium, /family (tracked in KNOWN_ISSUES).
