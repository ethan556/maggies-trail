# S317 Lane B — Place Value implementation

Implementation of the 12 REVISE contracts from `reports/closure/S316_LANEB_PLACE_VALUE_ASSESSMENT.md`
and `reports/closure/cowork-staging/laneB-place-value-dispositions.jsonl`. Scope: the 12 lesson
JSON files (`content/courses/place-value/lessons/{pv-01-01,pv-01-03,pv-02-01,pv-02-02,pv-02-03,
pv-02-04,pv-03-01,pv-03-02,pv-03-03,pv-03-04,pv-04-02,pv-04-03}.json`) plus additive work in
`src/components/figures.tsx` / `src/components/figureIds.ts` for the two lessons whose contract
required a new figure. Per-lesson NDJSON: `reports/closure/cowork-staging/laneB-pv-implementation.jsonl`.

## Summary of changes

- **4 figure/prose contradictions fixed by realigning prose to the figure** (smallest-diff path,
  decision rule (a) — none of these lessons' later checks depended on the specific numbers in the
  contradicting concept step): pv-01-01 c1, pv-01-03 c1, pv-02-02 c1, pv-03-01 c1.
- **2 off-topic figure reuses fixed by building new additive figures** (decision rule (b) — the
  lessons' own checks/interactives are all two-addend estimation problems using specific number
  pairs, so realigning prose to the existing single-number `pv3-round-hundred` figure would have
  required discarding the visual promise entirely): pv-02-04 c1 → new `pv3-estimate-add-pair`,
  pv-03-04 c1 → new `pv3-estimate-sub-pair`.
- **13 MCQ length-leaks rebalanced** across all 12 lessons per the contract's per-lesson step list
  (`pv-01-03` k1/k2, `pv-02-01` k3, `pv-02-02` k1, `pv-02-03` k1, `pv-02-04` k1/k3, `pv-03-02` k1,
  `pv-03-03` k1, `pv-03-04` k1/k3, `pv-04-02` k1, `pv-04-03` k3).
- **1 false-feedback defect fixed**: pv-03-01 k2's commonError trap value corrected from 545 to
  546 so the stated misconception ("repaid 10 instead of 1") is now literally true of the
  flagged value.
- In every case: option `correct` flags, feedback text truth, widget types, evaluator behavior,
  conceptTags, and IDs were preserved unchanged except where the contract explicitly required a
  value change (pv-03-01 k2's trap value).

## Per-lesson detail

### pv-01-01 — figure/prose contradiction
`c1` described 347 ("3 parks in hundreds, 4 in tens, 7 in ones") beside `pv3-place-chart`, which
is hardcoded to render 342 (3 hundreds, 4 tens, **2** ones — `Pv3PlaceChart` in `figures.tsx`).
Changed the worked example to 342, matching the figure's rendered digits exactly. No other step
touched (no length-leak finding for this lesson).

### pv-01-03 — figure/prose contradiction + 2 length-leaks
`c1` described "452 vs 449: hundreds tie, tens differ, 452 wins" beside `pv3-compare`, hardcoded
to 342 vs 328. Changed the worked example to "342 vs 328: hundreds tie (3=3), tens differ (4>2)
— 342 wins," preserving the identical comparison logic; `c2`, which already correctly narrates
342 > 328, needed no change.

`k1` (option lengths 64/29/23/33, correct 31 chars longer than next-longest) and `k2` (62/21/39/47,
correct 15 chars longer) rebalanced by shortening the correct option's justification clause and
lengthening distractors to comparable length, preserving each distractor's misconception and
matching feedback:
- k1: 64/29/23/33 (spread 41) → 40/41/41/39 (spread 2)
- k2: 62/21/39/47 (spread 41) → 44/43/45/47 (spread 4)

### pv-02-01 — length-leak only
`k3`: 47/20/37/35 (spread 27, correct longest) → 42/40/38/41 (spread 4).

### pv-02-02 — figure/prose contradiction (highest severity in course) + length-leak
`c1` taught "368 lives between 300 and 400 ... rounds to 400" beside `pv3-round-hundred`, hardcoded
to 349 rounding **down** to 300 — the opposite rounding direction. Changed the worked example to
"349 lives between 300 and 400. It's 49 steps past 300 but 51 steps short of 400 — so 349 rounds
down to 300," matching the figure's own text ("349 rounds to 300, not 400"). Verified: 400−349=51,
349−300=49, 49<51 so the closer neighbor is 300. `c2` (the lesson's "classic trap" reinforcement of
the same 349→300 fact) was already correct and unchanged; it now reinforces rather than
contradicts `c1`.

`k1`: 55/18/22/38 (spread 37, correct longest) → 37/38/41/44 (spread 7, correct now shortest).

### pv-02-03 — length-leak only
`k1`: 74/20/27/32 (spread 54, largest gap in the course) → 44/37/38/39 (spread 7).

### pv-02-04 — off-topic figure reuse (new figure built) + 2 length-leaks
`c1` introduces "round the players first, then compute" for story estimation, but its figure was
`pv3-round-hundred` — a single-number rounding-to-hundred figure (349→300) illustrating a
different, simpler sub-skill than the two-addend estimation this lesson (and its `i1`/`k2`/`ch1`
checks) actually teach. Per the decision rule, because the lesson's own checks are all two-addend
problems with specific number pairs (i1: 289+512≈800; k2: 512−289≈200; ch1: 385+428≈800), prose
realignment to the existing figure would have required moving the estimation story out of `c1`
entirely — discarding the visual promise. Built a new additive, typed figure instead:

```
function Pv3EstimatePairFigure({ a, aRounded, aDir, b, bRounded, bDir, op, result }: {...})
```
(reusable, house-pattern typed props) with two lesson-specific wrappers, `Pv3EstimateAddPair` and
`Pv3EstimateSubPair`, registered as `pv3-estimate-add-pair` and `pv3-estimate-sub-pair` in the
`FIGURES` map and regenerated into `figureIds.ts` via `node scripts/gen-figure-ids.mjs`. Each
`role="img"` SVG carries a `<title>` and an `aria-label` stating the real numbers and rounding
direction in words (non-colour cue), e.g. "289 rounds up to 300, 512 rounds down to 500 ... 300
plus 500 equals 800."

Rebound `c1.figure` to `pv3-estimate-add-pair`, matching `i1`'s exact numbers (289, 512, target
800) one step later. Verified: 289 is 89 past 200 / 11 short of 300 → rounds up to 300; 512 is 12
past 500 / 88 short of 600 → rounds down to 500; 300+500=800.

`k1`: 68/40/35/30 (spread 38) → 49/44/40/40 (spread 9).
`k3`: 72/40/42/36 (spread 36) → 47/40/42/43 (spread 7).

### pv-03-01 — figure/prose contradiction + false feedback
`c1` walked through "268 + 47 via +2/+40/+5 hops to 315" beside `pv3-jump`, hardcoded to an
unrelated problem: 47 + 23 via a single +3 hop to a target of 70. Changed the worked example to
"47 + 23: hop +3 to land on 50 (friendly!), then the leftover +20 to 70," matching the figure
exactly (47+3=50, 50+20=70, total +23). `k1`, which independently tests the same friendly-jump
strategy on 268+47 with its own answer options, is untouched and needed no change (it isn't tied
to any figure).

`k2`'s `commonErrors` entry for value 545 claimed the misconception "repaid 10 instead of 1 [after
overshooting +100 instead of +99]" — but 456+100=556, and 556−10=546, not 545; the stated
arithmetic does not produce 545. Recomputed and confirmed 546 is what that exact named
misconception produces, with no plausible alternate mistake found that produces 545 under this
label. Changed the trap value from 545 to 546 (keeping the feedback text, which is now literally
true) rather than inventing new feedback for 545, since 546 is the value the stated
misconception actually computes to and this preserves the intended pedagogical point with the
smallest change.

### pv-03-02 — length-leak only
`k1`: 70/26/36/49 (spread 44) → 43/43/43/45 (spread 2).

### pv-03-03 — length-leak only
`k1`: 67/38/47/29 (spread 38) → 50/38/47/37 (spread 13).

### pv-03-04 — off-topic figure reuse (new figure built) + 2 length-leaks
Same pattern as pv-02-04: `c1` introduces the guard-estimate workflow for 512−289=223 (guard
500−300=200) but reused `pv3-round-hundred` (349→300), an unrelated single-number figure. Built
`Pv3EstimateSubPair` (reusing the same `Pv3EstimatePairFigure` component with `op="−"`), depicting
512→500 (rounds down) and 289→300 (rounds up) combined to 200 — c1's own worked numbers exactly.
Registered as `pv3-estimate-sub-pair`, rebound `c1.figure`. `c2`, which already correctly narrates
`pv3-round-hundred`'s own content ("the figure shows 349 rounding to 300 ... 350"), was left
untouched and still points at `pv3-round-hundred`. Verified: 512 is 12 past 500 / 88 short of 600
→ rounds down to 500; 289 is 89 past 200 / 11 short of 300 → rounds up to 300; 500−300=200.

`k1`: 56/46/31/21 (spread 35) → 50/46/44/41 (spread 9).
`k3`: 70/40/38/34 (spread 36) → 44/44/42/41 (spread 3).

### pv-04-02 — length-leak only
`k1`: 76/64/42/34 (spread 42) → 47/50/42/43 (spread 8, correct no longer uniquely longest).

### pv-04-03 — length-leak only
`k3`: 53/36/35/31 (spread 22) → 44/45/41/43 (spread 4, correct no longer uniquely longest).

## Length-spread statistics (13 rebalanced MCQs)

| Lesson/step | Before spread | Before correct-len | After spread | After correct-len |
|---|---|---|---|---|
| pv-01-03 k1 | 41 | 64 (longest) | 2 | 40 |
| pv-01-03 k2 | 41 | 62 (longest) | 4 | 44 |
| pv-02-01 k3 | 27 | 47 (longest) | 4 | 42 (longest, but spread 4) |
| pv-02-02 k1 | 37 | 55 (longest) | 7 | 37 (shortest) |
| pv-02-03 k1 | 54 | 74 (longest) | 7 | 44 (longest, but spread 7) |
| pv-02-04 k1 | 38 | 68 (longest) | 9 | 49 (longest, but spread 9) |
| pv-02-04 k3 | 36 | 72 (longest) | 7 | 47 (longest, but spread 7) |
| pv-03-02 k1 | 44 | 70 (longest) | 2 | 43 |
| pv-03-03 k1 | 38 | 67 (longest) | 13 | 50 (longest, but spread 13) |
| pv-03-04 k1 | 35 | 56 (longest) | 9 | 50 (longest, but spread 9) |
| pv-03-04 k3 | 36 | 70 (longest) | 3 | 44 |
| pv-04-02 k1 | 42 | 76 (longest) | 8 | 47 (not longest) |
| pv-04-03 k3 | 22 | 53 (longest) | 4 | 44 (not longest) |

Every rebalanced MCQ now has a max−min label-length spread ≤ 15 characters (all ≤ 13; largest
remaining is pv-03-03 k1 at 13), satisfying the target even where the correct option remains
nominally longest. `correct` flags, feedback text, and option order (correct first) are unchanged
in all 13 cases; only distractor/correct label wording length was adjusted, preserving every
distractor's original misconception and keeping every feedback string literally true of its
option's (possibly reworded but semantically identical) label.

## Arithmetic verification (figure/prose fixes)

- pv-01-01: 342 = 3 hundreds + 4 tens + 2 ones — matches `Pv3PlaceChart(hundreds=3, tens=4, ones=2)`.
- pv-01-03: 342 vs 328 — hundreds tie (3=3), tens 4>2, so 342 wins — matches `Pv3Compare`.
- pv-02-02: 349 is 49 past 300, 51 short of 400 (400−349=51); 49<51 → rounds down to 300 — matches
  `Pv3RoundHundred`.
- pv-03-01: 47+3=50, 50+20=70, hops total +23 — matches `Pv3Jump` (47+23, +3 hop, target 70).
- pv-03-01 k2: 456+100=556 (overshoot); 556−10=546 (repay-10-instead-of-1 misconception) — the
  commonError feedback for value 546 is now literally true.
- pv-02-04 new figure: 289 is 89 past 200 / 11 short of 300 → rounds up to 300; 512 is 12 past 500
  / 88 short of 600 → rounds down to 500; 300+500=800 — matches i1's `target: 800` and the
  predict block's `outcomeId: "eight"`.
- pv-03-04 new figure: 512 is 12 past 500 / 88 short of 600 → rounds down to 500; 289 is 89 past
  200 / 11 short of 300 → rounds up to 300; 500−300=200 — matches c1's own stated guard workflow.

## Gates run

- `npx vitest run src/components/pvFigures.s317.test.tsx` — **4/4 passed** (verifies both new
  figures are registered, render with `role="img"` and a `<title>`, state the real numbers/
  rounding directions in their accessible channels, no longer render the foreign 349 example, and
  that `pv-02-04`/`pv-03-04` `c1` are rebound while `pv-03-04` `c2` is untouched).
- `node scripts/check-registration.mjs` — **pass** ("files ↔ course.json ↔ PLAN.md all consistent").
- `npx tsc --noEmit` — **clean, no output**.
- All 12 edited lesson JSON files independently re-parsed with `python3 -m json.tool` equivalent —
  all valid.

One unrelated, pre-existing condition observed during a bonus (non-required) sanity run of
`src/lib/session277.placeValueP0Disjoint.test.tsx`: that file currently fails to load with
`ReferenceError: Cannot access 'BarDataSpec' before initialization` in `src/lib/schema.ts`. `git
diff` confirms this is an uncommitted, in-progress edit from a **concurrent S317 lane** (adding a
`BarDataSpec` for the unrelated `measurement-data` bar-graph course) that this packet never
touched and is out of this packet's scope (`schema.ts` is not an owned or additive file for this
packet). Not caused by, and not fixable within, this packet.

## Files changed

- `content/courses/place-value/lessons/pv-01-01.json`
- `content/courses/place-value/lessons/pv-01-03.json`
- `content/courses/place-value/lessons/pv-02-01.json`
- `content/courses/place-value/lessons/pv-02-02.json`
- `content/courses/place-value/lessons/pv-02-03.json`
- `content/courses/place-value/lessons/pv-02-04.json`
- `content/courses/place-value/lessons/pv-03-01.json`
- `content/courses/place-value/lessons/pv-03-02.json`
- `content/courses/place-value/lessons/pv-03-03.json`
- `content/courses/place-value/lessons/pv-03-04.json`
- `content/courses/place-value/lessons/pv-04-02.json`
- `content/courses/place-value/lessons/pv-04-03.json`
- `src/components/figures.tsx` (additive: `Pv3EstimatePairFigure`, `Pv3EstimateAddPair`,
  `Pv3EstimateSubPair`, and their `FIGURES` map registrations)
- `src/components/figureIds.ts` (regenerated via `node scripts/gen-figure-ids.mjs`)
- `src/components/pvFigures.s317.test.tsx` (new test file)

Per-lesson machine-readable detail: `reports/closure/cowork-staging/laneB-pv-implementation.jsonl`.

This is an implementation packet; per the authority contract, it cannot assess or close its own
work. Returned for independent assessment.
