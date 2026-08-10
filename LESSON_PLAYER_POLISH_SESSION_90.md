# Session 90 — Lesson Player Polish and Manipulative Fit

## Executive result

Session 90 converts the Session 89 causal-mastery foundation into a quieter, more focused lesson experience. The work does not increase widget count for its own sake. It makes the mathematical stage dominant, hides secondary instructional detail until needed, strengthens the app's semantic color grammar, and replaces five response-heavy lesson steps with direct mathematical construction.

The release is designed to exceed the public interaction patterns of leading K–12 mathematics products in specific product dimensions: synchronized representations, process-aware revision, explicit invariants, counterfactual experimentation, fading, transfer, and delayed retrieval. This is a design and implementation claim, not yet an efficacy claim; controlled learner studies remain necessary before claiming superior learning outcomes.

## Market benchmark translated into product requirements

Public product materials reviewed in July 2026 show several strong patterns:

| Public benchmark | Strong public pattern | Session 90 response |
| --- | --- | --- |
| Brilliant | Guided visual discovery, short interactive steps, immediate consequences, state-aware support | Preserve one mathematical focus at a time, but add synchronized representations, explicit invariants, visible revision, counterfactuals, fading, transfer, and delayed retrieval. |
| DreamBox | Adaptation based on how a learner solves, not only final correctness | Capture learner actions, first build, revision path, and semantic process events; keep strategy evidence visible to the adaptive layer. |
| IXL | Broad curriculum coverage, personalized recommendations, and actionable progress data | Retain full standards coverage while making mastery evidence distinguish exposure, supported practice, independence, retention, and transfer. |
| Amplify Desmos Math | Problem-based mathematical thinking through interactive representations and classroom discourse | Make the learner construct the mathematical object, coordinate representations, and explain the invariant rather than merely inspect a polished visualization. |
| Khan Academy | Mastery progression and spaced review | Connect the CML cycle to delayed retrieval and novel transfer rather than ending evidence at immediate lesson completion. |

## Lesson-player redesign

### 1. Progressive disclosure replaces persistent instructional chrome

The Session 89 causal panel was instructionally rich but visually dominant. Session 90 collapses it by default into a compact **Mastery lens**. The collapsed state shows only:

- the current CML stage;
- the immediate action goal;
- up to three linked-representation previews;
- one clear expand control.

The full lab opens only when the learner needs explanation, revision, counterfactuals, translation, or transfer. This protects the mathematical workspace from becoming a dashboard.

### 2. One active representation at a time

The expanded representation mesh no longer presents a dense six-card grid. Learners select one focused representation tab at a time while retaining compact evidence that other views are linked. This reduces split attention while preserving the ability to translate among concrete, diagrammatic, tabular, symbolic, graphical, and verbal forms.

### 3. A calmer visual hierarchy

The player now establishes this order:

1. lesson intent;
2. mathematical prompt;
3. learner action stage;
4. feedback or prediction;
5. optional mastery lens;
6. one primary navigation action.

Secondary information uses lower-contrast borders and quieter surfaces. XP is compressed to a small accessible chip. The footer uses one dominant action rather than competing controls.

### 4. Semantic mathematical color grammar

Color now has a stable instructional meaning across the lesson player and CML layer:

- **Sky blue — learner action:** the object, value, or representation currently being changed.
- **Tangerine — target or prediction:** the anticipated outcome or current goal.
- **Leaf green — invariant or confirmed relation:** what remains mathematically true.
- **Berry — repair:** contradiction, misconception, or state needing revision.
- **Violet — transfer:** generalization, new context, or delayed retrieval.

Labels, icons, borders, and shape changes remain present so color is never the only carrier of meaning. Light and dark themes receive distinct stage surfaces rather than forcing a white canvas in dark mode.

## Lesson-specific manipulative upgrades

### Grade 2 ruler measurement — `measure-money-time / mmt-01-01`

Three numeric-entry steps now use `numberLineHop`. Learners iterate equal units from the starting mark to the ending mark, making the measured distance visible. This directly attacks the common error of reporting the ruler's final label instead of counting the intervals.

**Why reuse was appropriate:** the number-line engine already represents equal spatial intervals, supports learner action, and preserves the lesson's objective without introducing a narrowly branded ruler widget.

### Grade 5 quadrilateral families — `coordinate-geometry / cg-03-02`

The opening rectangle-recognition MCQ now uses `quadDrag`. Learners construct a rectangle while live evidence exposes equal opposite sides, right angles, and diagonal behavior. The lesson adds a complete CML contract: invariant, near-miss, explanation, counterfactual, translation, fading, transfer, and delayed retrieval.

**Why this is stronger:** a rectangle is understood as a constrained family of shapes, not as a memorized picture.

### Grade 8 function definition — `functions-g8 / fg-01-03`

The opening MCQ now uses `plotPoint`. Learners place `(3,2)` and `(3,5)` to create two outputs for one input and physically produce a vertical-line-test failure.

**Why this is stronger:** the definition of function becomes a constructed violation of the one-output-per-input invariant rather than a vocabulary check.

## Representation-mesh expansion

Session 89 specialized 414 of 447 profiled K–8 manipulative steps. Session 90 reaches **452 of 452** profiled steps with mathematically specific adapters and no generic fallback shell.

New or completed mesh coverage includes:

- algebra tiles;
- mixed regrouping and column calculation;
- nets and transformations;
- fraction-of-a-set and bar construction;
- dot plots and box plots;
- probability areas, spinners, trees, sampling, shuffling, and distribution tools;
- distance grids and dilation;
- quadrilateral construction.

Each adapter exposes a linked mathematical view appropriate to its canonical state rather than a decorative generic card.

## Additional manipulatives appropriate for future lesson conversion

These are recommended next; they were not created in Session 90.

### 1. Line-relation construction lab — Grade 4 Lines & Angles

Target `la-02-01`, `la-02-02`, and `la-02-03`. Learners should drag or rotate two lines, preserve or break parallelism/perpendicularity, and see slope, angle, and distance invariants update together. Existing recognition-heavy tasks would become construction and counterexample tasks.

### 2. Triangle-angle-sum deformation lab — Grade 4

Target `la-03-02`. Learners drag any vertex while all three angle measures update continuously and the sum remains invariant. A tear-and-rearrange or parallel-line proof view should be available after prediction, not before.

### 3. Continuous vertical-line scanner — Grade 8 Functions

The new plot-point construction is an appropriate first upgrade. A later `verticalLineScan` mode should let learners sweep a vertical line across discrete and continuous graphs, record intersection count, and generate a counterexample. This should preferably extend the graph/function kernel rather than create an isolated engine.

### 4. Covariation scrubber — Grades 6–8 Ratios and Functions

One draggable input should update context, table, graph, equation, and rate simultaneously. Learners should predict direction and magnitude before scrubbing, then manually translate one state into another representation.

### 5. Sampling-design and bias laboratory — Grades 6–8 Statistics

Learners should construct a sampling plan, run repeated samples, alter sample size or selection method, and observe bias and variability separately. This would move statistics beyond reading pre-built plots.

### 6. Non-coordinate shape-family builder — Grades 2–4

Younger learners need an attribute-first builder that supports sides, vertices, parallel pairs, right angles, and equal-length constraints without requiring coordinate-plane fluency. It should share the spatial-invariant kernel with `quadDrag` while presenting a developmentally simpler view.

### 7. Unit-iteration ruler mode — K–2 Measurement

The reused number-line engine is mathematically appropriate now. A dedicated ruler mode becomes worthwhile only if learner studies show that endpoint labels, zero alignment, gaps, overlaps, or nonstandard units require richer process telemetry.

## Clutter-control rules for future authoring

A lesson should not display every possible support simultaneously. Apply these defaults:

- one primary task per screen;
- one active representation, with linked alternatives behind tabs;
- prediction collapsed after commitment unless needed for comparison;
- feedback adjacent to the action that caused it;
- explanation only after meaningful evidence exists;
- no more than one primary and one secondary navigation action;
- hints reveal progressively rather than occupying permanent space;
- decorative illustration must not compete with the mathematical object;
- response formats such as numeric entry and MCQ remain visually quiet and are not labeled as manipulatives.

## Competitive interpretation

Session 90 now combines features that public market leaders usually emphasize separately:

- Brilliant-style guided visual interaction;
- DreamBox-style attention to strategy and action path;
- Desmos-style linked mathematical representations and problem-based construction;
- Khan-style mastery and delayed review;
- IXL-style broad curriculum completeness.

The distinctive Maggie's Trail layer is the complete causal cycle: prediction, construction, visible consequence, explanation, revision, generalization, representation fading, transfer, and delayed retrieval. The release establishes that architecture and deepens selected lessons. It does not by itself prove superior learning outcomes; that requires comparative usability and delayed-transfer studies with students.


## Verification limitation

A bounded package restore stalled silently in this environment. The orphaned process and partial dependency tree were removed. Dependency-free integrity, semantic, evaluator, registry, and clean-room gates are complete; package-backed Next.js, Vitest, lint, production-build, Playwright, and npm-audit gates remain explicitly unverified.
