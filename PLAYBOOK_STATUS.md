# Playbook status (generated — do not hand-edit)

Regenerate with `node scripts/measure/playbook-status.mjs`. Measured from `content/` and
`src/lib/schema.ts` on disk; tiers come from `scripts/flagship-tier.mjs` so there is one
tier authority. Tracks `CONVERSION_PLAYBOOK_6_12.md`.

## Engine enhancements — built, and reaching lessons?

`serves` is the playbook's own estimate of the lessons each enhancement was specified for.
A large gap between `serves` and `lessons` is the signal this table exists for: capability
that was paid for and never delivered.

| § | engine | enhancement | built | lessons | serves | using |
| --- | --- | --- | :-: | --: | --: | --- |
| a | `triangleConstraintLab` | constraint | ✓ | 6 | 3 | tc-01-03 tc-02-02 tc-02-03 tc-03-01 tc-03-02 tc-03-03 |
| b | `dilationExplore` | showRatios | ✓ | 10 | 8 | sg-05-01 sy-02-01 sy-02-02 sy-02-03 sy-03-01 sy-03-03 sy-04-01 sy-04-02 sy-04-03 sy-06-01 |
| c | `triangleSolve` | mode:"ratios" | ✓ | 11 | 10 | rt-01-04 rt-02-01 rt-03-01 rt-03-02 rt-03-03 rt-04-01 rt-04-02 rt-05-01 tf-01-01 tf-01-02 tf-01-03 |
| d | `compassConstruct` | +5 modes | ✓ | 6 | 6 | cp-01-01 cp-01-03 cp-02-01 cp-02-02 cp-02-03 g7-03b-03 |
| e | `quadDrag` | kite | ✓ | 1 | 1 | pq-04-03 |
| e | `quadDrag` | showMidsegment | ✓ | 1 | 1 | pq-04-02 |
| f | `solveBalance` | groups | ✓ | 3 | 5 | tse-03-01 tse-03-02 tse-03-03 |
| g | `solveBalance` | negative tiles | ✓ | 5 | 1 | ft-05-02 se-04-01 tse-02-02 tse-03-02 tse-04-02 |
| h | `solveBalance` | inequality | ✓ | 2 | 3 | tse-04-01 tse-04-02 |
| i | `numberLinePlace` | showDistanceFromZero | ✓ | 5 | 3 | avp-01-01 avp-02-01 avp-02-02 avp-02-03 ns-05-01 |
| j | `signChart` | probeX | ✓ | 3 | 2 | pf-02-01 pf-02-03 pf-03-03 |
| k | `signChart` | poles + holes | ✓ | 7 | 10 | pra-05-01 rf-01-01 rf-01-02 rf-01-03 rf-02-01 rf-02-02 rf-05-01 |
| — | `unitCircleExplore` | wave | ✓ | 17 | 14 | tf-04-02 tf-04-03 tf-05-01 tf-05-02 tf-05-03 tg-01-01 tg-01-02 tg-01-03 tg-02-01 tg-03-02 tg-03-03 ti-01-02 ti-01-03 ti-02-01 ti-05-01 ti-05-02 ti-05-03 |
| — | `unitCircleExplore` | ghost | ✓ | 10 | 12 | tg-02-02 tg-02-03 ti-02-02 ti-02-03 ti-03-01 ti-03-02 ti-03-03 ti-04-01 ti-04-02 ti-04-03 |
| — | `unitCircleExplore` | branch | ✓ | 4 | 4 | tg-04-01 tg-04-02 tg-04-03 tg-05-01 |
| — | `extraneousRootLab` | new engine | ✓ | 2 | 14 | re-04-01 re-04-02 |

## Per-block tiers

Acceptance (§9.1): every converted lesson ≥ B, and ≥ 90% of the block at A.

| block | lessons | A | B | C | D | still C/D |
| --- | --: | --: | --: | --: | --: | --- |
| 1 — G7 two-step equations | 17 | 13 | 4 | 0 | 0 | 0 |
| 2 — G12 trigonometry | 30 | 30 | 0 | 0 | 0 | 0 |
| 3 — G10 geometry | 137 | 83 | 42 | 12 | 0 | 12 |
| 4 — G6 number system | 16 | 11 | 5 | 0 | 0 | 0 |
| 5 — A2 polynomial & rational | 30 | 15 | 11 | 4 | 0 | 4 |
| 6 — A2 radicals | 15 | 3 | 10 | 2 | 0 | 2 |

**Block 3 — G10 geometry residue (12):** cp-04-01 (C 25) · cp-04-02 (C 24) · cp-05-01 (C 25) · gf-01-03 (C 24) · gf-05-03 (C 25) · pq-02-02 (C 22) · rt-04-03 (C 22) · rt-05-04 (C 22) · tc-04-01 (C 23) · tc-04-02 (C 22) · tc-04-03 (C 24) · tc-05-03 (C 22)

**Block 5 — A2 polynomial & rational residue (4):** pf-04-02 (C 25) · rf-02-03 (C 25) · rf-03-02 (C 25) · rf-03-03 (C 25)

**Block 6 — A2 radicals residue (2):** re-01-03 (C 25) · re-02-01 (C 25)


## Block 3's purpose-built labs — how far each has reached

These engines were built for the G10 geometry courses and are not §8 enhancements, so the
table above does not track them. Block 3 is authoring-bound, not engine-bound: the residue
below is served by engines that already exist and already pass their gates.

| engine | lessons | using |
| --- | --: | --- |
| `solidSliceLab` | 7 | sg-01-01 sg-01-03 sg-02-01 sg-02-02 sg-03-01 sg-03-02 sg-04-01 |
| `coordinateProofLab` | 5 | cx-01-03 pq-02-01 pq-02-03 pq-05-01 pq-05-03 |
| `triangleConstraintLab` | 11 | g7-03b-01 g7-03b-02 tc-01-01 tc-01-02 tc-01-03 tc-02-01 tc-02-02 tc-02-03 tc-03-01 tc-03-02 tc-03-03 |
| `triangleSolve` | 15 | rt-01-02 rt-01-04 rt-02-01 rt-03-01 rt-03-02 rt-03-03 rt-04-01 rt-04-02 rt-05-01 rt-05-03 tc-05-01 tc-05-02 tf-01-01 tf-01-02 tf-01-03 |
| `dilationExplore` | 16 | g7-01-02 sg-05-01 sy-01-01 sy-02-01 sy-02-02 sy-02-03 sy-03-01 sy-03-03 sy-04-01 sy-04-02 sy-04-03 sy-05-03 sy-06-01 tm-01b-03 tm-02-02 tm-02-03 |
| `compassConstruct` | 10 | cp-01-01 cp-01-02 cp-01-03 cp-02-01 cp-02-02 cp-02-03 cp-03-01 cp-03-02 cp-03-03 g7-03b-03 |
| `quadDrag` | 7 | cg-03-02 cx-03-02 pq-03-01 pq-03-03 pq-04-02 pq-04-03 pq-05-02 |
| `distanceGrid` | 9 | cx-01-01 cx-01-02 cx-05-01 cx-05-02 rad-04-01 rad-04-03 rt-01-01 tg-05-02 tm-04-02 |
| `circleAngleExplore` | 5 | cr-01-01 cr-01-02 cr-01-03 cr-04-02 cr-05-03 |
| `transformExplore` | 7 | gf-04-01 gf-05-01 gf-05-02 tm-01-01 tm-01-02 tm-01b-01 tm-01b-02 |

Product-wide: 1701 lessons · A 1187 · B 458 · C 56 · D 0.
