# S246 Kindergarten Geometry-Build Duplicate and Diversity Packet

## Scope

- Course: `shapes-build-k`
- Lessons: all 14 authored lessons, `kgb-01-01` through `kgb-03-04`
- Surfaces reviewed: 98 authored widgets across interactive, check, challenge, and remedial steps
- Standards intent preserved: positional language; naming and comparing two- and three-dimensional shapes by attributes; drawing, building, and composing shapes

## Deterministic evidence

| Measure | Before | After |
| --- | ---: | ---: |
| Exact duplicate main-step MCQ clusters | 9 | 0 |
| Placements in those clusters | 24 | 0 |
| Exact duplicate prompt clusters across every family widget | 29 | 0 |
| Placements in those clusters | 78 | 0 |
| Within-lesson exact prompt groups | 28 | 0 |
| Placements in within-lesson groups | 56 | 0 |

The family retains 98 authored widget placements. The improvement comes from new question jobs and representations, not from deleting practice.

## What changed

- Replaced repeated naming questions with attribute tracing, compare-and-contrast, inverse-position, construction-rule, measurement, composition, and transfer questions.
- Gave every second interactive a different prompt and, where useful, a different target state: long/short sides, small/large squares, direct/inverse positional language, shape attributes, diagonal cuts, and piece-to-whole composition.
- Reframed every copied remedial as a fresh scaffold rather than a replay of the failed check.
- Moved challenges onto new surfaces or forms, including turned/slid shapes, outside-edge reasoning, repeated pairs, and square-face-to-cube transfer.
- Corrected copied circle success messages on non-circle tasks so visible feedback now agrees with the learner action.
- Kept four distinct choices and one mathematically true answer for every authored MCQ.

## Ratchet

`src/lib/session246.kindergartenGeometryBuildDiversity.test.ts` checks the complete 14-lesson family, all 98 prompts, zero exact prompt repeats, zero main-step MCQ clusters, distinct second interactives, fresh remedials/challenges, early-reader stem hygiene, option uniqueness, schema validity, and evaluator/widget integrity.

## Regeneration note

Global duplicate indexes, MCQ reports, lesson cards, caches, and consolidated queue evidence were intentionally not regenerated in this dependency-safe packet. Root must regenerate those shared deterministic artifacts after all active content lanes finish.
