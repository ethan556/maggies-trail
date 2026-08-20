# S316 Lane B Independent Assessment — logarithms

Reviewer: Claude Cowork independent assessor (logarithms S316)
Reviewed: 2026-08-20T02:59:20.000Z
Scope: content/courses/logarithms/course.json and all 15 lessons in
content/courses/logarithms/lessons/. Read-only review; dispositions staged to
reports/closure/cowork-staging/laneB-logarithms-dispositions.jsonl.

## Course-level summary

15/15 lessons: **KEEP**. 0 REVISE. 0 ESCALATE.

This course (Math, gradeLevel 11, "Algebra 2: Exponentials & Logarithms") is organized into five
chapters of three lessons each: The Logarithm: Exponents in Reverse (define, evaluate, graph),
Properties of Logarithms (product, quotient/power, expand/condense), Change of Base &
Exponential Equations (change-of-base, exponential-equation solving, log-equation solving), The
Natural Base e (e, ln, solving with e/ln), and Models & Logarithmic Scales (A = Pe^(rt),
half-life, log scales). Every lesson follows the same nine-step shape (c1, i1, k1, c2, i2, k2,
k3, ch1, r1) plus one remedial route.

### Mathematical truth (recomputed independently, not trusted from authored feedback text)

Every log evaluation, product/quotient/power-rule application, change-of-base computation, and
exponential/log inverse claim in all 15 lessons was recomputed from scratch and matches the
authored answer, feedback, and reveal text. Representative checks:

- **Evaluation**: log₅125=3, log₂(1/16)=−4, log₁₆4=1/2, log₉9=1, log₄(1/2)=−1/2, log(100000)=5.
- **Product/quotient/power**: log₃9+log₃27=5=log₃243; log₂(4⁵)=5·log₂4=10 (4⁵=1024=2¹⁰); the
  capstone expansion of log₂(8x³/y)=3+3log₂x−log₂y sequences product→power→quotient correctly.
- **Change of base**: log₅625 via 2.796/0.699=4; log₄32 via base-2 shortcut =5/2, checked against
  4^(5/2)=(√4)⁵=32; log₂10=1/0.301≈3.32, matching the between-3-and-4 bracket set up in lg-01-01.
- **Exponential/log-equation solving**: 3·2ˣ=60 → x=log₂20≈4.32 (sanity 16<20<32); domain-filtered
  solves in lg-03-03 correctly keep only the candidate whose log inputs stay positive (e.g.
  log₃(x+6)+log₃x=3 → x=3, rejecting x=−9), and k3 correctly explains WHY condensing can create
  extraneous roots (product positive while individual factors are negative) rather than asserting
  a blanket rule.
- **e / ln**: (1+1/4)⁴=2.44140625≈2.44; e≈2.71828 sits strictly between 2 and 3; e^(ln5)=5;
  ln(e³·e⁴)=7 verified two independent ways as the lesson itself notes; ln(x+5)=0 → x=−4 is
  correctly kept VALID because the log's input (1) is positive even though the solution is
  negative — the domain check is on the argument, not the solution's sign.
- **Models & scales**: 500·e^0.6≈$911; doubling time (ln2)/r is correctly shown to be
  principal-independent; half-life 160mg over 3 half-lives → 20mg, fractional half-life
  (1/2)^(1/2)≈70.7% (correctly distinguished from the naive-average 75% misconception); log-scale
  gap arithmetic (10³=1000×, log(100000)=5, 10^1.5≈31.6×, 4.0+log(200)≈6.3) all correct.

No mathematical, domain, or rounding-convention errors were found. No item invents a rounding
rule the prompt doesn't state; every rounded answer traces to an explicitly given approximation
(e.g. "using log 20 ≈ 1.301, log 2 ≈ 0.301").

### P0 finding: ILLUSTRATION_REPLACEMENT (lg-05-03, `log-scale-ladder`)

**Status: RESOLVED, no outstanding defect.** This course carries the queue's one flagged P0 row,
concerning the `log-scale-ladder` figure (VIS-lg-05-03-c1-log-scale-ladder), previously addressed
in `reports/closure/S289_LOGARITHMS_CHOICE_FIGURE_PACKET.md`. Independently re-verified, not
trusted from that packet's claim:

- `log-scale-ladder` is present in `FIGURE_IDS` (`src/components/figureIds.ts`) and mapped to a
  real component `LogScaleLadder` in `src/components/figures.tsx` (not a stub).
- The component renders `role="img"` with an accessible `<title>` reading: "A ladder comparing a
  log scale to the quantity it measures. Magnitudes 3, 4, 5, and 6 climb by equal steps of one,
  but the bars beside them grow by a factor of ten each step... Equal steps on the scale mean
  equal multiplications underneath." This is an exact match for the concept step's prose ("each
  step of 1 means ×10 underneath") and the visualized bar widths (22/58/130/238, each ≈×2.15
  matching a shared log scale, with explicit ×1/×10/×100/×1000 labels).
- Computed the figure/text-mismatch blocklist's composite key (FNV-1a hash of `figureId +
  "\n" + stepBody`) for all 30 figure+body pairs across the 15 lessons, including
  `log-scale-ladder`'s lg-05-03/c1 pairing, and checked each against the 211-entry generated
  blocklist (`src/lib/figureTextMismatchBlocklist.generated.ts`): **zero matches**. The figure is
  not suppressed and will render.
- The companion figure `lg-ph-scale` (lg-05-03/c2, pH/decibel scales) is likewise registered,
  mapped, unblocked, and accessibly titled.

No other course-local queue rows referencing this course were found under `reports/` outside the
already-closed S289 packet.

### Visual truth (all 15 lessons)

All 30 distinct figure IDs referenced across the course's concept steps
(`lg-need-log`, `lg-twin`, `lg-instant-values`, `lg-common-natural`, `log-as-inverse`,
`lg-swap-domain`, `lg-rules-are-exponents`, `lg-product`, `lg-quotient`, `lg-power`, `lg-expand`,
`lg-condense`, `lg-change-base`, `lg-change-base-why`, `lg-take-log`, `lg-isolate-coefficient`,
`lg-convert-exponential`, `lg-both-sides`, `approaching-e`, `lg-e-constant`, `lg-ln`,
`lg-ln-undo`, `lg-natural-exponent`, `lg-isolate-natural`, `lg-continuous-model`, `lg-anatomy`,
`lg-half-life`, `lg-fractional-half-life`, `log-scale-ladder`, `lg-ph-scale`) were confirmed
registered in `FIGURE_IDS`, mapped to a real component in `figures.tsx`, present in the blocklist
check with zero matches, and each component was confirmed to render `role="img"` plus a `<title>`.
A sample of five titles (`LgSwapDomain`, `LgBothSides`, `LgFractionalHalfLife`,
`LgChangeBaseWhy`, `LgAnatomy`) was read in full and each is a truthful, specific description of
the concept step's math (not generic filler), matching the promised visual/relationship.

### Distinct instructional jobs / traps

Each of the 15 lessons targets a distinct conceptTag (`lg-define`, `lg-evaluate`, `lg-graph`,
`lg-product`, `lg-power`, `lg-expand-condense`, `lg-cob`, `lg-exp-solve`, `lg-log-solve`, `lg-e`,
`lg-ln`, `lg-e-solve`, `lg-models`, `lg-halflife`, `lg-scales`), with no cross-lesson repetition
of question shape observed (e.g. the product property's "no rule for log(M+N)" witness in
lg-02-01 is distinct from the "quotient of logs ≠ log of quotient" witness in lg-02-03, each
using different numeric witnesses). Every MCQ distractor and buildExpression commonBuild names a
real, computed misconception in its feedback using the drawn numbers — none is a bare "try
again." No trap collides with the correct answer or with another trap in any instance read.

One minor observation, not rising to REVISE: in lg-05-02's capstone numeric widget, one
`commonErrors` entry (value 4.3) has feedback that restates the correct method (isolate, then
multiply by the half-life) rather than tracing the precise arithmetic path a learner would follow
to land on exactly 4.3. The feedback is truthful and non-generic, and does not assert anything
false about the drawn problem, so this is a stylistic softness rather than a quality-bar failure.

### Variant generators

Every `variant.gen`/`variant.form` declaration in the course resolves to the real, pure-function
generator `a2-logarithms` (`logarithms()` in `src/lib/algebra2Variants.ts`), which covers `lg-cob`,
`lg-define`, `lg-e-solve`, `lg-e`, `lg-evaluate`, `lg-exp-solve`, `lg-expand-condense`, `lg-graph`,
`lg-halflife`, `lg-ln`, `lg-log-solve`, `lg-models`, `lg-power`, `lg-product`, `lg-scales`. The 28
distinct `form` strings used across the 15 lessons match exactly (set-equal) the 28 forms declared
for `a2-logarithms` in the `VariantForm` union (`variants.ts`), with no orphan or missing form.
`a2-logarithms` is registered as `"later"` band in `variants.resolver.test.ts`, correct for a
grade-11 course. Generated widgets use the pre-existing, gate-checked `numeric`/`mcq`/
`buildExpression` widget builders (no new widget type introduced), so no new gate branch was
required.

### Grade-appropriate language

Prose is calibrated to Algebra 2 (grade 11): precise mathematical vocabulary ("change-of-base
formula," "power property," "continuous compounding"), full derivations shown rather than
asserted, and explicit callbacks to prior courses (radical functions' rational exponents,
Algebra 1's a·bˣ models). No derived-morphology artifacts, spliced phrases, or dropped units were
observed in any of the 15 lessons.

## Per-lesson verdicts

| Lesson | Verdict | Notes |
|---|---|---|
| lg-01-01 The Exponent-Finder | KEEP | Round-trip conversions and between-integers case (log₂10) correct; lg-need-log/lg-twin figures truthful. |
| lg-01-02 Evaluating Logarithms | KEEP | Instant values, negative/fractional exponents correct; lg-instant-values/lg-common-natural truthful. |
| lg-01-03 The Logarithmic Graph | KEEP | Mirror-across-y=x, domain x>0, shifted-asymptote profile all correct; log-as-inverse truthful. |
| lg-02-01 The Product Property | KEEP | log(MN) splitting and "no rule for log(M+N)" witness correct; lg-product truthful. |
| lg-02-02 Quotient & Power Properties | KEEP | log₂(4⁵)=10, full 3-property capstone sequenced correctly; lg-power truthful. |
| lg-02-03 Expand & Condense Fluency | KEEP | Coefficients-first-when-condensing rule correctly enforced by traps; lg-expand/lg-condense truthful. |
| lg-03-01 Change of Base | KEEP | Formula derivation and all worked values (log₅625, log₄32, log₂10) correct; lg-change-base truthful. |
| lg-03-02 Solving Exponential Equations | KEEP | Isolate-then-log pipeline correct, sanity brackets check out; lg-take-log truthful. |
| lg-03-03 Solving Log Equations | KEEP | Domain filtering correct throughout, k3 correctly explains extraneous-root mechanism; lg-both-sides truthful. |
| lg-04-01 The Number e | KEEP | Compounding sequence, growth ordering, e²≈7.389 all correct; approaching-e truthful. |
| lg-04-02 The Natural Log | KEEP | ln properties and inverse cancellation correct; lg-ln truthful. |
| lg-04-03 Solving with e and ln | KEEP | Inverse-tool selection correct; domain-input-vs-solution-sign distinction correctly taught; lg-natural-exponent truthful. |
| lg-05-01 Continuous Growth: A = Pe^(rt) | KEEP | All worked values correct; doubling-time P-independence correctly proven; lg-continuous-model truthful. |
| lg-05-02 Half-Life | KEEP | N=N₀(1/2)^(t/h) arithmetic correct throughout; one minor non-blocking feedback-precision note (see above). |
| lg-05-03 Logarithmic Scales | KEEP | P0 log-scale-ladder figure independently confirmed unblocked, registered, and accurate; scale arithmetic correct. |

## P0 illustration finding

**RESOLVED — no outstanding defect.** See the dedicated section above. The `log-scale-ladder`
figure for lg-05-03 is registered, mapped to a real accessible component, and independently
confirmed absent from the figure/text-mismatch blocklist (zero hash collisions across all 30
figure+body pairs in this course), so it renders as promised. This corroborates, rather than
merely repeats, the prior S289 finding.

## Implementation contracts for REVISE items

None. 0/15 lessons required REVISE.
