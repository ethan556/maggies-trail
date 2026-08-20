# S316 Lane A (koa-mf3) Revision Implementation

Worker: implementation lane for add-subtract-10-k (koa-01-01..koa-03-10) and mult-fluency-g3
(mf3-02-01, mf3-03-01, mf3-03-03, mf3-03-06).

Authority read first (byte-for-byte): `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`.

Result: 0 lessons revised, 24 lessons rejected. No lesson JSON files were edited.

## add-subtract-10-k (20 lessons — all REVISE, all rejected)

Every lesson in this course has decision `REVISE` at recordId `S252-KOA-<lessonId>-lfnorm`, all
sharing one rationale pattern: "REVISE remains because its remedial route is immediate
same-family practice rather than a distinct misconception diagnosis."

Verification performed before rejecting: dumped every lesson's `remedials[0].check.widget` and
compared it against every main-step `widget.prompt` in the same lesson. In all 20 lessons the
remedial check's prompt, numbers, `commonErrors`, and feedback are word-for-word identical to the
lesson's first main check step (e.g. koa-01-01's remedial check is byte-identical to step `k1`:
"One group has 3 blocks. Another group has 2 blocks..."). This confirms the rationale's finding is
real and not stale.

The referenced pedagogy report (`reports/pedagogy/S252_ADD_SUBTRACT_10_K_WHOLE_COURSE_REPAIR.md`,
13 lines) documents figure and progression-duplication repairs already implemented, but says
nothing about what the corrected remedial content should be — it does not name a target
misconception, a diagnostic question design, or replacement numbers per lesson.

Turning "immediate same-family practice" into "a distinct misconception diagnosis" is not a
mechanical edit: it requires deciding, per lesson, which of the lesson's misconceptions the
remedial should isolate and how to build a check that actually diagnoses (rather than just
re-presents) that misconception. That is new, unplanned pedagogical judgment, which the worker
contract requires stopping for rather than inventing:

> "If a decision is ESCALATE, or the rationale demands new mathematics, a missing exact visual you
> cannot construct faithfully, or any judgment you cannot make safely: DO NOT edit that lesson.
> Record a rejection with the reason."

Rejected, not implemented: koa-01-01, koa-01-02, koa-01-03, koa-01-04, koa-01-05, koa-02-01,
koa-02-02, koa-02-03, koa-02-04, koa-02-05, koa-03-01, koa-03-02, koa-03-03, koa-03-04, koa-03-05,
koa-03-06, koa-03-07, koa-03-08, koa-03-09, koa-03-10.

## mult-fluency-g3

### mf3-02-01 — REVISE, rejected

recordId `S248-MF3-mf3-02-01-lfnorm`. Rationale: both concept steps (`c1`, `c2`) reuse figure
`mult3-double-double`, whose rendered sequence stops at 4 × 6 = 24 and never performs the extra
doubling to 8 × 6 = 48 that the ×8 lesson needs, so a semantic ×8 visual is required.

Verified in `src/components/figures.tsx`: `Mult3DoubleDouble()` (line 4210) is a static SVG with
no props, hardcoded to "4 × 6: double 6 → 12" / "double 12 → 24" / "double twice = × 4". It cannot
represent 8 × 6 = 48. Checked the full figure registry (`grep "mult3-"`, lines 29905/30162-30187)
for any existing registered figure id that already performs the second doubling to 48 or otherwise
matches; none exists.

Fixing this requires adding or modifying a figure component in `src/components/figures.tsx`. That
file is outside this worker's edit scope ("Edit ONLY lesson JSON files inside your assigned
courses under content/courses/<course>/lessons/"). Rejected as a missing exact visual that cannot
be constructed faithfully within scope — flagging for a worker with figures.tsx write access.

### mf3-03-01, mf3-03-03, mf3-03-06 — not REVISE, rejected

Latest lesson-disposition records for all three are decision `ESCALATE`
(recordIds `S248-MF3-mf3-03-01-lfnorm`, `S248-MF3-mf3-03-03-lfnorm`, `S248-MF3-mf3-03-06-lfnorm`).
Per workflow step 1 ("Act only if decision is REVISE"), no edit was attempted; logged as rejected
with reason "decision is ESCALATE, not REVISE".

## Files touched

- `reports/closure/cowork-staging/laneA-koa-mf3.jsonl` — created, 24 NDJSON lines (all
  `rejected: true`), parse-checked with `json.load` per line.
- `reports/closure/S316_LANEA_KOA_MF3_REVISION_IMPLEMENTATION.md` — this file.
- No files under `content/courses/` were modified.

## Escalation

All 24 assigned lessons need a follow-up owner:

- The 20 `add-subtract-10-k` lessons need a human/pedagogy decision specifying, per lesson, the
  target misconception and diagnostic remedial design before a worker can implement it safely.
- `mf3-02-01` needs a worker (or session) with write access to `src/components/figures.tsx` to add
  a ×8-specific double-double figure (or extend `Mult3DoubleDouble`) before the lesson JSON's
  figure reference can be corrected.
- `mf3-03-01`, `mf3-03-03`, `mf3-03-06` are ESCALATE, not REVISE — they belong to whatever queue
  handles ESCALATE dispositions, not this REVISE-implementation lane.
