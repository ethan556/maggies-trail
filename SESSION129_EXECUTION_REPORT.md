# Maggie's Trail — Session 129 execution report

## Objective

Execute the highest-leverage reviewed EXTEND item without changing its assessed claim. `mmt-02-01` asks learners to choose the best estimate from exactly three authored values; Session 128 correctly rejected the pre-existing continuous slider because it would widen the answer space.

## Implemented

### Exact discrete estimate comparison

`estimateSlider` now has a structurally separate exact-choice mode:

- only authored candidates can be selected;
- exactly one candidate must be marked correct;
- the correct candidate must be uniquely closest to the fixed actual value;
- duplicate and out-of-range candidates are rejected;
- each wrong candidate retains its own feedback;
- continuous logarithmic estimation remains unchanged.

The rendered stage shows:

- a zero-based physical comparison ruler;
- a tangerine diamond labeled as the stated actual;
- a sky circle labeled as the learner estimate;
- a dashed distance band;
- a dashed answer ghost on reveal while preserving learner work;
- native 44px candidate buttons and an ARIA live comparison statement.

### Lesson conversion

Converted only four widget nodes:

| location | stated actual | candidates | correct |
|---|---:|---|---:|
| `mmt-02-01/i1` | 9 | 8, 20, 1 | 8 |
| `mmt-02-01/i2` | 12 | 13, 30, 2 | 13 |
| `mmt-02-01/i3` | 7 | 6, 20, 1 | 6 |
| `mmt-02-01` remedial | 9 | 8, 20, 1 | 8 |

Each winner was independently re-derived by absolute distance. Prompts, candidate labels, answers, and all authored feedback were preserved.

## Measured movement

- `mmt-02-01`: **C20 → B27**.
- Product tiers: **A 608 · B 204 · C 289 · D 28**.
- Reviewed K–8 queue: **62 → 61**, all 61 classified, zero unreviewed.
- Step-weighted K–2 causal coverage: 292/843 widget steps (34.6%); 183/323 exploratory steps (56.7%); 106/130 eligible lessons have a causal spine (81.5%).

Tier B is intentional. A prediction would repeat the comparison already taught immediately before each interaction.

## Truth-system repair

`PRODUCT_STATE.md/json` was stale because the freshness gate skipped it when Vitest was unavailable. Session 129 adds `reports/certified-runtime.json` and now separates:

- current source-derived product and test-declaration facts; from
- the last exact-lock executed Vitest/Playwright evidence.

Product state is now always regenerated and byte-stability checked.

## Authored-content ledger

One lesson file / four widget nodes changed under the broken-representation and broken-remedial-interaction exceptions. `scripts/session/content-change-proof-s129.mjs` proves:

- 1,128 non-target lesson files are byte-identical to Session 128;
- top-level lesson fields, step order, every non-target step, variants, checks, challenges, concept tags, and remedial routing in the changed lesson are unchanged;
- the four converted widgets preserve their original prompt, answer set, and feedback.

See `SESSION129_CONTENT_CHANGE_LEDGER.json`.

## Adversarial protection

Eight new tests cover unique-nearest authoring, exact candidate gating, exact feedback, answer labels, tied/duplicate/out-of-range candidates, zero-min continuous authoring, stage comparison behavior, non-color semantics, and reveal preservation. `SESSION129_MUTATION_MATRIX.md` maps fourteen deliberate regressions to detectors.

## Verification

All dependency-free source and package-safe gates passed. Exact-lock installation remains externally blocked by the registry's missing `zustand@5.0.14` tarball and Node 22.16 being below Chromium's Node 22.17 minimum. Project-local tsc, Vitest, content/pedagogy validation, ESLint, build, Playwright, and screenshots are therefore not claimed green. Verbatim evidence is in `SESSION129_GATE_EVIDENCE.md`.

## Next exact-fit cluster

Session 130 should inspect `ssg2-02-02/03` together. A fixed/given-grid read mode is acceptable only if learners read and count the authored grid; a construction mode that builds the answer would change the assessed claim and must be rejected.

## Diff statistics

- Files added: **13**
- Files modified: **31**
- Files deleted: **0**
- Line additions: **2,729**
- Line deletions: **407**

Machine-readable paths and counts: `SESSION129_DIFF_STATS.json`.
