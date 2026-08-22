# S323 ENGINEERING packet — execution report

Session: S323, lane A engineering (cowork-s323-eng). Scope: two tasks only —
(1) `SequenceReasoningW` choice-mode seeded-shuffle fix (mb-05-01 P0 escalation from
`reports/closure/S322_ASSESS_F1.md` §3), (2) `mult-04-04` fail-closed figure
(`reports/closure/S322_V2_F479_FIXES.md` item 16 / `reports/closure/S321_ASSESS_F9.md` REVISE 1).

## Task 1 — SequenceReasoningW choice-mode mastery-integrity fix (mb-05-01, P0)

### Defect

`sequenceBuild` widgets with `task !== "dial"` render through `SequenceReasoningW`
(`src/components/widgets.tsx`), whose `answerMode === "choice"` branch mapped
`(spec.choices ?? [])` directly — authored order, correct claim overwhelmingly listed first.
A learner could pass by always pressing the first button. Same P0 class fixed across eleven
sibling lab widgets in S316 (`S316_LAB_CHOICE_SHUFFLE_FIX.md` / `_SWEEP.md`).

### Fix (diff summary, `src/components/widgets.tsx`)

- `SequenceReasoningW` signature: destructured `seed` from `WProps<TSequenceBuild>`
  (previously not destructured at all).
- Added, immediately after the `state` derivation (unconditional, before any branch, per
  Rules of Hooks):
  `const orderedChoices = useMemo(() => { const choices = spec.choices ?? []; return seededShuffle(choices, seed ?? choices.map((choice) => choice.id).join("|")); }, [seed, spec.choices]);`
  — byte-for-byte the sibling seed-keying convention (`seed ?? ids.join("|")`), with the
  `?? []` guard because `spec.choices` is absent in numeric mode (`seededShuffle([])` is a
  documented no-op, cf. `EquationOutcomeLabW`). Explanatory comment block added mirroring
  McqW's rationale.
- Choice branch renders `orderedChoices.map(...)` instead of `(spec.choices ?? []).map(...)`.
  Display order only — nothing else in the component changed.

### Grading independence (verified by read)

- Component-local: `selected` is looked up by `choice.id`; `correctChoice` by
  `choice.claim === truth.answerClaim`. No index use.
- `src/lib/evaluate.ts` `case "sequenceBuild"` (choice arm, ~line 1348): looks the pick up via
  `spec.choices.find((candidate) => candidate.id === state.choiceId)` and grades
  `choice.claim === truth.answerClaim`. Feedback comes from the matched choice object. Zero
  positional keying anywhere in the path (evaluate, readiness check ~line 2398, reveal text
  ~line 2864 — all id/claim-keyed).

### Authored-content sweep — every sequenceBuild instance

26 lesson files reference `"sequenceBuild"`; parsed each widget instance:

| Lesson | task | answerMode | Affected | Note |
|---|---|---|---|---|
| mb-05-01 (multiply-bigger) | ruleType | **choice** (3 choices) | YES | correct choice authored first ("Multiply by 2") |
| sr-01-01 (sequences-series) | ruleType | **choice** (4 choices) | YES | correct choice authored first |
| sr-02-03 (sequences-series) | sigmaRepresent | **choice** (4 choices) | YES | correct choice authored first |
| sr-05-03 (sequences-series) | repeatingDecimal | **choice** (4 choices) | YES | correct choice authored first |
| sr-01-03, sr-02-01, sr-02-02, sr-03-01, sr-03-02, sr-03-03, sr-04-01, sr-04-02, sr-04-03 | reasoning tasks | numeric | no | no choices rendered |
| ee-01-02, fn-02-01, fn-02-03, fn-03-01 (x3), fn-03-02 (x3), fn-03-03 (x3), fn-04-01, fn-04-02, fn-04-03, sr-01-02, sr-05-01, sr-05-02, sc-01-01 | dial (default) | dial | no | routed to `SequenceDialW` |

Position-assumption text scan of the 4 affected lessons
(`first option|choice|button`, `top`, `option A/1`, `left(most)`, `position`): only hits are
mathematical "position n" prose in sr-01-01/sr-02-03/sr-05-03 (`atPosition` params and
explicit-vs-recursive rule language) — no lesson text references the on-screen position of any
answer choice. No lesson-JSON edits needed; the S322_ASSESS_F1 contract's remaining item
("confirm evaluation keys off choice.id") is verified above, and the contract explicitly rules
out reordering mb-05-01's JSON.

### mb-05-01 bookkeeping

- `node scripts/session/print-review-basis.mjs mb-05-01` →
  `bc44190c8f0c91396da7d8eb9f26f81bf47f255b5ccb836fba81e63ac73d8759` (lesson JSON untouched;
  fix is renderer-level).
- Disposition appended to `reports/closure/cowork-staging/laneA-s323-eng.jsonl`
  (`recordId: s323-eng-mb-05-01`, KEEP / SUFFICIENT / FIT).

## Task 2 — mult-04-04 fail-closed figure

### Contract

`S321_ASSESS_F9.md` (REVISE 1 + implementation contract) and `S322_V2_F479_FIXES.md` item 16:
c1/c2 cited `mult3-which-op` (a generic ×-vs-÷ two-line chooser with no two-step chain); the only
fix is a NEW figure showing an intermediate pile built by multiplication, then a subtraction
acting on that pile, bound to `c1.figure`/`c2.figure` only — no other step content changes.

### New figure

- **Component**: `Mult3GroupsAdjustCars` in `src/components/figures.tsx`, placed with the mult3
  family (after `Mult3WhichOp`). Additive only — no existing component's rendered output was
  modified by this packet.
- **Implementation**: reuses the existing typed helper `EqualGroupsEndAdjustBar({ groups, perGroup,
  adjustment, suffix })` (the S316 "equal-groups-then-subtract-ONCE-from-the-end" bar, already
  proven in `g4v-groups-adjust-distance/time/money`), which is exactly c2's structure — the
  adjustment is crossed off once at the end of the WHOLE bar, never inside every group, matching
  c2's "Subtracting rows or changing every group would act on the wrong quantity."
- **Params**: `groups={5} perGroup={8} adjustment={6} suffix=" cars"` — the lesson's own k2 story
  (parking lot: 5 rows × 8 cars, 6 drive away). Numbers recomputed and double-checked:
  5 × 8 = 40; 40 − 6 = 34. Rendered captions: "5 equal parts of 8 cars", "5 × 8 = 40 cars",
  "−6", "(5 × 8) − 6 = 34 cars".
- **Registered id**: `mult3-groups-adjust-cars` (FIGURES registry entry after `mult3-which-op`);
  `node scripts/gen-figure-ids.mjs` regenerated `src/components/figureIds.ts` — **2017 ids**
  (was 2016), new id present.
- **Title convention**: `<title>` uses number words, not digits (mult3-family convention), so the
  renderer-derived numeric-claims map will not gate future bodies against these exact digits;
  c1/c2 bodies contain no digits, so alignment passes under every branch of
  `isFigureTextAligned`.
- **Lesson wiring**: `content/courses/multiplication-division/lessons/mult-04-04.json` —
  `c1.figure` and `c2.figure` changed `"mult3-which-op"` → `"mult3-groups-adjust-cars"`. No step
  ids, widgets, options, feedback, or other text touched (verified by diff: 2 lines).

### Viewport parity budget (≤261)

Verified with a one-off node script applying `figureViewportParity.s260.test.tsx`'s exact
numeral-box model (width = chars × fontSize × 0.72, anchor-aware, y ∈ [y−0.98fs, y+0.28fs])
to every numeral-bearing text the new figure renders, against its `viewBox="0 0 300 100"`:

```
OK  "5 equal parts of 8 cars"       x[58.9..241.1]  y[4.2..18.1]
OK  "5 × 8 = 40 cars"               x[61.0..169.0]  y[60.2..72.8]
OK  "−6"                            x[225.8..240.2] y[52.2..64.8]
OK  "(5 × 8) − 6 = 34 cars"         x[59.3..240.7]  y[80.2..95.4]
ALL CONTAINED — adds 0 to the <=261 budget
```

Geometry: boxes end at x=246 < 300. The figure adds zero overruns, so the pinned global budget
is unchanged by this packet.

### mult-04-04 bookkeeping

- `node scripts/session/print-review-basis.mjs mult-04-04` (after final edits) →
  `026254e72598e1eb5c23d53288561533281ac2fb4e5caefe3d7e03c78e9fc6eb`.
- Disposition appended to `reports/closure/cowork-staging/laneA-s323-eng.jsonl`
  (`recordId: s323-eng-mult-04-04`, KEEP / SUFFICIENT / FIT).

## Gates run and results

| Gate | Command | Result |
|---|---|---|
| Figure id generator | `node scripts/gen-figure-ids.mjs` | PASS — `figureIds.ts written: 2017 ids`; `mult3-groups-adjust-cars` present |
| VIS-01 illustration measurement | `npx tsx scripts/audit/vis01-illustration-measurement.mts` | PASS — 3573 placements, **all 3573 RENDERS**, 0 withheld/unregistered; mult-04-04 c1 (`steps.0`) and c2 (`steps.3`) both `RENDERS`, registered=true, aligned=true, blocklisted=false (regenerated tracked artifact `reports/vis/VIS01_PLACEMENTS.csv`; its few other changed rows reflect prior sessions' uncommitted source already in the tree, re-measured) |
| Figure-text alignment (underlying script, not npm) | `node scripts/audit/figure-text-alignment.mjs` (package.json `verify:figure-text-alignment`) | PASS — `{"uses":3573,"fixedExemplars":12,"renderedFixed":12,"suppressed":0}` |
| Viewport parity model (one-off, no vitest) | node one-off replicating `figureViewportParity.s260.test.tsx` math | PASS — all 4 numeral boxes inside viewBox; +0 to ≤261 budget |
| TSX syntax | `esbuild` transform (loader tsx) of `figures.tsx` and `widgets.tsx` as a node one-off, plus careful re-read of every hunk | PASS — both parse; diffs reviewed hunk-by-hunk |

Per packet rules, no `npm run`, no vitest, no tsc, no build was executed.

## Files changed by this packet

- `src/components/widgets.tsx` — `SequenceReasoningW` seed destructure + `orderedChoices` memo +
  choice-branch render swap (Task 1 only; the pre-existing uncommitted GraphZoomW hunk in the
  working tree is prior sessions' work, untouched).
- `src/components/figures.tsx` — `Mult3GroupsAdjustCars` + one FIGURES registry line (additive;
  pre-existing uncommitted Mult3AddTable / MonomialDistributeArea / VmSixtyCubeBox hunks are
  prior sessions' work, untouched).
- `src/components/figureIds.ts` — regenerated by the id generator.
- `content/courses/multiplication-division/lessons/mult-04-04.json` — c1/c2 figure rebind only.
- `reports/vis/VIS01_PLACEMENTS.csv` — regenerated by the VIS-01 measurement script.
- `reports/closure/cowork-staging/laneA-s323-eng.jsonl` — two disposition records.
- `reports/closure/S323_ENGINEERING.md` — this report.

No escalations. Both tasks landed.
