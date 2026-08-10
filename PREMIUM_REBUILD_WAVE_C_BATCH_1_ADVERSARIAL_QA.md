# Premium Rebuild Adversarial QA — S228 Wave C Batch 1

## Ranked findings

| Rank | Finding | Decision |
|---:|---|---|
| 1 | The concept illustration taught addition of exponents while the prose taught multiplication for a power of a power. | FIXED with the existing rule-specific factor-group visual. |
| 2 | The support panel exposed internal labels and unrelated multi-domain copy before the learner requested help. | FIXED through progressive disclosure and exponent-specific copy. |
| 3 | Correct MCQ labels were conspicuously longer than misconception options in 22 repeated checks. | FIXED without changing distractors or feedback. |
| 4 | Expanded representation tabs were only 36 px tall. | FIXED at 44 px. |

## Checks

1. **Concept alignment — PASS.** The first exponent screen shows two `2³` groups, six total factors, and the power-of-a-power rule; the product rule retains its separate visual state.
2. **Information hierarchy — PASS.** The active task no longer shows “Mastery lens,” “Deep dive,” lifecycle chips, a generic base-ten manifesto, or representation values by default.
3. **Progressive disclosure — PASS.** The optional collapsed card reveals task-specific action, representations, and invariants only when activated.
4. **Internal vocabulary — PASS.** `task: exponentChain` is absent; the interaction uses factor-group language.
5. **MCQ leakage — PASS for batch.** All 22 target rows changed from REMEDIATE to KEEP in the regenerated audit.
6. **Meaning preservation — PASS.** Correct answers, distractors, feedback, evaluation, lesson order, and curriculum mathematics are unchanged.
7. **Responsive overflow — PASS.** The 390 px collapsed and expanded states report no horizontal page overflow.
8. **Target size — PASS.** Zero visible controls below 44 px after the tab repair.
9. **Keyboard/semantics — SOURCE PASS.** Disclosure and representations remain native buttons with `aria-expanded`, tablist, tab, and tabpanel semantics. Full physical Tab/Shift+Tab remains in CL-P1-035.
10. **Reduced motion — PASS by change scope.** No animation was added; the existing motion-reduce chevron contract remains.
11. **Assistive technology — SOURCE PASS / HARDWARE OPEN.** The corrected visual has an explanatory image title and equations retain MathML; physical NVDA/VoiceOver remains CL-P1-035.

## Remaining Wave C scope

675 audit rows remain. Continue with repeated patterns and high learner harm; do not treat the heuristic as authority to rewrite curriculum or convert mathematical judgment tasks.
