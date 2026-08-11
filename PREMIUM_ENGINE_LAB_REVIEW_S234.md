# Session 234 — Premium engine/lab review and landing equal-groups rebuild

## Outcome

The landing interaction now represents the mathematics it asks for. It begins with one visible row of four berries, exposes five named group rows, updates `groups × 4 = total` with every move, and can be completed with direct Add/Remove controls instead of requiring a range slider. The production evaluator still owns correctness and diagnostic feedback.

The shared slider engine also now provides 44 px decrement/increment controls, retains the native keyboard range, exposes equal groups as an accessible list, and labels row groups visibly. This improves all 28 authored slider placements; the four `visual: "groups"` lessons receive the group-specific list and control treatment.

## Root cause

The former landing specification used `target: 20` without `groupSize: 4`. The generic groups renderer therefore interpreted the value `4` as four one-item groups. The prompt described five groups of four while the visible state showed four empty-looking containers. This was a semantic model defect, not a styling preference.

## Full engine/lab review

The current `PREMIUM_ENGINE_PRIORITY.csv` audits all 127 registered engines against authored frequency, grade reach, manipulation, visible consequence, error model, adaptation, accessibility, mobile behavior, and polish.

| Decision | Engines | Current disposition |
|---|---:|---|
| KEEP | 107 | Retain; verify through regression and lesson-specific review. |
| REDESIGN | 15 | Open, ranked remediation work. |
| POLISH | 3 | Open, lower-risk targeted refinement. |
| DEPRECATE_CANDIDATE | 2 | Review usage and migration before removal. |

Highest-priority redesign families remain `exactNumberLab` (358 uses), `buildExpression` (232), `dragBucket` (182), `matchPairs` (175), `dragOrder` (93), `numeric` (4,665), `mcq` (3,293), `steppedReveal` (54), `fractionEntry` (46), `placeCompare` (28), `rationalCompare` (28), `pointEntry` (18), `subitizeFlash` (18), `absValueLine` (3), and `fractionCompare` (3). Their ranking remains learner harm × frequency × visibility × strategic importance; this session does not misrepresent a corpus-wide redesign as complete.

## Open replacement coverage

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` now contains one individually addressable row for every withheld illustration placement:

- 1,078 total open replacements
- 962 P0 and 116 P1 after deterministic harm/frequency/visibility/strategic ranking
- status on every row: `OPEN_REPLACEMENT_REQUIRED`
- top repeated families: `count-on-hops` 793, `bar-compare` 84, `number-track` 65

Suppression remains a safety containment only. A queue item closes only after a concept-specific replacement is created or selected and its visible copy and accessible description are verified together.

## Verification evidence

- Hero interaction tests: direct group/total consequence, production success feedback, native keyboard controls, and 44 px targets.
- Shared widget keyboard suite: PASS.
- Adversarial illustration audit: 3,816 placements checked; 1,078 open replacement rows regenerated.
- TypeScript: PASS.
- Production build: PASS; existing warnings remain non-blocking and unrelated.
- Local production browser: initial state `1 of 5 groups built; 4 berries in all`; completed state `5 of 5 groups built; 20 berries in all`; success feedback verified.
- Screenshots: `PREMIUM_REBUILD_SCREENSHOTS_S234/02-landing-group-model.png` and `03-landing-five-groups.png`.

## Reopen conditions

Reopen the landing defect if group count, berries per group, equation, accessible state, and evaluator target ever disagree. Reopen the shared slider work if keyboard/direct controls diverge or a group visual becomes an unlabeled flat collection. Keep illustration replacement coverage open until all 1,078 rows have truthful replacements.
