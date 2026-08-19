# S247 how-many-k flash-count truth repair

Status: **PASS**

## Scope

This packet repairs only the high-consequence learner-visible truth mismatch in the four authored `subitizeFlash` surfaces in `khm-03-05` and `khm-03-06`. It does not address the course's illustration or progression backlog and does not edit the shared pending queue, lesson cards, cache, decision ledger, generator implementation, widget implementation, schema, evaluator, or CML metadata.

## Defect and repair

The SVG dot pattern, its accessible name, answer options, `subitizeFlash.count`, and evaluator target were already driven by the same count. Four copied fallback/success strings instead asserted that every flash contained five dots, including two ten-frame items that also called the visual a dice face.

| Lesson / step | Arrangement | Evaluator and displayed count | Previous miss / success claim | Repaired claim |
|---|---|---:|---|---|
| `khm-03-05/k2` | dice | 3 | 5 / 5 | 3 / 3 |
| `khm-03-05/ch1` | dice | 4 | 5 / 5 | 4 / 4 |
| `khm-03-06/k2` | ten-frame | 4 | 5 / 5, “dice face” | 4 / 4, ten-frame wording |
| `khm-03-06/ch1` | ten-frame | 4 | 5 / 5, “dice face” | 4 / 4, ten-frame wording |

Post-repair lesson hashes:

- `khm-03-05.json`: `ee439314f8d6411882306ee6603cf406743aac74981a3d4164757696eabf2b84`
- `khm-03-06.json`: `fcd5c0c45c3c9d17d4a2c716d42fa857cde025e97f6c79db7ee1b6c08764706`

## Root-cause surface audit

- **Authored lesson data:** all four affected checks use the correct `count`, options, near-miss feedback, and variant binding. Only `missFeedback` and `successFeedback` had drifted.
- **Generated practice:** `g0-counting/countObjectsFlash` and `countReadFlash` both call the shared `subitize` builder, which derives `answer`, options, common-pick diagnoses, miss feedback, and success feedback directly from the generated `count`. No generator source repair was needed.
- **Evaluator and reveal:** `evaluate` accepts only `value === spec.count`; `correctAnswerText` returns that same count. A wrong option receives its matching common-pick diagnosis or the repaired fallback.
- **Visible and accessible representation:** `SubitizeFlashW` calls `dotPositions(spec.count, spec.arrangement)`, labels the revealed SVG as `${spec.count} dots`, titles it as a pattern of that count, and uses `spec.count` for the revealed target ghost. The ten-frame items now name the ten-frame rather than a dice face.
- **Schema:** `SubitizeFlashSpec` requires the true count to occur in the distinct options. Both repaired lessons remain schema-valid.

The root cause was therefore four stale authored strings, not evaluator, renderer, schema, or generator behavior. The smallest safe repair changes only those strings.

## Focused regression

`src/components/session247.howManyFlashCountTruth.test.tsx` seals the packet with four tests:

1. exact lesson/step/count/arrangement/form inventory for all four authored surfaces;
2. evaluator, correct-answer text, success, fallback, and every wrong-option feedback path agreeing with `count`;
3. rendered prompt plus visible/accessibility SVG name and revealed target ghost agreeing with the same count;
4. 240 deterministic generated cases—two forms × three bands × forty seeds—preserving answer/count/feedback truth, plus schema and pedagogy validity for both lessons.

Regression SHA-256: `b0d083a8864ce2e35be56d38dca83434c2894ce72f5e142484b6cdd83a3cf108`.

## Verification

| Gate | Result |
|---|---|
| `npx vitest run src/components/session247.howManyFlashCountTruth.test.tsx` | PASS — 1 file, 4 tests |
| `npm run validate:content` | PASS |
| `npm run lint:pedagogy` | PASS — 1711 / 1711 files clean |
| `npm run cml:audit` | PASS — 1701 lessons audited |
| `npm run cml:lint:strict` | PASS — 0 errors, 0 warnings |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 errors; 450 pre-existing repository warnings |
| `git diff --check` on scoped files | PASS |

`CML_AUDIT.json` is a generated repository-wide artifact. The required audit refreshed it, but that broad generated diff is not part of this narrow packet and was restored to its pre-run content.

## Closure boundary

The four flash-count feedback contradictions are repaired. This packet intentionally leaves the course's 32 illustration/progression rows and every shared review/queue artifact untouched. Any later change to `subitizeFlash`, the two generator forms, either repaired lesson, or variant resolution must rerun the focused truth regression.
