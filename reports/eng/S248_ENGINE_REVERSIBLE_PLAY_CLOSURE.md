# S248 engine reversible-play closure

## Outcome

The 17 `ENGINE_REVERSIBLE_PLAY` rows are source-closed by one explicit exploration-contract
registry and focused renderer evidence. No lesson JSON, evaluator, learner value, grading path,
queue, review card, cache, standards record, or deployment surface changed.

The old audit inferred play depth only from the coarse `manipulation` score in
`PREMIUM_ENGINE_PRIORITY.csv`. That score called editable inputs and radio groups `ANSWER_ONLY`
even though a learner can replace a response and restore it through the same native control. It
also demanded alternate wrong states from `steppedReveal`, which is an ordered explanation with no
learner answer state. Adding a fake wrong state there would invent mathematics rather than improve
exploration.

## Contract disposition

| Contract family | Engines | Disposition |
|---|---:|---|
| Reversible typed response | 3 | `numeric`, `fractionEntry`, and `pointEntry` replace and restore values through labelled inputs. |
| Reversible choice response | 5 | `mcq`, `placeCompare`, `rationalCompare`, `absValueLine`, and `fractionCompare` change and restore claims through native choice controls. |
| Reversible construction/classification | 4 | `buildExpression`, `dragBucket`, `matchPairs`, and `dragOrder` remove/move/unlink and restore through keyboard-native controls. |
| Reversible derivation/observation | 2 | `exactNumberLab` changes its response without discarding inspected evidence; `subitizeFlash` permits re-observation and reselection. |
| Ordered disclosure | 1 | `steppedReveal` remains forward-only and is explicitly `NOT_APPLICABLE` to answer-state play. |
| Unused experimental causal controls | 2 | `radicalCheck` and `toggleExplore` round-trip in the component gallery but remain at zero authored uses. |

All 16 stateful controls remain unlocked at `tone="info"`. Every response round trip is checked by
the unchanged `evaluate` function. The active-tone matrix verifies that the new evidence contract
does not add a pre-verdict correct-answer ghost. Controls are native inputs/buttons/radios/sliders;
existing focus, touch-target, keyboard, `aria-*`, and `motion-reduce:*` behavior is unchanged.

## Acceptance evidence

- Focused renderer suite: **31/31 PASS**.
- Audit authority suite: exact **17/17** contract rows, zero duplicate types, zero remaining
  `REMEDIATE_ENGINE_PLAY` rows.
- Whole audit regeneration: **127/127** engines now have evidence-backed
  `KEEP_WITH_EXPLORATION_REGRESSION` dispositions.
- Authored-corpus boundary: `radicalCheck` **0**, `toggleExplore` **0**.
- No answer or grading semantics changed.

## Source seals

- Contract registry: `d14102fd9ff4219e34db8ea939c28a6f7a944e391cdc2722cfef38af7978e9a1`
- Focused component evidence: `93d638c00437c51b004a029d08c66d97c4c56f95a798a3847a4a0ead162df65d`
- Deterministic audit generator: `cea98d987b473cc706b758036806044af65b116e812f28de45adc97df711af3c`
- Regenerated engine audit: `e76d7e34b96649d9d275fd0fa06d32db88a0697eaee28dea2e5a3640f74d4884`

These seals identify this packet before the audit-authority test and this report were added; the
runtime and generated-audit seals are unaffected by those additive evidence files.
