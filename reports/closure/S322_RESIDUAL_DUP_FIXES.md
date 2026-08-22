# S322: Residual Duplicate Fixes (impl-2/impl-3 REVISE closure)

Fixes every REVISE the S321 verifier signed plus the recorded open debt: 19 residual
PROMPT-EXCLUDED structural duplicates across number-writing-k, shapes-build-k,
compare-numbers-k, teen-numbers-k (impl-2/impl-3 scopes), the kc-03-01 generator-range
defect, and the kcw-02-04/kcw-03-01 remedial open debt.

Base commit: `a78d6a3e610ccf1b7a54721e907fca1be9d8c2d9` (HEAD; no other commits made in
this session — only working-tree edits to the 20 lesson JSONs below).

Source of truth: `reports/closure/S321_VERIFY_IMPL123.md` (REVISE lists, teen-numbers-k
10-row duplicate-pair table, kc-03-01 generator-range finding, kcw-02-04/kcw-03-01 debt).

## Scope note (out of bounds, correctly untouched)

Same-lesson `k1`-vs-`remedials[0].check` duplicates are a separate, already-adjudicated
defect class governed by `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` (R1-R9)
and were left alone. Only CROSS-LESSON duplicates were fixed. Two residual
prompt-excluded cross-lesson groups remain in shapes-build-k
(`kgb-01-05`↔`kgb-02-04`'s remedials; `kgb-02-02/ch1`↔`kgb-02-04/i1,i2`) — both are
entirely among lessons never named in S321's impl-2 REVISE list for shapes-build-k
(which named only kgb-01-03, kgb-02-02, kgb-02-03), so they are out of this task's
contracted scope and were left untouched.

## Per-lesson changes

### number-writing-k (3 files)

- **kcw-02-03** — `k2` numberLineHop duplicated `kcw-01-04/k3` (start 10, hops 2, land
  12). Changed to hops 3, land 13; recomputed `commonLandings` (12 short/14 over) and
  all feedback. `kcw-01-04` (earlier in course order) is canonical, left untouched.
- **kcw-03-04** — `k2` mcq duplicated `kcw-01-02/k2` (name-the-numeral-for-6-dots).
  Changed to a 16-dots prompt; recomputed all 4 options (16 correct; 17/15/18
  distractors) and feedback. `kcw-01-02` is canonical, left untouched.
- **kcw-03-01** — open debt (task item 3): `remedials[0].check.widget` duplicated
  `kcw-02-04`'s remedial (name-the-numeral-for-13-dots). Changed to a 15-dots prompt;
  recomputed all 4 options (15 correct; 16/14/17 distractors) and feedback. `kcw-02-04`
  (earlier in course order) is canonical, left untouched.

### shapes-build-k (3 files)

- **kgb-01-03** — `i1` tapDiagram duplicated `kgb-01-02/i2`'s "cat next to table"
  mechanics. Reworked to a "bird next to nest" theme; hotspot coordinates, structure,
  and correctness flags unchanged, only icon/labels/feedback text reworded.
  `kgb-01-02` is canonical, left untouched.
- **kgb-02-02** — `k3` numberLineHop was a *near*-duplicate of `kgb-02-01/k2` (start 3,
  hops 4, land 7; identical to `k2` except one word in `successFeedback`, so byte-exact
  scanning alone missed it — caught via the S321 report's explicit description).
  Changed mechanics to start 6, land 10; recomputed `commonLandings` (9 short/11 over)
  and all feedback. `kgb-02-01` is canonical, left untouched.
- **kgb-02-03** — two collisions in one lesson:
  1. `remedials[0].check.widget` duplicated `kgb-01-05/ch1`'s 4-option
     side/corner-count recall mcq. Replaced with a new yes/no reasoning mcq comparing a
     square's and a rectangle's side/corner counts (still exercising the same
     `conceptTag`). `kgb-01-05` is canonical, left untouched.
  2. `k2` tapDiagram ("tap every round shape") had mechanics colliding with an existing
     round-shape-tap widget. Reworked to "tap every square" (small/large/tilted squares
     correct, one circle distractor), with fresh hotspot icons/labels/feedback.

### counting-to-20-k (1 file)

- **kc-03-01** — generator-range defect (task item 2). `ch1`'s hard-coded target is 11,
  authored as "the SMALLEST teen number." Its `variant: {gen: "base-ten-build"}` field
  (no explicit `form`, so the "default" form runs) draws its target via
  `pick(rand, 12, lo ? 16 : 19)` in `src/lib/variants.ts` (~line 6471) — a range whose
  floor is 12, so it can **never** produce 11. **Decision: removed the `variant` field
  from `ch1`** rather than re-anchoring the step to a generator-producible value.
  Justification: "11 is the smallest teen number" is a unique, load-bearing mathematical
  fact — no value in the generator's producible range {12..19} could be substituted for
  11 without making the prose ("I am the SMALLEST teen number") and the `commonBuilds`
  traps false. Re-anchoring would have required either lying about which number is
  smallest or discarding the lesson's entire pedagogical point for this step. Removing
  the variant key is not a novel pattern in this file: `i1` and `i2` in this same lesson
  already carry no `variant` key at all, so `ch1` now matches the established in-file
  convention for authored, non-regenerated steps. No other field on `ch1` changed —
  target, prose, hints, `commonBuilds`, and feedback are all byte-identical to before.

### compare-numbers-k (5 files)

Four of the five lessons (`kcm-01-03`, `kcm-01-04`, `kcm-02-01`, `kcm-02-02`) shared a
pre-existing defect newly discovered during this pass (also flagged by S321 as
discrepancy #4, out of the original S320_ASSESS_A11 contract): their `ch1` mcq widgets
carried a stale "stars vs hearts" stub-template whose options/feedback did not match
what the widget's own `prompt` actually described. Fixed by rewriting each `ch1`'s 4
options to be truthful about its own prompt:

- **kcm-01-03** — prompt: spaced-out group of 8 vs tight group of 10. New options:
  correct = "the tight group of 10 is bigger"; distractors = equal / spaced group
  bigger / cannot tell. This rewrite also incidentally resolved `kcm-01-03/ch1`'s
  cross-lesson duplicate relationship with `kcm-01-04/k1` as a side effect (the old
  stars/hearts content no longer matches anything after the rewrite) — no separate edit
  to `kcm-01-04/k1` was needed or made.
- **kcm-01-04** — prompt: 8 paired one-to-one with 6, learner mis-calls 8 the smaller
  group. New options: correct = "8 is the larger group, not the smaller one";
  distractors = equal / 6 is larger / cannot tell.
- **kcm-02-01** — prompt: four drums pair exactly with four sticks. New options: correct
  = "they are equal"; distractors = more drums / more sticks / cannot tell.
- **kcm-02-02** — prompt: two rows fill different amounts of space (no numbers given).
  New options: correct = "count each row and compare the two totals"; distractors =
  wider-row-wins / taller-looks-bigger-wins / needs a ruler.
- **kcm-02-03** — genuine residual duplicate: `i2` tenFrame ("build to 7 vs reference
  5") duplicated `kcm-02-02/i2`. Changed to "build to 9 vs reference 6"; recomputed
  `commonCounts` (6 = matches reference, not more; 8 = one short of 9) and feedback.
  `kcm-02-02` is canonical, left untouched.

### teen-numbers-k (8 files)

Root cause: a formulaic "decompose teen N into ten+N" template exists in two feedback
sub-styles — "generic-dots" (target-keyed only, so reusing the same target N across
lessons with only the prompt reworded produces a prompt-excluded duplicate) vs
"noun-embedded" (feedback names a specific object, e.g. "muffins," which naturally
differentiates same-target widgets). Fix strategy: convert each duplicated generic-dots
widget to a noun-embedded widget with a fresh, previously-unused noun, reassigning the
target number where two lessons would otherwise land on the same target+noun.

- **knb-01-04** — `i1` tenFrame (target 3) duplicated `knb-01-03/ch1`. Converted to a
  "stickers/sheet" noun-embedded widget, target unchanged.
- **knb-02-01** — two fixes: `i2` tenFrame (target 4) duplicated `knb-01-02/i2` →
  changed to target 9, "muffins" noun. `k1` tenFrame (target 6) duplicated
  `knb-01-03/k1` → converted to "beads/jar" noun-embedded widget, target unchanged.
- **knb-02-02** — two fixes: `k1` tenFrame (target 5) duplicated `knb-01-03/i1` →
  converted to "ribbons/box" noun-embedded widget, target unchanged. `i1` tenFrame
  (target 8) duplicated `knb-01-04/ch1` → converted to "marbles/bag" noun-embedded
  widget, target unchanged.
- **knb-02-03** — `i2` tenFrame (target 7) duplicated `knb-02-02/i2` (post-fix target 8)
  → changed to target 9, "pebbles" noun (verified no new collision against the
  now-target-8 `knb-02-02/i2`).
- **knb-03-01** — `i2` tenFrame (target 8) duplicated `knb-01-03/i2` → added a "shells"
  noun throughout, target unchanged.
- **knb-03-02** — `i2` numberLineHop (start 10, forward, hops 6, land 16) duplicated
  `knb-01-03/k3` → changed mechanics entirely to start 20, backward, hops 6, land 14
  (verified 20 − 6 = 14); recomputed all landing/feedback fields.
- **knb-03-03** — `ch1` tenFrame (target 4) duplicated `knb-02-04/i1` → converted to
  "gems/pouch" noun-embedded widget, target unchanged.
- **knb-03-04** — `i2` tenFrame (target 2, "egg tray" theme) duplicated `knb-01-04/i2` →
  changed to "pencils/drawer" theme, target unchanged.

In every teen-numbers-k case the earlier-in-course-order lesson is canonical and was
left untouched.

## Post-fix scan results

Cross-lesson duplicate scan (byte-exact identity, and prompt-excluded structural
identity — i.e. widget JSON compared after deleting the `prompt` key), run per course
after all fixes:

| Course | widget-bearing steps | lessons | byte-exact cross-lesson groups | prompt-excluded cross-lesson groups |
|---|---|---|---|---|
| number-writing-k | 98 | 14 | 0 | 0 |
| shapes-build-k | 98 | 14 | 0 | 2 (both entirely among out-of-scope lessons — see Scope note) |
| counting-to-20-k | 91 | 13 | 0 | 0 |
| compare-numbers-k | 84 | 12 | 0 | 0 |
| teen-numbers-k | 84 | 12 | 0 | 0 |

The 2 remaining shapes-build-k prompt-excluded groups:
- `kgb-01-05/k1` == `kgb-01-05/remedials[0].check` == `kgb-02-04/remedials[0].check`
- `kgb-02-02/ch1` == `kgb-02-04/i1` == `kgb-02-04/i2`

Neither group contains any of `kgb-01-03`, `kgb-02-02`(`/k2`,`/k3` were the only touched
steps — `/ch1` was pre-existing and untouched), or `kgb-02-03` — none of the lessons
this task named. `kgb-02-04` and `kgb-01-05` were never in S321's impl-2 REVISE list for
shapes-build-k and are therefore out of contracted scope; flagging as residual/known,
not fixed.

## Validation performed

- Parse-check (`node -e "JSON.parse(...)"`) on all 20 touched files: all pass.
- Cross-lesson byte-exact duplicate scan: clean on all 5 courses.
- Cross-lesson prompt-excluded structural duplicate scan: clean on all 5 courses except
  the 2 pre-existing, out-of-scope shapes-build-k groups noted above.
- Manual arithmetic verification of every recomputed target/landing/commonCount pair
  (e.g. knb-03-02: 20 − 6 = 14, one-hop-short = 15, one-hop-over = 13).
- Feedback truthfulness re-checked against each new numeral/theme; all feedback strings
  ≥25 chars; no negation-opening feedback introduced; mcq correct options remain
  first-listed per this codebase's convention.
- IDs, `conceptTag`s, widget `type`s, and evaluator semantics preserved unchanged in
  every edit; only `prompt`, numeric fields (`target`/`start`/`hops`/`direction`/
  `commonLandings`/`commonCounts`/`hotspots`/mcq `options`), and their dependent
  feedback strings were changed.
- No `npm`, `vitest`, or `tsc` commands were run, per task rules. `node` was used only
  for `JSON.parse` parse-checks and the ad hoc duplicate-scan script
  (`/tmp/dupscan/scan.mjs`, not part of the repo).

## Raw data

- This report: `reports/closure/S322_RESIDUAL_DUP_FIXES.md`
- Per-lesson fix records (20, NDJSON): `reports/closure/cowork-staging/laneA-s322-dupfix.jsonl`
- Changed files: 20 lesson JSONs under `content/courses/{number-writing-k,shapes-build-k,
  counting-to-20-k,compare-numbers-k,teen-numbers-k}/lessons/` (full list and sha256
  hashes in the NDJSON above).
- Base commit: `a78d6a3e610ccf1b7a54721e907fca1be9d8c2d9`. No commits were made in this
  session; all changes are working-tree edits.
