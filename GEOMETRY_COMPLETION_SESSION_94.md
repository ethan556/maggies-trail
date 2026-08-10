# Geometry completion and causal manipulative integration — Session 94

## Executive result

Session 94 applies the manifest-driven variant compiler and the Causal Mastery Learning (CML) workflow to the complete Grade-10 Geometry sequence. The separate Grade-10 `conditional-probability` course is intentionally outside this geometry scope.

- Geometry rises from **77/487 (15.81%)** runtime-served assessments to **487/487 (100%)**.
- The release completes **410 exact runtime gaps** across nine courses.
- Overall runtime coverage rises from **3,413/4,471 (76.34%)** to **3,823/4,471 (85.51%)**.
- All **29 true mathematical manipulatives** in the Geometry sequence now carry explicit CML contracts.
- One flagship learn-by-doing sequence anchors every Geometry course.
- Existing engines are reused wherever they already model the causal mathematics; only **three genuinely missing laboratories** are added.

## Completed courses

| Course | Baseline | Session 94 | Gaps completed |
|---|---:|---:|---:|
| Circle Theorems | 23/60 | **60/60** | 37 |
| Constructions & Proof | 0/47 | **47/47** | 47 |
| Coordinate Proofs | 16/60 | **60/60** | 44 |
| Geometry Foundations | 6/49 | **49/49** | 43 |
| Polygons & Quadrilaterals | 32/60 | **60/60** | 28 |
| Right Triangles & Trigonometry | 0/60 | **60/60** | 60 |
| Similarity | 0/45 | **45/45** | 45 |
| Solid Geometry | 0/61 | **61/61** | 61 |
| Triangle Congruence | 0/45 | **45/45** | 45 |
| **Geometry total** | **77/487** | **487/487** | **410** |

## Assessment compiler implementation

The Session 94 plan contains:

- **410 exact assessment-step declarations**;
- **207 reusable form contracts**;
- **nine reusable Geometry generator families**;
- authored response surfaces preserved exactly:
  - **232 numeric**;
  - **178 MCQ**;
- a target lock containing the exact step set and authored-content hashes;
- independent prompt/state-derived solution routes for every form;
- production-evaluator checks for valid answers and misconception states.

The generator families cover:

1. arcs, chords, tangents, sectors, cyclic quadrilaterals, and power-of-a-point reasoning;
2. classical constructions, conditional logic, converse reasoning, and proof structure;
3. slopes, distances, midpoints, equations, and coordinate proofs;
4. points, lines, planes, transformations, angle relationships, and foundational logic;
5. polygon angle sums, quadrilateral properties, regular polygons, and classification;
6. right-triangle ratios, Pythagorean relationships, inverse trigonometry, and applications;
7. dilation, proportionality, scale factors, similarity criteria, and indirect measurement;
8. volume, surface area, density, cross-sections, nets, and Cavalieri reasoning;
9. congruence criteria, rigid motions, triangle relationships, and proof.

The generated practice layer is deterministic and surface-preserving. It refreshes the exact authored assessment forms through stable template families, reasoning variations, and option-order variation; it does not pretend that every form is a fully free-parameter theorem generator.

## Whole-course manipulative review

The audit distinguishes genuine mathematical manipulatives from response surfaces. Geometry contains **321 interactive steps**, but only **29** expose mathematical objects or parameters whose state changes reveal a mathematical consequence. The remaining **292** are answer, sorting, matching, plotting, or reveal interactions and are not mislabeled as manipulatives.

| Geometry course | Flagship step | Engine | Structural learner action |
|---|---|---|---|
| Circle Theorems | course flagship | `circleMeasureExplore` | Change radius, central angle, and related measures while coordinating arc length, sector area, and circumference. |
| Constructions & Proof | course flagship | `compassConstruct` | Perform a valid straightedge-and-compass construction and connect each move to the invariant it creates. |
| Coordinate Proofs | `cx-01-03#i1` | **`coordinateProofLab`** | Move a vertex, then assemble a proof from live slope, midpoint, and distance evidence. |
| Geometry Foundations | course flagship | `transformExplore` | Apply rigid transformations and inspect which distances, angles, orientation, and coordinates remain invariant. |
| Polygons & Quadrilaterals | course flagship | `quadDrag` | Deform a quadrilateral while testing which constraints are necessary and sufficient for each family. |
| Right Triangles & Trigonometry | course flagship | `triangleSolve` | Change side-angle data and observe coupled trigonometric and Pythagorean consequences. |
| Similarity | course flagship | `dilationExplore` | Vary center and scale factor while tracking proportional lengths, slopes, angles, and coordinates. |
| Solid Geometry | `sg-03-01#i1` | **`solidSliceLab`** | Move a section plane and compare equal-height cross-sections to build Cavalieri’s principle. |
| Triangle Congruence | `tc-01-01#i1` | **`triangleConstraintLab`** | Switch among SSS, SAS, ASA, AAS, HL, and SSA and test whether the givens determine zero, one, or two triangles. |

### New laboratories

#### `triangleConstraintLab`

This laboratory makes congruence a uniqueness question rather than a mnemonic exercise. Learners change the criterion and angle, reveal a possible second construction, and see why included-angle conditions lock a triangle while SSA can remain ambiguous. The evaluator requires the target criterion, target angle, sufficient exploration, and evidence that the ambiguity test was used.

#### `coordinateProofLab`

This laboratory replaces “the diagram looks like a parallelogram” with an evidence assembly task. Learners position the missing vertex and inspect live slopes, diagonal midpoints, and distances. The proof succeeds only when the coordinate location and the required independent evidence agree.

#### `solidSliceLab`

This laboratory turns Cavalieri’s principle into an experiment. Learners move a section plane through a solid, add an equal-base-area comparison solid, test several matching heights, and finish at the target section. It separates equal-volume reasoning from superficial similarity of base shape or exterior surface.

### Reused and fully wired engines

The audit reuses nine mathematically faithful engines already in the app:

- `circleMeasureExplore` — 7 steps;
- `circleAngleExplore` — 5 steps;
- `compassConstruct` — 2 steps;
- `distanceGrid` — 1 step;
- `transformExplore` — 2 steps;
- `plotPoint` — 2 steps;
- `quadDrag` — 3 steps;
- `triangleSolve` — 2 steps;
- `dilationExplore` — 2 steps.

All 29 direct manipulatives now participate in the shared CML engine catalog, event processing, state narration, representation mesh, evaluator, stage sizing, pedagogy classification, and sample registry.

## Causal Mastery Learning contract

Every Geometry manipulative now declares the causal learning structure appropriate to its role. The nine flagships include:

- a falsifiable prediction;
- direct construction or parameter manipulation;
- immediate visible consequences;
- invariants and misconception signatures;
- an explanation check with one defensible causal claim;
- counterfactual experimentation and revision;
- coordinated diagram, graph, table, symbolic, or language representations;
- visual-to-symbolic fading;
- transfer and delayed retrieval metadata.

Twenty supporting manipulatives receive explicit CML wiring without being inflated into separate flagship sequences. This gives Geometry **29/29 direct-manipulative CML coverage (100%)**.

## Curriculum integrity

The semantic comparison covers all **1,129 lesson files** in the repository and verifies the allowed Geometry changes.

- Exactly **410 variant declarations** were added.
- Exactly **29 CML contracts** were added: nine flagship and 20 supporting.
- Exactly **four prediction commitments** were added; the other five flagships already contained predictions.
- Exactly **three intentional widget replacements** were made:
  - `coordinate-proofs/cx-01-03#i1`: `distanceGrid` → `coordinateProofLab`;
  - `triangle-congruence/tc-01-01#i1`: `triangleSolve` → `triangleConstraintLab`;
  - `solid-geometry/sg-03-01#i1`: `volumeBuilder` → `solidSliceLab`.
- **Zero unintended authored-content changes** were found.

Lesson order, non-target answers, figures, prior variant declarations, and unrelated course content remain unchanged.

## Verification results

### Geometry compiler gates

- **186,300** deterministic focused builds;
- **186,300** independent prompt/state checks;
- **86,940** production-evaluator builds;
- **611,214** evaluator assertions;
- all nine Geometry courses runtime-complete;
- Geometry at **487/487**.

A final post-integration smoke rerun adds **7,452** focused builds, independent checks, and evaluator builds with **52,366** assertions.

### Geometry causal-learning gates

- **three** new causal engines;
- **nine** course flagships;
- **29** direct manipulatives reviewed and explicitly wired;
- **18** targeted evaluator assertions for valid and misconception states;
- **eight** independent Geometry-state checks;
- strict CML validation with **0 errors**.

### Whole-repository gates

- **417 generators**;
- **262,200** whole-registry deterministic builds;
- **1,157 callable base independent routes**;
- **3,620 declarations** with **54,300** cross-band declaration checks;
- **39,330** registered generator/form/band builds;
- native integrity and registration pass;
- all **1,227 content JSON files** parse;
- all modified TypeScript-family files pass syntax transpilation;
- the Geometry semantic lock passes with zero unauthorized drift;
- the 45-script legacy Geometry verifier suite has **29 passing and 16 pre-existing stale failures in both Session 93 and Session 94**, with **zero status regressions**.

## Remaining verification boundary

The dependency-free release suite is green. A package restore was attempted, but the configured npm registry returned HTTP 503 errors and did not provide a complete dependency tree. Therefore the package-backed Next.js typecheck, full Vitest suite, schema/pedagogy commands that require installed packages, production build, Playwright, and dependency audit are not claimed as executed. The partial dependency directory was removed before packaging.

## Next efficient step

The strongest next compiler target is the remaining Grade-12 conic/parametric sequence because it is compact, representation-heavy, and can reuse the new coordinate and transformation infrastructure. A separate follow-up should then deepen the 20 supporting Geometry manipulatives into multi-step causal sequences only where evidence shows that a flagship-level treatment adds mastery value.
