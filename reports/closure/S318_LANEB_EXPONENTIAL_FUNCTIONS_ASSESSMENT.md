# S318 Lane B — Independent Assessment: exponential-functions

Course: `content/courses/exponential-functions/course.json` (id `exponential-functions`, title
"Algebra 1: Exponential Functions", `gradeLevel: 9`). 4 chapters, 12 lessons. All 12 lessons
read in full and every step's mathematics recomputed by hand.

**Note on packet framing:** the packet prompt labeled this "the algebra-2 course," but
`course.json`'s own title and `gradeLevel: 9` identify it as Algebra 1. This is a label
mismatch in the task framing, not a source-hash or content defect — the course/lesson set
itself is unambiguous (there is only one `exponential-functions` course), so the assessment
proceeded against the actual source. Flagging per the "treat mismatched source/labels as
stale, don't silently reinterpret" instruction, for whoever owns packet-prompt authoring.

## Result summary

- **12 / 12 lessons: KEEP**
- **12 / 12 visualDecision: SUFFICIENT**
- **12 / 12 gradeLanguageDecision: FIT**
- **0 REVISE, 0 ESCALATE**

No lesson required a REVISE disposition. No implementation contracts follow because there is
nothing to fix.

## Per-lesson verdicts

| Lesson | Title | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|---|
| exp-01-01 | Evaluating Exponential Functions | KEEP | SUFFICIENT | FIT | All a·bˣ evaluations recomputed correct (45, 32, 48, 54, initial values). |
| exp-01-02 | Growth vs Decay | KEEP | SUFFICIENT | FIT | b>1/b<1 classification correct; b=1 hinge framed correctly, no sign-of-exponent conflation. |
| exp-01-03 | The Constant Ratio | KEEP | SUFFICIENT | FIT | Ratio extraction (÷) vs extension (×) correct; additive-confusion distractors correctly wrong. |
| exp-02-01 | Growth Models | KEEP | SUFFICIENT | FIT | Story-model evaluations (P, A, N) all correct; distinct job from exp-01-01. |
| exp-02-02 | Decay Models | KEEP | SUFFICIENT | FIT | Story-model decay evaluations all correct; "approaches but never reaches 0" stated correctly. |
| exp-02-03 | Percent Growth & Decay | KEEP | SUFFICIENT | FIT | Every rate→factor conversion correct (1+r, 1−r); no rate/factor conflation graded as right anywhere. Both previously-withheld figures (c2, c3) confirmed present and aligned per parallel S318 packet. |
| exp-03-01 | Solving by Matching Bases | KEEP | SUFFICIENT | FIT | bˣ=k solves correct, including the fractional-exponent extension (4ˣ=8 → x=3/2). |
| exp-03-02 | Equations with a Coefficient | KEEP | SUFFICIENT | FIT | Every "divide out coefficient, then match bases" solve correct. |
| exp-03-03 | Decay & Negative Exponents | KEEP | SUFFICIENT | FIT | Sign-of-exponent logic correct in all 7 solves, including decay-base-reaching-above-1 cases. |
| exp-04-01 | Reading Exponential Graphs | KEEP | SUFFICIENT | FIT | y-intercept = a and direction = sign(b−1) read correctly in every item. |
| exp-04-02 | Comparing Growth | KEEP | SUFFICIENT | FIT | "Bigger base wins long-run, not bigger start" graded correctly in both directions (higher-start loser, lower-start winner). |
| exp-04-03 | Exponential vs Linear | KEEP | SUFFICIENT | FIT | Difference-vs-ratio test applied correctly across every table; overtaking claim correct. |

## Verification method

1. **Mathematics.** Every `numeric`, `exactNumberLab`, and `mcq` widget's target answer,
   `commonErrors`/`numericErrors` values, and feedback text were recomputed independently
   (not just pattern-matched). Specifically targeted per the packet brief:
   - Every `a·bˣ` evaluation (chapters 1–2, 4): all correct.
   - Every growth/decay **factor** identification: `b > 1` growth, `0 < b < 1` decay — correct
     throughout, including the c1/i1 predict-and-reveal in exp-01-02 that frames `b = 1` as the
     hinge (not a sign change in the exponent — the false "sign" option in the CML explanation
     is correctly marked incorrect).
   - Every **percent-rate → factor** conversion in exp-02-03: `+50% → 3/2`, `−25% → 3/4`,
     `+100% → 2`. Distractor sets in every percent item include the raw rate as a wrong answer
     (e.g., `1/4` and `25` offered against the correct `3/4`; `1` and `100` offered against the
     correct `2`), so the rate-vs-factor conflation this packet asked me to hunt for is never
     graded as correct anywhere in the course.
   - Every **doubling/halving** claim (16→8→4→2, 640→320→160→80, 24000→…→3000, etc.): correct.
   - **Compound interest**: this course does not contain a compound-interest lesson or widget
     (no `P(1+r/n)^{nt}` construction anywhere in the 12 lessons) — nothing to recompute there.
   - Negative-exponent sign logic (exp-03-03): correct in all 7 solve items, including the two
     "decay base reaching an above-1 target needs negative x" cases that are the easiest place
     for a sign error to hide.

2. **Figures.** Every `figure` field was checked against `src/components/figureIds.ts`
   (registered) and `src/components/figures.tsx` (renderer source read directly for all 24
   distinct figure IDs used in this course, including the two whose function names don't match
   their ID pattern — `exp-p0-200` → `ExpP0()`, `exp-v0-8000` → `ExpV0()`). All renderers carry
   an accessible `<title>` whose text matches the lesson prose's claim, and numeric labels are
   rendered as text (not colour-only). `exp-02-03`'s two previously-withheld figure placements
   (`c2: exp-grow-50`, `c3: exp-decay-50`) are both present in the current file and match the
   contract locked by `scripts/session/s279-exponential-functions-course-repair.mjs` and
   `src/lib/session279.exponentialFunctionsCourse.test.ts` — assessed as already aligned per
   the packet's guidance not to re-flag a resolved parallel-packet item.

3. **Distinct instructional job.** Confirmed no cross-lesson duplication: each of the 12
   lessons targets a different `conceptTag` family (evaluate → growth/decay classification →
   constant ratio → growth model → decay model → percent-to-factor → match-base solve →
   coefficient-isolation solve → negative-exponent solve → graph reading → long-run comparison
   → exponential-vs-linear classification). Within-lesson `k1`/`k2`/`k3`/`ch1` repeats are
   scaffolded practice of the same concept beat at increasing difficulty (standard Maggie's
   Trail lesson shape: concept → interactive → check, repeated 2–3 times then a challenge),
   not duplicate jobs.

4. **Parity / answer leak.** MCQ label lengths were compared per question; no systematic
   correct-is-longest pattern found across the course's ~20 MCQ items. One isolated case (the
   `exp-01-02` CML `explanation` sub-object, a `flagship`/`delayed` metadata field with a
   markedly longer correct option) was checked against the codebase and found to have **no
   rendering component** anywhere in `src/components` or `src/app` — it is schema-validated
   (`WidgetSpec`/CML schema in `src/lib/schema.ts`) but not currently surfaced to learners, so
   it carries no live answer-leak risk. Not flagged as a defect; noted here for the record in
   case that field is wired up to a UI later.

5. **Feedback quality.** Spot-checked every `numericErrors`/`commonErrors` entry across all 12
   lessons: each names the actual misconception with the actual drawn numbers (e.g., "That's
   f(3) = 2 · 8. One more step: 3^4 = 16"), never a bare "try again" or generic message.

6. **Grade language.** Vocabulary and phrasing (base, exponent, growth/decay factor, initial
   value, y-intercept, asymptote, constant ratio) are standard Algebra 1 register, consistent
   with `course.json`'s `gradeLevel: 9`. No oversimplification that would weaken the
   mathematics, no unexplained jargon.

## Basis hashes (via `scripts/session/print-review-basis.mjs`)

| lessonId | reviewBasisHash |
|---|---|
| exp-01-01 | 15889fc1e4fa4bbc676f5bccc97133d88206ad12ba7f6fa8c3a597a063b28365 |
| exp-01-02 | d193a0ca43b89bccd6025102432f0441f534712493f5cf967e50096998253a52 |
| exp-01-03 | 2376733f298682f7d6e8d879563d8a4b358bc58190a23965d1ea9ebf55f001ab |
| exp-02-01 | b919f0187c9c02dacb38a48c5e7c6e913ca12417e6004ca06346618418cbec4c |
| exp-02-02 | 34bd8a567bdd0117a9d35b84831791360a3592ac969317923b5084d6448a866b |
| exp-02-03 | 7385f90eb0bcdb885bb2d5b99ce7792a17b8a4656b032e2c69eeeb8bffd23f1f |
| exp-03-01 | 63feb82dd5115f8a66a2d39a1b4d4d34c8f0877b36747786212ccd21b9fb7a3f |
| exp-03-02 | 628fefb0ff624aa4b7e1ef694a8c2caffc94f81a72641cbddc28355fdacd59c1 |
| exp-03-03 | 71b85c8cbac9cd836edeba58d6b8dafd503b906a3652d6b4b276a0f532a1f7a5 |
| exp-04-01 | fe170121f6de5bab8316bb4ebc9dda127bd4e63dcb6d66c3e91e12c0cb643c42 |
| exp-04-02 | 98e262509d63004f21daa25c437a02d9b3f99d0a9588b721fd89c06fb0be1275 |
| exp-04-03 | 960056533ad99a748ce3e48939a6cc259e1530c72255ad007ab16cc39b530f68 |

Reviewed at: `2026-08-20T11:26:08.000Z`. Dispositions appended (not ledger-written) to
`reports/closure/cowork-staging/laneB-exponential-functions-dispositions.jsonl`, record IDs
`S318-EXP-exp-01-01` … `S318-EXP-exp-04-03`.

## Notable findings

- No mathematical errors found anywhere in the course — this is a clean lane.
- No rate/growth-factor conflation graded as correct anywhere (the specific failure mode this
  packet asked me to hunt for).
- No compound-interest content exists in this course to check.
- exp-02-03's two previously-withheld figure placements are confirmed resolved/aligned; not
  re-flagged, per the known-context instruction.
- One inert (unrendered) CML `explanation` sub-object in exp-01-02 has a length asymmetry
  between its two options; not user-facing today, so not a defect — noted for future crawlers
  if that field is ever wired to a UI.
- Packet-prompt/course-title mismatch ("algebra-2" vs. the course's actual "Algebra 1" /
  `gradeLevel: 9`) — a task-framing issue, not a content defect; flagged above for the record.
