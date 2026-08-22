# S245 visual-first canary — Kindergarten joining

## Result

**PASS for the bounded five-lesson canary.** Ten concept placements in
`add-subtract-10-k` chapter 1 now render a concept-specific figure. They previously named
the fixed `count-on-hops` exemplar, whose visible `4 + 3 = 7` did not match the adjoining
concept text and was therefore suppressed at runtime.

No check, challenge, answer, target, option, hint, or feedback field changed. The figures
remain on concept steps so the mathematics stays dominant during assessed work.

## Representation contract

| Lesson                                   | Figure                  | Mathematical job                                                            | Placements restored |
| ---------------------------------------- | ----------------------- | --------------------------------------------------------------------------- | ------------------: |
| `koa-01-01` Putting Groups Together      | `koa-join-two-groups`   | Keep two parts distinct, then count every object once in the combined whole |                   2 |
| `koa-01-02` Adding with Fingers          | `koa-add-with-fingers`  | Continue one count across two hands                                         |                   2 |
| `koa-01-03` Adding with Drawings         | `koa-add-with-drawing`  | Freeze two groups in a drawn record so nothing is skipped or counted twice  |                   2 |
| `koa-01-04` Acting Out a Sum             | `koa-act-out-a-join`    | Show two people joining a starting group and the group growing              |                   2 |
| `koa-01-05` Writing an Addition Sentence | `koa-addition-sentence` | Translate concrete groups to `3 + 2 = 5`; distinguish joining from equality |                   2 |
| **Total**                                | **5 figures**           | **Five coordinated representations, not repeated decoration**               |              **10** |

Every SVG has a narrated `<title>`, uses `role="img"`, keeps visible labels at 10 units or
larger, and uses redundant shape/position/text cues rather than colour alone.

## Queue evidence

Measured with the production alignment gate through
`scripts/audit/vis01-illustration-measurement.mts`.

| Measure                      | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total placements             |  3,825 | 3,825 |      0 |
| Rendering placements         |  2,747 | 2,757 |    +10 |
| Suppressed placements        |  1,078 | 1,068 |    -10 |
| Fixed-exemplar suppressions  |    942 |   932 |    -10 |
| `count-on-hops` suppressions |    793 |   783 |    -10 |
| Blocklist suppressions       |    136 |   136 |      0 |

All ten changed rows report `registered=true`, `aligned=true`, and `cause=RENDERS` in
`reports/vis/VIS01_PLACEMENTS.csv`. The consolidated illustration workstream now contains
1,068 rows. The overall queue also reflects unrelated concurrent work and must not be used
to attribute more than this ten-row visual reduction to the canary.

## Verification

- TypeScript: pass.
- Full content schema: 1,711/1,711 clean.
- Pedagogy: 1,711/1,711 clean.
- Canary binding/accessibility/no-answer-placement tests: pass.
- Figure registry split, render health, and adversarial alignment ratchet: pass.
- Figure collision suites: 4/4 pass.
- Instructional colour verification: pass.
- Production figure-text alignment: 3,825 uses, 932 fixed suppressions.

The complete global figure sweep still encounters an independently authored
`ia-top-bottom-swap` label below its existing 10-unit text floor. The new five figures pass
that same floor in the dedicated canary test; the unrelated failure was not modified here.

## Scaling decision

This canary is safe to scale only by coherent representation family. The remaining 783
`count-on-hops` rows span unrelated topics, so bulk renaming them to one generic figure would
repeat the original defect. The next highest-yield safe batch is chapter 2 of this course:
author subtraction-specific removal, crossing-out, acting-out, sentence, and count-back
figures before changing its ten bindings.
