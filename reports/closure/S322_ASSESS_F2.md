# S322 Independent Assessment — Lane B F2 (Calculus-track Algebra 1 nonlinear-relations block)

Reviewer: Claude Cowork independent assessor (S322)
Reviewed at: 2026-08-20T21:08:07.000Z
Scope: content/courses/absolute-value-piecewise, content/courses/inequalities-and-regions,
content/courses/nonlinear-systems (24 lessons total: 9 + 9 + 6). Every disposition supersedes any
prior decision on these lesson IDs.
Dispositions: reports/closure/cowork-staging/laneB-s322-F2-dispositions.jsonl
Read-only on content; only the two staging files listed in the task were written.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read first and obeyed: it establishes that
the ChatGPT Work cache, prior recommendations, and any earlier KEEP labels are evidence
accelerators only, never self-approving. No cache entry for these lesson IDs was found or used;
every disposition below is a fresh, from-source recomputation.

## Method

- Read every one of the 24 lesson JSON files in full (all steps: concept, interactive, check,
  challenge, recap, and any remedials block).
- Hand-recomputed every mcq/numeric/challenge answer, including absolute-value cases (distance vs.
  position, |x| solution counts of 0/1/2), inequality boundary inclusion (strict vs. non-strict,
  dashed vs. solid), and nonlinear-system intersections — every line/parabola and line/circle
  crossing was verified by substituting back into **both** original equations, not just the solved
  one (e.g. nls-01-01's (2,4) and (-1,1) both checked against y=x² and y=x+2; nls-02-02's (-4,-3)
  and (3,4) both checked against y=x+1 and x²+y²=25).
- For every `plotPoint` widget, decoded the engine's 1-indexed `targets`/`pointErrors` coordinates
  against `xLabels`/`yLabels` (`src/components/widgets.tsx` `PlotPointW`, confirmed
  `xScale[p.x-1]`/`yScale[p.y-1]`) and verified the resulting real point against the lesson's math,
  including every `pointErrors` distractor's own stated feedback.
- Verified `systemsExplore`, `feasibleRegionExplore`, `estimateSlider`, `functionMachine`, and
  `numberLinePlace` widget targets against the lesson's algebra.
- Ran a within-course and cross-course duplicate scan (byte-identical widget JSON, and prompt-text-
  only near-duplicate scan) over all 24 lessons' steps: zero duplicate clusters, either kind.
- Checked every mcq for exactly one correct option and every `predict` for a resolvable
  `outcomeId`: no failures.
- Checked every mcq's option-label character lengths for a correct-option outlier against its own
  distractors (not raw ratio across the whole set, which is dominated by short numeric answers);
  flagged only genuine standouts.
- Confirmed every `figure` id cited by a `concept`/`interactive` step resolves to a real component
  in `src/components/figures.tsx`, and that each figure's hardcoded numbers/labels match the
  concept text that cites it (spot-read source for every figure in absolute-value-piecewise, plus
  targeted reads elsewhere).
- Confirmed platform-level shuffle behavior directly in `src/components/widgets.tsx`: `mcq`
  (`McqW`, L448) and `predict` (`LessonPlayer.tsx` L116-118) both use `seededShuffle` at render
  (deterministic per lesson+step, never `Math.random`); `dragBucket` — the only discrete-choice lab
  widget used across these 24 lessons (iar-02-03, iar-03-03, nls-01-03, nls-02-03) — also uses
  `seededShuffle` with an anti-grouping fallback (the S316/S320 lab-shuffle fix). This is a
  platform-level pass and applies to all 24 lessons; `plotPoint`, `numberLinePlace`,
  `systemsExplore`, `feasibleRegionExplore`, `estimateSlider`, `functionMachine` are continuous/
  spatial widgets with no discrete option list to shuffle.

No math errors were found in any of the 24 lessons — every intersection, vertex, discriminant,
boundary case, and step-function computation checked out exactly. Two REVISE-worthy defects were
found, both narrow, single-string fixes; nothing else in either flagged lesson needs to change.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| absolute-value-piecewise | 9 | 9 | 0 | 0 |
| inequalities-and-regions | 9 | 7 | 2 | 0 |
| nonlinear-systems | 6 | 6 | 0 | 0 |
| **Total** | **24** | **22** | **2** | **0** |

All 24 lessons: `visualDecision = REQUIRED` (every lesson's figure and/or interactive widget —
number-line, V-graph, half-plane, feasible-region, or line/curve intersection — is the load-bearing
representation of the concept being taught, not decorative); `gradeLanguageDecision = FIT`
(consistent Algebra 1 / grade 9 register throughout — "distance," "vertex," "feasible region,"
"discriminant," "corner principle" — precise without being needlessly formal).

## REVISE list (one-phrase reasons)

1. **iar-01-02** — ch1 mcq's correct option is a length/construction outlier vs. its distractors (option parity).
2. **iar-03-03** — i1b step mislabels the x+2y≤8 constraint "the flour cap" instead of "the oven cap" (terminology error).

## Implementation contract per REVISE

For every item below: only the named field needs to change. Do not touch any other step, the
`cml` block, `hints`, `explanationVariants`, `remedials`, or any other lesson.

- **iar-01-02 / ch1**: The mcq prompt "For y > 2x, why can't (0, 0) be the test point — and what do
  you do?" is otherwise correct (the concept, the math, and the two distractors are all fine).
  Only rewrite option `o1`'s label so it is not the sole option to carry both a parenthetical
  verification and a prescriptive fix — either trim it to match the distractors' register (e.g.
  "It's on the boundary — use a different point") or lengthen `o2`/`o3` with comparable
  justification clauses so no option is a construction/length outlier. Keep `o1` correct and its
  feedback text unchanged.
- **iar-03-03 / i1b**: In the `pointErrors` entry for `{x: 4, y: 4}`, change `"breaks the flour cap
  x + 2y ≤ 8"` to `"breaks the oven cap x + 2y ≤ 8"` — a one-word fix to match this lesson's own
  established terminology (the story is cookies/brownies/oven slots; "flour" belongs to the
  unrelated iar-03-01 muffins-and-scones lesson). No other text in this step or lesson needs to
  change.

## KEEP verdicts (22)

avp-01-01, avp-01-02, avp-01-03, avp-02-01, avp-02-02, avp-02-03, avp-03-01, avp-03-02, avp-03-03,
iar-01-01, iar-01-03, iar-02-01, iar-02-02, iar-02-03, iar-03-01, iar-03-02, nls-01-01, nls-01-02,
nls-01-03, nls-02-01, nls-02-02, nls-02-03 — see per-lesson rationale in the NDJSON for recomputed
values, plotPoint coordinate decoding, and duplicate/figure checks; no defects found in any of
these.

## Notes on scope discipline

- No lesson in this scope had a stale or missing review-basis hash; `node
  scripts/session/print-review-basis.mjs` resolved all 24 lesson IDs cleanly against current
  source.
- iar-01-01, iar-01-02, iar-02-01, iar-02-02, nls-01-01, nls-01-02, nls-02-01, nls-02-02 have no
  `remedials` block; this is a structural convention consistent across both courses (only the
  chapter-closing lesson — the "-03" lesson — carries a remedial), not a defect. The
  absolute-value-piecewise course instead gives every lesson a remedial, which is a stricter
  policy, not a weaker one — no course was penalized for its remediation density.
- Several mcq option sets show a correct-vs-distractor length gap in the 1.5-2x range (e.g.
  avp-02-02/k3, avp-03-01/k3, iar-02-02/k1, nls-01-02/k3); these were checked individually and are
  ordinary content-driven variance (the correct answer needs a real causal explanation while wrong
  answers are terse dismissals), with no consistent longest-is-correct or shortest-is-correct bias
  across the 24 lessons — only iar-01-02/ch1 crossed the bar into a genuine outlier and is flagged
  above.
- No byte-identical or near-duplicate widget content was found anywhere in this 24-lesson scope,
  within or across the three courses.
