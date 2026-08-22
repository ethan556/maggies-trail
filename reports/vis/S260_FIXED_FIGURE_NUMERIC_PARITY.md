# S260 fixed-figure numeric parity

## Outcome

The learner-visible VIS-03 fixed-example mismatch count is **40 → 0**. The final evidence is bound to input seal `d61526b3d7cb373c8adc732687cc6b0a770ea760bbd0699a002a7f578ebdc81d` in `VIS03_FIGURE_EXEMPLAR_DRIFT.csv`.

This is a safety floor, not a claim that all visual replacement work is complete. A mismatched fixed exemplar now fails closed; those withheld placements remain explicit semantic-replacement debt.

## Root-cause correction

- Replaced the four-entry-only runtime model with a source-controlled registry of 51 fixed-number figure contracts.
- Contracts preserve signed integers, decimals, and fractions; distinguish adding/subtracting a negative from a positive; and compare number-line direction.
- Explicit authored examples are checked before narrow generic-semantic patterns. Low-overlap worked examples or opposite operation/direction claims are withheld.
- Every declared claim is rendered in a regression and compared with the figure's visible text plus title, desc, and ARIA channels.
- The whole corpus is traversed deterministically. Aligned placements render; every contract mismatch is proven to fail closed.
- VIS-03 now seals its audit/runtime/corpus inputs with SHA-256 and states that zero learner-visible conflicts does not erase replacement debt.

## Seven RNO source repairs

| Lesson/step | Old figure | Current truthful figure |
|---|---|---|
| `rno-01-01/c1` | `integer-jump` (`−4 + 9 = 5`) | `rno7-add-same-line` (`−3 + (−5) = −8`) |
| `rno-01-01/c2` | `integer-jump` (rightward `+9`) | `rno7-add-same-line` (leftward `−5`) |
| `rno-02-01/c1` | `integer-jump` | `rno7-subtract-opposite-five-three` (`5 − 3 = 5 + (−3) = 2`) |
| `rno-02-02/c1` | `integer-jump` (`−4 → 5`, `+9`) | `rno7-change-rise-line` (`−3 → 5`, `+8`) |
| `rno-02-03/c3` | `rno-add-opposite` (`8 − 3`) | `rno7-subtract-negative` (`a − (−b) = a + b`) |
| `rno-04-02/c1` | `integer-jump` | `rno7-signed-decimal-addition` (`−2.5 + 1.75 = −0.75`) |
| `rno-04-02/c2` | `rno-add-opposite` | `rno7-signed-decimal` (`3.25 − (−1.5) = 4.75`) |

The repair script is guarded and idempotent: `node scripts/session/s260-repair-rno-figure-parity.mjs --check` reports `CURRENT`.

## Whole-app floor

The former 40 visible conflicts spanned 31 figure families. All 31 are now declared and renderer-sealed. The repeated root causes were `radical-factor` (4), plus `pv3-borrow-zero`, `dop-count-places`, `fa-repeated-add`, `pv3-times-tens`, `pv3-expanded`, and `sp-mad-ruler` (2 each in the prior VIS-03 list). The remaining singleton families are also guarded.

Final VIS-03 regeneration at the sealed source reports:

- 3,623 authored figure placements
- 3,130 rendering placements
- 334 rendering fixed numeric-claim placements assessed by VIS-03 after runtime gates
- **0 learner-visible high-confidence fixed-example conflicts**

## Current corpus disposition

The declared-contract corpus contains **120 placements**: **63 are allowed to render** and **57 are explicit semantic-replacement debt**. All 57 debt placements are rejected by `isFigureTextAligned` (**57 safely withheld, 0 unsafe**), so none can appear in the zero-row VIS-03 learner-visible mismatch evidence. The debt divides into **26 explicit-claim mismatches** and **31 narrow generic-contract mismatches**.

| Lesson | Object path | Fixed figure | Debt class | Reason |
|---|---|---|---|---|
| `g2b-02-04` | `$.steps[3]` | `pv3-borrow-zero` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2b-02-04` | `$.remedials[0].concept` | `pv3-borrow-zero` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-02-03` | `$.steps[3]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-02-03` | `$.remedials[0].concept` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-02-04` | `$.steps[0]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-03-01` | `$.steps[0]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-03-01` | `$.remedials[0].concept` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-03-02` | `$.steps[3]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g2g-03-03` | `$.steps[3]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g5d-01-06` | `$.steps[3]` | `dop-count-places` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1.2+0.5+0.60]` |
| `g5d-02-01` | `$.steps[3]` | `dop-count-places` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1.2+0.5+0.60]` |
| `g5d-02-03` | `$.steps[0]` | `dop-count-places` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g5d-03-02` | `$.steps[3]` | `dop-count-places` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `dop-05-02` | `$.steps[0]` | `dop-count-places` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1.2+0.5+0.60]` |
| `dop-05-03` | `$.steps[0]` | `dop-count-places` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1.2+0.5+0.60]` |
| `dpv-02-02` | `$.steps[0]` | `dpv-expanded` | explicit claim | `FIXED_VALUE_MISMATCH[missing=0.347+0.3+0.04+0.007]` |
| `dpv-02-02` | `$.steps[3]` | `dpv-expanded` | explicit claim | `FIXED_VALUE_MISMATCH[missing=0.347+0.3+0.04+0.007]` |
| `ep-01-01` | `$.steps[0]` | `exponent-repeat` | explicit claim | `FIXED_VALUE_MISMATCH[missing=3+2+5]` |
| `esn-01b-01` | `$.steps[0]` | `exponent-repeat` | explicit claim | `FIXED_VALUE_MISMATCH[missing=3+2+5]` |
| `ee-02b-02` | `$.steps[4]` | `expression-machine` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4x-01-01` | `$.steps[0]` | `fa-repeated-add` | explicit claim | `FIXED_VALUE_MISMATCH[missing=3+6/5+1+1/5]` |
| `g4x-01-01` | `$.steps[3]` | `fa-add-like` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4x-01-03` | `$.steps[3]` | `fa-repeated-add` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4x-02-01` | `$.remedials[0].concept` | `fa-repeated-add` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4x-03-01` | `$.steps[3]` | `fa-repeated-add` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `fa-03-01` | `$.steps[0]` | `fa-add-like` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `fa-03-01` | `$.steps[3]` | `fa-add-like` | explicit claim | `FIXED_VALUE_MISMATCH[missing=2/5+1/5+3/5]` |
| `fa-05-01` | `$.steps[3]` | `fa-repeated-add` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `fa-05-02` | `$.steps[0]` | `fa-repeated-add` | explicit claim | `FIXED_VALUE_MISMATCH[missing=2/5+6/5+1+1/5]` |
| `fg-02-02` | `$.steps[0]` | `similar-triangles-slope` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `fg-02-02` | `$.steps[2]` | `similar-triangles-slope` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1/1+3/3]` |
| `mmt-05-01` | `$.steps[0]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `mmt-05-03` | `$.steps[0]` | `single-scale-graph` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4m-03-02` | `$.steps[0]` | `mb-remainder` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g4m-03-03` | `$.steps[3]` | `mb-remainder` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `mf3-01-01` | `$.steps[0]` | `mult3-double` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `mb-01-01` | `$.steps[3]` | `mb-times-compare` | explicit claim | `FIXED_VALUE_MISMATCH[missing=9+3]` |
| `mb-01-02` | `$.steps[0]` | `mb-times-compare` | explicit claim | `FIXED_VALUE_MISMATCH[missing=9+3]` |
| `mb-03-01` | `$.steps[0]` | `pv3-times-tens` | explicit claim | `FIXED_VALUE_MISMATCH[missing=60+6+240]` |
| `mb-03-01` | `$.steps[3]` | `pv3-times-tens` | explicit claim | `FIXED_VALUE_MISMATCH[missing=60+6+240]` |
| `mb-03-02` | `$.steps[0]` | `mb-break-area` | explicit claim | `FIXED_VALUE_MISMATCH[missing=27+80+28+108]` |
| `ns-02-03` | `$.steps[0]` | `dop-count-places` | explicit claim | `FIXED_VALUE_MISMATCH[missing=1.2+0.5+0.60]` |
| `pv2-04-03` | `$.steps[0]` | `pv3-borrow-zero` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `pv-01-02` | `$.steps[0]` | `pv3-expanded` | explicit claim | `FIXED_VALUE_MISMATCH[missing=342+300+40]` |
| `pv-01-02` | `$.steps[3]` | `pv3-expanded` | explicit claim | `FIXED_VALUE_MISMATCH[missing=342+300+40]` |
| `pv-03-03` | `$.steps[0]` | `pv3-borrow-zero` | explicit claim | `FIXED_VALUE_MISMATCH[missing=305+128]` |
| `pv-04-03` | `$.steps[0]` | `pv3-times-tens` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `pv-04-03` | `$.steps[3]` | `pv3-times-tens` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `pr-04-01` | `$.steps[5]` | `pr-percent-shortcut` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `rad-01-01` | `$.steps[0]` | `radical-factor` | explicit claim | `FIXED_VALUE_MISMATCH[missing=72+2+6]` |
| `rad-01-03` | `$.steps[0]` | `radical-factor` | explicit claim | `FIXED_VALUE_MISMATCH[missing=72+36+6]` |
| `rad-03-01` | `$.steps[0]` | `radical-factor` | explicit claim | `FIXED_VALUE_MISMATCH[missing=72+36+2+6]` |
| `rad-03-02` | `$.steps[0]` | `radical-factor` | explicit claim | `FIXED_VALUE_MISMATCH[missing=72+36+6]` |
| `rad-03-03` | `$.steps[0]` | `radical-factor` | explicit claim | `FIXED_VALUE_MISMATCH[missing=72+36+2+6]` |
| `tm-03-03` | `$.steps[0]` | `angle-types` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g5u-01-05` | `$.steps[3]` | `fa-add-like` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |
| `g5u-02-02` | `$.steps[0]` | `fa-add-like` | generic contract | `GENERIC_SEMANTIC_CONTRACT_MISMATCH` |

## Verification

- `src/lib/figureNumericParity.test.ts`: signed-value, symbolic-equivalence, operation-polarity, direction, and generic-prose cases
- `src/components/fixedFigureNumericParity.s260.test.tsx`: renderer-channel claim seal plus corpus fail-closed proof
- `src/lib/figureTextAlignment.test.ts`: complete fixed-exemplar runtime census
- `src/components/figures.split.test.ts`: registry/ID parity
- `scripts/audit/fixed-figure-numeric-parity.mts`: deterministic declared-contract corpus detector
- `scripts/audit/figure-exemplar-drift.mts`: independently regenerated learner-visible VIS-03 evidence
