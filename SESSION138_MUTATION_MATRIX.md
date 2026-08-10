# Session 138 adversarial mutation matrix

Each mutation below must be detected by a named test, audit, or release gate. A detector that does not fail under its mutation is not evidence.

| # | Deliberate mutation | Required detector |
|---:|---|---|
| 1 | Compute percent change as `base + percent/100` | `session138.percent-change.test.ts` derivation test; `percent-change-s138.mjs` |
| 2 | Apply markup subtraction or markdown addition | derivation test and seven-experience audit |
| 3 | Round to whole dollars instead of cents | derived-answer audit |
| 4 | Accept the change amount as the final price | evaluator exact-choice test |
| 5 | Accept the “percent as cents” value | evaluator wrong-path test |
| 6 | Give two choices the same numeric value | integrity duplicate-choice test |
| 7 | Include two equivalent correct price claims | integrity exactly-one-correct test |
| 8 | Remove one authored misconception choice | content proof and seven-experience audit |
| 9 | Rewrite an authored misconception feedback string | `SESSION138_CONTENT_CHANGE_LEDGER.json` proof |
| 10 | Change an authored answer | independent derivation and content proof |
| 11 | Change prose, IDs, ordering, hints, or explanations | frozen-surface hashes |
| 12 | Convert only flagship interactions but leave checks numeric | seven-target audit |
| 13 | Replace the engine with `percentBar` | audit requires `percentChangeLab`; false-fit rationale |
| 14 | Remove base price from the stage | component visual test and renderer-source audit |
| 15 | Hide the percent-change amount | component visual test and narration audit |
| 16 | Communicate markup/markdown by color alone | labels/operator/dashed-pattern component test |
| 17 | Shrink choice targets below 44px | component `min-h-11` test |
| 18 | Remove keyboard-native buttons | component role/button test |
| 19 | Replace learner selection on reveal | reveal-preservation component test |
| 20 | Remove the separate tangerine reveal ghost | `pcl-ghost` source and component test |
| 21 | Claim adapt=3 without emitting process events | renderer-source audit and event-direction test |
| 22 | Reverse toward/away event direction | event-direction test |
| 23 | Omit any registration surface | 113/113 engine-registration contract |
| 24 | Leave the completed lesson in the live queue | excellence audit and Session 138 audit |
| 25 | Freeze an old tier or queue total in a historical audit | generated non-regression chain |
| 26 | Package under a Session 137 root or stale handover | package-identity and tidy gates |
| 27 | Mutate a lesson after the final hash seal | 1,129-file hash proof |
| 28 | Omit Session 138 audit from package re-extraction | package-session extracted-tree proof |
