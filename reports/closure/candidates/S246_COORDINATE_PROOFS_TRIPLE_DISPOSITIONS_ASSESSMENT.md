# S246 coordinate-proofs triple-disposition assessment

## Scope and authority

This packet independently reviews all 15 live Grade 10 lessons in `coordinate-proofs` across the V4 whole-lesson, visual-first, and grade-language dimensions. The assessment read each complete lesson and remedial path, the course manifest, every current S244 review card, all 26 registered concept-figure placements, the relevant figure and widget implementations, and the current course/generator queue rows. A prior interaction `KEEP`, a rendered figure field, recent generator assurance, or the absence of a heuristic flag was not treated as whole-lesson approval.

This is an isolated candidate packet. It does not edit the shared append-only decision ledger, lesson source, generator source, queue, review cards, cache, or shared scripts.

## Validated result

- Live manifest, cards, and candidate records: **15 / 15 / 15**.
- Current card basis hashes: **15 / 15**.
- Current lesson and course source hashes: **15 / 15**.
- Whole lesson: **1 KEEP**, **14 REVISE**, 0 ESCALATE.
- Visual first: **9 REQUIRED**, **1 PREFERRED**, **5 SUFFICIENT**, 0 ESCALATE.
- Grade language: **10 FIT**, **5 REVISE**, 0 ESCALATE.
- Exact required fields, enums, evidence paths, record IDs, lesson IDs, and expected distributions: validated by `validate-s246-coordinate-proofs-triple-dispositions.mjs`.

A current authoritative append would close 45 generic review rows—15 each for whole-lesson disposition, visual disposition, and grade-language review—but the 14 `REVISE` decisions must remain visible as implementation debt. They do not close standards, choice-surface, progression, or mathematical-presentation work.

## Lesson decisions

| lesson | live basis hash | whole lesson | visual | language | primary finding |
|---|---|---|---|---|---|
| cx-01-01 | `c6fcd01c948f32bc52661f3066384922b4f81453b8cfe54907d4eb2be67dce55` | REVISE | SUFFICIENT | FIT | Strong run-rise sequence; eight authored math-rendering rows remain. |
| cx-01-02 | `4a1dbc7155a22a61988363995e478972e4e51a638a3671682acae9a39f8401ae` | KEEP | SUFFICIENT | FIT | Coherent midpoint, reverse endpoint, construction, explanation, and transfer sequence. |
| cx-01-03 | `a149edee9dbc461b7d5c0159bb3b31861df793deb183da153a14c4e5da286b45` | REVISE | SUFFICIENT | FIT | Parallelogram slope/midpoint lab precedes those chapter criteria; two notation rows remain. |
| cx-02-01 | `2d5cf040c9edfe3ea6e5fb64fec30ed23b727a325afd78d8c4040eaf31f43b4c` | REVISE | SUFFICIENT | FIT | k1 and k2 are an adjacent normalized same-job repeat. |
| cx-02-02 | `78541a816c21b888f48ce39ceb12e62ff65e48210cfe2b5b9a9274d0a6c815c3` | REVISE | REQUIRED | FIT | Parallel-converse text is paired with the perpendicular `m₁·m₂ = −1` figure. |
| cx-02-03 | `23e73780ca2c64f5a0b29abe11f944cecfe58e308e8aa802003f50d3270c8109` | REVISE | SUFFICIENT | FIT | Strong rotation model; MCQ parity and three notation rows remain. |
| cx-03-01 | `ae70c3fe63de940ee57f25dc0e188c4566c77832e405fe5f2a34b898fa74cfc4` | REVISE | REQUIRED | FIT | Spatial classification is mostly coordinate prose; flagged option length leaks the answer. |
| cx-03-02 | `9057d9ddc596ebe5981014aeda8ed08f551b17e1f0d5a943b51950ec7c9bbb41` | REVISE | REQUIRED | REVISE | Evidence diagrams are absent from most classifications; `pq` shorthand leaks into learner text. |
| cx-03-03 | `267473ea539dd04eb190345ad134c62edb7cc7f55bb8888272eb6029e910a0db` | REVISE | REQUIRED | REVISE | Variable labels and figure placement disagree; option cue, notation, and `tm`/`pq` leaks remain. |
| cx-04-01 | `ced30ee317c86ead51565e1c77e72fee0451a8eb892b241548d92a0300cec66e` | REVISE | REQUIRED | FIT | Polygon boundaries are described, not shown; radical-perimeter semantic sources conflict. |
| cx-04-02 | `4c31619b88e319a1cf43e53c8a1bd30b3a1ca45de6d7334df909b62c3f916aeb` | REVISE | REQUIRED | REVISE | Box/corner model is absent during central work and appears only after reveal; `g7` shorthand remains. |
| cx-04-03 | `c53aec3e3821c32c41d6614edbc5828b362e921795df9a5786201fe1b6e5ae18` | REVISE | REQUIRED | REVISE | No visible coordinate table or lacing products; option cue and ornamental wording remain. |
| cx-05-01 | `9b41e14e5163d37b54ac77e5a4a600d78c6d6f2b90903cfa824653c3a358df90` | REVISE | REQUIRED | FIT | Tangency task uses a distance grid that never renders the promised circle. |
| cx-05-02 | `3ea841d1f52fb6e02d9b012a0c7320f352d8609bba0496bc88f975db8b87e952` | REVISE | REQUIRED | FIT | Coverage task omits the radius disk and inside/on/outside regions; inequality notation row remains. |
| cx-05-03 | `6a6c07a3182c377fe5fc3faaec36d8b00d80a35979a5d030110ca10d3e34d834` | REVISE | PREFERRED | REVISE | Symbolic sequence is strong; MCQ answer length, `cr` shorthand, and thin before/after figures remain. |

## Material blockers found by independent review

1. **A learner-visible contradictory figure:** `cx-02-02` c2 teaches the equal-slope parallel converse while `CxPerpSlopes` visibly states the perpendicular product rule. The current alignment audit marks this placement as aligned, so this independent finding must not be discarded as detector noise.
2. **Two further figure/source mismatches:** `CxVariablesGeneral` labels `(2a, 2b)` while `cx-03-03` reasons with `(a, b)`; the same lesson’s c2 symmetry-placement prose is paired with the Varignon figure.
3. **A contradictory radical-perimeter semantic model:** `cx-04-01` i1 declares a square through points with side 3 while separately declaring every side radicand as 18. The specialized renderer hides the points, but one semantic item must not contain two geometries.
4. **Question-surface visual promises are not honored:** the `distanceGrid` implementation draws axes, two points, legs, and a hypotenuse, but no circle. It therefore cannot by itself carry tangency in `cx-05-01` or a radius-20 coverage disk in `cx-05-02`.
5. **Spatial topics frequently fall back to prose:** triangle and quadrilateral classification, coordinate perimeter, box subtraction, and shoelace questions often name coordinates without rendering the exact figure, boundary, corner pieces, or lacing products the learner must inspect.
6. **Current family queues remain open:** 7 coordinate-generator choice-surface rows, 1 authored progression row, and 28 mathematical-presentation rows (18 authored plus 10 generator rows) remain in the scoped live queue. The candidate dispositions acknowledge those rows; they do not close them.
7. **Internal shorthand reaches students:** `pq`, `tm`, `g7`, and `cr` appear in explanations, hints, or feedback. Those are repository/course codes, not mature mathematical wording.
8. **Standards are untouched:** the course contributes 75 candidate standards-verification rows. This packet makes no standards approval, rejection, partial-coverage, alignment, or mastery claim.

## Visual evidence ruling

All 26 concept placements are registered, renderable, and marked aligned by the current mechanical audits. That is useful structural evidence, but it is not semantic sufficiency. Five lessons earn `SUFFICIENT` because their live figures or labs carry the needed relationship; nine require a corrected or value-synchronized representation; one would benefit from a stronger structured/animated symbolic-to-geometric transition. A populated `figure` field or a plotted answer surface was never counted automatically as visual-first teaching.

## Honest closure boundary

`cx-01-02` is the only current `KEEP / SUFFICIENT / FIT` lesson in this course packet. The other 14 records are completed reviews, not completed implementations. They should generate or preserve one bounded revision row per lesson after authoritative integration, and each lesson must be reassessed against a new live basis hash after repair.
