# S316 Lane B — Expressions & Equations — Independent Assessment

Reviewer: Claude Cowork independent assessor (expressions-equations S316)
Reviewed: 2026-08-20T00:17:19.000Z
Course: `content/courses/expressions-equations/course.json` (grade 6, "Expressions & Equations")
Scope: all 18 lessons across 6 chapters (ch1-exponents, ch2-variables, ch2b-the-language-of-expressions,
ch3-equivalent-expressions, ch4-one-step-equations, ch5-inequalities).

Method: read every lesson JSON in full, recomputed every prompt/answer/commonError/distractor by hand
(spot-checked with Python where a distractor's derivation was non-obvious), cross-checked every
`variant.form`/`variant.gen` pair within and across lessons for duplicated instructional jobs, and
confirmed every referenced `figure` id resolves in `src/components/figureIds.ts`. This course's three
open `LESSON_PROGRESSION_AND_DUPLICATION` queue rows (`PROGRESSION-ee-01-02`, `PROGRESSION-ee-04-02`,
`PROGRESSION-ee-05-01`) were each individually re-derived and resolved below.

## Decision counts

**KEEP = 12, REVISE = 6, ESCALATE = 0** (18 total).

KEEP list: ee-01-01, ee-02-01, ee-02-02, ee-02b-01, ee-02b-02, ee-02b-03, ee-03-01, ee-03-02,
ee-04-01, ee-05-01, ee-05-02, ee-05-03.

REVISE list (one-phrase reasons):
- **ee-01-02** — step k3 duplicates step k1's instructional job (generic "evaluate a power," same
  off-by-one-factor trap shape), only k2's powers-of-ten shortcut is genuinely distinct.
- **ee-01-03** — challenge step's commonError feedback for value 42 is garbled/unfinished ("then...
  no.") and doesn't correspond to any real derivation of 42.
- **ee-02-03** — challenge step's commonError feedback for value 9 is a vague hedge ("+ something or
  slips the order") that never names the actual misconception.
- **ee-03-03** — challenge step's commonError feedback for value 16 makes a false numeric claim
  ("3x alone = 15") that doesn't equal the stated trap value.
- **ee-04-02** — steps k2 and k3 are literal duplicates: same variant form `solveSubtract`, same
  widget shape, same distractor pattern, differing only in numbers. (Open queue row resolved as
  REVISE, not KEEP-with-rationale.)
- **ee-04-03** — steps k4 and ch1 are literal duplicates: same variant form `tickets`, same
  word-problem template and distractor pattern, differing only in numbers. Found independently
  (not one of the three queue-flagged rows).

## Per-lesson findings

### ee-01-01 — Exponent Notation — KEEP
2^3=8, 5^2=25, 3^2=9, and the four-item matchPairs (4^2=16, 10^3=1000, 3^2=9, 2^3=8) all verified.
Every distractor is a named, computed misconception (base×exponent, base+exponent). The
`volumeBuilder` widget (targetVolume=8, lMax=wMax=hMax=2) is a real synchronized cube-count model of
2^3, not decoration.

### ee-01-02 — Evaluating Powers — REVISE
All raw arithmetic is correct (27, 10000, 1, 32, 9 vs 8 comparison). This lesson carries the open
`PROGRESSION-ee-01-02` queue row (`number-normalized-prompts=[k2,k3]`). I resolve it as follows:
- k2 ("Evaluate 10^4") is tied directly to c2's "powers of 10 = zeros" shortcut, and its distractor
  40 (confusing ×4 with counting 4 zeros) targets that exact point — **approved as a distinct,
  legitimate fluency check**.
- k3 ("Evaluate 2^5") is not distinct from k1 ("Evaluate 3^3"): both are generic "evaluate a power by
  repeated multiplication," and both primary distractors (9 for k1, 16 for k3) are the same
  off-by-one-factor misconception (mistaking one exponent lower), just with base/exponent swapped.

**Implementation contract:** Give k3 a distinct diagnostic target — e.g. tie it explicitly to the
doubling-growth pattern started in i1's `sequenceBuild` (1,2,4,8,16) by asking for the *next* term
and a distractor built on a growth-rate error (e.g. adding instead of doubling: 16+2=18) rather than
reusing the "off by one factor" shape already used in k1. Alternatively replace k3 with a
non-power-of-two base so its distractor pattern cannot coincide with k1's.

### ee-01-03 — Order of Operations with Exponents — REVISE
2+3^2=11, (2+3)^2=25, 4×2^3=32 vs (4×2)^3=512, 10-2^2=6 vs 64, 3^2+4^2=25 vs 49/14, and
8+2×3^2=26 vs 90 all verified correct with clear, named feedback.

**Defect:** step `ch1`'s `commonErrors` entry for value 42:
> "42 does 8 + 2 = 10 then... no. Exponent first (3^2 = 9), then 2 × 9 = 18, then 8 + 18 = 26."

I exhaustively checked every plausible order-of-operations mistake on `8 + 2 × 3^2` (strict
left-to-right = 900, add-before-multiply-but-exponent-first = 90, exponent-of-the-product = 44,
exponent-on-the-wrong-factor = 20, sum-of-three-terms = 19) — none equal 42. The feedback text
itself trails off mid-sentence ("then... no.") without completing a derivation, then pivots to
just repeating the correct solution. This both fails to name a real misconception and reads as
literally unfinished authoring.

**Implementation contract:** Replace the value-42 distractor with a computed, nameable misconception
(candidates that do occur: 90 is already used for "add before exponent"; use 44 for "squares the
product 2×3 instead of just 3" — i.e. reading 2×3^2 as (2×3)^2 — with feedback "44 squares the
product 2×3 instead of just the 3: (2×3)^2 = 36, +8 = 44. The exponent applies only to the 3:
3^2=9, then 2×9=18, then 8+18=26.") or drop the second commonError entry if only one distinct trap is
warranted.

### ee-02-01 — Variables Stand for Numbers — KEEP
2n at n=4=8, 8h at h=5=$40, y÷3 at y=12=4, p−6 at p=20=14 all verified, with parity distractors
(glued-digit vs add vs subtract vs multiply). matchPairs phrase-to-expression set is unambiguous.

### ee-02-02 — Evaluating Expressions — KEEP
3x−2 at x=5=13, x² at x=3=9, a+2b at a=3,b=5=13, (n+2)÷2 at n=6=4, 3m²+4 at m=2=16 all verified;
every distractor names a specific substitution or grouping slip with the actual drawn numbers.

### ee-02-03 — Writing Expressions from Words — REVISE
The reversal-trap teaching (x−3 vs 3−x) and every mcq/numeric answer are correct: x−3 test at
x=10=7; 2n+4 for "4 more than twice n"; half of 18=9; 3m−8 at m=5=7 with the −7 reversal trap
correctly derived (8−3×5=8−15=−7).

**Defect:** step `ch1`'s `commonErrors` entry for value 9:
> "9 computes 3(m − 8) + something or slips the order — build it in two steps..."

The "+ something" hedge never names an actual operation or resolves to 9 explicitly in the text
(3(5−8) = −9, and only a further unstated sign-drop reaches +9). This fails the "feedback names the
misconception with the actual numbers" bar.

**Implementation contract:** Rewrite to state the real two-step error explicitly: "9 comes from
3(m − 8), bracketing the subtraction before the multiplication: 3 × (5 − 8) = 3 × (−3) = −9, then
dropping the negative sign gives 9. Build 'triple m' first (3 × 5 = 15), then subtract 8: 15 − 8 = 7."

### ee-02b-01 — Naming the Parts — KEEP
Term count (3 in 2m+5n−9; 3 in 8p+p+4, including the bare p), coefficient (7 in 7y+2), and
factors-vs-terms (6n) are all correct and each mcq option is distinguishable and correctly judged.
algebraTiles targets (4x+6, 3x+5) match their prompts.

### ee-02b-02 — The Coefficients You Cannot See — KEEP
Invisible-1 coefficient (w in w+12), signed coefficient (−k in 5−k), and combining
(6y−y=5y; x+4x−x=4x with distractors 5 and 3 each naming exactly which invisible-1 term was
dropped) all verified.

### ee-02b-03 — Reading an Expression Aloud — KEEP
"Sum...doubled" = 2(x+5); 4n−1 = "one less than four times n"; 2(y+3)+5(y+3)=7(y+3);
"five times the sum of a number and 4" = 5(n+4) = 5n+20 — all correct, all four-option mcq sets
distinguishable with no answer-leaking option.

### ee-03-01 — The Distributive Property with Variables — KEEP
3(x+4) at x=2=18, 2(n+5)=2n+10, 4x+12=4(x+3) (with 2(2x+6) correctly rejected as true-but-not-GCF),
5(y+2)=5y+10 at y=4=30, and the broken-distribution catch (6(x+2) vs a student's "6x+2", correct=18
at x=1) all verified with distractors tied to specific steps of the botched expansion.

### ee-03-02 — Combining Like Terms — KEEP
6m−2m=4m; 4n+3+2n=6n+3; the "one lucky match" illusion (3x+2 vs 5x, agree at x=1, split at x=2:
8 vs 10) is mathematically sound. The ch1 distribute-then-combine step (2(x+3)+4x=6x+6=12 at x=1)
has two distractors I independently re-derived: 9 from partial distribution (2x+3+4x), and 10 from
dropping the 2x term (6+4=10) — both real, correctly described.

### ee-03-03 — Testing for Equivalence — REVISE
2(w+3) at w=4=14 vs 2w+3=11; x+x at x=3=6 vs x²=9; 5(x+2) at x=0=10 vs 5x+2=2; the four-item
dragBucket equivalence sort is all correctly classified.

**Defect:** step `ch1`'s `commonErrors` entry for value 16:
> "16 misses one x on the left (3x alone = 15... or 3x + 1)."

At x=5, "3x alone" is 15, not 16 — this clause is a false statement about the drawn problem. The
only path that actually reaches 16 is the unstated "3x + 1" (treating the bare `+x` term as
literally "+1"), and the feedback never resolves which of the two conflicting claims is correct.

**Implementation contract:** Rewrite to state only the working derivation: "16 treats the bare +x
term as if it contributed only +1 instead of its value: 3×5 + 1 = 16. Combine fully first: 3x + x =
4x = 20 at x = 5, matching 2(2×5) = 20." Remove the false "3x alone = 15" clause entirely.

### ee-04-01 — What an Equation Says — KEEP
5+3=8≠7; x+9=15 solved by testing gives 6; the x−8=3 dragBucket sort flags only x=11; 3x=21 picks
x=7 over 3×9=27. balanceScale widget (a=1,b=3,c=7) matches x+3=7 with a correct success message.

### ee-04-02 — Solving with Addition & Subtraction — REVISE
Resolves the open `PROGRESSION-ee-04-02` row (`number-normalized-prompts=[k3]`). All solved values
are correct (x−5=12→17; x−8=3→11; n+4=11→7; n+9=15→6).

**Defect:** steps k2 and k3 declare the identical `variant.form` **"solveSubtract"** and are the
same item mechanically: "Solve x − a = b," same two distractor shapes (subtract-instead-of-add;
answer-copies-the-right-side-number), only the numbers differ (a=5,b=12 vs a=8,b=3). Neither uses a
different representation, context, or misconception the other doesn't already cover — unlike the
later k4 (fee context, form `feeSolve`) vs ch1 (tip context, form `tipSolve`) pair in the same
lesson, which *do* use distinct forms for a structurally similar skill and are therefore acceptable.

**Implementation contract:** Either (a) replace k3 with a word-context "subtraction equation" item
(comparable to how k4/ch1 use fee/tip contexts) so it has its own `variant.form` and a context-bound
distractor, or (b) delete k3 and let k2 alone cover the "undo a subtraction" job, moving the freed
step budget to a genuinely new job (e.g. an equation with the variable on the right side, `12 = x −
5`).

### ee-04-03 — Solving with Multiplication & Division — REVISE
Not one of the three queue-flagged rows, found independently. 4x=20 check; x÷3=6→18; 5x=35→7 all
correct.

**Defect:** steps k4 and ch1 both declare `variant.form` **"tickets"** and are the same word-problem
template: "Tickets cost $N each, group spent $M, solve for count," with the same three distractor
shapes (multiply instead of divide; answer-is-the-unit-price; subtract instead of divide). Only the
numbers differ (N=5,M=30→6 vs N=6,M=42→7).

**Implementation contract:** Give ch1 (the terminal challenge) a different context or a second
operation layer to distinguish it from k4 — e.g. combine with a fixed fee ("tickets cost $6 each
plus a flat $3 fee; total $45; solve for ticket count"), which also reuses the fee/tip pattern
established in ee-04-02 without duplicating k4's bare single-operation "tickets" job.

### ee-05-01 — What an Inequality Says — KEEP
Resolves the open `PROGRESSION-ee-05-01` row (`number-normalized-prompts=[k1]`) with an approved
rationale: ungated interactive i1 ("Is x=6 a solution of x>5?") is a warm-up establishing basic
membership testing with an easy true case; graded k1 ("Is x=5 a solution of x>5?") specifically
targets the strict-boundary-exclusion misconception (does the boundary itself satisfy a strict
inequality?) — a genuinely distinct diagnostic job, not a repeat. All membership/extremum claims
(5 not > 5; 3≤3 true; x<4 sort; no largest solution for x>5; t=12 satisfies t≥12) verified correct.

### ee-05-02 — Graphing Inequalities — KEEP
Open/closed circle and left/right arrow rules applied correctly and consistently: x≤3 needs closed
circle pointing left; closed-at-4-pointing-right = x≥4 (buildExpression correct token set); the
four-item matchPairs graph-description set and both pairErrors independently verified; x<0 correctly
includes −3; "at most 8" (w≤8) correctly includes w=8. Widgets are genuine synchronized
manipulatives.

### ee-05-03 — Dependent and Independent Variables — KEEP
pay=8h, y=3x at x=4=12 (four-row matchPairs table fully verified: 0,3,6,15), laps/distance, and
shirts cost=5×6=30 are all correct with named, computed distractors. Placing this
relationships-focused lesson in the ch5-inequalities chapter (titled "Inequalities &
Relationships") is a legitimate scope choice, not a content defect.

## Notable findings

1. **Recurring feedback-hedging defect pattern.** Three of the six REVISE lessons (ee-01-03,
   ee-02-03, ee-03-03) share the same failure shape: a challenge-step `commonErrors` entry whose
   feedback text hedges ("+ something," "or slips the order," an offered-but-wrong alternative
   derivation) instead of stating one definite, computed misconception. All three are isolated to a
   single distractor value in a single challenge step — the surrounding lesson content and every
   other distractor is sound. This looks like a single authoring pass (possibly one contributor or
   one editing session) that touched the final challenge step across several lessons; a
   corpus-wide grep for the string `"+ something"` or `"... no."` inside `commonErrors[].feedback`
   across other courses may surface more instances worth a systematic sweep.
2. **Literal `variant.form` duplication is a reliable, cheap detector.** Both duplication REVISEs I
   found with certainty (ee-04-02 k2/k3, ee-04-03 k4/ch1) share the *exact same* `variant.form`
   string within one lesson. The open-queue tool's `number-normalized-prompts` signal caught
   ee-04-02 but not ee-04-03 (likely because its prompt text differs enough in the specific dollar
   amounts) — a same-form-within-lesson check would catch both mechanically and is worth adding to
   the automated duplication scan.
3. All 18 lessons' `figure` ids resolve in `src/components/figureIds.ts`; no missing-visual defects
   found. All widget specs I could statically verify (algebraTiles targetX/targetConst,
   volumeBuilder targetVolume, balanceScale a/b/c, functionMachine a/b/targetOutput, numberLineRay
   start/target) are internally consistent with their accompanying prose prompts.
4. No mathematical-truth defects were found outside the specific `commonErrors` entries listed above
   — every worked answer, every table, every drag-bucket sort, and every matchPairs set was
   independently recomputed and matched.

## Gate note
Per instructions, no `npm`/`vitest`/`tsc` commands were run. This is a read-only content
assessment; findings above are Raw data for an implementation packet.
