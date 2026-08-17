# S245 Phase 4 packet — canonical form

## Result

**PASS. The live canonical-form index is 55 → 0.** Review of every row found no genuine
learner-facing mathematical defect. All 55 were coefficient-1 examples whose explicit coefficient
is necessary to the immediate teaching or source-model contract. The detector now recognises only
those evidence-backed contexts instead of recommending a bulk rewrite that would erase the lesson's
point.

No renderer, formatter, generator, evaluator, answer, lesson, widget, schema, figure, or standards
field changed.

## Complete disposition

| Disposition                                     | Authored | Generated |  Total |
| ----------------------------------------------- | -------: | --------: | -----: |
| Explicit-coefficient affine/system source model |       29 |        12 |     41 |
| Authored explanation that teaches coefficient 1 |        9 |         0 |      9 |
| Generated coefficient-exposure prompt contract  |        0 |         5 |      5 |
| Genuine noncanonical learner-facing expression  |        0 |         0 |      0 |
| **Total**                                       |   **38** |    **17** | **55** |

### Why these forms remain explicit

- The 41 `widget.lines[*].sourceText` rows mirror the affine/system engine's explicit coefficient
  model. Keeping `1x` or `1y` visible lets learners align coefficients between equations and keeps
  the displayed source tied directly to the line model.
- The nine authored explanations explicitly contrast a hidden unit coefficient with ordinary
  notation: for example, “written out in full the term is `1x`” and “`y` means `1y`.” Removing the
  1 would contradict the explanation.
- Four generated prompts expose `A` and `B` in standard form or align coefficients for elimination.
  The fifth exposes common ratio 1 in a recurrence before asking for explicit form.

Because none of the 55 is a defect, changing shared presentation code or curriculum data would be
mathematically unnecessary and pedagogically harmful.

## Detector boundary

The exception is intentionally narrow:

- nine exact authored `(owner, unit, field)` evidence keys;
- five exact generated `(generator, form, field)` contracts;
- `widget.lines[*].sourceText` only for the proven authored `se-*` and generated `a1-systems`
  families.

A new lesson, generator, form, field, or owner does not inherit the exception. A genuine `1x` in an
ordinary prompt still enters the index. Explicit asterisk multiplication and variable-before-
coefficient machine ordering remain findings even inside the exempt contexts.

## Queue evidence

Source seal: `66ac01f`.

| Index                                 | Before |  After | Change |
| ------------------------------------- | -----: | -----: | -----: |
| `MATH_CANONICAL_FORM_INDEX`           |     55 |      0 |    -55 |
| `MATH_SYMBOLIC_DISPLAY_INDEX`         |    804 |    804 |      0 |
| Total mathematical-presentation queue |    895 |    840 |    -55 |
| Consolidated pending-workload queue   | 14,648 | 14,593 |    -55 |

## Verification

- Nine focused parser, renderer, and detector test files: 107/107 pass.
- New detector tests prove every exemption boundary and near-miss behavior.
- Whole-project TypeScript: pass.
- Focused ESLint: zero errors; one pre-existing `no-explicit-any` warning remains in the report
  walker's JSON-loading line.
- Deterministic math-presentation reports regenerated: canonical-form index contains its header
  only.
- Consolidated pending-workload queue regenerated from the current report set.
