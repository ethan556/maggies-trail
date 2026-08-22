# S320 Implementation — Lane A5 REVISE Contracts (18 lessons)

Bounded implementation worker. Authority per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`:
repository source and the explicit implementation contracts in `reports/closure/S320_ASSESS_A5.md`
are authoritative; this packet implements every REVISE contract from that file exactly as written
(deviating only where literally following an example number would itself violate the RULES —
called out per-lesson below), does not weaken any gate, and does not invent new judgment calls.
Base commit: `ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1`.

Scope: 18 lessons across 3 K courses — `number-writing-k` (kcw-01-04, kcw-02-02, kcw-02-03,
kcw-02-04, kcw-03-01, kcw-03-03, kcw-03-04), `shapes-build-k` (kgb-01-01, kgb-01-02, kgb-01-03,
kgb-02-02, kgb-02-03, kgb-02-05, kgb-03-02, kgb-03-03, kgb-03-04), `counting-to-20-k` (kc-03-01,
kc-04-01). All edits are content-only JSON changes under `content/courses/`; no `src/` files were
touched. No npm/vitest/tsc run, per instructions.

Deliverables: this report + NDJSON at
`reports/closure/cowork-staging/laneA-s320-impl-2.jsonl` (18 records, one per lesson).

## Verification method

- Every one of the 18 edited JSON files was parse-checked with Python's `json.load` after editing:
  **18/18 OK**.
- A widget-integrity checker was re-run against all 41 lessons in the three courses (not just the
  18 touched) covering mcq single-correct-answer, tenFrame `preFilled<target`, numberLineHop
  landing/start on-line and `landing != start`, subitizeFlash `count` present in `options` with no
  duplicate options and `count <= 10`, dragOrder `correctOrder` a true permutation, and matchPairs
  `pairs` referencing only existing left/right ids: **0 errors across all 41 lessons**.
- A scripted exact-duplicate scanner was run across all three courses (287 widgets total, main steps
  + remedials), keyed per widget type exactly as the assessment report describes (mcq
  prompt+sorted-option-labels; tenFrame prompt+target+preFilled; numberLineHop
  prompt+min+max+start+hop+hops+direction; subitizeFlash count+arrangement+prompt+options;
  tapDiagram prompt+hotspot-label-set; dragOrder prompt+item-label-set; baseTenCompose
  prompt+target; unitRuler prompt+objectStart+objectEnd; matchPairs prompt+left-label-set+
  right-label-set), excluding by-design main-step/own-remedial reuse. **Result: 1 remaining
  duplicate group, out of scope** — see "Scan findings outside contract scope" below. Zero
  duplicates remain among anything touched by this packet's 18 contracts.
- First pass of the numberLineHop fix for `kcw-03-04`/`k3` (contract's literal example numbers,
  `start=8, hops=1`) collided with the pre-existing, untouched `kcw-01-05`/`k3` (also
  `start=8, hops=1, direction=forward`) — caught by the duplicate scanner, not by inspection. Chose
  different numbers (`start=14`) instead of the contract's literal example to actually satisfy the
  contract's stated goal ("distinct from kcw-01-04/k3" is stated in the contract, but the deeper
  requirement — no exact duplicate anywhere in the course — is what the scan enforces); documented
  under `kcw-03-04` below.
- `node scripts/session/print-review-basis.mjs <18 ids>` was run against the post-fix file bytes to
  record `changed_file_hashes` for the NDJSON (below and in the deliverable file).

---

## number-writing-k (7 lessons)

### kcw-01-04 — i1
Contract: `missFeedback`/`successFeedback` on the "tap the plate with zero cookies" tapDiagram were
copy-pasted from an unrelated circle/shape widget.
**Fix**: `missFeedback` → "Look for the plate with no cookies on it at all."; `successFeedback` →
"Yes — an empty plate has zero cookies on it." Both now describe the actual cookie-plate task; no
shapes/coins/clocks referenced. `k3`'s numberLineHop (origin of the stimulus later duplicated in
`kcw-02-03`/i1) left untouched per contract.

### kcw-02-02 — i1
Contract: tenFrame prompt claims "A full group of 10 is already shown" while `preFilled=0` renders
an empty frame.
**Fix (a — reword, chosen over widget swap)**: `prompt` → "Fourteen is a full ten plus 4 more. Tap 4
dots to show the 'more' part." Also reworded `missFeedback` (was "The ten is already made; add only
the ones...", same false claim, not explicitly named in the contract text but the same defect class)
→ "Tap the dots one at a time. Stop when the frame shows exactly 4 — that's the 'more' part of 14."
`successFeedback` ("Ten and 4 — the numeral 14 writes those two pieces side by side.") describes the
numeral's composition, not the render, so it was left as-is (still literally true).

### kcw-02-03 — i1, i2
Contract: two issues. (1) `i1` numberLineHop byte-identical to `kcw-01-04`/k3. (2) `i2` tapDiagram
prompt claims "One ten and two extra ones are shown" but hotspots are plain numeral-text badges.
**Fix (1)**: `i1.widget` changed `start: 10→13`, `min: 8→11`, `max: 14→17`; landing recomputed
2 hops forward = **15** (was 12). All `commonLandings`/`missFeedback`/`successFeedback`/
`lowFeedback`/`highFeedback` strings updated to reference 13/15 instead of 10/12. `predict`
sub-question (unrelated to the hop numbers) left unchanged per contract.
**Fix (2)**: `prompt` → "Which numeral means one ten and two extra ones? Tap it." — no longer claims
a rendered dot/frame picture.

### kcw-02-04 — i1, ch1
Contract: two issues. (1) `i1` tenFrame same false "already shown" claim as kcw-02-02/i1.
(2) `ch1` subitizeFlash (schema-capped `count<=10`) tests plain "7" in a 13–19 lesson, exercising no
teen numeral.
**Fix (1)**: `prompt` → "Sixteen is a full ten plus 6 more. Tap 6 dots to show the 'more' part.";
`missFeedback` → "Tap the dots one at a time. Stop when the frame shows exactly 6 — that's the
'more' part of 16." (same reasoning as kcw-02-02).
**Fix (2)**: swapped `ch1.widget` from subitizeFlash (count=7) to numberLineHop targeting **18**
(within 13–19, matching k1/k2/k3's actual range): `start=10, hop=1, hops=8, min=8, max=20,
direction=forward`; landing = 10+8 = 18. All landing/miss/success/low/high feedback strings
authored fresh for 18. `explanationVariants` reworded (dropped the flash-specific "Row of five,
then extras"); `hints` swapped to the lesson's standard "Teens open with 1 / The 1 is a ten / Ones
digit counts extras" set (dropping the flash-specific hint set); `variant` changed from
`{gen:"g0-counting", form:"countReadFlash"}` to `{gen:"k0-count-100", form:"kCountFromHop"}` to
match the widget-type convention used elsewhere in this course for numberLineHop challenge steps.

### kcw-03-01 — i1, i2, predict
Contract: two issues, same bug classes as kcw-02-02/kcw-02-03. (1) `i1` tenFrame false "already
shown" claim. (2) `i2` tapDiagram claims "A full ten and seven extra dots are shown" over plain
numeral badges.
**Fix (1)**: `prompt` → "Seventeen is a full ten plus 7 more. Tap 7 dots to show the 'more' part.";
`missFeedback` → "Tap the dots one at a time. Stop when the frame shows exactly 7 — that's the
'more' part of 17."
**Fix (2)**: `prompt` → "Which numeral means one full ten and seven extra dots? Tap it."
**Beyond the two contracted widgets**: `i1`'s own `predict.prompt` ("A full frame plus 7 loose
dots. The numeral you write is…") asserted the same false visual the widget prompt did; reworded to
"Seventeen is a full ten plus 7 loose dots. The numeral you write is…" so the predict step is
consistent with the corrected widget and still literally describes the 17 = 10+7 relationship (not
tied to a specific render).

### kcw-03-03 — ch1
Contract: `ch1` subitizeFlash byte-identical to `kcw-01-05`/k2 (count=4, tenFrame, options
[3,4,5,6]).
**Fix**: `count: 4→6`, `options: [3,4,5,6]→[5,6,7,8]`, `commonPicks` values `3→5`/`5→7` with feedback
text updated to reference 6 (target) throughout; `missFeedback`/`successFeedback` updated to say 6.
Confirmed unused elsewhere in the course (other subitizeFlash counts in this course: 8, 4[origin],
7→9 after this packet's kcw-03-04 fix — no collision).

### kcw-03-04 — i2, ch1, k3
Contract: three issues. (1) `i2` tapDiagram claims "the picture shows five dots" over plain numeral
badges. (2) `ch1` subitizeFlash byte-identical to `kcw-02-04`/ch1 (count=7). (3) `k3` numberLineHop
byte-identical to `kcw-01-02`/k3 (start=6, hops=1, landing=7).
**Fix (1)**: `prompt` → "The word says 'five'. Tap the matching numeral."
**Fix (2)**: `count: 7→9`, `options: [6,7,8,9]→[8,9,10,11]`, `commonPicks` `6→8`/`8→10`, feedback
text updated to reference 9; `missFeedback`/`successFeedback` updated to say 9. (Note: `kcw-02-04`'s
own `ch1` was independently swapped away from subitizeFlash entirely by this same packet — see
above — so this fix also pre-empts any future re-collision if that other fix were ever reverted in
isolation.)
**Fix (3) — deviated from the contract's literal example numbers**: contract suggested
`start=8, hops=1` (landing 9). Applying that exact pair collided with the pre-existing, untouched
`kcw-01-05`/k3 (`start=8, hop=1, hops=1, direction=forward` — also landing 9), caught by the
post-edit duplicate scan. Used `start=14, hops=1` instead (`min=11, max=18`, landing **15**); all
`commonLandings`/`missFeedback`/`successFeedback`/`lowFeedback`/`highFeedback` strings authored
fresh for 14→15. Re-scanned: no collision with any other numberLineHop widget in the course (full
inventory checked; see Verification method above).

---

## shapes-build-k (9 lessons)

### kgb-01-01 — i2, ch1
Contract: both steps' `successFeedback` copy-pasted the circle/coin/clock boilerplate onto
above/below position-word cat-and-table tasks.
**Fix**: `i2.successFeedback` → "Yes — this cat is above the table." (matches the correctly-worded
`i1` in the same lesson); `ch1.successFeedback` → "Yes — this cat is below the table."

### kgb-01-02 — i2
Contract: same circle-boilerplate mismatch on a beside/position task.
**Fix**: `i2.successFeedback` → "Yes — this cat is beside the table." (matches `i1`).

### kgb-01-03 — i1, remedial check
Contract: (1) `i1` same circle-boilerplate mismatch on a beside/position task. (2) remedial's
correct-option label/reasoning says "cup" while the remedial's own prompt is about a "toy."
**Fix (1)**: `i1.successFeedback` → "Yes — this cat is beside the table."
**Fix (2)**: remedial option `o0.label` → "Each word compares the toy to a different landmark"
(contracted). **Beyond the contracted option**: option `o2` ("The cup is in two places" /
"One cup, one spot; two landmarks give it two true descriptions.") carried the identical leftover
"cup" artifact and was not separately named in the contract text, but is the same defect class in
the same remedial — reworded to "The toy is in two places" / "One toy, one spot; two landmarks give
it two true descriptions." so the whole remedial is internally consistent with its own "toy" prompt.

### kgb-02-02 — remedial check, k3
Contract: two issues. (1) remedial prompt asks about growing/size-invariance but all four option
feedback strings talk about turning/rotation instead. (2) `k3` numberLineHop byte-identical to
`kgb-01-05`/k2.
**Fix (1)**: rewrote all four option feedback strings to address growing/size directly — correct
(`o0`): "Correct — growing changes size, not the sides and corners that make a square."; `o1`: "The
sides and corners keep their equal-and-4 rule as it grows; nothing that names the shape changed.";
`o2`: "Bigger describes its new size, not its name — the name still depends on its sides and
corners."; `o3`: "The shape is all still there, just larger than it was before it grew."
**Fix (2) — kept `hops=4` rather than the contract's literal `hops=3` example**: the widget's own
prompt is "Hop once for each of a square's 4 corners" — changing `hops` to 3 would break that
pedagogical tie (a square has 4 corners, not 3). Instead changed only `start: 4→3` (`min: 2→1,
max: 10→9`), landing recomputed 4 hops forward = **7** (was 8); all landing/miss/success/low/high
feedback strings updated for 3→7. Distinct from `kgb-01-05`/k2 (`start=4`) while preserving the
"4 corners" meaning.

### kgb-02-03 — i2, k3
Contract: two issues. (1) `i2` (triangle-selectAll tapDiagram) same circle-boilerplate mismatch.
(2) `k3` numberLineHop byte-identical to both `kgb-01-05`/k2 and (pre-this-packet) `kgb-02-02`/k3 —
a triple-duplicate.
**Fix (1)**: `i2.successFeedback` → "Yes — each triangle has 3 straight sides, even when it turns or
changes size." (matches `i1`'s correctly-worded parallel text in this lesson). The sibling `k2`
step's identical circle-boilerplate string was checked against its own prompt ("Tap every round
shape...") and correctly left alone — it is genuinely on-topic there.
**Fix (2)**: `start: 4→5` (`min: 2→3, max: 10→11`), landing recomputed 4 hops forward = **9** (was
8); all landing/miss/success/low/high feedback strings updated for 5→9. Now distinct from both
`kgb-01-05`/k2 (`start=4`) and this packet's own `kgb-02-02`/k3 fix (`start=3`).

### kgb-02-05 — k3
Contract: circle-boilerplate mismatched to a 3-D block-stacking task (cones/spheres/cubes; correct
answer cubes).
**Fix**: `k3.successFeedback` → "Yes — cubes have flat faces that stack steadily, one on top of
another."

### kgb-03-02 — i2, k2
Contract: two issues. (1) `i1`/`i2` unitRuler are byte-identical within the same lesson
(`objectEnd=4` both times). (2) `k2` numberLineHop byte-identical to `kgb-02-04`/k3.
**Fix (1)**: `i2.widget`: `objectEnd: 4→6`, `requiredPlacements: 4→6`, prompt and
`successFeedback` updated to say 6 blocks, matching the pattern used by every other unitRuler
lesson in the course (two measurement steps at different lengths).
**Fix (2)**: `start: 3→4` (`min: 1→2, max: 6→7`), landing recomputed 1 hop forward = **5** (was 4);
all landing/miss/success/low/high feedback strings updated for 4→5.

### kgb-03-03 — i1, i2, k2
Contract: three issues. (1) `i1`'s circle/square distractor feedback references a "sail" that never
appears in `i1`'s own window-cutting prompt (copy-pasted from sibling `i2`). (2) `i2` circle
boilerplate mismatch on the sailboat/triangle task. (3) `k2` matchPairs `successFeedback`/
`pairErrors` reference "coin," "slice," "door" and a "triangle" outcome that do not exist in this
widget's actual left/right content (half-circles→circle, four triangles→larger square, six folded
squares→cube, two side-by-side squares→rectangle).
**Fix (1)**: circle-hotspot feedback → "A circle has one curved edge and does not make the pointed
piece a diagonal cut leaves."; square-hotspot feedback → "A square's four equal corners are not
what remains once the diagonal cut splits it in two." Both now reference the window/diagonal-cut
scenario, no "sail."
**Fix (2)**: `i2.successFeedback` → "Yes — the sail is a triangle with 3 straight sides."
**Fix (3)**: `pairErrors[0].feedback` → "Two squares side by side make a longer shape, not a larger
square — that pair builds a rectangle." (explains the actual `l3`→`r1` mis-pairing against the
actual correct answer `r3`, "a rectangle"). `successFeedback` → "All matched — half-circles,
triangles, folded squares, and side-by-side squares build a circle, a larger square, a cube, and a
rectangle!" — now names only the four item groups and four outcomes the widget actually contains.

### kgb-03-04 — i1, k1 (+ its own remedial's duplicated copy of k1)
Contract: two issues, both recurring from kgb-03-03. (1) `i1`'s circle/square distractor feedback
references "sail" though `i1`'s own prompt calls the piece a "slice." (2) `k1` matchPairs carries
the identical broken "coin/slice/door" `successFeedback`/`pairErrors` as `kgb-03-03`/k2, against a
different actual item set here (rectangle, circle, larger square, square — no cube in this lesson's
version), and the same broken text is duplicated a third time into this lesson's own remedial.
**Fix (1)**: circle-hotspot feedback → "A circle has one curved edge and does not make a slice with
3 straight sides."; square-hotspot feedback → "A square has 4 straight sides, not the 3 straight
sides a slice needs."
**Fix (2)**: `pairErrors[0].feedback` → "Two triangles have straight edges — two triangles join to
make a square, not a rounded circle." (explains the actual `l3`"two triangles"→`r1`"a circle"
mis-pairing against the actual correct answer `r3`, "a square"). `successFeedback` → "All matched —
two half-circles, two triangles, four triangles, and side-by-side squares build a circle, a square,
a larger square, and a rectangle!" — matches this lesson's actual four left/right pairs
(half-circles→circle, two triangles→square, four triangles→larger square, side-by-side squares→
rectangle). Both strings were fixed identically in the main `k1` step and in the remedial's verbatim
copy of the same widget (confirmed both instances now read the corrected text; 0 remaining
"coin"/"slice"/"door"-as-leftover hits in the file).

---

## counting-to-20-k (2 lessons)

### kc-03-01 — i1, i2, ch1
Contract: three tenFrame widgets (`i1` target=2, `i2` target=5, `ch1` target=1, all
`preFilled=0`) each claim "The ten-frame is FULL/full (10)" while rendering a fully empty frame —
the course's first teen-number lesson, with the fix already proven elsewhere in the same lesson's
own `k1`–`k3` (`baseTenCompose`, targets 16/18/19).
**Fix — chose option (b), widget swap, matching k1–k3's established pattern**: swapped `i1`, `i2`,
and `ch1` from `tenFrame` to `baseTenCompose`, mirroring the exact schema/feedback style already
used by this lesson's `k1`/`k2`/`k3`:
- `i1`: target **12** ("Build twelve with tens and ones. What hides inside 12?"), `commonBuilds` for
  wrong builds 11/2/20 with matching feedback, `missFeedback`/`successFeedback` rewritten. Its own
  `predict` step ("12 is a FULL frame and some extra dots...") also asserted the retired tenFrame
  visual; reworded to "12 is a full ten and some extra ones..." and the `reveal` text ("The 1 in 12
  is the whole full frame...") → "The 1 in 12 stands for the whole full ten..." so the predict step
  stays consistent with the corrected widget.
- `i2`: target **15** ("Build fifteen with tens and ones."), `commonBuilds` for wrong builds
  14/16/20 with matching feedback.
- `ch1`: target **11** ("I am the SMALLEST teen number. Build me with tens and ones."),
  `commonBuilds` for wrong builds 12/1/20 with matching feedback; `hints[2]` reworded from "tap 1
  dot" to "build 1 ten and 1 one" (no longer a tap action); `variant` changed from
  `{gen:"g0-counting", form:"countTeenFrame"}` to `{gen:"base-ten-build"}` to match k1–k3's
  convention for this widget type.
Verified all six new `baseTenCompose` targets (12, 15, 16, 18, 19, 11) are mutually distinct within
the lesson and unused by any other lesson's baseTenCompose in the course — no new duplicates
introduced.

### kc-04-01 — ch1
Contract: distractor option `c` (label "7" = 3+4 = blue+green, missing the 2 red) has
factually-backwards feedback claiming it "misses the blue" when it already includes blue and
actually omits red.
**Fix**: `c.feedback` → "That misses the red — 2, 3, AND 4 make 9." Option `b` (label "5" = 2+3 =
red+blue, correctly diagnosed as missing green) was already correct and left unchanged.

---

## Scan findings outside contract scope

The full-corpus duplicate scan (run after all 18 fixes) surfaced exactly one remaining exact-match
group, and it is **not** one of the 18 contracted lessons and was **not** touched by this packet:

- `mcq` prompt `"A group shows 13 dots. Which numeral names that amount?"` with identical sorted
  option-label set `{11, 12, 13, 14}` — matched between `kcw-02-04`'s own remedial
  (`rem-kcw-write-13-19-k`) and `kcw-03-01`'s own remedial (`rem-kcw-write-count-teens-k`), two
  *different* lessons' remedial checks. This text was not modified by any of this packet's edits
  (confirmed via `git diff` on both files — neither diff touches the `remedials` block), was not
  named in any of the 18 contracts in `S320_ASSESS_A5.md`, and per scope discipline
  ("do not broaden scope... invent an unplanned judgment call") is left as-is and reported here for
  an independent assessor to disposition.

No other duplicate, false-visual-claim, or copy-pasted-feedback pattern was found in any of the 41
lessons in the three courses beyond what is documented above.

## Gates run

- Parse-clean (Python `json.load`) on all 18 edited files: 18/18 OK.
- Widget-integrity scan (mcq single-correct, tenFrame `preFilled<target`, numberLineHop
  landing/start on-line and `landing!=start`, subitizeFlash count-in-options/no-dupes/count<=10,
  dragOrder permutation, matchPairs id-referential integrity) across all 41 lessons: 0 errors.
- Cross-course exact-duplicate scan (mcq, tenFrame, numberLineHop, subitizeFlash, tapDiagram,
  dragOrder, baseTenCompose, unitRuler, matchPairs), excluding main-step/own-remedial pairs: 1
  remaining group, out of contract scope (documented above); 0 duplicates among contracted lessons.
- Feedback-string audit (≥25 chars, no negation-opening) on every string this packet authored: all
  pass (shortest authored string is 39 characters). Pre-existing short/negation-adjacent strings
  elsewhere in the same files (not authored by this packet) were left untouched as out of scope.
- Hand-verified arithmetic: every numberLineHop landing recomputed from `start/hop/hops/direction`
  against its `min`/`max` bounds and its own feedback text; every baseTenCompose target checked
  against its `commonBuilds`' `tens*10+ones` totals; every subitizeFlash `count` checked against its
  `options` array and against every other subitizeFlash `count` in the same course for collisions
  (including a self-caught collision on the first pass of `kcw-03-04`/k3, corrected — see above).
- `node scripts/session/print-review-basis.mjs` run for all 18 lesson ids post-fix to produce
  `changed_file_hashes` for the deliverable NDJSON.
- No npm/vitest/tsc run, per instructions.

## Return

```
packet_id: S320-IMPL-A5
base_commit: ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1
contract_hash: reports/closure/S320_ASSESS_A5.md (18 REVISE contracts, this packet's full scope)
role: implementation-worker
scope_ids: kcw-01-04, kcw-02-02, kcw-02-03, kcw-02-04, kcw-03-01, kcw-03-03, kcw-03-04,
           kgb-01-01, kgb-01-02, kgb-01-03, kgb-02-02, kgb-02-03, kgb-02-05, kgb-03-02,
           kgb-03-03, kgb-03-04, kc-03-01, kc-04-01
status: 18/18 contracts implemented
evidence_refs: reports/closure/cowork-staging/laneA-s320-impl-2.jsonl (18 records)
gates_passed: parse-clean(18/18), widget-integrity(0 errors/41 lessons),
              cross-course-duplicate-scan(0 in-scope duplicates), feedback-length(pass),
              hand-verified-arithmetic(pass)
gates_failed: none
cache_invalidations: none (this packet does not touch the ChatGPT Work cache)
new_decision_required: 1 — pre-existing cross-lesson remedial mcq duplicate
                        (kcw-02-04/rem-kcw-write-13-19-k <-> kcw-03-01/rem-kcw-write-count-teens-k),
                        out of this packet's 18 contracts, untouched, needs independent disposition
risks: none identified beyond the one out-of-scope duplicate above
next_owner: independent assessor (this worker cannot assess or close its own packet)
```
