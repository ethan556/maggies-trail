# S248 — Grade 3 multiplication fluency whole-course V4 repair

## Scope and authority boundary

- Course: `mult-fluency-g3`
- Lessons audited and repaired: 18 of 18 (`mf3-01-01` through `mf3-03-06`)
- Authoritative live-queue portfolio before this wave: 90 rows.
- Stable lesson IDs, step IDs, widget types, interactive targets, numeric answers, tolerances, ranges, option correctness, and CML contracts were preserved.
- No shared queue, review-card, cache, decision-ledger, standards, generator, evaluator, renderer, or figure-registry file was edited.
- This is implementation evidence. The 54 assessor-controlled dispositions remain independent decisions against the repaired lesson hashes.

## Audit-first result

| Workstream | Before | Classification |
|---|---:|---|
| `ILLUSTRATION_REPLACEMENT` | 36 | Mechanical P0 source defects: both concepts in every lesson used the unrelated fixed `bar-compare` exemplar. |
| `VISUAL_FIRST_REPRESENTATION` | 18 | Assessor-controlled P1 review. |
| `GRADE_LANGUAGE_REVIEW` | 18 | Assessor-controlled P1 review. |
| `LESSON_COMPLETE_DISPOSITION` | 18 | Assessor-controlled P1 review. |
| **Total** | **90** | 36 mechanical source causes; 54 independent dispositions. |

The whole-course audit also found three learner-facing language defects outside the mechanical illustration rows:

1. the ×10 lesson described place-value scaling as digits mechanically shifting;
2. the ×7 lesson said the facts had no easy pattern without acknowledging useful known-fact strategies;
3. the stubborn-facts lesson claimed those facts resist every pattern.

All three were repaired in visible text and synchronized narration. The ×10 remedial explanation and recap takeaway were repaired as well.

## Implemented visual root-cause repair

| Lesson | Concept figure after repair | Representation job |
|---|---|---|
| `mf3-01-01` | `mult3-double` | ×2 as doubling |
| `mf3-01-02` | `mult3-equal-groups` | ×3 as equal groups |
| `mf3-01-03` | `mult3-double-double` | ×4 as two doubles |
| `mf3-01-04` | `mult3-fives` | ×5 product pattern |
| `mf3-01-05` | `mult3-break-apart` | ×6 from known partial facts |
| `mf3-01-06` | `mult3-break-apart` | ×7 from known partial facts |
| `mf3-02-01` | `mult3-double-double` | ×8 from repeated doubling |
| `mf3-02-02` | `mult3-nines` | ×9 near-ten pattern |
| `mf3-02-03` | none by design | Each concept is immediately followed by its synchronized manipulable ×10 area model. |
| `mf3-02-04` | none by design | Each square-fact concept is immediately followed by its synchronized manipulable square array. |
| `mf3-02-05` | `mult3-mult-table` | stubborn facts in the multiplication table |
| `mf3-02-06` | `mult3-break-apart` | deriving an unknown fact |
| `mf3-03-01` | `mult3-mult-table` | mixed facts through ×5 |
| `mf3-03-02` | `mult3-mult-table` | mixed facts through ×9 |
| `mf3-03-03` | `mult3-mult-table` | table-wide fluent retrieval |
| `mf3-03-04` | `mult3-missing-factor` | missing-factor reasoning |
| `mf3-03-05` | `mult3-fact-family` | multiplication/division fact families |
| `mf3-03-06` | `mult3-mult-table` | whole-table consolidation |

This closes the source cause for all 36 queued placements:

- 32 placements now use an already registered Grade 3 multiplication semantic figure;
- four redundant fixed figures were removed, because the very next learner action is the exact synchronized `areaModel` representation;
- zero `bar-compare` placements remain in the course;
- concept body and narration remain exactly synchronized;
- every retained figure ID is registered and multiplication-specific.

No renderer change was needed. Removing the four redundant illustrations is intentional visual-first design: it avoids presenting a second, unrelated fixed numeric example immediately before the learner manipulates the target array.

## Mathematical and language repairs

- Replaced “digits shift left” with the place-value statement that multiplying a whole number by 10 makes every digit worth ten times as much; the zero records an empty ones place.
- Reframed ×7 facts around decomposition into known facts rather than a claim that no useful pattern exists.
- Scoped the stubborn-facts claim to the absence of one quick table pattern and retained deliberate practice as the learner action.
- Aligned worked figure examples to their adjacent explanation: doubling, double-double, ×6/×7 break-apart, missing factor, and fact family.
- Preserved all interactive and evaluator mathematics. No answer, tolerance, factor, target, range, option-correctness, or widget-type field changed.

## Queue-compatible before → after

| Workstream | Before | After this source wave | Closure condition |
|---|---:|---:|---|
| `ILLUSTRATION_REPLACEMENT` | 36 | **0 source causes; 36 stale VIS01 rows** | Refresh `reports/vis/VIS01_PLACEMENTS.csv`, then regenerate the shared queue. |
| `VISUAL_FIRST_REPRESENTATION` | 18 | 18 | Independent calibrated visual dispositions against repaired source hashes. |
| `GRADE_LANGUAGE_REVIEW` | 18 | 18 | Independent Grade 3 language decisions against repaired source hashes. |
| `LESSON_COMPLETE_DISPOSITION` | 18 | 18 | Independent whole-lesson decisions against repaired source hashes. |

The shared queue intentionally remains at 90 because this worker did not mutate derived authority. An ordinary VIS01 refresh plus queue regeneration produces **90 → 54**. The 54 remaining rows are decisions, not unresolved mechanical defects.

Exact authoritative identity sets use the lesson set {mf3-01-01..mf3-01-06, mf3-02-01..mf3-02-06, mf3-03-01..mf3-03-06}:

- source-closed after VIS01 refresh: VIS-{lesson}-c1-bar-compare and VIS-{lesson}-c2-bar-compare (36 IDs);
- remaining: LANGUAGE-{lesson}, VISUAL-DISPOSITION-{lesson}, and LESSON-{lesson} (54 IDs).

Implementation-side recommendations for the independent assessor are:

- `VISUAL_FIRST_REPRESENTATION`: `SUFFICIENT` for all 18 lessons, because each concept now has a topic-aligned semantic figure or is immediately followed by the exact manipulable array;
- `GRADE_LANGUAGE_REVIEW`: `FIT` for all 18 lessons after the three scoped language repairs;
- `LESSON_COMPLETE_DISPOSITION`: `KEEP` for all 18 lessons, subject to independent review of the new lesson hashes.

These recommendations are not self-authored closure decisions.

## Regression and reproducibility

- Guarded repair script: `scripts/audit/repair-mult-fluency-g3-s248.mjs`
- Idempotence check: `node scripts/audit/repair-mult-fluency-g3-s248.mjs --check`
- Aggregate regression: `src/lib/session248.multFluencyG3CourseIntegrity.test.ts`
- The regression locks the exact 18-lesson portfolio, schema/pedagogy validity, nine-step concept-action-check progression, both `areaModel` interactions per lesson, remedial presence, all 36 concept-placement outcomes, figure registration, synchronized narration, truthful ×10 language, and removal of the two audited overclaims.

## Verification

- Guarded repair idempotence: 18/18 lessons verified.
- Course-local oracle plus aggregate regression: 44/44 passed across 2 files (aggregate: 6/6).
- Content schema: 1,840/1,840 files clean.
- Whole-corpus pedagogy: 1,711/1,711 files clean.
- Strict CML: 0 errors, 0 warnings.
- Targeted ESLint and scoped diff whitespace: passed.
- Whole-repository TypeScript: passed (`tsc --noEmit`).

## Remaining integration work

1. Refresh VIS01 after concurrent source waves settle, then regenerate the shared queue; this removes the 36 stale illustration rows.
2. Obtain independent visual, grade-language, and complete-lesson dispositions against the repaired hashes.
3. Regenerate shared cards/cache only from the serialized authority after those decisions are appended.
4. On the final deployed candidate, sample ×10 place-value language, ×6/×7 break-apart figures, missing-factor/fact-family figures, square arrays, keyboard/touch interaction, narrow viewports, and reduced-motion behavior.
