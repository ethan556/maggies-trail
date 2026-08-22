# S330 LESSON_PROGRESSION_AND_DUPLICATION — Queue Packet G2

Course: `functions-and-sequences` (fn). Detector: `scripts/audit/consolidate-pending-workload-s236.mjs`
(~lines 358-393) — strips digits from each graded/interactive step's widget `prompt` (replacing runs of digits
with `#`) and flags any step whose resulting normalized template exactly matches another step's normalized
template within the same lesson. Every collision below was independently re-derived by replaying the detector's
own normalization logic against the live files (not assumed from the queue snapshot), both before and after
editing.

For each lesson: the flagged step(s), the sibling step(s) they collide with (same normalized template), the
decision, and — for redesigns — the old vs. new question job with independent math re-verification.

---

## fn-01-02 — Domain, Range & the Function Test

**Flagged:** k1. **Collides with:** i1 (both normalize to `"for the pairs (#,#), (#,#), (#,#), what is the range?"`).

**Decision: KEPT (legitimate).** i1 (interactive, mcq) asks for the range from three pairs with three *distinct*
outputs — a plain recognition task. k1 (check, buildExpression) immediately follows and asks for the range of
(0,3),(1,3),(2,3) — outputs that all *repeat*, so the correct answer collapses to the one-element set {3}. This
targets a different, harder nuance than i1 (a set lists a repeated value once) and swaps the interaction mode from
select-a-choice to construct-the-answer. A check re-drilling the same underlying concept immediately after the
interactive that introduces it, with a genuinely different sub-case and widget type, is normal instructional
design. No edit made.

---

## fn-01-03 — Functions from a Table

**Flagged:** i2. **Collides with:** k1 (both normalize to `"for f(x) = #x, what is f(#)?"`).

**Decision: REDESIGNED i2.**

- **Old question job:** "For f(x) = 2x, what is f(20)?" → 40 — mechanically identical to k1's "For f(x) = 5x, what
  is f(4)?" (evaluate an ax-only rule). i2 sits right after concept c2, whose whole point is that "a rule extends
  the table forever" — i.e. it works on inputs the table never showed — but the bare compute prompt never actually
  tests that idea; it reads as a plain repeat of k1's job.
- **New question job:** an MCQ that puts the misconception on trial directly: "The table only shows f(1) = 2,
  f(2) = 4, f(3) = 6. A student says f(20) is unknown because 20 never appears in the table. Which is correct?" —
  action changed from *compute* to *verify a claim*, targeting the "a table limits which inputs are valid" error
  c2 exists to correct.
- **Math re-verification (independent, via node):** f(20) = 2×20 = **40** (unchanged from the original). Traps:
  22 (2x misread as x+2, the same value the original `commonErrors` already used) and the "you can only evaluate
  inputs in the table" claim itself — both confirmed ≠ 40, both plausible.
- **Generator/variant handling:** i2 carried no `variant` field before or after this edit — no generator/replay
  risk, nothing to reconcile.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` (via `tsx`, against the
  live `src/lib/schema.ts`/`pedagogy.ts`) report 0 findings; live re-run of the detector's own normalization shows
  `repeatedTemplates: []` for this lesson.

---

## fn-02-01 — Common Difference

**Flagged:** i3, k2, k3.

**Decision: SPLIT — i3 KEPT, k2 and k3 REDESIGNED.**

- **i3 (KEPT, legitimate):** collides with i2 on `"in the sequence #, #, #, #, what is the next term?"`. i2
  extends an increasing sequence (3,7,11,15→19); i3 extends a *decreasing* sequence through a *negative* common
  difference all the way to zero (20,15,10,5→0), directly instantiating concept c3's own worked example ("the
  sequence keeps stepping by the same amount, even through zero") immediately after it is taught. A legitimate
  concept-to-interactive pairing, not padding. No edit made.
- **k2 (REDESIGNED):** collided with k1 on `"in the sequence #, #, #, #, what is the common difference?"`. k1
  already covers the harder negative-d case (10,7,4,1→d=−3); k2's positive-d case (2,9,16,23→d=7) added nothing
  k1 or c1's own worked example hadn't already shown.
  - **New question job:** "The arithmetic sequence 6, __, 18, 24 is missing its second term. What is it?" — a
    missing-*interior*-term job (bidirectional reasoning from two later terms) instead of a bare "state d" job.
  - **Math re-verification:** d = 24−18 = **6**; missing term = 6+6 = **12**. Traps: 15 (wrongly averages the
    non-adjacent 6 and 24) and 0 (finds d correctly but subtracts instead of adds) — both ≠ 12.
- **k3 (REDESIGNED):** collided with i2 on the same `"...what is the next term?"` template as i3, but with no new
  nuance (5,8,11,14→17, plain positive extension, identical job to i2).
  - **New question job:** "An arithmetic sequence has 2nd term 8 and 3rd term 11. What is the 5th term?" — only
    two *non-adjacent-to-the-target* terms are given (not a full 4-term list), and the answer requires extending
    **two** steps past the last known term instead of one.
  - **Math re-verification:** d = 11−8 = 3; 5th term = 11+2×3 = **17**. Traps: 14 (stops one step early, i.e. at
    the 4th term) and 23 (uses 5 steps from the 2nd term instead of the correct 3) — both ≠ 17.
- **Generator/variant handling:** k2 originally carried `variant: {gen: "fn-arith-seq"}` and k3 carried
  `variant: {gen: "fn-arith-seq", form: "nextUp"}`. Both removed and replaced with hand-authored static widgets
  (strongly-preferred option) since neither generator form can produce a missing-interior-term or
  two-non-adjacent-terms shape. No new generator form added.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [i3]` — i3 remains open as the reviewed, legitimate KEEP; k2 and k3 no
  longer collide with anything.

---

## fn-02-02 — The nth Term Formula

**Flagged:** i2, k2, k3, all colliding with k1 on `"for a_# = #, d = #, what is the #th term?"`.

**Decision: SPLIT — i2 KEPT, k2 and k3 REDESIGNED.**

- **i2 (KEPT, legitimate):** uses a_1=10, d=3, 4th term — the *exact same numbers* as concept c2's own worked
  example on the "(n−1), not n" miscount ("For a_1 = 10, d = 3, the 4th term is 10 + 3·3 = 19"), immediately after
  c2 teaches it. A deliberate worked-example-to-interactive mirror, not a copy-paste repeat. No edit made.
- **k2 (REDESIGNED):** had no such concept anchor (a_1=5, d=4, 7th term=29) — a third instance of the same bare
  "plug into the formula" job as k1 and i2, with no new nuance.
  - **New question job:** "Sequence A has a_1 = 5, d = 4. Sequence B has a_1 = 8, d = 3. Which has the larger 7th
    term?" — action changed from *compute* to *compare two quantities*.
  - **Math re-verification:** A: 5+6×4 = **29**. B: 8+6×3 = **26**. A is larger (29 > 26, correctly the answer).
- **k3 (REDESIGNED):** also a bare plug-in (a_1=50, d=−5, 6th term=25), the fourth instance of the same job.
  - **New question job:** "For a_1 = 50, d = -5, a student says the 6th term is 50 − 6·5 = 20. Is the student
    correct?" — action changed from *compute* to *catch a mistake* (the classic (n−1)-vs-n error, made explicit).
  - **Math re-verification:** correct 6th term = 50+5×(−5) = **25**. The presented wrong claim, 20, ≠ 25. Second
    trap "75" = 50−5×(−5) (a double-negative sign-flip error), also ≠ 25 and ≠ 20.
- **Generator/variant handling:** k2 originally carried `variant: {gen: "fn-arith-seq", form: "nthPos"}` and k3
  carried `variant: {gen: "fn-arith-seq", form: "nthNeg"}`. Both removed; hand-authored static widgets substituted
  since neither form can produce a compare-two-sequences or catch-a-mistake shape. No new generator form added.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [i2]` — i2 remains open as the reviewed, legitimate KEEP.

---

## fn-02-03 — Finding Terms & Positions

**Flagged:** i3, k2, k3.

**Decision: SPLIT — k2 and k3 KEPT, i3 REDESIGNED.**

- **k2 (KEPT, legitimate):** collides with k1 on `"for the sequence #, #, #, #, ..., what is the #th term?"`. k1
  (the first check, right after the intro) and k2 (later, before the final challenge) are the lesson's only two
  "find the term" checks — ordinary spaced retrieval of the lesson's own named skill, with fresh numbers each
  time, not a back-to-back copy. No edit made.
- **k3 (KEPT, legitimate):** collides with i2 on `"in the sequence #, #, #, ..., which term equals #? (give n)"`.
  i2 (right after concept c2, using c2's own worked numbers 5,8,11→23) and k3 (later) are the lesson's only two
  "find the position" checks — the same legitimate spaced-retrieval pattern as k2, for the lesson's other named
  skill. No edit made.
- **i3 (REDESIGNED):** collided with k1's "find the term" template (1,4,7,10→9th term=25, no new nuance versus
  k1). Its real defect: i3 sits directly after concept c3's synthesis — "whether you want the 9th term or the
  position of a value, a_n = a_1+(n−1)d does the work" — but the original i3 only exercised the *term* direction
  again, wasting the chance to actually demonstrate the duality c3 just taught (and pushing "find the term" to a
  third instance in the lesson).
  - **New question job:** an MCQ asking whether the *same* formula can find BOTH the 9th term of 1,4,7,10,… AND
    which term equals 25 — directly testing the synthesis concept rather than repeating either sub-skill.
  - **Math re-verification:** 9th term = 1+8×3 = **25**. Solving 1+(n−1)×3=25 for n: (n−1)=8, n=**9** — consistent
    with the term computation, as required for the "yes, both directions" correct option.
- **Generator/variant handling:** i3 carried no `variant` field before or after this edit — nothing to reconcile.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [k2, k3]` — both remain open as the reviewed, legitimate KEEPs; i3 no
  longer collides with anything.

---

## fn-03-02 — The nth Term of a Geometric Sequence

**Flagged:** i2, i3, k2, k3.

**Decision: SPLIT — i2, i3, k2 KEPT, k3 REDESIGNED.**

- **i2 and i3 (KEPT, legitimate):** collide with i1 on the `sequenceBuild` "drag the ratio and confirm term N"
  shape. This lesson runs a *consistent, deliberate* concept→interactive mirror throughout: i1 uses c1's own
  numbers (a_1=2, r=3, 4th term=54); i2 uses c2's own numbers (a_1=1, r=4, 3rd term=16); i3 uses c3's own numbers
  (a_1=5, r=2, 5th term=80). Each interactive is the hands-on replay of the worked example its own immediately
  preceding concept just taught — confirmed exact-match against all three concepts' text, and independently
  cross-checked against `src/lib/sequenceGeometricTerm.s119.test.tsx`'s own hardcoded values for this lesson's i1/
  i2/i3 (54, 16, 80 respectively), which this packet did not touch. No edit made.
- **k2 (KEPT, legitimate):** collides with k1 on `"for a_# = #, r = #, what is the #th term?"`. k1 (first check)
  and k2 (second, later check) are the lesson's only two plug-into-the-formula checks — legitimate spaced
  retrieval, not a copy-paste. No edit made.
- **k3 (REDESIGNED):** a *third* instance of the identical k1/k2 job (a_1=1, r=3, 4th term=27), positioned
  immediately after k2 with nothing between them — no concept anchor, no new nuance, the clearest case of
  accidental duplication in this packet.
  - **New question job:** "For a_1 = 1, r = 3, a student says the 4th term is 1 · 3⁴ = 81. Is the student
    correct?" — action changed from *compute* to *catch a mistake* (the classic (n−1)-vs-n exponent error).
  - **Math re-verification:** correct 4th term = 1×3³ = **27**. Presented wrong claim 81 = 1×3⁴ ≠ 27. Second trap
    "9" = 1×3² (one factor too few) ≠ 27 and ≠ 81.
- **Generator/variant handling:** k3 originally carried `variant: {gen: "a1-functions-sequences",
  form: "fn-geo-nth__numeric"}`. Removed; hand-authored a static `mcq` widget instead, since that generator form
  only ever regenerates a bare numeric plug-in prompt and cannot produce a catch-the-mistake MCQ. No new generator
  form added; `src/lib/algebra1Variants.ts` (where this family lives) was not modified.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [i2, i3, k2]` — all three remain open as reviewed, legitimate KEEPs.

---

## fn-03-03 — Reading a Geometric Rule

**Flagged:** i3, k2, k3.

**Decision: SPLIT — i3 and k2 KEPT, k3 REDESIGNED.**

- **i3 (KEPT, legitimate):** collides with i2 on the `sequenceBuild` "drag the ratio and read term N" shape. i3's
  numbers (a_1=5, r=2, 6th term=160) are the exact worked example from concept c3 immediately preceding it — the
  same concept-to-interactive mirror pattern used throughout fn-03-02, independently cross-checked against
  `src/lib/sequenceGeometricTerm.s119.test.tsx`'s hardcoded value (160) for this lesson's i3, which this packet
  did not touch. No edit made.
- **k2 (KEPT, legitimate):** collides with k1 on `"for the sequence #, #, #, #, ..., what is the #th term?"`. k1
  and k2 are this lesson's only two plug-into-the-formula checks — legitimate spaced retrieval. No edit made.
- **k3 (REDESIGNED):** a third instance of the same k1/k2 job (2,4,8,16→6th term=64), immediately following k2
  with no concept in between and no new nuance.
  - **New question job:** "Sequence A: 2, 4, 8, 16, … (r = 2). Sequence B: 2, 6, 18, 54, … (r = 3). Which has the
    larger 6th term?" — action changed to *compare two quantities*; Sequence B deliberately reuses k1's own base
    sequence so no unrelated new numbers were introduced.
  - **Math re-verification:** A: 2×2⁵ = **64**. B: 2×3⁵ = **486**. B is larger (486 > 64, correctly the answer).
- **Generator/variant handling:** k3 originally carried `variant: {gen: "a1-functions-sequences",
  form: "fn-geo-rule__numeric"}`. Removed; hand-authored a static `mcq` widget instead — that form only produces a
  bare numeric plug-in and cannot produce a two-sequence comparison. No new generator form added;
  `src/lib/algebra1Variants.ts` was not modified.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [i3, k2]` — both remain open as reviewed, legitimate KEEPs.

---

## fn-04-01 — Arithmetic or Geometric?

**Flagged:** i2, i3, k2, k3, all colliding with k1 on `"which kind of sequence is #, #, #, #?"`.

**Decision: KEPT (all four, legitimate).** This is a classification-practice lesson, and "Which kind of sequence
is A, B, C, D?" is the only honest, direct way to pose a classification question — the wording necessarily stays
constant regardless of which category is correct. What actually varies, and what matters pedagogically, is the
underlying *case* each instance drills: k1 (2,6,18,54 → geometric, the baseline), i2 (4,8,16,32 → geometric, but
paired with concept c2's specific "test BOTH difference and ratio before concluding" point — its distractor
feedback explicitly walks through both tests), i3 (1,4,9,16 → **neither**, paired with concept c3's dedicated
teaching of that third category, the squares sequence), k2 (10,20,30,40 → **arithmetic**, the only "check" whose
correct answer is arithmetic — critically prevents a student from pattern-matching "always pick geometric" off the
surrounding examples), and k3 (1,2,4,8 → geometric again, restoring balance after k2's arithmetic case so ordering
alone can't be gamed). Every category (arithmetic, geometric, neither) is deliberately exercised, and the specific
misconception guarded against differs case to case. The `challenge` (ch1, unflagged) goes further still with an
explicit "first jump looks like ×3 but isn't" trap. No edit made to any step in this lesson.

---

## fn-04-02 — Choosing the Right Formula

**Flagged:** i3, k2, k3.

**Decision: SPLIT — i3 and k2 KEPT, k3 REDESIGNED.**

- **i3 (KEPT, legitimate):** collides with k1 on `"for #, #, #, #, ... (geometric), what is the #th term?"`. i3's
  numbers (1,2,4,8 → 6th term=32) are the exact worked example from concept c3 immediately preceding it ("using
  the arithmetic rule here would give the wrong answer entirely") — the concept-to-interactive mirror pattern used
  elsewhere in this course. No edit made.
- **k2 (KEPT, legitimate):** collides with i2 on `"for #, #, #, #, ... (arithmetic), what is the #th term?"`. i2
  and k2 are this lesson's only two arithmetic-labelled checks — legitimate spaced retrieval (this lesson only has
  one geometric-labelled "opening" check, k1, so arithmetic's two instances are the appropriate, matching count).
  No edit made.
- **k3 (REDESIGNED):** a third geometric-labelled instance colliding with k1 (1,5,25,125→5th term=625, no new
  nuance versus k1 or i3).
  - **New question job:** "For 1, 5, 25, 125, ... a student assumes it's arithmetic with d = 4 (from 5 − 1) and
    gets a_5 = 1 + 4·4 = 17. What is the actual 5th term?" — a *catch-the-wrong-formula-type* MCQ, which is this
    lesson's own central skill (classify, then apply the *matching* rule) rather than a repeat of k1's or i3's
    bare compute.
  - **Math re-verification:** differences 5−1=4, 25−5=20, 125−25=100 — **not constant**, so not arithmetic; ratios
    5÷1=5, 25÷5=5, 125÷25=5 — **constant**, so geometric. Correct 5th term = 1×5⁴ = **625**. The presented flawed
    arithmetic guess, 1+4×4=17, ≠ 625. Third trap "125" (repeats the last listed term) ≠ 625 and ≠ 17.
- **Generator/variant handling:** k3 originally carried `variant: {gen: "a1-functions-sequences",
  form: "fn-choose-formula__numeric"}`. Removed; hand-authored a static `mcq` widget instead — that form only
  produces a bare numeric plug-in and cannot produce a catch-the-wrong-formula MCQ. No new generator form added;
  `src/lib/algebra1Variants.ts` was not modified.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `Lesson.parse` + `lintLesson` report 0 findings; live
  detector re-run shows `repeatedTemplates: [i3, k2]` — both remain open as reviewed, legitimate KEEPs.

---

## Summary

| Lesson | Flagged | Decision | Redesigned step(s) |
|---|---|---|---|
| fn-01-02 | k1 | KEPT | — |
| fn-01-03 | i2 | **REDESIGNED** | i2 |
| fn-02-01 | i3, k2, k3 | SPLIT | k2, k3 redesigned; i3 kept |
| fn-02-02 | i2, k2, k3 | SPLIT | k2, k3 redesigned; i2 kept |
| fn-02-03 | i3, k2, k3 | SPLIT | i3 redesigned; k2, k3 kept |
| fn-03-02 | i2, i3, k2, k3 | SPLIT | k3 redesigned; i2, i3, k2 kept |
| fn-03-03 | i3, k2, k3 | SPLIT | k3 redesigned; i3, k2 kept |
| fn-04-01 | i2, i3, k2, k3 | KEPT | — |
| fn-04-02 | i3, k2, k3 | SPLIT | k3 redesigned; i3, k2 kept |

Two whole lessons (fn-01-02, fn-04-01) needed no edit at all. Across the other seven, 9 individual flagged steps
were redesigned and 12 were reviewed and kept as legitimate. The recurring, genuine KEEP patterns found in this
course: (1) a concept that teaches via a specific worked example, immediately followed by an interactive that
replays those *exact same numbers* hands-on (fn-02-02/i2, fn-02-03/i2, fn-03-02/i2+i3, fn-03-03/i3, fn-04-02/i3);
(2) exactly two spaced-practice checks of the same named skill, at different points in the lesson, with fresh
numbers each time (fn-02-01/i3 vs the concept it instantiates, fn-02-03/k2+k3, fn-03-02/k2, fn-03-03/k2,
fn-04-02/k2); and (3) a classification lesson (fn-04-01) whose repeated question stem is inherent to the genre,
with genuine variety carried entirely by which category and misconception each instance targets. The recurring
genuine REDESIGN pattern: a *third* same-shaped check/interactive with no concept anchor and no new misconception,
usually sitting immediately adjacent to the second — these were rewritten into compare-two-quantities or
catch-a-mistake MCQs that reuse the original numbers wherever possible, so no new arithmetic risk was introduced
beyond what the original step already carried. These KEPT rows are expected to remain open in the detector's
queue (per this workstream's by-design lack of a disposition-based suppression) — they are honestly reviewed, not
silently closed.

Seven lessons were edited (fn-01-03, fn-02-01, fn-02-02, fn-02-03, fn-03-02, fn-03-03, fn-04-02); nine steps
total were redesigned. Every `variant` field on a redesigned step was deleted and replaced with a hand-authored
static widget (the strongly-preferred option) rather than pointed at a new or existing generator form; no shared
generator file (`src/lib/variants.ts` or `src/lib/algebra1Variants.ts`) was modified by this packet, so no
`variants.resolver.test.ts` run was needed. All nine edited/kept lessons pass `Lesson.parse` (the live Zod schema)
and `lintLesson` (the live pedagogy linter — conceptTag, explanationVariants, generic/thin-feedback, duplicate
distractor feedback, mcq exactly-one-correct, and near-duplicate-label rules all checked) with zero findings, run
via `tsx` directly against `src/lib/schema.ts`/`src/lib/pedagogy.ts`. Every new number, trap, and answer was
independently recomputed via a standalone `node` script (not trusted by inspection); all traps are confirmed
wrong-but-plausible and never equal to the correct answer.

**Unrelated pre-existing state noted during verification (out of scope, not touched):**
`npx vitest run src/lib/content.duplicateItems.s242.test.ts` — a *different*, stricter, exact-text (not
number-normalized) duplicate-MCQ ratchet belonging to workstream MCQ-01 (`MCQ01_DISTRACTOR_REUSE.md`) — currently
fails because the corpus-wide counts have improved far past its pinned baseline (within-lesson duplicate groups:
baseline 75, currently 0; corpus-wide duplicated items: baseline 162, currently 6), evidently from the large
volume of concurrent/prior sessions' work already landed on this branch. This is a stale-baseline-needs-updating
situation for that other workstream's ledger, not a regression: this packet's edits only ever changed
number-varying (not exact-text) prompts, none of which were counted by that stricter detector to begin with, and
the received counts moved in the *improving* direction (down), never up. Flagging for the orchestrator; not
remediated here.
