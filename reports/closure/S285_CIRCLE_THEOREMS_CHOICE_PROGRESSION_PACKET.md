# S285 Circle Theorems — source-local choice and progression packet

Scope is confined to eight lesson JSON files in `content/courses/circle-theorems/`, an idempotent repair, and a focused regression.

- 10 P1 `CHOICE_SURFACE_INTEGRITY` rows have comparable option-label length and explanation density, while option IDs, correctness, feedback, and evaluator fields are preserved.
- 1 P1 `LESSON_PROGRESSION_AND_DUPLICATION` row (`cr-05-02/k2`) now frames sector area as a transfer task with an area-versus-arc-length constraint. Its answer `62.83`, tolerance `0.05`, common errors, and feedback are unchanged.
- Generic lesson-disposition, visual-disposition, and grade-language review rows remain explicitly outside this source-local packet.

Run `node scripts/session/s285-circle-theorems-choice-progression-repair.mjs --check`, `node scripts/session/s285-circle-theorems-choice-progression-guard.mjs`, and `npx vitest run src/lib/session285.circleTheoremsChoiceProgression.test.ts`. Do not regenerate global queue, review cards, planning, or cache until every concurrent source packet has frozen.
