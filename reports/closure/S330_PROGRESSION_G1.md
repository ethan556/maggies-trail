# S330 LESSON_PROGRESSION_AND_DUPLICATION — Queue Packet G1 (exponential-functions)

Reviewer: cowork-s330-G1. Detector: `scripts/audit/consolidate-pending-workload-s236.mjs`
(number-normalized widget-prompt template collision within a lesson). Per the packet brief, a
row only leaves the queue when the flagged step's actual sentence structure stops colliding —
never via a disposition note alone. Several rows below are genuinely, honestly KEPT and will
stay open in the detector; that is the expected, correct outcome for legitimate repeated
practice, not a miss.

---

## exp-01-01 — Evaluating Exponential Functions

**Flagged:** k2, k3.

- **k2** collided with **k1** — both normalize to `"for f(x) = # · #^x, what is f(#)?"` (plain
  evaluate-at-a-point).
- **k3** collided with **i2** — both normalize to `"for f(x) = # · #^x, what is the initial value
  f(#)?"`.

**Decision: REDESIGNED k2. KEPT k3.**

The lesson teaches three sub-skills in order: (A) general evaluate (c1/i1), (B) initial value
f(0)=a (c2/i2), (C) growth is *multiplicative, not additive* — "Exponential outputs grow by
multiplying, not adding" (c3/i3). The check block (k1, k2, k3) is meant to assess all three, but
as authored, k1 and k2 both re-checked skill A verbatim while skill C — the one concept step that
explicitly names a misconception — was never checked at all.

- **Old job (k2):** `exactNumberLab`, "For f(x) = 3 · 2^x, what is f(4)?" — identical job to k1.
- **New job (k2):** hand-authored `mcq`, catch-the-mistake. A student evaluates f(4) for
  f(x)=3·2^x by *adding* 2 four times (3,5,7,9,11) instead of multiplying; the learner must supply
  the correct value. Targets skill C directly.
  - Correct: 48. Verified: 3·2⁴ = 3·16 = 48.
  - Trap "11": the additive-stepping result shown in the prompt (3,5,7,9,11). Verified: 3+2+2+2+2=11.
  - Trap "24": 3·2·4 (exponent-as-extra-factor slip). Verified: 3·2·4=24.
  - All three values distinct; only 48 is correct.
  - `variant: {"gen":"exp-function"}` deleted (hand-authored static widget; the new prompt does not
    match that generator's fixed template).

k3 (initial-value check) reuses i2's shape, but i2 is an *ungraded interactive practice* item and
k3 is its *only* graded check, arriving after two more skill blocks (c3/i3, and k2 now-redesigned)
are taught in between — a standard "practice, then later check" pattern, not laziness. Kept as-is.

**Shared-test fallout (both required a fix — see report footer):** `session181.a1Exponential.test.ts`
counted k2 among 32 `variant`-tagged exactNumberLab steps course-wide;
`session180.expFunction.test.ts` separately froze k2's answer (48) inside its own 16-step ledger and
its 14-step `exp-function`-family completeness count. Both were updated (see footer).

---

## exp-01-02 — Growth vs Decay

**Flagged:** k3.

- **k3** collided with **i2** — both normalize to `"for f(x) = # · (#/#)^x, what is f(#)?"`
  (evaluate a decay function).

**Decision: KEPT (no edit).**

i2 is the ungraded interactive practice for "evaluate a decay function," taught right after c2. k3
is its only graded check, arriving after the check block has already covered two *different* jobs
(k1: classify growth-vs-decay; k2: identify which of three bases decays) — i.e. the check block
covers three distinct jobs (classify, identify-base, evaluate-decay), and k3/i2 sharing a shape is
the ordinary practice→check pattern for the third job, not redundant duplication. No edit made.

---

## exp-01-03 — The Constant Ratio

**Flagged:** k2, k3.

- **k2** collided with **k1** — both normalize to `"in the sequence #, #, #, #, what is the
  constant ratio?"`.
- **k3** collided with **i2** — both normalize to `"the sequence #, #, #, # continues. what is the
  next term?"`.

**Decision: REDESIGNED k2. KEPT k3.**

Same pattern as exp-01-01: three sub-skills taught (A: find the ratio, c1/i1; B: extend by
multiplying, c2/i2; C: constant-difference-is-linear vs constant-ratio-is-exponential, c3/i3 — and
this is literally the lesson's third recap takeaway). k1 and k2 both re-checked skill A verbatim;
skill C, an official recap takeaway, was never checked.

- **Old job (k2):** `exactNumberLab`, "In the sequence 1, 4, 16, 64, what is the constant ratio?"
  — identical job to k1.
- **New job (k2):** hand-authored `mcq`, compare-two-sequences. Given sequence P (3, 9, 27, 81) and
  Q (3, 9, 15, 21), identify which is exponential. Targets skill C via a discrimination action
  distinct from i3's own single-sequence classify MCQ.
  - Verified: P ratios 9/3=27/9=81/27=3 (constant ratio → exponential).
  - Verified: Q differences 9−3=15−9=21−15=6 (constant difference → linear, not exponential).
  - Both sequences deliberately share the same first two terms (3, 9) so the distinction only
    resolves from the third term on, forcing a genuine ratio-vs-difference check.
  - `variant: {"gen":"exp-function","form":"ratio"}` deleted (hand-authored; new prompt shape does
    not match the `ratio` form's fixed template).

k3 (next-term check) reuses i2's shape; i2 is the ungraded practice, k3 its only graded check,
arriving after a full intervening skill block (c3/i3) — practice-then-check, kept as-is.

**Shared-test fallout:** same two files as exp-01-01 (k2 was pinned in both); both updated (see
footer).

---

## exp-03-01 — Solving by Matching Bases

**Flagged:** i2, i3, k2, k3.

All four normalize (along with k1) to `"solve #^x = #."` — a five-way collision (k1 first, then
i2, i3, k2, k3 all flagged as later occurrences of the identical shape).

**Decision: REDESIGNED i2, i3. KEPT k2, k3.**

Unlike exp-01-01/exp-01-03, c2 ("the base can be anything") and c3 ("sometimes the target hides a
clean power") don't introduce distinct sub-skills — they restate the same one procedure
(rewrite k as a power of b) with new flavor text. All three recap takeaways describe that same one
skill. So the real defect wasn't an uncovered skill; it was i2 and i3 contributing *zero* new
value — two ungraded interactives that were byte-for-byte the same question job as k1, with only
the numbers changed, four times over.

- **i2 — old job:** `numeric`, "Solve 5^x = 25." (plain solve, identical to k1's job).
  **New job:** hand-authored `mcq`, catch-the-mistake targeting the classic b^x=k → b·x=k
  (linear) confusion. "A student solves 5^x = 125 by writing 5x = 125, so x = 25."
  - Verified: 125 = 5³ (5·5·5), so correct x = 3.
  - Trap "25": the student's own flawed-method result (125÷5=25). Verified: 125/5=25.
  - Trap "4": 5⁴=625, a plausible off-by-one power. Verified: 5·5·5·5=625≠125.
- **i3 — old job:** `numeric`, "Solve 10^x = 1000." (plain solve, identical to k1's job).
  **New job:** hand-authored `mcq`, compare-two-quantities: "Which has the larger value of x:
  2^x = 16, or 2^x = 64?" Same base, tests that a bigger target needs a bigger exponent without
  just re-solving from scratch.
  - Verified: 2⁴=16 (x=4); 2⁶=64 (x=6); 6 > 4, so 2^x=64 is correct.
  - Neither i2 nor i3 carried a `variant` field originally; none was added (hand-authored).

k2 and k3 both still share k1's literal shape and are honestly reviewed rather than edited:
- **k2** is now a legitimate *spaced re-check* of this lesson's single core procedural skill —
  well-motivated once i2/i3 stopped being redundant with it. It is also pinned:
  `session181.exponentSolve.test.ts` freezes its answer (5) and counts it toward a course-wide
  `matchBase` total (2) and `converted` total (32); redesigning it would require touching three
  hardcoded fixtures in a whole-course-spanning shared file for a step whose repetition is
  pedagogically defensible on its own terms. Not touched.
- **k3** ("Solve 4^x = 8") shares the surface template but is already a materially *different,
  harder* skill — a non-integer exponent (x = 3/2) requiring rewriting 4 as 2², delivered as an
  MCQ rather than free numeric entry, correctly placed as the capstone check before ch1. Not
  touched (also unpinned; leaving it was a judgment call, not a constraint).

---

## exp-03-02 — Equations with a Coefficient

**Flagged:** i2, i3, k2, k3.

All four normalize (along with k1) to `"solve # · #^x = #."` — the same five-way collision
pattern as exp-03-01, for the "isolate the coefficient, then match bases" procedure.

**Decision: REDESIGNED i2, i3. KEPT k2, k3.**

Same diagnosis as exp-03-01: c2 and c3 restate one two-step procedure rather than introducing new
sub-skills, and i2/i3 were pure numeric duplicates of k1's exact job.

- **i2 — old job:** `numeric`, "Solve 3 · 10^x = 300." **New job:** hand-authored `mcq`,
  catch-the-mistake targeting "skip the division, solve the power alone": "A student solves
  4 · 2^x = 32 by ignoring the coefficient and solving 2^x = 32 directly, getting x = 5."
  - Verified correct: divide first, 32÷4=8=2³, so x=3.
  - Trap "5": the flawed method's own result. Verified: 2⁵=32.
  - Trap "8": stopping one step early (the isolated power, not yet converted to an exponent).
    Verified: 32÷4=8.
- **i3 — old job:** `numeric`, "Solve 4 · 3^x = 36." **New job:** hand-authored `mcq`,
  which-change-moves-x: "In 3 · 2^x = 24, if the coefficient 3 were changed to 6 (so
  6 · 2^x = 24), would x increase, decrease, or stay the same?"
  - Verified: 3·2^x=24 → 2^x=8=2³ → x=3. 6·2^x=24 → 2^x=4=2² → x=2. 3→2 is a decrease.
  - Neither i2 nor i3 carried a `variant` field originally; none was added.

k2 and k3 remain identical in shape to k1 and are honestly kept:
- Both are pinned in `session181.exponentSolve.test.ts` (frozen answers 3 and 2; both count toward
  a course-wide `solve` total of 6) — redesigning either would touch that shared, whole-course
  ledger for two steps whose repetition is independently defensible: this is a genuine two-step
  procedure (divide, then match), and drilling it three times (k1, k2, k3) once i2/i3 carry real
  pedagogical variety is standard fluency-building for a compound-trap skill, not laziness.

---

## exp-03-03 — Decay & Negative Exponents

**Flagged:** k1, k2, k3.

Two collision clusters: **k1**+**k2** normalize (with i1) to `"solve #^x = #/#."` (integer base,
fraction target → negative exponent). **k3** normalizes (with i2) to `"solve (#/#)^x = #."` (decay
base, target above 1 → negative exponent, "flips").

**Decision: KEPT (no edit).**

The recap names exactly two takeaways as this lesson's substance: (1) fraction target + integer
base ⇒ negative exponent, and (2) decay base + target above 1 ⇒ sign flips negative. The third
case shown in the lesson (c3/i3: decay base + target below 1 ⇒ *ordinary positive* exponent) is
deliberately the non-special "control" case — it is never named as a recap takeaway, and i3
already demonstrates it via a manipulate/construct interactive (`expLogExplore`), not a
computational check.

- k1 and k2 both check takeaway (1) — the lesson's primary, hardest insight — separated by a full
  intervening skill block (c2/i2, c3/i3) covering takeaway (2) and the control case. Two spaced
  checks of the headline insight is legitimate emphasis, not accidental repetition.
- k3 checks takeaway (2), matching its own practice partner i2 (practice → later graded check),
  the same clean pattern seen elsewhere in this packet.
- All three are also pinned in `session181.exponentSolve.test.ts`'s FROZEN list (−2, −4, −2) and
  count toward the course-wide `solve` total (6); this reinforced, but did not decide, the KEEP.

No edit made anywhere in this lesson.

---

## exp-04-01 — Reading Exponential Graphs

**Flagged:** k3.

- **k3** collided with **k1** — both normalize to `"at what value does f(x) = # · #^x cross the
  y-axis?"` (read the y-intercept from standard form).

**Decision: KEPT (no edit).**

Reading the y-intercept is this lesson's central, namesake skill — it is checked by k1 and k3
(separated by a full intervening block, c2/i2/c3, covering the different "classify direction from
the graph" skill checked by k2), and also practiced with different wording at i3 and the ch1
challenge. Two spaced checks of the bedrock skill are reasonable for a "reading" lesson; nothing
else taught in the lesson goes unchecked. k3 is also pinned three ways in
`session181.a1Exponential.test.ts` (FROZEN value 10; the base-independence proof that perturbing
b leaves the answer at the coefficient a; the `converted` count) — redesigning it would touch a
shared, whole-course ledger for a step whose repetition is independently well-justified. No edit
made.

---

## exp-04-02 — Comparing Growth

**Flagged:** k3.

- **k3** collided with **k1** — both normalize to `"for g(x) = # · #^x, what is g(#)?"`
  (evaluate a single exponential model at a point).

**Decision: KEPT (no edit).**

"Evaluate one model at a point" is a foundational, reused subskill (from ch1) rather than this
lesson's own new content; it is checked by k1 and k3, separated by a full intervening block
(c2/i2/c3/i3/i3b) covering the lesson's actual new idea — "grows faster" = larger base, which is
checked by i2 and k2 (a matching pair the same shape as k1/k3, but MCQ). The ch1 challenge
additionally juggles two named models at once. k3 is pinned in
`session181.a1Exponential.test.ts`'s FROZEN list (64); k2 (the step immediately before it in the
check block) is separately pinned byte-for-byte in `manipulativeAlongside.s237.test.ts` as the
graded step served by inserted manipulative `i3b` — not touched. No edit made.

---

## exp-04-03 — Exponential vs Linear

**Flagged:** k1.

- **k1** collided with **i1** — both normalize to `"the sequence #, #, #, # is..."`
  (classify a sequence as exponential or linear).

**Decision: KEPT (no edit).**

This is a deliberate discrimination pair, not a duplicate: i1 (ungraded, first interactive in the
lesson) presents an *exponential* example (2, 4, 8, 16 → ×2) immediately followed by k1 (first
graded check) presenting a *linear* example (3, 6, 9, 12 → +3) — same question frame on purpose,
opposite category, forcing the learner to apply the differences-vs-ratios test rather than
pattern-match the immediately prior answer. This is a stronger design than merely varying the
wording would be. No edit made.

---

## Summary

| Lesson | Flagged | Decision |
|---|---|---|
| exp-01-01 | k2, k3 | k2 REDESIGNED, k3 KEPT |
| exp-01-02 | k3 | KEPT |
| exp-01-03 | k2, k3 | k2 REDESIGNED, k3 KEPT |
| exp-03-01 | i2, i3, k2, k3 | i2, i3 REDESIGNED, k2/k3 KEPT |
| exp-03-02 | i2, i3, k2, k3 | i2, i3 REDESIGNED, k2/k3 KEPT |
| exp-03-03 | k1, k2, k3 | KEPT |
| exp-04-01 | k3 | KEPT |
| exp-04-02 | k3 | KEPT |
| exp-04-03 | k1 | KEPT |

6 steps redesigned across 4 lessons (exp-01-01/k2, exp-01-03/k2, exp-03-01/i2+i3,
exp-03-02/i2+i3), all as hand-authored static `mcq` widgets with `variant` fields deleted rather
than repointed (per the packet's collision-avoidance guidance) — no new generator forms were
added to `src/lib/variants.ts`. 5 lessons are honest KEEPs with no edits at all; their queue rows
are expected to remain open.

### Shared-file fallout from the two exp-01-01/exp-01-03 redesigns

Deleting the stale `variant: {"gen":"exp-function", ...}` tag from exp-01-01/k2 and
exp-01-03/k2 (required because their new mcq prompts no longer match that generator's fixed
templates) decremented two hardcoded, whole-course fixture counts that pin exactly this kind of
number. Both were updated with a documented, single-purpose diff, following the exact precedent
an earlier session (S329) already established in both files for the same situation:

- `src/lib/session181.a1Exponential.test.ts` — `converted` count 32 → 30 (one `it` block).
- `src/lib/session180.expFunction.test.ts` — two frozen-answer rows removed (exp-01-01/k2=48,
  exp-01-03/k2=4) and the family-completeness count 14 → 12.

No other pinned fixture was touched: exp-03-01/i2, exp-03-01/i3, exp-03-02/i2, exp-03-02/i3 never
carried a `variant` field before this change, so their redesign touched no shared test file.
`src/lib/variants.ts` (the generator implementations shared with concurrently-running packets) was
not modified.

### Verification performed

- `node -e "JSON.parse(...)"` on all 4 edited lesson files: valid.
- `npx vitest run` (targeted, single-file): `session279.exponentialFunctionsCourse.test.ts`,
  `session181.a1Exponential.test.ts`, `session181.exponentSolve.test.ts`,
  `session180.expFunction.test.ts`, `session247.interactionNecessityDisposition.test.ts` — all
  green (33 tests) after the two documented fixture updates above.
- `manipulativeAlongside.s237.test.ts` was also run; its failures are pre-existing/concurrent and
  entirely in other courses (de-01-01, de-03-01, de-03-02, dr-01-03, pr-04b-02) — confirmed
  unrelated to this packet and not touched.
- Every number in every new widget (correct answers and both traps, for all 4 redesigned steps in
  exp-01-01/exp-01-03, plus both redesigned steps each in exp-03-01/exp-03-02) was independently
  recomputed via a standalone `node -e` script rather than by inspection; all matched.
