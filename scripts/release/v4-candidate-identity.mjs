#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

function repositoryFiles() {
  return git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
    .split("\0")
    .filter(Boolean)
    .map((file) => file.replaceAll("\\", "/"));
}

function fileHash(file) {
  return sha256(readFileSync(file));
}

function fingerprint(files) {
  const entries = [...files]
    .sort()
    .map((file) => ({ path: file, sha256: fileHash(file) }));

  return {
    fileCount: entries.length,
    sha256: sha256(entries.map(({ path, sha256: hash }) => `${path}\0${hash}`).join("\n")),
  };
}

const files = repositoryFiles();
const isTest = (file) =>
  /(?:^|\/)(?:e2e\/|[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$)/.test(file);
const runtimeFiles = files.filter(
  (file) =>
    ((file.startsWith("src/") && !isTest(file)) ||
      file.startsWith("content/") ||
      file.startsWith("public/") ||
      /^(?:package(?:-lock)?\.json|next\.config\.[cm]?[jt]s|tsconfig\.json)$/.test(file)),
);
const contentFiles = files.filter((file) => file.startsWith("content/courses/"));
const evidenceFiles = files.filter(
  (file) =>
    file.startsWith("e2e/") ||
    file.startsWith("scripts/") ||
    isTest(file) ||
    /^(?:V4_IMPLEMENTATION_QUEUE|CONTENT_V4_STATE|MIGRATION_LEDGER|STANDARDS_ALIGNMENT_MATRIX|LESSON_EVIDENCE_MAP)\.(?:json|md)$/.test(file),
);

const courseFiles = contentFiles.filter((file) => /\/course\.json$/.test(file));
const lessonFiles = contentFiles.filter((file) => /\/lessons\/[^/]+\.json$/.test(file));
const statusEntries = git(["status", "--porcelain=v1", "-z"])
  .split("\0")
  .filter(Boolean).length;
const clean = statusEntries === 0;
const head = git(["rev-parse", "HEAD"]);
const branch = git(["branch", "--show-current"]);
const runtime = fingerprint(runtimeFiles);
const content = fingerprint(contentFiles);
const evidence = fingerprint(evidenceFiles);
const deployedCommit = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
const deploymentUrl = process.env.VERCEL_URL ?? null;
const deploymentParity = Boolean(deployedCommit && deploymentUrl && deployedCommit === head && clean);

const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  candidate: {
    key: `${head.slice(0, 12)}-${runtime.sha256.slice(0, 16)}-${clean ? "clean" : "dirty"}`,
    head,
    branch,
    workingTreeClean: clean,
    dirtyEntries: statusEntries,
  },
  inventory: {
    courses: courseFiles.length,
    lessons: lessonFiles.length,
  },
  fingerprints: { runtime, content, evidence },
  deployment: {
    commit: deployedCommit,
    url: deploymentUrl,
  },
  gates: {
    localCandidateIdentity: "PASS",
    candidateFreeze: clean ? "PASS" : "BLOCKED",
    deploymentParity: deploymentParity ? "PASS" : "BLOCKED",
  },
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (process.argv.includes("--assert-frozen") && !clean) {
  process.exitCode = 1;
}
