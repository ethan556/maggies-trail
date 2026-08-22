# S245 circle-theorems generator freshness packet

## Scope and result

The `g10-circle-theorems` family now passes the resolver freshness requirement. Ten numeric forms that previously depended on undersized static template pools now vary the mathematical quantities and answers while preserving a single stable question job per form.

No lesson JSON, runtime renderer, schema, evaluation, figure, avatar, icon, ledger, deployment, or release file was changed for this packet.

## Root cause and repair

The first failure, `cr-01-03.json/k1` (`cr-thales__numeric`), had one authored template whose answer was always 90. Subsequent resolver runs exposed nine more circle forms with the same family-level cause: fewer than four distinct widget payloads across the resolver seed cohort.

| Form                        | Stable mathematical job                                         | Genuine variation                       |
| --------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| `cr-thales__numeric`        | Apply Thales' 90° invariant and solve a linear equation         | coefficient, constant, solution         |
| `cr-chord-arc__numeric`     | Transfer arc measure across congruent chords                    | intercepted arc                         |
| `cr-cyclic-quad__numeric`   | Use supplementary opposite angles                               | given and opposite angle                |
| `cr-sector-area__numeric`   | Match sector-area fraction to central-angle fraction            | radius, area coefficient, central angle |
| `cr-tangent-chord__numeric` | Halve the intercepted arc                                       | arc and angle                           |
| `cr-tangent-perp__numeric`  | Use radius-tangent perpendicularity and solve a linear equation | coefficient, constant, solution         |
| `cr-secant-angles__numeric` | Halve the difference of external secant arcs                    | far arc, near arc, angle                |
| `cr-power-point__numeric`   | Apply the intersecting-chords product                           | three segment lengths and unknown       |
| `cr-tangent-apps__numeric`  | Use the radius-tangent right triangle                           | center distance, radius, tangent length |
| `cr-two-tangent__numeric`   | Use equal tangent segments from one exterior point              | tangent length                          |

The independent-answer module parses learner-visible quantities and recomputes each answer from the applicable theorem. It does not read the generator's case tables.

## Consumer evidence

The focused assurance test discovers all current content consumers rather than maintaining a hand-selected list. It found 29 consumers across the ten repaired forms:

- numeric: 21 consumers across Thales, chord-arc, cyclic-quadrilateral, sector-area, tangent-chord, tangent-perpendicular, and two-tangent forms;
- exact-number lab: 8 consumers across secant-angle, intersecting-chords, and tangent-application forms.

Each consumer was resolved through the production resolver and checked for widget-schema validity, expected response surface, independent-answer agreement, and distinct diagnostic traps.

## Unseen-seed evidence

- 10 forms × 64 unseen seeds = 640 generated widgets.
- Every unseen-seed widget passed deterministic replay, schema validation, independent recomputation, and diagnostic-trap uniqueness.
- Every form produced at least 8 distinct prompts and at least 6 distinct answers in its unseen-seed cohort.
- A dedicated Thales audit additionally used two disjoint 64-seed cohorts, confirming at least 8 prompt and answer variants in each cohort.

## Gates

- focused circle/geometry suites: 4 files, 21 tests passed;
- exhaustive variant suite: 3,996 tests passed;
- TypeScript: passed;
- targeted lint: 0 errors (24 pre-existing `no-explicit-any` warnings in `geometryVariants.ts`);
- diff check: passed;
- resolver suite: all circle-theorems declarations pass; 16 of 17 total resolver checks pass. The only remaining failure is the next unrelated family, `cpr-01-03.json/k2` / `g10-conditional-probability`, which still has only two distinct widgets across the resolver cohort.

## Disposition

`g10-circle-theorems`: **PASS — freshness, independent answer, schema, and consumer assurance complete.**

The conditional-probability failure is outside this packet and remains open for its owning generator lane.
