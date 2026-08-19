# S251 Fluency Within 20 G2 Whole-Course Repair

Status: implemented; authoritative evidence regeneration and independent lesson dispositions pending.

## Scope

- Course: `fluency-20-g2`
- Lessons: 14
- Queue baseline: 84 rows
- Source-controlled targets: 28 illustration replacements and 14 progression/duplication rows
- Human-authority targets: 14 visual, 14 language, and 14 whole-lesson dispositions

## Repairs

- Replaced every generic `number-track` concept binding with a registered, topic-aligned figure.
- Kept the two concepts in each lesson visually distinct and synchronized body/narration.
- Replaced every second cloned interaction with a different `tapDiagram` response job.
- Diversified the three later response prompts in every lesson, eliminating exact and number-normalized same-sitting collisions.
- Normalized numeric success and fallback feedback to the authored evaluator truth.

## Expected queue effect

After visual and progression evidence regeneration, the 42 source-controlled rows should close. The remaining 42 generic review rows require signed lesson-level authority; any `REVISE` verdict must preserve an explicit implementation row.

## QA contract

`src/lib/session251.fluency20G2CourseIntegrity.test.tsx` checks all lessons, widgets, figures, prompt diversity, evaluator agreement, and feedback. `scripts/audit/repair-fluency-20-g2-s251.mjs --check` is the idempotent source seal.
