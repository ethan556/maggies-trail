# S317 Batch-2 — Independent Verification

Reviewer: Claude Cowork independent verifier (S317). Read-only; edited nothing except the two
staging files this task names (`reports/closure/cowork-staging/laneV-s317-batch2-dispositions.jsonl`,
this report). No `npm`/`vitest`/`tsc` was run — verification below is independent hand
recomputation, direct source reading (`src/lib/figureTextAlignment.ts`,
`src/lib/figureTextMismatchBlocklist.generated.ts`, `src/lib/figureTextMismatchBlocklist.manualHolds.ts`,
`src/lib/figureNumericClaims.generated.ts`, `src/lib/figureNumericParity.ts`,
`src/components/figures.tsx`, `src/components/figureIds.ts`), `git diff HEAD` on every named lesson
and source file, and two Node one-off scripts (`node scripts/session/print-review-basis.mjs`,
and a `tsx` script that imports the repo's real `figureTextAlignment.ts` module to recompute
binding keys and `isFigureTextAligned` — same code path `LessonPlayer.tsx`/`FigureView.tsx` gate
rendering on).

## Scope

18 lessons across two implementer packets, both built on the four S317 Lane B assessment reports
(`S317_LANEB_DATA_DISTRIBUTIONS_ASSESSMENT.md`, `S317_LANEB_STATISTICAL_INFERENCE_ASSESSMENT.md`,
`S317_LANEB_FRACTIONS_ASSESSMENT.md`, `S317_LANEB_CONDITIONAL_PROBABILITY_ASSESSMENT.md`):

- **Lesson A — MCQ label-length answer-leak fixes (13 lessons)**: `dd-03-02` (k3), `si-01-02`
  (teaser), `si-01-03` (rk1), `si-02-02` (k4), `si-04-02` (rk1), `si-04-03` (k1), `si-05-01`
  (k2+rk1), `si-05-03` (rk1), `fr-02-01` (k3), `fr-02-04` (rem-nb-k), `fr-03-01` (k3), `cpr-03-01`
  (k1), `cpr-04-01` (k1) — implementer packet: `S317_LENGTH_LEAK_FIXES.md` +
  `cowork-staging/laneB-s317-lengthfix.jsonl`.
- **Lesson B — figure-truth fixes (5 lessons)**: `fr-04-01`, `fr-04-02`, `fr-04-04` (fractions ch4
  ILLUSTRATION_REPLACEMENT), `cpr-03-03`, `cpr-05-01` (conditional-probability P0 withholds) —
  implementer packet: `S317_FIGURE_TRUTH_FIXES.md` + `cowork-staging/laneA-s317-figures.jsonl`.

## Method

For every lesson: read the governing assessment's implementation contract first, formed an
independent view of what the fix must satisfy (correct option unchanged/first, TRUE elaboration of
existing wrong reasoning with no invented/weakened misconception, spread ≤15 chars or correct not
unique-longest, no meaning drift, feedback untouched — for Lesson A; a genuinely rendering,
truthful, accessible figure or truthfully-aligned prose — for Lesson B) — **then** read the
implementer's own reports and cross-checked for discrepancies. Independently recomputed every
option's character/word length and spread by script; independently recomputed every
`figureTextBindingKey`/`isFigureTextAligned` result via the repo's live module rather than trusting
the implementer's stated hash; independently confirmed the two new figure IDs are registered in
`FIGURE_IDS`; ran `git diff HEAD` on all 18 lesson files plus `figures.tsx`/`figureIds.ts` and
confirmed every byte changed matches what each implementer report claims, with no collateral edits.
Review-basis hashes for all 18 lessons were computed in one bulk invocation of
`node scripts/session/print-review-basis.mjs <all 18 ids>` and match `content/courses/**/lessons/*.json`
at the current working tree (all 18 resolved cleanly, 0 unknown).

## Verdict counts

| Decision | Count | Lessons |
|---|---|---|
| KEEP | 18 | dd-03-02, si-01-02, si-01-03, si-02-02, si-04-02, si-04-03, si-05-01, si-05-03, fr-02-01, fr-02-04, fr-03-01, cpr-03-01, cpr-04-01, fr-04-01, fr-04-02, fr-04-04, cpr-03-03, cpr-05-01 |
| REVISE | 0 | — |
| ESCALATE | 0 | — |

`gradeLanguageDecision = FIT` on all 18 (no edit in this batch touched vocabulary/register).
`visualDecision = SUFFICIENT` on all 18 — for the 13 Lesson-A lessons because the fix was purely
prose/label text and visuals were never in question; for the 5 Lesson-B lessons because the
previously-`REQUIRED` visual defect is independently confirmed resolved (see below).

## Non-KEEP reasons

None. Both implementer packets fully and precisely satisfied every governing contract, with no
discrepancies found between the claimed diffs and the actual `git diff HEAD` output, and no
mathematical, feedback, or scope-creep defects introduced.

## Discrepancies found between implementer claims and independent re-derivation

**None.** Every recomputed value matched the implementer's stated value exactly:

- All 13 Lesson-A option-length spreads (chars and words, before/after) matched
  `S317_LENGTH_LEAK_FIXES.md`'s table exactly.
- The recomputed `figureTextBindingKey("cpr-multiplication-area", <new cpr-03-03 c1 body>)` is
  `5d9a9fce` — matches the report's claimed value exactly, confirmed absent from the live
  `FIGURE_TEXT_MISMATCH_BLOCKLIST`, while the stale key `0dc18745` is independently confirmed still
  present in `figureTextMismatchBlocklist.generated.ts` (proof nothing was hand-edited to game the
  gate).
- `isFigureTextAligned("cpr-multiplication-area", <new c1 body>)` and
  `isFigureTextAligned("cpr-permutation-slots", <new cpr-05-01 c2 body>)` both independently
  recomputed as `true` via the real module — matches the report's claim.
- `git diff HEAD` on all 18 lesson files plus `figures.tsx`/`figureIds.ts` shows **only** the
  hunks each report describes: option labels for the 13 Lesson-A lessons (never `feedback`,
  `correct`, option `id`, or option order), and `c1`/`c2` body text or `figure` key for the 5
  Lesson-B lessons — no collateral edits, no scope creep into other files or other steps.

## Per-lesson verification notes (Lesson A — length-leak, 13 lessons)

For every lesson below: correct option's `id`, position (`options[0]`), `correct: true`, and
`feedback` text were confirmed byte-identical to before the edit (via `git diff HEAD`, which shows
no line touching those fields); only distractor `label` text changed.

| Lesson | Step | Spread chars (before→after, per report) | Independently recomputed (after) | Correct unique-longest (after) | Notes |
|---|---|---|---|---|---|
| dd-03-02 | k3 | 26→44 (word: 10→1) | 44 chars / 1 word — matches | No | `b`'s "four positions to choose from" correctly counts the 4-item unsorted list (9,2,7,4); `c`'s elaboration still asserts the same false "two acceptable medians" claim the unchanged feedback rebuts |
| si-01-03 | rk1 | 48→12 | 12 chars — matches | No | `o2`'s "as if patients chose their own arm instead of a coin flip" elaborates the general no-random-assignment misconception without contradicting the scenario, which states random assignment DID occur (feedback unchanged: "The patients WERE assigned at random here") |
| si-02-02 | k4 | 43→10 | 10 chars — matches | No | Each elaboration (renters, trustworthy-estimate, variability analogy) restates its own option's existing wrong claim |
| si-04-02 | rk1 | 29→8 | 8 chars — matches | No | `o2`'s "since the p-value measures the null" is a true-sounding elaboration of the reversed-conditional fallacy the feedback names |
| si-04-03 | k1 | 33→14 | 14 chars — matches | No | Elaborations extend the strong-evidence-equals-worth-it and too-good-to-be-true fallacies without new claims |
| si-05-01 | k2 | 30→13 | 13 chars — matches | No | Each of `o2`/`o3`/`o4`'s elaborations restates its own causal-direction misconception (helps/reverse-cause/no-relationship) |
| si-05-01 | rk1 | 17→3 | 3 chars — matches | No | `o2`'s "by calming the mind" names a plausible mechanism for the same causal-verb misconception |
| si-05-03 | rk1 | 38→8 | 8 chars — matches | No | `o2`'s "since a huge effect should shrink it further" elaborates the same wrong-question misconception the feedback rebuts |
| fr-02-01 | k3 | 32→10 | 10 chars — matches (≤15 target) | Yes, but ≤15 | Cosmetic-only extensions ("and easier to look at", "as good enough", "to ever draw"); no meaning drift |
| fr-02-04 | rem-nb-k | 23→8 | 8 chars — matches | No | `b`'s "one jump, one whole" correctly names the specific misconception (each half-jump = 1 whole) the feedback rebuts |
| fr-03-01 | k3 | 56→15 | 15 chars — matches (≤15 target, boundary) | Yes, but ≤15 | `c`'s "since one big piece beats two small ones" is the plausible-but-wrong justification the feedback rebuts by noting 2/4 = 1/2 exactly |
| cpr-03-01 | k1 | 58→14 | 14 chars — matches (≤15 target) | Yes, but ≤15 | `o4`'s added arithmetic "1/6 + 1/6 = 1/3" independently recomputed as correct (1/6+1/6=2/6=1/3); feedback still correctly calls it "a coincidence" |
| cpr-04-01 | k1 | 60→10 | 10 chars — matches (≤15 target) | Yes, but ≤15 | Elaborations reinforce the same false mutually-exclusive/equally-likely premises without contradicting the deck facts (the king of hearts exists) |

`si-01-02` (teaser-only, no MCQ): the new `r1.teaser` was checked against si-01-03's actual `c1`
body (read in full) and truthfully previews it — si-01-03 teaches exactly "four parts every
experiment needs" (control, random assignment, blinding, replication), matching the new teaser's
"Four parts every experiment needs — and what happens when one is missing." verbatim theme.
si-01-01's and si-01-03's own teasers are confirmed untouched (si-01-03.json's only diff hunk is
its `rk1` remedial, not `r1`).

## Per-lesson verification notes (Lesson B — figure truth, 5 lessons)

- **fr-04-01**: `c1.figure` rebound from the fixed `frac-compare-same-denom` (2/5 vs 3/5, built for
  fr-04-03) to a new, additive, parameterized `frac-compare-same-denom-cake` (den=8, leftNum=3,
  rightNum=5). Independently read the new component in `figures.tsx`: its `<title>` ("Same
  denominator: 5/8 has more shaded pieces than 3/8.") matches `c1`'s prose ("5/8 vs 3/8 of one
  cake") and `k1`'s `fractionCompare` widget (3/8 vs 5/8, `answer: "right"`) exactly.
  `isFigureTextAligned("frac-compare-same-denom-cake", c1.body)` independently recomputed as `true`.
  `fr-04-03` re-read and confirmed byte-unmutated, still correctly bound to the original figure IDs.
- **fr-04-02**: `c1.figure` rebound to a new `frac-compare-same-numer-brownies` (num=2, leftDen=3,
  rightDen=8). Title ("Same numerator: 2/3 has bigger pieces than 2/8.") matches `c1`'s prose and
  `k1`'s widget (2/3 vs 2/8, `answer: "left"`) exactly; `c2` (generic) correctly still binds the
  original `frac-compare-same-numer`, unchanged, still serving `fr-04-03`.
  `isFigureTextAligned("frac-compare-same-numer-brownies", c1.body)` recomputed as `true`.
- **fr-04-04**: `c1`'s example reworded from two *different* fractions on two objects to the *same*
  fraction (1/2) on two differently-sized wholes ("blueberry... watermelon... both called 'one
  half'"), now matching the existing `frac-compare-wholes` figure's actual rendering and this
  lesson's own established pattern (`i1`'s cookie-vs-cake halves, `k1`'s Marta sticky-note-vs-poster
  fourths) — read all three steps to confirm no meaning drift and mathematical soundness (a
  fraction's absolute amount depends on its whole). `isFigureTextAligned("frac-compare-wholes", new
  c1.body)` recomputed as `true`. Separately, `rem-sw-k`'s length-leak fix independently verified:
  spread fell from the reported 16 chars to 1, correct option `a` unchanged/first, distractor
  elaborations ("is the bigger fraction, so it wins" / "is the bigger amount") are true restatements
  of the same wrong fraction-only comparison the unchanged feedback rebuts.
- **cpr-03-03** (P0, `WITHHELD_BLOCKLIST_FINGERPRINT`): `c1.body` reworded, preserving the exact
  0.5×0.4=0.20 bus/sport relationship (recomputed correct). Recomputed
  `figureTextBindingKey("cpr-multiplication-area", new c1.body)` directly from the live module: got
  `5d9a9fce`, confirmed **absent** from `FIGURE_TEXT_MISMATCH_BLOCKLIST`; confirmed the stale key
  `0dc18745` is still present in `figureTextMismatchBlocklist.generated.ts` (proof of no
  hand-tampering). `isFigureTextAligned("cpr-multiplication-area", new c1.body)` recomputed as
  `true` — the figure now genuinely renders for the learner. **Noted per the review brief**: the
  `CURRENT_MANUAL_HOLD` row for `bindingKey: "0dc18745"` in
  `src/lib/figureTextMismatchBlocklist.manualHolds.ts` (source `cpr-03-03.json`, `steps.0`,
  `cpr-multiplication-area`) is confirmed still present and is now genuinely dangling — it no
  longer binds to any live placement, since `c1`'s hash changed. This is a real, correctly-flagged
  non-blocking follow-up for whoever owns that file next (out of scope for the `figures.tsx`-scoped
  implementer packet, and out of scope for this read-only verification lane); it does not affect
  this lesson's disposition because the actual rendering path is independently confirmed unblocked.
- **cpr-05-01** (P0, `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD`): `c2.body` reworded to explicitly restate
  the figure's fixed values ("5 runners... 5 × 4 × 3 × 2 × 1", "Filling 3 medal slots from those
  same 5 runners is the figure above: 5 × 4 × 3 = 60 podiums") while preserving the `n!`/`nPk`
  generalization. `isFigureTextAligned("cpr-permutation-slots", new c2.body)` recomputed as `true`
  (was `false` pre-fix, per independent atom-overlap trace: `figureAtoms=[5,4,3,60]` vs
  `textAtoms=[1]` for the original body). `c1` (already aligned) and remedial `rc1` (generic reuse)
  re-verified still aligned and untouched. Math re-verified sound: 5! = 5×4×3×2×1 = 120; nPk with
  n=5, k=3 gives 5×4×3 = 60.

## Registration / non-content checks

- Both new figure IDs (`frac-compare-same-denom-cake`, `frac-compare-same-numer-brownies`) are
  confirmed present in `src/components/figureIds.ts`'s `FIGURE_IDS` set (regenerated file, `git
  diff` shows exactly one changed line — the set literal — consistent with the documented generator
  flow, not a hand edit).
- `git diff --stat` on `src/components/figures.tsx` shows **158 insertions, 0 deletions** —
  confirmed purely additive (two new typed-props helper functions, two new zero-arg wrapper
  components, two new `FIGURES` map entries); no existing component body was touched.
- `git status --short` shows unrelated modifications to other courses (`fluency-20-g2`,
  `fractions-deeper-g3`, `measure-money-time`, `measurement-data`, `place-value`) and to
  `src/lib/schema.ts`/`src/components/widgets.tsx` — these belong to the sibling S317 batch-1
  packet (see `S317_BATCH1_VERIFICATION.md`) and are out of scope for this batch-2 review; none of
  them touch any of the 18 lessons or files named above.

## Raw evidence

- Review-basis hashes (bulk, all 18 lessons, one invocation, 0 unknown):
  `node scripts/session/print-review-basis.mjs dd-03-02 si-01-02 si-01-03 si-02-02 si-04-02
  si-04-03 si-05-01 si-05-03 fr-02-01 fr-02-04 fr-03-01 cpr-03-01 cpr-04-01 fr-04-01 fr-04-02
  fr-04-04 cpr-03-03 cpr-05-01` — hashes recorded per-lesson in
  `cowork-staging/laneV-s317-batch2-dispositions.jsonl`.
- Independent length/spread recomputation: Python script parsing each named step's `widget.options`
  directly from the current lesson JSON (not from the implementer's report).
- Independent figure-alignment recomputation: `tsx` script importing
  `src/lib/figureTextAlignment.ts` and `src/lib/figureTextMismatchBlocklist.generated.ts` directly
  (the same modules `LessonPlayer.tsx`/`FigureView.tsx` gate rendering on) to recompute
  `figureTextBindingKey` and `isFigureTextAligned` for both P0 fixes and all three fractions-ch4
  figure rebinds.
- `git diff HEAD` on all 18 lesson files, `src/components/figures.tsx`, and
  `src/components/figureIds.ts` — every changed byte accounted for by the two implementer reports;
  no discrepancy, no scope creep.

## Output

- `reports/closure/cowork-staging/laneV-s317-batch2-dispositions.jsonl` — 18 fresh
  `lesson-disposition` records, `recordId` prefix `S317-V2-`, `reviewer: "Claude Cowork independent
  verifier (S317)"`, all `decision: KEEP`.
- This report.

No lesson or course source file, no `figures.tsx`/`figureIds.ts`, and no prior closure/staging
artifact was edited by this review.

## Addendum — cpr-05-01 re-signature after post-KEEP tightening

After this review's `S317-V2-cpr-05-01` KEEP, the integrator tightened `c2.body`'s word count for
the pedagogy linter's 80-word cap; `git diff HEAD` on `cpr-05-01.json` confirmed exactly 1 file
changed / 1 insertion(+) / 1 deletion(-) (only `c2.body`), the 5/4/3/60 fixed-exemplar restatement
and `n!`/`nPk` mathematical soundness survive the tightening, and `isFigureTextAligned` was
independently re-recomputed as `true` — re-signed **KEEP** as `S317-VF-cpr-05-01` (basis hash
`83eeee36bbf254c09de13655d83e4c80fe91057e652f172d1952ae32354a1553`) in
`reports/closure/cowork-staging/laneV-s317-final-dispositions.jsonl`.
