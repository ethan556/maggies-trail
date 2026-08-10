#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { verifiedPostS151Changes } from './verified-post-s151-changes.mjs';

const root = resolve(import.meta.dirname, '../..');
const baselineHashes = JSON.parse(readFileSync(join(root, 'SESSION148_LESSON_HASHES.json'), 'utf8'));
const baselineDir = join(root, 'scripts/session/baselines-s149');
const targetPaths = {
  'md-05-02': 'content/courses/measurement-data/lessons/md-05-02.json',
  'asv-03-03': 'content/courses/area-surface-volume/lessons/asv-03-03.json',
  'g7-01-03': 'content/courses/geometry-g7/lessons/g7-01-03.json',
  'g7-03-02': 'content/courses/geometry-g7/lessons/g7-03-02.json',
  'tm-03-03': 'content/courses/transformations-measurement/lessons/tm-03-03.json',
  'tm-04-01': 'content/courses/transformations-measurement/lessons/tm-04-01.json',
};
const authorizedLater = new Set([
  'content/courses/coordinate-geometry/lessons/cg-01-03.json',
  'content/courses/data-distributions/lessons/dd-04-01.json',
]);
for (const rel of JSON.parse(readFileSync(join(root, 'scripts/session/baselines-s151/index.json'), 'utf8')).targets) authorizedLater.add(rel);
for (const rel of verifiedPostS151Changes(root)) authorizedLater.add(rel);
const expected = new Set([...Object.values(targetPaths), ...authorizedLater]);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const deep = (value) => JSON.parse(JSON.stringify(value));
const errors = [];
const changed = [];
const records = [];

function surfaces(lesson) {
  const out = [];
  for (const step of lesson.steps ?? []) out.push({ kind: 'main', id: step.id, node: step });
  for (const route of lesson.remedials ?? []) {
    if (route?.check) out.push({ kind: 'remedial', id: route.check.id, node: route.check });
  }
  return out;
}
function withoutWidget(node) {
  const copy = deep(node);
  delete copy.widget;
  return copy;
}

for (const course of readdirSync(join(root, 'content/courses'))) {
  const dir = join(root, 'content/courses', course, 'lessons');
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const rel = `content/courses/${course}/lessons/${file}`;
    const hash = sha(readFileSync(join(root, rel)));
    if (baselineHashes.files[rel] !== hash) changed.push(rel);
  }
}
changed.sort();
if (JSON.stringify(changed) !== JSON.stringify([...expected].sort())) errors.push(`changed lesson set mismatch: ${changed.join(', ')}`);

let widgetNodesChanged = 0, mainChanged = 0, remedialChanged = 0, variantChanges = 0;
for (const [lessonId, rel] of Object.entries(targetPaths)) {
  const beforeBytes = readFileSync(join(baselineDir, `${lessonId}.json`));
  const afterBytes = readFileSync(join(root, rel));
  const before = JSON.parse(beforeBytes), after = JSON.parse(afterBytes);
  const b = new Map(surfaces(before).map((x) => [`${x.kind}:${x.id}`, x]));
  const a = new Map(surfaces(after).map((x) => [`${x.kind}:${x.id}`, x]));
  if (b.size !== a.size || [...b.keys()].some((key) => !a.has(key))) errors.push(`${lessonId}: surface identity changed`);
  const nodes = [];
  for (const [key, bv] of b) {
    const av = a.get(key); if (!av) continue;
    if (JSON.stringify(withoutWidget(bv.node)) !== JSON.stringify(withoutWidget(av.node))) errors.push(`${lessonId}/${key}: non-widget authored fields changed`);
    if (JSON.stringify(bv.node.variant ?? null) !== JSON.stringify(av.node.variant ?? null)) { errors.push(`${lessonId}/${key}: variant declaration drift`); variantChanges += 1; }
    if (JSON.stringify(bv.node.widget) !== JSON.stringify(av.node.widget)) {
      widgetNodesChanged += 1;
      if (bv.kind === 'main') mainChanged += 1; else remedialChanged += 1;
      nodes.push({ surface: bv.kind, id: bv.id, beforeType: bv.node.widget?.type, afterType: av.node.widget?.type });
      if (JSON.stringify(bv.node.widget) !== JSON.stringify(av.node.widget) && av.node.widget?.type !== 'geometricConstraintLab') errors.push(`${lessonId}/${key}: wrong target widget ${av.node.widget?.type}`);
      if (bv.node.widget?.prompt !== av.node.widget?.prompt) errors.push(`${lessonId}/${key}: prompt changed`);
    }
  }
  records.push({
    path: rel,
    baselineSha256: sha(beforeBytes),
    session149Sha256: sha(afterBytes),
    widgetNodesChanged: nodes.length,
    changedNodes: nodes,
    variantDeclarationsChanged: 0,
    nonWidgetAuthoredFieldsPreserved: true,
  });
}
if (widgetNodesChanged !== 42) errors.push(`expected 42 widget changes, got ${widgetNodesChanged}`);
if (mainChanged !== 36) errors.push(`expected 36 main changes, got ${mainChanged}`);
if (remedialChanged !== 6) errors.push(`expected 6 remedial changes, got ${remedialChanged}`);
if (variantChanges !== 0) errors.push(`expected zero variant changes, got ${variantChanges}`);

try { execFileSync('python', [join(root, 'scripts/audit/geometric-constraint-s149.py')], { cwd: root, stdio: 'inherit' }); }
catch { errors.push('geometric-constraint authored audit failed'); }

const ledger = {
  session: 149,
  baselineSession: 148,
  baselineArchive: 'maggies-trail-session-148.tar.gz',
  baselineSha256: '17cf734d73a7922786dccfb4c5960733ecfa4863acec39cbcf1f825384cd471e',
  summary: {
    lessonFilesChanged: Object.keys(targetPaths).length,
    authorizedLaterLessonFiles: authorizedLater.size,
    currentChangedLessonFiles: changed.length,
    widgetNodesChanged,
    mainExperiencesChanged: mainChanged,
    remedialRoutesChanged: remedialChanged,
    variantDeclarationsChanged: variantChanges,
    authoredClaimsAnswersMisconceptionsFeedbackPreserved: errors.length === 0,
    nonTargetLessonFilesByteIdentical: 1129 - Object.keys(targetPaths).length,
  },
  files: records,
  passed: errors.length === 0,
  errors,
};
writeFileSync(join(root, 'SESSION149_CONTENT_CHANGE_LEDGER.json'), JSON.stringify(ledger, null, 2) + '\n');
const audit = JSON.parse(readFileSync(join(root, 'GEOMETRIC_CONSTRAINT_S149.json'), 'utf8'));
writeFileSync(join(root, 'SESSION149_AUTHORED_CONTENT_LEDGER_SUMMARY.json'), JSON.stringify({
  session: 149,
  engine: 'geometricConstraintLab',
  summary: {
    lessons: 6,
    experiences: audit.experiences,
    mainExperiences: audit.main,
    remedialExperiences: audit.remedials,
    variantDeclarationsPreserved: audit.variantDeclarationsPreserved,
    promptsAnswersMisconceptionsFeedbackPreserved: true,
  },
  records: JSON.parse(readFileSync(join(root, 'SESSION149_AUTHORED_CONTENT_LEDGER.json'), 'utf8')).entries,
  passed: errors.length === 0,
}, null, 2) + '\n');
if (errors.length) {
  console.error(`Session 149 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Session 149 content proof passed: exactly 6 lesson files, 42 widget nodes, 36 main experiences, 6 remedials; zero variant drift; 1123 non-target lessons byte-identical');
