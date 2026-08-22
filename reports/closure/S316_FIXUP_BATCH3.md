# S316 Fixup Batch 3 — evidence

Base commit: `06a9bb1f9e827ab4b77b886dcf4071ddf0d9b37c` (working tree already carried extensive
uncommitted changes from other lanes/workers before this packet started — see §6).
Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`,
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`.

## 1. `decimal-fluency-g5/g5d-01-05.json` — i2 columnCalc unreachable value

`commonResults` value `454` for `a=630,b=285,op=subtract` is not in the move-sequence-reachable
set. Computed the reachable set directly with `columnCalcReachable`: `{345 (truth), 355, 455,
465}`. `455` was already correctly authored (double-flip). Replaced `454` → `465`, the value
produced by "borrow once for the ones column, then flip instead of borrowing again in the tens
column" (verified digit-by-digit), with feedback naming that exact mistake using the numbers
drawn (`"2 − 8 is not a legal move once the top digit is reduced"`). **Status: fixed.**

## 2. `multiply-bigger/mb-02-02.json` — c2 concept body word count

98 words → 78 words (reading profile `standard`, max 80). Trimmed redundant framing ("The rule
isn't about size — it's about direction" merged into one sentence; dropped the parenthetical
aside) while preserving every mathematical claim: factor/multiple duality, the worked example
(6×4=24), the direction rule (A divides B ⇒ A factor of B, B multiple of A), and the self-factor/
self-multiple fact. **Status: fixed.**

## 3. `multiplication-division/mult-01-03.json` — k1 mcq correct-option-first

Reordered `k1.widget.options` so option `b` ("20", correct) is first; `a` ("16") and `c` ("25")
follow. No id, label, or feedback text changed — pure reorder. Render-time shuffle (McqW /
`seededShuffle`) is what learners actually see, so this only fixes the JSON-authoring convention.
**Status: fixed.**

## 4. `fluency-20-g2/f20-03-03.json` — remedial stem reword (R2 normalization)

Adjudication ruling (S316-R §1.5, "Worker C's `f20-03-03` needs a one-line stem reword"): kept the
sibling-fact numbers (6, 8, 14; asks `14 − 6` instead of k1's `14 − 8`) but the stem was a bare
operand swap on k1's exact template, so `normalized(remedial.prompt) === normalized(k1.prompt)`.
Reworded the stem to a different sentence shape (`"The family has parts 6 and 8, with total 14.
Take 6 away from 14 — what do you get?"`) — same numbers, same commonErrors, new route. Verified:
`normalized()` now differs from every widget-bearing step in the lesson (i1, k1, i2, k2, k3, ch1),
and the new phrasing is not producible by k1's declared generator/form
(`g2-fluency`/`FlFactFamilyNumeric`), which emits the "Fact family a, b, c: knowing …" template
only. **Status: fixed.**

## 5. `measure-problems-g4` remedial repairs (Worker-D findings, S316-R §1.4/§4)

All six touched lessons pass R1–R6 (prompt/normalized/payload distinct from every widget-bearing
step in the lesson; traps recomputed; no answer-on-screen give-away) after the edits below.

- **`g4v-01-02` (R6 answer-on-screen).** Remedial concept states "9 m = 900 cm" immediately before
  the check asked for 9 m in cm. Changed the check's quantity to 7 m (not stated anywhere in the
  adjacent concept prose): answer 900→700, traps 209→207 / 9→7, feedback and success message
  updated to match.
- **`g4v-02-01` (R9 concept↛check mismatch).** Concept teaches "1 liter = 1,000 milliliters,
  factor and direction"; check was a ceiling-division jug-count problem that never converts.
  Replaced with a direct liter→milliliter conversion check ("A bottle holds 8 liters… multiply to
  find how many milliliters", answer 8000) whose traps target the addition-instead-of-multiply and
  kept-the-count misconceptions the concept is actually about.
- **`g4v-02-03` (R2).** Remedial was an operand swap on k1's/k3's exact "hiker walks N laps…"
  template. Reworded to the bar-model representation already present in the lesson's own `c2`/`k2`
  ("A bar model splits the trip into 6 equal 350 m sections, then trims 45 m off the last one…"),
  keeping the same (already-correct) numbers and answer (2055).
  Trap feedback reworded to match the new stem; values unchanged.
- **`g4v-02-04` (R2 + R9).** Concept claims "convert to hours after building the total"; check only
  asked for minutes (no conversion) and was an operand swap of k1's template. Rebuilt the check to
  actually convert to hours: "A crew works 9 shifts of 20 minutes, then converts the total to
  hours. How many hours is that?" → answer 3, with traps for "forgot to convert" (180) and
  "multiplied by 60 instead of dividing" (10800). Updated `explanationVariants` and
  `fallbackFeedback` to match.
- **`g4v-03-01` (R2).** Same "group buys N passes…voucher" template collision as k1. Reworded to a
  procedural-instruction representation ("Passes cost 20 dollars each. Multiply by 7 to get the
  total, then subtract the 15-dollar voucher…"), same numbers/answer (125), same traps.
- **`g4v-03-02` (R2).** Remedial (28 marks → 7 units) was an exact template collision with k1/k3/
  ch1's `mcFractionMeasurementNumeric` generator output. Reworded to the "quarter-inches" phrasing
  already used by the lesson's own `k2` ("A line plot records lengths in quarter-inches. 28 marks
  sit at 1/4 inch. What total length is that?"), same numbers/answer (7), same traps.
- **`g4v-03-03` (R2 + R9).** Same pattern as `g4v-02-04`: concept promises build→adjust→convert to
  hours; check stopped at minutes and was an operand swap of k1's template. Rebuilt: "A trail crew
  works 5 shifts of 40 minutes and finishes 20 minutes early, then converts the total to hours…" →
  answer 3 (chosen so the adjusted total, 180 min, divides evenly by 60), traps for
  forgot-to-convert (180) and multiplied-instead-of-divided (10800).

All six verified against R1 (prompt ≠ k1), R2 (`normalized()` ≠ every widget-bearing step in the
lesson, not just k1), R3 (payload ≠ k1's JSON), and R4 (new wording is not a template match for
any declared `variant` generator in the lesson — confirmed by reading `g4Variants.ts` for
`mbMultiplyTensNumeric` / `mbMultiStepNumeric` / `mcFractionMeasurementNumeric`, whose exact output
templates none of the reworded remedials reproduce). **Status: all six fixed.**

## 6. `unlike-fractions-g5/g5u-01-04.json`

Confirmed the file parses (`JSON.parse` succeeds) and validates against `Lesson`/`WidgetSpec`
schema (part of the clean 1840/1840 `validate:content` run below). No content edit made, per
scope. Its prose-change ledger signature is left for integration to record. **Status: confirmed,
no change.**

## 7. Gate reconciliation

### 7a. `src/lib/session195.fractionsDeeperG3.test.ts`

Before: 5 failed / 11 passed — `TypeError: Cannot read properties of undefined (reading 'gen')` at
`g3f-01-01`, `g3f-01-04`, `g3f-02-05`, `g3f-03-01`, `g3f-03-04`. Worker C removed `variant` keys
from numeric check/challenge steps whose corrected prompts no longer match any registered
generator form (verified: no generator in `g2Variants.ts`/`g2Independent.cjs` produces a general
"split into fifths" piece-count, a raw counters-into-groups division, or an "N/D equals a whole
number exactly" prompt — `Ssg2ThirdsCountNumeric` is hardcoded to thirds/answer 3 and cannot
reproduce the fifths case).

Correction: added a second, genuinely independent route (`solveNoVariant`) inside the test itself
for numeric steps with **no** `variant` — three regex patterns recomputing the answer straight from
the printed prompt by arithmetic (never a lookup of the authored answer):
- `^(\d+)\/(\d+) equals a whole number exactly\.` → `N/D`
- `^A set of (\d+) counters is split into (\d+) equal groups\.` → `N/M`
- `split into (\w+)\. How many equal pieces are there\?` → fraction-word→count table

This is strictly additive: every previously-covered `variant`-bearing step (11 lessons, all other
steps in the 5 fixed lessons) is checked exactly as before; the newly-covered no-variant steps now
get a real independent derivation instead of a crash. The function throws (loudly) for any prompt
shape it doesn't recognize, so nothing can silently skip verification.

After: **16/16 passed.**

### 7b. `src/lib/session252.*`

Ran all five `session252.*` files. Only the one named in scope (`unlikeFractionsG5CourseIntegrity`)
carried a defect attributable to a signed content revision:

- **Evaluator hash pin.** `preserves all evaluator IDs and correctness…` expected
  `8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45`, got
  `644bef53c46ceed726001de09ca3eeb3c6e530cfb0c8b65402066f0bcd9ea92e`. This is the break the
  adjudication names (Worker D changed remedial answers/types across all 11 `g5u` lessons, which
  `evaluatorSignature()` covers). Re-pinned the expectation to the new hash. **Old → new:**
  `8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45` →
  `644bef53c46ceed726001de09ca3eeb3c6e530cfb0c8b65402066f0bcd9ea92e`. Equal strictness: the pin
  still freezes the full evaluator-signature corpus byte-for-byte, just at the current signed
  state; nothing about the assertion was loosened.

- **NOT fixed — `renders all 28 synchronized semantic concept placements accessibly` (figure-text
  alignment).** First failure: `g5u-01-01/c2/fm-add-unlike`. Traced the root cause: the figure's
  registered numeric claim is `"1/2 + 1/3 = 3/6 + 2/6 = 5/6"`, but `c2.body` never states the
  original `1/3` addend (only "sixths" and "3/6 + 2/6"), so `compareExactFigureNumericParity`
  reports a missing atom. I verified a one-line fix would clear it (prefixing "The figure adds
  1/2 + 1/3." makes `isFigureTextAligned` return `true`) — **but then re-scanned the whole course**
  and found this is not an isolated slip: `g5u-01-05/c2`, `g5u-02-02/c1`, and `g5u-03-02/c1` are
  *also* misaligned (a generic-text regex miss on "like-fractions" vs "like fractions" for the
  first two; a genuine missing-atom case for the third), for a total of **4 pre-existing
  misalignments**, none of which are in the FIX LIST, none caused by this packet, and confirmed
  present in the *committed* content the working tree already carried in before this session
  started (`git stash` round-trip reproduced the same 4 failures against the pre-existing working
  tree). Item 6 explicitly scopes `unlike-fractions-g5` to "no content change needed" outside
  `g5u-01-04`, and fixing 4 lessons' worth of concept prose is authored-content work outside a
  bounded fixup's remit. **I reverted my exploratory `g5u-01-01` edit rather than ship a partial,
  unauthorized fix that still wouldn't turn the suite green.** Left as a red not caused by, or
  fixable within, this packet — flagging for a human/separate packet (see §8).

`session252.addSubtract10KCourseIntegrity`, `session252.fractionsDeeperG3CourseIntegrity`: pass,
unaffected.

`session252.multiplicationDivisionCourseIntegrity` and `session252.graphFigureLabelingInventory`:
also red, also **pre-existing and out of scope** — `mult-02-01.json` (the failing figure-text
lesson) carries **zero** working-tree diff (confirmed via `git diff --stat`, byte-identical to
HEAD), and the graph-labeling-inventory failures are stale generated-report/byte-count mismatches
unrelated to any file this packet touches. Not fixed; listed per item 8.

Result for `session252*`: hash-pin defect named in scope is fixed; the remainder are pre-existing,
unattributable reds outside this packet's named files.

### 7c. `src/components/optionOrder.test.tsx`

Before: 9/10 passed — `"the authored corpus IS heavily biased toward position 0"` failed:
`0.8658777120315582` not `> 0.95`.

Investigated root cause per instruction — printed every mcq step across the corpus with
`options[0].correct !== true`: **340 offenders across 2,535 mcq widgets**, spanning ~15 courses
(`add-subtract-100`, `add-subtract-20`, `compare-numbers-k`, `add-subtract-10-k`, and others).
Cross-checked against `git status`/`git diff --stat`: the overwhelming majority of offending files
(e.g. every `add-subtract-100`, `add-subtract-20`, `compare-numbers-k` lesson) carry **zero**
working-tree diff — they are byte-identical to `HEAD`. Confirmed directly: `git stash` (full
round-trip, restored via `git stash pop` immediately after) measured the identical ratio at HEAD,
**0.8652** vs the working tree's **0.8659** — i.e. the working tree is *very slightly more*
compliant than HEAD, not less. This rules out "a working-tree edit missed the convention"; the
0.95 pin was stale against the corpus's actual long-standing composition (the docstring's cited
99.8% dates to a much smaller snapshot).

Given 340 widgets spanning courses entirely outside this packet's named scope, bulk-reordering them
is not a "small and surgical" content fix and is not authorized. Per the explicit escape hatch in
the instructions, adjusted the threshold from `0.95` to `0.8` — matching the sibling predict-block
test's own threshold two tests below it in the same file (`0.8`, calibrated against its measured
~87%), so both halves of the file now use the same standard of "overwhelming but not absolute"
bias. Updated the file's top docstring to state the current measured figure (86.6%) and why it
differs from the original 99.8%, and left an inline comment at the assertion explaining the
same. This is a documentation/threshold correction only — no assertion was deleted, and the test
still fails loudly if the corpus's bias ever drops toward chance.

After: **10/10 passed.**

## 8. Final gate — `npm run lint:pedagogy`

```
pedagogy: 1711/1711 files clean
```

Fully clean, no reds. (`npm run validate:content` also run as a self-check, not required by this
packet's gate list: `schema: 1840/1840 files clean`.)

Reds observed during work that were **not caused by, and are not fixed by, this packet** (per
item 8, listed rather than fixed):
- `session252.unlikeFractionsG5CourseIntegrity` — figure-text alignment, 4 pre-existing lessons
  (`g5u-01-01`, `g5u-01-05`, `g5u-02-02`, `g5u-03-02`), see §7b.
- `session252.multiplicationDivisionCourseIntegrity` — figure-text alignment on `mult-02-01/c2`,
  zero working-tree diff, pre-existing at HEAD.
- `session252.graphFigureLabelingInventory` — stale generated-report/byte-count mismatch, unrelated
  to any file in scope.

## 9. Out of scope, untouched

`src/components/widgets.tsx` and the `S316_LAB_CHOICE_*` / `laneA*`/`laneB*` staging files were
already present as uncommitted working-tree changes from other lanes before this packet started
(confirmed via the untracked-file list surfaced by `git status`). Not read for content, not
touched, per the explicit "do not touch" list.
