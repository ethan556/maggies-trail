# S321 Independent Assessment — Lane B F4

Reviewer: Claude Cowork independent assessor (S321)
Reviewed at: 2026-08-20T20:01:48.000Z
Scope: content/courses/multistep-g4, content/courses/volume-problems-g5, content/courses/long-division-g5 (22 lessons, all supersede any current dispositions)
Dispositions: reports/closure/cowork-staging/laneB-s321-F4-dispositions.jsonl
Method: full read of every lesson JSON; hand-recomputed every numeric/mcq/barBuilder/areaModel/numberLineHop/estimateSlider value; cross-checked every referenced figure component's hardcoded numbers against lesson body text; ran a programmatic within- and cross-course exact/near-duplicate scan over mcq, numeric, and barBuilder widgets (normalizing the "Choose a new reason." / "Use a different check." / "Calculate this fresh case." / "Finish with a final case." trailing clause); verified every mcq has exactly one correct option and every predict outcomeId resolves; verified all referenced figure IDs exist and resolve to a component; confirmed mcq/predict use `seededShuffle` at render (src/components/widgets.tsx, src/components/LessonPlayer.tsx) and that lab widgets (barBuilder, areaModel) do not shuffle — platform-level pass, applies to all 22 lessons. Basis hashes pulled via `node scripts/session/print-review-basis.mjs`; no stale-hash or missing-lesson errors.

No math errors were found anywhere in the three courses. All defects found are duplicate-content (zero fresh instructional value on a second encounter) or an option-label-length leak. No visual promise was broken — every figure's hardcoded numbers match the concept text that cites it, and every referenced figure ID resolves to a real component.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| multistep-g4 | 8 | 6 | 2 | 0 |
| volume-problems-g5 | 8 | 3 | 5 | 0 |
| long-division-g5 | 6 | 4 | 2 | 0 |
| **Total** | **22** | **13** | **9** | **0** |

## REVISE list (one-phrase reasons)

1. **g4s-03-01** — k3 mcq byte-identical to g4s-02-03/k1 (cross-lesson duplicate).
2. **g4s-03-02** — k3 mcq byte-identical to g4s-01-02/k2 (cross-lesson duplicate).
3. **g5v-01-01** — k1/k3 mcq byte-identical within lesson.
4. **g5v-01-02** — k1/k3 mcq byte-identical within lesson.
5. **g5v-02-02** — k1/k3 mcq byte-identical within lesson, plus correct-option length leak.
6. **g5v-03-01** — k1/k3 mcq byte-identical within lesson.
7. **g5v-03-03** — ch1 numeric check byte-identical to k1 within lesson.
8. **g5l-02-02** — k3 mcq byte-identical to g5l-02-01/k1 (cross-lesson duplicate; also topically misplaced — a partial-quotients question inside the standard-algorithm lesson).
9. **g5l-03-01** — ch1 mcq correct-option length leak (64 chars vs. 35–44 for distractors).

## Implementation contract per REVISE

For every item below: only the named step's `widget.options` (mcq) or `widget.prompt`/`answer`/`commonErrors` (numeric) needs to change. Do not touch any other step, the `cml` block, `hints`, `explanationVariants`, or any other lesson. Preserve each check's existing misconception shape (what wrong answer maps to what feedback) — only the surface numbers/options need to be fresh.

- **g4s-03-01 / k3**: Replace the mcq's prompt+options with a new "is the estimate reasonable" scenario using different numbers (not 7×68−90/386/400), keeping the 4-option shape: (a) correct "near the estimate" verdict, (b) exact-doesn't-match-estimate distractor, (c) estimate-doesn't-match-exact distractor, (d) "nothing can be concluded" distractor.
- **g4s-03-02 / k3**: Replace the mcq's prompt+options with a new three-operation-order scenario (different quantities than 6×9/14/20), keeping the 4-option shape: correct multiply→subtract→add order plus the three misordered distractors.
- **g5v-01-01 / k3**: Either (a) write a second, genuinely different correct-reason option set for "why does counting unit cubes measure volume?", or (b) swap k3 to a numeric check (parallel to k2's pattern) so it no longer duplicates k1's mcq verbatim.
- **g5v-01-02 / k3**: Same treatment — new option wording for "how does the height act?" or convert k3 to a fresh numeric check.
- **g5v-02-02 / k3**: New option wording for "what advantage does V=B×h have?" (or convert to numeric check), **and** while editing, shorten the correct option / lengthen the distractors so no option is a length outlier (target roughly 25–40 chars for all four).
- **g5v-03-01 / k3**: New option wording for "how do you find the volume of a notched block?" (or convert to numeric check).
- **g5v-03-03 / ch1**: Replace the numeric prompt's base/height pair (currently 8×3=24, same as k1) with an unused pair, e.g. base 9 height 4 → 36, updating `commonErrors` proportionally (mix-mistake ≈ base+height, layers-only ≈ height) and `successFeedback`.
- **g5l-02-02 / k3**: Replace with a check specific to the standard algorithm (fixed place-value batching), not partial quotients — e.g. "Why does the standard algorithm's first quotient digit have to sit in a specific place-value column?" with a correct option naming place value and distractors naming free choice / no effect on the answer / one-digit-divisor-only.
- **g5l-03-01 / ch1**: Rewrite option 0 to match distractor length/register, e.g. "6 — 6×34=204 fits, 7×34=238 doesn't" (~34 chars), and correspondingly tighten/lengthen the three distractors so all four sit in a similar character-count band.

## KEEP verdicts (13)

g4s-01-01, g4s-01-02, g4s-01-03, g4s-02-01, g4s-02-02, g4s-02-03, g5v-02-01, g5v-02-03, g5v-03-02, g5l-01-01, g5l-01-02, g5l-02-01, g5l-03-02 — see per-lesson rationale in the NDJSON for recomputed values and figure checks; no defects found in any of these.

## Notes on scope discipline

- The `.chatgpt-work-cache` prefix file (CHATGPT_WORK_V4_EXACT_PREFIX.md) was read first and treated as evidence-accelerator only, per its own text — no cache entries were used as an authority substitute; every disposition here is based on direct recomputation against the current repository source and the `print-review-basis.mjs` hashes.
- Two of the cross-lesson duplicate pairs left the *earlier* lesson (g4s-01-02, g4s-02-03, g5l-02-01) as KEEP and flagged only the *later*, redundant occurrence (g4s-03-02, g4s-03-01, g5l-02-02) for REVISE, since the earlier lesson's content is original and correct in its own right; the redundancy only becomes a defect at the second encounter.
- No mathematical, visual-rendering, accessibility, or grade-language defects were found in any of the 22 lessons; every REVISE is a duplicate-content or option-parity finding as enumerated above.
