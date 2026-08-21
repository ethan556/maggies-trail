# S327 — Assessor A6 full-portfolio review (14 never-assessed lessons)

Reviewer: cowork-s327-A6-assessor. Branch: `codex/v4-s244-authored-visual-wave`. This is the
first-ever full review disposition for the 14 lessons listed below, across 7 courses. Scope is
exactly `content/courses/{measure-length-g1,arrays-even-odd-g2,data-line-plots-g2,
integration-applications,compare-numbers-k,how-many-k,right-triangles-trig}/`; no `src/**`,
`scripts/**`, or ledger files touched. Math re-derived by hand and with `node` one-offs (no
`npm`/`vitest`/`tsc`/build — 2-CPU container). Remedial rewrites follow
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` R1–R6. Each lesson's disposition line is
appended to `reports/closure/cowork-staging/laneB-s327-A6.jsonl` immediately after that lesson's
entry below (write-incrementally, not batched).

---

## measure-length-g1

### g1m-02-01 — KEEP

**Math verification (hand + structural check).** i1 `unitRuler`: `objectStart:2, objectEnd:6` →
span 4, matches `requiredPlacements:4` and prompt text "place four." i2: `objectStart:1,
objectEnd:6` → span 5, matches `requiredPlacements:5` and "five one-unit blocks." k1 `mcq`: 9 cubes,
answer 9; traps 10 (over-by-one), 8 (under-by-one), 18 (double-count) — all arithmetically correct
relative to 9 and each trap's feedback names the actual mechanism of that specific error (no generic
"try again"). k2 `numeric`: ribbon 9, pencil 7, answer 2 = 9−7; commonErrors 9 ("whole ribbon, not
the difference") and 7 ("pencil length, not the difference") are both true statements about what a
learner who wrote that value was actually reporting; neither trap equals the answer. k3 `mcq`: 8
cubes, answer 8, same trap shape (9 over, 7 under, 16 double = 2×8) — correct. ch1 `numeric`: ladder
14, brush 2, answer 12 = 14−2; traps 14 and 2 correctly named, no collision with 12. r1 recap is
inert prose, no claims to verify.

**MCQ option balance.** k1 labels `"10","8","9","18"` (1–2 chars each); k3 labels `"9","7","8","16"`
— parallel short numerals, no length-based answer-adjacency leak. The `predict` block under i1 has
an asymmetric option pair ("At the object's starting edge" vs "Anywhere along it") but predict blocks
are ungraded priming prompts, not scored traps, so this is not treated as a leak.

**Remedial — DEFECT FOUND AND FIXED.** `remedials[0].check.widget` (conceptTag `g1m-iterate`, tied to
both k1 and k3) was, before this review: same `mcq` type, **the identical number 9** as k1 (not even
a fresh instance), and all 4 options/feedback strings byte-identical to k1's, merely reordered; its
prompt differed from k1's only by the absence of k1's trailing filler clause "Choose the key
measurement idea." That passes a naive raw/JSON string-diff (`rawEq=false`, `payloadEq=false`, my
scan script found no literal collision) but fails the substance of S316-R §1.1: it is not a fresh
instance and not a route change, only a chopped sentence. **Fix applied:** rewrote the remedial check
to "Exactly 6 same-size cubes cover a strip end to end, with no gaps and no overlaps. How many cubes
long is the strip?" — number changed to 6 (distinct from k1's 9 and k3's 8), "ribbon"→"strip" and the
question clause reworded so `normalized()` differs lexically (not only digit-wise) from every
widget-bearing step in the lesson, and all 4 traps recomputed for 6 (7 over, 5 under, 12 double).
Verified: **R1** prompt≠k1 ✓; **R2** normalized≠every step's normalized prompt (checked against i1,
k1, i2, k2, k3, ch1) ✓; **R3** JSON payload≠k1 ✓; **R4** n/a — k1/k3 carry no `variant`/`gen`, so no
generator-regeneration risk; **R5** all 3 traps recomputed and true of 6, none collide with answer 6
or each other ✓; **R6** the injected `remedial.concept` (byte-identical to `c2`) states no number, so
no answer-on-screen leak ✓. Did not touch `remedials[0].concept` — rewriting authored concept prose
is explicitly out of scope per S316 §1.4 ("Rewriting authored `remedial.concept.body`" is listed
under "Explicitly NOT binding").

**Figures.** No `"figure"` key appears anywhere in this lesson. `measure-length-g1` has zero entries
in `src/components/figureIds.ts` (grepped the full 2029-id set for `g1m`/`ml-` prefixes — none), so
there is no registered figure this course could reference even if one were wanted. The `unitRuler`
interactive widget in i1/i2 is itself a manipulable visual model of "lay units end to end" —
directly on-screen, synchronized to the concept it teaches. **visualDecision = SUFFICIENT** (the
interactive carries the visual load; a separate static figure is not required for this lesson's
concept/check steps).

**Language.** Grade-1-appropriate throughout: short sentences, concrete nouns (cubes, ribbon,
pencil), no unexplained vocabulary. The trailing meta-clauses on k1–ch1 ("Choose the key measurement
idea.", "Show the comparison result.", "Use a fresh measurement clue.", "Finish with a new object.")
are stylistically dry and not fully natural word-problem language, but they are not confusing or
mathematically misleading, and are what keeps k1/k3 and k2/ch1 lexically distinct under
number-normalization — left as-is. **gradeLanguageDecision = FIT.**

**Queue cross-check.** `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` carries only the generic
`VISUAL-DISPOSITION-g1m-02-01` / `LANGUAGE-g1m-02-01` / `LESSON-g1m-02-01` rows for this lesson (no
`PROGRESSION` or `CHOICE` row). This review's disposition closes all three.

**Disposition: KEEP / SUFFICIENT / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g1m-02-01`, reviewedBasisHash `af2df53de9e2aa1e31c7c003d7f8db03cd94691d6d8bb44a4988f75e686e46d8`.

---

### g1m-03-02 — KEEP

**Math verification.** i1 `unitRuler`: span `0..6`=6, `targetUnitSize:2` → 3 placements, matches "three
of them." i2: span `2..10`=8, unit 2 → 4 placements, matches "four two-unit clips." k1 `mcq`: "units
twice as long → more or fewer?" is a unit-size-invariant claim (bigger unit always yields a smaller
count, for any starting count) — correct, and all 4 option feedback strings are generically true.
ch1 repeats k1's exact job with a different flavor number (8 vs 12); acceptable consolidation since
the reasoning doesn't depend on the specific count (same treatment as g1m-02-01's k1/k3 pair).

**Structural defect FOUND AND FIXED — question-job mismatch.** k2 and k3's *widgets* tested the wrong
concept: k2 was a verbatim copy of g1m-02-01's plain unit-counting MCQ template (just cubes, no unit
comparison at all) and k3 was a verbatim copy of that lesson's same-unit length-difference template —
neither touches this lesson's actual concept (c2: "different units give different counts for the same
object — and both counts are correct"). **Decisive evidence:** k2's own authored `explanationVariants`
("Each count names its own unit." / "Both can be correct at once.") and k3's ("Compare only counts
made in the same unit." / "Otherwise the difference means nothing.") do not describe what their old
widgets asked, but do exactly describe c2's concept — proving the *widgets*, not the
`explanationVariants`, were the miscopied part. (Control case: k1's and ch1's `explanationVariants`
correctly match their own on-topic content, confirming these strings are a reliable spec in this
lesson, not decorative.)

- **k2 rewritten** (mcq): "A path is 12 cubes long. Covered with two-unit clips instead, how many
  clips does it take?" Correct 6 (=12÷2, hand-verified). Traps: 12 (unit-size effect ignored), 24
  (doubled instead of halved — inverse-direction error), 3 (over-divided by 4). Each trap maps to a
  distinct, real conversion misconception.
- **k3 rewritten** (numeric → mcq, since the target misconception is a yes/no judgment, not a
  computed value): "Mia's crayon is 8 clips long. Ben's pencil is 8 cubes long, and a clip is bigger
  than a cube. Are the crayon and the pencil the same length?" Correct: "No — the crayon is longer"
  (8×2=16 vs 8×1=8, hand-verified). Traps: "Yes — both counts are 8" (the core misconception: equal
  counts ⇒ equal length), "No — the pencil is longer" (reversed direction), "Cannot tell from the
  counts" (denies the units alone resolve it).

Both rewrites keep the step's existing `id`/`conceptTag`/`hints`/`cml` untouched; `hints` ("bigger
units give a smaller count") remain fully applicable to both.

**Remedial — same near-duplicate defect as g1m-02-01, FOUND AND FIXED.** `remedials[0].check` (tied
to k1) was k1's identical scenario — same object "stick," same number 12, same 4 options/feedback
verbatim, only reordered — differing from k1 only by a dropped trailing clause. Reworded to a
different object and multiplier: "A fence measures 10 small cubes... units three times as long...";
verified programmatically against every widget-bearing step (i1, k1, i2, k2, k3, ch1) — zero
raw/normalized/payload collisions. All 4 feedback strings are unit-size-invariant so remained
literally true unedited (R5); R4 n/a (k1/ch1 carry no `variant`/`gen`); R6 holds (injected remedial
concept = c2, unedited, states no number).

**MCQ option-length balance** checked programmatically for every mcq in the lesson (k1, k2, k3, ch1,
remedial): k1/ch1/remedial's correct option (32 chars) sits within 1 char of the next-longest
distractor (31), not a unique outlier; k2's labels are bare numerals; k3's 4 labels span 23–27 chars
with the correct option tied at 25 with another distractor. No answer-adjacency leak anywhere.

**Figures.** None referenced; course has zero registered figure ids. `unitRuler` interactive carries
the visual representation. **visualDecision = SUFFICIENT.**

**Language.** Concrete, short-sentence G1 prose throughout, including the new k2/k3 text (named
characters Mia/Ben, everyday objects). **gradeLanguageDecision = FIT.**

**Queue cross-check.** Only the generic `VISUAL-DISPOSITION-g1m-03-02` / `LANGUAGE-g1m-03-02` /
`LESSON-g1m-03-02` rows exist for this lesson; no `PROGRESSION`/`CHOICE` row.

**Disposition: KEEP / SUFFICIENT / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g1m-03-02`, reviewedBasisHash `47f1817e8bdf3c2ecb409d03ca496ec824f512814fc12beb80fa8f0585bcc160`.

---

## arrays-even-odd-g2

**Tooling note.** For this course I built a `tsx` verification harness
(`A6-verify-g2a.mts`, scratch-only) that imports the *real* `src/lib/schema.ts`
(`WidgetSpec`, `widgetIntegrityErrors`), `src/lib/evaluate.ts` (`evaluate`), and the real
`src/lib/g2Independent.cjs` solver — the same modules `src/lib/session194.arraysEvenOdd.test.ts`
uses — and replicated that test's assertions (plus the same checks applied to `remedials[]`, which
session194 does not cover) without ever invoking `vitest`. This gave solver-verified, not just
hand-verified, confidence for every numeric/mcq widget touched in this course.

### g2a-02-01 — KEEP

**Math/structural verification (tsx harness + hand check).** All structural checks pass both before
and after my edits: step-kind sequence, tapDiagram single-correct-hotspot with distinct distractor
feedback per cell, numeric `commonErrors` uniqueness/non-collision with the answer, feedback length
≥25, mcq `options[0].correct===true` (this course's own authoring convention, enforced by
session194 line 130), and — critically — the REAL solver re-derives every `variant`-bound step's
answer from its prompt text and it matches the authored `answer` exactly. i1/i2 tapDiagram hotspot
coordinates match their "row R, column C" prompts precisely (grid convention: x∈{13,38,63,88}=cols
1-4, y∈{17,50,83}=rows 1-3). Predict block (3×4 array, row 2 holds 4) correct. k1 (4+4=8, now
6+6=12) traps correctly diagnose "row + row-count" and "triple-row" errors. **k2 is a genuinely
well-designed, distinct job from k1**: "which repeated sum counts it BY ROWS?" (4 rows of 5 = 20)
vs the by-columns alternative (5 columns of 4 = 20) — all 4 traps hand+solver-verified, option
lengths 13/17/5/13 chars with the correct option (13) tied to a wrong one, no adjacency leak. k3's
running-total framing (12 + 6 = 18, "add the third row") is a legitimate escalation over k1
(tracks a running total across 3 groups instead of 2, different generator form `Add2DigitNumeric`).

**PROGRESSION-g2a-02-01 (CSV, P1) — investigated and fixed.** A pairwise normalized-prompt collision
scan across every widget-bearing step found exactly the two pairs the CSV row's evidence names:
`i1↔i2` (both "Tap the counter in row #, column #.") and `k1↔ch1` (both "Each row of the array holds
# dots. Two rows: # + # = ?").

- **i1/i2 — left as-is.** Both are guided/independent practice reps of the identical tap mechanic on
  a new grid cell, explicitly self-labeled by body text ("Try it" / "Try it again"). This is standard
  low-stakes interactive practice repetition, not a graded trap-diagnosis duplicate.
- **k1/ch1 — fixed.** Read `src/lib/g2Independent.cjs`'s source to understand the constraint before
  choosing a fix: `DoublesNumeric`/`Add2DigitNumeric` are validated by a generic `arithmetic(prompt)`
  regex that extracts the *first* literal `"A + B = ?"` substring in the text — so authoring a
  genuinely different underlying skill for ch1 while keeping its `variant` tag would fail the solver
  check, and dropping the `variant` tag instead would crash
  `session194.arraysEvenOdd.test.ts`'s `POOL_WITHDRAWN` allowlist assertion (line 111–113: any
  variant-bound numeric step not on that hardcoded allowlist must still solve) — that test file is
  `src/lib/**`, outside this round's edit authority, and `g2a-02-01/ch1` is not on the allowlist. The
  CSV's own `next_action` explicitly sanctions *"assign question jobs and approve a fluency/retrieval
  rationale"* as one valid resolution (not only a content redesign) — applied that route on the solid
  technical footing above: **ch1 is a legitimate same-skill fluency/retrieval consolidation of k1**
  (doubles-fact recall in the row/column array context), immediately before the recap. Bumped the
  number 5→6 (mild escalation) and added a trailing differentiator clause ("Now try a bigger pair.")
  so `normalized(ch1) ≠ normalized(k1)`; traps recomputed for 6 (8, 18) and solver-reverified.
  Re-scanned afterward: zero pairwise normalized collisions remain among k1/k2/k3/ch1.

**Remedial — DEFECT FOUND (not in the CSV) AND FIXED.** My own R1–R6 scan found
`remedials[0].check.widget` was **byte-identical** to k1's widget (raw/normalized/JSON-payload all
equal) — a full duplicate, the worst form of the S316-adjudicated defect class. Fixed per Shape α:
new scenario and representation ("A sticker sheet has 3 stickers in each row...") with a fresh number
(3 — distinct from k1's 6, ch1's 6, k3's row-size 6, k2's 5), both traps recomputed (5, 9) against
the new answer (6). Verified zero raw/normalized/payload collisions against every widget-bearing main
step programmatically. R4 n/a: remedials carry no `variant` field and are never variant-refreshed.

**Figures.** None referenced; `arrays-even-odd-g2` has zero registered `figureIds.ts` entries. The
`tapDiagram` grid interactive is itself the visual representation of rows/columns.
**visualDecision = SUFFICIENT.**

**Language.** Standard 2.OA.C.4 grade-2 vocabulary (rows, columns, array) used consistently and
simply. **gradeLanguageDecision = FIT.**

**Disposition: KEEP / SUFFICIENT / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g2a-02-01`, reviewedBasisHash `0b4ef4a37ce5bd1a6c96f7614cce269aa979b6bfeda1c312737021550843d1e3`.

---

### g2a-02-03 — KEEP

**Math/structural verification (tsx harness).** All checks pass pre- and post-fix. i1 tapDiagram
"LEFT column" correctly marks the 3 column-1 hotspots across all rows; i2 "BOTTOM row" correctly
marks all 4 row-3 hotspots. k1 (9+3=12), k2 (5+5+5+5=20), k3 (2×8 and 4×4 both =16), ch1
(18+6+6=30) all hand- and solver-verified; every trap correctly diagnoses a distinct, real
misconception (column-count-vs-column-size confusion, skipped column, only-one-remaining-column,
extra phantom column).

**Pool-withdrawn variants — verified, not a defect.** k2 and ch1 carry no `variant` field. Checked
`src/lib/session194.arraysEvenOdd.test.ts`'s `POOL_WITHDRAWN` allowlist (line 62–64): both
`g2a-02-03/k2` and `g2a-02-03/ch1` are explicitly on it, signed "S318 PROG + s323-P6" as
hand-verified-truthful content the 2-operand `arithmetic()` solver regex cannot parse (k2's
4-term `5+5+5+5` sum, ch1's 3-term `18+6+6` sum). Correctly left untouched.

**Figure check.** c1 and c2 both declare `"figure": "mult3-flip"` — confirmed **registered**
(`figureIds.ts`). Read the component (`src/components/figures.tsx:4031`, static/no-props): renders
a 3-rows-of-4 dot grid beside a 4-rows-of-3 dot grid joined by "=", captioned "Flipping an array:
3×4 = 4×3." This matches c1's own worked numbers exactly ("three rows of 4 is also 4 columns of
3") and i1's interactive grid (`canvas w:4,h:3` = 3 rows × 4 columns) — truthful, synchronized reuse
from the `mult-fluency-g3` figure set (`figureIds.ts` is a flat, non-course-namespaced registry, so
cross-course reuse is legitimate). Because row/column duality is an inherently spatial claim and
this lesson delivers it with both a registered, accurate figure on **both** concept steps and a
matching interactive grid, **visualDecision = REQUIRED** (a stronger call than the `SUFFICIENT`
used elsewhere in this batch, which had no registered figure available at all).

**CHOICE-0023 (CSV, P1) — FIXED.** k3's correct option was 49 chars ("The same total can make
differently shaped arrays") vs a 32-char longest distractor — a 17-char/53% length-based
answer-adjacency leak. Rewrote to "Both arrays hold the same total" (31 chars), preserving the exact
meaning; new spread across all 4 options is 31/32/31/32 — no outlier.

**Remedial — DEFECT FOUND (not in the CSV) AND FIXED, with a self-caught near-miss.** My R1–R6 scan
found `remedials[0].check.widget` byte-identical to k1. First fix attempt only swapped the numbers
under the identical "Counting by columns: N columns made M..." template — a re-scan caught that this
*still* collided under `normalized()`, since digit-stripping ignores which numbers are used. Corrected
to a genuinely reworded prompt ("Two columns are already counted: 10 dots in all. Join the final
column of 5 more: 10 + 5 = ?"), traps recomputed (13, 10). Re-ran the full harness plus a fresh
pairwise collision scan against every widget-bearing step: zero raw/normalized/payload collisions.

**Language.** Standard grade-2 array vocabulary, consistent with g2a-02-01. **gradeLanguageDecision
= FIT.**

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g2a-02-03`, reviewedBasisHash `b6292fbff20e69c3e7dbcff68dfeeb6dfd0eb791ac022fb566697035ceb2996a`.

---

## data-line-plots-g2

**Tooling note.** This course carries a materially more rigorous prior gate than the others in this
batch: `src/lib/session194.dataLinePlots.test.ts` (solver-agreement + widget contracts) and
`src/lib/session254.dataLinePlotsG2CourseIntegrity.test.tsx` (pedagogy lint, a **hardcoded**
figure-binding map, exact/normalized/payload collision scan on main steps, cross-route evaluator
alignment, and an audited banned-phrase list from a prior fix). Built a `tsx` harness
(`A6-verify-g2g.mts`) replicating both, using the real `schema.ts`/`evaluate.ts`/`g2Independent.cjs`,
plus my own remedial-vs-main collision scan (neither existing test covers remedials against main
steps — session254's own collision check is scoped to `lesson.steps` only).

### g2g-02-01 — KEEP

**Result: zero findings, no edits needed.** Every harness check passed. i1 `barBuilder` targets
`[4,6,3]` match its prompt and predict block; k1/k2/ch1 `graphRead` widgets all solver-rederive their
truth via `MmtPictureGraphRead` (drawn×unitValue, hand+programmatically confirmed 8, 5, 4) with
`commonResults` correctly diagnosing "phantom extra picture" (+1) and "doubled the key" (×2) errors,
both within `[0, scaleMax]` and distinct; k3 mcq (bar graph fits categorical vote data, not a line
plot/ruler/clock) has its correct option at `id:"o0"` per this course's convention, all distractor
feedback correct and distinct.

**Figure check.** c1/c2 both declare `mmt-picture-graph`, matching session254's own hardcoded map
exactly. Registered (`figureIds.ts`); read the component (`figures.tsx:16688`, static): 3 labeled
rows with 4/2/5 pictures, title "In a picture graph where each picture is worth one, the number of
pictures is the total" — a truthful, generic depiction of the key-of-1 concept both concept steps
state. `narration === body` confirmed for both.

**Noted, verified clean, not a defect.** k1/k2/ch1 use varying icon-vs-unit-noun pairings
(shell↔shell, pinecone-icon↔find, apple-icon↔vote). Checked this is not the historically-banned
grammatical defect session254 audits for (line 124–136 bans plural-noun-as-adjective forms like
"pinecones pictures"/"apples pictures"); this lesson correctly uses the singular-adjective form
throughout ("shell pictures", "pinecone pictures", "apple pictures") — none of the banned substrings
appear.

**Remedial — already well-designed, no fix needed.** Distinct widget *type* from k1 (numeric vs
graphRead — a genuine Shape-α representation change), fresh scenario (Sunday, reworded framing) and
fresh number (6 vs k1's 8), its own registered figure with `narration===body`. Zero raw/normalized/
payload collisions against any main step, confirmed programmatically.

**visualDecision = REQUIRED** (registered, accurate figure on both concept steps, paired with a
barBuilder interactive throughout). **gradeLanguageDecision = FIT** (concrete, grade-2-appropriate).

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g2g-02-01`, reviewedBasisHash `9aff93521fb60688935def21c80b34d3a43862bf83febe9736422c698fcba709`.

---

### g2g-02-03 — KEEP

**Result: zero findings, no edits needed.** Every harness check passed. i1/i2 `barBuilder` targets
match prompts and `maxVal`. k1/k2/ch1 are `numeric` (not `graphRead`) with `MmtBarGraphNumeric`;
solver confirms `nums[0]===answer` for all three (4, 3, 3). k2 runs the *inverse* direction from
k1/ch1 (given a count of 3 objects, find the gridline the bar's top must reach) — a genuine,
distinct "build" job complementing k1/ch1's "read" job, not a repeat. All traps (off-by-one
gridline above/below) correctly diagnosed, none collide with the answer.

k3 mcq (ribbon lengths that repeat need a line plot, not a bar graph/clock/single ruler reading) —
correct option at `id:"o0"`, 3 distractors correctly diagnosed. Notably this **mirrors g2g-02-01's
k3 with the roles reversed**: that lesson (picture graphs) correctly answers "bar graph" for
categorical vote data, this lesson (bar graphs) correctly answers "line plot" for repeated
measurement data — testing genuine category-vs-measurement judgment across the two lessons rather
than a memorizable keyword.

**Figure check.** c1/c2 both declare `single-scale-graph`, matching session254's hardcoded map.
Registered; read the component (`figures.tsx:12635`, static): 3 bars (cats=3, dogs=6, birds=4) with
a **real gridline drawn at every unit** and a matching numbered axis — the source comment documents
a prior S241 repair (gridlines were previously undrawable despite the caption claiming their
existence, now fixed). Matches c2's body exactly; `narration===body` confirmed for both.

**Remedial — already well-designed, no fix needed.** Distinct wording from k1, fresh number (6, vs
k1's 4 / k2's 3 / ch1's 3), own registered figure with `narration===body`, zero raw/normalized/
payload collisions against any main step confirmed programmatically.

**visualDecision = REQUIRED. gradeLanguageDecision = FIT** (concrete grade-2 vocabulary: vans,
bikes, cars, gridline, scale).

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-g2g-02-03`, reviewedBasisHash `640e52711e1935d1499885daaf9d244bb4c9027dc503fb2c155974382a1b821d`.

---

## integration-applications (HS calculus — held to the rigorous standard)

### ia-01-02 — KEEP

**Math verification (node-computed, cross-checked two ways).** i1 sliceSum (y=x on [0,2], target
8π/3=8.3776) matches the classic cone-volume formula (1/3)πr²h with r=2,h=2 — confirmed to 6dp.
k1 mcq (disc radius = f(x)) — all 3 traps correctly diagnose real confusions. k3 mcq (squaring must
happen on the function before integrating) — the worked counterexample (8.38 vs 12.57) is exact.
ch1 numeric (y=x² on [0,1], π/5=0.628) — all 3 traps already correctly diagnosed, node-verified
exact, no changes needed.

**FOUND AND FIXED — false trap-feedback mechanism (k2).** k2's trap value 4.189 is correct (half of
8.378), but its feedback claimed the mechanism was "used (1/2) instead of (1/3), or forgot to square
the radius" — neither survives computation. Forgetting to square gives 2π=6.283, not 4.189. By node
I derived that the *actual* "(1/2) instead of (1/3)" antiderivative slip (x³/2 instead of x³/3)
produces π·(2³/2) = **12.566** — a *different* trap two entries below in the same array, whose own
feedback was vague ("check the antiderivative," no mechanism named). The two traps' explanations had
been cross-wired during authoring. Verified the mechanism that actually produces 4.189 is x³/6
instead of x³/3 (π·2³/6 = 4.189 exactly). Rewrote trap 4.189's feedback to name x³/6 (accurate) and
upgraded trap 12.566's feedback to explicitly name x³/2 (its real, now-correctly-attributed
mechanism) instead of leaving it vague. Both mechanisms independently node-verified before writing.

**FOUND AND FIXED — figure does not depict the bound step (remedial).** `remedials[0].concept`
declared figure `dr-power-rule-pattern` — registered, but reading its component (`figures.tsx:26297`)
shows it is a **derivative** power-rule lookup table (x→1, x²→2x, x³→3x², differentiation rules) with
no semantic connection to the remedial's actual content (disc radius=f(x), face=πr², an
integration/geometry topic). Rebound to `ia-strip-to-disc` — the same figure c1/c2 already use
(registered; `figures.tsx:26768` shows a strip becoming a disc, radius=f(x) labeled, caption "so the
slice is worth πr² = π[f(x)]²" — a precise match to the remedial's own text), following this batch's
established precedent of reusing a lesson's own verified c1/c2 figure for its remedial.

**Remedial math** (disc face area for radius 3 = 28.27; traps 9.42=3π forgot-to-square, 9=r²-no-π)
verified via node, exact. Zero raw/normalized/payload collisions against any main step.

**Gate check.** `src/lib/session246.integrationApplicationsIa01Freshness.test.ts` validates the
*generator's* regenerated instance pool against `calculusIndependent.cjs`'s regex solver, not the
specific authored k1–ch1 prompt text in this file (no session-2xx course-integrity test exists for
this course the way `session254` exists for `data-line-plots-g2`). Confirmed my edits (feedback text
only, one figure id) touch neither the `variant`/`gen`/`form` bindings nor the widget values that
test's form/type counts depend on.

**visualDecision = REQUIRED** (spatial claim, delivered via a precise registered figure plus a live
sliceSum interactive). **gradeLanguageDecision = FIT** (calculus-course-appropriate notation and
precision).

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-ia-01-02`, reviewedBasisHash `eff9973d79b4d121c8126ecf750d2658962ec6861f8da77d2bf1c421812e2962`.

---

### ia-02-01 — Known Cross-Sections

HS calculus, chapter 2 of integration-applications: generalizing away from the disc method to
*any* known cross-section (square, equilateral triangle, semicircle) standing on a flat base
region, with no revolution and no π unless the slice itself is round.

**Math verification (rigorous, two independent oracles).** Every quantity was checked two ways:
(1) my own node arithmetic re-derivation of every answer and every trap's exact mechanism, and
(2) the *real* repo `WidgetSpec` / `widgetIntegrityErrors` / `evaluate()` (from `src/lib/schema.ts`
and `src/lib/evaluate.ts`, imported directly — not re-implemented) run against every widget via a
tsx harness, including a full raw/normalized/payload collision scan across every main
widget-bearing step and the remedial. Both passed cleanly, pre- and post-fix.

- **k1** (numeric, square slices, V = ∫₀² x² dx = 8/3 = **2.667**): traps 8.378 (circular-slice
  answer, cross-referenced correctly to the lesson's own `i1` sliceSum target) and 2 (base-interval
  length) were already exact and well-diagnosed.
- **k2** (mcq, equilateral-triangle slices — "only the constant changes: multiply by √3/4"): all 4
  options' feedback verified true; no answer-adjacency leak (option lengths 31–46 chars, correct
  answer neither longest, shortest, nor the only symbolic one).
- **k3** (numeric, semicircle of **diameter** x, V = (π/8)(8/3) = π/3 = **1.047**): all 3 traps
  node-verified exact — 4.189 = treating x as radius instead of diameter ((1/2)π(8/3)), 2.667 = k1's
  own square-slice answer, 8.378 = a full circle of radius x (the disc-method answer from the
  previous lesson — a well-chosen habit trap).
- **ch1** (numeric, equilateral-triangle slices of side x, V = (√3/4)(8/3) = 2√3/3 = **1.155**): all
  3 traps node-verified exact — 2.667 = k1's square answer, 0.577 = using √3/8 instead of √3/4
  (half), 4.619 = using √3 instead of √3/4 (×4, i.e. dropping the ÷4 entirely).
- **remedial** (numeric, "square side 3 → area?" = **9**): traps 28.27 (πr², treats it as a circle)
  and 12 (perimeter 4×3) both exact and correctly diagnosed.

**Two vague-but-true feedbacks upgraded** (not false claims — unlike ia-01-02's cross-wired traps,
these never asserted anything wrong, just didn't name a mechanism — upgraded for consistency with
the diagnostic standard applied everywhere else in this lesson and in my ia-01-02 fixes):
- k1's trap-4 feedback said only "check the antiderivative." Node-confirmed the precise mechanism —
  evaluating x² itself at the bounds as if it were its own antiderivative (2² − 0² = 4) — and
  rewrote the feedback to name it exactly.
- ch1's trap-4.619 feedback said only "a factor of 4 out." Node-confirmed the precise mechanism —
  using coefficient √3 instead of √3/4, i.e. dropping the ÷4 (√3·(8/3) ≈ 4.619 exactly) — and
  rewrote the feedback to name it exactly.

**Three figure-mismatch defects found and fixed.** `c1` declared `ia-strip-to-disc` — registered,
but reading its component (`figures.tsx:26793`) shows its *visible on-page text* (not just the
hidden a11y title) reads "so the slice is worth πr² = π[f(x)]²," which directly **contradicts**
c1's own headline claim "no π anywhere" (this lesson's entire point is that squares/triangles/
semicircles need no π, unlike the disc). `c2` declared `dr-derivative-as-function` — registered,
but reading its component (`figures.tsx:26219`) shows a graph of y=x² and its *derivative* y′=2x
with tangent-slope annotations — a differentiation-topic figure with zero connection to c2's actual
content (generalizing cross-section area formulas: s², (√3/4)s², (π/8)s², πr²). The remedial concept
declared `dr-power-rule-pattern` — the *same* derivative-rules lookup-table figure already found
mismatched in `ia-01-02`'s remedial, here bound to square-cross-section-area content, again zero
connection.

Before fixing, I surveyed the available registry: `figureIds.ts` shows this course
(integration-applications) has only 2 dedicated `ia-` figures total (`ia-strip-to-disc`,
`ia-top-bottom-swap` — the latter is an area-*between*-curves top/bottom-swap figure, unrelated to
cross-sections). Grepping `"figure"` across all 6 lesson files in this course shows this exact
`dr-*` misbinding is a **systemic pattern** recurring in `ia-01-01`, `ia-01-03`, `ia-03-01`, and
`ia-04-01` too (none in my assigned scope — left untouched, noted here only as evidence the defect
is course-wide, not a one-off typo). Since authoring a new figure component is out of scope
(`src/**`) and no dedicated "known cross-sections" figure exists, I searched further and found
`sg-cross-section` (`figures.tsx:20038`, registered) — a generic, *true*, non-contradictory figure
("a cross-section is the flat shape revealed when a plane slices through a solid" / "slice =
cross-section") that matches what all three of this lesson's figure-bearing steps are actually
teaching, without asserting anything false or π-contradictory. Rebound `c1`, `c2`, and the remedial
concept all to `sg-cross-section`, mirroring the same-figure-throughout precedent set in `ia-01-02`.

**visualDecision = PREFERRED**, not REQUIRED: the fix is a real, verified improvement (no false or
contradictory visual survives), but `sg-cross-section` is generic — it does not precisely depict the
*specific* shapes taught (square/triangle/semicircle standing on a slice). The lesson's content is
fully and correctly teachable via the symbolic/numeric progression alone (every check's math stands
on its own, verified above); a picture is a legitimate anchor for "what is a cross-section" but is
not load-bearing for solving k1/k2/k3/ch1. Not ESCALATE either — a purpose-built figure family for
this chapter would be a genuine future asset investment, but my content-only fix is a complete,
sufficient resolution within my authority; nothing false remains blocking the lesson.

**Other checks.** `i1`'s predict block (square of side r vs. circle of radius r → smaller, since
r² < πr²) verified correct, including its aside that a circle of radius r is inscribed in a square
of side 2r (not r) — geometrically accurate, a legitimate warning against a plausible mix-up, not an
error. Question-job progression is strong: k1 = full setup+integrate (squares), k2 = generalization
insight (mcq), k3 = a genuinely new misconception (diameter-vs-radius), ch1 = consolidation in a
harder shape with its own fresh trap (coefficient-dropping) — no pure repeats. The remedial check
("square side 3 → area 9") is a route/representation shift (Shape α: fixed-number single-shape-area
vs. the main steps' integral-based volume setups) — structurally distant enough from the
`g13-integration-applications` generator's expected prompt shape (no base region, no integral, no
revolve/varies-by-cross-section framing) that R4 producibility is not a concern; R6 (no answer leak
in the concept+check pair) confirmed by inspection. Language and notation (π, √3/4, semicircle,
equilateral, three-decimal precision) are calculus-course-appropriate throughout —
**gradeLanguageDecision = FIT**. Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic
VISUAL/LANGUAGE/LESSON rows (re-grepped and confirmed: `VISUAL-DISPOSITION-ia-02-01`,
`LANGUAGE-ia-02-01`, `LESSON-ia-02-01` only — no PROGRESSION or CHOICE row).

**Disposition: KEEP / PREFERRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-ia-02-01`, reviewedBasisHash `0dc84fad174be8272f249907d5e90677c520e33576bd14445a957a0eb6f3d069`.

---

## compare-numbers-k

This course carries its own binding course-integrity tests, all read in full and treated as
authoritative before touching anything: `session198.compareNumbersK.test.ts` (course shape,
per-form solver round-trips via `g0Independent.cjs`, `numberLineHop` landing-formula and
prompt-regex contracts), `session253.compareNumbersKCourseIntegrity.test.tsx` (a hardcoded
`expectedFigures` map, `lintLesson`, main-sequence-only collision scan — remedials excluded),
`session306.compareNumbersKChoiceOrder.test.ts` (**byte-level SHA256-pinned** prompt+options
hashes for specific main-sequence mcq steps, enforcing a repo-wide de-clustered correct-answer
position schedule). All three were re-run (by hand, via a tsx harness importing the real
`schema.ts`/`evaluate.ts`/`pedagogy.ts`/`g0Independent.cjs`) against both lessons after my edits.

### kcm-01-01 — More, Fewer, or the Same?

Kindergarten, ch1: more/fewer/same via one-to-one pairing.

**Verification.** `lintLesson()===[]`; every widget (including the fixed remedial)
`widgetIntegrityErrors===[]` with `evaluate()` agreement; re-derived session306's pinned SHA256
hashes for `k1`/`k2`/`ch1` from the current file and confirmed all six (3 steps × prompt+options)
are byte-identical to the committed pins — confirming nothing pinned was disturbed; re-ran the
session198 solver round-trip for `k1` and `ch1` (form `countMoreFewerMcq`) and confirmed
`g0Independent.cjs` agrees with the authored correct label.

**Figures.** `c1`="kc-fewer", `c2`="khm-paired-groups-leftover" — both *required exactly* by
session253's hardcoded `expectedFigures` map, untouched. Independently verified truthful by
reading source: `KcFewer` (`figures.tsx:14643`) title "Three mats and five cats: the row of three
is fewer than the row of five" precisely matches c1's body. `khm-paired-groups-leftover`
(`src/components/figures/howManyFigures.tsx:58` — a legitimate cross-course reuse from
how-many-k) title "Ana's six grapes pair with six of Ben's seven grapes, leaving one grape
unmatched" is a near-verbatim match to c2's body.

**Content.** `k1` (8 stars vs 7 hearts → more stars) and `ch1` (critiques Nia's wrong claim that 5
stars > 6 hearts → corrects to "more hearts") both correct, all traps correctly diagnose real
misconceptions (false-equal, size-not-count, first-number bias, false "cannot tell"). `k2` tests
the *pairing procedure* conceptually, a genuinely different job from `k1`. `k3` (numberLineHop,
"what comes right after 14") matches the `kSeqNextHop` regex contract exactly (14+1=15), both
traps (14=stayed put, 16=overshot) exact and well-diagnosed. Progression matches the cml's own
dual invariant (pairing *and* counting-song order) — four genuinely distinct jobs, no pure
repeats.

**One defect found and fixed (S316 R1 violation).** The remedial check widget's prompt ("There
are 8 stars and 7 hearts. Which statement is true?") was **byte-identical** to `k1`'s own prompt —
only the options array order had been shuffled (same id/label/correct/feedback content). Fixed
with a fresh scenario: "A pond has 9 ducks and 4 frogs. Which statement is true?" — fresh nouns
and numbers (9, 4 unused anywhere else in this lesson). Chose the nouns deliberately:
`g0Independent.cjs`'s `countMoreFewerMcq` route is hardcoded to the literal strings "More
stars"/"More hearts"/"They are equal" — since my correct option is "More ducks," that generator
route could never solve this remedial even if fed it, satisfying R4 robustly (the remedial carries
no `variant` field, so no test round-trips it through a solver, but the choice holds up to manual
scrutiny regardless). Post-fix harness: **ALL CHECKS PASSED**, zero collisions against any main
step, remedial concept narration===body preserved untouched (R6 satisfied — no leak).

**visualDecision = REQUIRED**: one-to-one pairing is an inherently spatial/concrete K-level
concept, delivered via two precise, tested, registered figures plus tenFrame manipulatives on both
interactives. **gradeLanguageDecision = FIT** (readingProfile "early," concept bodies within the
25-word cap, concrete nouns throughout). Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the
generic VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-kcm-01-01`, reviewedBasisHash `12dfc42acd047e53bff6f6b273aace85bc4ad07d714444bbf165ccf7f617cad1`.

---

### kcm-02-01 — Groups That Match Exactly

Kindergarten, ch2: equal groups via one-to-one pairing, and conservation of number under
rearrangement.

**Verification.** Same harness, same three tests re-run: `lintLesson()===[]`; every widget
(including the fixed remedial) integral and evaluator-consistent; session306's pinned hashes for
`k1`/`k2`/`ch1` re-derived and confirmed byte-identical to the committed pins; session198 solver
round-trips confirmed for `k1` (`countMoreFewerMcq`), `k2` (`countCompareEqualMcq`), and `ch1`
(`countMoreFewerMcq`).

**A near-miss I caught before editing.** I initially flagged `ch1`'s prompt ("Four drums pair
**exactly** with four sticks. Which statement describes the result?") as a possible
answer-telegraphing leak — the word "exactly" arguably announces "equal" before any reasoning is
required. Before touching it, I found session306 **byte-pins this exact prompt+options via
SHA256**, with an inline comment confirming it was deliberately re-authored and signed in a prior
session (S322) specifically to fix a different, already-resolved "stale stars/hearts
stub-template" defect. Rewriting it would have silently broken a locked, signed, tested contract
to chase a debatable stylistic concern. I stood down and left `k1`/`k2`/`ch1` completely
untouched, and confirmed via re-derived hashes that no drift occurred.

**Figures.** `c1`="khm-any-order-same-total", `c2`="khm-paired-groups-leftover" — both *required
exactly* by session253's `expectedFigures` map, untouched. `khm-any-order-same-total`
(`howManyFigures.tsx:48`) title "The same five toys give total five whether counted left to right
or right to left" closely matches c1's body. `khm-paired-groups-leftover` is reused here as the
*contrasting* case — Ana's 6 grapes vs. Ben's 7, one leftover — illustrating c2's closing claim ("A
leftover would prove that the groups were not equal"): a truthful, deliberate pairing of a
not-equal worked example with a general statement about what non-equality would look like.

**Content.** `k1` (4=4 → equal) correct. `k2` tests *symbolic* numeral comparison ("Compare 4 and
4") rather than object groups — a genuine representation shift matching the cml's
concrete-to-symbolic goal — all 3 traps (first-number bias, self-comparison confusion, false
"cannot tell") correctly diagnosed. `k3` (numberLineHop, "start at 11 and count on 2") matches the
`kCountFromHop` regex contract exactly (11+2=13), both traps (12 undershoot, 14 overshoot) exact.
Progression: `k1`=objects, `k2`=bare numerals, `k3`=counting-sequence strategy, `ch1`=paraphrase an
already-paired outcome — four distinct jobs.

**One defect found and fixed (S316 R1 violation), same class as kcm-01-01's.** The remedial check
widget's prompt ("There are 4 stars and 4 hearts. Which statement is true?") was **byte-identical**
to `k1`'s own prompt, options array only reordered. Fixed with a fresh scenario: "8 socks and 8
shoes are set out to be paired. Which statement is true?" — fresh nouns and a number (8) unused
elsewhere in this lesson. Considered R4 carefully: since my remedial resolves to the equal case,
and `countCompareEqualMcq` always returns the noun-agnostic literal "They are equal" regardless of
input numbers, a pure-coincidence solver match on *value* is theoretically possible — but the
remedial carries no `variant` field (never solver-round-tripped by any test), and more importantly
its narrative object-pairing *style* does not match `countCompareEqualMcq`'s own established
authored shape (a bare "Compare N and M," per `k2`'s actual text, with no nouns or narrative at
all) — so it is not a stylistic near-duplicate of what that form would author. Post-fix harness:
**ALL CHECKS PASSED**, zero collisions against any main step, remedial concept narration===body
preserved untouched (R6 satisfied).

**visualDecision = REQUIRED**: equal-groups-via-pairing and conservation-under-rearrangement are
inherently spatial/concrete K-level concepts, delivered via two precise, tested, registered
figures plus tenFrame manipulatives on both interactives. **gradeLanguageDecision = FIT**
(readingProfile "early," concept bodies within the 25-word cap, concrete nouns throughout). Not in
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-kcm-02-01`, reviewedBasisHash `bb1989c71401e52ed7ccbe73b220c26aa5ab89a7d2cc876f6859ba285680c561`.

---

## how-many-k

This course also carries its own binding tests: `session198.howManyK.test.ts` (course shape, the
"all-A K recipe," 25-word early-profile cap, solver round-trips, and two hard MCQ contracts —
`options[0].correct` must be true for every main-sequence mcq, and every option feedback must be
≥25 chars) and `session249.howManyKCourseIntegrity.test.ts` (`lintLesson`, all 32 course-wide
concept figures registered/unique/`khm`-prefixed, `i1≠i2`, main-sequence-only collision scan). Both
re-run by hand against both lessons, pre- and post-fix.

### khm-01-01 — Touch and Count

Kindergarten, ch1: one-to-one correspondence via touch-counting.

**Verification.** `lintLesson()===[]`; `readingProfile==='early'`; every widget (main and the fixed
remedial) `widgetIntegrityErrors===[]`; every mcq option label/feedback unique with feedback ≥25
chars (new remedial options run 90–100 chars); `options[0].correct===true` confirmed unbroken on
`k1`/`k2`/`ch1` (untouched); solver round-trips confirmed for `k2`/`ch1` (`countObjectsMcq`).

**Figures.** `c1`="khm-toy-one-to-one", `c2`="khm-touch-tracks-count" — both registered,
`khm`-prefixed, verified truthful (`howManyFigures.tsx:34-35`): "Four toys are paired with the
count words one through four, once each" matches c1's body precisely; "A touch marker moves across
four toys so none is skipped or counted twice" matches c2's body precisely. Untouched.

**Content.** `k1` (why touch each toy → pairs each toy with one number) correct, all 3 traps
(volume, "toys like being touched," tidying) correctly diagnose real K misconceptions about *why*
the touch matters. `i2` (tapDiagram, choosing the record proving one-to-one counting of 4 toys:
3/4/5 marks) correct and well-diagnosed. `k2` (counts 1..9 → 9) and `ch1` (counts 1..5 → 5) both
correct cardinality checks, solver-confirmed, all traps (stop-early, run-over) correctly diagnosed.
`k3` (numberLineHop, start 5 hop forward 4 → 9) correct, both traps exact. Progression: `k1`=why
(procedural reasoning), `i2`=recognize valid evidence in a different representation, `k2`/`ch1`=
apply cardinality, `k3`=hop-based counting-on — genuinely distinct jobs, no pure repeats.

**One defect found and fixed (S316 R1/R2/R3 violation — full duplicate).** The remedial check
widget was a **complete byte-for-byte duplicate of k1** — identical prompt, identical 4 options
(same ids, labels, correct flags, feedback, even array order). Fixed with a fresh angle testing the
same concept from its logical converse: "Zara counts 5 blocks but forgets to touch one of them.
What happens to her count?" (correct: "It comes out one too small"). `k1` carries no `variant`
field (a "why" conceptual question, not solver-backed), so R4 producibility is not a mechanical
concern. R6 checked: the remedial concept (unchanged, generic) does not name or imply this
specific check's answer. Post-fix harness: **ALL CHECKS PASSED**, zero collisions against any main
step.

**visualDecision = REQUIRED** (one-to-one correspondence is inherently concrete/spatial at K-level;
two precise, registered, course-unique figures plus tenFrame and tapDiagram manipulatives).
**gradeLanguageDecision = FIT** (readingProfile "early," 25-word cap respected, concrete
vocabulary). Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic
VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-khm-01-01`, reviewedBasisHash `d8c3b80db6218d9552de060fe9f4931f6ffd5880808914894d27663ec0ba9605`.

---

### khm-01-03 — Counting in a Line

Kindergarten, ch1: counting a line, start-at-an-end, counted-behind/waiting-ahead.

**Verification.** Same harness, same two tests: `lintLesson()===[]`; `readingProfile==='early'`;
every widget (main and fixed remedial) integral; feedback lengths and `options[0].correct`
convention confirmed unbroken on `k1`/`k2`/`ch1`; solver round-trips confirmed for `k1`
(`countObjectsMcq`), `k2` (`countBetweenMcq`), `ch1` (`countObjectsMcq`).

**Figures.** `c1`="khm-row-start-end", `c2`="khm-counted-vs-waiting" — both registered,
verified truthful (`howManyFigures.tsx:38-39`): "A row is counted from one end to the other
without jumping over an object" matches c1's body precisely; "A moving finger separates counted
objects behind it from objects still waiting ahead" matches c2's body precisely. Untouched.

**Content.** `k1` (counts 1,2,3 → 3) and `ch1` (counts 1..5 → 5) both correct cardinality checks,
solver-confirmed. `k2` ("which number comes between 3 and 5" → 4) correct, solver-confirmed
(`countBetweenMcq`) — a genuinely different job (ordinal/between reasoning vs. cardinality). `i2`
(dragOrder: sequence start/touch/stop into a safe order) tests procedural sequencing. `k3`
(numberLineHop, start 8 count on 2 → 10) correct, both traps exact. `i1`'s predict block (why start
at an end, not the middle) correctly reasoned. Progression: WHY start at an end, cardinality,
ordinal between-ness, procedural sequencing, count-on hopping — five distinct jobs.

**One defect found and fixed (S316 R1/R2/R3 violation — full duplicate), same class as
khm-01-01's.** The remedial check widget duplicated `k1` completely. This one needed extra care:
`k1` *and* `ch1` both already occupy the `countObjectsMcq` template shape ("[Name] counts her
blocks: [sequence]. How many blocks does she have?") — simply swapping the name/numbers under that
same template would have been directly *producible* by that generator form, an R4 violation even
if the raw text technically differed. Instead designed a structurally different remedial testing a
different sub-idea from this lesson (c1/i1's start-at-an-end point — deliberately not the
remedial's own concept-adjacent "behind/ahead" claim, to avoid a direct R6 echo of the immediately
preceding concept text): "Priya wants to count a line of 6 shells. Where should she start?"
(correct: "At one end of the line"). Verified the prompt contains only one number with no
enumerated sequence for `countObjectsMcq`'s `Math.max(...)` extraction to meaningfully resolve
against non-numeric text options, so that route cannot solve it even coincidentally. Post-fix
harness: **ALL CHECKS PASSED**, zero collisions against any main step.

**visualDecision = REQUIRED** (counting-in-a-line and counted/waiting are inherently spatial
K-level ideas; two precise, registered, course-unique figures plus numberLineHop and dragOrder
manipulatives). **gradeLanguageDecision = FIT** (readingProfile "early," 25-word cap respected).
Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-khm-01-03`, reviewedBasisHash `89cd63b5d81c2ac23bc1afbf5f4e8c9c566032aeb236ddedd33545bdf2b23dde`.

---

## right-triangles-trig

HS geometry/trig — reviewed with the extra rigor the task calls for at this level. This course
carries `session288.rightTrianglesTrigFigureChoice.test.ts` (byte-level SHA256 pins on specific
figures and mcq option sets) and a prompt-string-keyed independent answer bank,
`src/lib/geometryIndependentAnswers.json`, consumed by `src/lib/geometryIndependent.cjs`. Every
numeric/mcq value in both lessons was checked against **three independent oracles**: my own node
arithmetic, the real `WidgetSpec`/`widgetIntegrityErrors`/`evaluate()`, and the real
`geometryIndependent.cjs` solver loaded and executed live against each widget's actual authored
prompt text. All three agreed exactly, on every value, in both lessons.

### rt-01-04 — 30-60-90 Triangles

**Verification.** `k1` (short leg 4 → hyp 8), `k2` (hyp 14 → long leg 12.12), `k3` (long leg 9 →
hyp 10.39), `ch` (equilateral side 10 → altitude 8.66) — all four solver-confirmed. Every
`commonErrors` trap across all four numeric widgets recomputed and confirmed exact (4.62=8/√3,
6.93=4√3, 5.66=4√2, 24.25=14√3, 9.9=14/√2, 18=2×9, 15.59=9√3, 5.2=short-leg, 5=half-base,
10=slant-not-height, 7.07=5√2). `i1`'s triangleSolve interactive (opp/hyp ratio invariance at 30°)
verified: sin(30°)=0.500000 exactly, cross-checked against the course's own
`src/lib/conversions.s120.test.ts`. `i2`'s route-selection mcq hand-verified precisely, including
its o3 distractor's specific numeric claim ("overshooting by a factor of √3") — node-confirmed
exactly true.

**One defect found and fixed.** `k1`'s trap-4.62 feedback read "≈ 4√3/√... mixing rules." — a
garbled, apparently truncated sentence (a dangling "√" with nothing after it, then a trailing
ellipsis), which also failed to name the real mechanism. Node-verified the trap's true origin:
4.62 = 8/√3 (dividing the *correct* hypotenuse, 8, by √3 for no reason). Rewrote the feedback to
name this exact, verified mechanism.

**Considered but deliberately not changed.** `k3` ("long leg 9 → hypotenuse") reuses the exact same
numbers as `c2`'s own worked example two steps earlier (short=3√3≈5.20, hyp=6√3≈10.39) — a mild
memorization-risk softness (k2 and i2 intervene, providing some distraction). Investigated fixing
this and found it is **not safe**: k1/k2/k3's exact prompt strings are individually keyed in
`src/lib/geometryIndependentAnswers.json`'s `rt-306090__numeric` answer bank (under `src/lib/`,
out of edit scope) — changing k3's numbers would desync it from that bank with no way to repair the
bank myself. Given the extensive evidence of deliberate, previously-signed, carefully pinned
choices elsewhere in this course (session288's pins, re-derived and confirmed untouched below), and
that this is a mild softness rather than a factual or diagnostic error, judged this not to rise to
a fix-directly defect — documented here rather than silently missed.

**Figures.** `c1` has **no** figure — session288 explicitly pins this absence ("withholds all five
stale fixed-number figures"), confirming a prior session deliberately removed a static figure from
c1; re-derived the pin's body-hash and confirmed c1's body is byte-identical/untouched. `c3`'s
figure `rt-special-preview` (`figures.tsx:19831`) is a minimal, accurate transition label matching
c3's bridging text precisely. `i2`'s mcq is byte-pinned by session288 (evaluatorSeal + labelsHash)
— re-derived both hashes from the current file and confirmed unchanged.

**Progression:** i1=discover/prove ratio invariance, k1/k2=application from two directions,
i2=abstract route-selection, k3=application from a third direction, ch=transfer to a different
problem type — six distinct jobs. Remedial (hyp 6 → short leg 3) verified via `evaluate()`, both
traps exact and well-diagnosed, zero collision against any main step.

**visualDecision = SUFFICIENT**: the genuine visual/manipulative need (proving ratio invariance
under rescaling) is fully carried by the `i1` triangleSolve interactive; concept steps deliberately
favor precise algebraic derivation over static pictures (c1 has none by prior deliberate design),
and every check step is purely computational with no diagram needed to solve it.
**gradeLanguageDecision = FIT**. Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic
VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / SUFFICIENT / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-rt-01-04`, reviewedBasisHash `b1ba163ec3175b51bbd44f3b04cbe09e41ad76db4922a7f570157ff95cf3d88e`.

---

### rt-05-04 — Choosing the Tool & Trig Area

**Verification.** `k1` (sides 8,11 at 40° → area 28.28), `k2` (right triangle, adjacent leg 24 at
31° → opposite 14.42), `k3` (mcq: b·sinC is the height above base a), `ch` (sides 6,10 at 30° →
area 15 exactly, since sin30°=0.5 exactly) — all four solver-confirmed. Every trap recomputed and
confirmed exact (56.57=forgot-½/parallelogram, 44=dropped-sine, 33.71=wrong-ratio cosine, 39.94=
inverted tangent operation, 12.36/20.57=wrong ratio, 30=dropped-sine, 25.98=wrong-ratio cosine,
60=missing both). `i1`/`i2`'s dispatch-classification mcqs hand-verified, including i1's
third-angle claim (48+67=115, 180−115=65, node-confirmed) and i2's SAS/Cosines classification.

**One defect found and fixed.** `i1`'s prompt read "...and the side between... opposite the 48° is
21." — a garbled sentence fragment (a dangling, unfinished "between..." clause immediately followed
by "opposite the 48°," reading as a leftover, uncleaned edit artifact). Fixed by removing the stray
fragment: "...and the side opposite the 48° is 21." Verified this was safe against session288's
byte-pins on `i1`'s mcq (two SHA256 hashes covering options/correct-flags/feedback/labels) by
reading the test's own hashing functions — neither hash includes the widget's `prompt` field, so
the prompt was always free to fix; re-derived both pinned hashes post-fix and confirmed
byte-identical to the committed pins.

**Figures.** `c1`="rt-area-sine" (`figures.tsx:20028`) matches c1's body precisely. `c2`=
"oblique-triangle-laws" (`figures.tsx:11515`) is a detailed, precisely labeled triangle (vertices
A/B/C, sides a/b/c each opposite its same-letter angle) captioned with both the Law of Sines and
Law of Cosines — an exact match to c2's dispatch-rule text, and directly load-bearing for the
"opposite"/"included angle" language used throughout the lesson's word problems.

**Progression:** k1=apply the area formula, i1/i2=two dispatch-classification rounds on genuinely
different given-patterns, k2=recognize when the simpler tool beats the general laws, k3=explain WHY
the formula works (derive, not just apply), ch=synthesize the whole course into one exact-value
capstone — six distinct jobs building from application to justification to synthesis. Remedial
(SSS → Law of Cosines) verified via `evaluate()`, zero collision against any main step.

**visualDecision = REQUIRED**: this lesson is fundamentally about correctly reading which
sides/angles are given and how they relate spatially to dispatch to the right tool — the labeled
reference figure is genuinely load-bearing for the "opposite"/"included" vocabulary every word
problem depends on. **gradeLanguageDecision = FIT** (the one clarity defect found is now fixed).
Not in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` beyond the generic VISUAL/LANGUAGE/LESSON rows.

**Disposition: KEEP / REQUIRED / FIT.** Appended to `laneB-s327-A6.jsonl` as
`s327-A6-rt-05-04`, reviewedBasisHash `3cd5773ac141dff284dbaf8824ce299523283e5e9ea1e2605c5a06634664aa23`.

---
