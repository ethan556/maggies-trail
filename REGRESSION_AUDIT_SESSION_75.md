# Session 75 — G5-A Decimal Operations and Fraction Operations

## Result

Session 75 refreshes all **35** remaining assessed gaps in the two selected Grade-5 courses:

- `decimal-operations`: **46/58 → 58/58 (100%)**
- `fractions-multiply`: **29/52 → 52/52 (100%)**

Grade 5 rises from **105/245 (42.86%)** to **140/245 (57.14%)**. Overall refreshed coverage rises
from **1,741/4,471 (38.94%)** to **1,776/4,471 (39.72%)**.

This is the first full proof of the reuse-first workflow at course-completion scale. The 35 gaps use
**25 forms across seven families**, but only **one family is new** (`fraction-scaling`). The other six
families are proven engines extended for the authored item shapes:

- `grouping-first`
- `partial-products`
- `frac-unlike-addsub`
- `whole-times-fraction`
- `frac-multiply`
- `unit-frac-divide`

All authored surfaces are preserved, including `evalOrder`, `columnCalc`, and `fractionGrid`. The 14
edited lesson files differ from Session 74 only by the 35 added `variant` declarations; lesson prose,
authored prompts, answers, explanations, figures, and widget specifications are unchanged.

## Quality catches

The combined focused and registry-wide audits found and repaired four real generator defects before
release:

1. A non-unit fraction-area draw could choose a denominator too small for its numerator range.
2. The three-way scaling form could emit duplicate fraction-product labels.
3. A unit-fraction whole-count misconception could equal the correct answer at the smallest support
   values.
4. Carry feedback could say “1 tens”; singular/plural wording is now correct.

## Verification

- **9,000** focused deterministic builds across all 25 Session-75 forms and three difficulty bands.
- **15,000** checks through the actual standing `INDEPENDENT` routes.
- **6,000** evaluator-level builds with **31,680** correctness/diagnostic assertions.
- Whole registry: **373 generators**, **132,840 deterministic builds**, PASS.
- Independent-route invariant: **373/373** registered generators have a base route.
- **1,573 declarations** passed **23,595** cross-band surface/determinism checks.
- **19,926** registered generator/form/band builds passed.
- Native integrity and registration pass.
- All **1,231 JSON files** parse; **262 TypeScript-family files** syntax-transpile with zero
  diagnostics.
- Semantic comparison confirms the 14 lesson files changed only by added `variant` declarations.

## Package-backed gate status

Two bounded `npm ci` attempts reached the package registry but failed with HTTP **503** while fetching
`zustand-5.0.14.tgz`. No dependency or build residue remains. Package-backed typecheck, full Vitest,
schema/pedagogy validation, lint, production build, Playwright, and npm audit are therefore
environment-blocked and are not reported as green.

## Next efficient batch

Proceed with **G5-B: all 30 true runtime gaps in `decimals-place-value`**. It is the smallest remaining
Grade-5 course-completion batch and has the best reuse profile: rounding can extend `round-place`,
comparison can extend the existing place-comparison engine, and place-value/decimal-form items can
share a compact decimal representation family. Completing it would produce a third finished Grade-5
course and raise Grade-5 coverage to **170/245 (69.39%)** before tackling the more generator-heavy
coordinate and volume courses.
