# S320 Implementation — Packet A11 (Bounded Implementation Worker)

Prefix: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (`MT-V4-WORKER-PREFIX-1`), read and applied.
Contracts: `reports/closure/S320_ASSESS_A11.md` — all 25 REVISE lessons implemented.
Scope: `content/courses/compare-numbers-k`, `content/courses/measure-compare-k`,
`content/courses/teen-numbers-k` lesson JSON files named in the contracts, and only those files.
No other files edited. No `npm`/`vitest`/`tsc` run, per instructions.

## Summary

| Course | REVISE lessons fixed |
|---|---|
| compare-numbers-k | 9 / 9 |
| measure-compare-k | 7 / 7 |
| teen-numbers-k | 9 / 9 |
| **Total** | **25 / 25** |

Every changed file parses (`python json.load`). A scripted verbatim (raw, byte-identical)
cross-lesson duplicate scan across all 36 lessons in all three courses — comparing
prompt+options/items/hotspots+feedback per widget type, matching the assessment's own
methodology — is **clean (0 groups)** after the fixes. A second, stricter normalized-digit
(`digits→#`) scan is also clean after two residual fixes described below. `mcq`
exactly-one-correct, feedback ≥25 chars, no-negation-opening-feedback, `tenFrame`
dead/self-contradictory `commonCounts`, `numberLineHop` landing-vs-`successFeedback`, and
`dragOrder` `correctOrder`-vs-`successFeedback` were all recomputed programmatically for
every step in all 36 lessons (not just the 25 touched) — 0 issues outside the pre-existing,
out-of-scope `mcq` "correct option not listed first in the JSON array" pattern, which is
confirmed by prior S316/S319/S318 work in this repo to be a display-order convention only
(render order is `seededShuffle`-per-`lessonId:stepId`, grading is by option `id`) and not a
defect — present on 59 untouched, canonical steps across all three courses and left alone.

## Per-lesson changes

### compare-numbers-k

**kcm-01-03** — `k1` and its remedial `rem-kcm-bigger-group-k` reused kcm-01-01/k1's
"8 stars and 7 hearts" prompt+options+feedback verbatim. Replaced with a new "9 balloons and
6 kites" scenario, same 4-option more/equal/cannot-tell shape, all feedback text rewritten to
name balloons/kites. Remedial kept mirroring `k1` (expected same-lesson pattern, not a defect).

**kcm-01-04** — `k3` reused kcm-01-01/k2's "How does pairing settle which group is bigger?"
question verbatim. Replaced with "Why does pairing tell you which group is smaller?" and a new
4-option set built on the running-out-first framing (vs. page order, table space, object-size
misconceptions).

**kcm-02-01** — `i2`'s `tenFrame` `commonCounts` had a `{count:4, ...}` entry equal to the
widget's own `target:4` — dead per `evaluate.ts`'s `v===target` short-circuit, and
self-contradictory (describing the correct answer as a near-miss). Removed it; kept the
`count:3` entry.

**kcm-02-02** — `k1` reused kcm-01-03/k2's "quick visual estimate" question verbatim; replaced
with a concrete "2 red blocks vs 9 blue blocks — is it obvious?" scenario. `k2` reused
kcm-02-03/k2's "5 stars and 6 hearts" question verbatim (a mutual pair — both sides needed new
content); replaced with "7 leaves and 9 acorns."

**kcm-02-03** — `k2` reused kcm-02-02/k2's "5 stars and 6 hearts" question verbatim (the other
half of the mutual pair above); replaced with "4 fish and 9 crabs."

**kcm-02-04** — Remedial `rem-kcm-greater-numeral-k`'s correct option ("...and later always
means more", 54 chars) was 2.05–2.57x every distractor. Shortened it to "8 comes later in the
song, so it names more" (43 chars) and lengthened the shortest distractor ("8 rhymes with
'great'", 21 chars) to "8 rhymes with the word 'great'" (30 chars); a first-pass fix that only
shortened the correct option left one ratio at 2.05x, so the distractor was also widened — all
three ratios are now 1.43–1.79x.

**kcm-03-02** — `i2`'s `tenFrame` `commonCounts` had a `{count:6, ...}` entry equal to
`target:6` (same dead/self-contradictory pattern as kcm-02-01); removed it. **Residual** (found
by this packet's own post-fix normalized-digit scan, not in the original contract): `ch1`'s
"3 stars and 3 hearts" equal-groups question is digit-normalized-identical to kcm-02-01/k1's
"4 stars and 4 hearts" — their feedback strings contain no digits at all, so only the object
names distinguished them, and both used stars/hearts. Reworded `ch1` to "5 acorns and 5
pinecones" so the two same-numeral-comparison steps no longer collide even after digit
normalization.

**kcm-03-03** — `k1` and its remedial `rem-kcm-order-numerals-k` had `dragOrder`
`successFeedback` reading "21, 22, 23, 24, 25 — perfect counting order!" while the actual
cards/`correctOrder` are 5,6,7,8 — shown unconditionally on every correct submit per
`evaluate.ts`. Changed to "5, 6, 7, 8 — perfect counting order!"

**kcm-03-04** — `k2`'s `dragOrder` `successFeedback` had the same "21, 22, 23, 24, 25" text
while the actual cards are 4,5,6,7. Changed to "4, 5, 6, 7 — perfect counting order!"

### measure-compare-k

**kmd-01-04** — `ch1` reused kmd-01-01/k3's "seesaw vs ruler" tool question verbatim; replaced
with a capacity-focused "Which question does a scale answer, and which does a measuring cup
answer?" (scale=weight, cup=capacity), fitting this lesson's kmd-capacity-words concept better
than the length-vs-weight framing it replaced. `i2`'s `tenFrame` (target 6, preFilled 4) had all
three `commonCounts` feedback strings citing a stale "exactly 5" target. Fully recomputed for
target 6 rather than a bare digit swap (a swap alone would have left "N dots still missing"
arithmetically wrong): count 2 → "4 dots still missing... exactly 6"; count 4 → "2 dots still
missing... exactly 6" (the genuinely-reachable entry from the preFilled=4 default state); the
`count:6` entry was self-contradictory once target became 6 (dead per the `v===target`
short-circuit) — reassigned to `count:7` ("7 adds 1 too many... exactly 6"), truthful and
genuinely reachable.

**kmd-02-02** — `k2`, `k3`, and `ch1` were a verbatim reordered copy of kmd-01-03's `ch1`, `k3`,
and `k1` (toy-bear-on-seesaw / balloon-and-stone scenarios). Rewrote all three with new objects
while preserving the up=lighter / size≠weight / down=heavier concepts: `k2` → "backpack on a
scale pan rises... lighter"; `k3` → "big pillow vs small brick... brick can be heavier"; `ch1` →
"toy truck on a scale pan sinks... heavier." Switched vocabulary from seesaw/bear/balloon/stone
to scale/pan/backpack/pillow/brick/truck throughout. `i1`/`i2` (`balanceScale`, already correctly
varied) left unchanged.

**kmd-02-03** — `k2` reused kmd-02-01/k3's "two runners race, one starts ahead" question
verbatim; replaced with "two pencils compared, one pushed forward before measuring," same
aligned-starts concept.

**kmd-02-04** — `k2` reused kmd-01-02/k1's "tower is TALL, snake is LONG — what do the words
share?" vocabulary-recall question verbatim; replaced with an actual comparison task: "A giraffe
and a lamppost stand side by side, feet lined up... which is taller?" The first draft of this
new correct option ran up to 2.21x its own distractors (caught by this packet's own post-fix
length-ratio scan, not itself a named contract item); shortened "The giraffe — its top reaches
higher from the same ground line" to "The giraffe — its top reaches higher" (feedback text
unchanged, still accurate) — ratios now 0.71–1.29x.

**kmd-03-02** — `k1` reused kmd-03-01/k2's "What makes a sort a SORT?" question verbatim;
replaced with a size-specific "Before you sort toys into BIG and SMALL piles, what must you
decide first?" (the size-boundary concept). This new `k1` option itself first ran up to 2.14x
its own distractors (caught by the same post-fix length-ratio scan); shortened "Where the
boundary between big and small sits" to "Where big and small divide" — ratios now 0.84–1.24x.
Remedial `rem-kmd-sort-size-k`'s correct option ("One rule that every object is tested
against", 44 chars) was up to 8.8x the shortest distractor ("Speed", 5 chars). Shortened the
correct label to "One rule everyone must follow" (29 chars) and lengthened "Speed" to "How
quickly it gets done" (25 chars) — all ratios now 1.16–1.53x.

**kmd-03-03** — `i2`'s `tenFrame` (target 8, preFilled 5) had the same stale-target bug as
kmd-01-04/i2, citing "exactly 7." Recomputed for target 8: count 3 → "5 dots still missing";
count 6 → "2 dots still missing" (genuinely reachable); the dead/self-contradictory `count:8`
entry reassigned to `count:9` ("9 adds 1 too many... exactly 8").

**kmd-03-04** — `i1`'s `tapDiagram` `hotspots` were byte-identical to kmd-03-01/i1's
"6 triangles / 9 squares / 2 circles." Replaced with "4 stars / 7 hearts / 3 moons" (new
shapes/icons/counts), same tap-the-greatest-group mechanic; `successFeedback` updated to name
7 hearts. The already-varied `predict` sub-block was left unchanged. `ch1` reused
kmd-03-03/k3's "what does counting each group add?" question verbatim; replaced with a question
that actually exercises comparing counts across categories: "Three groups have counts 5, 9, and
7... what tells you which group is biggest?"

### teen-numbers-k

**knb-01-04** — `k1` (+ remedial `rem-knb-11-13-k`) reused knb-01-01/ch1's "12 dots, which
numeral" question verbatim; replaced with "11 dots" (in this lesson's own 11–13 range). `k2`
reused knb-01-01/k2's "What does 14 secretly say?" verbatim; replaced with "What does 13
secretly say?", preserving the ten-plus-ones decomposition structure with new option text.

**knb-02-01** — `i1` was byte-identical to knb-01-03/i1's "make 15" `tenFrame` (target 5,
preFilled 0); rewrote as a new "carton already holds ten muffins... make 14" scenario (target
4), keeping the existing `predict` block (already asked about "fourteen," now consistent).
`k2` reused knb-01-02/ch1's "14 dots, which numeral" verbatim; replaced with "What does the
numeral 15 secretly say?" `k3` was byte-identical to knb-01-03/k3's count-on-6 hop (landing 16);
changed to count-on-5 (landing 15), full `commonLandings`/feedback recomputed. Remedial
`rem-knb-14-16-k` reworded (target/preFilled unchanged at 6/0) from the standard "make 16"
template — byte-identical to knb-01-03's own remedial — to a new "shelf already holds ten
blocks... make 16" scenario. **Residual**: this packet's own post-fix scan found `ch1`
("What number comes right before 15?") had become identical to knb-03-02/ch1 (both were
independently drafted with the same replacement text); reworded to "before 16" to clear the
self-inflicted collision.

**knb-02-02** — Remedial `rem-knb-17-19-k` was byte-identical to knb-01-03/i1's and (pre-fix)
knb-02-01/i1's "make 15" content — wrong range for a remedial meant to cover 17–19. Replaced
with a "basket already holds ten peaches... make 19" scenario (target 9), inside the correct
range.

**knb-02-03** — `k1` (+ remedial `rem-knb-decompose-teen-k`) reused knb-02-02/ch1's "Which pair
is NOT a split of 18?" verbatim; replaced with "...split of 17?" (10+6=16 is the answer), all
sums hand-verified. `i1` was byte-identical to knb-01-03's and knb-02-01's old "make 16"
remedial content; replaced with "crate already holds ten oranges... make 18" (target 8);
`predict` block updated from "Sixteen breaks into ten and..." to "Eighteen breaks into ten
and..." to match.

**knb-02-04** — `k3` was byte-identical to knb-03-02/i1's pre-fix count-on-3 hop (landing 13);
changed to count-on-7 (landing 17), full `commonLandings`/feedback recomputed.

**knb-03-01** — `k1` (+ remedial `rem-knb-leftover-ones-k`) reused knb-02-03/k2's "17 dots...
how many left over?" (7) verbatim; replaced with "19 dots... left over?" (9). `k3` was
byte-identical to knb-01-03/k3 and (pre-fix) knb-02-01/k3's count-on-6 hop; changed to
count-on-8 (landing 18). `ch1` reused knb-03-03/k1's "full ten and 3 outside... (13)" verbatim
(a mutual pair — both sides needed new content); replaced with "...7 outside... (17)."

**knb-03-02** — `k2` was byte-identical to knb-01-01/k3's "right after 16" hop (landing 17);
changed to "right after 13" (landing 14). `ch1` reused knb-02-01/ch1's "What number comes right
after 17?" verbatim; replaced with a "right before" variant, "...right before 15?" (14). `i1`
was byte-identical to knb-02-04/k3's pre-fix count-on-3 content; changed to count-on-9 (landing
19), `predict` block updated to match ("Where does 19 live on the line?"). This lesson's own
remedial (count-on-4, landing 14) is confirmed original per the contract and left unchanged.

**knb-03-03** — `i1` was byte-identical to knb-01-02/i1's pre-fix "make 12" content (target 2);
rewrote as "box already holds ten crayons... make 17" (target 7); `predict` block — which was
already internally mismatched to its own widget before this fix (talked about "16" while the
widget built "12") — updated to "Full frame, 7 dots outside... 17," now consistent. `k1` (+
remedial `rem-knb-identify-teen-k`) reused knb-03-01/ch1's "full ten and 3 outside... (13)"
verbatim (the other half of the mutual pair above); replaced with "...4 outside... (14)." `k2`
reused knb-01-03/k2's "16 dots, which numeral" verbatim; replaced with "18 dots." `k3` was
byte-identical to knb-01-04/k3's "right before 18" hop (landing 17); changed to "right before
16" (landing 15).

**knb-03-04** — `i1` was byte-identical to knb-01-04/i1's pre-fix "make 13" content (target 3);
rewrote as "tray already holds ten cupcakes... make 16" (target 6); `predict` block's embedded
numbers updated from 2/twelve to 6/sixteen to stay consistent (kept the existing "egg tray"
illustrative framing, matching this codebase's pattern of `predict` using a different object
than the widget). `ch1` reused knb-02-02/ch1's and knb-02-03/k1's "Which pair is NOT a split of
18?" verbatim; replaced with "...split of 16?" (10+5=15 is the answer — distinct from both
18 and knb-02-03/k1's post-fix 17). `k3` was byte-identical to knb-03-02's own remedial
(count-on-4, landing 14, confirmed original per the contract); changed knb-03-04/k3 to
count-on-3 (landing 13). `k2`'s "which pair makes 10" is confirmed a legitimately-varied
template per the contract and was left unchanged.

## Verification gates run

- `python -c "json.load(...)"` on all 25 changed files — all parse clean.
- Scripted **raw** (byte-identical) cross-lesson duplicate scan across all 36 lessons in all
  three courses, matching the S320_ASSESS_A11 methodology (`prompt`+widget-type-specific
  values+feedback per `mcq`/`dragOrder`/`tenFrame`/`numberLineHop`/`tapDiagram` step, main +
  remedial) — **0 cross-lesson groups** after the fixes.
- Scripted **normalized-digit** (`\d+`→`#`) variant of the same scan (a stricter check than the
  original methodology, run because the top-level RULES require normalized-digit distinctness)
  — **0 cross-lesson groups** after the two residual fixes (kcm-03-02/ch1, knb-02-01/ch1)
  described above.
- Scripted recompute pass over **every** step (main + remedial) in all 36 lessons, not just the
  25 touched: `tenFrame` `commonCounts` vs. `target`/`preFilled` (dead/self-contradictory
  `count===target` entries), `numberLineHop` landing (`start±hop×hops`) vs. the digit actually
  cited in `successFeedback`, `dragOrder` `correctOrder` item labels vs. `successFeedback`
  substring, `mcq` exactly-one-correct-option, feedback ≥25 chars, feedback not
  negation-opening — **0 issues** (the "correct option not first in the array" heuristic is
  excluded per the S316/S319/S318 precedent that it is a display-order convention, not a
  defect; it fires on 59 untouched canonical steps and 0 of my own new/edited option arrays).
- Scripted option-label-length-ratio scan (correct ≥1.8x every distractor) run across all 36
  lessons — confirms the two contracted remedials (kcm-02-04, kmd-03-02) are now under 1.8x on
  every distractor; the ~29 other length-ratio hits it turns up elsewhere in the corpus are all
  on untouched canonical steps outside this packet's contract (mostly single-digit numeral
  options like "12" vs. "2," which the original assessment's careful, non-automatic review did
  not flag) and were left alone per "do not broaden scope."
- `predict.outcomeId` referential-integrity check (every `predict.outcomeId` resolves to an
  option `id` in the same `predict.options`) across all 36 lessons — 0 issues.
- `node scripts/session/print-review-basis.mjs` re-run for all 25 changed lessons (new
  `reviewedBasisHash` values recorded in the NDJSON).
- `npm`/`vitest`/`tsc` intentionally **not** run, per task instructions.

## Notes on scope and residual fixes

Two fixes in this packet are outside the literal text of `S320_ASSESS_A11.md` but were made
because the task's own gate ("scripted verbatim+normalized duplicate scan across all 3 courses
post-fix — must be clean") requires it:

1. **kcm-03-02/ch1**: found colliding with kcm-02-01/k1 under normalized-digit comparison
   (both "N stars and N hearts... equal" with feedback text that contains no digits at all, so
   the object names were the only distinguishing signal, and both used stars/hearts). Not named
   in the A11 contract. Reworded to "acorns and pinecones."
2. **knb-02-01/ch1**: this packet's own two independent "right before 15" fixes (drafted for
   knb-02-01/ch1 and knb-03-02/ch1 from separate contract items) collided with each other under
   the raw scan. Reworded knb-02-01/ch1 to "right before 16" to clear it.

No other deviations from the contract text. All step/remedial IDs, `conceptTag`s, widget types,
and evaluator semantics were preserved except where a contract explicitly required a widget
numeric-field change (`tenFrame.target`, `numberLineHop.start`/`hops`, `commonCounts` entries).
Kindergarten-appropriate language and count ranges were preserved throughout; every
`teen-numbers-k` fix that touches a `tenFrame` keeps the ten-plus-ones structural truth (a
finished ten plus a counted `target` number of loose ones equalling the stated teen number,
hand-verified for every changed `target`/prompt pair).

## Raw data

- Contracts: `reports/closure/S320_ASSESS_A11.md`
- This report: `reports/closure/S320_IMPL_A11.md`
- NDJSON (25 records, one per fixed lesson): `reports/closure/cowork-staging/laneA-s320-impl-3.jsonl`
- Changed files: 9 in `content/courses/compare-numbers-k/lessons/`, 7 in
  `content/courses/measure-compare-k/lessons/`, 9 in `content/courses/teen-numbers-k/lessons/`
  (paths, post-fix sha256, and post-fix `reviewBasisHash` in the NDJSON).
- No files outside these 25 lesson JSONs were modified. No `npm`/`vitest`/`tsc` commands were
  run. This implementation worker did not assess or close its own packet; evidence is returned
  for independent assessment per the authority doc.
