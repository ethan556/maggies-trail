# S208 — content-change ledger

**No authored lesson content file was changed.** Zero conversions, zero insertions, zero edits.
Hash proof over all 1,701 authored lessons passed twice this session (after Wave 1 and after
Wave 2) against `SESSION205_LESSON_HASHES.json`, and was independently re-verified by the delta
reviewer hashing all 1,701 files directly.

## One learner-visible BEHAVIOR change on authored content (zero file edits)

`tse-03-02` (`−5(x + 3) = −20`, two-step-equations, step 6): the W2-B evaluator fix
(`src/lib/evaluate.ts` — standing negative-bracket weight now carries the multiplier's sign)
makes the previously dead `unexpandedFeedback` branch reachable. A learner submitting at the
unexpanded start now sees the lesson's own authored `unexpandedFeedback` ("The pan balances, but
tiles locked inside a group cannot be moved one at a time…") instead of the contradictory
`unbalancedFeedback` ("The beam tipped…") that fired while the on-screen beam sat level.
This is a grader bug fix restoring the authored copy's intent; the lesson JSON is byte-identical.
No other lesson is affected: `tse-03-02` is the only authored solveBalance spec with a negative
multiplier (parsed sweep, 28 spec instances across 19 files), the fix is structurally inert for
`groups === 0` and `count > 0`, and zero correctness verdicts change anywhere (the `correct`
verdict is only reachable when all groups are expanded, where the sign factor multiplies zero).

## Environment observation

`content/courses/curve-analysis/lessons/ca-01-03.json` acquired a session-time mtime (19:36,
during the src/app+src/server vitest batch) but is **byte-identical** to the sealed manifest
(sha256 verified directly, and by the reviewer's full-corpus hash). A test appears to rewrite
the file with identical bytes. `SESSION151C_CONTENT_CHANGE_PROOF.json`'s session-time mtime is
the `hash:proof` gate writing its own output artifact — expected.

## Everything else

All other S208 output is platform/presentation code (`src/lib/mmip/*` new module family,
`src/components/widgets.tsx` SolveBalanceW + LineExploreW, `src/lib/evaluate.ts` fix), tests,
and documentation (`docs/MMIP_V1_API.md`, `docs/RSG_DESIGN.md`,
`SESSION208_INTEGRATION_REVIEW.md`, this ledger, the execution report, `CO_WORK_PLAN.json`).
`scripts/engine-capabilities.json` was deliberately not modified: no rating change was claimed
or earned by rubric evidence this session (MMIP adds capability but the adjudication of any
rating lift is left to a dedicated pass with the S205M rubric, per the closed-shortcuts rule).
