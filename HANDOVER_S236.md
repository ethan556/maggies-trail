# Handover to Session 236

Session 235 changes the product-wide interaction contract: a correct answer saves the graded checkpoint but does not lock the model. Landing, lessons, review, and practice now permit ungraded post-verdict manipulation and state checks.

## Current truth

- Landing equal-groups domain: 0–8 groups, target 5, four berries per row.
- Correct state remains editable; learners can check 6–8 as high wrong states and 0–4 as low wrong states.
- LessonPlayer and QuizShell preserve the original result exactly once while supporting `Check this state` afterward.
- 127/127 engines inherit the shared unlock/recheck contract.
- 17 engine families remain open for richer reversible/direct play; see `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv`.
- Illustration replacement queue remains separately open at 1,078 placements.

## Next bounded work

Start with the highest-frequency engine-specific `REMEDIATE_ENGINE_PLAY` rows. For each engine, prove a reversible correct state plus at least one alternate wrong state; for continuous domains, include meaningful states on both sides of the target when mathematically valid. Do not change curriculum truth or grading evidence to manufacture playfulness.
