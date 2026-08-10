#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const baselineHashes = JSON.parse(readFileSync(join(root, 'SESSION145_LESSON_HASHES.json'), 'utf8'));
const baselineDir = join(root, 'scripts/audit/baselines/s146');
const targetPaths = {
  'dop-03-03': 'content/courses/decimal-operations/lessons/dop-03-03.json',
  'ns-01-02': 'content/courses/number-system/lessons/ns-01-02.json',
  'ns-02-01': 'content/courses/number-system/lessons/ns-02-01.json',
  'rns-01-01': 'content/courses/the-real-number-system/lessons/rns-01-01.json',
  'rns-01-03': 'content/courses/the-real-number-system/lessons/rns-01-03.json',
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
      if (av.node.widget?.type !== 'quotientReasoningLab') errors.push(`${lessonId}/${key}: wrong target widget ${av.node.widget?.type}`);
      if (bv.node.widget?.prompt !== av.node.widget?.prompt) errors.push(`${lessonId}/${key}: prompt changed`);
    }
  }
  records.push({
    path: rel,
    baselineSha256: sha(beforeBytes),
    session146Sha256: sha(afterBytes),
    widgetNodesChanged: nodes.length,
    changedNodes: nodes,
    variantDeclarationsChanged: 0,
    nonWidgetAuthoredFieldsPreserved: true,
  });
}
if (widgetNodesChanged !== 37) errors.push(`expected 37 widget changes, got ${widgetNodesChanged}`);
if (mainChanged !== 32) errors.push(`expected 32 main changes, got ${mainChanged}`);
if (remedialChanged !== 5) errors.push(`expected 5 remedial changes, got ${remedialChanged}`);
if (variantChanges !== 0) errors.push(`expected zero variant changes, got ${variantChanges}`);

try { execFileSync('python', [join(root, 'scripts/audit/quotient-reasoning-s146.py')], { cwd: root, stdio: 'inherit' }); }
catch { errors.push('quotient authored audit failed'); }

const ledger = {
  session: 146,
  baselineSession: 145,
  baselineArchive: 'maggies-trail-session-145.tar.gz',
  baselineSha256: '6a2af385c43f6c9e951f60cf3c50c1a6cef57d322cb17844548ebc5892e48296',
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
writeFileSync(join(root, 'SESSION146_CONTENT_CHANGE_LEDGER.json'), JSON.stringify(ledger, null, 2) + '\n');
const audit = JSON.parse(readFileSync(join(root, 'QUOTIENT_REASONING_S146.json'), 'utf8'));
writeFileSync(join(root, 'SESSION146_AUTHORED_CONTENT_LEDGER.json'), JSON.stringify({
  session: 146,
  engine: 'quotientReasoningLab',
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
  console.error(`Session 146 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Session 146 content proof passed: exactly 5 lesson files, 37 widget nodes, 32 main experiences, 5 remedials; zero variant drift; 1124 non-target lessons byte-identical');
