# ENG-01 / ENG-02 — "reversible play" assessment

**Question put to this audit.** *"17 engine families allow REVERSIBLE PLAY — a learner can recover
the correct answer by manipulating the widget until it looks right, without understanding the
mathematics."*

**Verdict on the claim as stated: the number is wrong and the direction is inverted.**

1. The recorded "17" does not mean what the claim says it means. In `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv`,
   `reversible_manipulation` is a **desirable** property and the 17 rows are the engines that **lack**
   it (`LIMITED` × 11, `ANSWER_ONLY` × 6), flagged `REMEDIATE_ENGINE_PLAY` = *add* reversible direct
   manipulation. The list is headed by `numeric` and `mcq` — a typed box and a radio group. Neither
   is a manipulative that can be fished; they are on the list precisely because there is nothing to
   manipulate.
2. The defect the claim describes is real, but it is a **different, larger and differently-shaped
   set**: **77 of 127 authored engines** carry at least one source-level channel by which a correct
   answer is reachable without the mathematics, covering **2,230 of 11,957 authored widget instances**.
3. The severe form — the widget renders or announces the graded answer during active work — is
   **13 engines / 1,006 instances / 591 of them graded**. The single worst is `exactNumberLab`, which
   is not on the "17" list as a fishing risk at all (it is listed for the opposite reason).

Scope: source read only. `src/lib/schema.ts`, `src/lib/evaluate.ts`, `src/components/widgets.tsx`,
`src/components/playerStore.ts`, `src/components/LessonPlayer.tsx`, and all 1,701 lesson files under
`content/courses/*/lessons/`. No app was run. See §7 for what that leaves undetermined.

---

## 1. The harness — what is shared by every engine

These four facts bound every per-engine finding and must be read first.

| Fact | Source | Consequence |
|---|---|---|
| There **is** a commit step. Grading happens only in `check()`; nothing grades on change. | `src/components/playerStore.ts:344-377` | "Feedback before submit" can only come from the widget drawing it, never from the harness. |
| Graded steps are **bounded at two attempts**. First wrong → `retry`; second wrong → `finalize(false, true, …)` = revealed. | `src/components/playerStore.ts:366-376` | Blind brute force is not viable on `check`/`challenge` steps. Any convergence must be *guided*. |
| `interactive` steps have **unbounded attempts** — a wrong check sets `retry` and never finalizes. | `src/components/playerStore.ts:367-370`; "Show me" only appears at `attempts >= 3`, `src/components/LessonPlayer.tsx:915` | Check → Try again → Check can be repeated forever. This is the engine of every hill-climb finding below. |
| `interactive` steps are **ungraded**: no `history`, no `applyResult`, no review item. | `src/components/playerStore.ts:148-153` | Fishing on an interactive step wastes the learning but does **not** forge mastery evidence. Fishing on a `check`/`challenge` step does. That asymmetry drives the ranking. |
| Post-verdict manipulation is explicitly ungraded. | `src/components/playerStore.ts:346-354` | Not a defect; the sandbox is deliberate and correctly fenced. |

Two further platform-level conventions are **working as intended** and should not be disturbed:

- `tone === "info"` (post-verdict) gates the "GhostChip" that shows the correct state — **154 sites**
  in `widgets.tsx`. Where an engine leaks, it is an *outlier from* this convention, not an absence of one.
- Lattice snapping (`snapToStep`, `src/components/useSvgDrag.ts`) quantises drags to a grid. **No engine
  snaps to the answer.** The "drag-to-match that snaps only when correct" shape in the claim does not
  exist anywhere in this codebase.

---

## 2. Verdict codes

| Code | Meaning | Engines | Instances | Graded |
|---|---|---:|---:|---:|
| **R1** | **Answer shown.** The widget renders, announces, or (on a wrong attempt) states the graded answer during active work. | 13 | 1,006 | 591 |
| **R2** | **Correctness signalled.** No answer text, but the widget flips to a "correct" state (leaf-green / ✓) the instant the learner's state matches the target — before Check. | 24 | 310 | 28 |
| **R3** | **Convergence channel.** No pre-commit signal, but the miss feedback is directional (`lowFeedback`/`highFeedback`) or partial-credit, and the step kind permits unlimited retries → binary-search / hill-climb. | 38 | 725 | 68 |
| **R4** | **The model performs the task.** The widget computes and displays the very quantity being compared or ordered, so arranging it "to look right" substitutes for the reasoning. | 2 | 189 | 22 |
| **CLEAN** | No such channel found in source. | 50 | 9,727 | — |

R1 ⊃ R2 in practice (an engine that prints the answer also colours it); each engine is listed once,
under its most severe code.

---

## 3. Findings with source evidence

### 3.1 R1-a — the staged-reveal lab family (7 engines, 648 instances, 544 graded)

**This is the largest and least-recorded finding in the audit.**

Seven engines share one architecture: a `*Truth()` function in `schema.ts` builds an ordered list of
derivation `stages`; the widget renders each stage as a button; tapping it prints `stage.value`; and
`canCheck` **refuses to enable the Check button** until `requiredExplorations` stages (and every key in
`requiredStageKeys`) have been opened.

The defect: **for several tasks the terminal stage's `value` *is* the answer.**

- `src/lib/schema.ts:5884` — `exactNumberLab` / `approximationEvaluate`:
  `stages.push({key:"approx:compute", label:"combine and round to …", value:`${fmt(rounded)}`})`
  where `rounded` is assigned to `answerNumber` on the very next line (`5885`).
- `src/lib/schema.ts:5497` — `group:outer`, `value: \`result = ${fmt(answerNumber)}\``.
- `src/lib/schema.ts:5541` — `square:multiply`, `value: \`${n} × ${n} = ${fmt(answerNumber)}\``.
- `src/lib/schema.ts:5489` — `compare:exact`, prints the answer *relation* symbol.
- `src/lib/schema.ts:4861, 4865, 4870, 4874, 4880` — `proportionalReasoningLab`: five tasks whose final
  stage is literally `{ label: "scaled output" | "required input" | "predicted total" | "percent amount" | "final total", value: answerNumber }`.
- `src/lib/schema.ts:5049, 5078` — `placeValueTransformLab`: `value: fmt(answerNumber)`.
- `src/lib/schema.ts:6022` — `affineRelationshipLab`: `evaluate:<id>:value`, the evaluated y.
- `src/lib/schema.ts:5265, 5283, 5294-5299` — `geometricConstraintLab`: combined piece ledger, scaled side, squared runs.
- `src/lib/schema.ts:5191-5203` — `pointSetReasoningLab`: read-off coordinates and the subtracted span.

Render sites (all print `stage.value` when open):

- `src/components/widgets.tsx:8397` — `exactNumberLab`: `{open ? (authored?.body ?? stage.value) : …}`
- `src/components/widgets.tsx:8231` — `proportionalReasoningLab`: `{open ? \`${stage.label}: ${fmt(stage.value)}\` : …}` (in the **accessible name**, so it is spoken too)
- `src/components/widgets.tsx:8298` — `placeValueTransformLab`
- `src/components/widgets.tsx:8559` — `affineRelationshipLab`
- `src/components/widgets.tsx:8378-8386` — `geometricConstraintLab`
- `src/components/widgets.tsx:8363-8379` — `pointSetReasoningLab`
- `src/components/widgets.tsx:8622, 8628, 8630` — `quotientReasoningLab`. Note **8630**: even when an
  authored body *is* supplied, the widget additionally prints `Exact state: {stage.value}` — the
  authored override does not suppress the raw value here.

Gate that makes it compulsory rather than optional — `canCheck` returns `false` until the reveal
threshold is met: `src/lib/evaluate.ts:2279` (`exactNumberLab`, the `requiredExplorations` /
`requiredStageKeys` test), and the sibling cases at `2254` (`proportionalReasoningLab`), `2262`
(`placeValueTransformLab`), `2268` (`pointSetReasoningLab`), `2269` (`geometricConstraintLab`),
`2284` (`affineRelationshipLab`), `2294` (`quotientReasoningLab`).

**Measured on the authored corpus:**

- `exactNumberLab` — 358 instances, **345 graded** (237 check + 108 challenge), 124 lessons.
- 202 of those 358 are task `approximationEvaluate`, and **all 202 are graded** (136 check + 66
  challenge) across 76 lessons.
- **All 202 have `authoredStages: []`** — no authored body overrides the answer-printing stage, so
  every one of them renders the raw computed answer on a tap.
- **28 of the 202 name `approx:compute` in `requiredStageKeys`** (19 check, 9 challenge): on those
  steps the app *will not let the learner answer* until they have opened the panel that prints the answer.
- Sibling totals: `geometricConstraintLab` 66/44 graded, `affineRelationshipLab` 55/44,
  `placeValueTransformLab` 60/36, `proportionalReasoningLab` 47/32, `quotientReasoningLab` 39/28,
  `pointSetReasoningLab` 23/15.

There is a second, subtler surface on the same engine. `exactNumberLab`'s numeric mode renders a
"magnitude rail" whose landmarks are the **revealed** stage values (`src/components/widgets.tsx:8413`),
with `aria-valuetext` announcing `nearest derived landmark {n}` (`8419`). The code carries an explicit
self-audit at `widgets.tsx:8399-8410` — *"the rail cannot show the learner anything they have not
already derived"* — which is true, and is exactly the problem: what they have "already derived" by
tapping is the answer, so the rail plants a labelled tick on it and the learner drags to it.

### 3.2 R1-b — answer printed by the widget or stated in the miss feedback (6 engines)

| Engine | Evidence | Instances (graded) |
|---|---|---|
| `fractionBar` | `widgets.tsx:1429` — `= {decimal}{eq && spec.showTarget ? "  ✓ equal" : ""}`, where `eq` is `n*targetDen === d*targetNum` (`1299`). Live, ungated, before Check. Plus the target bar (`1350-1355`), the dashed target tick (`1406`) and the target in the `aria-label` (`1342-1344`). | 103 (4) — **54 leave `showTarget` at its `true` default**, `schema.ts:839` |
| `tenFrame` | `evaluate.ts:2183-2184` — the fallback miss feedback is `` `${dir} — the frame should show ${spec.target}. …` ``. A wrong attempt names the target. | 169 (20) |
| `baseTenCompose` | `evaluate.ts:2229` — `` `That builds ${total}, not ${spec.target}. …` ``; `2231` hands over the exact standard-form digits. | 56 (7) |
| `conditionalTableLab` | `widgets.tsx:18674` — `LabReadout label={… "derived value"} value={String(truth.value)} tone="good"` — the graded number, printed green, ungated. (S237 recorded this at a prior line number; still live.) | 15 (10) |
| `signedFractionLab` | `widgets.tsx:6855` — prints `"different signs" → {expectedSign}` ungated; `6856` then colours the learner's claim leaf/berry by `chosenSign === expectedSign` **before Check**. | 9 (6) |
| `shapeFamilyBuilder` | `widgets.tsx:18559` — when the four sliders match the four targets, the SVG caption switches from `'build from attributes'` to `spec.targetName`, i.e. the name being asked for. | 6 (0) |

### 3.3 R2 — correctness signalled before commit (24 engines)

The shape the claim describes ("a slider that visibly reports correctness before commit") exists, in
this precise form: a readout or shape turns leaf-green the instant learner state equals target state,
with no `tone` gate.

Highest-usage and/or graded instances:

- `distributionCompareLab` — `widgets.tsx:10012`: `fill={selectedCorrect ? PALETTE.leaf : PALETTE.sky}`,
  with `selectedCorrect` defined at `9951` as `|selected − answer| <= tolerance`. **33 instances, 17 graded.**
- `fractionGrid` — `widgets.tsx:17957`: green overlap **and** a machine-readable `data-at-target` attribute. 4 instances, all graded.
- `barBuilder` — `widgets.tsx:12462` and `12515`: `const done = hs[i] === spec.target[i]` per category; each row/bar turns leaf-green as it matches. Build until every bar is green. 70 instances (all interactive).
- `slopeTriangle` — `widgets.tsx:8116-8118`: live pill reading `"✓ passes through B"` / `"misses B"`. 10 instances, 6 graded.
- `unitRuler` — `widgets.tsx:18573` (finish marker leaf when exact) and `18577` (`LabReadout … tone={st.placements===spec.requiredPlacements?'good':…}`). 45 instances.
- `derivativeRuleLab` — `widgets.tsx:18781` `tone={solved?'good':'neutral'}` where `solved` (`18775`) is `up===targetInnerRate && vp===targetOuterRate`; also `18760`, `18809`, `18825`.
- Same pattern, smaller usage: `quadraticExplore` (`14297`, `14305`, `14320`), `volumeBuilder` (`7054-7069`, `7081`), `functionMachine` (`13170`), `circleMeasureExplore` (`3505`, `3517-3519`), `transformExplore` (`12882`), `balanceScale` (`11319`, `11325` — `balanced ✓`), `lineRelationLab` (`18347`), `triangleConstraintLab` (`18400`), `coordinateProofLab` (`18430`, `18435-18440`), `solidSliceLab` (`18459`), `triangleAngleLab` (`18480`), `verticalLineScanner` (`18497`), `samplingBiasLab` (`18520`), `conicLocusLab` (`18737`), `relatedRatesLab` (`18892`, `18932`), `triangleClosureLab` (`1809`), `systemsExplore` (`13992-13993`), `extraneousRootLab` (`11918-11919`, candidates stroked leaf/berry by `isPhantom` before the pick), `radicalCheck` (`5237`, `5243` — 0 authored uses).
- `numberLineHop` **hop-size mode only** — `widgets.tsx:16391-16395` (per-mark `hit`/`skipped` in leaf/berry) and `16410-16411`. **Exactly 1 authored instance**; the other 462 are landing mode and are clean (`evaluate.ts:2201-2206`, no directional branch; only a `tone === "info"` ghost at `widgets.tsx:16649`).

### 3.4 R3 — the convergence channel: directional feedback × unlimited retries (38 engines)

This is the platform's *standard* miss-feedback contract for quantity engines: on a wrong check,
`evaluate` selects between exactly two authored strings by comparing the learner's value to the target.

```ts
// src/lib/evaluate.ts:861-884 (areaModel), and 45 more sites
return area < spec.targetArea
  ? { correct: false, feedback: spec.lowFeedback }
  : { correct: false, feedback: spec.highFeedback };
```

Representative sites: `fractionBar` `evaluate.ts:514-516`, `numberLinePlace` `628-639`,
`areaModel` `861-884`, `estimateSlider` `2173-2176`, `hundredthsGrid` `661`, `slider` `1842`,
`volumeBuilder` `1077`, `moneyBoard` `1890`, and 38 others.

On a **graded** step the two-attempt bound (§1) makes one directional bit nearly worthless. On an
**`interactive`** step it is a free binary search: Check → "too low" → move up → Check, repeated
without limit, converges on any continuous target in ~log₂(range) presses with zero mathematics.
**1,221 authored instances sit on `interactive` steps in this family.**

`dragBucket` is the sharpest case because its miss feedback is quantitative, not merely directional:

```ts
// src/lib/evaluate.ts:2110
const detail = `${right} of ${spec.items.length} sorted right so far. `;
```

That is a hill-climbing oracle — swap one item, re-check, keep the swap if the count rose. 182
instances, **145 of them interactive** (unbounded), 172 lessons. Note by contrast that `plotPoint`
returns a `score` (`evaluate.ts:2146`) but never puts it in the feedback string, and no caller reads
`score` (`playerStore.ts:351, 361` use only `.correct` and `.feedback`) — `plotPoint` is clean.

### 3.5 R4 — the model performs the graded comparison (2 engines)

- **`dragOrder`** — `widgets.tsx:15170-15200`. For any item set whose labels parse as numbers, the widget
  plots each label's *value* on a shared vertical axis ("Live consequence (s48)"), so a correct size
  ordering is a monotone staircase and any error a visible zigzag. `parseOrderVal`
  (`widgets.tsx:15561-15567`) parses integers, decimals **and fractions `a/b`**. On the authored corpus
  **54 of 93 instances have all-numeric labels** (41 interactive, 8 check, 5 challenge). For "put these
  fractions in order", the widget performs the comparison the step exists to grade; the learner drags
  until the line stops zigzagging.
- **`estimateSlider`, discrete mode** — `widgets.tsx:16022-16050` draws the true value on the ruler
  labelled `actual {spec.target}`, and `16005` computes a live gap readout for the selected choice.
  Picking the choice nearest the diamond replaces estimating. **Only 4 authored instances** (1 graded),
  so the harm is small; the continuous log-scale mode (92 instances) is clean — its acceptance band is
  correctly gated at `widgets.tsx:16209`.

### 3.6 Engines the claim implicates that are, in fact, clean

Worth stating explicitly, because the "17" list points at them:

- **`mcq`** (3,291 instances) — display order is seeded-shuffled (`widgets.tsx:385-388`) precisely
  because authoring puts the correct option first in 99.8% of cases; grading is by `option.id`. Retry
  and reveal decorations are tone-gated (`widgets.tsx:399-400`). No pre-commit signal.
- **`numeric`**, **`fractionEntry`**, **`pointEntry`**, **`subitizeFlash`** — typed entry, no state to fish.
- **`matchPairs`** (175) — links are drawn identically whether right or wrong (`widgets.tsx:15455-15460`);
  the correct partner appears only at `tone === "info"` (`15421`). The positional-alignment leak (143 of
  175 authored specs listed partners in lockstep) was fixed by a seeded shuffle **plus** a rotation guard
  against the identity permutation (`widgets.tsx:15366-15375`).
- **`buildExpression`** (232) — the "bank spells the answer left-to-right" leak (155 of 237 specs) was
  fixed by grouping plus a `spellsAnswer` rotation guard (`widgets.tsx:15584-15607`).
- **`numberLineHop` landing mode** (462) and **`plotPoint`** (71) — see above.
- **`steppedReveal`** (54, all interactive) — reveals authored panels in order; it has no answer at all,
  so it cannot be fished. Its problem is different (see §6, deprecate).

---

## 4. Full engine inventory

127 engine types appear in authored content; 129 are registered (`schema.ts:6654`, the
`WidgetSpec` discriminated union) — `toggleExplore` and `radicalCheck` have zero authored uses.
"instances" counts `steps[].widget` **plus** `remedials[].concept/check.widget` across all 1,701
lesson files, which is the same denominator `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` used (verified:
15 of 17 of its `authored_uses` figures reproduce exactly; `numeric` and `mcq` differ by +21 and +2,
i.e. content drift since S235).

| engine | interaction | instances | graded | interactive | lessons | verdict |
|---|---|---:|---:|---:|---:|---|
| `numeric` | type a number into a single field | 4644 | 4130 | 514 | 1376 | CLEAN |
| `mcq` | pick one option from a shuffled choice list | 3291 | 2885 | 406 | 1349 | CLEAN |
| `numberLineHop` | tap the landing a run of equal hops reaches (or set the stride) | 463 | 147 | 316 | 247 | CLEAN |
| `exactNumberLab` | reveal derivation stages on an exact-number state, then answer (typed, choice, relation, or a drag rail) | 358 | 345 | 13 | 124 | R1 |
| `buildExpression` | token bank → expression line | 232 | 205 | 27 | 106 | CLEAN |
| `dragBucket` | per-item bucket picker, partial credit | 182 | 37 | 145 | 172 | R3 |
| `matchPairs` | select left, tap right to link | 175 | 29 | 146 | 170 | CLEAN |
| `tenFrame` | tap cells of a ten-frame until it shows the asked count | 169 | 20 | 149 | 81 | R1 |
| `tapDiagram` | SVG-style hotspots as real buttons | 134 | 37 | 97 | 72 | CLEAN |
| `fractionBar` | numerator + denominator → bar + fraction + reference | 103 | 4 | 99 | 61 | R1 |
| `areaModel` | count a fixed grid, or build a rectangle by width and height | 102 | 10 | 92 | 49 | R3 |
| `estimateSlider` | drag an estimate on a log scale, or pick among stated estimates | 96 | 1 | 95 | 53 | R4 |
| `dragOrder` | arrow buttons — keyboard & touch native | 93 | 21 | 72 | 79 | R4 |
| `plotPoint` | grid of toggle cells, y from the bottom | 71 | 18 | 53 | 45 | CLEAN |
| `barBuilder` | set bar heights to match a target dataset | 70 | 0 | 70 | 38 | R2 |
| `geometricConstraintLab` | reveal derivation stages on a geometry figure, then answer | 66 | 44 | 22 | 20 | R1 |
| `lengthCompare` | align two strips and compare/measure the overhang | 66 | 32 | 34 | 21 | CLEAN |
| `placeValueTransformLab` | reveal stages on a rounding/place-value transform, then answer | 60 | 36 | 24 | 14 | R1 |
| `baseTenCompose` | add/remove hundreds, tens and ones blocks to build a number | 56 | 7 | 49 | 35 | R1 |
| `affineRelationshipLab` | reveal derivation stages on one or two lines, then answer | 55 | 44 | 11 | 12 | R1 |
| `steppedReveal` | press to reveal authored panels one at a time; no answer | 54 | 0 | 54 | 54 | CLEAN |
| `numberLinePlace` | drag a marker to a target value | 52 | 7 | 45 | 40 | R3 |
| `proportionalReasoningLab` | reveal stages on a rate/ratio state, then answer | 47 | 32 | 15 | 9 | R1 |
| `fractionEntry` | typed fraction / mixed-number answer | 46 | 45 | 1 | 17 | CLEAN |
| `unitRuler` | place repeated unit lengths along an object | 45 | 0 | 45 | 24 | R2 |
| `columnCalc` | work a standard column algorithm one unresolved column at a time | 42 | 5 | 37 | 24 | CLEAN |
| `unitCircleExplore` | angle → point + reference triangle + cos/sin | 40 | 0 | 40 | 40 | R3 |
| `clockSet` | set the hands of an analog clock to a target time | 40 | 23 | 17 | 8 | CLEAN |
| `quotientReasoningLab` | reveal stages on a quotient/remainder state, then answer | 39 | 28 | 11 | 6 | R1 |
| `hundredthsGrid` | translate / reflect a shape onto a target | 36 | 0 | 36 | 18 | R3 |
| `graphRead` | read a value off an authored graph | 34 | 10 | 24 | 13 | CLEAN |
| `distributionCompareLab` | standardized gap ↔ visible overlap | 33 | 17 | 16 | 10 | R2 |
| `sequenceBuild` | set a rule and watch terms/partial sums accumulate | 30 | 0 | 30 | 24 | R3 |
| `expLogExplore` | one base, two curves, one mirror | 29 | 0 | 29 | 28 | R3 |
| `slider` | params bound to live visual | 28 | 0 | 28 | 26 | R3 |
| `signChart` | produce the chart, don't read it | 28 | 1 | 27 | 26 | CLEAN |
| `rationalCompare` | signed / fraction / decimal pair → relation symbol | 28 | 25 | 3 | 8 | CLEAN |
| `placeCompare` | place-aligned digits + symbol choice | 28 | 16 | 12 | 4 | CLEAN |
| `quadraticExplore` | drag coefficients/roots and watch the parabola | 26 | 0 | 26 | 25 | R2 |
| `pointSetReasoningLab` | reveal stages over a point set, then answer | 23 | 15 | 8 | 5 | R1 |
| `derivativeTrace` | f on top, f′ drawing itself underneath | 20 | 0 | 20 | 18 | R3 |
| `solveBalance` | apply the same operation to both sides of a balance | 20 | 3 | 17 | 16 | CLEAN |
| `moneyBoard` | compose an exact amount | 19 | 10 | 9 | 4 | R3 |
| `volumeBuilder` | stack unit cubes to l x w x h | 19 | 0 | 19 | 18 | R2 |
| `shapeHierarchyLab` | classify a shape or judge an always/sometimes/never claim | 19 | 14 | 5 | 3 | CLEAN |
| `unitChain` | cross a chain of unit hops, multiplying or dividing at each | 19 | 14 | 5 | 6 | CLEAN |
| `dilationExplore` | set a scale factor and watch the image | 18 | 0 | 18 | 16 | R3 |
| `subitizeFlash` | a dot pattern flashes; type how many | 18 | 16 | 2 | 10 | CLEAN |
| `pointEntry` | typed ordered tuple — coordinate pair / vector | 18 | 18 | 0 | 13 | CLEAN |
| `oddEvenPairs` | pair chips; the leftover settles it | 17 | 9 | 8 | 5 | CLEAN |
| `graphZoom` | shrink the neighbourhood yourself | 17 | 0 | 17 | 17 | CLEAN |
| `algebraTiles` | x-tiles + unit tiles; zero pairs cancel | 17 | 0 | 17 | 12 | CLEAN |
| `probabilityArea` | shade a grid → fraction + decimal | 16 | 1 | 15 | 15 | R3 |
| `conditionalTableLab` | pick a cell/condition in a two-way table, then claim the derived value | 15 | 10 | 5 | 3 | R1 |
| `triangleSolve` | two dials; only one of them moves the ratio | 15 | 0 | 15 | 15 | R3 |
| `compositeAreaLab` | decomposition ↔ signed piece ledger ↔ exact claim | 15 | 9 | 6 | 4 | CLEAN |
| `equationOutcomeLab` | sign × reciprocal × exact fraction claim | 15 | 5 | 10 | 10 | CLEAN |
| `trialProbabilityLab` | fixed evidence ↔ exact probability claim | 15 | 9 | 6 | 2 | CLEAN |
| `dotPlot` | stack dots above number-line values | 14 | 1 | 13 | 9 | CLEAN |
| `graphStoryLab` | match a story to a graph, or assemble the segment sequence | 14 | 10 | 4 | 2 | CLEAN |
| `triangleConstraintLab` | move a constrained triangle until a criterion is fixed | 13 | 0 | 13 | 11 | R2 |
| `compassConstruct` | set a compass radius and swing arcs to construct | 12 | 0 | 12 | 10 | R3 |
| `circleMeasureExplore` | drag chords/tangents/arcs on a circle | 11 | 0 | 11 | 11 | R2 |
| `vectorExplore` | a sum is a journey; a dot product is an angle | 11 | 1 | 10 | 9 | R3 |
| `ratioTable` | fill the missing cell by scaling | 11 | 0 | 11 | 10 | R3 |
| `secantSlope` | watch the secant fall onto the tangent | 11 | 0 | 11 | 11 | R3 |
| `percentBar` | percent of a whole on a 100-part bar | 11 | 0 | 11 | 7 | R3 |
| `scatterFit` | drag a line to fit scattered points | 11 | 0 | 11 | 9 | CLEAN |
| `inversePipeline` | set x so a·x + b balances c | 11 | 6 | 5 | 3 | CLEAN |
| `shapeParts` | select the parts (faces/edges/vertices) a solid has | 11 | 0 | 11 | 5 | CLEAN |
| `slopeTriangle` | drag a rise/run triangle from a point | 10 | 6 | 4 | 3 | R2 |
| `functionMachine` | input → rule → output | 10 | 0 | 10 | 10 | R2 |
| `binomialAreaLab` | a product is a rectangle; the middle term is a SUM | 10 | 0 | 10 | 10 | CLEAN |
| `signedFractionLab` | set sign and reciprocal channels, then claim the exact fraction | 9 | 6 | 3 | 1 | R1 |
| `balanceScale` | add/remove weights until the pans balance | 9 | 0 | 9 | 7 | R2 |
| `transformExplore` | translate/reflect/rotate a figure onto a target | 9 | 0 | 9 | 7 | R2 |
| `slopeField` | instructions a curve obeys | 9 | 0 | 9 | 6 | R3 |
| `distanceGrid` | distance as the hypotenuse of a right triangle | 9 | 0 | 9 | 9 | CLEAN |
| `percentChangeLab` | base ↔ percent change ↔ final price | 9 | 4 | 5 | 2 | CLEAN |
| `compoundEventLab` | stage product ↔ sample space ↔ exact claim | 8 | 5 | 3 | 1 | CLEAN |
| `samplingBiasLab` | choose a sampling design and draw repeated samples | 7 | 0 | 7 | 7 | R2 |
| `solidSliceLab` | slide a cutting plane through a solid and read the section | 7 | 0 | 7 | 7 | R2 |
| `accumulateArea` | the Fundamental Theorem, discovered | 7 | 0 | 7 | 7 | R3 |
| `scaledCircleLab` | plan scale ↔ real radius ↔ circle formula | 7 | 2 | 5 | 2 | CLEAN |
| `argandExplore` | a complex number is a place; multiplying is a turn | 7 | 0 | 7 | 7 | CLEAN |
| `quadDrag` | drag quadrilateral vertices; the shape reports its family | 7 | 0 | 7 | 7 | CLEAN |
| `mixedRegroup` | regroup a mixed number before operating | 7 | 6 | 1 | 4 | CLEAN |
| `shapeFamilyBuilder` | set sides/right angles/equal sides/parallel pairs to build a named family | 6 | 0 | 6 | 6 | R1 |
| `systemsExplore` | place a point on both lines → the solution | 6 | 0 | 6 | 6 | R2 |
| `angleMeasure` | open two rays to a target angle on a protractor | 6 | 1 | 5 | 6 | R3 |
| `spinnerSim` | equal sectors; shade the favourable ones | 6 | 0 | 6 | 6 | R3 |
| `lineExplore` | drag a line by slope and intercept | 6 | 0 | 6 | 6 | CLEAN |
| `conicLocusLab` | move eccentricity and sample points to name the conic family | 5 | 0 | 5 | 5 | R2 |
| `coordinateProofLab` | drag a vertex until a coordinate claim holds | 5 | 0 | 5 | 5 | R2 |
| `relatedRatesLab` | slide the driving variable and read the induced rate | 5 | 0 | 5 | 3 | R2 |
| `netFold` | unfold a prism; faces labelled by area → surface area | 5 | 0 | 5 | 5 | R3 |
| `treeDiagram` | branches multiply into leaves | 5 | 0 | 5 | 5 | R3 |
| `circleAngleExplore` | the angle that refuses to move | 5 | 0 | 5 | 5 | R3 |
| `sliceSum` | slice it, measure the slice, add them up | 5 | 0 | 5 | 5 | R3 |
| `boxPlot` | set the five-number summary | 5 | 0 | 5 | 5 | CLEAN |
| `evalOrder` | tap an operator to collapse it, in precedence order | 5 | 4 | 1 | 3 | CLEAN |
| `fractionGrid` | shade rows and columns of a unit square to model a fraction product | 4 | 4 | 0 | 2 | R2 |
| `derivativeRuleLab` | move rates in a product/quotient/chain/substitution model | 4 | 0 | 4 | 4 | R2 |
| `triangleAngleLab` | drag a vertex; the three angles stay summed to 180 | 4 | 0 | 4 | 4 | R2 |
| `riemannSum` | trap the area, then squeeze | 4 | 0 | 4 | 4 | R3 |
| `polarTrace` | the petal rule, and the birth of a cardioid | 4 | 0 | 4 | 4 | R3 |
| `integerChips` | positive/negative chips; zero pairs cancel | 4 | 0 | 4 | 4 | R3 |
| `matrixTransform` | 2×2 linear-map laboratory | 4 | 1 | 3 | 4 | CLEAN |
| `lineRelationLab` | rotate/offset a line until it is parallel or perpendicular | 3 | 0 | 3 | 3 | R2 |
| `elapsedTime` | start clock → end clock; duration between | 3 | 1 | 2 | 1 | R3 |
| `covariationScrubber` | scrub one variable and watch the co-varying one | 3 | 0 | 3 | 3 | R3 |
| `doubleNumberLine` | two aligned lines in a fixed ratio | 3 | 0 | 3 | 3 | R3 |
| `placeValue` | base-ten blocks: hundreds / tens / ones | 3 | 0 | 3 | 3 | R3 |
| `taylorApprox` | the polynomial hugs, then peels away | 3 | 0 | 3 | 3 | R3 |
| `numberLineRay` | set a ray on a number line to state an inequality | 3 | 1 | 2 | 3 | CLEAN |
| `fractionCompare` | equal wholes; tap the bigger bar | 3 | 3 | 0 | 2 | CLEAN |
| `absValueLine` | place a value on a number line and read its distance | 3 | 2 | 1 | 1 | CLEAN |
| `sampleSim` | repeated polls pile into a sampling distribution | 3 | 0 | 3 | 3 | CLEAN |
| `verticalLineScanner` | sweep a vertical line across a relation to test functionhood | 2 | 0 | 2 | 2 | R2 |
| `extraneousRootLab` | square both sides; watch a phantom be born | 2 | 0 | 2 | 2 | R2 |
| `rotationLab` | rotate a figure by a chosen angle about a centre | 2 | 0 | 2 | 2 | R3 |
| `feasibleRegionExplore` | drag a constraint fence, watch the region reshape | 2 | 0 | 2 | 2 | R3 |
| `parametricTrace` | scrub t, watch direction accumulate as arrowheads | 2 | 0 | 2 | 1 | R3 |
| `ciCapture` | what "95% confident" actually counts | 2 | 0 | 2 | 1 | CLEAN |
| `shuffleTest` | a randomisation test you can feel | 2 | 0 | 2 | 2 | CLEAN |
| `triangleClosureLab` | hinge span ↔ strict triangle inequality | 1 | 1 | 0 | 1 | R2 |
| `fractionOfSet` | select a fraction of a group of objects | 1 | 0 | 1 | 1 | R3 |

---

## 5. Ranked remediation

Score = severity × (graded instances + 0.3 × interactive instances). Severity R1=3, R2/R4=2, R3=1.
The 0.3 discount on `interactive` reflects §1: fishing there wastes the learning but does not forge
mastery evidence. Raw counts are in the table so the weighting can be re-argued.

### Top 5 by harm × usage

| # | Engine | Verdict | Instances | Graded | Lessons | Score | The one-line reason |
|---|---|---|---:|---:|---:|---:|---|
| 1 | `exactNumberLab` | R1 | 358 | **345** | 124 | 1046.7 | A revealable stage prints the graded answer; 28 steps *require* opening it before Check unlocks. |
| 2 | `tenFrame` | R1 | 169 | 20 | 81 | 194.1 | The wrong-attempt feedback names `spec.target`; unbounded retries on 149 of them. |
| 3 | `geometricConstraintLab` | R1 | 66 | 44 | 20 | 151.8 | Same staged-reveal architecture; derived side/area stages print the answer. |
| 4 | `affineRelationshipLab` | R1 | 55 | 44 | 12 | 141.9 | Same; the `evaluate:*:value` stage prints the evaluated y. |
| 5 | `placeValueTransformLab` | R1 | 60 | 36 | 14 | 129.6 | Same; `round:sum` / `division:quotient` stages are `fmt(answerNumber)`. |

Next five: `proportionalReasoningLab` (109.5), `fractionBar` (101.1), `quotientReasoningLab` (93.9),
`dragOrder` (85.2), `dragBucket` (80.5).

### REDESIGN (the interaction is worth keeping; the leak is not intrinsic to it)

1. **The staged-reveal lab family** — `exactNumberLab`, `geometricConstraintLab`, `affineRelationshipLab`,
   `placeValueTransformLab`, `proportionalReasoningLab`, `quotientReasoningLab`, `pointSetReasoningLab`.
   One architectural fix serves all seven: mark the terminal, answer-bearing stage in `*Truth()` and
   either (a) exclude it from `*ExplorationKeys()` so it is never revealable pre-verdict, or (b) render
   it only at `tone === "info"` — the convention 154 other sites already follow. Do **not** rely on
   `authoredStages` bodies: 202/202 `approximationEvaluate` steps supply none, and
   `quotientReasoningLab` prints the raw value alongside an authored body anyway (`widgets.tsx:8630`).
   Highest leverage in the entire report: 544 graded instances behind one change.
2. **`fractionBar`** — an authoring pass, item by item, on the 54 instances still inheriting
   `showTarget: true` (`schema.ts:839`). The engine already documents the intended distinction at
   `widgets.tsx:1300-1305`; 49 instances have already been switched to `false` since S237, so the pass
   is half-done. Separately, gate the `"✓ equal"` cue at `widgets.tsx:1429` on `tone` regardless of
   `showTarget` — a visible target is defensible pedagogy, a live correctness verdict is not.
3. **`tenFrame` and `baseTenCompose` miss feedback** — `evaluate.ts:2184`, `2229`, `2231`. Keep the
   direction ("add more dots"), drop the value. Small diff, 225 instances.
4. **The R2 green-on-correct readouts** — 24 engines. Mechanical fix: wrap each correctness-derived
   `tone`/`fill` in the existing `tone === "info"` (or `"success"`) guard. Prioritise the ones with
   graded instances: `distributionCompareLab` (17), `fractionGrid` (4), `slopeTriangle` (6),
   `conditionalTableLab` (10), `signedFractionLab` (6). The rest are all-interactive and can be batched.
5. **`dragOrder`** — the size plot is genuinely good pedagogy for *sequence* items and is a solver for
   *comparison* items. Gate the plot on the step's intent, or plot ordinal position rather than parsed
   value, for the 54 all-numeric instances.
6. **`dragBucket`** — remove the running count from `evaluate.ts:2110`; keep the named misconception.
   The count is the hill-climbing oracle, and it is only there to be encouraging.
7. **The R3 family generally** — the low/high contract is correct design for a manipulative. The
   defect is its interaction with unlimited retries on `interactive` steps. Cheapest structural fix is
   at the harness, not in 38 engines: after N wrong checks on an interactive step, either require the
   learner to state what they changed, or degrade to the same reveal path graded steps use
   (`playerStore.ts:367-370`).

### DEPRECATE

1. **`steppedReveal`** (54 instances, 54 lessons, 0 graded) — `widgets.tsx:15921-15983`. The learner
   presses "Reveal step N of M" until the panels are gone. There is no answer, no state, and nothing
   the learner can be wrong about; `evaluate` has no branch for it. It is a paginated paragraph
   wearing a widget's clothes. Replace with authored prose or a `concept` step; this removes 54 steps
   of ceremony without removing any mathematics.
2. **`toggleExplore`** and **`radicalCheck`** — 0 authored instances, still registered
   (`schema.ts:475`, `3498`). `radicalCheck` additionally carries an ungated ✓/✗ verdict display
   (`widgets.tsx:5237, 5243`). Delete both rather than fix `radicalCheck`.
3. **`estimateSlider` discrete mode** (4 instances) — `widgets.tsx:15984-16151`. The mode draws the
   answer on the ruler and measures the learner's distance from it; the task it purports to grade
   ("which estimate is closest") is exactly the measurement it performs. The continuous mode already
   does this job honestly. Re-author the 4 instances onto continuous mode and delete the branch.
4. **`shapeFamilyBuilder`'s target caption** (`widgets.tsx:18559`) — not the engine, the caption:
   printing `spec.targetName` on match is the answer, and the engine's stated lesson ("a family name
   comes from the rules the shape satisfies") is undermined by naming it for the learner.

### RECORD, DO NOT ACT YET

`lengthCompare`'s `"✓ Starting ends lined up — the compare is fair"` (`widgets.tsx:17092-17094`) reports
a *procedural sub-goal*, not the graded answer. It is scaffolding for the measurement convention and
should survive. Listed here only so a future sweep does not delete it as a false positive. The same
applies to `numberLineHop`'s hop-size hit/miss marks: for GCF-by-stride, "which marks does this stride
hit" **is** the mathematics, and the engine's comment says so (`widgets.tsx:16348-16350`).

---

## 6. Reconciliation with what is already recorded

| Record | What it says | This audit |
|---|---|---|
| `PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv` | 17 rows `REMEDIATE_ENGINE_PLAY`; `reversible_manipulation` ∈ {ANSWER_ONLY, LIMITED}; next action "**Add** reversible direct manipulation". | **Correct as written, and it is the opposite property from the claim.** These 17 are engines with too little manipulation, not too much. The CSV's own top two are `numeric` and `mcq`. |
| `CLOSURE_LEDGER.md:151` (CL-P1-059) | "OPEN — 17 ENGINE FAMILIES … reversible/direct-manipulation remediation." | Agreed as a *play-depth* item. **Disagree** with any reading of it as an answer-leak item. It should not be closed by the work this report describes, and vice versa — they are two different backlogs that happen to share a word. |
| `WAVE0_TRUTH_BASELINE_S242.md:40` | "17 reversible-play engine families; 129 engines — **CONFIRMED with caveat** — the 17 was measured against a 127 denominator." | The arithmetic caveat is right (127 audited rows vs 129 registered types; the two extras are the zero-use `toggleExplore` and `radicalCheck`). But confirming the *count* left the *semantics* unexamined, which is how the inversion propagated into `CLAUDE_COWORK_EXECUTION_PROMPT_S237.md:157` and `HANDOVER_S237.md:15`. |
| `ANSWER_ON_SCREEN_AUDIT_S237.md` | 14 engines print the graded value during work. Ranked `moneyBoard`/`lengthCompare` first, then "clear leaks", `fractionBar` last as an authoring pass. | **This is the right audit and it is the nearest prior art — but it is incomplete and now partly stale.** Agreements and disagreements below. |

**Where I agree with S237.** Its reframing ("the defect is upstream, in what the widget draws, not in
`describeState`") is correct and is confirmed independently here. Its `fractionBar` caution — that a
visible target is the task in some items and the giveaway in others — is right, and is why §5 asks for
an authoring pass rather than a blanket flag flip.

**Where I disagree with S237.**

1. **It under-counts by an order of magnitude on the dimension that matters.** S237 asked *"does the
   widget print the graded value?"*. It did not ask *"can the learner reach the answer by manipulating
   the widget?"*. Those differ by the whole of R2 (24 engines that colour correctness without printing
   it), R3 (38 engines whose miss feedback is a search oracle), and R4. 14 → 77.
2. **It missed the staged-reveal lab family entirely** — the single largest source of graded-step answer
   exposure in the codebase (544 graded instances). The reason is visible in S237's own method: it
   audited what the widget draws *unconditionally*, and these engines draw the answer only *after a
   learner tap*. A tap the app then **requires** before it will accept an answer (`evaluate.ts:2279`)
   is not a learner choice, and should have been in scope.
3. **Its `fractionBar` figure is stale.** S237 recorded "96 of 101 authored instances leave the
   default". Current corpus: **54 of 103** leave it, 49 are explicitly `false`. Roughly half the
   authoring pass has silently happened; the remediation note should be updated rather than re-scoped.
4. **Several of its "clear leaks" are still live and unfixed**, and should be re-flagged rather than
   assumed closed: `conditionalTableLab` (`widgets.tsx:18674`), `signedFractionLab` (`widgets.tsx:6855`),
   `extraneousRootLab` (`widgets.tsx:11918-11919`). The only one I can see closed against its
   description is `equationOutcomeLab`, which now has a regression test
   (`src/components/widgets.answerGating.s237.test.tsx:56-68`) — evidence that the fix pattern works and
   is cheap to pin.
5. **It ranked by pedagogical ambiguity; this report ranks by graded exposure.** S237 put `moneyBoard`
   and `lengthCompare` first because their fix is unambiguous. That is a good *sequencing* argument and
   a poor *harm* argument: between them they carry 13 graded instances, against `exactNumberLab`'s 345.

**Nothing in the repo currently records the R1-a (staged reveal), R2 (green-on-correct), R3
(directional-feedback + unbounded retry) or R4 (model-solves-task) channels.** `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md:18`
and `COWORK_CACHE/PENDING_WORK_INVENTORY_S237.md:15` both carry the row `ENGINE_REVERSIBLE_PLAY | 17`,
which — read correctly — tracks none of them.

---

## 7. What could not be determined from source alone

Everything above is a source read plus a corpus count. These need the running app:

1. **Whether the leak is legible to a child.** `stage.value` for `approx:compute` is a bare number on a
   button that says "combine and round to 3 decimal places". Whether a Grade-10 learner *notices* that
   this is the answer is an empirical question, and it changes the harm estimate by a lot. Needs
   observation, not a diff.
2. **Contrast and salience of the R2 cues.** `PALETTE.leaf` at `fillOpacity .45` on a small SVG
   overlap may be nearly invisible at 390px; the same green as a 2px border on a `LabReadout` is not.
   R2's severity is really "how loudly does it say *correct*", which only rendering at real viewport
   sizes (390 / 768 / 1440) can answer. S237 recorded the same gap.
3. **Whether the R3 binary search is *practically* available.** It depends on retry-loop friction —
   animation, scroll position, whether the Check button re-enables immediately, whether the feedback
   dock steals focus. Source says the loop is unbounded (`playerStore.ts:367-370`); only clicking it
   says whether a learner would actually do 8 rounds of it.
4. **Screen-reader parity of the leaks.** Several leaks live in `aria-label` (`widgets.tsx:8231`
   proportionalReasoningLab, `1342` fractionBar, `16906` lengthCompare) — non-visual learners may get
   *more* answer than sighted ones, which is S237's asymmetry finding in a new place. Needs an actual
   screen reader.
5. **Variant generators.** 5,897 `variant` declarations regenerate widget specs at runtime
   (`src/lib/variants.ts`). Every count in this report is of **authored** specs. A generator that emits
   `showTarget: true`, or a `requiredStageKeys` containing the answer stage, would multiply the exposure
   invisibly to a corpus grep. Determining that needs the generators run — `npx tsx scripts/measure/verify.mts`
   — not read.
6. **Depth of read is uneven, deliberately.** Every engine with ≥10 authored instances, and every
   engine flagged by the automated detectors, was read at its render site. The remaining low-usage
   engines (<10 instances, ~40 of them) were covered by detector sweep plus spot check only. A `CLEAN`
   verdict on those means "no channel found by three detectors", not "proved absent" — the same caveat
   S237 attached to its own `CLEAN` lists.
7. **No gate was run.** Per the task's do-not-change-code constraint, this report contains no edits and
   no test runs. Every claim above is reproducible by reading the cited `file:line`.
