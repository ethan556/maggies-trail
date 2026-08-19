# S263 — Add Three Numbers G1 whole-course repair

## Scope and outcome

This source-local packet repairs all ten `add-three-numbers-g1` lessons. It replaces the repeated
`count-on-hops` placeholder that had been attached to every main concept and separates the cloned
retry activities that produced the progression backlog. Stable lesson, step, and MCQ-option IDs are
preserved; no queue, review-authority, cache, registry, or renderer file is changed.

| Source-controlled workstream | Before | After | Repair |
| --- | ---: | ---: | --- |
| `ILLUSTRATION_REPLACEMENT` | 20 | 0 | Rebound each c1/c2 concept to a registered, accessible semantic model. |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 10 | 0 | Replaced each exact i2 clone with a distinct learner-repair state and diversified the named follow-up jobs. |

The expected serial queue refresh is **60 → 30**: the remaining three lesson-level review streams
(`VISUAL_FIRST_REPRESENTATION`, `GRADE_LANGUAGE_REVIEW`, and `LESSON_COMPLETE_DISPOSITION`) require
an independent current-hash disposition and are intentionally not self-closed.

## Representation decisions

- Joining three groups uses part–part–whole bars and a staged make-ten bridge.
- Ten-partner lessons use ten frames and the make-ten bridge.
- Double-first lessons use a mirrored double and a near-double model.
- Strategy-selection lessons use the four-tool and name-the-tool visuals.
- Missing-addend lessons use an equality balance and a part–whole gap model.

The repair deliberately uses no number-line placeholder and does not attach a fixed numeric diagram
to a learner-visible claim with contradictory quantities. Every selected figure is registered,
renders an SVG `role="img"` with a title, and passes the shared figure-text alignment gate.

## Progression repairs

Each `i2` remains the same interaction family as its `i1` counterpart, preserving interaction
accessibility and evaluator shape, but now begins from a different meaningful state: a different
ten-partner pair, known double, grouped pair, story total, or missing-part state. The targeted
follow-up checks/challenges use different question jobs rather than merely relabelling the same
calculation.

## Verification

- `node scripts/audit/repair-add-three-numbers-g1-s263.mjs --check` — current, 10 lessons.
- `pnpm exec vitest run src/lib/session263.addThreeNumbersG1CourseIntegrity.test.tsx` — 4/4 passed.

Broader source-gate results are added after the shared corpus checks complete.
