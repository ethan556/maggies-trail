# S295 Multiply/Divide Fluency Grade 4 visual repair

## Scope and closures

- Course: `mult-div-fluency-g4` (Grade 4; 16 lessons), clean and unowned before this bounded P0 packet.
- Closed ten source-verifiable `ILLUSTRATION_REPLACEMENT` rows: both `g4m-01-03` placements, both `g4m-01-04` placements, `g4m-01-05/c2`, `g4m-01-06/c2`, `g4m-02-03/c2`, `g4m-03-01/c1`, `g4m-03-02/c1`, and `g4m-03-03/c2`.
- Each concept retains its existing registered figure. The body and narration now state the truthful structural relationship that figure demonstrates, rather than a different fixed worked example. Stable IDs, figure IDs, evaluator/widget surfaces, feedback, MCQ contracts, shared runtime, registry, queue, cards, cache, and ledgers remain unchanged.

## Evidence

- Guarded idempotent repair: `scripts/session/s295-mult-div-fluency-g4-visual-repair.mjs`. It requires every target to retain its expected concept/figure/no-widget contract and exact original synchronized body/narration before changing text. `--check` must show ten signed roots and zero pending changes.
- Aggregate regression: `src/lib/session295.multDivFluencyG4VisualRepair.test.ts` seals each exact structural explanation, figure registration, figure/text alignment, evaluator safety, and all sixteen lesson identities.
- Current 16-lesson source seal: `cea2b4cb9a0e9849f060ae25f4617af6645fa97427181290bb3e6519c48bc7d1`.

## Residual authority

The queue is intentionally untouched. This supports a source-compatible closure delta of **10 P0 visual rows** after independent review and source/derived reconciliation. The remaining **16 P1 `LESSON_REVISION_IMPLEMENTATION` rows** are outside this bounded visual scope.
