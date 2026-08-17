# Flagship tier audit (generated — do not hand-edit)

Regenerate with `node scripts/flagship-tier.mjs`. Thirteen dimensions, 0–3 each
(prediction · manipulation · consequence · revise · contrast · invariant ·
formalization · transfer · misconception · adaptation · a11y · mobile · polish).

**Tier rules** — A: prediction≥2 ∧ manip≥2 ∧ consequence≥2 ∧ misconception≥2 ∧ total≥30.
B: manip≥2 ∧ consequence≥2 ∧ total≥24 with one A-gate missing — or a model-grounded pick
(manip 1: e.g. fractionCompare) at conseq≥2 ∧ misconception≥2 ∧ total≥26. C: choice/entry
interaction or under the B bar. D: no interactive step, or misconception sensitivity 0.

**Prediction is quality-aware, not presence-counted.** A gate the WS-E corpus ruling
(`PREDICTION_GATE_ADJUDICATION.csv`) ordered gone — verdict REMOVE, or a KEEP copy cut by the
repetition-thinning policy — is imputed at the score it would have earned, so complying with
the ruling costs a lesson nothing. Excused by verdict + absence on disk, never by note text.
A missing REWRITE gate, or a missing gate no ruling covers, still scores 0.
Ruled removals excused in this run: **65** gates
across **65** lessons.

## Tier distribution

| Band | A | B | C | D | lessons |
| --- | --: | --: | --: | --: | --: |
| K-2 | 167 | 216 | 27 | 0 | 410 |
| 3-5 | 225 | 150 | 44 | 0 | 419 |
| 6-8 | 104 | 129 | 12 | 0 | 245 |
| HS | 190 | 361 | 76 | 0 | 627 |

**K–8 targets** — Tier A 496/200–250 ✓ · Tier B 495/200–300 ✓.

## Load-bearing K–8 concepts with no experience above Tier C

- additive-angles (best: C in mc-04-01)
- additive-vs-multiplicative (best: C in mb-01-03)
- angle-classification (best: C in mc-03-03)
- area-formula (best: C in mc-02-01)
- area-formula-choice (best: C in asv-01-03)
- area-model-1digit (best: C in mb-03-02)
- area-perimeter-word-problems (best: C in mc-02-03)
- benchmark-angles (best: C in mc-04-03)
- benchmark-compare (best: C in fa-02-02)
- benchmark-half (best: C in fa-02-01)
- chart-find (best: C in c120-02-02)
- chart-rows (best: C in c120-02-01)
- choose-steps (best: C in as100-04-03)
- comma-periods (best: C in pv2-02-03)
- comparison-equations (best: C in mb-01-02)
- composite-triangle (best: C in asv-02-02)
- decimal-expanded-form (best: C in dpv-02-02)
- decimal-word-forms (best: C in dpv-02-03)
- decompose-lshape (best: C in asv-02-01)
- divide-big (best: C in mb-04-02)
- equal-sign (best: C in as-04-02)
- esn-compute-addsub (best: C in esn-04-02)
- esn-compute-muldiv (best: C in esn-04-01)
- esn-cube-root-solve (best: C in esn-02-02)
- esn-sci-notation-large (best: C in esn-03-01)
- esn-sci-notation-small (best: C in esn-03-02)
- esn-square-root-solve (best: C in esn-02-01)
- fact-families (best: C in mult-02-04)
- fact-family (best: C in as-04-01)
- fraction-measurement (best: C in mc-05-01)
- fraction-times-whole-word (best: C in fa-05-02)
- front-end-estimation (best: C in pv2-03-03)
- geometric-basics (best: C in la-01-01)
- interpret-remainders (best: C in mb-04-03)
- kc-count-objects (best: C in kc-01-01)
- kc-decompose (best: C in kc-04-03)
- ks-compose-shapes (best: C in ks-02-03)
- ks-heavier-lighter (best: C in ks-03-02)
- ks-name-shapes (best: C in ks-01-01)
- ks-name-solids (best: C in ks-02-01)
- ks-position-words (best: C in ks-01-03)
- ks-shapes-any-way (best: C in ks-01-02)
- ks-sort-and-count (best: C in ks-03-03)
- like-denom-word-problems (best: C in fa-03-03)
- line-plot-build (best: C in mc-05-02)
- line-plot-questions (best: C in mc-05-03)
- missing-angle (best: C in mc-04-02)
- mix-jumps (best: C in c120-05-03)
- mmt-estimate (best: C in mmt-02-01)
- mmt-time-mixed (best: C in mmt-04-03)
- multi-step (best: C in mb-05-02)
- number-forms (best: C in pv2-02-01)
- order-big-numbers (best: C in pv2-05-02)
- parallel-perpendicular-identify (best: C in la-02-03)
- parity (best: C in mult-05-03)
- parity-sum (best: C in as100-05-02)
- patterns (best: C in mb-05-01)
- percent-reason (best: C in rr-04-03)
- perimeter-formula (best: C in mc-02-02)
- place-names-to-millions (best: C in pv2-01-03)
- place-value-ladder (best: C in pv2-01-01)
- pv1000-compare (best: C in pv1000-03-02)
- pv1000-order-mixed (best: C in pv1000-03-03)
- reading-big-numbers (best: C in pv2-02-02)
- reading-figures (best: C in la-01-03)
- remainders (best: C in mb-04-01)
- simplify-fractions (best: C in fa-01-03)
- skip-counting (best: C in mult-01-03)
- sp-relative-freq (best: C in sp-03-02)
- ssg2-compare-shares (best: C in ssg2-03-03)
- symmetry-application (best: C in la-04-03)
- symmetry-concept (best: C in la-04-01)
- symmetry-finding (best: C in la-04-02)
- ten-more-less (best: C in c120-05-02)
- ten-times-relationship (best: C in pv2-01-02)
- tno-compare-any (best: C in tno-04-03)
- tno-compare-ones (best: C in tno-04-02)
- tno-compare-tens (best: C in tno-04-01)
- triangle-classification (best: C in la-03-01)
- two-step-trade (best: C in as100-04-02)
- unknown-letter (best: C in mult-04-03)

## One honest gate from Tier A — prediction-eligible (36 K–8 lessons)

| lesson | course (grade) | total | focus domains | eligibility evidence |
|---|---|--:|---|---|
| sp-02-02 — Visual Overlap and What It Means | Grade 7: Sampling & Probability (G7) | 30/39 | probability; data distributions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-03b-01 — Writing the Equation y = kx | Grade 7: Proportional Relationships (G7) | 28/39 | ratios & proportions; equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02b-01 — MAD as a Ruler | Grade 7: Sampling & Probability (G7) | 28/39 | multiplication decomposition; probability | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| bv-02-03 — Reading a Line's Equation | Grade 8: Bivariate Statistics (G8) | 32/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01-02 — Multiplying and Dividing Powers of Ten | Grade 8: Exponents, Roots & Scientific Notation (G8) | 32/39 | multiplication decomposition | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01-03 — Powers of Ten and Place Value | Grade 8: Exponents, Roots & Scientific Notation (G8) | 32/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-01-03 — How Area Scales | Grade 7: Geometry (G7) | 32/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-03-02 — Vertical and Adjacent Angles | Grade 7: Geometry (G7) | 32/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-04-03 — Systems in the Real World | Grade 8: Linear Equations & Systems (G8) | 32/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| md-05-02 — The Missing Side | Measurement, Time & Data (G3) | 32/39 | data distributions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-02-01 — Testing a Table | Grade 7: Proportional Relationships (G7) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-02-03 — Tables in Real Situations | Grade 7: Proportional Relationships (G7) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-03-02 — The Better Buy | Ratios & Rates (G6) | 32/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-03-03 — Rates That Predict | Ratios & Rates (G6) | 32/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-04-03 — Probability Models in Real Situations | Grade 7: Sampling & Probability (G7) | 32/39 | probability | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rns-01-01 — What Makes a Number Rational | Grade 8: The Real Number System (G8) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rns-01-03 — Converting a Repeating Decimal to a Fraction | Grade 8: The Real Number System (G8) | 32/39 | fraction magnitude & operations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| cg-03-03 — The Triangle Family | The Coordinate Plane & Shape Families (G5) | 30/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dd-04-01 — Range: How Far Data Stretches | Data & Distributions (G6) | 30/39 | data distributions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dpv-04-03 — Rounding in Context | Powers of Ten & Decimals (G5) | 30/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-04-02 — Back-Substituting for y | Grade 8: Linear Equations & Systems (G8) | 30/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| ns-01-02 — Flip and Multiply | The Number System (G6) | 30/39 | multiplication decomposition | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02-03 — Comparing Two Populations in Real Situations | Grade 7: Sampling & Probability (G7) | 30/39 | probability | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-02-02 — When There Are Infinitely Many | Grade 8: Linear Equations & Systems (G8) | 29/39 | equations | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| pv2-03-02 — Rounding Word Problems | Place Value to a Million (G4) | 29/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dd-04b-02 — Comparing with Box Plots | Data & Distributions (G6) | 28/39 | data distributions | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| les-02-01 — When There Is No Solution | Grade 8: Linear Equations & Systems (G8) | 28/39 | equations | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-02b-01 — Ratio Pairs on the Plane | Ratios & Rates (G6) | 28/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| bv-04-02 — Relative Frequency | Grade 8: Bivariate Statistics (G8) | 33/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dpv-01-03 — ×10 and ÷10 as Ladder Moves | Powers of Ten & Decimals (G5) | 32/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| fg-03-02 — Comparing Rates of Change | Grade 8: Functions (G8) | 32/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| fg-04-02 — Reading Graph Shapes | Grade 8: Functions (G8) | 30/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01b-01 — Same Base, Add the Exponents | Grade 8: Exponents, Roots & Scientific Notation (G8) | 29/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| cg-01-03 — Graphs That Tell Stories | The Coordinate Plane & Shape Families (G5) | 28/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01b-02 — A Power of a Power | Grade 8: Exponents, Roots & Scientific Notation (G8) | 28/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01b-03 — Zero and Negative Exponents | Grade 8: Exponents, Roots & Scientific Notation (G8) | 28/39 | — | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |

## Honest Tier-B ceilings — prediction would be redundant or unsafe (9)

| lesson | course (grade) | total | status | reason |
|---|---|--:|---|---|
| ssg2-02-02 — Bigger Grids | Grade 2: Shapes & Equal Shares (G2) | 29/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| dpv-03-01 — Lining Up the Places | Powers of Ten & Decimals (G5) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rr-05-03 — Ratios Capstone | Ratios & Rates (G6) | 30/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rno-04-03 — All Four Operations with Rational Numbers | Grade 7: Rational Number Operations (G7) | 31/39 | unsafe | The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface. |
| sp-02-01 — Are Two Groups Really Different? | Grade 7: Sampling & Probability (G7) | 31/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| bv-04-01 — Reading Two-Way Tables | Grade 8: Bivariate Statistics (G8) | 33/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| fg-03-03 — Comparing Rate and Initial Value | Grade 8: Functions (G8) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rns-02-03 — The Real Number Line Has No Gaps | Grade 8: The Real Number System (G8) | 31/39 | unsafe | The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface. |
| tm-04-01 — Why the Theorem Works | Grade 8: Transformations & Measurement (G8) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |

## Upgrade backlog — K–8 Tier C/D, priority-ranked (top 60 of 83)

| # | lesson | course (grade) | tier | total | gaps | focus domains | priority |
|--:|---|---|---|--:|---|---|--:|
| 1 | mult-01-03 — Skip Counting: Multiplication Out Loud | Multiplication & Division Foundations (G3) | C | 25/39 | manip transfer adapt | multiplication decomposition; division meaning | 81 |
| 2 | mult-02-04 — Fact Families | Multiplication & Division Foundations (G3) | C | 25/39 | manip transfer adapt | multiplication decomposition; division meaning | 81 |
| 3 | mult-04-03 — Letters Stand for Numbers | Multiplication & Division Foundations (G3) | C | 25/39 | manip transfer adapt | multiplication decomposition; division meaning | 81 |
| 4 | mult-05-03 — Even × Odd: What Happens? | Multiplication & Division Foundations (G3) | C | 25/39 | manip transfer adapt | multiplication decomposition; division meaning | 81 |
| 5 | la-04-01 — What Symmetry Means | Lines & Angles (G4) | C | 21/39 | manip contrast formal transfer adapt | data distributions; geometry & transformations | 80 |
| 6 | la-04-03 — Symmetry All Around | Lines & Angles (G4) | C | 24/39 | manip transfer adapt | place-value estimation; geometry & transformations | 80 |
| 7 | mb-01-02 — Comparison Stories | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition; equations | 80 |
| 8 | mb-04-02 — Big Division | Multiply Bigger (G4) | C | 22/39 | manip contrast transfer adapt | multiplication decomposition; division meaning | 80 |
| 9 | mb-04-03 — What the Leftover Means | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition; data distributions | 80 |
| 10 | as-04-02 — The Equal Sign Means Same As | Addition & Subtraction within 20 (G1) | C | 23/39 | manip transfer adapt | data distributions | 71 |
| 11 | sp-03-02 — Estimating Probability from Trials | Grade 7: Sampling & Probability (G7) | C | 22/39 | prediction contrast formal transfer adapt | place-value estimation; probability | 71 |
| 12 | as100-04-01 — Two-Step Stories | Addition & Subtraction within 100 (G2) | C | 24/39 | manip transfer adapt | equations | 70 |
| 13 | as100-04-02 — Stories that Trade | Addition & Subtraction within 100 (G2) | C | 24/39 | manip transfer adapt | equations | 70 |
| 14 | fa-01-03 — Using the Rule (and Reversing It) | Fractions That Add Up (G4) | C | 22/39 | manip contrast transfer adapt | fraction magnitude & operations | 68 |
| 15 | fa-02-01 — Halfway Benchmarks | Fractions That Add Up (G4) | C | 24/39 | manip formal transfer adapt | fraction magnitude & operations | 68 |
| 16 | fa-02-02 — Comparing Without a Common Denominator | Fractions That Add Up (G4) | C | 25/39 | prediction manip formal transfer | fraction magnitude & operations | 68 |
| 17 | fa-03-03 — Word Problems with Like Fractions | Fractions That Add Up (G4) | C | 24/39 | manip transfer adapt | fraction magnitude & operations | 68 |
| 18 | fa-05-02 — The Shortcut and Word Problems | Fractions That Add Up (G4) | C | 22/39 | manip contrast transfer adapt | fraction magnitude & operations | 68 |
| 19 | la-01-01 — Naming the Basics | Lines & Angles (G4) | C | 21/39 | manip contrast formal transfer adapt | geometry & transformations | 68 |
| 20 | la-01-03 — Reading Geometric Figures | Lines & Angles (G4) | C | 24/39 | manip transfer adapt | geometry & transformations | 68 |
| 21 | la-02-03 — Spotting Both in Figures | Lines & Angles (G4) | C | 24/39 | manip transfer adapt | geometry & transformations | 68 |
| 22 | la-03-01 — Classifying Triangles | Lines & Angles (G4) | C | 21/39 | manip contrast formal transfer adapt | geometry & transformations | 68 |
| 23 | la-04-02 — Finding Every Line of Symmetry | Lines & Angles (G4) | C | 22/39 | manip contrast transfer adapt | geometry & transformations | 68 |
| 24 | mb-01-03 — More or Times? | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition | 68 |
| 25 | mb-03-02 — Break the Big Number | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition | 68 |
| 26 | mb-04-01 — Sharing with Leftovers | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition | 68 |
| 27 | mb-05-01 — Number Patterns | Multiply Bigger (G4) | C | 24/39 | manip transfer adapt | multiplication decomposition | 68 |
| 28 | mb-05-02 — Multi-Step Stories | Multiply Bigger (G4) | C | 22/39 | manip contrast transfer adapt | multiplication decomposition | 68 |
| 29 | mc-03-03 — Classifying Angles | Measure & Convert (G4) | C | 21/39 | manip contrast formal transfer adapt | geometry & transformations | 68 |
| 30 | mc-04-01 — Angles That Combine | Measure & Convert (G4) | C | 22/39 | manip contrast transfer adapt | geometry & transformations | 68 |
| 31 | mc-04-02 — Finding a Missing Angle | Measure & Convert (G4) | C | 22/39 | manip contrast transfer adapt | geometry & transformations | 68 |
| 32 | mc-04-03 — Benchmark Angles | Measure & Convert (G4) | C | 24/39 | manip transfer adapt | geometry & transformations | 68 |
| 33 | mc-05-01 — Measuring to the Nearest Fraction | Measure & Convert (G4) | C | 24/39 | manip transfer adapt | fraction magnitude & operations | 68 |
| 34 | pv2-01-01 — Climbing the Ladder | Place Value to a Million (G4) | C | 24/39 | manip transfer adapt | place-value estimation | 68 |
| 35 | pv2-03-03 — Front-End Estimation | Place Value to a Million (G4) | C | 22/39 | manip contrast transfer adapt | place-value estimation | 68 |
| 36 | asv-02-02 — Composite Figures with Triangles | Area, Surface Area & Volume (G6) | C | 25/39 | manip transfer adapt | geometry & transformations | 66 |
| 37 | rr-04-03 — Percents Over and Under | Ratios & Rates (G6) | C | 25/39 | manip transfer adapt | ratios & proportions | 66 |
| 38 | esn-02-01 — Evaluating Roots & Solving x² = p | Grade 8: Exponents, Roots & Scientific Notation (G8) | C | 22/39 | manip contrast transfer adapt | equations | 64 |
| 39 | esn-02-02 — Cube Roots & Solving x³ = p | Grade 8: Exponents, Roots & Scientific Notation (G8) | C | 24/39 | manip transfer adapt | equations | 64 |
| 40 | esn-04-01 — Multiplying and Dividing in Scientific Notation | Grade 8: Exponents, Roots & Scientific Notation (G8) | C | 24/39 | manip transfer adapt | multiplication decomposition | 64 |
| 41 | mmt-02-01 — Estimating Before You Measure | Grade 2: Measurement, Money & Time (G2) | C | 22/39 | prediction contrast formal transfer | place-value estimation | 64 |
| 42 | ssg2-03-03 — Comparing Halves, Thirds, and Fourths | Grade 2: Shapes & Equal Shares (G2) | C | 23/39 | prediction formal transfer adapt | division meaning | 64 |
| 43 | as-04-01 — Fact Families | Addition & Subtraction within 20 (G1) | C | 24/39 | manip transfer adapt | — | 59 |
| 44 | c120-02-01 — Rows of Ten | Count & Write to 120 (G1) | C | 24/39 | manip transfer adapt | — | 59 |
| 45 | c120-02-02 — Find a Number | Count & Write to 120 (G1) | C | 24/39 | manip transfer adapt | — | 59 |
| 46 | c120-05-02 — Ten More, Ten Less | Count & Write to 120 (G1) | C | 24/39 | manip transfer adapt | — | 59 |
| 47 | c120-05-03 — Mixing Jumps | Count & Write to 120 (G1) | C | 24/39 | manip transfer adapt | — | 59 |
| 48 | tno-04-01 — Which Has More Tens? | Grade 1: Tens & Ones (G1) | C | 24/39 | manip formal transfer adapt | — | 59 |
| 49 | tno-04-02 — Same Tens, Check the Ones | Grade 1: Tens & Ones (G1) | C | 24/39 | manip formal transfer adapt | — | 59 |
| 50 | tno-04-03 — Comparing Any Two Numbers | Grade 1: Tens & Ones (G1) | C | 24/39 | manip formal transfer adapt | — | 59 |
| 51 | as100-04-03 — Choose the Two Steps | Addition & Subtraction within 100 (G2) | C | 24/39 | manip transfer adapt | — | 58 |
| 52 | as100-05-02 — Adding Odds & Evens | Addition & Subtraction within 100 (G2) | C | 24/39 | manip transfer adapt | — | 58 |
| 53 | pv1000-03-02 — Comparing Numbers with Symbols | Grade 2: Place Value to 1,000 (G2) | C | 24/39 | manip formal transfer adapt | — | 58 |
| 54 | pv1000-03-03 — Ordering 3-Digit Numbers | Grade 2: Place Value to 1,000 (G2) | C | 24/39 | manip transfer adapt | — | 58 |
| 55 | mc-02-01 — The Area Formula | Measure & Convert (G4) | C | 22/39 | manip contrast transfer adapt | — | 56 |
| 56 | mc-02-02 — The Perimeter Formula | Measure & Convert (G4) | C | 25/39 | manip transfer adapt | — | 56 |
| 57 | mc-02-03 — Formulas in Word Problems | Measure & Convert (G4) | C | 22/39 | manip contrast transfer adapt | — | 56 |
| 58 | mc-05-02 — Building a Line Plot | Measure & Convert (G4) | C | 24/39 | manip transfer adapt | — | 56 |
| 59 | mc-05-03 — Reading Line Plot Questions | Measure & Convert (G4) | C | 22/39 | manip contrast transfer adapt | — | 56 |
| 60 | pv2-01-02 — Ten Times Bigger, Ten Times Smaller | Place Value to a Million (G4) | C | 22/39 | manip contrast transfer adapt | — | 56 |

Totals: 1701 lessons · A 686 · B 856 · C 159 · D 0.
