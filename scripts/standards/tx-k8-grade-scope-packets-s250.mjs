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
const sourceBoundary = "19 TAC Chapter 111, Subchapters A and B — grade-level course sections with nested knowledge-and-skills/student-expectation items";
const officialText = "Texas Chapter 111 identifies elementary and middle-school mathematics by grade-level sections. Assessable knowledge-and-skills statements and student expectations occur in narrower nested subsections and items, such as §111.3(b)(1)(A); a grade-level section alone is not an exact student expectation.";
const boundaryHash = sha(`${sourceUrl}|${sourceBoundary}|${officialText}`);
const contracts = {
  "§111.3": { count: 53, grade: "Grade 1" },
  "§111.4": { count: 59, grade: "Grade 2" },
  "§111.5": { count: 77, grade: "Grade 3" },
  "§111.6": { count: 68, grade: "Grade 4" },
  "§111.7": { count: 62, grade: "Grade 5" },
  "§111.26": { count: 75, grade: "Grade 6" },
  "§111.27": { count: 73, grade: "Grade 7" },
  "§111.28": { count: 72, grade: "Grade 8" },
};

const lessonPaths = new Map();
for (const course of fs.readdirSync(path.join(root, "content/courses"), { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const lessonsDirectory = path.join(root, "content/courses", course.name, "lessons");
  if (!fs.existsSync(lessonsDirectory)) continue;
  for (const lessonFile of fs.readdirSync(lessonsDirectory).filter((file) => file.endsWith(".json"))) {
    const relativePath = path.posix.join("content/courses", course.name, "lessons", lessonFile);
    const lessonId = json(relativePath).id;
    if (lessonPaths.has(lessonId)) throw new Error(`Duplicate lesson id: ${lessonId}`);
    lessonPaths.set(lessonId, relativePath);
  }
}

const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const ledger = json("content/standards/human-review-decisions.json").decisions;
const decided = new Set(ledger.map((decision) => decision.edgeId));
if (ledger.length !== 3022 || ledger.some((decision) => Object.hasOwn(contracts, decision.candidateCode))) throw new Error("Texas K–8 decision baseline drift");
const hashes = {
  evidenceDossiersSha256: fileHash("content/standards/evidence-dossiers.json"),
  objectivesSha256: fileHash("content/standards/objectives.json"),
  sourceRegistrySha256: fileHash("content/standards/source-registry.json"),
  officialBoundarySnapshotSha256: boundaryHash,
};

const packetFiles = [];
const allRecords = [];
for (const [code, contract] of Object.entries(contracts)) {
  const scope = dossiers.filter((dossier) => dossier.framework === "TX-TEKS-MATH"
    && dossier.candidateCode === code
    && dossier.review?.status === "candidate"
    && !decided.has(dossier.edgeId));
  if (scope.length !== contract.count) throw new Error(`${code}: expected ${contract.count}, found ${scope.length}`);

  for (let start = 0, batch = 1; start < scope.length; start += 40, batch += 1) {
    const selected = scope.slice(start, start + 40);
    const records = selected.map((dossier) => {
      const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
        const relativePath = lessonPaths.get(lessonId);
        if (!relativePath) throw new Error(`${dossier.edgeId}: missing lesson source ${lessonId}`);
        return [lessonId, { relativePath, sha256: fileHash(relativePath) }];
      }));
      const unsigned = {
        edgeId: dossier.edgeId,
        decision: "rejected",
        reviewer: `chatgpt-work-s250-tx-k8-${code.replace("§", "s").replaceAll(".", "-")}-${String(batch).padStart(2, "0")}`,
        reviewedAt: `2026-08-18T23:${String((packetFiles.length * 5 + batch) % 60).padStart(2, "0")}:00.000Z`,
        notes: `Reject the ${dossier.objectiveId} -> ${code} edge because ${code} identifies the Texas ${contract.grade} course section, not an exact student expectation. Evidence for “${dossier.objectiveTitle}” must be remapped and compared with a complete nested knowledge-and-skills/student-expectation item. No transfer or mastery inference was used.`,
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
          `${code} names ${contract.grade} but supplies no exact assessable action, conditions, representation, or limits.`,
          `Full-intent comparison requires a complete nested expectation beneath ${code}, including its knowledge-and-skills statement.`,
          "The bounded lesson evidence cannot establish alignment to an entire grade-level course section.",
          "Challenge and transfer tags were not used to infer transfer or mastery.",
        ],
        replacementReview: {
          required: true,
          candidateFamiliesOnly: [`${code}(b)`],
          boundary: "Routing hint only; every exact nested TEKS expectation requires a new source-backed full-intent review.",
        },
      };
      return { ...unsigned, signature: sha(JSON.stringify(unsigned)) };
    });
    const codeSlug = code.replace("§", "S").replaceAll(".", "_");
    const file = `reports/closure/candidates/S250_TX_TEKS_${codeSlug}_GRADE_SCOPE_BATCH${String(batch).padStart(2, "0")}.jsonl`;
    if (generate) fs.writeFileSync(path.join(root, file), `${records.map(JSON.stringify).join("\n")}\n`, "utf8");
    const loaded = read(file).trim().split(/\r?\n/).map(JSON.parse);
    if (loaded.length !== records.length || loaded.some((record, index) => record.edgeId !== records[index].edgeId)) throw new Error(`${file}: packet drift`);
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

if (allRecords.length !== 539 || new Set(allRecords.map((record) => record.edgeId)).size !== 539) throw new Error("Aggregate Texas K–8 coverage drift");
if (generate) fs.writeFileSync(path.join(root, "reports/standards/S250_TX_TEKS_K8_GRADE_SCOPE_PORTFOLIO.md"), `# S250 Texas K–8 grade-scope portfolio

- Official authority: ${sourceUrl}
- Boundary: ${sourceBoundary}
- Verdict: 539 signed, bounded rejections of repository grade-section locators only.
- Partition: ${Object.entries(contracts).map(([code, contract]) => `${code} ${contract.count}`).join("; ")}.
- Packets: ${packetFiles.length}, each at most 40 edges.
- Exact nested student-expectation decisions changed: 0.
- Transfer/mastery evidence used: false for 539/539.
- Aggregate packet seal: \`${sha(allRecords.map((record) => record.signature).join("\n"))}\`

Every exact nested Texas student expectation remains open for separate full-intent review.
`, "utf8");
console.log(JSON.stringify({ status: "PASS", decisions: allRecords.length, packets: packetFiles.length, partition: Object.fromEntries(Object.entries(contracts).map(([code, contract]) => [code, contract.count])), packetFiles, aggregateSeal: sha(allRecords.map((record) => record.signature).join("\n")) }, null, 2));
