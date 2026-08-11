# Absent diagrams — corrected inventory

**The 105-step figure was inflated by my own detector, and the corrected split changes what should
be done.** Row-level detail in `absent-diagram-corrected-s237.csv`.

| Bucket | Rows | What it actually is |
|---|---:|---|
| **FIGURE_IS_THE_SKILL** | **45** | Real, and the most serious thing here |
| FALSE_POSITIVE_ABSTRACT_REFERENCE | 44 | Not defects — my regex misfiring |
| WORDING_DEFECT | 11 | Real, small, wording-level |
| NO_FIGURE_AUTHORED | 4 | 3 are legitimate recap back-references; 1 is broken |
| FIGURE_PRESENT_FALSE_POSITIVE | 1 | The engine draws its own graph |

---

## The 44 that are not defects

My detector matched any prompt containing "the graph", "the image", "the figure". But those are
ordinary mathematical English, not promises of a picture:

- *"On the graph of y = x² − 4, what is y when x = 3?"* — **the graph of** an equation is a
  mathematical object. Nothing is missing from the screen.
- *"What is the image of (3, 7) reflected over the x-axis?"* — **image** is the geometric term for
  the transformed point. There is no picture in the sentence at all.

25 of these are "the graph of", 13 are "the image of". Acting on the raw 105 would have meant
rewriting ~44 mathematically correct prompts into worse English. This is the same shape as the
Flesch-Kincaid pass I discarded earlier in the session: a detector that fires on a keyword rather
than on the property, and the honest move is to say so and shrink the list.

## The 45 that matter — the picture IS the lesson

Every one is a lesson whose stated skill is reading a figure, asked through a **static answer
surface with no figure rendered**. Widgets: 26 `numeric`, 12 `mcq`, 3 `fractionEntry`, and one each
of `exactNumberLab`, `buildExpression`, `matchPairs`, `dragBucket`. Not one draws a graph.

Concentrated in whole lessons, which is why it reads as systemic rather than incidental:

| Lesson | Course | Rows |
|---|---|---:|
| *Reading a Story from a Graph* (`pr-03-03`) | proportional-relationships | 5 |
| *Reading a Picture Graph* (`mmt-05-01`) | measure-money-time | 4 |
| *Using Line Plot Data* (`vm-02-02`) | volume-measurement | 4 |
| *Building a Picture Graph* (`g2g-02-01`) | data-line-plots-g2 | 3 |
| *Reading Exponential Graphs* (`exp-04-01`) | exponential-functions | 3 |
| *Graphing Inequalities* (`ee-05-02`) | expressions-equations | 3 |
| *Proofs for Every Figure* (`cx-03-03`) | coordinate-proofs | 2 |

`pr-03-03` is the reported case. A learner asked to read a story *from a graph*, with no graph.

**Rewording these would be the wrong fix and I have not touched them.** "The graphed point (4, 20)"
is answerable from the numbers, so the prompt could be made accurate by deleting the word
"graphed" — and the lesson would then teach nothing it claims to. The fix is the figure. This is
an authoring/engine batch, one lesson at a time, and it should be leased that way: several of
these courses already have a suitable engine (`dotPlot`, `boxPlot`, `scatterFit`,
`pointSetReasoningLab`) used elsewhere in the same course.

## The 11 real wording defects

Small and genuinely wrong — the prompt names a picture that is not there and the data is inline:

- `pr-03-02` i2/i3/k3/ch1 — "The **graphed** point (1, 6) …" ×4
- `g5f-02-02/k2`, `g5f-02-03/k1`, `g5f-02-03/ch1` — "To model 3 ÷ 1/4, what does **the picture**
  show?" ×3
- `dd-02-03/k1`, `dd-02-03/k2` — "**The plot of** 1,2,2,3,3,3,4,4,5 peaks at 3 …" ×2
- `mult-01-04/k1` — "A number line shows a rabbit making 4 hops of 5 …"
- `sg-03-02/i2` — "**The figure shows** the cone inside its matching cylinder …"

These divide again, and the division decides the fix: `pr-03-02` and `g5f-02-*` describe a picture
that would genuinely help (a plotted point; a division model), so they belong with the 45. The
`dd-02-03` and `mult-01-04` prompts already carry the full dataset in words and only the noun is
wrong — those are safe one-word edits.

**Not applied.** Even the safe ones are authored prose in graded steps, and after the K–4
vocabulary pass I would rather these went in as a reviewed batch than as a tail-end edit.

## The 4 "no figure authored"

Three (`ft-02-02/r1`, `mmt-05-01/r1`, `vm-02-02/r1`) are `kind=recap` body text referring back to a
figure seen earlier in the same lesson — legitimate, not defects. **One is genuinely broken:**
`dm-01-01/k1`, where the widget's answer (3) exists only in `explanationVariants` and nothing on
screen supplies it.

## Recommended order

1. `dm-01-01/k1` — one genuinely unanswerable item.
2. The 45, leased per lesson, starting with `pr-03-03` (reported) and the four picture-graph
   lessons, reusing engines already present in the same course.
3. The 4 safe wording edits (`dd-02-03`, `mult-01-04`) as a reviewed batch.
4. Nothing at all for the 44.

---

# Progress — first batch

**Done:**

- **`dm-01-01/k1`, the one genuinely unanswerable item.** It asked "On this plot, how many
  students scored an 8?" through a bare `numeric` widget, with the plot living on the previous
  step. The answer existed only in `explanationVariants`. `dotPlot` already has a READ mode
  (`given` + `askIndex`) built for exactly this — 8 authored instances use it, `vm-02-01` twice in
  the same shape — so the step now renders the dataset it asks about and the learner counts the
  stack. Verified by rendering: the plot draws X's above 2/6/7/8/9 and the description reads *"A
  line plot with 1 X above 2 … 3 X above 8 … The question asks about the stack above 8; no X is
  counted yet."* A semantic diff proves nothing but that one widget changed.

- **The 4 safe wording edits** (`dd-02-03` ×2, `mult-01-04`, `sg-03-02`), plus 3 residual
  references the edits exposed in adjacent feedback — "count the jumps in the picture again" and
  two copies of "the figure's cone-in-cylinder" — found by re-scanning the same lessons rather
  than assuming the prompt was the only place the phrasing lived.

**`pr-03-03` is NOT done, and the reason is a finding.** The lesson's five numeric steps say
"The graphed point (4, 20) represents a car trip. What is the rate?" — coordinates in the prompt,
no graph. Attaching a graph while keeping the numeric grading is clearly the right fix, and it
cannot be done with what exists:

- `figure` takes a static registry name, so it cannot show *(4, 20)* on one step and *(2, 18)* on
  the next.
- `plotPoint` — already used at `i2`/`k3` in this same lesson — draws the plane but grades
  *plotting*, not a typed rate. Swapping it in changes what the item measures.
- `pointSetReasoningLab` draws a point set and accepts a numeric answer, but its task enum has no
  unit-rate derivation: `axisMeaning`, `axisDistance`, `pointRead`, `sequenceExtend`, `pathLength`,
  `pointMeaning`, `rangeEndpoints`, `rangeValue`, `rangeBlindness`, `rangeUpdate`.

**No engine draws a point on a plane and grades a typed rate.** So this needs one of:

1. a `unitRate` task on `pointSetReasoningLab` (smallest change; the diagram, the numeric answer
   mode and the stage machinery all already exist), or
2. a per-step parameterised figure, which the `figure` field does not currently support.

Option 1 is the recommendation, and it would serve most of the other 44 rows too — they are almost
all "read a value or a rate off a plotted relationship". That makes it one engine extension rather
than 45 bespoke fixes, which is the same family-level leverage the rest of this queue has.
