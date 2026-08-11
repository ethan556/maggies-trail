# Premium Experience Rebuild — S229 Wave C Batch 2

## Outcome

S229 remediates the next frequency-weighted group of MCQ blind-guess risks without changing curriculum answers, distractor misconceptions, authored feedback, grading, lesson order, or progression.

- Starting queue: 675 of 3,293 authored/remedial MCQ moments.
- Selected evidence: six foundational prompts repeated four times each across Grades 2, 4, and 5.
- Changed surface: the keyed option label only.
- Batch result: all 24 selected rows now pass and are classified KEEP.
- Remaining queue: 651 rows.
- Cumulative Wave C result: 46 of the original 697 rows remediated.

## Selected families

| Family | Grade | Rows | Keyed label after remediation |
|---|---:|---:|---|
| Decimal place alignment | 5 | 4 | Matching place values line up |
| Equal sharing as a fraction | 5 | 4 | 3/4 of a sandwich each |
| Visual fraction division | 5 | 4 | 12 fourths fit in 3 wholes |
| Estimating division by one third | 5 | 4 | About 15 because each whole has 3 thirds |
| Part–whole reasonableness | 2 | 4 | No because 30 is less than the 32 m part |
| Multistep estimate comparison | 4 | 4 | 386 is reasonable because it is near 400 |

The 24 rows are authored or remedial checks in 12 lesson files. The explanatory reasoning remains in the existing post-selection feedback instead of making the correct option uniquely long or uniquely punctuated.

## Preservation evidence

1. The diff changes exactly 24 keyed labels in the 12 lesson JSON files.
2. Every `correct: true` marker is unchanged.
3. Every wrong option label is unchanged.
4. Every correct and incorrect feedback string is unchanged.
5. All 12 edited lesson files parse as JSON.
6. The regenerated audit records zero REMEDIATE decisions among the 24 selected rows.

## Regenerated artifacts

- `MCQ_DISTRACTOR_AUDIT.csv`
- `MATH_TYPESETTING_AUDIT.csv`
- `PREMIUM_REBUILD_BASELINE.md`

The math audit changed only where the shortened `3/4` labels are recorded. No direct-manipulation, prediction, visual, or engine decision changed.

## Verification

- TypeScript typecheck: PASS.
- Course-specific Vitest: PASS, 65/65 across four files.
- CML integration: PASS; 18 pilots, 91 direct-engine profiles, 1,701 lesson files.
- Math-format verifier: PASS.
- Engine registration: PASS, 127/127.
- Visual explanations: PASS, 3,684/3,684.
- Production Next.js build: PASS, 57 routes.
- Offline production dependency audit: PASS, 0 vulnerabilities.
- JSON parse: PASS, 12/12 edited lessons.
- Git diff check: PASS.
- Content schema and pedagogy commands: blocked before project code by the retained Windows `uv_os_get_passwd` / `ENOMEM` host failure.
- Playwright smoke: browser-server orchestration timed out on this Windows host; its API-only test passed and no project assertion failure was returned for the two page tests before timeout.

## Session archive

`maggies-trail-session-229.tar.gz` is sealed outside the repository and excludes `.git`, `node_modules`, `.next`, `test-results`, and `playwright-report`. Its final size, entry count, and SHA-256 are recorded in the session handoff.

Wave C remains active. Batch 3 should continue with repeated, high-harm prompt families rather than treating the heuristic as automatic rewrite authority.
