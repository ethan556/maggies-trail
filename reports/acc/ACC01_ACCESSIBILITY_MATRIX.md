# ACC-01 — human/device accessibility matrix

**What this is.** An evidence-based matrix of accessibility support against WCAG 2.1 AA, measured
from source only. No app was run, no screen reader was used, no browser rendered anything. Every
row is reproducible by reading the cited `file:line`. §8 states what that leaves undetermined.

**Headline.** This codebase is *substantially* more accessible than a first-pass detector suggests,
and the honest finding is mostly a set of **narrow, specific defects inside a strong system** —
not a broad failure. Six of my eight detectors returned mostly false positives on their first run
(§7). The three findings that survived hand-check are:

1. **`ui.tsx:482` suppresses the app's focus ring on every shared `<Button>`** — the one clean
   Level-AA failure (2.4.7), one token wide.
2. **`openReading` never reaches a single widget prompt.** The CSS excludes `.stage *`
   (`globals.css:270`); every one of the **11,957 authored widget prompts** renders inside `.stage`
   (`widgets.tsx:18952`). The learner's actual question is the one paragraph the dyslexia measure
   cannot touch.
3. **Colour is the only channel for "you are at the target"** in 53 `LabReadout` sites and ~34 SVG
   sites — and `LabReadout` (`widgets.tsx:18289-18291`) *provably* renders no non-colour channel.

Scope: `src/components/**` (163 files), `src/app/**` (31 routes), `src/world/**`,
`src/app/globals.css` (1,209 lines), and the authored corpus under `content/` (1,701 lesson files,
11,957 widget instances). Corpus counter cross-validated against `reports/eng/ENG01`: reproduces
11,957 / 1,701 / `numeric` 4644-4130 exactly.

---

## 1. Prior art — what was already recorded

| Record | What it covers | Relationship to this report |
|---|---|---|
| `scripts/audit/accessible-parity-s237.mjs` | **Accessible/visible parity**: sr-only text must not state a value the visible UI withholds. Static pre-pass; explicitly says the real question "can only be settled by rendering, which the vitest gate does." | Different axis. It asks *does the accessible text say too much*; this report asks *does it say enough, and can it be reached*. Complementary, no overlap. |
| `npm run validate:native` → `scripts/native-integrity.mjs` | Native-control policy: a `<button>` without an explicit `type`, host-absolute imports, unbounded API parsing. | A **cause** of much of what I measured passing. The policy is why 0 SVG primitives carry `onClick` in `figures.tsx` and only 2 do in `widgets.tsx` — hit targets are real `<button>`s. |
| `scripts/verify-instructional-colors.mjs` | Palette *token discipline* (no raw `violet-700`). Ran clean: player core 0, rest 12/37 budget. | Not a 1.4.1 check. It governs *which* colour, never *whether colour is the only channel*. §5(f) is unrecorded anywhere in the repo. |
| `src/components/useSvgDrag.ts:16-21` | States the contract: "a drag handle is always a REDUNDANT input… the handle itself is presentation (`aria-hidden`) and never the only way to reach a state." | **Verified true across all 65 drag sites** (§5a). This is the single strongest thing in the codebase. |
| `src/components/widgets.tsx:18004-18011`, `11538-11540` | Two code comments recording an *already-completed* migration from `<g role="button" tabIndex onKeyDown>` shims to native `<button>`. | Confirmed complete. Both comments were themselves false positives in my first detector run. |
| `LEARNER_FOCUS_RECHECK_S237.md`, `ANSWER_ON_SCREEN_AUDIT_S237.md` | Answer-leak and learner-focus audits. | `ANSWER_ON_SCREEN` intersects §5(f) from the opposite direction — see §6, the pedagogy/accessibility conflict. |

Nothing in the repo currently records: focus management on overlays, focus-ring suppression,
skip links, colour-as-only-channel, `openReading`/`textScale` *reach* (as opposed to existence),
or the OS-preference vs in-app-toggle asymmetry. Those are this report's contribution.

---

## 2. The matrix

Verdict codes: **PASS** = measured, no defect found. **PASS (narrow gap)** = the system is correct;
a bounded, enumerated set of sites is not. **FAIL** = a WCAG AA criterion is not met at a cited
site. **UNDETERMINED** = source cannot settle it (§8).

| # | Criterion (WCAG 2.1) | Level | Verdict | Measured | Evidence |
|---|---|---|---|---|---|
| a | **2.1.1 Keyboard** — drag widgets | A | **PASS** | 65 `useSvgDrag` sites / 54 components; **0** whose drag-written state has no keyboard control writing the same dimension. 1 non-`useSvgDrag` pointer site, explicitly arrow-key operable. | `useSvgDrag.ts:16-21`; `numberLineRay.tsx:434`; §5a |
| b | **4.1.2 Name, Role, Value** — interactive SVG | A | **PASS (narrow gap)** | 11,264 SVG primitive tags scanned; **7** carry an interaction handler. 3 are `aria-hidden` drag hits (correct). 2 are JSX comments. **2 are real** unnamed `onClick` cells — both inside a `role="img"` SVG with a labelled redundant slider, so not a failure. | `widgets.tsx:6340`, `12682`; §5b |
| c | **1.1.1 Non-text Content** | A | **PASS** | 1,986 `<svg>` elements: 1,847 carry a `<title>` child (**1,845 of them with `role="img"`**), 116 `role="img"`+`aria-label`, 17 `aria-hidden`. **0** with no text alternative after hand-check. 1 `<img>` in the codebase; it is deliberately `alt`-less inside an `aria-label`led button. | `alt.mjs` sweep; `AvatarDisplay.tsx:33`; §5c |
| d1 | **2.4.7 Focus Visible** | **AA** | **FAIL** | Global `:focus-visible { outline: 3px solid sky }` is correct. **`BTN_BASE` sets `focus-visible:outline-none` with no replacement ring** (specificity 0,2,0 beats the global 0,1,0). Every `<Button>`/`<ButtonLink>` has no visible focus indicator. 10 usages. | `ui.tsx:480-483`, `globals.css:22-26` |
| d2 | **2.4.3 Focus Order** — overlays | A | **FAIL (1 of 2)** | 2 dialog surfaces exist. `MoreSheet` is `aria-modal="true"` with **no initial focus, no focus containment, and no return focus** — Escape closes it and drops focus to `<body>`. `ReportIssue` is correct (focus in, Escape + Cancel return focus, `aria-live` status). | `SiteNav.tsx:198-238` (fail); `ReportIssue.tsx:38-48, 117, 131` (pass) |
| d3 | **2.4.1 Bypass Blocks** | A | **FAIL** | **No skip link anywhere.** `<main>` exists (`(shell)/layout.tsx:11`) and `<nav aria-label="Main">` exists, but a keyboard user traverses the full header nav on every route. | `app/layout.tsx:81`, `(shell)/layout.tsx:11` |
| d4 | **4.1.3 Status Messages** | AA | **PASS** | Every graded verdict renders through `StatusBanner`, which carries `role="status"`. Two further `aria-live="polite"` regions in the player. *(My initial hypothesis that feedback was unannounced was wrong — see §7.)* | `ui.tsx:849`; `LessonPlayer.tsx:564, 668, 765-807` |
| e1 | **2.5.5 Target Size (Enhanced) — 44px** | AAA | **PASS (narrow gap)** | 560 interactive elements: **480 ≥44px (86%)**, 39 in 24-43px (all admin/teacher chrome), 22 inline text links (2.5.8 inline exception), **2 genuine sub-44px learner-facing controls**. 124 of 125 range sliders carry `h-11`. | §5e; `widgets.tsx:12089`, `17465` |
| e2 | **2.5.8 Target Size (Minimum) — 24px** | AA (WCAG 2.2) | **PASS (narrow gap)** | Only `widgets.tsx:17465` (a `h-4 w-4` checkbox in a label with no height floor) is provably under 24px. | `widgets.tsx:17465` |
| f | **1.4.1 Use of Color** | **A** | **FAIL** | **53 `LabReadout` sites with a conditional `tone`** — and `LabReadout` renders tone as border/background/text colour *only*, no glyph, no text, no ARIA. Plus ~34 hand-confirmed SVG sites (of 55 flagged, 62% TP). Reach: **678 authored instances, 176 graded**. | `widgets.tsx:18289-18291`; §5f |
| g | **2.3.3 / prefers-reduced-motion** | AAA + best practice | **PASS (narrow gap)** | **85 of 86** inline animation declarations in `widgets.tsx`/`figures.tsx` are inside `@media (prefers-reduced-motion: no-preference)`; the 86th is a prose comment. All 12 `globals.css` animations are either no-preference-gated or named in the reduce allowlist. **Gap: 10 Tailwind `animate-pulse` sites sit outside the OS allowlist** and stop only for the in-app toggle. | `globals.css:81-141, 1114-1132`; §5g |
| h1 | **1.4.4 Resize Text** | AA | **UNDETERMINED** | The in-app `textScale` gives **107.5% / 115%** (`globals.css:268-269`) — a comfort control, not the 200% AA mechanism (that is browser zoom, unverifiable from source). Root-rem scaling is architecturally correct: `max-w-*` is rem-based, so SVG stages grow with it. **But `w-full` (1,558 of 1,986 SVGs) is viewport-capped, so on a phone the mathematics does not grow at all.** | `globals.css:262-274`; §5h |
| h2 | **openReading reach** | (product) | **FAIL as designed** | `[data-reading-space="open"] :is(p, li, dd, figcaption):not(.stage *)`. `WidgetRenderer` wraps every widget in `className="stage lesson-stage …"`. **Every widget prompt `<p>` is inside `.stage` and therefore excluded** — 11,957 instances. | `globals.css:270`; `widgets.tsx:18952-18955` |
| i | **1.4.11 / high contrast** | AA | **PASS** | `@media (prefers-contrast: more)` thickens control borders; `@media (forced-colors: active)` strips decorative layers and gives structural `CanvasText` borders. Contrast ratios are documented per token with measured values. | `globals.css:150-241, 440-451, 1136-1156` |
| j | **DEVICE: mobile treatment** | (product) | **PASS (narrow gap)** | Breakpoint census: `sm:` ×123, `md:` ×28, `lg:` ×8, `xl:` ×0; CSS `max-width: 640`, `max-width: 767`, **`max-height: 480`** (landscape phone). 11 tables, 9 with scroll wrappers. 6 unconditional `grid-cols≥4`, all deliberate. `data-band` density tokens with a stated 44px floor. | §5j; `globals.css:536, 905, 1103`; `stageWidth.ts` |

---

## 3. The three preferences — existence vs. completeness

The task asked how *completely* each is honoured, not that it exists. All three boot pre-paint
from one script (`motionBootstrap.ts:6`) and all three survive sync (`sync.ts:170, 370-371`).

### `reduceMotion` — **most complete of the three, with one structural asymmetry**

| Path | Mechanism | Coverage |
|---|---|---|
| In-app toggle | `[data-reduce-motion="true"] *, *::before, *::after { animation-duration: .001ms !important; animation-delay: 0 !important; transition-duration: .001ms !important; scroll-behavior: auto !important }` — `globals.css:129-141` | **Universal.** Catches anything, including future code. |
| OS preference | `@media (prefers-reduced-motion: reduce)` — an **allowlist of 10 named selectors** (`globals.css:1114-1132`) plus per-component `@media` blocks. | Complete for `globals.css`'s own 12 animations and for 85/86 inline widget/figure animations. **Does not reach Tailwind's `animate-*` utilities.** |

**The defect is the asymmetry, not either path.** A learner who set reduce-motion in their OS and
never found the in-app toggle keeps 10 pulsing skeleton loaders
(`daily`, `leaderboard`, `review`, `/`, `notebook`, `syllabus`, `SyncIndicator`, `Basecamp` ×2,
`widgets.tsx:16775` — that last one *is* correctly `motion-safe:`-prefixed, so 10 of 11).
The same asymmetry means any *new* animation is silently covered by the toggle and silently
uncovered by the OS preference. `prefersReducedMotion()` (`motion.ts:36-40`) correctly reads
**both**, and is used for scroll behaviour (`LessonPlayer.tsx:172, 209`) — so the JS path has no
asymmetry. Only the CSS path does.

Secondary: 56 of 90 `className` literals carrying a `transition-*` utility have no
`motion-reduce:transition-none` pair. Most are `transition-colors`, which is not what
prefers-reduced-motion targets; the *movement* transitions (`.pressable`, `.lift`,
`.progress-fill`) are all correctly gated (`globals.css:276-287`). Low severity, but it is the same
allowlist-vs-universal shape.

### `textScale` — **correct mechanism, uneven reach**

`[data-text-scale="lg"] { font-size: 107.5% }` / `xl: 115%` on `:root` (`globals.css:268-269`).
Scaling the root rem is the right choice and the comment says why ("so every rem-based size and
space scales together and nothing overlaps"). It is honoured by:

- All HTML chrome and prose (rem-based Tailwind spacing/typography throughout).
- SVG stages **indirectly**, via their rem-based `max-w-*` caps — 1,503 of 1,986 SVGs have one.

It is **not** honoured by:

- **4,162 SVG `fontSize={N}` attributes** in viewBox units. These scale only in proportion to the
  rendered SVG width. When the SVG is viewport-capped rather than rem-capped — `w-full` on
  1,558 of 1,986 SVGs, which is the binding constraint on a 390px phone — the mathematics stays
  at 100% while the surrounding prose grows to 115%. The net effect on a phone is that
  `textScale` makes the *chrome* bigger and the *figure labels* relatively smaller.
- Pixel floors, deliberately: "Pixel floors (44px targets) are untouched" (`globals.css:264`).
  That is correct — a 44px target must not shrink — but it does mean the `min-h-11` controls
  do not grow with the text they contain.

I could not measure the *layout consequence* of this from source (§8).

### `openReading` — **the narrowest reach of the three, and the finding I would fix first**

```css
/* globals.css:270 */
[data-reading-space="open"] :is(p, li, dd, figcaption):not(.stage *) {
  letter-spacing: .012em; word-spacing: .08em; line-height: 1.72;
}
```

The intent, stated at `globals.css:265-267`, is sound: *"never on equations, tabular numerals, or
stage SVG text, where added tracking distorts mathematical reading."* The **implementation is
broader than the intent**. `:not(.stage *)` excludes the whole stage subtree, and:

- `WidgetRenderer` renders `<div className={"stage lesson-stage …"}><WidgetBody …/></div>`
  (`widgets.tsx:18952-18955`).
- Every widget component opens with `<p className="text-lg font-bold"><MathProse text={spec.prompt} /></p>`.

Therefore **the question the learner is being asked is the single paragraph on the page that
`openReading` cannot touch** — across all 11,957 authored widget instances. The lesson body prose
above the stage (`LessonPlayer.tsx:560`, in the reading column) *is* covered, so the feature works
on the explanation and stops at the question.

Two further narrowings, both smaller: the selector lists only `p, li, dd, figcaption`, so prose in
`<span>`, `<div>` and `<button>` labels (which is most in-widget text, including every choice
button's label) is untouched even outside the stage; and `.stage` is also applied to concept
figures (`LessonPlayer.tsx:589`) and the explanation card (`LessonPlayer.tsx:852`).

---

## 4. DEVICE axis

**Breakpoints actually used** — measured across all 163 `.tsx` files:

| Prefix | Width | Uses |
|---|---|---:|
| `sm:` | 640px | 123 |
| `md:` | 768px | 28 |
| `lg:` | 1024px | 8 |
| `xl:` / `2xl:` | 1280 / 1536px | **0** |

Plus three raw CSS queries: `max-width: 640px` (`globals.css:536`), `max-width: 767px`
(`1103` — hides trail atmosphere, collapses waypoints, makes the action row flex), and
**`max-height: 480px`** (`905` — landscape-phone handling, which most codebases omit entirely).

**This is a mobile-first design with one real breakpoint.** "No breakpoint" is therefore *not*
evidence of "no mobile treatment" — a single-column layout needs none, and that is the trap I fell
into on the first run (§7). Measuring the actual hazards instead:

| Hazard | Count | Verdict |
|---|---|---|
| `<table>` without a horizontal-scroll wrapper | 2 of 11 | Both are narrow (`ratioTable` `widgets.tsx:9270`, `covariationScrubber`) with no `min-w`. Not a defect. |
| `min-w-[≥380px]` | 4 | 3 tables, all with `overflow-x-auto`. `RegionMap.tsx:62` (520px) also has it, on the parent at line 55. Not a defect. |
| Unconditional `grid-cols-≥4` | 6 | All deliberate and semantically fixed: a 7-column week grid (`ProfileClient.tsx:31, 50`), a 5-column ten-frame (`widgets.tsx:16297`), a 5-badge row (`FamilyDashboard.tsx:76`), base-ten ones (`widgets.tsx:16773`), a 4-term eccentricity strip (`widgets.tsx:18739`). |

**Surfaces with no responsive treatment at all** (0 breakpoint prefixes): `/review`, `/trailhead`,
`/teach`, `/practice/[chapterId]`, `/profile`, `/onboarding`, `/notebook`, `/journal`, `/atlas`,
`/basecamp`, `/leaderboard`, `/magic`, `/verify`, `/reset`, `/standards/review`, `/mastery`,
`/learn`. Every one is a single-column card stack, which is the correct mobile-first answer. The
**stage** is where device adaptation actually lives, and it is handled outside Tailwind prefixes:
`stageWidth.ts` assigns each step a semantic tier (narrow/medium/wide/hero) and, per its own
comment, *"on phones every tier collapses to the viewport (minus the gutters)."* `data-band`
(`globals.css:1160+`) then shifts density tokens by grade band with a stated 44px floor.

**The one device gap I can support:** there is **no treatment above 768px**. `lg:` appears 8 times
and `xl:` never, so a 1440px desktop gets the same layout as a 1024px tablet apart from the stage
tier. `HANDOVER_COWORK_S240.md` is cited in `stageWidth.ts` as having done real 1440px pointer QA,
so this is a known and deliberate position, not an oversight.

---

## 5. Findings with evidence

### (a) Keyboard path — **0 defects across 65 drag sites**

The contract at `useSvgDrag.ts:16-21` holds everywhere I could measure it:

- 65 `useSvgDrag(...)` call sites in 54 components. For each, I extracted the mutators called
  inside `onDrag` (`setXxx` / `onChange`) and the object keys written, then looked for a native
  `<button>`/`<input>`/`<select>` in the same component writing the same mutator and the same key.
  **0 sites had an uncovered dimension.**
- 125 `<input type="range">` sliders; 124 carry a ≥36px height class; **3 have no `aria-label`
  and all 3 are wrapped in an implicit `<label>`** (`covariationScrubber.tsx:84`,
  `widgets.tsx:14916`, `18497`).
- **No HTML5 drag-and-drop anywhere** (`onDragStart`/`onDrop`: 0 hits). The one non-`useSvgDrag`
  pointer site is `numberLineRay.tsx:111`, whose own comment reads *"The endpoint AS A CONTROL:
  44×44, focusable, draggable, arrow-key movable."*
- Drag handles are `className="mt-drag-hit" aria-hidden="true"` at every site I read
  (`widgets.tsx:13953`, `14786`, `14796`, `12089`, `18497`, …) — presentational, exactly as the
  contract says.

What this does **not** establish: whether the keyboard path reaches the *same precision* as the
drag (a `step={1}` slider vs a continuous drag), whether tab order is sane, or whether the
keyboard route is discoverable. Those need a browser (§8).

### (b) Interactive SVG naming — 2 real sites, neither a failure

Of 11,264 SVG primitive tags, 7 carry an interaction handler:

| Site | What | Verdict |
|---|---|---|
| `widgets.tsx:13953`, `14786`, `14796` | `mt-drag-hit` handles, `aria-hidden="true"` | Correct by contract |
| `widgets.tsx:11539`, `18007` | JSX **comments** describing the removed `<g role="button" tabIndex>` shim | False positives |
| `widgets.tsx:6340` | `algebraTiles` mat cell, `onClick` → `atRunEdit(placeTile/removeTile)`, unnamed, not focusable | Real, **not a failure**: number inputs at `6452/6466/6479` set the same coefficients |
| `widgets.tsx:12682` | `hundredthsGrid` cell, `onClick` → `onChange(clamp(...))`, unnamed, not focusable | Real, **not a failure**: `<input type="range" aria-label="cells shaded" aria-valuetext={…}>` at `12794`, and the SVG is `role="img"` with a stateful label at `12741` |

Both real sites are "phantom controls" — tappable by pointer, invisible to AT — but because they
sit inside a `role="img"` subtree with a labelled redundant slider, no criterion is violated.
Worth recording, not worth fixing before the items in §2.

### (c) Text alternatives — 0 defects

1,986 `<svg>` elements. 1,847 have a `<title>` child; **1,845 of those also carry `role="img"`**,
which is what makes the title an accessible name rather than a tooltip. The 2 exceptions are
`brand.tsx:74` and `ui.tsx:451` (decorative marks). All 5 SVGs my detector flagged as having no
text alternative turned out to be inside a parent `<div aria-hidden="true">`
(`widgets.tsx:627`, `728`, `16755`) or a shared component (`PartitionBar`, `widgets.tsx:541`)
whose only two call sites (`628`, `729`) are both inside such a div.

Supplementary channel: `describeWidgetState` (`src/lib/describeState.ts:116`) powers an on-demand
`<details data-testid="a11y-panel">` "Describe this model" panel plus a "last change" diff
(`widgets.tsx:18936-18960`). It covers **90 of 127 authored engines**; the 37 without a case carry
**2,213 instances / 661 graded**. That is *not* a defect list — `buildExpression`, `dragBucket`,
`matchPairs`, `tapDiagram` and `dragOrder` are built from natively-labelled buttons, and
`fractionBar`/`tenFrame`/`clockSet` carry stateful `role="img"` labels. It is a *coverage* number
for a supplementary affordance, and worth having.

### (d) Focus management

- **`MoreSheet`, `SiteNav.tsx:198-238`** — declares `role="dialog" aria-modal="true"`. It handles
  Escape (`201-203`) and puts a full-bleed `aria-label="Close menu"` scrim button over the page
  (`209`). It does **not**: move focus into the sheet on open, contain Tab within it, mark the
  background `inert`, or return focus to the trigger on close. `aria-modal="true"` fixes the AT
  virtual cursor but does nothing for the Tab sequence. There is no `.focus()` call anywhere in
  `SiteNav.tsx`.
- **`ReportIssue.tsx`** — correct: focus into the textarea on open (`38-40`), Escape closes and
  returns focus (`42-51`), Cancel returns focus (`117`), status in `aria-live="polite"` (`131`),
  and no `aria-modal` — right, because it is a non-modal popover.
- **The graded feedback dock** — `StatusBanner` carries `role="status"` (`ui.tsx:849`), so verdicts
  are announced. Focus is deliberately not moved, which is defensible. The one thing I cannot
  settle from source: `role="status"` on an element that is *conditionally mounted* rather than
  present-and-then-populated is a known-flaky pattern in some screen readers. §8.
- **No skip link** anywhere — a keyboard user re-traverses `<nav aria-label="Main">` on every route.

### (e) Touch targets

560 interactive elements scanned with a brace-aware JSX tag parser and shared class constants
(`BTN_SIZE`, `INPUT`, `NAV_LINK_CLASS`, `optionClass`) resolved:

| Bucket | Count |
|---|---:|
| ≥44px | **480** |
| 24–43px | 39 (essentially all `/admin` and `/teach/class` chrome at `min-h-9` = 36px) |
| Inline text links (2.5.8 inline exception) | 22 |
| Unresolvable statically | 5 |
| **Under 24px, learner-facing** | **1** — `widgets.tsx:17465`, `h-4 w-4` checkbox inside a `<label>` with no height floor |
| **No height class at all** | **1** — `widgets.tsx:12089`, the `rotationLab` turn slider, the only one of 125 range inputs without `h-11` |

The dominant pattern is right: sub-44px `<input type="radio">`/`checkbox` controls are wrapped in
`<label className="flex min-h-[44px] …">`, so the *label* is the 44px target
(`widgets.tsx:2286`, `2380`, `5504`, `5827`). `widgets.tsx:17465` is the one place that pattern
was not applied.

### (f) Colour as the only channel — **the largest real finding**

```tsx
// widgets.tsx:18289-18291 — the whole component
function LabReadout({ label, value, tone = "neutral" }: {…}) {
  const cls = tone === "good" ? "border-leaf/35 bg-leaf/10 text-leaf-ink"
            : tone === "warn" ? "border-berry/35 bg-berry/10 text-berry-ink"
            : "border-ink/10 bg-white/80 text-ink";
  return <div className={`rounded-xl border px-3 py-2 text-center ${cls}`}>…</div>;
}
```

`tone` maps to border colour, background colour and text colour — **and nothing else**. No glyph,
no suffix, no `aria-label`, no `data-*`. So every conditional `tone` is a colour-only statement.
There are **53 such sites** out of 74 `LabReadout` uses. This is a proof, not a sample: the
component cannot convey `tone` any other way.

Typical shape — `covariationScrubber.tsx:84`:
`<LabReadout label="current pair" value={`(${x}, ${y})`} tone={x===spec.targetInput?'good':'neutral'}/>`.
The *pair* is in text; *"you have reached the target"* is in the green.

Separately, **55 SVG primitives** switch `fill`/`stroke` between `PALETTE.leaf` and `PALETTE.berry`
on a correctness condition with no second conditional channel (no dash change, no radius change,
no label change). Hand-checking 8 of them gave **5 true / 3 false** (62%) — see §7. Confirmed
examples:

- `widgets.tsx:2034-2035` `trialProbabilityLab` — the claim marker and its label both turn leaf on
  `accepted`; the label *text* is unchanged.
- `widgets.tsx:5171-5173` `quadDrag` — the midsegment line and both endpoints switch leaf/berry on
  `msHolds`.
- `widgets.tsx:3504` `circleMeasureExplore` — `stroke={hit ? leaf : sky}`.
- `widgets.tsx:1793` `triangleClosureLab` — a **three-way** leaf/berry/tangerine span line.

Reach across the engines carrying these cues: **678 authored instances, 176 of them graded.**

The counter-examples are instructive and worth preserving: `signChart` (`widgets.tsx:4090`) encodes
sign by colour *and* by whether the bump is drawn above or below the axis; `sampleSim`
(`widgets.tsx:2274`) colours near-truth dots *and* states the percentage in the caption. Those are
what the fix should look like.

### (g) Reduced motion — see §3. (h) Text scaling — see §3.

### (j) Device — see §4.

---

## 6. The one place accessibility and pedagogy pull in opposite directions

Every colour-only correctness cue in §5(f) is **the same set of sites** that
`reports/eng/ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` classifies as **R2 — "correctness signalled
before commit"** and asks to be *removed* (`ENG01 §3.3`, §5 item 4: *"wrap each
correctness-derived `tone`/`fill` in the existing `tone === "info"` guard"*).

- The accessibility fix (add a text or glyph channel) makes the answer leak **louder**, and puts it
  in the accessible name, which is ENG-01 §7.4's asymmetry finding in a new place.
- The pedagogy fix (gate the cue on `tone === "info"`) makes the 1.4.1 problem **vanish**, because
  post-verdict the banner already states the outcome in words.

**These must not be worked as two backlogs.** ENG-01's remediation is also this report's
remediation for §5(f), and doing them in the other order would ship an answer leak in the name of
accessibility. The only sites needing an independent decision are the ones where the coloured state
is a legitimate *procedural* sub-goal rather than the graded answer — `solidSliceLab`'s "the cutter
is at the midpoint" (`widgets.tsx:4848`) and `unitRuler`'s placement count — which ENG-01 §5
"RECORD, DO NOT ACT YET" already carves out for `lengthCompare` on exactly this reasoning.

---

## 7. Hand-check — 34 flagged rows, and the true-positive rate

I ran eight detectors. **Six of the eight were mostly wrong on first run.** Rates below are per
detector; the row-level detail names the specific failure mode, because the failure modes are
reusable.

| # | Detector | Flagged | Hand-checked | True | **TPR** | Why it was wrong |
|---|---|---:|---:|---:|---:|---|
| A | Interactive SVG, no accessible name | 4 | 4 | 2 | **50%** | Matched two JSX **comments** describing the anti-pattern that was already removed |
| B | SVG with no text alternative | 5 | 5 | 0 | **0%** | Checked the `<svg>` tag only, never the **parent `aria-hidden`** |
| C | Drag with no keyboard parity (v1) | 40 | 2 | 0 | **0%** | Tag scanner terminated at the `>` of `=>` inside `onChange={(e) => …}`, so it never saw the handler body. Rewritten brace-aware ⇒ 40 → 0. The 1 survivor (`VectorExploreW` field `G`) was a nested-paren capture leak |
| D | Touch target <44px (v2) | 19 | 6 | 2 | **33%** | Missed wrapping `<label className="min-h-[44px]">`; `absolute inset-0` scrims read as 0px; `aspect-square w-full` is not statically measurable |
| E | Range input with no label | 3 | 3 | 0 | **0%** | Implicit `<label>` association, which the tag text cannot show |
| F | Ungated animation | 12 | 12 | 10 | **83%** | Line-based: the `@media` guard opened one line above; one hit was a prose comment |
| G1 | Colour-only SVG state | 55 | 8 | 5 | **62%** | Missed second channels that are *not attributes on the same element*: bump position above/below the axis, an aggregate stated in a sibling caption, a parent `aria-hidden` |
| G2 | Colour-only `LabReadout` tone | 53 | 3 | 3 | **100%** | Not a sample — `LabReadout` provably has no other channel |
| — | **Overall** | — | **34** | **13** | **38%** | |

**Three detectors I rewrote rather than reported.** C went 40 → 0 after fixing the tag scanner;
the honest output is *zero defects*, and reporting the 40 would have been the single most
misleading thing in this document. D went 72 → 19 after resolving shared class constants and
applying the 2.5.8 inline-link exception. The device detector went 39 "unconditional multi-column"
→ 6 after excluding `grid-cols-2/3` and requiring a genuine overflow risk.

**Two hypotheses I formed and then disproved**, recorded because a future audit will form them too:

1. *"Graded feedback is not announced (4.1.3)."* Wrong — `StatusBanner` carries `role="status"`
   (`ui.tsx:849`). I checked before writing it down.
2. *"`isReady` is dead code (0 external call sites)."* Wrong — it is used internally by
   `recommendNext` at `mastery.ts:186`.

---

## 8. What I did NOT measure

**I cannot run the app, and I did not use a screen reader.** Nothing below is a claim about what a
user experiences; every row above is a claim about what the source says.

1. **No screen reader was run.** NVDA/JAWS/VoiceOver were not used. Everything in §2 rows b, c, d4
   is a *markup* claim. In particular, whether a conditionally-mounted `role="status"`
   (`ui.tsx:849`) actually announces is AT- and version-specific, and only testing settles it.
2. **No browser rendered anything.** So: no computed contrast ratios (I report the values the
   tokens *document* at `globals.css:173-234`, which I did not verify); no measured pixel sizes —
   `widgets.tsx:15797`'s `aspect-square w-full` grid cells could be 20px or 60px depending on
   container width; no confirmation that `textScale: xl` does not overlap anything at 320px; no
   200% browser-zoom reflow test, which is the actual 1.4.4 AA mechanism.
3. **CSS cascade winners are asserted, not computed.** I did not build the stylesheet. Where
   specificity settles it I say so (`focus-visible:outline-none` at 0,2,0 beats `:focus-visible` at
   0,1,0); where source order settles it — the 56 unpaired `transition-*` utilities vs
   `.pressable`'s gated `transition: none` — **I could not determine the winner** and have marked
   that finding low-confidence rather than counting it.
4. **No keyboard walk.** Tab order, focus-trap behaviour, whether the `MoreSheet` failure is
   *noticeable* or merely *present*, and whether a keyboard route to a widget's state has the same
   *precision* as the drag — all unmeasured. §5(a)'s "0 defects" means "every drag-written
   dimension has a keyboard writer in the same component", not "the keyboard experience is good".
5. **Runtime-generated widget specs are outside the denominator.** All counts are of **authored**
   specs. 5,897 `variant` declarations regenerate specs at runtime (`src/lib/variants.ts`); a
   generator emitting a different `tone` condition would change §5(f)'s reach invisibly to a
   corpus grep. Settling that needs the generators run.
6. **Depth of read is uneven, deliberately.** Every detector swept the whole tree, but hand-checks
   concentrated on high-instance engines and on rows whose verdict changed the report. Roughly 45
   of 55 flagged colour-only SVG rows and 50 of 53 `LabReadout` rows were **not** individually
   read; their status rests on the measured 62% / 100% rates.
7. **Cognitive and language accessibility were not assessed at all.** Reading level, instruction
   clarity, error-recovery wording, timing pressure (3.2.x, 3.3.x) — out of scope for a source
   sweep, and the highest-value thing a human review would add.
8. **No gate was run and no code was changed**, per the task constraint. `verify:instructional-colors`
   was executed read-only to read its result; nothing else.
