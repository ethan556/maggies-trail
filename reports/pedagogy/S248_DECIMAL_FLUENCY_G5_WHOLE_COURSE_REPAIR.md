# S248 — Decimal Fluency Grade 5 whole-course V4 repair

## Scope and authority boundary

- Course: `decimal-fluency-g5`
- Lessons reviewed and repaired: 16 of 16 (`g5d-01-01` through `g5d-03-05`)
- Stable lesson IDs, step IDs, widget types, numeric answers, tolerances, interactive targets, ranges, operations, operands, hop contracts, MCQ option IDs, and MCQ correctness flags were preserved.
- No shared queue, lesson-card, cache, decision-ledger, generator, evaluator, or figure-registry file was edited.
- The work is implementation evidence. It is not a substitute for an independent `KEEP` / `REVISE` / `ESCALATE`, visual, or grade-language decision.

## Authoritative before state

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` contained 96 rows scoped to the course:

| Workstream | Before |
|---|---:|
| `ILLUSTRATION_REPLACEMENT` | 32 |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 16 |
| `VISUAL_FIRST_REPRESENTATION` | 16 |
| `GRADE_LANGUAGE_REVIEW` | 16 |
| `LESSON_COMPLETE_DISPOSITION` | 16 |
| **Total** | **96** |

All 16 lesson cards were `PENDING_ASSESSOR`. The 16 progression rows cited exact widget repetition, exact prompt repetition, number-normalized prompt repetition, or a combination. Every concept placement used the unrelated `count-on-hops` figure, producing 32 fixed-exemplar illustration rows.

## Implemented root-cause repairs

### Visual-first concepts

- Replaced all 32 `count-on-hops` placements.
- Used 13 already registered, accessible mathematical figures matched to the lesson concept: hundredths grids, place-name diagrams, trailing-zero equivalence, aligned columns, padding and trading, decimal area models, decimal-place counting, estimation, metric ladders, money, and equal scaling.
- Rewrote all 32 concept bodies and narrations to name what the visible representation demonstrates. Narration remains exactly synchronized with visible concept text.
- Kept mathematical diagrams precise rather than decorative; the representation carries the place-value relationship.

### Same-sitting progression and question jobs

- Reframed every second interaction as diagnosis, verification, or claim checking rather than repeating “Try it again.”
- Rewrote repeated checks and challenges as distinct jobs: read a representation, apply the relationship, diagnose a misconception, estimate a magnitude, translate units, or solve a transfer context.
- The authoritative detector's three signatures are now unique within every lesson:
  - stable widget payload: 16 lessons clear;
  - exact widget prompt: 16 lessons clear;
  - number-normalized prompt template: 16 lessons clear.
- Conditional remedials remain intentionally available only after an error; their explanations now match the revised core concept.

### Question and feedback quality

- Rebuilt 22 authored MCQ surfaces with concise Grade 5 stems, one defensible answer, parallel options, and misconception-aware feedback.
- Preserved answer ID `o0` and the legacy answer-first source contract. The shipped seeded runtime shuffle is deterministic; across 32 tested seeds per item, every correct answer reaches each of the four displayed positions.
- Maximum option-length spread is 14 characters; no correct-answer position or length cue is required.
- Repaired 10 `columnCalc` interaction surfaces whose success feedback falsely displayed the unrelated equation `24,681 + 13,247 = 37,928`. Each now reports its own answer in hundredths and decimal form, with operation-correct fallback guidance.
- Replaced generic “Try it,” “One more, for the road,” and “You did it” directions with explicit actions and lesson-specific recap prompts.

## Evaluator-preservation proof

An order-independent comparison against `HEAD` found zero changes to:

- lesson or step IDs;
- widget types;
- numeric answers, tolerance, or unit;
- estimate-slider target, range, start, acceptance factor, or unit label;
- column operation, operands, or decimal-place count;
- bar-builder categories, target, range, or step;
- number-line range, start, hop size, hop count, or direction;
- MCQ option ID → correctness mapping.

The content changes are therefore stem, option wording/order, feedback, concept representation, and question-job changes rather than evaluator drift.

## Queue-compatible before → after

| Workstream | Before | After this source wave | Closure condition |
|---|---:|---:|---|
| `LESSON_PROGRESSION_AND_DUPLICATION` | 16 | **0 live causes** | The live queue detector will remove all 16 on shared queue regeneration. |
| `ILLUSTRATION_REPLACEMENT` | 32 | **0 source causes; 32 stale audit rows** | `reports/vis/VIS01_PLACEMENTS.csv` is a static input. Re-run VIS01 placement alignment, then regenerate the shared queue. |
| `VISUAL_FIRST_REPRESENTATION` | 16 | 16 | Requires independent calibrated visual dispositions. |
| `GRADE_LANGUAGE_REVIEW` | 16 | 16 | Requires independent grade-band language decisions. |
| `LESSON_COMPLETE_DISPOSITION` | 16 | 16 | Requires independent whole-lesson decisions on the new source hashes. |

Immediate queue-compatible total after ordinary live-detector regeneration: **96 → 80**. After the required VIS01 placement re-audit consumes the repaired source: **80 → 48**. The remaining 48 rows are deliberately assessor-controlled and were not self-closed by the implementer.

## Verification

- Focused regression: `src/lib/session248.decimalFluencyG5CourseIntegrity.test.ts` — 6/6 passed.
- Combined decimal compatibility, course-integrity, and figure-render regression: 31/31 passed across 3 files.
- Content schema: 1,840/1,840 passed.
- Strict CML: 0 errors, 0 warnings.
- Targeted ESLint: passed.
- Whole-corpus pedagogy: 1,711/1,711 files clean.
- Whole-repository TypeScript: passed (`tsc --noEmit`).
- Diff whitespace check: passed for the course and isolated evidence files.

## Remaining blockers

1. Independent assessor decisions must be created against the new lesson hashes, then appended through the shared decision authority.
2. VIS01 placement evidence must be regenerated so the 32 repaired illustration rows stop reflecting the prior `count-on-hops` source.
3. Shared queue, cards, and cache must be regenerated by the integration owner after all concurrent source waves settle.
4. Representative browser evidence should confirm figure visibility, column controls, slider bounds, option wrapping, keyboard/touch behavior, and narrow-view layouts on the final candidate build.
