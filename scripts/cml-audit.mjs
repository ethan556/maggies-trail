#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const contentRoot = path.join(root, 'content', 'courses');
const outputPath = path.resolve(process.argv[3] ?? path.join(root, 'CML_AUDIT.json'));

const ASSESSMENT = new Set(['numeric', 'mcq', 'fractionEntry', 'pointEntry', 'subitizeFlash', 'radicalCheck']);
const SUPPORTING = new Set([
  'buildExpression', 'dragBucket', 'matchPairs', 'dragOrder', 'steppedReveal', 'tapDiagram',
  'placeCompare', 'slider', 'rationalCompare', 'fractionCompare', 'absValueLine',
]);
const DIRECT = new Set([
  'conditionalTableLab', 'ciCapture', 'triangleConstraintLab', 'coordinateProofLab', 'solidSliceLab', 'lineRelationLab', 'triangleAngleLab', 'verticalLineScanner', 'covariationScrubber', 'samplingBiasLab', 'shapeFamilyBuilder', 'unitRuler', 'tenFrame', 'numberLineHop', 'numberLinePlace', 'baseTenCompose', 'moneyBoard', 'inversePipeline',
  'mixedRegroup', 'columnCalc', 'evalOrder', 'oddEvenPairs', 'placeValue', 'fractionBar',
  'doubleNumberLine', 'fractionGrid', 'percentBar', 'barBuilder', 'ratioTable', 'fractionOfSet',
  'integerChips', 'algebraTiles', 'balanceScale', 'solveBalance', 'functionMachine', 'lineExplore',
  'systemsExplore', 'plotPoint', 'clockSet', 'angleMeasure', 'areaModel', 'volumeBuilder', 'netFold',
  'transformExplore', 'dilationExplore', 'triangleSolve', 'circleMeasureExplore', 'circleAngleExplore', 'compassConstruct', 'distanceGrid', 'spinnerSim', 'treeDiagram', 'dotPlot',
  'boxPlot', 'scatterFit', 'probabilityArea', 'sampleSim', 'shuffleTest', 'quadDrag',
  'conicLocusLab', 'derivativeRuleLab', 'relatedRatesLab', 'secantSlope', 'vectorExplore', 'matrixTransform', 'polarTrace', 'derivativeTrace', 'riemannSum', 'accumulateArea', 'sliceSum', 'slopeField', 'taylorApprox', 'argandExplore', 'signChart', 'graphZoom', 'sequenceBuild', 'unitCircleExplore', 'expLogExplore'
]);
const STRONGLY_CAUSAL = new Set([
  'conditionalTableLab', 'ciCapture', 'triangleConstraintLab', 'coordinateProofLab', 'solidSliceLab', 'lineRelationLab', 'triangleAngleLab', 'verticalLineScanner', 'covariationScrubber', 'samplingBiasLab', 'shapeFamilyBuilder', 'unitRuler', 'tenFrame', 'numberLineHop', 'numberLinePlace', 'baseTenCompose', 'mixedRegroup', 'columnCalc',
  'evalOrder', 'fractionBar', 'fractionGrid', 'doubleNumberLine', 'areaModel', 'volumeBuilder',
  'integerChips', 'balanceScale', 'solveBalance', 'algebraTiles', 'functionMachine', 'lineExplore',
  'systemsExplore', 'transformExplore', 'dilationExplore', 'triangleSolve', 'circleMeasureExplore', 'circleAngleExplore', 'compassConstruct', 'scatterFit', 'angleMeasure', 'lengthCompare', 'quadDrag',
  'conicLocusLab', 'derivativeRuleLab', 'relatedRatesLab', 'secantSlope', 'vectorExplore', 'matrixTransform', 'polarTrace', 'derivativeTrace', 'riemannSum', 'accumulateArea', 'sliceSum', 'slopeField', 'taylorApprox', 'argandExplore', 'signChart', 'graphZoom', 'sequenceBuild', 'unitCircleExplore', 'expLogExplore'
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

function getWidgetKind(step) {
  const widget = step?.widget ?? step?.interaction ?? step?.assessment;
  if (typeof widget === 'string') return widget;
  return widget?.kind ?? widget?.type ?? step?.widgetKind ?? step?.responseType;
}

function getSteps(json) {
  if (Array.isArray(json?.steps)) return json.steps;
  if (Array.isArray(json?.lesson?.steps)) return json.lesson.steps;
  return [];
}

const gradeByCourse = new Map();
if (fs.existsSync(contentRoot)) {
  for (const entry of fs.readdirSync(contentRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const courseFile = path.join(contentRoot, entry.name, 'course.json');
    if (!fs.existsSync(courseFile)) continue;
    try {
      const course = JSON.parse(fs.readFileSync(courseFile, 'utf8'));
      if (Number.isInteger(course.gradeLevel)) gradeByCourse.set(course.id ?? entry.name, course.gradeLevel);
    } catch { /* reported by normal JSON gates */ }
  }
}

function getGrade(json, file) {
  const mapped = gradeByCourse.get(json?.courseId) ?? gradeByCourse.get(path.basename(path.dirname(path.dirname(file))));
  if (Number.isInteger(mapped)) return mapped;
  const values = [json?.grade, json?.gradeLevel, json?.metadata?.grade, json?.lesson?.grade];
  for (const value of values) {
    if (Number.isInteger(value)) return value;
    if (typeof value === 'string' && /^K$/i.test(value)) return 0;
    if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  }
  const match = file.match(/(?:grade|g)(\d{1,2})(?:\D|$)/i);
  return match ? Number(match[1]) : undefined;
}

function isPrediction(step) {
  return step?.kind === 'prediction' || Boolean(step?.predict) || step?.prediction === true || Boolean(step?.predictionPrompt);
}

function hasCmlMetadata(step) {
  return Boolean(step?.cml || step?.masteryCycle || step?.invariants || step?.transferFamily);
}

const files = walk(contentRoot);
const lessons = [];
const byGrade = new Map();
let parseErrors = 0;

for (const file of files) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    parseErrors += 1;
    continue;
  }
  const steps = getSteps(json);
  if (steps.length === 0) continue;
  const grade = getGrade(json, file);
  if (grade === undefined || grade < 0 || grade > 13) continue;

  const kinds = steps.map(getWidgetKind).filter(Boolean);
  const widgetSteps = kinds.length;
  const assessment = kinds.filter((kind) => ASSESSMENT.has(kind)).length;
  const supporting = kinds.filter((kind) => SUPPORTING.has(kind)).length;
  const direct = kinds.filter((kind) => DIRECT.has(kind)).length;
  const stronglyCausal = kinds.filter((kind) => STRONGLY_CAUSAL.has(kind)).length;
  const predictions = steps.filter(isPrediction).length;
  const cmlDeclared = steps.filter(hasCmlMetadata).length;
  const flagshipSteps = steps.filter((step) => step?.cml?.flagship === true).length;

  const record = {
    file: path.relative(root, file),
    lessonId: json?.id ?? json?.lessonId ?? path.basename(file, '.json'),
    title: json?.title ?? json?.lesson?.title ?? '',
    grade,
    steps: steps.length,
    widgetSteps,
    assessment,
    supporting,
    direct,
    stronglyCausal,
    predictions,
    cmlDeclared,
    flagshipSteps,
    responseOnlyShare: widgetSteps ? assessment / widgetSteps : 0,
  };
  lessons.push(record);

  const aggregate = byGrade.get(grade) ?? {
    grade, lessons: 0, steps: 0, widgetSteps: 0, assessment: 0, supporting: 0,
    direct: 0, stronglyCausal: 0, predictions: 0, cmlDeclared: 0, flagshipSteps: 0,
  };
  aggregate.lessons += 1;
  for (const key of ['steps', 'widgetSteps', 'assessment', 'supporting', 'direct', 'stronglyCausal', 'predictions', 'cmlDeclared', 'flagshipSteps']) {
    aggregate[key] += record[key];
  }
  byGrade.set(grade, aggregate);
}

const totals = [...byGrade.values()].reduce((sum, row) => {
  for (const key of Object.keys(sum)) {
    if (key !== 'grade') sum[key] += row[key] ?? 0;
  }
  return sum;
}, {
  lessons: 0, steps: 0, widgetSteps: 0, assessment: 0, supporting: 0,
  direct: 0, stronglyCausal: 0, predictions: 0, cmlDeclared: 0, flagshipSteps: 0,
});

const highRisk = lessons
  .filter((lesson) => lesson.widgetSteps > 0 && lesson.responseOnlyShare >= 0.6)
  .sort((a, b) => b.responseOnlyShare - a.responseOnlyShare || b.widgetSteps - a.widgetSteps)
  .slice(0, 100);

const report = {
  generatedAt: new Date().toISOString(),
  root: path.relative(process.cwd(), root) || '.',
  parseErrors,
  definitions: {
    assessment: [...ASSESSMENT],
    supporting: [...SUPPORTING],
    direct: [...DIRECT],
    stronglyCausal: [...STRONGLY_CAUSAL],
  },
  totals: {
    ...totals,
    responseOnlyShare: totals.widgetSteps ? totals.assessment / totals.widgetSteps : 0,
    directShare: totals.widgetSteps ? totals.direct / totals.widgetSteps : 0,
    stronglyCausalShare: totals.widgetSteps ? totals.stronglyCausal / totals.widgetSteps : 0,
  },
  byGrade: [...byGrade.values()]
    .sort((a, b) => a.grade - b.grade)
    .map((row) => ({
      ...row,
      responseOnlyShare: row.widgetSteps ? row.assessment / row.widgetSteps : 0,
      directShare: row.widgetSteps ? row.direct / row.widgetSteps : 0,
      stronglyCausalShare: row.widgetSteps ? row.stronglyCausal / row.widgetSteps : 0,
    })),
  highRiskLessons: highRisk,
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`CML audit: ${lessons.length} K–13 lessons; report written to ${outputPath}`);
console.log(`Response-only: ${(report.totals.responseOnlyShare * 100).toFixed(1)}%`);
console.log(`Direct manipulation: ${(report.totals.directShare * 100).toFixed(1)}%`);
console.log(`Strongly causal: ${(report.totals.stronglyCausalShare * 100).toFixed(1)}%`);
