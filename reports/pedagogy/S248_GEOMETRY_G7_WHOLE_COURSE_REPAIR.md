# S248 Geometry Grade 7 Whole-Course Repair

## Scope and authority

This bounded packet repairs the complete 21-lesson `geometry-g7` course without editing the shared queue, review cards, cache, ledgers, standards evidence, generators, evaluators, or renderers. The course files were clean and unowned when the packet began.

The authoritative pending-workload queue contained 164 `geometry-g7` rows. Fifty-five standards decisions are deliberately excluded from this source packet. The remaining 109-row baseline was:

| Queue | Before | Source action in this packet | Refresh-compatible after |
|---|---:|---|---:|
| `ILLUSTRATION_REPLACEMENT` | 1 | Replace the blocked generic angle-pairs figure in `g7-03-03/c1` with registered semantic figure `g7-comp-supp` | 0 |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 1 | Replace the repeated triangle-count item with a 190-degree claim diagnosis | 0 |
| `CHOICE_SURFACE_INTEGRITY` | 8 | Rebuild queued options as parallel misconception diagnoses while retaining IDs and truth | 0 |
| `MATH_PRESENTATION_RESIDUE` | 36 | Normalize circumference/area expressions into complete authored-math islands such as `C = π × d = 2 × π × r` and `A = π × r^2` | 0 |
| `VISUAL_FIRST_REPRESENTATION` | 21 | Strengthen all 42 concept placements and synchronize narration; independent review dispositions remain required | 21 |
| `GRADE_LANGUAGE_REVIEW` | 21 | Remove shout-case directions and tighten Grade 7 stems/feedback; independent review dispositions remain required | 21 |
| `LESSON_COMPLETE_DISPOSITION` | 21 | Course is source-ready; independent complete-lesson dispositions remain required | 21 |
| **Total** | **109** | **46 source causes repaired** | **63** |

The 55 standards rows remain outside this packet and require their exact-source, full-intent standards workflow.

## Root-cause implementation

- All 21 lessons retain two registered concept figures. Concept narration now exactly mirrors the visible concept body, so the visual and accessible explanation cannot drift.
- `g7-03-03/c1` now uses the registered complementary/supplementary-angle semantic figure instead of the blocked generic `angle-pairs` representation. `g7-04-03/c1` also uses the more truthful `scale-drawing` figure.
- `g7-03b-02/k3` now asks learners to diagnose the impossible 190-degree angle sum. It no longer repeats the earlier “how many triangles?” job with changed numbers.
- The eight queued MCQs, plus seven further same-course cue-risk surfaces found by the whole-course audit, now use parallel, misconception-specific options and truthful feedback. Across all 29 main MCQs, the post-repair label-length spread is at most 13 characters; runtime seeded shuffling reaches every option position.
- Circle formulas use explicit multiplication and caret-power authoring that the sanctioned tokenizer converts to single KaTeX islands. The four math-heavy lessons contain no `πd`, `πr`, digit-adjacent `π`, or Unicode-superscript residue.
- Learner copy uses sentence case except the mathematical construction criteria `SSA`, `SSS`, `SAS`, `ASA`, and `AAS`.

## Contract preservation

A read-only HEAD comparison recursively checked the 21 current lessons against their pre-packet versions. Stable step/option IDs, step kinds, widget types, correct flags, evaluator targets/answers/tolerances, and variant generator/form pairs have zero drift. The only figure substitutions are presentation changes and do not enter evaluator logic.

## Deterministic evidence

`src/lib/session248.geometryG7CourseIntegrity.test.ts` ratchets the whole course:

- 21/21 lessons parse against the schema and return no pedagogy or widget-integrity errors;
- 42/42 main concept placements use registered figures and synchronized narration;
- no exact or number-normalized same-sitting prompt collision remains;
- all 29 main MCQs have one correct option, unique IDs/labels/feedback, option-length parity of 15 characters or better, evaluator agreement, deterministic shuffling, and correct-position coverage;
- complete circumference, area, and pi-ratio source formulas tokenize as whole math islands, and every emitted TeX fragment in the four math-heavy lessons renders without a KaTeX error;
- shout-case learner copy does not recur.

## Gates

The bounded focused set passes:

- `src/lib/session248.geometryG7CourseIntegrity.test.ts`
- `src/lib/session137.geometry-roundup.test.ts`
- `src/components/widgets.scaledCircle.units.s245.test.tsx`

All repository gates pass:

- focused Vitest: 3 files, 18 tests;
- content schema: 1,840/1,840 files valid;
- pedagogy: 1,711/1,711 files clean;
- strict CML: 0 errors, 0 warnings;
- math format: 0 raw-LaTeX lesson files, sanctioned pipeline present;
- TypeScript: `tsc --noEmit` clean;
- targeted ESLint: clean;
- scoped `git diff --check`: clean (Windows line-ending notices only).

## Remaining closure work

After regenerating the derived audits, the source-compatible 109-row packet should reduce to 63 independent-review rows: 21 visual-first dispositions, 21 grade-language dispositions, and 21 complete-lesson dispositions. Those rows must be assessed against the deployed candidate rather than self-closed by the implementing worker. The 55 standards rows remain separate. Browser evidence and shared queue/card/cache/ledger reconciliation are root-owned release activities.
