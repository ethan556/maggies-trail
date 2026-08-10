# Algebra I completion and Causal Mastery integration — Session 92

## Executive result

Session 92 applies the manifest-driven batch compiler and the Causal Mastery Learning (CML) workflow to the complete Grade-9 Algebra I curriculum.

- Algebra I rises from **89/384 (23.18%)** runtime-served assessments to **384/384 (100%)**.
- The release completes **295 exact runtime gaps** across eight courses.
- Overall runtime coverage rises from **2,713/4,471 (60.68%)** to **3,008/4,471 (67.28%)**.
- One direct causal flagship sequence is established in every Algebra I course.
- No new widget type was required; existing algebra manipulatives were promoted into a coherent course-level mastery system.

## Completed courses

| Course | Baseline | Session 92 | Gaps completed |
|---|---:|---:|---:|
| Exponential Functions | 24/48 | **48/48** | 24 |
| Exponents & Polynomials | 20/48 | **48/48** | 28 |
| Functions & Sequences | 16/48 | **48/48** | 32 |
| Linear Functions | 10/48 | **48/48** | 38 |
| Quadratics | 4/48 | **48/48** | 44 |
| Radicals & Exponents | 4/48 | **48/48** | 44 |
| Solving Equations | 3/48 | **48/48** | 45 |
| Systems of Equations | 8/48 | **48/48** | 40 |
| **Algebra I total** | **89/384** | **384/384** | **295** |

## Compiler implementation

The Session 92 plan contains:

- **295 exact assessment-step declarations**;
- **120 reusable form contracts**;
- **eight reusable generator families**;
- **208 numeric**, **66 MCQ**, **20 `buildExpression`**, and **one `matchPairs`** target surface;
- a lock file containing the exact target set and authored-content hashes;
- independent prompt-derived solution routes for every form;
- production-evaluator verification for correct and misconception states.

The eight generator families cover the major Algebra I structures:

1. exponential functions;
2. exponents and polynomials;
3. functions and sequences;
4. linear functions;
5. quadratics;
6. radicals and rational exponents;
7. equations and inequalities;
8. systems of equations.

The generator architecture centralizes conventional algebraic typography. It suppresses coefficients such as `1x` and `-1x`, preserves exact fractional values where decimals would obscure structure, and normalizes signs and expression spacing.

## Independent verification model

`src/lib/algebra1Independent.cjs` reconstructs mathematical truth from learner-visible prompts and widget state. It does not read the generated answer field.

The independent routes cover:

- exponential growth, decay, transformations, equations, and models;
- exponent laws, scientific notation, polynomial operations, and factoring;
- function evaluation, domain/range, sequences, and recursive/explicit rules;
- slope, intercepts, graph forms, parallel/perpendicular relationships, and modeling;
- quadratic features, transformations, factoring, roots, completing the square, and the quadratic formula;
- radicals, rational exponents, simplification, domains, equations, and extraneous solutions;
- multi-step equations, identities/contradictions, inequalities, absolute value, and literal equations;
- systems by graphing, substitution, elimination, classification, and contextual modeling.

Implicit coefficients, exact fractions, signed terms, shuffled choices, token labels, and matching-pair identities are parsed independently.

## Causal Mastery Learning integration

A flagship direct-manipulation sequence now anchors every Algebra I course.

| Course | Lesson step | Engine | Structural learning action |
|---|---|---|---|
| Exponential Functions | `exp-01-02#i1` | `expLogExplore` | Vary parameters and connect context, table, equation, and graph behavior. |
| Exponents & Polynomials | `ep-02-02#i1` | `algebraTiles` | Construct and combine polynomial terms while preserving like-term structure. |
| Functions & Sequences | `fn-01-01#i1` | `functionMachine` | Trace input-output covariation and distinguish a rule from isolated pairs. |
| Linear Functions | `lf-02-01#e1` | `lineExplore` | Manipulate slope/intercept and observe coordinated graph and equation consequences. |
| Quadratics | `qu-01-03#e1` | `quadraticExplore` | Vary vertex-form parameters and observe vertex, opening, width, and graph changes. |
| Radicals & Exponents | `rad-04-03#i1` | `distanceGrid` | Construct distance and radical magnitude geometrically. |
| Solving Equations | `alg1-01-01#i1` | `balanceScale` | Apply equivalent operations while preserving equality. |
| Systems of Equations | `se-01-01#i1` | `systemsExplore` | Manipulate two constraints and interpret their common solution. |

Every flagship sequence declares:

- a falsifiable prediction;
- direct mathematical construction or parameter manipulation;
- visible causal consequence;
- an invariant and misconception model;
- explanation and revision requirements;
- counterfactual experimentation;
- representation translation;
- concrete-to-symbolic fading;
- a transfer family;
- delayed retrieval evidence.

`quadraticExplore` and `expLogExplore` were promoted into the shared CML engine catalog and given specialized synchronized representation meshes. Algebra I therefore uses the same production causal contract as the K–8 flagship engines rather than a course-specific exception.

## Curriculum integrity

The semantic baseline comparison covers all **96 Algebra I lesson files** and **1,035 steps**.

- **78 files** changed.
- Exactly **295 variant declarations** were added.
- Exactly **eight CML metadata blocks** were added.
- **Zero unauthorized changes** were found.

Existing lesson order, authored explanations, non-target answers, figures, prior declarations, and unrelated widget specifications remain unchanged.

## Verification results

### Algebra I compiler gates

- **108,000** deterministic focused builds;
- **108,000** independent prompt-derived checks;
- **50,400** production-evaluator builds;
- **304,920** evaluator assertions;
- all eight courses at **48/48**;
- Algebra I at **384/384**.

### Algebra I causal-learning gates

- **eight** flagship steps;
- **27** direct-manipulative Algebra I steps audited;
- **24** specialized representation cards across the eight flagship steps;
- **16** targeted evaluator assertions proving correct constructions are accepted and misconception states rejected;
- strict CML authoring validation with **0 errors**. The full-app lint retains **334 advisory warnings**, including 20 Algebra I warnings that identify prediction-to-manipulation and response-heavy-lesson conversion opportunities; they are documented as the next interactivity backlog rather than hidden as errors.

### Whole-repository gates

- **399 generators**;
- **212,040** whole-registry deterministic builds;
- **2,805 declarations** with **42,075** cross-band declaration checks;
- **31,806** registered generator/form/band builds;
- **1,139** callable independent base routes;
- all **1,261 JSON files** parse;
- **279 TypeScript-family files** pass syntax transpilation;
- zero strict `variants.ts` semantic diagnostics;
- native integrity and course registration pass;
- K–8 runtime coverage remains **2,214/2,214**;
- the existing K–8 CML mesh remains **461/461** specialized.

## Defects found and repaired by the widened audit

The Session 92 seed namespace exposed and repaired defects that were not limited to the new course:

- a pre-existing constrained-draw exhaustion in `frac-unlike-addsub@subBare`;
- duplicate construction tokens in some expression-building forms;
- static content in a matching form that did not demonstrate adequate freshness;
- independent parsing gaps for implicit coefficients;
- repeating-decimal output where exact fractions were instructionally superior;
- unconventional `1x` and `-1x` coefficient rendering;
- several answer/distractor collisions uncovered under expanded randomized coverage.

## Remaining verification boundary

The dependency-free release suite is complete. A bounded `npm ci --ignore-scripts --no-audit --no-fund` attempt stalled silently and did not return control cleanly. The orphaned timeout/npm processes and partial `node_modules` tree were removed, and `package-lock.json` remained unchanged. Package-backed Next.js typecheck, full Vitest, schema and pedagogy validation, lint, production build, Playwright, and dependency audit therefore remain environment-blocked rather than green.
