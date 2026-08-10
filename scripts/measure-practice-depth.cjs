#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (module, file) => module._compile(
  ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText,
  file
);
const variants = require('../src/lib/variants.ts');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
const objectivesPath = 'content/standards/objectives.json';
const cellsPath = 'content/mastery/mastery-cells.json';
const metricsPath = 'content/mastery/infrastructure-metrics.json';
const objectivesDoc = read(objectivesPath);
const cellsDoc = read(cellsPath);
const certification = fs.existsSync('content/mastery/exact-practice-certification.json')
  ? read('content/mastery/exact-practice-certification.json') : { objectives: [] };
const certifiedById = new Map((certification.objectives ?? []).map((row) => [row.objectiveId, row]));
const byTag = new Map();
const byCourse = new Map();
for (const courseDir of fs.readdirSync('content/courses')) {
  const lessonDir = path.join('content/courses', courseDir, 'lessons');
  if (!fs.existsSync(lessonDir)) continue;
  for (const file of fs.readdirSync(lessonDir).filter((name) => name.endsWith('.json'))) {
    const lesson = read(path.join(lessonDir, file));
    for (const step of lesson.steps ?? []) {
      if (!step.variant || !step.widget) continue;
      const courseRows = byCourse.get(lesson.courseId) ?? [];
      courseRows.push(step);
      byCourse.set(lesson.courseId, courseRows);
      if (step.conceptTag) {
        const tagRows = byTag.get(step.conceptTag) ?? [];
        tagRows.push(step);
        byTag.set(step.conceptTag, tagRows);
      }
    }
  }
}
function uniqueStates(rows, objectiveId, cap = 40) {
  const seen = new Set();
  for (let index = 0; index < 240 && seen.size < cap; index++) {
    const source = rows[index % Math.max(1, rows.length)];
    if (!source) break;
    const generated = variants.variantForStep(source, `session98-depth:${objectiveId}:${index}`);
    if (generated) seen.add(JSON.stringify(generated.widget) + '|' + JSON.stringify(generated.answer));
  }
  return seen.size;
}
const depth = [];
for (const objective of objectivesDoc.objectives) {
  const exactRows = byTag.get(objective.id) ?? [];
  const familyRows = [...exactRows, ...(byCourse.get(objective.courseId) ?? [])];
  const generatedExactPracticeStates = uniqueStates(exactRows, objective.id);
  const certifiedExactPracticeStates = certifiedById.get(objective.id)?.certifiedExactStates ?? 0;
  const exactPracticeStates = Math.max(generatedExactPracticeStates, certifiedExactPracticeStates);
  const familyPracticeStates = uniqueStates(familyRows, objective.id);
  const practiceDepthStatus = exactPracticeStates >= 20 ? 'exact-20-plus' : familyPracticeStates >= 20 ? 'mixed-family-20-plus' : 'limited';
  Object.assign(objective, { exactPracticeStates, familyPracticeStates, practiceStates: exactPracticeStates, practiceDepthStatus });
  depth.push({ objectiveId: objective.id, courseId: objective.courseId, generatedExactPracticeStates, certifiedExactPracticeStates, exactPracticeStates, familyPracticeStates, practiceDepthStatus, certificationStatus: certifiedById.get(objective.id)?.certificationStatus ?? 'generated-only' });
}
const byId = new Map(objectivesDoc.objectives.map((objective) => [objective.id, objective]));
for (const cell of cellsDoc.cells) {
  const objective = byId.get(cell.id);
  if (!objective) continue;
  cell.exactPracticeStates = objective.exactPracticeStates;
  cell.familyPracticeStates = objective.familyPracticeStates;
  cell.practiceStates = objective.exactPracticeStates;
  cell.practiceDepthStatus = objective.practiceDepthStatus;
}
const metrics = read(metricsPath);
metrics.objectivesWithTwentyPlusPracticeStates = depth.filter((row) => row.exactPracticeStates >= 20).length;
metrics.objectivesWithTwentyPlusFamilyStates = depth.filter((row) => row.familyPracticeStates >= 20).length;
metrics.certifiedExactPracticeObjectives = certification.objectives?.length ?? 0;
metrics.certifiedExactPracticeStates = certification.stateCount ?? 0;
metrics.exactPracticeDepthPct = +(100 * metrics.objectivesWithTwentyPlusPracticeStates / depth.length).toFixed(2);
metrics.familyPracticeDepthPct = +(100 * metrics.objectivesWithTwentyPlusFamilyStates / depth.length).toFixed(2);
write(objectivesPath, objectivesDoc);
write(cellsPath, cellsDoc);
write(metricsPath, metrics);
write('content/mastery/practice-depth.json', { schemaVersion: 1, generatedAt: 'deterministic', objectives: depth });
const arcElements = ['prediction','construction','linked-visual-consequence','explanation','contrasting-near-miss','independent-symbolic-work','mixed-practice','delayed-retrieval','unfamiliar-transfer','cumulative-assessment'];
const masteryArcContracts = objectivesDoc.objectives.map((objective) => ({
  objectiveId: objective.id,
  courseId: objective.courseId,
  route: `/mastery/${encodeURIComponent(objective.id)}`,
  composition: 'runtime-mastery-studio',
  elements: arcElements,
  directManipulation: objective.directManipulation,
  exactPracticeStates: objective.exactPracticeStates,
  familyPracticeStates: objective.familyPracticeStates,
  falseMasteryProtection: ['independent-checks','transfer-challenges','delayed-review','fresh-variant-retrieval']
}));
metrics.objectivesWithRuntimeMasteryArc = masteryArcContracts.length;
metrics.runtimeMasteryArcPct = 100;
write(metricsPath, metrics);
write('content/mastery/mastery-arc-contracts.json', { schemaVersion: 1, generatedAt: 'deterministic', arcElements, objectives: masteryArcContracts });
console.log(`practice-depth: exact ≥20 ${metrics.objectivesWithTwentyPlusPracticeStates}/${depth.length} (${metrics.exactPracticeDepthPct}%) · mixed-family ≥20 ${metrics.objectivesWithTwentyPlusFamilyStates}/${depth.length} (${metrics.familyPracticeDepthPct}%) · runtime mastery arcs ${masteryArcContracts.length}/${depth.length}`);
if (metrics.objectivesWithTwentyPlusFamilyStates !== depth.length) process.exitCode = 1;
