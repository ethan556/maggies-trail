# S319 Independent Assessment — similarity & geometry-foundations

Reviewer: Claude Cowork independent assessor (S319)
Reviewed at: 2026-08-20T12:34:45.000Z
Prefix obeyed: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (MT-V4-WORKER-PREFIX-1), read byte-for-byte before work began. Its authority/scope/quality-invariant rules governed this review; its "Return contract" section (packet_id/base_commit/contract_hash/...) describes the format for *implementation-worker* packets that change owned files under a scope contract, and does not apply to this independent-assessor deliverable — the assessor task's own explicit instructions (NDJSON per-lesson dispositions, this report, and the counts/list/raw-data reply below) are the return contract actually followed. The repository source (lesson JSON + course.json) is the sole authority used for every verdict below; no cache entry was treated as curriculum, approval, or a pre-existing closure verdict.

Method: read both `course.json` files and all 31 lesson JSON files in full (content/courses/similarity, content/courses/geometry-foundations). Recomputed by hand every scale factor, similarity ratio, dilation coordinate map, AA/SAS~/SSS~ application, geometric-mean relationship (h²=pq, leg²=hyp·adjacent), side-splitter/angle-bisector proportion, area/perimeter k-vs-k² scaling, translation/reflection/rotation coordinate rule, and congruence-correspondence claim appearing in every prompt, widget, `commonErrors`, `explanationVariants`, hint, and recap takeaway. Cross-checked referenced `figure` ids against `src/components/figureIds.ts`/`figures.tsx` component source for every figure carrying a specific numeric or geometric claim (`DilationScale`, `GeometricMean`, `SideSplitter`, `SimilarPair`/AA/SAS/SSS, `IndirectMeasurement`, `SyPizza`, `SyDilationOrigin`, `SyPerimAreaScale`, `SyDilationParallel`, and the full set of `Gf*` figures used across geometry-foundations) — independently recomputing coordinates/ratios rather than trusting captions. Inspected the `dilationExplore`/`SideSplitterW`/`AltitudeMeanW` widget source (`src/components/widgets.tsx`) to confirm displayed ratios/altitudes are computed from actual shape geometry (not hard-coded), and independently verified the shape coordinates used in sy-04-01/02/03 and gf-04-03's interactive widgets against their claimed p/q/h or symmetry values. Basis hashes pulled in bulk via `node scripts/session/print-review-basis.mjs` (read-only; no ledger written).

Known-context items applied as instructed: mcq/predict authored option order is a seeded-shuffle-at-render convention only, not a defect; lab-choice widgets are shuffle-fixed per S316 and were not flagged for authored order.

## Course-level decision counts

**similarity** (gradeLevel 10, 16 lessons, chapters ch1–ch6): 14 KEEP / 2 REVISE / 0 ESCALATE.
**geometry-foundations** (gradeLevel 10, 15 lessons, chapters ch1–ch5): 15 KEEP / 0 REVISE / 0 ESCALATE.
**Total: 29 KEEP / 2 REVISE / 0 ESCALATE.**

## REVISE list

- **sy-05-03** (Area & Perimeter Ratios) — one-phrase reasons: (a) i2 numeric widget is a near-verbatim cross-lesson duplicate of sy-01-02/i3 (identical scale-factor-3/area-5/answer-45 problem, no new representation); (b) r1 teaser falsely claims "Course complete!" and previews trigonometry when ch6 (sy-06-01) still follows.
- **sy-06-01** (Dilations and Parallel Lines) — one-phrase reasons: (a) `sy-dilation-parallel` figure's "rays from the center through each endpoint" are not actually collinear with the drawn center/original/image points (recomputed implied k differs between the x- and y-coordinate for both endpoints); (b) r1 teaser points backward at ch5 (indirect measurement, already covered) instead of forward.

## Per-lesson verdict lines

### similarity

| lessonId | decision | visualDecision | gradeLanguageDecision | one-line basis |
|---|---|---|---|---|
| sy-01-01 | KEEP | SUFFICIENT | FIT | Dilation definitions and all numeric checks (k=2 area/angle, k=1.5 scale, coordinate dilation (4,6)→(8,12), reverse-dilation 18÷3=6) recompute correctly; `DilationScale` figure image coordinates are computed programmatically from k=1.5, confirmed correct. |
| sy-01-02 | KEEP | SUFFICIENT | FIT | Similarity-vs-congruence, ratio-table (6:9=2:3→BC=8⇒EF=12), area-scale (k=2⇒×4) and area-ratio-to-side-ratio (√16=4) all recompute correctly; distinct instructional job per step. |
| sy-01-03 | KEEP | SUFFICIENT | FIT | AA criterion logic (180° forces the third angle) and shadow proportion (6/4=h/20⇒h=30) verified; `IndirectMeasurement` figure numbers (6,4,20,h=30) match the prose exactly. |
| sy-02-01 | KEEP | SUFFICIENT | FIT | SAS~ included-angle requirement and proportion solves (12/8=9/x⇒13.5; 4/10=6/AC⇒15) recompute correctly; `SimilarPair` SAS marks match the criterion described. |
| sy-02-02 | KEEP | SUFFICIENT | FIT | SSS~ ratio checks recompute correctly: 3:4:5 vs 6:8:9 correctly rejected (9/5=1.8≠2); 6:9:12 vs 8:12:16 correctly accepted at 4/3. |
| sy-02-03 | KEEP | SUFFICIENT | FIT | Criterion-selection logic and proportion solves (12/8=EF/10⇒15; 6/10=9/AC⇒15) recompute correctly; dragOrder proof-step sequencing is logically sound. |
| sy-03-01 | KEEP | SUFFICIENT | FIT | Side-splitter forward direction and midsegment special case verified; `SideSplitterW` widget computes true Euclidean segment ratios that provably always agree at a shared fraction t, matching the claimed 0.67 readouts. |
| sy-03-02 | KEEP | SUFFICIENT | FIT | Converse (3/6=4/8=1/2⇒parallel), transversal proportional segments (8/6=4/3⇒9×4/3=12), and angle-bisector theorem (8/6=8/DC⇒DC=6) all recompute correctly. |
| sy-03-03 | KEEP | SUFFICIENT | FIT | Mark-to-theorem decision guide is internally consistent; proportion solves (6/15=4/BC⇒10; 4/6=x/9⇒6; 6/4=9/EC⇒6) all recompute correctly. |
| sy-04-01 | KEEP | SUFFICIENT | FIT | Altitude-creates-three-similar-triangles claim verified; `GeometricMean` figure (p=4,q=9,h=6, since 6²=4·9) and the i1 widget's own triangle geometry (right angle confirmed at apex; independently recomputed p=4,q=16,h=8 at targetK=0.2, matching 8²=4·16) both check out. |
| sy-04-02 | KEEP | SUFFICIENT | FIT | Geometric-mean formulas and worked values (√36=6, √225=15) recompute correctly; i2 widget triangle at targetK=0.36 independently recomputed to yield exactly p=9, q=16, h=12 as claimed. |
| sy-04-03 | KEEP | SUFFICIENT | FIT | Multi-step solves (√(4×16)=8; √(15²+20²)=25; √(25×16)=20) recompute correctly; i1 widget triangle at targetK=0.2 independently recomputed to yield p=3, q=12, h=6 as claimed. |
| sy-05-01 | KEEP | SUFFICIENT | FIT | Shadow (5/8=h/32⇒20) and mirror-method (5/2=h/10⇒25) proportions recompute correctly; reuse of the 6-ft/4-ft/20-ft shadow numbers from sy-01-03 introduces a new representation (ratio-table fill-in) rather than a bare repeat, so not flagged as duplication. |
| sy-05-02 | KEEP | SUFFICIENT | FIT | Scale-drawing direction (×50 / ÷50), map scale (7×2=14), and area-vs-length scaling (25×4²=400) all recompute correctly. |
| sy-05-03 | REVISE | SUFFICIENT | FIT | i2 numeric widget duplicates sy-01-02/i3 verbatim (scale factor 3, area 5, answer 45 — identical numbers, near-identical single-sentence prompt, no new representation); r1 teaser incorrectly claims "Course complete!" and previews trigonometry, but ch6 (sy-06-01) still follows per course.json. See implementation contract below. |
| sy-06-01 | REVISE | REQUIRED | FIT | `sy-dilation-parallel` figure's dashed "rays from the center through each endpoint" are not collinear with the drawn center/original/image points under any single scale factor (independently recomputed — see contract); r1 teaser ("next chapter: applying similarity to indirect measurement") points backward at already-covered ch5 content instead of forward. See implementation contract below. |

### geometry-foundations

| lessonId | decision | visualDecision | gradeLanguageDecision | one-line basis |
|---|---|---|---|---|
| gf-01-01 | KEEP | SUFFICIENT | FIT | Undefined-terms (point/line/plane), naming/collinearity, and the two-point/intersection postulates are stated precisely and consistently across every step. |
| gf-01-02 | KEEP | SUFFICIENT | FIT | Segment/ray/angle/circle definitions, angle vertex-in-the-middle naming, and same-ray conditions (endpoint + direction) are correct and internally consistent; the ∠ABD/∠ABC same-ray challenge is logically sound. |
| gf-01-03 | KEEP | SUFFICIENT | FIT | Number-vs-figure notation (=, ≅), figure-vs-measure distinction (∠A vs m∠A), and intersection dimension rules (planes→line, lines→point) are all correct and consistently applied. |
| gf-02-01 | KEEP | SUFFICIENT | FIT | Segment-Addition-Postulate arithmetic (9-2=7; 17+26=43), midpoint averaging ((3+11)/2=7; (5+17)/2=11), and bisector half/double relationships (30/2=15; 2×19=38) all recompute correctly. |
| gf-02-02 | KEEP | SUFFICIENT | FIT | Angle-Addition-Postulate arithmetic (75-30=45; 34+51=85), bisector equality (26+26=52; 84/2=42), and whole-minus-piece solves (116+64=180; 90-37=53) all recompute correctly. |
| gf-02-03 | KEEP | SUFFICIENT | FIT | Between/interior (add) vs. bisects/midpoint (equal) equation selection is taught and tested consistently; both algebra chains (5x-4=41⇒x=9⇒AB=21; 3x+5=5x-17⇒x=11⇒76°) recompute correctly with a working self-check. |
| gf-03-01 | KEEP | SUFFICIENT | FIT | Translation-rule mechanics (slot-wise +/-, image-minus-preimage to find a rule, additive chaining of two translations) all recompute correctly. |
| gf-03-02 | KEEP | SUFFICIENT | FIT | Axis-reflection sign rules ((x,-y), (-x,y)), the perpendicular-bisector mirror property, and the y=x coordinate swap (including the on-the-mirror fixed-point case) are correct and well-distinguished from rotation/translation distractors. |
| gf-03-03 | KEEP | SUFFICIENT | FIT | CCW rotation rules (90°:(-y,x), 180°:(-x,-y), 270°:(y,-x)) are applied correctly throughout, including the composition-by-adding-angles argument verified against the coordinate rules. |
| gf-04-01 | KEEP | SUFFICIENT | FIT | Composition-as-assembly-line framing, translation-vector addition, non-commutativity of reflect/translate (independently verified both orders: (3,3) vs (-5,3)), and glide reflection are all correct. |
| gf-04-02 | KEEP | SUFFICIENT | FIT | Line-symmetry fold-test claims (rectangle=2, regular pentagon=5, square=4, circle=infinite, scalene=0) are all geometrically correct; the square-vs-rectangle diagonal distinction is explained accurately. |
| gf-04-03 | KEEP | SUFFICIENT | FIT | Order×angle=360° relationship applied correctly (square 90°, hexagon 60°, pinwheel order 8); the rotationLab parallelogram shape was independently recomputed as a genuine non-rectangle, non-rhombus parallelogram centered at the origin, confirming order-2 rotational symmetry with zero line symmetry as claimed. |
| gf-05-01 | KEEP | SUFFICIENT | FIT | Congruence-as-rigid-motion definition, distance/angle preservation, and the dilation-excluded example ((2x,2y) doubling PQ=3 to 6) all recompute correctly. |
| gf-05-02 | KEEP | SUFFICIENT | FIT | Sign-pattern/fingerprint detective method (translation, both axis reflections, 180° rotation) and the no-motion-exists case (AB=5 vs CD=6) are correct and well-distinguished from each other. |
| gf-05-03 | KEEP | SUFFICIENT | FIT | Congruence-statement correspondence (position-based pairing, measure teleportation, rewrite-preserves-pairing for ΔBCA≅ΔEFD and ΔCAB≅ΔFDE) is correct throughout; this is the course's actual final lesson, so its "Course complete!" teaser is accurate. |

## Implementation contracts for REVISE lessons

### sy-05-03 (Area & Perimeter Ratios)

1. **i2 duplication.** Replace the i2 numeric widget's scenario so it no longer matches sy-01-02/i3 verbatim. Change the scale factor and/or the smaller figure's area (e.g. scale factor 4, smaller area 6 ⇒ larger area 96) and update `commonErrors`/`fallbackFeedback` to the new numbers, preserving the same misconception pattern (using k instead of k² first; additive error). Do not touch sy-01-02.
2. **r1 teaser.** Replace `"Course complete! Next: right-triangle trigonometry builds on these similar triangles."` with a teaser that correctly forwards to ch6/sy-06-01, e.g. `"Next: one more relationship — dilations always keep a segment's image parallel to the original, unless the segment passes through the center."` Do not claim course completion here.

### sy-06-01 (Dilations and Parallel Lines)

1. **`sy-dilation-parallel` figure math fix** (`src/components/figures.tsx`, function `SyDilationParallel`, ~line 29022). Currently the center is hardcoded at `(40,130)`, the original segment at `(100,70)`–`(140,70)`, and the "image" at `(200,30)`–`(260,30)`, with two dashed rays drawn directly from the center to the image endpoints. Recomputed: the implied scale factor from center to A=(100,70)→A'=(200,30) is k≈2.667 in x but k≈1.667 in y (and for B=(140,70)→B'=(260,30), k≈2.2 in x vs k≈1.667 in y) — neither point is reachable from the center by a single dilation factor, so the rays as drawn do not pass through the original segment's endpoints. Fix by computing the image programmatically from a single k (mirroring how `DilationScale` already does `img = O + k*(pt - O)` for each vertex), e.g. center `(40,130)`, original endpoints `(100,70)` and `(140,70)`, k=2 ⇒ image endpoints `(160,10)` and `(240,10)` (both true dilation images, collinear with the center through each original point), and redraw the two ray paths through the recomputed image coordinates. Verify parallelism still holds (it will, since dilation always preserves direction) and re-derive the on-screen label positions from the same computed points.
2. **r1 teaser.** Replace `"next chapter: applying similarity to indirect measurement."` (which points backward at ch5, already covered) with a teaser that reflects this being the actual final lesson of the course, consistent with how sy-05-03's teaser should now read, or with whatever the next planned course/unit for this learner track actually is.

## Raw data

Per-lesson NDJSON dispositions (31 records) appended to `reports/closure/cowork-staging/laneB-s319-sim-gf-dispositions.jsonl`. Basis hashes were pulled via `node scripts/session/print-review-basis.mjs` against all 31 lesson ids in both courses; no ledger file was written.
