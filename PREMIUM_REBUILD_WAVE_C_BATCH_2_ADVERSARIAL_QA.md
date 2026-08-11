# Premium Rebuild Adversarial QA — S229 Wave C Batch 2

## Ranked findings

| Rank | Finding | Decision |
|---:|---|---|
| 1 | Six foundational prompts repeated four times each exposed the keyed response through unique length or punctuation. | FIXED across all 24 authored/remedial checks. |
| 2 | The original keyed labels mixed answer selection with the full explanation, while distractors were shorter selection labels. | FIXED by moving no reasoning and relying on the already-authored post-selection feedback. |
| 3 | A batch rewrite could accidentally change a misconception, correct marker, or feedback rationale. | PREVENTED; the lesson diff contains keyed-label replacements only. |
| 4 | `3/4` remains mathematical content after shortening. | PRESERVED in the canonical math-typesetting audit and shared rendering boundary. |

## Checks

1. **Blind-guess heuristic — PASS.** All 24 selected rows report `longest_option_leak=no`, `punctuation_leak=no`, and `decision=KEEP`.
2. **Meaning preservation — PASS.** The six replacement labels state the same mathematical conclusion as the original labels.
3. **Distractor preservation — PASS.** All 72 wrong choices and their authored misconception feedback are unchanged.
4. **Correctness preservation — PASS.** No answer marker, evaluator, widget type, prompt, hint, or success/failure feedback changed.
5. **Grade-language fit — PASS.** The Grade 2 label uses direct part–whole language; Grade 4 and 5 labels remain concise but mathematically specific.
6. **Schema shape — PASS.** All 12 edited lesson JSON files parse; the four owning course suites pass 65/65.
7. **Shared-system regression — PASS.** Typecheck, CML integration, math formatting, engine registration, visual registration, production build, and offline production security audit pass.
8. **Scope control — PASS.** Prediction, direct-manipulation, visual, and engine decisions are unchanged.
9. **Browser automation — HOST EXCEPTION.** The managed Playwright dev server timed out after the API smoke passed; an isolated production-server retry also could not establish a browser target on this Windows host. No browser assertion identified a learner-facing regression.
10. **Assistive technology — RETAINED.** Physical NVDA/VoiceOver, 200% zoom, forced colors, real-device touch, and complete Tab/Shift+Tab traversal remain CL-P1-035.

## Remaining Wave C scope

651 rows remain. Continue with repeated prompt families ranked by learner harm × frequency × visibility × strategic importance; do not rewrite judgment tasks or weaken distractor diagnoses merely to lower the queue.
