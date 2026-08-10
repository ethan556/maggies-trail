# Session 129 adversarial mutation matrix

| mutation | required detector |
|---|---|
| allow an arbitrary number not in `choices` to activate Check | `session129.estimate-choice.test.ts` canCheck case |
| mark two candidates correct | schema integrity test / content proof |
| make a wrong candidate tie the correct distance | uniquely-nearest integrity test |
| duplicate candidate values | schema integrity test |
| move a candidate outside the drawn ruler | schema integrity test |
| permit zero as the minimum in continuous log mode | continuous-mode integrity test |
| return generic low/high feedback in choice mode | exact-feedback test |
| remove the fixed actual marker | DOM test + Session-129 audit source contract |
| remove shape/label semantics and rely on color | DOM semantics test |
| replace learner work during reveal | reveal-ghost DOM test |
| mutate a frozen non-target step or remedial mapping | `content-change-proof-s129.mjs` |
| leave `mmt-02-01` in the live queue | `estimate-compare-s129.mjs` / excellence parity |
| report stale B/C product tiers | estimate audit + generated freshness |
| reclassify the task as prediction-eligible | excellence honest-ceiling audit |
