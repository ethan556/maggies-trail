# S246 Geometry Foundations — Composition and Symmetry Freshness Packet

## Scope

Closed the coherent `gf-04` family in `g10-geometry-foundations`:

- `gf-composition__numeric`
- `gf-composition__mcq`
- `gf-line-symmetry__numeric`
- `gf-line-symmetry__mcq`
- `gf-rotational-symmetry__numeric`
- `gf-rotational-symmetry__mcq`

The prior forms used one- or two-row pools. MCQ option shuffling could make a declaration appear superficially fresh while repeating the same mathematical prompt. The replacements vary the actual coordinates, translation vectors, rotation angles, requested coordinates, polygon side counts, symmetry orders, smallest rotations, answers, and misconception outcomes.

## Independent assurance

The independent geometry solver reconstructs answers only from learner-visible prompt values:

- composition applies the printed translation to the printed point, then applies the printed rotation in order;
- line symmetry derives the line count from the regular polygon's side count;
- rotational symmetry checks the printed side count against the printed order and divides the full 360° turn by that order.

The focused suite exercises 180 generated seeds per form and 72 unseen resolver seeds per form. It checks deterministic replay, schema validity, prompt and truth variation, prompt-derived answers, unique and singly correct options, distinct diagnostic outcomes, and the `smallest rotation × order = 360°` invariant.

## Evidence

- Focused plus full `g10-geometry-foundations` gate: **27 passed**; 3,971 unrelated tests skipped.
- TypeScript: **pass** (`tsc --noEmit`).
- Targeted ESLint: **0 errors**; the existing geometry generator explicit-`any` warning profile remains.
- Global resolver: all `gf-04` declarations are fresh and resolution advances into `gf-05`.

## Exact next resolver frontier

`gf-05-01.json/k2` — `g10-geometry-foundations` form `gf-congruence-def__numeric`.

Observed global resolver failure: the form produced only two distinct widgets across the resolver seed sample (`expected 2 to be greater than 3`).
