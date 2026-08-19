# S289 — Counting to 100, Kindergarten: visual repair

## Scope and source seal

- Source queue: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
- Packet: nine P0 `ILLUSTRATION_REPLACEMENT` rows across five clean lessons:
  - `k100-01-03/c1` — `chart-120`
  - `k100-02-05/c1`, `c2`, and remedial concept — `tno-count-down-tens`
  - `k100-03-03/c1` — `chart-120`
  - `k100-03-05/c1` — `chart-rows`
  - `k100-03-06/c1`, `c2`, and remedial concept — `c120-missing-order`
- Exact pre-repair evidence: every queued placement returned `false` from `isFigureTextAligned(figure, body)`. The underlying figures were useful and registered, but the old fingerprints caused the learner-facing visuals to fail closed.
- Deliberately untouched: queue/disposition/cache artifacts, figure registry and runtime, learner widgets, and all other courses.

## Repair

Every repaired concept and narration now names the numbers actually visible in its figure:

- the blue `41`–`50` row and continuation after `46`;
- backward `10`-jumps from `65` through `35`;
- the third chart row ending `29, 30` and the next row beginning `31`; and
- the pictured `42, 43, ?, 45` row whose missing number is `44`.

The changes make the concrete visual, body, and narration agree while retaining each lesson’s existing exercise sequence and correctness contracts.

## Verification

- `node scripts/session/s289-counting-to-100-k-visual-repair.mjs` twice (second run no-op)
- `pnpm exec vitest run src/lib/session289.countingTo100KVisualRepair.test.ts src/lib/session183.counting100k.test.ts src/lib/session246.counting100Progression.test.ts src/lib/session262.countingTo100KCourseIntegrity.test.tsx`
- `pnpm validate:content`
- `pnpm lint:pedagogy`
- `pnpm typecheck`
- `git diff --check -- content/courses/counting-to-100-k scripts/session/s289-counting-to-100-k-visual-repair.mjs src/lib/session289.countingTo100KVisualRepair.test.ts reports/quality/S289_COUNTING_TO_100_K_VISUAL_REPAIR.md`

The focused regression seals all nine queue locations, their exact figures/text/narration, figure registration, source schema, and a whole-course sweep requiring every figure-bearing Kindergarten concept to be text-aligned.
