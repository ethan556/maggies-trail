#!/usr/bin/env node
/**
 * verify:world (Phase B, §33 v1).
 *
 * The manifest is generated, so most corruption is impossible — this gate exists for the
 * failure modes generation cannot see and for drift between the checked-in file and the
 * curriculum it describes. Checks (ids pinned by world.test.ts so this mjs mirror cannot
 * silently diverge from the typed validators):
 *
 *  W1  freshness — checked-in manifest is byte-identical to a fresh generation
 *  W2  region integrity — 14 regions, unique ids, every course's regionId resolves,
 *      every region non-empty
 *  W3  landmark ↔ chapter — every landmark matches a real chapter with identical lessonIds
 *  W4  prerequisites resolve — every prerequisiteCourseId is a manifest course; every
 *      PATH_EDGES endpoint exists (dangling edges are reported, not silently dropped)
 *  W5  no learning state — forbidden keys (completed, mastery, xp, bestXp, due, streak)
 *      appear nowhere in the manifest
 *  W6  no acyclic violation — the prerequisite graph has no cycles (a cycle would make a
 *      region permanently unrevealable)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, copyFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export const WORLD_CHECK_IDS = ["W1", "W2", "W3", "W4", "W5", "W6"];

const root = process.cwd();
const manifestPath = join(root, "content", "world", "world-manifest.json");
const failures = [];

// W1 — freshness
const tmp = manifestPath + ".fresh";
copyFileSync(manifestPath, tmp);
try {
  execFileSync("node", [join(root, "scripts", "gen-world-manifest.mjs")], { stdio: "pipe" });
  const fresh = readFileSync(manifestPath, "utf8");
  const checked = readFileSync(tmp, "utf8");
  if (fresh !== checked) failures.push("W1: checked-in manifest differs from a fresh generation — regenerate and commit");
  // restore whichever was checked in, so the gate never mutates the tree on failure
  copyFileSync(tmp, manifestPath);
} finally {
  unlinkSync(tmp);
}

const m = JSON.parse(readFileSync(manifestPath, "utf8"));

// W2 — regions
if (m.regions.length !== 14) failures.push(`W2: expected 14 regions, found ${m.regions.length}`);
const regionIds = new Set(m.regions.map((r) => r.id));
if (regionIds.size !== m.regions.length) failures.push("W2: duplicate region ids");
for (const c of m.courses) if (!regionIds.has(c.regionId)) failures.push(`W2: ${c.courseId} → unknown region ${c.regionId}`);
for (const r of m.regions) {
  if (!m.courses.some((c) => c.regionId === r.id)) failures.push(`W2: region ${r.id} has no courses`);
}

// W3 — landmarks match chapters exactly
const landmarksById = new Map(m.landmarks.map((l) => [l.id, l]));
for (const c of m.courses) {
  const metaPath = join(root, "content", "courses", c.courseId, "course.json");
  if (!existsSync(metaPath)) { failures.push(`W3: ${c.courseId} has no course.json`); continue; }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const chapters = new Map((meta.chapters ?? []).map((ch) => [ch.id, ch]));
  for (const lid of c.landmarkIds) {
    const lm = landmarksById.get(lid);
    if (!lm) { failures.push(`W3: ${c.courseId} references missing landmark ${lid}`); continue; }
    const ch = chapters.get(lm.chapterId);
    if (!ch) { failures.push(`W3: landmark ${lid} → no chapter ${lm.chapterId} in ${c.courseId}`); continue; }
    if (JSON.stringify(ch.lessonIds) !== JSON.stringify(lm.waypointIds)) {
      failures.push(`W3: landmark ${lid} waypoints diverge from chapter lessonIds`);
    }
  }
}

// W4 — prerequisites + PATH_EDGES endpoints
const courseIds = new Set(m.courses.map((c) => c.courseId));
for (const c of m.courses) {
  for (const p of c.prerequisiteCourseIds) {
    if (!courseIds.has(p)) failures.push(`W4: ${c.courseId} prerequisite ${p} is not a manifest course`);
  }
}
const graphSrc = readFileSync(join(root, "src", "lib", "content.server.ts"), "utf8");
const gi = graphSrc.indexOf("export const PATH_EDGES");
for (const [, from, to] of graphSrc.slice(gi, graphSrc.indexOf("];", gi)).matchAll(/\{ from: "([^"]+)", to: "([^"]+)" \}/g)) {
  if (!courseIds.has(from)) failures.push(`W4: PATH_EDGES from "${from}" is not a course`);
  if (!courseIds.has(to)) failures.push(`W4: PATH_EDGES to "${to}" is not a course`);
}

// W5 — no learning state
const raw = readFileSync(manifestPath, "utf8");
for (const key of ["\"completed\"", "\"mastery\"", "\"xp\"", "\"bestXp\"", "\"due\"", "\"streak\""]) {
  if (raw.includes(key)) failures.push(`W5: learning-state key ${key} found in the manifest`);
}

// W6 — prerequisite graph is acyclic
const adj = new Map(m.courses.map((c) => [c.courseId, c.prerequisiteCourseIds]));
const seen = new Map(); // 0=visiting 1=done
const cyclic = (id, path) => {
  if (seen.get(id) === 1) return false;
  if (seen.get(id) === 0) { failures.push(`W6: prerequisite cycle through ${[...path, id].join(" → ")}`); return true; }
  seen.set(id, 0);
  for (const p of adj.get(id) ?? []) if (cyclic(p, [...path, id])) return true;
  seen.set(id, 1);
  return false;
};
for (const id of courseIds) if (cyclic(id, [])) break;

console.log(`world: ${m.regions.length} regions · ${m.courses.length} courses · ${m.landmarks.length} landmarks · ${m.instruments.length} instruments`);
if (failures.length) {
  console.error(`\nverify:world FAILED with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("verify:world passed");
