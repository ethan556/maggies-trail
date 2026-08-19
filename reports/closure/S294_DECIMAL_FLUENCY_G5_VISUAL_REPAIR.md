# S294 Decimal Fluency Grade 5 visual repair

## Scope and closures

- Course: `decimal-fluency-g5` (Grade 5; 16 lessons). This is a narrowly scoped P0 visual follow-on to the older S248 whole-course content packet, not a replacement for its independent review or remaining P1 revision work.
- Closed twelve source-verifiable `ILLUSTRATION_REPLACEMENT` rows: `VIS-g5d-01-04-c1-dpv-trailing-zero`, both `g5d-01-06` placements, both `g5d-02-01` placements, `g5d-02-03-c1`, both `g5d-02-04` placements, `g5d-02-05-c2`, `g5d-03-01-c2`, `g5d-03-02-c2`, and `g5d-03-04-c1`.
- Each existing registered figure remains in place. The learner-visible body and narration now give a truthful structural explanation of that exact visual rather than asserting unrelated fixed numbers. Stable lesson and step IDs, figure IDs, evaluator surfaces, feedback, MCQ contracts, shared runtime, registry, queue, cards, cache, and ledgers remain untouched.

## Evidence

- Guarded idempotent repair: `scripts/session/s294-decimal-fluency-g5-visual-repair.mjs`. Before writing, it requires every target to remain a concept surface with its expected figure and no widget/evaluator; it requires exact current body/narration before replacing them. `--check` must report twelve signed roots and zero pending changes.
- Aggregate regression: `src/lib/session294.decimalFluencyG5VisualRepair.test.ts` seals all twelve figure IDs, exact visible/narrated explanations, lack of evaluator drift, registration, numeric-parity alignment, and all sixteen course identities.
- Current 16-lesson source seal: `b34e6f22d985b8aaa5676fa94fd420022620a7d74bc67e34c5e1b3133918c626`.

## Residual authority

The queue is intentionally untouched. This packet supports a source-compatible closure delta of **12 P0 visual rows** after independent review and source/derived reconciliation. The remaining **16 P1 `LESSON_REVISION_IMPLEMENTATION` rows** are outside this bounded visual scope.
