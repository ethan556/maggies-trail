#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash, validateStandardsDecision } from '../../../scripts/standards/decision-contract.mjs';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02.jsonl';
const text = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(text(p));
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const hashFile = (p) => sha256(text(p));
const fail = (m) => { throw new Error(m); };
const records = text(packetPath).trim().split(/\r?\n/).map(JSON.parse);
const dossiers = json('content/standards/evidence-dossiers.json').dossiers;
const dossierByEdge = new Map(dossiers.map((d) => [d.edgeId, d]));
const globalDecisions = json('content/standards/human-review-decisions.json').decisions;
const globallyDecided = new Set(globalDecisions.map((d) => d.edgeId));
const currentHashes = { evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'), objectivesSha256: hashFile('content/standards/objectives.json'), sourceRegistrySha256: hashFile('content/standards/source-registry.json') };
const url = 'https://www.thecorestandards.org/Math/Content/HSF/';
const boundary = 'High School: Functions > Standards in this domain';
const pdfUrl = 'https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf';
const pdfBoundary = 'High School — Functions, printed pages 67–73';
const snapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const boundaryHash = sha256(`${url}|${boundary}|${snapshot}`);
const pdfHash = sha256(`${pdfUrl}|${pdfBoundary}|${snapshot}`);
if (records.length !== 40 || new Set(records.map((r) => r.edgeId)).size !== 40) fail('Packet must contain 40 unique records');
if (records.some((r) => globallyDecided.has(r.edgeId))) fail('Batch 02 overlaps the shared decision ledger');
const counts = records.reduce((a, r) => ({ ...a, [r.evidenceSnapshot.courseId]: (a[r.evidenceSnapshot.courseId] ?? 0) + 1 }), {});
if (JSON.stringify(counts) !== JSON.stringify({ 'function-transformations': 10, logarithms: 15, 'sequences-series': 13, 'trig-functions': 2 })) fail(`Course partition drift: ${JSON.stringify(counts)}`);
for (const record of records) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (!dossier || dossier.framework !== 'CCSS-MATH' || dossier.candidateCode !== 'HSF' || dossier.review?.status !== 'candidate') fail(`Invalid live scope ${record.edgeId}`);
  if (record.decision !== 'rejected' || record.dossierHash !== candidateDossierHash(dossier)) fail(`Decision/hash drift ${record.edgeId}`);
  if (record.officialSourceUrl !== url || record.officialSourceBoundary !== boundary || record.officialTextSnapshot !== snapshot || record.officialSourceBoundaryHash !== boundaryHash) fail(`Web boundary drift ${record.edgeId}`);
  if (record.officialPdfUrl !== pdfUrl || record.officialPdfBoundary !== pdfBoundary || record.officialPdfBoundaryHash !== pdfHash) fail(`PDF boundary drift ${record.edgeId}`);
  for (const [key, value] of Object.entries(currentHashes)) if (record.sourceArtifactHashes[key] !== value) fail(`Stale ${key} ${record.edgeId}`);
  if (record.sourceArtifactHashes.officialBoundarySnapshotSha256 !== boundaryHash || record.sourceArtifactHashes.officialPdfBoundarySha256 !== pdfHash) fail(`Authority seal drift ${record.edgeId}`);
  const validation = validateStandardsDecision(record, { allowLegacy: false });
  if (validation.errors.length) fail(`${record.edgeId}: ${validation.errors.join('; ')}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) fail(`Signature mismatch ${record.edgeId}`);
  if (record.evidenceSnapshot.transferEvidenceUsed !== false || !record.notes.includes('not treated as transfer or mastery evidence')) fail(`Transfer inference ${record.edgeId}`);
  if (!record.claimBoundary.startsWith('This decision rejects only the coarse HSF domain-level edge.')) fail(`Overbroad boundary ${record.edgeId}`);
  if (record.evidenceGaps.length !== 4 || !record.replacementReview?.required) fail(`Gap contract ${record.edgeId}`);
  if (record.deltaFromBatch01.priorIntegratedRejectedEdges !== 40 || record.deltaFromBatch01.remainingHsfCandidatesBeforeBatch02 !== 209) fail(`Delta baseline drift ${record.edgeId}`);
}
const sample = [...records].sort((a, b) => sha256(`${currentHashes.evidenceDossiersSha256}|batch02|${a.edgeId}`).localeCompare(sha256(`${currentHashes.evidenceDossiersSha256}|batch02|${b.edgeId}`))).slice(0, 8);
for (const record of sample) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (record.evidenceSnapshot.stepEvidenceCount !== dossier.stepEvidence.length) fail(`Sample step drift ${record.edgeId}`);
  if (record.evidenceSnapshot.independentPracticeStepCount !== dossier.stepEvidence.filter((s) => s.evidenceRoles.includes('independent-practice')).length) fail(`Sample practice drift ${record.edgeId}`);
  if (record.evidenceSnapshot.transferTaggedStepCount !== dossier.stepEvidence.filter((s) => s.evidenceRoles.includes('transfer')).length) fail(`Sample tag drift ${record.edgeId}`);
  for (const [lessonId, seal] of Object.entries(record.evidenceSnapshot.lessonSourceHashes)) {
    if (hashFile(seal.relativePath) !== seal.sha256 || json(seal.relativePath).id !== lessonId) fail(`Sample lesson drift ${record.edgeId}/${lessonId}`);
  }
}
console.log(JSON.stringify({ status: 'PASS', records: 40, sharedLedgerOverlap: 0, independentUnseenSampleSize: 8, independentUnseenSampleEdgeIds: sample.map((r) => r.edgeId), packetSha256: hashFile(packetPath) }, null, 2));
