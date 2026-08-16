# CLOSING §8 ITEM 5 — THE CONTRACTS, CHECKED OVER THE GENERATED CORPUS

**Gate:** `src/components/widgets.generatedContracts.s242.test.tsx` · **Date:** 2026-08-16

## The gap

`ACC01_ACCESSIBILITY_MATRIX.md` §8 lists what a source-only audit could not settle. Item 5 is the
one this session could actually close:

> **Runtime-generated widget specs are outside the denominator.** All counts are of **authored**
> specs. 5,897 `variant` declarations regenerate specs at runtime; a generator emitting a different
> `tone` condition would change §5(f)'s reach invisibly to a corpus grep. **Settling that needs the
> generators run.**

Every number in ENG-01 and ACC-01 — *"13 engines, 1,006 instances"*, *"678 authored instances, 176
graded"* — counts authored specs. The generated corpus is larger, it is almost entirely **graded**
(5,835 of 5,897 declarations sit on `check` or `challenge`), and it reaches precisely the engines
this session repaired:

```
exactNumberLab 338 · buildExpression 204 · tapDiagram 59 · dragOrder 41
affineRelationshipLab 39 · geometricConstraintLab 38 · dragBucket 37
placeValueTransformLab 29 · proportionalReasoningLab 27 · quotientReasoningLab 23
```

`widgets.generatedRender.s241.test.tsx` already renders this corpus — but for *render health*:
parse, no throw, no SVG collision. It says nothing about whether a generated widget hands the
learner the answer.

## Result: the contracts hold, and the gate now says so every run

~3,000 generated cells (every generator × every form × three bands, two distinct specs each,
including the `default` branch both audits used to skip).

| contract | result |
|---|---|
| **R1** — an answer-revealing stage is withheld until the verdict, and arrives with it | **holds** |
| **§5(f)** — `trialProbabilityLab`'s claim marker stays neutral until the verdict | **holds** |
| **AN** — every generated widget renders something perceivable | **holds** |

The R1 pass is not vacuous: the sweep finds answer-revealing stages and the gate asserts it found
them, because a strict filter that matches nothing is a green light for nothing.

## The measurement took five narrowings, and that is the story

Every version of this detector was wrong in the same way — **a number equal to the answer is not
the answer** — and each fix exposed the next.

1. **`textContent` mashes siblings.** `10` beside `-8` reads as `10-8`, so a search for `3` matched
   digits never adjacent on screen. **306 hits, all artefacts.** Walking text nodes and joining with
   separators fixed it.
2. **The lookbehind ignored minus signs.** A search for the answer `2` matched inside the exponent
   `-2` — and `power-ten-exponent`, whose entire subject is negative exponents, reported a leak on
   every draw.
3. **Digits the question itself must show.** `ladder-shift|mulTwice` breaks the *source* 0.04 into
   place-value digits `0 0 4` beside an answer of 4; `remainder-word` numbers its panels "Stage 1",
   "Stage 2" beside an answer of 2; `g6-center-spread` must display the data set containing its own
   answer. **359 hits, all legitimate.** No tightening fixes this — the two are the same string — so
   the digit search was abandoned for the engine's own truth function.
4. **`includes` on the spec.** `"25 = 25 × 1".includes("5")` is true, so `a1-radicals`' factor stage
   read as a leak of the answer 5.
5. **Containment instead of identity.** ENG-01 §3.1's defect is exact — `value: fmt(rounded)` where
   `rounded` *is* `answerNumber`. A stage reading `24 ÷ 3 = 8` on an item answering 3 is a given
   intermediate step that happens to use the answer as an operand. **268 hits.**

**Three were probed rather than argued about**, and all three render correctly:

```
a1-radicals   "Simplify sqrt(125) = a · sqrt(5). Find a."   answer 5
              stage radical:factor  → 125 = 25 × 5     rendered: "Open — this is the step to work out yourself."
              stage radical:extract → sqrt(125) = 5√5   rendered: "Open — this is the step to work out yourself."
```

The final form is **differential**: reveal the verdict and require the stage's value to appear *more
often* than it did during work. The prompt's own copy of the answer appears in both renders and
cancels. It is simultaneously the leak check (equal counts ⇒ it was already showing) and the
paired-acceptance check (no increase ⇒ the gate has become a deletion and the explanation never
arrives).

## One assertion withdrawn, with its reason

A first cut also required that no generated spec paint `PALETTE.leaf` on an untouched widget. It
flagged 21 cells, all `trialProbabilityLab`, and reading them showed the detector was wrong:
`widgets.tsx:2038-2039` draws the **observed data** in leaf — a dashed line labelled
`evidence {favourable}` — unconditionally. That is a reference marker, not a claim about the
learner, and forbidding it would forbid the counter-examples §5(f) itself holds up as correct.
Correctness cues are *conditional*; the surviving assertion is keyed on the specific mark that
carries the verdict, not on the colour.

## Scope, stated

R1 is checked on **`exactNumberLab` only** — 338 of the 494 staged-reveal declarations, and the
engine ENG-01 called the worst (358 authored instances, 345 graded). Its six siblings
(`proportionalReasoningLab`, `placeValueTransformLab`, `pointSetReasoningLab`,
`geometricConstraintLab`, `affineRelationshipLab`, `quotientReasoningLab`) export the same shape of
truth function and are the obvious next step.

§8's remaining items still need what this session does not have: a screen reader, a browser
rendering at 320px and 200% zoom, and a keyboard walk.
