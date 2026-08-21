# S322 Independent Assessment — Lane B F11

Reviewer: Claude Cowork independent assessor (S322)
Reviewed at: 2026-08-20T21:11:04.000Z
Scope: content/courses/measure-problems-g4, content/courses/division-fluency-g3, content/courses/shapes-space (31 lessons, all superseding any current dispositions per instruction to assess at current state)
Dispositions: reports/closure/cowork-staging/laneB-s322-F11-dispositions.jsonl
Ledger: not written (per instruction — assessor stops at the staging files).

## Method

Read `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` first and treated it as an evidence
accelerator only, never as authority for a KEEP or REVISE call — every verdict below is from a
direct, independent read of current repository source.

For every one of the 31 lessons: full read of the lesson JSON (main steps + remedials), hand
recomputation of every numeric/mcq/estimateSlider/numberLineHop/numberLinePlace/areaModel/
barBuilder/fractionEntry answer and `commonErrors`/distractor claim, and a direct read of every
bound `src/components/figures.tsx` component's source (not just its comment) to check what it
actually renders against the lesson's own stated numbers. Ran a programmatic **byte-identical**
duplicate scan (exact prompt+options+answer+commonErrors match, prefix-boilerplate normalized —
"Apply without the opening model:", "Transfer to a final context:", "Retrieve or diagnose in a new
form:", "Diagnose a...:", "Model...:" stripped before compare) and a **prompt-excluded structural**
scan (options/commonErrors compared with all digits stripped) over every mcq/numeric widget in all
three courses, cross-lesson and within-lesson. Confirmed mcq/predict use `seededShuffle` at render
(`src/components/widgets.tsx`, `src/components/LessonPlayer.tsx`) and lab widgets (`barBuilder`,
`areaModel`, `dragBucket`, `dragOrder`, `shapeHierarchyLab`) do not shuffle — platform-level pass,
applies to all 31 lessons; per the packet's note, S316/S320 already fixed shuffle-fixed-lab defects
elsewhere and none were reintroduced here. Basis hashes pulled via
`node scripts/session/print-review-basis.mjs` in one bulk call over all 31 lesson IDs — no
stale-hash or unknown-lesson errors.

**measure-problems-g4** — per the packet's note that this course "had HEAVY S316 repairs (11
figure rebuilds, most lessons carry current dispositions)": read `S316_G4V_FIGURE_REBUILD.md` in
full first, confirmed the 11 rebuilt figure bindings (g4v-01-01 c2, g4v-01-02 c1, g4v-01-03 c2,
g4v-02-01 c1, g4v-02-02 c1, g4v-02-03 c2, g4v-02-04 c1, g4v-03-01 c1, g4v-03-02 c1, g4v-03-04
c1/c2/remedial) are present and byte-correct in the current lesson JSON exactly as that report
describes, and did **not** re-flag any of them. All defects found in this course are duplicate
content, not visual — see below.

**division-fluency-g3** — per the packet's note on "S318 figure work + the df3-03-02
intentional-assessment adjudication": read `S318_G3_CLEARANCE_VERIFICATION.md` (the 19-placement /
16-lesson figure clearance table) and `S319_DF3_ADJUDICATION.md` in full first. Confirmed the 19
cleared figure placements are correct and did not re-flag any of them (`df3-01-04` c1/remedial,
`df3-02-01` c1, `df3-02-03` c1/remedial, `df3-02-04` c1/remedial, `df3-03-03` remedial — all match
the S318 table). Confirmed `df3-03-02`'s live `reviewBasisHash` (`de5aa800...`) is byte-identical to
the hash recorded in `S319_DF3_ADJUDICATION.md`, and did **not** relitigate its k1/k3
"intentional-assessment" repetition ruling. Found a **new, narrower** defect the S318 table's
19-placement scope never covered: five remedial-concept figure bindings (`df3-01-01`, `df3-01-02`,
`df3-02-01`, `df3-02-02`, `df3-03-02`) reuse a fixed, non-parameterized figure whose rendered title
states a divisor/quotient that directly contradicts the remedial's own body text (e.g. `df3-01-01`'s
remedial says "shared equally between 2 groups... 6 in each" while its bound figure explicitly
renders "12 shared into 3 groups → 4 each"). This is the same category of defect the S316/S318
figure work fixed elsewhere in this exact file (parameterized `*Example` helpers already exist for
the sibling "missing-factor" figures and are correctly used by 6 other lessons in this course), but
these 5 remedial (and, for 2 of them, also the c1) bindings were left on the old fixed component.

**shapes-space** — the task packet described this course as "K"; `content/courses/shapes-space/
course.json` states `gradeLevel: 3`. Flagging this source mismatch per the packet's own prefix
instruction ("treat any mismatched source... as stale... return the mismatch") rather than silently
picking one. The grade-3 label does not change any verdict below: every sibling course at or below
grade 5 in this repo (K courses and grades 1–5) universally authors a `narration` string on every
concept step; grade 9+ courses correctly have none. `shapes-space` is the sole grade ≤5 course with
**zero** `narration` fields across all 7 lessons, and every lesson's body text contains markdown
emphasis (`**bold**`) that the read-aloud fallback does not sanitize (`narrationFor()` in
`src/lib/speech.ts` falls back to `body` when `narration` is absent; `speakableMath()` does not
strip markdown). This is a systematic, course-wide accessibility gap, not a math or duplication
defect — every math/logic claim in all 7 lessons was independently recomputed and found correct.

## Counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| measure-problems-g4 | 12 | 8 | 4 | 0 |
| division-fluency-g3 | 12 | 6 | 6 | 0 |
| shapes-space | 7 | 0 | 7 | 0 |
| **Total** | **31** | **14** | **17** | **0** |

## REVISE list (one-phrase reasons)

**measure-problems-g4**
1. **g4v-01-02** — k2 numeric byte-identical to g4v-01-01/ch1 (cross-lesson duplicate).
2. **g4v-01-03** — k2 numeric byte-identical to g4v-01-02/k3 (cross-lesson duplicate); k3 mcq byte-identical to g4v-01-04/k2 and topically misplaced (mass content in a length lesson).
3. **g4v-03-03** — k2 mcq byte-identical to g4v-02-04/k2 (cross-lesson duplicate).
4. **g4v-03-04** — k1 mcq byte-identical to g4v-02-03/k2 (cross-lesson duplicate).

**division-fluency-g3**
5. **df3-01-01** — c1/remedial figure `mult3-fair-shares` renders 12÷3=4 in a "Dividing by 2" lesson; remedial text (12÷2=6) directly contradicts it.
6. **df3-01-02** — c1/remedial figure `mult3-how-many-groups` renders 12÷4=3 in a "Dividing by 3" lesson; remedial text (18÷3=6) directly contradicts it.
7. **df3-02-01** — remedial figure `mult3-divide-by-nine` renders 63÷9=7; remedial text states 54÷9=6 (direct contradiction).
8. **df3-02-02** — remedial figure `mult3-divide-by-ten` renders 70÷10=7; remedial text states 50÷10=5 (direct contradiction).
9. **df3-03-02** — remedial figure `mult3-divide-by-zero` renders "7÷0"; remedial text discusses "divide 5 by 0" (direct contradiction; separate from and does not reopen the S319 k1/k3 adjudication).
10. **df3-03-04** — k3 numeric byte-identical to df3-01-04/k1 (cross-lesson duplicate).

**shapes-space** (all 7 — single shared root cause)
11–17. **geo-01-01, geo-01-02, geo-01-03, geo-02-01, geo-02-02, geo-03-01, geo-03-02** — zero `narration` fields course-wide; body markdown (`**bold**`) leaks unstripped into the read-aloud fallback, unlike every sibling grade-≤5 course in the repo.

## Implementation contract per REVISE

**measure-problems-g4 duplicates** — for each pair, only the *later* lesson's named step needs new
`widget.options`/`prompt`/`commonErrors` text; the earlier lesson (already KEEP) is untouched.
Preserve each check's existing misconception shape; only the surface scenario/numbers need to be
fresh and, for g4v-01-03/k3, on-topic (length, not mass).

- **g4v-01-02 / k2**: replace with a new equal-unit-times-1000 scenario (not 9 km/9000 m), keeping
  the same `commonErrors` shape (an additive slip, a divide-instead-of-multiply slip).
- **g4v-01-03 / k2**: replace with a new "divide by 100 to go to the bigger unit" scenario (not 700
  cm/7), keeping the same two `commonErrors`.
- **g4v-01-03 / k3**: replace with a genuinely length-topic mcq (multiply-or-divide-by-100 for
  meters↔centimeters), not the mass/kilograms scenario that already belongs to g4v-01-04/k2.
- **g4v-03-03 / k2**: replace with a new "build then convert" order-of-operations scenario (not the
  5-shifts-of-30-minutes story already used at g4v-02-04/k2).
- **g4v-03-04 / k1**: replace with a new "read where the mark sits" bar-diagram scenario (not the
  6-laps-of-400m story already used at g4v-02-03/k2) — this lesson's own c1/i1/predict already use
  that exact scenario for a different step, so the replacement should draw on a *different* set of
  numbers than either the k1 currently duplicated or the c1/i1 material already present.

**division-fluency-g3 remedial figure fixes** — a parameterized helper (`Mult3FairSharesExample`,
`Mult3MissingFactorExample`, etc.) already exists in `src/components/figures.tsx` for exactly this
purpose (used correctly by `df3-02-03`'s and `df3-02-04`'s remedials, `df3-03-03`'s remedial, and
`mult-02-01`'s c2 per `S318_G3_CLEARANCE_VERIFICATION.md`). Bind each listed remedial (and, for
df3-01-01/df3-01-02, also c1) to a new instantiation using that lesson's own numbers instead of the
shared fixed component:

- **df3-01-01** (c1, remedial): a groups=2 instantiation, e.g. `Mult3FairSharesExample({total: 16,
  groups: 2})` for c1 (matching the lesson's own 16÷2=8) and `{total: 12, groups: 2}` for the
  remedial (matching its own stated 12÷2=6).
- **df3-01-02** (c1, remedial): a divisor-3 instantiation of the "how many groups" figure, e.g.
  `{total: 21, groups: 3}` for c1 and `{total: 18, groups: 3}` for the remedial (matching its own
  stated 18÷3=6). No parameterized version of `mult3-how-many-groups` currently exists in
  `figures.tsx`; one would need to be added following the `Mult3FairSharesExample` pattern.
- **df3-02-01** (remedial only): a 54÷9=6 instantiation. No parameterized version of
  `mult3-divide-by-nine` currently exists; add one following the same pattern, or bind the remedial
  to a different already-correct figure (e.g. `mult3-fact-family`, generic).
- **df3-02-02** (remedial only): a 50÷10=5 instantiation, same treatment as above for
  `mult3-divide-by-ten`.
- **df3-03-02** (remedial only): a 5÷0 instantiation of `mult3-divide-by-zero`, or bind the remedial
  to a generic figure/no figure, since ÷0's "undefined" claim does not depend on which specific
  nonzero dividend is used.

**df3-03-04 / k3**: replace with a new ÷6 fact (not 42÷6=7, already the leading fact of
df3-01-04/k1), keeping the same `commonErrors` shape.

**shapes-space (all 7)**: author a `narration` string on every `concept` step (c1, c2, and each
remedial's `concept`), following the house convention already used in every other course at or
below grade 5 — spoken-safe prose with markdown emphasis markers removed and any digits/symbols
spelled out or left as plain numerals per `src/lib/speech.ts`'s `speakableMath()` conventions. No
other field needs to change; all math/logic content in this course is correct as written.

## KEEP verdicts (14)

**measure-problems-g4** (8): g4v-01-01, g4v-01-04, g4v-02-01, g4v-02-02, g4v-02-03, g4v-02-04,
g4v-03-01, g4v-03-02 — see NDJSON for recomputed values and figure checks; no defects found.

**division-fluency-g3** (6): df3-01-03, df3-01-04, df3-02-03, df3-02-04, df3-03-01, df3-03-03 — see
NDJSON; every bound figure (including remedial figures) matches its own step's stated numbers
exactly, and no duplication was found.

## Scope discipline notes

- The ChatGPT Work cache prefix (`CHATGPT_WORK_V4_EXACT_PREFIX.md`) was read first and used only as
  an evidence accelerator, never as a substitute for direct recomputation against current source.
- Every REVISE lesson's cross-lesson duplicate partner was independently confirmed by direct file
  comparison (not assumed from a grep hit); every figure-text mismatch finding was confirmed by
  reading the actual `src/components/figures.tsx` component source, not its file-header comment.
- `df3-03-02`'s S319 k1/k3 "intentional-assessment" adjudication was read in full and respected —
  not re-flagged, not reopened. The REVISE call on that lesson here is for a different, previously
  unaddressed defect (the remedial-concept figure) that the S319 packet's scope never covered.
- The measure-problems-g4 11-figure S316 rebuild was verified byte-present in current source and not
  re-flagged; all measure-problems-g4 REVISE items here are duplicate-content findings, not visual
  ones.
- The division-fluency-g3 19-placement S318 figure clearance was verified byte-present in current
  source and not re-flagged; the 5 REVISE items here are additional, narrower remedial-figure
  bindings outside that clearance's 19-placement scope.
- No lesson, course, or shared component file was edited by this assessment. Only the two staging
  outputs listed above (this file and the NDJSON) were written. The ledger was not touched.
