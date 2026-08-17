# THREE NUMBERS I ASSERTED INSTEAD OF MEASURING

**Date:** 2026-08-17 · **Prompted by:** the owner pushing back on a "not closed, and why" list.

I closed six register items this session by measuring their counts and finding them wrong. Then I
declared three more unclosable **without measuring them**, which is the same failure I had spent the
session correcting in other people's numbers. Measured now.

---

## 1. The asterisk detector — I said "left undone". It took twenty minutes.

I had reported: *"the rule runs on the residue after math islands are removed, and removing an island
breaks the emphasis pairing the repair depends on."* That diagnosis was **wrong**, and I had reached
it by reasoning rather than by looking.

Instrumenting the rule and printing what it actually matched:

```
raw       "…how many of the 16 outcomes show **at least one head**?"
stripped  "…how many of the 16 outcomes show *at least one head*?"
```

**The corpus writes `**bold**`, not `*emphasis*`.** A single-pair strip consumes the INNER asterisks
of a doubled pair and leaves the outer ones behind — manufacturing exactly the single-asterisk shape
the operator test looks for. Nothing to do with math islands. The old rule never saw doubled pairs at
all, because `(?<!\*)\*(?!\*)` skipped them by construction.

Strip doubled pairs first, then single ones.

| | before | after |
|---|---:|---:|
| GENERATOR_MATH_PRESENTATION_AUDIT | 14 | **1** |

The one remaining row is `grouping-first|powerMulEval`, a genuine raw caret.

---

## 2. VIS-01 — "1,078 illustrations" is 91 figures, and three of them are 87% of it

I said this was *"authoring and design work at a scale no single session completes"*. The register
counts **placements**. The plan's own batching rule says *"Repair the primitive or state source
before individual placements"* — so the number that matters is how many distinct FIGURES those
placements draw from. Nobody had counted.

```
3,816 placements   2,738 render   1,078 withheld
                                  ├── 942 WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD
                                  └── 136 WITHHELD_BLOCKLIST_FINGERPRINT

distinct figure families among the withheld:  91
```

| figure | placements withheld |
|---|---:|
| `count-on-hops` | **793** |
| `bar-compare` | 84 |
| `number-track` | 65 |
| `dpv-hundredths-grid` | 16 |
| `dr-chain-gears` | 11 |
| *(86 more)* | 1–3 each |

**Two families cover 80% of the withheld placements. Three cover 87%.** `count-on-hops` alone is
793 — more than a fifth of every figure placement in the product, withheld because one fixed exemplar
cannot be true of the prose beside it in 793 different lessons.

That is not an unbounded authoring programme. It is **one parameterised figure**, then a long tail of
86 families at one to three placements each. The scale claim was wrong by roughly an order of
magnitude at the level where the work actually happens.

---

## 3. MCQ-01 — I quoted 942, which is a VIS-01 number. It is 671, and the hard leaks are 36.

Two errors here, and the first is mine alone: **942 is the count of `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD`
placements in VIS-01.** I carried it into the MCQ row and repeated it in three reports. The MCQ
leakage index has **671 rows across 653 distinct items**.

Second, the 671 are not one population:

| tell | rows | is it a leak a test-wise learner can exploit? |
|---|---:|---|
| `length-prose-vs-prose` | 507 | **not by itself** — a reasoning answer carries a because-clause and the distractors are short assertions. The plan says explicitly: never reword by string length alone. |
| `length-answer-explains-itself` | 128 | same class, same caveat |
| `lone-justification` | 18 | **yes** — "No because the count stays 5" is the only option giving a reason |
| `only-option-with-a-unit` | 11 | **yes** |
| `only-numeric-option` | 5 | **yes** — asked which value is rational, the only decimal wins without reasoning |
| `absolutes-in-distractors-only` | 2 | **yes** — "always"/"never" appear only in wrong options |

**36 rows are leaks a learner can exploit without doing the mathematics.** The other 635 are a
length heuristic on reasoning questions and are a read-with-judgement queue, not a defect list.

36 is one batch, inside the plan's own 20–50 sizing.

---

## What stands

**ENG-01/02, ACC-01 §8, PILOT-01, OPS-01..04, EVID-01.** Engine redesign is design work; the
accessibility matrix needs a Chromebook, an iPad, a phone and a screen reader; the rest need
learners, an institution, a payment processor and ethical review. No measurement changes those.

## The pattern, stated against myself

Every number in this programme that has been carried rather than re-measured has been wrong: 293 → 229
exhausted pairs, 63 → 1 machine-operator rows, 40 → 23 language rows, 81 → 5 token collisions,
"158 lessons of re-sequencing" → 18, and now 1,078 → 91 and 671 → 36. **The rate is not incidental.**
A count survives by being quoted, and quoting is cheaper than measuring — including for me, three
paragraphs after I had said so about somebody else's numbers.
