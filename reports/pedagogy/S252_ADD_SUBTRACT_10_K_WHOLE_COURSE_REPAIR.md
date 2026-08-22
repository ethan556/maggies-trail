# S252 Add/Subtract Within 10 K Whole-Course Repair

Status: implemented; visual evidence and lesson authority pending serial reconciliation.

- Baseline: 94 rows across 20 lessons.
- Replaced the remaining 20 chapter-three generic figures with exact registered story/fact representations.
- Preserved the already-approved chapter-one and chapter-two visual canaries.
- Eliminated all 14 live progression/duplication causes through distinct response jobs and question stems.
- Normalized numeric feedback to the authored evaluator truth.
- Source-controlled closures expected after regeneration: 20 illustration + 14 progression rows.
- Human-authority rows: 60 generic dispositions; any REVISE verdict retains explicit implementation debt.

The idempotent source contract is `scripts/audit/repair-add-subtract-10-k-s252.mjs --check`; the exhaustive regression is `src/lib/session252.addSubtract10KCourseIntegrity.test.tsx`.
