# S253 Measure–Compare K independent triple-disposition assessment

Status: **PASS — current-source isolated candidate; not appended**

## Signed result

- Lessons reviewed: **12/12**, including every main step and both nodes of every remedial route.
- Whole lesson: **0 KEEP, 12 REVISE, 0 ESCALATE**.
- Visual: **12 REQUIRED, 0 PREFERRED/SUFFICIENT/ESCALATE**.
- Kindergarten language: **0 FIT, 12 REVISE, 0 ESCALATE**.
- Current live review-basis hashes: **12/12**.
- Candidate SHA-256: `fce3479b6e65e59a8e65a70660e960bef2326852048d68a6463926111b889a16`.
- Current normalized course seal: `dba3fd41c2bbf90ed64bf7cc6b676ca7c2de520f830cb60b66c2d4795e7872e5`.

The candidate is valid, but the course is not honestly complete. Every lesson has a text-only remedial concept that exactly repeats a main concept rather than diagnosing and treating a distinct misconception. Eight remedial checks also exactly repeat a main widget. Consequently every lesson remains `REVISE`, and every visual disposition is `REQUIRED`: a concrete remedial representation is needed for an early Kindergarten learner rather than another copy of the same prose. Every lesson also retains dense, figurative, or abstract early-reader language, including terms and constructions such as “attribute,” “capacity,” “misjudge,” “independently,” “read the tilt,” “the far ends tell the truth,” “piles into data,” and “sizes never vote.”

No current authored answer is escalated as mathematically false. The live `tapDiagram` evaluator grades the exact authored correct hotspot IDs, and the ten-frame evaluator checks the target before consulting diagnostic traps. The specialized defects below are therefore bounded revision debt, not evidence for a false current success result.

## Independent source-closure verification

All **40 source-derived queue rows** are supported by current source:

- **24/24 illustration replacements:** every main concept has a registered figure, body/narration agree, and the live figure surface renders. The former capacity blocker is closed: `kmd-capacity-same-scoop` visibly and accessibly identifies the same scoop, a four-scoop cup, a six-scoop jug, and the conclusion that the jug holds more. Both `kmd-01-04/c1` and `c2` use it.
- **12/12 progression/duplication causes:** every lesson’s main widget sequence is distinct by exact prompt, number-normalized prompt, and stable widget payload.
- **4/4 choice-surface causes:** the four named MCQs retain stable unique option IDs, exactly one correct option, and the repaired bounded label sets.

This assessment rechecked current source rather than inheriting the earlier report’s two withheld capacity rows. It therefore supersedes only that old 38-row arithmetic and confirms the requested **40/40** source closures. It does not claim that a registered figure is automatically the best instructional figure: the main-sequence mismatches below are carried into `REQUIRED` dispositions.

## Specialized revision debt

The strict validator preserves these exact residuals:

- **12 remedial concept clones**, all without a figure; **8 remedial widget clones**.
- `kmd-02-02/c2` uses `add-balance-scale`, whose live semantics show algebraic equality `6 + 4 = 10`, not two physical objects balancing at equal weight.
- `kmd-02-04/c1,c2` use horizontal length figures for an explicitly upright, shared-floor taller/shorter job.
- `kmd-03-02/c1,c2` use a four-sides rule and a horizontal length comparison for a big/small sorting lesson.
- Two ten-frame records contain unreachable target-equal diagnostics: `kmd-01-04/i2` includes 6 in `commonCounts` when the target is 6, and `kmd-03-03/i2` includes 8 when the target is 8.
- Four authored rule jobs retain the `shapeSortTap` variant form even though that generator and its independent solver always select the greatest-count group: `kmd-03-01/i2` (circles), `kmd-03-02/i2` (small), `kmd-03-02/k2` (big), and `kmd-03-04/i2` (fewest). Live authored grading is correct, but generated retries change the learner job.

The last two bullets explain the broader legacy result: `session198.measureCompareK.test.ts` reports **5 failed tests and 19 passed tests** when run with the focused S253 suite. Two failures expose target-equal `commonCounts`; three per-lesson failures stop at the first solver mismatch, while independent enumeration finds all four mismatched authored placements. The focused S253 aggregate remains **6/6 passing** and verifies current authored evaluator truth, but it does not cover these generator-job and diagnostic-list contracts.

## Queue and authority boundary

The source refresh may close 40 source-controlled rows. An authoritative append of this candidate may close the remaining **36 generic review rows** and retain/open **12 `LESSON_REVISION_IMPLEMENTATION` rows**, one per lesson. The isolated packet does not append the ledger, mutate the queue/cards/cache, approve standards, or claim mastery, transfer, remedial effectiveness, or generator assurance.

The review cards are not used as authority because the candidate is bound directly to all twelve current live review-basis hashes. Any lesson, course metadata, duplicate inventory, standards edge, figure, evaluator, generator, renderer, or review-contract change triggers the record-level reopen conditions.

## Reproduction

```text
node reports/closure/candidates/validate-s253-measure-compare-k-triple-dispositions.mjs
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S253_MEASURE_COMPARE_K_TRIPLE_DISPOSITIONS.jsonl
node scripts/audit/repair-measure-compare-k-s253.mjs --check
npx vitest run src/lib/session253.measureCompareKCourseIntegrity.test.tsx --reporter=verbose
npx vitest run src/lib/session198.measureCompareK.test.ts src/lib/session253.measureCompareKCourseIntegrity.test.tsx --reporter=verbose
```
