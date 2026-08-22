# S323 Fix Packet P6 — implementation evidence

Worker: cowork-s323-P6-fixer. Branch: codex/v4-s244-authored-visual-wave.
Scope: 18 lessons (arrays-even-odd-g2 ×6, number-line-g2 ×4, four-addends-g2 ×3, add-subtract-10-k ×5).
Contracts: PREMIUM_PENDING_WORKLOAD_QUEUE.csv rows for each lesson id; per-lesson sections of
reports/closure/S322_ASSESS_F5.md (arrays, number-line) and reports/closure/S322_ASSESS_F3.md
(four-addends); reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md (KOA-R, R1–R6) for
add-subtract-10-k. No npm/vitest/tsc run (hard constraint); verification via the digit→# normalized
duplicate probe (scratchpad probe.py, results quoted per lesson) and the independent-solver source
read of src/lib/g2Independent.cjs (read-only).

Dispositions: reports/closure/cowork-staging/laneA-s323-P6.jsonl (one line per lesson).

---

## g2a-01-02 (arrays-even-odd-g2) — IMPLEMENTED

Contract (queue LESSON-REVISION-g2a-01-02 + F5 §58): k2 oddEvenPairs byte-identical to
g2a-01-01/k2 ("Is 11 odd or even?"); k1 mcq same recognize-the-even-number template as
g2a-01-01/k3 — change k2's n (e.g. 9), give k1 four different numbers.

Before:
- k1 mcq "Which of these numbers is even?" options 24*/13/27/29 (shared 13 with g2a-01-01/k3's 28*/13/25/21).
- k2 oddEvenPairs "Is 11 odd or even?" n=11 — byte-identical to g2a-01-01/k2.

After:
- k1 options 36*/15/39/41 — zero overlap with g2a-01-01/k3's set; feedbacks recomputed
  (36 = 18 pairs, nothing left; 15/39/41 leftover-marks-odd wording preserved). Correct stays o0
  (session194 requires correct at index 0; OddEvenMcq solver picks the unique even label — 36 is the
  only even option). Variant declaration untouched.
- k2 "Is 9 odd or even?" n=9, answer odd, evenFeedback "9 makes 4 pairs with 1 left over. A leftover
  means odd." (55 chars ≥25, wrong-parity slot only), successFeedback recomputed. Solver
  OddEvenOddEvenPairs derives n[0]=9 → odd ✓. No byte or normalized collision with any g2a lesson.

Probe: within-lesson EXACT/NORM/PAYLOAD collisions: only pre-existing k1↔remedial prompt echo
("Which of these numbers is even?" — the remedial is the pre-S323 byte-copy of old k1, retains
24/13/27/29 so payloads now differ; no signed contract names this remedial — recorded as residual
debt, not fixed, per F5's "do not touch any other step"). Cross-lesson byte-identical: none.
reviewBasisHash: 641d3ab8bc4ff3e3dbe9f3937b8044629bb4b12ea24880dd7470ae1a51d15765

## g2a-01-03 (arrays-even-odd-g2) — ESCALATE (src-blocked)

Contract (F5 §59): i2 oddEvenPairs "Pair up 14 counters. Odd or even?" (n=14) is byte-identical to
g2a-01-01/i1; change n (e.g. 12).

Block: `src/lib/session286.arraysEvenOddG2Progression.test.ts` pins the i2 prompt for every arrays
lesson via `expectedSecondJobs` — for g2a-01-03 the pinned string IS "Pair up 14 counters. Odd or
even?" (`expect(second.prompt).toBe(expected.prompt)`). Any conforming change (new n ⇒ new prompt)
turns this gate red, and re-pinning is a src/** edit outside this packet's authority (S316 §7.6:
re-pin must land in the same packet — impossible here). Changing only feedback strings would clear
byte-identity but not the learner-visible repeat the contract names, so it was not done.

No edit. PROGRESSION-g2a-01-03 (number-normalized [i2,k3,ch1]): k1/k3/ch1 are the doubles-fact drill
("7 + 7", "6 + 6", "9 + 9") — fluency/retrieval purpose recorded per that row's approve branch.
reviewBasisHash: d5a21205a67d300c8c5cc4ef80b76744660cf97b8f6478e61d0eff6ad93c0d2d

## g2a-01-04 (arrays-even-odd-g2) — IMPLEMENTED

Contract (F5 §60): ch1 repeats k1's "Which addition shows X as a double?" template (X=20 vs 14);
replace with a capstone that exercises c2's "un-doubling" framing.

Before: ch1 mcq "Which addition shows 20 as a double?" options 10+10*/9+11/20+20/10+9.
After: ch1 mcq "Maggie un-doubles 12: she asks which number, taken twice, rebuilds it. Which
addition is she looking for?" options 6+6* (correct), 12+12 (doubled the target instead of
un-doubling → 24), 5+7 (reaches 12 but unequal), 3+3 (un-doubled twice → 6); all feedbacks
recomputed and literally true. Target 12 chosen because k2 ("8 + 8 = ?" = 16) sits two steps
earlier — un-doubling 16 would have had its answer on screen (R6-style adjacency); 12 shares no
digit with any adjacent step's answer. Contract's numeric fill-in variant was solver-blocked
(no g2Independent.cjs route derives "what number, doubled, makes N?"), so the un-doubling job kept
mcq form under the existing DoublesMcq variant: solver picks the first equal-addend '+' option,
which is o0 "6 + 6" ✓ (session194 route check stays green; variant not removed — course declared
count is exactly at its floor).

Probe: ch1 no longer prompt- or template-collides with k1. Pre-existing, uncontracted: rem0 is a
byte-copy of k1 (course-wide remedial debt class, untouched per contract); i1~i2 "pair up #
counters" normalized pair is the session286-sealed designed retrieval rep.
reviewBasisHash: edc5437e2887d0ea7d9f024faafd7e466b8f30f5e234b4f081427fbe32ebe0f6

## g2a-02-02 (arrays-even-odd-g2) — IMPLEMENTED

Contract (F5 §61): k2 byte-identical to g2a-02-01/k3; k3 byte-identical to g2a-02-01/k2.

Before/after:
- k2: "Two rows made 12. Add the third row: 12 + 6 = ?" (=18, traps 24/6) → "Two rows made 16. Add
  the third row: 16 + 8 = ?" (=24, traps 32 added-a-fourth-row / 8 took-a-row-away, success "Correct
  — 24"). Add2DigitNumeric solver reads the first "a + b" = 16+8 ✓.
- k3: "4 rows with 5 dots ... BY ROWS?" (5+5+5+5*) → "3 rows with 7 dots ... BY ROWS?" with
  7+7+7*, 3+3+3+3+3+3+3 (BY COLUMNS misconception, 7 columns of 3), 3+7 (row count + row size),
  8+8+8 (wrong row size); all feedbacks recomputed. Distinct from g2a-02-01/k2 (4r5),
  g2a-03-01/k1 (4r6), g2a-03-01/k3 (3r6), and the new g2a-03-03/k2 (5r4).

Probe: no exact/normalized/payload collision except pre-existing k1==rem0 byte-copy (uncontracted
remedial debt class, untouched). Straight-quote house style preserved in feedback.
reviewBasisHash: e53deb625e02afa63c7ebee784eb1aa5dbc02d1f3f0627cde31f6574ae8c8bac

## g2a-03-02 (arrays-even-odd-g2) — IMPLEMENTED

Contracts: F5 §62 (k1 new totals ≠16/≠18; k2 new pair ≠"4, 4+4") + CHOICE-0033 (k1 length leak
49-vs-32) + CHOICE-0034 (k3 length leak 49-vs-32) + PROGRESSION-g2a-03-02 [k3] (k1/k3 template dup).

Before/after:
- k1: "A 2-by-8 array and a 4-by-4 array both use 16 dots..." (correct label 49 chars vs ≤32) →
  "Two arrays use the same 20 dots: one is 2-by-10, the other 4-by-5. What does that show?" with
  options "The same 20 dots can be arranged in either shape"* (48) / "The 4-by-5 array must hold
  more dots than the other" (51, taller-is-bigger) / "One of the two arrays must have been counted
  wrong" (50) / "Only one shape of array can ever hold 20 dots" (45); feedbacks recomputed
  (2×10=20=4×5). Stem now normalizes differently from k3's, closing the within-lesson template dup.
- k2: "...holds 4 dots. Two rows: 4 + 4 = ?" (=8, traps 6/12) → "...holds 8 dots. Two rows:
  8 + 8 = ?" (=16, traps 10 = 8+2 row-plus-row-count, 24 = three rows' worth; success "Correct —
  16"). DoublesNumeric solver: first "a + b" = 8+8 ✓.
- k3: prompt kept (18 dots, 2-by-9 vs 3-by-6); options rebalanced: "Both arrays show the same 18
  dots"* (33) / "The 3-by-6 array holds more dots" (32) / "The 2-by-9 count must be a mistake" (34)
  / "A total of 18 fits only one array shape" (39); o2/o3 feedbacks recomputed and literally true.

Probe: k1/k2/k3 have no exact/normalized/payload collision in course. Remaining flags are the
untouched remedial only (old 16-dot byte-copy of g2a-02-03/k3 and normalized-equal to k3) —
uncontracted pre-existing debt class, recorded.
reviewBasisHash: b17bcbff6e569db307ff3af9b00f0582f1aa99d642ea708733229eb3c256aa73

## g2a-03-03 (arrays-even-odd-g2) — IMPLEMENTED

Contract (F5 §63): k1 byte-identical to g2a-03-01/ch1; k2 third occurrence of the "4 rows of 5 BY
ROWS" mcq (after g2a-02-01/k2 and g2a-02-02/k3).

Before/after:
- k1: "Maggie plants 4 rows of 4 seedlings. The first 3 rows hold 12. So 12 + 4 = ?" (=16) →
  "Maggie plants 5 rows of 5 seedlings. The first 4 rows hold 20. So 20 + 5 = ?" (=25, traps 20
  final-row-unplanted with "add its 5", 30 row-added-twice; success "Correct — 25"). First "a + b"
  in prompt is 20+5, so the Add2DigitNumeric solver derives 25 ✓.
- k2: 4 rows of 5 → 5 rows of 4 with the correct/columns pair flipped: 4+4+4+4+4* / 5+5+5+5
  (BY COLUMNS, 4 columns of 5) / 5+4 / 6+6+6+6+6; feedbacks recomputed. Distinct from 4r5 (g2a-02),
  3r7 (new g2a-02-02/k3), 4r6 and 3r6 (g2a-03-01).

Probe: k1/k2 clean; remaining flags belong to the untouched remedial (old "12 + 4" copy,
byte-identical to g2a-03-01/ch1) — uncontracted pre-existing debt class, recorded.
reviewBasisHash: 18272c425fef90e8378b75da36e779fe3b8dfa967250d5914aea50f60ed4b8ae

## number-line-g2 — one trap fix landed; four choice-surface contracts src-blocked

The four F5 contracts for this course (g2l-01-03/k3, g2l-03-01/k1-or-k3, g2l-03-02/k1,
g2l-03-03/k3) all name mcq steps whose prompt AND full option payloads are sha256-pinned in
`src/lib/session308.numberLineG2ChoiceOrder.test.ts` (rows: g2l-01-03 k1+k3, g2l-03-01 k1+k3,
g2l-03-02 k1, g2l-03-03 k3 — the pin hashes prompt and the id/label/correct/feedback of every
option). Three of those steps additionally carry pinned choice figures
(g2l-choice-add-44-20/45-20, g2l-choice-gap-53-33, g2l-choice-gap-43-33) asserted by
`src/components/session244.visualPromiseNumberLines.test.tsx`. Any conforming replacement turns
those gates red; re-pinning is a src/** edit this packet is forbidden to make (S316 §7.6 requires
the re-pin to land in the same packet). All four lessons ESCALATE with the exact blocking rows
cited; no mcq content was touched, so the pinned gates stay green.

### g2l-03-02 / k2 — IMPLEMENTED (the non-blocked half of F5 §50)

Before: numeric "64 − 43 = ? (the gap between the two marks)", answer 21, trap value **32** labeled
"That measured PAST both marks — the gap lives between them, found by subtracting."
After: trap value **107** (= 64 + 43, the actual added-the-marks landing; identical fix shape to
sibling ch1's trap 65 = 43 + 22), feedback text unchanged per contract. Solver route unchanged
(Pv1000SubtractByPlaceNumeric → 64−43 = 21); traps 107/22 distinct, neither equals 21.

reviewBasisHashes: g2l-01-03 6f38e971b1b4fe9d02b1271ed58ac5e512a3bfb936ada3e6c4375ee71f019f2f;
g2l-03-01 5aa0ff61f4733ba53de5bb4dbe5adb0666984214ab25aa69ff7cd3baa066f0f3;
g2l-03-02 6ed99a571716f50f5cfa9d05d70b75676a6cad098ed8ca747beb59846a60a7c4 (post-k2-fix);
g2l-03-03 391877907d5a91a831b59b58808aaccf38b243b3ab49d7ca64e951219e297d3d.

## four-addends-g2 (g2n-01-02, g2n-02-03, g2n-03-02) — IMPLEMENTED

Contract (F3 §46 + queue rows): each lesson's k3 was byte-identical to g2n-01-01/k3 — the
"(17 + 3) + 25" regrouping mcq reused verbatim in four lessons. Replace with fresh items using
different addends/order, themed to each lesson's own strategy; g2n-01-01 keeps the original (KEEP).

After (all three: correct at o0, ids o0–o3, one correct, distinct wrong feedbacks, no variant
declared on k3, and each prompt normalized-distinct from every other widget prompt in its lesson —
the session263 uniqueness gate's exact predicate, re-run via probe):
- g2n-01-02 (friendly-pair staging): "You add 34 + 19 + 6 + 1 as (19 + 1) + (34 + 6). Can the new
  grouping change the total?" — truth: (19+1)+(34+6) = 20+40 = 60 = 34+19+6+1. Distractors:
  pairing-changed-the-addends, only-if-each-pair-makes-ten, four-is-too-many (label lens 41/33/29/41).
- g2n-02-03 (running total): "Halfway through 16 + 9 + 4, a learner regroups to (16 + 4) + 9. What
  happens to the total?" — truth: 20+9 = 29; left-to-right walk 16, 25, 29. Distractors:
  grows/shrinks/cannot-tell (label lens 33/37/32/33).
- g2n-03-02 (forward/backward check): "A forward add of 21 + 15 + 5 makes 41. A back-to-front check
  also lands on 41. Why must the totals match?" — truth: 21+15+5 = 41 = 5+15+21. Distractors:
  lucky-coincidence, copied-answer, matching-means-wrong (label lens 25/25/33/40).

Probe residue: only the pre-existing k1==remedial byte-copies in all three lessons (uncontracted
debt class; session263's collision gate scans steps only, so it was and stays green).
reviewBasisHashes: g2n-01-02 6bcff489703ddf226d692c3557f8666ef2817e3b32a7c1998c898d94e6e63b74;
g2n-02-03 ec6f606544acedad2719f87586f302b9a72baced77c6a3dec8fcd7028a99aee2;
g2n-03-02 f098d7ad123792a4e519d4703852f70a5a1044bfd451d4af27c26c7bed9aa42b.

## add-subtract-10-k (koa-02-01 … koa-02-05) — VERIFIED CONFORMING, NO EDIT (KEEP)

Contract (queue LESSON-REVISION-koa-02-0x, signed S252 REVISE): "remedial route is immediate
same-family practice rather than a distinct misconception diagnosis"; next_action asks the
remediation be implemented and a new current disposition obtained.

Finding: the defect the signed rationale names (remedials[0].check.widget byte-identical to k1) is
not present in these five lessons. The binding standard itself rules on exactly this set:
S316_ADJUDICATION_REMEDIAL_STANDARD.md §2 ("Decisive: add-subtract-10-k already contains five
conforming exemplars … koa-02-01…koa-02-05 pass R1/R2/R3 today. The course carries its own answer"),
§3 (their remedials ARE the KOA-R template), §8 ("koa-02-01…02-05 already conform on the check
side"), and the S316 redispatch (S316_LANEA_KOA_REDISPATCH.md) fixed the other 15 koa lessons while
leaving these five untouched "as instructed."

Re-verified against current bytes (probe, digits→# normalization per the S255 gate formula):
- R1/R3: every remedial check prompt and payload differs from k1's.
- R2: every remedial check prompt is digit-normalized distinct from every widget-bearing step
  (i1, k1, i2, k2, k3, ch1) in its lesson — zero clashes in all five.
- R4: every remedial prompt is a hands-on manipulative directive ("Put/Draw/Set out/Cover …"),
  a different phrasing family from the story templates the lessons' Koa* variant generators emit.
- R5: all traps recompute from the printed numbers (5−2=3 traps 5,2; 5−3=2 traps 3,5; 4−1=3 traps
  4,1; mcq 4−1=3 unique correct; 6−2=4 traps 2,6), each feedback ≥25 chars and literally true.
- R6: no remedial concept body states its check's answer.
- Language: minimal, concrete Kindergarten wording (counters, circles, toy people, blocks,
  balloons; single short sentences).

Residual, recorded not fixed (out of scope by the binding standard's own §3 step 6 and §6):
remedials[0].concept.body === c2.body in these five lessons — the concept-side twin class S316
logs as unsigned debt "for a human … not a worker fix."

Dispositions: 5 × KEEP on fresh basis hashes (5b34271b…, 22d4891f…, 2b05f345…, 20ad7b5c…,
1d7f0f2e…) — the regenerated current disposition the queue rows call for.
