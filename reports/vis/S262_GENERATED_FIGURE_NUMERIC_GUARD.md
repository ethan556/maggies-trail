# S262 generated figure numeric guard

The live figure registry is now the authority for fixed arithmetic/equality exemplars. The generator SSRs every registered figure, extracts the worked claim from its accessible `<title>`, and deliberately excludes incidental axis ranges and tick sequences. The runtime alignment gate compares any adjacent explicit authored claim against that exact rendered claim using signed values and operation shape.

## Sealed result

- 175 renderer-derived arithmetic/equality claims
- 398 current placements of those figures
- 244 placements beside explicit authored numeric claims
- 137 exact-aligned placements
- 107 semantic-replacement debt placements
- 107/107 debt placements safely withheld
- 0 unsafe placements
- evidence source seal: `d5994b78ec5f0550db15d5f876a6ee2179d0ad55aeabbbb78b2108c8f40d83ca`

The exact 107-row inventory is in `S262_GENERATED_FIGURE_NUMERIC_PARITY.json`; it is replacement debt, not learner-visible false mathematics.

The motivating blind spot is closed directly: `mult3-array` declares `4 rows × 6 columns = 24`. Adjacent prose claiming `3 × 4 = 12` is rejected even though the two claims share the digit 4; the exact rendered claim is accepted.

## Learner-visible evidence

Canonical VIS-03 regeneration against the post-adversarial source reports 3,580 figure placements, 3,061 rendering placements, and 116 rendering placements whose figure asserts a numeric relationship. Zero conflicting rows survive the runtime gate. `VIS03_FIGURE_EXEMPLAR_DRIFT.csv` is sealed to contract input `dfa4698674cb2fa00b82c3cc5d6fb1d4fb09ae0ced115df6d597379153041665`.

## Gates

- canonical plain generator write: passed without ambient React
- canonical plain generator `--check`: CURRENT, 175 claims
- focused Vitest: 4 files, 13 tests passed
- generated corpus parity audit: 0 unsafe
- canonical VIS-03: 0 learner-visible conflicts
- TypeScript: passed
- scoped ESLint: passed
