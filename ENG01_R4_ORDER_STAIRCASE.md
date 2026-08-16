# ENG-01 R4 — WHEN THE PICTURE SORTS THE LIST FOR YOU

**Evidence:** `reports/eng/ENG01_R4_ORDER_STAIRCASE.csv`, from `scripts/audit/order-staircase.mts`
**Gates:** `widgets.liveConsequence.s48.test.tsx` (corrected), `widgets.buildReadout.s242.test.tsx`
**Date:** 2026-08-16

R4 was the last untouched class in `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md`: *"the model performs the
task — the widget computes and displays the very quantity being compared or ordered, so arranging it
'to look right' substitutes for the reasoning."* Two engines, 189 instances.

## `dragOrder` — the staircase is the answer

`DragOrderW` (`widgets.tsx:15176`) checks whether every item label parses as a number and, if so,
plots the learner's current arrangement on a shared vertical axis — value against position, joined
by a polyline. The comment calls it *"Live consequence (s48)"*.

For an ordering task whose criterion **is** the plotted value, that consequence is the answer.

The assessment counted the all-numeric instances and stopped. Being numeric is not the same as being
ordered *by* the number, and the difference is two different defects — so this audit measures both:

| verdict | meaning | count | graded | interactive |
|---|---|---:|---:|---:|
| `oracle` | `correctOrder` is monotone in the plotted value — the staircase IS the answer | **54** | 12 | 42 |
| `misleading` | labels parse as numbers but the correct order is not monotone in them: the plot draws a **zigzag for the right answer** | **0** | 0 | 0 |
| `text` | labels not all numeric, so the chain readout renders instead | 38 | 8 | 30 |

**Every all-numeric `dragOrder` in the corpus is an oracle.** The second hypothesis — that some plot
actively misleads — is an honest zero: the plot never contradicts the authored answer.

`parseOrderVal` reads fractions as well as integers and decimals, which puts the sharpest cases
squarely in the leak:

- `ns-05-03#ch1` (challenge) — *"Arrange from SMALLEST to largest: −1.5, 1/4, −3, 0, 2."* Mixed
  negatives, a fraction and a decimal: the comparison is the entire skill, and the widget plots them
  on a common axis.
- `dg4-03-04#k2` (check) — *"Drag the decimals into order from smallest to greatest"*: 0.09, 0.35,
  0.4, 0.5. This item exists to catch **"0.09 > 0.4, because 9 > 4"**. The plot silently corrects
  that misconception before the learner can hold it.

### The repair

The plot moves behind `tone === "info"`.

This is the platform's own convention rather than a new one: the `do-ghost` position reveal twenty
lines below it in the same component has always been gated this way, and 154 sites in `widgets.tsx`
do the same. It is also the same fix ENG-01 R1 took for the staged-reveal labs.

**The s48 idea survives intact, and arguably improves.** During active work the non-numeric branch's
chain readout renders for everyone — *"Your order: 0.09 → 0.35 → 0.4 → 0.5"* — which reads the claim
**back** without sorting it: what the learner said, not whether it was right. After the verdict the
staircase is exactly the explanation they need, and a zigzag is the clearest possible picture of what
went wrong.

**A gate had pinned the defect.** `widgets.liveConsequence.s48.test.tsx` mounted with no tone — i.e.
during active work — and *required* the plot to be present. Corrected, not relaxed: the re-plot
requirement stays, moves behind the gate, and a prohibition on the pre-verdict plot is added
alongside it.

## `estimateSlider` — not a defect

The assessment's second R4 engine flags the discrete mode for drawing the true value on its ruler as
`actual {spec.target}`. Reading all three authored instances closes it:

> *"A book is about 9 inches long. Which is the best estimate?"* — choices `8 inches`, `20 inches`,
> `1 inch`.

**The prompt states the target.** The ruler repeats what the learner has already been told; the task
is choosing the nearest listed estimate to a stated measurement, which is what the item asks. All
three are `interactive`, so nothing graded is involved either. No change.

## The sibling engines, checked rather than assumed

s48 gave live readouts to four engines. `dragBucket` renders where you dropped an item and
`matchPairs` renders the link you drew — both read the claim back without judging it. The one that
could judge is `buildExpression`: `readExpression` evaluates the built sequence and prints, in
leaf-green or berry-red, `— both sides equal` / `— the sides differ` whenever the build holds a
single `=` with two numerically-evaluable sides. On a "build a true equation" step that verdict is
the grading, announced before Check.

Rather than reason about `readExpression`'s reach from its source, `widgets.buildReadout.s242.test.tsx`
**renders all 232 authored specs with their own correct sequence already placed** — the most
favourable state for a leak — and reads what a learner would see.

**0 of 232.** Twelve steps do build an equation, and every one is algebraic (`x² + y² = 4`,
`y − 5 = 3(x − 2)`, `t ÷ 4 = 5`) or carries units (`4 × 6 tens = 24 tens`), so `readExpression`
returns `balance: null`. The engine is clean **by content, not by construction** — which is why the
measurement is left in place as a gate rather than written down as a note.

## The ENG-01 ledger, closed

| Class | Finding | Status |
|---|---|---|
| R1 | Answer shown — staged-reveal labs, 13 engines | Gated on `tone === "info"` |
| R2 | Correctness signalled — `LabReadout` and siblings | Rewritten with a staged, spoken mark |
| R3 | Convergence channel | Measured: 0 fishable to certainty; `dragBucket`'s running score removed, graded win rate 0.518 → 0.225 |
| R4 | The model performs the task | **`dragOrder` gated; `estimateSlider` ruled out by reading; `buildExpression` measured clean and pinned** |
