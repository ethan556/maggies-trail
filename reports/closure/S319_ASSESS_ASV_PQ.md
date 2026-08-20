# S319 Independent Assessment — Area, Surface Area & Volume / Polygons & Quadrilaterals

Reviewer: Claude Cowork independent assessor (S319)
Reviewed: 2026-08-20T12:38:43.000Z
Scope: `content/courses/area-surface-volume` (grade 6, 15 lessons) and
`content/courses/polygons-quadrilaterals` (grade 10, 15 lessons) — course.json plus every lesson
JSON read in full. Every math claim (area/surface-area/volume value, interior/exterior-angle value,
quadrilateral-property claim) was independently recomputed from the authored inputs, not copied from
authored explanations. Every referenced figure component was extracted from
`src/components/figures.tsx` and `src/components/figures/coordinateAreaFigures.tsx` and checked for
(a) an accessible name (`<title>`/`role="img"`/`aria-label`, all present on all 50 figure components
used by these two courses) and (b) whether its baked-in numeric/dimension labels match the
accompanying lesson prose. `quadDrag`/`coordinateProofLab` widget target vertices were independently
recomputed (side lengths, diagonal lengths, midpoints, slopes) against each widget's own success
claim.

A note on the repo's `CHATGPT_WORK_V4_EXACT_PREFIX.md`: I read it as instructed. Its authority/evidence
framing (treat cached/prior "KEEP" labels as non-authoritative evidence only, do independent
verification, don't invent defects) is consistent with — and was followed in — this assessment. Its
"Return contract" field list (`packet_id, base_commit, contract_hash, scope_ids, ...`) describes a
different, packet-based worker protocol that does not apply to this task (no packet id, base commit,
or contract hash was issued to this assessment), so I did not adopt it in place of the return format
actually requested by this task's instructions; I'm flagging the mismatch rather than silently
reinterpreting either document.

## Counts

**area-surface-volume** (15 lessons): 11 KEEP, 4 REVISE, 0 ESCALATE
**polygons-quadrilaterals** (15 lessons): 15 KEEP, 0 REVISE, 0 ESCALATE

**Total: 26 KEEP, 4 REVISE, 0 ESCALATE** (30/30 lessons signed)

## REVISE list (one-phrase reasons)

1. `asv-01-02` — stray unedited "wait:" self-correction fragment in a remedial explanation string.
2. `asv-02-03` — confusing unpolished step-body text ("Add a pool, subtract... wait, other way.").
3. `asv-04-03` — wrong figure on step c2: `asv-boxes-fit` (box-counting-by-division) illustrates a
   different idea than the surface-area-vs-volume (inside/outside, cubic/square units) text it sits
   under.
4. `asv-05-01` — `box-layers` figure's baked-in labels ("base layer: 3 × 2", "3 layers tall") describe
   an 18-cube box, contradicting the lesson's own worked example (2×3 base, 4 layers, 24 cubes).

## Per-lesson verdict lines

### area-surface-volume (grade 6)

| Lesson | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|
| asv-01-01 | KEEP | REQUIRED | FIT | Triangle area/height math and figures all check out. |
| asv-01-02 | REVISE | REQUIRED | REVISE | Math correct; stray "wait:" fragment in remedial explanation. |
| asv-01-03 | KEEP | PREFERRED | FIT | Triangle/parallelogram/trapezoid comparison math all checks out. |
| asv-02-01 | KEEP | REQUIRED | FIT | L-shape add vs. subtract routes agree everywhere. |
| asv-02-02 | KEEP | REQUIRED | FIT | House/notch composite math all checks out. |
| asv-02-03 | REVISE | PREFERRED | REVISE | Math correct; confusing "wait, other way" body text. |
| asv-03-01 | KEEP | REQUIRED | FIT | Coordinate side-length math (incl. negatives) all checks out. |
| asv-03-02 | KEEP | REQUIRED | FIT | Grid rectangle/right-triangle area math all checks out. |
| asv-03-03 | KEEP | REQUIRED | FIT | Coordinate composite math checks out; figures reproduce lesson's own numbers exactly. |
| asv-04-01 | KEEP | REQUIRED | FIT | Box surface-area math (pairs and formula) all checks out. |
| asv-04-02 | KEEP | REQUIRED | FIT | Triangular-prism surface-area math (3-4-5, 6-8-10) all checks out. |
| asv-04-03 | REVISE | REQUIRED | FIT | Math correct; c2's figure teaches the wrong idea (box-counting, not SA-vs-volume). |
| asv-05-01 | REVISE | REQUIRED | FIT | Math correct; box-layers figure's cube count/labels contradict the lesson's own example. |
| asv-05-02 | KEEP | SUFFICIENT | FIT | Fractional-edge volume math all checks out; interactive widgets substitute for a static figure. |
| asv-05-03 | KEEP | REQUIRED | FIT | Real-world volume math all checks out; asv-boxes-fit correctly matched here. |

### polygons-quadrilaterals (grade 10)

| Lesson | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|
| pq-01-01 | KEEP | REQUIRED | FIT | (n-2)×180 and its reverse all check out; figures match precisely. |
| pq-01-02 | KEEP | REQUIRED | FIT | Exterior-sum-360 and interior+exterior=180 all check out. |
| pq-01-03 | KEEP | REQUIRED | FIT | Regular-polygon interior/exterior formulas all check out. |
| pq-02-01 | KEEP | REQUIRED | FIT | Opposite-sides property and algebra all check out; coordinateProofLab target verified independently. |
| pq-02-02 | KEEP | REQUIRED | FIT | Opposite/consecutive angle rules all check out. |
| pq-02-03 | KEEP | REQUIRED | FIT | Mutual-bisection math checks out; coordinateProofLab target verified independently. |
| pq-03-01 | KEEP | REQUIRED | FIT | Rectangle diagonal-congruence/Pythagoras all check out; quadDrag target verified independently. |
| pq-03-02 | KEEP | REQUIRED | FIT | Rhombus perimeter/angle-bisection/Pythagoras all check out. |
| pq-03-03 | KEEP | REQUIRED | FIT | Square diagonal (s√2) and hierarchy claims all check out; quadDrag target verified independently. |
| pq-04-01 | KEEP | REQUIRED | FIT | Trapezoid leg-supplement/isosceles math checks out; convention explicitly stated and consistent. |
| pq-04-02 | KEEP | REQUIRED | FIT | Midsegment average formula and reverse all check out; quadDrag target verified independently. |
| pq-04-03 | KEEP | REQUIRED | FIT | Kite bisection/angle/area math all checks out; quadDrag target verified (concave "dart" shape noted, not a factual defect). |
| pq-05-01 | KEEP | REQUIRED | FIT | Parallelogram-test logic and counterexample all check out; coordinateProofLab target verified independently. |
| pq-05-02 | KEEP | REQUIRED | FIT | Always/sometimes/never logic internally consistent; quadDrag target verified independently (convex rhombus). |
| pq-05-03 | KEEP | REQUIRED | FIT | Capstone dispatch math all checks out; coordinateProofLab target verified independently. |

## Implementation contracts for REVISE lessons

### `asv-01-02` — remedial explanation language cleanup
- **File**: `content/courses/area-surface-volume/lessons/asv-01-02.json`
- **Location**: `remedials[0].check.explanationVariants[1]`
- **Current text**: `"Average the bases (4), multiply by height... wait: sum first, then halve with height: 16."`
- **Defect**: leftover self-correcting "wait:" fragment; reads as unedited scratch work, not
  finished learner-facing copy.
- **Fix**: replace with a single clean sentence that keeps the (accurate) "average the bases" framing,
  e.g. `"The average of 6 and 2 is 4; 4 × 4 = 16."` No numeric change needed — the underlying math (16)
  is correct.

### `asv-02-03` — step body language cleanup
- **File**: `content/courses/area-surface-volume/lessons/asv-02-03.json`
- **Location**: `steps[]` entry with `"id": "i2"`, field `body`
- **Current text**: `"Add a pool, subtract... wait, other way."`
- **Defect**: confusing, unpolished phrasing for a grade-6 audience; reads as an unedited aside.
- **Fix**: replace with a direct label describing the actual task, e.g. `"Mixed operations: subtract
  the pool, add the shed."` The widget's own prompt/feedback already state the operations correctly;
  only this short body label needs rewording.

### `asv-04-03` — mismatched figure on step c2
- **File**: `content/courses/area-surface-volume/lessons/asv-04-03.json`
- **Location**: `steps[]` entry with `"id": "c2"`, field `figure: "asv-boxes-fit"`
- **Defect**: step c2's prose teaches the volume-vs-surface-area distinction ("volume is what fits
  inside (cubic units); surface area is what covers the outside (square units)... water fills a tank
  [volume] vs. paint coats a tank [surface area]"). The attached figure `asv-boxes-fit`
  (`src/components/figures.tsx`, function `AsvBoxesFit`) has `aria-label`/`<title>` "How many small
  boxes fit inside a big one: divide the big box's volume by the small box's volume to count them" —
  a box-counting-by-division concept, not the inside/outside unit-type contrast the paragraph teaches.
  (The same figure is correctly paired with the box-counting concept later, in
  `asv-05-03` step c2 — confirming the figure itself is fine, only this placement is wrong.)
- **Fix**: either (a) build/attach a new figure that visually contrasts a box's outside surface
  (highlighted faces, labeled "surface area — square units") against its interior volume (unit cubes,
  labeled "volume — cubic units"), or (b) remove the `figure` key from step c2 if no accurate figure
  is available, since prose alone already states the distinction correctly and an inaccurate figure
  is worse than none.

### `asv-05-01` — box-layers figure numeric mismatch
- **File**: `content/courses/area-surface-volume/lessons/asv-05-01.json`
- **Location**: `steps[]` entries `"id": "c1"` and `"id": "c2"`, both `figure: "box-layers"`
- **Defect**: step c1's prose is explicit and specific: "a 2×3 base holds 6 cubes per layer, and 4
  layers stack to 24 cubes... V = 2×3×4 = 24." The `BoxLayers` figure component
  (`src/components/figures.tsx`) renders exactly 3 stacked layers (`{layer(96 - 2*h)}`,
  `{layer(96 - h)}`, `{layer(96, true)}` — three calls only) and carries the baked-in text labels
  `"base layer: 3 × 2"` and `"3 layers tall"`, and its `<title>` reads "...stacked 3 layers high." That
  is an 18-cube box (3 layers × 6), not the 24-cube, 4-layer box the lesson's own worked example
  describes. This is a direct dimension-label-vs-prose mismatch (`box-layers` is used only in this
  lesson, confirmed via repo-wide search).
- **Fix**: in `BoxLayers`, add a fourth `layer()` call (stacking 4 layers instead of 3) and change the
  `"3 layers tall"` text label to `"4 layers tall"` so the figure's cube count (2×3 base × 4 layers =
  24) matches the lesson text it illustrates. `"base layer: 3 × 2"` may stay as-is (matches the
  lesson's "2×3 base").

## Notes / non-blocking observations (no action required)

- `pq-04-03` step i1's `quadDrag` target vertex `(4, 8)` (with fixed corners `(0,0)`, `(4,3)`, `(8,0)`)
  independently verifies as a true kite by the app's own `quadName` classifier (two pairs of congruent
  adjacent sides: 5, 5 and √80, √80) and the widget's feedback only discusses side-length adjacency —
  but the resulting quadrilateral is concave (a "dart"), not the convex kite shown in the surrounding
  static figures (`kite-diagonals`, `pq-kite-symmetry`). This does not contradict any claim the lesson
  makes and the side-length pedagogy is unaffected, so it is not scored as a defect, only recorded for
  awareness.
- All 50 figure components referenced by these two courses (47 distinct figure IDs; 4 resolve from
  `coordinateAreaFigures.tsx`, the rest from `figures.tsx`) carry `role="img"` plus either a `<title>`
  element or an `aria-label` (both, on several) — accessibility coverage for these two courses is
  complete; no missing-description defects found.
- The trapezoid-exclusivity convention ("exactly one parallel pair") is explicitly stated in
  `pq-04-01` and used consistently in `pq-05-02`'s always/sometimes/never claims and in the
  `quad-family-tree` figure's own "exactly one parallel pair" label — no internal contradiction found
  across the course on this point.
