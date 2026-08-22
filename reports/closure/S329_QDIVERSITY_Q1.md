# S329 QUESTION_DIVERSITY_AND_TRANSFER — Lane A, Packet Q1

Scope: the 6 `EXCELLENCE_BACKLOG_S126.csv` rows with `candidateDisposition = extend` —
`ks-01-01`, `ks-01-02`, `ks-01-03`, `ks-02-01`, `ks-02-03`, `ks-03-02`, all in
`content/courses/shapes-and-sorting-k/` (Kindergarten: Shapes & Sorting). Course confirmed from
each row's own `sourcePath` column, not guessed.

**Result: 6 of 6 completed.** Every lesson got one new challenge-tier step (`ch2`), no lesson was
left unedited, and no existing step (`ch1` included) was modified — the diff on every file is a
pure insertion (verified with `git diff --stat`, §5). This session did not touch
`EXCELLENCE_BACKLOG_S126.csv`, `CLOSURE_LEDGER.md`, or the main
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` ledger — disposition records are staged at
`reports/closure/cowork-staging/laneA-s329-Q1.jsonl` for a separate integration step, per
instructions.

**Environment note:** this container had other work actively running concurrently while this
session worked (as warned in the task brief). `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`
grew by 323 lines during this session from record-id prefixes `s327-A1-*` / `s328-E1..E3-*` /
`s328-main-*` — none of which are this session's — and `content/courses/exponents-polynomials/lessons/ep-02-03.json`
was independently modified mid-session. Neither touches this session's 6 lessons or the
`g0-shapes-sorting` / `shape-identify` / `match-object-shape` generator families; see §4.4 for how
this surfaced in one gate run and why it was left alone.

---

## 1. What each row actually said (read in full before designing anything)

| Lesson | Title | `candidateEngineOrExtension` names as already-covered | `currentWidgets` |
|---|---|---|---|
| `ks-01-01` | Name the Shapes | `match-object-shape:default` + `shape-identify:default` | matchPairs×1; mcq×1; tapDiagram×4 |
| `ks-01-02` | Shapes Any Way Up | `g0-shapes-sorting:shapeAnyWayMcq` + `g0-shapes-sorting:shapeAnyWayTap` | matchPairs×1; mcq×4; tapDiagram×1 |
| `ks-01-03` | Where Is It? | `g0-shapes-sorting:shapePositionMcq` + `g0-shapes-sorting:shapePositionTap` | dragBucket×1; mcq×2; tapDiagram×3 |
| `ks-02-01` | Shapes We Can Hold | `match-object-shape:solids` + `shape-identify:solid` | matchPairs×1; mcq×1; tapDiagram×4 |
| `ks-02-03` | Build with Shapes | `g0-shapes-sorting:shapeComposeMcq/Pairs/Tap` | dragBucket×1; matchPairs×1; mcq×1; tapDiagram×3 |
| `ks-03-02` | Heavier, Lighter, Holds More | `g0-shapes-sorting:shapeWeightMcq` + `g0-shapes-sorting:shapeWeightTap` | dragBucket×1; mcq×1; tapDiagram×4 |

All six rows carry identical `classificationScoreGaps`: `adapt, formal, prediction, transfer` (this
is the classifier's generic gap vector for every `extend` row, not a per-lesson checklist — the
brief for this packet is to design one genuinely new challenge item per lesson, not to mechanically
clear all four labels). `predictionEligibility` is `unsafe` for `ks-01-02` and `redundant` for
`ks-02-01`; it doesn't matter either way here because the schema (`src/lib/schema.ts` `Step.predict`
+ the pedagogy lint) only allows a `predict` block on `kind: "interactive"` steps, never on
`challenge` steps, so no new challenge step could add one regardless.

Every lesson JSON was read in full (`content/courses/shapes-and-sorting-k/lessons/ks-*.json`)
before designing anything, confirming the CSV's `currentWidgets`/`assessedClaimEvidence` columns
against the actual authored steps. `content/courses/shapes-and-sorting-k/course.json` was also
checked to confirm chapter order and that no lesson content forward-references a later lesson's
teaching point (see per-lesson notes below for the two places this mattered).

---

## 2. Design approach

Searched `src/lib/g0Variants.ts` (the shape-sorting/composition generator family,
`g0-shapes-sorting`, `SHAPE_FORMS`/`shapeHandlers`) and `src/lib/variants.ts` (`match-object-shape`,
`shape-identify`, ~L3970–4300) before designing anything. `g0-shapes-sorting`'s own
`G0_FORM_SURFACES` map shows this family only ever emits `mcq` / `tapDiagram` / `matchPairs` /
`lengthCompare` / `tenFrame` — never `dragBucket` or `numeric`, even though 3 of these 6 lessons'
`ch1` steps already hand-author a `dragBucket` widget outside that generator's coverage. That
confirmed `dragBucket` and `numeric` are both already-precedented, schema-native widget types in
this exact course (`DragBucketSpec`/`NumericSpec`, `src/lib/schema.ts`), so every new step below
reuses an **existing widget type**, in a **new configuration**, with **no new component code** —
no new widget type was built.

Every new step is `id: "ch2"`, inserted immediately after the existing `ch1` and before the
lesson's `r1` recap (verified programmatically: the recap must stay the last step per
`src/lib/pedagogy.ts`'s `lintLesson`, and it does in all 6 files). `ch1` itself was never edited —
this was checked deliberately because `src/lib/session267.shapesAndSortingKCourse.test.ts` pins
`ch1`'s exact widget type per lesson (`ks-01-01`→mcq, `ks-01-02`→matchPairs, `ks-01-03`→dragBucket,
`ks-02-01`→mcq, `ks-02-03`→dragBucket, `ks-03-02`→dragBucket); touching `ch1` would have broken that
test. None of the six new steps declare a `variant.gen`/`variant.form` — they are one-off authored
items, the same pattern the lessons already use for `i1`/`i2` (interactive steps throughout this
course carry no `variant` field either), which sidesteps any risk of `variants.resolver.test.ts`'s
generated-vs-authored widget-type check (that check only runs against steps that declare `variant`).

---

## 3. The six extensions

### 3.1 `ks-01-01` — Name the Shapes

**Current assessed surface:** single-instance shape ID from a verbal/visual clue (`i1`/`k1`/`i2`/`k2`,
tapDiagram, one shape at a time) → 1:1 object-to-name pairing (`k3`, matchPairs, 3 pairs) → single
rotated hexagon, "is it still a hexagon?" (`ch1`, mcq).

**New `ch2` (dragBucket, 4 buckets, 6 items):** sort 6 shapes at once into Circle/Triangle/Square/
Rectangle. 4 items restate `ch1`'s own rotation/size-invariance principle across the *other* three
taught shapes at once (`ch1` only ever tests it on one hexagon); the other 2 items are pure
side-count rules ("a shape with 4 sides that are ALL the same length" / "2 long sides and 2 short
sides") requiring the learner to discriminate square from rectangle *in the same task* as everything
else, rather than in the isolated single-shape items `k2`/`i2` already use.

**Why novel:** new *action* (categorize 6 items into 4 buckets in one interaction, vs. select-one
from a 4-way mcq/tap or link 3 pairs); new *transfer demand* (generalize `ch1`'s single-instance
invariance claim to 3 more shapes simultaneously, in the same task that also forces the square-vs-
rectangle discrimination `k2`/`i2` only ever test one at a time, never against each other).

**Math/logic verification (by hand, against the lesson's own definitions in `c1`/`c2`):**

| item | description | rule applied | bucket |
|---|---|---|---|
| d1 | tiny circle | round, 0 straight sides (c1) | circle ✓ |
| d2 | triangle pointing down | 3 straight sides, orientation-invariant (c1 + `ch1`'s own precedent) | triangle ✓ |
| d3 | square on one corner (diamond) | 4 equal sides, orientation-invariant | square ✓ |
| d4 | rectangle lying on its long side | 2 long + 2 short sides (c2), orientation-invariant | rectangle ✓ |
| d5 | "4 sides all the same length" | this is square's own definition, verbatim from k2 | square ✓ |
| d6 | "2 long sides and 2 short sides" | this is rectangle's own definition, verbatim from i2 | rectangle ✓ |

No two shapes compete for the same bucket ambiguously; every rule cited is already taught in `c1`/
`c2` or already tested in `k2`/`i2`/`ch1` — nothing new is asserted, only recombined.

### 3.2 `ks-01-02` — Shapes Any Way Up

**Current assessed surface:** 4 single-instance mcq items ("is it still a square/triangle/rectangle
after this one transform?"), one tapDiagram (`k1`, tap every circle regardless of size), one
matchPairs (`ch1`, 3 already-transformed pictures → 3 names). Every existing item shows a
transform that **preserves** the name — none ever tests when a transform stops preserving it.

**New `ch2` (dragBucket, 4 buckets, 6 items):** 4 items are safe transforms (flip, turn, even
shrink, even grow) that keep the name, exactly as `c1` teaches; **2 items are the new case** — a
square stretched wider without getting taller (no longer 4 equal sides → by the lesson's own
rectangle rule, it *is* now a rectangle) and, symmetrically, a rectangle squeezed until every side
matches (→ now a square).

**Why novel:** new *misconception target*, not tested anywhere in this lesson or (as far as this
session found) anywhere else in the course: recognizing the *boundary* of the "turn/flip/resize
never changes the name" rule. `c1` says "make it big or small — it keeps its name," which is true
of *even* resizing (what every existing item shows); the new items narrate an explicitly *uneven*
stretch/squeeze so as not to contradict `c1` — the widget's own `prompt` and both
`explanationVariants` say this distinction out loud rather than leaving it as a hidden gotcha.

**Math/logic verification:** by the lesson's own operative definitions (square = 4 equal sides,
c1; rectangle = 2 long + 2 short sides, c2 in `ks-01-01`, restated in this lesson's own `i1`/`k2`
options), a square that no longer has 4 equal sides has — by direct substitution — 2 pairs of
unequal sides, i.e. a rectangle by definition; the converse (a rectangle squeezed to 4 equal sides)
is a square by definition. Both are definitional consequences of rules already taught, not new
claims. The other 4 items (flip/turn/even-shrink/even-grow) are unchanged restatements of `c1`/`i1`/
`i2`/`k1`/`k2`.

### 3.3 `ks-01-03` — Where Is It?

**Current assessed surface:** above/below/beside are each drilled hands-on via single-instance
tapDiagram (`i1`/`k1`/`i2`, `mode: "selectOne"`); in-front-of/behind appear **only** as abstract
mcq (`k2`'s opposite-pairs question, `k3`'s fill-in-the-blank) — never in a picture/scene task.
`ch1` (dragBucket) sorts 3 friends into above/below/beside only.

**New `ch2` (tapDiagram, `mode: "selectAll"`, 4 hotspots):** "A cat sits above the barn... tap
EVERY friend that is NOT above the barn," correct set = {dog (below), frog (beside), mouse
(behind)}, 3 of 4.

**Why novel:** new *action* (`selectAll`/negation — this is the first `selectAll` tapDiagram in the
lesson; `i1`/`k1`/`i2` are all `selectOne`); new *representation* for behind (the first time
in-front-of/behind appears in a scene-based task rather than pure word recall); new *misconception
target* — over-generalizing `k2`'s "above's opposite is below" into "NOT above means only below,"
when NOT-above is the larger set {below, beside, behind}. The `missFeedback` is deliberately written
to name this exact undercount case (a learner who taps only "dog"), which is the more likely error
mode than tapping the one wrong hotspot ("cat").

**Math/logic verification:** cat is stated as above the barn (excluded); dog is stated as below
(is-not-above, included); frog is stated as beside (is-not-above, included); mouse is stated as
behind (is-not-above, included). Correct set = {dog, frog, mouse}, a direct, unambiguous set-
complement read of the prompt's own four stated facts — no inference beyond the sentence itself.

### 3.4 `ks-02-01` — Shapes We Can Hold

**Current assessed surface:** single-instance solid ID from a verbal clue (`i1`/`k1`/`i2`/`k3`,
tapDiagram) → 1:1 object-to-solid pairing (`k2`, matchPairs) → one cone lying on its side (`ch1`,
mcq). Every item's answer is always one of the 4 solid names — no item ever asks the learner to
first decide *whether something is a solid at all*.

**New `ch2` (dragBucket, 5 buckets, 7 items):** sphere/cube/cylinder/cone plus a 5th bucket, "Flat —
not a solid," holding 2 distractors (a paper circle cutout, a square drawn on a whiteboard).

**Why novel:** new *misconception target*, and one the course itself flags as intended: this
lesson's own `c1` concept step uses `"figure": "flat-vs-solid"` — the exact same figure id used by
`ks-01-01`'s `c1` — strongly signaling the curriculum intends a flat-vs-solid contrast, yet no
assessed item in this lesson (or, checked, in `ks-01-01`) ever tests it directly. This is also a
genuine cross-lesson *transfer* demand: it requires correctly reusing `ks-01-01`'s flat-shape
vocabulary (circle, square) against `ks-02-01`'s solid vocabulary (sphere, cube) for the same real
object — a **backward** reference to an earlier-taught lesson (safe), never a forward reference to
`ks-02-02` ("which solids roll and stack," the immediately next lesson per `r1`'s own teaser, which
this session deliberately did not touch).

**Math/logic verification:**

| item | bucket | check against c1/c2 |
|---|---|---|
| basketball, orange | sphere | "round every way you turn it" (c1, i1) |
| die | cube | "flat square sides all around" (k3) |
| paper towel roll | cylinder | "flat circles top/bottom, round middle" (i1... k1 pattern), standard real-world cylinder |
| birthday hat | cone | "round at the bottom and pointy at the top" (i2) |
| paper circle cutout, whiteboard square | flat | zero depth — not "something you could hold," per the figure's own flat-vs-solid framing |

### 3.5 `ks-02-03` — Build with Shapes

**Current assessed surface:** this lesson already uses all four other widget types in the course
(tapDiagram, mcq, matchPairs, dragBucket) — every item recognizes **one already-built** composition
(2 triangles→square, 2 squares→rectangle, house = square+triangle, 6 squares→cube). No item ever
asks the learner to **scale** a composition fact to a different quantity.

**New `ch2` (numeric, typed entry):** "Two triangles build one square. You want to build 4 squares.
How many triangles do you need in all?" → 8, with 3 diagnosed wrong counts (4, 6, 2).

**Why novel:** new *action* (typed numeric production — the first typed-entry item anywhere in this
lesson; every existing item is tap/select/pair) and new *transfer demand* (scale a single
composition fact across repeated copies, i.e. repeated-groups reasoning, rather than recognize one
instance of it). This is directly precedented inside this exact codebase: `g0Variants.ts`'s own
`shapeComposeMcq` generator (`src/lib/g0Variants.ts`, the same tag `ks-02-03`'s `k1`/`ch1` already
cite) has a second branch —
`` `Two triangles build one square. How many triangles build ${squares} squares?` `` with
`ans = squares * 2` — that implements this *exact* relationship as sound content for this exact
concept tag and course. It was simply never the branch `ks-02-03` happened to author (`k1`'s
authored content is the *other* branch, the house-picture question), so the scaling relationship
was validated-but-unassessed rather than invented from nothing.

**Math/logic verification:** 2 triangles per square (taught fact, `c1`/`i1`/`k1`) × 4 squares = 8
triangles. `4 × 2 = 8`. The three traps are each a distinct, verified-wrong miscount: 4 (counts only
the squares, i.e. 1 triangle per square), 6 (3 groups of 2, one square's group missing), 2 (only one
square's worth). All three are < 8 and mutually distinct, so no trap collides with the answer or
with another trap (checked by hand and confirmed by the pedagogy gate, which independently checks
this — §4.2).

### 3.6 `ks-03-02` — Heavier, Lighter, Holds More

**Current assessed surface:** every existing item is single-dimension by construction — `i1`/`k1`/
`k2` are pure weight (seesaw), `i2`/`k3` are pure capacity (pouring), and `ch1` (dragBucket) sorts
weight clues only, into heavier/lighter/same. No item ever mixes the two properties, so
*identifying which property a clue is even about* is never actually exercised — every task already
tells the learner which dimension it's testing before they read the clue.

**New `ch2` (dragBucket, 4 buckets: Heavier/Lighter/Holds more/Holds less, 7 items):** 4 weight
clues + 3 capacity clues, shuffled together.

**Why novel:** new *transfer demand* — classify the *property* first, then the *direction* — which
is a strictly harder discrimination than anything currently assessed (every existing item is
pre-sorted by property via its own framing). Also extends 2 existing patterns into cases not yet
covered: the size-trick misconception (`k1`, balloon/rock) gets a fresh object pair (block/stone),
and the pouring/overflow representation (`i2`, which only ever shows "holds more") is extended to
2 new "holds less" narratives (teacup overflowing from a teapot; small cup overflowing from a jug) —
currently "holds less" is only ever asserted via bare size intuition (`k3`'s bowl-vs-spoon), never
derived from a pour narrative the way "holds more" already is.

**Math/logic verification:**

| item | stated fact | rule (c1/c2/k2 for weight; i2's own pattern for capacity) | bucket |
|---|---|---|---|
| d1 dog down | seesaw side down | down = heavier (c1) | heavier ✓ |
| d2 kitten up | seesaw side up | up = lighter (k2) | lighter ✓ |
| d3 elephant toy down vs mouse toy | seesaw side down | down = heavier | heavier ✓ |
| d4 big block lighter than tiny stone | stated directly | direct restatement, no inference needed | lighter ✓ |
| d5 pitcher has water left after filling 1 glass | leftover room after pour | matches i2's own rule: leftover room ⇒ holds more | more ✓ |
| d6 teacup overflows before teapot half-empties | overflow well before source empties | source still has water when receiver overflows ⇒ receiver's capacity < what's already been poured (≤ half the teapot) ⇒ teacup holds less than teapot | less ✓ |
| d7 small cup overflows before jug a quarter full | overflow very early | same logic as d6, stronger (< a quarter of jug's capacity) ⇒ holds less | less ✓ |

No item's classification depends on anything not already stated in its own clue or already taught
in `c1`/`c2`/`i2`/`k1`/`k2`.

---

## 4. Gates run and results

All four required gates were run **after all 6 edits landed**, plus one additional targeted file
for extra safety on the ledger-hash step (§4.3/4.5).

### 4.1 `npm run validate:content` (`tsx scripts/content-check.ts schema`)

```
schema: 1840/1840 files clean
```
Exit code 0. All 6 target lessons individually listed `✓` in the run. Zero `✗` anywhere in the
full repo output (checked with `grep -c "^✗"` → `0`), so this session's edits did not regress any
other lesson either.

### 4.2 `npm run lint:pedagogy` (`tsx scripts/content-check.ts pedagogy`)

```
pedagogy: 1711/1711 files clean
```
Exit code 0, zero `✗` anywhere. This is the gate that independently re-checks the things verified
by hand in §3: every new `challenge` step has a `conceptTag`, exactly 3 `hints`, 2 genuinely
distinct `explanationVariants`; the `numeric` challenge (`ks-02-03`) has ≥2 `commonErrors` none of
which equal the answer or duplicate each other; no `mcq`-style duplicate/near-duplicate distractor
labels; no wrong-path feedback starts with a dismissive/generic word; no two competing distractors
share identical feedback text.

### 4.3 Targeted vitest — course-name match

```
$ npx vitest run src/lib/session267.shapesAndSortingKCourse.test.ts
 Test Files  1 passed (1)
      Tests  2 passed (2)
```
This is the file `src/lib` carries specifically for this course
(`S267 Shapes & Sorting K transfer challenges`). It pins each lesson's `ch1` to an exact widget
type and structural-integrity check; both tests pass, confirming `ch1` was left byte-for-byte
untouched in all 6 files (only `ch2` was added).

### 4.4 Additional targeted vitest — resolver/alias gate

```
$ npx vitest run src/lib/variants.resolver.test.ts
 Test Files  1 failed (1)
      Tests  3 failed | 14 passed (17)
```
Run as an extra safety check (not one of the 4 required gates, but directly relevant since the
brief discusses `variant.gen`/`form` conventions). All 3 failures are on `ep-02-03.json/k2`
(`poly-addsub`/`subX2`) and `k100-02-05.json/k3` (`k0-count-100`/mcq) — **neither file, course, nor
generator family this session touched**; `grep`ing the full failure output for `ks-01`/`ks-02`/
`ks-03`/`shapes-and-sorting` returns zero matches. `ep-02-03.json` also shows as independently
modified (`git status`) by a different, concurrently-running session, matching this environment's
"other work may be running concurrently" warning. None of the 6 new `ch2` steps declare a `variant`
field at all (§2), so they cannot be a source of any resolver-gate failure by construction. Left
alone as out of scope and not this session's to fix.

### 4.5 Ledger-hash simulation (read-only, not one of the required gates, run for extra confidence)

`scripts/session/print-review-basis.mjs` was run for all 6 lesson ids **after** the content edits
landed, to get each lesson's live `reviewBasisHash`:

```
ks-01-01  bd36e88a908993684fd53fdfcccec569e172b0942dd995a43442fc2a1d7468d6
ks-01-02  1394016795bbc6041b6bcf56926b42e70f26cc716aeca3288a9cb59d45ffb397
ks-01-03  3262976ba92a3cc60861d7a3815542262538120cd6f08b42ffd8db9eab417fa1
ks-02-01  5fba47c683daaa841688a3af3df3727d2fcc0e02903557e20895c288d08a7710
ks-02-03  89018917f42266e107ba51240d9dfcba50d20545ccec128504e3f0491f9a8f86
ks-03-02  b65b07e1932fdaf41ce13767b0f99a925c89185aef7c2253b920bc0d6fc81867
```

These are the exact `reviewedBasisHash` values written into
`reports/closure/cowork-staging/laneA-s329-Q1.jsonl`. To independently confirm they'd actually
satisfy `resolveLessonDecisionLedger`'s freshness contract if merged, this session built (in a
scratch script, **not** written to the repo) a merged-in-memory copy of the main ledger's raw text
plus the 6 staged lines, and called the real `resolveLessonDecisionLedger` /
`loadLessonReviewAuthority` functions from `scripts/audit/lesson-review-authority-s246.mjs`
directly (read-only — the actual ledger file on disk was never written by this session; confirmed
by `git status` showing it modified only by other sessions' unrelated record ids, §0/§5). Result:

```
ks-01-01 -> CURRENT_HUMAN_DECISION KEEP []
ks-01-02 -> CURRENT_HUMAN_DECISION KEEP []
ks-01-03 -> CURRENT_HUMAN_DECISION KEEP []
ks-02-01 -> CURRENT_HUMAN_DECISION KEEP []
ks-02-03 -> CURRENT_HUMAN_DECISION KEEP []
ks-03-02 -> CURRENT_HUMAN_DECISION KEEP []
```
All 6 resolve with an empty error list and `CURRENT_HUMAN_DECISION` status — the hashes,
enum values, and required fields in the staged records are all correctly formed against the
post-edit content, not just schema-shaped.

---

## 5. Files changed

Pure insertions only, confirmed with `git diff --stat` scoped to exactly these paths (no other file
in the repo was touched by this session):

```
content/courses/shapes-and-sorting-k/lessons/ks-01-01.json | 77 +++++++++++++++++++
content/courses/shapes-and-sorting-k/lessons/ks-01-02.json | 77 +++++++++++++++++++
content/courses/shapes-and-sorting-k/lessons/ks-01-03.json | 65 ++++++++++++++++
content/courses/shapes-and-sorting-k/lessons/ks-02-01.json | 87 ++++++++++++++++++++++
content/courses/shapes-and-sorting-k/lessons/ks-02-03.json | 37 +++++++++
content/courses/shapes-and-sorting-k/lessons/ks-03-02.json | 83 +++++++++++++++++++++
6 files changed, 426 insertions(+)
```

Each file gained exactly one step, `id: "ch2"`, `kind: "challenge"`, inserted between the existing
`ch1` and `r1`; step count per lesson went from 9 to 10 (schema allows 8–15). No `remedials` block,
no other step, and no `course.json` was touched.

New staging artifact (this session's own output, not the main ledger):
`reports/closure/cowork-staging/laneA-s329-Q1.jsonl` — **6 records**, one `lesson-disposition` per
edited lesson, `recordId`s `s329-Q1-ks-01-01` … `s329-Q1-ks-03-02`, all `decision: "KEEP"`,
`gradeLanguageDecision: "FIT"`; `visualDecision` was carried forward unchanged from each lesson's
most recent prior disposition in the main ledger (`REQUIRED` for `ks-01-01`/`ks-01-02`/`ks-03-02`,
`SUFFICIENT` for `ks-01-03`/`ks-02-01`/`ks-02-03`) since this edit touches no concept-step `figure`
and adds no new visual dependency — not this session's call to silently overturn.

---

## 6. Lessons left unedited

**None.** All 6 `extend`-flagged rows in this packet got a genuinely new, hand-verified challenge
item that goes beyond its lesson's current assessed surfaces in action, representation, or
misconception target (§3), and every one passed schema validation, pedagogy lint, and the course's
own targeted test untouched on `ch1`. No lesson was skipped for being contrived or pedagogically
weak — each design was checked against that bar specifically before being written (§3's "why
novel" + "math/logic verification" subsections are the record of that check), and two designs were
deliberately kept narrower than an initially-considered version to stay honest:

- `ks-01-01`'s sort was kept to the 4 shapes this lesson itself teaches (circle/triangle/square/
  rectangle) rather than also pulling in hexagon, to avoid diluting the square-vs-rectangle
  discrimination that is the item's actual point.
- `ks-02-01`'s flat/solid contrast deliberately does **not** reach into `ks-02-02`'s roll/stack
  content (the immediately next lesson, per its own `r1` teaser) even though "which solids are
  stable to stack" was considered as an alternative extension — that would have been a forward
  reference to unassessed, not-yet-taught material, so it was rejected in favor of the flat-vs-
  solid contrast, which is backward-grounded in `ks-01-01` instead.

---

## 7. Integration notes for the separate follow-up step

Per instructions, this session did not append to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`
and did not edit `EXCELLENCE_BACKLOG_S126.csv` or `CLOSURE_LEDGER.md`. For whoever runs that
integration step: all 6 rows above (`ks-01-01`, `ks-01-02`, `ks-01-03`, `ks-02-01`, `ks-02-03`,
`ks-03-02`) are now resolved for the `QUESTION_DIVERSITY_AND_TRANSFER` workstream and the 6 staged
records in `reports/closure/cowork-staging/laneA-s329-Q1.jsonl` are ready to append as-is (verified
in §4.5).
