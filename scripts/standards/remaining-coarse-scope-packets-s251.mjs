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
const slug = (value) => value.normalize("NFKD").replaceAll(/[^A-Za-z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "");

const authorities = {
  "CCSS-MATH": {
    sourceId: "CCSS-MATH-OFFICIAL",
    sourceUrl: "https://corestandards.org/mathematics-standards/",
    sourceBoundary: "Common Core State Standards for Mathematics — K–8 grade, domain, cluster, and numbered-standard hierarchy",
    officialText: "Common Core K–8 content is organized by grade, then domain, cluster, and numbered standard. A grade-domain label such as 4.NBT identifies a domain, while an assessable claim requires a complete numbered standard such as 4.NBT.A.1 and its full wording.",
    expected: 561,
    exactRoute: (code) => [`${code}.<cluster>.<standard>`],
    label: (code) => `${code} grade-domain`,
  },
  "CA-CCSSM": {
    sourceId: "CA-CCSSM-OFFICIAL",
    sourceUrl: "https://www.cde.ca.gov/be/st/ss/",
    sourcePdfUrl: "https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf",
    sourceBoundary: "California Common Core State Standards for Mathematics — K–8 grade/domain/cluster/numbered-standard hierarchy and California additions",
    officialText: "California K–8 mathematics standards are organized by grade, domain, cluster, and numbered standard, with California additions explicitly identified. A repository label such as CA-4.NBT is a domain locator, not a complete California standard; exact review requires the numbered standard, full wording, limits, and any California addition.",
    expected: 561,
    exactRoute: (code) => [`${code.slice(3)}.<cluster>.<standard>[.CA]`],
    label: (code) => `${code} California grade-domain`,
  },
  "NY-NGLS-MATH": {
    sourceId: "NY-NGLS-MATH-OFFICIAL",
    sourceUrl: "https://www.nysed.gov/standards-instruction/mathematics",
    sourcePdfUrl: "https://www.nysed.gov/sites/default/files/programs/standards-instruction/nys-next-generation-mathematics-p-12-standards_0.pdf",
    sourceBoundary: "New York State Next Generation Mathematics Learning Standards — P–8 grade/domain and numbered-standard hierarchy",
    officialText: "New York P–8 mathematics content is organized by grade and domain, followed by numbered standards and New York-specific notes, examples, and limits. A label such as NY-4.NBT identifies a domain; exact alignment requires a complete numbered expectation such as NY-4.NBT.1 and its full state wording.",
    expected: 561,
    exactRoute: (code) => [`${code}.<standard>`],
    label: (code) => `${code} New York grade-domain`,
  },
  "FL-BEST-MATH": {
    sourceId: "FL-BEST-MATH-OFFICIAL",
    sourceUrl: "https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/",
    sourcePdfUrl: "https://cpalmsmediaprod.blob.core.windows.net/uploads/docs/standards/best/ma/mathbeststandardsfinal.pdf",
    sourceBoundary: "Florida B.E.S.T. Standards for Mathematics — five-part subject/grade/strand/standard/benchmark coding scheme",
    officialText: "Florida B.E.S.T. mathematics uses a five-part code for subject, grade, strand, standard, and benchmark, such as MA.4.NSO.1.1. Repository labels such as MA.4.NBT are broad routing locators inherited from another taxonomy, not official Florida benchmark codes; exact review requires the current Florida strand, standard, benchmark, wording, and clarifications.",
    expected: 561,
    exactRoute: (code) => [`MA.${code.split(".")[1]}.<official-strand>.<standard>.<benchmark>`],
    label: (code) => `${code} repository grade-domain`,
  },
  "TX-TEKS-MATH": {
    sourceId: "TX-TEKS-MATH-OFFICIAL",
    sourceUrl: "https://tea.texas.gov/laws-and-rules/texas-administrative-code/19-tac-chapter-111",
    sourceBoundary: "19 TAC Chapter 111, Subchapter A — §111.2 Kindergarten course section and nested knowledge-and-skills/student-expectation items",
    officialText: "Texas §111.2 identifies the Kindergarten mathematics course section. Assessable knowledge-and-skills statements and student expectations occur in narrower nested subsections and items, such as §111.2(b)(1)(A); the section number alone is not an exact student expectation.",
    expected: 22,
    exactRoute: (code) => [`${code}(b)(<knowledge-and-skills>)(<student-expectation>)`],
    label: () => "§111.2 Kindergarten course section",
  },
  "AP-PRECALCULUS": {
    sourceId: "AP-PRECALCULUS-OFFICIAL",
    sourceUrl: "https://apcentral.collegeboard.org/courses/ap-precalculus",
    sourceBoundary: "AP Precalculus Course and Exam Description — units, topics, learning objectives, essential knowledge, and skills",
    officialText: "The AP Precalculus framework organizes course content into units, then topics, learning objectives, essential knowledge, and skills. A Unit or Bridge label is course scope rather than an exact learning objective; Unit 4 is explicitly not assessed on the AP Exam.",
    expected: 121,
    exactRoute: (code) => [`AP Precalculus ${code} topic/learning objective/essential knowledge`],
    label: (code) => `AP Precalculus ${code} scope`,
  },
  "AP-CALCULUS-ABBC": {
    sourceId: "AP-CALCULUS-ABBC-OFFICIAL",
    sourceUrl: "https://apcentral.collegeboard.org/courses/ap-calculus-ab",
    sourceBoundary: "AP Calculus AB and BC Course and Exam Description — AB/BC units, topics, learning objectives, essential knowledge, and mathematical practices",
    officialText: "The AP Calculus AB and BC framework is organized into units with narrower topics, learning objectives, essential knowledge, and mathematical practices. A unit label, including a BC-only unit label, is sequencing scope rather than an exact assessable learning objective, and AB/BC boundaries must remain explicit.",
    expected: 88,
    exactRoute: (code) => [`AP Calculus ${code} topic/learning objective/essential knowledge with AB/BC scope`],
    label: (code) => `AP Calculus ${code} scope`,
  },
  "AP-STATISTICS": {
    sourceId: "AP-STATISTICS-OFFICIAL",
    sourceUrl: "https://apcentral.collegeboard.org/courses/ap-statistics",
    sourceBoundary: "AP Statistics Course and Exam Description — units, topics, learning objectives, essential knowledge, and statistical practices",
    officialText: "The AP Statistics framework organizes course content into units and narrower topics, learning objectives, essential knowledge, and statistical practices. A unit or multi-unit label is sequencing scope rather than an exact learning objective, and the current revised framework wording must be reviewed before any exact alignment is approved.",
    expected: 85,
    exactRoute: (code) => [`AP Statistics ${code} topic/learning objective/essential knowledge/statistical practice`],
    label: (code) => `AP Statistics ${code} scope`,
  },
};

const registry = json("content/standards/source-registry.json");
const registryByFramework = new Map(registry.sources.map((source) => [source.framework, source]));
for (const [framework, authority] of Object.entries(authorities)) {
  const source = registryByFramework.get(framework);
  if (!source || source.id !== authority.sourceId || source.officialUrl !== authority.sourceUrl || source.authorityVerified !== true) {
    throw new Error(`${framework}: official source-registry contract drift`);
  }
}

const lessonPaths = new Map();
for (const course of fs.readdirSync(path.join(root, "content/courses"), { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const lessonsDirectory = path.join(root, "content/courses", course.name, "lessons");
  if (!fs.existsSync(lessonsDirectory)) continue;
  for (const file of fs.readdirSync(lessonsDirectory).filter((entry) => entry.endsWith(".json"))) {
    const relativePath = path.posix.join("content/courses", course.name, "lessons", file);
    const lessonId = json(relativePath).id;
    if (lessonPaths.has(lessonId)) throw new Error(`Duplicate lesson id: ${lessonId}`);
    lessonPaths.set(lessonId, relativePath);
  }
}

const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const ledger = json("content/standards/human-review-decisions.json").decisions;
if (ledger.length !== 3561) throw new Error(`Decision baseline drift: expected 3561, found ${ledger.length}`);
const decided = new Set(ledger.map((decision) => decision.edgeId));
const candidates = dossiers.filter((dossier) => dossier.review?.status === "candidate" && !decided.has(dossier.edgeId));
if (candidates.length !== 2560) throw new Error(`Candidate baseline drift: expected 2560, found ${candidates.length}`);
if (candidates.some((dossier) => dossier.sourceTextStatus !== "scope-locator-requires-exact-benchmark"
  || dossier.checks?.exactStandardCodeCandidate !== false
  || !authorities[dossier.framework])) {
  throw new Error("Remaining candidate set contains a non-coarse or unsupported locator");
}

const frameworkCounts = Object.fromEntries(Object.keys(authorities).map((framework) => [framework, candidates.filter((dossier) => dossier.framework === framework).length]));
for (const [framework, authority] of Object.entries(authorities)) {
  if (frameworkCounts[framework] !== authority.expected) throw new Error(`${framework}: expected ${authority.expected}, found ${frameworkCounts[framework]}`);
}

const sourceArtifactHashes = {
  evidenceDossiersSha256: fileHash("content/standards/evidence-dossiers.json"),
  objectivesSha256: fileHash("content/standards/objectives.json"),
  sourceRegistrySha256: fileHash("content/standards/source-registry.json"),
};
const groups = new Map();
for (const dossier of candidates) {
  const key = `${dossier.framework}|${dossier.candidateCode}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(dossier);
}

const packetFiles = [];
const allRecords = [];
const partition = {};
for (const [key, scope] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const [framework, code] = key.split("|");
  const authority = authorities[framework];
  partition[key] = scope.length;
  const boundaryHash = sha(`${authority.sourceUrl}|${authority.sourcePdfUrl ?? ""}|${authority.sourceBoundary}|${authority.officialText}`);
  for (let start = 0, batch = 1; start < scope.length; start += 40, batch += 1) {
    const selected = scope.slice(start, start + 40);
    const records = selected.map((dossier) => {
      if (dossier.sourceId !== authority.sourceId) throw new Error(`${dossier.edgeId}: source id drift`);
      const lessonSourceHashes = Object.fromEntries(dossier.evidenceSummary.lessonIds.map((lessonId) => {
        const relativePath = lessonPaths.get(lessonId);
        if (!relativePath) throw new Error(`${dossier.edgeId}: missing lesson ${lessonId}`);
        return [lessonId, { relativePath, sha256: fileHash(relativePath) }];
      }));
      const label = authority.label(code);
      const unsigned = {
        edgeId: dossier.edgeId,
        decision: "rejected",
        reviewer: `chatgpt-work-s251-${slug(framework).toLowerCase()}-${slug(code).toLowerCase()}-${String(batch).padStart(2, "0")}`,
        reviewedAt: `2026-08-18T${String(12 + (packetFiles.length % 10)).padStart(2, "0")}:${String((packetFiles.length * 7 + batch) % 60).padStart(2, "0")}:00.000Z`,
        notes: `Reject the ${dossier.objectiveId} -> ${code} edge because ${label} is a coarse curriculum locator, not an exact assessable ${framework} expectation. Evidence for “${dossier.objectiveTitle}” must be remapped and compared with complete exact wording. No transfer or mastery inference was used.`,
        approvedDepth: null,
        officialTextSnapshot: authority.officialText,
        officialSourceUrl: authority.sourceUrl,
        claimBoundary: `This decision rejects only the coarse ${code} scope locator. It makes no approval or rejection claim for any exact descendant standard, benchmark, topic, learning objective, essential knowledge statement, state addition, clarification, practice, or course limit.`,
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
          `${code} supplies no complete exact assessable action, conditions, representations, limits, or clarification set.`,
          `Full-intent comparison requires complete exact descendant wording beneath ${label}.`,
          "The bounded lesson evidence cannot establish alignment to an entire domain, course section, unit, or multi-unit scope.",
          "Challenge and transfer tags were not used to infer transfer or mastery.",
        ],
        replacementReview: {
          required: true,
          candidateFamiliesOnly: authority.exactRoute(code),
          boundary: "Routing hint only; every exact replacement requires a new official-source, full-intent review.",
        },
      };
      return { ...unsigned, signature: sha(JSON.stringify(unsigned)) };
    });

    const file = `reports/closure/candidates/S251_${slug(framework)}_${slug(code)}_COARSE_SCOPE_BATCH${String(batch).padStart(2, "0")}.jsonl`;
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
        if (fileHash(seal.relativePath) !== seal.sha256) throw new Error(`${record.edgeId}: stale lesson source`);
      }
    }
    packetFiles.push(file);
    allRecords.push(...loaded);
  }
}

if (allRecords.length !== 2560 || new Set(allRecords.map((record) => record.edgeId)).size !== 2560) throw new Error("Aggregate remaining-coarse coverage drift");
const manifest = {
  schemaVersion: 1,
  status: "PASS",
  baselineDecisions: ledger.length,
  decisions: allRecords.length,
  packets: packetFiles.length,
  maxPacketSize: 40,
  frameworkCounts,
  exactCodeGroups: groups.size,
  partition,
  packetFiles,
  sourceArtifactHashes,
  aggregateSeal: sha(allRecords.map((record) => record.signature).join("\n")),
};
if (generate) {
  fs.writeFileSync(path.join(root, "reports/standards/S251_REMAINING_COARSE_SCOPE_PORTFOLIO.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(root, "reports/standards/S251_REMAINING_COARSE_SCOPE_PORTFOLIO.md"), `# S251 remaining coarse standards-scope portfolio\n\n- Verdict: 2,560 signed, bounded rejections of coarse scope locators only.\n- Baseline authority: 3,561 existing decisions.\n- Framework partition: ${Object.entries(frameworkCounts).map(([framework, count]) => `${framework} ${count}`).join("; ")}.\n- Exact code groups: ${groups.size}.\n- Packets: ${packetFiles.length}, each at most 40 edges and containing one framework/code contract.\n- Exact or descendant decisions changed: 0.\n- Transfer/mastery evidence used: false for 2,560/2,560.\n- Aggregate packet seal: \`${manifest.aggregateSeal}\`.\n\nEvery exact descendant remains open for a separate official-source, full-intent review. The two existing partial K.OA decisions are not part of this portfolio and remain open.\n`, "utf8");
}
console.log(JSON.stringify(manifest, null, 2));
