# S254 — Data and Line Plots G2 whole-course source repair

## Result

The current `data-line-plots-g2` source supports **36 bounded source closures** across all 12 lessons:

- 24 `ILLUSTRATION_REPLACEMENT` rows: every `c1` and `c2` moved from the unrelated `count-on-hops` placeholder to an existing registered measurement, line-plot, picture-graph, or single-scale graph figure.
- 12 `LESSON_PROGRESSION_AND_DUPLICATION` rows: every reported exact repeat was replaced with a distinct dataset, diagnostic, representation-read, or transfer job while preserving step IDs, evaluator types, answers, and variant contracts.

The repair is guarded by `scripts/audit/repair-data-line-plots-g2-s254.mjs`. A second `--check` pass reports `CURRENT`, zero changed lessons, and course seal:

`14eb0dae24706c233853cf026256150c5a03101464762cf220c6ffb1916100d2`

No queue, cards, cache, standards, ledger, schema, figure registry, generator, widget, or evaluator file was changed.

## Exact source-row disposition

All of the following current-queue source IDs are source-compatible for closure after independent assessment and queue regeneration:

- `VIS-{lesson}-c1-count-on-hops` and `VIS-{lesson}-c2-count-on-hops` for each of `g2g-01-01`, `g2g-01-02`, `g2g-01-03`, `g2g-01-04`, `g2g-01-05`, `g2g-02-01`, `g2g-02-02`, `g2g-02-03`, `g2g-02-04`, `g2g-03-01`, `g2g-03-02`, and `g2g-03-03` (24 rows).
- `PROGRESSION-{lesson}` for those same 12 lesson IDs (12 rows).

Figure bindings are:

| Lesson | c1 | c2 |
|---|---|---|
| g2g-01-01 | `ruler-measure` | `mmt-same-reading` |
| g2g-01-02 | `dd-data-answers` | `vm-line-plot-read` |
| g2g-01-03 | `vm-line-plot-read` | `vm-line-plot-read` |
| g2g-01-04 | `vm-line-plot-read` | `vm-line-plot-read` |
| g2g-01-05 | `vm-line-plot-read` | `vm-line-plot-read` |
| g2g-02-01 | `mmt-picture-graph` | `mmt-picture-graph` |
| g2g-02-02 | `mmt-picture-graph` | `mmt-picture-graph` |
| g2g-02-03 | `single-scale-graph` | `single-scale-graph` |
| g2g-02-04 | `single-scale-graph` | `mmt-taller-bar` |
| g2g-03-01 | `single-scale-graph` | `single-scale-graph` |
| g2g-03-02 | `mmt-graph-subtraction` | `single-scale-graph` |
| g2g-03-03 | `vm-line-plot-read` | `single-scale-graph` |

Each bound figure is registered and the aggregate regression renders it server-side, requiring an SVG title and `role="img"`. The regression also checks concept narration/body parity and the two concepts whose prose cites exact values against the shared `single-scale-graph` data: cats 3/birds 4 and dogs 6/cats 3.

## Progression repairs

- Measurement and recording lessons now move to new ribbons/datasets and include error diagnosis or transfer rather than replaying the first task.
- Line-plot lessons use second distributions, alternate read targets, mode/frequency diagnostics, and table-to-plot transfer.
- Picture- and bar-graph lessons use new category sets and separate construction from reading/scale interpretation.
- Put-together and compare lessons now read two distinct bars before applying addition or subtraction.
- The graph-choice lesson now contrasts a category bar build with a read-only measurement line plot.

Across each lesson's main route, exact prompt, number-normalized prompt, and full-widget payload collisions are now zero.

## Additional truth repairs

The bounded pass also repaired learner-visible claims encountered during the audit:

- Records retain every measurement and repeat but need not preserve collection order.
- A picture's value is controlled by its key; it is not universally one object per picture.
- Ruler feedback now explains shared-unit comparability rather than saying a count “means nothing.”
- Numeric and graph-reading fallbacks now name the actual representation and learner action.
- Authored picture-graph noun phrases were repaired on main and remedial routes.
- Bar-graph concept prose was synchronized with the registered figure's exact cats/dogs/birds counts.

The legacy independent solver regression exposed three authored prompts whose first-number/equation syntax disagreed with their registered variant contract. Those prompts were rewritten without changing answers or evaluator semantics; both legacy and aggregate suites now pass.

## Evidence gates

- Repair update: 12 lessons normalized; final `--check`: `CURRENT`, 0 changes.
- Focused tests: `src/lib/session194.dataLinePlots.test.ts` plus `src/lib/session254.dataLinePlotsG2CourseIntegrity.test.tsx`: **2 files, 20 tests passed**.
- Full schema validation: pass.
- Full pedagogy lint: **1711/1711 files clean**.
- Strict CML lint: **0 errors, 0 warnings**.
- CML integration: **1701 lesson JSON files parsed**.
- TypeScript typecheck: pass.
- Targeted ESLint for the repair and aggregate test: pass.
- Scoped `git diff --check`: pass (line-ending conversion notices only).

## Honest residuals

The incoming portfolio has 72 rows. This source pass does **not** self-close the 36 generic review streams:

- 12 `VISUAL_FIRST_REPRESENTATION`
- 12 `GRADE_LANGUAGE_REVIEW`
- 12 `LESSON_COMPLETE_DISPOSITION`

Those require an independent current-source disposition (`REQUIRED`/`PREFERRED`/`SUFFICIENT`/`ESCALATE`, `FIT`/`REVISE`/`ESCALATE`, and `KEEP`/`REVISE`/`ESCALATE`) before authoritative append/queue regeneration.

Specialized assessor-visible debt also remains outside these 36 source closures:

- Seven remedial concepts are still exact text-only copies of `c2`: `g2g-01-01`, `g2g-01-03`, `g2g-01-04`, `g2g-01-05`, `g2g-02-02`, `g2g-02-03`, `g2g-02-04`.
- Ten remedial checks still reuse the main `k1` widget: `g2g-01-01`, `g2g-01-02`, `g2g-01-03`, `g2g-01-04`, `g2g-01-05`, `g2g-02-03`, `g2g-02-04`, `g2g-03-01`, `g2g-03-02`, `g2g-03-03`.
- Correct MCQ options remain in the legacy first position because the existing S194 contract explicitly requires it; cue-position balancing needs a separately authorized family/runtime migration.
- Several lessons truthfully reuse the same semantic figure for both concepts. The source mismatch is closed, but an independent visual-first assessor must decide whether reuse is sufficient or whether a new specialized figure is preferred.

There is no blocker to the 36 claimed source closures. The residuals above must not be silently counted as closed.
