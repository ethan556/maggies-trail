# S247 `tm-04-01` Pythagorean-proof supersession validation

Status: **PASS — the authoritative current disposition is `REVISE / SUFFICIENT / FIT`.** This is a read-only post-append validation. It does not edit/regenerate the ledger, queue, cards, cache, lesson, figure, widget, or standards artifacts.

## Independent geometry result

The new diagram is a valid general rearrangement proof, not merely a relabelled `3-4-5` example.

- Both outer regions are true `110 × 110` squares. The displayed partition uses `a = 42` and `b = 68`, and `a + b = 110`.
- All eight drawn triangles have side-length squares `42²`, `68²`, and `42² + 68²`. Therefore each is a right triangle with legs `42` and `68`; each area is `42 × 68 ÷ 2 = 1,428`.
- Four triangles occupy `5,712` square units, so subtracting them from either `12,100`-unit outer square leaves `6,388` square units.
- The first leftover quadrilateral has four side-length squares equal to `6,388`, and adjacent side vectors have dot product `0` at every corner. It is therefore a genuine square with side `c` and area `c² = 6,388`.
- The second leftovers are genuine `42 × 42` and `68 × 68` squares. Their areas total `1,764 + 4,624 = 6,388`.
- Consequently the two leftovers are equal: `c² = 6,388 = 42² + 68² = a² + b²`.

The strict validator derives these values from the actual JSX coordinates. It checks both complete partitions against the outer-square area rather than trusting data attributes or the producer report.

## Accessibility and lesson truth

The SVG has `role="img"`, a concise aria label, a title naming the general Pythagorean rearrangement proof, and a detailed description that states the equal outer squares, the same four congruent right triangles, the `c²` leftover, the `a² + b²` leftovers, and the equality conclusion. The measured figure regression reports no skipped text and no visible-label collisions.

The lesson now maintains a truthful example/proof boundary:

- `i1` calls the `3-4-5` work an example and explicitly says that one case does not prove the theorem;
- `c1` and `c2` tie the general claim to two equal `(a+b)` squares and the same four congruent right triangles; and
- `c2` supplies the needed equal-area subtraction argument.

The old claims that one numerical picture was the proof and that unrelated shapes exactly filled another region are absent.

## Widget and evaluator agreement

Independent derivation from each authored `pythagoreanArea` model gives:

| Surface | Derived target |
|---|---:|
| `i1` | `c² = 25` (exploration example) |
| `k1` | `c² = 100` |
| `i2` | hypotenuse is opposite the right angle |
| `k2` | `c² = 169` |
| `k3` | squared terms represent the side-square areas |
| `ch1` | `c = 5` |
| remedial | `c² = 25` |

The live truth engine derives `c²` by adding the two leg-square areas, and the live evaluator grades numeric/choice responses against that derived truth after the required exploration stages. Every named numeric error differs from the correct target. The live question diagram uses true square SVG elements on the two legs, describes itself as not to scale, and exposes its staged state nonvisually. The four integrated proof/figure/widget-signalling test files pass: **4 files, 21 tests**. The complete content-schema gate also passes: **1 file, 11 tests**.

## Why the lesson remains `REVISE`

The mathematical release blocker is closed, and the visual proof is meaningful, synchronized, visible, and accessibly described; `visualDecision: SUFFICIENT` is now warranted. The stems, explanations, proof narration, and vocabulary are clear for Grade 8; `gradeLanguageDecision: FIT` is also warranted.

Two bounded lesson-design debts prevent `KEEP`:

1. `i1`, `k1`, `k2`, and the remedial all perform the same calculate-`c²`-from-two-leg-lengths job. They use different values and are not an exact-MCQ duplicate cluster, but the semantic repetition still conflicts with the V4 varied-question-sequence requirement.
2. In `i2`, the correct choice has 52 characters while the distractors have 17, 22, and 25. It uniquely combines both defining facts and is substantially longer, so the option surface remains cueable even though the answer is mathematically correct and randomized at runtime.

Five standards edges remain candidate-only and require exact-source review. This lesson disposition does not approve an alignment or mastery claim.

## Source seal and authoritative ledger validation

The candidate and the appended authoritative record are exactly equal and sealed to current review basis `8a903ada53617b727c8f922e61890edf616a47fdf3117dfe0e241bc477d1f82a`. Authority resolution now returns `CURRENT_HUMAN_DECISION` with record `S247-TM-tm-04-01-PYTHAGOREAN-PROOF-SUPERSESSION`. The TM supersession is lesson-disposition history record 144, its append checkpoint. The validator permits later append-only history while requiring this ordinal to remain fixed: the superseding S247 record appears exactly once, while the earlier `S246-TM-tm-04-01` record remains exactly once as immutable pre-repair history. There is no live exact-MCQ duplicate cluster for this lesson. The validator performs no append simulation and makes no file changes.

## Reproduction

```text
node reports/closure/candidates/validate-s247-tm-04-01-pythagorean-proof-supersession.mjs
pnpm exec vitest run src/components/session247.pythagoreanRearrangementProof.test.tsx src/components/figures.test.ts src/components/widgets.geometricConstraint.signalling.s244.test.tsx src/lib/geometricConstraint.signalling.s244.test.ts --pool=threads --maxWorkers=1
pnpm exec vitest run src/lib/content.test.ts --pool=threads --maxWorkers=1
```
