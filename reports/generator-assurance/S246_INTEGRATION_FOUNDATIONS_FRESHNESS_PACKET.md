# S246 Integration and Accumulation — in-01 Foundations Freshness Packet

## Scope

Closed the coherent `in-01` family in `g13-integration-accumulation`:

- `integration-accumulation__in-riemann__numeric`
- `integration-accumulation__in-riemann__mcq`
- `integration-accumulation__in-squeeze__numeric`
- `integration-accumulation__in-squeeze__mcq`
- `integration-accumulation__in-definite-integral__numeric`
- `integration-accumulation__in-definite-integral__matchPairs`
- `integration-accumulation__in-signed-area__mcq`

The former forms relied on one- to three-row authored pools. The replacements vary functions, interval lengths, strip counts, endpoint rules, Riemann estimates, squeeze bounds, adjacent-integral values, limit direction, match values, signed regions, correct results, and diagnostic outcomes.

## Independent assurance

`calculusIndependent.cjs` now reconstructs each answer from learner-visible information:

- left sums are recomputed strip by strip from the printed function, interval, and partition;
- endpoint-error direction is derived from monotonicity and endpoint choice;
- right-minus-left gaps use the printed endpoint-height difference and strip width;
- squeeze conclusions rebuild the rigorous lower and upper bound;
- adjacent integral values add, and reversed limits negate the joined value;
- matching-pair truth is rebuilt as expression-label to value-label mappings from the printed givens;
- signed integral and geometric area are independently computed as difference and sum.

The focused suite covers 180 generated seeds and 72 unseen resolver seeds per form. It checks deterministic replay, schema validity, prompt and truth variation, prompt-only recomputation, exact-number engine agreement, distinct numeric diagnoses, singly correct and label-distinct choices, bijective matching, and non-positional matching columns.

## Evidence

- Focused plus full `g13-integration-accumulation` gate: **40 passed**; 3,958 unrelated tests skipped.
- TypeScript: **pass** (`tsc --noEmit`).
- Targeted ESLint: **0 errors**; three explicit-`any` warnings remain in the calculus generator's established flexible widget boundary.
- Global resolver: all `in-01` declarations are fresh and resolution advances into `in-02`.

## Exact next resolver frontier

`in-02-01.json/k1` — `g13-integration-accumulation` form `integration-accumulation__in-accumulation__numeric`.

Observed global resolver failure: the next form produced only two distinct widgets across the resolver seed sample (`expected 2 to be greater than 3`).
