# S287 — Add/Subtract Within 1,000, Grade 2: visual repair

## Scope and source seal

- Source queue: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
- Packet: four P0 `ILLUSTRATION_REPLACEMENT` rows:
  - `VIS-g2b-02-04-c2-pv3-borrow-zero`
  - `VIS-g2b-02-04-rem-g2b-across-zero-c-pv3-borrow-zero`
  - `VIS-g2b-02-06-c2-skip-count-line`
  - `VIS-g2b-02-06-rem-g2b-mental-hundred-c-skip-count-line`
- Confirmed source harm: the Grade 3 `pv3-borrow-zero` exemplar asserted `305 − 128` and rendered a final label below its `96`-unit viewBox; the hundreds line displayed `200` through `600` while its adjacent prose asserted `348 → 448 → 548`.
- Deliberately untouched: queue/disposition/cache artifacts, figure registry and runtime, learner widgets, and all other courses.

## Repair

`g2b-02-04` now uses the registered, visible Grade 2 trading sequence: `pv1000-cascade-down` for the hundred-to-tens exchange and `pv1000-trade-down` for the ten-to-ones exchange. The remedial repeats the latter exact learner step.

`g2b-02-06` keeps its existing `skip-count-line` and binds both its concept and remedial prose/narration to the displayed sequence: `200, 300, 400, 500, 600`, with each jump of `100`. This retains the intended invariant—only the hundreds digit changes—without presenting a diagram/text mismatch.

## Verification

- `node scripts/session/s287-add-subtract-1000-g2-visual-repair.mjs` twice (second run no-op)
- `pnpm exec vitest run src/lib/session287.addSubtract1000G2VisualRepair.test.ts src/lib/session194.addSubtract1000.test.ts src/lib/session248.addSubtract1000TruthReview.test.ts`
- `pnpm validate:content`
- `pnpm lint:pedagogy`
- `pnpm typecheck`
- `git diff --check -- content/courses/add-subtract-1000-g2 scripts/session/s287-add-subtract-1000-g2-visual-repair.mjs src/lib/session287.addSubtract1000G2VisualRepair.test.ts reports/quality/S287_ADD_SUBTRACT_1000_G2_VISUAL_REPAIR.md`

The focused regression asserts the exact replacement figures and text, registration, text/figure alignment, no remaining Grade 3 borrow exemplar in the repaired lesson, and parity between each main concept placement and its remedial replay.
