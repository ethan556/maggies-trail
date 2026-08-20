# S316 Lane B — Independent Verification of Implementation Packets

Reviewer: Claude Cowork independent verifier (S316)
Reviewed: 2026-08-20T01:35:24.000Z
Scope: 20 lessons across 4 courses (proportional-relationships, expressions-equations,
function-analysis, circle-theorems), verified against their assessor REVISE contracts in
`reports/closure/S316_LANEB_PROPORTIONAL_RELATIONSHIPS_ASSESSMENT.md`,
`S316_LANEB_EXPRESSIONS_EQUATIONS_ASSESSMENT.md`, `S316_LANEB_FUNCTION_ANALYSIS_ASSESSMENT.md`,
`S316_LANEB_CIRCLE_THEOREMS_ASSESSMENT.md`. Read-only; own view formed from
`git diff HEAD` + current JSON + hand recomputation before reading the implementer's own claims
(`cowork-staging/laneB-pr-implementation.jsonl`, `laneB-ee-fna-ct-implementation.jsonl`).
Dispositions staged to `reports/closure/cowork-staging/laneBV-implementations-dispositions.jsonl`
(20 NDJSON records, `recordId` `S316-BV-<lessonId>`). No `npm`/`vitest`/`tsc` was run, per
instructions; `node scripts/session/print-review-basis.mjs` (read-only hash helper) was run to
obtain each lesson's post-implementation `reviewedBasisHash`.

## Verdict counts

**KEEP: 20 / REVISE: 0 / ESCALATE: 0.**

Every one of the 20 contracted defects was independently recomputed and confirmed correctly
resolved: every rewritten `commonError`/`numericError`/`successFeedback` value is now literally
true of its drawn problem; every deduplicated table/prompt was re-derived by hand and no
byte-identical or normalized-identical duplicate remains within or across the affected lessons;
both circle-theorems fixes (added figure, rewritten teaser) are truthful and correctly scoped;
both function-analysis teaser swaps are consistent with `course.json`'s actual 6-chapter order;
the proportional-relationships choice-surface fix landed correctly in the shared widget component
and grades by `choice.id`, never index, so it cannot change correctness. No lesson ID, step ID,
conceptTag, widget type, or answer was altered anywhere. All feedback strings checked are ≥25
characters; the two negation-opening strings found in the touched files are byte-unchanged
pre-existing content, not introduced by this work, so they are noted but not attributed to this
implementation.

**No lesson is being sent back.** Three lessons carry a real secondary finding (below) that does
not, on the standard given, rise to a REVISE trigger (not gate-breaking, not a falsehood in the
delivered authored text) but is significant enough to flag prominently for follow-up engineering
work.

## Non-KEEP list

None. All 20 lessons: **KEEP**.

## Discrepancies / findings requiring follow-up

Three lessons resolved their contracted duplication defect by rewriting authored widget content in
a way that no longer matches the `variant.form` template declared on the same step in
`src/lib/variants.ts`. This is not a defect in the *authored* content shown to a learner today —
every number and every feedback string checked is correct — but it means the re-ask/"generate a
fresh problem from this seed" system (the entire point of this project's `variant` mechanism, per
`CLAUDE.md`) would silently produce a mismatched item if a learner regenerates one of these three
steps. None of these fail an automated gate: `scripts/content-check.ts` (backing
`validate:content`/`lint:pedagogy`) and `scripts/check-registration.mjs` were read and confirmed to
contain no check of generator-output-vs-authored-prompt fidelity — only `scripts/measure/verify.mts`
(a manual diagnostic, not a CI gate) would surface this by printing authored vs. generated side by
side.

1. **pr-03-01, steps k3 and ch1 (most severe of the three).** Both declare
   `"variant": {"gen": "proportional-plot"}` with no `form`, which resolves to the generator's
   default branch (`src/lib/variants.ts` ~line 18965). That branch draws an **integer** k in
   `[1, 4]` and always prints `"For k = ${k}, plot the points …"`. The fix (correctly, to escape a
   duplication with i2/i3 while staying inside the `plotPoint` schema's `MAX_PLOT_POINT_DIM=8` grid
   cap — see the implementer's own `schemaCatch` note) rewrote both steps to **fractional** rates
   (1.5 and 2/3) with different phrasing ("For a rate of X, plot the points …"). The generator can
   never produce this shape; regenerating either step would silently emit an integer-k "For k = X"
   item, which could re-collide with the k values (1–4) already used by this same lesson's own
   i1/k1/i2/k2. **The implementer's own claims file does not flag this** — no mention of the
   variant mismatch appears in the `pr-03-01` implementation record, in contrast to the two ee
   lessons below where the same class of issue was explicitly self-flagged. Recommend routing to
   the content/generator owner: either add a fractional-rate `form` to `proportional-plot` (a new
   dimension, not a wider default axis — consistent with `CLAUDE.md`'s own freshness-fix rule), or
   re-author k3/ch1 with an integer k not already used elsewhere in the lesson (this lesson's own
   k2 already demonstrates that reusing an integer k with a fresh point set is an accepted pattern).

2. **ee-04-02, step k3.** Declares `form: "solveSubtract"`, which hardcodes a bare
   `"Solve x − ${a} = ${result}"` template (`src/lib/variants.ts` ~line 28114). The fix rewrote k3
   into a word problem ("After spending $6, a gift card has $9 left…") to differentiate it from
   k2 (same form, same bare-equation shape) — correctly resolving the contracted duplication, but
   the declared form can never reproduce word-problem framing. **The implementer self-flagged this
   explicitly** in `laneB-ee-fna-ct-implementation.jsonl` ("FLAGGED: k3 still declares form
   'solveSubtract'… recommend follow-up generator work to add e.g. a 'withdrawSolve' form"),
   correctly identifying it as out of the packet's edit scope (lesson JSON only, not
   `src/lib/variants.ts`). Independently confirmed accurate.

3. **ee-04-03, step ch1.** Declares `form: "tickets"`, which hardcodes the literal word "Tickets"
   and unit "tickets" (`src/lib/variants.ts` ~line 9973). The fix reworded ch1 from a tickets
   context to "Parking costs $6 per hour… hours parked" to differentiate it from k4 (same form) —
   but kept the numbers byte-identical to the pre-fix ch1 (6, 42, 7), so the underlying skill
   remains the same single-operation division item, just re-skinned; the assessor's alternative
   ("combine with a fixed fee" for a genuine second operation layer) would have produced a more
   clearly distinct instructional job. The declared `tickets` form can never produce "Parking…
   hours" wording. **Also self-flagged by the implementer**, correctly and for the same
   out-of-scope reason as #2.

No other discrepancy was found between my independent analysis and the implementer's own claims
files — every arithmetic check, every preserved-field claim, and every scope note in both
`laneB-pr-implementation.jsonl` and `laneB-ee-fna-ct-implementation.jsonl` was independently
reproduced and matched. The `pr-04-02` implementation record's claim of "file is byte-identical to
its pre-task state" was confirmed via `git diff --stat` returning empty.

## Per-lesson verification summary

| Lesson | Assessor contract | Verified fix | Disposition |
|---|---|---|---|
| pr-01-01 | k2 false feedback (32) | Rewritten to "flips BOTH fractions… 4×8=32" — true | KEEP |
| pr-01-02 | 4 false feedbacks (49,10,10,9→25) | All 4 rewrites recomputed and true | KEEP |
| pr-01-03 | 2 false feedbacks (10, 25) | Both rewrites recomputed and true | KEEP |
| pr-02-01 | Choice-shuffle + i1≈ch1 + cross-lesson dup | Widget shuffle fixed; ch1 retabled (k=5); zero dup remains chapter-wide | KEEP |
| pr-02-02 | Choice-shuffle + i2≈k2 + cross-lesson dup | Widget shuffle fixed; k1/i2/k2/remedial retabled; zero dup remains | KEEP |
| pr-02-03 | Choice-shuffle + cross-lesson dup (bulk) | Widget shuffle fixed; i1/k1/i2/i3/k2/k3/remedial retabled; zero dup remains | KEEP |
| pr-03-01 | i2≈k3, i3≈ch1 within-lesson dup | k3/ch1 retabled with fractional rates, both correct; **variant/generator mismatch — see finding 1** | KEEP (finding) |
| pr-04-02 | Choice-shuffle only, no content change expected | Confirmed zero JSON diff; widget fix covers it | KEEP |
| pr-04b-02 | ch1 false feedback (1920) | Rewritten to "240×8=1920… 240÷0.08=3,000" — true | KEEP |
| ee-01-02 | k3 duplicates k1's job | Retargeted to i1's doubling sequence, new additive-error trap (18) | KEEP |
| ee-01-03 | ch1 garbled/false trap (42) | Replaced with computed trap 44 = (2×3)²+8 | KEEP |
| ee-02-03 | ch1 hedged trap (9) | Replaced with explicit derivation 3×(5−8)=−9→9 | KEEP |
| ee-03-03 | ch1 false trap (16) | False "3x alone=15" removed; true derivation 3×5+1=16 | KEEP |
| ee-04-02 | k2/k3 literal duplicate (form solveSubtract) | k3 reworded as gift-card word problem; **variant/generator mismatch — see finding 2 (self-flagged)** | KEEP (finding) |
| ee-04-03 | k4/ch1 literal duplicate (form tickets) | ch1 reworded to parking context; **variant/generator mismatch, shallow fix — see finding 3 (self-flagged)** | KEEP (finding) |
| fna-01-03 | i1 fabricated wrong-sign feedback | Replaced with true rise/run=36/6=6 narrative | KEEP |
| fna-05-03 | False "course complete" teaser | Now points forward to ch6, consistent with course.json order | KEEP |
| fna-06-01 | Backward-pointing teaser | Now carries the true course-complete message | KEEP |
| cr-05-03 | c1 missing figure | `cr-cyclic-quad` added; verified the figure's title/label matches c1's own prose | KEEP |
| cr-06-01 | Dangling forward-reference teaser | Replaced with truthful 6-chapter closing summary | KEEP |

## Method notes

- Every table/point/constant rewrite was recomputed by hand (ratios, cross-multiplication,
  fraction reduction) and checked against every `successFeedback`, `explanationVariants`, choice
  `feedback`, `numericErrors`/`commonErrors`, and `hints` string touched in the same diff — not
  just the primary answer.
- `evaluate.ts` was read for `proportionalReasoningLab` and `percentChangeLab` to confirm both
  grade strictly by `choice.id`/`choiceId` lookup, never by array index, before accepting that the
  `widgets.tsx` shuffle fix cannot change correctness or which feedback fires.
- A full pairwise scan (Python) of every `pairs` tuple and every `prompt` string across
  pr-02-01/02/02/03 (steps + remedials) was run to confirm zero remaining byte-identical or
  normalized-identical (regex `\d+`→`#`) duplicates, per the task's explicit instruction — not just
  the specific pairs the assessor named.
- `plotPoint` grid dimensions (`cols`/`rows`) were confirmed unchanged at 8×8 in pr-03-01, and every
  `targets`/`pointErrors` coordinate in the touched steps confirmed ≤8, matching
  `src/lib/schema.ts`'s `MAX_PLOT_POINT_DIM=8`.
- ID/conceptTag/widget-type preservation was checked programmatically (structural diff of every
  `id`, `conceptTag`, and widget `type` field) across all 18 touched lesson JSON files against
  `HEAD` — zero mismatches.
- Feedback length (≥25 chars) and no-negation-opening were checked across every `feedback` string
  in all 18 touched files; the 2 negation-opening hits found are pre-existing, untouched by this
  diff (confirmed via `git diff` showing no change to those lines), so not attributed to this work.
- `mcq` correct-first ordering was checked programmatically across all touched files — no
  violations.
- `cr-05-03`'s newly-attached figure component (`CrCyclicQuad` in `src/components/figures.tsx`) was
  read in full: its accessible `<title>` and on-canvas label were compared against step c1's own
  prose (which already states the full supplementary-angle claim and its arc-based derivation) to
  confirm the figure is not a premature spoiler of c2's content but a genuine match for what c1
  itself teaches.
- `fna-05-03`/`fna-06-01` teasers were checked against `course.json`'s declared `chapters` array
  (`ch1-rates-of-change` … `ch6-comparing-representations`), confirming `ch6`/`fna-06-01` is
  unambiguously the course's final lesson.
- `cr-06-01`'s new closing teaser was checked line-by-line against the course's actual 6 chapters
  (from the assessor's own course summary) — every named topic corresponds to a real, completed
  chapter.
- `src/components/widgets.tsx`'s diff was read in full (not just the two widgets named in the pr
  contract): the same `seededShuffle` fix was applied to nine widget types
  (`CompositeAreaLabW`, `TrialProbabilityLabW`, `PercentChangeLabW`, `EquationOutcomeLabW`,
  `ProportionalReasoningLabW`, `PlaceValueTransformLabW`, `PointSetReasoningLabW`,
  `ExactNumberLabW`, `AffineRelationshipLabW`, `QuotientReasoningLabW`, `GraphStoryLabW` — a wider
  sweep than this packet's own contract, presumably shared infrastructure work for other lanes).
  Only `PercentChangeLabW` and `ProportionalReasoningLabW` were in this verification's scope; both
  were confirmed correctly fixed with `useMemo`-memoized shuffles keyed on `seed`, and the
  `EquationOutcomeLabW` hook placement was checked for a Rules-of-Hooks violation (the shuffle hook
  runs unconditionally before the component's `mode==="transform"` early return) — none found.
  `seededShuffle` and `useMemo` were both already imported; no new imports were required.

## Gate note

Per instructions, no `npm`/`vitest`/`tsc` command was run. `node scripts/session/print-review-basis.mjs`
(a read-only hash-printing helper, not a build/test gate) was run to obtain each lesson's current
`reviewedBasisHash` for the disposition records. All findings above are raw, source-derived
verification evidence; this document and the staged dispositions do not themselves constitute
closure — they are evidence for the next stage of the S316 process.
