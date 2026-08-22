# S320-A9 — Independent Assessment: `functions-g8`, `systems-equations`, `coordinate-geometry`

Reviewer: Claude Cowork independent assessor (S320)
Reviewed at: 2026-08-20T18:36:42.000Z
Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (repository source + human-decision ledgers
are authoritative; the ChatGPT Work cache is a derived evidence accelerator only — no cache entry
approved its own work here).
Scope: THREE complete courses — `content/courses/functions-g8` (12 lessons),
`content/courses/systems-equations` (12 lessons), `content/courses/coordinate-geometry` (10 lessons),
34 lessons total. Every `course.json` and every lesson JSON in full, read-only on content. Every
`functionMachine`/`secantSlope`/`slopeTriangle`/`lineExplore`/`covariationScrubber`/
`affineRelationshipLab` evaluation, every system solution (substituted into BOTH original equations,
including the two special-case 0=7/0=0 leftovers in se-03-03), every slope/intercept/distance
computation in coordinate-geometry, and every `shapeHierarchyLab` triangle/hierarchy/verdict
classification was recomputed by hand against the prompt/widget/feedback/explanation/figure text.
Dispositions written to `reports/closure/cowork-staging/laneB-s320-A9-dispositions.jsonl` (34
lesson-disposition records, one per lesson, NDJSON, basis hashes independently recomputed via
`node scripts/session/print-review-basis.mjs` and confirmed to match on a second pass — no drift).
This file is the companion rationale + implementation-contract report. The ledger was not written.

Any prior S316/S318 dispositions touching lessons in these three courses are treated as informational
only; this pass is a fresh, independent signature that supersedes them, per the authority doc's rule
that an implementation worker (or an earlier reviewer) cannot approve its own work.

## Per-course totals

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| functions-g8 | 12 | 12 | 0 | 0 |
| systems-equations | 12 | 12 | 0 | 0 |
| coordinate-geometry | 10 | 9 | 1 | 0 |
| **Total** | **34** | **33** | **1** | **0** |

## functions-g8 (12 lessons — 12 KEEP, 0 REVISE)

- **fg-01-01** — KEEP. Function-machine input-output (3×4−2=10) and backward-vs-forward undo logic
  hand-verified; all mcq definitional items (birthday, shared-teacher, adds-to-10) correctly classify
  one-output-per-input vs. multi-output cases; dragBucket sort (double/age/area=function;
  factors/friend=not) all correct.
- **fg-01-02** — KEEP. `verticalLineScanner` and all repeated-input/repeated-output mcq pairs
  recomputed and correctly classified (e.g. (4,1),(4,9) not a function; (1,8),(2,8),(3,8) is). Figure
  `fg-not-function` at c2 illustrates a different generic pair than the lesson's own worked numeric
  examples — matches the app-wide accepted generic-illustrative-figure convention, not a defect.
- **fg-01-03** — KEEP. Vertical-line-test logic verified across all mcq items (slanted line passes,
  vertical line fails infinitely, sideways-U fails, upright parabola and horizontal line pass);
  dragBucket sort and remedial all correctly classify.
- **fg-02-01** — KEEP. `secantSlope` (rise 8/run 2 = 4 on y=x² from x=1 to x=3) and every
  rate-of-change numeric item recomputed and correct, including negative rates (draining tank:
  −20/4=−5). Figure `fg-rate-table` at c2 is a generic table illustration, not tied to specific
  stated numbers — accepted convention.
- **fg-02-02** — KEEP. `slopeTriangle` (A(1,1)→B(4,7): rise 6/run 3 = 2) and every same-line
  different-points slope computation (9/3=3, 12/4=3, 2/3, signed-run 12/4=3) hand-recomputed and
  correct; similar-triangles constant-ratio explanation is sound.
- **fg-02-03** — KEEP. `lineExplore` (tank: b=2, m=3 → y=3x+2) and every initial-value/slope
  read-off and two-point equation-build (e.g. (0,1),(2,7)→y=3x+1) recomputed and correct.
- **fg-03-01** — KEEP. `covariationScrubber` (a=2, b=3, x=4→y=11) and every same-function-across-forms
  check (rate+intercept matching, odd-one-out table with slope 2 vs 3) recomputed and correct.
- **fg-03-02** — KEEP. `affineRelationshipLab` rate comparisons across equation/table/context forms
  (2v3, 5v4, 6v4, three-way 3v4v2, intercept-trap 1v5) all recomputed and correctly classified;
  distractors target real form-confusion misconceptions with accurate numbers.
- **fg-03-03** — KEEP. `affineRelationshipLab` rate-AND-intercept comparisons (10v3 start with 2v4
  rate; 8v2 start with 1v3 rate; tie-rate-2 with 1v5 start; gym rates 5v2) and the break-even
  challenge (5x+20=2x+50→x=10) all hand-recomputed and correct.
- **fg-04-01** — KEEP. `covariationScrubber` (a=3, b=1, x=3→y=10, diffs 3,3,3) and every
  linear/nonlinear difference-table classification (squares 1,3,5; doubling 1,2,4; constant −2 and
  −3 cases) recomputed and correct; dragBucket sort all correct.
- **fg-04-02** — KEEP. `graphStoryLab` qualitative graph-reading claims (flat=stopped, steep=faster,
  down=decreasing, flattening-while-rising=slowing) all internally consistent with their segment
  `kind` fields across every read-task.
- **fg-04-03** — KEEP. `graphStoryLab` build-mode multi-stage story-to-shape sequences (fill-then-flat,
  speed-up-then-steady, fall-flat-rise, steepening-savings, fast-stop-slow) all correctly ordered and
  consistent with their segment kinds; `wrongSequences` distractors are genuine plausible
  mis-orderings.

## systems-equations (12 lessons — 12 KEEP, 0 REVISE)

- **se-01-01** — KEEP. `systemsExplore` intersection (2x−1=−x+5→(2,3)) and every substitution-check
  mcq (fails-second-equation cases) and intersection numeric item (2x=x+3→x=3; x+1=−x+5→y=3;
  3x−4=x+2→(3,5)) hand-recomputed and correct.
- **se-01-02** — KEEP. Every graphing-intersection item recomputed and correct: (2x−1,x+1)→(2,3);
  (−x+4,2x−5)→(3,1); (3x−4,x+2)→(3,5); (x−1,−2x+8)→(3,2); (2x+1,−x+7)→(2,5). Reuse of the same
  crossing points as se-01-01 is intentional worked-example continuity across the chapter, not
  duplication.
- **se-01-03** — KEEP. Every solution-count classification (different slopes→one; same
  slope/different intercept→parallel/none; identical lines→infinitely many, incl. fractional slope
  1/2) correctly reasoned from slope/intercept comparison alone, matching the `systemsExplore`
  degenerate-case feedback.
- **se-02-01** — KEEP. Every substitution-when-isolated item hand-solved and correct (x+(x+1)=7→x=3;
  x+4x=10→x=2; x+2x=9→y=6; x+(3x−5)=7→y=4); `solveBalance` (5x=10→x=2,y=6) matches its narrative
  setup exactly.
- **se-02-02** — KEEP. Every isolate-then-substitute item recomputed and correct (3x−(8−x)=4→x=3;
  (2+y)+2y=8→y=2; 2x−(9−x)=6→x=5; (2+y)+2y=11→y=3); `solveBalance` (x−y=1, 2x+y=8→3x=9) setup
  verified against its own narrative.
- **se-02-03** — KEEP. Every full-substitution item recomputed and correct, including the three-way
  matchPairs (3 systems → (3,5),(3,6),(4,3), all correctly paired) and the two-equations-nothing-
  isolated item (x+2y=11, 3x+y=13→(3,4)). k3's wrong-option feedback for (3,5) is arithmetically
  correct (3+2·4=11 vs. 3+2·5=13≠11) but terse — a minor clarity nit, not a mathematical error.
- **se-03-01** — KEEP. Every add/subtract-to-eliminate item recomputed and correct (2x=10→x=5; x=3
  via subtract; 2y=6→y=3; 4x=12→x=3; 2x=6→x=3; 4y=16→y=4), including correct add-vs-subtract choice
  based on matching/opposite coefficients.
- **se-03-02** — KEEP. Every scale-one-then-eliminate item recomputed and correct (5y=15→y=3;
  7y=14→y=2; x=4; y=2; 5x=15→x=3), including correct multiplier selection to line up a coefficient
  in each case.
- **se-03-03** — KEEP. Every scale-both item recomputed and correct (5y=15→y=3; 6x+8y=20 &
  6x+9y=21→y=1; −x=−3→x=3; 7x=14→x=2), and both special-case leftovers (0=7→no solution;
  0=0→infinitely many) correctly reasoned from the actual scaled equations.
- **se-04-01** — KEEP. Every total/difference word-problem system recomputed and correct (2x=16→x=8;
  2x=36→x=18 girls; rope x=2y & x+y=15→x=10; father x=4y & x+y=40→son y=8); `solveBalance`
  (2x−4=18→x=11,y=7) matches its book/pen narrative.
- **se-04-02** — KEEP. Every count/value word-problem system recomputed and correct (dimes/nickels→
  x=7; tickets 8x+5y=57→x=4,y=5; quarters/dimes→x=3; stamps→y=6; seats 12x+8y=88→x=4);
  `solveBalance` (3x+15=21→x=2 adult, 1 student) matches its narrative exactly.
- **se-04-03** — KEEP. Every choose-method item recomputed and correct (x+(3x−2)=10→x=3;
  3x+2y=12 & 3x−y=3→(2,3); three-way matchPairs all correctly paired incl. (6,3) via addition;
  hot-dogs/drinks→x=7; tickets 9x+6y=84→x=6); interpret-the-right-variable items (children=y=6)
  correctly target the asked quantity.

## coordinate-geometry (10 lessons — 9 KEEP, 1 REVISE)

- **cg-01-01** — KEEP. Every ordered-pair read/plot/order-matters item verified correct
  (origin=(0,0); (5,2); x-coord 6; y-coord 7; same-x→vertical stack); figure `cg-order-matters`'s
  (2,5)/(5,2) example matches c2's own text exactly.
- **cg-01-02** — KEEP. Every plot/measure item verified correct (plot (3,2),(5,4); segment
  (2,2)-(6,2)=4; audited claim (4,1)-(4,6)=5 confirmed true; rectangle 4th corner from
  (1,1),(6,1),(6,4)→(1,4)); distance-by-difference-not-dot-count taught and drilled consistently.
- **cg-01-03** — KEEP. Every real-world-axis-meaning and distance/path item verified correct
  (library-park 6−1=5 blocks; Maya's $3/week savings 3,6,9,12; Sam's 2-leg walk 4+5=9 blocks;
  day/tomato point-reading). c1's prose "library at (2,3)" example and i1's separately-rendered
  "school at (5,1)" widget are two independently-rendered, never-jointly-displayed items — not a
  data-consistency defect.
- **cg-02-01** — KEEP. Every two-rules-paired-and-doubling item verified correct (rule A/rule B
  hops; pairs (2,4),(4,8),(6,12) all exactly 2×; shortcut A=10→B=20; rule C/rule D 2× relationship
  holding in all three pairs).
- **cg-02-02** — KEEP. Every pair-plots-as-point and straight-line-reasoning item verified correct
  ((1,2),(2,4),(3,6) with a constant right-1-up-2 step; extension to (4,8) and (5,10); challenge
  tripling pattern extending to (6,18)).
- **cg-03-01** — KEEP. Every attribute-inheritance hierarchy item verified logically sound and
  correctly directional (parallelogram→rectangle→square chain; rhombus→square; the
  upward-inheritance error correctly caught via the 5-by-2 rectangle counterexample); 4×90°=360°
  verified.
- **cg-03-02** — KEEP. `quadDrag` target corner (0,3) on fixed corners (0,0),(6,0),(6,3) produces a
  true 6×3 rectangle with equal diagonals — verified by hand; every square/rhombus/trapezoid
  classification and the equal-sides-perimeter item (4×6=24) verified correct.
- **cg-03-03** — **REVISE**. ch1's `shapeHierarchyLab` (`triangleQuestion:"dual"`) sets
  `triangleSides:[3,4,5]` AND `triangleAngles:[30,60,90]` together. `ShapeHierarchyLabW`
  (`src/components/widgets.tsx`) draws the SVG triangle from `triangleSides` alone
  (`shapeSides = sides ?? …`, so a supplied `triangleSides` always wins) — a genuine 3-4-5 right
  triangle whose true angles are ≈53.13°/90°/36.87° at vertices L/apex-T/R respectively (hand-
  recomputed via the law of cosines: cos T=(9+16−25)/24=0, cos L=(9+25−16)/30=0.6,
  cos R=(16+25−9)/40=0.8) — but the same component still overlays the authored `triangleAngles`
  array as text labels at those same three vertices (L=30°, T=60°, R=90°) and states both arrays in
  the SVG's `aria-label` as flat "givens." Net effect: the vertex that is visually the true 90°
  corner (apex T) is labeled "60°," and the vertex labeled "90°" (R) is visually the ≈37° corner —
  the rendered picture and its own printed/spoken angle labels directly contradict each other.
  Grading is unaffected: `shapeHierarchyTriangleLabels`/`shapeHierarchyChoiceCorrect`
  (`src/lib/schema.ts`) read `triangleSides` and `triangleAngles` independently of the rendered
  geometry, so "right"+"scalene" is still correctly computed and matches the designated correct
  choice "Right scalene." This `triangleSides`+`triangleAngles`-together pattern occurs exactly once
  in the course (only here); every other step in this lesson (i1, k1, k2, k3, remedial) supplies
  only one of `triangleSides`/`triangleAngles` at a time and renders truthfully.
  **Implementation contract:** change `widget.triangleSides` from `[3, 4, 5]` to `[6, 3, 5.2]` (the
  30-60-90 ratio 2x, x, x√3 with x=3, mapped through the code's own side-index/vertex convention:
  `sides[0]` is the L–T edge, opposite vertex R, so it must be the hypotenuse = 6 so R reads 90°;
  `sides[1]` is the T–R edge, opposite vertex L, so it must be the short leg = 3 so L reads 30°;
  `sides[2]` is the L–R base, opposite apex T, so it must be the long leg ≈ 5.2 (3√3) so T reads
  60°) so the rendered shape's true angles (≈30.0°/90.0°/60° at L/R/T) match the printed
  `triangleAngles:[30,60,90]` labels at those same vertices. No change is needed to prompt text,
  `triangleAngles`, feedback text, or grading logic (`sideLabel` stays "scalene" since 6≠3≠5.2).
- **cg-04-01** — KEEP. Every clues-down/promises-up classification item verified correct (rectangle
  from 4-sides+2-parallel-pairs+4-right-angles+not-all-equal; rhombus is the deepest guaranteed rung
  from equal-sides-alone; the right-angle cross-cutting rule correctly gathers square+right-triangle
  and excludes tilted rhombus/trapezoid; square from right-angles+equal-sides together).
- **cg-04-02** — KEEP. Every always/sometimes/never verdict item verified correct against its stated
  `relation` (overlap→sometimes for rectangle-is-square, isosceles-is-equilateral, and
  rhombus-is-rectangle, each with a genuine example AND counterexample; subset→always for
  square-is-rhombus and square-is-parallelogram; disjoint→never for equilateral-is-right-triangle
  and, under this course's exactly-one-pair definition, parallelogram-is-trapezoid, each with a
  genuine blocker).

## REVISE list (one-phrase reasons)

1. **cg-03-03** — ch1's `shapeHierarchyLab` renders a real 3-4-5 triangle but overlays a
   contradictory 30-60-90 angle-label set at the same vertices.

## Notes on scope decisions

- **mcq/predict option order**: authored order in JSON is irrelevant (render-time seeded shuffle per
  the authority doc); no findings are based on authored option order. Lab widgets (`shapeHierarchyLab`
  included) shuffle their choice buttons the same way (`seededShuffle` keyed by choice ids, S316), so
  this applies uniformly across all three courses.
- **Generic-illustrative figures** (`fg-not-function` in fg-01-02, `fg-rate-table` in fg-02-01, and
  similar concept-step figures elsewhere in functions-g8 and coordinate-geometry): these show a
  different specific number set than the adjacent worked text. This is the app's established,
  pervasive, accepted convention for concept-step illustrations (not a per-lesson authoring slip),
  and it does not contradict any single rendered claim the way cg-03-03's triangle does — the figure
  and the text are never presented as describing the *same* fixed data.
- **cg-01-03's "library at (2,3)" (c1 prose/figure) vs. i1's own widget "school at (5,1)"**: reviewed
  in detail and ruled out. These are two independently self-rendering elements (a static figure
  paired with c1's concept text, and i1's own `pointSetReasoningLab` with its own embedded point
  data) that are never displayed together making one joint claim about the same location — unlike
  cg-03-03, where a single widget's own SVG and its own text labels contradict each other inside one
  rendered view.
- **se-02-03/k3's wrong-option feedback wording**: "Check: x + 2y = 3 + 2·4 = 11 works, but
  3 + 2·5 = 13 doesn't" is arithmetically correct throughout (3+8=11 ✓ for the true solution y=4;
  3+10=13≠11 for the wrong option y=5) but terse — it does not explicitly restate "≠ 11" as the
  point of comparison. Judged a minor clarity nit, not a defect, consistent with "compact
  rationales; do not invent defects."
- **Remedial near-duplication of a lesson's own worked example** (e.g. se-02-01's remedial reusing
  its own k1's "x+y=9, y=2x" wording; se-04-01/02/03's remedials reusing their own k1's numbers):
  expected and intentional by design — a lesson's remedial reteaches its own main concept using the
  same or a closely related worked case, which is a different pattern from cross-lesson duplication
  and was not flagged.
- **cg-03-03 itself is otherwise sound**: only ch1's `triangleSides`+`triangleAngles` "dual" combo is
  affected. i1 (sides-only), k1 (angles-only), k2 (angle-sum arithmetic, no widget rendering issue),
  i2 and k3 (verdict/sideInclusive modes, no triangle-shape SVG), and the remedial (sides-only) all
  render and grade truthfully — the fix is scoped to one `triangleSides` array in one step.

## Return contract

`packet_id=S320-A9-functions-systems-coordinate-geometry-assessment, base_commit=<unresolved, no
git repo present at /home/user/maggies-trail>, contract_hash=<n/a — no packet contract file supplied
for this task>, role=independent-assessor, model=claude-sonnet-5, effort=high, speed=n/a,
scope_ids=[fg-01-01..fg-04-03, se-01-01..se-04-03, cg-01-01..cg-04-02] (34 lessons across 3
course.json files), status=complete, changed_file_hashes=<none — read-only on content; report +
disposition NDJSON are new files, not content changes>, evidence_refs=[content/courses/functions-g8/**,
content/courses/systems-equations/**, content/courses/coordinate-geometry/**,
src/components/widgets.tsx, src/components/figures.tsx, src/lib/schema.ts,
scripts/session/print-review-basis.mjs, scripts/audit/lesson-review-authority-s246.mjs],
gates_passed=[math-recomputation(34/34), system-solution-both-equations-check(24/24 systems-equations
items), triangle-classification-recompute(cg-03-03 all 6 shapeHierarchyLab items), figure/visual-
truthfulness-screen(34/34, 1 finding), duplicate-scan(34/34, 0 blocking clusters — remedial-reuses-own-
lesson pattern only), option-parity-screen(34/34, 0 leaks)], gates_failed=[figure/visual-truthfulness
on cg-03-03/ch1 — REVISE], cache_invalidations=none, new_decision_required=none — implementation
contract is fully specified (change triangleSides to [6, 3, 5.2] on cg-03-03/ch1), risks=[none beyond
the one documented REVISE; fix is a single-array, single-step change with no grading-logic or prompt-
text impact], next_owner=content-implementation-lane for cg-03-03 (coordinate-geometry, ch3-shape-
families) — 1 lesson, 1 step, 1 field.`
