# Premium Experience Rebuild — S232 Figure/Text Alignment

## Outcome

The reported Grade 3 fraction lesson was materially wrong: a fixed `4 + 3 = 7` number-line example appeared beside prose about equal and unequal fraction partitions. The lesson now uses the existing `frac-equal-vs-unequal` illustration, whose visible labels and accessible description both explain the prose.

This was a systemic content-binding defect, not an isolated authoring typo. Three fixed-number illustrations had been reused as generic placeholders:

| Figure | Authored uses | Safe matches | Mismatches now suppressed |
|---|---:|---:|---:|
| `count-on-hops` (`4 + 3 = 7`) | 796 | 3 | 793 |
| `bar-compare` (`9 - 5 = 4`) | 85 | 1 | 84 |
| `number-track` (`18...24`) | 70 | 5 | 65 |
| **Total** | **951** | **9** | **942** |

The complete lesson corpus contains 3,816 authored figure placements. The deterministic audit records every placement in `FIGURE_TEXT_ALIGNMENT_AUDIT.csv`. The three proven fixed-exemplar families dominate the high-frequency reuse list; all 942 detected mismatches now fail closed at both lesson and stepped-reveal rendering boundaries. Text remains available, while an unrelated picture does not.

## What changed

1. Rebound both concept steps in `g3f-01-01` to `frac-equal-vs-unequal`.
2. Repaired the owning fractions generator so regeneration preserves the correction.
3. Added one shared semantic guard for fixed-number figures.
4. Applied the guard before the visual shell is created, so suppression cannot leave an empty illustration card.
5. Applied the same rule inside stepped-reveal panels.
6. Added a full-corpus audit artifact and a regression test pinning all 951 fixed-exemplar decisions.

## Audit health

| Step | Health | Evidence |
|---|---|---|
| Reported-screen diagnosis | **PASS** | Live screenshot and DOM proved the `4 + 3 = 7` visual/text contradiction. |
| Corpus inventory | **PASS** | 3,816 figure placements scanned across all lesson JSON. |
| Fixed-exemplar classification | **PASS** | 951 placements classified; 9 render, 942 suppress. |
| Reported lesson correction | **PASS** | Local DOM exposes equal/unequal partition labels and matching accessible text. |
| Empty-shell prevention | **PASS** | Alignment is checked before the lesson/panel figure wrapper renders. |
| Generator durability | **PASS** | Source generator now authors the correct fraction visual. |
| Focused regression tests | **PASS** | 4 test files, 21 tests. |
| Type safety | **PASS** | TypeScript typecheck. |
| Content integration | **PASS** | CML parses 1,701 lesson files; registration and 127/127 engine checks pass. |
| Visual coverage | **PASS WITH CORRECTNESS OVERRIDE** | 3,684/3,684 concept steps retain authored figure registrations; runtime suppresses known mismatches. |
| Production build | **PASS** | Next.js production build generated all 57 routes. |
| Dependency security | **PASS** | Offline production audit reports zero vulnerabilities. |
| Schema/pedagogy CLIs | **HOST-BLOCKED** | Existing Windows `tsx` startup failure at `uv_os_get_passwd` / `ENOMEM`, before project code. |

## Adversarial visual recheck

- Before: `PREMIUM_REBUILD_SCREENSHOTS_S232/01-live-before.png`
- After: `PREMIUM_REBUILD_SCREENSHOTS_S232/02-local-after.png`
- Same lesson and viewport were compared together.
- The replacement visual directly contrasts four equal regions with four visibly unequal regions.
- The accessible image description communicates the same distinction.
- No new card, layout, navigation, or curriculum-mathematics behavior was introduced.

## Boundary and remaining work

This closes every mismatch detected in the three proven fixed-exemplar families. It does not claim that a deterministic text matcher can certify the pedagogical nuance of every bespoke illustration. The audit CSV is now the enforceable baseline; future review can add a figure family to the strict registry when visual inspection proves that it encodes a fixed example rather than a reusable concept.
