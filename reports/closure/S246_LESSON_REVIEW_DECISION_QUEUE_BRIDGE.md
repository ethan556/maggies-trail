# S246 lesson-review decision → queue/card bridge

## Outcome

The append-only `LESSON_REVIEW_DECISIONS_S244.jsonl` ledger now has one fail-closed authority path shared by the pending-work queue and lesson-review cards.

- A valid, current `KEEP`, `REVISE`, or `ESCALATE` record closes exactly three completed review rows: `LESSON_COMPLETE_DISPOSITION`, `VISUAL_FIRST_REPRESENTATION`, and `GRADE_LANGUAGE_REVIEW`.
- A current `KEEP` creates no implementation row.
- A current `REVISE` or `ESCALATE` creates exactly one `LESSON_REVISION_IMPLEMENTATION` row. Its evidence includes the signed `recordId`, rationale, lesson decision, visual decision, and grade-language decision.
- A stale hash, invalid enum/field, unknown lesson, or duplicated record ID closes nothing.
- Current cards publish explicit `CLOSED_BY_CURRENT_HUMAN_DECISION` statuses; queue-row absence is never presented as `MISSING_QUEUE_ROW` closure evidence.

## Single-source freshness contract

`scripts/audit/lesson-review-authority-s246.mjs` is now the sole executable source for:

1. live lesson and course source hashes;
2. exact current MCQ duplicate-cluster references;
3. current standards-edge references and explicit decision integrity;
4. the stable review-basis hash;
5. lesson-ledger validation and current/stale/invalid resolution;
6. the queue directive that distinguishes completed review work from implementation debt.

Both `consolidate-pending-workload-s236.mjs` and `lesson-review-cards-s244.mjs` consume this authority. The duplicate implementations formerly embedded in the card materializer were removed.

## Focused assurance

`src/lib/session246.lessonReviewDecisionBridge.test.ts` covers:

- current `KEEP`;
- current `REVISE`;
- stale basis hash;
- invalid decision enum;
- duplicate record ID affecting two lessons;
- independent lesson/course-source, duplicate-reference, and standards-reference basis changes;
- deterministic resolution;
- exact generic-review and revision-implementation row counts.

Gates run on the implementation:

- focused Vitest: **6/6 passed**;
- Node syntax checks: helper, queue materializer, and card materializer passed;
- targeted ESLint: **0 errors, 0 warnings**;
- project TypeScript check: passed;
- scoped `git diff --check`: passed.

## Materialization boundary

This packet does not append candidate human decisions and does not regenerate the shared queue, cards, or cache. Those artifacts remain a root-controlled serial materialization step after candidate decisions are independently validated and appended.
