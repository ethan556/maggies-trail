# S322 Independent Assessment — Lane B F5

Reviewer: Claude Cowork independent assessor (S322)
Reviewed at: 2026-08-20T21:10:59.000Z
Scope: content/courses/number-line-g2, content/courses/length-problems-g2, content/courses/arrays-even-odd-g2 (30 lessons, all supersede any current dispositions)
Dispositions: reports/closure/cowork-staging/laneB-s322-F5-dispositions.jsonl
Method: full read of every lesson JSON (all 9 steps: c1,i1,k1,c2,i2,k2,k3,ch1,r1); hand-recomputed every numeric/mcq/oddEvenPairs/tapDiagram/unitRuler/lengthCompare value and every `commonErrors`/`commonLandings` trap against the misconception its feedback names; verified every mcq has exactly one correct option, 4 options, and unique option ids (scripted, 0 violations); verified every mcq's correct-option label length against its distractors for length-leak (scripted, 0 violations found — none of the 90 mcqs in scope has an outlier-length correct option); verified every `predict.outcomeId` resolves to a real option and every predict carries a `reveal` (scripted, 0 violations); verified narration is present on every concept step (scripted, 0 violations — G2 read-aloud requirement met throughout); ran a programmatic byte-identical widget scan (whole-widget JSON equality) both within each lesson and across all lessons in the same course, and a second prompt-excluded structural scan (digit-collapsed prompt + normalized mcq option-label set) to catch same-template-different-numbers duplicates; traced every referenced `figure` id (10 distinct ids across the three courses, including three shared/generic ids reused from other courses' figure libraries — `mmt-any-start`, `mmt-how-much-longer`, `mult3-flip`, `number-line-jumps`) into `src/components/figures.tsx` and confirmed each renders content matching the concept prose that cites it. Basis hashes pulled via `node scripts/session/print-review-basis.mjs`; no stale-hash or missing-lesson errors. Read `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` first and treated it as an evidence accelerator only, per its own text — no cache entry was used as an authority substitute. Cross-checked the S318 progression-P0 fix log (`reports/closure/S318_PROG_P0_IMPLEMENTATION.md`) for these three courses (8 previously-repaired steps: g2a-01-02/g2a-02-02/g2a-02-03/g2a-03-03 in arrays; g2p-02-02/g2p-03-01/g2p-03-04 in length; g2l-01-02 in number-line) and confirmed none of those specific repaired steps were re-flagged here — all findings below are steps not touched by that batch.

No answer-truth errors were found: every numeric answer, every mcq correct option, every `oddEvenPairs`/`tapDiagram` target, and every figure's hardcoded numbers match the concept text that cites them. Every defect found is one of three classes: (1) a within-lesson or cross-lesson **duplicate check** giving a later occurrence zero fresh instructional value (both byte-identical-widget and same-template-different-numbers varieties — 20 of 22 REVISE findings), (2) a **mismatched commonError trigger value** that doesn't match its own stated misconception (2 findings, both isolated to a single numeric widget each), with no other defect classes (no visual-promise failures, no option-length leaks, no unresolved predicts, no missing narration, no mcq structural violations) found anywhere in the 30-lesson scope.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| number-line-g2 | 10 | 6 | 4 | 0 |
| length-problems-g2 | 10 | 4 | 6 | 0 |
| arrays-even-odd-g2 | 10 | 4 | 6 | 0 |
| **Total** | **30** | **14** | **16** | **0** |

## REVISE list (one-phrase reasons)

**number-line-g2**
1. **g2l-01-03** — k1/k3 "halfway between two marks" mcq template-duplicate within lesson.
2. **g2l-03-01** — k1/k3 "first addend is the start" mcq template-duplicate within lesson (also a 3rd occurrence of a template originated at g2l-02-01/k3).
3. **g2l-03-02** — k1 "gap between marks" mcq template-duplicate of g2l-02-02/k3; k2 commonError trigger value (32) mismatches its own "measured PAST both marks" feedback (should be 64+43=107).
4. **g2l-03-03** — k3 "gap between marks" mcq is a 3rd occurrence of the g2l-02-02/k3 template.

**length-problems-g2**
5. **g2p-01-02** — k3 "shortest of four items" mcq template-duplicate of g2p-01-01/k3.
6. **g2p-02-01** — k2 commonError trigger value (62) mismatches its own "found how much longer" feedback (should be 32−26=6).
7. **g2p-03-01** — k1 mcq byte-identical to g2p-02-03/k3.
8. **g2p-03-02** — k1 mcq byte-identical to g2p-02-01/k3; ch1 numeric byte-identical to g2p-02-01/ch1.
9. **g2p-03-03** — k3 mcq byte-identical to g2p-02-02/k3.
10. **g2p-03-04** — k1 mcq byte-identical to g2p-01-03/k3.

**arrays-even-odd-g2**
11. **g2a-01-02** — k2 oddEvenPairs byte-identical to g2a-01-01/k2; k1 mcq template-duplicate of g2a-01-01/k3.
12. **g2a-01-03** — i2 oddEvenPairs byte-identical to g2a-01-01/i1.
13. **g2a-01-04** — k1/ch1 "which addition shows X as a double" mcq template-duplicate within lesson.
14. **g2a-02-02** — k2 numeric byte-identical to g2a-02-01/k3; k3 mcq byte-identical to g2a-02-01/k2.
15. **g2a-03-02** — k1 mcq byte-identical to g2a-02-03/k3 (and template-duplicate of its own k3); k2 numeric byte-identical to g2a-02-01/k1.
16. **g2a-03-03** — k1 numeric byte-identical to g2a-03-01/ch1; k2 mcq byte-identical to g2a-02-01/k2 (3rd occurrence).

## Implementation contract per REVISE

For every item below: only the named step's `widget` (and, where noted, `figure`/`variant` if one exists on that step) needs new content. Do not touch any other step, the `cml` block, `hints`, `explanationVariants`, or any other lesson. Preserve each check's existing misconception shape — only the surface numbers/options/trigger-value need to be fresh or corrected.

- **g2l-01-03 / k3**: Replace with a genuinely different job (e.g. "which mark is closer to 55: 50 or 60?" or a numeric halfway-finding check) rather than a second "two marks, halfway?" mcq.
- **g2l-03-01 / k1 or k3**: Replace one of the two with a different job (e.g. reading the landing mark off a completed drawing) so the lesson doesn't run the identical "first addend is the start" mcq twice; consider also varying it from g2l-02-01/k3's occurrence.
- **g2l-03-02 / k1**: Replace with a distinct job (e.g. use the gap-drawing to compute a numeric answer rather than re-asking "which drawing"). **g2l-03-02 / k2**: fix the commonErrors entry — change `value: 32` to `value: 107` (64+43), keeping the existing feedback text.
- **g2l-03-03 / k3**: Replace with a distinct job now that the "gap between marks" mcq template has run twice already (g2l-02-02/k3, g2l-03-02/k1).
- **g2p-01-02 / k3**: Replace with a different comparison job (e.g. "which is closest to 12 inches?") rather than repeating the shortest-of-four template already used in g2p-01-01/k3.
- **g2p-02-01 / k2**: fix the commonErrors entry — change `value: 62` to `value: 6` (32−26), keeping the existing feedback text.
- **g2p-03-01 / k1**: Replace with a new bar-drawing scenario (different cm values and/or a stacked-sum framing) rather than repeating g2p-02-03/k3 verbatim.
- **g2p-03-02 / k1**: Replace with a fresh number-line-drawing mcq (different piece lengths). **g2p-03-02 / ch1**: change the operands (e.g. 26 + 21 = 47) so it no longer duplicates g2p-02-01/ch1's exact 25 + 23 = 48.
- **g2p-03-03 / k3**: Replace with a new sense-check pencil scenario (different marks) rather than repeating g2p-02-02/k3 verbatim.
- **g2p-03-04 / k1**: Replace with a new "is this total reasonable" scenario (different leg lengths) rather than repeating g2p-01-03/k3 verbatim.
- **g2a-01-02 / k2**: change `n` (e.g. 9 or 17) so it no longer duplicates g2a-01-01/k2's "Is 11 odd or even?" exactly. **g2a-01-02 / k1**: use four different numbers so it isn't the same recognize-the-even-number template as g2a-01-01/k3, or convert it to a different job.
- **g2a-01-03 / i2**: change `n` (e.g. 12) so the practice rep no longer replays g2a-01-01/i1's "Pair up 14 counters" exactly.
- **g2a-01-04 / ch1**: replace with a distinct capstone job that actually exercises c2's "un-doubling" framing (e.g. "what number, doubled, makes 16?" as a numeric fill-in) rather than repeating k1's recognize-the-double mcq.
- **g2a-02-02 / k2**: use a different rows/dots pair than "12, +6" so it no longer duplicates g2a-02-01/k3. **g2a-02-02 / k3**: use different row/dot counts than "4 rows of 5" so it no longer duplicates g2a-02-01/k2.
- **g2a-03-02 / k1**: use different dot totals/shapes than "16 dots" (already used by g2a-02-03/k3) — pick numbers distinct from k3's own "18 dots" pairing too. **g2a-03-02 / k2**: use a different row-dot pair than "4, 4+4" so it no longer duplicates g2a-02-01/k1.
- **g2a-03-03 / k1**: replace with a fresh planting scenario (different rows/seedlings) rather than repeating g2a-03-01/ch1's "4 rows of 4, 12+4" verbatim. **g2a-03-03 / k2**: use a different rows/dots pair than "4 rows of 5" — this exact mcq has now run three times (g2a-02-01/k2, g2a-02-02/k3, g2a-03-03/k2).

## KEEP verdicts (14)

- number-line-g2 (6): g2l-01-01, g2l-01-02, g2l-02-01, g2l-02-02, g2l-02-03, g2l-03-04.
- length-problems-g2 (4): g2p-01-01, g2p-01-03, g2p-02-02, g2p-02-03.
- arrays-even-odd-g2 (4): g2a-01-01, g2a-02-01, g2a-02-03, g2a-03-01.

Several KEEP lessons are the original, correct source of a template that a later lesson repeats without fresh value (e.g. g2l-02-01/k3, g2l-02-02/k3, g2p-01-01/k3, g2p-01-03/k3, g2p-02-01/k3, g2p-02-02/k3, g2p-02-03/k3, g2a-01-01/i1+k2+k3, g2a-02-01/k1+k2+k3, g2a-02-03/k3, g2a-03-01/ch1) — the redundancy is scored as a defect only at the later, zero-value re-encounter, per the standard applied in prior S321 lane assessments. See per-lesson rationale in the NDJSON for full recomputed values.

## Notes on scope discipline

- `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` was read first; its "cache entry never becomes curriculum, approval, a closure verdict" boundary was honored — every disposition here is based on direct recomputation against current repository source and `print-review-basis.mjs` hashes, not on any cached recommendation.
- S318's progression-P0 batch already repaired 8 specific steps across these three courses; this assessment covers the courses' **current** state and does not re-flag any of those 8 repaired steps. All 22 REVISE findings above are steps outside that batch.
- No mathematical-truth, visual-promise, option-parity, predict/reveal, or accessibility (narration) defects were found in any of the 30 lessons; every REVISE is a duplicate-content finding or an isolated commonError trigger-value mismatch, as enumerated above.
