# S305 — Grade 3 Multiplication Fluency: figure and release-truth repair

## Scope and authority

This is a source-local follow-on to the earlier S248 assessment. It applies only
the twelve concrete P0 roots in `mult-fluency-g3`; it does not append review
authority, change a queue/card/cache/ledger, or modify a shared figure.

The current course seal is
`9beccdd07149f0ed54bcbf39f03ad569d21d4111babad50991e23a45e9d786b9`.
It is SHA-256 over sorted lesson filenames and normalized parsed lesson JSON.

## Closed P0 roots

All six fixed-figure rows now retain a registered visual with course text that
passes `isFigureTextAligned` against the live numeric/semantic contract:

- `VIS-mf3-01-01-c1-mult3-double`
- `VIS-mf3-01-06-c2-mult3-break-apart`
- `VIS-mf3-02-02-c2-mult3-nines`
- `VIS-mf3-02-05-c1-mult3-mult-table`
- `VIS-mf3-02-06-c1-mult3-break-apart`
- `VIS-mf3-03-02-c1-mult3-mult-table`

The six release-root repairs are also source-closed:

- `LESSON-REVISION-mf3-02-05`: replaces the false “no skip-count shortcut”
  prediction and “no pattern” recap with truthful pattern/strategy language;
  option ID `a`, outcome ID `a`, and the 7-by-8 area evaluator remain intact.
- `LESSON-REVISION-mf3-03-05`: replaces each of five false claims that a
  division equation is “the reciprocal of” a multiplication equation with the
  correct statement that division undoes multiplication. All numeric evaluator
  answers, feedback routes, and IDs remain unchanged.
- `LESSON-REVISION-mf3-03-01`, `-mf3-03-02`, `-mf3-03-03`, and `-mf3-03-06`:
  current course consumers are re-proved against the repaired live table:
  visible text, title, and ARIA label agree that the highlighted square fact is
  `4 × 4 = 16`, not `4 × 6 = 24`.

No figure was fabricated or silently replaced. All six retained figures are
registered and their learner copy matches the actual visual. The remaining
thirty concept placements retain their existing course contract.

## Evidence and ratchets

- `scripts/session/s305-mult-fluency-g3-figure-release-repair.mjs` is guarded
  and idempotent. Its `--check` result is current: 12 root causes, six aligned
  concept bindings, eight literal release-truth field repairs, zero changes.
- `src/lib/session305.multFluencyG3FigureReleaseRepair.test.tsx` verifies the
  six bindings, all 18 lesson schemas, the unchanged hard-facts evaluator,
  each corrected fact-family feedback route, and the rendered/ARIA table truth
  through all five table-consuming release-root lessons.
- `src/lib/session248.multFluencyG3CourseIntegrity.test.ts` is tightened from
  six detected withholding placements to none and no longer requires removed
  false wording.

## Gates

Passed on the sealed source:

- S305 repair `--check`
- focused Vitest: 3 files, 12 tests
- `pnpm validate:content`
- `pnpm lint:pedagogy` — 1711/1711 files clean
- `pnpm cml:lint:strict` — 0 errors, 0 warnings

## Explicit residuals

The current derived queue is intentionally unmodified and will remain stale
until a serial refresh records the twelve source-compatible closures. The
following seven P1 rows are deliberately outside this repair:

- `LESSON-REVISION-mf3-02-01` (a new exact ×8 semantic visual is still needed)
- `VISUAL-DISPOSITION-mf3-02-03`, `VISUAL-DISPOSITION-mf3-02-04`
- `LANGUAGE-mf3-02-03`, `LANGUAGE-mf3-02-04`
- `LESSON-mf3-02-03`, `LESSON-mf3-02-04`

They require later source work or independent assessor authority; this packet
makes no claim to close them.
