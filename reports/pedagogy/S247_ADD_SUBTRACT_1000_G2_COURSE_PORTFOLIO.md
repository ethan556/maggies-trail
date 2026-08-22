# S247 add/subtract within 1,000 — complete Grade 2 course portfolio

## Outcome

All 16 lessons in `add-subtract-1000-g2` now have distinct question jobs, concise Grade 2 language, and concept-specific visual representations. Stable course, lesson, step, option, concept, and generator identifiers were preserved. No shared renderer, widget, schema, queue, card, cache, or ledger file was changed.

## Queue-compatible result

The authoritative S247 portfolio baseline contains 96 rows: 48 P0 and 48 P1.

| Workstream | Before | Mechanically eligible after source-audit regeneration | Remaining authority |
| --- | ---: | ---: | --- |
| `ILLUSTRATION_REPLACEMENT` | 32 | 0 | None: every queued c1/c2 placement now names a registered, rendered, text-aligned semantic figure. |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 16 | 0 | None: every lesson now has unique widget payloads, exact prompts, and number-normalized prompt jobs. |
| `GRADE_LANGUAGE_REVIEW` | 16 | 16 | A current signed lesson-review decision is required by the S246 bridge. |
| `LESSON_COMPLETE_DISPOSITION` | 16 | 16 | A current signed lesson-review decision is required by the S246 bridge. |
| `VISUAL_FIRST_REPRESENTATION` | 16 | 16 | A current signed lesson-review decision is required by the S246 bridge. |
| **Total** | **96** | **48** | **48 P1 review rows remain; P0 falls from 48 to 0.** |

The checked-in queue and VIS01 placement CSV are shared derived artifacts and were intentionally not regenerated in this packet. Their 48 obsolete P0 rows should disappear when the root-controlled serial audit/queue materialization runs. Implementation is not presented as authority for the remaining 48 human-review rows.

## Visual-first repair

The fixed `count-on-hops` exemplar was removed from all 32 main concept placements. Each lesson now uses one existing semantic renderer appropriate to its concept, including skip-count lines, base-ten decomposition and regrouping, zero-borrow cascades, value-preserving trades, number-line jumps, and strategy selection. The same representation is available in the lesson's remedial concept, producing 48 visible concept/remedial bindings in total.

The focused rendered regression verifies for every lesson that both concept moments and the remedial moment use the expected registered figure, that the concept text is aligned with the figure contract, and that server-rendered output contains a titled SVG with `role="img"`.

## Progression, language, and truth repair

- Replaced all 16 byte-identical second interactions with new targets or representations.
- Separated practice jobs through exact calculation, new-number transfer, misconception analysis, story modelling, explanation, prediction, and challenge prompts.
- Corrected lesson-job faults in subtraction, breaking-ten, breaking-hundred, across-zero, and compensation checks.
- Made the Grade 2 operation explicit in two story prompts so both the learner and the independent arithmetic oracle can derive the intended result.
- Replaced metaphors and adult idioms with short literal language; removed singular/plural faults such as `1 ones` and `1 hundreds`.
- Preserved unique semantic option IDs and misconception-specific feedback; runtime display shuffling remains the existing consumer's responsibility.

## Deterministic assurance

- `npx vitest run src/lib/session194.addSubtract1000.test.ts src/components/session247.addSubtract1000G2Course.test.tsx`: **23/23 passed**.
- `npm run validate:content`: **1,840/1,840 passed**.
- `npm run lint:pedagogy`: **1,711/1,711 clean**.
- `npm run cml:lint:strict`: **0 errors, 0 warnings**.
- `npm run typecheck`: passed.
- Targeted ESLint for the new regression: **0 errors, 0 warnings**.
- Scoped `git diff --check`: passed.

## Remaining blocker

The only course rows not source-mechanically closable are the 48 generic P1 review rows. The lesson-review bridge deliberately requires a fresh, current signed human decision; this packet does not manufacture or append such authority.
