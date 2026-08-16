# VIS-05 — ORIENTATION: WHY IT RESISTS AUTOMATION, AND WHAT THE ATTEMPT PRODUCED

**Evidence:** `reports/vis/VIS05_AXIS_ORIENTATION.csv`, from
`scripts/audit/figure-axis-orientation.mts` · **Date:** 2026-08-16

VIS-03 and VIS-04 share one blind spot, and VIS-04 stated it: *"A figure drawing the right subject
in the wrong ORIENTATION, the wrong direction, or with a mislabelled axis shares vocabulary
perfectly and is invisible here."* It shares every number too. I wrote that it *needs a person
looking at rendered SVG*, and then went to check whether that was actually true.

## The SVG is renderable, and that part worked

Every figure is a pure component with no props, so `renderToStaticMarkup` yields the **real
laid-out coordinates** — the numbers a learner's browser computes — rather than the JSX expressions
(`X(n) = ox + n * u`) a static read would see. **1,871 of 1,871 figures render.**

*(The first run reported `0 rendered` and exited cleanly. `figures.tsx` compiles under the classic
JSX runtime, so every element is `React.createElement` and needs `React` in scope; Next.js supplies
it and a bare `tsx` run does not. It was visible only because the script prints its own render
count, and the fix — set the global, then import dynamically so the static import is not hoisted
above it — is recorded at the import.)*

## The invariant, and the negative result

SVG's y grows **downward**, so a mathematical figure drawing a vertical scale must invert it, and
forgetting is the classic upside-down bug. So: on a run of evenly-spaced labels carrying
evenly-spaced values, a vertical scale should read *descending* when sorted by increasing y.

| | |
|---|---:|
| Figures rendered | 1,871 |
| Carrying a numeric label run | 148 |
| Runs checked | 177 |
| Runs failing the direction test | **19** |
| **True defects on a full read of all 19** | **0** |

The first cut reported **84**. Tightening the shape test — requiring arithmetic progression in both
value and position, and rejecting figures with more than two parallel runs (a grid puts one on every
column) — took it to 19. It could not take it to a true positive.

### Why every one is correct

- **Tables and ladders** — `ratio-table`, `mapping-diagram`, `fg-function-test`, `ee-dep-indep`,
  `rr6-table-to-plane`, `pr7-k-fraction`, `log-scale-ladder`. A table reads top to bottom, so its
  first column ascends downward. That is not an inverted axis; it is a table.
- **A numbered list** — `lc-continuity-conditions` [1 2 3], *"The three conditions for continuity"*.
- **A 120-chart** — `c120-down-ten` [4 14 24 34], whose title says *"Going down a row adds ten"*.
  Downward-increasing is the construction.
- **Decreasing sequences, which are the subject** — `fn-negative-diff` [20 15 10 5]
  (*"a difference of negative five"*), `tno-count-down-tens` [65 55 45 35] (*"counting down by
  tens"*), `as-partners-ten` [9 8 7 6 5] (*"one and nine, two and eight…"*).

### The structural reason, which is the finding

**In a K–12 mathematics figure corpus, a vertical run of evenly-spaced numbers is almost never a
y-axis.** It is a table column, a numbered list, or a counting sequence — all of which correctly
read top to bottom.

And nothing in the SVG distinguishes a y-axis from a table column: both are evenly spaced `<text>`
at a constant x, with evenly spaced values. The discriminator needed is not geometric — it is
knowing what the drawing **means**.

So the original assessment holds, now for a stated reason rather than a shrug. This class needs a
person. What it does *not* need is a browser: the harness is built and the coordinates are exact, so
a human review has a machine-readable inventory to work from rather than 1,871 screenshots.

## What the attempt did produce

**A render-health gate — `src/components/figures.renderHealth.s242.test.tsx`.**

`figures.tsx` is 29,656 lines and 1,871 hand-written SVG components, and **until this file nothing
in the repository called any of them at runtime.** Typecheck proves they compile; the content gates
prove the ids are registered and placed. A figure that throws renders as **nothing** — `FigureView`
wraps it in a dynamic import with a loading placeholder, so the failure is a silent blank on every
lesson that places it.

The gate asserts three things: the registry is non-empty (so nothing below is vacuous), every figure
renders without throwing, and every figure has a `<title>`. All three pass today —
**1,871/1,871 render, 0 untitled** — which is worth knowing and was not known.

The `<title>` assertion matters beyond accessibility: it is the entire content a non-visual learner
receives, and it is what VIS-03 and VIS-04 both read to judge whether a figure belongs beside its
lesson. A figure without one is invisible to a screen reader and to both audits at once.

## The VIS ledger, closed

| Packet | Class | Status |
|---|---|---|
| VIS-01 | Withheld figures | Reframed — 916 wrong placements, suppressed correctly; 484 lessons with no figure is the real defect |
| VIS-03 | Rendering, numeric drift | 36 flagged, ~26 true; `radical-factor` on four unrelated lessons |
| VIS-04 | Rendering, topical drift | 18 flagged, 2 true; a derivative figure on an integration lesson, fixed |
| VIS-05 | Orientation | **Not automatable — reason established.** Render-health gate landed instead |

What remains genuinely open in VIS is authoring: **484 lessons render no figure at all**, and no
detector helps with that.
