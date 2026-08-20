# S316 measure-problems-g4 main-route figure rebuild

Closes the 8 open main-route (c1/c2) figure/text mismatches documented in
`reports/closure/S316_LANEAV2_MIXED_G4V_VERIFICATION.md` (§"Non-KEEP list with reasons") and
`reports/closure/S316_LANEAV_G4_G5_VERIFICATION.md` (§"REVISE lessons (8)"), and the exact
representation demand for g4v-03-04 recorded in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (`recordId: S256-G4V-g4v-03-04`). Each of
the 8 static, hardcoded-to-a-different-scenario figures was replaced with a new registered
component built from the lesson's own worked numbers, and rebound on the lesson's `figure` key.
Nothing else in any lesson JSON was touched — no prose, IDs, answers, hints, `conceptTag`, or
remedial changed.

## Method

For each of the 8 lessons: read the c1/c2 concept `body`/`narration` and the adjacent
`i1`/`k1`/`k2`/`k3` widgets in full to find numbers the lesson's own content already uses (so the
new figure never introduces a number the lesson didn't already commit to), read the existing
defective component in `src/components/figures.tsx` to confirm the reported mismatch firsthand,
then built a small typed-prop helper plus a zero-arg wrapper in the house style (`role="img"`,
`<title>` accessible description, `INK`/`SKY`/`TANGERINE`/`LEAF`/`BERRY` tokens, no color-only
cues — the crossed-off/removed quantity is marked with a dashed border and an X, not color alone).

Three of the eight replacements share one relationship — equal groups, then one adjustment
subtracted once from the end of the whole (never from every group) — so they share a single
reusable component, `EqualGroupsEndAdjustBar({ groups, perGroup, adjustment, suffix })`, typed on
the numbers so a future lesson can reuse it with its own values instead of a new one-off hardcode.
The two-panel contrast figure for g4v-03-04 c2 reuses that same relationship (as a compact
variant) alongside a new `EqualGroupsInsideAdjustBar` for the inside-every-group case, so the
contrast is built from the same primitives rather than two unrelated drawings.

## Per-lesson figure built + binding

| Lesson | Step | Old figure (defect) | New figure id | What it now shows (lesson's own numbers) |
|---|---|---|---|---|
| g4v-01-02 | c1 | `ratio-table` (flour/milk) | `g4v-meter-cm-table` | Conversion table: 1 m = 100 cm, 2 m = 200 cm, 3 m = 300 cm; caption "meters × 100 = centimeters" |
| g4v-02-01 | c1 | `md3-liter` (unmarked 1-L jug) | `g4v-liter-ml-jug` | Jug in 4 liter bands, each labeled with its mL equivalent: 1 L=1000 mL … 4 L=4000 mL |
| g4v-02-02 | c1 | `clock-face` (frozen at 3:00) | `g4v-clock-60` | Clock ringed with 60 ticks; "1 hour = 60 minutes" and "1 minute = 60 seconds" |
| g4v-02-03 | c2 | `two-step-bar` (18+24−15 join story) | `g4v-groups-adjust-distance` | Bar: 6 equal 400 m laps, 150 m crossed off the end once: (6×400)−150=2,250 m — the lesson's own c1/k1/k2 worked example |
| g4v-02-04 | c1 | `md3-elapsed` (fixed 8:40–9:20) | `g4v-groups-adjust-time` | Bar: 5 equal 30-min shifts, 20 min crossed off the end once: (5×30)−20=130 min — the lesson's own c1 worked example |
| g4v-03-01 | c1 | `mmt-coin-total` (23¢ dimes/pennies) | `g4v-groups-adjust-money` | Bar: 9 equal $25 passes, $40 voucher crossed off the end once: (9×25)−40=185 dollars — the lesson's own c1 worked example |
| g4v-03-02 | c1 | `line-plot` (five pencil lengths in eighths) | `g4v-quarter-inch-plot` | Line plot: 8 X marks stacked at the 1/4-inch tick, grouped 4-and-4 into 2 whole inches; "8 ÷ 4 = 2 inches" |
| g4v-03-04 | c1 | `mb-multistep` (equation-only, no bar) | `g4v-groups-adjust-distance` (reused) | Same 6×400−150=2,250 m bar — this lesson's own k1 mcq is verbatim "6 equal parts of 400 m, 150 m crossed off the end"; now an actual equal-part bar with a crossed-off piece (dashed border) and unit label, not an equation |
| g4v-03-04 | c2 | `two-step-bar` (18+24−15, end-only) | `g4v-end-vs-inside-adjust` | Two-panel contrast: end adjustment (6×400−150=2,250 m, this lesson's own k1) vs. inside-every-group adjustment (4×(300−50)=1,000 m, this lesson's own k3) |

Only these `figure` keys were changed. Every other `figure` key in these 8 lesson files (c2 of
g4v-01-02/02-01/02-02/03-01/03-02, c1 of g4v-02-03, and the remedial of g4v-03-04, which reuses
`two-step-bar` as "the best available option" per the prior lane worker's disclosure and was
explicitly out of this packet's scope) is unchanged — verified in the test file's last two `it`
blocks.

## Registration

New component functions and a `ConversionTableRows` / `EqualGroupsEndAdjustBar` /
`EqualGroupsEndAdjustCompact` / `EqualGroupsInsideAdjustBar` set of typed-prop reusable helpers
were added to `src/components/figures.tsx` (additive only — no existing component was modified),
and the 8 new ids were added to the `FIGURES` map. `src/components/figureIds.ts` was regenerated
with `node scripts/gen-figure-ids.mjs` (the documented generator for that file) so the
synchronous existence gate used by `FigureView` recognizes the new ids; this is the pattern every
other figure in the file already follows.

New figure ids (all present in `FIGURE_IDS` and `FIGURES` after regeneration):
`g4v-meter-cm-table`, `g4v-liter-ml-jug`, `g4v-clock-60`, `g4v-groups-adjust-distance`,
`g4v-groups-adjust-time`, `g4v-groups-adjust-money`, `g4v-quarter-inch-plot`,
`g4v-end-vs-inside-adjust`.

## Test file

`src/components/g4vFigures.s316.test.tsx` (jsdom environment): for each of the 8 lessons,
asserts the exact `figure` key on the exact step; SSR-renders the new component via
`renderToStaticMarkup` and asserts `role="img"` plus a `<title>` containing the lesson's actual
numbers (e.g. "1 meter is 100 centimeters", "4 liters equals 4,000 milliliters", "one hour equals
sixty minutes", "150 meters crossed off once", "eight X marks", "150 meters crossed off once at
the end" contrasted with "50 meters crossed off inside the part"); and asserts none of the old
defect's foreign numbers/words survive in the rendered markup (no `18+24`, no `8:40`/`9:20`, no
`23¢`, no "flour"/"milk", no "pencil", no "3:00"/"three o'clock", no "dimes"/"pennies"). A final
pair of tests confirms every non-target `figure` key in the 8 files is unchanged and that
g4v-03-04's remedial still points at `two-step-bar` (untouched, out of scope).

## Gate results (verbatim)

```
$ npx vitest run src/components/g4vFigures.s316.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  11 passed (11)
```

```
$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent
```

```
$ npx tsc --noEmit
EXIT:0
```

All three gates pass. No other test file, gate, or script was run, per the packet's explicit
scope.

## Scope note on the working tree

`content/courses/measure-problems-g4/lessons/*.json` and `src/components/figures.tsx` already
carried substantial uncommitted changes from other, unrelated in-flight work at the start of this
session (em-dash/`\uXXXX` re-serialization across the whole `measure-problems-g4` course, and
separate S316 figure additions for other courses/lessons such as `tm-03-02` and a ×8
grade-3 multiplication figure). None of that was authored by this packet; it predates this
session's edits and is visible in `git diff` alongside this packet's changes. This packet's own
edits are exactly: the 8 `figure` key rebindings listed above, the 8 new component definitions
plus their 4 shared typed-prop helpers and 8 `FIGURES` map entries (additive-only) in
`src/components/figures.tsx`, the regenerated `src/components/figureIds.ts`, and the new test
file.

---

## Follow-up: 3 more defects found by a second verification pass

A second verifier confirmed all 8 rebuilds above exact (KEEP) and narrowed 3 remaining defects in
the same course, closed here with the same house rules and the same already-built helpers
(additive only; no existing component modified; titles/descriptions state the lesson's actual
numbers). This supersedes the §"Per-lesson figure built + binding" table row's implicit claim and
the §"Test file" section's closing sentence above, both of which described g4v-03-04's remedial as
untouched/out of scope at the time — it is now in scope and fixed, per the coordinator's explicit
instruction.

### Bindings

| Lesson | Step | Old figure (defect) | New figure id | What it now shows (lesson's own numbers) |
|---|---|---|---|---|
| g4v-01-01 | c2 | `rr-conversion` (imperial, "12 in = 1 ft") | `g4v-meter-cm-table` (**reused**, not a new id) | Same 1 m=100 cm / 2 m=200 cm / 3 m=300 cm table already built for g4v-01-02 c1. Reuse is correct here: this lesson's own i1 uses 3 m=300 cm (matches c1's "A rope is 3 meters and also 300 centimeters") and i2 uses 2 m=200 cm — both rows already present in the existing table, so no new component was needed. |
| g4v-01-03 | c2 | `rr-conversion` (imperial, "12 in = 1 ft") | `g4v-length-both-ways-table` (**new id**) | A new `ConversionTableRows` instantiation with rows (4, 400) and (6, 600) — this lesson's own i1 (4 m=400 cm) and i2 (6 m=600 cm) worked examples, which do **not** overlap g4v-meter-cm-table's (1, 2, 3) rows, so reusing that id would have shown numbers foreign to this lesson. Caption states both directions ("down: × 100 · up: ÷ 100"), matching c1's own claim that conversion "runs both ways: meters to centimeters multiplies by 100, and centimeters to meters divides by it." |
| g4v-03-04 | remedial `concept.figure` | `two-step-bar` (18+24−15, an unequal-addend JOIN story) | `g4v-groups-inside-adjust-diagram` (**new id**, instantiates the already-built `EqualGroupsInsideAdjustBar` helper) | 5 equal 200 m parts, 30 m crossed off inside every part once: 5 × (200 − 30) = 850 m — the remedial's own numbers, read from its `check.widget.prompt` ("A bar diagram shows 5 equal parts of 200 m, with 30 m crossed off inside each part") and its correct option `o0` ("5 × (200 − 30) = 850 m"). The old figure's end-of-bar adjustment on unrelated numbers (18, 24, 15) directly contradicted the inside-every-group answer it was meant to illustrate. |

Only these 3 `figure` keys were changed (2 main-route `c2` keys, 1 remedial `concept.figure`
key). No prose, answer, option, feedback, hint, or `conceptTag` was touched in any of the 3
files; g4v-03-04's remedial `check.widget` (prompt, options, feedback) is byte-unchanged —
verified in the test file's last `it` block, which re-reads the prompt and the correct option's
label directly from the lesson JSON.

### Registration

Two new component functions were added to `src/components/figures.tsx` immediately after
`G4vEndVsInsideAdjust` (additive only): `G4vLengthConversionBothWays` (instantiates
`ConversionTableRows`) and `G4vGroupsInsideAdjustDiagram` (instantiates
`EqualGroupsInsideAdjustBar`). Both reuse the typed-prop helpers already built in the first packet
— no new helper was needed. Two new ids were added to the `FIGURES` map:
`g4v-length-both-ways-table`, `g4v-groups-inside-adjust-diagram`. `g4v-01-01` c2 reuses the
existing `g4v-meter-cm-table` id — no new component or map entry for that one.
`src/components/figureIds.ts` was regenerated again with `node scripts/gen-figure-ids.mjs`; both
new ids are present in `FIGURE_IDS` and `FIGURES`.

### Test file extension

`src/components/g4vFigures.s316.test.tsx` was extended (not replaced) with a nested
`describe("S316 follow-up: 3 defects a second verification pass found in the same course", ...)`
block of 5 new tests: one per binding (asserting the exact `figure`/`concept.figure` key, the
rendered `<title>` stating the lesson's real numbers, and the absence of the old imperial/
unequal-join numbers — no `12 in`/`1 ft`, no `18+24`/`−15`/`27`/`42`), one confirming neither
`rr-conversion` nor `two-step-bar` remains bound on any of the 3 fixed steps, and one confirming
g4v-03-04's remedial `check.widget` prompt/correct-option text is unchanged. The two pre-existing
tests that referenced g4v-01-01/g4v-01-03 c1 and g4v-03-04's remedial were updated: the
"touched only the intended figure keys" test now also asserts g4v-01-01 c1 and g4v-01-03 c1
(`mc-length-ladder`) are unchanged, and the stale assertion that g4v-03-04's remedial still
pointed at `two-step-bar` was removed (that binding is now covered, correctly, by the new
follow-up tests instead). Total test count: 16 (11 original + 5 new).

### Gate results (verbatim)

```
$ npx vitest run src/components/g4vFigures.s316.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  16 passed (16)
```

```
$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent
```

```
$ npx tsc --noEmit
EXIT:0
```

All three gates pass. No other test file, gate, or script was run, per the packet's explicit
scope.

---

## Round 2

A follow-up worker packet was given the same 3 targets independently (g4v-01-01 c2, g4v-01-03
c2, g4v-03-04 remedial) with the same instructions: read each lesson's actual prose/numbers,
rebind (reuse where the numbers match exactly, otherwise instantiate a new registered id), keep
everything else byte-identical, extend the same test file, run the same three gates.

On inspection, the working tree already carried exactly the "§Follow-up" bindings above,
uncommitted (per the "Scope note on the working tree" section: this course's lesson JSONs and
`figures.tsx` already had substantial uncommitted work in flight before this session started).
This packet's job reduced to independent re-verification rather than re-implementation:

- Re-read all three lessons' prose/numbers firsthand (not from this report) and confirmed each
  binding matches:
  - `g4v-01-01` c2 → `g4v-meter-cm-table` (reused): c2's body is metric ("Smaller units need more
    of them..."), and this lesson's own i1 (3 m = 300 cm) and i2 (2 m = 200 cm) rows are both
    present in the reused table. No imperial numbers anywhere in the rendered markup.
  - `g4v-01-03` c2 → `g4v-length-both-ways-table` (new id, `ConversionTableRows` instantiation
    via `G4vLengthConversionBothWays`): c1 states the conversion "runs both ways"; this lesson's
    own i1 (4 m = 400 cm) and i2 (6 m = 600 cm) are the rows shown, and the table states both the
    × 100 and ÷ 100 directions, matching c1's claim. These rows do not overlap
    `g4v-meter-cm-table`'s (1, 2, 3), so reuse would have shown foreign numbers — a new
    instantiation was correctly required.
  - `g4v-03-04` remedial `concept.figure` → `g4v-groups-inside-adjust-diagram` (new id,
    `EqualGroupsInsideAdjustBar` instantiation via `G4vGroupsInsideAdjustDiagram`): the remedial's
    own `check.widget.prompt` ("5 equal parts of 200 m, with 30 m crossed off inside each part")
    and correct option (`5 × (200 − 30) = 850 m`) both describe an inside-every-group adjustment;
    the new figure renders exactly that (5 parts, 200 each, 30 crossed off inside every part, 850
    total). The old `two-step-bar` figure it replaced hardcoded an unrelated end-of-bar
    18+24−15 join story that contradicted this answer.
- Confirmed additive-only: `git diff` on `src/components/figures.tsx` shows
  `G4vLengthConversionBothWays` and `G4vGroupsInsideAdjustDiagram` as new functions plus two new
  `FIGURES` map entries; no existing component body was edited. `src/components/figureIds.ts`
  contains both new ids (`g4v-length-both-ways-table`, `g4v-groups-inside-adjust-diagram`)
  alongside the reused `g4v-meter-cm-table`.
- Confirmed only the 3 target figure keys changed in the 3 lesson JSONs (no prose, answer, hint,
  option, feedback, or `conceptTag` touched) — verified directly against each file's `git diff
  HEAD` for the `figure`/`concept.figure` lines specifically, and against the pre-existing
  `g4vFigures.s316.test.tsx` assertions (`"touched only the intended figure keys on these 3
  lessons"` and the remedial `check.widget` prompt/correct-option re-read test), both of which
  were already present and passing, so no test-file edit was needed this round.
- Confirmed accessibility: all three rendered figures use `role="img"` plus a `<title>` stating
  the real numbers (verified by grep on the SSR markup, not just the source).

No new component, id, or test was needed — the existing 16 assertions in
`src/components/g4vFigures.s316.test.tsx` (11 original + 5 from the prior "Follow-up" round)
already cover all 3 bindings exactly as specified by this packet's targets. No lesson JSON,
`figures.tsx`, `figureIds.ts`, or test file edit was made in this round; this round is
verification-only.

### Gate results (verbatim, this round)

```
$ npx vitest run src/components/g4vFigures.s316.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  02:55:09
   Duration  6.23s (transform 4.41s, setup 102ms, import 4.59s, tests 131ms, environment 988ms)
```

```
$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent
```

```
$ npx tsc --noEmit
EXIT:0
```

All three gates pass, run exactly as scoped (no other test file, gate, or script run).
