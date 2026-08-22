# S329 Fix Packet PGB — LESSON_PROGRESSION_AND_DUPLICATION (25 lessons, 4 courses)

Fixer: `cowork-s329-PGB-fixer`. Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>`
under workstream `LESSON_PROGRESSION_AND_DUPLICATION` for exactly the 25 lessons assigned this lane:

- **proportional-relationships (9):** `pr-02-01`, `pr-02-02`, `pr-02-03`, `pr-03-01`, `pr-03-02`,
  `pr-03b-01`, `pr-04-01`, `pr-04-03`, `pr-04b-01`
- **length-problems-g2 (6):** `g2p-01-01`, `g2p-01-03`, `g2p-02-01`, `g2p-02-03`, `g2p-03-02`,
  `g2p-03-03`
- **decimals-place-value (5):** `dpv-01-03`, `dpv-02-02`, `dpv-03-01`, `dpv-04-01`, `dpv-04-02`
- **functions-g8 (5):** `fg-01-02`, `fg-02-01`, `fg-02-02`, `fg-03-02`, `fg-04-01`

Standard for non-duplication judgment: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(R1–R6 distinctness discipline, applied to ordinary lesson-step repeats rather than the
remedial-vs-`k1` defect class it was originally ruled on). Detector reproduced verbatim from
`scripts/audit/consolidate-pending-workload-s236.mjs` lines 358–393 (per-lesson widget/prompt/template
collision scan: `repeatedWidgets` on `stable()`-serialized widget signature, `repeatedPrompts` on exact
prompt string, `repeatedTemplates` on digit-normalized template equality —
`item.prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ")`, matching the
source exactly) into a standalone `node` script and run against every lesson's **live, current** JSON,
both before any edit and again after, never guessed by eye. Every one of this lane's 25 rows is a
`repeatedTemplates`-only (P1) collision — same sentence shape, different numbers, never a verbatim
widget/prompt repeat (those P0 cases were already cleared by an earlier wave).

**Outcome: 8 lessons redesigned, 17 lessons kept as-is (no edit).**

## Method

For every lesson: (1) ran the detector script against the live file and grouped every `repeatedTemplates`
id by its normalized template, printing the full widget content (prompt, answer/claim, commonErrors or
options) for every member of every colliding group, not just the flagged ids — first occurrences are
structurally exempt by the detector's own logic but are needed to see what the flagged id is actually
being compared against; (2) cross-referenced each flagged id's step `kind` (`concept` / `interactive` /
`check` / `challenge` / `recap`) against `engine.ts`'s scoring model, in which `challenge` steps are
graded and worth 2× XP while `interactive` steps are ungraded formative practice; (3) judged each
colliding group on its merits against R1–R6: does the group differ only in the literal numbers plugged
into an unchanged action/representation/constraint (illegitimate — the challenge tier in particular
should escalate, not restate), or does it carry a genuine difference in number type, representation,
constraint, misconception target, or transfer demand that the crude digit-blind regex cannot see
(legitimate spaced/varied practice, no edit needed)? (4) where genuine, redesigned the offending step's
action/representation/constraint (never just its numbers) and independently re-verified the new
arithmetic in Python before writing it; (5) re-ran the detector against the edited file to confirm the
specific collision closed; (6) ran the two required gates plus every targeted test file that scopes
over the edited lesson's course.

**A pattern emerged across almost every redesign candidate**: the collision sits at the `challenge`
step, but the `challenge` step's own body text often *claims* an escalation ("a steeper multistep
problem", "a trickier check") that the actual computation never delivers — same action, same
representation, only bigger numbers. That mismatch between billed difficulty and actual demand is the
single clearest signal used to decide "genuine missed opportunity" vs. "legitimate repeated practice"
across all 8 redesigns below. Correspondingly, of the 17 kept lessons, only 4 have their `challenge`
step among the flagged ids at all (`pr-03-01`, `dpv-02-02`, `dpv-03-01`, `fg-02-02`) — in every one of
those 4, close reading showed the challenge step already carries a genuine escalation the normalizer
cannot see (decimal-vs-fraction rate, wider place-value span, a harder decimal-comparison trap, a
negative-coordinate sign-handling case), so no further change was warranted there either.

---

## Category A — Redesigned (8 lessons)

### `pr-02-01` (proportional-relationships) — `ch1`

**Queue evidence:** `repeatedTemplates=[ch1]` (post-P0-cleanup), colliding with `i1/k1/i2/i3/k2/k3` on
template `"a table has pairs (#, #), (#, #), (#, #). is this proportional?"`.

**Before:** `"A table has pairs (2, 10), (4, 20), (6, 30). Is this proportional?"` — a trivial
proportional:yes case (constant ratio 5), mechanically identical in task and difficulty to the
preceding `check` steps.

**After:** `"A table has pairs (4, 3), (8, 6), and (12, 8) — check every ratio, not just the first two,
before deciding. Is this proportional?"` — a proportional:**no** case where the first two ratios agree
(3/4, 3/4) but the third breaks the pattern (8/12 = 2/3 ≠ 3/4).

```
-        "prompt": "A table has pairs (2, 10), (4, 20), (6, 30). Is this proportional?",
+        "prompt": "A table has pairs (4, 3), (8, 6), and (12, 8) — check every ratio, not just the first two, before deciding. Is this proportional?",
...
-            "label": "Yes, every ratio is 5",
-            "claim": "proportional:yes"
+            "label": "No, the last ratio doesn't match",
+            "claim": "proportional:no"
```

**Why this is genuine:** the original ch1 tested exactly the same "compute three ratios, see they
match" recognition as the surrounding checks. The redesign targets a specific, different misconception
— stopping the ratio check after two agreeing pairs instead of checking every pair — that no other step
in the lesson exercises (the lesson's other flagged ids, `k1/i2/i3/k2/k3`, are a legitimate graduated
practice arc for a first-encounter recognition skill spanning both yes- and no-cases at varied whole-
number ratios; only `ch1` needed to change). Verified in Python: 3/4 = 0.75, 6/8 = 0.75, 8/12 ≈ 0.667.

**Variant dropped:** `{gen:"pr-test-proportional-g7", form:"proportionalChallenge"}` removed. Read
`src/lib/variants.ts` (~L34933–34948): that generator/form only ever emits `proportional:yes` cases, so
it can never reproduce this not-proportional shape; keeping the tag would have let a replay silently
regenerate the old colliding yes-case.

**Verified:** detector re-run on the edited file — `ch1` no longer appears in `repeatedTemplates`.
`reviewedBasisHash` (post-edit): `898d312c27cfb435baa96ae12664da0391f2cfefa9e3ef5ee092f88dfd66bde9`.

### `pr-02-03` (proportional-relationships) — `ch1`

**Queue evidence:** confirmed directly against the original committed file (`git show HEAD:...`, run
through the detector before touching anything): `ch1` (challenge) collided with `i3` (interactive) on
template `"a table has pairs (#, #), (#, #). using the constant of proportionality, what is y when x =
#?"` — `i3` (integer k=7, x=5→y=35) and `ch1` (integer k=8, x=6→y=48) used the identical 2-pair-table,
derive-integer-k-then-predict-y shape. A graded `challenge` step repeating an ungraded `interactive`
step's exact task with no escalation.

**Before:** `"A table has pairs (1, 8), (2, 16). Using the constant of proportionality, what is y when
x = 6?"`, k = 8 (whole number), answer 48.

**After:** `"A table has pairs (2, 5) and (4, 10) — this time the constant of proportionality isn't a
whole number. Using it, what is y when x = 6?"`, k = 2.5, answer 15.

```
-        "prompt": "A table has pairs (1, 8), (2, 16). Using the constant of proportionality, what is y when x = 6?",
+        "prompt": "A table has pairs (2, 5) and (4, 10) — this time the constant of proportionality isn't a whole number. Using it, what is y when x = 6?",
...
-            "value": 14,
+            "value": 8.5,
-            "value": 6,
+            "value": 6,
```

**Why this is genuine:** every other derive-k-then-predict-y item in this lesson (and the preceding
check) used an integer k; the redesign forces division into a non-integer quotient (5/2 = 2.5) and
carrying a decimal through multiplication — a materially different arithmetic/error-monitoring demand
from integer-k division, not just bigger numbers. Verified in Python: 5/2 = 2.5, 10/4 = 2.5 (consistent
k), 2.5 × 6 = 15. New traps 8.5 (adds instead of multiplying: 2.5+6) and 6 (echoes x) both ≠ 15.

**Variant dropped:** `{gen:"pr-constant-k-g7", form:"constantApply"}` removed. Read
`src/lib/variants.ts` (~L34996–35013): that generator only draws integer k ∈ [2,9]; it cannot
reproduce a fractional-k item.

**Verified:** detector re-run — `ch1` no longer collides with any sibling step.
`reviewedBasisHash` (post-edit): `6f0a7c6e7362fdd1d1b1b4aa51d1b282552926599c096348d706895169dc2d62`.

### `pr-03-02` (proportional-relationships) — `ch1`

**Queue evidence:** confirmed against the original committed file: `ch1` was a direct member of the
4-way group `[i2, i3, k3, ch1]` sharing template `"the graphed point (#, #) represents a proportional
relationship. what is the unit rate?"` — same whole-number-rate demand as `i2`/`i3`/`k3`, no
escalation.

**Before:** `"The graphed point (8, 24) represents a proportional relationship. What is the unit
rate?"`, rate = 3 (whole number).

**After:** `"The graphed point (4, 6) represents a proportional relationship, but this time the unit
rate isn't a whole number. What is the unit rate?"`, rate = 1.5.

```
-        "prompt": "The graphed point (8, 24) represents a proportional relationship. What is the unit rate?",
+        "prompt": "The graphed point (4, 6) represents a proportional relationship, but this time the unit rate isn't a whole number. What is the unit rate?",
...
-            "value": 16,
+            "value": 2,
-            "value": 8,
+            "value": 4,
```

**Why this is genuine:** forces reading a non-integer quotient off the graph (6/4 = 1.5) instead of a
clean whole-number division — a different estimation/arithmetic demand than every other unit-rate item
in the lesson. Verified in Python: 6/4 = 1.5. New traps 2 (rounds the rate) and 4 (echoes the
y-coordinate) both ≠ 1.5.

**Variant dropped:** `{gen:"pr-graph-rate-g7", form:"graphRateRead"}` removed. Read
`src/lib/variants.ts` (~L35075–35101): that generator only draws integer k ∈ [3,10]; it cannot
reproduce a fractional-rate item.

**Verified:** detector re-run — `ch1` no longer collides with any sibling step.
`reviewedBasisHash` (post-edit): `3fd428f10208d417daa58aa9ae025ee22a3df651aab747ee18e2b99f58e604f6`.

### `pr-04-03` (proportional-relationships) — `ch1`

**Queue evidence:** confirmed against the original committed file: `ch1` was a direct member of the
3-way group `[k1, k3, ch1]` sharing template `"a price rises from # to #. what is the percent
change?"` (a separate `[i2, i3, k2]` group on the "falls" template exists elsewhere in the lesson but
does not involve `ch1`). `ch1`'s body text ("A full multistep problem") asserted an escalation the
arithmetic never delivered — same forward percent-change computation as `k1`/`k3`, just bigger
numbers.

**Before:** `"A price rises from 75 to 90. What is the percent change?"`, answer 20 (%).

**After:** `"A $40 price rises by 30%. What is the new price?"`, answer 52.

```
-        "prompt": "A price rises from 75 to 90. What is the percent change?",
-        "answer": 20,
+        "prompt": "A $40 price rises by 30%. What is the new price?",
+        "answer": 52,
...
-            "value": 15,
-            "feedback": "15 is the raw change, not the percent. Divide by the ORIGINAL: 15÷75×100 = 20%."
+            "value": 12,
+            "feedback": "12 is just the increase, not the new price. Add it back to the original: 40 + 12 = 52."
-            "value": 16.67,
+            "value": 70,
+            "feedback": "That treats 30% as $30. Find 30% of 40 first (12), then add: 40 + 12 = 52."
```

**Why this is genuine:** the redesign inverts the task from "given before/after, find the percent" to
"given the original and the percent, find the new total" — and specifically manufactures the
increase-vs-new-total confusion (`commonErrors` 12 = just the increase; 70 = treats 30% as a flat $30)
that neither `k1` nor `k3`'s forward percent-of-change computation ever isolated. Verified in Python:
40 × 0.30 = 12, 40 + 12 = 52, 40 + 30 = 70; all three trap/answer values pairwise distinct. No `variant`
field was present before or after (step was already static-authored), so no generator-compatibility
concern applies.

*Note on process:* the file's on-disk `ch1` content shifted once mid-session (a concurrent
background-regeneration process touching this shared repo) between an early read and the final edit;
the edit script always re-read the file fresh immediately before writing, so the applied diff (shown
above, `git diff`-verified) reflects the actual before/after state that landed, not a stale read.

**Verified:** detector re-run — `ch1` no longer collides with `k1` or `k3`.
`reviewedBasisHash` (post-edit): `fba1e3c0f3c9d154a96e56967c60c5b7c0a6639d35e53f17a2d7dabc7159b244`.

### `g2p-01-01` (length-problems-g2) — `ch1`

**Queue evidence:** confirmed against the original committed file: `ch1` collided with `k1`, template
`"the garden hose measures # cm and the watering can cord measures # cm. how much longer is the garden
hose?"` — identical two-quantity subtraction shape, differing only in the two lengths.

**Before:** `"The garden hose measures 54 cm and the watering can cord measures 28 cm. How much longer
is the garden hose?"`, answer 26 — a plain two-quantity subtraction.

**After:** `"A garden hose measures 54 cm, a jump rope measures 40 cm, and a watering can cord measures
28 cm. How much longer is the garden hose than the SHORTEST of the other two?"`, answer 26 (unchanged
final value, new task).

```
-        "prompt": "The garden hose measures 54 cm and the watering can cord measures 28 cm. How much longer is the garden hose?",
+        "prompt": "A garden hose measures 54 cm, a jump rope measures 40 cm, and a watering can cord measures 28 cm. How much longer is the garden hose than the SHORTEST of the other two?",
...
-            "value": 82,
-            "feedback": "That joined the two lengths..."
+            "value": 14,
+            "feedback": "That compared the garden hose to the jump rope (40 cm) — the SHORTEST of the other two is the watering can cord (28 cm). 54 − 28 = 26."
```
(82 — the join-instead-of-subtract trap — was kept as the second `commonError`, reordered.)

**Why this is genuine:** adds a third length and a comparison/selection step (find the shortest of two
candidates) *before* the subtraction — a grade-2-appropriate but genuinely new demand no two-quantity
item in the lesson requires. The 40 cm jump rope survives in the redesign specifically as a
same-shape distractor (54−40=14, the wrong-quantity-selected trap), which only exists because of the
new three-quantity structure. `cml` block preserved verbatim (unaffected).

**Variant dropped:** the `g2-measure-money-time`/`g2-add-subtract-100` forms registered for this lesson
only produce two-quantity difference prompts; none select-then-subtract among three, so the tag was
removed to prevent a replay from reverting the fix.

**Verified:** detector re-run — `ch1` no longer collides with any sibling step. Fixed the resulting
break in `src/lib/session194.lengthProblems.test.ts` (see Gates below).
`reviewedBasisHash` (post-edit): `514d481634e264100521c9ef736f30176e4a4def7a10c5bf42952ce03dcb13b6`.

### `g2p-02-01` (length-problems-g2) — `ch1`

**Queue evidence:** confirmed against the original committed file: `ch1` was a direct member of the
3-way group `[k1, k2, ch1]` sharing template `"# + # = ? (the two ribbon pieces joined end to end, in
cm)"` — identical two-addend sum shape, differing only in the two addends.

**Before:** `"25 + 23 = ? (the two ribbon pieces joined end to end, in cm)"`, answer 48.

**After:** `"25 + 23 + 15 = ? (three ribbon pieces joined end to end, in cm)"`, answer 63.

```
-        "prompt": "25 + 23 = ? (the two ribbon pieces joined end to end, in cm)",
-        "answer": 48,
+        "prompt": "25 + 23 + 15 = ? (three ribbon pieces joined end to end, in cm)",
+        "answer": 63,
...
-            "value": 2,
+            "value": 48,
+            "feedback": "That only added two of the three pieces — all three ribbon pieces join end to end: 25 + 23 + 15 = 63."
-            "value": 58,
+            "value": 73,
```

**Why this is genuine:** adds a third ribbon piece, requiring a second addition/regrouping step
(25+23=48, then +15=63) that a two-addend sum never exercises; the new primary trap (48) specifically
catches stopping after the first two pieces. Verified in Python: 25+23+15=63.

**Variant dropped:** the registered `g2-add-subtract-100` forms for this lesson only produce two-addend
sums; none three-addend.

**Verified:** detector re-run — `ch1` no longer collides. `session194.lengthProblems.test.ts` fixed (see
Gates). `reviewedBasisHash` (post-edit): `2e379c4f05081f51071d4ee5d11e6fcaedd8ff3095583f5816fb00f7ce07a5b5`.

### `g2p-03-02` (length-problems-g2) — `ch1`

**Queue evidence:** same defect shape as `g2p-02-01` — confirmed against the original committed file:
`ch1` collided with `k2` alone, same `"# + # = ? (the two ribbon pieces joined end to end, in cm)"`
template.

**Before:** `"26 + 21 = ? (the two ribbon pieces joined end to end, in cm)"`, answer 47.

**After:** `"28 + 15 + 9 = ? (three ribbon pieces joined end to end, in cm)"`, answer 52.

```
-        "prompt": "26 + 21 = ? (the two ribbon pieces joined end to end, in cm)",
-        "answer": 47,
+        "prompt": "28 + 15 + 9 = ? (three ribbon pieces joined end to end, in cm)",
+        "answer": 52,
...
-            "value": 5,
+            "value": 43,
+            "feedback": "That only added two of the three pieces — all three ribbon pieces join end to end: 28 + 15 + 9 = 52."
-            "value": 57,
+            "value": 62,
```

**Why this is genuine:** same reasoning and same third-piece structure as `g2p-02-01`, kept consistent
across the course since both lessons share the underlying addition-of-lengths skill. Verified in
Python: 28+15+9=52.

**Variant dropped:** same reason as `g2p-02-01` — no registered form produces a three-addend sum.

**Verified:** detector re-run — `ch1` no longer collides. `session194.lengthProblems.test.ts` fixed (see
Gates). `reviewedBasisHash` (post-edit): `5e5496f7f171e6b96d87061c884f7b7aba2521a7e89cd12c8507f6554b3a2d89`.

### `g2p-03-03` (length-problems-g2) — `ch1`

**Queue evidence:** confirmed against the original committed file: `ch1` was a direct member of the
3-way group `[k1, k2, ch1]` sharing template `"maggie had # cm of ribbon, used # cm on a bow, then
bought # cm more. how much ribbon now?"` — identical two-step "used-then-bought" narrative shape,
differing only in the numbers.

**Before:** `"Maggie had 60 cm of ribbon, used 22 cm on a bow, then bought 30 cm more. How much ribbon
now?"`, answer 68 (order: use, then buy).

**After:** `"Maggie had 50 cm of ribbon. She bought 25 cm more, then used 18 cm on a bow. How much
ribbon now?"`, answer 57 (order: buy, then use).

```
-        "prompt": "Maggie had 60 cm of ribbon, used 22 cm on a bow, then bought 30 cm more. How much ribbon now?",
-        "answer": 68,
+        "prompt": "Maggie had 50 cm of ribbon. She bought 25 cm more, then used 18 cm on a bow. How much ribbon now?",
+        "answer": 57,
...
-            "value": 38,
+            "value": 75,
+            "feedback": "The story has a second step — the 18 cm used on the bow still comes out after the ribbon is bought."
-            "value": 52,
+            "value": 43,
+            "feedback": "The steps ran backward: the purchase ADDS ribbon, and the bow TAKES it away."
```

**Why this is genuine:** reorders the two-step trade so the purchase happens *before* the cut, reversing
the event order every sibling step in the lesson shares — targets the misconception that word-problem
operations must be applied in the order quantities are mentioned, rather than by what each event
actually does to the total. A genuinely different reasoning demand, not a numeric restatement. Verified
in Python: 50+25=75, 75−18=57.

**Variant dropped:** the registered `g2-add-subtract-100` forms for this lesson only produce the
use-then-buy order; none buy-then-use.

**Verified:** detector re-run — `ch1` no longer collides. `session194.lengthProblems.test.ts` fixed (see
Gates). `reviewedBasisHash` (post-edit): `9c44fa048d456742ca7e1bcff903d113053f3a1fd7597110b13042e7c0da8237`.

---

## Category B — Kept as-is, no edit (17 lessons)

For each, the table gives the flagged step(s), the step kind(s) involved, and why the repeat is
legitimate under R1–R6 — grounded in a fresh read of the actual widget content on both sides of every
collision (not just the prompt text), reproduced against the live files at report time.

### proportional-relationships (5 kept)

| Lesson | Flagged | Why kept |
|---|---|---|
| `pr-02-02` | `i2`,`k2` (interactive/check, constant-of-proportionality); `k3` (check, predict-y) | First group: `k1` derives an integer k=6; `i2` (MCQ) derives a fractional k=3/4 with the correct answer stated as a fraction against an inverted-ratio distractor "4/3" (targets the numerator/denominator-flip misconception directly); `k2` derives another fractional k=3/5 as free-response. Genuine progression from integer to fractional-k, and from MCQ recognition of an inversion trap to free-response production — not a bare restatement. Second group: `i3`→`k3` is an ordinary interactive-then-check consecutive reinforcement of a freshly-taught apply-the-constant skill (k×x=y), the standard practice-tier pattern; neither is the challenge step, and `ch1` is not flagged at all. |
| `pr-03-01` | `k1` (check); `i3`,`k2` (interactive/check); **`ch1`** (challenge) | `ch1` is the interesting case: `k3` plots a **decimal rate 1.5 (>1, steep)**, `ch1` plots a **fraction rate 2/3 (<1, shallow)** — a genuinely different, harder case (proper-fraction unit rate is a well-documented harder case than a rate exceeding 1) with a representation shift from decimal to fraction notation. The digit-normalizer can't see rate magnitude or notation type, only that both prompts share the sentence shape. The other two flagged groups (`k1` vs `i1`, both plot 3 points for a given k; `i3`/`k2` vs `i2`, all plot 2 points for a given k) are ordinary varied-slope practice at the interactive/check tier — `k1`'s k=1 is also the special multiplicative-identity case (every point has x=y), a legitimately distinct edge case from `i1`'s ordinary k=2. |
| `pr-03b-01` | `i2` (interactive) | `i1` and `i2` are both ungraded interactives, but are **not adjacent** — a full concept (`c2`) and two checks (`k1`,`k2`) sit between them. This is spaced retrieval practice of the same recognition skill after new material was introduced in between, not back-to-back redundant duplication. Neither step is graded or the challenge tier. |
| `pr-04-01` | `k2`,`k3` (check) | Both flagged groups are check-tier percent-of-total drills (tip and tax) at different percentages (8% vs 25%; 6% vs 5%) reinforcing a freshly-taught skill; `k3`'s 25% also affords the "quarter" mental-math shortcut that `k1`'s 8% does not, a mild but real strategy difference. Neither collision reaches the challenge tier (`ch1` is not flagged). |
| `pr-04b-01` | `i2` (interactive) | `i1`/`i2` are both **ungraded** `percentBar` manipulative-shading tasks (drag-to-shade a percent of a loan amount), at different amounts and percentages. Multiple reps of a spatial/manipulative UI skill are standard ungraded practice design in this app, not a graded repeat. |

### length-problems-g2 (2 kept)

| Lesson | Flagged | Why kept |
|---|---|---|
| `g2p-01-03` | `k2` (check) | `k1`/`k2` are both grade-2 ruler-reading subtraction checks at different mark positions (2→9cm vs 5→10cm). Reading a ruler accurately across many different placements *is* the grade-2 learning objective — this only generalizes with varied practice. `g2p-01-03`'s own `ch1` is not flagged at all (unrelated to `g2p-01-01`'s `ch1`, a different lesson in this course redesigned above — same step id, two separate lessons). |
| `g2p-02-03` | `k2` (check) | `k1`/`k2` are both "how many meters remain" subtraction word problems at different totals (66−36 vs 57−35), each with its own off-by-a-borrow trap. Standard varied-number check-tier retrieval practice for a 2nd-grade subtraction word-problem skill; challenge tier not involved. |

### decimals-place-value (5 kept)

| Lesson | Flagged | Why kept |
|---|---|---|
| `dpv-01-03` | `k3` (check) | `k1` divides a **whole number** by 10 (5÷10=0.5); `k3` divides an **already-decimal** number by 10 (0.5÷10=0.05) — a genuinely harder case (the decimal point shifts through an existing fractional part, landing on a leading zero). `k3`'s own listed trap ("0.5 is unchanged...") specifically targets the "decimals don't shift further" misconception that `k1`'s whole-number case cannot even pose. Distinct target misconceptions, not a magnitude restatement. |
| `dpv-02-02` | **`ch1`** (challenge) | `k2` sums **adjacent** place values (2/10 + 4/100, tenths+hundredths). `ch1` sums **non-adjacent** place values, skipping a place (3/10 + 9/1000, tenths+thousandths), which requires correctly writing a zero in the empty hundredths column (0.309, not 0.39 — `ch1`'s own primary trap is exactly 0.39). A real escalation in place-value span that the crude "which decimal equals #+#?" template cannot see. |
| `dpv-03-01` | `k1`,`k2`,`i2` (check/interactive); **`ch1`** (challenge) | The fullest cluster in this packet: five "which is greater" items form a deliberately escalating sequence of *distinct* decimal-comparison misconceptions — `i1` (0.6 vs 0.4, different tenths digit, easy), `k1` (0.35 vs 0.38, same length, tie broken at hundredths), `k2` (0.7 vs 0.68, **different lengths, the shorter number is bigger** — the classic "more digits = bigger" trap), `i2` (0.52 vs 0.5, different lengths via a trailing zero, tie broken at hundredths), `ch1` (0.409 vs 0.41, **three decimal places with an embedded zero**, the sharpest version of the length trap — 0.409 looks larger but is smaller). Each targets a specific, different known error pattern; the shared "which is greater: # or #" template strips exactly the digit-length and digit-content information that carries the real pedagogical differentiation. This is the best-designed cluster found in this lane's scope. |
| `dpv-04-01` | `k2` (check) | `k1` rounds an ordinary, unambiguous case (3.8→4). `k2` rounds the **exact midpoint** (0.5→1) — the canonical round-half-up boundary case, a genuinely distinct and harder skill than ordinary non-tie rounding (same class of "boundary vs. interior" distinction as the `ee-05-01` precedent in `S327_FIX_PG6.md`). |
| `dpv-04-02` | `k3` (check) | Same boundary-case pattern as `dpv-04-01`: `k1` rounds an unambiguous case (0.78→0.8); `k3` rounds another exact midpoint (3.15→3.2, tenths-place tie), plus `k3`'s trap set includes the un-rounded original value itself (3.15) as a "forgot to round" trap that `k1`'s case doesn't need. |

### functions-g8 (5 kept)

| Lesson | Flagged | Why kept |
|---|---|---|
| `fg-01-02` | `i2` (interactive) | `k1` is a **NO** case (repeated input 4 with different outputs — fails the function test). `i2` is a **YES** case where inputs are unique but *outputs* repeat (constant-valued function) — the opposite/complementary misconception (many students wrongly think repeated outputs disqualify a function). `i2`'s own distractors ("No — the output 8 repeats") directly target this. Genuinely different, well-paired misconceptions about the function definition. |
| `fg-02-01` | `k3` (check) | `k1` computes a **positive** rate of change (Δy/Δx = 8/2 = 4). `k3` computes a **negative** rate of change (Δy/Δx = −6/2 = −3, y decreases as x increases) — a genuine sign-handling escalation, the same general shape as the positive-to-negative-coefficient pattern cited as a canonical example of legitimate redesign for this whole workstream (this lesson already has it, unprompted; see `fg-02-02` immediately below, where a related negative-coordinate sign-handling case is also already present). `k3`'s traps (3 = drops the sign; −6 = forgets to divide by Δx) confirm the sign-handling target. |
| `fg-02-02` | **`ch1`** (challenge) | `k2` finds slope between two **all-positive** coordinates ((2,3),(5,12)). `ch1` finds slope between coordinates including a **negative x** ((−1,2),(3,14)), requiring correct handling of subtracting a negative (3−(−1)=4) — real sign-handling escalation even though the final slope value happens to coincide (3 in both cases, which if anything strengthens the design: it prevents the learner from pattern-matching to "a different-looking answer" and forces them to trust the process). |
| `fg-03-02` | `k1` (check) | In `i1`, the table (Function B) grows faster than the equation (Function A); in `k1`, the equation (Function A) grows faster than the table (Function B) — the winner **flips** between the two items, so a learner cannot default to "the table always wins" and must actually recompute and compare both rates each time. A deliberate anti-pattern-matching design, not a rubber-stamp repeat. |
| `fg-04-01` | `i2`,`k2` (interactive/check) | `k1` is a **quadratic** nonlinear pattern (0,1,4,9 — differences 1,3,5). `i2` is an **exponential** nonlinear pattern (2,4,8,16 — differences 2,4,8, ratios constant at ×2). `k2` is a **decreasing linear** pattern (10,8,6,4 — constant difference −2), whose distractor ("Nonlinear — the outputs decrease") targets the common misconception that decreasing automatically means nonlinear. Three genuinely distinct nonlinear/linear cases sharing one comparison-of-differences template. |

---

## Files changed

- `content/courses/proportional-relationships/lessons/pr-02-01.json` — `ch1` redesigned
- `content/courses/proportional-relationships/lessons/pr-02-03.json` — `ch1` redesigned
- `content/courses/proportional-relationships/lessons/pr-03-02.json` — `ch1` redesigned
- `content/courses/proportional-relationships/lessons/pr-04-03.json` — `ch1` redesigned
- `content/courses/length-problems-g2/lessons/g2p-01-01.json` — `ch1` redesigned
- `content/courses/length-problems-g2/lessons/g2p-02-01.json` — `ch1` redesigned
- `content/courses/length-problems-g2/lessons/g2p-03-02.json` — `ch1` redesigned
- `content/courses/length-problems-g2/lessons/g2p-03-03.json` — `ch1` redesigned
- `src/lib/session194.lengthProblems.test.ts` — extended the pre-existing `g2p-02-02` allowlist
  precedent into a `POOL_WITHDRAWN` lookup table, adding the 4 g2p lessons above whose redesigns
  dropped their `variant` tag (see Gates below)
- `reports/closure/cowork-staging/laneA-s329-PGB.jsonl` — 8 new signed dispositions (new file)
- `reports/closure/S329_PROGRESSION_PGB.md` — this report (new file)

No lesson outside this lane's 25-lesson scope was read for write purposes or edited. Three additional
files show as modified in `git status` at the time of this report — none are this lane's changes:

- `src/lib/variants.ts` — a concurrent, unrelated wording-consistency pass by another agent (its diff
  never touches any of this lane's 25 lesson ids or the `k0-count-100` generator implicated in the
  unrelated `variants.resolver.test.ts` failure below), confirmed by inspecting the full diff directly.
- `content/courses/length-problems-g2/lessons/g2p-01-03.json` — a concurrent, unrelated agent reworded
  `ch1`'s surface noun (pencil→ribbon, same ruler-subtraction task) and a widget inside `lesson.remedials`.
  Confirmed this does **not** touch this lesson's `k1`/`k2` in the main `lesson.steps` array — read
  directly: `k1` is still `"A pencil stretches from the 2 cm mark to the 9 cm mark..."` → answer 7,
  byte-identical to what Category B's analysis above is based on. `remedials` is a separate array the
  `repeatedTemplates` detector never scans (`(lesson.steps ?? [])` only), so this concurrent edit cannot
  affect `g2p-01-03`'s PROGRESSION queue row either way.
- `content/courses/length-problems-g2/lessons/g2p-02-02.json` — a concurrent, unrelated agent reworded
  two widget prompts (one in `lesson.steps`, one in `lesson.remedials`) into word-problem framings of the
  same `34+20=54` arithmetic. `g2p-02-02` is **not** one of this lane's 25 lessons; not analyzed above.

## Gate results

| Gate | Result |
|---|---|
| `npm run validate:content` | **1840/1840 files clean** (all 8 edited lessons included) |
| `npm run lint:pedagogy` | **1711/1711 files clean** (all 8 edited lessons included) |
| Live detector (own port of `consolidate-pending-workload-s236.mjs` L358–393), re-run on every edited file | All 8 confirmed: the redesigned step no longer appears in `repeatedTemplates` for its lesson |
| `npx vitest run src/lib/session194.lengthProblems.test.ts` | **12/12 pass** — required a fix: dropping `variant` from the 4 edited g2p `ch1` steps broke this test's unconditional `s.variant.form` access; fixed by extending the file's existing `g2p-02-02` allowlist precedent into a `POOL_WITHDRAWN` table covering the 4 new withdrawals, each with a rationale comment (see diff in `src/lib/session194.lengthProblems.test.ts`) |
| `npx vitest run src/lib/session144.proportional-reasoning.test.ts` | **4/5 pass.** 1 pre-existing failure (`counts only truth-model exploration keys and rejects fabricated bypass state`), unrelated to this lane's work: it operates on a hardcoded literal defined inside the test file itself, with no connection to any lesson content; `git diff --stat` confirms `src/lib/evaluate.ts`, `src/lib/schema.ts`, and this test file are all byte-identical to committed `HEAD` — a pre-existing, already-committed defect, out of scope for this lane |
| `npx vitest run src/lib/variants.resolver.test.ts` | **14/17 pass.** 3 pre-existing failures, all on `k100-02-05.json`/`k3` (`counting-120` course, generator `k0-count-100`) — a lesson and generator with no connection to any of this lane's 25 lessons or edited files. `git diff --stat` confirms `content/courses/counting-120/lessons/k100-02-05.json` and this test file are both byte-identical to committed `HEAD`; the concurrent agent's live edit to `src/lib/variants.ts` (see Files changed) was checked directly and does not touch `k0-count-100` anywhere. Pre-existing, out of scope for this lane |
| Other course-scoped tests checked for relevance (`session261.vis03SingletonClosureB`, `session290.proportionalRelationshipsFigureChoice`, `manipulativeAlongside.s237`) | Confirmed by direct inspection that none reference any step this lane edited (`ch1` in the 8 redesigned lessons); not run, per the container's resource constraint, since they are provably out of scope |

`npm test`, full `vitest`, whole-project `tsc --noEmit`, and `npm run build` were **not** run, per the
container constraint (2 CPU / 7 GB, shared with concurrent work) — verification above ran through the
two required whole-content gates plus targeted, narrowly-scoped `vitest` files only.

## Disposition ledger

Written to `reports/closure/cowork-staging/laneA-s329-PGB.jsonl` (append-only staging, **not** merged
into the main ledger): **8 records**, one per lesson actually edited (`s329-PGB-pr-02-01`,
`s329-PGB-pr-02-03`, `s329-PGB-pr-03-02`, `s329-PGB-pr-04-03`, `s329-PGB-g2p-01-01`,
`s329-PGB-g2p-02-01`, `s329-PGB-g2p-03-02`, `s329-PGB-g2p-03-03`), all `decision:"KEEP"` (per the
closure schema's convention: "this queue row's underlying content defect is now resolved"),
`reviewedBasisHash` set to each lesson's fresh post-edit hash (derived via
`scripts/session/print-review-basis.mjs`, run after all edits landed). The other 17 lessons in this
lane's scope were not edited and therefore receive no fresh disposition from this lane — their
`repeatedTemplates` queue rows remain open in the mechanized queue by design (a known, accepted
limitation: the detector has no way to recognize an intentional repeat, and forcing an artificial edit
onto a legitimate one would make the content worse, not better).

## Summary

| Outcome | Count | Lessons |
|---|---|---|
| Redesigned (Category A) | 8 | `pr-02-01`, `pr-02-03`, `pr-03-02`, `pr-04-03`, `g2p-01-01`, `g2p-02-01`, `g2p-03-02`, `g2p-03-03` |
| Kept as-is, verified legitimate (Category B) | 17 | `pr-02-02`, `pr-03-01`, `pr-03b-01`, `pr-04-01`, `pr-04b-01`, `g2p-01-03`, `g2p-02-03`, `dpv-01-03`, `dpv-02-02`, `dpv-03-01`, `dpv-04-01`, `dpv-04-02`, `fg-01-02`, `fg-02-01`, `fg-02-02`, `fg-03-02`, `fg-04-01` |
| **Total** | **25** | |
