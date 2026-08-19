#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash } from '../standards/decision-contract.mjs';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const hashFile = (p) => sha256(readText(p));
const outputPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02.jsonl';
const reviewedAt = '2026-08-18T18:30:00.000Z';
const reviewer = 'chatgpt-work-s247-standards-assurance-hsf-batch02';
const officialSourceUrl = 'https://www.thecorestandards.org/Math/Content/HSF/';
const officialSourceBoundary = 'High School: Functions > Standards in this domain';
const officialPdfUrl = 'https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf';
const officialPdfBoundary = 'High School — Functions, printed pages 67–73';
const officialTextSnapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const selectedEdgeIds = [
  '466c5477511d916f745a6cab', '509d70354336c1e865928f41', '9e7b068c3cba86e677a50e9a', '3998eaadfc86d5c99625399b',
  '752e93483d316d1522e8d97e', 'cc6723394d1a6d0cf0345ec0', '0df9527bc6fe16ddf5be343c', '8b283bf3ea80dd8b804d9995',
  'd27e3c193930a341b4902422', 'b015670f86bf93e8c376d0c3', 'c8287421975d54308feaa634', '4f8f90d2d2cf0b1a6d69d812',
  'ff708b311015616f93ab2711', '135b97aeb20ebaf56cd3a805', '03388679a0d2d9eb6e00c14e', 'e5ec596e8b2749a0813e3405',
  '4ec5f90cca702951a2df4cf6', 'd77a2e315d97e80c0132d8c8', 'f341a2508c7a222a5075d3fe', 'b18a26adff19087a3b3f0e31',
  '9b8d8c592ef18a0ffdf06223', 'edeb31a197ba351beb0ca4ab', 'ecc162e34bcd6c4a01a4fbb3', '471e662139dd44dccafd94ef',
  '72bfc920593a1d9df212f39d', '6448a2bdee15f6ae607af5d1', 'c6f75676d3c03886f0119154', '226bb4aacf7bb71738399232',
  '8ee6a91408eb082a96aca743', 'a2d98e3984ed09fcd63d6424', '0bea14f8398b301f274ec883', 'e488ea1a796d2a5e291df826',
  'd52348f96da7e991ff39edae', '9b577714932f5de519234551', '2b4f8851f48ffa04a02626bb', '5430c90a077c04f16ba929b0',
  '98bc9e1e0443c6bf8aa9425b', 'e2749a7851e6fb6c2a5b702d', '18dd7b2a425692609f8d1d4e', 'dc8ec2e121ffee256c47db20'
];
const sourceArtifactHashes = {
  evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
  objectivesSha256: hashFile('content/standards/objectives.json'),
  sourceRegistrySha256: hashFile('content/standards/source-registry.json'),
  officialBoundarySnapshotSha256: sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`),
  officialPdfBoundarySha256: sha256(`${officialPdfUrl}|${officialPdfBoundary}|${officialTextSnapshot}`)
};
const dossierDoc = readJson('content/standards/evidence-dossiers.json');
const openHsf = dossierDoc.dossiers.filter((d) => d.framework === 'CCSS-MATH' && d.candidateCode === 'HSF' && d.review?.status === 'candidate');
if (JSON.stringify(openHsf.slice(0, 40).map((d) => d.edgeId)) !== JSON.stringify(selectedEdgeIds)) {
  throw new Error('Locked batch 02 is no longer the next 40 open CCSS-MATH|HSF edges');
}
const dossierByEdge = new Map(dossierDoc.dossiers.map((d) => [d.edgeId, d]));
const dossiers = selectedEdgeIds.map((edgeId) => dossierByEdge.get(edgeId));
const expectedCourseCounts = { 'function-transformations': 10, logarithms: 15, 'sequences-series': 13, 'trig-functions': 2 };
const counts = dossiers.reduce((a, d) => ({ ...a, [d.courseId]: (a[d.courseId] ?? 0) + 1 }), {});
if (JSON.stringify(counts) !== JSON.stringify(expectedCourseCounts)) throw new Error(`Unexpected course partition: ${JSON.stringify(counts)}`);

const routing = (courseId) => {
  if (courseId === 'function-transformations') return ['HSF.BF', 'HSF.IF'];
  if (courseId === 'logarithms') return ['HSF.LE', 'HSF.BF', 'HSF.IF', 'HSA.REI'];
  if (courseId === 'sequences-series') return ['HSF.BF', 'HSF.IF', 'HSA.SSE', 'HSA.APR'];
  return ['HSF.TF', 'HSG.C'];
};
const records = dossiers.map((dossier) => {
  const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
    const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
    if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Missing lesson source ${relativePath}`);
    return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
  }));
  const core = {
    edgeId: dossier.edgeId, decision: 'rejected', reviewer, reviewedAt,
    notes: `Reject the ${dossier.objectiveId} -> HSF edge because HSF is the Functions domain locator, not an exact Common Core standard. Current evidence for “${dossier.objectiveTitle}” requires remapping and review against exact descendant text; this rejection does not reject narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null, officialTextSnapshot, officialSourceUrl,
    claimBoundary: 'This decision rejects only the coarse HSF domain-level edge. It makes no approval or rejection claim for any exact HSF.BF, HSF.IF, HSF.LE, HSF.TF, HSA, or HSG descendant standard.',
    dossierHash: candidateDossierHash(dossier), candidateCode: 'HSF', officialSourceBoundary,
    officialSourceBoundaryHash: sourceArtifactHashes.officialBoundarySnapshotSha256,
    officialPdfUrl, officialPdfBoundary, officialPdfBoundaryHash: sourceArtifactHashes.officialPdfBoundarySha256,
    sourceArtifactHashes,
    evidenceSnapshot: {
      objectiveId: dossier.objectiveId, objectiveTitle: dossier.objectiveTitle, courseId: dossier.courseId,
      gradeLevel: dossier.gradeLevel, lessonIds: dossier.evidenceSummary.lessonIds,
      stepEvidenceCount: dossier.stepEvidence.length,
      independentPracticeStepCount: dossier.stepEvidence.filter((s) => s.evidenceRoles.includes('independent-practice')).length,
      transferTaggedStepCount: dossier.stepEvidence.filter((s) => s.evidenceRoles.includes('transfer')).length,
      transferEvidenceUsed: false, lessonSourceHashes
    },
    evidenceGaps: [
      'The candidate locator HSF names a domain and supplies no exact assessable standard action, conditions, representations, or limits.',
      'Full-intent comparison cannot close until the objective is mapped to an exact descendant standard and compared with its complete official wording.',
      'The bounded lesson evidence cannot establish alignment to the complete HSF domain across interpreting, building, modeling, and trigonometric functions.',
      'Dossier challenge/transfer tags were not used to infer transfer or mastery.'
    ],
    replacementReview: { required: true, candidateFamiliesOnly: routing(dossier.courseId), boundary: 'Routing hints only; not signed alignment claims. Exact standard text and full lesson evidence require a new review.' },
    deltaFromBatch01: { priorIntegratedRejectedEdges: 40, priorPacketSha256: hashFile('reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl'), remainingHsfCandidatesBeforeBatch02: openHsf.length }
  };
  return { ...core, signature: sha256(JSON.stringify(core)) };
});
fs.writeFileSync(path.join(root, outputPath), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
console.log(`wrote ${records.length} signed isolated HSF batch-02 decisions to ${outputPath}`);
