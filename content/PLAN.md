# Numera Content Plan — Grade 3 Math, full-year coverage

All content is authored original for Numera. Coverage maps to the standard US
grade-3 scope (operations & algebraic thinking, base-ten, fractions, measurement &
data, geometry). Course 1 is the flagship; its best lesson becomes the frozen
gold-standard exemplar. Authoring loop per lesson: draft JSON → `validate:content` →
`lint:pedagogy` → self-verify pass (re-derive every answer, confirm each wrong-answer
feedback diagnoses a real misconception, confirm interactive success is detectable) →
fix → commit. Authoring guideline (from P1 critique): when a lesson teaches two separable ideas, split them across two conceptTags so the adaptive engine can diagnose each independently; single-idea lessons keep one tag.

**GOLD STANDARD (frozen):** `mult-01-01` is the exemplar every future lesson is measured against — 9-step shape (c/i/k/c/k/i/k/ch/r), every wrong answer diagnosing a named mechanism, dual explanations with genuinely different angles, remedials that reteach rather than repeat. Do not edit it except for verified factual errors; the playthrough test intentionally couples to its text.

Status legend: ✅ authored · ⬜ planned

## Course 1 — Multiplication & Division Foundations (flagship)

**Ch1 Equal Groups**
- ✅ mult-01-01 Groups of: What Multiplication Means (`equal-groups`, `mult-meaning`)
- ✅ mult-01-02 Arrays: Rows and Columns (`arrays`)
- ✅ mult-01-03 Skip Counting as Multiplying (`skip-count`)
- ✅ mult-01-04 Hops on the Number Line (`numberline-mult`)
- ✅ mult-01-05 The Flip Trick: Why 3×4 = 4×3 (`commutative`)

**Ch2 Meet Division**
- ✅ mult-02-01 Fair Shares (`sharing-division`)
- ✅ mult-02-02 How Many Groups? (`grouping-division`)
- ✅ mult-02-03 Division Is a Missing Factor (`missing-factor`)
- ✅ mult-02-04 Fact Families (`fact-families`)
- ✅ mult-02-05 The Strange Ones: ×1, ×0, ÷1 (`identity-zero`)

**Ch3 Fact Fluency Tricks**
- ✅ mult-03-01 Doubles: the ×2 Machine (`times-2`)
- ✅ mult-03-02 Fives and Tens (`times-5-10`)
- ✅ mult-03-03 Double-Double: ×4 and ×8 (`double-double`)
- ✅ mult-03-04 The Nines Pattern (`times-9`)
- ✅ mult-03-05 Split It: the Break-Apart Trick for 6, 7, 8 (`distributive`)

**Ch4 Word-Problem Workshop**
- ✅ mult-04-01 Which Operation? (`op-choice`)
- ✅ mult-04-02 What's Unknown: Group Size or Group Count? (`unknown-position`)
- ✅ mult-04-03 Letters Stand for Numbers (`unknown-letter`)
- ✅ mult-04-04 Two-Step Problems (`two-step`)
- ✅ mult-04-05 Does the Answer Make Sense? (`reasonableness`)

**Ch5 Number Patterns**
- ✅ mult-05-01 Patterns in the Addition Table (`addition-patterns`)
- ✅ mult-05-02 Patterns in the Multiplication Table (`mult-patterns`)
- ✅ mult-05-03 Even × Odd: What Happens? (`parity`)
- ✅ mult-05-04 Multiples on the Hundred Chart (`multiples`)

## Course 2 — Place Value & Big Numbers

**Ch1 Inside a Number**
- ✅ pv-01-01 Hundreds, Tens, Ones (`place-value`)
- ✅ pv-01-02 Build and Break Numbers (`expanded-form`)
- ✅ pv-01-03 Which Is Bigger? (`compare-numbers`)
- ✅ pv-01-04 Ten of These Is One of Those (`unit-trading`)

**Ch2 Rounding**
- ✅ pv-02-01 The Closer Ten (`round-10`)
- ✅ pv-02-02 The Closer Hundred (`round-100`)
- ✅ pv-02-03 The Halfway Rule (`round-half`)
- ✅ pv-02-04 Estimating in Stories (`estimation`)

**Ch3 Adding & Subtracting to 1,000**
- ✅ pv-03-01 Friendly-Number Jumps (`mental-add`)
- ✅ pv-03-02 Regrouping You Can See (`regroup-add`)
- ✅ pv-03-03 Subtracting Across a Zero (`regroup-sub`)
- ✅ pv-03-04 Check It with an Estimate (`estimate-check`)

**Ch4 Multiplying by Tens**
- ✅ pv-04-01 4 × 60 Is 4 × 6 Tens (`mult-tens`)
- ✅ pv-04-02 The Zero Pattern (`zero-pattern`)
- ✅ pv-04-03 Tens in Stories (`tens-problems`)

## Course 3 — Fractions from Scratch

**Ch1 What's a Fraction?**
- ✅ fr-01-01 Cutting into Equal Parts (`equal-parts`)
- ✅ fr-01-02 Unit Fractions: One Piece (`unit-fraction`)
- ✅ fr-01-03 Counting Pieces: a/b (`build-fraction`)
- ✅ fr-01-04 Top Number, Bottom Number (`num-denom`)

**Ch2 Fractions on the Number Line**
- ✅ fr-02-01 Cutting the Line (`nl-partition`)
- ✅ fr-02-02 Locating 1/b (`nl-unit`)
- ✅ fr-02-03 Locating a/b (`nl-fraction`)
- ✅ fr-02-04 Fractions Past One (`nl-beyond-one`)

**Ch3 Equivalent Fractions**
- ✅ fr-03-01 Same Point, Different Names (`equivalent`)
- ✅ fr-03-02 Seeing 2/4 = 1/2 (`equiv-models`)
- ✅ fr-03-03 Whole Numbers in Disguise (`whole-as-fraction`)

**Ch4 Comparing Fractions**
- ✅ fr-04-01 Same Bottom, Compare Tops (`compare-same-denom`)
- ✅ fr-04-02 Same Top, Compare Bottoms (`compare-same-num`)
- ✅ fr-04-03 Why 1/3 Beats 1/4 (`unit-size`)
- ✅ fr-04-04 Only If the Wholes Match (`same-whole`)

## Course 4 — Measurement, Time & Data

**Ch1 Time to the Minute**
- ✅ md-01-01 Reading the Clock (`read-clock`)
- ✅ md-01-02 Minutes Before and After (`time-relative`)
- ✅ md-01-03 Elapsed Time on a Number Line (`elapsed-time`)

**Ch2 Grams & Liters**
- ✅ md-02-01 How Heavy? Grams and Kilograms (`mass`)
- ✅ md-02-02 How Much? Liters (`volume`)
- ✅ md-02-03 Measure-and-Solve Stories (`measure-problems`)

**Ch3 Picture the Data**
- ✅ md-03-01 Pictographs with a Key (`pictograph`)
- ✅ md-03-02 Scaled Bar Graphs (`bar-graph`)
- ✅ md-03-03 Asking the Graph Questions (`graph-questions`)
- ✅ md-03-04 Line Plots with Halves and Quarters (`line-plot`)

**Ch4 Area**
- ✅ md-04-01 Covering with Squares (`tiling`)
- ✅ md-04-02 Rows × Columns = Area (`area-multiply`)
- ✅ md-04-03 The Break-Apart Rectangle (`area-distributive`)
- ✅ md-04-04 Odd Shapes: Add the Pieces (`area-additive`)

**Ch5 Perimeter**
- ✅ md-05-01 Walking the Fence (`perimeter`)
- ✅ md-05-02 The Missing Side (`missing-side`)
- ✅ md-05-03 Same Area, Different Fence (`area-vs-perimeter`)

## Course 5 — Shapes & Space

**Ch1 Shape Families**
- ✅ geo-01-01 What Makes a Shape a Shape? (`attributes`)
- ✅ geo-01-02 The Quadrilateral Family (`quadrilaterals`)
- ✅ geo-01-03 Squares Are Rectangles?! (`shape-hierarchy`)

**Ch2 Draw & Sort**
- ✅ geo-02-01 Sorting by Rules (`sorting-rules`)
- ✅ geo-02-02 The Misfits (`non-examples`)

**Ch3 Equal Parts (bridge to fractions)**
- ✅ geo-03-01 Splitting Shapes Fairly (`partition-shapes`)
- ✅ geo-03-02 Naming the Parts (`parts-as-fractions`)

## Daily Challenges (P5)
30 days × 5 categories = 150 standalone dated problems, each with a 3-hint ladder and
dual explanations, drawn from the conceptTag pools above. Pre-generated through the same
authoring + lint loop.

# Grade 4

## Course 6 — Multiply Bigger

**Ch1 Times as Many**
- ✅ mb-01-01 Times as Many (`times-as-many`)
- ✅ mb-01-02 Comparison Stories (`comparison-equations`)
- ✅ mb-01-03 More or Times? (`additive-vs-multiplicative`)

**Ch2 Factors & Multiples**
- ✅ mb-02-01 Factor Pairs (`factors`)
- ✅ mb-02-02 Multiples on the Trail (`multiples`)
- ✅ mb-02-03 Prime and Composite (`prime-composite`)

**Ch3 The Area Model**
- ✅ mb-03-01 Tens Times (`multiply-tens`)
- ✅ mb-03-02 Break the Big Number (`area-model-1digit`)
- ✅ mb-03-03 Two-Digit Times Two-Digit (`area-model-2digit`)

**Ch4 Division with Leftovers**
- ✅ mb-04-01 Sharing with Leftovers (`remainders`)
- ✅ mb-04-02 Big Division (`divide-big`)
- ✅ mb-04-03 What the Leftover Means (`interpret-remainders`)

**Ch5 Patterns & Multi-Step**
- ✅ mb-05-01 Number Patterns (`patterns`)
- ✅ mb-05-02 Multi-Step Stories (`multi-step`)

## Course 7 — Place Value to a Million

**Ch1 The ×10 Ladder**
- ✅ pv2-01-01 Climbing the Ladder (`place-value-ladder`)
- ✅ pv2-01-02 Ten Times Bigger, Ten Times Smaller (`ten-times-relationship`)
- ✅ pv2-01-03 Naming Six-Digit Places (`place-names-to-millions`)

**Ch2 Reading & Writing Big Numbers**
- ✅ pv2-02-01 Standard, Word, and Expanded Form (`number-forms`)
- ✅ pv2-02-02 Reading Big Numbers Aloud (`reading-big-numbers`)
- ✅ pv2-02-03 Comma Periods (`comma-periods`)

**Ch3 Rounding Any Place**
- ✅ pv2-03-01 Rounding to Any Place (`round-any-place`)
- ✅ pv2-03-02 Rounding Word Problems (`rounding-estimation`)
- ✅ pv2-03-03 Front-End Estimation (`front-end-estimation`)

**Ch4 Adding & Subtracting Big Numbers**
- ✅ pv2-04-01 Adding with Regrouping (`add-regroup-big`)
- ✅ pv2-04-02 Subtracting with Regrouping (`subtract-regroup-big`)
- ✅ pv2-04-03 Subtracting Across Zeros (`subtract-across-zeros`)

**Ch5 Comparing & Ordering**
- ✅ pv2-05-01 Comparing Big Numbers (`compare-big-numbers`)
- ✅ pv2-05-02 Ordering Big Numbers (`order-big-numbers`)

## Course 8 — Fractions That Add Up

**Ch1 Equivalence, Derived**
- ✅ fa-01-01 Same Amount, New Cut (`equivalence-recap`)
- ✅ fa-01-02 The ×n/×n Rule, Derived (`equivalence-rule-derived`)
- ✅ fa-01-03 Using the Rule (and Reversing It) (`simplify-fractions`)

**Ch2 Benchmark Comparisons**
- ✅ fa-02-01 Halfway Benchmarks (`benchmark-half`)
- ✅ fa-02-02 Comparing Without a Common Denominator (`benchmark-compare`)
- ✅ fa-02-03 Ordering with Benchmarks (`benchmark-order`)

**Ch3 Adding & Subtracting Like Denominators**
- ✅ fa-03-01 Adding Like Fractions (`add-like-denom`)
- ✅ fa-03-02 Subtracting Like Fractions (`subtract-like-denom`)
- ✅ fa-03-03 Word Problems with Like Fractions (`like-denom-word-problems`)

**Ch4 Mixed Numbers**
- ✅ fa-04-01 Improper to Mixed (`improper-to-mixed`)
- ✅ fa-04-02 Mixed to Improper (`mixed-to-improper`)
- ✅ fa-04-03 Adding & Subtracting Mixed Numbers (`mixed-number-add-subtract`)

**Ch5 Multiplying a Fraction by a Whole Number**
- ✅ fa-05-01 Repeated Addition of Fractions (`fraction-times-whole`)
- ✅ fa-05-02 The Shortcut and Word Problems (`fraction-times-whole-word`)

## Course 9 — Measure & Convert

**Ch1 Converting Units**
- ✅ mc-01-01 Metric Prefixes as Badges (`metric-badges`)
- ✅ mc-01-02 Converting Length (`convert-length`)
- ✅ mc-01-03 Converting Mass & Volume (`convert-mass-volume`)

**Ch2 Area & Perimeter Formulas**
- ✅ mc-02-01 The Area Formula (`area-formula`)
- ✅ mc-02-02 The Perimeter Formula (`perimeter-formula`)
- ✅ mc-02-03 Formulas in Word Problems (`area-perimeter-word-problems`)

**Ch3 Angles as Measurement**
- ✅ mc-03-01 What a Degree Measures (`degree-measurement`)
- ✅ mc-03-02 Measuring with a Protractor (`protractor-reading`)
- ✅ mc-03-03 Classifying Angles (`angle-classification`)

**Ch4 Additive Angles**
- ✅ mc-04-01 Angles That Combine (`additive-angles`)
- ✅ mc-04-02 Finding a Missing Angle (`missing-angle`)
- ✅ mc-04-03 Benchmark Angles (`benchmark-angles`)

**Ch5 Line Plots with Fractions**
- ✅ mc-05-01 Measuring to the Nearest Fraction (`fraction-measurement`)
- ✅ mc-05-02 Building a Line Plot (`line-plot-build`)
- ✅ mc-05-03 Reading Line Plot Questions (`line-plot-questions`)

## Course 10 — Lines & Angles

**NOTE: 4 chapters (not 5) — ROADMAP.md's own topic list for this course names exactly four
clusters (points/lines/rays, parallel & perpendicular, classifying by angles, symmetry).
Scoped honestly rather than padded to match other G4 courses' 5-chapter pattern.
Total: 4 chapters x 3 lessons = 12 lessons (verified by explicit count, not assumed).**

**Ch1 Points, Lines & Rays**
- ✅ la-01-01 Naming the Basics (`geometric-basics`)
- ✅ la-01-02 Two Rays Make an Angle (`angle-formation`)
- ✅ la-01-03 Reading Geometric Figures (`reading-figures`)

**Ch2 Parallel & Perpendicular**
- ✅ la-02-01 Lines That Never Meet (`parallel-lines`)
- ✅ la-02-02 Lines That Cross Exactly Right (`perpendicular-lines`)
- ✅ la-02-03 Spotting Both in Figures (`parallel-perpendicular-identify`)

**Ch3 Classifying Shapes by Angles**
- ✅ la-03-01 Classifying Triangles (`triangle-classification`)
- ✅ la-03-02 A Triangle's Angles Always Sum to 180° (`triangle-angle-sum`)
- ✅ la-03-03 Classifying Quadrilaterals (`quadrilateral-classification`)

**Ch4 Lines of Symmetry**
- ✅ la-04-01 What Symmetry Means (`symmetry-concept`)
- ✅ la-04-02 Finding Every Line of Symmetry (`symmetry-finding`)
- ✅ la-04-03 Symmetry All Around (`symmetry-application`)


# ============================================================
# GRADE 5 (band 3) — CCSS 5.OA / 5.NBT / 5.NF / 5.MD / 5.G
# 5-course map per ROADMAP.md "Grade 5 course map" (plan of record).
# Chapter/lesson counts scoped honestly per course at build time.
# ============================================================

## Course 11 — Powers of Ten & Decimals  (slug: decimals-place-value, 5.NBT.1-4)

**Prerequisite edge: place-value-million (G4). The direct payoff of the ×10 ladder —
now extended DOWNWARD below the ones place. Chapter/lesson counts set honestly as each
chapter is scoped; NOT pre-committed to a G4-matching number.**

**Ch1 The ×10 / ÷10 Ladder Below One** (`ladder-below-one`)
- ✅ dpv-01-01 Tenths: The First Rung Below One (`tenths-intro`)
- ✅ dpv-01-02 Hundredths and Thousandths (`smaller-rungs`)
- ✅ dpv-01-03 ×10 and ÷10 as Ladder Moves (`ladder-moves`)

**Ch2 Reading & Writing Decimals** (`reading-decimals`)
- ✅ dpv-02-01 Place Names After the Point (`decimal-place-names`)
- ✅ dpv-02-02 Expanded Form with Decimals (`decimal-expanded-form`)
- ✅ dpv-02-03 Words to Decimals and Back (`decimal-word-forms`)

**Ch3 Comparing Decimals** (`comparing-decimals`)
- ✅ dpv-03-01 Lining Up the Places (`compare-align-places`)
- ✅ dpv-03-02 The Trailing-Zero Trap (`trailing-zeros`)
- ✅ dpv-03-03 Ordering a Set of Decimals (`order-decimals`)

**Ch4 Rounding Decimals** (`rounding-decimals`)
- ✅ dpv-04-01 Rounding to a Whole (`round-to-whole`)
- ✅ dpv-04-02 Rounding to Any Decimal Place (`round-any-decimal-place`)
- ✅ dpv-04-03 Rounding in Context (`round-decimals-word`)


## Course 12 — Decimal & Whole-Number Operations  (slug: decimal-operations, 5.OA.1-2 + 5.NBT.5-7)

**Prerequisite edge: multiply-bigger (G4). Honestly scoped as 5 chapters (more operational
ground than Course 11) — counts per chapter confirmed at build time, NOT pattern-matched.
Lesson id prefix: dop-.**

**Ch1 Order of Operations** (`order-of-operations`, 5.OA.1-2)
- ✅ dop-01-01 Why Order Matters (`order-matters`)
- ✅ dop-01-02 Grouping Symbols First (`grouping-symbols`)
- ✅ dop-01-03 Writing & Reading Expressions (`expression-forms`)

**Ch2 The Standard Multiplication Algorithm** (`standard-multiplication`, 5.NBT.5)
- ✅ dop-02-01 Partial Products Recap (`partial-products`)
- ✅ dop-02-02 The Standard Algorithm (`standard-algorithm`)
- ✅ dop-02-03 Multi-Digit × Multi-Digit (`multidigit-multiply`)

**Ch3 Dividing by Two-Digit Numbers** (`two-digit-division`, 5.NBT.6)
- ✅ dop-03-01 Estimating the Quotient (`estimate-quotient`)
- ✅ dop-03-02 Long Division, Two-Digit Divisor (`long-division-2digit`)
- ✅ dop-03-03 Interpreting Remainders (`remainder-meaning`)

**Ch4 Adding & Subtracting Decimals** (`decimal-add-subtract`, 5.NBT.7)
- ✅ dop-04-01 Line Up the Points (`align-points`)
- ✅ dop-04-02 Padding & Regrouping (`decimal-regroup`)
- ✅ dop-04-03 Decimal Sums in Context (`decimal-addsub-word`)

**Ch5 Multiplying & Dividing Decimals** (`decimal-multiply-divide`, 5.NBT.7)
- ✅ dop-05-01 Counting Decimal Places (`count-places`)
- ✅ dop-05-02 Multiplying Decimals (`decimal-multiply`)
- ✅ dop-05-03 Dividing Decimals (`decimal-divide`)


## Course 13 — Multiplying & Dividing Fractions  (slug: fractions-multiply, 5.NF.1-7)

**Prerequisite edge: fractions-add (G4). Honestly scoped as 5 chapters with CONTENT-WEIGHTED
lesson counts (3+2+3+2+3 = 13 lessons, NOT a uniform 5×3 — fraction×whole and scaling are
lighter topics). Lesson id prefix: fm-. Verify ALL fraction arithmetic with Python Fraction
(exact; reduce every answer).**

**Ch1 Adding & Subtracting Unlike Denominators** (`unlike-denominators`, 5.NF.1-2) — 3 lessons
- ✅ fm-01-01 Finding a Common Denominator (`common-denominator`)
- ✅ fm-01-02 Adding Unlike Fractions (`add-unlike`)
- ✅ fm-01-03 Subtracting Unlike Fractions (`subtract-unlike`)

**Ch2 Multiplying Fractions by Whole Numbers** (`fraction-times-whole`, 5.NF.4a) — 2 lessons
- ✅ fm-02-01 Groups of a Fraction (`groups-of-fraction`)
- ✅ fm-02-02 A Fraction of a Number (`fraction-of-number`)

**Ch3 Multiplying Fraction by Fraction** (`fraction-times-fraction`, 5.NF.4b) — 3 lessons
- ✅ fm-03-01 The Area Model (`fraction-area-model`)
- ✅ fm-03-02 Multiply Across (`multiply-across`)
- ✅ fm-03-03 Simplify the Product (`simplify-product`)

**Ch4 Scaling & Resizing** (`scaling`, 5.NF.5) — 2 lessons
- ✅ fm-04-01 Bigger, Smaller, or Same? (`scaling-compare`)
- ✅ fm-04-02 Scaling Without Computing (`scaling-reason`)

**Ch5 Dividing with Unit Fractions** (`unit-fraction-division`, 5.NF.7) — 3 lessons
- ✅ fm-05-01 Wholes into Unit Fractions (`whole-div-unit`)
- ✅ fm-05-02 Unit Fractions into Wholes (`unit-div-whole`)
- ✅ fm-05-03 Division in Context (`fraction-div-word`)


## Course 14 — Volume & Measurement  (slug: volume-measurement, 5.MD.1-5)

**Prerequisite edge: measure-convert (G4). Honestly scoped as 5 chapters, CONTENT-WEIGHTED
3+2+2+3+2 = 12 lessons (conversion is 3; line plots and unit cubes are lighter at 2 each;
the volume formula is the heaviest strand at 3; composite volume 2). Lesson id prefix: vm-.
Verify: Decimal for measurement decimals (never float); Fraction for line-plot fraction ops;
integer multiplication for cube counts and V=l×w×h.**

**Ch1 Converting Units** (`unit-conversion`, 5.MD.1) — 3 lessons
- ✅ vm-01-01 Converting Metric Units (`metric-convert`)
- ✅ vm-01-02 Converting Customary Units (`customary-convert`)
- ✅ vm-01-03 Multi-Step Conversions (`multistep-convert`)

**Ch2 Line Plots with Fractions** (`line-plots`, 5.MD.2) — 2 lessons
- ✅ vm-02-01 Reading a Line Plot (`read-line-plot`)
- ✅ vm-02-02 Using Line Plot Data (`line-plot-operations`)

**Ch3 Volume as Unit Cubes** (`unit-cubes`, 5.MD.3-4) — 2 lessons
- ✅ vm-03-01 What Volume Means (`volume-meaning`)
- ✅ vm-03-02 Counting Cubes (`count-cubes`)

**Ch4 The Volume Formula** (`volume-formula`, 5.MD.5a-b) — 3 lessons
- ✅ vm-04-01 Layers of Cubes (`volume-layers`)
- ✅ vm-04-02 V = l × w × h (`volume-lwh`)
- ✅ vm-04-03 V = B × h (`volume-bh`)

**Ch5 Composite Volume** (`composite-volume`, 5.MD.5c) — 2 lessons
- ✅ vm-05-01 Adding Volumes (`additive-volume`)
- ✅ vm-05-02 Splitting Solids (`decompose-solid`)

## Course 15 — The Coordinate Plane & Shape Families (`coordinate-geometry`, 5.OA.3 + 5.G.1–4) — 10 lessons

Content-weighted split (scoped at build time from the ROADMAP sketch): the coordinate
strand is front-loaded (5.G.1 is the band's most manipulable-friendly standard —
`plotPoint` carries it), 5.OA.3 is a compact two-lesson bridge, and the shape-hierarchy
strand gets the 3+2 it needs for 5.G.3 to land before 5.G.4 formalizes it.

**Ch1 The Coordinate Plane** (`coordinate-plane`, 5.G.1–2) — 3 lessons
- ✅ cg-01-01 The Coordinate Plane (`coord-read`)
- ✅ cg-01-02 Plotting Points (`coord-plot`)
- ✅ cg-01-03 Graphs That Tell Stories (`coord-realworld`)

**Ch2 Two Rules, One Graph** (`pattern-pairs`, 5.OA.3) — 2 lessons
- ✅ cg-02-01 Two Patterns at Once (`two-rules`)
- ✅ cg-02-02 Pairs on the Plane (`pattern-graph`)

**Ch3 Shape Families** (`shape-families`, 5.G.3) — 3 lessons
- ✅ cg-03-01 Attributes Carry Down (`attribute-inherit`)
- ✅ cg-03-02 The Quadrilateral Family (`quad-family`)
- ✅ cg-03-03 The Triangle Family (`triangle-family`)

**Ch4 Classifying Shapes** (`classify-shapes`, 5.G.4) — 2 lessons
- ✅ cg-04-01 Sorting by Properties (`classify-properties`)
- ✅ cg-04-02 True in the Hierarchy (`hierarchy-logic`)

## Course 16 — Ratios & Rates (`ratios-rates`, Grade 6, 6.RP.1–3)

**Ch1 What a Ratio Says** (6.RP.1)
- ✅ rr-01-01 Two Quantities, One Relationship (`ratio-language`)
- ✅ rr-01-02 Part, Part, Whole (`part-part-whole`)
- ✅ rr-01-03 Equivalent Ratios (`equivalent-ratios`)

**Ch2 Ratio Tables & Double Number Lines** (6.RP.3a)
- ✅ rr-02-01 Ratio Tables (`ratio-tables`)
- ✅ rr-02-02 Double Number Lines (`double-number-line`)
- ✅ rr-02-03 Choose Your Tool (`scale-tool-choice`)
- ✅ rr-02b-01 Ratio Pairs on the Plane
**Ch3 Unit Rates** (6.RP.2, 3b)
- ✅ rr-03-01 The Per-One Row (`unit-rate`)
- ✅ rr-03-02 The Better Buy (`better-buy`)
- ✅ rr-03-03 Rates That Predict (`rate-predict`)
**Ch4 Percent: A Rate per 100** (6.RP.3c)
- ✅ rr-04-01 Percent Means Per Hundred (`percent-meaning`)
- ✅ rr-04-02 A Percent of a Number (`percent-of`)
- ✅ rr-04-03 Percents Over and Under (`percent-reason`)
**Ch5 Converting with Ratios** (6.RP.3d)
- ✅ rr-05-01 Conversion Is a Ratio (`unit-conversion`)
- ✅ rr-05-02 Chaining Conversions (`chain-convert`)
- ✅ rr-05-03 Ratios Capstone (`ratios-capstone`)

## Course 17 — The Number System (`number-system`, Grade 6, 6.NS.1–8)

**Ch1 Dividing Fractions** (6.NS.1)
- ✅ ns-01-01 How Many Fit? (`fraction-division-meaning`)
- ✅ ns-01-02 Flip and Multiply (`flip-multiply`)
- ✅ ns-01-03 Dividing Fractions in Context (`fraction-division-context`)

**Ch2 Fluent Operations** (6.NS.2–3)
- ✅ ns-02-01 Multi-Digit Division (`multi-digit-division`)
- ✅ ns-02-02 Adding and Subtracting Decimals (`decimal-add-sub`)
- ✅ ns-02-03 Multiplying and Dividing Decimals (`decimal-mult-div`)
**Ch3 Factors & Multiples** (6.NS.4)
- ✅ ns-03-01 Greatest Common Factor (`gcf`)
- ✅ ns-03-02 Least Common Multiple (`lcm`)
- ✅ ns-03-03 Factoring with the Distributive Property (`distributive-factor`)
**Ch4 Below Zero** (6.NS.5–6)
- ✅ ns-04-01 The Number Line Goes Left (`negative-numbers`)
- ✅ ns-04-02 Comparing Negatives (`compare-negatives`)
- ✅ ns-04-03 The Four Quadrants (`four-quadrants`)
- ✅ ns-04b-01 Signs, and What a Flip Does to Them
**Ch5 Absolute Value & Ordering** (6.NS.7–8)
- ✅ ns-05-01 Absolute Value (`absolute-value`)
- ✅ ns-05-02 Comparing with Absolute Value (`abs-compare`)
- ✅ ns-05-03 Ordering Rational Numbers (`order-rationals`)

## Course 18 — Expressions & Equations (`expressions-equations`, Grade 6, 6.EE.1–9)

**Ch1 Exponents & Order of Operations** (6.EE.1)
- ✅ ee-01-01 Exponent Notation (`exponents`)
- ✅ ee-01-02 Evaluating Powers (`evaluate-powers`)
- ✅ ee-01-03 Order of Operations with Exponents (`order-ops`)

**Ch2 Variables & Expressions** (6.EE.2)
- ✅ ee-02-01 Variables Stand for Numbers (`variables`)
- ✅ ee-02-02 Evaluating Expressions (`evaluate-expr`)
- ✅ ee-02-03 Writing Expressions from Words (`write-expr`)
- ✅ ee-02b-01 Naming the Parts
- ✅ ee-02b-02 The Coefficients You Cannot See
- ✅ ee-02b-03 Reading an Expression Aloud
**Ch3 Equivalent Expressions** (6.EE.3–4)
- ✅ ee-03-01 The Distributive Property with Variables (`distribute-var`)
- ✅ ee-03-02 Combining Like Terms (`like-terms`)
- ✅ ee-03-03 Testing for Equivalence (`test-equivalence`)
**Ch4 One-Step Equations** (6.EE.5–7)
- ✅ ee-04-01 What an Equation Says (`equation-meaning`)
- ✅ ee-04-02 Solving with Addition & Subtraction (`solve-add-sub`)
- ✅ ee-04-03 Solving with Multiplication & Division (`solve-mult-div`)
**Ch5 Inequalities & Relationships** (6.EE.8–9)
- ✅ ee-05-01 What an Inequality Says (`inequality-meaning`)
- ✅ ee-05-02 Graphing Inequalities (`graph-inequality`)
- ✅ ee-05-03 Dependent and Independent Variables (`dependent-independent`)

## Course 19 — Area, Surface Area & Volume (`area-surface-volume`, Grade 6, 6.G.1–4)

**Ch1 Area of Triangles & Quadrilaterals** (6.G.1)
- ✅ asv-01-01 The Triangle's Half (`triangle-area`)
- ✅ asv-01-02 Parallelograms and Trapezoids (`quad-area`)
- ✅ asv-01-03 Choosing the Right Formula (`area-formula-choice`)

**Ch2 Area of Composite Figures** (6.G.1 cont.)
- ✅ asv-02-01 Decomposing L-Shapes (`decompose-lshape`)
- ✅ asv-02-02 Composite Figures with Triangles (`composite-triangle`)
- ✅ asv-02-03 Multi-Step Composite Problems (`composite-multistep`)
**Ch3 Polygons on the Coordinate Plane** (6.G.3)
- ✅ asv-03-01 Finding Side Lengths from Coordinates (`find-side-length`)
- ✅ asv-03-02 Area of Polygons on the Grid (`grid-polygon-area`)
- ✅ asv-03-03 Coordinate Plane Capstone (`coordinate-capstone`)
**Ch4 Surface Area of Prisms** (6.G.4)
- ✅ asv-04-01 Unfolding a Rectangular Prism (`prism-net`)
- ✅ asv-04-02 Surface Area with Triangular Faces (`triangular-prism-sa`)
- ✅ asv-04-03 Surface Area Word Problems (`sa-word-problems`)
**Ch5 Volume with Fractional Edges** (6.G.2)
- ✅ asv-05-01 Volume and the Formula (`volume-formula`)
- ✅ asv-05-02 Volume with Fractional Edges (`fractional-volume`)
- ✅ asv-05-03 Volume in the Real World (`volume-applications`)

## Course 20 — Data & Distributions (`data-distributions`, Grade 6, 6.SP.1–5) — FINAL G6 course

**Ch1 Statistical Questions** (6.SP.1)
- ✅ dd-01-01 Questions That Expect Variety (`statistical-question`)
- ✅ dd-01-02 Data as Answers (`data-collection`)
- ✅ dd-01-03 From Question to Data (`question-capstone`)

**Ch2 Dot Plots & Histograms** (6.SP.4)
- ✅ dd-02-01 Dot Plots (`dot-plot`)
- ✅ dd-02-02 Histograms (`histogram`)
- ✅ dd-02-03 The Shape of Data (`distribution-shape`)
**Ch3 Mean & Median** (6.SP.3, 5c)
- ✅ dd-03-01 The Mean as Fair Share (`mean`)
- ✅ dd-03-02 The Median as Middle (`median`)
- ✅ dd-03-03 Choosing Mean vs Median (`center-choice`)
**Ch4 Range, IQR & Variability** (6.SP.3, 5c)
- ✅ dd-04-01 Range: How Far Data Stretches (`range`)
- ✅ dd-04-02 Quartiles & the IQR (`iqr`)
- ✅ dd-04-03 Same Center, Different Spread (`spread-compare`)
- ✅ dd-04b-01 Building a Box Plot
- ✅ dd-04b-02 Comparing with Box Plots
- ✅ dd-04b-03 Typical Distance: the MAD
**Ch5 Describing Distributions** (6.SP.2, 5d) — closes course + G6 band
- ✅ dd-05-01 Reading the Whole Picture (`distribution-summary`)
- ✅ dd-05-02 Which Numbers Tell It Best (`summary-choice`)
- ✅ dd-05-03 The Data Detective (`data-capstone`) — COURSE CAPSTONE

---

# GRADE 1–2 BAND — PLAN OF RECORD (opened 2026-07-06)

Downward extension below G3. Profile: **early-reader, figure-first, animated manipulatives.**
All lessons use `readingProfile: "early"` (concept captions ≤25 words, pedagogy-linted) and
carry an optional `narration` string (audio deferred). Counts are content-weighted target
ranges, finalized per chapter at authoring time — not padded. Lessons below are ⏳ planned
(become ✅ as files land). No course.json is registered until its first lesson is authored.

## Grade 1 (CCSS 1.OA / 1.NBT / 1.MD / 1.G) — 4 courses, ~55 lessons

**Course G1-1 — Count & Write to 120** (`counting-120`, gradeLevel 1) — ✅ SHIPPED (5 ch / 15 lessons, wired)
(Revised from the original outline to avoid duplicating the flagship's See-&-Count-to-20 work — subitizing/ten-frames/counting-to-20 already ship in add-subtract-20 ch1. Focuses on 1.NBT.1: count to 120 from any number, read/write numerals.)
- Ch1 Counting Past Twenty — count sequence past 20, crossing tens (29→30)
  - ✅ c120-01-01 Keep Counting Past 20 (`count-sequence`)
  - ✅ c120-01-02 Crossing to a New Ten (`count-sequence`)
  - ✅ c120-01-03 Counting to Fifty (`count-sequence`) — CH1 CAPSTONE
- Ch2 The 120 Chart — rows of ten, chart patterns
  - ✅ c120-02-01 Rows of Ten (`chart-rows`)
  - ✅ c120-02-02 Find a Number (`chart-find`)
  - ✅ c120-02-03 Down a Row is Ten More (`chart-pattern`) — CH2 CAPSTONE
- Ch3 Reading & Writing Numerals to 120 — numeral ↔ quantity, tens+ones
  - ✅ c120-03-01 Tens and Ones Make a Numeral (`tens-ones`)
  - ✅ c120-03-02 The Tricky Teens (`teens`)
  - ✅ c120-03-03 Past One Hundred (`past-hundred`) — CH3 CAPSTONE
- Ch4 Counting by Tens and Ones — skip-count 10s, ten+ones structure
  - ✅ c120-04-01 Skip-Counting by Tens (`skip-ten`)
  - ✅ c120-04-02 Counting a Pile (`count-pile`)
  - ✅ c120-04-03 Tens and Ones to 120 (`to-120`) — CH4 CAPSTONE
- Ch5 One/Ten More & Less — ±1 and ±10 mentally
  - ✅ c120-05-01 One More, One Less (`one-more-less`)
  - ✅ c120-05-02 Ten More, Ten Less (`ten-more-less`)
  - ✅ c120-05-03 Mixing Jumps (`mix-jumps`) — CH5 CAPSTONE / COURSE CLOSE

**Course G1-2 — Addition & Subtraction within 20** (`add-subtract-20`, gradeLevel 1) — FLAGSHIP (author first)
- Ch1 Addition as Counting On — number-path hops
  - ✅ as-01-01 Counting On from a Number (`counting-on`)
  - ✅ as-01-02 Count On 1, 2, 3 (`count-on-small`)
  - ✅ as-01-03 Start with the Bigger Number (`bigger-first`)
- Ch2 Making Ten — the ten-frame make-ten strategy (animated)
  - ✅ as-02-01 Partners of Ten (`tens-partners`)
  - ✅ as-02-02 Split to Make Ten (`make-ten-first`)
  - ✅ as-02-03 Adding by Making Ten (`make-ten-add`)
  - ✅ as-02-04 Make Ten: You've Got It (`make-ten-add`) — CH2 CAPSTONE
  - Ch3 Subtraction: Take-Away & Difference — count back + count up (first backward hops)
    - ✅ as-03-01 Take Away (`take-away`)
    - ✅ as-03-02 Counting Back (`count-back`)
    - ✅ as-03-03 Finding the Difference (`difference`)
    - ✅ as-03-04 Subtraction Facts (`sub-facts`) — CH3 CAPSTONE
  - Ch4 Fact Families & the Equal Sign — three-number families, = as balance
    - ✅ as-04-01 Fact Families (`fact-family`)
    - ✅ as-04-02 The Equal Sign Means Same As (`equal-sign`)
    - ✅ as-04-03 Find the Unknown (`unknown`) — CH4 CAPSTONE
  - Ch5 Word Problems within 20 — result/part/compare types
    - ✅ as-05-01 Add To & Take From (`result-unknown`)
    - ✅ as-05-02 Put Together & Take Apart (`part-whole`)
    - ✅ as-05-03 Compare: How Many More (`compare`) — CH5 CAPSTONE — COURSE COMPLETE
- Ch3 Subtraction: Take-Away & Difference — two meanings ⏳ ~4
- Ch4 Fact Families & the Equal Sign — =, unknowns, true/false ⏳ ~3
- Ch5 Word Problems within 20 — add-to, take-from, compare ⏳ ~3

**Course G1-3 — Tens & Ones** (`tens-and-ones`, gradeLevel 1) — bundle ten ones, two-digit numbers as tens+ones, expanded form, adding & subtracting tens, comparing two-digit numbers ✅ SHIPPED (4 ch / 12 lessons, DAG-wired)
- Ch1 Bundles of Ten
  - ✅ tno-01-01 Ten Ones Make a Ten (`tno-ten-bundle`)
  - ✅ tno-01-02 Tens and Ones in a Number (`tno-tens-ones`)
  - ✅ tno-01-03 Reading Base-Ten Blocks (`tno-blocks`) — CH1 CAPSTONE
- Ch2 Expanded Form
  - ✅ tno-02-01 Breaking a Number Apart (`tno-expand`)
  - ✅ tno-02-02 Reading Expanded Form (`tno-read-expanded`)
  - ✅ tno-02-03 Which Digit Is Worth More? (`tno-digit-value`) — CH2 CAPSTONE
- Ch3 Adding & Subtracting Tens
  - ✅ tno-03-01 Ten More, Ten Less (`tno-ten-more-less`)
  - ✅ tno-03-02 Adding Tens (`tno-add-tens`)
  - ✅ tno-03-03 Subtracting Tens (`tno-subtract-tens`) — CH3 CAPSTONE
- Ch4 Comparing Two-Digit Numbers (compare tens first — chosen over the plan's "Add within 100" to avoid overlap with the shipped add-subtract-100 course)
  - ✅ tno-04-01 Which Has More Tens? (`which-has-more-tens`)
  - ✅ tno-04-02 Same Tens, Check the Ones (`same-tens-check-the-ones`)
  - ✅ tno-04-03 Comparing Any Two Numbers (`comparing-any-two-numbers`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: add-subtract-20 → tens-and-ones (edge at course start) → add-subtract-100 (at close). Elementary courses surface via DAG (no onboarding-trail array).

**Course G1-4 — Shapes, Fractions & Measurement** (`shapes-measure-g1`, gradeLevel 1) — 2D/3D shape attributes, halves & quarters, length comparison, telling time to the hour/half-hour ✅ SHIPPED (4 ch / 12 lessons, DAG-wired) — CLOSES OUT ALL OF GRADE 1
- Ch1 2D & 3D Shapes
  - ✅ smg1-01-01 What Makes a Shape Flat (`smg1-shape-sides`)
  - ✅ smg1-01-02 Flat or Solid? (`smg1-2d-3d`)
  - ✅ smg1-01-03 Counting a Solid's Parts (`smg1-solid-parts`) — CH1 CAPSTONE
- Ch2 Halves & Quarters (scoped to informal CCSS 1.G.3 vocabulary only — NO numeral fraction notation, to avoid duplicating shapes-space's Equal Parts chapter which already introduces 1/4 notation)
  - ✅ smg1-02-01 Splitting a Shape in Half (`smg1-halves`)
  - ✅ smg1-02-02 Splitting a Shape into Fourths (`smg1-fourths`)
  - ✅ smg1-02-03 Fourths Make Halves (`smg1-halves-fourths`) — CH2 CAPSTONE
- Ch3 Length: Order & Compare (non-standard units — grep-checked against measure-convert/measurement-data's actual content; no overlap: measure-convert is G4 unit-conversion, measurement-data's clock lesson goes straight to minute-precision)
  - ✅ smg1-03-01 Which Is Longer? (`smg1-length-compare`)
  - ✅ smg1-03-02 How Many More? (`smg1-length-difference`)
  - ✅ smg1-03-03 Longest and Shortest (`smg1-length-order`) — CH3 CAPSTONE
- Ch4 Time to the Hour & Half-Hour (scoped strictly to whole-hour/half-hour per 1.MD.3 — measurement-data's "Reading the Clock" is minute-precision + before/after language, a different grade band's depth)
  - ✅ smg1-04-01 Telling Time on the Hour (`smg1-time-hour`)
  - ✅ smg1-04-02 Telling Time at Half Past (`smg1-time-half-past`)
  - ✅ smg1-04-03 On the Hour or Half Past? (`smg1-time-mixed`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: add-subtract-20 → shapes-measure-g1 (edge at course start). Elementary courses surface via DAG (no onboarding-trail array).

## Grade 2 (CCSS 2.OA / 2.NBT / 2.MD / 2.G) — 5 courses, ~68 lessons

**Course G2-1 — Addition & Subtraction within 100** (`add-subtract-100`, gradeLevel 2) — ✅ SHIPPED (5 ch / 16 lessons, wired)
- Ch1 Fluency within 20 — doubles, near doubles, strategy choice (scoped to strategies NOT taught in the G1 flagship)
  - ✅ as100-01-01 Doubles (`doubles`)
  - ✅ as100-01-02 Near Doubles (`near-doubles`)
  - ✅ as100-01-03 Choose Your Strategy (`fluency-20`) — CH1 CAPSTONE
- Ch2 Add within 100 (regroup ones, animated)
  - ✅ as100-02-01 Adding Tens (`add-tens`)
  - ✅ as100-02-02 Add Ones to a Two-Digit Number (`add-ones`)
  - ✅ as100-02-03 Adding Two-Digit Numbers (`add-2digit`)
  - ✅ as100-02-04 Trade Ten Ones (`regroup-add`) — CH2 CAPSTONE, regroup centerpiece
- Ch3 Subtract within 100 (regroup tens, animated)
  - ✅ as100-03-01 Subtracting Tens (`sub-tens`)
  - ✅ as100-03-02 Take Ones Away (`sub-ones`)
  - ✅ as100-03-03 Subtracting Two-Digit Numbers (`sub-2digit`)
  - ✅ as100-03-04 Break a Ten (`unbundle-sub`) — CH3 CAPSTONE, unbundle centerpiece
- Ch4 Two-Step Word Problems
  - ✅ as100-04-01 Two-Step Stories (`two-step`)
  - ✅ as100-04-02 Stories that Trade (`two-step-trade`)
  - ✅ as100-04-03 Choose the Two Steps (`choose-steps`) — CH4 CAPSTONE
- Ch5 Odd & Even — pairing model
  - ✅ as100-05-01 Odd & Even (`odd-even`)
  - ✅ as100-05-02 Adding Odds & Evens (`parity-sum`) — CH5 CAPSTONE / COURSE CLOSE

**Course G2-2 — Place Value to 1000** (`place-value-1000`, gradeLevel 2) — ✅ SHIPPED (4 ch / 12 lessons, DAG-wired) (see DECISIONS.md, reversal): the earlier CUT reasoned about content overlap without confirming a G2-filtered student ever reaches `place-value`'s content — its course.json has no gradeLevel key and defaults to 3. Fresh re-read also confirmed skip-counting to 1000 (2.NBT.2) is genuinely untaught anywhere, and that `place-value` Ch3 teaches the standard carry/borrow algorithm rather than the concrete-strategy entry point 2.NBT.7 specifies.

**Ch1 Hundreds, Tens & Ones** (2.NBT.1)
- ✅ pv1000-01-01 Hundreds Join the Party (`pv1000-digit-worth`/`pv1000-build-number`)
- ✅ pv1000-01-02 Trading Up and Down (`pv1000-trading`/`pv1000-digit-worth`)
- ✅ pv1000-01-03 Any Number, Any Spot (`pv1000-mixed`) — CH1 CAPSTONE

**Ch2 Counting to 1,000** (2.NBT.2, skip-counting by 5s/10s/100s)
- ✅ pv1000-02-01 Skip-Counting by Tens and Hundreds (`pv1000-skip-tens`/`pv1000-skip-hundreds`)
- ✅ pv1000-02-02 Skip-Counting by Fives (`pv1000-skip-fives`)
- ✅ pv1000-02-03 Counting Forward from Any Start (`pv1000-count-forward`) — CH2 CAPSTONE

**Ch3 Reading, Writing & Comparing 3-Digit Numbers** (2.NBT.3-4)
- ✅ pv1000-03-01 Reading and Writing 3-Digit Numbers (`pv1000-write-words`/`pv1000-read-words`)
- ✅ pv1000-03-02 Comparing Numbers with Symbols (`pv1000-compare`)
- ✅ pv1000-03-03 Ordering 3-Digit Numbers (`pv1000-order-mixed`) — CH3 CAPSTONE

**Ch4 Adding & Subtracting to 1,000 with Concrete Strategies** (2.NBT.7 — deliberately the PLACE-VALUE DECOMPOSITION strategy, distinct from all 3 strategies already used by `place-value`'s own Ch3: friendly-number jumps, the standard carry/borrow algorithm, and rounding-based estimation — see DECISIONS.md)
- ✅ pv1000-04-01 Adding by Place, Then Combining (`pv1000-add-by-place`/`pv1000-add-trade`)
- ✅ pv1000-04-02 Subtracting by Place, with Trading (`pv1000-subtract-by-place`/`pv1000-subtract-trade`)
- ✅ pv1000-04-03 Adding and Subtracting in Real Situations (`pv1000-realworld`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: add-subtract-100 → place-value-1000 (edge at course start, replacing the earlier stopgap add-subtract-100→multiplication-division — see DECISIONS.md).

**Course G2-3 — Arrays & Foundations of Multiplication** (`arrays-foundations`) — ❌ CUT (see DECISIONS.md, final resolution): CCSS 2.OA.4 (equal groups/arrays/repeated-addition toward a multiplication equation) is fully and completely taught by `multiplication-division` Ch1 "Equal Groups" already. No residual sub-skill remains for a separate course. DAG fix applied instead: `add-subtract-100 -> multiplication-division` edge added so the G2 flagship has a real forward path into G3 content (previously it dead-ended).

**Course G2-4 — Measurement, Money & Time** (`measure-money-time`, gradeLevel 2) — standard-unit length, estimating & comparing, money, time to five minutes, single-scale graphs ✅ SHIPPED (5 ch / 15 lessons, DAG-wired)
- Ch1 Measure Length (confirmed non-duplicative: no existing course teaches whole-unit ruler reading; measure-convert's ruler lesson is eighths-of-an-inch, a later-grade precision)
  - ✅ mmt-01-01 Reading a Ruler (`mmt-ruler-read`)
  - ✅ mmt-01-02 Measuring with Different Starting Points (`mmt-ruler-subtract`)
  - ✅ mmt-01-03 Choosing the Right Unit (`mmt-unit-fit`) — CH1 CAPSTONE
- Ch2 Estimate & Compare Lengths (standard units — the CCSS-mandated progression from shapes-measure-g1 Ch3's non-standard-unit comparison, not a repeat of it)
  - ✅ mmt-02-01 Estimating Before You Measure (`mmt-estimate`)
  - ✅ mmt-02-02 Which Is Longer? (`mmt-length-compare`)
  - ✅ mmt-02-03 Ordering Three Lengths (`mmt-length-order`) — CH2 CAPSTONE
- Ch3 Money: Coins & Dollars (confirmed genuinely open gap)
  - ✅ mmt-03-01 What Are Coins Worth? (`mmt-coin-name`)
  - ✅ mmt-03-02 Counting Mixed Coins (`mmt-coin-total`)
  - ✅ mmt-03-03 How Many Coins Make That? (`mmt-coin-reverse`) — CH3 CAPSTONE
- Ch4 Time to Five Minutes (2.MD.7, bridges G1 hour/half-hour and the existing minute-precision course)
  - ✅ mmt-04-01 Skip-Counting by 5s on the Clock (`mmt-skip-5s`)
  - ✅ mmt-04-02 Reading Five-Minute Times (`mmt-time-5min`)
  - ✅ mmt-04-03 Practicing Five-Minute Times (`mmt-time-mixed`) — CH4 CAPSTONE
- Ch5 Line Plots, Picture & Bar Graphs (scoped strictly to single-unit scale, key=1 — measurement-data's key-multiplier is its own differentiator, deliberately absent here; see DECISIONS.md)
  - ✅ mmt-05-01 Reading a Picture Graph (`mmt-picture-graph`)
  - ✅ mmt-05-02 Reading a Bar Graph (`mmt-bar-graph`)
  - ✅ mmt-05-03 Reading a Line Plot and Comparing Data (`mmt-line-plot`/`mmt-graph-compare`) — CH5 CAPSTONE / COURSE CLOSE
- DAG: add-subtract-100 → measure-money-time (edge at course start; INFERRED, not pre-documented in this file — see DECISIONS.md). Elementary courses surface via DAG (no onboarding-trail array).

**Course G2-5 — Shapes & Equal Shares** (`shapes-shares-g2`, gradeLevel 2) — extended shape vocabulary + pyramid, grid partition-and-count, introducing thirds ✅ SHIPPED (3 ch / 9 lessons, DAG-wired)
- Ch1 Recognize & Draw Shapes (extends G1's triangle..hexagon vocabulary to heptagon/octagon + a new 3D solid, the square pyramid — confirmed non-duplicative of shapes-space's classification/hierarchy depth)
  - ✅ ssg2-01-01 Bigger Shape Families (`ssg2-shape-vocab`)
  - ✅ ssg2-01-02 Meet the Pyramid (`ssg2-pyramid`)
  - ✅ ssg2-01-03 Naming Any Shape (`ssg2-name-any`) — CH1 CAPSTONE
- Ch2 Partition Rectangles into Squares (renamed from "Rows & Columns" for accuracy — scoped strictly to the GEOMETRIC partition-and-count skill, 2.G.2; confirmed genuinely untaught anywhere, and deliberately distinct from multiplication-division's discrete-object array/multiplication-fact skill, 2.OA.4, which mult-01-02 already owns — see DECISIONS.md)
  - ✅ ssg2-02-01 Counting a Grid of Squares (`ssg2-grid-count`)
  - ✅ ssg2-02-02 Bigger Grids (`ssg2-grid-count`)
  - ✅ ssg2-02-03 Grids in Everyday Objects (`ssg2-grid-apply`) — CH2 CAPSTONE
- Ch3 Introducing Thirds (rescoped from the plan's "Halves, Thirds & Fourths" — halves/fourths and the shape-invariance nuance are already owned elsewhere; the only genuinely new content is thirds itself, confirmed by reading shapes-space's FULL widget content, not just its step bodies — see DECISIONS.md)
  - ✅ ssg2-03-01 Splitting into Thirds (`ssg2-thirds-count`)
  - ✅ ssg2-03-02 Naming a Third (`ssg2-name-third`)
  - ✅ ssg2-03-03 Comparing Halves, Thirds, and Fourths (`ssg2-compare-shares`) — CH3 CAPSTONE / COURSE CLOSE
- DAG: add-subtract-100 → shapes-shares-g2 (edge at course start; INFERRED, not pre-documented in this file — see DECISIONS.md). Elementary courses surface via DAG (no onboarding-trail array).

## Planned prerequisite edges (wire in content.server as each course lands)
counting-120 → add-subtract-20 → tens-and-ones → add-subtract-100 → place-value-1000 →
multiplication-division (G3 root) — arrays-foundations remains CUT (see DECISIONS.md);
place-value-1000 REINSTATED (see DECISIONS.md reversal) as a genuine G2 course, scoped to
skip-counting-to-1000 and concrete-strategy add/subtract-to-1000, avoiding the standard-
algorithm approach `place-value`'s own Ch3 already uses. add-subtract-20 → shapes-measure-g1;
add-subtract-100 → measure-money-time; add-subtract-100 → shapes-shares-g2. G1_TRAILS /
G2_TRAILS updated as each course lands (not a full onboarding-trail rollout otherwise).

## New animated manipulatives (widget builds, band Phase 0→2)
ten-frame (✅ figure `ten-frame-make-ten` shipped; interactive widget ⏳) · number-line-hop ⏳ ·
base-ten-compose (bundle/unbundle) ⏳ · subitize-flash (timed reveal) ⏳. Arrays, tap-to-count,
and shape-partition adapt from existing tapDiagram / plotPoint / dragBucket.

## High School — Algebra 1 band (gradeLevel 9, standard reading profile)
Prereq root: expressions-equations (G6) → solving-equations. Scoped ABOVE the G6 course, which
already teaches exponent notation, variables, distribution basics, like terms, ONE-step
equations, and inequality graphing — Algebra 1 begins at multi-step.

**Course A1-1 — Algebra 1: Solving Linear Equations** (`solving-equations`, gradeLevel 9) — ✅ SHIPPED (4 ch / 12 lessons, wired: HS_TRAILS + PATH_EDGE)
- Ch1 Multi-Step Equations — two-step, variables both sides, distribute-then-solve
  - ✅ alg1-01-01 Two-Step Equations (`two-step`)
  - ✅ alg1-01-02 Variables on Both Sides (`both-sides`)
  - ✅ alg1-01-03 Distribute, Then Solve (`distribute-solve`) — CH1 CAPSTONE
- Ch2 Fractions & Decimals in Equations — clear denominators, decimal equations
  - ✅ alg1-02-01 Equations with One Fraction (`fraction-eq`)
  - ✅ alg1-02-02 Clear with the LCD (`lcd-clear`)
  - ✅ alg1-02-03 Decimal Equations (`decimal-eq`) — CH2 CAPSTONE
- Ch3 Literal Equations & Formulas — solve for a chosen variable
  - ✅ alg1-03-01 Solving for a Variable (`literal-eq`)
  - ✅ alg1-03-02 Rearranging with Fractions (`literal-frac`)
  - ✅ alg1-03-03 Multi-Step Literal Equations (`multi-literal`) — CH3 CAPSTONE
- Ch4 Multi-Step Inequalities — flip on negative multiply/divide
  - ✅ alg1-04-01 Solving Inequalities (`solve-inequality`)
  - ✅ alg1-04-02 The Flip Rule (`flip-rule`)
  - ✅ alg1-04-03 Inequalities on Both Sides (`both-sides-inequality`) — CH4 CAPSTONE / COURSE CLOSE

**Course A1-2 — Algebra 1: Linear Functions** (`linear-functions`) — slope, intercepts, forms ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Slope & Rate of Change
  - ✅ lf-01-01 Slope as Steepness (`slope-as-steepness`)
  - ✅ lf-01-02 Slope from Two Points (`slope-from-two-points`)
  - ✅ lf-01-03 Positive, Negative, Zero & Undefined (`slope-sign-and-special-lines`) — CH1 CAPSTONE
- Ch2 Slope-Intercept Form
  - ✅ lf-02-01 Meet y = mx + b (`meet-slope-intercept-form`)
  - ✅ lf-02-02 Graphing from Slope-Intercept (`graphing-from-slope-intercept`)
  - ✅ lf-02-03 x-intercept vs y-intercept (`x-intercept-vs-y-intercept`) — CH2 CAPSTONE
- Ch3 Point-Slope & Standard Form
  - ✅ lf-03-01 Point-Slope Form (`point-slope-form`)
  - ✅ lf-03-02 Point-Slope to Slope-Intercept (`point-slope-to-slope-intercept`)
  - ✅ lf-03-03 Standard Form Ax + By = C (`standard-form`) — CH3 CAPSTONE
- Ch4 Writing Equations of Lines
  - ✅ lf-04-01 Line from a Point and a Slope (`line-from-point-and-slope`)
  - ✅ lf-04-02 Line Through Two Points (`line-through-two-points`)
  - ✅ lf-04-03 Parallel & Perpendicular Lines (`parallel-and-perpendicular-lines`) — CH4 CAPSTONE / COURSE CLOSE
**Course A1-3 — Algebra 1: Systems of Equations** (`systems-equations`) — graphing/substitution/elimination ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Solving by Graphing
  - ✅ se-01-01 Systems and Their Solutions (`systems-and-their-solutions`)
  - ✅ se-01-02 Solving by Graphing (`solving-by-graphing`)
  - ✅ se-01-03 One, None, or Infinitely Many (`one-none-or-infinitely-many`) — CH1 CAPSTONE
- Ch2 Substitution
  - ✅ se-02-01 Substitution When y Is Alone (`substitution-when-y-is-alone`)
  - ✅ se-02-02 Isolate First, Then Substitute (`isolate-first-then-substitute`)
  - ✅ se-02-03 Substitution in Action (`substitution-in-action`) — CH2 CAPSTONE
- Ch3 Elimination
  - ✅ se-03-01 Add or Subtract to Eliminate (`add-or-subtract-to-eliminate`)
  - ✅ se-03-02 Scale One Equation First (`scale-one-equation-first`)
  - ✅ se-03-03 Scale Both, and Special Cases (`scale-both-and-special-cases`) — CH3 CAPSTONE
- Ch4 Systems Word Problems
  - ✅ se-04-01 Totals and Differences (`totals-and-differences`)
  - ✅ se-04-02 Counts and Values (`counts-and-values`)
  - ✅ se-04-03 Choose a Method, Then Interpret (`choose-a-method-then-interpret`) — CH4 CAPSTONE / COURSE CLOSE
**Course A1-4 — Algebra 1: Exponents & Polynomials** (`exponents-polynomials`) — exponent rules, polynomials, factoring ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Exponent Rules
  - ✅ ep-01-01 Product & Quotient Rules (`product-and-quotient-rules`)
  - ✅ ep-01-02 Power of a Power & Products (`power-of-a-power-and-products`)
  - ✅ ep-01-03 Zero & Negative Exponents (`zero-and-negative-exponents`) — CH1 CAPSTONE
- Ch2 Polynomial Basics
  - ✅ ep-02-01 Degree & Like Terms (`degree-and-like-terms`)
  - ✅ ep-02-02 Adding Polynomials (`adding-polynomials`)
  - ✅ ep-02-03 Subtracting Polynomials (`subtracting-polynomials`) — CH2 CAPSTONE
- Ch3 Multiplying Polynomials
  - ✅ ep-03-01 Multiplying by a Monomial (`multiplying-by-a-monomial`)
  - ✅ ep-03-02 Multiplying Binomials / FOIL (`multiplying-binomials-foil`)
  - ✅ ep-03-03 Special Products (`special-products`) — CH3 CAPSTONE
- Ch4 Factoring (course-closing)
  - ✅ ep-04-01 Factoring with the GCF (`factoring-with-the-gcf`)
  - ✅ ep-04-02 Factoring Trinomials (`factoring-trinomials`)
  - ✅ ep-04-03 Difference of Squares (`difference-of-squares`) — CH4 CAPSTONE / COURSE CLOSE
**Course A1-5 — Algebra 1: Quadratic Functions** (`quadratics`) — graphing parabolas, solving by factoring, quadratic formula, applications ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Graphing Parabolas
  - ✅ qu-01-01 The Parent Parabola & Vertex Form (`the-parent-parabola-and-vertex-form`)
  - ✅ qu-01-02 Graphing from Standard Form (`graphing-from-standard-form`)
  - ✅ qu-01-03 Stretch, Flip, and Shift (`stretch-flip-and-shift`) — CH1 CAPSTONE
- Ch2 Solving by Factoring
  - ✅ qu-02-01 The Zero-Product Property (`the-zero-product-property`)
  - ✅ qu-02-02 Factoring to Solve (`factoring-to-solve`)
  - ✅ qu-02-03 Special Products, Roots & the Graph (`special-products-roots-and-the-graph`) — CH2 CAPSTONE
- Ch3 Square Roots & the Quadratic Formula
  - ✅ qu-03-01 Solving by Square Roots (`solving-by-square-roots`)
  - ✅ qu-03-02 The Quadratic Formula (`the-quadratic-formula`)
  - ✅ qu-03-03 The Discriminant (`the-discriminant`) — CH3 CAPSTONE
- Ch4 Applications
  - ✅ qu-04-01 Projectile Motion (`projectile-motion`)
  - ✅ qu-04-02 Area Problems (`area-problems`)
  - ✅ qu-04-03 Putting It Together (`putting-it-together`) — CH4 CAPSTONE / COURSE CLOSE
DAG: expressions-equations → solving-equations → {linear-functions → systems-equations, exponents-polynomials → quadratics}. HS_TRAILS wired at first course-close.

**Course A1-6 — Algebra 1: Exponential Functions** (`exponential-functions`) — evaluate a·bˣ, growth vs decay, modeling, equations, graphs & comparisons ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Exponential Growth & Decay
  - ✅ exp-01-01 Evaluating Exponential Functions (`evaluating-exponential-functions`)
  - ✅ exp-01-02 Growth vs Decay (`growth-vs-decay`)
  - ✅ exp-01-03 The Constant Ratio (`the-constant-ratio`) — CH1 CAPSTONE
- Ch2 Modeling with Exponential Functions
  - ✅ exp-02-01 Growth Models (`growth-models`)
  - ✅ exp-02-02 Decay Models (`decay-models`)
  - ✅ exp-02-03 Percent Growth & Decay (`percent-growth-and-decay`) — CH2 CAPSTONE
- Ch3 Exponential Equations
  - ✅ exp-03-01 Solving by Matching Bases (`solving-by-matching-bases`)
  - ✅ exp-03-02 Equations with a Coefficient (`equations-with-a-coefficient`)
  - ✅ exp-03-03 Decay & Negative Exponents (`decay-and-negative-exponents`) — CH3 CAPSTONE
- Ch4 Graphs & Comparisons
  - ✅ exp-04-01 Reading Exponential Graphs (`reading-exponential-graphs`)
  - ✅ exp-04-02 Comparing Growth (`comparing-growth`)
  - ✅ exp-04-03 Exponential vs Linear (`exponential-vs-linear`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: exponents-polynomials → exponential-functions (edge added at course start). HS_TRAILS at course close.

**Course A1-7 — Algebra 1: Radicals & Rational Exponents** (`radicals-and-exponents`) — simplify √n, operations, rational exponents, Pythagorean & distance ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Simplifying Radicals
  - ✅ rad-01-01 Perfect Squares & Square Roots (`perfect-squares-and-square-roots`)
  - ✅ rad-01-02 Simplifying with Factors (`simplifying-with-factors`)
  - ✅ rad-01-03 Fully Simplified Form (`fully-simplified-form`) — CH1 CAPSTONE
- Ch2 Operations with Radicals
  - ✅ rad-02-01 Adding & Subtracting Like Radicals (`adding-and-subtracting-like-radicals`)
  - ✅ rad-02-02 Multiplying Radicals (`multiplying-radicals`)
  - ✅ rad-02-03 Distributing Radicals (`distributing-radicals`) — CH2 CAPSTONE
- Ch3 Rational Exponents
  - ✅ rad-03-01 Roots as Exponents (`roots-as-exponents`)
  - ✅ rad-03-02 The Power/Root Combo (`the-power-root-combo`)
  - ✅ rad-03-03 Negative Rational Exponents (`negative-rational-exponents`) — CH3 CAPSTONE
- Ch4 Applications
  - ✅ rad-04-01 The Pythagorean Theorem (`the-pythagorean-theorem`)
  - ✅ rad-04-02 When the Answer is a Radical (`when-the-answer-is-a-radical`)
  - ✅ rad-04-03 Distance Between Points (`distance-between-points`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: exponents-polynomials → radicals-and-exponents (edge at course start). HS_TRAILS at course close.

**Course A1-8 — Algebra 1: Functions & Sequences** (`functions-and-sequences`) — function notation, domain/range, arithmetic & geometric sequences, applications ✅ (Ch1–4 SHIPPED — course closed, wired into HS_TRAILS + DAG)
- Ch1 Function Basics
  - ✅ fn-01-01 Function Notation (`function-notation`)
  - ✅ fn-01-02 Domain, Range & the Function Test (`domain-range-and-the-function-test`)
  - ✅ fn-01-03 Functions from a Table (`functions-from-a-table`) — CH1 CAPSTONE
- Ch2 Arithmetic Sequences
  - ✅ fn-02-01 Common Difference (`common-difference`)
  - ✅ fn-02-02 The nth Term Formula (`the-nth-term-formula`)
  - ✅ fn-02-03 Finding Terms & Positions (`finding-terms-and-positions`) — CH2 CAPSTONE
- Ch3 Geometric Sequences
  - ✅ fn-03-01 Common Ratio (`common-ratio`)
  - ✅ fn-03-02 The nth Term of a Geometric Sequence (`the-nth-term-of-a-geometric-sequence`)
  - ✅ fn-03-03 Reading a Geometric Rule (`reading-a-geometric-rule`) — CH3 CAPSTONE
- Ch4 Comparing & Applying Sequences
  - ✅ fn-04-01 Arithmetic or Geometric? (`arithmetic-or-geometric`)
  - ✅ fn-04-02 Choosing the Right Formula (`choosing-the-right-formula`)
  - ✅ fn-04-03 Growth in the Real World (`growth-in-the-real-world`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: linear-functions → functions-and-sequences (edge at course start). HS_TRAILS at course close.

## Course 21 — Proportional Relationships (`proportional-relationships`, Grade 7, 7.RP.1–3) — first G7 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired)

**Ch1 Unit Rates with Fractions** (7.RP.1)
- ✅ pr-01-01 Dividing by a Fraction (`pr-unit-rate-fraction`)
- ✅ pr-01-02 Pace, Recipes, and Laps (`pr-unit-rate-context`)
- ✅ pr-01-03 Finding Any Unit Rate (`pr-unit-rate-mixed`) — CH1 CAPSTONE

**Ch2 Is It Proportional?** (7.RP.2a-b)
- ✅ pr-02-01 Testing a Table (`pr-test-proportional`)
- ✅ pr-02-02 Finding the Constant of Proportionality (`pr-constant-k`)
- ✅ pr-02-03 Tables in Real Situations (`pr-apply-proportional`) — CH2 CAPSTONE

**Ch3 Graphs of Proportional Relationships** (7.RP.2c-d) — constrained to the REAL plotPoint schema (checked directly: 1-based integer targets, 8×8 grid cap), so the origin is taught conceptually, never as a plottable target
- ✅ pr-03-01 Plotting a Proportional Relationship (`pr-plot-line`)
- ✅ pr-03-02 The Point That Shows the Unit Rate (`pr-unit-rate-point`/`pr-read-rate-point`)
- ✅ pr-03-03 Reading a Story from a Graph (`pr-story-point`/`pr-plot-story`) — CH3 CAPSTONE
- ✅ pr-03b-01 Writing the Equation y = kx

**Ch4 Percent Problems** (7.RP.3)
- ✅ pr-04-01 Tax and Tip (`pr-add-percent`)
- ✅ pr-04-02 Markup and Markdown (`pr-markup`/`pr-markdown`)
- ✅ pr-04-03 Percent Increase and Decrease (`pr-percent-change`) — CH4 CAPSTONE / COURSE CLOSE
- ✅ pr-04b-01 Simple Interest
- ✅ pr-04b-02 Commission and Fees
- ✅ pr-04b-03 Percent Error
- DAG: ratios-rates → proportional-relationships (cross-band edge at course start, matching the G4→G5 pattern). No trail wiring beyond G7_TRAILS (added at course open, mirroring HS_TRAILS's single-course start).

## Course 22 — Rational Number Operations (`rational-number-operations`, Grade 7, 7.NS.1-3) — second G7 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired)

**Ch1 Adding Integers** (7.NS.1a-b: same-sign and different-sign rules)
- ✅ rno-01-01 Adding Same-Sign Integers (`rno-add-same-sign`)
- ✅ rno-01-02 Adding Different-Sign Integers (`rno-add-diff-sign`)
- ✅ rno-01-03 Adding Any Two Integers (`rno-add-mixed`) — CH1 CAPSTONE

**Ch2 Subtracting Integers** (7.NS.1c: subtraction as adding the opposite)
- ✅ rno-02-01 Subtracting Means Adding the Opposite (`rno-subtract-opposite`)
- ✅ rno-02-02 Distance and Change on the Number Line (`rno-subtract-change`)
- ✅ rno-02-03 Adding and Subtracting Together (`rno-mixed-ops`) — CH2 CAPSTONE

**Ch3 Multiplying & Dividing Integers** (7.NS.2a-c)
- ✅ rno-03-01 Multiplying Integers (`rno-multiply-sign`)
- ✅ rno-03-02 Dividing Integers (`rno-divide-sign`)
- ✅ rno-03-03 Multiplying and Dividing Together (`rno-multiply-divide-mixed`) — CH3 CAPSTONE

**Ch4 Operations with Rational Numbers** — extending to fractions/decimals (7.NS.1d, 2d, 3)
- ✅ rno-04-01 Multiplying and Dividing Signed Fractions (`rno-frac-multiply-sign`/`rno-frac-divide-sign`)
- ✅ rno-04-02 Adding and Subtracting Signed Decimals (`rno-decimal-add`/`rno-decimal-subtract`)
- ✅ rno-04-03 All Four Operations with Rational Numbers (`rno-mixed-rational`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: proportional-relationships → rational-number-operations (within-G7 chain edge at course start, matching the number-system→expressions-equations pattern within G6 — see DECISIONS.md for why this is NOT a second cross-band edge from number-system).

## Course 23 — Two-Step Equations & Inequalities (`two-step-equations`, Grade 7, 7.EE.1, 4a-b) — third G7 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired)

**Ch1 Distributing & Combining with Rational Coefficients** (7.EE.1 — extends expressions-equations' ee-03, confirmed positive-whole-number-only, to negative/rational coefficients)
- ✅ tse-01-01 Distributing with Negative Coefficients (`tse-distribute-negative`/`tse-distribute-check`)
- ✅ tse-01-02 Combining Like Terms with Negative Coefficients (`tse-combine-negative`/`tse-combine-distribute`)
- ✅ tse-01-03 Simplifying Any Linear Expression (`tse-simplify-mixed`) — CH1 CAPSTONE
- ✅ tse-01b-01 Factoring: Distribution Run Backwards
- ✅ tse-01b-02 The Multiplier Inside a Percent Increase
- ✅ tse-01b-03 Choosing the Form That Answers the Question

**Ch2 Two-Step Equations** (7.EE.4a, px+q=r)
- ✅ tse-02-01 Undoing Addition, Then Multiplication (`tse-solve-two-step`)
- ✅ tse-02-02 Equations with Negative Coefficients (`tse-solve-negative-coeff`)
- ✅ tse-02-03 Two-Step Equations in Real Situations (`tse-solve-realworld`) — CH2 CAPSTONE
- ✅ tse-02-04 Solving on the Balance (`tse-solve-two-step`) — solveBalance manipulative: same-to-both-sides as a visible consequence
- ✅ tse-02-05 Undo in the Right Order (`tse-solve-two-step`) — inversePipeline manipulative: reverse-and-flip graded separately from forward-order undoing

**Ch3 Equations with Parentheses** (7.EE.4a, p(x+q)=r)
- ✅ tse-03-01 Distribute First, Then Solve (`tse-parens-solve`)
- ✅ tse-03-02 Parentheses with Negative Multipliers (`tse-parens-negative`)
- ✅ tse-03-03 Mixed Parenthesized Equations (`tse-parens-mixed`) — CH3 CAPSTONE

**Ch4 Two-Step Inequalities** (7.EE.4b, px+q>r, incl. the sign-flip rule — confirmed genuinely untaught: expressions-equations' ee-05 only tests/graphs already-simplified inequalities, never solves one)
- ✅ tse-04-01 Solving Two-Step Inequalities (`tse-inequality-positive`)
- ✅ tse-04-02 The Sign-Flip Rule (`tse-inequality-flip`)
- ✅ tse-04-03 Two-Step Inequalities in Real Situations (`tse-inequality-realworld`) — CH4 CAPSTONE / COURSE CLOSE

- DAG: rational-number-operations → two-step-equations (within-G7 chain edge at course start, third link in the chain — see DECISIONS.md).

## Course 24 — Sampling & Probability (`sampling-and-probability`, Grade 7, 7.SP.1-8) — fourth G7 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired)

**Ch1 Random Sampling & Making Inferences** (7.SP.1-2)
- ✅ sp-01-01 Estimating from a Sample (`sp-estimate-sample`)
- ✅ sp-01-02 How Sample Size Affects Confidence
- ✅ sp-01-03 Sampling in Real Situations — CH1 CAPSTONE

**Ch2 Comparing Two Populations** (7.SP.3-4)
- ✅ sp-02-01 Are Two Groups Really Different?
- ✅ sp-02-02 Visual Overlap and What It Means
- ✅ sp-02-03 Comparing Two Populations in Real Situations — CH2 CAPSTONE
- ✅ sp-02b-01 MAD as a Ruler
- ✅ sp-02b-02 How Many MADs Apart?
- ✅ sp-02b-03 Is the Gap Big Enough?

**Ch3 Understanding Probability** (7.SP.5-6)
- ✅ sp-03-01 How Likely Is It? (`sp-theoretical-prob`/`sp-likelihood-words`)
- ✅ sp-03-02 Estimating Probability from Trials (`sp-relative-freq`/`sp-likelihood-words`)
- ✅ sp-03-03 Probability in Real Situations (`sp-mixed-prob`) — CH3 CAPSTONE

**Ch4 Probability Models & Compound Events** (7.SP.7-8)
- ✅ sp-04-01 Counting All the Outcomes (`sp-sample-space-size`/`sp-counting-principle`)
- ✅ sp-04-02 Compound Events (`sp-compound-prob`)
- ✅ sp-04-03 Probability Models in Real Situations (`sp-realworld-prob`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: two-step-equations → sampling-and-probability (within-G7 chain edge at course start, fourth link — see DECISIONS.md).

## Course 25 — The Real Number System (`the-real-number-system`, Grade 8, 8.NS.1-2) — first-ever G8 course, opens the Grade 8 band ✅ SHIPPED (3 ch / 9 lessons, DAG-wired, G8_TRAILS)

**Ch1 Rational Numbers & Decimal Expansions** (8.NS.1a)
- ✅ rns-01-01 What Makes a Number Rational (`rns-repeat-or-terminate`)
- ✅ rns-01-02 Predicting Terminating vs. Repeating Decimals (`rns-predict-terminate`)
- ✅ rns-01-03 Converting a Repeating Decimal to a Fraction (`rns-convert-to-fraction`) — CH1 CAPSTONE

**Ch2 Irrational Numbers Exist** (8.NS.1b)
- ✅ rns-02-01 A Number With No Exact Fraction (`rns-irrational-exists`)
- ✅ rns-02-02 Classifying Rational & Irrational (`rns-classify`)
- ✅ rns-02-03 The Real Number Line Has No Gaps (`rns-density`) — CH2 CAPSTONE

**Ch3 Approximating & Comparing Irrationals** (8.NS.2)
- ✅ rns-03-01 Estimating Square Roots Between Integers (`rns-estimate-integer-bounds`)
- ✅ rns-03-02 Locating Irrationals on the Number Line (`rns-locate-number-line`)
- ✅ rns-03-03 Comparing & Estimating with Irrationals (`rns-compare-estimate`) — CH3 CAPSTONE / COURSE CLOSE
- DAG: rational-number-operations (7.NS) → the-real-number-system (cross-grade edge, G7→G8, at course start — see DECISIONS.md).

## Course 26 — Exponents, Roots & Scientific Notation (`exponents-scientific-notation`, Grade 8, 8.EE.1-4) — second G8 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired, G8_TRAILS)

**Ch1 Powers of Ten** (8.EE.1, scoped to base-10 only — see DECISIONS.md for the overlap-avoidance reasoning vs. exponents-polynomials)
- ✅ esn-01-01 What Powers of Ten Mean (`esn-powers-of-ten-meaning`)
- ✅ esn-01-02 Multiplying and Dividing Powers of Ten (`esn-powers-of-ten-arithmetic`)
- ✅ esn-01-03 Powers of Ten and Place Value (`esn-powers-of-ten-place-value`) — CH1 CAPSTONE
- ✅ esn-01b-01 Same Base, Add the Exponents
- ✅ esn-01b-02 A Power of a Power
- ✅ esn-01b-03 Zero and Negative Exponents

**Ch2 Square & Cube Roots** (8.EE.2 — solving x²=p/x³=p; radical simplification stays radicals-and-exponents' distinct job, see DECISIONS.md)
- ✅ esn-02-01 Evaluating Roots & Solving x² = p (`esn-square-root-solve`)
- ✅ esn-02-02 Cube Roots & Solving x³ = p (`esn-cube-root-solve`)
- ✅ esn-02-03 Roots in Context (`esn-roots-context`) — CH2 CAPSTONE

**Ch3 Scientific Notation** (8.EE.3)
- ✅ esn-03-01 Writing Large Numbers in Scientific Notation (`esn-sci-notation-large`)
- ✅ esn-03-02 Writing Small Numbers in Scientific Notation (`esn-sci-notation-small`)
- ✅ esn-03-03 Comparing Magnitudes (`esn-sci-notation-compare`) — CH3 CAPSTONE

**Ch4 Computing in Scientific Notation** (8.EE.4)
- ✅ esn-04-01 Multiplying and Dividing in Scientific Notation (`esn-compute-muldiv`)
- ✅ esn-04-02 Adding and Subtracting in Scientific Notation (`esn-compute-addsub`)
- ✅ esn-04-03 Real-World Applications & Precision (`esn-compute-context`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: the-real-number-system → exponents-scientific-notation (within-G8 chain edge at course start — see DECISIONS.md).

## Course 27 — Functions (`functions-g8`, Grade 8, 8.F.1-5 + 8.EE.5-6) — third G8 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired, G8_TRAILS)

**Ch1 What Is a Function** (8.F.1, notation-light per DECISIONS.md — f(x) drilling stays functions-and-sequences' job)
- ✅ fg-01-01 What Is a Function (`fg-function-definition`)
- ✅ fg-01-02 Functions from Tables and Pairs (`fg-function-test`)
- ✅ fg-01-03 The Vertical Line Test (`fg-vertical-line-test`) — CH1 CAPSTONE

**Ch2 Rate of Change & Initial Value** (8.F.4, 8.EE.6 — slope as rate of change + similar-triangles argument for constant slope, notation-light per DECISIONS.md)
- ✅ fg-02-01 Rate of Change (`fg-rate-of-change`)
- ✅ fg-02-02 Why a Line's Slope Is Constant (`fg-constant-slope`)
- ✅ fg-02-03 Initial Value and y = mx + b (`fg-initial-value`) — CH2 CAPSTONE

**Ch3 Comparing Functions Across Representations** (8.F.2, 8.EE.5 — same function as table/graph/equation/verbal; compare two functions given differently)
- ✅ fg-03-01 One Function, Many Forms (`fg-same-function-forms`)
- ✅ fg-03-02 Comparing Rates of Change (`fg-compare-rates`)
- ✅ fg-03-03 Comparing Rate and Initial Value (`fg-compare-full`) — CH3 CAPSTONE

**Ch4 Linear vs. Nonlinear & Qualitative Graphs** (8.F.3, 8.F.5)
- ✅ fg-04-01 Linear vs. Nonlinear (`fg-linear-vs-nonlinear`)
- ✅ fg-04-02 Reading Graph Shapes (`fg-qualitative-graphs`)
- ✅ fg-04-03 Sketching Graphs from Stories (`fg-graph-stories`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: proportional-relationships (7.RP) → functions-g8 (cross-grade edge at course start — see DECISIONS.md).

## Course 28 — Linear Equations & Systems (`linear-equations-systems`, Grade 8, 8.EE.7-8) — fourth G8 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired, G8_TRAILS)

**Ch1 Solving Linear Equations** (8.EE.7b — solving mechanics as a brief on-ramp; drilling stays solving-equations' job, see DECISIONS.md)
- ✅ les-01-01 Keeping the Balance (`les-balance-both-sides`)
- ✅ les-01-02 Variables on Both Sides (`les-isolate-variable`)
- ✅ les-01-03 Distribute, Then Solve (`les-distribute-solve`) — CH1 CAPSTONE

**Ch2 One Solution, None, or Infinitely Many** (8.EE.7a — the number-of-solutions analysis for ONE-VARIABLE equations, the clearest gap vs. solving-equations)
- ✅ les-02-01 When There Is No Solution (`les-no-solution`)
- ✅ les-02-02 When There Are Infinitely Many (`les-infinite-solutions`)
- ✅ les-02-03 Classifying Any Equation (`les-classify-solutions`) — CH2 CAPSTONE

**Ch3 Systems and Their Solutions** (8.EE.8a-b — what a system is, intersection as solution, solving by graphing, one/none/infinite for systems introduced conceptually)
- ✅ les-03-01 What Is a System? (`les-system-meaning`)
- ✅ les-03-02 Solving by Graphing (`les-system-graphing`)
- ✅ les-03-03 One, None, or Infinitely Many (Systems) (`les-system-count`) — CH3 CAPSTONE

**Ch4 Solving Systems by Substitution** (8.EE.8b-c — substitution method + simple real-world systems; elimination deliberately NOT taught, stays systems-equations' job)
- ✅ les-04-01 The Substitution Method (`les-substitution-method`)
- ✅ les-04-02 Back-Substituting for y (`les-back-substitute`)
- ✅ les-04-03 Systems in the Real World (`les-systems-word`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: two-step-equations (7.EE) → linear-equations-systems AND functions-g8 → linear-equations-systems (both at course start — see DECISIONS.md).

## Course 29 — Transformations & Measurement (`transformations-measurement`, Grade 8, 8.G.1-9) — fifth G8 course ✅ SHIPPED (5 ch / 15 lessons, DAG-wired, G8_TRAILS)

**Ch1 Rigid Transformations** (8.G.1,3 — translations, reflections, rotations on the coordinate plane; wholly new territory per DECISIONS.md)
- ✅ tm-01-01 Sliding with Translations (`tm-translation`)
- ✅ tm-01-02 Flipping with Reflections (`tm-reflection`)
- ✅ tm-01-03 Turning with Rotations (`tm-rotation`) — CH1 CAPSTONE
- ✅ tm-01b-01 Translations as Coordinate Rules
- ✅ tm-01b-02 Reflections as Coordinate Rules
- ✅ tm-01b-03 Dilations as Coordinate Rules

**Ch2 Congruence & Similarity** (8.G.2,4 — congruence via rigid motions, dilations, similarity via dilation + rigid motion)
- ✅ tm-02-01 Congruent Shapes (`tm-congruence`)
- ✅ tm-02-02 Dilations (`tm-dilation`)
- ✅ tm-02-03 Similar Shapes (`tm-similarity`) — CH2 CAPSTONE

**Ch3 Angle Relationships** (8.G.5 — transversal angles, triangle angle sum, exterior angle, angle-angle similarity)
- ✅ tm-03-01 Angles and a Transversal (`tm-transversal-angles`)
- ✅ tm-03-02 Angles in a Triangle (`tm-triangle-angle-sum`)
- ✅ tm-03-03 Angle-Angle Similarity (`tm-angle-angle`) — CH3 CAPSTONE

**Ch4 The Pythagorean Theorem** (8.G.6-8 — a decomposition proof of WHY, whole-number applications, the CONVERSE, and whole-number coordinate distance; radical simplification deliberately excluded — stays radicals-and-exponents' job per DECISIONS.md)
- ✅ tm-04-01 Why the Theorem Works (`tm-pythagorean-why`)
- ✅ tm-04-02 Finding Missing Lengths (`tm-pythagorean-apply`)
- ✅ tm-04-03 The Converse and Distance (`tm-pythagorean-converse`) — CH4 CAPSTONE

**Ch5 Volume of Round Solids** (8.G.9 — cylinders, cones, spheres and their π-formulas; new — area-surface-volume covers only rectangular boxes)
- ✅ tm-05-01 Volume of a Cylinder (`tm-cylinder-volume`)
- ✅ tm-05-02 Volume of a Cone (`tm-cone-volume`)
- ✅ tm-05-03 Volume of a Sphere (`tm-sphere-volume`) — CH5 CAPSTONE / COURSE CLOSE
- DAG: area-surface-volume (6.G) → transformations-measurement (interim edge; 7.G unbuilt — reroute later if added — see DECISIONS.md).

## Course 30 — Bivariate Statistics (`bivariate-statistics`, Grade 8, 8.SP.1-4) — sixth & FINAL G8 course ✅ SHIPPED (4 ch / 12 lessons, DAG-wired, G8_TRAILS) — GRADE 8 BAND COMPLETE (6/6)

**Ch1 Scatter Plots & Association** (8.SP.1 — plotting paired data, positive/negative/no association, clusters, outliers, linear vs nonlinear form; all-new territory per DECISIONS.md — data-distributions is univariate only)
- ✅ bv-01-01 Plotting Paired Data (`bv-scatter-plot`)
- ✅ bv-01-02 Reading Association (`bv-association`)
- ✅ bv-01-03 Clusters, Outliers, and Form (`bv-form-outliers`) — CH1 CAPSTONE

**Ch2 Fitting a Line to Data** (8.SP.2 — line of best fit as an informal linear model, judging fit by closeness/balance, reading slope/intercept from y=mx+b)
- ✅ bv-02-01 The Line of Best Fit (`bv-fit-idea`)
- ✅ bv-02-02 Judging a Good Fit (`bv-judge-fit`)
- ✅ bv-02-03 Reading a Line's Equation (`bv-which-line`) — CH2 CAPSTONE

**Ch3 Using the Line to Predict** (8.SP.3 — predicting y from y=mx+b, interpreting slope as a rate and intercept as a starting value in context, trusting predictions inside the data range vs risky extrapolation; the functions-g8 slope/intercept reuse)
- ✅ bv-03-01 Making Predictions (`bv-predict`)
- ✅ bv-03-02 What Slope and Intercept Mean (`bv-interpret`)
- ✅ bv-03-03 How Far to Trust a Prediction (`bv-prediction-limits`) — CH3 CAPSTONE

**Ch4 Two-Way Tables** (8.SP.4 — categorical bivariate data, reading cells/margins/totals, relative frequency by whole/row/column, spotting association by comparing rates; new — no prior course has two-way tables for bivariate categorical association)
- ✅ bv-04-01 Reading Two-Way Tables (`bv-read-table`)
- ✅ bv-04-02 Relative Frequency (`bv-relative-frequency`)
- ✅ bv-04-03 Association in Categories (`bv-categorical-association`) — CH4 CAPSTONE / COURSE CLOSE
- DAG: functions-g8 (8.F) → bivariate-statistics AND data-distributions (6.SP) → bivariate-statistics.

## Data & Models (`data-and-models`, Grade 9, N-Q.A.3 + S-ID.A.1-3/B.6a-c/C.7-8) — 4 lessons — S203V, NEW COURSE closing the missing-middle diagnosed in S203H/I: bivariate-statistics (G8) fed straight into statistical-inference (G11) with nothing rebuilding scatter/fit/residuals/correlation at HS. Now: bivariate-statistics → data-and-models → statistical-inference.
- ✅ dm-01-01 One Dataset's Shape, Two Datasets Compared (`dm-shape-spread`, S-ID.A.1/A.2/A.3)
- ✅ dm-02-01 Fitting a Line, and Reading What It Says (`dm-fit-and-read`, S-ID.B.6a/B.6c/C.7)
- ✅ dm-02-02 How Good Is the Fit? Residuals and Correlation (`dm-residual-correlation`, S-ID.B.6b/C.8)
- ✅ dm-03-01 Precise Enough — But Not More (`dm-precision`, N-Q.A.3)
- DAG: bivariate-statistics (G8) → data-and-models (G9) → statistical-inference (G11).

## Course 31 — Grade 7 Geometry (`geometry-g7`, Grade 7, 7.G.1-5) — the deferred fifth G7 domain ✅ SHIPPED (4 ch / 12 lessons, DAG-rerouted, G7_TRAILS) — GRADE 7 BAND COMPLETE (5/5 domains)

**Ch1 Scale Drawings** (7.G.1 — reading a scale, drawing↔real conversions both directions, area scaling by k²; distinct from tm's coordinate dilations per DECISIONS.md)
- ✅ g7-01-01 Reading a Scale (`g7-read-scale`)
- ✅ g7-01-02 From Real to Drawing (`g7-scale-to-actual`)
- ✅ g7-01-03 How Area Scales (`g7-scaled-area`) — CH1 CAPSTONE

**Ch2 Circles** (7.G.4 — radius/diameter/π, circumference C=2πr=πd, area A=πr², exact π-coefficient answers; backfills the πr² foundation tm-05 volumes consumed — a real catalog gap per DECISIONS.md)
- ✅ g7-02-01 Radius, Diameter, and π (`g7-circle-parts`)
- ✅ g7-02-02 Circumference (`g7-circumference`)
- ✅ g7-02-03 Area of a Circle (`g7-circle-area`) — CH2 CAPSTONE

**Ch3 Angle Equations** (7.G.5 — complementary/supplementary pairs, vertical/adjacent angles at a crossing, writing and solving equations for unknown angles; tm covers transversal-supplementary only per DECISIONS.md)
- ✅ g7-03-01 Complementary and Supplementary (`g7-complementary`)
- ✅ g7-03-02 Vertical and Adjacent Angles (`g7-vertical-angles`)
- ✅ g7-03-03 Solving for Unknown Angles (`g7-angle-equations`) — CH3 CAPSTONE
- ✅ g7-03b-01 Three Sides, One Triangle
- ✅ g7-03b-02 When the Conditions Leave a Choice
- ✅ g7-03b-03 Constructing with Compass and Straightedge

**Ch4 Triangles & Cross-Sections** (7.G.2-3 — triangle inequality with counting possible sides, cross-sections of cylinders/boxes/pyramids/cones, and a mixed roundup capstone chaining scale→circle→angle→triangle skills)
- ✅ g7-04-01 When Sides Make a Triangle (`g7-triangle-inequality`)
- ✅ g7-04-02 Slicing Solids (`g7-cross-sections`)
- ✅ g7-04-03 Geometry Roundup (mixed tags) — CH4 CAPSTONE / COURSE CLOSE
- DAG: area-surface-volume (6.G) → geometry-g7 → transformations-measurement (rerouting the interim edge per DECISIONS.md).

## Course 32 — Kindergarten: Counting & Numbers (`counting-to-20-k`, gradeLevel 0, K.CC + K.OA) — FIRST K COURSE ✅ SHIPPED (4 ch / 12 lessons, K_TRAILS + DAG edge to counting-120)

**Ch1 Counting to 10** (K.CC.4-5 — one-to-one counting, cardinality "last number = how many", subitizing, numerals 0-10 incl. zero-as-none, counting on from any number; seam: counting-120 starts past twenty per DECISIONS.md)
- ✅ kc-01-01 Count the Dots (`kc-count-objects`)
- ✅ kc-01-02 Numbers 0 to 10 (`kc-read-numerals`)
- ✅ kc-01-03 Count On (`kc-count-on`) — CH1 CAPSTONE

**Ch2 Comparing** (K.CC.6-7 — more/fewer/equal by pairing, greater/less/equal on numerals ≤10 via counting order, ordering numbers incl. zero)
- ✅ kc-02-01 More or Fewer (`kc-more-fewer`)
- ✅ kc-02-02 Greater, Less, Equal (`kc-compare-numbers`)
- ✅ kc-02-03 Order the Numbers (`kc-order-numbers`) — CH2 CAPSTONE

**Ch3 Teen Numbers & Tens** (K.CC.1-3 + K.NBT.1 — teens as ten-and-more, counting through the teens to 20, decade counting to 100)
- ✅ kc-03-01 Ten and Some More (`kc-teen-numbers`)
- ✅ kc-03-02 Count to 20 (`kc-count-to-20`)
- ✅ kc-03-03 Count by Tens (`kc-count-by-tens`) — CH3 CAPSTONE

**Ch4 Put Together, Take Apart** (K.OA.1-3,5 — adding by joining/counting on incl. +0, subtracting by hopping back incl. −0 and take-away-all, decomposing numbers ≤10 into pairs; deliberately NO partners-of-ten drill — that is G1's as-02-01 per DECISIONS.md)
- ✅ kc-04-01 Putting Together (`kc-add-within-10`)
- ✅ kc-04-02 Taking Away (`kc-subtract-within-10`)
- ✅ kc-04-03 Break Apart Numbers (`kc-decompose`) — CH4 CAPSTONE / COURSE CLOSE

## Course 33 — Kindergarten: Shapes & Sorting (`shapes-and-sorting-k`, gradeLevel 0, K.G + K.MD) — SECOND K COURSE ✅ SHIPPED (3 ch / 9 lessons, DAG-wired, K_TRAILS) — KINDERGARTEN BAND COMPLETE

**Ch1 Flat Shapes** (K.G.1-2,4 — naming circle/triangle/square/rectangle/hexagon, orientation+size invariance, position words; seam: side/corner COUNTING stays in smg1-01 per DECISIONS.md)
- ✅ ks-01-01 Name the Shapes (`ks-name-shapes`)
- ✅ ks-01-02 Shapes Any Way Up (`ks-shapes-any-way`)
- ✅ ks-01-03 Where Is It? (`ks-position-words`) — CH1 CAPSTONE

**Ch2 Solid Shapes** (K.G.1-3,5-6 — sphere/cube/cylinder/cone via everyday anchors, roll/stack/slide behavior sorting, composing shapes incl. two-triangles→square and the house decomposition; seam: face/edge/vertex COUNTING stays in smg1-01 per DECISIONS.md)
- ✅ ks-02-01 Shapes We Can Hold (`ks-name-solids`)
- ✅ ks-02-02 Roll, Stack, Slide (`ks-roll-stack-slide`)
- ✅ ks-02-03 Build with Shapes (`ks-compose-shapes`) — CH2 CAPSTONE

**Ch3 Compare & Sort** (K.MD.1-3 — fair-start length comparison incl. taller, seesaw weight comparison incl. the big≠heavy trick and holds-more capacity, classify-and-count with the sorting-preserves-total capstone)
- ✅ ks-03-01 Longer or Shorter (`ks-longer-shorter`)
- ✅ ks-03-02 Heavier, Lighter, Holds More (`ks-heavier-lighter`)
- ✅ ks-03-03 Sort and Count (`ks-sort-and-count`) — CH3 CAPSTONE / COURSE CLOSE

## Precalculus PC-1: Function Analysis (`function-analysis`, fna) — Ch1
- ✅ fna-01-01 Average Rate of Change (`fna-aroc`)
- ✅ fna-01-02 Secant Lines: Seeing the Rate (`fna-secant`)
- ✅ fna-01-03 Interpreting Rates: Units & Meaning (`fna-rate-interp`)
- ✅ fna-02-01 Where a Function Rises and Falls (`fna-inc-dec`)
- ✅ fna-02-02 Peaks & Valleys: Extrema (`fna-extrema`)
- ✅ fna-02-03 Reading a Whole Graph (`fna-graph-read`)
- ✅ fna-03-01 Even & Odd: The Symmetry Test (`fna-even-odd`)
- ✅ fna-03-02 Piecewise Functions (`fna-piecewise`)
- ✅ fna-03-03 Absolute Value & Step Functions (`fna-step`)
- ✅ fna-04-01 Composition: Order Matters (`fna-compose-order`)
- ✅ fna-04-02 The Domain of a Composition (`fna-compose-domain`)
- ✅ fna-04-03 Decomposing & Modeling with Composition (`fna-decompose`)
- ✅ fna-05-01 One-to-One & the Horizontal Line Test (`fna-one-to-one`)
- ✅ fna-05-02 Restricting the Domain (`fna-restricted`)
- ✅ fna-05-03 Verifying Inverses: the Composition Identity (`fna-inverse-verify`) — CH5 CAPSTONE / COURSE CLOSE

## Precalculus PC-2: Polynomial & Rational Analysis (`polynomial-rational-analysis`, pra) — Ch1
- ✅ pra-01-01 The Rational Root Theorem: the Candidate List (`pra-rrt-list`)
- ✅ pra-01-02 Putting Candidates on Trial (`pra-rrt-test`)
- ✅ pra-01-03 The Full Pipeline: List, Test, Divide, Finish (`pra-rrt-pipeline`)
- ✅ pra-02-01 The Fundamental Theorem: How Many Zeros Must Exist (`pra-fta-count`)
- ✅ pra-02-02 Mirror Pairs: the Conjugate Zero Theorem (`pra-conjugate`)
- ✅ pra-02-03 Building Polynomials from Mixed Zeros (`pra-build-mixed`)
- ✅ pra-03-01 When the Asymptote Tilts (`pra-slant-when`)
- ✅ pra-03-02 Finding the Slant by Division (`pra-slant-find`)
- ✅ pra-03-03 The Full Asymptote Portrait (`pra-portrait`)
- ✅ pra-04-01 The Sign Chart (`pra-signchart`)
- ✅ pra-04-02 The Multiplicity Shortcut (`pra-mult-shortcut`)
- ✅ pra-04-03 Polynomial Inequalities from Scratch (`pra-ineq-scratch`)
- ✅ pra-05-01 Rational Sign Charts: Two Kinds of Critical Points (`pra-rational-cuts`)
- ✅ pra-05-02 The Boundary Rule: Zeros Close, Excluded Values Never (`pra-boundary-rule`)
- ✅ pra-05-03 Rearranging: One Fraction, Then Chart (`pra-rearrange`) — CH5 CAPSTONE / COURSE CLOSE

## Precalculus PC-3: Trig Graphs & Inverse Trig (`trig-graphs-inverses`, tg) — Ch1
- ✅ tg-01-01 Phase Shift: Sliding the Wave (`tg-phase`)
- ✅ tg-01-02 The Full Sinusoid: Four Dials (`tg-four-dials`)
- ✅ tg-01-03 Graphing One Clean Period (`tg-five-points`)
- ✅ tg-02-01 Cosine's Graph: Starting at the Top (`tg-cos-graph`)
- ✅ tg-02-02 One Wave, Two Names (`tg-cos-sin`)
- ✅ tg-02-03 Reflections & Equivalent Rules (`tg-equiv-rules`)
- ✅ tg-03-01 Tangent: the Wave That Isn't (`tg-tan-shape`)
- ✅ tg-03-02 Exact Values & Life Near a Wall (`tg-tan-values`)
- ✅ tg-03-03 Transforming Tangent (`tg-tan-transform`)
- ✅ tg-04-01 Arcsine: a Rescued Inverse (`tg-arcsin`)
- ✅ tg-04-02 Arccosine: a Different Branch Entirely (`tg-arccos`)
- ✅ tg-04-03 The Inverse Graphs & the y = x Mirror (`tg-inverse-graphs`)
- ✅ tg-05-01 Round Trips & the arcsin(sin x) Trap (`tg-composition-trap`)
- ✅ tg-05-02 Mixed Compositions & the Helper Triangle (`tg-mixed-comp`)
- ✅ tg-05-03 Solving: One Answer from the Inverse, All Answers from the Circle (`tg-solve-all`) — CH5 CAPSTONE / COURSE CLOSE

## Precalculus PC-4: Trig Identities & Equations (`trig-identities-equations`, ti) — Ch1
- ✅ ti-01-01 General Solutions: the +2πk Move (`ti-general`)
- ✅ ti-01-02 Tangent's Ladder & Merging Families (`ti-tan-ladder`)
- ✅ ti-01-03 Ladders for Transformed Angles (`ti-inside-ladder`)
- ✅ ti-02-01 Six Functions from Two (`ti-reciprocals`)
- ✅ ti-02-02 The Pythagorean Family (`ti-pythagorean`)
- ✅ ti-02-03 Proving Identities: Working One Side (`ti-prove`)
- ✅ ti-03-01 Sum & Difference: New Angles from Old (`ti-sum-diff`)
- ✅ ti-03-02 Tangent Sums & Cofunctions (`ti-tan-cofunction`)
- ✅ ti-03-03 Applying Sum & Difference: Simplify and Prove (`ti-apply-sum-diff`)
- ✅ ti-04-01 Double-Angle: One Angle, Twice (`ti-double-basic`)
- ✅ ti-04-02 The Three Faces of cos 2θ (`ti-cos2-forms`)
- ✅ ti-04-03 Double-Angle in Action (`ti-double-action`)
- ✅ ti-05-01 Quadratics in Disguise (`ti-quad-trig`)
- ✅ ti-05-02 Mixed Functions: Convert First (`ti-convert-solve`)
- ✅ ti-05-03 Traps: Extraneous & Lost Roots (`ti-root-traps`) — CH5 CAPSTONE / COURSE CLOSE

## Precalculus PC-5: Polar Coordinates & Parametric Curves (`polar-parametric`, pp) — Ch1
- ✅ pp-01-01 A New Address System (`pp-polar-system`)
- ✅ pp-01-02 Polar → Rectangular: Drop the Triangle (`pp-to-rect`)
- ✅ pp-01-03 Rectangular → Polar: Watch the Quadrant (`pp-to-polar`)
- ✅ pp-02-01 The Simplest Polar Graphs
- ✅ pp-02-02 Rose Curves & the Petal Rule
- ✅ pp-02-03 Limaçons & Cardioids
- ✅ pp-03-01 Complex Numbers in Polar Form (`pp-polar-form`)
- ✅ pp-03-02 Multiply by Rotating: De Moivre (`pp-de-moivre`)
- ✅ pp-03-03 nth Roots: Points on a Circle (`pp-nth-roots`)
- ✅ pp-04-01 Parametric Equations: Curves Over Time (`pp-parametric`)
- ✅ pp-04-02 Eliminating the Parameter (`pp-eliminate`)
- ✅ pp-04-03 Writing Parametrizations & Orientation (`pp-parametrize`)
- ✅ pp-05-01 Projectile Motion: Two Independent Clocks (`pp-projectile`)
- ✅ pp-05-02 Peak, Flight Time, and Range (`pp-trajectory`)
- ✅ pp-05-03 The Parabolic Path: Eliminating Time (`pp-parabolic-path`) — CH5 CAPSTONE / COURSE CLOSE

## Precalculus PC-6: Vectors & Matrices (`vectors-matrices`, vec) — Ch1
- ✅ vec-01-01 Vectors: Size and Direction Together (`vec-components`)
- ✅ vec-01-02 Direction Angles & Building Components (`vec-direction`)
- ✅ vec-01-03 Displacement: Vectors Between Points (`vec-displacement`)
- ✅ vec-02-01 Adding Vectors: Tip to Tail (`vec-add`)
- ✅ vec-02-02 Scalar Multiplication: Stretch and Flip (`vec-scalar`)
- ✅ vec-02-03 Unit Vectors & Combining Motions (`vec-applications`)
- ✅ vec-03-01 The Dot Product: Vectors to a Number (`vec-dot`)
- ✅ vec-03-02 The Angle Between Two Vectors (`vec-angle`)
- ✅ vec-03-03 Work: The Dot Product at Play (`vec-work`)
- ✅ vec-04-01 Matrices & the Matrix-Vector Product (`vec-matrix-arith`, `vec-det-area`)
- ✅ vec-04-02 Determinant & Inverse (`vec-determinant`)
- ✅ vec-04-03 Solving Systems with Matrices (`vec-solve-systems`) — se callback
- ✅ vec-05-01 Matrices as Transformations (`vec-transform`) — gf mapping-notation callback
- ✅ vec-05-02 Rotation Matrices (`vec-rotation`)
- ✅ vec-05-03 Composing Transformations (`vec-compose`) — CH5 CAPSTONE

## Precalculus PC-7: Conic Sections (`conic-sections`, co) — Ch1
- ✅ co-01-01 The Parabola: Focus and Directrix (`co-parabola-def`)
- ✅ co-01-02 Shifted Parabolas & Orientation
- ✅ co-01-03 The Reflective Property (`co-reflector`)
- ✅ co-02-01 The Ellipse: Two Foci and a String (`co-ellipse-def`)
- ✅ co-02-02 Foci, Axes & the a-b-c Relationship (`co-ellipse-def`)
- ✅ co-02-03 Shifted Ellipses & How Round They Are (`co-shifted`)
- ✅ co-03-01 The Hyperbola: A Difference of Distances (`co-hyperbola-def`)
- ✅ co-03-02 Asymptotes & the Guiding Box (`co-hyperbola-def`)
- ✅ co-03-03 Foci, Orientation & Eccentricity (`co-hyp-ecc`)
- ✅ co-04-01 Reading the Second-Degree Form (`co-conic-type`)
- ✅ co-04-02 Completing the Square to Standard Form (`complete-square-area`)
- ✅ co-04-03 Hyperbolas & Parabolas from General Form
- ✅ co-05-01 Eccentricity Unifies the Conics (`co-eccentricity-scale`)
- ✅ co-05-02 The Focus-Directrix View (`co-eccentricity-scale`)
- ✅ co-05-03 Conics in the Sky (`co-eccentricity-scale`) — CH5 CAPSTONE

## Precalculus PC-8: Limits & the Doorway to Calculus (`limits-continuity`, lc) — BAND FINALE — Ch1
- ✅ lc-01-01 The Idea of a Limit: Approaching a Value (`lc-approach-table`, `lc-hole-graph`)
- ✅ lc-01-02 Reading Limits from Tables & Graphs (`lc-approach-table`, `lc-hole-graph`)
- ✅ lc-01-03 When a Limit Fails to Exist (`lc-jump-graph`)
- ✅ lc-02-01 Direct Substitution & the Limit Laws (`lc-laws`)
- ✅ lc-02-02 The 0/0 Form: Factor and Cancel (`lc-indeterminate`)
- ✅ lc-02-03 Rationalizing to Resolve Limits (`lc-indeterminate`)
- ✅ lc-03-01 One-Sided Limits (`lc-jump-graph`)
- ✅ lc-03-02 Limits at Infinity & Horizontal Asymptotes (`lc-infinity-ha`) — pra payoff
- ✅ lc-03-03 End Behavior: The Full Picture (`lc-infinity-ha`)
- ✅ lc-04-01 Continuity at a Point (`lc-continuity-conditions`)
- ✅ lc-04-02 Classifying Discontinuities (`lc-discontinuity-types`)
- ✅ lc-04-03 The Intermediate Value Theorem (`lc-ivt`)
- ✅ lc-05-01 Average Rate of Change (`lc-secant-tangent`)
- ✅ lc-05-02 The Derivative as a Limit (`lc-secant-tangent`)
- ✅ lc-05-03 Limits Everywhere: Series & the Road Ahead (`lc-partial-sums`) — CH5 CAPSTONE / sr callback

<!-- REGISTRY:AUTO-BEGIN — generated by scripts/gen-manifest.mjs; do not hand-edit. Run `npm run gen:manifest` after authoring. -->

# REGISTRY — AUTO-GENERATED FROM DISK (source of truth: `curriculum-manifest.json`)

> 129 courses · 1701 lessons · 100% concept-figure coverage · contentVersion `edfcdba833db` · corpus `edfcdba833db1261…` · generated 2026-08-10
> This block is the registration source of truth. Prose sections above are planning history.

## Adding & Taking Away (`add-subtract-10-k`, Kindergarten) — 20 lessons
- ✅ koa-01-01 Putting Groups Together
- ✅ koa-01-02 Adding with Fingers
- ✅ koa-01-03 Adding with Drawings
- ✅ koa-01-04 Acting Out a Sum
- ✅ koa-01-05 Writing an Addition Sentence
- ✅ koa-02-01 Taking Some Away
- ✅ koa-02-02 Subtracting with Drawings
- ✅ koa-02-03 Acting Out a Take-Away
- ✅ koa-02-04 Writing a Subtraction Sentence
- ✅ koa-02-05 How Many Are Left?
- ✅ koa-03-01 Add-To Stories
- ✅ koa-03-02 Take-From Stories
- ✅ koa-03-03 Put-Together Stories
- ✅ koa-03-04 Which One Is It?
- ✅ koa-03-05 Draw the Story
- ✅ koa-03-06 Sums to 5
- ✅ koa-03-07 Differences Within 5
- ✅ koa-03-08 Plus One, Minus One
- ✅ koa-03-09 Zero Changes Nothing
- ✅ koa-03-10 Speedy Fives

## Comparing (`compare-numbers-k`, Kindergarten) — 12 lessons
- ✅ kcm-01-01 More, Fewer, or the Same?
- ✅ kcm-01-02 Matching One to One
- ✅ kcm-01-03 Which Group Is Bigger?
- ✅ kcm-01-04 Which Group Is Smaller?
- ✅ kcm-02-01 Groups That Match Exactly
- ✅ kcm-02-02 Comparing Without Counting
- ✅ kcm-02-03 Comparing by Counting
- ✅ kcm-02-04 Which Number Is Greater?
- ✅ kcm-03-01 Which Number Is Less?
- ✅ kcm-03-02 Same Number, Different Things
- ✅ kcm-03-03 Line Them Up in Order
- ✅ kcm-03-04 Greatest and Least

## Counting to 100 (`counting-to-100-k`, Kindergarten) — 18 lessons
- ✅ k100-01-01 Twenty-One and Beyond
- ✅ k100-01-02 The Next Ten
- ✅ k100-01-03 Counting to Fifty
- ✅ k100-01-04 Fifty to Seventy
- ✅ k100-01-05 Seventy to One Hundred
- ✅ k100-01-06 All the Way to 100
- ✅ k100-02-01 Ten, Twenty, Thirty
- ✅ k100-02-02 Tens All the Way to 100
- ✅ k100-02-03 Rows of Ten on the Chart
- ✅ k100-02-04 Which Ten Comes Next?
- ✅ k100-02-05 Counting Tens Backward
- ✅ k100-03-01 Start at Seven
- ✅ k100-03-02 Start in the Middle
- ✅ k100-03-03 Pick Up Where It Stops
- ✅ k100-03-04 Counting On from Big Numbers
- ✅ k100-03-05 What Comes Next on the Chart?
- ✅ k100-03-06 Missing Numbers on the Chart
- ✅ k100-03-07 Counting Backward from Twenty

## Kindergarten: Counting & Numbers (`counting-to-20-k`, Kindergarten) — 13 lessons
- ✅ kc-01-01 Count the Dots
- ✅ kc-01-02 Numbers 0 to 10
- ✅ kc-01-03 Count On
- ✅ kc-02-01 More or Fewer
- ✅ kc-02-02 Greater, Less, Equal
- ✅ kc-02-03 Order the Numbers
- ✅ kc-03-01 Ten and Some More
- ✅ kc-03-02 Count to 20
- ✅ kc-03-03 Count by Tens
- ✅ kc-04-01 Putting Together
- ✅ kc-04-02 Taking Away
- ✅ kc-04-03 Break Apart Numbers
- ✅ kc-05-01 Make Ten

## How Many? (`how-many-k`, Kindergarten) — 16 lessons
- ✅ khm-01-01 Touch and Count
- ✅ khm-01-02 Don't Skip, Don't Repeat
- ✅ khm-01-03 Counting in a Line
- ✅ khm-01-04 Counting in a Circle
- ✅ khm-01-05 Counting Things You Can't Move
- ✅ khm-02-01 The Last Number Is the Answer
- ✅ khm-02-02 How Many Now?
- ✅ khm-02-03 It Doesn't Matter Where You Start
- ✅ khm-02-04 Count Again, Same Answer
- ✅ khm-02-05 Scattered Things
- ✅ khm-03-01 One More Makes the Next Number
- ✅ khm-03-02 Growing by One
- ✅ khm-03-03 Which Group Has One More?
- ✅ khm-03-04 Count Out That Many
- ✅ khm-03-05 Quick Look: How Many?
- ✅ khm-03-06 Quick Look with Ten Frames

## Measuring & Sorting (`measure-compare-k`, Kindergarten) — 12 lessons
- ✅ kmd-01-01 What Can We Measure?
- ✅ kmd-01-02 Long, Tall, and Short
- ✅ kmd-01-03 Heavy and Light
- ✅ kmd-01-04 Which Holds More?
- ✅ kmd-02-01 Comparing Two Lengths
- ✅ kmd-02-02 Comparing Two Weights
- ✅ kmd-02-03 Lining Up the Ends
- ✅ kmd-02-04 Taller Than, Shorter Than
- ✅ kmd-03-01 Sorting by Color and Shape
- ✅ kmd-03-02 Sorting by Size
- ✅ kmd-03-03 Counting Each Sort
- ✅ kmd-03-04 Which Group Has Most?

## Writing Numbers 0–20 (`number-writing-k`, Kindergarten) — 14 lessons
- ✅ kcw-01-01 Writing 1, 2, 3
- ✅ kcw-01-02 Writing 4, 5, 6
- ✅ kcw-01-03 Writing 7, 8, 9
- ✅ kcw-01-04 Zero and Ten
- ✅ kcw-01-05 Match the Numeral to the Group
- ✅ kcw-02-01 Write How Many
- ✅ kcw-02-02 Writing the Teens
- ✅ kcw-02-03 Eleven and Twelve Are Tricky
- ✅ kcw-02-04 Thirteen Through Nineteen
- ✅ kcw-02-05 Writing Twenty
- ✅ kcw-03-01 Write How Many: Teens
- ✅ kcw-03-02 Show That Many
- ✅ kcw-03-03 Draw That Many
- ✅ kcw-03-04 Numeral, Word, Picture

## Kindergarten: Shapes & Sorting (`shapes-and-sorting-k`, Kindergarten) — 9 lessons
- ✅ ks-01-01 Name the Shapes
- ✅ ks-01-02 Shapes Any Way Up
- ✅ ks-01-03 Where Is It?
- ✅ ks-02-01 Shapes We Can Hold
- ✅ ks-02-02 Roll, Stack, Slide
- ✅ ks-02-03 Build with Shapes
- ✅ ks-03-01 Longer or Shorter
- ✅ ks-03-02 Heavier, Lighter, Holds More
- ✅ ks-03-03 Sort and Count

## Building Shapes (`shapes-build-k`, Kindergarten) — 14 lessons
- ✅ kgb-01-01 Above, Below, Beside
- ✅ kgb-01-02 In Front, Behind, Next To
- ✅ kgb-01-03 Describing Where Shapes Are
- ✅ kgb-01-04 Corners and Sides
- ✅ kgb-01-05 Counting Corners
- ✅ kgb-02-01 Counting Sides
- ✅ kgb-02-02 Same Shape, Different Size
- ✅ kgb-02-03 How Are These Alike?
- ✅ kgb-02-04 How Are These Different?
- ✅ kgb-02-05 Flat Shapes vs. Solid Shapes
- ✅ kgb-03-01 Drawing a Shape
- ✅ kgb-03-02 Building a Shape from Sticks
- ✅ kgb-03-03 Two Triangles Make a Square
- ✅ kgb-03-04 Making a Bigger Shape

## Teen Numbers (`teen-numbers-k`, Kindergarten) — 12 lessons
- ✅ knb-01-01 Ten and One More
- ✅ knb-01-02 Ten and Two More
- ✅ knb-01-03 Building Teens on a Ten Frame
- ✅ knb-01-04 Eleven, Twelve, Thirteen
- ✅ knb-02-01 Fourteen Through Sixteen
- ✅ knb-02-02 Seventeen Through Nineteen
- ✅ knb-02-03 Breaking a Teen into Ten and Some
- ✅ knb-02-04 Writing Teen Equations
- ✅ knb-03-01 How Many Left Over?
- ✅ knb-03-02 Teens on the Number Line
- ✅ knb-03-03 Which Teen Is It?
- ✅ knb-03-04 Teen Numbers All Around

## Addition & Subtraction within 20 (`add-subtract-20`, Grade 1) — 17 lessons
- ✅ as-01-01 Counting On from a Number
- ✅ as-01-02 Count On 1, 2, 3
- ✅ as-01-03 Start with the Bigger Number
- ✅ as-02-01 Partners of Ten
- ✅ as-02-02 Split to Make Ten
- ✅ as-02-03 Adding by Making Ten
- ✅ as-02-04 Make Ten: You've Got It
- ✅ as-03-01 Take Away
- ✅ as-03-02 Counting Back
- ✅ as-03-03 Finding the Difference
- ✅ as-03-04 Subtraction Facts
- ✅ as-04-01 Fact Families
- ✅ as-04-02 The Equal Sign Means Same As
- ✅ as-04-03 Find the Unknown
- ✅ as-05-01 Add To & Take From
- ✅ as-05-02 Put Together & Take Apart
- ✅ as-05-03 Compare: How Many More

## Adding Three Numbers (`add-three-numbers-g1`, Grade 1) — 10 lessons
- ✅ g1t-01-01 Three Addends in a Row
- ✅ g1t-01-02 Find the Ten First
- ✅ g1t-01-03 Doubles First
- ✅ g1t-01-04 Any Order Works
- ✅ g1t-02-01 Grouping to Make It Easy
- ✅ g1t-02-02 Three-Addend Stories
- ✅ g1t-02-03 Which Two Go Together?
- ✅ g1t-03-01 Three Numbers Past Ten
- ✅ g1t-03-02 Missing Third Addend
- ✅ g1t-03-03 Adding Three, Your Way

## Adding Within 100 (`add-within-100-g1`, Grade 1) — 14 lessons
- ✅ g1a-01-01 Adding a One-Digit Number
- ✅ g1a-01-02 When the Ones Fill a Ten
- ✅ g1a-01-03 Adding a Multiple of Ten
- ✅ g1a-01-04 Tens Plus Tens
- ✅ g1a-02-01 Ten More, Ten Less in Your Head
- ✅ g1a-02-02 Using the Hundred Chart to Add
- ✅ g1a-02-03 Adding on a Number Line
- ✅ g1a-02-04 Breaking a Number to Add
- ✅ g1a-02-05 Subtracting Multiples of Ten
- ✅ g1a-02-06 Subtracting on the Hundred Chart
- ✅ g1a-03-01 Explaining Why It Works
- ✅ g1a-03-02 Addition Stories Within 100
- ✅ g1a-03-03 Subtraction Stories Within 100
- ✅ g1a-03-04 Choose Your Method

## Composing Shapes (`compose-shapes-g1`, Grade 1) — 10 lessons
- ✅ g1s-01-01 What Makes It That Shape
- ✅ g1s-01-02 Color and Size Don't Count
- ✅ g1s-01-03 Sorting by Defining Attributes
- ✅ g1s-02-01 Two Shapes Make a New One
- ✅ g1s-02-02 Making a Rectangle
- ✅ g1s-02-03 Making a Hexagon
- ✅ g1s-02-04 Filling an Outline
- ✅ g1s-03-01 Building with Solids
- ✅ g1s-03-02 Taking a Shape Apart
- ✅ g1s-03-03 New Shapes from Old

## Count & Write to 120 (`counting-120`, Grade 1) — 15 lessons
- ✅ c120-01-01 Keep Counting Past 20
- ✅ c120-01-02 Crossing to a New Ten
- ✅ c120-01-03 Counting to Fifty
- ✅ c120-02-01 Rows of Ten
- ✅ c120-02-02 Find a Number
- ✅ c120-02-03 Down a Row is Ten More
- ✅ c120-03-01 Tens and Ones Make a Numeral
- ✅ c120-03-02 The Tricky Teens
- ✅ c120-03-03 Past One Hundred
- ✅ c120-04-01 Skip-Counting by Tens
- ✅ c120-04-02 Counting a Pile
- ✅ c120-04-03 Tens and Ones to 120
- ✅ c120-05-01 One More, One Less
- ✅ c120-05-02 Ten More, Ten Less
- ✅ c120-05-03 Mixing Jumps

## Organizing Data (`data-graphs-g1`, Grade 1) — 12 lessons
- ✅ dgr1-01-01 Asking a Question
- ✅ dgr1-01-02 Sorting into Categories
- ✅ dgr1-01-03 Making a Tally
- ✅ dgr1-01-04 Reading a Tally Chart
- ✅ dgr1-02-01 Building a Picture Graph
- ✅ dgr1-02-02 Reading a Picture Graph
- ✅ dgr1-02-03 Building a Bar Graph
- ✅ dgr1-02-04 Reading a Bar Graph
- ✅ dgr1-03-01 How Many in All?
- ✅ dgr1-03-02 How Many More?
- ✅ dgr1-03-03 Which Category Has Most?
- ✅ dgr1-03-04 Telling the Story of the Data

## True Equations & Unknowns (`equations-unknowns-g1`, Grade 1) — 12 lessons
- ✅ g1e-01-01 What the Equal Sign Means
- ✅ g1e-01-02 True or False?
- ✅ g1e-01-03 Both Sides the Same
- ✅ g1e-01-04 Numbers on the Right
- ✅ g1e-01-05 Sums on Both Sides
- ✅ g1e-02-01 Unknown at the End
- ✅ g1e-02-02 Unknown in the Middle
- ✅ g1e-02-03 Unknown at the Start
- ✅ g1e-02-04 Subtraction Unknowns
- ✅ g1e-03-01 Using a Fact Family to Solve
- ✅ g1e-03-02 Checking Your Answer
- ✅ g1e-03-03 Writing Your Own True Equation

## Measuring Length (`measure-length-g1`, Grade 1) — 10 lessons
- ✅ g1m-01-01 Comparing Two Objects
- ✅ g1m-01-02 Ordering Three Objects
- ✅ g1m-01-03 Comparing Without Moving
- ✅ g1m-01-04 Using a Third Object
- ✅ g1m-02-01 Laying Units End to End
- ✅ g1m-02-02 No Gaps, No Overlaps
- ✅ g1m-02-03 Counting the Units
- ✅ g1m-03-01 Measuring with Cubes
- ✅ g1m-03-02 Measuring with Paper Clips
- ✅ g1m-03-03 Same Object, Different Units

## Strategies That Always Work (`properties-strategies-g1`, Grade 1) — 14 lessons
- ✅ g1p-01-01 Swapping the Addends
- ✅ g1p-01-02 Why Swapping Is Safe
- ✅ g1p-01-03 Counting On from the Bigger
- ✅ g1p-01-04 Counting On Three or Less
- ✅ g1p-01-05 Counting Back to Subtract
- ✅ g1p-02-01 Doubles You Know
- ✅ g1p-02-02 Doubles Plus One
- ✅ g1p-02-03 Doubles Minus One
- ✅ g1p-02-04 Making Ten to Add
- ✅ g1p-02-05 Making Ten to Subtract
- ✅ g1p-03-01 Using a Known Fact
- ✅ g1p-03-02 Equivalent Sums
- ✅ g1p-03-03 Which Strategy Fits?
- ✅ g1p-03-04 Explaining Your Strategy

## Grade 1: Shapes & Fractions (`shapes-measure-g1`, Grade 1) — 12 lessons
- ✅ smg1-01-01 What Makes a Shape Flat
- ✅ smg1-01-02 Flat or Solid?
- ✅ smg1-01-03 Counting a Solid's Parts
- ✅ smg1-02-01 Splitting a Shape in Half
- ✅ smg1-02-02 Splitting a Shape into Fourths
- ✅ smg1-02-03 Fourths Make Halves
- ✅ smg1-03-01 Which Is Longer?
- ✅ smg1-03-02 How Many More?
- ✅ smg1-03-03 Longest and Shortest
- ✅ smg1-04-01 Telling Time on the Hour
- ✅ smg1-04-02 Telling Time at Half Past
- ✅ smg1-04-03 On the Hour or Half Past?

## Grade 1: Tens & Ones (`tens-and-ones`, Grade 1) — 12 lessons
- ✅ tno-01-01 Ten Ones Make a Ten
- ✅ tno-01-02 Tens and Ones in a Number
- ✅ tno-01-03 Reading Base-Ten Blocks
- ✅ tno-02-01 Breaking a Number Apart
- ✅ tno-02-02 Reading Expanded Form
- ✅ tno-02-03 Which Digit Is Worth More?
- ✅ tno-03-01 Ten More, Ten Less
- ✅ tno-03-02 Adding Tens
- ✅ tno-03-03 Subtracting Tens
- ✅ tno-04-01 Which Has More Tens?
- ✅ tno-04-02 Same Tens, Check the Ones
- ✅ tno-04-03 Comparing Any Two Numbers

## Addition & Subtraction within 100 (`add-subtract-100`, Grade 2) — 16 lessons
- ✅ as100-01-01 Doubles
- ✅ as100-01-02 Near Doubles
- ✅ as100-01-03 Choose Your Strategy
- ✅ as100-02-01 Adding Tens
- ✅ as100-02-02 Add Ones to a Two-Digit Number
- ✅ as100-02-03 Adding Two-Digit Numbers
- ✅ as100-02-04 Trade Ten Ones
- ✅ as100-03-01 Subtracting Tens
- ✅ as100-03-02 Take Ones Away
- ✅ as100-03-03 Subtracting Two-Digit Numbers
- ✅ as100-03-04 Break a Ten
- ✅ as100-04-01 Two-Step Stories
- ✅ as100-04-02 Stories that Trade
- ✅ as100-04-03 Choose the Two Steps
- ✅ as100-05-01 Odd & Even
- ✅ as100-05-02 Adding Odds & Evens

## Adding & Subtracting Within 1,000 (`add-subtract-1000-g2`, Grade 2) — 16 lessons
- ✅ g2b-01-01 Adding Hundreds
- ✅ g2b-01-02 Adding Without Trading
- ✅ g2b-01-03 Trading Ones for a Ten
- ✅ g2b-01-04 Trading Tens for a Hundred
- ✅ g2b-01-05 Two Trades at Once
- ✅ g2b-02-01 Subtracting Without Trading
- ✅ g2b-02-02 Breaking a Ten
- ✅ g2b-02-03 Breaking a Hundred
- ✅ g2b-02-04 Subtracting Across a Zero
- ✅ g2b-02-05 Ten More, Ten Less Mentally
- ✅ g2b-02-06 Hundred More, Hundred Less Mentally
- ✅ g2b-03-01 Jumping on an Open Number Line
- ✅ g2b-03-02 Why Trading Works
- ✅ g2b-03-03 Explaining a Strategy
- ✅ g2b-03-04 Three-Digit Stories
- ✅ g2b-03-05 Choosing a Method

## Arrays, Odd & Even (`arrays-even-odd-g2`, Grade 2) — 10 lessons
- ✅ g2a-01-01 Pairing Things Up
- ✅ g2a-01-02 Odd or Even?
- ✅ g2a-01-03 Doubles Make Evens
- ✅ g2a-01-04 Writing an Even as a Double
- ✅ g2a-02-01 Rows and Columns
- ✅ g2a-02-02 Counting an Array by Rows
- ✅ g2a-02-03 Counting an Array by Columns
- ✅ g2a-03-01 Writing the Repeated Sum
- ✅ g2a-03-02 Same Total, Different Array
- ✅ g2a-03-03 Arrays in the World

## Collecting & Showing Data (`data-line-plots-g2`, Grade 2) — 12 lessons
- ✅ g2g-01-01 Measuring a Whole Group
- ✅ g2g-01-02 Recording Measurements
- ✅ g2g-01-03 Building a Line Plot
- ✅ g2g-01-04 Reading a Line Plot
- ✅ g2g-01-05 Most Common Measurement
- ✅ g2g-02-01 Building a Picture Graph
- ✅ g2g-02-02 Reading a Picture Graph
- ✅ g2g-02-03 Building a Bar Graph
- ✅ g2g-02-04 Reading a Bar Graph
- ✅ g2g-03-01 Put-Together Questions
- ✅ g2g-03-02 Take-Apart and Compare Questions
- ✅ g2g-03-03 Which Graph Should I Use?

## Fluency Within 20 (`fluency-20-g2`, Grade 2) — 14 lessons
- ✅ f20-01-01 Doubles from Memory
- ✅ f20-01-02 Near Doubles
- ✅ f20-01-03 Making Ten
- ✅ f20-01-04 Ten Plus Something
- ✅ f20-02-01 Sums to 12
- ✅ f20-02-02 Sums to 16
- ✅ f20-02-03 Sums to 20
- ✅ f20-02-04 Subtracting from Ten
- ✅ f20-03-01 Subtracting Across Ten
- ✅ f20-03-02 Think Addition to Subtract
- ✅ f20-03-03 Fact Families to 20
- ✅ f20-03-04 Missing Numbers
- ✅ f20-03-05 Speed Round: Addition
- ✅ f20-03-06 Speed Round: Subtraction

## Adding Several Numbers (`four-addends-g2`, Grade 2) — 8 lessons
- ✅ g2n-01-01 Adding Three Two-Digit Numbers
- ✅ g2n-01-02 Adding Four Two-Digit Numbers
- ✅ g2n-01-03 Look for Tens First
- ✅ g2n-02-01 Adding the Tens, Then the Ones
- ✅ g2n-02-02 Grouping Friendly Pairs
- ✅ g2n-02-03 Keeping Track of the Total
- ✅ g2n-03-01 Four-Addend Stories
- ✅ g2n-03-02 Checking a Long Sum

## Length Problems (`length-problems-g2`, Grade 2) — 10 lessons
- ✅ g2p-01-01 How Much Longer?
- ✅ g2p-01-02 Comparing Two Measurements
- ✅ g2p-01-03 Finding the Difference in Length
- ✅ g2p-02-01 Adding Two Lengths
- ✅ g2p-02-02 Total Distance
- ✅ g2p-02-03 Missing Length
- ✅ g2p-03-01 Length Stories with Drawings
- ✅ g2p-03-02 Using a Number Line for Length
- ✅ g2p-03-03 Two-Step Length Problems
- ✅ g2p-03-04 Does the Answer Make Sense?

## Grade 2: Measurement, Money & Time (`measure-money-time`, Grade 2) — 15 lessons
- ✅ mmt-01-01 Reading a Ruler
- ✅ mmt-01-02 Measuring with Different Starting Points
- ✅ mmt-01-03 Choosing the Right Unit
- ✅ mmt-02-01 Estimating Before You Measure
- ✅ mmt-02-02 Which Is Longer?
- ✅ mmt-02-03 Ordering Three Lengths
- ✅ mmt-03-01 What Are Coins Worth?
- ✅ mmt-03-02 Counting Mixed Coins
- ✅ mmt-03-03 How Many Coins Make That?
- ✅ mmt-04-01 Skip-Counting by 5s on the Clock
- ✅ mmt-04-02 Reading Five-Minute Times
- ✅ mmt-04-03 Practicing Five-Minute Times
- ✅ mmt-05-01 Reading a Picture Graph
- ✅ mmt-05-02 Reading a Bar Graph
- ✅ mmt-05-03 Reading a Line Plot and Comparing Data

## The Number Line (`number-line-g2`, Grade 2) — 10 lessons
- ✅ g2l-01-01 Numbers on a Line
- ✅ g2l-01-02 Equally Spaced Marks
- ✅ g2l-01-03 Finding a Number Between
- ✅ g2l-02-01 Jumping Forward to Add
- ✅ g2l-02-02 Jumping Backward to Subtract
- ✅ g2l-02-03 Big Jumps and Small Jumps
- ✅ g2l-03-01 Showing a Sum on the Line
- ✅ g2l-03-02 Showing a Difference on the Line
- ✅ g2l-03-03 Which Jump Is Missing?
- ✅ g2l-03-04 Number Line Stories

## Grade 2: Place Value to 1,000 (`place-value-1000`, Grade 2) — 12 lessons
- ✅ pv1000-01-01 Hundreds Join the Party
- ✅ pv1000-01-02 Trading Up and Down
- ✅ pv1000-01-03 Any Number, Any Spot
- ✅ pv1000-02-01 Skip-Counting by Tens and Hundreds
- ✅ pv1000-02-02 Skip-Counting by Fives
- ✅ pv1000-02-03 Counting Forward from Any Start
- ✅ pv1000-03-01 Reading and Writing 3-Digit Numbers
- ✅ pv1000-03-02 Comparing Numbers with Symbols
- ✅ pv1000-03-03 Ordering 3-Digit Numbers
- ✅ pv1000-04-01 Adding by Place, Then Combining
- ✅ pv1000-04-02 Subtracting by Place, with Trading
- ✅ pv1000-04-03 Adding and Subtracting in Real Situations

## Grade 2: Shapes & Equal Shares (`shapes-shares-g2`, Grade 2) — 9 lessons
- ✅ ssg2-01-01 Bigger Shape Families
- ✅ ssg2-01-02 Meet the Pyramid
- ✅ ssg2-01-03 Naming Any Shape
- ✅ ssg2-02-01 Counting a Grid of Squares
- ✅ ssg2-02-02 Bigger Grids
- ✅ ssg2-02-03 Grids in Everyday Objects
- ✅ ssg2-03-01 Splitting into Thirds
- ✅ ssg2-03-02 Naming a Third
- ✅ ssg2-03-03 Comparing Halves, Thirds, and Fourths

## Fluent to 1,000 (`add-subtract-1000-g3`, Grade 3) — 10 lessons
- ✅ g3a-01-01 Adding Three-Digit Numbers
- ✅ g3a-01-02 Two Regroupings
- ✅ g3a-01-03 Subtracting Three-Digit Numbers
- ✅ g3a-01-04 Regrouping Twice to Subtract
- ✅ g3a-02-01 Across Two Zeros
- ✅ g3a-02-02 Adding on an Open Number Line
- ✅ g3a-02-03 Compensation Strategy
- ✅ g3a-03-01 Checking by Adding Back
- ✅ g3a-03-02 Three-Digit Stories
- ✅ g3a-03-03 Which Strategy Is Fastest?

## Division Fluency (`division-fluency-g3`, Grade 3) — 12 lessons
- ✅ df3-01-01 Dividing by 2
- ✅ df3-01-02 Dividing by 3
- ✅ df3-01-03 Dividing by 4 and 5
- ✅ df3-01-04 Dividing by 6 and 7
- ✅ df3-02-01 Dividing by 8 and 9
- ✅ df3-02-02 Dividing by 10
- ✅ df3-02-03 Think Multiplication
- ✅ df3-02-04 Missing Factor, Missing Quotient
- ✅ df3-03-01 Dividing by 1 and Itself
- ✅ df3-03-02 Why You Can't Divide by Zero
- ✅ df3-03-03 Mixed Division Facts
- ✅ df3-03-04 Multiply or Divide?

## Fractions from Scratch (`fractions`, Grade 3) — 15 lessons
- ✅ fr-01-01 Cutting into Equal Parts
- ✅ fr-01-02 Unit Fractions: One Piece
- ✅ fr-01-03 Counting Pieces: a/b
- ✅ fr-01-04 Top Number, Bottom Number
- ✅ fr-02-01 Cutting the Line
- ✅ fr-02-02 Locating 1/b
- ✅ fr-02-03 Locating a/b
- ✅ fr-02-04 Fractions Past One
- ✅ fr-03-01 Same Point, Different Names
- ✅ fr-03-02 Seeing 2/4 = 1/2
- ✅ fr-03-03 Whole Numbers in Disguise
- ✅ fr-04-01 Same Bottom, Compare Tops
- ✅ fr-04-02 Same Top, Compare Bottoms
- ✅ fr-04-03 Why 1/3 Beats 1/4
- ✅ fr-04-04 Only If the Wholes Match

## Fractions: Going Deeper (`fractions-deeper-g3`, Grade 3) — 14 lessons
- ✅ g3f-01-01 Equal Parts, Unequal Parts
- ✅ g3f-01-02 Naming the Unit Fraction
- ✅ g3f-01-03 Building a/b from 1/b
- ✅ g3f-01-04 Fractions of a Set
- ✅ g3f-01-05 Fractions on a Ruler
- ✅ g3f-02-01 Marking Thirds on a Line
- ✅ g3f-02-02 Marking Sixths and Eighths
- ✅ g3f-02-03 Finding Equivalents with a Strip
- ✅ g3f-02-04 Equivalents on the Number Line
- ✅ g3f-02-05 Whole Numbers as Fractions
- ✅ g3f-03-01 Fractions Equal to One
- ✅ g3f-03-02 Comparing with the Same Whole
- ✅ g3f-03-03 Ordering Three Fractions
- ✅ g3f-03-04 Fraction Stories

## Measurement, Time & Data (`measurement-data`, Grade 3) — 17 lessons
- ✅ md-01-01 Reading the Clock
- ✅ md-01-02 Minutes Before and After
- ✅ md-01-03 Elapsed Time on a Number Line
- ✅ md-02-01 How Heavy? Grams and Kilograms
- ✅ md-02-02 How Much? Liters
- ✅ md-02-03 Measure-and-Solve Stories
- ✅ md-03-01 Pictographs with a Key
- ✅ md-03-02 Scaled Bar Graphs
- ✅ md-03-03 Asking the Graph Questions
- ✅ md-03-04 Line Plots with Halves and Quarters
- ✅ md-04-01 Covering with Squares
- ✅ md-04-02 Rows × Columns = Area
- ✅ md-04-03 The Break-Apart Rectangle
- ✅ md-04-04 Odd Shapes: Add the Pieces
- ✅ md-05-01 Walking the Fence
- ✅ md-05-02 The Missing Side
- ✅ md-05-03 Same Area, Different Fence

## Multiplication Fluency (`mult-fluency-g3`, Grade 3) — 18 lessons
- ✅ mf3-01-01 The ×2 Facts
- ✅ mf3-01-02 The ×3 Facts
- ✅ mf3-01-03 The ×4 Facts
- ✅ mf3-01-04 The ×5 Facts
- ✅ mf3-01-05 The ×6 Facts
- ✅ mf3-01-06 The ×7 Facts
- ✅ mf3-02-01 The ×8 Facts
- ✅ mf3-02-02 The ×9 Facts
- ✅ mf3-02-03 The ×10 Facts
- ✅ mf3-02-04 Squares: 3×3, 4×4, 5×5
- ✅ mf3-02-05 The Facts That Stick
- ✅ mf3-02-06 Using a Fact You Know
- ✅ mf3-03-01 Mixed Facts to 5×5
- ✅ mf3-03-02 Mixed Facts to 9×9
- ✅ mf3-03-03 Finding a Fact Fast
- ✅ mf3-03-04 Missing Factor
- ✅ mf3-03-05 Fact Families in Multiplication
- ✅ mf3-03-06 The Whole Table

## Multiplication & Division Foundations (`multiplication-division`, Grade 3) — 24 lessons
- ✅ mult-01-01 Groups of: What Multiplication Means
- ✅ mult-01-02 Arrays: Rows and Columns
- ✅ mult-01-03 Skip Counting: Multiplication Out Loud
- ✅ mult-01-04 Hops on the Number Line
- ✅ mult-01-05 Turn It Around: Flipping Facts
- ✅ mult-02-01 Fair Shares
- ✅ mult-02-02 How Many Groups?
- ✅ mult-02-03 Division Is a Missing Factor
- ✅ mult-02-04 Fact Families
- ✅ mult-02-05 The Strange Ones: ×1, ×0, ÷1
- ✅ mult-03-01 Doubles: the ×2 Machine
- ✅ mult-03-02 Fives and Tens
- ✅ mult-03-03 Double-Double: ×4 and ×8
- ✅ mult-03-04 The Nines Pattern
- ✅ mult-03-05 Split It: the Break-Apart Trick for 6, 7, 8
- ✅ mult-04-01 Which Operation?
- ✅ mult-04-02 What's Unknown: Group Size or Group Count?
- ✅ mult-04-03 Letters Stand for Numbers
- ✅ mult-04-04 Two-Step Problems
- ✅ mult-04-05 Does the Answer Make Sense?
- ✅ mult-05-01 Patterns in the Addition Table
- ✅ mult-05-02 Patterns in the Multiplication Table
- ✅ mult-05-03 Even × Odd: What Happens?
- ✅ mult-05-04 Multiples on the Hundred Chart

## Place Value & Big Numbers (`place-value`, Grade 3) — 15 lessons
- ✅ pv-01-01 Hundreds, Tens, Ones
- ✅ pv-01-02 Build and Break Numbers
- ✅ pv-01-03 Which Is Bigger?
- ✅ pv-01-04 Ten of These Is One of Those
- ✅ pv-02-01 The Closer Ten
- ✅ pv-02-02 The Closer Hundred
- ✅ pv-02-03 The Halfway Rule
- ✅ pv-02-04 Estimating in Stories
- ✅ pv-03-01 Friendly-Number Jumps
- ✅ pv-03-02 Regrouping You Can See
- ✅ pv-03-03 Subtracting Across a Zero
- ✅ pv-03-04 Check It with an Estimate
- ✅ pv-04-01 4 × 60 Is 4 × 6 Tens
- ✅ pv-04-02 The Zero Pattern
- ✅ pv-04-03 Tens in Stories

## Shapes & Space (`shapes-space`, Grade 3) — 7 lessons
- ✅ geo-01-01 What Makes a Shape a Shape?
- ✅ geo-01-02 The Quadrilateral Family
- ✅ geo-01-03 Squares Are Rectangles?!
- ✅ geo-02-01 Sorting by Rules
- ✅ geo-02-02 The Misfits
- ✅ geo-03-01 Splitting Shapes Fairly
- ✅ geo-03-02 Naming the Parts

## Two-Step Word Problems (`word-problems-g3`, Grade 3) — 12 lessons
- ✅ g3w-01-01 Finding the Hidden Question
- ✅ g3w-01-02 Add Then Multiply
- ✅ g3w-01-03 Multiply Then Subtract
- ✅ g3w-01-04 Divide Then Add
- ✅ g3w-02-01 Two Steps with a Letter
- ✅ g3w-02-02 Writing the Equation
- ✅ g3w-02-03 Drawing a Bar Model
- ✅ g3w-02-04 Estimating First
- ✅ g3w-03-01 Checking with Rounding
- ✅ g3w-03-02 Spotting an Unreasonable Answer
- ✅ g3w-03-03 Extra Information
- ✅ g3w-03-04 Writing Your Own Two-Step Problem

## Decimals: Tenths & Hundredths (`decimals-intro-g4`, Grade 4) — 18 lessons
- ✅ dg4-01-01 Splitting One into Ten
- ✅ dg4-01-02 Writing a Tenth
- ✅ dg4-01-03 Tenths on a Number Line
- ✅ dg4-01-04 Tenths as Fractions
- ✅ dg4-01-05 Splitting a Tenth into Ten
- ✅ dg4-01-06 Writing a Hundredth
- ✅ dg4-02-01 Hundredths on a Grid
- ✅ dg4-02-02 Tenths to Hundredths
- ✅ dg4-02-03 Adding Tenths and Hundredths
- ✅ dg4-02-04 Reading a Decimal Aloud
- ✅ dg4-02-05 Decimal Place Names
- ✅ dg4-02-06 Fraction to Decimal
- ✅ dg4-03-01 Decimal to Fraction
- ✅ dg4-03-02 Comparing Two Decimals
- ✅ dg4-03-03 The Trailing Zero
- ✅ dg4-03-04 Ordering Decimals
- ✅ dg4-03-05 Decimals and Money
- ✅ dg4-03-06 Decimals in Measurement

## Fractions Times Whole Numbers (`fraction-multiply-g4`, Grade 4) — 12 lessons
- ✅ g4x-01-01 A Fraction Added Again and Again
- ✅ g4x-01-02 Writing It as Multiplication
- ✅ g4x-01-03 Multiples of a Unit Fraction
- ✅ g4x-01-04 n × a/b
- ✅ g4x-02-01 On the Number Line
- ✅ g4x-02-02 Using an Area Model
- ✅ g4x-02-03 Products Greater Than One
- ✅ g4x-02-04 Writing the Answer as a Mixed Number
- ✅ g4x-03-01 Word Problems: Equal Groups
- ✅ g4x-03-02 Word Problems: Recipes
- ✅ g4x-03-03 Word Problems: Distance
- ✅ g4x-03-04 Estimating a Fraction Product

## Fractions That Add Up (`fractions-add`, Grade 4) — 14 lessons
- ✅ fa-01-01 Same Amount, New Cut
- ✅ fa-01-02 The ×n/×n Rule, Derived
- ✅ fa-01-03 Using the Rule (and Reversing It)
- ✅ fa-02-01 Halfway Benchmarks
- ✅ fa-02-02 Comparing Without a Common Denominator
- ✅ fa-02-03 Ordering with Benchmarks
- ✅ fa-03-01 Adding Like Fractions
- ✅ fa-03-02 Subtracting Like Fractions
- ✅ fa-03-03 Word Problems with Like Fractions
- ✅ fa-04-01 Improper to Mixed
- ✅ fa-04-02 Mixed to Improper
- ✅ fa-04-03 Adding & Subtracting Mixed Numbers
- ✅ fa-05-01 Repeated Addition of Fractions
- ✅ fa-05-02 The Shortcut and Word Problems

## Lines & Angles (`lines-angles`, Grade 4) — 12 lessons
- ✅ la-01-01 Naming the Basics
- ✅ la-01-02 Two Rays Make an Angle
- ✅ la-01-03 Reading Geometric Figures
- ✅ la-02-01 Lines That Never Meet
- ✅ la-02-02 Lines That Cross Exactly Right
- ✅ la-02-03 Spotting Both in Figures
- ✅ la-03-01 Classifying Triangles
- ✅ la-03-02 A Triangle's Angles Always Sum to 180°
- ✅ la-03-03 Classifying Quadrilaterals
- ✅ la-04-01 What Symmetry Means
- ✅ la-04-02 Finding Every Line of Symmetry
- ✅ la-04-03 Symmetry All Around

## Measure & Convert (`measure-convert`, Grade 4) — 15 lessons
- ✅ mc-01-01 Metric Prefixes as Badges
- ✅ mc-01-02 Converting Length
- ✅ mc-01-03 Converting Mass & Volume
- ✅ mc-02-01 The Area Formula
- ✅ mc-02-02 The Perimeter Formula
- ✅ mc-02-03 Formulas in Word Problems
- ✅ mc-03-01 What a Degree Measures
- ✅ mc-03-02 Measuring with a Protractor
- ✅ mc-03-03 Classifying Angles
- ✅ mc-04-01 Angles That Combine
- ✅ mc-04-02 Finding a Missing Angle
- ✅ mc-04-03 Benchmark Angles
- ✅ mc-05-01 Measuring to the Nearest Fraction
- ✅ mc-05-02 Building a Line Plot
- ✅ mc-05-03 Reading Line Plot Questions

## Measurement Word Problems (`measure-problems-g4`, Grade 4) — 12 lessons
- ✅ g4v-01-01 Bigger Unit, Smaller Number
- ✅ g4v-01-02 Building a Conversion Table
- ✅ g4v-01-03 Converting Length
- ✅ g4v-01-04 Converting Mass and Weight
- ✅ g4v-02-01 Converting Liquid Volume
- ✅ g4v-02-02 Converting Time
- ✅ g4v-02-03 Distance Problems
- ✅ g4v-02-04 Time Interval Problems
- ✅ g4v-03-01 Money Problems
- ✅ g4v-03-02 Problems with Fractions of a Unit
- ✅ g4v-03-03 Multi-Step Measurement
- ✅ g4v-03-04 Diagrams for Measurement Problems

## Multi-Digit Multiplication & Division (`mult-div-fluency-g4`, Grade 4) — 16 lessons
- ✅ g4m-01-01 Multiplying by 10, 100, 1000
- ✅ g4m-01-02 Partial Products with an Area Model
- ✅ g4m-01-03 Four-Digit by One-Digit
- ✅ g4m-01-04 Regrouping in Multiplication
- ✅ g4m-01-05 Two-Digit by Two-Digit: Area Model
- ✅ g4m-01-06 Two-Digit by Two-Digit: Partial Products
- ✅ g4m-02-01 Estimating a Product
- ✅ g4m-02-02 Checking a Product
- ✅ g4m-02-03 Dividing with Place Value
- ✅ g4m-02-04 Partial Quotients
- ✅ g4m-02-05 Three-Digit by One-Digit
- ✅ g4m-03-01 Four-Digit by One-Digit
- ✅ g4m-03-02 Remainders in Division
- ✅ g4m-03-03 What to Do with the Remainder
- ✅ g4m-03-04 Estimating a Quotient
- ✅ g4m-03-05 Checking a Quotient

## Multiply Bigger (`multiply-bigger`, Grade 4) — 14 lessons
- ✅ mb-01-01 Times as Many
- ✅ mb-01-02 Comparison Stories
- ✅ mb-01-03 More or Times?
- ✅ mb-02-01 Factor Pairs
- ✅ mb-02-02 Multiples on the Trail
- ✅ mb-02-03 Prime and Composite
- ✅ mb-03-01 Tens Times
- ✅ mb-03-02 Break the Big Number
- ✅ mb-03-03 Two-Digit Times Two-Digit
- ✅ mb-04-01 Sharing with Leftovers
- ✅ mb-04-02 Big Division
- ✅ mb-04-03 What the Leftover Means
- ✅ mb-05-01 Number Patterns
- ✅ mb-05-02 Multi-Step Stories

## Multi-Step Problems (`multistep-g4`, Grade 4) — 8 lessons
- ✅ g4s-01-01 Two Operations, One Story
- ✅ g4s-01-02 Three Operations
- ✅ g4s-01-03 Multiplicative Comparison Stories
- ✅ g4s-02-01 Problems with Remainders
- ✅ g4s-02-02 Writing Equations with a Letter
- ✅ g4s-02-03 Estimating to Check
- ✅ g4s-03-01 Rounding to Assess Reasonableness
- ✅ g4s-03-02 Explaining Your Plan

## Patterns, Factors & Multiples (`patterns-factors-g4`, Grade 4) — 10 lessons
- ✅ g4p-01-01 Finding All Factor Pairs
- ✅ g4p-01-02 Is It a Factor?
- ✅ g4p-01-03 Listing Multiples
- ✅ g4p-01-04 Is It a Multiple?
- ✅ g4p-02-01 Prime or Composite?
- ✅ g4p-02-02 The Sieve
- ✅ g4p-03-01 Number Patterns from a Rule
- ✅ g4p-03-02 Shape Patterns from a Rule
- ✅ g4p-03-03 Features Not in the Rule
- ✅ g4p-03-04 Extending and Explaining

## Place Value to a Million (`place-value-million`, Grade 4) — 14 lessons
- ✅ pv2-01-01 Climbing the Ladder
- ✅ pv2-01-02 Ten Times Bigger, Ten Times Smaller
- ✅ pv2-01-03 Naming Six-Digit Places
- ✅ pv2-02-01 Standard, Word, and Expanded Form
- ✅ pv2-02-02 Reading Big Numbers Aloud
- ✅ pv2-02-03 Comma Periods
- ✅ pv2-03-01 Rounding to Any Place
- ✅ pv2-03-02 Rounding Word Problems
- ✅ pv2-03-03 Front-End Estimation
- ✅ pv2-04-01 Adding with Regrouping
- ✅ pv2-04-02 Subtracting with Regrouping
- ✅ pv2-04-03 Subtracting Across Zeros
- ✅ pv2-05-01 Comparing Big Numbers
- ✅ pv2-05-02 Ordering Big Numbers

## The Coordinate Plane & Shape Families (`coordinate-geometry`, Grade 5) — 10 lessons
- ✅ cg-01-01 The Coordinate Plane
- ✅ cg-01-02 Plotting Points
- ✅ cg-01-03 Graphs That Tell Stories
- ✅ cg-02-01 Two Patterns at Once
- ✅ cg-02-02 Pairs on the Plane
- ✅ cg-03-01 Attributes Carry Down
- ✅ cg-03-02 The Quadrilateral Family
- ✅ cg-03-03 The Triangle Family
- ✅ cg-04-01 Sorting by Properties
- ✅ cg-04-02 True in the Hierarchy

## Decimal Operations Fluency (`decimal-fluency-g5`, Grade 5) — 16 lessons
- ✅ g5d-01-01 Adding Decimals with a Model
- ✅ g5d-01-02 Lining Up the Decimal Point
- ✅ g5d-01-03 Adding with Different Lengths
- ✅ g5d-01-04 Subtracting Decimals
- ✅ g5d-01-05 Subtracting with Padding
- ✅ g5d-01-06 Multiplying a Decimal by a Whole Number
- ✅ g5d-02-01 Estimating a Decimal Product
- ✅ g5d-02-02 Multiplying Two Decimals
- ✅ g5d-02-03 Where Does the Point Go?
- ✅ g5d-02-04 Dividing a Decimal by a Whole Number
- ✅ g5d-02-05 Dividing by a Decimal
- ✅ g5d-03-01 Moving the Point to Divide
- ✅ g5d-03-02 Checking a Decimal Answer
- ✅ g5d-03-03 Money Problems
- ✅ g5d-03-04 Measurement Problems
- ✅ g5d-03-05 Multi-Step Decimal Problems

## Decimal & Whole-Number Operations (`decimal-operations`, Grade 5) — 15 lessons
- ✅ dop-01-01 Why Order Matters
- ✅ dop-01-02 Grouping Symbols First
- ✅ dop-01-03 Writing & Reading Expressions
- ✅ dop-02-01 Partial Products Recap
- ✅ dop-02-02 The Standard Algorithm
- ✅ dop-02-03 Multi-Digit × Multi-Digit
- ✅ dop-03-01 Estimating the Quotient
- ✅ dop-03-02 Long Division, Two-Digit Divisor
- ✅ dop-03-03 Interpreting Remainders
- ✅ dop-04-01 Line Up the Points
- ✅ dop-04-02 Padding & Regrouping
- ✅ dop-04-03 Decimal Sums in Context
- ✅ dop-05-01 Counting Decimal Places
- ✅ dop-05-02 Multiplying Decimals
- ✅ dop-05-03 Dividing Decimals

## Powers of Ten & Decimals (`decimals-place-value`, Grade 5) — 12 lessons
- ✅ dpv-01-01 Tenths: The First Rung Below One
- ✅ dpv-01-02 Hundredths and Thousandths
- ✅ dpv-01-03 ×10 and ÷10 as Ladder Moves
- ✅ dpv-02-01 Place Names After the Point
- ✅ dpv-02-02 Expanded Form with Decimals
- ✅ dpv-02-03 Words to Decimals and Back
- ✅ dpv-03-01 Lining Up the Places
- ✅ dpv-03-02 The Trailing-Zero Trap
- ✅ dpv-03-03 Ordering a Set of Decimals
- ✅ dpv-04-01 Rounding to a Whole
- ✅ dpv-04-02 Rounding to Any Decimal Place
- ✅ dpv-04-03 Rounding in Context

## Expressions & Patterns (`expressions-patterns-g5`, Grade 5) — 12 lessons
- ✅ g5e-01-01 Order of Operations
- ✅ g5e-01-02 Parentheses First
- ✅ g5e-01-03 Brackets and Braces
- ✅ g5e-01-04 Evaluating a Long Expression
- ✅ g5e-02-01 Writing an Expression from Words
- ✅ g5e-02-02 Reading an Expression Aloud
- ✅ g5e-02-03 Comparing Expressions Without Computing
- ✅ g5e-03-01 Two Rules at Once
- ✅ g5e-03-02 Making Ordered Pairs
- ✅ g5e-03-03 Graphing the Pattern
- ✅ g5e-03-04 Finding the Relationship
- ✅ g5e-03-05 Explaining Why the Pattern Holds

## Fractions as Division (`fraction-division-g5`, Grade 5) — 12 lessons
- ✅ g5f-01-01 Sharing That Doesn't Come Out Even
- ✅ g5f-01-02 a ÷ b = a/b
- ✅ g5f-01-03 Interpreting the Quotient
- ✅ g5f-01-04 Sharing Problems
- ✅ g5f-02-01 Dividing a Unit Fraction by a Whole Number
- ✅ g5f-02-02 Dividing a Whole Number by a Unit Fraction
- ✅ g5f-02-03 Using a Visual Model
- ✅ g5f-02-04 On the Number Line
- ✅ g5f-03-01 Checking with Multiplication
- ✅ g5f-03-02 Which Is It?
- ✅ g5f-03-03 Division Word Problems
- ✅ g5f-03-04 Estimating a Quotient

## Multiplying & Dividing Fractions (`fractions-multiply`, Grade 5) — 13 lessons
- ✅ fm-01-01 Finding a Common Denominator
- ✅ fm-01-02 Adding Unlike Fractions
- ✅ fm-01-03 Subtracting Unlike Fractions
- ✅ fm-02-01 Groups of a Fraction
- ✅ fm-02-02 A Fraction of a Number
- ✅ fm-03-01 The Area Model
- ✅ fm-03-02 Multiply Across
- ✅ fm-03-03 Simplify the Product
- ✅ fm-04-01 Bigger, Smaller, or Same?
- ✅ fm-04-02 Scaling Without Computing
- ✅ fm-05-01 Wholes into Unit Fractions
- ✅ fm-05-02 Unit Fractions into Wholes
- ✅ fm-05-03 Division in Context

## Two-Digit Divisors (`long-division-g5`, Grade 5) — 6 lessons
- ✅ g5l-01-01 Estimating with Compatible Numbers
- ✅ g5l-01-02 Dividing by a Multiple of Ten
- ✅ g5l-02-01 Partial Quotients
- ✅ g5l-02-02 The Standard Algorithm
- ✅ g5l-03-01 Adjusting a Too-Big Guess
- ✅ g5l-03-02 Checking and Interpreting

## Adding & Subtracting Unlike Fractions (`unlike-fractions-g5`, Grade 5) — 14 lessons
- ✅ g5u-01-01 Why You Need the Same Pieces
- ✅ g5u-01-02 Finding a Common Denominator
- ✅ g5u-01-03 The Least Common Denominator
- ✅ g5u-01-04 Renaming Both Fractions
- ✅ g5u-01-05 Adding Unlike Fractions
- ✅ g5u-02-01 Subtracting Unlike Fractions
- ✅ g5u-02-02 Adding Mixed Numbers
- ✅ g5u-02-03 Subtracting Mixed Numbers
- ✅ g5u-02-04 Regrouping to Subtract
- ✅ g5u-02-05 Simplifying the Answer
- ✅ g5u-03-01 Benchmark Estimation
- ✅ g5u-03-02 Is the Answer Reasonable?
- ✅ g5u-03-03 Fraction Word Problems
- ✅ g5u-03-04 Multi-Step Fraction Problems

## Volume & Measurement (`volume-measurement`, Grade 5) — 12 lessons
- ✅ vm-01-01 Converting Metric Units
- ✅ vm-01-02 Converting Customary Units
- ✅ vm-01-03 Multi-Step Conversions
- ✅ vm-02-01 Reading a Line Plot
- ✅ vm-02-02 Using Line Plot Data
- ✅ vm-03-01 What Volume Means
- ✅ vm-03-02 Counting Cubes
- ✅ vm-04-01 Layers of Cubes
- ✅ vm-04-02 V = l × w × h
- ✅ vm-04-03 V = B × h
- ✅ vm-05-01 Adding Volumes
- ✅ vm-05-02 Splitting Solids

## Volume Problems (`volume-problems-g5`, Grade 5) — 8 lessons
- ✅ g5v-01-01 Counting Unit Cubes
- ✅ g5v-01-02 Layers and Height
- ✅ g5v-02-01 Using V = l × w × h
- ✅ g5v-02-02 Using V = B × h
- ✅ g5v-02-03 Finding a Missing Dimension
- ✅ g5v-03-01 Composite Solids
- ✅ g5v-03-02 Volume Word Problems
- ✅ g5v-03-03 Comparing Two Solids

## Area, Surface Area & Volume (`area-surface-volume`, Grade 6) — 15 lessons
- ✅ asv-01-01 The Triangle's Half
- ✅ asv-01-02 Parallelograms and Trapezoids
- ✅ asv-01-03 Choosing the Right Formula
- ✅ asv-02-01 Decomposing L-Shapes
- ✅ asv-02-02 Composite Figures with Triangles
- ✅ asv-02-03 Multi-Step Composite Problems
- ✅ asv-03-01 Finding Side Lengths from Coordinates
- ✅ asv-03-02 Area of Polygons on the Grid
- ✅ asv-03-03 Coordinate Plane Capstone
- ✅ asv-04-01 Unfolding a Rectangular Prism
- ✅ asv-04-02 Surface Area with Triangular Faces
- ✅ asv-04-03 Surface Area Word Problems
- ✅ asv-05-01 Volume and the Formula
- ✅ asv-05-02 Volume with Fractional Edges
- ✅ asv-05-03 Volume in the Real World

## Data & Distributions (`data-distributions`, Grade 6) — 18 lessons
- ✅ dd-01-01 Questions That Expect Variety
- ✅ dd-01-02 Data as Answers
- ✅ dd-01-03 From Question to Data
- ✅ dd-02-01 Dot Plots
- ✅ dd-02-02 Histograms
- ✅ dd-02-03 The Shape of Data
- ✅ dd-03-01 The Mean as Fair Share
- ✅ dd-03-02 The Median as Middle
- ✅ dd-03-03 Choosing Mean vs Median
- ✅ dd-04-01 Range: How Far Data Stretches
- ✅ dd-04-02 Quartiles & the IQR
- ✅ dd-04-03 Same Center, Different Spread
- ✅ dd-04b-01 Building a Box Plot
- ✅ dd-04b-02 Comparing with Box Plots
- ✅ dd-04b-03 Typical Distance: the MAD
- ✅ dd-05-01 Reading the Whole Picture
- ✅ dd-05-02 Which Numbers Tell It Best
- ✅ dd-05-03 The Data Detective

## Expressions & Equations (`expressions-equations`, Grade 6) — 18 lessons
- ✅ ee-01-01 Exponent Notation
- ✅ ee-01-02 Evaluating Powers
- ✅ ee-01-03 Order of Operations with Exponents
- ✅ ee-02-01 Variables Stand for Numbers
- ✅ ee-02-02 Evaluating Expressions
- ✅ ee-02-03 Writing Expressions from Words
- ✅ ee-02b-01 Naming the Parts
- ✅ ee-02b-02 The Coefficients You Cannot See
- ✅ ee-02b-03 Reading an Expression Aloud
- ✅ ee-03-01 The Distributive Property with Variables
- ✅ ee-03-02 Combining Like Terms
- ✅ ee-03-03 Testing for Equivalence
- ✅ ee-04-01 What an Equation Says
- ✅ ee-04-02 Solving with Addition & Subtraction
- ✅ ee-04-03 Solving with Multiplication & Division
- ✅ ee-05-01 What an Inequality Says
- ✅ ee-05-02 Graphing Inequalities
- ✅ ee-05-03 Dependent and Independent Variables

## The Number System (`number-system`, Grade 6) — 16 lessons
- ✅ ns-01-01 How Many Fit?
- ✅ ns-01-02 Flip and Multiply
- ✅ ns-01-03 Dividing Fractions in Context
- ✅ ns-02-01 Multi-Digit Division
- ✅ ns-02-02 Adding and Subtracting Decimals
- ✅ ns-02-03 Multiplying and Dividing Decimals
- ✅ ns-03-01 Greatest Common Factor
- ✅ ns-03-02 Least Common Multiple
- ✅ ns-03-03 Factoring with the Distributive Property
- ✅ ns-04-01 The Number Line Goes Left
- ✅ ns-04-02 Comparing Negatives
- ✅ ns-04-03 The Four Quadrants
- ✅ ns-04b-01 Signs, and What a Flip Does to Them
- ✅ ns-05-01 Absolute Value
- ✅ ns-05-02 Comparing with Absolute Value
- ✅ ns-05-03 Ordering Rational Numbers

## Ratios & Rates (`ratios-rates`, Grade 6) — 16 lessons
- ✅ rr-01-01 Two Quantities, One Relationship
- ✅ rr-01-02 Part, Part, Whole
- ✅ rr-01-03 Equivalent Ratios
- ✅ rr-02-01 Ratio Tables
- ✅ rr-02-02 Double Number Lines
- ✅ rr-02-03 Choose Your Tool
- ✅ rr-02b-01 Ratio Pairs on the Plane
- ✅ rr-03-01 The Per-One Row
- ✅ rr-03-02 The Better Buy
- ✅ rr-03-03 Rates That Predict
- ✅ rr-04-01 Percent Means Per Hundred
- ✅ rr-04-02 A Percent of a Number
- ✅ rr-04-03 Percents Over and Under
- ✅ rr-05-01 Conversion Is a Ratio
- ✅ rr-05-02 Chaining Conversions
- ✅ rr-05-03 Ratios Capstone

## Grade 7: Geometry (`geometry-g7`, Grade 7) — 21 lessons
- ✅ g7-01-01 Reading a Scale
- ✅ g7-01-02 From Real to Drawing
- ✅ g7-01-03 How Area Scales
- ✅ g7-02-01 Radius, Diameter, and π
- ✅ g7-02-02 Circumference
- ✅ g7-02-03 Area of a Circle
- ✅ g7-03-01 Complementary and Supplementary
- ✅ g7-03-02 Vertical and Adjacent Angles
- ✅ g7-03-03 Solving for Unknown Angles
- ✅ g7-03b-01 Three Sides, One Triangle
- ✅ g7-03b-02 When the Conditions Leave a Choice
- ✅ g7-03b-03 Constructing with Compass and Straightedge
- ✅ sa7-01-01 Unfolding a Prism
- ✅ sa7-01-02 Surface Area of Rectangular Prisms
- ✅ sa7-01-03 Surface Area of Triangular Prisms & Pyramids
- ✅ sa7-02-01 Volume of Right Prisms
- ✅ sa7-02-02 Composite Areas
- ✅ sa7-02-03 Area, Surface Area & Volume in Context
- ✅ g7-04-01 When Sides Make a Triangle
- ✅ g7-04-02 Slicing Solids
- ✅ g7-04-03 Geometry Roundup

## Grade 7: Proportional Relationships (`proportional-relationships`, Grade 7) — 16 lessons
- ✅ pr-01-01 Dividing by a Fraction
- ✅ pr-01-02 Pace, Recipes, and Laps
- ✅ pr-01-03 Finding Any Unit Rate
- ✅ pr-02-01 Testing a Table
- ✅ pr-02-02 Finding the Constant of Proportionality
- ✅ pr-02-03 Tables in Real Situations
- ✅ pr-03-01 Plotting a Proportional Relationship
- ✅ pr-03-02 The Point That Shows the Unit Rate
- ✅ pr-03-03 Reading a Story from a Graph
- ✅ pr-03b-01 Writing the Equation y = kx
- ✅ pr-04-01 Tax and Tip
- ✅ pr-04-02 Markup and Markdown
- ✅ pr-04-03 Percent Increase and Decrease
- ✅ pr-04b-01 Simple Interest
- ✅ pr-04b-02 Commission and Fees
- ✅ pr-04b-03 Percent Error

## Grade 7: Rational Number Operations (`rational-number-operations`, Grade 7) — 12 lessons
- ✅ rno-01-01 Adding Same-Sign Integers
- ✅ rno-01-02 Adding Different-Sign Integers
- ✅ rno-01-03 Adding Any Two Integers
- ✅ rno-02-01 Subtracting Means Adding the Opposite
- ✅ rno-02-02 Distance and Change on the Number Line
- ✅ rno-02-03 Adding and Subtracting Together
- ✅ rno-03-01 Multiplying Integers
- ✅ rno-03-02 Dividing Integers
- ✅ rno-03-03 Multiplying and Dividing Together
- ✅ rno-04-01 Multiplying and Dividing Signed Fractions
- ✅ rno-04-02 Adding and Subtracting Signed Decimals
- ✅ rno-04-03 All Four Operations with Rational Numbers

## Grade 7: Sampling & Probability (`sampling-and-probability`, Grade 7) — 15 lessons
- ✅ sp-01-01 Estimating from a Sample
- ✅ sp-01-02 How Sample Size Affects Confidence
- ✅ sp-01-03 Sampling in Real Situations
- ✅ sp-02-01 Are Two Groups Really Different?
- ✅ sp-02-02 Visual Overlap and What It Means
- ✅ sp-02-03 Comparing Two Populations in Real Situations
- ✅ sp-02b-01 MAD as a Ruler
- ✅ sp-02b-02 How Many MADs Apart?
- ✅ sp-02b-03 Is the Gap Big Enough?
- ✅ sp-03-01 How Likely Is It?
- ✅ sp-03-02 Estimating Probability from Trials
- ✅ sp-03-03 Probability in Real Situations
- ✅ sp-04-01 Counting All the Outcomes
- ✅ sp-04-02 Compound Events
- ✅ sp-04-03 Probability Models in Real Situations

## Grade 7: Two-Step Equations & Inequalities (`two-step-equations`, Grade 7) — 17 lessons
- ✅ tse-01-01 Distributing with Negative Coefficients
- ✅ tse-01-02 Combining Like Terms with Negative Coefficients
- ✅ tse-01-03 Simplifying Any Linear Expression
- ✅ tse-01b-01 Factoring: Distribution Run Backwards
- ✅ tse-01b-02 The Multiplier Inside a Percent Increase
- ✅ tse-01b-03 Choosing the Form That Answers the Question
- ✅ tse-02-01 Undoing Addition, Then Multiplication
- ✅ tse-02-02 Equations with Negative Coefficients
- ✅ tse-02-03 Two-Step Equations in Real Situations
- ✅ tse-02-04 Solving on the Balance
- ✅ tse-02-05 Undo in the Right Order
- ✅ tse-03-01 Distribute First, Then Solve
- ✅ tse-03-02 Parentheses with Negative Multipliers
- ✅ tse-03-03 Mixed Parenthesized Equations
- ✅ tse-04-01 Solving Two-Step Inequalities
- ✅ tse-04-02 The Sign-Flip Rule
- ✅ tse-04-03 Two-Step Inequalities in Real Situations

## Grade 8: Bivariate Statistics (`bivariate-statistics`, Grade 8) — 15 lessons
- ✅ bv-01-01 Plotting Paired Data
- ✅ bv-01-02 Reading Association
- ✅ bv-01-03 Clusters, Outliers, and Form
- ✅ bv-02-01 The Line of Best Fit
- ✅ bv-02-02 Judging a Good Fit
- ✅ bv-02-03 Reading a Line's Equation
- ✅ bv-03-01 Making Predictions
- ✅ bv-03-02 What Slope and Intercept Mean
- ✅ bv-03-03 How Far to Trust a Prediction
- ✅ bv-04-01 Reading Two-Way Tables
- ✅ bv-04-02 Relative Frequency
- ✅ bv-04-03 Association in Categories
- ✅ bv-05-01 The Leftover: Observed − Predicted
- ✅ bv-05-02 Reading the Leftovers
- ✅ bv-05-03 Better Line, Smaller Leftovers

## Grade 8: Exponents, Roots & Scientific Notation (`exponents-scientific-notation`, Grade 8) — 15 lessons
- ✅ esn-01-01 What Powers of Ten Mean
- ✅ esn-01-02 Multiplying and Dividing Powers of Ten
- ✅ esn-01-03 Powers of Ten and Place Value
- ✅ esn-01b-01 Same Base, Add the Exponents
- ✅ esn-01b-02 A Power of a Power
- ✅ esn-01b-03 Zero and Negative Exponents
- ✅ esn-02-01 Evaluating Roots & Solving x² = p
- ✅ esn-02-02 Cube Roots & Solving x³ = p
- ✅ esn-02-03 Roots in Context
- ✅ esn-03-01 Writing Large Numbers in Scientific Notation
- ✅ esn-03-02 Writing Small Numbers in Scientific Notation
- ✅ esn-03-03 Comparing Magnitudes
- ✅ esn-04-01 Multiplying and Dividing in Scientific Notation
- ✅ esn-04-02 Adding and Subtracting in Scientific Notation
- ✅ esn-04-03 Real-World Applications & Precision

## Grade 8: Functions (`functions-g8`, Grade 8) — 12 lessons
- ✅ fg-01-01 What Is a Function
- ✅ fg-01-02 Functions from Tables and Pairs
- ✅ fg-01-03 The Vertical Line Test
- ✅ fg-02-01 Rate of Change
- ✅ fg-02-02 Why a Line's Slope Is Constant
- ✅ fg-02-03 Initial Value and y = mx + b
- ✅ fg-03-01 One Function, Many Forms
- ✅ fg-03-02 Comparing Rates of Change
- ✅ fg-03-03 Comparing Rate and Initial Value
- ✅ fg-04-01 Linear vs. Nonlinear
- ✅ fg-04-02 Reading Graph Shapes
- ✅ fg-04-03 Sketching Graphs from Stories

## Grade 8: Linear Equations & Systems (`linear-equations-systems`, Grade 8) — 12 lessons
- ✅ les-01-01 Keeping the Balance
- ✅ les-01-02 Variables on Both Sides
- ✅ les-01-03 Distribute, Then Solve
- ✅ les-02-01 When There Is No Solution
- ✅ les-02-02 When There Are Infinitely Many
- ✅ les-02-03 Classifying Any Equation
- ✅ les-03-01 What Is a System?
- ✅ les-03-02 Solving by Graphing
- ✅ les-03-03 One, None, or Infinitely Many (Systems)
- ✅ les-04-01 The Substitution Method
- ✅ les-04-02 Back-Substituting for y
- ✅ les-04-03 Systems in the Real World

## Grade 8: The Real Number System (`the-real-number-system`, Grade 8) — 9 lessons
- ✅ rns-01-01 What Makes a Number Rational
- ✅ rns-01-02 Predicting Terminating vs. Repeating Decimals
- ✅ rns-01-03 Converting a Repeating Decimal to a Fraction
- ✅ rns-02-01 A Number With No Exact Fraction
- ✅ rns-02-02 Classifying Rational & Irrational
- ✅ rns-02-03 The Real Number Line Has No Gaps
- ✅ rns-03-01 Estimating Square Roots Between Integers
- ✅ rns-03-02 Locating Irrationals on the Number Line
- ✅ rns-03-03 Comparing & Estimating with Irrationals

## Grade 8: Transformations & Measurement (`transformations-measurement`, Grade 8) — 18 lessons
- ✅ tm-01-01 Sliding with Translations
- ✅ tm-01-02 Flipping with Reflections
- ✅ tm-01-03 Turning with Rotations
- ✅ tm-01b-01 Translations as Coordinate Rules
- ✅ tm-01b-02 Reflections as Coordinate Rules
- ✅ tm-01b-03 Dilations as Coordinate Rules
- ✅ tm-02-01 Congruent Shapes
- ✅ tm-02-02 Dilations
- ✅ tm-02-03 Similar Shapes
- ✅ tm-03-01 Angles and a Transversal
- ✅ tm-03-02 Angles in a Triangle
- ✅ tm-03-03 Angle-Angle Similarity
- ✅ tm-04-01 Why the Theorem Works
- ✅ tm-04-02 Finding Missing Lengths
- ✅ tm-04-03 The Converse and Distance
- ✅ tm-05-01 Volume of a Cylinder
- ✅ tm-05-02 Volume of a Cone
- ✅ tm-05-03 Volume of a Sphere

## Algebra 1: Absolute Value & Piecewise Functions (`absolute-value-piecewise`, Grade 9) — 9 lessons
- ✅ avp-01-01 Absolute Value Is a Distance
- ✅ avp-01-02 The V-Shaped Graph
- ✅ avp-01-03 Shifting and Flipping the V
- ✅ avp-02-01 Two Numbers Share a Distance
- ✅ avp-02-02 No Solution, One, or Two
- ✅ avp-02-03 Absolute Value Inequalities
- ✅ avp-03-01 A Function Defined in Pieces
- ✅ avp-03-02 Graphing Piecewise Functions
- ✅ avp-03-03 Steps, Brackets & Real Rules

## Data & Models (`data-and-models`, Grade 9) — 4 lessons
- ✅ dm-01-01 One Dataset's Shape, Two Datasets Compared
- ✅ dm-02-01 Fitting a Line, and Reading What It Says
- ✅ dm-02-02 How Good Is the Fit? Residuals and Correlation
- ✅ dm-03-01 Precise Enough — But Not More

## Algebra 1: Exponential Functions (`exponential-functions`, Grade 9) — 12 lessons
- ✅ exp-01-01 Evaluating Exponential Functions
- ✅ exp-01-02 Growth vs Decay
- ✅ exp-01-03 The Constant Ratio
- ✅ exp-02-01 Growth Models
- ✅ exp-02-02 Decay Models
- ✅ exp-02-03 Percent Growth & Decay
- ✅ exp-03-01 Solving by Matching Bases
- ✅ exp-03-02 Equations with a Coefficient
- ✅ exp-03-03 Decay & Negative Exponents
- ✅ exp-04-01 Reading Exponential Graphs
- ✅ exp-04-02 Comparing Growth
- ✅ exp-04-03 Exponential vs Linear

## Algebra 1: Exponents & Polynomials (`exponents-polynomials`, Grade 9) — 12 lessons
- ✅ ep-01-01 Product & Quotient Rules
- ✅ ep-01-02 Power of a Power & Products
- ✅ ep-01-03 Zero & Negative Exponents
- ✅ ep-02-01 Degree & Like Terms
- ✅ ep-02-02 Adding Polynomials
- ✅ ep-02-03 Subtracting Polynomials
- ✅ ep-03-01 Multiplying by a Monomial
- ✅ ep-03-02 Multiplying Binomials (FOIL)
- ✅ ep-03-03 Special Products
- ✅ ep-04-01 Factoring with the GCF
- ✅ ep-04-02 Factoring Trinomials
- ✅ ep-04-03 Difference of Squares

## Algebra 1: Functions & Sequences (`functions-and-sequences`, Grade 9) — 12 lessons
- ✅ fn-01-01 Function Notation
- ✅ fn-01-02 Domain, Range & the Function Test
- ✅ fn-01-03 Functions from a Table
- ✅ fn-02-01 Common Difference
- ✅ fn-02-02 The nth Term Formula
- ✅ fn-02-03 Finding Terms & Positions
- ✅ fn-03-01 Common Ratio
- ✅ fn-03-02 The nth Term of a Geometric Sequence
- ✅ fn-03-03 Reading a Geometric Rule
- ✅ fn-04-01 Arithmetic or Geometric?
- ✅ fn-04-02 Choosing the Right Formula
- ✅ fn-04-03 Growth in the Real World

## Algebra 1: Inequalities & Regions (`inequalities-and-regions`, Grade 9) — 9 lessons
- ✅ iar-01-01 A Line Splits the Plane
- ✅ iar-01-02 Testing a Point
- ✅ iar-01-03 Solid or Dashed
- ✅ iar-02-01 Two Fences
- ✅ iar-02-02 Corners of a Region
- ✅ iar-02-03 Is the Point In?
- ✅ iar-03-01 Feasible First
- ✅ iar-03-02 The Corner Principle
- ✅ iar-03-03 A Real Plan

## Algebra 1: Linear Functions (`linear-functions`, Grade 9) — 12 lessons
- ✅ lf-01-01 Slope as Steepness
- ✅ lf-01-02 Slope from Two Points
- ✅ lf-01-03 Positive, Negative, Zero & Undefined
- ✅ lf-02-01 Meet y = mx + b
- ✅ lf-02-02 Graphing from Slope-Intercept
- ✅ lf-02-03 x-intercept vs y-intercept
- ✅ lf-03-01 Point-Slope Form
- ✅ lf-03-02 Point-Slope to Slope-Intercept
- ✅ lf-03-03 Standard Form Ax + By = C
- ✅ lf-04-01 Line from a Point and a Slope
- ✅ lf-04-02 Line Through Two Points
- ✅ lf-04-03 Parallel & Perpendicular Lines

## Algebra 1: Nonlinear Systems (`nonlinear-systems`, Grade 9) — 6 lessons
- ✅ nls-01-01 Where Line Meets Parabola
- ✅ nls-01-02 Substitution Does It
- ✅ nls-01-03 Zero, One, or Two
- ✅ nls-02-01 The Circle as an Equation
- ✅ nls-02-02 A Line Through the Circle
- ✅ nls-02-03 Miss, Touch, Cross

## Algebra 1: Quadratic Functions (`quadratics`, Grade 9) — 12 lessons
- ✅ qu-01-01 The Parent Parabola & Vertex Form
- ✅ qu-01-02 Graphing from Standard Form
- ✅ qu-01-03 Stretch, Flip, and Shift
- ✅ qu-02-01 The Zero-Product Property
- ✅ qu-02-02 Factoring to Solve
- ✅ qu-02-03 Special Products, Roots & the Graph
- ✅ qu-03-01 Solving by Square Roots
- ✅ qu-03-02 The Quadratic Formula
- ✅ qu-03-03 The Discriminant
- ✅ qu-04-01 Projectile Motion
- ✅ qu-04-02 Area Problems
- ✅ qu-04-03 Putting It Together

## Algebra 1: Radicals & Rational Exponents (`radicals-and-exponents`, Grade 9) — 12 lessons
- ✅ rad-01-01 Perfect Squares & Square Roots
- ✅ rad-01-02 Simplifying with Factors
- ✅ rad-01-03 Fully Simplified Form
- ✅ rad-02-01 Adding & Subtracting Like Radicals
- ✅ rad-02-02 Multiplying Radicals
- ✅ rad-02-03 Distributing Radicals
- ✅ rad-03-01 Roots as Exponents
- ✅ rad-03-02 The Power/Root Combo
- ✅ rad-03-03 Negative Rational Exponents
- ✅ rad-04-01 The Pythagorean Theorem
- ✅ rad-04-02 When the Answer is a Radical
- ✅ rad-04-03 Distance Between Points

## Algebra 1: Solving Linear Equations (`solving-equations`, Grade 9) — 12 lessons
- ✅ alg1-01-01 Two-Step Equations
- ✅ alg1-01-02 Variables on Both Sides
- ✅ alg1-01-03 Distribute, Then Solve
- ✅ alg1-02-01 Equations with One Fraction
- ✅ alg1-02-02 Clear with the LCD
- ✅ alg1-02-03 Decimal Equations
- ✅ alg1-03-01 Solving for a Variable
- ✅ alg1-03-02 Rearranging with Fractions
- ✅ alg1-03-03 Multi-Step Literal Equations
- ✅ alg1-04-01 Solving Inequalities
- ✅ alg1-04-02 The Flip Rule
- ✅ alg1-04-03 Inequalities on Both Sides

## Algebra 1: Systems of Linear Equations (`systems-equations`, Grade 9) — 12 lessons
- ✅ se-01-01 Systems and Their Solutions
- ✅ se-01-02 Solving by Graphing
- ✅ se-01-03 One, None, or Infinitely Many
- ✅ se-02-01 Substitution When y Is Alone
- ✅ se-02-02 Isolate First, Then Substitute
- ✅ se-02-03 Substitution in Action
- ✅ se-03-01 Add or Subtract to Eliminate
- ✅ se-03-02 Scale One Equation First
- ✅ se-03-03 Scale Both, and Special Cases
- ✅ se-04-01 Totals and Differences
- ✅ se-04-02 Counts and Values
- ✅ se-04-03 Choose a Method, Then Interpret

## Geometry: Circle Theorems (`circle-theorems`, Grade 10) — 16 lessons
- ✅ cr-01-01 Central Angles & Arcs
- ✅ cr-01-02 Inscribed Angles
- ✅ cr-01-03 Thales' Theorem
- ✅ cr-02-01 Chords & Their Arcs
- ✅ cr-02-02 The Perpendicular from the Center
- ✅ cr-02-03 Chords & Distance
- ✅ cr-03-01 Tangent Meets Radius
- ✅ cr-03-02 The Two-Tangent Theorem
- ✅ cr-03-03 Circumscribed Figures
- ✅ cr-04-01 Angles Inside & Outside
- ✅ cr-04-02 The Tangent-Chord Angle
- ✅ cr-04-03 Power of a Point
- ✅ cr-05-01 Arc Length
- ✅ cr-05-02 Sector Area
- ✅ cr-05-03 Cyclic Quadrilaterals
- ✅ cr-06-01 Why All Circles Are Similar

## Conditional Probability & the Rules of Chance (`conditional-probability`, Grade 10) — 16 lessons
- ✅ cpr-01-01 Events as Sets of Outcomes
- ✅ cpr-01-02 Complements and "At Least One"
- ✅ cpr-01-03 Mutually Exclusive vs Overlapping
- ✅ cpr-02-01 The Addition Rule
- ✅ cpr-02-02 Two-Way Tables: Joint and Marginal
- ✅ cpr-02-03 Or, And, Neither — on a Table
- ✅ cpr-03-01 Restricting the Sample Space
- ✅ cpr-03-02 Which Way Round? P(A|B) vs P(B|A)
- ✅ cpr-03-03 The Multiplication Rule
- ✅ cpr-03-04 Trees and Drawing Without Replacement
- ✅ cpr-04-01 What Independence Means
- ✅ cpr-04-02 The Product Test
- ✅ cpr-04-03 Independent vs Mutually Exclusive
- ✅ cpr-05-01 Permutations: When Order Matters
- ✅ cpr-05-02 Combinations: When Order Doesn't Matter
- ✅ cpr-05-03 Probability by Counting

## Geometry: Constructions & Proof (`constructions-and-proof`, Grade 10) — 15 lessons
- ✅ cp-01-01 The Compass & Straightedge
- ✅ cp-01-02 Constructing a Perpendicular Bisector
- ✅ cp-01-03 Constructing an Angle Bisector
- ✅ cp-02-01 A Perpendicular at a Point
- ✅ cp-02-02 A Perpendicular from a Point
- ✅ cp-02-03 A Parallel through a Point
- ✅ cp-03-01 Inscribing a Hexagon
- ✅ cp-03-02 The Square & the Triangle
- ✅ cp-03-03 Why Constructions Work
- ✅ cp-04-01 Conjecture vs Proof
- ✅ cp-04-02 The Two-Column Proof
- ✅ cp-04-03 Proving Vertical Angles Equal
- ✅ cp-05-01 The Transversal Angle Family
- ✅ cp-05-02 Proving the Transversal Theorems
- ✅ cp-05-03 The Converses

## Geometry: Coordinate Proofs (`coordinate-proofs`, Grade 10) — 15 lessons
- ✅ cx-01-01 The Distance Formula
- ✅ cx-01-02 The Midpoint Formula
- ✅ cx-01-03 Distances at Work
- ✅ cx-02-01 Partitioning a Segment
- ✅ cx-02-02 Parallel, Proved
- ✅ cx-02-03 Perpendicular, Proved
- ✅ cx-03-01 Classifying Triangles
- ✅ cx-03-02 Classifying Quadrilaterals
- ✅ cx-03-03 Proofs for Every Figure
- ✅ cx-04-01 Perimeter on the Plane
- ✅ cx-04-02 Area by the Box Method
- ✅ cx-04-03 The Shoelace Formula
- ✅ cx-05-01 The Circle's Equation
- ✅ cx-05-02 On, Inside, Outside
- ✅ cx-05-03 Circles in Disguise

## Geometry: Foundations & Rigid Motions (`geometry-foundations`, Grade 10) — 15 lessons
- ✅ gf-01-01 The Words We Don't Define
- ✅ gf-01-02 Building Definitions
- ✅ gf-01-03 Symbols That Say Different Things
- ✅ gf-02-01 Segment Addition & Midpoints
- ✅ gf-02-02 Angle Addition & Bisectors
- ✅ gf-02-03 Algebra Meets Geometry
- ✅ gf-03-01 Translations as Functions
- ✅ gf-03-02 Reflections as Functions
- ✅ gf-03-03 Rotations as Functions
- ✅ gf-04-01 Composing Rigid Motions
- ✅ gf-04-02 Line Symmetry
- ✅ gf-04-03 Rotational Symmetry
- ✅ gf-05-01 Congruence, Defined
- ✅ gf-05-02 Find the Motion
- ✅ gf-05-03 Corresponding Parts

## Polygons & Quadrilaterals (`polygons-quadrilaterals`, Grade 10) — 15 lessons
- ✅ pq-01-01 The Interior Angle Sum
- ✅ pq-01-02 Exterior Angles: One Full Lap
- ✅ pq-01-03 Regular Polygons
- ✅ pq-02-01 Opposite Sides
- ✅ pq-02-02 Opposite & Consecutive Angles
- ✅ pq-02-03 The Diagonals Bisect Each Other
- ✅ pq-03-01 Rectangles
- ✅ pq-03-02 Rhombi
- ✅ pq-03-03 Squares
- ✅ pq-04-01 Trapezoids
- ✅ pq-04-02 The Trapezoid Midsegment
- ✅ pq-04-03 Kites
- ✅ pq-05-01 Proving a Parallelogram
- ✅ pq-05-02 Always, Sometimes, Never
- ✅ pq-05-03 The Quadrilateral Capstone

## Right Triangles & Trigonometry (`right-triangles-trig`, Grade 10) — 15 lessons
- ✅ rt-01-01 The Pythagorean Theorem
- ✅ rt-01-02 The Converse & Classifying Triangles
- ✅ rt-01-03 45-45-90 Triangles
- ✅ rt-01-04 30-60-90 Triangles
- ✅ rt-02-01 Sine, Cosine & Tangent
- ✅ rt-03-01 Finding a Side
- ✅ rt-03-02 Finding an Angle
- ✅ rt-03-03 Solving Right Triangles Completely
- ✅ rt-04-01 Angles of Elevation & Depression
- ✅ rt-04-02 Height Problems
- ✅ rt-04-03 Shadows, Wires & Surveys
- ✅ rt-05-01 How the Ratios Relate
- ✅ rt-05-02 The Law of Sines
- ✅ rt-05-03 The Law of Cosines
- ✅ rt-05-04 Choosing the Tool & Trig Area

## Similarity (`similarity`, Grade 10) — 16 lessons
- ✅ sy-01-01 Dilations & Scale Factor
- ✅ sy-01-02 What Similarity Means
- ✅ sy-01-03 The AA Criterion
- ✅ sy-02-01 The SAS Similarity Criterion
- ✅ sy-02-02 The SSS Similarity Criterion
- ✅ sy-02-03 Choosing a Criterion
- ✅ sy-03-01 The Side-Splitter Theorem
- ✅ sy-03-02 The Converse & Parallel Lines
- ✅ sy-03-03 Proportions in Figures
- ✅ sy-04-01 Three Similar Triangles
- ✅ sy-04-02 The Geometric Mean
- ✅ sy-04-03 Solving Right Triangles
- ✅ sy-05-01 Indirect Measurement
- ✅ sy-05-02 Scale Drawings & Models
- ✅ sy-05-03 Area & Perimeter Ratios
- ✅ sy-06-01 Dilations and Parallel Lines

## Geometry: Solid Geometry & Modeling (`solid-geometry`, Grade 10) — 15 lessons
- ✅ sg-01-01 Cross-Sections, Formalized
- ✅ sg-01-02 Solids of Revolution
- ✅ sg-01-03 Reasoning from Sections
- ✅ sg-02-01 Cavalieri's Principle
- ✅ sg-02-02 Cavalieri at Work
- ✅ sg-02-03 What Cavalieri Doesn't Say
- ✅ sg-03-01 Prism to Cylinder
- ✅ sg-03-02 The One-Third Story
- ✅ sg-03-03 The Sphere Surrenders
- ✅ sg-04-01 Adding Solids
- ✅ sg-04-02 Subtracting Solids
- ✅ sg-04-03 Surfaces of Composites
- ✅ sg-05-01 k, k-Squared, k-Cubed
- ✅ sg-05-02 Density & Design
- ✅ sg-05-03 Modeling with Solids

## Triangle Congruence & Centers (`triangle-congruence`, Grade 10) — 15 lessons
- ✅ tc-01-01 Shortcuts to Congruence
- ✅ tc-01-02 The One That Fails
- ✅ tc-01-03 Criteria & CPCTC
- ✅ tc-02-01 The Hypotenuse-Leg Criterion
- ✅ tc-02-02 Proof Practice with CPCTC
- ✅ tc-02-03 Overlapping Triangles
- ✅ tc-03-01 The Isosceles Base Angles Theorem
- ✅ tc-03-02 The Converse & Equilateral Triangles
- ✅ tc-03-03 The Midsegment Theorem
- ✅ tc-04-01 Circumcenter & Incenter
- ✅ tc-04-02 Centroid & Orthocenter
- ✅ tc-04-03 Choosing the Right Center
- ✅ tc-05-01 The Triangle Inequality
- ✅ tc-05-02 The Hinge Theorem
- ✅ tc-05-03 Inequalities in Proofs

## Algebra 2: Complex Numbers & Quadratics (`complex-numbers`, Grade 11) — 15 lessons
- ✅ cn-01-01 Building a Perfect Square
- ✅ cn-01-02 Completing the Square to Solve
- ✅ cn-01-03 Vertex Form by Completing the Square
- ✅ cn-02-01 Meet i
- ✅ cn-02-02 Powers of i
- ✅ cn-02-03 Complex Numbers & the Plane
- ✅ cn-03-01 Adding & Subtracting
- ✅ cn-03-02 Multiplying Complex Numbers
- ✅ cn-03-03 Conjugates & Division
- ✅ cn-04-01 Square Roots of Negatives in Equations
- ✅ cn-04-02 The Formula Goes Complex
- ✅ cn-04-03 The Full Discriminant Story
- ✅ cn-05-01 Sum & Product with Complex Roots
- ✅ cn-05-02 Building Quadratics from Roots
- ✅ cn-05-03 Choosing the Best Method

## Probability Distributions & Expected Value (`expected-value`, Grade 11) — 6 lessons
- ✅ ev-01-01 A Number Attached to Chance
- ✅ ev-01-02 The Probability Distribution
- ✅ ev-01-03 The Long-Run Average
- ✅ ev-02-01 Computing Payoffs
- ✅ ev-02-02 Is the Game Fair?
- ✅ ev-02-03 Deciding by Expectation

## Algebra 2: Functions & Transformations (`function-transformations`, Grade 11) — 16 lessons
- ✅ ft-01-01 Meet the Parent Functions
- ✅ ft-01-02 Domain: the Allowed Inputs
- ✅ ft-01-03 Range: the Possible Outputs
- ✅ ft-02-01 Vertical Shifts
- ✅ ft-02-02 Horizontal Shifts
- ✅ ft-02-03 Combining Shifts
- ✅ ft-03-01 Reflections
- ✅ ft-03-02 Stretches & Compressions
- ✅ ft-03-03 Reading the Full Rule
- ✅ ft-04-01 Adding & Subtracting Functions
- ✅ ft-04-02 Composition: Feeding One into Another
- ✅ ft-04-03 Composition Formulas
- ✅ ft-05-01 Undoing a Function
- ✅ ft-05-02 Finding an Inverse Rule
- ✅ ft-05-03 Graphs & Verification
- ✅ ft-05-04 Building the Undo Machine

## Algebra 2: Exponentials & Logarithms (`logarithms`, Grade 11) — 15 lessons
- ✅ lg-01-01 The Exponent-Finder
- ✅ lg-01-02 Evaluating Logarithms
- ✅ lg-01-03 The Logarithmic Graph
- ✅ lg-02-01 The Product Property
- ✅ lg-02-02 Quotient & Power Properties
- ✅ lg-02-03 Expand & Condense Fluency
- ✅ lg-03-01 Change of Base
- ✅ lg-03-02 Solving Exponential Equations
- ✅ lg-03-03 Solving Log Equations
- ✅ lg-04-01 The Number e
- ✅ lg-04-02 The Natural Log
- ✅ lg-04-03 Solving with e and ln
- ✅ lg-05-01 Continuous Growth: A = Pe^(rt)
- ✅ lg-05-02 Half-Life
- ✅ lg-05-03 Logarithmic Scales

## Algebra 2: Polynomial Functions (`polynomial-functions`, Grade 11) — 15 lessons
- ✅ pf-01-01 Polynomial Functions & Their Shape
- ✅ pf-01-02 End Behavior
- ✅ pf-01-03 Leading-Term Domination
- ✅ pf-02-01 Zeros from Factored Form
- ✅ pf-02-02 Multiplicity: Bounce or Cross
- ✅ pf-02-03 The Factor & Remainder Theorems
- ✅ pf-03-01 Polynomial Long Division
- ✅ pf-03-02 Synthetic Division
- ✅ pf-03-03 Division Meets the Theorems
- ✅ pf-04-01 GCF & Quadratic Form
- ✅ pf-04-02 Factoring by Grouping
- ✅ pf-04-03 Sum & Difference of Cubes
- ✅ pf-05-01 Sketching from Factored Form
- ✅ pf-05-02 Turning Points & Degree
- ✅ pf-05-03 Building & Using Polynomial Models

## Algebra 2: Radical Functions & Equations (`radical-functions`, Grade 11) — 15 lessons
- ✅ re-01-01 Between Radicals & Exponents
- ✅ re-01-02 Exponent Rules Go Rational
- ✅ re-01-03 Simplifying Variable Radicals
- ✅ re-02-01 Rationalizing Denominators
- ✅ re-02-02 Binomial Radical Products
- ✅ re-02-03 Conjugates & Binomial Denominators
- ✅ re-03-01 The Square-Root Function
- ✅ re-03-02 Domains of Radical Functions
- ✅ re-03-03 Transforming Radical Graphs
- ✅ re-04-01 Square Both Sides
- ✅ re-04-02 Extraneous Solutions
- ✅ re-04-03 Radical = Radical & Beyond
- ✅ re-05-01 Solving with Reciprocal Powers
- ✅ re-05-02 The Even-Numerator ±
- ✅ re-05-03 Radical Models

## Algebra 2: Rational Functions (`rational-functions`, Grade 11) — 15 lessons
- ✅ rf-01-01 Rational Expressions & Excluded Values
- ✅ rf-01-02 Simplify by Factoring
- ✅ rf-01-03 Opposite Factors: the −1 Trick
- ✅ rf-02-01 Multiplying Rational Expressions
- ✅ rf-02-02 Dividing Rational Expressions
- ✅ rf-02-03 Mixed Operations & Restriction Tracking
- ✅ rf-03-01 Like Denominators
- ✅ rf-03-02 Building the Polynomial LCD
- ✅ rf-03-03 Adding & Subtracting, Unlike Denominators
- ✅ rf-04-01 The Reciprocal Function
- ✅ rf-04-02 Holes vs Vertical Asymptotes
- ✅ rf-04-03 Horizontal Asymptotes
- ✅ rf-05-01 Solving by Clearing the LCD
- ✅ rf-05-02 Proportions & Work Rates
- ✅ rf-05-03 Inverse & Joint Variation

## Algebra 2: Sequences & Series (`sequences-series`, Grade 11) — 15 lessons
- ✅ sr-01-01 Two Ways to Give a Rule
- ✅ sr-01-02 Working the Chain
- ✅ sr-01-03 Converting Between Forms
- ✅ sr-02-01 Meet the Sigma
- ✅ sr-02-02 Evaluating Sigma Sums
- ✅ sr-02-03 Writing Sums in Sigma Form
- ✅ sr-03-01 Gauss's Shortcut
- ✅ sr-03-02 The Two Sum Formulas
- ✅ sr-03-03 Arithmetic Series at Work
- ✅ sr-04-01 Why Adding Powers Needs a New Trick
- ✅ sr-04-02 The Geometric Sum Formula
- ✅ sr-04-03 Geometric Series at Work
- ✅ sr-05-01 When Adding Forever Settles Down
- ✅ sr-05-02 The Infinite Sum Formula
- ✅ sr-05-03 Forever Sums in the Wild

## Statistical Inference (`statistical-inference`, Grade 11) — 18 lessons
- ✅ si-01-01 How the Data Was Made
- ✅ si-01-02 Bias, and Why a Bigger Sample Cannot Save You
- ✅ si-01-03 Designing an Experiment That Can Answer
- ✅ si-02-01 The Statistic Wobbles
- ✅ si-02-02 The Sampling Distribution
- ✅ si-02-03 Putting a Number on the Wobble
- ✅ si-03-01 The Margin of Error
- ✅ si-03-02 What "95% Confident" Actually Counts
- ✅ si-03-03 Reading a Poll Without Being Fooled
- ✅ si-06-01 The Bell That Wobble Builds
- ✅ si-06-02 68, 95, 99.7
- ✅ si-06-03 z: Distance Measured in Wobbles
- ✅ si-04-01 What Chance Alone Produces
- ✅ si-04-02 How Unusual Is Unusual?
- ✅ si-04-03 What "Significant" Does Not Say
- ✅ si-05-01 Reading a Study's Design
- ✅ si-05-02 When the Number Is Right and the Claim Is Wrong
- ✅ si-05-03 The Statistics Detective

## Algebra 2: Trigonometric Functions (`trig-functions`, Grade 11) — 15 lessons
- ✅ tf-01-01 Three Ratios in a Right Triangle
- ✅ tf-01-02 Solving for Sides
- ✅ tf-01-03 Finding the Angle
- ✅ tf-02-01 The Radian
- ✅ tf-02-02 Degrees ↔ Radians, Fluently
- ✅ tf-02-03 Arc Length
- ✅ tf-03-01 Coordinates on the Unit Circle
- ✅ tf-03-02 Reference Angles
- ✅ tf-03-03 Exact Values
- ✅ tf-04-01 The Wave from the Circle
- ✅ tf-04-02 Amplitude & Midline
- ✅ tf-04-03 Period & Writing Rules
- ✅ tf-05-01 The Ferris Wheel
- ✅ tf-05-02 Fitting Waves to the World
- ✅ tf-05-03 The Pythagorean Identity

## Precalculus: The Binomial Theorem (`binomial-theorem`, Grade 12) — 6 lessons
- ✅ bt-01-01 Powers of a Sum
- ✅ bt-01-02 Pascal's Triangle
- ✅ bt-01-03 Why Combinations Appear
- ✅ bt-02-01 The Binomial Theorem
- ✅ bt-02-02 Finding a Single Term
- ✅ bt-02-03 Binomials Meet Probability

## Precalculus: Conic Sections (`conic-sections`, Grade 12) — 15 lessons
- ✅ co-01-01 The Parabola: Focus and Directrix
- ✅ co-01-02 Shifted Parabolas & Orientation
- ✅ co-01-03 The Reflective Property
- ✅ co-02-01 The Ellipse: Two Foci and a String
- ✅ co-02-02 Foci, Axes & the a-b-c Relationship
- ✅ co-02-03 Shifted Ellipses & How Round They Are
- ✅ co-03-01 The Hyperbola: A Difference of Distances
- ✅ co-03-02 Asymptotes & the Guiding Box
- ✅ co-03-03 Foci, Orientation & Eccentricity
- ✅ co-04-01 Reading the Second-Degree Form
- ✅ co-04-02 Completing the Square to Standard Form
- ✅ co-04-03 Hyperbolas & Parabolas from General Form
- ✅ co-05-01 Eccentricity Unifies the Conics
- ✅ co-05-02 The Focus-Directrix View
- ✅ co-05-03 Conics in the Sky

## Precalculus: Function Analysis (`function-analysis`, Grade 12) — 16 lessons
- ✅ fna-01-01 Average Rate of Change
- ✅ fna-01-02 Secant Lines: Seeing the Rate
- ✅ fna-01-03 Interpreting Rates: Units & Meaning
- ✅ fna-02-01 Where a Function Rises and Falls
- ✅ fna-02-02 Peaks & Valleys: Extrema
- ✅ fna-02-03 Reading a Whole Graph
- ✅ fna-03-01 Even & Odd: The Symmetry Test
- ✅ fna-03-02 Piecewise Functions
- ✅ fna-03-03 Absolute Value & Step Functions
- ✅ fna-04-01 Composition: Order Matters
- ✅ fna-04-02 The Domain of a Composition
- ✅ fna-04-03 Decomposing & Modeling with Composition
- ✅ fna-05-01 One-to-One & the Horizontal Line Test
- ✅ fna-05-02 Restricting the Domain
- ✅ fna-05-03 Verifying Inverses: the Composition Identity
- ✅ fna-06-01 Comparing Functions Across Representations

## Precalculus: Limits & the Doorway to Calculus (`limits-continuity`, Grade 12) — 15 lessons
- ✅ lc-01-01 The Idea of a Limit: Approaching a Value
- ✅ lc-01-02 Reading Limits from Tables & Graphs
- ✅ lc-01-03 When a Limit Fails to Exist
- ✅ lc-02-01 Direct Substitution & the Limit Laws
- ✅ lc-02-02 The 0/0 Form: Factor and Cancel
- ✅ lc-02-03 Rationalizing to Resolve Limits
- ✅ lc-03-01 One-Sided Limits
- ✅ lc-03-02 Limits at Infinity & Horizontal Asymptotes
- ✅ lc-03-03 End Behavior: The Full Picture
- ✅ lc-04-01 Continuity at a Point
- ✅ lc-04-02 Classifying Discontinuities
- ✅ lc-04-03 The Intermediate Value Theorem
- ✅ lc-05-01 Average Rate of Change
- ✅ lc-05-02 The Derivative as a Limit
- ✅ lc-05-03 Limits Everywhere: Series & the Road Ahead

## Precalculus: Polar Coordinates & Parametric Curves (`polar-parametric`, Grade 12) — 15 lessons
- ✅ pp-01-01 A New Address System
- ✅ pp-01-02 Polar → Rectangular: Drop the Triangle
- ✅ pp-01-03 Rectangular → Polar: Watch the Quadrant
- ✅ pp-02-01 The Simplest Polar Graphs
- ✅ pp-02-02 Rose Curves & the Petal Rule
- ✅ pp-02-03 Limaçons & Cardioids
- ✅ pp-03-01 Complex Numbers in Polar Form
- ✅ pp-03-02 Multiply by Rotating: De Moivre
- ✅ pp-03-03 nth Roots: Points on a Circle
- ✅ pp-04-01 Parametric Equations: Curves Over Time
- ✅ pp-04-02 Eliminating the Parameter
- ✅ pp-04-03 Writing Parametrizations & Orientation
- ✅ pp-05-01 Projectile Motion: Two Independent Clocks
- ✅ pp-05-02 Peak, Flight Time, and Range
- ✅ pp-05-03 The Parabolic Path: Eliminating Time

## Precalculus: Polynomial & Rational Analysis (`polynomial-rational-analysis`, Grade 12) — 15 lessons
- ✅ pra-01-01 The Rational Root Theorem: the Candidate List
- ✅ pra-01-02 Putting Candidates on Trial
- ✅ pra-01-03 The Full Pipeline: List, Test, Divide, Finish
- ✅ pra-02-01 The Fundamental Theorem: How Many Zeros Must Exist
- ✅ pra-02-02 Mirror Pairs: the Conjugate Zero Theorem
- ✅ pra-02-03 Building Polynomials from Mixed Zeros
- ✅ pra-03-01 When the Asymptote Tilts
- ✅ pra-03-02 Finding the Slant by Division
- ✅ pra-03-03 The Full Asymptote Portrait
- ✅ pra-04-01 The Sign Chart
- ✅ pra-04-02 The Multiplicity Shortcut
- ✅ pra-04-03 Polynomial Inequalities from Scratch
- ✅ pra-05-01 Rational Sign Charts: Two Kinds of Critical Points
- ✅ pra-05-02 The Boundary Rule: Zeros Close, Excluded Values Never
- ✅ pra-05-03 Rearranging: One Fraction, Then Chart

## Precalculus: Trig Graphs & Inverse Trig (`trig-graphs-inverses`, Grade 12) — 15 lessons
- ✅ tg-01-01 Phase Shift: Sliding the Wave
- ✅ tg-01-02 The Full Sinusoid: Four Dials
- ✅ tg-01-03 Graphing One Clean Period
- ✅ tg-02-01 Cosine's Graph: Starting at the Top
- ✅ tg-02-02 One Wave, Two Names
- ✅ tg-02-03 Reflections & Equivalent Rules
- ✅ tg-03-01 Tangent: the Wave That Isn't
- ✅ tg-03-02 Exact Values & Life Near a Wall
- ✅ tg-03-03 Transforming Tangent
- ✅ tg-04-01 Arcsine: a Rescued Inverse
- ✅ tg-04-02 Arccosine: a Different Branch Entirely
- ✅ tg-04-03 The Inverse Graphs & the y = x Mirror
- ✅ tg-05-01 Round Trips & the arcsin(sin x) Trap
- ✅ tg-05-02 Mixed Compositions & the Helper Triangle
- ✅ tg-05-03 Solving: One Answer from the Inverse, All Answers from the Circle

## Precalculus: Trig Identities & Equations (`trig-identities-equations`, Grade 12) — 15 lessons
- ✅ ti-01-01 General Solutions: the +2πk Move
- ✅ ti-01-02 Tangent's Ladder & Merging Families
- ✅ ti-01-03 Ladders for Transformed Angles
- ✅ ti-02-01 Six Functions from Two
- ✅ ti-02-02 The Pythagorean Family
- ✅ ti-02-03 Proving Identities: Working One Side
- ✅ ti-03-01 Sum & Difference: New Angles from Old
- ✅ ti-03-02 Tangent Sums & Cofunctions
- ✅ ti-03-03 Applying Sum & Difference: Simplify and Prove
- ✅ ti-04-01 Double-Angle: One Angle, Twice
- ✅ ti-04-02 The Three Faces of cos 2θ
- ✅ ti-04-03 Double-Angle in Action
- ✅ ti-05-01 Quadratics in Disguise
- ✅ ti-05-02 Mixed Functions: Convert First
- ✅ ti-05-03 Traps: Extraneous & Lost Roots

## Precalculus: Vectors & Matrices (`vectors-matrices`, Grade 12) — 15 lessons
- ✅ vec-01-01 Vectors: Size and Direction Together
- ✅ vec-01-02 Direction Angles & Building Components
- ✅ vec-01-03 Displacement: Vectors Between Points
- ✅ vec-02-01 Adding Vectors: Tip to Tail
- ✅ vec-02-02 Scalar Multiplication: Stretch and Flip
- ✅ vec-02-03 Unit Vectors & Combining Motions
- ✅ vec-03-01 The Dot Product: Vectors to a Number
- ✅ vec-03-02 The Angle Between Two Vectors
- ✅ vec-03-03 Work: The Dot Product at Play
- ✅ vec-04-01 Matrices & the Matrix-Vector Product
- ✅ vec-04-02 Determinant & Inverse
- ✅ vec-04-03 Solving Systems with Matrices
- ✅ vec-05-01 Matrices as Transformations
- ✅ vec-05-02 Rotation Matrices
- ✅ vec-05-03 Composing Transformations

## Calculus: Curve Analysis (`curve-analysis`, Grade 13) — 15 lessons
- ✅ ca-01-01 Finding the Suspects
- ✅ ca-01-02 The First-Derivative Test
- ✅ ca-01-03 Endpoints and the Extreme Value Theorem
- ✅ ca-02-01 Concavity and the Second Derivative
- ✅ ca-02-02 The Second-Derivative Test
- ✅ ca-02-03 Putting the Three Charts Together
- ✅ ca-03-01 Rolle's Theorem
- ✅ ca-03-02 The Mean Value Theorem
- ✅ ca-03-03 What the MVT Buys
- ✅ ca-04-01 End Behaviour and Asymptotes
- ✅ ca-04-02 The Full Sketch
- ✅ ca-04-03 Reading f From a Graph of f′
- ✅ ca-05-01 Setting Up an Optimisation
- ✅ ca-05-02 The Open-Top Box
- ✅ ca-05-03 Applied Optimisation

## Calculus: The Derivative (`derivative-rules`, Grade 13) — 15 lessons
- ✅ dr-01-01 From One Slope to Every Slope
- ✅ dr-01-02 Reading f′ Off the Shape of f
- ✅ dr-01-03 Where the Derivative Fails
- ✅ dr-02-01 The Power Rule
- ✅ dr-02-02 Constants, Sums and Multiples
- ✅ dr-02-03 The Second Derivative
- ✅ dr-03-01 The Product Rule
- ✅ dr-03-02 The Quotient Rule
- ✅ dr-03-03 Choosing and Combining the Rules
- ✅ dr-04-01 The Chain Rule
- ✅ dr-04-02 Chains Within Chains
- ✅ dr-04-03 Implicit Differentiation in Practice
- ✅ dr-05-01 e^x and ln x
- ✅ dr-05-02 The Trig Derivatives
- ✅ dr-05-03 Inverses and the Reciprocal Slope

## Calculus: Derivatives in Context (`derivatives-in-context`, Grade 13) — 11 lessons
- ✅ dc-01-01 Position, Velocity, Acceleration
- ✅ dc-01-02 Speeding Up or Slowing Down
- ✅ dc-01-03 Distance Travelled vs Displacement
- ✅ dc-02-01 Related Rates: the Chain Rule With Time Hidden
- ✅ dc-02-02 The Sliding Ladder
- ✅ dc-02-03 Choosing the Relation
- ✅ dc-03-01 The Tangent as an Approximation
- ✅ dc-03-02 Differentials and Error
- ✅ dc-03-03 When Linearisation Fails
- ✅ dc-04-01 L'Hôpital: 0/0 Explained at Last
- ✅ dc-04-02 The Other Indeterminate Forms

## Calculus: Differential Equations (`differential-equations`, Grade 13) — 6 lessons
- ✅ de-01-01 Instructions a Curve Obeys
- ✅ de-01-02 The Curve That Never Moves
- ✅ de-02-01 Separating the Variables
- ✅ de-03-01 Why Growth Is Exponential
- ✅ de-03-02 When the Rate Runs Out of Room
- ✅ de-04-01 Euler's Method: Walking the Field

## Calculus: Integration & the Fundamental Theorem (`integration-accumulation`, Grade 13) — 15 lessons
- ✅ in-01-01 Estimating with Rectangles
- ✅ in-01-02 Trapping the Area
- ✅ in-01-03 The Definite Integral
- ✅ in-02-01 The Accumulation Function
- ✅ in-02-02 Reading A Off f
- ✅ in-02-03 The Integral of a Rate Is a Total
- ✅ in-03-01 FTC Part 1: The Slope of the Area
- ✅ in-03-02 FTC Part 2: Evaluating With an Antiderivative
- ✅ in-03-03 Why the Two Halves Are One Theorem
- ✅ in-04-01 Reversing the Power Rule
- ✅ in-04-02 Pinning Down the Constant
- ✅ in-04-03 The Antiderivative Library
- ✅ in-05-01 Undoing the Chain Rule
- ✅ in-05-02 Changing the Limits
- ✅ in-05-03 Choosing u

## Calculus: Applications of the Integral (`integration-applications`, Grade 13) — 6 lessons
- ✅ ia-01-01 Area Between Two Curves
- ✅ ia-01-02 Spinning a Strip Into a Disc
- ✅ ia-01-03 The Washer: a Disc With a Bite Out of It
- ✅ ia-02-01 Known Cross-Sections
- ✅ ia-03-01 The Average Value of a Function
- ✅ ia-04-01 Motion Revisited: ∫v and ∫|v|

## Calculus BC: Parametric & Polar (`parametric-polar-calculus`, Grade 13) — 4 lessons
- ✅ pc-01-01 Differentiating a Parametric Curve
- ✅ pc-01-02 Arc Length: a Sum of Tiny Hypotenuses
- ✅ pc-02-01 Polar Area: the Slices Are Triangles
- ✅ pc-03-01 Motion as a Vector

## Calculus BC: Series & Convergence (`series-convergence`, Grade 13) — 6 lessons
- ✅ sc-01-01 Beyond Geometric
- ✅ sc-01-02 Comparison and the p-Series
- ✅ sc-01-03 Alternating Series and the Error Bound
- ✅ sc-02-01 Building a Function Out of Powers
- ✅ sc-02-02 Where the Polynomial Gives Up
- ✅ sc-03-01 New Series for Nothing

<!-- REGISTRY:AUTO-END -->

## Course G1 — Adding Within 100 (`add-within-100-g1`, gradeLevel 1, 1.NBT.C.4/5/6) — S190, eighth K5-expansion course and the FIRST built under Protocol v2: every graded widget reuses the PRE-EXISTING `g1-add-subtract`/`g1-tens-ones` generators (shipped before session 151) — zero new Variants.ts/Independent.cjs/tag-route/resolver work ✅ SHIPPED (3 ch / 14 lessons, wired)

  - ✅ g1a-01-01 Adding a One-Digit Number (`g1a-add-ones`)
  - ✅ g1a-01-02 When the Ones Fill a Ten (`g1a-ones-make-ten`)
  - ✅ g1a-01-03 Adding a Multiple of Ten (`g1a-add-tens`)
  - ✅ g1a-01-04 Tens Plus Tens (`g1a-tens-tens`)
  - ✅ g1a-02-01 Ten More, Ten Less in Your Head (`g1a-mental-ten`)
  - ✅ g1a-02-02 Using the Hundred Chart to Add (`g1a-chart-add`)
  - ✅ g1a-02-03 Adding on a Number Line (`g1a-line-add`)
  - ✅ g1a-02-04 Breaking a Number to Add (`g1a-decompose-add`)
  - ✅ g1a-02-05 Subtracting Multiples of Ten (`g1a-sub-tens`)
  - ✅ g1a-02-06 Subtracting on the Hundred Chart (`g1a-chart-sub`)
  - ✅ g1a-03-01 Explaining Why It Works (`g1a-explain`)
  - ✅ g1a-03-02 Addition Stories Within 100 (`g1a-story-add`)
  - ✅ g1a-03-03 Subtraction Stories Within 100 (`g1a-story-sub`)
  - ✅ g1a-03-04 Choose Your Method (`g1a-method-choice`)

## Course K — Adding & Taking Away (`add-subtract-10-k`, gradeLevel 0, K.OA.A.1/2/5) — S189, seventh K5-expansion course and the largest K course; its five K.OA.A.5 lessons are the first KINDERGARTEN content to feed the item-grain fluency architecture (additive `factFamily` -> `Profile.factItems`) ✅ SHIPPED (3 ch / 20 lessons, wired)

  - ✅ koa-01-01 Putting Groups Together (`koa-join-groups`)
  - ✅ koa-01-02 Adding with Fingers (`koa-fingers`)
  - ✅ koa-01-03 Adding with Drawings (`koa-drawings`)
  - ✅ koa-01-04 Acting Out a Sum (`koa-act-out`)
  - ✅ koa-01-05 Writing an Addition Sentence (`koa-write-addition`)
  - ✅ koa-02-01 Taking Some Away (`koa-take-away`)
  - ✅ koa-02-02 Subtracting with Drawings (`koa-sub-drawings`)
  - ✅ koa-02-03 Acting Out a Take-Away (`koa-sub-act-out`)
  - ✅ koa-02-04 Writing a Subtraction Sentence (`koa-write-subtraction`)
  - ✅ koa-02-05 How Many Are Left? (`koa-how-many-left`)
  - ✅ koa-03-01 Add-To Stories (`koa-add-to-story`)
  - ✅ koa-03-02 Take-From Stories (`koa-take-from-story`)
  - ✅ koa-03-03 Put-Together Stories (`koa-put-together-story`)
  - ✅ koa-03-04 Which One Is It? (`koa-choose-operation`)
  - ✅ koa-03-05 Draw the Story (`koa-model-story`)
  - ✅ koa-03-06 Sums to 5 (`koa-sums-5`)
  - ✅ koa-03-07 Differences Within 5 (`koa-diffs-5`)
  - ✅ koa-03-08 Plus One, Minus One (`koa-plus-minus-one`)
  - ✅ koa-03-09 Zero Changes Nothing (`koa-zero-fact`)
  - ✅ koa-03-10 Speedy Fives (`koa-fluency-5`)

## Course G2 — Fluency Within 20 (`fluency-20-g2`, gradeLevel 2, 2.OA.B.2) — S188, sixth K5-expansion course, first content over the ADDITIVE half of the fact-grain architecture (`sumFamilyKey` -> `Profile.factItems`) ✅ SHIPPED (3 ch / 14 lessons, wired)

  - ✅ f20-01-01 Doubles from Memory (`g2f-doubles`)
  - ✅ f20-01-02 Near Doubles (`g2f-near-doubles`)
  - ✅ f20-01-03 Making Ten (`g2f-make-ten`)
  - ✅ f20-01-04 Ten Plus Something (`g2f-ten-plus`)
  - ✅ f20-02-01 Sums to 12 (`g2f-sums-12`)
  - ✅ f20-02-02 Sums to 16 (`g2f-sums-16`)
  - ✅ f20-02-03 Sums to 20 (`g2f-sums-20`)
  - ✅ f20-02-04 Subtracting from Ten (`g2f-from-ten`)
  - ✅ f20-03-01 Subtracting Across Ten (`g2f-across-ten`)
  - ✅ f20-03-02 Think Addition to Subtract (`g2f-think-addition`)
  - ✅ f20-03-03 Fact Families to 20 (`g2f-fact-families`)
  - ✅ f20-03-04 Missing Numbers (`g2f-missing`)
  - ✅ f20-03-05 Speed Round: Addition (`g2f-speed-add`)
  - ✅ f20-03-06 Speed Round: Subtraction (`g2f-speed-sub`)

## Course G3 — Multiplication Fluency (`mult-fluency-g3`, gradeLevel 3, 3.OA.C.7) — S186, fourth K5-expansion course, first over the item-grain fact-fluency architecture (`variant.factFamily` → `Profile.factItems`) ✅ SHIPPED (3 ch / 18 lessons, wired)

  - ✅ mf3-01-01 The ×2 Facts (`g3m-x2`)
  - ✅ mf3-01-02 The ×3 Facts (`g3m-x3`)
  - ✅ mf3-01-03 The ×4 Facts (`g3m-x4`)
  - ✅ mf3-01-04 The ×5 Facts (`g3m-x5`)
  - ✅ mf3-01-05 The ×6 Facts (`g3m-x6`)
  - ✅ mf3-01-06 The ×7 Facts (`g3m-x7`)
  - ✅ mf3-02-01 The ×8 Facts (`g3m-x8`)
  - ✅ mf3-02-02 The ×9 Facts (`g3m-x9`)
  - ✅ mf3-02-03 The ×10 Facts (`g3m-x10`)
  - ✅ mf3-02-04 Squares: 3×3, 4×4, 5×5 (`g3m-squares`)
  - ✅ mf3-02-05 The Facts That Stick (`g3m-hard-facts`)
  - ✅ mf3-02-06 Using a Fact You Know (`g3m-derive`)
  - ✅ mf3-03-01 Mixed Facts to 5×5 (`g3m-mixed-small`)
  - ✅ mf3-03-02 Mixed Facts to 9×9 (`g3m-mixed-large`)
  - ✅ mf3-03-03 Finding a Fact Fast (`g3m-recall-speed`)
  - ✅ mf3-03-04 Missing Factor (`g3m-missing-factor`)
  - ✅ mf3-03-05 Fact Families in Multiplication (`g3m-fact-family`)
  - ✅ mf3-03-06 The Whole Table (`g3m-full-table`)

## Course G3 — Division Fluency (`division-fluency-g3`, gradeLevel 3, 3.OA.B.6, 3.OA.C.7) — S186, fifth K5-expansion course, division half of the fluency pair ✅ SHIPPED (3 ch / 12 lessons, wired)

  - ✅ df3-01-01 Dividing by 2 (`g3d-div2`)
  - ✅ df3-01-02 Dividing by 3 (`g3d-div3`)
  - ✅ df3-01-03 Dividing by 4 and 5 (`g3d-div45`)
  - ✅ df3-01-04 Dividing by 6 and 7 (`g3d-div67`)
  - ✅ df3-02-01 Dividing by 8 and 9 (`g3d-div89`)
  - ✅ df3-02-02 Dividing by 10 (`g3d-div10`)
  - ✅ df3-02-03 Think Multiplication (`g3d-think-mult`)
  - ✅ df3-02-04 Missing Factor, Missing Quotient (`g3d-missing`)
  - ✅ df3-03-01 Dividing by 1 and Itself (`g3d-special`)
  - ✅ df3-03-02 Why You Can't Divide by Zero (`g3d-zero`)
  - ✅ df3-03-03 Mixed Division Facts (`g3d-mixed`)
  - ✅ df3-03-04 Multiply or Divide? (`g3d-choose`)

## Course G1 — Organizing Data (`data-graphs-g1`, gradeLevel 1, 1.MD.C.4) — S185, third K5-expansion course, over the S185-extended `barBuilder` (display bar/tally/pictograph) and `graphRead` (mode +tally) engines ✅ SHIPPED (3 ch / 12 lessons, wired)

  - ✅ dgr1-01-01 Asking a Question (`g1d-question`)
  - ✅ dgr1-01-02 Sorting into Categories (`g1d-sort`)
  - ✅ dgr1-01-03 Making a Tally (`g1d-tally`)
  - ✅ dgr1-01-04 Reading a Tally Chart (`g1d-read-tally`)
  - ✅ dgr1-02-01 Building a Picture Graph (`g1d-build-pictograph`)
  - ✅ dgr1-02-02 Reading a Picture Graph (`g1d-read-pictograph`)
  - ✅ dgr1-02-03 Building a Bar Graph (`g1d-build-bar`)
  - ✅ dgr1-02-04 Reading a Bar Graph (`g1d-read-bar`)
  - ✅ dgr1-03-01 How Many in All? (`g1d-total`)
  - ✅ dgr1-03-02 How Many More? (`g1d-compare`)
  - ✅ dgr1-03-03 Which Category Has Most? (`g1d-most-least`)
  - ✅ dgr1-03-04 Telling the Story of the Data (`g1d-interpret`)

## Course G4 — Decimals: Tenths & Hundredths (`decimals-intro-g4`, gradeLevel 4, 4.NF.C.5/6/7 + 4.MD.A.2) — S184, second K5-expansion course, first over the `hundredthsGrid` engine ✅ SHIPPED (3 ch / 18 lessons, wired)

  - ✅ dg4-01-01 Splitting One into Ten (`g4d-tenths-intro`)
  - ✅ dg4-01-02 Writing a Tenth (`g4d-write-tenth`)
  - ✅ dg4-01-03 Tenths on a Number Line (`g4d-tenths-line`)
  - ✅ dg4-01-04 Tenths as Fractions (`g4d-tenths-fraction`)
  - ✅ dg4-01-05 Splitting a Tenth into Ten (`g4d-hundredths-intro`)
  - ✅ dg4-01-06 Writing a Hundredth (`g4d-write-hundredth`)
  - ✅ dg4-02-01 Hundredths on a Grid (`g4d-hundredths-grid`)
  - ✅ dg4-02-02 Tenths to Hundredths (`g4d-tenth-to-hundredth`)
  - ✅ dg4-02-03 Adding Tenths and Hundredths (`g4d-add-tenth-hundredth`)
  - ✅ dg4-02-04 Reading a Decimal Aloud (`g4d-read-decimal`)
  - ✅ dg4-02-05 Decimal Place Names (`g4d-place-names`)
  - ✅ dg4-02-06 Fraction to Decimal (`g4d-fraction-to-decimal`)
  - ✅ dg4-03-01 Decimal to Fraction (`g4d-decimal-to-fraction`)
  - ✅ dg4-03-02 Comparing Two Decimals (`g4d-compare`)
  - ✅ dg4-03-03 The Trailing Zero (`g4d-trailing-zero`)
  - ✅ dg4-03-04 Ordering Decimals (`g4d-order`)
  - ✅ dg4-03-05 Decimals and Money (`g4d-money`)
  - ✅ dg4-03-06 Decimals in Measurement (`g4d-measurement`)

## Course K-2 — Counting to 100 (`counting-to-100-k`, gradeLevel 0, K.CC.A.1 + K.CC.A.2) — S183, first K5-expansion course ✅ SHIPPED (3 ch / 18 lessons, wired)

  - ✅ k100-01-01 Twenty-One and Beyond (`kcc-count-past-20`)
  - ✅ k100-01-02 The Next Ten (`kcc-cross-decade`)
  - ✅ k100-01-03 Counting to Fifty (`kcc-count-to-50`)
  - ✅ k100-01-04 Fifty to Seventy (`kcc-count-50-70`)
  - ✅ k100-01-05 Seventy to One Hundred (`kcc-count-70-100`)
  - ✅ k100-01-06 All the Way to 100 (`kcc-count-to-100`)
  - ✅ k100-02-01 Ten, Twenty, Thirty (`kcc-tens-to-50`)
  - ✅ k100-02-02 Tens All the Way to 100 (`kcc-tens-to-100`)
  - ✅ k100-02-03 Rows of Ten on the Chart (`kcc-tens-chart`)
  - ✅ k100-02-04 Which Ten Comes Next? (`kcc-next-ten`)
  - ✅ k100-02-05 Counting Tens Backward (`kcc-tens-back`)
  - ✅ k100-03-01 Start at Seven (`kcc-count-from-given`)
  - ✅ k100-03-02 Start in the Middle (`kcc-count-from-mid`)
  - ✅ k100-03-03 Pick Up Where It Stops (`kcc-continue-count`)
  - ✅ k100-03-04 Counting On from Big Numbers (`kcc-count-from-large`)
  - ✅ k100-03-05 What Comes Next on the Chart? (`kcc-chart-next`)
  - ✅ k100-03-06 Missing Numbers on the Chart (`kcc-chart-missing`)
  - ✅ k100-03-07 Counting Backward from Twenty (`kcc-count-back-20`)
