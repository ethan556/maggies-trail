# S320-A5 — Independent Assessment: `number-writing-k`, `shapes-build-k`, `counting-to-20-k`

Independent Cowork assessment of three complete K–calculus math courses —
`content/courses/number-writing-k` (14 lessons), `content/courses/shapes-build-k` (14 lessons), and
`content/courses/counting-to-20-k` (13 lessons), 41 lessons total. Every lesson JSON and all three
`course.json` files were read in full (all lessons re-read a second time, fresh, after a mid-session
context compaction, to eliminate any risk of relying on stale memory). Every count, comparison, hop
landing, ten-frame fill, decomposition pair, and MCQ correctness claim named in any
prompt/widget/commonError/feedback/hint/explanation/reveal string across all 41 lessons was
recomputed by hand. Read-only on all content; the only writes are this report and the disposition
NDJSON at `reports/closure/cowork-staging/laneB-s320-A5-dispositions.jsonl`.

This report was produced starting from `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache is
evidence only, nothing here approves its own work, and this packet does not touch the ledger.

Four programmatic scans supplemented manual reading, all re-run fresh at report-writing time:

- A **schema/widget-integrity checker** (checks mcq single-correct-answer invariants, tenFrame
  `preFilled < target`, numberLineHop landing/start-on-line and landing≠start, subitizeFlash options
  containing the true count with no duplicates, dragOrder/matchPairs id-referential integrity,
  baseTenCompose/unitRuler reachability math) — **0 errors across all 287 widgets** in the three
  courses.
- A **structural lint checker** (25-word early-profile concept-body cap, every action step has a
  widget, every check/challenge has a conceptTag and two differing explanationVariants, every
  challenge has exactly 3 hints, dragOrder items not pre-solved, no generic/templated wrong-answer
  feedback, no thin (<25-char) distractor diagnoses, recap-last/1-3-takeaways/teaser rules, ≥60%
  action-step density) — **0 errors across all 41 lessons**.
- An **exact-duplicate scanner** (MCQ prompt+option-label identity, subitizeFlash count+arrangement+
  prompt+options identity, and a generic per-widget-type identity check for tenFrame/numberLineHop/
  tapDiagram/dragOrder/baseTenCompose/unitRuler) run within-course and cross-course.
- A **basis-hash re-verification** (`node scripts/session/print-review-basis.mjs` re-run against
  current file bytes a second time, diffed programmatically against the first pass) — **0 byte
  drift across all 41 lessons**, confirming no content file was modified at any point in this
  session, including across the mid-session context compaction.

Both mechanical checkers found zero structural/schema errors, which is expected — the 18 REVISE
findings below are all semantic-content defects (feedback that contradicts its own step's prompt,
prompts that promise a visual state the widget cannot render, or genuine duplicate content) that
schema validation and structural lint are not designed to catch; every one was found by hand-reading
each lesson against its own prompt/widget/feedback chain, then corroborated with the duplicate
scanner's exact-identity output.

## Special task: `counting-to-20-k` QUESTION_DIVERSITY_AND_TRANSFER rows — assessed on the merits

The task brief flagged that `counting-to-20-k` carries 2 `QUESTION_DIVERSITY_AND_TRANSFER` (QD) rows
still counted as open in the aggregate `audit:pending-workload` accounting per
`reports/closure/S319_EXCELLENCE_REFRESH.md`, and asked for a fresh, independent read rather than
deferring to either that count or S319's own conclusion. The two rows are `kc-01-01` and `kc-04-03`
(the only two `kc-` entries in S319's 15-row table). S319's own live-tier trace already argues both
"drop out" of the C/D backlog (live tier B, not C/D, for both), but that argument rests on the
`flagship-tier.mjs` scoring pipeline, not a fresh content read — so both lessons were re-read here
specifically through the QD lens (interactionIntent variety, representation variety, and whether the
lesson's challenge step demands genuine transfer rather than rote repetition of the same task with
new numbers), independent of any prior tooling verdict.

- **`kc-01-01` ("Count the Dots") — confirmed clean on the merits.** The lesson's four action steps
  are not a repeated template: `k1`/`k2` are perceptual subitizing at two different arrangements
  (dice, line); `k3` is an MCQ that requires reading a *word problem* ("Maya counts her toys: 1, 2,
  3, 4, 5, 6...") and applying the "last number said = how many" rule in a new (non-visual, narrative)
  context; `ch1` is a genuine transfer task — "six dots were counted, then only moved into a
  scattered pattern... how many must flash?" — requiring the child to apply number-conservation
  reasoning to a rearrangement they did not watch happen, a distinctly different cognitive demand
  (predict/justify) from straightforward counting. This is real interactionIntent and representation
  diversity, not four instances of one task shape.
- **`kc-04-03` ("Break Apart Numbers") — confirmed clean on the merits.** Across `i1`/`k1`/`i2`/`k3`
  the decompose-and-fill task is anchored in four different concrete contexts (loose dots, crayons in
  boxes, blocks in towers) with different target numbers each time; `k2` changes the task shape
  entirely to an *equal*-split MCQ ("6 cherries shared EQUALLY between two bowls"), a different
  mathematical demand (equal partition, not arbitrary decomposition) from every ten-frame step; `ch1`
  is a genuine transfer task — "move one counter from the 5-part to the 2-part, which new split do you
  get?" — requiring the child to reason about how a transformation changes a decomposition while
  preserving the whole, not just repeat "fill the frame to N."
- **Net finding**: on independent re-read, neither lesson shows a live question-diversity-and-transfer
  defect as currently authored. This corroborates (rather than merely defers to) the S263
  `NOT_REPRODUCIBLE` disposition and S319's live-tier data. Both are dispositioned KEEP below on that
  basis, reached from this session's own read of current source, not by inheriting either the stale
  workload count or S319's own conclusion.

## Result counts

- `number-writing-k`: 14 lessons reviewed — **7 KEEP, 7 REVISE**, 0 ESCALATE.
- `shapes-build-k`: 14 lessons reviewed — **5 KEEP, 9 REVISE**, 0 ESCALATE.
- `counting-to-20-k`: 13 lessons reviewed — **11 KEEP, 2 REVISE**, 0 ESCALATE.
- Combined: 41/41 lessons signed, **23 KEEP / 18 REVISE / 0 ESCALATE**.

`visualDecision` is REQUIRED for every lesson in all three courses: every action step's core widget
(`tenFrame`, `numberLineHop`, `tapDiagram`, `subitizeFlash`, `dragOrder`, `baseTenCompose`,
`unitRuler`, `matchPairs`, the single `numberLinePlace` instance) *is* the mathematical
representation being taught — there is no lesson in this batch built only from symbolic/text widgets
with a merely-decorative supporting figure, so no lesson qualified for SUFFICIENT. `gradeLanguageDecision`
is FIT for all 41 lessons — every concept body was word-counted against the 25-word early-profile cap
(all readingProfile="early") and every step's language was read for read-aloud, K-appropriate phrasing;
no violations found anywhere in either course.

None of the 18 REVISE findings involve a *missing* visual or a math error in a widget's own
grading/answer logic (confirmed by the 0-error schema pass above) — every REVISE is either (a) a
feedback/prompt string that contradicts its own step's actual task (copy-pasted from a differently-
themed widget elsewhere in the platform), (b) a prompt asserting a visual state (e.g. "a full ten is
already shown") that the chosen widget type structurally cannot render, or (c) duplicate content
(a later lesson repeating an earlier lesson's exact widget/stimulus with no new instructional job).
Because (b) is a case where the *promised* visual does not match what actually renders, those lessons'
`visualDecision` is REQUIRED specifically because the fix must restore a working visual promise, not
because a visual is absent.

## REVISE list — precise implementation contract per lesson

### `number-writing-k` / `kcw-01-04` — i1 tapDiagram: feedback copy-pasted from an unrelated shape widget

Step `i1` ("Tap the plate that shows zero cookies") carries `missFeedback` ("Look at the sides and
corners of each shape, then tap the one the question describes.") and `successFeedback` ("Yes — a
circle is round all the way, like a coin or a clock.") that are both boilerplate from an unrelated
shape-identification widget. The actual task is empty-vs-non-empty cookie plates (zero-recognition);
no shapes, sides, corners, or circles appear anywhere in this widget. A kindergartner who succeeds is
told about coins and clocks instead of what they just proved about zero.

**Fix**: replace both strings with feedback describing the cookie-plate task, e.g. `missFeedback`:
*"Look for the plate with no cookies on it at all."*, `successFeedback`: *"Yes — an empty plate has
zero cookies on it."* (Step `k3`'s numberLineHop — "start at 10, count on 2," landing 12 — is the
first, originating use of that exact stimulus, later duplicated in `kcw-02-03`/i1; as the origin it
needs no change here.)

### `number-writing-k` / `kcw-02-02` — i1 tenFrame: false "already shown" claim

Step `i1` (tenFrame, `target=4, preFilled=0`) opens with prompt *"A full group of 10 is already
shown. Add the extra dots needed to make 14."* — but `preFilled=0` renders a completely empty frame;
nothing is "already shown." tenFrame's schema caps `target` at 10, so a single frame structurally
cannot display a full ten plus teen extras at once, yet the prompt claims it does.

**Fix**: either (a) reword the prompt to stop claiming a pre-filled ten is visible — e.g. *"Fourteen
is a full ten plus 4 more. Tap 4 dots to show the 'more' part."* — or (b) swap the widget to
`baseTenCompose` (already used correctly for the identical concept in this course's own teen lessons,
e.g. `kcw-03-01`/k1), which can render tens and ones together without the false claim.

### `number-writing-k` / `kcw-02-03` — i2 tapDiagram false-visual claim + i1 numberLineHop duplicate

Two issues. (1) Step `i2` (tapDiagram) prompt states *"One ten and two extra ones are shown. Tap the
numeral that reveals that structure."* but the three hotspots are plain numeral-text badges (icon
`'11'`, `'12'`, `'21'`, `count=1`) — no dot array, ten-frame, or picture of "one ten and two ones" is
actually rendered; tapDiagram hotspots with numeral-text icons render as plain badges, not quantity
pictures. (2) Step `i1`'s numberLineHop (prompt *"Start at 10 and count on 2. Tap where you land."*,
`min=8,max=14,start=10,hop=1,hops=2`, and every `commonLandings`/miss/success/low/high feedback
string) is byte-for-byte identical to `kcw-01-04`/k3, confirmed via full-corpus generic-widget
duplicate scan — the identical hop task recurs one chapter later, differentiated only by an added
`predict` sub-question, not by the underlying numberLineHop task itself.

**Fix (1)**: reword the prompt to not claim a ten-and-two visual is present — e.g. *"Which numeral
means one ten and two extra ones? Tap it."* **Fix (2)**: change `i1`'s `start`/`hop`/`hops` (e.g.
`start=13, hops=2`, landing 15) so the hop exercise itself is distinct from `kcw-01-04`/k3, keeping
the `predict` sub-question unchanged.

### `number-writing-k` / `kcw-02-04` — i1 tenFrame false claim + ch1 subitizeFlash regresses off teen numbers

Two issues. (1) Step `i1` (tenFrame, `target=6, preFilled=0`) has the same false *"A full group of
10 is already shown"* claim as `kcw-02-02`/i1, contradicted by `preFilled=0` — same fix. (2) Step
`ch1` (subitizeFlash) is this "Thirteen Through Nineteen" lesson's capstone challenge, but because
subitizeFlash's schema hard-caps `count` at 10, it cannot subitize any teen number — it instead tests
recognizing a plain "7," unrelated to any number 13–19 the lesson actually teaches. The teen-numeral
lesson's final challenge exercises no teen numeral.

**Fix (1)**: reword the prompt or swap to `baseTenCompose`, matching `kcw-02-02`/i1's fix. **Fix
(2)**: swap `ch1` to a `baseTenCompose` or `numberLineHop` widget targeting an actual number in
13–19, consistent with `k1`/`k2`/`k3` in the same lesson.

### `number-writing-k` / `kcw-03-01` — i1 tenFrame + i2 tapDiagram, both false-visual claims

Two occurrences of the same two bug classes seen in `kcw-02-02`/`kcw-02-03`. (1) Step `i1` (tenFrame,
`target=7, preFilled=0`): prompt *"A full group of 10 is already shown. Add the extra dots needed to
make 17."* is false — `preFilled=0` renders an empty frame. (2) Step `i2` (tapDiagram): prompt *"A
full ten and seven extra dots are shown. Tap the numeral you should write."* but hotspots are
numeral-text badges (`'16'`,`'17'`,`'18'`), not a dot/ten-frame picture — nothing showing "a full ten
and seven dots" is rendered.

**Fix**: same pattern as `kcw-02-02`/`kcw-02-03` — reword both prompts to stop asserting a
pre-existing visual that isn't rendered, or move the "ten already shown" teaching moment to the
`baseTenCompose`-based checks (`k1`) that can actually render it.

### `number-writing-k` / `kcw-03-03` — ch1 subitizeFlash: byte-for-byte duplicate of kcw-01-05/k2

Step `ch1`'s subitizeFlash (`count=4, arrangement=tenFrame, options=[3,4,5,6]`, prompt *"Look at the
ten-frame flash and choose the matching numeral."*) is a byte-for-byte duplicate of `kcw-01-05`/k2's
subitizeFlash (same count, arrangement, options, and prompt), confirmed via full-corpus scan of every
subitizeFlash stimulus in the course. Two chapters apart, the learner is given the identical
flash-and-guess exercise a second time, presented as new capstone content.

**Fix**: change `ch1`'s count to an unused single-digit value (e.g. 6 or 9) with correspondingly
updated `options`/`commonPicks`/feedback, so the challenge is distinct from `kcw-01-05`'s.

### `number-writing-k` / `kcw-03-04` — i2 false-visual claim + ch1 and k3 duplicates

Three issues. (1) Step `i2` (tapDiagram) prompt states *"The word says 'five' and the picture shows
five dots. Tap the matching numeral."* but hotspots are plain numeral-text badges (`'4'`,`'5'`,`'6'`,
`count=1` each) — no picture of five dots is rendered, contradicting the prompt's explicit visual
claim. (2) Step `ch1`'s subitizeFlash (`count=7, arrangement=tenFrame, options=[6,7,8,9]`) is a
byte-for-byte duplicate of `kcw-02-04`/ch1's subitizeFlash — identical count, options, prompt, and
even identical `commonPicks`/miss/success feedback text verbatim. (3) Step `k3`'s numberLineHop
(prompt *"What number comes right after 6? Hop one and tap where you land."*,
`min=3,max=10,start=6,hop=1,hops=1`, and every feedback string) is byte-for-byte identical to
`kcw-01-02`/k3, confirmed via the same duplicate scan — two chapters apart, the identical hop task is
repeated with only the `explanationVariants` text changed.

**Fix (1)**: reword the prompt to not claim a dot picture is shown, e.g. *"The word says 'five'. Tap
the matching numeral."* **Fix (2)**: change `ch1` to an unused count (e.g. 9) with matching
options/feedback, distinct from `kcw-02-04`. **Fix (3)**: change `k3`'s `start`/`hop`/`hops` (e.g.
`start=8, hops=1`, landing 9) so the hop exercise is distinct from `kcw-01-02`/k3.

### `shapes-build-k` / `kgb-01-01` — i2 + ch1: circle boilerplate mismatched to position-word tasks

Step `i2` ("Tap the cat that is above the table") and step `ch1` ("Tap the cat that is below the
table") both carry `successFeedback` *"Yes — a circle is round all the way, like a coin or a
clock."* — boilerplate from an unrelated circle-identification widget, pasted into two position-word
(above/below) cat-and-table tasks that never mention circles, coins, or clocks.

**Fix**: replace both with feedback that confirms the position word, e.g. `i2`: *"Yes — this cat is
above the table."* (matching the parallel, correctly-worded `i1` step in the same lesson) and `ch1`:
*"Yes — this cat is below the table."*

### `shapes-build-k` / `kgb-01-02` — i2: same circle-boilerplate mismatch

Step `i2` ("Tap the cat that is beside the table") carries the same copy-pasted circle
`successFeedback`, mismatched to a beside/position task with no circles involved.

**Fix**: replace with *"Yes — this cat is beside the table."*, matching the correctly-worded `i1`
step in the same lesson.

### `shapes-build-k` / `kgb-01-03` — i1: circle-boilerplate mismatch + remedial copy-paste artifact

Step `i1` ("Find the cat next to the table") carries the same copy-pasted circle `successFeedback`,
mismatched to a beside/position task. Secondary, minor issue: the remedial check's correct option
label is *"Each word compares the cup to a different landmark"*, but the remedial's own prompt is
about *"a toy... below a shelf and above a rug"* — no cup appears in that prompt (carried over
unedited from a sibling lesson's cup/shelf/lamp scenario).

**Fix**: replace `i1`'s `successFeedback` with *"Yes — this cat is beside the table."*; reword the
remedial's correct option to *"Each word compares the toy to a different landmark"* to match its own
prompt.

### `shapes-build-k` / `kgb-02-02` — remedial feedback about the wrong transformation + k3 numberLineHop duplicate

Two issues. (1) The remedial check's prompt asks *"A square grows larger. What shape is it after it
grows?"* (a size-invariance question, matching the remedial's own `kgb-size-invariance` conceptTag)
but all four options' feedback strings talk about turning/rotation/spin instead — e.g. the correct
option's feedback reads *"Correct — turning moves a shape without changing its sides and corners, so
its name survives,"* and a distractor reads *"Turning is not growing — every side keeps its length
through the spin."* None of the four feedback strings address growing/size at all; the same four
strings appear correctly, on-topic, on `kgb-01-05`/k3 and `kgb-02-01`/k3 (both genuinely about
turning), confirming this is a copy-paste rather than an intentional overlap. (2) Step `k3`'s
numberLineHop (`start=4,hop=1,hops=4,min=2,max=10`, landing 8) duplicates `kgb-01-05`/k2's
numberLineHop byte-for-byte (same parameters, same `commonLandings` values, nearly identical
feedback), presenting the identical corner-counting hop exercise as new content one chapter later.

**Fix (1)**: rewrite all four remedial option feedback strings to address growing/size directly, e.g.
correct: *"Correct — growing changes size, not the sides and corners that make a square."* **Fix
(2)**: change `k3`'s numbers (e.g. `start=3, hops=3`) so the exercise is distinct from
`kgb-01-05`/k2.

### `shapes-build-k` / `kgb-02-03` — i2: circle-boilerplate mismatch + k3 numberLineHop triple-duplicate

Two issues. (1) Step `i2` ("Tap every triangle, even when its size or direction is different")
carries the same copy-pasted circle `successFeedback`, mismatched to a triangle-identification task
with no circles present. (2) Step `k3`'s numberLineHop (`start=4,hop=1,hops=4,min=2,max=10`, landing
8) duplicates both `kgb-01-05`/k2 and `kgb-02-02`/k3 byte-for-byte — the same exact hop exercise now
appears a third time across the course.

**Fix (1)**: replace with *"Yes — each triangle has 3 straight sides, even when it turns or changes
size."* (matching `i1`'s correctly-worded parallel text in this same lesson). **Fix (2)**: use
different `start`/`hop`/`hops` numbers so this instance is distinct from both siblings.

### `shapes-build-k` / `kgb-02-05` — k3: circle-boilerplate mismatched to a 3-D stacking task

Step `k3` (tapDiagram, mode `selectOne`, "Tap the solid blocks that make the most stable tall tower"
— cones vs. spheres vs. cubes) carries the same copy-pasted circle `successFeedback`, mismatched to a
3-D solids/stacking task where the correct answer is cubes, not anything round.

**Fix**: replace with feedback about cubes/flat faces, e.g. *"Yes — cubes have flat faces that stack
steadily, one on top of another."*

### `shapes-build-k` / `kgb-03-02` — i1/i2 identical unitRuler within the lesson + k2 numberLineHop duplicate

Two issues. (1) Steps `i1` and `i2` use byte-identical unitRuler parameters within the same lesson —
both measure `objectStart=0` to `objectEnd=4` with `requiredPlacements=4`, and even `successFeedback`
is worded identically for both. Every other unitRuler lesson in the course (`kgb-01-04`, `kgb-02-02`,
`kgb-02-05`, `kgb-03-01`) varies the length between its two measurement steps; only `kgb-03-02`
repeats the same length twice, giving `i2` no fresh instructional value over `i1`. (2) Step `k2`'s
numberLineHop (`start=3,hop=1,hops=1,min=1,max=6`, landing 4) duplicates `kgb-02-04`/k3
byte-for-byte (same parameters, same `commonLandings` values, near-identical feedback).

**Fix (1)**: change `i2`'s `objectEnd`/`requiredPlacements` to a different length (e.g. 5 or 6),
matching the pattern used everywhere else in the course. **Fix (2)**: use different `start`/`hop`/
`hops` numbers for `k2` so it is distinct from `kgb-02-04`/k3.

### `shapes-build-k` / `kgb-03-03` — i1 sail leakage + i2 circle mismatch + k2 matchPairs feedback references content absent from the widget

Three issues. (1) Step `i1` ("A square window is cut from corner to corner. Tap the shape of either
piece") carries distractor feedback for its circle and square hotspots that both reference a "sail"
("does not make the pointy sides of a sail", "cannot narrow to a sail's single point") even though
no sail is ever mentioned in `i1`'s own prompt — copy-pasted verbatim from the sibling
sailboat-themed `i2` widget in the same lesson. (2) Step `i2` ("A sailboat has a pointy sail...")
carries the same copy-pasted circle `successFeedback`, mismatched to a triangle/sail task. (3) Step
`k2` (matchPairs) `successFeedback` reads *"All matched — coin, slice, door: circle, triangle,
rectangle!"* and its `pairErrors` entry reads *"A door has corners — round-with-no-corners is the
coin's circle."* but this widget's actual left/right content is half-circles→circle, four
triangles→larger square, six folded squares→cube, and two squares side-by-side→rectangle — there is
no "coin," "slice," or "door" anywhere in the widget, and no "triangle" outcome exists among the
right-side answers (there is a "cube" outcome the feedback never mentions). This looks like leftover
boilerplate from a differently-authored version of the widget.

**Fix (1)**: reword `i1`'s circle/square feedback to reference the window scenario, not a sail.
**Fix (2)**: replace `i2`'s `successFeedback` with something on-topic, e.g. *"Yes — the sail is a
triangle with 3 straight sides."* **Fix (3)**: rewrite `k2`'s `successFeedback` and `pairErrors`
feedback to reference the widget's actual items (half-circles, triangles, folded squares,
side-by-side squares) and their real answers (circle, larger square, cube, rectangle).

### `shapes-build-k` / `kgb-03-04` — i1 sail leakage recurs + k1 matchPairs bug duplicated (including into its own remedial)

Two issues, both recurring from `kgb-03-03`. (1) Step `i1` ("Tap the piece shaped like a slice with 3
straight sides") carries circle/square distractor feedback that references a "sail" even though
`i1`'s own prompt calls it a "slice," never a sail — copy-pasted from the same sail-themed template
used across this chapter's tapDiagram widgets. (2) Step `k1` (matchPairs) carries the identical
broken `successFeedback` ("All matched — coin, slice, door: circle, triangle, rectangle!") and
`pairErrors` feedback ("A door has corners — round-with-no-corners is the coin's circle.") as
`kgb-03-03`/k2, again referencing "coin," "slice," and "door" content that does not exist in this
widget's actual left/right pairs (rectangle, circle, larger square, square — no triangle, no cube, no
door, no coin). This same broken matchPairs (with identical `successFeedback`/`pairErrors`) is also
duplicated verbatim into this lesson's own remedial check, propagating the bug a third time.

**Fix (1)**: reword `i1`'s circle/square feedback to reference "slice," not "sail." **Fix (2)**:
rewrite `k1`'s `successFeedback` and `pairErrors` feedback (and the identical copy in the remedial)
to reference the widget's actual items and real answers, matching the fix applied to `kgb-03-03`/k2.

### `counting-to-20-k` / `kc-03-01` — i1/i2/ch1 tenFrame: false "FULL" claims across the lesson's first three widgets

This is the course's first teen-number lesson, and three of its widgets share the same structural
defect. Steps `i1` (`target=2, preFilled=0`, prompt *"The ten-frame is FULL (that is 10). Tap the
extra dots for 12"*), `i2` (`target=5, preFilled=0`, prompt *"The frame is full (10). Tap the extras
for 15"*), and `ch1` (`target=1, preFilled=0`, prompt *"The frame is full (10). I am the SMALLEST
teen number. Tap my extra dots"*) all claim the ten-frame is already full, but `preFilled=0` means
the rendered frame starts completely empty — since tenFrame's schema caps `target` at 10, a single
frame can never actually show a full ten plus teen extras together, so what the learner sees on
screen (an empty frame, then 1–5 dots tapped) never matches the "full ten already there" story the
prompt tells. This same lesson's own `k1`/`k2`/`k3` checks (`baseTenCompose`, targets 16/18/19)
demonstrate the fix already in use elsewhere in the same lesson.

**Fix**: replace the tenFrame widgets in `i1`, `i2`, and `ch1` with `baseTenCompose` widgets
(matching `k1`–`k3`'s pattern, targets 12/15/11), or at minimum reword every "the frame is FULL/full
(10)" sentence so it stops asserting a visual state the widget cannot render.

### `counting-to-20-k` / `kc-04-01` — ch1 mcq: distractor feedback names the wrong missing group

Step `ch1` ("A jar holds 2 red, 3 blue, and 4 green marbles. How many marbles in all?") has a
factually backwards distractor explanation. Option `c` (label "7") is 3+4 = blue+green, i.e. missing
the 2 red marbles — but its feedback reads *"That misses the blue — 2, 3, AND 4 make 9,"* telling the
learner they forgot blue when 7 already includes blue and actually omits red. (Option `b`, label "5"
= 2+3 = red+blue, is correctly diagnosed as missing green.)

**Fix**: change option `c`'s feedback to *"That misses the red — 2, 3, AND 4 make 9."*

## Full per-lesson verdicts

All entries below are `decision` / `visualDecision` / `gradeLanguageDecision`. Full rationale for
every lesson (including all 23 KEEP) is in the NDJSON at
`reports/closure/cowork-staging/laneB-s320-A5-dispositions.jsonl`.

**`number-writing-k`** (14/14 signed): kcw-01-01 KEEP/REQUIRED/FIT · kcw-01-02 KEEP/REQUIRED/FIT ·
kcw-01-03 KEEP/REQUIRED/FIT · **kcw-01-04 REVISE/REQUIRED/FIT** · kcw-01-05 KEEP/REQUIRED/FIT ·
kcw-02-01 KEEP/REQUIRED/FIT · **kcw-02-02 REVISE/REQUIRED/FIT** · **kcw-02-03 REVISE/REQUIRED/FIT** ·
**kcw-02-04 REVISE/REQUIRED/FIT** · kcw-02-05 KEEP/REQUIRED/FIT · **kcw-03-01 REVISE/REQUIRED/FIT** ·
kcw-03-02 KEEP/REQUIRED/FIT · **kcw-03-03 REVISE/REQUIRED/FIT** · **kcw-03-04 REVISE/REQUIRED/FIT**.

**`shapes-build-k`** (14/14 signed): **kgb-01-01 REVISE/REQUIRED/FIT** ·
**kgb-01-02 REVISE/REQUIRED/FIT** · **kgb-01-03 REVISE/REQUIRED/FIT** · kgb-01-04 KEEP/REQUIRED/FIT ·
kgb-01-05 KEEP/REQUIRED/FIT · kgb-02-01 KEEP/REQUIRED/FIT · **kgb-02-02 REVISE/REQUIRED/FIT** ·
**kgb-02-03 REVISE/REQUIRED/FIT** · kgb-02-04 KEEP/REQUIRED/FIT ·
**kgb-02-05 REVISE/REQUIRED/FIT** · kgb-03-01 KEEP/REQUIRED/FIT ·
**kgb-03-02 REVISE/REQUIRED/FIT** · **kgb-03-03 REVISE/REQUIRED/FIT** ·
**kgb-03-04 REVISE/REQUIRED/FIT**.

**`counting-to-20-k`** (13/13 signed): kc-01-01 KEEP/REQUIRED/FIT (QD row, reassessed — see special
section) · kc-01-02 KEEP/REQUIRED/FIT · kc-01-03 KEEP/REQUIRED/FIT · kc-02-01 KEEP/REQUIRED/FIT ·
kc-02-02 KEEP/REQUIRED/FIT · kc-02-03 KEEP/REQUIRED/FIT · **kc-03-01 REVISE/REQUIRED/FIT** ·
kc-03-02 KEEP/REQUIRED/FIT · kc-03-03 KEEP/REQUIRED/FIT · **kc-04-01 REVISE/REQUIRED/FIT** ·
kc-04-02 KEEP/REQUIRED/FIT · kc-04-03 KEEP/REQUIRED/FIT (QD row, reassessed — see special section) ·
kc-05-01 KEEP/REQUIRED/FIT.

## Methodology

- **Basis hashes**: computed in bulk via `node scripts/session/print-review-basis.mjs <ids>` against
  current file bytes, then re-run a second time at report-writing time and diffed programmatically
  against the staged NDJSON's `reviewedBasisHash` field — 0 mismatches across all 41 lessons,
  confirming no transcription error and no source drift across the session (including across the
  mid-session context compaction).
- **Arithmetic**: every tenFrame fill, numberLineHop start/hop/hops/landing, subitizeFlash count,
  tapDiagram hotspot count/comparison, dragOrder sequence, decomposition pair, and MCQ correctness
  claim named in any prompt/widget/commonError/feedback/hint/explanation string across all 41 lessons
  was recomputed by hand — including every `commonLandings`/`commonCounts`/`commonPicks`/`commonBuilds`
  distractor value and its accompanying diagnosis, not just the primary correct answer.
- **Duplication scanning**: a custom script indexed (a) every MCQ's prompt + sorted option-label set,
  (b) every subitizeFlash's count + arrangement + prompt + options, and (c) a generic per-widget-type
  identity (tenFrame's prompt+target+preFilled; numberLineHop's prompt+min+max+start+hop+hops+
  direction; tapDiagram's prompt+hotspot label/count set; dragOrder's prompt+item-label set;
  baseTenCompose's prompt+target; unitRuler's prompt+objectStart+objectEnd) for exact matches within
  and across all three courses (main steps and remedials both indexed). This is what surfaced every
  numberLineHop/subitizeFlash/unitRuler/matchPairs duplicate cited above; the established rule applied
  throughout is that the chronologically **first** occurrence of a repeated stimulus is the origin
  (not itself flagged) and only **later** repeats lack a distinct instructional job and are flagged.
  0 cross-course duplicates were found (all duplication is within-course); 9 within-course MCQ
  "duplicate" groups in `number-writing-k` are each a main-step/own-remedial pair on the same
  conceptTag by the same lesson (by design — the platform's own duplicate scanner,
  `lesson-review-authority-s246.mjs`, likewise excludes `remedials` from its cross-step duplicate
  check, establishing main-vs-own-remedial reuse as out of scope, not a bug).
- **Schema/widget integrity**: a second script re-validated every one of the 287 widgets across all
  41 lessons against its own internal consistency rules (mcq single-correct, tenFrame
  `preFilled<target`, numberLineHop landing/start on-line and landing≠start, subitizeFlash options
  containing the true count with no duplicates, dragOrder `correctOrder` a true permutation of item
  ids, matchPairs `pairs` referencing only existing left/right ids, baseTenCompose/unitRuler
  reachability arithmetic) — 0 errors.
- **Structural lint**: a third script re-validated the 25-word early-profile concept-body cap
  (measured via literal whitespace-split word count, not estimated), action-step/widget presence,
  conceptTag/explanationVariants presence and distinctness on every check/challenge, exactly-3-hints
  on every challenge, no pre-solved dragOrder, no generic ("wrong"/"try again"/"no") wrong-answer
  feedback, no distractor diagnosis under 25 characters, recap-last/1–3-takeaways/teaser structure,
  and ≥60% action-step density per lesson — 0 errors across all 41 lessons, confirming every REVISE
  finding here is a semantic content defect these structural checks are not designed to catch, not a
  structural/schema gap.
- **Grade-language review**: every concept step's `body` was word-counted against its lesson's
  `readingProfile` cap (25 words for "early," which is every lesson in this batch) and read for
  read-aloud, kindergarten-appropriate phrasing; every widget prompt and feedback string was likewise
  read for age-appropriate vocabulary and sentence complexity. No violations found.
- **Platform-level facts treated as context, not defects** (per task instructions): `McqW` and
  `predict` options use seeded shuffle at render (`seededShuffle`/`mulberry32`/`hashSeed` in
  `src/lib/prng.ts`, confirmed by source read) keyed by lesson/step id, never DOM position — so
  "correct answer always first in the JSON array" is not a defect and was not re-flagged per lesson.
  Lab-style widgets are shuffle-fixed per the S316 history and were likewise treated as an established
  platform invariant. Prior S302/S310/S313 choice-order repairs were not re-flagged; none of the 18
  REVISE findings here overlaps with that repaired class.

## Notes on borderline calls

- **"A circle is round all the way, like a coin or a clock" is not flagged everywhere it appears** —
  only where it is mismatched to its own step's actual task. This exact string is genuinely on-topic
  (and correctly left alone) in, among others, `kgb-02-02`/ch1, `kgb-02-03`/k2, `kgb-02-04`/i1 and
  i2, and `kc-01-02`/ch1's tapDiagram context, where the task really is about identifying or
  reasoning about circles. Each of the 8 flagged occurrences (`kgb-01-01`×2, `kgb-01-02`,
  `kgb-01-03`, `kgb-02-03`, `kgb-02-05`, `kgb-03-03`, `kgb-03-04`) was individually checked against
  its own step's prompt/task before being counted as a mismatch, to avoid over-flagging a string that
  is frequently correct.
- **Two related but distinct defect classes in `number-writing-k`'s teen-number lessons** are both
  present and both counted: "thematic regression" (a widget forced by a schema cap to test a
  different, easier concept than the lesson's own topic — e.g. `kcw-02-04`/ch1's subitizeFlash
  testing "7" in a 13–19 lesson) versus "literal duplication" (a byte-identical widget repeated
  across two lessons — e.g. `kcw-03-03`/ch1 duplicating `kcw-01-05`/k2). Both trace to the same root
  cause (subitizeFlash's `count` schema cap at 10) but are reported as separate, precisely evidenced
  findings because they need different fixes (change the target number vs. change to a different
  target number that is *also* unused elsewhere).
- **The tenFrame "false full-ten visual promise" bug is not confined to `number-writing-k`** — it
  recurs in `counting-to-20-k`'s `kc-03-01` (the course's first teen-numbers lesson) with the
  identical root cause (`target` schema-capped at 10, so a single tenFrame can never depict "a full
  ten plus teen extras" even though several prompts claim it does) and the identical proven fix
  already in use elsewhere in the very same lesson (`baseTenCompose`, used correctly by that lesson's
  own `k1`–`k3`).
- **`kc-01-01` and `kc-04-03` (the counting-to-20-k QD rows)**: see the dedicated special-task section
  above. Both are KEEP, reached by an independent content re-read against the
  QUESTION_DIVERSITY_AND_TRANSFER framing specifically, not by inheriting either the stale
  `audit:pending-workload` count or S319's own live-tier conclusion.
- **`kgb-01-05`/k2, `kgb-02-04`/k3, `kcw-01-02`/k3, and `kcw-01-04`/k3`** are each the confirmed,
  chronologically-first origin of a numberLineHop stimulus pattern that recurs later in their
  respective courses (in `kgb-02-02`/`kgb-02-03`/`kgb-03-02`, and `kcw-03-04`/`kcw-02-03`
  respectively) — each origin lesson is KEEP; only the later repeats are REVISE, consistent with the
  "distinct instructional job per question" requirement being about each *repeat* lacking new value,
  not about the concept of reuse existing at all in a spaced-practice curriculum.
