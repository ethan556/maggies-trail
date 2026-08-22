# S318 Lane A — K2 WITHHELD Figure Clearance
# (counting-to-100-k, add-subtract-1000-g2, measure-money-time, place-value)

Prefix ID: `MT-V4-WORKER-PREFIX-1` (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, applied byte-for-byte).
Repository source (`content/courses/**`, `src/lib/figureTextAlignment.ts`,
`src/lib/figureTextMismatchBlocklist.generated.ts`, `src/lib/figureNumericParity.ts`,
`src/lib/figureNumericClaims.generated.ts`, `src/components/figures.tsx`) is authoritative.
`reports/vis/VIS01_PLACEMENTS.csv` is the source-matched evidence for this packet's scope; the
S317 report (`reports/closure/S317_FIGURE_TRUTH_FIXES.md`) is the proven method reused here.

Worker: Claude Cowork implementation. Scope this round: content only — no file under `src/` was
touched (see "Untouched / explicitly out of scope"). Owned files: the 8 named lesson JSONs, this
report, and `reports/closure/cowork-staging/laneA-s318-k2-figures.jsonl`.

## Scope enumeration

Filtering `reports/vis/VIS01_PLACEMENTS.csv` for `cause != RENDERS` and `file` under the four
named courses gives exactly 13 placements across 8 lessons, matching the packet's stated counts
(9 + 2 + 1 + 1 = 13):

| Course | Lesson | Placements (step path / step id) | Figure | Cause |
|---|---|---|---|---|
| counting-to-100-k | k100-01-03 | steps.0/c1 | chart-120 | WITHHELD_BLOCKLIST_FINGERPRINT |
| counting-to-100-k | k100-02-05 | steps.0/c1, steps.3/c2, remedials.0.concept | tno-count-down-tens | WITHHELD_BLOCKLIST_FINGERPRINT |
| counting-to-100-k | k100-03-03 | steps.0/c1 | chart-120 | WITHHELD_BLOCKLIST_FINGERPRINT |
| counting-to-100-k | k100-03-05 | steps.0/c1 | chart-rows | WITHHELD_BLOCKLIST_FINGERPRINT |
| counting-to-100-k | k100-03-06 | steps.0/c1, steps.3/c2, remedials.0.concept | c120-missing-order | WITHHELD_BLOCKLIST_FINGERPRINT |
| add-subtract-1000-g2 | g2b-02-06 | steps.3/c2, remedials.0.concept | skip-count-line | WITHHELD_BLOCKLIST_FINGERPRINT |
| measure-money-time | mmt-03-02 | steps.3/c2 | mmt-biggest-first | WITHHELD_BLOCKLIST_FINGERPRINT |
| place-value | pv-03-02 | steps.0/c1 | pv3-regroup | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD |

All 13 are `WITHHELD_BLOCKLIST_FINGERPRINT` except pv-03-02/c1, which is
`WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD`.

## Method (per S317's proven protocol)

For every placement: (1) read the figure component in `src/components/figures.tsx` and the
lesson step's body side by side; (2) confirm the figure and body already tell the *same* story
(true in all 13 cases — no figure was semantically wrong for its step, so no rebind/new-figure
case and no fail-close was needed this round); (3) recompute the live binding key against the
repository's own `figureTextAlignment.ts`/`figureTextMismatchBlocklist.generated.ts` (and, for
pv-03-02, `figureNumericParity.ts`/`figureNumericClaims.generated.ts`) to confirm the withhold is
real and reproducible; (4) write a minimal, truth-preserving reword that keeps every number and
relationship the figure shows, changing only phrasing so the new binding key is not a member of
the (source-controlled, monotonic, never hand-edited) blocklist; (5) recompute against the same
modules to confirm the new binding is aligned and unblocklisted.

`src/lib/figureTextMismatchBlocklist.generated.ts` and `.manualHolds.ts` were **not edited** —
neither file contains any entry naming these 8 lessons (checked by grep before starting), so no
manual-hold prune was needed this round, unlike S317's cpr-03-03 follow-up.

## Per-placement resolution

### 1. counting-to-100-k / k100-01-03 (`c1`, `chart-120`)

**WITHHELD_BLOCKLIST_FINGERPRINT → REWORDED_PROSE_OFF_STALE_FINGERPRINT.** `Chart120` renders the
full 1–120 chart with 47 highlighted, its row 41–50 tinted blue, its ones-digit column tinted
orange. c1's original body ("The blue chart row runs from 41 to 50. Read across from 41, 42, 43
to 50.") already named exactly the blue row the figure shows — recomputing
`figureTextBindingKey("chart-120", <original body>)` gives `26579258`, confirmed present in
`FIGURE_TEXT_MISMATCH_BLOCKLIST`: a stale fingerprint, not a live mismatch. Reworded to:

> "The forties row runs 41, 42, 43, all the way across to 50. Reading left to right names every
> number in the row in order."

Same row (41–50), same reading-order relationship; no new claim beyond what the figure shows
(deliberately did not add the figure's column/ones-digit detail, since nothing else in this
lesson — i1/k1/c2/i2/k2/k3/ch1 — touches that idea; keeping the smallest diff). New key `fea9978b`
is not in the blocklist.

### 2. counting-to-100-k / k100-02-05 (`c1`, `c2`, `remedials.0.concept`, `tno-count-down-tens`)

**WITHHELD_BLOCKLIST_FINGERPRINT (×3) → REWORDED_PROSE_OFF_STALE_FINGERPRINT.**
`TnoCountDownTens` renders 65, 55, 45, 35 with a "−10" mark between each pair. Two distinct
original bodies were both stale-blocklisted:
- c1: "Count backward by 10: 65, 55, 45, 35. Each hop subtracts 10." → key `3f06dfd2` (blocklisted).
- c2 and `remedials.0.concept` (byte-identical to each other): "Follow the line backward by 10:
  65, 55, 45, 35." → key `10de637b` (blocklisted).

Reworded c1 to: "Follow the numbers: 65, 55, 45, 35. Each hop back lands one whole ten lower — 65
minus 10 minus 10 minus 10 is 35." (new key `3834aa07`, not blocklisted).

Reworded c2 and `remedials.0.concept` together (kept identical to each other, matching the
lesson's own authoring pattern) to: "Track the count going backward: 65, 55, 45, 35. Every step
down the line takes away a whole ten." (new key `bfe98b11`, not blocklisted).

### 3. counting-to-100-k / k100-03-03 (`c1`, `chart-120`)

**WITHHELD_BLOCKLIST_FINGERPRINT → REWORDED_PROSE_OFF_STALE_FINGERPRINT.** Same `Chart120`
figure as #1. Original body: "The blue row continues 41 through 50. After 46 come 47, 48, and
49." Reworded to:

> "This blue row keeps going past 46: 47, 48, 49, straight to 50. Reading across the row is how
> the count continues."

Same numbers (46, 47, 48, 49, 50), same relationship. New key `2254a555`, not blocklisted.

### 4. counting-to-100-k / k100-03-05 (`c1`, `chart-rows`)

**WITHHELD_BLOCKLIST_FINGERPRINT → REWORDED_PROSE_OFF_STALE_FINGERPRINT.** `ChartRows` renders
the first three chart rows (1–30) with each row's ending multiple of ten highlighted; its title
states the general rule ("Each row holds ten numbers and ends in a zero — ten, twenty, thirty").
Original c1 body: "The third chart row ends 29, 30. The next row begins 31." — this already
applies exactly that rule to the third row (21–30, ends 29 then 30) and the row after it (starts
31, one more than 30). Reworded to:

> "The third row ends with 29 then 30. The next row after it starts at 31, one more than the row
> that just ended."

Same three numbers, same row-boundary relationship the figure's own title generalizes. New key
`780408b5`, not blocklisted. (The lesson's `i1`/`k2`/`ch1` steps separately bind `c120-chart-row`
and `chart-120`, both `RENDERS` already and untouched here.)

### 5. counting-to-100-k / k100-03-06 (`c1`, `c2`, `remedials.0.concept`, `c120-missing-order`)

**WITHHELD_BLOCKLIST_FINGERPRINT (×3) → REWORDED_PROSE_OFF_STALE_FINGERPRINT.**
`C120MissingOrder` renders 42, 43, a highlighted "?" square, 45, with a printed "? = 44" label.
Two distinct original bodies were both stale-blocklisted:
- c1: "The pictured row is 42, 43, ?, 45. Count one more after 43 to find 44."
- c2 and `remedials.0.concept` (byte-identical): "Read the pictured row: 42, 43, ?, 45. The
  missing number is 44."

Reworded c1 to: "The pictured row runs 42, 43, then the hidden square, then 45. Between 43 and
45 sits one number: 44." (new key `a2c6a475`, not blocklisted).

Reworded c2 and `remedials.0.concept` together (kept identical) to: "Read the pictured row in
order: 42, 43, hidden square, 45. Counting on from 43 fills the hidden square with 44." (new key
`8d4ae737`, not blocklisted).

### 6. add-subtract-1000-g2 / g2b-02-06 (`c2`, `remedials.0.concept`, `skip-count-line`)

**WITHHELD_BLOCKLIST_FINGERPRINT (×2) → REWORDED_PROSE_OFF_STALE_FINGERPRINT.** `SkipCountLine`
renders 200, 300, 400, 500, 600 with "+100" between each pair; title: "only the hundreds digit
changes each time." c2 and `remedials.0.concept`'s shared original body — "Start at 200 and add
100 each time: 200, 300, 400, 500, 600. Only the hundreds digit changes." — already stated
exactly the figure's claim (key `90c2bb3d`, confirmed blocklisted). Reworded (both placements,
kept identical) to: "Skip-count by hundreds from 200: 200, 300, 400, 500, 600. Each +100 hop only
slides the hundreds digit." New key `d5ff812b`, not blocklisted. The `narration` field (which was
byte-identical text to the old body) was left untouched, since narration is audio-only guidance
and is not part of the figure/text alignment gate.

### 7. measure-money-time / mmt-03-02 (`c2`, `mmt-biggest-first`)

**WITHHELD_BLOCKLIST_FINGERPRINT → REWORDED_PROSE_OFF_STALE_FINGERPRINT.** `MmtBiggestFirst`
renders three coins labeled 25, 50, 75; title: "quarters go twenty-five, fifty, seventy-five."
Original c2 body: "Starting with the biggest coin keeps skip-counting simple: 25, 50, 75 for
quarters is easier than adding pennies one at a time up to 75." (key `436e5862`, confirmed
blocklisted). Reworded to: "Skip-counting the biggest coin first keeps the total simple: quarters
climb 25, 50, 75 in three easy steps instead of many single pennies." New key `73fa2355`, not
blocklisted.

### 8. place-value / pv-03-02 (`c1`, `pv3-regroup`)

**WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD → TEXT_RESTATES_FIXED_VALUES.** `pv3-regroup` is a fixed
numeric exemplar registered both in `FIXED_NUMERIC_EXEMPLAR_CONTRACTS` (claim: "7 + 5 = 12; 12
ones = 1 ten 2 ones.") and the generated `FIGURE_NUMERIC_CLAIMS` (rendered claim: "7 + 5 = 12
ones = 1 ten 2 ones"). Once adjacent prose makes its own explicit numeric claim,
`isFigureTextAligned` requires every atom the figure states to reappear in the text. c1's original
body ("Add 47 + 25 and the ones pile up: 7 + 5 = 12 ones ... 10 of those ones trade up into 1
ten. ...") does make an explicit claim (it has `=`, and several numeric atoms), so the guard
fired. Recomputed directly against the real module:
`compareExactFigureNumericParity("7 + 5 = 12 ones = 1 ten 2 ones", <original c1 body>)` returns
`figureAtoms=[7,5,12,1,2]`, `textAtoms` missing `2`, `reasons=["EXACT_RENDERED_VALUE_MISMATCH[missing=2]"]`,
`aligned=false` — the body describes the ten trading up but never states the "2 ones" the figure
explicitly renders and labels as remaining. Reworded by inserting "leaving 2 ones behind" after
"trade up into 1 ten":

> "Add 47 + 25 and the ones pile up: 7 + 5 = **12 ones** — too many for one spot, which holds at
> most 9. So the trading post from chapter 1 opens: 10 of those ones trade up into 1 ten, leaving
> 2 ones behind. \"Carrying\" isn't a new skill — it's the ten-for-one trade, running uphill."

Same 47 + 25 example, same 7 + 5 = 12 arithmetic, same ten-for-one-trade framing; new key
`610a669d`, `isFigureTextAligned("pv3-regroup", <new body>)` is now `true`.

## Fail-closed placements

None. All 13 placements had a figure that was semantically correct for its step — the withholds
were entirely stale blocklist fingerprints (12 of 13) or a missing exact-number restatement (1 of
13), both cleared by truth-preserving reword. No figure needed rebinding, no new component was
required, and no placement was left withheld.

## Verification — binding recomputation

Recomputed against the repository's own modules (`src/lib/figureTextAlignment.ts`,
`src/lib/figureTextMismatchBlocklist.generated.ts`, and — for pv-03-02 —
`src/lib/figureNumericParity.ts` / `src/lib/figureNumericClaims.generated.ts`) via
`npx tsx` one-liners that import those modules directly (the same code path
`LessonPlayer.tsx`/`FigureView.tsx` gate rendering on), reading the *live* JSON files by step path
after editing:

```
{"label":"k100-01-03/c1","figure":"chart-120","key":"fea9978b","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/c1","figure":"tno-count-down-tens","key":"3834aa07","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/c2","figure":"tno-count-down-tens","key":"bfe98b11","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/remedials.0.concept","figure":"tno-count-down-tens","key":"bfe98b11","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-03/c1","figure":"chart-120","key":"2254a555","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-05/c1","figure":"chart-rows","key":"780408b5","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/c1","figure":"c120-missing-order","key":"a2c6a475","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/c2","figure":"c120-missing-order","key":"8d4ae737","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/remedials.0.concept","figure":"c120-missing-order","key":"8d4ae737","aligned":true,"blocklisted":false,"pass":true}
{"label":"g2b-02-06/c2","figure":"skip-count-line","key":"d5ff812b","aligned":true,"blocklisted":false,"pass":true}
{"label":"g2b-02-06/remedials.0.concept","figure":"skip-count-line","key":"d5ff812b","aligned":true,"blocklisted":false,"pass":true}
{"label":"mmt-03-02/c2","figure":"mmt-biggest-first","key":"73fa2355","aligned":true,"blocklisted":false,"pass":true}
{"label":"pv-03-02/c1","figure":"pv3-regroup","key":"610a669d","aligned":true,"blocklisted":false,"pass":true}
ALL 13 PLACEMENTS PASS
```

All 13 (`aligned === true`, `blocklisted === false`) — matches the CSV row count exactly (9 + 2 +
1 + 1).

### Word-count check (concept-body 80-word cap)

All touched bodies are `kind: "concept"` steps (or a `remedials[].concept`, the same rule). Word
counts of the new bodies: k100-01-03/c1 = 25; k100-02-05/c1 = 25; k100-02-05/c2 &
remedials.0.concept = 19; k100-03-03/c1 = 22; k100-03-05/c1 = 24; k100-03-06/c1 = 20;
k100-03-06/c2 & remedials.0.concept = 21; g2b-02-06/c2 & remedials.0.concept = 18;
mmt-03-02/c2 = 23; pv-03-02/c1 = 59. All ≤ 80.

### JSON parse check

All 8 touched lesson files parse as valid JSON (`python3 -c "json.load(open(f))"` on each,
confirmed after every edit).

## Gate outputs

`src/` was not touched in this packet (content-only edits), so `node scripts/check-registration.mjs`
and `npx tsc --noEmit` are not required by the packet's own conditional ("IF you touched src") and
were not run. `npx tsx scripts/audit/vis01-illustration-measurement.mts` was **not** run, per the
packet's explicit prohibition (single-writer; integrator-only).

## Changed files

- `content/courses/counting-to-100-k/lessons/k100-01-03.json` — `c1.body` reworded (figure/IDs/
  conceptTag/evaluator unchanged).
- `content/courses/counting-to-100-k/lessons/k100-02-05.json` — `c1.body`, `c2.body`,
  `remedials[0].concept.body` reworded (2 distinct new bodies; figure/IDs/conceptTag/evaluator
  unchanged).
- `content/courses/counting-to-100-k/lessons/k100-03-03.json` — `c1.body` reworded.
- `content/courses/counting-to-100-k/lessons/k100-03-05.json` — `c1.body` reworded.
- `content/courses/counting-to-100-k/lessons/k100-03-06.json` — `c1.body`, `c2.body`,
  `remedials[0].concept.body` reworded (2 distinct new bodies).
- `content/courses/add-subtract-1000-g2/lessons/g2b-02-06.json` — `c2.body`,
  `remedials[0].concept.body` reworded (1 shared new body; `narration` fields left untouched).
- `content/courses/measure-money-time/lessons/mmt-03-02.json` — `c2.body` reworded.
- `content/courses/place-value/lessons/pv-03-02.json` — `c1.body` reworded (inserted "leaving 2
  ones behind").
- `reports/closure/S318_K2_WITHHELD_CLEARANCE.md` — this report.
- `reports/closure/cowork-staging/laneA-s318-k2-figures.jsonl` — 8 `lesson-fix` records (one per
  lesson; k100-02-05, k100-03-06, and g2b-02-06 each bundle their multi-placement fix into a
  single record since the fix is one reword applied to a shared or paired body).

## Untouched / explicitly out of scope

No file under `src/` was touched: `src/components/figures.tsx` (all 8 figure components read but
not edited), `src/components/figureIds.ts`, `src/lib/figureTextAlignment.ts`,
`src/lib/figureTextMismatchBlocklist.generated.ts`, `src/lib/figureTextMismatchBlocklist.manualHolds.ts`
(checked — no entry names any of these 8 lessons, so nothing to prune this round),
`src/lib/figureNumericParity.ts`, `src/lib/figureNumericClaims.generated.ts` were all read-only
dependencies. `content/courses/measure-problems-g4/lessons/g4v-01-01.json`,
`g4v-01-02.json`, and `g4v-02-02.json` were found already modified in the working tree by a
different concurrent lane (confirmed via untracked `probe_s318*.mts` scratch files at repo root
referencing `mc-length-ladder`/`g4v-clock-60` figures, outside this packet's 4 named courses) —
not touched, not reviewed, and not reverted; out of this packet's ownership.

## Return

`packet_id=S318-K2-WITHHELD-CLEARANCE, base_commit=feb69a1 (HEAD at session start), role=implementation-worker, status=complete, scope_ids=13 placements / 8 lessons, gates_passed=[jsonParse x8, isFigureTextAligned x13, blocklistAbsence x13, wordCountLte80 x10 bodies], gates_failed=[], cache_invalidations=[reports/vis/VIS01_PLACEMENTS.csv rows for these 13 placements are now stale (cause was WITHHELD_*, now would resolve RENDERS on next audit pass) — regeneration owned by the integrator's vis01-illustration-measurement run, not this packet], new_decision_required=none, risks=[none identified; all 13 clearances were reword-only, no figure rebind or new component], next_owner=integrator (re-run npx tsx scripts/audit/vis01-illustration-measurement.mts to confirm all 13 now RENDERS and refresh VIS01_PLACEMENTS.csv)`

---

## Addendum — adversarial candidate-scanner follow-up (post-clearance)

The coordinator reported that `src/components/figureTextAdversarialAudit.test.tsx`'s `risks()`
heuristic (a separate, independent scan — same class as the `S316_GATE_RECONCILIATION`
`OPERATION_CONFLICT` false-positive) flagged 15 new candidate binding keys after this packet's
clearance, and that all 15 traced to this packet's edits. That claim was checked directly rather
than assumed.

### How `risks()` differs from the alignment/blocklist gate

`risks()` (in the test file) independently extracts number/operation/fraction-part "atoms" from
(a) the figure's own rendered `<title>`/`aria-label` text and (b) the adjacent lesson body, using
its own word-boundary regexes over a 0–20 number-word map — **not** the same atom logic as
`src/lib/figureTextAlignment.ts`/`figureNumericParity.ts` used for the alignment/blocklist gate
verified above. If the two atom sets are both non-empty and share zero elements, it emits an
`EXAMPLE_NUMBER_CONFLICT` (or `OPERATION_CONFLICT`/`PART_COUNT_CONFLICT`) "candidate", which then
fails `figureTextAdversarialAudit.test.tsx`'s own `blocklistCandidateKeys.every(key =>
FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key))` assertion (a brand-new candidate key that legitimately
isn't in the source-controlled blocklist yet — and per the packet's own rules, that blocklist is
never hand-edited, so the fix has to be on the text side).

### Enumeration (ad hoc probe, not `tsx scripts/audit/...`)

Wrote a throwaway vitest test file (`src/components/s318RisksProbe.test.tsx`, under
`src/**/*.test.tsx` so it could import the real modules through the project's own Vite/React
transform — a plain `npx tsx` script failed on JSX/module resolution) that replays
`figureTextAdversarialAudit.test.tsx`'s exact `description()`/`namedPartCounts()`/
`operationSet()`/`exampleNumbers()`/`disjoint()`/`risks()`/`collect()` functions verbatim against
every lesson in `content/courses/**`, filtered to this packet's lessons. Ran it via
`npx vitest run src/components/s318RisksProbe.test.tsx --reporter=verbose`, read the console
output, then **deleted the probe file** (throwaway, not a deliverable).

Result: **11 of the 15** repo-wide candidates traced to this packet's 6 touched lessons (not all
15 — see "Scope correction" below). All 11 were `EXAMPLE_NUMBER_CONFLICT`s: the figure's own
title spells its numbers as words ("forty-seven", "two hundred", "twenty-five"), which the
heuristic's word-boundary regex parses into small bare digits (7, 2, 20, 5, …) — sometimes from
inside a hyphenated compound ("Forty-**seven**" → 7) — while the reworded lesson bodies (correctly,
for elementary readability) used Arabic numerals for the *actual* taught quantities (41, 47, 65,
200, 25 …), which are numerically disjoint from the figure's small word-parsed atoms even though
both describe the identical relationship. This is exactly the documented false-positive class.

### Per-body fix (truth-preserving, ≤80 words, re-verified aligned + unblocklisted after each)

| Lesson / step(s) | Heuristic trigger (before) | Fix | New risk_reasons | New binding key |
|---|---|---|---|---|
| k100-01-03 `c1` | `EXAMPLE_NUMBER_CONFLICT[figure=1+7+10+12+20;text=41+42+43+50]` | Added the true fact "...50, ten numbers in one row..." — supplies word-atoms 10 and 1 | `[]` | `a1755d73` |
| k100-03-03 `c1` | `EXAMPLE_NUMBER_CONFLICT[figure=1+7+10+12+20;text=46+47+48+49+50]` | Added "...50 — ten numbers, one full row..." — supplies 10 and 1 | `[]` | `58af580a` |
| k100-02-05 `c1` | `EXAMPLE_NUMBER_CONFLICT[figure=3+5;text=65+55+45+35+10+1]` | Reworded to name "Three hops back...carries 65 down to 35" — supplies word-atom 3 | `[]` | `08918d9d` |
| k100-02-05 `c2` + `remedials.0.concept` | `EXAMPLE_NUMBER_CONFLICT[figure=3+5;text=65+55+45+35+10]` | Reworded to "...65, 55, 45, 35 — three tens down..." — supplies 3 | `[]` | `512aaab2` |
| k100-03-06 `c1` | `EXAMPLE_NUMBER_CONFLICT[figure=2+3+4+5;text=42+43+45+44+1]` | Reworded to "The pictured row shows **four** numbers: 42, 43..." — supplies word-atom 4 | `[]` | `d4c5912a` |
| k100-03-06 `c2` + `remedials.0.concept` | `EXAMPLE_NUMBER_CONFLICT[figure=2+3+4+5;text=42+43+45+44]` | Reworded to "Read the pictured row of **four** numbers in order..." — supplies 4 | `[]` | `529d9ada` |
| g2b-02-06 `c2` + `remedials.0.concept` | `EXAMPLE_NUMBER_CONFLICT[figure=2+3+4+5+6;text=200+300+400+500+600+100]` | Reworded "Skip-count by hundreds from **two hundred**: 200, 300..." — supplies word-atom 2 | `[]` | `baae1bb7` |
| mmt-03-02 `c2` | `EXAMPLE_NUMBER_CONFLICT[figure=5+20;text=25+50+75+3]` | Reworded "...quarters climb **twenty-five, fifty, seventy-five**..." (spelled to match the figure's own style) — supplies word-atoms 20 and 5 | `[]` | `d528bc2a` |

`k100-03-05` (`chart-rows`) and `pv-03-02` (`pv3-regroup`) were **not** in the risk list — no
change was needed for those two; their original clearance (main report above) stands unmodified.

Every fix adds a number the figure or lesson already truthfully implies (a chart row genuinely has
ten numbers; a hundred-chart row is one row; three −10 hops genuinely carry 65 to 35; the pictured
row genuinely has four squares; "two hundred" is the same value as "200"; "twenty-five" is the same
value as "25") — no fix invented a new fact, changed a taught number, or altered which figure binds
which step.

### Re-verification of all 13 original placements

Re-ran the same live-JSON alignment/blocklist probe used in the main report (`isFigureTextAligned`
+ `FIGURE_TEXT_MISMATCH_BLOCKLIST` membership, imported directly from
`src/lib/figureTextAlignment.ts` / `src/lib/figureTextMismatchBlocklist.generated.ts`) against all
13 placements after these second-pass edits:

```
{"label":"k100-01-03/c1","figure":"chart-120","key":"a1755d73","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/c1","figure":"tno-count-down-tens","key":"08918d9d","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/c2","figure":"tno-count-down-tens","key":"512aaab2","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-02-05/remedials.0.concept","figure":"tno-count-down-tens","key":"512aaab2","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-03/c1","figure":"chart-120","key":"58af580a","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-05/c1","figure":"chart-rows","key":"780408b5","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/c1","figure":"c120-missing-order","key":"d4c5912a","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/c2","figure":"c120-missing-order","key":"529d9ada","aligned":true,"blocklisted":false,"pass":true}
{"label":"k100-03-06/remedials.0.concept","figure":"c120-missing-order","key":"529d9ada","aligned":true,"blocklisted":false,"pass":true}
{"label":"g2b-02-06/c2","figure":"skip-count-line","key":"baae1bb7","aligned":true,"blocklisted":false,"pass":true}
{"label":"g2b-02-06/remedials.0.concept","figure":"skip-count-line","key":"baae1bb7","aligned":true,"blocklisted":false,"pass":true}
{"label":"mmt-03-02/c2","figure":"mmt-biggest-first","key":"d528bc2a","aligned":true,"blocklisted":false,"pass":true}
{"label":"pv-03-02/c1","figure":"pv3-regroup","key":"610a669d","aligned":true,"blocklisted":false,"pass":true}
ALL 13 PLACEMENTS PASS
```

All 13 still `aligned: true`, `blocklisted: false` after the risk-clearance rewords. Also re-ran
the JSON parse check on all 6 re-touched files — all valid.

### Scope correction — not all 15 candidates were this packet's

The coordinator's message stated all 15 offending candidate keys traced to this packet's edits.
Direct measurement found this was **not accurate**: only 11 of 15 trace to the 6 lessons this
packet touched (all 11 now fixed, confirmed `MINE_COUNT=0` on re-probe). The remaining 4 belong to
lessons **outside** this packet's 4 named courses:

- `content/courses/decimal-fluency-g5/lessons/g5d-03-01.json` `steps.3` (`pv4-times10-shift`,
  `OPERATION_CONFLICT[figure=multiplication;text=division]`)
- `content/courses/measure-problems-g4/lessons/g4v-01-02.json` `steps.3` and
  `remedials.0.concept` (`mc-length-ladder`, `EXAMPLE_NUMBER_CONFLICT[figure=10+100+1000;text=9+900+1]`)
- `content/courses/measure-problems-g4/lessons/g4v-02-02.json` `steps.0` (`g4v-clock-60`,
  `EXAMPLE_NUMBER_CONFLICT[figure=1+5;text=60+2]`)

These 3 files were already modified in the working tree before this follow-up started (confirmed
by `git status`), and untracked staging artifacts for other concurrent S318 lanes are present
(`reports/closure/S318_G3_WITHHELD_CLEARANCE.md`, `S318_G4G7_WITHHELD_CLEARANCE.md`,
`S318_HS_WITHHELD_CLEARANCE.md`, `src/components/s318G3Figures.test.tsx`,
`s318G4G7Figures.test.tsx`, `s318HsFigures.test.tsx`) — this packet's own scope statement (see
top of this report) already named these as a different lane's in-progress work and left them
untouched; that boundary was kept here too. Recorded as `S318-FIGA-RISK-SCOPE-NOTE` in the NDJSON.

### Final gate output (verbatim)

`npx vitest run src/components/figureTextAdversarialAudit.test.tsx` remains **red** — but now
fails **only** on the 4 non-owned candidate keys above, not on any of this packet's 11:

```
 RUN  v4.1.10 /home/user/maggies-trail

 ❯ src/components/figureTextAdversarialAudit.test.tsx (1 test | 1 failed) 1274ms
     × catalogues every placement and finds no unreviewed high-confidence conflict 1272ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/components/figureTextAdversarialAudit.test.tsx > adversarial illustration and accompanying-text audit > catalogues every placement and finds no unreviewed high-confidence conflict
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/components/figureTextAdversarialAudit.test.tsx:287:92
    285|     expect(new Set(currentManualHoldKeys).size).toBe(CURRENT_FIGURE_TE…
    286|     expect(CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.every((hold) => h…
    287|     expect(blocklistCandidateKeys.every((key) => FIGURE_TEXT_MISMATCH_…
       |                                                                                            ^
    288|     expect(currentManualHoldKeys.every((key) => FIGURE_TEXT_MISMATCH_B…
    289|     expect(readFileSync(blocklistPath, "utf8")).toBe(generatedBlocklis…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  11:20:20
   Duration  5.13s (transform 3.27s, setup 56ms, import 3.52s, tests 1.27s, environment 0ms)
```

Cannot honestly report "fully green" without either (a) editing 3 files in 2 courses outside this
packet's assigned scope (`decimal-fluency-g5`, `measure-problems-g4`), which the packet's own
ownership rule and this report's stated scope forbid, or (b) hand-editing the blocklist, which is
explicitly forbidden by the packet's truth-first rules. Full-green on this test file depends on the
G4G7 lane (owns `measure-problems-g4`) and whichever lane owns `decimal-fluency-g5` completing
their own equivalent risk-clearance pass; this addendum documents that the 4 remaining failures are
not this packet's responsibility, with exact evidence.

### Cleanup

Deleted the throwaway `src/components/s318RisksProbe.test.tsx` probe after extracting its console
output (not a deliverable). Checked for stray `probe_s318*.mts` scratch files at the repo root
(the kind the coordinator asked to be swept) — none existed at cleanup time (glob returned no
matches); two unrelated older scratch files, `probe.mts` and `probe2.mts` (dated before this
session, no `s318` in the name), were left untouched as out of scope for this instruction and not
attributable to this packet.

### Updated changed-files list (this addendum)

- `content/courses/counting-to-100-k/lessons/k100-01-03.json` — `c1.body` reworded again (risk fix).
- `content/courses/counting-to-100-k/lessons/k100-02-05.json` — `c1.body`, `c2.body`,
  `remedials[0].concept.body` reworded again (risk fix).
- `content/courses/counting-to-100-k/lessons/k100-03-03.json` — `c1.body` reworded again (risk fix).
- `content/courses/counting-to-100-k/lessons/k100-03-06.json` — `c1.body`, `c2.body`,
  `remedials[0].concept.body` reworded again (risk fix).
- `content/courses/add-subtract-1000-g2/lessons/g2b-02-06.json` — `c2.body`,
  `remedials[0].concept.body` reworded again (risk fix).
- `content/courses/measure-money-time/lessons/mmt-03-02.json` — `c2.body` reworded again (risk fix).
- `reports/closure/S318_K2_WITHHELD_CLEARANCE.md` — this addendum.
- `reports/closure/cowork-staging/laneA-s318-k2-figures.jsonl` — 7 appended records (6
  `lesson-fix-followup` + 1 `followup-note`).
- `src/components/s318RisksProbe.test.tsx` — created, used, then deleted (throwaway; not a
  deliverable, not present in the final tree).

`content/courses/counting-to-100-k/lessons/k100-03-05.json` and
`content/courses/place-value/lessons/pv-03-02.json` were **not** touched in this addendum (not on
the risk list).
