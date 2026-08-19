# S280 — Two-Step Equations Clean-Subset Implementation

## Boundary

The live G4–G8 P1 scan found no wholly clean source course. This packet therefore repairs only the clean, disjoint source subset of `content/courses/two-step-equations`:

- Included: `tse-01-01`, `tse-02-01`, `tse-02-02`, `tse-02-03`, `tse-02-04`, `tse-03-01`, `tse-03-02`, `tse-03-03`, `tse-04-01`, `tse-04-02`, and `tse-04-03`.
- Explicitly excluded as active/dirty at intake: `tse-01-02` and `tse-01b-02`. They are untouched, including their queue work.

No shared renderer, schema, figure registry, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact source closures

The 11 included `LESSON_PROGRESSION_AND_DUPLICATION` rows are repaired across 32 flagged steps. Each changed step keeps its ID, widget type, evaluator answer contract, options, and diagnostic feedback. Only the learner-facing job changes from a number-normalized repeated `Solve`/`Distribute` command to a distinct action: checking a claim, tracing a sign, auditing an error, planning balance-preserving moves, predicting an expansion, verifying by substitution, testing a boundary, or interpreting a contextual model.

The repair clears the normalized prompt collision in every included lesson without pretending that generic lesson, visual, language, or assessor dispositions are source closures.

## Guard and regression

`scripts/session/s280-two-step-equations-progression-subset-repair.mjs` permits only the named text transitions and is idempotent. `src/lib/session280.twoStepEquationsProgressionSubset.test.ts` asserts the excluded files, all 32 distinct jobs, absence of remaining normalized collisions in each included lesson, and full current course schema/pedagogy validity.

## Evidence seal

Subset source seal: `e84e69e6a6193a9013f1cd8968a2ea8dc9539ebba91989590925715ca8607a6b` across the 11 included lesson JSON files. The exact-field guarded repair ran as a write followed by a no-op. The focused regression passed (3 tests); full content validation, pedagogy lint (1711/1711), strict CML lint, CML integration (1701 lesson JSON files), TypeScript, scoped ESLint, and diff check passed.

The static pending queue, review cards, cache, and ledgers were deliberately not regenerated. They therefore still require the root-controlled authority rebuild before those 11 source-cause rows can be reflected as closed. The excluded active files and their outstanding causes are retained.