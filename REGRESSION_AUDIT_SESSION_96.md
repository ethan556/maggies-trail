# Regression audit — Session 96 Precalculus and Calculus

## Release scope

Session 95 completes eight Precalculus courses; Session 96 then completes eight Calculus courses and packages both stages as one advanced-curriculum release.

## Gate summary

| Gate | Result |
|---|---|
| Precalculus runtime coverage | **483/483 (100%)** |
| Calculus runtime coverage | **312/312 (100%)** |
| Overall runtime coverage | **4,444/4,471 (99.40%)** |
| Exact new declarations | **621/621** |
| Focused deterministic builds | **305,100 passed** |
| Independent prompt/state checks | **305,100 passed** |
| Production-evaluator builds | **142,380 passed** |
| Evaluator assertions | **886,960 passed** |
| Whole-registry generator audit | **433 generators; 302,880 builds passed** |
| Standing independent routes | **1,173 routes; every generator covered** |
| Cross-band declaration gate | **4,241 declarations; 63,615 checks passed** |
| Registered form builds | **45,432 passed** |
| Advanced engine verifier | **82 direct manipulatives; 16 flagships; 3 new engines; passed** |
| Direct-manipulative CML coverage | **82/82 (100%)** |
| Strict CML lint | **0 errors; 294 advisory findings** |
| CML integration | **1,129 lessons; direct-engine profiles passed** |
| Semantic comparison | **621 declarations, 82 CML contracts, 16 prediction additions/upgrades, 4 replacements; 0 unintended drift** |
| Native integrity | **Passed** |
| Course registration | **Passed** |
| TypeScript-family syntax | **287 files; 0 syntax errors** |
| Product-state regeneration | **84 courses; 1,129 lessons; 99 widget types; passed** |

## Assessment integrity

Precalculus uses 193 surface-preserving forms across eight generator families; Calculus uses 146 forms across eight families. The focused verifiers independently derive expected responses from prompt/state, submit both valid and misconception states through the production evaluator, verify deterministic repeats, and exercise support, core, and stretch bands.

## Manipulative integrity

The audit identifies 29 genuine Precalculus manipulatives and 53 genuine Calculus manipulatives. All 82 are represented in schema/runtime classification, CML catalog and mesh, narration, process evidence, pedagogy, samples, and lesson metadata. `conicLocusLab`, `derivativeRuleLab`, and `relatedRatesLab` pass targeted truth-table and misconception-state checks.

## Semantic integrity

All 1,129 lesson files were compared against the repaired Session 94 baseline. The comparator permits only new variant declarations, direct-manipulative CML metadata, flagship predictions, and the four approved lab replacements. It found no unauthorized field changes, lesson reordering, step changes, or unrelated-course drift.

## Remaining verification boundary

This environment previously received HTTP 503 responses from its injected npm/Artifactory registry and could not resolve the public registry directly. The source release therefore does not claim a dependency-backed Next.js production build, complete TypeScript module resolution, full Vitest/Playwright execution, or vulnerability scan unless dependency restoration succeeds during the final package attempt. All dependency-free release gates pass.

## Release decision

**PASS with one environmental dependency boundary.** The advanced curriculum is runtime-complete within scope, all direct manipulatives are causally wired, the three new laboratories are targeted rather than redundant, and no authored-content regression is present.
