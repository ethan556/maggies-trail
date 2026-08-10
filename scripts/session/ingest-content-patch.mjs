#!/usr/bin/env node
/**
 * ingest-content-patch — add authored lessons to the corpus as DATA, not as hand edits.
 *
 * Generalized from `ingest-g6-12-gap-patch.mjs`, which carried 48 lessons through every gate in
 * S199. That script worked; it was just welded to one patch file. This one takes the patch as an
 * argument and does the two things the hand-rolled version left to human memory:
 *
 *   1. PREFLIGHT EVERYTHING BEFORE WRITING ANYTHING. Structural claims (seams, collisions,
 *      identity), the pedagogy contract, registered figure ids, and known standard codes are all
 *      checked against the live tree first. A patch either lands whole or does not touch disk.
 *      Half-ingested content is worse than none: it leaves the corpus in a state no ledger
 *      describes.
 *
 *   2. UPDATE THE AUTHORIZATION SETS AUTOMATICALLY. HANDOVER §8 calls this the "seven-place
 *      trap", and it is the single most expensive mistake available in this repo: ANY lesson-JSON
 *      byte change must be authorized in `content-change-proof-s151c.mjs` (whose pass condition
 *      hardcodes both the changed count and the corpus total), AND in
 *      `quotient-reasoning-s146.py`, AND in `affine-relationship-s147.py` — the latter two because
 *      they run whole-corpus symmetric changed-set checks, not checks of their own targets. Miss
 *      one and nothing fails until `gen:reports` roughly eight minutes in. A script does not
 *      forget.
 *
 * The FIGURE preflight deserves its own note: `verify-visual-explanations` runs at FLOOR_PCT 100,
 * so a concept step naming a figure id that is not in `figureIds.ts` is a same-session build
 * break, not a later cleanup. Draw the figure and regenerate the id set BEFORE ingesting.
 *
 * Usage:
 *   node scripts/session/ingest-content-patch.mjs <patch.json> --tag S203B [--dry-run]
 *
 * Patch shape (every key optional except one of courses/chapterInsertions):
 *   {
 *     "label": "S203B statistics batch",
 *     "totalLessons": 5,
 *     "courses":           [{ slug, grade, course: <course.json>, lessons: [<lesson.json>...] }],
 *     "chapterInsertions": [{ courseSlug, chapter: {id,title,lessonIds}, lessons: [...],
 *                             position: {after|before|append: <chapterId>},
 *                             seamEdit: { lessonId, field: "recap.teaser", expect, newValue } }],
 *     "pathEdges":         [{ from, to, comment }]
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const argv = process.argv.slice(2);
const patchPath = argv.find((a) => !a.startsWith("--"));
const tagIndex = argv.indexOf("--tag");
const TAG = tagIndex >= 0 ? argv[tagIndex + 1] : null;
const DRY = argv.includes("--dry-run");

if (!patchPath || !TAG) {
  console.error("usage: ingest-content-patch.mjs <patch.json> --tag <SESSIONTAG> [--dry-run]");
  process.exit(2);
}
if (!/^S\d{3}[A-Z]?$/.test(TAG)) {
  console.error(`--tag must look like S203 or S203B (got "${TAG}")`);
  process.exit(2);
}

const patch = JSON.parse(readFileSync(patchPath, "utf8"));
const courses = patch.courses ?? [];
const insertions = patch.chapterInsertions ?? [];
const pathEdges = patch.pathEdges ?? [];

let asserts = 0;
const must = (ok, msg) => {
  asserts++;
  if (!ok) throw new Error(`PREFLIGHT: ${msg}`);
};

/* A refusal is an expected outcome here, not a crash: the operator needs to read WHICH assertion
 * stopped the patch, not a stack through the ESM loader. Exit 1 either way so a chain still halts. */
process.on("uncaughtException", (err) => {
  console.error(`\n✗ ${err?.message ?? String(err)}`);
  console.error("  nothing was written — fix the patch and re-run.");
  process.exit(1);
});

/* ------------------------------------------------------------- live-tree facts */
const coursesDir = join(root, "content/courses");
const existingLessonIds = new Set();
let corpusTotal = 0;
for (const dir of readdirSync(coursesDir)) {
  const lessonsDir = join(coursesDir, dir, "lessons");
  if (!existsSync(lessonsDir)) continue;
  for (const f of readdirSync(lessonsDir)) {
    if (!f.endsWith(".json")) continue;
    existingLessonIds.add(f.slice(0, -5));
    corpusTotal++;
  }
}

const figureIds = (() => {
  const src = readFileSync(join(root, "src/components/figureIds.ts"), "utf8");
  const open = src.indexOf("new Set([");
  const close = src.indexOf("])", open);
  must(open !== -1 && close !== -1, "figureIds.ts: cannot locate the FIGURE_IDS set");
  return new Set([...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]));
})();

const knownStandards = (() => {
  const p = join(root, "content/standards/ccss-6-8.json");
  if (!existsSync(p)) return null;
  return new Set(JSON.parse(readFileSync(p, "utf8")).standards.map((s) => s.code));
})();

/* --------------------------------------------------- the authoring contract */
/** Mirrors the rules in src/lib/pedagogy.ts that a patch can violate. Checked BEFORE writing so a
 *  bad lesson never reaches disk — `lint:pedagogy` is the authority, this is the early warning. */
function checkLesson(L, where) {
  const id = `${where}/${L.id}`;
  must(!existingLessonIds.has(L.id), `${id}: lesson id already exists in the corpus`);
  must(L.steps.length >= 8 && L.steps.length <= 15, `${id}: ${L.steps.length} steps (must be 8-15)`);

  let predicts = 0;
  let action = 0;
  for (const s of L.steps) {
    must(typeof s.body === "string" && s.body.length > 0, `${id}/${s.id}: body`);
    if (s.kind === "concept") {
      must(typeof s.figure === "string" && s.figure.length > 0, `${id}/${s.id}: concept step needs a figure (verify-visual-explanations runs at 100%)`);
      // pedagogy.ts caps concept prose per reading profile (standard 80 words, early 25). Cheap to
      // check here; otherwise it surfaces only after the lesson is already on disk. (S203B: two
      // lessons landed at 84 and 81 words and had to be trimmed post-ingest.)
      const conceptWordMax = L.readingProfile === "early" ? 25 : 80;
      const words = s.body.trim() === "" ? 0 : s.body.trim().split(/\s+/).length;
      must(words <= conceptWordMax, `${id}/${s.id}: concept body is ${words} words (max ${conceptWordMax} for readingProfile ${L.readingProfile ?? "standard"})`);
      must(figureIds.has(s.figure), `${id}/${s.id}: figure "${s.figure}" is not registered in figureIds.ts — author it in figures.tsx and run gen-figure-ids.mjs first`);
    }
    if (s.kind !== "concept" && s.kind !== "recap") action++;
    if (s.predict) {
      predicts++;
      must(s.kind === "interactive", `${id}/${s.id}: predict is only allowed on interactive steps`);
      must(s.widget, `${id}/${s.id}: predict requires a widget to manipulate`);
      must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id}: predict outcomeId is not among its options`);
    }
    if (s.kind === "check" || s.kind === "challenge") {
      must(typeof s.conceptTag === "string" && s.conceptTag.length > 0, `${id}/${s.id}: conceptTag`);
      must((s.explanationVariants ?? []).length >= 2, `${id}/${s.id}: needs 2 explanationVariants`);
      const [a, b] = s.explanationVariants ?? [];
      must(a !== b, `${id}/${s.id}: explanationVariants must be genuinely different`);
    }
    if (s.kind === "challenge") must((s.hints ?? []).length === 3, `${id}/${s.id}: exactly 3 graduated hints`);

    const w = s.widget;
    if (w?.type === "numeric" && (s.kind === "check" || s.kind === "challenge")) {
      must((w.commonErrors ?? []).length >= 2, `${id}/${s.id}: numeric needs >=2 commonErrors`);
      must(typeof w.fallbackFeedback === "string" && w.fallbackFeedback.length > 0, `${id}/${s.id}: fallbackFeedback`);
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id}: a commonError equals the correct answer`);
    }
    if (w?.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id}: exactly one correct option`);
      for (const o of w.options) must(typeof o.feedback === "string" && o.feedback.length > 0, `${id}/${s.id}: every mcq option needs feedback`);
    }
  }
  must(predicts <= 1, `${id}: at most one prediction per lesson`);
  must(action / L.steps.length >= 0.6, `${id}: only ${Math.round((100 * action) / L.steps.length)}% of steps require action (min 60%)`);

  const last = L.steps[L.steps.length - 1];
  must(last.kind === "recap", `${id}: last step must be a recap`);
  must((last.takeaways ?? []).length >= 1 && (last.takeaways ?? []).length <= 3, `${id}: recap needs 1-3 takeaways`);
  must(typeof last.teaser === "string" && last.teaser.length > 0, `${id}: recap needs a next-lesson teaser`);

  if (Array.isArray(L.standards)) {
    must(L.standards.length > 0, `${id}: standards, if present, must not be empty`);
    if (knownStandards) {
      for (const code of L.standards) {
        if (/^[678]\./.test(code)) must(knownStandards.has(code), `${id}: unknown standard "${code}"`);
      }
    }
  }
}

/* ------------------------------------------------------------------ preflight */
const plannedLessonPaths = [];
/** Subset of the above that edits a PRE-EXISTING lesson (seam edits). Drives s148/s150. */
const seamEditedPaths = new Set();
const seenIds = new Set();

for (const c of courses) {
  const dir = join(coursesDir, c.slug);
  must(!existsSync(dir), `course dir ${c.slug} must not pre-exist`);
  const cj = c.course;
  must(cj.id === c.slug && cj.slug === c.slug, `${c.slug}: course.json identity`);
  if (c.grade !== undefined) must(cj.gradeLevel === c.grade, `${c.slug}: gradeLevel matches declared grade`);
  const declared = cj.chapters.flatMap((ch) => ch.lessonIds);
  must(declared.length === c.lessons.length, `${c.slug}: chapter lessonIds count != lessons supplied`);
  must(JSON.stringify(declared) === JSON.stringify(c.lessons.map((l) => l.id)), `${c.slug}: chapter order must match lesson order`);
  for (const L of c.lessons) {
    must(L.courseId === c.slug, `${L.id}: courseId`);
    must(cj.chapters.some((ch) => ch.id === L.chapterId), `${L.id}: chapterId not declared by course.json`);
    must(!seenIds.has(L.id), `${L.id}: duplicated inside the patch`);
    seenIds.add(L.id);
    checkLesson(L, c.slug);
    plannedLessonPaths.push(`content/courses/${c.slug}/lessons/${L.id}.json`);
  }
}

for (const ci of insertions) {
  const dir = join(coursesDir, ci.courseSlug);
  must(existsSync(join(dir, "course.json")), `${ci.courseSlug}: course must already exist`);
  const cj = JSON.parse(readFileSync(join(dir, "course.json"), "utf8"));
  must(!cj.chapters.some((ch) => ch.id === ci.chapter.id), `${ci.courseSlug}: chapter ${ci.chapter.id} must not pre-exist`);
  must(JSON.stringify(ci.chapter.lessonIds) === JSON.stringify(ci.lessons.map((l) => l.id)), `${ci.courseSlug}: chapter lessonIds must match lessons`);

  const pos = ci.position ?? { append: true };
  if (pos.after) must(cj.chapters.some((ch) => ch.id === pos.after), `${ci.courseSlug}: anchor chapter ${pos.after} not found`);
  if (pos.before) must(cj.chapters.some((ch) => ch.id === pos.before), `${ci.courseSlug}: anchor chapter ${pos.before} not found`);

  for (const L of ci.lessons) {
    must(L.courseId === ci.courseSlug && L.chapterId === ci.chapter.id, `${L.id}: identity`);
    must(!seenIds.has(L.id), `${L.id}: duplicated inside the patch`);
    seenIds.add(L.id);
    checkLesson(L, ci.courseSlug);
    plannedLessonPaths.push(`content/courses/${ci.courseSlug}/lessons/${L.id}.json`);
  }
  if (ci.seamEdit) {
    must(ci.seamEdit.field === "recap.teaser", "seam edits are limited to recap.teaser");
    const lp = join(dir, "lessons", `${ci.seamEdit.lessonId}.json`);
    must(existsSync(lp), `seam target ${ci.seamEdit.lessonId} must exist`);
    const recap = JSON.parse(readFileSync(lp, "utf8")).steps.find((s) => s.kind === "recap");
    must(recap?.teaser === ci.seamEdit.expect, `${ci.seamEdit.lessonId}: current teaser does not match the expected pre-edit value`);
    const seamRel = `content/courses/${ci.courseSlug}/lessons/${ci.seamEdit.lessonId}.json`;
    plannedLessonPaths.push(seamRel);
    /* Seam edits are the ONLY paths in a patch that touch a lesson which already existed, which is
     * exactly what the frozen-ledger audits (s148, s150) check. Keep them separable. */
    seamEditedPaths.add(seamRel);
  }
}

const contentServerPath = join(root, "src/lib/content.server.ts");
let contentServer = readFileSync(contentServerPath, "utf8");
const EDGE_ANCHOR = `  { from: "solving-equations", to: "linear-functions" },`;
if (pathEdges.length) {
  must(contentServer.split(EDGE_ANCHOR).length === 2, "PATH_EDGES anchor line is not unique");
  for (const e of pathEdges) {
    must(!contentServer.includes(`from: "${e.from}", to: "${e.to}"`), `edge ${e.from}->${e.to} already exists`);
  }
}

if (patch.totalLessons !== undefined) {
  must(patch.totalLessons === seenIds.size, `patch declares ${patch.totalLessons} lessons but supplies ${seenIds.size}`);
}
must(seenIds.size > 0, "patch supplies no lessons");

console.log(`preflight OK — ${asserts} assertions, ${seenIds.size} new lessons, ${insertions.length} chapter insertions, ${courses.length} new courses`);
if (DRY) {
  console.log("--dry-run: nothing written.");
  process.exit(0);
}

/* ---------------------------------------------------------------- write phase */
const written = [];
/** slug -> [new lesson ids], in patch order; consumed by the PLAN.md registration step. */
const newLessonsByCourse = new Map();
const noteLesson = (slug, id) => {
  if (!newLessonsByCourse.has(slug)) newLessonsByCourse.set(slug, []);
  newLessonsByCourse.get(slug).push(id);
};
for (const c of courses) {
  const dir = join(coursesDir, c.slug);
  mkdirSync(join(dir, "lessons"), { recursive: true });
  writeFileSync(join(dir, "course.json"), JSON.stringify(c.course, null, 2) + "\n");
  for (const L of c.lessons) {
    writeFileSync(join(dir, "lessons", `${L.id}.json`), JSON.stringify(L, null, 2) + "\n");
    written.push(L.id);
    noteLesson(c.slug, L.id);
  }
}

for (const ci of insertions) {
  const dir = join(coursesDir, ci.courseSlug);
  const cjPath = join(dir, "course.json");
  const cj = JSON.parse(readFileSync(cjPath, "utf8"));
  const pos = ci.position ?? { append: true };
  if (pos.after) cj.chapters.splice(cj.chapters.findIndex((ch) => ch.id === pos.after) + 1, 0, ci.chapter);
  else if (pos.before) cj.chapters.splice(cj.chapters.findIndex((ch) => ch.id === pos.before), 0, ci.chapter);
  else cj.chapters.push(ci.chapter);
  writeFileSync(cjPath, JSON.stringify(cj, null, 2) + "\n");

  for (const L of ci.lessons) {
    writeFileSync(join(dir, "lessons", `${L.id}.json`), JSON.stringify(L, null, 2) + "\n");
    written.push(L.id);
    noteLesson(ci.courseSlug, L.id);
  }
  if (ci.seamEdit) {
    const lp = join(dir, "lessons", `${ci.seamEdit.lessonId}.json`);
    const lesson = JSON.parse(readFileSync(lp, "utf8"));
    lesson.steps.find((s) => s.kind === "recap").teaser = ci.seamEdit.newValue;
    writeFileSync(lp, JSON.stringify(lesson, null, 2) + "\n");
    written.push(`SEAM ${ci.seamEdit.lessonId}`);
  }
}

if (pathEdges.length) {
  const block = pathEdges.map((e) => `  { from: "${e.from}", to: "${e.to}" },`).join("\n");
  contentServer = contentServer.replace(EDGE_ANCHOR, `${EDGE_ANCHOR}\n  // ${TAG} — ${patch.label ?? "content patch"} wiring\n${block}`);
  writeFileSync(contentServerPath, contentServer);
}

/* ------------------------------------------ the seven-place trap, disarmed */
const changedPaths = [...new Set(plannedLessonPaths)].sort();

// 1) content-change-proof-s151c.mjs — object entries plus BOTH hardcoded counts.
{
  const p = join(root, "scripts/session/content-change-proof-s151c.mjs");
  let src = readFileSync(p, "utf8");
  const entries = changedPaths.map((rel) => ` '${rel}':'${TAG.toLowerCase()}-content-patch',`).join("\n");
  const closeIdx = src.indexOf("\n};\nconst lessonPaths=[]");
  must(closeIdx !== -1, "s151c: cannot locate the end of the AUTHORIZED object");
  src = src.slice(0, closeIdx) + `\n // ${TAG}: ${patch.label ?? "content patch"} — all NEW files unless marked SEAM.\n${entries}` + src.slice(closeIdx);

  const passedRe = /const passed=changed\.length===(\d+)&&unexpected\.length===0&&missing\.length===0&&lessonPaths\.length===(\d+);/;
  const m = src.match(passedRe);
  must(Boolean(m), "s151c: cannot locate the pass condition");
  const newChanged = Number(m[1]) + changedPaths.length;
  const newTotal = Number(m[2]) + written.filter((w) => !w.startsWith("SEAM")).length;
  src = src.replace(passedRe, `const passed=changed.length===${newChanged}&&unexpected.length===0&&missing.length===0&&lessonPaths.length===${newTotal};`);
  writeFileSync(p, src);
  console.log(`s151c: +${changedPaths.length} authorized, changed ${m[1]}->${newChanged}, corpus ${m[2]}->${newTotal}`);
}

// 2+3) the whole-corpus python audits. There are FOUR, not two — S203B found this the expensive
//    way. s146/s147 run a symmetric changed-set check and need EVERY changed path; s148/s150 hash
//    every non-target lesson against a frozen ledger and only trip on PRE-EXISTING lessons whose
//    bytes moved, i.e. seam edits. A patch that adds only new files never wakes s148/s150; the
//    moment it carries one seamEdit, they fail ~13 minutes into gen:reports with
//    `non-target lesson drift`.
{
  const seamPaths = plannedLessonPaths.filter((p) => seamEditedPaths.has(p));
  const jobs = [
    // symmetric changed-set: every path this patch touches
    { rel: "scripts/audit/quotient-reasoning-s146.py", paths: changedPaths, marker: "if set(changed)!=expected_changed|allowed_later:", union: "allowed_later |= " },
    { rel: "scripts/audit/affine-relationship-s147.py", paths: changedPaths, marker: "if set(changed)!=expected_changed|allowed_later:", union: "allowed_later |= " },
    // frozen-ledger drift: only pre-existing lessons whose bytes changed
    { rel: "scripts/audit/exact-number-s148.py", paths: seamPaths, marker: "unchanged=0", union: "allowed_later |= " },
    { rel: "scripts/audit/point-set-reasoning-s150.py", paths: seamPaths, marker: "mismatches=[]", union: "authorized_later|=" }
  ];
  for (const job of jobs) {
    if (job.paths.length === 0) continue;
    const p = join(root, job.rel);
    let src = readFileSync(p, "utf8");
    must(src.includes(job.marker), `${job.rel}: cannot locate the anchor \`${job.marker}\``);
    must(!src.includes(`${TAG}_AUTHORIZED=`), `${job.rel}: ${TAG}_AUTHORIZED already present — pick a fresh tag`);
    const setLiteral = `{${job.paths.map((r) => `'${r}'`).join(",")}}`;
    src = src.replace(job.marker, `${TAG}_AUTHORIZED=${setLiteral}\n${job.union}${TAG}_AUTHORIZED\n${job.marker}`);
    writeFileSync(p, src);
    console.log(`${job.rel}: +${job.paths.length} authorized as ${TAG}_AUTHORIZED`);
  }
}

// 4) content/PLAN.md — check-registration.mjs fails any lesson on disk without a ✅ line here.
//    The three authorization sets above are not the whole trap: PLAN.md is a fourth place, and
//    unlike them it fails in the FAST gates rather than eight minutes into gen:reports.
{
  const p = join(root, "content/PLAN.md");
  const lines = readFileSync(p, "utf8").split("\n");

  /* Insert each new lesson directly after its predecessor in the course's post-ingest order, so
   * PLAN.md reads in the same order the learner walks. Fall back to the course's last listed
   * lesson when the predecessor has no line (a course whose PLAN entries are grouped elsewhere).
   *
   * S203V. A course with ZERO existing lessons — created fresh by THIS patch — has no anchor at
   * all: every id in `order` is brand new, so both backward and reversed-forward scans find
   * nothing, and the original code threw here. That is exactly what happened creating
   * data-and-models; the failure came AFTER lesson files, course.json, PATH_EDGES and two of the
   * four authorization sets were already written, leaving a half-registered corpus that had to be
   * completed by hand. A wholly-new course now gets a new section appended at the end of the file
   * instead of throwing — a plainer location than a hand-placed insertion would choose, but a
   * correct and complete one, which is what matters for a script running unattended. */
  for (const [slug, ids] of newLessonsByCourse) {
    const course = JSON.parse(readFileSync(join(coursesDir, slug, "course.json"), "utf8"));
    const order = course.chapters.flatMap((ch) => ch.lessonIds);
    const titleOf = new Map(
      ids.map((id) => [id, JSON.parse(readFileSync(join(coursesDir, slug, "lessons", `${id}.json`), "utf8")).title])
    );
    const anyExisting = order.some((id) => lines.some((l) => l.includes(id)));
    if (!anyExisting) {
      lines.push(
        "",
        `## ${course.title} (\`${slug}\`, Grade ${course.gradeLevel}) — ${order.length} lesson${order.length === 1 ? "" : "s"} — ${TAG}, NEW COURSE`,
        ...order.map((id) => `- ✅ ${id} ${titleOf.get(id)}`)
      );
      console.log(`content/PLAN.md: ${slug} has no existing anchor — appended as a new section (${order.length} lessons)`);
      continue;
    }
    for (const id of ids) {
      const at = order.indexOf(id);
      let anchorIdx = -1;
      for (let k = at - 1; k >= 0 && anchorIdx === -1; k--) {
        anchorIdx = lines.findIndex((l) => l.includes(order[k]));
      }
      if (anchorIdx === -1) {
        for (const other of [...order].reverse()) {
          anchorIdx = lines.findIndex((l) => l.includes(other));
          if (anchorIdx !== -1) break;
        }
      }
      must(anchorIdx !== -1, `PLAN.md: no existing line for any lesson of ${slug} to anchor ${id} against`);
      lines.splice(anchorIdx + 1, 0, `- ✅ ${id} ${titleOf.get(id)}`);
    }
  }
  writeFileSync(p, lines.join("\n"));
  console.log(`content/PLAN.md: +${[...newLessonsByCourse.values()].flat().length} registered`);
}

// 5) the ELEVEN hardcoded corpus-total pins in the audit suite.
//    S203B discovered these the expensive way: content-json-s143…s151 each pin
//    `records.length===N && ids.size===N`, and session150/151-failure-first re-pin the same count
//    from the emitted report. They fail SILENTLY — the error array is empty, so the process exits 1
//    having printed nothing — roughly nine minutes into gen:reports. Bump them here or lose an hour.
{
  const newLessons = written.filter((w) => !w.startsWith("SEAM")).length;
  if (newLessons > 0) {
    const args = [`${corpusTotal}`, `${corpusTotal + newLessons}`, "--tag", TAG];
    const r = spawnSync(process.execPath, [join(root, "scripts/session/bump-corpus-pins.mjs"), ...args], {
      encoding: "utf8"
    });
    process.stdout.write(r.stdout ?? "");
    must(r.status === 0, `bump-corpus-pins failed: ${r.stderr ?? ""}`);
  }
}

console.log(`\ningested ${written.length} writes (${written.filter((w) => !w.startsWith("SEAM")).length} lessons); ${asserts} assertions passed`);
console.log("corpus was", corpusTotal, "lessons; now", corpusTotal + written.filter((w) => !w.startsWith("SEAM")).length);
console.log(`
NEXT, in this order:
  npm run gen:manifest && node scripts/gen-world-manifest.mjs && node scripts/gen-figure-ids.mjs
  npm run validate:content && npm run lint:pedagogy && node scripts/verify-visual-explanations.mjs
  node scripts/check-registration.mjs && node scripts/verify-world.mjs
  node scripts/audit/standards-coverage-6-8.mjs        # lower MAX_UNCOVERED if it says so
  npm run gen:inventory && npm run gen:flagship && npm run gen:state
  <test-groups vitest> && next build && npm run gen:reports
  node scripts/session/hash-proof.mjs snapshot SESSION<n>_LESSON_HASHES.json
  ^ ONLY at session end. NEVER "npm run hash:snapshot" — that script is hardcoded to
    SESSION201_LESSON_HASHES.json and silently overwrites that sealed baseline.`);
