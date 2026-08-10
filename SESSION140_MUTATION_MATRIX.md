# Session 140 adversarial mutation matrix

| # | Deliberate defect | Required detector |
|---:|---|---|
| 1 | Reverse the rectangle→square hierarchy edge | hierarchy derivation test and seeded sweep |
| 2 | Mark both always and sometimes correct | integrity unique-correct gate |
| 3 | Duplicate two claim tokens under different labels | choice-claim uniqueness gate |
| 4 | Accept an upward-inheritance claim | evaluator and authored-experience audit |
| 5 | Treat equilateral as not isosceles | inclusive triangle-label test |
| 6 | Treat 90° as acute | angle-family derivation test |
| 7 | Use only side labels for a dual-classification prompt | dual-label test |
| 8 | Permit triangle angles that do not sum to 180° | integrity test |
| 9 | Permit a degenerate side triple | triangle-inequality integrity test |
| 10 | Omit the witness for an always claim | subset-evidence integrity test |
| 11 | Omit either example or counterexample for sometimes | overlap-evidence integrity test |
| 12 | Omit the blocker for never | disjoint-evidence integrity test |
| 13 | Render an isosceles prompt with stock scalene geometry | side-derived SVG geometry marker and renderer test |
| 14 | Render `sometimes-rotated` as never | verdict-normalization source assertion |
| 15 | Fall back to MCQ in any seeded form | 11,520-case executable sweep |
| 16 | Emit a raw widget instead of a complete Variant | executable sweep answer/id assertions |
| 17 | Lose Zod-defaulted output fields | variant gate and changed-source type execution |
| 18 | Change either retained numeric angle-sum step | Session-140 audit and content proof |
| 19 | Change an authored answer label or ID | content ledger answer proof |
| 20 | Change a misconception feedback string | content ledger feedback proof |
| 21 | Change a variant declaration | content ledger variant proof |
| 22 | Change lesson prose, order, hints, or explanations | frozen-surface hashes |
| 23 | Change any non-target lesson | 1,129-file baseline hash proof |
| 24 | Shrink a choice below 44px | DOM class assertion (`min-h-14`) |
| 25 | Communicate evidence by color alone | evidence-kind text, labels, path/shape/pattern assertions |
| 26 | Replace learner selection on reveal | DOM reveal-preservation test |
| 27 | Emit neutral process events for wrong/correct choices | toward/away DOM test |
| 28 | Claim adapt=3 without process wiring | Session-140 audit capability/source check |
| 29 | Miss one registration surface | generated 115/115 registration contract |
| 30 | Freeze the queue at an obsolete count | live compiler/document self-consistency gate |
| 31 | Ship stale generated reports | 33-artifact byte-stability gate |
| 32 | Package under the wrong session root | package identity + re-extraction gate |
