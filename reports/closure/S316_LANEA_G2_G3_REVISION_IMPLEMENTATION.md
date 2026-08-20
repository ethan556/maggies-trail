# S316 Lane A — G2 G3 REVISE Implementation (fluency-20-g2, fractions-deeper-g3)

Prefix: `MT-V4-WORKER-PREFIX-1` (see `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`).

## Scope

24 lessons across two courses, both with `LESSON_REVISION_IMPLEMENTATION` rows in
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, all signed `REVISE` in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`:

- `fluency-20-g2`: f20-01-01, f20-01-02, f20-01-03, f20-01-04, f20-02-01, f20-02-02,
  f20-02-03, f20-02-04, f20-03-01, f20-03-02, f20-03-03, f20-03-04, f20-03-05, f20-03-06
- `fractions-deeper-g3`: g3f-01-01, g3f-01-02, g3f-01-04, g3f-02-03, g3f-02-04, g3f-02-05,
  g3f-03-01, g3f-03-02, g3f-03-03, g3f-03-04

## fluency-20-g2 (14 lessons) — common defect

Every latest disposition record (recordId `S251-F20-<lessonId>-lfnorm`) signs `visualDecision:
SUFFICIENT`, `gradeLanguageDecision: FIT`, and states the repaired main sequence is truthful. The
one open item repeated verbatim across all 14 rationales:

> "REVISE remains because the remedial route is same-family immediate practice rather than a
> fully distinct misconception diagnosis."

Inspection of `remedials[0].check.widget` in every lesson confirmed it was a byte-identical copy
of `k1` (same prompt, answer, `commonErrors`, feedback).

### Fix applied (13 of 14 lessons: reworded prompt, same answer/commonErrors)

For f20-01-01, f20-01-02, f20-01-03, f20-01-04, f20-02-01, f20-02-02, f20-02-03, f20-02-04,
f20-03-01, f20-03-02, f20-03-04, f20-03-05, f20-03-06: only `remedials[0].check.widget.prompt`
was edited — the bare symbolic/`"Answer fast:"` k1 prompt was replaced with a concrete
word-problem restatement of the *same* numbers/answer (e.g. `"6 + 6 = ?"` →
`"Two boxes hold 6 crayons each. How many crayons are there in all?"`). `answer`, `commonErrors`,
`fallbackFeedback`, and `successFeedback` were left untouched because their feedback text is
generic enough to remain literally true of the reworded prompt (same numbers, same
misconception). This is the same pattern already accepted with a `KEEP` disposition elsewhere in
the codebase for `mult-fluency-g3` lesson `mf3-01-01` (remedial reworded from symbolic `"2 × 6 =
?"` to concrete `"Use 6 pairs of counters..."`, same answer/traps).

### Fix applied (1 of 14 lessons: sibling fact from the same family)

f20-03-03 ("Fact Families to 20") is a special case: its concept step explicitly states the
family `6, 8, 14` yields four facts (`6+8, 8+6, 14−6, 14−8`), and k1 already tests `14 − 8 = 6`.
Rather than reword the same computation, the remedial was changed to test the other named
subtraction fact in the same family, `14 − 6 = 8`, with `commonErrors`/`successFeedback` swapped
to match the new answer. This is more diagnostic than a reworded restatement because it exercises
a different (but already-authored, non-invented) member of the fact family.

## fractions-deeper-g3 (10 lessons) — per-lesson defects

Unlike fluency-20-g2, each rationale here names a distinct combination of defects. All 10 shared
one item: **the remedial concept step has no `figure` field** (a "text-only"/"withheld visual"
explanation) **and** the remedial check is byte-identical to `k1`. Several lessons also had a
**terminology defect** in the main sequence itself (calling an exact whole-number quotient a
"mixed number" and asking for its "whole-number part," when a true mixed number requires a
nonzero fractional remainder), and two lessons had **near-duplicate jobs** within the main
sequence (a challenge step that only swapped a noun, or was byte-identical to `k1`).

| lessonId | recordId | Fixes applied |
|---|---|---|
| g3f-01-01 | S252-G3F-g3f-01-01-lfnorm | Added `figure: "frac-equal-vs-unequal"` to remedial concept. Replaced remedial check (verbatim k1, 3-piece "thirds") with a distinct 4-piece "fourths" unequal-parts diagnostic mcq (same misconception, fresh numbers). Replaced `ch1` (near-duplicate of `k2`: same "how many equal pieces / split into thirds" task, only the noun changed from "circle" to "paper strip") with a transfer task to fifths (answer 5); removed the now-mismatched `Ssg2ThirdsCountNumeric` variant (hardcoded to thirds/answer 3). |
| g3f-01-02 | S252-G3F-g3f-01-02-lfnorm | Added `figure: "thirds-compare"` to remedial concept. Replaced remedial check (verbatim k1, naming 1/3) with a transfer/comparison mcq ("Which is smaller: a third or a sixth?") that applies the size-comparison concept instead of re-testing naming. |
| g3f-01-04 | S252-G3F-g3f-01-04-lfnorm | **k1 itself redesigned**: was a raw grid-total count ("5 rows of 3 counters, how many in all?") that did not test fraction-of-a-set reasoning at all, per the rationale; replaced with "A set of 15 counters is split into 3 equal groups. How many counters are in each group?" (answer 5) — a genuine fraction-of-a-set task. `fallbackFeedback` rewritten so it is literally true of the new task (old fallback said "name equal pieces of a cut whole," which the rationale flagged as contextually false for an array-counting task). Removed the now-mismatched `Ssg2GridApplyNumeric` variant. Added `figure: "fm-fraction-of"` to remedial concept; remedial check replaced with a fresh instance (18 counters / 3 groups → 6) using the same corrected task shape. |
| g3f-02-03 | S252-G3F-g3f-02-03-lfnorm | Added `figure: "fa-multiplier"` to remedial concept. Replaced remedial check (verbatim k1) with a diagnostic naming the exact misconception from i2 (a learner who scaled only the denominator, writing `1/3 = 2/12` instead of `4/12`). `ch1` denominator jump reduced from 24 (×4, unprecedented in this lesson) to 18 (×3, matching the scale factor already practiced in k1/k3), addressing the rationale's note about an unclear Grade 3 progression rationale for the ×4 jump. |
| g3f-02-04 | S252-G3F-g3f-02-04-lfnorm | Added `figure: "frac-equiv-numline"` to remedial concept. Replaced remedial check (verbatim k1) with a diagnostic naming the misconception from i2 (scaled denominator by ×4 but only added 1 to the numerator). |
| g3f-02-05 | S252-G3F-g3f-02-05-lfnorm | **Terminology fix across k1/k2/ch1**: `8/2` and `24/8` are exact whole numbers (no remainder) but were called "mixed numbers" with a request for "the WHOLE NUMBER part." Reworded to "X/Y equals a whole number exactly. Which whole number is it?" and removed the mismatched `faImproperToMixedNumeric` variant (that generator always injects a nonzero remainder, so it can never legitimately back this lesson's actual whole-number-only concept). Added `figure: "frac-whole-disguise"` to remedial concept; remedial check replaced with a fresh instance (`12/4 = 3`) using the corrected wording. |
| g3f-03-01 | S252-G3F-g3f-03-01-lfnorm | Same terminology fix across k1/k2/k3/ch1 (`8/8=1`, `6/6=1`, `16/4=4`). **Also fixed a literal duplicate**: `ch1` was byte-identical to `k1` (`8/8`, answer 1); replaced with a fresh instance (`18/6=3`). Removed mismatched `faImproperToMixedNumeric` variants. Added `figure: "frac-whole-disguise"` to remedial concept; remedial check replaced with a fresh instance (`10/2=5`). |
| g3f-03-02 | S252-G3F-g3f-03-02-lfnorm | Added `figure: "frac-compare-same-denom"` to remedial concept. Replaced remedial check (verbatim k1, different-numerator/different-whole pizza scenario) with a same-numerator different-whole diagnostic (`3/5` of two different-sized ribbons) that asks the learner to name *which* cause (mismatched wholes, not numerators) invalidates the comparison — per the rationale's explicit ask to diagnose which cause, not just repeat the verdict question. |
| g3f-03-03 | S252-G3F-g3f-03-03-lfnorm | Added `figure: "frac-compare-same-numer"` to remedial concept (this also fixed a latent mismatch: the remedial concept text is about shared-numerator ordering, but the old remedial check tested shared-denominator ordering like k1). Replaced remedial check with a same-numerator ordering transfer task using fresh unit fractions (`1/2, 1/5, 1/10`) not used elsewhere in the lesson, aligning the check with its own concept. |
| g3f-03-04 | S252-G3F-g3f-03-04-lfnorm | Same terminology fix on `ch1` (`16/8=2`); removed mismatched `faImproperToMixedNumeric` variant. Added `figure: "frac-top-bottom"` to remedial concept (resolving the "text-only" complaint). Replaced remedial check (verbatim k1, ribbon/6-pieces/5-used) with a distinct pizza/8-slices/3-eaten scenario testing the same numerator-denominator convention. |

## Verification performed

- `json.load` parse-check on all 24 edited files — all pass.
- Round-trip re-serialization (`json.dumps(indent=2, ensure_ascii=False)`) matched the original
  f20-01-01 file byte-for-byte before any edits, confirming this repo's formatting convention
  (2-space indent, literal em dash/minus, trailing newline) so subsequent edits introduce no
  incidental reformatting.
- Hand-checked every changed numeric fact (all additions/subtractions/divisions in the
  "changes" list above) — all arithmetically correct.
- Scripted scan of every edited widget: no `numeric` widget has a `commonErrors` value equal to
  its `answer`; no duplicate trap values within one widget; every `mcq` widget has exactly one
  `correct: true` option and no duplicate option labels.
- Scripted scan confirmed no remedial `check.widget` is still byte-identical to its lesson's
  `k1.widget` (verified across all 24 lessons).
- Scripted scan confirmed the 10 `fractions-deeper-g3` remedial `concept` steps now all carry a
  `figure` field, and that every `figure` id used (`frac-equal-vs-unequal`, `thirds-compare`,
  `fm-fraction-of`, `fa-multiplier`, `frac-equiv-numline`, `frac-whole-disguise`,
  `frac-compare-same-denom`, `frac-compare-same-numer`, `frac-top-bottom`) is registered in
  `src/components/figureIds.ts` and `src/components/figures.tsx` — every one was reused from a
  sibling concept step (`c1`/`c2`) in the same lesson, so no new figure was invented.
- Scripted scan for a residual `"mixed number"` / `"WHOLE NUMBER part"` substring across all 10
  `fractions-deeper-g3` files — none remain.
- Where a `variant` declaration would have become mismatched with a reworded/renumbered widget
  (`Ssg2ThirdsCountNumeric` on g3f-01-01 ch1, `Ssg2GridApplyNumeric` on g3f-01-04 k1,
  `faImproperToMixedNumeric` on g3f-02-05/g3f-03-01/g3f-03-04's affected steps), the stale
  `variant` key was removed rather than left pointing at a generator that would silently
  regenerate content contradicting the corrected authored prompt. No new `variant` was invented
  in its place — variant-generator authorship is out of scope for this packet.
- `git status` confirms only the 24 target files under `content/courses/fluency-20-g2/lessons/`
  and `content/courses/fractions-deeper-g3/lessons/` were touched by this worker (other modified
  files present in the working tree belong to other concurrent lane workers, not this packet).

## Rejections

None. All 24 assigned lessons had a signed `REVISE` decision whose rationale named a concrete,
implementable defect (verbatim-duplicate/no-figure remedial, mislabeled exact-whole-number
"mixed number," or a near-duplicate main-sequence job) that could be fixed within the existing
widget shape, existing `conceptTag`, and existing misconception category — no new mathematics, no
missing exact visual, no unplanned judgment call outside what each rationale specified.

## Residual notes for the next reviewer

- The `g3f-02-03` challenge's denominator-24→18 change and `g3f-01-01`'s ch1 thirds→fifths
  change are the only edits in this batch that altered a *main*-sequence (non-remedial) widget's
  target numbers beyond a wording-only fix. Both were explicitly named by their rationales
  ("the challenge also largely repeats k2," "the denominator-24 challenge... needs a clearer
  Grade 3 progression rationale") and were kept to the minimal change that resolves the named
  defect.
- This implementation does not attempt to diagnose a *categorically different* misconception per
  remedial beyond what each rationale specifies (e.g. it reuses the same conceptTag and mostly
  the same misconception family, just with an independent problem instance or a task that
  targets a named sub-cause). If closure review wants remedials to target a categorically
  different misconception than the main sequence, that is a new, explicit judgment call that
  should be signed separately.

## Gate status

No gates were run by this worker (npm/vitest/tsc are explicitly out of scope per the assignment
contract; only `json.load` parse-checks and scripted structural/arithmetic verification were
performed, all passing — see "Verification performed" above). Central gate sequence
(`npm run typecheck`, `npx vitest run`, `npm run validate:content`, `npm run lint:pedagogy`,
`npm run validate:native`, `node scripts/check-registration.mjs`, `npm run build`) must still be
run independently before this batch is considered closed.
