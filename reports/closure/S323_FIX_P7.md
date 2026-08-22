# S323 Fix Packet P7 — before/after evidence

Fixer: cowork-s323-P7-fixer. Scope: 18 lessons across patterns-factors-g4, measure-problems-g4,
parametric-polar-calculus, binomial-theorem, linear-functions. Contracts: PREMIUM_PENDING_WORKLOAD_QUEUE.csv
rows + S322_ASSESS_{F1,F6,F8,F11,F14}.md per-lesson sections. Remedial-rewrite standard: S316_ADJUDICATION_REMEDIAL_STANDARD.md.

## g4p-02-02 (The Sieve)

Defect (S322-F1): k2 byte-identical to g4p-02-01/k2 ("What is the smallest prime number?", answer 2,
identical commonErrors/feedback) — no sieve-specific framing.

Before (k2 widget): numeric, prompt "What is the smallest prime number?", answer 2.

After (k2 widget): numeric, prompt "The 3-pass crosses out 6, 9, 12, 15, and so on. Which is the
smallest number it crosses out that the 2-pass had NOT already removed?", answer 9, commonErrors
{6: even so already removed by the 2-pass; 3: the sieve number itself survives as prime},
fallback/success feedback rewritten to the sieve walk; explanationVariants "Even multiples went
first." / "Nine is the first fresh crossing."

Math verified: multiples of 3 above 3 are 6,9,12,15…; 6 and 12 are even (2-pass); 9 = 3×3 is the
smallest odd one — first fresh crossing. Cross-lesson normalized-template scan vs g4p-02-01: k2 no
longer matches any step (the remaining k1/ch1 "Is N prime or composite?" template pair is
pre-existing, unflagged, and ch1 is the declared mbPrimeCompositeMcq variant slot).

## g4p-03-02 (Shape Patterns from a Rule)

Defect (S322-F1): k2 byte-identical to g4p-03-01/k3 — the "add 6, 4-10-16-22" MCQ reused with zero variation.

Before (k2 widget): mcq "A pattern follows the rule \"add 6\", starting at 4: 4, 10, 16, 22. What comes next?" (28/132/26/44).

After (k2 widget): mcq "A shape pattern shows 2 triangles, then 4, then 6, then 8. Which rule builds it?" — correct "Add 2 triangles each step"; distractors "Double the triangles each step" (lesson-specific misconception: first gap looks like doubling, refuted by 4→6), "Add 4 triangles each step", "Start over at 2 each step". Hints/explanationVariants rewritten ("Check EVERY gap, not just the first.").

Math verified: constant gap 2; doubling 4 gives 8 ≠ 6; add-4 gives 2,6,10. Course-wide normalized-template scan: no collision.

## g4p-03-03 (Features Not in the Rule)

Defect (S322-F1): k2 was the THIRD byte-identical reuse of the "add 6, 4-10-16-22" MCQ across four consecutive lessons.

Before (k2 widget): mcq "A pattern follows the rule \"add 6\", starting at 4: 4, 10, 16, 22. What comes next?" (28/132/26/44).

After (k2 widget): mcq "The rule is \"add 4\", starting at 4: 4, 8, 12, 16. A classmate notices every term is even. Does the rule STATE that?" — correct "No — evenness is shown, not stated"; distractors "Yes — the rule names evenness directly", "No — some of the terms are odd", "Yes — starting at 4 already states it". Hints/explanationVariants rewritten to the stated-vs-shown distinction.

Math verified: 4, 8, 12, 16 all even (even start + even step stays even); rule text states only start and step. In-lesson and corpus normalized-template scan: no new collision (pre-existing k1/remedial mirror untouched, unflagged). Correct option is not the length outlier (34 vs 38 max).

## g4p-03-04 (Extending and Explaining)

Defect (S322-F1): k2 ("A pattern runs 4, 8, 16, 32. What comes next?", answer 64, commonErrors 48/34) byte-identical to g4p-03-02/k3.

Before (k2 widget): numeric, 4,8,16,32 → 64, errors [48, 34].

After (k2 widget): numeric "The stated rule is \"multiply by 2\": 6, 12, 24, 48. Apply the rule once more — what comes next?", answer 96, commonErrors [72 = added the last gap 24; 50 = added the rule number 2], fallback/success feedback and hints rewritten to the lesson's rule-vs-next-number theme. Variant declaration (g4-multiply/mbPatternsNumeric) retained.

Math verified: 48×2=96, 48+24=72, 48+2=50. Corpus normalized-template scan: no collision; 6,12,24,48 appears nowhere else in the lesson (i1: 2,4,8,16; i2: 3,6,12,24).

## g4v-01-02 (Building a Conversion Table)

Defect (S322-F11): k2 numeric byte-identical to g4v-01-01/ch1 ("A route measures 9 kilometers... Compute 9 × 1000.", answer 9000, errors 1009/111).

Before: 9 km route, answer 9000, errors [1009, 111].
After: "Apply without the opening model: A river path measures 8 kilometers, and each kilometer is 1000 meters. Compute 8 × 1000.", answer 8000, errors [1008 additive slip, 125 divide slip], success "Correct — 8000". CommonErrors shape preserved per contract (additive slip + divide-instead-of-multiply slip).

Math verified: 8×1000=8000; 1000+8=1008; 1000÷8=125. Corpus byte-scan: no collision.

## g4v-01-03 (Converting Length)

Defects (S322-F11): (1) k2 byte-identical to g4v-01-02/k3 ("700 cm ÷ 100 = 7"); (2) k3 mass mcq ("5 kilograms into grams") byte-identical to g4v-01-04/k2 and topically misplaced in a length lesson.

Before: k2 trail 700 cm ÷ 100 = 7, errors [700, 70000]; k3 mcq kilograms→grams multiply-by-1000.
After: k2 "A garden hose measures 900 centimeters, and each meter is 100 centimeters. Compute 900 ÷ 100.", answer 9, errors [900, 90000] (same misconception shape). k3 mcq "Converting 800 centimeters into meters, do you multiply or divide by 100?" — correct "Divide — meters are bigger, so fewer of them fit" (feedback: 800 cm = 8 m); distractors multiply-should-grow (80,000), number-stays-same, divide-by-1,000 (factor confusion with km→m).

Math verified: 900÷100=9; 900×100=90000; 800÷100=8; 800×100=80000. Corpus byte-scan: no collisions. Option lengths 48/39/35/15 — under leak guard.

## g4v-03-03 (Multi-Step Measurement)

Defect (S322-F11): k2 mcq byte-identical to g4v-02-04/k2 ("A crew works 5 shifts of 30 minutes, then converts the total to hours." ORDER mcq).

Before: 5 shifts × 30 min crew scenario, options built on 150 minutes.
After: "Apply without the opening model: \"A lifeguard swims 3 sessions of 40 minutes, then reports the total in hours.\" What is the correct ORDER?" — correct "Multiply to find 120 minutes, then divide by 60" (120 min = 2 h); distractors "Divide 40 by 60 first, then multiply by 3" (convert-each-first), "Add 3 and 40, then divide by 60" (mixes quantities), "Multiply 120 by 60" (wrong direction). Misconception shape preserved per contract; scenario and numbers fresh.

Math verified: 3×40=120; 120÷60=2. Corpus byte-scan: no collision.

## g4v-03-04 (Diagrams for Measurement Problems)

Defect (S322-F11): k1 mcq byte-identical to g4v-02-03/k2 ("6 equal parts of 400 m, 150 m crossed off the end").

Before: k1 on 6×400−150 (options 2,250 / 1,500 / 256 / 2,550).
After: "A bar diagram shows 5 equal parts of 300 m, with 80 m crossed off the end. What does it record?" — correct "(5 × 300) − 80 = 1,420 m"; distractors "5 × (300 − 80) = 1,100 m" (inside-every-part misread), "5 + 300 − 80 = 225 m", "(5 × 300) + 80 = 1,580 m". Numbers differ from the duplicated item AND from this lesson's c1/i1 (6×400−150) and i2/k3 (4×300, inside −50) per contract.

Math verified: 1500−80=1420; 5×220=1100; 225; 1580. The c2 figure (g4v-end-vs-inside-adjust: 6×400−150 end vs 4×(300−50) inside) remains anchored to i1's widget/predict and k3 — no mismatch introduced. Corpus byte-scan: no collision.

## bt-01-03 (Why Combinations Appear)

Defects: (1) S322-F6 — i1 treeDiagram (targetA=3, targetB=2) draws 6 leaves and prints "3 × 2 = 6 outcomes" while prompt/successFeedback described a 3-stage 2³=8 model the widget cannot render. (2) CHOICE-0006 — k3 correct option 77 chars vs longest distractor 40 (length leak).

Before (i1): prompt "Each of 3 brackets offers 2 choices... Set the tree to 3 stages of 2...", stage labels "Brackets"/"Choices per bracket", targetA 3, targetB 2, success "8 paths — and 2³ = 8...".
After (i1): prompt "For (a + b)³, group the brackets: the FIRST bracket offers 2 choices (a or b), and the LAST TWO brackets together offer 2 × 2 = 4 combined choices. Set the tree to 2 by 4...", labels "First bracket"/"Last two brackets combined", targetA 2, targetB 4, success "2 × 4 = 8 paths — the same 8 as 2³, and exactly the sum of row 3 (1 + 3 + 3 + 1)...", low/high feedback matched. Widget now renders "2 × 4 = 8 outcomes" — consistent with all prose.

Before (k3): wrong options "Because addition is commutative" (31), "Because every row starts and ends with 1" (40) vs correct 77.
After (k3): "Because addition is commutative, so a²b² and b²a² count as one term" (67), "Because every row starts and ends with 1, so the two edges always agree" (71). Ratio 1.08, diff 6 — under guard. Feedback strings unchanged and still accurate.

Math verified: 2×4=8=2³; 1+3+3+1=8; C(4,2)=6 elsewhere untouched.

## bt-02-02 (Finding a Single Term)

Defect (S322-F6): c2 and i1's predict.reveal claimed C(n,k)=C(n,n−k) "sometimes" fails to forgive reading k off the wrong exponent ("In (a+b)⁸ the same slip would give 70 instead of 56") — impossible, the identity is unconditional. k2's commonErrors labeled 70 as "k was read off the power of a", but that mechanism gives C(8,5)=56, not 70.

Fix (per contract, replaced with the mechanism-accurate 1-indexed-position misconception that ties into this lesson's k3):
- c2.body (and its byte-copy in the remedial concept): now states the a-power read is ALWAYS harmless by symmetry; the costly slip is using the term's position as k (b³ term sits fourth, k=3), which matches only when position = n−k.
- i1.predict.reveal: "Reading k off the power of a instead is harmless: C(7,4) = C(7,3) by symmetry, for every n. The slip that bites is POSITION — b³ sits in the fourth term, and using 4 as k happens to give 35 here only because 4 = 7 − 3. In (a + b)⁸ the same position slip gives C(8,4) = 70 instead of 56."
- k2.commonErrors[70].feedback: "70 is C(8,4) — the POSITION of the b³ term (fourth) was used as k. The exponent on b is the k: k = 3, and C(8,3) = 56."

Math verified: C(7,3)=35=C(7,4); C(8,3)=56=C(8,5); C(8,4)=70; position slip masked iff position (k+1) = n−k, i.e. n=2k+1 — true for n=7,k=3, false for n=8,k=3. Graded answer 56 and all other steps untouched.

## bt-02-03 (Binomials Meet Probability)

Defect (S322-F6): i1 treeDiagram (targetA=4, targetB=2) draws "4 × 2 = 8 outcomes" while prompt said "Set the tree to 4 stages of 2" and successFeedback claimed "16 equally likely paths — 2⁴".

Before: 4 stages of 2 framing, targetA 4 / targetB 2, success "16 equally likely paths — 2⁴...".
After: prompt "Four coin flips: the FIRST TWO flips give 2 × 2 = 4 outcomes, and the LAST TWO flips give 4 more. Set the tree to 4 by 4...", labels "First two flips"/"Last two flips", targetA 4 / targetB 4, success "4 × 4 = 16 equally likely paths — the same 16 as 2⁴. Six of them show exactly two heads, which is C(4,2), so that probability is 6/16.", low/high matched. Mirrors i2's own 4×4 countGrid (targetArea 16).

Math verified: 2×2=4 per flip pair; 4×4=16=2⁴; C(4,2)=6; 6/16. All other steps untouched.

## lf-02-03 (x-intercept vs y-intercept)

Defect (S322-F14): i3 used quadraticExplore (vertex form, targetA=0/targetH=0/targetK=5) to stand in for "where a line with y-intercept 5 crosses the axis" — the widget renders parabola notation and a flat slope-0 line, never y=2x+5.

Before: quadraticExplore "Flatten the curve to a = 0 and lift it to k = 5...", success invoking y = 2x + 5.
After: lineExplore with targetSlope 2 / targetIntercept 5 (the contract's named option; same field set as lf-02-01/e1 and lf-03-01/i1), prompt "Build the line y = 2x + 5. Set the slope, then slide the intercept until the line crosses the vertical axis at 5.", success preserving the lesson's y-intercept-as-output-at-x=0 / x-intercept-mirror framing, slope/intercept feedback in house style.

Math verified: y=2x+5 has y-intercept 5; slope 2 within slopeMin/Max −4..4; intercept 5 within −5..5. No other step changed.

## lf-04-01 (Line from a Point and a Slope)

Defects (S322-F14 + PROGRESSION row, steps k2/k3/ch1): ch1's "Two negatives to manage" framing was not realized (its slope was +4, so its misconception target was identical to k2's); k1/k3 shared the identical "Which equation is the line through (x, y) with slope m?" mcq template with cosmetic number changes.

Before: ch1 point (−2, 3), slope 4, b = 11 (errors 3 / −5); k3 bare mcq "(4, 1) with slope −2".
After:
- ch1: point (−2, 2), slope −3 → b = 2 − (−3)·(−2) = 2 − 6 = −4, line y = −3x − 4. The check now actually contains two negatives whose product is positive and must be subtracted — a genuinely different trap from k2's subtract-m-times-negative-x (which adds). numericErrors: 2 (stopped at y₁), 8 (treated (−3)(−2) as −6 / added the product). Hints, explanationVariants, fallback/success all rewritten.
- k3: reframed as a transfer word problem — "A candle is 1 cm tall 4 hours after lighting and burns down 2 cm each hour. Which equation gives its height y after x hours?" Same options/math (y = −2x + 9; b = 1 − (−2)·4 = 9), feedback adapted to the story (starting height 9 cm).

Math verified: 2 − 6 = −4; −3·(−2) − 4 = 2; −2·4 + 9 = 1. Answer −4 distinct from every other step answer (7, 5, 9). Variant declarations retained.

## lf-04-03 (Parallel & Perpendicular Lines)

Defects (S322-F14 + PROGRESSION row, steps k3/ch1): two same-job duplicate pairs — k1/k3 both "flip a whole-number slope" mcqs, i2/ch1 both "flip a fraction slope" numerics, with only cosmetic number changes.

Before: k3 mcq "What slope is perpendicular to y = 4x + 1?" (clone of k1's template); ch1 exactNumberLab "A line is perpendicular to y = (1/3)x + 2. What is the perpendicular line's slope?" (clone of i2's job), answer −3.
After:
- k3: graph-reading representation — "A graphed line climbs 4 up for every 1 right. A second line must cross it at a right angle. What slope does the second line need?" Same options (−1/4 correct), feedback grounded in rise/run geometry ("1/4 still climbs", "−4 is just as steep, mirrored").
- ch1: the contract's two-step build-the-perpendicular-line-through-a-point job — "Write the perpendicular: a line crosses y = (1/3)x + 2 at a right angle and passes through (2, 1). What is its b?" approxFormula rewritten to b = y − (−(1/m))·x (evaluates to exactly 7.0 with the stored constants); numericErrors 1 (stopped at y₁) and −5 (slope +3 unnegated, or added m·x₁); hints, explanationVariants, body, fallback/success rewritten; success names the finished line y = −3x + 7.

Math verified: −(1/(1/3)) = −3; b = 1 − (−3)·2 = 7; −3·2 + 7 = 1; (1/3)·(−3) = −1. Prompt template distinct from i3's "Find b for the line through..." phrasing; in-lesson normalized scan shows only the pre-existing k1/remedial mirror.

## pc-01-01 (Differentiating a Parametric Curve)

Defect (S322-F8 + CHOICE-0066): k2 correct option 71 chars vs longest wrong 19 (3.7×) — choice-length leak.

Before: wrong options "When dx/dt = 0." (15), "When both are zero." (19), "When t = 0." (11).
After: "When dx/dt = 0 and dy/dt ≠ 0 — x has stopped moving while y carries on." (71), "When dy/dt = 0 and dx/dt = 0 — both motions have paused at the same instant." (76), "When t = 0 — the tangent flattens as the parameter starts its clock." (68). Correct option and all feedback unchanged. Ratio now 0.93 (correct is no longer the longest).

Math verified: each expanded label states its own (wrong) condition accurately relative to its existing feedback: dx/dt=0 ∧ dy/dt≠0 → vertical tangent; both zero → 0/0 indeterminate/cusp; t=0 carries no special tangent property.

## pc-02-01 (Polar Area: the Slices Are Triangles)

Defects (S322-F8 + CHOICE-0068): (1) i1's predict + cml.explanation used "volume slices"/"limiting volume"/"cross-section" language on a 2-D polar-area sliceSum; (2) remedial concept figure was dr-power-rule-pattern (a power-rule derivative table); (3) k1 correct option 71 chars vs longest wrong 39 (1.8×).

After:
- i1.predict: "What changes when the number of area wedges increases?" / options about wedges and the ½r²·dθ wedge rule / reveal "...bringing the sum closer to the limiting area."
- i1.cml.explanation: "Why does a wedge sum become an area integral?" — correct "Each wedge contributes its triangle area ½r²·dθ, and refinement takes the sum to a limit."; distractors "Only the outer arc length is needed.", "The number of wedges itself is the area." Feedback strings unchanged.
- remedials[0].concept.figure: dr-power-rule-pattern → pc-polar-wedge (registered; renders the wedge-triangle ½r²·dθ construction the remedial body derives). figureId swap only — no src edit.
- k1 wrong options expanded: "Because a polar sweep only ever covers half of the full circle's angle." (71), "To cancel the double-counting where neighbouring wedges overlap each other." (75), "Because r is squared, so a ½ must balance the extra power of r." (63) vs correct 71. Feedback unchanged.

Verified: no "volume" remains in any learner-visible string; wedge area ½·r·(r dθ) = ½r²dθ; the ½ is the triangle factor, sweep-independent.

## pc-01-02 (Arc Length: a Sum of Tiny Hypotenuses) — ESCALATE (partial fix applied)

Defects (S322-F8 + CHOICE-0067): (1) c1/c2/remedial cite derivative-rules figures (dr-tangent-line: tangent to y=x² at (3,9); dr-derivative-as-function: f(x)=x² vs f'(x)=2x) unrelated to arc length; (2) k3 correct option 62 chars vs longest wrong 25 (2.5×).

Fixed in scope — k3 wrong options expanded to parallel sentences, feedback unchanged:
- "The SLOPE of the curve — the ratio of the two rates of change." (62)
- "The ACCELERATION of the point — how quickly its velocity changes." (65)
- "The AREA under the curve — the integral of y with respect to x." (63)
vs correct "The SPEED of the point — the magnitude of its velocity vector." (62). Ratio 0.95.

Escalated — figure bindings: contract requires (c1/remedial) a curve cut into tiny straight segments with dx/dy/hypotenuse Pythagorean labels and (c2) an integrand-as-speed figure. Registered-catalog survey under this packet's lesson-JSON-only constraint: distance-right-triangle (single Δx/Δy/hypotenuse segment, no curve-cut), pp-different-speeds (tracing speed, not the integrand identity), pp-pythagorean-eliminate (cos²+sin²=1), vec-* (other mechanisms) — none "actually shows" the contracted content. Needs new figures in src/components/figures.tsx + figureIds.ts registration (out of packet scope, per the F8 contract's own note).

## pc-03-01 (Motion as a Vector) — ESCALATE (no in-scope edit possible)

Defect (S322-F8): c1 and the remedial concept cite dr-derivative-as-function (scalar function/derivative plot, no vectors), unrelated to r(t)=⟨x(t),y(t)⟩ / velocity / acceleration content.

No lesson-JSON fix exists: this course registers only pc-polar-wedge and pc-primitives-gallery (dev gallery); the closest catalog candidates — vec-combining-motion (velocity ADDITION: boat + current), vec-unit-vector (û = v/|v| unit-vector construction), vec-equal-vectors, pp-param-trace (traced ellipse, no vectors) — each teach a different mechanism and would trade the unrelated-figure defect for a new figure-text mismatch. Needs a purpose-built position/velocity/acceleration-vector figure in src (out of packet scope). Lesson math re-spot-checked correct (|⟨3,4⟩|=5; a·v=0 for constant-speed circular motion at t=0).

### PROGRESSION-pc-01-02 (queue row, steps [ch1]) — question jobs assigned, repeat APPROVED

k1 ("x = 3t, y = 4t, t from 0 to 1", answer 5) and ch1 ("x = 6t, y = 8t, t from 0 to 2", answer 20) share the number-normalized template but carry distinct instructional jobs:
- k1's job: verify the arc-length formula on a straight line where the interval has length 1, so the answer IS the speed (√(3²+4²)=5). Its commonErrors target Pythagoras slips (7 = 3+4; 25 = unrooted).
- ch1's job: transfer where the elapsed-t factor becomes load-bearing — interval length 2, so length = speed × 2 (10 × 2 = 20). Its LEAD commonError (10: "That is the SPEED. It must be multiplied by the elapsed t") targets precisely the misconception k1's setup structurally hides. Body text ("A speed you can read off") frames the escalation.
This matches the S322-F8 independent assessment, which examined pc-01-02 in full and flagged only the figure bindings and k3 lengths — not this pair. Approved as an intentional escalation; no edit made.
