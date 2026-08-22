# S270 — Exponents and Scientific Notation source implementation

## Scope and disposition

- Course: `exponents-scientific-notation`; the source tree was clean before this packet.
- P0 evidence disposition: **9/9** queue-listed illustration causes reviewed across eight lessons.
  - **8** fixed-number or wrong-operation illustrations were fail-closed.
  - **1** registered generic visual (`exponent-repeat`) was retained after exact semantic verification.
- All lesson and step IDs, widgets, evaluator payloads, answers, choices, feedback, and generated-variant contracts remain unchanged.
- P1 residual: **51** review rows remain intentionally untouched. No queue, review cards, cache, runtime, registry, or ledger was modified.

## Visual evidence

| Lesson step | Disposition | Evidence |
| --- | --- | --- |
| `esn-01-01:c2` | fail-closed | `esn-power-meaning` fixes the example at `10³ = 1000`; the copy requires a complete negative-exponent sequence through `10⁻² = 0.01`. |
| `esn-01-02:c2` | fail-closed | `esn-exponent-rules` displays a fixed positive-exponent multiplication example, while the copy demonstrates division with a negative exponent. |
| `esn-01b-01:c1` | retained | `exponent-repeat` exactly shows the stated generic factor count: `a³ · a² = a⁵`; no competing numeric value is asserted. |
| `esn-02-01:c2` | fail-closed | `esn-square-root` is the one-positive-root area example `√16 = 4`; the copy requires the paired `±` solutions of `x² = p`. |
| `esn-03-02:c1` | fail-closed | `esn-sci-small` fixes `0.0045 = 4.5 × 10⁻³`; the copy teaches `0.00032 = 3.2 × 10⁻⁴`. |
| `esn-03-02:c2` | fail-closed | The same fixed three-place illustration cannot represent `0.000000091 = 9.1 × 10⁻⁸`. |
| `esn-04-01:c2` | fail-closed | `esn-multiply-sci` uses an already-normalized product, while the copy’s purpose is the distinct renormalization of `12 × 10¹¹`. |
| `esn-04-02:c2` | fail-closed | `esn-add-sci` shows positive addition with matching exponents, not the copied subtraction-and-rewrite procedure. |
| `esn-04-03:c2` | fail-closed | `esn-add-sci` is unrelated to the copy’s significant-digit precision rule. |

The affected lessons retain their live, parameterized exploration widgets and all graded checks. Withholding only the mismatched static exemplar prevents an unrelated fixed number or operation from being presented as evidence.

## Regression and reproducibility

`src/lib/session270.exponentsScientificNotationCourse.test.ts` verifies the 15-lesson manifest, each affected lesson's stable step IDs, eight fail-closures, the exact generic retention, figure registration, schema integrity, and self-grading numeric, choice, and expression checks.

- Repair: `node scripts/session/s270-exponents-scientific-notation-course-repair.mjs` — replayed idempotently.
- Focused regression: `pnpm exec vitest run src/lib/session270.exponentsScientificNotationCourse.test.ts src/lib/session244.grade7Grade8CausalPrediction.test.ts src/lib/session145.place-value-transform.test.ts` — **36/36 passed**.
- Scoped lint: `pnpm exec eslint scripts/session/s270-exponents-scientific-notation-course-repair.mjs src/lib/session270.exponentsScientificNotationCourse.test.ts` — **passed**.
- Strict CML: `pnpm run cml:lint:strict` — **0 errors, 0 warnings**.
- Content schema: `pnpm run validate:content` — **1840/1840 files clean**.
- TypeScript: `pnpm typecheck` — **passed**.
- Scoped `git diff --check` — **passed**.
- Source seal: `348040e23416ed77474c00a922a3382be3acf901876da22291f46f0c98d0dc04` (SHA-256 over the seven sorted repaired lesson filenames and bytes, NUL-delimited).
