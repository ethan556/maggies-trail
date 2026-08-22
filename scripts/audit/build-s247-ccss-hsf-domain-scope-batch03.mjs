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

const outputPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH03.jsonl';
const reportPath = 'reports/standards/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH03_DELTA.md';
const reviewedAt = '2026-08-18T19:30:00.000Z';
const reviewer = 'chatgpt-work-s247-standards-assurance-hsf-batch03';
const officialSourceUrl = 'https://www.thecorestandards.org/Math/Content/HSF/';
const officialSourceBoundary = 'High School: Functions > Standards in this domain';
const officialPdfUrl = 'https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf';
const officialPdfBoundary = 'High School — Functions, printed pages 67–73';
const officialTextSnapshot = 'Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.';
const selectedEdgeIds = [
  'eda350ff6ac300c4442aaf83', '745b7633aad0295e9659c1f5', 'f739c3282cb842973ed0d2d4', '976c890370454c107b87a2ed',
  'ba63ef35a342756edb7efc99', '5f4c7dca2f6a60056d0a6933', '56ec46f5fed873864d43b5d4', 'ea5ac29ebbb7a1d24f1ccb93',
  '4c712f60fa74a2f1fadf1535', '75f7c440a83d45d8e2e60756', '077254a4f04c6920d4af011c', '317b642312e6170b283b1230',
  '49e286e269566bfa1d8f714a', '729bb36a9d648f05892046f0', '302a5e9ff30e7b8cd85dd929', '54a95ecc5070b7b061e19207',
  'e915a4335d0d2289e90b0fa0', '8b3c70cd1f6405d373766f9b', 'd48f65975ba7b80bf9dfe5c4', 'a22e6dc347cf993822f4a53c',
  'f7c168d3727a1c72554d1235', '74b7103b2ac20b7362de34b0', '7e397ae541ec0f65a6961767', '965f61ac5ab734d4b4120a44',
  'bce7bec05fc719018490ae7f', 'bbe59d5776bbaf48d04b8e33', '6caa970bf8a06df4f3a761d4', '6ccb72f87b71fcd7bb63d6bd',
  '10e6d7dc9ace1968545d00a1', '18127ed225833f08885fcab0', '0e5657c7536c12848b8a26b3', 'c563dafd1d8524b62667493b',
  'c3585914a99519e7dfb5ccb7', '2992ceb45ce39858f9d52131', 'feec88b335313c562e7e5b3b', '3aea8ec15a01f4bf351d2dc9',
  '6fc6c389dc1f187975478dc1', '00943cf1944c9696aac8a38e', '388d3010657320b5491d4e63', 'c8ded0fc395a41074f243819'
];

const sourceArtifactHashes = {
  evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
  objectivesSha256: hashFile('content/standards/objectives.json'),
  sourceRegistrySha256: hashFile('content/standards/source-registry.json'),
  officialBoundarySnapshotSha256: sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`),
  officialPdfBoundarySha256: sha256(`${officialPdfUrl}|${officialPdfBoundary}|${officialTextSnapshot}`)
};

const dossierDoc = readJson('content/standards/evidence-dossiers.json');
const openHsf = dossierDoc.dossiers.filter((dossier) => dossier.framework === 'CCSS-MATH'
  && dossier.candidateCode === 'HSF'
  && dossier.review?.status === 'candidate');
if (openHsf.length !== 169) throw new Error(`Expected 169 post-batch-02 HSF candidates, found ${openHsf.length}`);
if (JSON.stringify(openHsf.slice(0, 40).map((dossier) => dossier.edgeId)) !== JSON.stringify(selectedEdgeIds)) {
  throw new Error('Locked batch 03 is no longer the next 40 open CCSS-MATH|HSF edges');
}

const globalDecisions = readJson('content/standards/human-review-decisions.json').decisions;
const globallyDecided = new Set(globalDecisions.map((decision) => decision.edgeId));
if (selectedEdgeIds.some((edgeId) => globallyDecided.has(edgeId))) throw new Error('Batch 03 overlaps the shared standards ledger');

const dossierByEdge = new Map(dossierDoc.dossiers.map((dossier) => [dossier.edgeId, dossier]));
const dossiers = selectedEdgeIds.map((edgeId) => dossierByEdge.get(edgeId));
const expectedCourseCounts = { 'trig-functions': 11, 'conic-sections': 16, 'function-analysis': 13 };
const courseCounts = dossiers.reduce((counts, dossier) => ({
  ...counts,
  [dossier.courseId]: (counts[dossier.courseId] ?? 0) + 1
}), {});
if (JSON.stringify(courseCounts) !== JSON.stringify(expectedCourseCounts)) {
  throw new Error(`Unexpected course partition: ${JSON.stringify(courseCounts)}`);
}

const routing = (courseId) => {
  if (courseId === 'trig-functions') return ['HSF.TF', 'HSG.C'];
  if (courseId === 'conic-sections') return ['HSG.GPE', 'HSG.C', 'HSA.REI', 'HSA.CED'];
  return ['HSF.IF', 'HSF.BF'];
};

const records = dossiers.map((dossier) => {
  const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
    const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
    if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Missing lesson source ${relativePath}`);
    return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
  }));
  const core = {
    edgeId: dossier.edgeId,
    decision: 'rejected',
    reviewer,
    reviewedAt,
    notes: `Reject the ${dossier.objectiveId} -> HSF edge because HSF is the Functions domain locator, not an exact Common Core standard. Current evidence for “${dossier.objectiveTitle}” requires remapping and review against exact descendant text; this rejection does not reject narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null,
    officialTextSnapshot,
    officialSourceUrl,
    claimBoundary: 'This decision rejects only the coarse HSF domain-level edge. It makes no approval or rejection claim for any exact HSF.BF, HSF.IF, HSF.LE, HSF.TF, HSA, or HSG descendant standard.',
    dossierHash: candidateDossierHash(dossier),
    candidateCode: 'HSF',
    officialSourceBoundary,
    officialSourceBoundaryHash: sourceArtifactHashes.officialBoundarySnapshotSha256,
    officialPdfUrl,
    officialPdfBoundary,
    officialPdfBoundaryHash: sourceArtifactHashes.officialPdfBoundarySha256,
    sourceArtifactHashes,
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
      lessonSourceHashes
    },
    evidenceGaps: [
      'The candidate locator HSF names a domain and supplies no exact assessable standard action, conditions, representations, or limits.',
      'Full-intent comparison cannot close until the objective is mapped to an exact descendant standard and compared with its complete official wording.',
      'The bounded lesson evidence cannot establish alignment to the complete HSF domain across interpreting, building, modeling, and trigonometric functions.',
      'Dossier challenge/transfer tags were not used to infer transfer or mastery.'
    ],
    replacementReview: {
      required: true,
      candidateFamiliesOnly: routing(dossier.courseId),
      boundary: 'Routing hints only; not signed alignment claims. Exact standard text and full lesson evidence require a new review.'
    },
    deltaFromBatch02: {
      priorIntegratedRejectedEdges: 80,
      priorPacketSha256: hashFile('reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02.jsonl'),
      remainingHsfCandidatesBeforeBatch03: openHsf.length
    }
  };
  return { ...core, signature: sha256(JSON.stringify(core)) };
});

fs.writeFileSync(path.join(root, outputPath), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
const packetSha256 = hashFile(outputPath);
const sample = [...records]
  .sort((a, b) => sha256(`${sourceArtifactHashes.evidenceDossiersSha256}|batch03|${a.edgeId}`)
    .localeCompare(sha256(`${sourceArtifactHashes.evidenceDossiersSha256}|batch03|${b.edgeId}`)))
  .slice(0, 8);
const rows = records.map((record) => `| \`${record.edgeId}\` | \`${record.evidenceSnapshot.objectiveId}\` | \`${record.evidenceSnapshot.courseId}\` | ${record.evidenceSnapshot.lessonIds.map((id) => `\`${id}\``).join(', ')} | \`${record.dossierHash}\` | ${record.replacementReview.candidateFamiliesOnly.map((family) => `\`${family}\``).join(', ')} |`);
const report = `# S247 Common Core HSF domain-scope assurance — batch 03 delta

Date: 2026-08-18
Portfolio: \`CCSS-MATH|HSF\`
Scope: next 40 post-batch-02 candidate edges only
Verdict: **40 isolated, canonical, signed \`rejected\` candidates; not appended**

## Delta

| Measure | After integrated batches 01–02 | Batch 03 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 80 | +40 | 120 of 249 |
| HSF coarse edges still candidate | 169 | −40 | 129 |
| Cumulative portfolio completion | 32.13% | +16.06 points | 48.19% |
| Authoritative shared decisions | 82 | unchanged | 122 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 03.

## Reused official source contract

No source refetch or new summary was performed. Batch 03 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](${officialSourceUrl}), boundary \`Standards in this domain\`.
- Official accessible PDF: [Common Core Mathematics Standards](${officialPdfUrl}), boundary \`High School — Functions\`, printed pages 67–73.
- Signed compact snapshot: “${officialTextSnapshot}”
- Web boundary SHA-256: \`${sourceArtifactHashes.officialBoundarySnapshotSha256}\`.
- PDF boundary SHA-256: \`${sourceArtifactHashes.officialPdfBoundarySha256}\`.

The authority boundary establishes that \`HSF\` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Every descendant alignment remains unreviewed and open.

## Current source seals

- Evidence dossiers: \`${sourceArtifactHashes.evidenceDossiersSha256}\`
- Objectives: \`${sourceArtifactHashes.objectivesSha256}\`
- Source registry: \`${sourceArtifactHashes.sourceRegistrySha256}\`
- Batch 02 packet: \`${records[0].deltaFromBatch02.priorPacketSha256}\`
- Batch 03 packet: \`${packetSha256}\`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

- Trigonometric functions: 11 edges.
- Conic sections: 16 edges.
- Function analysis: 13 edges.

| Edge ID | Objective | Course | Lesson evidence | Current dossier SHA-256 | Replacement routing only |
|---|---|---|---|---|---|
${rows.join('\n')}

## Decision and evidence boundary

All 40 records apply the same four contractual gaps:

1. \`HSF\` has no exact assessable action, conditions, representations, or limits.
2. Full-intent review requires an exact descendant code and its complete official wording.
3. The bounded lesson evidence cannot establish the entire HSF domain.
4. Challenge/transfer tags were not used to infer transfer or mastery.

Candidate replacement families are routing hints, not signed descendant mappings.

## Validation

- Strict full packet: **40/40 PASS**.
- Shared-ledger overlap: **0**.
- Live candidate state and current dossier hashes: **40/40 PASS**.
- Signatures and web/PDF authority seals: **40/40 PASS**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: ${sample.map((record) => `\`${record.edgeId}\``).join(', ')}.

Run: \`node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch03.mjs\`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
`;
fs.writeFileSync(path.join(root, reportPath), report);
console.log(JSON.stringify({ records: records.length, courseCounts, sharedLedgerOverlap: 0, projectedRemainingHsfCandidates: openHsf.length - records.length, packetSha256 }, null, 2));
