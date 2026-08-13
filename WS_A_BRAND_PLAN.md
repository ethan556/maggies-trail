# WS-A — Brand & Design System: Scoping Plan

Drafted 2026-08-13, Cowork session S240 continuation. **Status: SCOPING ONLY — no code in this
pass.** This is scoping 1 of 4 in the sequence the user confirmed for item 3 of their S240
"1->2->3" priority order (WS-A → WS-H → WS-G → WS-E, one scoping doc at a time). It supersedes
nothing; `OPTIMIZATION_PLAN_V3.md` §WS-A (lines 81–88) remains the canonical statement of intent.
This document exists to turn that seven-sentence brief into an evidence-grounded, phased,
file-level plan, the same way `HANDOVER_COWORK_S240.md` §2.6 turned the `hero` tier's one-sentence
"evidence-driven, not by guess" rule into an actual scoped pass before any code changed.

Everything under §2 (current state) was gathered by two parallel read-only research passes over
this repo on 2026-08-13 — file paths and line numbers below are real, not illustrative. Treat this
document as the audit a future implementation session should start from, not re-derive.

---

## 1. The bar — restated verbatim from `OPTIMIZATION_PLAN_V3.md`

> Mark legible at 16px; zero hand-rolled brand variants left; token map approved by FABLE-A; no
> screen confusable with default Tailwind; passes blind "$50k?" panel.

Approved identity: **mountain peaks + winding trail + summit star**, Deep Navy `#0D1B2A` / Warm
Ivory `#F7F3EC` / Summit Orange `#F08A24`, high-contrast serif wordmark with restrained sans
support. Five deliverables per the plan doc: (1) vector mark/wordmark + raster derivatives, (2)
one shared brand component system, (3) token reconciliation (not global replace) with math-semantic
colors kept independent, (4) a typography split (serif on identity surfaces only, sans elsewhere,
never the reverse), (5) a "discipline set" (~two surface depths, two radii, one shadow vocabulary,
one accent at a time, 8px grid).

---

## 2. Current state — audit findings (2026-08-13)

### 2.1 Brand assets & render sites

`/public/brand/` already exists and is **not empty**, but nothing in it matches the approved
identity. It holds an earlier, superseded concept called **"Tally Peak"** (four tally strokes + a
fifth rising to a summit dot) plus three abandoned alternates, all on an older, close-but-different
palette (`#22314F` navy / `#FF8A3D` orange, not the now-approved `#0D1B2A` / `#F08A24`):

- `public/brand/logo-tally-peak.svg` — the primary Tally Peak mark. **Live in code** (two places,
  below).
- `public/brand/logo-tally-peak-mono.svg` — `currentColor` variant. **Orphaned**, referenced nowhere
  in `src/`.
- `public/brand/lockup-horizontal.svg` — a wordmark lockup set in a **rounded sans**
  (`ui-rounded, 'SF Pro Rounded', 'Nunito', 'Quicksand'`), not the approved serif. **Orphaned.**
- `public/brand/candidate-switchback-m.svg` — alt concept, an "M" as a mountain switchback (its own
  SVG comment says "Candidate B"). **Orphaned.**
- `public/brand/candidate-trail-badge.svg` — alt concept, navy badge with three rising dots
  ("Candidate C"). **Orphaned.**

Separately, `public/icon.svg` is a **third, visually unrelated** mark (abstract rounded-square
badge, `#FAFBF5`/`#2E7CD6`/`#FF8A3D`/`#22314F`) and is the sole entry in
`public/manifest.webmanifest`'s `icons` array (one size, no 192/512 raster, no maskable purpose).
`src/app/icon.svg` (the Next.js App Router favicon convention file) is **byte-identical** to
`public/brand/logo-tally-peak.svg` — the same art duplicated across two independent paths already,
no shared source.

**No `MaggieMark`/`MaggieWordmark`/`MaggieBrandLockup` component exists anywhere in `src/`.** Every
render site is independently hand-coded:

| # | Site | File : lines | Implementation |
|---|---|---|---|
| 1 | Browser tab favicon | `src/app/icon.svg` | Tally Peak art, hard-coded hex |
| 2 | PWA home-screen icon | `public/manifest.webmanifest:9-16` → `public/icon.svg` | A **different** hard-coded SVG than #1 |
| 3 | Header/nav, every shell page | `src/components/SiteNav.tsx:82-90` (`Mark()` fn), used at `:236`; text wordmark at `:237` | Third independent inline `<svg>`, old-palette Tailwind classes; plain-text wordmark span `hidden` below `sm` (mobile-portrait sees icon only) |
| 4 | Lesson-completion/"summit" screen | `src/components/LessonPlayer.tsx:369` | `<Image src="/brand/logo-tally-peak.svg">` — fourth independent reference, same art as #1 via a literal path string |
| 5 | Landing/marketing homepage | `src/app/page.tsx:37-84` | **No header, no mark at all** — `page.tsx` sits outside the `(shell)` group so `SiteNav` never wraps it. Only a plain-text `<h1>{COPY.appName}</h1>`. Least-branded surface in the app today; this is exactly what WS-H's nav bullet targets, so coordinate rather than duplicate. |
| 6 | Loading/route-transition screen | `src/app/(shell)/loading.tsx:16-24` | Bespoke inline "dashed trail route" SVG, trail-themed but not the identity mark |
| 7 | Login/signup/auth (`magic`, `verify`, `reset`, `onboarding`) | whole files | No mark of their own; inherit whatever `SiteNav` shows |
| 8 | Email | `src/server/authService.ts:108,159,171,257` | **No HTML email exists at all** — plain one-line strings, "the mail_outbox is the honest seam" per the file's own comment. Net-new build, not a consolidation. |
| 9 | Open Graph / Twitter meta | — | **Zero matches** in `src/` for `openGraph`/`twitter`/`og:image`. Fully absent. |
| 10 | Root metadata | `src/app/layout.tsx:5-11` (26 lines total) | Only `title`/`manifest`/`referrer`/`description`. No `icons`, `metadataBase`, `openGraph`, `twitter`. |
| — | "Certificate" screen | — | **Doesn't exist as a feature.** The only "certificate" hit in `src/` is an unrelated geometry-proof type name (`src/lib/schema.ts`). Row 4 (completion screen) is the nearest analog and where a future certificate would anchor. |

**Naming-collision traps for whoever implements this** (same category as the already-known
`HeroWidget.tsx` — that's the landing page's K berry-grouping demo widget, unrelated to any logo):
`SiteNav.tsx` has a private function literally named `Mark()`; `src/components/playerChrome.tsx`
exports a decorative `TrailMark` (used 3× in `DashboardClient.tsx:331,348,362`) and a `SummitRoute`
illustration (`playerChrome.tsx:308-320`). None of these three are the brand identity mark — they're
lesson-chrome decoration that happens to share vocabulary with the new component names.

**Net:** 6 independent "logo" implementations live in the running app today (4 icon
implementations — two of which duplicate the same Tally Peak art from two different files — plus 2
plain-text wordmark instances), zero shared, none matching the approved identity or palette. Core
files with actual brand-render logic (the "replace" set): `src/app/icon.svg`, `public/icon.svg`,
`public/manifest.webmanifest`, `src/components/SiteNav.tsx`, `src/components/LessonPlayer.tsx`,
`src/app/page.tsx` (coordinate with WS-H), `src/app/layout.tsx` — **~7 core files**, a narrow code
blast radius even though the asset list is long. Plus net-new: an OG image
route/asset, and a cleanup of the 5 orphaned/superseded files in `public/brand/`.

### 2.2 Design tokens

The token system lives in exactly two files: `tailwind.config.ts` (`theme.extend`, a mix of literal
hex and a `channel()` helper reading CSS custom properties) and `src/app/globals.css` (`:root`/
`.dark`, ~30 custom properties). This is a **mature, accessibility-conscious system already** —
several values carry comments citing exact WCAG contrast ratios verified in past sessions (e.g.
`--text-muted` documented at "5.24:1 on paper (AA; was 4.16)"). Named tokens today: `ink #22314F`,
`paper #FAFBF5`, `sky #2E7CD6`, `tangerine #FF8A3D`, `leaf #2FA36B`, `berry #D6455D`, `night`/`dusk`
(dark-mode), AA-safe `-ink` text variants, CTA fills, layered surface roles. `borderRadius` defines
only `card` (1rem) and `pill` (9999px); `boxShadow` defines `e1/e2/e3`. **No `fontFamily` key
exists at all.**

None of the named tokens are the newly-approved hexes, but two are close analogs worth deciding on
explicitly (see §3): `ink #22314F` is in the same navy family as Deep Navy `#0D1B2A`, and
`tangerine #FF8A3D` is close in hue to Summit Orange `#F08A24` — and `tangerine` is already the
de facto "summit" color in product vocabulary (`.trail-summit-screen`, `.summit-route`,
`.summit-xp`). Critically, **`tangerine` is used decoratively today, not rationed**:
`globals.css` alone contains 45 hand-written gradient declarations, many tangerine-tinted, applied
to ambient decoration — exactly the pattern WS-A's "Summit Orange is rationed" rule means to stop.

Two confirmed dead/broken tokens, evidence the system already drifts without active maintenance:
`--surface-raised` is defined in `globals.css` (`:root`/`.dark`) but never wired into
`tailwind.config.ts` and has zero usages in `src/` — fully dead. `rounded-input` (14 uses, in
`AdminClient.tsx` and `ClassClient.tsx`) is **not defined anywhere** in `tailwind.config.ts` — a
no-op class; those form inputs silently render with no border-radius today.

`amber-*`/`violet-*` raw Tailwind-default utilities leak in outside the brand set, in
`ReviewClient.tsx`, `standards/review/page.tsx`, `PlacementFlow.tsx`, `DailyClient.tsx`, and
`HeroWidget.tsx`.

One positive finding: `src/components/ui.tsx` (`Button`, `LinkButton`, `Surface`, `Badge`,
`SectionHeader`, `StatTile`, `Notice`, `ProgressBar`, `EmptyState`, `StatusBanner`) already has real
variant/tone systems (`BTN_VARIANT`, `BADGE_TONE`, etc.) rather than ad hoc per-call classes. Most
of the drift found in §2.4 looks like call sites bypassing these primitives with raw utility
classes, not the primitives themselves being undisciplined — **`ui.tsx` is the highest-leverage
intervention point for the token/discipline passes**, not a from-scratch rebuild.

### 2.3 The math-semantic palette — real, tested, and NOT architecturally independent today

`src/lib/palette.ts` is exactly the "math-semantic colors kept independent" system the plan doc
requires — genuinely hard-won, tested accessibility work (`palette.test.ts` asserts `ink` ≥4.5:1 on
white, `sky` ≥3:1 large-text, monotonic luminance):

```ts
export const PALETTE = { ink: "#22314F", sky: "#2E7CD6", tangerine: "#FF8A3D", leaf: "#2FA36B", berry: "#D6455D" } as const;
export const ROLE = { given: "ink", active: "sky", target: "tangerine", correct: "leaf", error: "berry" } as const;
```

**The problem:** these five hexes are numerically identical to the UI-chrome tokens in §2.2, and the
two systems are coincidentally the same values, independently hardcoded in **four separate
places**: `tailwind.config.ts`, `globals.css`, `palette.ts`, and — with no import from `palette.ts`
at all — raw hex literals a fourth time, **335 occurrences** inside `src/components/figures.tsx`
(29,584 lines: `#22314F`×142, `#2E7CD6`×66, `#FF8A3D`×66, `#2FA36B`×46, `#D6455D`×14, `#FAFBF5`×1)
and again inside `src/components/playerChrome.tsx` (`SPARK_COLORS` array + a goal-ring stroke).
`src/components/widgets.tsx` properly imports `PALETTE` (944 uses) but *also* separately uses 803
occurrences of the equivalent Tailwind brand-color utility classes *and* 52 more raw hex literals of
the same colors — three sourcing paths for "the same" color inside one file. Only `widgets.tsx` and
`src/components/widgets/numberLineRay.tsx` import `palette.ts` at all.

**Why this matters for WS-A specifically:** today, retinting `tangerine` to Summit Orange in
`tailwind.config.ts`/`globals.css` would silently update chrome and widget Tailwind-class usages but
leave `PALETTE.tangerine` and `figures.tsx`'s 66 raw `#FF8A3D` literals (math "target/unknown"
meaning) on the old value. If an engineer "helpfully" syncs `PALETTE.tangerine` to match instead,
Summit Orange stops being rationed and starts appearing as an ordinary math-widget semantic color
across roughly 1,670 figures — the opposite of the plan's own rule. Neither direction is safe by
accident; §4 Phase 3 below treats this as a required design decision, not a mechanical find/replace.

### 2.4 Typography — a blank slate

Checked `layout.tsx` (root and `(shell)`), `tailwind.config.ts`, `globals.css`,
`package.json`. **No `next/font` usage anywhere** (Next 15.5.20 is installed and fully supports it —
nothing blocks adoption). No `@font-face` declarations. No Google Fonts links. No `fontFamily` key
in `tailwind.config.ts` (the existing type scale — `fontSize.display`, `display-lg`, `content`,
`equation`, `compute` — governs size/line-height/letter-spacing only, so a font split layers on top
cleanly). **No serif font referenced anywhere in application code** — the only serif-adjacent hit in
the whole repo is a rounded-*sans* stack embedded as SVG text inside one of the five orphaned
`public/brand/` candidate files (§2.1), which is pre-approval exploration art, not shippable per
`OPTIMIZATION_PLAN_V3.md`'s own "the concept board itself never ships" rule. No Lexend or
Lexend-like face anywhere. `package.json` has zero font packages. Default UI font today is Tailwind's
unconfigured system stack — confirming the plan doc's own "kill the system-font stack" line
describes the current, unaddressed state.

**Practical implication:** no legacy webfont wiring to unwind, but 100% new build-out — three
`next/font/google` families, new `tailwind.config.ts` `fontFamily` keys, and a naming convention
that keeps the serif strictly off mathematical UI.

### 2.5 Discipline-set clutter — quantified by category

Scope: `src/app/**` + `src/components/*.tsx` top-level, **excluding** `widgets.tsx` and
`figures.tsx` (18,779 and 29,584 lines of math/widget rendering — their hex-duplication issue is
§2.3, not a chrome-clutter issue). 101 files, 12,652 lines, pattern-based counting (a rough-variety
read, not a strict AST audit):

| Category | Occurrences | Files | Finding |
|---|---:|---:|---|
| `shadow-*` | 88 | 29/101 | **Nearly compliant already** — 85% (75/88) use the sanctioned `shadow-e1/e2/e3` tokens. Remainder: `shadow-sm`×2, `shadow-none`×2, 6 bespoke arbitrary-value shadows with hand-written rgba bypassing tokens entirely. |
| `rounded-*` | 358 | 40/101 | **Furthest from the "two radii" bar** — 8 distinct class names → ~6 distinct pixel values: `rounded-card` (161, 16px, dominant), `rounded-pill` (85, 9999px), `rounded-full` (61, 9999px — exact duplicate of pill under the raw Tailwind name), `rounded-input` (14, dead/undefined), `rounded-xl` (5, 12px), `rounded-t` (3, 4px), `rounded-lg` (3, 8px), `rounded-2xl` (1, 16px — duplicate value of "card"). |
| gradients | ~2 as `className` | ~1 | **Undercounts the real problem** — `globals.css` itself has 45 hand-written `linear-/radial-/repeating-radial-gradient()` declarations (`.trail-atmosphere__route`, `.trail-prediction-card`, `.trail-summit-screen`, etc.), many tangerine-tinted. The cleanup surface is `globals.css`'s decorative rule layer, not component classNames. |
| `border-*` | 689 | 39/101 | **Largest, most varied — the biggest lift.** ≥3 distinct widths; 9 distinct color families (6 brand hexes + `sky-ink` + off-palette `amber`/`violet`); opacity is a near-continuous range per color (e.g. `ink` at `/8 /10 /12 /15 /20 /25`; `tangerine` at 7 different opacity steps) despite `globals.css` documenting an intended standard these ad hoc classes bypass. |

---

## 3. The one architectural decision this plan can't make for you

Before Phase 3 (§4) starts, someone needs to explicitly decide how `src/lib/palette.ts` (math
semantics, tested, ships to ~1,670 figures) relates to the UI-chrome brand tokens, because "token
reconciliation, not global replace" is silent on this specific case:

- **Option A — decouple by namespace, keep values equal for now.** Give `palette.ts` its own
  identity (e.g. rename its export or add a comment marking it as intentionally independent) so a
  future chrome retint can't silently drag math semantics with it, but don't change any of its five
  numbers in this pass — they're accessibility-verified. `figures.tsx` and `playerChrome.tsx`'s raw
  hex literals get swept onto an explicit `import { PALETTE }` either way, which is required
  regardless of which option is chosen (untracked duplication is the actual bug; that part isn't
  optional).
- **Option B — decouple and let them diverge immediately.** Same namespace work, plus retint the
  UI-chrome tokens to the literal approved hexes (`#0D1B2A`/`#F08A24`) right away, accepting that
  `ink`/`tangerine` (chrome) and `PALETTE.ink`/`PALETTE.tangerine` (math) will now visibly differ —
  probably subtly, since the approved hexes are close to today's values, but not identically.

Recommendation for the implementing session: **Option A first**, specifically because it's
strictly safer (zero visual change to 1,670 already-shipped, gate-verified figures) and because it
unblocks Phases 1–2 and 4–5 below without waiting on this decision — Phase 3's actual chrome retint
can adopt Option B later, deliberately, with its own before/after visual QA, the same rigor this
session used for the hero-tier label fixes. Don't let this decision block starting the rest of the
plan.

---

## 4. Phased implementation plan

Ordered by dependency, not by the plan doc's own numbering. Each phase names concrete files from
§2 so an implementing session can start immediately rather than re-discovering the audit.

**Phase 1 — Vector asset production.** New `/public/brand/maggies-mark.svg`, `-mono.svg`,
`maggies-wordmark.svg`, `-mono.svg` on the approved palette, plus raster derivatives (favicon,
Apple Touch, PWA 192/512, maskable, OG image). Retire or clearly archive the 5 orphaned/superseded
`public/brand/*.svg` files (§2.1) so two brand concepts don't coexist in the same directory as the
new ones. **Risk flagged here, not deferred:** this environment's ability to produce
production-quality, legible-at-16px vector brand art in-session is genuinely limited — if real
asset production isn't achievable here, the honest move (matching the same rule WS-J's own plan
states for its own art: never silently substitute placeholder-quality art as final) is to ship the
complete file structure, exact filenames, and a written art spec, with clearly-marked placeholders,
rather than claim a legibility bar was met when it wasn't tested.

**Phase 2 — Shared brand component system.** Build `<MaggieMark />`, `<MaggieWordmark />`,
`<MaggieBrandLockup />` (reads the Phase 1 assets), then swap in at the ~7 core files from §2.1:
`src/app/icon.svg`, `public/icon.svg`, `public/manifest.webmanifest`, `src/components/SiteNav.tsx`
(delete the private `Mark()` function; preserve the personalized-name behavior currently at
`SiteNav.tsx:237`, including restoring the wordmark below `sm` if that's a deliberate mobile
decision worth revisiting, not just inheriting it silently), `src/components/LessonPlayer.tsx:369`
(replace the literal `/brand/logo-tally-peak.svg` path), `src/app/layout.tsx` (add `icons`,
`openGraph`, `twitter`, `metadataBase` — all currently absent), and coordinate (don't duplicate)
with WS-H on `src/app/page.tsx`'s currently mark-less landing hero. Net-new, not a swap: an OG
image route/asset.

**Phase 3 — Token reconciliation.** Resolve §3's decision, then: sweep `figures.tsx`'s 335 and
`playerChrome.tsx`'s raw hex literals onto explicit imports; retire the dead `--surface-raised`
token and either define or remove the no-op `rounded-input` class (14 real call sites are silently
losing border-radius today — that's a pre-existing bug this phase surfaces, independent of
branding); reconcile `amber`/`violet` off-palette leaks in the 5 files named in §2.2. Lean on
`src/components/ui.tsx`'s existing variant system as the intervention point rather than touching
every call site individually where possible.

**Phase 4 — Typography split.** Three `next/font/google` families via `tailwind.config.ts`
`fontFamily` keys: identity serif (landing brand moments, premium marketing headings, certificates
if/when built), UI sans (lessons/controls/dashboards), and a Lexend-class young-reader face. Wire
into `src/app/layout.tsx` / `src/app/(shell)/layout.tsx`. Since this is genuinely greenfield (§2.4),
the main risk is scope creep into re-theming every screen at once — constrain this phase to
establishing the three families and applying serif *only* to identity surfaces, not a full
typographic pass.

**Phase 5 — Discipline set.** By leverage, per §2.5: (a) `rounded-*` consolidation — collapse
`rounded-full`/`rounded-2xl`/`rounded-xl`/`rounded-lg`/`rounded-t` into the two sanctioned values,
fix or remove `rounded-input`; (b) `globals.css`'s 45 gradient declarations — audit against "one
accent at a time," reduce tangerine-tinted ambient decoration; (c) `border-*` — the largest lift,
needs its own opacity vocabulary (not a continuous range) and removal of the two off-palette color
families; (d) `shadow-*` — smallest lift, sweep the 6 stray arbitrary-value shadows onto `e1/e2/e3`.

**Phase 6 — Verification against the Bar.** Mark legible at 16px (real rendering test, not
assumed); grep-confirm zero remaining hand-rolled brand variants at the 7 Phase 2 sites; token map
written up for review; a fresh-eyes screen-by-screen pass for "confusable with default Tailwind."
Follow this project's standing gate sequence (`CLAUDE.md`) for anything touching shared components
or tokens — `validate:native`, `check:registration`, full `vitest`, and a `COLLISION_SWEEP=1` pass
if any figure/widget rendering code is touched in Phase 3.

---

## 5. Explicit non-goals for WS-A (out of scope, don't let this workstream absorb them)

- WS-B's Continuous Mathematical Morphing motion system — a separate workstream.
- WS-J's avatar art — concept-boards-only per Plan v3 Part 0's own hard rule; not brand identity
  art and shouldn't be produced under this plan.
- Changing `PALETTE`'s five numeric values in `palette.ts` — §3 Option A keeps them as they are;
  they're accessibility-verified and used across ~1,670 already-shipped figures. Reconciliation
  here means architectural independence, not a retint, unless a future session deliberately adopts
  Option B with its own visual QA pass.
- Building out `src/app/page.tsx`'s full hero content — that's WS-H's hero moment; this plan only
  covers the brand mark/nav piece of that page.
- The "certificate" feature itself doesn't exist yet (§2.1) — Phase 2 gives it a natural anchor
  point (the completion screen) if/when it's built, but WS-A doesn't build it.

---

## 6. Open questions for whoever starts implementation (human or a future session)

1. **Tally Peak's fate** — scrap entirely, or does anything about the four-stroke motif inform the
   new mountain/trail/star mark? Worth a deliberate look before Phase 1, not an assumed "just
   delete."
2. **Asset production path** — per Phase 1's risk note, can production-quality vector art actually
   be generated in whatever environment implements this, or does this phase need an external
   design tool / human designer, with the codebase side shipping structure + spec + placeholders
   first?
3. **§3's decision** — Option A (decouple, keep values equal) vs. Option B (decouple and retint
   immediately). This plan recommends A first; confirm before Phase 3 starts.
4. **Mobile wordmark visibility** — `SiteNav.tsx:237`'s wordmark is `hidden` below `sm` today (icon
   only on mobile-portrait). Is that intentional and worth preserving as-is in the new component, or
   should Phase 2 revisit it?
5. **Sequencing with WS-H** — `src/app/page.tsx` is touched by both WS-A (Phase 2's mark/nav) and
   WS-H (the whole hero rebuild). Implement WS-A's landing touchpoint standalone first, or hold it
   until WS-H's scoping pass (next in this session's queue) so the two land together?

---

*Next in the confirmed scoping sequence: WS-H (landing page rebuild).*
