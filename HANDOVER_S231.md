# Handover — Session 231

S230 sealed Premium Rebuild **Wave C batch 3**. Continue **Wave C batch 4**; do not begin prediction rationalization yet.

## Start here

1. Read `PREMIUM_REBUILD_WAVE_C_BATCH_3_EXECUTION.md` and `PREMIUM_REBUILD_WAVE_C_BATCH_3_ADVERSARIAL_QA.md`.
2. Use the regenerated `MCQ_DISTRACTOR_AUDIT.csv`; 633 REMEDIATE rows remain.
3. Group the remaining repeated families, then rank singletons by learner harm × frequency × visibility × strategic importance.
4. Good next candidates include repeated standard-versus-partial-quotients and quotient/remainder-check families, but each still needs row-level human review.
5. Preserve wrong-option misconceptions and all feedback. Edit keyed labels only when the audit evidence and curriculum review both support it.
6. Keep ambiguous strategy, geometry-language, and context-sensitive prompts outside label-only batches; treat them as separate curriculum-correctness work.
7. Preserve the S227 canonical math boundary and the S228 progressive-disclosure/exponent-visual contracts.

## Retained items

- CL-P1-035: physical NVDA/VoiceOver, 200% zoom, forced colors, real-device touch, and complete Tab/Shift+Tab traversal.
- CL-P1-044: pre-existing strict CML `re-04-02` baseline.
- CL-P1-051: `asv-01-01` mobile figure-label crop for Wave E.
- The awkward pre-existing `g5u-03-02` correct feedback needs a separately reviewed content correction; do not mix it into label-only leakage remediation.
- Content/pedagogy `tsx` commands remain blocked by `uv_os_get_passwd` / `ENOMEM` on this Windows host.
- S229 retains the documented local Playwright browser-server orchestration exception; S230's source gates and production build are green.

Wave D begins only after the evidence-backed Wave C batches are sealed or explicitly dispositioned.
