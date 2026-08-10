# SESSION 209 — Rich-Mix Adjudication (read-only analysis pass)

No source, test, content, or script file was touched. This is the pre-insertion adjudication the
S209 mandate asked for: the carried candidate plus at least 12 further HS candidates, each run
through FIT / REACH / READOUT / NOVELTY, with an honest pass-rate extrapolation toward the 62-step
insertion target and a flagged list of the eight known engine gaps.

**Tooling used (read-only):** `node scripts/measure/step-mix.mjs` (the pinned rich-mix definition:
`rich = manip>=2` per `scripts/engine-capabilities.json`, mode-aware via `manipByAnswerMode`,
denominator = every step carrying a widget); a throwaway script cross-referencing
`INSERTION_CANDIDATES.json` against that same live definition; direct reads of
`content/courses/**/lessons/*.json`, `src/lib/schema.ts`, and `scripts/engine-capabilities.json`.

## 0. Baseline, confirmed live (not trusted from any stale doc)

```
HS   answerable  3625 | rich  860  23.7% | semi  276  7.6% | static  2489  68.7%
HS against the >=25% rich target: 23.7% — 47 more rich steps needed.
  47 if CONVERTED in place (denominator fixed) · 62 if INSERTED as new steps (denominator grows).
```

`HS_COVERAGE_CREDIT_AUDIT.json` is a **different metric** (standards-coverage-by-heading audit,
not the rich-interaction denominator) — it does not define the 23.7%; `step-mix.mjs` does, and it
was re-run this session to confirm the number is still live and unchanged.

## 0.1 INSERTION_CANDIDATES.json is stale — quantified

The file's `nonRichSteps` lists and `score`/`tier` values were computed **before** S205K's
`manipByAnswerMode` refinement (which rates `exactNumberLab` steps with `answerMode: "numeric"` as
manip 2/rich — the magnitude-rail interaction — while every other `exactNumberLab` mode stays at
the type-level floor of 1). A script re-checking all 627 candidates' `nonRichSteps` against the
live `step-mix.mjs` definition found:

- **310 of 3,075 listed "non-rich" steps are actually already rich** under the current definition
  (all `exactNumberLab`/`numeric` steps — e.g. `lf-03-03/k1`, `lf-04-02/k1`, `cr-03-03/k1`, …).
- Restricting to the 40 HS courses (grades 9–12) and recomputing each candidate lesson's rich
  count live: **62 of the 549 HS candidate lessons are genuinely at 0% rich**; the rest already
  carry at least one live rich step the stale file undercounted or the tier math didn't reflect.

**Consequence:** any prioritization run directly off `INSERTION_CANDIDATES.json`'s `tier`/`score`
columns is working from an undercount. The safe use of the file is as a **lesson-id worklist**
(which HS lessons exist, roughly which engines are already proven in that course) — not as a
verdict. This session re-derived rich/non-rich per step live for every candidate examined below.

## 1. The carried candidate — `lf-02-01/i3`

**Lesson:** `content/courses/linear-functions/lessons/lf-02-01.json` — "Meet y = mx + b." Read in
full (8 answerable steps: e1, i1, k1, k2, i2, k3, i3, ch1).

**Step i3's claim:** "For y = 5x + 3, find y when x = 1" — substitute, multiply, add. Currently a
plain `numeric` widget (manip 0).

| Gate | Verdict | Evidence |
|---|---|---|
| FIT | PASS | `exactNumberLab` (`task: "approximationEvaluate"`) already carries the identical claim twice in this lesson — `k2` (y=2x+1 at x=3) and `ch1` (y=4x−5 at x=3) both use it with `answerMode: "numeric"`. |
| REACH | PASS | m=5, c=3, x=1 fit the same `approxFormula` (multiply then add) already authored for k2/ch1; no range or integer-exactness issue. |
| READOUT | PASS | The stage narration ("substitute" → "evaluate") displays exactly the order-of-operations claim the step teaches. |
| NOVELTY | **FAIL** | Live `step-mix.mjs` scoring of this exact lesson shows `k2` and `ch1` are **already rich** (`exactNumberLab`/`numeric` = manip 2) — the lesson already sits at 3/8 = 37.5% rich, using the *identical* "substitute into mx+b, multiply-then-add/subtract" manipulation twice. Converting i3 would be a third occurrence of the same doing-moment in a 9-minute lesson. |

**Verdict: REFUSE.** The spec I would have authored (for the record, since FIT/REACH/READOUT all
clear):

```json
{
  "type": "exactNumberLab", "task": "approximationEvaluate",
  "prompt": "For y = 5x + 3, find y when x = 1.",
  "approxConstants": [{"id":"m","label":"the slope","value":5},
                       {"id":"c","label":"the constant term","value":3},
                       {"id":"x","label":"the input","value":1}],
  "approxFormula": {"op":"add","left":{"op":"multiply","left":{"op":"const","id":"m"},"right":{"op":"const","id":"x"}},"right":{"op":"const","id":"c"}},
  "answerMode": "numeric", "approxRound": 0, "tolerance": 0
}
```

This is exactly the trap the NOVELTY gate exists to catch ("a lesson already rich at i2 gains
nothing from a redundant i3") — here it's k2/ch1, not i2, but the shape is identical. **This
refusal is the correct outcome of a working four-gate process, not a stalled one.**

## 2. Further HS candidates (21 adjudicated; 2 PASS, 19 REFUSE)

Selected from `INSERTION_CANDIDATES.json` cross-referenced live, prioritizing MCQ-heavy /
concept-heavy lessons and lessons whose course already has a proven engine (so any REFUSE is a
genuine near-fit trap, not a lazy "no engine exists anywhere" claim). Verdict table first, evidence
below.

| # | Lesson/step | Course | Candidate engine | FIT | REACH | READOUT | NOVELTY | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | `se-01-03/i1` | systems-equations | systemsExplore | FAIL | FAIL | FAIL | — | **REFUSE** |
| 2 | `cn-04-01/i1` | complex-numbers | argandExplore | FAIL | FAIL | — | — | **REFUSE** |
| 3 | `cn-04-03/i1,k2` | complex-numbers | signChart / quadraticExplore | FAIL | n/a | FAIL(near) | — | **REFUSE** |
| 4 | `co-04-01/i1` | conic-sections | conicLocusLab | FAIL | FAIL | — | — | **REFUSE** |
| 5 | `co-01-02/i1` | conic-sections | (none) | FAIL | — | — | — | **REFUSE** |
| 6 | `co-03-01/i1` | conic-sections | (none) | FAIL | — | — | — | **REFUSE** |
| 7 | `pp-01-03/i1` | polar-parametric | polarTrace | FAIL | — | — | — | **REFUSE** |
| 8 | `pp-04-01/i1` | polar-parametric | (none) | FAIL | — | — | — | **REFUSE** |
| 9 | `tc-04-01/i1`, `tc-04-02` | triangle-congruence | triangleConstraintLab | FAIL | — | — | — | **REFUSE** |
| 10 | `gf-01-03/i1` | geometry-foundations | (none — no math object) | FAIL | — | — | — | **REFUSE** |
| 11 | `cp-04-01/k1` | constructions-and-proof | (none — no math object) | FAIL | — | — | — | **REFUSE** |
| 12 | `lg-04-03/i1` | logarithms | expLogExplore | FAIL | FAIL | — | — | **REFUSE** |
| 13 | `si-05-01/k1` | statistical-inference | (none — no math object) | FAIL | — | — | — | **REFUSE** |
| 14 | `vec-05-03/k1` | vectors-matrices | **matrixTransform** | PASS | PASS | PASS | PASS | **PASS** |
| 15 | `rf-02-03/i1` | rational-functions | signChart | FAIL | — | — | — | **REFUSE** |
| 16 | `pq-02-02/k1` | polygons-quadrilaterals | angleMeasure | FAIL | FAIL | FAIL | — | **REFUSE** |
| 17 | `fna-02-03/i1` | function-analysis | graphRead | FAIL | — | — | — | **REFUSE** |
| 18 | `rt-05-04/i1,k3` | right-triangles-trig | (none) | FAIL | — | — | — | **REFUSE** |
| 19 | `alg1-03-03/k2` | solving-equations | solveBalance | PASS(topic) | **FAIL** | — | — | **REFUSE** |
| 20 | `ep-04-01/i2` | exponents-polynomials | binomialAreaLab | FAIL | — | — | — | **REFUSE** |
| 21 | `sy-02-03` (new step, pre-`ch`) | similarity | **dilationExplore** (segments mode) | PASS | PASS | PASS | PASS | **PASS (insertion)** |

### Evidence (compact)

**1. `se-01-03/i1`** — "How many solutions does y=2x+1 & y=3x−1 have?" (classify by comparing
slope/intercept, no solving). `systemsExplore` (`schema.ts:1123`) requires dragging a point to a
single `(targetX,targetY)` intersection — it cannot represent "no solution" (parallel, no
intersection) or "infinitely many" (every point) for 2 of the lesson's 3 categories, and even for
the one-solution case its READOUT is a coordinate pair, not a solution-count classification. FIT
mismatch on the engine's own free variable — REFUSE.

**2. `cn-04-01/i1`** — "Solve x²=−36." `argandExplore` (`schema.ts:2695`) plots or multiplies a
*given* complex number; it has no equation-solving mechanism and only one `(targetRe,targetIm)`
point, but the lesson's answer is a ± PAIR (±6i). No engine in the registry derives complex roots
from an equation — REFUSE, genuine gap (not one of the eight catalogued).

**3. `cn-04-03/i1,k2`** — classify quadratic roots by sign of D=b²−4ac; design c for a repeated
root. `signChart` (`schema.ts:2932`) charts the sign of a *function of x* across intervals — a
different mathematical object than the sign of one fixed number D computed from coefficients.
`quadraticExplore` vertex form (`targetK`) is a near-miss for the "design a repeated root" family
(k2/k3/ch1): dragging k→0 visualizes tangency = D=0 correctly, but its READOUT is k (vertex height
in vertex form), not the authored quantity c (standard form) — displays something *adjacent*, not
the taught quantity. REFUSE, flagged as a near-miss that would need the prompt re-scoped to ask
for k, not c, to pass cleanly.

**4–6. `co-04-01/i1`, `co-01-02/i1`, `co-03-01/i1`** — conic-sections classification-from-
coefficients (A vs C sign pattern), shifted-parabola anatomy (vertex/focus/directrix from h,k,p),
and hyperbola anatomy (vertices from standard form). `conicLocusLab` (`schema.ts:5845`) is
eccentricity-parametrized (`targetEccentricityTenths`) — a different classification axis than
general-form coefficient signs or vertex-shift reading. No engine in the registry models "read
anatomy off an algebraic form" for conics — REFUSE all three, genuine gap.

**7. `pp-01-03/i1`** — rectangular→polar conversion with quadrant correction (r=√(x²+y²),
θ=arctan(y/x)±π). `polarTrace` (`schema.ts:2817`) draws rose/limaçon curves (`targetPetals`,
`targetA`) — a curve-shape-matching task, unrelated to coordinate conversion. REFUSE, no fit.

**8. `pp-04-01/i1`** — parametric x(t),y(t), evaluate at an instant, read direction/orientation.
No engine models a parameter-driven point tracing a 2D path. Closest catalogued gap is
**motion-odometer** (§4), but that gap's defining need is an *accumulated-distance* readout for a
1D journey (`dc-01-03`), not a 2D locus with no odometer — not an exact match. REFUSE, new gap.

**9. `tc-04-01/i1`, `tc-04-02`** — identify triangle centers (circumcenter/incenter/centroid/
orthocenter) by construction-line family and equidistance property. `triangleConstraintLab`
(`schema.ts:3925`) is congruence-criterion-only (SSS/SAS/ASA/AAS/HL/SSA); `coordinateProofLab`
computes slope/distance/midpoint on a dragged vertex but has no circumcenter/incenter/centroid
computation. No `triangleCentersLab` exists in the registry — REFUSE, genuine gap.

**10. `gf-01-03/i1`** — notation discipline (`=` for numbers vs `≅` for figures) and
dimension-of-intersection rules. There is no continuous mathematical quantity here to put on a
control — the lesson teaches a symbolic convention, not a measurable relationship. REFUSE: FIT
fails because no mathematical *state* exists for any engine to represent, not because the right
engine is merely missing.

**11. `cp-04-01/k1`** — conjecture vs. proof, counterexample-count epistemics. Same class as #10:
a purely logical/epistemic claim with no quantity to manipulate. REFUSE, same reasoning.

**12. `lg-04-03/i1`** — solve eˣ=42 for x (unknown is the exponent; base e fixed).
`expLogExplore` (`schema.ts:2655`) sounds like a perfect name match, but its free variable is
`targetBase` with `x` (the exponent/argument) held FIXED and authored — the *opposite* of this
step's unknown. REACH fails outright: the widget cannot hold the base at e and vary x. REFUSE —
the clearest name-vs-spec trap found this session.

**13. `si-05-01/k1`** — study-design "ceiling" reasoning (what causal claim a design licenses).
No engine models research-methodology judgment; `sampleSim`/`ciCapture` compute sampling
distributions and intervals, a different (computational) statistics skill. REFUSE, no math object.

**14. `vec-05-03/k1` — PASS.** "Reflecting over y=x then over the x-axis gives [[0,1],[−1,0]].
This is: 90° CW rotation" (currently mcq). `matrixTransform` (`schema.ts:2744`) steers 4 entries
toward a target 2×2 matrix and shows the unit square's live image, both basis arrows, and a
determinant readout — exactly the "a matrix's geometric identity is visible from where the basis
vectors land" claim this lesson's whole chapter is about. REACH: target `[[0,1],[-1,0]]` is well
inside `[-3,3]` int range. READOUT: the rotating square *is* the classification the mcq options
only describe in words. NOVELTY: lesson is 0/5 rich currently (confirmed live) — no redundancy.
**Spec sketch (convert k1 mcq → matrixTransform):**
```json
{
  "type": "matrixTransform", "ta": 0, "tb": 1, "tc": -1, "td": 0,
  "sa": 1, "sb": 0, "sc": 0, "sd": 1,
  "targetName": "a 90° clockwise rotation",
  "prompt": "Reflecting over y = x, then over the x-axis, composes to this matrix. Build it and watch what it does.",
  "successFeedback": "…", "shapeFeedback": "…"
}
```
(`shapeFeedback`/other required strings to be authored against the lesson's own voice — not
invented here, per the no-content-edit mandate of this session.)

**15. `rf-02-03/i1`** — count total excluded values through a chained rational multiply/divide
(bookkeeping domain restrictions across steps, including a divisor's numerator). `signChart`
charts sign of a function's *value*, not a running list of excluded inputs through a multi-step
algebraic chain — different object. No engine tracks domain-restriction bookkeeping through
sequential operations. REFUSE, genuine gap (not one of the eight, though adjacent in spirit to
"nested-rule decomposition").

**16. `pq-02-02/k1`** — parallelogram opposite/consecutive angle rules. `angleMeasure`'s
`linearPair` (`schema.ts:1294`) models `neighbor = multiplier·x` summing to a fixed `total` — built
for RATIO-given linear-pair problems, not "here is one specific angle value, its supplement is
free." It also renders a generic angle, not a parallelogram, so the transversal/parallel-rail
reasoning the lesson teaches has nothing to attach to on screen. REFUSE — REACH and READOUT both
fail, a second clean near-fit trap.

**17. `fna-02-03/i1`** — read range/extrema from a full function graph (increasing/decreasing,
domain/range, story). `graphRead` (`schema.ts:1454`) is a **pictograph/bar-graph reading engine**
(`drawn × unitValue` icons or bars) — completely unrelated to continuous function-graph literacy
despite the name. This is the second clearest name-vs-spec trap this session. REFUSE, no fit
exists for "read behavior/extrema/range off a stated function or graph."

**18. `rt-05-04/i1,k3`** — choose the right trig tool (SOH-CAH-TOA / Law of Sines / Law of
Cosines) from the givens; derive why Area=½ab·sinC (height=b·sinC). Tool-selection is a
classification task like #4–6 with no engine; the height-decomposition claim (k3) has no engine
that drops a live perpendicular from an included-angle vertex and reads h=b·sinC —
`triangleAngleLab` models a fixed-angle-A invariant while dragging C, a different claim. REFUSE,
genuine gap on both fronts.

**19. `alg1-03-03/k2`** — "Solve 2x + a = c for x" (a LITERAL/formula equation — the "constant" is
itself a symbol, not a number). `solveBalance` is topically the right family (proven in this exact
course for `alg1-01-01/01-03/02-01/02-03`, all *numeric* two-step equations) but its schema
(`schema.ts:1727`) types `a`, `b`, `c` as `z.number().int()` — the pans can only weigh literal
integers, never a symbolic tile labelled "a" or "c". REACH fails outright: the engine cannot
represent this lesson's actual generalization (multiple unknowns as symbols). REFUSE — the
clearest illustration this session of "proven in course ≠ fits this lesson."

**20. `ep-04-01/i2`** — factor the GCF from a binomial (6x²+9x → 3x(2x+3): monomial×binomial).
`binomialAreaLab` (`schema.ts:5963`) models a rectangle with BOTH sides carrying an x-term
(`pX·x+a)(qX·x+b)`, i.e. binomial×binomial trinomial products/factoring — a structurally different
factor shape than a monomial GCF pulled from a binomial. `algebraTiles` is a simple x/constant tile
counter with no product/factor structure at all. REFUSE, near-fit trap (both proven in-course, for
a different lesson in the same chapter family).

**21. `sy-02-03` — PASS (insertion, not conversion).** The lesson's `ch` challenge step applies
the side-splitter theorem (DE ∥ BC ⇒ AD/DB = AE/EC) computationally but nothing in the lesson lets
a learner *see* the invariant before applying it. `dilationExplore`'s `segments` mode
(`schema.ts:1393`, S203W) is purpose-built for exactly this figure: "a triangle cut by a line
PARALLEL to its base," dragging the cutter, with AD/DB and AE/EC both live and provably equal
(docstring: "never disagree — the side-splitter theorem"). FIT/REACH/READOUT all clean; NOVELTY
holds because the lesson is 0/6 rich and nothing else in it lets the learner manipulate this
geometric relationship. Recommended as a **new inserted step** (matching the S205E precedent of
inserting rather than converting), anchored between `c3` and `ch`, so the challenge step's
computation is preceded by a doing-moment that makes AD/DB=AE/EC visible before it's used.
**Spec sketch:**
```json
{
  "type": "dilationExplore",
  "prompt": "Drag DE (parallel to BC) and watch how it divides the two sides.",
  "shape": [[0,0],[10,0],[3,6]],
  "showRatios": ["segments"],
  "targetK": 0.6,
  "kMin": 0.2, "kMax": 0.9, "kStep": 0.1, "kStart": 0.3,
  "successFeedback": "…", "lowFeedback": "…", "highFeedback": "…"
}
```
(Numeric target chosen so the live AD/DB = AE/EC ratio matches the `ch` step's own 6:4 setup —
exact wiring/authoring of the copy is implementation work for a future session, not this one.)

## 3. Honest count and pass-rate extrapolation

**Adjudicated this session: 22 candidates (`lf-02-01/i3` + 21 further). PASS: 2. REFUSE: 20.**
Observed pass rate: **2/22 ≈ 9%.**

At a 9% pass rate, reaching **62 insertions** would require adjudicating roughly **680
candidates** — more than the entire HS candidate pool currently listed
(`INSERTION_CANDIDATES.json` has 549 HS-course entries total, and only 62 of those are genuinely
at 0% rich once re-scored live; the rest already have at least one rich step). **The pool, as
sampled here, is thinner than 62 at this rigor level — say so plainly, not inflate it.**

Two caveats against over-reading that 9% as the corpus-wide truth:

1. **This sample was deliberately adversarial.** It targeted the "0%-rich, MCQ-heavy" bucket,
   which structurally over-represents classification/definitional/notational lessons (conic
   classification, triangle-center naming, notation discipline, study-design literacy, tool
   selection) — exactly the lesson shape with the least chance of having a manipulable
   mathematical object at all. A representative sample across *all* HS candidates (including
   partially-rich lessons where a specific non-rich step, not the whole lesson, is the target)
   would likely score higher.
2. **Prior sessions' own record is more favorable but still not close to saturation.** S205E/H/J/M
   found genuine passes at roughly 2/9 in the calculus steppedReveal cluster and cited "~50% fit
   rate" for insertion candidates generally (`SESSION205N_CONTENT_CHANGE_LEDGER.md`) — but that
   figure predates this session's finding that ~310 "non-rich" rows in the candidate file are
   stale, which likely inflates any historical "fit rate" computed by treating those rows as live
   targets.

**Bottom line:** the ≥25% target (62 insertions, or 47 conversions) remains reachable in
principle, but not from a shallow sweep of MCQ-heavy 0%-rich lessons at this gate discipline. Two
genuine passes from 22 rigorous adjudications is the honest yield this session produced; treat any
claim of "50% fit rate" going forward as needing re-verification against the live (not stale)
candidate classification.

## 4. Future fits — the eight known engine gaps (not counted as passes)

Precise definitions recovered from prior session ledgers (none had a standalone spec doc; each was
defined at the point of refusal):

| Gap | Defined at | What it needs |
|---|---|---|
| nested-rule decomposition | `dr-04-02` (S205H) | A mode on `derivativeRuleLab` exposing rule ORDER/assembly for a composed chain (currently `product\|chain` runs one rule, not the outer-then-inner sequence). |
| u-substitution two-world | `in-05-02` (S205H) | A substitution engine showing the x-world and u-world integrals side by side; `riemannSum`/`accumulateArea` draw one integrand over one interval only. |
| error-propagation | `dc-03-02` (S205J) | An engine narrating where an arithmetic error enters and compounds through a computation. |
| growth-race | `dc-04-02` (S205J) | An asymptotic growth-hierarchy comparison engine (which function "wins" at infinity). |
| movable-interval | `ca-03-01` Rolle's Theorem (S205C) | `derivativeTrace`'s `fn` is a fixed 4-item enum with no interval-endpoint controls; needs draggable endpoints so a learner can test the existence claim by trying to break it. |
| motion-odometer | `dc-01-03` Distance vs Displacement (S205D) | A motion engine with position playback AND a running accumulated-distance (odometer) readout, distinct from net displacement. |
| number-line ray | `alg1-04-01`-class inequality lessons (S205E) | A number-line engine with open/closed endpoint and ray-direction controls (current inequality endpoint work is a `matchPairs`). |
| quotient mode | `dr-03-02` Quotient Rule (S205E) | A `derivativeRuleLab` mode with a fixed-area rectangle, one side driven, showing the reciprocal's v⁻² inverse-square response — the product mode has no such channel. |

**None of the 21 candidates in this session's sweep matched one of the eight exactly.** The eight
are calculus-course lessons (`dr-*`, `dc-*`, `in-*`, `ca-*`) already fully adjudicated and refused
in S205C/D/E/H/J with the gap recorded against the specific lesson; this session deliberately
sampled *other* HS courses (algebra, geometry, complex numbers, conics, polar/parametric, stats,
logs, trig, rational functions, quadrilaterals, function analysis) to avoid re-treading that
ground. Two new REFUSE reasons surfaced that are **not** in the catalogue and are flagged here as
candidate *ninth/tenth* gaps for a future session to name formally, not counted as passes or as
one of the eight:
- **conic-anatomy-from-coefficients** (`co-04-01`, `co-01-02`, `co-03-01`) — no engine reads
  vertex/focus/directrix or classification off an algebraic conic form; `conicLocusLab` is
  eccentricity-only.
- **domain-restriction-chain-tracking** (`rf-02-03`) — no engine accumulates excluded inputs
  through a multi-step rational operation chain; `signChart` charts a function's sign, not a
  running exclusion list.

## 5. Recommended first insertion batch

**Only 2 candidates cleared all four gates this session — presenting both, honestly, rather than
padding to 5–10:**

1. **`vec-05-03/k1`** (highest confidence — pure conversion, no new authoring judgment needed
   beyond feedback-string voice-matching; target matrix and `targetName` are already implied by
   the existing mcq's correct option).
2. **`sy-02-03`** new inserted step before `ch` (second-highest confidence — engine and figure
   are an exact structural match via the documented `segments` mode, but it is a genuine
   insertion requiring new prompt/feedback copy, not a template swap).

**To build a batch of 5–10, the next session should NOT re-sweep the 0%-rich/MCQ-heavy bucket**
(this session's evidence says that bucket is disproportionately classification/definitional and
low-yield). Higher-probability next targets, based on what actually passed here:
- Other **composition/transformation** steps in `vectors-matrices` and `function-transformations`
  (matrixTransform, transformExplore, rotationLab are all manip≥2 and topically native).
- Other **parallel-line / proportional-segment** geometry steps across `similarity`,
  `triangle-congruence`, `polygons-quadrilaterals` where `dilationExplore`'s `segments`/`altitude`
  modes or `triangleConstraintLab`'s `midsegment` constraint are proven in-course but not yet used
  on the specific step (same shape as the `sy-02-03` find).
- Steps whose claim is genuinely computational/manipulable (not classification, not notation, not
  epistemics, not tool-selection) — the four REFUSE-for-"no math object" cases in this session
  (`gf-01-03`, `cp-04-01`, `si-05-01`, and the tool-selection half of `rt-05-04`) mark a whole
  REFUSE class the next adjudication pass can skip on sight rather than re-derive.

**Implementation protocol for whichever passes are actually inserted** (per the standing content-
freeze discipline used in S205E/H/J/M and the S208/S209 mandate): single-writer isolation per
lesson file, a per-insertion content-change ledger entry citing the grader-independent verification
(as done for `alg1-01-01`'s solveBalance insertion — witness function agreement, not eyeballing),
and hash authorization (`hash:proof` / `SESSIONxxx_LESSON_HASHES.json`) before and after, so the
"no authored lesson content changed" claim for *this* session stays true and the next session's
diff is exactly the two insertions above, nothing else.
