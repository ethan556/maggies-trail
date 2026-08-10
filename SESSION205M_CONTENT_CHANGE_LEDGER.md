# S205M — content-change ledger

**No authored lesson content was changed.** Zero conversions, zero insertions, zero edits; the hash
proof over all 1,701 authored lessons is unchanged. This session's output is a refusal, an
arithmetic correction, and two guards.

## THE REFUSAL — buildExpression stays at manip 1

The brief was to close the HS rich mix. The obvious route was `buildExpression`: **144 HS steps**,
one uniform interaction (no answerMode split), already carrying live consequence via its `reads:`
readout. Adding token REORDERING would have moved the metric from 23.7% to roughly 27.7% in an
afternoon — past the target.

**It was refused, on the codebase's own evidence.** Every arrangement engine here is rated manip 1:
`dragBucket`, `buildExpression`, `matchPairs`, `dragOrder`. dragBucket is the decisive case — it
*already has* full drag-and-place and is *still* rated 1, because dragging a label into a box is
not manipulating a model. manip ≥ 2 is reserved for interactions where a mathematical MODEL
responds: a beam that tips, a curve whose derivative redraws, a candidate sliding against derived
landmarks. A better placement gesture is still placement.

Shipping it would have made dragBucket's 1 and buildExpression's 2 describe the same class of
interaction — which is how a capability table stops meaning anything, and is the exact
slider/balanceScale drift already on the known-issues list.

**Pinned so the temptation cannot be acted on quietly** (`engineCapabilities.test.ts`): arrangement
engines must stay ≤ 1. Failure-first proved — setting buildExpression to 2 fails the suite with the
reason stated; restore → 5/5. The test says in its own comment that a future session giving one of
these engines a real model should update it *deliberately, with evidence*, not delete it because it
went red.

## THE ARITHMETIC CORRECTION — 47 is the conversion figure; insertions cost 62

The published "47 more rich steps" assumes CONVERTING steps in place, leaving the denominator
fixed. Every insertion this campaign has actually made grows numerator AND denominator, so:

    0.75n >= 0.25*3625 - 860 = 46.25  =>  n >= 61.7  =>  62 insertions

`step-mix.mjs` now prints **both** figures, derived, on every run. Planning against the smaller
number would have under-budgeted the remaining work by a third.

## Census

**A 1182 · B 458 · C 60 · D 1.** HS rich **23.7%** — 47 by conversion, 62 by insertion.
