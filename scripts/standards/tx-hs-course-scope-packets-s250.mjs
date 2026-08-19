#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash, validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const generate = process.argv.includes("--generate");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const json = (relativePath) => JSON.parse(read(relativePath));
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fileHash = (relativePath) => sha(read(relativePath));

const sourceUrl = "https://tea.texas.gov/laws-and-rules/texas-administrative-code/19-tac-chapter-111";
const sourcePdfUrl = "https://tea.texas.gov/about-tea/laws-and-rules/sboe-rules-tac/sboe-tac-currently-in-effect/ch111c.pdf";
const sourceBoundary = "19 TAC Chapter 111, Subchapter C — High School course sections and nested knowledge-and-skills/student-expectation subsections";
const officialText = "Texas Chapter 111 identifies high-school mathematics courses by section: §111.39 Algebra I, §111.40 Algebra II, §111.41 Geometry, §111.42 Precalculus, and §111.47 Statistics. Assessable knowledge-and-skills and student expectations occur in narrower nested subsections and items, such as §111.39(c)(12)(A); a course section alone is not an exact student expectation.";
const boundaryHash = sha(`${sourceUrl}|${sourcePdfUrl}|${sourceBoundary}|${officialText}`);
const contracts = {
  "§111.39": { count: 94, course: "Algebra I", nested: ["§111.39(c)"] },
  "§111.40": { count: 134, course: "Algebra II", nested: ["§111.40(c)"] },
  "§111.41": { count: 146, course: "Geometry", nested: ["§111.41(c)"] },
  "§111.42": { count: 209, course: "Precalculus", nested: ["§111.42(c)"] },
  "§111.47": { count: 21, course: "Statistics", nested: ["§111.47(c)"] },
};

const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const ledger = json("content/standards/human-review-decisions.json").decisions;
const decided = new Set(ledger.map((decision) => decision.edgeId));
const hashes = {
  evidenceDossiersSha256: fileHash("content/standards/evidence-dossiers.json"),
  objectivesSha256: fileHash("content/standards/objectives.json"),
  sourceRegistrySha256: fileHash("content/standards/source-registry.json"),
  officialBoundarySnapshotSha256: boundaryHash,
};

if (ledger.length !== 1353 || ledger.some((decision) => Object.hasOwn(contracts, decision.candidateCode))) {
  throw new Error("Texas high-school decision baseline drift");
}

const packetFiles = [];
const allRecords = [];
for (const [code, contract] of Object.entries(contracts)) {
  const scope = dossiers.filter((dossier) =>
    dossier.framework === "TX-TEKS-MATH"
      && dossier.candidateCode === code
      && dossier.review?.status === "candidate"
      && !decided.has(dossier.edgeId));
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
        reviewer: `chatgpt-work-s250-tx-hs-${code.replace("§", "s").replaceAll(".", "-")}-${String(batch).padStart(2, "0")}`,
        reviewedAt: `2026-08-18T${String(20 + (allRecords.length % 3)).padStart(2, "0")}:${String(batch * 7).padStart(2, "0")}:00.000Z`,
        notes: `Reject the ${dossier.objectiveId} -> ${code} edge because ${code} identifies the Texas ${contract.course} course section, not an exact student expectation. Evidence for “${dossier.objectiveTitle}” must be remapped and compared with a complete nested knowledge-and-skills/student-expectation item. No transfer or mastery inference was used.`,
        approvedDepth: null,
        officialTextSnapshot: officialText,
        officialSourceUrl: sourceUrl,
        claimBoundary: `This decision rejects only the coarse ${code} portfolio locator. It makes no approval or rejection claim for any nested Texas knowledge-and-skills statement, student expectation, process standard, or exact benchmark.`,
        dossierHash: candidateDossierHash(dossier),
        candidateCode: code,
        officialSourceBoundary: sourceBoundary,
        officialSourceBoundaryHash: boundaryHash,
        sourceArtifactHashes: hashes,
        evidenceSnapshot: {
          objectiveId: dossier.objectiveId,
          objectiveTitle: dossier.objectiveTitle,
          courseId: dossier.courseId,
          gradeLevel: dossier.gradeLevel,
          lessonIds: dossier.evidenceSummary.lessonIds,
          stepEvidenceCount: dossier.stepEvidence.length,
          independentPracticeStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes("independent-practice")).length,
          transferTaggedStepCount: dossier.stepEvidence.filter((step) => step.evidenceRoles.includes("transfer")).length,
          transferEvidenceUsed: false,
          lessonSourceHashes,
        },
        evidenceGaps: [
          `${code} names the ${contract.course} course but supplies no exact assessable action, conditions, representation, or limits.`,
          `Full-intent comparison requires a complete nested expectation beneath ${code}, including its knowledge-and-skills statement.`,
          "The lesson evidence cannot establish alignment to an entire high-school course section.",
          "Challenge and transfer tags were not used to infer transfer or mastery.",
        ],
        replacementReview: {
          required: true,
          candidateFamiliesOnly: contract.nested,
          boundary: "Routing hints only; every exact nested TEKS expectation requires a new source-backed full-intent review.",
        },
      };
      return { ...unsigned, signature: sha(JSON.stringify(unsigned)) };
    });

    const codeSlug = code.replace("§", "S").replaceAll(".", "_");
    const file = `reports/closure/candidates/S250_TX_TEKS_${codeSlug}_COURSE_SCOPE_BATCH${String(batch).padStart(2, "0")}.jsonl`;
    if (generate) fs.writeFileSync(path.join(root, file), `${records.map(JSON.stringify).join("\n")}\n`, "utf8");
    const loaded = read(file).trim().split(/\r?\n/).map(JSON.parse);
    if (loaded.length !== records.length || loaded.some((record, index) => record.edgeId !== records[index].edgeId)) {
      throw new Error(`${file}: packet drift`);
    }
    for (const record of loaded) {
      const validation = validateStandardsDecision(record, { allowLegacy: false });
      const { signature, ...unsigned } = record;
      if (validation.errors.length || signature !== sha(JSON.stringify(unsigned)) || record.evidenceSnapshot.transferEvidenceUsed !== false) {
        throw new Error(`${record.edgeId}: invalid decision`);
      }
      for (const seal of Object.values(record.evidenceSnapshot.lessonSourceHashes)) {
        if (fileHash(seal.relativePath) !== seal.sha256) throw new Error(`${record.edgeId}: stale lesson`);
      }
    }
    packetFiles.push(file);
    allRecords.push(...loaded);
  }
}

if (allRecords.length !== 604 || new Set(allRecords.map((record) => record.edgeId)).size !== 604) {
  throw new Error("Aggregate Texas high-school coverage drift");
}

if (generate) {
  fs.writeFileSync(path.join(root, "reports/standards/S250_TX_TEKS_HIGH_SCHOOL_COURSE_SCOPE_PORTFOLIO.md"), `# S250 Texas high-school course-scope portfolio

- Official authority: ${sourceUrl}
- Official Subchapter C PDF: ${sourcePdfUrl}
- Boundary: ${sourceBoundary}
- Verdict: 604 signed, bounded rejections of repository course-section locators only.
- Partition: ${Object.entries(contracts).map(([code, contract]) => `${code} ${contract.count}`).join("; ")}
- Packets: ${packetFiles.length}, each at most 40 edges.
- Exact or nested student-expectation decisions changed by this packet: 0.
- Transfer/mastery evidence used: false for 604/604.
- Aggregate packet seal: \`${sha(allRecords.map((record) => record.signature).join("\n"))}\`

Every exact nested Texas student expectation remains open for separate full-intent review.
`, "utf8");
}

console.log(JSON.stringify({
  status: "PASS",
  decisions: allRecords.length,
  packets: packetFiles.length,
  partition: Object.fromEntries(Object.entries(contracts).map(([code, contract]) => [code, contract.count])),
  packetFiles,
  aggregateSeal: sha(allRecords.map((record) => record.signature).join("\n")),
}, null, 2));
