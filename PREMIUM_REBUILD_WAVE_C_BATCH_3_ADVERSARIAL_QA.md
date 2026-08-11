# Premium Rebuild Adversarial QA — S230 Wave C Batch 3

## Ranked findings

| Rank | Finding | Decision |
|---:|---|---|
| 1 | Six Grade 5 concept prompts repeated three times each exposed the keyed response through unique length. | FIXED across all 18 authored/remedial checks. |
| 2 | A 27-row expansion included prompts with ambiguous strategy claims, geometry-language problems, or context-sensitive premises. | REJECTED; those families remain for curriculum review. |
| 3 | Shortening could erase the mathematical conclusion or make the label too vague. | PREVENTED; every replacement retains the exact conclusion needed to answer its prompt. |
| 4 | Regeneration could change unrelated audit rows. | PREVENTED; exactly 18 target decisions changed and zero non-target decisions changed. |

## Checks

1. **Blind-guess heuristic — PASS.** All 18 selected rows report `longest_option_leak=no`, `punctuation_leak=no`, and `decision=KEEP`.
2. **Meaning preservation — PASS.** The replacement labels preserve remainder interpretation, operation priority, algorithm validity, reasonableness, cubic-unit meaning, and prism generality.
3. **Distractor preservation — PASS.** All 54 wrong choices and their misconception roles are unchanged.
4. **Feedback preservation — PASS.** All 72 authored correct/incorrect feedback strings are unchanged.
5. **Correctness preservation — PASS.** No answer marker, evaluator, widget type, prompt, hint, or lesson ordering changed.
6. **Schema shape — PASS.** All seven edited lesson JSON files parse; five owning course suites pass 81/81.
7. **Shared-system regression — PASS.** Typecheck, CML integration, math formatting, engine registration, visual registration, production build, and offline production security audit pass.
8. **Scope control — PASS.** The content diff contains 36 changed label lines and zero non-label content changes; the direct-manipulation audit is unchanged.
9. **Curriculum-truth boundary — PASS.** The batch excludes the delicate “add 6” versus “add 3” premise, ambiguous fastest-strategy claims, and geometry items whose authored wording needs a separate correctness review.
10. **Known copy issue — RETAINED.** The existing `g5u-03-02` correct feedback says “both fractions are under a half and a half”; fixing that awkward sentence would change feedback and is deferred to a separately reviewed content-correction batch.
11. **Host exceptions — RETAINED.** Content/pedagogy commands fail before project code with `uv_os_get_passwd` / `ENOMEM`; S229 documents the Windows Playwright server-orchestration exception.
12. **Assistive technology — RETAINED.** Physical NVDA/VoiceOver, 200% zoom, forced colors, real-device touch, and complete Tab/Shift+Tab traversal remain CL-P1-035.

## Remaining Wave C scope

633 rows remain. Continue with human-reviewed repeated families and then high-harm singletons. Do not optimize the metric by weakening distractors, shortening away mathematical specificity, or silently repairing questionable curriculum premises inside a leakage batch.
