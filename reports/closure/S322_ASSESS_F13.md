# S322 Assessment F13 — rational-number-operations, exponential-functions, functions-and-sequences

Independent course assessor pass over three complete courses (36 lessons total: 12 + 12 + 12).
Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s322-F13-dispositions.jsonl`. Every disposition supersedes any
prior decision on these lesson IDs. A prior attempt at this exact packet was cut off before writing
either staging output — this run started fresh (confirmed no pre-existing
`laneB-s322-F13-dispositions.jsonl`) and re-derived every finding independently.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and obeyed: the repository source and this
session's own re-derivation are authoritative; the ChatGPT Work cache and any prior assessor's prose
(including S318/S320/S321 reports read below) are evidence only, not self-approving.

## Method

For all 36 lessons, `node scripts/session/print-review-basis.mjs <id>` was run to get the current
review-basis hash, then cross-referenced against every `reviewedBasisHash` in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` and every `reports/closure/cowork-staging/*.jsonl`
file (118 files scanned):

- **`exponential-functions` (12/12)**: every lesson's current hash is byte-identical to the S318-signed
  `KEEP`/`SUFFICIENT`/`FIT` disposition (`laneB-exponential-functions-dispositions.jsonl`, and for
  `exp-02-03` also `laneV-s318-g4hs-dispositions.jsonl`). No source drift since that review. Per the
  task's specific flag, `exp-02-03`'s manual figure hold (`c2`/`exp-grow-50`, `c3`/`exp-decay-50`) was
  independently re-verified at current state rather than trusted from the hash match alone — both
  figures were opened directly in `src/components/figures.tsx`, confirmed registered/bound, and their
  accessible `<title>` text hand-checked against `c2`/`c3`'s prose (base 1.5 from 16 → M(2)=36; base 0.5
  from 80 → D(3)=10). The S318 manual-hold retirement (blocklist key `67c19c25` → `4ee4868e`) is
  confirmed still in effect in `src/lib/figureTextMismatchBlocklist.manualHolds.ts`. The other 11 lessons
  were spot-verified: every numeric/`exactNumberLab`/`mcq` answer independently recomputed, all 27
  distinct figure IDs used in the course confirmed registered+bound+titled, and course-wide
  byte-identical and prompt-excluded structural duplicate scans run (see below).
- **`rational-number-operations` (12/12)**: no lesson's current hash matches any prior signed record —
  source moved under the S320 progression-dedup wave
  (`reports/closure/S320_PROGRESSION_DEDUP.md`, read in full per the task's instruction). All 12 lessons
  were read in full at current state (every step, widget, `commonErrors`, remedial, and cited figure),
  and every numeric/`signedFractionLab`/`exactNumberLab` answer was independently hand-recomputed against
  the actual `operation`/`left`/`right`/`values` fields, not just the prose. `rno-04-02`'s S320 fix (the
  reworded `k2`, closing the S318 `NOT_REPRODUCIBLE` discrepancy) and `rno-04-03`'s course-closing fix
  were specifically re-derived and confirmed correct and no longer template-colliding.
- **`functions-and-sequences` (12/12)**: no lesson's current hash matches any prior signed record
  anywhere — no prior independent sign-off exists for this course. All 12 lessons were read and assessed
  in full at current state: every function-evaluation, arithmetic/geometric nth-term, and
  classification answer independently hand-recomputed; every figure checked for registration and
  text-alignment.

**Duplicate scans (both required by the task, run course-by-course on all three courses):**
byte-identical `(prompt, options)` tuples across each whole course, and prompt-excluded structural
duplicates (`prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g,"#").replace(/\s+/g," ")` —
replicated verbatim from the live `repeatedTemplates` detector in
`scripts/audit/consolidate-pending-workload-s236.mjs`) both within-lesson and course-wide. MCQ/lab
`choices` option-label lengths were diffed correct-vs-incorrect for length leaks.

No npm/vitest/tsc was run (per instructions). Math was verified by hand; figure and widget-config code
was read directly, not rendered.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| rational-number-operations | 12 | 12 | 0 | 0 |
| exponential-functions | 12 | 12 | 0 | 0 |
| functions-and-sequences | 12 | 12 | 0 | 0 |
| **Total** | **36** | **36** | **0** | **0** |

## REVISE list (one-phrase reasons)

None. No mathematical falsehood, missing/misaligned visual, MCQ option-length leak, or duplicate-job
defect was found in any of the 36 lessons across all three courses.

## Findings detail (non-blocking, recorded for the record — not REVISE triggers)

- **`exp-02-03` manual figure hold, assessed honestly per task instruction**: confirmed resolved, not
  reopened. `c2`/`exp-grow-50` and `c3`/`exp-decay-50` are both present, registered, bound, and their
  titles state the exact rendered values (`1 + 1/2 = 1.5`, `16·(3/2)ˣ`; `1 − 1/2 = 0.5`, `80·(1/2)ˣ`)
  matching the lesson prose word-for-word on the numbers. The dangling `67c19c25` manual-hold blocklist
  entry that S318 retired stays retired at current source.
- **`rational-number-operations` S320 dedup wave, verified per task instruction**: re-read
  `S320_PROGRESSION_DEDUP.md`'s rational-number-operations section and independently re-derived its two
  named claims — `rno-04-02/k2`'s reworded temperature prompt no longer template-collides with `i2`
  (hand-verified answer −1.2 correct), and `rno-04-03`'s course-closing state is clean. A course-wide
  structural-duplicate replay (exact detector regex) on all 12 post-fix lessons found **zero** remaining
  within-lesson `repeatedTemplates`/`repeatedPrompts`/`repeatedWidgets` — the dedup wave's own claim of
  "12/12 parse-clean, progressionCheck clean on all 12" holds at current source.
- **Cross-lesson (not within-lesson) numeric echoes, judged non-defects**: `exp-01-01/ch1` and
  `exp-04-02/i3` share the byte-identical prompt "For f(x) = 2·3^x, what is f(3)?"; `rno-04-01`'s
  `-1/2×2/3` and `-3/4÷1/2` fraction problems recur verbatim in `rno-04-03` (the course's own synthesis
  capstone); `fn-04-01/i1` reuses `fn-02-01/i1`'s exact sequenceBuild numbers (3,7,11,15 → d=4, 39). In
  every case the reusing lesson's own concept text explicitly frames the repeated example as a deliberate
  recall anchor for a *new* surrounding idea (continuing a running growth-comparison narrative;
  cumulative all-operations review; contrasting arithmetic vs. geometric) rather than restating the same
  instructional job — none are within a single lesson, and none are MCQ (the only widget type the
  courseset-wide global-cluster detector checks). Not flagged as REVISE.
- **Three `commonErrors` feedback strings open with "Don't"** (`fn-01-01/k1`, `fn-01-01/k2`,
  `fn-01-03/k3`) — mathematically accurate, correctly named ("forgot the −N" omission), just a mild
  negation-first phrasing. Not a factual defect; noted for a future language pass, not REVISE.
- Standard Maggie's Trail lesson shape (concept → interactive → check ×2–3 → challenge, several sharing a
  number-normalized template with different a₁/d/r/base each time) appears throughout
  `functions-and-sequences` and within the already-clean `exponential-functions` course (e.g.
  `exp-03-01`'s six "solve bˣ=k" instances). This matches the pattern already accepted as non-duplicate
  scaffolded practice in prior independent reviews (S318's own finding) and was not re-litigated as a new
  defect standard.

## Raw data

- Review basis hashes for all 36 lessons obtained via
  `node scripts/session/print-review-basis.mjs <ids>` (36/36 resolved, 0 unknown).
- Hash cross-reference: `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` plus all 118
  `reports/closure/cowork-staging/*.jsonl` files scanned for `lessonId` + matching
  `reviewedBasisHash`/`reviewBasisHash`. Result: `exponential-functions` 12/12 exact matches (S318);
  `rational-number-operations` 0/12 exact matches (source moved post-S320); `functions-and-sequences`
  0/12 matches anywhere (no prior sign-off).
- Figure registration: every `figure` id cited across all 36 lessons (27 in exponential-functions, 16 in
  rational-number-operations, 28 in functions-and-sequences) confirmed present in
  `src/components/figureIds.ts` and bound to a component in `src/components/figures.tsx`; every such
  component confirmed to render an `<title>` element (no color-only cue).
- Duplicate scans: byte-identical `(prompt, options)` tuples and prompt-excluded structural templates run
  course-wide on all three courses (method above); MCQ/lab-widget option-label length parity checked on
  every `mcq`/`choices` widget in all three courses. Results summarized in "Findings detail" above.
- Reviewed at: `2026-08-20T21:08:37.000Z`. Dispositions appended (not ledger-written) to
  `reports/closure/cowork-staging/laneB-s322-F13-dispositions.jsonl`, record IDs
  `S322-F13-rno-01-01` … `S322-F13-fn-04-03` (36 lines, one per lesson).
