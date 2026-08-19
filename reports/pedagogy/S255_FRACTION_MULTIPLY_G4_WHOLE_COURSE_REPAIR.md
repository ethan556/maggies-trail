# S255 Fraction Multiplication Grade 4 Whole-Course Repair

## Scope and source inventory

- Course: `content/courses/fraction-multiply-g4`
- Lessons audited and normalized: 12/12 (`g4x-01-01` through `g4x-03-04`)
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

- 24/24 withheld `count-on-hops` placements were replaced with registered, accessible semantic figures. The selected representations cover repeated fraction groups, like-denominator collection, unit fractions, improper and mixed forms, equal number-line jumps, fractions past one, and benchmark estimation.
- 12/12 progression and duplication causes were closed. Every lesson now contains a genuinely different second model plus distinct apply, retrieval/diagnosis, and transfer jobs. Exact prompts, number-normalized prompts, and full widget payloads are unique within every lesson.

The full-course truth audit also repaired a systematic fraction-bar defect that described every miss relative to “half” even when the actual target was different or greater than one. It replaced generic “denominator never changes” feedback with task-specific guidance for unsimplified products, mixed-number conversion, improper-fraction conversion, and simplification; qualified the general rule's domain; corrected singular grammar, and repaired the estimation claim for 7 × 5/6 so the concept, choices, remedial, and slider now agree on 35/6 = 5 5/6, about 6. Stable lesson/step/option IDs and evaluator correctness were preserved.

## Residual queue

- Source-controlled residual: 0
- Assessor-controlled residual: 36 review/disposition rows
- Expected residual after source reconciliation: 36

No generic visual-first, grade-language, or complete-lesson disposition row is self-closed by this source batch.

## Evidence

- Idempotent repair: `node scripts/audit/repair-fraction-multiply-g4-s255.mjs --check`
- Current source seal: `b681ccb6cd3c8edc29392405679005ab812c204fa15c236c0537e9f2ab35937f`
- Focused aggregate regression: `src/lib/session255.fractionMultiplyG4CourseIntegrity.test.tsx` — 5/5 passing
- Full content schema: 1,711/1,711 files valid
- Full pedagogy lint: 1,711/1,711 files clean
- Strict CML lint: 0 errors, 0 warnings
- CML integration: 1,701 lesson JSON files parsed; 18 flagship pilots and 91 direct-engine profiles
- TypeScript: clean
- ESLint: 0 errors (450 pre-existing repository warnings; no warning in the new S255 files)

The aggregate regression verifies every lesson schema and widget contract, all 24 exact registered accessible figures, course-wide exact/normalized/payload progression distinctness, evaluator agreement across all five widget types used by the course, and the audited false-target, domain, and language corrections.
