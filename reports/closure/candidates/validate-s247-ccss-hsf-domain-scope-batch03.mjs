#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash, validateStandardsDecision } from '../../../scripts/standards/decision-contract.mjs';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH03.jsonl';
const text = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(text(relativePath));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = (relativePath) => sha256(text(relativePath));
const fail = (message) => { throw new Error(message); };

const records = text(packetPath).trim().split(/\r?\n/).map(JSON.parse);
const dossiers = json('content/standards/evidence-dossiers.json').dossiers;
const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
const openHsf = dossiers.filter((dossier) => dossier.framework === 'CCSS-MATH'
  && dossier.candidateCode === 'HSF'
  && dossier.review?.status === 'candidate');
const globalDecisions = json('content/standards/human-review-decisions.json').decisions;
const globallyDecided = new Set(globalDecisions.map((decision) => decision.edgeId));
const currentHashes = {
  evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
  objectivesSha256: hashFile('content/standards/objectives.json'),
  sourceRegistrySha256: hashFile('content/standards/source-registry.json')
};
const officialSourceUrl = 'https://www.thecorestandards.org/Math/Content/HSF/';
const officialSourceBoundary = 'High School: Functions > Standards in this domain';
const officialPdfUrl = 'https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf';
const officialPdfBoundary = 'High School — Functions, printed pages 67–73';
const officialTextSnapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const officialBoundaryHash = sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`);
const officialPdfBoundaryHash = sha256(`${officialPdfUrl}|${officialPdfBoundary}|${officialTextSnapshot}`);
const batch02PacketSha256 = hashFile('reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02.jsonl');
const expectedCourseCounts = { 'trig-functions': 11, 'conic-sections': 16, 'function-analysis': 13 };
const expectedRouting = {
  'trig-functions': ['HSF.TF', 'HSG.C'],
  'conic-sections': ['HSG.GPE', 'HSG.C', 'HSA.REI', 'HSA.CED'],
  'function-analysis': ['HSF.IF', 'HSF.BF']
};

if (records.length !== 40 || new Set(records.map((record) => record.edgeId)).size !== 40) {
  fail('Packet must contain 40 unique records');
}
if (openHsf.length !== 169) fail(`Expected 169 post-batch-02 open HSF edges, found ${openHsf.length}`);
if (JSON.stringify(records.map((record) => record.edgeId)) !== JSON.stringify(openHsf.slice(0, 40).map((dossier) => dossier.edgeId))) {
  fail('Batch 03 is not the next 40 current CCSS-MATH|HSF candidates');
}
if (records.some((record) => globallyDecided.has(record.edgeId))) fail('Batch 03 overlaps the shared decision ledger');

const courseCounts = records.reduce((counts, record) => ({
  ...counts,
  [record.evidenceSnapshot.courseId]: (counts[record.evidenceSnapshot.courseId] ?? 0) + 1
}), {});
if (JSON.stringify(courseCounts) !== JSON.stringify(expectedCourseCounts)) {
  fail(`Course partition drift: ${JSON.stringify(courseCounts)}`);
}

for (const record of records) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (!dossier || dossier.framework !== 'CCSS-MATH' || dossier.candidateCode !== 'HSF' || dossier.review?.status !== 'candidate') {
    fail(`Invalid live scope ${record.edgeId}`);
  }
  if (record.decision !== 'rejected' || record.approvedDepth !== null || record.candidateCode !== 'HSF') fail(`Decision scope drift ${record.edgeId}`);
  if (record.dossierHash !== candidateDossierHash(dossier)) fail(`Dossier hash drift ${record.edgeId}`);
  if (record.officialSourceUrl !== officialSourceUrl
    || record.officialSourceBoundary !== officialSourceBoundary
    || record.officialTextSnapshot !== officialTextSnapshot
    || record.officialSourceBoundaryHash !== officialBoundaryHash) fail(`Web boundary drift ${record.edgeId}`);
  if (record.officialPdfUrl !== officialPdfUrl
    || record.officialPdfBoundary !== officialPdfBoundary
    || record.officialPdfBoundaryHash !== officialPdfBoundaryHash) fail(`PDF boundary drift ${record.edgeId}`);
  for (const [key, value] of Object.entries(currentHashes)) {
    if (record.sourceArtifactHashes[key] !== value) fail(`Stale ${key} ${record.edgeId}`);
  }
  if (record.sourceArtifactHashes.officialBoundarySnapshotSha256 !== officialBoundaryHash
    || record.sourceArtifactHashes.officialPdfBoundarySha256 !== officialPdfBoundaryHash) fail(`Authority seal drift ${record.edgeId}`);

  const contract = validateStandardsDecision(record, { allowLegacy: false });
  if (contract.errors.length) fail(`${record.edgeId}: ${contract.errors.join('; ')}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) fail(`Signature mismatch ${record.edgeId}`);

  if (record.evidenceSnapshot.objectiveId !== dossier.objectiveId
    || record.evidenceSnapshot.objectiveTitle !== dossier.objectiveTitle
    || record.evidenceSnapshot.courseId !== dossier.courseId
    || record.evidenceSnapshot.gradeLevel !== dossier.gradeLevel
    || JSON.stringify(record.evidenceSnapshot.lessonIds) !== JSON.stringify(dossier.evidenceSummary.lessonIds)
    || record.evidenceSnapshot.stepEvidenceCount !== dossier.stepEvidence.length
    || record.evidenceSnapshot.independentPracticeStepCount !== dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length
    || record.evidenceSnapshot.transferTaggedStepCount !== dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length) {
    fail(`Evidence snapshot drift ${record.edgeId}`);
  }
  if (record.evidenceSnapshot.transferEvidenceUsed !== false
    || !record.notes.includes('not treated as transfer or mastery evidence')) fail(`Transfer/mastery inference ${record.edgeId}`);
  if (record.claimBoundary !== 'This decision rejects only the coarse HSF domain-level edge. It makes no approval or rejection claim for any exact HSF.BF, HSF.IF, HSF.LE, HSF.TF, HSA, or HSG descendant standard.') {
    fail(`Overbroad claim boundary ${record.edgeId}`);
  }
  if (record.evidenceGaps.length !== 4 || !record.replacementReview?.required
    || record.replacementReview.boundary !== 'Routing hints only; not signed alignment claims. Exact standard text and full lesson evidence require a new review.'
    || JSON.stringify(record.replacementReview.candidateFamiliesOnly) !== JSON.stringify(expectedRouting[dossier.courseId])) {
    fail(`Gap/routing contract drift ${record.edgeId}`);
  }
  if (record.deltaFromBatch02.priorIntegratedRejectedEdges !== 80
    || record.deltaFromBatch02.priorPacketSha256 !== batch02PacketSha256
    || record.deltaFromBatch02.remainingHsfCandidatesBeforeBatch03 !== 169) fail(`Delta baseline drift ${record.edgeId}`);
  for (const [lessonId, seal] of Object.entries(record.evidenceSnapshot.lessonSourceHashes)) {
    if (!record.evidenceSnapshot.lessonIds.includes(lessonId)
      || hashFile(seal.relativePath) !== seal.sha256
      || json(seal.relativePath).id !== lessonId) fail(`Lesson source drift ${record.edgeId}/${lessonId}`);
  }
}

const sample = [...records]
  .sort((a, b) => sha256(`${currentHashes.evidenceDossiersSha256}|batch03|${a.edgeId}`)
    .localeCompare(sha256(`${currentHashes.evidenceDossiersSha256}|batch03|${b.edgeId}`)))
  .slice(0, 8);
for (const record of sample) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (record.dossierHash !== candidateDossierHash(dossier)) fail(`Sample dossier recomputation drift ${record.edgeId}`);
  if (record.evidenceSnapshot.lessonIds.length !== Object.keys(record.evidenceSnapshot.lessonSourceHashes).length) {
    fail(`Sample lesson coverage drift ${record.edgeId}`);
  }
  if (record.evidenceSnapshot.transferEvidenceUsed !== false || record.approvedDepth !== null) {
    fail(`Sample inference boundary drift ${record.edgeId}`);
  }
}

console.log(JSON.stringify({
  status: 'PASS',
  records: records.length,
  courseCounts,
  sharedLedgerOverlap: 0,
  independentUnseenSampleSize: sample.length,
  independentUnseenSampleEdgeIds: sample.map((record) => record.edgeId),
  projectedRemainingHsfCandidates: openHsf.length - records.length,
  packetSha256: hashFile(packetPath)
}, null, 2));
