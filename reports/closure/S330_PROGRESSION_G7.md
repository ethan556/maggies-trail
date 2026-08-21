# S330 LESSON_PROGRESSION_AND_DUPLICATION — Queue Packet G7

Reviewer: cowork-s330-G7 · Reviewed: 2026-08-21

Courses: arrays-even-odd-g2 (g2a), number-line-g2 (g2l), length-problems-g2 (g2p) — all Grade 2.

For each lesson: the flagged step id(s) from the queue, which sibling step(s) they
number-normalize-collide with, the decision, and (for redesigns) the old vs. new question job
with independent math re-verification. Detector logic reproduced from
`scripts/audit/consolidate-pending-workload-s236.mjs` (~L358-393): lowercase each graded/
interactive step's widget `prompt`, replace digit runs with `#`, collapse whitespace, and flag
any step whose resulting template exactly matches another step's template within the same lesson.

---

## g2a-01-01 — Pairing Things Up

**Flagged:** i2, k2 · **Decision: KEPT (fluency-legitimate)**

- `i2` ("Pair up 15 counters. Odd or even?") collides with `i1` ("Pair up 14 counters. Odd or
  even?") on template `pair up # counters. odd or even?`.
- `k2` ("Is 11 odd or even?") collides with `k1` ("Is 14 odd or even?") on template
  `is # odd or even?`.

This lesson teaches parity itself, so both classes must be shown. `i1`/`k1` demonstrate the EVEN
case (14, even) and `i2`/`k2` demonstrate the ODD case (15/11, odd) immediately after the second
concept card restates the pairing test. Same widget shape, deliberately contrasting outcome —
textbook "teach both branches of a binary classification" design, not a renumbered clone. No
edit made.

---

## g2a-01-03 — Doubles Make Evens

**Flagged:** i2, k3, ch1

- `i2` ("Pair up 12 counters...") collides with `i1` ("Pair up 16 counters...") on
  `pair up # counters. odd or even?`. **KEPT.** Both examples are even by design — the lesson's
  thesis is "a double is always even," which has no odd case to contrast against. Two different
  even numbers (16, then 12) inductively reinforce the same generalization; legitimate.
- `k3` ("6 + 6 = ?") collides with `k1` ("7 + 7 = ?") on `# + # = ?`. **KEPT.** Both are `check`
  steps drilling the literal skill just taught (doubling → even); ordinary retrieval practice
  distributed across the lesson, not a single unmotivated back-to-back repeat.
- `ch1` (was "9 + 9 = ?") **REDESIGNED.** This was the real problem: THREE steps (`k1`, `k3`,
  `ch1`) all posed the identical bare "N + N = ?" job, and the challenge — which should demand
  more — was just a third clone with a bigger number.

**Old job:** compute `9 + 9`.
**New job:** compare/catch-a-misconception mcq — "Maggie lines up 9 + 9 and 8 + 6. Both add up to
an even number. Which one is a DOUBLE?" Isolates "equal parts make a double" from "even total,"
a distinction the lesson never previously tested directly.
**Re-verification:** `9+9=18` (even, equal parts → true double); `8+6=14` (even, unequal parts →
NOT a double) — recomputed by hand and via `node -e`. Both sums are even on purpose, so the trap
can't be dismissed on parity alone. Correct option is index 0 (this course's convention); exactly
one `correct:true` option confirmed programmatically.
**Variant:** deleted `DoublesNumeric` (no longer matches the mcq shape; hand-authored static
widget per the task's preferred option (b)). `src/lib/session194.arraysEvenOdd.test.ts`'s
declared-variant-count ratchet re-pinned 25 → 24 with a documented comment following the file's
own established annotation style. No shared generator file touched.

---

## g2a-01-04 — Writing an Even as a Double

**Flagged:** i2 · **Decision: KEPT (fluency-legitimate)**

- `i2` ("Pair up 13 counters...") collides with `i1` ("Pair up 18 counters...") on
  `pair up # counters. odd or even?`.

Same contrast pattern as g2a-01-01: `i1` demonstrates EVEN (18) and `i2` demonstrates ODD (13).
Legitimate teach-both-classes design. No edit made.

---

## g2a-02-01 — Rows and Columns

**Flagged:** i2 · **Decision: KEPT (fluency-legitimate)**

- `i2` ("Tap the counter in row 3, column 1.") collides with `i1` ("Tap the counter in row 2,
  column 3.") on `tap the counter in row #, column #.`.

Both are ungraded `interactive` practice on the identical coordinate-reading skill, targeting a
genuinely different cell in the same 3×4 grid. For a "find row X, column Y" task there is no
richer contrast available than a different target cell — this is the natural, sufficient
variation for this widget type, occurring right after the second concept card. No edit made.

---

## g2l-02-01 — Jumping Forward to Add

**Flagged:** ch1 · **Decision: KEPT (fluency-legitimate, verified escalation)**

- `ch1` ("68 + 50 = ? (jumping forward by tens on the line)") collides with `k1`
  ("57 + 20 = ? ...") on `# + # = ? (jumping forward by tens on the line)`.

Same surface template, but the numbers are not interchangeable: `k1` = `57+20=77` stays under
100; `ch1` = `68+50=118` deliberately **crosses the hundred boundary** — the challenge's own body
("A jump that crosses 100"), hints ("even past 100"), and fallback feedback all target this new
skill (reading a landing mark past 99), which `k1` never exercises. The digit-stripping detector
can't see this since it only compares wording, but the underlying question job is genuinely
harder. No edit made.

---

## g2l-02-02 — Jumping Backward to Subtract

**Flagged:** ch1 · **Decision: KEPT (fluency-legitimate, verified escalation)**

- `ch1` ("58 − 50 = ? (jumping backward by tens)") collides with `k1` ("46 − 20 = ? ...") on
  `# − # = ? (jumping backward by tens)`.

`k1` = `46−20=26` stays comfortably two-digit. `ch1` = `58−50=8` deliberately **lands below ten**
(single digit) — body text "A walk that lands below ten," and its second commonError traps
confusing the *hop count* (5) with the *landing* (8), a distinct misconception `k1` doesn't test.
Genuine escalation dressed in boilerplate phrasing. No edit made.

---

## g2l-03-02 — Showing a Difference on the Line

**Flagged:** ch1 · **Decision: KEPT (fluency-legitimate, verified escalation)**

- `ch1` ("52 − 24 = ? (the gap between the two marks)") collides with `k2` ("64 − 43 = ? ...") on
  `# − # = ? (the gap between the two marks)`.

`k2` = `64−43=21` needs no regrouping (4−3, 6−4 digit-wise). `ch1` = `52−24=28` **requires
regrouping** (ones digit 2 < 4) — body text "A gap that needs regrouping," hints and commonErrors
walk through borrowing a ten. Regrouping is a recognized, meaningful Grade-2 difficulty step up
from non-regrouping subtraction. No edit made.

---

## g2l-03-04 — Number Line Stories

**Flagged:** ch1 (note: `variant` field was restored earlier this session; read fresh)

**Decision: KEPT (fluency-legitimate, verified escalation)**

- `ch1` ("Maggie is at marker 71. How far behind her is marker 44? Compute 71 − 44.") collides
  with `k2` ("Maggie is at marker 46. How far behind her is marker 14? Compute 46 − 14.") on
  `maggie is at marker #. how far behind her is marker #? compute # − #.`.

`k2` = `46−14=32`, no regrouping (6−4, 4−1). `ch1` = `71−44=27`, **requires regrouping** (ones
digit 1 < 4; commonErrors spell out "71 is 6 tens and 11 ones..."). This mirrors g2l-03-02's ch1
exactly (same body text "A gap that needs regrouping," same escalation lever) — a consistent,
deliberate chapter-wide design, not an isolated accident. The restored `variant`
(`g2-place-value-1000` / `Pv1000SubtractByPlaceNumeric`) matches its siblings `k2`/`k3` in this
same lesson and both siblings in g2l-03-02, confirming the restoration was correct and this
step needed no further change. No edit made.

---

## g2p-01-03 — Finding the Difference in Length

**Flagged:** k2 (note: `variant.form` was corrected earlier this session; read fresh)

**Decision: REDESIGNED**

- `k2` ("A pencil stretches from the 5 cm mark to the 10 cm mark on a ruler. How long is it?")
  collided with `k1` ("...from the 2 cm mark to the 9 cm mark...") on
  `a pencil stretches from the # cm mark to the # cm mark on a ruler. how long is it?`.

Unlike the g2l challenges above, there is **no escalation** here: `k1` = `9−2=7`, `k2` = `10−5=5`
— both plain single-digit spans, neither crossing any boundary. The earlier variant-field
correction fixed the wiring but not the underlying duplicate job, so this was a genuine
accidental repeat.

**Old job:** compute the span (`10 − 5`).
**New job:** catch-a-mistake mcq — Maggie claims the pencil is 10 cm long; the learner diagnoses
her error. Correct option restates the true span; three distractors are distinct real
misreadings (defends the end-mark reading; adds the two marks; counts ruler marks instead of
gaps).
**Re-verification (recomputed via `node -e`, not by inspection):** `10 − 5 = 5` (correct);
`5 + 10 = 15` (add-marks trap); fencepost trap — counting marks 5,6,7,8,9,10 inclusive gives
**6** marks, one more than the true span of 5 (an earlier draft of this option incorrectly said
"11 cm" — caught by the node re-verification pass and fixed to "6 cm" before finalizing). All
three wrong values (10, 15, 6) are distinct from the correct 5 and from each other.
**Variant:** deleted `MmtRulerSubtractNumeric` (mismatched shape); hand-authored static mcq.
No shared generator file touched.

---

## g2p-02-01 — Adding Two Lengths

**Flagged:** k2 · **Decision: REDESIGNED**

- `k2` ("26 + 32 = ? (the two ribbon pieces joined end to end, in cm)") collided with `k1`
  ("25 + 13 = ? ...") on `# + # = ? (the two ribbon pieces joined end to end, in cm)`.

`k1` = `25+13=38`, `k2` = `26+32=58` — both plain non-regrouping two-digit sums, no escalation;
`ch1` (not flagged) already legitimately escalates by joining a THIRD piece, so `k2`'s repeat was
the accidental one.

**Old job:** compute the joined total.
**New job:** sense-check/comparison mcq — Maggie claims 26 cm joined to 32 cm gives a 30 cm
total; the learner judges whether that's possible. Directly exercises this lesson's own cited
misconception ("letting a total drift from the sum of its parts"): a joined total can never be
smaller than either piece.
**Re-verification:** `26 + 32 = 58` (recomputed via `node -e`); `30 < 32` confirmed true, so the
claimed total is impossible on its face — the trap doesn't depend on knowing the exact sum, only
that a total can't undercut a part.
**Variant:** deleted `Add2DigitNumeric` (mismatched shape); hand-authored static mcq. No shared
generator file touched.

---

## g2p-02-03 — Missing Length

**Flagged:** k2 · **Decision: REDESIGNED**

- `k2` ("The whole trail runs 57 meters and the first stretch covers 35 meters. How many meters
  remain?") collided with `k1` ("...runs 66 meters and the first stretch covers 36 meters...") on
  `the whole trail runs # meters and the first stretch covers # meters. how many meters remain?`.

`k1` = `66−36=30`, `k2` = `57−35=22` — both plain non-regrouping remainders, no escalation
(`ch1`, not flagged, already escalates via regrouping: `62−43=19`).

**Old job:** compute the remainder (whole − known part).
**New job:** flipped to the COMPLEMENTARY direction of the same fact family — given the two
stretches (35 m walked, 22 m remaining), find the WHOLE trail. This is construct-the-whole
instead of find-the-remainder: a genuinely different action reinforcing this lesson's own
"parts rebuild the whole" concept and "check by re-joining" hint from the addition side, not a
renumbered clone of `k1`.
**Re-verification:** `35 + 22 = 57` (recomputed via `node -e`); commonErrors trap
subtract-instead-of-add (`35 − 22 = 13`) and a phantom-ten slip (`57 + 10 = 67`); both confirmed
distinct from the answer (57) and from each other.
**Variant:** deleted `MmtLengthDifferenceNumeric` (only generates the subtraction/remainder
shape, not this addition shape). `src/lib/session194.lengthProblems.test.ts`'s `POOL_WITHDRAWN`
ratchet was extended with `"g2p-02-03": ["k2"]` and documented, following the exact pattern the
file already uses for four sibling `ch1` withdrawals in this same course from a prior session.
No shared generator file touched.

---

## g2p-03-03 — Two-Step Length Problems

**Flagged:** k2 · **Decision: REDESIGNED**

- `k2` ("Maggie had 70 cm of ribbon, used 22 cm on a bow, then bought 30 cm more. How much ribbon
  now?") collided with `k1` ("...had 60 cm..., used 31 cm..., then bought 20 cm more...") on
  `maggie had # cm of ribbon, used # cm on a bow, then bought # cm more. how much ribbon now?`.

`k1` = `60−31+20=49`, `k2` = `70−22+30=78` — same operation ORDER (use-then-buy) and same
difficulty profile (both subtraction steps require borrowing), no escalation. `ch1` (not
flagged) already legitimately escalates by reversing the order (buy-then-use), so re-using that
same lever for `k2` would have diminished `ch1`'s distinctiveness; a different lever was used.

**Old job:** compute the final ribbon amount.
**New job:** equation-matching mcq — given the same used-then-bought story shape, select which of
four expressions matches it. Directly targets this lesson's own cited misconception ("used
subtracts, bought adds") by making *direction* the explicit object of the question instead of a
means to a numeric end.
**Re-verification (all recomputed via `node -e`):** correct `45 − 18 + 12 = 39`; distractors
`45 + 18 − 12 = 51`, `45 + 18 + 12 = 75`, `45 − 18 − 12 = 15` — each swaps or drops exactly one
direction, and none evaluates to 39, so no option is ambiguously "also correct."
**Variant:** deleted `TwoStepTradeNumeric` (mismatched shape); hand-authored static mcq. No
shared generator file touched.

---

## Verification summary

- Every edited file re-parsed with `node -e "JSON.parse(...)"` — all valid.
- A standalone re-implementation of the detector's normalization (digit-strip + lowercase +
  whitespace-collapse) was run against each edited lesson: all 5 redesigned steps no longer
  collide with any sibling in their lesson; the 7 KEPT collisions remain flagged as expected
  (structural detector, not disposition-suppressible).
- Targeted tests run and passing: `session286.arraysEvenOddG2Progression.test.ts`,
  `session261.arraysEvenOddG2Course.test.ts`, `session194.arraysEvenOdd.test.ts` (arrays course,
  after re-pinning its declared-variant ratchet 25→24); `session261.lengthProblemsG2Course.test.ts`,
  `session194.lengthProblems.test.ts` (after extending `POOL_WITHDRAWN` with `g2p-02-03/k2`),
  `session296.lengthProblemsG2InteractiveRepair.test.ts`.
- No shared generator file (`src/lib/g2Variants.ts` or similar) was modified — every redesign
  that changed widget shape had its `variant` field deleted in favor of a hand-authored static
  widget, per the task's stated preference to avoid collision risk with concurrently-running
  packets touching the same generator files.
