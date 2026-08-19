# S293 — Four Addends Grade 2 Visual Repair

## Source evidence

Fresh post-commit K–G2 source auditing left `four-addends-g2/g2n-03-02/c2` as the highest-priority clean visual mismatch. The P0 queue records a withheld `add-balance-scale` fingerprint, and `isFigureTextAligned("add-balance-scale", body)` reproduced the failure: the caption described regrouping only, while the accessible static balance visibly asserts `6 + 4 = 10`.

The exact source-file SHA-256 before repair was `75ce749e51b8cb8f3ab51784fcc6ab896963ae2ee3c84d501d825af1e468a4cc`.

## Repair

The displayed concept’s caption and matching narration now name the shown equality, then connect that equality to the Grade 2 regrouping check: both sides name the same amount, so two correct addition paths must agree. The non-visual remedial explanation remains untouched.

`scripts/session/s293-four-addends-g2-visual-repair.mjs` is guarded and idempotent. It accepts only the original or repaired `g2n-03-02/c2` payload and fails on any other source drift.

The repaired source-file SHA-256 is `cc6ea9fc049bcfaed6b5a2310e8032b137af5e43ac5afe8a0a94a883a4d98e81`.

## Boundaries

Only `g2n-03-02.json`, the guarded replay, focused regression, and this report are changed. The shared visual, registry, runtime, learner-job IDs, widget schemas, evaluator answers, generic human-disposition rows, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s293-four-addends-g2-visual-repair.mjs
node scripts/session/s293-four-addends-g2-visual-repair.mjs
pnpm exec vitest run src/lib/session293.fourAddendsG2VisualRepair.test.ts src/lib/session263.fourAddendsG2CourseIntegrity.test.tsx
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/four-addends-g2/lessons/g2n-03-02.json scripts/session/s293-four-addends-g2-visual-repair.mjs src/lib/session293.fourAddendsG2VisualRepair.test.ts reports/quality/S293_FOUR_ADDENDS_G2_VISUAL_REPAIR.md
```
