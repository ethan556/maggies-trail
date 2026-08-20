# S320 — Independent Assessment: equations-unknowns-g1, compose-shapes-g1 & add-three-numbers-g1

Reviewer: Claude Cowork independent assessor (S320)
Reviewed at: 2026-08-20T18:27:57.000Z
Scope: `content/courses/equations-unknowns-g1` (12 lessons), `content/courses/compose-shapes-g1` (10 lessons), and `content/courses/add-three-numbers-g1` (10 lessons), all grade 1. Every lesson JSON and all three `course.json` files read in full; every numeric answer key, `commonErrors`/MCQ-option feedback, and figure binding recomputed or cross-checked by hand. Cross-lesson and within-lesson duplication scanned programmatically two ways: (1) the repo's official `buildDuplicateInventory` (mcq-only, prompt+sorted-labels identity) via `scripts/audit/lesson-review-authority-s246.mjs`, and (2) a custom scan extended to `numeric`, `numberLineHop`, `tenFrame`, `tapDiagram`, and `dragBucket` widgets (prompt/answer identity), since the official scanner only covers `mcq`. Per the CHATGPT_WORK_V4_EXACT_PREFIX.md authority contract, a remedial's check mirroring its own lesson's k1 verbatim is the accepted, non-defective pattern and was excluded from duplication findings; only genuine cross-lesson or unrelated within-lesson repeats are reported. Render-time seeded shuffle (`McqW`/predict block, `src/lib/prng.ts`) was confirmed to randomize MCQ/predict display order per `${lessonId}:${stepId}`, so authored JSON option order was not treated as a defect signal; none of the S316 lab-widget types appear in these three courses. The S294 repair (equations-unknowns-g1: `g1e-03-03`-area caption naming, course-wide MCQ correct-option-ID rotation, "Find the missing number" wording, `g1e-03-02/ch1` check-label wording) and the S292 repair (add-three-numbers-g1: `g1t-01-01/c1` bar-join caption naming "7 + 5 = 12") were both confirmed present and correct in source and are not re-flagged anywhere below.

Dispositions signed for all 32 lessons in
`reports/closure/cowork-staging/laneB-s320-A13-dispositions.jsonl` (NDJSON, one record per lesson, `recordId` = `S320-A13-<lessonId>`).

This report is evidence for independent human assessment per the ChatGPT Work worker-prefix authority rules; it does not itself constitute a closure verdict, curriculum change, or approval.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| equations-unknowns-g1 | 12 | 12 | 0 | 0 |
| compose-shapes-g1 | 10 | 1 | 9 | 0 |
| add-three-numbers-g1 | 10 | 2 | 8 | 0 |
| **Total** | **32** | **15** | **17** | **0** |

## Per-lesson verdicts

### equations-unknowns-g1

| Lesson | decision | visualDecision | gradeLanguageDecision | One-phrase reason |
|---|---|---|---|---|
| g1e-01-01 The Meaning of Equals | KEEP | REQUIRED | FIT | all math verified correct, zero duplication, foundational balance-scale figures |
| g1e-01-02 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-01-03 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-01-04 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-01-05 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-02-01 Where the Unknown Hides | KEEP | REQUIRED | FIT | all math verified correct; S292 bar-join caption confirmed present/correct |
| g1e-02-02 | KEEP | SUFFICIENT | FIT | all math verified correct, commonErrors template verified accurate across 6 reuses |
| g1e-02-03 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-02-04 | KEEP | SUFFICIENT | FIT | all math verified correct |
| g1e-03-01 Solve and Check | KEEP | REQUIRED | FIT | all math verified correct |
| g1e-03-02 | KEEP | SUFFICIENT | FIT | all math verified correct; S294 "Put in 8 and check" label confirmed |
| g1e-03-03 | KEEP | SUFFICIENT | FIT | all math verified correct; S294 course-wide repairs confirmed present |

### compose-shapes-g1

| Lesson | decision | visualDecision | gradeLanguageDecision | One-phrase reason |
|---|---|---|---|---|
| g1s-01-01 What Makes a Shape | REVISE | REQUIRED | REVISE | 4 duplicate clusters + length-leak MCQ + "one corners" grammar x4 |
| g1s-01-02 | REVISE | SUFFICIENT | REVISE | 3 duplicate clusters (incl. length-leak MCQ) + "one corners" grammar |
| g1s-01-03 | REVISE | SUFFICIENT | REVISE | 4 duplicate clusters (incl. length-leak MCQ) + "one corners" grammar x2 |
| g1s-02-01 Putting Shapes Together | REVISE | REQUIRED | REVISE | 2 duplicate clusters + "joining" feedback wrongly pasted onto a cut scenario |
| g1s-02-02 | REVISE | SUFFICIENT | REVISE | 2 duplicate clusters (incl. length-leak MCQ) + "joining" feedback on a cut scenario |
| g1s-02-03 Making a Hexagon | REVISE | SUFFICIENT | REVISE | 3 duplicate clusters + "joining" feedback on a cut scenario |
| g1s-02-04 Filling an Outline | REVISE | SUFFICIENT | REVISE | 1 triple duplicate cluster + "joining" feedback on a cut scenario |
| g1s-03-01 | KEEP | REQUIRED | FIT | zero duplication, no defects found — only fully clean lesson in this course |
| g1s-03-02 | REVISE | SUFFICIENT | REVISE | numeric duplicate with g1s-01-01 + "one corners"/"one sides" grammar |
| g1s-03-03 | REVISE | SUFFICIENT | FIT | 2 duplicate clusters (incl. length-leak MCQ) |

### add-three-numbers-g1

| Lesson | decision | visualDecision | gradeLanguageDecision | One-phrase reason |
|---|---|---|---|---|
| g1t-01-01 Joining Three Groups | REVISE | REQUIRED | FIT | make-ten-bridge visual mismatch at c2 + false "double" feedback at ch1 |
| g1t-01-02 | REVISE | SUFFICIENT | FIT | source lesson for 2 cross-lesson duplicate clusters (k1, k3) |
| g1t-01-03 | REVISE | SUFFICIENT | FIT | false "double" feedback x2 (k1, k2) + false "not guaranteed" claim (k3) |
| g1t-01-04 Any Order Works | KEEP | SUFFICIENT | FIT | all math verified correct, zero duplication |
| g1t-02-01 Grouping to Make It Easy | REVISE | REQUIRED | FIT | false "not guaranteed" claim (k2) + arithmetic error + nonexistent-pair distractor (ch1) |
| g1t-02-02 | KEEP | SUFFICIENT | FIT | all math verified correct, zero duplication |
| g1t-02-03 | REVISE | SUFFICIENT | FIT | duplicate of g1t-01-02/k3 + incoherent unmotivated-number MCQ (k2) + false "double" feedback (ch1) |
| g1t-03-01 Choose Your Way (opener) | REVISE | REQUIRED | FIT | false "double" feedback (k3) |
| g1t-03-02 | REVISE | SUFFICIENT | FIT | duplicate of g1t-01-02/k1 (k3) |
| g1t-03-03 | REVISE | SUFFICIENT | FIT | false "not guaranteed" claim (k1) + false "double" feedback (ch1) |

## REVISE list (one-phrase reasons)

1. **g1s-01-01** — 4 cross-lesson duplicate clusters + severe MCQ length-leak (43 vs 9-15 chars) + "one corners" grammar x4
2. **g1s-01-02** — 3 cross-lesson duplicate clusters + "one corners" grammar
3. **g1s-01-03** — 4 cross-lesson duplicate clusters + "one corners" grammar x2
4. **g1s-02-01** — 2 duplicate clusters + "joining...both starting pieces" feedback wrongly pasted onto a cut/decompose scenario
5. **g1s-02-02** — 2 duplicate clusters + same "joining" feedback mismatch on a cut scenario
6. **g1s-02-03** — 3 duplicate clusters + same "joining" feedback mismatch on a cut scenario
7. **g1s-02-04** — 1 triple duplicate cluster + same "joining" feedback mismatch on a cut scenario
8. **g1s-03-02** — numeric duplicate with g1s-01-01 + "one corners"/"one sides" grammar
9. **g1s-03-03** — 2 duplicate clusters incl. the length-leak square-attributes MCQ
10. **g1t-01-01** — make-ten-bridge figure shows no third addend and the wrong sub-strategy at c2; "double" commonErrors template falsely applied to a two-addend, non-double problem at ch1
11. **g1t-01-02** — source lesson for two cross-lesson duplicate steps (k1 duplicated by g1t-03-02, k3 duplicated by g1t-02-03)
12. **g1t-01-03** — "double" commonErrors template falsely applied at k1 and k2; "not guaranteed here" distractor feedback is false for 3+4+3 (which does contain an equal pair)
13. **g1t-02-01** — "not guaranteed here" is false for 2+2+2; ch1's keyed answer names the wrong leftover addend ("join the 6" should be "join the 4") and one distractor references a nonexistent "4 and 4" pair
14. **g1t-02-03** — duplicate of g1t-01-02/k3; k2 is an internally incoherent MCQ citing numbers never shown; ch1's "double" template is false for 10+9
15. **g1t-03-01** — "double" commonErrors template falsely applied at k3 to a non-double, two-quantity problem
16. **g1t-03-02** — k3 duplicates g1t-01-02/k1 verbatim
17. **g1t-03-03** — "not guaranteed here" is false for 4+2+2 (contains an equal pair); ch1's "double" template is false for 8+2

## Implementation contracts for every REVISE

### 1. g1s-01-01 — `k1`, `k2`, `k3`, `ch1` (`content/courses/compose-shapes-g1/lessons/g1s-01-01.json`)

**Defect (duplication).** Four of this lesson's own steps are verbatim cross-lesson duplicates: `k1` ("How many corners does a triangle have?"=3) duplicates `g1s-01-02/k2`, `g1s-01-03/k2`, `g1s-02-03/ch1`; `k2` ("What makes a shape a square?") duplicates `g1s-03-03/ch1`; `k3` ("How many corners does a rectangle have?"=4) duplicates `g1s-01-03/ch1`; `ch1` ("How many sides does a square have?"=4) duplicates `g1s-03-02/ch1`.

**Defect (length-leak).** `k2`'s correct option, `"4 equal straight sides and 4 square corners"` (43 chars), is far longer than its three distractors `"Being red"`/`"Being large"`/`"Pointing upward"` (9-15 chars), letting a learner guess correctly from length alone regardless of content.

**Defect (grammar).** `commonErrors` feedback at `k1`, `k3` (and `k1`'s remedial mirror) reads `"That misses one corners..."` — should be `"one corner"`.

**Fix.** Since this lesson's steps are the *first* occurrence of each duplicated question (by lesson ordering), rewrite the numbers/shape choice in the **later** lessons' matching steps instead of here (see contracts for g1s-01-02, g1s-01-03, g1s-02-03, g1s-03-02, g1s-03-03) so this lesson's content can stand as the canonical version; independently, shorten or lengthen `k2`'s distractors so all four options are within a comparable word count of each other (e.g. expand `"Being red"` → `"Having a red colour"` or trim the correct option to `"4 equal sides, 4 square corners"`), and fix `"one corners"` → `"one corner"` in the three flagged strings.

### 2. g1s-01-02 — `k1`, `k2`, `ch1` (`content/courses/compose-shapes-g1/lessons/g1s-01-02.json`)

**Defect (duplication).** `k1` ("Which of these can change WITHOUT a triangle stopping being a triangle?") duplicates `g1s-01-03/k3` verbatim; `ch1` ("What makes a shape a rectangle?") duplicates `g1s-01-03/k1` and `g1s-02-02/ch1` verbatim, with the same 37-vs-9-15-char length leak as g1s-01-01/k2; `k2`'s triangle-corners numeric duplicates `g1s-01-01/k1`, `g1s-01-03/k2`, `g1s-02-03/ch1`.

**Defect (grammar).** `k2`'s commonErrors: `"That misses one corners..."`.

**Fix.** Rewrite `k1` to ask about a *different* shape's non-defining attributes (e.g. rectangle color/size/orientation, reusing the rectangle already introduced at `ch1`) so it no longer matches `g1s-01-03/k3` word-for-word; rewrite `ch1`'s distractor set to close the length gap (see g1s-01-01 fix); fix `"one corners"` → `"one corner"`. Leave `g1s-01-03`/`g1s-02-02` as the canonical copies since they are addressed in their own contracts below.

### 3. g1s-01-03 — `k1`, `k2`, `k3`, `ch1` (`content/courses/compose-shapes-g1/lessons/g1s-01-03.json`)

**Defect (duplication).** `k3` duplicates `g1s-01-02/k1`; `k1` (+its remedial) duplicates `g1s-01-02/ch1` and `g1s-02-02/ch1`; `k2` (triangle-corners numeric) duplicates `g1s-01-01/k1`, `g1s-01-02/k2`, `g1s-02-03/ch1`; `ch1` (rectangle-corners numeric) duplicates `g1s-01-01/k3`.

**Defect (grammar).** `"That misses one corners..."` at `k2` and `ch1`.

**Fix.** Since this lesson sits between the two other members of each cluster, renumber this lesson's specific instance numbers (e.g. change `k2`'s triangle to ask about a hexagon or a different already-taught shape's corner count, change `ch1`'s rectangle-corner question to a square or renumber the target shape) so no two lessons in the course ask the identical question; fix the two `"one corners"` occurrences.

### 4. g1s-02-01 — `k1`, `k2`, `k3`, `ch1` (`content/courses/compose-shapes-g1/lessons/g1s-02-01.json`)

**Defect (duplication).** `k1` (+remedial) duplicates `g1s-02-03/k1` (+its remedial) verbatim; `k3` duplicates `g1s-02-02/k2` verbatim.

**Defect (false feedback).** `ch1`'s prompt is `"A square is cut along one diagonal, leaving a triangle. How many corners does a triangle have?"` (a decompose/cut scenario with one starting piece). Its `value=5` commonError feedback reads `"That counts the corners of both starting pieces; joining them hides the edges that meet inside"` — this describes a *join* of *two* starting pieces, which does not exist in this cut scenario; there is only one square being cut, and nothing is joined. The same template is correctly matched at `k2` (a genuine join: "Two matching triangle halves of a square are joined... How many corners does a square have?").

**Fix.** For duplication, differentiate `k1`/`k3` from their `g1s-02-03`/`g1s-02-02` counterparts by changing the composing shapes (e.g. `k1`: two matching triangle halves joined along the *short* edge instead of the long edge, if geometrically distinct; or move this exact question to be the sole canonical instance and edit the other two). For the false feedback, rewrite `ch1`'s `value=5` feedback to match the actual cut scenario, e.g.: `"That counts a corner twice, or counts the original square's fourth corner that this triangle does not use; trace only this triangle's own three corners."`

### 5. g1s-02-02 — `k2`, `ch1`, `k3` (`content/courses/compose-shapes-g1/lessons/g1s-02-02.json`)

**Defect (duplication).** `ch1` ("What makes a shape a rectangle?") duplicates `g1s-01-02/ch1` and `g1s-01-03/k1` verbatim (same length leak); `k2` duplicates `g1s-02-01/k3` verbatim.

**Defect (false feedback).** `k3`'s prompt is the same "square cut along one diagonal" scenario as g1s-02-01/ch1; its `value=5` feedback is the identical mismatched "both starting pieces...joining" text.

**Fix.** Rewrite `ch1`'s distractor lengths to close the gap with the correct option (same fix family as g1s-01-01); differentiate `k2` from `g1s-02-01/k3` by changing the joined shapes; rewrite `k3`'s `value=5` feedback using the corrected cut-scenario wording from contract #4.

### 6. g1s-02-03 — `k1`, `k3`, `k2` (`content/courses/compose-shapes-g1/lessons/g1s-02-03.json`)

**Defect (duplication).** `k1` (+remedial) duplicates `g1s-02-01/k1` (+remedial) verbatim; `k3` duplicates `g1s-02-04/ch1` and `g1s-03-03/k2` verbatim (a 3-lesson cluster).

**Defect (false feedback).** `k2`'s prompt is the same "square cut along one diagonal" scenario; its `value=5` feedback is the identical mismatched "both starting pieces...joining" text.

**Fix.** Differentiate `k1` from `g1s-02-01/k1` (change the composing pieces); pick one of the three hexagon-question lessons (`g1s-02-03/k3`, `g1s-02-04/ch1`, `g1s-03-03/k2`) as canonical and rewrite the other two with a different phrasing or a different but equivalent check (e.g. ask for the *side count* instead of the *shape name*, as `g1s-02-03/i2`'s tapDiagram already does, to avoid re-duplicating); rewrite `k2`'s feedback with the corrected cut-scenario wording. Note: the remedial id `rem-g1s-make-hexagon-k` mirroring this lesson's own `k1` verbatim is the accepted convention and needs no change.

### 7. g1s-02-04 — `ch1`, `k2` (`content/courses/compose-shapes-g1/lessons/g1s-02-04.json`)

**Defect (duplication).** `ch1` is the third member of the `g1s-02-03/k3` / `g1s-03-03/k2` hexagon-question cluster (see contract #6).

**Defect (false feedback).** `k2`'s prompt is the same cut-scenario as the other three; its `value=5` feedback is the identical mismatched text.

**Fix.** Resolve as part of contract #6's three-way cluster fix; apply the corrected cut-scenario feedback from contract #4 to `k2`.

### 8. g1s-03-02 — `ch1`, `k2` (`content/courses/compose-shapes-g1/lessons/g1s-03-02.json`)

**Defect (duplication).** `ch1` ("How many sides does a square have?"=4) duplicates `g1s-01-01/ch1` verbatim.

**Defect (grammar).** `k2`: `"That misses one corners of the finished square..."`; `ch1`: `"That misses one sides..."`.

**Fix.** Change `ch1`'s shape or attribute (e.g. ask about the recomposed *rectangle*'s side count instead of the square's, consistent with this lesson's own decompose/recompose topic) so it no longer matches `g1s-01-01/ch1`; fix `"one corners"` → `"one corner"` and `"one sides"` → `"one side"`.

### 9. g1s-03-03 — `ch1`, `k2` (`content/courses/compose-shapes-g1/lessons/g1s-03-03.json`)

**Defect (duplication).** `ch1` ("What makes a shape a square?") duplicates `g1s-01-01/k2` verbatim (same length leak); `k2` is the third member of the hexagon-question cluster from contract #6.

**Fix.** Since `g1s-01-01/k2` is addressed in contract #1 (distractor-length fix), differentiate this copy further by asking about the *rectangle* instead of the *square* (this lesson already discusses rectangles via its own `k1`/`ch1` composition context) rather than repeating the identical square question; resolve `k2` as part of contract #6.

### 10. g1t-01-01 — `c2`, `ch1` (`content/courses/add-three-numbers-g1/lessons/g1t-01-01.json`)

**Defect (visual mismatch).** `steps` `c2`'s `figure` is `"make-ten-bridge"`. `src/components/figures.tsx` (`function MakeTenBridge`, ~L7004) renders two ten-frames with `<title>...eight plus five equals ten plus three equals thirteen</title>` and the on-canvas caption `8 + 5 = 10 + 3 = 13` — a single-fact decompose/bridge strategy over exactly **two** numbers (8 and 5), never three. `c2`'s body text reads: *"Adding three numbers is really two additions in a row. Finish the first pair before bringing in the third addend."* There is no "third addend" anywhere in the figure, and the strategy shown (decomposing one addend to bridge to ten) is different from the "spot an existing ten-partner pair among three given addends" strategy this course actually teaches starting the very next lesson (`g1t-01-02`). This is the figure's first appearance in the course, immediately after `c1`'s bar-join figure needed the identical kind of grounding caption added in S292, and `c2` was missed by that repair.

**Defect (false feedback).** `ch1`'s numeric widget prompt is `"Maggie has 4 red beads and 9 blue beads. How many beads does she have altogether?"` (answer 13; only two addends, 4 ≠ 9 so no double exists and there is no third addend in this problem at all). Its `commonErrors` are `value=4`: `"That is the double alone; the third addend still has to join it."` and `value=11`: `"That uses only one of the two equal groups from the double."` — both false: this problem has neither a double nor a third addend.

**Fix.** For `c2`, either (a) replace `"figure": "make-ten-bridge"` with a genuine three-addend figure (e.g. reuse `bar-join` again, or a new figure showing three labeled groups joining in two steps), or (b) keep the figure but rewrite the body text to actually describe single-fact make-ten bridging instead of the "third addend" framing (deferring the three-addend "two additions in a row" teaching point entirely to `c1`). Option (a) is preferred since `c1` already establishes the two-part bar model and `c2` should extend it to three parts, which `make-ten-bridge` structurally cannot show. For `ch1`, replace both `commonErrors` entries with feedback that matches this problem's actual structure, e.g. `value=4`: `"That is only the red beads; the blue beads still need to join them."` and `value=11`: `"That is one less than the full total; recount both groups together."`

### 11. g1t-01-02 — `k1`, `k3` (`content/courses/add-three-numbers-g1/lessons/g1t-01-02.json`)

**Defect (duplication, as the shared source).** `k1` ("4 + ? = 10. What makes ten with 4?"=6) is duplicated verbatim by `g1t-03-02/k3`; `k3` ("To add 4 + 6 + 7, which two should you group first?") is duplicated verbatim by `g1t-02-03/k1` (+its remedial).

**Fix.** Treat this lesson's `k1`/`k3` as canonical (first occurrence) and change the numbers/wording in the two later lessons instead — see contracts #14 (g1t-02-03) and #16 (g1t-03-02). No change needed inside this file itself; flagged so the disposition record reflects that this lesson's content is duplicated elsewhere.

### 12. g1t-01-03 — `k1`, `k2`, `k3` (`content/courses/add-three-numbers-g1/lessons/g1t-01-03.json`)

**Defect (false feedback).** `k1`'s prompt `"6 + 7 = ?"` (answer 13, 6≠7 so no double) carries `value=6`: `"That is the double alone; the third addend still has to join it"` and `value=10`: `"That uses only one of the two equal groups from the double"` — both false (no double, no third addend in a bare two-number fact). `k2`'s prompt `"Double 8 means 8 + 8. What is the double?"` (answer 16) carries the identical template on `value=10`/`value=11`, neither of which relates to "the double alone" (which would be 16 itself, the correct answer) or "one of the two equal groups" (which would be 8).

**Defect (false claim).** `k3` (+remedial) MCQ `"Which strategy fits 3 + 4 + 3 best?"` rejects `"Use a double"` with `"A double only helps when two addends are equal, which is not guaranteed here"` — false, since 3+4+3 contains an equal pair (3 and 3); a double genuinely is usable here (3+3=6, +4=10), it is simply not the *fastest* choice given how small all three addends already are.

**Fix.** For `k1`, replace `commonErrors` with feedback matching a plain two-addend fact, e.g. `value=6`: `"That is only one addend; 7 still needs to join it."` For `k2`, replace with feedback matching a single-double-fact check, e.g. `value=10`: `"That mixes in a make-ten strategy; this asks for the double itself, 8 + 8."` For `k3` (and its remedial), reword the `"Use a double"` rejection to something true for every instance of this reused template, e.g.: `"A double is possible here, but with addends this small, any order is just as fast — no strategy saves real time."`

### 13. g1t-02-01 — `k2`, `ch1` (`content/courses/add-three-numbers-g1/lessons/g1t-02-01.json`)

**Defect (false claim).** `k2` MCQ `"Which strategy fits 2 + 2 + 2 best?"` rejects `"Use a double"` with `"...which is not guaranteed here"` — false; 2+2+2 has three mutually equal addends, the maximal case of a double being available.

**Defect (arithmetic/reference error).** `ch1` MCQ `"Which pair is the helpful double in 4 + 5 + 5?"` — the keyed-correct option `o0`'s own feedback reads `"Correct — a known double is instant, so double first and then join the 6"`, but the third addend in 4+5+5 (after removing the double 5+5) is **4**, not 6. Option `o1`'s feedback claims `"Scanning these addends finds no ten-partner pair"`, but 5+5=10 is itself both the double *and* a ten-partner pair. Option `o2`'s label `"4 and 4"` references a pair that does not exist among the addends 4, 5, 5 (only one 4 is present).

**Fix.** Reword `k2`'s `"Use a double"` rejection using the same fix as g1t-01-03/k3 above (double is possible but unnecessary given small numbers). For `ch1`: change `"then join the 6"` → `"then join the 4"`; change `o1`'s feedback to something true, e.g. `"This pair is the double itself, just not fully used — group both 5s together instead"`; change `o2`'s label from `"4 and 4"` to a pair that actually exists but is suboptimal, e.g. `"4 and 5"` (matching `o1`'s existing content) — or replace `o2` entirely with a genuinely distinct distractor.

### 14. g1t-02-03 — `k1`, `k2`, `ch1` (`content/courses/add-three-numbers-g1/lessons/g1t-02-03.json`)

**Defect (duplication).** `k1` (+remedial) duplicates `g1t-01-02/k3` verbatim ("To add 4 + 6 + 7, which two should you group first?").

**Defect (incoherent/unmotivated feedback).** `k2`'s prompt, `"Why is a ten-partner pair a smart first choice?"`, is fully abstract with no numbers. Its keyed feedback (`"Correct — 8 and 2 make exactly ten, which leaves an easy ten-plus-4 to finish"`) and `o2`'s feedback (`"This pair misses the ten that 8 and 2 would have made together"`) introduce specific numbers 8/2/4 that appear nowhere in the prompt. `o1`'s label (`"It changes one addend into zero"`) has no coherent relationship to its own feedback (`"This pair does not land on ten, so the last step stays awkward"`) — this option is internally incoherent regardless of the missing-numbers issue.

**Defect (false feedback).** `ch1`'s prompt `"10 + 9 = ?"` (10≠9, no double, no third addend) carries the same "double alone/third addend" template as contract #12, on `value=10`/`value=14`.

**Fix.** For `k1`, change the addend numbers (e.g. "5 + 3 + 8") so it no longer matches `g1t-01-02/k3` verbatim. For `k2`, either (a) add concrete numbers to the prompt (e.g. "In 8 + 2 + 4, why is grouping 8 and 2 first a smart choice?") so the existing feedback is grounded, or (b) fully genericize every option's label/feedback to avoid any specific numbers, and rewrite `o1` so its label and feedback describe the same claim (e.g. label `"It changes one addend into a friendlier number"` paired with matching feedback). For `ch1`, replace the two commonErrors with feedback matching a plain two-addend fact (same pattern as contract #12's `k1` fix).

### 15. g1t-03-01 — `k3` (`content/courses/add-three-numbers-g1/lessons/g1t-03-01.json`)

**Defect (false feedback).** Prompt `"A full ten has 7 more counters joined. What teen total is shown?"` (answer 17; a ten-plus-seven structure, no double, no separate third addend beyond the two named quantities) carries `value=14`: `"That is the double alone; the third addend still has to join it"` and `value=10`: `"That uses only one of the two equal groups from the double"` — both false; there is no double anywhere in a "ten plus seven" fact.

**Fix.** Replace with feedback matching the actual ten-plus-leftover structure, e.g. `value=14`: `"That is 10 + 4, not 10 + 7 — recount the counters joined to the full ten."` and `value=10`: `"That stops at the full ten without adding the 7 more counters."`

### 16. g1t-03-02 — `k3` (`content/courses/add-three-numbers-g1/lessons/g1t-03-02.json`)

**Defect (duplication).** `k3` ("4 + ? = 10. What makes ten with 4?"=6) duplicates `g1t-01-02/k1` verbatim.

**Fix.** Change the known addend (e.g. "7 + ? = 10. What makes ten with 7?"=3) so it no longer matches `g1t-01-02/k1`, while keeping this step's `PartWholeNumeric`/"known total, hidden addend" framing intact.

### 17. g1t-03-03 — `k1`, `ch1` (`content/courses/add-three-numbers-g1/lessons/g1t-03-03.json`)

**Defect (false claim).** `k1` (+remedial) MCQ `"Which strategy fits 4 + 2 + 2 best?"` rejects `"Use a double"` with `"...which is not guaranteed here"` — false; 4+2+2 contains an equal pair (2 and 2).

**Defect (false feedback).** `ch1`'s prompt `"8 + 2 = ?"` (8≠2, no double, no third addend) carries the "double alone/third addend" template on `value=8`/`value=6`.

**Fix.** Reword `k1`'s (+remedial's) `"Use a double"` rejection using the same fix as contracts #12/#13 (double is possible but unnecessary/not the fastest given the numbers). Replace `ch1`'s two commonErrors with feedback matching a plain two-addend fact (same pattern as contract #12's `k1` fix), e.g. `value=8`: `"That is only one addend; 2 still needs to join it."`

## Notes on scope and authority

- All findings above were independently recomputed by hand (arithmetic checked against every flagged `commonErrors`/MCQ-option value, not inferred from labels alone) and, for the visual-mismatch finding, by reading the actual SVG/title source in `src/components/figures.tsx` rather than trusting the figure id alone.
- No lesson or course source file was modified; this session is read-only on content, write-only on the staging NDJSON and this report, per the packet's read-only mandate.
- The "double alone / two equal groups from the double" commonErrors template and the "A double only helps when two addends are equal, which is not guaranteed here" MCQ-distractor template are the same defect class repeated across add-three-numbers-g1: a fixed misconception-feedback pair pasted into `numeric`/`mcq` widgets without verifying, per instance, that (a) the specific problem's addends actually contain (or lack) a double, and (b) the flagged wrong `value` actually corresponds to the named misconception. Confirmed via a full-corpus grep restricted to these two exact phrase families across all 10 lesson files, then hand-verified against each widget's own prompt/answer.
- The "That counts the corners of both starting pieces; joining them hides the edges that meet inside" commonErrors template in compose-shapes-g1 is correctly matched wherever the prompt actually describes joining two pieces (e.g. `g1s-02-01/k2`, `g1s-02-02/k1`, `g1s-03-02/k2`, `g1s-03-03/k1`) and was **not** flagged in those instances; it is only flagged where the identical text was pasted onto a *cut/decompose* prompt ("A square is cut along one diagonal, leaving a triangle...") that has one starting piece, not two.
- The "one corners"/"one sides" grammar defect (singular "one" followed by a plural noun) was confirmed via a full-corpus grep for the pattern `one [a-z]+s\b` across compose-shapes-g1, cross-checked against equations-unknowns-g1 and add-three-numbers-g1 (neither of which showed any instance of this pattern) to confirm it is specific to this course rather than a shared, out-of-scope template.
- equations-unknowns-g1's reused feedback templates (e.g. "That is the whole, not the missing part" / "That repeats the known addend", reused 6x each across g1e-02-02/g1e-02-03) were spot-checked the same way and found to generalize correctly in every instance — each template's flagged `value` genuinely matches the claimed misconception for that specific problem's numbers, unlike the mismatched templates found in the other two courses. This is offered as a positive contrast confirming the all-KEEP disposition was not a lighter-touch review.
- `readingProfile` is `"standard"` in all 32 lessons (no variation to assess against reading-profile caps).
- No widget type used in these three courses (`mcq`, `numeric`, `numberLineHop`, `tenFrame`, `tapDiagram`, `dragBucket`) is one of the S316 lab-widget types (`ProportionalReasoningLabW`, `PercentChangeLabW`, etc.), so the S316 fix/its follow-up list is not applicable here.
- No finding in this packet required `visualDecision=ESCALATE` or `decision=ESCALATE`: every defect found has a concrete, content-level fix (a figure-id swap, a feedback rewrite, a number change) that an implementation worker can apply without a design-authority decision.
