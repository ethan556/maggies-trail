# Session: fractionEntry batch 1 (20 steps)

Coverage 699 → 719 / 4,471 (15.63% → 16.08%). fractionEntry unserved 35 → 15.
Generators 127 → 131. Tests 1,954 → 1,972. All six gates green (build by exit code).

## New generators (src/lib/variants.ts)
- `repeat-decimal` (default oneDigit / twoDigit / threeDigit) → rns-convert-to-fraction (4 steps).
  Guards: d ≤ 8 (0.999… = 1), no aa / aaa blocks (period collapse). Route: geometric-series
  summation + continued fractions — never the 9s rule.
- `neg-rational-exp` → rad-neg-rational-exp (4). b = n^q, q ∈ {2,3,4,5}, p/q reduced, n^p ≤ 125.
  Traps: −n^p and +n^p. Route: integer search for the root, never Math.pow-root.
- `unit-frac-divide` (default wholeDivUnit / unitDivWhole / word) → whole-div-unit (2),
  unit-div-whole (3), fraction-div-word (1). w, u coprime so the wrong-way trap displays as
  written. Routes: repeated addition (default), numeric division + denominator search.
- `fraction-meaning` (default onePart / takeSome / complement) → unit-fraction (2),
  num-denom (2), parts-as-fractions (2). All traps guarded coprime IN WRITTEN FORM — a 6/9
  trap stored as 2/3 matches by value but its diagnosis names numbers the entry never showed.
  Routes: measure a cut interval; re-read the recipe; count by marking an array.

## Infrastructure
- `fracEntry` builder: optional `formFeedback` and `unit` params.
- fractionEntry gate (variants.test.ts): trap distinctness now compares SIGNED values,
  matching the evaluator — without it the legitimate −8/+8 trap pair reads as one trap.
- Restored `vitest.setup.ts` (missing from the deployable tar; copied from work/ snapshot).
- New measure tools: scripts/measure/fe.mts (unserved fractionEntry list),
  dumpfe.mjs (fractionEntry dumper), print-new.mts (read-the-output harness).

## Reading catches this batch (the gate is necessary, not sufficient)
- word-form success feedback dropped its unit ("1/24 each" → "1/24 m each").
- takeSome / complement traps displayed reduced; coprime guards added.

## Next by leverage (unchanged from handover §7, minus what's done)
- Remaining fractionEntry: groups-of-fraction(3), pr-unit-rate-mixed(3),
  line-plot-operations(3), rno-frac-multiply-sign(2), rno-frac-divide-sign(2),
  decimal-place-names(2) — 15 steps.
- Then G12/G13 conics (`co-03-*` hyperbolas continue the served parabola/ellipse family).
- Then buildExpression (186 unserved), pointEntry+plotPoint builder.

## Continuation (same session): +7 steps → 726 / 4,471 (16.24%)

- `whole-times-fraction` (default simplify / toMixed / mixedProduct) → groups-of-fraction (3).
  Guards: gcd(a,b)=1, leftover coprime to b (mixed form demands it), leftover ≠ a (else the
  keeps-the-numerator trap IS the answer), w·a ≠ w+a. Ordinal-suffix morphology avoided by
  phrasing ("leaves only rr/b"), never derived "3th"/"5ths" strings.
- `frac-sign-ops` (default mulSame / mulDiff / divSame / divDiff) → rno-frac-multiply-sign (2),
  rno-frac-divide-sign (2). The sign trap is the same magnitude with the wrong sign — the signed
  trap-distinctness gate from earlier in this session is what makes it admissible. mulDiff forces
  a reducible raw product (its authored step grades lowest terms with formFeedback).
- Type/gate extensions: `VariantAnswer` fraction member gains optional `sign: 1|-1`;
  the gate's answer bound is now nonzero-MAGNITUDE (a negative answer like −3/25 is legitimate;
  strictly-positive predated signed answers). Routes: repeated addition / repeated subtraction
  for the whole×fraction pipeline; sign-by-counting-minus-signs + coprime-first numeric search
  for the signed ops.
- Reading catches: a dangling "give a positive." from a careless .replace; two derived-ordinal
  strings removed before they shipped.

fractionEntry now 8 unserved: pr-unit-rate-mixed(3), line-plot-operations(3),
decimal-place-names(2) — next batch's first target, then G12/G13 conics.

## Continuation 2 (same session): +8 steps → 734 / 4,471 (16.42%)

**fractionEntry is now FULLY SERVED — 0 unserved steps remain** (was 35 at handover, the #1
leverage target in §7). None of the 35 needed rejection; even line-plot-operations turned out
to be text-encoded plots, not drawn figures.

- `decimal-place-value` (default / zeros) → decimal-place-names (2). Answer stored UNREDUCED
  (4/10, never 2/5) — the unreduced denominator IS the place being named. Route finds the digit
  by string position in the printed decimal, den built by loop.
- `unit-rate-frac` → pr-unit-rate-mixed (3). Traps: reciprocal (flipped the wrong fraction) and
  direct product. Guards: ad ≠ bc (answer off its own reciprocal), c ≠ d, both traps coprime in
  written form. Route: numeric division + coprime-first search.
- `line-plot-frac` (default total / difference) → line-plot-operations (3). Plots stay in the
  authored text encoding (1/4 → XX). All arithmetic in integer quarters. Traps: biggest single
  stack mistaken for the total / one dropped mark; sum-instead-of-difference / longest itself.
  Route: count Xs by string length, tally quarters by loops, convert by repeated subtraction.

Session grand total: 35 steps, 9 generators, 20 forms, 3 gate/type extensions
(signed trap distinctness, nonzero-magnitude answers, signed VariantAnswer member),
1 restored file (vitest.setup.ts). Tests 1,954 → 1,994.

## Next by leverage (handover §7 order, updated)
1. **G12/G13 conics** — `co-03-*` hyperbolas continue the served parabola/ellipse family.
2. **buildExpression** (186 unserved) — cheapest slice `esn-compute-*` (12 steps).
3. **pointEntry + plotPoint** (21 + 13) — one coordinate-entry builder unlocks both.
Skip matchPairs (23u across ~23 distinct tags — worst leverage in the corpus).

## Continuation 3 (same session): +7 steps → 741 / 4,471 (16.57%), G12 4.6% → 6.0%

Started the G12 conics family (`co-03-*` hyperbolas), continuing the served parabola/ellipse work:

- `hyperbola-anatomy` (default focalDiff / twoA / vertices [mcq] / opens [mcq]) → co-hyperbola,
  all 4 steps of co-03-01. Both MCQ forms draw either orientation (x-first or y-first) so the
  correct option genuinely moves with the equation. MCQ routes recompute the correct LABEL from
  the equation and match it among the shuffled options.
- `hyperbola-cab` (default findB / findC / slope) → co-asymptote, 3 of co-03-02's 4 steps.
  findC uses Pythagorean triples so c is an integer; the sign-flip-from-ellipse trap is a + b
  (adds the lengths) plus c² (stopped at the square). Slope pairs are drawn so b/a is EXACT at
  two decimals — the authored prompt says "(Decimal.)" and states no rounding convention, so
  the generator never needs one (the rule-6 trig lesson applied in advance). Routes re-derive
  everything from the printed equation's denominators by root SEARCH.

**REJECTED: co-03-02/k3** ("How does the hyperbola's focus rule differ from the ellipse's?") —
a single conceptual fact with exactly one problem in existence, iSquared-class. A generator
would emit the identical widget forever. Left unserved deliberately.

Noted in passing, NOT fixed (frozen content): authored co-03-02/k2's first trap feedback claims
"1 = √(16 − 9)" — √7 ≈ 2.65, not 1. The trap VALUE (1) still fires on b − a slips; only its
justification is off. Flag for a human content pass.

Session grand total now: 42 steps, 11 generators. Tests 1,954 → 2,005.

## Next by leverage
1. co-04-* / co-05-*: co-complete(4), co-general-hp(4), co-ecc-unify(4 — one step is
   buildExpression), co-focus-directrix(4), co-identify(4 mcq), co-orbits(4 mcq) — the same
   course, same style, ~24 steps of runway.
2. esn-compute-* buildExpression slice (12 steps).
3. Coordinate-entry builder → pointEntry (21) + plotPoint (13).

## Continuation 4 (recovered from an interrupted turn): +21 steps → 762 / 4,471 (17.04%)

**G12: 6.0% → 10.4%** — the entire conic-sections course is now served except two deliberate
holds. The turn was cut off mid-stream; on resume, all code (6 generators, 13 forms, routes,
BAND entries, declarations) was already on disk and the full vitest suite passed at 2,036.
What remained was the discipline: print-and-read (all 19 forms read correctly), verify.mts,
and the content/pedagogy/registration/build gates — all green.

- `conic-classify` (default ellipse / hyperbolaCase / parabolaCase / circleCase) → co-identify (4 mcq).
  Sign-and-coefficient classification; both orientations drawn for the parabola case.
- `circle-complete` (center mcq / radius / semiMajor / completeSquare) → co-complete (4).
- `conic-general` (default 4p / convertA) → co-general-hp k1b + ch1; its k1 reuses the
  already-served `hyperbola-cab` default — cross-course generator reuse, no new code.
- `ecc-classify` (default name-the-conic / ratioCompare) → co-ecc-unify k2 + co-focus-directrix k1.
  Default rotates all three classes (ellipse / parabola / hyperbola) with the drawn e.
- `directrix-ecc` (default a/e / ratio / hypEcc) → co-focus-directrix k2, k3, ch1.
- `orbit-ecc` (default planet / flyby / reflector / comet) → co-orbits (4 mcq). Applied
  eccentricity: near-zero orbits, unbound e > 1 flybys, parabolic reflectors, comet ellipses.
- co-05-01/k3 reuses `ellipse-abc/eccentricity` — a second zero-code serve.

**REJECTED: co-05-01/k1** ("Which eccentricity gives a parabola?") — single conceptual fact,
iSquared-class. **DEFERRED: co-05-01/ch1** — buildExpression ordering item; belongs to the
buildExpression workstream, revisit with the esn-compute batch.

Session grand total: 63 steps, 17 generators. Tests 1,954 → 2,036. This session ran well past
the 10–30 rhythm because the final batch was interrupted and recovered rather than planned;
do not treat 63 as the new normal.

## Next by leverage
1. esn-compute-* buildExpression slice (12 steps, same course as served esn-* work);
   pick up co-05-01/ch1 while the buildExpression gate branch is warm.
2. Coordinate-entry builder → pointEntry (21) + plotPoint (13).
3. G13 (5.8%): survey its unserved tags with g12.mts 13 before choosing.

## Continuation 5: esn-compute buildExpression slice — +8 steps → 770 / 4,471 (17.22%)

- `sci-compute` (default multiply / divide / addSame / addShift) → esn-compute-muldiv (4),
  esn-compute-addsub (4). FOUR DISTINCT PROCEDURES, not difficulty settings: multiply
  (renormalize UP), divide (renormalize DOWN), add/subtract at a shared exponent (the exponent
  must NOT move), and add/subtract across different exponents (match to the bigger first). The
  bank always carries the un-renormalized coefficient and the off-by-one power — the two
  misconceptions every authored item traps.

  **Independent route works in PLAIN DECIMAL**: expand both operands to ordinary numbers, apply
  the printed operator, then find standard form by shifting the decimal point one place at a time.
  It never adds, subtracts or compares an exponent — a genuinely different derivation. Passed the
  400-seed sweep on the first run.

  Two READING catches (the gate passed both times; only printing found them):
  1. The divide form drew 3\u00f75 \u2192 backward trap 5\u00f73 = 1.666\u2026 printed as "1.67" —
     an INVENTED rounding convention (rule 6). Now both the quotient and the backward-division
     trap must be exact 1-decimal quantities.
  2. My own guard excluded products that are multiples of ten — which deleted (8\u00d710\u2077)\u00d7(5\u00d710\u00b3)
     = 40\u00d710\u00b9\u2070, an AUTHORED item. A guard that rejects the content it is meant to
     reproduce is a bug, not caution. Replaced with a plain 10 \u2264 prod < 100 range.

**REJECTED: co-05-01/ch1** (the deferred buildExpression). "Order circle, ellipse, parabola,
hyperbola by increasing eccentricity" has exactly ONE correct sequence over exactly four objects
— iSquared-class, like co-05-01/k1. Generating subsets or reversing the direction would invent
question forms the course never poses. Both co-05-01 holds are now permanent, not deferred.

Session grand total: 71 steps, 18 generators. Tests 1,954 \u2192 2,042.

## G13 SURVEY (5.8%, 85 unserved tags, 294 steps) — done, not yet worked
G13 is calculus and it is DENSE and homogeneous: `ca-*` (applications of derivatives) alone is
~13 tags \u00d7 4 steps, nearly all numeric/mcq pairs — critical points, first/second-derivative
tests, EVT, Rolle, MVT, end behaviour, optimisation. `in-constant-of-integration` (5u) spans two
lessons. This is the best remaining grind after the coordinate builder: one generator per tag,
but the tags are neighbours sharing machinery (differentiate a polynomial, solve f\u2032 = 0),
so a shared polynomial-derivative helper would serve many of them.
Watch for: `ca-first-derivative-test` uses a signChart widget and `ca-three-charts` /
`ca-read-f-prime` use matchPairs — those need their own gate branches, not the numeric one.

## COORDINATE-ENTRY BUILDER — authored items READ, ready to write
`pointEntry` (21u) and `plotPoint` (13u) are two surfaces of one skill and one builder plausibly
serves both, as the handover predicted. What the reading shows:
- `coord-read` (cg-01-01, pointEntry): "which ordered pair names the point 5 right and 2 up?"
  \u2192 [5,2], traps [2,5] (swapped) and [5,5] (doubled first). Origin item is a single fact.
- `les-back-substitute` (les-04-02, pointEntry): solve a 2\u00d72 system, answer (x, y). Traps are
  [x,x], [y,x] (swapped) and [x, sum]. Richest of the group; needs a system generator whose
  solution is integral.
- `coord-plot` / `cn-complex-plane` / `pr-plot-line` (plotPoint): the answer lives in a
  DIFFERENT field from pointEntry's `answer` array (dumper printed `undefined`) — confirm the
  plotPoint schema shape before writing, and note cg-01-02/k2 plots TWO points at once.
So: one generator, two surfaces, but the surface gate needs a plotPoint branch. Read
`PlotPointSpec` in schema.ts first.

## Next by leverage
1. Coordinate-entry builder \u2192 pointEntry + plotPoint (34 steps across both).
2. G13 `ca-*` with a shared polynomial-derivative helper (~52 steps in reach).
3. buildExpression remains the largest engine (178u after this batch).

## Continuation 6: coordinate-entry builder — +7 steps \u2192 777 / 4,471 (17.38%)

The handover's prediction held: ONE generator serves BOTH surfaces. `coordinate-plot` emits a
pointEntry for "name the pair" and a plotPoint for "plot it" — same skill, same misconception
(the ordered pair is ORDERED), two engines.

- `coordinate-plot` (default name / plot / segment) \u2192 coord-read k2 (1), coord-plot (2).
  Draws x \u2260 y everywhere: on a swap-diagnosing item a point with x = y makes the swap
  invisible and it would grade CORRECT.
- `proportional-plot` \u2192 pr-plot-line (4). Points on y = kx with connectTargets, grid growing
  6\u21928 exactly as the authored items do.

**TWO NEW GATE BRANCHES** (neither surface had one; without them both fall through to the numeric
branch). pointEntry: trap arity, tuple distinctness, no trap on the answer. plotPoint asks the
set-shaped questions, and the one that matters most \u2014 every diagnosable wrong cell must be ON
the grid, or the learner can never click it and the diagnosis is dead text. Also asserts a partial
selection does not grade correct, and label arrays match the grid.

FOUR catches this batch, two by the gate and two by reading:
1. GATE: `successFeedback` "That is (5, 4) exactly." = 23 chars, under the 25 floor.
2. GATE: `proportional-plot` reached only 4 distinct problems in 12 seeds. The fix was a new
   DIMENSION, not a wider k (widening k just pushes points off the grid): point COUNT and x STEP,
   both shapes the authored set already uses.
3. READ: "1 units up". Count agreement written out explicitly on a known fixed noun.
4. READ: "All both points line up" \u2014 two phrasings spliced into one broken sentence.
   And fixing (3) broke the independent route, whose regex hardcoded "units" \u2014 caught
   immediately by the gate, which is the dual-route design working as intended.

**REJECTED: cg-01-01/k1** ("which ordered pair names the origin?") \u2014 single fact, one problem
in existence. iSquared-class, like the two co-05-01 holds.

Session grand total: 78 steps, 20 generators, 2 new gate branches. Tests 1,954 \u2192 2,050.

## Where pointEntry / plotPoint stand now
pointEntry 20u remaining, plotPoint 7u. The next slice needs a DIFFERENT generator, not this one:
- `les-back-substitute` (3, G8): solve a 2\u00d72 system, answer (x, y). Traps [x,x], [y,x], [x,sum].
  Needs a system generator with an integral solution \u2014 `sys-two-linear` already exists and
  solves exactly this shape; check whether its answer can be re-shaped to a tuple rather than
  written fresh.
- `vec-transform` (3, G12), `tm-reflection` (2, G8): transformations \u2014 a matrix/reflection
  generator, genuinely new machinery.
- `cn-complex-plane` (2, G11): plot a+bi. Same grid, different labels \u2014 plausibly a form of
  `coordinate-plot`, but the axes are real/imaginary and the prompt names a complex number, so
  read cn-02-03 before assuming.

## Next by leverage
1. `les-back-substitute` via the existing `sys-two-linear` (cheapest \u2014 check reuse first).
2. G13 `ca-*` with a shared polynomial-derivative helper (~52 steps in reach; survey in
   Continuation 5 notes, including the signChart/matchPairs warning).
3. buildExpression remains the largest engine (178u).

## Session 7: back-substitute + the tm-* transformation family — +9 steps \u2192 786 / 4,471 (17.58%)

**The `sys-two-linear` reuse lead was CHECKED AND REJECTED.** Recording why, because the two look
interchangeable from a distance and the next person will re-propose it:
  - `sys-two-linear` prints `x + y = s` and `kx \u2212 y = d` \u2014 ELIMINATION-shaped, y never
    isolated. `les-back-substitute` prints `y = mx + c`, which IS the substitution method and the
    whole point of the lesson. Handing a learner the elimination form deletes the skill taught.
  - Its traps diagnose elimination errors (added the totals, subtracted them). These traps
    diagnose back-substitution errors. TRAPS TRANSFER is part of the alias bar; they do not.
  - The answer shape (tuple vs number) was the only part that was a mere re-shape.

- `back-substitute` (default / given) \u2192 les-back-substitute (3). Four traps, all authored:
  repeated x, swapped slots, the second equation's TOTAL mistaken for y, and the constant read
  with the wrong sign. Route solves by brute-force integer SEARCH against both printed equations \u2014
  nothing isolated or rearranged, since that is the procedure under test.
- `point-transform` (reflect / translate / rotate / dilate) \u2192 tm-translation (1),
  tm-reflection (2), tm-rotation (1), tm-dilation (2). One generator, the whole tm-* family.
  Every form draws |x| \u2260 |y| with both coordinates nonzero: on x = \u00b1y the swap trap
  collapses onto a sign trap, and on a zero coordinate a sign flip is invisible \u2014 the learner
  would be marked wrong for correct work.
  Routes are GEOMETRIC, not rule-application: reflection searches for the point at equal distance
  on the opposite side of the axis; rotation searches for the integer point with the same radius,
  a zero dot product, and the correct cross-product sign; translation steps one unit at a time.

READING catch: authored items render negatives with the typographic minus (\u2212), string
interpolation gives the ASCII hyphen, so generated prompts sat visually apart from the authored
ones in the same lesson. Fixed with a shared `sn()` renderer; the routes' regexes were widened to
parse both, and the gate confirmed it immediately.

TOOLING: both patch scripts aborted on a failed assert, discarding every edit in the script \u2014
the documented gotcha, hit live. The fix that works: collect all targets, verify every one is
present, and only then write.

## THE PROSE GATE (`src/lib/variants.prose.test.ts`) \u2014 new, and the most valuable thing here

The variant gate proves a problem is mathematically sound. It says nothing about whether the words
make sense. Human reading was the least reliable link in the chain and the only thing protecting
the learner from nonsense. This file mechanises the part that can be mechanised and sweeps every
generator \u00d7 form \u00d7 band \u00d7 50 seeds \u2014 which no human ever will. 476 cases.

Nine rules, each earning its place by catching a REAL defect: plural counting noun after 1, wrong
ordinal suffix, digit-plus-ths fraction name, doubled quantifier, repeated word, float artifact,
truncated repeating decimal, unfilled template slot, punctuation damage.

**It found NINE live defects in already-shipped generators** \u2014 "1 wholes" (mixed-convert),
"7 tens 1 ones" (base-ten-build), "1 hundredths" (decimal-align-addsub), "1 tens is fewer"
(place-compare), "blue 1 times" (probability-fraction), "takes 1 pieces" (fraction-meaning),
"1 degrees" (negative-intro), "Group of 1 dots" (compare-numerals). All fixed via a shared `NOUN`
table storing BOTH forms; nothing derives morphology by stripping an "s".

Two design rules, both learned by writing it badly first:
  1. A rule earns its place by catching a real defect. A "dangling function word" rule produced
     five false positives and zero true ones; a "3+ decimal places means invented rounding" rule
     flagged 196 legitimate values, nearly all scientific notation doing its job. Both DELETED
     rather than tuned.
  2. Prefer a POSITIVE list to a negative one. Flagging "1 <word>s" only when the word is a known
     counting noun cannot false-positive. The cost is a missed noun \u2014 a defect that survives.
     The cost of the other design is a good generator rejected, and a linter that cries wolf gets
     switched off, and then it protects nobody.

Session grand total: 87 steps, 22 generators, 3 new gate branches, 1 new gate FILE.
Tests 1,954 \u2192 2,536.

## Next by leverage
1. G13 `ca-*` (applications of derivatives, ~52 steps in reach). Build a shared
   polynomial-derivative helper once. WARNING: `ca-first-derivative-test` uses signChart and
   `ca-three-charts` / `ca-read-f-prime` use matchPairs \u2014 those need their own gate branches.
2. `vec-transform` (3) + `vec-displacement` (1) + `vec-compose` (1) \u2014 the vector family,
   same pointEntry surface, plausibly one generator.
3. buildExpression, still the largest engine (~170u).
Remaining pointEntry singletons (coord-read, fna-inverse-verify, ft-inverse-graph, pp-*) are one
step per tag \u2014 matchPairs-grade leverage. Skip until the families are done.

## Session 8: the vec-* family (displacement, matrix apply, reflection composition) — +11 steps → 797 / 4,471 (17.83%)

Richer than the pointEntry singletons this queue item was filed under: 12 authored steps across
three tags, mixing pointEntry, mcq, AND numeric widgets. Read every item first, as always.

- `vec-displacement` (default / equalVector / magnitude) → vec-01-03, 3 of 4 steps.
  **REJECTED k3** ("the displacement from a point to itself") — single fact, always ⟨0,0⟩,
  iSquared-class.
- `matrix-apply` (default / swap / basisColumn / componentOnly) → vec-05-01, all 4 steps.
  **Design catch found by READING, not the gate**: k1 and k3 both drill matrix-apply, but my
  first draft coin-flipped between reflect-X and coordinate-swap INSIDE one "default" form — so a
  refresh could hand k1 and k3 the SAME matrix flavor, diluting the two steps' deliberately
  distinct pedagogical intent (the lesson teaches two different matrices on purpose). Split into
  explicit `default` (reflectX) and `swap` forms before declaring, so each authored step reliably
  drills its own concept forever. This is a new category worth naming: a design smell the gate
  cannot see because both branches are individually correct — only reading the STEP-LEVEL intent
  catches it.
- `reflect-compose` (default / basisColumn / reverseOrder / matMul) → vec-05-03, all 4 steps.
  Two reflections 45° apart always compose to a 90° rotation, 90° apart to 180° — six genuinely
  different compositions across three outcomes. `reverseOrder` states the general fact that
  reversing two reflections reverses the turn (AB and BA are inverses when A, B are involutions).

### Gate catches this batch — ten failures, all real, all fixed (typical rate, not a warning sign)
1. Trap-distinctness collisions found by GUARDS that were checking only PART of the trap set:
   `matrix-apply@componentOnly` (x vs m·y), `@basisColumn` (needed BOTH b≠d and c≠d, only had one),
   `vec-displacement` default (guarded dx/dy properties but not the full three-tuple including
   P and Q — collided exactly when P sat at the origin).
2. **A genuine GEOMETRIC collision**, the most interesting catch of the session:
   `reflect-compose@basisColumn`'s "only the first reflection" trap equals the full two-reflection
   answer whenever the first reflection's column vector happens to lie ON the second reflection's
   own mirror line — a reflection fixes every point already on its axis. Every canonical R[i]
   column points along the x- or y-axis, so the exact collision condition is: an x-axis-aligned
   column reflected over the x-axis, or a y-axis-aligned column reflected over the y-axis. Fixed
   with a guard computed from the actual geometry, not a blanket exclusion.
3. **A logical, not just numeric, defect**: `reverseOrder`'s framing — "reversing gives the
   OPPOSITE turn" — is FALSE for the one pairing (45°+90°=135°... specifically |i−j|=2) that
   composes to a 180° rotation, since a half-turn is its own inverse. Restricted this form to the
   two pairings where "opposite" is actually true, rather than special-casing false wording.
4. Two independent-ROUTE bugs (not generator bugs): `matrix-apply`'s route regex only matched the
   ASCII hyphen while the reflectX prompt's fixed matrix constant literally uses the typographic
   minus (−1) — the route threw on `null.slice()` before reaching any real assertion.
   `equalVector`'s label regex captured the point-LETTER as a numeric group, shifting every
   value one slot right (`Number("D")` → NaN). Both are reminders that the route is code too and
   needs the same scrutiny as the generator.
5. A `-0` vs `0` strict-equality failure: JS's `0 * -1 === -0`, and vitest's `toEqual` treats it
   as distinct from the literal `0` built elsewhere. Normalized through a shared `nz()` helper.
6. Pedagogy-floor and dangling-phrase misses caught by the gate directly (short fallback, etc.)
   — routine, not detailed here.

READING pass after all ten fixes: printed all ten forms, all three widget types. No further
defects — the one thing noted and left alone: `vec-displacement@magnitude` can occasionally offer
a NEGATIVE numeric distractor (the "added signed components" trap), which reads slightly odd for
a distance question but is a real, feedback-true misconception; not a collision, not guarded away
per the "don't restrict on vibes" rule.

Session grand total: 98 steps, 25 generators, 5 new gate branches (2 widget types this batch: none
new actually — pointEntry/mcq/numeric all had branches already), tests 1,954 → 2,564.

## Next by leverage
1. G13 `ca-*` (applications of derivatives, ~52 steps in reach) — still the biggest lever waiting.
2. Remaining pointEntry/plotPoint singletons (coord-read, fna-inverse-verify, ft-inverse-graph,
   cn-complex-plane, pr-unit-rate-point, bv-scatter-plot, pp-*) — one step per tag each, matchPairs-
   grade leverage. Skip until a genuine family emerges.
3. buildExpression, still the largest engine.

## Session 9: G13 calculus — critical points, EVT, second-derivative test — +8 steps → 805 / 4,471 (18.00%), G13 5.8% → 8.3%

First calculus-proper batch, and the first time this workstream needed NUMERICAL independent
routes (finite differences, integer root search) rather than a different algebraic path — pure
symbolic re-derivation isn't always available once the generator's own method IS the calculus.

**One shared instance family, three tags.** Reading `ca-critical-point`, `ca-evt`, and
`ca-second-derivative-test` together showed they all draw from x³ − 3k²x (critical points at
x = ±k) — different lessons asking different questions about the SAME underlying object. Built
once, reused three times:

- `critical-count` (default / quartic / oddPowerSaddle) → ca-critical-point, 3 of 4 steps.
  `quartic` generalizes ch1's distinct-root nuance (x⁴ − 4mx³, a doubled root at 0 plus a simple
  root at 3m). `oddPowerSaddle` generalizes k3's x³-at-the-origin example to any odd n ≥ 3 — f′
  = nx^(n−1) has an EVEN exponent, so f′ ≥ 0 both sides and the point is neither max nor min.
- `evt-candidates` (default / candidateCount / minValue) → ca-evt, 3 of 4 steps. On [0, 2k], the
  positive critical point sits inside while its mirror falls outside — verified algebraically
  that f(0)=0 always sits strictly between the global max f(2k)=2k³ and global min f(k)=−2k³ for
  every k, so the ordering never flips regardless of which k is drawn.
- `second-deriv-eval` (default / localMax) → ca-second-derivative-test, 2 of 4 steps. `localMax`
  is a genuinely different skill found while reading ch1: x³ − 3px² + d has critical points at
  x = 0 and x = 2p, and f″(0) = −6p < 0 makes x = 0 a maximum whose VALUE is simply the constant
  term d — full find-classify-evaluate in one step, not handed the critical point the way k1 is.

**Four rejections**, all single conceptual facts anchored to one canonical counterexample with no
numeric dimension to draw from: ca-01-01/k2 (why the critical-point definition includes "f′
undefined"), ca-01-03/k2 (why f(x)=x has no max on an open interval), ca-02-02/k2 (f′=f″=0 proven
inconclusive by three fixed counterexamples that between them must cover every outcome),
ca-02-02/k3 (naming the alternative test for a non-differentiable corner).

### Gate catches — nine failures, two of them worth remembering
1. **A repeated root is invisible to sign-change scanning.** `critical-count@quartic`'s original
   route walked a fine grid looking for f′ changing SIGN — but x⁴ − Cx³'s derivative is
   x²(4x − 3C), and x² never changes sign, so the derivative TOUCHES zero at the double root
   without CROSSING it. The scan silently missed it. Fixed by replacing sign-change detection with
   the exact power-rule derivative evaluated by SEARCH over candidate integers — still a
   genuinely different method (search vs. the generator's factor-and-solve), and immune to the
   crossing/touching distinction entirely.
2. **A regex anchored to the wrong `x`.** `oddPowerSaddle`'s capture group `x(.+?) has a critical
   point` could start matching from the EARLIER `x` inside `f(x) = `, swallowing `) = x³` as the
   "exponent" before the lookup table failed silently and produced NaN downstream. Anchoring the
   capture to the three valid superscript characters removed the ambiguity.
3. Two `k = 1` trap collisions: `second-deriv-eval`'s "coefficient alone" trap (6) equals the
   answer (6k) exactly at k=1; `evt-candidates`' "endpoint x-value" trap (M=2k) equals the max
   answer (2k³) exactly at k=1 (2·1 = 2·1³). Both fixed by starting k at 2, which also cured a
   freshness failure by widening the seed space.
4. Freshness: `quartic`'s core-band parameter range was too narrow (only 3 values) — widened.

READING caught what the gate structurally cannot: `+ -4` in the localMax prompt when the constant
term is negative — an ugly double-sign the trap-distinctness and pedagogy-floor checks have no
opinion about. Fixed with the same signed-display pattern used throughout this file; re-verified
the fix didn't silently break the independent route's regex (it required updating in lockstep,
per the standing rule that wording changes and their routes move together).

Session grand total: 106 steps, 28 generators. Tests 1,954 → 2,586.

## Next by leverage
1. More G13 `ca-*`: ca-rolle, ca-mvt, ca-mvt-consequences, ca-end-behaviour, ca-full-sketch,
   ca-optimisation-* — same course, same style, likely more shared-family reuse available (the
   x³−3k²x instance may extend further; read before assuming a new family is needed).
   WARNING (unchanged from the survey): ca-first-derivative-test uses signChart,
   ca-three-charts/ca-read-f-prime use matchPairs — new gate branches, not the numeric one.
2. buildExpression, still the largest engine.
3. dr-* (related rates / derivatives) tags appeared in the G13 survey alongside ca-* — worth a
   read; dr-second-derivative in particular may reuse machinery built this session.

## Session 10: Rolle's theorem, MVT, MVT-consequences — +9 steps → 814 / 4,471 (18.21%), G13 8.3% → 11.2%

Three new tags, nine of twelve authored steps — the richest single-session yield in the calculus
push so far, and the first time a batch needed comprehensive pairwise trap guards from the start
rather than hand-derived ones added after a failure.

- `rolle-c` (default / cubicRepeated / maxRoots) \u2192 ca-rolle, 3 of 4. `cubicRepeated`
  generalizes ch1's doubled-root-at-0 cubic; `maxRoots` generalizes k3's abstract "N zeros of f\u2032
  \u2192 N+1 roots of f" counting argument to any N \u2265 2 (N=1 excluded: it collapses the
  "mistook f\u2032 zeros for f roots" trap onto the constant "1" distractor).
  **REJECTED k2** (f(x)=|x|\u22121, "which hypothesis fails?") \u2014 single canonical corner
  counterexample, purely qualitative.
- `mvt-c` (default / speedTrap / twoValueMVT / cubicDecimal) \u2192 ca-mvt, ALL 4 steps.
  `default`'s c is always the midpoint of [a,b] (f\u2032(c)=2c must equal the average rate a+b).
  `cubicDecimal` generalizes ch1's irrational c=b/\u221a3 to any b, rounded to three decimals.
- `mvt-bound` (default / smallest) \u2192 ca-mvt-consequences, 2 of 4.
  **REJECTED k1** (f\u2032=0 everywhere \u21d2 f constant) and **k3** (why F+C) \u2014 both pure
  theorem statements: the conclusion is the identical sentence regardless of any drawn number.

### Gate catches \u2014 the discipline that finally stuck
Ten failures total, but the pattern that mattered: `mvt-bound` needed FIVE separate rounds of
fixes because I kept hand-deriving individual collision conditions (f0=0 collapses a trap onto
the answer; f0=\u2212W collapses two traps together; lo\u00b7(1\u2212W)=f0 collapses a third) and
missing the NEXT one each time. The fix that actually worked, on the third attempt: stop
hand-deriving algebraic identities one at a time and instead compute every value the widget will
ever display \u2014 the answer and all three traps \u2014 into one array and require
`new Set(vals).size === vals.length`. This is now the default approach for any generator with
3+ interacting trap values, not a last resort.

Other catches: a `twoValueMVT` route bug where a loop that was supposed to divide by W instead
multiplied by it (`rate += (f1-f0)/W` run W times \u2014 replaced with a plain division, since
recovering a ratio from two endpoint values isn't the kind of shortcut the "different method" rule
is protecting against); a `cubicDecimal` independent route whose 0.0005 grid step didn't reliably
resolve to 3-decimal precision (replaced with bisection, which converges to machine precision
regardless of grid choice); a feedback string opening with "Not necessarily" that tripped the
NEGATION ban (copied the phrasing straight from authored content without checking it against the
rule that applies to GENERATED strings); and the now-familiar freshness-floor widenings.

READING caught one thing the gate never would: `(13 \u2212 -5)/3` \u2014 a double-sign when a
subtracted value is negative. Fixed by parenthesizing only when the value is actually negative
(`f0 < 0 ? \`(${f0})\` : f0`), so positive cases stay clean rather than gaining decorative parens.

Session grand total: 115 steps, 31 generators. Tests 1,954 \u2192 2,610.

## Next by leverage
1. More G13 `ca-*`: ca-end-behaviour, ca-full-sketch, ca-optimisation-* (setup/box/applied).
   `ca-optimisation-setup` uses dragOrder \u2014 needs its own gate branch, already exists from
   an earlier session, confirm before assuming new machinery is needed.
2. `dr-*` (related rates) \u2014 still unread this session, flagged twice now.
3. buildExpression, still the largest engine.

## Session 11: end-behaviour, full-sketch, optimisation setup/box — +15 steps -> 829 / 4,471 (18.54%), G13 11.2% -> 16.0%

Four new tags across two halves. The first half (end-behavior, full-sketch) was clean by session-10
standards -- only two gate failures total, one of which caught a genuine mathematical bug rather
than a trap collision. The second half (opt-setup, opt-box) found the session's most consequential
bug, and it was invisible to every automated gate.

### end-behavior (default / poleClassify / polyLimit / vertAsymCount) -> ca-end-behaviour, all 4 steps
Default and poleClassify SHARE one rational instance (ax+b)/(x-k): default asks the horizontal
asymptote, poleClassify asks what happens at the pole. polyLimit generalizes k3's leading-term
argument across BOTH degree parity and leading sign -- four genuinely different outcomes, not one
relabeled fact, verified by hand against all four (even+pos, even+neg, odd+pos, odd+neg) cases.

GATE CATCH (real math bug): the hole-exclusion guard checked `b !== a*k` when the actual condition
for a hole (numerator vanishing at the pole) is `b !== -a*k` -- a plain sign error. It let one real
hole through, misclassified by the widget as "a vertical asymptote." The gate caught it because a
hole and an asymptote are different multiple-choice answers, not because anyone noticed the algebra.
READING CATCH: a feedback string opening with "Not strictly inside..." tripped the NEGATION ban --
same class of mistake as session 10 (copying authored phrasing verbatim into GENERATED text without
checking it against a rule that only applies to generated strings).

### full-sketch (default / fallingSteepening / logicalContradiction / directionChanges) -> ca-full-sketch, all 4
Default's inflection point is the elegant fact that for x^3 - 3px^2 + d, the inflection sits at the
literal MIDPOINT of the two critical points (0 and 2p) -- independent of d entirely. logicalContradiction
generalizes k3's PURELY abstract argument (an interior extremum needs f' to change sign) across any
interval and interior point, since the numbers there are placeholders for the logic, not load-bearing
mathematics -- a genuine refresh despite looking "conceptual."
READING CATCH: d=0 rendered as a bare "+ 0" in the prompt -- real prose never writes a null constant
term. Excluded d=0 from the draw; costs nothing since the inflection x-value never depends on d.

### opt-setup (default / domainBound / maxProduct) -> ca-optimisation-setup, 3 of 4 steps
REJECTED k3 (dragOrder: state formula -> constraint -> domain -> differentiate) -- a fixed general
METHODOLOGY, not a fact about any particular problem. The four steps are the same four steps
regardless of which optimization problem prompted them.
GATE CATCH: N=2*half collided exactly with maxP=half^2 at half=2 (2*2=4=2^2) -- fixed by starting
the range at half=3.

### opt-box (default / maxVolume / uselessRoot / beatEndpoint) -> ca-optimisation-box, all 4 steps
The authored instance (sheet=12, m=2) generalizes perfectly to sheet=6m: V(x)=4x(3m-x)^2,
V'=12(x-m)(x-3m), max volume 16m^3 -- verified by hand before writing a line of generator code.

**THE CONSEQUENTIAL CATCH: a real arithmetic error, found only by reading the printed output, not
by any gate.** A trap's feedback claimed "the base area (12 - 4)^2 = 16" -- but the true base at
that cut size is 12 - 2(2) = 8, so 8^2 = 64, not 16. The bug: I wrote `baseArea = (threeM - m)^2`
when the correct base-width formula is `2*(threeM - m)^2` (threeM - m = 2m is HALF the actual base
width, not the base width itself). Every gate passed with this bug in place, because the WRONG
number (16) still differed from every other trap and from the answer -- distinctness doesn't imply
correctness. This is the sharpest reminder yet that gates verify structure (traps are distinct,
routes agree, feedback fires) and reading verifies TRUTH (the numbers in the feedback are honest).
Fixing the value then REVEALED a fresh trap collision at m=1 (baseArea=16 exactly equals
maxVol=16 when m=1, since 16m^2=16m^3 only at m=1) -- excluded m=1 from the draw.

Two off-by-one destructuring bugs in independent routes, same root cause both times:
`match(...).map(Number)` converts the FULL MATCH STRING (array index 0) to NaN before any capture
group is read, silently shifting every destructured value one slot. `opt-box@uselessRoot`'s route
computed threeM as NaN this way; `opt-box@beatEndpoint`'s route read the cut size where it meant to
read the volume. Both fixed by slicing away index 0 BEFORE mapping to Number, not after. Worth
watching for as a recurring pattern -- this is the second time in the calculus workstream a route
bug came from array-index bookkeeping rather than the mathematics itself.

Also: `opt-box@maxVolume`'s original prompt ("Find the maximum volume of the box, in cubic inches.")
carried NO printed parameter at all -- it depended on shared lesson context (the sheet size stated
in a DIFFERENT declared step) that a freshly-generated instance of THIS step alone would never
show. Rewrote the prompt to state the sheet size explicitly, making the generated item genuinely
self-contained rather than silently dependent on a sibling step's wording.

Session grand total: 130 steps, 35 generators. Tests 1,954 -> 2,648. All seven gates green.
Zero authored-prose changes; one rejection recorded (ca-05-01/k3, dragOrder, fixed methodology).

## Next by leverage
1. Remaining G13: in-constant-of-integration (5u), ca-first-derivative-test (signChart --
   needs its own gate branch), ca-three-charts / ca-read-f-prime (matchPairs -- also need branches).
2. dr-* (related rates) -- flagged three times now across three sessions, still unread. Read it
   next session before anything else; deferring a read this many times is itself a signal.
3. buildExpression, still the largest engine overall.

## Session 12: dr-* (derivative rules) — the deferred read, finally done — +7 steps -> 836 / 4,471 (18.70%), G13 16.0% -> 18.3%

Read dr-* FIRST this session, ahead of the remaining ca-* stragglers, after three consecutive
deferrals. The deferral was not justified: both tags read here were richly generatable and needed
NO new gate branches (pure numeric/mcq). Three sessions of "I'll get to it" cost nothing
structural, but the queue-discipline lesson stands — an item that keeps losing is worth reading
precisely BECAUSE it keeps losing, since the reason is usually unfamiliarity rather than difficulty.

- `trig-deriv` (default amplitude / chain / product) -> dr-trig-derivative, 3 of 4 steps.
  Default varies the AMPLITUDE (A sin x has slope A at the origin). `product` generalizes ch1's
  x·sin x to (x + c)·sin x, whose derivative at 0 is exactly c — the authored c = 0 case yields
  the answer 0 for every draw and could not be refreshed on its own terms.
  REJECTED k2 ("why does (cos x)′ carry a minus sign?") — one fixed geometric argument, with the
  three distractors being the three ways to misread that same argument.
- `inverse-deriv` (default cube / knownValues / arctan / polyInverse) -> dr-inverse-derivative,
  ALL 4 steps. The independent route here is the strongest in the workstream so far: it builds
  the INVERSE FUNCTION numerically (bisection on the printed f, or Math.cbrt for the pure cube)
  and central-differences THAT — never touching the 1/f′(a) reciprocal rule the item teaches.
  The route differentiates the inverse directly, which is precisely what the rule is a shortcut
  for; agreement between the two is therefore a real check on the rule's application, not a
  restatement of it.

### Catches
GATE: `a = 3` collapses inverse-deriv's default form, because a³ = 3a² EXACTLY at a = 3 — output
and derivative are both 27, so the "reciprocal of the output" trap becomes the answer. Fixed with
the full pairwise distinctness guard (session-10 lesson), and critically with a >tolerance
comparison rather than !==: the widget grades within ±0.0005, so two values differing by less than
that are the SAME answer as far as the learner is concerned even though they differ numerically.

PROSE GATE: fired on "Find the a with f(a) = 39" — the doubled-article rule. This is a genuine
FALSE POSITIVE ("a" is a variable name, and the authored item uses the identical phrasing); the
rule already documents an exception for the hyphenated form ("the a-value") but not the bare one.
Chose to reword MY string ("the input a") rather than loosen a rule guarding 180+ generators —
the reworded version is clearer anyway, and the alternative risks admitting real doubled articles
elsewhere in the corpus to fix one cosmetic complaint here.

FRESHNESS, a genuinely constrained pool: arctan needs 1 + a² to be of the form 2^i·5^j for the
answer to terminate, and among positive integers ONLY a ∈ {1,2,3,7} qualifies — widening the axis
finds nothing at all. The new DIMENSION is the sign of the input: arctan is odd, so its derivative
1/(1+a²) is EVEN and every negative input reuses an already-verified denominator. Eight draws
instead of four, and the "height" distractor flips sign correctly on its own since
arctan(−a) = −arctan(a). Textbook case of the handover's "new dimension, not wider axis" rule.

READING: "x³ + 1x + 7" — a unit coefficient must not be printed. Fixing the DISPLAY then broke the
independent route, whose regex hardcoded `(\d+)` where the coefficient may now be empty; both
were edited in the same commit, per the standing rule that a wording change and its route move
together. This coupling has now bitten in four separate sessions and is working exactly as
intended each time — the route failing loudly is the signal that the prompt changed.

Session grand total: 137 steps, 37 generators. Tests 1,954 -> 2,666. All seven gates green.

## Next by leverage
1. Remaining dr-*: dr-second-derivative, dr-implicit-practice (both numeric/mcq, no new gate
   branches needed — the cheap continuation of this session), then dr-constant-sum (dragBucket)
   and dr-choose-rule (matchPairs), which DO need branch work.
2. Remaining G13 ca-*: in-constant-of-integration (5u), ca-first-derivative-test (signChart),
   ca-three-charts / ca-read-f-prime (matchPairs).
3. buildExpression, still the largest engine overall.

## Session 13: dr-* continued — second derivatives and implicit differentiation — +7 steps -> 843 / 4,471 (18.85%), G13 18.3% -> 20.5%

The cheap continuation the last session flagged, and it was indeed cheap: both tags were pure
numeric/mcq, no new gate branches, and the variant gate passed on the FIRST run with zero
failures — the first time that has happened in the calculus workstream. Every catch this session
came from reading, which is a meaningful shift in where the remaining risk lives.

- `second-deriv-poly` (default / motion / classify / third) -> dr-second-derivative, ALL 4 steps.
  Both MCQ forms genuinely vary rather than dressing up a fixed answer: `motion` draws all four
  (velocity sign x acceleration sign) combinations, so the correct label moves between four
  different options; `classify` flips between minimum and maximum on the sign of the leading
  coefficient. An MCQ whose correct option is always in the same conceptual slot is barely
  refreshed at all — these are not that.
- `implicit-diff` (default / hyperbola / quadForm) -> dr-implicit-practice, 3 of 4 steps.
  Default exploits an elegant closed form: the tangent to x² + y² = r² at (p, q) crosses the
  y-axis at exactly r²/q, since q + p²/q = (q² + p²)/q. Its independent route is VECTOR GEOMETRY —
  the tangent runs perpendicular to the radius, so its direction is (−q, p); walk that until x
  reaches 0. `quadForm` solves the ellipse for its explicit branch and central-differences that,
  never differentiating implicitly.
  REJECTED k1 ("why does dy/dx = −x/y depend on y as well as x?") — one fixed argument about the
  two branches above each x. Same shape as ca-03-01/k2 and co-05-01/k1, both already rejected.

### Catches — all four from READING, none from the gate
1. **Feedback that was not literally true of the value it fires on (rule 5).** The quadForm trap
   at −p/q inherited the authored wording "it needs the PRODUCT rule, two pieces not one." I
   checked numerically what actually produces −p/q and it is DROPPING the xy term entirely
   (−2p/2q = −0.5 on the authored case); the two genuine product-rule slips give −1.0 and −0.4.
   Rewrote the feedback to name the error it actually diagnoses. Worth noting the trap: inheriting
   authored feedback wholesale FEELS safe and conservative, but authored prose was written for one
   fixed instance and may describe the misconception loosely; a generator must state what is true
   of its own drawn numbers.
2. **ASCII hyphens throughout interpolated feedback AND prompts** where the authored items use the
   typographic minus (−). Third session this has surfaced; the fix is always the same shared
   `sn()` renderer. Then, predictably, it broke both MCQ routes whose regexes matched `-?\d+` —
   fixed in the same commit, per the standing rule.
3. **An unreduced printed slope**: the (9, 12, 15) triple showed "−9/12" where lowest terms is
   −3/4. Mathematically correct, but no textbook prints it that way.
4. A recursive arrow function referencing itself in its own initialiser (`const g = (...)=>g(...)`)
   — a TS block-scoped-declaration error, caught by typecheck rather than any gate.

Session grand total: 144 steps, 39 generators. Tests 1,954 -> 2,684. All seven gates green.

## Next by leverage
1. `dr-constant-sum` (dragBucket) and `dr-choose-rule` (matchPairs) — the last two dr-* tags, and
   the first this workstream needs to CONFIRM have gate branches before starting. Both engines
   have branches per the handover; verify before assuming.
2. Remaining G13: `in-constant-of-integration` (5u), `ca-first-derivative-test` (signChart),
   `ca-three-charts` / `ca-read-f-prime` (matchPairs).
3. buildExpression, still the largest engine overall.

## Session 14: dr-* COMPLETE — dragBucket and matchPairs — +8 steps -> 851 / 4,471 (19.03%), G13 20.5% -> 23.1%

**Every dr-* tag is now served; the measurement tool reports zero remaining.** These were the two
tags flagged as needing engine work, and the state file's instruction to CONFIRM the gate branches
before starting paid off immediately — both branches and the dragBucket builder already existed,
so no new machinery was needed at all. Verifying beat assuming in both directions.

- `const-sum-rule` (default / whyConstant / legalMoves / horizontalTangent) -> dr-constant-sum, 4.
  `legalMoves` draws four rules from a bank of EIGHT (four legal, four not), two from each half —
  which satisfies the dragBucket gate's every-bucket-non-empty rule by construction rather than by
  luck, and means the learner sees a different four each time instead of memorising one set.
- `choose-rule` (default / expandProduct / cancelFirst / cubicProduct) -> dr-choose-rule, 4.
  `cancelFirst` generalizes x(x+2)/x, whose whole point is that cancelling FIRST turns a quotient
  into a line. The authored instance always answers 1; scaling the inner factor to ax + b makes
  the answer a, which actually varies.

### The catch worth keeping: matchPairs columns must not ALIGN
The gate rejected the first draft with "columns are aligned — positional matching would score
without reading". With w1→y1, w2→y2, w3→y3 the two columns sit in matching order, so a learner
can pair row-to-row and score full marks having read nothing. This is the exact analogue of the
dragBucket empty-bucket hazard, and I had not considered it. Fixed by ROTATING the right column
by 1 or 2 — a derangement on three items, so no position can align, while the pairing stays
correct because pairs are keyed by id rather than index. Any future matchPairs generator needs
this; it is not optional polish.

### Other catches
- The dragBucket route must key by LABEL and split on a COMMA (the gate joins labels with "," and
  compares by label since ids are positional). Guessed ";;" and item-ids first; the gate said so.
- "1x²" and "1x⁴" — unit coefficients printed in BOTH the prompt and the fallback. Second session
  running for this exact class (session 12 was polyInverse's "1x"). Fixing the prompt then broke
  the route's `(\d+)` capture, fixed in the same edit as always.
- The authored item writes the exaggerated constant with a thousands separator ("7,000"); the
  generated one was emitting "37000". Matched the authored typography with toLocaleString.

Session grand total: 152 steps, 41 generators. Tests 1,954 -> 2,704. All seven gates green.

## Next by leverage
1. Remaining G13: `in-constant-of-integration` (5u — largest single remaining G13 tag),
   `ca-first-derivative-test` (signChart — CONFIRM that branch exists first, it is the one engine
   this workstream has never touched), `ca-three-charts` / `ca-read-f-prime` (matchPairs — branch
   confirmed working this session, and remember the column-alignment rule).
2. buildExpression, still the largest engine overall (~170 unserved).
3. Grades G3 (~9%), G6 (~12%), G8 (~11%) are now the weakest bands — G13 has gone from worst
   (5.8%) to mid-table (23.1%) across sessions 9-14. Worth a fresh centrality survey before
   assuming G13 is still the right target.

## Session 15: re-survey, then G10 circle theorems — +11 steps -> 862 / 4,471 (19.28%), G10 10.8% -> 12.8%

**Ran the fresh centrality survey the last session called for, and it changed the target.** G13
had gone from worst (5.8%) to 23.1% across sessions 9-14, so continuing there would have been
momentum rather than leverage. The survey put G10 at the bottom (10.8%) AND largest (563 steps),
with G3 (10.9%) beside it. Picked the `cr-*` circle-theorem family in G10: six tags, all
numeric/mcq, sharing one underlying object — the same shape that made the x³−3k²x calculus family
efficient.

- `arc-measure` (default / threeArcs / classify / ratio) -> cr-central-arcs, ALL 4 steps.
  Everything here is the 360° total seen from a different side. `classify` draws all THREE
  verdicts in turn (major / minor / semicircle), so the correct option genuinely moves rather
  than the measure changing under a fixed answer.
- `inscribed-angle` (default / arcFromAngle / sameArc / triangleArc) -> cr-inscribed, ALL 4.
  One theorem run in both directions and then applied.
- `thales-right-angle` (default / hypotenuse / radiusFromLegs) -> cr-thales, 3 of 4.
  **REJECTED k1** ("AB is a diameter, C is on the circle, angle ACB measures?") — the answer is
  90° for every circle, every diameter, every C. One fact, one problem, forever.

### Catches
ELEVEN gate failures, all one cause: feedback under the 25-character pedagogy floor. Terse
geometry statements ("2 × 35° = 70°." is 14 characters) trip it for exactly the reason the
handover documents for K-2 copy — the mathematics is short. Fixed by prepending real framing
("Going from angle back to arc DOUBLES: ..."), never by padding. Worth expecting on any
geometry or early-number batch: the floor is a prose requirement, and correct terse arithmetic
does not clear it.

READING caught the batch's only substantive defect: the ratio form's third trap was
(r/(p+q))·360, which is non-terminating for most ratios and rendered as 257.14285714285717 — a
value no learner could ever type, so its diagnosis was dead text. Replaced with the SECOND-largest
arc (q parts), which is always whole AND a realer slip: misreading which part of the ratio the
question wants, rather than performing an arithmetic mangling nobody actually performs. The gate
was happy with the float — distinctness does not imply typeability.

Session grand total: 163 steps, 44 generators. Tests 1,954 -> 2,732. All seven gates green.

## Next by leverage
1. **Continue `cr-*`**: cr-chord-arc, cr-chord-perp, cr-chord-dist (4 steps each, numeric/mcq,
   same course and same circle machinery — the cheapest continuation available).
2. **`cpr-*` in G10**: nine tags x 5 steps = 45 unserved (conditional probability and counting).
   Mostly numeric/mcq; cpr-independence-def/test and cpr-combination use dragBucket (branch
   confirmed working, session 14), cpr-permutation uses buildExpression.
3. **G3 (10.9%)** is now level with G10 and untouched by this workstream — worth a survey.

## Session 16: G3 multiplication foundations — +10 steps -> 872 / 4,471 (19.50%), G3 10.9% -> 13.9%

Surveyed G3 rather than taking the cheap `cr-*` continuation, and it was the right call: G3 holds
a `mult-*` family of 13+ tags x 5 steps, ALL pure mcq/numeric, and multiplication foundations are
remedial targets for many later tags. That is the largest homogeneous block of unserved steps
found so far in this workstream.

- `array-model` (default / rowsTotal / whichOperation / arrayMinus) -> arrays, ALL 5 steps.
  `arrayMinus` serves BOTH k4 and ch1 — same two-step shape (build the array, then take some
  away) at different sizes, and its three traps cover every authored distractor across the pair.
- `skip-count` (default / nthTerm / howManyNumbers / compareLanding) -> skip-counting, ALL 5.
  The distinction the lesson turns on is HOW MANY hops versus WHERE you land, and each form
  probes it from a different side; `compareLanding` serves both k4 and ch1.

### Catches — the prose gate earned its keep again
PROSE GATE: "3th"/"2th" — the exact ordinal-suffix bug the handover documents, from hardcoding
"th". Added a shared `ordinal()` helper covering 1st/2nd/3rd and the 11th/12th/13th exceptions
that BOTH naive `n + "th"` and a naive last-digit lookup get wrong. Ordinals are a numeric rule,
not morphology guessed from data, so deriving them is safe where deriving plurals is not — that
distinction is worth holding onto, because the next catch is its mirror image.

READING: "every berrie planted" — `slice(0, -1)` on "berries". This is precisely the "Every book
wants a shelve" failure the handover names, and the rule is absolute: store the singular in DATA.
Added `one` and `past` fields to the crop table rather than trimming characters. Notably the
prose gate did NOT catch this one (its rules cover "1 units"-style count disagreement, not
malformed singulars), so reading remains the only defence against this class.

READING: a count-difference trap went NEGATIVE when n2 < n1, producing a distractor of −1 on a
"how much bigger" question — a value no child would ever type, so the diagnosis was dead text.
Same category as session 15's un-typeable float, from the opposite direction. Absolute value keeps
the trap live and the misconception intact.

READING: "Leo hops 10 5 times" — two numerals adjacent, hard to read aloud, which matters more at
G3 than anywhere else in the corpus. Reworded to "hops 10 at a time, 5 times over".

Session grand total: 173 steps, 46 generators. Tests 1,954 -> 2,752. All seven gates green.

## Next by leverage
1. **Continue G3 `mult-*`** — the cheapest and largest block available: number-line,
   sharing-division, grouping-division, missing-factor, fact-families, identity-zero, times-5-10,
   times-9, unknown-letter, reasonableness, parity (5 steps each, all mcq/numeric).
   The division quartet (sharing / grouping / missing-factor / fact-families) is one concept seen
   four ways and should share machinery, like the cr-* circle family did.
2. `cr-chord-arc` / `cr-chord-perp` / `cr-chord-dist` in G10 (4 each, same circle machinery).
3. `cpr-*` in G10 — nine tags x 5 steps.

## Session 17: G3 division — sharing vs grouping — +10 steps -> 882 / 4,471 (19.73%), G3 13.9% -> 17.0%

Continued the `mult-*` block flagged last session. `sharing-division` and `grouping-division` are
the two MEANINGS of division and are structurally parallel — same five step shapes, mirrored
semantics — so they were built as a matched pair of generators rather than one with a mode axis:
the conceptTags are distinct and every distractor in one names the other explicitly, which is the
whole pedagogical point of the pair.

- `share-division` (default / eachShare / whichStory / keepThenShare) -> sharing-division, ALL 5.
  Sharing asks "how big is one fair share?" — the number of sharers is GIVEN, the share size
  unknown.
- `group-division` (default / howManyPieces / whichStory / sellThenPack) -> grouping-division,
  ALL 5. Grouping is the exact mirror: the group SIZE is given and the count is unknown.
- In both, the two-step form (`keepThenShare` / `sellThenPack`) serves BOTH k4 and ch1 — same
  take-some-out-then-divide shape at two sizes, with three traps covering every authored
  distractor across the pair.

Independent routes are REPEATED SUBTRACTION throughout — deal or cut one round at a time and
count the rounds. That is not merely a different method from `÷`; it is exactly how these two
lessons teach the operation, so the route mirrors the intended reasoning rather than a shortcut.

### Catches
Both gates passed on the FIRST run — second time that has happened (session 13 was the first),
and both times the batch was numeric/mcq with no new engine surface.

READING found the batch's only defect: "Mark the ribbon every 3 cm: 3, 6, 9, 12, 15, …." — the
ellipsis sits immediately before the sentence's own period and renders as FOUR dots. The parallel
string in `eachShare` escapes it only because an em-dash follows instead of a full stop. Reworded
to "and so on". A punctuation collision no gate rule covers, and invisible unless the string is
read as prose.

Session grand total: 183 steps, 48 generators. Tests 1,954 -> 2,772. All seven gates green.

## Next by leverage
1. **Finish the G3 division quartet**: `missing-factor` and `fact-families` (5 steps each) —
   these complete the concept and should reuse the share/group machinery directly.
2. **More G3 `mult-*`**: number-line, identity-zero, times-5-10, times-9, unknown-letter,
   reasonableness, parity (5 each, all mcq/numeric).
3. `cr-chord-arc` / `cr-chord-perp` / `cr-chord-dist` in G10; then `cpr-*` (nine tags x 5).

## Session 18: G3 division quartet COMPLETE — +10 steps -> 894 / 4,471 (20.00%), G3 17.0% -> 20.0%

**Total coverage crossed 20% for the first time** (699 at handover, 894 now — a 28% increase in
refreshed steps across eighteen sessions). G3 went from 10.9% to 20.0% in three sessions.

The division quartet is finished: sharing-division and grouping-division (session 17) plus
missing-factor and fact-families (this one) are one concept seen four ways, and each generator
names the others in its distractors — which is the pedagogical point of grouping them.

- `missing-factor` (default / flipIt / weeksToSave / rowPlusExtra) -> missing-factor, ALL 5.
  Every form turns a division into "what fills the blank in d x ___ = T?".
- `fact-family` (default / familyDivide / howManyFacts / shareThenGiveBack) -> fact-families,
  ALL 5. `howManyFacts` is built around the case where the two factors are EQUAL, collapsing the
  usual four facts into two — its route builds all four candidate facts into a Set and counts the
  distinct ones, so the collapse is derived rather than assumed.

Both gates green on the first pass again (third time; all three were numeric/mcq batches).

### Catches — all from reading, one caught BEFORE it shipped
Caught while writing, not after: the "different family" distractor was going to be computed as
P ÷ (a+1), which yields a ragged decimal for most draws — un-typeable, therefore a dead trap
(session 15's lesson, applied prospectively for the first time). Replaced with a SEARCH for a
genuine other factor pair of the same total, with the draw guarded to require one exists. This is
what the standing notes are for: the rule fired during design rather than during review.

READING: "That builds 2 groups of 18 — a huge 36." The template inherited "a huge" from the
authored item, where 6 x 24 = 144 against a total of 24 genuinely is huge. At d = 2 the product is
merely double, and the word overstates. Replaced the size claim with the value and its relation.
A reminder that inherited authored WORDING can be true of the authored instance and false of a
drawn one — the same trap as session 13's product-rule feedback, in a milder form.

Session grand total: 193 steps, 50 generators. Tests 1,954 -> 2,792. All seven gates green.

## Next by leverage
1. **More G3 `mult-*`** — number-line, identity-zero, times-5-10, times-9, unknown-letter,
   reasonableness, parity (5 steps each, all mcq/numeric). The times-tables trio
   (times-5-10, times-9) may share a pattern-based generator.
2. `cr-chord-arc` / `cr-chord-perp` / `cr-chord-dist` in G10 (4 each, circle machinery exists).
3. `cpr-*` in G10 — nine tags x 5 steps, the largest single unserved block in G10.

## Session 19: G6 area foundations — +11 steps -> 905 / 4,471 (20.24%), G6 11.9% -> 15.5%

Re-surveyed rather than continuing G3 by momentum (G3 had reached 20.0% and was no longer the
weak band). G6 was the worst at 11.9%, and its `asv-*` family — area, surface area, volume — is
10+ tags of pure numeric/mcq, the same homogeneous shape that has worked well elsewhere.

- `triangle-area-calc` (default / heightFromArea / slantDistractor) -> triangle-area, 3 of 4.
  `slantDistractor` draws the height and slant from a PYTHAGOREAN TRIPLE, so the slant is a
  genuine hypotenuse over the given height and the picture is geometrically consistent — the
  distractor is a real misreading, not an impossible figure. (The authored instance, base 10 with
  slant 13 and height 8, is not a consistent triangle; the generated ones always are.)
- `area-formula-pick` (default / trapezoid / cornerCut) -> area-formula-choice, 4 of 5.
  Every distractor is ANOTHER shape's correct answer on the same numbers, which is the lesson's
  own point. `cornerCut` serves both k4 and ch1.
- `lshape-decompose` (default / boxMinusCorner) -> decompose-lshape, ALL 4.
  `boxMinusCorner` serves k2, k3 AND ch1 — three authored steps, one shape.

**Two rejections, both definitional MCQs with fixed prose options**: asv-01-01/k2 ("what does
'height' mean in the formula?") and asv-01-03/k3 ("why does the trapezoid formula average the
bases?"). Same shape as ca-03-01/k2 and dr-05-02/k2.

Independent routes stay away from every formula the lessons teach: triangle area is found by
counting the enclosing rectangle and halving by SEARCH; the trapezoid is decomposed into the two
triangles the averaging rule is shorthand for; L-shapes accumulate by repeated addition.

### Catch
Both gates green on the first pass (fourth time). READING found the only defect: "a 8×3
rectangle" — 8 is spoken "eight", a vowel sound, so it takes "an". Added an `articleFor()` helper
alongside `ordinal()`, with the same justification: the article a NUMERAL takes is a bounded
numeric rule (8, 11, 18 and the 80s under 100), not English morphology guessed from data. Fixing
the three prompts broke all three routes' regexes, which hardcoded "a "/"A " — fixed in the same
edit, as always.

Session grand total: 204 steps, 53 generators. Tests 1,954 -> 2,814. All seven gates green.

## Next by leverage
1. **Continue G6 `asv-*`** — composite-triangle, composite-multistep, find-side-length,
   grid-polygon-area, coordinate-capstone, prism-net, triangular-prism-sa (4 steps each). The
   composite pair should reuse `lshape-decompose`'s add/subtract machinery directly.
2. **G12 (12.6%)** and **G10 (12.8%)** are now the weakest bands — survey before committing.
3. `cr-chord-*` and `cpr-*` remain queued in G10.

## Session 20: G12 average rate of change — +7 steps -> 912 / 4,471 (20.40%), G12 12.6% -> 14.1%

Re-surveyed again (the weak band has moved every session lately) and G12 was the worst at 12.6%.
Its `fna-*` function-analysis family is 8+ tags of numeric/mcq; took the average-rate-of-change
pair, which is one concept computed then INTERPRETED.

- `secant-slope` (default / avgRate / compareIntervals) -> fna-secant, 3 of 4.
  Slopes are drawn INTEGER so the independent route can find them by SEARCH — testing each
  candidate m for whether stepping the run from the first point lands exactly on the second —
  rather than computing the (y2−y1)/(x2−x1) quotient the lesson teaches.
  `compareIntervals` compares two secants by CROSS-MULTIPLYING rises and runs, so the route
  never divides at all and never touches a rate value.
  REJECTED k2 ("a horizontal secant says what about the function?") — no numbers in the prompt
  and three fixed prose options.
- `rate-interpret` (default / negativeMeaning / compareSpeeds / temperature) -> fna-rate-interp,
  ALL 4. Same arithmetic as a secant slope, but every form attaches units and asks what the
  number MEANS, which is the distinction the lesson exists to draw.

### Catches
GATE: an avgRate trap collision — three traps (rise, starting height, run) but m·run equals run
whenever m is 1. My first guard had a dead variable and only one comparison; replaced with the
full pairwise check, which is now the standing default for 3+ interacting traps.

READING, two defects, and the second is the more interesting:
1. "by 13 a.m." / "by 14 a.m." — the end time could reach 16 while only 12 was special-cased to
   "noon". Capped at noon so every rendering is a real clock time.
2. **A draw that let the WRONG reasoning reach the right answer.** In compareSpeeds, when both
   walkers take the same time, whoever went farther is automatically faster — so the "total
   distance isn't a rate" distractor accidentally reasons its way to the correct option and the
   item never forces a division. Now the farther walker must be the SLOWER one, exactly as the
   authored item arranges (Ben walks farther and is slower). This is a NEW category worth naming:
   not a trap collision, not a display bug, but a draw that quietly makes the misconception
   succeed. The gate cannot see it — every value is distinct and every diagnosis is true.

Session grand total: 211 steps, 55 generators. Tests 1,954 -> 2,832. All seven gates green.

## Next by leverage
1. **Continue G12 `fna-*`** — fna-extrema, fna-piecewise, fna-step (4 each, numeric/mcq);
   fna-inc-dec and fna-graph-read use buildExpression; fna-even-odd is pure mcq.
2. **G10 (12.8%)** is now the weakest band — `cpr-*` (nine tags x 5) and `cr-chord-*` are queued.
3. Continue G6 `asv-*` — composite-triangle and composite-multistep should reuse
   `lshape-decompose`'s add/subtract machinery.

## Session 21: G10 conditional probability — +9 steps -> 921 / 4,471 (20.60%), G10 12.8% -> 14.4%

G10 was the weakest band; took the conditional-probability pair from `cpr-*`, the largest
unserved block in that grade (nine tags x 5 steps).

- `conditional-prob` (default / formula / whyShrink / suitRank / diceCondition) -> cpr-conditional-def,
  ALL 5. `diceCondition` ENUMERATES all 36 ordered rolls to count both the surviving outcomes and
  the doubles among them, so the two figures are always internally consistent whatever threshold
  is drawn.
- `multiplication-rule` (default / chainNumeric / withoutReplacement) -> cpr-multiplication-rule,
  4 of 5. `withoutReplacement` serves both k2 and ch1.
  REJECTED k4 ("when can you compute P(A and B) as P(A) × P(B)?") — no numbers in the prompt,
  four fixed prose options.

### Eleven gate failures, and one of them was the handover's documented gotcha verbatim
**Greedy `[\d.]+` swallowed the sentence's own full stop** — "0.53." parsed to NaN, so the MCQ
route could never match its label. The handover names this exactly and prescribes
`(\d+(?:\.\d+)?)`; I wrote the greedy form anyway and lost a debugging cycle to it. Applied the
documented pattern to every new route here.

Other catches worth keeping:
- **A structurally impossible trap set.** The "red card"/"black card" conditions had to be
  removed entirely: half the deck is red, so P(heart | red) = 1/2 equals P(red) = 26/52, and the
  ANSWER collided with the condition-itself trap. Not a bad draw — a bad CHOICE of condition, and
  no guard could have rescued it. Replaced with conditions (face cards, number cards, above-10)
  where hits/size can never equal size/52.
- **A quotient that could not be recovered.** `formula` drew P(A∩B) and P(B) and hoped the
  division landed on three decimals; it often did not, and the search route legitimately failed.
  Fixed by drawing the ANSWER and P(B) and DERIVING the intersection — the generator should
  construct what it wants exactly rather than filter for it.
- READING: "On wind days" (the adjectival form belongs in the data — added `adj`), and
  "among the greater than 2 faces", fixed by rewording to a phrase that works for every condition.
- READING: a distractor reading "Because 1/6 + 1/6 = 1/3" is only arithmetically apt when the
  shrink lands on 3 faces. Replaced with a misconception wrong for EVERY draw — that information
  always raises a probability, when being told "the roll is odd" would send P(6) to zero.
- Products were rounded (0.46 × 0.77 = 0.3542 printed as 0.354) with no stated convention; tenths
  now multiply to exact hundredths every time.

Session grand total: 220 steps, 57 generators. Tests 1,954 -> 2,852. All seven gates green.

## Next by leverage
1. **Continue `cpr-*` in G10** — cpr-tree-chain, cpr-count-prob (numeric/mcq, no new engines);
   cpr-independence-def/test and cpr-combination use dragBucket (branch works);
   cpr-permutation uses buildExpression.
2. **G12 `fna-*`** — fna-extrema, fna-piecewise, fna-step (4 each, numeric/mcq).
3. **G6 `asv-*`** — composite-triangle and composite-multistep should reuse `lshape-decompose`.

## Session 22: G10 probability trees and counting — +10 steps -> 931 / 4,471 (20.82%), G10 14.4% -> 16.2%

Continued `cpr-*`. Both tags fully served, no rejections — the first batch in a while where every
authored step was generatable.

- `tree-chain` (default / bothRed / mixedOrder / whyMinusOne / atLeastOneBlue) -> cpr-tree-chain,
  ALL 5. One bag of R red and B blue drawn twice without replacement, questioned five ways.
- `count-prob` (default / ratioMismatch / exactlyTwo / atLeastOne) -> cpr-count-prob, ALL 5.
  `exactlyTwo` serves k3 (a committee of girls and boys) and ch1 (marbles) — the same
  C(a,2)·C(b,1)/C(n,3) computation in different clothes.

Both sets of independent routes ENUMERATE rather than compute: every ordered pair of distinct
marbles for the tree, every 3-element subset for the counting. No probability formula appears in
any route, which makes the agreement a real check on the formulas rather than a restatement.

### The catch worth recording: I failed to apply my own documented rule
The gate rejected a bothRed draw with "expected 0.0049999999999999975 to be greater than 0.005" —
two displayed values sitting EXACTLY the grading tolerance apart. VARIANT_STATE.md has carried the
rule since session 12: **trap distinctness must beat the TOLERANCE, not merely differ**, because a
tolerant widget treats two values inside the tolerance as the same answer. I wrote a plain
`new Set(vals).size === vals.length` check anyway. Fixed to require every pairwise difference to
exceed 0.0051. Worth noting that a Set check is the natural thing to reach for and is simply wrong
on any widget with a nonzero tolerance — the standing note needs to be read BEFORE writing the
guard, not after the gate rejects it.

Also: widening a guard shrinks the draw pool, and the freshness floor then fails for reasons that
look unrelated. Both generators needed their ranges widened AFTER the guards tightened — tightening
and widening travel together, and it is worth measuring the surviving pool (a throwaway script
counting survivors settled it in one step rather than three guesses).

READING: "P(all five-group members chosen)" — a number-word mapping that produced nonsense.
Reworded to "P(all 3 come from a particular subgroup of 5)", which reads correctly for every draw.

Session grand total: 230 steps, 59 generators. Tests 1,954 -> 2,874. All seven gates green.

## Next by leverage
1. **Finish `cpr-*`** — cpr-independence-def, cpr-independence-test, cpr-combination (dragBucket,
   branch works), cpr-permutation (buildExpression).
2. **G12 `fna-*`** — fna-extrema, fna-piecewise, fna-step (4 each, numeric/mcq).
3. **G6 `asv-*`** — composite-triangle and composite-multistep should reuse `lshape-decompose`.

## Session 23: G10 independence — +10 steps -> 941 / 4,471 (21.05%), G10 16.2% -> 17.9%

Coverage crossed 21%. Recovered from an interruption: the generators, routes, BAND entries and
declarations had all landed before the cut, but the READ had not — and the read found the
session's most serious defect, so the recovery was not a formality.

- `independence-def` (default / dependentCheck / conditionalFromDeck / bucketSort /
  formulaIndependent) -> cpr-independence-def, ALL 5.
- `independence-test` (default / predictVsActual / plainProduct / bucketTest / factory)
  -> cpr-independence-test, ALL 5. Both dragBucket forms draw two items per bucket by
  construction, so no bucket can come up empty.

### An IMPOSSIBLE SCENARIO the gate cannot see
`predictVsActual` drew P(bus) = 0.4 and P(sport) = 0.3 over 200 students — 80 bus, 60 sport —
and then stated the table shows **80 students who do both**. That is impossible: only 60 do sport
at all. Every gate passed, because the PREDICTED answer (0.4 × 0.3 × 200 = 24) is correct
arithmetic and every trap is distinct. The scenario is incoherent, not the computation.

This is the same family as session 20's "wrong reasoning reaches the right answer": the numbers
are individually fine and their relationship is nonsense. Fixed by requiring the actual overlap to
be at most the smaller group, then VERIFIED across 200 draws with a throwaway script rather than
by re-reading two samples — for a constraint about internal consistency, a sweep is the honest
check.

READING also caught "a ace" — the RANKS table carries an `art` field ("a"/"an") for exactly this
and one string hardcoded "a" anyway.

Session grand total: 240 steps, 61 generators. Tests 1,954 -> 2,898. All seven gates green.

## Next by leverage
1. **Finish `cpr-*`** — cpr-combination (dragBucket) and cpr-permutation (buildExpression) are
   the last two tags in the course.
2. **G12 `fna-*`** — fna-extrema, fna-piecewise, fna-step (4 each, numeric/mcq).
3. **G6 `asv-*`** — composite-triangle and composite-multistep should reuse `lshape-decompose`.

## Session 24: G10 permutations and combinations — +10 steps -> 951 / 4,471 (21.27%), G10 17.9% -> 19.7%

- `permutation-count` (default / arrangeAll / podium / buildSeat / evenNumbers) -> cpr-permutation,
  ALL 5. `evenNumbers` fixes the last slot first (the even digit) and fills the rest from what
  remains — the reasoning the lesson teaches, generalised from digits 1-5 to 1-D.
- `combination-count` (default / orderBucket / handshakes / exactlyTwo) -> cpr-combination, ALL 5
  (default serves both k1 and k4, which are the same C(n,3) at different sizes).

Routes ENUMERATE throughout: actual permutations walked by a recursive generator, subsets counted
by nested loops. No factorial or C(n,k) formula appears in any route.

### Three engine-contract catches, all new to this workstream
1. **buildExpression requires unique token LABELS.** My bank carried two "×" and two copies of n
   (as the AUTHORED item does — authored content is not gated). Two identical labels are
   indistinguishable on screen but grade differently. Fixed by giving the bank ONE "×" and having
   the correct sequence reuse that id — repeated ids within a sequence are explicitly fine.
2. **dragBucket labels must not contain a COMMA.** The gate joins item labels with "," to hand
   them to the route, so "Gold, silver and bronze from 8 runners" arrived as two fragments and
   could never match. (matchPairs uses U+001F precisely to avoid this; dragBucket does not.)
   Reworded to "Medals for the top three of 8 runners".
3. **A substring bug in my own route**: classifying scenarios by keyword, "toppings" contains
   "pin", so a combination scenario was labelled a permutation. Exactly the trap from session 8
   where "counterclockwise" contains "clockwise". Word-boundary matching now.

Session grand total: 250 steps, 63 generators. Tests 1,954 -> 2,920. All seven gates green.

## Next by leverage
1. **Finish `cpr-*`** — three tags left: cpr-set-ops, cpr-addition-rule (mcq/numeric),
   cpr-indep-vs-disjoint (mcq/matchPairs/dragBucket/numeric — all branches exist).
2. **G12 `fna-*`** — G12 is the weakest band at 14.1%. fna-extrema, fna-piecewise, fna-step.
3. **G6 `asv-*`** — composite-triangle and composite-multistep should reuse `lshape-decompose`.

## Session 25: G12 extrema and piecewise functions — +8 steps -> 959 / 4,471 (21.45%), G12 14.1% -> 15.7%

Went to G12 as the state file directed, after three sessions of it being the weakest band while
G10 got the attention. Both gates passed on the first run.

- `extrema-value` (default / localVsAbsolute / absMinValue / whichPoint) -> fna-extrema, ALL 4.
  The distinction the lesson turns on is VALUE versus LOCATION, so every trap offers the x where
  the extremum happens instead of the y it reaches. `localVsAbsolute` and `whichPoint` REUSE the
  x³ − 3a²x family already verified in the session-9 curve-analysis work — critical points at
  x = ±a, heights ∓2a³ — so no new parametrisation had to be checked.
- `piecewise-eval` (default / whyDisjoint / solveBranch) -> fna-piecewise, ALL 4.

Routes SCAN rather than read: the parabola's maximum is found by sweeping a fine grid and taking
the largest value reached, never by lifting k out of the vertex form the prompt hands over. The
piecewise routes apply each branch's own condition to every candidate integer.

### A self-containment call, matching session 11
The authored prompts read simply "What is p(2)?" — the function DEFINITION lives in the lesson
body, not the widget. A refreshed item has to stand alone, because a learner re-asked this step
sees only the widget. The generated prompts therefore restate the rule ("For p(x) = x + 4 for
x < 5, and p(x) = x² for x ≥ 5, what is p(7)?"). Same call as the opt-box maxVolume prompt in
session 11, and worth noting as a recurring pattern: authored steps can lean on lesson context
that a generated one cannot.

Session grand total: 258 steps, 65 generators. Tests 1,954 -> 2,938. All seven gates green.

## Next by leverage
1. **Continue G12 `fna-*`** — fna-step, fna-inc-dec and fna-graph-read (the latter two use
   buildExpression), fna-even-odd (pure mcq). G12 remains the weakest band at 15.7%.
2. **Finish `cpr-*`** — three tags: cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint.
3. **G6 `asv-*`** — composite-triangle and composite-multistep should reuse `lshape-decompose`.

## Session 26: G6 composite areas — +8 steps -> 967 / 4,471 (21.63%), G6 15.5% -> 18.2%

Took the G6 pair the queue had flagged as reusing `lshape-decompose`'s add/subtract machinery.
Both gates green on the first run — third consecutive clean first pass, all three being
numeric/mcq batches with no new engine surface.

- `composite-tri` (default / notchCut / wallsPlusRoof) -> composite-triangle, ALL 4
  (`wallsPlusRoof` serves both k3 and ch1 — the same walls-plus-roof shape at two sizes).
- `composite-multi` (default / threeRects / groupingOrder / fourPieces) -> composite-multistep,
  ALL 4. `fourPieces` combines four pieces with signs (two rectangles added, a nook added, a
  notch cut) — the richest composite item in the corpus.

Every trap in `composite-tri` is the TRIANGLE mishandled: treated as a rectangle, added when it
was cut, or left out. That is the lesson's actual misconception set rather than generic arithmetic
slips, and it comes straight from reading the authored feedback before writing anything.

`groupingOrder` is the one conceptual step here and it was NOT rejected, unlike most conceptual
MCQs in this workstream. The reason is that its numbers are genuinely load-bearing: the claim is
that ANY grouping reaches the same total, and the correct option's feedback recomputes the
regrouped sum from the drawn values ("(9 + 12) + 64 = 21 + 64 = 85"). A conceptual step earns a
generator when the numbers do work; it gets rejected when they are scenery.

Routes ACCUMULATE piece by piece with signs — rectangles by repeated addition, triangles halved
by search, subtractions counted down one unit at a time. No route ever writes the combined
expression the item is asking the learner to assemble.

Session grand total: 266 steps, 67 generators. Tests 1,954 -> 2,956. All seven gates green.

## Next by leverage
1. **G12 `fna-*`** — fna-step, fna-even-odd (mcq), fna-inc-dec and fna-graph-read
   (buildExpression). G12 is again the weakest band at 15.7%.
2. **Finish `cpr-*`** — cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint.
3. **More G6 `asv-*`** — find-side-length, grid-polygon-area, coordinate-capstone, prism-net,
   triangular-prism-sa, volume-formula, fractional-volume, volume-applications.

## Session 27: G12 even/odd and step functions — +7 steps -> 974 / 4,471 (21.78%), G12 15.7% -> 17.2%

- `even-odd-classify` (default odd / neitherMixed / evenPolynomial) -> fna-even-odd, 3 of 4.
  The three authored steps each drill a DIFFERENT verdict — odd, neither, even — so each got its
  own form. A single shared "classify" form could hand all three the same class on a refresh,
  which is the design smell caught on matrix-apply in session 8; applying that lesson up front
  cost nothing and removed the risk entirely.
  REJECTED k3 ("a graph is symmetric about the y-axis — what must be true?") — no numbers in the
  prompt, and the explanation is identical whatever is drawn. Fails the session-26 test.
- `step-function` (default / atBoundary / jumpDescribe / absPiecewise) -> fna-step, ALL 4.
  Every prompt restates the postage table, because the authored ones say "Using C(w) above" and
  lean on the lesson body — the self-containment rule from session 25.

Routes test PARITY by sampling mirrored inputs and comparing, never by inspecting whether the
printed exponents happen to be odd or even; the step routes apply each printed bracket's own
condition to a weight.

### Catches
GATE: the "scaled" trap in the step form (w × the first bracket's price — a real per-kilogram
misconception) lands exactly ON the answer for some draws: w = 1.5 with a $6 first bracket gives
9, which is also p + d when d = 3. Fixed by drawing w AGAINST the prices rather than independently
of them — a reminder that a trap computed from two independently drawn quantities needs its own
guard even when each quantity is individually fine.

READING: ASCII hyphens where the corpus uses the typographic minus. FIFTH occurrence of this class
across the workstream. It is now clear this should be checked by default on any generator whose
feedback interpolates a computed value that can go negative, rather than discovered by reading
each time.

Session grand total: 273 steps, 69 generators. Tests 1,954 -> 2,974. All seven gates green.

## Next by leverage
1. **Finish `cpr-*`** — cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint (all branches exist).
2. **More G6 `asv-*`** — find-side-length, grid-polygon-area, coordinate-capstone, prism-net,
   triangular-prism-sa, volume-formula, fractional-volume, volume-applications. G6 at 18.2%.
3. **G12 `fna-inc-dec` / `fna-graph-read`** — both buildExpression, the branch exists.

## Session 28: G11 function transformations — +8 steps -> 982 / 4,471 (21.96%), G11 15.1% -> 16.7%

**The re-survey found a grade this workstream had never touched.** The state file had been
tracking G6/G10/G12 for several sessions; running the full ledger showed G11 at 15.1% with 515
steps — the weakest band, and never once surveyed. Worth remembering that a rotating watch list
can go stale in the direction of the bands you happen to have looked at.

- `vertical-shift` (default / cornerY / whichDirection) -> ft-vshift, ALL 4 (default serves both
  k1 and ch1 — the same evaluate-a-shifted-power shape).
- `horizontal-shift` (default / whichRule / evalShifted) -> ft-hshift, ALL 4.
  `whichRule` draws the DIRECTION as well as the distance, so the correct rule alternates between
  √(x + n) and √(x − n) rather than always being the same shape.

The inside-versus-outside distinction is the whole lesson, so every trap targets it: a constant
outside moves outputs, a constant inside moves the input BEFORE the rule acts and therefore
shifts the graph opposite to its sign.

Routes SCAN rather than read: the parabola's vertex is found by sweeping for the minimum, never
by setting the inside to zero; |x − h| is evaluated by walking the gap between x and h, so there
is no sign to strip and the route cannot reproduce the very slip the item traps.

### Catches
Applied the typographic-minus rule PRE-EMPTIVELY this time (the state file note from session 27),
and it cost nothing — no minus-sign defects reached the reading pass.

READING: `signed()` renders "+ 7" with a space, which is right inside an equation (y = |x| + 7)
and wrong in running prose ("adding + 7 outside"). Added a separate compact renderer for prose.
A reminder that one formatter rarely serves both an equation and a sentence.

GATE: routine — a fallback under the 25-character floor, and a vertex pool of 11 values that gave
only 5 distinct problems.

Session grand total: 281 steps, 71 generators. Tests 1,954 -> 2,990. All seven gates green.

## Next by leverage
1. **Continue G11 `ft-*`** — the largest untouched family found so far: ft-parents, ft-domain,
   ft-range, ft-combined-shift, ft-reflect, ft-stretch (4 steps each, all numeric/mcq).
   `ft-combined-shift` should reuse both shift generators directly.
2. **Finish `cpr-*`** — cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint.
3. **G6 `asv-*`** volume/surface-area family.

## Session 29: G11 combined shifts and reflections — +8 steps -> 990 / 4,471 (22.14%), G11 16.7% -> 18.3%

Test suite crossed 3,000 (3,006). Both gates green on the first run.

- `combined-shift` (default / domainStart / whichRule) -> ft-combined-shift, ALL 4.
  Both shifts at once makes the inside/outside split do real work: the INSIDE constant fixes where
  the vertex sits along x, the OUTSIDE one fixes its height, and every trap offers the other
  coordinate. `whichRule` draws BOTH directions, so the correct rule ranges over all four
  sign combinations rather than always being x − a with + b.
- `reflect-fn` (default / shapeDescribe / whichReflection) -> ft-reflect, ALL 4.
  `whichReflection` draws the AXIS as well, so the answer alternates between −√x and √(−x).

### The catch worth recording: scenery caught in my own work
`shapeDescribe`'s first draft kept the function fixed at y = −|x| and varied only an example
number inside one distractor's feedback. The prompt was IDENTICAL on every draw. That is exactly
the "numbers are scenery" case the session-26 note says should be rejected — and I had written
it without noticing, because the widget JSON differed and the freshness gate was satisfied.
Fixed by drawing the PARENT (−|x|, −x², −√x), which gives genuinely different graphs and
different correct descriptions.

Worth naming: the freshness gate compares serialised widgets, so feedback-only variation passes
it. A form can satisfy every gate and still show the learner the same question every time. The
check that catches it is reading the PROMPTS across several draws and asking whether they differ.

READING also caught "lifts that floor to −7" — a directional verb that is simply false for a
downward shift, and the spaced sign form ("The − 7 outside") leaking into prose again, one session
after adding a compact renderer for exactly that.

Session grand total: 289 steps, 73 generators. Tests 1,954 -> 3,006. All seven gates green.

## Next by leverage
1. **Continue G11 `ft-*`** — ft-parents, ft-domain, ft-range, ft-stretch (4 each, numeric/mcq).
2. **G12 (17.2%) is the weakest again** — fna-inc-dec / fna-graph-read (buildExpression), plus
   the tg-*, ti-*, pp-* families surveyed in session 20.
3. **Finish `cpr-*`** — cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint.

## Session 30: G12 trig equations with a coefficient inside — +5 steps -> 995 / 4,471 (22.25%), G12 17.2% -> 18.2%

`trig-inside` (default / generalCos / generalTan / sumSolutions) -> ti-inside-ladder, ALL 5
(sumSolutions serves both k4 and ch1). The most mathematically delicate batch of the workstream.

### Verifying the mathematics BEFORE writing the generator
Two closed forms drive this tag: on [0, 2π), sin(Bx) = c has exactly 2B solutions, and they sum
to π(2B − 1) — independent of c. I derived both by hand, then VERIFIED them numerically across
twelve (B, c) combinations by scanning for sign changes and bisecting every crossing, before
writing a line of generator code. The sum being independent of c is what lets the form draw the
value freely, and that is not a fact worth trusting from a derivation alone.

The independent routes then re-find the roots the same way — scanning [0, 2π) and bisecting —
and never touch either closed form. That is what makes the agreement a real check: the generator
asserts a formula and the route counts the actual crossings.

### Catch
GATE: at B = 2 the "counts the WAVES rather than the crossings" trap (value B) collides with the
"uncompressed count" trap (literal 2), since both are 2. Guarded B ≥ 3 for the counting form.
The authored instance uses B = 2, so this is a case where the generated range deliberately
excludes the authored value — acceptable because the trap set cannot be made distinct there, and
the concept is unchanged for B ≥ 3.

Session grand total: 294 steps, 74 generators. Tests 1,954 -> 3,016. All seven gates green.

## Next by leverage
1. **G12 remaining** — tg-solve-all, pp-to-polar, ti-double-action (5 steps each),
   fna-inc-dec / fna-graph-read (buildExpression).
2. **G11 `ft-*`** — ft-parents, ft-domain, ft-range, ft-stretch (4 each, numeric/mcq).
3. **Finish `cpr-*`** — cpr-set-ops, cpr-addition-rule, cpr-indep-vs-disjoint.

## Session 31: G4 like-denominator fractions — +8 steps -> 1003 / 4,471 (22.43%), G4 18.6% -> 21.5%

**Crossed 1,000 refreshed steps** (699 at handover). Surveyed G4 first, as the state file flagged
— it had never been looked at, and its `fa-*` fraction family is another large homogeneous block
(10+ tags, mostly numeric/mcq).

- `add-like-denom` (default / diagnoseError / wordSum) -> add-like-denom, ALL 4
  (default serves k1 and k3).
- `subtract-like-denom` (default / diagnoseError / simplifyDenom / wordSimplify)
  -> subtract-like-denom, ALL 4. The two simplifying forms ask for OPPOSITE parts of the reduced
  fraction (k3 the denominator, ch1 the numerator), and each names the other as its trap — so a
  learner who reduces correctly but reports the wrong half gets told exactly that.

The `simplify` draws BUILD the common factor in rather than drawing freely and hoping the
difference reduces — the session-21 "construct what you want exactly" rule, applied up front.

### The prose gate did the whole job this session
Three catches, all from the prose gate, none from reading:
1. **"1 pieces"** — count agreement, the rule that has caught this class since session 16.
2. **"12ths" / "24ths"** — the digit-plus-ths rule. Fraction names should be WORDS, and rather
   than carry a number-word table for every denominator I reworded to avoid naming the fraction
   at all ("it is still in 12", "each still one of the 12 equal parts"), which reads better at
   this grade anyway.

Worth noting: G4 is early-grade prose, and this is the band where the prose gate earns its keep
most. The variant gate passed everything on the first run; every defect was linguistic.

Session grand total: 302 steps, 76 generators. Tests 1,954 -> 3,034. All seven gates green.

## Next by leverage
1. **Continue G4 `fa-*`** — equivalence-recap, equivalence-rule-derived, simplify-fractions,
   like-denom-word-problems, fraction-times-whole (4-5 steps each, numeric/mcq).
2. **G12 (18.2%)** — tg-solve-all, pp-to-polar, ti-double-action (5 each).
3. **G11 `ft-*`** — ft-parents, ft-domain, ft-range, ft-stretch.

## Session 32: G6 surface area — +8 steps -> 1011 / 4,471 (22.61%), G6 18.2% -> 20.8%

Surveyed G6 first, as flagged. Both gates green on the first run.

- `box-surface-area` (default / sumPairs / cubeSA) -> prism-net, ALL 4 (default serves k2 and ch1).
- `prism-surface-area` (default / totalSA / missingFace) -> triangular-prism-sa, ALL 4
  (totalSA serves k2 and k3).

Right-triangle bases are drawn from PYTHAGOREAN TRIPLES so the hypotenuse — and therefore the
third rectangle — is always whole. With (6,8,10) and (5,12,13) the generated traps reproduce the
authored ones exactly (one-end-only, and skipping the triangles' ×1/2), which is a good sign the
misconception set was read correctly rather than invented.

Routes ENUMERATE the faces and accumulate them one at a time — six for a box, five for a prism —
so no route ever writes 2(lw + lh + wh) or ½bh. The prism routes additionally CONFIRM the
hypotenuse against Pythagoras rather than trusting the number printed in the prompt: if a draw
ever produced a non-right triangle the route would refuse rather than quietly agree.

Session grand total: 310 steps, 78 generators. Tests 1,954 -> 3,050. All seven gates green.

## Next by leverage
1. **G8 (18.3%)** — has NEVER been surveyed by this workstream. Check it first.
2. **G12 (18.2%)** — tg-solve-all, pp-to-polar, ti-double-action (5 each).
3. **G11 `ft-*`** — ft-parents, ft-domain, ft-range, ft-stretch.
4. **More G6 `asv-*`** — find-side-length, grid-polygon-area, coordinate-capstone,
   sa-word-problems, volume-formula, fractional-volume, volume-applications.

## Session 33: G8 bivariate statistics — +7 steps -> 1018 / 4,471 (22.77%), G8 18.3% -> 20.8%

Surveyed G8 first, as flagged — the third grade this workstream had never looked at (after G11 in
session 28 and G4 in session 31). Its `bv-*` bivariate family is 10+ tags of mcq/dragBucket.

- `association-type` (default / fromContext / sortPairs) -> bv-association, ALL 4.
- `scatter-features` (default / clusterCorner / sortFeatures) -> bv-form-outliers, 3 of 4.
  REJECTED k3 ("why is it important to notice an outlier before fitting a line?") — one fixed
  argument, no numbers, explanation identical whatever is drawn.

### These are conceptual MCQs that EARN a generator
Almost every conceptual MCQ in this workstream has been rejected, so it is worth being precise
about why these are different. The DRAWN element decides the answer rather than decorating it:
`default` draws whether the dots rise, fall, or scatter, so the correct option moves between
Positive, Negative and No association; `fromContext` draws the real-world pair; `clusterCorner`
draws the corner, which changes whether the shared values are high or low on each axis. Change
the draw and the correct answer changes — that is the session-26 test passing, not being dodged.

The generated forms are also STRONGER than the authored ones here, which fix a single direction
each. A learner re-asked bv-01-02/k1 currently always sees falling dots; now they might see any
of the three.

### Catch: the word-boundary trap, one level deeper
`sortFeatures`' route classified "a tight knot of dots in one corner" as an OUTLIER, because the
stray-point test matches the word "one" — and it does so even WITH word boundaries, since "one"
is a genuine word there. Word boundaries were the session-8 and session-24 fix; they are not
enough when the trigger word appears legitimately in another sense. Fixed by testing for a GROUP
first: a phrase naming a group is a cluster whatever else it happens to say. Order of tests is
part of the classification, not an implementation detail.

Also: two distractor feedbacks opened with "No", tripping the NEGATION ban.

Session grand total: 317 steps, 80 generators. Tests 1,954 -> 3,066. All seven gates green.

## Next by leverage
1. **G12 (18.2%) is the weakest** — tg-solve-all, pp-to-polar, ti-double-action (5 each).
2. **G11 `ft-*`** — ft-parents, ft-domain, ft-range, ft-stretch.
3. **More G8 `bv-*`** — bv-fit-idea, bv-judge-fit, bv-which-line, bv-interpret,
   bv-prediction-limits, bv-read-table (4 each).

## Session 34: G12 double-angle equations — +4 steps -> 1022 / 4,471 (22.86%), G12 18.2% -> 19.0%

`double-angle-solve` (default / nextStep / countSolutions / sumSolutions) -> ti-double-action,
4 of 5.

**REJECTED ch1** (cos 2x = cos x, sum of solutions) — the factored quadratic 2c² − kc − 1 = 0 has
rational roots for only two coefficients, so the draw pool cannot reach the freshness floor. A
generator there would alternate between two fixed problems, which is not a refresh. Rejecting on
POOL SIZE rather than on the item being a single fact is a new reason for this list.

### Verifying first, then widening, then verifying again
Every form runs on sin 2x = k·sin x, which factors to sin x(2cos x − k) = 0. I verified numerically
BEFORE writing that this always gives four solutions on [0, 2π) summing to 3π. Then the freshness
requirement forced the coefficient pool wider — and the trick that made it possible is that ANY
k = 2cos(a) for a named angle keeps cos x = k/2 exact, so √2 and √3 are legitimate coefficients,
not just ±1. I re-ran the verification across all six before using them. Two verification passes
for one generator is proportionate when the whole form rests on a closed-form claim.

### Catches
1. **Deriving one piece of data from another, again.** The coefficient's display prefix ("−") and
   its full text ("−1") are different strings, and I tried to compute the second from the first
   with `.trim() || "1"` — but "−".trim() is truthy, so the fallback never fired and a distractor
   read "2 cos x = −". Store both forms in the data. This is the singular/plural rule in another
   costume.
2. The routes still assumed k = ±1 after the pool widened, so they rebuilt the factored form
   wrongly. Fixed by PARSING the printed coefficient rather than assuming it — which is what the
   route should have done from the start.

Session grand total: 321 steps, 81 generators. Tests 1,954 -> 3,076. All seven gates green.

## Next by leverage
1. **G11 (18.3%) is the weakest** — ft-parents, ft-domain, ft-range, ft-stretch (4 each).
2. **G12 remaining** — tg-solve-all, pp-to-polar (5 each), fna-inc-dec / fna-graph-read.
3. **G10 (19.7%)** — cr-chord-arc / cr-chord-perp / cr-chord-dist, and the last three cpr-* tags.

## Session 35: G11 domain and range — +8 steps -> 1030 / 4,471 (23.04%), G11 18.3% -> 19.8%

Coverage crossed 23%.

- `domain-restrict` (default / excludeZero / allReals / rootScaled) -> ft-domain, ALL 4.
- `range-floor` (default / allRealsRange / negMax) -> ft-range, ALL 4 (default serves k1 and k2 —
  x² and √x both bottom out at 0, so one form covers the pair by drawing the parent).

Routes TEST candidates rather than solving: domains are found by walking upward until the
function is defined, ranges by sampling across the domain and taking the extreme value actually
reached. Neither ever solves the inequality or reads the outside constant off the rule, which are
precisely the two procedures these lessons teach.

### Catch: a prose-gate FALSE POSITIVE, handled the same way as session 12
The gate flagged "A fraction is undefined when its denominator vanishes" under its
unfilled-template-slot rule, which looks for the literal string "undefined". That is legitimate
mathematics vocabulary, not a broken template — a genuine false positive.

Same decision as the "the a" false positive in session 12: reword MY string rather than loosen a
rule guarding 80+ generators. The cost of loosening is real unfilled slots slipping through
corpus-wide; the cost of rewording is one sentence. "A fraction has no value when its denominator
hits zero" says the same thing. Worth recording that "undefined" is effectively a reserved word in
generated prose here, so the next person understands why the phrasing avoids it.

READING also caught ASCII hyphens in two denominator values where `sn()` had not been applied —
sixth session for that class, though now caught within the same batch rather than shipping.

Session grand total: 329 steps, 83 generators. Tests 1,954 -> 3,094. All seven gates green.

## Next by leverage
1. **G12 (19.0%)** — tg-solve-all, pp-to-polar (5 each), fna-inc-dec / fna-graph-read.
2. **G10 (19.7%)** — cr-chord-arc / cr-chord-perp / cr-chord-dist; the last three cpr-* tags.
3. **G11 remaining** — ft-parents, ft-stretch (4 each).

## Session 36: G12 polar conversion — +5 steps -> 1035 / 4,471 (23.15%), G12 19.0% -> 20.1%

`to-polar` (default / angleQuadrant / radius / rPlusTheta) -> pp-to-polar, ALL 5.

Points are built as (2k·cos a, 2k·sin a) for a named reference angle, so r comes out whole (2k)
and θ is an exact fraction of π. VERIFIED numerically before writing that this reproduces the
authored instance exactly: (−2√3, 2) gives r = 4, θ = 5π/6, r + θ ≈ 6.618.

**The independent route is the strongest kind available here.** The generator builds its answer
from a reference-angle table and a quadrant rule; the route evaluates the printed surds
numerically and hands them to atan2, which picks the quadrant on its own. Two completely
different mechanisms for the same fact — and it passed on the first run across every draw,
which is real evidence the quadrant table is right rather than plausible.

The misconception every form targets is trusting arctan's RAW output, which cannot distinguish
Q1 from Q3 or Q2 from Q4. `angleQuadrant` draws only Q2-Q4, where that error actually bites.

### Catch
READING: "1π/3" — a coefficient of 1 printed where it should be omitted. Added a shared piLabel
helper rather than fixing the four quadrant cases separately, since all four had the same defect.

Session grand total: 334 steps, 84 generators. Tests 1,954 -> 3,104. All seven gates green.

## Next by leverage
1. **G10 (19.7%) is the weakest** — cr-chord-arc / cr-chord-perp / cr-chord-dist (circle
   machinery exists from session 15); the last three cpr-* tags.
2. **G11 remaining** — ft-parents, ft-stretch (4 each).
3. **G12 remaining** — tg-solve-all (5), fna-inc-dec / fna-graph-read (buildExpression).

NOTE: the full vitest run now takes ~5 minutes. Run `npx vitest run` on its own rather than
chaining it after typecheck, or the combined command times out.

## Session 37: G10 chord geometry — +7 steps -> 1042 / 4,471 (23.31%), G10 19.7% -> 21.0%

- `chord-perp` (default / distFromChord / parallelChords) -> cr-chord-perp, 3 of 4.
  REJECTED k3 ("how do you locate the centre of a broken plate?") — a fixed construction argument
  with no numbers in the prompt.
- `chord-dist` (default / whichLongest / howMuchLonger / pipeDepth) -> cr-chord-dist, ALL 4.

Routes SEARCH whole numbers against r² = d² + half² rather than taking a square root — the
lesson's own procedure is the root, so testing candidates until Pythagoras balances is a genuinely
different mechanism.

### THE MISTAKE WORTH RECORDING: I declared into the wrong files
I inferred the lesson filenames from the ORDER the tags appeared in my dump script's output,
assuming cr-chord-perp lived in cr-02-01 and cr-chord-dist in cr-02-02. In fact cr-02-01 holds
cr-chord-arc, cr-02-02 holds cr-chord-perp, and cr-chord-dist is in cr-02-03. Seven declarations
went into two wrong files.

The RESOLVER gate caught it immediately ("declared chord-dist but it does not serve numeric"),
because the mis-targeted steps had incompatible widget surfaces. But it would NOT have caught a
mis-targeting between two files whose surfaces happened to match — the generated item would simply
have been about the wrong concept, and only `verify.mts` (authored vs generated, side by side)
would have shown it.

Standing rule now: **resolve the filename from the conceptTag, never from the order tags appear
in a dump.** One grep costs nothing:
    python3 -c "…tags = {s.get('conceptTag') …}" over content/courses/*/lessons/*.json

Session grand total: 341 steps, 86 generators. All gates green.

## Next by leverage
1. **G11 (19.8%)** — ft-parents, ft-stretch (4 each).
2. **G3 (20.0%)** — the rest of mult-*: number-line, identity-zero, times-5-10, times-9,
   unknown-letter, reasonableness, parity.
3. **G12** — tg-solve-all (5), fna-inc-dec / fna-graph-read (buildExpression).
4. **G10 remaining** — the last three cpr-* tags, cr-chord-arc.

## Session 38: G11 parent functions and stretches — +8 steps -> 1050 / 4,471 (23.48%), G11 19.8% -> 21.4%

**The `ft-*` family is COMPLETE** — all eight tags served across sessions 28, 29, 35 and 38.

- `parent-functions` (default / evalParent) -> ft-parents, ALL 4. The default form draws the
  PROPERTY, so the correct parent moves between all four — the session-33 pattern that lets a
  conceptual MCQ earn a generator. It serves three authored steps on its own.
- `stretch-scale` (default / whichWider) -> ft-stretch, ALL 4 (default serves three steps).

### The catch: an AMBIGUOUS property, not just an imprecise route
My route reported "expected exactly one parent to match, found 2" — and the honest diagnosis was
that my PROPERTY was ambiguous, not that the route was sloppy. "Rises on both far ends and never
goes below the x-axis" is true of x² AND |x|. The authored distractor already knew this: it says
the V "turns with a sharp CORNER rather than a smooth curve". I had written a property that does
not identify a unique answer.

Fixed in the content, not just the checker: the property now names the smooth turn
("...and turns SMOOTHLY at its lowest point"), and the route tests smoothness by comparing the
slope either side of the minimum. Worth recording because the instinct on a route failure is to
fix the route — here the route was right to complain.

READING: "−2²" for the squaring trap, which by convention reads as −(2²). Now parenthesised as
"(−2)²" when the input is negative. Also a capital letter mid-sentence after "Right — ".

Session grand total: 349 steps, 88 generators. All gates green.

## Next by leverage
1. **G3 (20.0%)** — the rest of mult-*: number-line, identity-zero, times-5-10, times-9,
   unknown-letter, reasonableness, parity (5 steps each, all mcq/numeric).
2. **G12 (20.1%)** — tg-solve-all (5), fna-inc-dec / fna-graph-read (buildExpression).
3. **G10 remaining** — the last three cpr-* tags, cr-chord-arc.

## Session 39: G3 times-tables patterns — +9 steps -> 1059 / 4,471 (23.69%), G3 20.0% -> 22.7%

- `times-five-ten` (default / timesFive / clockMinutes / clockElapsed) -> times-5-10, ALL 5
  (clockElapsed serves both k4 and ch1). The clock forms are the same ×5 fact in a different
  costume, which is the lesson's own framing rather than a scenario I invented.
- `times-nine` (default / theaterSeats) -> times-9, 4 of 5 (each form serves two steps).
  REJECTED k3 ("which is TRUE about every ×9 answer?") — a fixed property of the whole times
  table, with no numbers in the prompt.

Routes COUNT HOPS rather than multiplying: ×5 by adding five repeatedly, ×9 by counting out ten
groups and then giving one back. That is the strategy the lesson teaches, so the route mirrors the
intended reasoning rather than the shortcut it replaces.

### The catch: feedback true of the AUTHORED instance but false of most draws
The glue-the-digits trap carried the authored line "…and an hour only has 60 minutes in it".
That is true for the authored n = 9 (which glues to 95) and FALSE for most draws — 45 is a
perfectly ordinary number of minutes. Reworded to say what the learner should do instead, which
holds for every draw.

This is the third time inherited authored wording has been true of its own instance and false of
a generated one (session 13's product-rule feedback, session 18's "a huge 144"). The pattern is
consistent enough to state plainly: **authored feedback is written against ONE set of numbers, so
any claim it makes about magnitude, comparison or plausibility has to be re-checked against the
generator's full range.**

Also caught: "1 marks" (count agreement) and a times-nine pool of only 7 values giving 5 distinct.

Session grand total: 358 steps, 90 generators. All gates green.

## Next by leverage
1. **G12 (20.1%)** — tg-solve-all (5), fna-inc-dec / fna-graph-read (buildExpression).
2. **G3 remaining** — number-line, identity-zero, unknown-letter, reasonableness, parity.
3. **G10 remaining** — the last three cpr-* tags, cr-chord-arc.

## Session 40: G12 solving trig equations over a full period — +5 steps -> 1064 / 4,471 (23.80%), G12 20.1% -> 21.1%

`solve-trig-all` (default / tanCount / sinPair / sumCos / sumSin) -> tg-solve-all, ALL 5.

Three closed forms drive the sum steps, all VERIFIED numerically across every named value before
any generator code was written: on [0, 2π), cos x = c sums to 2π; sin x = c sums to π when c is
positive and 3π when negative — each independent of c, which is what lets the value be drawn
freely. The independent routes then SCAN for roots and bisect, never touching a quadrant rule or
a closed form, and agreed on the first run.

### Freshness forced a better item, twice
Both sum forms failed the freshness floor when first declared, and in each case the fix improved
the mathematics rather than merely widening a range:

- `tanCount` drew only ±1. But tangent reaches EVERY real value exactly twice on [0, 2π), so the
  count is 2 whatever k is — the pool could be as wide as wanted. Now ±1 through ±6.
- `sumSin` drew only the three named values. Adding the SIGN as a drawn dimension doubled the
  pool and introduced a genuine distinction the learner must notice: a positive sine pairs x with
  π − x (sum π), a negative one pairs π + x with 2π − x (sum 3π). The traps now include the
  other pattern's sum, which is a real misconception rather than an arbitrary number.

Worth noting the shape of that: the freshness gate is usually satisfied by widening a range, but
twice here the honest fix was to find a DIMENSION the mathematics already had and the first draft
had ignored.

Session grand total: 363 steps, 91 generators. All gates green.

## Next by leverage
1. **G6 (20.8%) / G8 (20.8%)** — G6: find-side-length, grid-polygon-area, coordinate-capstone,
   sa-word-problems, volume-formula, fractional-volume, volume-applications. G8: bv-fit-idea,
   bv-judge-fit, bv-which-line, bv-interpret, bv-prediction-limits, bv-read-table.
2. **G10 (21.0%)** — the last three cpr-* tags, cr-chord-arc.
3. **G3 remaining** — number-line, identity-zero, unknown-letter, reasonableness, parity.

## Session 41: G6 volume — +8 steps -> 1072 / 4,471 (23.98%), G6 20.8% -> 23.4%

- `box-volume` (default / whichMeasure / doubleDimension) -> volume-formula, ALL 4
  (default serves k1 and k3).
- `fraction-volume` (default / properFraction / halfCubes) -> fractional-volume, ALL 4
  (default serves k2 and ch1).

`whichMeasure` draws the QUESTION TYPE, not just the container: "how much sand fills a sandbox"
versus "how much paint covers a crate". The correct answer therefore alternates between volume and
surface area rather than sitting on one option every time — the same move that let the G8
association MCQs earn generators in session 33.

Routes STACK unit cubes: one layer at a time, each layer one row at a time. The fractional forms
count 1/q-thick slabs and convert at the end, so no route ever multiplies a fraction directly —
which is precisely the step the lesson is teaching and the traps are probing.

### Catch
READING: "2/4" — an unreduced fraction, which no textbook prints and which made the feedback read
oddly ("2 quarters of a unit"). Now required in lowest terms. Worth noting this is the second
reduction defect found by reading (session 26 had an unreduced slope "−9/12"): a draw that picks a
numerator and denominator independently will produce unreduced fractions unless told not to.

Session grand total: 371 steps, 93 generators. All gates green.

## Next by leverage
1. **G8 (20.8%) is the weakest** — bv-fit-idea, bv-judge-fit, bv-which-line, bv-interpret,
   bv-prediction-limits, bv-read-table (4 each).
2. **G10 (21.0%)** — the last three cpr-* tags, cr-chord-arc.
3. **G6 remaining** — find-side-length, grid-polygon-area, coordinate-capstone, sa-word-problems,
   volume-applications.

## Session 42: G8 line of best fit and two-way tables — +8 steps -> 1080 / 4,471 (24.16%), G8 20.8% -> 23.5%

Coverage crossed 24%. Both gates green on the first run.

- `line-of-fit` (default / interceptZero / slopeAssociation) -> bv-which-line, ALL 4
  (default serves k1 and k2). `slopeAssociation` draws the SIGN, so the correct association
  alternates rather than always being negative as the authored step has it.
- `two-way-table` (default / grandTotal / cellMeaning / columnTotal) -> bv-read-table, ALL 4.

The table generator draws ONE 2×2 table and every form reads it, so a row total, a column total,
the grand total and a cell's meaning all refer to the same consistent counts. The distractors are
therefore genuinely available numbers from the same table rather than invented wrong values —
"that's the grand total", "that's only the junior cell" — which is what makes them diagnostic.

Routes SAMPLE and ACCUMULATE: the slope is recovered by evaluating the printed line at two inputs
and measuring the rise, never by reading the coefficient (the step being taught); totals are
accumulated cell by cell rather than summed in one expression.

Session grand total: 379 steps, 95 generators. All gates green.

## Next by leverage
1. **G10 (21.0%) is the weakest** — the last three cpr-* tags (cpr-set-ops, cpr-addition-rule,
   cpr-indep-vs-disjoint), cr-chord-arc.
2. **G12 (21.1%)** — only fna-inc-dec / fna-graph-read remain, both buildExpression.
3. **G8 remaining** — bv-fit-idea, bv-judge-fit, bv-interpret, bv-prediction-limits.

## Session 43: G10 set operations and the addition rule — +8 steps -> 1088 / 4,471 (24.33%), G10 21.0% -> 22.4%

- `set-ops` (default / unionCount / sortCards) -> cpr-set-ops, ALL 4
  (unionCount serves k2 and ch1).
- `addition-rule` (default / countOr / probOr) -> cpr-addition-rule, ALL 4
  (countOr serves k2 and k4). Note cpr-02-01 carries TWO tags — k3 is cpr-mutually-exclusive and
  was left alone; checking the conceptTag per STEP, not per file, mattered here.

Every count is ENUMERATED from the drawn range or a rebuilt deck rather than computed from
|A| + |B| − |A ∩ B|, so the four quantities can never disagree with one another. That is the
internal-coherence rule from session 23, and it also makes the distractors honest: each one is a
real quantity from the same setup ("that is the overlap", "that is A alone") rather than an
invented wrong number.

### Catches
1. **TypeScript caught dead code the gates could not.** `as const` on the card-set tables made TS
   infer literal types through the arithmetic, so it flagged `S.both === 1` as impossible — and
   it was right: no entry has an overlap of 1, so the singular branch was unreachable. Removed
   rather than silenced.
2. Two freshness failures, both from over-tight guards. Requiring a single-card intersection AND
   pairwise-distinct counts left only FOUR surviving (a, t) pairs for set-ops and THREE for
   countOr. Measured the survivors with a throwaway script rather than guessing at a new range —
   the session-22 rule — and widened to fifteen and sixteen respectively.
3. PROSE GATE: "The a king cards" — the rank labels carry their own article, so interpolating one
   after "The" doubles it, and "face card cards" doubles the noun too. Stored a bare plural
   alongside the article form (the session-34 rule: store both, never derive one from the other).

Session grand total: 387 steps, 97 generators. All gates green.

## Next by leverage
1. **G12 (21.1%)** — only fna-inc-dec / fna-graph-read remain, both buildExpression.
2. **G11 (21.4%)** — the cn-* complex-number family (cn-complex-plane, cn-neg-eq,
   cn-formula-complex, cn-build-quad).
3. **G10 remaining** — cpr-indep-vs-disjoint, cr-chord-arc.

## Session 44: G3 FOCUS BEGINS — number-line hops and identity/zero — +10 steps, G3 22.7% -> 25.8%

Coverage 1098 / 4,471 (24.56%). New standing instruction: work G3 exclusively until the grade is
complete. Surveyed it in full first — **67 unserved tags, 255 steps** — so this is a multi-session
run, not a single batch.

### The G3 remaining map (for the sessions ahead)
- `mult-*` (5 tags left before this session): number-line ✓, identity-zero ✓, unknown-letter,
  reasonableness, parity. All mcq/numeric, 5 steps each.
- `pv-*` rounding (4 tags x 5): round-10, round-100, round-half, estimation. Three use
  numberLinePlace — CONFIRM that gate branch before starting.
- `fr-*` fractions (9 tags x 4): equal-parts, build-fraction, nl-partition, nl-unit, nl-fraction,
  nl-beyond-one, equivalent, equiv-models, whole-as-fraction. Two use numberLinePlace.
- Plus ~50 further tags below the 4-step threshold.

### This session
- `hop-multiply` (default / landOn / hopLength / turnAround) -> number-line, ALL 5
  (turnAround serves k4 and ch1).
- `identity-zero` (default / timesZero / stickerStory / riddleOne / riddleZero) -> identity-zero,
  ALL 5 — one form per step, since each drills a different confusion.

Both gates green on the first run. Routes WALK the number line one hop at a time and apply each
riddle instruction in sequence, so no route ever collapses the steps the item is testing.

The `default` form of identity-zero has an unusually strong route: it reads every option, tests
each claimed product by repeated addition, and returns the one that is actually true — so it
verifies the claim rather than matching a remembered string.

Session grand total: 397 steps, 99 generators. All gates green.

## Next (G3 only)
1. `unknown-letter`, `reasonableness`, `parity` — the last three mult-* tags (5 steps each).
2. `pv-*` rounding quartet — confirm the numberLinePlace gate branch first.
3. `fr-*` fraction family — nine tags.

## Session 45: G3 unknown letters and parity — +10 steps, G3 25.8% -> 28.8%

Coverage 1108 / 4,471 (24.78%). Both gates green on the first run.

- `unknown-letter` (default / solveFor / howToCheck / spiderStory) -> unknown-letter, ALL 5
  (spiderStory serves k4 and ch1).
- `parity` (default / oddFactors / rowValue / pointsBonus) -> parity, ALL 5
  (pointsBonus serves k4 and ch1).

Only ONE mult-* tag now remains in G3: `reasonableness`.

Two routes are worth noting for how they verify rather than restate:
- `howToCheck` endorses substitution as the checking method — and the route SUBSTITUTES first,
  refusing if the stated solution does not actually satisfy the equation. It checks the item's
  premise before agreeing with the item's advice.
- `oddFactors` enumerates every factor pair of the drawn product and looks for an even member,
  deriving "both factors must be odd" from the factorisation rather than asserting the parity
  rule the question is about.

`solveFor` and `spiderStory` recover the hidden letter by SEARCHING for the factor that makes the
sentence true — which is the substitution the lesson teaches, not the division that shortcuts it.

Session grand total: 407 steps, 101 generators. All gates green.

## Next (G3 only)
1. `reasonableness` — the last mult-* tag (5 steps, mcq/numeric).
2. `pv-*` rounding quartet: round-10, round-100, round-half, estimation. Three use
   numberLinePlace — CONFIRM that gate branch exists before starting.
3. `fr-*` fraction family — nine tags, two using numberLinePlace.

## Session 46: G3 reasonableness — mult-* COMPLETE, G3 28.8% -> 30.3%

Coverage 1113 / 4,471 (24.89%). **The entire `mult-*` family is now served** — every
multiplication/division tag in G3, across sessions 16, 17, 18, 39, 44, 45 and 46.

`reasonableness` (default / quickEstimate / rebuildTest / exactAfterSale / estimateThenExact)
-> reasonableness, ALL 5. One form per step, because each teaches a DIFFERENT check: size,
rounding, rebuilding, and estimate-versus-exact. Sharing a form would have let a refresh hand two
steps the same check.

### Routes that test the claim rather than the wording
This tag is about CHECKING, so the routes check too, and refuse when the item's own premise fails:
- `default` verifies the bogus share really does exceed the whole pile before endorsing the
  size argument.
- `quickEstimate` confirms the rounded-up estimate genuinely sits above the exact total.
- `rebuildTest` rebuilds full×capacity + leftover and refuses unless it reconstitutes the total.
- `estimateThenExact` deliberately IGNORES the estimate printed in the prompt, which is the whole
  point of the item — the estimate is a sniff test, not a computation.

### Finding for the next session
**There is NO `numberLinePlace` branch in the variant gate** (grep returns 0). Three of the four
`pv-*` rounding tags use that widget, so the gate branch has to be written before those can be
declared — treat it as part of that session's work, not a surprise. Check how the gate handles an
unknown widget type first: it may skip silently, which would be worse than failing loudly.

Session grand total: 412 steps, 102 generators. All gates green.

## Next (G3 only)
1. `pv-*` rounding: round-10, round-100, round-half, estimation (5 steps each).
   THREE use numberLinePlace — write that gate branch first.
2. `fr-*` fractions: nine tags x 4 steps; two use numberLinePlace.
3. The remaining ~50 smaller G3 tags.

## Session 47 correction to the session-46 note
The claim that variants.test.ts has NO numberLinePlace branch was FALSE — a bad grep on my part.
The branch exists and is thorough (target must equal the answer, lie inside [min, max], and sit a
whole number of steps from the start). Twenty widget types have gate branches. No gate work was
needed before the pv-* rounding tags.
Lesson: when a grep returns 0 for something that ought to exist, re-run it a different way before
recording the absence as a finding. A false negative written into the handover is worse than no
note at all.

## Session 47: G3 halfway rounding and estimation — pv-* COMPLETE, G3 30.3% -> 36.1%

Coverage 1132 / 4,471 (25.32%). All gates green.

- `round-half` (default / tieTen / tieHundred / sumWithTie) -> round-half, ALL 5
  (sumWithTie serves k4 and ch1). Two forms build numberLinePlace widgets.
- `estimation` (default / estimateDiff / affordCheck / estimateSum) -> estimation, 4 of 5.
  REJECTED k1 ("when is rounding-to-estimate the RIGHT move?") — no numbers in the prompt.

**The `pv-*` rounding family is COMPLETE**: round-10 and round-100 were already served in an
earlier session (generators `round-ten` and `round-hundred`), and this session adds round-half
and estimation.

### Two corrections to my own earlier claims — both worth recording
1. **The session-46 note saying there is NO numberLinePlace gate branch was FALSE.** A bad grep.
   The branch exists and is thorough: it asserts the target IS the answer, lies inside [min, max],
   and sits a whole number of steps from the start. Twenty widget types have branches.
   Lesson: when a grep returns 0 for something that ought to exist, re-run it differently before
   writing the absence into the handover. A false negative there is worse than no note.
2. **My G3 survey listed round-10 and round-100 as unserved when they were already declared.**
   Caught because the dump marked them SERVED and the files showed variant keys on every step.
   Verified no orphaned declarations: round-ten, round-hundred, round-half and estimation all
   resolve. Lesson: cross-check the survey against the FILES before building, not after.

### Interesting form
`affordCheck` teaches safe-direction rounding — shrink what you have, grow what you owe, and if
the worst case still works the real case must too. The route performs exactly that argument and
REFUSES if the safe-direction comparison fails, so a draw where the reasoning does not actually
hold could never ship.

Session grand total: 421 steps, 104 generators.

## Next (G3 only)
1. `fr-*` fractions: equal-parts, build-fraction, nl-partition, nl-unit, nl-fraction,
   nl-beyond-one, equivalent, equiv-models, whole-as-fraction (4 steps each; two use
   numberLinePlace, whose gate branch exists and is well-tested).
2. The remaining ~50 smaller G3 tags.

## Session 48: G3 fractions begin — equal parts and building fractions — G3 36.1% -> 38.5%

Coverage 1140 / 4,471 (25.50%). +7 steps, all gates green on the first run.

- `equal-parts` (default / nameThePiece / cutsToPieces) -> equal-parts, 3 of 4.
  REJECTED k3 ("why do fractions DEMAND equal pieces?") — no numbers, fixed prose options.
- `build-fraction` (default / howManyUnits / whichSum / trayRemainder) -> build-fraction, ALL 4.

Cross-checked the survey against the FILES before building, per session 47 — these four were
genuinely unserved, unlike the pv-* pair.

### Catch: two data tables where one looked sufficient
The invented-name distractor ("a sixer") appends "er" to the NUMERAL, not the fraction name.
My first draft derived it from the fraction name and produced "a sixther" / "a tenther". Fixed by
storing the numeral word alongside the fraction name — the same store-both-forms rule that has now
appeared for singulars/plurals (s16), coefficient text (s34), article-carrying labels (s43) and
now fraction versus numeral names. The pattern is consistent: **whenever a generator needs two
different English forms of the same number or noun, store both; deriving one from the other has
failed every time it has been tried.**

`whichSum`'s route EVALUATES each candidate sum numerically and keeps whichever equals the target,
rather than matching a constructed string — so it verifies the arithmetic of every option.

Session grand total: 428 steps, 106 generators.

## Next (G3 only)
`fr-*` continues: nl-partition, nl-unit (numberLinePlace), nl-fraction, nl-beyond-one,
equivalent (numberLinePlace), equiv-models, whole-as-fraction — seven tags, 4 steps each.

## Session 49: G3 number-line fractions — G3 38.5% -> 40.9% (crossed 40%)

Coverage 1148 / 4,471 (25.68%). +7 steps.

- `nl-partition` (default / newMarks / flagCount) -> nl-partition, 3 of 4.
  REJECTED k3 ("why must the jumps be EQUAL?") — no numbers, fixed prose.
- `nl-unit` (default / fixMistake / whichCloser / howManyJumps) -> nl-unit, ALL 4.
  Two forms build numberLinePlace widgets; both passed the gate first time.

Jumps, marks and endpoints are three different counts, and the routes keep them apart by WALKING
the line: `newMarks` takes the jumps one at a time and counts the landings that are not the final
one; `flagCount` walks the landings with the far end included and the start excluded;
`howManyJumps` accumulates 1/n until it reaches 1. None applies an n−1 or n+1 formula.

### Catch: a shared table, third time of asking
The prose gate rejected "3ths" and "2th" — fraction names built from the numeral. This was the
THIRD generator needing fraction names (after equal-parts and build-fraction), so rather than add
a fourth local copy I promoted them to a shared FRACTION_NAME table beside ordinal() and
articleFor(), carrying BOTH singular and plural because "halves" is not "halfs".

That is the store-both-forms rule again, and the trigger for extracting a shared table is worth
naming: the second local copy is tolerable, the third means it belongs in one place.

Session grand total: 435 steps, 108 generators.

## Next (G3 only)
`fr-*` continues: nl-fraction, nl-beyond-one, equivalent (numberLinePlace), equiv-models,
whole-as-fraction — five tags, 4 steps each. Then the remaining ~50 smaller G3 tags.

## Session 50: G3 fractions on the line and past the whole — G3 40.9% -> 43.3%

Coverage 1156 / 4,471 (25.86%). +8 steps, both tags fully served, no rejections, all gates green
on the first run.

- `nl-fraction` (default / afterNthJump / whereLands / waterStops) -> nl-fraction, ALL 4.
- `nl-beyond-one` (default / jumpsToWhole / whereWhole / betweenWhich) -> nl-beyond-one, ALL 4.

Every route ACCUMULATES jumps of 1/b and watches where they land, comparing against successive
whole numbers — never reading the numerator off as an answer, and never applying floor(a/b).
That matters here because the traps ARE the shortcuts: reading the top as a whole number, or
stopping at the first whole.

Two routes verify the item's premise before answering: `whereLands` confirms numerically that the
drawn fraction really is one half before choosing "exactly halfway", and `whereWhole` confirms the
jumps land exactly on 1. A draw that broke either would fail loudly rather than agree.

Session grand total: 443 steps, 110 generators.

## Next (G3 only)
`fr-*` continues: equivalent (numberLinePlace), equiv-models, whole-as-fraction, then the
fractionCompare pair (compare-same-denom, compare-same-num) and the rest of the family.
NOTE: fractionCompare is a widget type not yet used by any generator in this workstream —
check its gate branch before building, and DO cross-check with a second grep this time.

## Session 51: G3 equivalent fractions and trading models — G3 43.3% -> 45.8%

Coverage 1164 / 4,471 (26.03%). +8 steps, both tags fully served, no rejections.

- `equivalent-fractions` (default / findMark / whoIsRight / cupMark) -> equivalent, ALL 4.
- `equiv-models` (default / tradeInto / fairTrade / tradeEighths) -> equiv-models, ALL 4.

Routes COUNT sub-pieces rather than scaling, and two of them verify the item's premise before
answering: `default` confirms the two printed fractions really are equal before agreeing they name
one point, and `whoIsRight` confirms the claim being rebutted is actually false. `fairTrade`
evaluates every option numerically and picks whichever equals the target — so a distractor that
accidentally WAS a fair trade would fail the gate rather than ship.

### Catches
1. Three prose-gate hits, all one family: fraction names built from digits ("8ths", "3ths") and
   "1 fourths". All fixed via the shared FRACTION_NAME table added in session 49 — which is
   exactly what that table is for.
2. **Two count-agreement slips the prose gate CANNOT see**: "1 of them make 4" and "your 1 taken
   become 2". The gate checks agreement after a COUNTING NOUN, and "them" and "taken" are not
   nouns. Found by reading. Reworded so the verb never has to agree with a drawn number, which is
   the more robust fix than getting the agreement right.
3. Freshness: fixing the trade target at EIGHTHS left only halves and quarters — three distinct
   problems. Drawing the target denominator as well (sixths/eighths/tenths/twelfths) keeps the
   same skill and widens the pool properly.

Session grand total: 451 steps, 112 generators.

## Next (G3 only)
`whole-as-fraction`, then the fractionCompare pair (compare-same-denom, compare-same-num).
fractionCompare is a widget type NOT yet used by any generator here — check its gate branch, and
verify with a SECOND grep before recording any absence (session 46 recorded a false one).

## Session 52: G3 whole-as-fraction and unit size — G3 45.8% -> 48.2%

Coverage 1172 / 4,471 (26.21%). +8 steps, both tags fully served, no rejections.

- `whole-as-fraction` (default / divideOut / whyOne / writeInParts) -> whole-as-fraction, ALL 4.
- `unit-size` (default / ribbonPiece / smallestOf / extraSharer) -> unit-size, ALL 4.

Routes FILL wholes one piece at a time and DEAL lengths out round the sharers one centimetre at a
time — never dividing, which is the operation both lessons are teaching.

### The catch: the independent route earned its keep outright
The 400-seed sweep failed with "expected '8/4' to be '4/2'". Both fractions equal 2 — my MCQ had
TWO correct options. The flipped distractor bot/wholes coincides with the answer exactly when
bot = wholes², and nothing else would have caught it: the label was distinct, the feedback was
true, and a reader skimming one sample would see a perfectly sensible question.

This is the clearest demonstration so far of why the route must recompute rather than pattern-match
the expected string. It did not check that my answer looked right; it checked which option WAS
right, and found two.

Also: "8/4 = ?" is seven characters and the gate requires a prompt longer than eight — a small
reminder that terse maths prompts have a floor as well as terse feedback.

READING caught "A 11-way split" — articleFor() exists for exactly this.

### fractionCompare gate branch: CONFIRMED ABSENT (two independent checks)
`grep -c fractionCompare src/lib/variants.test.ts` returns 0, and the specific
`parsed.type === "fractionCompare"` pattern finds nothing — while schema.ts has 6 occurrences and
evaluate.ts has 3. So the widget exists and is evaluable, but has no gate branch. Writing one is
required before compare-same-denom / compare-same-num can be served. (Checked twice deliberately
after the false negative recorded in session 46.)

Session grand total: 459 steps, 114 generators.

## Next (G3 only)
1. Write the `fractionCompare` gate branch, then serve compare-same-denom and compare-same-num.
2. Or continue with engine-free tags: same-whole (mcq), time-relative, mass, and the rest of md-*.

## Session 53: fractionCompare GATE BRANCH written + two comparison tags — G3 48.2% -> 50.3%

Coverage 1179 / 4,471 (26.37%). **G3 crossed 50%.** +7 steps.

### Wrote the fractionCompare gate branch
The widget existed in schema.ts and evaluate.ts but had no branch in variants.test.ts (confirmed
by two greps in s52). The branch now:
- RE-DERIVES which side is larger by integer cross-multiplication and insists the declared answer
  matches — the schema's own comment says integrity "re-derives from the fractions", so that is
  precisely what it enforces. A generator that merely asserted its own answer would fail here.
- requires each numerator ≤ its denominator, so both bars are drawable;
- requires exactly the two NON-answer choices to carry a diagnosis, and the answer's own slot to
  be absent, since it can never be shown;
- checks every diagnosis clears the 25-character floor and the negation ban;
- requires any benchmark to sit strictly inside the bar.

Twenty-one widget types now have gate branches.

- `compare-same-denom` (default / howManyMore / relayLegs) -> compare-same-denom, 3 of 4.
  REJECTED k3 ("why can the TOPS settle it?") — no numbers, fixed prose.
- `compare-same-num` (default / whoIsRight / rankThree / pizzaSlices) -> compare-same-num, ALL 4.

Both comparison routes use the SAME integer cross-multiplication, with no special case for
matching tops or matching bottoms — the two lessons feel different to a learner but are one
computation underneath, and the route says so.

### Catch
READING: "Ivy ate 3/6 of his." I hardcoded "her" for the first name and "his" for the second, so
drawing Ivy into the second slot mismatched. Pronouns now stored WITH the names — the
store-both-forms rule again, this time for gender. That rule has now covered singulars/plurals,
coefficient text, article-carrying labels, fraction-vs-numeral names, and pronouns.

Session grand total: 466 steps, 116 generators.

## Next (G3 only)
1. `same-whole` (mcq) — the last fr-* tag.
2. Then md-* measurement: time-relative, elapsed-time (clockSet), mass, and the rest.

## Session 54: fr-* COMPLETE + md-* begins — G3 50.3% -> 53.9%, +11 steps

Coverage 1191 / 4,471 (26.64%). Three generators in one session, all three gates green on the
first pass.

**The `fr-*` fraction family is COMPLETE** — eleven tags across sessions 48-54.

- `same-whole` (default / pizzaClaim / whichPair) -> same-whole, 3 of 4. REJECTED k3.
- `time-relative` (default / minutesTo / quarterTo / waitTime) -> time-relative, ALL 4.
- `mass` (default / kgToG / whichHeavier / mixedTotal) -> mass, ALL 4.

Routes COUNT rather than compute throughout: minutes are walked round the clock face one at a
time instead of subtracting from 60; grams are built by repeated addition of whole kilograms and
converted back by removing 1,000 at a time.

Two routes verify the item's premise before answering. `pizzaClaim` confirms that 1/small really
would beat 1/big on ONE whole — so the fault being taught really is the mismatched wholes, not a
broken fraction comparison. `quarterTo` counts fifteen minutes back from the hour and refuses if
that does not land on :45.

### Catch
READING: "a eighth is a eighth". `articleFor()` decides from a NUMERAL, but here the article
precedes a WORD, so the test has to be on the word's first sound. Both the generator and the
route needed it — a reminder that any string the route reconstructs must be fixed in the same
edit as the generator.

Session grand total: 477 steps, 119 generators.

## Next (G3 only)
`md-*` measurement continues: elapsed-time (clockSet), length/capacity, perimeter/area, and the
remaining ~45 G3 tags. Note `clockSet` — check whether that widget has a gate branch (21 types
do) before committing to it.

## Session 55: G3 mult-* RESUMED (my s46 "complete" was WRONG) — G3 53.9% -> 57.6%, +12 steps

Coverage 1203 / 4,471 (26.91%). Three generators, all gates green.

### CORRECTION: mult-* was NEVER complete — session 46 declared it done in error
Session 46 concluded "mult-* family COMPLETE" because `g12.mts | grep mult-` returned nothing.
That tool prints a TRUNCATED list, so the tags were below the cutoff, NOT served. In fact TWELVE
mult-* files still had unserved steps (43 total). Built a new checker, `scripts/measure/unserved.mjs
<prefix>`, that reads the lesson FILES directly and reports every unserved step. Use it — never a
truncated survey — to judge whether a family is complete. This is the second false-completeness
call caught this way (pv-* in s47 was the mirror image: falsely UNSERVED).

- `mult-meaning` (default / whichOperation / sheetsMinus) -> mult-01-01, 4 of 5.
- `times-2` (default / doubleIt / twiceDaily / ferryDouble) -> mult-03-01, ALL 4.
- `double-double` (default / timesEight / whichFact / spiderLegs) -> mult-03-03, ALL 4.

### Catches, one of them a real mathematical error
1. **A FALSE doubling narrative.** spiderLegs first drew 6-legged beetles, and the fallback said
   "double 5 to 10, again to 20, and again to 30" — which is FALSE: three doublings reach ×8 (=40),
   not ×6. The whole tag IS the doubling ladder, so the creature MUST have 8 of its part. Swapped
   the beetle for an octopus (8 arms). A reminder that when the method is fixed (three doublings),
   the scenario's numbers are not free — they have to fit the method.
2. **Pronoun hardcoded as "she"** while the name list mixed genders — the exact session-53 bug.
   Reworded to avoid the pronoun entirely rather than storing subject pronouns, since the sentence
   read fine without it.
3. "A octopus" — article on a vowel word. Freshness: the ×4 default pool needed widening to 3-24.

Session grand total: 489 steps, 122 generators.

## Next (G3 only)
Remaining mult-*: commutativity (buildExpression), times-5-10... wait, those are done.
Use `node scripts/measure/unserved.mjs mult-` for the TRUE list: 10 files, 31 steps —
mult-01-05 (commutativity, buildExpression), mult-03-05 (distributive), mult-04-01/02/04,
mult-05-01/02/04, mult-03-04/k3, mult-04-04/k3. Then md-* and the rest.

## Session 56: G3 `mult-*` — commutativity, distributive, operation choice — 57.6% -> 61.2%

Coverage 1203 -> 1215 / 4,471 (26.91% -> 27.18%). G3 190 -> 202 / 330. +12 served
steps, three generator families, zero authored-prose changes.

- `commutativity` (default / flipSolve / arrayBuild / packsPlus) -> `mult-01-05`, ALL 4.
  The buildExpression form accepts either factor order. The independent route reconstructs both
  arrays by repeated addition and refuses the item if turning the fact changes the total.
- `distributive` (default / factSplit / missingPiece / rowsSold) -> `mult-03-05`, ALL 4.
  Every split rebuilds the cut factor and keeps the untouched factor in both pieces. The numeric
  routes count groups independently instead of repeating the generator's multiplication.
- `op-choice` (default / equalGroupsFact / splitFact / soldFromGroups) -> `mult-04-01`, ALL 4.
  The operation comes from story structure: repeated equal groups build a total, equal sharing
  splits a known total, and a sale removes from a total already built.

### Catches

1. The independent route initially searched for lowercase `same`, while the generated prompt says
   uppercase `SAME`. The route is now case-insensitive. This was a genuine gate defect: correct
   generated items would have failed solely because the verifier parsed its own surface wrongly.
2. Reading improved generated wording from rows that "sell out" to rows that "are sold". No lesson
   content changed.
3. `gen:manifest` found pre-existing generated-artifact drift: the archive contained 1,129 lesson
   files, but its manifest and registry block still listed 1,126. Regeneration added `tse-02-04`,
   `tse-02-05`, and `ft-05-04` to the manifest/PLAN/notebook index and made figure coverage truthful
   at 99.76% instead of the stale 100%.

### Verification

- Changed TypeScript syntax-transpile clean.
- All 12 forms passed independent answer, trap, surface, and determinism checks over 36,000 draws
  (1,000 seeds x 3 bands per form).
- The exact prose-rule replica passed 18,000 changed-form draws.
- All 1,225 content JSON files parsed; declarations resolve with surface parity across all bands.
- Registration, manifest, prerequisites, flagship ranking, scaffold audit, and curriculum inventory
  completed.

The deployable archive contains no `node_modules`. Repeated locked dependency restores failed with
HTTP 503 from the internal npm registry, so the package-backed gates were not rerun in this container:
`typecheck`, full Vitest, schema/pedagogy through `tsx`, lint, build, Playwright, `npm audit`, and
`gen:state`. This is recorded as an infrastructure block, not as green.

Session running total: 501 steps, 125 generator families added by this workstream.

## Next (G3 only)

`node scripts/measure/unserved.mjs mult-` now reports 7 files / 19 steps: unknown-position (4),
addition-patterns (4), mult-patterns (4), multiples (3), two-step (2), equal-groups (1), and
times-9 (1). Start with `unknown-position`, then the `mult-05-*` pattern families.

## Session 57: G3 table structure + unknown slots — 61.2% -> 64.8%, +12 steps

Coverage 1215 -> 1227 / 4,471 (27.18% -> 27.44%). G3 202 -> 214 / 330. +12 served
steps, three generator families, zero authored-prose changes.

- `unknown-position` (default / missingCount / totalUnknown / goodPerGroup) -> `mult-04-02`, ALL 4.
  Every form exposes the same count × size = total frame and changes which slot is missing. The
  challenge first reconstructs one row, then removes broken chairs inside that row.
- `addition-patterns` (default / parityPredict / doubleDiagonal / additionTableWalk) ->
  `mult-05-01`, ALL 4. The routes use swapped row-column positions, pairing, repeated +2, and
  one-cell table movement rather than merely replaying the generator's printed arithmetic.
- `mult-patterns` (default / halfRow / rowSubset / timesTableStep) -> `mult-05-02`, ALL 4.
  The routes rebuild products by repeated equal groups, verify exact row divisibility, and keep all
  generated table rows and columns inside the Grade-3 1–10 table.

### Catches

1. The first doubles-diagonal prompt derived ordinals by appending `th`, producing `3th`. It now
   uses the shared `ordinal()` helper, including the 11th–13th exceptions.
2. One feedback path could read “24 removes 1 chairs.” Rewording removed drawn-number agreement
   from the sentence instead of expanding a fragile noun list.
3. The first multiplication-pattern ranges could generate 14s and 15s rows. The mathematics was
   valid but the surface exceeded this lesson's standard 1–10 multiplication table. The row pairs,
   half-row positions, and downward table walks are now bounded so every displayed row/column is
   at most 10.

### Verification

- Changed TypeScript syntax-transpile clean.
- All 12 forms passed independent answer, trap-collision, determinism, surface, prose, and
  multiplication-table-boundary checks over 36,000 draws (1,000 seeds × 3 bands per form).
- The exact corpus prose-rule replica passed 1,800 changed-form draws.
- Every new declaration clears the resolver freshness floor; all 1,225 JSON files parse.
- The 1,005 eligible declarations pass 3,015 surface-parity checks across support, core, and stretch.
- Registration, manifest, prerequisites, flagship ranking, scaffold audit, and curriculum inventory
  completed without content drift.

The deployable archive contains no `node_modules`. Locked dependency restoration again failed with
HTTP 503 from the internal npm registry, so the package-backed gates were not rerun in this container:
`typecheck`, full Vitest, schema/pedagogy through `tsx`, lint, build, Playwright, `npm audit`, and
`gen:state`. This remains an infrastructure block, not a green result.

Session running total: 513 steps, 128 generator families added by this workstream.

## Next (G3 only)

`node scripts/measure/unserved.mjs mult-` now reports 4 files / 7 steps: `multiples` (3),
`two-step` (2), `equal-groups` (1), and `times-9` (1). Finish those seven to make the `mult-*`
family genuinely complete, then return to `md-*` measurement.


## Session 58: G3 COMPLETE — 64.8% -> 100.0%, +116 G3 steps

Coverage 1227 -> 1344 / 4,471 (27.44% -> 30.06%). G3 214 -> 330 / 330. This session added
127 explicit declarations and 32 generator families, with zero authored lesson-prose changes.
Eleven of those declarations replaced ambiguous automatic tag matches that had already counted as
refreshed; a newly registered compatible tag also resolves one G2 step, so the net overall gain is
117 while the G3 gain is 116.

### Completed families

- Finished the true `mult-*` remainder: 7 steps across multiples, two-step reasoning, equal groups,
  and the ×9 pattern.
- Finished all remaining `md-*`: 44 steps spanning clocks, elapsed time, volume, perimeter,
  missing sides, pictographs, bar graphs, line plots, tiling, area, distributive area, and
  area-versus-perimeter.
- Finished all remaining `pv-*`: 42 steps spanning place value, expanded form, comparison,
  unit trading, mental addition, regrouping, estimate checks, products by tens, zero patterns,
  and tens-based word problems.
- Re-audited every Grade-3 lesson file rather than trusting tag-level coverage. Added explicit,
  varied fraction and geometry assessments for all 34 undeclared steps across unit fractions,
  numerator/denominator meaning, equal partitions, shared wholes, attributes, quadrilaterals,
  hierarchy, sorting rules, non-examples, shape partitions, and parts-as-fractions.

The authoritative file checker now reports zero unserved steps for `mult-*`, `md-*`, `pv-*`,
`fr-*`, and `geo-*`. The grade measure reports exactly **330/330**.

### Important audit correction

The final audit found that several formerly “rejected” fixed-prose fraction items were nevertheless
being counted because `variantForStep` automatically matched their concept tags to a default
generator. That made coverage numerically green without proving that the generated surface preserved
the assessment's intent. Session 58 replaces those implicit matches with named forms and explicit
lesson declarations. Conceptual items now vary the mathematical evidence—lengths, partition counts,
fraction pairs, side counts, dimensions, and angle conditions—rather than merely shuffling fixed prose.

### High-value catches

1. A place-value prompt could ask what a repeated digit was “worth” when that digit appeared in two
   positions. The draw now guarantees the requested digit occurs uniquely.
2. Expanded-form distractors could be different strings but mathematically equivalent. Digits and
   swaps are now guarded by value, not label appearance.
3. A nearest-hundred estimate could equal the exact answer or a half-rounded distractor. The draw now
   requires all diagnostic values to be distinct.
4. A ticket-change misconception could equal the correct change when the payment was twice the cost.
   The scenario is now drawn under a three-value uniqueness guard.
5. Returned unit-fraction pieces and shaded/unshaded denominator traps could collide exactly at half.
   Both generators now reject those symmetric draws.
6. Several generated strings exposed agreement or feedback hazards: “1 ones,” “1 tens,” “1 wholes,”
   and feedback beginning with a blunt negation. They were rewritten around place-value roles and
   mathematical conditions rather than patched with brittle plural rules.
7. The ×9 form and several measurement/data pools initially varied too little or admitted duplicate
   distractors. Their mathematical dimensions and guards were widened before acceptance.

### Verification

- 26 first-batch forms: 234,000 draws.
- 25 measurement/data forms: 225,000 draws.
- 42 place-value/computation forms: 378,000 draws.
- 34 final fraction/geometry forms: 306,000 draws.
- **Total: 1,143,000 independent deterministic draws across 127 forms.**
- All 1,225 content JSON files parse.
- 1,143 declarations passed 10,287 deterministic surface-resolution checks across support, core,
  and stretch.
- Changed TypeScript files syntax-transpile clean.
- Registration, 1,129-lesson manifest, skill prerequisites, flagship ranking, scaffold audit, and
  curriculum inventory completed; inventory remains PASSIVE=0 and NOLAB=0.

The archive contains no `node_modules`. `npm ci --ignore-scripts` hung without producing registry
output and was terminated after three minutes, so package-backed typecheck, full Vitest,
schema/pedagogy, lint, build, Playwright, audit, and `gen:state` remain infrastructure-blocked—not green.

Session running total: 640 explicit step declarations and 160 generator families added by this workstream.

## Next

The G3-only directive is complete. Current lowest coverage bands are G12 (21.1%), G11 (21.4%), and
G4 (21.5%). Choose the next grade deliberately rather than continuing by momentum.


## Session 59: G7 scale drawings, circles, and angle totals — 29.0% -> 41.1%, +30 refreshed

Coverage 1344 -> 1374 / 4,471 (30.06% -> 30.73%). Full G7 coverage 72 -> 102 / 248
(29.0% -> 41.1%). This session added 28 explicit declarations and 7 generator families, with zero
authored lesson-prose changes. The two-step difference between declarations and refreshed coverage
comes from same-surface `g7-circumference` and `g7-circle-area` capstone checks that now resolve safely
through exact generator tags.

### Added forms

- `g7-read-scale` (default / scaleFence / scaleMeaning / scaleCompare): drawing-to-real conversion,
  scale interpretation, and real-length differences.
- `g7-scale-to-actual` (default / drawFence / scaleDirection / drawCombined): real-to-drawing
  division, operation choice, and combined lengths.
- `g7-scaled-area` (default / unitAreaScale / areaError / roomScaledArea): squared scale factors,
  unit-area meaning, error diagnosis, and real floor area.
- `g7-circle-parts` (default / matchCircleParts / radiusToDiameter / radiusDifference): diameter-radius
  conversion, varied definition/formula matching, and comparing radii.
- `g7-circumference` (default / circApprox / circFormulaWhy / circRadius): exact π coefficients,
  stated 3.14 approximation, formula equivalence, and radius-based contexts.
- `g7-circle-area` (default / areaFromDiameter / circleUseCase / cylinderFromBase): radius and
  diameter area, boundary-versus-covering decisions, and circular-base volume.
- `g7-complementary` (default / angleSort / noAngleComplement / cornerThree): supplementary
  subtraction, complementary/supplementary classification, complement limits, and three-angle corners.

### Important correction

The first inventory pass looked only at the `geometry-g7` course and therefore described Grade 7 as
48 assessments. Grade 7 actually spans five courses and 248 eligible assessments. The full-grade
runtime measure is now the source of truth: 102/248 refreshed, 146 unserved. `geometry-g7` alone is
35/48, with 13 remaining.

### Catches

1. Human reading found a room could become 28 m by 70 m under a broad generic scale range. The
   `roomScaledArea` form now has a dedicated plausible range.
2. The room-comparison form could imply 126-meter rooms. Its scale and drawing-length ranges are now
   context-specific rather than inherited from generic map distances.
3. Circle-part matching could have become a fixed shuffle of one memorized definition set. It now
   varies valid definition, formula, and relationship evidence for radius, diameter, and circumference
   while preserving an independently reconstructed label-to-label answer.
4. The grade-level scope error above was caught before packaging; all coverage and next-target records
   were recomputed across all five Grade-7 courses.

### Verification

- 28 forms passed 252,000 deterministic draws (3,000 seeds × 3 bands per form).
- Independent routes recomputed every numeric, MCQ, match-pair, and bucket-sort answer from printed
  evidence; answer/trap collisions, duplicate labels, empty buckets, position leaks, and malformed
  feedback were rejected.
- The corrected context ranges passed a complete second 252,000-draw run.
- All 1,171 declarations passed 10,539 deterministic surface-resolution checks.
- All 1,225 content JSON files parse.
- Semantic comparison with session 58 confirms the seven lesson files changed only by added `variant` keys.
- Registration, manifest, prerequisites, flagship ranking, scaffold audit, and inventory completed.

Dependency restoration again stalled silently at the package registry. The partial `node_modules`
was removed, so package-backed typecheck, full Vitest, schema/pedagogy, lint, build, Playwright,
audit, and `gen:state` remain infrastructure-blocked rather than green.

Session running total: 668 explicit step declarations and 167 generator families added by this workstream.

## Session 60: whole-application hardening and bug repair

This session audited the full application rather than adding assessment variants. Coverage remains
**1,374/4,471 (30.73%)**, Grade 7 remains **102/248**, and `VARIANT_GENERATORS.length` remains 295.
One authored-prose sentence changed because it contained a genuine mathematical falsehood in
`co-03-02/k2`: the feedback no longer claims `1 = √(16 − 9)` and instead diagnoses the actual
subtract-the-side-lengths misconception.

### Root-cause fixes

- Completed and hardened account flows: reset page, scanner-safe magic/verification confirmation,
  atomic single-use tokens, normalized email handling, production `AUTH_PEPPER` fail-closed behavior,
  bounded passwords/tokens, truthful 503 states, and HttpOnly-cookie session restoration across the
  entire shell.
- Added an offline-logout tombstone so a failed network call cannot make the UI sign the user back in;
  the server cookie is retained until the durable session row can be revoked, then both are cleared.
- Scoped sync idempotency by account+learner, rechecked it inside an IMMEDIATE transaction, bounded
  keys, validated profile documents, handled corrupt durable/cached JSON, made transport throws
  release the in-flight lock, and isolated optional lesson-scratch failures from profile sync.
- Replaced brittle localStorage calls with safe tab-memory fallback across learning state, roster,
  resume, teacher, auth mirror, entitlement, narration, device, and sync metadata. Fixed stale mirror
  resurrection after another tab removes a key, and added runtime validation for stored rosters and
  profiles with a narrow legacy `correctStreak` repair.
- Bounded every JSON API body and high-risk identifier; rejected impossible dates and impossible
  grades; strengthened learner-PIN and classroom rate limits; made corrupt learner exports complete
  with recoverable raw data rather than 500.
- Made catalog/skill-first resolution deterministic from the manifest instead of filesystem order.
- Removed duplicate Teach navigation, added Daily/Review/Notebook failure+retry states, aborted stale
  requests, added route error/404 surfaces, made button types explicit, fixed active-profile motion
  bootstrap, and made displayed server classroom codes resolvable in the local join path.
- Removed author-machine absolute paths from verification tools and added a dependency-free
  `validate:native` release gate. Generated product-state claims are now evidence-based rather than
  hardcoded green.

### Verification

- `validate:native`: 1,231 JSON files, 546 source files, 678 local imports, 38 internal links,
  1 literal asset, 133 native buttons, and 15 API routes passed.
- 1,225 content JSON files parsed; 264 TypeScript files syntax-transpiled cleanly.
- SQLite migrations 001–003 passed both fresh-install and 002→003 upgrade smoke tests; the legacy
  idempotency row was preserved in the unreachable `legacy` scope.
- Pure runtime smokes passed for strict calendar dates, sync-profile validation, legacy profile
  compatibility, malformed-profile rejection, blocked storage, and external-removal behavior.
- Registration, 1,129-lesson manifest, 1,165-skill acyclic prerequisites, flagship ranking/tiers,
  scaffold audit, curriculum inventory, MCQ inventory, and product-state generation all completed.

The archive excludes `node_modules`. `npm ci` failed with repeated HTTP 503 responses from the
internal package registry, so semantic `tsc`, Vitest, Zod content/pedagogy, lint, build, Playwright,
and `npm audit` remain infrastructure-blocked and are not labeled green. See
`APP_AUDIT_SESSION_60.md` and `KNOWN_ISSUES.md`.


## Session 61: G7 geometry completion and proportional foundations — 41.1% -> 51.6%, +26 refreshed

Coverage 1374 -> 1400 / 4,471 (30.73% -> 31.31%). Full G7 coverage 102 -> 128 / 248
(41.1% -> 51.6%). This session added 26 explicit declarations and five generator families, with
zero authored lesson-prose changes. `geometry-g7` is now complete at 48/48;
`proportional-relationships` rises from 7/48 to 20/48.

### Added forms

- `g7-vertical-angles` (default / adjacentObtuse / whyVertical / acrossAlgebra): direct vertical-angle
  equality, adjacent linear pairs, justification, and algebraic angle expressions.
- `g7-triangle-inequality` (default / ruleApplied / upperBoundary / wholeCount / frameCheck): valid-side
  ranges, strict inequality, exact boundary failure, integer-count reasoning, and contextual frames.
- `g7-cross-sections` (default / prismParallel / matchCrossSections / twoCuts): base-parallel pyramid
  sections, same-size prism sections, varied solid-section matching, and ordered two-cut reasoning.
- `pr-unit-rate-g7` (nine named forms): whole, proper-fraction, and mixed-number rates in travel, laps,
  and recipe contexts, preserving authored numeric and MCQ surfaces.
- `pr-test-proportional-g7` (default / proportionalFraction / nonProportional / proportionalChallenge):
  whole and fractional constants, exact nonproportional counterexamples, and varied table evidence.

### High-value catches

1. The “multiply only the numerators” unit-rate trap could equal the correct whole-number rate
   (for example, 4/5 divided by 1/5). Curated pools now guarantee answer and diagnostic traps remain
   mathematically distinct.
2. The first unit-rate implementation rebuilt candidate fractions through nested loops on every draw.
   It was mathematically correct but unnecessarily expensive; static curated pools preserve variety
   and eliminate repeated search work.
3. Unconstrained mixed-rate cases could yield awkward results such as 1 53/64. The accepted pool now
   produces readable, instructionally useful Grade-7 mixed numbers.
4. A triangle case could tie for the longest side while the prompt said “the longest.” The generator
   now makes the named side uniquely longest.
5. Authored `g7-04-01/k3` is semantically under-specified (“Which CANNOT be the third side?”). The
   generated form asks for the exact upper-boundary length equal to the two known sides' sum, without
   altering frozen lesson prose.

### Verification

- 26 forms passed **234,000 deterministic draws** (3,000 seeds x 3 bands per form).
- Independent routes recomputed every answer from displayed evidence; answer/trap collisions, duplicate
  options, feedback faults, determinism failures, matching leaks, and invalid classifications were rejected.
- All 1,197 declarations passed 10,773 deterministic surface-resolution checks.
- Semantic comparison against session 60 confirms only `variant` keys changed in the eight lesson files.
- `validate:native` passed: 1,231 JSON files, 546 source files, 678 local imports, 38 internal links,
  1 literal asset, 133 native buttons, and 15 API routes.
- Registration, 1,129-lesson manifest, 1,165-skill acyclic prerequisites, flagship ranking, scaffold
  audit, curriculum inventory, and product-state generation completed.

Dependency restoration hung silently for the bounded install window. The partial `node_modules` was
removed, so package-backed typecheck, full Vitest, schema/pedagogy, lint, build, Playwright, audit, and
`gen:state` remain infrastructure-blocked rather than green.

Session running total: 694 explicit step declarations and 172 generator families added by this workstream.

## Session 62: G7 proportional relationships complete — 51.6% -> 62.9%, +28 refreshed

Coverage 1400 -> 1428 / 4,471 (31.31% -> 31.94%). Full G7 coverage 128 -> 156 / 248
(51.6% -> 62.9%). This session added 28 explicit declarations and five generator families, with
zero authored lesson-prose changes. `proportional-relationships` is now complete at 48/48, joining
`geometry-g7` at 48/48.

### Added forms

- `pr-constant-k-g7` (`constantWhole`, `constantFraction`, `constantUse`, `constantApply`): identify
  whole and fractional constants of proportionality, interpret `y = kx`, and apply a constant to a
  selected input without allowing additive-operation traps to collide with the product.
- `pr-graph-rate-g7` (`graphUnitPlot`, `graphRateRead`, `graphStoryRead`, `graphStoryPlot`): plot and
  read unit-rate points in generic and contextual graphs, preserving the authored numeric and plot
  surfaces.
- `pr-add-percent-g7` (`percentTip`, `percentTax`): additive percent applications with separate,
  realistic pools for restaurant tips and sales tax.
- `pr-price-adjust-g7` (`priceMarkup`, `priceMarkdown`): compute marked-up and discounted prices from
  printed evidence with diagnostic base-price and direction traps.
- `pr-percent-change-g7` (`percentIncrease`, `percentDecrease`): recover percent change from initial
  and final values, with increase/decrease direction preserved explicitly.

### High-value catches

1. In `constantApply`, the “add k and x” misconception could equal the correct product when `k = 2`
   and `x = 2`. The target is now the largest selected input, guaranteeing the diagnostic trap stays
   distinct without weakening the misconception.
2. The independent graph route originally recognized only generic “unit rate N” prompts and failed
   on the new page, gallon, loaf, and travel contexts. It now derives the expected coordinate from
   every printed context rather than depending on generator internals.
3. The first graph plot form changed only one number. It now varies meaningful axes and units, adding
   an instructional dimension instead of widening a numeric range mechanically.
4. A shared 10–25% pool made sales-tax questions reach unrealistic 20–25% rates. Tips retain that
   range; tax is constrained to 5–12%.
5. Human reading caught awkward wording (“A restaurant bill costs…”); context records now carry
   complete natural-language leads.

### Verification

- 28 forms passed **252,000 deterministic independent-answer draws** (3,000 seeds × 3 bands per form).
- All **1,225 declarations** passed **18,375 declaration checks**; all **9,603** generator/form/band
  builds resolved deterministically with surface preservation and adequate freshness.
- Semantic comparison against session 61 confirms exactly 28 `variant` keys were added across seven
  lesson files and no authored content changed.
- All 1,231 JSON files parse; all 265 TypeScript/TSX/MTS files parse with zero syntax diagnostics.
- Native integrity, registration, manifest, prerequisites, flagship ranking, scaffold audit,
  curriculum inventory, and product-state generation pass.

`npm ci --ignore-scripts --prefer-offline` again hung without output beyond the bounded window and
left an orphaned process. It and the partial dependency tree were removed. Package-backed typecheck,
full Vitest, schema/pedagogy, lint, build, Playwright, audit, and `gen:state` remain infrastructure-
blocked rather than green.

Session running total: 722 explicit step declarations and 177 generator families added by this workstream.

## Session 63: G7 rational-number operations complete — 62.9% -> 74.6%, +29 refreshed

Coverage 1428 -> 1457 / 4,471 (31.94% -> 32.59%). Full G7 coverage 156 -> 185 / 248
(62.9% -> 74.6%). This session added 29 explicit declarations and four generator families, with
zero authored lesson-prose changes. `rational-number-operations` is now complete at 48/48, joining
`geometry-g7` and `proportional-relationships`.

### Added families

- `g7-signed-addition`: same-sign positive/negative addition, different-sign magnitude reasoning,
  and mixed review, with distinct forms for every authored step so same-seed practice cannot collapse.
- `g7-signed-multiply-divide`: same/different-sign products and quotients plus odd-negative triple
  products, preserving the authored operation-confusion and sign-rule diagnoses.
- `g7-signed-decimal-add`: exact tenths/hundredths same-sign addition with sign and subtract-instead
  traps kept mathematically distinct.
- `g7-mixed-rational`: signed fraction multiplication, integer multiplication, overdraft reversals,
  and trail displacement, preserving MCQ and contextual numeric surfaces.

### High-value catches

1. `−2 × (−2)` made the wrong-sign trap and add-instead-of-multiply trap both `−4`; the parameter
   pair is now rejected before an item can be emitted.
2. The first declaration pass reused a form within one concept tag. Because item-level seeding uses
   concept tag + generator + form, repeated forms would receive identical same-seed questions. Every
   one of the 29 steps now has a distinct pedagogical form within its tag.
3. “Large” and “challenge” labels initially changed only the seed, not the difficulty range. They now
   draw from genuinely larger magnitude bands while retaining the same conceptual demand.
4. Reversed account fees could approach the entire overdraft and read unrealistically. Fees now use
   a bounded $0.50–$10 core pool ($15 stretch maximum) and always leave a meaningful negative balance.

### Verification

- 29 forms passed **261,000 deterministic independent-answer draws** (3,000 seeds × 3 bands per step).
- All **1,254 declarations** passed **18,810 declaration checks**; all **9,891** generator/form/band
  builds resolved deterministically with surface preservation.
- Semantic comparison against session 62 confirms exactly 29 `variant` keys were added across eight
  lesson files and no authored content changed.
- All 1,231 JSON files parse; all 265 TypeScript/TSX/MTS files parse with zero syntax diagnostics.
- Native integrity and registration pass.

Session running total: 751 explicit step declarations and 181 generator families added by this workstream.

`npm ci --ignore-scripts --prefer-offline` again hung beyond the bounded install window and produced no usable dependency tree. The process and partial `node_modules` were removed. Package-backed typecheck, full Vitest, schema/pedagogy, lint, build, Playwright, audit, and `gen:state` remain unverified rather than green.

## Session 64: G7 two-step equations complete — 74.6% -> 85.9%, +28 refreshed

Coverage 1457 -> 1485 / 4,471 (32.59% -> 33.21%). Full G7 coverage 185 -> 213 / 248
(74.6% -> 85.9%). This session added 28 explicit declarations and five generator families, with
zero authored lesson-prose changes. `two-step-equations` is now complete at 56/56, joining the three
previously completed Grade-7 courses.

### Added families

- `g7-tse-expression-build`: distribution, combining signed like terms, and distribute-then-combine
  token-bank forms, with each misconception preserved as an algebraically distinct wrong build.
- `g7-tse-evaluate-distribution`: substitution into a distributed expression with lost-sign and
  stop-before-parentheses-completion diagnoses.
- `g7-tse-context-equation`: a physically coherent signed-depth equation whose solution is positive
  elapsed time, replacing the generated form of the authored negative-time submarine scenario.
- `g7-tse-balance-solve`: positive integer two-step equations on the tile balance, with an explicit
  final-state answer in the manipulative's own state shape.
- `g7-tse-inequality-build`: positive- and negative-coefficient inequalities, including direction
  reversal, first-step stopping, and a meaningful baseline-change context.

### High-value catches

1. In `a(x-b)` evaluation, the lost-negative-sign trap and stop-after-`a×x` trap became identical
   whenever `x = b-x`. The draw now rejects equal substitution and gap values.
2. Two existing positive `eq-two-step` declarations shared the same generator/form and could emit an
   identical equation for the same seed. A disjoint `secondForm` coefficient range now prevents it.
3. Two existing `inverse-pipeline` declarations could emit the same two-operation machine. Its new
   `secondForm` uses a disjoint multiplicative operand and is structurally validated as a true inverse.
4. Human review caught “Remove 1 units” in balance feedback; singular/plural agreement is now exact.
5. The authored submarine equation solves to negative minutes. The generated contextual form keeps
   signed depth but models descent consistently, so elapsed time is positive and physically meaningful.

### Verification

- 28 forms passed **252,000 deterministic independent-answer draws** (3,000 seeds × 3 bands per form).
- The two existing same-seed hardening forms passed **18,000** additional equation/inverse checks.
- All **1,282 declarations** passed **19,230 declaration checks**; all **10,206** generator/form/band
  builds resolved deterministically with surface preservation.
- Semantic comparison against session 63 confirms nine lesson files changed only through variant
  declarations; no authored content changed.
- All 1,231 JSON files parse; all 265 TypeScript/TSX/MTS files parse with zero syntax diagnostics.
- Native integrity and registration pass.

Session running total: 779 explicit step declarations and 186 generator families added by this workstream.

A bounded `npm ci --ignore-scripts --prefer-offline` attempt failed with HTTP 503 from the internal
registry while fetching `zustand`. No usable dependency tree remained. Package-backed typecheck, full
Vitest, schema/pedagogy, lint, build, Playwright, audit, and `gen:state` remain unverified rather than green.

## Session 65: G7 sampling and probability complete — 85.9% -> 100%, +35 refreshed

Coverage 1485 -> 1520 / 4,471 (33.21% -> 34.00%). Full G7 coverage 213 -> 248 / 248
(85.9% -> 100%). This session added 35 explicit assessment declarations and eight generator families,
with zero authored lesson-content changes. `sampling-and-probability` is now complete at 48/48, so
all five Grade-7 courses are fully refreshed.

### Added families

- `g7-sp-sample-estimate` (six forms): representative-sample estimates across civic, school, retail,
  workplace, quality-control, and event contexts.
- `g7-sp-sampling-bias` (three forms): random population frames versus convenience and voluntary
  response samples.
- `g7-sp-sample-reliability` (three forms): larger random samples and repeated-sample clustering.
- `g7-sp-gap-units` (eight forms): absolute mean gaps divided by a variability measure.
- `g7-sp-overlap-interpret` (four forms): heavy/moderate/little overlap interpreted with standardized
  mean gaps.
- `g7-sp-likelihood-words` (two forms): probability 0 and 1 endpoint language.
- `g7-sp-counting-principle` (seven forms): product-rule sample-space counts and repeated coin flips.
- `g7-sp-compound-model` (two forms): independent coin–die events with exact fractional probabilities.

### High-value catches

1. Human reading caught a repeated “sample” phrase and sampling-frame noun mismatches that arithmetic
   verification could not detect.
2. Weekly exercise contexts could generate implausibly low means; the contextual pool now uses
   realistic values.
3. A plural-to-singular shortcut could turn “team jerseys” into “team jerse”; explicit morphology
   replaces string slicing.
4. The first compound-event draft varied the die but still returned 1/4 every time. A broader event
   pool now varies both the evidence and the correct probability.
5. The final same-seed audit confirms every repeated concept tag receives a distinct problem form.

### Verification

- 35 forms passed **315,000 deterministic independent-answer draws** (3,000 seeds × 3 bands per form).
- All **1,317 declarations** passed **19,755 declaration checks**; all **10,584** generator/form/band
  builds resolved deterministically with surface preservation.
- Semantic comparison against session 64 confirms exactly 35 `variant` keys were added across 11
  lesson files and no authored content changed.
- All 1,231 JSON files parse; all 265 TypeScript/TSX/MTS files parse with zero syntax diagnostics.
- Native integrity and registration pass.

Session running total: 814 explicit assessment-step declarations and 194 generator families added by
this workstream.

### Package-backed gate status

A bounded `npm ci --ignore-scripts --prefer-offline --no-audit --fund=false` attempt hung silently
beyond the install window and left only a partial dependency tree. The orphaned process and all
`node_modules` residue were removed before staging. Package-backed typecheck, full Vitest,
schema/pedagogy, lint, build, Playwright, audit, and `gen:state` remain unverified rather than green.

## Session 66: G8 exponents complete; terminating/repeating decimals refreshed

Coverage 1520 -> 1549 / 4,471 (34.00% -> 34.65%). Full G8 coverage 68 -> 97 / 289
(23.5% -> 33.6%). This session added 29 explicit assessment declarations and six generator families,
with zero authored lesson-content changes. `exponents-scientific-notation` is now complete at 48/48,
and the first two Real Number System lessons are fully refreshed.

### Added families

- `g8-esn-power-meaning`: zero powers, shallow/deep negative powers, and building a power of ten from
  a decimal magnitude.
- `g8-esn-place-value`: digit-times-power notation and evaluation across positive, negative, and large
  exponents.
- `g8-esn-root-context`: square-side and cube-edge reasoning, including selecting the correct inverse
  equation in context.
- `g8-esn-compare`: scientific-notation comparisons and multiplicative magnitude ratios with equal or
  unequal exponents.
- `g8-esn-context-compute`: contextual multiplication, division, subtraction, and multistep operations
  in standard scientific notation.
- `g8-rns-decimal-classify`: terminating/repeating decimal identification, exact decimal forms,
  denominator-factor predictions, simplification-first classification, and bucket sorting.

### High-value catches

1. A scientific-notation ratio case with equal coefficients made the “ignore coefficients” distractor
   equal the correct answer. Equal-coefficient cases are excluded from that diagnostic form.
2. Early build-expression banks repeated coefficient or exponent labels. Identical-looking tokens could
   grade differently, so every bank was redesigned to use one unique token per visible label.
3. Multiplication intentionally includes a right-value/wrong-standard-form build. The independent gate
   now distinguishes form correctness from numeric equality rather than incorrectly deleting that diagnosis.
4. Shallow and deep negative-power forms could emit the same prompt under the same seed; their exponent
   ranges are now disjoint within every difficulty band.
5. Reverse-division decimal distractors printed raw floating-point tails such as 1.5714285714285714;
   diagnostic labels are now readable and bounded.
6. Human review found band regressions and an awkward “city has grains of sand” context. Bands now use
   separated ranges, and the comparison is framed as a city park versus a sample jar.

### Verification

- 29 forms passed **261,000 deterministic independent-answer draws** (3,000 seeds × 3 bands per form).
- All **1,346 declarations** passed **20,190 declaration checks**.
- All **1,211 generator/default-form combinations** passed **32,697 deterministic builds**.
- Semantic comparison confirms seven lesson files changed only by 29 added `variant` keys.
- All 1,231 JSON files parse; all 265 TypeScript/TSX/MTS files syntax-transpile cleanly.
- Native integrity and registration pass.

Session running total: 843 explicit assessment-step declarations and 200 generator families added by
this workstream.

A bounded dependency restore hung silently and left only a partial tree. The process and all
`node_modules` residue were removed. Package-backed typecheck, full Vitest, schema/pedagogy, lint,
build, Playwright, and audit remain unverified rather than green. `gen:state` completed successfully.

## Session 67: G8 bivariate statistics complete — 33.6% -> 43.6%, +29 refreshed

Coverage 1549 -> 1578 / 4,471 (34.65% -> 35.29%). Full G8 coverage 97 -> 126 / 289
(33.6% -> 43.6%). This session added all 29 remaining `bivariate-statistics` assessment declarations
and eight generator families, with zero authored lesson-content changes. The course is now complete
at 48/48.

### Added families

- `g8-bv-scatter-basics`: ordered-pair interpretation, one-dot-per-observation reasoning, the purpose
  of paired data, and coordinate plotting.
- `g8-bv-outlier-impact`: leverage and the effect of distant observations on a fitted line.
- `g8-bv-fit-idea`: best-fit purpose, association direction, no-touch requirement, and balance.
- `g8-bv-judge-fit`: residual distance, one-sided bias, vertical shifts, and comparing candidate fits.
- `g8-bv-interpret`: slope and intercept meaning in phone, taxi, savings, and fundraising contexts.
- `g8-bv-prediction-limits`: interpolation, extrapolation, range-based trust, and why trends may change.
- `g8-bv-relative-frequency`: within-group versus whole-table denominators and exact percentages.
- `g8-bv-categorical-association`: conditional rates, fair comparisons, and evidence of association.

### High-value catches

1. Two independently generated extrapolation distractors could land on the same x-value. Their ranges
   are now mathematically disjoint.
2. The first exact-percentage table used rejection sampling with too few valid combinations and could
   exhaust the draw limit. It now selects from a prevalidated candidate pool with distinct answers and traps.
3. At 50%, the complement equals the answer; with a total of 100, the raw count can equal the percent.
   Categorical table parameters now make all three diagnoses distinct.
4. Two whole-table forms and two intercept forms could collapse to identical same-seed questions.
   Each now has a structurally distinct surface and independently varied evidence.
5. Human review repaired “did not arrived/attended,” made returning customers a genuine subgroup,
   scaled cycling output in hundreds of calories, and replaced generic algebra ranges that could imply
   an $88 taxi pickup fee or $27-per-mile fare with context-specific realistic ranges.

### Verification

- 29 forms passed **261,000 deterministic independent-answer draws**.
- All **1,375 declarations** passed **20,625 declaration checks**.
- **1,249** generator/default-form combinations passed **33,723 deterministic builds**.
- Runtime coverage confirms `bivariate-statistics` at 48/48 and Grade 8 at 126/289.
- All 1,231 JSON files parse; all 265 TypeScript-family files syntax-transpile cleanly.
- Native integrity and registration pass.

Session running total: 872 explicit assessment-step declarations and 208 generator families added by
this workstream.

### Package-backed gate status

A bounded `npm ci --ignore-scripts --prefer-offline --no-audit --fund=false` attempt hung silently and
ignored normal termination, leaving an orphaned npm process. The process was killed and the partial
`node_modules` tree removed. Package-backed typecheck, full Vitest, schema/pedagogy, lint, production
build, Playwright, and npm audit remain unverified rather than green.

## Session 68: G8 Real Number System complete; geometry theorems underway

Coverage 1578 -> 1608 / 4,471 (35.29% -> 35.97%). Full G8 coverage 126 -> 156 / 289
(43.6% -> 54.0%). This session added 30 explicit assessment declarations and six generator families,
with zero authored lesson-content changes. `the-real-number-system` is now complete at 37/37, and
`transformations-measurement` rises from 13/60 to 19/60.

### Added families

- `g8-rns-root-classify`: rational versus irrational square roots, mixed-number classification,
  perfect-square reasoning, nonrepeating decimals, and rational-number selection.
- `g8-rns-density`: locating irrational roots between tenths and hundredths and using midpoint density.
- `g8-rns-root-estimate`: whole-number bounds, nearest-integer reasoning, and one-decimal estimates.
- `g8-rns-compare-estimate`: root/decimal and π/fraction comparisons, exact root products, and ordering.
- `g8-tm-triangle-exterior`: exterior angles from the two remote interior angles.
- `g8-tm-pythagorean-why`: the square-area meaning of a² + b² = c² and recovering c from areas.

### High-value catches

1. For roots such as √26, a “wrong tenth” trap displayed as `5.0` while a whole-bound trap displayed
   as `5`; numerically they were identical. The parameterized diagnostics are now provably distinct.
2. The initial Pythagorean bank had only three triples per band, allowing repeated familiar examples
   and weak progression. Each band now has five disjoint, progressively harder triples.
3. The challenge hundredths form reused the ordinary hundredths pool. It now has a distinct, harder
   pool so a challenge changes the mathematics rather than only the seed.
4. Decimal-bound labels retained unnecessary trailing zeros, and one stretch root rounded to a whole
   number in a one-decimal prompt. Both presentation defects were removed.
5. π comparisons initially changed only numbers. Support, core, and stretch now progress from familiar
   approximations to increasingly close rational approximations.
6. Six generator families added in Session 66 had never been entered into the official independent
   route and difficulty-band registries. Session 68 adds rigorous routes for those six plus the six new
   families, closing an inherited test-infrastructure gap.

### Verification

- 30 forms passed **270,000 deterministic independent-answer draws**.
- Twelve Grade-8 families passed **106,500 official-route checks**.
- All **1,405 declarations** passed **21,075 declaration checks**.
- **1,285** generator/default-form combinations passed **34,695 deterministic builds**.
- Runtime coverage confirms `the-real-number-system` at 37/37 and Grade 8 at 156/289.
- All 1,231 JSON files parse; all 265 TypeScript-family files syntax-transpile cleanly.
- Native integrity and registration pass.

Session running total: 902 explicit assessment-step declarations and 214 generator families added by
this workstream.

### Package-backed gate status

A bounded `npm ci --ignore-scripts --prefer-offline --no-audit --fund=false` attempt hung silently
past the install window. It was terminated and the partial `node_modules` tree removed. Package-backed
typecheck, full Vitest, schema/pedagogy, lint, production build, Playwright, and npm audit remain
unverified rather than green.

## Session 69: G8 rigid transformations, similarity, and coordinate distance

Coverage 1608 -> 1637 / 4,471 (35.97% -> 36.61%). Full G8 coverage 156 -> 185 / 289
(54.0% -> 64.0%). This session added 29 explicit assessment declarations and six generator families,
with zero authored lesson-content changes. `transformations-measurement` rises from 19/60 to 48/60;
only the three volume lessons remain.

### Added families

- `g8-tm-rigid-motion`: translation coordinates and vectors, reflection lines, rotation rules,
  preserved properties, and transformation classification.
- `g8-tm-congruence`: exact corresponding measurements, rigid-motion preservation, SSS evidence,
  and congruent-versus-resized classification.
- `g8-tm-dilation-similarity`: scale factors, corresponding side lengths, dilation effects, and
  congruent/similar/neither sorting.
- `g8-tm-transversal`: corresponding, alternate-interior, linear-pair, and same-side-interior angle
  relationships.
- `g8-tm-angle-angle`: triangle angle sums, AA similarity and non-similarity, and proportional sides.
- `g8-tm-pythagorean-converse`: side-length tests, coordinate distance, and right-triangle sorting.

### High-value catches

1. For a side of 2 dilated by factor 2, the “add the factor” trap and correct product both equaled 4.
   Similarity side pools now exclude that degeneracy.
2. For the same 2-to-4 pair, subtracting matching lengths also equaled the correct scale factor 2.
   Factor prompts now draw from ranges that keep every diagnosis distinct.
3. Alternate-angle values 45°, 90°, and 135° could make complement, supplement, or equal-angle
   distractors collapse. Those boundary values are now rejected for the affected forms.
4. Reciprocal scale-factor traps could expose long binary floating tails; displayed numeric traps are
   now rounded cleanly without entering the answer tolerance.
5. Reflection feedback said phrases such as “would only y changes sign.” The generated explanation now
   uses grammatical, mathematically precise language.
6. Several drag-sort item labels contained commas, while the standing independent gate serializes
   bucket labels with commas. Labels were redesigned without ambiguous delimiters so label-level
   reconstruction remains exact.

### Verification

- 29 forms passed **261,000 deterministic independent-answer draws**.
- All **1,434 declarations** passed **21,510 declaration checks**.
- All generators and registered forms passed **11,880 deterministic cross-band builds**.
- Runtime coverage confirms `transformations-measurement` at 48/60 and Grade 8 at 185/289.
- Nine lesson files differ from Session 68 only through 29 added `variant` declarations.
- All 1,231 JSON files parse; all 265 TypeScript-family files syntax-transpile cleanly.
- Native integrity, registration, manifest, prerequisites, flagship ranking, scaffold audit,
  curriculum inventory, MCQ inventory, and product-state generation pass.

Session running total: 931 explicit assessment-step declarations and 220 generator families added by
this workstream.

### Package-backed gate status

A bounded `npm ci --ignore-scripts --prefer-offline --no-audit --fund=false` attempt hung silently and
produced no registry output. It was terminated and the partial dependency tree removed. Package-backed
typecheck, full Vitest, schema/pedagogy, lint, production build, Playwright, and npm audit remain
unverified rather than green.

## Session 70: Grade 8 volume complete and linear equations advanced

Coverage 1637 -> 1667 / 4,471 (36.61% -> 37.29%). Full G8 coverage 185 -> 215 / 289
(64.0% -> 74.4%). This session added 30 explicit assessment declarations and six generator families,
with zero authored lesson-content changes. `transformations-measurement` is now 60/60 complete, and
`linear-equations-systems` rises from 4/48 to 22/48.

### Added families

- `g8-tm-cylinder-volume`: exact cylinder volume, base-area meaning, and tank contexts.
- `g8-tm-cone-volume`: direct cone volume and one-third-of-cylinder reasoning.
- `g8-tm-sphere-volume`: exact, fractional, approximate, and formula-matching sphere volume.
- `g8-les-isolate-variable`: variables on both sides and balance-preserving isolation.
- `g8-les-distribute-solve`: distribution, expansion matching, combining terms, and equations with
  parentheses on both sides.
- `g8-les-solution-count`: no-solution and infinitely-many-solution classification.

Three existing `eq-two-step` forms were also explicitly assigned to the remaining introductory
linear-equation assessments.

### High-value catches

1. Clamping a right-side coefficient after drawing a requested gap changed the actual equation while
   leaving the stored solution unchanged. The draw now constrains the gap before construction.
2. Several distribution and equation traps could equal the correct answer or one another for boundary
   parameter choices. Those degeneracies are rejected at generation time.
3. Cone and sphere support/core/stretch ranges initially overlapped too heavily. The final pools are
   deliberately progressive while retaining sufficient freshness.
4. The reused two-step-equation generator exposed long binary floating tails and a doubled space after
   the prompt colon. Distractors now round cleanly and typography is normalized.
5. Some generated algebra displayed `1x`; coefficient ranges now keep learner-facing notation natural.
6. Formula-match feedback could mention diameter fractions while a base-area representation was on
   screen. Guidance is now representation-aware.

### Verification

- 30 forms passed **270,000 deterministic independent-answer draws**.
- All **1,464 declarations** passed **21,960 declaration checks**.
- **1,353 generator/default-form combinations** passed **20,295 deterministic builds**.
- Runtime coverage confirms Transformations & Measurement at 60/60 and Grade 8 at 215/289.
- Eight lesson files differ from Session 69 only through 30 added `variant` declarations.
- All repository JSON files parse; all TypeScript-family files syntax-transpile cleanly.
- Native integrity, registration, manifest, prerequisites, flagship ranking, scaffold audit,
  curriculum inventory, MCQ inventory, and product-state generation pass.

Session running total: 961 explicit assessment-step declarations and 226 generator families added by
this workstream.

### Package-backed gate status

A bounded dependency restoration attempt hung silently and left a partial `node_modules` tree. The
orphaned npm process was killed and all dependency/build/test residue removed. Package-backed
TypeScript, full Vitest, schema/pedagogy, lint, production build, Playwright, and npm audit remain
unverified rather than green.

## Session 71: restore the dual-route verification invariant

Coverage is unchanged at **1,667/4,471 (37.29%)** overall and **215/289 (74.4%)** for Grade 8. This
session adds no assessment declarations and no generator families; it repairs the standing gate and
release environment around the existing 354 families.

### Repairs

1. Added independent routes for thirteen Grade 7 equation, sampling, and probability families that
   had been registered without a callable second method.
2. Added explicit gate branches for `columnCalc` and `solveBalance`, including actual evaluator-state
   checks rather than numeric fallthrough.
3. Repaired the adjacent-vertical-angle route and the equal-parts and relative-frequency parsers.
4. Removed shadowed `perimeter`/`missing-side` aliases and their dead parser path.
5. Corrected Grade 8 grammar, decimal formatting, prompt/feedback floors, power-meaning freshness,
   and the categorical-association MCQ route.
6. Fixed the invalid sync signal, tuple-spread TS2556 sites, browser test environments, fetch stubbing,
   and restored `tailwind.config.ts`.

### Verification

- 89,100 focused checks across every reported G7/G8 defect.
- 74,400 checks through the actual standing independent routes.
- 12,000 runtime-evaluator checks for the two newly supported widget branches.
- 6,000 targeted categorical and live missing-side route checks.
- 354/354 registered generators have callable independent routes.
- 1,231 JSON files, 266 executable TypeScript-family syntax transpiles, native integrity, and
  registration all pass.

Package-backed gates remain environment-blocked because dependency restoration hung silently. No
partial dependency or build artifacts are included.

## Session 72: Grade 8 Linear Equations & Systems complete

Coverage 1,667 -> 1,697 / 4,471 (37.29% -> 37.96%). Full G8 coverage 215 -> 245 / 289
(74.4% -> 84.8%). This session adds 30 explicit assessment declarations and seven generator
families, with zero authored lesson-content changes. `linear-equations-systems` is now **48/48** and
`functions-g8` begins at **4/48**.

### Added families

- `g8-les-system-meaning`: interpreting and verifying intersections and system solutions.
- `g8-les-system-graphing`: solving for requested intersection coordinates.
- `g8-les-system-count`: no/one/infinite solution counts from slopes and intercepts.
- `g8-les-substitution-method`: isolated-expression substitution and back-solving.
- `g8-les-system-verify`: checking an ordered pair in both equations.
- `g8-les-systems-word`: number, rope, ticket, and purchase systems.
- `g8-fn-function-definition`: function recognition, shared outputs, finite relations, and sorting.

Five additional forms extend `g8-les-solution-count` to the remaining identity and classification
assessments.

### Verification

- **270,000** focused independently solved draws across all 30 forms.
- **90,000** checks through the actual standing independent routes.
- **361/361** registered generators have callable independent routes.
- **1,494 declarations** passed **22,410** cross-band checks.
- **25,104** deterministic generator/form/band builds passed.
- Runtime coverage confirms G8 245/289, Linear Equations & Systems 48/48, Functions 4/48.
- All JSON, TypeScript-family syntax, registration, imports, routes, and native integrity checks pass.

Session running total: 991 explicit assessment-step declarations and 233 generator families added by
this workstream.

### Package-backed gate status

The bounded dependency restoration attempt hung silently with zero registry output and left only a
partial `node_modules` tree. The process was terminated and all dependency, build, and test residue
removed. Package-backed typecheck, full Vitest, schema/pedagogy validation, lint, production build,
Playwright, and npm audit remain unverified rather than reported as passing.

## Session 73: Grade 8 Functions foundations and comparisons

Coverage 1,697 -> 1,727 / 4,471 (37.96% -> 38.63%). Full Grade 8 coverage 245 -> 275 / 289
(84.8% -> 95.2%). Functions rises from 4/48 to **34/48**. This session adds 30 explicit assessment
declarations and seven generator families with zero authored lesson-content changes.

### Added or extended families

- Extended `g8-fn-function-definition` with repeated-input relation and table forms.
- `g8-fn-vertical-line`: lines, upright/sideways parabolas, and equation sorting.
- `g8-fn-rate-of-change`: positive, wide-interval, negative, and contextual rates.
- `g8-fn-constant-slope`: similar slope triangles, coordinate slopes, and fractional slopes.
- `g8-fn-initial-value`: tables, point-slope recovery, and equation recognition.
- `g8-fn-same-function-forms`: stories, tables, graphs, equations, and odd-one-out comparisons.
- `g8-fn-compare-rates`: comparing equations, tables, and verbal rates.
- `g8-fn-compare-full`: comparing both initial values and rates of change.

### Verification

- **270,000** focused draws passed through the actual standing independent routes.
- **368/368** registered generators have callable independent routes.
- **1,524 declarations** passed **22,860** cross-band checks.
- **19,224** deterministic generator/form/band builds passed.
- Runtime coverage confirms Grade 8 275/289 and Functions 34/48.
- All JSON, TypeScript-family syntax, registration, imports, routes, and native-integrity checks pass.

Session running total: 1,021 explicit assessment-step declarations and 240 generator families added
by this workstream.

## Session 74: Grade 8 complete and whole-registry regression repair

Coverage 1,727 -> 1,741 / 4,471 (38.63% -> 38.94%). Full Grade 8 coverage rises from
275/289 (95.2%) to **289/289 (100%)**. Functions rises from 34/48 to **48/48**. This session adds
14 explicit assessment declarations and four generator families with zero authored lesson-content
changes.

### Added families

- `g8-fn-compare-context`: contextual rate comparison and whole-number break-even points.
- `g8-fn-linear-nonlinear`: table, equation, and sorting classifications.
- `g8-fn-qualitative-graphs`: steepness, direction, flattening, and stopped intervals.
- `g8-fn-graph-stories`: matching changing-rate and stopped-motion stories to graph shapes.

### Whole-registry quality repairs

The post-completion audit did not stop at Grade 8. It repaired inherited defects including:

- answer/trap collisions in right-angle complements, average rates, triangle angle sums, and arc
  measures;
- an unsatisfiable fractional unit-rate draw;
- a seed-ignoring Pythagorean-converse sorting form;
- short rounding, probability, and counting feedback;
- learner-facing `+ -1`, `1x`, and coefficient-one algebra across complex numbers, quadratics,
  limits, end behavior, higher derivatives, function classification, and Grade-8 systems/functions;
- an audit rule that incorrectly treated exact powers-of-ten decimals as binary float artifacts.

### Verification

- The 14 final Functions forms passed **210,000 deterministic checks through the actual standing
  independent routes**.
- The whole-registry audit passed **129,840 builds across all 372 generator families**.
- **372/372** generator families have callable independent routes.
- **1,538 declarations** passed **23,070** cross-band checks.
- **19,476** deterministic registered generator/form/band builds passed.
- Runtime coverage confirms Grade 8 **289/289**, Functions **48/48**, and overall coverage
  **1,741/4,471**.
- Native integrity and registration pass; all 1,231 JSON files parse and executable TypeScript-family
  files syntax-transpile cleanly.
- Four lesson files differ from Session 73 only through 14 new `variant` declarations.

Session running total: 1,035 explicit assessment-step declarations and 244 generator families added by
this workstream.

### Package-backed gate status

The bounded dependency restoration attempt hung silently and left an orphaned npm process plus a
partial dependency tree. Both were forcibly removed. Package-backed typecheck, full Vitest,
schema/pedagogy validation, lint, production build, Playwright, and npm audit remain unverified rather
than reported as passing.

## Session 75: G5-A course-completion reuse proof

Coverage **1,741 → 1,776 / 4,471 (38.94% → 39.72%)**. Grade 5 rises from **105/245** to
**140/245**. `decimal-operations` reaches **58/58** and `fractions-multiply` reaches **52/52**.

The session adds 35 explicit assessment declarations and 25 forms, while adding only one generator
family (`fraction-scaling`). Six existing families are extended: `grouping-first`, `partial-products`,
`frac-unlike-addsub`, `whole-times-fraction`, `frac-multiply`, and `unit-frac-divide`. Authored
`evalOrder`, `columnCalc`, `fractionGrid`, numeric, and MCQ surfaces are preserved.

Verification passed 9,000 focused builds, 15,000 actual standing-route checks, 6,000 evaluator builds
with 31,680 assertions, and 132,840 whole-registry builds across 373 generators. Native integrity,
registration, JSON parsing, syntax transpilation, declaration resolution, and semantic lesson diff
all pass.

Session running total: **1,070 explicit assessment-step declarations** and **245 generator families**
added by this workstream.

The next efficient batch is the 30 true runtime gaps in `decimals-place-value`, which would complete
a third Grade-5 course with maximal rounding/place-value engine reuse.

## Session 76: Grade-5 Decimal Place Value complete

Coverage **1,776 → 1,806 / 4,471 (39.72% → 40.39%)**. Grade 5 rises from **140/245** to
**170/245 (69.39%)**. `decimals-place-value` reaches **47/47 (100%)**.

The session adds 30 explicit assessment declarations and 25 forms while adding only one generator
family, `decimal-representation`. Existing `order-decimals`, `decimal-place-value`, `place-compare`,
and `round-place` engines are extended. Authored numeric, MCQ, `buildExpression`, and `placeCompare`
surfaces are preserved, and the eight edited lesson files contain only new `variant` declarations.

Verification passed 9,000 focused builds, 15,000 actual standing-route checks, 6,000 evaluator builds
with 41,280 assertions, and 135,840 whole-registry builds across 374 generators. Native integrity,
registration, JSON parsing, syntax transpilation, strict semantic checking, declaration resolution,
and semantic lesson comparison all pass.

Session running total: **1,100 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

Package-backed gates remain environment-blocked by broad HTTP 503 responses during two bounded
`npm ci` attempts. No partial dependency or build residue is included.

The next efficient batch is **G5-C: the 37 true runtime gaps in `coordinate-geometry`**, which would
raise Grade 5 to **207/245 (84.49%)**.

## Session 77: Grade-5 Coordinate Geometry complete

Coverage **1,806 → 1,843 / 4,471 (40.39% → 41.22%)**. Grade 5 rises from **170/245** to
**207/245 (84.49%)**. `coordinate-geometry` reaches **40/40 (100%)**.

The session adds 37 explicit assessment declarations and 31 forms while adding **zero** generator
families. Existing `coordinate-plot`, `proportional-plot`, `shape-hierarchy`, `attributes`,
`quadrilaterals`, and `angle-sum` engines are extended, while four existing forms are reused directly.
Authored point-entry, plot-point, numeric, and MCQ surfaces are preserved, and the ten edited lesson
files contain only new `variant` declarations.

### Quality catches

- Repaired a paired-pattern next-term misconception that could equal the correct answer when the true
  step was +2.
- Rejected paired-pattern value draws whose different misconception routes produced duplicate numeric
  traps.
- Tightened coordinate parameter gates so learner-facing distance feedback cannot render `1 units`.

### Verification

- **11,160** focused builds across the 31 new forms and all three bands.
- **18,600** checks through the actual standing independent routes.
- **7,440** evaluator-level builds with **56,880** correctness and diagnostic assertions.
- The whole-registry audit passed **138,960 builds across 374 generators**.
- **374/374** generators have callable independent routes.
- **1,640 declarations** passed **24,600** cross-band checks.
- **20,844** registered generator/form/band builds passed determinism and surface checks.
- Runtime resolution reports Grade 5 **207/245**, Coordinate Geometry **40/40**, and overall coverage
  **1,843/4,471**.
- Native integrity and registration pass; all 1,231 JSON files parse and 261 TypeScript-family files
  syntax-transpile cleanly.
- Strict semantic checking passes, and ten lesson files differ from Session 76 only through 37 new
  `variant` declarations.

Session running total: **1,137 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

### Package-backed gate status

A bounded dependency restoration attempt stalled silently and left an orphaned npm process plus a
partial dependency tree. The processes and all partial dependency/build/test residue were removed.
Package-backed typecheck, full Vitest, schema/pedagogy validation, lint, production build, Playwright,
and npm audit remain unverified rather than green.

### Next batch

G5-D should complete the **38 true runtime gaps in `volume-measurement`**. It is the final Grade-5
batch and offers substantial reuse through `mixed-convert`, `metric-convert`, `box-volume`, and
`line-plot`. Completion would make Grade 5 **245/245 (100%)**.

## Session 78: Grade-5 Volume & Measurement complete

Coverage **1,843 → 1,881 / 4,471 (41.22% → 42.07%)**. Grade 5 rises from **207/245** to
**245/245 (100%)**. `volume-measurement` reaches **48/48 (100%)**, completing every Grade-5 course.

The session adds 38 explicit assessment declarations and uses 18 forms while adding **zero**
generator families. Existing `metric-convert`, `line-plot`, and `box-volume` engines are extended;
the default `box-volume` form is reused directly. `mixed-convert` was deliberately not reused because
its `mixedRegroup` surface does not match these numeric and MCQ items. Eleven lesson files changed
only through added declarations.

### Quality catches

- Prevented fractional line-plot total traps from duplicating when the tallest stack contained four
  marks.
- Replaced a repeating-decimal customary-conversion trap with the reachable unchanged-count
  misconception.
- Strengthened stacked-cube success feedback so it explicitly reinforces additive volume.

### Verification

- **9,720** focused builds across 18 forms and three bands.
- **12,960** checks through actual standing independent routes.
- **5,400** evaluator builds with **34,800** assertions.
- **141,000** whole-registry builds across all 374 generators.
- **1,678 declarations** passed **25,170** cross-band checks.
- **21,150** registered generator/form/band builds passed.
- Native integrity, registration, all 1,231 JSON files, 261 TypeScript-family syntax checks, strict
  semantic checking, and declaration-only lesson comparison pass.

Session running total: **1,175 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently. The orphaned process and partial dependency tree were
removed; package-backed gates remain unverified rather than green.

The next efficient batch is **G6-A: the 23 true runtime gaps in `area-surface-volume`**, which would
complete that course at **61/61** and raise overall refreshed coverage to **1,904/4,471 (42.59%)**.

## Session 79: G6-A Area, Surface Area & Volume complete

Coverage **1,881 → 1,904 / 4,471 (42.07% → 42.59%)**. Grade 6 rises from **71/303** to
**94/303 (31.02%)**. `area-surface-volume` reaches **61/61 (100%)**.

The session adds 23 explicit assessment declarations and uses 17 forms while adding **zero**
generator families. Fifteen focused forms extend `coordinate-plot`, `triangle-area-calc`,
`area-formula-pick`, `area-compose`, `box-surface-area`, `prism-surface-area`, `box-volume`, and
`fraction-volume`; existing `coordinate-plot@cgRectangleCorner` and `box-volume@whichMeasure` forms
are reused directly. All 18 numeric and 5 MCQ authored surfaces remain intact, and the eight edited
lesson files contain only new `variant` declarations.

### Verification

- **9,180** focused builds across 17 forms and three bands.
- **12,240** checks through actual standing independent routes.
- **6,120** evaluator builds with **38,880** assertions.
- **142,800** whole-registry builds across all 374 generators.
- **1,701 declarations** passed **25,515** cross-band checks.
- **21,420** registered generator/form/band builds passed.
- Native integrity, registration, all 1,231 JSON files, 261 TypeScript-family syntax checks, strict
  numeric/MCQ semantic checking, and declaration-only lesson comparison pass.

Session running total: **1,198 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently and left an orphaned npm process plus a partial dependency
tree. Both were removed; package-backed gates remain unverified rather than green.

The next efficient batch is **G6-B: the 45 true runtime gaps in `expressions-equations`**, which would
complete that course at **62/62**, raise Grade 6 to **139/303 (45.87%)**, and raise overall refreshed
coverage to **1,949/4,471 (43.59%)**.

## Session 80: G6-B Expressions & Equations complete

Coverage **1,904 → 1,949 / 4,471 (42.59% → 43.59%)**. Grade 6 rises from **94/303** to
**139/303 (45.87%)**. `expressions-equations` reaches **62/62 (100%)**.

The session adds 45 explicit assessment declarations and 42 focused forms while adding **zero**
generator families. Existing `power-product`, `grouping-first`, `variable-meaning`, `distributive`,
`equiv-test`, `unknown-letter`, and `g7-tse-inequality-build` engines are extended. All 23 numeric,
20 MCQ, one `evalOrder`, and one `buildExpression` surface remain intact, and the eleven edited
lesson files contain only new `variant` declarations.

### Quality catches

- Rejected the `2²` exponent case where correct expansion and “base × exponent” become identical.
- Guarded variable-equivalence, like-term, multiplication-equation, and contextual-equation forms
  against correct/trap or trap/trap collisions.
- Replaced an “Infinity” option with a finite-number misconception in the no-largest-solution item.
- Corrected the standing-route harness to compare `buildExpression` token labels rather than stored
  token IDs.

### Verification

- **30,240** focused builds across 42 forms and three bands.
- **37,800** checks through actual standing independent routes.
- **18,900** evaluator builds with **123,300** assertions.
- **147,840** whole-registry builds across all 374 generators.
- **1,746 declarations** passed **26,190** cross-band checks.
- **22,176** registered generator/form/band builds passed.
- Native integrity, registration, all 1,231 JSON files, 261 TypeScript-family syntax checks, strict
  semantic checking, and declaration-only lesson comparison pass.

Session running total: **1,243 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently. The process and partial dependency tree were removed;
package-backed gates remain unverified rather than green.

The next efficient batch is **G6-C: the 48 true runtime gaps in `number-system`**, which would complete
that course at **60/60**, raise Grade 6 to **187/303 (61.72%)**, and raise overall refreshed coverage
to **1,997/4,471 (44.67%)**.

## Session 81: G6-C completes The Number System

Grade 6 rises from **139/303 (45.87%)** to **187/303 (61.72%)**. All 48 remaining Number System
assessments are refreshed, completing the course at **60/60**. Overall refreshed coverage rises from
**1,949/4,471 (43.59%)** to **1,997/4,471 (44.67%)**.

This is a pure-reuse batch: 48 declarations across 40 forms, with **zero new generator families**.
Thirty-six focused forms extend `unit-frac-divide`, `long-div-2digit`, `decimal-align-addsub`,
`lcm-pair`, `distributive`, `negative-intro`, and `coordinate-plot`; four proven forms are reused
directly. The 26 numeric, 11 MCQ, 7 `rationalCompare`, 2 `absValueLine`, and 2 `dragOrder` authored
surfaces remain intact. The twelve edited lesson files contain only new declarations.

### Quality safeguards

- Prevented mixed-number division, GCF, and distributive-factor traps from colliding with answers or
  with one another.
- Added exact rational comparison routes using integer cross-products.
- Added a dedicated `absValueLine` standing gate that derives magnitude truth from visible values and
  checks answer-id mapping plus every reachable diagnosis.
- Recomputed quadrant and x-axis-reflection answers from printed coordinate signs.

### Verification

- **33,600** focused builds.
- **36,000** actual standing-route checks.
- **18,360** evaluator builds with **114,240** assertions.
- **152,160** whole-registry builds across all 374 generators.
- **1,794 declarations** passed **26,910** cross-band checks.
- **22,824** registered generator/form/band builds passed.
- Native integrity, registration, JSON parsing, syntax transpilation, strict semantic checking, and
  declaration-only lesson comparison pass.

Session running total: **1,291 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently. The orphaned process and partial dependency tree were
removed; package-backed gates remain unverified rather than green.

The next efficient batch is **G6-D: the 57 true runtime gaps in `ratios-rates`**, which would complete
that course at **61/61**, raise Grade 6 to **244/303 (80.53%)**, and raise overall refreshed coverage
to **2,054/4,471 (45.94%)**.

## Session 82: G6-D Ratios & Rates complete

Coverage **1,997 → 2,054 / 4,471 (44.67% → 45.94%)**. Grade 6 rises from **187/303** to
**244/303 (80.53%)**. `ratios-rates` reaches **61/61 (100%)**.

The session adds 57 explicit assessment declarations and uses 50 forms while adding **zero**
generator families. Forty-nine focused forms extend `pr-constant-k-g7`, `pr-unit-rate-g7`,
`pct-of-number`, and `metric-convert`; the proven `metric-convert@multistep` form is reused directly.
All 35 numeric, 18 MCQ, and 4 `buildExpression` authored surfaces remain intact. The fourteen edited
lesson files contain only new `variant` declarations.

### Quality catches

- Replaced scaling, ratio-table, and double-number-line traps that could collide with one another or
  with the correct value.
- Rejected unit-rate and discount parameter combinations that made distinct misconceptions produce
  the same numeric result.
- Corrected floating-point normalization in the independent discount route.
- Replaced repeating-decimal conversion feedback and a repeating percent scale factor with exact,
  student-readable arithmetic.
- Corrected singular wording from “1 groups” to “1 group.”

### Verification

- **42,000** focused builds across 50 forms and three bands.
- **37,500** checks through actual standing independent routes.
- **18,000** evaluator builds with **121,320** assertions.
- **157,920** whole-registry builds across all 374 generators.
- **1,851 declarations** passed **27,765** cross-band checks.
- **23,688** registered generator/form/band builds passed.
- Native integrity, registration, all 1,231 JSON files, 261 TypeScript-family syntax checks, strict
  numeric/MCQ semantic checking, and declaration-only lesson comparison pass.

Session running total: **1,348 explicit assessment-step declarations** and **246 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently. The orphaned process and partial dependency tree were
removed; package-backed gates remain unverified rather than green.

The next efficient batch is **G6-E: the 59 true runtime gaps in `data-distributions`**, which would
complete Grade 6 at **303/303 (100%)** and raise overall refreshed coverage to **2,113/4,471
(47.26%)**.

## Session 83: G6-E Data & Distributions complete

Coverage **2,054 → 2,113 / 4,471 (45.94% → 47.26%)**. Grade 6 rises from **244/303** to
**303/303 (100%)**. `data-distributions` reaches **59/59 (100%)**.

The session adds 59 explicit assessment declarations and 59 focused forms. Two reusable families,
`g6-data-literacy` and `g6-center-spread`, were added, while `line-plot` was extended for dot-plot and
distribution-shape reasoning. All 27 numeric and 32 MCQ authored surfaces remain intact. The fifteen
edited lesson files contain only new `variant` declarations.

### Quality catches

- Prevented histogram-total, IQR, range, mean, outlier-shift, and center-gap misconceptions from
  colliding with answers or one another.
- Replaced a sparse median-context draw with a guaranteed-valid parameter construction.
- Corrected singular contextual time wording and strengthened terse range/mean feedback.
- Fixed a strict TypeScript narrowing issue in repeated dot-count construction.
- The whole-registry audit also repaired a pre-existing kite-angle trap collision and a scientific-
  notation rejection sampler that could exhaust its draw budget.

### Verification

- **49,560** focused builds across 59 forms and three bands.
- **44,250** checks through actual standing independent routes.
- **21,240** evaluator builds with **137,160** assertions.
- **165,000** whole-registry builds across all 376 generators.
- **1,910 declarations** passed **28,650** cross-band checks.
- **24,750** registered generator/form/band builds passed.
- Native integrity, registration, all 1,231 JSON files, 261 TypeScript-family syntax checks, strict
  semantic checking, and declaration-only lesson comparison pass.

Session running total: **1,407 explicit assessment-step declarations** and **248 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently beyond its 90-second window. The orphaned processes and
partial dependency tree were removed; package-backed gates remain unverified rather than green.

The next reuse-efficient batch is **G12-A: the 17 true runtime gaps in `conic-sections`**, which would
complete that course at **59/59** and raise overall refreshed coverage to **2,130/4,471 (47.64%)**.

## Session 84: breakthrough batch compiler and Grade 4 complete

Coverage **2,113 → 2,332 / 4,471 (47.26% → 52.16%)**. Grade 4 rises from **60/279 (21.51%)** to
**279/279 (100%)**. All five Grade-4 courses are complete:

- `fractions-add` 18/58 → 58/58
- `lines-angles` 4/48 → 48/48
- `measure-convert` 31/60 → 60/60
- `multiply-bigger` 3/57 → 57/57
- `place-value-million` 4/56 → 56/56

The principal deliverable is a workflow redesign, not merely another content batch. The new
`scripts/variant-batch/` pipeline discovers true runtime gaps, compiles an exact plan, writes a lock
with authored-content hashes, derives focused/route/evaluator/coverage verification from that lock,
and runs a generic whole-registry audit. It replaces the recurring family of copied session scripts
and prevents unmapped gaps, unused selectors, target-count drift, surface drift, and silent authored
content changes.

The Grade-4 application adds **219 explicit declarations**, **97 forms**, and five reusable families:
`g4-fractions`, `g4-lines-angles`, `g4-measure`, `g4-multiply`, and `g4-place-million`. All 128 numeric,
83 MCQ, 3 mixed-regroup, 3 column-calculation, and 2 rational-comparison surfaces are preserved.
Independent prompt-derived routes live in `src/lib/g4Independent.cjs`.

### Verification

- **87,300** focused deterministic builds.
- **87,300** prompt-derived independent checks.
- **40,740** evaluator builds with **259,364** assertions.
- **176,640** whole-registry builds across all 381 generators.
- **2,129 declarations** passed **31,935** cross-band checks.
- **26,496** registered generator/form/band builds passed.
- Native integrity, registration, all 1,235 JSON files, 262 TypeScript-family syntax checks, strict
  semantic checking, and declaration-only Grade-4 baseline comparison pass.

Session running total: **1,626 explicit assessment-step declarations** and **253 generator families**
added by this workstream.

A bounded `npm ci` attempt stalled silently; orphaned processes and partial dependencies were removed.
Package-backed gates remain unverified rather than green.

Next best compiler application: Grade 0, **56 gaps across 33 selector groups**, completing two courses
and raising overall refreshed coverage to 2,388/4,471 (53.41%).

## Session 85: Grade 0 compiler completion

Applied the manifest-driven compiler to all 56 remaining Grade-0 runtime gaps. Added 56 declarations
through 33 focused forms and two reusable families, `g0-counting` and `g0-shapes-sorting`. Grade 0
rises from 32/88 to 88/88 (100%), and overall refreshed coverage rises from 2,332/4,471 to
2,388/4,471 (53.41%). The 56 targets preserve 24 MCQ, 11 tap-diagram, 6 number-line-hop,
5 subitizing, 4 length-comparison, 3 ordering, 2 ten-frame, and 1 matching surface.

The compiler was upgraded rather than bypassed: its generic verifier now serializes learner-visible
state for seven early-learning manipulative engines, independently reconstructs the intended action,
and checks the production evaluator and every reachable diagnostic. The standing variant gate also
now includes Grade-0 base routes, a complete `subitizeFlash` branch, and alignment-aware length
comparison.

Verification passed 29,700 focused builds, 29,700 independent checks, 13,860 evaluator builds with
91,012 assertions, 180,600 whole-registry builds, 32,775 declaration checks, and 27,090 registered-form
builds. Baseline comparison confirms exactly 56 declaration additions and no authored-content or
non-target declaration changes across all 22 Grade-0 lesson files. Native integrity, registration,
JSON, syntax, and strict semantic gates pass. The clean-room seed namespace also exposed and repaired a pre-existing constrained-draw failure in `grouping-first@wordSubtractMultiply`.

Session running total: **1,682 explicit assessment-step declarations** and **255 generator families**
added by this workstream.

A bounded `npm ci --ignore-scripts` attempt stalled silently; its processes and partial dependency tree were removed. Package-backed gates remain unverified.

Next efficiency-first compiler batch: Grade 2, 161 gaps across 68 selector groups.

## Session 86: Grade 1 compiler completion with full manipulative compliance

Coverage **2,388 → 2,552 / 4,471 (53.41% → 57.08%)**. Grade 1 rises from **60/224 (26.79%)** to
**224/224 (100%)**. All four Grade-1 courses are complete.

The compiler adds **164 explicit declarations** through **74 forms** and four reusable families:
`g1-add-subtract`, `g1-counting-120`, `g1-shapes-measure`, and `g1-tens-ones`. The new targets preserve
116 numeric, 42 MCQ, 3 number-line-hop, 2 fraction-bar, and 1 base-ten-compose surfaces. Independent
prompt/state-derived routes live in `src/lib/g1Independent.cjs`.

Grade 1 also introduces whole-grade manipulative compliance. All 40 interactive assessments — 4
number lines, 1 ordering task, 1 base-ten build, 2 fraction bars, 8 length comparisons, 12 clocks, and
12 place comparisons — are audited across three bands and randomized seeds through independent visible-state truth and the production evaluator.

Verification passed 66,600 focused builds, 66,600 independent checks, 31,080 evaluator builds with
192,648 assertions, 14,400 grade-wide manipulative builds with 98,864 assertions, 189,480 whole-registry
builds, 35,235 declaration checks, and 28,422 registered-form builds. Baseline comparison confirms
exactly 164 declaration additions and no authored-content or non-target declaration changes across all
56 Grade-1 lesson files. Native integrity, registration, JSON, syntax, and strict semantic gates pass.

Session running total: **1,846 explicit assessment-step declarations** and **259 generator families**
added by this workstream.

A bounded package restore stalled silently; its processes and partial dependency tree were removed.
Package-backed gates remain unverified.

Next efficiency-first compiler batch: Grade 2, 161 gaps across 68 selector groups, which would complete Grades 0–8.

## Session 87: Grade 2 compiler completion with full manipulative compliance

Coverage **2,552 → 2,713 / 4,471 (57.08% → 60.68%)**. Grade 2 rises from **47/208 (22.60%)** to
**208/208 (100%)**. All four Grade-2 courses are complete, which completes Grades 0–8.

The compiler adds **161 explicit declarations** through **68 forms** and four reusable families:
`g2-add-subtract-100`, `g2-measure-money-time`, `g2-place-value-1000`, and `g2-shapes-shares`. The new
targets preserve 106 numeric, 41 MCQ, 4 money-board, 3 odd/even-pair, 3 expression-building, 2
tap-diagram, and 2 fraction-bar surfaces. Independent prompt/state-derived routes live in
`src/lib/g2Independent.cjs`.

Grade 2 extends the generic learner-action adapter layer with parity pairing, constrained money-board
construction, and word-form token building. The whole-grade compliance audit verifies all 36
interactive assessments — 3 odd/even pairing, 4 length comparison, 10 money boards, 8 clocks, 3
expression builds, 4 place comparisons, 2 tap diagrams, and 2 fraction bars — through visible-state
truth and the production evaluator.

Verification passed 61,200 focused builds, 61,200 independent checks, 28,560 evaluator builds with
174,104 assertions, 12,960 grade-wide manipulative builds with 92,070 assertions, 197,640
whole-registry builds, 37,650 declaration checks, and 29,646 registered-form builds. Baseline
comparison confirms exactly 161 declaration additions and no authored-content or non-target
declaration changes across all 52 Grade-2 lesson files. Native integrity, registration, JSON, syntax,
and strict semantic gates pass.

Session running total: **2,007 explicit assessment-step declarations** and **263 generator families**
added by this workstream.

A bounded package restore stalled silently; its processes and partial dependency tree were removed.
Package-backed gates remain unverified.

Next efficiency-first compiler batch: G12-A, 17 true runtime gaps in `conic-sections`.

## Session 92: Algebra I compiler completion and Causal Mastery integration

Coverage **2,713 → 3,008 / 4,471 (60.68% → 67.28%)**. Grade-9 Algebra I rises from **89/384
(23.18%)** to **384/384 (100%)** across all eight courses.

The compiler adds **295 explicit declarations** through **120 forms** and eight reusable families:
`alg1-exponential`, `alg1-polynomials`, `alg1-functions`, `alg1-linear`, `alg1-quadratics`,
`alg1-radicals`, `alg1-equations`, and `alg1-systems`. The target set preserves 208 numeric, 66 MCQ,
20 `buildExpression`, and one `matchPairs` surface. Independent prompt-derived routes live in
`src/lib/algebra1Independent.cjs`.

Verification passed **108,000** focused builds, **108,000** independent checks, **50,400** evaluator
builds with **304,920** assertions, **212,040** whole-registry builds, **42,075** declaration checks,
and **31,806** registered-form builds. The repository now contains **399 generators** and **2,805
declarations**.

The CML pass adds one flagship direct sequence per Algebra I course and promotes `expLogExplore` and
`quadraticExplore` into the shared causal engine/mesh contracts. Baseline comparison confirms exactly
295 declaration additions and eight CML additions across 96 lesson files, with zero unauthorized
authored-content changes.

The widened audit repaired a pre-existing `frac-unlike-addsub@subBare` draw exhaustion, duplicate
construction tokens, static matching content, implicit-coefficient parsing, exact-fraction output,
and unconventional coefficient typography.

Next efficiency-first batch: G12-A, 17 true runtime gaps in `conic-sections`.

## Session 93 — Algebra II completion and whole-app manipulative reuse

- Completed **405** true runtime gaps across nine Grade-11 Algebra II courses.
- Algebra II: **110/515 → 515/515 (100%)**.
- Overall: **3,008/4,471 → 3,413/4,471 (76.34%)**.
- Added nine reusable generator families and **211** form contracts.
- Added exactly **405** declarations, nine CML flagships, and four prediction commitments.
- Reused existing whole-app engines; no new widget type was required.
- Promoted `argandExplore`, `signChart`, `radicalCheck`, `graphZoom`, `sequenceBuild`, and
  `unitCircleExplore` into the shared CML profile and representation mesh.
- Verification: **189,900** deterministic builds, **189,900** independent checks, **506,940**
  evaluator assertions, and **237,360** whole-registry builds across **408** generators.


## Session 94 — Grade-10 Geometry completion and full manipulative wiring

Completed all 410 true runtime gaps across the nine Grade-10 Geometry courses through 207 forms and
nine generator families. Geometry rises from 77/487 to 487/487, while overall refreshed coverage
rises from 3,413/4,471 to 3,823/4,471 (85.51%). The exact preserved surfaces are 232 numeric and 178
MCQ assessments.

Audited all 321 Geometry interactive steps and separated 29 true mathematical manipulatives from 292
response/reveal surfaces. All 29 direct manipulatives now have explicit CML contracts: nine
course-level flagships and 20 supporting wires. Existing circle, construction, coordinate,
transformation, quadrilateral, triangle, and dilation engines were reused. Three missing causal
laboratories were added: `triangleConstraintLab` for uniqueness and SSA ambiguity,
`coordinateProofLab` for live slope/midpoint/distance evidence, and `solidSliceLab` for cross-sections
and Cavalieri.

Full focused verification passed 186,300 deterministic builds, 186,300 independent checks, 86,940
evaluator builds, and 611,214 evaluator assertions. The whole-registry audit passed 417 generators
and 262,200 builds. Strict CML lint, CML integration, native integrity, registration, JSON parsing,
modified TypeScript-family syntax, targeted engine verification, and semantic comparison are green.
The semantic lock records exactly 410 declarations, 29 CML contracts, four predictions, and three
intentional widget replacements with zero unintended drift. The 45 legacy Geometry scripts have the
same 29-pass/16-stale-failure status as Session 93, so there are zero status regressions.

Package-backed gates remain unverified because the configured npm registry returned HTTP 503 during
dependency restoration. See `GEOMETRY_COMPLETION_SESSION_94.md`,
`GEOMETRY_MANIPULATIVE_AUDIT_SESSION_94.md`, and `REGRESSION_AUDIT_SESSION_94.md`.

The final standing repository gate initially exposed nine missing Geometry entries in the global independent-route registry. Session 94 now imports `geometryIndependent.cjs`, declares base routes for every `g10-*` family, and registers all 207 forms from generator metadata. The repaired gate passes 417 generators, 1,157 routes, 3,620 declarations, 54,300 declaration checks, and 39,330 registered-form builds.

## Sessions 95–96 — Precalculus and Calculus completion with advanced causal manipulatives

Completed **621** true runtime gaps across eight Precalculus and eight Calculus courses. Precalculus
rises from **102/483 to 483/483**; Calculus rises from **72/312 to 312/312**. Overall refreshed
coverage rises from **3,823/4,471 to 4,444/4,471 (99.40%)**, leaving 27 gaps outside this scope.

Added 16 authored-template generator families and 339 form contracts. Focused verification passed
**305,100** deterministic builds, **305,100** independent prompt/state checks, **142,380** production
evaluator builds, and **886,960** evaluator assertions. The global registry passes **433 generators,
302,880 builds, 1,173 independent routes, 4,241 declarations, 63,615 banded checks, and 45,432
registered-form builds**.

Reviewed all advanced interactive surfaces and identified **82 true mathematical manipulatives**: 29
in Precalculus and 53 in Calculus. All 82 now carry CML contracts, with one flagship per course and 66
supporting wires. Existing engines were reused wherever they already exposed the causal mathematics.
Three missing laboratories were created: `conicLocusLab` for focus–directrix eccentricity,
`derivativeRuleLab` for product/chain mechanisms, and `relatedRatesLab` for coupled motion under a
geometric constraint. Four passive or recognition-only moments were replaced.

The semantic lock compares all 1,129 lessons and records exactly 621 variant additions, 82 CML
contracts, 16 flagship prediction additions/upgrades, and four approved body/widget replacements,
with zero unintended authored-content drift. Native integrity, registration, JSON, strict CML,
integration, source syntax, product-state regeneration, and targeted advanced-engine gates pass.

See `PRECALCULUS_COMPLETION_SESSION_95.md`, `CALCULUS_COMPLETION_SESSION_96.md`,
`ADVANCED_MANIPULATIVE_AUDIT_SESSION_96.md`, and `REGRESSION_AUDIT_SESSION_96.md`.

## Session 97 — Statistics and Probability completion

Completed the final **27** true runtime gaps, all in `conditional-probability`. The six-course domain
rises from **333/360 to 360/360**, and overall runtime coverage reaches **4,471/4,471 (100%)**.
The new authored-template family supplies 21 forms with independent prompt/state answer routes.

Reviewed 164 statistics/probability interactive steps and identified 45 true direct manipulatives.
All 45 now carry explicit CML contracts: nine flagships and 36 supporting wires. Existing clock,
distribution, sampling, probability, regression, confidence-interval, and randomization-test engines
were retained. Added one missing engine, `conditionalTableLab`, to make condition selection,
denominator reversal, and joint-cell invariance directly manipulable.

Focused verification passes 18,900 deterministic builds, 18,900 independent checks, 8,820 evaluator
builds, and 60,900 assertions. The global gates pass 434 generators, 1,174 routes, 4,268 declarations,
64,020 declaration checks, 45,810 registered-form builds, and 305,400 whole-registry builds. Semantic
comparison records exactly 27 variants, 38 CML additions, one prediction, one approved replacement,
and zero unintended lesson drift.

## Session 101 — content defect found by restored pedagogy lint (needs a human)

`content/courses/decimal-operations/lessons/dop-02-02.json`, step `k3`: the step carries a
`predict` block but is declared `"kind": "check"`. The corpus convention (598 of 599 predict
steps) and the lint rule both require `kind: "interactive"` for prediction steps; k3's widget is
`columnCalc`, a genuine manipulative, so the intended fix is almost certainly
`"kind": "check"` → `"kind": "interactive"` — a one-word content change this session is not
permitted to make. Until a human applies it, `npm run lint:pedagogy` reports 1138/1139 and
exits 1 on exactly this step. The rule was not weakened; the content was not touched.
The defect predates Session 101: the lint is tsx-backed and had not executed since Session 98
(unreachable npm registry in Sessions 99–100), so the violation shipped unseen.

## Session 131 — distribution comparison surface continuity

- `g7-sp-gap-units` now emits `distributionCompareLab` measure mode instead of a numeric response surface.
- `g7-sp-overlap-interpret` now emits `distributionCompareLab` judge mode instead of MCQ.
- Seeded option order is preserved; independently derived answers remain unchanged.
- The Session-131 test contract sweeps support/core/stretch draws and requires schema integrity, exactly one accepted answer/conclusion, and no fallback to numeric/MCQ.

## Session 132 — probability variants preserve the causal evidence surface

- `prob-fraction` adds `trialRelFreq` and `trialTheoretical` forms.
- Seven declarations across `sp-03-02/03` move from `fractionEntry` variants to `trialProbabilityLab` variants.
- Experimental draws generate fixed successes/total evidence plus exact misconception fractions.
- Theoretical draws generate all six equally likely die outcomes and the exact favourable subset.
- The same seeded counts derive the prompt, visible evidence, accepted fraction, and every trap; rational collisions are rejected before return.
- The Session-132 test contract sweeps support/core/stretch draws and forbids fallback to `fractionEntry`.

## Session 133 — compound-event variants preserve stage structure and separate claims

- The four existing `sp-04-03` declarations retain their IDs and forms but now emit `compoundEventLab` rather than numeric/MCQ surfaces.
- Every seeded draw carries the fixed stage outcome sets, the complete ordered sample-space contract, and exact authored choices.
- Count forms grade the product of stage sizes; probability forms grade favourable-over-total by rational equivalence. The two claims are never conflated.
- Support/core/stretch seed sweeps reject duplicate outcomes, invalid favourable indices, ambiguous accepted choices, totals above 120, and fallback to answer-only surfaces.
