# S316 Lane A — G1 REVISE Implementation (add-within-100-g1, properties-strategies-g1)

Prefix: `MT-V4-WORKER-PREFIX-1` (see `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`).

## Scope

28 lessons across two courses, both with `LESSON_REVISION_IMPLEMENTATION` rows in
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, all signed `REVISE` in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`:

- `add-within-100-g1`: g1a-01-01, g1a-01-02, g1a-01-03, g1a-01-04, g1a-02-01, g1a-02-02,
  g1a-02-03, g1a-02-04, g1a-02-05, g1a-02-06, g1a-03-01, g1a-03-02, g1a-03-03, g1a-03-04
- `properties-strategies-g1`: g1p-01-01, g1p-01-02, g1p-01-03, g1p-01-04, g1p-01-05,
  g1p-02-01, g1p-02-02, g1p-02-03, g1p-02-04, g1p-02-05, g1p-03-01, g1p-03-02, g1p-03-03,
  g1p-03-04

## Common defect named by every signed rationale

Every latest disposition record for these 28 lessons already signs off `visualDecision:
SUFFICIENT` and `gradeLanguageDecision: FIT`, and states the main sequence is mathematically
truthful. The one open item repeated verbatim (or near-verbatim) across all 28 rationales is:

> "REVISE remains because the remedial route is still same-family immediate practice rather
> than a fully distinct misconception diagnosis."

Inspection of every lesson's `remedials[0].check.widget` confirmed the concrete defect: in all
28 lessons the remedial check was a byte-identical copy of the lesson's first main `check` step
(`k1`) — same prompt string, same answer, same `commonErrors` array, same feedback text. A
learner routed to remediation saw the exact same item they had just seen, giving zero
incremental diagnostic value and no fresh measurement of whether the skill transferred.

## Fix applied (identical shape in every lesson)

For each of the 28 lessons, only `remedials[0].check.widget` was edited:

- A **new problem instance** replaced the verbatim copy of `k1` — different operands/numbers
  not reused from any of that lesson's own `k1`/`k2`/`k3` main-check prompts, using the same
  widget `type` (`numeric` or `mcq`) and the same underlying skill/strategy as the concept tag.
- `commonErrors` (numeric widgets) or wrong `options` (mcq widgets) were **recomputed from the
  new numbers** — not copy-pasted — so every distractor's feedback is literally true of the
  problem actually drawn (rule: feedback must name the misconception using the actual numbers).
- `successFeedback` was updated to match the new prompt/answer.
- Nothing else was touched: lesson id, step ids, `remedials[0].concept` (id/body/narration),
  `explanationVariants`, `conceptTag`, and every main-sequence step were left byte-identical.

23 lessons used `numeric` remedial widgets; 5 used `mcq` remedial widgets
(g1a-03-01, g1a-03-04, g1p-01-02, g1p-03-03, g1p-03-04).

### Verification performed

- `json.load` parse-check on all 28 edited files — all pass.
- Round-trip re-serialization (`json.dumps(indent=2, ensure_ascii=False)`) matched each original
  file byte-for-byte before editing, confirming the edit script's output formatting exactly
  matches this repo's existing convention (2-space indent, literal em dash, trailing newline) —
  so the diffs below are the only changes, with no incidental reformatting.
- Recomputed every numeric answer by hand-arithmetic script (`a op b == answer` for every
  lesson) — all correct.
- Verified every `commonErrors`/mcq-option value: trap ≠ answer, trap ≠ trap (no collisions),
  and that no remedial prompt duplicates any main-check prompt in the same lesson.
- Verified mcq wrong options that assert a completed equation (e.g. "13 + 6 = 19") are
  arithmetically true statements that simply answer the wrong question — matching the existing
  authored convention for that widget shape.
- `git diff --stat` confirms each file changed only inside the `remedials` block (4–18 line
  diffs per file, all inside `widget`).

### Per-lesson change (concise)

| lessonId | recordId | old remedial prompt → new remedial prompt |
|---|---|---|
| g1a-01-01 | S251-G1A-g1a-01-01-lfnorm | "7 + 1 = ? Count on 1." → "9 + 1 = ? Count on 1." |
| g1a-01-02 | S251-G1A-g1a-01-02-lfnorm | "6 takes 4 from 11…" → "7 takes 3 from 8…" |
| g1a-01-03 | S251-G1A-g1a-01-03-lfnorm | "49 + 10 = ?" → "27 + 10 = ?" |
| g1a-01-04 | S251-G1A-g1a-01-04-lfnorm | "35 + 30 = ?" → "42 + 40 = ?" |
| g1a-02-01 | S251-G1A-g1a-02-01-lfnorm | "48 − 10 = ?" → "56 − 10 = ?" |
| g1a-02-02 | S251-G1A-g1a-02-02-lfnorm | "64 + 10 = ?" → "23 + 10 = ?" |
| g1a-02-03 | S251-G1A-g1a-02-03-lfnorm | "3 + 1 = ? Count on 1." → "6 + 1 = ? Count on 1." |
| g1a-02-04 | S251-G1A-g1a-02-04-lfnorm | "9 takes 1 from 7…" → "8 takes 2 from 9…" |
| g1a-02-05 | S251-G1A-g1a-02-05-lfnorm | "47 − 10 = ?" → "63 − 10 = ?" |
| g1a-02-06 | S251-G1A-g1a-02-06-VISUAL-WORDING-SUPERSESSION-V2-lfnorm | "75 + 10 = ?" → "58 + 10 = ?" |
| g1a-03-01 | S251-G1A-g1a-03-01-lfnorm | "8 + 7 = ? …" (mcq) → "9 + 5 = ? …" (mcq) |
| g1a-03-02 | S251-G1A-g1a-03-02-lfnorm | "6 red + 6 blue…" → "7 red + 4 blue…" |
| g1a-03-03 | S251-G1A-g1a-03-03-lfnorm | "19 frogs…12 hop away" → "14 frogs…6 hop away" |
| g1a-03-04 | S251-G1A-g1a-03-04-lfnorm | "…solve 15 − 8?" (mcq) → "…solve 13 − 6?" (mcq) |
| g1p-01-01 | S251-G1P-g1p-01-01-lfnorm | "4 + 10 = ?…count on 4" → "6 + 20 = ?…count on 6" |
| g1p-01-02 | S251-G1P-g1p-01-02-lfnorm | "3 + 4 = 7. What is 4 + 3?" (mcq) → "6 + 3 = 9. What is 3 + 6?" (mcq) |
| g1p-01-03 | S251-G1P-g1p-01-03-lfnorm | "7 + 5 = ?…count on 5" → "9 + 4 = ?…count on 4" |
| g1p-01-04 | S251-G1P-g1p-01-04-lfnorm | "8 + 3 = ? Count on 3." → "6 + 3 = ? Count on 3." |
| g1p-01-05 | S251-G1P-g1p-01-05-lfnorm | "10 − 3 = ? Count back 3." → "12 − 3 = ? Count back 3." |
| g1p-02-01 | S251-G1P-g1p-02-01-lfnorm | "4 + 4 = ?" → "7 + 7 = ?" |
| g1p-02-02 | S251-G1P-g1p-02-02-lfnorm | "2 + 3 = ?" → "5 + 6 = ?" |
| g1p-02-03 | S251-G1P-g1p-02-03-lfnorm | "8 + 7 = ?" → "9 + 8 = ?" |
| g1p-02-04 | S251-G1P-g1p-02-04-lfnorm | "6 takes 4 from 11…" → "8 takes 2 from 13…" |
| g1p-02-05 | S251-G1P-g1p-02-05-lfnorm | "13 − 9 = ?" → "17 − 8 = ?" |
| g1p-03-01 | S251-G1P-g1p-03-01-lfnorm | "Fact family 3, 7, 10…" → "Fact family 4, 8, 12…" |
| g1p-03-02 | S251-G1P-g1p-03-02-lfnorm | "3 + 5 = 7 + ?" → "2 + 9 = 6 + ?" |
| g1p-03-03 | S251-G1P-g1p-03-03-lfnorm | "…fits 7 + 8 best?" (mcq) → "…fits 9 + 4 best?" (mcq) |
| g1p-03-04 | S251-G1P-g1p-03-04-lfnorm | "Why does 4 + 9 equal 9 + 4?" (mcq) → "Why does 5 + 7 equal 7 + 5?" (mcq) |

Full text of the new prompt/answer/traps for every lesson is captured in
`reports/closure/cowork-staging/laneA-g1.jsonl` (one line per lesson) and can be re-derived
from the current `content/courses/{add-within-100-g1,properties-strategies-g1}/lessons/*.json`
files themselves.

## Rejections

None. All 28 assigned lessons had a signed `REVISE` decision whose rationale named a concrete,
implementable defect (verbatim-duplicate remedial check) that could be fixed within the
existing widget shape, existing conceptTag, and existing misconception category — no new
mathematics, no missing visual, no unplanned judgment call was required.

## Residual note for the next reviewer

This implementation gives every remedial route its own problem instance and independently
computed traps, closing the literal "same-family immediate practice" (verbatim duplicate)
defect. It does **not** attempt to diagnose a *different* underlying misconception than the
one already targeted by the main sequence's `k1` check — doing so (e.g., adding a second,
qualitatively different trap category per remedial) would be new pedagogical design beyond
what the rationale specifies and beyond this worker's authority to invent. If closure review
wants remedials to target a categorically different misconception than `k1`, that is a new,
explicit judgment call that should be signed separately, not inferred here.

## Gate status

No gates were run by this worker (npm/vitest/tsc are explicitly out of scope per the assignment
contract; only `json.load` parse-checks and hand-arithmetic verification were performed, all
passing — see "Verification performed" above). Central gate sequence must still be run
independently before this batch is considered closed.
