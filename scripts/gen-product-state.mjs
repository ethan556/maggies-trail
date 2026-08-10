// Product-state report — THE canonical counts. Every number a human might
// otherwise hand-copy into a markdown file is derived here, from disk, so the
// docs can cite one source instead of drifting apart.
//
//   node scripts/gen-product-state.mjs         # writes PRODUCT_STATE.md (+ .json)
//
// Deterministic except for the two measured runtime facts (bundle size, build
// time), which are read from a build artifact when present and reported as
// "not measured" otherwise — never guessed. Content totals come from the
// existing curriculum manifest; widget/tier/flag facts are computed from the
// same content the other generators read, so all four agree by construction.
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { corpusFingerprint } from "./session/corpus-fingerprint.mjs";
import { authoredCorpusFingerprint } from "./session/authored-corpus-fingerprint.mjs";
import { sourceFingerprint } from "./session/source-fingerprint.mjs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), "utf8");
const readJSON = (p) => JSON.parse(read(p));

// ---- 1. content totals — fail closed unless the manifest describes THIS corpus --------
const manifest = readJSON("content/curriculum-manifest.json");
const authoredCorpus = authoredCorpusFingerprint(root);
if (!manifest.corpusSha256) {
  console.error("gen-product-state: curriculum manifest has no corpusSha256 — run `npm run gen:manifest` first");
  process.exit(1);
}
if (manifest.corpusSha256 !== authoredCorpus.sha256) {
  console.error(
    `gen-product-state: STALE curriculum manifest (manifest ${manifest.corpusSha256}, live ${authoredCorpus.sha256}) — refusing to generate product state`
  );
  process.exit(1);
}
if (manifest.totals?.courses !== authoredCorpus.courses || manifest.totals?.lessons !== authoredCorpus.lessons) {
  console.error("gen-product-state: curriculum manifest course/lesson totals disagree with the hashed authored corpus — refusing to generate");
  process.exit(1);
}
const { courses: courseCount, lessons: lessonCount, steps: stepCount } = manifest.totals;

// ---- 2. widget / manipulative census — from the schema registry (source of truth)
const schema = read("src/lib/schema.ts");
const widgetTypes = [...schema.matchAll(/type: z\.literal\("(\w+)"\)/g)].map((m) => m[1]);
// A "manipulative" is a widget a learner can directly build or drag — manip ≥ 1
// in the audited capability table. Static answer widgets (mcq, numeric, entry)
// are graded inputs, not manipulatives.
const caps = readJSON("scripts/engine-capabilities.json").types;
const manipulativeCount = widgetTypes.filter((t) => (caps[t]?.manip ?? 0) >= 1).length;

// ---- 3. flagship tiers + flags — recompute from content (one walk) ----------
const ROOT = "content/courses";
const STATIC = new Set(["mcq", "numeric", "fractionEntry", "pointEntry", "buildExpression"]);
// MCQ-heavy and reading-heavy are OWNED by curriculum-inventory.mjs — parse its
// output rather than re-deriving the band ceilings here (one definition, not two).
const inv = read("CURRICULUM_INVENTORY.md");
const flagLine = inv.match(/MCQ-heavy (\d+) · READING-heavy (\d+)/);
if (!flagLine) {
  console.error("gen-product-state: can't find flag totals in CURRICULUM_INVENTORY.md — run `npm run gen:inventory` first");
  process.exit(1);
}
const mcqHeavy = +flagLine[1];
const readingHeavy = +flagLine[2];

// Grade/domain coverage + interactive-lesson count are cheap and unambiguous, so
// compute them directly from the same content walk the other generators use.
const bands = {}; // gradeLevel -> {courses, lessons}
const domains = {}; // category -> lessons
let interactiveLessons = 0;
for (const dir of readdirSync(ROOT)) {
  const cf = join(ROOT, dir, "course.json");
  if (!existsSync(cf)) continue;
  const course = JSON.parse(readFileSync(cf, "utf8"));
  const g = course.gradeLevel;
  bands[g] ??= { courses: 0, lessons: 0 };
  bands[g].courses++;
  const band = g <= 2 ? "K–2" : g <= 5 ? "3–5" : g <= 8 ? "6–8" : "9–12+";
  domains[band] ??= { courses: 0, lessons: 0 };
  domains[band].courses++;
  const lessonsDir = join(ROOT, dir, "lessons");
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const l = JSON.parse(readFileSync(join(lessonsDir, f), "utf8"));
    bands[g].lessons++;
    domains[band].lessons++;
    if (l.steps.some((s) => s.widget)) interactiveLessons++;
  }
}

// Tier counts come from FLAGSHIP_TIERS.md — but that file is a WRITTEN ARTIFACT, not a live
// computation, so reading it blind reports whatever the last run happened to leave behind. That
// bit in S116: working copies of the tier script run from /tmp wrote the report elsewhere, the
// repo copy stayed stale, and PRODUCT_STATE silently under-reported Tier A by a lesson across
// several regenerations before the drift was noticed. Regenerate it here first — the script is
// cheap (a single content walk) and this makes the staleness structurally impossible rather than
// a process note somebody has to remember.
let tiers = null;
try {
  execFileSync(process.execPath, [join(root, "scripts", "flagship-tier.mjs")], {
    cwd: root,
    stdio: "ignore",
    timeout: 120_000
  });
} catch {
  // Non-fatal: fall through and read whatever report exists, same as before.
}
if (existsSync(join(root, "FLAGSHIP_TIERS.md"))) {
  const md = read("FLAGSHIP_TIERS.md");
  const m = md.match(/Totals:.*?A (\d+).*?B (\d+).*?C (\d+).*?D (\d+)/s);
  if (m) tiers = { A: +m[1], B: +m[2], C: +m[3], D: +m[4] };
  const k8 = md.match(/K[–-]8 targets.*?Tier A (\d+).*?Tier B (\d+)/s);
  if (k8 && tiers) tiers.k8 = { A: +k8[1], B: +k8[2] };
}

// ---- 4. test count — authoritative via `vitest list` ------------------------
// vitest enumerates every case it would run, INCLUDING it.each expansions, so
// this matches the suite exactly. Falls back to a static it() scan (an under-
// count, flagged as such) only if vitest can't be listed in this environment.
function countTestFiles(dir) {
  let files = 0;
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.test\.(ts|tsx)$/.test(e.name)) files++;
    }
  };
  walk(dir);
  return files;
}
let unit;
/* HANDOVER §10. The full-suite `vitest run --reporter=json` below cannot survive a 1-core/4 GB box:
 * it dies, the catch falls through to reports/certified-runtime.json, and this document has claimed
 * Session 135's numbers ever since. So look first for a record left by scripts/session/
 * run-test-groups.mjs, which runs the four groups under the memory protocol.
 *
 * The record is trusted ONLY while its corpusSha256 still matches the tree in front of us. A stale
 * number is worse than an honest fallback, so a record from before a content batch is rejected and
 * says why. */
function recordedGroupRun() {
  const p = join(root, "reports", "session-test-result.json");
  if (!existsSync(p)) return null;
  let rec;
  try { rec = JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
  const live = corpusFingerprint(root).sha256;
  if (live !== rec.corpusSha256) {
    console.warn(`gen-product-state: session-test-result.json is STALE (recorded for a different corpus) — ignoring it.`);
    return null;
  }
  /* S205F: records may carry per-group provenance with reused groups. Reuse was fingerprint-
   * guarded at record time, but the SOURCE can drift after recording just as the corpus can —
   * so a record whose groups pin a sourceSha is trusted only while that sha still matches the
   * live tree. Older records without per-group shas are unaffected. */
  const pinned = (rec.groups ?? []).find((g) => g.sourceSha256);
  if (pinned) {
    const liveSrc = sourceFingerprint(root).sha256;
    if (pinned.sourceSha256 !== liveSrc) {
      console.warn(`gen-product-state: session-test-result.json is STALE (recorded for different source) — ignoring it.`);
      return null;
    }
  }
  return {
    tests: rec.unitTests,
    files: rec.unitTestFiles,
    source: `group-protocol run recorded in session ${rec.session} on this exact corpus`
  };
}

unit = recordedGroupRun() ?? undefined;
const localVitest = join(root, "node_modules", ".bin", process.platform === "win32" ? "vitest.cmd" : "vitest");
if (!unit) try {
  if (!existsSync(localVitest)) throw new Error("local vitest is not installed");
  // Never use npx here: on a clean/offline checkout it silently contacts a
  // registry and can hang state generation for minutes.
  const json = execFileSync(localVitest, ["run", "--reporter=json"], {
    cwd: root, encoding: "utf8", timeout: 600000, maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"]
  });
  const parsed = JSON.parse(json);
  unit = { tests: parsed.numTotalTests, files: countTestFiles(join(root, "src")), source: "local vitest run --reporter=json" };
} catch {
  const certifiedPath = join(root, "reports", "certified-runtime.json");
  if (existsSync(certifiedPath)) {
    const certified = JSON.parse(readFileSync(certifiedPath, "utf8"));
    unit = {
      tests: certified.unitTests,
      files: certified.unitTestFiles,
      source: `last certified exact-lock run (Session ${certified.session}; carried forward, not rerun in this checkout)`
    };
  } else {
    let tests = 0;
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.test\.(ts|tsx)$/.test(e.name)) tests += (readFileSync(p, "utf8").match(/\bit\(/g) ?? []).length;
      }
    };
    walk(join(root, "src"));
    unit = { tests, files: countTestFiles(join(root, "src")), source: "static it() scan (undercount; no certified runtime artifact present)" };
  }
}
let e2e = 0;
if (existsSync(join(root, "e2e"))) {
  for (const f of readdirSync(join(root, "e2e")).filter((x) => /\.spec\.(ts|tsx)$/.test(x)))
    e2e += (readFileSync(join(root, "e2e", f), "utf8").match(/\btest\(/g) ?? []).length;
}
const certifiedRuntimePath = join(root, "reports", "certified-runtime.json");
const certifiedRuntime = existsSync(certifiedRuntimePath)
  ? JSON.parse(readFileSync(certifiedRuntimePath, "utf8"))
  : null;

// ---- 5. runtime facts — measured, or honestly "not measured" ----------------
let bundle = "not measured";
let buildTime = "not measured on current verified tree";
const buildMeta = join(root, ".next", "build-manifest.json");
if (existsSync(buildMeta)) {
  // sum first-load JS from .next/static if present
  const staticDir = join(root, ".next", "static");
  if (existsSync(staticDir)) {
    let total = 0;
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".js")) total += statSync(p).size;
      }
    };
    walk(staticDir);
    bundle = `${(total / 1024 / 1024).toFixed(2)} MB static JS`;
  }
}
// `.build-time` is a historical convenience file with no corpus/source fingerprint. Never
// present it as a current release metric: a source edit can leave the file untouched. A future
// current-tree build recorder may populate reports/build-result.json with BOTH fingerprints.
const buildResultPath = join(root, "reports", "build-result.json");
if (existsSync(buildResultPath)) {
  try {
    const rec = JSON.parse(readFileSync(buildResultPath, "utf8"));
    const liveSourceSha = sourceFingerprint(root).sha256;
    if (rec.corpusSha256 === authoredCorpus.sha256 && rec.sourceSha256 === liveSourceSha && typeof rec.buildTime === "string") {
      buildTime = rec.buildTime;
    }
  } catch { /* malformed/unverified record is ignored */ }
}

// ---- 6. source-archive identity ----------------------------------------------
// Release archives intentionally exclude .git. Product state must therefore be
// identical in the working tree and after clean tar extraction. The content
// version and package checksum provide reproducible identity; a host Git commit
// must never enter this generated artifact.
const commit = "not-recorded-in-source-archive";

// ---- assemble ---------------------------------------------------------------
const stateCore = {
  generatedFrom: "verified authored corpus + content/curriculum-manifest.json + schema registry + content walk",
  contentVersion: manifest.contentVersion ?? null,
  corpusSha256: authoredCorpus.sha256,
  corpusFiles: authoredCorpus.files,
  commit,
  courses: courseCount,
  lessons: lessonCount,
  steps: stepCount,
  widgetTypes: widgetTypes.length,
  manipulatives: manipulativeCount,
  flagshipTiers: tiers,
  gradeBands: bands,
  domains,
  interactiveLessons,
  mcqHeavyLessons: mcqHeavy,
  readingHeavyLessons: readingHeavy,
  tests: unit.tests,
  testFiles: unit.files,
  unitTestEvidence: unit.source,
  e2eTestDeclarations: e2e,
  certifiedPlaywrightExecutions: certifiedRuntime?.playwrightExecutions ?? null,
  certifiedRuntimeSession: certifiedRuntime?.session ?? null,
  browserEvidence: certifiedRuntime
    ? `last certified exact-lock run (Session ${certifiedRuntime.session}; carried forward, not rerun on current source tree)`
    : "no certified browser execution artifact present",
  bundle,
  buildTime,
  accessibility: unit.source.startsWith("local vitest")
    ? "automated accessibility and keyboard suites executed on the current tree; real-device sweep still owed"
    : `current-tree browser execution not available in this checkout; last certified Playwright baseline is Session ${certifiedRuntime?.session ?? "unknown"}, while source-level harness contracts cover the current tree`,
  deployment: "Next.js app; learner core is local-first; accounts and sync require a writable single-node SQLite volume; no hosted deployment configured"
};

// Preserve the generation timestamp when regeneration produces byte-identical semantic state.
// This keeps verify-generated deterministic while still timestamping every material state change.
const stateFingerprint = createHash("sha256").update(JSON.stringify(stateCore)).digest("hex");
const verifiedPath = join(root, "PRODUCT_STATE_VERIFIED.json");
let generatedAt = new Date().toISOString();
if (existsSync(verifiedPath)) {
  try {
    const prior = JSON.parse(readFileSync(verifiedPath, "utf8"));
    if (prior.stateFingerprint === stateFingerprint && typeof prior.generatedAt === "string") generatedAt = prior.generatedAt;
  } catch { /* malformed prior state is replaced below */ }
}
const state = { ...stateCore, stateFingerprint, generatedAt };
const verified = {
  ...state,
  verification: {
    status: "verified",
    manifestCorpusSha256: manifest.corpusSha256,
    authoredCorpusFiles: authoredCorpus.files,
    rule: "product-state generation fails when the live authored-corpus hash differs from the manifest hash"
  }
};

writeFileSync(join(root, "PRODUCT_STATE.json"), JSON.stringify(state, null, 2) + "\n");
writeFileSync(verifiedPath, JSON.stringify(verified, null, 2) + "\n");

const gradeRow = Object.keys(bands)
  .map(Number)
  .sort((a, b) => a - b)
  .map((g) => `| G${g} | ${bands[g].courses} | ${bands[g].lessons} |`)
  .join("\n");
const domainRow = Object.entries(domains)
  .sort((a, b) => a[1].lessons - b[1].lessons)
  .map(([d, v]) => `| ${d} | ${v.courses} | ${v.lessons} |`)
  .join("\n");

const md = `# Product state (generated — do not hand-edit)

Regenerate with \`node scripts/gen-product-state.mjs\`. Every count below is derived
from disk (the curriculum manifest, the schema registry, and a content walk) so the
rest of the docs can cite this file instead of re-counting. Commit \`${commit}\`.

Authored corpus SHA-256: \`${authoredCorpus.sha256}\`  
State generated: \`${generatedAt}\`

## Catalogue

| metric | value |
| --- | --: |
| Courses | ${courseCount} |
| Lessons | ${lessonCount} |
| Lesson steps | ${stepCount} |
| Widget types (registry) | ${widgetTypes.length} |
| Interactive manipulatives (manip ≥ 1) | ${manipulativeCount} |
| Interactive lessons (≥1 widget step) | ${interactiveLessons} |
| MCQ-heavy lessons (>60% graded MCQ) | ${mcqHeavy} |
| Reading-heavy lessons (words/step over band ceiling) | ${readingHeavy} |

## Flagship quality tiers
${tiers ? `
| tier | lessons |
| --- | --: |
| A — complete laboratory | ${tiers.A} |
| B — rich, one phase missing | ${tiers.B} |
| C — conventional-plus | ${tiers.C} |
| D — misclassified / weak | ${tiers.D} |
${tiers.k8 ? `\nK–8: Tier A ${tiers.k8.A}, Tier B ${tiers.k8.B}.` : ""}
` : "\n_FLAGSHIP_TIERS.md not present — run `node scripts/flagship-tier.mjs` first._\n"}
## Grade coverage

| band | courses | lessons |
| --- | --: | --: |
${gradeRow}

## Band coverage

| band | courses | lessons |
| --- | --: | --: |
${domainRow}

## Engineering

| metric | value |
| --- | --- |
| Unit/integration tests | ${unit.tests} across ${unit.files} files |
| — count source | ${unit.source} |
| Browser test declarations in current tree | ${e2e} |
| Last certified Playwright executions | ${certifiedRuntime ? `${certifiedRuntime.playwrightExecutions} (Session ${certifiedRuntime.session}; not rerun on current tree)` : "none recorded"} |
| Bundle size | ${bundle} |
| Build time | ${buildTime} |
| Accessibility | ${state.accessibility} |
| Deployment | ${state.deployment} |
`;

writeFileSync(join(root, "PRODUCT_STATE.md"), md);
console.log(
  `product-state: ${courseCount} courses · ${lessonCount} lessons · ${stepCount} steps · ${widgetTypes.length} widgets (${manipulativeCount} manipulatives) · tiers ${tiers ? `A${tiers.A}/B${tiers.B}/C${tiers.C}/D${tiers.D}` : "n/a"} · ${unit.tests} tests/${unit.files} files · MCQ-heavy ${mcqHeavy} · reading-heavy ${readingHeavy}`
);
