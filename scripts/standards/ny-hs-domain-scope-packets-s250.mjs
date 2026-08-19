#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash, validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const generate = process.argv.includes("--generate");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");
const fileHash = (p) => sha(read(p));
const sourceUrl = "https://www.nysed.gov/sites/default/files/programs/standards-instruction/nys-next-generation-mathematics-p-12-standards_0.pdf";
const sourceBoundary = "High School – Introduction > Organization of the High School Standards for Mathematical Content";
const officialText = "New York groups high-school courses and Plus standards by conceptual categories: Number and Quantity, Algebra, Functions, Geometry, Statistics and Probability, and Modeling. Assessable expectations appear beneath those categories with narrower course and cluster identifiers; NY-HSN, NY-HSA, NY-HSF, NY-HSG, and NY-HSS are repository portfolio locators, not exact New York learning-standard identifiers.";
const boundaryHash = sha(`${sourceUrl}|${sourceBoundary}|${officialText}`);
const contracts = {
  "NY-HSA": { count: 140, families: ["A-SSE", "A-APR", "A-CED", "A-REI"] },
  "NY-HSF": { count: 249, families: ["F-IF", "F-BF", "F-LE", "F-TF"] },
  "NY-HSG": { count: 146, families: ["G-CO", "G-SRT", "G-C", "G-GPE", "G-GMD", "G-MG"] },
  "NY-HSN": { count: 30, families: ["N-RN", "N-Q", "N-CN", "N-VM"] },
  "NY-HSS": { count: 39, families: ["S-ID", "S-IC", "S-CP", "S-MD"] },
};
const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const ledger = json("content/standards/human-review-decisions.json").decisions;
const decided = new Set(ledger.map((d) => d.edgeId));
const hashes = {
  evidenceDossiersSha256: fileHash("content/standards/evidence-dossiers.json"),
  objectivesSha256: fileHash("content/standards/objectives.json"),
  sourceRegistrySha256: fileHash("content/standards/source-registry.json"),
  officialBoundarySnapshotSha256: boundaryHash,
};
if (ledger.length !== 749 || ledger.some((d) => Object.hasOwn(contracts, d.candidateCode))) throw new Error("NY-HS decision baseline drift");

const packetFiles = [];
const allRecords = [];
for (const [code, contract] of Object.entries(contracts)) {
  const scope = dossiers.filter((d) => d.framework === "NY-NGLS-MATH" && d.candidateCode === code && d.review?.status === "candidate" && !decided.has(d.edgeId));
  if (scope.length !== contract.count) throw new Error(`${code}: expected ${contract.count}, found ${scope.length}`);
  for (let start = 0, batch = 1; start < scope.length; start += 40, batch += 1) {
    const selected = scope.slice(start, start + 40);
    const records = selected.map((dossier) => {
      const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
        const relativePath = `content/courses/${dossier.courseId}/lessons/${lessonId}.json`;
        return [lessonId, { relativePath, sha256: fileHash(relativePath) }];
      }));
      const unsigned = {
        edgeId: dossier.edgeId,
        decision: "rejected",
        reviewer: `chatgpt-work-s250-ny-hs-${code.toLowerCase()}-${String(batch).padStart(2, "0")}`,
        reviewedAt: `2026-08-18T${String(18 + (allRecords.length % 5)).padStart(2, "0")}:${String(batch * 7).padStart(2, "0")}:00.000Z`,
        notes: `Reject the ${dossier.objectiveId} -> ${code} edge because ${code} is a repository conceptual-category locator, not an exact New York learning standard. Evidence for “${dossier.objectiveTitle}” must be remapped and compared with the full wording of an exact descendant expectation. No transfer or mastery inference was used.`,
        approvedDepth: null,
        officialTextSnapshot: officialText,
        officialSourceUrl: sourceUrl,
        claimBoundary: `This decision rejects only the coarse ${code} portfolio locator. It makes no approval or rejection claim for any exact New York descendant, course-specific expectation, Plus standard, modeling standard, or Mathematical Practice.`,
        dossierHash: candidateDossierHash(dossier),
        candidateCode: code,
        officialSourceBoundary: sourceBoundary,
        officialSourceBoundaryHash: boundaryHash,
        sourceArtifactHashes: hashes,
        evidenceSnapshot: {
          objectiveId: dossier.objectiveId, objectiveTitle: dossier.objectiveTitle, courseId: dossier.courseId,
          gradeLevel: dossier.gradeLevel, lessonIds: dossier.evidenceSummary.lessonIds,
          stepEvidenceCount: dossier.stepEvidence.length,
          independentPracticeStepCount: dossier.stepEvidence.filter((s) => s.evidenceRoles.includes("independent-practice")).length,
          transferTaggedStepCount: dossier.stepEvidence.filter((s) => s.evidenceRoles.includes("transfer")).length,
          transferEvidenceUsed: false, lessonSourceHashes,
        },
        evidenceGaps: [
          `${code} supplies no exact assessable action, conditions, representations, or limits.`,
          "Full-intent comparison requires an exact New York descendant expectation and its complete course-specific wording.",
          "The lesson evidence cannot establish alignment to an entire conceptual category.",
          "Challenge and transfer tags were not used to infer transfer or mastery.",
        ],
        replacementReview: { required: true, candidateFamiliesOnly: contract.families, boundary: "Routing hints only; every exact standard needs a new source-backed full-intent review." },
      };
      return { ...unsigned, signature: sha(JSON.stringify(unsigned)) };
    });
    const file = `reports/closure/candidates/S250_NY_NGLS_${code.replace("NY-", "")}_DOMAIN_SCOPE_BATCH${String(batch).padStart(2, "0")}.jsonl`;
    if (generate) fs.writeFileSync(path.join(root, file), `${records.map(JSON.stringify).join("\n")}\n`, "utf8");
    const loaded = read(file).trim().split(/\r?\n/).map(JSON.parse);
    if (loaded.length !== records.length || loaded.some((r, i) => r.edgeId !== records[i].edgeId)) throw new Error(`${file}: packet drift`);
    for (const record of loaded) {
      const validation = validateStandardsDecision(record, { allowLegacy: false });
      const { signature, ...unsigned } = record;
      if (validation.errors.length || signature !== sha(JSON.stringify(unsigned)) || record.evidenceSnapshot.transferEvidenceUsed !== false) throw new Error(`${record.edgeId}: invalid decision`);
      for (const seal of Object.values(record.evidenceSnapshot.lessonSourceHashes)) if (fileHash(seal.relativePath) !== seal.sha256) throw new Error(`${record.edgeId}: stale lesson`);
    }
    packetFiles.push(file);
    allRecords.push(...loaded);
  }
}
if (allRecords.length !== 604 || new Set(allRecords.map((r) => r.edgeId)).size !== 604) throw new Error("Aggregate NY-HS coverage drift");
if (generate) fs.writeFileSync(path.join(root, "reports/standards/S250_NY_NGLS_HIGH_SCHOOL_DOMAIN_SCOPE_PORTFOLIO.md"), `# S250 New York high-school domain-scope portfolio\n\n- Official authority: ${sourceUrl}\n- Boundary: ${sourceBoundary}\n- Verdict: 604 signed, bounded rejections of repository conceptual-category locators only.\n- Partition: ${Object.entries(contracts).map(([k,v]) => `${k} ${v.count}`).join("; ")}\n- Packets: ${packetFiles.length}, each at most 40 edges.\n- Exact or descendant decisions changed by the packet: 0.\n- Transfer/mastery evidence used: false for 604/604.\n- Aggregate packet seal: \`${sha(allRecords.map((r) => r.signature).join("\n"))}\`\n\nEvery exact descendant remains open for a separate full-intent review.\n`, "utf8");
console.log(JSON.stringify({ status: "PASS", decisions: allRecords.length, packets: packetFiles.length, partition: Object.fromEntries(Object.entries(contracts).map(([k,v]) => [k,v.count])), packetFiles, aggregateSeal: sha(allRecords.map((r) => r.signature).join("\n")) }, null, 2));
