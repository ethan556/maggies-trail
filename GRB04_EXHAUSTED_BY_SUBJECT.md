# GRB-04 — HOW MANY OF THE 293 ARE A DEFECT, AND HOW MANY ARE THE SUBJECT

**Evidence:** `reports/generator-audit/GENERATOR_EXHAUSTED_BY_SUBJECT.csv`, from
`scripts/audit/exhausted-by-subject.mts` · **Date:** 2026-08-16

## 1. `polygon-angles` — one form did not need a polygon

`exteriorFromInterior` asks for the **supplement of one vertex angle**:

> *"A vertex has interior angle 108°. Its exterior angle?"*

It was drawing that angle from the family's shared `n` — 180 − 360/n — which pinned it to the seven
values the divisor lattice allows. **The lattice is real for the `sidesFrom*` forms, where n IS the
answer. Here it was inherited constraint**, and it cost the form ninety per cent of its range.

The angle is drawn directly now (even, so the "halved the interior" trap prints a whole number;
120 excluded because there half the interior *is* the exterior). **7 → 65 problems.**

And the family's polygon list was missing **the triangle and the square** — the two polygons the
chapter spends most of its time on, both with whole-number exterior angles. Adding them took
`sidesFromInterior` 7 → 8, `regularInterior` 7 → 11, `sidesFromExterior` and `sidesFromSum` 7 → 12.

### The square collided twice, and the gate caught both

Adding n = 4 surfaced two distinct trap-grades-correct bugs on the first gate run — CLAUDE.md rule 4
working exactly as written:

| form | collision at n = 4 |
|---|---|
| `exteriorSum` | answer is always 360°, and a quadrilateral's **interior** sum is also 360 — so the "(n − 2) × 180 is the interior sum" trap graded **correct** |
| `regularInterior` | each interior angle is 90° and so is each exterior — so the "that is the exterior angle" trap graded **correct** |

The quadrilateral is the unique polygon where each of those coincidences happens. This is precisely
the geometry-special-values hazard the working notes warn about, arriving on cue.

A third failure was the **dual route doing its job**: `regularInterior` began printing *"a regular
triangle"* and *"a regular quadrilateral"*, names the independent route's polygon map did not know,
so it returned `NaN` and the gate went red. The route now knows two more names — corrected, not
relaxed: it checks exactly what it checked before, on a wider corpus.

## 2. The 293 is not a backlog of 293

Every report has carried `293 exhausted pairs` as work to do. Some of those pools are narrow because
**the subject is narrow**, and widening them would be wrong:

```
g3-mult-fluency|MultTable4Numeric  →  4 × 0, 4 × 1, 4 × 2 … 4 × 10
```

The four times table is eleven facts. A learner meeting all eleven is the drill working. CLAUDE.md
rule 7 already says this for single-fact items — *"Rejecting is a SUCCESS, not a failure"* — but
nobody had separated the two populations.

### The first discriminator was wrong, and reading it is what showed that

**Cut one: "one sentence, one number moving, contiguous run" → 58 pairs.** Reading the top of that
list killed it:

```
radian-convert|radToDeg   2..12   "Convert 2 radians to degrees."
mass|kgToG                2..12   "How many grams are in 5 kilograms?"
a2-radicals|re-products   2..12   "Expand (1+√7)²."
```

Nothing bounds "how many kilograms to convert" at twelve. That is the range someone typed.
**`pick(rand, lo, hi)` produces a contiguous run too**, so an under-parameterised generator is
indistinguishable from a closed fact set by contiguity alone.

**Cut two adds the missing condition: a set closed BY CONVENTION starts where the convention
starts.** The times tables at 0, the clock at 1. A run beginning at 2 or 3 has a missing lower end —
the signature of a chosen range rather than a complete one.

| | |
|---|---:|
| Exhausted pairs in the audit | 293 |
| Produced two or more prompts | 285 |
| **closed-fact-set** — the pool IS the subject | **12** |
| **under-parameterised** — the real backlog | **273** |

### All twelve, read

Six times tables (`0..10`), two clock forms (`1..11`, the twelve-hour dial), two make-ten facts
(`10 + n`, `10 − n`), and two tenths forms (`1..9` columns shaded of ten). **12 of 12 are genuinely
closed** — the first list's 58 was 46 false positives, and the tightened one is clean.

## What this changes

The GRB-04 backlog is **273, not 293**, and — more usefully — there is now a stated test for
retiring a pair as correct-by-subject rather than widening it. The twelve are recorded as permanent
rejections in the CSV rather than left to be re-diagnosed by whoever picks the number up next.
