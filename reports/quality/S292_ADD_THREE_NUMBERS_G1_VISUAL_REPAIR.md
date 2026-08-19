# S292 — Add Three Numbers Grade 1 Visual Repair

## Source evidence

The live P0 illustration-replacement queue identified `add-three-numbers-g1/g1t-01-01/c1` as a withheld `bar-join` fingerprint. The source audit reproduced the failure: `isFigureTextAligned("bar-join", body)` returned `false` because the caption described a generic three-group routine while the static model visibly states `7 + 5 = 12`.

The exact source file SHA-256 before repair was `fe819d19bfd1f26903b29a8aa2ade4da6b24915ceadad5a616fa67d059fb904a`.

## Repair

The concept caption and matching narration now name the shown two-part model — `7 + 5 = 12` — before using it as the bridge to the intended Grade 1 strategy: join two of three groups first, then add the third. This keeps the visual truthful without changing the learner job, answer path, widget schema, evaluator values, shared figure, or course progression.

`scripts/session/s292-add-three-numbers-g1-visual-repair.mjs` is guarded and idempotent. It accepts only the original fingerprint or the repaired fingerprint and fails on unexpected source drift.

The repaired source file SHA-256 is `4ba981fa6f94894d2409afd06f6d2f47458899b8eccdc8e80f1bd7f80cd48053`.

## Boundaries

Only `g1t-01-01.json`, the guarded replay, focused regression, and this report are in scope. No shared runtime, figure registry, queue/cards/cache/generated artifacts, generic human-disposition data, or other courses are changed.

## Verification

```powershell
node scripts/session/s292-add-three-numbers-g1-visual-repair.mjs
node scripts/session/s292-add-three-numbers-g1-visual-repair.mjs
pnpm exec vitest run src/lib/session292.addThreeNumbersG1VisualRepair.test.ts src/lib/session263.addThreeNumbersG1CourseIntegrity.test.tsx
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/add-three-numbers-g1/lessons/g1t-01-01.json scripts/session/s292-add-three-numbers-g1-visual-repair.mjs src/lib/session292.addThreeNumbersG1VisualRepair.test.ts reports/quality/S292_ADD_THREE_NUMBERS_G1_VISUAL_REPAIR.md
```
