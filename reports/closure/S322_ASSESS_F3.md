# S322-F3 Independent Assessment — shapes-and-sorting-k, shapes-shares-g2, four-addends-g2

Reviewer: Claude Cowork independent assessor (S322)
Basis: `scripts/session/print-review-basis.mjs` (current source hashes, computed live)
Staging (append-only, incremental): `reports/closure/cowork-staging/laneB-s322-F3-dispositions.jsonl` (26 records)
Note: the prior packet's `laneB-s321-F3-dispositions.jsonl` was truncated/abandoned and was **not** read, edited, or relied upon. This is a fresh review starting from the S322 file above.

No npm/vitest/tsc were run; this is a read-only content/logic review against the repository source.

## Per-course counts

| Course | Lessons | KEEP | REVISE |
|---|---|---|---|
| shapes-and-sorting-k | 9 | 5 | 4 |
| shapes-shares-g2 | 9 | 9 | 0 |
| four-addends-g2 | 8 | 5 | 3 |
| **Total** | **26** | **19** | **7** |

## REVISE list (one-phrase reasons)

- **ks-01-03** — challenge hints describe an unrelated square/circle/triangle two-clue puzzle, not the actual tree/bird/rabbit/kite dragBucket widget.
- **ks-02-01** — challenge hints and explanationVariants assert the answer is "sphere" (an orange), directly contradicting the widget's correct answer "cone."
- **ks-02-03** — challenge hints describe an unrelated "two squares → 4 triangles" computation not present in the actual 3-square-row dragBucket widget.
- **ks-03-03** — challenge hints/explanationVariants describe an unrelated circle/square/triangle counting task, not the actual apple/car sort-by-rule matchPairs widget.
- **g2n-01-02** — k3 mcq widget is byte-identical to g2n-01-01/k3 (duplicate within the same course).
- **g2n-02-03** — k3 mcq widget is byte-identical to g2n-01-01/k3 (duplicate within the same course).
- **g2n-03-02** — k3 mcq widget is byte-identical to g2n-01-01/k3 (duplicate within the same course).

(g2n-01-01 is the original/first occurrence of the duplicated k3 mcq and is signed KEEP; see its rationale for the cross-reference.)

## Method

- Every lesson file was read in full (steps, widgets, hints, explanationVariants, remedials) and cross-checked against its `course.json`.
- Math was recomputed by hand for every numeric/mcq/widget target across all 26 lessons (shape side/face/edge/vertex counts, grid row×column totals, fraction-of-a-whole comparisons, staged multi-addend sums, friendly-ten pairs, and split-by-place sums).
- Byte-identical duplicate scan: automated (Python, sha1 of each step's widget JSON) across all three courses' lesson files — found exactly one duplicate cluster (four-addends-g2, k3 mcq reused in 4 lessons); zero duplicates in shapes-and-sorting-k or shapes-shares-g2.
- Structural/near-duplicate and hint↔widget consistency: manual, lesson-by-lesson — found four ks-course "challenge" steps where hints/explanationVariants describe a scenario that does not match the actual widget content (one of which, ks-02-01, points to the wrong final answer).
- Option parity, misconception-named feedback, reasoning-before-reveal (predict/reveal), K/G2 read-aloud language, and accessibility (icon+label hotspots, no color-only cues) were checked per lesson; no defects found beyond the seven listed above.
- QUESTION_DIVERSITY: evaluated transfer diversity for shapes-and-sorting-k's named open rows. Widget-type reuse with varied context/numbers (e.g. repeated `lengthCompare`, `tapDiagram`, `numeric` engines) is the norm across this entire curriculum (also seen in shapes-shares-g2 and four-addends-g2) and was not treated as a defect on its own; only lessons with a concrete, verifiable content mismatch were signed REVISE.

## REVISE contracts (concrete)

1. **ks-01-03** (`content/courses/shapes-and-sorting-k/lessons/ks-01-03.json`, step `ch1`): replace the three `hints` strings — currently about a square/circle/triangle two-clue puzzle — with hints that scaffold the actual bird/rabbit/kite-vs-tree dragBucket task, e.g. "Read the clue: is it on top, under, or next to the tree?"
2. **ks-02-01** (`.../ks-02-01.json`, step `ch1`): rewrite both `hints` and `explanationVariants` — currently asserting "an orange... a sphere" — to reason toward the widget's correct answer "cone" (round bottom + one point), e.g. "It has one pointy end, not round all over — that rules out a ball."
3. **ks-02-03** (`.../ks-02-03.json`, step `ch1`): replace the three `hints` strings — currently a "two squares → 4 triangles" computation — with hints matching the actual triangles→square / 3-squares→rectangle / 6-squares→cube matches.
4. **ks-03-03** (`.../ks-03-03.json`, step `ch1`): replace `hints`/`explanationVariants` — currently a circle/square/triangle counting scenario — with ones scaffolding the actual color-vs-kind sorting-rule task (red apple → red group by color; → food group by kind).
5. **g2n-01-02, g2n-02-03, g2n-03-02** (each lesson's step `k3`): replace the byte-identical "(17+3)+25" regrouping mcq with a fresh item using different addends/order, ideally themed to each lesson's own strategy (place-split, running-total, or forward/backward-check respectively) so no two lessons in the course share an identical check.

## Raw data

Full per-lesson dispositions (recordId, hash, decision, visualDecision, gradeLanguageDecision, rationale, evidenceRefs) are in `reports/closure/cowork-staging/laneB-s322-F3-dispositions.jsonl` — 26 records, one per lesson, all with `evidenceRefs` pointing to the lesson file and its `course.json`, and `reopenCondition`: "Lesson or course source bytes change (review basis hash drift)."
