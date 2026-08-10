# Calculus completion and causal manipulative integration — Session 96

## Executive result

Session 96 completes all eight Calculus courses after the Precalculus stage and extends the causal-manipulative system across the advanced curriculum.

- Calculus rises from **72/312 (23.08%)** runtime-served assessments to **312/312 (100%)**.
- The release completes **240 exact runtime gaps** through **146 form contracts** and **eight generator families**.
- Overall runtime coverage reaches **4,444/4,471 (99.40%)**, leaving 27 gaps outside the requested Precalculus/Calculus scope.
- All **53 genuine Calculus manipulatives** now carry explicit CML contracts.
- Every Calculus course receives one flagship; 45 direct manipulatives receive supporting wiring.
- Two missing causal mechanisms are added: derivative-rule construction and coupled related-rates motion.

## Course completion

| Course | Baseline | Completed | Gaps completed |
|---|---:|---:|---:|
| Curve Analysis | 32/60 | **60/60** | 28 |
| Derivative Rules | 40/60 | **60/60** | 20 |
| Derivatives In Context | 0/44 | **44/44** | 44 |
| Differential Equations | 0/24 | **24/24** | 24 |
| Integration Accumulation | 0/60 | **60/60** | 60 |
| Integration Applications | 0/24 | **24/24** | 24 |
| Parametric & Polar Calculus | 0/16 | **16/16** | 16 |
| Series Convergence | 0/24 | **24/24** | 24 |
| **Total** | **72/312** | **312/312** | **240** |

## Compiler verification

- **240** exact declarations;
- **146** reusable form contracts;
- **8** generator families;
- **131,400** focused deterministic builds;
- **131,400** independent prompt/state checks;
- **61,320** production-evaluator builds;
- **434,688** evaluator assertions.

## Manipulative review

| Course | Interactive surfaces | Direct manipulatives | CML wired | Flagship | Supporting |
|---|---:|---:|---:|---:|---:|
| Curve Analysis | 15 | 11 | **11** | 1 | 10 |
| Derivative Rules | 15 | 8 | **8** | 1 | 7 |
| Derivatives In Context | 11 | 6 | **6** | 1 | 5 |
| Differential Equations | 6 | 6 | **6** | 1 | 5 |
| Integration Accumulation | 15 | 10 | **10** | 1 | 9 |
| Integration Applications | 6 | 6 | **6** | 1 | 5 |
| Parametric & Polar Calculus | 4 | 2 | **2** | 1 | 1 |
| Series Convergence | 6 | 4 | **4** | 1 | 3 |
| **Total** | **78** | **53** | **53** | **8** | **45** |

### Engine decisions

| Engine | Uses | Decision |
|---|---:|---|
| `accumulateArea` | 7 | Reuse and CML-wire |
| `derivativeRuleLab` | 2 | **New causal laboratory** |
| `derivativeTrace` | 7 | Reuse and CML-wire |
| `expLogExplore` | 1 | Reuse and CML-wire |
| `graphZoom` | 3 | Reuse and CML-wire |
| `relatedRatesLab` | 1 | **New causal laboratory** |
| `riemannSum` | 4 | Reuse and CML-wire |
| `secantSlope` | 2 | Reuse and CML-wire |
| `sequenceBuild` | 1 | Reuse and CML-wire |
| `signChart` | 8 | Reuse and CML-wire |
| `sliceSum` | 5 | Reuse and CML-wire |
| `slopeField` | 6 | Reuse and CML-wire |
| `taylorApprox` | 3 | Reuse and CML-wire |
| `unitCircleExplore` | 2 | Reuse and CML-wire |
| `vectorExplore` | 1 | Reuse and CML-wire |

### New `derivativeRuleLab`

The product-rule mode makes the derivative of a product emerge from a changing rectangle: two first-order strips survive after division by the input change, while the second-order corner vanishes. The chain-rule mode exposes nested rates as a linked inner/outer mechanism rather than a memorized instruction to “multiply by the inside derivative.” The modes replace passive reveal steps in `dr-03-01#i1` and `dr-04-01#i1`.

### New `relatedRatesLab`

The sliding-ladder laboratory couples x and y through a fixed-length constraint. Learners move the ladder, control one rate, observe the dependent rate and sign, and test how geometry changes the rate relationship. It replaces the passive reveal in `dc-02-02#i1`.

The existing `secantSlope`, `derivativeTrace`, `accumulateArea`, `riemannSum`, `slopeField`, `sliceSum`, `signChart`, `taylorApprox`, and parametric/polar engines were retained because they already expose meaningful mathematical state. Session 96 upgrades their course-wide causal contract rather than creating redundant bespoke widgets.

## Combined advanced-curriculum integrity

Across Precalculus and Calculus:

- **621** exact variant declarations were added;
- **82** direct manipulatives received CML contracts;
- **16** course flagships were established;
- **four** passive/recognition moments were replaced by causal laboratories;
- **three** new engine types were added;
- **zero** unintended lesson changes were detected.

## Status

**PASS. Calculus is runtime-complete, all direct manipulatives are CML-wired, and overall refresh coverage is 99.40%.**
