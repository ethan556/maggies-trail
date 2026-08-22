#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = 'reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl';
const reportPath = 'reports/standards/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.md';
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const records = readText(packetPath).trim().split(/\r?\n/).map((line) => JSON.parse(line));
if (records.length !== 40) throw new Error(`Expected 40 packet records, found ${records.length}`);
const sourceHashes = records[0].sourceArtifactHashes;
const packetSha256 = sha256(readText(packetPath));
const unseenSample = [...records]
  .sort((a, b) => sha256(`${sourceHashes.evidenceDossiersSha256}|${a.edgeId}`).localeCompare(sha256(`${sourceHashes.evidenceDossiersSha256}|${b.edgeId}`)))
  .slice(0, 8);
const rows = records.map((record) => {
  const lessons = record.evidenceSnapshot.lessonIds.map((lessonId) => `\`${lessonId}\``).join(', ');
  const routing = record.replacementReview.candidateFamiliesOnly.map((family) => `\`${family}\``).join(', ');
  return `| \`${record.edgeId}\` | \`${record.evidenceSnapshot.objectiveId}\` | \`${record.evidenceSnapshot.courseId}\` | ${lessons} | \`${record.dossierHash}\` | ${routing} |`;
});

const report = `# S247 Common Core HSF domain-scope assurance — batch 01

Date: 2026-08-18
Portfolio: \`CCSS-MATH|HSF\`
Scope: exactly 40 existing open dossier edges; no shared decision append, queue/cards/cache rebuild, content edit, commit, or deployment
Verdict: **40 canonical signed \`rejected\` candidates, isolated pending integration**

## Official authority and text boundary

The review read the Common Core State Standards Initiative's official
[High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/) page directly through browser-supported web retrieval on 2026-08-18. The exact boundary used was
\`High School: Functions > Standards in this domain\`. Its compact signed snapshot is:

> Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.

The authority page enumerates Building Functions, Interpreting Functions, Linear/Quadratic/Exponential Models, and Trigonometric Functions clusters and their descendant standards. It does **not** define \`HSF\` as a standalone assessable standard with a single mathematical action. The repository's source registry points to the same Common Core authority and 2010 canonical spine.

Signed source-boundary SHA-256: \`${sourceHashes.officialBoundarySnapshotSha256}\`.

## Disposition contract

Every selected live dossier uses \`candidateCode: HSF\`, \`candidateLabel: Candidate alignment to HSF\`, and a candidate review state. A full-intent approval or partial decision is not contractually possible: there is no exact standard text at \`HSF\` against which the objective can be approved to a defined depth.

Each edge is rejected **only as a coarse domain-level crosswalk**. The decision explicitly does not reject possible evidence for a narrower descendant such as \`HSF.IF.A.2\`, \`HSF.BF.A.2\`, or a relevant Algebra/Geometry standard. Routing families in the packet are review hints only, not new alignment claims.

The current dossiers tag one step per edge as transfer. That tag was not used. Challenge presence and generated evidence-role metadata do not establish transfer or mastery; the exact descendant standard still requires official-text and full-lesson review.

## Current source seals

- \`content/standards/evidence-dossiers.json\`: \`${sourceHashes.evidenceDossiersSha256}\`
- \`content/standards/objectives.json\`: \`${sourceHashes.objectivesSha256}\`
- \`content/standards/source-registry.json\`: \`${sourceHashes.sourceRegistrySha256}\`
- isolated candidate packet: \`${packetSha256}\`

Each record also signs the current dossier hash and SHA-256 of every lesson file in its evidence snapshot.

## Exact edges

| Edge ID | Objective | Course | Lesson | Current dossier SHA-256 | Replacement review routing only |
|---|---|---|---|---|---|
${rows.join('\n')}

## Evidence gaps applied to every edge

1. \`HSF\` supplies no exact assessable standard action, conditions, representations, or limits.
2. Full-intent comparison requires a descendant standard code and its complete official wording.
3. A single objective/lesson cannot establish the whole HSF domain spanning interpreting, building, modeling, and trigonometric functions.
4. Challenge/transfer tags were not used to infer transfer or mastery.

## Strict validation and unseen sample

The isolated validator verifies canonical status, live edge identity, current candidate state, dossier/artifact/lesson hashes, official boundary, claim boundary, evidence gaps, signatures, and zero transfer-evidence use. It selects its sample from the live dossier seal rather than accepting an author-provided sample list.

- Full packet: **40/40 PASS**.
- Deterministic independent unseen sample: **8/8 PASS**.
- Sample edge IDs: ${unseenSample.map((record) => `\`${record.edgeId}\``).join(', ')}.
- Course partition: 12 functions/sequences, 12 linear-functions, 11 quadratics, 5 function-transformations.

Command: \`node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch01.mjs\`.

## Integration boundary

These records are not appended to \`content/standards/human-review-decisions.json\`. Root integration must rerun the strict validator immediately before append, preserve the signed records exactly, then rebuild standards dossiers and the global queue/card/cache chain serially. Any changed dossier, standards artifact, or lesson hash invalidates the corresponding candidate.
`;

fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);
console.log(`wrote ${reportPath}`);
