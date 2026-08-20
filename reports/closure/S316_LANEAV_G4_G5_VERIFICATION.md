# S316 Lane A/V — Independent Verification: measure-problems-g4 / unlike-fractions-g5

Independent adversarial verification of 23 lesson revisions made against signed REVISE decisions in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, implemented by the lane worker recorded in
`reports/closure/cowork-staging/laneA-g4-g5.jsonl`. Method: for each lesson, read the signed REVISE
rationale first, read the current lesson JSON and `git diff HEAD` in full, form an independent
verdict by re-solving every changed arithmetic problem and re-checking every trap/collision/feedback
rule, then cross-check the implementer's own claims. No files were edited; findings are recorded only
in `reports/closure/cowork-staging/laneAV-g4-g5-dispositions.jsonl` (23 NDJSON lines, one per lesson)
and this report.

## Verdict counts

- **23** lessons verified
- **15 KEEP** (all 11 unlike-fractions-g5 lessons + 4 measure-problems-g4 lessons whose main route had
  no figure defect)
- **8 REVISE** (all measure-problems-g4, all for the same reason: a main-route figure/text mismatch
  named in the original S256 rationale that the implementer explicitly left unfixed because fixing it
  requires a new component in `src/components/figures.tsx`, a file forbidden to this worker's scope)
- **0 ESCALATE**

## What every lesson had in common

All 23 lessons had the identical class of original defect: `remedials[0].concept` had no `figure`,
and `remedials[0].check.widget` was a verbatim (or near-verbatim) repeat of the lesson's `k1` check —
same numbers, same reasoning, same job. In every one of the 23 lessons, `git diff HEAD` confirms the
fix pattern was:

1. `remedials[0].concept.figure` set to a **registered figure ID already used and verified truthful**
   on that same lesson's `c1` or `c2` (never an unverified or newly-invented figure).
2. `remedials[0].check.widget` replaced with a **freshly computed, distinct diagnostic** — a different
   quantity, a different misconception, or (in several cases) the previously-untested direction of a
   two-way conversion (e.g. km→m repeated at k1/k2/ch1, so the remedial now tests m→km).
3. All other diff lines in every file are cosmetic: `—` (em dash) / `×` / `÷` re-escaped to
   `—` / `×` / `÷`, a byte-level JSON re-serialization with no semantic content change.

Lesson IDs, step IDs, `conceptTag` values, hints, `explanationVariants`, main-route prompts/answers,
and every non-remedial step were confirmed byte-unchanged (apart from the em-dash-family escaping) in
every one of the 23 files.

## Verification method detail

For every remedial's new numeric/MCQ widget, I re-derived the answer independently and re-checked
every `commonErrors`/option value against the answer and against every other trap for exact-value
collisions — none found across all 23 lessons. Every new feedback string was checked for length
(≥25 chars) and for a negation-opening — none failed. Every reused `figure` ID was looked up in
`src/components/figures.tsx` and its rendered SVG text/labels were read to confirm it truthfully
depicts the specific numbers or the generic relationship named in the remedial's `concept.body`.
Every new remedial prompt was compared byte-for-byte against every other check/challenge prompt in
the same lesson to confirm no new duplicate was introduced.

## KEEP lessons (15) — remedial defect fully resolved, no other issue found

**measure-problems-g4 (4):** g4v-01-01, g4v-01-03, g4v-01-04, g4v-03-03 — these four had no
main-route figure defect in the original rationale (both `c1`/`c2` figures were already verified
truthful); with the remedial figure+check fix now verified sound, nothing prevents KEEP.

**unlike-fractions-g5 (11, all lessons in scope):** g5u-01-01, g5u-01-02, g5u-01-03, g5u-01-04,
g5u-02-02, g5u-02-03, g5u-02-04, g5u-02-05, g5u-03-01, g5u-03-03, g5u-03-04 — none of these had a
main-route figure defect named in the original rationale; all 11 remedial fixes verified sound.

Notable case: **g5u-01-04**. The implementer also edited `remedials[0].concept.body`/`narration`
from "1/4 and 1/6 into twelfths" to "1/2 and 1/3 into sixths." I verified this was necessary, not
scope creep: `fm-common-denom` (the only registered figure for this concept) renders exactly
"1/2 → 3/6" / "1/3 → 2/6" — it never depicted a 1/4-and-1/6 example — and the lesson's own `c1`/`c2`
(untouched) already use the 1/2-and-1/3-into-sixths example throughout. The edit synchronizes the
remedial with the figure and with the rest of the lesson; the pedagogical structure ("first scales
by 3, second by 2") is preserved verbatim under the new numbers. Signed KEEP.

## REVISE lessons (8) — main-route figure defect remains open by design

All 8 are measure-problems-g4. In each, the remedial's own defect (missing figure + k1-repeat check)
is now resolved and verified sound, but the **main-route** figure named in the original S256
rationale is still live and unfixed, because the figure is a static, hard-coded, parameter-free
component in `src/components/figures.tsx` (a forbidden file for this worker) and no existing
registered figure in `figureIds.ts` depicts the lesson's actual scenario:

| Lesson | Main-route figure defect (unfixed, still live) |
|---|---|
| g4v-01-02 | c1 `ratio-table` shows a flour/milk ratio, not the meter/centimeter table the text describes |
| g4v-02-01 | c1 `md3-liter` one-liter jug does not depict the claimed 1,000 mL equivalence |
| g4v-02-02 | c1 clock figure shows only 3:00; does not visualize 60 min/hr or 60 sec/min |
| g4v-02-03 | c2 `two-step-bar` is hard-coded to an 18+24−15 join story, not equal-groups-then-single-subtraction |
| g4v-02-04 | c1 `md3-elapsed` shows a fixed 8:40–9:20 (40 min) interval, unrelated to five 30-min shifts minus 20 |
| g4v-03-01 | c1 `mmt-coin-total` shows 23¢ from dimes/pennies, not nine $25 passes minus $40 |
| g4v-03-02 | c1 `line-plot` depicts five pencil lengths, not eight quarter-unit marks at 1/4 |
| g4v-03-04 | c1 `mb-multistep` is equation-only (no bar); c2 `two-step-bar` shows only end-subtraction, not the inside-every-group contrast |

Each of these 8 is signed **REVISE / visualDecision REQUIRED / gradeLanguageDecision FIT** — the
remedial-side work is sound, but the queue row must stay open until a new figures.tsx component (or
an existing-registered-figure swap that the current registry does not support) closes the main-route
mismatch. This matches the packet's explicit instruction not to sign KEEP on a lesson with a known
live figure-text mismatch.

### Additional finding beyond the original rationale: g4v-03-04

For g4v-03-04, independently inspecting the figure the implementer attached to the *remedial*
(`two-step-bar`, reused from `c2`) turned up a defect more specific than the original rationale's
"shows only an end-subtraction case": `TwoStepBar` in `figures.tsx` is hard-coded to an
**18 + 24 − 15 JOIN story with two unequal addends** — it is not an equal-parts/multiplication bar at
all. Attaching it to the remedial's "equal parts... inside every part" concept body is therefore a
figure/text mismatch in its own right, not merely an incomplete version of the right structure. The
implementer's own staging note in `laneA-g4-g5.jsonl` discloses this candidly as "the best available
option" under the same static-figure/forbidden-file constraint, so this is not a discrepancy with
their claim — but it means the remedial's visual promise is *not yet met* either, which the
disposition's rationale states explicitly.

## Implementer-claim cross-check

Every claim in `reports/closure/cowork-staging/laneA-g4-g5.jsonl` (23 entries, `rejected: false` on
all) was checked against the observed `git diff HEAD` for that lesson **after** independently forming
my own verdict. No discrepancies were found: every described figure ID, every described change to
`remedials[0].concept`/`remedials[0].check.widget`, and every disclosed non-fix ("NOTE: ... was NOT
fixed ... Flagged for escalation") matches the actual diff exactly. The implementer's self-disclosure
of the 8 unresolved main-route defects and the g4v-03-04 remedial-figure limitation is accurate and,
if anything, slightly conservative (see the g4v-03-04 finding above, which sharpens rather than
contradicts their disclosure).

## Files written

- `reports/closure/cowork-staging/laneAV-g4-g5-dispositions.jsonl` — 23 NDJSON disposition records
  appended (one per lesson; file previously did not exist for this lane).
- `reports/closure/S316_LANEAV_G4_G5_VERIFICATION.md` — this report.

No lesson, course, or other repository source file was modified.
