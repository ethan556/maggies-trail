# S327 Fix Packet PG3 — implementation evidence

Fixer: cowork-s327-PG3-fixer. Date: 2026-08-21.
Scope: 30 lessons across length-problems-g2, measure-money-time, area-surface-volume, counting-120,
decimals-place-value, exponents-scientific-notation — closing PREMIUM_PENDING_WORKLOAD_QUEUE.csv rows
under workstream LESSON_PROGRESSION_AND_DUPLICATION (repeated widget signatures / exact-duplicate /
number-normalized-duplicate prompts among a lesson's own steps), plus one cross-owned
CHOICE_SURFACE_INTEGRITY row on asv-01-01.
Edits confined to content/courses/{length-problems-g2,measure-money-time,area-surface-volume,
counting-120,decimals-place-value,exponents-scientific-notation}/lessons/. No src/**, scripts/**, or
ledger edits. Math for every rewritten step recomputed with node one-offs (shown inline below).

Method note: for each queue row, the step id(s) named in `mismatch_evidence` are always the LATER
occurrence(s) in a within-lesson normalized-duplicate cluster (verified with a node scanner replicating
the S255/S316 `normalized()` function against every widget-bearing step's prompt); the earliest
occurrence in each cluster is the authored original and is left untouched. Per lesson, disposition is
(a) KEEP with a fluency/retrieval rationale when the repeated occurrences each drill a genuinely
distinct fact/case/edge-case (different coin denomination, different clock time and hour-boundary case,
different rendered line-plot, a deliberately "closer" comparison pair, etc.) with no elaboration lost,
or (b) REWRITE the later occurrence to differ in action, representation, misconception, constraint, or
transfer demand when the repeat is a bare operand-swap under an otherwise-identical template with zero
distinguishing content, per S316_ADJUDICATION_REMEDIAL_STANDARD.md's remedial-distinctness logic
(applied here to main-sequence steps; S316 itself binds only remedials, which none of these 30 rows
touch).

## asv-01-01 (PROGRESSION-asv-01-01 + CHOICE-0002) — k1 redesigned, k2 length leak fixed

**PROGRESSION defect**: k1 ("A triangle has base 10 and height 3. What is its area?", answer 15) was a
back-to-back operand-swap of i1's identical template ("A triangle has base 8 and height 5...", answer
20) — no concept, interactive, or new representation separates them; same action, same misconception
pair (forgot to halve / added instead of multiplied). True unintentional duplicate (class b).

Fix: k1 rewritten to test c1's "half of the enclosing rectangle" relationship directly rather than
re-deriving it — "A rectangle encloses a triangle that shares its base and height. The rectangle's area
is 24 square units. What is the triangle's area?" Answer 12. Traps: 24 (treats triangle = rectangle,
i.e. no halving) and 6 (over-halves, ÷4 instead of ÷2). Node-verified: `24/2=12`, `24/4=6`; both traps
≠ answer and ≠ each other. This is a different action (halve a *given* area vs. multiply-then-halve
from base/height) and a different misconception pair from i1, while staying inside the same
`triangle-area` concept family i1/k2/k3/ch1 already build. Removed k1's `variant` key
(`{"gen":"triangle-area-calc"}`): that generator's default form regexes the prompt for
`base (\d+) and height (\d+)` (verified read-only at `src/lib/variants.test.ts:4940-4946`), which the
new prompt no longer contains — VARIANT_LOG debt, not a src edit. Re-scanned the whole lesson after the
edit: zero normalized-duplicate clusters remain (i1/i2/k2/k3/ch1 all still template-distinct from k1 and
each other).

**CHOICE-0002 cross-fix** (this lesson is exclusively owned this round; fixed alongside the above per
task instructions): k2's mcq "What does \"height\" mean in the triangle area formula?" had correct
option "The perpendicular distance from the base to the opposite vertex" at 63 chars against a longest
distractor of 40 chars — a length-prose-vs-prose leak (correct answer conspicuously the most detailed
option). Rewrote all three labels to a tight, node-measured length band:

| option | before (chars) | after (chars) | after text |
|---|---|---|---|
| a (correct) | 63 | 55 | "The perpendicular distance from the base up to the apex" |
| b | 30 | 53 | "The length of the slanted side, not the straight drop" |
| c | 40 | 54 | "The length of whichever side happens to touch the base" |

Each option's original misconception is preserved (b = slant-side-as-height confusion, already the
lesson's own `c2`/`ch1` teaching point; c = any-side-touching-the-base confusion) — only wording length
changed, plus feedback for `b` reworded to match its new label text (`a` and `c` feedback already fit
and were left as authored). No option is now a length outlier (53-55 char band, correct not the max by
more than one character). Pre-existing, unrelated: k2's `variant`
(`{"gen":"triangle-area-calc","form":"heightMeaning"}`) was already mismatched against this widget's
shape before any edit here — the paired solver
(`src/lib/variants.test.ts:4948-4954`) regexes for a `"perpendicular leg of (\d+)"` phrasing and a
`"{h} — the perpendicular distance from the base"` option label that this MCQ-only, number-free widget
has never contained. Left untouched (src-side generator/gate concern, outside both named queue rows,
and not made any more broken by this edit).

i1, i2, k3, ch1, k2's prompt/hints, c1-c3, r1, and both remedials: unchanged.

reviewBasisHash after fix: `baad484a8ead42bed5c758152b01a7d961aaaafcb87e14fb093074149459f160`

## asv-01-02 (PROGRESSION-asv-01-02) — ch1 redesigned

Defect: ch1 ("A trapezoid has bases 14 and 6, and height 5. What is its area?") was a direct operand-swap
of k2's identical direct-formula template ("A trapezoid has bases 8 and 4, and height 3..."); both steps
even declared the identical `variant` (`{"gen":"composite-area-lab","form":"trapezoid"}`), confirming
mechanical duplication rather than independent authoring. True unintentional duplicate (class b).

Fix: rewrote ch1 into a word-problem transfer task — "A trapezoid-shaped tabletop has a 14 cm long edge
and a shorter parallel edge of 6 cm, with the two edges 5 cm apart. What is the area of the tabletop?" —
requiring the learner to first identify which given real-world lengths are the two bases and which is
the height, rather than receiving them pre-labeled as "bases"/"height" the way every other step in this
lesson does. Kept the numbers and correct answer identical to the prior ch1 (only the representation
needed to change): node-verified `((14+6)/2)*5 = 50` (correct), `14*5 = 70` (parallelogram-style
long-edge-only error), `0.5*14*5 = 35` (triangle-style long-edge-only error) — both traps ≠ answer and
≠ each other. Removed ch1's now-mismatched `variant`: the paired solver's only trapezoid-direct branch
(`src/lib/variants.test.ts:1671-1672`) regexes literally for `"A trapezoid has bases (\d+) and (\d+),
and height (\d+)"`, which the new tabletop wording no longer contains (verified read-only; every other
branch in that solver also fails to match, and the function's final branch is a bare `!`-asserted match
that would throw) — VARIANT_LOG debt. Re-scanned the full lesson after the edit: zero normalized-duplicate
clusters remain (i1/k1's parallelogram template, k2's bases-template, i2's decomposition template, k3's
piece-ledger template, and the new ch1 tabletop template are all mutually distinct).

i1, k1, k2, i2, k3, c1-c2, r1, and the remedial: unchanged.

reviewBasisHash after fix: `358cea0f96f4ddda7884e9f57a6f08c1568492c1239b9d6ef252d4b6e7b06ed0`

## asv-03-01 (PROGRESSION-asv-03-01) — KEEP, verified not a true duplicate

Queue evidence: `number-normalized-prompts=[k3]`, cluster `[i2,k3]` under the shared bare template
"A side runs from (#) to (#). What is its length?" (the scanner's `normalize()` collapses any `(x,y)`
pair to one `#` token, so it cannot see which coordinate is held constant).

Read both steps against the actual numbers: i2 — "A side runs from (−5,2) to (3,2)" — holds **y**
constant (2, 2): a HORIZONTAL side. k3 — "A side runs from (4,−6) to (4,2)" — holds **x** constant
(4, 4): a VERTICAL side. `c1` teaches only the horizontal rule; `c2` introduces both the vertical-axis
swap AND negative/zero-crossing coordinates in the same breath ("The same rule works for vertical
sides... It also works with negative coordinates"). Mapping every check: k1 = horizontal+positive,
i2 = horizontal+negative; k2 = vertical+positive, k3 = vertical+negative — the lesson deliberately fills
all four cells of a horizontal/vertical × positive/negative case matrix, and i2/k3 are the two
negative-coordinate cells. Node-reverified: `3-(-5)=8` (i2), `2-(-6)=8` (k3) — the shared answer value
is a coincidence of the chosen numbers, not evidence the tasks are the same; the axis being measured
differs. `ch1` (missing 4th corner, mcq) is a separate skill and was never part of this cluster.

Disposition: KEEP, no edit. This is legitimate spaced practice deliberately covering a case matrix the
text-only duplicate scanner cannot resolve (it operates on prompt text, not on which coordinate axis a
widget's own numbers hold constant).

reviewBasisHash (unchanged): `920e42eafdf70e93db7f6c814225994c964db27331c1f3fd7fd76d494f175371`

## asv-03-02 (PROGRESSION-asv-03-02) — ch1 redesigned

Defect: ch1 ("A right triangle has vertices (3,2), (9,2), and (3,7). What is its area?") was a bare
operand-swap of k1's identical bounding-box template ("A right triangle has vertices (1,1), (7,1), and
(1,5)..."); both declared the byte-identical `variant` `{"gen":"triangle-area-calc",
"form":"coordinateRightTriangle"}`, confirming mechanical duplication. (k3 escaped this cluster only
because its "the triangle you just plotted" wrapper ties it to `i2`, giving it a distinct sentence
skeleton despite the same underlying math job.) True unintentional duplicate (class b).

Fix: rewrote ch1 into a real-world sailboat-sail scenario — "A sailboat's triangular sail has its
right-angle corner at (−2,3), stretching to (5,3) along the boom and up to (−2,9) along the mast. What
is the area of the sail?" This is a representation/transfer change (applied nautical context vs. a bare
vertex list) plus a genuine constraint escalation: the lesson's first negative/zero-crossing coordinate,
carrying `asv-03-01`'s "distance is still positive, crossing zero doesn't change the rule" teaching point
into an area computation for the first time in this lesson. Node-reverified: legs `5-(-2)=7` and
`9-3=6`; area `7*6/2=21`; traps `42=7*6` (rectangle, forgot to halve) and `13=7+6` (added the legs
instead), both ≠ answer and ≠ each other.

Removed ch1's `variant`: the paired solver's `coordinateRightTriangle` branch
(`src/lib/variants.test.ts:4955-4959`) extracts coordinates with an ASCII-only `\((-?\d+), (-?\d+)\)`
regex, which does not match this repository's house minus-sign glyph (U+2212, verified byte-for-byte
against `asv-03-01`'s own negative-coordinate prompts) used in "(−2,3)" — the solver would silently
under-count the matched points and mis-total the bounding box. VARIANT_LOG debt, not a src edit.
Re-scanned the full lesson after the edit: zero normalized-duplicate clusters remain.

i1, k1, k2, i2, k3, c1-c2, r1, and the remedial: unchanged.

reviewBasisHash after fix: `1711b606d59d3316300231a098db40a516c37d648b3df14eeeb7600d3b47add6`

## asv-05-02 (PROGRESSION-asv-05-02) — ch1 redesigned

Defect: ch1 ("Find the volume of a box 2½ × 3 × 2.") was a bare operand-swap of k2's identical
"mixed-number-in-the-first-slot" template ("Find the volume of a box 3½ × 2 × 4."); both declared the
identical `variant` `{"gen":"fraction-volume"}` (default form), confirming mechanical duplication. `k1`
(fraction in the LAST slot, `halfCubes` form, verifies by packing) and `k3` (a PROPER fraction, not
mixed, `properFraction` form) are distinct task shapes and were never part of this cluster. True
unintentional duplicate (class b).

Fix: rewrote ch1 into a real-world crate scenario that synthesizes a mixed number AND a proper fraction
in the same box — "A shipping crate measures 2½ units long, 1/2 unit wide, and 8 units tall. What is its
volume?" This is a genuine constraint escalation (two different fraction types together, one per
non-integer edge) beyond either `k2` (one mixed number) or `k3` (one proper fraction) alone — an
appropriately harder capstone — plus a representation shift (applied crate context vs. the bare "box
A × B × C" recital every other numeric step in this lesson uses). Node-reverified:
`(5/2)*(1/2)*8 = 10`; traps `8 = 2*0.5*8` (dropped the ½ from 2½, correctly kept the 1/2) and
`20 = 2.5*1*8` (rounded 1/2 up to a whole unit) — both ≠ answer and ≠ each other, and each trap now
isolates a *different* one of the two fractional edges, which the original single-fraction ch1 could
not do.

Removed ch1's `variant`: the paired solver (`src/lib/variants.test.ts:6445-6446`) regexes literally for
`"box (\d+)½ × (\d+) × (\d+)"` with plain integers in the second and third slots, which this crate
wording (and its `1/2` second slot) no longer matches. VARIANT_LOG debt. Re-scanned the full lesson
after the edit: zero normalized-duplicate clusters remain.

i1, k1, k2, i2, k3, c1-c2, r1, and the remedial: unchanged.

reviewBasisHash after fix: `0aec947bcb4804b4dae01c019664631d6287035de4b5d4ac3ce66ac0a660b29f`

## measure-money-time (6 lessons) — all KEEP, verified as legitimate fact-family/case-coverage practice

Read all six lessons in full. Every one turned out to follow the same house pattern: a generic
instructional sentence ("Which coin is worth # cents?", "The minute hand points to #...", "Set the clock
to show #:#.", "A line plot shows # x's above the number #...") reused across several steps, each of
which supplies a **different, independently-computed fact** (a different coin, a different clock
position, a different time, a different plot). The text-only `normalize()` scanner used by the queue
tool collapses digits to `#` and therefore cannot see that the *content* differs even when the sentence
skeleton repeats — this is exactly the situation described in the task brief as "(a) legitimate spaced
practice." No content edits were made to any of these six lessons.

- **mmt-03-01**: `i1`=dime(10c), `k1`=quarter(25c), `k2`=penny(1c, unflagged) — three of the four US coin
  denomination facts from `c1`, cycled through a shared mcq template. Nickel is covered separately via
  `k3`'s moneyBoard count.
- **mmt-03-03**: three coin-type clusters (nickels/dimes/quarters), each pairing a positive-cents fact
  with a "how many make exactly 100 cents" fact; `i3`/`k3`/`ch1` are precisely the three facts the
  recap names verbatim ("A dollar is 100 cents — 4 quarters, 10 dimes, or 20 nickels"). Node-verified
  `100/25=4`, `100/10=10`, `100/5=20`.
- **mmt-04-01**: a dedicated skip-count-by-5 fact-family lesson; `i1/i2/i3/k2/k3/ch1` sample six of the
  eleven possible clock positions (7,6,11,2,9,1). Node-verified every `position × 5` product. An
  independent S316 assessor (`reports/closure/cowork-staging/laneB-measure-money-time-dispositions.jsonl`,
  `S316-MMT-mmt-04-01`) already reviewed this exact lesson and praised all six facts as correct.
- **mmt-04-02** and **mmt-04-03**: `clockSet` widgets whose text prompt is a fixed instruction
  ("Set the clock to show H:M.") — the actual pedagogical content (the target hour/minute) lives in
  widget parameters a text scanner cannot read. Each flagged step targets a distinct, hand-verified
  time chosen to hit a specific clock-reading edge case the adjacent concept step just introduced
  (on-the-hour, half-past, near-hour-boundary, wrap-past-12) — the recap in each lesson names exactly
  this case set. `mmt-04-02`'s S316 record independently praised the same eight times as correct.
- **mmt-05-03**: the `[i1,i3,k3]` line-plot cluster now each carries its own `plotData` block (added by
  an earlier S316 follow-up fix, confirmed present in the current file) rendering a genuinely different
  line plot to read off. The `[k2,ch1]` comparison cluster is a deliberate close-vs-clear-gap
  progression: `k2` (5 vs 9, gap 4) then `ch1`, explicitly labeled "A close comparison" (10 vs 11, gap
  1) — the harder near-tie case. Node-verified `9-5=4`, `11-10=1`.

reviewBasisHash (unchanged, all six): mmt-03-01 `19b41b782ba7f8c7a294c2605e2b5a9888e584a183db11184cfc6f1ab2d96813`;
mmt-03-03 `1c001f2874bf0db45bb8f9a588ecea010801d8814a267f6dfbc34abb55f7538f`; mmt-04-01
`59c0c0120e04ae1d9da922befe93560b116e07c1be8468d6db304cd8a368f769`; mmt-04-02
`ca08e4b398d8aed9cd171a55cfd5f80b7c0bd67b101d4fe73f4f156d1c03a30e`; mmt-04-03
`7ef8302a9cdd4b41268818a6018562d545156cceb6f2b0a48a5c396371f894b6`; mmt-05-03
`89f8e53c0598b19dc62e0d50c10c564dc64a590ff4a9e4fc095f4df42dd626b2`.

## length-problems-g2 (4 lessons) — all KEEP, three already closed by S323-P5

`g2p-02-01`, `g2p-03-02`, `g2p-03-03` carry the exact same PROGRESSION-<lessonId> queue rows this packet
was assigned, and were already closed **earlier today** by `cowork-s323-P5-fixer`
(`reports/closure/S323_FIX_P5.md`, `reports/closure/cowork-staging/laneA-s323-P5.jsonl`) via the queue
row's own first-offered path: "Assign question jobs and approve a fluency/retrieval rationale." Spot-
checked each file's content against P5's described fix (g2p-02-01's k2 trap value 6, g2p-03-02's k1
"45 cm ribbon / 30 cm ribbon" rewrite, g2p-03-03's k3 crayon-scenario rewrite) — all three are still
present and correct in the current tree; no revert occurred. `g2p-01-01` was not covered by P5 and is
this packet's own first read.

All four lessons share one course-level design: `k1` (or, for `g2p-01-01`/`g2p-03-03`, the first
occurrence in the cluster) is the first guided rep of a skill; an interleaved `k2` and/or `k3` gives a
same-template fluency rep, explicitly named as such in several lessons' own `explanationVariants`
("Order of joining is free." on `g2p-02-01`/k2); and `ch1` is a delayed-retrieval capstone with larger
numbers, its own body text often literally saying so ("One more, for the road." — `g2p-01-01`). Every
occurrence carries the same diagnostic trap pair by design. Node-reverified the arithmetic named in each
P5 record and in `g2p-01-01`'s own k1/ch1 (33−24=9, 57=33+24, 11=9+2; 54−28=26, 82=54+28, 28=26+2) — all
correct.

**Hash note**: `print-review-basis.mjs`'s `reviewBasisHash` depends on a corpus-wide cross-lesson MCQ
duplicate-cluster map (`buildDuplicateInventory` in `scripts/audit/lesson-review-authority-s246.mjs`),
not solely on the named lesson's own file bytes — so it legitimately drifts as the ~15 sibling lanes in
this wave edit other lessons' MCQ content concurrently, even for a file this packet never touched. The
three P5-authored hashes recorded in `laneA-s323-P5.jsonl` (captured ~04:16-04:18 UTC) therefore no
longer match a fresh computation (captured ~10:39 UTC) for `g2p-02-01`/`g2p-03-02`/`g2p-03-03`, though
each lesson's own JSON bytes are confirmed unchanged since P5's edit. This packet's records below carry
freshly-recomputed hashes as of this review.

reviewBasisHash (fresh, this review): g2p-01-01
`f115dd4a6b426b474efe44cb92c48795927cd6f2181e17deb4a6698afc8a9601`; g2p-02-01
`f48b48493ea6d50a73f09515bf7a138fbd731e8057a2b136039f221afb1aae53`; g2p-03-02
`733649bded97ec2e7cb9b039a8a1fe9f2f4866b2a6f53f2a6a859d7310bb5416`; g2p-03-03
`2833066ffc70813be8720b781da23b07ecdefac056236a4d089ca973a0c0d623`. No edits made to any of the four
files this round.

## counting-120 (5 lessons) — all KEEP, deliberate case-coverage/escalation in an early-grade fact drill

Read all five lessons in full. This course is Grade 1/early-Grade-2 (numbers to 120) and every flagged
cluster follows the same house pattern seen in `measure-money-time`: a short generic sentence template
reused across steps, each occurrence supplying a **different underlying number fact or case**, with the
lesson's own recap/body text frequently naming the case set explicitly. The text-only `normalize()`
scanner collapses digits to `#` and cannot see this. No content edits were made to any of these five
lessons; language in all five is already simple/direct and age-appropriate for early-grade counting.

- **c120-01-02**: flagged step repeats the "decade-crossing" add-one template (e.g. 39+1=40) at a
  DIFFERENT decade boundary than the canonical occurrence. The lesson's own recap states the case set
  verbatim: "29→30, 39→40, 49→50, and on" — explicit deliberate coverage of the boundary family, not a
  repeated instance of the same boundary.
- **c120-03-01**: flagged step repeats the tens/ones "build the number" template but escalates magnitude
  across the lesson (47→62→94, body literally "the biggest build yet!") and/or exercises a distinct edge
  case not present at the canonical occurrence: `k3`=80, a round ten with a **zero ones digit** (a known
  distinct misconception case for place-value beginners, since the ones column reads "0" rather than
  being simply smaller). Escalating difficulty plus a dedicated edge case, not a duplicate.
- **c120-04-03**: flagged step repeats the "add ten" template but `k1` targets crossing-100 (90+10=100)
  while `k2` targets reaching-120 (110+10=120) — the course's own named ceiling. Node-verified both sums.
  Each carries its own `commonErrors` trap tuned to a different misconception (off-by-a-hundred on the
  100 case; stopping short of/overshooting the 120 ceiling on the 120 case) — two structurally distinct
  milestones, not an operand-swapped repeat of one.
- **c120-05-01**: the "one less than a round ten" fact recurs three times but each occurrence changes the
  representation/demand: `k1` is a direct numeric case (60→59); `k3` is an MCQ **discrimination** task
  (70→69, body "More or less?") requiring a choice among distractors rather than bare recall; `ch1`
  crosses a hundred boundary (100→99, body "One less across a hundred!") — the deliberate inverse of this
  same lesson's earlier `i2` step ("one more than 99→100"). Three distinct representations/transfer
  demands across one lesson, not a duplicate.
- **c120-05-02**: mirrors the identical three-way progression as `c120-05-01` one chapter later: `k3` is
  an MCQ discrimination task (58→68, body "Don't mix them up.") and `ch1` crosses into the hundreds
  (90→100, body "Ten more past the chart!"), a round-hundred-boundary case structurally distinct from the
  canonical occurrence.

reviewBasisHash (unchanged, all five): c120-01-02
`f63252e482769e176f4e1a38fd07c51f1913c879b2055246e35c6fa54e92b954`; c120-03-01
`70e541daa4dc29735f5eb605bccef75088846cb146b838882a94781536ad4f93`; c120-04-03
`0a703f7a4c81bc7f74e21f1a26c0bcf0c5e315b41089f7fb34b0c0c66b5d2cc9`; c120-05-01
`fe926f6c318b161d8f63f9e60ddce17428ff18f03f5a63aec24bd700572a1cd5`; c120-05-02
`093c765cd658ccfc9d94940c31e0bd76a9bb8a13b430ad297ab0dd97cd5c46b4`. No edits made to any of the five
files this round.

## decimals-place-value (5 lessons) — 4 KEEP, 1 rewrite (dpv-04-01/k3)

Read all five lessons in full. Four of five turned out to be well-designed, deliberate case-coverage
progressions (often more explicitly signaled than in other courses, via per-step body-text labels and,
in two lessons, per-step `variant.form` values that differ across the flagged cluster). One pair
(`dpv-04-01` k2/k3) was, on close inspection, a genuine near-bare operand swap and was rewritten.

- **dpv-01-03** (`k3` flagged): `k1` ("5 ÷ 10 = ?") divides a WHOLE NUMBER into tenths for the first
  time; `k3` ("0.5 ÷ 10 = ?") divides an already-decimal tenths value into hundredths — distinct
  starting-place cases directly testing c1's thesis that "the point is a landmark, not a wall."
  Confirmed by different variant forms: `k1` has `{gen:"ladder-shift"}` (no form), `k3` has
  `{gen:"ladder-shift",form:"divTenth"}`.
- **dpv-02-02** (`ch1` flagged): `k2` ("2/10+4/100"→0.24) is a basic two-adjacent-place rebuild; `ch1`
  ("3/10+9/1000"→0.309, body "The gap that needs a zero.") tests a SKIPPED middle place requiring a
  placeholder zero — explicitly one of only three recap takeaways, and targeted by a distinct
  commonErrors set (omitting the zero-holder / shifting right / adding pieces together) vs k2's
  digit-swap/naive-addition errors.
- **dpv-03-01** (`k1,k2,i2,ch1` flagged, cluster with canonical `i1`): the clearest case in this batch —
  a deliberate 5-step progression through decimal-comparison gotchas, each with its own body-text label:
  `i1` (0.6 vs 0.4, first place differs), `k1` ("When tenths tie.", 0.35 vs 0.38), `k2` ("Fewer digits,
  still bigger.", 0.7 vs 0.68 — its exact numbers are quoted verbatim in r1's own takeaway), `i2`
  ("Tenths tie again.", 0.52 vs 0.5, implicit trailing zero), `ch1` ("The close one.", 0.409 vs 0.41,
  every trap combined). `k1`/`k2`/`ch1` each carry a different `variant.form`
  (decimalTie/decimalMixed/decimalClose). A lesson whose entire point is discriminating these scenarios
  necessarily reuses the "Which is greater: # or #?" template — that repetition is the curriculum, not a
  defect.
- **dpv-04-01** (`k2,k3` flagged, cluster with canonical `k1`): `k1` (3.8→4, digit 8, non-halfway) vs
  `k2` (0.5→1, body "The halfway case.") is a legitimate distinct sub-rule (the halfway-rounds-up
  convention, explicitly introduced by c2's concept text) — KEEP. But `k2` vs `k3` (12.5→13, body
  "Bigger whole part.") did not hold up on closer reading: same halfway convention, parallel
  commonErrors (floor-value / unrounded-alternate), near-identical explanationVariants phrasing — only
  the whole-number magnitude changed, with no new misconception, representation, or constraint. **True
  duplicate — rewrote k3.** New `k3`: body "Digits past the tenths don't matter."; widget prompt "A
  stack of firewood is 6.49 meters tall. Rounded to the nearest whole meter, how tall is the stack?";
  answer 6; commonErrors now `7` (models the classic double-rounding slip: 6.49→6.5→7, rounding twice
  instead of once) and `6.5` (rounds to the wrong place — nearest tenth, not nearest whole). This targets
  a genuinely new misconception (digits beyond the decider never matter / no double-rounding) that
  neither `k1` nor `k2` tests, and is also named in r1's third takeaway ("The rest of the digits after
  the tenths don't change the decision") which previously had no dedicated main-sequence exercise.
  Node-verified 6.49 is closer to 6 (dist 0.49) than 7 (dist 0.51). Confirmed via `scan.mjs` that the new
  prompt's normalized template ("a stack of firewood is # meters tall...") no longer collides with
  k1/k2/rem-rtw-k's "round # to the nearest whole number." cluster. No `variant` key existed on the
  original k3 (none to remove).
- **dpv-04-02** (`k3` flagged, cluster with canonical `k1`): `k1` (0.78→0.8, straightforward
  clearly-closer digit) vs `k3` (3.15→3.2, body "Halfway still rounds up.") — the exact-halfway
  convention sub-case, the same distinct-rule relationship already validated for this course's own
  `dpv-04-01` k1-vs-k2 pair (companion lesson, same chapter). Node-verified 3.15 is exactly equidistant
  between 3.1 and 3.2, so the convention genuinely applies rather than being cosmetic.

reviewBasisHash: dpv-01-03 `696eae7e46c9c53d54dbcac6350db9332105daebc56a2dfa298d26e6f389c47b` (unchanged);
dpv-02-02 `17b50d2fc5006b41c3d9e01e84405d98a490ae5c0d8b66355595ad2a5ac84ee4` (unchanged); dpv-03-01
`ba17abd100bfa68a187fb41a26a05a0177431794b63926f3f1336adb14dc530b` (unchanged); dpv-04-01
`270210c64a5810a4689127609e62b58be7f0499892f1f122f38a3d4e128c4e0b` (k3 rewritten); dpv-04-02
`7906e6b88fd5be334a0e848f243ecc7bf7c86f353353832c3012b5b77a206748` (unchanged).

## exponents-scientific-notation (5 lessons) — 1 KEEP, 4 with rewrites (10 steps total redesigned)

Read all five lessons in full. This course had the heaviest flagged-step counts in this packet (up to
4 flagged steps in a single lesson) and, on close inspection, the weakest built-in differentiation: three
of the five buildExpression-heavy clusters used `variant.form` identically across multiple flagged steps
(a strong true-duplicate signal per this packet's own precedent), and several pairs had near-word-for-
word-identical `explanationVariants`/commonBuilds phrasing with only the numbers swapped. This course
needed substantially more rewriting than any other in this packet.

- **esn-01-03** (`i2` flagged, cluster with canonical `k1`): clean KEEP. `k1` (4,000, positive exponent)
  vs `i2` (0.007, negative exponent) mirrors this same lesson's own unflagged `k2`(positive)/`k3`
  (negative) pair later on — a deliberately repeated positive/negative design, not a duplicate.
- **esn-02-01** ("Solving x² = p", `k2,k3,i3,ch1` flagged, cluster with canonical `k1`): the clearest true-
  duplicate cluster in this packet. All four flagged steps were near-bare operand swaps of k1's "Which
  values solve x² = N?" template, sharing one trap shape (drop-negative / half-of-N / N-itself), and
  THREE of the four carried an identical `{gen:"root-solve"}` variant with no distinguishing form.
  **Rewrote all four**: `k2` → unisolated form "Which values solve x² − 36 = 0?" (algebraic rearrangement
  required first); `k3` → word-problem translation "A number, multiplied by itself, equals 144..."; `i3`
  → reversed direction "Which equation has the solutions x = 9 and x = −9?" (MCQ, given-solutions→
  find-equation); `ch1` → real-world domain restriction "A square rug has an area of 169 square feet.
  What is the side length...?" (numeric widget — only the positive root is physically valid, the first
  time this course tests filtering the ± pair by context). Node-verified 6²=36, 12²=144, 9²=81, 13²=169.
  Removed the now-mismatched `root-solve` variant from k2/k3/ch1 (their new prompts no longer match the
  solver's `x^2 = N?` regex); k1 untouched, keeps its original variant.
- **esn-02-02** ("Cube Roots & x³ = p", `i2,k2,k3,ch1` flagged, cluster with canonical `k1`): `i2` (x³=−8,
  MCQ) and `k2` (x³=−27, buildExpression) are legitimate — a genuine positive/negative-input distinction
  plus a recognition-vs-construction format difference. But `k3` (x³=125) shared k1's identical variant
  form ("cube") with a parallel distractor structure, and `ch1` (x³=−125) shared k2's identical variant
  form ("cubeNegative") with a literally identical 3-token structure — both true duplicates. **Rewrote
  both**: `k3` → word-problem translation "A number, multiplied by itself three times, equals 216..."
  (numeric widget, tests divide-by-3 and halving misconceptions distinct from k1's sign traps); `ch1` →
  volume-to-edge application "A cube-shaped box has a volume of 343 cubic inches. What is the length of
  one edge?" (connects back to i1's visual volume-builder concept without its visual aid). Node-verified
  6³=216, 7³=343. Removed the now-mismatched variant from both.
- **esn-03-01** ("Writing Large Numbers in Scientific Notation", `k2,i3,k3` flagged, cluster with
  canonical `k1`): `k1` (7,000, one-significant-digit coefficient) vs `i3` (9,300,000, two-sig-fig
  coefficient 9.3, MCQ) is legitimate. But `k2` (8,200,000) and `k3` (4,500,000) both duplicated i3's
  exact sub-case (two-sig-fig coefficient, same 10⁶ exponent class, buildExpression format) with only the
  digits changed. **Rewrote both**, escaping the "N in scientific notation is:" template: `k2` →
  real-world rate "A processor completes 250,000 operations per second..." (a fresh 10⁵ exponent class,
  not otherwise tested); `k3` → real-world count "A stadium sold 5,080,000 tickets this year..." testing
  the distinct internal-zero-preservation misconception (5.08, not 5.8). Node-verified 2.5×10⁵=250,000
  and 5.08×10⁶=5,080,000. Removed the now-mismatched `sci-notation` variant from both (their new prompts
  no longer start with a bare number, so the solver's anchored regex — `^([\d,.]+) in scientific
  notation is:` — cannot match).
- **esn-03-02** ("Writing Small Numbers...", `k2,i3,k3,ch1` flagged, cluster with canonical `k1`, the
  negative-exponent companion to esn-03-01): `i3` (0.0000002, whole coefficient, exponent −7, MCQ) and
  `k3` (0.05, whole coefficient, exponent −2, buildExpression) are legitimate — distinct from k1's
  decimal-coefficient case via coefficient type, and from each other via exponent depth and format. But
  `k2` (0.00061, exponent −4) shared k1's decimal-coefficient shape with near-word-for-word-identical
  feedback templates, and `ch1` (0.00000003, exponent −8) duplicated k1's EXACT exponent magnitude while
  only varying coefficient type (already covered by i3/k3) — both true duplicates, ch1's redundancy
  especially clear given the capstone slot should introduce new territory. **Rewrote both**: `k2` →
  real-world "A bacterium measures about 0.0000015 meters..." (exponent −6, a fresh depth); `ch1` →
  real-world "A dust particle measures about 0.0000406 meters..." testing the internal-zero-preservation
  misconception (4.06, not 4.6) — the negative-exponent mirror of esn-03-01's own k3 fix in this lesson's
  sibling. Node-verified 1.5×10⁻⁶=0.0000015 and 4.06×10⁻⁵=0.0000406. Removed the now-mismatched variant
  from both.

reviewBasisHash: esn-01-03 `eb74790e75b488e137ad9b19c42d599f3e62075247068ecc221c7529d8bebecd`
(unchanged); esn-02-01 `c081c6c1ee964807dad776aa8109433e4ac30193535c1efc80eec7a8d708209d` (4 steps
rewritten); esn-02-02 `26ed2e36b92c968514807a09246787f283c7389e793d5678dad88dfa72d674e1` (2 steps
rewritten); esn-03-01 `4b1d749ce97391e5b00c55fee884869b0cab2ba98c7b1256503757e6e3ff581d` (2 steps
rewritten); esn-03-02 `dadaa556c5f3f977df53ca557226f1d536f10cd56c39068fab2b878bc7ae79db` (2 steps
rewritten).

## Packet summary

30/30 assigned lessons closed. 1 CHOICE_SURFACE_INTEGRITY cross-fix (asv-01-01/CHOICE-0002). 0
escalations — no lesson required a `src/**` change to resolve. Full per-lesson classification, counts,
and disposition are returned in this session's final report to the calling agent.
