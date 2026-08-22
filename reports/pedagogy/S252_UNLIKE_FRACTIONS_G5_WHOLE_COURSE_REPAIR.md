# S252 Unlike Fractions G5 whole-course repair

## Outcome

This bounded portfolio repairs every source-controlled finding for all 14 lessons in `content/courses/unlike-fractions-g5`. It changes no shared widget, schema, figure registry, queue, card, cache, ledger, standards record, or graph-audit artifact.

| Measure | Before | After source regeneration |
| --- | ---: | ---: |
| Authoritative course queue rows | 82 | 42 |
| `ILLUSTRATION_REPLACEMENT` | 28 | 0 |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 8 | 0 |
| `CHOICE_SURFACE_INTEGRITY` | 4 | 0 |
| Assessor-controlled review rows | 42 | 42 |
| Number-normalized prompt collisions | 8 lesson clusters | 0 |
| Generic `count-on-hops` concept placements | 28 | 0 |

The exact source closure is 40 rows. The stronger lesson-wide progression pass also gives every lesson a distinct misconception-repair second interaction, while preserving its widget type and evaluator.

Course seal after repair: `b144d71f39977277d92cc175df8119f4c89d13835eadeeb59b7c859eeb9a9833`.

Evaluator seal before and after repair: `8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45` across 98 graded lesson and remedial surfaces.

## Exact source-derived row closure

### Illustration replacement: 28 to 0

| Lesson | Closed row IDs | Replacement figures |
| --- | --- | --- |
| `g5u-01-01` | `VIS-g5u-01-01-c1-count-on-hops`, `VIS-g5u-01-01-c2-count-on-hops` | `fm-common-denom`, `fm-add-unlike` |
| `g5u-01-02` | `VIS-g5u-01-02-c1-count-on-hops`, `VIS-g5u-01-02-c2-count-on-hops` | `fm-common-denom`, `fa-multiplier` |
| `g5u-01-03` | `VIS-g5u-01-03-c1-count-on-hops`, `VIS-g5u-01-03-c2-count-on-hops` | `ns-lcm`, `ns-lcm` |
| `g5u-01-04` | `VIS-g5u-01-04-c1-count-on-hops`, `VIS-g5u-01-04-c2-count-on-hops` | `fm-common-denom`, `fm-common-denom` |
| `g5u-01-05` | `VIS-g5u-01-05-c1-count-on-hops`, `VIS-g5u-01-05-c2-count-on-hops` | `fm-add-unlike`, `fa-add-like` |
| `g5u-02-01` | `VIS-g5u-02-01-c1-count-on-hops`, `VIS-g5u-02-01-c2-count-on-hops` | `fm-subtract-unlike`, `fm-subtract-unlike` |
| `g5u-02-02` | `VIS-g5u-02-02-c1-count-on-hops`, `VIS-g5u-02-02-c2-count-on-hops` | `fa-add-like`, `fa-improper-mixed` |
| `g5u-02-03` | `VIS-g5u-02-03-c1-count-on-hops`, `VIS-g5u-02-03-c2-count-on-hops` | `fa-subtract-like`, `fa-mixed-improper` |
| `g5u-02-04` | `VIS-g5u-02-04-c1-count-on-hops`, `VIS-g5u-02-04-c2-count-on-hops` | `fa-mixed-improper`, `fa-mixed-improper` |
| `g5u-02-05` | `VIS-g5u-02-05-c1-count-on-hops`, `VIS-g5u-02-05-c2-count-on-hops` | `fa-simplify`, `fa-simplify` |
| `g5u-03-01` | `VIS-g5u-03-01-c1-count-on-hops`, `VIS-g5u-03-01-c2-count-on-hops` | `fa-benchmark-half`, `fa-compare-benchmark` |
| `g5u-03-02` | `VIS-g5u-03-02-c1-count-on-hops`, `VIS-g5u-03-02-c2-count-on-hops` | `fm-add-unlike`, `fm-add-unlike` |
| `g5u-03-03` | `VIS-g5u-03-03-c1-count-on-hops`, `VIS-g5u-03-03-c2-count-on-hops` | `fm-add-unlike`, `fm-subtract-unlike` |
| `g5u-03-04` | `VIS-g5u-03-04-c1-count-on-hops`, `VIS-g5u-03-04-c2-count-on-hops` | `ns-lcm`, `ns-lcm` |

Each concept body and narration is synchronized to the fixed mathematics in its registered figure. All 28 figures pass the live runtime alignment guard, exist in the registry, and render an SVG `<title>` plus `role="img"`.

### Progression and duplication: 8 to 0

| Closed row ID | Former colliding steps | New learner job |
| --- | --- | --- |
| `PROGRESSION-g5u-01-01` | `ch1` | Diagnose and repair an incorrect equivalent-fraction model. |
| `PROGRESSION-g5u-01-04` | `k3` | Repair a one-sided scaling error. |
| `PROGRESSION-g5u-01-05` | `ch1` | Transfer addition to direct piece counting. |
| `PROGRESSION-g5u-02-01` | `k2`, `ch1` | Interpret a crossed-out model, then transfer to a cut-ribbon context. |
| `PROGRESSION-g5u-02-02` | `k3` | Diagnose an omitted addend in a mixed-number fraction part. |
| `PROGRESSION-g5u-02-03` | `ch1` | Compose wholes and fractional pieces into an improper numerator. |
| `PROGRESSION-g5u-02-05` | `k2`, `ch1` | Group ninths, then transfer simplification to paired sixths. |
| `PROGRESSION-g5u-03-03` | `k3`, `ch1` | Distinguish join and separate story actions. |

The repair removes every exact, widget-payload, and number-normalized collision inside each lesson. In addition, all 14 `i2` interactions now begin from a plausible misconception and ask the learner to repair it rather than repeat `i1`.

### Choice-surface integrity: 4 to 0

- `CHOICE-0094` (`g5u-01-05/k2`): denominator outcomes are now four parallel, answer-neutral claims.
- `CHOICE-0095` (`g5u-02-01/k3`): denominator outcomes are now four parallel, answer-neutral claims.
- `CHOICE-0096` (`g5u-03-02/k1`): all options now pair a verdict with a reason; the correct option no longer uniquely justifies itself.
- `CHOICE-0097` (`g5u-03-02/k3`): all options now make parallel benchmark claims; no lone-justification cue remains.

Option IDs, option order, correct flags, and evaluator semantics are unchanged.

## Learner-visible mathematical truth

Four false or evaluator-misaligned strings were repaired:

- `g5u-02-03/i1` formerly asked the learner to build the improper fraction `19/8` while the preserved `fractionBar` evaluator graded `3/8`. It now truthfully asks for the fractional part of `2 3/8` before the subsequent numeric conversion check.
- `g5u-02-03/i2` had the same `19/8` versus `3/8` disagreement. It now starts from the misconception `2/8` and repairs the fractional part to `3/8`.
- `g5u-03-02/i1` and `i2` formerly claimed that a sum stays below one merely because both addends are proper fractions. The feedback now uses the case-specific truth: after `1/2`, adding `1/3` is not enough to reach one whole.

No target, answer, tolerance, accept factor, MCQ option ID, or correct flag changed.

## Residual assessor-controlled rows: exactly 42

The following are independent dispositions, not source defects, and intentionally remain until the assessor appends current-source decisions:

- Grade-language review: `LANGUAGE-g5u-01-01` through `LANGUAGE-g5u-01-05`, `LANGUAGE-g5u-02-01` through `LANGUAGE-g5u-02-05`, and `LANGUAGE-g5u-03-01` through `LANGUAGE-g5u-03-04` — 14 rows.
- Lesson disposition: `LESSON-g5u-01-01` through `LESSON-g5u-01-05`, `LESSON-g5u-02-01` through `LESSON-g5u-02-05`, and `LESSON-g5u-03-01` through `LESSON-g5u-03-04` — 14 rows.
- Visual disposition: `VISUAL-DISPOSITION-g5u-01-01` through `VISUAL-DISPOSITION-g5u-01-05`, `VISUAL-DISPOSITION-g5u-02-01` through `VISUAL-DISPOSITION-g5u-02-05`, and `VISUAL-DISPOSITION-g5u-03-01` through `VISUAL-DISPOSITION-g5u-03-04` — 14 rows.

No specialized source-controlled residual remains. Serial queue/card/cache regeneration should remove the 40 source-derived rows and preserve these 42 assessor rows.

## Reproduction and validation

The guarded, idempotent repair is `scripts/audit/repair-unlike-fractions-g5-s252.mjs`. Its `--check` mode reports 14 current lessons, zero changes, both seals above, and the exact closure counts.

The aggregate regression `src/lib/session252.unlikeFractionsG5CourseIntegrity.test.tsx` verifies the full course as one unit: schema and pedagogy validity, widget integrity, exact semantic figure mapping, runtime render eligibility, accessible SVG output, lesson-wide prompt and payload uniqueness, misconception-repair progression, evaluator correctness, preserved evaluator seal, truth repairs, and parallel choices.

Validation results:

- Focused aggregate regression: 1 file, 5 tests passed.
- Content schema: passed.
- Pedagogy lint: 1,711/1,711 lesson files clean.
- Strict CML lint: 0 errors, 0 warnings.
- TypeScript typecheck: passed.
- Repository lint: 0 errors, 451 warnings in existing repository files; scoped lint for the new script and test: 0 errors, 0 warnings.
- Full runtime visual suite: the new course regression passes, while two shared corpus-count snapshots remain stale after concurrent visual closures (612 expected versus 514 current fixed-exemplar uses; 749 expected versus 651 current suppressed/pending rows). Both failures are count-only assertions, not a semantic-conflict finding. Updating those shared audit snapshots is intentionally outside this portfolio.
- Repair idempotence: current, 0 files changed.
- Scoped `git diff --check`: passed.
