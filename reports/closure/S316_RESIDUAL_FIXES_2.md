# S316 — Residual fixes, round 2 (18 lessons across 4 items)

Fixes the residuals found by `reports/closure/S316_LANEAV2_G1_KOA_VERIFICATION.md` (item 1) and
`reports/closure/S316_LANEAV2_MIXED_G4V_VERIFICATION.md` (items 2–4). `npm`/`vitest`/`tsc` were
**not run**, per instruction. Every file was parse-checked with `python3 -c "import json; json.load(...)"`
(all 18 pass). No file outside the four scoped sets was touched.

Staging: `reports/closure/cowork-staging/laneA-residuals-2.jsonl` (18 NDJSON records, one per
lesson, `reviewBasisHash` from `node scripts/session/print-review-basis.mjs`).

## Item 1 — `add-subtract-10-k` KOA-R, `remedials[0].check.explanationVariants` (14 lessons)

Rewrote `explanationVariants` in `koa-01-01`, `koa-01-02`, `koa-01-03`, `koa-01-04`, `koa-01-05`,
`koa-03-01`, `koa-03-02`, `koa-03-03`, `koa-03-05`, `koa-03-06`, `koa-03-07`, `koa-03-08`,
`koa-03-09`, `koa-03-10` so each entry restates the strategy using the widget's own current
numbers/objects, matching the `koa-02-01` exemplar's pattern. `koa-03-04` was left untouched (per
instruction — it is number-free and already KEEP).

Only `remedials[0].check.explanationVariants` was touched in each of the 14 files; every other key
(id, conceptTag, hints, widget, cml, remedials[0].concept) is byte-identical to the pre-fix
working-tree state. Confirmed per-file via targeted string replacement (no whole-file rewrite) and
by diffing the surrounding JSON.

| Lesson | New widget (operands → answer) | New `explanationVariants` |
|---|---|---|
| koa-01-01 | 1 counter + 1 more → 2 | "1 counter and 1 more counter together make 2." / "Counting every counter shown together gives 2." |
| koa-01-02 | 1 finger + 2 more → 3 | "1 finger and 2 more fingers together make 3." / "Counting every finger shown gives a total of 3." |
| koa-01-03 | 1 circle + 2 more → 3 | "1 circle and 2 more circles together make 3." / "Every circle drawn on the frame counts, giving 3." |
| koa-01-04 | 1 toy person + 1 more → 2 | "1 toy person and 1 more toy person make 2 playing." / "Joining grows the group of toy people playing to 2." |
| koa-01-05 | 1 block + 1 more → 1+1=2 (MCQ) | "Joining is written with a plus sign: 1 + 1 = 2." / "The sentence records the block that joined: 1 + 1 = 2." |
| koa-03-01 | 1 apple + 2 more → 3 | "1 apple plus 2 more apples makes 3 in the basket." / "Adding 2 apples to the basket's 1 apple gives 3." |
| koa-03-02 | 3 apples − 1 → 2 | "3 apples take away 1 apple leaves 2 in the basket." / "Taking 1 apple from the basket's 3 apples leaves 2." |
| koa-03-03 | 1 red + 1 green → 2 | "1 red grape and 1 green grape together make 2 grapes." / "Both colors sit on the same frame, so count all 2." |
| koa-03-05 | 1 counter, 1 moved away (MCQ) | "Crossing out shows the 1 counter that moved away." / "A drawing must show both the counter and its move." (stale "2 cats" noun removed) |
| koa-03-06 | 1 counter + 1 more → 2 | "Counting 1 counter then 1 more gives 2 in all." / "1 and 1 more counted together makes 2." |
| koa-03-07 | 3 counters − 2 → 1 | "3 counters take away 2 counters leaves 1." / "Taking 2 counters from 3 counters leaves 1." |
| koa-03-08 | 1 counter + 1 more → 2 | "One more than 1 counter is 2 counters." / "Adding one counter moves the count up to 2." |
| koa-03-09 | 1 counter + 0 more → 1 | "Adding zero more counters leaves the count at 1." / "Zero means no counters moved, so the count stays 1." |
| koa-03-10 | 1 counter + 1 more → 2 | "1 counter plus 1 more counter equals 2 in all." / "Known sums within 5 come back without counting." (2nd variant kept — number-free, still true) |

**Verification (per lesson):** every number and noun in the new `explanationVariants` was checked
programmatically against the current `widget.prompt` and `widget.answer` (or the MCQ's correct
option) — script output confirmed all 28 strings match their widget's drawn numbers/objects exactly.
All 28 strings are ≥25 characters (range 38–54) and none opens with the `NEGATION` regex
(`^(no|not|wrong|incorrect|sorry|try again|nope)\b`, case-insensitive).

## Item 2 — `decimal-fluency-g5/g5d-01-03.json` — false carry-trap feedback (k2, ch1)

Both the k2 and ch1 "carry" traps stated a dropped-ones-carry mistake that would be 1.00 off from
the correct sum, but the stored trap values are only 0.10 off. Recomputed what actually produces
each trap value:

- **k2**: 3.50 + 4.65 = 8.15 (correct). Trap `8.05` is reachable only by mis-adding the tenths
  column itself — treating 5 + 6 as **10** instead of **11** (write 0, still carry 1 correctly to
  the ones place) — not by dropping the carry. New feedback: *"5 + 6 was added as 10 instead of 11,
  so the tenths digit was written as 0 — that is 0.10 short of 8.15."*
- **ch1**: 6.80 + 2.57 = 9.37 (correct). Trap `9.27` is reachable the same way: 8 + 5 mis-added as
  **12** instead of **13**. New feedback: *"8 + 5 was added as 12 instead of 13, so the tenths digit
  was written as 2 — that is 0.10 short of 9.37."*

Trap values themselves were **not changed**. The other (padding) trap in each step — `7.7` for k2,
`8.65` for ch1 — was already correctly computed and truthfully described; left untouched.

## Item 3 — `bivariate-statistics/bv-04-02.json` — `ch1` figure/scenario mismatch

`ch1`'s figure `bv-rel-freq` is hardcoded ("÷ 50 (whole)" / "÷ 20 (adults)", `src/components/figures.tsx:13797–13814`)
but `ch1`'s prior scenario (60 students / 30% / 18) never mentioned 50 or 20. Reworked `ch1` back to
a 50-total/20-adult-subgroup scenario, reusing the lesson's own table (child/adult × dog/cat, counts
`[20,10,5,15]`) and its already-established adult-cat cell of 15 (the same fact k1 uses: "Of the 20
adults, 15 prefer cats" = 75%). New `ch1` asks for that **same cell**, divided by the **other**
total — 50 instead of 20 — giving 30%, which is literally the figure's own "same cell, different
totals" claim (15÷20=75% vs 15÷50=30%).

- `widget.answer`: 18 → 30
- `widget.commonErrors`: recomputed to `75` (repeats the ÷20 percent instead of switching to ÷50)
  and `15` (the count itself, not a percent)
- `explanationVariants`, `hints`, `body` rewritten to match
- `k2` (already independently reworked in an earlier session; not part of this residual) was **not**
  touched.

Verified 15÷20=0.75 and 15÷50=0.30 by hand; confirmed the figure's SVG title/text is now literally
true of `ch1`'s numbers; checked normalized(prompt) (digit-runs→`#`) against every other
widget-bearing step in the lesson (`c1`/`i1`/`k1`/`i2`/`k2`/`k3`/remedial) — no collision.

## Item 4 — `measure-problems-g4/g4v-01-01.json`, `g4v-01-03.json` — false imperial figure on remedial

Both lessons' `remedials[0].concept` carried `"figure": "rr-conversion"`, a fully hardcoded
imperial-units figure ("12 in = 1 ft", factor 12) inside lessons that are metric-only (factor 100 /
1000). Removed the `figure` key from `remedials[0].concept` in both files — nothing else in that
object touched. Confirmed post-edit `remedials[0].concept` in both files now byte-matches the
committed `HEAD` version of that object exactly (the false figure attachment turns out to have been
introduced only in the uncommitted working tree, not in the last commit).

**Note — re-opened figure debt:** `rem-g4v-unit-size-c` (g4v-01-01) and `rem-g4v-length-c`
(g4v-01-03) now have **no** attached figure. This is honest open debt (missing visual), not a live
defect (false visual), consistent with the instruction that a missing figure is preferable to a
false one. Both lessons' main-route `c2` step still separately carries the same imperial
`rr-conversion` figure — that is a pre-existing, out-of-scope defect (documented in the source
verification report) and was left untouched.

## Gates

Per instruction, `npm run typecheck`, `npx vitest run`, `npm run validate:content`,
`npm run lint:pedagogy`, `npm run validate:native`, `node scripts/check-registration.mjs`, and the
build were **not run**. All 18 touched files were parse-checked with `python3 -c "import json;
json.load(open(...))"` — all pass. No packet in this batch should be declared landed on the strength
of this report alone.

## Files

- `reports/closure/cowork-staging/laneA-residuals-2.jsonl` — 18 NDJSON records, one per lesson.
- This report: `reports/closure/S316_RESIDUAL_FIXES_2.md`.
- Content files touched (18): `content/courses/add-subtract-10-k/lessons/{koa-01-01,koa-01-02,koa-01-03,koa-01-04,koa-01-05,koa-03-01,koa-03-02,koa-03-03,koa-03-05,koa-03-06,koa-03-07,koa-03-08,koa-03-09,koa-03-10}.json`,
  `content/courses/decimal-fluency-g5/lessons/g5d-01-03.json`,
  `content/courses/bivariate-statistics/lessons/bv-04-02.json`,
  `content/courses/measure-problems-g4/lessons/{g4v-01-01,g4v-01-03}.json`.
