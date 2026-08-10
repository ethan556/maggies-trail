# S209 — content-change ledger

**No authored lesson content file was changed.** Zero conversions, zero insertions, zero edits.
Hash proof 1,701/1,701 byte-identical to `SESSION205_LESSON_HASHES.json`; the S209 adversarial
review additionally diffed the whole `content/**` tree against the sealed S208 tarball —
byte-identical.

## Learner-visible BEHAVIOR changes on authored content (zero file edits)

1. **slopeTriangle empty-triangle phantom line removed** (`SlopeTriangleW`, widgets.tsx): with
   both legs at 0 the widget previously drew a vertical line its own readout called "no triangle",
   and on a vertical problem that phantom reported "✓ passes through B" while the grader
   (`slopeTriangleMatches`) rejects the state. Reachable in one keypress from shipped content
   (`lf-01-03`, runStart 1). The picture now draws nothing when the model says there is no line.
   The reviewer's independent sweep of all 7,930 authored triangle states confirms this was the
   ONLY live picture/grader disagreement; the verdict's float→exact-rational change is latent
   (smallest disagreeing problem needs a ±14 grid no authored spec reaches).
2. **Sub-ulp pixel differences** in slopeTriangle/affine plot geometry from exact-rational
   derivation replacing float arithmetic, in states no test pins. Correctness improvement.

## Analysis artifacts (no content touched)

`SESSION209_RICH_MIX_ADJUDICATION.md`: 22 candidates adjudicated read-only under
FIT/REACH/READOUT/NOVELTY. 2 PASS (`vec-05-03/k1` → matrixTransform; new step in `sy-02-03` →
dilationExplore segments), 20 REFUSE — including the carried candidate `lf-02-01/i3`, refused on
NOVELTY (the lesson is already 37.5% rich with two steps exercising the identical
`add(multiply(m,x),c)` manipulation; both spot-verified by the adversarial reviewer from the
lesson JSON). `INSERTION_CANDIDATES.json` found stale (310/3,075 rows already rich under the
current S205K-aware definition). The 62-insertion pool is thinner than the mandate assumed —
recorded plainly; insertion of the two passes is deferred to a session running the full
content-freeze protocol.

## Everything else

Platform/presentation/tests/docs only. `scripts/engine-capabilities.json` unchanged
(byte-verified against the S208 seal). `mmipTypes.ts` frozen contract byte-identical to the seal.
