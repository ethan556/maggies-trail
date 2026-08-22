# S253 Measure–Compare Kindergarten Whole-Course Repair

## Scope and source inventory

- Course: `content/courses/measure-compare-k`
- Lessons audited and normalized: 12/12 (`kmd-01-01` through `kmd-03-04`)
- Authoritative incoming queue rows: 76
- Source-controlled incoming rows: 40
  - `ILLUSTRATION_REPLACEMENT`: 24
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 12
  - `CHOICE_SURFACE_INTEGRITY`: 4
- Assessor-controlled incoming rows: 36
  - `VISUAL_FIRST_REPRESENTATION`: 12
  - `GRADE_LANGUAGE_REVIEW`: 12
  - `LESSON_COMPLETE_DISPOSITION`: 12

## Authoritative source closures

This batch closes all 40 source-derived rows:

- 24/24 illustration placeholders replaced with registered semantic figures covering attributes, aligned length, fair starts, seesaw comparison, sorting, group counts, most/fewest, and a new exact same-scoop capacity comparison.
- 12/12 progression and duplication causes closed. Every lesson now has distinct exact, number-normalized, and widget-payload sequences; the cloned `i2` exercises were changed into a second learner job or a deliberate transfer/correction action.
- 4/4 choice-surface rows repaired. Stable option IDs and the original correct option were preserved; repaired label-length spread is at most eight characters.

The batch also corrected learner-visible defects discovered during the full-course audit: unrelated circle feedback on sorting/counting widgets, overbroad measurement claims, claims that a number itself “is” a length, same-unit wording, an “always tell” overclaim, and several capacity/sorting prompts whose surface context did not match their lesson job. Numeric and MCQ evaluator contracts remain valid.

## Capacity blocker closure

A shared-runtime follow-on added `kmd-capacity-same-scoop`, an accessible kindergarten figure showing the same scoop used to test a four-scoop cup and a six-scoop jug. Both `kmd-01-04/c1` and `kmd-01-04/c2` now render this exact fair-test action, so neither row remains blocked.
## Residual queue

- Source-controlled residual: 0
- Assessor-controlled residual: 36 review/disposition rows
- Expected residual after source reconciliation: 36

No generic visual-first, language, or whole-lesson disposition row is self-closed by this source batch.

## Evidence

- Idempotent repair: `node scripts/audit/repair-measure-compare-k-s253.mjs --check`
- Current source seal: `dba3fd41c2bbf90ed64bf7cc6b676ca7c2de520f830cb60b66c2d4795e7872e5`
- Focused aggregate regression: `src/lib/session253.measureCompareKCourseIntegrity.test.tsx` — 6/6 passing
- Full content schema: 1,711/1,711 files valid
- Full pedagogy lint: 1,711/1,711 files clean
- Strict CML lint: 0 errors, 0 warnings
- CML integration: 1,701 lesson JSON files parsed; 18 flagship pilots and 91 direct-engine profiles
- TypeScript: clean
- ESLint: 0 errors (451 pre-existing repository warnings; no warning in the new S253 files)

The aggregate regression verifies all 12 lesson schemas, pedagogy, widget integrity, 24 registered accessible figures, the exact capacity fair-test figure, course-wide prompt/payload collision freedom, four option-parity repairs, evaluator agreement, and the audited truth corrections.
