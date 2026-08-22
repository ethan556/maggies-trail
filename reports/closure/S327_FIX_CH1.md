# S327 Fix Packet CH1 — CHOICE_SURFACE_INTEGRITY (option-length / unit / justification leaks)

Fixer: cowork-s327-CH1-fixer. Contracts: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `CHOICE-####`
under workstream `CHOICE_SURFACE_INTEGRITY` for the 22 lessons in scope (shapes-build-k,
function-analysis, polygons-quadrilaterals, vectors-matrices). Detector: `scripts/audit/mcq-leakage.mts`
`leaks()` — each row's `mismatch_evidence` names the exact tell. Method per step: read the full lesson
file, identify the flagged MCQ step by `step_path`, rewrite option labels only (feedback left intact
wherever it stays literally true of the unchanged correct answer) so the correct option is no longer
the length/unit/justification outlier, then re-verify with a standalone Node port of `leaks()`
(`/tmp/.../scratchpad/check-leaks.mjs`, copied verbatim from the detector) run against the live file.
Mathematical content and the correct answer are unchanged in every case — only option *labels* were
edited (lengthened distractors with genuine misconception detail, or trimmed a self-explaining
correct label and moved its clarification into the `feedback` field, which every widget already
carries and reads only after commitment).

## function-analysis

### fna-01-03 — k3 (`only-option-with-a-unit`)
Prompt: "Ava walks 10 km in 2 hours. Ben walks 12 km in 3 hours. Whose average speed is greater?"
BEFORE: o1 (correct) `"Ava's (5 km/h vs 4 km/h)"` (24 chars, only option carrying a computed
km/h value — the label did the arithmetic for the learner) / o2 `"Ben's, because he walked
farther"` (32) / o3 `"They're equal"` (13).
AFTER (unit pattern removed from all three — the arithmetic now has to happen in the learner's
head, same place the lesson's own `secantSlope`/rate-interpret steps put it, and the worked numbers
still land in `feedback` for after commitment): o1 `"Ava's — her hourly pace is the faster one"`
(41) / o2 `"Ben's — he covered the greater total distance"` (45, same "total distance ≠ rate"
misconception preserved) / o3 `"Equal — each walks at the same steady pace"` (42). Feedback text
unchanged for all three (already states the 10/2=5 vs 12/3=4 arithmetic, independent of the label
wording).
Verified: `check-leaks.mjs fna-01-03.json k3` → clean.

### fna-03-01 — k2 (`length-prose-vs-prose`)
Prompt: "Classify h(x) = x² + x."
BEFORE: o1 (correct) `"Neither even nor odd"` (20 chars) vs o2 `"Even"` (4) / o3 `"Odd"` (3) —
bare one-word distractors next to the only multi-word option.
AFTER: distractors lengthened with the genuine misconception they represent (classifying from only
one term of the two-term polynomial instead of testing the whole function): o2
`"Even, judging by the x² term alone"` (34) / o3 `"Odd, judging by the x term alone"` (32); o1
unchanged (20). Feedback unchanged for all three (already explains the mixed-power reasoning).
Verified: `check-leaks.mjs fna-03-01.json` (full file) → all 4 mcq steps clean.

### fna-03-03 — k3 (`length-prose-vs-prose`)
Prompt: "What happens to C(w) as a parcel's weight crosses from 2 kg to just over 2 kg?"
BEFORE: o1 (correct) `"The cost jumps from $7 to $10 — no price in between is ever charged"` (67
chars) vs o2 `"The cost rises smoothly through $8 and $9"` (41) / o3 `"The cost stays $7 until 3
kg"` (28).
AFTER: trimmed o1's self-explaining trailing clause into its `feedback` (already present as "Right
— that discontinuous hop is the signature of a step function", extended with "...: no price in
between $7 and $10 is ever charged"); label now `"The cost jumps straight from $7 to $10"` (38).
o3 lengthened slightly for balance: `"The cost holds flat at $7 until 3 kg"` (36, same claim, no
new misconception needed since it was already a plausible distinct wrong answer). o2 unchanged (41).
Verified: `check-leaks.mjs fna-03-03.json k3` → clean (38/41/36).

### fna-05-01 — k1 (`length-prose-vs-prose`)
Prompt: "Why does f(x) = x² (all real x) have no inverse function?"
BEFORE: o1 (correct) `"An inverse would need to send 9 to both 3 and −3 — a function can't do
that"` (75 chars) vs o2 `"Because x² has no square root"` (29) / o3 `"Because parabolas aren't
functions"` (34).
AFTER: trimmed o1's trailing "— a function can't do that" clause into `feedback` (already "Exactly
— one-to-one failure..."; extended to open "Exactly — a function can't do that: ..."); label now
`"An inverse would need to send 9 to both 3 and −3"` (48). o3 lengthened slightly for balance:
`"Because parabolas aren't functions at all"` (41). o2 unchanged (29).
Verified: `check-leaks.mjs fna-05-01.json k1` → clean (48/29/41).

### fna-05-02 — two flagged steps
**k2** (`length-prose-vs-prose`): prompt "Which restriction ALSO makes f(x) = (x − 3)² one-to-one?"
BEFORE: o1 (correct) `"x ≤ 3 (the left branch)"` (23) vs o2 `"x ≥ 0"` (5) / o3 `"−1 ≤ x ≤ 7"` (10).
AFTER: all three given matching short qualifiers (genuine content: which branch, and whether it
crosses the vertex) so none is the bare outlier: o1 `"x ≤ 3, keeping only the left branch"` (35) /
o2 `"x ≥ 0, which still crosses the vertex"` (37) / o3 `"−1 ≤ x ≤ 7, straddling the vertex"` (33).
Feedback unchanged (already states this reasoning).
**k3** (`length-answer-explains-itself`): prompt "f(x) = x² on x ≥ 0 has range y ≥ 0. What is the
DOMAIN of f⁻¹(x) = √x?"
BEFORE: o1 (correct) `"x ≥ 0 — the inverse's domain is f's range"` (41, dash-explained) vs o2
`"All real numbers"` (16) / o3 `"x ≥ 3"` (5).
AFTER: stripped the self-explaining dash clause from o1, moved into `feedback` (already "Exactly —
inverses swap domain and range..."; extended with "...so that becomes f⁻¹'s domain"); label now
bare `"x ≥ 0"` (5), matching o3's bare `"x ≥ 3"` style. o2 unchanged (16).
Verified: `check-leaks.mjs fna-05-02.json` (full file) → both steps clean (k2: 35/37/33; k3: 5/16/5).

## shapes-build-k

Kindergarten reading level (`readingProfile: "early"`) — fixes keep vocabulary simple and add only
genuine, concrete misconception detail (e.g. "judged by looks/one feature alone", not abstract
jargon). Several flagged steps have a byte-identical twin MCQ in the lesson's own `remedials[].check`
(same options, different prompt/order) — not scanned by the detector (`mcq-leakage.mts` only walks
`lesson.steps`, never `lesson.remedials`) but edited in lockstep anyway so the two copies stay
consistent.

### kgb-01-01 — k2 (`length-answer-explains-itself`)
Prompt: "What do position words like ABOVE and BESIDE always need?"
BEFORE: o0 (correct) `"Two things — one placed against the other"` (41, dash-explained) vs longest
distractor `"Just one thing"` (14).
AFTER: stripped the dash clause into `feedback` (already "Correct — above is above SOMETHING...";
extended with "...a landmark, one placed against the other"); label now bare `"Two things"` (10).
Verified: clean (14/*10/7/5).

### kgb-01-02 — ch1 (`length-prose-vs-prose`)
Prompt: "The cup sits ABOVE the shelf and BELOW the lamp. How can both be true?"
BEFORE: o0 (correct) `"Each word compares the cup to a different landmark"` (50) vs longest
distractor `"Above and below mean the same"` (29).
AFTER: shortened o0 to `"Each word points to a different landmark"` (40, moved "compares the cup
to" into feedback) and lengthened all three distractors with the same genuine wrong-reasoning they
already had, just spelled out: `"One of the two words must be a lie"` (34) / `"The same cup sits in
two different places"` (41) / `"Above and below describe the same spot"` (38).
Verified: clean (34/41/*40/38).

### kgb-01-04 — k2 (`length-prose-vs-prose`)
Prompt: "What is a SIDE of a flat shape?"
BEFORE: o0 (correct) `"One straight edge running corner to corner"` (42) vs longest distractor
`"The inside of the shape"` (23).
AFTER: lengthened the three distractors: `"The inside space of the shape"` (29) / `"Any dot marked
on the shape"` (27) / `"The shape's shadow on the ground"` (32). o0 unchanged.
Verified: clean (29/27/32/*42).

### kgb-02-04 — k2 (`length-prose-vs-prose`)
Prompt: "A triangle is turned. What proves it is still a triangle?"
BEFORE: o0 (correct) `"It still has 3 sides and 3 corners"` (34) vs longest distractor `"It sits in
a new place"` (22).
AFTER: lengthened distractors with a shared "that's not what names it" framing: `"It just points a
different way"` (30) / `"It only sits in a new place"` (27) / `"It merely looks upside down"` (27).
o0 unchanged.
Verified: clean (30/*34/27/27).

### kgb-02-05 — two flagged steps (plus matching remedial mirrored)
**k1** (`length-prose-vs-prose`): prompt "What separates a FLAT shape from a SOLID shape?" BEFORE:
o0 (correct) `"Flat lies on paper; solid takes up space you can grasp"` (54) vs longest distractor
`"Solid shapes are heavier"` (24). AFTER: trimmed o0's trailing "you can grasp" into `feedback`
(already "...the solid has an inside your hand can hold"; now states "can grasp"); label now `"Flat
lies on paper; solid takes up space"` (40). Distractors lengthened: `"Flat shapes are usually
smaller"` (31) / `"Solid shapes are usually heavier"` (32) / `"There is really no difference"` (29).
**k2** (`length-prose-vs-prose`): prompt "Why can cans be stacked into a steady tower?" BEFORE: o0
(correct) `"Their flat circle ends rest on one another"` (42) vs longest distractor (14, all three
tied). AFTER: dropped "circle" from o0 (kept in feedback, "the cans' circular ends provide them"):
`"Their flat ends rest on one another"` (35). Distractors lengthened: `"They are shiny all over"`
(23) / `"They can roll along well"` (24) / `"They feel quite heavy"` (21).
Both fixes mirrored into `remedials[0].check` (k1's twin: `rem-kgb-flat-solid-k`, identical option
set, different prompt) so the two copies stay in sync; that check is not itself detector-scanned.
Verified: `check-leaks.mjs kgb-02-05.json` (full file) → k1, k2, ch1 all clean.

### kgb-03-01 — two flagged steps (plus matching remedial mirrored)
**k1** (`length-prose-vs-prose`): prompt "Drawing a triangle — what must the pencil do?" BEFORE: o0
(correct) `"Draw 3 straight sides that close back to the start"` (50) vs longest distractor (19).
AFTER: trimmed o0 to `"Draw 3 straight sides that close"` (32, "back to the start" folded into
feedback's existing "the last returning home" → "...home to close it"). Distractors lengthened:
`"Draw one long curved line"` (25) / `"Draw exactly 3 dots"` (19) / `"Draw 4 straight sides"` (21).
**k2** (`length-prose-vs-prose`): prompt "A drawing has 3 straight sides but a gap where the ends
miss. Is it a triangle?" BEFORE: o0 (correct) `"Not yet — a shape must close all the way around"`
(47) vs longest distractor `"No drawing is ever a triangle"` (29). AFTER: trimmed o0 to `"Not yet —
it must close all the way around"` (42). Distractors lengthened: `"Yes — three sides alone is
enough"` (33) / `"Yes, even if the gap is small"` (29); third (`"No drawing is ever a triangle"`,
29) unchanged.
k1's fix mirrored into `remedials[0].check` (`rem-kgb-draw-shape-k`, identical option set). Not
detector-scanned itself.
Verified: `check-leaks.mjs kgb-03-01.json` (full file) → k1, k2, ch1 all clean.

### kgb-03-02 — k1 (plus matching remedial mirrored) (`length-prose-vs-prose`)
Prompt: "Building a square from sticks — what must the sticks be?"
BEFORE: o0 (correct) `"Four sticks, all the same length"` (33) vs longest distractor `"As many as
possible"` (19).
AFTER: lengthened all three distractors: `"Any four sticks will work"` (25) / `"Three long sticks
will do"` (25) / `"As many sticks as possible"` (26). o0 unchanged.
Mirrored into `remedials[0].check` (`rem-kgb-build-shape-k`, identical option set). Not
detector-scanned itself.
Verified: `check-leaks.mjs kgb-03-02.json` (full file) → k1, k3, ch1 all clean.

## polygons-quadrilaterals

HS geometry — fixes keep full mathematical precision; trimmed labels move reasoning into the
`feedback` field (read only after commitment), never dropping content, only relocating it.

### pq-01-03 — i1 (`length-prose-vs-prose`)
Prompt: "As a regular polygon gains more and more sides, what happens to each interior angle?"
BEFORE: o1 (correct) `"It climbs toward 180° without reaching it — the shape rounds toward a
circle"` (76) vs longest distractor `"It passes 180° for very large n"` (31).
AFTER: trimmed o1's trailing clause into `feedback` (extended with "...the shape rounds toward a
circle"); new label `"It climbs toward 180° without reaching it"` (41). Two distractors lengthened
for balance: `"It shrinks steadily toward 0°"` (29) / `"It stays fixed at exactly 108°"` (30);
third unchanged (31).
Verified: clean (41/29/30/31).

### pq-02-02 — i2 (`length-prose-vs-prose`)
Prompt: "A quadrilateral has angles 70°, 110°, 70°, 110° in order around the shape. Could it be a
parallelogram?"
BEFORE: o1 (correct) `"Yes — opposite angles match and consecutive ones supplement, exactly the
parallelogram pattern"` (94) vs longest distractor `"No — a parallelogram needs four equal
angles"` (44).
AFTER: trimmed o1's trailing "exactly the parallelogram pattern" into `feedback`; new label `"Yes —
opposite angles match, consecutive ones supplement"` (56). All three distractors lengthened with
their existing reasoning spelled out: 55 / 41 / 50 chars.
Verified: clean (56/55/41/50).

### pq-04-03 — i2 (`length-prose-vs-prose`)
Prompt: "Why does Area = ½·d₁·d₂ work for rhombi too?"
BEFORE: o1 (correct) `"A rhombus IS a kite (both consecutive pairs congruent — all four sides), and
its diagonals are also perpendicular"` (113) vs longest distractor `"It doesn't — rhombi need base
× height only"` (43).
AFTER: moved the parenthetical into `feedback` (extended to explain "all four sides congruent
easily satisfies 'two pairs of congruent consecutive sides'"); new label `"A rhombus is itself a
kite, so its diagonals are perpendicular too"` (66). All three distractors lengthened: 47 / 45 / 49
chars.
Verified: clean (66/47/45/49).

### pq-05-01 — two flagged steps
**i1** (`length-prose-vs-prose`): prompt "What's the logical difference between a parallelogram
PROPERTY and a parallelogram TEST?" BEFORE: o1 (correct) `"A property flows FROM knowing it's a
parallelogram; a test flows TOWARD that conclusion — converse directions"` (109) vs longest
distractor `"Tests are approximate; properties are exact"` (43). AFTER: condensed o1 to `"Properties
flow FROM the shape; tests flow TOWARD it"` (52, "converse directions" folded into feedback).
Distractors lengthened: 43 (unchanged) / 43 (unchanged) / 59.
**ch** (`length-answer-explains-itself`): prompt "A builder knows: AB ≅ CD, and AD ∥ BC. Which ONE
additional measurement certifies a parallelogram?" BEFORE: o1 (correct) `"Show AD ≅ BC — then the
parallel pair is also congruent (test 4)"` (64, dash-explained) vs longest distractor `"No single
measurement can ever suffice"` (38). AFTER: stripped the dash clause into `feedback` (now names
"test 4" explicitly there); new bare label `"Show AD ≅ BC"` (12), matching the terse style of
sibling option `"Show AB ∥ AD"` (12).
Verified: `check-leaks.mjs pq-05-01.json` (full file) → i1, k2, k3, ch all clean.

### pq-05-02 — i2 (`length-prose-vs-prose`)
Prompt: "\"A rhombus is a kite.\" Under the standard (inclusive) kite definition used in ch4, this
is:"
BEFORE: o1 (correct) `"Always — all four sides congruent gives BOTH consecutive pairs congruent"`
(72) vs longest distractor `"Sometimes — only when the diagonals are equal"` (45).
AFTER: trimmed to `"Always — four congruent sides qualify"` (37), matching the "verdict — short
reason" pattern the other three options already use; the dropped detail (BOTH consecutive pairs
congruent) moved into `feedback`. Distractors unchanged.
Verified: clean (37/39/28/45).

## vectors-matrices

HS precalculus — every fix here is a pure trim: move a parenthetical/appositive off the correct
label and into `feedback` (already present in most cases; extended where it wasn't), landing the
correct label at or below the other options' lengths rather than merely "close enough."

### vec-01-02 — k1 (`length-prose-vs-prose`)
Prompt: "The direction angle of v = ⟨−3, 4⟩ is closest to:"
BEFORE: o1 (correct) `"126.87° (Quadrant II)"` (21) vs longest distractor `"−53.13°"` (7) — bare
angle distractors next to the only quadrant-labeled option.
AFTER: added the same "(Quadrant N)" pattern to both distractors, using each one's own (wrong, but
feedback-consistent) quadrant: `"53.13° (Quadrant I)"` (19) / `"−53.13° (Quadrant IV)"` (21). o1
unchanged. Now the unit/parenthetical pattern is present in ALL options, not just the correct one.
Verified: clean (21/19/21).

### vec-01-03 — k3 (`length-prose-vs-prose`)
Prompt: "The displacement from a point to itself is:"
BEFORE: o1 (correct) `"⟨0, 0⟩, the zero vector"` (23) vs longest distractor `"undefined"` (9).
AFTER: trimmed to bare `"⟨0, 0⟩"` (6), moving "the zero vector" into `feedback`; now matches
distractor o2's exact style (`"⟨1, 1⟩"`, 6 chars).
Verified: clean (6/6/9).

### vec-02-03 — k2 (`length-prose-vs-prose`)
Prompt: "What is ⟨3, 4⟩ + ⟨−3, −4⟩?"
BEFORE: o1 (correct) `"⟨0, 0⟩ (they cancel)"` (20) vs longest distractor `"⟨6, 8⟩"` (6).
AFTER: trimmed to bare `"⟨0, 0⟩"` (6, "they cancel" folded into feedback's existing "vector plus
its negative" line); now identical length to both distractors.
Verified: clean (6/6/6 — all three options exactly 6 characters).

### vec-04-03 — k3 (`length-prose-vs-prose`)
Prompt: "A system's coefficient matrix has determinant 0. This means:"
BEFORE: o1 (correct) `"No unique solution (parallel or identical lines)"` (48) vs longest
distractor `"The solution is (0, 0)"` (22).
AFTER: trimmed to `"No unique solution"` (18), moving "(parallel or identical lines)" into
`feedback` (now names both cases explicitly: "no solution (parallel lines) or infinitely many
(identical lines)"). Distractors unchanged.
Verified: clean (18/20/22).

### vec-05-03 — k3 (`length-prose-vs-prose`)
Prompt: "A·B gave a 90° CLOCKWISE rotation. What does the reversed order B·A = [[0, −1], [1, 0]]
give?"
BEFORE: o1 (correct) `"A 90° counterclockwise rotation (the opposite turn)"` (51) vs longest
distractor `"The exact same clockwise rotation"` (33).
AFTER: trimmed to `"A 90° counterclockwise rotation"` (31), moving "(the opposite turn)" into
`feedback` ("...reverses the turn to the opposite direction..."). Distractors unchanged.
Verified: clean (31/33/24).

## Summary

All 22 lessons across the 4 assigned courses, 26 flagged steps total, fixed and verified clean
against a standalone Node port of the live `scripts/audit/mcq-leakage.mts` `leaks()` function
(copied verbatim — same regexes, same 1.5×/12-char length threshold, same dash-explained/qualifier/
unit checks). No lesson required changing which option is correct or any underlying mathematical
fact; every fix was either (a) moving a self-explaining clause from an option label into that
option's own `feedback` field, (b) lengthening distractors with genuine, feedback-consistent
misconception detail, or (c) both. `node -e "JSON.parse(...)"` confirms every touched file still
parses. No lesson needed escalation.
