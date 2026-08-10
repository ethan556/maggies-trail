# Regression audit — Session 92

## Scope

Session 92 completes all remaining Grade-9 Algebra I runtime gaps through the shared variant-batch compiler and adds one Causal Mastery Learning flagship sequence to each Algebra I course.

## Coverage delta

- Algebra I: **89/384 → 384/384 (100%)**
- Runtime gaps completed: **295**
- Overall: **2,713/4,471 → 3,008/4,471 (67.28%)**
- K–8 remains: **2,214/2,214**

## Target lock

- Eight Algebra I courses
- 96 lesson files
- 1,035 lesson steps
- 295 exact compiler targets
- 120 unique forms
- Eight generator families
- Surface preservation:
  - 208 numeric
  - 66 MCQ
  - 20 `buildExpression`
  - 1 `matchPairs`

## Focused generation and evaluator gates

| Gate | Result |
|---|---:|
| Deterministic focused builds | **108,000 passed** |
| Independent prompt-derived checks | **108,000 passed** |
| Evaluator builds | **50,400 passed** |
| Evaluator assertions | **304,920 passed** |
| Algebra I course coverage | **8/8 courses at 48/48** |

## CML and manipulative gates

- Eight course-level flagship sequences pass.
- `quadraticExplore` and `expLogExplore` are registered as shared CML engines.
- Each flagship produces a specialized three-card synchronized representation mesh.
- Correct construction and misconception-state evaluator paths pass for all eight sequences.
- Algebra I audit totals:
  - 96 lessons
  - 1,035 steps
  - 580 response-only assessment steps
  - 27 direct-manipulative steps
  - 8 flagship steps
  - 24 mesh cards
  - 16 targeted evaluator assertions
- Strict CML lint: **0 errors** and **334 advisory warnings** across the full app. Twenty warnings are in Algebra I and identify additional prediction-to-causal-manipulation or response-heavy lesson conversions beyond the eight flagship sequences.

## Semantic baseline comparison

Compared against the Session 91 archive:

- 96 lesson files inspected
- 1,035 steps inspected
- 78 changed files
- 295 variant additions
- 8 CML additions
- 0 unauthorized changes

No unrelated authored prompt, explanation, answer, lesson order, prior variant, figure, or widget drift occurred.

## Whole-repository regression

| Gate | Result |
|---|---:|
| Generator registry | **399 generators** |
| Whole-registry deterministic builds | **212,040 passed** |
| Independent base routes | **1,139 callable routes** |
| Declarations | **2,805** |
| Cross-band declaration checks | **42,075 passed** |
| Registered generator/form/band builds | **31,806 passed** |
| JSON parsing | **1,261 files passed** |
| TypeScript-family syntax | **279 files, 0 diagnostics** |
| Strict `variants.ts` semantic check | **0 diagnostics** |
| Native integrity | **passed** |
| Course/widget registration | **passed** |
| K–8 specialized mesh smoke | **461/461 passed** |

## Repairs made during regression

- Replaced the rejection sampler in `frac-unlike-addsub@subBare` with a bounded valid-candidate construction.
- Removed duplicate expression-construction tokens.
- Restored freshness in an overly static matching form.
- Hardened independent parsing for implicit `1` and `-1` coefficients.
- Standardized exact fraction display and algebraic coefficient typography.
- Removed answer/distractor collisions found by the widened seed set.

## Package-backed gates

A bounded `npm ci --ignore-scripts --no-audit --no-fund` attempt stalled silently and left orphaned timeout/npm processes. They were terminated, the partial `node_modules` tree was removed, and `package-lock.json` remained unchanged. The following remain explicitly unverified rather than green:

- full project typecheck;
- full Vitest suite;
- content-schema validation;
- pedagogy lint;
- Next.js lint;
- production build;
- Playwright;
- npm dependency audit.
