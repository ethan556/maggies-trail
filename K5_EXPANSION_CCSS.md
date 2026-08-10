# K–5 Expansion: 490 Lessons Against Common Core

**Method.** Every existing K–5 lesson in the repository (339 across 25 courses) was read from
`content/curriculum-manifest.json` and mapped by title and `conceptTag` to the CCSS-M standard it
serves. The 490 lessons below fill what that mapping left uncovered or thin. Standard codes are
CCSS-M (2010, unrevised); the repo's existing crosswalk already carries CA-CCSSM, NY-NGLS, FL-BEST
and TX-TEKS, so each lesson inherits those alignments through
`content/standards/course-crosswalk.json`.

**Result.** K–5 goes from 339 → 829 lessons. The grade shape changes from bottom-thin
(K = 22 lessons) to balanced.

| Grade | Now | Add | After | Why |
|---|---|---|---|---|
| K | 22 | **118** | 140 | Severe. Whole standards uncovered. |
| 1 | 56 | **82** | 138 | One domain (data) entirely absent. |
| 2 | 52 | **80** | 132 | Within-1000 arithmetic and data thin. |
| 3 | 78 | **66** | 144 | Coverage good; fluency volume short. |
| 4 | 69 | **76** | 145 | Decimals (4.NF.C) entirely absent. |
| 5 | 62 | **68** | 130 | Unlike-denominator work underweight. |
| **Total** | **339** | **490** | **829** | |

---

## The five real coverage holes

These are standards with **no** lesson serving them, not merely thin ones.

1. **K.CC.A.1 — count to 100.** The K course stops at 20 plus counting by tens. A kindergartner
   who finishes the existing course cannot count to 100. This is the single most-assessed K
   standard.
2. **1.MD.C.4 — represent and interpret data.** Grade 1 has no data lessons at all. Data appears
   first in Grade 2. An entire cluster is missing.
3. **4.NF.C.5–7 — decimal notation for fractions.** Grade 4 has zero decimal lessons; decimals
   first appear in Grade 5's `decimals-place-value`. Fourth graders are expected to read, write and
   compare tenths and hundredths, and to add 3/10 + 4/100.
4. **2.NBT.B.6 — add up to four two-digit numbers.** No lesson. It is the bridge from
   single-addend fluency to column addition.
5. **K.OA.A.5 / 2.OA.B.2 — fact fluency from memory.** Both grades require automaticity; neither
   has dedicated fluency sequences, only strategy lessons.

Two more are covered but at a depth that will not produce fluency: **3.OA.C.7** (all products of
two one-digit numbers from memory — currently 5 strategy lessons, no systematic fact coverage) and
**5.NF.A.1** (unlike denominators — currently 3 lessons inside a course mostly about
multiplication).

---

# KINDERGARTEN — 118 lessons

Existing: `counting-to-20-k` (13), `shapes-and-sorting-k` (9).

## `counting-to-100-k` — Counting to 100 · 18 lessons · K.CC.A.1, K.CC.A.2

**Chapter 1 — Past Twenty**
1. Twenty-One and Beyond — `kcc-count-past-20` — K.CC.A.1
2. The Next Ten — `kcc-cross-decade` — K.CC.A.1
3. Counting to Fifty — `kcc-count-to-50` — K.CC.A.1
4. Fifty to Seventy — `kcc-count-50-70` — K.CC.A.1
5. Seventy to One Hundred — `kcc-count-70-100` — K.CC.A.1
6. All the Way to 100 — `kcc-count-to-100` — K.CC.A.1

**Chapter 2 — Counting by Tens**
7. Ten, Twenty, Thirty — `kcc-tens-to-50` — K.CC.A.1
8. Tens All the Way to 100 — `kcc-tens-to-100` — K.CC.A.1
9. Rows of Ten on the Chart — `kcc-tens-chart` — K.CC.A.1
10. Which Ten Comes Next? — `kcc-next-ten` — K.CC.A.1
11. Counting Tens Backward — `kcc-tens-back` — K.CC.A.1

**Chapter 3 — Starting Anywhere**
12. Start at Seven — `kcc-count-from-given` — K.CC.A.2
13. Start in the Middle — `kcc-count-from-mid` — K.CC.A.2
14. Pick Up Where It Stops — `kcc-continue-count` — K.CC.A.2
15. Counting On from Big Numbers — `kcc-count-from-large` — K.CC.A.2
16. What Comes Next on the Chart? — `kcc-chart-next` — K.CC.A.2
17. Missing Numbers on the Chart — `kcc-chart-missing` — K.CC.A.2
18. Counting Backward from Twenty — `kcc-count-back-20` — K.CC.A.2

## `number-writing-k` — Writing Numbers 0–20 · 14 lessons · K.CC.A.3

19. Writing 1, 2, 3 — `kcw-write-123`
20. Writing 4, 5, 6 — `kcw-write-456`
21. Writing 7, 8, 9 — `kcw-write-789`
22. Zero and Ten — `kcw-write-zero-ten`
23. Match the Numeral to the Group — `kcw-match-numeral`
24. Write How Many — `kcw-write-count`
25. Writing the Teens — `kcw-write-teens`
26. Eleven and Twelve Are Tricky — `kcw-write-11-12`
27. Thirteen Through Nineteen — `kcw-write-13-19`
28. Writing Twenty — `kcw-write-20`
29. Write How Many: Teens — `kcw-write-count-teens`
30. Show That Many — `kcw-show-amount`
31. Draw That Many — `kcw-draw-amount`
32. Numeral, Word, Picture — `kcw-three-forms`

## `how-many-k` — How Many? · 16 lessons · K.CC.B.4, K.CC.B.5

**Chapter 1 — One Number, One Thing**
33. Touch and Count — `kch-one-to-one` — K.CC.B.4a
34. Don't Skip, Don't Repeat — `kch-no-skip` — K.CC.B.4a
35. Counting in a Line — `kch-count-line` — K.CC.B.5
36. Counting in a Circle — `kch-count-circle` — K.CC.B.5
37. Counting Things You Can't Move — `kch-count-fixed` — K.CC.B.5

**Chapter 2 — The Last Number Tells**
38. The Last Number Is the Answer — `kch-cardinality` — K.CC.B.4b
39. How Many Now? — `kch-recount` — K.CC.B.4b
40. It Doesn't Matter Where You Start — `kch-order-irrelevance` — K.CC.B.4b
41. Count Again, Same Answer — `kch-conservation` — K.CC.B.4b
42. Scattered Things — `kch-count-scattered` — K.CC.B.5

**Chapter 3 — One More Each Time**
43. One More Makes the Next Number — `kch-one-larger` — K.CC.B.4c
44. Growing by One — `kch-grow-by-one` — K.CC.B.4c
45. Which Group Has One More? — `kch-one-more-group` — K.CC.B.4c
46. Count Out That Many — `kch-count-out` — K.CC.B.5
47. Quick Look: How Many? — `kch-subitize` — K.CC.B.4
48. Quick Look with Ten Frames — `kch-subitize-frame` — K.CC.B.4

## `compare-numbers-k` — Comparing · 12 lessons · K.CC.C.6, K.CC.C.7

49. More, Fewer, or the Same? — `kcm-more-fewer-same` — K.CC.C.6
50. Matching One to One — `kcm-match-pairs` — K.CC.C.6
51. Which Group Is Bigger? — `kcm-bigger-group` — K.CC.C.6
52. Which Group Is Smaller? — `kcm-smaller-group` — K.CC.C.6
53. Groups That Match Exactly — `kcm-equal-groups` — K.CC.C.6
54. Comparing Without Counting — `kcm-compare-visual` — K.CC.C.6
55. Comparing by Counting — `kcm-compare-count` — K.CC.C.6
56. Which Number Is Greater? — `kcm-greater-numeral` — K.CC.C.7
57. Which Number Is Less? — `kcm-less-numeral` — K.CC.C.7
58. Same Number, Different Things — `kcm-same-numeral` — K.CC.C.7
59. Line Them Up in Order — `kcm-order-numerals` — K.CC.C.7
60. Greatest and Least — `kcm-greatest-least` — K.CC.C.7

## `add-subtract-10-k` — Adding & Taking Away · 20 lessons · K.OA.A.1, .2, .5

**Chapter 1 — Showing Addition**
61. Putting Groups Together — `koa-join-groups` — K.OA.A.1
62. Adding with Fingers — `koa-fingers` — K.OA.A.1
63. Adding with Drawings — `koa-drawings` — K.OA.A.1
64. Acting Out a Sum — `koa-act-out` — K.OA.A.1
65. Writing an Addition Sentence — `koa-write-addition` — K.OA.A.1

**Chapter 2 — Showing Subtraction**
66. Taking Some Away — `koa-take-away` — K.OA.A.1
67. Subtracting with Drawings — `koa-sub-drawings` — K.OA.A.1
68. Acting Out a Take-Away — `koa-sub-act-out` — K.OA.A.1
69. Writing a Subtraction Sentence — `koa-write-subtraction` — K.OA.A.1
70. How Many Are Left? — `koa-how-many-left` — K.OA.A.1

**Chapter 3 — Story Problems to 10**
71. Add-To Stories — `koa-add-to-story` — K.OA.A.2
72. Take-From Stories — `koa-take-from-story` — K.OA.A.2
73. Put-Together Stories — `koa-put-together-story` — K.OA.A.2
74. Which One Is It? — `koa-choose-operation` — K.OA.A.2
75. Draw the Story — `koa-model-story` — K.OA.A.2

**Chapter 4 — Fast Facts to 5**
76. Sums to 5 — `koa-sums-5` — K.OA.A.5
77. Differences Within 5 — `koa-diffs-5` — K.OA.A.5
78. Plus One, Minus One — `koa-plus-minus-one` — K.OA.A.5
79. Zero Changes Nothing — `koa-zero-fact` — K.OA.A.5
80. Speedy Fives — `koa-fluency-5` — K.OA.A.5

## `teen-numbers-k` — Teen Numbers · 12 lessons · K.NBT.A.1

81. Ten and One More — `knb-ten-plus-one`
82. Ten and Two More — `knb-ten-plus-two`
83. Building Teens on a Ten Frame — `knb-build-teen`
84. Eleven, Twelve, Thirteen — `knb-11-13`
85. Fourteen Through Sixteen — `knb-14-16`
86. Seventeen Through Nineteen — `knb-17-19`
87. Breaking a Teen into Ten and Some — `knb-decompose-teen`
88. Writing Teen Equations — `knb-teen-equation`
89. How Many Left Over? — `knb-leftover-ones`
90. Teens on the Number Line — `knb-teen-line`
91. Which Teen Is It? — `knb-identify-teen`
92. Teen Numbers All Around — `knb-teen-apply`

## `measure-compare-k` — Measuring & Sorting · 12 lessons · K.MD.A.1, .2, K.MD.B.3

93. What Can We Measure? — `kmd-attributes` — K.MD.A.1
94. Long, Tall, and Short — `kmd-length-words` — K.MD.A.1
95. Heavy and Light — `kmd-weight-words` — K.MD.A.1
96. Which Holds More? — `kmd-capacity-words` — K.MD.A.1
97. Comparing Two Lengths — `kmd-compare-length` — K.MD.A.2
98. Comparing Two Weights — `kmd-compare-weight` — K.MD.A.2
99. Lining Up the Ends — `kmd-align-ends` — K.MD.A.2
100. Taller Than, Shorter Than — `kmd-taller-shorter` — K.MD.A.2
101. Sorting by Color and Shape — `kmd-sort-attribute` — K.MD.B.3
102. Sorting by Size — `kmd-sort-size` — K.MD.B.3
103. Counting Each Sort — `kmd-count-categories` — K.MD.B.3
104. Which Group Has Most? — `kmd-compare-categories` — K.MD.B.3

## `shapes-build-k` — Building Shapes · 14 lessons · K.G.A.1, K.G.B.4, .5, .6

105. Above, Below, Beside — `kgb-position-1` — K.G.A.1
106. In Front, Behind, Next To — `kgb-position-2` — K.G.A.1
107. Describing Where Shapes Are — `kgb-describe-position` — K.G.A.1
108. Corners and Sides — `kgb-corners-sides` — K.G.B.4
109. Counting Corners — `kgb-count-corners` — K.G.B.4
110. Counting Sides — `kgb-count-sides` — K.G.B.4
111. Same Shape, Different Size — `kgb-size-invariance` — K.G.B.4
112. How Are These Alike? — `kgb-compare-alike` — K.G.B.4
113. How Are These Different? — `kgb-compare-different` — K.G.B.4
114. Flat Shapes vs. Solid Shapes — `kgb-flat-solid` — K.G.B.4
115. Drawing a Shape — `kgb-draw-shape` — K.G.B.5
116. Building a Shape from Sticks — `kgb-build-shape` — K.G.B.5
117. Two Triangles Make a Square — `kgb-compose-two` — K.G.B.6
118. Making a Bigger Shape — `kgb-compose-larger` — K.G.B.6

---

# GRADE 1 — 82 lessons

Existing: `add-subtract-20` (17), `counting-120` (15), `shapes-measure-g1` (12), `tens-and-ones` (12).

## `add-three-numbers-g1` — Adding Three Numbers · 10 lessons · 1.OA.A.2, 1.OA.B.3

1. Three Addends in a Row — `g1t-three-addends`
2. Find the Ten First — `g1t-find-ten-first`
3. Doubles First — `g1t-doubles-first`
4. Any Order Works — `g1t-any-order`
5. Grouping to Make It Easy — `g1t-grouping`
6. Three-Addend Stories — `g1t-story`
7. Which Two Go Together? — `g1t-choose-pair`
8. Three Numbers Past Ten — `g1t-past-ten`
9. Missing Third Addend — `g1t-missing-addend`
10. Adding Three, Your Way — `g1t-strategy-choice`

## `properties-strategies-g1` — Strategies That Always Work · 14 lessons · 1.OA.B.3, 1.OA.C.5, .6

11. Swapping the Addends — `g1p-commutative`
12. Why Swapping Is Safe — `g1p-why-commutative`
13. Counting On from the Bigger — `g1p-count-on-bigger`
14. Counting On Three or Less — `g1p-count-on-3`
15. Counting Back to Subtract — `g1p-count-back`
16. Doubles You Know — `g1p-doubles`
17. Doubles Plus One — `g1p-doubles-plus`
18. Doubles Minus One — `g1p-doubles-minus`
19. Making Ten to Add — `g1p-make-ten-add`
20. Making Ten to Subtract — `g1p-make-ten-sub`
21. Using a Known Fact — `g1p-known-fact`
22. Equivalent Sums — `g1p-equivalent-sums`
23. Which Strategy Fits? — `g1p-choose-strategy`
24. Explaining Your Strategy — `g1p-explain`

## `equations-unknowns-g1` — True Equations & Unknowns · 12 lessons · 1.OA.D.7, .8

25. What the Equal Sign Means — `g1e-equal-meaning`
26. True or False? — `g1e-true-false`
27. Both Sides the Same — `g1e-balance`
28. Numbers on the Right — `g1e-right-side`
29. Sums on Both Sides — `g1e-both-sums`
30. Unknown at the End — `g1e-unknown-end`
31. Unknown in the Middle — `g1e-unknown-middle`
32. Unknown at the Start — `g1e-unknown-start`
33. Subtraction Unknowns — `g1e-sub-unknown`
34. Using a Fact Family to Solve — `g1e-fact-family`
35. Checking Your Answer — `g1e-check`
36. Writing Your Own True Equation — `g1e-write-true`

## `add-within-100-g1` — Adding Within 100 · 14 lessons · 1.NBT.C.4, .5, .6

37. Adding a One-Digit Number — `g1a-add-ones`
38. When the Ones Fill a Ten — `g1a-ones-make-ten`
39. Adding a Multiple of Ten — `g1a-add-tens`
40. Tens Plus Tens — `g1a-tens-tens`
41. Ten More, Ten Less in Your Head — `g1a-mental-ten`
42. Using the Hundred Chart to Add — `g1a-chart-add`
43. Adding on a Number Line — `g1a-line-add`
44. Breaking a Number to Add — `g1a-decompose-add`
45. Subtracting Multiples of Ten — `g1a-sub-tens`
46. Subtracting on the Hundred Chart — `g1a-chart-sub`
47. Explaining Why It Works — `g1a-explain`
48. Addition Stories Within 100 — `g1a-story-add`
49. Subtraction Stories Within 100 — `g1a-story-sub`
50. Choose Your Method — `g1a-method-choice`

## `data-graphs-g1` — Organizing Data · 12 lessons · 1.MD.C.4 — **uncovered cluster**

51. Asking a Question — `g1d-question`
52. Sorting into Categories — `g1d-sort`
53. Making a Tally — `g1d-tally`
54. Reading a Tally Chart — `g1d-read-tally`
55. Building a Picture Graph — `g1d-build-pictograph`
56. Reading a Picture Graph — `g1d-read-pictograph`
57. Building a Bar Graph — `g1d-build-bar`
58. Reading a Bar Graph — `g1d-read-bar`
59. How Many in All? — `g1d-total`
60. How Many More? — `g1d-compare`
61. Which Category Has Most? — `g1d-most-least`
62. Telling the Story of the Data — `g1d-interpret`

## `measure-length-g1` — Measuring Length · 10 lessons · 1.MD.A.1, .2

63. Comparing Two Objects — `g1m-compare-two`
64. Ordering Three Objects — `g1m-order-three`
65. Comparing Without Moving — `g1m-indirect`
66. Using a Third Object — `g1m-transitivity`
67. Laying Units End to End — `g1m-iterate`
68. No Gaps, No Overlaps — `g1m-no-gaps`
69. Counting the Units — `g1m-count-units`
70. Measuring with Cubes — `g1m-cubes`
71. Measuring with Paper Clips — `g1m-clips`
72. Same Object, Different Units — `g1m-unit-size`

## `compose-shapes-g1` — Composing Shapes · 10 lessons · 1.G.A.1, .2

73. What Makes It That Shape — `g1s-defining`
74. Color and Size Don't Count — `g1s-nondefining`
75. Sorting by Defining Attributes — `g1s-sort-defining`
76. Two Shapes Make a New One — `g1s-compose-two`
77. Making a Rectangle — `g1s-make-rectangle`
78. Making a Hexagon — `g1s-make-hexagon`
79. Filling an Outline — `g1s-fill-outline`
80. Building with Solids — `g1s-compose-solid`
81. Taking a Shape Apart — `g1s-decompose`
82. New Shapes from Old — `g1s-compose-new`

---

# GRADE 2 — 80 lessons

Existing: `add-subtract-100` (16), `measure-money-time` (15), `place-value-1000` (12), `shapes-shares-g2` (9).

## `fluency-20-g2` — Fluency Within 20 · 14 lessons · 2.OA.B.2

1. Doubles from Memory — `g2f-doubles`
2. Near Doubles — `g2f-near-doubles`
3. Making Ten — `g2f-make-ten`
4. Ten Plus Something — `g2f-ten-plus`
5. Sums to 12 — `g2f-sums-12`
6. Sums to 16 — `g2f-sums-16`
7. Sums to 20 — `g2f-sums-20`
8. Subtracting from Ten — `g2f-from-ten`
9. Subtracting Across Ten — `g2f-across-ten`
10. Think Addition to Subtract — `g2f-think-addition`
11. Fact Families to 20 — `g2f-fact-families`
12. Missing Numbers — `g2f-missing`
13. Speed Round: Addition — `g2f-speed-add`
14. Speed Round: Subtraction — `g2f-speed-sub`

## `arrays-even-odd-g2` — Arrays, Odd & Even · 10 lessons · 2.OA.C.3, .4

15. Pairing Things Up — `g2a-pairs`
16. Odd or Even? — `g2a-odd-even`
17. Doubles Make Evens — `g2a-doubles-even`
18. Writing an Even as a Double — `g2a-even-equation`
19. Rows and Columns — `g2a-rows-columns`
20. Counting an Array by Rows — `g2a-count-rows`
21. Counting an Array by Columns — `g2a-count-columns`
22. Writing the Repeated Sum — `g2a-repeated-sum`
23. Same Total, Different Array — `g2a-array-shapes`
24. Arrays in the World — `g2a-array-apply`

## `add-subtract-1000-g2` — Adding & Subtracting Within 1,000 · 16 lessons · 2.NBT.B.7, .8, .9

25. Adding Hundreds — `g2b-add-hundreds`
26. Adding Without Trading — `g2b-add-no-trade`
27. Trading Ones for a Ten — `g2b-trade-ones`
28. Trading Tens for a Hundred — `g2b-trade-tens`
29. Two Trades at Once — `g2b-two-trades`
30. Subtracting Without Trading — `g2b-sub-no-trade`
31. Breaking a Ten — `g2b-break-ten`
32. Breaking a Hundred — `g2b-break-hundred`
33. Subtracting Across a Zero — `g2b-across-zero`
34. Ten More, Ten Less Mentally — `g2b-mental-ten`
35. Hundred More, Hundred Less Mentally — `g2b-mental-hundred`
36. Jumping on an Open Number Line — `g2b-open-line`
37. Why Trading Works — `g2b-why-trade`
38. Explaining a Strategy — `g2b-explain`
39. Three-Digit Stories — `g2b-story`
40. Choosing a Method — `g2b-method`

## `four-addends-g2` — Adding Several Numbers · 8 lessons · 2.NBT.B.6 — **uncovered standard**

41. Adding Three Two-Digit Numbers — `g2n-three-addends`
42. Adding Four Two-Digit Numbers — `g2n-four-addends`
43. Look for Tens First — `g2n-find-tens`
44. Adding the Tens, Then the Ones — `g2n-by-place`
45. Grouping Friendly Pairs — `g2n-friendly-pairs`
46. Keeping Track of the Total — `g2n-track-total`
47. Four-Addend Stories — `g2n-story`
48. Checking a Long Sum — `g2n-check`

## `number-line-g2` — The Number Line · 10 lessons · 2.MD.B.6

49. Numbers on a Line — `g2l-locate`
50. Equally Spaced Marks — `g2l-spacing`
51. Finding a Number Between — `g2l-between`
52. Jumping Forward to Add — `g2l-jump-add`
53. Jumping Backward to Subtract — `g2l-jump-sub`
54. Big Jumps and Small Jumps — `g2l-jump-sizes`
55. Showing a Sum on the Line — `g2l-show-sum`
56. Showing a Difference on the Line — `g2l-show-diff`
57. Which Jump Is Missing? — `g2l-missing-jump`
58. Number Line Stories — `g2l-story`

## `length-problems-g2` — Length Problems · 10 lessons · 2.MD.A.4, 2.MD.B.5

59. How Much Longer? — `g2p-how-much-longer`
60. Comparing Two Measurements — `g2p-compare-two`
61. Finding the Difference in Length — `g2p-length-diff`
62. Adding Two Lengths — `g2p-add-lengths`
63. Total Distance — `g2p-total-distance`
64. Missing Length — `g2p-missing-length`
65. Length Stories with Drawings — `g2p-draw-model`
66. Using a Number Line for Length — `g2p-line-model`
67. Two-Step Length Problems — `g2p-two-step`
68. Does the Answer Make Sense? — `g2p-reasonable`

## `data-line-plots-g2` — Collecting & Showing Data · 12 lessons · 2.MD.D.9, .10

69. Measuring a Whole Group — `g2g-measure-group`
70. Recording Measurements — `g2g-record`
71. Building a Line Plot — `g2g-build-lineplot`
72. Reading a Line Plot — `g2g-read-lineplot`
73. Most Common Measurement — `g2g-mode`
74. Building a Picture Graph — `g2g-build-pictograph`
75. Reading a Picture Graph — `g2g-read-pictograph`
76. Building a Bar Graph — `g2g-build-bar`
77. Reading a Bar Graph — `g2g-read-bar`
78. Put-Together Questions — `g2g-total-question`
79. Take-Apart and Compare Questions — `g2g-compare-question`
80. Which Graph Should I Use? — `g2g-choose-graph`

---

# GRADE 3 — 66 lessons

Existing coverage is the strongest in K–5. These lessons add **fluency volume**, which
3.OA.C.7 explicitly demands ("know from memory all products of two one-digit numbers") and which
five strategy lessons cannot deliver.

## `mult-fluency-g3` — Multiplication Fluency · 18 lessons · 3.OA.C.7

1. The ×2 Facts — `g3m-x2`
2. The ×3 Facts — `g3m-x3`
3. The ×4 Facts — `g3m-x4`
4. The ×5 Facts — `g3m-x5`
5. The ×6 Facts — `g3m-x6`
6. The ×7 Facts — `g3m-x7`
7. The ×8 Facts — `g3m-x8`
8. The ×9 Facts — `g3m-x9`
9. The ×10 Facts — `g3m-x10`
10. Squares: 3×3, 4×4, 5×5 — `g3m-squares`
11. The Facts That Stick — `g3m-hard-facts`
12. Using a Fact You Know — `g3m-derive`
13. Mixed Facts to 5×5 — `g3m-mixed-small`
14. Mixed Facts to 9×9 — `g3m-mixed-large`
15. Finding a Fact Fast — `g3m-recall-speed`
16. Missing Factor — `g3m-missing-factor`
17. Fact Families in Multiplication — `g3m-fact-family`
18. The Whole Table — `g3m-full-table`

## `division-fluency-g3` — Division Fluency · 12 lessons · 3.OA.B.6, 3.OA.C.7

19. Dividing by 2 — `g3d-div2`
20. Dividing by 3 — `g3d-div3`
21. Dividing by 4 and 5 — `g3d-div45`
22. Dividing by 6 and 7 — `g3d-div67`
23. Dividing by 8 and 9 — `g3d-div89`
24. Dividing by 10 — `g3d-div10`
25. Think Multiplication — `g3d-think-mult`
26. Missing Factor, Missing Quotient — `g3d-missing`
27. Dividing by 1 and Itself — `g3d-special`
28. Why You Can't Divide by Zero — `g3d-zero`
29. Mixed Division Facts — `g3d-mixed`
30. Multiply or Divide? — `g3d-choose`

## `word-problems-g3` — Two-Step Word Problems · 12 lessons · 3.OA.D.8

31. Finding the Hidden Question — `g3w-hidden-question`
32. Add Then Multiply — `g3w-add-mult`
33. Multiply Then Subtract — `g3w-mult-sub`
34. Divide Then Add — `g3w-div-add`
35. Two Steps with a Letter — `g3w-variable`
36. Writing the Equation — `g3w-write-equation`
37. Drawing a Bar Model — `g3w-bar-model`
38. Estimating First — `g3w-estimate-first`
39. Checking with Rounding — `g3w-check-round`
40. Spotting an Unreasonable Answer — `g3w-unreasonable`
41. Extra Information — `g3w-extra-info`
42. Writing Your Own Two-Step Problem — `g3w-author`

## `add-subtract-1000-g3` — Fluent to 1,000 · 10 lessons · 3.NBT.A.2

43. Adding Three-Digit Numbers — `g3a-add`
44. Two Regroupings — `g3a-two-regroup`
45. Subtracting Three-Digit Numbers — `g3a-sub`
46. Regrouping Twice to Subtract — `g3a-sub-two`
47. Across Two Zeros — `g3a-two-zeros`
48. Adding on an Open Number Line — `g3a-open-line`
49. Compensation Strategy — `g3a-compensate`
50. Checking by Adding Back — `g3a-check-inverse`
51. Three-Digit Stories — `g3a-story`
52. Which Strategy Is Fastest? — `g3a-strategy`

## `fractions-deeper-g3` — Fractions: Going Deeper · 14 lessons · 3.NF.A.1, .2, .3

53. Equal Parts, Unequal Parts — `g3f-equal-parts`
54. Naming the Unit Fraction — `g3f-unit-name`
55. Building a/b from 1/b — `g3f-build`
56. Fractions of a Set — `g3f-set-model`
57. Fractions on a Ruler — `g3f-ruler`
58. Marking Thirds on a Line — `g3f-thirds-line`
59. Marking Sixths and Eighths — `g3f-sixths-eighths`
60. Finding Equivalents with a Strip — `g3f-strip-equiv`
61. Equivalents on the Number Line — `g3f-line-equiv`
62. Whole Numbers as Fractions — `g3f-whole-as-fraction`
63. Fractions Equal to One — `g3f-equal-one`
64. Comparing with the Same Whole — `g3f-same-whole`
65. Ordering Three Fractions — `g3f-order-three`
66. Fraction Stories — `g3f-story`

---

# GRADE 4 — 76 lessons

Existing: `fractions-add` (14), `lines-angles` (12), `measure-convert` (15), `multiply-bigger` (14), `place-value-million` (14).

## `decimals-intro-g4` — Decimals: Tenths & Hundredths · 18 lessons · 4.NF.C.5, .6, .7 — **uncovered cluster**

1. Splitting One into Ten — `g4d-tenths-intro` — 4.NF.C.6
2. Writing a Tenth — `g4d-write-tenth` — 4.NF.C.6
3. Tenths on a Number Line — `g4d-tenths-line` — 4.NF.C.6
4. Tenths as Fractions — `g4d-tenths-fraction` — 4.NF.C.6
5. Splitting a Tenth into Ten — `g4d-hundredths-intro` — 4.NF.C.6
6. Writing a Hundredth — `g4d-write-hundredth` — 4.NF.C.6
7. Hundredths on a Grid — `g4d-hundredths-grid` — 4.NF.C.6
8. Tenths to Hundredths — `g4d-tenth-to-hundredth` — 4.NF.C.5
9. Adding Tenths and Hundredths — `g4d-add-tenth-hundredth` — 4.NF.C.5
10. Reading a Decimal Aloud — `g4d-read-decimal` — 4.NF.C.6
11. Decimal Place Names — `g4d-place-names` — 4.NF.C.6
12. Fraction to Decimal — `g4d-fraction-to-decimal` — 4.NF.C.6
13. Decimal to Fraction — `g4d-decimal-to-fraction` — 4.NF.C.6
14. Comparing Two Decimals — `g4d-compare` — 4.NF.C.7
15. The Trailing Zero — `g4d-trailing-zero` — 4.NF.C.7
16. Ordering Decimals — `g4d-order` — 4.NF.C.7
17. Decimals and Money — `g4d-money` — 4.MD.A.2
18. Decimals in Measurement — `g4d-measurement` — 4.MD.A.2

## `mult-div-fluency-g4` — Multi-Digit Multiplication & Division · 16 lessons · 4.NBT.B.5, .6

19. Multiplying by 10, 100, 1000 — `g4m-powers-ten`
20. Partial Products with an Area Model — `g4m-area-model`
21. Four-Digit by One-Digit — `g4m-4x1`
22. Regrouping in Multiplication — `g4m-regroup`
23. Two-Digit by Two-Digit: Area Model — `g4m-2x2-area`
24. Two-Digit by Two-Digit: Partial Products — `g4m-2x2-partial`
25. Estimating a Product — `g4m-estimate-product`
26. Checking a Product — `g4m-check-product`
27. Dividing with Place Value — `g4m-div-place`
28. Partial Quotients — `g4m-partial-quotient`
29. Three-Digit by One-Digit — `g4m-3div1`
30. Four-Digit by One-Digit — `g4m-4div1`
31. Remainders in Division — `g4m-remainder`
32. What to Do with the Remainder — `g4m-interpret-remainder`
33. Estimating a Quotient — `g4m-estimate-quotient`
34. Checking a Quotient — `g4m-check-quotient`

## `fraction-multiply-g4` — Fractions Times Whole Numbers · 12 lessons · 4.NF.B.4

35. A Fraction Added Again and Again — `g4x-repeated`
36. Writing It as Multiplication — `g4x-as-mult`
37. Multiples of a Unit Fraction — `g4x-unit-multiples`
38. n × a/b — `g4x-general`
39. On the Number Line — `g4x-line-model`
40. Using an Area Model — `g4x-area-model`
41. Products Greater Than One — `g4x-past-one`
42. Writing the Answer as a Mixed Number — `g4x-mixed-answer`
43. Word Problems: Equal Groups — `g4x-equal-groups`
44. Word Problems: Recipes — `g4x-recipe`
45. Word Problems: Distance — `g4x-distance`
46. Estimating a Fraction Product — `g4x-estimate`

## `measure-problems-g4` — Measurement Word Problems · 12 lessons · 4.MD.A.1, .2

47. Bigger Unit, Smaller Number — `g4v-unit-size`
48. Building a Conversion Table — `g4v-table`
49. Converting Length — `g4v-length`
50. Converting Mass and Weight — `g4v-mass`
51. Converting Liquid Volume — `g4v-volume`
52. Converting Time — `g4v-time`
53. Distance Problems — `g4v-distance`
54. Time Interval Problems — `g4v-interval`
55. Money Problems — `g4v-money`
56. Problems with Fractions of a Unit — `g4v-fraction-unit`
57. Multi-Step Measurement — `g4v-multistep`
58. Diagrams for Measurement Problems — `g4v-diagram`

## `patterns-factors-g4` — Patterns, Factors & Multiples · 10 lessons · 4.OA.B.4, 4.OA.C.5

59. Finding All Factor Pairs — `g4pf-factor-pairs`
60. Is It a Factor? — `g4pf-is-factor`
61. Listing Multiples — `g4pf-multiples`
62. Is It a Multiple? — `g4pf-is-multiple`
63. Prime or Composite? — `g4pf-prime-composite`
64. The Sieve — `g4pf-sieve`
65. Number Patterns from a Rule — `g4pf-number-rule`
66. Shape Patterns from a Rule — `g4pf-shape-rule`
67. Features Not in the Rule — `g4pf-hidden-feature`
68. Extending and Explaining — `g4pf-extend`

## `multistep-g4` — Multi-Step Problems · 8 lessons · 4.OA.A.3

69. Two Operations, One Story — `g4ms-two-ops`
70. Three Operations — `g4ms-three-ops`
71. Multiplicative Comparison Stories — `g4ms-comparison`
72. Problems with Remainders — `g4ms-remainder`
73. Writing Equations with a Letter — `g4ms-variable`
74. Estimating to Check — `g4ms-estimate`
75. Rounding to Assess Reasonableness — `g4ms-reasonable`
76. Explaining Your Plan — `g4ms-explain`

---

# GRADE 5 — 68 lessons

Existing: `coordinate-geometry` (10), `decimal-operations` (15), `decimals-place-value` (12), `fractions-multiply` (13), `volume-measurement` (12).

## `unlike-fractions-g5` — Adding & Subtracting Unlike Fractions · 14 lessons · 5.NF.A.1, .2

1. Why You Need the Same Pieces — `g5u-why-common`
2. Finding a Common Denominator — `g5u-find-common`
3. The Least Common Denominator — `g5u-lcd`
4. Renaming Both Fractions — `g5u-rename`
5. Adding Unlike Fractions — `g5u-add`
6. Subtracting Unlike Fractions — `g5u-sub`
7. Adding Mixed Numbers — `g5u-add-mixed`
8. Subtracting Mixed Numbers — `g5u-sub-mixed`
9. Regrouping to Subtract — `g5u-regroup`
10. Simplifying the Answer — `g5u-simplify`
11. Benchmark Estimation — `g5u-benchmark`
12. Is the Answer Reasonable? — `g5u-reasonable`
13. Fraction Word Problems — `g5u-story`
14. Multi-Step Fraction Problems — `g5u-multistep`

## `fraction-division-g5` — Fractions as Division · 12 lessons · 5.NF.B.3, 5.NF.B.7

15. Sharing That Doesn't Come Out Even — `g5fd-uneven-share`
16. a ÷ b = a/b — `g5fd-as-fraction`
17. Interpreting the Quotient — `g5fd-interpret`
18. Sharing Problems — `g5fd-share-story`
19. Dividing a Unit Fraction by a Whole Number — `g5fd-unit-by-whole`
20. Dividing a Whole Number by a Unit Fraction — `g5fd-whole-by-unit`
21. Using a Visual Model — `g5fd-visual`
22. On the Number Line — `g5fd-line`
23. Checking with Multiplication — `g5fd-check`
24. Which Is It? — `g5fd-choose`
25. Division Word Problems — `g5fd-story`
26. Estimating a Quotient — `g5fd-estimate`

## `decimal-fluency-g5` — Decimal Operations Fluency · 16 lessons · 5.NBT.B.7

27. Adding Decimals with a Model — `g5dc-add-model`
28. Lining Up the Decimal Point — `g5dc-align`
29. Adding with Different Lengths — `g5dc-add-ragged`
30. Subtracting Decimals — `g5dc-sub`
31. Subtracting with Padding — `g5dc-pad`
32. Multiplying a Decimal by a Whole Number — `g5dc-mult-whole`
33. Estimating a Decimal Product — `g5dc-estimate-product`
34. Multiplying Two Decimals — `g5dc-mult-decimal`
35. Where Does the Point Go? — `g5dc-place-point`
36. Dividing a Decimal by a Whole Number — `g5dc-div-whole`
37. Dividing by a Decimal — `g5dc-div-decimal`
38. Moving the Point to Divide — `g5dc-shift`
39. Checking a Decimal Answer — `g5dc-check`
40. Money Problems — `g5dc-money`
41. Measurement Problems — `g5dc-measurement`
42. Multi-Step Decimal Problems — `g5dc-multistep`

## `expressions-patterns-g5` — Expressions & Patterns · 12 lessons · 5.OA.A.1, .2, 5.OA.B.3

43. Order of Operations — `g5e-order`
44. Parentheses First — `g5e-parentheses`
45. Brackets and Braces — `g5e-brackets`
46. Evaluating a Long Expression — `g5e-evaluate`
47. Writing an Expression from Words — `g5e-write`
48. Reading an Expression Aloud — `g5e-read`
49. Comparing Expressions Without Computing — `g5e-compare`
50. Two Rules at Once — `g5e-two-rules`
51. Making Ordered Pairs — `g5e-ordered-pairs`
52. Graphing the Pattern — `g5e-graph`
53. Finding the Relationship — `g5e-relationship`
54. Explaining Why the Pattern Holds — `g5e-explain`

## `volume-problems-g5` — Volume Problems · 8 lessons · 5.MD.C.3, .4, .5

55. Counting Unit Cubes — `g5v-count-cubes`
56. Layers and Height — `g5v-layers`
57. Using V = l × w × h — `g5v-formula-lwh`
58. Using V = B × h — `g5v-formula-bh`
59. Finding a Missing Dimension — `g5v-missing-dim`
60. Composite Solids — `g5v-composite`
61. Volume Word Problems — `g5v-story`
62. Comparing Two Solids — `g5v-compare`

## `long-division-g5` — Two-Digit Divisors · 6 lessons · 5.NBT.B.6

63. Estimating with Compatible Numbers — `g5ld-compatible`
64. Dividing by a Multiple of Ten — `g5ld-mult-ten`
65. Partial Quotients — `g5ld-partial`
66. The Standard Algorithm — `g5ld-standard`
67. Adjusting a Too-Big Guess — `g5ld-adjust`
68. Checking and Interpreting — `g5ld-check`

---

## Widget reuse — no new engines required

Every lesson above is servable by the existing registry. The mapping that matters:

| Cluster | Primary widget | Already used by |
|---|---|---|
| K counting, cardinality | `tenFrame`, `subitizeFlash` | `kc-01-01` |
| K–2 place value | base-ten composition | `tens-and-ones`, `place-value-1000` |
| 1–2 data | picture/bar graph, line plot | `measure-money-time` |
| 1–2 number line | dynamic number line | `counting-120` |
| 3 fact fluency | `mcq` + timed recall | `multiplication-division` |
| 3–5 fractions | fraction model, number line | `fractions`, `fractions-add` |
| 4 decimals | hundredths grid, place-value ladder | `decimals-place-value` (G5) |
| 4–5 multi-digit | `columnCalc`, area model | `multiply-bigger`, `decimal-operations` |
| 5 volume | unit-cube stack | `volume-measurement` |

The one engine worth building rather than reusing: a **hundredths grid** for `decimals-intro-g4`.
Grade 5's ladder widget assumes symbolic place value; Grade 4 needs the 10×10 area model that
makes 0.3 = 0.30 visible. Everything else is parameterization.

## Build order

1. **`decimals-intro-g4`** (18) — the most consequential single gap; an entire tested cluster.
2. **`counting-to-100-k`** (18) — the most-assessed K standard, currently absent.
3. **`data-graphs-g1`** (12) — the only wholly missing domain-cluster in Grade 1.
4. **`mult-fluency-g3` + `division-fluency-g3`** (30) — highest-leverage for downstream grades.
5. Remaining K courses (100) — turns the thinnest grade into the deepest.
6. Everything else, largest gap first.

## What this does not fix

Volume is not evidence. Adding 490 lessons closes the **standards-coverage** argument against
IXL and Khan; it does not touch the **efficacy** argument against DreamBox, Zearn or MATHia. It
does, however, make an efficacy study possible: a K–5 sequence with full standards coverage and
per-step mastery telemetry is the minimum viable object to run a study *on*.
