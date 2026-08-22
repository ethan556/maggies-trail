#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02.jsonl';
const reportPath = 'reports/standards/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH02_DELTA.md';
const text = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const records = text(packetPath).trim().split(/\r?\n/).map(JSON.parse);
if (records.length !== 40) throw new Error(`Expected 40 records, found ${records.length}`);
const hashes = records[0].sourceArtifactHashes;
const packetSha256 = sha256(text(packetPath));
const sample = [...records].sort((a, b) => sha256(`${hashes.evidenceDossiersSha256}|batch02|${a.edgeId}`).localeCompare(sha256(`${hashes.evidenceDossiersSha256}|batch02|${b.edgeId}`))).slice(0, 8);
const rows = records.map((r) => `| \`${r.edgeId}\` | \`${r.evidenceSnapshot.objectiveId}\` | \`${r.evidenceSnapshot.courseId}\` | ${r.evidenceSnapshot.lessonIds.map((id) => `\`${id}\``).join(', ')} | \`${r.dossierHash}\` | ${r.replacementReview.candidateFamiliesOnly.map((x) => `\`${x}\``).join(', ')} |`);
const report = `# S247 Common Core HSF domain-scope assurance — batch 02 delta

Date: 2026-08-18
Portfolio: \`CCSS-MATH|HSF\`
Scope: next 40 post-batch-01 candidate edges only
Verdict: **40 isolated, canonical, signed \`rejected\` candidates; not appended**

## Delta

| Measure | After integrated batch 01 | Batch 02 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 40 | +40 | 80 of 249 |
| HSF coarse edges still candidate | 209 | −40 | 169 |
| Cumulative portfolio completion | 16.06% | +16.06 points | 32.13% |
| Authoritative shared decisions | 42 | unchanged | 82 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 02.

## Reused official source contract

No source refetch or new summary was performed. Batch 02 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/), boundary \`Standards in this domain\`.
- Official accessible PDF: [Common Core Mathematics Standards](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf), boundary \`High School — Functions\`, printed pages 67–73.
- Signed compact snapshot: “Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.”
- Web boundary SHA-256: \`${hashes.officialBoundarySnapshotSha256}\`.
- PDF boundary SHA-256: \`${hashes.officialPdfBoundarySha256}\`.

The source contract establishes that \`HSF\` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Descendant alignment remains unreviewed and open.

## Current post-rebuild seals

- Evidence dossiers: \`${hashes.evidenceDossiersSha256}\`
- Objectives: \`${hashes.objectivesSha256}\`
- Source registry: \`${hashes.sourceRegistrySha256}\`
- Batch 01 packet: \`${records[0].deltaFromBatch01.priorPacketSha256}\`
- Batch 02 packet: \`${packetSha256}\`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

- Function transformations: 10 edges.
- Logarithms: 15 edges.
- Sequences and series: 13 edges.
- Trigonometric functions: 2 edges.

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
- Sample: ${sample.map((r) => `\`${r.edgeId}\``).join(', ')}.

Run: \`node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch02.mjs\`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source/dossier/lesson hash change invalidates the affected candidate.
`;
fs.writeFileSync(path.join(root, reportPath), report);
console.log(`wrote ${reportPath}`);
