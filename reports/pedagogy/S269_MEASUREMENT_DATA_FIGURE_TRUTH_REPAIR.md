# S269 — Measurement Data figure-truth repair

Five lesson claims named values that the fixed SVGs did not depict. The repair safely withholds those source bindings while leaving the explanatory text, evaluators, and correctly parameterized interactive models unchanged.

| Lesson/step | Claim | Fixed figure that was withheld |
| --- | --- | --- |
| `md-03-01/c2` | half of a 10-point star is 5 | `md3-pictograph` (2-point circles) |
| `md-03-02/c1` | scale 0, 2, 4, 6 | `md3-bargraph` (0, 5, 10, 15) |
| `md-03-03/c2` | bars versus a bar's height | `md3-bargraph` (unrelated fixed data) |
| `md-04-02/c1` | 4 rows × 6 columns = 24 | `md3-area-rows` (3 × 5 = 15) |
| `md-04-02/c2` | 4 × 6 = 6 × 4 = 24 | `md3-area-rows` (3 × 5 = 15) |

QA:

- `node scripts/audit/repair-measurement-data-s269.mjs --check`
- `pnpm exec vitest run src/lib/session269.measurementDataFigureWithholding.test.ts`
- content schema, pedagogy, strict CML, TypeScript, lint, and scoped diff checks

Queue-compatible effect: five stale illustration-replacement rows become refresh-closable. Independent review rows remain open. This follows the visual-accessibility rule that a displayed SVG and its accessible description must communicate the same mathematical quantity as the adjacent claim.
