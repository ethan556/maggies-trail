# S244 premium icon and trademark system

## Outcome

The app now separates two jobs that the old 55-icon line/duotone set was being asked to do at
once:

- **instructional identity at display size** uses the governed `CurriculumIcon` system and is
  ready for independently reviewed painterly WebP art;
- **utility chrome at 13–24 px** keeps the crisp code-native `AppIcon` vocabulary for chevrons,
  checks, locks, theme controls, replay, listen and other controls where painterly detail would
  reduce legibility.

This is a functional distinction, not an unfinished bulk replacement. A painterly chevron at
16 px would be less premium and less accessible than a precise vector chevron. Course, grade,
chapter, lesson, practice and assessment identity are the surfaces where dimensional illustration
adds meaning.

## Surface inventory and implemented coverage

| Surface | Before | S244 integration | Semantic art source |
|---|---|---|---|
| Public and signed-in navigation | flat badge mark | dimensional vector mark | brand SVG |
| Landing hero | flat open ridgeline | dimensional open vector ridgeline | inline brand SVG |
| Lesson completion | flat shipped mark file | dimensional shipped mark file | `/brand/maggies-mark.svg` |
| Browser favicon | flat derivatives | regenerated 16/32/48 derivatives | brand generator |
| PWA / Android / iOS | flat app tiles | regenerated 180/192/512 + maskable safe-circle tile | brand generator |
| Social sharing | flat-mark OG card | regenerated 1200×630 card | OG generator |
| Course cards | 11 line glyph topics | painterly subject registry + explicit dimensional fallback | 12 subject ids |
| Grade catalogue headings | text only | grade illustration marker | 14 grade ids |
| Dashboard grade accordions | chevron + text | grade illustration marker beside the still-functional chevron | 14 grade ids |
| Basecamp course heading | line topic glyph | large subject illustration marker | 12 subject ids |
| Basecamp chapters / landmarks | numbered flat pill | chapter-landmark art with separate progress badge | structure id |
| Basecamp lessons / waypoints | numbered flat pill | lesson-waypoint art with separate progress badge | structure id |
| Chapter practice heading | text only | practice-clearing art | structure id |
| Chapter test-out heading | text only | assessment-summit art | structure id |
| Small buttons and controls | line/duotone SVG | deliberately retained | `AppIcon` |

## Asset taxonomy

- 12 subjects: number/place value; operations; fractions/ratios; measurement; time; geometry;
  angles/construction; algebra/equations; functions/graphs; statistics/data; probability/chance;
  calculus/change.
- 14 grades/levels: Kindergarten, Grades 1–8, Algebra 1, Geometry, Algebra 2, Precalculus,
  Calculus.
- Five structural waymarks: course trail, chapter landmark, lesson waypoint, practice clearing,
  assessment summit.

The runtime total is 31. Exact scenes, paths, shared art direction and negative prompt are in
`curriculum-icon-prompts.json`. Production and contact-sheet rules are in
`CURRICULUM_ICON_ART_PRODUCTION_SPEC.md`.

## Honest asset fence

All 31 registry rows are enabled because their released 512×512 WebPs passed their documented
32/48/80 px cohort reviews: five structure waymarks, 12 subject families, and 14 grade/level
markers. `CurriculumIcon` still retains a dimensional, theme-aware code-native fallback under
every image for forced-colours support and for any future asset that is explicitly fenced off.
An unavailable row exposes:

```text
data-art-status="code-native-fallback"
```

An enabled row exposes `production`, while its code-native fallback remains underneath for
forced-colors mode. Tests require every enabled path to exist and require prompt-pack/runtime
id and path parity. Exact prompts, master paths, released paths, hashes, and QA decisions are
recorded in `reports/curriculum-icons/S244_STRUCTURE_COHORT_QA.md`,
`reports/icon-candidates/S244_SUBJECT_COHORT_QA.md`, and
`reports/curriculum-icons/S244_GRADE_COHORT_QA.md`.

## Trademark derivative proof

The mark now has restrained navy, ivory and orange depth gradients while preserving the exact twin
peaks, winding trail and summit-star silhouette. The mono mark remains untouched for one-ink use.

The project generator verified:

- 16px star coverage: `0.79` (minimum `0.30`);
- 16, 32, 180, 192 and 512px derivatives decode and carry all brand fills;
- maskable ink stays inside Android's inner 80% safe circle;
- ICO holds valid 16, 32 and 48px PNG entries;
- manifest paths, MIME types and declared dimensions resolve;
- OG card: 1200×630, 5.68% non-background ink, 2,640 colors.

## Production-art closure

All 31 declared WebPs are present, enabled, and mechanically verified. Subject, grade, and
structure cohorts were generated as independent masters, reviewed together at realistic UI sizes
in light and dark contexts, and released only after their respective cohort checks passed. The
code-native fallback remains part of the component contract; it is no longer standing in for any
declared S244 production asset.
