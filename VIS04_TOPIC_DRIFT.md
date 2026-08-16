# VIS-04 — THE FIGURE DRIFT WITH NO NUMBERS TO CATCH IT

**Evidence:** `reports/vis/VIS04_FIGURE_TOPIC_DRIFT.csv`, from
`scripts/audit/figure-topic-drift.mts` · **Date:** 2026-08-16

`VIS03_RENDERING_FIGURE_DRIFT.md` stated its own blind spot: *"Only numeric drift is measured. A
figure that draws the wrong shape, orientation or structure for its lesson carries no number and is
invisible here."* 1,493 of 1,835 titled figures assert nothing numeric, and every one of their
placements was unexamined.

A cylinder beside a fractions lesson is exactly as wrong as `342` beside `452`, and nothing would
have noticed.

## Result, stated with its precision

| | |
|---|---:|
| Rendering placements judged (non-numeric figure, enough vocabulary to compare) | **1,355** |
| Sharing **no** subject vocabulary with their whole lesson | **18** |
| True positives on a full read of all 18 | **2 (~11%)** |

**Low precision, and worth running anyway** — because one of the two is a defect no other measure in
this program could reach:

> **`ia-01-01#c2`** — lesson *"Area Between Two Curves"*. The step explains that an integral comes
> out negative when you subtract the wrong way round, and that curves crossing inside the interval
> make the top and bottom swap.
>
> The figure was **`dr-flat-not-turning`**: *"The cubic has a flat tangent at the origin but does not
> turn there… A zero derivative does not guarantee a peak or a valley."*
>
> **A derivative figure on an integration lesson.** No number in either, so VIS-03 was structurally
> blind to it; the words share nothing, which is the only signal there was.

The second, `kc-03-03#c1`: the figure skip-counts *"twenty-three, thirty-three, forty-three"* while
the lesson counts *"10, 20, 30, 40 … 100"*. Numeric drift — but the title spells its numbers as
**words**, so VIS-03's digit scan could not see it either. The two audits fail in complementary
directions, which is the argument for having both.

`dr-flat-not-turning` also appears on series-convergence and differential-equations lessons: it is
being reused as generic calculus decoration, the `count-on-hops` pattern in the Calc band.

### Fixed

The `figure` key on `ia-01-01#c2` is removed. No figure is strictly better than a derivative diagram
on an integration step, and it needs no authoring judgment about what the right figure would be —
the lesson's own `c1` already carries the correct one (`ia-strip-to-disc`).

### The 16 false positives are all one shape, named so nobody re-reports them

- **`coordinate-plane` × 10** on systems-of-equations lessons. A coordinate plane beside a lesson
  about where two lines cross is appropriate context, not drift.
- **Vocabulary mismatch, not topic mismatch.** `frac-compare-same-denom` says *"Same denominator"*
  while its lesson says *"share a bottom"*; `mult3-missing-factor` says *"missing factor"* while its
  lesson says *"empty slot"* and *"letter"*. The figure and the lesson agree completely and use
  different words for it. This is the measure's central weakness and it is not fixable by tuning —
  a synonym table would be a second corpus to maintain and to get wrong.

## Why the measure is deliberately crude

Content-word overlap is something a reader verifies by eye in one glance. A cleverer measure — an
embedding, a topic model — would be less checkable and would fail differently in every course. This
program has thrown away four detectors this session that were cleverer than they were right, and the
survivors are all the ones a person can audit.

The stop-list is the load-bearing part, and every entry earned its place by making the measure
vacuous: `number`, `line`, `point`, `value`, `show`, `part`, `total` appear in a majority of both
titles and lessons, so with them in, every figure "matched" every lesson.

## What this does not claim

- **Only vocabulary is compared.** A figure drawing the right subject in the wrong ORIENTATION,
  the wrong direction, or with a mislabelled axis shares vocabulary perfectly and is invisible here.
  That class remains entirely unmeasured and needs a person looking at rendered SVG.
- **Titles are trusted as accurate.** If a `<title>` misdescribes its own drawing, both this audit
  and a screen-reader user inherit the error identically.
- **480 non-numeric placements were skipped** for having fewer than three content words in their
  title — `"The priority ladder for operations."` is too terse to judge either way.
- **11% precision means this is a screening pass, not a defect list.** It is worth re-running after
  content changes; it is not worth acting on a row without reading it.
