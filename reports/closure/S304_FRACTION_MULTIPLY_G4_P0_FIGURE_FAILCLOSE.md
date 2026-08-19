# S304 — Fraction Multiply G4 P0 figure fail-close

## Scope

- Course: `content/courses/fraction-multiply-g4` (12 lessons).
- Exact source roots: 20 `ILLUSTRATION_REPLACEMENT` rows, all marked `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD` or `WITHHELD_BLOCKLIST_FINGERPRINT` by the authoritative queue.
- The audit found no registered parameterized or exact fixed-exemplar figure for the authored quantities at any of those placements. Reusing the mismatched fixed examples would reintroduce a learner-visible contradiction, so each is explicitly fail-closed.

## Source closure

- Removed only the 20 withheld `figure` bindings: 15 main concept placements and 5 remedial concepts.
- Removed the 13 stale trailing “The figure …” claims from their matching body/narration pairs (26 textual fields), preventing an accessible or visible reference to a withheld illustration.
- Retained 9 non-flagged registered concept figures and every widget/evaluator/answer/option/feedback contract.
- Updated the prior S255 course regression from an obsolete 24-figure expectation to the explicit 9-figure fail-close state.
- Course seal: `cc15d0bfff5ea2f4856829dce229e9a9e00df09b682e608b80dd7c088d4fa4d1` (SHA-256 of sorted parsed lesson JSON).

## Ratchets and evidence

- `scripts/session/s304-fraction-multiply-g4-p0-figure-failclose-repair.mjs` is idempotent; `--check` is current with 0 changed placements.
- `src/lib/session304.fractionMultiplyG4P0FigureFailclose.test.ts` names all 20 authoritative row IDs, proves each target has no figure or stale figure reference, verifies remaining figures are registered, preserves evaluator truth, and hash-locks all non-permitted fields.
- Focused S304 + S255 regression: 8/8 passing.
- `pnpm validate:content`, `pnpm lint:pedagogy` (1711/1711), `pnpm cml:lint:strict` (0 errors, 0 warnings), `pnpm typecheck`, and scoped ESLint pass.

## Residual authority

The derived queue is intentionally untouched and remains stale until the next serial refresh: its 20 P0 rows are source-compatible closures from this packet. The only substantive remaining course rows are 9 P1 `LESSON_REVISION_IMPLEMENTATION` decisions, outside this visual-only scope. No assessor, queue, card, cache, ledger, schema, registry, or shared runtime artifact was changed.
