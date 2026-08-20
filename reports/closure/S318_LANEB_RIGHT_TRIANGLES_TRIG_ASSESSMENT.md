# S318 Lane B — Independent Assessment: right-triangles-trig

**Reviewer:** Claude Cowork independent assessor (right-triangles-trig S318)
**Reviewed:** 2026-08-20T11:23:25.000Z
**Scope:** `content/courses/right-triangles-trig/course.json` + all 15 lessons in
`content/courses/right-triangles-trig/lessons/`. Course grade level: 10 (per `course.json`).
Read-only review; dispositions appended to
`reports/closure/cowork-staging/laneB-right-triangles-trig-dispositions.jsonl` (ledger itself
untouched, per prefix authority rules).

Per `CHATGPT_WORK_V4_EXACT_PREFIX.md`: the ChatGPT Work cache (`S318_HS_WITHHELD_CLEARANCE.md`,
etc.) was consulted only as an evidence accelerator, never as authority. Every mathematical claim
below was independently recomputed from the lesson source bytes, not taken from any prior pass's
conclusion.

## Decision counts

- **KEEP:** 13
- **REVISE:** 2
- **ESCALATE:** 0

All 15 lessons: `visualDecision = SUFFICIENT`, `gradeLanguageDecision = FIT`.

## REVISE list (one-phrase reasons)

| Lesson | Reason |
|---|---|
| `rt-01-04` (30-60-90 Triangles) | Label-length parity: i2 mcq correct option (67 chars) ~1.4x longer than every distractor (40-48 chars) |
| `rt-05-04` (Choosing the Tool & Trig Area) | Label-length parity: remedial mcq correct option (32 chars) ~1.9-2.7x longer than every distractor (11-17 chars) |

## Implementation contracts for REVISE items

### `rt-01-04` / step `i2` (interactive mcq, "Route the conversion")

- **File:** `content/courses/right-triangles-trig/lessons/rt-01-04.json`, `steps[].id === "i2"`,
  `widget.options`.
- **Defect:** option `o1` (correct, "Divide by √3 for the short leg, then double to reach the
  hypotenuse") is 67 characters; distractors `o2`/`o3`/`o4` are 40, 48, and 46 characters
  respectively. Correct answer is the sole longest option by a wide margin, making it identifiable
  without doing the routing logic the question tests.
- **Fix:** lengthen `o2`, `o3`, and `o4` labels to land within roughly 55-70 characters each, while
  preserving each label's existing wrong-step claim exactly (do not change which misconception each
  distractor represents, do not touch `feedback` text, do not touch `correct` flags, do not touch
  any other step). Example (illustrative only, author's judgment on final wording):
  - `o2`: "Divide the long leg by √3 to reach the short leg, then leave it there" (was: "Divide by
    √3, then stop at the short leg")
  - `o3`: "Double the long leg immediately, without ever finding the short leg first" (was: "Double
    the long leg before finding the short leg")
  - `o4`: "Add the two legs together directly to arrive at the hypotenuse's length" (was: "Add the
    legs before identifying the hypotenuse")
- **Verification:** recompute character length of all four `label` strings after edit; confirm no
  single option is the unique longest by more than ~10 characters, and confirm the `correct: true`
  option's underlying math claim is unchanged (divide long leg by √3 for short leg, then double for
  hypotenuse — this is the only valid route, per rt-01-04's own recap).

### `rt-05-04` / remedial `rt-choose-tool` (mcq, "Dispatch once more")

- **File:** `content/courses/right-triangles-trig/lessons/rt-05-04.json`,
  `remedials[].check.widget.options` where `conceptTag === "rt-choose-tool"`.
- **Defect:** correct option ("Law of Cosines, solved for cos C", 32 chars) vs. distractors "Law of
  Sines" (12), "SOH-CAH-TOA" (11), "Area = ½·ab·sin C" (17). The correct answer is roughly double
  the length of any distractor.
- **Fix:** lengthen the three distractor labels to be self-contained clauses of comparable length
  (roughly 25-35 characters) without altering their `feedback` text or the misconception each
  represents. Example (illustrative only):
  - `o2`: "Law of Sines, using any angle" (was: "Law of Sines")
  - `o3`: "SOH-CAH-TOA on the longest side" (was: "SOH-CAH-TOA")
  - `o4`: "Area = ½·ab·sin C for a guess" (was: "Area = ½·ab·sin C")
- **Verification:** recompute character length of all four `label` strings after edit; confirm no
  single option is the unique longest by more than ~10 characters.

Both fixes are pure `label` text edits inside existing `options` arrays — no widget type change, no
`figure` rebind, no `answer`/`correct`/`feedback`/`explanationVariants` changes, no course.json
change. Each is independently verifiable by a plain character-count script against the two touched
lessons; no build, lint, or test run is required to confirm the fix (though the standard `npx tsc
--noEmit` / registration checks should still pass since no structural fields change).

## Per-lesson verdicts

| Lesson | Title | Decision | Notes |
|---|---|---|---|
| `rt-01-01` | The Pythagorean Theorem | KEEP | All Pythagorean applications recomputed exact (3-4-5, 6-8-10, 13-5-12, 25-7-24 ladder, 9-12-15 diagonal). |
| `rt-01-02` | The Converse & Classifying Triangles | KEEP | Converse/acute/obtuse classification recomputed exact for every triple tested (8-15-17, 6-7-9, 4-7-9, 6-7-10, 20-21-29). |
| `rt-01-03` | 45-45-90 Triangles | KEEP | 1:1:√2 ratio verified at all five numeric instances to stated rounding. |
| `rt-01-04` | 30-60-90 Triangles | **REVISE** | 1:√3:2 ratio math fully correct; one mcq label-length parity defect (see contract above). |
| `rt-02-01` | Sine, Cosine & Tangent | KEEP | SOH-CAH-TOA arithmetic verified; the S318_HS_WITHHELD_CLEARANCE fix to `c2.body` was confirmed present and aligned with the `sohcahtoa-triangle` figure's fixed 3-4-5 values — not re-flagged, per known context. |
| `rt-03-01` | Finding a Side | KEEP | All four multiply/divide side-solving cases recomputed exact; i2 length gap judged content-driven, not blocking. |
| `rt-03-02` | Finding an Angle | KEEP | All inverse-trig computations recomputed exact; k3 options perfectly length-tied. |
| `rt-03-03` | Solving Right Triangles Completely | KEEP | Angle+side and two-sides cascades recomputed exact, including the Pythagorean self-audit (6.02²+7.99²≈100). |
| `rt-04-01` | Angles of Elevation & Depression | KEEP | Elevation/depression math and alternate-interior-angle equalities verified; figure title and c1 prose both restrict measurement to the horizontal, consistently. |
| `rt-04-02` | Height Problems | KEEP | Eye-height offset, hypotenuse-as-string case, and plane-descent case all recomputed exact; k3 options perfectly length-tied. |
| `rt-04-03` | Shadows, Wires & Surveys | KEEP | Shadow/wire computations exact; two-station survey system independently re-solved (x≈42.74, h≈61.03) and cross-checked via both triangles. |
| `rt-05-01` | How the Ratios Relate | KEEP | Quotient, Pythagorean, and cofunction identities all recomputed exact (including chained sin→cos→tan derivation to the 7-24-25 triple). |
| `rt-05-02` | The Law of Sines | KEEP | All Law of Sines computations, including the two-station river survey, recomputed exact. |
| `rt-05-03` | The Law of Cosines | KEEP | SAS, SSS-to-angle, obtuse sign-flip, and the C=90° Pythagorean-collapse case all recomputed exact. |
| `rt-05-04` | Choosing the Tool & Trig Area | **REVISE** | Area-by-sine and dispatch logic fully correct; one remedial mcq label-length parity defect (see contract above). |

## Notable findings (course-wide)

1. **Systematic label-length skew across mcq widgets.** Across the 26 multiple-choice widgets in
   this course (interactive + check + challenge + remedial), the correct option is the
   longest-or-tied-longest label in **17/26 (65%)** of cases — well above the ~25% baseline
   expected by chance for 4-option items. In most instances this tracks a real content asymmetry
   (a correct "describe the full multi-step method" option is inherently longer than a distractor
   naming one wrong step), and I did not treat that pattern alone as disqualifying. Two instances
   (`rt-01-04`/i2 and `rt-05-04`/remedial) crossed the threshold I used for a REVISE-worthy answer
   leak (correct option ≥1.4x the longest distractor, non-tied). The remaining moderate cases
   (`rt-03-01`/i2, `rt-03-03`/i2, `rt-04-01`/i1, `rt-04-03`/i1, `rt-05-01`/i2, `rt-05-02`/i1) are
   noted in their per-lesson rationale as observations for a future editorial pass, not blocked on
   here, since their distractor sets are otherwise well-constructed misconception options with
   correct numeric feedback.
2. **`rt-02-01`'s figure/text withheld status.** Confirmed via `S318_HS_WITHHELD_CLEARANCE.md` that
   the `sohcahtoa-triangle` figure and `c2.body` prose are aligned in the currently-read lesson
   bytes (`c2.body` states "In a 3-4-5 right triangle, sin θ = 3/5, cos θ = 4/5, and tan θ = 3/4",
   matching the figure's registered fixed values exactly). Per the known-context instruction, this
   is not re-flagged.
3. **No duplicate widget prompts** anywhere in the course (checked all 15 lessons' `steps[].widget`
   and `remedials[].check.widget` prompts for exact-string collisions — none found).
4. **No concept body exceeds the 80-word cap** anywhere in the course.
5. **Figures are fully registered** — every `figure` ID referenced by a lesson step
   (`pythagorean-proof`, `rt-find-leg`, `rt-rectangle-diagonal`, `rt-converse`, `rt-imbalance`,
   `rt-triples`, `special-right-triangles`, `rt-45-45-90`, `rt-special-preview`,
   `ratio-constant-sweep`, `sohcahtoa-triangle`, `rt-opp-adj`, `rt-find-side`, `rt-hyp-bottom`,
   `rt-inverse`, `rt-acute-sum`, `elevation-depression`, `rt-elevation`, `rt-parallel-ground`,
   `rt-height-angle`, `rt-hypotenuse-cases`, `rt-sanity-check`, `rt-shadows`, `rt-two-readings`,
   `rt-tan-quotient`, `rt-cofunction`, `oblique-triangle-laws`, `rt-law-sines`, `rt-third-angle`,
   `rt-law-cosines-sas`, `rt-law-cosines-sss`, `rt-area-sine`) exists in `figureIds.ts` and has a
   matching component in `src/components/figures.tsx`. Spot-checked several (`SohCahToaTriangle`,
   `ElevationDepression`, `ObliqueTriangleLaws`, `PythagoreanProof`) and confirmed `role="img"`,
   a descriptive `<title>` accessible description, and non-colour cues (text labels alongside
   colour-coded sides/angles).
6. **Every trig ratio, Pythagorean application, and special-right-triangle relationship in the
   course was independently recomputed** (not spot-checked) across all 15 lessons — every stated
   numeric answer, `commonErrors` value, and rounding matched hand/derived computation within the
   widget's own `tolerance`, and every rounding traced to an explicit "(N decimals)" instruction in
   its prompt.

## Raw data

- Lessons reviewed: 15/15 (`rt-01-01` through `rt-05-04`).
- Review basis hashes: computed via `node scripts/session/print-review-basis.mjs` for all 15
  lesson IDs; recorded per-lesson in the disposition NDJSON (`reviewedBasisHash` field).
- Dispositions file: `reports/closure/cowork-staging/laneB-right-triangles-trig-dispositions.jsonl`
  (15 NDJSON records, one per lesson).
- mcq/predict widgets inventoried: 26 mcq widgets (interactive/check/challenge/remedial), plus
  numeric widgets on every `check`/`challenge`/remedial step; all numeric widgets' `answer` and
  `commonErrors[].value` fields were recomputed from the stated prompt.
