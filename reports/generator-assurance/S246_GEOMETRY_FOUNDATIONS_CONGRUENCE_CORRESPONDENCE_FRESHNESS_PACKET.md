# S246 Geometry Foundations — Congruence and Correspondence Freshness Packet

## Scope

Closed the coherent `gf-05` family and completed the `g10-geometry-foundations` resolver sequence:

- `gf-congruence-def__numeric`
- `gf-congruence-def__mcq`
- `gf-find-motion__numeric`
- `gf-find-motion__mcq`
- `gf-corresponding-parts__numeric`
- `gf-corresponding-parts__mcq`

The replacements vary preserved and scaled measures, transformation types, coordinate mappings, recovered translation vectors, triangle names, congruence orders, source sides, target sides, values, answers, and misconception outcomes.

## Independent assurance

The independent geometry solver uses only learner-visible prompt information:

- rigid-motion measures are copied and dilation measures are recomputed from printed scale factors;
- translation vectors are recovered as image minus preimage before being applied to a second point;
- candidate rigid motions are applied independently to the printed point to identify a unique image;
- corresponding sides are reconstructed by vertex positions in the printed congruence statement, with the requested numeric target validated against that order.

The focused suite covers 180 generated seeds and 72 unseen resolver seeds per form. It checks deterministic replay, schema validity, prompt and truth variation, unique and singly correct options, prompt-only truth, distinct numeric diagnoses, dilation multiplication, unique motion identification, and positional correspondence.

## Evidence

- Focused plus full `g10-geometry-foundations` gate: **27 passed**; 3,971 unrelated tests skipped.
- TypeScript: **pass** (`tsc --noEmit`).
- Targeted ESLint: **0 errors**; the existing geometry generator explicit-`any` warnings remain.
- Global resolver: every `g10-geometry-foundations` declaration is now fresh; resolution advances to a different course.

## Exact next resolver frontier

`in-01-01.json/k3` — `g13-integration-accumulation`.

Observed global resolver failure: the next generator produced only two distinct widgets across the resolver seed sample (`expected 2 to be greater than 3`).
