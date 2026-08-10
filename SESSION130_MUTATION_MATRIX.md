# Session 130 adversarial mutation matrix

| deliberate defect | required detector |
|---|---|
| permit width or height to change in `countGrid` mode | `widgetIntegrityErrors`: fixed dimensions must match starts |
| author rows × columns that do not equal the answer | schema integrity + `session130.grid-read.test.ts` |
| reuse a correct total as a misconception count | schema integrity rejects correct-answer traps |
| duplicate a misconception count | schema integrity rejects duplicate counts |
| generate a misconception count above the visible grid | 384-draw G2 variant seed sweep + integrity gate |
| generate zero as a checkable misconception | seed sweep requires every trap to be >0 and < answer |
| let Check run before any square is marked | `canCheck` fixed-grid assertion |
| grade a row/column trap with generic feedback | evaluator exact-feedback assertions for all 16 experiences |
| change a variant-bearing step back to numeric | deterministic variant surface assertions + grid audit |
| allow the learner to resize the supplied grid | fixed-dimension schema checks and renderer contract tokens |
| make “Count next row” auto-solve the whole grid | DOM test advances only to the next row boundary |
| remove the reversible decrement/reset controls | DOM reversibility test and source contract audit |
| replace learner work on reveal | DOM test preserves count while ghosting remaining cells |
| encode target only by color | renderer requires labels plus distinct learner/target patterns |
| shrink action controls below 44px | DOM test checks `min-h-11` on native buttons |
| alter any non-target authored lesson surface | Session-130 content proof against the Session-129 seal |
| leave either completed lesson in the live backlog | grid audit requires queue removal and exactly 59 rows |
| hand-edit product tiers without regeneration | generated-artifact byte-stability gate |
