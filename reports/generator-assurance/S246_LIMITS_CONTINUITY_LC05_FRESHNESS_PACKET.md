# S246 — Limits & Continuity `lc-05` freshness packet

## Boundary and disposition

- Course: `limits-continuity` (Grade 12)
- Coherent family: Chapter 5, `lc-05-01` through `lc-05-03`
- Exact starting frontier: `lc-05-01.json/k1` / `limits-continuity__lc-avg-rate__numeric`
- Stop boundary: after `lc-05-03`; the next frontier is outside the Limits & Continuity course/family
- Lesson JSON was audited but not edited. Shared queues, cards, ledgers, caches, and MCQ evidence were not touched.

## Declared consumer census

| Form | Surface | Consumers | Deterministic prompt/truth states |
|---|---:|---:|---:|
| `limits-continuity__lc-avg-rate__numeric` | numeric | 3 | 12 |
| `limits-continuity__lc-avg-rate__mcq` | MCQ | 1 | 12 |
| `limits-continuity__lc-derivative__mcq` | MCQ | 1 | 12 |
| `limits-continuity__lc-derivative__numeric` | numeric | 3 | 12 |
| `limits-continuity__lc-series-limit__numeric` | exact-number lab | 3 | 12 |
| `limits-continuity__lc-series-limit__mcq` | MCQ | 1 | 12 |
| **Total** | **six forms** | **12** | **72** |

## Root-cause repair

The six forms previously fell through to authored banks containing only one to six fixed prompts. They now use bounded 12-case mathematical families:

- average rate: independently computed secant slope for varied quadratics and intervals;
- derivative as a limit: the printed difference quotient must agree with the printed quadratic before the oracle accepts it;
- derivative evaluation: the oracle derives and evaluates `2qx + m` from the prompt;
- geometric-series limits: the oracle reconstructs `a/(1-r)` from printed fractions and rejects nonconvergent ratios.

All MCQ choices are deterministically shuffled. Numeric traps are deduplicated and cannot equal the prompt-derived truth. Existing lesson surface types remain unchanged.

## Independent assurance

`precalculusIndependent.cjs` receives only learner-visible prompt text. It does not import generator case tables or generated answers.

The focused gate checks:

- 280 seeded calls per form with deterministic replay;
- exactly 12 distinct prompts and 12 distinct truths for every form;
- 96 unseen resolver seeds per form through `variantForStep`;
- schema validity, preserved surfaces, one correct MCQ option, option-label uniqueness, position variation, and bounded length parity;
- seven adversarial recomputation/rejection cases, including a reversed secant interval, a mismatched difference quotient, and a divergent geometric series.

This covers 1,680 direct seeded states plus 576 resolver states across the six forms.

## Narrow predecessor correction

While these shared generator/oracle files were owned, the newly exposed `lc-endbehavior__mcq` option asymmetry was also closed. Every generated choice now:

- begins with `limit `;
- names both numerator and denominator degrees;
- uses the same conclusion-plus-degree-comparison construction;
- stays within a 12-character within-item length spread.

The predecessor regression checks 240 seeded items / 960 option labels and answer-position variation. The independent oracle exact outputs were updated to the same parallel labels.

## Verification

- `session246.limitsContinuityLc01Freshness.test.ts`
- `session246.limitsContinuityLc02Freshness.test.ts`
- `session246.limitsContinuityLc03Lc04Freshness.test.ts`
- `session246.limitsContinuityLc05Freshness.test.ts`
- Result: **4 files, 19 tests passed**
- TypeScript: passed (`tsc --noEmit`)
- Targeted ESLint: **0 errors**; one pre-existing `no-explicit-any` warning at the authored-bank adapter
- Diff check: passed

## Reopen conditions

Reopen this packet if a declared `lc-05` consumer/form changes, any of the six forms changes surface, the independent prompt grammar stops parsing a learner-visible prompt, a case pool drops below 12 prompt/truth states, or a shared resolver/generator edit breaks any of the four sequential limits gates.