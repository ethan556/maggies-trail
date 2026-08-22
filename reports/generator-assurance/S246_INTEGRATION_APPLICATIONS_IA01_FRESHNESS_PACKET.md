# S246 integration applications `ia-01` freshness packet

## Scope and boundary

- Generator: `g13-integration-applications`
- Lessons: `ia-01-01`, `ia-01-02`, and `ia-01-03`
- Consumers: 12 declared steps across 7 distinct forms
- Entry frontier: `ia-01-01.json/k2` -> `integration-applications__ia-area-between__numeric`
- Stop frontier: `ia-02-01.json/k1` in the next, untouched applications family

No lesson, standards, figure, queue, review-card, cache, or global generated-evidence file changed.

## Root cause and repair

The `ia-01` forms previously resolved to banks of one to three repeated widgets. This packet supplies twelve deterministic mathematical cases for every form while preserving the existing `mcq`, `numeric`, and `matchPairs` surfaces.

| Form | Mathematical job | Consumers | Prompt pool | Truth pool |
| --- | --- | ---: | ---: | ---: |
| `ia-area-between__mcq` | Identify the upper curve between intersections | 1 | 12 | 12 |
| `ia-area-between__numeric` | Find intersections, signed integrals, and geometric area | 3 | 12 | 12 |
| `ia-disc__mcq` | Identify the radius before applying the disc-area formula | 2 | 12 | 12 |
| `ia-disc__numeric` | Integrate squared radii for solids of revolution | 2 | 12 | 12 |
| `ia-washer__mcq` | Subtract inner face area from outer face area | 1 | 12 | 12 |
| `ia-washer__numeric` | Integrate outer-radius-squared minus inner-radius-squared | 2 | 12 | 12 |
| `ia-washer__matchPairs` | Connect radii, face area, and slice volume | 1 | 12 | 12 |

The builders vary curve coefficients, powers, intersections, radii, and slice quantities. Distractors arise from named mathematical errors: reversing upper and lower curves, confusing signed and geometric area, integrating a radius without squaring it, omitting pi, adding the washer hole, squaring a radius difference, or forgetting slice thickness.

## Independent truth contract

`calculusIndependent.cjs` uses only learner-visible prompt data. It independently solves curve intersections, integrates the displayed polynomial gap, recomputes disc and washer volumes, verifies the ordering of washer radii, checks that the proposed area interval ends at the second intersection, and reconstructs the complete match-pair label map. It does not trust generated answers, option flags, pair IDs, or hidden parameters.

The focused assurance samples 280 direct seeds and 96 unseen resolver seeds per form. It checks deterministic replay, schema validity, exact 12-prompt and 12-truth pools, a single defensible MCQ answer, unique numeric traps, response-surface preservation, match-pair agreement, and visible-prompt truth. Mutations cover changed curve coefficients and disc bounds, an incorrect intersection interval, reversed washer radii, and an inner radius that exceeds the outer radius.

## Gates

- Focused `ia-01` packet: PASS, 4/4 tests.
- Focused integration assurance from `in-01` through `ia-01`: PASS, 20/20 tests.
- Full resolver: all `ia-01` consumers pass; the next failure is the untouched `ia-02-01.json/k1` family.
- Typecheck: PASS.
- Targeted lint: PASS with 3 pre-existing `no-explicit-any` warnings and 0 errors.
- Scoped diff check: PASS.

Global freshness evidence remains for the coordinating reconciliation after all concurrent bounded packets land.
