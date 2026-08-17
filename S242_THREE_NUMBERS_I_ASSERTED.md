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

---

## Postscript — I made the same mistake again, one turn later

Having corrected 1,078 → 91 figures, I wrote: *"Highest-leverage thing left on the board is now
unambiguous: `count-on-hops`, 793 placements, one figure."* That was another leverage claim made
without opening the figure. Opened now.

**`CountOnHops` draws a fixed number line: start at 4, three orange hops, land on 7, caption
"4 + 3 = 7".** The plan was obvious — parameterise it from the prose beside it, and 793 placements
come back. So I measured how many of the 793 name a sum a count-on hop could draw:

```
withheld count-on-hops placements     793
  drawable as a count-on hop           20
  no `a + b` in the body anywhere      765
  hop count outside 1–6                 8
```

**Twenty.** And reading those twenty finishes it:

| lesson | prose | what it is actually about |
|---|---|---|
| `koa-01-05` | "The equals sign says both sides name the same amount: 3 + 2 and 5 are the same number." | the equals sign |
| `g1a-01-04` | "Two tens plus three tens is five tens — the same relationship as 2 + 3 = 5, scaled by ten." | place-value scaling |
| `g2a-03-01` | "3 rows of 4 becomes 4 + 4 + 4" | arrays and repeated addition |
| `g1e-01-02` | "5 + 2 = 7 is true; 5 + 2 = 8 is false" | the truth of an equation |

Not one is about counting on. My parser found "3 + 2" and would have drawn three hops beside a
sentence about equality.

Then the shape of the whole thing:

```
796 placements · 793 withheld · 3 render
397 distinct lessons · 33 courses · every single one on a `c#` concept step
top courses: add-subtract-10-k, decimal-fluency-g5, mult-div-fluency-g4,
             unlike-fractions-g5, shapes-build-k, number-writing-k
```

**A 0–10 count-on number line is declared on concept steps in Grade 5 decimal fluency, Grade 5
unlike fractions, and Kindergarten shape building.** It was used as a decorative default. Three of
its 796 placements are genuine.

### What that changes

1. **This is not a figure repair.** No parameterisation makes a count-on hop belong beside "the
   equals sign says both sides name the same amount". The figure is fine; the *declarations* are
   wrong.
2. **The guard is already the correct behaviour.** Those 793 steps render nothing today, and
   nothing is the right answer — a wrong figure is worse than no figure. So for the learner this
   is already safe. "Hidden ≠ repaired" is a good general rule and it is **wrong here**: hidden is
   the repair. What remains is content debt, not a learner-visible defect.
3. **The real remaining work is figure SELECTION across 397 lessons** — does this concept step want
   an illustration, and which one — which is authoring judgement per step and cannot be batched by
   a script.

### The honest tally on myself

Two turns, two leverage claims, both made by reading a count instead of the thing it counted:

- "1,078 illustrations, a scale no session completes" → 91 figures.
- "793 placements, one figure, unambiguous" → 793 wrong declarations the runtime already neutralises.

The first was too pessimistic, the second too optimistic, and both came from the same habit. The
correction that actually generalises is not any of these numbers — it is that **a count is not
evidence about the work until someone opens one of the things being counted.**

---

## The 36, split by who is allowed to fix them

With `count-on-hops` retired as a repair target, the 36 exploitable MCQ leaks are the top
completable item left. Splitting them by source decides who may touch them:

```
36 hard leaks   ·   26 AUTHORED   ·   10 GENERATED
```

**The 26 authored ones are not mine.** CLAUDE.md rule 1 is the oldest rule in the repository:
*"Never change authored lesson prose… If you find a genuine content error, record it in
`VARIANT_LOG.md` for a human and move on."* An MCQ option label is authored prose. They are
recorded there, not edited here — and a session that quietly rewrote 26 of them would be breaking
the rule that has governed this whole workstream in order to close a number.

They cluster, which makes the human's job smaller than 26:

| cluster | lessons | tell |
|---|---|---|
| "Two trail legs of 32 m and 25 m give a computed total of 30 m" | `g2p-01-03`, `g2p-03-04` (×2 steps) | the same item, three placements, both `lone-justification` and `only-option-with-a-unit` |
| "When you add 5/12 + 5/12, what happens to the denominator?" | `g5u-01-05`, `g5u-02-01` | `lone-justification` |
| "A student computes 1/2 + 1/3 and gets 5/6. Is that reasonable?" | `g5u-03-02` (×2 steps) | `lone-justification` |
| "What do the numerals 13 through 19 all share?" | `kcw-02-02`, `kcw-02-04` | `only-option-with-a-unit` |

**The 10 generated ones are fixable at the generator**, which is where the root-cause multiplier
applies — one repair, every seed:

```
g6-data-literacy|ddHistDisplayChoice                    absolutes-in-distractors-only
rate-interpret|compareSpeeds                            only-option-with-a-unit
g8-rns-root-classify|rnsClassifyPickRational            only-numeric-option
g8-rns-root-estimate|rnsCloserInteger                   lone-justification
g8-rns-compare-estimate|rnsCompareRootDecimal           lone-justification
g4-fractions|faLikeDenomWordMcq                         lone-justification
a2-complex|cn-complex-plane__mcq                        only-numeric-option
g12-trig-graphs-inverses|…tg-arccos__mcq                lone-justification
g12-trig-identities-equations|…ti-pythagorean__mcq      only-numeric-option
g12-trig-identities-equations|…ti-tan-cofunction__mcq   lone-justification
```

`rnsClassifyPickRational` is the clearest of them: *"Which of these is rational?"* against √12, π
and a non-repeating decimal — the only option written as a plain decimal is the answer, so a
learner who has never met irrationality scores by shape.

**Ten generator repairs is the next batch, and it is a batch — not a session's leftovers.** Each
needs its distractors re-derived so the correct option is not identifiable by form, then the
variant gate, then the output read. That is the working rhythm this repo mandates, and starting it
with the context left in this session would produce exactly the unread output CLAUDE.md warns
about: *"An honest 12 with every trap read is worth more than 40 unread."*
