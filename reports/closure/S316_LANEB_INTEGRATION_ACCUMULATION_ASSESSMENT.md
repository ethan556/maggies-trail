# S316 Lane B Independent Assessment — Course: integration-accumulation

Reviewer: Claude Cowork independent assessor (integration-accumulation S316)
Scope: content/courses/integration-accumulation/course.json + all 15 lessons under
content/courses/integration-accumulation/lessons/. Read-only review; dispositions staged to
reports/closure/cowork-staging/laneB-integration-accumulation-dispositions.jsonl (not the ledger).

Course shape: 5 chapters × 3 lessons = 15 lessons. gradeLevel 13 (post-AP / early-college
calculus). All figures referenced by lesson steps (`in-riemann-trap`, `in-ftc-slope-is-height`,
`dr-tangent-line`, `dr-derivative-as-function`, `dr-power-rule-pattern`, `dr-chain-gears`,
`dr-e-self-derivative`, `dr-inverse-reciprocal`, `dr-flat-not-turning`) are registered in
`src/components/figureIds.ts` and implemented in `src/components/figures.tsx`; the two
course-specific figures (`InRiemannTrap`, `InFtcSlopeIsHeight`) carry `role="img"` and a
descriptive `<title>` for screen readers, and `InFtcSlopeIsHeight`'s own labeled numbers
(f = 2.8, slope 2.8 at x = 2 for f(x)=1+0.9x, A(x)=x+0.45x²) are internally correct
(A′(x) = 1 + 0.9x = f(x)).

## Verdicts

| Lesson | Decision | Visual | Grade language |
|---|---|---|---|
| in-01-01 Estimating with Rectangles | KEEP | REQUIRED | FIT |
| in-01-02 Trapping the Area | KEEP | REQUIRED | FIT |
| in-01-03 The Definite Integral | KEEP | SUFFICIENT | FIT |
| in-02-01 The Accumulation Function | KEEP | REQUIRED | FIT |
| in-02-02 Reading A Off f | KEEP | REQUIRED | FIT |
| in-02-03 The Integral of a Rate Is a Total | KEEP | REQUIRED | FIT |
| in-03-01 FTC Part 1 | KEEP | REQUIRED | FIT |
| in-03-02 FTC Part 2 | KEEP | REQUIRED | FIT |
| in-03-03 Why the Two Halves Are One Theorem | KEEP | REQUIRED | FIT |
| in-04-01 Reversing the Power Rule | KEEP | REQUIRED | FIT |
| in-04-02 Pinning Down the Constant | KEEP | REQUIRED | FIT |
| in-04-03 The Antiderivative Library | KEEP | REQUIRED | FIT |
| in-05-01 Undoing the Chain Rule | KEEP | REQUIRED | FIT |
| in-05-02 Changing the Limits | KEEP | SUFFICIENT | FIT |
| in-05-03 Choosing u | KEEP | SUFFICIENT | FIT |

**Decision counts: KEEP 15, REVISE 0, ESCALATE 0.**
**REVISE list: none.**

## Mathematics recomputed by hand (spot summary; full per-item recomputation is in the staged
rationale for each lesson)

- Riemann sums: x² on [0,2], left(n=2)=1, right(n=2)=5, right−left(n=4)=[f(2)−f(0)]·0.5=2; 2x
  on [0,3], left(n=3)=6, right(n=3)=12, true value 9 correctly interior.
- Accumulation function: A(x)=∫₀ˣ2t dt = x², A(3)=9; A(x)=∫₀ˣ3 dt=3x, A(4)=12;
  f(x)=x−2 ⇒ A(2)=∫₀²(x−2)dx=−2 (triangle below axis), single sign change ⇒ one turning point.
  Net-change tank problem r(t)=4−2t on [0,4]: gain 4, loss 4, net 0.
- FTC Part 1: d/dx[∫₁ˣt³dt]=x³; d/dx[∫₀^(x²)t³dt]=(x²)³·2x=2x⁷ (chain rule charge correctly
  applied); A(x)=∫₀ˣ(t²−9)dt minimized at x=3 on [0,5].
- FTC Part 2: ∫₀²x²dx=8/3≈2.667; ∫₁³x²dx=26/3≈8.667; water-flow trapezoid check
  (1/2)(1+7)(3)=12 matches F(3)−F(0)=12 independently.
- Unified theorem: G(x)=∫₀ˣ(t²−4)dt minimum at x=2, G(2)=8/3−8=−16/3≈−5.333.
- Antiderivative library: ∫x³dx=x⁴/4+C; ∫₁²(3x²+2x)dx=10; +C cancels in definite integrals;
  ∫sin x dx=−cos x+C (verified by differentiating back); n=−1 correctly tied to power-rule
  division by zero, ∫₁^e(1/x)dx=1; ∫₀^π(eˣ+sin x)dx=e^π+1≈24.14 with the content's own
  independent cross-check (22.14+2=24.14) agreeing.
- Constant of integration: F(1)=5, F′=2x ⇒ C=4, F(3)=13; two-stage a(t)=6t, v(0)=2, s(0)=1 ⇒
  s(2)=13.
- u-substitution: ∫₀¹2x(x²+1)³dx=3.75; ∫₀¹x(x²+1)³dx=1.875 (half, one fewer x factor);
  ∫₀¹x/(x²+1)dx=(1/2)ln2≈0.347; limit translation u=x²+1 on [0,2] ⇒ u:1→5, ∫₀²x(x²+1)³dx=78
  (vs. the illegal x-limits-into-u-integral trap of 1.875, correctly flagged as the exact error
  the lesson warns against); ∫₀^(π/6)cos(3x)dx=1/3; ∫₀¹(2x+1)²dx=26/6≈4.333, independently
  confirmed in-content by expansion (13/3); ∫₀¹x²(x³+1)⁵dx=3.5; ∫₀¹x·e^(x²)dx=(e−1)/2≈0.859.

No arithmetic error, sign error, unit error, or bound error was found anywhere in the course.

## Pedagogical / quality-bar notes

- **Distinct instructional job, within and across lessons.** Each lesson advances the arc by
  exactly one increment: rectangles → squeeze → integral definition/properties → accumulation
  as a function → reading A off f qualitatively → net change → FTC1 (slope) → FTC2 (value) →
  unification → power-rule reversal → +C → library → substitution intro → limit-changing →
  choosing u. No two lessons ask the same question in different clothes; even repeated surface
  functions (x², 2x, x³) are reused deliberately to let the learner compare methods on the same
  object (e.g., in-01-01/in-03-02/in-04-01 all converge the same Riemann sum on 8/3 as the
  antiderivative shortcut is introduced) — this is explicit pedagogical scaffolding, not
  duplication.
- **Misconception-based distractors with parity.** Every MCQ/numeric wrong answer traced to this
  review corresponds to a real, nameable error (forgetting to subtract the lower limit, a stray
  factor of 2 surviving a substitution, confusing net change with total distance, taking the
  derivative instead of the antiderivative, mismatching x-limits against a u-integral). Feedback
  text names the actual drawn numbers in every case checked, never a bare "try again."
  Trap-vs-answer and trap-vs-trap collisions were checked case by case; none found (e.g. in-05-02
  k2's traps 1.875, 156, 78.125 are all distinct from the correct 78 and from each other).
- **Accessibility.** Both integration-course-specific SVG figures declare `role="img"` and a
  `<title>` describing the actual rendered relationship (not decorative filler). Interactive
  widgets (`riemannSum`, `accumulateArea`, `derivativeTrace`, `derivativeRuleLab`,
  `unitCircleExplore`) carry `successFeedback`/`lowFeedback`/`highFeedback` strings that give a
  non-color-dependent description of state (e.g., "still under the truth… you are approaching
  from below"), consistent with the non-colour-cue requirement.
- **Reasoning before reveal.** Every `predict` block asks for a directional/qualitative
  prediction before the paired interactive reveals the answer (e.g., in-02-01's "what happens
  when the integrand is negative" precedes the accumulateArea sweep).
- **Reused figures across chapters (dr-* IDs originally built for a differentiation course) are
  used deliberately and are captioned in the lesson prose as callbacks** ("the same list from
  dr-01-02, with f′ replaced by f"; "It is the gears again") — this is intentional
  cross-referencing to reinforce differentiation/integration as inverse operations, not an
  accidental content-source mismatch.

## visualDecision rationale (course-level pattern)

Lessons built around `riemannSum`, `accumulateArea`, `derivativeTrace`, `derivativeRuleLab`, or
`unitCircleExplore` were marked **REQUIRED**: in each of these, the widget IS the mechanism by
which the lesson's central claim becomes visible (e.g. A′=f can be *read off* the synchronized
tangent-slope/height display in in-03-01; the "no x survives" invariant in u-substitution is
directly demonstrated, not just asserted, by `derivativeRuleLab` in in-05-01). Two lessons
(in-05-02, in-05-03) are purely procedural/diagnostic — translating limits through a
substitution, and deciding whether a substitution is legal — with no new geometric relationship
to show; their existing `steppedReveal` panels plus tightly-targeted mcq/numeric checks already
meet the bar, so these were marked **SUFFICIENT** rather than REQUIRED. in-01-03 is similarly
procedural (three algebraic properties of ∫) and was marked SUFFICIENT for the same reason.

## Notable findings

None requiring REVISE or ESCALATE. No mathematical errors, no answer leaks, no option-parity
violations, no missing-visual promises, no accessibility gaps, and no authored-content errors
were found in this course. All 15 lessons are recommended KEEP.
