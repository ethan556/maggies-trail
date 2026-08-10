#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import process from "node:process";

const session = Number(process.argv[2]);
if (!Number.isInteger(session)) {
  console.error("usage: node scripts/session/verify-package-identity.mjs <session-number>");
  process.exit(2);
}
const root = resolve(import.meta.dirname, "..", "..");
const expectedRoot = `maggies-trail-session-${session}`;
const failures = [];
if (basename(root) !== expectedRoot) failures.push(`root is ${basename(root)}, expected ${expectedRoot}`);
const required = [
  "HANDOVER.md",
  "STATE.md",
  "SESSION_NOTES.md",
  `SESSION${session}_EXECUTION_REPORT.md`,
  `SESSION${session}_GATE_EVIDENCE.md`,
  `SESSION${session}_LESSON_HASHES.json`
];
for (const file of required) if (!existsSync(join(root, file))) failures.push(`missing ${file}`);
if (existsSync(join(root, "HANDOVER.md")) && !readFileSync(join(root, "HANDOVER.md"), "utf8").includes(`Session ${session}`)) {
  failures.push(`HANDOVER.md does not identify Session ${session}`);
}
if (existsSync(join(root, "SESSION_NOTES.md"))) {
  const notes = readFileSync(join(root, "SESSION_NOTES.md"), "utf8");
  const headings = [...notes.matchAll(/^## Session (\d+)\b/gm)].map((match) => Number(match[1]));
  const latest = headings.length ? Math.max(...headings) : -1;
  if (latest !== session) failures.push(`latest SESSION_NOTES heading is Session ${latest}, expected ${session}`);
  const counts = new Map();
  for (const heading of headings) counts.set(heading, (counts.get(heading) ?? 0) + 1);
  for (const [number, count] of counts) if (number >= 125 && number <= session && count !== 1) failures.push(`SESSION_NOTES.md has ${count} Session ${number} headings`);
}
if (failures.length) {
  console.error(`package identity failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`package identity passed: ${expectedRoot}`);
