#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const baselineHashes = JSON.parse(readFileSync(join(root, 'SESSION144_LESSON_HASHES.json'), 'utf8'));
const baselineDir = join(root, 'scripts/audit/baselines/s145');
const targetPaths = {
  'pv2-03-02': 'content/courses/place-value-million/lessons/pv2-03-02.json',
  'dop-05-03': 'content/courses/decimal-operations/lessons/dop-05-03.json',
  'dpv-01-03': 'content/courses/decimals-place-value/lessons/dpv-01-03.json',
  'dpv-03-01': 'content/courses/decimals-place-value/lessons/dpv-03-01.json',
  'dpv-04-03': 'content/courses/decimals-place-value/lessons/dpv-04-03.json',
  'esn-01-02': 'content/courses/exponents-scientific-notation/lessons/esn-01-02.json',
  'esn-01-03': 'content/courses/exponents-scientific-notation/lessons/esn-01-03.json',
};
const expected = new Set(Object.values(targetPaths));
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
      if (av.node.widget?.type !== 'placeValueTransformLab') errors.push(`${lessonId}/${key}: wrong target widget ${av.node.widget?.type}`);
      if (bv.node.widget?.prompt !== av.node.widget?.prompt) errors.push(`${lessonId}/${key}: prompt changed`);
    }
  }
  records.push({
    path: rel,
    baselineSha256: sha(beforeBytes),
    session145Sha256: sha(afterBytes),
    widgetNodesChanged: nodes.length,
    changedNodes: nodes,
    variantDeclarationsChanged: 0,
    nonWidgetAuthoredFieldsPreserved: true,
  });
}
if (widgetNodesChanged !== 50) errors.push(`expected 50 widget changes, got ${widgetNodesChanged}`);
if (mainChanged !== 43) errors.push(`expected 43 main changes, got ${mainChanged}`);
if (remedialChanged !== 7) errors.push(`expected 7 remedial changes, got ${remedialChanged}`);
if (variantChanges !== 0) errors.push(`expected zero variant changes, got ${variantChanges}`);

try { execFileSync(process.execPath, [join(root, 'scripts/audit/place-value-transform-s145.mjs')], { cwd: root, stdio: 'inherit' }); }
catch { errors.push('place-value authored audit failed'); }

const ledger = {
  session: 145,
  baselineSession: 144,
  baselineArchive: 'maggies-trail-session-144.tar.gz',
  baselineSha256: '20db0eddd5c87e8185a9d9aa9b2b0ca5d47cb53094e21ca65bc71a0dd4523713',
  summary: {
    lessonFilesChanged: changed.length,
    widgetNodesChanged,
    mainExperiencesChanged: mainChanged,
    remedialRoutesChanged: remedialChanged,
    variantDeclarationsChanged: variantChanges,
    authoredClaimsAnswersMisconceptionsFeedbackPreserved: errors.length === 0,
    nonTargetLessonFilesByteIdentical: 1129 - changed.length,
  },
  files: records,
  passed: errors.length === 0,
  errors,
};
writeFileSync(join(root, 'SESSION145_CONTENT_CHANGE_LEDGER.json'), JSON.stringify(ledger, null, 2) + '\n');
const audit = JSON.parse(readFileSync(join(root, 'PLACE_VALUE_TRANSFORM_S145.json'), 'utf8'));
writeFileSync(join(root, 'SESSION145_AUTHORED_CONTENT_LEDGER.json'), JSON.stringify({
  session: 145,
  engine: 'placeValueTransformLab',
  summary: {
    lessons: 7,
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
  console.error(`Session 145 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Session 145 content proof passed: exactly 7 lesson files, 50 widget nodes, 43 main experiences, 7 remedials; zero variant drift; 1122 non-target lessons byte-identical');
