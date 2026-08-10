# Session 129 — Exact discrete estimate comparison

## Result

- **Engine extension:** estimateSlider exact discrete comparison mode.
- **Converted experiences:** 4 (three lesson interactions plus the remedial retry).
- **Tier:** C20 → **B27**; Tier B is intentional because prediction would repeat an object-reading comparison.
- **Reviewed K–8 queue at Session 129 close:** 62 → **61**. Current live queue: **0**, zero unreviewed.
- **Product tiers at Session 129 close:** A 608 · B 204 · C 289 · D 28. Current: A 1186 · B 457 · C 57 · D 1.

## Independently derived candidates

| experience | stated actual | authored candidates | uniquely closest |
|---|---:|---|---:|
| i1 | 9 | 8, 20, 1 | 8 |
| i2 | 12 | 13, 30, 2 | 13 |
| i3 | 7 | 6, 20, 1 | 6 |
| remedial | 9 | 8, 20, 1 | 8 |

## Breakthrough interaction

The engine no longer treats “estimate” as a generic continuous tolerance window. In exact-choice mode it renders a physical zero-based comparison ruler, a fixed diamond for the stated actual length, a circular learner marker, and a dashed distance band. The learner may select only the authored values; each wrong value routes to its original diagnosis. Continuous order-of-magnitude estimation remains the existing logarithmic mode.

## Adversarial contract

- only authored candidate values are selectable
- exactly one candidate is correct
- the correct candidate is uniquely closest to the stated actual quantity
- every wrong candidate retains its own authored feedback
- the fixed actual marker and learner estimate use different shapes and labels, not color alone
- continuous logarithmic estimation remains behaviorally separate

Rejected authoring defects:

- ties at the winning distance
- duplicate candidate values
- candidate values outside the physical ruler
- continuous mode with a zero logarithmic minimum
- Check before an authored candidate is selected

## Frozen-content ledger

One lesson JSON changed under the broken-representation exception: four widget nodes only. Prompts, bodies, IDs, ordering, checks, challenges, answers, hints, explanation variants, variants, concept tags, remedial mapping, and every non-target lesson remain hash-proved unchanged. See `SESSION129_CONTENT_CHANGE_LEDGER.json`.
