# S316-R Lane AV2 — Re-verification: unlike-fractions-g5 remedials against the adjudicated standard

Follow-up re-verification of the 11 unlike-fractions-g5 lessons previously signed KEEP in
`reports/closure/cowork-staging/laneAV-g4-g5-dispositions.jsonl` (session S316), after
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` (adjudicator: Claude Cowork adjudicator
(S316), 2026-08-20) set aside those KEEPs and established the binding **S316-R** standard
(§1.4, clauses R1–R9) for the "remedial repeats k1" defect class. This pass re-derives a verdict
for each lesson against R1–R9 independently — not by trusting the earlier KEEPs or by copying the
adjudication's conclusions — then compares the result to the adjudication's own explicit expected
outcome. No lesson/course source file was edited. Confirmed via `node
scripts/session/print-review-basis.mjs` that all 11 review-basis hashes are byte-identical to the
first pass (S316), i.e. the content itself has not changed since my earlier review — only the
governing standard has.

## Verdict counts

- **11** lessons re-verified
- **9 KEEP**: g5u-01-01, g5u-01-03, g5u-02-02, g5u-02-03, g5u-02-04, g5u-02-05, g5u-03-01,
  g5u-03-03, g5u-03-04
- **2 REVISE**: g5u-01-02, g5u-01-04
- **0 ESCALATE**

This exactly matches the adjudication's explicit binding direction in its §5: *"the expected
outcome is ... REVISE on ... g5u-01-02 and g5u-01-04"* (the only two g5u lessons the adjudication
names for rework).

## Method

For each lesson: loaded the current lesson JSON, extracted every widget-bearing step's `prompt`
(`i1`, `k1`, `i2`, `k2`, `k3`, `ch1`), and the remedial's `concept`/`check`. Implemented the
`normalized()` function verbatim from `src/lib/session255.dataLinePlotsG2FollowOn.test.tsx:52–63`
in Python (`lowercase, replace /[-−+]?\d+(?:[.,/]\d+)*/g with #, collapse whitespace, trim`) and
ran it against the remedial prompt vs. **every** other widget prompt in the same lesson (not just
`k1`), programmatically — no manual spot-checks. For R4, read every `variant` declaration
(`gen: "g4-fractions"`) in each lesson and its corresponding fixed-string template in
`src/lib/g4Variants.ts:296–475`, and confirmed the remedial's actual wording cannot be produced by
that template under any parameter substitution. For R5, re-solved every changed numeric/MCQ answer
by hand and re-checked every trap for collisions. For R6, read `remedial.concept.body` against the
check's answer/correct option for every lesson, looking for the check's answer stated in the
immediately-preceding concept text. For R7/R8, read the actual SVG-rendering source of every
attached figure in `src/components/figures.tsx` and compared it to the concept body and the
check's numbers; confirmed `narration === body` by direct equality. `explanationVariants` on every
remedial check were read and confirmed number-free (so no staleness is possible against the new
widget) and confirmed untouched by `git diff HEAD`.

## KEEP (9)

All nine pass R1–R9 in full:

- **g5u-01-01, g5u-01-03, g5u-02-02, g5u-02-03, g5u-02-04, g5u-02-05, g5u-03-01, g5u-03-03,
  g5u-03-04**: distinct prompt (exact and normalized) from every widget-bearing step in the
  lesson; not producible by the declared `g4-fractions` generator form; traps recomputed and
  collision-free; no answer-leak in the concept→check pair; a registered figure whose rendered SVG
  text matches the remedial's own numbers (not merely the theme) — confirmed by reading the actual
  `figures.tsx` source for `fm-add-unlike`, `ns-lcm`, `fa-improper-mixed`, `fa-mixed-improper`
  (×2), `fa-simplify`, `fa-compare-benchmark`, `fm-subtract-unlike`; `narration === body`; the
  check's job matches what the concept just taught.

Two lessons are flagged in their disposition rationale as passing but worth a human's continued
attention, without falling to REVISE:

- **g5u-03-03**: the untouched `explanationVariants` hint `"Poured in adds."` is a generic,
  number-free ADD-case reminder that no longer matches this remedial's now-subtract (pour-out)
  story; it states no number, so it is not a *staleness* violation under the letter of the check,
  but it is a residual thematic mismatch.
- **g5u-03-04**: the remedial's normalized prompt is the closest near-miss to `k1` found across
  all 11 lessons — both are the same `"A jug holds # litre..."` story stem with different
  quantities, differing only in the tail clause (`"what is the plan?"` vs. `"which plan correctly
  follows that order?"`). R1 and R2 both pass strictly (confirmed programmatically, no match), but
  by a narrower margin than any other lesson in the batch.

## REVISE (2)

### g5u-01-02

Confirms adjudication defect (vii). R1–R6 and R8 pass in isolation — the new MCQ is a genuinely
distinct, correctly-computed diagnostic, not producible by the declared generator forms, and the
concept's attached figure (`fa-multiplier`) truthfully matches. The defect is a **regression in
widget surface**: `git diff HEAD` confirms the pre-revision remedial check was a `numeric` widget
carrying `previewDenominator: 6` (a model-backed, split-the-bar interaction), and the revision
replaced it with a text-only `mcq`. The original S253 rationale explicitly demanded *"A visual
diagnostic transfer task"*; the concept step gained a static figure, but the check step — where the
diagnostic judgment actually happens — lost its own model-bearing surface entirely. Signed
**REVISE / visualDecision REQUIRED**.

### g5u-01-04

Confirms adjudication defect (vi) **and adds an independent finding beyond what the adjudication
enumerated**. The adjudication's ruling is that the `concept.body`/`narration` rewrite (example
changed from "1/4 and 1/6 into twelfths" to "1/2 and 1/3 into sixths" to match the only registered
figure, `fm-common-denom`) is mathematically sound but was made without the signed rationale
authorising an edit to authored prose, and needs its own separately-signed amendment record —
so the lesson cannot be KEEP as delivered.

Independently re-deriving **R6** on the current text shows why this gap is not merely procedural:
the injected concept body immediately preceding the check now reads *"1/2 and 1/3 into sixths: the
first scales by 3, the second by 2"* — and the check immediately following is an MCQ whose correct
answer is *"1/3 needs ×2, not ×3 — only 1/2 needs ×3 to reach sixths."* The concept sentence states,
in plain arithmetic terms, exactly the fact the check asks the learner to diagnose. This is a
genuine R6 answer-leak, and it is a **consequence of the combined edit**, not something inherited
from the original content: the pre-revision body (the "1/4 and 1/6" example) was paired with a
plain numeric check ("scale 1/6 by ×2...") that its own "1/4 scales by 3, 1/6 by 2" sentence did
not answer (different fraction pair). Rewriting the body to match the figure *and* writing a new
diagnostic check whose entire job is "which fraction needs which factor" created a pairing where
the body now hands over the check's answer.

R1–R5, R7, R8 pass in isolation (figure and check-mechanics are sound), so visualDecision is
signed **SUFFICIENT** even though decision is **REVISE**.

## Packet-level note carried on all 11 dispositions

`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` §4-D(ii) reports
`session252.unlikeFractionsG5CourseIntegrity.test.tsx`'s evaluator-signature pin as GATE-RED
(expected `644bef53…`, got `8b35d290…`) because the implementer changed remedial answers across
all 11 g5u lessons. The adjudication's own instruction is explicit: *"Fix: re-pin the hash to the
new value... do not revert the content."* This is packet-level test-infrastructure debt, not a
per-lesson content defect, and per that instruction it is **not** grounds to withhold KEEP from an
otherwise-conforming lesson. Every disposition in `laneAV2-g5u-dispositions.jsonl` (all 11, KEEP
and REVISE alike) carries this note verbatim so the pin's outstanding state is visible without
being treated as a content defect. This session did not run `vitest` (out of scope for this task)
and did not re-pin the hash.

## Discrepancies vs. the adjudication

None found. Every R1–R9 finding in this pass corroborates the adjudication's own measurements
(9 KEEP / 2 REVISE, matching exactly), and the one addition — the R6 answer-leak on g5u-01-04 — is
a sharpening of the adjudication's own ruling 4(vi), not a contradiction of it: the adjudication
already concluded g5u-01-04 cannot be KEEP as delivered: it did so on authorization grounds and did
not enumerate the specific leak that the missing authorization produced.

## Files written

- `reports/closure/cowork-staging/laneAV2-g5u-dispositions.jsonl` — 11 new NDJSON disposition
  records (`recordId` prefix `S316-V2-`), superseding the 11 g5u rows in the earlier
  `laneAV-g4-g5-dispositions.jsonl` (S316) for these lessons.
- `reports/closure/S316_LANEAV2_G5U_VERIFICATION.md` — this report.

No lesson, course, or other repository source file was modified. No `npm`/`vitest`/`tsc` command
was run.
