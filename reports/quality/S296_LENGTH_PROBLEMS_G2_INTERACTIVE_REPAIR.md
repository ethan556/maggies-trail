# S296 — Length Problems Grade 2 Interactive Repair

## Source evidence

Fresh post-`c21763e` source auditing found ten exact `i1` → `i2` interactive-widget clones in the clean `length-problems-g2` course: four `lengthCompare` retries, one `unitRuler` retry, and five `numberLineHop` retries. The clones made the second interactive step a duplicate attempt rather than a second representation or a corrective reasoning pass.

The same audit found four `lengthCompare` success captions that said the *bottom* bar was longer even though the authored `answerId` was `top` and the top bar had the greater length. That is a learner-visible picture/text correctness defect.

The exact pre-repair source-set SHA-256 (the ten lesson JSON files in sorted filename order) was `ac3f6e7b4f5409653c2973b16fddfb56dc21837817c21935038a8030e409ef17`.

## Repair

Each `i2` now provides a distinct, mathematically equivalent learner job:

- `lengthCompare` retries reverse the misleading screen placement, requiring the learner to align starts before comparing the same correct bar.
- The `unitRuler` retry moves the same four-unit ribbon from 2–6 to 4–8, making the non-zero start explicit without changing its measured length.
- `numberLineHop` retries preserve their original endpoints while partitioning the added length into five-unit hops instead of ten-unit hops.

All four comparison success captions now name the actual longer bar and, for the suspicious-gap lesson, explain why a gap longer than the item is not reasonable.

`scripts/session/s296-length-problems-g2-interactive-repair.mjs` is guarded and idempotent: it accepts only the original or repaired payload for every target and fails on any source drift.

The repaired source-set SHA-256 is `c151fe57ce5dee53c613e5a7a1e9f34796881938012886bdd091e7a25d676856`.

## Boundaries

Only the ten course lesson files, the guarded replay script, the focused regression, and this report change. Learner-job IDs, widget types, labels, evaluator semantics, correct endpoints, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s296-length-problems-g2-interactive-repair.mjs
node scripts/session/s296-length-problems-g2-interactive-repair.mjs
pnpm exec vitest run src/lib/session296.lengthProblemsG2InteractiveRepair.test.ts src/lib/session261.lengthProblemsG2Course.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/length-problems-g2 scripts/session/s296-length-problems-g2-interactive-repair.mjs src/lib/session296.lengthProblemsG2InteractiveRepair.test.ts reports/quality/S296_LENGTH_PROBLEMS_G2_INTERACTIVE_REPAIR.md
```
