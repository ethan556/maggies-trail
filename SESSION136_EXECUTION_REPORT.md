# Maggie's Trail — Session 136 execution report

## 1. Canonical-baseline decision

`maggies-trail-session-135-verified.tar.gz` is the canonical source tree. Sessions 134–135 proved why the earlier Session-133 package could not remain the verification authority: the supposed dependency blocker was false in that environment, the primary chain had not run for eight sessions, and first execution exposed type, mathematical, renderer, keyboard, adaptation, hydration, reduced-motion, and occlusion defects. Every failure was repaired without weakening a gate. See `SESSION135_CANONICAL_REVIEW_S136.md`.

## 2. Target selection from disk

The live 53-row K–8 ledger was ranked by repeated representation need and remedial reach. The strongest coherent build family was:

- `asv-01-02 — Parallelograms and Trapezoids`: D20, two remedial routes, six static graded surfaces;
- `asv-02-03 — Multi-Step Composite Problems`: D20, one remedial route, five static computational surfaces plus one intentionally retained reasoning MCQ.

Existing `areaModel` was not an exact fit. It constructs one rectangle, but these lessons require four distinct truths to remain simultaneously visible: parallelogram rearrangement, trapezoid decomposition, one requested component area, and signed add/subtract composition.

## 3. Implementation

### New shared engine: `compositeAreaLab`

Three scenes share one derived truth:

1. `parallelogram-rearrange` — a side triangle is cut and reattached to show base × perpendicular height without halving;
2. `trapezoid-diagonal` — two triangles share a height and add to the trapezoid; a step may target one triangle or the total;
3. `piece-ledger` — rectangles, triangles, parallelograms, or given-area pieces carry explicit add/subtract signs.

The engine derives every area from piece dimensions. The same helper drives schema integrity, grading, correct-answer summaries, narration, renderer labels, reveal, and seeded variants.

### Converted coverage

| Lesson | Main interactions | Remedials | Total |
|---|---:|---:|---:|
| `asv-01-02` | 6 | 1 | 7 |
| `asv-02-03` | 5 | 1 | 6 |
| **Total** | **11** | **2** | **13** |

`asv-02-03/k3`, the grouping-order reasoning MCQ, remains unchanged because a piece-area engine would change the assessed claim.

### Variant continuity

Seven existing variant-bearing steps now declare `composite-area-lab` with exact forms:

- `parallelogramMcq`
- `trapezoid`
- `fromTriangles`
- default room-plus-triangle composition
- `threeRects`
- `fourPieces`

Support/core/stretch seed sweeps are declared in the Session-136 unit suite. Integrity rejects duplicate choices, nondimensional pieces, nonexistent piece targets, dishonest scene structures, and ambiguous correct claims.

## 4. Adversarial safeguards

Eleven new test declarations and a 24-case mutation matrix cover:

- parallelogram/triangle rule confusion;
- omitted trapezoid pieces;
- piece-target versus whole-target drift;
- add/subtract sign reversal;
- multiplication of separate areas;
- duplicate/ambiguous choices;
- invalid dimensions and target IDs;
- seeded surface fallback;
- remedial representation regression;
- authored feedback or answer drift;
- 44px keyboard-native controls;
- non-color semantics;
- learner-state-preserving reveal;
- toward/away process signals;
- registration-versus-capability measurement drift.

## 5. Measured result

| Metric | Session 135 canonical | Session 136 |
|---|---:|---:|
| Widget types | 109 | **110** |
| Manipulatives | 103 | **104** |
| Tier A | 608 | 608 |
| Tier B | 212 | **214** |
| Tier C | 281 | 281 |
| Tier D | 28 | **26** |
| Reviewed K–8 queue | 53 | **51** |
| Unreviewed | 0 | **0** |

- `asv-01-02`: **D20 → B30**
- `asv-02-03`: **D20 → B30**

Tier B is honest. The lessons' authored concept steps disclose the relevant area relationships; inserting prediction merely to gain points would repeat taught information.

## 6. Frozen-content ledger

Two lesson files changed under the broken-representation, remedial-surface-continuity, and variant-surface-continuity exceptions:

- 13 widget nodes;
- seven variant declarations;
- zero prose, ID, ordering, answer, hint, explanation, prediction, concept-tag, mastery, XP, or remedial-mapping changes;
- every authored misconception-feedback string remains verbatim and reachable;
- 1,127 other lesson files remain byte-identical to the canonical content seal.

Proof: `SESSION136_CONTENT_CHANGE_LEDGER.json`, `scripts/session/content-change-proof-s136.mjs`, and `SESSION136_LESSON_HASHES.json`.

## 7. Verification summary

The Session-135 canonical package is fully executed: tsc 0, Vitest 10,201/10,201 across 174 files, build 0, Playwright 71/71.

Session-136 dependency-free/source-contract gates are green: 10 changed TypeScript/TSX files transpile with zero diagnostics; 1,386 source JSON files parse; content proof and 1,129-file hash proof pass; 13/13 engine audit, 51/51 excellence classification, 110/110 registration, 36/36 player-harness contract, 25/25 generated freshness, native clean-copy, registration, and tidy pass. The package lifecycle was also executed: the tar was re-extracted and reran native integrity, identity, content proof, hash proof, tidy, registration, the player harness contract, all historical non-regression audits, and the Session-136 composite-area audit successfully.

The current execution container lacks the canonical dependency tree. Public exact-lock installation failed inside npm itself; the internal mirror lacks `zustand@5.0.14`; Node 22.16 is below Chromium 149's 22.17 floor. Therefore Session-136 tsc, Vitest, validators, build, and Playwright are explicitly **blocked—not passed** in this container. No claim is inherited from Session 135 for changed code.

Full command evidence: `SESSION136_GATE_EVIDENCE.md`.

## 8. Diff statistics

See `SESSION136_DIFF_STATS.json` for per-file numstat. Current aggregate versus the Session-135 canonical package:

- files added: **14**;
- files modified: **40**;
- files deleted: **0**;
- line additions: **3,911**;
- line deletions: **630**.

## 9. Next binding target

Execute the Session-136 full exact-lock chain under Node 22.17+ before browser certification. Then rerank the live 51-row queue. `asv-03-03` should not be pulled automatically merely because it shares the course: its coordinate capstone requires a separately proved coordinate-decomposition action and may need a multi-engine design.
