# S262 Compose Shapes Grade 1 P0 Repair

## Scope and authority

This packet audits and repairs the ten current lessons in `compose-shapes-g1`. Its source seal after repair is `7bfe8260919a320f2a5ea170157438be7fad247323267b7976ede33c8da9e874`.

The authoritative baseline contains 27 P0 rows: 20 `ILLUSTRATION_REPLACEMENT` rows and seven `LESSON_PROGRESSION_AND_DUPLICATION` rows. This packet changes course-local lesson JSON only. It does not update the queue, review cards, cache, closure ledger, standards evidence, shared schema, figure registry, or runtime.

## Source-compatible result

| Cause | Baseline | Closed in source | Explicit residual |
| --- | ---: | ---: | ---: |
| Illustration replacement | 20 | 14 | 6 |
| Progression and duplication | 7 | 7 | 0 |
| **Total P0** | **27** | **21** | **6** |

### Truthful semantic figure bindings

| Placement | Registered figure |
| --- | --- |
| `g1s-01-01/c1`, `g1s-01-01/c2` | `shape-attributes` |
| `g1s-01-02/c1` | `ks-any-way-up` |
| `g1s-01-02/c2` | `ks-size-same` |
| `g1s-01-03/c1` | `geo3-sort-yesno` |
| `g1s-01-03/c2` | `ks-sort-count` |
| `g1s-02-01/c1`, `g1s-02-01/c2` | `ks-build-shapes` |
| `g1s-03-01/c1` | `flat-vs-solid` |
| `g1s-03-01/c2` | `solid-shapes` |
| `g1s-03-02/c1`, `g1s-03-02/c2` | `ks-build-shapes` |
| `g1s-03-03/c1` | `ks-build-shapes` |
| `g1s-03-03/c2` | `shape-attributes` |

Each binding is checked through server rendering for a title, `role="img"`, and the live figure/text-alignment contract. Remedial concepts are synchronized to the repaired second concept step where a truthful figure exists.

### Fail-closed visual residuals

No registered figure truthfully depicts the exact authored composition at these six placements, so the former generic figure is removed rather than shown as contradictory evidence:

- `VIS-g1s-02-02-c1-count-on-hops`
- `VIS-g1s-02-02-c2-count-on-hops`
- `VIS-g1s-02-03-c1-count-on-hops`
- `VIS-g1s-02-03-c2-count-on-hops`
- `VIS-g1s-02-04-c1-count-on-hops`
- `VIS-g1s-02-04-c2-count-on-hops`

These remain explicit illustration-replacement debt for exact visuals of two equal squares forming a rectangle, six matching triangles forming a hexagon, and filling an outline without gaps or overlap.

### Progression closures

The following P0 causes now have distinct learner jobs rather than repeated or answer-revealing steps:

- `PROGRESSION-g1s-01-01`
- `PROGRESSION-g1s-01-02`
- `PROGRESSION-g1s-02-01`
- `PROGRESSION-g1s-02-02`
- `PROGRESSION-g1s-03-01`
- `PROGRESSION-g1s-03-02`
- `PROGRESSION-g1s-03-03`

The revised sequence covers attribute identification, size invariance, composing and decomposing at a seam, flat-face versus curved-surface reasoning, and reversing a composition. The aggregate regression checks exact, normalized, and structured-payload uniqueness for every flagged step.

## Mathematical and language truth repairs

- A square is now identified by four equal straight sides and four square corners; a rectangle by four straight sides and four square corners.
- Composition claims are bounded to the shown construction: matching triangle halves, equal squares side by side, and six matching triangles arranged evenly around one centre.
- Solid-shape explanations now acknowledge flat faces, curved surfaces, or both.
- Rectangle decomposition prompts now refer to the rectangle built from two equal squares instead of implying every rectangle decomposes that way.
- All lesson, step, option, and hotspot identifiers are preserved, as are evaluator types and correct-answer identifiers.

## Verification

- Idempotent repair check: `CURRENT`; 14 truthful bindings, six fail-closed visuals, seven progression causes repaired.
- Focused tests: two files, 18 tests passed.
- Course/schema validation: 1,840 of 1,840 lessons clean.
- Pedagogy audit: 1,711 of 1,711 lessons clean.
- Strict CML: zero errors and zero warnings.
- Whole-repository TypeScript check: passed.
- Scoped ESLint: passed.
- Scoped diff check: passed at handoff.

## Residual authority boundary

This report supports 21 source closures and preserves six P0 visual residuals. It does not self-close the three generic disposition streams or any P1 row. In particular, the P1 normalized-collision review for `g1s-02-04` remains assessor-controlled and is not claimed here.
