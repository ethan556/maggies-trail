# Maggie's Trail — Session 137 execution report

## 1. Canonical boundary and no-presumption method

Session 135 verified remains the last fully executed primary-gate boundary. Session 136 is the sealed authored-content baseline for this session. Session 137 does not inherit runtime claims from either tree: every result below is either rerun against the Session-137 source/package or explicitly recorded as unavailable.

The live 51-row excellence ledger was reranked by incoming remedial reach, missing representation, exact-engine fit, and number of distinct mathematical claims. `g7-04-03 — Geometry Roundup` led with five incoming remedial routes, but it was not treated as one widget problem. Its six graded claims were audited independently before mutation.

Existing-engine fits were rejected where they changed or omitted the assessed action:

- `dilationExplore` grades scale factor, not conversion from a drawing radius to the corresponding real radius;
- `circleMeasureExplore` does not preserve the plan-to-real chain and exact circumference/area coefficient together;
- `solveBalance` omits the linear-pair geometry that gives the equation meaning;
- `triangleConstraintLab` teaches congruence sufficiency, not strict triangle closure.

## 2. Breakthrough implementation

Session 137 avoids a monolithic “geometry roundup” widget. It adds two focused engines and one narrow extension, each carrying its own mathematical truth.

### `scaledCircleLab`

A single visible chain connects:

1. drawing radius;
2. scale conversion;
3. real radius;
4. circumference coefficient or area coefficient.

The engine independently derives the target and rejects duplicate, ambiguous, or dishonest choices. It preserves the learner's selected claim on reveal and pairs semantic colour with labels, line styles, and circle/diamond markers.

### `triangleClosureLab`

Two fixed side lengths form a hinge. The learner explores the angle between them, observes whether the third side leaves a gap, forms a flat equality, or closes a genuine triangle, and then chooses the authored reasoning claim. Strict closure uses `a + b > c`; equality is explicitly rendered as a flat line rather than success.

### `angleMeasure.linearPair`

The mature protractor engine is extended—not replaced—with a linear-pair relationship card. The diagram, multiplier, straight-line total, target angle, and exact common-angle diagnoses are integrity-checked together. Existing direct manipulation remains intact.

## 3. Converted coverage

| Step | Surface | Independently derived answer | Wrong paths | Variant continuity |
|---|---|---:|---:|---|
| `i1` | `scaledCircleLab` | 6 | 2 | fixed |
| `k1` | `scaledCircleLab` | 12 | 2 | fixed |
| `i2` | `scaledCircleLab` | 36 | 2 | fixed |
| `k2` | `angleMeasure.linearPair` | 60 | 2 | `angle-equation/linearPairLab` |
| `k3` | `triangleClosureLab` | authored choice `a` | 3 | `g7-triangle-inequality/frameCheck` |
| `ch1` | `scaledCircleLab` | 16 | 2 | fixed |

All 13 authored wrong-path feedback mappings remain verbatim and reachable.

## 4. Adversarial findings and repairs

The no-presumption method caught two implementation defects that syntax and static registration checks did not establish:

1. **Wrong generator return contract.** The first implementation returned raw widget objects for the new seeded forms instead of full deterministic `Variant` records. The forms now return prompt, widget, and state-shaped answer together.
2. **Wrong helper semantics.** The project helper `pick(lo, hi)` is numeric. It was initially used as though it selected arbitrary objects and strings, producing `undefined`, `NaN`, and malformed prompts. The generator now selects by explicit array index.

After repair, the actual generator code was executed through an independent TypeScript loader across 1,536 cases:

```text
angle variants: 768/768
triangle-frame variants: 768/768
valid triangle cases: 369
invalid/flat/gap cases: 399
```

Ten new declared tests and a 23-case mutation matrix cover scale misuse, formula confusion, ambiguous choices, linear-pair equation drift, false triangle equality, surface fallback, feedback loss, insufficient exploration, reveal replacement, accessibility targets, process events, registration drift, and unauthorized authored-content mutation.

## 5. Measured result

| Metric | Session 136 | Session 137 |
|---|---:|---:|
| Registered widget types | 110 | **112** |
| Manipulatives | 104 | **106** |
| Tier A | 608 | 608 |
| Tier B | 214 | **215** |
| Tier C | 281 | 281 |
| Tier D | 26 | **25** |
| Reviewed K–8 queue | 51 | **50** |
| Unreviewed | 0 | **0** |

- `g7-04-03`: **D22 → B33**
- Engine registration: **112/112 core-complete**
- Player harness contract: **36/36**
- Projected browser executions: **71**

Tier B is honest. The preceding authored concept steps already teach the relationships, so inserting predictions only to increase a rubric score would repeat disclosed information rather than create a prediction–experiment cycle.

## 6. Frozen-content ledger

One lesson file changed under the broken-representation and variant-surface-continuity exceptions:

- six widget nodes;
- one variant declaration;
- zero prose, ID, ordering, answer, hint, explanation, prediction, concept-tag, mastery, XP, or remedial-mapping changes;
- every authored wrong-path feedback string remains verbatim and reachable;
- 1,128 other lesson files remain byte-identical to Session 136.

Proof: `SESSION137_CONTENT_CHANGE_LEDGER.json`, `scripts/session/content-change-proof-s137.mjs`, and `SESSION137_LESSON_HASHES.json`.

## 7. Verification summary

The final Session-137 source shape passed:

```text
changed-source transpilation: 10/10
JSON parsing: 1,391 files
content proof: 1,129 lessons; 1 file / 6 widgets / 1 variant
geometry-roundup audit: 6/6 experiences
executable seed sweep: 1,536/1,536
excellence ledger: 50/50; zero unreviewed
engine registration: 112/112
player harness contract: 36/36
historical non-regression audits: passed
generated freshness: 27/27 byte-stable
lesson hash proof: 1,129/1,129
native clean-copy integrity: passed
course/file/PLAN registration: passed
package identity and tidy: passed
```

The final archive was re-extracted and reran the package-safe proof chain against the extracted tree.

The current execution container has Node 22.16.0 and no reusable exact-lock dependency tree. `npm ci --ignore-scripts` was attempted and failed because the configured internal registry returned 404 for `zustand@5.0.14`; the same install warned that Chromium 149 requires Node 22.17 or later. Therefore Session-137 project-local tsc, Vitest, validators, build, Playwright, and screenshots are explicitly unavailable in this container and are not inherited from Session 135.

The ten declared tests produce a projected suite of **10,211 tests across 176 files**, pending canonical runtime execution.

## 8. Diff statistics

See `SESSION137_DIFF_STATS.json` for the final per-file numstat. Aggregate delta versus Session 136:

- files added: **11**;
- files modified: **37**;
- files deleted: **0**;
- line additions: **2,716**;
- line deletions: **402**.

## 9. Binding next action

Run `npm run verify:session` against this exact archive in the canonical dependency environment before Session 138 mutates another lesson. Then rerank the live 50-row ledger from disk; no named target is presumed.
