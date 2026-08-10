# Engine Coverage Review — Session 154

Question asked: review the existing engines/labs and extend, enhance, or create one to cover as
many lessons as possible. Everything below is measured from disk and, where a coverage claim is
made, adversarially proven by independent derivation.

## 1. The real bottleneck is the generator, not the engine

| Measurement | Value |
|---|---|
| C/D lessons remaining | 229 (all secondary; K–8 is entirely A/B) |
| C/D lessons containing **any** Lab engine | **0 of 229** |
| Assessed steps in those lessons | 887 (513 numeric, 286 mcq, 88 other) |
| Assessed steps carrying a `variant` declaration | **879 of 887 (99.1%)** |
| Distinct generator tags serving them | 87 |

The 99.1% figure is the governing constraint. A content-only conversion is impossible for
almost every remaining lesson: touching a step whose generator still emits `numeric` breaks
`variants.resolver.test.ts` immediately (proven in S153). Every future conversion is therefore
**content edit + generator upgrade + sweep regeneration**, and must be budgeted that way.

The good news is that the S142–S151 upgrade wrapper works per *generator tag*
(`*_VARIANT_FORMS[tag]` + `upgrade*Variant`), so a single tag upgrade lifts every step using
it. That makes tag coverage the correct leverage metric:

| Generator tag | assessed steps | lessons | forms |
|---|---|---|---|
| a2-logarithms | 44 | 11 | 22 |
| a2-radicals | 40 | 10 | 17 |
| g12-polynomial-rational-analysis | 36 | 9 | 17 |
| a1-radicals | 36 | 9 | 12 |
| g12-polar-parametric | 32 | 8 | 15 |
| a2-statistics | 32 | 8 | 20 |
| **a1-systems** | **32** | **8** | **11** |
| a2-rationals | 28 | 7 | 12 |
| g10-solid-geometry | 28 | 7 | 11 |
| g12-function-analysis | 25 | 7 | 14 |

Top-10 tags = 333/879 steps (38%) across 84 lessons.

## 2. No new engine is needed for the highest-leverage family

`a1-systems` asks the learner to solve 2×2 linear systems. `affineRelationshipLab` **already**
ships `intersectionX`, `intersectionY`, and `intersectionPoint`, already derives intersections
(`affineIntersection`), already carries `numericErrors` + `choices` (so authored misconception
feedback survives), and is already registered across all eight surfaces with a sweep and a
65-case mutation matrix. A linear system is two lines; solving it is reading their
intersection. **Schema work required: none.**

## 3. Proven coverage (adversarial)

`scripts/measure/coverage-prover.mjs` re-derives each step's answer with an independent exact
rational solver (no floats decide a claim) and compares against the frozen authored answer.
A family is claimed only when MISMATCH is zero.

```
coverage-prover [a1-systems]: PROVEN 15 | MISMATCH 0 | out-of-scope 15
lessons: se-02-03, se-03-01, se-03-02, se-03-03, se-04-03
```

15 assessed steps across 5 lessons derive **exactly**, with zero disagreements. The 15
out-of-scope steps are word problems whose ask is phrased in domain language ("How many
dimes?") rather than "What is x?"; mapping those to a variable is an authoring judgement, not
an algorithmic one, and they are deliberately not counted.

## 4. What the adversarial process caught (the reason it exists)

Three separate claims were falsified before they could become code:

1. **The S152 tier simulation was invalid as a conversion plan.** It swapped widget `type`
   only. Seven of its eight target engines (`quadraticExplore`, `lineExplore`,
   `transformExplore`, `functionMachine`, `triangleSolve`, `distanceGrid`, `algebraTiles`)
   carry **no value-keyed error surface**, so they cannot legally receive an authored
   `commonErrors` set under the frozen-content rule. Only ~10 registered engines can.
2. **The first system parser silently produced 10 wrong answers.** A non-greedy capture
   swallowed "by elimination" and parsed the `y` in "by" as a variable. Unverified, that would
   have written ten incorrect conversions into frozen content.
3. **A later parser revision regressed to 0 proven** because a lazy quantifier collapsed the
   match. Each revision was re-proven from scratch rather than trusted.

## 5. Recommended next session

Upgrade `a1-systems` on the existing engine — no schema change:
1. `AFFINE_VARIANT_FORMS["a1-systems"] = new Set([...the 11 forms...])`.
2. An `affineConfig` branch parsing the two equations into `lines[]` (the prover's exact
   rational solver is the reference implementation; port it, don't re-invent it).
3. Convert the 15 proven steps to `intersectionX`/`intersectionY`, preserving prompt,
   tolerance and `commonErrors → numericErrors`, with abort-before-write assertions.
4. Regenerate `AFFINE_RELATIONSHIP_VARIANT_SWEEP_S147` (it pins a sha256 of `variants.ts`),
   then mutations, failure-first, full suite, build, Playwright.
5. Verify with the S153 rule: the set of lessons whose tier moves must equal exactly the set
   edited.

Expected: 5 lessons C/D → A/B with zero new engine code. Then re-run the prover against
`g10-solid-geometry` and `a1-radicals` (the latter needs three new `exactNumberLab` tasks:
`rootEvaluate`, `perfectSquareFactor`, `radicalMultiply`).

## S158 addendum — a1-radicals fully proven; the nonlinear frontier measured

Two adversarial sweeps this session sharpened the map:

**1. The affine well is dry.** A 12-task affine fit prover over all 477 remaining C/D numeric
steps found only 5 more provable steps (lf-02-03 remainder). S147/S155 consumed the linear
families; what remains is nonlinear.

**2. A universal "function-value" engine is NOT the answer.** A 15-rule evaluation prover
(quadratic vertex/standard forms, logs, exponentials, roots, variation, rationals) proved only
7 of 477 with 22 mismatches — remaining prompts are compositional sub-tasks ("√72 = a√2, what
is a?", "∛(2x+11)=3"), not raw evaluations. Regex-per-shape is now twice-measured a dead end
at scale; per-family rule sets with strict ordering are the only honest instrument.

**3. a1-radicals: 38/38 proven, MISMATCH 0, out-of-scope 0 — every step of all 11 lessons.**
`coverage-prover.mjs a1-radicals` derives the complete family from twelve ordered rules
(like-terms, simplify-combine, product-coef, simplify-coef, radical-product-plain,
rational-exponent, sqrt-perfect, largest-sq-factor, pythagorean-hyp/leg, c-squared,
distance-2d). Rule ORDER is load-bearing — the S152 false mismatches came from
simplify-coef firing inside like-terms prompts.

**Engine mapping for the conversion session (S159):**
- rad-04-01/02/03 (10 steps): **geometricConstraintLab, zero schema work** — hypotenuse, leg,
  c², and 2-D distance are already its vocabulary (S157's rt-01-03 conversion used it).
- rad-01-*, rad-02-* (16 steps): need 3 new exactNumberLab tasks (radicalSimplifyCoef,
  radicalCombine, radicalProduct) — value-keyed numericErrors already exist on that engine.
- rad-03-01/02 (12 steps): need 1 new exactNumberLab task (rationalExponentEvaluate); the
  existing powerEvaluate expands via Array(exponent) and is integer-only.
- Generator: `radicals()` in algebra1Variants? (verify tag source file) must publish `params`
  per branch; upgrade wrapper consumes params-first, mirroring the a1-systems pattern proven
  in S155.

Budgeted as TWO sessions: (a) geometricConstraintLab wave for rad-04 (existing engine, same
shape as S155 — content + params + forms + sweep), then (b) the exactNumberLab task extension
(full 8-file registration contract).

## S162 addendum — a1-radicals family complete; a2-logarithms measured and blueprinted

**a1-radicals is finished.** S159 (10 steps, geometricConstraintLab) + S161 (28 steps,
exactNumberLab) converted all 38 assessed numeric steps across 11 lessons. The prover now
reports `PROVEN 0 | out-of-scope 0` for the tag, which is the correct terminal signal: no
numeric steps remain to scan.

**a2-logarithms (44 steps / 11 lessons, the largest remaining family) is now measured, not
guessed.** `coverage-prover.mjs a2-logarithms` proves **14 of 28 numeric steps exactly, with
MISMATCH 0, reaching 9 of the 11 lessons**. Twelve ordered rules cover: direct evaluation
(log_b b^k, including rational arguments like log2(1/16) = -4), solve-for-argument, product and
power laws, coefficient sums, base-10 condensation, change-of-base where the result is exact,
exponential solve, log-equals-log, and the e/ln identities.

The other 14 are deliberately NOT claimed. They supply an authored approximation
("Using log 2 = 0.301...", "Given ln 2 = 0.693...", "e = 2.718") and ask for a rounded decimal.
Their answers are functions of the authored constants, not of exact arithmetic, so no
independent derivation can reproduce them without copying the constant — which would make the
"derivation" circular. They are reported `needs-authored-approximation` and left alone.

**Why 14/28 is still a strong wave:** tier movement needs only ONE manipulable step per lesson.
14 proven steps spread across 9 lessons is enough to lift most of them, exactly as the radical
wave did (28 steps -> 8 lessons, 2 D->A and 6 C->B).

**S163 blueprint (one session, same proven shape as S155/S161):**
1. Add ONE exactNumberLab task, `logarithmEvaluate` — spec carries (base, argument) as integers
   and derives k where base^k == argument, throwing when the argument is not an exact power.
   Per the S160 finding, a new TASK needs no 8-file wave: schema enum + truth branch only.
2. Publish `params` on the a2-logarithms generator branches that build these forms.
3. Register the forms in EXACT_VARIANT_FORMS and add a params-first branch to `exactConfig`,
   reusing the positional label disambiguator (log prompts also produce repeated terms).
4. Convert the 14 proven steps seal-first, with the pre-write derived==frozen gate.
5. Remember the two allowlist families: s146/s147 (changed-set equality) and s148/s150
   (non-target drift) all need the new lesson paths, plus content-change-proof-s151c.

## S163 — logarithm wave landed, and the approximation frontier opened

**Shipped:** two exactNumberLab tasks (`logarithmEvaluate`, `logarithmArgument`), both
integer-exact and throwing rather than approximating; 9 steps converted across 5 lessons
(lg-01-01, lg-01-02, lg-02-01, lg-02-02, lg-02-03); four lessons C->B. Prover now reads
PROVEN 5 for the tag (14 - 9 converted = 5), the correct post-conversion arithmetic.

**Rule learned the hard way — a form may only be registered if EVERY one of its content steps
can convert.** `lg-cob__numeric` and `lg-exp-solve__numeric` were registered on the strength of
one convertible step each, but both have a SIBLING step that is approximation-based and must
stay numeric. The generator then upgraded a surface the content could not match, and
variants.resolver.test.ts failed with "declared a2-logarithms but it does not serve numeric".
Both forms were unregistered and their 2 steps reverted (11 -> 9). Check sibling steps per form
BEFORE registering, not after.

**The approximation frontier (next breakthrough, evidence recorded).** The 14 out-of-scope log
steps are NOT underivable. Every one states its authored constants AND its rounding:
  "Compute log_2 10 = (log 10)/(log 2) with log 2 = 0.301. Round to 2 decimals."  -> 3.32
  "Given ln 2 = 0.693, evaluate ln 8 to 3 decimal places."                        -> 2.079
  "Half-life 10 years. Using ln 0.3 = -1.204 and ln 0.5 = -0.693..."              -> 17.4
Using an authored constant as an INPUT is not circular — it is exactly how a log table works.
The derivation is fully determined by (constants, formula, rounding), all three of which are in
the authored prompt. What this needs is a small expression interpreter that reads the stated
constants and the stated rounding, not another regex family. That unlocks the remaining 14 log
steps and very likely the same shape wherever a prompt supplies given values (trig tables,
compound-interest, decay). Estimated reach: the a2-logarithms remainder plus parts of
g12-limits-continuity and a2-statistics.

## S164 — approximationEvaluate shipped; lg-03 group fully converted

**The approximation breakthrough landed.** New exactNumberLab task `approximationEvaluate`
carries authored constants (e.g. "log 2 ≈ 0.301") plus a small closed expression tree
(`ApproxExpr`: const/lit/add/subtract/multiply/divide/negate) and a rounding precision, all as
DATA in the content spec — never parsed from prose at grading time. The log-table principle:
using a given constant as an input is not circular. `evalApproxExpr` is a ~20-line pure
recursive evaluator, exported and unit-tested (session164.approximation.test.ts).

Two more exact tasks (`logarithmEqualArguments`, `logarithmSumQuadratic`) closed a fully-exact
sibling group with zero approximation: log-equals-log and sum-of-logs-equals-constant, both
solved by re-deriving x from the surface coefficients (never from a pre-chosen answer).

**Converted this wave:** lg-03-01 (k2 exact + ch1 approx), lg-03-02 (k2 exact + ch1 approx),
lg-03-03 (k1 + ch1, both exact) — 6 steps, 3 lessons, closing the ENTIRE lg-03 lesson group.
lg-03-03 moved C->B; lg-03-01/02 were already at A/B from the conversion.

**Prover arithmetic, confirmed:** a2-logarithms now reads PROVEN 4 | out-of-scope 9 (was
PROVEN 8 | out-of-scope 11 before this wave; 8-4=4 converted-from-proven, 11-2=9
converted-from-out-of-scope — exactly matching the 6 steps landed).

**The remaining 9 out-of-scope steps (lg-04-*, lg-05-*) are a genuinely different, harder
case.** Their LIVE GENERATOR branches (lg-e, lg-e-solve, lg-models) compute transcendental
values directly in JS (Math.exp, Math.log) with float tolerance — there is no authored
constant to use as an input on the generator side, only on specific frozen content instances.
Registering these forms in EXACT_VARIANT_FORMS would require exactConfig to either (a) invent
the irrational value itself (violates the "no float rounding decides an answer" invariant that
approximationEvaluate was built to avoid) or (b) leave the live-generator path unconverted while
converting only the frozen content — forbidden by the variant-declaration rule proven since
S153/S163 (a form's generator and content must be paired, or neither converts).
**Recommendation: do not force these three forms.** lg-ln (2 of 3 steps already exact via
e^(ln n)=n, ln(e^a·e^b)=a+b — only k3's "Given ln 2..." needs the approximation, and lg-ln's
LIVE generator only ever produces the exact e^(ln n) shape, so lg-ln IS safely convertible) is
the one exception worth a follow-up session: register lg-ln, convert lg-04-02 (k1, k3 approx,
ch1), closing that lesson too.

## S165 — a2-radicals wave: 22 steps, 13 lessons, 13 forms, 8 lessons C→B

**The largest single-family wave yet, and the census-driven HS review it came from.** User
directive: review ALL high-school C/D lessons including precalc/calc/stats/probability, convert
engine-first. Census of every C/D family ranked by numeric-step count identified a2-radicals
(15 C/D numeric steps over 10 lessons, 22 total over 13 lessons corpus-wide) as the top target
already serviced by existing S160 radical tasks plus three cheap new ones.

**New tasks (schema + truth only, ~90 lines):** `radicalEquationSolve` (m·root_idx(kx+b)+d=rhs
with divisibility asserts at every division; also covers domain boundaries via rhs=0),
`radicalEquationExtraneous` (√(x+a)=x−b via the quadratic, keeping only the root that satisfies
the ORIGINAL equation — the extraneous-root check is IN the truth), `rationalExponentSolve`
(c(x+s)^(p/q)=rhs via a perfect-power pivot t=(rhs/c)^(1/p), throw unless exact). Plus a `sqrt`
unary op in ApproxExpr (throws on negative), unlocking authored root models (t=√h/4) and future
distance/geometry formulas.

**Coverage decision per the S163 both-directions rule:** all 13 re-* numeric forms enumerated
corpus-wide; every step on every form proven convertible BEFORE registration (Python prover:
14/15 C/D + full-corpus 22/22 spec plan, derived==frozen pre-write gate 22/22). Notable reuse:
re-convert→rationalExponentEvaluate, re-products→radicalProduct (positional labels),
re-transform→radicalSimplifyCoef, re-sqrt-fn→powerEvaluate, re-rules/re-conjugates/re-models→
approximationEvaluate with constants sourced from the prompts (exponent arithmetic and
difference-of-squares as exact lit formulas — the S164 log-table principle generalizes).

**Concurrent-instance convergence, verified not trusted:** a parallel instance had already
wired ALL 13 generator branches with params, all exactConfig kind branches, and the form
registrations — but not the ExactUpgradeConfig Pick type (TSC caught it), and its scaled-root
rounding survived the adversarial gate (1560 draws × 13 forms, 0 mismatches, 0 not-upgraded).

**Trig boundary sharpened (recorded, not converted):** g10-right-triangles (16 numeric) and
a2-trig (20 numeric) prompts are calculator-trig with float tolerance. The invariant is
INDEPENDENCE of the second derivation: truth calling Math.sin against a generator that also
calls Math.sin is the same method twice, not two methods. No independent exact route exists
for transcendental trig values — that is mathematics, not an engineering gap. The existing
triangleSolve manipulative has integer targets and a different task shape (exploration, not
free-numeric), so converting these steps to it would change the assessed task. Correct future
home: a measurement-class engine with declared tolerance semantics (new 8-file engine, not a
task).

**Tier motion:** re-01-02, re-02-02, re-02-03, re-03-01, re-03-03, re-04-03, re-05-01,
re-05-03 all C→B (global C 196→188). Remaining HS C/D backlog by numeric weight:
g12-polynomial-rational-analysis 15, g12-polar-parametric 16, g12-limits-continuity 14,
g12-vectors-matrices 14, g13-integration 14, g13-derivatives 11, g10-circle-theorems 11,
a2-statistics 5, exp-function/exp-solve 8+8, a1-exponential 7.

## S166 — g12-limits-continuity + a2-statistics; template-bank generator architecture discovered

**Primary wave:** 19 steps, 7 lessons (5 in `limits-continuity`, 2 in `statistical-inference`).

**New tasks (both purely integer/rational — no float decides an answer):**
- `rationalLimitAtInfinity`: encodes the three degree-comparison cases for lim(x→∞) P(x)/Q(x):
  deg(num)<deg(denom)→0; equal degrees→ratio of leading coefficients; deg(num)>deg(denom)→throws
  (no finite limit exists, and the truth branch should never be asked to produce one).
- `polynomialEvaluate`: evaluates p(x) at a specific integer point using Horner's method,
  storing both the term-substitution and the computed result as stage keys. Covers continuous
  function limits (direct substitution) and IVT sign-change witnesses.

**Statistics/probability (explicit user directive):** `a2-statistics` (si-02-03 and si-05-02,
standard error and diagnostic test accuracy) covered by `approximationEvaluate` + the sqrt op
added in S165. Same log-table principle: all constants (n, p, prevalence) are authored into the
spec as data, not parsed from the prompt at grading time.

**Critical architectural discovery mid-session:** g12-limits-continuity (and g13-derivatives-in-
context, g13-integration-accumulation — correcting the wrong claim from the prior turn) are NOT
tag-less. They are backed by a **template-bank generator system**: three JSON files
(calculusVariantTemplates.json, precalculusVariantTemplates.json, statProbabilityVariantTemplates.json)
holding pools of pre-authored widget instances, built through a shared factory
(authoredTemplateVariants.ts → `generatorsFromAuthoredBank`). The factory's `answerFor()` only
handled numeric/mcq/pointEntry/etc. — not exactNumberLab. The fix: add an `exactNumberLab` case
that calls `exactNumberTruth` and returns the `answerNumber`. Factory test: 2,000 draws (200 seeds
× 2 bands × 5 forms), 0 mismatches. Resolver: 17/17 (was 15/17).

**Critical error mid-session, caught and fixed:** A Python expression that opened `s150.py` for
write while simultaneously constructing the read expression zeroed the file (11KB → 0 bytes).
Caught by checking file size, restored from the S165 tar backup, re-verified it ran correctly,
then applied the correct patch. Written into KNOWN_ISSUES. The fix protocol: always write to a
named temp file and `shutil.copy()` to destination only after a separate subprocess confirm-run.

**Tier motion:** lc-02-03, lc-03-02, lc-04-01, lc-04-03, lc-05-03, si-02-03, si-05-02 all C→B
(global C 188→181). Total converted since S163: 19 (lg waves) + 22 (a2-radicals) + 19 (S166) = 60 steps.

**Important correction from previous turn:** The statement "g13-derivatives-in-context and
g13-integration-accumulation have no live generator" was incorrect. They are in
calculusVariantTemplates.json with full pool entries. Future conversion of those families must use
the template-bank rewrite approach (pool entries → exactNumberLab), not the params-on-generator
approach, and must extend answerFor() if new tasks are added.

## S167 — calculus template-bank wave: integration properties, antiderivatives, differentials

**First wave built on the corrected S166 understanding.** Both g13 families are backed by the
template-bank system, so every conversion is a PAIRED edit: the lesson step AND the matching
pool entry in calculusVariantTemplates.json, or the generator serves a surface the step no
longer has. 9 steps / 3 lessons / 3 forms, plus the 9 matching pool entries.

**New task `antiderivativeInitialValue`** — integrates a polynomial rate one or two times,
pinning each constant of integration with the authored initial condition, then evaluates at the
target. Covers F′(x)=2x with F(1)=5; v(t)=2t with s(0)=10; and the two-level a(t)=6t with
v(0)=2, s(0)=1. **Throws rather than round:** every integrated coefficient must land on an
integer, because integrating x² gives x³/3, which binary floating point cannot hold exactly. A
rounded coefficient must never decide an answer.

**Reused approximationEvaluate** for the two arithmetic-on-authored-quantities forms:
in-definite-integral (additivity and reversal over GIVEN integral values — ∫₁⁵=∫₁³+∫₃⁵, and the
reversal sign) and dc-differentials (dV=3s²·ds, percentage-error propagation, and the inverse
precision question). No new machinery needed; the constants come from the prompts as data.

**dc-related-rates DEFERRED, not converted, and not edited.** dc-02-01/ch1 carries two authored
misconception entries BOTH valued 36. Under `numeric` grading the second is dead code —
`commonErrors.find()` returns the first match — but exactNumberLab correctly rejects duplicate
numeric misconception values, and lint:pedagogy enforces it. Converting would mean deleting a
piece of authored feedback. Both the content file and the pool form were reverted byte-exactly
and the form left on `numeric`. The fix is an authoring decision (merge or re-value the
duplicate), not an engineering one, and it is pinned by a test so the deferral cannot rot.

**Remaining calculus boundary (unchanged):** in-usub cannot fully convert — ∫₀¹x/(x²+1)dx = ½ln2
and the prompt supplies no ln 2, so there is no authored constant and no independent exact
route. in-usub-limits is closer (two of three steps are exactly rational) but its middle step
needs sin(π/2); worth a later decision on whether special-angle exact values belong in the
engine. Tier: dc-03-02, in-01-03, in-04-02 all C→B (global C 181→178).

## S168 — g10-solid-geometry: 22 steps, 7 lessons, a FOURTH template bank, and the root op

**Reversed an earlier rejection, correctly.** S162 rejected g10-solid-geometry as "3-D volumes;
geometricConstraintLab is 2-D only". That was true of the wrong engine. Solid geometry is
arithmetic on authored dimensions, which is exactly what approximationEvaluate does — the
rejection was about the manipulative, not the mathematics. Re-examined and converted in full:
22 content steps (7 lessons, ALL of the family's C-tier lessons) plus 22 matching pool entries.

**A fourth template bank discovered: geometryVariantTemplates.json**, served by
geometryVariants.ts with its OWN factory (buildVariant) and its own surface whitelist — it does
NOT share authoredTemplateVariants.ts. The adversarial gate caught this immediately (2100 THROW
"Geometry template surface is not supported: exactNumberLab"), which is precisely why the gate
draws from the real generator instead of inspecting JSON. Added an exactNumberLab branch that
re-derives the answer via exactNumberTruth rather than reading a stored `answer` field.

**Running total of generator architectures: three.** (1) procedural params + exactConfig +
EXACT_VARIANT_FORMS (algebra2Variants etc.); (2) authoredTemplateVariants.ts serving calculus /
precalculus / statProbability banks; (3) geometryVariants.ts serving the geometry bank. Any
future family must be probed at RUNTIME to determine which path it uses.

**New `root` op** (nth root, any index) completing the radical family alongside sqrt. Like every
other exact operation it REFUSES to approximate: the radicand must be an exact perfect nth
power or it throws. Unlocks the inverse-volume question ("a tank holds exactly 288π units³ —
what radius?" → cbrt(3·288/4) = 6) without a rounded irrational ever touching an answer.

**Forms converted:** sg-revolution (cylinder/cone by revolution, plus a hypotenuse via sqrt),
sg-cavalieri-limits (lateral surface of a sheared prism), sg-sphere-justified (the
cylinder-minus-cone hemisphere argument), sg-composite-subtract, sg-composite-surface,
sg-density, sg-modeling (cost, surface-to-volume scaling, and the inverse-volume radius).
π enters as an AUTHORED constant with a stated value wherever a decimal answer needs it — the
same log-table principle as S164: a shared constant supplied as data is not a circular
derivation, because what the second method independently re-derives is the FORMULA.

**Tier:** all 7 solid-geometry lessons C→B (global C 178→171, B 316→323). Remaining sg forms
(sg-cavalieri, sg-cavalieri-apply, sg-cylinder-justified, sg-composite-add, sg-cross-sections,
sg-scale-effects, sg-section-reasoning, sg-third-story — 25 more numeric pool entries) are the
obvious next wave: same shape, same engine, no new machinery required.

## S169 — g10-solid-geometry COMPLETE: all 15 numeric forms, 47 pool entries, exact end to end

Finished what S168 started. The remaining 8 numeric forms converted: sg-cavalieri,
sg-cavalieri-apply, sg-cylinder-justified, sg-composite-add, sg-cross-sections,
sg-scale-effects, sg-section-reasoning, sg-third-story — 25 content steps (8 lessons) plus 25
matching pool entries, no new machinery required, exactly as predicted.

**The family is now fully exact:** all 15 numeric forms / 47 pool entries are exactNumberLab.
The adversarial gate confirms it end to end — 3600 draws across every numeric form, 0
mismatches, 0 not-upgraded. A regression test asserts the completeness invariant directly (no
numeric-surface stragglers, 47 entries, generator agrees with truth on every form and band), so
a future addition to this bank in the old surface will fail loudly rather than quietly.

**No tier movement, and that is the point.** All 8 lessons were already tier A — the gain here
is not scoring but determinism: every regenerated solid-geometry problem now re-derives its
answer from authored dimensions instead of trusting a stored number. Tier is a proxy for
manipulative richness, not for exactness, and the two are worth separating in how this work is
judged. The C→B movement in S168 came from the family's C-tier half; this half was already A.

**π fidelity rule adopted:** where a prompt states its own approximation (π ≈ 3.14159), the spec
authors π at THAT value, not at a more precise one. The learner should not be graded against
arithmetic more precise than the value they were handed. Where no value is stated, the full
constant is used. Pinned by a test.

**Derivations of note:** the leaning cylinder recovers its vertical height from slant edge and
sideways shift via Pythagoras (√(13²−5²)=12) rather than being handed the height; the sphere
section recovers the radius from a great-circle circumference (12π → r=6) before cubing; the
scale-effects family expresses "material per dollar" as k³/price, which is the actual reasoning
the step assesses.

**g10 remaining C/D backlog after this:** g10-triangle-congruence (4 numeric), circle-theorems
(11), constructions-proof (7), geometry-foundations (7) — mostly mcq-dominated, so smaller
numeric yield per lesson than solid geometry offered.

## S169 — g10-solid-geometry COMPLETE: all 15 numeric forms, 47 pool entries, 0 numeric left

Second solid-geometry wave finished the family. 25 content steps across 8 lessons (sg-01-01,
sg-01-03, sg-02-01, sg-02-02, sg-03-01, sg-03-02, sg-04-01, sg-05-01) plus the remaining pool
entries. The bank now holds 47 exactNumberLab entries across 15 forms and ZERO numeric entries
for this tag — the first family in the project converted end to end on both sides.

Forms completed this wave: sg-cavalieri, sg-cavalieri-apply, sg-cylinder-justified,
sg-composite-add, sg-cross-sections, sg-scale-effects, sg-section-reasoning, sg-third-story.
No new machinery was required — sqrt, root, and the arithmetic ops from S164/S165/S168 covered
every remaining shape, which is the payoff of building the ops as a general expression tree
rather than per-family special cases.

Verified independently after the fact: 25/25 content sound (parse, derive, gate, grade,
wrong-answer rejection, misconception routing) and 3600 generator draws across all 15 forms with
0 mismatches. No tier movement — these 8 lessons were already A/B; the gain here is exact
regeneration, not tier score.

**Regression found and repaired (worth recording as a pattern).** The full suite failed 2/10512
on scaffoldFixes.test.ts, which pins 18 hand-reviewed scaffold-gap fixes and asserted
`sg-05-01/k4` was a `numeric` widget. S169 upgraded that step, so the assertion tripped. The
test ALREADY carried precedent for exactly this situation — it handles rr-05-03/k4's earlier
upgrade to proportionalReasoningLab with a comment calling it "a genuine engine upgrade, not a
regression". The fix mirrors that branch for exactNumberLab: identical assertions (the correct
value grades correct; every misconception fires its OWN feedback), routed through
exactNumberTruth/exactNumberExplorationKeys instead of a bare `answer` field. 90/90 passing.
The assertions were not weakened — a surface-agnostic pedagogical guard is what the test was
always for, and each engine upgrade should extend it rather than be exempted from it.

## S170 — a1-systems (linearSystemSolve) + g10-circle-theorems: 22 steps, 6 lessons, zero new tasks for geometry

**New task `linearSystemSolve`** — solves a1x+b1y=c1, a2x+b2y=c2 for x or y via Cramer's rule.
Throws on a singular system (parallel/identical lines) and on any non-integer coordinate rather
than round — the determinant division must land exactly.

**Scoping correction made mid-session, not papered over.** The adversarial gate initially showed
6 of 9 a1-systems forms as "not upgraded" — investigation (not a shrug) found those 6
(eliminate-add-subtract, eliminate-scale-one, eliminate-scale-both, solve-by-graphing,
system-solution, substitution-solve) are already served by `affineRelationshipLab`, a richer
manipulative from earlier lineage work, via a SEPARATE registry (`AFFINE_VARIANT_FORMS`, not a
naming collision with `EXACT_VARIANT_FORMS`). Registration was trimmed to the 3 forms actually
needed by content (word-total-difference, word-count-value, word-choose-interpret) rather than
overriding a superior existing system. This is the second time in this lineage a "failure" in
the adversarial gate revealed correct pre-existing behavior rather than a real bug — the gate's
value is exactly that it does not distinguish between the two without investigation.

**g10-circle-theorems needed ZERO new tasks** — every one of its 11 steps (tangent-length
triangles, chord/secant angle theorems, power-of-a-point segment products) is exact arithmetic
on authored segment/arc lengths, expressed entirely via approximationEvaluate (including its
sqrt op for the tangent-length case PT=sqrt(external*whole)). One step (cr-04-03/ch, the
circular-well distance problem) is a genuine irrational with a DECLARED tolerance (0.05) — not a
disguised approximation but an authentically non-terminating answer the content already
expected a decimal for, solved via the same sqrt-based quadratic-formula pattern used for S165's
radical equations.

**Both content and the geometry bank pool converted together** (11 pool entries each, matching
S168/S169's paired-edit discipline). Adversarial gate: 2400 draws across both generators
(a1-systems procedural + g10-circle-theorems bank), 0 mismatches.

**Tier:** cr-03-03, cr-04-01, cr-04-03, se-04-01, se-04-02, se-04-03 all C->B (global C 171->165).

**g12-vectors-matrices remains deliberately deferred.** 12 of its 14 numeric steps are clean
exact arithmetic (magnitude via sqrt, matrix operations, 2x2 linear systems — this session's
linearSystemSolve task covers the last of those directly). The remaining 2 steps
(vec-01-02/k2,k3) need sin(30 deg) and cos(45 deg) — SPECIAL ANGLES with algebraically exact
values (1/2 and root2/2), not arbitrary transcendental evaluation. This is a genuinely different
question from the g10-right-triangles rejection: a hardcoded table of the five standard special
angles is an INDEPENDENT method from calling Math.sin (definitional geometry from 30-60-90 and
45-45-90 triangles, not the same function twice), so it may be legitimate — but the whitelist
boundary needs to be airtight (throw on anything outside the five standard angles) and deserves
dedicated attention rather than a rushed inclusion alongside two other families.

## S171 — g12-function-analysis COMPLETE + g12-polynomial-rational-analysis subset

**g12-function-analysis fully converted: 6 forms, 12 pool entries, zero new tasks.** Function
composition, domain-of-composition, decomposed real-world chains (ripple area, growing square),
one-to-one collision, restricted-domain inverses, and inverse-verification all reduce to nested
arithmetic once the specific numbers are substituted — |x| itself expressed as sqrt(x·x) rather
than a new abs op, keeping the operation set minimal.

**g12-polynomial-rational-analysis: a 9-step, 5-form subset.** Complex-conjugate products
(pra-conjugate, half of pra-build-mixed) are REAL-VALUED algebraic identities — (a−bi)(a+bi)=
a²+b² never touches imaginary arithmetic; the imaginary part is a bookkeeping device that
cancels by construction, so the truth computation is exact real arithmetic throughout. Slant
asymptotes (pra-slant-find) reduce to synthetic-division coefficient formulas. The minimal
degree/constant-term questions (rest of pra-build-mixed) are exact counting and polynomial
expansion of a conjugate-pair-plus-real-root product.

**New task `polynomialIntegerRoots`** unlocks pra-rrt-pipeline (paired coefficient-extraction +
largest-zero steps, which had to convert together since they share one pool). Tests every
rational-root-theorem candidate by direct substitution — deliberately monic-only (leading
coefficient forced to 1), throwing rather than searching the general p/q candidate space for a
non-monic case. That's a real, documented limitation, not a hidden one.

**Deferred, not attempted:** pra-01-01 (rational-root CANDIDATE COUNTING — enumerating and
deduplicating ±(divisor of const)/(divisor of leading), a genuinely different operation from
root-finding) and pra-02-01 (zero-multiplicity counting: sum-with-multiplicity vs.
count-of-distinct vs. degree-minus-real). Both need dedicated new tasks; scoped out rather than
rushed. 6 steps, 2 lessons, well-understood, next candidate.

**Tier:** 10 lessons C→B (global C 165→155). Adversarial gate: 3000 draws across 10 forms, 0
mismatches, 0 not-upgraded.

## S172 — g12-polynomial-rational-analysis: candidate-counting, zero-counting, one bookkeeping fix

**Two genuinely new counting operations, deliberately distinct from evaluation.**
`rationalRootCandidateCount` enumerates divisors of the constant and leading coefficient,
reduces every quotient by exact integer GCD, and counts DISTINCT values (×2 for sign) — no
polynomial is substituted into. `polynomialZeroCount` handles three counting modes (sum of
multiplicities, count of distinct factors, degree-minus-given-real-count) — again, counting,
never evaluation. This is a real methodological distinction from S171's `polynomialIntegerRoots`
(which tests candidates by substitution): counting HOW MANY candidates exist and testing WHICH
candidates work are different mathematical operations and deserved different tasks rather than
one task awkwardly overloaded.

**A precise correction to last session's premature "fully converted" claim.** S171's writeup
should have scoped its completeness claim to the forms actually touched; this session's own
first draft of the regression test repeated the same overclaim before being checked against
every numeric form in the bank. Four more forms turned out to remain: `pra-rrt-test`
(1 entry — trivially closed via the EXISTING `polynomialEvaluate` task from S166, f(2)=0) and
three inequality-solving forms (`pra-boundary-rule`, `pra-ineq-scratch`, `pra-rearrange`) that
need genuine sign-chart/interval-counting infrastructure not yet built. The regression test now
asserts completeness ONLY outside the three deferred forms, and separately asserts those three
are STILL numeric — so the test cannot silently go stale if someone converts them without
updating the exclusion list, and cannot silently overclaim if someone adds a new numeric form.

**Also caught: a step-count/file-count conflation in my own allowlist patch**, the same error
class from S164 — bumped the proof threshold by the STEP count (6) instead of the NEW
LESSON-FILE count (2), producing an immediate, loud failure (proof exits 1, prints the mismatch
JSON) rather than a silent wrong-pass. Fixed by reading the script's own reported
`lessonFilesChanged` count rather than re-deriving it by hand.

**Tier:** pra-01-01, pra-02-01 C→B (global C 155→153). g12-polynomial-rational-analysis numeric
coverage: 10 of 13 forms now exactNumberLab; three inequality-counting forms remain, next
candidate once interval/sign-chart counting infrastructure is built.

## S173 — g12-vectors-matrices: 11 of 12 numeric forms, and a deliberate special-angle exception

**The most consequential design decision since the trig boundary itself.** Rather than defer
vec-01-02's three special-angle steps again, committed to a narrow, carefully-bounded exception:
`sinDeg`/`cosDeg` ops with a hardcoded table of the SIXTEEN standard 30-60-90/45-45-90 special
angles, and a `vectorDirectionAngle` task recognizing only axes (x=0 or y=0) and the 45° diagonal
(|x|=|y|). Both throw on anything outside their whitelist — no fallback to a generic trig call.

**Why this is NOT a reversal of the g10-right-triangles/a2-trig rejection.** The distinction was
never "trig is forbidden" — it was "arbitrary-angle trig has no independent closed form, so a
second method is not actually independent." sin(30°)=1/2 and the |x|=|y| diagonal case ARE
closed-form algebraic facts, provable from the 30-60-90/45-45-90 triangles, exactly like
sqrt(4)=2 is a closed-form fact and sqrt(2) is not "forbidden" just because it's irrational. The
adversarial gate confirms this empirically: 1,500 draws of the live generator for these forms
never produced anything outside the whitelist — the CONTENT was already designed around these
special cases; the engine now matches that design rather than approximating around it.

Proof the whitelist actually holds the line: the regression test exercises FOURTEEN non-special
angles (1°, 10°, 15°, 20°, 37°, 40°, 50°, 55°, 70°, 80°, 100°, 200°, 250°, 359°) and asserts
every one throws, plus four off-diagonal vectors for the component-to-angle direction. A silent
fallback here would have quietly collapsed the entire distinction; the test makes that
impossible without a visible failure.

**Six more forms converted for free once the family was properly audited** (the same
"check the whole family before claiming completion" discipline S172 was forced to learn):
vec-add, vec-applications, vec-components, vec-dot, vec-rotation, vec-work — all pure
vector-arithmetic (magnitude, dot product) with zero new machinery. vec-rotation's 90° case
needed no trig at all: rotation by exactly 90° is algebraic ((x,y)→(-y,x)), since cos90°=0 and
sin90°=1 make the rotation matrix pure sign-flips.

**vec-angle deliberately deferred and pinned.** Its pool mixes three whitelist-eligible steps
(0°, 45°, 60°) with one genuine arccos(0.6)=53.13° from a 3-4-5 triangle — a real angle with no
closed form in degrees. Registering the form would require either inventing a value for that
step or omitting it, both wrong. The regression test confirms the 53.13° entry is genuinely
present (not merely assumed) and asserts the whole form stays on the numeric surface.

**Tier:** 5 lessons C→B (the 6 newly-discovered forms belonged to already-A/B lessons, so no
further tier movement there — same pattern as S169's solid-geometry completion). Adversarial
gate: 3,300 draws across 11 forms, 0 mismatches, 0 not-upgraded.

## S174 — polygon-angles COMPLETE: a naming-convention bug caught before the adversarial gate

**8 steps, 3 lessons, 7 forms, zero new tasks.** Interior/exterior angle relationships are pure
closed-form arithmetic on one given quantity (sides, sum, interior angle, or exterior angle) —
no trigonometry anywhere in this family, a clean contrast with S173's careful special-angle work.

**A real bug caught by process, not luck.** This generator (defined directly in variants.ts, not
algebra1Variants.ts/algebra2Variants.ts) uses a shared `num()` helper with no built-in params
argument — wiring required attaching `params` as a sibling field on the returned `Variant` via
its documented-but-previously-unused optional property, not extending `num()`'s signature.
More consequentially: this family does NOT use the `concept__surface` form-naming convention
every other converted family has used. Forms are bare names ("sidesFromSum", "exteriorSum", …),
and the no-form content steps resolve via the literal string "default" (the generator's own
default parameter value). The first registration attempt used the wrong convention
("sidesFromSum__numeric") — caught by reading the generator's actual dispatch logic
(`if (form === "sidesFromInterior")`, checking the WHOLE form string with no `__` split) before
running the adversarial gate, not after a failure. Fixed, then verified: 4,200 draws across all
7 forms and 3 bands, 0 mismatches, 0 not-upgraded.

**Tier:** all 3 lessons C→B (global C 148→145). This closes the family entirely — no numeric
forms remain in polygon-angles.

## S175/S176 — lg-ln closes lg-04-02; a2-polynomials + a2-rationals: 9 forms, 19 total steps

**lg-ln closed** (3 steps): e^(ln n)=n is a pure inverse-function identity, matching the live
generator's own numeric branch exactly. k3 and ch1 (given ln2≈0.693; ln(e³·e⁴)=7) are frozen
instances the generator never regenerates, converted independently — the established pattern.

**Nine forms across a2-polynomials/a2-rationals converted**, all via existing tasks
(approximationEvaluate, polynomialEvaluate, rationalLimitAtInfinity) — zero new schema surface.
rf-ha reuses rationalLimitAtInfinity directly: (10x+3)/(2x−1) is exactly the same
degree-ratio-of-leading-coefficients pattern S166 built for calculus limits.

**A discovery worth recording precisely: rf-like-denoms's generator construction.** The prompt
`(ax)/(x−d) − ((a−k)x + kd)/(x−d)` is engineered so the numerator difference is ALWAYS exactly
k(x−d), making the simplified result exactly k regardless of a, d, k — confirmed by reading the
generator source, not assumed from the frozen instance's coincidental shape (which shows a bare
constant "8" because a−k happens to be 0 in that one case).

**A genuine limitation caught and DOCUMENTED rather than silently accepted: pf-turning/ch1.**
Its formula (turningPoints+1) has no end-behavior parity check, yet the frozen instance ("2
turns, falls-left-rises-right") needs one — a degree must be odd to match that end behavior. The
answer (3) is mathematically correct for this specific case (hand-verified: 2+1=3, and 3 is
already odd, so no adjustment was needed) — but the formula does not encode WHY, only compute
turns+1. This is safe in the delivered system because the live generator's own branch never
poses the parity-constrained question (confirmed by a 40-draw sweep asserting no redraw ever
matches "falls/rises" phrasing), so no future variant will ever exercise this formula with
numbers where the coincidence fails. The regression test pins this exact reasoning and would
fail loudly if either fact changed. A genuinely general fix needs a small dedicated
parity-aware task — worth building if this concept ever gets a second authored instance.

**Tier:** 10 lessons C→B this wave (lg-04-02, pf-01-01, pf-03-01, pf-03-02, pf-05-02, pf-05-03,
rf-03-01, rf-04-03, rf-05-02, rf-05-03). Adversarial gate: lg-ln 600 draws + the nine
polynomials/rationals forms 3600 draws, 0 mismatches, 0 not-upgraded throughout.

## S175/S176/S177 — lg-ln closes, eight of nine polynomials/rationals forms convert, one reverted on review

**lg-ln (S175):** e^(ln n)=n identity closes lg-04-02 (3 steps) — fully scoped since S164, zero
risk, the live generator's numeric branch always produces exactly this identity shape.

**a2-polynomials/a2-rationals (S176, 14 of 16 planned steps landed):** pf-anatomy, pf-long-div,
pf-synthetic, pf-build, rf-like-denoms, rf-ha, rf-work, rf-variation — all reuse existing tasks
(polynomialEvaluate, rationalLimitAtInfinity, approximationEvaluate), zero new schema surface.
rf-ha in particular is a direct, unmodified reuse of S166's rationalLimitAtInfinity. Adversarial
gate: 3200 draws across 8 forms, 0 mismatches, 0 not-upgraded (verified independently, not
inherited — an early version of the gate script itself had a strict-equality bug comparing
floats, caught and fixed before trusting its FAILURES output).

**pf-turning REVERTED on review (S177) — see KNOWN_ISSUES.md for the full account.** The
concurrent instance's work here was careful and its safety claim about the live generator was
verified correct; the reversal is a considered disagreement about what "independent derivation"
requires for a stage-narration system a learner reads, not a correction of an error on their
part. ch1 needs a genuine end-behavior-parity task; turns+1 alone is right only by coincidence
for its one frozen instance (turns=2) and demonstrably wrong for other inputs of the same
concept (turns=3 needs degree 5, not 4). Both content and the exactConfig branch were reverted;
the form is unregistered.

**Tier:** all touched lessons except pf-05-02 (correctly unaffected — reverted to its original
C-tier state) moved C->B. This session is a good example of the difference between "the gates
passed" and "the content is correct" — worth keeping in mind for every future wave, especially
ones that reuse an already-wired task on a new problem shape rather than building fresh for it.

## S178 — an honesty audit over everything already shipped, and a gate for the blind spot

Directive: "A lesson is complete when its mathematical action is represented honestly and tested
well, not merely when its generated letter changes." Applied that standard BACKWARDS over all 287
converted steps rather than converting anything new — S177 proved a formula can match its frozen
answer, pass every gate, and still misdescribe the concept.

**Three checkable proxies for dishonesty**, since "does this represent the mathematics?" cannot be
fully automated: (A) the formula is a bare const already equal to the answer — nothing derived;
(B) an authored constant the formula never references — decoration, or an ignored quantity;
(C) tripling a referenced constant does not move the answer — an input doing no work.

**45 initial flags, 32 of which were false positives from my OWN audit design** — a +1
perturbation on a rounded formula gets absorbed by approxRound and reads as "inert". Perturbing
by ×3+7 instead cut it to 13. Worth recording: a gate reporting failures is not automatically
right either, and the first move on a suspicious result is to check the instrument.

**Three real defects found and fixed, all narration-honesty rather than wrong answers:**
- fna-04-02/k2 — the constant's label described the quantity BACKWARDS ("the value subtracted
  from x" for the 5 in √(5 − x), where x is subtracted from 5). Answer genuinely equals k, so
  this is a true identity, not answer-copying; the label was the defect.
- fna-04-02/ch1 — carried TWO constants for the same quantity (both = 2), one of them dead, while
  the meaningful 3 sat as an unnamed literal doing hidden work. Rewritten to name both real
  inputs: gShift + fExcluded².
- vec-05-02/ch1 — labelled only "v_x", carrying none of the reasoning. Relabelled to state the
  rule that makes the answer an identity: 90° CCW sends (x, y) → (−y, x), so the new y IS x.

**The remaining 12 flags are legitimate and now individually justified in a permanent test.**
e^(ln 5) = 5 IS the identity being taught; a horizontal asymptote's y-value IS the limit by
definition; exterior angles sum to 360° for every polygon so 'n' is deliberately inert and
labelled as such; the vec-03-03 work steps write the dot product in full and are inert only
because the DATA has zero components.

**session178.honestyGate.test.ts closes the blind spot permanently.** Any newly converted step
whose formula restates its answer or carries a dead constant now FAILS until someone either makes
it derive, or records in that file why restating is the honest representation for that specific
mathematics. A second assertion catches stale justifications, so the allowlist cannot rot. No
tier letter moved this session, by design — the work was making already-"complete" lessons
actually honest.

## S178 — the parity-aware task the S177 review demanded, plus three derivation improvements

**`polynomialMinimumDegree` closes the loop opened by the S176/S177 reversal.** Turning-point
minimum-degree questions now take the end-behavior constraint as an explicit field rather than
assuming it away: opposite ends force odd degree, matching ends force even, unconstrained takes
turns+1 directly. pf-05-02 re-converted (2 steps, C->B), with ch1's stage narration now showing
BOTH `pmd:floor` and `pmd:parity`. Pre-write gate covered 11 cases including the exact
counter-example (3 turns + odd constraint -> 5, which the old turns+1 formula got wrong as 4);
adversarial gate 600 draws, 0 mismatches.

**Also verified (not inherited) three derivation improvements** a concurrent instance made to
already-converted steps: fna-04-02/k2 and /ch1, and vec-05-02/ch1. These replace bare literals
with named constants and genuine formulas — e.g. fna-04-02/ch1 now derives the excluded input as
gShift + fExcluded² (g(x)=√(x−3) must equal the 2 that f rejects, so x = 3 + 2² = 7) rather than
stating 7. Independently re-derived by hand and re-verified through the engine: 3/3 sound. This
is the same standard the pf-turning reversal was about, applied proactively.

**Family status:** a2-polynomials numeric forms now fully converted (5 of 5). Global C 136->135.

## S180 — exp-function: representation over restatement, the whole family at once

**Wave:** all 16 numeric steps across exp-01-01, exp-01-03, exp-02-01, exp-02-02 — the complete
family (7 named forms plus the unguarded `default` fallback that three frozen steps reach via an
ABSENT `variant.form`), onto `exactNumberLab`/`approximationEvaluate`. Zero new tasks, as scoped.

**Representation choices (the point of the session, per the standing honesty principle):**
- a·bˣ is the coefficient followed by x FACTORS of b. The ApproxExpr union has no pow op on
  purpose, and repeated multiplication is what the exponent means — the chain IS the derivation,
  and the "one period short" trap is literally one missing node.
- b⁰ is DERIVED as b ÷ b (the quotient law b^(1−1)), never asserted as a bare literal 1. This
  keeps the base — the exact quantity both trap distractors talk about — inside the spec, where
  it visibly cancels. The session test then states the concept as an executable claim: perturbing
  the base leaves f(0) fixed at the coefficient; perturbing the coefficient moves it one-for-one.
  No RESTATES-ANSWER justification needed anywhere; the S178 gate stays at its prior count.
- Decay is the start amount times one authored decay factor (1/2 or 1/4) per step — the S164
  log-table principle (an authored constant used as an input is not circular). All decay
  arithmetic is exact in binary (powers of two divided into integers).
- The geometric forms derive: ratio = t₁ ÷ t₀; next term = t_last × (t₁ ÷ t₀). Sequence steps are
  verified genuinely geometric (all three consecutive ratios equal) before any spec is trusted.
- No `lit` nodes exist anywhere in the family: every number in every formula traces to an
  authored, labelled constant, and a liveness sweep asserts each is load-bearing.

**Pre-write gate:** four-way agreement per step or abort — hand table (repeated multiplication/
division only, never `**`) == strict prompt extraction == engine-derived truth == frozen answer.
16/16, zero mismatch, including the two frozen-only shapes the generator never produces (the
"How many are there after 3 hours" wording of exp-02-01/ch1, and the C=256 quarter-decay draw
outside the live C pool). Baselines sealed to scripts/session/baselines-s180 and the ledger
written BEFORE any lesson byte changed.

**Generator side:** params-first (S161 pattern) — all 9 return sites publish the integers they
built the problem from; six exactConfig kinds (`exp-eval`, `exp-zero`, `exp-zero-decay`,
`exp-decay`, `exp-ratio`, `exp-next`); registered with bare-name forms + `default`, matching the
polygon-angles dispatch convention this family shares. Adversarial sweep: 8 forms × 30 seeds all
upgrade and self-derive, with an independent prompt-parsing recompute per draw.

**Tier motion:** exp-02-01 and exp-02-02 C→B (prediction 0 caps them below A); exp-01-01 and
exp-01-03 were already A and their manip dimension rose 2→3 — converted anyway, because the
family rule and the honesty principle apply to the mathematics, not the letter. Global
C 134→132, B 360→362.

**Next in this corner:** exp-solve + a1-exponential's exp-match-base (11 steps) genuinely need a
new `exponentSolve` task — exact cross-multiplication over integer exponents with baseNum/baseDen
rationals, never Math.log. Budget it like polynomialMinimumDegree, not like this session.

## S181 — exponentSolve, and the first course closed end to end

**23 steps, 8 lessons, two waves.** Wave A gave `exponentSolve` its content: exp-solve (3 forms)
and a1-exponential exp-match-base. Exact integer cross-multiplication over x in [-12, 12], never
Math.log; exactly-one-hit or throw, so "no integer solution" is an error rather than a rounded
guess. Wave B closed the course with the remaining 12 a1-exponential numerics, adding `exp-rate`
(rational growth factor, the x3/2 the prose shows).

**The refusals are the interesting part.** The test file asserts the engine REFUSES 3^x = 10
(where a log would round to 2 and fail a correct learner), 2^x = 48, a coefficient that does not
divide, a target outside the authored window, and a degenerate base of 1. Written before the
wiring existed.

**Status:** exponential-functions is the first course where every variant-backed numeric step is
engine-backed (39/39). Global C 132->127.

**Next candidates by numeric weight:** g12-polynomial-rational-analysis 15, g12-polar-parametric
16, g12-vectors-matrices 14, g13-integration 14, g13-derivatives 11, g10-circle-theorems 11. The
trig boundary (g10-right-triangles 16, a2-trig 20) remains correctly OUT of scope: no independent
exact route exists for transcendental values, and truth calling Math.sin against a generator that
also calls Math.sin is the same method twice, not two methods.
