# S294 — Equations and Unknowns Grade 1 Choice + Visual Repair

## Source evidence

Fresh K–G2 auditing identified one remaining non-excluded P0 figure/text mismatch: `g1e-03-03/c2` pairs `add-balance-scale` with a generic true-equation caption. The accessible static visual explicitly shows `6 + 4 = 10`; the former caption returned `false` from `isFigureTextAligned`.

The live P1 lesson-review records also identify a course-wide location cue: all 19 Grade 1 MCQs placed the correct stable choice ID `o0` first. Three prompts used generator-shaped `end/middle/start-unknown` wording, and one check label used formal `Substitute` wording.

## Repair

- The balance caption and narration now name `6 + 4 = 10` while retaining the expression-versus-equation distinction.
- The 19 MCQ option objects rotate across array indices 1, 2, and 3. Their IDs, text, feedback, `correct` flags, widget type, prompt, and evaluator truth remain unchanged.
- Three prompts now say `Find the missing number`, and one label says `Put in 8 and check`; no numerical path changes.

`scripts/session/s294-equations-unknowns-g1-choice-visual-repair.mjs` is guarded and idempotent. It accepts only canonical pre-repair MCQ orders or the prescribed repaired order, retains `o0` as the only correct ID, and fails on source drift.

## Boundaries

This packet changes only source lessons in `equations-unknowns-g1`, its replay, focused regression, and this report. It does not add an equation-authoring widget: that separate P1 finding needs a product/evaluator decision. Shared runtime, figures, registries, learner IDs, answer values, correctness flags, generated queue/cards/cache artifacts, and other courses are untouched.

The deterministic SHA-256 of the sorted twelve-lesson source-hash manifest after repair is `2fb45a75b1ccf0282e367dd6b7ff5e3770498976e4a17b7c33776b4f9b115d35`.

## Verification

```powershell
node scripts/session/s294-equations-unknowns-g1-choice-visual-repair.mjs
node scripts/session/s294-equations-unknowns-g1-choice-visual-repair.mjs
pnpm exec vitest run src/lib/session294.equationsUnknownsG1ChoiceVisualRepair.test.ts src/lib/session259.equationsUnknownsG1CourseIntegrity.test.tsx
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/equations-unknowns-g1 scripts/session/s294-equations-unknowns-g1-choice-visual-repair.mjs src/lib/session294.equationsUnknownsG1ChoiceVisualRepair.test.ts reports/quality/S294_EQUATIONS_UNKNOWNS_G1_CHOICE_VISUAL_REPAIR.md
```
