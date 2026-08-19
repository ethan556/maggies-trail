# S291 — Transformations & Measurement: Figure Truth and Choice Parity

Source-local packet for Grade 8 `transformations-measurement`.

## Closed source boundary

- 4 P0 fixed-number diagrams were fail-closed: `VIS-tm-03-03-c1-angle-types`, `VIS-tm-04-02-c2-tm-missing-leg`, `VIS-tm-05-02-c2-tm-cone-volume`, and `VIS-tm-05-03-c2-tm-sphere-volume`.
- 1 P0 diagram was retained after exact semantic verification: `tm-03-02/c2` / `la-triangle-sum`.
- 3 P1 MCQ surfaces were repaired: `CHOICE-0272`, `CHOICE-0273`, and `CHOICE-0274`.

The retained triangle-sum model supports the right-triangle rule: its three angles form 180°, so the stated 90° right angle leaves 90° for the other two. The removed figures did not support their exact bound surfaces: angle families cannot evidence AA similarity; the leg, cone, and sphere visuals show 4, 15π, and 36π while the lesson surfaces require 12, 60π, and 288π.

All MCQs preserve their step IDs, option IDs, correct response, prompt, feedback, and evaluator semantics. Only option labels were adjusted to be comparably specific, removing length/explanation cues.

## Reproducible checks

```text
node scripts/session/s291-transformations-measurement-figure-choice-repair.mjs --check
node scripts/session/s291-transformations-measurement-figure-choice-guard.mjs
npx vitest run src/lib/session291.transformationsMeasurementFigureChoice.test.ts
```

The repair is idempotent; the guard and regression source-seal each figure decision and all MCQ evaluator/label contracts.

## Residual boundary

P0/P1 progression and lesson-revision rows require broader question-job redesign and are intentionally untouched, as are generic assessor-only rows and all shared/derived artifacts.
