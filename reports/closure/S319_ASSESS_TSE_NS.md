# S319 — Independent Assessment: `two-step-equations` and `number-system`

Independent Cowork assessment of both complete courses, `content/courses/two-step-equations`
(Grade 7, 17 lessons) and `content/courses/number-system` (Grade 6, 16 lessons). Every lesson
JSON and both `course.json` files were read in full. Every equation solution, inequality
direction/flip, fraction-division shortcut, decimal add/subtract/multiply/divide, GCF/LCM,
integer comparison, and absolute-value claim was recomputed by hand against the prompt/model/
widget/feedback/explanation/reveal text. Read-only on all content; the only writes are this
report and the disposition NDJSON at
`reports/closure/cowork-staging/laneB-s319-tse-ns-dispositions.jsonl`.

This report was produced starting from the `MT-V4-WORKER-PREFIX-1` block in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache is evidence only, nothing here
approves its own work, and this packet does not touch the ledger. Known context honored:
mcq/predict seeded-shuffle at render; lab-choice widgets shuffle-fixed in S316; the prior
sampling-and-probability/number-system repair wave (S282) — its withheld illustration bindings
(`ns-01-02/c2`, `ns-01-03/c1`, `ns-01-03/c2`, `ns-02-03/c2`, `ns-05-03/c2`) and its five other
concept-figure repairs were verified present and were **not** re-flagged as missing visuals.
Two `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv` and two `MCQ_DISTRACTOR_AUDIT.csv` rows for this course
pair were checked against live source and found stale (pre-S282 or pre-shortening); they are
noted below and not re-flagged. Two `MCQ_DISTRACTOR_AUDIT.csv` REMEDIATE rows were confirmed
**live** (byte-identical to current source) and are carried into this assessment as REVISE.

## Result counts

- `two-step-equations`: 17 lessons reviewed — **17 KEEP**, 0 REVISE, 0 ESCALATE.
- `number-system`: 16 lessons reviewed — **13 KEEP, 2 REVISE, 1 ESCALATE**.
- Combined: 33/33 lessons signed, **30 KEEP / 2 REVISE / 1 ESCALATE**.

No incorrect equation solution, incorrect inequality flip, incorrect fraction/decimal
computation, incorrect GCF/LCM, or incorrect integer/absolute-value comparison was found
anywhere in either course — both courses' mathematics is exact end-to-end. The three
non-KEEP findings are: (1) a `value`/`feedback` mismatch in a remedial numeric widget, (2) two
separate MCQ correct-option label-length leaks, and (3) one visual-fidelity gap where a
widget's prompt promises an on-screen second number-line track that the widget cannot
currently render (a pre-existing, still-open item in `KNOWN_ISSUES.md`, escalated rather than
silently patched because its fix is a genuine judgment call between a content-only reword and
a new engine capability).

## REVISE / ESCALATE list

| Lesson | Decision | One-phrase reason |
|---|---|---|
| `ns-01-01` | REVISE | Remedial `rem-fdm-k` commonErrors value `0` has feedback text describing a `0.5` mistake; k2 mcq correct option is a 67-char label vs. 45-char longest distractor (label-length leak, confirmed live). |
| `ns-05-01` | REVISE | k2 mcq correct option is a 57-char label vs. 42-char longest distractor (label-length leak, confirmed live). |
| `ns-03-02` | ESCALATE | i1's `numberLineHop` prompt/feedback promise a visible "5-hopper" second track that the widget schema cannot render — a documented, still-open engine gap (`KNOWN_ISSUES.md` S119), not a content-only fix. |

## Implementation contracts (REVISE / ESCALATE only)

### `ns-01-01` — "How Many Fit?"

- **Defect 1 (value/feedback mismatch)**: `remedials[0].check.widget.commonErrors[0]` is
  `{"value": 0, "feedback": "0.5 multiplies 2 by 1/4 instead of counting how many quarters
  FIT. Each whole is 4 quarters: 2 × 4 = 8."}`. The feedback text is written for the answer
  `0.5` (2 × 1/4 = 0.5, the "multiply instead of count" slip), not for `0`. As authored, a
  learner who types `0` receives a nonsensical explanation ("0.5 multiplies..." does not
  describe 0), and a learner who makes the real `0.5` mistake never sees this targeted
  message — they fall through to the generic `fallbackFeedback`.
  - **Fix**: change `"value": 0` to `"value": 0.5` in that `commonErrors` entry. No other
    field needs to change; the feedback text is already correct for `0.5`.
  - **Scope**: exactly one field, `remedials[0].check.widget.commonErrors[0].value`, in
    `content/courses/number-system/lessons/ns-01-01.json`.
- **Defect 2 (label-length leak)**: `steps[].id == "k2"` mcq, prompt "Without computing
  exactly, is 5 ÷ 1/3 bigger or smaller than 5?". Correct option `a` = "Bigger — dividing by
  a fraction under 1 always increases the number" (67 chars); distractors are 42 and 45
  chars. Confirmed live against `MCQ_DISTRACTOR_AUDIT.csv` row
  `number-system,6,ns-01-01,k2,...,FAIL,...,REMEDIATE` (67 vs 45, matches current source
  byte-for-byte — this row is not stale).
  - **Fix**: rebalance label lengths so the correct option is not the outlier — either trim
    option `a`'s rationale clause closer to the ~42–45 char band (e.g. drop "always" and
    shorten to something like "Bigger — a fraction under 1 grows the answer"), or extend
    options `b`/`c` with a comparable clause of similar length. Preserve every option's
    existing `feedback` text and the `correct: true` flag; only the visible `label` strings
    need rebalancing.
  - **Scope**: `steps[].id == "k2"`, `widget.options[*].label` only.

### `ns-05-01` — "Absolute Value"

- **Defect (label-length leak)**: `steps[].id == "k2"` mcq, prompt "Which is true about
  |-12| and |12|?". Correct option `a` = "Both equal 12 — opposites are the same distance
  from zero" (57 chars); distractors are 25 and 42 chars. Confirmed live against
  `MCQ_DISTRACTOR_AUDIT.csv` row `number-system,6,ns-05-01,k2,...,FAIL,...,REMEDIATE` (57 vs
  42, matches current source byte-for-byte).
  - **Fix**: same rebalancing approach as `ns-01-01/k2` — shorten option `a`'s rationale
    clause (e.g. "Both equal 12 — same distance, opposite sides") or lengthen option `b`
    ("|-12| = -12 and |12| = 12", 25 chars) with a short clause explaining the sign
    misconception, bringing all three labels into a comparable range. Preserve every
    option's existing `feedback` text and the `correct: true` flag.
  - **Scope**: `steps[].id == "k2"`, `widget.options[*].label` only, in
    `content/courses/number-system/lessons/ns-05-01.json`.

### `ns-03-02` — "Least Common Multiple" (ESCALATE, not silently patched)

- **Defect**: `steps[].id == "i1"`, a `numberLineHop` widget. Prompt: "Hop by 3 from 0. Stop
  at the first place a 5-hopper would also land." The widget's authored fields are
  `hop: 3, hops: 5` (a single track only — no second hop-size, ghost-track, or `denom`
  field exists in this widget instance), yet the prompt explicitly promises a second,
  distinct hopper is visible/comparable on the same line, and three feedback strings narrate
  that second track in prose only (`commonLandings` for `12`: "12 is a landing for the
  3-hopper, but the 5-hopper skips it: 5 goes 5, 10, 15"; for `10`: the reverse). The
  5-hopper's landings never appear on screen — the visual promise in the prompt is not what
  renders.
  - This is not a new finding: `KNOWN_ISSUES.md`, section "S119 — ns-03-02 fidelity item
    (not a tier issue)", already documents it verbatim ("the widget draws only ONE track...
    and nowhere on screen") and explicitly defers the fix to a shared two-track
    `numberLineHop` mode ("worth building for those two together" — the other lesson named
    is `ns-01-02`, whose own two-fraction comparison has the same unbuilt need).
  - **Why ESCALATE and not REVISE**: two remediation paths exist at very different scope,
    and choosing between them is the kind of judgment call the worker prefix reserves for
    root/human authority rather than a content packet:
    - (a) **Content-only**: reword the prompt and the three feedback strings so they no
      longer imply an on-screen second track — e.g. "Hop by 3 from 0. Using what you know
      about multiples of 5, stop at the first landing that is also a multiple of 5." This
      is achievable inside a content packet's normal authority (prompt/feedback text only,
      no widget schema change), but it teaches the concept more abstractly than the
      original visual intent.
    - (b) **Engine capability**: build the ghost-second-track `numberLineHop` mode
      `KNOWN_ISSUES.md` already scoped, and use it in both `ns-01-02` and `ns-03-02`. This
      fully honors the original visual promise but is new engine work outside a content
      packet's ownership.
  - **Scope if (a) is chosen**: `steps[].id == "i1"`, `widget.prompt` and the two
    `commonLandings[*].feedback` strings that reference the 5-hopper, in
    `content/courses/number-system/lessons/ns-03-02.json`. **Scope if (b) is chosen**: a
    `numberLineHop` engine change (outside `content/`) plus updating this lesson (and
    `ns-01-02`) to use the new mode.
  - All of `ns-03-02`'s arithmetic (LCM(4,6)=12, LCM(3,5)=15, LCM(6,8)=24, LCM(5,10)=10,
    LCM(4,10)=20, LCM(8,12)=24, LCM(2,3)=6, plus the blinking-lights and bus-schedule
    contexts) is correct, and `gradeLanguageDecision` is FIT — only the visual promise at
    `i1` is in question.

## Notes on stale evidence not re-flagged

- `MCQ_DISTRACTOR_AUDIT.csv` rows for `ns-03-03/k2` (correct option quoted as 75 chars) and
  `ns-04-03/k3` (correct option quoted as 25 chars, "None — it's on the y-axis") do **not**
  match current source. Current source reads `ns-03-03/k2` correct = "Expansion gives 36, not
  30" (26 chars, well-balanced against 31/32-char distractors) and `ns-04-03/k3` correct =
  "No quadrant: y-axis" (20 chars, well-balanced against 24/24-char distractors). Both have
  already been shortened/rebalanced since the CSV was generated; treated as stale, not
  re-flagged.
- `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv` lists 12 `SUPPRESS_KNOWN_MISMATCH` rows touching this
  course pair. Five (`ns-01-02` steps.0/steps.3, `ns-01-03` steps.0/steps.3, and others)
  reference figure bindings that no longer exist in current source at all (removed by the
  S282 withhold, confirmed via direct field inspection — e.g. `ns-01-02` step `c2` has no
  `figure` key). The remainder (`ns-02-02/dop-pad-borrow`, `ns-05-02/ns-abs-compare`,
  `ns-05-03/negative-number-line`, `tse-01-02/tse-combine-like`, `tse-01b-02/pr7-percent-
  multiplier`) are pre-triaged `SUPPRESS` (not `FAIL`) rows; direct reading of each cited
  concept step's own body text confirms it is internally mathematically self-consistent
  (e.g. `ns-02-02/c2`'s body already reads "5.00 − 1.75 = 3.25", matching what the CSV
  records as the figure's own baked-in numbers). None were re-flagged.
- `KNOWN_ISSUES.md` S114 ("`tse-04-03` not converted — large-magnitude pans") describes an
  old `solveBalance` tile-count ceiling for `5x + 20 ≥ 50`. Current source works around it
  cleanly: `i1` presents the pre-simplified `5x ≥ 30` on a `numberLineRay` widget rather than
  requiring 50 unit tiles on a `solveBalance` pan. Verified correct and not re-flagged.

## Per-lesson verdict lines

### two-step-equations (Grade 7)

- `tse-01-01` — KEEP / REQUIRED / FIT — every distribution (−3(x+2), 2(x−5), −2(x−6),
  4(x−3), 2(2−5), −5(x−2)) recomputed correct; algebraTiles target matches.
- `tse-01-02` — KEEP / REQUIRED / FIT — every combine (−3x+5x, 2x−7x, 4n+3+2n, 2(x+3)+4x,
  −3x−5x, −2(x+4)+3x, −3(x−2)+5x) recomputed correct; c2's withheld figure is intentional.
- `tse-01-03` — KEEP / REQUIRED / FIT — every mixed distribute/combine recomputed correct;
  distinct pure-distribute/pure-combine/mixed jobs, no cross-lesson duplication.
- `tse-01b-01` — KEEP / REQUIRED / FIT — every GCF/factoring claim (GCF 4, 5, 6, 2, 3, 3)
  recomputed correct; 7.EE.A.1 tag matches.
- `tse-01b-02` — KEEP / REQUIRED / FIT — every percent-multiplier claim (1.05×, 1.08a,
  1.12p, 0.80×, 0.85b, 1.10²=1.21) recomputed correct.
- `tse-01b-03` — KEEP / REQUIRED / FIT — 8n+8 at n=3, 5(t+3) at t=4, 2(3x+5), impostor
  4x+3 vs 4(x+3), 99(k+1) at k=1 all recomputed correct.
- `tse-02-01` — KEEP / REQUIRED / FIT — all 7 two-step equations recomputed correct;
  inversePipeline round-trips its sample input exactly.
- `tse-02-02` — KEEP / REQUIRED / FIT — all 7 negative-coefficient equations recomputed
  correct; same/different-sign quotient feedback matches every case.
- `tse-02-03` — KEEP / REQUIRED / FIT — all 7 real-world equations recomputed correct;
  contexts (fare, temperature, savings, dive) are grade-appropriate and distinct.
- `tse-02-04` — KEEP / REQUIRED / FIT — all 6 solveBalance equations recomputed correct;
  fair-move invariant framing is distinct from tse-02-01/02-05.
- `tse-02-05` — KEEP / REQUIRED / FIT — all 6 inversePipeline round-trips (incl. the
  3-step challenge) recomputed correct.
- `tse-03-01` — KEEP / REQUIRED / FIT — all 7 parenthesized equations recomputed correct.
- `tse-03-02` — KEEP / REQUIRED / FIT — all 7 negative-multiplier parenthesized equations
  recomputed correct.
- `tse-03-03` — KEEP / REQUIRED / FIT — all 7 mixed-sign parenthesized equations
  recomputed correct; synthesizes prior two lessons without repeating their problems.
- `tse-04-01` — KEEP / REQUIRED / FIT — all 7 positive-coefficient inequalities recomputed
  correct; numberLineRay round-trips the div/mul-by-3 transform exactly.
- `tse-04-02` — KEEP / REQUIRED / FIT — all 7 negative-coefficient (flip) inequalities
  recomputed correct; numberLineRay round-trips the flip transform exactly.
- `tse-04-03` — KEEP / REQUIRED / FIT — all 7 real-world inequalities recomputed correct;
  sidesteps the KNOWN_ISSUES S114 large-magnitude-pan limitation via pre-simplified prompt.

### number-system (Grade 6)

- `ns-01-01` — **REVISE** / REQUIRED / FIT — see contract above (value/feedback mismatch +
  label-length leak). All division-as-"how many fit" arithmetic otherwise correct.
- `ns-01-02` — KEEP / SUFFICIENT / FIT — every flip-and-multiply computation recomputed
  correct; c2's withheld figure (S282) is intentional, lab widget carries the concrete rep.
- `ns-01-03` — KEEP / SUFFICIENT / FIT — every mixed-number division recomputed correct;
  c1/c2's withheld figures (S282) are intentional.
- `ns-02-01` — KEEP / REQUIRED / FIT — every multi-digit division/remainder recomputed
  correct, incl. the invalid-remainder audit (50÷6 corrected to 8 r2).
- `ns-02-02` — KEEP / REQUIRED / FIT — every decimal add/subtract recomputed correct,
  incl. columnCalc's 8.60+0.75=9.35.
- `ns-02-03` — KEEP / REQUIRED / FIT — every decimal multiply/divide recomputed correct,
  incl. probabilityArea's 0.6×0.7=0.42 grid match; c2's withheld figure (S282) is intentional.
- `ns-03-01` — KEEP / REQUIRED / FIT — every GCF (incl. numberLineHop stride-search and
  three-number GCF) recomputed correct.
- `ns-03-02` — **ESCALATE** / ESCALATE / FIT — see contract above (documented visual
  fidelity gap, KNOWN_ISSUES S119). All LCM arithmetic correct.
- `ns-03-03` — KEEP / REQUIRED / FIT — every GCF-out-of-a-sum claim recomputed correct,
  incl. areaModel's requireFactors greatest-factor enforcement.
- `ns-04-01` — KEEP / REQUIRED / FIT — negatives, opposites, and the −4+9=5 rise-in-
  temperature context all recomputed correct.
- `ns-04-02` — KEEP / REQUIRED / FIT — every negative comparison and 4-value ordering
  recomputed correct.
- `ns-04-03` — KEEP / REQUIRED / FIT — every quadrant/plotting claim recomputed correct;
  plotPoint 1-indexed grid mapping verified consistent across all pointErrors.
- `ns-04b-01` — KEEP / REQUIRED / FIT — every sign/reflection claim recomputed correct;
  plotPoint grid mapping verified consistent.
- `ns-05-01` — **REVISE** / REQUIRED / FIT — see contract above (label-length leak). All
  |x| arithmetic otherwise correct.
- `ns-05-02` — KEEP / REQUIRED / FIT — every distance-vs-order comparison (debt, depth,
  temperature) recomputed correct.
- `ns-05-03` — KEEP / REQUIRED / FIT — every mixed-form rational ordering recomputed
  correct; c2's withheld figure (S282) is intentional.

## Return contract

`packet_id=S319-D-tse-ns-assessment, base_commit=<unresolved, no git repo present at
/home/user/maggies-trail>, contract_hash=<n/a — no packet contract file supplied for this
task>, role=independent-assessor, model=claude-sonnet-5, effort=high, speed=n/a,
scope_ids=[tse-01-01..tse-04-03 (17), ns-01-01..ns-05-03 (16)] (33 lessons), status=complete,
changed_file_hashes=<none — read-only on content; report + disposition NDJSON are new files,
not content changes>, evidence_refs=[content/courses/two-step-equations/**,
content/courses/number-system/**, reports/closure/S282_NUMBER_SYSTEM_SOURCE_IMPLEMENTATION.md,
KNOWN_ISSUES.md, MCQ_DISTRACTOR_AUDIT.csv, FIGURE_TEXT_ADVERSARIAL_AUDIT.csv,
FIGURE_TEXT_ALIGNMENT_AUDIT.csv], gates_passed=[math-recomputation(33/33),
answer-leak-check(mcq single-correct-option integrity, 45/45 mcq widgets),
cross-lesson-duplication-scan(0 accidental duplicates; only intentional remedial
same-prompt-as-parent pairs)], gates_failed=[value-feedback-consistency(1/33: ns-01-01
remedial), label-length-parity(2/33: ns-01-01 k2, ns-05-01 k2), visual-promise-fidelity(1/33:
ns-03-02 i1)], cache_invalidations=[MCQ_DISTRACTOR_AUDIT.csv rows for ns-03-03/k2 and
ns-04-03/k3 are stale — current source already shortened those labels;
FIGURE_TEXT_ADVERSARIAL_AUDIT.csv rows for ns-01-02/ns-01-03 steps referencing removed figure
bindings are stale — S282 already deleted those figure keys], new_decision_required=[ns-03-02:
root/human call on content-only reword vs. new two-track numberLineHop engine capability],
risks=[ns-03-02's engine-capability fix path also serves ns-01-02, which has the same unbuilt
two-track need per KNOWN_ISSUES S119 — worth scoping together if that path is chosen],
next_owner=implementation-lane (two mechanical content edits for ns-01-01/ns-05-01; a root
decision + scoped fix for ns-03-02).`
