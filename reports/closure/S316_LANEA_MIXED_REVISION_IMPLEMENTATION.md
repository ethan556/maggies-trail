# S316 Lane A (mixed) Revision Implementation

Worker: implementation lane for 32 lessons across 6 courses: decimal-fluency-g5 (7),
bivariate-statistics (7), geometry-g7 (5), transformations-measurement (7),
multiplication-division (3), multiply-bigger (3).

Authority read first (byte-for-byte): `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`.

Result: 29 lessons revised, 3 lessons rejected. All 32 have latest decision `REVISE`; every
`reviewedBasisHash` was verified fresh against live source before acting.

## decimal-fluency-g5 (7/7 revised)

### g5d-01-01 — recordId `S252-DF5-g5d-01-01-lfnorm`
`i2` barBuilder rebuilt (55+38, claim 83, new predict); `k3` rewritten to decimal notation
(0.65+0.19=0.84); `ch1` converted from a 47-cells-count task into the inverse (decimal→cell
notation, 0.47), variant rebound to `dHundredthsWriteNumeric` to match an existing generator
template exactly.

### g5d-01-02 — recordId `S252-DF5-g5d-01-02-lfnorm`
`i2` columnCalc rebuilt (4.68+2.75, claim 7.33) so it stops duplicating `i1`; `k1`/`k3` MCQ
distractor feedback rewritten off a generic copy-paste template to name the actual misconception
in the drawn numbers.

### g5d-01-03 — recordId `S252-DF5-g5d-01-03-lfnorm`
`i2` rebuilt (6.47+1.86, claim 8.23); `k2`/challenge rewritten to ragged-length decimal notation
(3.5+4.65=8.15, 6.8+2.57=9.37); stale `Pv1000AddTradeNumeric` variant bindings removed (whole-number
place-value generator, mismatched to this lesson's decimal content).

### g5d-01-05 — recordId `S252-DF5-g5d-01-05-lfnorm`
`i2` rebuilt (6.30−2.85, claim 4.55); `k2` rewritten to decimal subtraction with zero-padding
(5.6−1.47=4.13); `k3` converted from numeric to MCQ diagnosing flip-vs-trade borrowing errors;
stale variants removed.

### g5d-02-02 — recordId `S252-DF5-g5d-02-02-lfnorm`
`i2` estimateSlider rebuilt (0.6×0.7=0.42) with new predict; `k2` rewritten to multiply two
decimals (0.6×0.9=0.54); `k1`/`k3`/challenge MCQ distractor feedback fixed off the generic
template.

### g5d-03-03 — recordId `S252-DF5-g5d-03-03-lfnorm`
`c1` figure swapped `mmt-coin-value` (shows a quarter "always 25¢", mismatched to hundredths-grid
teaching) → `dpv-hundredths-grid`, with body rewritten to match; overclaiming "always" language
in predict fixed; `i2` rebuilt (3.85+4.65, claim $7.50); `k2`/challenge converted to contextual
money word problems ($5.15+$2.65=$7.80, $9.20−$3.65=$5.55).

### g5d-03-05 — recordId `S252-DF5-g5d-03-05-lfnorm`
`c1` figure `dpv-round-whole`→`mb-multistep`; `c2` figure `dop-line-up`→`dop-pad-borrow`; `i1`
prompt/predict grammar and `$` notation fixed; `i2` rebuilt (6×$0.85−$1.20=$3.90), fixed
"an $0.80" grammar error.

## bivariate-statistics (6 revised, 1 rejected)

### bv-01-01 — recordId `S252-BV-bv-01-01-lfnorm`
`i2` converted to a cumulative multi-point plotPoint build (4 points from a table, using the
widget's native multi-target support); `ch1` converted to a swapped-coordinate diagnosis MCQ;
stale `bvScatterPlot` variant removed.

### bv-02-02 — recordId `S252-BV-bv-02-02-lfnorm`
`c1` body bridges gaps/residuals terminology that was previously described but never shown.
Figures added (all pre-existing, semantically matched): `bv-fit-strength`→`k1`,
`bv-best-fit-middle`→`i2` and `ch1`, `bv-residual-gap`→`k2`, `bv-residual-sign`→`k3`; `k2` option
wording tied explicitly to "residuals".

### bv-02-03 — recordId `S252-BV-bv-02-03-lfnorm`
`i2` converted to a table-to-equation translation task (`sourceKind: "table"`,
`tablePoints: [[0,1],[1,4],[2,7]]`); `k2` reframed as classmate error-diagnosis; `ch1` converted
from `readIntercept` to a `verifyPoint` task (y=4x+2, point (3,14)); stale `interceptZero` variant
removed.

### bv-03-01 — recordId `S252-BV-bv-03-01-lfnorm`
`i2` converted to an `affineRelationshipLab` `evaluateAtX` task with a table source (points
(1,5),(2,10), targetInput 4); `k2` reframed as diagnosing a classmate's wrong prediction (28 vs
12); `k3` recontextualized with units (parking cost, dollars); `ch1` recontextualized as a
graph-vs-equation reconciliation task; stale linear-predict variants removed on 3 steps.

### bv-04-01 — recordId `S252-BV-bv-04-01-lfnorm`
`ch1` converted from a duplicate column-total task into missing-cell/consistency reasoning (child
row 30, dogs 20, cats=10); stale `columnTotal` variant removed.

### bv-04-02 — recordId `S252-BV-bv-04-02-lfnorm`
`k2` converted to explicit error-diagnosis (classmate's 67% wrong-denominator error vs correct
40%); `ch1` converted to a NEW table (60 students, walk/bus × lunch) with reverse reasoning
(0.30×60=18); figure `bv-rel-freq` retained; stale `bvRelAllA`/`bvRelAllB` variants removed.

### bv-05-03 — recordId (latest) — **REJECTED**
Rationale requires naming MSE vs SSE precisely, an SVG/state accessibility description for the
`scatterFit` renderer, and focused renderer/evaluator tests — all of which live in
`src/components/` and `src/lib/`, outside lesson-JSON-only scope. Rejected per the hard rule: "If
... the rationale demands ... any judgment I cannot make safely: DO NOT edit that lesson."

## geometry-g7 (4 revised, 1 rejected)

### g7-03-01 — recordId `S251-COARSE-BASIS-g7-03-01-lfnorm`
`c1` figure swapped `angle-pairs` (shows complementary+vertical, wrong second relationship) →
`g7-comp-supp` (shows complementary+supplementary, matching the body's exact contrast).

### g7-03-02 — recordId `S251-COARSE-BASIS-g7-03-02-lfnorm`
`c1` figure swapped `angle-pairs` (unrelated complementary corner + non-matching vertical panel)
→ `g7-vertical-angles` (shows the actual vertical-and-adjacent crossing contrast the body
describes).

### g7-04-01 — recordId `S251-COARSE-BASIS-g7-04-01-lfnorm`
`c1`/`c2` figure swapped generic Pythagorean `right-triangle` (a²+b²=c²) → `g7-triangle-inequality`
(visualizes side-reach/closure, matching this lesson's actual content). `k3` widget rewritten: the
old stem "Which cannot be the third side?" paired with a numeric evaluator that accepted only 10,
even though every value ≤2 or ≥10 also fails — an ill-posed evaluator. New stem asks for the exact
upper-boundary length (the sum of the two given sides, 10) that collapses the triangle flat,
giving one defensible target. This exact wording was found to already match the registered
`g7-triangle-inequality`/`upperBoundary` generator template (verified by reading the generator
source directly), so the variant binding was restored rather than removed — an initial draft that
invented different phrasing (asking for the largest legal integer side) was self-caught and
reverted in favor of aligning to the pre-existing validated template.

### g7-04-03 — recordId `S251-COARSE-BASIS-g7-04-03-lfnorm`
`i2` converted from a redundant `scaledCircleLab` circle-area recheck into a cross-section
retrieval MCQ using the existing `g7-slicing` figure and conceptTag `g7-cross-sections`, giving
the "roundup" lesson an actual slicing task to match its concept/recap claims of covering
cross-sections. The question (tip-cut through a pyramid's apex → triangle) is complementary, not
duplicate, to sibling lesson g7-04-02's base-cut→square question.

### sa7-01-03 — recordId `S248-G7-sa7-01-03-lfnorm` — **REJECTED**
Rationale requires (a) a pyramid/net surface-area visual for the `k3`/`ch1` pyramid questions,
since both existing concept figures (`sa7-triangular-prism-parts`, `sa7-lateral-shortcut`) are
prism-only despite the lesson title promising pyramids, and (b) scoping the "the same rule works
for any prism" overclaim to right prisms specifically, in both the `c2` body and the remedial
concept body — with the reopenCondition requiring both fixes together.

Part (b) alone is achievable in lesson JSON. Part (a) is not: exhaustively searched
`src/components/figures.tsx` (grep for pyramid/apex/slant/net/unfold/Pyramid/SurfaceArea, and the
full `sa7-*` figure registry block covering both sa7-01-x and sa7-02-x). Every registered `sa7-*`
figure (`sa7-net-unfold`, `sa7-triangular-prism-parts`, `sa7-lateral-shortcut`,
`sa7-stack-the-layer`, `sa7-same-rule-any-base`, `sa7-decompose-floor-plan`,
`sa7-many-correct-cuts`, `sa7-three-questions-one-crate`, `sa7-units-check`) is prism/box-only.
The only pyramid-related figures anywhere in the registry are `Ssg2Pyramid`/`Ssg2PyramidVsPrism`
(K-2 level, label-only) and `G7Slicing`/`g7-slicing` (pyramid cross-sections, not a net or
surface-area breakdown, already used elsewhere in this course). Building a new pyramid-net figure
requires adding a component to `src/components/figures.tsx`, outside lesson-JSON-only scope.

Rejected the full lesson rather than shipping a half-fix (wording only) that would leave the
reopenCondition — which requires the visual AND the wording fix together — falsely marked as
addressed.

## transformations-measurement (6 revised, 1 rejected)

### tm-01-03 — recordId `S251-COARSE-BASIS-tm-01-03-lfnorm`
`i2` converted from a duplicate 180°-rotation MCQ (same job as `i1` with swapped values) into a
distinct inverse/backward-reasoning job: given a 180° image point, find the preimage. New
distractors diagnose "thinks preimage equals image" and "only one sign undone".

### tm-01b-03 — recordId `S246-TM-tm-01b-03-lfnorm`
`i2` given an explicit distinct purpose via a new `predict` block asking the learner to reason
about how a SIDE LENGTH (not area) scales under k=0.5, contrasting with `c2`'s area-scales-by-k²
law, before dragging k on the same `dilationExplore` widget. Interactive mechanic and target k
unchanged.

### tm-02-02 — recordId `S251-COARSE-BASIS-tm-02-02-lfnorm`
`k2` converted from a third forward factor-2 point-dilation (duplicating `e1`/`i1`) into an
inverse job: given the image and scale factor, find the original point. Stale
`point-transform`/`dilate` variant binding removed (the generator's forward-only template no
longer matches).

### tm-04-01 — recordId `S251-COARSE-BASIS-tm-04-01-lfnorm`
`k1` converted from a third `cSquared` repeat into a genuine inverse/transfer job using the
schema's existing but previously-unused `legLength` `pythagoreanArea` target: given one leg and
the hypotenuse, find the missing leg (10, 6 → 8). Stale variant binding removed (no matching
generator form). `k2` and the remedial check reframed as explicit error-analysis tasks naming a
classmate's specific wrong calculation (add-not-square for `k2`; multiply-not-square for the
remedial) — same numbers/target/answer/evaluator throughout, only prompt/body/explanationVariants
changed. `k2`'s stale variant binding removed since its prompt no longer matches the generator's
abstract template. `i2`'s MCQ options rebalanced for cue-resistance: correct option shortened from
52 characters to 42, distractors lengthened from 17–25 to 31–36, tightening the length-based tell
without changing meaning or correctness.

### tm-04-03 — recordId `S251-COARSE-BASIS-tm-04-03-lfnorm`
`k1` recontextualized from an abstract 8-15-17 classification repeat of `i1` into a
transfer/application job (a carpenter checking a shelf bracket's corner), same evaluator/answer;
stale `tmConverseRight` variant binding removed. New interactive step `i3` added using the
existing but previously-unused `distanceGrid` widget: the learner drags a point on a live
coordinate grid to (5,12) from the origin, watching run/rise/hypotenuse readouts update live —
the "live coordinate grid" the rationale required. `k2` converted from an origin-based 3-4-5
numeric check into a distinct points-not-at-origin computation (A(1,2) to B(7,10), d=10) paired
with the existing `distance-right-triangle` figure (already registered, already synced to these
exact numbers), so the coordinate case now renders its exact points and right-triangle
decomposition; stale `tmDistanceOrigin` variant binding removed. `k3` changed from (1,2)-(4,6)
[legs 3,4] to (2,3)-(5,7) [also legs 3,4, but a different offset pair] so it is no longer
near-identical to the old `k2`'s (0,0)-(3,4); existing `tmDistanceOffset` variant binding kept
since the generator's arbitrary-offset template still matches.

### tm-05-01 — recordId `S251-COARSE-BASIS-tm-05-01-lfnorm`
`k1` reframed with explicit units context (cm/cm³) and changed numbers (3,5 instead of 5,2, which
duplicated `c2`'s own worked example verbatim); stale `tmCylinderA` variant binding removed. `k2`
converted from a fourth forward-coefficient repeat into a genuine reverse job: given height and
volume coefficient, find the radius (40, h=10 → r=2); stale `tmCylinderB` variant binding removed.
`ch1` converted into a diameter-vs-radius modeling task (tank given by DIAMETER 8 instead of
radius, same final answer 48 for arithmetic safety) with a new commonError naming the
diameter-as-radius misconception; stale `tmCylinderTank` variant binding removed. The remedial
check reframed as explicit error-analysis naming a classmate's specific squared-the-height-not-
the-radius mistake, same evaluator/answer, only prompt/body/explanationVariants and commonError
wording changed to match.

### tm-03-02 — recordId `S246-TM-tm-03-02-lfnorm` — **REJECTED**
Reopen condition requires `c2` to render "an accessible right-triangle representation
synchronized to 90 degrees, 35 degrees, and the inferred 55 degrees." No such figure exists in
`src/components/figures.tsx`: checked `RightTriangle` (Pythagorean a²+b²=c² only),
`SpecialRightTriangles` (45-45-90 and 30-60-90 only), `McMissingAngle` (grade-4, shows a right
ANGLE split into 55°/35° at a single vertex, not a right TRIANGLE with three vertices — reusing it
would introduce a NEW representation mismatch, not fix one), and `LaTriangleSum` (generic a+b+c=180
label, no right-angle marking at all — which is exactly why it is currently
`WITHHELD_BLOCKLIST_FINGERPRINT` for this lesson's `c2`).

Confirmed the blocklist mechanism directly: recomputed `figureTextBindingKey` from
`src/lib/figureTextAlignment.ts` against `src/lib/figureTextMismatchBlocklist.generated.ts` in a
node one-liner. The current (figureId, text) pair hashes to `2ff13c9b`, which IS in the blocklist.
Deleting the lesson's specific "35 degrees...55 degrees" numeric example from `c2`'s body would
produce a text hash NOT in the blocklist (verified: `8d7349db`, not present) and would technically
clear the WITHHELD state — but this only evades the automated hash-based check without fixing the
actual semantic mismatch (LaTriangleSum still shows no right angle at all). That is gaming the
gate, not satisfying the reopenCondition's explicit ask for a synchronized right-triangle visual.
Building a new synced figure requires adding a component to `src/components/figures.tsx`, outside
lesson-JSON-only scope. Rejected rather than shipping a superficial text edit that would falsely
clear the `visualDecision: REQUIRED` flag.

## multiplication-division (3/3 revised)

### mult-01-03 — recordId `S252-MD-mult-01-03-lfnorm`
`c1` and `c2` figure swapped from `skip-count-line` (live SVG shows 200, 300, 400, 500, 600
hopping by +100, mismatched to this lesson's small counts) to `number-line-jumps` (already-
registered figure showing 3 equal hops of 4 landing on 4, 8, 12). `c1`/`c2` body and narration
rewritten from the old "5, 10, 15, 20 / 4×5" example to "4, 8, 12 / 3×4" to exactly match the
figure's actual numbers.

### mult-03-01 — recordId `S252-MD-mult-03-01-lfnorm`
`c1` body and narration corrected: text said "the model pairs 6 with another 6, so 6×2=6+6=12" but
the bound `mult3-double` figure's live SVG/title/aria-label literally show two rows of 5
(5+5=10, "2 × 5 = 5 doubled = 10"). Text rewritten to "5 with another 5, so 5×2=5+5=10" to match
the figure exactly. Figure key unchanged; `c2`'s reuse of the same figure left as-is since its
text describes the general split-double-rejoin technique without claiming specific numbers the
figure must match.

### mult-03-02 — recordId `S252-MD-mult-03-02-lfnorm`
`c1` figure swapped from `mult3-fives` (live SVG only shows the 5,10,15,20,25,30 skip-count
pattern — an ×5 pattern figure, not a ×10 place-value figure) to the already-registered
`mult3-times-ten-place-value` (shows 7 ones ×10 → 7 tens = 70 with a tens/ones place-value chart),
which matches `c1`'s existing text ("7 ones become 7 tens, or 70... zero records an empty ones
place") exactly with no text changes needed. `c2`'s reuse of `mult3-fives` left unchanged since
`c2` is specifically about the ×5 pattern and correctly matches that figure.

## multiply-bigger (3/3 revised)

### mb-02-02 — recordId `S251-COARSE-BASIS-mb-02-02-lfnorm`
Replaced the unsafe "small number = factor, big number = multiple" size-shorthand throughout with
the precise divides-into/divided-by relationship, noting every number is both its own factor and
its own multiple: `c2` body rewritten; `k2`'s four MCQ option feedbacks and explanationVariants
rewritten; `i2`'s dragBucket `missFeedback`/`successFeedback` rewritten; recap takeaway rewritten.
All underlying answers/evaluators/numbers unchanged — wording-only fix.

### mb-04-03 — recordId `S251-COARSE-BASIS-mb-04-03-lfnorm`
`k2` converted from a numeric numerator-only question into an MCQ requiring the COMPLETE
fractional share as a mixed number (2 3/4 cookies), with distractors covering premature rounding,
numerator/denominator swap, and dividing by the wrong quantity. `k3` converted from a third
round-up repeat into a context-comparison MCQ using the SAME 112-chairs/15-per-row numbers, asking
for both the round-up answer (rows needed to fit everyone, 8) and the round-down answer (rows
completely filled, 7) in one item, directly balancing the round-up-heavy progression the rationale
flagged.

### mb-05-02 — recordId `S251-COARSE-BASIS-mb-05-02-lfnorm`
`k1` changed from multiply-then-subtract to multiply-then-ADD (store receives more books instead
of selling them). `k2` changed from multiply(comparison)-then-subtract to
multiply(comparison)-then-DIVIDE (Jake's sticker pile now shared among 4 people instead of given
away). `k3` kept as the sole remaining multiply(break-apart)-then-subtract job (no longer a repeat
since `k1`/`k2` moved off that chain). `k4` replaced entirely: was an exact structural duplicate of
`ch1` (two products, add, divide-with-remainder); now a concise subtract-then-divide job (baker's
muffins) with a short, non-parenthetical stem. `ch1`'s stem shortened by removing the trailing
parenthetical clause while preserving the identical two-products-add-then-divide math and answer
(20 remainder 3). Stale `g4-multiply`/`mbMultiStepNumeric` variant bindings removed from `k1`–`k4`
and `ch1`: the generator's only template is fixed to the original "packs of each, uses used"
multiply-then-subtract shape and cannot express any of the diversified chains. Did not add a
visual story ledger/diagram (`visualDecision` was PREFERRED, not REQUIRED, and no matching figure
exists in `src/components/figures.tsx`; building one is out of lesson-JSON-only scope).

## Files touched

29 lesson JSON files under `content/courses/{decimal-fluency-g5,bivariate-statistics,geometry-g7,
transformations-measurement,multiplication-division,multiply-bigger}/lessons/` (listed above, one
per revised lesson). No course.json, script, ledger, queue, card, portfolio, cache, or world
manifest files were touched. Every edited file was parse-checked with `python3 -c "import json;
json.load(...)"` immediately after editing and again in a final sweep; all 29 passed.

- `reports/closure/cowork-staging/laneA-mixed.jsonl` — 32 NDJSON lines appended (29
  `rejected: false`, 3 `rejected: true`), each parse-checked.
- `reports/closure/S316_LANEA_MIXED_REVISION_IMPLEMENTATION.md` — this file.

## Rejections (3)

1. **bv-05-03** — requires shared `scatterFit` renderer/accessibility changes and focused
   renderer/evaluator tests in `src/`; outside lesson-JSON-only scope.
2. **sa7-01-03** — requires a new pyramid net/surface-area figure component; none exists in the
   registry and building one requires editing `src/components/figures.tsx`.
3. **tm-03-02** — requires a right-triangle figure synced to 90°/35°/55°; none exists, and the
   only path to "pass" the automated blocklist gate without building a new figure is deleting the
   lesson's numeric example, which would evade the check rather than fix the underlying visual
   mismatch.

All three follow the same pattern: a genuine, mathematically/pedagogically sound fix exists only
by editing `src/components/figures.tsx` (or other `src/` renderer/test code), which is outside
this worker's hard-rule scope. Flagging for a worker with `src/` write access.
