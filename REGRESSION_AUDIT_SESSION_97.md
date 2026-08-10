# Regression Audit — Session 97

## Scope

Statistics and Probability completion and manipulative integration, based on the repaired Session 96
package.

## Runtime and generator integrity

- Domain baseline: 333/360
- Domain final: 360/360
- Conditional Probability: 49/76 → 76/76
- Overall baseline: 4,444/4,471 (99.40%)
- Overall final: **4,471/4,471 (100%)**
- New declarations: 27
- New forms: 21
- Generator families added: 1
- Focused builds: 18,900
- Independent checks: 18,900
- Evaluator builds: 8,820
- Evaluator assertions: 60,900

The global repository gate passes 434 generators, 1,174 independent routes, 4,268 declarations,
64,020 declaration checks, and 45,810 registered-form builds. The whole registry passes 305,400
builds.

## Manipulative integrity

- Statistics/probability interactive steps reviewed: 164
- True direct mathematical manipulatives: 45
- Explicit CML contracts: 45/45
- Full flagships: 9
- Supporting wires: 36
- New causal engines: 1 (`conditionalTableLab`)
- Intentional passive-surface replacements: 1
- New-engine evaluator truth cases: 4/4

## Structural gates

- Native integrity: PASS
- Course registration: PASS
- JSON parsing: 1,307 files, zero errors
- TypeScript-family syntax: 291 files, zero syntax errors
- Strict CML lint: zero errors
- CML integration: PASS
- Statistics/probability engine verifier: PASS
- Product-state regeneration: 84 courses, 1,129 lessons, 10,487 steps, 100 widget types, 91
  app-level manipulative types

## Semantic lock

All 1,129 lesson files were compared to the Session 96 baseline. The exact permitted changes are 27
variant additions, 38 CML additions, one prediction addition, and one approved body/widget
replacement. No other lesson text, answer, hint, explanation, figure, course metadata, or step
structure changed.

## Package-backed boundary

The environment-injected npm registry remained unavailable during the release preflight: `npm ping`
timed out after 20 seconds. Therefore the dependency-backed Next.js typecheck/build, Vitest,
Playwright, and vulnerability scan are not claimed here. No partial `node_modules`, `.next`, coverage,
compiler cache, or emitted JavaScript artifact is retained in the package. All dependency-free release
gates pass.
