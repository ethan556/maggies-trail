# S246 bounded lesson-review candidate append

## Safe append tool

`scripts/audit/append-lesson-review-candidates-s246.mjs` provides a bounded, reusable merge path from independently assessed candidate JSONL packets into the append-only lesson-review authority.

The tool:

- accepts one or more repository-local `.jsonl` packet paths;
- preserves command-line file order and line order;
- requires exact `lesson-disposition` fields from the ledger schema;
- rejects unknown lessons, historical or batch duplicate record IDs, and same-batch duplicate lesson IDs, while allowing a fresh unique record to supersede an older lesson review;
- caps a run at 20 files, 250 records, and 5 MiB;
- recomputes the live lesson/course, exact-MCQ-duplicate, and standards-edge basis through the shared authority helper;
- simulates the combined ledger and requires every target to resolve to `CURRENT_HUMAN_DECISION`;
- supports read-only `--check` and append-only default write modes.

## Applied batch

The dry-run passed before the same ordered batch was appended:

1. `COUNTING_TO_100_K_S246_LESSON_DISPOSITIONS.jsonl` — 18 records;
2. `S246_DECIMALS_INTRO_G4_TRIPLE_DISPOSITIONS.jsonl` — 18 records;
3. `S246_MULTIPLY_BIGGER_TRIPLE_DISPOSITIONS.jsonl` — 14 records.

Authoritative post-append resolution:

- history records: **50**;
- current decisions: **50**;
- stale: **0**;
- invalid: **0**;
- duplicate record IDs: **0**;
- unknown lessons: **0**;
- unique record IDs / lesson IDs: **50 / 50**.

Decision distributions:

| Dimension | Distribution |
|---|---|
| Whole lesson | KEEP 13; REVISE 37 |
| Visual | REQUIRED 31; PREFERRED 4; SUFFICIENT 15 |
| Grade language | FIT 36; REVISE 14 |

## Assurance

- focused bridge and append tests: **11/11 passed**;
- append-specific tests: **5/5 passed**;
- syntax check: passed;
- targeted ESLint: **0 errors, 0 warnings**;
- project typecheck: passed;
- scoped diff check: passed.

The shared pending queue, review-card artifacts, and cache were deliberately not regenerated in this lane. The 50 decisions remain uncommitted for root-controlled serial materialization.
