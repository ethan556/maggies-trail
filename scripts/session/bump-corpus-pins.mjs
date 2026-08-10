#!/usr/bin/env node
/**
 * bump-corpus-pins — advance every hardcoded lesson-corpus total in the audit suite.
 *
 * HANDOVER §8 calls the content-edit trap "seven places". S203B proved it is nineteen. Beyond the
 * three authorization sets and PLAN.md, ELEVEN more files pin the corpus total as a literal:
 *
 *   scripts/audit/content-json-s143…s151.mjs   `passed: records.length===N && ids.size===N`
 *   scripts/audit/session150-failure-first.mjs `CONTENT_JSON_S150.json.lessons===N`
 *   scripts/audit/session151-failure-first.mjs `CONTENT_JSON_S151.json.lessons===N`
 *
 * These fail SILENTLY: `content-json-*` collects parse errors into an array, and when the array is
 * empty but the count pin misses, it exits 1 having printed nothing at all. S203B's gen:reports
 * died there after ~9 minutes with a blank error.
 *
 * Usage:  node scripts/session/bump-corpus-pins.mjs <from> <to> --tag S203B [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const [from, to] = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const tagIdx = process.argv.indexOf("--tag");
const tag = tagIdx > -1 ? process.argv[tagIdx + 1] : "S000";
const dry = process.argv.includes("--dry-run");

if (!from || !to) {
  console.error("usage: bump-corpus-pins.mjs <from> <to> --tag S203B [--dry-run]");
  process.exit(2);
}

const auditDir = join(root, "scripts/audit");
const targets = readdirSync(auditDir).filter((f) => /^(content-json-s\d+|session\d+-failure-first)\.mjs$/.test(f));

const changed = [];
for (const f of targets) {
  const p = join(auditDir, f);
  const src = readFileSync(p, "utf8");
  let out = src;

  // content-json-*: the pass condition pins BOTH the file count and the unique-id count.
  out = out.replace(
    new RegExp(`records\\.length===${from}&&ids\\.size===${from}`, "g"),
    `records.length===${to}&&ids.size===${to}/*${tag}: corpus ${from}->${to}*/`
  );
  // session*-failure-first: re-reads the emitted report and pins its lesson count.
  out = out.replace(
    new RegExp(`\\.lessons===${from}`, "g"),
    `.lessons===${to}/*${tag}: corpus ${from}->${to}*/`
  );

  if (out !== src) {
    if (!dry) writeFileSync(p, out);
    changed.push(f);
  }
}

console.log(`${dry ? "[dry-run] " : ""}corpus pins ${from} -> ${to} in ${changed.length} files`);
for (const c of changed) console.log(`  scripts/audit/${c}`);
if (changed.length === 0) console.error("WARNING: no pins matched — check <from>");
