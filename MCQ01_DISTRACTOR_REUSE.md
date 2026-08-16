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

## Measured across the whole authored corpus — and then substantially corrected

2,563 authored MCQ items, 9,464 options. The first measurement:

| | |
|---|---:|
| Distractor shapes reused 3+ times and **never correct** | 151 |
| Option slots filled by one of them | 588 (6.2% of all options) |

**That number overstates the defect by roughly half, and reading the rows is what showed it.**

### First correction: most of the "reuse" is the same QUESTION reused

| | |
|---|---:|
| Of the 588 slots, sitting on an item that is **duplicated elsewhere** | **322 (55%)** |
| Of the 151 shapes, occurring on **one distinct item only** | **55** |
| Shapes spanning 3+ **distinct** items — the only genuine candidates | **67**, over **306 slots** |

`"The estimate cannot help with decimals"` looked like a five-use filler. It is one item —
*"A student computes 3.6 × 4 and gets 1.44"* — placed in five different lessons. The distractor
repeats because the whole question repeats. A detector counting option labels cannot tell those
apart, and this one did not.

### Second correction: the residue is mostly legitimate

24 of the 67 candidate shapes read by hand. Roughly **4 look like filler (~17%)**; the rest are real,
consistently-diagnosed misconceptions that simply never happen to be the key:

- `"You cannot tell"` — 22 uses, and the reason it is never correct is that these Kindergarten
  lessons **teach that you always can**. Its feedback is *"You can always tell — pair the groups one
  to one and look at which side has leftovers."* That is a misconception probe, not a slot-filler,
  and removing it would remove the thing the lesson is arguing against.
- `"they're the same size"` (11×, g3f fractions), `"Arrays only work for even totals"`,
  `"Because t² is always positive"`, `"Only a ruler could tell"`, `"both are equally reliable"` —
  all real errors a learner makes.

Genuine filler does exist and reads differently — it is a **strawman the feedback itself dismisses**:

> `"The estimate cannot help with decimals"` → *"Estimating is most valuable with decimals."*
> `"You cannot estimate a fraction division"` → *"You can: ask how many of the piece fit in one whole."*

### What the claim should have been

**Reuse plus never-correct is not evidence of filler.** The `si-*` family that prompted this — six
wordings of *"the sample is too small"*, never the answer — is real, but it does not generalise to
151 shapes. The defensible residue is small, and it needs a read per shape rather than a patch.

**The finding that survives is the one underneath: item duplication.** 162 items over 377
placements, and the 588 slots are largely its shadow.

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
