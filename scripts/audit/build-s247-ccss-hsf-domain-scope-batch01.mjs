#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash } from '../standards/decision-contract.mjs';

const root = process.cwd();
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = (relativePath) => sha256(readText(relativePath));

const outputPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl';
const reviewedAt = '2026-08-18T17:30:00.000Z';
const reviewer = 'chatgpt-work-s247-standards-assurance-hsf-batch01';
const officialSourceUrl = 'https://www.thecorestandards.org/Math/Content/HSF/';
const officialSourceBoundary = 'High School: Functions > Standards in this domain';
const officialTextSnapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const selectedEdgeIds = [
  'ce9d3192c9869e6b8ae4b266', '8c3d89a2de90f550696d71f5', 'fbb8ae3cd292d3334aad9b44', '1e2481d51bc984c970648450',
  'cc177df968535bdb29a262a3', '159a17c12673a486afbbf682', 'b5e9e77257884930b3ed2258', 'a9ce8929e5c7f8c26abac264',
  '9bdf0abf167d176f16a134de', 'd003871d2d399877e6821643', '3b9206329391f292fd2f8de2', '7325e87129222b93cd14317f',
  '6c47b81f632866f3d52a92ef', '375836024c6d289056cfda42', 'f1fa8138b09a8be0344a50ce', 'd36a90c5294f483e4b44c353',
  'e8e08350c526b1f1a20c367b', '77b90257fde5a613b2aa81f9', '0fd452e3d6de46fb49d3b42d', '9e949882a33df65270257c2a',
  'a43328b3b9054d55663036b1', 'f29709e2dafab5650ca3c233', '5c8768a312b02d03298cd7f8', 'b1fc68d110f17506fe41eb4c',
  'c6c60829aef101ef48d008f3', 'fcff3a16a764cafb68722d29', '2a990d54fba9fe5d9652d694', 'd03e86a95c3b32376df52ce5',
  '9b962b8da1f7c570973c31a3', '7598c277b0ca0c2b6f6e981d', 'b05456323f534e8036e03faf', '2f038e6d0ec43a948c5407a4',
  '51ac655208abb1494f870349', 'ec001301d3d2497dc07ac4f0', '62d4a68aca07ae0f62f5041f', '833f12069db084a695ccc751',
  '66e9136618e68bad4e65d48b', '2cce22508cba204bc0531670', '5278d3303a92e273257322d2', '8ab6efbd9a2a7d0fff672d03'
];
const sourceArtifactHashes = {
  evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
  objectivesSha256: hashFile('content/standards/objectives.json'),
  sourceRegistrySha256: hashFile('content/standards/source-registry.json'),
  officialBoundarySnapshotSha256: sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`)
};

const dossierDoc = readJson('content/standards/evidence-dossiers.json');
const dossierByEdge = new Map(dossierDoc.dossiers.map((dossier) => [dossier.edgeId, dossier]));
const dossiers = selectedEdgeIds.map((edgeId) => dossierByEdge.get(edgeId));

if (dossiers.some((dossier) => !dossier
  || dossier.framework !== 'CCSS-MATH'
  || dossier.candidateCode !== 'HSF'
  || dossier.review?.status !== 'candidate')) {
  throw new Error('At least one locked CCSS-MATH|HSF edge is missing, out of scope, or no longer an open candidate');
}

const courseCounts = Object.fromEntries(
  [...new Set(dossiers.map((dossier) => dossier.courseId))]
    .map((courseId) => [courseId, dossiers.filter((dossier) => dossier.courseId === courseId).length])
);
const expectedCourseCounts = {
  'functions-and-sequences': 12,
  'linear-functions': 12,
  quadratics: 11,
  'function-transformations': 5
};
if (JSON.stringify(courseCounts) !== JSON.stringify(expectedCourseCounts)) {
  throw new Error(`Unexpected bounded selection: ${JSON.stringify(courseCounts)}`);
}

function lessonPath(courseId, lessonId) {
  return `content/courses/${courseId}/lessons/${lessonId}.json`;
}

function likelyReplacementFamilies(courseId) {
  if (courseId === 'functions-and-sequences') return ['HSF.IF', 'HSF.BF', 'HSF.LE'];
  if (courseId === 'linear-functions') return ['HSF.IF', 'HSF.LE', 'HSA.CED', 'HSA.REI', 'HSG.GPE'];
  if (courseId === 'quadratics') return ['HSF.IF', 'HSF.BF', 'HSA.SSE', 'HSA.REI', 'HSA.APR'];
  return ['HSF.BF', 'HSF.IF'];
}

const records = dossiers.map((dossier) => {
  const independentPracticeSteps = dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length;
  const transferTaggedSteps = dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length;
  const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
    const relativePath = lessonPath(dossier.courseId, lessonId);
    if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Missing lesson source: ${relativePath}`);
    return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
  }));
  const core = {
    edgeId: dossier.edgeId,
    decision: 'rejected',
    reviewer,
    reviewedAt,
    notes: `Reject the ${dossier.objectiveId} -> HSF edge because HSF is the Functions domain locator, not an exact Common Core standard. Current evidence for “${dossier.objectiveTitle}” must be remapped and reviewed against one or more exact descendant standards; this rejection does not reject that narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null,
    officialTextSnapshot,
    officialSourceUrl,
    claimBoundary: 'This decision rejects only the coarse HSF domain-level edge. It makes no approval or rejection claim for any exact HSF.BF, HSF.IF, HSF.LE, HSF.TF, HSA, or HSG descendant standard.',
    dossierHash: candidateDossierHash(dossier),
    candidateCode: dossier.candidateCode,
    officialSourceBoundary,
    officialSourceBoundaryHash: sourceArtifactHashes.officialBoundarySnapshotSha256,
    sourceArtifactHashes,
    evidenceSnapshot: {
      objectiveId: dossier.objectiveId,
      objectiveTitle: dossier.objectiveTitle,
      courseId: dossier.courseId,
      gradeLevel: dossier.gradeLevel,
      lessonIds: dossier.evidenceSummary.lessonIds,
      stepEvidenceCount: dossier.stepEvidence.length,
      independentPracticeStepCount: independentPracticeSteps,
      transferTaggedStepCount: transferTaggedSteps,
      transferEvidenceUsed: false,
      lessonSourceHashes
    },
    evidenceGaps: [
      'The candidate locator HSF names a domain and supplies no exact assessable standard action, conditions, representations, or limits.',
      'A full-intent comparison cannot close until the objective is mapped to an exact descendant standard such as HSF.IF.A.2 or HSF.BF.A.2.',
      'The single-objective lesson evidence cannot establish alignment to the complete HSF domain, which spans interpreting, building, modeling, and trigonometric functions.',
      'Dossier challenge/transfer tags are metadata only here; they were not used to infer transfer or mastery.'
    ],
    replacementReview: {
      required: true,
      candidateFamiliesOnly: likelyReplacementFamilies(dossier.courseId),
      boundary: 'Candidate families are routing hints, not signed standards decisions. Exact standard text and full lesson evidence require a new review.'
    }
  };
  return { ...core, signature: sha256(JSON.stringify(core)) };
});

fs.mkdirSync(path.dirname(path.join(root, outputPath)), { recursive: true });
fs.writeFileSync(path.join(root, outputPath), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
console.log(`wrote ${records.length} signed isolated HSF decisions to ${outputPath}`);
