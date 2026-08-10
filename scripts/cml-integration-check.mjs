#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const manifestPath = path.join(root, 'content', 'cml', 'integrated-pilots.json');
const fail = (message) => { throw new Error(message); };
if (!fs.existsSync(manifestPath)) fail('Missing integrated CML pilot manifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.count !== 18 || manifest.pilots?.length !== 18) fail(`Expected 18 integrated pilots, found ${manifest.pilots?.length ?? 0}`);
if (new Set(manifest.pilots.map((p) => p.id)).size !== 18) fail('Pilot ids must be unique');

let flagship = 0;
for (const pilot of manifest.pilots) {
  const file = path.join(root, pilot.file);
  if (!fs.existsSync(file)) fail(`Missing pilot file ${pilot.file}`);
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const step = lesson.steps?.find((candidate) => candidate.id === pilot.stepId);
  if (!step) fail(`Missing pilot step ${pilot.lessonId}#${pilot.stepId}`);
  if (step.widget?.type !== pilot.widget) fail(`Surface mismatch for ${pilot.id}`);
  const meta = step.cml;
  if (!meta?.flagship) fail(`Pilot ${pilot.id} is not flagship`);
  flagship += 1;
  const checks = {
    prediction: Boolean(step.predict), kernel: Boolean(meta.kernel), actionGoal: Boolean(meta.actionGoal),
    invariants: meta.invariants?.length > 0, misconceptions: meta.misconceptions?.length > 0,
    representationMesh: meta.representations?.length >= 3,
    translation: Boolean(meta.translationFrom && meta.translationTo), counterfactual: Boolean(meta.counterfactualPrompt),
    explanation: meta.explanation?.options?.length >= 2, fade: Number.isInteger(meta.fadeLevel),
    transfer: Boolean(meta.transferFamily), delayed: meta.delayed === true
  };
  for (const [name, ok] of Object.entries(checks)) if (!ok) fail(`${pilot.id} missing ${name}`);
  if (meta.explanation.options.filter((o) => o.correct).length !== 1) fail(`${pilot.id} explanation must have one causal answer`);
}

const catalog = fs.readFileSync(path.join(root, 'src', 'lib', 'cml', 'catalog.ts'), 'utf8');
const profiles = new Set([...catalog.matchAll(/^\s{2}([A-Za-z0-9_]+): \{/gm)].map((m) => m[1]));
const direct = [
  'exactNumberLab', 'affineRelationshipLab', 'quotientReasoningLab', 'proportionalReasoningLab', 'placeValueTransformLab', 'graphStoryLab', 'conditionalTableLab','ciCapture','triangleConstraintLab', 'coordinateProofLab', 'solidSliceLab', 'lineRelationLab','triangleAngleLab','verticalLineScanner','covariationScrubber','samplingBiasLab','shapeFamilyBuilder','unitRuler','tenFrame','numberLineHop','numberLinePlace','baseTenCompose','moneyBoard','inversePipeline','mixedRegroup','columnCalc','evalOrder',
  'oddEvenPairs','placeValue','fractionBar','doubleNumberLine','fractionGrid','percentBar','barBuilder','ratioTable','fractionOfSet',
  'integerChips','algebraTiles','balanceScale','solveBalance','functionMachine','lineExplore','systemsExplore','plotPoint','clockSet',
  'angleMeasure','areaModel','volumeBuilder','netFold','transformExplore','dilationExplore','triangleSolve','circleMeasureExplore','circleAngleExplore','compassConstruct','distanceGrid','spinnerSim','treeDiagram',
  'dotPlot','boxPlot','scatterFit','probabilityArea','sampleSim','shuffleTest','lengthCompare','tapDiagram','estimateSlider','quadDrag',
  'conicLocusLab','derivativeRuleLab','relatedRatesLab','secantSlope','vectorExplore','matrixTransform','polarTrace','derivativeTrace','riemannSum','accumulateArea','sliceSum','slopeField','taylorApprox','argandExplore','signChart','graphZoom','sequenceBuild','unitCircleExplore','expLogExplore'
];
const missingProfiles = direct.filter((type) => !profiles.has(type));
if (missingProfiles.length) fail(`Direct manipulative profiles missing: ${missingProfiles.join(', ')}`);

const player = fs.readFileSync(path.join(root, 'src', 'components', 'LessonPlayer.tsx'), 'utf8');
for (const token of ['CausalMasteryPanel', 'setCMLValue', 'cmlHistory', 'onRestoreFirst', 'resolveCMLMeta'])
  if (!player.includes(token)) fail(`Lesson player is missing ${token}`);
const panel = fs.readFileSync(path.join(root, 'src', 'components', 'CausalMasteryPanel.tsx'), 'utf8');
for (const token of ['activeStage', 'Mastery lens', 'Compare first build', 'Undo last move', 'Try a what-if', 'Explain why', 'after a delay'])
  if (!panel.includes(token)) fail(`Causal mastery panel is missing ${token}`);
const widgets = fs.readFileSync(path.join(root, 'src', 'components', 'widgets.tsx'), 'utf8');
for (const token of ['Add a zero pair', 'Repartition ×2', 'Rotate rectangle — preserve area', 'Rotate the base — preserve volume', 'Nearby input output table'])
  if (!widgets.includes(token)) fail(`Causal engine upgrade missing: ${token}`);

let parsed = 0;
for (const course of fs.readdirSync(path.join(root, 'content', 'courses'), { withFileTypes: true })) {
  if (!course.isDirectory()) continue;
  const lessons = path.join(root, 'content', 'courses', course.name, 'lessons');
  if (!fs.existsSync(lessons)) continue;
  for (const name of fs.readdirSync(lessons)) if (name.endsWith('.json')) {
    JSON.parse(fs.readFileSync(path.join(lessons, name), 'utf8')); parsed += 1;
  }
}
console.log(`CML integration: ${flagship} flagship pilots, ${profiles.size} direct-engine profiles, ${parsed} lesson JSON files parsed.`);
