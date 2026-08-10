# Regression audit — Session 94 Geometry

## Release scope

Session 94 completes runtime refresh coverage and causal manipulative integration for the nine Grade-10 Geometry courses. The Grade-10 `conditional-probability` course is excluded from this geometry release.

## Gate summary

| Gate | Result |
|---|---|
| Geometry discovery/plan/lock target count | **410/410 exact targets** |
| Geometry runtime coverage | **487/487 (100%)** |
| Overall runtime coverage | **3,823/4,471 (85.51%)** |
| Full focused deterministic builds | **186,300 passed** |
| Full independent prompt/state checks | **186,300 passed** |
| Full evaluator builds | **86,940 passed** |
| Full evaluator assertions | **611,214 passed** |
| Post-integration smoke builds/checks | **7,452 / 7,452 / 7,452 passed** |
| Post-integration smoke evaluator assertions | **52,366 passed** |
| Whole-registry generator audit | **417 generators; 262,200 builds passed** |
| Standing independent-route registry | **1,157 routes; all 417 generators covered** |
| Cross-band declaration gate | **3,620 declarations; 54,300 checks passed** |
| Registered form builds | **39,330 passed** |
| Geometry engine verifier | **3 engines; 9 flagships; 18 evaluator assertions; 8 independent checks passed** |
| Geometry direct-manipulative CML audit | **29/29 (100%)** |
| Strict CML lint | **0 errors; 311 advisory warnings** |
| CML integration | **1,129 lesson files parsed; 18 legacy pilots; 68 profiles; passed** |
| Semantic comparison | **410 declarations, 29 CML contracts, 4 predictions, 3 replacements; 0 unintended drift** |
| Native integrity | **Passed** |
| Course registration | **Passed** |
| Content JSON parse | **1,227 files passed** |
| Modified TypeScript-family syntax | **Passed** |
| Legacy 45-script Geometry parity | **29 pass / 16 same stale failures; 0 regressions** |

## Runtime completion evidence

The lock baseline records 77 served Geometry assessments and 410 true gaps. After compilation, all nine courses report zero gaps:

| Course | Total | Served | Gaps |
|---|---:|---:|---:|
| Circle Theorems | 60 | 60 | 0 |
| Constructions & Proof | 47 | 47 | 0 |
| Coordinate Proofs | 60 | 60 | 0 |
| Geometry Foundations | 49 | 49 | 0 |
| Polygons & Quadrilaterals | 60 | 60 | 0 |
| Right Triangles & Trigonometry | 60 | 60 | 0 |
| Similarity | 45 | 45 | 0 |
| Solid Geometry | 61 | 61 | 0 |
| Triangle Congruence | 45 | 45 | 0 |

The full verifier exercises 207 forms across support, core, and stretch bands with deterministic repeat checks, independent prompt/state derivation, and production evaluator submission.

## Manipulative regression evidence

The Geometry manipulative audit records 321 interactive steps, 29 direct mathematical manipulatives, and 29 explicit CML contracts. The new `triangleConstraintLab`, `coordinateProofLab`, and `solidSliceLab` engines pass targeted schema, event, state, evaluator, and misconception checks. All nine courses contain one flagship; the remaining 20 direct manipulatives are supporting wires.

The semantic comparison permits only:

- 410 new variant declarations;
- 29 new CML contracts;
- four new prediction fields;
- three exact widget replacements.

No other lesson content drift is present.

## Legacy chapter-verifier parity

The repository contains 45 older Geometry chapter scripts. Several encode stale assumptions that an interactive step must retain an older widget type even when the baseline app had already evolved. To prevent these scripts from obscuring actual regressions, Session 94 ran every script against both Session 93 and Session 94.

- Session 93: 29 pass, 16 fail.
- Session 94: 29 pass, 16 fail.
- Status changes: **0**.

The targeted Session 94 Geometry engine verifier is green. The legacy suite is therefore reported as parity with zero regressions, not inaccurately described as fully passing.

## Repository integrity

The whole-registry audit verifies deterministic output and non-zero freshness for **417 registered generators** across **262,200 builds**. The standing gate now covers all generators through **1,157 callable independent routes**, checks **3,620 item-level declarations** across **54,300 banded builds**, and passes **39,330 registered generator/form/band builds**. Native integrity, course registration, JSON parsing, CML integration, and modified-source syntax checks pass.

## Package-backed verification boundary

A complete package-backed verification run was not possible in this environment. The npm dependency restoration request reached the configured registry but received HTTP 503 responses, leaving no trustworthy complete dependency tree. Consequently, this audit does **not** claim execution of:

- `npm run typecheck` against the complete installed dependency graph;
- the full Vitest suite;
- package-backed content-schema and pedagogy commands;
- the Next.js production build;
- Playwright end-to-end tests;
- dependency vulnerability audit.

The incomplete `node_modules` directory was removed. Package-lock integrity is unchanged from Session 93. Dependency-free source syntax and all release-specific runtime, evaluator, registry, semantic, CML, JSON, native-integrity, and registration gates pass.

## Release decision

**PASS with one documented environmental boundary.** Session 94 is suitable as the next source release: Geometry is runtime-complete, direct manipulatives are fully CML-wired, the three new engines pass targeted verification, and no authored-content or legacy-verifier regression is detected. A normal connected build environment should rerun the package-backed gates before production deployment.
