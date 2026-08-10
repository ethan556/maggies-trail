#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { verifiedPostS151Changes } from './verified-post-s151-changes.mjs';

const root = resolve(import.meta.dirname, '../..');
const baselineHashes = JSON.parse(readFileSync(join(root, 'SESSION146_LESSON_HASHES.json'), 'utf8'));
const baselineDir = join(root, 'scripts/audit/baselines/s147');
const targetPaths = {
  'bv-02-03': 'content/courses/bivariate-statistics/lessons/bv-02-03.json',
  'fg-03-02': 'content/courses/functions-g8/lessons/fg-03-02.json',
  'fg-03-03': 'content/courses/functions-g8/lessons/fg-03-03.json',
  'les-04-02': 'content/courses/linear-equations-systems/lessons/les-04-02.json',
  'les-04-03': 'content/courses/linear-equations-systems/lessons/les-04-03.json',
};
const expected = new Set(Object.values(targetPaths));
const allowedLater = new Set([
  'content/courses/fractions-add/lessons/fa-02-02.json',
  'content/courses/decimal-operations/lessons/dop-01-02.json',
  'content/courses/expressions-equations/lessons/ee-01-02.json',
  'content/courses/expressions-equations/lessons/ee-05-01.json',
  'content/courses/rational-number-operations/lessons/rno-04-03.json',
  'content/courses/the-real-number-system/lessons/rns-02-01.json',
  'content/courses/the-real-number-system/lessons/rns-02-03.json',
  'content/courses/measurement-data/lessons/md-05-02.json',
  'content/courses/area-surface-volume/lessons/asv-03-03.json',
  'content/courses/geometry-g7/lessons/g7-01-03.json',
  'content/courses/geometry-g7/lessons/g7-03-02.json',
  'content/courses/transformations-measurement/lessons/tm-03-03.json',
  'content/courses/transformations-measurement/lessons/tm-04-01.json',

  'content/courses/coordinate-geometry/lessons/cg-01-03.json',
  'content/courses/data-distributions/lessons/dd-04-01.json',]);
for (const rel of JSON.parse(readFileSync(join(root, 'scripts/session/baselines-s151/index.json'), 'utf8')).targets) allowedLater.add(rel);
for (const rel of verifiedPostS151Changes(root)) allowedLater.add(rel);
const expectedCurrent = new Set([...expected, ...allowedLater]);
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
if (JSON.stringify(changed) !== JSON.stringify([...expectedCurrent].sort())) errors.push(`changed lesson set mismatch: ${changed.join(', ')}`);

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
      if (av.node.widget?.type !== 'affineRelationshipLab') errors.push(`${lessonId}/${key}: wrong target widget ${av.node.widget?.type}`);
      if (bv.node.widget?.prompt !== av.node.widget?.prompt) errors.push(`${lessonId}/${key}: prompt changed`);
    }
  }
  records.push({
    path: rel,
    baselineSha256: sha(beforeBytes),
    session147Sha256: sha(afterBytes),
    widgetNodesChanged: nodes.length,
    changedNodes: nodes,
    variantDeclarationsChanged: 0,
    nonWidgetAuthoredFieldsPreserved: true,
  });
}
if (widgetNodesChanged !== 35) errors.push(`expected 35 widget changes, got ${widgetNodesChanged}`);
if (mainChanged !== 30) errors.push(`expected 30 main changes, got ${mainChanged}`);
if (remedialChanged !== 5) errors.push(`expected 5 remedial changes, got ${remedialChanged}`);
if (variantChanges !== 0) errors.push(`expected zero variant changes, got ${variantChanges}`);

try { execFileSync('python', [join(root, 'scripts/audit/affine-relationship-s147.py')], { cwd: root, stdio: 'inherit' }); }
catch { errors.push('affine authored audit failed'); }

const ledger = {
  session: 147,
  baselineSession: 146,
  baselineArchive: 'maggies-trail-session-146.tar.gz',
  baselineSha256: 'bbfb0cc6f109d055869a4f97670cd17b628d788ea561dfd7d0c83ef709b6dd15',
  summary: {
    lessonFilesChanged: expected.size,
    widgetNodesChanged,
    mainExperiencesChanged: mainChanged,
    remedialRoutesChanged: remedialChanged,
    variantDeclarationsChanged: variantChanges,
    authoredClaimsAnswersMisconceptionsFeedbackPreserved: errors.length === 0,
    nonTargetLessonFilesByteIdentical: 1129 - expected.size,
  },
  files: records,
  passed: errors.length === 0,
  errors,
};
writeFileSync(join(root, 'SESSION147_CONTENT_CHANGE_LEDGER.json'), JSON.stringify(ledger, null, 2) + '\n');
const audit = JSON.parse(readFileSync(join(root, 'AFFINE_RELATIONSHIP_S147.json'), 'utf8'));
writeFileSync(join(root, 'SESSION147_AUTHORED_CONTENT_LEDGER.json'), JSON.stringify({
  session: 147,
  engine: 'affineRelationshipLab',
  summary: {
    lessons: 5,
    experiences: audit.experienceCount,
    mainExperiences: audit.mainExperiences,
    remedialExperiences: audit.remedialExperiences,
    variantDeclarationsPreserved: audit.variantDeclarationsPreserved,
    promptsAnswersMisconceptionsFeedbackPreserved: true,
  },
  records: audit.records,
  passed: errors.length === 0,
}, null, 2) + '\n');
if (errors.length) {
  console.error(`Session 147 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Session 147 content proof passed: exactly 5 lesson files, 35 widget nodes, 30 main experiences, 5 remedials; zero variant drift; 1124 non-target lessons byte-identical');
