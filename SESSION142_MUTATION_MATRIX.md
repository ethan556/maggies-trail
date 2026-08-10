# Session 142 adversarial mutation matrix

Every mutation below must be detected by the named source, audit, runtime, or package gate.

| # | Deliberate defect | Required detector |
|---:|---|---|
| 1 | Cell count taken from the wrong row/column | `conditionalTableReadTruth` unit test and S142 audit |
| 2 | Row total omits one cell | truth test and 9,216-case sweep |
| 3 | Column total adds a row instead | truth test and sweep |
| 4 | Grand total omits a cell | truth test and sweep |
| 5 | Whole-table percent uses a row denominator | sweep and authored audit |
| 6 | Row-relative percent uses grand total | sweep and wrong-path grading test |
| 7 | Column-relative percent uses row total | sweep and truth test |
| 8 | Part/whole fraction reversed | exact choice feedback and sweep |
| 9 | Raw count accepted as a percent | independently-derived correct-choice uniqueness |
| 10 | Two mathematically correct choices | Zod `superRefine` and unit test |
| 11 | Duplicate choice IDs | Zod `superRefine` and sweep |
| 12 | Duplicate labels | Zod `superRefine` and sweep |
| 13 | Duplicate numeric claims | Zod `superRefine` and sweep |
| 14 | Fewer than three claims in read mode | schema parse failure |
| 15 | Missing read metric | schema parse failure |
| 16 | Variant falls back to numeric | 9,216-case sweep |
| 17 | Variant falls back to MCQ | 9,216-case sweep |
| 18 | Variant answer disagrees with table truth | sweep answer check |
| 19 | Variant emits weak or empty feedback | sweep diagnosis check |
| 20 | Renderer highlights a denominator by color alone | dashed border, text equation, and renderer test |
| 21 | Target cell not visually distinct | tangerine cell marker and renderer test |
| 22 | Claim control below 44px | `min-h-12` renderer test |
| 23 | Keyboard click does not update state | jsdom interaction test |
| 24 | Reveal replaces learner selection | `aria-pressed` plus separate ghost test |
| 25 | Read mode enables Check before a claim | `canCheck` branch |
| 26 | Legacy conditional mode breaks | legacy schema/evaluator test |
| 27 | Wrong-path feedback rewritten | Session 142 content proof |
| 28 | A non-target lesson changes | Session 141 hash comparison |
| 29 | A seeded variant declaration changes | Session 142 content proof |
| 30 | Historical generator audit freezes unrelated source | behavioral non-regression audit |
| 31 | Registration count drifts | 116/116 registration contract |
| 32 | Generated reports become stale | 37-artifact freshness gate |
| 33 | Package root or session identity is wrong | package identity gate |
| 34 | Packaged source differs from working tree | tar re-extraction audits and hash proof |
