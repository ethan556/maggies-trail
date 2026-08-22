# S316 sweep — lab choice-order fix extended to the ten flagged widgets

Follow-up to `S316_LAB_CHOICE_SHUFFLE_FIX.md`, which fixed `PercentChangeLabW` and
`ProportionalReasoningLabW` and identified ten more widgets in `src/components/widgets.tsx`
rendering `spec.choices` in raw authored order with no seeded shuffle. This packet applies the
same fix to nine of the ten and documents why the tenth is a genuine ordered-semantics exception.

## Method

For every widget: read the full component body, read its `evaluate.ts` case, confirm grading
keys off `choice.id` (or `choice.value` for the one numeric-scale widget) rather than rendered
index, confirm no `aria-*`/keyboard wiring bakes in position, then grep `content/courses/**` for
real authored instances of the widget type and read them to (a) confirm the authored-first bias
this defect exploits and (b) check for any content-level ordering convention that would make a
shuffle pedagogically wrong.

## Fixed (9)

All nine use the exact `orderedChoices = useMemo(() => seededShuffle(spec.choices, seed ?? spec.choices.map(c => c.id).join("|")), [seed, spec.choices])` pattern already established by `McqW` /
`PercentChangeLabW` / `ProportionalReasoningLabW` / `SignedFractionLabW`. `seed` was added to each
widget's destructured `WProps` (it was already threaded through `WidgetRenderer`'s prop spread —
no call-site change needed). Every `.map()` over `spec.choices` used for rendering was switched to
render `orderedChoices` instead; no other read of `spec.choices` was touched.

| Widget | evaluate.ts case | Grades by | Render call site(s) fixed |
|---|---|---|---|
| `CompositeAreaLabW` | `compositeAreaLab` (evaluate.ts:794) | `spec.choices.find(c => c.id === value)` | `widgets.tsx` choice-button `.map()` (~L2062) |
| `TrialProbabilityLabW` | `trialProbabilityLab` (evaluate.ts:857) | same, by id | choice-button `.map()` inside `role="group" aria-label="Choose the probability fraction"` |
| `EquationOutcomeLabW` (`mode:"classify"`) | `equationOutcomeLab` classify branch (evaluate.ts:818–826) | same, by id | choice-button `.map()` in the classify JSX branch. `mode:"transform"` is untouched — it renders `spec.operations`, a distinct authored array with its own `correctOrder` sequence grading, not `spec.choices` |
| `PlaceValueTransformLabW` | `placeValueTransformLab` (evaluate.ts:1513) | `spec.choices.find(c => c.id === v.choiceId)` | choice-button `.map()` under `aria-label="Choose the place-value conclusion"` |
| `PointSetReasoningLabW` | `pointSetReasoningLab` (evaluate.ts:1529) | same, by id | choice-button `.map()` under `aria-label="Choose the point-set conclusion"` |
| `ExactNumberLabW` | `exactNumberLab` (evaluate.ts:1548) | same, by id | choice-button `.map()` under `aria-label="Choose the exact-number conclusion"` |
| `AffineRelationshipLabW` | `affineRelationshipLab` (evaluate.ts:1569) | same, by id | choice-button `.map()` under `aria-label="Choose the affine conclusion"` |
| `QuotientReasoningLabW` | `quotientReasoningLab` (evaluate.ts:1593) | same, by id | choice-button `.map()` under `aria-label="Choose the exact quotient conclusion"` |
| `GraphStoryLabW` (`mode:"read"`) | `graphStoryLab` read branch (evaluate.ts:1620–1626) | same, by id | choice-button `.map()` under `aria-label="Choose the claim supported by the graph"`. `mode:"build"` is untouched — it renders `spec.bank` (a segment palette the learner assembles in order), not `spec.choices` |

### One hooks-safety fix required: `EquationOutcomeLabW`

`EquationOutcomeLabW` has an early `if (spec.mode === "transform") { … return <…/>; }` before the
classify-mode JSX. Placing `useMemo` after that branch (as first drafted) would have made the hook
conditional on `spec.mode`, violating React's rules of hooks. Fixed by hoisting the memo to the top
of the function, unconditionally, before the `mode==="transform"` branch. `spec.choices` defaults
to `[]` for transform-mode specs (`EquationOutcomeLabSpec.choices` is `.default([])`, not gated by
`mode` in the schema), so `seededShuffle([])` is a harmless no-op for that mode and the hook count
is stable across renders regardless of which mode a given step's spec carries.

### Evaluator-safety argument (all nine)

Same structure as the original fix's argument, re-verified per widget by reading the code (not
assumed):

- **Selection is by identity, not position.** Every fixed widget's `onClick` closes over the
  `choice` object from the *shuffled* array and passes `choice.id` (or, for the four derive-stage
  widgets — `PlaceValueTransformLabW`, `PointSetReasoningLabW`, `ExactNumberLabW`,
  `AffineRelationshipLabW`, `QuotientReasoningLabW` — `{ ...v, choiceId: choice.id }`) to
  `onChange`. Shuffling the array changes which DOM button a given `choice` renders as; it cannot
  change which `choice` object a button's closure holds.
- **`evaluate.ts` looks the picked choice up by id**, verified above for all nine cases — never
  `spec.choices[index]`.
- **Feedback is looked up by id/predicate** on the *original* `spec.choices` in every case
  (`spec.choices.find(candidate => candidate.id === value)` or equivalent), so feedback text
  cannot desync from the choice it names regardless of render order.
- **No `aria-*` or `key` bakes in index.** Every fixed widget uses `key={choice.id}` and
  `aria-pressed={selected?.id === choice.id}` (or the `v.choiceId === choice.id` equivalent for
  the derive-stage widgets) — never an array index. Tab order and screen-reader announcement order
  follow DOM order, which is now the shuffled order, exactly as already established for `McqW`.
- **Memoization matches the established pattern**: `useMemo(..., [seed, spec.choices])`, so order
  is stable within a sitting and only changes when the seed or the underlying choices array
  reference changes (a new question).

### Authored-bias evidence (spot-checked, one real instance per widget)

Every spec embedded in the new regression tests is copied from real authored content (paths in
the test file's comments), and every one of them writes the correct choice first:

- `compositeAreaLab`: `content/courses/measurement-data/lessons/md-04-04.json` — `"sum"` (id 0) is
  the 14-square-unit answer.
- `trialProbabilityLab`: `content/courses/sampling-and-probability/lessons/sp-03-03.json` —
  `"a"` (1/2) is correct.
- `equationOutcomeLab` (classify): `content/courses/linear-equations-systems/lessons/les-02-02.json`
  — `"a"` (Infinitely many) is correct.
- `placeValueTransformLab`: `content/courses/place-value/lessons/pv-01-03.json` — `"less"` (98 <
  401) is correct.
- `pointSetReasoningLab`: `content/courses/data-distributions/lessons/dd-04-01.json` — `"a"`
  (endpoints 3 and 12) is correct.
- `exactNumberLab`: `content/courses/rational-number-operations/lessons/rno-04-03.json` — `"a"`
  (-1/3) is correct.
- `affineRelationshipLab`: `content/courses/functions-g8/lessons/fg-03-02.json` — `"a"` (B grows
  faster) is correct.
- `quotientReasoningLab`: `content/courses/the-real-number-system/lessons/rns-02-02.json` — `"a"`
  (Rational) is correct.
- `graphStoryLab` (read): `content/courses/functions-g8/lessons/fg-04-02.json` — `"a"` (Not
  moving) is correct.

Same pattern as the two widgets fixed in the base packet: every one of these was 100% solvable by
always pressing the first button, independent of the actual math.

## Skipped — ordered-semantics exception (1)

### `DiscreteEstimateCompareW` (`estimateSlider`'s discrete/`choices` mode)

**Not fixed. No test added.** Read the full component (`src/components/widgets.tsx`, function
starts ~L16297) and its evaluator (`evaluate.ts` case `"estimateSlider"`, ~L2193). Grading is
`spec.choices.find(c => c.value === value)` then `choice.correct` — by value identity, not
position, so a shuffle *would* be evaluator-safe in isolation. The reason to skip is content, not
code:

Every `choices` entry is a **quantity on the same measurement scale** the widget's ruler visual
plots (`min`…`max`, with the stated `target` marked) — not an arbitrary claim like the nine
widgets above. Grepped every authored `estimateSlider` step with a `choices` array
(`content/courses/**`, 15 instances across 5 lessons) and checked whether `choices` are authored
in ascending numeric order (order-is-content: too-low → on-target → too-high, matching how a
learner would naturally scan a number line) versus correct-value-first (the same authoring bias
the other ten widgets carry):

```
content/courses/measure-problems-g4/lessons/g4v-02-03.json   [1600, 2250, 3000]  ascending, correct@1
content/courses/measure-problems-g4/lessons/g4v-02-03.json   [1400, 2200, 3000]  ascending, correct@1
content/courses/measure-problems-g4/lessons/g4v-03-03.json   [240, 330, 400]     ascending, correct@1
content/courses/measure-problems-g4/lessons/g4v-03-03.json   [180, 260, 340]     ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-01-01.json      [19, 24, 29]        ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-01-01.json      [17, 21, 25]        ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-03-01.json      [220, 260, 300]     ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-03-01.json      [280, 320, 360]     ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-02-04.json      [150, 250, 350]     ascending, correct@1
content/courses/word-problems-g3/lessons/g3w-02-04.json      [160, 200, 240]     ascending, correct@1
content/courses/fraction-multiply-g4/lessons/g4x-03-04.json  [2, 4, 6]           ascending, correct@1
content/courses/measure-money-time/lessons/mmt-02-01.json    [8, 20, 1]          NOT ascending, correct@0
content/courses/measure-money-time/lessons/mmt-02-01.json    [13, 30, 2]         NOT ascending, correct@0
content/courses/measure-money-time/lessons/mmt-02-01.json    [6, 20, 1]          NOT ascending, correct@0
content/courses/measure-money-time/lessons/mmt-02-01.json    [8, 20, 1]          NOT ascending, correct@0
```

11 of 15 are the "too low / on target / too high" pattern the ruler visual already teaches —
shuffling those would sever the button row's left-to-right reading order from the number-line
sense the widget exists to build (the CLAUDE.md-cited exception: "a numeric scale where order IS
the content"). Reordering these to break the exploit would be a **content edit**, out of scope for
a widget-code sweep, and would fight the pedagogy the ruler is teaching.

**However**, the 4 `measure-money-time/mmt-02-01.json` instances are NOT ascending — they are
correct-value-first (`[8, 20, 1]`, `[13, 30, 2]`, `[6, 20, 1]`, `[8, 20, 1]`), which is the exact
authored-bias defect this sweep exists to catch, just expressed as a content-authoring lapse
rather than a code defect: the convention (ascending, matching the ruler) was not followed for
this one lesson. **Flagging for a human, not fixing**: `content/courses/measure-money-time/lessons/mmt-02-01.json`'s four `estimateSlider` steps should have their `choices` arrays
reordered to ascending-by-value to match the convention used everywhere else this widget appears
(content edit, outside this packet's `src/components/widgets.tsx`-only scope — CLAUDE.md's
NON-NEGOTIABLE #1 forbids touching authored content from a widget-fix packet). Reordering
alone (not shuffling) is the correct fix there: it removes the position tell while preserving the
same low→correct→high pedagogy the other 11 instances already use.

## Regression tests

New file: `src/components/labChoiceOrder.s316b.test.tsx` (`// @vitest-environment jsdom` on line
1), same structure and intent as `labChoiceOrder.s316.test.tsx`. Every spec is copied from a real
authored lesson step (paths noted above and in the test file's comments), per CLAUDE.md's "read
every authored item" discipline — these are not synthetic shapes.

18 tests, two per fixed widget:
1. **Order differs from authored order** for a seed known to displace the correct choice away
   from position 0 (probed with the same `findDisplacingSeed` helper `labChoiceOrder.s316.test.tsx`
   uses for `McqW`/percentChangeLab/proportionalReasoningLab).
2. **Grades correct regardless of rendered position**: clicks the correct choice by its label
   (found wherever it rendered after shuffling), asserts `onChange` was called with the correct
   choice identity, and asserts `evaluate()` returns `correct: true` for that same value.

For the five derive-stage widgets (`PlaceValueTransformLabW`, `PointSetReasoningLabW`,
`ExactNumberLabW`, `AffineRelationshipLabW`, `QuotientReasoningLabW`), the test supplies a
pre-verified `value.revealed` array satisfying `requiredExplorations`/`requiredStageKeys` up
front — computed the same way each widget's own `*Truth`/`*ExplorationKeys` function in
`src/lib/schema.ts` computes it for that exact spec (not guessed), so the choice buttons render
enabled without driving the reveal-stage UI through the DOM. This mirrors the existing pattern in
`labChoiceOrder.s316.test.tsx` (proportionalReasoningLab) and
`widgets.proportionalReasoning.s144.test.tsx`.

### Test results (verbatim)

```
$ npx vitest run src/components/labChoiceOrder.s316b.test.tsx

 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  01:12:06
   Duration  5.08s (transform 3.64s, setup 76ms, import 3.35s, tests 655ms, environment 782ms)
```

```
$ npx vitest run src/components/labChoiceOrder.s316.test.tsx

 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  01:12:15
   Duration  8.76s (transform 6.88s, setup 105ms, import 6.09s, tests 622ms, environment 1.13s)
```

The base-packet S316 test file (six tests, `PercentChangeLabW`/`ProportionalReasoningLabW`) still
passes unchanged — confirms this sweep did not disturb the earlier fix.

```
$ npx tsc --noEmit
(exit 0, clean — no output)
```

## Scope discipline

Touched only:
- `src/components/widgets.tsx` — the nine named widgets only (destructured `seed`, added one
  `orderedChoices` memo each, swapped the relevant `.map()` call site(s) from `spec.choices` to
  `orderedChoices`). `DiscreteEstimateCompareW` was read and analyzed but not edited.
- `src/components/labChoiceOrder.s316b.test.tsx` — new file, regression tests only.
- This report.

Per the task's constraint, only `npx vitest run <this file's tests>` and `npx tsc --noEmit` were
run — no content files, no other widgets, no other test files were modified.
