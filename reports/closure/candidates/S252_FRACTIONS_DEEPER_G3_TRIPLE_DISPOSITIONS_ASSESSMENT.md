# S252 fractions-deeper-g3 independent triple-disposition assessment

Assessment date: 2026-08-18
Reviewer: ChatGPT Work independent assessor (not the source-repair author)
Scope: all 14 lesson JSON files, every remedial route, current course manifest, S252 repair report/script/test, registered fraction figures, widget/evaluator/feedback semantics, current review authority, shared cards, and current scoped queue.

## Result

The S252 main-path repair is real and internally consistent, but the course is not yet a V4 `KEEP` portfolio.

| Decision stream | Result |
|---|---:|
| Lesson | 0 KEEP / 14 REVISE / 0 ESCALATE |
| Visual | 14 REQUIRED / 0 PREFERRED / 0 SUFFICIENT / 0 ESCALATE |
| Grade language | 10 FIT / 4 REVISE / 0 ESCALATE |

The candidate is bound directly to all 14 current `loadLessonReviewAuthority` basis hashes. All 14 shared S244 cards are stale for this source state and were inspected only as historical evidence, never substituted for current authority.

## Repairs independently verified

- All 28 main concept placements now reference registered semantic fraction figures. Two placements were already specific, and the other 26 replace the withheld generic source cause documented by S252.
- All 14 main interaction sequences have distinct i1/i2 prompts and payloads, with i2 functioning as misconception repair. The 14 prior main progression causes are closed.
- Twenty main fraction-bar surfaces now have 40 target-specific low/high feedback lines. Of those, 36 are the formerly false non-half lines repaired by S252; the four quarter-specific lines in `g3f-01-01` were already truthful and were correctly retained.
- Main concept body/narration parity holds, all scoped step IDs are unique, every main figure is registered, no repaired placement falls back to `count-on-hops`, and the reviewed fraction figure implementations remain bound to the validator's surface hash.
- Fraction-bar targets remain inside evaluator ranges. MCQs retain one correct option, unique option IDs, and nonempty option feedback. Numeric answers remain finite and do not collide with their common-error values. Number-line targets remain inside their evaluator ranges.

These findings agree with the S252 source report's 26 illustration replacements, 14 progression closures, and 36 corrected feedback lines. They do not imply that the three human disposition streams should be marked complete without implementation debt.

## Why all 14 lessons remain REVISE / visual REQUIRED

Every lesson has exactly one remedial route. In every case:

1. the remedial concept is text-only even though the main mathematical idea has a suitable semantic representation; and
2. the remedial check's widget is byte-for-byte equivalent to that lesson's k1 widget.

That is a systematic same-sitting repeat, not a diagnostic or transfer job. It also withholds the visual model specifically from a learner who has demonstrated that the main route did not work. The bounded implementation requirement is to add a truthful synchronized visual/manipulative to each remedial concept and replace the repeated remedial check with a misconception-specific transfer task while preserving evaluator truth and stable IDs where possible.

Additional specialized debt:

- `g3f-02-02`: both concepts teach sixths and eighths (including `1/8 < 1/6`), but both attached figures are `thirds-compare`, which shows halves, thirds, and fourths. The figure must represent the quantities actually taught.
- `g3f-01-04`: the course is teaching fractions of a set, but some checks reduce to array counting and the numeric fallback tells the learner to name equal pieces of a cut whole. A set-specific representation/widget and context-true fallback are required.
- `g3f-01-01`, `g3f-01-03`, and several later lessons also have near-repeated transfer/challenge jobs. These are recorded in the per-lesson rationales and should be resolved in the same bounded family rewrite.
- Denominator/scope jumps such as denominator 16 in `g3f-01-05` and denominator 24 in `g3f-02-03` need an explicit progression rationale or a more coherent transfer task.

## Language decisions

The following four lessons are `REVISE`; the remaining ten are `FIT`:

| Lesson | Exact cause |
|---|---|
| `g3f-01-04` | Array-count tasks receive a cut-whole fallback that does not describe the displayed context. |
| `g3f-02-05` | Exact whole-number results such as `8/2` and `24/8` are incorrectly called mixed numbers. |
| `g3f-03-01` | The same mixed-number misuse recurs across several near-identical conversion jobs. |
| `g3f-03-04` | The challenge again calls an exact whole-number result a mixed number. |

These are deterministic local revisions, so no lesson requires escalation.

## Current authority and expected queue effect

The current scoped queue contains 82 rows:

| Workstream | Rows | Disposition |
|---|---:|---|
| `LESSON_COMPLETE_DISPOSITION` | 14 | Closed by authoritative append |
| `VISUAL_FIRST_REPRESENTATION` | 14 | Closed by authoritative append; REQUIRED debt is carried into revision rows |
| `GRADE_LANGUAGE_REVIEW` | 14 | Closed by authoritative append |
| `ILLUSTRATION_REPLACEMENT` | 26 | Stale source rows closed by serial source refresh |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 14 | Stale source rows closed by serial source refresh |

Appending the candidate closes 42 generic human-review rows and opens 14 `LESSON_REVISION_IMPLEMENTATION` rows, an immediate net reduction of 28. A subsequent serial source refresh closes the 40 repaired source rows. The expected final course inventory is therefore 14 honest lesson-revision rows, not zero:

`82 - 42 + 14 - 40 = 14`

The queue bridge creates one consolidated revision row per `REVISE` lesson; visual `REQUIRED` does not create a second visual row. This assessment therefore does not double-count the remedial visual debt.

## Hash and evidence boundary

- Candidate SHA-256: `fcbb8446fa2af3ec76109d57ab311ef1ba4540c05547c787bca137a39ecbee22`
- Course manifest SHA-256: `252a8fb53f2f3e113733c4de058d1a32302d525ab334fbc0f33fd7f4f3e8f517`
- Reviewed fraction-figure surface SHA-256: `f91c885b8d207746a583263e12eaf154c79551e45a12a57f6aa00664274034fb`
- Figure-ID authority SHA-256: `7099c571bf90b4ab4feabdee8c741a321ad6f7ffe68d7ad9ad6ed0db646a7876`
- Figure visibility/alignment authority SHA-256: `ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851`

The strict validator is read-only. It ratchets the current lesson hashes, candidate schema and decisions, reviewed figure mappings and implementations, registration and visibility authority, exact main repair counts, remedial repetition/visual debt, language defects, evaluator/feedback agreement, unique IDs, stale-card boundary, current queue distribution, and expected queue delta.

## Files

- `reports/closure/candidates/S252_FRACTIONS_DEEPER_G3_TRIPLE_DISPOSITIONS.jsonl`
- `reports/closure/candidates/validate-s252-fractions-deeper-g3-triple-dispositions.mjs`
- `reports/closure/candidates/S252_FRACTIONS_DEEPER_G3_TRIPLE_DISPOSITIONS_ASSESSMENT.md`

No lesson, runtime, queue, card, cache, ledger, or standards artifact was modified by this independent assessment.
