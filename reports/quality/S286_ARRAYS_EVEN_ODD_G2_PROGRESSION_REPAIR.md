# S286 — Arrays, Even/Odd, Grade 2: second-try progression repair

## Scope and source seal

- Source queue: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
- Packet: ten P0 `LESSON_PROGRESSION_AND_DUPLICATION` rows, `g2a-01-01` through `g2a-03-03`
- Exact pre-repair evidence: every row named `i2` as a duplicate learner job; raw source confirmed that each `i2.widget` payload was an exact copy of `i1.widget`.
- Deliberately untouched: queue, disposition, cache, registry, shared runtime, and every non-`i2` learner surface.

## Repair

Each second interactive is now a separate visual retrieval event while retaining the lesson’s original concept tag and widget family.

| Packet | First interaction | Repaired second interaction |
| --- | --- | --- |
| `g2a-01-01` | pair 14 (even) | pair 15 (odd) |
| `g2a-01-02` | pair 17 | use the ones digit of 18 |
| `g2a-01-03` | pair 16 | pair 14 |
| `g2a-01-04` | pair 18 | pair 13 |
| `g2a-02-01` | row 2 / column 3 | row 3 / column 1 |
| `g2a-02-02` | top row | right column |
| `g2a-02-03` | left column | bottom row |
| `g2a-03-01` | last `+ 4` row | first `+ 4` row |
| `g2a-03-02` | bottom row | top row |
| `g2a-03-03` | middle row | bottom row |

The changes preserve the mathematics and increase retrieval variety: parity alternates its leftover/no-leftover evidence, the ones-digit lesson uses its named rule, and each array task asks for a different spatial relationship.

## Gates

- `node scripts/session/s286-arrays-even-odd-g2-progression-repair.mjs` (twice; second run is no-op)
- `pnpm exec vitest run src/lib/session286.arraysEvenOddG2Progression.test.ts src/lib/session194.arraysEvenOdd.test.ts`
- `pnpm validate:content`
- `pnpm lint:pedagogy`

`session286.arraysEvenOddG2Progression.test.ts` is the source seal: it asserts every one of the ten planned replacement prompts/answers or hotspot sets, source schema integrity, evaluator truth, spatial feedback distinction, and that no second interaction is a copied first-interaction payload.
