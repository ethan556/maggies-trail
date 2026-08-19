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

const authorities = {
  "CCSS-MATH": {
    sourceUrl: "https://corestandards.org/mathematics-standards/",
    sourceBoundary: "Common Core State Standards for Mathematics — High School conceptual categories and nested domains/clusters/standards",
    officialText: "Common Core organizes high-school mathematics into conceptual categories including Number and Quantity, Algebra, Functions, Geometry, and Statistics and Probability. Assessable standards use narrower domain, cluster, and standard identifiers; HSA, HSG, HSN, and HSS alone are category locators rather than exact standards.",
    codes: {
      HSA: { count: 140, label: "Algebra", routes: ["HSA-SSE", "HSA-APR", "HSA-CED", "HSA-REI"] },
      HSG: { count: 146, label: "Geometry", routes: ["HSG-CO", "HSG-SRT", "HSG-C", "HSG-GPE", "HSG-GMD", "HSG-MG"] },
      HSN: { count: 30, label: "Number and Quantity", routes: ["HSN-RN", "HSN-Q", "HSN-CN", "HSN-VM"] },
      HSS: { count: 39, label: "Statistics and Probability", routes: ["HSS-ID", "HSS-IC", "HSS-CP", "HSS-MD"] },
    },
  },
  "CA-CCSSM": {
    sourceUrl: "https://www.cde.ca.gov/re/cc/",
    sourcePdfUrl: "https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf",
    sourceBoundary: "California Common Core State Standards for Mathematics — Higher Mathematics conceptual categories and nested standards",
    officialText: "California organizes higher mathematics into conceptual categories including Number and Quantity, Algebra, Functions, Geometry, and Statistics and Probability. Assessable standards use narrower identifiers beneath those categories, including California additions; CA-HSA, CA-HSG, CA-HSN, and CA-HSS are repository category locators rather than exact California standards.",
    codes: {
      "CA-HSA": { count: 140, label: "Algebra", routes: ["A-SSE", "A-APR", "A-CED", "A-REI"] },
      "CA-HSG": { count: 146, label: "Geometry", routes: ["G-CO", "G-SRT", "G-C", "G-GPE", "G-GMD", "G-MG"] },
      "CA-HSN": { count: 30, label: "Number and Quantity", routes: ["N-RN", "N-Q", "N-CN", "N-VM"] },
      "CA-HSS": { count: 39, label: "Statistics and Probability", routes: ["S-ID", "S-IC", "S-CP", "S-MD"] },
    },
  },
  "FL-BEST-MATH": {
    sourceUrl: "https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/",
    sourcePdfUrl: "https://cpalmsmediaprod.blob.core.windows.net/uploads/docs/standards/best/ma/mathbeststandardsfinal.pdf",
    sourceBoundary: "Florida B.E.S.T. Standards for Mathematics — coding scheme and 9–12 strands, standards, and benchmarks",
    officialText: "Florida codes mathematics expectations by subject, grade band, strand, standard, and benchmark. Exact high-school benchmarks use identifiers such as MA.912.AR.1.1, MA.912.GR.1.1, MA.912.NSO.1.1, or MA.912.DP.1.1; MA.HS.HSA, MA.HS.HSG, MA.HS.HSN, and MA.HS.HSS are repository portfolio locators rather than official benchmarks.",
    codes: {
      "MA.HS.HSA": { count: 140, label: "Algebra", routes: ["MA.912.AR"] },
      "MA.HS.HSG": { count: 146, label: "Geometric Reasoning", routes: ["MA.912.GR"] },
      "MA.HS.HSN": { count: 30, label: "Number Sense and Operations", routes: ["MA.912.NSO"] },
      "MA.HS.HSS": { count: 39, label: "Data Analysis and Probability", routes: ["MA.912.DP"] },
    },
  },
};

const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const ledger = json("content/standards/human-review-decisions.json").decisions;
const decided = new Set(ledger.map((decision) => decision.edgeId));
const allCodes = new Set(Object.values(authorities).flatMap((authority) => Object.keys(authority.codes)));
if (ledger.length !== 1957 || ledger.some((decision) => allCodes.has(decision.candidateCode))) {
  throw new Error("Remaining high-school category decision baseline drift");
}

const sourceArtifactHashes = {
  evidenceDossiersSha256: fileHash("content/standards/evidence-dossiers.json"),
  objectivesSha256: fileHash("content/standards/objectives.json"),
  sourceRegistrySha256: fileHash("content/standards/source-registry.json"),
};
const allRecords = [];
const packetFiles = [];
const partition = {};

for (const [framework, authority] of Object.entries(authorities)) {
  const boundaryHash = sha(`${authority.sourceUrl}|${authority.sourcePdfUrl ?? ""}|${authority.sourceBoundary}|${authority.officialText}`);
  for (const [code, contract] of Object.entries(authority.codes)) {
    const scope = dossiers.filter((dossier) => dossier.framework === framework
      && dossier.candidateCode === code
      && dossier.review?.status === "candidate"
      && !decided.has(dossier.edgeId));
    if (scope.length !== contract.count) throw new Error(`${framework}|${code}: expected ${contract.count}, found ${scope.length}`);
    partition[`${framework}|${code}`] = scope.length;

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
          reviewer: `chatgpt-work-s250-${framework.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-${code.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-${String(batch).padStart(2, "0")}`,
          reviewedAt: `2026-08-18T22:${String((packetFiles.length * 3 + batch) % 60).padStart(2, "0")}:00.000Z`,
          notes: `Reject the ${dossier.objectiveId} -> ${code} edge because ${code} identifies the ${contract.label} category or portfolio scope, not an exact assessable ${framework} standard. Evidence for “${dossier.objectiveTitle}” must be remapped and compared with complete exact descendant wording. No transfer or mastery inference was used.`,
          approvedDepth: null,
          officialTextSnapshot: authority.officialText,
          officialSourceUrl: authority.sourceUrl,
          claimBoundary: `This decision rejects only the coarse ${code} portfolio locator. It makes no approval or rejection claim for any exact descendant standard, benchmark, state addition, course limit, process standard, or Mathematical Practice.`,
          dossierHash: candidateDossierHash(dossier),
          candidateCode: code,
          officialSourceBoundary: authority.sourceBoundary,
          officialSourceBoundaryHash: boundaryHash,
          ...(authority.sourcePdfUrl ? { officialPdfUrl: authority.sourcePdfUrl } : {}),
          sourceArtifactHashes: { ...sourceArtifactHashes, officialBoundarySnapshotSha256: boundaryHash },
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
            `${code} supplies no exact assessable action, conditions, representation, or limits.`,
            `Full-intent comparison requires a complete exact descendant beneath the ${contract.label} category or scope.`,
            "The bounded lesson evidence cannot establish alignment to an entire high-school conceptual category or portfolio scope.",
            "Challenge and transfer tags were not used to infer transfer or mastery.",
          ],
          replacementReview: {
            required: true,
            candidateFamiliesOnly: contract.routes,
            boundary: "Routing hints only; every exact descendant requires a new source-backed full-intent review.",
          },
        };
        return { ...unsigned, signature: sha(JSON.stringify(unsigned)) };
      });

      const frameworkSlug = framework.replaceAll(/[^A-Za-z0-9]+/g, "_");
      const codeSlug = code.replaceAll(/[^A-Za-z0-9]+/g, "_");
      const file = `reports/closure/candidates/S250_${frameworkSlug}_${codeSlug}_CATEGORY_SCOPE_BATCH${String(batch).padStart(2, "0")}.jsonl`;
      if (generate) fs.writeFileSync(path.join(root, file), `${records.map(JSON.stringify).join("\n")}\n`, "utf8");
      const loaded = read(file).trim().split(/\r?\n/).map(JSON.parse);
      if (loaded.length !== records.length || loaded.some((record, index) => record.edgeId !== records[index].edgeId)) throw new Error(`${file}: packet drift`);
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
}

if (allRecords.length !== 1065 || new Set(allRecords.map((record) => record.edgeId)).size !== 1065) {
  throw new Error("Aggregate remaining high-school category coverage drift");
}

if (generate) {
  fs.writeFileSync(path.join(root, "reports/standards/S250_REMAINING_HIGH_SCHOOL_CATEGORY_SCOPE_PORTFOLIO.md"), `# S250 remaining high-school category-scope portfolio

- Verdict: 1,065 signed, bounded rejections of coarse category/portfolio locators only.
- Frameworks: Common Core 355; California 355; Florida 355.
- Exact-code partition: ${Object.entries(partition).map(([key, count]) => `${key} ${count}`).join("; ")}.
- Packets: ${packetFiles.length}, each at most 40 edges.
- Exact or descendant decisions changed: 0.
- Transfer/mastery evidence used: false for 1,065/1,065.
- Aggregate packet seal: \`${sha(allRecords.map((record) => record.signature).join("\n"))}\`

Official sources:
- Common Core: ${authorities["CCSS-MATH"].sourceUrl}
- California: ${authorities["CA-CCSSM"].sourcePdfUrl}
- Florida: ${authorities["FL-BEST-MATH"].sourcePdfUrl}

Every exact descendant remains open for a separate full-intent review.
`, "utf8");
}

console.log(JSON.stringify({ status: "PASS", decisions: allRecords.length, packets: packetFiles.length, partition, packetFiles, aggregateSeal: sha(allRecords.map((record) => record.signature).join("\n")) }, null, 2));
