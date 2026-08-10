# Session 131 — Causal distribution comparison

## Result

- **New shared engine:** `distributionCompareLab`.
- **Converted experiences:** 26: 18 standardized-gap measurements and 8 overlap conclusions.
- **Lessons:** sp-02-01, sp-02-02, sp-02-03; all finish at an honest Tier B.
- **Reviewed K–8 queue:** 59 → **0**, zero unreviewed.
- **Product tiers:** A 1186 · B 457 · C 57 · D 1.

## Breakthrough relationship

The same fixed geometry now supports both claims in the strand: the raw distance between means is measured in one shared variability-width, and that standardized distance visibly controls overlap. The learner manipulates the conclusion or the unit-count, while the distributions remain fixed evidence.

## Converted evidence

| lesson | experience | mode | gap units | accepted answer | preserved wrong states |
|---|---|---|---:|---|---|
| sp-02-01 | i1 | measure | 3 | 3 | 12 · 4 |
| sp-02-01 | k1 | measure | 4 | 4 | 12 · 3 |
| sp-02-01 | i2 | measure | 0 | 0 | 2 · 6 |
| sp-02-01 | i3 | measure | 4 | 4 | 24 · 6 |
| sp-02-01 | k2 | measure | 3 | 3 | 15 · 5 |
| sp-02-01 | k3 | measure | 3 | 3 | 15 · -3 |
| sp-02-01 | ch1 | measure | 3 | 3 | 24 · 8 |
| sp-02-01 | remedial:sp-gap-units | measure | 3 | 3 | 12 · 4 |
| sp-02-02 | i1 | judge | 0.4 | The classes aren't meaningfully different in performance | One class is clearly much better than the other · The data must be wrong |
| sp-02-02 | k1 | measure | 6 | 6 | 30 · 5 |
| sp-02-02 | i2 | judge | 4 | The towns' commute times are meaningfully different | The towns must have the same average commute · There isn't enough information to say anything |
| sp-02-02 | i3 | measure | 3 | 3 | 12 · 4 |
| sp-02-02 | k2 | judge | 0.3 | The stores' sales aren't meaningfully different | One store clearly outsells the other · The gap-in-units must be calculated wrong |
| sp-02-02 | k3 | measure | 4 | 4 | 24 · 6 |
| sp-02-02 | ch1 | judge | 2.5 | There's a real, noticeable height difference, though some overlap remains | The teams have identical average heights · The teams are impossible to compare |
| sp-02-02 | remedial:sp-overlap-gap | measure | 6 | 6 | 30 · 5 |
| sp-02-02 | remedial:sp-overlap-judge | judge | 0.3 | The stores' sales aren't meaningfully different | One store clearly outsells the other · The gap-in-units must be calculated wrong |
| sp-02-03 | i1 | measure | 3 | 3 | 12 · 4 |
| sp-02-03 | k1 | judge | 3.5 | The farms' yields are meaningfully different | The farms have identical yields · There's too much overlap to say anything |
| sp-02-03 | i2 | measure | 0.25 | 0 | 2 · 8 |
| sp-02-03 | i3 | measure | 4 | 4 | 36 · 9 |
| sp-02-03 | k2 | measure | 3 | 3 | 24 · 8 |
| sp-02-03 | k3 | judge | 0.2 | The neighborhoods' home prices aren't meaningfully different | One neighborhood is clearly pricier · The data must be flawed |
| sp-02-03 | ch1 | measure | 3 | 3 | 30 · 10 |
| sp-02-03 | remedial:sp-realworld-compare | judge | 3.5 | The farms' yields are meaningfully different | The farms have identical yields · There's too much overlap to say anything |
| sp-02-03 | remedial:sp-realworld-gap | measure | 3 | 3 | 24 · 8 |

## Adversarial contract

- the two distributions and their overlap are visible before the learner answers
- measure mode derives the standardized gap from the displayed means and variability-width
- judge mode preserves the authored conclusion rather than inventing a global numeric threshold
- every authored wrong path remains an exact reachable choice with verbatim feedback
- reversing group order cannot make the standardized gap negative
- seeded variants stay on the same causal surface
- reveal adds a tangerine target without replacing the learner's sky tape

## Frozen-content ledger

Three lesson JSON files changed under the broken-representation exception: 26 widget nodes. All 26 authored misconception-feedback mappings are preserved verbatim, and every field outside the target widget nodes is hash-proved unchanged in `SESSION131_CONTENT_CHANGE_LEDGER.json`.
