#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const caps = read('scripts/engine-capabilities.json').types;
const direct = (type) => Boolean(type && (caps[type]?.manip ?? 0) >= 2);
const objectives = read('content/standards/objectives.json').objectives;
const metrics = read('content/mastery/infrastructure-metrics.json');
const contracts = read('content/mastery/mastery-arc-contracts.json');
const practice = read('content/mastery/practice-depth.json').objectives;
const frameworks = read('content/standards/frameworks.json').frameworks;
const crosswalk = read('content/standards/course-crosswalk.json').courses;
const wiring = read('reports/session98-direct-manipulative-wiring.json');

let lessons = 0;
let directSteps = 0;
let taggedDirect = 0;
let cmlDirect = 0;
let lessonJson = 0;
const usedWidgetTypes = new Set();
for (const courseDir of fs.readdirSync('content/courses')) {
  const lessonDir = path.join('content/courses', courseDir, 'lessons');
  if (!fs.existsSync(lessonDir)) continue;
  for (const file of fs.readdirSync(lessonDir).filter((name) => name.endsWith('.json'))) {
    const lesson = read(path.join(lessonDir, file));
    lessonJson++;
    lessons++;
    assert(Array.isArray(lesson.steps) && lesson.steps.length >= 1, `${lesson.id} has no steps`);
    for (const step of lesson.steps) {
      const type = step.widget?.type;
      if (type) usedWidgetTypes.add(type);
      if (!direct(type)) continue;
      directSteps++;
      if (step.conceptTag) taggedDirect++;
      if (step.cml) cmlDirect++;
      assert(step.conceptTag, `${lesson.id}#${step.id} direct step lacks conceptTag`);
      assert(step.cml, `${lesson.id}#${step.id} direct step lacks CML contract`);
      assert(step.cml.invariants?.length, `${lesson.id}#${step.id} CML lacks invariant`);
      assert(step.cml.misconceptions?.length, `${lesson.id}#${step.id} CML lacks misconception signature`);
      assert(step.cml.representations?.length >= 2, `${lesson.id}#${step.id} CML lacks representation link`);
    }
  }
}
for (const type of usedWidgetTypes) assert(caps[type], `used widget ${type} has no capability profile`);
assert.strictEqual(lessonJson, 1129, 'lesson count drift');
assert.strictEqual(objectives.length, 1165, 'objective count drift');
assert.strictEqual(directSteps, wiring.directSteps, 'wiring count drift');
assert.strictEqual(taggedDirect, directSteps, 'not every direct step is concept tagged');
assert.strictEqual(cmlDirect, directSteps, 'not every direct step is CML wired');
assert(metrics.exactDirectManipulationPct >= 25, 'exact direct manipulation below 25% target');
assert.strictEqual(metrics.familyLabCoveragePct, 100, 'family lab coverage is not complete');
assert(metrics.exactPracticeDepthPct >= 90, 'exact 20-state practice depth below 90%');
assert.strictEqual(metrics.familyPracticeDepthPct, 100, 'mixed family practice depth is not complete');
assert.strictEqual(metrics.objectivesWithRuntimeMasteryArc, objectives.length, 'not every objective has a runtime mastery arc');
assert.strictEqual(contracts.objectives.length, objectives.length, 'mastery arc contract count mismatch');
assert.strictEqual(contracts.arcElements.length, 10, 'mastery arc must have ten elements');
for (const contract of contracts.objectives) {
  assert.strictEqual(contract.elements.length, 10, `${contract.objectiveId} incomplete mastery arc`);
  assert(contract.directManipulation?.coverage !== 'none', `${contract.objectiveId} no manipulation source`);
  assert(contract.familyPracticeStates >= 20, `${contract.objectiveId} fewer than 20 mixed states`);
  assert(contract.route === `/mastery/${encodeURIComponent(contract.objectiveId)}`, `${contract.objectiveId} bad route`);
}
assert.strictEqual(practice.length, objectives.length, 'practice-depth count mismatch');
assert.strictEqual(frameworks.length, 8, 'framework count drift');
const courseEdges = crosswalk.reduce((n, course) => n + course.frameworkRefs.length, 0);
const objectiveEdges = objectives.reduce((n, objective) => n + objective.frameworkRefs.length, 0);
assert.strictEqual(objectiveEdges, metrics.crosswalkEdges, 'objective crosswalk edge count drift');
assert(courseEdges > 400, 'course crosswalk unexpectedly sparse');
assert.strictEqual(metrics.verifiedFullIntentEdges, 0, 'generated edges must not self-certify');
for (const course of crosswalk) for (const ref of course.frameworkRefs) assert.strictEqual(ref.status, 'provisional-crosswalk', `${course.courseId} contains an unreviewed certified edge`);

// Execute the diagnostic module after syntax-only TypeScript transpilation. Its only import is
// type-only, so the runtime is fully self-contained and testable without package installation.
const placementSource = fs.readFileSync('src/lib/placement.ts', 'utf8');
const transpiled = ts.transpileModule(placementSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  reportDiagnostics: true
});
assert(!(transpiled.diagnostics ?? []).some((d) => d.category === ts.DiagnosticCategory.Error), 'placement transpilation failed');
const placementModule = { exports: {} };
vm.runInNewContext(transpiled.outputText, {
  module: placementModule,
  exports: placementModule.exports,
  require,
  console,
  Math,
  Set,
  Map,
  Object,
  Array,
  Number,
  String,
  Date
}, { filename: 'placement.js' });
const placement = placementModule.exports;
assert.strictEqual(placement.PLACEMENT_BANK.length, 28, 'diagnostic bank must have 28 probes');
for (let grade = 0; grade <= 13; grade++) assert.strictEqual(placement.PLACEMENT_BANK.filter((item) => item.grade === grade).length, 2, `grade ${grade} does not have two probes`);
for (const start of [1, 4, 8, 11, 12]) {
  const history = [];
  for (let i = 0; i < 12; i++) {
    const item = placement.nextItem(placement.PLACEMENT_BANK, history, 12, start);
    assert(item, `diagnostic stopped early at start grade ${start}`);
    history.push({ itemId:item.id, tag:item.tag, grade:item.grade, domain:item.domain, representation:item.representation, correct:i % 3 !== 0, confidence:0.5 });
  }
  assert.strictEqual(new Set(history.map((row) => row.itemId)).size, 12, 'diagnostic repeated an item');
  const requiredDomains = start >= 11 ? 5 : start <= 2 ? 2 : 4;
  assert(new Set(history.map((row) => row.domain)).size >= requiredDomains, `diagnostic at grade ${start} skipped required domains`);
  const report = placement.buildDiagnosticReport(history, placement.PLACEMENT_BANK, start);
  assert(report.overall.scaledScore >= 200 && report.overall.scaledScore <= 800, 'scaled score out of range');
  assert(report.overall.scaledLower95 <= report.overall.scaledScore && report.overall.scaledScore <= report.overall.scaledUpper95, 'confidence interval does not contain score');
  assert.strictEqual(report.domainScores.length, 5, 'domain score count mismatch');
}
const reviewRoute = fs.readFileSync('src/app/api/review-steps/route.ts', 'utf8');
assert(reviewRoute.includes('buildMasteryMission'), 'virtual mastery mission review reconstruction missing');
assert(reviewRoute.includes('mastery-(.+)'), 'mastery mission id parser missing');

console.log(JSON.stringify({
  status:'PASS',
  lessons,
  objectives:objectives.length,
  directSteps,
  exactDirectManipulationPct:metrics.exactDirectManipulationPct,
  familyLabCoveragePct:metrics.familyLabCoveragePct,
  runtimeMasteryArcs:metrics.objectivesWithRuntimeMasteryArc,
  exactPractice20Plus:metrics.objectivesWithTwentyPlusPracticeStates,
  familyPractice20Plus:metrics.objectivesWithTwentyPlusFamilyStates,
  frameworks:frameworks.length,
  crosswalkEdges:objectiveEdges,
  courseCrosswalkEdges:courseEdges,
  diagnosticItems:placement.PLACEMENT_BANK.length
}, null, 2));
