# S323 Fix Packet P5 — implementation evidence

Fixer: cowork-s323-P5-fixer. Date: 2026-08-21.
Scope: 7 shapes-space lessons (narration authoring), 4 shapes-and-sorting-k lessons (ch1 hint/explanation repair), 6 length-problems-g2 lessons (duplicate-check replacement + commonError trigger fix + choice-surface repair).
Contracts: PREMIUM_PENDING_WORKLOAD_QUEUE.csv rows for each lesson id; reports/closure/S322_ASSESS_F11.md, S322_ASSESS_F3.md, S322_ASSESS_F5.md per-lesson sections; S316_ADJUDICATION_REMEDIAL_STANDARD.md.
Edits confined to content/courses/{shapes-space,shapes-and-sorting-k,length-problems-g2}/lessons/. No src/**, scripts/**, or ledger edits.

## ks-01-03 (S322-F3-ks-01-03)

Defect: ch1 hints AND explanationVariants described a square/circle/triangle two-clue puzzle that exists nowhere in the widget (a bird/rabbit/kite vs. a tree dragBucket).

Before (hints):
- "Read the first clue: something is above the square."
- "The second clue says the SAME shape is beside the circle."
- "The triangle fits both clues."

Before (explanationVariants):
- "Above the square and beside the circle — only the triangle sits in both places."
- "Check both clues: over the square AND next to the circle: the triangle."

After (hints):
- "Read the clue: is the friend on top of, under, or next to the tree?"
- "On top means above. Under means below."
- "Next to means beside."

After (explanationVariants):
- "The bird is on top of the tree, so it is above. The rabbit is under, so it is below. The kite is next to, so it is beside."
- "Each place word names one spot: on top means above, under means below, next to means beside."

Note: the F3 contract names only `hints`; the explanationVariants carried the identical mismatched-scenario defect (same nonexistent puzzle) and were repaired with it — same defect class, same step, per the F3 defect definition ("hints/explanationVariants describe a scenario that does not match the actual widget content").
Note (EXCELLENCE-ks-01-03 queue row): S322-F3 explicitly adjudicated the QUESTION_DIVERSITY/OPEN_REPRESENTATION_NOVELTY class for these named ks rows — "widget-type reuse with varied context/numbers ... was not treated as a defect on its own; only lessons with a concrete, verifiable content mismatch were signed REVISE." The binding S322 contract for this lesson is the hint repair only; no novel challenge step was invented.

reviewBasisHash after fix: 2bb5c4a9ec2596dec0ce25c66b55c37b903d7f87ae07a62f15f4e307e0d53d97

## ks-02-01 (S322-F3-ks-02-01)

Defect: ch1 hints and explanationVariants asserted the answer "sphere" (orange/ball reasoning) while the mcq's correct option and successFeedback are "cone."

Before (hints): "Turn the orange in your mind. Any flat sides?" / "It is round every way — like a ball." / "Ball-shaped solids are spheres."
Before (explanationVariants): "An orange is round all over like a ball — a sphere." / "Round every way you turn it: sphere."

After (hints): "Turn the shape in your mind. Does it have a point?" / "It has one pointy end, so it is not round all over — that rules out a ball." / "A round bottom and one point make a cone."
After (explanationVariants): "It has one pointy end and a round bottom — that is a cone." / "A cone keeps its point and its round bottom, even lying on its side."

Note (EXCELLENCE-ks-02-01 queue row): adjudicated non-defect by S322-F3 (see ks-01-03 note); no extra challenge authoring invented.

reviewBasisHash after fix: 1a2d68ca44b28710bd31b762d3e79ab657e1e1770759ce522c27e2c2c233c56d

## ks-02-03 (S322-F3-ks-02-03)

Defect: ch1 hints (and explanationVariants) described a "two squares → 4 triangles" computation appearing nowhere in the widget; the actual items are 2 triangles→square, THREE squares in a row→rectangle, 6 squares→cube.

Before (hints): "One square uses 2 triangles." / "Two squares means 2 triangles, twice." / "2 and 2 make 4 triangles."
Before (explanationVariants): "A square needs 2 triangles; a rectangle of two squares needs 4 triangles — 2 for each square." / "Each square takes 2 triangles: two squares take 4."

After (hints): "Two triangles can fit together into one square." / "Squares in a row make a longer shape — a rectangle." / "Six flat squares fold up into a box — a cube."
After (explanationVariants): "Two triangles make a square, three squares in a row make a rectangle, and six squares fold into a cube." / "Small shapes build big ones: triangles join into a square, a row of squares grows into a rectangle, six squares wrap into a cube."

Note: F3 contract names hints; the explanationVariants asserted the same nonexistent two-square build and were repaired as the same defect. EXCELLENCE-ks-02-03 queue row: adjudicated non-defect by S322-F3 (see ks-01-03 note).

reviewBasisHash after fix: 737a6e7c95ab88a68f114905eb5397eb0bbdacc9ebd92d0af79edd02ffbb291a

## ks-03-03 (S322-F3-ks-03-03)

Defect: ch1 hints/explanationVariants described a shape-counting task ("Circles: 3. Squares: 4. Triangles: 2. ... 4 squares") that appears nowhere in the actual color-vs-kind sorting-rule matchPairs widget.

Before (hints): "Count each group first." / "Circles: 3. Squares: 4. Triangles: 2." / "The biggest count wins — 4 squares."
Before (explanationVariants): "Count each group: 3 circles, 4 squares, 2 triangles. 4 is the most — squares win." / "Compare the counts 3, 4, 2 — the squares' 4 is biggest."

After (hints): "Read the rule first: is it color or kind?" / "A red apple sorted by color goes with red things." / "Sorted by kind, the apple goes with food and the car goes with things that drive."
After (explanationVariants): "The rule picks the group: by color the red apple goes with red things; by kind it goes with food." / "Same apple, new rule, new group — color puts it with red, kind puts it with food, and the car by kind goes with things that drive."

reviewBasisHash after fix: 938135869af0058374bf065e4b8c20c117e512600bb73473235cc82d44d80520

## g2p-01-02 (S322-F5-g2p-01-02; queue LESSON-REVISION-g2p-01-02)

Defect: k3 "shortest of four items" mcq (straw at 6 in) reused the identical ribbon/shoelace/bookmark/straw option-and-feedback template of g2p-01-01/k3 (straw at 7 in) — a later, template-duplicate check. Contract (F5): "Replace with a different comparison job (e.g. 'which is closest to 12 inches?')."

Before (k3 widget prompt): "The ribbon is 8 inches. The shoelace is 10 inches. The bookmark is 16 inches. The straw is 6 inches. Which is the shortest?" (options straw*/ribbon/shoelace/bookmark, feedback strings byte-matching g2p-01-01/k3's template).

After (k3 widget prompt): "Maggie lays each item beside her 12-inch ruler. The spoon is 5 inches. The notebook is 9 inches. The scarf is 14 inches. The belt is 20 inches. Which item is closest to 12 inches long?" — answer scarf (gap 14−12=2); distractor feedback computes each gap (spoon 7, notebook 3, belt 8). Recomputed: |5−12|=7, |9−12|=3, |14−12|=2, |20−12|=8 → scarf uniquely correct. New job (gap-to-a-benchmark, not extreme-finding) is digit-normalized distinct from k1, the remedial check, and g2p-01-01/k3; option ids o0–o3 preserved; mcq renders through seededShuffle (no answer adjacency).

Deviations, both necessary and logged:
- k3 `explanationVariants` ("Shortest works the same way." / "The other extreme.") named the removed job and would have become an F3-class explanation↔widget mismatch; minimally rewritten to "Find each item's gap from 12 inches." / "The smallest gap wins — 14 is only 2 away."
- k3 `variant` (gen g2-measure-money-time, form MmtLengthCompareMcq) removed: the generator emits only fixed-prompt 3-item longest/shortest items (src/lib/g2Variants.ts:57) and cannot produce the new content — generator debt, per the S318_PROG_P0_IMPLEMENTATION VARIANT_LOG convention. This also satisfies the S316-R "not producible by the declared variant generator" bar.

reviewBasisHash after fix: 7d909c0e4866fd9059af2d61e320463d0a6cac9211e80cbf85eb68e15d077708

## g2p-02-01 (S322-F5-g2p-02-01; queue LESSON-REVISION-g2p-02-01, PROGRESSION-g2p-02-01)

Defect: k2's numeric commonError for "26 + 32 = ?" (answer 58) listed trap value 62 with feedback "That found how much longer one piece is — joining end to end ADDS the lengths." 62 is not the difference (32−26=6), so the trap value contradicted its own misconception feedback. Siblings k1 (trap 12 = 25−13) and ch1 (trap 2 = 25−23) already use the true difference.

Before (k2 commonErrors[0]): {"value": 62, "feedback": "That found how much longer one piece is — joining end to end ADDS the lengths."}
After (k2 commonErrors[0]): {"value": 6, "feedback": unchanged}

Recomputed: 26+32=58 (answer, unchanged); 32−26=6 (subtract-instead-of-add trap, now correct); 68 phantom-ten trap unchanged and still plausible (26+32 with a stray +10).

PROGRESSION-g2p-02-01 (number-normalized-prompts=[k2,ch1]): closed on the queue row's first offered path ("Assign question jobs and approve a fluency/retrieval rationale"). Question jobs: k1 = first guided rep of join-means-add (25+13); k2 = same-template fluency rep whose job is order-free joining (its explanationVariants: "Order of joining is free."); ch1 = delayed retrieval capstone ("One more, for the road."). All three carry the same two misconception traps (true-difference, phantom-ten) by design — this is retrieval practice of one representation, the pattern S322-F5 scanned and deliberately did not flag (its only findings on this lesson were the k2 trigger value and this lesson being the ORIGINAL of templates duplicated later). Redesigning k2/ch1 would violate the binding F5 contract ("Do not touch any other step"). The cross-lesson byte-duplicate of ch1 is fixed at the later occurrence (g2p-03-02/ch1, below).

reviewBasisHash after fix: 8f3290059c34bd529368152e83a152939872fe37dd67f5b61892c524c8d840df

## g2p-03-01 (S322-F5-g2p-03-01; queue LESSON-REVISION-g2p-03-01)

Defect: k1's "mystery piece" bar mcq (prompt, options, feedback) was byte-identical to g2p-02-03/k3 — "A drawing shows two bars: a 40 cm bar, and under it a 25 cm bar plus a mystery piece reaching the same end." (40−25=15). Zero fresh value at this later occurrence.

After (k1 prompt): "A drawing shows a 60 cm bar. Under it, a 24 cm bar and a 16 cm bar sit end to end, plus a mystery piece reaching the same end. What is the mystery piece?" — correct option "The missing length: 60 − 24 − 16 = 20 cm"; distractors: the stack-everything total (100), the two-known-parts-only trap (40), and "cannot be found from a drawing". Recomputed: 24+16=40; 60−40=20; overshoot claim in no option contradicts the drawing. New item adds a two-step constraint (two known parts, not one), so its digit-normalized prompt template (three numbers, end-to-end lower row) differs from g2p-02-03/k3 (two numbers) and from this lesson's k3 (stacked-sum total job, "two bars placed end to end ... total length"), k2, and ch1. No variant key was present on k1; option ids o0–o3 preserved; mcq renders via seededShuffle. Correct-option label 40 chars vs distractors 32/34/33 — no length leak.

reviewBasisHash after fix: a51eaf81d605871b35ac261308bb139c343d9c9d784ab57cf9a92e93b8f70f48

## g2p-03-02 (S322-F5-g2p-03-02; queue LESSON-REVISION-g2p-03-02, PROGRESSION-g2p-03-02)

Defect 1: k1's "To show a 34 cm piece joined to a 20 cm piece on a number line, what is the drawing?" mcq was byte-identical to g2p-02-01/k3.
After (k1): "Maggie joins a 45 cm ribbon and a 30 cm ribbon. Which number-line drawing shows the join?" — correct "Jump 45, then 30 more, to land on 75" (45+30=75 recomputed); distractors: position-dots, back-jump (feedback shows 45−30=15), dropped-second-piece. Prompt wording and every option/feedback string rewritten, so neither byte-wise nor digit-normalized equal to g2p-02-01/k3; option label lengths 36/43/28/31 — no correct-length leak; ids o0–o3 kept; no variant key was present.

Defect 2: ch1's "25 + 23 = ?" numeric (answer 48, traps 2/58) was byte-identical to g2p-02-01/ch1.
After (ch1): "26 + 21 = ? (the two ribbon pieces joined end to end, in cm)" — answer 47; traps recomputed to the same misconception shapes: 5 (=26−21, subtract-instead-of-add) and 57 (=47+10, phantom ten). successFeedback updated to 47. 26+21 appears in no other lesson in the course (grepped). Variant (Add2DigitNumeric: "{a} + {c} = ?", a∈[21,79], c∈[12,69]) still produces this content — variant key retained.

PROGRESSION-g2p-03-02 (number-normalized-prompts=[ch1], repeating k2's "# + # = ? ... joined end to end" template): closed on the fluency/retrieval-rationale path — k2 (26+12=38) is the lesson's fluency rep of join-means-add in symbols; ch1 is the delayed retrieval capstone ("One more, for the road.") intentionally re-running the representation with fresh operands; both carry the same two diagnostic traps by design. The binding F5 contract for this lesson prescribes exactly an operand change for ch1, not a redesign.

reviewBasisHash after fix: 170f093112711c606570488c65f163ed2121420d8887ec224950c161d76c9bc8

## g2p-03-03 (S322-F5-g2p-03-03; queue LESSON-REVISION-g2p-03-03, PROGRESSION-g2p-03-03)

Defect: k3's sense-check mcq ("pencil measured from the 3 cm mark to the 11 cm mark is 14 cm long. Reasonable?") was byte-identical (prompt, options, feedback) to g2p-02-02/k3.

After (k3 prompt): "A crayon lies from the 4 cm mark to the 9 cm mark on a ruler. Maggie writes 13 cm for its length. Does that make sense?" — correct "Too long — the span from 4 to 9 is 5 cm" (9−4=5 recomputed; 13=4+9 is the added-the-marks misconception, same shape as the original); distractors rewritten: closeness-to-endpoint trap, end-mark-read-as-length trap, cannot-tell trap. All option and feedback strings fresh, prompt wording changed (crayon/writes/make sense vs pencil/computes/Reasonable), so the item is neither byte-wise nor digit-normalized equal to g2p-02-02/k3 and matches no other step template in this lesson. Option label lengths 40/33/42/31 — no correct-length leak; ids o0–o3 kept; no variant key was present.

PROGRESSION-g2p-03-03 (number-normalized-prompts=[k2,ch1], repeating k1's "had # cm, used # cm, bought # more" two-step template): closed on the fluency/retrieval-rationale path — k1 = first independent rep (60−31+20=49), k2 = fluency rep with new numbers (70−22+30=78), ch1 = delayed retrieval capstone (60−22+30=68); the repeated two-step story IS this lesson's teaching object (c1/i1/c2/i2 all build it), each rep recomputed correct by S322-F5, which scanned these and flagged only the k3 byte-duplicate. Redesigning k2/ch1 would violate the binding F5 contract ("Do not touch any other step").

reviewBasisHash after fix: d1be28b02b93c2c04dab8d588f856c3fc87ae32020e484105cb5f4347f7e16ce

## g2p-03-04 (S322-F5-g2p-03-04; queue LESSON-REVISION-g2p-03-04, CHOICE-0036, CHOICE-0037)

Defect 1 (LESSON-REVISION + CHOICE-0036, step k1): the mcq "Two trail legs of 32 m and 25 m give a computed total of 30 m. Reasonable?" was byte-identical to g2p-01-03/k3, AND its correct option "No because 30 is less than the 32 m part" was both the lone option with a justification and the only option carrying a unit (distractors: "Reasonable — totals vary" / "Reasonable if the legs overlap" / "Only a ruler could tell").

After (k1): "Maggie computes that a 52 m rope is 61 m longer than a 35 m rope. Reasonable?" — a DIFFERENCE-reasonableness job (the claimed gap 61 exceeds the longer rope 52; true gap 52−35=17), which exercises this lesson's own i1 visual ("the 'computed gap' towers over the item it should fit inside") and hint 3 ("Gaps fit inside the longer."). Options: "No — the gap must fit inside the longer 52 m rope" (correct), "No — the gap should be exactly 87 m" (added-instead-of-subtracted), "Yes — 61 m is more, and longer means more" (more-means-any-number), "Yes — any gap can sit between two ropes" (gap-unconstrained). Every option carries a justification; units appear in three of four options; 2 Yes / 2 No; label lengths 49/35/41/39 — no writing clue. Recomputed: 52−35=17; 52+35=87. Digit-normalized template (rope/longer-than framing) distinct from g2p-01-03/k3, from this lesson's k3 (total-check framing), and from every other step. No variant key was present; ids o0–o3 kept.

Defect 2 (CHOICE-0037, step k3): correct option label "Yes — 42 m is more than either part, and 18 + 24 checks out to exactly 42" was 73 chars vs longest distractor 48 — a length writing clue.
After: label shortened to "Yes — 18 + 24 is exactly 42, more than either leg" (49 chars; distractors 47/44/48). Prompt, distractor labels, all feedback, and the answer key unchanged — the item stays the defensible original (18+24=42 is exactly right and exceeds both parts).

reviewBasisHash after fix: 1d616d7fc25ec0aec3fb824bd74f2ba343d633f096573ce8242dc24638600646

## shapes-space course (S322-F11, lessons geo-01-01 … geo-03-02)

Course-wide defect (all 7 lessons, single root cause): zero `narration` fields on any concept step — the only grade-≤5 course in the repo without them — while `narrationFor()` (src/lib/speech.ts) falls back to `body`, whose markdown emphasis (`**…**`) is not stripped by `speakableMath()`, so a pre-reader on the audio channel would hear literal asterisks. Contract (F11): author a `narration` string on every concept step (c1, c2, and each remedial's concept), spoken-safe, markdown removed, per speakableMath() conventions; change no other field.

Implementation (applies to every lesson below): narration = the step's body content rewritten spoken-safe — markdown emphasis markers removed; em-dashes, hyphens, and arrows eliminated (speakableMath maps EVERY dash character to the word "minus", so "6-by-3" is written "6 by 3", "yes/no" as "yes or no", "1/4"/"3/4" as "one fourth"/"three fourths"); quotes and glyph-free punctuation kept; numerals left plain where they read correctly. Insertion is mechanical (script, narration key added directly after body; per-file JSON indent detected and preserved; pre-edit round-trip asserted byte-identical) so each diff is narration-lines-only. A scripted assertion verifies no narration string contains `*`, `_`, `—`, `–`, `-`, or `→`.

Example before/after (geo-01-01 c1):
- body (unchanged): "Every shape is a members-only club with **entry rules**. … Meet the rules, you're in — no matter your color or size. Those rules are the shape's **defining attributes**."
- narration (new): "Every shape is a club with entry rules. A triangle's rules: three straight sides, three corners, closed all the way around. Meet the rules and you are in, no matter your color or size. Those rules are the shape's defining attributes."

Note: S322-F11 flagged a course.json grade-label question (packet said "K", course.json says gradeLevel 3) — narration text here follows the on-record gradeLevel 3 register, same as the body prose it mirrors; no course.json change was contracted and none was made.

### geo-01-01
Narration added to c1, c2, rem0 (3 blocks). reviewBasisHash: 2174ae2b25bf39075ec88529043a681496fd83a26e9ad1b82400730369e01610

### geo-01-02
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: a8c2aa06cbaa31c056e0c9918c0e013e461b273817295c7c4d842d8f8ca1de8b

### geo-01-03
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: 399da80babe0399d52fcc7c7bd433e178fd3d6c0956d5c7f612c50155b933f7b

### geo-02-01
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: a12c8fa6de1d5e05bf33968ef495cefee63957a7247eae421fa0187b2589f8e1

### geo-02-02
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: a028f61eac4fb1c1b99ba5fb011fe6fde82b0d5de8ebe941a421cfd84fbc994e

### geo-03-01
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: 6b5311d48a42b83b5bb5d95c5fff6d913058cd47e05d7b00f67cf05108417cf5

### geo-03-02
Narration added to c1, c2, rem0 (3 blocks; diff is narration-lines-only, verified via git diff --stat: 4 insertions, 1 comma-line change). reviewBasisHash: d44da83b008a4e8f2e69ba8cd4291e519a7810b697fe1583132d4ecbb88c055f

