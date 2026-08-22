# S319 — Independent Assessment: coordinate-proofs & solid-geometry

Reviewer: Claude Cowork independent assessor (S319)
Reviewed at: 2026-08-20T12:38:57.000Z
Scope: content/courses/coordinate-proofs (15 lessons) and content/courses/solid-geometry (15 lessons), both grade 10. Every lesson JSON and both course.json files read in full; every numeric answer key, `explanationVariants`, `commonErrors`/`numericErrors`, and figure binding recomputed or cross-checked by hand. Figure bindings verified against the actual SVG source in `src/components/figures.tsx` (title text + rendered content), not just the figure-id registry.

Dispositions signed for all 30 lessons in
`reports/closure/cowork-staging/laneB-s319-cp-sg-dispositions.jsonl` (NDJSON, one record per lesson, `recordId` = `S319-K-<lessonId>`).

This report is evidence for independent human assessment per the ChatGPT Work worker-prefix authority rules; it does not itself constitute a closure verdict, curriculum change, or approval.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| coordinate-proofs | 15 | 9 | 6 | 0 |
| solid-geometry | 15 | 13 | 2 | 0 |
| **Total** | **30** | **22** | **8** | **0** |

## Per-lesson verdicts

### coordinate-proofs

| Lesson | decision | visualDecision | gradeLanguageDecision | One-phrase reason |
|---|---|---|---|---|
| cx-01-01 Distance Formula | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-01-02 Midpoint Formula | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-01-03 Distances at Work | REVISE | SUFFICIENT | FIT | challenge's two "routes" go to different endpoints, breaking the shorter-route framing |
| cx-02-01 Partitioning a Segment | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-02-02 Parallel, Proved | REVISE | REQUIRED | FIT | c2's figure renders perpendicular slopes (m₁·m₂=−1), not the parallel converse being taught |
| cx-02-03 Perpendicular, Proved | KEEP | PREFERRED | FIT | c1 (the m₁·m₂=−1 rule) has no figure; the matching one is misassigned in cx-02-02 |
| cx-03-01 Classifying Triangles | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-03-02 Classifying Quadrilaterals | REVISE | SUFFICIENT | REVISE | unexplained "pq" course-slug abbreviation leaks into feedback 6× |
| cx-03-03 Proofs for Every Figure | REVISE | SUFFICIENT | REVISE | unexplained "pq" abbreviation leaks into a hint |
| cx-04-01 Perimeter on the Plane | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-04-02 Area by the Box Method | REVISE | SUFFICIENT | REVISE | unexplained "g7" abbreviation leaks into feedback/takeaway |
| cx-04-03 The Shoelace Formula | KEEP | SUFFICIENT | FIT | all math verified correct, incl. Varignon-area proof |
| cx-05-01 The Circle's Equation | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-05-02 On, Inside, Outside | KEEP | SUFFICIENT | FIT | all math verified correct |
| cx-05-03 Circles in Disguise | REVISE | SUFFICIENT | REVISE | unexplained "cr" abbreviation leaks into concept body + feedback |

### solid-geometry

| Lesson | decision | visualDecision | gradeLanguageDecision | One-phrase reason |
|---|---|---|---|---|
| sg-01-01 Cross-Sections, Formalized | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-01-02 Solids of Revolution | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-01-03 Reasoning from Sections | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-02-01 Cavalieri's Principle | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-02-02 Cavalieri at Work | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-02-03 What Cavalieri Doesn't Say | REVISE | REQUIRED | FIT | challenge's "perimeter × slant" lateral-area answer (208) is mathematically wrong; true value ≈200 |
| sg-03-01 Prism to Cylinder | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-03-02 The One-Third Story | REVISE | REQUIRED | REVISE | figure shows cone/cylinder ⅓ but is bound to the cube-tiling step; unexplained "sy" abbreviation |
| sg-03-03 The Sphere Surrenders | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-04-01 Adding Solids | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-04-02 Subtracting Solids | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-04-03 Surfaces of Composites | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-05-01 k, k-Squared, k-Cubed | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-05-02 Density & Design | KEEP | SUFFICIENT | FIT | all math verified correct |
| sg-05-03 Modeling with Solids | KEEP | SUFFICIENT | FIT | all math verified correct |

## REVISE list (one-phrase reasons)

1. **cx-01-03** — wire-route challenge compares distances to two different endpoints while implying one shared destination.
2. **cx-02-02** — c2's bound figure (`cx-perp-slopes`) renders an unrelated, not-yet-taught perpendicular-slope fact instead of the parallel-converse content it illustrates.
3. **cx-03-02** — internal course-slug abbreviation "pq" (polygons-quadrilaterals) leaks into learner-facing feedback 6 times.
4. **cx-03-03** — same "pq" abbreviation leaks once into a challenge hint.
5. **cx-04-02** — internal abbreviation "g7" (Grade 7) leaks into feedback/takeaway text twice.
6. **cx-05-03** — internal course-slug abbreviation "cr" (circle-theorems) leaks into a concept body and mcq feedback.
7. **sg-02-03** — challenge's "perimeter × slant" lateral-surface-area shortcut yields a mathematically wrong answer (208 instead of ≈200).
8. **sg-03-02** — c1's figure (`cone-fills-cylinder`) is bound to the cube-tiling step instead of the cone/cylinder step it actually depicts; plus internal abbreviation "sy" (similarity) leaks into feedback.

## Implementation contracts for every REVISE

### 1. cx-01-03 — `ch` challenge (`content/courses/coordinate-proofs/lessons/cx-01-03.json`)

**Defect.** The widget prompt reads: *"A wire runs from (0, 0) either straight to (5, 12), or along (0,0)→(9, 0)→(9, 3). How much SHORTER is the shorter route?"* The two candidate paths terminate at different points — (5, 12) and (9, 3) — not a shared destination. Because a direct segment between two shared endpoints is always the minimum-length path between them (triangle inequality), a "bent route" can only beat a "straight route" by secretly going to a different place, exactly as happens here; the real-world "which way is faster to the same spot" framing is therefore never actually achievable and misleads about what is being compared. The arithmetic itself (13 vs. 9+3=12, gap 1) is correct in isolation.

**Fix.** Re-word the prompt so it no longer implies a shared destination, e.g.: *"A survey crew compares two jobs from base camp (0, 0): Job A runs a wire straight to a relay at (5, 12); Job B runs a wire along the fence line (0,0)→(9,0)→(9,3) to a different relay. Which job uses less wire, and by how much?"* Keep the answer (1) and all `commonErrors`/`fallbackFeedback` text unchanged — only the framing sentence needs to change to remove the false "same destination, shorter route" implication.

### 2. cx-02-02 — `c2` step (`content/courses/coordinate-proofs/lessons/cx-02-02.json`)

**Defect.** `steps[2].figure` is `"cx-perp-slopes"`. `src/components/figures.tsx` line 20389 (`function CxPerpSlopes()`) renders `<title>Perpendicular lines have slopes that are negative reciprocals, multiplying to negative one.</title>` and the on-canvas label `m₁ · m₂ = −1`. The `c2` body text is entirely about the *parallel*-line converse/uniqueness argument ("through a given point there's only ONE line with a given slope… Equal slopes ⇔ parallel") — perpendicularity is never mentioned. This is the exact fact taught in the *next* lesson, cx-02-03 ("Perpendicular, Proved"), whose own `c1` step (which literally derives `m₁·m₂=−1` by a 90° rotation) currently has **no figure at all**.

**Fix.** Two coordinated one-line edits:
- In `cx-02-02.json`, change `steps[2].figure` from `"cx-perp-slopes"` to `null`/remove the `figure` key (no other correctly-matching figure currently exists for the parallel-converse content), OR bind an existing generic figure if one exists that depicts "one point + one slope ⇒ one line" without perpendicular content.
- In `cx-02-03.json`, add `"figure": "cx-perp-slopes"` to `steps[0]` (`c1`), where it belongs and is currently missing.
No numeric widgets need any change in either lesson.

### 3 & 4. cx-03-02 and cx-03-03 — "pq" abbreviation (`content/courses/coordinate-proofs/lessons/cx-03-02.json`, `cx-03-03.json`)

**Defect.** The internal course-slug `pq` (id of the `polygons-quadrilaterals` course) appears unexpanded in learner-facing feedback:
- cx-03-02: `remedials[0].check.widget.options[0].feedback`, `options[2].feedback`, `steps[2].widget.options[0].feedback`, `steps[3].explanationVariants[1]`, `steps[3].widget.fallbackFeedback`, `steps[6].widget.options[0].feedback` (6 occurrences).
- cx-03-03: `steps[7].hints[2]` ("A parallelogram with four equal sides has a name from pq.") (1 occurrence).

A Grade-10 student has no way to resolve "pq" — other lessons in the same course spell out prerequisite courses in full (e.g. cx-01-01 says "Grade 8," cx-03-01/02 elsewhere say "the quadrilateral course's tests").

**Fix.** Global find/replace within these two files only: `pq` → `the quadrilaterals course` (or `polygons & quadrilaterals`) wherever it modifies a noun ("pq's diagonal test" → "the quadrilaterals course's diagonal test"; "a name from pq" → "a name from the quadrilaterals course"), preserving all surrounding math content, numbers, and correctness verdicts unchanged.

### 5. cx-04-02 — "g7" abbreviation (`content/courses/coordinate-proofs/lessons/cx-04-02.json`)

**Defect.** `steps[7].explanationVariants[0]` ("the coordinate audit co-signs g7's formula") and `steps[8].takeaways[1]` ("Cross-check areas by a second route (legs, g7 formulas)") use the unexplained shorthand "g7" for the Grade 7 trapezoid-area formula.

**Fix.** Replace "g7's formula" → "your Grade 7 trapezoid formula" and "g7 formulas" → "Grade-7 formulas," matching the spelled-out grade references used elsewhere in this course (e.g. cx-01-01's "your Grade 8 workhorse").

### 6. cx-05-03 — "cr" abbreviation (`content/courses/coordinate-proofs/lessons/cx-05-03.json`)

**Defect.** `steps[3].body` ("even cr's tangent theorems") and `steps[6].widget.options[0].feedback` ("cr's secant/tangent/miss trichotomy") use the unexplained shorthand "cr" for the `circle-theorems` course.

**Fix.** Replace "cr's tangent theorems" → "the circle-theorems course's tangent theorems" and "cr's secant/tangent/miss trichotomy" → "the circle-theorems course's secant/tangent/miss trichotomy."

### 7. sg-02-03 — `ch` challenge (`content/courses/solid-geometry/lessons/sg-02-03.json`)

**Defect (math error).** The challenge prices the lateral surface area of a sheared square prism (4×4 base, vertical height 12, slant edge 13, top shifted 5 sideways) as `perimeter × slant = 16 × 13 = 208`, and 208 is the recorded `approxFormula` result, `numericErrors` anchor, `fallbackFeedback`, and `successFeedback`.

This formula is invalid for an oblique prism. Modeling the shear as a fixed translation vector `v=(vx,vy,12)` with `vx²+vy²=25` (giving `|v|=13`, matching the stated slant edge) applied to a 4×4 base with edges `e_x=(4,0,0)`, `e_y=(0,4,0)`, the four true lateral-face areas are `|e_x×v| = 4·√(vy²+144)` (×2 faces) and `|e_y×v| = 4·√(vx²+144)` (×2 faces). For the natural reading of "shifted sideways" (shear parallel to one base edge, `vx=5, vy=0`): total = `2·(4·√144) + 2·(4·√169) = 2(48)+2(52) = 200`. Checking the full range over all valid `(vx,vy)` with `vx²+vy²=25` shows the true total stays within **[200, 200.2]**, and can equal 208 **only** if all four faces were simultaneously perpendicular to the shear vector — geometrically impossible for a square base with any nonzero horizontal shift. Sanity check: as the shift → 0 (right prism limit), the formula correctly converges to `perimeter × height = 16×12 = 192`, confirming the model; `192 + (small correction from the two affected faces alone, ≤8)` matches 200, never 208. This is a genuine, load-bearing error: the lesson's own thesis ("What Cavalieri Doesn't Say") is warning against naive geometric shortcuts, and this worked answer commits exactly that shortcut.

**Fix.** Fully specify the shear direction in the prompt (e.g. "the top face slides 5 units, parallel to one pair of the base's sides") and correct the answer key and all supporting text to 200:
- `numericErrors`: keep 192 as "that's the upright twin's lateral surface — the sheared sides run along 13" (already present), remove/replace the current 208-anchored explanation with the corrected reasoning, and consider adding 208 itself as a *new* `numericErrors` entry with feedback explaining why naive `perimeter × slant` overcounts (the two faces facing the lean keep their original height 12; only the other two elongate to 13).
- `fallbackFeedback` / `successFeedback`: replace `"Perimeter × slant = 16 × 13 = 208 …"` with `"Two faces keep their original height (4×12=48 each); the other two elongate to the slant (4×13=52 each): 2(48)+2(52) = 200 — only the faces facing the lean actually stretch."`
- `answer`: 200 (not 208); tolerance can remain ~0.01 given the exact single-axis-shear framing.

### 8. sg-03-02 — `c1` step and "sy" abbreviation (`content/courses/solid-geometry/lessons/sg-03-02.json`)

**Defect A (visual mismatch).** `steps[0].figure` is `"cone-fills-cylinder"`. `src/components/figures.tsx` (function `ConeFillsCylinder`) renders the title/label "cone = ⅓ of its cylinder" — a cone standing inside a same-base-and-height cylinder. `c1`'s body text is entirely about a *different* fact: a cube tiling into three congruent square pyramids. This is the only figure in the whole lesson, so the cone/cylinder relationship (actually taught in `k3` and `i2`) is left without any matching visual while `c1`'s cube-tiling claim is illustrated by an unrelated cone/cylinder image.

**Fix A.** Move the figure binding: remove `"figure": "cone-fills-cylinder"` from `steps[0]` (`c1`) and add it to `steps[2]` (`k3`, "The cone joins") where it correctly matches the content. `c1` can remain without a figure (no dedicated cube-splits-into-three-pyramids figure currently exists in the registry) or reference a to-be-authored one; this is a scope decision for the content owner, not something this assessment invents.

**Defect B (jargon leak).** `steps[1].widget.options[0].feedback` reads "similarity (the sy course's k² law on each slice)" — "sy" is the unexplained slug for the `similarity` course.

**Fix B.** Replace "the sy course's k² law" → "the similarity course's k² law," consistent with how other lessons in this program spell out prerequisite course names.

## Notes on scope and authority

- All findings above were independently recomputed by hand (arithmetic, algebra, and — for the two visual-mismatch findings — by reading the actual SVG/title source in `src/components/figures.tsx`) rather than inferred from labels alone.
- No lesson or course source file was modified; this session is read-only on content, write-only on the staging NDJSON and this report, per the packet's read-only mandate.
- The abbreviation-leak defects ("pq", "g7", "cr", "sy") are all the same defect class (an internal course-id shorthand used in student-facing prose without expansion) and were confirmed via a full-corpus grep across both courses' lesson JSON, restricted to learner-facing fields (`body`, `feedback`, `hints`, `explanationVariants`, `takeaways`) and excluding structural fields (`id`, `conceptTag`, `gen`, `form`, `courseId`, `chapterId`, figure ids).
- Two lessons (cx-02-03, sg-03-02's `k3`) received `visualDecision=PREFERRED`/were cross-referenced rather than independently penalized, since their content is otherwise sound and the fix is a same-course figure-reassignment already captured in the paired REVISE lesson's contract.
