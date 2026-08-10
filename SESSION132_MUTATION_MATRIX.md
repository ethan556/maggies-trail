# Session 132 adversarial mutation matrix

| mutation | required detector |
|---|---|
| Grade by choice ID instead of fraction equivalence | `session132.trial-probability.test.ts` equivalent-fraction truth case |
| Accept two equivalent correct fractions | schema integrity + duplicate-rational test |
| Compare favourable with failures as correct | exact cross-product grading test |
| Use theoretical reference as the graded answer | converted `sp-03-02/i2` and challenge audit |
| Render fewer/more theoretical outcomes than denominator | integrity + theoretical outcome-count test |
| Mark the wrong number of outcomes favourable | integrity + theoretical favourable-set test |
| Allow experimental mode to carry an authored outcome list | mode-conflict test |
| Remove an authored wrong-choice feedback | content proof + probability audit |
| Replace the learner marker during reveal | component reveal-preservation test |
| Rely on color alone | component shape/label assertions + source audit |
| Shrink answer controls below 44px | component `min-h-11` test |
| Variant returns `fractionEntry` | 576-draw variant surface sweep |
| Variant trap collides rationally with the answer | variant integrity sweep |
| Omit new type from any registration surface | generated engine-registration contract |
| Count the correct choice as a misconception | flagship/excellence compiler assertions |
| Change any non-target authored field | Session-132 content proof |
