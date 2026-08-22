# S248 decimal-fluency-g5 independent V4 assessment

Status: **PASS — candidate and validator are current-hash clean; implementation is not V4-complete**

This assessment read all 16 complete live lessons, every main and remedial learner path, the S248 focused test and implementer report, the 13 reused figure implementations and accessible titles, the current queue rows, VIS01 placement evidence, and the S244 card artifact. It did not edit lesson/runtime source, append the shared decision ledger, or regenerate shared queue, cards, or cache.

## Exact triple-disposition result

- Whole lesson: **0 KEEP, 16 REVISE, 0 ESCALATE**.
- Visual first: **6 REQUIRED, 0 PREFERRED, 10 SUFFICIENT, 0 ESCALATE**.
- Grade 5 language: **13 FIT, 3 REVISE, 0 ESCALATE**.
- Candidate: `reports/closure/candidates/S248_DECIMAL_FLUENCY_G5_TRIPLE_DISPOSITIONS.jsonl`.
- Candidate SHA-256: `5ad34d2536326fdbc8ea1b430dc589accf0cf8928adfd11b0d856fbd9a942fec`.

No lesson is escalated because every blocker has a deterministic source-level repair. `REVISE` is not a claim that all current mathematics is false; it means the complete lesson does not yet satisfy the varied-job, visual-semantic, feedback, and transfer contracts required for V4.

| Lesson | Current review basis | Lesson | Visual | Language | Primary finding |
|---|---|---|---|---|---|
| g5d-01-01 | `d048faa8b117279c6f9198d419e9a7fb5515cfa5dedc04b450c1757c7bf4421c` | REVISE | SUFFICIENT | FIT | i2 repeats i1's exact bar-builder action; challenge repeats the grid-reading job. |
| g5d-01-02 | `f60ade1fb305ef9de8f6f587d020528638dd42ae58a1b1a022082f8c29970dc7` | REVISE | SUFFICIENT | FIT | Same column state and computation twice; generic distractor explanations. |
| g5d-01-03 | `ce8da364c2f01351c56496dd6a0678d674d7f55159a6820c5693b921c5115f28` | REVISE | SUFFICIENT | FIT | Same padded addition twice; later work becomes integer arithmetic labelled hundredths. |
| g5d-01-04 | `210612e7591542c6ac36f2d9165f1784f3043d4ba7b32f98cd97fc66f9a396b2` | REVISE | SUFFICIENT | FIT | Same subtraction/trading interaction twice; no incorrect work is actually inspectable. |
| g5d-01-05 | `e0ab94ddae6fc5af4f3d953a3bde731f734348304e625b78d8864138e06f5dae` | REVISE | SUFFICIENT | FIT | Same 5.20 − 1.47 calculator twice; k2/k3 repeat changed-number subtraction. |
| g5d-01-06 | `16ef80d284aad884bcbc279026462ea6851c074177337fbbce421c0d12836990` | REVISE | REQUIRED | FIT | Grid never shows 35 hundredths in four groups; exact slider repeats. |
| g5d-02-01 | `f6e45dc170553cc1b300061f99d7133f7f31bac0579f2c648ab9dce9eb2518f8` | REVISE | SUFFICIENT | FIT | Exact estimate slider repeats; later items compute digit products rather than decimal estimates. |
| g5d-02-02 | `a8a8a6dc09f859f713696a41acda81ed148707d1a69d8f52068f4a6c97bfa7e1` | REVISE | SUFFICIENT | FIT | Strong area grid, but identical 0.12 slider twice and weak decimal-factor transfer. |
| g5d-02-03 | `e98ec054af0628f7c703933e32cc14647e85d77cce1355eb96b582da927d9992` | REVISE | SUFFICIENT | REVISE | Same slider twice; later items omit point placement; unnatural “carries places” wording and ungrammatical recap. |
| g5d-02-04 | `9d95eef075dfd505d160a952f414541e9b37bdec66960737f66e53666aa96e5e` | REVISE | REQUIRED | FIT | Figures show 812 ÷ 39 and a generic grid, not 1.44 shared into four 0.36 groups. |
| g5d-02-05 | `03df32b446b9158faf7db29d7e5392ea0aed92ecf1055071a5f9eb59671b6322` | REVISE | REQUIRED | FIT | Visuals do not show equal scaling preserving a quotient; eight-hop action repeats. |
| g5d-03-01 | `b094bb198cf7b64bac8f7f0204fd83fd3e337a51eb5879be7eb17947cc438fbf` | REVISE | REQUIRED | FIT | Generic place-name and ×10 cards do not model shifting both numbers by 100. |
| g5d-03-02 | `fa3fadb74c309e46b195f1111188739c842ce86cef5dedbc3ca44a6f4d18684c` | REVISE | SUFFICIENT | FIT | Same 14.4 slider twice; rough and exact benchmarks are not sharply distinguished. |
| g5d-03-03 | `de03e340ecdc15b53a22ad0ea8e13cd6a82685b7775699203136dbba0d3adb02` | REVISE | REQUIRED | REVISE | Quarter-only figure does not teach dimes/pennies; “prices always” stem overstates the rule. |
| g5d-03-04 | `d6e47c3dbb74dce2733a36fb0fb981d8a67426f88c28c32468cdc1cfd7659d6c` | REVISE | SUFFICIENT | FIT | Metric ladder was corrected during assessment; identical hops and repeated cm-to-m jobs remain. |
| g5d-03-05 | `50ea9448fa2a80de8b23ccf0a72c8ddc6a05ab5d3b2d67902b4d819bca32141d` | REVISE | REQUIRED | REVISE | No multiply-then-subtract visual; exact slider repeats; telegraphic stem and “an $0.80” grammar. |

## Release-blocking mathematical falsehood found and closed

At the first semantic inspection, `g5d-03-04/c2` referenced a learner-visible `mc-length-ladder` that said:

- `mm ×10 → cm`;
- `cm ×100 → m`;
- `m ×1000 → km`;
- “each step multiplies.”

Those numerical directions were reversed. The integration owner repaired the shared figure during this assessment; the current SVG now presents the true equalities `10 mm = 1 cm`, `100 cm = 1 m`, and `1000 m = 1 km`. The release blocker is therefore closed in current source. `g5d-03-04` remains REVISE because the learner still performs the same three hops twice and repeats one conversion direction in k1, k2, and the challenge.

## What the S248 implementation genuinely fixed

The focused suite passed **6/6**. Across the live source:

- all numeric targets examined agree with the authored answers;
- all 10 `columnCalc` success messages now match their own operation and result;
- all 22 main MCQs have exactly one correct option, unique labels, option-length spread at most 14 characters, and deterministic runtime shuffling that reaches all four positions;
- no concept still references `count-on-hops`;
- the registered-figure and schema/pedagogy mechanical checks pass.

Those are real improvements. They do not prove whole-lesson quality. In particular, **66 of 66 incorrect options** in the 22 main MCQs still use the same generic explanation template, “does not match the place-value model or the expected size,” with only the quoted option changed. This passes uniqueness-by-string tests but does not provide misconception-specific feedback.

## Why the progression queue is not semantically closed

For every one of the 16 lessons, removing only `widget.prompt` makes i1 and i2 byte-equivalent under stable serialization. The widget type, operands or target, range, controls, answer, error states, and feedback remain identical. “Build the first model” becoming “Check a classmate's claim” changes framing but not what the learner does.

The current prompt-signature detector now omits all 16 progression rows because the prompt strings differ. The independent V4 assessment preserves these semantic rows:

`PROGRESSION-g5d-01-01` through `PROGRESSION-g5d-03-05` — **16 rows**.

## Specialized rows that remain

After authoritative append, the 48 generic review rows can close, but they must be replaced by 16 lesson revision rows. Specialized work still includes:

- **16 semantic progression rows**: every lesson's i1/i2 same-action contract.
- **10 semantic illustration replacements**:
  - `g5d-01-06/c1`;
  - `g5d-02-04/c1`, `g5d-02-04/c2`;
  - `g5d-02-05/c1`, `g5d-02-05/c2`;
  - `g5d-03-01/c1`, `g5d-03-01/c2`;
  - `g5d-03-03/c1`;
  - `g5d-03-05/c1`, `g5d-03-05/c2`.
- **16 `LESSON_REVISION_IMPLEMENTATION` rows** after the 16 REVISE decisions are integrated.
- **0 current `CHOICE_SURFACE_INTEGRITY` rows**: source order alone is not treated as a cue because runtime shuffling is proven; qualitative feedback repair belongs inside the revision packet.
- **0 current `MATH_PRESENTATION_RESIDUE` rows** for this course.

The 32 current illustration rows still point to the old `count-on-hops` VIS01 snapshot. They are stale as exact placements. A fresh VIS01 audit should close the 21 semantically sufficient replacements and replace the remaining 11 with current figure/step evidence, rather than mechanically deleting all 32.

## Shared-artifact boundary

At validation time, all 16 S244 course cards were stale against the repaired lesson hashes. The candidate therefore binds directly to the same live authority algorithm used by card generation (`loadLessonReviewAuthority`) and has **16/16 current review-basis hashes**. The stale cards were read as planning evidence but were not trusted as the decision basis. Root integration should regenerate cards after concurrent source waves settle.

The current scoped queue has 80 rows: 32 stale VIS01 illustration rows and 48 generic triple-review rows. Its absence of progression rows reflects the prompt-only mechanical detector, not this semantic decision.

## Reproducible gates

```text
node reports/closure/candidates/validate-s248-decimal-fluency-g5-triple-dispositions.mjs
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S248_DECIMAL_FLUENCY_G5_TRIPLE_DISPOSITIONS.jsonl
npx vitest run src/lib/session248.decimalFluencyG5CourseIntegrity.test.ts --reporter=verbose
```

Observed results:

- strict candidate validator: **PASS**, 16/16 current authority hashes;
- bounded appender dry-run: **PASS**, ledger history 146 → 162, 16 REVISE records;
- focused implementation regression: **PASS**, 6/6 tests.

Authoritative append should close exactly 16 whole-lesson, 16 visual-first, and 16 grade-language review rows (**48 generic rows**) while opening or retaining the 16 revision implementations and all specialized semantic work listed above.
