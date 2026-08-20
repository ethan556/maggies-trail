# S319 — Independent Verification: Early + Middle Grade Implementation Packets

Reviewer: Claude Cowork independent verifier (S319)
Reviewed at: 2026-08-20T13:17:59.000Z
Role: independent verification assessor, not implementer. No content file was edited by this
review. Writes: this report and
`reports/closure/cowork-staging/laneV-s319-early-mid-dispositions.jsonl` (26 records).

## Scope

26 lessons across two implementer packets:

- **Early (15)**: `S319_EARLY_GRADE_CONTRACTS.md` + `laneA-s319-early.jsonl` — the 9
  mult-div-fluency-g4 REVISE items from `S319_ASSESS_DIG4_MDF4.md` (g4m-01-03/04/05/06,
  g4m-02-03/04, g4m-03-01/02/03), the 5 how-many-k REVISE items and 1 counting-120 REVISE item
  from `S319_ASSESS_HMK_C120.md` (khm-01-04, khm-01-05, khm-02-05, khm-03-04, khm-03-06,
  c120-03-03).
- **Middle (11)**: `S319_MIDDLE_GRADE_CONTRACTS.md` + `laneA-s319-middle.jsonl` — ns-01-01,
  ns-05-01 (`S319_ASSESS_TSE_NS.md`); rr-05-03 (`S319_ASSESS_RR_MC.md`); asv-01-02, asv-02-03
  (`S319_ASSESS_ASV_PQ.md`); cx-01-03, cx-03-02, cx-03-03, cx-04-02, cx-05-03, sg-02-03
  (`S319_ASSESS_CP_SG.md`).

## Method

For every lesson: read the contract's REVISE section first, then read the current lesson JSON
and `git diff HEAD` against it directly (before reading either implementer claim doc), and
independently:

- Recomputed every changed arithmetic claim (products, partial products, quotients, remainders,
  carry-drop deltas, area/volume/lateral-surface values, percent/discount math, distance-formula
  values) by hand.
- Confirmed the specific defect named in the contract (byte-identical i1/i2 widgets, "wait:"
  scratch fragments, jargon leaks, label-length leaks, value/feedback mismatches, a false
  shared-destination framing, and — for sg-02-03 — a genuine math error) no longer reproduces in
  current source, with no collateral change outside the contract's named scope (verified via
  targeted `git diff` per file).
- Ran all 26 post-fix lesson JSONs through the actual `Lesson` Zod schema
  (`src/lib/schema.ts`) and the actual pedagogy linter (`lintLesson`, `src/lib/pedagogy.ts`) via
  `npx tsx` (no npm/vitest/tsc used, per instructions). **All 26 lessons: schema-valid, 0 lint
  errors.** This is a live re-check of the concept→check ≤2-step rule, the ≥60%-action-steps
  rule, the 1–3-takeaway recap rule, the K 25-word reading-profile cap, and the ≥25-char
  incorrect-feedback floor — not a claim taken on faith from either implementer report.
- For sg-02-03 specifically: independently re-derived the sheared-prism lateral area from first
  principles (cross products of the base edges with the shear vector), then additionally *ran*
  the lesson's own `exactNumberLab.approxFormula` through the real `evalApproxExpr` (via
  `npx tsx`) and confirmed it evaluates to exactly `200`, not just that the JSON tree looks
  correct.
- For g4m-03-01's slug rename: independently grepped `src/` for every consumer of `.slug` and
  confirmed lesson-level `slug` is never read by any route (routes key off `Course.slug`, e.g.
  `src/app/(shell)/courses/[slug]/page.tsx`) and no test enforces lesson-slug uniqueness (only
  per-lesson hardcoded-identity tests like `session244.multFluencyIdentity.test.ts` exist, scoped
  to a different course). Also confirmed the wider repo already contains several other duplicate
  lesson slugs across unrelated courses (e.g. `reading-a-picture-graph` ×3), further evidence the
  field is inert — the rename introduces no new risk and removes the one flagged collision.
- Read the implementer claim docs (`S319_EARLY_GRADE_CONTRACTS.md`, `laneA-s319-early.jsonl`,
  `S319_MIDDLE_GRADE_CONTRACTS.md`, `laneA-s319-middle.jsonl`) only after forming an independent
  view, then cross-checked their specific claims (e.g. the flagged-but-not-fixed `ns-01-01/k3`
  "wait" fragment) against source directly.
- Pulled review-basis hashes for all 26 lessons via `node scripts/session/print-review-basis.mjs
  <all 26 ids>` (bulk invocation).

## Verdict counts

**26/26 KEEP, 0 REVISE, 0 ESCALATE.** Every contracted defect was independently confirmed
resolved in current source, with correct arithmetic, no collateral damage, and clean
schema/pedagogy-lint validation.

| Lesson | Decision | Visual | Language |
|---|---|---|---|
| g4m-01-03 | KEEP | REQUIRED | FIT |
| g4m-01-04 | KEEP | REQUIRED | FIT |
| g4m-01-05 | KEEP | REQUIRED | FIT |
| g4m-01-06 | KEEP | REQUIRED | FIT |
| g4m-02-03 | KEEP | REQUIRED | FIT |
| g4m-02-04 | KEEP | REQUIRED | FIT |
| g4m-03-01 | KEEP | REQUIRED | FIT |
| g4m-03-02 | KEEP | REQUIRED | FIT |
| g4m-03-03 | KEEP | REQUIRED | FIT |
| khm-01-04 | KEEP | SUFFICIENT | FIT |
| khm-01-05 | KEEP | SUFFICIENT | FIT |
| khm-02-05 | KEEP | SUFFICIENT | FIT |
| khm-03-04 | KEEP | SUFFICIENT | FIT |
| khm-03-06 | KEEP | SUFFICIENT | FIT |
| c120-03-03 | KEEP | SUFFICIENT | FIT |
| ns-01-01 | KEEP | REQUIRED | FIT |
| ns-05-01 | KEEP | REQUIRED | FIT |
| rr-05-03 | KEEP | SUFFICIENT | FIT |
| asv-01-02 | KEEP | REQUIRED | FIT |
| asv-02-03 | KEEP | PREFERRED | FIT |
| cx-03-02 | KEEP | SUFFICIENT | FIT |
| cx-03-03 | KEEP | SUFFICIENT | FIT |
| cx-04-02 | KEEP | SUFFICIENT | FIT |
| cx-05-03 | KEEP | SUFFICIENT | FIT |
| cx-01-03 | KEEP | SUFFICIENT | FIT |
| sg-02-03 | KEEP | REQUIRED | FIT |

No non-KEEP verdicts — every fix independently verified sound. (visualDecision carried forward
from the originating assessment's classification since no visual/figure binding was touched by
any fix in this scope; gradeLanguageDecision now FIT everywhere a language defect was the
contracted issue and has been independently confirmed resolved.)

## Discrepancies / open debt (not fixed — correctly out of scope, recorded for the record)

1. **`ns-01-01` / step `k3`** — `explanationVariants[0]` still reads: *"Six eighths holds 3 pairs
   the size of 2/8 each — **wait, count directly**: 6/8 ÷ 2/8 asks how many 2/8-pieces fit in
   6/8, which is 3."* This is the same defect class as the `rr-05-03`/`asv-01-02`/`asv-02-03`
   "wait:" scratch-text fixes elsewhere in this same wave, but `k3` was never named in
   `S319_ASSESS_TSE_NS.md`'s `ns-01-01` contract (which only scoped the remedial value/feedback
   mismatch and the `k2` label-length leak). Confirmed via direct read of current source and via
   `git diff` (zero touch to `k3` in this session). The implementer's own report independently
   flagged the same fragment and left it untouched for the same reason. Recorded as open debt for
   a future contract, not fixed here.
2. **`g4m-02-03` / step `ch1` vs. `g4m-02-05` / step `k1`** (new finding from this verification
   pass, not previously flagged by either the original assessment or the implementer report): the
   two steps present the identical division fact (1,393 ÷ 7 = 199) with byte-identical `answer`,
   `commonErrors` values/feedback, `tolerance`, and `unit` — only the `prompt` framing differs
   ("A school shares 1,393 tickets..." vs. "Divide 1393 ÷ 7..."). This is the same
   accidental-repetition defect class the original `DIG4_MDF4` assessment flagged for i1/i2 pairs
   within a single lesson, but here it spans two different lessons and two different step kinds
   (`ch1` vs. `k1`), which the original assessor's duplication scan did not check for (their
   documented method was "every consecutive step pair," i.e. within-lesson only). Confirmed
   pre-existing and untouched by this implementation wave — `git diff` shows `g4m-02-05.json` has
   zero changes in this session, and `g4m-02-03.json`'s only change is the contracted `i2` fix.
   Not fixed here (outside every named contract for this task); flagged for a future packet.

## Raw data

- Dispositions: `reports/closure/cowork-staging/laneV-s319-early-mid-dispositions.jsonl` (26
  NDJSON lines, one per lesson, `recordId` = `S319-V2-<lessonId>`), all valid JSON.
- Basis hashes: `node scripts/session/print-review-basis.mjs <all 26 ids>` against current repo
  HEAD (working tree) at review time.
- Schema/lint probe: all 26 lesson JSONs parsed with the real `Lesson` Zod schema and the real
  `lintLesson` from `src/lib/schema.ts` / `src/lib/pedagogy.ts` via `npx tsx` (read-only,
  transient script, deleted after use) — 26/26 schema-valid, 26/26 zero lint findings.
- `sg-02-03` `evalApproxExpr` probe: the lesson's live `approxFormula`/`approxConstants` were fed
  through the real `evalApproxExpr` function via `npx tsx` — result `200` (exact match to the
  corrected answer).
- Slug-safety probe: `grep -rn "lesson.slug\|\.slug ===" src/` and inspection of
  `src/app/(shell)/courses/[slug]/page.tsx` confirm only `Course.slug` drives routing;
  `grep -rh '"slug"' content/courses/*/lessons/*.json | sort | uniq -c` confirms zero remaining
  slug collisions repo-wide after the `g4m-03-01` rename (and shows several pre-existing,
  unrelated duplicate lesson slugs elsewhere in the repo, e.g. `reading-a-picture-graph` ×3,
  `zero-and-negative-exponents` ×2 — corroborating that lesson-level slugs are not a uniqueness-
  enforced identity in this codebase).
- No `npm`, `vitest`, or `tsc` command was run. `npx tsx` was used only for read-only schema/lint/
  eval probes against a transient scratch script, which was deleted after each use; no content or
  source file was modified by this review.
