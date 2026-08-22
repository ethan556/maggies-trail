# S290 — Data Line Plots Grade 2 Visual Repair

## Scope

This source-local packet repairs the seven P0 `single-scale-graph` placements identified in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` for `data-line-plots-g2`:

- `g2g-02-03/c2`
- `g2g-02-03` remedial `g2g-build-bar`
- `g2g-02-04/c1`
- `g2g-03-01/c1`
- `g2g-03-01` remedial `g2g-total-question`
- `g2g-03-02/c2`
- `g2g-03-03/c2`

Before repair, each returned `false` from `isFigureTextAligned(figure, body)`: the learner-facing prose explained a graph-reading procedure without naming the static graph's displayed values. The registered `single-scale-graph` renders cats = 3, dogs = 6, birds = 4, with one unit per gridline.

## Repair

Each caption and matching narration now states the shown bar values and the unit scale. Where the lesson asks for a total or comparison, it also performs the exact displayed computation: `3 + 6 = 9`, `6 + 4 = 10`, or `6 - 3 = 3`.

`scripts/session/s290-data-line-plots-g2-visual-repair.mjs` is guarded and idempotent: it accepts only its pre-repair payload or the repaired payload, updates all seven placements in one replay, and otherwise stops on source drift.

## Boundaries

Only the five source lesson JSON files, the repair replay, this report, and its regression are in scope. Generic human-disposition rows, shared figures, lesson-player runtime, registries, generated queue/cards/cache artifacts, and other courses remain untouched.

## Verification

```powershell
node scripts/session/s290-data-line-plots-g2-visual-repair.mjs
node scripts/session/s290-data-line-plots-g2-visual-repair.mjs
pnpm exec vitest run src/lib/session290.dataLinePlotsG2VisualRepair.test.ts src/lib/session254.dataLinePlotsG2CourseIntegrity.test.tsx
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/data-line-plots-g2 scripts/session/s290-data-line-plots-g2-visual-repair.mjs src/lib/session290.dataLinePlotsG2VisualRepair.test.ts reports/quality/S290_DATA_LINE_PLOTS_G2_VISUAL_REPAIR.md
```
