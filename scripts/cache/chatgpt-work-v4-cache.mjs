#!/usr/bin/env node
/**
 * Maggie's Trail V4 ChatGPT Work content-addressed precache.
 *
 * The cache is a derived evidence accelerator. It stores hashes, counts, compact dependency
 * partitions, and artifact references; it never copies lesson prose, standards text, audit logs,
 * screenshots, or semantic approval state. Repository source and explicit decision ledgers remain
 * authoritative.
 *
 * Usage:
 *   node scripts/cache/chatgpt-work-v4-cache.mjs
 *   node scripts/cache/chatgpt-work-v4-cache.mjs --check
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const EXTRACTOR_VERSION = 1;
const PROMPT_SCHEMA_VERSION = 1;
const CACHE_ROOT = join(ROOT, ".chatgpt-work-cache", "maggies-v4");
const TRACKED_MANIFEST = join(ROOT, "reports", "cache", "CHATGPT_WORK_V4_PRECACHE_MANIFEST.json");
const TRACKED_REPORT = join(ROOT, "reports", "cache", "CHATGPT_WORK_V4_PRECACHE.md");
const PREFIX_PATH = "reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md";
const POLICY_PIN_PATH = "reports/cache/CHATGPT_WORK_V4_POLICY_PIN.json";
const BUILDER_PATH = "scripts/cache/chatgpt-work-v4-cache.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const posix = (value) => value.split(sep).join("/");
const relativePath = (file) => posix(relative(ROOT, file));
const read = (file) => readFileSync(join(ROOT, file));
const text = (file) => readFileSync(join(ROOT, file), "utf8");

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

const SKIP_DIRS = new Set([
  ".git", ".next", ".cowork-cache", ".chatgpt-work-cache", ".cml-build", ".turbo",
  "node_modules", "coverage", "test-results", "playwright-report", "art"
]);

function walk(dir, output = []) {
  if (!existsSync(dir)) return output;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, output);
    else if (entry.isFile()) output.push(posix(relative(ROOT, absolute)));
  }
  return output;
}

const repositoryPaths = walk(ROOT);
const repositoryPathSet = new Set(repositoryPaths);
const fileRecords = new Map();
function fileRecord(file) {
  if (!repositoryPathSet.has(file)) throw new Error(`Missing precache input: ${file}`);
  if (!fileRecords.has(file)) {
    const bytes = read(file);
    fileRecords.set(file, { path: file, sha256: sha256(bytes), bytes: bytes.length });
  }
  return fileRecords.get(file);
}

function uniqueSorted(paths) {
  return [...new Set(paths.filter((file) => repositoryPathSet.has(file)))].sort();
}

function dependencyGroup(id, purpose, paths, representativeRefs = []) {
  const records = uniqueSorted(paths).map(fileRecord);
  if (records.length === 0) throw new Error(`Dependency group ${id} has no inputs`);
  return {
    id,
    purpose,
    sha256: sha256(records.map((record) => `${record.path}\0${record.sha256}\0${record.bytes}\0`).join("")),
    fileCount: records.length,
    bytes: records.reduce((sum, record) => sum + record.bytes, 0),
    representativeRefs: representativeRefs.filter((file) => repositoryPathSet.has(file))
  };
}

const curriculumPaths = repositoryPaths.filter((file) =>
  /^content\/courses\/[^/]+\/(?:course\.json|lessons\/[^/]+\.json)$/.test(file)
  || ["content/curriculum-manifest.json", "content/skill-prereqs.json"].includes(file)
);
const standardsPaths = repositoryPaths.filter((file) => file.startsWith("content/standards/") && file.endsWith(".json"));
const masteryPaths = repositoryPaths.filter((file) => file.startsWith("content/mastery/") && file.endsWith(".json"));
const generatorPaths = repositoryPaths.filter((file) =>
  (/^src\/lib\/.*Variants\.ts$/i.test(file)
    || /^src\/lib\/.*VariantTemplates\.json$/i.test(file)
    || [
      "src/lib/variants.ts", "src/lib/lessonVariants.ts", "src/lib/authoredTemplateVariants.ts",
      "src/lib/prng.ts", "src/lib/personalize.ts", "src/lib/antiRepeat.ts", "GENERATOR_INVENTORY.json"
    ].includes(file))
  && !/\.test\./.test(file)
);
const widgetPaths = repositoryPaths.filter((file) =>
  ([
    "src/components/widgets.tsx", "src/components/WidgetView.tsx", "src/components/widgetSamples.ts",
    "src/components/LessonPlayer.tsx", "src/lib/schema.ts", "src/lib/personalize.ts"
  ].includes(file)
    || (file.startsWith("src/components/widgets/") && /\.(?:ts|tsx)$/.test(file)))
  && !/\.test\./.test(file)
);
const evaluatorPaths = repositoryPaths.filter((file) =>
  [
    "src/lib/evaluate.ts", "src/lib/describeState.ts", "src/lib/schema.ts",
    "src/lib/math/authoredMath.ts", "src/lib/math/renderMath.ts", "src/components/math/MathText.tsx"
  ].includes(file)
  || (file.startsWith("src/lib/mmip/") && /\.(?:ts|tsx)$/.test(file) && !/\.test\./.test(file))
);
const visualPaths = repositoryPaths.filter((file) =>
  [
    "src/components/FigureView.tsx", "src/components/figures.tsx", "src/components/figureIds.ts",
    "src/components/CurriculumIcon.tsx", "src/components/CurriculumIcon.module.css",
    "src/components/AvatarDisplay.tsx", "src/components/AvatarPicker.tsx", "src/components/brand.tsx",
    "src/lib/curriculumIcons.ts", "src/lib/avatars.ts", "src/lib/mathSymbolAvatars.ts"
  ].includes(file)
  || /^(?:public\/(?:avatars|brand|icons|illustrations|math-symbols)|reports\/curriculum-icons)\//.test(file)
);
const contractCodePaths = repositoryPaths.filter((file) =>
  ["src/lib/schema.ts", "src/lib/pedagogy.ts", "scripts/engine-capabilities.json"].includes(file)
  || (file.startsWith("src/lib/cml/") && /\.(?:ts|json)$/.test(file) && !/\.test\./.test(file))
);
const rubricPaths = uniqueSorted([
  PREFIX_PATH, POLICY_PIN_PATH,
  "PEDAGOGICAL_PERCEPTUAL_BASELINE.md", "PREMIUM_EXPERIENCE_CONTRACT.md",
  "QA_INDEPENDENT_ASSESSMENT_RUBRIC.md", "MATHEMATICAL_WRITING_STANDARD.md",
  "GRAPH_FIGURE_STANDARD.md", "FLAGSHIP_TIERS.md", "GEN03_DISTRACTOR_CONTRACT.md",
  "GENERATED_CORPUS_CONTRACTS.md", "PLAYER_HARNESS_CONTRACT_S127.md",
  "PLAYER_HARNESS_CONTRACT_S127.json", "ENGINE_REGISTRATION_CONTRACT_S126.md",
  "ENGINE_REGISTRATION_CONTRACT_S126.json", "WS_E_PREDICTION_RUBRIC.md",
  "ARCH_03_04_SPECIFICATION.md", "CML_WAIVERS.json", "AVATAR_ART_PRODUCTION_SPEC.md",
  "CURRICULUM_ICON_ART_PRODUCTION_SPEC.md", "AVATAR_V4_PRODUCTION_RUNBOOK.md"
]);
const standardsToolPaths = repositoryPaths.filter((file) =>
  ["scripts/build-standards-evidence-dossiers.mjs", "scripts/review-standards-evidence.mjs"].includes(file)
  || file.startsWith("scripts/standards/")
  || /^scripts\/audit\/(?:standards-|verify-hs-coverage)/.test(file)
  || /^src\/lib\/standards(?:Evidence|\.server)?\.ts$/.test(file)
);
const detectorPaths = uniqueSorted([
  "scripts/audit/consolidate-pending-workload-s236.mjs",
  "scripts/audit/lesson-review-cards-s244.mjs",
  "scripts/cml-lint.mjs", "scripts/cml-audit.mjs",
  "scripts/audit/math-presentation-indexes.mts",
  "scripts/audit/figure-text-alignment.mjs",
  "scripts/verify-visual-explanations.mjs",
  "src/lib/content.duplicateItems.s242.test.ts"
]);
const evidencePaths = repositoryPaths.filter((file) =>
  [
    "PREMIUM_PENDING_WORKLOAD_QUEUE.csv", "PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md",
    "CML_STRICT_LEDGER.json", "reports/V4_IMPLEMENTATION_STATUS_S244.md",
    "reports/closure/LESSON_REVIEW_CARDS_S244.json",
    "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl"
  ].includes(file)
  || /^(?:reports\/(?:mcq|vis|math-presentation|generator-audit|release))\//.test(file)
);
const dependencyInputPaths = uniqueSorted([
  ...curriculumPaths, ...standardsPaths, ...masteryPaths, ...rubricPaths, ...contractCodePaths,
  ...generatorPaths, ...widgetPaths, ...evaluatorPaths, ...visualPaths, ...standardsToolPaths,
  ...detectorPaths, ...evidencePaths
]);

const groups = [
  dependencyGroup("curriculum", "Live course metadata, authored lessons, curriculum manifest, and prerequisites.", curriculumPaths,
    ["content/curriculum-manifest.json", "content/skill-prereqs.json"]),
  dependencyGroup("standards", "Candidate standards sources, maps, dossiers, and explicit standards decisions.", standardsPaths,
    ["content/standards/evidence-dossiers.json", "content/standards/human-review-decisions.json"]),
  dependencyGroup("mastery", "Derived objectives and mastery contracts referenced by standards/review evidence.", masteryPaths,
    ["content/mastery/infrastructure-metrics.json"]),
  dependencyGroup("rubric-contract", "Pinned V4 policy derivative, review rubrics, family contracts, and approved exceptions.", rubricPaths,
    [PREFIX_PATH, POLICY_PIN_PATH, "QA_INDEPENDENT_ASSESSMENT_RUBRIC.md"]),
  dependencyGroup("contract-code", "Executable schema, pedagogy, CML, and engine-capability contracts.", contractCodePaths,
    ["src/lib/schema.ts", "src/lib/pedagogy.ts", "scripts/engine-capabilities.json"]),
  dependencyGroup("generators", "Generator registry, forms, templates, resolver, deterministic PRNG, and anti-repeat behavior.", generatorPaths,
    ["src/lib/variants.ts", "src/lib/prng.ts", "src/lib/antiRepeat.ts"]),
  dependencyGroup("widgets", "Learner interaction renderer, widget registry, player boundary, and schema dependency.", widgetPaths,
    ["src/components/widgets.tsx", "src/components/WidgetView.tsx", "src/components/LessonPlayer.tsx"]),
  dependencyGroup("evaluators", "Answer evaluation, state descriptions, MMIP behavior, and mathematical rendering boundary.", evaluatorPaths,
    ["src/lib/evaluate.ts", "src/lib/describeState.ts", "src/lib/math/renderMath.ts"]),
  dependencyGroup("visuals-assets", "Figure/icon/avatar registries, accessible renderers, and production visual assets.", visualPaths,
    ["src/components/figures.tsx", "src/components/figureIds.ts", "src/lib/curriculumIcons.ts"]),
  dependencyGroup("standards-toolchain", "Standards dossier, review, generation, coverage, and verification tools.", standardsToolPaths,
    ["scripts/build-standards-evidence-dossiers.mjs", "scripts/review-standards-evidence.mjs"]),
  dependencyGroup("review-detectors", "Definitions for queue, review-card, duplicate, visual, presentation, and CML evidence.", detectorPaths,
    ["scripts/audit/consolidate-pending-workload-s236.mjs", "scripts/audit/lesson-review-cards-s244.mjs"]),
  dependencyGroup("evidence-artifacts", "Compact authoritative queue/review references and specialist audit outputs.", evidencePaths,
    ["PREMIUM_PENDING_WORKLOAD_QUEUE.csv", "reports/closure/LESSON_REVIEW_CARDS_S244.json"])
];
const groupById = new Map(groups.map((group) => [group.id, group]));

function coursePartitions() {
  const coursesRoot = join(ROOT, "content", "courses");
  const partitions = [];
  for (const entry of readdirSync(coursesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const prefix = `content/courses/${entry.name}/`;
    const paths = curriculumPaths.filter((file) => file.startsWith(prefix));
    const coursePath = `${prefix}course.json`;
    if (!paths.includes(coursePath)) continue;
    const course = JSON.parse(text(coursePath));
    const lessonPaths = paths.filter((file) => file.includes("/lessons/"));
    let stepCount = 0;
    for (const lessonPath of lessonPaths) {
      const parsed = JSON.parse(text(lessonPath));
      const lesson = parsed.lesson ?? parsed;
      stepCount += Array.isArray(lesson.steps) ? lesson.steps.length : 0;
    }
    const records = paths.sort().map(fileRecord);
    partitions.push({
      courseId: String(course.id ?? entry.name),
      gradeLevel: Number(course.gradeLevel),
      sourcePrefix: prefix,
      lessonCount: lessonPaths.length,
      stepCount,
      fileCount: records.length,
      bytes: records.reduce((sum, record) => sum + record.bytes, 0),
      sha256: sha256(records.map((record) => `${record.path}\0${record.sha256}\0${record.bytes}\0`).join(""))
    });
  }
  return partitions.sort((a, b) => a.gradeLevel - b.gradeLevel || a.courseId.localeCompare(b.courseId));
}

function parseCsvRows(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function csvRecordCount(file) {
  const withoutComments = text(file).split(/\r?\n/).filter((line) => !line.startsWith("#")).join("\n");
  return Math.max(parseCsvRows(withoutComments).length - 1, 0);
}

function artifact(id, file, recordCount, countLabel, authority) {
  const record = fileRecord(file);
  return { id, path: file, sha256: record.sha256, bytes: record.bytes, recordCount, countLabel, authority };
}

const reviewCards = JSON.parse(text("reports/closure/LESSON_REVIEW_CARDS_S244.json"));
const standardsDossiers = JSON.parse(text("content/standards/evidence-dossiers.json"));
const standardsMap = JSON.parse(text("content/standards/lesson-evidence-map.json"));
const standardsDecisions = JSON.parse(text("content/standards/human-review-decisions.json"));
const cmlLedger = JSON.parse(text("CML_STRICT_LEDGER.json"));
const queueSummaryText = text("PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md");
const queueDeclaredSeal = queueSummaryText.match(/Curriculum source seal:\s*`([a-f0-9]{64})`/i)?.[1] ?? null;
const partitions = coursePartitions();
const lessonPaths = partitions.flatMap((partition) =>
  curriculumPaths.filter((file) => file.startsWith(partition.sourcePrefix) && file.includes("/lessons/"))
).sort((a, b) => {
  const aId = basename(a, ".json");
  const bId = basename(b, ".json");
  return aId.localeCompare(bId);
});
const queueCompatibleLessonSeal = sha256(lessonPaths.map((file) => `${file}\0${text(file)}\0`).join(""));

const artifactRefs = [
  artifact("pending-workload", "PREMIUM_PENDING_WORKLOAD_QUEUE.csv", csvRecordCount("PREMIUM_PENDING_WORKLOAD_QUEUE.csv"), "queue rows", "authoritative open-work view when its declared curriculum seal matches"),
  artifact("lesson-review-cards", "reports/closure/LESSON_REVIEW_CARDS_S244.json", reviewCards.cards?.length ?? 0, "lesson cards", "materialized view; human decision ledger remains authority"),
  artifact("lesson-review-decisions", "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl", Math.max(text("reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl").trim().split(/\r?\n/).length - 1, 0), "human decision records", "append-only whole-lesson decision authority"),
  artifact("exact-mcq-duplicates", "reports/mcq/MCQ_DUPLICATE_ITEM_INDEX.csv", csvRecordCount("reports/mcq/MCQ_DUPLICATE_ITEM_INDEX.csv"), "duplicate clusters", "derived exact-identity evidence, not semantic disposition"),
  artifact("visual-placement-index", "reports/vis/VIS01_PLACEMENTS.csv", csvRecordCount("reports/vis/VIS01_PLACEMENTS.csv"), "visual placements", "derived visual evidence"),
  artifact("choice-surface-index", "reports/mcq/MCQ_LEAKAGE_INDEX.csv", csvRecordCount("reports/mcq/MCQ_LEAKAGE_INDEX.csv"), "choice findings", "derived authoring evidence"),
  artifact("standards-dossiers", "content/standards/evidence-dossiers.json", standardsDossiers.dossiers?.length ?? 0, "candidate standards edges", "candidate evidence only"),
  artifact("standards-lesson-map", "content/standards/lesson-evidence-map.json", standardsMap.lessons?.length ?? 0, "candidate-mapped lessons", "candidate evidence only"),
  artifact("standards-decisions", "content/standards/human-review-decisions.json", standardsDecisions.decisions?.length ?? 0, "human standards decisions", "only standards approval/rejection authority"),
  artifact("strict-cml-ledger", "CML_STRICT_LEDGER.json", (cmlLedger.errors?.length ?? 0) + (cmlLedger.warnings?.length ?? 0), "strict findings", "generated strict structural evidence")
];

function directoryArtifact(id, prefix, countLabel, authority) {
  const paths = evidencePaths.filter((file) => file.startsWith(prefix));
  const records = paths.map(fileRecord);
  return {
    id,
    path: `${prefix}*`,
    sha256: sha256(records.map((record) => `${record.path}\0${record.sha256}\0${record.bytes}\0`).join("")),
    bytes: records.reduce((sum, record) => sum + record.bytes, 0),
    recordCount: paths.filter((file) => file.endsWith(".csv")).reduce((sum, file) => sum + csvRecordCount(file), 0),
    countLabel,
    fileCount: paths.length,
    authority
  };
}
artifactRefs.push(
  directoryArtifact("math-presentation-indexes", "reports/math-presentation/", "CSV findings", "derived presentation evidence"),
  directoryArtifact("generator-audit-indexes", "reports/generator-audit/", "CSV findings", "derived generator evidence")
);

const prefixBytes = read(PREFIX_PATH);
const policyPin = JSON.parse(text(POLICY_PIN_PATH));
const packageJson = JSON.parse(text("package.json"));
const baseCommit = (() => {
  try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); }
  catch { return "unavailable"; }
})();
const dependencyHashes = Object.fromEntries(groups.map((group) => [group.id, group.sha256]).sort(([a], [b]) => a.localeCompare(b)));
const sealBasis = {
  extractorVersion: EXTRACTOR_VERSION,
  promptSchemaVersion: PROMPT_SCHEMA_VERSION,
  baseCommit,
  nodeVersion: process.version,
  builderSha256: fileRecord(BUILDER_PATH).sha256,
  canonicalPolicySha256: policyPin.canonicalExternalSha256,
  exactPrefixSha256: sha256(prefixBytes),
  packageJsonSha256: fileRecord("package.json").sha256,
  packageLockSha256: fileRecord("package-lock.json").sha256,
  dependencyGroups: dependencyHashes
};
const cacheSeal = sha256(stable(sealBasis));
const cacheRelativePath = `.chatgpt-work-cache/maggies-v4/${cacheSeal}/`;
const cachePath = join(CACHE_ROOT, cacheSeal);

const packetFamilies = [
  ["lesson-review", ["curriculum", "rubric-contract", "contract-code", "generators", "widgets", "evaluators", "visuals-assets", "standards", "review-detectors", "evidence-artifacts"]],
  ["generator-family", ["curriculum", "rubric-contract", "contract-code", "generators", "widgets", "evaluators", "review-detectors", "evidence-artifacts"]],
  ["visual-first", ["curriculum", "rubric-contract", "widgets", "evaluators", "visuals-assets", "review-detectors", "evidence-artifacts"]],
  ["standards", ["curriculum", "standards", "mastery", "rubric-contract", "contract-code", "standards-toolchain", "evidence-artifacts"]],
  ["identity-assets", ["rubric-contract", "visuals-assets", "evidence-artifacts"]]
].map(([id, inputGroups]) => ({
  id,
  inputGroups,
  dependencySha256: sha256(stable(inputGroups.map((groupId) => [groupId, groupById.get(groupId).sha256])))
}));

const packetTemplate = {
  schemaVersion: 1,
  promptSchemaVersion: PROMPT_SCHEMA_VERSION,
  exactPrefix: {
    id: "MT-V4-WORKER-PREFIX-1",
    trackedPath: PREFIX_PATH,
    cachePath: "worker-prefix.md",
    sha256: sha256(prefixBytes),
    appendMarker: "--- PACKET EVIDENCE ---"
  },
  assembly: [
    "Copy worker-prefix.md byte-for-byte.",
    "Append one blank line, the exact append marker, then one schema-constrained packet suffix.",
    "Keep variable evidence after the stable prefix so supported prompt-caching paths can reuse it."
  ],
  immutablePacketFields: [
    "packet_id", "risk_class", "required_role", "base_commit", "cache_seal", "contract_hash",
    "scope_ids", "owned_files", "read_only_dependencies", "forbidden_files", "integration_owner",
    "allowed_changes", "forbidden_changes", "invariants", "sampling_plan", "tests", "runtime_routes",
    "cache_partitions_invalidated", "stop_conditions", "escalation_conditions", "reopening_conditions"
  ],
  returnFieldsInOrder: [
    "packet_id", "base_commit", "contract_hash", "role", "model", "effort", "speed", "scope_ids",
    "status", "changed_file_hashes", "evidence_refs", "gates_passed", "gates_failed",
    "cache_invalidations", "new_decision_required", "risks", "next_owner"
  ],
  semanticExecutionKeyRecipe: "sha256(exact_prefix_sha256\\0contract_hash\\0prompt_schema_version\\0model\\0effort\\0packet_evidence_sha256)",
  note: "Model, effort, and speed are replaceable execution metadata; they are not embedded in durable curriculum or design contracts."
};
const packetTemplateOutput = `${JSON.stringify(packetTemplate)}\n`;

const manifest = {
  schemaVersion: 1,
  generatedAt: "deterministic",
  extractorVersion: EXTRACTOR_VERSION,
  cacheSeal,
  cacheRelativePath,
  contract: {
    role: "Derived ChatGPT Work evidence accelerator; never source of curriculum or semantic approval.",
    contentAddressing: "Full SHA-256 over sorted dependency-group roots, pinned policy, exact prefix, builder, package lock, and schema versions.",
    atomicReadyRule: "worker-prefix.md and packet-template.json are written atomically before manifest.json; manifest.json is the readiness marker.",
    rawDataPolicy: "Store hashes, counts, partitions, and artifact references only; do not cache raw lesson prose, standards text, logs, or screenshots.",
    invalidationPolicy: "Select the packet-family dependency hash and affected course partitions; never invalidate unrelated course capsules by timestamp.",
    authorityPolicy: "Repository ledgers, queues, contracts, explicit decisions, and exact-build evidence remain authoritative."
  },
  repository: {
    baseCommit,
    sourceState: "CONTENT_ADDRESSED_WORKTREE",
    queueCompatibleLessonSeal,
    queueDeclaredLessonSeal: queueDeclaredSeal,
    queueFreshness: queueDeclaredSeal === queueCompatibleLessonSeal ? "SOURCE_SEAL_MATCH" : "STALE_SOURCE_SEAL",
    toolchain: {
      node: process.version,
      next: packageJson.dependencies?.next ?? null,
      react: packageJson.dependencies?.react ?? null,
      typescript: packageJson.devDependencies?.typescript ?? null,
      vitest: packageJson.devDependencies?.vitest ?? null
    }
  },
  policy: {
    policyId: policyPin.policyId,
    canonicalExternalSha256: policyPin.canonicalExternalSha256,
    pinPath: POLICY_PIN_PATH,
    rawPolicyCached: false,
    exactWorkerPrefixPath: PREFIX_PATH,
    exactWorkerPrefixSha256: sha256(prefixBytes)
  },
  sealBasis,
  inventory: {
    courses: partitions.length,
    lessons: partitions.reduce((sum, partition) => sum + partition.lessonCount, 0),
    topLevelLessonSteps: partitions.reduce((sum, partition) => sum + partition.stepCount, 0),
    dependencyFiles: dependencyInputPaths.length,
    dependencyGroups: groups.length,
    artifactRefs: artifactRefs.length
  },
  dependencyGroups: groups,
  curriculumPartitions: partitions,
  artifactRefs,
  packetFamilies,
  workerPacket: {
    exactPrefixId: packetTemplate.exactPrefix.id,
    exactPrefixSha256: packetTemplate.exactPrefix.sha256,
    exactPrefixTrackedPath: PREFIX_PATH,
    exactPrefixCachePath: "worker-prefix.md",
    appendMarker: packetTemplate.exactPrefix.appendMarker,
    packetTemplateCachePath: "packet-template.json",
    packetTemplateSha256: sha256(packetTemplateOutput),
    promptSchemaVersion: PROMPT_SCHEMA_VERSION,
    exactPrefixRequired: true,
    immutablePacketFields: packetTemplate.immutablePacketFields,
    returnFieldsInOrder: packetTemplate.returnFieldsInOrder,
    semanticExecutionKeyRecipe: packetTemplate.semanticExecutionKeyRecipe
  }
};
const manifestOutput = `${JSON.stringify(manifest)}\n`;

const reportOutput = [
  "# Maggie's Trail V4 ChatGPT Work precache",
  "",
  "Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.",
  "",
  `- Cache seal: \`${cacheSeal}\``,
  `- Local cache: \`${cacheRelativePath}\``,
  `- Base commit metadata: \`${baseCommit}\``,
  `- Queue freshness: **${manifest.repository.queueFreshness}**`,
  `- Inventory: **${manifest.inventory.courses} courses / ${manifest.inventory.lessons.toLocaleString("en-US")} lessons / ${manifest.inventory.topLevelLessonSteps.toLocaleString("en-US")} top-level steps**`,
  `- Canonical policy pin: \`${policyPin.canonicalExternalSha256}\``,
  `- Exact worker prefix: \`${packetTemplate.exactPrefix.sha256}\``,
  "",
  "## Dependency partitions",
  "",
  "| Partition | Files | Bytes | SHA-256 |",
  "|---|---:|---:|---|",
  ...groups.map((group) => `| ${group.id} | ${group.fileCount.toLocaleString("en-US")} | ${group.bytes.toLocaleString("en-US")} | \`${group.sha256}\` |`),
  "",
  "The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.",
  "",
  "## Worker packet rule",
  "",
  `Start every packet with \`${PREFIX_PATH}\` byte-for-byte, then append \`${packetTemplate.exactPrefix.appendMarker}\` and the variable packet suffix.`,
  "Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.",
  "",
  "## Commands",
  "",
  "- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`",
  "- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`",
  "",
  "Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.",
  ""
].join("\n");

function atomicWrite(file, output) {
  if (existsSync(file) && readFileSync(file, "utf8") === output) return false;
  mkdirSync(dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${sha256(output).slice(0, 12)}`;
  if (existsSync(temporary)) unlinkSync(temporary);
  writeFileSync(temporary, output, { flag: "wx" });
  try {
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
  return true;
}

function assertCurrent(file, expected, label) {
  if (!existsSync(file)) throw new Error(`${label} is missing`);
  if (readFileSync(file, "utf8") !== expected) throw new Error(`${label} is stale`);
}

if (CHECK) {
  assertCurrent(TRACKED_MANIFEST, manifestOutput, relativePath(TRACKED_MANIFEST));
  assertCurrent(TRACKED_REPORT, reportOutput, relativePath(TRACKED_REPORT));
  if (existsSync(cachePath)) {
    assertCurrent(join(cachePath, "worker-prefix.md"), prefixBytes.toString("utf8"), `${cacheRelativePath}worker-prefix.md`);
    assertCurrent(join(cachePath, "packet-template.json"), packetTemplateOutput, `${cacheRelativePath}packet-template.json`);
    assertCurrent(join(cachePath, "manifest.json"), manifestOutput, `${cacheRelativePath}manifest.json`);
  }
  console.log(JSON.stringify({
    mode: "check",
    cacheSeal,
    tracked: "current",
    localCache: existsSync(cachePath) ? "current" : "absent-warm-on-demand",
    inventory: manifest.inventory,
    queueFreshness: manifest.repository.queueFreshness
  }, null, 2));
  process.exit(0);
}

const written = [];
if (atomicWrite(TRACKED_MANIFEST, manifestOutput)) written.push(relativePath(TRACKED_MANIFEST));
if (atomicWrite(TRACKED_REPORT, reportOutput)) written.push(relativePath(TRACKED_REPORT));
if (atomicWrite(join(cachePath, "worker-prefix.md"), prefixBytes.toString("utf8"))) written.push(`${cacheRelativePath}worker-prefix.md`);
if (atomicWrite(join(cachePath, "packet-template.json"), packetTemplateOutput)) written.push(`${cacheRelativePath}packet-template.json`);
// The manifest is the readiness marker and is deliberately written last.
if (atomicWrite(join(cachePath, "manifest.json"), manifestOutput)) written.push(`${cacheRelativePath}manifest.json`);

console.log(JSON.stringify({
  mode: "build",
  cacheSeal,
  cacheRelativePath,
  written,
  inventory: manifest.inventory,
  queueFreshness: manifest.repository.queueFreshness
}, null, 2));
