# Learner-reported defects — consolidated status

Nine reports came in during S237. **Four are fixed and gated. Five are measured and NOT fixed.**
The split is deliberate: the four were single-mechanism engine defects with an existing precedent
to copy; the five are content programmes that change what learners are asked or graded on, and
doing those quickly would be worse than not doing them.

| # | Report | Status | Scale |
|---|---|---|---|
| 1 | Matching shows already-matched columns | **FIXED + gated** | 143/175 matchPairs, 41/187 dragBucket |
| 2 | Number line marks only the tappable answers | **FIXED + gated** | all `numberLineHop` |
| 3 | Token bank spells the answer | **FIXED + gated** | 155/237 buildExpression |
| 4 | Renderer typesets false equations | **FIXED + gated** | 178 → 0; 117 shipping |
| 5 | Graph/diagram axes unlabelled | measured | 28 of 32 coordinate-plane engines |
| 6 | Questions cite an absent diagram | measured | 105 steps; hypothesis rejected |
| 7 | Static items that need a manipulative | **CLOSED** | 32 rows, all resolved |
| 8 | Text-only explanations need illustrations | **first slice shipped** | 111 numeric steps |
| 9 | Wording too hard for the grade | measured | 60 surfaces |

---

## The four fixed

All four were the same shape: **an engine presenting its answer through arrangement rather than
through mathematics.** Three were position leaks (1, 2, 3); one was the renderer asserting false
statements (4). Each is pinned by a gate with a self-check, so the gate cannot pass by blindness.

Worth stating plainly: #4 was the most serious thing found all session. `x^2 - x - 6 = 0` was
being typeset as **`6 = 0`** in KaTeX, because the scanner could not cross an ASCII hyphen and
restarted after it. 117 authored rows in body and explanation fields carry that today. A maths
product setting a false equation in its most authoritative visual register is worse than any
backlog row.

## 5 — Axis labelling (`COWORK_CACHE/axis-label-worklist-s237.csv`)

94 widget types draw an SVG: **32 COORDINATE_PLANE, 22 SINGLE_AXIS, 40 NON_CARTESIAN.** Of the 32,
**28 name neither axis.** The earlier "66 of 70" figure over-reported — it counted fraction bars
and triangles that have no axes.

Two different defects, different fixes: `boxPlot`, `doubleNumberLine`, `dotPlot` and others draw
real tick values but name no axis (fix = the name); `argandExplore` names both axes but draws no
ticks (fix = the ticks).

**Needs a ruling, not a patch:** `unitCircleExplore`, `polarTrace`, `vectorExplore`,
`matrixTransform` — abstract planes where "what does x measure?" may have no honest answer.

## 6 — Absent diagrams (`COWORK_CACHE/absent-diagram-split-s237.csv`)

**My hypothesis was wrong and the worker said so.** I expected these to be the 1,078 withheld
illustrations surfacing. They are not: **zero** of the 105 match an `ILLUSTRATION_REPLACEMENT` row,
and none carries a `figure` key at all. Where a lesson appears in both lists, the withheld figure
sits on an earlier concept step and the flagged step is a later check that never had one.

Actual split: **100 DATA_INLINE** (answerable — the numbers are in the prompt), **4
NO_FIGURE_AUTHORED**, **1 false positive**.

That does not make it harmless. The reported case — *"The graphed point (4, 20) represents a car
trip"* — is DATA_INLINE, and it is still wrong: the lesson is **Reading a Story from a Graph**, and
a step whose entire skill is reading a graph should not be answerable without one. Answerable is
not the same as correct. The genuinely broken one is `dm-01-01/k1`.

## 7 — Items that need a manipulative (`COWORK_CACHE/needs-manipulative-s237.csv`) — CLOSED

32 steps whose prompt describes a manipulation and then asks the learner to imagine its result —
the reported `fr-01-04/k2` ("turn the bottom dial up: 1/3 becomes 1/9") among them, with
`fractionBar` already live **in the same lesson file**.

**Resolved in session D under the user's "add alongside" ruling, implemented as SEQUENCING** — a
new `kind:"interactive"` step carrying the manipulative immediately before the graded check, which
keeps sole ownership of mastery evidence (`playerStore.ts:148-153`). A companion-widget schema
field was rejected: `variantForStep` is single-surface by construction, so companions would be
permanently frozen. Every row now carries a `resolution` column:

| Outcome | Rows | Meaning |
|---|---:|---|
| **DONE** | 14 | A new interactive step landed. Gate: `src/lib/manipulativeAlongside.s237.test.ts` |
| **CLOSED served-by-i1/i2** | 2 | `g5u-01-05/k2`, `g5u-02-01/k3` — the lesson already carries TWO `fractionBar` interactives immediately before the check, and inserting a third would break session197's A-tier shape across all 14 lessons in that course. User ruling, session D |
| **ALREADY SERVED** | 3 | The lesson's existing interactive already IS the requested manipulative |
| **NOT POSSIBLE** | 8 | The proposed engine provably cannot draw what the check grades — each row names the exact schema constraint |
| **NO ENGINE** | 5 | The CSV's own `proposed_engine` is NONE |

So **19 of 32 rows have a manipulative adjacent to the check**, and the 13 that do not each carry a
verified reason rather than a silence. Nothing here is waiting on a decision.

The eight NOT POSSIBLE rows are the honest backlog: they are requests for engines that do not
exist (a general related-rates model rather than the ladder; a parametric-direction tracer; a
systems grapher that accepts vertical constraints; a `quadraticExplore` whose `a` is not an
integer). Building any of them is an engine project, not a content batch.

**Four must not be converted without a ruling**, because conversion changes what is graded:
`pv-03-03/k1` and `pv2-04-03/k3` grade *naming* what happens in a borrow, `columnCalc` would grade
*performing* it; `pc-03-01/k2` grades a definitional distinction; `cpr-05-03/k2` grades
spot-the-error. Swapping identification for execution is a curriculum change.

## 8 — Illustrations for visual-first learning

**Not started, and not measurable in the same way as the others.** The reported cases are
`steppedReveal` explanations carried entirely in prose ("cut a bar into 3 pieces… now into ZERO
pieces") where a picture would do the teaching. This is a design programme, not a defect sweep: it
needs a house position on when a stage earns a figure, and it overlaps the 1,078-row
`ILLUSTRATION_REPLACEMENT` backlog. Deserves its own work package.

The narrower request inside it is buildable now: on a `numeric` step asking for the numerator of
`? / 4`, show the learner's entry live as `12/4`. That is a widget affordance, not content.

## 9 — Grade-inappropriate wording (`COWORK_CACHE/grade-vocabulary-s237.csv`)

**60 learner-facing surfaces across 28 K–4 lessons** carry abstract meta-vocabulary:
`equivalence` (17), `the claim` (13), `verdict` (12), `repair`/`the repair` (9), `invariant` (4),
`reasoning` (3). 32 of the 60 are in *feedback* — which a struggling learner reads at exactly the
moment they are least able to parse it.

The reported item is one of these: *"Repair Rio's reasoning… What's the repair?"* in a grade-3
fractions lesson.

**I also ran a Flesch-Kincaid pass and am not handing over its output.** It flagged 655 prompts,
but its top hits are things like *"1 meter = how many centimeters?"* — short mathematical
sentences with polysyllabic units score as college-level and are perfectly clear to a fourth
grader. A 655-row worklist built on that would waste a reviewer's time and discredit the exercise.
The vocabulary signal is precise; the readability score is not, and saying so is more useful than
handing over a big number.

This is authored prose, so rewording is a content change requiring approval — but unlike #7 it
changes no grading, only the words a child reads.

---

## Recommended order

1. **#9 vocabulary (60 surfaces)** — highest harm per unit of effort, no grading impact, an exact
   list. Needs only a house glossary: what a K–4 learner is told instead of "verdict".
2. **#5 axis names (28 engines)** — mechanical for 24, a ruling for 4.
3. ~~**#7 manipulatives**~~ — CLOSED in session D: 14 landed, 5 already served, 13 impossible with reasons.
4. **#6 wording of the 100 DATA_INLINE steps** — do NOT reword to hide the missing picture; decide
   per lesson whether the skill requires the graph, and if it does, the figure is the fix.
5. **#8 illustration programme** — first slice shipped in session D (`numeric` live fraction preview, 111 steps, improper entries drawn as whole bars plus a remainder). The 1,078-row ILLUSTRATION_REPLACEMENT backlog is a SEPARATE and different problem: those figures are suppressed-at-render bulk misapplications on exposition steps with no learner input, so they cannot serve the visual-first goal.
