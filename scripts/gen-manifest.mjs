// Generates content/curriculum-manifest.json as the SINGLE SOURCE OF TRUTH for
// curriculum shape (courses, chapters, lessonIds, counts, figure coverage), derived
// entirely from disk. Also regenerates a machine-managed registry block in
// content/PLAN.md between the REGISTRY:AUTO markers so the registration gate can never
// drift from disk again: after authoring lessons, run `npm run gen:manifest`.
//
// Replaces hand-maintained lesson counts/checklists (the source of the 256-drift finding).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { authoredCorpusFingerprint } from "./session/authored-corpus-fingerprint.mjs";

const ROOT = "content/courses";
const PLAN = "content/PLAN.md";
const MANIFEST = "content/curriculum-manifest.json";

const courses = [];
const coursesRaw = {}; // courseId → lessonsById (for the notebook feed below)
let totalLessons = 0, totalSteps = 0, conceptSteps = 0, figuredConceptSteps = 0;

for (const dir of readdirSync(ROOT).sort()) {
  let course;
  try { course = JSON.parse(readFileSync(join(ROOT, dir, "course.json"), "utf8")); }
  catch { continue; }
  const lessonFiles = readdirSync(join(ROOT, dir, "lessons")).filter((f) => f.endsWith(".json"));
  const lessonsById = {};
  for (const f of lessonFiles) {
    const l = JSON.parse(readFileSync(join(ROOT, dir, "lessons", f), "utf8"));
    lessonsById[l.id] = l;
    // Notebook feed: the recap's authored takeaways + the lesson's conceptTags
    // (deduped, step order). Derived here so the notebook can NEVER drift from
    // the content — same single-source rule as the registry block below.
    l.__takeaways = (l.steps ?? []).find((s) => s.kind === "recap")?.takeaways ?? [];
    l.__tags = [...new Set((l.steps ?? []).map((s) => s.conceptTag).filter(Boolean))];
    totalSteps += (l.steps ?? []).length;
    for (const s of l.steps ?? []) {
      if (s.kind === "concept") { conceptSteps++; if (s.figure) figuredConceptSteps++; }
    }
  }
  // Preserve chapter order from course.json; that is the authored sequence.
  const chapters = course.chapters.map((ch, i) => ({
    index: i + 1,
    id: ch.id ?? null,
    title: ch.title ?? null,
    lessonIds: ch.lessonIds,
  }));
  const orderedIds = chapters.flatMap((ch) => ch.lessonIds);
  const lessons = orderedIds
    .filter((id) => lessonsById[id])
    .map((id) => ({
      id,
      slug: lessonsById[id].slug ?? null,
      title: lessonsById[id].title ?? id,
      minutes: lessonsById[id].minutes ?? null,
    }));
  totalLessons += lessons.length;
  coursesRaw[course.id] = lessonsById;
  courses.push({
    id: course.id,
    slug: course.slug,
    title: course.title,
    gradeLevel: course.gradeLevel,
    category: course.category ?? null,
    chapterCount: chapters.length,
    lessonCount: lessons.length,
    chapters,
    lessons,
  });
}

courses.sort((a, b) => (a.gradeLevel - b.gradeLevel) || a.slug.localeCompare(b.slug));

const gradeBands = {};
for (const c of courses) gradeBands[c.gradeLevel] = (gradeBands[c.gradeLevel] ?? 0) + 1;

// S219 closure: product identity must move when ANY authored curriculum byte moves. The old
// id:title-only hash let step/body/widget edits keep the same contentVersion, which is exactly how
// a 15,611-step manifest survived beside a 15,621-step corpus. Hash the precise course+lesson
// bytes used by this generator and expose that full hash to every downstream state artifact.
const corpus = authoredCorpusFingerprint(process.cwd());
const contentVersion = corpus.sha256.slice(0, 12);

// conceptTag → lowest grade where the tag appears: the anchor for placement
// estimates and standards-style rollups (tags are the app's standards proxy).
const tagGrades = {};
for (const c of courses) {
  const byId = coursesRaw[c.id] ?? {};
  for (const l of Object.values(byId)) {
    for (const t of l.__tags ?? []) {
      tagGrades[t] = tagGrades[t] === undefined ? c.gradeLevel : Math.min(tagGrades[t], c.gradeLevel);
    }
  }
}

const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  contentVersion,
  corpusSha256: corpus.sha256,
  corpusFiles: corpus.files,
  totals: {
    courses: courses.length,
    lessons: totalLessons,
    steps: totalSteps,
    conceptSteps,
    figuredConceptSteps,
    figureCoveragePct: conceptSteps ? Math.round((figuredConceptSteps / conceptSteps) * 10000) / 100 : 0,
  },
  gradeBands,
  courses,
  tagGrades,
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

// --- Notebook index: a static, client-fetchable concept-card feed ---
// One entry per lesson WITH takeaways, in curriculum order. Served from
// /notebook-index.json so the notebook page ships no catalog in its bundle and
// works offline exactly as far as the app itself does. Minified: this file is
// fetched by learners, not read by humans.
const NOTEBOOK = "public/notebook-index.json";
const notebook = {
  contentVersion,
  corpusSha256: corpus.sha256,
  courses: courses
    .map((c) => ({
      title: c.title,
      lessons: c.lessons
        .map((l) => {
          const full = coursesRaw[c.id]?.[l.id];
          return full && full.__takeaways.length > 0
            ? { id: l.id, title: l.title, takeaways: full.__takeaways, tags: full.__tags }
            : null;
        })
        .filter(Boolean),
    }))
    .filter((c) => c.lessons.length > 0),
};
writeFileSync(NOTEBOOK, JSON.stringify(notebook) + "\n");
console.log(`notebook-index: ${notebook.courses.reduce((a, c) => a + c.lessons.length, 0)} cards across ${notebook.courses.length} courses`);

// --- Regenerate the machine-managed registry block in PLAN.md ---
const gradeLabel = (g) => (g === 0 ? "Kindergarten" : `Grade ${g}`);
const lines = [];
lines.push("<!-- REGISTRY:AUTO-BEGIN — generated by scripts/gen-manifest.mjs; do not hand-edit. Run `npm run gen:manifest` after authoring. -->");
lines.push("");
lines.push("# REGISTRY — AUTO-GENERATED FROM DISK (source of truth: `curriculum-manifest.json`)");
lines.push("");
lines.push(`> ${manifest.totals.courses} courses · ${manifest.totals.lessons} lessons · ${manifest.totals.figureCoveragePct}% concept-figure coverage · contentVersion \`${contentVersion}\` · corpus \`${corpus.sha256.slice(0, 16)}…\` · generated ${manifest.generatedAt}`);
lines.push("> This block is the registration source of truth. Prose sections above are planning history.");
lines.push("");
for (const c of courses) {
  lines.push(`## ${c.title} (\`${c.slug}\`, ${gradeLabel(c.gradeLevel)}) — ${c.lessonCount} lessons`);
  for (const l of c.lessons) lines.push(`- ✅ ${l.id} ${l.title}`);
  lines.push("");
}
lines.push("<!-- REGISTRY:AUTO-END -->");
const autoBlock = lines.join("\n");

let plan = readFileSync(PLAN, "utf8");
const begin = "<!-- REGISTRY:AUTO-BEGIN";
const endMarker = "<!-- REGISTRY:AUTO-END -->";
const bi = plan.indexOf(begin);
if (bi !== -1) {
  const ei = plan.indexOf(endMarker, bi);
  plan = plan.slice(0, bi) + autoBlock + plan.slice(ei + endMarker.length);
} else {
  plan = plan.replace(/\s*$/, "") + "\n\n" + autoBlock + "\n";
}
writeFileSync(PLAN, plan);

// Self-verify: manifest lesson set must equal disk lesson set exactly.
const diskIds = new Set();
for (const dir of readdirSync(ROOT)) {
  try {
    for (const f of readdirSync(join(ROOT, dir, "lessons"))) if (f.endsWith(".json")) diskIds.add(f.replace(/\.json$/, ""));
  } catch { /* not a course dir */ }
}
const manifestIds = new Set(courses.flatMap((c) => c.lessons.map((l) => l.id)));
const missing = [...diskIds].filter((id) => !manifestIds.has(id));
const extra = [...manifestIds].filter((id) => !diskIds.has(id));
if (missing.length || extra.length) {
  console.error(`gen-manifest SELF-CHECK FAILED: missing ${missing.length}, extra ${extra.length}`);
  process.exit(1);
}
console.log(`manifest: ${manifest.totals.courses} courses, ${manifest.totals.lessons} lessons, ${manifest.totals.figureCoveragePct}% figures, version ${contentVersion}`);
console.log(`PLAN.md registry block regenerated (${manifestIds.size} lessons); manifest ↔ disk verified.`);
