# Geometry Grade 7 S248 independent triple-disposition assessment

Status: **PASS — current-hash-bound candidate, not appended**
Assessment timestamp: `2026-08-18T19:00:00.000Z`
Reviewer: `ChatGPT Work independent assessor (geometry-g7 S248)`
Candidate: `reports/closure/candidates/S248_GEOMETRY_G7_TRIPLE_DISPOSITIONS.jsonl`
Candidate SHA-256: `d0b38b50acaa2b4e8fc286e971de432a7d1815c4a54552f28036169856c45c4f`

## Scope and authority

This is an independent human review of all 21 lessons and their remedial paths in `geometry-g7`. The review used the current `loadLessonReviewAuthority` hashes, every main learner step and widget contract, all 42 concept-figure placements, the registered implementations those figures resolve to, the live figure-text visibility gate, the current scoped queue, and the implementer's aggregate regression and evidence report.

The shared S244 review cards are stale for all 21 scoped lessons and were not used as authority. This packet does not modify lesson source, shared cards, the decision ledger, the queue, caches, or standards artifacts. Standards decisions remain independently open.

## Signed decisions

| Lesson | Basis hash (prefix) | Lesson | Visual | Language | Independent finding |
|---|---:|---|---|---|---|
| `g7-01-01` | `b5a8fff4179c` | KEEP | SUFFICIENT | FIT | Scale and unit-rate models align with the varied learner jobs. |
| `g7-01-02` | `72c1f8ecb2ef` | KEEP | SUFFICIENT | FIT | Inverse scale direction is visible and mathematically consistent. |
| `g7-01-03` | `f42a3289324c` | KEEP | PREFERRED | FIT | Area model is sufficient; a direct square-factor comparison would improve c1. |
| `g7-02-01` | `553e4e551fa8` | KEEP | SUFFICIENT | FIT | Circle parts and pi ratio are visible, varied, and truthful. |
| `g7-02-02` | `a17bdd1096b2` | KEEP | SUFFICIENT | FIT | Circumference models, formulas, options, and feedback agree. |
| `g7-02-03` | `35d5984a47dc` | KEEP | SUFFICIENT | FIT | Area versus circumference is visually and semantically distinct. |
| `g7-03-01` | `28c7561301c5` | REVISE | REQUIRED | FIT | c1 teaches complementary/supplementary but shows complementary/vertical. |
| `g7-03-02` | `cede1e8b1fb3` | REVISE | REQUIRED | FIT | c1 does not show the named vertical-versus-adjacent relationship. |
| `g7-03-03` | `bdb0c145fa8b` | KEEP | SUFFICIENT | FIT | Repaired angle-equation figures and evaluators agree. |
| `g7-03b-01` | `5ca67dd48850` | KEEP | SUFFICIENT | FIT | SSS/SAS existence and uniqueness sequence is sound. |
| `g7-03b-02` | `77fe943b9215` | KEEP | SUFFICIENT | FIT | SSA/AAA non-uniqueness is visible; repeated job was genuinely replaced. |
| `g7-03b-03` | `b3921ea94446` | KEEP | SUFFICIENT | FIT | Construction arcs, interactions, and proof language agree. |
| `g7-04-01` | `2b0223b527be` | REVISE | REQUIRED | REVISE | Pythagorean figure mismatches triangle inequality; k3 has many valid “cannot” answers but accepts only 10. |
| `g7-04-02` | `39458e973670` | KEEP | SUFFICIENT | FIT | Cross-section claims and slice interactions are accurate. |
| `g7-04-03` | `b7f486005d03` | REVISE | REQUIRED | FIT | Roundup names cross-sections but contains no slicing representation or retrieval job. |
| `sa7-01-01` | `0a87e923d1ab` | KEEP | SUFFICIENT | FIT | Net, face ledger, and surface-area progression are coherent. |
| `sa7-01-02` | `61e5c3df6aff` | KEEP | SUFFICIENT | FIT | Surface area and volume are visibly distinguished. |
| `sa7-01-03` | `75e0de261c1c` | REVISE | REQUIRED | REVISE | Pyramid coverage lacks a pyramid visual; “any prism” lateral shortcut must be scoped to right prisms. |
| `sa7-02-01` | `8e25c0b66a8d` | KEEP | SUFFICIENT | FIT | Layer model and right-prism scope are explicit and correct. |
| `sa7-02-02` | `717b158d3b01` | KEEP | SUFFICIENT | FIT | Add/subtract decomposition models and targets agree. |
| `sa7-02-03` | `f02ab72f50ff` | KEEP | SUFFICIENT | FIT | Footprint, surface area, and capacity remain distinct. |

Decision totals:

- Lesson: 16 KEEP, 5 REVISE, 0 ESCALATE.
- Visual: 15 SUFFICIENT, 1 PREFERRED, 5 REQUIRED, 0 ESCALATE.
- Grade language: 19 FIT, 2 REVISE, 0 ESCALATE.

No issue needs `ESCALATE`: all five required changes have deterministic, lesson-local acceptance conditions and can preserve existing evaluator IDs and targets except the intentionally revised ambiguous k3 prompt/answer contract.

## Remaining implementation debt

1. `g7-03-01/c1`: replace `angle-pairs` with a representation that shows both a 90-degree complementary corner and a 180-degree supplementary line.
2. `g7-03-02/c1`: show across/equal vertical angles and next-to/sum-to-180 adjacent angles at the same crossing.
3. `g7-04-01/c1,k3`: use a triangle-inequality reach model; rewrite k3 as a boundary or bounded-choice question with a uniquely defensible accepted response.
4. `g7-04-03`: add a cross-section representation and one slicing retrieval or transfer job so the roundup matches its declared coverage.
5. `sa7-01-03`: add a pyramid/net representation and scope the lateral-perimeter shortcut to right prisms in both main and remedial copy.

`g7-01-03/c1` has a nonblocking preferred enhancement: directly show why a length scale factor of 4 produces an area factor of 16 rather than relying on the later worked rectangle alone.

## Current queue and expected delta

The current live scoped queue contains 144 rows: 21 lesson dispositions, 21 visual dispositions, 21 language dispositions, 8 choice-surface rows, 1 illustration row, 1 progression row, 36 math-presentation rows, and 35 standards rows.

Appending this current-hash candidate and rebuilding the decision-driven queue is expected to close the 63 generic triple-disposition rows and open five `LESSON_REVISION_IMPLEMENTATION` rows: immediate net `-58`, leaving 86 rows before the source-audit refresh. The source-aware refresh should then close 46 already-repaired stale rows (8 choice + 1 illustration + 1 progression + 36 math) and retain or open five specialized visual implementation rows for the findings above. Expected fully refreshed scope: **45 rows** = 35 standards + 5 lesson-revision implementation + 5 specialized visual implementation. This arithmetic is an expectation, not a shared-artifact mutation.

## Mechanical evidence

- Candidate validator: `node reports/closure/candidates/validate-s248-geometry-g7-triple-dispositions.mjs` — PASS; 21/21 current hashes, 42/42 concept placements, exact distributions and queue arithmetic.
- Official appender: `node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S248_GEOMETRY_G7_TRIPLE_DISPOSITIONS.jsonl` — PASS in check-only mode; 21 records accepted.
- Reviewed figure surface SHA-256: `1c5bcc111402f4704751f87b022960537b8b65f306d4ce8f64bdd72ba97e4aeb`.
- Figure alignment gate SHA-256: `ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851`.
- The implementation aggregate regression remains `src/lib/session248.geometryG7CourseIntegrity.test.ts`; this assessment adds no source behavior and does not claim a new source gate.

## Signature boundary

The signed records remain valid only while their exact `reviewedBasisHash` values, the referenced figure surface, and the figure-alignment gate remain current. Any lesson, remedial, evaluator, feedback, option, visual, generator, duplicate inventory, standard, renderer, or V4 contract change triggers the record-level reopen condition. A lesson `KEEP` does not constitute a Common Core standards approval.
