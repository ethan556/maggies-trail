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
| K-2 | 364 | 46 | 0 | 0 | 410 |
| 3-5 | 334 | 85 | 0 | 0 | 419 |
| 6-8 | 124 | 121 | 0 | 0 | 245 |
| HS | 368 | 206 | 53 | 0 | 627 |

**K–8 targets** — Tier A 822/200–250 ✓ · Tier B 252/200–300 ✓.

## Load-bearing K–8 concepts with no experience above Tier C

- none — every remediation-target concept has a Tier-B-or-better experience ✓

## One honest gate from Tier A — prediction-eligible (55 K–8 lessons)

| lesson | course (grade) | total | focus domains | eligibility evidence |
|---|---|--:|---|---|
| tse-01b-02 — The Multiplier Inside a Percent Increase | Grade 7: Two-Step Equations & Inequalities (G7) | 30/39 | multiplication decomposition; ratios & proportions; equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-03b-01 — Writing the Equation y = kx | Grade 7: Proportional Relationships (G7) | 31/39 | ratios & proportions; equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02b-01 — MAD as a Ruler | Grade 7: Sampling & Probability (G7) | 31/39 | multiplication decomposition; probability | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02-02 — Visual Overlap and What It Means | Grade 7: Sampling & Probability (G7) | 30/39 | probability; data distributions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02b-02 — How Many MADs Apart? | Grade 7: Sampling & Probability (G7) | 30/39 | multiplication decomposition; probability | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| tse-01b-01 — Factoring: Distribution Run Backwards | Grade 7: Two-Step Equations & Inequalities (G7) | 29/39 | equations; data distributions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| bv-02-03 — Reading a Line's Equation | Grade 8: Bivariate Statistics (G8) | 32/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dpv-04-03 — Rounding in Context | Powers of Ten & Decimals (G5) | 32/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01-02 — Multiplying and Dividing Powers of Ten | Grade 8: Exponents, Roots & Scientific Notation (G8) | 32/39 | multiplication decomposition | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| esn-01-03 — Powers of Ten and Place Value | Grade 8: Exponents, Roots & Scientific Notation (G8) | 32/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-01-03 — How Area Scales | Grade 7: Geometry (G7) | 32/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-03-02 — Vertical and Adjacent Angles | Grade 7: Geometry (G7) | 32/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-04-02 — Back-Substituting for y | Grade 8: Linear Equations & Systems (G8) | 32/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-04-03 — Systems in the Real World | Grade 8: Linear Equations & Systems (G8) | 32/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| md-05-02 — The Missing Side | Measurement, Time & Data (G3) | 32/39 | data distributions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| ns-01-02 — Flip and Multiply | The Number System (G6) | 32/39 | multiplication decomposition | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pv2-03-02 — Rounding Word Problems | Place Value to a Million (G4) | 32/39 | place-value estimation | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-02-01 — Testing a Table | Grade 7: Proportional Relationships (G7) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-02-03 — Tables in Real Situations | Grade 7: Proportional Relationships (G7) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-03-02 — The Better Buy | Ratios & Rates (G6) | 32/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-03-03 — Rates That Predict | Ratios & Rates (G6) | 32/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-04-03 — Probability Models in Real Situations | Grade 7: Sampling & Probability (G7) | 32/39 | probability | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rns-01-01 — What Makes a Number Rational | Grade 8: The Real Number System (G8) | 32/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rns-01-03 — Converting a Repeating Decimal to a Fraction | Grade 8: The Real Number System (G8) | 32/39 | fraction magnitude & operations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| rr-02b-01 — Ratio Pairs on the Plane | Ratios & Rates (G6) | 31/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| cg-03-03 — The Triangle Family | The Coordinate Plane & Shape Families (G5) | 30/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dd-04-01 — Range: How Far Data Stretches | Data & Distributions (G6) | 30/39 | data distributions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-03b-01 — Three Sides, One Triangle | Grade 7: Geometry (G7) | 30/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02-03 — Comparing Two Populations in Real Situations | Grade 7: Sampling & Probability (G7) | 30/39 | probability | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-02b-03 — Is the Gap Big Enough? | Grade 7: Sampling & Probability (G7) | 30/39 | probability | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| sp-03-03 — Probability in Real Situations | Grade 7: Sampling & Probability (G7) | 30/39 | probability | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| tm-01b-01 — Translations as Coordinate Rules | Grade 8: Transformations & Measurement (G8) | 30/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| tm-01b-02 — Reflections as Coordinate Rules | Grade 8: Transformations & Measurement (G8) | 30/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| dd-04b-02 — Comparing with Box Plots | Data & Distributions (G6) | 29/39 | data distributions | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| ee-02b-01 — Naming the Parts | Expressions & Equations (G6) | 29/39 | equations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| g7-03b-02 — When the Conditions Leave a Choice | Grade 7: Geometry (G7) | 29/39 | geometry & transformations | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| les-02-02 — When There Are Infinitely Many | Grade 8: Linear Equations & Systems (G8) | 29/39 | equations | 1 exploratory step expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-04b-01 — Simple Interest | Grade 7: Proportional Relationships (G7) | 29/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-04b-02 — Commission and Fees | Grade 7: Proportional Relationships (G7) | 29/39 | ratios & proportions | 3 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |
| pr-04b-03 — Percent Error | Grade 7: Proportional Relationships (G7) | 29/39 | ratios & proportions | 2 exploratory steps expose a manipulable cause-and-effect state that can support prediction before action. |

## Honest Tier-B ceilings — prediction would be redundant or unsafe (15)

| lesson | course (grade) | total | status | reason |
|---|---|--:|---|---|
| mmt-01-02 — Measuring with Different Starting Points | Grade 2: Measurement, Money & Time (G2) | 30/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| mmt-01-03 — Choosing the Right Unit | Grade 2: Measurement, Money & Time (G2) | 30/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| mmt-05-01 — Reading a Picture Graph | Grade 2: Measurement, Money & Time (G2) | 29/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| mmt-05-02 — Reading a Bar Graph | Grade 2: Measurement, Money & Time (G2) | 29/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| ssg2-02-02 — Bigger Grids | Grade 2: Shapes & Equal Shares (G2) | 29/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| ssg2-02-03 — Grids in Everyday Objects | Grade 2: Shapes & Equal Shares (G2) | 29/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| dop-01-03 — Writing & Reading Expressions | Decimal & Whole-Number Operations (G5) | 29/39 | unsafe | The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface. |
| dpv-03-01 — Lining Up the Places | Powers of Ten & Decimals (G5) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rr-05-03 — Ratios Capstone | Ratios & Rates (G6) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rno-04-03 — All Four Operations with Rational Numbers | Grade 7: Rational Number Operations (G7) | 31/39 | unsafe | The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface. |
| sp-02-01 — Are Two Groups Really Different? | Grade 7: Sampling & Probability (G7) | 31/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| bv-04-01 — Reading Two-Way Tables | Grade 8: Bivariate Statistics (G8) | 33/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| fg-03-03 — Comparing Rate and Initial Value | Grade 8: Functions (G8) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |
| rns-02-03 — The Real Number Line Has No Gaps | Grade 8: The Real Number System (G8) | 31/39 | unsafe | The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface. |
| tm-04-01 — Why the Theorem Works | Grade 8: Transformations & Measurement (G8) | 32/39 | redundant | Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship. |

## Upgrade backlog — K–8 Tier C/D, priority-ranked (top 60 of 0)

| # | lesson | course (grade) | tier | total | gaps | focus domains | priority |
|--:|---|---|---|--:|---|---|--:|

Totals: 1701 lessons · A 1190 · B 458 · C 53 · D 0.
