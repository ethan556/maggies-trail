# S321 Assessment F9 — mult-fluency-g3, multiplication-division, transformations-measurement

Independent course assessor pass over three complete courses (60 lessons total: 18 + 24 + 18).
Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s321-F9-dispositions.jsonl`. Every disposition supersedes any
prior decision on these lesson IDs.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and obeyed: the ledger, current source,
and this session's own re-derivation are authoritative; the ChatGPT Work cache and any prior
assessor's prose are evidence only, not self-approving.

## Method

For every one of the 60 lessons, `node scripts/session/print-review-basis.mjs <id>` was run to get
the current review-basis hash, then compared against every `reviewedBasisHash` recorded anywhere in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` and every `reports/closure/cowork-staging/*.jsonl`
file:

- **39 lessons** carry a current-hash byte-match against a prior independently signed disposition
  (source unchanged since that review). These were spot-verified at current state (hand-recomputed
  numeric answers, remedial-route distinctness, figure registration) rather than re-derived from
  scratch; no new defect was found on any of them.
- **21 lessons** have no current-hash match anywhere (source has moved since the last ledger entry —
  chiefly repair packets S291/S296/S305 that ran after the S248/S251/S252 reviews that produced the
  stale hashes). These were read and assessed in full at current state: every step's body, widget,
  `commonErrors`/`commonBuilds`/`numericErrors`, predict/reveal, remedial, and referenced figure was
  read; every numeric/mcq/challenge answer was hand-recomputed; every cited figure was opened in
  `src/components/figures.tsx` and checked against the concept text and (for the multiplication-table
  and addition-table figures) against the S291/S305 repair claims.
- **mf3-03-01, mf3-03-03, mf3-03-06**: per the task's standing instruction, the S248 ESCALATE ruling
  stands. Confirmed the current hash still matches that exact signed ESCALATE record, so no
  independent re-verification under the (now S305-repaired) shared figure has been signed for these
  three; ESCALATE is reaffirmed with the upheld rationale, not re-litigated.

No npm/vitest/tsc was run (per instructions). Math was verified by hand; figure code was read
directly, not rendered.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| mult-fluency-g3 | 18 | 15 | 0 | 3 |
| multiplication-division | 24 | 22 | 2 | 0 |
| transformations-measurement | 18 | 15 | 3 | 0 |
| **Total** | **60** | **52** | **5** | **3** |

## REVISE list (one-phrase reasons)

1. **mult-04-04** (`Two-Step Problems`) — `mult3-which-op` (a generic ×-vs-÷ chooser) still does not
   depict the two-step multiply-then-subtract structure c1/c2 describe; visual preferred, not
   required (the evalOrder/buildExpression interactions already model the order dependency
   correctly).
2. **mult-05-01** (`Patterns in the Addition Table`) — the static `mult3-add-table` figure highlights
   the anti-diagonal (constant-sum cells) while c1's text and k1's whole check are about the main
   doubles diagonal (r = c) and its mirror-fold; figure shows the wrong diagonal for its own lesson.
3. **tm-04-02** (`Finding Missing Lengths`) — k1/i2/k2/k3/ch1/remedial are six instances of exactly
   two templates (solve for hypotenuse; solve for leg) with only the numbers changed, and c2
   (missing-leg) carries no figure or interactive after S291's fail-close of `tm-missing-leg`, unlike
   c1's hypotenuse case.
4. **tm-05-02** (`Volume of a Cone`) — k1/k3/ch1/remedial are four instances of one template (given
   r,h or cylinder volume, divide by 3); the withheld `tm-cone-volume` figure is materially offset by
   a `volumeBuilder` direct-manipulation lab and a `steppedReveal` proof walkthrough, so visual is
   SUFFICIENT, but question-job diversity is not.
5. **tm-05-03** (`Volume of a Sphere`) — k2's `explanationVariants[0]` still reads *"r³ = 3³... wait,
   r = 3 gives 27; for r = 3: V computed earlier is 36π. For radius 1: ..."* — unedited scratch-note
   text that digresses through an unrelated r = 3 computation before answering the actual r = 1
   question; the MCQ itself (options/answer/feedback) is correct.

No mathematical falsehood, missing-visual promise, MCQ option-length leak, or duplicate-question-job
defect was found in any of the 52 KEEP lessons; every KEEP lesson's numeric answers, `commonErrors`,
`commonBuilds`/`numericErrors`, predict/reveal claims, and cited figures were independently
recomputed/checked and confirmed correct at current source. The three ESCALATE lessons carry a
standing, upheld release-blocking ruling per the task's own instruction and were not re-litigated.

## Implementation contract per REVISE

### mult-04-04 — `content/courses/multiplication-division/lessons/mult-04-04.json`, steps `c1`, `c2`
- Current: both concepts cite `"figure": "mult3-which-op"`, a two-line "equal groups joined → ×" /
  "share or split apart → ÷" chooser with no notion of a two-step chain.
- Fix: bind a new or extended figure component (outside lesson-JSON scope — needs
  `src/components/figures.tsx` write access) that shows building an intermediate pile (e.g. 5 rows ×
  8 = 40) and then a subtraction acting on that pile (40 − 6 = 34), synchronized with c2's own
  worked language. Do not touch step ids, widgets, options, or feedback — only the `figure` binding
  and (if a new component is added) its registration.
- Scope: this lesson's `c1.figure`/`c2.figure` plus a new figure component; no other step content
  changes are needed (i1/k1/c2-body/k2/i2/k3/ch1/r1 are all correct as written).

### mult-05-01 — `content/courses/multiplication-division/lessons/mult-05-01.json`, steps `c1`, `c2`
- Current: `mult3-add-table` (`src/components/figures.tsx`, `Mult3AddTable`) highlights cells where
  `r + c === 3` (an anti-diagonal of constant sum), captioned "diagonals share a sum."
- Fix: either (a) rewrite `Mult3AddTable` to highlight the main diagonal `r === c` (the doubles) and
  its mirror-fold instead, matching c1's own text and k1's fold-reasoning check; or (b) bind a new
  figure id specific to this lesson so the shared `mult3-add-table` component (if reused elsewhere
  for the sum-diagonal idea) is not broken for other consumers. Confirm no other lesson currently
  relies on the anti-diagonal reading of `mult3-add-table` before editing the shared component.
- Scope: `src/components/figures.tsx` only (outside lesson-JSON scope); no lesson-JSON change is
  needed — c1/c2 text, i1/k1/c2/i2/k2/k3/ch1/r1 are all mathematically correct as written.

### tm-04-02 — `content/courses/transformations-measurement/lessons/tm-04-02.json`, steps `i2`, `k2`, `k3`, `ch1`, `remedials[0]`
- Current: i2/k2/k3/ch1/remedial are all `{type:"numeric"}` "apply c = √(a²+b²) or a = √(c²−b²)"
  items differing only in the three numbers used.
- Fix: replace at least one of k2/k3/ch1 with a distinct job — e.g. an error-diagnosis item ("A
  learner computed 5+12=17 for the hypotenuse; what's wrong?"), an estimation item (round-number
  legs, no perfect triple), or a coordinate-plane transfer (two points, find the distance). Preserve
  the two still-legitimate direct-application items and the remedial's simpler restatement. Also
  bind a figure or lightweight interactive to c2 (missing-leg) so it is not the only concept in the
  lesson with zero visual support — c1 keeps both `right-triangle` and the `distanceGrid` i1 lab.
- Scope: this lesson's steps only; c1/i1/k1 and the underlying Pythagorean-theorem math are all
  correct as written and need no change.

### tm-05-02 — `content/courses/transformations-measurement/lessons/tm-05-02.json`, steps `k1`, `k3`, `ch1`, `remedials[0]`
- Current: k1/k3/ch1/remedial are all "given r and h, find the cone volume as a multiple of π by
  dividing the cylinder volume by 3," differing only in numbers; only k2 ("given the cylinder volume
  directly") is a distinct entry point.
- Fix: replace one or two of k1/k3/ch1 with a distinct job — e.g. "given the cone's volume, find the
  matching cylinder's" (inverse of k2's direction), an estimation/comparison item ("which of these
  two cones holds more, without computing exactly"), or a real-world transfer using a non-round
  radius. Preserve the volumeBuilder (i1) and steppedReveal (i2) items, which already carry real
  visual/conceptual weight and do not need a new static figure.
- Scope: this lesson's numeric check steps only; c1/i1/c2/i2/k2 and all underlying math (V = ⅓πr²h,
  every recomputed answer) are correct as written and need no change.

### tm-05-03 — `content/courses/transformations-measurement/lessons/tm-05-03.json`, step `k2`
- Current `explanationVariants[0]`: `"r³ = 3³... wait, r = 3 gives 27; for r = 3: V computed earlier
  is 36π. For radius 1: 4⁄3 × 1 = 4⁄3, so V = 4⁄3 π."`
- Fix: replace with a direct r = 1 derivation, e.g. `"r³ = 1³ = 1, so V = 4⁄3 π × 1 = 4⁄3 π."` —
  drop the unrelated r = 3 tangent and the visible self-correction ("... wait"). Preserve
  `explanationVariants[1]` (already clean: "Cube 1 (=1), times 4⁄3: 4⁄3 π."), and every option id,
  `correct` flag, and `feedback` string — the MCQ itself is already correct and does not need to
  change.
- Scope: this one `explanationVariants[0]` string only; c1/i1/c2/k1/i2/k3/ch1/r1/remedial are all
  correct as written.

## Raw data

- Review basis hashes for all 60 lessons obtained via
  `node scripts/session/print-review-basis.mjs <ids>` (60/60 resolved, 0 unknown).
- Staged dispositions, hashes, and evidence refs are recorded per-lesson in
  `reports/closure/cowork-staging/laneB-s321-F9-dispositions.jsonl` (60 NDJSON records, `recordId` =
  `S321-F9-<lessonId>`, `reviewer` = "Claude Cowork independent assessor (S321)").
- Hash-match cross-reference: `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (2,273 lines) plus
  every `reports/closure/cowork-staging/*.jsonl` file were scanned for `lessonId` + matching
  `reviewedBasisHash`/`reviewBasisHash`; 39/60 lessons matched a prior signed record exactly, 21/60
  matched none (fresh source since the last recorded review).
- Figure verification: `mult3-double`, `mult3-break-apart`, `mult3-nines`, `mult3-times-ten-*`,
  `mult3-square-array`, `mult3-next-square-growth`, `mult3-mult-table`, `mult3-fact-family`,
  `mult3-add-table`, `mult3-hundred-chart`, `mult3-even-odd`, `mult3-which-op` were each read directly
  in `src/components/figures.tsx` and checked against the citing lesson's own concept text.
  `mult3-mult-table`'s S305 repair was independently confirmed: it now highlights `r===2 && c===2`
  → `(r+2)*(c+2) = 4×4 = 16`, with title/aria-label both reading "4 × 4 = 16," internally
  self-consistent wherever it is reused (mf3-02-05, mf3-03-02, mult-05-02).
- S291's fail-closes were independently confirmed still in effect at current source (no `figure` key
  present): `tm-03-03/c1` (angle-types), `tm-04-02/c2` (missing-leg), `tm-05-02/c2` (cone-volume),
  `tm-05-03/c2` (sphere-volume).
- mf3-03-01/03/06: confirmed current review-basis hash is byte-identical to the S248 signed ESCALATE
  record (`reviewedBasisHash` `a81f433e09…`, `43fbaede27…`, `97f855e38b…` respectively); no
  independent re-verification under the S305-repaired figure has since been signed for these three,
  so the ESCALATE stands per the task's instruction.
