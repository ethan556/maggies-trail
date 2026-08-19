#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash, validateStandardsDecision } from '../../../scripts/standards/decision-contract.mjs';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl';
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = (relativePath) => sha256(readText(relativePath));
const fail = (message) => { throw new Error(message); };

const records = readText(packetPath).trim().split(/\r?\n/).map((line) => JSON.parse(line));
const dossiers = readJson('content/standards/evidence-dossiers.json').dossiers;
const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
const currentArtifactHashes = {
  evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
  objectivesSha256: hashFile('content/standards/objectives.json'),
  sourceRegistrySha256: hashFile('content/standards/source-registry.json')
};
const expectedSourceUrl = 'https://www.thecorestandards.org/Math/Content/HSF/';
const expectedBoundary = 'High School: Functions > Standards in this domain';
const expectedSnapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const expectedBoundaryHash = sha256(`${expectedSourceUrl}|${expectedBoundary}|${expectedSnapshot}`);

if (records.length !== 40) fail(`Expected exactly 40 records, found ${records.length}`);
if (new Set(records.map((record) => record.edgeId)).size !== records.length) fail('Duplicate edge IDs');
if (records.some((record) => record.decision !== 'rejected')) fail('This bounded packet may contain only rejected decisions');
const actualCourseCounts = records.reduce((counts, record) => {
  const courseId = record.evidenceSnapshot.courseId;
  counts[courseId] = (counts[courseId] ?? 0) + 1;
  return counts;
}, {});
const expectedCourseCounts = { 'functions-and-sequences': 12, 'linear-functions': 12, quadratics: 11, 'function-transformations': 5 };
if (JSON.stringify(actualCourseCounts) !== JSON.stringify(expectedCourseCounts)) fail(`Unexpected course partition: ${JSON.stringify(actualCourseCounts)}`);

for (const record of records) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (!dossier) fail(`Missing live dossier ${record.edgeId}`);
  if (dossier.framework !== 'CCSS-MATH' || dossier.candidateCode !== 'HSF') fail(`Out-of-scope edge ${record.edgeId}`);
  if (dossier.review?.status !== 'candidate') fail(`Edge is no longer an open candidate: ${record.edgeId}`);
  if (record.dossierHash !== candidateDossierHash(dossier)) fail(`Stale dossier hash: ${record.edgeId}`);
  if (record.candidateCode !== 'HSF') fail(`Wrong candidate code: ${record.edgeId}`);
  if (record.officialSourceUrl !== expectedSourceUrl || record.officialSourceBoundary !== expectedBoundary || record.officialTextSnapshot !== expectedSnapshot) {
    fail(`Official-source boundary drift: ${record.edgeId}`);
  }
  if (record.officialSourceBoundaryHash !== expectedBoundaryHash) fail(`Official boundary hash mismatch: ${record.edgeId}`);
  for (const [key, value] of Object.entries(currentArtifactHashes)) {
    if (record.sourceArtifactHashes[key] !== value) fail(`Stale ${key}: ${record.edgeId}`);
  }
  if (record.sourceArtifactHashes.officialBoundarySnapshotSha256 !== expectedBoundaryHash) fail(`Source snapshot hash mismatch: ${record.edgeId}`);
  const validation = validateStandardsDecision(record, { allowLegacy: false });
  if (validation.errors.length) fail(`${record.edgeId}: ${validation.errors.join('; ')}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) fail(`Invalid signature: ${record.edgeId}`);
  if (record.evidenceSnapshot.transferEvidenceUsed !== false) fail(`Transfer evidence must not be used: ${record.edgeId}`);
  if (!record.notes.includes('not treated as transfer or mastery evidence')) fail(`Missing no-transfer inference statement: ${record.edgeId}`);
  if (!record.claimBoundary.startsWith('This decision rejects only the coarse HSF domain-level edge.')) fail(`Overbroad rejection boundary: ${record.edgeId}`);
  if (record.evidenceGaps.length < 4 || !record.replacementReview?.required) fail(`Incomplete gap/replacement contract: ${record.edgeId}`);
  if (record.evidenceSnapshot.objectiveId !== dossier.objectiveId || record.evidenceSnapshot.courseId !== dossier.courseId) fail(`Evidence identity drift: ${record.edgeId}`);
  if (JSON.stringify(record.evidenceSnapshot.lessonIds) !== JSON.stringify(dossier.evidenceSummary.lessonIds)) fail(`Lesson list drift: ${record.edgeId}`);
}

// Independent deterministic unseen-sample gate: selection is derived from the live
// artifact hash, not the packet order or author-provided sample list.
const unseenSample = [...records]
  .sort((a, b) => sha256(`${currentArtifactHashes.evidenceDossiersSha256}|${a.edgeId}`).localeCompare(sha256(`${currentArtifactHashes.evidenceDossiersSha256}|${b.edgeId}`)))
  .slice(0, 8);
for (const record of unseenSample) {
  const dossier = dossierByEdge.get(record.edgeId);
  const independentSteps = dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length;
  const transferTaggedSteps = dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length;
  if (record.evidenceSnapshot.stepEvidenceCount !== dossier.stepEvidence.length) fail(`Sample step count drift: ${record.edgeId}`);
  if (record.evidenceSnapshot.independentPracticeStepCount !== independentSteps) fail(`Sample independent-practice drift: ${record.edgeId}`);
  if (record.evidenceSnapshot.transferTaggedStepCount !== transferTaggedSteps) fail(`Sample transfer-tag drift: ${record.edgeId}`);
  for (const lessonId of dossier.evidenceSummary.lessonIds) {
    const lesson = record.evidenceSnapshot.lessonSourceHashes[lessonId];
    if (!lesson || hashFile(lesson.relativePath) !== lesson.sha256) fail(`Sample lesson hash drift: ${record.edgeId}/${lessonId}`);
    const lessonDoc = readJson(lesson.relativePath);
    if (lessonDoc.id !== lessonId) fail(`Sample lesson identity drift: ${record.edgeId}/${lessonId}`);
  }
}

const packetSha256 = hashFile(packetPath);
console.log(JSON.stringify({
  status: 'PASS',
  records: records.length,
  canonicalStatus: 'rejected',
  currentCandidatesChecked: records.length,
  independentUnseenSampleSize: unseenSample.length,
  independentUnseenSampleEdgeIds: unseenSample.map((record) => record.edgeId),
  packetSha256
}, null, 2));
