# S327-A7 — First-ever full review: 12 never-assessed lessons, one per course

Independent Cowork first-pass review disposition for 12 lessons that have never before received a
`lesson-disposition` record, one lesson drawn from each of 12 different courses spanning
Kindergarten through college calculus:

| # | Lesson | Course | Grade band |
|---|---|---|---|
| 1 | `alg1-04-03` | `solving-equations` | Algebra 1 |
| 2 | `dc-03-01` | `derivatives-in-context` | Calculus |
| 3 | `dgr1-02-01` | `data-graphs-g1` | Grade 1 |
| 4 | `g1s-03-02` | `compose-shapes-g1` | Grade 1 |
| 5 | `g1t-01-01` | `add-three-numbers-g1` | Grade 1 |
| 6 | `g2n-01-01` | `four-addends-g2` | Grade 2 |
| 7 | `g4p-03-01` | `patterns-factors-g4` | Grade 4 |
| 8 | `g4v-02-04` | `measure-problems-g4` | Grade 4 |
| 9 | `kc-03-01` | `counting-to-20-k` | Kindergarten |
| 10 | `sc-02-02` | `series-convergence` | Calculus |
| 11 | `smg1-02-03` | `shapes-measure-g1` | Grade 1 |
| 12 | `tm-05-03` | `transformations-measurement` | Grade 5/6 |

For each lesson: every widget's math was recomputed by hand or in a `node`/`npx tsx` one-off (calculus
lessons `dc-03-01` and `sc-02-02` were checked most rigorously — derivative/limit/series rules
recomputed symbolically and numerically); every wrong-answer feedback string was checked against the
actual misconception it should diagnose; every `remedials[]` block was checked against
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` R1-R6 (plus R7-R9 where a visual/text defect
applies); every referenced `figure` id was grepped against `src/components/figureIds.ts` and read in
`src/components/figures.tsx` to confirm it is registered and truthfully depicts the bound step; MCQ
option lengths were compared for balance; language was checked against the course's stated grade band;
and question jobs were checked for progression rather than pure repetition.

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` was grepped for each of the 12 lesson ids under the
`LESSON_PROGRESSION_AND_DUPLICATION` and `CHOICE_SURFACE_INTEGRITY` workstreams: **zero rows exist for
any of the 12 lessons under either workstream** (each lesson carries only the standard open
`VISUAL_FIRST_REPRESENTATION` / `GRADE_LANGUAGE_REVIEW` / `LESSON_COMPLETE_DISPOSITION` triad, which
this report and its paired NDJSON close). No cross-fix to the queue CSV was required or made.

Small, concrete defects found were fixed directly in the lesson's own JSON (scope: only the 12 named
lesson files, nothing in `src/**`, `scripts/**`, or any staging/ledger file). Where a defect would need
unbounded rewriting or `src/**` engine work, the lesson is dispositioned REVISE or ESCALATE with the
defect described precisely instead. Read-only otherwise. This packet does not touch the ledger; the
disposition NDJSON lives at `reports/closure/cowork-staging/laneB-s327-A7.jsonl`.

---

## 1. `alg1-04-03` — *Inequalities on Both Sides* (`solving-equations`, Algebra 1)

**Disposition: KEEP / SUFFICIENT / FIT** (one defect found and fixed directly; see below).

All algebra recomputed by hand:
- `c1` 2x+5>5x−4 → −3x>−9 → flip → **x<3** (matches figure `alg1-both-sides-ineq`'s label).
- `i1` `equationOutcomeLab` 3x+4>6x−8: op sequence `b-collect` (subtract 6x, value −6) →
  `b-const` (subtract 4, value −4) → `b-flip` (divide by −3 AND flip, scale value
  −0.3333333333333333 = exactly −1/3) → **x<4**. Correct at every step.
- `k1` `buildExpression` "Solve 2x + 5 > 5x − 4": `correct=[x,<,3]`. `commonBuilds`:
  `[x,>,3]` ("the flip got missed" — correct diagnosis) and `[x,<,−3]` ("−9÷−3=3, not −3" —
  correct diagnosis, recomputed). Neither trap sequence collides with `correct` or each other.
- `c2` alternate no-flip route: 2x+5>5x−4 → 9>3x → **x<3**, same answer, matches figure
  `alg1-positive-side`.
- `i2` `matchPairs`: e1 `5x+1>8x−8`→x<3(r1); e2 `3x+7<7x−5`→x>3(r2); e3 `5x−1>2x+8`→x>3
  no-flip(r3) — all three re-solved by hand, all three pairings correct. `pairErrors` for the
  e1↔r2 and e2↔r1 swap-traps both recompute correctly and explain the actual swap.
- `k2` `buildExpression` "Solve 4x + 2 > x + 11" → 3x>9 → **x>3**, no flip (divided by +3).
  `commonBuilds` `[x,<,3]` (wrongly flipped on a positive divisor — correct diagnosis) and
  `[x,>,4]` (9÷3=3 not 4 — correct diagnosis) both recomputed correct.
- `k3` `mcq` "when must you flip" — correct answer (divide/multiply by a negative only) and both
  distractors ("any negative present," "x on both sides") are real, nameable misconceptions with
  accurate feedback. Option lengths 30/44/44 chars — balanced, no length-based leak.
- `ch1` `buildExpression` "Solve 2x + 9 < 6x − 11" → 20<4x → **x>5**, no flip (divided by +4).
  `commonBuilds` recomputed correct, including the alternate-route trap explanation (collecting
  onto the left gives −4x<−20, which *does* require a flip, landing on the same x>5).

Figure check: `alg1-both-sides-ineq` and `alg1-positive-side` are both registered in
`figureIds.ts` and mapped in `figures.tsx` (lines 30852-30853 → `Alg1BothSidesIneq`/
`Alg1PositiveSide`, defined at lines 17927-17944). Both are minimal text-label SVGs whose
`<title>` and on-canvas text truthfully restate the bound concept body (the equation + "collect
the x-terms"; the strategy name + "no flip needed") — read directly, no mismatch.

Question-job progression: ordered-drag construction (i1) → apply the flip case (k1) →
differentiate flip/no-flip across three items at once (i2) → apply the no-flip case (k2) →
abstract the trigger rule itself, conceptual not procedural (k3) → combined culminating challenge
(ch1). No purposeless repeats.

**Defect found and fixed — S316-R6 violation in the remedial.** `remedials[0].concept.body` was a
full worked solution: *"Slow it down with 3x > x + 4. Subtract x: 2x > 4. Divide by 2 (positive —
no flip): x > 2."* — and `remedials[0].check.widget.prompt` then re-asked the byte-identical
equation, `"Solve 3x > x + 4."`, as a 3-option MCQ. `playerStore` injects `[concept, check]`
back-to-back, so the check's answer was stated in full one step before the graded question that
tests it — precisely the R6 failure mode ("no text shown in the same injected pair states the
check's answer"), and worse than the S316 precedent because the equation itself (not just the
technique) was identical.

**Fix applied** (remedial check only; remedial concept, all main steps, and all step/lesson ids
untouched): changed the check to a fresh equation testing the identical no-flip technique —
`"Solve 5x > 2x + 9."` → 3x>9 → **x>3**. New distractors: `x < 3` (feedback: dividing by +3 keeps
the direction) and `x > 9` (feedback: 3x>9 gives x>3, not 9 — a "forgot to divide" diagnosis).
Verified: `R1` prompt differs from `k1`'s; `R2` normalized template `"solve #x > #x + #."` matches
none of `k1`/`k2`/`k3`/`ch1`/`i1`'s normalized templates; `R3` payload wholly different (mcq vs.
buildExpression, different options); `R5` no trap equals the answer or another trap, both
distractor feedbacks are literally true of the new numbers; `R6` now clear — the remedial concept's
worked answer (x>2, for a different equation) no longer matches or leaks the new check's answer
(x>3, for `5x > 2x + 9`).

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `alg1-04-03`.

**Review basis hash** (post-fix): `61aecd920a10cab13a2430588526a486b2ce52ed596eeb5a2febd58e6af901f8`

---

## 2. `dc-03-01` — *The Tangent as an Approximation* (`derivatives-in-context`, Calculus)

**Disposition: KEEP / ESCALATE / FIT** (three defects found and fixed directly; one figure gap
escalated — see below). Flagged by the task as touched earlier this session for GraphZoomW
curvature engine work; verified rather than assumed to need rework.

**i1 GraphZoomW check (per task instruction).** `src/components/graphZoom.s322.test.tsx` hardcodes
dc-03-01's exact `i1` spec (`behaviour: "continuous"`, `a: 3`, `leftValue`/`rightValue`/`fAtA: 5`,
`requiredZoom: 3`, identical prompt/successFeedback strings) as its own authored-spec regression
case, with a comment confirming it "straightens well before the zoom cap." Current state is
coherent; no rework needed.

Calculus recomputed:
- `k1`: f(x)=√x, f′(9) = 1/(2·3) = 1/6 = 0.16667 → rounds to **0.167** (matches, tolerance
  0.005). `commonErrors` 3 (=f(9), the value not the slope), 0.5 (bare exponent before
  multiplying by x^(−1/2)=1/3), 6 (=2√9, the inverted derivative) all recomputed correct.
- `k2`: L(9.1) = 3 + (1/6)(0.1) = 3.016667 → **3.0167** (matches, tolerance 0.0005). True
  √9.1 ≈ 3.016621 (verified), error ≈ 0.00005 as stated.
- `k3`: √x has f″(x) = −(1/4)x^(−3/2) < 0 for x>0 — genuinely concave down everywhere on its
  domain, so tangent lies above curve → overshoot. Correct option and both distractors are real,
  named misconceptions.
- `ch1`: f(x)=x³, a=2: f(2)=8, f′(2)=3(2)²=12, L(2.1) = 8+12(0.1) = **9.2** (matches, tolerance
  0.005). True 2.1³ = 9.261 (verified by node). f″(x)=6x>0 at x=2, genuinely concave up →
  undershoot, matching the explanation and the "9.261 is the true value" trap diagnosis.
- Remedial (`rk1`): f(4)=2, f′(4)=1/(2·2)=0.25, L(4.2)=2+0.25(0.2)=**2.05** (matches). Checked
  against S316 R1-R6: R1/R2/R3 all clear (normalized templates for the remedial and every one of
  k1/k2/k3/ch1 are structurally distinct); **R4 checked against the actual generator**
  (`src/lib/calculusVariants.ts`, `linearisationWidget`/`LINEARISATION_CASES`) — the `sqrtEstimate`
  case with `root: 2` (base 4, matching the remedial's base) only ever draws `delta: 0.1` (target
  4.1), never 0.2 (target 4.2), so the remedial's exact `√4.2` target is not producible by this
  generator; R5 both traps recompute correct, no collisions; R6 clear (the remedial concept is
  generic and states no numeric answer matching the check's own 2.05).

**Defects found and fixed (three direct edits, all within this lesson's own JSON):**

1. **`c2`'s bound figure did not truthfully depict its content.** `c2` teaches
   concavity-sign-determines-error-direction (concave up undershoots / concave down overshoots),
   but its figure `dr-flat-not-turning` (read at `figures.tsx:26270-26295`, `DrFlatButNotTurning`)
   depicts an unrelated idea: a cubic's FLAT tangent at an inflection point not guaranteeing a
   turning point ("f′(0) = 0 is a suspect, not a conviction"). That figure's genuine home is
   `dc-03-03/c1`, which teaches exactly the flat-tangent-not-turning point (and reasonably reuses
   it a second way there, for "the curve peels away from its tangent, governed by f″"). `grep -n
   "concav" src/components/figures.tsx` returns **zero matches anywhere in the codebase** — no
   existing registered figure depicts concavity-driven tangent position at all, so a truthful fix
   needs a **new** figure component, out of this packet's scope per the S316 standard ("where the
   only conforming fix needs a new figure, stop and escalate"). **Fixed**: removed the mismatched
   figure reference from `c2` (an absent figure is not a false-depiction defect; a present-but-wrong
   one is) and set `visualDecision: ESCALATE`, with the precise content a new figure needs recorded
   in the NDJSON `reopenCondition`: two curves side by side, one concave-up with its tangent visibly
   below (labeled undershoot), one concave-down with its tangent visibly above (labeled overshoot).
2. **`k2`'s trap value 3.6 had mismatched feedback.** The authored feedback ("Check: (1/6)(9.1 − 9)
   = (1/6)(0.1), not (1/6)(9.1)") does not describe a mechanism that produces 3.6 — verified by
   node: `3 + (1/6)*9.1 = 4.516667` and `(1/6)*9.1` alone `= 1.516667`, neither is 3.6. The actual
   mechanism: `3 + 6*(9.1−9) = 3.6` exactly — multiplying the run by 6 (the inverted derivative
   value, mirroring `k1`'s own "value 6" trap) instead of dividing by 6. **Fixed**: rewrote the
   feedback to diagnose this correctly.
3. **`ch1`'s trap value 20 had mismatched feedback.** The authored feedback ("Check the increment:
   12 × (2.1 − 2) = 12 × 0.1 = 1.2, not 12 × 2.1") does not describe a mechanism that produces 20 —
   verified by node: `8 + 12*2.1 = 33.2` and `12*2.1` alone `= 25.2`, neither is 20. The actual
   mechanism: `8 + 12*1 = 20` exactly — adding f(2)+f′(2) directly with no scaling by the increment
   (x−a) at all. **Fixed**: rewrote the feedback to diagnose this correctly.
4. **`k3`'s MCQ had an answer-adjacency leak by option length.** Measured precisely with node
   `.length`: correct option carried its own inline justification at 60 characters versus 10/14/40
   for the three distractors — a test-savvy learner could pick the longest, most-qualified-sounding
   option without any math. **Fixed**: shortened the correct label from "Too big — the tangent to a
   concave-down curve lies above it." to "Too big." (matching "Too small."/"Exactly right."'s terse
   style); the justification remains fully intact in that option's own `feedback` string, shown
   after the learner answers. Post-fix lengths: 8/10/14/40 — no longest-wins pattern.

Question-job progression: build the linearisation (k1) → zoom to see why it works, predict-then-
verify (i1) → apply the formula (k2) → abstract to error DIRECTION via concavity (k3) → combined
culminating challenge on a new function, x³ (ch1). No purposeless repeats.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `dc-03-01`.

**Review basis hash** (post-fix): `4b1007711365f07245440a27e52c3fa8ebe73fa846269e5f1273b2fb34d63c6b`

---

## 3. `dgr1-02-01` — *Building a Picture Graph* (`data-graphs-g1`, Grade 1)

**Disposition: KEEP / SUFFICIENT / FIT** (severe remedial defect found and fixed directly).

**Defect found and fixed — R1/R2/R3 violation, byte-identical remedial.**
`remedials[0].check` was a **byte-identical copy of `k1`**: same prompt ("Votes: Cats 6, Dogs 3,
Fish 5. Which got the MOST votes?"), same three MCQ options, same feedback strings verbatim, same
`explanationVariants`. This is the exact defect class `S316_ADJUDICATION_REMEDIAL_STANDARD.md` was
written for, and fails R1/R2/R3 outright — not intermittently, guaranteed on every first walk.

**Fix applied**: rebuilt the remedial check as a genuinely distinct instance —
`"A picture graph shows: Suns ●●●●●●●, Clouds ●●, Moons ●●●●. Which row is the LONGEST?"` — reusing
the remedial concept's own "rows"/"longer row has more" framing and the same `●` icon the `i1`/`i2`
`barBuilder` pictograph widgets use. Verified against R1-R6: R1 prompt differs from `k1`'s; R2 the
counts are drawn as repeated icon glyphs, not digits, so the normalized string shares nothing with
`k1`/`k2`/`k3`/`ch1`'s digit-bearing templates; R3 payload wholly different; **R4 checked against
the actual generator** (`src/lib/g1Variants.ts`, `GdMostMcq`) — it always uses the literal template
`"Votes: ${nm} ${ct}, ... Which got the MOST votes?"` drawing category names only from a fixed
5-name animal pool (`Cats/Dogs/Fish/Birds/Frogs`), so the remedial's icon-based template and its
category words (Suns/Clouds/Moons) cannot be produced by this generator under any draw; R5 both
distractors (Clouds=2, Moons=4) recomputed correct against the true max 7, no collisions; R6 clear
— the remedial concept is fully generic and names no numbers/categories matching the check.

Category words (Suns/Clouds/Moons) were chosen with zero overlap against every other step in the
lesson (`k1`: Cats/Dogs/Fish; `ch1`: Red/Blue/Green; `k3`: Apples/Pears/Plums). **Process note**: an
intermediate `replace_all` edit pass accidentally also touched `k3`'s "Apples" wording — caught
immediately by a full-file grep, and `k3` was reverted to its exact original text (verified against
the initial read) before the remedial's own wording was finalized. Confirmed the file re-parses as
valid JSON afterward and no other content was disturbed.

Rest of the lesson recomputed and verified correct: `i1` `barBuilder` target `[6,3,5]` matches its
prompt; predict `outcomeId: "cats"` correct (6>3). `i2` "one more vote for Dogs arrives" 3→4
correctly reflected in target `[6,4,5]`. `k1` mcq: 6 is the true max among 6/3/5, both distractor
feedbacks accurate. `k2` numeric 6+3+5=**14** verified; `commonErrors` 9 (misses Fish) and 6
(biggest single category, not total) both correct diagnoses. `k3` numeric: 9 total, 4 Apples,
NOT-Apples = 3+2=**5** verified; both `commonErrors` correct. `ch1` mcq: Red 7 > Blue 4 > Green 2,
correct answer and both distractor feedbacks accurate. (`k2` restating Dogs=3 after `i2` updated it
to 4 was considered as a possible continuity nit but is not a defect — every check in this lesson
restates its own complete numeric context rather than relying on carried graph state, the lesson's
consistent self-contained-problem convention, mirrored by `ch1` introducing an entirely fresh
Red/Blue/Green dataset.)

No `figure` fields are used anywhere in this lesson — the `barBuilder` pictograph widgets themselves
are the visual representation for the construct steps, and text/numeric checks are the standard,
consistent pattern for this grade band. `readingProfile: "early"` language is short, concrete, and
grade-true throughout.

Question-job progression: construct the pictograph (i1) → identify the max (k1) → update the graph
with a late arrival (i2) → sum all categories (k2) → complement/NOT-category reasoning on a fresh
dataset (k3) → combined culminating max-identification challenge on a third fresh dataset (ch1) —
identify-max / total / complement are genuinely different operations, not pure repetition.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `dgr1-02-01`.

**Review basis hash** (post-fix): `10efc3c8685cd378fe0f1ec1a0d50155bf27e853436a30487f5492a20569655e`

---

## 4. `g1s-03-02` — *Taking a Shape Apart* (`compose-shapes-g1`, Grade 1)

**Disposition: KEEP / SUFFICIENT / FIT** (same defect class as #3, found and fixed directly).

**Defect found and fixed — R1/R2/R3, byte-identical remedial.** `remedials[0].check` was a
byte-identical copy of `k1` (same prompt, same four MCQ options and feedback verbatim). Rebuilt
around a distinct concrete pair testing the identical skill: `"A rectangle was built from two
matching triangles joined along their long edge. Which pieces can you recover by opening the
seam?"` (k1 used two equal squares). All four option labels/feedback rewritten fresh. R4 checked
against the actual declared generator (`src/lib/g1Variants.ts`, `Smg1ShapeSidesMcq`): it produces
an entirely different question genre ("Which shape has N sides and M corners?"), not a
decompose/recover question at all — zero collision risk. R6 clear: the remedial concept teaches
square-from-triangles, not rectangle-from-triangles, so it doesn't state the check's specific
answer despite sharing the word "triangle."

Figure `ks-build-shapes` (used at `c1`, `c2`, and the remedial concept) is registered and mapped
(`figures.tsx:14899`, `KsBuildShapes`); its SVG geometry is a square split along its diagonal into
two right triangles — geometrically accurate and direction-neutral, correctly serving both "read
backward" (`c1`) and "read forward" (`c2`/remedial) framings.

Rest of the lesson recomputed and verified correct: `i1` tapDiagram (diagonal cut of a square →
triangle) and its three wrong-hotspot feedbacks; `k2` numeric (3 corners on one triangle piece —
verified geometrically that a square's diagonal connects two *existing* opposite corners, creating
no new corner, only a new edge, so both `commonErrors` diagnoses are literally true); `k3` mcq
(open the middle seam reverses the join); `ch1` numeric (rectangle has 4 sides). MCQ option-length
balance checked for `k1` (17/31/13/11 chars), `k3` (20/21/25/20), and the rebuilt remedial
(19/31/13/11) — correct answer never the length outlier in any.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `g1s-03-02`.

**Review basis hash** (post-fix): `aed6c1cf957ee9fd12629287c8e7928be94e701644b010007667f1ef662ac0fe`

---

## 5. `g1t-01-01` — *Three Addends in a Row* (`add-three-numbers-g1`, Grade 1)

**Disposition: KEEP / SUFFICIENT / FIT** (third occurrence of the same defect class, fixed).

**Defect found and fixed.** `remedials[0].check` was byte-identical to `k1` ("3 + 6 = ?" → 9,
identical traps/feedback).

**Self-correction recorded here for the audit trail.** An initial fix only swapped the numbers
under `k1`'s identical bare-equation template (`"4 + 7 = ?"`). On reflection this does not actually
clear R2: normalization is a hard, mechanical rule in the S316 standard, and an operand swap under
an unchanged template normalizes to the identical skeleton `"#+#=?"` — precisely the pattern the
standard's own Worker-B precedent required rework for. Re-fixed with a genuine Shape-α **route
shift** before finalizing this record: `"5 counters and 8 counters join together. What total do
they make?"` → 13, reusing the counters representation `k2` already carries in this lesson but with
different sentence structure and fresh numbers. Verified this time that all four skeletons
(remedial / `k1` / `k2` / `ch1`) are lexically distinct after normalization, not just numerically —
R2 genuinely clear. R1/R3/R4/R5/R6 all clear as before.

Both figures verified: `bar-join` (`figures.tsx:7558`) states "7 + 5 = 12" in its title, matching
`c1` exactly; `make-ten-bridge` (`figures.tsx:7251`) states "eight plus five equals ten plus three
equals thirteen," matching `c2`'s bridging-through-ten worked example exactly.

Rest of lesson recomputed and verified correct: `i1`/`i2` number-line hops (4+3→7, +2→9; 5+1→6,
+4→10); `k2` numeric 2+2=4; `k3` mcq 3+6+4=13 against the pinecone story, with all three
distractors correctly diagnosed (the correct option's greater length is intrinsic — identifying the
all-three-addends equation necessarily needs a 3-term option, not a fixable leak); `ch1` numeric
4+9=13.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `g1t-01-01`.

**Review basis hash** (post-fix, after the route-shift correction):
`c58802be2755d8869747c3f84bc10b14c855f46dab5bcecb3cd008cf135a25f8`

---

## 6. `g2n-01-01` — *Adding Three Two-Digit Numbers* (`four-addends-g2`, Grade 2)

**Disposition: KEEP / SUFFICIENT / FIT** (fourth occurrence of the same defect class, fixed with
a genuine route shift from the start — applying the lesson learned from #5's correction).

**Defect found and fixed.** `remedials[0].check` was byte-identical to `k1` (`"12 + 23 = ? (the
first pair of 12 + 23 + 13)"` → 35, identical traps/feedback). Fixed with a real Shape-α route
shift: `"A sticker book has three pages: 26 stickers, 31 stickers, and 19 stickers. After filling
the first two pages, how many stickers are placed so far?"` → 57, reusing the same two-trap
*pattern* `k1`/`k2`/`ch1` all share (a whole-sum trap and a wrong-pairing trap) in a genuine
word-problem representation, with a context (stickers/pages) chosen to have zero thematic overlap
against `k1`/`k2` (bare annotated equations) and `ch1` (trail/miles). Verified all four skeletons —
remedial / `k1` / `k2` / `ch1` — are lexically distinct after normalization. `R4` checked against
the actual generator (`src/lib/g2Variants.ts`, `Add2DigitNumeric`): always a bare `"N + M = ?"`
template, producible by neither `k1`'s nor the remedial's prompt. `R5`/`R6` clear.

Figures `bar-join` and `make-ten-bridge` (same two verified in lesson #5) are reused here as
generic strategy illustrations, consistent with `c1`/`c2`'s own number-free strategy prose.

Rest of lesson recomputed and verified correct: `i1` number-line hop 24+13=37, +10→47; `i2` 48+10→58;
`k1` (unchanged) 12+23=35; `k2` 36+35=71, +15→86; `k3` mcq associativity check 17+25+3 regrouped as
(17+3)+25=45, matching left-to-right 45; `ch1` 50+12=62.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `g2n-01-01`.

**Review basis hash** (post-fix): `fa9e7f808a5a7d91f7fc6479b0004cd94de94ccc351c2badf42f25d773a66adb`

---

## 7. `g4p-03-01` — *Number Patterns from a Rule* (`patterns-factors-g4`, Grade 4)

**Disposition: KEEP / SUFFICIENT / FIT** (fifth occurrence of the same defect class, fixed with a
genuine route shift).

**Defect found and fixed.** `remedials[0].check` was byte-identical to `k1` (`"The pattern 2, 4, 8
grows. What is the rule?"`, identical four options/feedback). Fixed with a real route shift: `"A
savings amount grows: $4, $8, $16. What is the rule?"`, all three distractors recomputed for the
new values (Add 4 fits only the first step; Multiply by 3 overshoots the second term; Add 8 is the
second gap, not a constant step) mirroring `k1`'s trap *shapes*, not its numbers. R2's normalized
skeletons are lexically distinct (different sentence structure, and the literal `$` characters
survive normalization). R4 checked against the actual generator (`src/lib/g4Variants.ts`,
`mbPatternsMcq`): always a **four**-term pattern in a fixed template, never this three-term
dollar-amount word problem. R5/R6 clear.

No figure fields are used anywhere in this lesson — both interactive steps use `barBuilder`
widgets that are themselves the visual representation, and every check's own `cml` metadata
self-declares `representations: [symbolic, symbolic]`, consistent with the course's own authorial
intent that this content is appropriately abstract at this point.

Rest of lesson recomputed and verified correct: `c1`/`i1`/`i2` doubling patterns (3,6,12,24 and
5,10,20,40); `k2` ratio-3 pattern 5,15,45,135 → next 405; `k3` additive rule +6 from 4 → next 28;
`ch1` multiply-by-3 from 4 → fourth term 108.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `g4p-03-01`.

**Review basis hash** (post-fix): `3ab58f446f87c126d0132e38245463b47b86b8b8bcbc50863b148d8b024fe255`

---

## 8. `g4v-02-04` — *Time Interval Problems* (`measure-problems-g4`, Grade 4)

**Disposition: KEEP / SUFFICIENT / FIT** (no edits made — already coherent).

`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` documents a historical defect in this
*exact* lesson from an earlier packet: "g4v-02-04's concept says `When the answer is wanted in
hours, convert AFTER building the total` and its check asks `How many minutes?` with no conversion
at all" (an R9 concept/check mismatch). Checked the current bytes specifically against that finding
rather than assuming rework was still needed: the remedial concept is now paired with a check that
*does* convert — "A crew works 9 shifts of 20 minutes, then converts the total to hours. How many
hours is that?" → 9×20=180 min, 180/60=3 hr, matches the stored answer exactly. **The historical
defect has already been resolved** in a prior session; verified by direct computation, not assumed.

Full remedial re-check against S316 R1-R6 (independent of the historical note): R1 prompt differs
from `k1`'s trail-crew prompt; R2 normalized skeletons are lexically distinct (no early-finish
clause at all, replaced by a converts-to-hours clause — a different job, not a value swap); R3 full
payload differs; R4 checked the actual generator (`src/lib/g4Variants.ts`, `mbMultiStepNumeric`):
its template is a markers/packs scenario, never shifts or hour conversion — not reproducible; R5
both traps recomputed correct (180 = forgot to convert; 10800 = multiplied by 60 instead of
dividing), no collision; R6 clear.

Every widget's arithmetic re-verified by direct `node` computation against the JSON's own stated
answers and traps — `c1` 5×30−20=130; `i1` lands at 150 (commonLandings 120/180 both correctly
diagnosed hop-count errors); `k1` 4×45−13=167 (trap 49=4+45, addend-vs-product); `i2` lands at 180
(commonLandings 135/225 both correct); `k2` 150/60=2.5; `k3` 360/60=6 (trap 21600=360×60); `ch1`
5×20−34=66 (trap 25=5+20); remedial 9×20=180, 180/60=3 (trap 10800=180×60). Every numeric claim in
the lesson recomputes correctly — zero arithmetic defects.

`k2`'s mcq tests order-of-operations specifically ("what is the correct **order**"), not just the
final value; its distractor "Divide 30 by 60 first, then multiply by 5" is honestly acknowledged in
its own feedback as reaching the same correct *value* (2.5 hr) but marked wrong for *order* since it
converts before totaling — defensible, not misleading, because the prompt explicitly asks about
order/strategy and the feedback doesn't overclaim.

Figures: `g4v-groups-adjust-time` (`c1`) is purpose-built for this exact worked example, exact
match. `rr-chain` (`c2` and remedial concept) was weighed carefully — it depicts a *multi-step*
hours→minutes→seconds chain via ×60, ×60, arguably in tension with `c2`'s own "one conversion beats
several" claim, and shows the ×60 (growing) direction rather than this lesson's ÷60 (shrinking)
direction. Judged **not** a fixable defect on reflection: it is used identically across three
lessons in this same course (`g4v-02-02`, `g4v-02-04`, `g4v-03-03`, confirmed by grep) as a
consistent chapter-level "time units connect via 60" motif, its content is factually accurate, and a
prior thorough adjudication of this exact course (S316, Worker D) reviewed many defects in these
lessons without flagging this pairing. Treated as a defensible chapter-level visual choice, distinct
in kind from `dc-03-01`'s figure (which depicted an unrelated topic entirely).

`k2` option-length spread (47/41/31/18 chars) is a soft gradient intrinsic to describing multi-step
procedures, not a fixable leak (same reasoning as `g1t-01-01`'s `k3` earlier in this lane).

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `g4v-02-04`.

**Review basis hash**: `784a30ed92f5a03c1b5bf5aef782ac88fbb690f7a2d078d176b795403e1ce54b`

---

## 9. `kc-03-01` — *Ten and Some More* (`counting-to-20-k`, Kindergarten)

**Disposition: KEEP / SUFFICIENT / FIT** (figure/text mismatch found and fixed with a minimal
numeral swap).

This lesson's single `remedials[0].check` was, unusually for this lane, **not** byte-identical to
any main step from the start — it's a genuinely distinct `mcq` ("13 is ten and how many more?")
rather than a copy of any of the six `baseTenCompose` main widgets that share this lesson's one
`conceptTag`. R1-R3 pass cleanly (different type, different prompt, different payload). R2 checked
against all six widget-bearing main steps (all share the tag in this tightly single-concept K
lesson): the closest is `k3`'s "19 is ten and how many more? Build it." — a different modality
(hands-on build of 19 vs. multiple-choice select of 13), not the same item to a learner's memory.
R4 checked the actual generator (`src/lib/variants.ts`, `base-ten-build`): both its forms always
emit a `baseTenCompose` widget, never an `mcq` — cannot collide. R5/R6 clear, traps (1, 13, 30) all
correctly diagnosed and non-colliding.

**Defect found and fixed** (figure/text truthfulness, not R1-R6): the remedial's *concept* step was
bound to figure `teen-ten-and-more`, which is hardcoded in `figures.tsx` — title and rendered SVG
text — to depict specifically "13 = ten and 3 more, makes 13." But the concept's own body named 14
and 17, never 13. A Kindergarten pre-reader would see a picture unambiguously labeled 13 while being
told about 14-and-4/17-and-7 — exactly the ones-digit confusion this lesson exists to prevent.
Unlike `dc-03-01`'s figure mismatch earlier this lane (an unrelated topic, fixed by removing the
figure), this figure is squarely on-topic and the main concept `c1` *already* uses it correctly
paired with the identical first example ("13 is a full ten and 3 more..."). Given the minimal scope
of the fix, that it exactly mirrors phrasing already authored elsewhere in this same lesson, and
that this is a K "early" reading-profile lesson where a truthful supporting visual carries more
weight, fixed by changing the concept's first worked example from "14 is a full ten and 4" to "13 is
a full ten and 3" (kept "17 is ten and 7" unchanged) — the figure now truthfully matches its own
bound text. Grepped for hardcoded dependencies on the old wording first: none found.

Rest of lesson fully re-verified: `i1`/`k1`/`i2`/`k2`/`k3`/`ch1` targets (12, 16, 15, 18, 19, 11)
and every trap value recomputed correct. `k1`'s authored content confirmed to be a hand-tuned
rendering of the `base-ten-build` generator's own default draw for t=16, consistent with this
lane's established understanding of how authored/generator content relate. `c2`'s figure
(`kc-teen-14`, "Fourteen is ten and four... =14") independently verified truthful, no change needed.

Considered and dismissed as non-defects: the recurring `(tens:1, ones:1)=11` trap reused across
`i1`/`k1`/`k3` regardless of target (generic but literally true every time, not a leak); `i1`+`i2`
being two similar build interactives before the first check (developmentally standard K scaffolding,
and `i1` carries an added predict layer `i2` lacks).

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row for `kc-03-01`.

**Review basis hash** (post-fix): `bf14beeb168eefe987c33bef80023e4aa8344400ea7861c7b8daf326558b5ca5`

---

## 10. `sc-02-02` — *Where the Polynomial Gives Up* (`series-convergence`, Calculus BC)

**Disposition: KEEP / SUFFICIENT / FIT** (two non-obvious defects found and fixed — a code-verified
guaranteed content collision, and a wrong-topic figure).

Reviewed at maximum rigor per this task's explicit flag for the two calculus lessons in this lane.

**Defect 1 — deterministic duplication (`LESSON_PROGRESSION_AND_DUPLICATION`-class, self-discovered,
no prior queue row existed).** `k2` and `ch1` both declared the identical triple — `conceptTag:
"sc-radius"`, `variant.gen: "g13-series-convergence"`, `variant.form:
"series-convergence__sc-radius__numeric"`. Reading `src/lib/variants.ts`'s `variantForStep` and
`src/lib/authoredTemplateVariants.ts`'s `generatorsFromAuthoredBank` showed the PRNG seed for a
variant-bound step is `hashSeed(`${gen}:${form}:${step.conceptTag}:${outerSeed}`)` — it does **not**
include the step's own id. Since both steps share `conceptTag`, `gen`, and `form`, any outer seed
shared across one lesson render (the normal case) produces the identical hash for both, hence the
identical draw from the 2-entry authored-template pool. **Verified empirically, not just by
inference**: wrote and ran a `tsx` probe calling `variantForStep` directly with objects matching
each step's real declaration, across three different seeds — confirmed byte-identical widget output
every time. This is a deterministic guarantee, not a probabilistic risk: on any regeneration, `k2`
and `ch1` would show the literal same problem within a single lesson walk. Checked for a same-topic
alternate form to reassign one of the two to instead: grepped the full form list under this
generator — only two forms are tagged `sc-radius` at all (the `mcq` one is already used by `k3`);
the rest cover unrelated sub-skills (term-by-term differentiation/integration, substitution,
alternating-series bounds) that would leave `ch1`'s authored hint ladder mismatched if reassigned
there, and inventing a new form string was rejected after confirming the generator throws (rather
than degrading gracefully) on an unrecognized form. **Fix**: removed `k2`'s `variant` field
entirely, freezing it permanently to its current authored content (radius 1 for Σxⁿ) — re-verified
via the same probe, post-edit, that `k2` now returns `null` (static forever, the same unremarkable
pattern this lesson's own `k1` already uses) while `ch1` remains fully regenerable and
collision-free. Chose to freeze `k2` rather than `ch1` because `ch1` carries richer scaffolding (a
3-tier hint ladder) worth preserving, and because `k2`'s frozen case keeps the existing narrative
pairing with `i1` intact (`i1` already interactively *discovers* radius 1 for this exact series).

**Defect 2 — figure/topic mismatch.** The remedial concept was bound to figure
`dr-power-rule-pattern`, which — read directly in `figures.tsx` — renders a table of the
**derivative power rule** (x→1, x²→2x, x³→3x², …), an entirely unrelated calculus topic with no
connection to "shrinking vs. growing series terms." Same defect class as `dc-03-01` earlier this
lane (wrong topic entirely, not just wrong numbers) — fixed the same way, by removing the figure
reference rather than attempting an unworkable text rewrite.

**Verified correct, no changes needed** (extensive direct computation): `c1`'s 1/(1−2) = −1 claim;
`i1`/`k1`'s `taylorApprox` widgets schema-checked against `TaylorApproxSpec` in `schema.ts` (whose
own doc-comment independently confirms the ±1 boundary semantics this lesson relies on) — confirmed
`xStart`/`targetXTenths` are in tenths and both drag-directions are correctly mirrored; `k2`'s ratio
test (radius 1, traps 0/2/0.5 all correctly diagnosed, including a direct check that 0.5ⁿ sums to
2); `c2`'s |x|/(n+1)→0 claim; `k3`'s "why is e^x's radius infinite" mcq, including a well-targeted
distractor testing whether a learner is pattern-matching `k2`'s answer rather than reasoning about
*this* series' ratio; `ch1`'s Σxⁿ/2ⁿ (radius 2, traps 1/0.5/4 all correct); the remedial check (x=3,
terms 1,3,9,27, diverges) checked against S316 R1-R6 in full — passes cleanly, its concrete-instance
yes/no format is structurally distinct from every main step and from both generator pools now in
play. `sc-taylor-hug-peel` (`c1`, `c2`) verified as a dynamically-computed, mathematically accurate
SVG (literally computes f(x)=1/(1−x) and its own degree-8 Taylor polynomial) — truthful for both
bindings. Considered whether the lesson's visual support is unbalanced (only the geometric/finite
case gets an interactive widget; e^x's infinite-radius case is taught purely analytically) —
judged this a defensible pedagogical choice, not a gap: the geometric case has a demonstrable
boundary-crossing failure that rewards interactive exploration, while e^x's story is better served
by the ratio-limit argument it already receives. MCQ option-length spreads throughout all judged
acceptable (differences attributable to technical-precision density, not padding). Language
properly rigorous Calculus BC level throughout — FIT. Question-job progression is strong and
varied, no purposeless repeats.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row existed for
`sc-02-02` prior to this review — the duplication defect was discovered through this review's own
generator-level verification, not flagged in advance.

**Review basis hash** (post-fix): `740a8e68dd4a0933dc4f1efafb49bd7baecb45a071944544ed75cce2c614efd1`

---

## 11. `smg1-02-03` — *Fourths Make Halves* (`shapes-measure-g1`, Grade 1)

**Disposition: KEEP / SUFFICIENT / FIT** (two defects found and fixed — a more pervasive
double variant-collision than `sc-02-02`, plus a near-identical remedial).

**Defect 1 — deterministic double duplication (self-discovered, no prior queue row).** All four of
this lesson's variant-bound main steps share one `conceptTag` and pair into two colliding groups:
`k1`/`k3` both declare `{gen: 'g1-shapes-measure', form: 'Smg1HalvesFourthsMcq'}`; `k2`/`ch1` both
declare `{gen: 'g1-shapes-measure', form: 'Smg1HalvesFourthsNumeric'}`. Same root cause as
`sc-02-02`'s defect (the resolver's seed depends on `conceptTag`, not step id) — confirmed by the
same `tsx`-probe method: both pairs produced byte-identical widgets across every seed tested, before
the fix. Checked whether other same-topic forms in `g1Variants.ts`'s `g1-shapes-measure` bank
(`Smg1HalvesNumeric`, `Smg1FourthsNumeric`, etc.) could safely be reassigned instead — rejected,
because a regenerated widget only replaces the widget, never the step's own fixed
`explanationVariants`; reassigning `k2` to a different-fact form would leave its authored
explanation ("2 fourths together always make 1 half...") permanently mismatched against a
regenerated widget that no longer asks about halves at all — a worse defect than the one being
fixed. **Fix**: removed the `variant` field from `k1` and from `k2` (freezing both to their current,
correctly-matched content), keeping `k3` and `ch1` regenerable and collision-free — re-verified via
the probe post-edit. Froze the earlier step of each pair, consistent with `sc-02-02`'s heuristic,
and because `ch1` carries a hint ladder worth preserving freshness for.

**Defect 2 — near-identical remedial (S316 R1/R2).** The remedial check's prompt, "How many fourths
make one half?", was verbatim identical to `k2`'s own prompt, same answer, heavily overlapping
traps. Before fixing, re-checked S316's own R6 example (`g4v-01-02`, where a concept states a
*specific instance value* the check then repeats) against this lesson's remedial concept ("Two
fourths together always make one half") — concluded the concept is *not* a parallel R6 violation,
since it states a fixed, non-instance-varying fact (the standard "teach the rule, then check
comprehension" pattern), so the defect is confined to the check alone. **Fix**: rewrote the remedial
check into a genuine word-problem application — "A pizza is cut into 4 equal slices (fourths). You
want to give a friend exactly half the pizza. How many slices do you hand them?" (answer 2, traps 4
and 1 recomputed and mirroring `k2`'s original trap shapes with fresh values) — a structural
rewrite rather than a number-swap, since the original template had no numbers to swap in the first
place. Kept "pizza" deliberately for continuity with `c2`'s own established pizza analogy; verified
R4 regardless — `ch1`'s generator can draw "pizza" as one of six possible nouns, but its fixed
template is structurally nothing like the new multi-sentence word problem.

**Verified correct, no changes needed**: `i1`'s `fractionBar` (target 2/4, schema-checked, both
traps correct); `i2`/`i3` (4 fourths / 2 halves = whole, all traps correct); `k1`/`k3`'s
mirror-image "smaller"/"bigger" framing (a deliberate, good existing design — option lengths 8/6/21
in both, correct answer never the longest); `ch1`'s composed two-fact reasoning with its hint
ladder. Figures `halves-quarters` (`c1`), `smg1-pizza-share` (`c2`), and `smg1-fourths-halves`
(`c3`) all verified registered and exactly truthful to their bound text. Question-job progression is
strong and varied, no purposeless repeats.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row existed for
`smg1-02-03` prior to this review — both defects were discovered through this review's own
verification.

**Review basis hash** (post-fix): `dd1a45c94e1c2c3a5d23d7d3c5454aed5601f4d3eb2ee8bcd09584c55693ac5c`

---

## 12. `tm-05-03` — *Volume of a Sphere* (`transformations-measurement`, Grade 8)

**Disposition: KEEP / SUFFICIENT / FIT** (two defects found and fixed — a mislabeled trap
and a near-identical remedial carrying the same error). Final lesson of this assignment.

**Defect 1 — mislabeled/miscomputed trap.** `k1`'s second `commonError` had value 72 with feedback
"That squared instead of cubed — use 6³=216, then 4⁄3 × 216=288." Recomputed directly: the claimed
mistake (r² instead of r³, coefficient otherwise correct) gives 4⁄3 × 6² = 48, not 72 — the value
didn't match its own diagnosis. Found the actual origin of 72: 6³÷3 = 72, i.e. cubing correctly but
dividing by 3 without ever multiplying by 4 (mistakenly applying the *cone's* ⅓ coefficient instead
of the sphere's 4⁄3 — this course's own `ch1` explicitly teaches that exact distinction). Read the
declared generator (`g8-tm-sphere-volume`, form `tmSphereCoeff`) to settle intent: its own canonical
second trap is exactly `(4×r²)/3` with feedback "uses r² instead of r³" — confirming 72 was a
transcription error against an already-correct feedback string, not a deliberate alternate design.
**Fix**: corrected the value from 72 to 48, leaving the accurate feedback text untouched.

**Defect 2 — near-identical remedial carrying the same mislabeling bug.** The remedial's prompt, "A
sphere has radius 3. What is its volume as a number times π?", normalizes byte-identical to `k1`'s —
a textbook bare-operand-swap under an unchanged template. Its own second trap (value 9) had the
identical mislabeling bug as `k1`'s (claimed "squared", but 4⁄3×3²=12, not 9; actual origin 3³÷3=9,
the same cone-coefficient confusion) — confirming this was a copy-and-rescale authoring habit, not
two independent coincidences. **Fix**: redesigned the remedial as a genuine word-problem route shift
— "You need to find the volume held by a ball with radius 3 cm. What is the volume, as a number
times π?" (kept radius 3 to reinforce `i1`'s own worked example; reused "ball" since `c1` itself
equates sphere with ball) — correcting both traps in the same edit (27 unchanged/already correct; 9
→ 12, now genuinely matching a squared-not-cubed diagnosis). **Verified empirically**: sampled the
`tmSphereCoeff` generator 1,500 times across every band via a `tsx` probe, collected all 54 distinct
prompts it can ever produce, confirmed the redesigned remedial's text appears in none of them; also
confirmed `k1`/`k2`/`k3`/`ch1` — which, unlike `sc-02-02` and `smg1-02-03` earlier this lane, declare
four genuinely *distinct* forms — never collide with each other across five seeds, so no freezing
was needed for the main steps here.

**Verified correct, no changes needed**: `c1`'s formula statement; `i1`'s predict claim (sphere r=3
equals the r=3,h=4 cylinder, both 36π) — independently corroborated by `VolumeBuilderSpec`'s own
doc-comment in `schema.ts`, which explicitly documents this exact coincidence as this course's
intent; `i1`'s widget fields schema-checked and valid; `c2`'s worked example (r=6 → 288); `k2` (r=1,
4⁄3π, all three distractors sound); `k3` (36π×3.14≈113, both traps correct); `ch1`'s formula-matching
(all three formulas correct, pair-error correctly diagnosed). Figure `round-solids` (`c1`) verified
registered and exactly truthful. MCQ option-length spreads checked (`i2`: correct answer is the
*shortest*, no leak; `k2`: length differences intrinsic to differing bare mathematical expressions).
Question-job progression is strong and varied, no purposeless repeats. Language properly rigorous
Grade 8 level throughout — FIT.

Queue: no `LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row existed for
`tm-05-03` prior to this review — both defects were discovered through this review's own
verification.

**Review basis hash** (post-fix): `22c20183803a5af7d57eae32d3252abd4b0923ba6a66850350aaa790016b322a`
