# S247 Pythagorean rearrangement proof repair

Status: **PASS — bounded source repair; independent disposition supersession still required**

## Scope

This packet repairs the release-blocking mathematical presentation in `transformations-measurement/tm-04-01` and its registered `pythagorean-proof` figure. It does not edit the shared lesson-review ledger, pending queue, lesson cards, cache, figure registry, evaluator, generator, widget, schema, standards claims, or any other lesson.

## Defect reproduced

The previous visual displayed one 3-4-5 numerical example as though it were a proof for every right triangle. Its two supposed leg “squares” were rectangles (`32 × 48` and `64 × 40`), while the lesson claimed the figure proved the general theorem and that the two leg regions “exactly fill” the hypotenuse square. The arithmetic `9 + 16 = 25` verifies one case; it does not establish the theorem for arbitrary side lengths.

## General proof now shown

The replacement is a valid rearrangement/dissection proof:

1. both outer regions are true equal squares with side length `a + b`;
2. each contains the same four congruent right triangles with legs `a` and `b` and hypotenuse `c`;
3. in the first arrangement, their inner boundary is a true square with side `c`, leaving area `c²`;
4. in the second arrangement, the leftover regions are true squares with sides `a` and `b`, leaving area `a² + b²`; and
5. subtracting the same four triangle areas from equal outer-square areas gives `c² = a² + b²`.

The SVG includes an accessible title, detailed description, concise aria label, semantic proof/arrangement/area markers, and visible labels at or above the repository's 10-unit floor. A measured collision check found no label overlaps or unmeasurable labels.

## Lesson correction

- `c1` introduces the two equal `(a + b)` outer squares and the common four-triangle rearrangement.
- `i1` is now explicitly a 3-4-5 **example check**. Its prompt, three stages, success feedback, exploration feedback, and fallback feedback no longer claim that the example is the general proof.
- `c2` gives the general equal-area subtraction argument using arbitrary `a`, `b`, and `c`.

## Focused regression contract

`src/components/session247.pythagoreanRearrangementProof.test.tsx`:

- parses and pedagogy-lints the repaired lesson;
- rejects the old example-as-proof wording;
- checks the registered figure's title, description, aria narration, and semantic proof markers;
- proves both outer rectangles are equal true squares;
- derives the side-length squares of all eight displayed triangles and verifies that every one has legs `42`, `68` and hypotenuse-square `42² + 68²`;
- verifies the central quadrilateral has four equal sides and four right angles;
- verifies the `a²` and `b²` regions are true squares; and
- independently checks that `(a + b)² − 4(ab/2) = a² + b²`, matching the displayed central `c²` area.

## Verification

| Gate | Result |
|---|---|
| Focused proof/math/accessibility/collision regression | PASS — 1 file, 5 tests |
| Focused proof plus global figure render contract | PASS — 2 files, 6 tests |
| Content schema validation | PASS — 1840 / 1840 files clean |
| Focused lesson pedagogy lint (`lintLesson`) | PASS |
| TypeScript typecheck | PASS |
| Strict CML lint | PASS — 0 errors, 0 warnings |
| Targeted ESLint on changed TypeScript files | PASS — 0 errors, 0 warnings |
| Scoped `git diff --check` | PASS — repository line-ending notices only |

The full corpus pedagogy command reached `tm-04-01` cleanly but was not a valid packet gate during concurrent integration: it reported only the separately edited `ti-02-03/r1` recap having four takeaways. That concurrent trig file is outside this packet; `tm-04-01` is independently sealed by the focused `Lesson.parse` plus `lintLesson` assertion.

## Closure boundary

The false general-proof visual and learner-facing wording are repaired. Because `tm-04-01` already has a signed pre-repair disposition, an independent semantic reassessment must supersede that decision before shared queue/card/cache reconciliation. This packet intentionally does not claim that closure.
