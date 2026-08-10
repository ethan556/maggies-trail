#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const command = process.argv[2] ?? "verify";
const manifestPath = resolve(root, process.argv[3] ?? "SESSION126_LESSON_HASHES.json");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (path.endsWith(".json") && /content\/courses\/[^/]+\/lessons\//.test(path.replaceAll("\\", "/"))) out.push(path);
  }
  return out;
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function live() {
  const files = walk(join(root, "content", "courses"));
  return Object.fromEntries(files.map((path) => [relative(root, path).replaceAll("\\", "/"), digest(path)]));
}

if (command === "snapshot") {
  const files = live();
  writeFileSync(manifestPath, JSON.stringify({ algorithm: "sha256", scope: "authored lesson JSON", count: Object.keys(files).length, files }, null, 2) + "\n");
  console.log(`hash snapshot: ${Object.keys(files).length} lesson files -> ${relative(root, manifestPath)}`);
  process.exit(0);
}

if (command !== "verify") {
  console.error("usage: node scripts/session/hash-proof.mjs snapshot|verify [manifest]");
  process.exit(2);
}
if (!existsSync(manifestPath)) {
  console.error(`hash proof: manifest missing: ${relative(root, manifestPath)}`);
  process.exit(1);
}
const expected = JSON.parse(readFileSync(manifestPath, "utf8"));
const actual = live();
const expectedPaths = Object.keys(expected.files).sort();
const actualPaths = Object.keys(actual).sort();
const added = actualPaths.filter((path) => !(path in expected.files));
const removed = expectedPaths.filter((path) => !(path in actual));
const changed = actualPaths.filter((path) => path in expected.files && actual[path] !== expected.files[path]);
if (added.length || removed.length || changed.length) {
  console.error(`hash proof failed: added=${added.length} removed=${removed.length} changed=${changed.length}`);
  for (const path of [...added.map((x) => `+ ${x}`), ...removed.map((x) => `- ${x}`), ...changed.map((x) => `~ ${x}`)].slice(0, 80)) console.error(path);
  process.exit(1);
}
console.log(`hash proof passed: ${actualPaths.length} authored lesson files byte-identical to ${relative(root, manifestPath)}`);
