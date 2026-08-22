# S316 — Vectors & Matrices independent lesson assessment (Lane B)

Reviewer: Claude Cowork independent assessor (vectors-matrices S316)
Reviewed: 2026-08-20T02:59:25.000Z
Course: `content/courses/vectors-matrices/course.json` (15 lessons, 5 chapters, grade 12 precalculus)
Ledger written to: `reports/closure/cowork-staging/laneB-vectors-matrices-dispositions.jsonl` (15 NDJSON rows, one per lesson, read-only staging — this report does not write the canonical ledger)

## Method

Read `course.json` and all 15 lesson JSON files in full. Recomputed every dot product, magnitude,
direction angle, matrix product entry, determinant, inverse entry, rotation, and matrix
composition by hand (independent arithmetic, not by re-deriving via the same shortcut the widget
uses). Checked row-vs-column convention consistency for the matrix-vector product
(`[[a,b],[c,d]]·⟨x,y⟩ = ⟨ax+by, cx+dy⟩`, rows dotted with the vector) and for matrix multiplication
(`A·B` entry = row of A dotted with column of B) — both conventions are used consistently
everywhere they appear, across chapters 4 and 5. Cross-checked the four open
`LESSON_PROGRESSION_AND_DUPLICATION` queue rows (`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, rows
`PROGRESSION-vec-01-01`, `PROGRESSION-vec-02-01`, `PROGRESSION-vec-03-01`,
`PROGRESSION-vec-05-01`) against the actual step content. Spot-checked registered figure
components in `src/components/figures.tsx` against the numbers/claims in the accompanying lesson
text, in particular the `matrixTransform` widgets in vec-04-02, vec-05-01, vec-05-02, vec-05-03
(columns-as-basis-images convention, determinant sign/value) and the fail-closed visual slot in
vec-05-02:c1 previously recorded in `reports/closure/S277_VECTORS_MATRICES_SOURCE_IMPLEMENTATION.md`.

## Decision counts

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 13 | vec-01-01, vec-01-02, vec-01-03, vec-02-02, vec-02-03, vec-03-01, vec-03-02, vec-03-03, vec-04-02, vec-04-03, vec-05-01, vec-05-02, vec-05-03 |
| REVISE | 2 | vec-02-01, vec-04-01 |
| ESCALATE | 0 | — |

No mathematical errors were found anywhere in the course — every dot product, magnitude,
direction angle, determinant, inverse, matrix product, and rotation/composition claim checked out
against an independent hand computation. Both REVISE findings are non-mathematical: one is an
unresolved within-lesson duplication (two checks landing on the identical resultant and answer),
the other is a visual/content mismatch (a figure that shows a concept two lessons ahead of where
it's placed).

## REVISE list

| Lesson | One-phrase reason |
|---|---|
| `vec-02-01` | k1 and k3 both add two vectors to the identical resultant ⟨3,4⟩/magnitude 5 — no new arithmetic in k3 |
| `vec-04-01` | c1's figure (`vec-det-area`) shows the determinant/area concept from the *next* lesson, not this step's matrix-vector-product content |

### `vec-02-01` — implementation contract

Step `k1` ("The tip-to-tail meaning", `<3,0>+<0,4>`) and step `k3` ("Combine, then measure",
`<1,2>+<2,2>`) both resolve to the exact same resultant `<3,4>` and the exact same answer, 5. `k1`'s
axis-aligned addends are pedagogically deliberate (they make the tip-to-tail right triangle
obvious), so the fix belongs in `k3`: change its `approxConstants` (x1/y1/x2/y2) to a pair whose sum
is not `<3,4>`/magnitude 5 — e.g. `<2,3>+<1,-1> = <3,2>`, magnitude `√13` — and update the two
`numericErrors` feedback strings, `explanationVariants`, `fallbackFeedback`, and `successFeedback`
to match the new numbers. This preserves `k3`'s actual job (generalize vector addition past
axis-aligned vectors) while removing the exact-answer coincidence with `k1`. No other step, answer
key, or remedial needs to change.

### `vec-04-01` — implementation contract

Step `c1`'s body is entirely about the matrix-vector product (`[[a,b],[c,d]]·⟨x,y⟩ = ⟨ax+by,
cx+dy⟩` — no mention of area or determinant), but its `figure` key is `vec-det-area`, which renders
and labels "area = |det| = 5" for a specific matrix. That concept isn't introduced until
`vec-04-02`, so a first-time reader of `c1` sees an unexplained "det" term with zero textual
support. Meanwhile `c2` in this same lesson (which *does* teach "each output is a row dotted with
the vector") is paired with `vec-matrix-row-dot` — the visual `c1` actually needs. Recommended fix:
swap `c1`'s figure to a matrix-vector-product-specific visual (move `vec-matrix-row-dot` to `c1` and
give `c2` a new, distinct visual, or register a new figure id for "rows highlighted against the
vector"). Reserve `vec-det-area` for a step in `vec-04-02` where "area = |det|" is actually taught.
No text, answer, or widget change is required.

## Progression-and-duplication queue resolution (all four open rows)

The queue's heuristic (`number-normalized-prompts`) flags any two steps in a lesson whose prompts
match after numbers are stripped, without judging whether the underlying instructional job
differs. I read all four flagged pairs against the actual lesson content:

- **`vec-01-01` (k2, ch1)** — KEEP. `k2` recognizes a scaled 3-4-5 triple (`<6,8>→10`); `ch1` is an
  independently-sourced, harder 5-12-13 triple (`<5,12>→13`) explicitly framed as the end-of-lesson
  challenge with its own hint ladder. A fluency check escalating into a harder, differently-sourced
  triple as the capstone is a defensible, distinct job.
- **`vec-02-01` (k3)** — **REVISE** (see above). Unlike the other three, this pair produces the
  *identical* resultant and answer, not merely a similar prompt shape — a genuine repeat.
- **`vec-03-01` (k2, ch1)** — KEEP. `k2` teaches *recognizing* a zero dot product as a
  perpendicularity signal from a given pair; `ch1` teaches *constructing* a perpendicular vector via
  the `⟨b,−a⟩` rule (introduced in its own hints), a genuinely new piece of content. Recognition
  then construction is a defensible progression.
- **`vec-05-01` (k3)** — KEEP. The heuristic fires because `k1` and `k3` both apply a matrix to the
  same input vector `⟨2,3⟩`, but they teach two different named transformations (reflection over
  the x-axis vs. reflection over `y=x`) with different matrices and different correct answers.
  Reusing one input vector to isolate the transformation being taught is not a content repeat —
  this is a heuristic false positive.

## Visual findings

- `vec-04-01:c1` — **REVISE**, see implementation contract above (figure/content mismatch).
- `vec-05-02:c1` — no `figure` key, by design. Re-verified this matches the fail-closed disposition
  recorded in `reports/closure/S277_VECTORS_MATRICES_SOURCE_IMPLEMENTATION.md`: the source teaches
  the *general* θ rotation matrix, but only a fixed-90°-example illustration was available, so the
  slot was correctly left blank rather than show a non-general figure. Confirmed still correct;
  not a new defect.
- `vec-03-01:c1` and `vec-03-03:c1` share figure `vec-dot-angle` (u=⟨3,4⟩, v=⟨5,0⟩, θ≈53°,
  shadow=3). In `vec-03-03` this exact example matches the lesson's own k2 work computation
  (`⟨3,4⟩·⟨5,0⟩=15 J`) — well-synchronized reuse, not generic filler.
- All other registered figures checked (`vec-determinant`, `vec-inverse`, `vec-det-zero`,
  `vec-rotation`, `vec-rotation-180`, `vec-transform`, `vec-read-transform`, `vec-compose`,
  `vec-matrix-row-dot`) render numerically-correct, content-matched claims with accessible
  `<title>`/`aria-label` text.

## Notable findings (non-blocking)

- The `matrixTransform` widgets (vec-04-02, vec-05-01, vec-05-02, vec-05-03) consistently use the
  "columns are destinations" convention and their `swappedFeedback`/`signFeedback` distractor
  branches were hand-verified to compute the determinant/orientation they claim (e.g. vec-05-02's
  swapped-column case genuinely gives det = +3 vs. the correct −3).
- No exact MCQ duplicate clusters exist anywhere in the course
  (`reports/closure/LESSON_REVIEW_CARDS_S244.json`, `duplicates.status` = `NO_EXACT_MCQ_DUPLICATE_CLUSTER`
  for all 15 lessons) — the only duplication concerns were the four heuristic
  `LESSON_PROGRESSION_AND_DUPLICATION` rows resolved above.
- Grade-language: all 15 lessons use precalculus-appropriate technical vocabulary (magnitude,
  determinant, singular, rigid motion, orientation) without dumbing down the mathematics; no
  grade-band language defects found.
- Standards evidence for this course remains `candidateOnly`/`rejected` per the review cards
  (`alignmentClaimAllowed: false`) — out of scope for this lesson-quality assessment and untouched.

## Files touched

- `reports/closure/cowork-staging/laneB-vectors-matrices-dispositions.jsonl` (created, 15 rows)
- `reports/closure/S316_LANEB_VECTORS_MATRICES_ASSESSMENT.md` (this file)

No content, script, or canonical ledger file was modified.
