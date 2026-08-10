# Session 143 correction audit

- Result: **FAIL**
- Checks: **33/37 passed**
- Repair content boundary: **1 file / 1 string**
- Authorized field: `content/courses/coordinate-geometry/lessons/cg-04-02.json → steps.k3.variant.form`

## Checks

- PASS — `union.graphStory.plainZodObject`: GraphStoryLabSpec must remain a plain ZodObject before z.discriminatedUnion.
- PASS — `union.conditionalTable.plainZodObject`: ConditionalTableLabSpec must remain a plain ZodObject before z.discriminatedUnion.
- PASS — `integrity.graphStory.relocated`: Graph-story cross-field validation is in widgetIntegrityErrors.
- PASS — `integrity.conditionalTable.relocated`: Conditional-table cross-field validation is in widgetIntegrityErrors.
- PASS — `content.cg0402.oneString`: Exactly one variant.form uses the collision-free name.
- PASS — `content.cg0402.beforeHash`: Reverting the one string must reproduce sealed S142 hash f163334d7db8f401d828098462e7a7786c83c81c6180e7f28ce0deb0d05ec63a.
- PASS — `content.cg0402.afterHash`: Corrected lesson hash must be 4c11027357444f26b571b9845d362401825b4c80043b6ea2fdcc37836b1833b8.
- PASS — `content.cg0402.field`: Only steps.k3.variant.form is authorized by the repair ledger.
- PASS — `repair.revealGhost.renamed`: RevealGhost was recovered as the shared GhostChip.
- PASS — `repair.shapeGhost.noCollision`: Shape hierarchy and shuffle-test ghost IDs are distinct.
- PASS — `repair.signedFraction.unreduced`: Signed-fraction unreduced misconception path is present in generator and tests.
- PASS — `repair.angleMeasure.commonAngles`: angleMeasure wrong paths include commonAngles feedback.
- PASS — `repair.collision.generator`: Collision-free shape-hierarchy generator and structural gate are wired.
- PASS — `repair.collision.sweep`: S140 sweep targets the collision-free generator form.
- PASS — `repair.percentChange.generator`: pr-04-02 variants emit percentChangeLab rather than numeric.
- PASS — `repair.percentChange.gateOne`: percentChangeLab has an explicit structural gate branch.
- PASS — `repair.conditionalTable.gateOne`: conditionalTableLab has a structural gate supporting numeric and label parser routes.
- PASS — `repair.equationOutcome.optionClass`: EquationOutcomeLabW defines a 44px optionClass.
- PASS — `repair.shapeHierarchy.targetHeight`: ShapeHierarchyLab retains intentional taller two-line controls.
- PASS — `repair.triangleClosure.aria`: Triangle SVG and hinge slider have distinct accessible names.
- PASS — `repair.compositeArea.wording`: Composite-area operations use add/subtract wording.
- PASS — `repair.describeState.narration`: Shape-hierarchy narration states the tested relation and selected evidence.
- PASS — `repair.widgetWrongPaths.array`: Recovered wrong-path cases return arrays.
- PASS — `repair.learnerAnswerText.surfaces`: Recovered learner answer surfaces are represented in evaluate.ts.
- PASS — `repair.keyboard.equationOutcome`: equationOutcomeLab has direct keyboard coverage.
- PASS — `repair.keyboard.sixRecovered`: All six recovered keyboard gates are present.
- PASS — `repair.renderQueries.shape`: Shape-hierarchy query ambiguity is repaired.
- PASS — `repair.renderQueries.signed`: Signed-fraction render queries use unambiguous selectors.
- FAIL — `evidence.registration`: Engine registration must remain 117/117.
- FAIL — `evidence.product`: Product totals remain 1129 lessons, 117 widgets, 111 manipulatives.
- PASS — `evidence.backlog`: K–8 queue is fully classified with zero unreviewed (any size, including zero).
- PASS — `evidence.signedSweep`: Signed-fraction sweep is regenerated at 4,608/4,608.
- PASS — `evidence.shapeSweep`: Shape-hierarchy sweep is regenerated at 11,520/11,520.
- PASS — `evidence.conditionalSweep`: Conditional-table sweep is regenerated at 9,216/9,216.
- PASS — `evidence.graphSweep`: Graph-story sweep remains 9,216/9,216.
- FAIL — `package.packageJson`: package.json is byte-identical to the sealed dependency declaration.
- FAIL — `package.lockfile`: package-lock.json is byte-identical to the sealed lockfile.

## Interpretation

This audit verifies that the corrected S141–142 surfaces are present, that the two discriminated-union members remain plain ZodObject values, and that Session 143 graph-story evidence remains intact. It is package-safe and does not claim TypeScript, Vitest, build, or Playwright execution.
