# S268 — Radicals and Exponents source implementation

## Scope and disposition

- Course: `radicals-and-exponents`; source tree was clean before this six-lesson P0 packet.
- P0 closure: **6/6** visual causes addressed.
  - Three generic, registered formula visuals were exact semantic matches and were rebound.
  - Three fixed-number or wrong-operation examples were fail-closed because no synchronized visual is registered.
- Stable IDs, all evaluator families and payloads, options, answers, and feedback remain unchanged.
- P1 residual: 101 review rows remain intentionally untouched. No queue, review cards, cache, registry, runtime, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `rad-01-01:c1` | fail-closed | `radical-factor` shows `√72 = 6√2`; adjacent copy teaches the perfect square `√49 = 7`. |
| `rad-01-03:c1` | fail-closed | `radical-factor` has a different worked radical; adjacent copy requires `√12 = 2√3`. |
| `rad-02-03:c1` | fail-closed | `like-radicals` teaches addition of like radicals, while adjacent copy distributes `√2(√3 + √5)`. |
| `rad-03-01:c1` | `rad-denom-root` | Generic `a^(1/n) = ⁿ√a` exactly supports the denominator-as-root relationship without contradicting the copy's examples. |
| `rad-03-02:c1` | `rad-read-fraction` | Generic numerator-as-power / denominator-as-root diagram exactly supports the stated fractional-exponent procedure. |
| `rad-03-03:c1` | `rad-neg-rational` | Generic root–power–reciprocal relationship exactly supports negative rational exponents without a competing numeric exemplar. |

The blank slots remain intentionally withheld until exact source figures exist; this prevents unrelated values or an incorrect operation from being presented as evidence.

## Regression and reproducibility

`src/lib/session268.radicalsAndExponentsCourse.test.ts` verifies manifest and step stability, the three rebindings and three fail-closures, registration of retained figures, and numeric, choice, exact-number, slider, exponential, and fraction evaluator contracts.

- Repair: `node scripts/session/s268-radicals-and-exponents-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session268.radicalsAndExponentsCourse.test.ts` — **3/3 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s268-radicals-and-exponents-course-repair.mjs src/lib/session268.radicalsAndExponentsCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
- Source seal: `33b876d6c2bbed403349de55c387c907848226d51e8c93ae886dd3d3bf0c726d` (SHA-256 over the six sorted repaired lesson filenames and bytes, NUL-delimited).
