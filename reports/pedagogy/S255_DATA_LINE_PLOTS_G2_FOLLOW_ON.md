# S255 data-line-plots-g2 follow-on

## Scope and authority

This bounded follow-on repairs all actionable residuals identified by the independent S255 assessment across the 12 current `data-line-plots-g2` lessons. It preserves lesson IDs, step IDs, option IDs, correct answers, evaluator targets, and the course/chapter structure. It does not append or regenerate lesson-review authority, queues, cards, caches, ledgers, or standards evidence.

The deterministic source seal is `119ccc14cdd1a542b89a2e18843ab5453dbbae41fded9016fb4a2b99aed6cc57`. Running `node scripts/audit/repair-data-line-plots-g2-s255.mjs --check` reports `CURRENT`, 12 lessons, and zero pending changes.

## Exact repaired inventory

| Cause | Before | After | Closed |
| --- | ---: | ---: | ---: |
| Text-only remedial concepts | 12 | 0 | 12 |
| Remedial concepts copied from `c2` | 7 | 0 | 7 |
| Remedial checks repeating the exact `k1` job | 10 | 0 | 10 |
| MCQ surfaces with the correct answer fixed at position 0 | 15 | 3 | 12 moved; all 15 cueing instances closed by balanced deterministic positions |
| Weak concept-to-figure placements named by the assessment | 5 | 0 | 5 |
| Dot-plot value/frequency action ambiguity | 1 | 0 | 1 |

The 15 MCQs retain stable correct option ID `o0`; their current correct-position distribution is `[3, 4, 4, 4]` across positions 0–3. Option-label maximum/minimum length ratio is at most 1.25 on every surface. These are 50 assessed residual instances, not 50 generic queue rows; categories can overlap within one lesson.

All 12 remedials now have a registered semantic figure, a lesson-specific explanation distinct from `c2`, and a different check job from `k1`. Four narrowly scoped figures were added: shared-unit comparison, keeping repeated measurements, reading a bar-height gap, and selecting a display by data type. Visible labels and accessible titles carry the same quantities and meanings.

`g2g-01-05/i1` and `i2` now both ask the learner to mark every X in the tallest stack. The modal value is 6, its frequency is 5, and the evaluator requires five marks at value 6; the prompt, visible data, and scoring contract agree.

## Regression evidence

- Follow-on/content/render/collision suite: 7 files, 39 tests passed.
- Full schema validation: passed.
- Pedagogy lint: 1,711/1,711 lesson files clean.
- Strict CML lint: 0 errors, 0 warnings.
- Typecheck: passed.
- Figure registration: passed.
- Figure render health and accessibility: every registered figure rendered with an accessible name.
- Global zero-collision ratchet: passed, including the four new figures and `mult3-divide-one-self`.
- Figure/text alignment census: completed (`3,873` uses; `392` fixed exemplars; `12` rendered fixed; `380` suppressed).
- Targeted ESLint and scoped `git diff --check`: passed.

The global visual-explanation floor remains red for four unrelated, pre-existing missing concept figures in `mult-fluency-g3` (`mf3-02-03` ×2 and `mf3-02-04` ×2). This packet deliberately does not edit that course. The adversarial audit generated a current 4,525-row census but did not reach its semantic-conflict assertion because its source test still freezes older global exact counts (`1,954` descriptions / `3,837` rows) while the live concurrent corpus now has `1,962` descriptions / `4,525` rows. That serial global ratchet refresh belongs to the shared evidence rebuild, not this course-local packet.

## Authority status and residual debt

The existing `S255_DATA_LINE_PLOTS_G2_TRIPLE_DISPOSITIONS.jsonl` was bound before these source and figure changes and is intentionally stale. The canonical appender rejects it at `g2g-01-01` as `STALE_HUMAN_DECISION`; it must not be appended. A fresh independent assessor must supersede all 12 records against the current hashes.

No actionable residual from the S255 assessment remains in course source. Remaining work is authority/evidence sequencing only: independent triple-disposition supersession, serial shared artifact regeneration, and the unrelated four-item `mult-fluency-g3` visual-explanation gap.
