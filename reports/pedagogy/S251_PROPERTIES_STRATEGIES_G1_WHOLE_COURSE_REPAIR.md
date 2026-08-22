# S251 Properties & Strategies G1 whole-course repair

## Result

- Course: `properties-strategies-g1`, 14/14 lessons.
- Pre-repair queue: **84** rows.
- Source closures after audit regeneration: **42**.
  - `ILLUSTRATION_REPLACEMENT`: 28 to 0.
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 14 to 0.
- Separate current-hash review records close 42 generic review rows while preserving 14 revision-implementation rows.
- Expected global queue: **6,584 to 6,514**, a 70-row net reduction.
- Course source seal: `5d4a75f4bfe98fd24e53ade78d1a5470733b9e15901f4d8fd9417bf951417196`.

## Root-cause repair

All 28 fixed-example `count-on-hops` bindings were replaced by 20 registered semantic figures covering commutativity, bigger-first counting, small count-on/back, doubles, near doubles, make-ten, fact families, equality, and strategy selection. Each concept pair is distinct, narration matches visible prose, and every SVG has an accessible title.

All 14 cloned second interactions are now different `tapDiagram` selection actions. Repeated checks and challenges were rewritten into distinct representations and jobs while preserving evaluator answers and stable MCQ truth. Numeric success/fallback feedback is complete and no longer contains malformed generated prompt-answer strings.

## Guardrails and retained debt

- `scripts/audit/repair-properties-strategies-g1-s251.mjs` is deterministic and idempotent.
- `src/lib/session251.propertiesStrategiesG1CourseIntegrity.test.tsx` checks every lesson, figure, prompt, evaluator, feedback route, schema, and pedagogy contract.
- Remedial routes remain same-family immediate practice, so the disposition is honestly `REVISE / SUFFICIENT / FIT` rather than `KEEP`.
