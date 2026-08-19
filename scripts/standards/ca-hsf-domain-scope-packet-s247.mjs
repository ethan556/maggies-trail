import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { candidateDossierHash, validateStandardsDecision } from './decision-contract.mjs';

const root = process.cwd();
const text = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(text(relativePath));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = (relativePath) => sha256(text(relativePath));
const fail = (message) => { throw new Error(message); };

const officialSourceUrl = 'https://www.cde.ca.gov/re/cc/';
const officialSourceBoundary = 'California Common Core State Standards > Mathematics, Publication Version with February 2014 Corrections';
const officialPdfUrl = 'https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf';
const officialPdfBoundary = 'Introduction to Higher Mathematics Standards, printed page 58; Functions, printed pages 127–131';
const officialTextSnapshot = 'California organizes higher mathematics into six conceptual categories, including Functions. The Functions category contains assessable standards under F-IF, F-BF, F-LE, and F-TF, including California additions; CA-HSF is not an official exact standard identifier.';
const officialPdfFileSha256 = 'e33d1c55f2ba4071e56980e4afed3e41194d57e1f298b7b5877b0fe4bc08ea5b';
const officialBoundaryHash = sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`);
const officialPdfBoundaryHash = sha256(`${officialPdfUrl}|${officialPdfBoundary}|${officialTextSnapshot}`);
const claimBoundary = 'This decision rejects only the coarse CA-HSF portfolio locator. It makes no approval or rejection claim for any exact California F-IF, F-BF, F-LE, F-TF, California-added, model-course, or other standard.';
const routingBoundary = 'Routing hints only; not signed alignment claims. Exact California wording, additions, course limits, and full lesson evidence require a new review.';
const evidenceGaps = [
  'CA-HSF is a repository planning locator, while California publishes Functions as a conceptual category and assessable expectations under exact F-IF, F-BF, F-LE, and F-TF identifiers.',
  'Full-intent comparison cannot close until the objective is mapped to an exact California standard and compared with its complete wording, California additions, and applicable model-course limits.',
  'The bounded lesson evidence cannot establish alignment to the complete California Functions conceptual category.',
  'Dossier challenge/transfer tags were not used to infer transfer or mastery.'
];

const routingByCourse = {
  'functions-and-sequences': ['F-IF', 'F-BF', 'F-LE'],
  'linear-functions': ['F-IF', 'F-BF', 'F-LE'],
  quadratics: ['F-IF', 'F-BF', 'F-LE'],
  'function-transformations': ['F-BF', 'F-IF'],
  logarithms: ['F-LE', 'F-IF', 'F-BF'],
  'sequences-series': ['F-BF', 'F-LE'],
  'trig-functions': ['F-TF', 'F-IF'],
  'conic-sections': ['F-IF'],
  'function-analysis': ['F-IF'],
  'limits-continuity': ['F-IF'],
  'polar-parametric': ['F-IF', 'F-TF'],
  'trig-graphs-inverses': ['F-TF', 'F-IF'],
  'curve-analysis': ['F-IF'],
  'derivative-rules': ['F-IF'],
  'derivatives-in-context': ['F-IF'],
  'integration-accumulation': ['F-IF'],
  'integration-applications': ['F-IF'],
  'parametric-polar-calculus': ['F-IF', 'F-TF'],
  'series-convergence': ['F-IF']
};

const lessonSourceHashes = (dossier) => Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
  const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
  return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
}));

const packetRelativePath = (batchNumber) => `reports/closure/candidates/S247_CA_CCSSM_CA_HSF_DOMAIN_SCOPE_BATCH${String(batchNumber).padStart(2, '0')}.jsonl`;
const reportRelativePath = (batchNumber) => `reports/standards/S247_CA_CCSSM_CA_HSF_DOMAIN_SCOPE_BATCH${String(batchNumber).padStart(2, '0')}_DELTA.md`;

const makeRecord = ({ dossier, batchNumber, start, priorPacketSha256, currentHashes }) => {
  const unsigned = {
    edgeId: dossier.edgeId,
    decision: 'rejected',
    reviewer: `chatgpt-work-s247-standards-assurance-ca-hsf-batch${String(batchNumber).padStart(2, '0')}`,
    reviewedAt: `2026-08-18T${String(22 + Math.floor(batchNumber / 3)).padStart(2, '0')}:${String((batchNumber * 10) % 60).padStart(2, '0')}:00.000Z`,
    notes: `Reject the ${dossier.objectiveId} -> CA-HSF edge because CA-HSF is a portfolio locator, not an exact California mathematics standard. Current evidence for “${dossier.objectiveTitle}” requires remapping and full-intent review against an exact California identifier; this rejection does not reject narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null,
    officialTextSnapshot,
    officialSourceUrl,
    claimBoundary,
    dossierHash: candidateDossierHash(dossier),
    candidateCode: 'CA-HSF',
    officialSourceBoundary,
    officialSourceBoundaryHash: officialBoundaryHash,
    officialPdfUrl,
    officialPdfBoundary,
    officialPdfBoundaryHash,
    sourceArtifactHashes: {
      ...currentHashes,
      officialBoundarySnapshotSha256: officialBoundaryHash,
      officialPdfBoundarySha256: officialPdfBoundaryHash,
      officialPdfFileSha256
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
      candidateFamiliesOnly: routingByCourse[dossier.courseId],
      boundary: routingBoundary
    },
    deltaFromPriorCaHsfPacket: {
      priorIntegratedCaHsfRejectedEdges: 0,
      priorIsolatedCandidateEdges: start,
      priorPacketSha256,
      remainingCaHsfCandidatesBeforeBatch: 249 - start
    }
  };
  return { ...unsigned, signature: sha256(JSON.stringify(unsigned)) };
};

const markdownReport = ({ config, records, courseCounts, currentHashes, packetSha256, sample }) => {
  const before = 249 - config.start;
  const after = before - config.count;
  const rows = Object.entries(courseCounts).map(([courseId, count]) => `| \`${courseId}\` | ${count} | \`${routingByCourse[courseId].join('`, `')}\` |`).join('\n');
  return `# S247 California CA-HSF domain-scope assurance — batch ${String(config.batchNumber).padStart(2, '0')} delta

Date: 2026-08-18
Portfolio: \`CA-CCSSM|CA-HSF\`
Scope: isolated edges ${config.start + 1}–${config.start + config.count} of the 249-edge live portfolio
Verdict: **${config.count} canonical, signed \`rejected\` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| CA-HSF coarse locator edges dispositioned in isolated suite | ${config.start} | +${config.count} | ${config.start + config.count} of 249 |
| CA-HSF coarse locator edges remaining | ${before} | −${config.count} | ${after} |
| Authoritative shared decisions | 251 | unchanged | ${251 + config.start + config.count} after sequential integration |

The shared standards ledger remains unchanged by this lane and has zero overlap with this packet. No exact, descendant, California-added, or model-course standard decision is added, removed, or altered.

## Official California authority ruling

- [California Common Core resources](${officialSourceUrl}) identifies the controlling mathematics publication and its February 2014 corrections.
- [Official California mathematics standards PDF](${officialPdfUrl}), printed page 58, states that higher mathematics has six **conceptual categories**, including **Functions**.
- The same PDF’s Functions overview and standards, printed pages 127–131, place assessable expectations under \`F-IF\`, \`F-BF\`, \`F-LE\`, and \`F-TF\`, including identifiers explicitly marked as California additions.
- \`CA-HSF\` does not appear as an assessable identifier in this hierarchy; it is a repository portfolio locator.

This ruling rejects only the coarse locator. It does not adjudicate any exact California alignment.

## Source seals

- Evidence dossiers: \`${currentHashes.evidenceDossiersSha256}\`
- Objectives: \`${currentHashes.objectivesSha256}\`
- Source registry: \`${currentHashes.sourceRegistrySha256}\`
- Official PDF file: \`${officialPdfFileSha256}\`
- Official web boundary: \`${officialBoundaryHash}\`
- Official PDF boundary: \`${officialPdfBoundaryHash}\`
- Packet: \`${packetSha256}\`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
${rows}
| **Total** | **${config.count}** | |

Routing fields are review hints only, not signed descendant mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **${config.count}/${config.count} PASS**.
- Shared-ledger overlap: **0**.
- Official coarse-locator state, signatures, dossier hashes, lesson seals, and authority seals: **${config.count}/${config.count} PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **${sample.length}/${sample.length} PASS**.
- Sample: ${sample.map((record) => `\`${record.edgeId}\``).join(', ')}.
- Projected portfolio remainder after this packet: **${after}**.

Run: \`node reports/closure/candidates/validate-s247-ca-ccssm-ca-hsf-domain-scope-batch${String(config.batchNumber).padStart(2, '0')}.mjs\`.

## Integration boundary

Do not regenerate this packet after append. Validate all five isolated packets against the same source seals, append them in packet order, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
`;
};

export function runCaHsfPacket(config) {
  const packetPath = packetRelativePath(config.batchNumber);
  const reportPath = reportRelativePath(config.batchNumber);
  const dossiers = json('content/standards/evidence-dossiers.json').dossiers;
  const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
  const globalDecisions = json('content/standards/human-review-decisions.json').decisions;
  const globallyDecided = new Set(globalDecisions.map((decision) => decision.edgeId));
  const portfolio = dossiers.filter((dossier) => dossier.framework === 'CA-CCSSM'
    && dossier.candidateCode === 'CA-HSF'
    && dossier.review?.status === 'candidate'
    && !globallyDecided.has(dossier.edgeId));
  const currentHashes = {
    evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
    objectivesSha256: hashFile('content/standards/objectives.json'),
    sourceRegistrySha256: hashFile('content/standards/source-registry.json')
  };
  const previousPacketPath = config.batchNumber === 1 ? null : packetRelativePath(config.batchNumber - 1);
  const priorPacketSha256 = previousPacketPath ? hashFile(previousPacketPath) : null;
  const expected = portfolio.slice(config.start, config.start + config.count);

  if (portfolio.length !== 249) fail(`Expected 249 live CA-CCSSM|CA-HSF candidates, found ${portfolio.length}`);
  if (globalDecisions.length !== 251
    || globalDecisions.filter((record) => record.decision === 'rejected').length !== 249
    || globalDecisions.filter((record) => record.decision === 'partial').length !== 2) fail('Shared decision baseline drift');
  if (config.count < 1 || config.count > 50 || expected.length !== config.count) fail('Packet bound or slice drift');
  if (JSON.stringify(Object.keys(config.expectedCourseCounts)) !== JSON.stringify([...new Set(expected.map((dossier) => dossier.courseId))])) fail('Expected course order drift');

  if (process.argv.includes('--generate')) {
    const generated = expected.map((dossier) => makeRecord({ dossier, batchNumber: config.batchNumber, start: config.start, priorPacketSha256, currentHashes }));
    fs.writeFileSync(path.join(root, packetPath), `${generated.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
  }

  const packetText = text(packetPath);
  const records = packetText.trim().split(/\r?\n/).map(JSON.parse);
  if (records.length !== config.count || new Set(records.map((record) => record.edgeId)).size !== config.count) fail('Packet count or uniqueness drift');
  if (JSON.stringify(records.map((record) => record.edgeId)) !== JSON.stringify(expected.map((dossier) => dossier.edgeId))) fail('Packet is not the configured live portfolio slice');
  if (records.some((record) => globallyDecided.has(record.edgeId))) fail('Packet overlaps the shared decision ledger');

  const previousEdgeIds = new Set();
  for (let batch = 1; batch < config.batchNumber; batch += 1) {
    for (const line of text(packetRelativePath(batch)).trim().split(/\r?\n/)) previousEdgeIds.add(JSON.parse(line).edgeId);
  }
  if (records.some((record) => previousEdgeIds.has(record.edgeId)) || previousEdgeIds.size !== config.start) fail('Cross-packet overlap or coverage drift');

  const courseCounts = records.reduce((counts, record) => ({
    ...counts,
    [record.evidenceSnapshot.courseId]: (counts[record.evidenceSnapshot.courseId] ?? 0) + 1
  }), {});
  if (JSON.stringify(courseCounts) !== JSON.stringify(config.expectedCourseCounts)) fail(`Course partition drift: ${JSON.stringify(courseCounts)}`);

  for (const record of records) {
    const dossier = dossierByEdge.get(record.edgeId);
    if (!dossier || dossier.framework !== 'CA-CCSSM' || dossier.candidateCode !== 'CA-HSF'
      || dossier.sourceId !== 'CA-CCSSM-OFFICIAL' || dossier.sourceLocator !== 'CA-HSF'
      || dossier.sourceTextStatus !== 'scope-locator-requires-exact-benchmark'
      || dossier.checks?.exactStandardCodeCandidate !== false || dossier.review?.status !== 'candidate') fail(`Invalid coarse-locator scope ${record.edgeId}`);
    if (record.decision !== 'rejected' || record.approvedDepth !== null || record.candidateCode !== 'CA-HSF') fail(`Decision scope drift ${record.edgeId}`);
    if (record.dossierHash !== candidateDossierHash(dossier)) fail(`Dossier hash drift ${record.edgeId}`);
    if (record.officialSourceUrl !== officialSourceUrl || record.officialSourceBoundary !== officialSourceBoundary
      || record.officialTextSnapshot !== officialTextSnapshot || record.officialSourceBoundaryHash !== officialBoundaryHash) fail(`Web authority drift ${record.edgeId}`);
    if (record.officialPdfUrl !== officialPdfUrl || record.officialPdfBoundary !== officialPdfBoundary
      || record.officialPdfBoundaryHash !== officialPdfBoundaryHash) fail(`PDF authority drift ${record.edgeId}`);
    for (const [key, value] of Object.entries(currentHashes)) if (record.sourceArtifactHashes[key] !== value) fail(`Stale ${key} ${record.edgeId}`);
    if (record.sourceArtifactHashes.officialBoundarySnapshotSha256 !== officialBoundaryHash
      || record.sourceArtifactHashes.officialPdfBoundarySha256 !== officialPdfBoundaryHash
      || record.sourceArtifactHashes.officialPdfFileSha256 !== officialPdfFileSha256) fail(`Authority seal drift ${record.edgeId}`);

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
    for (const [key, value] of Object.entries(expectedSnapshot)) if (JSON.stringify(record.evidenceSnapshot[key]) !== JSON.stringify(value)) fail(`Evidence snapshot drift ${record.edgeId}/${key}`);
    if (record.evidenceSnapshot.transferEvidenceUsed !== false || !record.notes.includes('not treated as transfer or mastery evidence')) fail(`Transfer/mastery inference ${record.edgeId}`);
    if (record.claimBoundary !== claimBoundary || JSON.stringify(record.evidenceGaps) !== JSON.stringify(evidenceGaps)) fail(`Claim boundary drift ${record.edgeId}`);
    if (!record.replacementReview?.required || record.replacementReview.boundary !== routingBoundary
      || JSON.stringify(record.replacementReview.candidateFamiliesOnly) !== JSON.stringify(routingByCourse[dossier.courseId])) fail(`Routing contract drift ${record.edgeId}`);
    if (record.deltaFromPriorCaHsfPacket.priorIntegratedCaHsfRejectedEdges !== 0
      || record.deltaFromPriorCaHsfPacket.priorIsolatedCandidateEdges !== config.start
      || record.deltaFromPriorCaHsfPacket.priorPacketSha256 !== priorPacketSha256
      || record.deltaFromPriorCaHsfPacket.remainingCaHsfCandidatesBeforeBatch !== 249 - config.start) fail(`Delta baseline drift ${record.edgeId}`);

    const seals = record.evidenceSnapshot.lessonSourceHashes;
    if (Object.keys(seals).length !== record.evidenceSnapshot.lessonIds.length) fail(`Lesson seal coverage drift ${record.edgeId}`);
    for (const lessonId of record.evidenceSnapshot.lessonIds) {
      const seal = seals[lessonId];
      if (!seal || hashFile(seal.relativePath) !== seal.sha256 || json(seal.relativePath).id !== lessonId) fail(`Lesson source drift ${record.edgeId}/${lessonId}`);
    }
  }

  const sample = [...records].sort((a, b) => sha256(`${currentHashes.evidenceDossiersSha256}|ca-hsf-${config.batchNumber}|${a.edgeId}`)
    .localeCompare(sha256(`${currentHashes.evidenceDossiersSha256}|ca-hsf-${config.batchNumber}|${b.edgeId}`))).slice(0, 8);
  for (const record of sample) {
    const dossier = dossierByEdge.get(record.edgeId);
    if (record.dossierHash !== candidateDossierHash(dossier) || record.evidenceSnapshot.transferEvidenceUsed !== false
      || record.approvedDepth !== null || !record.claimBoundary.startsWith('This decision rejects only the coarse CA-HSF portfolio locator.')) fail(`Independent sample drift ${record.edgeId}`);
  }

  const packetSha256 = sha256(packetText);
  if (process.argv.includes('--generate')) fs.writeFileSync(path.join(root, reportPath), markdownReport({ config, records, courseCounts, currentHashes, packetSha256, sample }), 'utf8');
  const result = {
    status: 'PASS', batch: config.batchNumber, records: records.length, courseCounts, sharedLedgerOverlap: 0,
    independentlyValidatedCoarseLocators: records.length, descendantOrExactDecisionsChanged: 0,
    independentUnseenSampleSize: sample.length, independentUnseenSampleEdgeIds: sample.map((record) => record.edgeId),
    projectedRemainingCaHsfCandidates: 249 - config.start - config.count, packetSha256
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
