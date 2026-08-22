# S256 Measure Problems Grade 4 Whole-Course Repair

## Scope and source inventory

- Course: `content/courses/measure-problems-g4`
- Lessons audited and normalized: 12/12 (`g4v-01-01` through `g4v-03-04`)
- Authoritative incoming queue rows: 72
- Source-controlled incoming rows: 36
  - `ILLUSTRATION_REPLACEMENT`: 24
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 12
- Assessor-controlled incoming rows: 36
  - `VISUAL_FIRST_REPRESENTATION`: 12
  - `GRADE_LANGUAGE_REVIEW`: 12
  - `LESSON_COMPLETE_DISPOSITION`: 12

## Authoritative source closures

This batch closes all 36 source-derived rows:

- 24/24 withheld `count-on-hops` placements were replaced with registered, accessible semantic figures for metric length, unit conversion, ratio tables, mass, liquid volume, time, elapsed time, equal-groups adjustments, money, fractional line plots, and two-step diagrams.
- 12/12 progression and duplication causes were closed. Every lesson now has a genuinely different second interactive model, and the later checks have distinct application, retrieval/diagnosis, and transfer jobs. Exact prompts, number-normalized prompts, and full widget payloads are unique within every lesson.

The full-course contract audit also repaired two release-grade evaluator defects. The fractional-unit lesson had graded a point at `2/4` while claiming that eight quarter-units made two wholes; it now uses a whole-unit line with quarter-unit steps and exact targets of 2 and 3 wholes. The distance and interval estimate sliders previously accepted excessively broad multiplicative ranges; they now use bounded, misconception-specific discrete choices. The audit also corrected the money bar's false “tens of dollars” unit, replaced an unrelated mass question in the time lesson and an unrelated distance question in the money lesson, made remainder and equal-group fallback feedback task-specific, and replaced templated CML claims with lesson-specific invariants and misconceptions. Stable lesson, step, and option IDs and evaluator correctness were preserved.

## Residual queue

- Source-controlled residual: 0
- Assessor-controlled residual: 36 review/disposition rows
- Expected residual after source reconciliation: 36

No generic visual-first, grade-language, or complete-lesson disposition row is self-closed by this source batch.

## Evidence

- Idempotent repair: `node scripts/audit/repair-measure-problems-g4-s256.mjs --check`
- Current source seal: `f85d65a39120ba58aeedb692060d430c7b4816d6b259e88410d549dba480efd6`
- Focused aggregate regression: `src/lib/session256.measureProblemsG4CourseIntegrity.test.tsx` — 5/5 passing
- Full content schema: 1,711/1,711 files valid
- Full pedagogy lint: 1,711/1,711 files clean
- Strict CML lint: 0 errors, 0 warnings

The aggregate regression verifies every lesson schema and widget contract, all 24 exact registered accessible figures, course-wide exact/normalized/payload progression distinctness, evaluator agreement for all six widget types used by the course, stable MCQ IDs and correctness, and the audited quarter-unit, estimate-range, context, and language corrections.
