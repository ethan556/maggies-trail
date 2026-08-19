# S265 — Volume Problems G5 source implementation

## Scope and disposition

- Course: `volume-problems-g5`; eight clean lessons and 24 P0 queue rows at audit time.
- P0 closure: **24/24** source-verifiable causes addressed.
  - Visual causes: 16/16 stale `count-on-hops` placements removed. Eight are exact registered concept rebindings; eight are intentionally fail-closed because no registered visual can state the adjacent fixed-number or operation claim truthfully.
  - Progression causes: 8/8 repeated `i2` evaluators rebuilt as distinct transfers while retaining the existing evaluator family, stable step IDs, option IDs, numeric answers, and MCQ correctness.
- P1 residual: 26 review rows remain intentionally untouched; no queue, review cards, cache, registry, runtime, or ledger was modified.

## Figure evidence

The retained visual is registered and states the adjacent concept without contradicting learner-visible numeric facts:

| Lesson step | Registered figure | Verified concept |
| --- | --- | --- |
| `g5v-01-01:c1` | `vm-cube-unit` | one unit cube fills one cubic unit |
| `g5v-01-01:c2` | `vm-count-cubes` | rows, columns, and layers organize a cube count |
| `g5v-01-02:c1` | `vm-slice-layers` | equal layers retain the same count |
| `g5v-02-01:c1` | `vm-formula-lwh` | `V = l × w × h` |
| `g5v-02-01:c2` | `vm-count-cubes` | formula organizes the cube count |
| `g5v-02-02:c1` and `:c2` | `vm-base-height` | `l × w = B`, then `V = B × h` |
| `g5v-03-02:c1` | `vm-formula-lwh` | dimensions determine the volume plan |

Fail-closed slots: `g5v-01-02:c2`, `g5v-02-03:c1/c2`, `g5v-03-01:c1/c2`, `g5v-03-02:c2`, and `g5v-03-03:c1/c2`. This prevents an unrelated fixed-number layer/base, an additive L-shape decomposition, or a non-comparison diagram from being presented as evidence for the authored claim.

## Evaluator evidence

Each `i2` is a new, valid transfer using its original evaluator type:

| Lesson | Type | New verified target |
| --- | --- | --- |
| `g5v-01-01` | `areaModel` | 3 × 6 = 18 base cubes |
| `g5v-01-02` | `barBuilder` | 3 layers × 15 = 45 cubes |
| `g5v-02-01` | `areaModel` | 3 × 7 = 21 base cubes |
| `g5v-02-02` | `estimateSlider` | 9 × 4 = 36 cubes |
| `g5v-02-03` | `estimateSlider` | 80 ÷ 20 = 4 layers |
| `g5v-03-01` | `barBuilder` | 4 × 7 − 6 = 22 cubes |
| `g5v-03-02` | `estimateSlider` | 6 × 3 × 2 = 36 cubic metres |
| `g5v-03-03` | `estimateSlider` | 14 × 4 = 7 × 8 = 56 cubes |

The regression checks all lesson/step IDs, figure registration and dispositions, evaluator-family preservation, target arithmetic, choice/numeric correctness, and exact plus normalized prompt uniqueness.

## Reproducibility and gates

- Repair: `node scripts/session/s265-volume-problems-g5-course-repair.mjs` (replayed idempotently).
- Focused regression: `pnpm exec vitest run src/lib/session265.volumeProblemsG5Course.test.ts` — **5/5 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s265-volume-problems-g5-course-repair.mjs src/lib/session265.volumeProblemsG5Course.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Source seal: `3ec18dca4107628087ad451ef5e44d30f08459c5ad798ba0bc7828a0bf5e6649` (SHA-256 over sorted lesson filenames and bytes, NUL-delimited).
