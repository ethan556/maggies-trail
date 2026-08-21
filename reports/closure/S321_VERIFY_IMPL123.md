# S321 — Independent Verification of S320 Implementation Packets 1–3

**Role**: Independent verification assessor (not the implementer, not the original contract
author). Per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`'s authority hierarchy, an
implementation worker cannot assess or close its own packet; this review forms an independent
view first, then cross-checks it against the implementer's own claims.

**Scope**: 59 named lessons across 11 courses, spanning three implementation packets:
- **impl-1** (16 lessons — `S320_IMPL_A1_A12.md` / `laneA-s320-impl-1.jsonl`): contracts in
  `S320_ASSESS_A1.md` (add-subtract-1000-g2, data-graphs-g1, data-line-plots-g2) and
  `S320_ASSESS_A12.md` (lines-angles, measure-length-g1).
- **impl-2** (18 lessons — `S320_IMPL_A5.md` / `laneA-s320-impl-2.jsonl`): contract
  `S320_ASSESS_A5.md` (number-writing-k, shapes-build-k, counting-to-20-k).
- **impl-3** (25 lessons — `S320_IMPL_A11.md` / `laneA-s320-impl-3.jsonl`): contract
  `S320_ASSESS_A11.md` (compare-numbers-k, measure-compare-k, teen-numbers-k).

**Method**: For each lesson — read the original contract (REVISE section) → read current JSON +
`git diff ae399cc..HEAD` → verify the contracted defect is resolved, verify no collateral damage
(IDs/conceptTags/widget types/evaluator semantics preserved), hand-recompute every changed
number, verify feedback is literally true of what the widget renders (≥25 chars, no
negation-opening), and — critically — run a **scripted, prompt-excluded structural
duplicate scan** for every widget type present (`numberLineHop`, `tenFrame`, `mcq`, `tapDiagram`,
`matchPairs`, `dragOrder`, `lengthCompare`, `unitRuler`, `subitizeFlash`, `graphRead`,
`barBuilder`) across each full course (not just the touched lesson), comparing widget JSON with
the `prompt` field excluded — this catches "same numeric mechanics + same feedback text,
different prompt wording" duplicates that a byte-exact-including-prompt scan misses. Implementer
claim documents (`S320_IMPL_*.md`, `laneA-s320-impl-*.jsonl`) were read only after forming an
independent view, to check for discrepancies.

Git history: `HEAD` = `a78d6a3` ("S320-S321: 143 contracts implemented..."), parent =
`ae399cc` (pre-implementation baseline). All diffs use `git diff ae399cc..HEAD -- <path>`.

## Verdict counts

| Packet | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| impl-1 (A1+A12) | 16 | 16 | 0 | 0 |
| impl-2 (A5) | 18 | 13 | 5 | 0 |
| impl-3 (A11) | 25 | 11 | 14 | 0 |
| **Total** | **59** | **40** | **19** | **0** |

No finding rose to ESCALATE: every REVISE is fixable by rewording/renumbering existing content
within a REVISE worker's normal remit — no new figures, generator-code changes, or unscoped
judgment calls are required.

## Headline finding

**Every one of the 59 lessons' literally-contracted defects was correctly and completely
resolved.** There is no case of an unfixed, incorrectly-fixed, or partially-fixed contracted
item anywhere in the 59-lesson scope; all hand-recomputed arithmetic checks out; all reworded
feedback is literally true of its widget.

**However, an independent scripted duplicate scan — run per this task's own required method
("normalized digits→# distinctness vs lesson AND named siblings via a SCRIPTED SCAN across each
course") — surfaced 19 lessons carrying at least one *residual, pre-existing, cross-lesson
near-duplicate widget* (same widget mechanics and feedback text, differing only in the authored
prompt wording) that neither the original S320 assessment contracts nor the implementers' own
post-fix scans caught.** Most of these predate this packet entirely (the colliding pair is
untouched by any diff in `ae399cc..HEAD`); a smaller number were newly introduced as collateral
damage by this packet's own fixes. All 19 are REVISE, not ESCALATE, because the fix pattern is
identical to dozens of already-correctly-applied contract items in the same corpus: vary the
numeric/scenario details of the *later*-occurring side (per the "earliest occurrence = origin,
not flagged; later occurrence = needs revision" convention already established and used
throughout this corpus, including by `S320_ASSESS_A11.md`'s own methodology).

## impl-1 (16/16 KEEP) — no discrepancies

All 16 lessons (add-subtract-1000-g2, data-graphs-g1, data-line-plots-g2, lines-angles,
measure-length-g1) verified clean: contracted arithmetic fixes hand-recomputed correct, no
collateral damage, course-wide byte-exact and normalized-digit duplicate scans clean. Confirmed
consistent with `S320_IMPL_A1_A12.md`, which independently ran its own arithmetic-verification,
duplicate-prompt, and option-length-leak scans and reported the same clean result (including its
own confirmation that the pre-existing `g1m-03-03/k1↔g1m-03-02/k1` and `g1m-03-03/k3↔g1m-02-01/k3`
duplicates are now resolved). No discrepancy between this independent review and the
implementer's own claims for this packet.

`dgr1-01-03`'s `gradeLanguageDecision` is updated from the original REVISE to **FIT**, since its
contracted language fix is verified correct.

## impl-2 (13/18 KEEP, 5 REVISE)

### REVISE lessons and reasons

- **kcw-02-03** — Contracted i1/i2 fixes correct. `k2`'s numberLineHop is a pre-existing,
  untouched near-total duplicate of `kcw-01-04/k3` (origin; not itself flagged) — missed by the
  original contract and the implementer's re-scan.
- **kcw-03-04** — All three contracted fixes (i2, ch1, k3) correct. `k2` (mcq, untouched) is a
  pre-existing near-total duplicate of `kcw-01-02/k2` (origin, out of scope) — not named in the
  contract.
- **kgb-01-03** — Both contracted fixes correct and match the contract's own suggested text.
  However, the contract specified the *identical* replacement string for both this lesson's `i1`
  and the separately-contracted `kgb-01-02/i2`; since the two steps' underlying tapDiagram content
  was already structurally shared pre-fix, applying the same text to both (as directed) produced a
  genuine cross-lesson duplicate. `kgb-01-02` is the origin (precedes in course order); this
  lesson's `i1` needs a distinct on-topic rewording. This is a contract-level gap, not an
  implementer error.
- **kgb-02-02** — Contracted remedial fix correct. But the same commit's `k3` numberLineHop fix
  (start 4→3, moving off its named collision source) was checked for distinctness only against
  the named source per the implementer's own report — it now collides with `kgb-02-01/k2`, an
  untouched sibling never checked. Genuine collateral damage.
- **kgb-02-03** — Both contracted fixes (i2, k3) correct. Two further pre-existing, untouched
  duplicates found: this lesson's remedial duplicates `kgb-01-05/ch1`'s remedial; this lesson's
  `k2` (a legitimate, on-topic circle-identification task, correctly left alone by the original
  boilerplate-mismatch check) duplicates `kgb-02-02/ch1`'s own on-topic circle task. Both origins
  precede this lesson in course order. The original assessment's per-step *coherence* check ("is
  this text mismatched to its own task") did not catch these because it doesn't test cross-lesson
  *distinctness* — a documented gap in method, not outcome.
- **kc-03-01** — Contracted tenFrame→baseTenCompose fix correct and mutually distinct
  course-wide, exactly as the implementer claims. However, `ch1` was given a
  `variant: {gen: "base-ten-build"}` with no explicit `form`. Traced `src/lib/variants.ts` and
  empirically probed `variantForGenForm("base-ten-build","default",...)` via `npx tsx` across 16
  seed/band combinations: output is confined to `{13,15,16,17,19}` and can **never** reproduce
  `ch1`'s authored target of 11 ("the smallest teen number"). On replay (non-first walk),
  `refreshLessonSteps` redraws only `widget`, leaving hints/`explanationVariants`/predict text
  hard-anchored to "11" — a lesson replay risks showing a different teen number than the fixed
  prose describes (S316-R4-class defect). Fix: remove the `variant` field from `ch1`, or supply a
  form/generator whose range includes and is anchored to 11.

### KEEP lessons

kcw-01-04, kcw-02-02, kcw-02-04, kcw-03-01, kcw-03-03 (number-writing-k); kgb-01-01, kgb-01-02,
kgb-02-05, kgb-03-02, kgb-03-03, kgb-03-04 (shapes-build-k); kc-04-01 (counting-to-20-k) — all
verified clean: contracted fixes correct, no collateral damage, no cross-lesson duplicate found
touching these lessons' own steps.

### Open debt (not a disposition on any of the 59, recorded per task instruction)

`kcw-02-04`'s remedial `rem-kcw-write-13-19-k` and `kcw-03-01`'s remedial
`rem-kcw-write-count-teens-k` are byte-identical ("A group shows 13 dots. Which numeral names
that amount?"). Confirmed via `git diff` that neither remedial was touched by this packet. The
implementer's own `S320_IMPL_A5.md` explicitly self-flags this pair as out-of-scope. Recorded
here as **open debt**, not blocking either `kcw-02-04` or `kcw-03-01`'s KEEP disposition.

## impl-3 (11/25 KEEP, 14 REVISE)

### compare-numbers-k (4 KEEP, 5 REVISE)

REVISE: **kcm-01-03, kcm-01-04, kcm-02-01, kcm-02-02, kcm-02-03**. All contracted fixes on these
5 lessons are correctly implemented and hand-verified. Two independent, previously-uncaught
defect classes recur across them:

1. **Stale stars/hearts stub-template MCQ** on `ch1`: confirmed by direct inspection of every
   `ch1` mcq across compare-numbers-k. `kcm-01-01`, `kcm-01-02`, and `kcm-03-04` are internally
   consistent (their prompts genuinely mention stars/hearts). `kcm-03-02` is the implementer's
   own verified-correct residual fix (reworded to acorns/pinecones). But `kcm-01-03/ch1`,
   `kcm-01-04/ch1`, `kcm-02-01/ch1`, and `kcm-02-02/ch1` all carry options/feedback that assert
   "More stars"/"More hearts"/pairing-of-stars-and-hearts language while their own prompts
   describe unrelated or generic scenarios (a spaced-group illusion, drums and sticks, "two
   rows") — feedback that is not literally true of what the learner is shown. Not named in the
   `S320_ASSESS_A11` contract for any of these four lessons.
2. **Near-duplicate tenFrame/mcq content** via prompt-excluded structural comparison:
   `kcm-01-04/k1` duplicates `kcm-01-03/ch1`; `kcm-02-03/i2` duplicates `kcm-02-02/i2`. Origins
   precede in course order and are not themselves flagged.

KEEP: kcm-02-04, kcm-03-02, kcm-03-03, kcm-03-04 — contracted fixes verified correct, clean on
independent duplicate scan. (`kcm-02-04/k1` is a near-total, prompt-*inclusive* duplicate of the
out-of-scope `kcm-03-01/k3`; since `kcm-02-04` precedes `kcm-03-01` it is the origin and stays
KEEP — noted here as an additional out-of-scope observation, parallel to the kcw remedial open
debt above, but not independently confirmed as implementer-self-flagged.)

### measure-compare-k (7/7 KEEP) — no discrepancies

All 7 lessons (kmd-01-04, kmd-02-02, kmd-02-03, kmd-02-04, kmd-03-02, kmd-03-03, kmd-03-04)
verified clean on every axis, including the prompt-excluded structural scan across all widget
types present in the course. This course is genuinely clean.

### teen-numbers-k (1 KEEP, 8 REVISE)

REVISE: **knb-01-04, knb-02-01, knb-02-02, knb-02-03, knb-03-01, knb-03-02, knb-03-03,
knb-03-04**. Every one of these lessons' own literally-contracted fixes is correctly
implemented and hand-verified — including the implementer's two self-found residual fixes
(`kcm-03-02/ch1`, `knb-02-01/ch1`, both independently confirmed correct). This course's
`tenFrame`/`numberLineHop` "decompose a teen number into a full ten + N loose ones" template has
only a handful of valid target values (2–9) reused across ~30+ steps in 9 lessons, and a
prompt-excluded structural scan found systemic, previously-uncaught duplication throughout:

| Later side (REVISE) | Origin (KEEP, earlier in course) | Step type |
|---|---|---|
| knb-01-04/i1 | knb-01-03/ch1 | tenFrame (target 3) |
| knb-02-01/i2 | knb-01-02/i2 | tenFrame (target 4) |
| knb-02-01/k1 | knb-01-03/k1 (+ its remedial) | tenFrame (target 6) |
| knb-02-02/k1 | knb-01-03/i1 | tenFrame (target 5) |
| knb-02-02/i1 | knb-01-04/ch1 | tenFrame (target 8) |
| knb-02-03/i2 | knb-02-02/i2 | tenFrame (target 7) |
| knb-03-01/i2 | knb-01-03/i2 | tenFrame (target 8) |
| knb-03-02/i2 | knb-01-03/k3 | numberLineHop (start 10, +6) |
| knb-03-03/ch1 | knb-02-04/i1 | tenFrame (target 4) |
| knb-03-04/i2 | knb-01-04/i2 | tenFrame (target 2) |

Every pair listed is a confirmed byte-identical match (widget JSON minus `prompt`), verified via
`git diff` to be untouched by this packet on both sides, and not named in `S320_ASSESS_A11`. The
implementer's own report claims "0 cross-lesson groups" on both a raw and a normalized-digit
post-fix scan (`S320_IMPL_A11.md`, "Verification gates run" section) — **this is the primary
discrepancy between the implementer's self-report and this independent review**: that scan
evidently did not run prompt-excluded (i.e., it treated differing prompts as sufficient
distinctness), which is why it missed a defect class that the S320_ASSESS_A5 report's own
precedent (the pre-fix `kgb-02-02`/`kgb-01-05` pair) already established as requiring a fix
despite differing prompt text.

KEEP: **knb-02-04** — the one lesson in this course confirmed clean; its own `i1` is in fact the
origin of the `knb-02-04↔knb-03-03` pair above, not the later side, so it is not flagged.

## Verified: implementer's residual/self-found fixes

The implementer's own report (`S320_IMPL_A11.md`, "Notes on scope and residual fixes")
explicitly documents **two** fixes outside the literal contract text (not four — the task
description anticipated up to four, but the implementer's own document names exactly two):

1. `kcm-03-02/ch1` reworded from stars/hearts to "acorns and pinecones" after a normalized-digit
   scan found it colliding with `kcm-02-01/k1`. Verified correct: `kcm-02-01/k1` ("4 stars and 4
   hearts") is internally consistent and untouched; `kcm-03-02/ch1` is now distinct from it and
   is itself internally consistent (its own prompt does mention acorns/pinecones).
2. `knb-02-01/ch1` reworded to "right before 16" after the packet's own two independently-drafted
   "right before 15" fixes (for `knb-02-01/ch1` and `knb-03-02/ch1`) collided with each other.
   Verified correct: both are now distinct.

No additional undocumented self-found fixes were located beyond these two.

## Discrepancies vs. implementer self-reports (summary)

1. **impl-2 / kc-03-01**: implementer verified mutual distinctness (duplicate-focused) but did
   not check the newly-added `variant` field's *generator range* against the authored, hard-coded
   target (11) it accompanies. This is a defect class (S316-R4) the implementer's checklist did
   not include.
2. **impl-2 / kgb-02-02**: implementer's own report states the `k3` collision was checked "only
   against the named source lesson" — confirmed by this review to be exactly the gap that let a
   new collision with `kgb-02-01/k2` through.
3. **impl-3 / teen-numbers-k (8 of 9 lessons)**: implementer's claimed "0 cross-lesson groups"
   (raw + normalized-digit scan) is contradicted by this review's prompt-excluded structural scan,
   which found 10 confirmed residual duplicate pairs spanning 8 of the 9 lessons. The
   implementer's scan appears to have compared full widget content *including* the prompt field,
   which is insufficient for this defect class (same mechanics/feedback, different prompt).
4. **impl-3 / compare-numbers-k (4 of 9 lessons)**: the pre-existing stale stars/hearts
   stub-template MCQ defect on `kcm-01-03/01-04/02-01/02-02`'s `ch1` steps was not named in the
   original `S320_ASSESS_A11` contract and not addressed by the implementer (correctly, since it
   was out of contracted scope) — flagged here as newly-discovered.
5. **impl-1**: no discrepancies; the implementer's own scans and this review's independent scans
   agree completely.

## Raw data

- Verified disposition records (59, written incrementally by course):
  `reports/closure/cowork-staging/laneV-s321-impl123-dispositions.jsonl`
- This report: `reports/closure/S321_VERIFY_IMPL123.md`
- Review-basis hashes: generated via `node scripts/session/print-review-basis.mjs <59 ids>` at
  time of this review (embedded per-record as `reviewedBasisHash`).
- Contracts consulted: `reports/closure/S320_ASSESS_A1.md`, `S320_ASSESS_A12.md`,
  `S320_ASSESS_A5.md`, `S320_ASSESS_A11.md`.
- Implementer claims consulted: `reports/closure/S320_IMPL_A1_A12.md`,
  `reports/closure/S320_IMPL_A5.md`, `reports/closure/S320_IMPL_A11.md`, and
  `reports/closure/cowork-staging/laneA-s320-impl-{1,2,3}.jsonl`.
- Original visual/language dispositions inherited from:
  `reports/closure/cowork-staging/laneB-s320-A1-dispositions.jsonl`,
  `laneB-s320-A12-dispositions.jsonl`, `laneB-s320-A5-dispositions.jsonl`,
  `laneB-s320-A11-dispositions.jsonl` (all `visualDecision` values carried forward unchanged;
  `dgr1-01-03`'s `gradeLanguageDecision` updated REVISE→FIT per its verified-correct fix).
- Git baseline: `ae399cc` (pre-implementation) → `a78d6a3` (HEAD, post S320/S321
  implementation), all diffs via `git diff ae399cc..HEAD -- <path>`.
- No content/source files were edited by this review. No `npm`/`vitest`/`tsc` commands were run;
  `npx tsx` was used only for an ephemeral, in-repo, non-persisted probe script
  (`probe_baseten.mts`, created and deleted) to empirically verify the `kc-03-01` generator-range
  finding.
