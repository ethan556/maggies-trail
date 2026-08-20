# S316 Lane B — Independent Assessment: `measurement-data`

Course: Measurement, Time & Data (Grade 3) — 5 chapters, 17 lessons.
Reviewer: Claude Cowork independent assessor (measurement-data S316), read-only.
Method: read `content/courses/measurement-data/course.json` and all 17 lesson JSON files in
full; verified every drawn numeric answer by independent hand arithmetic; traced every
`figure` id and `plotData`/interactive-widget reference into `src/components/figures.tsx`
and `src/components/widgets.tsx` to confirm rendered visuals are synced to the specific
prompt data (not generic decoration); checked option ordering against
`src/components/optionOrder.test.tsx` / `LessonPlayer.tsx` to confirm the platform
seeded-shuffles all `mcq`/`predict`/`geometricConstraintLab` choice display order
independent of authored JSON order (so authored "correct option always listed first" is
**not** a fixed-position defect — it is neutralized at render time, corpus-wide).

## Course-level summary

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 15 | md-01-01, md-01-02, md-01-03, md-02-01, md-02-02, md-02-03, md-03-01, md-03-04, md-04-01, md-04-02, md-04-03, md-04-04, md-05-01, md-05-02, md-05-03 |
| REVISE | 2 | md-03-02, md-03-03 |
| ESCALATE | 0 | — |

Mathematical correctness: **no arithmetic or logic defects found in any of the 17 lessons.**
Every drawn numeric answer, every distractor's claimed misconception, and every worked
explanation was independently recomputed and checks out exactly as authored.

Choice-surface integrity: no leaked answers, no grammatical/length parity breaks, no
position-bias defect (shuffle is handled generically by the platform, verified in
`src/components/optionOrder.test.tsx`).

Grade-language: all 17 lessons FIT for Grade 3 — clear, consistent voice, metaphors
("ant's walk", "thousand-badge", "jigsaw of rectangles") pitched appropriately, no
weakening of precise mathematics.

## The one real defect class found: missing promised bar-graph visuals (ch3)

`md-03-01` (pictographs) and `md-03-04` (line plots) both establish a real,
platform-supported pattern for this exact situation: a check step that names specific
graphed data gets a **synced, non-answer-leaking diagram** —
`Md3QuestionPictograph` (parameterized by kind/keyValue/full/half, with a correct
aria-label) for pictographs, and the schema-level `plotData` block for line/dot plots.

`md-03-02` (Scaled Bar Graphs) and `md-03-03` (Asking the Graph Questions) do **not**
follow this pattern. Every check or interactive step in those two lessons that narrates
a specific bar-graph configuration in spatial/graph language ("the third line", "halfway
between the 4-line and the 6-line", "Bar A sits on the 8-line") is backed by nothing but
prose — the only figure in either lesson is the generic, non-data-synced `md3-bargraph`
SVG attached to the concept (`c1`/`c2`) steps. There is no schema field for bar-chart
data analogous to `plotData` (confirmed by grep of `src/lib/schema.ts`), so the gap is
structural, not a one-line data omission.

This is exactly the defect class the task's quality bar names: *"A visual promise in
text must render the actual synchronized representation of the learner's real
quantity/relationship... Missing/mismatched promised visual → REVISE with
visualDecision REQUIRED."* The underlying arithmetic in both lessons is correct
throughout — this is a visual-representation gap, not a math error.

### md-03-02 — Scaled Bar Graphs — REVISE, visualDecision REQUIRED

Affected steps (each describes specific bar/scale data with no rendered image):
- `i1` (matchPairs) — "Bar reaching the 2nd/3rd/4th line" on a by-5 scale.
- `k1` (numeric) — "A bar graph of books read: Mon 4, Tue 7, Wed 7, Thu 2."
- `k2` (numeric) — "the soccer bar stops exactly halfway between the 4-line and the 6-line."
- `i2` (dragOrder) — four named bar positions on a by-10 scale.
- `ch1` (numeric) — "Bar A sits on the 8-line. Bar B stops halfway between the 8-line and the 12-line."

**Implementation contract:** add a parameterized bar-graph figure component analogous to
`Md3QuestionPictograph` (e.g. `Md3QuestionBarGraph({ categories, values, scaleStep,
axisMax })`) that renders labelled gridlines at the stated step and bars at the stated
heights, with a correct `role="img"` `aria-label` describing the scale and each bar's
position (not its numeric value, to avoid answer-leaking on steps where the value is
what's being asked). Attach it via a `figure` (or new schema `barData` field mirroring
`plotData`'s integrity checks) to `i1`, `k1`, `k2`, `i2`, and `ch1`, using the exact
category/value/scale numbers already in each step's `prompt`/`widget` so the image and
text never diverge. `k3` (conceptual, no specific data) needs no change.

### md-03-03 — Asking the Graph Questions — REVISE, visualDecision REQUIRED

Affected steps:
- `k1` (numeric) — "A bar graph shows: dogs 8, cats 6, fish 3, birds 5."
- `k2` (numeric) — "A graph shows books read each day: Mon 4, Tue 7, Wed 7, Thu 2."
- `i2` (dragBucket) — "Graph: apples 5, bananas 8, grapes 5, pears 2."
- `k3` (numeric) — reuses the dogs/cats/fish/birds dataset from `k1`.
- `ch1` (numeric) — "Recess votes — soccer 9, tag 6, swings 4, slide 5."

**Implementation contract:** same `Md3QuestionBarGraph` component as above (or its
reuse), attached to `k1`, `k2`, `i2`, `k3`, and `ch1`, with the four-category dataset
rendered as actual bars at a sensible scale (e.g. by-1 or by-2, since the values run
2–9). Since `k1` and `k3` share one dataset (dogs 8, cats 6, fish 3, birds 5), one figure
id can serve both steps. `c1` (conceptual) needs no change.

## Per-lesson verdicts

| Lesson | Decision | Visual | Grade lang | One-line reason |
|---|---|---|---|---|
| md-01-01 Reading the Clock | KEEP | SUFFICIENT | FIT | Real clock-hand visuals + correct hour/minute arithmetic throughout. |
| md-01-02 Minutes Before and After | KEEP | SUFFICIENT | FIT | Verbal past/to renaming verified correct; no unrendered visual promise. |
| md-01-03 Elapsed Time on a Number Line | KEEP | SUFFICIENT | FIT | Synced number-line jump figure; all elapsed-time sums correct. |
| md-02-01 How Heavy? Grams and Kilograms | KEEP | SUFFICIENT | FIT | Conversions correct; estimate targets realistic. |
| md-02-02 How Much? Liters | KEEP | SUFFICIENT | FIT | Capacity arithmetic correct; flour-pours trap well-targeted. |
| md-02-03 Measure-and-Solve Stories | KEEP | SUFFICIENT | FIT | Two-step arithmetic correct; size-guard tapDiagram internally consistent. |
| md-03-01 Pictographs with a Key | KEEP | SUFFICIENT | FIT | Sets the course's visual-first bar: synced per-question SVGs for every specific-data check. |
| md-03-02 Scaled Bar Graphs | **REVISE** | **REQUIRED** | FIT | Five steps narrate specific bar/scale positions with no rendered graph — see contract above. |
| md-03-03 Asking the Graph Questions | **REVISE** | **REQUIRED** | FIT | Five steps narrate specific bar-graph datasets with no rendered graph — see contract above. |
| md-03-04 Line Plots with Halves and Quarters | KEEP | SUFFICIENT | FIT | Uses schema `plotData` to render real synced dot plots; arithmetic correct. |
| md-04-01 Covering with Squares | KEEP | SUFFICIENT | FIT | Interactive tiling diagram establishes the model; later checks are direct computational extensions. |
| md-04-02 Rows × Columns = Area | KEEP | SUFFICIENT | FIT | Real areaModel build widget; area/perimeter distinctions verified correct. |
| md-04-03 The Break-Apart Rectangle | KEEP | SUFFICIENT | FIT | compositeAreaLab renders the named split pieces; distributive-property arithmetic correct. |
| md-04-04 Odd Shapes: Add the Pieces | KEEP | SUFFICIENT | FIT | compositeAreaLab renders the L-shape pieces; add-vs-subtract logic correct. |
| md-05-01 Walking the Fence | KEEP | SUFFICIENT | FIT | tapDiagram renders all four labelled sides; perimeter arithmetic correct. |
| md-05-02 The Missing Side | KEEP | SUFFICIENT | FIT | geometricConstraintLab renders a real synced diagram + staged reasoning for every step. |
| md-05-03 Same Area, Different Fence | KEEP | SUFFICIENT | FIT | compositeAreaLab renders the named comparison pens; every area/perimeter figure correct. |

## Staging output

17 NDJSON lines written to
`reports/closure/cowork-staging/laneB-measurement-data-dispositions.jsonl` (validated
well-formed, one record per lesson, `recordId` = `S316-MD-<lessonId>` for all 17).
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` was not touched.
