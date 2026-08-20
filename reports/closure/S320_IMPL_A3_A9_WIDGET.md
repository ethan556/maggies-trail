# S320 — Implementation: A3/A9 ESCALATE widget fix + 5 lesson content contracts

Bounded worker packet, sole owner of `src/components/widgets.tsx` this round, executing the
contracts written in `reports/closure/S320_ASSESS_A3.md` (REVISE + ESCALATE sections) and
`reports/closure/S320_ASSESS_A9.md`, per the authority prefix in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`.

## TASK A — widget fix: `DistributionCompareLabW` measure-mode shuffle

### The defect

`DistributionCompareLabW` (`src/components/widgets.tsx`, component starts ~line 10431) has two
modes. Its **judge** mode already seeded-shuffles display order:

```ts
const orderedJudgeOptions = useMemo(
  () => spec.mode === "judge"
    ? seededShuffle(spec.judgeOptions, `distributionCompareLab:judge:${seed ?? ...}`)
    : [],
  [seed, spec]
);
```

Its **measure** mode rendered `spec.measureChoices.map(...)` directly, in raw authored order, with
no shuffle at all. Per the A3 assessment, 20 of 21 authored measure-mode instances across
`sp-02-01`, `sp-02-02`, `sp-02-03`, `sp-02b-01`, `sp-02b-02`, `sp-02b-03` had the correct choice at
array index 1 — a learner strategy of "always click the 2nd button" scored roughly 95% without
engaging the content.

### The fix

Mirrored the existing `orderedJudgeOptions` pattern exactly:

```ts
const orderedMeasureChoices = useMemo(
  () => spec.mode === "measure"
    ? seededShuffle(
        spec.measureChoices,
        `distributionCompareLab:measure:${seed ?? spec.measureChoices.map((c) => String(c.value)).join("|")}`
      )
    : [],
  [seed, spec]
);
```

and changed the measure-mode button list from `spec.measureChoices.map(...)` to
`orderedMeasureChoices.map(...)`. This is a **display-order-only** change — each button still
prints its own `choice.label ?? fmt(choice.value)`, so no lesson content needed to change in any
of the 6 escalated lessons. The stale in-code comment claiming "measure choices deliberately opt
out" (because their order was believed to be part of the ruler/measurement model) was rewritten to
record the A3 finding and the evaluator-safety argument below.

### Evaluator-safety proof (grading keys off `choice.value`, never index)

Read every code path in the evaluator that touches `distributionCompareLab` measure mode:

| File | Function / case | How it identifies the choice |
|---|---|---|
| `src/lib/evaluate.ts` (~865-872) | `evaluate()` grading | `spec.measureChoices.some((c) => c.value === value)`; correctness via `Math.abs(value - spec.answer) <= spec.tolerance`; wrong-choice feedback via `spec.measureChoices.find((c) => c.value === value)` |
| `src/lib/evaluate.ts` (~2420-2423) | `canCheck()` | `spec.measureChoices.some((c) => c.value === value)` |
| `src/lib/evaluate.ts` (~2800-2801) | `correctAnswerText()` | derived directly from `spec.answer`, no choice array involved |
| `src/lib/evaluate.ts` (~3107-3110) | `learnerAnswerText()` | formats `value` directly |
| `src/lib/pedagogy.ts` (~176-178) | `allWrongFeedback` | `w.measureChoices.filter((c) => ... Math.abs(c.value - w.answer) > w.tolerance)` |
| `src/lib/describeState.ts` (~360-364) | narration | reports `value` directly |
| `src/lib/schema.ts` (`widgetIntegrityErrors`, ~8438-8453) | authoring-time integrity gate | uniqueness/exactly-one-accepted checks by `.value`, not position |

**None of these read array index.** The shuffle is evaluator-safe by the identical argument the
S316/S243 sibling fixes already established for this codebase's other lab widgets.

### `unitCircleExplore` `ghostChoices` — concurrence recorded

The A3 report separately investigated a structurally identical unshuffled-choice-list pattern in
`unitCircleExplore`'s `ghostChoices` (7 instances across `ti-02-02`, `ti-02-03`, `ti-03-01`,
`ti-03-02`, `ti-03-03`, `ti-04-02`, `ti-04-03`, all `kind: "interactive"` steps) and explicitly
declined to escalate it. **I concur with that disposition** and left `ghostChoices` unshuffled and
unchanged, exactly as instructed ("do NOT change it"):

- `kind: "interactive"` steps are, corpus-wide, ungraded/formative — `engine.ts`'s XP formula and
  the existing test suite gate scoring on `kind === "check" || kind === "challenge"` only, never
  `"interactive"`.
- Every `ghostChoices` set is independently validated at schema-parse time by a numeric sweep
  across angles (`schema.ts` ~lines 7951-7962, `ucGhostPoint`) — a materially stronger correctness
  guarantee than most widgets get.
- The task additionally requires dragging to a specific target angle, which a blind first-click
  cannot shortcut, unlike a measure-mode button click.

Net: a real, structurally-identical, but genuinely lower-severity pattern than the graded
`distributionCompareLab` defect — correctly left un-escalated.

### Tests added

Extended `src/components/labChoiceOrder.s316b.test.tsx` (the S316-sweep regression file already
covering this exact class of bug for 9 sibling widgets) with a new
`describe("distributionCompareLab (measure) choice order (S320-A3)")` block, built from the real
authored `sp-02-01/i1` fixture (Group A mean 20, Group B mean 8, variability 4, correct answer 3 —
originally authored at index 1 of 3). Four tests, following both this file's own established
pattern and the sibling `widgets.choiceOrder.s243.test.tsx` (judge-mode) pattern:

1. **Position variety** — over 18 different question seeds, the correct choice's rendered position
   is not fixed (regression guard for "was fixed at index 1").
2. **Shuffled render** — for a seed that displaces the correct choice away from index 0, the first
   rendered button is not the previously-first authored choice.
3. **Grade-by-value survives shuffle** — clicking the correct choice wherever it renders still
   calls `onChange(3)` and `evaluate(spec, 3).correct === true`.
4. **Wrong-choice grading also survives shuffle** — clicking a wrong choice wherever it renders
   still returns that choice's own diagnostic feedback (`evaluate(spec, 4)` returns the
   "variability measure itself" feedback), not a generic fallback.

### Test output (verbatim)

```
$ npx vitest run src/components/labChoiceOrder.s316b.test.tsx

 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  19:45:45
   Duration  8.20s (transform 5.87s, setup 133ms, import 5.39s, tests 1.35s, environment 1.07s)
```

(22 = the file's original 18 tests across 9 widgets, plus the 4 new `distributionCompareLab`
measure-mode tests.)

```
$ npx tsc --noEmit
(no output — exit code 0)
```

Both required gates — `npx vitest run src/components/labChoiceOrder.s316b.test.tsx` and
`npx tsc --noEmit` — pass clean, as required by the task.

### Regression checks beyond the two required gates (due diligence, not required)

- `npx vitest run src/components/widgets.choiceOrder.s243.test.tsx src/components/widgets.distributionCompare.s131.test.tsx src/components/widgets.distributionCompare.tone.s218.test.tsx src/components/widgets.colourCue.s242.test.tsx src/lib/session131.distribution-compare.test.ts` — **5/5 files, 54/54 tests passed** (every existing `distributionCompareLab` suite, judge and measure mode, colour-cue, label-collision).
- `npx vitest run src/components/widgets.labelCollision.s237.test.tsx -t distributionCompareLab` — **5/5 passed**. Running the full file surfaces 8 pre-existing failures, but they are all in `barBuilder`/histogram tests (a widget my edit never touches — `BarBuilderW` is defined ~line 12914, entirely separate from `DistributionCompareLabW` at ~line 10431) and a stale authored-instance-count assertion; confirmed unrelated to this change.
- `npx vitest run src/components/widgets.shapeHierarchy.s140.test.tsx src/lib/session140.shape-hierarchy.test.ts` — **2/2 files, 9/9 tests passed** (relevant to the `cg-03-03` content fix below).

## TASK B — 5 lesson content contracts

All 5 lessons pass full-corpus parse-check gates after the edits:

```
$ npx tsx scripts/content-check.ts schema
schema: 1840/1840 files clean

$ npx tsx scripts/content-check.ts pedagogy
pedagogy: 1711/1711 files clean
```

Both runs include all 5 touched files with a `✓` line each (grep-confirmed individually).

### 1. `sampling-and-probability/sp-03-03` — fresh numbers, 6 steps

**Contract** (`S320_ASSESS_A3.md#sp-03-03`): 6 of 7 primary steps (`i2`, `k1`, `i3`, `k2`, `k3`,
`ch1`) reused `sp-03-01`'s and/or `sp-03-02`'s exact authored numbers verbatim, despite this
lesson's job being to teach theoretical-vs-experimental classification, not repeat prior
arithmetic. `i1` was correctly NOT flagged (fresh "odd number" scenario).

| Step | Old (duplicated) | New | Recomputation |
|---|---|---|---|
| `i2` (theoretical) | 8 sections, 5 blue → 5/8 (dup of `sp-03-01/k2`) | 10 sections, 7 yellow → 7/10 | gcd(7,10)=1, irreducible; complement 3/10 = 10−7 |
| `k1` (experimental) | spinner red 18/30 → 3/5 (dup of `sp-03-02/k1`) | number cube rolled 40×, landed on 3 exactly 15× → 3/8 | gcd(15,40)=5→3/8; complement trap 15/25 (40−15); 2/5 of 40=16≠15 |
| `i3` (experimental) | basketball 45/60 → 3/4 (dup of `sp-03-02/i3`) | archer 27/36 → 3/4 | gcd(27,36)=9→3/4; complement trap 27/9 (36−27); 5/6 of 36=30≠27 |
| `k2` (theoretical) | die "greater than 4" → 2/6=1/3 (dup of `sp-03-01/k1`) | die "less than 3" → 2/6=1/3 | faces {1,2} favourable of 6; outcomes array flipped accordingly |
| `k3` (experimental) | weighted coin 14/20 → 7/10 (dup of `sp-03-02/k2`) | weighted coin 22/55 → 2/5 | gcd(22,55)=11→2/5; complement trap 22/33 (55−22); 3/5 of 55=33≠22 |
| `ch1` (experimental challenge) | spinner theoretical 1/2, 24/40 exp → 3/5 (dup of `sp-03-02/ch1`) | spinner theoretical 1/4, 21/60 exp → 7/20 | gcd(21,60)=3→7/20; reference 1/4 kept as trap-1; failures=60−21=39, trap-2=21/39 (reduces to 7/13, distinct from 7/20 and 1/4) |

Every `explanationVariants`, `hints`, and widget `choices`/`feedback`/`fallbackFeedback` for the 6
steps was rewritten to match its new numbers; `id`s, `kind`, widget `type`
(`trialProbabilityLab` throughout), `conceptTag`, and `variant.gen`/`variant.form` declarations
are unchanged. Post-fix duplicate scan (programmatic pairwise compare of all 7 primary-step
prompts within the lesson, plus a grep sweep against `sp-03-01.json`/`sp-03-02.json` for each new
prompt string) found **zero collisions**.

### 2. `sampling-and-probability/sp-04-02` — truthful hints

**Contract** (`S320_ASSESS_A3.md#sp-04-02`): `ch1`'s `explanationVariants` and `hints` described
`i1`'s different problem ("P(heads)=1/2, P(even)=1/2" → 1/4) instead of `ch1`'s actual prompt
"P(heads and a multiple of 3)" (correct answer 1/6, already correct in the widget's own option
feedback).

- `explanationVariants[0]`: "P(heads)=1/2, P(even)=1/2; multiply: 1/4." → "P(heads)=1/2,
  P(multiple of 3)=1/3; multiply: 1/2 × 1/3 = 1/6."
- `hints[1]`: "P(rolling even) = 1/2." → "P(rolling a multiple of 3) = 2/6 = 1/3."
- `hints[2]`: "Multiply the two: 1/2 × 1/2 = 1/4." → "Multiply the two: 1/2 × 1/3 = 1/6."

Verified: multiples of 3 on a standard die = {3, 6} = 2/6 = 1/3; P(heads AND multiple of 3) =
1/2 × 1/3 = 1/6 — now consistent everywhere the step speaks (widget feedback was already correct
and untouched; explanationVariants and hints now match it).

### 3. `trig-functions/tf-03-02` — differentiated predict block

**Contract** (`S320_ASSESS_A3.md#tf-03-02`): `i1`'s `predict` sub-block was byte-identical to
`tf-03-01/e1`'s (only the target angle differed, 150° vs 120°), both resolving via identical
"height climbs then falls back" reasoning — no connection to `tf-03-02`'s actual topic (reference
angles).

Rewrote prompt, all 3 options, `outcomeId`, and `reveal` to a reference-angle-specific sign
question: "150° leans on the 30° reference triangle. Before you rotate: will cos 150° come out
positive or negative?" → correct answer "Negative — same size as cos 30°, but Quadrant II flips
the sign."

Recomputed: 150° is in Quadrant II, reference angle = 180−150 = 30°; cos 30° = √3/2 ≈ 0.866
(magnitude); Quadrant II has negative x-coordinate, so cos 150° = −cos 30° ≈ −0.866 (matches the
widget's own unchanged `successFeedback`). The `unitCircleExplore` widget spec, `cml` block, and
`explanation` sub-block are all untouched — only the `predict` sub-block was rewritten, per the
contract's exact scope.

### 4. `trig-identities-equations/ti-05-03` — new capstone equation

**Contract** (`S320_ASSESS_A3.md#ti-05-03`): `ch1`'s capstone equation `2 sin x cos x = cos x` is
algebraically identical to `ti-05-02/ch1`'s `sin 2x = cos x`, reusing the same 4 solutions and sum
(3π ≈ 9.4248), self-acknowledged in `ch1`'s own hint ("This is sin 2x = cos x again").

Applied the contract's suggested fix — sign flip: `2 sin x cos x = −cos x`.

**Full derivation (all solution families verified):**

```
2 sin x cos x = −cos x
2 sin x cos x + cos x = 0
cos x (2 sin x + 1) = 0        (factor — never divide by cos x)

Branch 1: cos x = 0            → x = π/2, 3π/2
Branch 2: sin x = −1/2         → reference angle π/6, sine negative in Q3/Q4
                                → x = π + π/6 = 7π/6,  x = 2π − π/6 = 11π/6
```

A product is zero iff a factor is zero — these two branches are exhaustive on `[0, 2π)`; no third
family exists.

Sum: π/2 + 3π/2 + 7π/6 + 11π/6 = (3+9+7+11)π/6 = 30π/6 = **5π ≈ 15.7080** (5π =
15.70796326794897, rounds to 15.708 at 3 decimals; tolerance 0.001 comfortably covers the
0.00004 rounding gap).

`widget.answer` (9.4248 → 15.708), both `commonErrors` (rebuilt as partial-branch-sum traps:
9.4248 now traps "forgot the cos x=0 branch", 6.2832 now traps "forgot the sin x=−1/2 branch"),
`fallbackFeedback`, `explanationVariants[0]`, and all 3 `hints` (including removing the "again"
self-reference callback, since the equation is genuinely different now) were rewritten to match.
The remedial (`rem-ti0503`, equation `sin x = tan x`) is unrelated and untouched.

### 5. `coordinate-geometry/cg-03-03` — geometrically truthful triangle

**Contract** (`S320_ASSESS_A9.md#coordinate-geometry-cg-03-03`): `ch1`'s `shapeHierarchyLab`
(`triangleQuestion: "dual"`) set `triangleSides: [3, 4, 5]` alongside `triangleAngles: [30, 60,
90]`. `ShapeHierarchyLabW` draws the SVG triangle from `triangleSides` alone — a real 3-4-5
right triangle whose true angles are ≈53.13°/90°/36.87° — but overlays the authored
`triangleAngles` as text labels at the SAME vertices, so the vertex that is visually the true 90°
corner (apex T) was labeled "60°," and the vertex labeled "90°" (R) was visually the ≈37° corner.

**Fix applied exactly as contracted**: `triangleSides: [3, 4, 5]` → `triangleSides: [6, 3, 5.2]`.

**Vertex-convention mapping** (read from `ShapeHierarchyLabW`,
`src/components/widgets.tsx` ~lines 19059-19073, `const [left,right,base]=shapeSides`):

- `sides[0]` ("left", the L–T edge) is drawn **opposite vertex R** → must be the hypotenuse
  (opposite the printed 90° at R) = **6**
- `sides[1]` ("right", the T–R edge) is drawn **opposite vertex L** → must be the short leg
  (opposite the printed 30° at L) = **3**
- `sides[2]` ("base", the L–R edge) is drawn **opposite apex T** → must be the long leg
  (opposite the printed 60° at T) = 3√3 ≈ 5.196, rounded to authored **5.2**

**Law-of-cosines verification** (script-run against the widget's own `foot`/`height` formulas,
vertices L=(0,0), R=(base,0), T=(foot,height), left=6/right=3/base=5.2):

```
angle at L = 30.000°
angle at T = 60.073°
angle at R = 89.927°
sum        = 180.000°
```

All three land within 0.1° of the printed 30/60/90 labels — the small residual comes purely from
rounding the exact 3√3 = 5.196152422706632 to the authored 5.2, matching the contract's own
"≈30.0°/90.0°/60°" prediction exactly.

**Grading verified unchanged** (`src/lib/schema.ts`
`shapeHierarchyTriangleLabels`/`shapeHierarchyChoiceCorrect`, ~lines 4737-4781 — read directly,
confirmed these functions never inspect the rendered SVG, only the two authored arrays):
`sideLabel` is computed from `triangleSides` distinctness — 6, 3, 5.2 are three distinct values →
`"scalene"` (unchanged; the old 3/4/5 was also all-distinct). `angleLabel` is computed from
`triangleAngles` — unchanged `[30, 60, 90]`, 90 present → `"right"` (unchanged). Combined
`"right"+"scalene"` still matches choice `"a"` ("Right scalene") exactly as before. No change to
`triangleAngles`, prompt text, choices, feedback, or `triangleQuestion`.

## Duplicate scans vs named siblings — summary

- **sp-03-03**: post-fix grep sweep of `content/courses/sampling-and-probability/lessons/sp-03-*.json`
  confirms none of the 6 rewritten prompts collide with `sp-03-01.json`/`sp-03-02.json`; within-lesson
  pairwise prompt compare across all 7 primary steps found 0 duplicates. (The lesson's remedial still
  shares wording with `sp-03-02/k1` — this is the established, explicitly-excluded-from-scope
  "remedial reteaches the concept" corpus convention per the A3 report's own scoping note, not a new
  defect; remedials were not part of this contract.)
- **sp-04-02**: no scenario/number change (hint-text-only fix); no new duplication surface introduced.
- **tf-03-02**: new predict text grep-verified absent elsewhere in `content/courses/trig-functions/`;
  `tf-03-01/e1`'s original block is untouched and remains the sole "climbs, then falls back" predict.
- **ti-05-03**: new equation/solutions/sum grep-verified distinct from `ti-05-02/ch1`'s (3π vs 5π,
  different quadrant pair of roots).
- **cg-03-03**: single-array numeric fix; no prompt/text duplication surface touched.

## Mcq correct-first / normalized-distinctness check

All new/edited `mcq` and lab-widget choice sets were authored with the correct choice interleaved
at varying positions across the 6 rewritten `sp-03-03` steps (not systematically first), each
trap's reduced fraction verified distinct from the correct answer and from every other trap in the
same widget (no equivalent-duplicate-choice collisions, cross-checked by gcd reduction by hand for
every set above). `sp-04-02`, `tf-03-02`, `ti-05-03`, and `cg-03-03` did not add or reorder any
choice sets.

## Files touched

- `src/components/widgets.tsx` — `DistributionCompareLabW`: added `orderedMeasureChoices` memo,
  changed measure-mode render to use it, updated the S243 canary comment.
- `src/components/labChoiceOrder.s316b.test.tsx` — added 4 new tests + 1 new fixture
  (`DISTRIBUTION_COMPARE_MEASURE`) under a new `describe` block; added `TDistributionCompareLab`
  to the type import list.
- `content/courses/sampling-and-probability/lessons/sp-03-03.json` — 6 steps re-authored.
- `content/courses/sampling-and-probability/lessons/sp-04-02.json` — `ch1` hints/explanations
  corrected.
- `content/courses/trig-functions/lessons/tf-03-02.json` — `i1.predict` rewritten.
- `content/courses/trig-identities-equations/lessons/ti-05-03.json` — `ch1` equation and all
  dependent text rewritten.
- `content/courses/coordinate-geometry/lessons/cg-03-03.json` — `ch1.widget.triangleSides`
  corrected.
- `reports/closure/S320_IMPL_A3_A9_WIDGET.md` (this file, new).
- `reports/closure/cowork-staging/laneA-s320-impl-8.jsonl` (new, 6 NDJSON records — 1 widget fix
  + 5 lesson fixes).

## Pre-existing failures observed during verification (not caused by this work, out of scope)

Encountered and confirmed unrelated to this packet's edits (different courses/widgets, or
structurally pre-dating my content edits — proven by reconstructing the pre-edit step-mode
sequence for `sp-03-03` and showing the same count mismatch existed before any change here):

- `src/components/widgets.labelCollision.s237.test.tsx` — 8 failures in `barBuilder`/histogram
  tests (`g5d-01-01`, `dd-02-02`) and a stale "authored tail-engine instance count" assertion.
  `BarBuilderW` (line ~12914) is untouched by this packet.
- `src/lib/session132.trial-probability.test.ts` — expects 15 `trialProbabilityLab` widgets
  (12 experimental + 3 theoretical) across `sp-03-02.json` + `sp-03-03.json`; actual structural
  count is 14 (11 experimental + 3 theoretical) — proven pre-existing by reconstructing the
  original `sp-03-03` mode sequence (`theoretical, experimental, theoretical, experimental,
  theoretical, experimental, experimental, experimental` = 8 widgets, 5 experimental + 3
  theoretical, identical count to post-fix) and confirming `sp-03-02` was never touched by this
  packet.
- `src/lib/scaffoldFixes.test.ts` — 2 failures in `ratios-rates/rr-05-03`, an unrelated course
  never touched by this packet.
- `src/lib/variants.resolver.test.ts` — 3 failures referencing `k100-02-05.json`, an unrelated
  course never touched by this packet.

None of these are in scope for this packet (sole ownership was `widgets.tsx` plus the 5 named
lessons) and none block the two required gates, which both pass clean.

## Return contract

`packet_id=S320-IMPL-A3-A9-WIDGET, base_commit=<unresolved — no git repo present at
/home/user/maggies-trail>, contract_hash=<n/a — no packet contract file hash supplied>,
role=implementation, model=claude-sonnet-5, effort=high, speed=n/a,
scope_ids=[widgets.tsx:DistributionCompareLabW, sp-03-03, sp-04-02, tf-03-02, ti-05-03,
cg-03-03], status=complete,
changed_file_hashes=[widgets.tsx=8b943debb9a4e222, labChoiceOrder.s316b.test.tsx=528ef7cce702306d,
sp-03-03.json=14043017d27e1b10, sp-04-02.json=ca7f73f24d6fcfd4, tf-03-02.json=a57136d1cac521b4,
ti-05-03.json=bf3d556b74f92b6b, cg-03-03.json=bf0c5ba459718bc2] (sha256, first 16 hex chars),
evidence_refs=[src/components/widgets.tsx, src/components/labChoiceOrder.s316b.test.tsx,
src/lib/evaluate.ts, src/lib/pedagogy.ts, src/lib/describeState.ts, src/lib/schema.ts,
content/courses/sampling-and-probability/lessons/sp-03-01.json,
content/courses/sampling-and-probability/lessons/sp-03-02.json,
content/courses/sampling-and-probability/lessons/sp-03-03.json,
content/courses/sampling-and-probability/lessons/sp-04-02.json,
content/courses/trig-functions/lessons/tf-03-01.json,
content/courses/trig-functions/lessons/tf-03-02.json,
content/courses/trig-identities-equations/lessons/ti-05-02.json,
content/courses/trig-identities-equations/lessons/ti-05-03.json,
content/courses/coordinate-geometry/lessons/cg-03-03.json],
gates_passed=[npx vitest run src/components/labChoiceOrder.s316b.test.tsx (22/22), npx tsc
--noEmit (clean), npx tsx scripts/content-check.ts schema (1840/1840), npx tsx
scripts/content-check.ts pedagogy (1711/1711), json.load parse-clean (5/5 touched lesson files),
law-of-cosines script verification (cg-03-03), regression suites for distributionCompareLab (5
files/54 tests), shapeHierarchyLab (2 files/9 tests), coordinate-geometry/trig-functions/
trig-identities-equations course-integrity suites (6 files/73 tests)], gates_failed=[none in
scope], cache_invalidations=none, new_decision_required=none, risks=[none beyond the
pre-existing, out-of-scope failures documented above], next_owner=none — packet closed.`
