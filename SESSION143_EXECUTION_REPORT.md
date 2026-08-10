# Session 143 corrected execution report

## Reconstruction

Session 143 was corrected by a three-way reconstruction, not by replacing it with Session 144:

1. sealed Session 142 was the common ancestor;
2. `maggies-trail-session-144-verified.tar.gz` supplied the verified S141–142 repair set;
3. the existing Session 143 branch supplied `graphStoryLab` and its lesson conversions.

This preserved the graph-story breakthrough while restoring the corrections documented in `SESSION143-144_ADVERSARIAL_REVIEW.md`.

## Root-cause correction

`ConditionalTableLabSpec` is again a plain `ZodObject` before `z.discriminatedUnion`; its cross-field rules live in `widgetIntegrityErrors`. The same invariant was applied to `GraphStoryLabSpec`, which had repeated the hazardous `.superRefine()` pattern in the earlier Session 143 package.

Recovered fixes include the shared `GhostChip`, unique reveal IDs, signed-fraction `mulDiff` repair and type widening, geometry form-name collision repair, registration/band wiring, learner-answer surfaces, `shapeHierarchyLab` grading/narration/accessibility fixes, composite-area wording, render-query fixes, keyboard gates, structural `gateOne` branches, and the restored `percentChangeLab` generator path.

## Content boundary

The correction-specific authored-content delta is exactly one file and one string:

`content/courses/coordinate-geometry/lessons/cg-04-02.json` → `steps[id=k3].variant.form` → `cgParallelogramTrapezoidVerdict`.

Reverting that string reproduces the sealed Session 142 file bytes exactly. Session 143’s separate graph-story content ledger remains two lesson files, 14 widget nodes, one additive prediction, and zero variant-declaration changes.

## Current-tree execution

- correction audit: 37/37;
- source transpilation: 15/15;
- content JSON: 1,129/1,129;
- lesson hashes: 1,129/1,129;
- signed-fraction generator sweep: 4,608/4,608;
- shape-hierarchy generator sweep: 11,520/11,520;
- conditional-table generator sweep: 9,216/9,216;
- graph-story generator sweep: 9,216/9,216;
- graph-story mutation matrix: 20/20 defects rejected, 2/2 controls accepted;
- registration: 117/117;
- player-harness source contract: 36/36;
- generated freshness: 47/47 byte-stable;
- CML integration: passed;
- native clean-copy integrity: passed.

The exact-lock `npm ci` was attempted and failed in this runtime at the configured registry’s locked `zustand@5.0.14` URL. Therefore this merged tree does not claim a newly executed TypeScript, Vitest, build, or Playwright result. The verified correction donor records tsc 0, Vitest 10,339/10,339, content 1,223/1,223, pedagogy 1,139/1,139, build 0, and Playwright 71/71; those results are retained as donor evidence, not relabelled as current merged-tree execution.
