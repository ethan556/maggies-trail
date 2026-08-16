# VIS-03 — THE FIGURES THAT DO RENDER

**Evidence:** `reports/vis/VIS03_FIGURE_EXEMPLAR_DRIFT.csv`, from
`scripts/audit/figure-exemplar-drift.mts` · **Date:** 2026-08-16

Every VIS number in this program until now has been about figures that are **withheld**.
`VIS01_ILLUSTRATION_MEASUREMENT.md` said so in its own limitations: *"I audited none of the 2,738
currently-rendering placements — there is no evidence here that what ships today is correct."*

A withheld figure costs a learner an illustration. A **wrong figure, rendered, teaches them
something false** — and it is the only one of the two that reaches the screen.

## The defect class, generalised from the one case somebody noticed

`count-on-hops` is guarded because a person noticed it. The property that makes it dangerous is not
that it is on a list — it is that **its own `<title>` asserts a numeric relationship**. It is a fixed
exemplar. `figures.tsx` contains **342 rendering placements whose figure does the same**:

> "GCF of 12 and 18 is 6." · "Polygon area on the grid: 5 × 3 = 15."
> "Expanded form: 342 equals 300 plus 40 plus 2." · "13 ÷ 4 = 3 remainder 1."

Three of those figures are guarded. The rest are not.

The `<title>` is the right thing to read: it is the figure's own statement of what it draws, written
for a screen reader, and it is the exact text a non-visual learner receives.

## Result

| | |
|---|---:|
| Figure placements | 3,686 |
| Rendering today | 2,613 |
| Rendering placements whose figure asserts a numeric relationship | **342** |
| Of those, sharing no substantive quantity with the prose beside them | **36** |

**Hand-checked in full — all 36 read, roughly 26 true positives (≈72%).**

The clearest:

| Lesson | Figure says | Prose says |
|---|---|---|
| `pv-01-02#c1` | `342 = 300 + 40 + 2` | `452 = 400 + 50 + 2` |
| `pv-03-03#c1` | `305 − 128` borrowing across a zero | `52 − 27` |
| `mb-03-01#c1` | `4 × 60 = 240` | `3 × 40 = 120` |
| `sr-03-01#c1` | Gauss pairing over `1…8`, sum 36 | pairing over `1…100`, sum 5050 |
| `pr-04-01#c2` | `$50 × 1.08 = $54` | `$20 × 1.15 = $23` |
| `rad-*` (×4) | `√72 = 6√2` | four different lessons: 49, 12, 27, `8^(−1/3)` |

`radical-factor` appearing on four unrelated radical lessons is `count-on-hops` in miniature — one
worked exemplar reused as decoration — and it is the shape this audit exists to catch.

The ~10 false positives are all the same shape and worth naming so nobody re-reports them: a fixed
exemplar beside prose that states the **general rule** is not a defect, it is what an exemplar is
for. `sp-mad-ruler` marking means at 12 and 18 beside a general explanation of mean absolute
deviation is correct; `rt-30-60-90` naming 30, 60 and 90 is naming the triangle, not an instance.

## Three corrections to the detector, each of which changed the answer

Recorded because each was wrong in a way that would have shipped a misleading findings list.

1. **The registry parse matched nothing.** `FIGURES[^=]*=` stops at the `=` of the arrow type
   `Record<string, () => JSX.Element>`, so the audit reported **0 titles and 0 findings** and exited
   cleanly. It was visible only because the script prints the title count — a vacuous green that
   printed its own tell.
2. **"Absent from the prose" was far too weak: 112 rows, and 14 read by hand gave ONE true
   positive.** A fixed exemplar beside a general rule dominates the corpus and is correct. The
   narrowing is that the **prose must make its own numeric claim** — two or more numbers and a
   relation — so the learner is reading one worked instance while looking at another. 112 → 24.
3. **A trailing period ate every sentence-final number.** `(?![\w.])` rejected the `15` in
   `"5 × 3 = 15."`, and sentence-final is the commonest position for the quantity a title is
   asserting. Fixing it removed the clearest defect in the set — `342` vs `452`, which share only
   their units digit — so overlap became **proportional**, with a second rule that a two-digit
   quantity in common is a real overlap whatever the proportion says.

## What this does not claim

- **Only numeric drift is measured.** A figure that draws the wrong *shape*, orientation or
  structure for its lesson carries no number and is invisible here. That is a larger and harder
  class and nothing has looked at it.
- **Titles are trusted as accurate descriptions of the drawing.** If a `<title>` misdescribes its
  own SVG, this audit inherits the error — and a non-visual learner already does.
- **1,493 of the 1,835 titled figures assert nothing numeric** and are out of scope entirely.
- **The three guarded exemplars are excluded**, since their placements are the alignment gate's
  business; counting them again would restate a known number as a new finding.
