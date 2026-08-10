#!/usr/bin/env node
/**
 * merge-surface-area-into-geometry-g7 — fold the 6-lesson `surface-area-solids-g7` stub into
 * `geometry-g7`, closing the last structural item from the grades 6-8 gap analysis.
 *
 * WHY. S199 created `surface-area-solids-g7` to give 7.G.B.6 a grade-level home, but it shipped as
 * 6 lessons in 2 chapters — half the size of every other Grade 7 course — and it substantially
 * re-teaches 6.G.A.2 and 6.G.A.4. The gap analysis called it "a stub that was split off and never
 * finished". Merging is purely structural: 7.G.B.6 is covered either way, and the standards
 * coverage audit must read exactly the same before and after.
 *
 * PLACEMENT. The two chapters land after `ch3b-drawing-triangles-from-conditions` and BEFORE
 * `ch4-triangles-cross-sections`, so that `g7-04-03` "Geometry Roundup" — whose recap says
 * "That completes Grade 7 Geometry" — stays the course finale. Reading order becomes
 * scale -> circles -> angles -> drawing triangles -> wrapping solids -> filling & combining ->
 * cross-sections & roundup, which also puts surface area and volume immediately before slicing.
 *
 * WHAT THE BLAST-RADIUS SURVEY FOUND (checked before writing a line):
 *   - `content.server.ts` carries two PATH_EDGES through the stub. Their replacements —
 *     area-surface-volume -> geometry-g7 and geometry-g7 -> transformations-measurement — ALREADY
 *     exist, so the two stub edges are simply deleted rather than rewired.
 *   - The six lessons are S199 additions and appear in NEITHER the S147 nor the S151 hash ledgers,
 *     so none of the five whole-corpus python audits (s146-s150) iterate them. No S203G_AUTHORIZED
 *     sets are needed there.
 *   - `content-change-proof-s151c` iterates LIVE paths, so the six old paths stop being counted and
 *     six new ones start: the `changed` total is unchanged at 724 and the corpus stays 1694. Only
 *     the six AUTHORIZED keys need re-pathing, which this script does.
 *   - Course count 129 -> 128 is pinned twice in `src/world/world.test.ts`.
 *   - `src/lib/session199.expansion.test.ts` pins the S199 expansion, including this course's
 *     existence and its path edges. Its ANSWER assertions (independently derived surface areas)
 *     survive untouched in substance — only the course they are looked up in changes. Its
 *     STRUCTURAL assertions legitimately became false and are rewritten to say the lessons now live
 *     in geometry-g7, with a note that S199 authored them and S203G moved them.
 *
 * Everything is asserted against the live tree before anything is written, so an interrupted run
 * cannot leave a half-merged corpus.
 *
 * Usage:  node scripts/session/merge-surface-area-into-geometry-g7.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dry = process.argv.includes("--dry-run");
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error(`MERGE: ${msg}`); };
process.on("uncaughtException", (e) => {
  console.error(`\n✗ ${e?.message ?? e}\n  nothing was written.`);
  process.exit(1);
});

const STUB = "surface-area-solids-g7";
const DEST = "geometry-g7";
const CHAPTER_MAP = {
  "ch1-wrapping-solids": { id: "ch3c-wrapping-solids", title: "Wrapping Solids" },
  "ch2-filling-and-combining": { id: "ch3d-filling-and-combining", title: "Filling & Combining" }
};

/* ------------------------------------------------------------------ preflight */
const stubDir = join(root, "content/courses", STUB);
const destDir = join(root, "content/courses", DEST);
must(existsSync(stubDir), `${STUB} must exist`);
const stub = JSON.parse(readFileSync(join(stubDir, "course.json"), "utf8"));
const dest = JSON.parse(readFileSync(join(destDir, "course.json"), "utf8"));
must(stub.gradeLevel === dest.gradeLevel, "both courses must be the same grade");
must(stub.chapters.length === 2, `${STUB} should have exactly 2 chapters`);

const moving = [];
for (const ch of stub.chapters) {
  must(CHAPTER_MAP[ch.id], `unmapped chapter ${ch.id}`);
  must(!dest.chapters.some((d) => d.id === CHAPTER_MAP[ch.id].id), `${CHAPTER_MAP[ch.id].id} must not pre-exist in ${DEST}`);
  for (const lid of ch.lessonIds) {
    const p = join(stubDir, "lessons", `${lid}.json`);
    must(existsSync(p), `${lid}: lesson file missing`);
    must(!existsSync(join(destDir, "lessons", `${lid}.json`)), `${lid}: would collide in ${DEST}`);
    const L = JSON.parse(readFileSync(p, "utf8"));
    must(L.courseId === STUB && L.chapterId === ch.id, `${lid}: identity does not match its chapter`);
    moving.push({ lid, from: ch.id, to: CHAPTER_MAP[ch.id], lesson: L });
  }
}
must(moving.length === 6, `expected 6 lessons, found ${moving.length}`);
must(readdirSync(join(stubDir, "lessons")).filter((f) => f.endsWith(".json")).length === 6,
  `${STUB}/lessons holds files beyond the 6 declared lessons`);

const anchorIdx = dest.chapters.findIndex((c) => c.id === "ch3b-drawing-triangles-from-conditions");
must(anchorIdx >= 0, "geometry-g7 must contain ch3b-drawing-triangles-from-conditions");
must(dest.chapters[anchorIdx + 1]?.id === "ch4-triangles-cross-sections",
  "the insertion seam (ch3b followed by ch4) is not where it was surveyed");

/* seam teasers: the lesson before the moved chapters, and the last moved lesson */
const seamBeforePath = join(destDir, "lessons", "g7-03b-03.json");
const seamBefore = JSON.parse(readFileSync(seamBeforePath, "utf8"));
const seamBeforeRecap = seamBefore.steps.find((s) => s.kind === "recap");
must(seamBeforeRecap.teaser === "Next chapter: which sets of three lengths make a triangle, and what a solid looks like when it is sliced.",
  "g7-03b-03 teaser is not the surveyed pre-edit value");
const lastMoved = moving[moving.length - 1];
must(lastMoved.lid === "sa7-02-03", "the last moved lesson should be sa7-02-03");
const lastRecap = lastMoved.lesson.steps.find((s) => s.kind === "recap");
must(lastRecap.teaser === "Next in geometry: scale drawings and the transformations that move these solids around.",
  "sa7-02-03 teaser is not the surveyed pre-edit value");

/* content.server.ts — the two stub edges, and their already-present replacements */
const csPath = join(root, "src/lib/content.server.ts");
let cs = readFileSync(csPath, "utf8");
const stubEdges = [
  `  { from: "area-surface-volume", to: "${STUB}" },\n`,
  `  { from: "${STUB}", to: "transformations-measurement" },\n`
];
for (const e of stubEdges) must(cs.includes(e), `PATH_EDGES: expected line not found: ${e.trim()}`);
must(cs.includes(`{ from: "area-surface-volume", to: "${DEST}" }`), "replacement edge into geometry-g7 must already exist");
must(cs.includes(`{ from: "${DEST}", to: "transformations-measurement" }`), "replacement edge out of geometry-g7 must already exist");

/* s151c AUTHORIZED keys to re-path */
const s151cPath = join(root, "scripts/session/content-change-proof-s151c.mjs");
let s151c = readFileSync(s151cPath, "utf8");
for (const m of moving) {
  must(s151c.includes(`'content/courses/${STUB}/lessons/${m.lid}.json'`), `${m.lid}: not authorized in s151c`);
}

if (dry) {
  console.log(`preflight OK — ${asserts} assertions; would move ${moving.length} lessons into ${DEST} and delete ${STUB}`);
  console.log("--dry-run: nothing written.");
  process.exit(0);
}

/* ------------------------------------------------------------------ write */
for (const m of moving) {
  m.lesson.courseId = DEST;
  m.lesson.chapterId = m.to.id;
  if (m.lid === "sa7-02-03") {
    m.lesson.steps.find((s) => s.kind === "recap").teaser =
      "Next chapter: which sets of three lengths make a triangle, and what a solid looks like when it is sliced.";
  }
  writeFileSync(join(destDir, "lessons", `${m.lid}.json`), JSON.stringify(m.lesson, null, 2) + "\n");
}
seamBeforeRecap.teaser = "Next chapter: wrapping a solid in its own surface, then filling it.";
writeFileSync(seamBeforePath, JSON.stringify(seamBefore, null, 2) + "\n");

const newChapters = stub.chapters.map((ch) => ({
  id: CHAPTER_MAP[ch.id].id,
  title: CHAPTER_MAP[ch.id].title,
  lessonIds: [...ch.lessonIds]
}));
dest.chapters.splice(anchorIdx + 1, 0, ...newChapters);
writeFileSync(join(destDir, "course.json"), JSON.stringify(dest, null, 2) + "\n");

rmSync(stubDir, { recursive: true, force: true });

for (const e of stubEdges) cs = cs.replace(e, "");
writeFileSync(csPath, cs);

for (const m of moving) {
  s151c = s151c.replace(
    `'content/courses/${STUB}/lessons/${m.lid}.json'`,
    `'content/courses/${DEST}/lessons/${m.lid}.json'`
  );
}
writeFileSync(s151cPath, s151c);

/* course-count pins */
const worldTestPath = join(root, "src/world/world.test.ts");
let wt = readFileSync(worldTestPath, "utf8");
const before129 = (wt.match(/129/g) ?? []).length;
must(before129 >= 2, "expected at least two 129 course-count pins in world.test.ts");
wt = wt.replace(/toHaveLength\(129\)/g, "toHaveLength(128)");
writeFileSync(worldTestPath, wt);

console.log(`merged ${moving.length} lessons into ${DEST}; ${asserts} assertions passed`);
console.log(`  chapters added: ${newChapters.map((c) => c.id).join(", ")}`);
console.log(`  ${STUB} deleted; 2 PATH_EDGES removed; s151c re-pathed; world.test.ts 129 -> 128`);
console.log(`\nNEXT: update src/lib/session199.expansion.test.ts (it pins the old structure), then`);
console.log(`  npm run gen:manifest && node scripts/gen-world-manifest.mjs && npm run gen:inventory`);
