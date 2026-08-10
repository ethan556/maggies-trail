#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import process from "node:process";

const session = Number(process.argv[2]);
const outputDir = resolve(process.argv[3] ?? "/mnt/user-data/outputs");
if (!Number.isInteger(session)) {
  console.error("usage: node scripts/session/package-session.mjs <session-number> [output-dir]");
  process.exit(2);
}
const root = resolve(import.meta.dirname, "..", "..");
const expectedRoot = `maggies-trail-session-${session}`;
if (basename(root) !== expectedRoot) {
  console.error(`package: root is ${basename(root)}, expected ${expectedRoot}`);
  process.exit(1);
}
execFileSync(process.execPath, [join(root, "scripts", "session", "verify-package-identity.mjs"), String(session)], { cwd: root, stdio: "inherit" });
mkdirSync(outputDir, { recursive: true });
const requiredArtifacts = [
  "EXCELLENCE_BACKLOG_S126.md", "EXCELLENCE_BACKLOG_S126.json", "EXCELLENCE_BACKLOG_S126.csv",
  "ENGINE_REGISTRATION_CONTRACT_S126.md", "ENGINE_REGISTRATION_CONTRACT_S126.json",
  "PLAYER_HARNESS_CONTRACT_S127.md", "PLAYER_HARNESS_CONTRACT_S127.json",
  "REUSE_WAVE_S128.md", "REUSE_WAVE_S128.json", "SESSION128_CONTENT_CHANGE_LEDGER.json",
  "ESTIMATE_COMPARE_S129.md", "ESTIMATE_COMPARE_S129.json",
  "GRID_READ_S130.md", "GRID_READ_S130.json",
  "DISTRIBUTION_COMPARE_S131.md", "DISTRIBUTION_COMPARE_S131.json",
  "TRIAL_PROBABILITY_S132.md", "TRIAL_PROBABILITY_S132.json",
  "COMPOUND_EVENT_S133.md", "COMPOUND_EVENT_S133.json",
  "COMPOSITE_AREA_S136.md", "COMPOSITE_AREA_S136.json", "SESSION135_CANONICAL_REVIEW_S136.md",
  "GEOMETRY_ROUNDUP_S137.md", "GEOMETRY_ROUNDUP_S137.json",
  "PERCENT_CHANGE_S138.md", "PERCENT_CHANGE_S138.json",
  "SIGNED_FRACTION_S139.md", "SIGNED_FRACTION_S139.json", "SIGNED_FRACTION_VARIANT_SWEEP_S139.json",
  "SHAPE_HIERARCHY_S140.md", "SHAPE_HIERARCHY_S140.json", "SHAPE_HIERARCHY_VARIANT_SWEEP_S140.json",
  "EQUATION_OUTCOME_S141.md", "EQUATION_OUTCOME_S141.json", "EQUATION_OUTCOME_VARIANT_SWEEP_S141.json",
  "CONDITIONAL_TABLE_S142.md", "CONDITIONAL_TABLE_S142.json", "CONDITIONAL_TABLE_VARIANT_SWEEP_S142.json",
  "GRAPH_STORY_VARIANT_SWEEP_S143.json", "GRAPH_STORY_S143.md", "GRAPH_STORY_S143.json",
  "SESSION143_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION143_ADVERSARIAL_MUTATION_MATRIX.json",
  "PROPORTIONAL_REASONING_VARIANT_SWEEP_S144.json", "PROPORTIONAL_REASONING_S144.md", "PROPORTIONAL_REASONING_S144.json",
  "SESSION144_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION144_ADVERSARIAL_MUTATION_MATRIX.json",
  "PLACE_VALUE_TRANSFORM_VARIANT_SWEEP_S145.json", "PLACE_VALUE_TRANSFORM_S145.md", "PLACE_VALUE_TRANSFORM_S145.json",
  "SESSION145_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION145_ADVERSARIAL_MUTATION_MATRIX.json",
  "QUOTIENT_REASONING_VARIANT_SWEEP_S146.json", "QUOTIENT_REASONING_S146.md", "QUOTIENT_REASONING_S146.json",
  "SESSION146_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION146_ADVERSARIAL_MUTATION_MATRIX.json",
  "SESSION146_FAILURE_FIRST_AUDIT.md", "SESSION146_FAILURE_FIRST_AUDIT.json",
  `SESSION${session}_CONTENT_CHANGE_LEDGER.json`, `SESSION${session}_LESSON_HASHES.json`, `SESSION${session}_DIFF_STATS.json`,
  "PRODUCT_STATE.md", "FLAGSHIP_TIERS.md",
  `SESSION${session}_EXECUTION_REPORT.md`, `SESSION${session}_GATE_EVIDENCE.md`, `SESSION${session}_IMPLEMENTATION_REPORT.md`,
  `SESSION${session}_AUDIT.json`, `SESSION${session}_MUTATION_MATRIX.md`,
  `SESSION${session}_ADVERSARIAL_MUTATION_MATRIX.md`, `SESSION${session}_ADVERSARIAL_MUTATION_MATRIX.json`,
  `SESSION${session}_AUTHORED_CONTENT_LEDGER.json`, `SESSION${session}_EXACT_FIT_RERANK.md`, `SESSION${session}_EXACT_FIT_RERANK.json`,
  `SOURCE_TRANSPILE_S${session}.md`, `SOURCE_TRANSPILE_S${session}.json`,
  `CONTENT_JSON_S${session}.md`, `CONTENT_JSON_S${session}.json`,
  `SESSION${session}_NPM_CI.txt`, `SESSION${session}_NPM_CI.exitcode`,
  ...(session >= 147 ? [
    "AFFINE_RELATIONSHIP_VARIANT_SWEEP_S147.json", "AFFINE_RELATIONSHIP_S147.md", "AFFINE_RELATIONSHIP_S147.json",
    "SESSION147_FAILURE_FIRST_AUDIT.md", "SESSION147_FAILURE_FIRST_AUDIT.json"
  ] : []),
  ...(session >= 148 ? [
    "EXACT_NUMBER_VARIANT_SWEEP_S148.json", "EXACT_NUMBER_S148.md", "EXACT_NUMBER_S148.json",
    "SESSION148_FAILURE_FIRST_AUDIT.md", "SESSION148_FAILURE_FIRST_AUDIT.json"
  ] : []),
  ...(session >= 149 ? [
    "GEOMETRIC_CONSTRAINT_VARIANT_SWEEP_S149.json", "GEOMETRIC_CONSTRAINT_S149.md", "GEOMETRIC_CONSTRAINT_S149.json",
    "SESSION149_FAILURE_FIRST_AUDIT.md", "SESSION149_FAILURE_FIRST_AUDIT.json"
  ] : []),
  ...(session >= 150 ? [
    "POINT_SET_REASONING_VARIANT_SWEEP_S150.json", "POINT_SET_REASONING_S150.md", "POINT_SET_REASONING_S150.json",
    "SESSION150_FAILURE_FIRST_AUDIT.md", "SESSION150_FAILURE_FIRST_AUDIT.json"
  ] : [])
];
for (const path of requiredArtifacts) {
  if (!existsSync(join(root, path))) throw new Error(`package artifact missing: ${path}`);
}
execFileSync(process.execPath, [join(root, "scripts", "session", `artifact-manifest-s${session}.mjs`)], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, [join(root, "scripts", "session", `verify-artifact-manifest-s${session}.mjs`)], { cwd: root, stdio: "inherit" });
const tarPath = join(outputDir, `${expectedRoot}.tar.gz`);
rmSync(tarPath, { force: true });
execFileSync("tar", [
  "--exclude=node_modules",
  "--exclude=.next",
  "--exclude=.cml-build",
  "--exclude=coverage",
  "--exclude=test-results",
  "--exclude=playwright-report",
  "--exclude=.git",
  "--exclude=*.tsbuildinfo",
  "--exclude=*.log",
  "-czf",
  tarPath,
  "-C",
  dirname(root),
  basename(root)
], { stdio: "inherit" });
const temp = mkdtempSync(join(tmpdir(), `maggies-package-s${session}-`));
try {
  execFileSync("tar", ["-xzf", tarPath, "-C", temp], { stdio: "inherit" });
  const extracted = join(temp, expectedRoot);
  execFileSync(process.execPath, [join(extracted, "scripts", "native-integrity.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
  execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-package-identity.mjs"), String(session)], { cwd: extracted, stdio: "inherit" });
  execFileSync(process.execPath, [join(extracted, "scripts", "session", `verify-artifact-manifest-s${session}.mjs`)], { cwd: extracted, stdio: "inherit" });
  if (existsSync(join(extracted, "scripts", "session", `content-change-proof-s${session}.mjs`))) execFileSync(process.execPath, [join(extracted, "scripts", "session", `content-change-proof-s${session}.mjs`)], { cwd: extracted, stdio: "inherit" });
  execFileSync(process.execPath, [join(extracted, "scripts", "session", "hash-proof.mjs"), "verify", `SESSION${session}_LESSON_HASHES.json`], { cwd: extracted, stdio: "inherit" });
  execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-tidy.mjs")], { cwd: extracted, stdio: "inherit" });
  execFileSync(process.execPath, [join(extracted, "scripts", "audit", "engine-registration-contract.mjs")], { cwd: extracted, stdio: "inherit" });
  execFileSync(process.execPath, [join(extracted, "scripts", "audit", "player-harness-contract-s127.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 128) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "reuse-wave-s128.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 129) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "estimate-compare-s129.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 130) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "grid-read-s130.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 131) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "distribution-compare-s131.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 132) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "trial-probability-s132.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 133) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "compound-event-s133.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 136) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "composite-area-s136.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 137) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "geometry-roundup-s137.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 138) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "percent-change-s138.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 139) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "signed-fraction-s139.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 140) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "shape-hierarchy-s140.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 141) execFileSync(process.execPath, [join(extracted, "scripts", "audit", "equation-outcome-s141.mjs")], { cwd: extracted, stdio: "inherit" });
  if (session >= 142) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "conditional-table-variant-sweep-s142.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "conditional-table-s142.mjs")], { cwd: extracted, stdio: "inherit" });
  }
  if (session >= 143) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "graph-story-variant-sweep-s143.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "graph-story-s143.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "graph-story-mutations-s143.mjs")], { cwd: extracted, stdio: "inherit" });
  }
  if (session >= 144) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s144.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s144.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "proportional-reasoning-variant-sweep-s144.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "proportional-reasoning-s144.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "proportional-reasoning-mutations-s144.mjs")], { cwd: extracted, stdio: "inherit" });
    if (session === 144) execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-generated.mjs")], { cwd: extracted, stdio: "inherit", timeout: 1_800_000 });
  }
  if (session >= 145) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s145.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s145.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "place-value-transform-variant-sweep-s145.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "place-value-transform-s145.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "place-value-transform-mutations-s145.mjs")], { cwd: extracted, stdio: "inherit" });
    if (session === 145) execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-generated.mjs")], { cwd: extracted, stdio: "inherit", timeout: 1_800_000 });
  }
  if (session >= 146) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s146.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s146.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "quotient-reasoning-variant-sweep-s146.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync("python", [join(extracted, "scripts", "audit", "quotient-reasoning-s146.py")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "quotient-reasoning-mutations-s146.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "session146-failure-first.mjs")], { cwd: extracted, stdio: "inherit" });
  }
  if (session >= 147) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s147.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s147.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "affine-relationship-variant-sweep-s147.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync("python", [join(extracted, "scripts", "audit", "affine-relationship-s147.py")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "affine-relationship-mutations-s147.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "session147-failure-first.mjs")], { cwd: extracted, stdio: "inherit" });
  }
  if (session >= 148) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s148.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s148.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "exact-number-variant-sweep-s148.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync("python", [join(extracted, "scripts", "audit", "exact-number-s148.py")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "exact-number-mutations-s148.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "session148-failure-first.mjs")], { cwd: extracted, stdio: "inherit" });
  }
  if (session >= 149) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s149.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s149.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "geometric-constraint-variant-sweep-s149.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync("python", [join(extracted, "scripts", "audit", "geometric-constraint-s149.py")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "geometric-constraint-mutations-s149.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "session149-failure-first.mjs")], { cwd: extracted, stdio: "inherit" });
    if (session === 149) {
      execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-generated.mjs")], { cwd: extracted, stdio: "inherit", timeout: 2_400_000 });
      execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-artifact-manifest-s149.mjs")], { cwd: extracted, stdio: "inherit" });
    }
  }
  if (session >= 150) {
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "source-transpile-s150.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "content-json-s150.mjs")], { cwd: extracted, stdio: "inherit", timeout: 120_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "point-set-reasoning-variant-sweep-s150.cjs")], { cwd: extracted, stdio: "inherit", timeout: 900_000 });
    execFileSync("python", [join(extracted, "scripts", "audit", "point-set-reasoning-s150.py")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "point-set-reasoning-mutations-s150.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "audit", "session150-failure-first.mjs")], { cwd: extracted, stdio: "inherit" });
    execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-generated.mjs")], { cwd: extracted, stdio: "inherit", timeout: 2_400_000 });
    execFileSync(process.execPath, [join(extracted, "scripts", "session", "verify-artifact-manifest-s150.mjs")], { cwd: extracted, stdio: "inherit" });
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
const sha = createHash("sha256").update(readFileSync(tarPath)).digest("hex");
const shaPath = `${tarPath}.sha256`;
writeFileSync(shaPath, `${sha}  ${basename(tarPath)}\n`);
console.log(`package passed: ${tarPath}`);
console.log(`sha256: ${sha}`);
