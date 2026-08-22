# S316 Lane A-V — Independent Verification: add-within-100-g1 + properties-strategies-g1

**Reviewer:** Claude Cowork independent verifier (S316)
**Reviewed at:** 2026-08-20T00:13:42.000Z
**Scope:** 28 lessons — add-within-100-g1 (14) and properties-strategies-g1 (14), each carrying an
open S251 REVISE disposition whose named defect was "remedial check is a byte-identical copy of
the lesson's main k1 check."

## Method

For each lesson: read the latest signed REVISE record in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, read the current lesson JSON in full, ran
`git diff HEAD -- <file>` to isolate exactly what changed, independently re-solved the new
remedial problem and checked every trap by hand, checked for duplicate prompts against every other
check/challenge step in the same lesson file, and checked wrong-path feedback against the
project's actual pedagogy gate (`src/lib/pedagogy.ts`: `MIN_DIAGNOSIS_CHARS = 25` and the
`GENERIC` blocklist regex — both apply to wrong-path/misconception feedback only, not to
`successFeedback`). Only after forming an independent verdict did I read
`reports/closure/cowork-staging/laneA-g1.jsonl` (the implementer's claims) to cross-check.

## Finding: the defect, and what the revision actually did

In all 28 lessons the previously-signed defect was real and identical in shape: `remedials[0]`
contained a `check.widget` that was byte-for-byte the same prompt/answer/commonErrors/
successFeedback as the lesson's own `k1` (or `k2`) main check — meaning a learner routed into
remediation would see the exact same problem they had just gotten wrong, so "passing" the
remedial measured recall of that one item, not the underlying skill.

The revision touched **only** `remedials[0].check.widget` (or `.options` for mcq widgets) in every
file. `git diff HEAD` confirms no other field changed in any of the 28 files: lesson/step ids,
`conceptTag`, `hints`, `explanationVariants`, figures, narration, takeaways, and every non-remedial
step are byte-identical to `HEAD`. The fix pattern is a **fresh problem instance**: new numbers
drawn, answer recomputed, every trap value/option recomputed to be the same *kind* of
misconception it always represented, and every feedback string updated to name the actual new
numbers.

## Independent arithmetic verification (all 28)

Re-solved every new remedial by hand; all are correct, and every trap is a genuine, distinct
computed misconception (not a placeholder), consistent with its own feedback text:

| lessonId | new remedial prompt (short) | answer | traps checked |
|---|---|---|---|
| g1a-01-01 | 9 + 1 = ? Count on 1. | 10 | 9 (stops early), 1 (only counted-on amount) |
| g1a-01-02 | 7 takes 3 from 8 to make ten; how many of the 8 left? | 5 | 8 (orig addend), 6 (+1 off) |
| g1a-01-03 | 27 + 10 = ? | 37 | 28 (+1 one not ten), 27 (forgot tens) |
| g1a-01-04 | 42 + 40 = ? | 82 | 46 (+4 ones not tens), 42 (forgot tens) |
| g1a-02-01 | 56 − 10 = ? | 46 | 55 (−1 not −10), 56 (unchanged) |
| g1a-02-02 | 23 + 10 = ? | 33 | 24 (+1 one not ten), 23 (forgot tens) |
| g1a-02-03 | 6 + 1 = ? Count on 1. | 7 | 6 (stops early), 1 (only counted-on) |
| g1a-02-04 | 8 takes 2 from 9 to make ten; how many of the 9 left? | 7 | 9 (orig addend), 2 (repeats amount taken) |
| g1a-02-05 | 63 − 10 = ? | 53 | 62 (−1 not −10), 63 (unchanged) |
| g1a-02-06 | 58 + 10 = ? | 68 | 59 (+1 not +10), 58 (unchanged) |
| g1a-03-01 (mcq) | 9 + 5 = ? | 14 | 15 (+1), 16 (overshoot, stated), 4 (=9−5, stated as difference) |
| g1a-03-02 | 7 red + 4 blue counters, total? | 11 | 3 (=7−4, difference), 7 (larger part only) |
| g1a-03-03 | 14 frogs, 6 hop away, how many left? | 8 | 20 (=14+6, added instead), 6 (gives departed count) |
| g1a-03-04 (mcq) | Which fact helps solve 13 − 6? | "6+7=13" | "13+6=19", "6+13=19" (whole+part), "5+8=13" (unrelated true fact) |
| g1p-01-01 | 6 + 20 = ? start at 20, count on 6 | 26 | 20 (start value), 6 (addend only) |
| g1p-01-02 (mcq) | 6+3=9, what is 3+6? | 9 | 10 (+1), 8 (−1), 3 (=6−3, difference) |
| g1p-01-03 | 9 + 4 = ? start at 9, count on 4 | 13 | 9 (start), 12 (one count short) |
| g1p-01-04 | 6 + 3 = ? count on 3 | 9 | 6 (stops early), 3 (only counted-on) |
| g1p-01-05 | 12 − 3 = ? count back 3 | 9 | 10 (one hop short), 15 (counted forward) |
| g1p-02-01 | 7 + 7 = ? | 14 | 7 (one group only), 15 (+1 over double) |
| g1p-02-02 | 5 + 6 = ? | 11 | 10 (=5+5, double of smaller), 12 (=6+6, double of larger) |
| g1p-02-03 | 9 + 8 = ? | 17 | 18 (=9+9, full double), 16 (=8+8, doubles smaller) |
| g1p-02-04 | 8 takes 2 from 13 to make ten; how many of 13 left? | 11 | 13 (orig addend), 12 (+1 off) |
| g1p-02-05 | 17 − 8 = ? | 9 | 10 (+1 off), 25 (=17+8, added) |
| g1p-03-01 | Fact family 4,8,12: 12 − 4 = ? | 8 | 4 (subtrahend repeated), 12 (whole repeated) |
| g1p-03-02 | 2 + 9 = 6 + ? | 5 | 11 (=2+9, whole of left side), 6 (repeats 6) |
| g1p-03-03 (mcq) | Which strategy fits 9 + 4 best? | "Make ten first" | "count on 4", "count back from 9", "swap and stop" — all present, all valid distinct wrong strategies |
| g1p-03-04 (mcq) | Why does 5 + 7 = 7 + 5? | "same two groups" | other options unchanged from original, still valid |

No trap equals the answer and no trap equals another trap in any of the 28 remedials (checked
programmatically). No mcq has more than one option marked `correct`, and no mcq has duplicate
option labels.

## Duplication check

Compared each new remedial prompt against every `check`/`challenge` prompt in the same lesson
file (including `k1`, `k2`, `k3`, `ch1` where present): **no collisions** in any of the 28
lessons. The remedial is no longer byte-identical to `k1`/`k2`, and does not accidentally
duplicate any other step.

## Feedback-quality gate (project's actual rule, not the variant-generator's rule)

`src/lib/pedagogy.ts` defines `MIN_DIAGNOSIS_CHARS = 25` and a `GENERIC` open-word blocklist,
applied only to **wrong-path** feedback (`commonErrors[].feedback`, `fallbackFeedback`, incorrect
mcq `options[].feedback`) — not to `successFeedback`. Checked all 28 remedials against this actual
rule: all wrong-path feedback strings are ≥25 characters and none opens with a blocklisted word.
(Several `successFeedback` strings, e.g. "Correct — 9 + 1 = 10.", are under 25 characters, but
this is pre-existing in the unrevised original content too — e.g. the pre-revision g1a-01-01
remedial's `successFeedback` was "Correct — 7 + 1 = 8." at 20 characters — and `successFeedback`
is not covered by the project's length gate, so this is not a regression introduced by the
revision.)

## Grade-appropriate language

No prose/wording changed anywhere except numerals inside the remedial widget and their
feedback strings, which follow the exact template of the (already grade-reviewed) main check.
No new vocabulary, sentence structure, or phrasing was introduced. `gradeLanguageDecision: FIT`
carries forward unchanged.

## Visuals

None of the 28 diffs touch any `figure`, `narration`, or concept step. `visualDecision: SUFFICIENT`
carries forward unchanged — no visual claim in any of these lessons was affected by the remedial
fix.

## Verdict on diagnostic value (per the task's explicit framing)

The remedial is now an **independent problem instance** of the same skill and the same trap
*family* as the main check — not a distinct-misconception redesign. It measures "can you do a new
one of this kind" rather than "do you remember this exact item," which resolves the literally
signed defect (byte-identical copy). It does **not** yet diagnose a different misconception than
the main check already diagnosed. Per this task's explicit instruction, that residual is **not**
grounds for REVISE here — the literal defect is resolved with no regressions, so **KEEP** is
appropriate for all 28. The separate parallel adjudication on fresh-instance-vs-distinct-
misconception governs whether further implementation work is warranted; this disposition does not
prejudge that adjudication.

## Cross-check against implementer's claims (`reports/closure/cowork-staging/laneA-g1.jsonl`)

Read only after forming the independent verdict above. All 28 records in that file describe
exactly the change observed in `git diff HEAD` for the corresponding lesson — same old/new
prompt text, same old/new answer, same characterization ("replaced same-as-main-k1 remedial item
with a fresh instance ... re-derived commonErrors/successFeedback from the drawn numbers").

**No discrepancies found.** Every `changes[]` entry accurately describes the sole diff in its
lesson file; `rejected: false` is consistent with all 28 lessons in fact having been revised (none
were rejected/skipped).

## Verdict counts

- **KEEP: 28 / 28**
- **REVISE: 0**
- **ESCALATE: 0**

All 28 dispositions are appended to
`reports/closure/cowork-staging/laneAV-g1-dispositions.jsonl` with `recordId` prefix `S316-V-`,
`reviewedBasisHash` taken from `node scripts/session/print-review-basis.mjs` (current source
hash), `decision: KEEP`, `visualDecision: SUFFICIENT`, `gradeLanguageDecision: FIT`.

## Evidence

- `content/courses/add-within-100-g1/lessons/g1a-*.json` (14 files) — current source, diffed
  against `HEAD` via `git diff HEAD -- <file>`
- `content/courses/properties-strategies-g1/lessons/g1p-*.json` (14 files) — same
- `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` — latest signed REVISE record per lessonId
- `reports/closure/cowork-staging/laneA-g1.jsonl` — implementer's claims, cross-checked last
- `src/lib/pedagogy.ts` — actual project feedback-quality gate (`MIN_DIAGNOSIS_CHARS`, `GENERIC`)
- `scripts/session/print-review-basis.mjs` — current basis-hash source for signing
