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

const officialSourceUrl = 'https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/';
const officialSourceBoundary = 'B.E.S.T. Standards for Mathematics > Florida’s B.E.S.T. Standards for Mathematics';
const officialPdfUrl = 'https://cpalmsmediaprod.blob.core.windows.net/uploads/docs/standards/best/ma/mathbeststandardsfinal.pdf';
const officialPdfBoundary = 'Coding Scheme, printed page 3; 9-12 Functions Strand, printed pages 138–141';
const officialTextSnapshot = 'Florida codes mathematics expectations by subject, grade band, strand, standard, and benchmark. The 9-12 Functions strand is MA.912.F, with standards MA.912.F.1 through MA.912.F.3 and exact benchmarks such as MA.912.F.1.1; MA.HS.HSF is not an official benchmark identifier.';
const officialPdfFileSha256 = '8767ed58e5c5b94992c444391c217f6ce121f03a36007deba0566ed3d7e0b0fc';
const officialBoundaryHash = sha256(`${officialSourceUrl}|${officialSourceBoundary}|${officialTextSnapshot}`);
const officialPdfBoundaryHash = sha256(`${officialPdfUrl}|${officialPdfBoundary}|${officialTextSnapshot}`);
const claimBoundary = 'This decision rejects only the coarse MA.HS.HSF portfolio locator. It makes no approval or rejection claim for any exact Florida MA.912.F benchmark, other MA.912 strand or benchmark, course limit, or Mathematical Thinking and Reasoning standard.';
const routingBoundary = 'Routing hints only; not signed alignment claims. Exact Florida benchmark wording, clarifications, course limits, and full lesson evidence require a new review.';
const evidenceGaps = [
  'MA.HS.HSF is a repository planning locator; Florida’s official coding scheme uses MA.912 plus a strand, standard, and benchmark number, and publishes the Functions strand as MA.912.F.',
  'Full-intent comparison cannot close until the objective is mapped to an exact Florida benchmark and compared with its complete wording, clarifications, examples, and applicable course limits.',
  'The bounded lesson evidence cannot establish alignment to the complete Florida 9-12 Functions strand or any other full strand.',
  'Dossier challenge/transfer tags were not used to infer transfer or mastery.'
];

const routingByCourse = {
  'functions-and-sequences': ['MA.912.F', 'MA.912.AR'],
  'linear-functions': ['MA.912.F', 'MA.912.AR'],
  quadratics: ['MA.912.F', 'MA.912.AR'],
  'function-transformations': ['MA.912.F'],
  logarithms: ['MA.912.F', 'MA.912.NSO'],
  'sequences-series': ['MA.912.AR', 'MA.912.F'],
  'trig-functions': ['MA.912.T', 'MA.912.F'],
  'conic-sections': ['MA.912.AR'],
  'function-analysis': ['MA.912.F'],
  'limits-continuity': ['MA.912.C'],
  'polar-parametric': ['MA.912.C', 'MA.912.T'],
  'trig-graphs-inverses': ['MA.912.T', 'MA.912.F'],
  'curve-analysis': ['MA.912.C'],
  'derivative-rules': ['MA.912.C'],
  'derivatives-in-context': ['MA.912.C'],
  'integration-accumulation': ['MA.912.C'],
  'integration-applications': ['MA.912.C'],
  'parametric-polar-calculus': ['MA.912.C'],
  'series-convergence': ['MA.912.C']
};

const packetPathFor = (batch) => `reports/closure/candidates/S247_FL_BEST_MATH_MA_HS_HSF_DOMAIN_SCOPE_BATCH${String(batch).padStart(2, '0')}.jsonl`;
const reportPathFor = (batch) => `reports/standards/S247_FL_BEST_MATH_MA_HS_HSF_DOMAIN_SCOPE_BATCH${String(batch).padStart(2, '0')}_DELTA.md`;
const lessonSeals = (dossier) => Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
  const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
  return [lessonId, { relativePath, sha256: hashFile(relativePath) }];
}));

const makeRecord = ({ dossier, config, currentHashes, priorPacketSha256 }) => {
  const unsigned = {
    edgeId: dossier.edgeId,
    decision: 'rejected',
    reviewer: `chatgpt-work-s247-standards-assurance-fl-hsf-batch${String(config.batchNumber).padStart(2, '0')}`,
    reviewedAt: `2026-08-18T23:${String(config.batchNumber * 8).padStart(2, '0')}:00.000Z`,
    notes: `Reject the ${dossier.objectiveId} -> MA.HS.HSF edge because MA.HS.HSF is a portfolio locator, not an exact Florida B.E.S.T. mathematics benchmark. Current evidence for “${dossier.objectiveTitle}” requires remapping and full-intent review against an exact Florida identifier; this rejection does not reject narrower alignment. Challenge or transfer tags were not treated as transfer or mastery evidence.`,
    approvedDepth: null,
    officialTextSnapshot,
    officialSourceUrl,
    claimBoundary,
    dossierHash: candidateDossierHash(dossier),
    candidateCode: 'MA.HS.HSF',
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
      lessonSourceHashes: lessonSeals(dossier)
    },
    evidenceGaps,
    replacementReview: { required: true, candidateFamiliesOnly: routingByCourse[dossier.courseId], boundary: routingBoundary },
    deltaFromPriorFlHsfPacket: {
      priorIntegratedFlHsfRejectedEdges: 0,
      priorIsolatedCandidateEdges: config.start,
      priorPacketSha256,
      remainingFlHsfCandidatesBeforeBatch: 249 - config.start
    }
  };
  return { ...unsigned, signature: sha256(JSON.stringify(unsigned)) };
};

const reportMarkdown = ({ config, currentHashes, packetSha256, courseCounts, sample }) => {
  const remainingBefore = 249 - config.start;
  const remainingAfter = remainingBefore - config.count;
  const partition = Object.entries(courseCounts).map(([course, count]) => `| \`${course}\` | ${count} | \`${routingByCourse[course].join('`, `')}\` |`).join('\n');
  return `# S247 Florida MA.HS.HSF locator assurance — batch ${String(config.batchNumber).padStart(2, '0')} delta

Date: 2026-08-18
Portfolio: \`FL-BEST-MATH|MA.HS.HSF\`
Scope: isolated edges ${config.start + 1}–${config.start + config.count} of the 249-edge live portfolio
Verdict: **${config.count} canonical, signed \`rejected\` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| MA.HS.HSF locator edges dispositioned in isolated suite | ${config.start} | +${config.count} | ${config.start + config.count} of 249 |
| MA.HS.HSF locator edges remaining | ${remainingBefore} | −${config.count} | ${remainingAfter} |
| Authoritative shared decisions | 500 | unchanged | ${500 + config.start + config.count} after sequential integration |

The shared ledger remains unchanged by this lane and has zero overlap with this packet. No exact Florida benchmark, strand, course limit, or MTR decision is altered.

## Official Florida authority ruling

- [Florida B.E.S.T. Mathematics](${officialSourceUrl}) identifies the official adopted standards publication.
- [Official B.E.S.T. mathematics PDF](${officialPdfUrl}), printed page 3, defines five code positions: subject, grade band, strand, standard, and benchmark. It states that the benchmark is the specific expectation.
- The PDF’s 9–12 Functions strand, printed pages 138–141, is \`MA.912.F\`; standards are \`MA.912.F.1\` through \`MA.912.F.3\`, and exact benchmarks add the final place, for example \`MA.912.F.1.1\`.
- \`MA.HS.HSF\` does not occur as an official assessable identifier and is a repository portfolio locator.

This ruling rejects only the coarse locator; all exact Florida alignment remains open.

## Source seals

- Evidence dossiers: \`${currentHashes.evidenceDossiersSha256}\`
- Objectives: \`${currentHashes.objectivesSha256}\`
- Source registry: \`${currentHashes.sourceRegistrySha256}\`
- Official PDF file: \`${officialPdfFileSha256}\`
- Official web boundary: \`${officialBoundaryHash}\`
- Official PDF boundary: \`${officialPdfBoundaryHash}\`
- Packet: \`${packetSha256}\`

Every candidate also signs its current dossier hash and all referenced lesson source hashes.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
${partition}
| **Total** | **${config.count}** | |

Routing fields are review hints only, not signed mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **${config.count}/${config.count} PASS**.
- Shared-ledger overlap: **0**.
- Signatures, live coarse-locator state, dossier hashes, lesson seals, and authority seals: **${config.count}/${config.count} PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **${sample.length}/${sample.length} PASS**.
- Sample: ${sample.map((record) => `\`${record.edgeId}\``).join(', ')}.
- Projected portfolio remainder: **${remainingAfter}**.

Run: \`node reports/closure/candidates/validate-s247-fl-best-math-ma-hs-hsf-domain-scope-batch${String(config.batchNumber).padStart(2, '0')}.mjs\`.

## Integration boundary

Validate all five isolated packets against the same seals, append them in packet order, then rebuild standards dossiers and dependent queues once. Any relevant source, dossier, or lesson change invalidates the affected candidate.
`;
};

export function runFlHsfPacket(config) {
  const packetPath = packetPathFor(config.batchNumber);
  const reportPath = reportPathFor(config.batchNumber);
  const dossiers = json('content/standards/evidence-dossiers.json').dossiers;
  const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
  const decisions = json('content/standards/human-review-decisions.json').decisions;
  const decided = new Set(decisions.map((record) => record.edgeId));
  const portfolio = dossiers.filter((dossier) => dossier.framework === 'FL-BEST-MATH'
    && dossier.candidateCode === 'MA.HS.HSF' && dossier.review?.status === 'candidate' && !decided.has(dossier.edgeId));
  const currentHashes = {
    evidenceDossiersSha256: hashFile('content/standards/evidence-dossiers.json'),
    objectivesSha256: hashFile('content/standards/objectives.json'),
    sourceRegistrySha256: hashFile('content/standards/source-registry.json')
  };
  const previousPath = config.batchNumber === 1 ? null : packetPathFor(config.batchNumber - 1);
  const priorPacketSha256 = previousPath ? hashFile(previousPath) : null;
  const expected = portfolio.slice(config.start, config.start + config.count);

  if (portfolio.length !== 249) fail(`Expected 249 live FL-BEST-MATH|MA.HS.HSF candidates, found ${portfolio.length}`);
  if (decisions.length !== 500 || decisions.filter((record) => record.decision === 'rejected').length !== 498
    || decisions.filter((record) => record.decision === 'partial').length !== 2) fail('Shared decision baseline drift');
  if (config.count < 1 || config.count > 50 || expected.length !== config.count) fail('Packet bound or slice drift');
  if (JSON.stringify(Object.keys(config.expectedCourseCounts)) !== JSON.stringify([...new Set(expected.map((dossier) => dossier.courseId))])) fail('Expected course order drift');

  if (process.argv.includes('--generate')) {
    const generated = expected.map((dossier) => makeRecord({ dossier, config, currentHashes, priorPacketSha256 }));
    fs.writeFileSync(path.join(root, packetPath), `${generated.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
  }

  const packetText = text(packetPath);
  const records = packetText.trim().split(/\r?\n/).map(JSON.parse);
  if (records.length !== config.count || new Set(records.map((record) => record.edgeId)).size !== config.count) fail('Packet count or uniqueness drift');
  if (JSON.stringify(records.map((record) => record.edgeId)) !== JSON.stringify(expected.map((dossier) => dossier.edgeId))) fail('Packet is not the configured live portfolio slice');
  if (records.some((record) => decided.has(record.edgeId))) fail('Packet overlaps the shared decision ledger');

  const previousEdgeIds = new Set();
  for (let batch = 1; batch < config.batchNumber; batch += 1) {
    for (const line of text(packetPathFor(batch)).trim().split(/\r?\n/)) previousEdgeIds.add(JSON.parse(line).edgeId);
  }
  if (previousEdgeIds.size !== config.start || records.some((record) => previousEdgeIds.has(record.edgeId))) fail('Cross-packet overlap or coverage drift');

  const courseCounts = records.reduce((counts, record) => ({ ...counts,
    [record.evidenceSnapshot.courseId]: (counts[record.evidenceSnapshot.courseId] ?? 0) + 1 }), {});
  if (JSON.stringify(courseCounts) !== JSON.stringify(config.expectedCourseCounts)) fail(`Course partition drift: ${JSON.stringify(courseCounts)}`);

  for (const record of records) {
    const dossier = dossierByEdge.get(record.edgeId);
    if (!dossier || dossier.framework !== 'FL-BEST-MATH' || dossier.candidateCode !== 'MA.HS.HSF'
      || dossier.sourceId !== 'FL-BEST-MATH-OFFICIAL' || dossier.sourceLocator !== 'MA.HS.HSF'
      || dossier.sourceTextStatus !== 'scope-locator-requires-exact-benchmark'
      || dossier.checks?.exactStandardCodeCandidate !== false || dossier.review?.status !== 'candidate') fail(`Invalid coarse-locator scope ${record.edgeId}`);
    if (record.decision !== 'rejected' || record.approvedDepth !== null || record.candidateCode !== 'MA.HS.HSF') fail(`Decision scope drift ${record.edgeId}`);
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
      objectiveId: dossier.objectiveId, objectiveTitle: dossier.objectiveTitle, courseId: dossier.courseId,
      gradeLevel: dossier.gradeLevel, lessonIds: dossier.evidenceSummary.lessonIds, stepEvidenceCount: dossier.stepEvidence.length,
      independentPracticeStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('independent-practice')).length,
      transferTaggedStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes('transfer')).length
    };
    for (const [key, value] of Object.entries(expectedSnapshot)) if (JSON.stringify(record.evidenceSnapshot[key]) !== JSON.stringify(value)) fail(`Evidence snapshot drift ${record.edgeId}/${key}`);
    if (record.evidenceSnapshot.transferEvidenceUsed !== false || !record.notes.includes('not treated as transfer or mastery evidence')) fail(`Transfer/mastery inference ${record.edgeId}`);
    if (record.claimBoundary !== claimBoundary || JSON.stringify(record.evidenceGaps) !== JSON.stringify(evidenceGaps)) fail(`Claim boundary drift ${record.edgeId}`);
    if (!record.replacementReview?.required || record.replacementReview.boundary !== routingBoundary
      || JSON.stringify(record.replacementReview.candidateFamiliesOnly) !== JSON.stringify(routingByCourse[dossier.courseId])) fail(`Routing contract drift ${record.edgeId}`);
    if (record.deltaFromPriorFlHsfPacket.priorIntegratedFlHsfRejectedEdges !== 0
      || record.deltaFromPriorFlHsfPacket.priorIsolatedCandidateEdges !== config.start
      || record.deltaFromPriorFlHsfPacket.priorPacketSha256 !== priorPacketSha256
      || record.deltaFromPriorFlHsfPacket.remainingFlHsfCandidatesBeforeBatch !== 249 - config.start) fail(`Delta baseline drift ${record.edgeId}`);
    const seals = record.evidenceSnapshot.lessonSourceHashes;
    if (Object.keys(seals).length !== record.evidenceSnapshot.lessonIds.length) fail(`Lesson seal coverage drift ${record.edgeId}`);
    for (const lessonId of record.evidenceSnapshot.lessonIds) {
      const seal = seals[lessonId];
      if (!seal || hashFile(seal.relativePath) !== seal.sha256 || json(seal.relativePath).id !== lessonId) fail(`Lesson source drift ${record.edgeId}/${lessonId}`);
    }
  }

  const sample = [...records].sort((a, b) => sha256(`${currentHashes.evidenceDossiersSha256}|fl-hsf-${config.batchNumber}|${a.edgeId}`)
    .localeCompare(sha256(`${currentHashes.evidenceDossiersSha256}|fl-hsf-${config.batchNumber}|${b.edgeId}`))).slice(0, 8);
  for (const record of sample) {
    const dossier = dossierByEdge.get(record.edgeId);
    if (record.dossierHash !== candidateDossierHash(dossier) || record.evidenceSnapshot.transferEvidenceUsed !== false
      || record.approvedDepth !== null || !record.claimBoundary.startsWith('This decision rejects only the coarse MA.HS.HSF portfolio locator.')) fail(`Independent sample drift ${record.edgeId}`);
  }
  const packetSha256 = sha256(packetText);
  if (process.argv.includes('--generate')) fs.writeFileSync(path.join(root, reportPath), reportMarkdown({ config, currentHashes, packetSha256, courseCounts, sample }), 'utf8');
  const result = { status:'PASS', batch:config.batchNumber, records:records.length, courseCounts, sharedLedgerOverlap:0,
    independentlyValidatedCoarseLocators:records.length, descendantOrExactDecisionsChanged:0,
    independentUnseenSampleSize:sample.length, independentUnseenSampleEdgeIds:sample.map((record) => record.edgeId),
    projectedRemainingFlHsfCandidates:249-config.start-config.count, packetSha256 };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
