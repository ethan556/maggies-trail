# S319 — Independent Assessment: complex-numbers + polynomial-functions

Reviewer: Claude Cowork independent assessor (S319)
Reviewed: 2026-08-20T12:34:06.000Z
Scope: `content/courses/complex-numbers/course.json` + all 15 lessons in
`content/courses/complex-numbers/lessons/`, and `content/courses/polynomial-functions/course.json`
+ all 15 lessons in `content/courses/polynomial-functions/lessons/`. Read-only review; dispositions
staged to `reports/closure/cowork-staging/laneB-s319-cn-pf-dispositions.jsonl` (30 NDJSON lines,
one per lesson). This report does not write to any ledger.

Authority note: per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, the repository source,
explicit human-decision ledgers, and current gate evidence are authoritative. The ChatGPT Work
cache (`reports/cache/CHATGPT_WORK_V4_PRECACHE*.{md,json}`) is a derived evidence accelerator only
— it was not consulted for any lesson-content judgment in this assessment, and no cached
recommendation or earlier label was treated as self-approving. All verdicts below come from
independently reading every lesson JSON byte-for-byte and hand-recomputing every arithmetic claim,
factorization, discriminant, multiplicity/bounce-cross call, and end-behavior claim.

## Course summaries

**complex-numbers** (grade 11, "Algebra 2: Complex Numbers & Quadratics") — 5 chapters, 15 lessons:

| Chapter | Lessons |
|---|---|
| ch1 Completing the Square | cn-01-01, cn-01-02, cn-01-03 |
| ch2 The Imaginary Unit | cn-02-01, cn-02-02, cn-02-03 |
| ch3 Complex Arithmetic | cn-03-01, cn-03-02, cn-03-03 |
| ch4 Complex Roots of Quadratics | cn-04-01, cn-04-02, cn-04-03 |
| ch5 Roots & Methods | cn-05-01, cn-05-02, cn-05-03 |

Coherent build: perfect-square recipe → solve by completing the square → derive vertex form →
define i (i²=−1) → four-step power cycle → the complex plane → add/subtract → multiply (FOIL +
i²) → conjugates/division → x²=−k gets solutions → quadratic formula meets negative discriminant
→ the full three-case discriminant story → sum/product survive into ℂ → build quadratics from
roots → choose the fastest method. Every i²-sign handling, conjugate product, FOIL expansion, and
discriminant sign was hand-recomputed. No arithmetic or notation error was found anywhere in this
course.

**polynomial-functions** (grade 11, "Algebra 2: Polynomial Functions") — 5 chapters, 15 lessons:

| Chapter | Lessons |
|---|---|
| ch1 Shape & End Behavior | pf-01-01, pf-01-02, pf-01-03 |
| ch2 Zeros & Factors | pf-02-01, pf-02-02, pf-02-03 |
| ch3 Polynomial Division | pf-03-01, pf-03-02, pf-03-03 |
| ch4 Factoring Higher Degree | pf-04-01, pf-04-02, pf-04-03 |
| ch5 Graphs & Models | pf-05-01, pf-05-02, pf-05-03 |

Coherent build: evaluate/anatomy → end behavior via parity+lead sign → why the leading term
dominates → zeros from factored form → multiplicity bounce-vs-cross → Remainder/Factor theorems →
long division → synthetic division → chaining division+theorems to crack a cubic → GCF+quadratic
form → factoring by grouping → sum/difference of cubes (SOAP) → full sketches from factored form
→ turning-point/degree parity → building polynomials to spec. Every synthetic-division row,
polynomial evaluation, factorization (verified by expansion), and end-behavior/multiplicity claim
was hand-recomputed. One mathematical-truth defect was found (pf-05-01, detailed below).

## Decision counts

**complex-numbers**: KEEP 15, REVISE 0, ESCALATE 0 (15/15 lessons signed).
**polynomial-functions**: KEEP 14, REVISE 1, ESCALATE 0 (15/15 lessons signed).
**Combined**: KEEP 29, REVISE 1, ESCALATE 0 — 30/30 lesson dispositions recorded.

## Per-lesson verdicts

### complex-numbers

- **cn-01-01** (Building a Perfect Square) — KEEP / SUFFICIENT / FIT. All (b/2)² recipes
  recomputed (8→16, −12→36, 14→49, −10→25, 18→81); quadraticExplore vertex target (−3,0) matches
  x²+6x+9; predict/reveal on horizontal-shift direction correct.
- **cn-01-02** (Completing the Square to Solve) — KEEP / SUFFICIENT / FIT. x²+6x+5=0→x=−1,−5;
  x²−4x−12=0 vertex (2,−16) confirms (x−2)²=16→x=6,−2; x²+8x+7=0→x=−1,−7; all larger-root answers
  correct.
- **cn-01-03** (Vertex Form by Completing the Square) — KEEP / SUFFICIENT / FIT. Add-and-subtract
  regroupings verified for all five worked/checked items, including the −13 vertex-height check
  (16−32+3=−13) and the 4 minimum-value check (36−72+40=4).
- **cn-02-01** (Meet i) — KEEP / SUFFICIENT / FIT. √−9=3i, √−49=7i, √−36=6i, x²=−16→±4i,
  (3i)²=−9, (5i)²+30=5 all recomputed correct; argandExplore ×i rotation target resolves to z=2i
  exactly as claimed.
- **cn-02-02** (Powers of i) — KEEP / SUFFICIENT / FIT. i¹⁰(rem2)=−1, i²³(rem3)=−i,
  i⁴⁰(rem0)=1, i⁴+i⁸+i¹²=3, i²+i⁴+i⁶=−1, i⁶(rem2)=−1 all correct; argandExplore reveal (z=−i)
  checks out.
- **cn-02-03** (Complex Numbers & the Plane) — KEEP / SUFFICIENT / FIT. Real/imaginary-part
  identification and both plotPoint targets correct; distractors are genuine axis-swap/sign
  misconceptions.
- **cn-03-01** (Adding & Subtracting) — KEEP / SUFFICIENT / FIT. All five add/subtract items
  recomputed correct, including the double-negative case (6−(−2)=8).
- **cn-03-02** (Multiplying Complex Numbers) — KEEP / SUFFICIENT / FIT. FOIL products
  (2+i)(3+2i)=4+7i, (3+i)(2+i)=5+5i, (5i)(2i)=−10, (4+i)²=15+8i all correct; the flagship
  argandExplore modulus/argument reveal (|w|=√13, target √26 ⇒ |z|=√2, z=1+i) is exactly right —
  (1+i)(2+3i)=−1+5i confirmed by direct expansion.
- **cn-03-03** (Conjugates & Division) — KEEP / SUFFICIENT / FIT. (3+2i)(3−2i)=13,
  (2+3i)(2−3i)=13 (matches argandExplore target), (3+i)/(1−i)=1+2i, (5+2i)(5−2i)=29,
  (4+2i)/(1+i)=3−i all recomputed correct.
- **cn-04-01** (Square Roots of Negatives in Equations) — KEEP / SUFFICIENT / FIT. All eight
  x²=−k / (x−h)²=−k items recomputed correct, including the vertex-form cross-check that
  (x−1)²+4 never reaches the real axis.
- **cn-04-02** (The Formula Goes Complex) — KEEP / SUFFICIENT / FIT. All five discriminant +
  quadratic-formula solves recomputed correct (D=−36,−16,−16,−64,−36 across the five items).
- **cn-04-03** (The Full Discriminant Story) — KEEP / SUFFICIENT / FIT. All six dragBucket
  discriminants plus three "design a repeated root" items recomputed correct.
- **cn-05-01** (Sum & Product with Complex Roots) — KEEP / SUFFICIENT / FIT. Sum=−b and
  product=a²+b² identities verified for every item (D=−36, −16, roots 1±4i→c=17, 3±i→b=−6).
- **cn-05-02** (Building Quadratics from Roots) — KEEP / SUFFICIENT / FIT. All build-backward
  items verified including a full substitution check ((1+i)²−2(1+i)+2=0).
- **cn-05-03** (Choosing the Best Method) — KEEP / SUFFICIENT / FIT. Capstone lesson; every
  worked example across all four methods recomputed correct, no duplication with prior lessons.

### polynomial-functions

- **pf-01-01** (Polynomial Functions & Their Shape) — KEEP / SUFFICIENT / FIT. Degree-cap facts
  and all four evaluations (f(−1)=2, f(2)=6, f(2)=10 for the remedial, √x+1 non-polynomial)
  recomputed correct.
- **pf-01-02** (End Behavior) — KEEP / SUFFICIENT / FIT. All seven end-behavior items recomputed
  correct, including the −2x⁵ signChart (right interval negative, left positive, verified
  algebraically).
- **pf-01-03** (Leading-Term Domination) — KEEP / SUFFICIENT / FIT. All domination comparisons
  recomputed correct, including the x²−50x sign chart algebraically confirmed (51²−50·51=51).
- **pf-02-01** (Zeros from Factored Form) — KEEP / SUFFICIENT / FIT. All zero-reading items
  recomputed correct, including the f(1)=−15 distractor-refutation check.
- **pf-02-02** (Multiplicity: Bounce or Cross) — KEEP / SUFFICIENT / FIT. Sign-chart claims
  (x+2)(x−1)²(x−3)→+,−,−,+ and (x+1)³(x−2)²→flip-then-hold both verified factor-by-factor across
  every interval; degree-sum and distinct-intercept counts correct.
- **pf-02-03** (The Factor & Remainder Theorems) — KEEP / SUFFICIENT / FIT. f(2)=7, f(−2)=0,
  k=4, f(3)=0 all recomputed correct; signChart roots for x³−7x+6 verified by substitution.
- **pf-03-01** (Polynomial Long Division) — KEEP / SUFFICIENT / FIT. All four long-division
  problems recomputed step-by-step with divisor×quotient+remainder cross-checks passing.
- **pf-03-02** (Synthetic Division) — KEEP / SUFFICIENT / FIT. All synthetic-division rows
  recomputed by hand (three separate cubics/quadratics), including box-sign handling for (x+3).
- **pf-03-03** (Division Meets the Theorems) — KEEP / SUFFICIENT / FIT. Both full
  hunt-divide-factor chains recomputed and expansion-verified; the D<0 leftover-quadratic case
  (x²+3x+3, D=−3) correctly identified as the only-real-zero scenario.
- **pf-04-01** (GCF & Quadratic Form) — KEEP / SUFFICIENT / FIT. All quadratic-form and GCF
  factorizations recomputed correct, including the 5-distinct-real-zero count for
  3x⁵−15x³+12x.
- **pf-04-02** (Factoring by Grouping) — KEEP / SUFFICIENT / FIT. All grouping factorizations
  expansion-checked; the x²+2 no-real-zero reasoning (D=0−8<0) is correct.
- **pf-04-03** (Sum & Difference of Cubes) — KEEP / SUFFICIENT / FIT. All SOAP-pattern
  factorizations expansion-verified, including the coefficient case 8x³−27=(2x−3)(4x²+6x+9).
- **pf-05-01** (Sketching from Factored Form) — **REVISE** / SUFFICIENT / FIT. See defect below.
- **pf-05-02** (Turning Points & Degree) — KEEP / SUFFICIENT / FIT. All turning-point/degree-
  parity floors recomputed correct across six items (including the two two-constraint items that
  combine a raw count floor with a parity requirement).
- **pf-05-03** (Building & Using Polynomial Models) — KEEP / SUFFICIENT / FIT. All build-to-spec
  and applied (box-volume) computations recomputed correct.

## REVISE — precise implementation contract

### pf-05-01 (Sketching from Factored Form) — step `k3`, `explanationVariants[0]`

**File**: `content/courses/polynomial-functions/lessons/pf-05-01.json`, step id `k3` (the
`g(x) = (x − 3)(x + 3) · x²` bounce-at-origin check).

**Defect**: `explanationVariants[0]` reads: *"Degree 4, positive lead: up on both ends; crosses
at ±3 (both odd); f(0) = −9... times: (3)(−3) = −9, below the axis in the middle."*

This computes the y-intercept as if `g(x) = (x − 3)(x + 3)` alone (dropping the `· x²` factor
entirely), giving `(3)(−3) = −9`. The actual function in the widget prompt is
`g(x) = (x − 3)(x + 3) · x²`, so `g(0) = (−3)(3)(0)² = 0`. This directly contradicts the correct
option's own feedback in the *same* check step — option `o4`'s feedback explicitly states
*"g(0) = (−3)(3)(0) = 0 — the origin is ON the graph, as a bounce."* — and contradicts the
correct-answer option `o1` ("bounces on the axis at the origin"), which is only true because
`g(0) = 0`, not −9. This is an internal mathematical-truth contradiction within one check step:
the displayed rationale (`explanationVariants`) asserts a different y-intercept than the widget's
own correct-answer feedback.

**Fix**: Replace `explanationVariants[0]` with text consistent with the widget's own correct
answer and with `o4`'s feedback, e.g.: *"Degree 4, positive lead: up on both ends; crosses at ±3
(both odd, from the linear factors); the x² factor gives g a double zero at 0, so g(0) = (−3)(3)(0)²
= 0 — the graph touches and bounces at the origin rather than crossing, and is negative on both
sides of it since (x² − 9) < 0 near x = 0."* `explanationVariants[1]` ("Two odd crossings with
even degree: down through −3, dip below, back up through 3.") is compatible with the corrected
text and does not need to change. No other step, figure, or option in this lesson is affected —
`pf-walk-crosses`, `pf-turning-point`, and the rest of the lesson's arithmetic (f(0)=2 for
(x+2)(x−1)², the (x+1)(x−2)² sign chart, and the negative-lead capstone) were all independently
recomputed and are correct.

## Notes on scope discipline

Per the exact worker prefix's authority-and-evidence rules, this assessment did not consult, cite,
or defer to any entry in `.chatgpt-work-cache/` or `reports/cache/CHATGPT_WORK_V4_PRECACHE*`; all
30 verdicts rest solely on independently reading the course/lesson JSON source and the registered
figure implementations in `src/components/figures.tsx` (spot-checked for the complex-plane,
completing-the-square, powers-of-i, end-behavior, multiplicity, and synthetic-division figures —
all render the exact quantities their lessons promise, with SVG `<title>` accessible descriptions
and non-colour text labels). The widget engine (`src/components/widgets.tsx`) itself was treated
as shared, already-tested infrastructure and was not re-audited; only its per-lesson data
(prompts, targets, options, feedback) was checked for mathematical truth.
