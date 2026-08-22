# S291 Place Value to Millions source repair

## Scope and closures

- Course: `place-value-million` (Grade 4; 14 lessons), clean before work with no prior course-local repair, report, or assessment packet.
- Closed five source-verifiable P1 roots in seven evaluator-safe steps. `pv2-01-03/k3` now diagnoses a digit-value claim; `pv2-02-02/k2` repairs a silent-zero reading; `pv2-02-03/k3` has four 48–49-character comma-group claims; `pv2-03-01/k3,ch1` diagnose halfway and rollover rounding; and `pv2-04-03/k2,ch1` audit zero-chain subtraction errors.
- Stable IDs, widget types, numeric answers, MCQ IDs/order/correctness, feedback, figures, and all shared/derived authority remain untouched.

## Evidence

- Guarded idempotent repair: `scripts/session/s291-place-value-million-repair.mjs` (`--check`: 5 roots, 7 target steps, 0 pending).
- Aggregate regression: `src/lib/session291.placeValueMillionRepair.test.ts` validates exact prompts, numeric/MCQ/column-calculator evaluator contracts, choice parity, all 14 lesson identities, and registered/text-aligned figures.
- Current source seal: `7cec6741293dbb23c99f5b5f1ce3cc4ae53310b25a7de06c2a7a93bc89ddb8b0`.
- Passed focused regression (2/2), schema (1711/1711), pedagogy (1711/1711), strict CML (0 errors/warnings), scoped ESLint/diff, and repository TypeScript.

## Residual authority

The queue is untouched. This supports a source-compatible closure delta of **5 P1 rows** after independent review/seal reconciliation. The remaining 42 rows are assessor-controlled: 14 visual, 14 language, and 14 lesson-disposition decisions.
