# S314 — Grade 1 Measurement Choice-Order Parity

## Source evidence

The fresh queue retains open P1 source work for the clean `measure-length-g1` course. Full source auditing establishes a concrete course-level answer-position defect: all 22 main learner-facing MCQs across 10 lessons have stable `o0`–`o3` option IDs and exactly one stable correct option (`o0`) authored first in every array.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `f42ac4a5b5c86e6140be1124bb6419a0f99d9995f3b39c7b61737d83232dd4a2`.

## Repair

All 22 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in an 8/7/7 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

The local replay guard seals the exact 22-item inventory and accepts only the pre-repair or expected repaired order. Its regression also seals an order-independent aggregate semantic hash over every prompt, figure binding, and option payload, plus every evaluator outcome.

The repaired source-set SHA-256 is `3d236a6adc131b44a1b8bc0bb684384daf3f30e317dbaaa8621addc90907a9af`.

## Boundaries

Only the 10 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.
