# S318 — QUESTION_DIVERSITY_AND_TRANSFER, all 15 P0 rows

Bounded implementation worker. Scope: the 15 `priority==P0`, `workstream==QUESTION_DIVERSITY_AND_TRANSFER`
rows extracted directly from `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (verified count: 15, matching the
expected course breakdown — shapes-and-sorting-k 7, counting-to-20-k 2, measure-money-time 2,
fractions-add 1, number-system 1, sampling-and-probability 1, shapes-shares-g2 1).

Per task instruction, `npm`/`vitest`/`tsc` were **not** run. Verification below is JSON
parse-checking, a scripted normalized-duplicate scan (regex-collapse digits to `#` over every
step's `widget.prompt`, run within each lesson), direct reading of the touched widget's schema
(`src/lib/schema.ts`), and independent hand arithmetic.

NDJSON ledger: `reports/closure/cowork-staging/laneA-s318-qd.jsonl` (15 rows, one per queue row).

## Method

For every row, the full lesson JSON was read in full (all steps, not just the named
`step_path`), and the assessed sequence (`check`/`challenge` steps) was checked against the
row's `mismatch_evidence` and `next_action` contract. 14 of the 15 rows are **stale queue
signals**: a prior session (identified below, all already committed to the working tree —
`git status --short` shows none of these 15 lesson files as dirty) already gave the flagged
challenge step a distinct instructional job or engine, but `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
was never regenerated to reflect it. Per the task's defect-class instruction ("if the source
already shows genuine diversity, record NOT_REPRODUCIBLE with evidence instead of editing"),
those 14 rows are recorded as `NOT_REPRODUCIBLE` with the current-source evidence, unedited.

One row (`fa-02-02`) reproduced: all four assessed steps (`k1`, `k2`, `k3`, `ch1`) used the same
`exactNumberLab` widget engine, and `ch1` additionally reused `k1`'s exact numbers (7/15 vs.
9/16) inside a thin "team progress" word-problem wrapper — a near-verbatim repeat, not a new
instructional job. That row was fixed; see below.

## Per-row outcomes

| # | work_id | lesson_id | Verdict | Evidence / fix |
|---|---|---|---|---|
| 1 | `EXCELLENCE-fa-02-02` | fa-02-02 | **FIXED** | See "Fix applied" below. |
| 2 | `EXCELLENCE-kc-01-01` | kc-01-01 | NOT_REPRODUCIBLE | `ch1` already an authored conservation-of-number prediction (`subitizeFlash`, "moved the same six dots... how many must flash?"), distinct from `k1`/`k2`'s direct counting job. Closed by `reports/pedagogy/S263_COUNTING_TO_20_K_P0_REPAIR.md` (row `EXCELLENCE-kc-01-01`). |
| 3 | `EXCELLENCE-kc-04-03` | kc-04-03 | NOT_REPRODUCIBLE | `ch1` already an authored invariance task ("Move one, keep the whole" — moving a counter between two parts of a fixed whole), distinct from `k1`/`k2`/`k3`'s direct decompose-fill/mcq jobs. Closed by `reports/pedagogy/S263_COUNTING_TO_20_K_P0_REPAIR.md` (row `EXCELLENCE-kc-04-03`). |
| 4 | `EXCELLENCE-ks-01-01` | ks-01-01 | NOT_REPRODUCIBLE | `ch1` already `mcq` ("A honeycomb shape is turned on its side... What is it still called?" — a rotation-invariance transfer task), distinct from `k1`/`k2`'s `tapDiagram` id-from-description job and `k3`'s `matchPairs`. Closed by `reports/closure/S267_SHAPES_AND_SORTING_K_SOURCE_IMPLEMENTATION.md`. |
| 5 | `EXCELLENCE-ks-01-02` | ks-01-02 | NOT_REPRODUCIBLE | `ch1` already `matchPairs` ("Match each turned or resized picture to its shape name" — naming shapes under transform), distinct from `k1`'s `tapDiagram` and `k2`/`k3`'s `mcq`. Closed by S267. |
| 6 | `EXCELLENCE-ks-01-03` | ks-01-03 | NOT_REPRODUCIBLE | `ch1` already `dragBucket` (classify above/below/beside relative to one tree), distinct from `k1`'s `tapDiagram` and `k2`/`k3`'s `mcq`. Closed by S267. |
| 7 | `EXCELLENCE-ks-02-01` | ks-02-01 | NOT_REPRODUCIBLE | `ch1` already `mcq` ("An ice-cream shape lies on its side... orientation changes" — solid-name transfer under orientation), distinct from `k1`/`k3`'s `tapDiagram` and `k2`'s `matchPairs`. Closed by S267. |
| 8 | `EXCELLENCE-ks-02-03` | ks-02-03 | NOT_REPRODUCIBLE | `ch1` already `dragBucket` (sort three shape-build recipes by finished form), distinct from `k1`'s `mcq`, `k2`'s `matchPairs`, `k3`'s `tapDiagram`. Closed by S267. |
| 9 | `EXCELLENCE-ks-03-02` | ks-03-02 | NOT_REPRODUCIBLE | `ch1` already `dragBucket` (infer heavier/lighter/equal from seesaw clues, sorted), distinct from `k1`/`k3`'s `tapDiagram` and `k2`'s `mcq`. Closed by S267. |
| 10 | `EXCELLENCE-ks-03-03` | ks-03-03 | NOT_REPRODUCIBLE | `ch1` already `matchPairs` (apply a stated sorting rule to items+rule pairs), distinct from `k1`'s `tapDiagram`, `k2`'s `mcq`, `k3`'s `tenFrame`. Closed by S267. |
| 11 | `EXCELLENCE-mmt-02-01` | mmt-02-01 | NOT_REPRODUCIBLE | `ch1` already `matchPairs` (3-object length-estimate match), distinct from `k1`–`k3`'s `mcq`. Closed by `reports/closure/S268_MEASURE_MONEY_TIME_SOURCE_IMPLEMENTATION.md`; a later `S316`/`S317` pass only rewrote its `hints` text (which had described a nonexistent 8-inch object) and did not touch the widget/diversity fix. |
| 12 | `EXCELLENCE-mmt-04-03` | mmt-04-03 | NOT_REPRODUCIBLE | `ch1` already `mcq` reading hand *positions in prose* ("The minute hand points to 8. The short hand is just past 2. What time is it?" → 2:40), distinct from `i1`/`k1`/`i2`/`k2`/`k3`'s `clockSet` (set-the-clock-to-a-target job) and `e1`/`i4`/`k4`'s `elapsedTime`. Closed by S268; a later `S316` pass only rewrote `ch1`'s `hints`/`explanationVariants` (which had walked toward 9:45 instead of the widget's actual 2:40) and left the widget/diversity fix untouched. |
| 13 | `EXCELLENCE-ns-04b-01` | ns-04b-01 | NOT_REPRODUCIBLE | `i1`/`i2` (`plotPoint`) now carry the `ordered-pair-signs` conceptTag, attributing them as assessment evidence alongside `k1`/`k2`/`k3`/`ch1`'s `mcq` — current assessed surfaces are `mcq` + `plotPoint`, not `mcq` alone. Closed by `reports/closure/S282_NUMBER_SYSTEM_SOURCE_IMPLEMENTATION.md`. |
| 14 | `EXCELLENCE-sp-03-02` | sp-03-02 | NOT_REPRODUCIBLE | `ch1` already `matchPairs` ("a trickier experimental-vs-theoretical comparison" — match spinner evidence to the conclusion it supports), distinct from `k1`/`k2`'s `trialProbabilityLab` and `k3`'s `mcq`. Closed by `reports/closure/S274_SAMPLING_PROBABILITY_SOURCE_IMPLEMENTATION.md`. |
| 15 | `EXCELLENCE-ssg2-03-03` | ssg2-03-03 | NOT_REPRODUCIBLE | `ch1` already an authored goal-directed decision task ("Ava may take one half or one third... She wants the bigger share. Which should she take?" — choose-for-a-goal, not compare-two-fractions), distinct instructional job from `k1`/`k2`/`k3`'s direct size-comparison `mcq`s even though the widget type is still `mcq`. Closed by `reports/pedagogy/S264_SHAPES_SHARES_G2_P0_REPAIR.md` (row `EXCELLENCE-ssg2-03-03`). |

**Result: 1/15 reproduced and fixed; 14/15 NOT_REPRODUCIBLE (stale queue signal — source already diversified by S263/S264/S267/S268/S274/S282, none regenerated the queue).**

## Fix applied — `fa-02-02` / `ch1`

**Cause:** all four assessed steps used the `exactNumberLab` widget (`current assessed surfaces:
exactNumberLab`, matching the row's own evidence), and `ch1` specifically reused `k1`'s exact
values (Team A 7/15, Team B 9/16) inside a "which team is further along" wrapper — the same
single-relation compare job as `k1`/`k3`, not a new one.

**Fix:** `ch1`'s widget changed from `exactNumberLab` (single-pair relation compare) to
`dragBucket` (already a registered, schema-conformant type; used earlier in this same lesson at
`i2`, so no new engine was invented) — a 3-way sort ("Left fraction is bigger" / "Right fraction
is bigger" / "Can't tell from 1/2 alone") over 5 fresh fraction pairs. This is a genuine
multi-engine, transfer-oriented synthesis task: unlike `i2` (which only classifies "settles vs.
needs more" without naming a winner), `ch1` now requires the learner to both apply the benchmark
method *and* state a conclusion (or correctly recognize when no conclusion is available), across
several items at once — the step id, `conceptTag` (`benchmark-compare`), and every other step in
the lesson are untouched. `hints` (exactly 3, still progressive) and `explanationVariants` (still
a 2-tuple) were rewritten to match the new widget; the stale `variant: {gen: "fraction-benchmark",
form: "straddleHalf"}` tag was dropped (it named a generator whose output shape no longer matches
this step's widget type — the same "drop the stale variant tag" pattern used by every other
already-closed row in this packet, e.g. `kc-04-03`/`ch1`, `mmt-04-03`/`ch1`).

No figure binding exists on this step (none touched). No other step in `fa-02-02` was edited.

### Hand-verified arithmetic (new items)

| Pair | Doubled numerators | Conclusion | Bucket |
|---|---|---|---|
| 9/16 vs. 7/15 | 9×2=18>16 (above ½); 7×2=14<15 (below ½) | 9/16 bigger | `left` |
| 5/11 vs. 4/7 | 5×2=10<11 (below ½); 4×2=8>7 (above ½) | 4/7 bigger | `right` |
| 5/12 vs. 7/10 | 5×2=10<12 (below ½); 7×2=14>10 (above ½) | 7/10 bigger | `right` |
| 3/5 vs. 4/5 | 3×2=6>5 (above ½); 4×2=8>5 (above ½) | same side | `unclear` |
| 5/9 vs. 6/11 | 5×2=10>9 (above ½); 6×2=12>11 (above ½) | same side | `unclear` |

`3/5 vs. 4/5` intentionally reuses `k2`'s own pair (reinforcing its "same-side" conclusion inside
the new synthesis task, mirroring the precedent in `mmt-02-01`'s already-closed `ch1`, which
reuses its own lesson's per-item numbers inside its matchPairs challenge).

### Verify — `fa-02-02`

- **Parse-clean:** `python3 -c "json.load(...)"` — valid.
- **Scripted normalized-duplicate scan** (regex `\d+`→`#` over every step's `widget.prompt`,
  within the lesson): 0 collisions across all 6 widget-bearing steps (`i1`, `k1`, `k2`, `i2`,
  `k3`, `ch1`) — `ch1`'s normalized prompt (`"Sort each pair of fractions: does the left one
  win, the right one win, or can't you tell using #/# alone?"`) does not match `i2`'s
  (`"Sort each pair: does the halfway stepping stone settle the comparison, or do you need
  another method?"`) or any other step's.
- **Trap≠answer / trap≠trap:** each of the 5 `dragBucket` items has exactly one correct
  `bucketId`; no item's per-bucket feedback text asserts a different bucket's conclusion.
- **Feedback ≥25 chars, no negation-opening, literally true:** all 5 item feedbacks, plus
  `missFeedback`/`successFeedback`, checked by inspection (shortest is 90+ characters; none open
  with "not"/"no"/"don't"; every arithmetic claim matches the hand-verification table above).
- **Widget schema:** `DragBucketSpec` (`src/lib/schema.ts`) fields (`buckets` ≥2, `items` with
  `id`/`label`/`bucketId`/`feedback`, `missFeedback`, `successFeedback`) all present and typed
  correctly; every `items[].bucketId` resolves to a declared `buckets[].id` (`left`, `right`,
  `unclear` all declared).
- **Pedagogy invariants:** step-kind sequence unchanged
  (`concept,interactive,check,concept,check,interactive,check,challenge,recap`) — action ratio
  6/9 = 66.7% (≥60%); concept→check gap unchanged (≤2 steps, unaffected by this edit); recap
  (`r1`) untouched (still 3 takeaways).
- **Figure bindings:** none present on `ch1`; not touched.
- File hash after edit:
  `005b0f999ff73e210a2c73a75d0441b16f4cc9839d2b257a39dd12a42f6c7518`.

## Files touched (1)

- `content/courses/fractions-add/lessons/fa-02-02.json` (`ch1` only)

## Boundaries

- No shared runtime, figure registry, queue CSV, review cards, cache, ledger, or standards
  files were changed by this packet.
- The 14 `NOT_REPRODUCIBLE` verdicts do not regenerate or edit
  `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`; the stale rows remain there for the queue's own
  integration owner to reconcile against the cited closure reports.
- This implementation worker did not assess or close its own packet against any independent
  gate; the evidence above is returned for independent assessment per the worker-prefix
  contract.
