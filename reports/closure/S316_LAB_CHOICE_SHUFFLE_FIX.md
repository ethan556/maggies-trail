# S316 — Lab choice-order mastery-integrity fix

## Defect (P0, mastery-integrity)

`ProportionalReasoningLabW` and `PercentChangeLabW` in `src/components/widgets.tsx` rendered
`spec.choices` in raw authored order with no seeded shuffle:

```tsx
// PercentChangeLabW (before)
{spec.choices.map((choice) => ( ... ))}

// ProportionalReasoningLabW (before)
{spec.choices.map((choice) => { ... })}
```

`McqW`, in the same file, deliberately seeded-shuffles `spec.options` and carries an in-code
comment explaining why: authored content overwhelmingly writes the correct option first
(measured at 99.8% for mcq), so rendering authored order lets a learner score well by
pattern-matching position instead of reasoning — the mastery signal degrades to "did you press
the first button," not "can you do this."

Authored content for these two engines follows the same convention. Spot-checked authored items
(`content/courses/proportional-relationships/lessons/pr-04-02.json`,
`content/courses/proportional-relationships/lessons/pr-02-01.json`) both list the correct choice
first (`"id": "correct"` / `"id": "a"`). With 12 `proportionalReasoningLab` and 7
`percentChangeLab` steps in the proportional-relationships course alone, those interactions were
100% solvable by always pressing the first button, regardless of whether the learner normalized
a rate or worked out a markup.

## Fix

Applied the exact pattern `McqW` already uses (and that `SignedFractionLabW`, `ScaledCircleLabW`,
`TriangleClosureLabW`, `CompoundEventLabW`, `GeometricConstraintLabW`, and `ShapeHierarchyLabW`
already use for their own `choices`/`options` arrays):

```tsx
const orderedChoices = useMemo(
  () => seededShuffle(spec.choices, seed ?? spec.choices.map((choice) => choice.id).join("|")),
  [spec.choices, seed]
);
```

- `seededShuffle` (`src/lib/prng.ts`) is a Fisher–Yates shuffle driven by `mulberry32` seeded via
  an FNV-1a hash of the seed string — no `Math.random`, no `Date.now`, pure function of the seed.
  Same seed → byte-identical order, forever, per DETERMINISM.md §5.
- `seed` comes from `WProps.seed` (`${lessonId}:${stepId}` at the call site, same as every other
  shuffled widget) and was already threaded through `WidgetRenderer`/`LessonPlayer`/`QuizShell` —
  neither component needed a new prop, only to destructure `seed` and consume it. Falls back to a
  hash of the choice ids when no lesson context is present (dev preview, gallery), matching McqW.
- Both `.map()` calls in the render tree were switched from `spec.choices` to `orderedChoices`.
  Nothing else in either component reads `spec.choices` in a way that depends on rendered
  position (see evaluator-safety argument below).

Diff locations:
- `src/components/widgets.tsx`, `PercentChangeLabW` (~L6827–L6900): added `seed` to the
  destructured props, added the `orderedChoices` memo, swapped the choice-button `.map()` to use
  it.
- `src/components/widgets.tsx`, `ProportionalReasoningLabW` (~L8317–L8390): same pattern.

## Evaluator-safety argument

Read both components' full answer-checking paths and `evaluate.ts`'s handling of these two
widget types:

- **`percentChangeLab`** (`evaluate.ts` case `"percentChangeLab"`, ~L810): `value` is the clicked
  choice's `id` (a string). Evaluation does `spec.choices.find((candidate) => candidate.id ===
  value)` then `percentChangeChoiceCorrect(spec, choice)` — looked up by `id`, never by array
  index or rendered position. `onClick={() => onChange(choice.id)}` in the component only ever
  passes the id of the button that was pressed, and that id is intrinsic to the `choice` object
  captured in the shuffled array's closure — shuffling the array does not change which `choice`
  object a given button's closure holds, only where in the DOM that button sits.
- **`proportionalReasoningLab`** (`evaluate.ts` case `"proportionalReasoningLab"`, ~L1497):
  `value.choiceId` is looked up the same way: `spec.choices.find((candidate) => candidate.id ===
  v.choiceId)`, then graded via `proportionalReasoningChoiceCorrect(spec, choice)` (compares
  `choice.claim`/`choice.value` against the computed truth, again by identity, never position).
  `setChoice(choiceId)` in the component takes the id straight from the button's `onClick`
  closure the same way.
- **Feedback mapping**: both components render `choice.feedback` (percentChangeLab) or derive
  ghost/success text from `spec.choices.find(...)` (proportionalReasoningLab's `correctChoice`,
  used for `answerText`) — both keyed by id/predicate over the *original* `spec.choices`, not by
  index into the shuffled array, so feedback text cannot desync from the choice it describes.
- **Keyboard/announcement order**: neither widget uses `role="radiogroup"` with index-based
  `aria-*` wiring; both render a `role="group"` of plain `<button>`s with `aria-label`s pinned to
  the choice's own label/id (`aria-pressed={selected?.id === choice.id}` /
  `aria-pressed={picked}` where `picked = v.choiceId === choice.id`). Tab order and screen-reader
  announcement order simply follow DOM order, which is now the shuffled order — consistent and
  correct, exactly as it already is for `McqW`'s `role="radiogroup"`. No index is baked into any
  `aria-*` attribute or `key` (`key={choice.id}` in both, unchanged).
- **Memoization**: `useMemo(..., [spec.choices, seed])` matches `McqW`'s memo dependency array,
  so the order is stable across re-renders within one sitting and only changes if the seed or the
  underlying choices array reference changes (i.e., a new question).

Conclusion: the shuffle is display-order-only, exactly as designed in `McqW`, and cannot affect
grading, feedback attribution, or accessible announcement correctness for either widget.

## Other choice-rendering widgets found with the SAME defect (reported, not fixed — out of scope)

Grepped `widgets.tsx` for every `spec.choices.map(...)` / `spec.options.map(...)` render and
cross-referenced against existing `seededShuffle(spec.choices, ...)` calls. Widgets that already
shuffle correctly (no action needed): `McqW`, `ScaledCircleLabW`, `TriangleClosureLabW`,
`CompoundEventLabW`, `SignedFractionLabW`, `GeometricConstraintLabW`, `ShapeHierarchyLabW`.

Widgets that render `spec.choices` in raw authored order with **no shuffle**, same defect
pattern, same fix would apply — **not touched**, per scope:

| Widget | Approx. line | Notes |
|---|---|---|
| `CompositeAreaLabW` | ~2062 | `spec.choices.map` direct, `choice.correct`-style grading by id in evaluate.ts (`compositeAreaChoiceCorrect`) — same shape as the two fixed widgets. |
| `TrialProbabilityLabW` | ~2174 | `spec.choices.map` direct. |
| `EquationOutcomeLabW` (classify mode) | ~6954 | `spec.choices.map` direct; the `transform` mode of this widget is a separate, already-shuffle-agnostic operation-sequence UI and is unaffected. |
| `PlaceValueTransformLabW` | ~8423 | `spec.choices.map` direct. |
| `PointSetReasoningLabW` | ~8484 | `spec.choices.map` direct (single-line component body). |
| `ExactNumberLabW` | ~8645 | `spec.choices.map` direct. |
| `AffineRelationshipLabW` | ~8770 | `spec.choices.map` direct. |
| `QuotientReasoningLabW` | ~8860 | `spec.choices.map` direct. |
| `GraphStoryLabW` (`read` mode) | ~8960 | `spec.choices.map` direct; the `build` mode renders a segment bank, not a choices list, and is unaffected. |
| `DiscreteEstimateCompareW` | ~16394 | `spec.choices.map` direct; choices are estimate-value buttons plotted against a ruler and marked `choice.correct` — worth a closer look for the same authored-first bias, though the visual ruler above the buttons may already leak position information independently. |

Not flagged (different pattern, not the same defect): `SubitizeFlashW`'s `spec.options.map`
(~17632) renders a **numeric keypad** (`spec.options: number[]`, e.g. `[3,4,5,6]`), not an
authored list with one "correct" entry written first by convention — no evidence of the same
authoring bias, and shuffling a numeric keypad would itself be a usability regression (learners
expect ascending order). Left as-is and not included above.

Recommend a follow-up session apply the identical `orderedChoices` pattern to the ten widgets
above, in the same order-of-leverage the `CLAUDE.md` variant workstream uses (most-used engines
first), each with its own regression test mirroring this file.

## Regression test

New file: `src/components/labChoiceOrder.s316.test.tsx` (`// @vitest-environment jsdom` on line
1), mirroring the structure and intent of `src/components/optionOrder.test.tsx`. Uses
authored-shape specs pulled directly from real content
(`content/courses/proportional-relationships/lessons/pr-04-02.json` for percentChangeLab,
`.../pr-02-01.json` for proportionalReasoningLab — both correct-choice-first, as authored).

Six tests, two per widget plus one shared probe helper:
1. **Order differs from authored order** for a seed known to displace the correct choice away
   from position 0 (probed the same way `optionOrder.test.tsx` probes McqW).
2. **Deterministic**: same seed → identical rendered button order across two independent renders.
3. **Grades correct regardless of rendered position**: clicks the correct choice by its label
   (found wherever it rendered after shuffling), asserts `onChange` was called with the correct
   choice identity, and asserts `evaluate()` returns `correct: true` for that same value —
   proving grading follows identity, not DOM position.

For `proportionalReasoningLab`, the test supplies a pre-verified `value` (all source-row unit
rates already checked), matching the existing pattern in
`src/components/widgets.proportionalReasoning.s144.test.tsx`, so the choice buttons are enabled
without driving the interactive normalize step through the DOM.

## Test results (verbatim)

```
$ npx vitest run src/components/labChoiceOrder.s316.test.tsx

 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  00:14:21
   Duration  8.52s (transform 6.90s, setup 147ms, import 6.57s, tests 481ms, environment 879ms)
```

```
$ npx vitest run src/components/optionOrder.test.tsx

 RUN  v4.1.10 /home/user/maggies-trail

 ❯ src/components/optionOrder.test.tsx (10 tests | 1 failed) 1090ms
     × the authored corpus IS heavily biased toward position 0 (documents why the fix exists) 189ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/components/optionOrder.test.tsx > mcq option order — the real content corpus > the authored corpus IS heavily biased toward position 0 (documents why the fix exists)
AssertionError: expected 0.8652173913043478 to be greater than 0.95
 ❯ src/components/optionOrder.test.tsx:123:40

 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
```

**This one failure is pre-existing and unrelated to this fix.** It asserts on the *content
corpus's* mcq authored-order bias (a corpus-wide statistic over `content/courses/**`), not on
anything in `widgets.tsx`. Verified by stashing the `widgets.tsx` change and re-running: the
identical failure (`0.8652173913043478`, same assertion) reproduces on the pre-fix code. The
repo's working tree already carries a large number of uncommitted content edits (`git status`
shows dozens of modified `content/courses/**/lessons/*.json` files predating this session, from
an unrelated in-progress workstream) that have apparently shifted the corpus-wide mcq bias below
the pinned 0.95 threshold. This is out of scope for S316 (content is explicitly off-limits per
task scope) and was not touched, caused, or fixed by this change. The other 9 tests in that file
— including the two that exercise the actual shuffle mechanism and grading-by-id — pass.

`npx tsc --noEmit -p tsconfig.json`: **exit 0**, clean.

## Scope discipline

Touched only:
- `src/components/widgets.tsx` — `PercentChangeLabW` and `ProportionalReasoningLabW` only (added
  `seed` destructure + `orderedChoices` memo + swapped the two `.map()` call sites to use it; no
  other lines in either function changed, no other component touched).
- `src/components/labChoiceOrder.s316.test.tsx` — new regression test file.
- `reports/closure/S316_LAB_CHOICE_SHUFFLE_FIX.md` — this report.

No lesson content, no other component, no scripts, no ledger/queue files were modified.
