#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash, validateStandardsDecision } from '../../../scripts/standards/decision-contract.mjs';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_FINAL.jsonl';
const text = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(text(relativePath));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = (relativePath) => sha256(text(relativePath));
const fail = (message) => { throw new Error(message); };

const dossiers = json('content/standards/evidence-dossiers.json').dossiers;
const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
const globalDecisions = json('content/standards/human-review-decisions.json').decisions;
const globallyDecided = new Set(globalDecisions.map((decision) => decision.edgeId));
const openHsf = dossiers.filter((dossier) => dossier.framework === 'CCSS-MATH'
  && dossier.candidateCode === 'HSF'
  && dossier.review?.status === 'candidate'
  && !globallyDecided.has(dossier.edgeId));
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
const batch05PacketSha256 = hashFile('reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH05.jsonl');
const expectedCourseCounts = {
  'derivative-rules': 4,
  'derivatives-in-context': 11,
  'integration-accumulation': 16,
  'integration-applications': 6,
  'parametric-polar-calculus': 5,
  'series-convergence': 7
};
const expectedRouting = Object.fromEntries(Object.keys(expectedCourseCounts).map((courseId) => [courseId, ['HSF.IF']]));
const claimBoundary = 'This decision rejects only the coarse HSF domain-level edge. It makes no approval or rejection claim for any exact HSF.BF, HSF.IF, HSF.LE, HSF.TF, HSA, or HSG descendant standard.';
const routingBoundary = 'Routing hints only; not signed alignment claims. Exact standard text and full lesson evidence require a new review.';
const evidenceGaps = [
  'The candidate locator HSF names a domain and supplies no exact assessable standard action, conditions, representations, or limits.',
  'Full-intent comparison cannot close until the objective is mapped to an exact descendant standard and compared with its complete official wording.',
  'The bounded lesson evidence cannot establish alignment to the complete HSF domain across interpreting, building, modeling, and trigonometric functions.',
  'Dossier challenge/transfer tags were not used to infer transfer or mastery.'
];

const lessonSourceHashes = (dossier) => Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
  const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
  return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
}));

const makeRecord = (dossier) => {
  const unsigned = {
    edgeId: dossier.edgeId,
    decision: 'rejected',
    reviewer: 'chatgpt-work-s247-standards-assurance-hsf-final',
    reviewedAt: '2026-08-18T22:30:00.000Z',
    notes: `Reject the ${dossier.objectiveId} -> HSF edge because HSF is the Functions domain locator, not an exact Common Core standard. Current evidence for “${dossier.objectiveTitle}” requires remapping and review against exact descendant text; this rejection does not reject narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null,
    officialTextSnapshot,
    officialSourceUrl,
    claimBoundary,
    dossierHash: candidateDossierHash(dossier),
    candidateCode: 'HSF',
    officialSourceBoundary,
    officialSourceBoundaryHash: officialBoundaryHash,
    officialPdfUrl,
    officialPdfBoundary,
    officialPdfBoundaryHash,
    sourceArtifactHashes: {
      ...currentHashes,
      officialBoundarySnapshotSha256: officialBoundaryHash,
      officialPdfBoundarySha256: officialPdfBoundaryHash
    },
    evidenceSnapshot: {
      objectiveId: dossier.objectiveId,
      objectiveTitle: dossier.objectiveTitle,
      courseId: dossier.courseId,
      gradeLevel: dossier.gradeLevel,
      lessonIds: dossier.evidenceSummary.lessonIds,
      stepEvidenceCount: dossier.stepEvidence.length,
      independentPracticeStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length,
      transferTaggedStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length,
      transferEvidenceUsed: false,
      lessonSourceHashes: lessonSourceHashes(dossier)
    },
    evidenceGaps,
    replacementReview: {
      required: true,
      candidateFamiliesOnly: expectedRouting[dossier.courseId],
      boundary: routingBoundary
    },
    deltaFromBatch05: {
      priorIntegratedRejectedEdges: 200,
      priorPacketSha256: batch05PacketSha256,
      remainingHsfCandidatesBeforeFinal: 49
    }
  };
  return { ...unsigned, signature: sha256(JSON.stringify(unsigned)) };
};

if (process.argv.includes('--generate')) {
  if (openHsf.length !== 49) fail(`Expected 49 live HSF candidates before generation, found ${openHsf.length}`);
  const records = openHsf.map(makeRecord);
  fs.writeFileSync(path.join(root, packetPath), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
}

const records = text(packetPath).trim().split(/\r?\n/).map(JSON.parse);
if (records.length !== 49 || new Set(records.map((record) => record.edgeId)).size !== 49) fail('Terminal packet must contain 49 unique records');
if (openHsf.length !== 49) fail(`Expected 49 live HSF candidates, found ${openHsf.length}`);
if (JSON.stringify(records.map((record) => record.edgeId)) !== JSON.stringify(openHsf.map((dossier) => dossier.edgeId))) {
  fail('Terminal packet is not the complete current CCSS-MATH|HSF candidate remainder');
}
if (records.some((record) => globallyDecided.has(record.edgeId))) fail('Terminal packet overlaps the shared decision ledger');
if (globalDecisions.length !== 202 || globalDecisions.filter((record) => record.decision === 'rejected').length !== 200) {
  fail('Integrated decision baseline drift');
}

const courseCounts = records.reduce((counts, record) => ({
  ...counts,
  [record.evidenceSnapshot.courseId]: (counts[record.evidenceSnapshot.courseId] ?? 0) + 1
}), {});
if (JSON.stringify(courseCounts) !== JSON.stringify(expectedCourseCounts)) fail(`Course partition drift: ${JSON.stringify(courseCounts)}`);

for (const record of records) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (!dossier || dossier.framework !== 'CCSS-MATH' || dossier.candidateCode !== 'HSF'
    || dossier.sourceLocator !== 'HSF' || dossier.sourceTextStatus !== 'scope-locator-requires-exact-benchmark'
    || dossier.checks?.exactStandardCodeCandidate !== false || dossier.review?.status !== 'candidate') {
    fail(`Invalid live coarse-locator scope ${record.edgeId}`);
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

  const expectedSnapshot = {
    objectiveId: dossier.objectiveId,
    objectiveTitle: dossier.objectiveTitle,
    courseId: dossier.courseId,
    gradeLevel: dossier.gradeLevel,
    lessonIds: dossier.evidenceSummary.lessonIds,
    stepEvidenceCount: dossier.stepEvidence.length,
    independentPracticeStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length,
    transferTaggedStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length
  };
  for (const [key, value] of Object.entries(expectedSnapshot)) {
    if (JSON.stringify(record.evidenceSnapshot[key]) !== JSON.stringify(value)) fail(`Evidence snapshot drift ${record.edgeId}/${key}`);
  }
  if (record.evidenceSnapshot.transferEvidenceUsed !== false
    || !record.notes.includes('not treated as transfer or mastery evidence')) fail(`Transfer/mastery inference ${record.edgeId}`);
  if (record.claimBoundary !== claimBoundary) fail(`Overbroad claim boundary ${record.edgeId}`);
  if (JSON.stringify(record.evidenceGaps) !== JSON.stringify(evidenceGaps)
    || !record.replacementReview?.required
    || record.replacementReview.boundary !== routingBoundary
    || JSON.stringify(record.replacementReview.candidateFamiliesOnly) !== JSON.stringify(expectedRouting[dossier.courseId])) {
    fail(`Gap/routing contract drift ${record.edgeId}`);
  }
  if (record.deltaFromBatch05.priorIntegratedRejectedEdges !== 200
    || record.deltaFromBatch05.priorPacketSha256 !== batch05PacketSha256
    || record.deltaFromBatch05.remainingHsfCandidatesBeforeFinal !== 49) fail(`Delta baseline drift ${record.edgeId}`);

  const lessonSeals = record.evidenceSnapshot.lessonSourceHashes;
  if (Object.keys(lessonSeals).length !== record.evidenceSnapshot.lessonIds.length) fail(`Lesson seal coverage drift ${record.edgeId}`);
  for (const lessonId of record.evidenceSnapshot.lessonIds) {
    const seal = lessonSeals[lessonId];
    if (!seal || hashFile(seal.relativePath) !== seal.sha256 || json(seal.relativePath).id !== lessonId) {
      fail(`Lesson source drift ${record.edgeId}/${lessonId}`);
    }
  }
}

const sample = [...records]
  .sort((a, b) => sha256(`${currentHashes.evidenceDossiersSha256}|final|${a.edgeId}`)
    .localeCompare(sha256(`${currentHashes.evidenceDossiersSha256}|final|${b.edgeId}`)))
  .slice(0, 8);
for (const record of sample) {
  const dossier = dossierByEdge.get(record.edgeId);
  if (record.dossierHash !== candidateDossierHash(dossier)) fail(`Sample dossier recomputation drift ${record.edgeId}`);
  if (record.evidenceSnapshot.lessonIds.length !== Object.keys(record.evidenceSnapshot.lessonSourceHashes).length) fail(`Sample lesson coverage drift ${record.edgeId}`);
  if (record.evidenceSnapshot.transferEvidenceUsed !== false || record.approvedDepth !== null) fail(`Sample inference boundary drift ${record.edgeId}`);
  if (!record.claimBoundary.startsWith('This decision rejects only the coarse HSF domain-level edge.')) fail(`Sample boundary drift ${record.edgeId}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  records: records.length,
  courseCounts,
  sharedLedgerOverlap: 0,
  independentlyValidatedCoarseLocators: records.length,
  descendantOrExactDecisionsChanged: 0,
  independentUnseenSampleSize: sample.length,
  independentUnseenSampleEdgeIds: sample.map((record) => record.edgeId),
  projectedRemainingHsfCandidates: openHsf.length - records.length,
  packetSha256: hashFile(packetPath)
}, null, 2));
