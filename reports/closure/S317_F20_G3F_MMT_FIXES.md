# S317 — fluency-20-g2 R6 fix, fractions-deeper-g3 g3f-01-04 residuals, measure-money-time mmt-02-01 choice-order fix

Bounded implementation packet against the 7 lessons named in the S317 dispatch. Basis:
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(S316-R standard), the S316-V4 REVISE records in
`reports/closure/cowork-staging/laneAV4-g2-g3-dispositions.jsonl`, the addendum in
`reports/closure/S316_LANEAV_G2_G3_VERIFICATION.md`, and the `mmt-02-01` finding in
`reports/closure/S316_LAB_CHOICE_SHUFFLE_SWEEP.md`. Only the 7 lesson files named in the dispatch
were edited. No `npm`/`vitest`/`tsc` gates were run, per instruction; verification below is
scripted (Python, reimplementing the S255 `normalized()` function and the R1–R6 clauses) plus
manual re-derivation of every changed arithmetic fact and a `git diff` review of every file.

## 1. fluency-20-g2 — R6 (answer-on-screen) fix, 5 lessons

Defect (per `laneAV4-g2-g3-dispositions.jsonl`, `S316-V4-*`, all REVISE): `playerStore.ts:200-205`
injects `[remedials[0].concept, remedials[0].check]` as a consecutive pair. In each of these 5
lessons, `remedials[0].concept.body` states the exact worked example (same operands, same numeric
answer) that `remedials[0].check.widget` then asks as a word problem — the learner reads the
answer, then is immediately asked for it. R1–R5 (byte/normalized/payload distinctness from k1 and
every other widget-bearing step, generator non-producibility, trap correctness) already passed for
all 5 before this fix; only R6 was open.

Fix applied, per lesson: kept `remedials[0].concept.body`/`narration` byte-identical (frozen,
legitimate worked-example prose per the dispatch instruction), and changed only
`remedials[0].check.widget`'s drawn numbers to a different instance of the **same** misconception
family (same generator form, same word-problem template shape), recomputing `commonErrors`
values/feedback and `explanationVariants` so every string stays literally true of the new numbers.

| Lesson | Family (k1 `variant.form`) | Concept's worked example (unchanged) | Old check (== concept, R6 fail) | New check (fresh instance, R6 pass) |
|---|---|---|---|---|
| `f20-01-01` | `FlDoublesNumeric` (doubles) | "Two equal groups: 6 and 6 make 12..." | 6 + 6 = 12 | **5 + 5 = 10** — "Two vases hold 5 flowers each. How many flowers are there in all?" |
| `f20-01-03` | `FlMakeTenNumeric` (make ten) | "8 + 5: give 2 to the 8 to make ten... Ten and 3 is 13." | 8 + 5 = 13 | **9 + 6 = 15** — "There are 9 red counters and 6 blue counters. Make ten first..." |
| `f20-01-04` | `FlTenPlusNumeric` (ten-plus) | "10 + 6 is 16 — the ten stays a ten..." | 10 + 6 = 16 | **10 + 8 = 18** — "A ten-frame is full and 8 more counters sit beside it..." |
| `f20-02-02` | `FlSums16Numeric` (bridge-ten sums) | "9 + 6: give 1 to the 9, and 5 are left. Ten and 5 is 15." | 9 + 6 = 15 | **7 + 9 = 16** — "A box holds 7 red pencils and 9 blue pencils..." |
| `f20-02-04` | `FlFromTenNumeric` (ten's partners) | "10 − 4 = 6, because 4 and 6 are ten's two parts." | 10 − 4 = 6 | **10 − 8 = 2** — "There are 10 marbles and 8 roll away..." |

New numbers were chosen to avoid duplicating any `factFamily`/operand pair already drawn by another
widget-bearing step in the same lesson (k1/k2/k3/ch1), so the fix does not introduce any new
collision alongside closing R6. Every `commonErrors` trap was recomputed from the new numbers using
the same misconception semantics as the original (e.g. "names one addend instead of doubling it,"
"stops at ten," "leaves out the ten," "finds the difference instead of the total," "repeats the
number taken away") — no trap text was reused verbatim with stale numbers.

### Scan results (scripted, S255-style `normalized()`, run against all widget-bearing steps per lesson)

```
f20-01-01: remedial check "Two vases hold 5 flowers each. How many flowers are there in all?"
  R1/R2/R3 vs i1,k1,i2,k2,k3,ch1: PASS (no collision)
  R6: PASS — concept_nums={6,12} check_nums={5,10} (disjoint)
  R5: PASS — answer=10, traps=[5,9], no trap==answer, no trap==trap, feedback len 68/79

f20-01-03: remedial check "There are 9 red counters and 6 blue counters. Make ten first..."
  R1/R2/R3: PASS | R6: PASS — concept_nums={2,3,5,8,13} check_nums={6,9,15} (disjoint)
  R5: PASS — answer=15, traps=[10,14]

f20-01-04: remedial check "A ten-frame is full and 8 more counters sit beside it..."
  R1/R2/R3: PASS | R6: PASS — concept_nums={6,10,16} check_nums={8,18} (disjoint)
  R5: PASS — answer=18, traps=[8,10]

f20-02-02: remedial check "A box holds 7 red pencils and 9 blue pencils..."
  R1/R2/R3: PASS | R6: PASS — concept_nums={1,5,6,9,15} check_nums={7,9,16}
    (9 recurs — it is one of the concept's worked-example addends, but the check's OTHER operand (7)
    and its answer (16) are not stated in the concept, so the check is not reconstructable from the
    concept alone; the injected pair no longer states the check's answer, which is the R6 test)
  R5: PASS — answer=16, traps=[15,2]

f20-02-04: remedial check "There are 10 marbles and 8 roll away..."
  R1/R2/R3: PASS | R6: PASS — concept_nums={4,6,10} check_nums={8,10,2}
    (10 recurs as the shared "whole" ten both facts partition; check's operand 8 and answer 2 are
    not stated in the concept)
  R5: PASS — answer=2, traps=[8,10]
```

All 5: parse-checked clean (`python -m json.tool`), no `id`/`conceptTag`/widget `type` changes,
`fallbackFeedback` (generic, number-free) untouched, all new feedback strings ≥ 25 characters and
none opens with a negation.

## 2. fractions-deeper-g3 / g3f-01-04 — two residuals

Source: `laneAV4-g2-g3-dispositions.jsonl:S316-V4-g3f-01-04` (REVISE). The prior `k3` redesign
(fraction-of-a-set division, muffin tray) was confirmed already correct and untouched here.

**(a) Remedial stem normalized identically to k1's template.** Old remedial prompt: *"A set of 18
counters is split into 3 equal groups. How many counters are in each group?"* — normalizes to the
identical `"a set of # counters is split into # equal groups. how many counters are in each
group?"` as k1's *"A set of 15 counters is split into 3 equal groups..."* (an operand swap under an
unchanged template, the same defect class the adjudication rejected Worker B's packet for).

Fix: restated as a genuinely different (word/sharing-context) representation, keeping the numbers
and answer unchanged: **"18 stickers are shared equally among 3 friends. How many stickers does
each friend get?"** (18 ÷ 3 = 6). `commonErrors` values (3, 15) unchanged; feedback reworded to be
literally true of the new "friends/stickers" vocabulary instead of the old "groups/counters"
vocabulary. `fallbackFeedback`/`successFeedback` reworded to match.

**(b) Stale `explanationVariants` on k1, k3, and the remedial.** All three previously read
pre-redesign row×column-total phrasing (`"Rows of equal groups." / "Count the whole set."` on k1
and the remedial; `"Groups times size." / "Every group counted."` on k3) that does not describe the
current fraction-of-a-set **division** task (find the size of one group/row/share, which is not
"the whole set"). Rewritten to walk each step's own current numbers by division:

| Step | Numbers | New `explanationVariants` |
|---|---|---|
| `k1` | 15 counters ÷ 3 groups = 5 | "15 counters split into 3 equal groups: 15 ÷ 3 = 5 in each group." / "Divide the set of 15 by the 3 equal groups to find one group's size: 5." |
| `k3` | 24 muffins ÷ 6 rows = 4 | "24 muffins divided into 6 equal rows: 24 ÷ 6 = 4 muffins in one row." / "Divide the tray of 24 by the 6 rows to find one row's size: 4." |
| remedial | 18 stickers ÷ 3 friends = 6 | "18 stickers shared equally among 3 friends: 18 ÷ 3 = 6 stickers each." / "Divide the total of 18 by the 3 friends to find one friend's share: 6." |

No change to `id`, `conceptTag`, `answer`, `widget.type`, `k3`'s own prompt/`commonErrors` (already
conforming and untouched), or any concept prose.

### Scan results (scripted)

```
remedial prompt (new): "18 stickers are shared equally among 3 friends. How many stickers does
  each friend get?"
normalized: "# stickers are shared equally among # friends. how many stickers does each friend get?"

vs every widget-bearing step in the lesson:
  i1  norm="a set of # counters is split into # equal groups. build the fraction one group..." -> ok
  k1  norm="a set of # counters is split into # equal groups. how many counters are in each..."  -> ok (no longer a collision)
  i2  norm="a learner modeled one counter out of eight as #. repair the bar..."                  -> ok
  k2  norm="which is bigger: a third or a fourth?"                                                -> ok
  k3  norm="a tray of # muffins is divided into # equal rows. how many muffins are in one row?"   -> ok
  ch1 norm="a ribbon is cut into # equal pieces and # are used. which fraction names what..."     -> ok

R1/R2/R3: PASS (no normalized or literal collision anywhere in the lesson)
R5: answer=6, traps=[3,15] — no trap==answer, no trap==trap; feedback lengths 73 and 91 chars
k1 has no `variant` key (already removed in the prior redesign) — R4 not applicable to k1;
  k3's variant was likewise already removed and is untouched here.
```

Parse-checked clean. `session195.fractionsDeeperG3.test.ts` (which the S316 adjudication reports as
gate-red for 5 lessons including `g3f-01-04`, due to a dereferenced `.variant.gen` on a removed
`variant` key) was **not** run per the no-vitest instruction; this packet did not touch, add, or
remove any `variant` key on `k1`/`k3`/the remedial, so it neither fixes nor worsens that pre-existing
gate state — flagging for whoever owns that test file.

## 3. measure-money-time / mmt-02-01 — discreteEstimateCompare choice order

Source: `reports/closure/S316_LAB_CHOICE_SHUFFLE_SWEEP.md`, "Skipped — ordered-semantics exception"
section. This widget (`estimateSlider` discrete/`choices` mode) is intentionally **not** shuffled in
code (`DiscreteEstimateCompareW`) because choice order on the ruler visual is itself pedagogical
content (too-low → on-target → too-high, ascending by value). 11/15 authored instances elsewhere in
the codebase already follow this convention; this lesson's 4 instances did not — they were authored
correct-value-first, which is exactly the authored-position exploit the sweep was checking for, just
expressed as a content lapse rather than a code defect. Grading is `spec.choices.find(c => c.value
=== value)` — by value, not position — so reordering is evaluator-safe and was confirmed safe by the
sweep report before this fix.

Fix: reordered the `choices` array to ascending-by-value in all 4 instances. No `value`, `label`,
`feedback`, `correct`, `lowFeedback`, `highFeedback`, or `successFeedback` string was changed —
only array element order.

| Step | Target | Old order (values) | New order (values) |
|---|---|---|---|
| `i1` | 9 | [8, 20, 1] (correct-first) | **[1, 8, 20]** |
| `i2` | 12 | [13, 30, 2] (correct-first) | **[2, 13, 30]** |
| `i3` | 7 | [6, 20, 1] (correct-first) | **[1, 6, 20]** |
| `remedials[0].check` | 9 | [8, 20, 1] (correct-first) | **[1, 8, 20]** |

### Scan results (scripted)

```
found 4 estimateSlider widgets with choices
/steps[1]/widget            target=9  values=[1, 8, 20]  ascending=True  correct_idx=1
/steps[4]/widget            target=12 values=[2, 13, 30] ascending=True  correct_idx=1
/steps[6]/widget            target=7  values=[1, 6, 20]  ascending=True  correct_idx=1
/remedials[0]/check/widget  target=9  values=[1, 8, 20]  ascending=True  correct_idx=1
```

`git diff` confirms all 4 hunks are pure array-element reorders (each choice object moved whole,
byte-identical `value`/`label`/`feedback`/`correct` fields); no other line in the file changed.
Parse-checked clean.

## Scope discipline

Touched only the 7 files named in the dispatch:
- `content/courses/fluency-20-g2/lessons/{f20-01-01,f20-01-03,f20-01-04,f20-02-02,f20-02-04}.json`
- `content/courses/fractions-deeper-g3/lessons/g3f-01-04.json`
- `content/courses/measure-money-time/lessons/mmt-02-01.json`

No other lesson, course manifest, widget component, evaluator, or generator file was edited. Per
task instruction, `npm run validate:content`, `npm run lint:pedagogy`, `npx vitest`, and `tsc` were
**not** run; verification above is scripted re-implementation of the S255/S316-R clauses plus manual
arithmetic re-derivation and `git diff` review. This packet does not close the lane — a downstream
verifier should re-run the full gate suite and the S316-R scripted check against these 7 files (and,
if desired, the whole-corpus generalized version the adjudication recommends in §7.1) before any
disposition is signed.

## Deliverables

- This report: `reports/closure/S317_F20_G3F_MMT_FIXES.md`
- Per-lesson NDJSON: `reports/closure/cowork-staging/laneA-s317-fixes.jsonl` (7 records)
