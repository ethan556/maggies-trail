# Product state (generated — do not hand-edit)

Regenerate with `node scripts/gen-product-state.mjs`. Every count below is derived
from disk (the curriculum manifest, the schema registry, and a content walk) so the
rest of the docs can cite this file instead of re-counting. Commit `not-recorded-in-source-archive`.

Authored corpus SHA-256: `58e71e9b6102c60420a1faf0b5d674251fa21db81802f455a30523b1da9f696d`  
State generated: `2026-08-15T07:56:31.632Z`

## Catalogue

| metric | value |
| --- | --: |
| Courses | 129 |
| Lessons | 1701 |
| Lesson steps | 15645 |
| Widget types (registry) | 129 |
| Interactive manipulatives (manip ≥ 1) | 123 |
| Interactive lessons (≥1 widget step) | 1701 |
| MCQ-heavy lessons (>60% graded MCQ) | 257 |
| Reading-heavy lessons (words/step over band ceiling) | 7 |

## Flagship quality tiers

| tier | lessons |
| --- | --: |
| A — complete laboratory | 1190 |
| B — rich, one phase missing | 458 |
| C — conventional-plus | 53 |
| D — misclassified / weak | 0 |

K–8: Tier A 822, Tier B 252.

## Grade coverage

| band | courses | lessons |
| --- | --: | --: |
| G0 | 10 | 140 |
| G1 | 11 | 138 |
| G2 | 11 | 132 |
| G3 | 10 | 144 |
| G4 | 11 | 145 |
| G5 | 11 | 130 |
| G6 | 5 | 83 |
| G7 | 5 | 81 |
| G8 | 6 | 81 |
| G9 | 12 | 124 |
| G10 | 10 | 153 |
| G11 | 10 | 145 |
| G12 | 9 | 127 |
| G13 | 8 | 78 |

## Band coverage

| band | courses | lessons |
| --- | --: | --: |
| 6–8 | 16 | 245 |
| K–2 | 32 | 410 |
| 3–5 | 32 | 419 |
| 9–12+ | 49 | 627 |

## Engineering

| metric | value |
| --- | --- |
| Unit/integration tests | 13776 across 387 files |
| — count source | group-protocol run recorded in session S242 on this exact corpus |
| Browser test declarations in current tree | 39 |
| Last certified Playwright executions | 115 (Session 218; not rerun on current tree) |
| Bundle size | not measured |
| Build time | not measured on current verified tree |
| Accessibility | current-tree browser execution not available in this checkout; last certified Playwright baseline is Session 218, while source-level harness contracts cover the current tree |
| Deployment | Next.js app; learner core is local-first; accounts and sync require a writable single-node SQLite volume; no hosted deployment configured |
