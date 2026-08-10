#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const failures = [];
const forbidden = ["node_modules", ".next", ".cml-build", "coverage", "test-results", "playwright-report", ".turbo"];
for (const name of forbidden) if (existsSync(join(root, name))) failures.push(`${name}: generated directory must not be present in a packaged source tree`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (forbidden.includes(name) || name === ".git") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}
for (const path of walk(root)) if (/\.(?:log|tmp|tsbuildinfo)$/.test(path)) failures.push(`${relative(root, path)}: generated log/temp/cache file`);
const rootMatch = basename(root).match(/^maggies-trail-session-(\d+)$/);
if (!rootMatch) failures.push(`root ${basename(root)} does not encode a session number`);
const expectedSession = rootMatch ? Number(rootMatch[1]) : -1;
const notesPath = join(root, "SESSION_NOTES.md");
if (existsSync(notesPath)) {
  const notes = readFileSync(notesPath, "utf8");
  const headings = [...notes.matchAll(/^## Session (\d+)\b/gm)].map((match) => Number(match[1]));
  const counts = new Map();
  for (const session of headings) counts.set(session, (counts.get(session) ?? 0) + 1);
  for (const [session, count] of counts) if (session >= 125 && session <= expectedSession && count !== 1) failures.push(`SESSION_NOTES.md: Session ${session} heading count is ${count}, expected 1`);
  const latest = headings.length ? Math.max(...headings) : -1;
  if (latest !== expectedSession) failures.push(`SESSION_NOTES.md: latest heading is Session ${latest}, expected ${expectedSession}`);
} else failures.push("SESSION_NOTES.md: canonical living document is missing");
for (const file of ["HANDOVER.md", "STATE.md", "PRODUCT_STATE.md", "KNOWN_ISSUES.md", "FLAGSHIP.md"]) {
  if (!existsSync(join(root, file))) failures.push(`${file}: canonical living document is missing`);
}
if (failures.length) {
  console.error(`tidy failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`tidy passed: Session ${expectedSession} release tree has unique Session-125+ notes, canonical living docs, and no dependency/build artifacts`);
