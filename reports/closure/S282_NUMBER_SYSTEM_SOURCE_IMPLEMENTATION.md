# S282 — Number System source implementation

## Scope and disposition

- Course: `number-system`; the course tree was clean and collision-checked before the packet began. The shared working tree contained only unrelated `src/lib/schema.ts` and `src/lib/plotPointLabelContract.s282.test.ts` work, which this packet does not touch.
- Live source queue baseline: **70** rows — **12 P0** and **58 P1**.
- Source-verifiable causes repaired: **22/22** concrete queue causes — **12 P0** and **10 P1**. The eight progression rows span nine distinct learner jobs because `PROGRESSION-ns-02-03` names both `k3` and `ch1`.
- No queue, review-card, cache, ledger, runtime, shared registry, or generated artifact was modified.

## Exact source closures

| Queue cause | Rows | Source repair |
| --- | ---: | --- |
| `ILLUSTRATION_REPLACEMENT` | 11 P0 | Six concept bodies now exactly match their retained registered figures: `fm-divide-unit`, `ns-flip-multiply`, `dop-pad-borrow`, `dop-count-places`, `ns-opposites`, and `ns-abs-compare`. Five numerically or conceptually mismatched bindings were safely withheld rather than shown: `ns-01-02/c2`, `ns-01-03/c1`, `ns-01-03/c2`, `ns-02-03/c2`, and `ns-05-03/c2`. |
| `QUESTION_DIVERSITY_AND_TRANSFER` | 1 P0 | `ns-04b-01/i1` and `i2` now carry the existing `ordered-pair-signs` concept tag, so its two evaluator-safe `plotPoint` interactions are attributed as assessment evidence alongside its MCQs. |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 8 P1 | Nine targeted steps now have distinct learner jobs: model a cut, audit a simplification, verify a quotient, estimate before subtraction, make a divisor whole, decide whole-quotient status, use a containment shortcut, audit the zero boundary, and benchmark before comparison. Evaluator types and truth stay unchanged. |
| `CHOICE_SURFACE_INTEGRITY` | 2 P1 | `ns-03-03/k2` and `ns-04-03/k3` retain stable option IDs, one correct option, and diagnostic feedback while their visible labels are concise and structurally parallel. |

### Explicit remaining visual asset debt

The five withheld bindings above remain explanation-first until a new exact semantic figure is authored. This packet deliberately does not replace them with a merely related static exemplar. That avoids a learner-visible numerical or conceptual contradiction while retaining the lesson explanation and its evaluator contract.

### Assessor-controlled residuals

**48 P1** rows remain open and are not self-closed:

- 16 `GRADE_LANGUAGE_REVIEW`
- 16 `LESSON_COMPLETE_DISPOSITION`
- 16 `VISUAL_FIRST_REPRESENTATION`

These require independent review/disposition rather than inference from a source patch.

## Regression and reproducibility

- Guarded repair: `node scripts/session/s282-number-system-course-repair.mjs`
  - initial run: 14 lesson files / 37 guarded source fields changed
  - second run: 0 lesson files / 0 fields changed
- Focused regression: `npm exec vitest -- run src/lib/session282.numberSystemCourse.test.ts` — **5/5 passed**.
- Registration: `npm run check:registration` — **passed**.
- Content schema: `npm run validate:content` — **1711/1711 clean**.
- Pedagogy: `npm run lint:pedagogy` — **1711/1711 clean**.
- Strict CML: `npm run cml:lint:strict` — **0 errors, 0 warnings**.
- CML integration: `npm run cml:integration` — **18 flagship pilots, 91 direct-engine profiles, 1701 lesson JSON files parsed**.
- Scoped lint: `npm exec eslint -- scripts/session/s282-number-system-course-repair.mjs src/lib/session282.numberSystemCourse.test.ts` — **passed**.
- Scoped `git diff --check` — **passed**.
- TypeScript status at this source seal: blocked by unrelated active shared work in `src/components/widgets.registry.test.ts:11` (`WidgetSpec.options` accessed on a `ZodEffects`, plus an implicit `any`). The S282 test and all course-local gates are clean; no shared-file fix is included here.

Source seal: `b915b066457e8cf28edaee9ce19f9ae20de53633e3711a4ffa70ba4b5fa7cbec` (SHA-256 over the 14 sorted changed lesson paths using `/`, file bytes, and NUL delimiters).
