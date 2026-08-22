# S249 math-rendering root-cause packet

## Result

- `MATH_SYMBOLIC_DISPLAY_INDEX`: **1,077 → 994** (`−83`).
- All eight non-symbolic presentation indexes: **0**.
- Expanded audit coverage: **415,741 learner-visible strings**.
- Authored and generated source evidence remains input-sealed by the existing audit.

## Root causes closed

1. Nested radicals containing inner parentheses or calculus notation were split into partial islands. The parser now gives the enclosing radical precedence while preserving simple fraction and calculus islands.
2. Generated calculus and limits prompts emitted ASCII derivative primes, `sqrt`, `pi`, machine `*`, coefficient-one forms such as `1x`, and an unstated floating-point tail. They now emit typographic mathematical notation, canonical coefficients, and declared precision.
3. Independent solvers now accept both legacy and typographic notation and recompute coefficient-one cases from the printed prompt.
4. Coordinate-perpendicular generated answers now declare three-decimal precision, use a matching tolerance, and display rounded feedback.

The remaining 994 rows are still an honest per-consumer arithmetic-on/off disposition queue. This packet does not treat the appearance of a mathematical symbol by itself as proof that a consumer is remediated.

## Evidence

- Focused parser/render regression: 43 tests passed before generator cleanup.
- Calculus, limits, integration, coordinate, and independent-solver assurance suites remain the grading contract.
- `session249.mathRenderingRootCause.test.ts` pins all non-symbolic indexes at zero and the current symbolic queue at 994.
