# MCQ-01 — WHAT THE 507 PROSE-VS-PROSE ROWS WERE ACTUALLY POINTING AT

**Evidence:** `reports/mcq/MCQ_DISTRACTOR_REUSE_INDEX.csv` and
`reports/mcq/MCQ_DUPLICATE_ITEM_INDEX.csv`, from `scripts/audit/distractor-reuse.mts`
· **Date:** 2026-08-16

`MCQ_LEAKAGE_ADJUDICATION.md` left 507 items in `length-prose-vs-prose` with a correct verdict —
*"the answer is longer because the true reason is longer, and the repair is to write more plausible
wrong reasons"* — and no way for an author to know which item to open first. Median length ratio
2.03×, 90th percentile 3.7×: a house style, not a list of defects.

## Reading one family end to end changed the question

All 22 authored `si-*` rows, statistical inference. The same distractor is doing the work in eight
of them:

> "The sample is too small to conclude anything." · "A larger sample, so the 90% is more precise."
> "The polls were too small." · "The sample was too small." · "How much wobble — the sample is too
> small." · "The sample is too small to support a policy change."

**It is never the answer.** A learner who notices — and learners notice — eliminates one option in
eight items without understanding a single thing about sampling. That is a clue leak, it is larger
than any length ratio, and no tell in the leakage index measures it.

## Measured across the whole authored corpus

2,563 authored MCQ items, 9,464 options.

| | |
|---|---:|
| Distractor shapes reused 3+ times and **never correct** | **151** |
| Option slots filled by one of them | **588** (6.2% of all options) |
| Of those shapes, spanning more than one course | 38 |

A "shape" is the label with numbers, punctuation and function words stripped and the rest stemmed
and sorted, so *"The sample is too small to conclude anything"* and *"The polls were too small"*
count as one — a learner does not memorise the wording, they memorise that one option always says
the study was too small and is always wrong.

**Never-correct is the load-bearing condition.** A shape that is *sometimes* the answer is a
recurring idea and eliminating it would be a mistake; a shape that is never the answer is a slot the
author reached for when they needed a fourth option.

The most reused:

| Uses | Scope | Example |
|---:|---|---|
| 22 | across courses | `You cannot tell` |
| 11 | across courses | `they're the same size` |
| 10 | across courses | `they're equal` |
| 9 | across courses | `Nothing — shapes cannot be joined` |
| 7 | one course | `Because tens look nicer than ones` |
| 7 | across courses | `Nothing can be concluded` |

Hand-checked: the `cannot tell` / `nothing can be concluded` family is used **29 times and is
correct 0 times**.

**This is the authored twin of the generator padding helpers GEN-03 disarmed**, and it takes the
same repair: write a wrong reason that belongs to *this* item, or accept fewer options. Rule 7
applies to authored content too — three real distractors beat four with a filler.

## And the thing the hand-check found, which is worse

Verifying "never correct" meant printing the items the family appears in, and two of the first six
were **the same item twice in one lesson** — `g4m-02-02#k1` and `#k3`, identical prompt, identical
options.

| | |
|---|---:|
| Distinct authored MCQ items | 2,348 |
| Items appearing more than once | 162, over **377 placements** |
| Of those, **the same question twice inside one lesson** | **75** |

> 4× `Computing 0.4 × 0.3 in hundredths gives 12. Where does the point go?`
>   — `g5d-02-02#k1` `g5d-02-02#k3` `g5d-02-03#k1` `g5d-03-01#k3`
> 4× `Rule A adds 3 each step from 0; rule B adds 6 each step from 0. How do their terms relate?`
>   — `g5e-03-01#k1` `g5e-03-01#k3` `g5e-03-03#k3` `g5e-03-05#k2`

A learner answers the question at `k1` and meets it again at `k3` in the same sitting. Two
independent "correct" attempts are recorded against one remembered item — **the mastery-as-memory
failure this entire program exists to remove, reintroduced by copy-paste.**

It is not a distractor problem at all. It is measured here because it was found here.

## The queue, ordered

1. ~~**75 within-lesson duplicates.**~~ **8 closed, 67 open.** The first-walk pin was the reason
   these survived, and it now carries one exception: prose can only be anchored to ONE occurrence of
   an item, and it is the first — so the first copy keeps its authored numbers and **every later
   copy is regenerated, on every walk including the first**. Measured end to end: duplicate
   occurrences on a first walk **75 → 67**.

   The remaining 67 have a `conceptTag` but no generator serves it, so nothing can regenerate them.
   Each closes automatically the moment one does. Both numbers are ratcheted in
   `src/lib/content.duplicateItems.s242.test.ts` as exact equalities, so a new copy-paste is a test
   failure and a genuine improvement forces this ledger to be updated.
2. **151 filler shapes / 588 slots.** Ranked by reuse count, so the 22-use shape is one edit
   affecting 22 items. Batchable by shape rather than by lesson, which is what makes it tractable.
3. **507 prose-vs-prose.** Still open, still authoring, and now with a sequence: an item whose only
   tell is a length ratio, once its filler distractor is replaced, may no longer have a tell at all.

## What this does not claim

- **Generated MCQs are excluded.** This walks authored content only; `GEN03_DISTRACTOR_CONTRACT.md`
  owns the generator registry, where the equivalent finding was 109 templated fallbacks.
- **No item was judged for misconception validity.** Whether each *remaining* distractor maps to a
  real learner error still needs the taxonomy GEN-03 specified and nobody has built.
- **Reuse is not automatically a defect.** The never-correct filter is what makes these actionable,
  and it is a heuristic: a shape could be plausible in all 22 items and simply never happen to be
  the key. Every row needs a read before it is rewritten — which is why this is a ranked queue and
  not a patch.
