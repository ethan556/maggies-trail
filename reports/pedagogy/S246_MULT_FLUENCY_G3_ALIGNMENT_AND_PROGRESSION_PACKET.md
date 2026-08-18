# S246 Grade 3 multiplication-fluency alignment and progression packet

## Scope and before evidence

- Course: `mult-fluency-g3`
- Authored lessons: 18 (`mf3-01-01` through `mf3-03-06`)
- Queue workstream: `LESSON_PROGRESSION_AND_DUPLICATION`
- Before evidence: 18 open rows and 72 number-normalized repeated placements.
- Curriculum drift: the repository plan requires ×6, ×7, ×8, ×9, ×10, then 3×3-to-5×5 square facts across `mf3-01-05` through `mf3-02-04`; the live lessons instead held ×10, later squares, ×6, ×7, ×8, ×9.

## Alignment repair

The six drifted lessons now agree across ID, title, slug, concept tag, visual factors, prompt mathematics, answers, hints, feedback, generator form, fact-family metadata, CML transfer family, recap, and chapter progression:

| Lesson | Corrected family |
|---|---|
| `mf3-01-05` | ×6 |
| `mf3-01-06` | ×7 |
| `mf3-02-01` | ×8 |
| `mf3-02-02` | ×9 |
| `mf3-02-03` | ×10 |
| `mf3-02-04` | squares 3×3, 4×4, and 5×5 |

The explicitly adjudicated prediction-gate state remains tied to the lesson IDs: absent at `mf3-02-01` and `mf3-02-03`, present elsewhere in this repaired sequence.

## Progression repair

Each lesson now moves through different question jobs: construct an array, read or derive a fact, diagnose reasoning, and transfer the fact to a short context. Remedials use a simpler counter, grouping, or known-fact cue and do not copy a main prompt. Existing `areaModel` hosts and exact mathematical answers remain intact.

| Detector measure | Before | After |
|---|---:|---:|
| Progression queue rows | 18 | 0 expected on root evidence regeneration |
| Normalized-repeat placements | 72 | 0 |
| Remedial/main normalized copies | not queue-scoped | 0 |

## Verification

- Focused identity/progression contract and original S186 fluency assurance: 44/44 tests passed.
- Independent authored-prompt solver: 0 mathematical mismatches.
- Repository schema: 1,840/1,840 files clean.
- Repository pedagogy: 1,711/1,711 files clean.
- Strict CML: 0 errors and 0 warnings.
- TypeScript, focused ESLint, and diff check: passed.

Shared audit evidence, queue, cards, cache, generators, and deployment state are intentionally outside this packet.
