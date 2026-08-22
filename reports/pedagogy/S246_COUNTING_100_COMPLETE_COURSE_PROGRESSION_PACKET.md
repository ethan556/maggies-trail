# S246 Counting to 100 — complete-course progression packet

## Scope and cause classification

The candidate workload queue contains 18 `LESSON_PROGRESSION_AND_DUPLICATION` rows for `counting-to-100-k`: every lesson in the course. All 18 are `OPEN_REPEAT_PURPOSE_OR_REDESIGN` rows caused only by number-normalized prompt repetition. The queue reports no exact prompt duplicates and no duplicate widget payloads for this course.

This packet closes the course as one coherent batch. It owns only the 18 lesson JSON files, the aggregate focused regression test, and this report. Shared figures, generator libraries, standards data, and global evidence artifacts remain unchanged.

## Implemented progression contract

The existing visual-first lesson spine is preserved in every lesson:

- both concept moments keep the `number-track` figure;
- the opening causal interaction remains a manipulable `numberLineHop`;
- the second interaction remains a visual `dragOrder` task;
- every challenge keeps its existing interactive surface while moving to a distinct transfer, context, constraint, or reverse-direction job;
- every remedial uses a simpler concrete action with counters, bundles, or boxes.

The replacements deliberately vary the learner action rather than merely swapping numbers. They include checking a claim on a track, moving counters or beads, crossing a decade boundary in a story, composing or removing bundles of ten, moving vertically on a hundred chart, locating a covered square from two neighbors, and counting backward from a new context.

During the review, seven remedial stems were found to say “right after” even though their stored answers required moving three or four spaces. Those stems now state the correct number of moves. The evaluator answers and existing concrete numeric response surfaces are preserved.

## Queue-defined before/after evidence

The exact queue normalization is lowercase text, signed-number replacement, and whitespace collapse. A focused test reproduces that rule.

| Lesson | Repeated step IDs before | Repeated step IDs after | Challenge job |
| --- | --- | --- | --- |
| `k100-01-01` | `k2 ch1` | none | hiker crosses to the next marker |
| `k100-01-02` | `ch1` | none | train reaches the next decade station |
| `k100-01-03` | `ch1` | none | bead moves six spaces |
| `k100-01-04` | `k2` | none | reverse-direction predecessor constraint |
| `k100-01-05` | `k2 ch1` | none | climber moves to the next marker |
| `k100-01-06` | `ch1` | none | rocket reaches 100 |
| `k100-02-01` | `ch1` | none | add a bundle of ten to a tray |
| `k100-02-02` | `k3 ch1` | none | add a bundle of ten to a box |
| `k100-02-03` | `k2 ch1` | none | move a token down one chart row |
| `k100-02-04` | `k3 ch1` | none | add a tower of ten cubes |
| `k100-02-05` | `k2 ch1` | none | remove one group of ten beads |
| `k100-03-01` | `k1 ch1` | none | move a game piece five spaces |
| `k100-03-02` | `k1 ch1` | none | walk forward from a middle marker |
| `k100-03-03` | `ch1` | none | rabbit continues an interrupted count |
| `k100-03-04` | `k1 ch1` | none | rocket advances to 100 |
| `k100-03-05` | `ch1` | none | wrap from the last square of a chart row |
| `k100-03-06` | `k2 ch1` | none | infer a covered square from both neighbors |
| `k100-03-07` | `k1 ch1` | none | move a game piece backward five spaces |

Exact before/after scan: **18 → 0 open course rows** and **29 → 0 repeated normalized-prompt placements**.

Expected global queue delta after the coordinating lane regenerates deterministic evidence: **18 rows closed**. Global queue, review-card, cache, and aggregate duplicate-evidence regeneration remains a coordinating-lane task.

## Verification contract

`session246.counting100Progression.test.ts` verifies all 18 lessons as one family:

- exact queue-normalization closure;
- widget schema and integrity for every primary question;
- preservation of both visual concept hosts and both interactive hosts;
- explicit challenge-job contracts for every lesson;
- one concrete remedial per lesson, distinct from all primary prompt templates;
- remedial prompt/evaluator agreement for every expected answer.

The original `session183.counting100k.test.ts` remains the baseline course contract and is run alongside the focused packet.
