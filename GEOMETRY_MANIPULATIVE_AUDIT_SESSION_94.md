# Geometry manipulative audit and laboratory integration — Session 94

## Audit decision

Session 94 reviewed every interactive step in the nine-course Grade-10 Geometry sequence and applied a strict distinction:

- **321 interactive steps** total;
- **29 true mathematical manipulatives**;
- **292 response/reveal surfaces** that remain useful interactions but are not causal manipulatives;
- **29/29 direct manipulatives** now explicitly wired to the CML system;
- **nine flagships**, one per course;
- **20 supporting wires**;
- **three new laboratories**, created only where no existing engine expressed the required causal structure.

This avoids the common failure mode of counting every clickable control as a manipulative while still ensuring that every genuine Geometry engine participates in prediction, action, consequence, explanation, transfer, and retrieval.

## Course inventory

| Course | Interactive | Direct manipulatives | CML wired | Flagship | Supporting |
|---|---:|---:|---:|---:|---:|
| Circle Theorems | 30 | 12 | **12** | 1 | 11 |
| Constructions & Proof | 39 | 2 | **2** | 1 | 1 |
| Coordinate Proofs | 31 | 2 | **2** | 1 | 1 |
| Geometry Foundations | 41 | 4 | **4** | 1 | 3 |
| Polygons & Quadrilaterals | 30 | 3 | **3** | 1 | 2 |
| Right Triangles & Trigonometry | 30 | 2 | **2** | 1 | 1 |
| Similarity | 45 | 2 | **2** | 1 | 1 |
| Solid Geometry | 30 | 1 | **1** | 1 | 0 |
| Triangle Congruence | 45 | 1 | **1** | 1 | 0 |
| **Total** | **321** | **29** | **29** | **9** | **20** |

## Engine portfolio after Session 94

| Engine | Uses | Decision | Causal role |
|---|---:|---|---|
| `circleMeasureExplore` | 7 | Reuse and wire | Radius/angle changes coordinate circumference, arc, and sector measures. |
| `circleAngleExplore` | 5 | Reuse and wire | Move points and test inscribed, central, tangent, and cyclic angle relationships. |
| `compassConstruct` | 2 | Reuse and wire | Construct loci and invariants through valid compass/straightedge moves. |
| `distanceGrid` | 1 | Reuse and wire | Build distance from coordinate differences and a right-triangle decomposition. |
| `transformExplore` | 2 | Reuse and wire | Test rigid-motion invariants and coordinate rules. |
| `plotPoint` | 2 | Reuse and wire | Connect coordinate placement to geometric claims. |
| `quadDrag` | 3 | Reuse and wire | Deform quadrilaterals and test necessary/sufficient family constraints. |
| `triangleSolve` | 2 | Reuse and wire | Coordinate side, angle, ratio, and Pythagorean relationships. |
| `dilationExplore` | 2 | Reuse and wire | Track scale factor, center, proportional lengths, and preserved angles. |
| `triangleConstraintLab` | 1 | **New** | Test whether a congruence criterion determines a unique triangle. |
| `coordinateProofLab` | 1 | **New** | Assemble coordinate proof from independently visible invariants. |
| `solidSliceLab` | 1 | **New** | Compare cross-sections at matching heights and derive equal volume. |

## Why the three new engines were necessary

### Congruence constraints

The existing `triangleSolve` engine is strong for solving side-angle relationships, but it does not expose the central congruence question: whether the givens determine a unique triangle. `triangleConstraintLab` adds criterion switching, live candidate counts, SSA ambiguity, and a second-triangle test. It therefore teaches the logical sufficiency of SSS/SAS/ASA/AAS/HL instead of only rehearsing their names.

### Coordinate proof

The existing `distanceGrid` engine visualizes distance well, but coordinate proof requires several invariants to converge on one claim. `coordinateProofLab` lets the learner reposition a vertex and independently reveal slope, midpoint, and distance evidence. The final state is accepted only when the geometry and the required proof evidence agree.

### Cross-sections and Cavalieri

The existing `volumeBuilder` supports composition and volume accumulation but not continuous section-plane reasoning. `solidSliceLab` adds a movable plane, shape-specific section behavior, an equal-base-area comparison solid, repeated-height evidence, and a Cavalieri conclusion.

## Wiring standard

A direct Geometry manipulative is considered fully wired only when it is represented across the production stack:

1. schema validation;
2. widget rendering and sample state;
3. interaction-event processing;
4. state narration and accessibility description;
5. production evaluation and expected-state explanation;
6. pedagogy classification and stage sizing;
7. CML engine catalog;
8. representation mesh;
9. lesson-level prediction/explanation/transfer metadata where appropriate.

The three new engines satisfy all nine layers. Existing Geometry engines were added to the same classification and audit paths rather than handled as one-off exceptions.

## Flagship versus supporting treatment

Flagship status is reserved for the one course interaction that best exposes the domain’s central causal structure. It carries the full sequence: predict, manipulate, observe, explain, revise, translate representations, fade support, transfer, and retrieve later.

Supporting wires receive explicit engine profiles, invariants, misconceptions, and representation behavior but do not duplicate the full flagship ceremony. This keeps the lesson player focused and prevents “interactivity” from becoming extra chrome.

## Quality findings

### Strengths retained

- Circle geometry already has the deepest Geometry engine concentration and now gains consistent CML semantics across all 12 manipulatives.
- `quadDrag`, `transformExplore`, and `dilationExplore` already embody high-value dynamic invariants and are reused rather than replaced.
- `compassConstruct` preserves procedural authenticity: the learner creates the proof object rather than selecting a construction name.
- The Geometry lesson content remains stable; Session 94 changes the practice refresh layer and the causal interaction layer without broad text rewriting.

### Remaining opportunities

- The 20 supporting manipulatives are correctly wired but remain shorter than the nine flagships. Future upgrades should be evidence-led, not an automatic conversion of every interaction into a long sequence.
- The 292 non-manipulative interactive surfaces should remain classified separately. Some may benefit from better feedback or representation links, but adding drag behavior alone would not make them conceptually stronger.
- Solid Geometry now has a strong section/Cavalieri flagship, but future high-value additions could include rotational solids and net-to-solid folding only when the lesson sequence can demand prediction and spatial proof rather than animation watching.
- Coordinate Proofs can later reuse the new proof-evidence architecture for circles, perpendicular bisectors, and locus arguments.

## Audit result

`GEOMETRY_CML_AUDIT_SESSION_94.json` records **100% explicit CML coverage of direct Geometry manipulatives**. `SESSION94_SEMANTIC_DIFF.json` records only the 410 declaration additions, 29 CML additions, four new predictions, and three intentional widget replacements, with zero unintended content drift.
