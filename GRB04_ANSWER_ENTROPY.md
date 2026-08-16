# GRB-04 — A POOL OF TWENTY PROBLEMS WITH ONE ANSWER IS NOT TWENTY PROBLEMS

**Evidence:** `reports/generator-audit/GENERATOR_ANSWER_ENTROPY.csv`, from
`scripts/audit/answer-entropy.mts` · **Gate:** `src/lib/variants.tapSide.s242.test.ts`
**Date:** 2026-08-16

## Why a second audit

`GENERATOR_ANTI_REPEAT_AUDIT` measures freshness by counting distinct **widgets**. A pair that
emits twenty different prompts is `clean` and never looked at again. That is the wrong denominator
for a mastery claim:

```
"Exterior angles of a 9-gon (one at each vertex): what do they sum to?"   → 360
"Exterior angles of a 20-gon (one at each vertex): what do they sum to?"  → 360
```

Ten prompts, one fact. A learner who types 360 once types it forever, and the freshness audit calls
the pool ten wide. This audit asks the question that one does not: **how many distinct ANSWERS does
a pair reach?**

## Two measurement bugs, fixed before any number was believed

**The first cut reported 625 constant pairs and most of them were wrong.** Ordering and building
engines express their answer as ids, and the generators assign those ids *by rank* — so
`sequence-order|byFives` answers `["o0","o1","o2","o3","o4"]` on every draw while the labels behind
them go `5 10 15 20 25`, then `40 45 50 55 60`. The answer looked frozen; the problem was completely
fresh. Resolving every id to the label the learner actually sees took the count to **506**.

**Then both audits turned out to have been blind to the same 420 pairs.** Each walked
`generator.forms ?? ["default"]` — so a generator that declares *any* form never had its `default`
branch measured. **370 authored steps across 260 generators declare a `gen` with no `form`.** Both
now probe `default` unconditionally:

| | before | after |
|---|---:|---:|
| Anti-repeat: pairs exercised | 2,664 | **3,084** |
| Anti-repeat: `exhausted` | 250 | **293** |
| Anti-repeat: `leaking` | 0 | **0** |
| Entropy: pairs exercised | 2,667 | **3,088** |
| Entropy: `constant` | 506 | **561** |

43 exhausted and 55 constant-answer branches had never been measured by anything.

## Result

**3,088 pairs · constant 561 · low-entropy 834 · rich 1,693.**

`constant` is not a defect count and this document does not report it as one. Reading the list
separates four populations:

**1. Correct by design — the invariance IS the lesson.** `identity-zero|timesZero` ("What is
813 × 0?" → 0) varies the number and keeps the answer, which is exactly the rule being taught.
`nl-beyond-one|whereWhole` ("Where does 4/4 land?" → *Exactly on 1*) likewise. CLAUDE.md rule 7's
territory, correctly occupied.

**2. Single-fact concept tables.** The `matchPairs` and `dragOrder` constants in the calculus and
statistics bands — *"Match each part of ∫ₐᵇ f(x) dx to what it was, back when it was rectangles"* —
have one correct matching and always will. Rule 7 again.

**3. Fixed-sentence recognition (379 mcq, the bulk).** The stem's numbers move; the correct option
sentence never does. `g6-center-spread|ddMeanMeaning` draws fresh data 24 times and the answer is
*"The fair-share value if the total were divided equally"* every time. Option order is
seeded-shuffled, so there is no positional exploit — but a learner who has met the item once
recognises the sentence rather than re-deriving it. **This is the real open population, and the fix
is authoring**, not a generator dimension: it is the same taxonomy work GEN-03 specified.

**4. Positional bias — a mechanical defect, and this wave's repair.**

## The positional-bias class

`tapDiagram` is the one engine whose display order *is* the authored order: hotspots lay out by
array index (`g0` at 25% of the canvas, `g1` at 75%) and nothing shuffles them, because the
positions are the picture. Every other choice engine seeded-shuffles for exactly this reason —
`mcq` (`widgets.tsx:385`), `matchPairs` (`15377`), `dragBucket` (`15277`).

So a generator that builds `[bigger, smaller]` puts the correct tap on the left forever.

| pair | prompts | answer, every draw |
|---|---:|---|
| `compare-groups\|more` | 21 | `["g0"]` |
| `compare-groups\|pairUp` | 24 | `["g0"]` |
| `compare-numerals\|greater` | 17 | `["g0"]` |
| `compare-same-denom\|default` | 24 | `"right"` |
| `compare-same-num\|default` | 24 | `"left"` |
| `compare-same-num\|pizzaSlices` | 20 | `"left"` |

These are K–3 comparison items — the whole point of which is to compare. A pre-reader taps the same
picture every time and is graded correct every time. Nothing could see it: the freshness audit
counts distinct widgets and the prompts really are all different; the pedagogy lint reads authored
prose and this is generated.

Repaired by rotating the hotspot array (`varyPosition`) and by swapping which bar holds the winner.
A rotation moves the id *and* the x-position together, so every count, name and diagnosis stays
attached to its own group, and the distractors keep their authored reading order. The three-group
siblings (`mostOfThree`, `greatestOfThree`) never had the bug — they place the winner by
`counts.indexOf(most)`, which already varies.

**The gate written from the finding immediately found a seventh case neither audit could reach:**
`shape-identify|default`, which appended its target after three distractors, so the rightmost of
four pictures was always right. It lives in a `default` branch — the blind spot above, caught by the
gate rather than by the audit that motivated it.

## What reading caught that the gate could not

Per CLAUDE.md step 5, the output was printed and read. Two things only that found:

- **`pizzaSlices` announced the wrong winner.** A first pass tied the winner's name to the swap:
  *"Jo takes 2 slices of the one cut into 11; Kai takes 2 slices of the one cut into 3"* graded for
  Kai and then said **"Jo wins"**. `A` always holds the small denominator, so `A` always wins
  whichever side the bars land on. Verified over 300 draws: 0 mismatches.
- **`"a 11-way cut"`.** The article was derived rather than stored — the same class as `"1 units
  up"` and `"a sphere has round all over"` in the ledger. `article()` stores the exception set.

## Still open

`polygon-angles|exteriorSum` is recorded as a **permanent rejection**: ten polygons, answer always
360°, and no dimension can make a constant-answer item fresh without changing what the authored step
asks. The invariance is the theorem.

The 379 fixed-sentence mcq forms are the largest genuinely-open population this audit has surfaced,
and they are GEN-03's misconception-taxonomy work rather than GRB-04's.
