# Algebra II completion and whole-app manipulative integration — Session 93

## Executive result

Session 93 applies the manifest-driven batch compiler and the Causal Mastery Learning (CML) workflow to the complete Grade-11 Algebra II curriculum.

- Algebra II rises from **110/515 (21.36%)** runtime-served assessments to **515/515 (100%)**.
- The release completes **405 exact runtime gaps** across nine courses.
- Overall runtime coverage rises from **3,008/4,471 (67.28%)** to **3,413/4,471 (76.34%)**.
- One direct causal flagship sequence anchors every Algebra II course.
- The manipulative review considered Algebra I and the full 93-type app registry. **No new widget type was necessary**: existing engines were reused where they already expressed the mathematics, and six under-profiled engines were promoted into the shared CML contract.

## Completed courses

| Course | Baseline | Session 93 | Gaps completed |
|---|---:|---:|---:|
| Complex Numbers | 40/60 | **60/60** | 20 |
| Function Transformations | 38/64 | **64/64** | 26 |
| Logarithms | 0/60 | **60/60** | 60 |
| Polynomial Functions | 0/60 | **60/60** | 60 |
| Radical Functions | 0/60 | **60/60** | 60 |
| Rational Functions | 0/60 | **60/60** | 60 |
| Sequences & Series | 22/45 | **45/45** | 23 |
| Statistical Inference | 0/61 | **61/61** | 61 |
| Trigonometric Functions | 10/45 | **45/45** | 35 |
| **Algebra II total** | **110/515** | **515/515** | **405** |

## Compiler implementation

The Session 93 plan contains:

- **405 exact assessment-step declarations**;
- **211 reusable form contracts**;
- **nine reusable Algebra II generator families**;
- target surfaces preserved as authored:
  - **152 numeric**;
  - **151 MCQ**;
  - **82 `buildExpression`**;
  - **8 `dragBucket`**;
  - **5 `matchPairs`**;
  - **4 `dragOrder`**;
  - **2 `plotPoint`**;
  - **1 `pointEntry`**;
- a lock file containing the exact target set and authored-content hashes;
- independent prompt/state-derived solution routes for every form;
- production-evaluator verification for correct and misconception states.

The nine generator families cover:

1. complex numbers and complex solutions;
2. function composition, arithmetic, inverses, and transformations;
3. logarithmic definitions, properties, equations, and models;
4. polynomial structure, division, factors, zeros, multiplicity, and end behavior;
5. radical and rational-exponent expressions, functions, equations, and extraneous roots;
6. rational expressions, equations, restrictions, discontinuities, and variation;
7. arithmetic/geometric sequences, sigma notation, finite and infinite series;
8. sampling, confidence intervals, study design, significance, and inference;
9. unit-circle reasoning, trigonometric functions, identities, equations, and models.

## Independent verification model

`src/lib/algebra2Independent.cjs` reconstructs mathematical truth from learner-visible prompts and widget state. It does not read generated answer fields.

The independent layer handles exact algebraic structure, shuffled options, token IDs, pair mappings, bucket assignments, coordinate offsets, implicit coefficients, signed terms, radical domains, complex-plane coordinates, and statistical design distinctions. It also recomputes candidates against original radical equations and rational-domain restrictions rather than trusting transformed equations.

The audit found and repaired several genuine mathematical defects while the solver was being built:

- an identity incorrectly presented as a one-solution rational equation;
- a radical equation whose stored root violated the original sign condition;
- a removable-discontinuity case with coincident factors;
- duplicate or ambiguous statistical matching pairs;
- complex-coordinate traps that could coincide with the target;
- already-sorted ordering tasks;
- inverse-rule distractors that became algebraically equivalent;
- point-swap traps on points lying on `y = x`.

## Whole-app manipulative review and reuse

The Algebra II review inspected direct engines already used in Algebra I, Algebra II, and the broader app. The governing rule was to reuse a mathematically faithful engine rather than create a new surface merely for novelty.

| Algebra II course | Flagship lesson step | Reused engine | Structural learner action |
|---|---|---|---|
| Complex Numbers | `cn-03-02#i1` | `argandExplore` | Construct a complex input and observe multiplication as simultaneous rotation and dilation. |
| Function Transformations | `ft-03-01#i1` | `quadraticExplore` | Reflect outputs and coordinate points, vertex, equation, opening, and scale. |
| Logarithms | `lg-01-03#i1` | `expLogExplore` | Vary the shared base and connect inverse points, equations, tables, and reflected graphs. |
| Polynomial Functions | `pf-02-02#i1` | `signChart` | Produce interval signs and make multiplicity control crossing versus bouncing. |
| Radical Functions | `re-04-02#i1` | `radicalCheck` | Test candidates simultaneously in the squared equation and the original equation. |
| Rational Functions | `rf-04-02#i1` | `graphZoom` | Magnify a discontinuity and separate nearby limiting behavior from the missing point. |
| Sequences & Series | `sr-05-01#i1` | `sequenceBuild` | Vary a common ratio and coordinate terms, partial sums, convergence, and the sum formula. |
| Statistical Inference | `si-02-02#i1` | `sampleSim` | Run repeated samples at multiple sizes and separate center from sampling spread. |
| Trigonometric Functions | `tf-03-02#i1` | `unitCircleExplore` | Rotate an angle and coordinate reference angle, quadrant, coordinates, sine, and cosine. |

The course contains **44 direct-manipulative steps** across the existing portfolio, including `argandExplore`, `quadraticExplore`, `inversePipeline`, `functionMachine`, `expLogExplore`, `signChart`, `radicalCheck`, `graphZoom`, `sequenceBuild`, `treeDiagram`, `sampleSim`, `estimateSlider`, `ciCapture`, `shuffleTest`, and `unitCircleExplore`.

Six engines were promoted into the shared CML profile and specialized representation-mesh system:

- `argandExplore`;
- `signChart`;
- `radicalCheck`;
- `graphZoom`;
- `sequenceBuild`;
- `unitCircleExplore`.

The flagship meshes synchronize graph or diagram, table, symbolic structure, and causal language. The release therefore reuses the strongest whole-app engines without confusing response formats with manipulatives.

## Causal Mastery Learning integration

Every course-level flagship now declares and verifies:

- a falsifiable prediction;
- direct mathematical construction or parameter manipulation;
- an immediate visible consequence;
- invariants and misconception signatures;
- a causal explanation with exactly one valid claim;
- revision and counterfactual experimentation;
- representation translation;
- concrete/visual-to-symbolic fading;
- a transfer family;
- delayed retrieval.

Four flagship lessons that previously lacked a prediction received one: logarithmic inverse graphs, extraneous radical roots, infinite geometric series, and sampling-distribution width.

The strict full-app CML audit passes with **0 errors** and retains **311 advisory warnings**. Only **12 warnings** are in Algebra II: eight prediction-to-manipulation opportunities and four response-heavy flagship-lesson advisories. These are the explicit next course-deepening backlog, not hidden correctness failures.

## Curriculum integrity

The semantic comparison covers all **136 Algebra II lesson files** and **1,242 steps**.

- **113 files** changed.
- Exactly **405 variant declarations** were added.
- Exactly **nine CML metadata blocks** were added.
- Exactly **four prediction commitments** were added.
- **Zero unauthorized changes** were found.

Lesson order, non-target answers, figures, existing widgets, prior declarations, and unrelated authored content remain unchanged.

## Verification results

### Algebra II compiler gates

- **189,900** deterministic focused builds;
- **189,900** independent prompt/state-derived checks;
- **88,620** production-evaluator builds;
- **506,940** evaluator assertions;
- all nine courses runtime-complete;
- Algebra II at **515/515**.

### Algebra II causal-learning gates

- **nine** course-level flagship steps;
- **44** direct-manipulative Algebra II steps audited;
- **27** specialized representation cards across the flagship steps;
- **18** targeted evaluator assertions proving true constructions are accepted and misconception states rejected;
- all nine flagship engines registered in the shared CML catalog;
- strict CML authoring validation with **0 errors**.

### Whole-repository gates

- **408 generators**;
- **237,360** whole-registry deterministic builds;
- **3,210 declarations** with **48,150** cross-band declaration checks;
- **35,604** registered generator/form/band builds;
- **1,148** callable independent routes;
- all **1,267 JSON files** parse;
- **280 TypeScript-family files** pass syntax transpilation;
- zero strict `variants.ts` semantic diagnostics;
- native integrity and course registration pass;
- K–8 runtime coverage remains **2,214/2,214**;
- the K–8 specialized representation mesh remains **461/461**.

## Additional repairs from the widened seed audit

The complete registry audit also repaired:

- zero-freshness sigma matching by shuffling visible pair order while preserving semantic mapping;
- complex-number typography such as `1 + -2i`;
- explicit `1x` coefficients across polynomial and rational forms;
- malformed radical shifts such as `√(x+-2)`;
- ambiguous rational-expression numerator typography;
- duplicate build tokens and weak algebraic distractors;
- long decimal output where exact structure was clearer.

## Remaining verification boundary

The dependency-free release suite is complete. Package-backed Next.js typecheck, full Vitest, content-schema validation, pedagogy lint, production build, Playwright, and dependency audit require a successful dependency restore. A bounded `npm ci --ignore-scripts --no-audit --no-fund` attempt produced no output and failed to return within the 120-second window. Its orphaned timeout/npm processes and partial `node_modules` tree were removed. Package-backed gates therefore remain environment-blocked rather than green.
