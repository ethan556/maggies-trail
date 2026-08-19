# S247 how-many flash-truth supersession validation

Status: **PASS**

## Independent verdict

The repaired `subitizeFlash` surfaces in `khm-03-05` and `khm-03-06` are mathematically and representationally truthful. This assessment recomputed the four counts from the renderer's position construction and traced the authored options, evaluator, correct-answer reveal, visible SVG, accessible SVG name/title, fallback feedback, common-pick feedback, success feedback, and generated forms without relying on the producer report.

| Lesson / step | Layout | Actual circles | Options | Accepted value | Visible/ARIA/feedback |
|---|---|---:|---|---:|---|
| `khm-03-05/k2` | dice | 3 | 2, 3, 4, 5 | 3 | all say 3 |
| `khm-03-05/ch1` | dice | 4 | 3, 4, 5, 6 | 4 | all say 4 |
| `khm-03-06/k2` | ten-frame | 4 | 3, 4, 5, 6 | 4 | all say 4/ten-frame |
| `khm-03-06/ch1` | ten-frame | 4 | 3, 4, 5, 6 | 4 | all say 4/ten-frame |

The focused regression independently passed 4 tests, including 240 generated cases (`2` forms × `3` bands × `40` seeds). Across the authored surfaces, all 16 offered values were traced: only each widget's `count` is accepted; every other offered value returns either its count-consistent misconception diagnosis or the count-consistent fallback.

## Honest disposition

Both current-hash records remain:

- lesson: `REVISE`
- visual: `REQUIRED`
- grade language: `REVISE`

The former learner-visible count-5 falsehood is closed, but this does not erase the open V4 debt. Four concept figures remain withheld because the generic `count-on-hops` exemplar does not depict the quick-look or five-and-more concepts. Both lessons retain progression/duplication debt; `khm-03-06` still gives k2 and ch1 the identical count-4 ten-frame flash. Long or abstract Kindergarten narration also remains.

## Current-hash seals

- `khm-03-05` lesson SHA-256: `ee439314f8d6411882306ee6603cf406743aac74981a3d4164757696eabf2b84`; review basis: `81a3946f1eeb56940f11ff9712619c89c366591a250ec37bbc67fff3d41eadb5`
- `khm-03-06` lesson SHA-256: `fcd5c0c45c3c9d17d4a2c716d42fa857cde025e97f6c79db7eeb1b6c08764706`; review basis: `ac83333044941776c802c86c18fd5187fb4ec051abad6602a67926af900fca61`

The prior `S246-KHM-*` records remain in append-only history. The two appended `S247-HMK-*` records resolve as `CURRENT_HUMAN_DECISION`; history count 143 is their immutable append checkpoint and later valid records are permitted.

## Verification

- `node reports/closure/candidates/validate-s247-how-many-flash-truth-supersession.mjs` — PASS
- `npx vitest run src/components/session247.howManyFlashCountTruth.test.tsx` — PASS (1 file, 4 tests)
- authoritative ledger resolution — PASS: both appended S247 records are current; their append checkpoint is disposition history 143

The strict validator is read-only. It preserves the append-only ledger history and does not modify lessons, the queue, review cards, cache, or other shared artifacts.
