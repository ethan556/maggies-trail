# S258 fraction-multiply-g4 independent superseding assessment

Assessment date: 2026-08-18
Reviewer: ChatGPT Work independent assessor (not the S258 source author)
Scope: all 12 current lessons and remedials, current lesson-review hashes, registered figure surfaces, evaluator/generator contracts, S196/S255/S258 regressions, the S258 repair/report, the stale S255 candidate, and the scoped live queue.

## Disposition

| Stream | Distribution |
| --- | ---: |
| Lesson | 3 KEEP / 9 REVISE / 0 ESCALATE |
| Visual | 0 REQUIRED / 0 PREFERRED / 12 SUFFICIENT / 0 ESCALATE |
| Grade language | 12 FIT / 0 REVISE / 0 ESCALATE |

The three KEEP lessons are `g4x-02-04`, `g4x-03-01`, and `g4x-03-02`. The other nine lessons are REVISE only for a newly ratcheted MCQ construction cause. No learner-visible mathematical falsehood, evaluator disagreement, missing required visual, literal variant failure, or release-blocking runtime gap remains.

## S258 repairs independently verified

- All 12 candidate records bind directly to current review-basis hashes and lesson-source hashes.
- All 14 `faWholeTimesFractionNumeric` surfaces again begin with the literal `Compute W × N/D` route required by the independent solver. The suffixes preserve distinct apply, retrieval, and transfer jobs.
- All 11 formerly unannounced figure/claim differences now identify the visible figure as another, same-direction, or inverse-direction example before transferring the structure. Each figure's own quantities and title are true, and an exact interactive model follows where the concept uses different quantities.
- All 12 remedial concepts now carry a registered, accessible figure, narration equals visible body, and all 12 remedial checks differ from every main prompt by exact text, number-normalized text, and full widget payload.
- All 84 main/remedial graded surfaces preserve stable step and option IDs and valid targets. Numeric routes re-derive through `g4Independent.cjs`; MCQs have exactly one evaluator-correct stable option and truthful feedback; fraction-bar and number-line traps do not equal their targets; estimate choices agree with their targets.
- The corrected `7 × 5/6 = 35/6 = 5 5/6`, about 6 claim remains synchronized across concept, interaction, choices, feedback, and remedial.
- The S258 repair is idempotent at course seal `a92be55f2aef530768229925aafc3ae48e04f95bce8f5583c39c7a47724e66dc`.

The repaired visual strategy is sufficient, not merely preferred: related examples are explicitly named as transfer examples rather than presented as the lesson's exact quantities, and the operational interaction immediately models the lesson quantities. This adds structural variation without repeating the same sitting task.

## Remaining choice-surface debt

Independent review found 21 MCQs across nine lessons. All 21 place the correct option at array position 0, and 19 have a longest/shortest option-label ratio greater than 1.25. The S196 regression explicitly freezes first-position correctness, so its green status confirms current evaluator stability but also preserves a cue that conflicts with the V4 deterministic-randomization contract.

| Lesson | MCQs | Fixed at position 0 | Length-parity failures |
| --- | ---: | ---: | ---: |
| `g4x-01-01` | 1 | 1 | 1 |
| `g4x-01-02` | 3 | 3 | 3 |
| `g4x-01-03` | 1 | 1 | 1 |
| `g4x-01-04` | 1 | 1 | 1 |
| `g4x-02-01` | 3 | 3 | 3 |
| `g4x-02-02` | 3 | 3 | 2 |
| `g4x-02-03` | 3 | 3 | 2 |
| `g4x-03-03` | 3 | 3 | 3 |
| `g4x-03-04` | 3 | 3 | 3 |
| **Total** | **21** | **21** | **19** |

The options and feedback are mathematically true; this is assessment reliability debt, not an evaluator-truth blocker. Repair should preserve stable option IDs/correctness while applying stable-ID deterministic ordering across items and parallelizing labels sufficiently to remove length cues. The affected nine lessons therefore remain bounded REVISE rather than ESCALATE. Visual and language questions are still closed as SUFFICIENT/FIT.

## Stale authority requirement

The original `S255_FRACTION_MULTIPLY_G4_TRIPLE_DISPOSITIONS.jsonl` is intentionally required as stale historical evidence. Its SHA-256 remains `ecab4b04efaab677745d02c4cc8aa58cfb061d229059a9b8a95c70364349b380`; all 12 of its review-basis hashes differ from current authority. The canonical appender rejects it at `g4x-01-01` as `STALE_HUMAN_DECISION`. It must not be appended, modified, or treated as current.

The superseding S258 candidate passes canonical appender `--check` with 12 records and distributions 3 KEEP / 9 REVISE, 12 SUFFICIENT, and 12 FIT. No ledger append is authorized by this assessment.

## Queue effect

The live pre-refresh scoped queue still contains 72 rows: 24 illustration, 12 progression, and 36 generic human-review rows. Appending this candidate would close the 36 generic human questions and open nine consolidated lesson revisions, leaving 45 before source refresh. Refreshing the 36 already implemented generic source rows leaves nine lesson revisions. Honest choice redetection adds 21 exact MCQ choice-surface causes, for a projected residual of **30 rows**:

- 9 consolidated lesson revision implementations;
- 21 keyed-position/option-parity choice surfaces.

The 11 former visual synchronization causes, 14 literal prompt placements, and 12 remedial causes are closed in current source and must not be reopened by a stale S255 decision.

## Reproducible evidence

```text
node scripts/audit/repair-fraction-multiply-g4-s258.mjs --check
npx vitest run src/lib/session196.fractionMultiplyG4.test.ts src/lib/session255.fractionMultiplyG4CourseIntegrity.test.tsx src/lib/session258.fractionMultiplyG4Supersession.test.tsx
node reports/closure/candidates/validate-s258-fraction-multiply-g4-superseding-triple-dispositions.mjs
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S255_FRACTION_MULTIPLY_G4_TRIPLE_DISPOSITIONS.jsonl
npx eslint reports/closure/candidates/validate-s258-fraction-multiply-g4-superseding-triple-dispositions.mjs
git diff --check -- reports/closure/candidates/S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl reports/closure/candidates/validate-s258-fraction-multiply-g4-superseding-triple-dispositions.mjs reports/closure/candidates/S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS_ASSESSMENT.md
```

Focused S196/S255/S258 result: 3 files, 24 tests passed. Candidate SHA-256: `61a9c4fbbca0bee12afee3f45ba789c848d4fc2860e3a770cf10d52340dc6f43`.

## Isolated outputs

- `reports/closure/candidates/S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl`
- `reports/closure/candidates/validate-s258-fraction-multiply-g4-superseding-triple-dispositions.mjs`
- `reports/closure/candidates/S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS_ASSESSMENT.md`

No lesson, remedial, shared runtime, queue, card, cache, ledger, standards, review-authority, source-repair evidence, commit, push, or deployment artifact was changed by this independent assessment.
