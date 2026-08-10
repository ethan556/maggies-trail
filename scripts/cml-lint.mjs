#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const contentRoot = path.join(root, 'content', 'courses');
const mode = process.argv.includes('--strict') ? 'strict' : 'advisory';

const RESPONSE_ONLY = new Set(['numeric', 'mcq', 'fractionEntry', 'pointEntry', 'subitizeFlash']);
const DIRECT = new Set([
  'affineRelationshipLab', 'quotientReasoningLab', 'proportionalReasoningLab', 'placeValueTransformLab', 'graphStoryLab', 'conditionalTableLab', 'ciCapture', 'triangleConstraintLab', 'coordinateProofLab', 'solidSliceLab', 'lineRelationLab', 'triangleAngleLab', 'verticalLineScanner', 'covariationScrubber', 'samplingBiasLab', 'shapeFamilyBuilder', 'unitRuler', 'tenFrame', 'numberLineHop', 'numberLinePlace', 'baseTenCompose', 'moneyBoard', 'inversePipeline',
  'mixedRegroup', 'columnCalc', 'evalOrder', 'oddEvenPairs', 'placeValue', 'fractionBar',
  'doubleNumberLine', 'fractionGrid', 'percentBar', 'barBuilder', 'ratioTable', 'fractionOfSet',
  'integerChips', 'algebraTiles', 'balanceScale', 'solveBalance', 'functionMachine', 'lineExplore',
  'quadraticExplore', 'expLogExplore', 'systemsExplore', 'plotPoint', 'clockSet', 'angleMeasure', 'areaModel', 'volumeBuilder', 'netFold',
  'transformExplore', 'dilationExplore', 'triangleSolve', 'circleMeasureExplore', 'circleAngleExplore', 'compassConstruct', 'distanceGrid', 'spinnerSim', 'treeDiagram', 'dotPlot',
  'boxPlot', 'scatterFit', 'probabilityArea', 'sampleSim', 'shuffleTest', 'lengthCompare', 'tapDiagram', 'quadDrag',
  'argandExplore', 'signChart', 'radicalCheck', 'graphZoom', 'sequenceBuild', 'unitCircleExplore',
  'conicLocusLab', 'derivativeRuleLab', 'relatedRatesLab', 'secantSlope', 'vectorExplore', 'matrixTransform', 'polarTrace', 'derivativeTrace', 'riemannSum', 'accumulateArea', 'sliceSum', 'slopeField', 'taylorApprox'
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}
const getSteps = (json) => Array.isArray(json?.steps) ? json.steps : Array.isArray(json?.lesson?.steps) ? json.lesson.steps : [];
const widgetKind = (step) => {
  const widget = step?.widget ?? step?.interaction ?? step?.assessment;
  return typeof widget === 'string' ? widget : widget?.kind ?? widget?.type ?? step?.widgetKind ?? step?.responseType;
};
const cml = (step) => step?.cml ?? step?.masteryCycle ?? {};

const issues = [];
for (const file of walk(contentRoot)) {
  let json;
  try { json = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  const steps = getSteps(json);
  if (!steps.length) continue;
  const relative = path.relative(root, file);
  const kinds = steps.map(widgetKind).filter(Boolean);
  const responseOnly = kinds.filter((kind) => RESPONSE_ONLY.has(kind)).length;
  const direct = kinds.filter((kind) => DIRECT.has(kind)).length;
  const flagshipSteps = steps.filter((step) => cml(step)?.flagship === true);
  const flagship = Boolean(json?.cml?.flagship ?? json?.flagship) || flagshipSteps.length > 0;

  if (flagship && direct === 0) {
    issues.push({ severity: 'error', code: 'flagship-without-manipulation', file: relative,
      message: 'Flagship lesson has no direct mathematical manipulation.' });
  }
  if (flagship && responseOnly / Math.max(kinds.length, 1) > 0.75) {
    issues.push({ severity: 'warning', code: 'flagship-response-heavy', file: relative,
      message: 'Flagship lesson remains heavily answer-entry/recognition outside its causal pilot step.' });
  }

  steps.forEach((step, index) => {
    const kind = widgetKind(step);
    const meta = cml(step);
    const hasPrediction = Boolean(step?.predict || step?.prediction === true || step?.predictionPrompt);
    if (hasPrediction && !DIRECT.has(kind)) {
      const following = steps.slice(index + 1, index + 4).map(widgetKind);
      if (!following.some((candidate) => DIRECT.has(candidate))) {
        issues.push({ severity: 'warning', code: 'prediction-not-causal', file: relative, step: index,
          message: 'Prediction is not attached to or followed within three steps by direct mathematical manipulation.' });
      }
    }
    if (DIRECT.has(kind) && meta?.stage === 'construct') {
      if (!Array.isArray(meta?.invariants) || meta.invariants.length === 0)
        issues.push({ severity: 'warning', code: 'missing-invariant', file: relative, step: index, message: 'Construct step has no declared invariant.' });
      if (!Array.isArray(meta?.misconceptions) || meta.misconceptions.length === 0)
        issues.push({ severity: 'warning', code: 'missing-misconception-signatures', file: relative, step: index, message: 'Construct step has no misconception signatures.' });
    }
    if (meta?.stage === 'revise' && !meta?.revisionOf)
      issues.push({ severity: 'error', code: 'revision-without-prior-trace', file: relative, step: index, message: 'Revision must reference the prediction or construction being revised.' });
    if ((meta?.translationFrom === undefined) !== (meta?.translationTo === undefined))
      issues.push({ severity: 'error', code: 'incomplete-representation-translation', file: relative, step: index, message: 'Representation translation requires both source and destination.' });

    if (meta?.flagship) {
      const required = [
        ['prediction', hasPrediction], ['direct-surface', DIRECT.has(kind)], ['kernel', Boolean(meta.kernel)],
        ['action-goal', Boolean(meta.actionGoal)], ['invariant', Array.isArray(meta.invariants) && meta.invariants.length > 0],
        ['misconceptions', Array.isArray(meta.misconceptions) && meta.misconceptions.length > 0],
        ['representation-mesh', Array.isArray(meta.representations) && meta.representations.length >= 3],
        ['translation', Boolean(meta.translationFrom && meta.translationTo)], ['counterfactual', Boolean(meta.counterfactualPrompt)],
        ['explanation', Boolean(meta.explanation?.prompt && meta.explanation?.options?.length >= 2)],
        ['fading', Number.isInteger(meta.fadeLevel)], ['transfer', Boolean(meta.transferFamily)], ['delayed-retrieval', meta.delayed === true]
      ];
      for (const [name, ok] of required) if (!ok)
        issues.push({ severity: 'error', code: `flagship-missing-${name}`, file: relative, step: index,
          message: `Flagship CML step is missing its ${name} contract.` });
      const correct = meta.explanation?.options?.filter((option) => option.correct).length ?? 0;
      if (meta.explanation && correct !== 1)
        issues.push({ severity: 'error', code: 'flagship-explanation-answer-count', file: relative, step: index,
          message: 'Flagship explanation must have exactly one correct causal claim.' });
    }
  });
}

const errors = issues.filter((issue) => issue.severity === 'error');
const warnings = issues.filter((issue) => issue.severity === 'warning');
console.log(`CML lint (${mode}): ${errors.length} error(s), ${warnings.length} warning(s)`);
for (const issue of issues.slice(0, 250))
  console.log(`${issue.severity.toUpperCase()} ${issue.code} ${issue.file}${issue.step !== undefined ? `#${issue.step}` : ''}: ${issue.message}`);
if (issues.length > 250) console.log(`… ${issues.length - 250} additional issue(s) omitted.`);
if (mode === 'strict' && errors.length > 0) process.exitCode = 1;
