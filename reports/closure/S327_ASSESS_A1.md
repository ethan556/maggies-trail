# S327 Assessor A1 — place-value-1000, full portfolio review (first-ever)

Reviewer: cowork-s327-A1-assessor. Scope: all 12 lessons of course `place-value-1000`
(`pv1000-01-01` … `pv1000-04-03`), first-ever full disposition. Working tree has extensive
uncommitted signed work from other lanes; nothing outside `content/courses/place-value-1000/`
was touched. Standard applied to remedials: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(R1–R6 always binding; R7–R9 conditional on a signed visual/text rationale, which none of my
findings were, and this course does not use a `narration` field at all — confirmed by
`grep -c '"narration"' content/courses/place-value-1000/lessons/*.json` → 0 across all 12 files).

## Cross-check performed once, up front

`grep -iE "PROGRESSION|CHOICE" PREMIUM_PENDING_WORKLOAD_QUEUE.csv | grep -i pv1000` → **no rows**.
The only pv1000 rows in the queue are the generic `VISUAL-DISPOSITION-*`, `LANGUAGE-*`, and
`LESSON-*` placeholder rows (36 = 12 × 3) that this very review closes — there is no
`LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row naming a specific pv1000
lesson, so step 2 of my brief (exclusive-ownership cross-fix) yields nothing beyond what I found
independently during the portfolio read itself.

## Pinned contracts discovered and respected (binding on every lesson below)

Read before touching any file, because both are gates a content edit could silently break with no
way for me to observe it (no vitest allowed in this container):

1. **`src/lib/session301.placeValue1000PredictionOrder.test.ts`** pins, per lesson, the exact
   SHA-256 hash of `predict.options` (id+label, sorted) and `predict.reveal`, plus the exact
   `outcomeId` and the exact index (alternating 1,2,1,2… across the 12 lessons in course order) of
   the correct option within the options array. **Consequence: I never edited any `predict` block's
   `options`, `outcomeId`, or `reveal` in any lesson.**
2. **`src/lib/session273.placeValue1000Course.test.ts`** pins (a) the exact step-ID sequence
   `["c1","i1","k1","c2","i2","c3","i3","k2","k3","ch1","r1"]` for `pv1000-02-01`, `pv1000-04-02`,
   `pv1000-04-03`; (b) the exact widget-`type` sequence across steps+remedial-checks for those same
   three lessons; and (c) three **deliberately withheld** figures — `pv1000-02-01:c1` (body must
   contain `"320, 330, 340, 350"`, figure must stay `undefined`), `pv1000-04-02:c1` (body must
   contain `"486 − 253"`, figure `undefined`), `pv1000-04-03:c2` (body must contain
   `"247 + 186 = 433"`, figure `undefined`). This is a **prior, correct, already-tested ESCALATE
   resolved as fail-closed-to-text**: a earlier reviewer determined no registered figure correctly
   depicts these three specific numeric illustrations and pinned the text-only body instead of a
   wrong figure. **Consequence: I never added a figure or changed the body's pinned substring at
   those three step IDs**, and I treat their per-lesson `visualDecision` accordingly (see each
   lesson below).

## Per-lesson evidence

### pv1000-01-01 — "Hundreds Join the Party"

**decision: KEEP** (found 2 defects, fixed both) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

Steps: c1(concept,fig)→i1(placeValue interactive+predict)→k1(check)→c2(concept,fig)→i2(check)→
c3(concept,fig)→i3(check)→k2(check)→k3(check)→ch1(challenge)→r1(recap). 2 remedials
(`pv1000-digit-worth`, `pv1000-build-number`).

**Math verified by hand, every widget:**
- i1 `placeValue` target 342; predict asks which control (h/t/o) moves the number most per click,
  correct outcome `h` — 1 click of hundreds=+100 > 1 click of tens=+10 > 1 click of ones=+1. Correct.
- k1: `In the number 427, what is the 4 worth?` → 400 (4 in hundreds spot). Correct. Traps: `4`
  (names digit not value — real misconception), `40` (one column too low — real misconception).
  Both feedbacks literally true, neither equals the answer or each other.
- i2: `In 640, what is value of 4?` → 40 (tens spot). Correct. Traps `4`, `400` — both diagnose real
  place-confusion errors, correctly computed.
- i3: `4 hundreds, 0 tens, 9 ones` → 409. Correct. Traps `49` (skips placeholder zero), `4009`
  (four digits) — both real, both true.
- k2: `2 ones, 3 hundreds, 5 tens` → 352 (300+50+2). Correct. Traps `235` (uses listed order
  2,3,5 instead of place order — real), `10` (sums the counts 2+3+5 instead of building — real).
- k3: `6 hundreds, 1 ten, 9 ones`, value of ones digit → 9. Correct. Traps `90` (confuses with a 9
  in tens), `16` (sums all three digits 6+1+9) — both real, both true.
- ch1: Milo has `6 hundreds, 0 tens, 8 ones` but wrote `68` (skipped the zero); correct = 608.
  Traps `68` (repeats Milo's own error), `680` (wrong digit order) — both real, both true.

**Defect 1 (found, fixed) — remedial `rem-pdw` (digit-worth), R6 + R1/R2 violation.**
Before: `concept.body` = *"A digit's worth depends on its spot: hundreds, tens, or ones. In 582,
the 8 sits in the tens spot, so it's worth 8 tens = 80."* immediately followed by `check.widget`
= *"In the number 582, what is the 8 worth?"* answer `80` — **the concept states the check's exact
answer using the identical number**, and `normalize(check.prompt)` = `normalize(k1.prompt)` =
`"in the number #, what is the # worth?"` (verified with a normalize() implementing the S255/S316
regex `[-−+]?\d+(?:[.,/]\d+)*→#`, run via node one-off against every widget-bearing step). Confirmed
programmatically — see `checklesson.mjs` output, `COLLISION with k1: normColl=true`.
Fix (Shape α, S316 §1.5): concept rewritten to state the general rule with **no specific digit/spot
pair at all** (`"A digit's worth depends only on its spot, not on the digit next to it. The SAME
digit is worth a completely different amount in the hundreds spot than in the tens spot or the
ones spot."`) so R6 cannot fire regardless of what number the check later uses; check rewritten to a
`"A 6 is placed in the tens spot of a 3-digit number. What is that 6 worth?"` frame (answer 60,
traps 6/600 recomputed and re-verified true). Re-ran the collision scan post-edit: zero collisions
against i1/k1/i2/i3/k2/k3/ch1.
R4 check: only `k1` declares a step-level `variant` (`g2-place-value-1000`/`Pv1000DigitWorthNumeric`).
Read the generator at `src/lib/g2Variants.ts:81`: template is
`` `In ${n}, what is the value of the ${digit} in the ${place} place?` `` — structurally distinct
opening from the new remedial's `"A ${digit} is placed in the ${place} spot..."`; cannot regenerate
it. R4 satisfied.

**Defect 2 (found, fixed) — remedial `rem-pbn` (build-number), R1/R2/R3 violation (byte-identical repeat).**
Before: `check.widget.prompt` = `"What number has 4 hundreds, 0 tens, and 9 ones?"` answer `409` —
**byte-identical** to step `i3`'s prompt and answer, which sits earlier in the very same lesson
(`c3→i3→...→k2`, and the remedial fires off `k2`'s conceptTag). `concept.body` also restated the
identical `4/0/9 = 409` triple. Confirmed via `JSON.stringify` equality in `checklesson.mjs`.
Fix (Shape α): concept generalized (no numeric triple); check moved to a place-value-card context —
`"A stack of place-value cards shows 6 hundred-cards, 0 ten-cards, and 3 one-cards. What number do
the cards make?"` answer 603 (6·100+0·10+3=603, verified), traps `63` (skips the empty ten-cards
spot — mirrors the original misconception with the new numbers) and `6003` (four digits) recomputed
and re-verified true. Normalized-string diff confirms no collision with i3's `"what number has #
hundreds, # tens, and # ones?"` or k2's `"a number has # ones, # hundreds, and # tens. what number
is it?"` or ch1's Milo template. Neither k2 nor ch1 (the two steps sharing this conceptTag) declares
a `variant`, so R4 is non-binding here (no generator to collide with) — confirmed by reading the
full step JSON.

**Figures:** `hundred-tens-ones` (c1), `pv1000-placeholder-507` (c2), `pv1000-build` (c3) — all three
`grep`-confirmed present in `FIGURE_IDS` (`src/components/figureIds.ts`). Read each component in
`src/components/figures.tsx`: `Pv1000Placeholder507` renders `507` split into 5-hundreds/0-tens/
7-ones, matching c2's body verbatim (same number, same fact) — correct and intentionally aligned,
and does not leak into any check (the next check, i2, is about 640, not 507). `HundredTensOnes`
and `Pv1000Build` render generic worked examples (324 and 334 respectively) that appear nowhere in
c1's or c3's body text and don't match any adjacent check's numbers — safe, generic, correct
illustrations of the concept, no leak.

**MCQ/predict balance:** no scored `mcq` widget in this lesson. `i1.predict` options
Tens(4 chars)/Hundreds(8)/Ones(4), correct=Hundreds (the long one). Noted, not fixed: (a) a predict
step, not a scored check — reveal teaches regardless of the guess; (b) length asymmetry is intrinsic
to the vocabulary (these are UI-control names, not paraphrasable distractors); (c) **pinned** by
`session301` (exact hash of options/outcomeId/reveal) — edited it would break that gate, which is
outside this review's file scope. Left as residual debt, not a blocking defect.

**Progression:** digit-worth intro → practice → placeholder-zero wrinkle → digit-worth-with-zero →
build-from-parts intro → practice → build-with-scrambled-order (harder job) →
digit-worth-via-verbal-description (different representation) → challenge combining both skills.
No stale repeats; each step has a distinct job.

**Language:** read end-to-end; clear, concrete, grade-appropriate, no jargon beyond the lesson's own
defined vocabulary (hundreds/tens/ones/"spot").

`reviewBasisHash` (post-fix): `059049b035056f54c7c18abafb21d720d6f52c9d8ca7c1b045727babe199a5bd`

### pv1000-01-02 — "Trading Up and Down"

**decision: KEEP** (found 2 defects, fixed both) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

Same defect class as pv1000-01-01, present again in both remedials — this course's remedials appear
to have been mechanically authored from the associated main check, not independently designed.

**Math verified, every widget:** i1 `baseTenCompose` target 230, `requireStandard:false` correctly
accepts both Maya's 2 flats+3 rods and Leo's 1 flat+13 rods (both =230); predict resolves `same`
correctly; commonBuilds traps 233/203 both recomputed true. k1: 7h2t5o=725, traps 14 (digit-sum)
and 527 (full digit-reversal, matches the generator's own `100·o+10·t+h` trap formula) both correct.
i2: In 999 the left-most 9=900, traps 9/90 correct. i3: 0h8t3o=83, traps 803/11 correct. k2: In 726
the 2=20, traps 2/200 correct. k3: 5h9t1o=591, traps 15 (digit-sum) and 519 (adjacent tens/ones
transposition — real, verified ≠591) correct. ch1: Nina 8h0t6o=806 vs her skip-zero 86; traps 86/860
correct.

**Defect 1 (found, fixed) — remedial `rem-ptr` (trading), R1/R4/R6 — this one BYTE-IDENTICAL.**
`check.widget.prompt` was **literally** `"What number has 7 hundreds, 2 tens, and 5 ones?"` — the
exact same string as `k1`'s prompt, not just normalized-equal — and `concept.body` stated the same
`7/2/5=725` triple immediately before it. Worse: **both `k1` and `k3` declare
`variant: Pv1000TradingNumeric`**, which delegates to `Pv1000BuildNumberNumeric` in
`src/lib/g2Variants.ts`, whose template `` `What number has ${h} hundred(s), ${t} ten(s), and ${o}
one(s)?` `` is *exactly* the authored `k1` prompt's own template — so unlike `pv1000-01-01`'s case,
here the byte-identical remedial was reproducible by the real generator with certainty on every
replay walk, not merely by coincidence on the first. Fix: concept generalized to the ordering rule
with no numeric example; check moved to a "ranger counting mile-markers" context — `"A ranger
counted 4 hundred-mile markers, 6 ten-mile markers, and 8 one-mile markers. How many miles is
that?"` (answer 468 = 4·100+6·10+8, traps 18=digit-sum and 864=full-reversal, both recomputed true).
Verified the new opening ("A ranger counted…") cannot be produced by `Pv1000BuildNumberNumeric`'s
template and doesn't collide with `i3`'s first-person-riddle template or `ch1`'s Nina-narrative
template.

**Defect 2 (found, fixed) — remedial `rem-ptr-dw` (digit-worth), R1/R2/R4/R6.** `concept.body`
stated `"In 350, the 3 sits in the hundreds spot, so it's worth 3 hundreds = 300"` immediately
before a check asking the identical question about the identical number 350; `normalize(check.
prompt)` collided exactly with `k2`'s (`"in the number #, what is the # worth?"`), and `k2` declares
`variant: Pv1000DigitWorthNumeric`. Fix: concept generalized (no digit/spot pair stated); check
rewritten to `"A number has a 5 in its hundreds spot. What is that 5 worth?"` (answer 500, traps
5/50 recomputed true) — distinct from `k2`'s template, from `i2`'s "left-most" phrasing, and from
the generator's `` `In ${n}, what is the value of the ${digit} in the ${place} place?` `` template.
Re-ran the collision/R6 scanner post-edit on the whole lesson: clean.

**Figures:** `hundred-tens-ones` (c1), `pv1000-ten-hundreds` (c2), `pv1000-same-value` (c3) — all
registered; read implementations — `Pv1000TenHundreds` ("10 hundreds → 1000, 3-digit stops at 999")
matches c2's body verbatim; `Pv1000SameValue` (generic "300+40+5=345") matches c3's generic body and
doesn't leak into `i3` (which asks about 83).

**Progression:** evaluated `k1`/`k3` both being "build-number-from-parts" checks under the same
conceptTag as a possible stale-repeat concern. Judged acceptable, not a defect: they're spaced
(`i2,c3,i3,k2` intervene), use different numbers, and `k3` primes `ch1`'s harder placeholder-zero
build challenge immediately after — retrieval-practice spacing, not an adjacent duplicate. Supplying
this as the fluency rationale my brief requires for a signed-off repeat.

**Noted, not fixed:** `i1.predict` option lengths (Maya=13, Leo=12, same=25 — correct is longest) —
same inherent-vocabulary / pinned-by-session301 / non-scored-forecast situation as `pv1000-01-01`.
`ch1`'s final hint states the literal answer (806), but hints are opt-in progressive disclosure the
learner must actively request — not an involuntary leak like a concept body.

`reviewBasisHash` (post-fix): `56653c6be9288a6c2810e6f596b7033c196c352190fb6b43ccb00d3bbb397f8b`

### pv1000-01-03 — "Any Number, Any Spot"

**decision: KEEP** (found 2 defects, fixed both) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

**Math verified, every widget:** i1 `baseTenCompose` target 641, `requireStandard:true`; traps
{4h,6t,1o}=461 and {6h,1t,4o}=614 both recomputed correct, both real block/spot-swap errors.
predict "which digit worth most in 641" resolves `six` correctly (600>40>1) — and its three option
labels are all exactly 5 characters, a clean example of balanced length with no outlier. k1: 2h6t8o
=268, traps 16/862 correct. i2: In 705 the 7=700, traps 7/70 correct. i3: 9h0t2o=902, traps 92/920
correct. k2: value of 8 in 384=80, traps 8/800 correct. k3: 1h4t7o=147, traps 12/741 correct. ch1:
In 606 (which has **two** 6s) the LEFT-MOST 6=600 — correctly disambiguated by explicit wording;
traps 6/60 correct.

**Defect 1 (found, fixed) — dangling forward-reference in feedback text, not a remedial issue.**
`i1`'s `successFeedback` read *"The 4 you'll be asked about is 4 rods: worth 40, not 4"* — a
promise that nothing in the lesson fulfills. Scanned every later prompt for any question about 641
or its digit 4: none exists (`k1`=268, `i2`=705, `k2`=384 — all unrelated numbers). Likely a leftover
from an earlier draft ordering. Fixed to a self-contained explanation that makes no false promise:
*"Each block matches its spot: flats for hundreds, rods for tens, cubes for ones."*

**Defect 2 (found, fixed) — the lesson's single remedial (`pv1000-mixed`, serving k1/k2/k3/ch1
collectively), R1/R2/R4.** `check.widget.prompt` was byte-identical to `k1`'s (`"What number has 2
hundreds, 6 tens, and 8 ones?"`, 268), and `k1` declares `variant: Pv1000MixedNumeric` (a 50/50 mix
of `Pv1000BuildNumberNumeric`/`Pv1000DigitWorthNumeric`) whose build-number branch is exactly this
template — R4 fails too. `concept.body` was already generic/number-free (R6 pre-clean). Fixed the
check to a "shopkeeper bundling dollar-stacks" context (answer 359 = 3·100+5·10+9, traps 17=digit-sum
and 953=full-reversal, both true), verified distinct from every widget-bearing step including `k3`'s
and `ch1`'s templates. Also caught and fixed a follow-on staleness bug: the remedial's
`explanationVariants` still said `"2 hundreds, 6 tens, 8 ones = 268"` after the prompt was rewritten
— found via a cross-lesson python consistency check I ran across all three fixed lessons so far
(confirmed every remedial's concept/explanationVariants/prompt/answer/fallbackFeedback now agree
internally, no orphaned old numbers anywhere in lessons 01-01..01-03).

**Figures:** `hundred-tens-ones` (c1), `pv1000-zero-spots` (c2), `pv1000-both-directions` (c3) — all
registered; both concept figures are generic worked examples (640; 482↔400+80+2) that don't collide
with any of this lesson's actual check numbers.

**Progression:** under the shared `pv1000-mixed` tag, k1(build)/k2(digit-worth)/k3(build)/
ch1(digit-worth-with-repeated-digit-disambiguation) alternates job type ABAB, with ch1 adding a
genuinely new wrinkle (which of two identical digits) as capstone — interleaved practice, not a
stale repeat.

`reviewBasisHash` (post-fix): `0a5e1c7d2ff3c322368b34f863e518602a0af98a02f1cbbe69d5fffb774829f2`

---

## Chapter 2: counting to 1000

### pv1000-02-01 — "Skip-Counting by Tens and Hundreds"

**decision: REVISE** (2 remedial defects fixed; 1 defect found but blocked by a pinned cross-file
contract, so not everything found was fixed) · **visualDecision: SUFFICIENT** · **gradeLanguageDecision: FIT**

This is one of the three lessons pinned by `session273` for exact step-ID/widget-type sequence and
a deliberately withheld figure: `c1` has no `figure` field and its body must contain the literal
substring `"320, 330, 340, 350"`. **Confirmed both hold after my edits** — I never touched `c1`. This
is a prior, correct, already-tested resolution (no registered figure fit; text-only was the right
call), not an open gap.

**Math verified, every widget:** i1 `numberLineHop` start=320,hop=10,hops=3,forward → lands 350,
matching c1's own narrative; traps 323/340 correct. predict "which digit moves" resolves `tens`
correctly, option lengths 14/18/18/14 (correct=14) well balanced. k1: 200→300→400→500 (+100), traps
410/401 correct. i2: 480→490→500 (tens 9→0 rollover, hundreds 4→5), traps 4100/590 correct. i3:
600,__,800,900 (fill the gap)→700, traps 1000/800 correct (nice subtle design: 800 catches
mistaking a given number for the answer). k2: 300,290,280,__ backward→270, traps 280/271 correct.
k3: start 300, three ×100 jumps→600, traps 303/330 correct. ch1: Divit's off-by-one vs correct
690+10=700, traps 691/790 correct.

**Fixed — both remedials, same S316 defect class as chapter 1.** `rem-pst` (skip-tens) was
byte-identical to `i2` (480,490,__→500) with concept pre-stating the exact fact — and worse, it
didn't even address its own conceptTag's real main checks (`k2`=backward count, `ch1`=catch-a-
mistake); it copied an unrelated forward-rollover step. Rewrote to an "elevator counting down
through a rollover" context (520,510,500,→490) that deliberately targets backward-through-rollover
— the hardest wrinkle under this tag, which no main step isolates on its own. `rem-psh`
(skip-hundreds) was byte-identical to `k1` (200,300,400,__→500), and `k1` declares
`variant: Pv1000SkipHundredsNumeric` whose template is exactly that authored string — R4 failure
with certainty. Rewrote to a "stadium building seats in blocks of 100" context (→600). Both
re-verified arithmetically, traps recomputed true, normalized-distinct from every main-step prompt
and from the relevant generator template.

**Found, NOT fixed — the reason for REVISE.** `i1.predict.reveal` states *"The hundreds only stir
when the tens wrap past 9, which is exactly what the next problem will do."* The actual next step,
`k1`, is a direct hundreds-only skip-count (200→300→400→500) where the tens digit is always 0 and
never wraps — the rollover phenomenon it promises doesn't appear until `i2`, two steps later. This
is the same class of dangling forward-reference I found and fixed directly in `pv1000-01-03`'s
`i1.successFeedback` — but here the field is `predict.reveal`, and
**`src/lib/session301.placeValue1000PredictionOrder.test.ts` pins this lesson's exact
`predict.reveal` SHA-256 hash** (along with `options`/`outcomeId`). Editing content-only would break
a gate I have no authority to re-pin (`src/**` is off-limits). Documented rather than silently
dropped — this is the concrete, precisely-described remainder that makes the disposition REVISE
rather than KEEP.

**Figures:** `pv1000-tens-rollover` (c2), `pv1000-skip-anywhere` (c3) registered and content-matched
(c2's figure states the 90+10=100 rollover analogy verbatim). **visualDecision=SUFFICIENT**: c1's
pinned text-only state is immediately followed by `i1`'s `numberLineHop` — an interactive widget
that visually re-enacts the exact 320→330→340→350 sequence c1 describes — so the concept doesn't
need its own static figure.

`reviewBasisHash` (post-fix): `0172c18387bd6d62da14a49fce4d28b1e9d157c64860de282c8727fb42d1f916`

### pv1000-02-02 — "Skip-Counting by Fives"

**decision: KEEP** (2 defects, both fixable, both fixed) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

**Math verified, every widget:** i1 `numberLineHop` 610→625 matches c1's own narrative; traps
613/620 correct. predict resolves `five` correctly, all three option labels exactly 1 char — no
leak. k1: 335→350, traps 346/355 correct. i2: 190→200 (tens AND ones both roll over, hundreds 1→2),
traps 1100/205 correct. i3: fill-gap 985,__,995,1000→990, traps 1005/995 correct. k2: 725→710
backward, traps 715/714 correct. k3: start 485, three +5 jumps→500, traps 488/515 correct. ch1:
Priya's +1 mistake vs correct 850, traps 846/945 correct.

**Defect 1 (found, fixed) — remedial, R2/R4/R6.** The single remedial (`pv1000-skip-fives`) had
`check.widget.prompt` normalize-colliding with `k1` (`k1` declares
`variant: Pv1000SkipFivesNumeric`, whose template is exactly this authored string's template — R4
certain-reproduction), and `concept.body` pre-stated `"620+5=625"` — precisely the check's final
arithmetic step and answer (R6). The remedial's numbers (610–625) were also just the lesson's own
opening `c1`/`i1` anchor example restated a third time. Fixed: concept generalized; check moved to a
"parking garage labeling every 5th spot" context with fresh numbers (460→475, chosen distinct from
both the lesson's 610–625 anchor and `k2`'s 715–725 to avoid even incidental reuse), traps 471/480
recomputed true.

**Defect 2 (found, fixed) — figure truthfulness, a new defect class.** `c1`'s bound figure
`skip-count-line` is registered but **does not depict this step**: its implementation in
`figures.tsx` hardcodes `nums=[200,300,400,500,600]`, an explicit `<title>"Skip-counting by
hundreds…"</title>`, and `"+100"` labels at every point — flatly contradicting `c1`'s own text
(*"Skip-counting by fives… 610, 615, 620, 625… each jump adds exactly 5"*). Searched `figureIds.ts`
for a better-fitting registered alternative among all `pv1000-`/skip-related ids (28 candidates) and
found `pv1000-count-by-fives` (component `Pv1000CountByFives`: renders 65→70→75→80 with explicit
`"+5"` labels, title *"Counting forward by fives…"*) — a correct, truthful match. Confirmed
reassigning it here doesn't break its existing correct use at `pv1000-02-03`'s `c2` (this codebase
already reuses figure components across multiple lessons — `skip-count-line` itself is bound at both
`02-02:c1` (wrongly, now fixed here) and `02-03:c1`, a defensible generic illustration there since
that lesson's text makes no specific numeric claim to contradict). Rebinding is a single-field
content-only edit; doesn't touch `src/**`; doesn't affect `session273`'s pinned sequences (this
lesson isn't one of its three pinned lessons) or its general figure-registration assertion (still
registered). `c2` (`pv1000-fives-end`) and `c3` (`pv1000-same-process`) verified correct as
originally bound.

`reviewBasisHash` (post-fix): `edfde034397a28a9d02bde4ec48a95980d81d6fca5da4db439d057aca25773ee`

### pv1000-02-03 — "Counting Forward from Any Start"

**decision: KEEP** (1 defect, fixed) · **visualDecision: SUFFICIENT** · **gradeLanguageDecision: FIT**

**Best question-job variety in the course so far**: i1(forward,find-end,+10×3) / k1(forward,find-end,
+100×2) / i2(count the number of jumps — a genuinely different unknown) / i3(backward,find-end,+10×3)
/ k2(**inverse**: given end+jumps, find the start: 600back3×100=300) / k3(**inverse**: given
start+end+count, solve for jump size: (205−190)/3=5) / ch1(catch-a-mistake). This cycles through
every unknown in `start + size×count = end` — no stale repeats anywhere.

**Math verified, every widget:** all traps recomputed correct (453/470; 232/250; 635/5; 483/180;
900/597; 15/3; 765/1260 — full detail in jsonl rationale). predict "3 hops of 10, how far in total"
resolves `thirty` correctly, option lengths 7/6/7 (correct=7, tied, not an outlier).

**Defect (found, fixed) — remedial, same systemic S316 class.** The single remedial
(`pv1000-count-forward`, serving k1/k2/k3/ch1) had `concept.body` restate `i1`'s exact worked
example (450, three jumps of 10 → 480) immediately before a check using the identical 450/10/3/480
values under `k1`'s exact template (`k1` declares `variant: Pv1000CountForwardNumeric`, whose
template is that literal string) — R2/R4/R6 all failed. Rewrote to a "delivery robot rolling
forward" context (340, 4×10 → 380), traps 370/344 recomputed true, verified distinct from all seven
of this lesson's templates.

**Figures:** `c1` (`skip-count-line`, generic hundreds illustration) — re-examined given the genuine
mismatch found at `pv1000-02-02`: here `c1`'s text makes no specific jump-size claim (*"count
forward from ANY starting number… repeat the same jump size"*), so one concrete instance doesn't
contradict it — not a defect. `c2` (`pv1000-count-by-fives`) confirmed the correct home for that
figure (also now reused, correctly, by `pv1000-02-02:c1`). `c3` (`pv1000-stretched`) matches its
body near-verbatim.

`reviewBasisHash` (post-fix): `cbe742524699ea7380cafb367e8eed69aa9d22ec41000f202096ec5e71958aaa`

---

## Chapter 3: reading, writing, and comparing

### pv1000-03-01 — "Reading and Writing 3-Digit Numbers"

**decision: KEEP** (2 defects, fixed) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

**Math verified, every widget** (full detail in jsonl rationale): c1/i1/k1/i2/i3/k2/k3/ch1 all
correct, including two `buildExpression`-type checks (a new widget type for this course) whose
`commonBuilds` traps are true and diagnostic — `ch1` notably handles both possible orderings of its
two identically-labeled "zero" tiles. Spent extra scrutiny on a family of "drop-the-hundreds" traps
(i2's 34, i3's 53, k3's 69) trying to reverse-engineer one generation formula; found i3/k3 fit
`hundreds-digit×10 + ones-digit-of-remainder` (5·10+3=53, 6·10+9=69) but i2's 34 doesn't cleanly fit
the same formula. Concluded this is imprecise-but-not-false authoring — the feedback in all three
only asserts the general "don't drop the hundreds" misconception and restates correct math, never a
specific false derivation — so not a blocking defect, but I used the correct formula for my own new
trap below rather than propagate the inconsistency.

**Defect 1 (found, fixed) — remedial `rem-pww` (write-words, mcq), R6.** `concept.body` restated
BOTH `c1`'s exact example (347="three hundred forty-seven") AND `k1`'s exact example (608="six
hundred eight") verbatim, then the check asked "Write 347 in word form" — the identical number `c1`
had already spelled out two sentences earlier in the same injected pair. Fixed: concept generalized;
check moved to 274 ("two hundred seventy-four"), confirmed not used as a word-form target anywhere
else in the lesson.

**Defect 2 (found, fixed) — remedial `rem-prw` (read-words), R1/R2/R4/R6, clearest violation in this
lesson.** `check.widget.prompt` was **byte-identical** to `k3`'s (`"What number is \"six hundred
nineteen\"?"`, 619), `concept.body` pre-stated the same fact, and `k3` declares
`variant: Pv1000ReadWordsNumeric` whose template is exactly this string's template. Fixed: rewrote to
an announcer/scoreboard context ("seven hundred thirty-two" → 732); computed the drop-hundreds trap
as 7·10+2=72 using the same formula identified above (caught and corrected my own first draft of 82,
which didn't fit the pattern, via a node one-off before finalizing).

**Figures:** `hundred-tens-ones` (c1), `pv1000-words-to-digits` (c2, generic "352" example),
`pv1000-zero-say` (c3, generic "406" example) — all registered, content-matched, no leaks into
`i2`(347)/`i3`(503).

`reviewBasisHash` (post-fix): `57d2af3fc17a900a57de7a1385753deb60bb13fd4ce09a06fa67d24d87bd7810`

### pv1000-03-02 — "Comparing Numbers with Symbols"

**decision: KEEP** (1 defect, fixed — in two passes) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

This lesson has an extra `i1a` step (guided `placeValueTransformLab`) before `i1` — not a defect;
session301's pinned predict contract targets `i1a` here and matches. Two widget types new to this
course: `placeValueTransformLab`, `placeCompare`.

**Math verified, every widget** — all correct (full detail in jsonl). Considered whether `c3` stating
"399 vs 401: hundreds 3<4 settles it instantly" immediately before `i3` re-asks the identical
comparison is a leak, and likewise `c1`'s 275/312 reused by both `i1a` and `i1`. Recognized this as
the same "concept states a worked example, the paired interactive re-demonstrates that exact example"
scaffolding pattern already established as intentional course design at `pv1000-02-01` (`c1`'s
320-330-340-350 reused verbatim by `i1`'s `numberLineHop`) — an "I do / we do / you do" progression
where `k1`/`k2`/`k3`/`ch1` supply the genuinely fresh, independently-scored numbers covering the full
decision tree (hundreds-decides / tens-decides-after-tie / ones-decides-after-double-tie /
full-equality). Not flagged as a defect.

**Defect (found, fixed in two passes) — remedial, R1 then R2.** The single remedial (`pv1000-compare`,
mcq) had `check.widget.prompt` byte-identical to `i1`'s. First-pass fix (fresh numbers, same bare
"Compare # and #" template) was **caught by my own collision scanner** as still normalize-colliding
with `i1` — exactly the operand-swap-under-unchanged-template failure S316 §1.3 warns against. Second
pass moved to a "Recipe A/Recipe B grams of flour" context, verified distinct from all eight of this
lesson's templates.

**Figures:** `place-by-place-compare` (c1) is an **exact, non-generic match** — hardcodes the literal
275/312 comparison with the hundreds digits highlighted, title states the exact reasoning.
`pv1000-compare-chain` (c2, generic "562>548") matches its generic text. `pv1000-big-digit-loses`
(c3) shows "399<400" while c3's text says "399 vs 401" — same principle, same hundreds digits, same
direction, differing only in the second number's last two digits; a minor cosmetic discrepancy, not
a truthfulness failure on the order of `pv1000-02-02`'s fives/hundreds mismatch (which showed a
different operation entirely) — noted, not blocking.

`reviewBasisHash` (post-fix): `f3c9fc206cf56035f1efe340f265f01d7a4a78c0967cd91fb0d0a379d8cb7495`

### pv1000-03-03 — "Ordering 3-Digit Numbers"

**decision: KEEP** (1 defect, fixed, held to a higher bar than the literal rule required) ·
**visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

Extra `i2a` step, matching session301's pinned predict contract. New widget type: `dragOrder` (i2,
sorting 267/276/627/672 — verified by hand, `correctOrder` and all three `misorderFeedback` entries
correct).

**Math verified, every widget** — all correct (i1, k1, i2a, i2, i3, k2, k3, ch1; full detail in
jsonl rationale).

**Defect (found, fixed) — remedial, held above the letter of the rule.** The remedial's
`check.widget.prompt` ("Compare 456 and 459…") used a template that did **not** normalize-collide
with `k2` (whose template is "A classroom raised $#…") and wasn't byte-identical — so it technically
cleared R1/R2/R4 as literally written. But its **numbers were 100% identical to `k2`'s** (456, 459)
— it was `k2`'s exact scenario with the dollar-sign/classroom wrapper stripped off, a much thinner
representational shift than the Shape-α precedent requires in spirit, even though the mechanical
normalize-test wouldn't catch it. Judged insufficiently distinct for genuine practice value and
rewrote to both fresh numbers *and* a fresh context: "A bakery sold 623 muffins on Monday and 628 on
Tuesday" (same skill class — double-tie, ones decide — no shared numbers or scenario with `k2`).

**Figures:** `place-by-place-compare` (c1) reused from `pv1000-03-02` — appropriate since c1's text
here is fully generic with no specific numeric claim, so the callback to the prior lesson's worked
275-vs-312 example is a defensible, non-contradictory illustration. `pv1000-order-list` (c2) and
`pv1000-write-compare` (c3) both generic, correct, no leaks.

`reviewBasisHash` (post-fix): `2717c8ea311b757c42cbc78c879ca7d4de049f1e76d6c6157bfc33aa62b645de`

---

## Chapter 4: adding and subtracting to 1000

### pv1000-04-01 — "Adding by Place, Then Combining"

**decision: KEEP** (5 defects, fixed) · **visualDecision: REQUIRED** · **gradeLanguageDecision: FIT**

First lesson to introduce `baseTenCompose` (`i1`, target 575, `requireStandard: true`) and the
chapter's core add-by-place-with-trading skill. Math verified end-to-end via node one-offs across
all 7 widget-bearing main steps + 2 remedials: c1 324+251=575; i1's two `commonBuilds` traps both
hand-verified as genuine partial-composition errors (one ones-digit slip, one "only used one
addend's tens digit" error — 2 instead of 2+5=7); k1 213+142=355 (variant `Pv1000AddByPlaceNumeric`,
confirmed in `g2Variants.ts` to emit only the bare `# + # = ?` template, no story wrapper); i2
247+186=433 (both trap values hand-verified, including 423 as the precise "kept the ones reduction
but forgot to fold the traded ten into tens" compound error: 300+120+3=423); i3 358+267=625, a
genuine cascading two-trade case (ones overflow triggers a tens overflow in turn), both trap
endpoints correct; k3 432+326=758; ch1 479+336=815, hints progressive and consistent.

**Defect 1 (found, fixed) — `k2` explanation was circular/non-explanatory.** For 165+177=342, the
original `explanationVariants`/`commonErrors`/`fallbackFeedback` all stated "300+40+2=342" — numbers
that do not correspond to any correct place-value breakdown of this sum (the real breakdown is
hundreds 100+100=200, tens 60+70+10(traded)=140, ones 5+7-10=2, combine 200+140+2=342). Despite the
step's own label ("Another single-trade problem"), verified this is actually a legitimate trade case
whose stated "explanation" simply didn't do the derivation — it restated digit-groups of the
correct final answer (342 → 3,4,2 rearranged as "300+40+2") without deriving them. Rewrote to the
honest derivation, matching the method the lesson correctly uses elsewhere (i2/i3).

**Defects 2–3 (found, fixed) — mismatched trap values in `k1` and `k3`, a new defect subtype.** Both
steps' second `commonErrors` entry carried a "That drops the hundreds" feedback asserting a specific
derivation (tens+ones only), but the attached numeric `value` did not equal that derivation's result:
k1's said 45 where drop-hundreds arithmetic gives 50+5=**55**; k3's said 68 where it gives 50+8=**58**
— i.e. entering the actual, plausible drop-hundreds error would silently miss this diagnostic
feedback entirely, while the number that *does* trigger it isn't explained by the text shown. Cross-
checked this lesson's own remedial `rem-pabp-k` (145+132=277 → drop-hundeds trap correctly = 70+7=77)
to confirm "drop-hundreds = tens+ones" is this lesson's established, correct derivation and that k1/
k3 simply had a slipped digit (off by exactly 10, in opposite directions — not a systematic rule,
just two independent typos). Corrected k1's 45→55 and k3's 68→58; feedback text needed no change.

**Defects 4–5 (found, fixed) — both remedials, S316 violations.** `remedials[0]`
(`pv1000-add-by-place`) restated `c1`'s exact worked numbers in `concept.body` (R6) and its check
collided with `k1`'s declared-generator template family. Generalized the concept text and rewrote the
check to a fresh "farm: 145 apples + 132 apples" context (277, no-trade, matching k1's no-trade
skill); traps 77 (drop-hundreds, verified) and 267 recomputed true. `remedials[1]`
(`pv1000-add-trade`) restated `i2`'s exact ones-place computation immediately before an identically-
numbered check. Generalized the concept text and rewrote the check to a fresh "store: 126 mugs + 237
mugs" context (363, clean single-trade); traps 63 (drop-hundreds, verified) and 353 (verified as the
same "forgot to fold the traded ten" compound pattern independently confirmed correct in `i2`'s 423
and `k2`'s 332 traps: 300+50+3=353) recomputed true. Re-ran the collision scanner after both
rewrites: zero collisions against any of the 7 main-sequence templates.

**Figures**, checked against `figures.tsx` source: `decompose-combine` (`c1`) is an exact,
non-generic match — hardcodes "324 = 300+20+4", "251 = 200+50+1", boxes reading 500/70/5, footer
"500+70+5=575", confirming `visualDecision: REQUIRED`. `pv1000-trade-ones` (`c2`, "13 ones → 1 ten,
3 ones") and `pv1000-cascade` (`c3`, "10 tens → 1 hundred") are both generic, non-numeric
illustrations of the general trading/cascading principle their steps describe in words — consistent
with this course's established convention for generalized concept steps, not a truthfulness defect.

`i1.predict` (session301-pinned) was never touched; its pre-existing option order already satisfies
the required outcome-index pattern for this lesson's position in the 12-lesson alternating contract.
Confirmed no `LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row for this lesson.
Language read end-to-end: clear, grade-appropriate, base-ten-block vocabulary ("flats/rods/cubes")
consistent with prior lessons' metaphor.

`reviewBasisHash` (post-fix): `180bd5a827b95f5af1bfa347dc765402b88b758619972f381f082a5f0e3690b3`

---

### pv1000-04-02 — "Subtracting by Place, with Trading"

**decision: KEEP** (3 defects, fixed) · **visualDecision: SUFFICIENT** · **gradeLanguageDecision: FIT**

Second of the three `session273`-pinned lessons: `c1` must have no `figure` and its body must contain
the literal substring `"486 − 253"`. **Confirmed both hold after my edits** via an explicit node
re-check (step-ID array, widget-type array across all 9 widget-bearing items, `c1.figure ===
undefined`, body contains the signature) — I never touched `c1`. Same already-tested resolution as
`pv1000-02-01` (no registered figure fits the exact worked example; text-only is correct), hence
`visualDecision: SUFFICIENT` for consistency with that precedent. Math verified end-to-end for all 7
main widget-bearing steps + 2 remedials: c1 486−253=233; i1 `baseTenCompose` (both traps verified,
including 739=486+253 diagnosing an add-instead-of-subtract slip); `i1.predict`/`successFeedback`
checked specifically for the dangling-reference defect class found at `pv1000-02-01` — this lesson's
forward references to i2's 342−127 are accurate, not dangling; k1 579−245=334 (variant
`Pv1000SubtractByPlaceNumeric` confirmed bare-template-only); i2 342−127=215 (225 trap verified as
the precise "forgot to decrement the lending tens place" compound error); c3/i3 402−168=234, a
genuine cascading trade-down through an empty tens spot; k3 768−325=443, no trade (matches its
"confidence" purpose); ch1 351−134=217.

**Defect 1 (found, fixed) — `k2`'s numbers contradicted its own label, tag, and explanation.** Body
says "Another single-trade-down problem," `conceptTag` is `pv1000-subtract-trade`, and
`explanationVariants` described "Ones (3) aren't enough for 8 — trade 1 ten for 10 ones: 13-8=5...
Combine: 251" — but the actual widget was `463 - 212 = ?`, which needs **no trading at all**
(ones 3 ≥ 2). Proved by exhaustive digit search that no real ones-trade against a minuend ending in 3
can ever total 251 (a trade forces the total's ones digit to equal the trade remainder), so the
explanation was internally self-contradictory, not just mismatched to the prompt. This was a real
coverage gap, not a wording nit: with k2 accidentally trade-free, only `ch1` (a harder tier) would
have independently exercised the just-taught single-trade skill, silently duplicating k3's explicit
no-trade purpose instead. Fixed by changing the subtrahend so the pre-existing "(3)" / "for 8" text
becomes literally true — `463 - 218 = ?` = 245, a genuine single trade (no cascade) — and rewrote the
explanation/traps to a coherent, hand-verified derivation (255 = forgot-to-shrink-the-lending-tens;
681 = addition trap).

**Defects 2–3 (found, fixed) — both remedials, S316 violations.** `rem-psbp` (`pv1000-subtract-by-
place`) restated `c1`'s exact numbers in `concept.body` (R6) and its check was `486 - 253 = ?` —
literally `c1`'s own worked example repeated as the "independent" practice problem. Generalized the
concept text and rewrote the check to a fresh "farm: 597 chickens, sold 253" context (344, no-trade,
matching k1/k3's skill); traps 354 and 850 (addition trap) recomputed true. `rem-pst2`
(`pv1000-subtract-trade`) restated `i2`'s exact numbers/derivation in `concept.body` and its check
reused `i2`'s exact operands (`342 - 127 = ?`) — the identical arithmetic problem, not merely a
template collision, held to the same higher bar already applied at `pv1000-03-03`. Generalized the
concept text and rewrote the check to a fresh "bakery: 534 rolls, sold 217" context (317, genuine
single trade, distinct from i2/k2/ch1's operands); traps 327 (same forgot-decrement diagnostic
pattern as k2's own 255) and 751 (addition trap) recomputed true. Re-ran the collision scanner after
all edits: zero collisions against any of the 7 main-sequence templates.

**Figures**, checked against `figures.tsx`: `pv1000-trade-down` (`c2`) and `pv1000-cascade-down`
(`c3`) are both generic, non-numeric illustrations that truthfully depict the general trade-down/
cascade principle their steps describe in words — consistent with this course's established
convention. `i1.predict` option lengths (29/34/28, correct=34) well balanced. Confirmed no
`LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row for this lesson. Language read
end-to-end: clear, grade-appropriate.

`reviewBasisHash` (post-fix): `9b212a55b5f1214ca9a2f7403d45b8cbf9df47dc40aeacbac4507f9454a67af9`

---

### pv1000-04-03 — "Adding and Subtracting in Real Situations"

**decision: KEEP** (3 defects, fixed) · **visualDecision: SUFFICIENT** · **gradeLanguageDecision: FIT**

Third and final `session273`-pinned lesson: `c2` must have no `figure` and its body must contain
`"247 + 186 = 433"`. **Confirmed both hold after my edits** via the same explicit node re-check used
for the other two pinned lessons — never touched `c2`. `c1`/`c3` both carry genuinely truthful,
registered figures (`decompose-combine` re-verified as an exact match since `c1` reuses 324+251=575
verbatim; `pv1000-decompose`'s title is a near-verbatim match to `c3`'s "decompose... work each
spot... combine" body), so `visualDecision: SUFFICIENT` for consistency with the identical situation
at `pv1000-02-01`/`pv1000-04-02`.

This lesson is the course's "real situations" capstone: nearly every widget deliberately **reuses
numbers already taught in `pv1000-04-01`/`pv1000-04-02`**, each rewrapped in a fresh story (324+251
from 04-01's c1; 247+186 from 04-01's i2; 342−127 from 04-02's i2; 213+142 from 04-01's k1; 579−245
from 04-02's k1; 358+267 from 04-01's i3, including its exact commonErrors). Confirmed this is
intentional cross-lesson design (revisiting known arithmetic while teaching story-to-equation
translation), not a defect — distinct from the within-lesson duplication R1/R2 actually forbid; none
of these numbers repeat twice within this lesson's own main sequence. All math re-verified from
scratch regardless: every sum/difference and every "forgot-the-trade"/addition-trap correct.

**Defects 1–2 (found, fixed) — the same "drops-the-hundreds value off by one ten" bug, recurring.**
`i1`'s second `commonBuilds` trap was authored as `{hundreds:0, tens:6, ones:5}` (totals 65) attached
to feedback claiming a pure "drops the hundreds" error ("Combine all three spots: 500+70+5=575" —
implying the trap should total 75, not 65). `k2` (reusing 213+142=355 verbatim from `pv1000-04-01`'s
`k1`) carried the **identical** bug already found and fixed there: value 45 attached to identical
"drops the hundreds...300+50+5=355" feedback, where the correct trigger is 55. This confirms the bug
class from `pv1000-04-01` recurs across lessons, evidently copy-pasted along with the reused problem.
Corrected `i1`'s tens 6→7 and `k2`'s value 45→55.

**Defect 3 (found, fixed) — the remedial was byte-identical to this lesson's own `k1`.** `rem-prw2`'s
check widget was `"486 - 253 = ?"` — the exact same string as `k1`'s widget in the very same lesson
(answer 233 both), an R1 violation with zero representational shift at all (`concept.body` was
already generic/R6-clean; only the check needed a fix). Rewrote to a fresh "library: 758 books,
donated 326" context (432, no-trade, matching k1's own no-trade nature); traps 423 (generic restate)
and 1084 (addition trap, verified 758+326=1084) recomputed true. Re-ran the collision scanner: zero
collisions against any of the 7 main-sequence templates.

`i1.predict` option lengths (13/36/13, correct="more" tied-shortest at 13) if anything guard against
a naive longest-answer heuristic rather than leak toward it — not a defect. Confirmed no
`LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row for this lesson. Language read
end-to-end: clear, grade-appropriate; this lesson's story-to-equation throughline appropriately
capstones the course's final chapter.

`reviewBasisHash` (post-fix): `ed0ec0a22379223826875068e0870634024109cc19d6992ff90fb660f58a244f`
