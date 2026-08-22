# S318 — LESSON_PROGRESSION_AND_DUPLICATION, all 11 P0 rows

Bounded implementation worker. Scope: the 11 `priority==P0`, `workstream==LESSON_PROGRESSION_AND_DUPLICATION`
rows extracted directly from `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (verified count: 11, matching the
expected course breakdown — arrays-even-odd-g2 4, length-problems-g2 3, number-line-g2 1,
long-division-g5 1, measure-money-time 1, rational-number-operations 1).

Per task instruction, `npm`/`vitest`/`tsc` were **not** run. Verification below is JSON
parse-checking, a scripted normalized-duplicate scan (regex-collapse digit runs to `#` over
every step's `widget.prompt` and `predict.prompt`, run within each lesson, before and after each
edit — script used: a throwaway `_dupscan.py`, not committed), direct reading of the touched
widget's schema and integrity rules (`src/lib/schema.ts`, `widgetIntegrityErrors`), the
underlying evaluator (`src/lib/evaluate.ts`), and independent hand arithmetic for every
numeric/mcq/oddEvenPairs/estimateSlider answer and trap.

NDJSON ledger: `reports/closure/cowork-staging/laneA-s318-prog.jsonl` (11 rows, one per queue row).

## Method

For every row, the full lesson JSON was read in full (every step, not just the named
`step_path`), and the flagged step(s) were compared against every other step's `widget.prompt`
(and `predict.prompt` where present) after collapsing digit runs to `#`. All 11 rows reproduced
under this scan: each named step was either byte-identical to an earlier step's widget, or
template-identical to it (same fixed wording, only the operands swapped) — a duplicated question
job or a progression that repeats rather than advances, per the defect class. One step named in
one row's `step_path` (`rno-04-02`/`k2`) did **not** reproduce as this defect class under the
scan or under hand inspection (see that row's note) and was left unedited.

For each confirmed step, the first-in-reading-order occurrence was kept canonical and untouched.
Every duplicate was given a genuinely distinct problem: new numbers, a different instructional
job/context/representation/transfer-demand (never a bare operand swap under the same template),
and every answer/trap/feedback recomputed by hand. Where a step carried a `variant` key whose
generator (`src/lib/g2Variants.ts`) could not produce the new content (wrong fixed prompt
string, or numeric range/shape outside what the generator emits), the key was removed and logged
below as generator debt (VARIANT_LOG convention). No figure bindings were touched (`current_figure_id`
was empty on all 11 rows). No step/option `id`, `conceptTag`, or widget `type` was changed.

## Per-row outcomes

| # | work_id | lesson_id | step_path | Verdict | Steps fixed | Variant debt |
|---|---|---|---|---|---|---|
| 1 | `PROGRESSION-g2a-01-02` | g2a-01-02 | k3 ch1 | **FIXED** | k3, ch1 | k3, ch1 removed |
| 2 | `PROGRESSION-g2a-02-02` | g2a-02-02 | ch1 | **FIXED** | ch1 | ch1 removed |
| 3 | `PROGRESSION-g2a-02-03` | g2a-02-03 | ch1 k2 | **FIXED** | k2, ch1 | k2, ch1 removed |
| 4 | `PROGRESSION-g2a-03-03` | g2a-03-03 | k3 ch1 | **FIXED** | k3, ch1 | k3, ch1 removed |
| 5 | `PROGRESSION-g2p-02-02` | g2p-02-02 | ch1 k2 | **FIXED** | k2, ch1 | k2, ch1 removed |
| 6 | `PROGRESSION-g2p-03-01` | g2p-03-01 | k3 | **FIXED** | k3 | none present |
| 7 | `PROGRESSION-g2p-03-04` | g2p-03-04 | k3 | **FIXED** | k3 | none present |
| 8 | `PROGRESSION-g2l-01-02` | g2l-01-02 | ch1 | **FIXED** | ch1 | ch1 removed |
| 9 | `PROGRESSION-g5l-03-01` | g5l-03-01 | ch1 i2 | **FIXED** | i2, ch1 | none present |
| 10 | `PROGRESSION-mmt-05-02` | mmt-05-02 | i2 | **FIXED** | i2 | n/a (graphRead, no variant field used) |
| 11 | `PROGRESSION-rno-04-02` | rno-04-02 | i3 ch1 k2 k3 | **PARTIAL_FIX** | i3, k3, ch1 fixed; k2 NOT_REPRODUCIBLE (unedited) | none present |

**Result: 10/11 rows fully closed; 1/11 (`rno-04-02`) closed on 3 of its 4 named steps, with the
4th (`k2`) recorded NOT_REPRODUCIBLE against this defect class from current source.**

## VARIANT_LOG — generator debt logged (7 removals, 6 lessons)

Every step below had its `variant` key removed because the new, differentiated content (reworded
prompt, and/or numeric range/structure) no longer falls inside what the named generator/form can
produce. All are `gen: "g2-add-subtract-100"` in `src/lib/g2Variants.ts`, which the arrays-even-odd-g2,
length-problems-g2, and number-line-g2 courses share.

| Lesson | Step | Prior `variant` | Why it no longer applies |
|---|---|---|---|
| g2a-01-02 | k3 | `form: OddEvenMcq` | Generator's fixed prompt is `'Which number is even?'`, 2-digit range only, always asks for the even option. New content: 3-digit word-problem, asks for the odd option. |
| g2a-01-02 | ch1 | `form: OddEvenOddEvenPairs` | Generator's fixed prompt is `'Is {n} odd or even? Pair the ones digit, then choose.'`. New content: real-world sentence, 3-digit onesDigit framing, different wording. |
| g2a-02-02 | ch1 | `form: Add2DigitNumeric` | Generator's fixed prompt is `'{a} + {c} = ?'` with a∈[21,79]/c∈[12,69]. New content: 4×7 repeated-addition word problem, single-digit multiplicands outside that range. |
| g2a-02-03 | k2 | `form: Add2DigitNumeric` | Same generator/reason: new content is a 4×5 independent-sum word problem. |
| g2a-02-03 | ch1 | `form: Add2DigitNumeric` | Same generator/reason: new content is an 18+6+6 two-step extension, not a two-addend `a+c=?`. |
| g2a-03-03 | k3 | `form: Add2DigitNumeric` | Same generator/reason: new content is a 4×6 independent-sum word problem. |
| g2a-03-03 | ch1 | `form: Add2DigitNumeric` | Same generator/reason: new content is a 21+7+7 two-step extension. |
| g2p-02-02 | k2 | `form: Add2DigitNumeric` | Same generator/reason: new content is a 15+12+9 three-addend independent sum. |
| g2p-02-02 | ch1 | `form: Add2DigitNumeric` | Same generator/reason: new content is a 40+15+9 two-step extension. |
| g2l-01-02 | ch1 | `form: AddOnesNumeric` | Generator's fixed prompt is `'{a} + {d} = ?'`, single addend d∈[1,9]. New content is a chained three-jump prompt (60+5+5+5). |

(g2p-03-01, g2p-03-04, g5l-03-01, mmt-05-02, and rno-04-02 carried no `variant` key on any
touched step; none removed there.)

## Per-row detail

### 1–4. arrays-even-odd-g2 (4 rows)

- **g2a-01-02** (`k3 ch1`): `k3`'s mcq was byte-identical to `k1`'s "Which of these numbers is
  even?" (24/13/27/29 vs 28/29/27/11 — a pure operand swap). Redesigned as a word problem asking
  for the **odd** number among four 3-digit options (133 correct; 128/150/246 even traps),
  transferring the ones-digit rule past 2-digit recognition. `ch1`'s `oddEvenPairs` was
  template-identical to `k2`'s "Is 11 odd or even?" (mode=pair, n only). Redesigned with
  `mode=onesDigit` on a 3-digit real-world number (126 chairs), applying the abstract rule from
  `c2`/`i2` instead of repeating `k2`'s concrete small-`n` pairing.
- **g2a-02-02** (`ch1`): `ch1`'s numeric widget was byte-identical to `k2` ("Two rows made 12.
  Add the third row: 12 + 6 = ?" → 18). Redesigned as an independent full computation on a fresh
  4×7 array (7+7+7+7=28), no partial total supplied.
- **g2a-02-03** (`ch1 k2`): `k2` was template-identical to `k1` ("Counting by columns: N columns
  made M. Add the last column: M + P = ?", operands only changed). Redesigned as an independent
  4×5 sum (20). `ch1` was byte-identical to `k1`. Redesigned as a 5-column array where 3 columns
  already total 18 and the two remaining columns must be added (18+6+6=30) — a two-step
  extension beyond `k1`'s one-column continuation.
- **g2a-03-03** (`k3 ch1`): `k3` byte-identical to `k1` ("Maggie plants 4 rows of 4 seedlings.
  The first 3 rows hold 12. So 12 + 4 = ?" → 16). Redesigned as an independent 4×6 marigold-row
  sum (24). `ch1` was template-identical to `k1` (3 rows of 5, operands only changed).
  Redesigned as a 5-row array with a 21 m partial total and two remaining rows to add
  (21+7+7=35).

### 5–7. length-problems-g2 (3 rows)

- **g2p-02-02** (`ch1 k2`): `k2` was template-identical to `k1` ("N + M = ? (the third leg joins
  the first two legs of A m, B m, and M m)"). Redesigned as an independent 3-leg sum
  (15+12+9=36). `ch1` was byte-identical to `k1`. Redesigned as a 5-leg hike: 3 legs already
  total 40 m, add the remaining two (15 m, 9 m): 40+15+9=64.
- **g2p-03-01** (`k3`): `k3`'s mcq was byte-identical to `k1`'s "whole minus known part → mystery
  piece" bar model. `k3`'s own pre-existing `explanationVariants` ("Stacked bars ask for sums." /
  "The drawing sets the operation.") already named the intended, never-implemented job: a
  **stacked-bars sum** rather than `k1`'s whole-minus-part **difference**. Implemented that:
  "two bars placed end to end: a 26 cm piece, then a 17 cm piece. What is the total length ...
  stacked together?" (43), with options recomputed to target the add-vs-subtract and
  ignore-a-piece misconceptions.
- **g2p-03-04** (`k3`): `k3`'s mcq was byte-identical to `k1`'s "two legs give an impossibly
  small total → reject it" sense-check (32/25/30). Redesigned as the complementary case:
  confirm a **correct**, larger total is reasonable (18+24=42 — bigger than either single leg),
  targeting the opposite misconception (assuming any total must be suspicious, or that legs
  "can't" be added).

### 8. number-line-g2 (1 row)

- **g2l-01-02** (`ch1`): `ch1`'s numeric widget was byte-identical to `k2` ("40 + 5 = ? (the
  next mark when marks sit every 5)" → 45). Redesigned as a chained three-jump capstone
  ("Marks sit every 5, starting at 60. After three jumps, what mark do you land on?" → 75),
  escalating from `k2`'s single next-mark job.

### 9. long-division-g5 (1 row)

- **g5l-03-01** (`ch1 i2`): `i2`'s `estimateSlider` was template-identical to `i1` (same
  "N×D=P overshoots the A available — slide to what M×D gives" wording, operands only changed).
  Redesigned so `i2` now asks for the resulting **remainder** after the corrected digit is
  applied (119−104=15), instead of re-finding the corrected **product** (`i1`'s job) — tying
  directly into `c2`'s "never a negative remainder" teaching point. `ch1`'s mcq was
  byte-identical to `k1`'s "you overshot with digit 4 — what now?" (a react-to-a-given-overshoot
  question). Redesigned as a capstone requiring the learner to evaluate **four candidate trial
  digits** (5, 6, 7, 8) against 217÷34 directly and pick the maximal one that fits (6), rather
  than react to a single pre-flagged overshoot.
- Quotient/remainder arithmetic hand-verified for every numeric step in the lesson, touched and
  untouched: `i1` 4×24=96 (overshoot)/3×24=72 (fits, remainder 16); `i2` 5×26=130
  (overshoot)/4×26=104 (fits, remainder 15, 15<26); `k2` 8×23=184; `k3` 468÷26=18 exactly
  (26×18=468); `ch1` 34×5=170 (remainder 47≥34, too low), 34×6=204 (remainder 13<34, correct),
  34×7=238 and 34×8=272 (both overshoot 217).

### 10. measure-money-time (1 row)

- **mmt-05-02** (`i2`): `i2`'s `graphRead` prompt text was byte-identical to `i1`'s
  ("Follow the top of the bar across to the scale. Tap the number it reaches.") — an all-text
  instruction with no embedded numbers, so `i2`'s taller bar (`drawn:9` vs `i1`'s `drawn:6`)
  alone still left the *prompt string* an exact duplicate. Reworded the prompt and swapped the
  scenario context (`categoryLabel`/`unitNoun`/`unitNounPlural` from a votes scenario to a books
  scenario), giving `i2` a distinct context on top of its already-distinct bar height.

### 11. rational-number-operations (1 row) — PARTIAL_FIX

- **rno-04-02** (`i3 ch1 k2 k3`):
  - `i3` was byte-identical to `k1` ("-4.1 + (-2.9) = ?" → -7). `i3` sits directly under `c3`
    ("line up the decimal points carefully ... a common way to get the magnitude wrong") and its
    own `body` already says "Careful decimal alignment." — implemented that stated-but-unbuilt
    job: `-4.1 + (-2.85)` (unequal decimal lengths, -6.95), with a new misalignment-specific
    trap (4.1 misread as 4.01 → -6.86) plus the same-sign-add-not-subtract trap (-1.25), and a
    reworded sentence so the surface text no longer matches `k1`'s.
  - `k3` was template-identical to `i2`/`ch1` ("P − (−Q) = ?", operands only differed). Reworded
    as a word-to-symbol translation job — "What do you get when you subtract −0.35 from 0.55?"
    (0.9) — with fresh operands and recomputed traps.
  - `ch1` was byte-identical to `i2` ("3.25 - (-1.5) = ?" → 4.75). Redesigned around unequal
    decimal lengths forcing alignment ("6.4 - (-1.75) = ?" → 8.15), with an explicit
    "different lengths" framing, a misalignment trap (6.4 misread as 6.04 → 7.79), and the
    sign-flip trap (4.65).
  - `k2` was reviewed and **left unedited**. The row's `step_path` names it, and its own operand
    pair (-4.1, -2.9) is identical to `k1`'s with only the operator flipped (+ → −). Under this
    packet's own scripted normalized-duplicate scan, however, `k2`'s template
    (`-#.# - (-#.#) = ?`) is distinct from every other step's template in the lesson (`k1`/`i3`
    are `-#.# + (-#.#) = ?`; `i2`/`k3`/`ch1` are variants of a positive-minuend subtraction).
    `k2` is the lesson's only negative-minuend "subtract a negative" case, produces a different
    sign outcome (-1.2, still negative — contrast `i2`/`ch1`'s positive results), and carries a
    fully distinct trap set (mirror-image of `k1`'s: `-7` and `1.2` vs. `k1`'s `7` and `-1.2`).
    This reads as deliberate compare-and-contrast pedagogy (same operands, contrasted operators
    isolating the sign rule) rather than a duplicated question job, so it does **not** reproduce
    as this defect class from current source. Recorded NOT_REPRODUCIBLE; no edit made, per
    instruction ("stale queue signal ≠ source defect — if not reproducible, record
    NOT_REPRODUCIBLE with evidence, no edit").
  - Every sign rule hand-verified: `i3` -4.10−2.85 magnitude 6.95, both negative → -6.95;
    `k3` 0.55+0.35=0.9; `ch1` 6.4+1.75=8.15; `k2` (unchanged) -4.1+2.9=-1.2, re-verified correct
    as authored.

## Gates run (per touched lesson)

- JSON parse-clean (`python3 -c "json.load(...)"`).
- Scripted normalized-duplicate scan (digit-collapse `#`) over every `widget.prompt` and
  `predict.prompt` in the lesson, before and after edits — all 11 lessons scan clean (no exact
  or normalized-template duplicates) after the fixes above.
- `trap != answer` and `trap != trap` for every `commonErrors`/mcq-option set touched.
- mcq correct-first preserved on every mcq edited (`options[0].correct === true`).
- Feedback strings on every touched option/trap ≥25 chars, none negation-opening, all
  arithmetically true (hand-verified, shown per row above).
- Widget-integrity rules from `src/lib/schema.ts` respected: `oddEvenPairs` answer-slot
  discipline (the answer's own feedback slot absent, the wrong-parity slot present) and mode/`n`
  ranges (pair ≤20, onesDigit ≥10); `estimateSlider` continuous-mode bound
  `0 < min < target < max` and `max/min ≥ 4`.
- Step/option `id`, `conceptTag`, and widget `type` unchanged on every edited step. No figure
  bindings touched (all 11 rows had empty `current_figure_id`). `remedials` blocks (present in
  several of these lessons as a separate remediation pathway, not part of the assessed
  progression) left untouched throughout.

`npm`/`vitest`/`tsc` were not run, per instruction. An independent assessor should re-run the
project's own normalized-duplicate/parse/widget-integrity checks against the 11 files listed in
`reports/closure/cowork-staging/laneA-s318-prog.jsonl` before closing the queue rows.
