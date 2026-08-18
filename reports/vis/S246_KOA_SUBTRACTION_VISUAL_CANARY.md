# S246 Kindergarten subtraction visual-first canary

## Scope and disposition

This bounded canary covers chapter 2 of `add-subtract-10-k` only: `koa-02-01` through `koa-02-05`. It changes illustration bindings and introduces five registered figures; it does not rewrite questions, generators, standards, queues, cards, caches, or ledgers.

The live pre-change census found exactly ten affected placements: `c1` and `c2` in each lesson. Every placement used `count-on-hops`, a fixed `4 + 3` addition exemplar. The production alignment gate therefore suppressed all ten beside subtraction prose. Checks, challenges, and interactives had no figure and remain figure-free, so no worked-example answer is exposed on an assessed surface.

| Lesson | Concept job | Previous state | New figure |
|---|---|---|---|
| `koa-02-01` | remove objects; distinguish removed from remaining | two suppressed addition hops | `koa-take-away-removal` |
| `koa-02-02` | cross out what leaves; count only plain objects | two suppressed addition hops | `koa-subtraction-cross-out` |
| `koa-02-03` | act out children leaving; see one fewer each time | two suppressed addition hops | `koa-subtraction-act-out` |
| `koa-02-04` | connect start, leave, left to a subtraction sentence | two suppressed addition hops | `koa-subtraction-sentence` |
| `koa-02-05` | interpret “how many are left?” and count backward | two suppressed addition hops | `koa-count-back-left` |

## Mathematical and accessibility contract

Each SVG has `role="img"`, a self-contained narrated `<title>`, visible labels at or above the 10-unit floor, and explicit mathematical data attributes checked by the focused test. The worked examples are true: `6 − 2 = 4`, `7 − 3 = 4`, `5 − 2 = 3`, `6 − 2 = 4`, and a three-step count back from 7 to 4. Color is reinforced by position, crosses, arrows, grouping, labels, and line style rather than carrying meaning alone.

The five figures are deliberately different representations rather than reskins of one number line. The number path appears only where counting back is the actual lesson concept.

## Measured effect

| Measure | Before | After | Exact canary delta |
|---|---:|---:|---:|
| Chapter-2 illustration placements | 10 | 10 | 0 |
| Chapter-2 production-rendering placements | 0 | 10 | +10 |
| Chapter-2 suppressed fixed exemplars | 10 | 0 | −10 |
| Chapter-2 `count-on-hops` placements | 10 | 0 | −10 |
| Chapter-2 adversarial `PASS` rows | 0 | 10 | +10 |
| Corpus rendering rows | 2,760 | 2,770 | +10 |
| Corpus fixed-exemplar suppressions | 932 | 922 | −10 |
| Corpus blocklist suppressions | 133 | 133 | 0 |

The current corpus remains 3,825 placements. The derived production census is `reports/vis/VIS01_PLACEMENTS.csv`; the adversarial census is `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv`; the ten-row disposition is `reports/vis/S246_KOA_SUBTRACTION_ALIGNMENT.csv`. Because other lanes were active, this report attributes only the exact ten scoped rows to this canary.

## Preview evidence

The review renders are in `reports/vis/previews/koa-subtraction-s246/`:

- `koa-take-away-removal.png`
- `koa-subtraction-cross-out.png`
- `koa-subtraction-act-out.png`
- `koa-subtraction-sentence.png`
- `koa-count-back-left.png`
- `koa-subtraction-contact-sheet.png`

Visual review found and corrected one path/label overlap in the subtraction-sentence preview before final generation.

## Verification

- Focused figure, registry split, render-health, marker, alignment, and adversarial suites: 7 files, 18 tests passed.
- Focused subtraction collision assertion: all five figures, zero text-label collision pairs.
- Figure registry resolution/readability sweep: passed for all registered figures.
- Adversarial audit: all ten scoped rows are `RENDER / PASS` with no risk reason; corpus `REVIEW` count remains zero.
- Content schema: 1,840/1,840 files clean.
- TypeScript: passed.
- Targeted ESLint: passed with zero warnings after removing one unused constant.
- CML strict lint: zero errors, zero warnings.
- Pedagogy: all five scoped lessons passed. The shared-tree aggregate was 1,710/1,711 because unrelated `shapes-build-k/kgb-03-02#k3` had generic incorrect-feedback wording.
- Full registry collision ratchet: the five owned figures passed, but the shared-tree aggregate remained red on unrelated `ia-top-bottom-swap` and `asv-coordinate-rectangle-area` collisions observed during this run.

## Closure

The chapter-2 canary is complete at its owned boundary: all ten concept placements now render concept-matched, age-appropriate subtraction visuals, while assessment surfaces remain answer-neutral. The two shared-tree global-gate findings above are external to this packet and were not modified.
