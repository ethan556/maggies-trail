# S320 Assessment — Packet A8 (Independent Course Assessor)

Reviewer: Claude Cowork independent assessor (S320)
Reviewed at: 2026-08-20T18:28:19.000Z
Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (MT-V4-WORKER-PREFIX-1), read and applied in full.
Scope: `content/courses/solving-equations`, `content/courses/linear-equations-systems`, `content/courses/quadratics` — 3 course.json files + all 36 lessons, read in full, math hand-recomputed, duplication scanned programmatically and confirmed by direct inspection.
Method: Every lesson file was read in full. Every numeric solution, discriminant, vertex, factoring, and system solution was recomputed by hand (systems checked in both equations). A programmatic equation-core scanner (scratch, not part of the repo) was used to surface candidate duplicate equations within and across lessons; every candidate was manually inspected in context before being counted as a defect. Dispositions were written only to the two files named in the task packet. The ledger (`LESSON_REVIEW_DECISIONS_S244.jsonl`) was not written.

No npm/vitest/tsc was run (per instructions). All 36 `reviewedBasisHash` values were generated via `node scripts/session/print-review-basis.mjs` and independently re-verified by a second run before this report was finalized.

## Summary counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| solving-equations | 12 | 1 | 11 | 0 |
| linear-equations-systems | 12 | 8 | 4 | 0 |
| quadratics | 12 | 4 | 8 | 0 |
| **Total** | **36** | **13** | **23** | **0** |

`visualDecision` = SUFFICIENT and `gradeLanguageDecision` = FIT on all 36 records. No lesson had a missing/broken promised visual (all referenced figure IDs resolve in `src/components/figureIds.ts`/`figures.tsx` with accessible `<title>`; interactive widgets render the actual synchronized quantities checked below), and no lesson had grade-inappropriate language. The corpus's real problems are concentrated in two categories: (1) a pervasive **assessment-validity defect** — an ungraded interactive (or, twice, a concept's worked example) fully solves and reveals the answer to an equation/system that a *graded* check or challenge then re-asks verbatim, immediately or a few steps later — and (2) one **hard mathematical error**.

## Two defect patterns found (for calibration)

**Pattern D1 — pre-answered graded check.** An ungraded `interactive` step (dragOrder, matchPairs, equationOutcomeLab, solveBalance, or a `predict`/`reveal` block) states the full solved answer for an equation/system, and a `check` or `challenge` step — graded — asks the *identical* equation/system a few steps later (sometimes the very next step). This makes the "check" a memory-recall exercise rather than an independent test of the target skill. This is the same category of defect as the precedent in `laneAV-g2-g3-dispositions.jsonl` (lesson f20-01-01: "remedial check tests the identical numeric fact as the main-sequence check"), generalized here to (a) main-sequence interactive→check adjacency and (b) remedial→main-check identity.

**Pattern D2 — cross-lesson verbatim reuse.** In `linear-equations-systems` chapters 3–4, a *later* lesson's graded check reuses the exact system (same slopes/intercepts, same numeric answer) that an *earlier*, sequential lesson already used as its own graded check. Per grade-band/course-sequence precedent, the fix is attributed to the later lesson; the earlier, original occurrence is left KEEP.

Distinguished from these (and explicitly **not** flagged) are legitimate, standard patterns: a concept's worked example immediately followed by *ungraded* interactive practice on the same problem (standard fade); a remedial concept+check pair that reteaches using the remedial's *own* fresh example (not any main-sequence item) and then checks recall of that same reteaching — standard low-stakes remediation, seen correctly implemented in `qu-04-01`, `qu-04-02`, `qu-01-01`, `qu-01-02`; two questions built from one shared equation/system that test two genuinely different sub-skills (e.g., x-coordinate vs. y-coordinate of a vertex, or "find x" then "find y" in a word problem); and transparent, openly-labeled recap/matching activities that resynthesize prior examples in one place (e.g., `les-03-03`'s i3).

---

## Per-lesson verdicts

### solving-equations

| Lesson | decision | visualDecision | gradeLanguageDecision | One-line reason |
|---|---|---|---|---|
| alg1-01-01 | REVISE | SUFFICIENT | FIT | i2 (matchPairs) reveals k2's and ch1's equations verbatim |
| alg1-01-02 | REVISE | SUFFICIENT | FIT | i2 (matchPairs) reveals k2's and ch1's equations verbatim |
| alg1-01-03 | REVISE | SUFFICIENT | FIT | i1 (equationOutcomeLab) fully solves k1's equation immediately prior |
| alg1-02-01 | REVISE | SUFFICIENT | FIT | i1 and i2 fully solve/reveal k2's and ch1's equations |
| alg1-02-02 | REVISE | SUFFICIENT | FIT | i2 (equationOutcomeLab) fully solves k2's equation immediately prior |
| alg1-02-03 | REVISE | SUFFICIENT | FIT | i2 (equationOutcomeLab) fully solves k2's equation immediately prior |
| alg1-03-01 | REVISE | SUFFICIENT | FIT | i2 (matchPairs) reveals k2's symbolic question verbatim |
| alg1-03-02 | REVISE | SUFFICIENT | FIT | Hard math error: i1 states false equation/answer for A=bh/2 |
| alg1-03-03 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| alg1-04-01 | REVISE | SUFFICIENT | FIT | i1 (equationOutcomeLab) fully solves k1's inequality immediately prior |
| alg1-04-02 | REVISE | SUFFICIENT | FIT | c1 reveals k1's answer; i2 fully solves k2's inequality immediately prior |
| alg1-04-03 | REVISE | SUFFICIENT | FIT | i1/i2 fully solve/reveal k1's and k2's inequalities |

### linear-equations-systems

| Lesson | decision | visualDecision | gradeLanguageDecision | One-line reason |
|---|---|---|---|---|
| les-01-01 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| les-01-02 | REVISE | SUFFICIENT | FIT | i1 (solveBalance) fully solves k1's equation immediately prior |
| les-01-03 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| les-02-01 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| les-02-02 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| les-02-03 | KEEP | SUFFICIENT | FIT | Clean — all math verified, no duplication |
| les-03-01 | KEEP | SUFFICIENT | FIT | Clean, original occurrence of its systems |
| les-03-02 | REVISE | SUFFICIENT | FIT | k2/k3 and ch1 verbatim-reuse les-03-01's k2 and ch1 systems |
| les-03-03 | KEEP | SUFFICIENT | FIT | Clean — internal repeat is a transparent, labeled recap (i3) |
| les-04-01 | KEEP | SUFFICIENT | FIT | Clean, original occurrence of its systems |
| les-04-02 | REVISE | SUFFICIENT | FIT | 6 of 7 systems verbatim-reuse les-04-01's systems |
| les-04-03 | REVISE | SUFFICIENT | FIT | Word problems verbatim-reuse les-04-01/04-02's bare systems |

### quadratics

| Lesson | decision | visualDecision | gradeLanguageDecision | One-line reason |
|---|---|---|---|---|
| qu-01-01 | KEEP | SUFFICIENT | FIT | Clean — remedial tests a distinct sub-fact, not a duplicate |
| qu-01-02 | KEEP | SUFFICIENT | FIT | Clean — remedial tests a distinct sub-fact, not a duplicate |
| qu-01-03 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k2 |
| qu-02-01 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k1; i1 also pre-reveals k1 |
| qu-02-02 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k1 |
| qu-02-03 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k1 |
| qu-03-01 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k1; k1 also duplicates qu-02-03/k3 |
| qu-03-02 | REVISE | SUFFICIENT | FIT | Remedial is a verbatim duplicate of k1 |
| qu-03-03 | REVISE | SUFFICIENT | FIT | i1's predict block pre-reveals k1's exact question/answer |
| qu-04-01 | KEEP | SUFFICIENT | FIT | Clean — remedial reuses only the concept's own example |
| qu-04-02 | KEEP | SUFFICIENT | FIT | Clean — remedial reuses only the concept's own example |
| qu-04-03 | REVISE | SUFFICIENT | FIT | i1's predict block pre-reveals k1's exact answer (P=36) |

---

## Implementation contracts (one per REVISE lesson)

Each contract names the exact step/widget/field to change and a concrete replacement that removes the duplicate while preserving the lesson's pedagogical intent. After any edit, `reviewedBasisHash` for that lesson (and any lesson it cross-references) will change; this disposition's `reopenCondition` fires automatically and the lesson must be re-reviewed.

### solving-equations

**alg1-01-01** — `steps[].id="i2"` (matchPairs). `left.e2.label` = `"5x + 3 = 38"` duplicates `ch1`'s exact equation (answer 7); `left.e3.label` = `"3x − 5 = 16"` duplicates `k2`'s exact equation (answer 7). Fix: replace both with fresh equations not used elsewhere in the lesson, keeping the "two different equations, same solution" teaching point intact, e.g. e2 → `"6x − 4 = 38"` (→ x=7) and e3 → `"4x + 9 = 37"` (→ x=7). Update the two `pairErrors` feedback strings that quote the old equation text, and `right`/`pairs` stay as-is (same target ids, same x=7 answer).

**alg1-01-02** — `steps[].id="i2"` (matchPairs). `left.f1.label` = `"7x + 3 = 4x + 15"` duplicates `k2` (answer 4); `left.f2.label` = `"9x + 4 = 5x + 24"` duplicates `ch1` (answer 5). Fix: replace with fresh both-sides equations giving the same target answers (to keep `pairs`/`right` unchanged), e.g. f1 → `"8x + 1 = 5x + 13"` (→ x=4) and f2 → `"7x + 2 = 3x + 22"` (→ x=5). Update the two `pairErrors` feedback strings accordingly.

**alg1-01-03** — `steps[].id="i1"` (equationOutcomeLab). `prompt`/`leftDisplay`/`rightDisplay` = `3(x + 4) = 27` is `k1`'s exact equation; `operations` walks it to x=5 and `successFeedback` states "x = 5". Fix: change i1's equation to a fresh distribute-then-solve example not equal to `3(x+4)=27`, e.g. `4(x + 2) = 32` (→ 4x+8=32 → x=6), updating `leftCoeff`/`leftConstant`/`rightConstant`, all three `operations[].label` strings, and `successFeedback` to match the new numbers.

**alg1-02-01** — `steps[].id="i1"` (equationOutcomeLab, `x/4 − 3 = 2` → 20, duplicates `k2`) and `steps[].id="i2"` (matchPairs, `left.e1` = `x/4 − 3 = 2` → 20 duplicates `k2` again; `left.e2` = `x/5 + 1 = 4` → 15 duplicates `ch1`). Fix: change i1's equation to a fresh one-fraction example, e.g. `x/3 − 2 = 4` (→ x=18), updating its `operations` labels and `successFeedback`; change i2's `e1`/`e2` labels to fresh equations not matching k2/ch1 while preserving their `right` answers (20 and 15) so `pairs` stays valid, e.g. e1 → `"x/5 + 2 = 6"` (→ x=20), e2 → `"x/3 + 2 = 7"` (→ x=15). Update the two `pairErrors` strings.

**alg1-02-02** — `steps[].id="i2"` (equationOutcomeLab). `x/2 + x/5 = 7` is `k2`'s exact equation, solved to x=10 in `operations`/`successFeedback`. Fix: change i2 to a fresh two-fraction example, e.g. `x/3 + x/4 = 7` (→ 4x+3x=84 → x=12), updating `leftCoeff` (7/12), `rightConstant`, all `operations[].label` strings, and `successFeedback`.

**alg1-02-03** — `steps[].id="i2"` (equationOutcomeLab). `0.2x + 3 = 4` is `k2`'s exact equation, solved to x=5 in `operations`/`successFeedback`. Fix: change i2 to a fresh decimal example, e.g. `0.4x + 1 = 5` (→ 4x+10=50 → x=10), updating `leftCoeff`, `leftConstant`, `rightConstant`, all `operations[].label` strings, and `successFeedback`.

**alg1-03-01** — `steps[].id="i2"` (matchPairs). `left.m1.label` = `"d = rt, solve for t"` / `right.r1.label` = `"t = d/r"` is verbatim identical to `k2`'s prompt and correct option. Fix: replace `m1`/`r1` with a fresh literal-equation pair not reused in the checks, e.g. `"P = 4s, solve for s"` → `"s = P/4"` (a perimeter-of-square analog), updating the `pairs` mapping and the `pairErrors` feedback string that references `m1`.

**alg1-03-02** — Hard math error, not a duplicate. `steps[].id="i1"` (solveBalance), fields `a: 3, b: 0, c: 24`. Prompt states "A = bh/2 with A = 12 and b = 6 becomes 3h + 2 = 12" — wait, actual text: "becomes 3h + 2 = 12" is not present; actual current text is "becomes 3h = 24" and `successFeedback` states "h = 8" — both false. Correct derivation: A=bh/2, A=12, b=6 → 12 = 3h → h = 4 (equivalently, doubling both sides: 24 = 6h → h = 4). Fix: set `widget.a` to `6` (not 3) so the balance reads "6h = 24" (`c` stays 24), and update: `prompt` "becomes 6h = 24"; `successFeedback` to "h = 4. Doubling first cleared the fraction..."; `missFeedback` "6h = 24 splits into 6 equal groups." No other fields in this lesson need to change — `k1`, `c2`, `ch1`, and the remedial all already use A=24 or A=30 correctly and are unaffected.

**alg1-04-01** — `steps[].id="i1"` (equationOutcomeLab). `2x + 3 < 11` is `k1`'s exact inequality, solved to x<4 in `operations`/`successFeedback`. Fix: change i1 to a fresh one-step-plus-constant inequality, e.g. `3x + 2 < 14` (→ x<4 preserved, or vary the boundary too: `3x + 1 < 13` → x<4). To fully avoid any residual overlap, prefer a different boundary too, e.g. `2x + 5 < 15` (→ x<5), updating `leftCoeff`/`leftConstant`/`rightConstant`, all `operations[].label` strings, and `successFeedback`.

**alg1-04-02** — Two sites. (1) `steps[].id="c1"` concept body states "Solve −2x < 6 ... x > −3" verbatim, and `steps[].id="k1"` (buildExpression) asks to solve the identical `−2x < 6`. Fix: change c1's worked example to different numbers, e.g. `−3x < 9 → x > −3` (keeps the same lesson-opening intuition pump but no longer states k1's literal equation and answer). (2) `steps[].id="i2"` (equationOutcomeLab) fully solves `−3x + 1 > 10 → x < −3`, which is `k2`'s exact inequality. Fix: change i2 to a fresh two-step flip example, e.g. `−2x + 5 > 15` (→ −2x>10 → x<−5), updating `leftCoeff`/`leftConstant`/`rightConstant`, all `operations[].label` strings, and `successFeedback`.

**alg1-04-03** — `steps[].id="i1"` (equationOutcomeLab, `2x + 5 > 5x − 4` → x<3, duplicates `k1`) and `steps[].id="i2"` (matchPairs, `left.e1` repeats the same system verbatim; `left.e3` = `4x + 2 > x + 11` → x>3 duplicates `k2`). Fix: change i1 to a fresh both-sides inequality, e.g. `3x + 4 > 6x − 8` (→ −3x>−12 → x<4), updating `leftCoeff`/`leftConstant`/`rightCoeff`/`rightConstant` and all `operations[].label`/`successFeedback`; change i2's `e1`/`e3` labels to fresh inequalities preserving their `right` answers (x<3 and x>3 respectively) so `pairs` stays valid, and update the two `pairErrors` strings.

### linear-equations-systems

**les-01-02** — `steps[].id="i1"` (solveBalance, fields `a:2,b:2,c:10`). Prompt walks `5x + 2 = 3x + 10` to x=4, which is `k1`'s exact equation. Fix: change i1 to a fresh both-sides example, e.g. `4x + 3 = 2x + 11` (→ 2x+3=11 → x=4, i.e. `a:2,b:3,c:11`), updating `prompt` and `successFeedback` text to match.

**les-03-02** — `steps[].id="k2"`/`"k3"` (affineRelationshipLab) use `y = −x + 4, y = 2x − 5` → (3,1), and `steps[].id="ch1"` uses `y = 3x − 4, y = x + 2` → (3,5) — both are byte-for-byte the same systems as `les-03-01`'s `k2` and `ch1`. Fix: replace with fresh systems giving fresh intersection points not used in `les-03-01` (or elsewhere in this lesson), e.g. k2/k3 → `y = −2x + 9, y = x − 3` (→ −2x+9=x−3 → 3x=12 → x=4, y=1; point (4,1)), and ch1 → `y = 2x − 1, y = x + 4` (→ x=5, y=9; point (5,9)). Update all `lines[].m/b/sourceText`, `pointErrors` values/feedback, and `successFeedback`/`fallbackFeedback` text for both steps to the new numbers.

**les-04-02** — Six of seven graded/interactive items verbatim-reuse `les-04-01`'s systems (only asking for "y" instead of "x"): `i1`/`k3` reuse `y=3x, 2x+y=10`; `k1` uses a fresh system (`y=x−2, 2x+y=10`, keep as-is); `i2` reuses `y=2x, x+y=9`; `k2` reuses `y=x+1, x+y=7`; `ch1` reuses `y=3x−5, x+y=7`; `remedial` reuses `y=4x, x+y=10`. Fix: since the lesson's own theme (back-substitution) legitimately continues from a *known* x, replace the recycled *systems* with fresh ones the student has not seen graded on, while keeping the "x is given, find y" task shape, e.g. i1/k3 → `y=5x, 3x+y=16` (x=2,y=10); i2 → `y=3x, x+y=12` (x=3,y=9); k2 → `y=x+2, x+y=8` (x=3,y=5); ch1 → `y=2x−3, x+y=9` (x=4,y=5); remedial → `y=5x, x+y=12` (x=2,y=10, distinct from i1/k3's new system). Update each step's `prompt`, `lines[].m/b/sourceText`, `pointErrors`/`numericErrors` values and feedback, and `successFeedback`/`fallbackFeedback`.

**les-04-03** — Word-problem systems verbatim-reuse bare-algebra systems from `les-04-01`/`les-04-02`: `i1`/`k1` reuse `y=4x, x+y=10`; `i2`/`k2` reuse `y=2x, x+y=9`; `k3` reuses `y=x+1, x+y=7`; `remedial` reuses `y=2x, x+y=9` again; `ch1` (`y=3x+2, x+y=10`) is already fresh and needs no change. Fix: rewrite the underlying relationships (keep the word-problem framing) to fresh numbers not solved bare-algebra earlier in the chapter, e.g. i1/k1 ("two numbers add to 10, larger = 4× smaller") → change the total to 15 with the same 4:1 ratio (`y=4x, x+y=15` → x=3,y=12); i2/k2 (rope) → change total to 12 with the same 2:1 ratio (`y=2x, x+y=12` → x=4,y=8); k3 (tickets) → change total to 9 with "two more adults" (`y=x+2, x+y=9` → x=3.5 is non-integer, so instead use total 11: `y=x+2, x+y=11` → x=4.5 also non-integer; prefer total 13, one-more-adult: `y=x+1, x+y=13` → x=6,y=7); remedial → a system distinct from the corrected i2/k2, e.g. `y=3x, x+y=12` (x=3,y=9). Update every affected step's `prompt`, `lines[].m/b/sourceText`, `numericErrors` values/feedback, and `successFeedback`/`fallbackFeedback`.

### quadratics

**qu-01-03** — `remedials[0].check` (`rem-qt-k`) prompt `"For y = (x + 2)^2 + 5, what is the x-coordinate of the vertex?"` (answer −2) is byte-for-byte identical to `k2`. Fix: change the remedial's own worked example (and its check) to a fresh vertex-form instance not used as a main check, e.g. concept → `(x + 5)^2 + 1` (vertex (−5,1)) and check prompt → `"For y = (x + 5)^2 + 1, what is the x-coordinate of the vertex?"` answer −5, updating `commonErrors`/`fallbackFeedback` to match.

**qu-02-01** — `remedials[0].check` (`rem-qzp-k`) is byte-for-byte identical to `k1` (`x^2 − x − 6 = 0` factors as `(x−3)(x+2)`, larger solution 3). Additionally `i1`'s `predict.reveal` states "x = 3 or x = −2" for the same factored form immediately before `k1`. Fix (primary): change the remedial's concept+check to a fresh zero-product example not equal to k1's, e.g. `x^2 + x − 12 = 0 = (x+4)(x−3)`, larger root 3 — note this still equals 3, so prefer `x^2 − 3x − 10 = 0 = (x−5)(x+2)`, larger root 5, updating `rem-qzp-c` body, the check `prompt`/`answer`/`commonErrors`/`fallbackFeedback`. (Secondary, optional) soften `i1.predict.reveal` to state the reasoning without the bare final root pair, since c1/i1 together still fully derive `(x−3)(x+2)=0 → 3, −2` before k1 is reached.

**qu-02-02** — `remedials[0].check` (`rem-qfs-k`) prompt `"Solve x^2 + 5x + 6 = 0. What is the larger solution?"` (answer −2) is byte-for-byte identical to `k1`. Fix: change the remedial's own example to a fresh factorable trinomial, e.g. `x^2 + 6x + 8 = 0 = (x+2)(x+4)`, larger solution −2 (same answer number, different equation — acceptable) or better, a fully distinct value: `x^2 + 7x + 10 = 0 = (x+2)(x+5)`, larger solution −2 still recurs by coincidence of small integers; use `x^2 + 8x + 15 = 0 = (x+3)(x+5)`, larger solution −3. Update `rem-qfs-c` body and the check `prompt`/`answer`/`commonErrors`/`fallbackFeedback`.

**qu-02-03** — `remedials[0].check` (`rem-qds-k`) prompt `"Solve x^2 - 25 = 0. What is the larger solution?"` (answer 5) is byte-for-byte identical to `k1`. Fix: change the remedial's difference-of-squares example, e.g. `x^2 − 64 = 0` (→ ±8, larger 8), updating `rem-qds-c` body and the check `prompt`/`answer`/`commonErrors`/`fallbackFeedback`.

**qu-03-01** — `remedials[0].check` (`rem-qsr-k`) prompt `"Solve x^2 - 49 = 0. What is the larger solution?"` (answer 7) is byte-for-byte identical to `k1`. `k1` is itself an exact cross-lesson duplicate of `qu-02-03`'s `k3` (same equation `x^2 − 49 = 0`, same question, same answer 7); since `qu-02-03` precedes `qu-03-01` in the course sequence, `qu-02-03` stays KEEP and `qu-03-01` owns both fixes. Fix: (1) change `qu-03-01`'s `k1` to a fresh square-root example not equal to `x^2−49=0`, e.g. `x^2 − 121 = 0` (→ ±11, larger 11), updating `k1`'s `prompt`/`answer`/`commonErrors`/`fallbackFeedback`/`explanationVariants`/`variant`; (2) change the remedial's concept+check to match the new `k1` numbers or another fresh instance distinct from it, e.g. `x^2 − 64 = 0` (→ ±8, larger 8).

**qu-03-02** — `remedials[0].check` (`rem-qf-k`) prompt `"Solve x^2 + 2x - 8 = 0 with the formula. What is the larger solution?"` (answer 2) is byte-for-byte identical to `k1`. Fix: change the remedial's quadratic-formula example, e.g. `x^2 − 4x − 5 = 0` (b²−4ac = 16+20 = 36, √36=6, x=(4±6)/2 → 5 or −1, larger 5), updating `rem-qf-c` body and the check `prompt`/`answer`/`commonErrors`/`fallbackFeedback`.

**qu-03-03** — `steps[].id="i1"`'s `predict` block asks `"For x² − 5x + 6 = 0 the discriminant b² − 4ac is 1. Before solving: how many real solutions?"` with `reveal` stating "two distinct answers (2 and 3)" — this pre-answers `k1`'s identical question ("How many real solutions does x^2 - 5x + 6 = 0 have?", answer 2), which immediately follows. Fix: change `k1` to a fresh discriminant-count example not equal to `x²−5x+6=0`, e.g. `x^2 + 2x − 3 = 0` (D=4+12=16>0, two solutions), updating `k1`'s `prompt`/`answer`/`commonErrors`/`fallbackFeedback`/`explanationVariants`. (The remedial's duplication of `i1`'s own discriminant sub-question, `x²−5x+6=0 → D=1`, is the weaker/acceptable pattern B and does not itself require a change once `k1` no longer coincides with `i1`.)

**qu-04-03** — `steps[].id="i1"`'s `predict` block states `reveal`: "...(0 + 12)/2 = 6, where P = 36" for `P = −x² + 12x`, immediately before `k1` asks "what is the maximum value of P" for the identical function (answer 36). Fix: change `k1` to a fresh profit/height function not equal to `P = −x² + 12x`, e.g. `P = −x^2 + 16x` (axis x=8, max P = 64), updating `k1`'s `prompt`/`answer`/`commonErrors`/`fallbackFeedback`/`explanationVariants`. Leave `i1` and its `predict` block as-is (it correctly teaches the axis-as-average-of-roots idea for its own example). (The remedial `rem-qac-k` also verbatim-repeats `i1`'s own axis question, x=6 for the same P; per the qu-03-03 precedent this is the weaker/acceptable pattern-B remedial-reuses-its-own-lesson's-intro-example case, not a main-sequence graded-check duplicate, and needs no separate fix once `i1`'s predict block is left as the single source of truth for that fact.)

---

## Programmatic verification pass

After completing the 36 manual dispositions above, a read-only equation/system-core scanner (`/tmp/scan2.mjs`, ad hoc, not part of the repo) was run across all three courses to cross-check for missed within- or cross-lesson duplication. It parses `numeric`/`mcq`/`matchPairs`/generic two-sided/`solveBalance`/`balanceScale` widget prompts (it has no parser for `systemsExplore`/`affineRelationshipLab` system widgets, so the les-03/les-04 systems-of-equations findings above rest on the manual hand-verification only, not this scan). Result: 276 items scanned, 30 duplicate-text groups found.

- Every group involving a lesson already on the REVISE list (alg1-01-01, alg1-01-02, alg1-01-03, alg1-02-01, alg1-02-02, alg1-02-03, alg1-04-03, qu-01-03, qu-02-01, qu-02-02, qu-02-03, qu-03-01, qu-03-02, qu-04-03) reproduced a site already captured above, or a same-lesson pattern-B remedial site not requiring its own fix (see qu-04-03 note above) — no new lesson needed to move to REVISE and no existing REVISE needed a different root cause.
- No lesson on the KEEP list showed a within-lesson or within-course duplicate. The only KEEP lessons appearing in scan output at all are `les-01-01` and `les-01-03`, and solely via **cross-course** matches against `alg1-01-01`/`alg1-01-03` (solving-equations) — e.g. `les-01-01/k1` ("3x+5=20") vs `alg1-01-01/c1`; `les-01-03/k3` ("2(x−3)+4x=18") vs `alg1-01-03/ch1`. This is scoped out of both courses' dispositions: each course's `reviewedBasisHash`/`duplicateClusters` and this task's "distinct instructional job per question" bar apply within a course's own lesson sequence, and les-01-01/01-02/01-03 read as a deliberate prerequisite-review opening chapter for linear-equations-systems (a standard, pedagogically sound design, not an assessment-validity defect) rather than an accident — a given check is still a novel, unseen graded problem to any student who has not, within the same short window, completed the numerically-matching lesson in the other course. Flagged here for transparency; not treated as a defect and not added to either file.

## Raw data

- Dispositions file (36 NDJSON records): `reports/closure/cowork-staging/laneB-s320-A8-dispositions.jsonl`
- This report: `reports/closure/S320_ASSESS_A8.md`
- Ledger (`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`) was read-only; not written.
- Programmatic duplicate scan: ad hoc `/tmp/scan2.mjs` (read-only, not a repo file); see "Programmatic verification pass" above for the run and its result.
- No files under `content/` were modified. No `npm`/`vitest`/`tsc` commands were run.
