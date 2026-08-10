#!/usr/bin/env node
/**
 * run-test-groups — run the four vitest groups under the memory protocol and RECORD the result.
 *
 * WHY THIS EXISTS (HANDOVER §10). `gen-product-state.mjs` shells `vitest run --reporter=json` —
 * the whole suite, one process, no `--pool=forks --maxWorkers=1`, no heap cap. That invocation
 * cannot survive this box, so its `catch` silently falls back to `reports/certified-runtime.json`
 * and carries Session 135's numbers forward. PRODUCT_STATE has therefore claimed 10,201 tests
 * across 174 files since S135 while the tree actually passes 11,805 across 274. Nothing fails; the
 * number is just quietly wrong, and it is the number the product-state document shows.
 *
 * The fix is not to make gen-product-state run the groups itself — that would add roughly fifteen
 * minutes to every `gen:reports`. It is to run them ONCE per session, here, and leave behind a
 * record that gen-product-state can trust.
 *
 * TRUST IS THE HARD PART. A recorded number is worse than no number if it can go stale silently, so
 * the record carries a `corpusSha256` fingerprint over every lesson file — the same construction
 * `content-json-s145` uses. gen-product-state accepts the record only when that fingerprint still
 * matches the tree in front of it; otherwise it says so and falls back. A record from before a
 * content batch can never masquerade as current.
 *
 * Usage:
 *   node scripts/session/run-test-groups.mjs --tag S203G          # run all four groups, record
 *   node scripts/session/run-test-groups.mjs --tag S203G --record-only 274 11805
 *       ^ record totals measured elsewhere in this session (e.g. groups already run by hand),
 *         still fingerprinted against the live corpus so staleness stays detectable.
 */
import { readdirSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { corpusFingerprint } from "./corpus-fingerprint.mjs";
import { sourceFingerprint } from "./source-fingerprint.mjs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const argv = process.argv.slice(2);
const tagIdx = argv.indexOf("--tag");
const tag = tagIdx > -1 ? argv[tagIdx + 1] : null;
if (!tag || !/^S\d+[A-Z]?$/.test(tag)) {
  console.error("usage: run-test-groups.mjs --tag S203G [--record-only <files> <tests>]");
  process.exit(2);
}

const GROUPS = ["content", "sweep", "rest-a", "rest-b"];

function listGroup(group) {
  const r = spawnSync(process.execPath, [join(root, "scripts/session/test-groups.mjs"), "list", group],
    { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`test-groups list ${group} failed: ${r.stderr}`);
  return r.stdout.trim().split(/\s+/).filter(Boolean);
}

/** vitest's dot reporter tail: " Test Files  74 passed (74)" / "      Tests  1259 passed (1259)". */
function parseTotals(out) {
  const clean = out.replace(/\u001b\[[0-9;]*m/g, "");
  const files = clean.match(/Test Files\s+.*?\((\d+)\)/);
  const tests = clean.match(/\bTests\s+.*?\((\d+)\)/);
  const failed = /\bfailed\b/.test(clean);
  return { files: files ? Number(files[1]) : 0, tests: tests ? Number(tests[1]) : 0, failed };
}

const recordOnly = argv.indexOf("--record-only");
const reuseFlag = argv.includes("--reuse-unchanged");
let groups = [];
let totalFiles = 0;
let totalTests = 0;

/* --reuse-unchanged: dependency-aware group selection (S205F).
 *
 * Every group depends on SOURCE (src/, e2e/, scripts/, lockfile, configs). Only some files read
 * content/. Measured on this tree: 6 of 202 rest-a/rest-b files touch content/ — the other 196
 * cannot change their result when only lessons changed. The pair (sourceSha, corpusSha) is a
 * complete statement of a group's inputs; under the project's own determinism doctrine, identical
 * inputs give identical results, so reuse under a MATCHING pair is as honest as a re-run and reuse
 * under a mismatched pair is fabrication.
 *
 * Mechanics: if the previous record carries per-group provenance and a group's recorded sourceSha
 * matches the live one, the group's CONTENT-INDEPENDENT files are reused and only its
 * content-dependent files (detected by grep for content/ reads, the same probe the measurement
 * used) are re-run and OVERLAY the reused counts. content and sweep are always re-run in full —
 * both read the corpus by design. The record states, per group, what was fresh and what was
 * reused and under which fingerprints, so an auditor can re-derive the decision. Any doubt →
 * run without the flag; the default path is unchanged and always fully fresh. */
function contentDependentFiles(files) {
  const probe = /content\/courses|readdirSync\(.*content|CONTENT_DIR|join\([^\n]*"content"/;
  return files.filter((f) => {
    try { return probe.test(readFileSync(join(root, f), "utf8")); } catch { return true; } // unreadable → treat as dependent
  });
}

if (recordOnly > -1) {
  totalFiles = Number(argv[recordOnly + 1]);
  totalTests = Number(argv[recordOnly + 2]);
  if (!Number.isInteger(totalFiles) || !Number.isInteger(totalTests)) {
    console.error("--record-only needs two integers: <files> <tests>");
    process.exit(2);
  }
  groups = [{ group: "(recorded from this session's group runs)", files: totalFiles, tests: totalTests }];
} else {
  const srcFp = sourceFingerprint(root);
  const prevPath = join(root, "reports/session-test-result.json");
  const prev = reuseFlag && existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, "utf8")) : null;
  const prevGroups = new Map((prev?.groups ?? []).filter((g) => g.sourceSha256).map((g) => [g.group, g]));

  const runVitest = (files) => {
    const r = spawnSync(join(root, "node_modules/.bin/vitest"),
      ["run", "--pool=forks", "--maxWorkers=1", "--reporter=dot", ...files],
      { cwd: root, encoding: "utf8", env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" }, maxBuffer: 64 * 1024 * 1024 });
    const t = parseTotals(`${r.stdout ?? ""}${r.stderr ?? ""}`);
    if (r.status !== 0 || t.failed) {
      console.error(`\nvitest FAILED (exit ${r.status}) — nothing recorded.`);
      process.exit(1);
    }
    return t;
  };

  for (const group of GROUPS) {
    const files = listGroup(group);
    const alwaysFresh = group === "content" || group === "sweep"; // both read the corpus by design
    const prevG = prevGroups.get(group);
    const canReuse = reuseFlag && !alwaysFresh && prevG &&
      prevG.sourceSha256 === srcFp.sha256 && prevG.fileCount === files.length;

    if (canReuse) {
      const dep = contentDependentFiles(files);
      process.stdout.write(`${group}: ${files.length} files, source unchanged — re-running ${dep.length} content-dependent… `);
      let fresh = { files: 0, tests: 0 };
      if (dep.length > 0) fresh = runVitest(dep);
      console.log(`${fresh.tests} tests fresh, rest reused from ${prevG.ranAt ?? prev.session}`);
      groups.push({
        group, files: prevG.files, tests: prevG.tests,
        sourceSha256: srcFp.sha256, fileCount: files.length, ranAt: prevG.ranAt ?? prev.session,
        provenance: `reused: sourceSha match ${srcFp.sha256.slice(0, 12)}…; ${dep.length} content-dependent files re-run fresh this tag (${fresh.tests} tests, all passing)`
      });
      totalFiles += prevG.files;
      totalTests += prevG.tests;
      continue;
    }

    process.stdout.write(`${group}: ${files.length} files… `);
    const t = runVitest(files);
    console.log(`${t.tests} tests`);
    groups.push({ group, files: t.files, tests: t.tests, sourceSha256: srcFp.sha256, fileCount: files.length, ranAt: tag, provenance: "fresh full run" });
    totalFiles += t.files;
    totalTests += t.tests;
  }
}

const fp = corpusFingerprint(root);
const record = {
  session: tag,
  status: "group-protocol run on the current tree",
  protocol: "vitest run --pool=forks --maxWorkers=1, NODE_OPTIONS=--max-old-space-size=2048, per test-groups.mjs",
  unitTests: totalTests,
  unitTestFiles: totalFiles,
  groups,
  corpusLessons: fp.lessons,
  corpusTestFiles: fp.testFiles,
  corpusSha256: fp.sha256,
  note: "gen-product-state prefers this over reports/certified-runtime.json, but ONLY while corpusSha256 still matches the live corpus. Re-run after any content change."
};

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/session-test-result.json"), JSON.stringify(record, null, 2) + "\n");
console.log(`recorded ${totalTests} tests across ${totalFiles} files -> reports/session-test-result.json`);
console.log(`corpus fingerprint ${fp.sha256.slice(0, 16)}… over ${fp.lessons} lessons`);
