# Scaffold Gap Audit

Regenerate with `node scripts/scaffold-gap-audit.mjs`. Advisory only — not a build gate
(see the file header for why). Ranks each lesson's CHALLENGE step's compoundness score
against the hardest check/interactive step already rehearsed earlier in the SAME lesson.
A large gap is a candidate for a human to review: does an earlier step really rehearse
the combination the challenge asks for, or is the challenge the learner's first encounter
with it at the highest-stakes moment in the lesson?

**1129 lessons scanned. 1 at gap≥3. 9 at gap=2 (challengeScore≥2).**

| gap | challenge score | max earlier | course/lesson | title |
|---|---|---|---|---|
| 3 | 5 | 2 | sequences-series/sr-05-03 | Forever Sums in the Wild |
| 2 | 4 | 2 | fractions/fr-04-03 | Why 1/3 Beats 1/4 |
| 2 | 4 | 2 | functions-g8/fg-02-01 | Rate of Change |
| 2 | 4 | 2 | multiply-bigger/mb-03-02 | Break the Big Number |
| 2 | 4 | 2 | place-value/pv-02-03 | The Halfway Rule |
| 2 | 3 | 1 | area-surface-volume/asv-05-03 | Volume in the Real World |
| 2 | 3 | 1 | expressions-equations/ee-02-03 | Writing Expressions from Words |
| 2 | 3 | 1 | expressions-equations/ee-04-02 | Solving with Addition & Subtraction |
| 2 | 3 | 1 | sampling-and-probability/sp-03-03 | Probability in Real Situations |
| 2 | 2 | 0 | polar-parametric/pp-01-03 | Rectangular → Polar: Watch the Quadrant |
| 1 | 5 | 4 | function-transformations/ft-05-04 | Building the Undo Machine |
| 1 | 4 | 3 | add-subtract-20/as-02-02 | Split to Make Ten |
| 1 | 4 | 3 | fractions-add/fa-04-03 | Adding & Subtracting Mixed Numbers |
| 1 | 3 | 2 | constructions-and-proof/cp-04-03 | Proving Vertical Angles Equal |
| 1 | 3 | 2 | expressions-equations/ee-04-03 | Solving with Multiplication & Division |
| 1 | 3 | 2 | expressions-equations/ee-05-03 | Dependent and Independent Variables |
| 1 | 3 | 2 | fractions/fr-01-02 | Unit Fractions: One Piece |
| 1 | 3 | 2 | fractions/fr-04-01 | Same Bottom, Compare Tops |
| 1 | 3 | 2 | fractions/fr-04-02 | Same Top, Compare Bottoms |
| 1 | 3 | 2 | fractions-add/fa-03-02 | Subtracting Like Fractions |
| 1 | 3 | 2 | integration-accumulation/in-01-01 | Estimating with Rectangles |
| 1 | 3 | 2 | integration-applications/ia-04-01 | Motion Revisited: ∫v and ∫|v| |
| 1 | 3 | 2 | limits-continuity/lc-01-03 | When a Limit Fails to Exist |
| 1 | 3 | 2 | multiplication-division/mult-01-05 | Turn It Around: Flipping Facts |
| 1 | 3 | 2 | multiplication-division/mult-04-01 | Which Operation? |
| 1 | 3 | 2 | multiply-bigger/mb-03-03 | Two-Digit Times Two-Digit |
| 1 | 3 | 2 | multiply-bigger/mb-04-01 | Sharing with Leftovers |
| 1 | 3 | 2 | number-system/ns-03-02 | Least Common Multiple |
| 1 | 3 | 2 | place-value/pv-02-01 | The Closer Ten |
| 1 | 3 | 2 | place-value/pv-02-02 | The Closer Hundred |
| 1 | 3 | 2 | place-value/pv-02-04 | Estimating in Stories |
| 1 | 3 | 2 | place-value-million/pv2-01-02 | Ten Times Bigger, Ten Times Smaller |
| 1 | 3 | 2 | ratios-rates/rr-02-02 | Double Number Lines |
| 1 | 3 | 2 | sampling-and-probability/sp-01-02 | How Sample Size Affects Confidence |
| 1 | 3 | 2 | sequences-series/sr-04-02 | The Geometric Sum Formula |
| 1 | 3 | 2 | shapes-and-sorting-k/ks-03-01 | Longer or Shorter |
| 1 | 3 | 2 | solid-geometry/sg-05-01 | k, k-Squared, k-Cubed |
| 1 | 3 | 2 | systems-equations/se-04-01 | Totals and Differences |
| 1 | 3 | 2 | triangle-congruence/tc-05-03 | Inequalities in Proofs |
| 1 | 3 | 2 | trig-identities-equations/ti-01-03 | Ladders for Transformed Angles |
| 1 | 3 | 2 | trig-identities-equations/ti-04-03 | Double-Angle in Action |
| 1 | 2 | 1 | area-surface-volume/asv-05-01 | Volume and the Formula |
| 1 | 2 | 1 | circle-theorems/cr-02-02 | The Perpendicular from the Center |
| 1 | 2 | 1 | conditional-probability/cpr-03-01 | Restricting the Sample Space |
| 1 | 2 | 1 | conic-sections/co-01-02 | Shifted Parabolas & Orientation |
| 1 | 2 | 1 | conic-sections/co-04-03 | Hyperbolas & Parabolas from General Form |
| 1 | 2 | 1 | coordinate-proofs/cx-04-01 | Perimeter on the Plane |
| 1 | 2 | 1 | coordinate-proofs/cx-05-03 | Circles in Disguise |
| 1 | 2 | 1 | derivatives-in-context/dc-02-03 | Choosing the Relation |
| 1 | 2 | 1 | derivatives-in-context/dc-03-03 | When Linearisation Fails |
| 1 | 2 | 1 | fractions/fr-01-03 | Counting Pieces: a/b |
| 1 | 2 | 1 | fractions-add/fa-02-03 | Ordering with Benchmarks |
| 1 | 2 | 1 | function-analysis/fna-04-03 | Decomposing & Modeling with Composition |
| 1 | 2 | 1 | geometry-foundations/gf-03-03 | Rotations as Functions |
| 1 | 2 | 1 | geometry-g7/g7-04-02 | Slicing Solids |
| 1 | 2 | 1 | geometry-g7/g7-04-03 | Geometry Roundup |
| 1 | 2 | 1 | integration-accumulation/in-03-02 | FTC Part 2: Evaluating With an Antiderivative |
| 1 | 2 | 1 | limits-continuity/lc-03-01 | One-Sided Limits |
| 1 | 2 | 1 | linear-equations-systems/les-03-02 | Solving by Graphing |
| 1 | 2 | 1 | lines-angles/la-01-01 | Naming the Basics |

## Top candidates, in full

### sequences-series/sr-05-03 — Forever Sums in the Wild (gap 3)
- challenge score 5, hardest earlier step 2, 6 check/interactive steps before it
- CHALLENGE: A swing's first arc is 12 ft, and each arc is 3/4 the length of the one before, forever. Total distance across ALL arcs, in feet?

### fractions/fr-04-03 — Why 1/3 Beats 1/4 (gap 2)
- challenge score 4, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: Four kids are about to share a 20 cm licorice rope equally — then a fifth kid joins BEFORE the cut. How many cm does each kid get now?

### functions-g8/fg-02-01 — Rate of Change (gap 2)
- challenge score 4, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A tank holds 50 liters at 2 minutes and 30 liters at 6 minutes. What is the rate of change, in liters per minute?

### multiply-bigger/mb-03-02 — Break the Big Number (gap 2)
- challenge score 4, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A stand has 6 rows with 47 seats in each row. How many seats in all? (Split 47 into 40 + 7.)

### place-value/pv-02-03 — The Halfway Rule (gap 2)
- challenge score 4, hardest earlier step 2, 6 check/interactive steps before it
- CHALLENGE: Ana has 45 stickers, Ben has 52, Cam has 35. Round each count to the nearest ten, then add the rounded counts. What sum do you get?

### area-surface-volume/asv-05-03 — Volume in the Real World (gap 2)
- challenge score 3, hardest earlier step 1, 5 check/interactive steps before it
- CHALLENGE: A tank is 2½ × 4 × 2. You fill it with a bucket that carries 2½ cubic units per trip. How many trips?

### expressions-equations/ee-02-03 — Writing Expressions from Words (gap 2)
- challenge score 3, hardest earlier step 1, 5 check/interactive steps before it
- CHALLENGE: Write "8 less than triple m" as an expression, then evaluate it at m = 5.

### expressions-equations/ee-04-02 — Solving with Addition & Subtraction (gap 2)
- challenge score 3, hardest earlier step 1, 6 check/interactive steps before it
- CHALLENGE: After a $9 tip is added, a bill totals $15. Write and solve an equation for the original bill, n.

### sampling-and-probability/sp-03-03 — Probability in Real Situations (gap 2)
- challenge score 3, hardest earlier step 1, 6 check/interactive steps before it
- CHALLENGE: A spinner's theoretical probability of blue is 1/2. After 40 spins, blue came up 24 times. What is the EXPERIMENTAL probability of blue?

### polar-parametric/pp-01-03 — Rectangular → Polar: Watch the Quadrant (gap 2)
- challenge score 2, hardest earlier step 0, 5 check/interactive steps before it
- CHALLENGE: Convert (−2√3, 2) to polar and report r + θ (θ in radians), to four decimals.

### function-transformations/ft-05-04 — Building the Undo Machine (gap 1)
- challenge score 5, hardest earlier step 4, 5 check/interactive steps before it
- CHALLENGE: f(x) = (2x + 6)/4 − 1. Its chain: multiply by 2, add 6, divide by 4, subtract 1. Build f⁻¹.

### add-subtract-20/as-02-02 — Split to Make Ten (gap 1)
- challenge score 4, hardest earlier step 3, 5 check/interactive steps before it
- CHALLENGE: 9 + 4 = ? (Make ten: 9 needs 1, then add what's left.)

### fractions-add/fa-04-03 — Adding & Subtracting Mixed Numbers (gap 1)
- challenge score 4, hardest earlier step 3, 7 check/interactive steps before it
- CHALLENGE: A recipe needs 4 1/6 cups of flour total. You've already used 1 5/6 cups. How much flour is left? What is the WHOLE NUMBER part of the answer?

### constructions-and-proof/cp-04-03 — Proving Vertical Angles Equal (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: Two lines cross. One angle is (4x)° and the angle NEXT to it (a linear pair) is (2x + 30)°. Find the measure of the angle VERTICAL to the (4x)° angle, in degrees.

### expressions-equations/ee-04-03 — Solving with Multiplication & Division (gap 1)
- challenge score 3, hardest earlier step 2, 6 check/interactive steps before it
- CHALLENGE: Tickets cost $6 each, and a group spent $42 total. Write and solve an equation for the number of tickets, t.

### expressions-equations/ee-05-03 — Dependent and Independent Variables (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: Shirts cost $5 each: cost = 5 × shirts. If someone buys 6 shirts, what is the total cost?

### fractions/fr-01-02 — Unit Fractions: One Piece (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A sub is fair-cut into 8 pieces for 8 hikers — one piece each. Rain sends 3 hikers home before eating, and their pieces go back in the box. How many EIGHTHS are in the box?

### fractions/fr-04-01 — Same Bottom, Compare Tops (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A relay trail is split into 10 equal legs. Team Red has finished 7 legs; Team Blue has finished 4. How many more TENTHS of the trail has Red covered?

### fractions/fr-04-02 — Same Top, Compare Bottoms (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: Two same-size pizzas. Jo takes 2 slices of the one cut into 3; Kai takes 2 slices of the one cut into 8. Who has more pizza? (Jo's bar is first, Kai's second.)

### fractions-add/fa-03-02 — Subtracting Like Fractions (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A ribbon is 7/8 meter long. Jill cuts off 3/8 meter. How much is left, simplified to lowest terms? What is the numerator of the simplified answer?

### integration-accumulation/in-01-01 — Estimating with Rectangles (gap 1)
- challenge score 3, hardest earlier step 2, 4 check/interactive steps before it
- CHALLENGE: f(x) = x² on [0, 2] with 4 strips. By how much does the RIGHT sum exceed the LEFT sum?

### integration-applications/ia-04-01 — Motion Revisited: ∫v and ∫|v| (gap 1)
- challenge score 3, hardest earlier step 2, 4 check/interactive steps before it
- CHALLENGE: Displacement 4/3, total distance 4, over 4 seconds. Find the AVERAGE SPEED.

### limits-continuity/lc-01-03 — When a Limit Fails to Exist (gap 1)
- challenge score 3, hardest earlier step 2, 4 check/interactive steps before it
- CHALLENGE: At x = 1, a graph jumps from y = −2 (left) to y = +2 (right). Then lim(x→1) f(x):

### multiplication-division/mult-01-05 — Turn It Around: Flipping Facts (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: Sam knows 4 × 6 = 24 but hasn't learned his 6-times table. He gets 6 packs of 4 stickers, plus 10 loose stickers. How many stickers in all?

### multiplication-division/mult-04-01 — Which Operation? (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: A florist has 4 buckets with 6 roses in each. She sells 9 roses. How many roses are left?

### multiply-bigger/mb-03-03 — Two-Digit Times Two-Digit (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: An orchard is planted in a grid with 12 rows and 14 trees per row. How many trees? (Split 12 = 10+2, 14 = 10+4.)

### multiply-bigger/mb-04-01 — Sharing with Leftovers (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: 38 stickers are shared equally among 5 friends, giving each the same whole number of stickers. How many stickers are left over?

### number-system/ns-03-02 — Least Common Multiple (gap 1)
- challenge score 3, hardest earlier step 2, 5 check/interactive steps before it
- CHALLENGE: One bus leaves every 8 minutes, another every 12 minutes. They just left together. In how many minutes do they NEXT leave together?

### place-value/pv-02-01 — The Closer Ten (gap 1)
- challenge score 3, hardest earlier step 2, 6 check/interactive steps before it
- CHALLENGE: One jar holds 47 marbles, another holds 31. Round EACH to its nearest ten, then add the rounded numbers. What estimate do you get?

### place-value/pv-02-02 — The Closer Hundred (gap 1)
- challenge score 3, hardest earlier step 2, 6 check/interactive steps before it
- CHALLENGE: A school fair sells 287 tickets on Saturday and 412 on Sunday. Round each to the nearest hundred, then add the rounded numbers. What estimate do you get?
