# WS-E Phase 2 — Batch 2 Adjudication Report (gates 31–60 of 1,362)

Session S241, 2026-08-13. Same method as batch 1: each gate read against `WS_E_PREDICTION_RUBRIC.md`
§4/§5 on its own `predict` text; `widget_type` never consulted for a verdict. All verdicts
`PROPOSED`. `content/courses/` untouched.

Coverage: `add-subtract-100` (14 gates, grade 2), `add-subtract-1000-g2` (16, grade 2).

---

## Result

| Verdict | Batch 2 | Batch 1 | Running total (60 gates) |
|---|---:|---:|---:|
| KEEP | 25 (83%) | 20 | 45 (75%) |
| REWRITE | 4 (13%) | 5 | 9 (15%) |
| REMOVE | 1 (3%) | 5 | 6 (10%) |

**Old CSV for these same 30: 24 KEEP / 6 REMOVE.** Eleven gates move: **6 flips REMOVE→KEEP**
and **5 flips KEEP→REWRITE/REMOVE**. The two methods now disagree on roughly a third of every
batch — in both directions — which is the clearest evidence yet that the old CSV's verdicts and
the rubric's are not measuring the same thing at all.

Second-reader flags: 6/30 (20%), consistent with batch 1's 23%.

---

## Two findings that matter beyond this batch

### 1. A genuine cross-course contradiction in the corpus

`as100-04-03` (grade 2) asks what decides whether a step is add or subtract, and **explicitly
rejects the keyword strategy** — one of its wrong options is literally *"Whether it asks 'how
many'"*, and its reveal rules: *"The EVENT picks the operation; the numbers just ride along."*

`g2b-03-04` — same grade, adjacent course — **teaches exactly that rejected strategy**: *"A story
says 'how many steps in ALL'. Which operation?"*, revealing *"'In all' collects the parts into one
total."*

Two gates in the same grade band train opposite problem-solving strategies. I've marked
`g2b-03-04` REWRITE with the conflict named, but **which one is right is a curriculum decision,
not an adjudication one** — flagging it rather than resolving it. (My read: `as100-04-03` has it
right; keyword-matching is a well-documented dead end by grade 3+.)

### 2. The old CSV's misses cluster in the strongest gates

The six REMOVE→KEEP flips include the batch's best material: `as100-04-02` (*"Just do 7 − 2
instead"* — the textbook smaller-from-larger subtraction misconception, named and refuted),
`as100-05-02` (even + even = even, argued structurally with *"every time"*), and `as100-01-03`
(count-on vs make-ten, both mechanisms worked on different numbers). These weren't borderline —
they're the kind of gate the plan's five categories were written to protect, removed because their
widget engine scored low on manipulation capability.

---

## The 4 REWRITEs — all one fixable shape, with the fix already in the corpus

`g2b-01-02`, `g2b-02-01`, `g2b-03-01` are instance-checks with no general claim and an unengaged
distractor (*"4+5, 3+4, 2+1 all stay under ten"*). Notably, **the `add-subtract-100` course already
contains the exact sentence each one needs** — *"Regrouping only fires when the ones pile reaches
ten"*, *"The places only have to talk when a top digit comes up short"*, *"mixes up the jump size
with the number of jumps"*. These are one-clause fixes borrowing a sibling's own language, not
authoring work.

`g2b-03-04` is the keyword-conflict gate above.

## The 1 REMOVE

`g2b-03-03` — *"The strongest explanation of a trade says… / …the teacher said so"*. A straw-man
binary: nobody offered the alternative picks authority. No mathematical claim, no real
misconception. Same class as batch 1's `koa-03-10`. Flagged for a second reader.

---

## Pattern note for scheduling

Adjudication cost tracks **reveal length, not grade**. Grade 9 (batch 1) and `add-subtract-100`
(here) both have long, argued reveals and adjudicate fast with clean evidence.
`add-subtract-1000-g2`'s one-sentence reveals are where the judgment calls concentrate — 5 of the
6 second-reader flags. Expect the terse-reveal courses to be the slow ones.

---

## What I need from you

1. **Ratify, adjust, or reject these 30.**
2. **The keyword contradiction** — do you want `g2b-03-04` recast to match `as100-04-03`'s event
   logic (my recommendation), or is this a curriculum question you want to look at separately?
3. Batch 3 continues into `add-subtract-1000-g2`'s remainder and onward, unless you want to
   re-prioritize toward a particular grade band.
