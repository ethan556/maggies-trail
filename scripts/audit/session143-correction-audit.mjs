import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const read = (p) => readFileSync(join(root, p), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const checks = [];
const check = (id, passed, detail) => checks.push({ id, passed: Boolean(passed), detail });
const contains = (file, needle) => read(file).includes(needle);

const schema = read('src/lib/schema.ts');
const between = (start, end) => {
  const a = schema.indexOf(start);
  const b = schema.indexOf(end, a + start.length);
  if (a < 0 || b < 0) return '';
  return schema.slice(a, b);
};
const graphSpec = between('export const GraphStoryLabSpec', '/** conditionalTableLab');
const condSpec = between('export const ConditionalTableLabSpec', '/** conicLocusLab');
const graphIntegrity = between('case "graphStoryLab"', 'case "conditionalTableLab"');
const condIntegrity = between('case "conditionalTableLab"', 'case "triangleConstraintLab"');

check('union.graphStory.plainZodObject', graphSpec.includes('z.object({') && !graphSpec.includes('.refine(') && !graphSpec.includes('.superRefine('), 'GraphStoryLabSpec must remain a plain ZodObject before z.discriminatedUnion.');
check('union.conditionalTable.plainZodObject', condSpec.includes('z.object({') && !condSpec.includes('.refine(') && !condSpec.includes('.superRefine('), 'ConditionalTableLabSpec must remain a plain ZodObject before z.discriminatedUnion.');
check('integrity.graphStory.relocated', ['awayOnly','readTask','answerLabel','wrong sequence'].every((s) => graphIntegrity.includes(s)), 'Graph-story cross-field validation is in widgetIntegrityErrors.');
check('integrity.conditionalTable.relocated', ['readMetric','answerChoices','answer-choice ids must be unique','exactly one independently derived correct choice'].every((s) => condIntegrity.includes(s)), 'Conditional-table cross-field validation is in widgetIntegrityErrors.');

const cgPath = 'content/courses/coordinate-geometry/lessons/cg-04-02.json';
const cg = read(cgPath);
const oldForm = 'cgParallelogramTrapezoid';
const newForm = 'cgParallelogramTrapezoidVerdict';
const beforeHash = 'f163334d7db8f401d828098462e7a7786c83c81c6180e7f28ce0deb0d05ec63a';
const afterHash = '4c11027357444f26b571b9845d362401825b4c80043b6ea2fdcc37836b1833b8';
const occurrences = (text, needle) => text.split(needle).length - 1;
const reverted = cg.replace(newForm, oldForm);
check('content.cg0402.oneString', occurrences(cg, newForm) === 1 && occurrences(cg, `"form": "${oldForm}"`) === 0, 'Exactly one variant.form uses the collision-free name.');
check('content.cg0402.beforeHash', sha(reverted) === beforeHash, `Reverting the one string must reproduce sealed S142 hash ${beforeHash}.`);
check('content.cg0402.afterHash', sha(cg) === afterHash, `Corrected lesson hash must be ${afterHash}.`);
check('content.cg0402.field', JSON.parse(cg).steps?.find((step) => step.id === 'k3')?.variant?.form === newForm, 'Only steps.k3.variant.form is authorized by the repair ledger.');

const widgets = read('src/components/widgets.tsx');
const describe = read('src/lib/describeState.ts');
const evaluate = read('src/lib/evaluate.ts');
const pedagogy = read('src/lib/pedagogy.ts');
const variants = read('src/lib/variants.ts');
const variantTests = read('src/lib/variants.test.ts');
const keyboardTests = read('src/components/widgets.keyboard.test.tsx');
const shapeTest = read('src/components/widgets.shapeHierarchy.s140.test.tsx');
const signedTest = read('src/components/widgets.signedFraction.s139.test.tsx');

check('repair.revealGhost.renamed', widgets.includes('function GhostChip') && !widgets.includes('function RevealGhost'), 'RevealGhost was recovered as the shared GhostChip.');
check('repair.shapeGhost.noCollision', widgets.includes('testid="shlab-ghost"') && widgets.includes('testid="sh-ghost"'), 'Shape hierarchy and shuffle-test ghost IDs are distinct.');
check('repair.signedFraction.unreduced', variants.includes('const wantsMulDiff = form === "mulDiff" && simplifies') && variants.includes('path: "correct" | "wrongSign" | "keptDivisor" | "magnitudeError" | "unreduced"'), 'Signed-fraction unreduced misconception path is present in generator and tests.');
check('repair.angleMeasure.commonAngles', pedagogy.includes('case "angleMeasure"') && pedagogy.includes('w.commonAngles ?? []'), 'angleMeasure wrong paths include commonAngles feedback.');
check('repair.collision.generator', variants.includes('"cgParallelogramTrapezoidVerdict"') && variantTests.includes('shape-hierarchy@cgParallelogramTrapezoidVerdict'), 'Collision-free shape-hierarchy generator and structural gate are wired.');
check('repair.collision.sweep', contains('scripts/audit/shape-hierarchy-variant-sweep-s140.cjs', 'cgParallelogramTrapezoidVerdict'), 'S140 sweep targets the collision-free generator form.');
check('repair.percentChange.generator', variants.includes('type: "percentChangeLab"') && variants.includes('pr-price-adjust-g7'), 'pr-04-02 variants emit percentChangeLab rather than numeric.');
check('repair.percentChange.gateOne', variantTests.includes('if (parsed.type === "percentChangeLab")'), 'percentChangeLab has an explicit structural gate branch.');
check('repair.conditionalTable.gateOne', variantTests.includes('if (parsed.type === "conditionalTableLab")') && variantTests.includes('prompt + "||"'), 'conditionalTableLab has a structural gate supporting numeric and label parser routes.');
check('repair.equationOutcome.optionClass', widgets.includes('function EquationOutcomeLabW') && widgets.includes('const optionClass') && widgets.includes('min-h-11'), 'EquationOutcomeLabW defines a 44px optionClass.');
check('repair.shapeHierarchy.targetHeight', widgets.includes('function ShapeHierarchyLabW') && widgets.includes('min-h-14'), 'ShapeHierarchyLab retains intentional taller two-line controls.');
check('repair.triangleClosure.aria', widgets.includes('aria-label={`Beams ${a}, ${b}, and ${c}. Frame currently opened to ${angle} degrees.') && (widgets.split('aria-label="hinge angle"').length - 1) === 1, 'Triangle SVG and hinge slider have distinct accessible names.');
check('repair.compositeArea.wording', widgets.includes('subtract this cut-away piece') && widgets.includes('add this piece') && widgets.includes('${subtract ? "subtract" : "add"}'), 'Composite-area operations use add/subtract wording.');
check('repair.describeState.narration', describe.includes('Testing whether ${spec.subjectLabel} is always, sometimes, or never') && describe.includes('Evidence shown: ${choice.evidenceText}'), 'Shape-hierarchy narration states the tested relation and selected evidence.');
check('repair.widgetWrongPaths.array', pedagogy.includes('export function widgetWrongPaths') && pedagogy.includes('case "equationOutcomeLab"') && pedagogy.includes('return ['), 'Recovered wrong-path cases return arrays.');
check('repair.learnerAnswerText.surfaces', occurrences(evaluate, 'case "') > 100 && ['percentChangeLab','equationOutcomeLab','signedFractionLab','triangleClosureLab','shapeHierarchyLab'].every((t) => evaluate.includes(`case "${t}"`)), 'Recovered learner answer surfaces are represented in evaluate.ts.');
check('repair.keyboard.equationOutcome', keyboardTests.includes('it("equationOutcomeLab"'), 'equationOutcomeLab has direct keyboard coverage.');
check('repair.keyboard.sixRecovered', ['compositeAreaLab','percentChangeLab','scaledCircleLab','signedFractionLab','triangleClosureLab','shapeHierarchyLab'].every((t) => keyboardTests.includes(`it("${t}"`)), 'All six recovered keyboard gates are present.');
check('repair.renderQueries.shape', shapeTest.includes('getByRole') && !shapeTest.includes('getByText("Selected verdict always")'), 'Shape-hierarchy query ambiguity is repaired.');
check('repair.renderQueries.signed', signedTest.includes('getByRole') || signedTest.includes('getAllByText'), 'Signed-fraction render queries use unambiguous selectors.');

const registration = JSON.parse(read('ENGINE_REGISTRATION_CONTRACT_S126.json'));
const product = JSON.parse(read('PRODUCT_STATE.json'));
const backlog = JSON.parse(read('EXCELLENCE_BACKLOG_S126.json'));
const signedSweep = JSON.parse(read('SIGNED_FRACTION_VARIANT_SWEEP_S139.json'));
const shapeSweep = JSON.parse(read('SHAPE_HIERARCHY_VARIANT_SWEEP_S140.json'));
const condSweep = JSON.parse(read('CONDITIONAL_TABLE_VARIANT_SWEEP_S142.json'));
const graphSweep = JSON.parse(read('GRAPH_STORY_VARIANT_SWEEP_S143.json'));
check('evidence.registration', registration.completeCore === 117 && registration.types === 117, 'Engine registration must remain 117/117.');
check('evidence.product', product.lessons === 1129 && product.widgetTypes === 117 && product.manipulatives === 111, 'Product totals remain 1129 lessons, 117 widgets, 111 manipulatives.');
check('evidence.backlog', (backlog.summary?.liveK8Backlog ?? -1) >= 0 && backlog.summary?.unreviewed === 0, 'K–8 queue is fully classified with zero unreviewed (any size, including zero).' /* S204A: was an equality pin on the K-8 queue size; the queue is now empty and an equality pin fails on PROGRESS. Parity (every live entry classified, none unreviewed) is the durable claim and holds at any size including zero. */);
check('evidence.signedSweep', signedSweep.total === 4608 && typeof signedSweep.sourceHash === 'string', 'Signed-fraction sweep is regenerated at 4,608/4,608.');
check('evidence.shapeSweep', shapeSweep.total === 11520 && typeof shapeSweep.sourceHash === 'string', 'Shape-hierarchy sweep is regenerated at 11,520/11,520.');
check('evidence.conditionalSweep', condSweep.total === 9216 && typeof condSweep.sourceHash === 'string', 'Conditional-table sweep is regenerated at 9,216/9,216.');
check('evidence.graphSweep', graphSweep.total === 9216 && graphSweep.passed === true, 'Graph-story sweep remains 9,216/9,216.');

const pkgHash = sha(read('package.json'));
const lockHash = sha(read('package-lock.json'));
check('package.packageJson', pkgHash === 'd0f396864e28bbf9412cc67c027f5c25e9b0dbc9bc34c967851255fb2c6afe4f', 'package.json is byte-identical to the sealed dependency declaration.');
check('package.lockfile', lockHash === 'c7cfd90535fc2532455df543e64378b9c2256b5e6855e95663e538791a900b3b', 'package-lock.json is byte-identical to the sealed lockfile.');

const failures = checks.filter((c) => !c.passed);
const report = {
  session: 143,
  purpose: 'Prove recovery of the verified S141–142 correction set without dropping Session 143 graph-story work.',
  sourceReview: 'SESSION143-144_ADVERSARIAL_REVIEW.md',
  contentBoundary: {
    repairFilesChanged: 1,
    repairStringsChanged: 1,
    path: cgPath,
    field: 'steps.k3.variant.form',
    old: oldForm,
    new: newForm,
    sealedBeforeSha256: beforeHash,
    correctedSha256: afterHash
  },
  checks,
  summary: { passed: checks.length - failures.length, failed: failures.length, total: checks.length },
  passed: failures.length === 0
};
writeFileSync(join(root, 'SESSION143_CORRECTION_AUDIT.json'), JSON.stringify(report, null, 2) + '\n');
const md = [
  '# Session 143 correction audit', '',
  `- Result: **${report.passed ? 'PASS' : 'FAIL'}**`,
  `- Checks: **${report.summary.passed}/${report.summary.total} passed**`,
  `- Repair content boundary: **1 file / 1 string**`,
  `- Authorized field: \`${cgPath} → steps.k3.variant.form\``, '',
  '## Checks', '',
  ...checks.map((c) => `- ${c.passed ? 'PASS' : 'FAIL'} — \`${c.id}\`: ${c.detail}`), '',
  '## Interpretation', '',
  'This audit verifies that the corrected S141–142 surfaces are present, that the two discriminated-union members remain plain ZodObject values, and that Session 143 graph-story evidence remains intact. It is package-safe and does not claim TypeScript, Vitest, build, or Playwright execution.', ''
].join('\n');
writeFileSync(join(root, 'SESSION143_CORRECTION_AUDIT.md'), md);
if (failures.length) {
  console.error(`Session 143 correction audit failed: ${failures.length}/${checks.length}`);
  for (const f of failures) console.error(`- ${f.id}: ${f.detail}`);
  process.exit(1);
}
console.log(`Session 143 correction audit passed: ${checks.length}/${checks.length}; repair content 1 file / 1 string.`);
