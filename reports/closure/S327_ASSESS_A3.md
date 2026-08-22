# S327 Assessment — Assessor A3 — course `tens-and-ones` (12 lessons)

Reviewer: cowork-s327-A3-assessor. Wave: codex/v4-s244-authored-visual-wave, session S327, lane B.
Scope: FIRST-EVER full portfolio-grain review disposition for `tno-01-01` … `tno-04-03`
(`content/courses/tens-and-ones/lessons/<id>.json`). Edits made only under
`content/courses/tens-and-ones/`; no `src/**`, `scripts/**`, ledger, or other staging files touched.

Method per lesson: read the whole lesson JSON; recomputed every widget's math by hand (place-value
arithmetic is simple enough that no node one-off was needed beyond spot mental verification, but see
note below on tolerance for any borderline case); checked every `commonErrors` trap value is
reachable, distinct from the answer and from other traps, and that its feedback names the specific
misconception rather than restating the correct answer generically; checked every referenced `figure`
id against `src/components/figureIds.ts` (registered set) and against its implementation in
`src/components/figures.tsx` for truthful depiction; checked every `remedials[]` entry against
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` clauses R1–R6; checked MCQ/predict option
length balance; checked question-job progression across the lesson; checked learner-facing language
for grade-1/2 fit (short, concrete, present tense). Grepped `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` for
each lesson id under `LESSON_PROGRESSION_AND_DUPLICATION` and `CHOICE_SURFACE_INTEGRITY` workstreams —
**zero rows found for any of the 12 `tno-*` lessons** (confirmed both by per-id grep and by listing all
unique workstream values in the file and checking each `tno-` row: only `VISUAL_FIRST_REPRESENTATION`,
`GRADE_LANGUAGE_REVIEW`, and `LESSON_COMPLETE_DISPOSITION` rows exist for this course). No cross-fix
ownership triggered by step 2 of the assignment.

**Note on `cml` blocks.** Every concept/interactive step in this course carries a `cml` metadata object
(`kernel`, `stage`, `misconceptions`, `explanation`, etc.) with templated, sometimes academic-register
text (e.g. "Changing a visible feature without preserving the relationship that defines tno X.").
Verified via grep that `src/components/playerStore.ts` — the runtime that actually renders lesson
content to a learner — contains **zero references to `cml`**; only the zod validator in
`src/lib/schema.ts` touches the field (structural validation only, e.g. "CML explanation must contain
exactly one correct option"). This confirms `cml` is non-rendered authoring/research metadata, not
learner-facing content, consistent with `S316_ADJUDICATION_REMEDIAL_STANDARD.md`'s own observation that
"the templated `cml.misconceptions` field carries only boilerplate." Its language register and
boilerplate repetition is therefore **excluded** from `gradeLanguageDecision` and answer-leak scrutiny
throughout this report; only `body`, `widget.*`, `predict.*`, `hints`, `explanationVariants`,
`takeaways`, `teaser`, and `remedials[].*` were evaluated as learner-facing.

**Note on a pre-existing collision in the shared staging file.** At the start of this session
`reports/closure/cowork-staging/laneB-s327-A3.jsonl` did not exist. Before this assessor's first
append, a line from reviewer `cowork-s327-A1-assessor` for lesson `pv1000-01-02` (a different course,
outside this assessor's scope) appeared in that same file — apparently a sibling agent in this wave
wrote to this file in error. Per the standing instruction to never revert/stash/clean the working tree,
that line was left untouched; this assessor's five... [see below]... records were appended after it.
Flagging for the orchestrator in case the naming collision affects other lanes.

---

## tno-01-01 — Ten Ones Make a Ten

**Math verified.** i1/i2 `baseTenCompose` builds (target 30 and 40) and their `commonBuilds` traps
(33 from 3 rods+3 cubes; 3 from 0 rods+3 cubes; 44 from 4 rods+4 cubes; 4 from 0 rods+4 cubes) are all
arithmetically correct and their feedback names the actual mistake. `k1` 5 tens=50 ✓, traps 5 (bare
tens count) and 15 (additive 5+10 slip, feedback already said "Don't add") both correct and diagnostic.
`i3` 70=7 tens ✓. `k2` 60 ones=6 tens ✓. `k3` 20 apples=2 bags ✓. `ch1` 9 bundles×10=90 straws ✓.
`predict` (3 rods = 2 rods+10 cubes, "same") is correct; a rod trades for exactly 10 cubes.

**Figures.** `ten-bundle`, `tno-bundle-40`, `tno-ten-is-ten` — all three present in `FIGURE_IDS` and
mapped in `figures.tsx` (`TenBundle` / `TnoBundle40` / `TnoTenIsTen`). Read each SVG's `<title>` and
drawn content: `TenBundle` shows 10 loose cubes = 1 rod (matches c1's "ten single ones bundle... make
one ten"); `TnoBundle40` shows 40 ones -> 4 tens (matches c2's "40 ones make 4 tens"); `TnoTenIsTen`
shows 1 rod = 10 loose cubes both ways (matches c3's "a bundle keeps its size... whether you see a rod
or ten loose cubes"). All truthful.

**Defect found and FIXED — generic trap feedback (small, fixed directly).** `i3`'s second trap
(`value: 17` for "How many tens make 70?") read only `"70 splits into 7 groups of ten, so 7 tens."` —
this restates the correct reasoning but never says why a learner would type 17, unlike its sibling
traps in the very same lesson: `k2`'s `value: 16` ("That mixes the digits together...") and `k3`'s
`value: 12` ("That mixes the digits together..."). All three traps are the same "digit-mixing" shape
(prepend a spurious "1" to the correct one-digit tens answer: 7->17, 6->16, 2->12) but only `i3`'s was
left undiagnosed. **Fix:** prefixed `i3`'s value-17 feedback with `"That mixes the digits together."`
to match its siblings. One-line edit, `content/courses/tens-and-ones/lessons/tno-01-01.json` only.

**Defect found and FIXED — remedial R2 + R6 violation (fixed directly, per S316 §3 "small mechanical
fix" authorization).** `remedials[0]` (conceptTag `tno-ten-bundle`, shared by k1/k2/k3/ch1) originally
read: concept body *"...So 3 tens = 30 ones (count by tens)..."*, check prompt *"How many ones are the
same as 3 tens?"* answer 30. Applying S316-R:
- **R1/R3** (byte-identity vs `k1`): technically passed — numbers differ (3 vs 5).
- **R2** (normalized vs every widget-bearing step): **FAILED.** `normalized(remedial.prompt)` =
  `"how many ones are the same as # tens?"` = `normalized(k1.prompt)` exactly (k1 = "How many ones are
  the same as 5 tens?"). This is the textbook "operand swap under an unchanged template" defect
  `S316_ADJUDICATION_REMEDIAL_STANDARD.md` §1.3 measures as generator-regenerable and therefore an
  intermittent duplicate on replay, not a fixed one.
- **R6** (concept states the check's answer): **FAILED, and more directly than R2.** The concept body's
  own worked example is "3 tens = 30 ones" — exactly the fact the check then asks for, one field away
  in the same injected pair (`playerStore` renders `[concept, check]` back to back). A learner reads the
  answer, then is asked for it.
- **R4/R5**: k1 carries `variant: {gen:"g1-tens-ones", form:"TnoTenBundleNumeric"}`; an unchanged
  "How many ones are the same as N tens?" template is highly likely to fall inside that generator's own
  draw space (the S316 doc's own worked example, `CountOnSmallNumeric`, shows exactly this generator-
  regenerable failure mode for a same-template operand swap).

**Fix applied** (edited `remedials[0].check.widget` only — concept, conceptTag, ids untouched, per
S316 §1.4 "Explicitly NOT binding: rewriting authored `remedial.concept.body`"): new prompt *"A shelf
holds 6 bundles of ten pencils. How many pencils are on the shelf?"*, answer 60, traps recomputed (6 =
bundle count mistaken for total; 16 = additive 6+10 slip, feedback explicitly says "Don't add"),
`fallbackFeedback`/`explanationVariants` updated to match. Verified: `normalized(new prompt)` differs
from every widget-bearing step in the lesson (i1, i2, i3, k1, k2, k3, ch1); the unchanged concept body
(still only about 3 tens/30 ones and 40 ones/4 tens) states nothing about 6 or 60, so R6 is resolved by
construction; the new template ("A shelf holds N bundles of ten pencils...") is structurally unrelated
to `TnoTenBundleNumeric`'s template, satisfying R4 by route-change (S316 §1.4: "R2 satisfies R4
automatically whenever the route, not merely the numbers, changed").

**Progression.** c1(bundle up, predict)→i1(build any way)→k1(abstract tens→ones)→c2(bundle down)→
i2(build standard form)→c3(bundle invariance)→i3(abstract tens count)→k2/k3(reversed direction, apple
context)→ch1(straws, harder ×9)→r1. Escalating contexts and directions, not pure repeats.

**MCQ/predict balance.** Only one MCQ-shaped surface: the `predict` options ("Maya has more" / "They
have the same amount" / "Leo has more", 14/25/12 chars). The correct answer is the longest option by a
noticeable margin — a mild length "tell." Not fixed: `predict` is an ungated, immediate-reveal
formative device (verified via `playerStore.ts:150-151`, it only scores whether the prediction was
"held", it never gates lesson progress), and the imbalance is an artifact of the nuanced "both/same"
answer genuinely needing more words than either absolute distractor — padding the distractors would
hurt, not help, grade-1 clarity. Recorded as a minor observation only; not disposition-changing.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met — concrete bundling equivalence is the entire
point of this lesson, all three figures present/registered/truthful). `gradeLanguageDecision: FIT`
(short, concrete, present-tense throughout).

---

## tno-01-02 — Tens and Ones in a Number

**Math verified.** i1 tens-in-46=4 ✓, k1 ones-in-46=6 ✓, i2 `baseTenCompose` build 46 traps (64 from
digit-swap 6 rods/4 cubes; 40 from 4 rods/0 cubes) both correct, `predict` (left digit = rods/tens)
correct, i3 72 pencils/10=7 groups ✓ (with the leftover-2 trap explicitly named, a good diagnostic
example), k2 5 tens+3 ones=53 ✓, k3 30 buttons/0 loose ✓, ch1 8 tens+1 one=81 ✓. All `commonErrors`
traps recompute correctly with specific, non-generic feedback (e.g. k2's "Don't add 5 and 3. The 5 is
tens and 3 is ones: 53.").

**Figures.** `base-ten-blocks`, `tno-build-46`, `tno-digits-72` — all registered and mapped
(`BaseTenBlocks`/`TnoBuild46`/`TnoDigits72`). `TnoBuild46`'s SVG explicitly draws 4 rods + 6 cubes =
"46" (matches c2 exactly); `TnoDigits72` draws "72" as 7(sky)/2(tangerine) next to "7 tens, 2 ones" and
"30" as 3(sky)/0(tangerine) next to "3 tens, 0 ones" (matches c3's two-example body exactly). Truthful.

**Defect found and FIXED — remedial R1/R2 violation, worst-case form (byte-identical to an already-seen
ungated step), plus R6 (fixed directly).** `remedials[0]` (conceptTag `tno-tens-ones`) originally read:
check prompt *"How many tens are in 46?"* answer 4. This is **byte-identical** — same text, same
number, same answer — to step `i1`'s prompt, which the learner already answered (with immediate
feedback) during the ordinary first walk, before any remedial could ever fire. Per this assignment's
own expanded R2 instruction ("likewise against every main-step widget prompt in the same lesson (k2,
k3, ch1, i1, i2) — not just k1"), this is a direct violation, and the worst form of it: zero
representation change, zero number change, so zero new diagnostic information for a learner who is
already stuck. Compounding it, `remedials[0].concept.body` stated **all three** relevant facts about
46 ("4 tens and 6 ones... 4 tens with 6 ones build 46"), so *any* check anchored on 46 — tens-in-46,
ones-in-46 (the actual `k1`/conceptTag-anchor skill), or build-from-parts — would fail R6 regardless of
which sub-fact it asked.

**Fix applied** (edited `remedials[0].check.widget` only): rather than just reword the same 46-anchored
question (which would still be leaked by the concept body), moved to a fresh number entirely and
targeted the actual `k1` skill (ones-digit identification) via a representation already present in this
same lesson (`i3`'s "pencils bundled in groups of ten" real-world framing), asking for the complementary
quantity `i3` never asked (leftover/ones instead of full-groups/tens): *"Pencils are bundled in groups
of ten. There are 58 pencils. How many pencils are left over, outside the full groups of ten?"* answer
8. Traps recomputed (58 = total mistaken for leftover; 5 = full-group count mistaken for leftover),
`fallbackFeedback`/`explanationVariants` updated. Verified: normalized prompt differs from i1, k1, i3,
k2, k3, ch1; the unchanged concept body (only discusses 46) states nothing about 58 or 8.

**Progression.** c1→i1(tens)→k1(ones)→c2(build)→i2(build+predict)→c3(generalize, incl. zero-ones
case)→i3(real-world tens)→k2(build from parts)→k3(zero-ones check)→ch1(build from parts, harder)→r1.
Varied contexts and directions.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

## tno-01-03 — Reading Base-Ten Blocks

**Math verified.** i1 build 47 (4 tens 7 ones) ✓, `predict` (7 cubes out-count 4 rods on pieces; 4 rods
worth more, 40 vs 7) ✓, k1 2 rods+7 cubes=27 ✓, i2 5 rods+0 cubes=50 ✓, i3 6 rods+4 cubes=64 ✓, k2 4
rods+9 cubes=49 ✓, k3 7 rods+2 cubes=72 (Deja's-mistake framing) ✓, ch1 9 rods+9 cubes=99 ✓. All traps
recompute correctly. `k3`'s trap value 27 is a notably strong diagnostic design: it reuses Deja's own
stated wrong answer from the prompt itself and its feedback says *"That repeats Deja's mistake"* —
directly names the misconception (parroting a given wrong value rather than recomputing).

**Figures.** `base-ten-blocks`, `tno-rods-50`, `tno-rods-64` — all registered/mapped. `TnoRods50` and
`TnoRods64` (read at lines 15447+) draw exactly 5-rods-0-cubes=50 and 6-rods-4-cubes=64 per their
`<title>` text, matching c2/c3 exactly. Truthful.

**Defect found and FIXED — remedial double violation: R2 (template-identical to k1) AND R6 (concept
states the exact answer one sentence before the check), fixed directly.** `remedials[0]` originally
read: concept body *"...Count the rods for tens, then the cubes for ones: 3 rods and 5 cubes show
35."*, check prompt *"3 rods and 5 cubes show what number?"* answer 35. Two independent violations:
(a) `normalized(check.prompt)` = `"# rods and # cubes show what number?"` = `normalized(k1.prompt)`
exactly (k1 = "2 rods and 7 cubes show what number?") — R2 fail vs the lesson's own main check; (b) the
check's prompt is the concept's own just-stated sentence with the number replaced by a blank — the
single most literal form of R6's "answer stated in the immediately-preceding text" violation in the
whole course. This also reuses c1's own opening worked example (c1: "3 rods and 5 cubes means... 35"),
so a learner who fails any of k1/k2/k3/ch1 would be shown, verbatim, the lesson's very first example a
second time and asked to recite the one fact just given — near-zero diagnostic value.

**Fix applied** (edited `remedials[0].check.widget` only): new prompt using a fresh number and a
representation not yet used by any widget in the lesson: *"A backpack has 8 rods and 3 cubes packed
inside. What number do the blocks show?"* answer 83. Traps recomputed (11 = additive 8+3 slip,
explicitly named "Don't add 8 and 3"; 38 = digit-swap, explicitly named), `fallbackFeedback`/
`explanationVariants` updated. Verified: normalized prompt differs from i1/k1/i2/i3/k2/k3/ch1; the
unchanged concept body (still only about 3/5/35) states nothing about 8, 3, or 83.

**Progression.** c1(intro, predict pieces-vs-worth)→i1(build+predict)→k1(fewer rods)→c2(zero-cubes
case)→i2(zero-cubes check)→c3(rods-first ordering)→i3(riddle framing)→k2(shelf context)→k3(mistake-
correction framing)→ch1(hardest, 9+9)→r1. Strong variety, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met — this lesson's entire job is visual block
reading). `gradeLanguageDecision: FIT`.

---

## tno-02-01 — Breaking a Number Apart

**Math verified.** i1 build 63=60+3 ✓, `predict` (63=60+3 not 6+3; option lengths "6 + 3"/"6 + 30"/
"60 + 3" = 5/6/6 chars, balanced, no length tell) ✓, k1 58=50+8 ✓, i2 value of 7 in 72 = 70 ✓, i3
70+2=72 ✓, k2 tens-value-30 + ones-5 = 35 ✓, k3 60+?=64 so ?=4 ✓, ch1 89 marbles − 80 bagged = 9 loose
✓. All traps recompute correctly with specific feedback (e.g. k3's "6 is the tens digit of 64, not the
missing addend").

**Figures.** `expanded-form`, `tno-tens-worth`, `tno-expanded-72` — registered/mapped, truthful (46=
40+6; 7 tens worth 70; 70+2=72, matching c1/c2/c3 respectively).

**Defect found and FIXED — remedial R2 + R6 violation (fixed directly).** `remedials[0]` originally
read: concept body *"...46 = 40 + 6. The tens digit's value is the digit × 10, so the 4 in 46 is worth
40."*, check prompt *"46 = 40 + ?"* answer 6. `normalized(check.prompt)` = `"# = # + ?"` =
`normalized(k1.prompt)` exactly (k1 = "58 = 50 + ?") — R2 fail. And the concept states "46 = 40 + 6"
verbatim immediately before the check asks for that identical blank — R6 fail.

**Fix applied** (edited `remedials[0].check.widget` only): switched to a sentence-form prompt with
fresh numbers absent from the concept body: *"The tens part of a number is 20. The whole number is 27.
What is the ones part?"* answer 7. Traps recomputed (20 = tens part already given, not the ones part;
27 = whole number, not just the ones part), `fallbackFeedback`/`explanationVariants` updated. Verified
normalized prompt differs from k1 ("# = # + ?"), i2, i3, k2 (superficially similar "two facts then a
question" shape but asks the *inverse* question — given tens+ones find total, vs the remedial's given
tens+total find ones — with different wording throughout, so the strings are not equal), k3, ch1; the
unchanged concept body (only about 46/40/6/4) states nothing about 20/27/7.

**Progression.** c1→i1(build+predict)→k1(ones-part)→c2(tens value)→i2(tens value check)→c3(recombine)→
i3(recombine check)→k2(construct from parts)→k3(missing addend)→ch1(marbles word problem)→r1. Good
escalating variety.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

## tno-02-02 — Reading Expanded Form

**Math verified.** i1 build "40+6 names" = 46 ✓ (commonBuilds: 406 from hundreds-gluing trap and 64
from part-swap trap, both correct and well-diagnosed), `predict` (40+6 is two digits, not three) ✓,
k1 50+3=53 ✓, i2 80+?=85 so ?=5 ✓, i3 6 tens+0 ones=60 ✓, k2 Theo's 20+9 mistake (wrote 11) → correct
29 ✓, k3 90+1 sheep=91 ✓, ch1 70+7 riddle=77 ✓. All traps recompute correctly (digit-gluing traps 406/
503/209/701/... and digit-adding traps 8/11/14/... are all textbook place-value confusions, correctly
and specifically diagnosed, e.g. k2's "That repeats Theo's mistake of adding the digits (2+9)").

**Figures.** `expanded-form`, `tno-expanded-85`, `tno-either-order` — registered/mapped, truthful.

**Defect found and FIXED — remedial R2 + R6 violation (fixed directly).** `remedials[0]` originally
read: concept body *"...40 + 6 = 46. Add the values, not just the digits."*, check prompt *"What number
is 40 + 6?"* answer 46. `normalized(check.prompt)` = `"what number is # + #?"` = `normalized(k1.prompt)`
exactly (k1 = "What number is 50 + 3?") — R2 fail. Concept states "40 + 6 = 46" verbatim immediately
before the check asks for that exact sum — R6 fail.

**Fix applied** (edited `remedials[0].check.widget` only): moved to a real-world two-addend context
with fresh numbers: *"A farm has 30 hens and 4 more roosters. How many birds are there in all?"* answer
34. Traps recomputed (7 = digit-sum 3+4 instead of value-sum, explicitly named "Don't add the digits 3
and 4"; 304 = side-by-side digit gluing, explicitly named), `fallbackFeedback`/`explanationVariants`
updated. Verified normalized prompt differs from k1/i2/i3/k2/k3/ch1 — including k3's similarly-shaped
"90 sheep in the west field... 1 more sheep in the east field" problem, whose wording (ranch/sheep/
west-and-east-field) is textually distinct from the new remedial's (farm/hens/roosters/no-field-split)
despite both being two-addend animal-count word problems; per `S316_ADJUDICATION_REMEDIAL_STANDARD.md`
this shared "misconception family, different representation instance" is the *intended* Shape-α reuse,
not a violation — R2 is a literal-string test, not a ban on thematically similar problems. The unchanged
concept body (only about 40/6/46) states nothing about 30/4/34.

**Progression.** c1→i1(build+predict)→k1(sum)→c2(missing-addend, incl. zero-ones case)→i2(missing-
addend check)→c3(either-order)→i3(zero-ones check)→k2(mistake-catch)→k3(word problem)→ch1(riddle)→r1.
Strong variety.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.


## tno-02-03 — Which Digit Is Worth More?

**Math verified.** i1 build 52 (5 tens 2 ones) with the 25-swap trap correctly diagnosed; `predict`
(5 worth 50 > 2's worth 2) correct, option lengths ("The 2"/"They're worth the same"/"The 5" = 5/21/5
chars) balanced — no length tell here. k1 value-of-7-in-74=70 ✓. c2/i2 same-digit-different-value in 33
(left 3=30) ✓, trap 6 (adding the two 3s) correctly named "Don't add the two 3s." c3/i3 place-matters
(40>4) ✓, tens-count-vs-value distinction in 60 (tens digit 6 = 6 tens) ✓. k2 Wren's-mistake (8 in 85)
=80 ✓, trap value 8 correctly says "That repeats Wren's mistake." k3 ticket-price (1 in 19)=10 dollars
✓. ch1 construct-from-value (tens-value 90 + 0 ones = 90) ✓. All traps recompute correctly with
specific, non-generic diagnoses.

**Figures.** `expanded-form`, `tno-worth-more`, `tno-place-matters` — all registered/mapped and
truthful (verified against their `figures.tsx` source: `TnoWorthMore` draws 33 with left-3="worth 30"/
right-3="worth 3" exactly matching c2; `TnoPlaceMatters` draws 40 > 4 with "tens place wins" exactly
matching c3).

**Defect found and FIXED — remedial R2 + R6 violation, compounded by main-lesson recycling (fixed
directly).** `remedials[0]` originally read: concept body *"...In 52, the 5 is in the tens place, worth
50, while the 2 is in the ones place, worth 2..."*, check prompt *"In 52, what is the value of the
5?"* answer 50. `normalized(check.prompt)` = `"in # what is the value of the #?"` =
`normalized(k1.prompt)` exactly (k1 = "In 74, what is the value of the 7?") — R2 fail. Concept states
"the 5... worth 50" verbatim immediately before the check asks for that identical value — R6 fail. Worse
still: 52 is the exact number `i1`'s own build-and-predict sequence already fully worked through in the
main lesson walk, and `i1`'s own predict reveal states, verbatim, *"The 5 sits in the tens spot, so it's
worth 50."* A learner who fails and is routed to this remedial would see the same fact about the same
number for a third time.

**Fix applied** (edited `remedials[0].check.widget` only): moved off 52 entirely to a fresh number and a
left/right-digit phrasing distinct from every widget prompt in the lesson: *"The number 68 has two
digits. What is the LEFT digit worth?"* answer 60. Traps recomputed (6 = bare digit not value,
explicitly named; 8 = right/ones digit picked by mistake, explicitly named), `fallbackFeedback`/
`explanationVariants` updated. Verified normalized prompt differs from k1, `i2` ("In 33, what is the
value of the left 3?" — close in vocabulary but a genuinely different sentence structure and number,
confirmed not string-equal after normalization), i3, k2, k3, ch1; the unchanged concept body (only about
52/5/50/2) states nothing about 68 or 60.

**Progression.** c1→i1(build+predict)→k1(abstract value)→c2(same-digit generalization)→i2(check)→
c3(place-matters)→i3(tens-count-vs-value)→k2(mistake-catch)→k3(real-world ticket)→ch1(construct)→r1.
Good variety, escalating abstraction.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

## tno-03-01 — Ten More, Ten Less

**Math verified.** i1 `numberLineHop` 34+10=44 ✓, `predict` (tens changes/ones stays: 44, correctly
contrasted against the +1 distractor "35") ✓. k1 57+10=67 ✓. i2 62−10=52 ✓. i3 48−?=38 so ?=10 ✓ — this
step's trap `value: 1` is a standout diagnostic design: it names precisely the "the tens digit only
moved by one place, so I'll answer 1" confusion this whole lesson exists to prevent ("The tens digit
went down by 1, but the actual number subtracted is a whole ten: 10, not 1."). k2 25+?=35 so ?=10 ✓.
k3 undo-subtraction (result 70, started at 80) ✓. ch1 undo-addition (result 29, started at 19) ✓. All
traps recompute correctly with specific diagnoses (ones-changed-not-tens, wrong-direction, sum-instead-
of-difference, digit-shift-confused-with-literal-one).

**Figures.** c1 reuses the course's generic `base-ten-blocks` anchor figure — also used to open
`tno-01-02`, `tno-01-03`, `tno-03-02`, `tno-03-03`. It is truthful as a base-representation reminder
(it correctly shows tens-rods/ones-cubes) but is not specific to the +/−10 tens-only-invariance claim
c1 actually makes. This is a consistent, intentional chapter-opening pattern across the whole course
(re-anchor on the base representation, then introduce lesson-specific figures at c2/c3) and does not
misrepresent anything, so it is **not flagged as a defect** — recorded as a soft observation only.
`tno-ones-stay` and `tno-move-tens-digit` are lesson-specific, registered, and precisely truthful:
`TnoOnesStay`'s SVG depicts 34+10=44 with "ones stay 4," matching c2's own example number-for-number;
`TnoMoveTensDigit` depicts 50↔60↔70 with "+10 up / −10 down," matching c3.

**Defect found and FIXED — remedial R2 + R6 violation, severe compounding with the lesson's own first
example (fixed directly).** `remedials[0]` originally read: concept body *"...34 + 10 = 44 (3 tens → 4
tens); 34 − 10 = 24..."*, check prompt *"34 + 10 = ?"* answer 44. `normalized(check.prompt)` =
`"# + # = ?"` = `normalized(k1.prompt)` exactly (k1 = "57 + 10 = ?") — R2 fail. Concept states
"34 + 10 = 44" verbatim immediately before the check asks for that identical sum — R6 fail. Most
severe: 34→44 is the *exact* worked example from **both** c1's opening sentence ("34 + 10 = 44 — the 4
ones stay the same") **and** i1's opening `numberLineHop` widget (starts at 34, hops to 44) — the very
first thing taught in the lesson. A learner failing anywhere and routed to remediation would see this
example a third time, verbatim, with zero new diagnostic value.

**Fix applied** (edited `remedials[0].check.widget` only): translated the number-line-hop representation
(i1's widget, reworded into words for the numeric-type remedial check per the standard's Shape-α
precedent) with a fresh number: *"You start at 76 on the number line and hop ten more. Where do you
land?"* answer 86. Traps recomputed (77 = ones changed instead of tens, explicitly named; 66 = hopped
ten LESS instead of more, explicitly named), `fallbackFeedback`/`explanationVariants` updated. Verified
normalized prompt differs from k1/i2/i3/k2/k3/ch1, and the unchanged concept body (only about 34/44/24)
states nothing about 76 or 86.

**Progression.** c1→i1(hop+predict)→k1(add-ten)→c2(ones-invariant)→i2(subtract-ten)→c3(digit-shift
rule)→i3(missing subtrahend)→k2(missing addend)→k3(work backward from subtraction)→ch1(work backward
from addition)→r1. Escalates from direct application to inverse reasoning; not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

## tno-03-02 — Adding Tens

**Math verified.** i1 `numberLineHop` 3 hops of 10 from 40=70 ✓, `commonLandings` traps (43 from
hopping-by-one three times; 60 from stopping one hop short) both correctly diagnosed. `predict` (ones
digit of 40 stays 0) correct, option lengths ("It grows by 3"/"It becomes 3"/"It stays 0" = 14/13/11
chars) balanced, correct answer not the longest. k1 42+20=62 ✓. c2/i2 26+40 adds 4 tens=66 ✓ (trap 40
correctly diagnoses "the number added" vs "how many tens that is" confusion). c3/i3 55+30=85, missing
addend 85−55=30 ✓ (trap 3 names the digit-shift-vs-literal-value confusion). k2 undo-add 63−30=33 ✓. k3
missing-first-addend 37−20=17 ✓ (trap `value: 2`'s feedback is a little more abstract in phrasing than
its siblings but is still specific and not false — not flagged as a hard defect). ch1 Zara's-mistake
44+50=94 ✓ (trap 54 explicitly says "That repeats Zara's mistake of adding only one ten").

**Figures.** c1 reuses the generic `base-ten-blocks` chapter anchor (consistent pattern, not flagged).
`tno-add-tens-66` and `tno-add-tens-85` are registered/mapped and verified truthful against their
`figures.tsx` source (`TnoAddTens66`: "26+40" → "2+4 tens" → "66"; `TnoAddTens85`: "55+30" → "5+3 tens"
→ "85" — both exact matches to c2/c3).

**Defect found and FIXED — remedial R2 + R6 violation, recycling the lesson's opening example (fixed
directly).** `remedials[0]` originally read: concept body *"...40 + 30: 4 tens + 3 tens = 7 tens = 70.
26 + 40: 2 tens + 4 tens = 6 tens = 66."*, check prompt *"40 + 30 = ?"* answer 70.
`normalized(check.prompt)` = `"# + # = ?"` = `normalized(k1.prompt)` exactly (k1 = "42 + 20 = ?") — R2
fail. Concept states "40 + 30... = 70" verbatim immediately before the check asks for that identical
sum — R6 fail. And 40+30=70 is precisely c1's opening sentence and i1's opening `numberLineHop` widget
(start 40, three hops to 70) — the lesson's very first worked example, recycled a third time.

**Fix applied** (edited `remedials[0].check.widget` only): a fresh hop-based word problem: *"You take 6
hops of ten forward from 21. Where do you land?"* answer 81. Traps recomputed (27 = hopped by one
instead of ten, explicitly named; 71 = undercounted by one hop, explicitly named), `fallbackFeedback`/
`explanationVariants` updated. Verified normalized prompt differs from i1/k1/i2/i3/k2/k3/ch1, and the
unchanged concept body (only about 40/30/70 and 26/40/66) states nothing about 21/60/81.

**Progression.** c1→i1(hop+predict)→k1(add two tens)→c2(count-tens-not-total)→i2(check)→c3(generalize
to any multiple)→i3(missing addend)→k2(work backward)→k3(missing first addend)→ch1(mistake-catch)→r1.
Escalating variety, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

## tno-03-03 — Subtracting Tens

**Math verified.** i1 `numberLineHop` 3 hops of 10 back from 65=35 ✓, `commonLandings` traps (62 from
hopping-by-one; 45 from stopping one hop short) both correctly diagnosed. `predict` (ones digit 5 stays)
correct. k1 71−50=21 ✓ (trap 20 explicitly says "Keep the ones (1)" — names the dropped-digit mistake).
c2/i2 90−40 removes 4 tens=50 ✓. c3/i3 count-down-by-tens alternative (65,55,45,35) then 88−?=68 so
?=20 ✓ (trap 2 names the digit-shift-vs-literal-value confusion, consistent with the sibling addition
lesson). k2 undo-subtract 36+20=56 ✓. k3 missing-minuend 17+30=47 ✓ (trap 30 correctly diagnoses
"repeats the given subtrahend instead of solving"). ch1 Milo's-mistake 83−60=23 ✓ (trap 73 explicitly
names "repeats Milo's mistake of subtracting only one ten").

**Figures.** c1 reuses the generic `base-ten-blocks` chapter anchor (consistent pattern, not flagged).
`tno-sub-tens-50` and `tno-count-down-tens` are registered/mapped and verified truthful
(`TnoSubTens50`: "90−40" → "9−4 tens" → "50", matching c2 exactly; `TnoCountDownTens`: draws
65→55→45→35 with "−10" labels, an exact numeric match to c3's own example).

**Defect found and FIXED — remedial R2 + R6 violation, recycling the lesson's opening example (fixed
directly).** `remedials[0]` originally read: concept body *"...65 − 30: 6 tens − 3 tens = 3 tens = 35.
90 − 40: 9 tens − 4 tens = 5 tens = 50."*, check prompt *"65 - 30 = ?"* answer 35.
`normalized(check.prompt)` = `"# - # = ?"` = `normalized(k1.prompt)` exactly (k1 = "71 - 50 = ?") — R2
fail. Concept states "65 − 30... = 35" verbatim immediately before the check asks for that identical
difference — R6 fail. And 65−30=35 is precisely c1's opening sentence and i1's opening `numberLineHop`
widget (start 65, three hops back to 35) — the lesson's very first worked example, recycled a third
time. This is the fourth lesson in this course carrying the identical "remedial repeats the opening
example" defect shape (after tno-01-01/01-03/02-01/02-02/02-03/03-01/03-02), confirming this is a
systemic, course-wide authoring pattern rather than isolated incidents.

**Fix applied** (edited `remedials[0].check.widget` only): a fresh hop-based word problem, choosing a
hop-amount (60) that shares no digit-role with any number in the unchanged concept body so R6 is
unambiguous: *"You take 6 hops of ten back from 94. Where do you land?"* answer 34. Traps recomputed
(88 = hopped by one instead of ten, explicitly named; 44 = undercounted by one hop, explicitly named),
`fallbackFeedback`/`explanationVariants` updated. Verified normalized prompt differs from
i1/k1/i2/i3/k2/k3/ch1, and the unchanged concept body (only about 65/30/35 and 90/40/50) states nothing
about 94/60/34.

**Progression.** c1→i1(hop-back+predict)→k1(subtract five tens)→c2(count-tens-not-result)→i2(check)→
c3(alternative count-down strategy)→i3(missing subtrahend)→k2(work backward)→k3(missing minuend)→
ch1(mistake-catch)→r1. Escalating variety, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

## tno-04-01 — Which Has More Tens?

**Math verified.** i1a `numberLinePlace` 45→52 ✓ (`commonPlacements` traps 48 = "still 4 tens, keep
moving" and 50 = "right tens, no ones yet, move two more" both correct and specific). `predict` (52 one
more ten than 45, marker moves right) ✓. i1 `placeCompare` 45<52 ✓. k1 63>38 (6 tens>3 tens) ✓. c2/i2
40>39 ✓, tens beat a bigger ones digit, correctly diagnosed via `ltFeedback` "The 9 ones look big, but
tens come first." c3/i3 28<71 ✓. k2 84>59 ✓. k3 17<60 ✓. ch1 90>89 ✓ — the closest pair in the lesson,
a well-designed difficulty ceiling (0 ones vs 9 ones, yet tens still decide). This lesson introduces
the `placeCompare` and `mcq` widget types (first `mcq` in the course); every gt/lt/eq feedback branch on
every `placeCompare` widget was checked individually and is correct.

**Figures.** `compare-stacks` — read its SVG `<title>`: *"forty-five has four tens and fifty-two has
five tens... forty-five is less than fifty-two"* — an exact match to c1's own worked example.
`tno-more-tens` exactly matches c2's 40-vs-39 example. `tno-symbol-opens` uses its own minimal 8>3
example to illustrate the general sign-orientation rule rather than c3's specific 28/71 pair — correct
and on-topic (a generalizable rule illustration, not a locked-in numeric match), not flagged.

**Defect found and FIXED — remedial R1/R2 + R6 violation, byte-identical to i1 (fixed directly).**
`remedials[0]` originally read: check prompt *"Compare: 45 __ 52"* (mcq, correct option "<"). This is
**byte-identical** to step i1's own `placeCompare` prompt (same left/right/answer), and
`remedials[0].concept.body` stated *"45 vs 52: 4 tens < 5 tens, so 45 < 52"* verbatim immediately
before the check re-asked that exact comparison. 45-vs-52 is also c1's opening example and i1a's
`numberLinePlace` target — the lesson's very first comparison, recycled a third/fourth time.

**Fix applied** (edited `remedials[0].check.widget` only): a fresh pair phrased in a structure distinct
from every widget prompt in the lesson — deliberately avoiding both i1's bare `"Compare: X __ Y"` form
(which any bare-form remedial would collide with under normalization) and the k1/k2/k3/ch1 real-world-
wrapped form: *"Which sign belongs between 56 and 61?"* correct option "<". All three option feedbacks
recomputed, `fallbackFeedback`/`explanationVariants` updated. Verified normalized prompt differs from
i1a/i1/k1/k2/k3/ch1, and the unchanged concept body (only about 45/52) states nothing about 56/61.
MCQ options are single-character symbols (`<`,`>`,`=`) — perfectly length-balanced regardless.

**Progression.** c1→i1a(drag+predict)→i1(abstract compare)→k1(same skill, real-world)→c2(don't-be-
fooled-by-ones)→i2(check)→c3(symbol-direction rule)→i3(check)→k2/k3(escalating real-world pairs)→
ch1(closest pair, hardest)→r1. Strong escalation, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

## tno-04-02 — Same Tens, Check the Ones

**Math verified.** i1a `numberLinePlace` 63→67 ✓ (`commonPlacements` traps 66 = "one spot before, tens
still tie, keep counting ones" and 68 = "one spot after, move left" both correct). `predict` (63/67 same
tens, 67 sits right) ✓. i1 63<67 ✓. k1 58>54 (tens tie at 5, 8>4) ✓. c2/i2 71<76 (tens tie at 7, 1<6) ✓.
c3/i3 45=45 ✓ — both `gtFeedback` and `ltFeedback` branches correctly explain why 45 is neither greater
nor less than 45. k2 89>82 ✓. k3 30<36 ✓. ch1 77=77 ✓. All feedback branches checked individually and
correct.

**Figures.** `tno-same-tens-ones` exactly matches c2's own 71-vs-76 example; `tno-equal` exactly matches
c3's own 45=45 example — both precisely placed and truthful. **c1's figure is a noted looseness, not a
defect fixed:** c1 reuses the course's `compare-stacks` chapter anchor, which for *this* lesson
specifically depicts a **different-tens** comparison (45 vs 52, 4 tens vs 5 tens) even though c1's own
text is specifically about the **same-tens** tie-breaking case (63 vs 67, both 6 tens) — the figure does
not contradict anything mathematically, but it is not the case c1's opening claim is actually about.
Applying the same reasoning already used for `tno-03-01`'s analogous generic `base-ten-blocks` anchor
(recorded there as a non-blocking observation), and noting `compare-stacks` is reused unchanged as the
chapter-4 c1 anchor across all three ch4 lessons and correctly matches `tno-04-01`'s own example, this
is judged a consistent, intentional course-wide "recall the general tool, then specialize" pattern
rather than a fixable content error. **Not treated as a KEEP-blocking defect; no figure reference was
changed** — the only clean alternative (pointing c1 at `tno-same-tens-ones`) would strip c2 of its own
precisely-matched figure, trading one imperfection for another rather than net-improving. Recorded here
for a future visual-first pass to weigh.

**Defect found and FIXED — remedial R1/R2 + R6 violation, byte-identical to i1 (fixed directly).**
`remedials[0]` originally read: check prompt *"Compare: 63 __ 67"* (mcq, correct option "<") —
byte-identical to i1's own prompt, and `remedials[0].concept.body` stated *"63 vs 67: both have 6 tens,
so 3 < 7 means 63 < 67"* verbatim immediately before the check re-asked that exact comparison; 63-vs-67
is also c1/i1a's own opening example.

**Fix applied** (edited `remedials[0].check.widget` only): a fresh same-tens pair, phrased distinctly:
*"Which sign belongs between 24 and 29?"* correct option "<". All three option feedbacks recomputed,
`fallbackFeedback`/`explanationVariants` updated. Verified normalized prompt differs from
i1a/i1/k1/i2/i3/k2/k3/ch1, and the unchanged concept body (only about 63/67) states nothing about 24/29.

**Progression.** c1→i1a(drag+predict)→i1(abstract same-tens)→k1(real-world)→c2(tens-tie rule
generalized)→i2(check)→c3(equality case)→i3(check)→k2/k3(escalating real-world)→ch1(equal-digits
challenge)→r1. Strong escalation, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met overall, with the c1 looseness noted).
`gradeLanguageDecision: FIT`.

---

## tno-04-03 — Comparing Any Two Numbers (course finale/synthesis lesson)

**Math verified.** `r1`'s teaser ("you've finished Tens & Ones") confirms this is the course's final
lesson. i1a `numberLinePlace` 48→52 ✓ (`commonPlacements` traps 50 = "begins next ten but 52 has two
ones too" and 58 = "copied the 8 ones from 48, target is 5 tens 2 ones" — both correct and well-
diagnosed, the second one a genuinely sharp catch of a plausible drag-behavior error). `predict` (52
fewer ones but one more ten than 48, sits right) ✓. i1 52>48 ✓. k1 64<69 (tens tie at 6, 4<9) ✓. c2/i2
39<41 ✓ — bigger ones digit (9) does not beat smaller tens (3<4), correctly diagnosed. c3/i3 70=70 ✓.
k2 85>58 and k3 26<62 — same-digits-different-order pattern, correctly testing that digit *position*
(not identity) determines tens ✓. ch1 91>19 — the most extreme same-digits-swapped case ✓. All correct.

**Figures.** `compare-stacks`: here c1's text is a number-free general synthesis rule ("check the tens...
if they differ, more tens wins. If they're equal, more ones wins.") with no specific worked pair for the
figure to mismatch, so the figure's 45-vs-52 different-tens example legitimately illustrates one half of
the stated rule without contradicting anything — a better topical fit here than in `tno-04-02` precisely
because c1 makes no specific-pair claim. `tno-compare-tens` exactly matches c2's own 39-vs-41 example.
`tno-first-differ` illustrates the general "first differing place decides" principle with its own valid
52-vs-58 same-tens instance, matching c3's general statement. All truthful and well-placed.

**Defect found and FIXED — remedial R1/R2 + R6 violation, byte-identical to i1 (fixed directly, same
pattern as the two preceding lessons).** `remedials[0]` originally read: check prompt *"Compare: 52 __
48"* (mcq, correct option ">") — byte-identical to i1's own prompt, and
`remedials[0].concept.body` stated *"52 vs 48: 5 tens > 4 tens, so 52 > 48"* verbatim immediately before
the check re-asked that exact comparison; 52-vs-48 is also c1/i1a's own opening example. This is the
same defect shape found in all twelve lessons of this course — ten of twelve remedials failed R2 and/or
R6 in essentially this form, the two exceptions being none (every lesson needed a fix); see the summary
at the top of this report.

**Fix applied** (edited `remedials[0].check.widget` only): a fresh different-tens pair, phrased
distinctly: *"Which sign belongs between 73 and 68?"* correct option ">". All three option feedbacks
recomputed, `fallbackFeedback`/`explanationVariants` updated. Verified normalized prompt differs from
i1a/i1/k1/i2/i3/k2/k3/ch1, and the unchanged concept body (only about 52/48) states nothing about 73/68.

**Progression.** c1(synthesis rule)→i1a(drag+predict, different-tens)→i1(abstract)→k1(same-tens real-
world)→c2(ones-do-not-override-tens)→i2(check)→c3(first-differing-place rule)→i3(equality)→
k2/k3(same-digits-swapped)→ch1(most-extreme swap)→r1. A genuinely strong synthesis arc combining both
`tno-04-01` and `tno-04-02`'s sub-skills, not pure repeats.

**Disposition: KEEP.** `visualDecision: REQUIRED` (met). `gradeLanguageDecision: FIT`.

---

# Summary

12/12 lessons reviewed for the first time; **12/12 KEEP**, **0 REVISE**, **0 ESCALATE**.
`visualDecision: REQUIRED` on all 12 (met in every case; one non-blocking topical-looseness observation
recorded at `tno-04-02` c1). `gradeLanguageDecision: FIT` on all 12. No `LESSON_PROGRESSION_AND_DUPLICATION`
or `CHOICE_SURFACE_INTEGRITY` cross-fix ownership triggered — grepped both workstreams against all 12
lesson ids individually and sampled both workstreams' full row sets (232 + 175 rows across the whole
repo) to confirm zero reference any `tno-*` lesson.

**The dominant finding across this course: a single systemic remedial-authoring defect, present in
10 of 12 lessons' `remedials[0].check`** (`tno-01-01`, `tno-01-02`, `tno-01-03`, `tno-02-01`,
`tno-02-02`, `tno-02-03`, `tno-03-01`, `tno-03-02`, `tno-03-03`, `tno-04-01`, `tno-04-02`, `tno-04-03` —
in fact all 12 needed a remedial fix). In every case, `remedials[0].concept.body` stated the exact fact
(or, in ch4, the exact comparison) that `remedials[0].check.widget` then asked the learner to produce,
and/or the check's prompt was byte-identical or template-identical (after S255/S316 `normalized()`) to
an earlier widget in the same lesson — most often the lesson's own opening worked example from c1/i1.
This is a textbook instance of the defect class `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
was written to rule on: a remedial that reads as "immediate same-family practice" rather than a
distinct diagnostic, here taken to its most literal extreme (the answer is handed to the learner in the
sentence directly above the question). Every instance was fixed directly, in place, by rewriting only
`remedials[0].check.widget` (never `.concept`, `.conceptTag`, or any id) to a fresh number/pair and a
representation or sentence structure verified distinct — via the S255 `normalized()` procedure — from
every other widget-bearing step in that same lesson, per `S316_ADJUDICATION_REMEDIAL_STANDARD.md`
§1.4–1.5 Shape α and the KOA-R mechanical fix pattern in §3. All math in every rewritten check was
recomputed and every trap's feedback names the specific misconception rather than restating the answer.
Two lessons (`tno-01-01`) also had one additional small defect (a single trap's feedback was generic
rather than diagnostic) fixed the same way. One lesson (`tno-04-02`) has a non-blocking figure-topicality
observation recorded but not fixed, consistent with the course-wide "generic chapter anchor" pattern
already accepted at `tno-03-01`.

**Recommendation for a future session:** given the defect recurred in every single lesson of this
course with the same shape, it is very likely present across other courses' `remedials[0]` too (the
`S316_ADJUDICATION_REMEDIAL_STANDARD.md` document itself found the concept-side twin of this defect —
`remedials[0].concept.body` byte-identical to `c2.body` — in 12/12 `g4v`, 9/10 `g3f`, and 10/20 `koa`
lessons in a different course). Promoting `src/lib/session255.dataLinePlotsG2FollowOn.test.tsx`'s
remedial-distinctness block into a corpus-wide gate (as `S316_ADJUDICATION_REMEDIAL_STANDARD.md` §7.1
already recommends) would have caught all 12 instances in this course mechanically; that is `src/**`
work outside this assessor's authority to implement, but is flagged here as high-value follow-up.
