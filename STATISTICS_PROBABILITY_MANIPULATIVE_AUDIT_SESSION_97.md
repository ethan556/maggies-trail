# Session 97 — Statistics and Probability Manipulative Audit

## Audit decision

The six-course domain contains **164 interactive steps**, but only **45** are direct mathematical
manipulatives. The other 119 are answer-entry, sorting, matching, recognition, or reveal surfaces.
Session 97 does not inflate the manipulative count by treating every clickable element as a causal
model.

All **45/45 direct manipulatives** now carry explicit Causal Mastery Learning contracts. Nine are
full flagships and 36 are supporting wires. The contracts expose the action goal, invariant,
misconception signatures, representation mesh, fading level, and transfer family. Flagships also
include prediction, representation translation, counterfactual reasoning, causal explanation, and
delayed retrieval.

| Course | Direct manipulatives | CML-wired | Flagships | Supporting |
|---|---:|---:|---:|---:|
| measurement-data | 5 | 5 | 2 | 3 |
| data-distributions | 8 | 8 | 2 | 6 |
| sampling-and-probability | 4 | 4 | 1 | 3 |
| bivariate-statistics | 7 | 7 | 2 | 5 |
| conditional-probability | 15 | 15 | 1 | 14 |
| statistical-inference | 6 | 6 | 1 | 5 |
| **Total** | **45** | **45** | **9** | **36** |

## Reused engines

The audit retained the existing engines where they already exposed the governing mathematics:

- `clockSet` for elapsed time and cyclic measurement
- `barBuilder`, `dotPlot`, and `boxPlot` for distributions and scale
- `plotPoint` and `scatterFit` for paired data, residuals, and prediction
- `samplingBiasLab`, `sampleSim`, and `ciCapture` for sampling design and inference
- `shuffleTest` for null-model randomization
- `spinnerSim`, `probabilityArea`, and `treeDiagram` for sample spaces and multistage chance
- `areaModel` for multiplicative measurement

Adding replacements for these engines would have increased novelty without improving mathematical
causality.

## New engine: `conditionalTableLab`

One genuine instructional gap remained. The prior two-way-table lesson used `tapDiagram`, which could
select a row but could not make conditional direction live. The replacement laboratory lets the
learner:

1. choose any row or column as the condition;
2. see that group's total become the denominator;
3. choose the joint cell that becomes the numerator;
4. reverse the conditional while holding the intersection fixed;
5. compare the resulting probabilities before checking.

This directly targets the two durable misconceptions in conditional probability:

- reversing `P(A|B)` and `P(B|A)`;
- dividing every probability by the grand total even after conditioning.

The engine is integrated through schema, renderer, evaluator, check readiness, state description,
pedagogy feedback, process events, responsive stage sizing, sample gallery, capability catalog, CML
engine profile, representation mesh, and strict direct-manipulative classification. Its evaluator
truth table independently verifies success, insufficient exploration, wrong condition, and wrong
intersection paths.

## Result

Statistics and probability now has complete direct-manipulative CML coverage without unnecessary
engine proliferation. The portfolio emphasizes repeated experimentation, visible denominators,
distribution structure, sampling variability, and inference under explicit invariants rather than
static formula recognition.
