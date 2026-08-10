#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const expected = "maggies-trail-session-201";
const outDir = process.argv[2] ? resolve(process.argv[2]) : "/mnt/data";
if (basename(root) !== expected) throw new Error(`wrong root ${basename(root)}; expected ${expected}`);

const required = [
  "HANDOVER.md", "STATE.md", "SESSION_NOTES.md",
  "SESSION201_IMPLEMENTATION_REPORT.md", "SESSION201_EXECUTION_REPORT.md",
  "SESSION201_GATE_EVIDENCE.md", "SESSION201_LESSON_HASHES.json",
  "SESSION201_CONTENT_CHANGE_LEDGER.json", "SESSION201_DIFF_STATS.json",
  "SESSION201_ATLAS_SEARCH_INDEX_MEASURE.json", "SESSION201_NPM_CI.txt",
  "SESSION201_NPM_CI.exitcode", "SESSION201_GEN_REPORTS.txt",
  "SESSION201_GEN_REPORTS.exitcode", "SESSION201_SOURCE_TRANSPILE.json",
  "GRADE_3_PATTERN_VALLEY_PILOT.md"
];
for (const file of required) if (!existsSync(join(root, file))) throw new Error(`missing ${file}`);

const run = (cmd, args, cwd = root, timeout = 900_000) => execFileSync(cmd, args, { cwd, stdio: "inherit", timeout, env: process.env });
const dependencyFree = (cwd) => {
  run(process.execPath, [join(cwd, "scripts/native-integrity.mjs")], cwd, 120_000);
  run(process.execPath, [join(cwd, "scripts/session/verify-package-identity.mjs"), "201"], cwd);
  run(process.execPath, [join(cwd, "scripts/session/hash-proof.mjs"), "verify", "SESSION201_LESSON_HASHES.json"], cwd);
  run(process.execPath, [join(cwd, "scripts/session/verify-tidy.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/verify-world.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/verify-trail-voice.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/verify-instructional-colors.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/verify-math-format.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/verify-visual-explanations.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/check-registration.mjs")], cwd);
  run(process.execPath, [join(cwd, "scripts/session/test-groups.mjs"), "verify"], cwd);
  run(process.execPath, [join(cwd, "scripts/session/generator-guard.mjs"), "check"], cwd);
};

dependencyFree(root);
const tarPath = join(outDir, `${expected}.tar.gz`);
rmSync(tarPath, { force: true });
run("tar", [
  "--exclude=node_modules", "--exclude=.next", "--exclude=.cml-build", "--exclude=coverage",
  "--exclude=test-results", "--exclude=playwright-report", "--exclude=.git", "--exclude=*.tsbuildinfo",
  "--exclude=*.log", "-czf", tarPath, "-C", dirname(root), basename(root)
]);

const temp = mkdtempSync(join(tmpdir(), "maggies-s201-"));
try {
  run("tar", ["-xzf", tarPath, "-C", temp]);
  dependencyFree(join(temp, expected));
} finally {
  rmSync(temp, { recursive: true, force: true });
}

const digest = createHash("sha256").update(readFileSync(tarPath)).digest("hex");
writeFileSync(`${tarPath}.sha256`, `${digest}  ${basename(tarPath)}\n`);
console.log(`Session 201 package passed dependency-free fresh-extraction proof: ${tarPath}`);
console.log(`SHA-256 ${digest}`);
