# S254 Division Fluency Grade 3 Whole-Course Repair

## Scope and source inventory

- Course: `content/courses/division-fluency-g3`
- Lessons audited and normalized: 12/12 (`df3-01-01` through `df3-03-04`)
- Authoritative incoming queue rows: 73
- Source-controlled incoming rows: 37
  - `ILLUSTRATION_REPLACEMENT`: 24
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 11
  - `CHOICE_SURFACE_INTEGRITY`: 2
- Assessor-controlled incoming rows: 36
  - `VISUAL_FIRST_REPRESENTATION`: 12
  - `GRADE_LANGUAGE_REVIEW`: 12
  - `LESSON_COMPLETE_DISPOSITION`: 12

## Authoritative source closures

This batch closes all 37 source-derived rows:

- 24/24 generic illustration placeholders were replaced with registered, accessible semantic figures for fair shares, group counting, arrays, fact families, missing factors, special cases, and operation choice.
- 11/11 progression and duplication causes were closed. Every queued lesson now moves through a second modeled case, inverse-fact reasoning, retrieval without the model, and final transfer; exact prompts, number-normalized prompts, and widget payloads are distinct.
- 2/2 choice-surface rows were repaired in `df3-03-02`. Stable option IDs, evaluator correctness, and diagnostic feedback were preserved, while the labels now use parallel answer-and-reason constructions with a bounded length spread.

The full-course truth audit also qualified inverse-operation claims to exact whole-number division with a nonzero divisor, replaced misleading digit-shift and disappearing-zero language for division by ten with unitized tens reasoning, qualified the self-division rule to nonzero numbers, and stated that division by zero is undefined. Learner-visible answers, evaluators, and feedback remain aligned.

## Residual queue

- Source-controlled residual: 0
- Assessor-controlled residual: 36 review/disposition rows
- Expected residual after source reconciliation: 36

No generic visual-first, grade-language, or complete-lesson disposition row is self-closed by this source batch.

## Evidence

- Idempotent repair: `node scripts/audit/repair-division-fluency-g3-s254.mjs --check`
- Current source seal: `ae4046be6105f508e6cfb3ecec9f9fc97ecaa90fa365f1cec809e05269e3fdc4`
- Focused aggregate regression: `src/lib/session254.divisionFluencyG3CourseIntegrity.test.tsx` — 5/5 passing
- Full content schema: 1,711/1,711 files valid
- Full pedagogy lint: 1,711/1,711 files clean
- Strict CML lint: 0 errors, 0 warnings
- CML integration: 1,701 lesson JSON files parsed; 18 flagship pilots and 91 direct-engine profiles
- TypeScript: clean
- ESLint: 0 errors (450 pre-existing repository warnings; no warning in the new S254 files)

The aggregate regression verifies every lesson schema and widget contract, all 24 exact registered accessible figures, course-wide exact/normalized/payload progression distinctness, both choice repairs, numeric and MCQ evaluator agreement, area-model factor truth, and the audited domain and place-value corrections.
