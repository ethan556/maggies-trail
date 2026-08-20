# S316 Lane B — Independent Assessment: `measure-money-time`

Course: Grade 2: Measurement, Money & Time — 5 chapters, 15 lessons.
Reviewer: Claude Cowork independent assessor (measure-money-time S316), read-only.
Method: read `content/courses/measure-money-time/course.json` and all 15 lesson JSON files in
full; independently recomputed every drawn numeric answer (ruler subtraction, coin totals and
reverse-division, clock skip-counting, graph reads and comparisons); cross-checked every
`hints`/`explanationVariants` block on every `check`/`challenge` step against the exact widget
it accompanies (not just against the general lesson topic); traced every referenced widget type
(`unitRuler`, `numberLineHop`, `estimateSlider`, `lengthCompare`, `moneyBoard`, `clockSet`,
`elapsedTime`, `graphRead`) into `src/components/widgets.tsx` to confirm each is a real,
registered, data-synced interactive component and not decorative prose; checked the `plotData`
schema field (`src/lib/schema.ts`) and its use in sibling grade-2 course
`data-line-plots-g2` to establish what a correctly-wired line-plot check step looks like.

## Course-level summary

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 11 | mmt-01-01, mmt-01-02, mmt-01-03, mmt-02-02, mmt-02-03, mmt-03-01, mmt-03-02, mmt-03-03, mmt-04-01, mmt-04-02, mmt-05-01 |
| REVISE | 4 | mmt-02-01, mmt-04-03, mmt-05-02, mmt-05-03 |
| ESCALATE | 0 | — |

Mathematical correctness of every *drawn numeric answer* (the value the evaluator actually
scores): **no defects found in any of the 15 lessons.** Every ruler subtraction, coin total,
reverse coin-count division, clock skip-count, and graph-value read was independently
recomputed and matches the authored `answer`/`answerCents`/`targetMinute`/`answerId` exactly.

The defects found are all in the **reasoning-before-reveal support text** (`hints` and
`explanationVariants`) attached to `challenge` steps, plus one **missing promised visual**
in the graphs chapter — never in the scored answer itself.

## Defect class 1: hints/explanationVariants describing a different problem than the one drawn

Three `ch1` challenge steps carry `hints` and/or `explanationVariants` that do not describe the
widget the learner is actually looking at — they appear to be leftover text from an earlier
draft of the item that was not updated when the final widget data was set. This is exactly the
"reasoning before reveal must be literally true of the drawn problem" failure mode: a learner who
reads the hint before answering is coached toward a number that has nothing to do with (in one
case, is the *wrong* option for) the problem on screen.

I checked every other `ch1`/challenge step's hints against its widget across all 15 lessons
(12 of 15 pass cleanly) to confirm this is a spot defect, not a systemic pattern across the whole
course — but it recurs three times, so it should be treated as a named checklist item for
whoever authored or last touched these three challenge steps.

### mmt-02-01 (Estimating Before You Measure) — REVISE

`ch1` is a `matchPairs` widget: book (actual 9in → best estimate 10in), key (actual 4in → 5in),
marker (actual 12in → 13in). Its `hints` read:
> "The actual length is about 8 inches. Look for the choice closest to 8. 9 is only 1 inch away —
> that's the best estimate."

No object in this widget has an actual length of 8, and no correct answer is 9. This block
describes a single-object estimate problem that does not exist in this step.

**Implementation contract:** replace the three `hints` strings with ones that walk the actual
3-item match (e.g. "Each estimate should be close to its real object." → "The book is 9 inches;
which listed number is closest?" → "10 is 1 inch from 9, the closest match — do the same for the
key and marker."). No widget, prompt, answer, or feedback field needs to change.

### mmt-04-03 (Practicing Five-Minute Times) — REVISE

`ch1` is an `mcq`: minute hand at 8, hour hand just past 2 → correct answer **2:40**
(8 × 5 = 40). Its `hints` and `explanationVariants` read:
> "Check the minute hand first: it's at 9, not 12... Skip-count: 9 × 5 = 45 minutes... the hour
> hand has passed 9, so the time is 9:45." / "Hour 9, minute hand at 9 (45 minutes): 9:45."

Every number in this reasoning block (9, 9, 45, 9:45) is wrong for this widget, which uses 8,
2, 40, and 2:40 throughout its actual `options`/`feedback`.

**Implementation contract:** rewrite `hints` and `explanationVariants` to reference the drawn
values: minute hand at 8 → 8×5=40, hour hand just past 2 → 2:40. No widget, option, or feedback
field needs to change.

### mmt-05-02 (Reading a Bar Graph) — REVISE, most severe of the three

`ch1` is an `mcq`: blue bar reaches 11, green bar reaches 6, "how many more does the blue bar
show?" → correct answer **5** (11 − 6 = 5), with an explicit wrong option "11" whose own feedback
says *"11 is the blue bar's total, not how many more it shows."* Yet the step's `hints` say:
> "Each gridline is worth exactly 1. So the height number is the value. The bar reaches 11, so
> the answer is 11."

and `explanationVariants` say "Read the gridline directly: 11." Both reasoning-support fields
actively walk the learner toward the labeled-wrong distractor, directly contradicting the
option the evaluator scores as correct. This is the one case in the batch where the hint doesn't
just describe an unrelated problem — it argues for the wrong answer to *this* problem.

**Implementation contract:** rewrite `hints` and `explanationVariants` to describe the
comparison task correctly, e.g. "Each gridline is worth 1, so each bar's height is its value: 11
and 6." → "'How many more' asks for the gap between them, not either height alone." →
"11 − 6 = 5, so the blue bar shows 5 more." No widget, option, or feedback field needs to change.

## Defect class 2: missing promised visual (P0 — matches the flagged ILLUSTRATION_REPLACEMENT class)

### mmt-05-03 (Reading a Line Plot and Comparing Data) — REVISE, visualDecision REQUIRED

`c1`'s generic `md3-lineplot` figure is a fine concept-level illustration of what a line plot
looks like in general. But four steps narrate a *specific* line plot in prose with no rendered
image at all:

- `i1` — "A line plot shows 3 x's above the number 5."
- `k1` — "A line plot shows 6 x's above the number 8."
- `i3` — "A line plot shows 2 x's above the number 3."
- `k3` — "A line plot shows 10 x's above the number 6."

Each of these is a bare `numeric` widget: a text field asking for a count, with no `figure` and
no `plotData` attached — the learner has to take the prompt's word for how many X's are stacked
where; nothing is actually drawn. The `plotData` schema field exists precisely for this
("display-only `plotData` block", `src/lib/schema.ts`) and is already used correctly by sibling
grade-2 content (`content/courses/data-line-plots-g2/lessons/*.json`, e.g. `g2g-01-03.json`'s
`k3` step attaches `"plotData": {"values":[4,5],"counts":[2,1]}` to a `mcq` widget). This is the
identical missing-promised-visual defect class already found and fixed elsewhere in this
session (`measurement-data`'s `md-03-02`/`md-03-03` missing bar-graph visuals) — structural and
correctable, not a one-line data omission, but not a new feature either since the schema support
already exists in this codebase.

**Implementation contract:** attach a `plotData: {values: [...], counts: [...]}` block to `i1`,
`k1`, `i3`, and `k3`'s `numeric` widgets, using each step's own already-stated values/counts
(`{values:[5],counts:[3]}`, `{values:[8],counts:[6]}`, `{values:[3],counts:[2]}`,
`{values:[6],counts:[10]}` respectively — note `k3`'s stack of 10 should be checked against
`MAX_PLOT_STACK` in `plotDataIntegrityErrors`; if it exceeds the renderable ceiling, split it into
two nearby values that still sum correctly, or reduce to a value under the ceiling and update the
prompt/answer together, never independently). `k2` and `ch1` in this lesson are graph-*comparison*
items with no specific line-plot picture claimed in prose (they compare stated vote totals) and
need no change.

## Findings recorded for a human, not corrected (per instructions)

- **mmt-01-01, `i3` `successFeedback`:** typo "the object is 7 inchs long" (should be "inches").
- **conceptTag/remedial-routing mismatches** (content is correct as shown to the learner, but the
  concept tag used for mastery tracking and remedial selection doesn't match the step's actual
  instructional job): `mmt-01-01` `i3` is tagged `mmt-best-unit` but drills ruler-subtraction, not
  unit choice; `mmt-03-01` `i2`/`i3` are tagged `mmt-coin-name` but drill coin-value addition
  (`mmt-coin-total`'s job). If a learner is routed to a remedial after missing one of these, the
  remedial may not match what they actually got wrong.
- **Teaser-text inaccuracies** (flavor-text `recap.teaser`, not assessed content): `mmt-01-01`'s
  teaser jumps ahead to "estimating a length" instead of describing the actual next lesson
  (`mmt-01-02`, shifted-start subtraction); `mmt-01-02`'s teaser says "next chapter" when one more
  chapter-1 lesson (`mmt-01-03`) still intervenes; `mmt-03-02`'s teaser promises "comparing
  amounts and writing dollars and cents" next, but the actual next lesson (`mmt-03-03`) is reverse
  coin-count division.

## Visual and grade-language notes

Visuals: 14 of 15 lessons carry real, schema-registered, data-synced interactive widgets for
every step that claims a specific manipulable quantity (`unitRuler`/`numberLineHop` for rulers,
`moneyBoard` for coins, `clockSet`/`elapsedTime` for clocks, `graphRead`/`lengthCompare` for
picture and bar graphs) — all confirmed present and wired in `src/components/widgets.tsx`. The
one exception is `mmt-05-03`'s line-plot check steps, detailed above.

Grade language: all 15 lessons FIT for Grade 2 — short sentences, concrete objects (pencil,
crayon, hallway, playground, dime, quarter), consistent read-aloud-friendly phrasing, no
weakening of the underlying arithmetic.

Choice-surface integrity: no leaked answers found; mcq/predict/matchPairs option ordering is
handled by the platform's seeded shuffle (authored "correct option listed first" is not a
position-bias defect, per the known-context note); distractor feedback throughout names the
specific misconception with the actual drawn numbers (e.g. "That's 9 + 3, not 9 − 3", "Each
gridline is worth 1, not 2 — don't double the count").
