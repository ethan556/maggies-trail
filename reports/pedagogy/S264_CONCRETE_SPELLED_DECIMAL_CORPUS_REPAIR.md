# S264 Concrete Spelled-Decimal Corpus Repair

## Requirement and scope

Every learner-visible string in all 1,701 course lesson JSON files was scanned for concrete spelled-decimal quantities such as “zero point five,” including signed and multiword integer parts. A spelled form may remain only when its exact sentence explicitly teaches how a decimal is spoken or read. Procedural phrases such as “place the point one spot to the left” are not decimal quantities and are excluded by the grammar rather than allowlisted.

This packet changes lesson JSON only. It does not modify runtime rendering, schemas, queues, review cards, cache, ledgers, or standards evidence.

## Baseline and classification

The source baseline contained **13 concrete spelled-decimal quantities across 7 fields in 2 lessons**:

| Lesson | Fields | Baseline quantities | Classification |
| --- | ---: | ---: | --- |
| `decimals-intro-g4/dg4-01-02` | 4 | 8 | Concept and remedial body/narration used “zero point five, zero point nine” while teaching decimal notation and tenths, not spoken reading. |
| `solving-equations/alg1-02-03` | 3 | 5 | Algebra concept/remedial narration verbalized symbolic equations containing 0.5, 1.2, 3.7, and 0.2; the lesson teaches equation transformations, not decimal pronunciation. |

No baseline occurrence met the narrow spoken-reading exception.

## Repairs

- `dg4-01-02/c2` and its remedial now display and narrate `0.5, 0.9`, matching the lesson’s numeric tasks, feedback, and recap.
- `alg1-02-03/c1` narration now uses `0.5x + 1.2 = 3.7` and `5x + 12 = 37`.
- `alg1-02-03/c2` narration now uses `0.2x + 3 = 4` and the exact `×10` transformation.
- The algebra remedial narration now uses `0.5x = 3`, `5x = 30`, and `30 ÷ 5 = 6`.

Stable lesson/step IDs and all widget/evaluator specifications are unchanged.

The current working-tree baseline for dg4-01-02 already removed the stale dpv-hundredths-grid binding from c2; this packet preserves that concurrent source change and owns only the four decimal-text field edits in that lesson.

## Executable contract

- `scripts/audit/repair-concrete-spelled-decimals-s264.mjs` walks every nested learner string, repairs only the two source-controlled lessons, protects stable IDs and widget payloads, and fails if any non-read-aloud spelled decimal remains.
- The spoken-reading exception requires an explicit sentence-level cue. Generic prompts such as “say whether…” do not qualify.
- `src/lib/session264.concreteSpelledDecimalCorpus.test.ts` proves the grammar catches signed and multiword forms, ignores procedural uses of “point,” tests the narrow exception boundary, scans all 1,701 lessons, and verifies the seven repaired fields and touched-lesson integrity.
- Focused regression: 5/5 tests pass.
- Full scoped gates: content schema, pedagogy (1,711/1,711 clean), strict CML (0 errors, 0 warnings), TypeScript, and scoped ESLint pass.
- The repository-wide erify:math-format gate remains red on four raw-caret fixture strings in the unrelated shared file src/components/math/SvgLatexSurface.test.tsx; this packet does not alter that concurrently owned file.
- Idempotence: current; **0 unsafe residuals**, **0 retained spoken-reading occurrences**.
- Corpus seal: `95ecd4a66047cb622485988e313a95e802718dd4d3f0ee23c672cf0146a1ac62`.
