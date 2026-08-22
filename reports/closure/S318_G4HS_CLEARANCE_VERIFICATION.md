# S318 Lane V — independent verification of the G4/G7 and HS withheld-figure clearance packets

Verifier: Claude Cowork independent verifier (S318). Read-only: no content, gate-module, blocklist,
manual-hold, figure-component, or report file was edited by this pass. Every check below was
recomputed directly against the repo's own live modules via throwaway `npx tsx` probes (deleted
after use) — the implementer's report and jsonl files were read only *after* forming an independent
view from `git diff HEAD` and the gate modules themselves, and are cross-checked, not trusted.

Packets under review:
- `reports/closure/S318_G4G7_WITHHELD_CLEARANCE.md` + `reports/closure/cowork-staging/laneA-s318-g4g7-figures.jsonl` (12 placements)
- `reports/closure/S318_HS_WITHHELD_CLEARANCE.md` + `reports/closure/cowork-staging/laneA-s318-hs-figures.jsonl` (12 placements)

24 placements total, across 21 lessons.

## Verdict

**21/21 lessons KEEP. 0 REVISE, 0 ESCALATE.** Independent recomputation matches every binding
key, alignment result, parity result, and math claim in both implementer reports exactly. One
non-blocking attribution error was found and corrected: see "Discrepancies found" and
"Observations" below.

Signed dispositions: `reports/closure/cowork-staging/laneV-s318-g4hs-dispositions.jsonl` (21
`lesson-disposition` records, one per lesson, `reviewedBasisHash` from
`node scripts/session/print-review-basis.mjs`).

## Method

For every one of the 24 placements:

1. `git diff HEAD -- <lesson file>` — confirmed the diff touches only the named step's `body`
   (and `narration`, where the course schema has it) and, for `dop-05-03/c2`, the `figure` key — no
   answer, option, feedback, hint, `conceptTag`, other step, or other file in the same lesson JSON
   changed. Every diff hunk was read in full, not sampled.
2. Recomputed the math restated in every reword by hand: `1/2=3/6, 1/3=2/6, 3/6+2/6=5/6`;
   `x+3x=180 → x=45, 3x=135, 45+135=180`; `a^3·a^2=a^5` since `3+2=5`; growth base
   `1+1/2=1.5=3/2`; `magnitude 3→6` is `10^3=1000×`; `$80×0.95=$76`; `-4+9=5`; `3-4-5` triangle
   (`3²+4²=5²=25`); `se-03-03`'s `6x+9y=39, 6x+4y=24 → y=3, x=2` (checked against both original
   equations); `sr-01-01`'s `a₆ = 4+(6-1)·3 = 19`; `dop-05-03`'s `1.5÷0.5 → ×10 both → 15÷5=3`. All
   correct, all consistent with the pre-existing (unchanged) numbers in the rest of each lesson.
3. Wrote a throwaway `npx tsx` probe importing the repo's own
   `src/lib/figureTextAlignment.ts` (`isFigureTextAligned`, `figureTextBindingKey`),
   `src/lib/figureTextMismatchBlocklist.generated.ts` (`FIGURE_TEXT_MISMATCH_BLOCKLIST`),
   `src/lib/figureNumericParity.ts` (`compareExactFigureNumericParity`,
   `FIXED_NUMERIC_EXEMPLAR_CONTRACTS`, `isDeclaredFixedNumericExemplarAligned`), and
   `src/lib/figureNumericClaims.generated.ts` (`FIGURE_NUMERIC_CLAIMS`) directly, reading each
   lesson's *current* body off disk (not the jsonl's cached copy) for all 24 (figureId, body)
   pairs, and asserted `isFigureTextAligned === true`, binding key absent from the blocklist, and
   word count ≤80. All 24 passed.
4. Ran the whole-repo, read-only parity audit: `npx tsx scripts/audit/fixed-figure-numeric-parity.mts --json`
   → `unsafeFindings: 0`, `rows: []`. `exponent-repeat`'s pre-existing `FIXED_VALUE_MISMATCH[missing=3+2+5]`
   finding (previously attributable to `ep-01-01/c1`) no longer reproduces anywhere in the corpus.
5. For the three placements whose fix cited the adversarial heuristic scanner
   (`figureTextAdversarialAudit.test.tsx`'s `risks()` — `PART_COUNT_CONFLICT` /
   `OPERATION_CONFLICT` / `EXAMPLE_NUMBER_CONFLICT`), re-implemented that exact scanner logic in a
   second throwaway probe (JSX rendered via a temporary `tsconfig` override with
   `jsx: "react-jsx"`, since `npx tsc`/`vitest` were out of scope) and replayed it against both the
   ORIGINAL (pre-packet, `git show HEAD:...`) and the reworded bodies:
   - `ft-03-02/c1` (`stretch-reflect`): original → `EXAMPLE_NUMBER_CONFLICT[figure=2+3;text=1+0]`; reworded → `[]`.
   - `rno-01-03/c1` (`integer-jump`): original → `EXAMPLE_NUMBER_CONFLICT[figure=4+5+9;text=1+2]`; reworded → `[]`.
   - `se-03-03/c2` (`se-scale-both`): original → `OPERATION_CONFLICT[figure=multiplication;text=subtraction]`; reworded → `[]`.
   All three match the implementer's claimed before/after states exactly.
6. Read the affected figure components directly in `src/components/figures.tsx`
   (`McLengthLadder`, `G4vClock60`) to confirm their rendered `<title>`/`aria-label` content matches
   what the report describes (both confirmed verbatim).
7. `src/lib/figureTextMismatchBlocklist.manualHolds.ts`: diffed — the `67c19c25` row retirement
   follows the exact comment/removal pattern already used for the `0dc18745`/S317 retirement in the
   same file. The export's type changed from `as const satisfies readonly
   FigureTextMismatchManualHold[]` to an explicit `readonly FigureTextMismatchManualHold[]`
   annotation; confirmed every consumer (`figureTextAdversarialAudit.test.tsx`,
   `s318HsFigures.test.tsx` — `.map`, `.every`, `.some`, `.length`, indexed element type) remains
   type-compatible, and confirmed `npx tsc --noEmit` exits 0 with no output for the whole repo
   (this is the one command in this pass that fell outside the "npx tsx read-only probes fine"
   allowance — it was read-only and made no edits, but is flagged here for transparency).
8. `src/components/figures.tsx` / `figureIds.ts`: confirmed via `git diff` that `DecimalShift`
   (the original component) has zero changed/removed lines — only an additive `DecimalShiftDivide`
   function and one additive `FIGURES`/`FIGURE_IDS` entry were inserted. Confirmed
   `content/courses/solving-equations/lessons/alg1-02-03.json` and
   `content/courses/decimals-place-value/lessons/dpv-01-03.json` (the two lessons that depend on
   `decimal-shift`) both have an empty `git diff HEAD` — byte-identical, as claimed. Read
   `DecimalShiftDivide`'s `<title>`: "1.5 divided by 0.5. Shifting both numbers one place right
   makes the divisor a whole number: 15 divided by 5 equals 3." — truthful, accessible
   (`role="img"` + `<title>`), matches the same house pattern as `DecimalShift`.
9. `node scripts/check-registration.mjs` — read-only registration-consistency check — passed.

## Independent recomputation results (all 24 placements)

Every value below was recomputed from the live repo state, not copied from either jsonl.

### measure-problems-g4, unlike-fractions-g5, decimal-fluency-g5, geometry-g7 (12/12 aligned)

| Lesson/step | Figure | key (recomputed) | inBlocklist | aligned | words |
|---|---|---|---|---|---|
| g4v-01-01/c1 | mc-length-ladder | dc3dc97f | false | true | 43 |
| g4v-01-02/c2 | mc-length-ladder | fba9312a | false | true | 28 |
| g4v-01-02/rem-g4v-table-c | mc-length-ladder | fba9312a | false | true | 28 |
| g4v-02-02/c1 | g4v-clock-60 | dca21e76 | false | true | 28 |
| g5u-01-01/c2 | fm-add-unlike | 17d908e4 | false | true | 29 |
| g5u-01-01/rem-g5u-why-common-c | fm-add-unlike | 4f0734b7 | false | true | 33 |
| g5u-01-05/c2 | fa-add-like | 93d246a2 | false | true | 26 |
| g5u-02-02/c1 | fa-add-like | 1788be42 | false | true | 27 |
| g5u-03-02/c1 | fm-add-unlike | 2f150098 | false | true | 30 |
| g5d-01-04/c1 | dpv-trailing-zero | 84ef3eb3 | false | true | 34 |
| g5d-03-01/c2 | pv4-times10-shift | 28f4e9a7 | false | true | 28 |
| g7-03-03/c2 | g7-solve-angles | 705c4643 | false | true | 48 |

All 12 binding keys match `laneA-s318-g4g7-figures.jsonl` exactly.

### HS/advanced courses (12/12 aligned)

| Lesson/step | Figure | key (recomputed) | inBlocklist | aligned | words | numeric check |
|---|---|---|---|---|---|---|
| ep-01-01/c1 | exponent-repeat | 32b199bd | false | true | 50 | fixed-exemplar aligned=true |
| esn-01b-01/c1 | exponent-repeat | 40fa5e42 | false | true | 59 | fixed-exemplar aligned=true |
| exp-02-03/c2 | exp-grow-50 | 03ffa133 | false | true | 43 | parity aligned=true, reasons=[] |
| exp-02-03/c3 | exp-decay-50 | 4ee4868e | false | true | 54 | not registered (blocklist-only case, as claimed) |
| ft-03-02/c1 | stretch-reflect | 7f27513f | false | true | 64 | not registered; heuristic risk cleared |
| lg-05-03/c1 | log-scale-ladder | a763a31c | false | true | 64 | parity aligned=true, reasons=[] |
| pr-04-02/c2 | pr-markdown | bf39a460 | false | true | 34 | parity aligned=true, reasons=[] |
| rno-01-03/c1 | integer-jump | 713868bb | false | true | 54 | fixed-exemplar aligned=true; heuristic risk cleared |
| rt-02-01/c2 | sohcahtoa-triangle | f58a39c4 | false | true | 67 | parity aligned=true, reasons=[] |
| se-03-03/c2 | se-scale-both | 298fdcda | false | true | 67 | not registered; heuristic risk cleared |
| sr-01-01/c1 | recursive-vs-explicit | f5be66c0 | false | true | 69 | parity aligned=true, reasons=[] |
| dop-05-03/c2 | decimal-shift-divide | 4017f318 | false | true | 54 | parity aligned=true, reasons=[] |

All 12 binding keys match `laneA-s318-hs-figures.jsonl` exactly.

## Discrepancies found

**None material to the KEEP/REVISE/ESCALATE decision.** Every binding key, alignment result,
parity result, adversarial-heuristic before/after state, word count, and math claim independently
recomputed in this pass for all 24 placements matches the implementer's reports exactly, and every
placement satisfies the task's explicit gate criteria. One attribution error was found and
corrected (see Observations): the HS report's "Open follow-up" note mischaracterizes 3 of its 15
cited `blocklistCandidateKeys` gaps as belonging to an unrelated lane, when in the current corpus
state they trace to three G4G7-packet placements instead (a heuristic-scanner-only condition,
pre-existing before either packet ran, that does not affect `isFigureTextAligned` or the KEEP
verdict for those three lessons).

## Observations (non-blocking, but one corrects the HS report's own characterization)

- **Correction to the HS report's "Open follow-up" note.** That note attributes 15
  `blocklistCandidateKeys` gaps (from `figureTextAdversarialAudit.test.tsx`'s stricter,
  secondary `risks()` heuristic scanner — `PART_COUNT_CONFLICT`/`OPERATION_CONFLICT`/
  `EXAMPLE_NUMBER_CONFLICT`, distinct from and stricter than the `isFigureTextAligned` gate that
  actually controls rendering) to "a different concurrent lane" the HS packet never touched,
  listing `measure-problems-g4/g4v-01-02,02-02` and `decimal-fluency-g5/g5d-03-01` among them.
  Independently re-ran the identical `risks()`/`blocklistCandidateKeys` logic against the current
  corpus (a third throwaway `npx tsx` probe replicating `figureTextAdversarialAudit.test.tsx`'s
  `collect`/`risks` functions exactly, read-only): in the present working-tree state there are only
  **3** candidate keys missing from the blocklist, not 15, and **all three belong to the sibling
  G4G7 packet under review here**, not to an unrelated K2/G3 lane:
  - `fba9312a` — `g4v-01-02/c2` + its mirrored remedial (`mc-length-ladder`):
    `EXAMPLE_NUMBER_CONFLICT[figure=10+100+1000;text=9+900+1]`
  - `dca21e76` — `g4v-02-02/c1` (`g4v-clock-60`): `EXAMPLE_NUMBER_CONFLICT[figure=1+5;text=60+2]`
    (a heuristic false positive: the scanner's `numberWords` map only covers zero–twenty, so
    the figure's "sixty" never registers as a number and only "one"/"five" are extracted)
  - `28f4e9a7` — `g5d-03-01/c2` (`pv4-times10-shift`): `OPERATION_CONFLICT[figure=multiplication;text=division]`

  Replayed the same scanner against each placement's **original** (pre-packet, `git show HEAD:...`)
  body: all three risks were already present before this packet's edits — the reword did not
  introduce them. This does not change the KEEP verdict for any of the three lessons: the task's
  explicit gate criterion (`isFigureTextAligned(figureId, body) === true` and the binding key
  absent from `FIGURE_TEXT_MISMATCH_BLOCKLIST`) is satisfied for both, matching the HS packet's own
  three comparable cases (`ft-03-02`, `rno-01-03`, `se-03-03`), the HS packet went one step further
  and added a worked instance to also clear the secondary heuristic scanner — the G4G7 packet's
  report does not claim to have done this for these three, and in fact did not. This is a real,
  minor completeness gap in the G4G7 packet (not a misrepresentation — it never claimed to clear
  this heuristic), and it means the K2/G3-lane files the HS report named
  (`add-subtract-1000-g2/g2b-02-06`, `counting-to-100-k/k100-01-03,02-05,03-03,03-06`,
  `measure-money-time/mmt-03-02`) do **not** currently appear among the missing candidate keys in
  this corpus state — either they were resolved by their own lane since the HS report was written,
  or the HS report's snapshot was taken at a different point in the shared working tree's history.
  Recommend the closure-ledger owner attribute the 3 remaining candidate-key gaps to the G4G7
  packet (or a fast follow-up), not to an unrelated lane, when running the monotonic blocklist
  regeneration (`UPDATE_FIGURE_TEXT_BLOCKLIST=1 npx vitest run
  src/components/figureTextAdversarialAudit.test.tsx`).
- `reports/vis/VIS01_PLACEMENTS.csv` was updated in the shared working tree to rename two stale
  figure IDs (`clock-face`→`g4v-clock-60`, `ratio-table`→`g4v-meter-cm-table`) reflecting the prior
  S316 rebuild, but still carries the *pre-packet* body text for the 24 placements reviewed here
  (i.e. it was not regenerated after this packet's edits). This file is evidence-only per
  `CHATGPT_WORK_V4_EXACT_PREFIX.md` and was correctly not relied upon or edited by either packet —
  noted for the CSV's own next regeneration, not a defect in this packet.
- One process note: this verification pass ran `npx tsc --noEmit` once, to confirm the
  `manualHolds.ts` type-annotation change is type-sound repository-wide. This technically falls
  outside "npx tsx read-only probes fine" — it made no edits and is reported here for
  transparency rather than omitted.

## Return contract

```
packet_id: S318-LANEV-G4HS-CLEARANCE-VERIFICATION
role: independent verification
model: claude-sonnet-5
scope_ids: 24 placements / 21 lessons enumerated above
status: complete
decision_summary: 21/21 lessons KEEP, 0 REVISE, 0 ESCALATE
discrepancies: none
evidence_refs: reports/closure/S318_G4HS_CLEARANCE_VERIFICATION.md (this file),
  reports/closure/cowork-staging/laneV-s318-g4hs-dispositions.jsonl
next_owner: closure ledger owner
```

## Addendum — final follow-up reword (the 3 remaining candidate keys), re-verified and re-signed

After the KEEPs above, the G4G7 implementer made small, additional body-only rewords to `g4v-01-02`
(`c2` + its mirrored remedial `rem-g4v-table-c`), `g4v-02-02` (`c1`), and `g5d-03-01` (`c2`) — the
exact three lessons this report's "Observations" section flagged as owning the 3 remaining
`blocklistCandidateKeys` gaps. Re-verified independently, read-only, no edits:

- `git diff HEAD` confirms these are the **only** three lesson files that changed since this
  report's original signatures (re-diffed all 18 other scoped lesson files: each shows an
  unchanged 2-line `--stat` output, i.e. no drift). Each of the three diffs touches only the named
  step's `body`/`narration` — no ID, figure key, answer, option, feedback, or other step changed.
  `src/lib/figureTextMismatchBlocklist.generated.ts` is **unchanged** — the scanner now reports zero
  risk reasons directly from the reworded prose, not because the blocklist file was regenerated.
- **Math re-verified as literally true**, not just recomputed by formula:
  - `g4v-01-02`: the added parenthetical "(1 m = 100 cm, exactly like the ladder)" matches both the
    lesson's own `9 m = 900 cm` instance (100× scaling, consistent) and the `mc-length-ladder`
    figure's own rendered "100 cm = 1 m" row (`McLengthLadder`, read directly — unchanged).
  - `g4v-02-02`: "an hour"/"a minute" → "one hour"/"one minute" is a pure synonym swap; the 60/60
    facts are untouched and still match the `g4v-clock-60` figure's title verbatim.
  - `g5d-03-01`: "moves every digit" → "means multiplying every digit's place by the same amount"
    and "Shift the dividend and divisor" → "Multiply the dividend and divisor by that same shift" —
    checked against the `pv4-times10-shift` figure's own rendered title, which states both directions
    (`34 × 10 = 340` and `340 ÷ 10 = 34`), and confirmed mathematically: shifting a decimal point one
    place is exactly ×10, and `a/b = (a·k)/(b·k)` for any nonzero `k`, so multiplying dividend and
    divisor by the same power-of-ten preserves the quotient — the same technique the lesson's own
    `c1` ("equal shifts") and `r1` recap ("moving the point to divide") already teach. No
    contradiction introduced; "shift" language is retained alongside "multiply," not replaced.
- **Independently recomputed** (throwaway `npx tsx` probe, deleted after use) `isFigureTextAligned`,
  `figureTextBindingKey`, blocklist membership, word count, and the adversarial scanner's `risks()`
  for all 4 touched (figureId, body) pairs (`c2`/remedial share one body in `g4v-01-02`):

  | Lesson/step | Figure | key | inBlocklist | aligned | risks() | words |
  |---|---|---|---|---|---|---|
  | g4v-01-02/c2 | mc-length-ladder | 1b36d39f | false | true | `[]` | 37 |
  | g4v-01-02/rem-g4v-table-c | mc-length-ladder | 1b36d39f | false | true | `[]` | 37 |
  | g4v-02-02/c1 | g4v-clock-60 | 426aa0a4 | false | true | `[]` | 28 |
  | g5d-03-01/c2 | pv4-times10-shift | 851d1291 | false | true | `[]` | 29 |

  All three previously-flagged conditions cleared exactly as claimed:
  `EXAMPLE_NUMBER_CONFLICT[figure=10+100+1000;text=9+900+1]` → `[]`;
  `EXAMPLE_NUMBER_CONFLICT[figure=1+5;text=60+2]` → `[]`;
  `OPERATION_CONFLICT[figure=multiplication;text=division]` → `[]`.

**Verdict: 3/3 KEEP.** Re-signed with fresh `reviewedBasisHash` values (content changed, hashes
correctly drifted from the original signatures) to
`reports/closure/cowork-staging/laneV-s318-final-dispositions.jsonl` (`recordId` prefix
`S318-VF-`). This closes the observation raised earlier in this report — the 3 candidate-key gaps
attributed to the G4G7 packet are now resolved, and (per the coordinator) the adversarial audit
test is fully green.
