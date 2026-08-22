# S316 Lane A/V — Independent Verification: fluency-20-g2 + fractions-deeper-g3

Independent adversarial verification of the implementer's revisions to the 24 lessons named in
this packet (`fluency-20-g2`: 14 lessons; `fractions-deeper-g3`: 10 lessons), against the
original signed REVISE decisions in `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`.
Method: original REVISE rationale read first, then current lesson JSON + `git diff HEAD` read in
full, verdict formed independently, and only then cross-checked against the implementer's claims
in `reports/closure/cowork-staging/laneA-g2-g3.jsonl`. Dispositions signed to
`reports/closure/cowork-staging/laneAV-g2-g3-dispositions.jsonl` (24 records, one per lesson).
No source files were edited by this verification pass.

## Verdict counts

- **KEEP: 7** (all in fractions-deeper-g3)
- **REVISE: 17** (all 14 fluency-20-g2 lessons; 3 of 10 fractions-deeper-g3 lessons)

## fluency-20-g2 (14 lessons) — all REVISE

The 2026-08-18 S251 dispositions for every one of these 14 lessons name the identical residual
defect: *"the remedial route is same-family immediate practice rather than a fully distinct
misconception diagnosis."*

The working-tree diff for 13 of the 14 lessons (`f20-01-01` through `f20-03-06`, excluding
`f20-03-03`) is a single-hunk change to `remedials[0].check.widget.prompt`: the bare equation
(e.g. `"6 + 6 = ?"`) was reworded into a word-problem wrapper (e.g. `"Two boxes hold 6 crayons
each. How many crayons are there in all?"`) around the **identical numeric fact** — same
operands, same answer, unchanged `commonErrors` and feedback. This resolves literal
byte-duplication with `k1` but does **not** resolve the defect actually named: the remedial still
asks the learner to recall the exact same fact the main-sequence check already tested, just
dressed in a story. No new misconception is targeted, no different representation is used, no
transfer is required.

This reading is confirmed by the implementer's own log
(`reports/closure/cowork-staging/laneA-g2-g3.jsonl`), which describes each change as "reworded
from verbatim k1 repeat ... to a distinct concrete context ... with the same answer/commonErrors"
— i.e. the implementer resolved "not byte-identical text," a narrower target than "a fully
distinct misconception diagnosis."

`f20-03-03` (Fact Families to 20) got a more substantive fix: the remedial changed from an exact
repeat of k1 (`"14 − 8"`, answer 6) to the complementary fact-family member (`"14 − 6"`, answer
8) — genuinely different drawn numbers, not just a wrapper. This is real progress and the only
lesson in the batch where the drawn numbers actually changed, but it is still an immediate-recall
check of the same fact family (6, 8, 14) with the same check structure, so it does not clear the
"fully distinct misconception diagnosis" bar either.

No regressions were found: arithmetic in every new prompt is correct, `commonErrors`/answer still
agree, no trap==answer or trap==trap collisions, conceptTags/IDs untouched, feedback length and
phrasing fine, no negation-opening, grade-appropriate language throughout.

**All 14 lessons: REVISE**, with the residual defect precisely named as: the remedial route still
tests the identical (13 lessons) or same-fact-family (`f20-03-03`) content as the main-sequence
check; no diagnostic or transfer task was substituted.

## fractions-deeper-g3 (10 lessons)

### KEEP (7): g3f-01-01, g3f-01-02, g3f-02-03, g3f-02-04, g3f-03-01, g3f-03-03, g3f-03-04

Each of these had its named S252 defect(s) resolved with a substantive fix, not just rewording:

- **g3f-01-01**: remedial no longer byte-identical to k1 (denominator changed 3→4, shape
  circle→rectangle); figure `frac-equal-vs-unequal` added (registered); ch1 no longer
  near-duplicates k2 (denominator changed 3→5); the removed `Ssg2ThirdsCountNumeric` variant is
  justified — that generator (`src/lib/g2Variants.ts`) is hardcoded to thirds/answer=3 and would
  silently mismatch the new fifths/answer=5 prompt.
- **g3f-01-02**: remedial changed from a naming task (verbatim k1) to a genuinely different
  comparison task ("Which is smaller: a third or a sixth?"); figure `thirds-compare` added.
- **g3f-02-03**: remedial changed from verbatim k1 to a diagnostic learner-mistake task (scaled
  only the denominator); figure `fa-multiplier` added; the denominator-24 challenge was changed
  to denominator-18, explicitly grounded in the ×3 factor already practiced elsewhere in the
  lesson, resolving the "needs clearer Grade 3 progression rationale" note.
- **g3f-02-04**: remedial changed from verbatim k1 to a diagnostic learner-mistake task (scaled
  denominator by ×4, forgot to scale numerator); figure `frac-equiv-numline` added.
- **g3f-03-01**: terminology fixed (zero "mixed number" hits verified by full-text scan); the
  `faImproperToMixedNumeric` variant correctly removed from k1/k2/k3/ch1 (confirmed in
  `src/lib/g4Variants.ts`: `rem=pick(rand,1,den-1)` can never draw a zero remainder, so the
  generator can never match an exact-whole-number widget); ch1 was previously an exact duplicate
  of k1 (both 8/8=1) — now a fresh pair (18/6=3); remedial changed to a fresh pair (10/2=5) with
  figure `frac-whole-disguise` added.
- **g3f-03-03**: remedial changed from a same-denominator ordering task (verbatim k1, and
  mismatched with the remedial concept's own shared-numerator topic) to a genuine same-numerator
  transfer task (1/2, 1/5, 1/10) that actually exercises the concept text's stated principle;
  figure `frac-compare-same-numer` added.
- **g3f-03-04**: terminology fixed on ch1 (16/8=2), variant removed appropriately; remedial
  changed from verbatim k1 to a fresh pizza/8-slices/3-eaten scenario (3/8) with figure
  `frac-top-bottom` added.

All arithmetic in the above was independently re-derived and confirmed correct; no
`conceptTag`/ID changes; no collisions; language fit for Grade 3.

### REVISE (3): g3f-01-04, g3f-02-05, g3f-03-02

- **g3f-01-04** — *residual defect not addressed.* The S252 rationale flagged, generally, that
  "the checks use fraction bars or simple array totals rather than consistently assessing
  fraction-of-a-set reasoning ... Their numeric fallback says to name equal pieces of a cut whole,
  which is contextually false for the array task." k1 and the remedial were correctly redesigned
  (row×column array total → genuine fraction-of-a-set division reasoning, with a corrected
  fallback). **k3 was left untouched**: it is still `"Four counters form a 2-by-2 array. Enter
  the total number of counters."` (a plain array-total count, still carrying the original
  `Ssg2GridApplyNumeric` variant), still tagged `conceptTag=g3f-set-model`, and its
  `fallbackFeedback` is still the literal text the rationale called out as contextually false
  ("Name the equal pieces the whole was cut into..."). The implementer's own log only claims
  changes to k1 and the remedial, confirming k3 was never touched.

- **g3f-02-05** — *the two named defects are fully resolved, but this pass independently found a
  new residual defect.* Terminology fix verified complete (zero "mixed" hits in the full lesson
  JSON); `faImproperToMixedNumeric` variant correctly removed from k1/k2/ch1 for the same reason
  as g3f-03-01; remedial fixed with a fresh pair and figure `frac-whole-disguise`. However, **k1
  and k2 test the identical fraction 8/2=4**, with near-identical prompts (k2 only appends
  "Group the halves into complete wholes."), identical `commonErrors` values (8, 2), and identical
  feedback text. Both hunks in the diff show this pair was already `8/2` on both sides before the
  fix, so this is a pre-existing near-duplicate that the S252 rationale did not flag and this
  revision did not touch. Flagging it now: k1 and k2 should use two different fraction pairs, the
  way k3/ch1/remedial each already do.

- **g3f-03-02** — *fix introduced a new, unrelated defect.* The remedial was correctly changed
  from a verbatim repeat of k1 to a genuinely different diagnostic scenario (same-numerator,
  different-whole ribbon comparison: 3/5 of a short ribbon vs. 3/5 of a longer one), with figure
  `frac-compare-same-denom` added — a real improvement toward "diagnosing ... which whole or
  numerator comparison caused the error." But distractor option `o2` ("Fifths are always bigger
  than fourths") is a stale leftover from the pre-revision Maya/Ben prompt (which compared halves
  and fourths) and is irrelevant to the redrawn numbers — the new prompt uses only fifths and
  never mentions fourths. The option's own feedback has to explicitly disclaim it ("This
  comparison never involves fourths..."), confirming it is not a real, drawn-number-grounded
  misconception. Not a grading bug (feedback is accurate), but it fails the "every distractor is a
  computed real misconception ... using the numbers actually drawn" bar and should be replaced.

## Implementer-claim discrepancies

Cross-checked against `reports/closure/cowork-staging/laneA-g2-g3.jsonl` after forming
independent verdicts (all entries had `"rejected": false`):

1. **fluency-20-g2 (all 14)**: the implementer's log describes each fix as resolving "verbatim
   k1 repeat," which is true, but the original S251 rationale's actual complaint was broader
   ("same-family immediate practice rather than a fully distinct misconception diagnosis"). The
   log's framing is accurate about what was done but overstates what was resolved relative to the
   signed rationale.
2. **g3f-01-04**: the implementer's log claims changes only to `steps[k1]` and `remedials[0]`; it
   does not mention k3 at all. This matches the independent finding — k3's array-total design and
   its false fallback (the exact thing the rationale called "the array task") were never touched,
   confirming the gap rather than contradicting it.
3. **g3f-02-05**: the implementer's log lists the terminology and remedial fixes but does not
   mention the k1/k2 numeric duplicate (8/2=4 in both). Consistent with the independent finding
   that this pre-existing defect was not caught or addressed by this revision.
4. **g3f-03-02**: the implementer's log describes the remedial fix accurately but does not flag
   the leftover "fourths" distractor as a residual issue in the new prompt.

No case was found where the implementer's log claimed a fix that, on inspection, was not actually
present in the source (no fabricated-claim discrepancies) — the discrepancies found are all
omissions/incomplete scope relative to the signed rationale, not false claims about the diff
itself.

## Files

- Dispositions (signed): `reports/closure/cowork-staging/laneAV-g2-g3-dispositions.jsonl` (24
  records)
- This report: `reports/closure/S316_LANEAV_G2_G3_VERIFICATION.md`
- No lesson, course, or ledger files were modified by this verification pass.

---

## ADDENDUM (S316-R) — 2026-08-20 — earlier dispositions in this file are SUPERSEDED

`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` adjudicated the disagreement between this
file's original verdicts and the implementer's claims, and set a binding, mechanical standard
(**S316-R**, §1.4: R1-R9) for the remedial-distinctness defect class. Its central correction: the
signed defect is *diagnostic equivalence to k1* (does the remedial normalize — digits replaced with
`#` — to the same template as k1 or any other widget-bearing step in the lesson, and is it
generator-reproducible), not *categorically distinct misconception identity*. This is grounded in a
real, independently-reverified precedent: `mf3-01-01` (`content/courses/mult-fluency-g3/lessons/mf3-01-01.json`)
holds a signed **KEEP** (`S248-MF3-mf3-01-01`) for exactly the "same numbers, same traps, changed only
representation" shape (`"2 × 6 = ?"` → `"Use 6 pairs of counters. How many counters are in all?"`,
commonErrors/feedback byte-identical) — I read this lesson and its ledger record directly and confirm
the adjudication's characterization is accurate.

Two further packets were read and independently re-verified: `S316_FIXUP_BATCH3.md` (fixed
`f20-03-03`'s R2 failure, plus five other lessons/gates outside this scope) and
`S316_G3F_RESIDUAL_FIXES.md` (fixed the 3 residual defects this file originally found in `g3f-01-04`,
`g3f-02-05`, `g3f-03-02`).

**Original verdicts in the body of this file above are superseded.** The current, binding
dispositions are in `reports/closure/cowork-staging/laneAV4-g2-g3-dispositions.jsonl`
(`recordId` prefix `S316-V4-`), re-verified against S316-R with fresh basis hashes. Result: **18
KEEP, 6 REVISE** (previously 7 KEEP, 17 REVISE).

Re-verification independently confirmed, by recomputing the S255 `normalized()` function against
every widget-bearing step in each lesson (not the looser check this file originally applied):

- **All 14 `fluency-20-g2` lessons now clear R1/R2/R3/R4/R5** (including `f20-03-03` after its
  fixup reword) — the "cosmetic wrapper" characterization in the original body of this file is
  withdrawn; the S255-style normalized-template test is the correct operative bar, and these pass
  it.
- **9 of `fractions-deeper-g3`'s 10 lessons KEEP**; all 3 previously-found residuals
  (`g3f-01-04` k3, `g3f-02-05` k1/k2 duplicate, `g3f-03-02` stale distractor) are confirmed fixed
  by direct inspection of the current source.

This re-verification also found **new** defects under the fuller S316-R standard that neither the
original pass nor the adjudication caught:

- **R6 (answer-on-screen) violations in 5 `fluency-20-g2` lessons**: `f20-01-01`, `f20-01-03`,
  `f20-01-04`, `f20-02-02`, `f20-02-04`. `playerStore.ts:200-205` injects `remedial.concept` then
  `remedial.check` as a consecutive pair; each of these 5 lessons' remedial `concept.body` states
  the exact worked example (same operands, same numeric answer) as the check that immediately
  follows — e.g. `f20-01-01`: concept "Two equal groups: 6 and 6 make 12..." precedes a check
  asking the identical 6+6 as a word problem. Same defect class, same fix pattern, as the
  adjudication's own `g4v-01-02` R6 example.
- **R2 template collision + stale `explanationVariants` in `g3f-01-04`**: the fixed `k3` is sound,
  but `remedial.check.widget.prompt` normalizes identically to `k1`'s (`"A set of # counters is
  split into # equal groups..."` for both 15/3 and 18/3) — an operand swap under an unchanged
  template, the same defect class rejected elsewhere in the adjudication. `k1`/`k3`/remedial's
  `explanationVariants` (`"Rows of equal groups. Count the whole set."` / `"Groups times size.
  Every group counted."`) still describe the pre-redesign row×column-total task, not the current
  fraction-of-a-set division task.

See `reports/closure/cowork-staging/laneAV4-g2-g3-dispositions.jsonl` for the full per-lesson
rationale of every KEEP and REVISE under S316-R.
