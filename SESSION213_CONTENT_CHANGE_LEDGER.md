# S213 — content-change ledger

**Exactly one authored lesson file changed.** Full content-tree diff against the S212 seal
returns `se-01-03.json` and nothing else. A second insertion was authored, independently
assessed, **REJECTED, and reverted byte-exactly** (below).

## LANDED — `content/courses/systems-equations/lessons/se-01-03.json`

"One, None, or Infinitely Many" — a lesson of 10 MCQ/matchPairs steps with **zero
manipulatives**. Step `i1`'s widget becomes an editable `systemsExplore` (`editLine1`,
`editLine2`, authored `degenerateSystemFeedback`) and gains the `predict` block its own body
promised. **First authored user of the S212 breakable-systems capability.**

- before `95c9af671e4d3fdab5ff6abb14c3bf2121bd692199b133d52c0d535f1ca437bc` (S212 seal)
- after `f9497d19e6969bd6c34d958944007cf80c25b90dffedb70896dd07c2c68d4cd1`
- Only `i1`'s `body`, `widget` and new `predict` changed. Step ids, order, `k1`'s variant block,
  indentation, unicode escaping and trailing newline verified unchanged.
- Authorization: `AUTHORIZED` map extended in its own format (path-keyed); count 809 → 810;
  manifest regenerated; **content-change proof 810/810, hash proof 1,701/1,701**.

**Mathematics, hand-verified twice by the author and re-verified independently by Fable-QA.**
Crossing (2, 3) by substitution and by elimination. Parallel gap = 4, constant (checked at two
x-values, never zero). Coincident reachable, and two distinct shared points confirm one line.
Parallel is reachable by moving **either** line, both inside the authored −3..3 range.

**The safety property, verified live in `evaluate.ts`:** `m1 === m2` is tested **before**
`on1 && on2`, so in the coincident state — with the learner's point genuinely on the shared line,
exactly where a naive grader hands out success for collapsing the system — the verdict is
**incorrect**. The widget's ✓ marks and the grader read the same four numbers in every reachable
state, so they cannot contradict each other.

**Fable-QA verdict: ACCEPT-WITH-FIXES.** Both fixes landed before seal: (1)
`degenerateSystemFeedback` had a clause that misfired in the coincident branch — it told a learner
who had just matched the starting values to "give them the same starting value as well". Rewritten
as conditionals so every clause is true in both degenerate states. (2) The promised `predict` block
was added, offering the two target misconceptions ("parallel lines cross off-screen somewhere",
"coincident means no solution") so they are refuted rather than merely pre-empted. Leak-checked:
the crossing appears nowhere pre-reveal.

## REJECTED AND REVERTED — `content/courses/two-step-equations/lessons/tse-01-01.json`

An algebraTiles **area-mode** step was authored (step `i1`, `−3(x + 2)` as a rectangle) and then
**rejected by the independent Fable-QA assessor**. The file is restored **byte-exactly** to its
S212 hash `86e8e98614c674d86abb13df38c862cc27d5b46491189d7814d8e70e7734128b` (taken from the seal
tarball after a re-serialization produced a different hash — the revert was verified, not assumed).

The rejection, which the implementor accepted:

1. **There is no rectangle.** The widget draws a fixed-size dashed box containing the literal
   string `(−3)(x + 2)` — no edges proportional to the factors, no partial-product cells;
   `views.mat.edges` is two strings. The authored prompt described geometry the learner never sees.
2. **The insertion removed a manipulation rather than adding one.** With the frame standing and
   sliders (correctly) refused, the step collapsed to a single click on "Open the rectangle", after
   which the engine computed the answer — which was already printed on the preceding concept card.
   The S212 treatment required the learner to *produce* −3 and −6.
3. A readout asserted `0x + 0` — to sighted learners and to screen readers — while the mat was
   worth −3x − 6.

**This is the program working as designed: a rejected interaction is removed, not retained to move
a metric.** Defect 3 was fixed in the engine and pinned. Area mode remains **model-proven but not
learner-ready**, and the precondition for any future area lesson is now recorded precisely: edges
drawn proportionally to the factors, real partial-product cells, and a start that requires the
learner to *produce* the partials rather than click once. **Factor mode is a display, not an
interaction** (its start already holds the answer; there is no x²-tile control) and no factor step
was authored.

## Metrics

HS rich mix 23.8% → 23.8% (862 → 863 rich steps of 3,626). **The headline metric this session is
not that number**: it is one lesson gaining its **first causal interaction** — and one candidate
correctly refused. Causal Concept Coverage +1 lesson; refusals: 1 insertion rejected post-hoc,
26 candidates refused at adjudication, 1 authoring refused pre-emptively on REACH.

`scripts/engine-capabilities.json` unchanged — Fable-QA explicitly recommended **no rating
change**: editable lines add parameters, not a new class of response, and `algebraTiles` must not
be lifted on the strength of a dashed box containing a string.
