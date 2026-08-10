# Session 89 — Integrated Causal Mastery Learning for K–8

## Executive result

Session 89 integrates the Causal Mastery Learning (CML) foundation into the complete Session 87 application. It does not create a detached showcase or replace the K–8 curriculum. It adds a shared instructional operating layer to the real lesson player, activates that layer for 45 direct/supporting mathematical engines, deepens eight high-leverage manipulatives, and installs 18 vertical flagship sequences spanning Kindergarten through Grade 8.

The operating cycle is:

> **Predict → Construct → Observe → Explain → Revise → Generalize → Retrieve**

This release implements the architecture and first production-grade vertical slice recommended by the K–8 causal-mastery audit. It is intentionally the beginning of a strand-by-strand conversion, not a claim that all 548 K–8 lessons have already been reauthored into full flagship experiences.

## What is now active system-wide

### 1. CML lesson-player layer

Every step using one of the 45 profiled direct/supporting engines now receives a shared causal-mastery panel. Across K–8, this activates on **447 widget steps** in **548 lessons**. **414 of those steps** now receive mathematically specific multi-representation cards; the remaining low-use engines still receive the shared action, invariant, revision, and evidence shell while their specialized adapters remain in the expansion backlog.

The panel provides:

- a visible seven-stage learning cycle;
- an explicit mathematical action goal;
- declared invariants and misconception targets;
- synchronized representations derived from the live learner state;
- first-build comparison, undo, and restore-first revision controls;
- semantic-action narration where the engine emits process events;
- a causal explanation check;
- counterfactual experimentation prompts;
- representation-translation and transfer targets;
- delayed-retrieval cues for flagship sequences.

The cycle advances from construction to observation, explanation, revision/generalization, and retrieval based on the learner's actual action and explanation state.

### 2. Representation mesh

`src/lib/cml/mesh.ts` translates canonical manipulative state into coordinated mathematical views. Current rich adapters include:

- length comparison;
- tap diagrams;
- ten frames;
- number-line hops and placement;
- base-ten and place-value composition;
- clocks, money construction, parity pairing, and estimation;
- coordinate plotting;
- fraction bars and grids;
- percent bars;
- order-of-operations collapse and inverse pipelines;
- area and volume models;
- ratio tables and double number lines;
- integer chips;
- balance/equation state and hands-on equation solving;
- function machines and line explorers;
- systems of equations;
- scatterplot fitting;
- angle measurement.

The design separates mathematical state from visual state so a learner action can update concrete, diagrammatic, tabular, symbolic, graphical, and language views coherently.

### 3. Common CML metadata and engine profiles

The lesson schema now supports explicit CML metadata:

- stage and flagship status;
- concept kernel;
- action goal;
- prediction connection;
- invariants and misconceptions;
- representation mesh and translation direction;
- revision lineage;
- fading level;
- transfer family and delayed retrieval;
- counterfactual prompt;
- constrained causal explanation.

The engine catalog classifies 45 surfaces without counting numeric entry or MCQ as manipulatives.

## Manipulatives deepened in this release

### Base-ten composition

- Adds legal value-preserving exchanges between ones, tens, and hundreds.
- Emits semantic regrouping and invalid-action events.
- Keeps concrete blocks, place-value structure, and expanded form synchronized.

### Fraction bars

- Adds a live number-line magnitude view.
- Supports equivalent repartitioning and simplification while preserving magnitude.
- Emits partition-aware process evidence rather than interpreting denominator movement naively.

### Integer chips

- Adds explicit zero-pair construction and removal.
- Makes representation change versus net-value change distinguishable.
- Emits semantic events for strategy-aware feedback.

### Area models

- Adds orientation changes that preserve area.
- Coordinates dimensions, equal groups, unit-square count, and product.
- Emits causal process evidence relative to the target.

### Volume builders

- Adds layer reasoning and base rotation while preserving volume.
- Coordinates base area, number of layers, dimensions, and cube count.
- Emits causal process evidence relative to the target.

### Angle measurement

- Emits semantic direction evidence as the ray is moved.
- Supports the invariant that angle size depends on turn, not ray length.

### Function machines

- Adds a nearby input-output table tied to the current rule and input.
- Emits process evidence as inputs change relative to the target relationship.

### Systems explorers

- Measures progress toward the shared solution rather than only checking the submitted point.
- Coordinates graph position, equation satisfaction, and intersection meaning.

## Eighteen flagship vertical pilots

The pilot set spans the most reusable K–8 conceptual kernels:

1. Kindergarten quantity composition — ten frame.
2. Grade 1 make-ten strategy — ten frame.
3. Grade 1 place-value exchange — base ten.
4. Grade 2 fair measurement — length comparison.
5. Grade 2 shape composition — area model.
6. Grade 3 distributive arrays — area model.
7. Grade 3 fraction equivalence — fraction bar.
8. Grade 4 angle invariance — angle measurement.
9. Grade 5 decimal regrouping — column calculation.
10. Grade 5 fraction scaling — fraction bar.
11. Grade 5 coordinate meaning — point plotting.
12. Grade 6 ratio covariation — ratio table.
13. Grade 7 signed-number structure — integer chips.
14. Grade 7 equation transformations — solve balance.
15. Grade 6 distribution reasoning — dot plot.
16. Grade 8 functional covariation — function machine.
17. Grade 8 systems — systems explorer.
18. Grade 8 bivariate association — scatter fitting.

Every flagship includes a falsifiable prediction, direct causal action, explicit invariant, misconception set, at least three representations, translation demand, counterfactual, causal explanation, fading level, transfer family, and delayed retrieval target.

## Integrity and scope

- All **18** intended lesson changes are metadata-only, except for **two prediction commitments** required to complete their cycle.
- A semantic comparison across all **1,129 lesson files** confirms no changes to existing authored prompts, answers, explanations, widgets, figures, variants, or step order outside those allowed additions.
- K–8 runtime coverage remains **2,214/2,214 (100%)**.
- Overall runtime coverage remains **2,713/4,471 (60.68%)**.

## Expansion backlog

Strict CML lint reports **348 non-blocking warnings**, mostly predictions that are not yet followed closely by direct causal manipulation. These warnings are intentionally retained as the measurable conversion backlog. The next phase should convert complete vertical strands rather than adding more isolated engine types.

Recommended order:

1. quantity, equivalence, and operations across K–5;
2. fractions, ratios, and covariation across Grades 3–8;
3. spatial measure and transformations across Grades 2–8;
4. equations, functions, and systems across Grades 6–8;
5. chance, sampling, distributions, and modeling across Grades 5–8.

## Release interpretation

Session 89 moves Maggie's Trail from a broad library of widgets toward a coherent causal-mastery system. The competitive advantage is not the number of animations or manipulatives. It is the combination of live state, synchronized representations, strategy evidence, visible revision, counterfactual experimentation, representation fading, transfer, and delayed retrieval.
