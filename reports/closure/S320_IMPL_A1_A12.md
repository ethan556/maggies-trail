# S320 — Implementation of A1 + A12 REVISE contracts (Lane A)

Worker: bounded implementation worker per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`.
Authority: `reports/closure/S320_ASSESS_A1.md` (add-subtract-1000-g2, data-graphs-g1,
data-line-plots-g2) and `reports/closure/S320_ASSESS_A12.md` (lines-angles, shapes-measure-g1,
measure-length-g1). Every REVISE contract in both reports was implemented — 16 lessons total.
`shapes-measure-g1` had zero REVISE items and was not touched.

No `npm`/`vitest`/`tsc` was run. All verification below is parse-checks, hand-recomputed
arithmetic, and scripted scans run directly against the repository's own `evaluate.ts`/`pedagogy.ts`
semantics as documented in the two assessment reports.

## Per-lesson changes

### add-subtract-1000-g2

**g2b-01-01** — `ch1` duplicated `c1`'s worked example verbatim (`300 + 200 = ?` → 500 in both).
Replaced with a fresh, unused single-nonzero-digit-hundreds pair: `600 + 100 = ?` → **700**.
`commonErrors` kept the same two-misconception shape with recomputed values: `601` (hundred
misread as a one: 600+1) and `500` (subtract instead of add: 600−100). `successFeedback` → "Correct
— 700." None of 700/601/500 collide with each other or with any number already used elsewhere in
this lesson (c1=500, i1=500, k1=600, k2=600).

**g2b-03-03** — `k3`'s `commonErrors[0].value` was `517`, claimed to represent the
subtract-instead-of-add misconception for "175 + 332 = ?" (answer 507), but the true difference
|332−175| = **157**, not 517 — false feedback. Changed the value to `157`; feedback text left
unchanged (it was already an accurate description once the value is correct). 157 doesn't collide
with the answer (507) or the other commonError (497). Cross-checked against sibling lesson
g2b-03-04, whose analogous commonError already correctly equals the true difference.

### data-graphs-g1

**dgr1-01-03** — `k1.hints[2]` read "1 groups." (should be singular). Changed to "1 group.",
matching sibling `k3` which correctly renders "2 groups." for a value of 2.

**dgr1-01-04** — `k1`'s check ("2 crossed five-groups and 2 single marks" = 12) duplicated the
exact same fact tested in `i1`'s predict and `i1`'s graphRead target (three times in one lesson).
Rewrote `k1` to "1 crossed five-group and 2 single marks" → **7**, unused elsewhere in this lesson
(i1=12, i2=9, k2=8, k3=16, ch1=14). `commonErrors` recomputed: `3` (group misread as a single mark:
1×1+2) and `5` (singles skipped: 1×5). `explanationVariants` and `hints[2]` ("5 and 2 more: 7.")
updated to match.

**dgr1-02-03** — `k2`'s mcq ("Votes: Cats 6, Dogs 3, Fish 5. Which got the MOST votes?") was
byte-identical to dgr1-02-01's `k1` — a genuine cross-lesson duplicate check (distinct from this
lesson's own legitimate reuse of the same data to *build* a bar graph in `i1`). Replaced the
dataset with a fresh triple not used elsewhere in the course as a graded check: **Red 5, Blue 8,
Green 3** (correct: Blue, 8 votes). Correct option placed first (o0); all option feedback,
`explanationVariants`, and `hints` rewritten to match.

**dgr1-03-03** — `i1` (build+predict), `k1` (MOST check), `k2` (FEWEST check), and the lesson's
conceptTag-level remedial all shared the exact dataset "Red 7, Blue 4, Green 2" — which is itself
byte-identical to dgr1-02-01's `ch1`. Replaced the dataset across all four locations with a fresh
triple unused elsewhere in the course: **Yellow 9, Orange 6, Purple 3** (MOST = Yellow, FEWEST =
Purple). Updated `i1`'s barBuilder target/categories/maxVal (headroom preserved: 11), predict
prompt/options/reveal, `k1`'s MOST mcq, `k2`'s FEWEST mcq, and the shared remedial's MOST mcq — all
consistently, correct option first in each.

### data-line-plots-g2

**g2g-01-02** — `k1` and `k3`'s hints were leftover ruler-measurement scaffolding ("One shared unit
for all." / "Mark to mark is the length." / "Record as you go.") on steps that are multiset/
record-matching mcqs with no ruler or marks involved. Replaced both with record-appropriate
scaffolding: `["Every original result must still appear.", "Compare counts of each number, not
just which numbers appear.", "A changed or missing repeat means lost data."]`, exactly as specified
in the contract. `k2`/`ch1` (genuine mark-to-mark ruler subtraction) left untouched.

**g2g-01-03** — `k3`'s hints were the same leftover ruler triple, inconsistent with this lesson's
own correctly-tailored `k1`/`k2`/`ch1` hints. Replaced with `["One x per measurement.", "Stacks
sit on their value.", "Height is frequency."]` to match its siblings.

**g2g-02-04** — `ch1`'s pair ("Wednesday has 5 votes and Thursday has 9 votes...?" → 4) duplicated
g2g-02-02's `ch1` ("Tuesday 5 / Wednesday 9...?" → 4) verbatim except for day labels. Replaced with
"Wednesday has 4 votes and Thursday has 10 votes...?" → **6**, a difference (6) not already used
course-wide for this challenge type. `commonErrors[1]` value updated 9→10 (Thursday's new whole
count); feedback text unchanged; `successFeedback` → "Correct — 6."

**g2g-03-03** (capstone) — 3 of 4 graded items were cross-lesson duplicates:
- `k1` (ribbon-lengths "which display fits" mcq) was byte-identical to g2g-02-03's `k3`. Rescoped
  to pencil lengths (new object, not ribbons-in-cm) — same option/feedback structure, new nouns.
- `k2` (four-trip-choices "which display fits" mcq) was byte-identical to g2g-02-01's `k3`.
  Rescoped to "three favorite lunch choices" (new topic, updated "four choices" → "three choices"
  in the correct-option feedback).
- `ch1` ("Monday 5 / Tuesday 9...?" → 4) repeated the same pair already duplicated in g2g-02-04's
  pre-fix `ch1`. Replaced with "Friday has 3 votes and Saturday has 11 votes...?" → **8**, a
  difference not already used course-wide (avoided 4, 5, 2 per the contract).
`k3` (plotData [2,4,3,1] most-common-stack mcq) and `i1`/`i2` were independently verified fresh and
left unchanged, preserving the lesson's three assessed skills (choose-line-plot, choose-bar,
compare-subtraction).

### lines-angles

**la-02-03** — `k3`'s correct mcq option (67 chars) was 22 chars longer than the next-longest
distractor (45 chars) — a length leak. Rather than shorten the correct option (which risks losing
precision), lengthened all three distractors with truthful, comparable clauses: 40→74, 45→71,
39→63 chars. Correct option (67 chars), its feedback, the prompt, and the marked-correct answer are
all unchanged. Result: correct is no longer the unique longest (74 > 67); spread across all four
options is 63–74 (11 ≤ 15).

**la-03-01** — `k2`'s correct option (65 chars) was 25 chars longer than the next-longest
distractor (40 chars). Lengthened the three distractors with truthful clauses: 37→56, 29→61, 40→61
chars. Correct option, feedback, prompt, and marked-correct answer unchanged. Result: gap from
correct to next-longest narrowed from 25 to 4 chars; spread is 56–65 (9 ≤ 15).

### measure-length-g1

**g1m-01-03** — `i1`'s `lengthCompare` items still carried leftover `"top ribbon"`/`"bottom
ribbon"` labels while the prompt/feedback name a pole and a string. Renamed `items[0].label` →
`"pole"`, `items[1].label` → `"string"`. Also rewrote the dangling `successFeedback` fragment ("...
half of the chain that will settle the pole against the rod.") to a complete sentence: "The pole
beats the string — that's one of the two links that will settle pole against rod." `id`, `length`,
`startOffset`, `answerId` unchanged.

**g1m-01-04** — Same leftover-label bug: `i1`'s items renamed `"top ribbon"` → `"string"`,
`"bottom ribbon"` → `"rod"`, matching the prompt/feedback and sibling `i2`. Pure relabel; no
feedback text changed (it was already accurate).

**g1m-03-01** — `k1` + its paired remedial (`rem-g1m-cubes-k`) were byte-identical to g1m-02-01's
`k1` + remedial ("Exactly 9 same-size cubes cover a ribbon..."). Rewrote both to "Exactly **11**
same-size **blocks** cover a **scarf**..." — new object, new unit noun, new count (11; course had
already used 5,6,7,8,9). Distractors recomputed on the same off-by-one/off-by-one/double pattern:
12, 10, 22.

**g1m-03-03** — Two separate duplications in the same lesson, both under the shared
`conceptTag=g1m-unit-size` remedial:
- `k1` + the shared remedial were byte-identical to g1m-03-02's `k1` + its own remedial ("A stick
  measures 12 small cubes. Measured with units twice as long...?"). Rewrote both to "A **rope**
  measures **15** small **blocks**. Measured with units **three times** as long...?" — new object,
  unit noun, count, and multiplier (still truthfully yields "fewer").
- `k3` was byte-identical to g1m-02-01's `k3` ("Exactly 8 same-size cubes cover a ribbon...").
  Rewrote to "Exactly **10** same-size **blocks** cover a **belt**..." — new object, unit noun,
  count (10; unused elsewhere: 5,6,7,8,9,11,15 were taken). Distractors recomputed: 11, 9, 20.
`i1`/`i2` (unitRuler) and `k2`/`ch1` left untouched — independently verified correct and
non-duplicated.

## Arithmetic verification (recomputed by hand)

| Lesson.step | Expression | Result |
|---|---|---|
| g2b-01-01.ch1 | 600 + 100 | 700 |
| g2b-01-01.ch1 err1 | 600 + 1 | 601 |
| g2b-01-01.ch1 err2 | 600 − 100 | 500 |
| g2b-03-03.k3 err1 | 332 − 175 | 157 |
| dgr1-01-04.k1 | 1×5 + 2 | 7 |
| dgr1-01-04.k1 err1 | 1×1 + 2 | 3 |
| dgr1-01-04.k1 err2 | 1×5 | 5 |
| dgr1-02-03.k2 | max(5,8,3) | 8 |
| dgr1-03-03.k1 | max(9,6,3) | 9 |
| dgr1-03-03.k2 | min(9,6,3) | 3 |
| g2g-02-04.ch1 | 10 − 4 | 6 |
| g2g-02-04.ch1 err1 | 4 + 10 | 14 |
| g2g-03-03.ch1 | 11 − 3 | 8 |
| g2g-03-03.ch1 err1 | 3 + 11 | 14 |
| g1m-03-01.k1/rem | (11 blocks cover the object end to end) | 11 |
| g1m-03-03.k3 | (10 blocks cover the object end to end) | 10 |

All results confirmed against a Python recomputation (`checks` script, all `OK`).

## Scripted duplicate-prompt scan (post-fix, per affected course)

Scanned every `steps[]` and `remedials[].check` widget `prompt` for exact byte-identical text
within each of the five affected courses.

| Course | Duplicate-prompt groups found | Disposition |
|---|---|---|
| add-subtract-1000-g2 | 1 (`g2b-03-05` k1 vs its own remedial) | Pre-existing, by-design own-remedial pairing (not in scope; not a defect per A1/A12 methodology) |
| data-graphs-g1 | 12 total: 11 are own-lesson check-vs-own-remedial pairs (by design); 1 is a genuine cross-lesson duplicate: **"You are sorting by color. Where does a red apple belong?"** (dgr1-01-01/k2 ↔ dgr1-01-02/ch1) | Pre-existing, **not in the A1 REVISE list** for this course (dgr1-01-01 and dgr1-01-02 were both KEEP dispositions) — out of this packet's contracted scope; left untouched, flagged here for visibility |
| data-line-plots-g2 | 1: **"A bar reaches 4 on the bar graph, where each gridline is worth 1..."** (g2g-02-03/k1 ↔ g2g-03-01/k3) | Pre-existing, not in the A1 REVISE list for this course (both lessons were KEEP) — out of scope; left untouched, flagged here for visibility |
| lines-angles | 0 | — |
| measure-length-g1 | 0 | All four contracted cross-lesson duplicates (g1m-03-01/k1, g1m-03-03/k1, g1m-03-03/k3) resolved; zero duplicates remain in this course |

All duplicates explicitly named in the A1/A12 REVISE contracts (g2b-01-01/ch1↔c1, dgr1-02-03/k2↔
dgr1-02-01/k1, dgr1-03-03↔dgr1-02-01/ch1, g2g-02-04/ch1↔g2g-02-02/ch1, g2g-03-03/k1↔g2g-02-03/k3,
g2g-03-03/k2↔g2g-02-01/k3, g2g-03-03/ch1↔[g2g-02-04 pre-fix], g1m-03-01/k1↔g1m-02-01/k1,
g1m-03-03/k1↔g1m-03-02/k1, g1m-03-03/k3↔g1m-02-01/k3) are confirmed gone by this scan.

The two out-of-scope duplicates found were **not** in either assessment report's REVISE list (their
host lessons were disposed KEEP) and were left untouched per "do not broaden scope" / "work only on
the stable IDs... named in the packet."

## MCQ option-length-leak re-scan (lines-angles, post-fix)

Re-ran the ≥15-char-gap outlier scan across all three A12 courses. `la-02-03/k3` and `la-03-01/k2`
no longer appear as outliers (confirmed above: gaps now 0 and 4 respectively, both correct options
no longer unique-longest or within an acceptable margin). Remaining flagged items
(`la-01-03/k1`, `la-02-01/rem-pl-k`, `la-02-02/ch1`, `la-03-01/k3` — a different step from the one
fixed — `la-03-03/rem-qc-k`, `la-04-01/ch1`) are all pre-existing, not in the A12 REVISE list, and
in every case the correct option is either not the unique longest or (one case, `la-04-01/ch1`,
already noted in A12 as a borderline KEEP) sits exactly at the calibrated threshold — consistent
with the original assessment's disposition.

## MCQ structural checks (all 16 edited lessons)

- Every edited mcq has exactly one `correct: true` option.
- Every new/replaced mcq places the correct option at index 0 (`o0`) — correct-first, consistent
  with the instruction; pre-existing mcqs elsewhere in these courses use render-time seeded shuffle
  so authored order was never a grading or fairness concern per the A1/A12 methodology notes.

## Feedback-quality checks (all changed/added feedback strings)

Checked every newly written or value-changed feedback string (mcq option feedback, commonErrors
feedback, successFeedback) for: literal truth (hand-verified against the arithmetic table above),
≥25 characters, and no negation-opening ("No,", "Not ...", etc.). All newly authored strings pass
(lengths 51–90 chars, zero negation-openings). Pre-existing terse `"Correct — N."` success-feedback
strings (12–14 chars) are an established repo-wide convention untouched by this packet's edits (only
the numeric value inside them changed) — not a new violation.

## Parse-check

All 16 touched files parse cleanly with `python3 -m json.load` (post-edit). `sha256`s and
`reviewBasisHash`es (via `node scripts/session/print-review-basis.mjs`) recorded per-lesson in the
NDJSON deliverable.

## Constraints honored

- Read-only outside the 16 named lesson files. `course.json` files, `shapes-measure-g1` (0 REVISE
  items), and every KEEP-dispositioned lesson were not touched.
- IDs, `conceptTag`s, widget `type`s, and evaluator-relevant fields (`answer`, `answerId`, grading
  keys, `plotData`, `target`/`values`, `unitRuler` geometry) preserved except where the contract
  explicitly required a numeric/label change.
- No `npm`, `vitest`, or `tsc` run. Verification used `python3 json.load` parse-checks, hand
  arithmetic, Python duplicate/option-length/feedback scans, and the repo's own
  `scripts/session/print-review-basis.mjs` (read-only) for `reviewBasisHash` evidence.

## Deliverables

- This report: `reports/closure/S320_IMPL_A1_A12.md`
- NDJSON (16 records, one per lesson): `reports/closure/cowork-staging/laneA-s320-impl-1.jsonl`
