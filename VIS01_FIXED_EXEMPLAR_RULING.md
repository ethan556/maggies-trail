# VIS-01 — THE 942 ROWS ARE NOT WITHHELD ILLUSTRATIONS. THEY ARE WRONG ONES, CORRECTLY SUPPRESSED.

**Evidence:** `reports/vis/VIS01_ILLUSTRATION_MEASUREMENT.md`, plus the derivation measurement below
· **Date:** 2026-08-16

## What the packet was going to be

`count-on-hops` (793 placements), `bar-compare` (84) and `number-track` (65) account for **87.4% of
the withheld figure backlog**. Each is a legacy figure with fixed numbers — `count-on-hops` draws a
number line with a dot on 4, three hops to 5, 6, 7, and the caption *four plus three equals seven* —
that was later reused as generic decoration across 88 courses.

`isFigureTextAligned` withholds them wherever the prose does not describe those exact numbers, so
they render on 3 of 796, 1 of 85, and 5 of 70 placements respectively.

**The obvious repair was to parameterise the figure**: derive its numbers from the step's own prose,
draw *that* sum, and every placement renders correctly with no content change. The alignment gate
already does the text analysis needed, so inverting it looked cheap.

## Why that is wrong, measured before it was built

| Figure | Placements | Aligned today | Withheld, numbers **derivable** | Withheld, undecidable |
|---|---:|---:|---:|---:|
| `count-on-hops` | 796 | 3 | **16** | **777** |
| `bar-compare` | 85 | 1 | 0 | 84 |
| `number-track` | 70 | 5 | 10 | 55 |

**777 of 796 carry no derivable numbers at all.** And reading the 16 that do settles it — the
derivation would be *wrong* on every one:

> The equals sign says both sides name the same amount: **3 + 2** and 5 are the same number.
> **3 + 4 × 5** is 23, not 35. The 4 × 5 forms a single quantity first.
> Brackets override the ranking. **(3 + 4) × 5** forces the addition first.
> The repeated sum is the array written as arithmetic: 3 rows of 4 becomes **4 + 4 + 4**.

A count-on number line beside an order-of-operations lesson is not a missing illustration that needs
un-suppressing. It is an actively misleading one. Parameterising the figure would have shipped 793
confidently-wrong diagrams in place of 793 blanks — strictly worse, and invisible to every gate,
because each one would have "matched" its prose by construction.

**The gate is not the defect. The gate is the only thing currently protecting these lessons.**

## What this means for the packet

VIS-01 was framed as *1,078 withheld or mismatched illustrations*. The correct framing is two
different problems of very different sizes:

1. **916 wrong placements** — a figure that does not illustrate its lesson, suppressed at render.
   Learner-visible impact today: **none**. The repair is to unplace them, which changes nothing on
   screen and is worth doing only as corpus hygiene.
2. **484 lessons that render no figure at all** — the real defect, and the one a learner meets.
   The repair is to AUTHOR or select a correct figure for each. That is content work at
   1,701-lesson scale and it is not a code fix.

The content is deliberately left alone here. The `figure` key on a mismatched step is the record
that someone intended an illustration there, and the alignment gate plus
`figureTextMismatchBlocklist.generated` is the record of why it does not show. Deleting the keys
would make the corpus tidier and the history unrecoverable, and it would not move a single pixel.

## What is still unmeasured, and it is the half that could hurt

`VIS01_ILLUSTRATION_MEASUREMENT.md` says it plainly: *"I audited none of the 2,738 currently-
rendering placements — there is no evidence here that what ships today is correct."*

Every number in this document is about figures that do **not** render. A false POSITIVE — a figure
shown beside prose it does not match — is the defect that actually reaches a learner, and nothing in
this program has yet looked for one. That is the next VIS packet, and it is more urgent than either
of the two above.

The hand-check rates in the source measurement bound how much to trust the split: the
fixed-exemplar guard scored **11/11 true positives**, so the 916 figure is solid; the blocklist
fingerprint scored **4/14**, so roughly 95–100 of the 1,078 are over-suppression of correct figures
and belong in population 2 rather than population 1.
