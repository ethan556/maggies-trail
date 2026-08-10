# S205N — content-change ledger

**No authored lesson content was changed.** Hash proof unchanged over all 1,701 lessons. This
session's output is an instrument and a closed hypothesis.

## The last systemic shortcut, tested and closed

After S205M refused the buildExpression rating upgrade, one systemic route remained: HS carries
**1,381 plain `numeric` steps**, and `exactNumberLab` DERIVES both its derivation stages and its
answer from `(task, values)` — verified directly (`polynomialEvaluate` on [1,0,1] at 3 yields the
stages "substitute" → `1·3^2 + 1` and "evaluate" → `10`, with no authored prose anywhere). So
converting a plain numeric step would invent NO content: prompt, answer, hints and feedback all
stay, and the engine supplies a manipulable derivation. Conversions also hold the denominator
fixed, so 47 of them — not 62 — would reach the target.

`scripts/measure/exactnumber-conversion-candidates.ts` tests that hypothesis with a hard gate: a
candidate is accepted only when the engine's DERIVED answer equals the step's FROZEN authored
answer.

**Result: 7 candidates across all of HS. Hand-adjudicated: 1 real, 6 numeric coincidences.**

| lesson | verdict |
| --- | --- |
| lf-02-01 | **TRUE** — literally substitute x = 1 into y = 5x + 3 |
| avp-01-03 | false — asks for the parameter h in \|x−h\|+1; the 6 coincides |
| ca-04-03 | false — reads a sign chart off f′; nothing is evaluated |
| dc-04-02 | false — an indeterminate-form limit x·ln x; the 0 coincides |
| fna-03-03 | false — applies a piecewise RULE to −7; the 7 coincides |
| lc-03-01 | false — one-sided limits agreeing at a junction; the 6 coincides |
| lc-05-02 | false — a DERIVATIVE f′(1), not an evaluation of f; the 2 coincides |

**The finding: HS's plain numeric steps are not mechanical computations.** They are conceptual
questions whose numeric answer is incidental — "what is h", "what does the sign chart say", "do the
one-sided limits agree". An engine that narrates arithmetic has nothing to narrate in them. The
1,381 is not a convertible pool, and the answer-gate's own false-positive rate (6/7) is the
evidence, not an opinion.

This also demonstrates why the gate alone can never be trusted to write: matching the frozen number
proves the parse landed, not that the task's derivation narrates what the lesson teaches. The
script says so in its header and proposes only; it never writes.

**lf-02-01/i3 is a genuine candidate** and is left for the next batch rather than written alone —
one step is 1/47 of the gap, and a lone conversion is not worth a content edit outside a batch with
its own adjudication pass.

## Where this leaves the target

**HS rich 23.7% · A 1182 · B 458 · C 60 · D 1.** Three systemic routes have now been tested and
closed with evidence: the steppedReveal wall (ceiling 9.2%), arrangement-engine rating upgrades
(breaks the rubric — dragBucket already drags and is rated 1), and plain-numeric conversion (1
real fit in all of HS). The remaining gap is content work: **47 conversions or 62 insertions**,
lesson by lesson, at the ~50% fit rate the adjudication log shows.
