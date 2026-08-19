# S248 — Multiplication and Division Fluency Grade 4 whole-course V4 repair

## Scope and authority boundary

- Course: `mult-div-fluency-g4`
- Lessons reviewed and repaired: 16 of 16 (`g4m-01-01` through `g4m-03-05`)
- Stable lesson IDs, step IDs, widget types, numeric answers, tolerances, interactive targets, ranges, factor requirements, operations, operands, hop contracts, MCQ option IDs, and MCQ correctness flags were preserved.
- No shared queue, lesson-card, cache, decision-ledger, generator, evaluator, renderer, or figure-registry file was edited.
- This packet is implementation evidence. Independent visual, grade-language, and whole-lesson dispositions remain required.

## Authoritative before state

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` contained 94 rows scoped to the 16 lesson files:

| Workstream | Before |
|---|---:|
| `ILLUSTRATION_REPLACEMENT` | 32 |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 13 |
| `CHOICE_SURFACE_INTEGRITY` | 1 |
| `VISUAL_FIRST_REPRESENTATION` | 16 |
| `GRADE_LANGUAGE_REVIEW` | 16 |
| `LESSON_COMPLETE_DISPOSITION` | 16 |
| **Total** | **94** |

The portfolio ledger classified 32 rows as P0 and 62 as P1. Every concept placement used the unrelated `count-on-hops` figure. Thirteen lessons repeated a number-normalized assessment job, and `g4m-03-03/k2` had a 21-character correct-option length cue. All lesson cards required independent review.

## Implemented root-cause repairs

### Visual-first concepts

- Replaced all 32 generic concept placements with 13 already registered mathematical figures.
- Used synchronized place-value shifts and ladders, regrouping chains, one- and two-factor area models, partial products, the standard algorithm, estimate checks, fact families, long division, quotient estimation, and both remainder interpretations.
- Kept both concepts in every lesson visually distinct.
- Rewrote all 32 concept bodies and narrations to explain the mathematics carried by the visible representation; narration remains exactly synchronized with visible text.
- No shared figure or renderer work was required.

### Progression and distinct question jobs

- Reframed every second interaction as a claim test rather than a repeat of the first construction.
- Replaced all 13 queued normalized repetitions with distinct decomposition, missing-value, place-value, regrouping, inverse-operation, contextual transfer, or remainder-interpretation jobs.
- The authoritative detector's three same-sitting signatures are now unique within every lesson: stable widget payload, exact prompt, and number-normalized prompt.
- Replaced generic “Try it,” “Try it again,” “One more, for the road,” and “You did it” directions with explicit Grade 4 actions and transfer prompts.
- Corrected two division lesson titles that had been labeled only as “by one digit,” making the operation explicit.

### Choice integrity and truthful feedback

- Repaired the queued `g4m-03-03/k2` surface with four parallel questions whose lengths differ by at most 2 characters.
- Audited all 19 authored MCQs and rebuilt 15 cue-prone, duplicated, or semantically ambiguous surfaces.
- Maximum option-length spread across the complete course is now 12 characters.
- Every MCQ has one defensible answer, unique misconception feedback, preserved answer ID `o0`, and the legacy answer-first source contract. The shipped seeded shuffle was tested over 32 seeds per item; every correct answer reaches all four displayed positions.
- Removed a second defensible answer from the `29 × 19` area-model item and from the division inverse-check item.

### Semantic correctness beyond the queue

- The semantic audit found eight `columnCalc` surfaces that falsely announced the unrelated addition `24,681 + 13,247 = 37,928` after multiplication.
- Each surface now reports its own multiplication equation and product: `1,342 × 3`, `487 × 6`, `84 × 6`, or `213 × 4`.
- All eight fallbacks now describe multiplication and regrouping rather than addition.
- Area-model, estimate-slider, and number-line feedback was checked against its stable target, factor, or hop contract.

### Independent-assessor truth ratchet

- Replaced multiplication-family CML across all 48 CML-bearing steps in the eight division/remainder lessons with division-specific action goals, invariants, misconceptions, representation translations, and counterfactuals.
- Replaced 21 main and 4 remedial numeric fallbacks with evaluator-aligned division, quotient, or remainder reasoning.
- Corrected the four-digit-dividend magnitude claim, quotient-as-items-per-group language, the 2,437 benchmark description, the 900 ÷ 3 feedback, and one singular noun.
- Reframed both broad-factor estimate sliders in `g4m-02-04` as approximate size checks before the exact quotient 213; neither surface now claims that the slider proves exactness.
- Replaced zero-attachment rules with place-value scaling, including the case where a basic-fact product such as 5 × 2 = 10 creates an additional trailing zero.
- Scoped `g4m-01-03/k1`, `k2`, and `ch1` to place-by-place partial products; only the genuine tens-by-tens item retains nonzero-digit scaling.
- Replaced the course-local S196 positional prompt parser with fixed reviewed numeric-answer and MCQ-label contracts, so clearer question wording no longer breaks the regression while evaluator and engine checks remain intact.

## Evaluator-preservation proof

An automated comparison against `HEAD` found zero changes to:

- lesson or step IDs;
- widget types;
- numeric answers, tolerances, or units;
- area target, bounds, starts, square flag, or required factors;
- estimate target, range, start, step, or acceptance factor;
- column operation, operands, or decimal-place count;
- number-line range, start, step, hop count, or direction;
- MCQ option ID → correctness mapping.

The changes are therefore concept representation, wording, option construction, feedback, question jobs, and two corrected titles rather than evaluator drift.

## Queue-compatible before → after

| Workstream | Before | After this source wave | Closure condition |
|---|---:|---:|---|
| `LESSON_PROGRESSION_AND_DUPLICATION` | 13 | **0 live causes** | Ordinary shared queue regeneration removes all 13. |
| `CHOICE_SURFACE_INTEGRITY` | 1 | **0 source causes; 1 stale audit row** | Re-run `scripts/audit/mcq-leakage.mts --write`, then regenerate the queue. |
| `ILLUSTRATION_REPLACEMENT` | 32 | **0 source causes; 32 stale audit rows** | Refresh `reports/vis/VIS01_PLACEMENTS.csv`, then regenerate the queue. |
| `VISUAL_FIRST_REPRESENTATION` | 16 | 16 | Requires independent calibrated visual dispositions. |
| `GRADE_LANGUAGE_REVIEW` | 16 | 16 | Requires independent Grade 4 language decisions. |
| `LESSON_COMPLETE_DISPOSITION` | 16 | 16 | Requires independent whole-lesson decisions on the new source hashes. |

The current shared queue intentionally remains at 94 because this worker did not edit shared derived artifacts. Ordinary live-detector regeneration produces **94 → 81**. Refreshing the MCQ and VIS01 source audits before regeneration produces **81 → 48**. The remaining 48 rows are assessor-controlled rather than implementer-self-closed.

## Verification

- Course-local legacy and aggregate regressions: 26/26 passed across 2 files.
- Content schema: 1,840/1,840 passed.
- Whole-corpus pedagogy: 1,711/1,711 files clean.
- Strict CML: 0 errors, 0 warnings.
- Targeted ESLint: passed.
- Evaluator, step-ID, and MCQ-correctness drift checks: 0 findings.
- Course-local diff whitespace and retired-copy checks: passed.
- Whole-repository TypeScript: passed (`tsc --noEmit`).

## Remaining blockers

1. `g4m-02-04` retains its legacy `estimateSlider` with `acceptFactor: 2`; its language is now truthful about broad acceptance, but an exact partial-quotient construction would require a future interaction-type change.
2. Independent assessor decisions must be created against the new lesson hashes, then appended through the shared decision authority.
3. The MCQ leakage and VIS01 placement audits must be refreshed so 33 repaired source causes stop appearing as stale audit rows.
4. Shared queue, cards, and cache must be regenerated by the integration owner after concurrent source waves settle.
5. Representative browser evidence should confirm semantic figure visibility, column controls, slider ranges, number-line hops, option wrapping, keyboard/touch behavior, and narrow-view layouts on the final candidate build.
