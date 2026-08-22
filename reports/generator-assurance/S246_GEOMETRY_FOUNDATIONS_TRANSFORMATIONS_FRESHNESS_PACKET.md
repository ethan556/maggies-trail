# S246 Geometry Foundations — Transformation Rules Freshness Packet

## Scope

Closed the coherent `gf-03` transformation-rule unit in `g10-geometry-foundations`:

- `gf-translation-rule__numeric`
- `gf-translation-rule__mcq`
- `gf-reflection-rule__numeric`
- `gf-reflection-rule__mcq`
- `gf-rotation-rule__numeric`
- `gf-rotation-rule__mcq`

The previous forms drew from only one or two authored rows. The replacements vary coordinates, motion parameters, requested coordinates, results, and misconception paths while preserving each form's question job.

## Independent assurance

`geometryIndependent.cjs` now recomputes every answer from the learner-visible prompt. It does not import or duplicate the generator's case arrays:

- translation shifts are reconstructed as image minus preimage or parsed from the printed rule;
- reflections are applied from the named mirror or identified by testing candidate mirrors;
- rotations are applied from the printed angle or identified by testing the three origin-rotation rules.

The focused assurance suite covers 180 generated seeds per form plus 72 unseen resolver seeds per form. It checks deterministic replay, schema validity, prompt and truth variation, unique MCQ labels, exactly one correct option, distinct numeric misconceptions, and prompt-only answer agreement.

## Evidence

- Focused and full-family gate: **27 passed** (`session246.geometryFoundationsFreshness.test.ts` plus the `g10-geometry-foundations` slice of `variants.test.ts`).
- TypeScript: **pass** (`tsc --noEmit`).
- Targeted ESLint: **0 errors**; the geometry generator retains its existing explicit-`any` warning profile.
- Global resolver: the `gf-03` unit is fresh; the resolver advances to the next family.

## Exact next resolver frontier

`gf-04-01.json/k3` — `g10-geometry-foundations` form `gf-composition__numeric`.

Observed global resolver failure: the form produced only two distinct widgets across the resolver seed sample (`expected 2 to be greater than 3`).
