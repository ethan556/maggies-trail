# Session 144 implementation report

## Engine: `proportionalReasoningLab`

The engine is intentionally broader than a unit-rate widget and narrower than a generic arithmetic workbench. Its finite task language represents one mathematical invariant—constant multiplicative covariation—and truthful ordered extensions of that invariant.

### Supported task projections

1. normalize one pair to a unit rate;
2. compare two or three constant rates;
3. predict output from input;
4. recover input from output;
5. decide whether a stated steady-rate assumption holds;
6. test a table for proportionality;
7. identify the constant of proportionality;
8. scale a ratio;
9. compute a percent through a per-100 stage;
10. compute a discount through subtotal → discount → final-total stages;
11. choose the better rate and then predict its total.

### Eight operational surfaces

- **Schema and integrity:** plain `ZodObject` union member; unique series/pairs/choices; no zero divisors; exact truth-carrier exclusivity; task-required fields; constant-ratio constraints; finite truth; trap collision checks.
- **Renderer:** paired tables, row-normalization controls, explicit multiplicative stages, numeric or semantic response, separate reveal ghost, no initial conclusion leak.
- **Grading:** the pure truth model and only truth-model-derived exploration keys; fabricated state cannot satisfy the exploration requirement.
- **Checkability and answer text:** task-aware finite answer or semantic claim.
- **Narration and accessibility:** keyboard-native buttons, explicit row/stage labels, no color-only semantics, bounded state narration.
- **Pedagogy:** named numeric and semantic misconception routes.
- **Generation:** 20 existing authored forms are upgraded to the causal surface; no targeted form falls back to MCQ or numeric entry.
- **CML/registration:** direct-engine representation, covariation kernel, stage width, sample, capability matrix, mastery mission, and registration contract.

## Mathematical safety decisions

- A predictive task is rejected when the target ratios are not constant.
- A rate comparison is rejected unless every compared series has a constant ratio.
- `predictInput` rejects a zero constant.
- Every choice carries exactly one mathematical truth carrier: semantic `claim` or numeric `value`.
- Numeric traps must be unique and outside tolerance of the derived answer.
- Exploration credit is limited to row and stage keys derived by the truth model.
- Percent and discount never use a generic calculator path.
- The renderer does not announce proportionality or the winning rate before the learner inspects the required evidence.

## Exact-fit rejection record

The division-workbench, rational-decimal, power-place, root-number-line, function-comparison, rounding, and systems families remain queued where combining them would either shrink closure or change the learner action. Full dispositions appear in `SESSION144_EXACT_FIT_RERANK.md/json`.
