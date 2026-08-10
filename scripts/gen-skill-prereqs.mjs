// Derives a deterministic per-skill (conceptTag) prerequisite map from disk.
//
// Model (acyclic by construction):
//  • Global introduction: each tag's prereqs are derived exactly once, at the first (course, lesson)
//    where it appears, walking courses in topological order of PATH_EDGES (prereq course before
//    dependent). Later re-appearances of a tag add no edges — it is already "known".
//  • Within a course: the new tags a lesson introduces depend on the new tags of the previous
//    tag-introducing lesson in that course (the course's internal chain).
//  • Across courses: the first tags a course introduces depend on the terminal tags (the last
//    lesson's new tags) of each of its prerequisite courses (PATH_EDGES to === this course).
// Because every edge points to a tag introduced earlier in the global order, the graph is a DAG.
//
// Output: content/skill-prereqs.json  →  { tags, withPrereqs, prereqs: { [tag]: string[] } }

import fs from "node:fs";
import path from "node:path";

const ROOT = "content/courses";
const OUT = "content/skill-prereqs.json";

// --- PATH_EDGES (literal array in content.server.ts) ---
const serverSrc = fs.readFileSync("src/lib/content.server.ts", "utf8");
const edges = [...serverSrc.matchAll(/\{\s*from:\s*"([^"]+)",\s*to:\s*"([^"]+)"\s*\}/g)].map((m) => ({
  from: m[1],
  to: m[2]
}));
if (edges.length === 0) {
  console.error("gen:prereqs FAILED — no PATH_EDGES parsed from content.server.ts");
  process.exit(1);
}

// --- read courses + ordered lesson tags ---
const courses = {}; // slug -> { slug, grade, lessonOrder, tagsByLesson }
for (const dir of fs.readdirSync(ROOT)) {
  const cp = path.join(ROOT, dir, "course.json");
  if (!fs.existsSync(cp)) continue;
  const c = JSON.parse(fs.readFileSync(cp, "utf8"));
  const lessonOrder = (c.chapters ?? []).flatMap((ch) => ch.lessonIds ?? []);
  const tagsByLesson = {};
  for (const lid of lessonOrder) {
    const lp = path.join(ROOT, dir, "lessons", `${lid}.json`);
    if (!fs.existsSync(lp)) {
      tagsByLesson[lid] = [];
      continue;
    }
    const l = JSON.parse(fs.readFileSync(lp, "utf8"));
    const seen = new Set();
    const tags = [];
    for (const s of l.steps ?? []) if (s.conceptTag && !seen.has(s.conceptTag)) {
      seen.add(s.conceptTag);
      tags.push(s.conceptTag);
    }
    tagsByLesson[lid] = tags;
  }
  courses[c.slug] = { slug: c.slug, grade: c.gradeLevel ?? 99, lessonOrder, tagsByLesson };
}

const slugs = Object.keys(courses);
const byGradeSlug = (a, b) => courses[a].grade - courses[b].grade || (a < b ? -1 : a > b ? 1 : 0);

// --- topological order of courses (Kahn, deterministic tie-break by grade then slug) ---
const adj = {};
const indeg = {};
for (const s of slugs) {
  adj[s] = [];
  indeg[s] = 0;
}
for (const e of edges) if (courses[e.from] && courses[e.to]) adj[e.from].push(e.to);
for (const s of slugs) for (const t of adj[s]) indeg[t] += 1;

const order = [];
const placed = new Set();
let avail = slugs.filter((s) => indeg[s] === 0).sort(byGradeSlug);
while (avail.length) {
  const s = avail.shift();
  if (placed.has(s)) continue;
  order.push(s);
  placed.add(s);
  for (const t of adj[s]) {
    indeg[t] -= 1;
    if (indeg[t] === 0) avail.push(t);
  }
  avail = avail.filter((x) => !placed.has(x)).sort(byGradeSlug);
}
// any courses left in a PATH_EDGES cycle → append in grade/slug order (cycle-broken)
const leftover = slugs.filter((s) => !placed.has(s)).sort(byGradeSlug);
if (leftover.length) console.warn(`gen:prereqs — ${leftover.length} course(s) in a PATH_EDGES cycle, appended cycle-broken`);
order.push(...leftover);

// --- derive prereqs ---
const globalSeen = new Set();
const tagOrder = []; // tags in global curriculum introduction order (course topo → lesson order)
const prereqs = {}; // tag -> Set<tag>
const courseTerminal = {}; // slug -> terminal new tags

for (const slug of order) {
  const co = courses[slug];
  const preCourses = edges.filter((e) => e.to === slug && courses[e.from]).map((e) => e.from);
  const crossPrereqTags = preCourses.flatMap((pc) => courseTerminal[pc] ?? []);
  let prevLessonNew = null;
  let lastNew = [];
  for (const lid of co.lessonOrder) {
    const newTags = co.tagsByLesson[lid].filter((t) => !globalSeen.has(t));
    if (newTags.length === 0) continue;
    const deps = prevLessonNew ?? crossPrereqTags;
    for (const t of newTags) {
      const set = (prereqs[t] ??= new Set());
      for (const d of deps) if (d !== t) set.add(d);
      globalSeen.add(t);
      tagOrder.push(t);
    }
    prevLessonNew = newTags;
    lastNew = newTags;
  }
  courseTerminal[slug] = lastNew;
}

// --- self-checks ---
// (1) every prereq references a known/introduced tag
for (const [t, set] of Object.entries(prereqs)) {
  for (const d of set) if (!globalSeen.has(d)) {
    console.error(`gen:prereqs FAILED — ${t} depends on unknown tag ${d}`);
    process.exit(1);
  }
}
// (2) acyclicity (DFS) — belt-and-suspenders on top of construction
const flat = {};
for (const [t, set] of Object.entries(prereqs)) flat[t] = [...set];
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = {};
function dfs(n) {
  color[n] = GRAY;
  for (const m of flat[n] ?? []) {
    if (color[m] === GRAY) {
      console.error(`gen:prereqs FAILED — cycle through ${n} -> ${m}`);
      process.exit(1);
    }
    if (!color[m]) dfs(m);
  }
  color[n] = BLACK;
}
for (const n of Object.keys(flat)) if (!color[n]) dfs(n);

// --- serialize (only tags that actually have prereqs; absent === no prereqs) ---
const out = {};
for (const t of Object.keys(flat).sort()) if (flat[t].length) out[t] = flat[t].sort();

const payload = { tags: globalSeen.size, withPrereqs: Object.keys(out).length, order: tagOrder, prereqs: out };
fs.writeFileSync(OUT, JSON.stringify(payload, null, 0));
const bytes = fs.statSync(OUT).size;
console.log(
  `skill-prereqs.json — ${payload.tags} skills, ${payload.withPrereqs} with prereqs, ${tagOrder.length} in order, ${edges.length} course edges, ${(bytes / 1024).toFixed(1)} KB; acyclic verified.`
);
